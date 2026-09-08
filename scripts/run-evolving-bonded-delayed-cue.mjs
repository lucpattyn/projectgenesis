// Evolves edge weights while executing through real Genesis organisms and a real bond.
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160112, 160113, 160114, 160115, 160116, 160117, 160118, 160119];
const POPULATION = Number(process.env.GENESIS_BOND_CUE_POPULATION ?? 16);
const GENERATIONS = Number(process.env.GENESIS_BOND_CUE_GENERATIONS ?? 30);
const EPISODES = Number(process.env.GENESIS_BOND_CUE_EPISODES ?? 8);
const EVAL_EPISODES = Number(process.env.GENESIS_BOND_CUE_EVAL_EPISODES ?? 24);
const TRAIN_DELAY_MIN = 4;
const TRAIN_DELAY_MAX = 4;
const EVAL_DELAY_MIN = 8;
const EVAL_DELAY_MAX = 16;

function curriculumDelay(generation) {
  const phase = Math.min(2, Math.floor(generation / Math.max(1, GENERATIONS / 3)));
  const delay = [4, 8, 16][phase];
  return [delay, delay];
}

function brain(role, parameters) {
  const sender = role === "sender";
  const source = sender ? "p19-input" : "p31-neighbor-state";
  const inputWeight = sender ? parameters.senderInput : parameters.receiverInput;
  const outputWeight = sender ? parameters.senderOutput : parameters.receiverOutput;
  const memoryWeight = sender ? parameters.senderMemory : parameters.receiverMemory;
  return {
    nodes: [
      { id: source, kind: "sensor", prime: sender ? 19 : 31 },
      { id: "p13-persistence", kind: "persistent", prime: 13 },
      { id: "p19-output", kind: "effector", prime: 19 }
    ],
    edges: [
      { from: source, to: "p13-persistence", weight: inputWeight },
      { from: "p13-persistence", to: "p13-persistence", weight: memoryWeight },
      ...(sender ? [] : [{ from: "p13-persistence", to: "p19-output", weight: outputWeight }])
    ]
  };
}

function randomParameters(random) {
  return { senderInput: (random() - 0.5) * 2, senderOutput: (random() - 0.5) * 2, senderMemory: random() * 1.5, receiverInput: (random() - 0.5) * 2, receiverOutput: (random() - 0.5) * 2, receiverMemory: random() * 1.5 };
}

function mutate(parent, random) {
  const child = { ...parent };
  const keys = Object.keys(child);
  const key = keys[Math.floor(random() * keys.length)];
  if (random() < 0.25) child[key] = -child[key];
  else child[key] = Math.max(-2, Math.min(2, child[key] + (random() - 0.5) * 0.9));
  return child;
}

function crossover(first, second, random) {
  const child = {};
  for (const key of Object.keys(first)) child[key] = random() < 0.5 ? first[key] : second[key];
  return mutate(child, random);
}

function pair(seed, parameters) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  simulation.headlessObservationMode = true;
  simulation.organisms = simulation.organisms.slice(0, 2);
  const [sender, receiver] = simulation.organisms;
  sender.x = 10; sender.y = 10; sender.brain = brain("sender", parameters); sender.energy = 150;
  receiver.x = 11; receiver.y = 10; receiver.brain = brain("receiver", parameters); receiver.energy = 150;
  simulation.bonds.clear();
  simulation.bonds.set(simulation.bondKey(sender.id, receiver.id), { firstId: sender.id, secondId: receiver.id, strength: 1, reserve: 10, bondTrace: 0, componentCommitment: 1, topologyTrace: 0, topologyLastPulseTick: null, lastPulseTick: null, lastPulseEvent: null });
  return { simulation, sender, receiver };
}

