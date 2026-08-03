import { PrimeRegistry } from "./prime-registry.js";

export class GeneratorEngine {
  constructor(registry) {
    this.registry = registry;
  }

  generate(baseConfig, worldNumber) {
    const composition = this.registry.resolveWorld(worldNumber);
    const config = structuredClone(baseConfig);

    for (const generator of composition.generators) {
      generator.apply(config);
    }

    return { config, composition };
  }

  serialize(worldNumber) {
    const composition = this.registry.resolveWorld(worldNumber);

    return {
      phase: 3,
      status: "Active: the server factors the world recipe, resolves registered primes, then constructs the physics configuration.",
      registryStatus: "Phase 3 registry: each supported prime maps to one generator. Prime powers are reserved for Phase 7.",
      composition: {
        number: composition.number,
        factors: composition.factors,
        expression: `${composition.number} = ${composition.factors.join(" x ")}`
      },
      generators: composition.generators.map(({ prime, name, description }) => ({ prime, name, description })),
      registry: this.registry.serialize()
    };
  }
}

export const WORLD_PRIME_REGISTRY = new PrimeRegistry()
  .register(2, {
    name: "Movement",
    description: "Creates a toroidal world and assigns the energy cost of each random movement.",
    apply(config) {
      config.world.wraps = true;
      config.organism.moveCost = 1;
    }
  })
  .register(3, {
    name: "Energy",
    description: "Creates energy stores, aging cost, and the limits that make survival measurable.",
    apply(config) {
      config.organism.startingEnergy = 60;
      config.organism.idleCost = 0.15;
      config.organism.maxAge = 600;
    }
  })
  .register(5, {
    name: "Resources",
    description: "Creates food at world birth and replenishes it through the running simulation.",
    apply(config) {
      config.world.initialFoodChance = 0.12;
      config.world.foodTargetDensity = 0.18;
      config.food.growthRate = 0.45;
      config.food.maxGrowthAttemptsPerTick = 30;
      config.organism.foodEnergy = 20;
    }
  })
  .register(7, {
    name: "Reproduction",
    description: "Creates the energy threshold and split rule that produce descendants.",
    apply(config) {
      config.organism.reproductionThreshold = 105;
      config.organism.reproductionCostFactor = 0.5;
      config.organism.mutationHueJitter = 12;
      config.organism.mutationRate = 0.02;
      config.organism.genomeMaintenancePerStrength = 0.18;
      config.organism.persistenceMaintenance = 0.08;
      config.organism.perceptionMaintenance = 0.12;
      config.ecology.reproductionFoodUnitsPerOrganism = 2.5;
      config.ecology.reproductionHabitatFraction = 0.12;
      config.ecology.maximumReproductionOpportunity = 0.35;
    }
  })
  .register(11, {
    name: "Terrain",
    description: "Creates sparse walls that obstruct movement and shape local routes.",
    apply(config) {
      config.world.wallChance = 0.04;
    }
  })
  .register(37, {
    name: "Resource Transformation",
    description: "Creates a chemistry layer: decay and fire produce materials that return as nutrients and influence future food growth.",
    apply(config) {
      config.chemistry.enabled = true;
      config.chemistry.foodDecayRate = 0.002;
      config.chemistry.detritusToNutrients = 0.025;
      config.chemistry.ashToNutrients = 0.04;
      config.chemistry.nutrientGrowthBoost = 0.5;
      config.chemistry.nutrientCostPerFood = 0.12;
      config.chemistry.recoveryAttemptsPerMissingFood = 0.08;
      config.chemistry.maxRecoveryAttempts = 120;
      config.ecology.localFertilityEnabled = true;
      config.ecology.fertilityRecoveryPerTick = 0.004;
      config.ecology.fertilityLossPerHarvest = 0.22;
      config.ecology.minimumFertilityForGrowth = 0.18;
    }
  });

export const DEFAULT_GENERATOR_ENGINE = new GeneratorEngine(WORLD_PRIME_REGISTRY);
