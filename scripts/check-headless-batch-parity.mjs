import { Simulation } from "../server/simulation/simulation.js";

const seed = Number(process.env.GENESIS_SEED ?? 160103);
const ticks = Number(process.env.GENESIS_TICKS ?? 500);
const cadenceTicks = Number(process.env.GENESIS_CENSUS_CADENCE ?? 20);

function configureObservation(simulation, headless) {
  simulation.config.collectiveWork.collectiveCensus.cadenceTicks = cadenceTicks;
  simulation.config.collectiveWork.collectiveCensus.detailLevel = headless ? "lightweight" : "full";
  if (headless) {
    simulation.setHeadlessObservationMode(true);
    simulation.config.collectiveWork.collectiveCensus.lightweightBondSampleLimit = 48;
    simulation.config.collectiveWork.collectiveLineageTracking.maximumHistoryPerLineage = 8;
  }
}

function measure(simulation) {
  const strongFacets = simulation.getFacets()
    .filter((facet) => simulation.getFacetStrength(facet.memberIds) >= simulation.config.collectiveWork.collectiveCensus.minimumFacetStrength);
  const lineages = simulation.getCollectiveLineageDiagnostics();
  return {
    population: simulation.organisms.filter((organism) => organism.alive).length,
    births: simulation.births,
    deaths: simulation.deaths,
    bonds: simulation.bonds.size,
    strongFacets: strongFacets.length,
    gateCompletions: simulation.collectiveWorkCompletions,
    gateFoodReleased: simulation.collectiveWorkFoodReleased,
    collectiveLineages: lineages.totalLineages,
    activeCollectiveLineages: lineages.activeLineages,
    founderReplacementLineages: lineages.persistedAfterFoundersDied
  };
}

function run(headless) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  configureObservation(simulation, headless);
  for (let index = 0; index < ticks; index += 1) simulation.step();
  return measure(simulation);
}

const normal = run(false);
const headless = run(true);
const mismatches = Object.keys(normal)
  .filter((key) => normal[key] !== headless[key])
  .map((key) => ({ metric: key, normal: normal[key], headless: headless[key] }));

console.log(JSON.stringify({
  protocol: {
    seed,
    ticks,
    cadenceTicks,
    normalObserver: "full topology plus canvas observation state",
    headlessObserver: "lightweight topology with canvas-only state omitted"
  },
  normal,
  headless,
  parity: { passed: mismatches.length === 0, mismatches }
}, null, 2));

if (mismatches.length) process.exitCode = 1;
