import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160103, 160104, 160105];
const TICKS = 400;

function peak(entries, key) {
  return entries.reduce((best, entry, index) => entry[key] > best.value ? { value: entry[key], index, tick: entry.tick } : best, { value: -Infinity, index: 0, tick: 0 });
}

function firstThresholdAfter(entries, startIndex, key, threshold) {
  const index = entries.findIndex((entry, candidate) => candidate > startIndex && entry[key] <= threshold);
  return index === -1 ? null : entries[index].tick;
}

function run(seed) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  const series = simulation.energyLogistics.timeSeries.map((entry) => ({
    tick: entry.tick,
    averageBondReserve: entry.energyLockedInsideBonds / Math.max(1, entry.bonds),
    bondReserve: entry.energyLockedInsideBonds,
    bonds: entry.bonds,
    facets: entry.facets,
    starvationDeaths: entry.starvationDeaths
  }));
  const reservePeak = peak(series, "bondReserve");
  const bondPeak = peak(series, "bonds");
  const facetPeak = peak(series, "facets");
  return {
    seed,
    eventOrder: {
      reserveFillingPeak: reservePeak.tick,
      reserveDepletion20Percent: firstThresholdAfter(series, reservePeak.index, "bondReserve", reservePeak.value * 0.8),
      firstStarvationDeath: series.find((entry) => entry.starvationDeaths > 0)?.tick ?? null,
      bondLoss20Percent: firstThresholdAfter(series, bondPeak.index, "bonds", bondPeak.value * 0.8),
      facetLoss20Percent: firstThresholdAfter(series, facetPeak.index, "facets", facetPeak.value * 0.8)
    },
    peaks: { bondReserve: reservePeak.value, bonds: bondPeak.value, facets: facetPeak.value },
    final: series.at(-1),
    series
  };
}

if (!isMainThread) {
  parentPort.postMessage(run(workerData));
} else {
  const results = [];
  await Promise.all(SEEDS.map((seed) => new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), { workerData: seed });
    worker.once("message", (result) => { results.push(result); resolve(); });
    worker.once("error", reject);
  })));
  const eventKeys = ["reserveFillingPeak", "reserveDepletion20Percent", "firstStarvationDeath", "bondLoss20Percent", "facetLoss20Percent"];
  const median = (values) => {
    const ordered = values.filter((value) => value !== null).sort((first, second) => first - second);
    if (!ordered.length) return null;
    return ordered[Math.floor(ordered.length / 2)];
  };
  const eventMedian = Object.fromEntries(eventKeys.map((key) => [key, median(results.map((result) => result.eventOrder[key]))]));
  console.log(JSON.stringify({
    protocol: { seeds: SEEDS, ticks: TICKS, changedRules: "none; default live ecology" },
    eventMedian,
    runs: results.sort((a, b) => a.seed - b.seed).map(({ seed, eventOrder, peaks, final }) => ({ seed, eventOrder, peaks, final }))
  }, null, 2));
}
