import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const CONDITIONS = [
  { id: "control", enabled: false, fraction: 0 },
  { id: "eight-percent-residue", enabled: true, fraction: 0.08 }
];
const SEEDS = [160103, 160104, 160105];
const TICKS = 1000;

function run({ condition, seed }) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.config.chemistry.deathResidueEnabled = condition.enabled;
  simulation.config.chemistry.deathResidueFraction = condition.fraction;
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  return {
    condition: condition.id,
    seed,
    population: simulation.organisms.length,
    residueCreated: simulation.deathResidueCreated,
    residueRecovered: simulation.deathResidueRecovered,
    episodes: simulation.componentEpisodes.filter((episode) => episode.outcome === "next-gate-completion")
  };
}

function mean(records, get) {
  return records.length ? Number((records.reduce((sum, record) => sum + get(record), 0) / records.length).toFixed(3)) : 0;
}

function summarize(condition, results) {
  const runs = results.filter((result) => result.condition === condition.id);
  const episodes = runs.flatMap((result) => result.episodes);
  const migration = (key) => mean(episodes, (episode) => episode.migration[key] ?? 0);
  const income = (key) => mean(episodes, (episode) => episode.migration.income[key] ?? 0);
  const expense = (key) => mean(episodes, (episode) => episode.migration.expenses[key] ?? 0);
  const transfer = (key) => mean(episodes, (episode) => episode.migration.transfers[key] ?? 0);
  return {
    condition: condition.id,
    runs: runs.length,
    completedMigrationEpisodes: episodes.length,
    meanPopulation: mean(runs, (run) => run.population),
    meanResidueCreated: mean(runs, (run) => run.residueCreated),
    meanResidueRecovered: mean(runs, (run) => run.residueRecovered),
    meanWholeEpisodeEnergyDelta: mean(episodes, (episode) => episode.componentEnergyDelta),
    positiveWholeEpisodeFraction: episodes.length ? Number((episodes.filter((episode) => episode.componentEnergyDelta > 0).length / episodes.length).toFixed(3)) : 0,
    meanMigrationTicks: mean(episodes, (episode) => episode.migrationTicks),
    meanMigrationOperationalBalance: migration("netOperationalBalance"),
    migrationIncome: { food: income("food"), gateWork: income("gateWork"), deathResidue: income("deathResidue"), total: migration("totalIncome") },
    migrationExpenses: {
      movement: expense("movement"),
      maintenance: expense("maintenance"),
      perception: expense("perception"),
      coupledMaintenance: expense("bonds"),
      bondReserveMaintenance: expense("reserveMaintenance"),
      signals: expense("signals"),
      memory: expense("memory"),
      unsuccessfulLocalMovement: expense("idle"),
      total: migration("totalExpenses")
    },
    migrationTransfers: { directSupport: transfer("directSupport"), relayReserve: transfer("relayReserve"), relayedSupport: transfer("relayedSupport") },
    meanMigrationCapacityOverflow: mean(episodes, (episode) => episode.migration.losses.capacityOverflow)
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
    protocol: { ticks: TICKS, seeds: SEEDS, changedRule: "death-residue 8% only", populationAtEnd: true },
    summary: CONDITIONS.map((condition) => summarize(condition, results))
  }, null, 2));
}
