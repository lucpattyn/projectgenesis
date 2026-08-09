import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

// Distinguishes visually separate strong triangle groups from overlapping triangle cliques.
const CONDITIONS = [
  { id: "earlier-gate-regime", gateCount: 4, navigation: false, stock: 9999 },
  { id: "distributed-finite-gates-no-navigation", gateCount: 7, navigation: false, stock: 18 },
  { id: "current-navigation-regime", gateCount: 7, navigation: true, stock: 18 }
];
const SEEDS = [160103, 160104, 160105];
const TICKS = 250;

function measureOrganization(simulation) {
  const strongFacets = simulation.getFacets().filter((facet) => simulation.getFacetStrength(facet.memberIds) >= simulation.config.facet.minimumBondStrength);
  const strongFacetKeys = new Set(strongFacets.map((facet) => facet.key));
  const groups = simulation.getBondGroups();
  const structuralGroups = groups.filter((group) => strongFacets.some((facet) => facet.memberIds.every((id) => group.includes(id))));
  const isolatedTriangles = structuralGroups.filter((group) => {
    if (group.length !== 3) return false;
    const key = simulation.facetKey(group);
    return strongFacetKeys.has(key);
  });
  return {
    strongFacets: strongFacets.length,
    distinctStructuralGroups: structuralGroups.length,
    isolatedTriangles: isolatedTriangles.length,
    meanMembersPerStructuralGroup: structuralGroups.length
      ? Number((structuralGroups.reduce((sum, group) => sum + group.length, 0) / structuralGroups.length).toFixed(2))
      : 0
  };
}

function run({ condition, seed }) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.config.collectiveWork.gateCount = condition.gateCount;
  simulation.config.collectiveWork.navigation.enabled = condition.navigation;
  simulation.config.collectiveWork.gateEnergyStock = condition.stock;
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  return { condition: condition.id, seed, population: simulation.organisms.length, bonds: simulation.bonds.size, ...measureOrganization(simulation) };
}

if (!isMainThread) {
  parentPort.postMessage(run(workerData));
} else {
  const tasks = CONDITIONS.flatMap((condition) => SEEDS.map((seed) => ({ condition, seed })));
  const results = [];
  let cursor = 0;
  await new Promise((resolve, reject) => {
    const launch = () => {
      if (cursor >= tasks.length) return results.length === tasks.length ? resolve() : undefined;
      const worker = new Worker(new URL(import.meta.url), { workerData: tasks[cursor++] });
      worker.once("message", (result) => { results.push(result); launch(); });
      worker.once("error", reject);
    };
    for (let index = 0; index < Math.min(3, tasks.length); index += 1) launch();
  });
  const metrics = ["population", "bonds", "strongFacets", "distinctStructuralGroups", "isolatedTriangles", "meanMembersPerStructuralGroup"];
  const mean = (records, metric) => Number((records.reduce((sum, record) => sum + record[metric], 0) / records.length).toFixed(2));
  const summary = CONDITIONS.map((condition) => {
    const records = results.filter((result) => result.condition === condition.id);
    return { condition: condition.id, runs: records.length, ...Object.fromEntries(metrics.map((metric) => [`mean${metric[0].toUpperCase()}${metric.slice(1)}`, mean(records, metric)])) };
  });
  console.log(JSON.stringify({ protocol: { ticks: TICKS, seeds: SEEDS, conditions: CONDITIONS }, summary, runs: results.sort((a, b) => a.condition.localeCompare(b.condition) || a.seed - b.seed) }, null, 2));
}
