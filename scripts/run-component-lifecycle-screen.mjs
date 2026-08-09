import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const CONDITIONS = [
  { id: "current-control", enabled: false },
  {
    id: "bounded-conserve-migrate",
    enabled: true,
    policy: {
      depletionFieldStrength: 0.25,
      maxDwellTicksAfterDepletion: 18,
      conserveMinimumMeanEnergyFraction: 0.55
    }
  },
  {
    id: "bounded-migration-transport",
    enabled: true,
    transport: true,
    policy: {
      depletionFieldStrength: 0.25,
      maxDwellTicksAfterDepletion: 18,
      conserveMinimumMeanEnergyFraction: 0.55
    }
  }
].filter((condition) => {
  const selected = process.env.GENESIS_CONDITIONS;
  return !selected || selected.split(",").includes(condition.id);
});
const SEEDS = (process.env.GENESIS_SEEDS ?? "160103,160104")
  .split(",")
  .map((value) => Number(value.trim()))
  .filter(Number.isFinite);
const TICKS = Number(process.env.GENESIS_TICKS ?? 500);

function mean(records, get) {
  return records.length ? Number((records.reduce((sum, record) => sum + get(record), 0) / records.length).toFixed(3)) : 0;
}

function run({ condition, seed }) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.config.collectiveWork.componentLifecycle.enabled = condition.enabled;
  simulation.config.collectiveWork.migrationTransport.enabled = Boolean(condition.transport);
  Object.assign(simulation.config.collectiveWork.componentLifecycle, condition.policy ?? {});
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
    lifecycleDeferrals: simulation.componentLifecycleDeferrals,
    lifecycleMigrationMoves: simulation.componentLifecycleMigrations,
    meanWholeEpisodeEnergyDelta: mean(episodes, (episode) => episode.componentEnergyDelta),
    positiveWholeEpisodeFraction: episodes.length ? Number((episodes.filter((episode) => episode.componentEnergyDelta > 0).length / episodes.length).toFixed(3)) : 0,
    phaseDiagnostics: simulation.getComponentEpisodeDiagnostics().phaseDiagnostics
  };
}

if (!isMainThread) {
  parentPort.postMessage(run(workerData));
} else {
  const results = [];
  await Promise.all(CONDITIONS.flatMap((condition) => SEEDS.map((seed) => new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), { workerData: { condition, seed } });
    worker.once("message", (result) => { results.push(result); resolve(); });
    worker.once("error", reject);
  }))));
  console.log(JSON.stringify({
    protocol: {
      ticks: TICKS, seeds: SEEDS,
      changedRule: "strong components conserve ordinary food for a bounded interval after their assigned gate weakens, then release it and navigate toward another available gate",
      default: "disabled"
    },
    summary: CONDITIONS.map((condition) => {
      const runs = results.filter((result) => result.condition === condition.id);
      return {
        condition: condition.id,
        ...Object.fromEntries(Object.keys(runs[0]).filter((key) => !["condition", "seed", "phaseDiagnostics"].includes(key)).map((key) => [key, mean(runs, (run) => run[key])])),
        phaseDiagnostics: Object.fromEntries(["harvest", "conservation", "migration", "arrival"].map((phase) => [phase, {
          meanIncome: mean(runs, (run) => run.phaseDiagnostics[phase].meanIncome),
          meanExpenses: mean(runs, (run) => run.phaseDiagnostics[phase].meanExpenses),
          meanNetOperationalBalance: mean(runs, (run) => run.phaseDiagnostics[phase].meanNetOperationalBalance),
          meanDeferredOrdinaryHarvests: mean(runs, (run) => run.phaseDiagnostics[phase].meanDeferredOrdinaryHarvests),
          episodesObserved: mean(runs, (run) => run.phaseDiagnostics[phase].episodesObserved)
        }]))
      };
    })
  }, null, 2));
}
