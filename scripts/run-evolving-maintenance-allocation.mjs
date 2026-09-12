// Evolves maintenance allocation under explicit finite-energy accounting.
// Isolated experiment; no live Genesis defaults are changed.
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160136, 160137, 160138, 160139, 160140, 160141, 160142, 160143];
const POPULATION = Number(process.env.GENESIS_MA_POPULATION ?? 16);
const GENERATIONS = Number(process.env.GENESIS_MA_GENERATIONS ?? 20);
const EPISODES = Number(process.env.GENESIS_MA_EPISODES ?? 16);
const INITIAL_ENERGY = 42;
const INITIAL_BOND_RESERVE = 4;
const TASK_REWARD = 8;
const WORK_ADVANCE = Number(process.env.GENESIS_MA_WORK_ADVANCE ?? 1.5);
const PRE_RESPONSE_BUDGET = Number(process.env.GENESIS_MA_PRE_RESPONSE_BUDGET ?? 0.5);
const PROGRESS_THRESHOLD = Number(process.env.GENESIS_MA_PROGRESS_THRESHOLD ?? 0.05);
const DELIVERY_WINDOW_TICKS = Number(process.env.GENESIS_MA_DELIVERY_WINDOW_TICKS ?? 2);
const TASK_RESOURCE_POOL = EPISODES * (WORK_ADVANCE + TASK_REWARD + PRE_RESPONSE_BUDGET * 8);
const OPERATING_COST_SCALE = Number(process.env.GENESIS_MA_OPERATING_COST_SCALE ?? 1);

function brain(role) {
  const source = role === "sender" ? "p19-input" : "p31-neighbor-state";
  return { nodes: [{ id: source, kind: "sensor", prime: role === "sender" ? 19 : 31 }, { id: "p13-persistence", kind: "persistent", prime: 13 }, { id: "p19-output", kind: "effector", prime: 19 }], edges: [{ from: source, to: "p13-persistence", weight: 1 }, { from: "p13-persistence", to: "p13-persistence", weight: 1 }, { from: "p13-persistence", to: "p19-output", weight: 1 }] };
}

function randomParams(random) {
  const memberShare = 0.2 + random() * 0.7;
  const bondShare = 0.1 + random() * Math.min(0.6, 0.9 - memberShare);
  return { memberShare, bondShare };
}

function mutate(parent, random) {
  return {
    memberShare: Math.max(0.1, Math.min(0.9, parent.memberShare + (random() - 0.5) * 0.2)),
    bondShare: Math.max(0.05, Math.min(0.8, parent.bondShare + (random() - 0.5) * 0.2))
  };
}

function makeGroup(seed) {
  const simulation = new Simulation(); simulation.stop(); simulation.setSeed(seed); simulation.stop();
  simulation.config.organism.couplingMaintenance *= OPERATING_COST_SCALE;
  simulation.config.organism.persistenceMaintenance *= OPERATING_COST_SCALE;
  simulation.config.signal.emissionCost *= OPERATING_COST_SCALE;
  simulation.organisms = simulation.organisms.slice(0, 3);
  const [sender, relay, receiver] = simulation.organisms;
  for (const [organism, role, x] of [[sender, "sender", 10], [relay, "relay", 11], [receiver, "receiver", 12]]) { organism.x = x; organism.y = 10; organism.energy = INITIAL_ENERGY; organism.brain = brain(role); }
  simulation.bonds.clear();
  const bond = (firstId, secondId) => ({ firstId, secondId, strength: 1, reserve: INITIAL_BOND_RESERVE, bondTrace: 1, componentCommitment: 1, topologyTrace: 1, topologyLastPulseTick: null, lastPulseTick: null, lastPulseEvent: "maintenance-allocation" });
  simulation.bonds.set(simulation.bondKey(sender.id, relay.id), bond(sender.id, relay.id));
  simulation.bonds.set(simulation.bondKey(relay.id, receiver.id), bond(relay.id, receiver.id));
  return { simulation, sender, relay, receiver };
}

