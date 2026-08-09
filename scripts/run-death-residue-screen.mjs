import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const CONDITIONS = [
  { id: "control", enabled: false, fraction: 0 },
  { id: "low-residue", enabled: true, fraction: 0.04 },
  { id: "moderate-residue", enabled: true, fraction: 0.08 }
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
  const episodes = simulation.componentEpisodes.filter((episode) => episode.endedTick !== null);
  const completions = episodes.filter((episode) => episode.outcome === "next-gate-completion");
  return { condition: condition.id, seed, population: simulation.organisms.length, residueCreated: simulation.deathResidueCreated, residueRecovered: simulation.deathResidueRecovered, episodes: completions };
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
    const episodes = runs.flatMap((result) => result.episodes);
    return {
      condition: condition.id, runs: runs.length, episodes: episodes.length,
      meanPopulation: mean(runs, "population"), meanResidueCreated: mean(runs, "residueCreated"), meanResidueRecovered: mean(runs, "residueRecovered"),
      meanWholeEpisodeEnergyDelta: mean(episodes, "componentEnergyDelta"),
      positiveWholeEpisodeFraction: episodes.length ? Number((episodes.filter((episode) => episode.componentEnergyDelta > 0).length / episodes.length).toFixed(3)) : 0,
      meanMigrationTicks: mean(episodes, "migrationTicks")
    };
  });
  console.log(JSON.stringify({ protocol: { ticks: TICKS, seeds: SEEDS, changedRule: "death-residue fraction only" }, summary }, null, 2));
}
