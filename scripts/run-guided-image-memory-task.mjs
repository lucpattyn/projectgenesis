// Guided structural intelligence: delayed horizontal-versus-vertical task.
// Uses real Genesis organisms, Prime-13 recurrence, and Prime-31 bonds.
// The task is isolated and never changes live ecology defaults.
import { mkdir, writeFile } from "node:fs/promises";
import { Simulation } from "../server/simulation/simulation.js";
import { setGuidedGrid } from "../server/simulation/guided-input.js";

const SEEDS = [160201, 160202, 160203, 160204, 160205, 160206, 160207, 160208];
const POPULATION = Number(process.env.GENESIS_IMAGE_TASK_POPULATION ?? 24);
const GENERATIONS = Number(process.env.GENESIS_IMAGE_TASK_GENERATIONS ?? 24);
const TRAIN_TRIALS = Number(process.env.GENESIS_IMAGE_TASK_TRAIN_TRIALS ?? 20);
const EVAL_TRIALS = Number(process.env.GENESIS_IMAGE_TASK_EVAL_TRIALS ?? 100);
const INPUT_TICKS = 20;
const DELAY_MIN = 10;
const DELAY_MAX = 30;
const RESPONSE_THRESHOLD = 0.35;
const CENTER = 8;

function lcg(seed) {
  let state = seed >>> 0;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

function imageGrid(label, random, { shift = 0, brightness = 1, noise = 0 } = {}) {
  const grid = Array.from({ length: 16 }, () => Array(16).fill(0));
  const offset = Math.max(-2, Math.min(2, shift));
  for (let index = 3; index <= 12; index += 1) {
    const x = label === 1 ? index + offset : CENTER + offset;
    const y = label === 1 ? CENTER + offset : index + offset;
    if (x >= 0 && x < 16 && y >= 0 && y < 16) grid[y][x] = brightness;
  }
  if (noise > 0) {
    for (let count = 0; count < Math.round(noise * 16); count += 1) {
      const x = Math.floor(random() * 16); const y = Math.floor(random() * 16);
      grid[y][x] = grid[y][x] > 0 ? 0 : brightness;
    }
  }
  return grid;
}

function brain(role, p) {
  if (role === "sender") {
    const sensors = ["n", "e", "s", "w"];
    return {
      nodes: [...sensors.map((id) => ({ id: `p17-${id}`, kind: "sensor", prime: 17 })), { id: "p13-persistence", kind: "persistent", prime: 13 }],
      edges: [
        ...sensors.map((id) => ({ from: `p17-${id}`, to: "p13-persistence", weight: p[`sender-${id}`] })),
        { from: "p13-persistence", to: "p13-persistence", weight: p.senderMemory }
      ]
    };
  }
  return {
    nodes: [{ id: "p31-neighbor-state", kind: "sensor", prime: 31 }, { id: "p13-persistence", kind: "persistent", prime: 13 }, { id: "p19-output", kind: "effector", prime: 19 }],
    edges: [
      { from: "p31-neighbor-state", to: "p13-persistence", weight: p[`${role}-input`] },
      { from: "p13-persistence", to: "p13-persistence", weight: p[`${role}-memory`] },
      { from: "p13-persistence", to: "p19-output", weight: p[`${role}-output`] }
    ]
  };
}

function randomParameters(random) {
  return {
    "sender-n": (random() - 0.5) * 2, "sender-e": (random() - 0.5) * 2,
    "sender-s": (random() - 0.5) * 2, "sender-w": (random() - 0.5) * 2,
    senderMemory: random() * 1.5,
    "relay-input": (random() - 0.5) * 2, "relay-memory": random() * 1.5, "relay-output": (random() - 0.5) * 2,
    "receiver-input": (random() - 0.5) * 2, "receiver-memory": random() * 1.5, "receiver-output": (random() - 0.5) * 2
  };
}

function starterParameters() {
  return {
    "sender-n": -1, "sender-e": 1, "sender-s": -1, "sender-w": 1, senderMemory: 1,
    "relay-input": 1, "relay-memory": 1, "relay-output": 1,
    "receiver-input": 1, "receiver-memory": 1, "receiver-output": 2
  };
}

function mutate(parent, random) {
  const child = { ...parent };
  const keys = Object.keys(child);
  const key = keys[Math.floor(random() * keys.length)];
  child[key] = Math.max(-2, Math.min(2, child[key] + (random() - 0.5) * 0.55));
  return child;
}

function crossover(a, b, random) {
  const child = {};
  for (const key of Object.keys(a)) child[key] = random() < 0.5 ? a[key] : b[key];
  return mutate(child, random);
}

function makeGroup(seed, parameters, support = true) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  simulation.stop();
  simulation.setHeadlessObservationMode(true);
  simulation.setGuidedSupportedDevelopmentEnabled(support);
  simulation.config.guidedStructuralIntelligence.adaptiveResponse.enabled = false;
  simulation.setGuidedStructuralIntelligenceEnabled(true);
  simulation.organisms = simulation.organisms.slice(0, 3);
  const [sender, relay, receiver] = simulation.organisms;
  for (const [organism, role, x] of [[sender, "sender", 24], [relay, "relay", 25], [receiver, "receiver", 26]]) {
    organism.x = x; organism.y = 24; organism.energy = 80; organism.brain = brain(role, parameters); organism.age = 0;
  }
  simulation.bonds.clear();
  const bond = (firstId, secondId) => ({ firstId, secondId, strength: 1, reserve: 10, bondTrace: 1, componentCommitment: 1, topologyTrace: 1, topologyLastPulseTick: null, lastPulseTick: null, lastPulseEvent: "guided-image-task" });
  simulation.bonds.set(simulation.bondKey(sender.id, relay.id), bond(sender.id, relay.id));
  simulation.bonds.set(simulation.bondKey(relay.id, receiver.id), bond(relay.id, receiver.id));
  return { simulation, sender, relay, receiver };
}

