import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

// Phase 16 gate-logistics screen: navigation answers "can facets arrive?";
// the start-up contract answers "can a successful arrival fund its first interval?"
const CONDITIONS = [
  { id: "control", navigation: false, startupFoodUnits: 1 },
  { id: "navigation-only", navigation: true, startupFoodUnits: 1 },
  { id: "navigation-plus-contract", navigation: true, startupFoodUnits: 3 }
];
const SEEDS = [160103, 160104, 160105];
const TICKS = 300;

function run({ condition, seed }) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  simulation.config.collectiveWork.navigation.enabled = condition.navigation;
  simulation.config.collectiveWork.gateStartupFoodUnits = condition.startupFoodUnits;
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  return {
    condition: condition.id,
    seed,
    population: simulation.organisms.length,
    bonds: simulation.bonds.size,
    facets: simulation.getFacets().filter((facet) => simulation.getFacetStrength(facet.memberIds) >= simulation.config.facet.minimumBondStrength).length,
    navigationMoves: simulation.collectiveGateNavigationMoves,
    gateArrivals: simulation.collectiveGateArrivals,
    gateCompletions: simulation.collectiveWorkCompletions,
    fieldHarvests: simulation.collectiveWorkFieldHarvests,
    workerHarvests: simulation.collectiveWorkFieldHarvestsByWorkers,
    foodReleased: simulation.collectiveWorkFoodReleased,
    births: simulation.births
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
  const mean = (records, key) => Number((records.reduce((sum, record) => sum + record[key], 0) / records.length).toFixed(2));
  const metrics = ["population", "bonds", "facets", "navigationMoves", "gateArrivals", "gateCompletions", "fieldHarvests", "workerHarvests", "foodReleased", "births"];
  const summary = CONDITIONS.map((condition) => {
    const records = results.filter((result) => result.condition === condition.id);
    return { condition: condition.id, runs: records.length, ...Object.fromEntries(metrics.map((metric) => [`mean${metric[0].toUpperCase()}${metric.slice(1)}`, mean(records, metric)])) };
  });
  console.log(JSON.stringify({ protocol: { ticks: TICKS, seeds: SEEDS, conditions: CONDITIONS }, summary, runs: results.sort((a, b) => a.condition.localeCompare(b.condition) || a.seed - b.seed) }, null, 2));
}
