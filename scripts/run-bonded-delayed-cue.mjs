// Uses the real Simulation organisms, BrainExecutor, persistent state, and a
// real bond. This is a substrate wiring check, not an evolutionary screen.
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160103, 160104, 160105];
const EPISODES = 24;
const DELAY = 4;

function taskBrain(role) {
  const nodes = role === "sender"
    ? [
      { id: "p19-input", label: "Cue", kind: "sensor", prime: 19 },
      { id: "p13-persistence", label: "Persistent state", kind: "persistent", prime: 13 },
      { id: "p19-output", label: "Message", kind: "effector", prime: 19 }
    ]
    : [
      { id: "p31-neighbor-state", label: "Bond message", kind: "sensor", prime: 31 },
      { id: "p13-persistence", label: "Persistent state", kind: "persistent", prime: 13 },
      { id: "p19-output", label: "Response", kind: "effector", prime: 19 }
    ];
  const source = role === "sender" ? "p19-input" : "p31-neighbor-state";
  return { status: "Active delayed-cue task graph", nodes, edges: [{ from: source, to: "p13-persistence" }, { from: "p13-persistence", to: "p19-output" }] };
}

function makePair(seed) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  simulation.headlessObservationMode = true;
  simulation.organisms = simulation.organisms.slice(0, 2);
  const [sender, receiver] = simulation.organisms;
  sender.x = 10; sender.y = 10; sender.brain = taskBrain("sender"); sender.energy = 150;
  receiver.x = 11; receiver.y = 10; receiver.brain = taskBrain("receiver"); receiver.energy = 150;
  const key = simulation.bondKey(sender.id, receiver.id);
  simulation.bonds.clear();
  simulation.bonds.set(key, { firstId: sender.id, secondId: receiver.id, strength: 1, reserve: 10, bondTrace: 0, componentCommitment: 1, topologyTrace: 0, topologyLastPulseTick: null, lastPulseTick: null, lastPulseEvent: null });
  return { simulation, sender, receiver };
}

function run(seed, communicationEnabled = true) {
  let correct = 0;
  const trace = [];
  for (let episode = 0; episode < EPISODES; episode += 1) {
    const { simulation, sender, receiver } = makePair(seed + episode * 101);
    const cue = episode % 2;
    if (communicationEnabled && cue === 1) simulation.world.addSignal(sender.x, sender.y, 255, 255);
    for (let tick = 0; tick < DELAY + 3; tick += 1) {
      const states = simulation.getNeighborStatesByOrganism();
      const common = { world: simulation.world, occupiedKeys: new Set(), config: simulation.config.organism, ecologyConfig: simulation.config.ecology, signalConfig: simulation.config.signal, environmentMemoryConfig: simulation.config.environmentMemory, coupled: true, brainExecutor: simulation.brainExecutor, neighborStates: states.get(sender.id) ?? [] };
      sender.act(common);
      receiver.act({ ...common, neighborStates: communicationEnabled ? (states.get(receiver.id) ?? []) : [] });
      simulation.world.decaySignals(simulation.config.signal.decay);
    }
    const response = (receiver.brainExecution?.effectors.signal ?? 0) >= simulation.config.signal.activationThreshold ? 1 : 0;
    const isCorrect = response === cue;
    correct += isCorrect ? 1 : 0;
    if (trace.length < 4) trace.push({ cue, response, receiverState: receiver.getPersistentState(), correct: isCorrect });
  }
  return { seed, accuracy: correct / EPISODES, trace };
}

console.log(JSON.stringify({ protocol: { task: "real bonded organisms: sender cue → Prime-13 state → Prime-31 neighbor state → receiver response", seeds: SEEDS, episodes: EPISODES, delay: DELAY }, runs: SEEDS.map((seed) => ({ seed, communication: run(seed, true), communicationDisabled: run(seed, false) })) }, null, 2));
