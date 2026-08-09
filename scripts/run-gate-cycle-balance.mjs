import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160103, 160104, 160105];
const TICKS = 1000;

function run(seed) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  return {
    seed,
    population: simulation.organisms.length,
    cycles: simulation.gateFieldCycles.filter((cycle) => cycle.endedTick !== null)
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
  const allCompleted = results.flatMap((result) => result.cycles);
  const mean = (records, key) => records.length ? Number((records.reduce((sum, record) => sum + record[key], 0) / records.length).toFixed(3)) : 0;
  console.log(JSON.stringify({
    protocol: { ticks: TICKS, seeds: SEEDS, ecology: "current live finite-gate defaults", scope: "active field phase including internal bond-reserve maintenance; excludes post-field migration" },
    summary: {
      completedCycles: allCompleted.length,
      meanCycleDurationTicks: mean(allCompleted, "durationTicks"),
      meanGateIncome: mean(allCompleted, "gateIncome"),
      meanActionCosts: mean(allCompleted, "totalActionCosts"),
      meanNetGateBalance: mean(allCompleted, "netGateBalance"),
      meanMemberEnergyDelta: mean(allCompleted, "memberEnergyDelta"),
      meanTotalStructuralEnergyDelta: mean(allCompleted, "totalStructuralEnergyDelta"),
      meanCapacityOverflow: mean(allCompleted, "capacityOverflow"),
      meanBondReserveAllocation: mean(allCompleted, "bondReserveAllocation"),
      meanExternalBondReserveAllocation: mean(allCompleted, "externalBondReserveAllocation"),
      meanFacetSharingAllocation: mean(allCompleted, "facetSharingAllocation"),
      meanExternalFacetSharingAllocation: mean(allCompleted, "externalFacetSharingAllocation"),
      meanFacetCapitalGenerated: mean(allCompleted, "facetCapitalGenerated"),
      positiveBalanceFraction: allCompleted.length ? Number((allCompleted.filter((cycle) => cycle.netGateBalance > 0).length / allCompleted.length).toFixed(3)) : 0,
      caveat: "This is the active field phase including internal bond-reserve maintenance; it excludes the journey from an exhausted field to the next gate."
    },
    runs: results.sort((a, b) => a.seed - b.seed)
  }, null, 2));
}