function evaluate(parameters, seed, resourceEnabled = true) {
  let state = seed >>> 0;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  const { simulation, sender, relay, receiver } = makeGroup(seed);
  let correct = 0; let attempted = 0; let totalBondLoss = 0; let rewardPaid = 0; let advancePaid = 0; let workBudgetPaid = 0; let memberAllocated = 0; let bondAllocated = 0; let pool = resourceEnabled ? TASK_RESOURCE_POOL : 0; let firstDeathEpisode = null; let firstDeathAudit = null; let earlyLedger = []; let elapsedTicks = 0; let progressCreditPending = false; let deliveryWindow = 0; let pendingPerceptionNeed = 0; let lastRelayState = 0; let lastReceiverState = 0;
  for (let episode = 0; episode < EPISODES; episode += 1) {
    const cue = episode % 2; const delay = 4 + Math.floor(random() * 9);
    simulation.world.signalField = Array.from({ length: simulation.world.height }, () => Array(simulation.world.width).fill(0));
    if (cue) simulation.world.addSignal(sender.x, sender.y, 255, 255);
    const intactAtStart = [sender, relay, receiver].every((member) => member.alive) && simulation.bonds.size === 2;
    if (resourceEnabled && intactAtStart && pool >= WORK_ADVANCE) {
      const perMember = WORK_ADVANCE / 3;
      for (const member of [sender, relay, receiver]) member.energy += perMember;
      pool -= WORK_ADVANCE; advancePaid += WORK_ADVANCE;
    }
    for (let tick = 0; tick < delay + 3; tick += 1) {
      if (![sender, relay, receiver].every((member) => member.alive)) break;
      const processingCredit = Math.min(PRE_RESPONSE_BUDGET, pendingPerceptionNeed);
      if (resourceEnabled && (progressCreditPending || deliveryWindow > 0) && processingCredit > 0 && [sender, relay, receiver].every((member) => member.alive) && pool >= processingCredit) {
        const perMember = processingCredit / 3;
        for (const member of [sender, relay, receiver]) member.energy += perMember;
        pool -= processingCredit; workBudgetPaid += processingCredit; memberAllocated += processingCredit;
        progressCreditPending = false;
        if (deliveryWindow > 0) deliveryWindow -= 1;
        pendingPerceptionNeed = 0;
      }
      const states = simulation.getNeighborStatesByOrganism();
      const common = { world: simulation.world, occupiedKeys: new Set(), config: simulation.config.organism, ecologyConfig: simulation.config.ecology, signalConfig: simulation.config.signal, environmentMemoryConfig: simulation.config.environmentMemory, coupled: true, brainExecutor: simulation.brainExecutor };
      const senderResult = sender.act({ ...common, neighborStates: states.get(sender.id) ?? [] });
      const relayResult = relay.act({ ...common, neighborStates: states.get(relay.id) ?? [] });
      const receiverResult = receiver.act({ ...common, neighborStates: states.get(receiver.id) ?? [] });
      // Explicit finite-energy boundary: zero energy ends the member before
      // another episode can silently continue it.
      for (const member of [sender, relay, receiver]) if (member.energy <= 0) { member.energy = 0; member.alive = false; member.deathReason = "finite-energy-budget"; }
      if (firstDeathEpisode === null && ![sender, relay, receiver].every((member) => member.alive)) {
        firstDeathEpisode = episode;
        firstDeathAudit = {
          episode, tick: elapsedTicks,
          members: [
            { role: "sender", id: sender.id, alive: sender.alive, energy: sender.energy, deathReason: sender.deathReason ?? null, costs: senderResult?.energyFlow?.expenses ?? {} },
            { role: "relay", id: relay.id, alive: relay.alive, energy: relay.energy, deathReason: relay.deathReason ?? null, costs: relayResult?.energyFlow?.expenses ?? {} },
            { role: "receiver", id: receiver.id, alive: receiver.alive, energy: receiver.energy, deathReason: receiver.deathReason ?? null, costs: receiverResult?.energyFlow?.expenses ?? {} }
          ]
        };
      }
      for (const [key, bond] of simulation.bonds) {
        const first = simulation.organisms.find((member) => member.id === bond.firstId);
        const second = simulation.organisms.find((member) => member.id === bond.secondId);
        if (!first?.alive || !second?.alive) simulation.bonds.delete(key);
      }
      for (const bond of simulation.bonds.values()) bond.reserve -= 0.02;
      for (const [key, bond] of simulation.bonds) if (bond.reserve <= 0) simulation.bonds.delete(key);
      const relayState = relay.getPersistentState() ?? 0;
      const receiverState = receiver.getPersistentState() ?? 0;
      const relayProgress = Math.abs(relayState - lastRelayState) >= PROGRESS_THRESHOLD;
      const receiverProgress = Math.abs(receiverState - lastReceiverState) >= PROGRESS_THRESHOLD;
      progressCreditPending = relayProgress || receiverProgress;
      if (receiverProgress && receiverState > 0.1) deliveryWindow = DELIVERY_WINDOW_TICKS;
      pendingPerceptionNeed = [senderResult, relayResult, receiverResult]
        .map((result) => result?.energyFlow?.expenses?.perception ?? 0)
        .reduce((sum, value) => sum + value, 0);
      if (episode < 3) earlyLedger.push({ episode, tick, pool, bonds: simulation.bonds.size, members: [
        { role: "sender", energy: sender.energy, costs: senderResult?.energyFlow?.expenses ?? {} },
        { role: "relay", energy: relay.energy, costs: relayResult?.energyFlow?.expenses ?? {} },
        { role: "receiver", energy: receiver.energy, costs: receiverResult?.energyFlow?.expenses ?? {} }
      ] });
      lastRelayState = relayState; lastReceiverState = receiverState;
      if (tick === 0) simulation.world.signalField = Array.from({ length: simulation.world.height }, () => Array(simulation.world.width).fill(0));
      simulation.world.decaySignals(simulation.config.signal.decay);
      elapsedTicks += 1;
    }
    const response = (receiver.brainExecution?.effectors.signal ?? 0) >= simulation.config.signal.activationThreshold ? 1 : 0;
    const valid = [sender, relay, receiver].every((member) => member.alive) && simulation.bonds.size === 2;
    if (valid) { attempted += 1; if (response === cue) { correct += 1; if (resourceEnabled && pool >= TASK_REWARD) { const memberReward = TASK_REWARD * parameters.memberShare; const bondReward = TASK_REWARD * parameters.bondShare; for (const member of [sender, relay, receiver]) member.energy += memberReward / 3; for (const bond of simulation.bonds.values()) bond.reserve += bondReward / 2; pool -= TASK_REWARD; memberAllocated += memberReward; bondAllocated += bondReward; rewardPaid += TASK_REWARD; } } }
    totalBondLoss += 2 - simulation.bonds.size;
  }
  const accuracy = attempted ? correct / attempted : 0;
  const survival = attempted / EPISODES;
  return { accuracy, survival, meanBondLoss: totalBondLoss / EPISODES, advancePaid, workBudgetPaid, rewardPaid, poolRemaining: pool, firstDeathEpisode, firstDeathAudit, earlyLedger, elapsedTicks, ledger: { initialPool: resourceEnabled ? TASK_RESOURCE_POOL : 0, advanceIn: advancePaid, workBudgetIn: workBudgetPaid, rewardIn: rewardPaid, memberAllocated, bondAllocated, unspent: pool }, fitness: accuracy + survival * 0.1 };
}

