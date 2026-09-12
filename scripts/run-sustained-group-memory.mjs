// Sustained three-member bonded memory: no internal state reset between episodes.
// Isolated diagnostic; live Genesis defaults remain untouched.
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160128, 160129, 160130, 160131, 160132, 160133, 160134, 160135];
const EPISODES = Number(process.env.GENESIS_SUSTAINED_EPISODES ?? 16);
const INITIAL_ENERGY = Number(process.env.GENESIS_SUSTAINED_ENERGY ?? 90);
const INITIAL_RESERVE = Number(process.env.GENESIS_SUSTAINED_RESERVE ?? 10);
const RESERVE_DECAY = 0.008;
const PULSE_GAIN = 0.003;

function brain(role) {
  const source = role === "sender" ? "p19-input" : "p31-neighbor-state";
  return { nodes: [
    { id: source, kind: "sensor", prime: role === "sender" ? 19 : 31 },
    { id: "p13-persistence", kind: "persistent", prime: 13 },
    { id: "p19-output", kind: "effector", prime: 19 }
  ], edges: [
    { from: source, to: "p13-persistence", weight: 1 },
    { from: "p13-persistence", to: "p13-persistence", weight: 1 },
    { from: "p13-persistence", to: "p19-output", weight: 1 }
  ] };
}

function makeGroup(seed) {
  const simulation = new Simulation(); simulation.stop(); simulation.setSeed(seed); simulation.stop();
  simulation.organisms = simulation.organisms.slice(0, 3);
  const [sender, relay, receiver] = simulation.organisms;
  for (const [organism, role, x] of [[sender, "sender", 10], [relay, "relay", 11], [receiver, "receiver", 12]]) {
    organism.x = x; organism.y = 10; organism.energy = INITIAL_ENERGY; organism.brain = brain(role);
  }
  simulation.bonds.clear();
  const bond = (firstId, secondId) => ({ firstId, secondId, strength: 1, reserve: INITIAL_RESERVE, bondTrace: 1, componentCommitment: 1, topologyTrace: 1, topologyLastPulseTick: null, lastPulseTick: null, lastPulseEvent: "sustained-memory" });
  simulation.bonds.set(simulation.bondKey(sender.id, relay.id), bond(sender.id, relay.id));
  simulation.bonds.set(simulation.bondKey(relay.id, receiver.id), bond(relay.id, receiver.id));
  return { simulation, sender, relay, receiver };
}

function run(seed, controls = {}) {
  let randomState = seed >>> 0;
  const random = () => { randomState = (randomState * 1664525 + 1013904223) >>> 0; return randomState / 4294967296; };
  const { simulation, sender, relay, receiver } = makeGroup(seed);
  let correct = 0; let attempted = 0; let totalBroken = 0; const episodes = [];
  for (let episode = 0; episode < EPISODES; episode += 1) {
    const cue = episode % 2; const delay = 4 + Math.floor(random() * 9);
    simulation.world.signalField = Array.from({ length: simulation.world.height }, () => Array(simulation.world.width).fill(0));
    if (cue) simulation.world.addSignal(sender.x, sender.y, 255, 255);
    let trace = [];
    for (let tick = 0; tick < delay + 3; tick += 1) {
      if (![sender, relay, receiver].every((member) => member.alive)) break;
      const states = simulation.getNeighborStatesByOrganism();
      const common = { world: simulation.world, occupiedKeys: new Set(), config: simulation.config.organism, ecologyConfig: simulation.config.ecology, signalConfig: simulation.config.signal, environmentMemoryConfig: simulation.config.environmentMemory, coupled: true, brainExecutor: simulation.brainExecutor };
      sender.act({ ...common, neighborStates: controls.communicationDisabled ? [] : (states.get(sender.id) ?? []) });
      relay.act({ ...common, neighborStates: controls.communicationDisabled ? [] : (states.get(relay.id) ?? []) });
      receiver.act({ ...common, neighborStates: controls.communicationDisabled ? [] : (states.get(receiver.id) ?? []) });
      const pulse = Math.max(0, relay.getPersistentState() ?? 0) + Math.max(0, receiver.getPersistentState() ?? 0);
      for (const bond of simulation.bonds.values()) bond.reserve += Math.min(0.03, pulse * PULSE_GAIN) - RESERVE_DECAY;
      for (const [key, bond] of simulation.bonds) if (bond.reserve <= 0) simulation.bonds.delete(key);
      trace.push({ tick, sender: sender.getPersistentState(), relay: relay.getPersistentState(), receiver: receiver.getPersistentState(), energy: [sender.energy, relay.energy, receiver.energy], bonds: simulation.bonds.size });
      if (tick === 0) simulation.world.signalField = Array.from({ length: simulation.world.height }, () => Array(simulation.world.width).fill(0));
      simulation.world.decaySignals(simulation.config.signal.decay);
    }
    const response = (receiver.brainExecution?.effectors.signal ?? 0) >= simulation.config.signal.activationThreshold ? 1 : 0;
    const valid = [sender, relay, receiver].every((member) => member.alive);
    if (valid) { attempted += 1; if (response === cue) correct += 1; }
    totalBroken += 2 - simulation.bonds.size;
    episodes.push({ episode, cue, delay, response, valid, correct: valid && response === cue, bonds: simulation.bonds.size });
  }
  return { accuracy: attempted ? correct / attempted : 0, attemptedEpisodes: attempted, meanBrokenBonds: totalBroken / EPISODES, finalEnergy: [sender.energy, relay.energy, receiver.energy], finalBonds: simulation.bonds.size, episodes };
}

const runs = SEEDS.map((seed) => ({ seed, sustained: run(seed), communicationDisabled: run(seed, { communicationDisabled: true }), resourceDisabled: run(seed, { resourceDisabled: true }) }));
console.log(JSON.stringify({ protocol: { task: "repeated sender → relay → receiver cues with no state reset", seeds: SEEDS, episodes: EPISODES, delays: "randomized 4–12 ticks", initialEnergy: INITIAL_ENERGY, initialBondReserve: INITIAL_RESERVE, reserveDecay: RESERVE_DECAY, pulseGain: PULSE_GAIN, controls: ["communicationDisabled", "resourceDisabled"], accounting: "member act costs and bond reserve decay are charged; no energy is minted" }, runs }, null, 2));
