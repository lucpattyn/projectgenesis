import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const capacityMultipliers = (process.env.CAPACITY_MULTIPLIERS ?? "1,2,4")
  .split(",").map(Number).filter((value) => Number.isFinite(value) && value > 0);
const CONDITIONS = capacityMultipliers.map((capacityMultiplier) => ({
  id: capacityMultiplier === 1 ? "baseline" : `capacity-${capacityMultiplier}x`,
  capacityMultiplier
}));
const REPLICATES = Math.max(1, Math.round(Number(process.env.REPLICATES ?? 8)));
const SEEDS = Array.from({ length: REPLICATES }, (_, index) => 160103 + index);
const TICKS = Math.max(100, Math.round(Number(process.env.TICKS ?? 2000)));

function mean(records, key) {
  return Number((records.reduce((total, record) => total + record[key], 0) / records.length).toFixed(2));
}

function run(task) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(task.seed);
  simulation.config.organism.energyCapacityMultiplier = task.condition.capacityMultiplier;
  let lastFacetTick = 0;
  for (let tick = 1; tick <= TICKS; tick += 1) {
    simulation.step();
    if (simulation.getFacets().length > 0) lastFacetTick = tick;
  }
  const economics = simulation.energyEconomicsSnapshot();
  return {
    condition: task.condition.id,
    seed: task.seed,
    finalPopulation: simulation.organisms.length,
    survived: simulation.organisms.length > 0 ? 1 : 0,
    finalBonds: simulation.bonds.size,
    finalFacets: simulation.getFacets().length,
    lastFacetTick,
    births: simulation.births,
    gateCompletions: simulation.collectiveWorkCompletions,
    foodIncome: economics.income.food,
    gateIncome: economics.income.gateWork,
    actionCosts: economics.totalExpenses,
    capacityOverflow: economics.losses.capacityOverflow,
    deathStoredEnergy: economics.losses.deathStoredEnergy,
    reproductionAllocation: economics.allocations.reproduction,
    energyExhaustionDeaths: economics.deathCauses["energy exhaustion"] ?? 0,
    maximumAgeDeaths: economics.deathCauses["maximum age"] ?? 0
  };
}

if (!isMainThread) {
  parentPort.postMessage(run(workerData));
} else {
  const tasks = CONDITIONS.flatMap((condition) => SEEDS.map((seed) => ({ condition, seed })));
  const results = [];
  let cursor = 0;
  const workers = Math.min(4, tasks.length);
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
    for (let index = 0; index < workers; index += 1) launch();
  });
  const summary = CONDITIONS.map((condition) => {
    const records = results.filter((result) => result.condition === condition.id);
    return {
      condition: condition.id,
      capacityMultiplier: condition.capacityMultiplier,
      runs: records.length,
      survivors: records.reduce((total, record) => total + record.survived, 0),
      meanFinalPopulation: mean(records, "finalPopulation"),
      meanLastFacetTick: mean(records, "lastFacetTick"),
      meanGateCompletions: mean(records, "gateCompletions"),
      meanBirths: mean(records, "births"),
      meanCapacityOverflow: mean(records, "capacityOverflow"),
      meanReproductionAllocation: mean(records, "reproductionAllocation"),
      meanEnergyExhaustionDeaths: mean(records, "energyExhaustionDeaths"),
      meanMaximumAgeDeaths: mean(records, "maximumAgeDeaths")
    };
  });
  console.log(JSON.stringify({ protocol: { seeds: SEEDS, ticks: TICKS, changedRule: "organism.energyCapacityMultiplier only" }, summary, runs: results.sort((a, b) => a.condition.localeCompare(b.condition) || a.seed - b.seed) }, null, 2));
}
