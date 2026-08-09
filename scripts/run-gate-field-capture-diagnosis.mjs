import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160103, 160104, 160105];
const TICKS = 300;

function run(seed) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  return {
    seed,
    population: simulation.organisms.length,
    strongFacets: simulation.getFacets().filter((facet) => simulation.getFacetStrength(facet.memberIds) >= simulation.config.facet.minimumBondStrength).length,
    gateCompletions: simulation.collectiveWorkCompletions,
    ...simulation.getGateCaptureDiagnostics()
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
  const total = (metric) => results.reduce((sum, result) => sum + result[metric], 0);
  const harvested = total("harvested");
  const capture = total("harvestedByResponsibleMemberAtRelease");
  const competitor = total("harvestedByCompetitor");
  const weightedMean = (metric) => harvested ? Number((results.reduce((sum, result) => sum + result[metric] * result.harvested, 0) / harvested).toFixed(2)) : 0;
  console.log(JSON.stringify({
    protocol: { ticks: TICKS, seeds: SEEDS, ecology: "current live finite-gate defaults" },
    aggregate: {
      released: total("released"), harvested, unharvested: total("unharvested"),
      responsibleMemberHarvests: capture, competitorHarvests: competitor,
      responsibleMemberCaptureFraction: harvested ? Number((capture / harvested).toFixed(3)) : 0,
      meanHarvestDelayTicks: weightedMean("meanHarvestDelayTicks"),
      meanCompetitorDistanceFromResponsibleMember: weightedMean("meanCompetitorDistanceFromResponsibleMember")
    },
    runs: results.sort((a, b) => a.seed - b.seed)
  }, null, 2));
}
