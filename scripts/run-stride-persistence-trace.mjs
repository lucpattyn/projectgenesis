import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160103, 160104, 160105];
const TICKS = 2000;
const INTERVAL = 200;
const STRIDE_ENABLED = process.env.GENESIS_STRIDE !== "false";

function sample(simulation) {
  const facets = simulation.getFacets();
  const strongFacets = facets.filter((facet) => simulation.getFacetStrength(facet.memberIds) >= simulation.config.facet.minimumBondStrength);
  const groupCount = simulation.getBondGroups().filter((ids) => ids.some((id) => strongFacets.some((facet) => facet.memberIds.includes(id)))).length;
  return {
    tick: simulation.simulationTicks,
    population: simulation.organisms.length,
    bonds: simulation.bonds.size,
    strongFacets: strongFacets.length,
    structuralGroups: groupCount,
    gateCompletions: simulation.collectiveWorkCompletions,
    capacityOverflow: Number(simulation.energyEconomics.losses.capacityOverflow.toFixed(1)),
    starvationDeaths: simulation.energyEconomics.deaths["energy exhaustion"] ?? 0
  };
}

function run(seed) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.config.collectiveWork.collectiveStride.enabled = STRIDE_ENABLED;
  simulation.setSeed(seed);
  const timeline = [sample(simulation)];
  for (let tick = 1; tick <= TICKS; tick += 1) {
    simulation.step();
    if (tick % INTERVAL === 0) timeline.push(sample(simulation));
  }
  return { seed, timeline };
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
  console.log(JSON.stringify({ protocol: { seeds: SEEDS, ticks: TICKS, collectiveStride: STRIDE_ENABLED }, results }, null, 2));
}
