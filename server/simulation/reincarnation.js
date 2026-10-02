// Bounded, inspectable world cycling for the exploratory intelligence branch.
// A cycle changes environmental parameters, never organism code or learned data.
export class ReincarnationController {
  constructor({ cycleTicks = 1000, seed = 160103, enabled = true, maximumHistory = 24 } = {}) {
    this.cycleTicks = cycleTicks;
    this.seed = seed;
    this.enabled = enabled;
    this.maximumHistory = maximumHistory;
    this.generation = 0;
    this.cycle = 0;
    this.history = [];
    this.recipe = null;
    this.lastResult = null;
    this.nextReason = "initial world";
  }

  recipes() {
    return [
      {
        name: "resource-foraging",
        resourceFunded: true,
        foodGrowthRate: 0.45,
        foodAttempts: 8,
        gateDiscovery: true,
        navigation: true,
        dormantBonds: true,
        movementCostMultiplier: 0.9
      },
      {
        name: "gate-consensus",
        resourceFunded: true,
        foodGrowthRate: 0.32,
        foodAttempts: 6,
        gateDiscovery: true,
        navigation: true,
        dormantBonds: true,
        movementCostMultiplier: 0.8
      },
      {
        name: "distributed-memory",
        resourceFunded: true,
        foodGrowthRate: 0.42,
        foodAttempts: 8,
        gateDiscovery: true,
        navigation: false,
        dormantBonds: true,
        movementCostMultiplier: 1
      },
      {
        name: "scarcity-recovery",
        resourceFunded: true,
        foodGrowthRate: 0.24,
        foodAttempts: 5,
        gateDiscovery: true,
        navigation: true,
        dormantBonds: true,
        movementCostMultiplier: 0.7
      }
    ];
  }

  chooseRecipe() {
    const recipes = this.recipes();
    // Explore every recipe once, then revisit the best-scoring recipe with a
    // new seed. This is a transparent bandit-like search, not pre-trained data.
    if (this.generation < recipes.length) return recipes[this.generation];
    const best = [...this.history].sort((a, b) => b.score - a.score)[0];
    return recipes[(best.recipeIndex + 1) % recipes.length];
  }

  applyRecipe(simulation, recipe) {
    simulation.config.bond.resourceFundedSurvival.enabled = Boolean(recipe.resourceFunded);
    simulation.config.bond.dormantBonds.enabled = Boolean(recipe.dormantBonds);
    simulation.config.collectiveWork.gateDiscovery.enabled = Boolean(recipe.gateDiscovery);
    simulation.config.collectiveWork.navigation.enabled = Boolean(recipe.navigation);
    simulation.config.food.growthRate = recipe.foodGrowthRate;
    simulation.config.food.maxGrowthAttemptsPerTick = recipe.foodAttempts;
    simulation.config.collectiveWork.collectiveStride.movementCostMultiplier = recipe.movementCostMultiplier;
    simulation.setGuidedStructuralIntelligenceEnabled(false);
    simulation.setGuidedSupportedDevelopmentEnabled(false);
    simulation.config.guidedStructuralIntelligence.supportedDevelopment.unconditionalSupportEnabled = false;
    this.recipe = { ...recipe };
    simulation.setSeed(this.seed + this.generation * 9973 + this.cycle * 101);
    simulation.resume();
  }

  score(simulation) {
    const stats = simulation.getStatistics();
    const discovery = simulation.gateDiscoveryStats ?? {};
    const telemetry = simulation.telemetry ?? {};
    const populationRetention = stats.population / Math.max(1, simulation.config.organism.initialPopulation);
    const structure = stats.bonds + simulation.getFacets().length * 2;
    const interaction = (discovery.consensuses ?? 0) * 2 + (simulation.collectiveWorkCompletions ?? 0) * 3;
    const continuity = Math.max(0, stats.population - (simulation.deaths ?? 0) * 0.25);
    const score = Number((populationRetention * 10 + structure + interaction + continuity).toFixed(3));
    return {
      tick: stats.tick,
      population: stats.population,
      births: stats.births,
      deaths: stats.deaths,
      bonds: stats.bonds,
      facets: simulation.getFacets().length,
      food: stats.foodCount,
      gateSightings: discovery.sightings ?? 0,
      gateRelays: discovery.relays ?? 0,
      gateConsensuses: discovery.consensuses ?? 0,
      gateCompletions: simulation.collectiveWorkCompletions ?? 0,
      bondsFormed: telemetry.bondsFormed ?? simulation.bondsFormed ?? 0,
      bondsBroken: telemetry.bondsBroken ?? simulation.bondsBroken ?? 0,
      populationRetention: Number(populationRetention.toFixed(3)),
      score
    };
  }

  observe(simulation) {
    if (!this.enabled || simulation.simulationTicks < this.cycleTicks) return false;
    const result = this.score(simulation);
    const completed = {
      generation: this.generation,
      cycle: this.cycle,
      recipeIndex: this.recipes().findIndex((recipe) => recipe.name === this.recipe?.name),
      recipe: this.recipe,
      ...result
    };
    this.history.push(completed);
    if (this.history.length > this.maximumHistory) this.history.shift();
    this.lastResult = completed;
    this.generation += 1;
    this.cycle += 1;
    const next = this.chooseRecipe();
    this.nextReason = result.score < 10 ? "low structural/interaction score; exploring new recipe" : "cycling for comparison and novelty";
    this.applyRecipe(simulation, next);
    return true;
  }

  snapshot(simulation = null) {
    const tick = simulation?.simulationTicks ?? 0;
    return {
      enabled: this.enabled,
      cycleTicks: this.cycleTicks,
      generation: this.generation,
      cycle: this.cycle,
      currentRecipe: this.recipe,
      ticksRemaining: Math.max(0, this.cycleTicks - tick),
      nextReason: this.nextReason,
      lastResult: this.lastResult,
      history: this.history.slice(-this.maximumHistory)
    };
  }
}
