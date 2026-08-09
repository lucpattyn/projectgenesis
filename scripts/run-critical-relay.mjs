import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const CONDITIONS = [
  { id: "direct-only", relayEnabled: false },
  { id: "critical-one-hop-relay", relayEnabled: true }
];
const SEEDS = [160103, 160104, 160105];
const TICKS = 400;

function run({ condition, seed }) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  simulation.config.bond.relayEnabled = condition.relayEnabled;
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  const economics = simulation.energyEconomicsSnapshot();
  const deaths = simulation.starvationDiagnostics;
  return {
    condition: condition.id,
    seed,
    population: simulation.organisms.length,
    bonds: simulation.bonds.size,
    facets: simulation.getFacets().length,
    births: simulation.births,
    gateCompletions: simulation.collectiveWorkCompletions,
    starvationDeaths: economics.deathCauses["energy exhaustion"] ?? 0,
    strandedDeaths: deaths.filter((death) => death.strandedFromComponent).length,
    relayTransfers: simulation.bondRelayTransfers,
    relayDelivered: simulation.bondRelayEnergyDelivered,
    relayRescues: simulation.bondRelayRescues,
    relayLoss: economics.losses.relayTransfer ?? 0
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
    return Object.fromEntries(["population", "bonds", "facets", "births", "gateCompletions", "starvationDeaths", "strandedDeaths", "relayTransfers", "relayDelivered", "relayRescues", "relayLoss"]
      .map((key) => [`mean${key[0].toUpperCase()}${key.slice(1)}`, mean(records, key)]).concat([["condition", condition.id], ["runs", records.length]]));
  });
  console.log(JSON.stringify({ protocol: { ticks: TICKS, seeds: SEEDS, relayCriticalEnergy: 2, maxRelayPerTick: 0.5, relayLossFraction: 0.2, changedRule: "bond.relayEnabled only" }, summary, runs: results.sort((a, b) => a.condition.localeCompare(b.condition) || a.seed - b.seed) }, null, 2));
}
