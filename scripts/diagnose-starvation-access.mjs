import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160103, 160104, 160105];
const TICKS = 400;

function run(seed) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  const deaths = simulation.starvationDiagnostics;
  const count = (predicate) => deaths.filter(predicate).length;
  const mean = (key) => Number((deaths.reduce((total, death) => total + death[key], 0) / Math.max(1, deaths.length)).toFixed(3));
  return {
    seed,
    starvationDeaths: deaths.length,
    bondedDeaths: count((death) => death.bonded),
    eligibleDeaths: count((death) => death.supportEligible),
    supportedDeaths: count((death) => death.supportReceived > 0),
    strandedDeaths: count((death) => death.strandedFromComponent),
    meanDirectAccessibleReserve: mean("directAccessibleReserve"),
    meanComponentAccessibleReserve: mean("componentAccessibleReserve"),
    meanSupportReceived: mean("supportReceived"),
    events: deaths
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
  const sum = (key) => results.reduce((total, result) => total + result[key], 0);
  const totalDeaths = sum("starvationDeaths");
  const summary = {
    starvationDeaths: totalDeaths,
    bondedDeaths: sum("bondedDeaths"),
    eligibleDeaths: sum("eligibleDeaths"),
    supportedDeaths: sum("supportedDeaths"),
    strandedDeaths: sum("strandedDeaths"),
    meanDirectAccessibleReserve: Number((results.reduce((total, result) => total + result.meanDirectAccessibleReserve, 0) / results.length).toFixed(3)),
    meanComponentAccessibleReserve: Number((results.reduce((total, result) => total + result.meanComponentAccessibleReserve, 0) / results.length).toFixed(3)),
    meanSupportReceived: Number((results.reduce((total, result) => total + result.meanSupportReceived, 0) / results.length).toFixed(3))
  };
  console.log(JSON.stringify({ protocol: { seeds: SEEDS, ticks: TICKS, changedRules: "none; default live ecology" }, summary, runs: results.sort((a, b) => a.seed - b.seed) }, null, 2));
}
