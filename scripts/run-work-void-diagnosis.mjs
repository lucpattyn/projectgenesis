import { Simulation } from "../server/simulation/simulation.js";

const seeds = (process.env.GENESIS_SEEDS ?? "160103,160104")
  .split(",")
  .map((value) => Number(value.trim()))
  .filter(Number.isFinite);
const ticks = Number(process.env.GENESIS_TICKS ?? 500);

function mean(values) {
  return values.length ? Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(3)) : 0;
}

function summarize(seed) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  for (let tick = 0; tick < ticks; tick += 1) simulation.step();

  const dark = [];
  const worked = [];
  const nearGate = (x, y) => Math.min(...simulation.workGates.map((gate) => Math.max(Math.abs(x - gate.x), Math.abs(y - gate.y))));
  for (let y = 0; y < simulation.world.height; y += 1) {
    for (let x = 0; x < simulation.world.width; x += 1) {
      const tile = simulation.world.getTile(x, y);
      const record = {
        gateDistance: nearGate(x, y),
        foodEnergy: tile.type === "FOOD" ? (tile.foodEnergy ?? 1) : 0,
        foodPresent: tile.type === "FOOD" ? 1 : 0
      };
      if (simulation.facetWorkTrail[y][x] === 0) dark.push(record);
      else worked.push(record);
    }
  }
  const metrics = (cells) => ({
    cells: cells.length,
    fraction: cells.length / (simulation.world.width * simulation.world.height),
    meanGateDistance: mean(cells.map((cell) => cell.gateDistance)),
    nearGateFraction: mean(cells.map((cell) => cell.gateDistance <= simulation.config.collectiveWork.navigation.detectionRadius ? 1 : 0)),
    foodFraction: mean(cells.map((cell) => cell.foodPresent)),
    meanFoodEnergy: mean(cells.map((cell) => cell.foodEnergy))
  });
  return { seed, population: simulation.organisms.length, strongFacets: simulation.getFacets().filter((facet) => simulation.getFacetStrength(facet.memberIds) >= simulation.config.facet.minimumBondStrength).length, dark: metrics(dark), worked: metrics(worked) };
}

const runs = seeds.map(summarize);
const aggregate = (group) => Object.fromEntries(Object.keys(runs[0][group]).map((key) => [key, mean(runs.map((run) => run[group][key]))]));
console.log(JSON.stringify({
  protocol: {
    ticks, seeds,
    question: "Are zero-trail cells systematically farther from gates or depleted of current food than historically worked cells?",
    meaning: "The trail is cumulative facet work. This test cannot distinguish historical chance from all unobserved ecological causes."
  },
  runs,
  mean: {
    population: mean(runs.map((run) => run.population)),
    strongFacets: mean(runs.map((run) => run.strongFacets)),
    dark: aggregate("dark"),
    worked: aggregate("worked")
  }
}, null, 2));
