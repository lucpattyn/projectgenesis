import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const CONDITIONS = [
  { id: "current-control", enabled: false },
  { id: "autonomous-facet-budding", enabled: true },
  {
    id: "budgeted-facet-budding",
    enabled: true,
    budget: {
      requirePositiveCompletedCycle: true,
      minimumComponentEnergy: 250,
      minimumCycleEnergyDelta: 15,
      completedCycleFreshnessTicks: 180,
      cooldownTicks: 120
    }
  }
].filter((condition) => {
  const selected = process.env.GENESIS_CONDITIONS;
  return !selected || selected.split(",").includes(condition.id);
});
// A fast causal screen. A longer persistence replication follows only if this
// shows a structural benefit rather than merely more births.
const SEEDS = (process.env.GENESIS_SEEDS ?? "160103,160104")
  .split(",")
  .map((value) => Number(value.trim()))
  .filter(Number.isFinite);
const TICKS = Number(process.env.GENESIS_TICKS ?? 500);

function run({ condition, seed }) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.config.facet.autonomousBudding.enabled = condition.enabled;
  Object.assign(simulation.config.facet.autonomousBudding, condition.budget ?? {});
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  const facets = simulation.getFacets().filter((facet) => simulation.getFacetStrength(facet.memberIds) >= simulation.config.facet.minimumBondStrength);
  const episodes = simulation.componentEpisodes.filter((episode) => episode.outcome === "next-gate-completion");
  return {
    condition: condition.id,
    seed,
    population: simulation.organisms.length,
    bonds: simulation.bonds.size,
    strongFacets: facets.length,
    gateCompletions: simulation.collectiveWorkCompletions,
    births: simulation.births,
    autonomousFacetBirths: simulation.autonomousFacetBirths,
    autonomousFacetBuddingDenied: simulation.autonomousFacetBuddingDenied,
    structuralBirths: simulation.structuralBirths,
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
      meanBirths: mean(runs, (run) => run.births),
      meanAutonomousFacetBirths: mean(runs, (run) => run.autonomousFacetBirths),
      meanBudgetDenials: mean(runs, (run) => run.autonomousFacetBuddingDenied.componentEnergy + run.autonomousFacetBuddingDenied.completedCycle),
      meanCooldownDenials: mean(runs, (run) => run.autonomousFacetBuddingDenied.cooldown),
      meanStructuralBirths: mean(runs, (run) => run.structuralBirths),
      meanWholeEpisodeEnergyDelta: mean(episodes, (episode) => episode.componentEnergyDelta),
      positiveWholeEpisodeFraction: episodes.length ? Number((episodes.filter((episode) => episode.componentEnergyDelta > 0).length / episodes.length).toFixed(3)) : 0
    };
  });
  console.log(JSON.stringify({
    protocol: { ticks: TICKS, seeds: SEEDS, changedRule: "strong facets may autonomously bud a local child after paying parent split plus reserve-funded two-bond triangle seed", default: "disabled" },
    summary
  }, null, 2));
}