function actGroup(group, communication = true) {
  const { simulation, sender, relay, receiver } = group;
  const states = simulation.getNeighborStatesByOrganism();
  const common = {
    world: simulation.world, occupiedKeys: new Set(), config: simulation.config.organism,
    ecologyConfig: simulation.config.ecology, signalConfig: simulation.config.signal,
    environmentMemoryConfig: simulation.config.environmentMemory, guidedInput: simulation.guidedInput,
    guidedInputConfig: simulation.config.guidedStructuralIntelligence, coupled: true,
    brainExecutor: simulation.brainExecutor
  };
  sender.act({ ...common, neighborStates: states.get(sender.id) ?? [] });
  relay.act({ ...common, neighborStates: communication ? (states.get(relay.id) ?? []) : [] });
  receiver.act({ ...common, neighborStates: communication ? (states.get(receiver.id) ?? []) : [] });
  return receiver.brainExecution?.effectors.signal ?? 0;
}

function trial(parameters, seed, label, random, controls = {}) {
  const group = makeGroup(seed, parameters, controls.support !== false);
  const { simulation, receiver } = group;
  const delay = DELAY_MIN + Math.floor(random() * (DELAY_MAX - DELAY_MIN + 1));
  const grid = imageGrid(label, random, controls.variant ?? {});
  simulation.guidedInput = setGuidedGrid(simulation.guidedInput, grid, "task-trial");
  simulation.guidedInput.mapping = "direct";
  simulation.setGuidedStructuralIntelligenceEnabled(true);
  for (let tick = 0; tick < INPUT_TICKS; tick += 1) actGroup(group, controls.communication !== false);
  simulation.setGuidedStructuralIntelligenceEnabled(false);
  if (controls.eraseMemory) {
    for (const organism of [group.sender, group.relay, group.receiver]) {
      organism.brainExecution = organism.brainExecution
        ? { ...organism.brainExecution, persistentState: Object.fromEntries(Object.keys(organism.brainExecution.persistentState ?? {}).map((key) => [key, 0])) }
        : null;
    }
  }
  for (let tick = 0; tick < delay; tick += 1) actGroup(group, controls.communication !== false);
  const response = receiver.brainExecution?.effectors.signal >= RESPONSE_THRESHOLD ? 1 : 0;
  return { label, delay, response, responseSignal: receiver.brainExecution?.effectors.signal ?? 0, correct: response === label, bonds: simulation.bonds.size, responseState: receiver.getPersistentState() ?? 0 };
}

