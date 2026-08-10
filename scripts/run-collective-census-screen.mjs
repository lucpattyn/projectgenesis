import { Simulation } from "../server/simulation/simulation.js";

const seed = Number(process.env.GENESIS_SEED ?? 160103);
const ticks = Number(process.env.GENESIS_TICKS ?? 250);
const cadenceTicks = Number(process.env.GENESIS_CENSUS_CADENCE ?? 20);
const simulation = new Simulation();
simulation.stop();
simulation.setSeed(seed);
simulation.config.collectiveWork.collectiveCensus.cadenceTicks = Math.max(1, Math.floor(cadenceTicks));
for (let tick = 0; tick < ticks; tick += 1) simulation.step();

const census = simulation.getCollectiveCensusDiagnostics();
const lineages = simulation.getCollectiveLineageDiagnostics();
const mean = (values) => values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3)) : 0;
const latest = census.latest;
console.log(JSON.stringify({
  protocol: { seed, ticks, cadenceTicks: census.cadenceTicks, purpose: "strong-facet census plus conservative one-to-one collective-lineage matching" },
  records: { total: census.totalRecords, latestTick: census.latestTick, latestComponents: latest.length },
  lineages: {
    total: lineages.totalLineages,
    active: lineages.activeLineages,
    ended: lineages.endedLineages,
    persistedAfterFoundersDied: lineages.persistedAfterFoundersDied,
    recentEvents: lineages.recentEvents.slice(-12),
    longest: [...lineages.summaries]
      .sort((first, second) => second.lifetimeTicks - first.lifetimeTicks || second.sampleCount - first.sampleCount)
      .slice(0, 5)
      .map(({ recentHistory, ...summary }) => summary)
  },
  latestMeans: {
    members: mean(latest.map((record) => record.memberCount)),
    bonds: mean(latest.map((record) => record.topology.bondCount)),
    strongFacets: mean(latest.map((record) => record.strongFacetCount)),
    bondDensity: mean(latest.map((record) => record.topology.bondDensity)),
    cycleRank: mean(latest.map((record) => record.topology.cycleRank)),
    bridgeCount: mean(latest.map((record) => record.topology.bridgeCount)),
    branchPoints: mean(latest.map((record) => record.topology.branchPointCount)),
    diameter: mean(latest.map((record) => record.topology.diameter)),
    energy: mean(latest.map((record) => record.energy))
  },
  largestComponents: [...latest]
    .sort((first, second) => second.memberCount - first.memberCount || second.strongFacetCount - first.strongFacetCount)
    .slice(0, 5)
}, null, 2));
