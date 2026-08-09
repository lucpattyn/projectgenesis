import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const CONDITIONS = [
  { id: "baseline", maxSupportReleasePerTick: 0.35 },
  { id: "moderate-throughput", maxSupportReleasePerTick: 0.70 },
  { id: "high-throughput", maxSupportReleasePerTick: 1.40 }
];
const SEEDS = [160103, 160104, 160105];
const TICKS = 500;

function run({ condition, seed }) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  simulation.config.overflowCapture.mode = "bond";
  simulation.config.bond.maxSupportReleasePerTick = condition.maxSupportReleasePerTick;
  let lastFacetTick = 0;
  for (let tick = 0; tick < TICKS; tick += 1) {
    simulation.step();
    if (simulation.getFacets().length > 0) lastFacetTick = tick + 1;
  }
  const economics = simulation.energyEconomicsSnapshot();
  const logistics = simulation.energyLogistics.timeSeries;
  const mean = (key) => logistics.reduce((total, entry) => total + (entry[key] ?? 0), 0) / Math.max(1, logistics.length);
  const meanGini = logistics.reduce((total, entry) => total + entry.energyDistribution.gini, 0) / Math.max(1, logistics.length);
  return {
    condition: condition.id,
    seed,
    population: simulation.organisms.length,
    bonds: simulation.bonds.size,
    facets: simulation.getFacets().length,
    lastFacetTick,
    births: simulation.births,
    gateCompletions: simulation.collectiveWorkCompletions,
    starvationDeaths: economics.deathCauses["energy exhaustion"] ?? 0,
    ageDeaths: economics.deathCauses["maximum age"] ?? 0,
    capturedOverflow: simulation.structuralOverflowCaptured,
    discardedOverflow: economics.losses.capacityOverflow,
    reserveSupportTransfers: simulation.bondSupportTransfers,
    reserveEnergyReleased: simulation.bondSupportEnergyReleased,
    meanReserveTurnover: mean("averageReserveTurnover"),
    meanGini
  };
}

if (!isMainThread) {
  parentPort.postMessage(run(workerData));
} else {
  const tasks = CONDITIONS.flatMap((condition) => SEEDS.map((seed) => ({ condition, seed })));
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
  const summary = CONDITIONS.map((condition) => {
    const records = results.filter((record) => record.condition === condition.id);
    return Object.fromEntries(["population", "bonds", "facets", "lastFacetTick", "births", "gateCompletions", "starvationDeaths", "capturedOverflow", "reserveSupportTransfers", "reserveEnergyReleased", "meanReserveTurnover", "meanGini"]
      .map((key) => [`mean${key[0].toUpperCase()}${key.slice(1)}`, mean(records, key)]).concat([["condition", condition.id], ["releaseRate", condition.maxSupportReleasePerTick], ["runs", records.length]]));
  });
  console.log(JSON.stringify({ protocol: { ticks: TICKS, seeds: SEEDS, overflowCapture: "bond", captureFraction: 0.75, transferEfficiency: 0.85, changedRule: "bond.maxSupportReleasePerTick only" }, summary, runs: results.sort((a, b) => a.condition.localeCompare(b.condition) || a.seed - b.seed) }, null, 2));
}
