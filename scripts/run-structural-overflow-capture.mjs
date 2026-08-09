import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const CONDITIONS = ["disabled", "bond", "facet"];
const SEEDS = [160103, 160104, 160105];
const TICKS = 500;

function run({ mode, seed }) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  simulation.config.overflowCapture.mode = mode;
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  const economics = simulation.energyEconomicsSnapshot();
  return {
    mode,
    seed,
    population: simulation.organisms.length,
    bonds: simulation.bonds.size,
    facets: simulation.getFacets().length,
    births: simulation.births,
    gateCompletions: simulation.collectiveWorkCompletions,
    discardedOverflow: economics.losses.capacityOverflow,
    capturedOverflow: simulation.structuralOverflowCaptured,
    reproductionAllocation: economics.allocations.reproduction,
    starvationDeaths: economics.deathCauses["energy exhaustion"] ?? 0,
    ageDeaths: economics.deathCauses["maximum age"] ?? 0
  };
}

if (!isMainThread) {
  parentPort.postMessage(run(workerData));
} else {
  const tasks = CONDITIONS.flatMap((mode) => SEEDS.map((seed) => ({ mode, seed })));
  const results = [];
  let cursor = 0;
  await new Promise((resolve, reject) => {
    const launch = () => {
      if (cursor >= tasks.length) {
        if (results.length === tasks.length) resolve();
        return;
      }
      const worker = new Worker(new URL(import.meta.url), { workerData: tasks[cursor++] });
      worker.once("message", (result) => { results.push(result); launch(); });
      worker.once("error", reject);
    };
    for (let index = 0; index < Math.min(3, tasks.length); index += 1) launch();
  });
  const mean = (records, key) => Number((records.reduce((total, record) => total + record[key], 0) / records.length).toFixed(2));
  const summary = CONDITIONS.map((mode) => {
    const records = results.filter((record) => record.mode === mode);
    return Object.fromEntries(["population", "bonds", "facets", "births", "gateCompletions", "discardedOverflow", "capturedOverflow", "reproductionAllocation", "starvationDeaths", "ageDeaths"]
      .map((key) => [`mean${key[0].toUpperCase()}${key.slice(1)}`, mean(records, key)]).concat([["mode", mode], ["runs", records.length]]));
  });
  console.log(JSON.stringify({ protocol: { ticks: TICKS, seeds: SEEDS, captureFraction: 0.75, transferEfficiency: 0.85, changedRule: "overflowCapture.mode only" }, summary, runs: results.sort((a, b) => a.mode.localeCompare(b.mode) || a.seed - b.seed) }, null, 2));
}
