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
    this.carriedComponentSize = 0;
    this.carriedBondCount = 0;
    this.carriedFacetCount = 0;
    this.lastCarry = null;
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

  captureComponent(simulation) {
    const groups = simulation.getBondGroups().filter((group) => group.length >= 3);
    if (!groups.length) return null;
    const ids = new Set(groups.flat());
    const members = [...ids]
      .map((id) => simulation.organisms.find((organism) => organism.id === id))
      .filter((organism) => organism?.alive);
    if (members.length < 4) return null;
    const internalBonds = [...simulation.bonds.values()].filter((bond) => ids.has(bond.firstId) && ids.has(bond.secondId));
    const internalFacets = simulation.getFacets().filter((facet) => facet.memberIds.every((id) => ids.has(id)));
    return {
      members,
      positions: members.map((member) => ({ id: member.id, x: member.x, y: member.y })),
      bonds: internalBonds.map((bond) => ({ ...bond })),
      facetCount: internalFacets.length,
      reserves: [...simulation.componentReserves.entries()]
        .filter(([key]) => [...ids].every((id) => key.split(":").includes(String(id))))
        .map(([key, value]) => [key, value])
    };
  }

  restoreComponent(simulation, carried) {
    if (!carried) {
      this.carriedComponentSize = 0;
      this.carriedBondCount = 0;
      this.carriedFacetCount = 0;
      this.lastCarry = null;
      return;
    }
    // Remove the freshly seeded organisms: this is a continuation, not a new
    // population with a decorative component pasted into it.
    simulation.organisms = [];
    simulation.bonds.clear();
    simulation.componentReserves.clear();
    simulation.lineageBirthTicks.clear();
    let nextId = 1;
    for (const member of carried.members) {
      nextId = Math.max(nextId, member.id + 1);
      member.alive = true;
      member.energy = Math.max(1, Math.min(member.energy, simulation.config.organism.startingEnergy * 1.25));
      member.age = Math.min(member.age, Math.floor(simulation.config.organism.maxAge * 0.5) || member.age);
      member.collectiveStrideActive = false;
      member.collectiveTransportActive = false;
      simulation.organisms.push(member);
      if (member.lineageId !== undefined) simulation.lineageBirthTicks.set(member.lineageId, -member.age);
    }
    for (const bond of carried.bonds) {
      const carriedBond = {
        ...bond,
        reserve: Math.max(0, (bond.reserve ?? 0) * 0.9),
        dormant: Boolean(bond.dormant)
      };
      simulation.bonds.set(simulation.bondKey(bond.firstId, bond.secondId), carriedBond);
    }
    for (const [key, value] of carried.reserves ?? []) simulation.componentReserves.set(key, Math.max(0, value * 0.9));
    simulation.births = simulation.organisms.length;
    simulation.deaths = 0;
    simulation.nextOrganismId = nextId;
    simulation.bondGroupsCache = null;
    this.carriedComponentSize = carried.members.length;
    this.carriedBondCount = carried.bonds.length;
    this.carriedFacetCount = carried.facetCount ?? 0;
    this.lastCarry = {
      members: this.carriedComponentSize,
      bonds: this.carriedBondCount,
      facets: this.carriedFacetCount,
      reserveTransitionLoss: 0.1
    };
  }

  applyRecipe(simulation, recipe, carried = null) {
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
    this.restoreComponent(simulation, carried);
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
    const carried = this.captureComponent(simulation);
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
    this.applyRecipe(simulation, next, carried);
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
      carriedComponentSize: this.carriedComponentSize,
      carriedBondCount: this.carriedBondCount,
      carriedFacetCount: this.carriedFacetCount,
      lastCarry: this.lastCarry,
      history: this.history.slice(-this.maximumHistory)
    };
  }
}
