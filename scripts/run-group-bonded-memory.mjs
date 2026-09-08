// Three-member bonded-memory screen: sender -> relay -> receiver.
// This is an isolated experiment; it does not change live ecology defaults.
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160120, 160121, 160122, 160123];
const POPULATION = Number(process.env.GENESIS_GROUP_MEMORY_POPULATION ?? 16);
const GENERATIONS = Number(process.env.GENESIS_GROUP_MEMORY_GENERATIONS ?? 24);
const EPISODES = Number(process.env.GENESIS_GROUP_MEMORY_EPISODES ?? 8);
const DELAY = 8;

function brain(role, p) {
  const source = role === "sender" ? "p19-input" : "p31-neighbor-state";
  const input = p[`${role}Input`];
  const memory = p[`${role}Memory`];
  const output = p[`${role}Output`];
  return { nodes: [
    { id: source, kind: "sensor", prime: role === "sender" ? 19 : 31 },
    { id: "p13-persistence", kind: "persistent", prime: 13 },
    { id: "p19-output", kind: "effector", prime: 19 }
  ], edges: [
    { from: source, to: "p13-persistence", weight: input },
    { from: "p13-persistence", to: "p13-persistence", weight: memory },
    { from: "p13-persistence", to: "p19-output", weight: output }
  ] };
}

function randomParameters(random) {
  const p = {};
  for (const role of ["sender", "relay", "receiver"]) {
    p[`${role}Input`] = (random() - 0.5) * 2;
    p[`${role}Memory`] = random() * 1.5;
    p[`${role}Output`] = (random() - 0.5) * 2;
  }
  return p;
}

function mutate(parent, random) {
  const child = { ...parent }, key = Object.keys(child)[Math.floor(random() * Object.keys(child).length)];
  if (random() < 0.25) child[key] = -child[key];
  else child[key] = Math.max(-2, Math.min(2, child[key] + (random() - 0.5) * 0.55));
  return child;
}

function crossover(a, b, random) {
  const child = {};
  for (const key of Object.keys(a)) child[key] = random() < 0.5 ? a[key] : b[key];
  return mutate(child, random);
}

function makeGroup(seed, p) {
  const simulation = new Simulation();
  simulation.stop(); simulation.setSeed(seed); simulation.headlessObservationMode = true;
  simulation.organisms = simulation.organisms.slice(0, 3);
  const [sender, relay, receiver] = simulation.organisms;
  for (const [organism, role, x] of [[sender, "sender", 10], [relay, "relay", 11], [receiver, "receiver", 12]]) {
    organism.x = x; organism.y = 10; organism.brain = brain(role, p); organism.energy = 150;
  }
  simulation.bonds.clear();
  const bond = (firstId, secondId) => ({ firstId, secondId, strength: 1, reserve: 1.5, bondTrace: 0, componentCommitment: 1, topologyTrace: 0, topologyLastPulseTick: null, lastPulseTick: null, lastPulseEvent: null });
  simulation.bonds.set(simulation.bondKey(sender.id, relay.id), bond(sender.id, relay.id));
  simulation.bonds.set(simulation.bondKey(relay.id, receiver.id), bond(relay.id, receiver.id));
  return { simulation, sender, relay, receiver };
}

function measure(parameters, seed, communication = true, episodes = EPISODES) {
  let state = seed >>> 0;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  let correct = 0, broken = 0, cueOne = 0;
  for (let episode = 0; episode < episodes; episode += 1) {
    const { simulation, sender, relay, receiver } = makeGroup(seed + episode, parameters);
    simulation.world.signalField = Array.from({ length: simulation.world.height }, () => Array(simulation.world.width).fill(0));
    const cue = episode % 2; cueOne += cue;
    if (cue) simulation.world.addSignal(sender.x, sender.y, 255, 255);
    for (let tick = 0; tick < DELAY + 3; tick += 1) {
      const states = simulation.getNeighborStatesByOrganism();
      const common = { world: simulation.world, occupiedKeys: new Set(), config: simulation.config.organism, ecologyConfig: simulation.config.ecology, signalConfig: simulation.config.signal, environmentMemoryConfig: simulation.config.environmentMemory, coupled: true, brainExecutor: simulation.brainExecutor };
      sender.act({ ...common, neighborStates: states.get(sender.id) ?? [] });
      relay.act({ ...common, neighborStates: communication ? (states.get(relay.id) ?? []) : [] });
      receiver.act({ ...common, neighborStates: communication ? (states.get(receiver.id) ?? []) : [] });
      for (const bond of simulation.bonds.values()) {
        const pulse = Math.max(0, relay.getPersistentState() ?? 0) + Math.max(0, receiver.getPersistentState() ?? 0);
        bond.reserve += Math.min(0.03, pulse * 0.002) - 0.012;
      }
      for (const [key, bond] of simulation.bonds) if (bond.reserve <= 0) simulation.bonds.delete(key);
      simulation.world.decaySignals(simulation.config.signal.decay);
    }
    const response = (receiver.brainExecution?.effectors.signal ?? 0) >= simulation.config.signal.activationThreshold ? 1 : 0;
    if (response === cue) correct += 1;
    broken += 2 - simulation.bonds.size;
  }
  return { accuracy: correct / episodes, meanBrokenBonds: broken / episodes, fitness: correct / episodes - broken / (episodes * 20) };
}

function run(seed) {
  let state = seed >>> 0;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  let population = Array.from({ length: POPULATION }, () => randomParameters(random));
  for (let generation = 0; generation < GENERATIONS; generation += 1) {
    const ranked = population.map((parameters) => ({ parameters, score: measure(parameters, seed + generation * 31).fitness })).sort((a, b) => b.score - a.score);
    const survivors = ranked.slice(0, 6).map((entry) => entry.parameters);
    population = survivors.map((p) => ({ ...p }));
    while (population.length < POPULATION) population.push(random() < 0.15 ? randomParameters(random) : crossover(survivors[Math.floor(random() * survivors.length)], survivors[Math.floor(random() * survivors.length)], random));
  }
  const best = population.map((parameters) => ({ parameters, score: measure(parameters, seed + 99991).fitness })).sort((a, b) => b.score - a.score)[0];
  return { seed, evolved: measure(best.parameters, seed + 99991), communicationDisabled: measure(best.parameters, seed + 99991, false), parameters: best.parameters };
}

console.log(JSON.stringify({ protocol: { task: "three-member sender → relay → receiver over two real bonds", seeds: SEEDS, population: POPULATION, generations: GENERATIONS, delay: DELAY, bondRule: "reserve decays; useful recurrent pulse replenishes reserve; depleted bonds are removed" }, runs: SEEDS.map(run) }, null, 2));
