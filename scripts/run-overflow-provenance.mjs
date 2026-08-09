import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160103, 160104, 160105];
const TICKS = 1000;

function run(seed) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  return { seed, population: simulation.organisms.length, diagnostics: simulation.getOverflowProvenanceDiagnostics() };
}

function addGroups(target, source) {
  for (const [key, value] of Object.entries(source)) target[key] = (target[key] ?? 0) + value;
}

if (!isMainThread) {
  parentPort.postMessage(run(workerData.seed));
} else {
  const results = [];
  await Promise.all(SEEDS.map((seed) => new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), { workerData: { seed } });
    worker.once("message", (result) => { results.push(result); resolve(); });
    worker.once("error", reject);
  })));
  const aggregate = { totalDiscarded: 0, byPhase: {}, byOrigin: {}, byResource: {}, deathsAfterOverflow: [] };
  for (const result of results) {
    aggregate.totalDiscarded += result.diagnostics.totalDiscarded;
    addGroups(aggregate.byPhase, result.diagnostics.byPhase);
    addGroups(aggregate.byOrigin, result.diagnostics.byOrigin);
    addGroups(aggregate.byResource, result.diagnostics.byResource);
    aggregate.deathsAfterOverflow.push(...result.diagnostics.deathsAfterOverflow);
  }
  aggregate.totalDiscarded = Number(aggregate.totalDiscarded.toFixed(3));
  for (const group of [aggregate.byPhase, aggregate.byOrigin, aggregate.byResource]) {
    for (const [key, value] of Object.entries(group)) group[key] = Number(value.toFixed(3));
  }
  const deathsWithPriorOverflow = aggregate.deathsAfterOverflow.filter((death) => death.priorOverflow > 0);
  console.log(JSON.stringify({
    protocol: { seeds: SEEDS, ticks: TICKS, ecology: "live collective-stride default", intervention: "observation only" },
    perSeed: results.map(({ seed, population, diagnostics }) => ({
      seed,
      population,
      totalDiscarded: diagnostics.totalDiscarded,
      topTenPercentOrganismShare: diagnostics.topTenPercentOrganismShare,
      topTenPercentComponentShare: diagnostics.topTenPercentComponentShare,
      topOrganisms: diagnostics.topOrganisms.slice(0, 3),
      topComponents: diagnostics.topComponents.slice(0, 3)
    })),
    aggregate: {
      ...aggregate,
      deathsRecorded: aggregate.deathsAfterOverflow.length,
      deathsWithPriorOverflow: deathsWithPriorOverflow.length,
      meanPriorOverflowBeforeDeath: deathsWithPriorOverflow.length
        ? Number((deathsWithPriorOverflow.reduce((sum, death) => sum + death.priorOverflow, 0) / deathsWithPriorOverflow.length).toFixed(3))
        : 0
    }
  }, null, 2));
}
