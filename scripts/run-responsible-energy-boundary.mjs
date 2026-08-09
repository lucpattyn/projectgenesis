import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const CONDITIONS = [
  { id: "open-sharing-control", prioritize: false },
  { id: "responsible-field-boundary", prioritize: true }
];
const SEEDS = [160103, 160104, 160105];
const TICKS = 1000;

function run({ condition, seed }) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.config.collectiveWork.prioritizeResponsibleFacetEnergy = condition.prioritize;
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  const cycles = simulation.gateFieldCycles.filter((cycle) => cycle.endedTick !== null);
  return { condition: condition.id, seed, population: simulation.organisms.length, cycles };
}

if (!isMainThread) {
  parentPort.postMessage(run(workerData));
} else {
  const tasks = CONDITIONS.flatMap((condition) => SEEDS.map((seed) => ({ condition, seed })));
  const results = [];
  await Promise.all(tasks.map((task) => new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), { workerData: task });
    worker.once("message", (result) => { results.push(result); resolve(); });
    worker.once("error", reject);
  })));
  const mean = (records, key) => records.length ? Number((records.reduce((sum, record) => sum + record[key], 0) / records.length).toFixed(3)) : 0;
  const summary = CONDITIONS.map((condition) => {
    const runs = results.filter((result) => result.condition === condition.id);
    const cycles = runs.flatMap((result) => result.cycles);
    return {
      condition: condition.id, runs: runs.length, cycles: cycles.length,
      meanPopulation: mean(runs, "population"),
      meanStructuralEnergyDelta: mean(cycles, "totalStructuralEnergyDelta"),
      meanMemberEnergyDelta: mean(cycles, "memberEnergyDelta"),
      meanGateIncome: mean(cycles, "gateIncome"),
      meanActionCosts: mean(cycles, "totalActionCosts"),
      meanExternalFacetSharing: mean(cycles, "externalFacetSharingAllocation"),
      meanExternalBondAllocation: mean(cycles, "externalBondReserveAllocation"),
      positiveStructuralCycles: cycles.length ? Number((cycles.filter((cycle) => cycle.totalStructuralEnergyDelta > 0).length / cycles.length).toFixed(3)) : 0
    };
  });
  console.log(JSON.stringify({ protocol: { ticks: TICKS, seeds: SEEDS, changedRule: "collectiveWork.prioritizeResponsibleFacetEnergy only" }, summary }, null, 2));
}