function score(parameters, seed, communication = true, episodes = EPISODES, delayMin = TRAIN_DELAY_MIN, delayMax = TRAIN_DELAY_MAX, randomCue = false) {
  let state = seed >>> 0;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  const simulationPair = pair(seed, parameters);
  const { simulation, sender, receiver } = simulationPair;
  const cueOrder = randomCue
    ? [...Array(Math.floor(episodes / 2)).fill(0), ...Array(episodes - Math.floor(episodes / 2)).fill(1)]
    : null;
  if (cueOrder) for (let index = cueOrder.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [cueOrder[index], cueOrder[swap]] = [cueOrder[swap], cueOrder[index]];
  }
  let correct = 0;
  for (let episode = 0; episode < episodes; episode += 1) {
    simulation.world.signalField = Array.from({ length: simulation.world.height }, () => Array(simulation.world.width).fill(0));
    sender.energy = 150; receiver.energy = 150; sender.age = 0; receiver.age = 0; sender.brainExecution = null; receiver.brainExecution = null;
    const cue = cueOrder ? cueOrder[episode] : episode % 2;
    if (cue === 1) simulation.world.addSignal(sender.x, sender.y, 255, 255);
    const delay = delayMin + Math.floor(random() * (delayMax - delayMin + 1));
    for (let tick = 0; tick < delay + 3; tick += 1) {
      const states = simulation.getNeighborStatesByOrganism();
      const common = { world: simulation.world, occupiedKeys: new Set(), config: simulation.config.organism, ecologyConfig: simulation.config.ecology, signalConfig: simulation.config.signal, environmentMemoryConfig: simulation.config.environmentMemory, coupled: true, brainExecutor: simulation.brainExecutor };
      sender.act({ ...common, neighborStates: states.get(sender.id) ?? [] });
      receiver.act({ ...common, neighborStates: communication ? (states.get(receiver.id) ?? []) : [] });
      simulation.world.decaySignals(simulation.config.signal.decay);
    }
    const response = (receiver.brainExecution?.effectors.signal ?? 0) >= simulation.config.signal.activationThreshold ? 1 : 0;
    if (response === cue) correct += 1;
  }
  return correct / episodes;
}

function run(seed) {
  let state = seed >>> 0;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  let population = Array.from({ length: POPULATION }, () => randomParameters(random));
  for (let generation = 0; generation < GENERATIONS; generation += 1) {
    const [trainMin, trainMax] = curriculumDelay(generation);
    const ranked = population.map((parameters) => ({ parameters, score: score(parameters, seed + generation * 17, true, EPISODES, trainMin, trainMax) })).sort((a, b) => b.score - a.score);
    const survivors = ranked.slice(0, 5).map((entry) => entry.parameters);
    population = survivors.map((parent) => ({ ...parent }));
    while (population.length < POPULATION) {
      if (random() < 0.5) population.push(mutate(survivors[Math.floor(random() * survivors.length)], random));
      else population.push(crossover(survivors[Math.floor(random() * survivors.length)], survivors[Math.floor(random() * survivors.length)], random));
    }
  }
  const best = population.map((parameters) => ({ parameters, score: score(parameters, seed + 99991, true, EPISODES, 16, 16) })).sort((a, b) => b.score - a.score)[0];
  const ideal = { senderInput: 1, senderOutput: 1, senderMemory: 1, receiverInput: 1, receiverOutput: 1, receiverMemory: 1 };
  return {
    seed,
    finalTraining: best.score,
    unseenLongDelay: score(best.parameters, seed + 99991, true, EVAL_EPISODES, EVAL_DELAY_MIN, EVAL_DELAY_MAX, true),
    unseenCommunicationDisabled: score(best.parameters, seed + 99991, false, EVAL_EPISODES, EVAL_DELAY_MIN, EVAL_DELAY_MAX, true),
    idealUnseen: score(ideal, seed + 99991, true, EVAL_EPISODES, EVAL_DELAY_MIN, EVAL_DELAY_MAX, true),
    parameters: best.parameters
  };
}

console.log(JSON.stringify({ protocol: { task: "real bond sender cue → Prime-13 → Prime-31 → receiver response", seeds: SEEDS, population: POPULATION, generations: GENERATIONS, trainingEpisodes: EPISODES, trainingCurriculum: [4, 8, 16], evaluationEpisodes: EVAL_EPISODES, evaluationDelay: [EVAL_DELAY_MIN, EVAL_DELAY_MAX], evaluationCueOrder: "unseen randomized", mutation: "bounded edge weights with sign flips and crossover" }, runs: SEEDS.map(run) }, null, 2));
