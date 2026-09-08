// Evolves edge weights while executing through real Genesis organisms and a real bond.
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160103, 160104, 160105];
const POPULATION = Number(process.env.GENESIS_BOND_CUE_POPULATION ?? 12);
const GENERATIONS = Number(process.env.GENESIS_BOND_CUE_GENERATIONS ?? 20);
const EPISODES = Number(process.env.GENESIS_BOND_CUE_EPISODES ?? 8);
const DELAY = 4;

function brain(role, parameters) {
  const sender = role === "sender";
  const source = sender ? "p19-input" : "p31-neighbor-state";
  const inputWeight = sender ? parameters.senderInput : parameters.receiverInput;
  const outputWeight = sender ? parameters.senderOutput : parameters.receiverOutput;
  return {
    nodes: [
      { id: source, kind: "sensor", prime: sender ? 19 : 31 },
      { id: "p13-persistence", kind: "persistent", prime: 13 },
      { id: "p19-output", kind: "effector", prime: 19 }
    ],
    edges: [
      { from: source, to: "p13-persistence", weight: inputWeight },
      { from: "p13-persistence", to: "p19-output", weight: outputWeight }
    ]
  };
}

function randomParameters(random) {
  return { senderInput: (random() - 0.5) * 2, senderOutput: (random() - 0.5) * 2, receiverInput: (random() - 0.5) * 2, receiverOutput: (random() - 0.5) * 2 };
}

function mutate(parent, random) {
  const child = { ...parent };
  const key = Object.keys(child)[Math.floor(random() * 4)];
  child[key] = Math.max(-2, Math.min(2, child[key] + (random() - 0.5) * 0.9));
  return child;
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

function score(parameters, seed, communication = true) {
  const simulationPair = pair(seed, parameters);
  const { simulation, sender, receiver } = simulationPair;
  let correct = 0;
  for (let episode = 0; episode < EPISODES; episode += 1) {
    simulation.world.signalField = Array.from({ length: simulation.world.height }, () => Array(simulation.world.width).fill(0));
    sender.energy = 150; receiver.energy = 150; sender.age = 0; receiver.age = 0; sender.brainExecution = null; receiver.brainExecution = null;
    const cue = episode % 2;
    if (cue === 1) simulation.world.addSignal(sender.x, sender.y, 255, 255);
    for (let tick = 0; tick < DELAY + 3; tick += 1) {
      const states = simulation.getNeighborStatesByOrganism();
      const common = { world: simulation.world, occupiedKeys: new Set(), config: simulation.config.organism, ecologyConfig: simulation.config.ecology, signalConfig: simulation.config.signal, environmentMemoryConfig: simulation.config.environmentMemory, coupled: true, brainExecutor: simulation.brainExecutor };
      sender.act({ ...common, neighborStates: states.get(sender.id) ?? [] });
      receiver.act({ ...common, neighborStates: communication ? (states.get(receiver.id) ?? []) : [] });
      simulation.world.decaySignals(simulation.config.signal.decay);
    }
    const response = (receiver.brainExecution?.effectors.signal ?? 0) >= simulation.config.signal.activationThreshold ? 1 : 0;
    if (response === cue) correct += 1;
  }
  return correct / EPISODES;
}

function run(seed) {
  let state = seed >>> 0;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  let population = Array.from({ length: POPULATION }, () => randomParameters(random));
  for (let generation = 0; generation < GENERATIONS; generation += 1) {
    const ranked = population.map((parameters) => ({ parameters, score: score(parameters, seed + generation * 17) })).sort((a, b) => b.score - a.score);
    const survivors = ranked.slice(0, 5).map((entry) => entry.parameters);
    population = survivors.map((parent) => ({ ...parent }));
    while (population.length < POPULATION) population.push(mutate(survivors[Math.floor(random() * survivors.length)], random));
  }
  const best = population.map((parameters) => ({ parameters, score: score(parameters, seed + 99991) })).sort((a, b) => b.score - a.score)[0];
  const ideal = { senderInput: 1, senderOutput: 1, receiverInput: 1, receiverOutput: 1 };
  return { seed, ideal: score(ideal, seed + 99991), evolved: best.score, communicationDisabled: score(best.parameters, seed + 99991, false), parameters: best.parameters };
}

console.log(JSON.stringify({ protocol: { task: "real bond sender cue → Prime-13 → Prime-31 → receiver response", seeds: SEEDS, population: POPULATION, generations: GENERATIONS, episodes: EPISODES, delay: DELAY, mutation: "bounded heritable edge weights" }, runs: SEEDS.map(run) }, null, 2));
