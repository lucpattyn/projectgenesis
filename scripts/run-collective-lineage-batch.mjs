import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Simulation } from "../server/simulation/simulation.js";

const ticks = Number(process.env.GENESIS_TICKS ?? 2000);
const cadenceTicks = Math.max(20, Number(process.env.GENESIS_CENSUS_CADENCE ?? 100));
const checkpointTicks = Math.max(cadenceTicks, Number(process.env.GENESIS_CHECKPOINT_TICKS ?? 200));
const seeds = (process.env.GENESIS_SEEDS ?? "160103,160104,160105")
  .split(",")
  .map((value) => Number(value.trim()))
  .filter(Number.isFinite);
const outputPath = resolve(process.cwd(), process.env.GENESIS_OUTPUT_PATH ?? "research-results/collective-lineage-batch.json");

function lineageSummary(simulation) {
  const diagnostics = simulation.getCollectiveLineageDiagnostics();
  return {
    total: diagnostics.totalLineages,
    active: diagnostics.activeLineages,
    ended: diagnostics.endedLineages,
    persistedAfterFoundersDied: diagnostics.persistedAfterFoundersDied,
    longest: diagnostics.summaries
      .slice()
      .sort((first, second) => second.lifetimeTicks - first.lifetimeTicks || second.sampleCount - first.sampleCount)
      .slice(0, 10)
      .map(({ recentHistory, ...lineage }) => lineage)
  };
}

function checkpoint(simulation) {
  return {
    tick: simulation.simulationTicks,
    population: simulation.organisms.filter((organism) => organism.alive).length,
    bonds: simulation.bonds.size,
    births: simulation.births,
    deaths: simulation.deaths,
    collectiveLineages: lineageSummary(simulation)
  };
}

function configureBatchObservation(simulation) {
  simulation.setHeadlessObservationMode(true);
  const census = simulation.config.collectiveWork.collectiveCensus;
  census.cadenceTicks = cadenceTicks;
  census.maximumRecords = Math.max(120, Math.ceil(ticks / cadenceTicks) * 20);
  census.detailLevel = "lightweight";
  census.lightweightBondSampleLimit = 48;
  census.topologyPathSourceLimit = 0;
  simulation.config.collectiveWork.collectiveLineageTracking.maximumHistoryPerLineage = 8;
  simulation.config.collectiveWork.collectiveLineageTracking.maximumEvents = 2000;
}

async function runSeed(seed) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  configureBatchObservation(simulation);
  const checkpoints = [];
  for (let index = 0; index < ticks; index += 1) {
    simulation.step();
    if (simulation.simulationTicks % checkpointTicks === 0) checkpoints.push(checkpoint(simulation));
  }
  return { seed, checkpoints, final: checkpoint(simulation) };
}

const results = [];
for (const seed of seeds) results.push(await runSeed(seed));

const report = {
  protocol: {
    ticks,
    seeds,
    censusCadenceTicks: cadenceTicks,
    checkpointTicks,
    execution: "headless sequential batch; no UI server or canvas-only observation state",
    lineageEvidence: "member/direct-offspring continuity, sampled shared bonds, facet overlap, and spatial continuity",
    topology: "lightweight lineage mode; ecology and bond/gate rules unchanged"
  },
  results
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, protocol: report.protocol, results: results.map(({ seed, final }) => ({ seed, final })) }, null, 2));
