// Isolated minimal delayed-cue benchmark. It does not modify the live ecology.
const SEEDS = [160103, 160104, 160105];
const GENERATIONS = Number(process.env.GENESIS_CUE_GENERATIONS ?? 80);
const POPULATION = Number(process.env.GENESIS_CUE_POPULATION ?? 48);
const EPISODES = Number(process.env.GENESIS_CUE_EPISODES ?? 24);
const DELAY = Number(process.env.GENESIS_CUE_DELAY ?? 3);
const DELAY_MIN = Number(process.env.GENESIS_CUE_DELAY_MIN ?? DELAY);
const DELAY_MAX = Number(process.env.GENESIS_CUE_DELAY_MAX ?? DELAY);

function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }
function sigmoid(value) { return 1 / (1 + Math.exp(-value)); }

// The parameters are the smallest added evolutionary degree of freedom:
// cue input, recurrent memory, and output weights are heritable and bounded.
function randomController(random) {
  return { input: (random() - 0.5) * 2, recurrent: (random() - 0.5) * 2, output: (random() - 0.5) * 2, bias: (random() - 0.5) * 0.4, leak: 0.7 + random() * 0.25 };
}

function mutate(parent, random) {
  const child = { ...parent };
  const keys = Object.keys(child);
  const key = keys[Math.floor(random() * keys.length)];
  child[key] += (random() - 0.5) * (key === "leak" ? 0.18 : 0.8);
  child.leak = clamp(child.leak, 0.35, 0.98);
  return child;
}

function episode(controller, cue, mapping, delay, random, memoryEnabled = true) {
  let trace = 0;
  let energy = 10;
  const activity = [];
  for (let tick = 0; tick < delay + 5; tick += 1) {
    const input = tick === 0 ? cue : 0;
    if (memoryEnabled) trace = clamp((controller.leak + controller.recurrent) * trace + controller.input * input, -2, 2);
    else trace = 0;
    const output = sigmoid(controller.output * trace + controller.bias);
    energy -= 0.015 * Math.abs(trace) + 0.01 * output;
    activity.push({ tick, input, trace, output });
  }
  const response = activity.at(-1).output >= 0.5 ? 1 : 0;
  const correct = response === mapping[cue];
  energy += correct ? 1 : -0.6;
  return { correct, energy, response, trace: activity.at(-1).trace };
}

function score(controller, seed, memoryEnabled = true, episodes = EPISODES) {
  const random = rng(seed);
  const mapping = [0, 1];
  let correct = 0;
  let energy = 0;
  const samples = [];
  for (let index = 0; index < episodes; index += 1) {
    const cue = index % 2;
    const episodeDelay = DELAY_MIN + Math.floor(random() * (DELAY_MAX - DELAY_MIN + 1));
    const result = episode(controller, cue, mapping, episodeDelay, random, memoryEnabled);
    correct += result.correct ? 1 : 0;
    energy += result.energy;
    if (samples.length < 4) samples.push({ cue, delay: episodeDelay, response: result.response, trace: Number(result.trace.toFixed(3)), correct: result.correct, energy: Number(result.energy.toFixed(3)) });
  }
  return { accuracy: correct / episodes, energy: energy / episodes, samples };
}

function run(seed) {
  const random = rng(seed);
  let evolved = Array.from({ length: POPULATION }, () => randomController(random));
  const founder = randomController(rng(seed ^ 0xa5a5a5a5));
  for (let generation = 0; generation < GENERATIONS; generation += 1) {
    const ranked = evolved.map((controller) => ({ controller, ...score(controller, seed + generation * 31) }))
      .sort((a, b) => (b.accuracy + b.energy * 0.02) - (a.accuracy + a.energy * 0.02));
    const survivors = ranked.slice(0, Math.max(2, Math.floor(POPULATION * 0.2))).map((entry) => entry.controller);
    evolved = survivors.map((parent) => ({ ...parent }));
    while (evolved.length < POPULATION) evolved.push(mutate(survivors[Math.floor(random() * survivors.length)], random));
  }
  const best = evolved.map((controller) => ({ controller, ...score(controller, seed + 99991) }))
    .sort((a, b) => b.accuracy - a.accuracy || b.energy - a.energy)[0];
  const founderResult = score(founder, seed + 99991);
  const memoryOff = score(best.controller, seed + 99991, false);
  const topologyPerturbed = score({ ...best.controller, recurrent: 0 }, seed + 99991, true);
  return { seed, delayRange: [DELAY_MIN, DELAY_MAX], generations: GENERATIONS, founder: founderResult, evolved: { accuracy: best.accuracy, energy: best.energy }, memoryDisabled: memoryOff, topologyPerturbed, parameters: best.controller };
}