function measure(parameters, seed, count, controls = {}) {
  const random = lcg(seed ^ 0x9e3779b9);
  let correct = 0; let softScore = 0; const trials = [];
  for (let index = 0; index < count; index += 1) {
    const label = index % 2;
    const result = trial(parameters, seed + index * 37, label, random, controls);
    trials.push(result);
    if (result.correct) correct += 1;
    const normalizedResponse = Math.max(0, Math.min(1, result.responseSignal / 8));
    softScore += result.label === 1 ? normalizedResponse : 1 - normalizedResponse;
  }
  return { accuracy: correct / count, fitness: softScore / count, trials };
}

function evolve(seed) {
  const random = lcg(seed);
  let population = [starterParameters(), ...Array.from({ length: Math.max(0, POPULATION - 1) }, () => randomParameters(random))];
  const history = [];
  for (let generation = 0; generation < GENERATIONS; generation += 1) {
    const ranked = population.map((parameters) => ({ parameters, score: measure(parameters, seed + generation * 97, TRAIN_TRIALS).fitness }))
      .sort((a, b) => b.score - a.score);
    history.push({ generation, bestAccuracy: ranked[0].score });
    const survivors = ranked.slice(0, Math.max(4, Math.floor(POPULATION / 3))).map((entry) => entry.parameters);
    population = survivors.map((parent) => ({ ...parent }));
    while (population.length < POPULATION) {
      if (random() < 0.1) population.push(randomParameters(random));
      else population.push(crossover(survivors[Math.floor(random() * survivors.length)], survivors[Math.floor(random() * survivors.length)], random));
    }
  }
  const best = population.map((parameters) => ({ parameters, score: measure(parameters, seed + 0x12345, TRAIN_TRIALS).fitness }))
    .sort((a, b) => b.score - a.score)[0];
  const evalSeed = seed + 0x77777;
  const untrainedRandom = randomParameters(lcg(seed ^ 0x51f15e));
  return {
    seed,
    trainingHistory: history,
    parameters: best.parameters,
    trainingAccuracy: measure(best.parameters, seed + 0x12345, TRAIN_TRIALS).accuracy,
    evaluation: measure(best.parameters, evalSeed, EVAL_TRIALS),
    communicationDisabled: measure(best.parameters, evalSeed, EVAL_TRIALS, { communication: false }),
    memoryErasedAfterInput: measure(best.parameters, evalSeed, EVAL_TRIALS, { eraseMemory: true }),
    blankInput: measure(best.parameters, evalSeed, EVAL_TRIALS, { variant: { brightness: 0 } }),
    supportDisabled: measure(best.parameters, evalSeed, Math.min(20, EVAL_TRIALS), { support: false }),
    untrained: measure(untrainedRandom, evalSeed, EVAL_TRIALS)
  };
}

const runs = SEEDS.map(evolve);
const output = {
  protocol: {
    task: "horizontal versus vertical local image → Prime-13 memory → Prime-31 relay → delayed response",
    seeds: SEEDS, population: POPULATION, generations: GENERATIONS, trainingTrials: TRAIN_TRIALS,
    evaluationTrials: EVAL_TRIALS, inputTicks: INPUT_TICKS, delayRange: [DELAY_MIN, DELAY_MAX],
    balanced: true, support: "identical bounded supported-development budget across labels and controls",
    target: "at least 80% delayed accuracy in 6/8 seeds; material drop under communication/memory controls"
  }, runs
};
await mkdir("research-results", { recursive: true });
await writeFile("research-results/guided-image-memory-task.json", JSON.stringify(output, null, 2));
console.log(JSON.stringify({ protocol: output.protocol, summary: runs.map((run) => ({ seed: run.seed, trainingAccuracy: run.trainingAccuracy, evaluationAccuracy: run.evaluation.accuracy, communicationDisabled: run.communicationDisabled.accuracy, memoryErasedAfterInput: run.memoryErasedAfterInput.accuracy })) }, null, 2));
