import { writeFile } from "node:fs/promises";
import { Simulation } from "../server/simulation/simulation.js";
import { ReincarnationController } from "../server/simulation/reincarnation.js";

const SEEDS = [160103, 160104, 160105, 160106];
const CYCLES = 2;
const CYCLE_TICKS = 1000;

function run(seed) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.headlessObservationMode = true;
  const controller = new ReincarnationController({ cycleTicks: CYCLE_TICKS, seed, enabled: true });
  controller.applyRecipe(simulation, controller.chooseRecipe());
  const cycles = [];
  for (let cycle = 0; cycle < CYCLES; cycle += 1) {
    const recipe = controller.recipe.name;
    const before = simulation.getStatistics();
    const startPopulation = before.population;
    const startBonds = before.bonds;
    for (let tick = 0; tick < CYCLE_TICKS; tick += 1) simulation.step();
    const resultBeforeReset = controller.score(simulation);
    controller.observe(simulation);
    const after = simulation.getStatistics();
    cycles.push({
      cycle: cycle + 1,
      recipe,
      startPopulation,
      startBonds,
      ...resultBeforeReset,
      carriedMembers: controller.lastCarry?.members ?? 0,
      carriedBonds: controller.lastCarry?.bonds ?? 0,
      carriedFacets: controller.lastCarry?.facets ?? 0,
      nextPopulation: after.population,
      nextBonds: after.bonds,
      nextFacets: simulation.getFacets().length,
      nextRecipe: controller.recipe.name
    });
  }
  return { seed, cycles };
}

const runs = SEEDS.map(run);
const output = {
  generatedAt: new Date().toISOString(),
  cycleTicks: CYCLE_TICKS,
  cyclesPerRun: CYCLES,
  seeds: SEEDS,
  runs
};
await writeFile("research-results/reincarnation-batch-20261002.json", JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));
