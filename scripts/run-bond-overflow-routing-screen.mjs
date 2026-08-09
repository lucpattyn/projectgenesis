import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const CONDITIONS = [
  { id: "overflow-control", mode: "disabled", captureFraction: 0 },
  { id: "weakest-bond-routing", mode: "bond", captureFraction: 0.35 }
];
const SEEDS = [160103, 160104, 160105];
const TICKS = 1000;

function run({ condition, seed }) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.config.overflowCapture.mode = condition.mode;
  simulation.config.overflowCapture.captureFraction = condition.captureFraction;
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  const facets = simulation.getFacets().filter((facet) => simulation.getFacetStrength(facet.memberIds) >= simulation.config.facet.minimumBondStrength);
  const episodes = simulation.componentEpisodes.filter((episode) => episode.outcome === "next-gate-completion");
  const overflow = simulation.getOverflowProvenanceDiagnostics();
  return {
    condition: condition.id,
    seed,
    population: simulation.organisms.length,
    bonds: simulation.bonds.size,
    strongFacets: facets.length,
    gateCompletions: simulation.collectiveWorkCompletions,
    discardedOverflow: overflow.totalDiscarded,
    routedOverflow: simulation.structuralOverflowCaptured,
    routingEvents: simulation.overflowRoutingRecords.length,
    episodes
  };
}

function mean(records, get) {
  return records.length ? Number((records.reduce((sum, record) => sum + get(record), 0) / records.length).toFixed(3)) : 0;
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
  const summary = CONDITIONS.map((condition) => {
    const runs = results.filter((result) => result.condition === condition.id);
    const episodes = runs.flatMap((run) => run.episodes);
    return {
      condition: condition.id,
      runs: runs.length,
      meanPopulation: mean(runs, (run) => run.population),
      meanBonds: mean(runs, (run) => run.bonds),
      meanStrongFacets: mean(runs, (run) => run.strongFacets),
      meanGateCompletions: mean(runs, (run) => run.gateCompletions),
      meanDiscardedOverflow: mean(runs, (run) => run.discardedOverflow),
      meanRoutedOverflow: mean(runs, (run) => run.routedOverflow),
      meanRoutingEvents: mean(runs, (run) => run.routingEvents),
      meanWholeEpisodeEnergyDelta: mean(episodes, (episode) => episode.componentEnergyDelta),
      positiveWholeEpisodeFraction: episodes.length ? Number((episodes.filter((episode) => episode.componentEnergyDelta > 0).length / episodes.length).toFixed(3)) : 0
    };
  });
  console.log(JSON.stringify({
    protocol: { ticks: TICKS, seeds: SEEDS, changedRule: "35% of would-be harvest overflow is routed at 85% efficiency into the harvester's weakest existing bonds", default: "disabled" },
    summary
  }, null, 2));
}