function run(seed) {
  let state = seed >>> 0;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  let population = Array.from({ length: POPULATION }, () => randomParams(random));
  for (let generation = 0; generation < GENERATIONS; generation += 1) {
    const ranked = population.map((parameters) => ({ parameters, score: evaluate(parameters, seed + generation * 29).fitness })).sort((a, b) => b.score - a.score);
    const survivors = ranked.slice(0, 6).map((entry) => entry.parameters);
    population = survivors.map((p) => ({ ...p }));
    while (population.length < POPULATION) population.push(random() < 0.15 ? randomParams(random) : mutate(survivors[Math.floor(random() * survivors.length)], random));
  }
  const best = population.map((parameters) => ({ parameters, score: evaluate(parameters, seed + 99991).fitness })).sort((a, b) => b.score - a.score)[0];
  return { seed, resourceEnabled: evaluate(best.parameters, seed + 99991, true), resourceDisabled: evaluate(best.parameters, seed + 99991, false), parameters: best.parameters };
}

console.log(JSON.stringify({ protocol: { task: "sustained three-member bonded memory with evolved maintenance allocation", seeds: SEEDS, population: POPULATION, generations: GENERATIONS, episodes: EPISODES, initialEnergy: INITIAL_ENERGY, initialBondReserve: INITIAL_BOND_RESERVE, taskResourcePool: TASK_RESOURCE_POOL, workAdvance: WORK_ADVANCE, preResponseBudget: PRE_RESPONSE_BUDGET, progressThreshold: PROGRESS_THRESHOLD, deliveryWindowTicks: DELIVERY_WINDOW_TICKS, taskReward: TASK_REWARD, operatingCostScale: OPERATING_COST_SCALE, fitness: "accuracy + 0.1 survival", resourceRule: "bounded startup advance, progress-gated window, and reward are deducted from one declared pool; only measured perception expense is escrow-eligible; allocations are ledgered; no energy minting", finiteEnergyBoundary: "energy <= 0 marks death and ends later episodes" }, runs: SEEDS.map(run) }, null, 2));
