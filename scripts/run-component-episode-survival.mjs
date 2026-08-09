import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160103, 160104, 160105];
const TICKS = 1000;

function run(seed) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  return { seed, episodes: simulation.componentEpisodes.filter((episode) => episode.endedTick !== null) };
}

if (!isMainThread) {
  parentPort.postMessage(run(workerData));
} else {
  const results = await Promise.all(SEEDS.map((seed) => new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), { workerData: seed });
    worker.once("message", resolve);
    worker.once("error", reject);
  })));
  const episodes = results.flatMap((result) => result.episodes);
  const completions = episodes.filter((episode) => episode.outcome === "next-gate-completion");
  const mean = (records, key) => records.length ? Number((records.reduce((sum, record) => sum + record[key], 0) / records.length).toFixed(3)) : 0;
  console.log(JSON.stringify({
    protocol: { ticks: TICKS, seeds: SEEDS, ecology: "current open-sharing finite-gate default", episode: "field start → field end → next completion or extinction" },
    summary: {
      completedEpisodes: episodes.length,
      nextGateCompletions: completions.length,
      originalMemberExtinctions: episodes.filter((episode) => episode.outcome === "original-members-extinct").length,
      completionFraction: episodes.length ? Number((completions.length / episodes.length).toFixed(3)) : 0,
      meanWholeEpisodeEnergyDelta: mean(completions, "componentEnergyDelta"),
      positiveWholeEpisodeFraction: completions.length ? Number((completions.filter((episode) => episode.componentEnergyDelta > 0).length / completions.length).toFixed(3)) : 0,
      meanMigrationTicks: mean(completions, "migrationTicks"),
      meanComponentSizeStart: mean(completions, "startMemberCount"),
      meanComponentSizeEnd: mean(completions, "endMemberCount")
    }
  }, null, 2));
}
