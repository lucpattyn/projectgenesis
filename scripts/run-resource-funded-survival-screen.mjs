import { Simulation } from "../server/simulation/simulation.js";

const SEED = Number(process.env.GENESIS_SEED ?? 160103);
const TICKS = Number(process.env.GENESIS_TICKS ?? 800);

const CONDITIONS = [
  { name: "baseline", guided: false, support: false, resourceFunded: false },
  { name: "resource-funded", guided: false, support: false, resourceFunded: true },
  { name: "legacy-support", guided: true, support: true, resourceFunded: false }
];

function run(condition) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(SEED);
  simulation.config.bond.resourceFundedSurvival.enabled = condition.resourceFunded;
  simulation.setGuidedStructuralIntelligenceEnabled(condition.guided);
  simulation.setGuidedSupportedDevelopmentEnabled(condition.support);
  simulation.config.guidedStructuralIntelligence.supportedDevelopment.unconditionalSupportEnabled = condition.support;
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  const statistics = simulation.getStatistics();
  return {
    condition: condition.name,
    tick: statistics.tick,
    population: statistics.population,
    births: statistics.births,
    deaths: statistics.deaths,
    bonds: statistics.bonds,
    averageEnergy: statistics.averageEnergy,
    bondsFormed: simulation.bondsFormed,
    bondsBroken: simulation.bondsBroken,
    bondBreakReasons: simulation.bondBreakReasons,
    gateCompletions: simulation.collectiveWorkCompletions,
    componentReserve: Number([...simulation.componentReserves.values()].reduce((sum, value) => sum + value, 0).toFixed(3)),
    componentReserveDeposited: Number(simulation.componentReserveDeposited.toFixed(3)),
    componentReserveWithdrawn: Number(simulation.componentReserveWithdrawn.toFixed(3)),
    componentReserveBondFunding: Number(simulation.componentReserveBondFunding.toFixed(3))
  };
}

console.log(JSON.stringify({
  protocol: { seed: SEED, ticks: TICKS, conditions: CONDITIONS.map(({ name }) => name) },
  runs: CONDITIONS.map(run)
}, null, 2));
