// Isolated minimal delayed-cue benchmark. It does not modify the live ecology.
const SEEDS = [160103, 160104, 160105];
const GENERATIONS = Number(process.env.GENESIS_CUE_GENERATIONS ?? 80);
const POPULATION = Number(process.env.GENESIS_CUE_POPULATION ?? 48);
const EPISODES = Number(process.env.GENESIS_CUE_EPISODES ?? 24);
const DELAY = Number(process.env.GENESIS_CUE_DELAY ?? 3);

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
    if (memoryEnabled) trace = clamp(controller.leak * trace + controller.input * input, -2, 2);
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
  for (let index = 0; index < episodes; index += 1) {
    const cue = index % 2;
    const episodeDelay = 2 + Math.floor(random() * 3);
    const result = episode(controller, cue, mapping, episodeDelay, random, memoryEnabled);
    correct += result.correct ? 1 : 0;
    energy += result.energy;
  }
  return { accuracy: correct / episodes, energy: energy / episodes };
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
  return { seed, delay: DELAY, generations: GENERATIONS, founder: founderResult, evolved: { accuracy: best.accuracy, energy: best.energy }, memoryDisabled: memoryOff, parameters: best.controller };
}

console.log(JSON.stringify({
  protocol: { task: "binary cue → blank delay → binary response", seeds: SEEDS, population: POPULATION, generations: GENERATIONS, episodesPerScore: EPISODES, delayRange: [2, 4], episodesUseConfiguredDelay: DELAY, controls: ["founder", "evolved", "memory-disabled"] },
  runs: SEEDS.map(run)
}, null, 2));