function randomCollective(random) {
  return { sender: randomController(random), receiver: randomController(random), communication: (random() - 0.5) * 2 };
}

function mutateCollective(parent, random) {
  const child = { sender: { ...parent.sender }, receiver: { ...parent.receiver }, communication: parent.communication };
  const targets = ["sender", "receiver", "communication"];
  const target = targets[Math.floor(random() * targets.length)];
  if (target === "communication") child.communication += (random() - 0.5) * 0.8;
  else {
    const keys = Object.keys(child[target]);
    const key = keys[Math.floor(random() * keys.length)];
    child[target][key] += (random() - 0.5) * (key === "leak" ? 0.18 : 0.8);
    child[target].leak = clamp(child[target].leak, 0.35, 0.98);
  }
  child.communication = clamp(child.communication, -2, 2);
  return child;
}

function collectiveScore(controller, seed, communicationEnabled = true, episodes = EPISODES) {
  const random = rng(seed);
  let correct = 0;
  let energy = 0;
  for (let index = 0; index < episodes; index += 1) {
    const cue = index % 2;
    const delay = DELAY_MIN + Math.floor(random() * (DELAY_MAX - DELAY_MIN + 1));
    let senderTrace = 0;
    let receiverTrace = 0;
    for (let tick = 0; tick < delay + 5; tick += 1) {
      const input = tick === 0 ? cue : 0;
      senderTrace = clamp((controller.sender.leak + controller.sender.recurrent) * senderTrace + controller.sender.input * input, -2, 2);
      const signal = communicationEnabled ? (sigmoid(controller.sender.output * senderTrace + controller.sender.bias) * 2 - 1) : 0;
      receiverTrace = clamp((controller.receiver.leak + controller.receiver.recurrent) * receiverTrace + controller.communication * signal, -2, 2);
      energy -= 0.012 * (Math.abs(senderTrace) + Math.abs(receiverTrace)) + 0.008 * Math.abs(signal);
    }
    const response = sigmoid(controller.receiver.output * receiverTrace + controller.receiver.bias) >= 0.5 ? 1 : 0;
    const isCorrect = response === cue;
    correct += isCorrect ? 1 : 0;
    energy += isCorrect ? 1 : -0.6;
  }
  return { accuracy: correct / episodes, energy: energy / episodes };
}

function runCollective(seed) {
  const random = rng(seed ^ 0x51a7);
  let population = Array.from({ length: POPULATION }, () => randomCollective(random));
  for (let generation = 0; generation < GENERATIONS; generation += 1) {
    const ranked = population.map((controller) => ({ controller, ...collectiveScore(controller, seed + generation * 37) }))
      .sort((a, b) => (b.accuracy + b.energy * 0.02) - (a.accuracy + a.energy * 0.02));
    const survivors = ranked.slice(0, Math.max(2, Math.floor(POPULATION * 0.2))).map((entry) => entry.controller);
    population = survivors.map((parent) => ({ sender: { ...parent.sender }, receiver: { ...parent.receiver }, communication: parent.communication }));
    while (population.length < POPULATION) population.push(mutateCollective(survivors[Math.floor(random() * survivors.length)], random));
  }
  const best = population.map((controller) => ({ controller, ...collectiveScore(controller, seed + 99991) }))
    .sort((a, b) => b.accuracy - a.accuracy || b.energy - a.energy)[0];
  return { seed, founder: collectiveScore(randomCollective(rng(seed ^ 0x9e37)), seed + 99991), evolved: { accuracy: best.accuracy, energy: best.energy }, communicationDisabled: collectiveScore(best.controller, seed + 99991, false), parameters: best.controller };
}

console.log(JSON.stringify({
  protocol: { task: "binary cue → blank delay → binary response", seeds: SEEDS, population: POPULATION, generations: GENERATIONS, episodesPerScore: EPISODES, delayRange: [DELAY_MIN, DELAY_MAX], controls: ["founder", "evolved", "memory-disabled", "topology-perturbed"] },
  runs: SEEDS.map(run),
  senderReceiver: { task: "sender sees cue → scalar bond message → receiver responds", controls: ["founder", "evolved", "communication-disabled"], runs: SEEDS.map(runCollective) }
}, null, 2));
