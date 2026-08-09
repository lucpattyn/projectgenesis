import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const CONDITIONS = [
  { id: "control", enabled: false },
  { id: "collective-stride-35-percent", enabled: true }
];
const SEEDS = (process.env.GENESIS_SEEDS ?? "160103,160104,160105").split(",").map(Number);
const TICKS = 1000;

function run({ condition, seed }) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.config.collectiveWork.collectiveStride.enabled = condition.enabled;
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  return {
    condition: condition.id,
    seed,
    population: simulation.organisms.length,
    episodes: simulation.componentEpisodes.filter((episode) => episode.outcome === "next-gate-completion")
  };
}

function mean(records, get) {
  return records.length ? Number((records.reduce((sum, record) => sum + get(record), 0) / records.length).toFixed(3)) : 0;
}

function summarize(condition, results) {
  const runs = results.filter((result) => result.condition === condition.id);
  const episodes = runs.flatMap((result) => result.episodes);
  const expense = (key) => mean(episodes, (episode) => episode.migration.expenses[key] ?? 0);
  return {
    condition: condition.id,
    runs: runs.length,
    completedMigrationEpisodes: episodes.length,
    meanPopulation: mean(runs, (run) => run.population),
    meanWholeEpisodeEnergyDelta: mean(episodes, (episode) => episode.componentEnergyDelta),
    positiveWholeEpisodeFraction: episodes.length ? Number((episodes.filter((episode) => episode.componentEnergyDelta > 0).length / episodes.length).toFixed(3)) : 0,
    meanMigrationTicks: mean(episodes, (episode) => episode.migrationTicks),
    meanMigrationOperationalBalance: mean(episodes, (episode) => episode.migration.netOperationalBalance),
    migrationMovementCost: expense("movement"),
    movementCostPerMigrationTick: episodes.length
      ? Number((episodes.reduce((sum, episode) => sum + (episode.migration.expenses.movement ?? 0), 0) / episodes.reduce((sum, episode) => sum + episode.migrationTicks, 0)).toFixed(3))
      : 0,
    migrationComponentUpkeep: expense("bonds") + expense("reserveMaintenance"),
    migrationOverflow: mean(episodes, (episode) => episode.migration.losses.capacityOverflow),
    migrationIncome: mean(episodes, (episode) => episode.migration.totalIncome)
  };
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
  console.log(JSON.stringify({
    protocol: {
      ticks: TICKS,
      seeds: SEEDS,
      changedRule: "only gate-seeking connected components of at least three members pay 65% of normal movement cost",
      default: "disabled"
    },
    summary: CONDITIONS.map((condition) => summarize(condition, results))
  }, null, 2));
}
