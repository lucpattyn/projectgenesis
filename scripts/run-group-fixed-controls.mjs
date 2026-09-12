// Fixed-reserve three-member communication benchmark with causal controls.
// Isolated diagnostic only; it does not modify live ecology defaults.
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160120, 160121, 160122, 160123, 160124, 160125, 160126, 160127];
const EPISODES = Number(process.env.GENESIS_GROUP_FIXED_EPISODES ?? 16);
const INITIAL_RESERVE = 10;

function brain(role, recurrence = true) {
  const source = role === "sender" ? "p19-input" : "p31-neighbor-state";
  return { nodes: [
    { id: source, kind: "sensor", prime: role === "sender" ? 19 : 31 },
    { id: "p13-persistence", kind: "persistent", prime: 13 },
    { id: "p19-output", kind: "effector", prime: 19 }
  ], edges: [
    { from: source, to: "p13-persistence", weight: 1 },
    ...(recurrence ? [{ from: "p13-persistence", to: "p13-persistence", weight: 1 }] : []),
    { from: "p13-persistence", to: "p19-output", weight: 1 }
  ] };
}

function makeGroup(seed, controls) {
  const simulation = new Simulation(); simulation.stop(); simulation.setSeed(seed); simulation.stop();
  simulation.organisms = simulation.organisms.slice(0, 3);
  const [sender, relay, receiver] = simulation.organisms;
  for (const [organism, role, x] of [[sender, "sender", 10], [relay, "relay", 11], [receiver, "receiver", 12]]) {
    organism.x = x; organism.y = 10; organism.energy = 150;
    organism.brain = brain(role, controls.recurrenceDisabled !== role && controls.recurrenceDisabled !== "all");
  }
  simulation.bonds.clear();
  const bond = (firstId, secondId) => ({ firstId, secondId, strength: 1, reserve: INITIAL_RESERVE, bondTrace: 1, componentCommitment: 1, topologyTrace: 1, topologyLastPulseTick: null, lastPulseTick: null, lastPulseEvent: "fixed-control" });
  if (controls.removedLink !== "first") simulation.bonds.set(simulation.bondKey(sender.id, relay.id), bond(sender.id, relay.id));
  if (controls.removedLink !== "second") simulation.bonds.set(simulation.bondKey(relay.id, receiver.id), bond(relay.id, receiver.id));
  return { simulation, sender, relay, receiver };
}

function runCondition(seed, controls) {
  let randomState = seed >>> 0;
  const random = () => { randomState = (randomState * 1664525 + 1013904223) >>> 0; return randomState / 4294967296; };
  let correct = 0; const episodes = [];
  for (let episode = 0; episode < EPISODES; episode += 1) {
    const { simulation, sender, relay, receiver } = makeGroup(seed + episode, controls);
    simulation.world.signalField = Array.from({ length: simulation.world.height }, () => Array(simulation.world.width).fill(0));
    const cue = episode % 2; const delay = 4 + Math.floor(random() * 9);
    if (cue) simulation.world.addSignal(sender.x, sender.y, 255, 255);
    const trace = [];
    for (let tick = 0; tick < delay + 3; tick += 1) {
      const states = simulation.getNeighborStatesByOrganism();
      const common = { world: simulation.world, occupiedKeys: new Set(), config: simulation.config.organism, ecologyConfig: simulation.config.ecology, signalConfig: simulation.config.signal, environmentMemoryConfig: simulation.config.environmentMemory, coupled: true, brainExecutor: simulation.brainExecutor };
      sender.act({ ...common, neighborStates: controls.communicationDisabled ? [] : (states.get(sender.id) ?? []) });
      relay.act({ ...common, neighborStates: controls.communicationDisabled ? [] : (states.get(relay.id) ?? []) });
      receiver.act({ ...common, neighborStates: controls.communicationDisabled ? [] : (states.get(receiver.id) ?? []) });
      trace.push({ tick, sender: sender.getPersistentState(), relay: relay.getPersistentState(), receiver: receiver.getPersistentState() });
      // The cue is a one-tick event. From tick 1 onward, only retained member
      // state may carry the information; no environmental signal may leak it.
      if (tick === 0) simulation.world.signalField = Array.from({ length: simulation.world.height }, () => Array(simulation.world.width).fill(0));
      simulation.world.decaySignals(simulation.config.signal.decay);
    }
    const response = (receiver.brainExecution?.effectors.signal ?? 0) >= simulation.config.signal.activationThreshold ? 1 : 0;
    if (response === cue) correct += 1;
    episodes.push({ cue, delay, response, correct: response === cue, trace });
  }
  return { accuracy: correct / EPISODES, episodes };
}

const conditions = {
  fixed: {}, communicationDisabled: { communicationDisabled: true },
  firstLinkRemoved: { removedLink: "first" }, secondLinkRemoved: { removedLink: "second" },
  senderRecurrenceDisabled: { recurrenceDisabled: "sender" }, relayRecurrenceDisabled: { recurrenceDisabled: "relay" },
  receiverRecurrenceDisabled: { recurrenceDisabled: "receiver" }, allRecurrenceDisabled: { recurrenceDisabled: "all" }
};
const runs = SEEDS.map((seed) => ({ seed, conditions: Object.fromEntries(Object.entries(conditions).map(([name, controls]) => [name, runCondition(seed, controls)])) }));
console.log(JSON.stringify({ protocol: { task: "sender → relay → receiver over two real bonds", seeds: SEEDS, episodes: EPISODES, delays: "randomized 4–12 ticks", initialBondReserve: INITIAL_RESERVE, controls: Object.keys(conditions), assistance: "members start at 150 energy; fixed reserves are diagnostic assistance and are not live defaults" }, runs }, null, 2));
