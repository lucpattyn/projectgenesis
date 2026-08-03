export const TILE_TYPES = {
  EMPTY: "EMPTY",
  FOOD: "FOOD",
  WALL: "WALL"
};

export const RESOURCE_TYPES = {
  GREEN: "GREEN",
  BLUE: "BLUE",
  RED: "RED"
};

export const DIRECTIONS = [
  { x: 0, y: -1, name: "N" },
  { x: 1, y: 0, name: "E" },
  { x: 0, y: 1, name: "S" },
  { x: -1, y: 0, name: "W" }
];

export const BASE_CONFIG = {
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  universe: {
    // A seed makes every Phase 1 experiment reproducible and inspectable.
    initialSeed: 1,
    worldNumber: 2310
  },
  world: {
    width: 64,
    height: 64,
    wraps: false,
    wallChance: 0,
    initialFoodChance: 0,
    foodTargetDensity: 0
  },
  simulation: {
    tickRate: 5,
    snapshotFrequency: 5,
    speedOptions: [1, 2, 5, 10, 50],
    defaultSpeed: 1
  },
  organism: {
    initialPopulation: 24,
    founderGenome: 210,
    startingEnergy: 0,
    maxAge: 0,
    moveCost: 0,
    idleCost: 0,
    foodEnergy: 0,
    reproductionThreshold: 0,
    reproductionCostFactor: 0,
    mutationHueJitter: 0,
    mutationRate: 0,
    genomeMaintenancePerStrength: 0,
    persistenceMaintenance: 0,
    perceptionMaintenance: 0
    ,couplingMaintenance: 0.1
  },
  food: {
    growthRate: 0,
    maxGrowthAttemptsPerTick: 0
  },
  hazards: {
    fireEnabled: false,
    fireIgnitionRate: 0.002,
    fireSpreadChance: 0.18,
    fireDuration: 7,
    fireMaxActive: 24
  },
  signal: {
    decay: 0.65,
    emissionCost: 0.1,
    activationThreshold: 0.35,
    maxIntensity: 120
  },
  chemistry: {
    enabled: false,
    foodDecayRate: 0,
    detritusToNutrients: 0,
    ashToNutrients: 0,
    nutrientGrowthBoost: 0,
    nutrientCostPerFood: 0,
    recoveryAttemptsPerMissingFood: 0,
    maxRecoveryAttempts: 0
  },
  ecology: {
    reproductionFoodUnitsPerOrganism: 0,
    reproductionHabitatFraction: 0,
    maximumReproductionOpportunity: 0,
    localFertilityEnabled: false,
    fertilityRecoveryPerTick: 0,
    fertilityLossPerHarvest: 0,
    minimumFertilityForGrowth: 0
  },
  facet: {
    // Closed bond triangles retain collective harvest capital for structural reproduction.
    sharingFraction: 0.3,
    minimumBondStrength: 0.45,
    harvestBonusFraction: 0.16,
    reserveCapacity: 30,
    reserveRequiredForBirth: 4,
    reserveInvestmentPerBirth: 4
  },
  bond: {
    // A meal should keep a maintained structure viable long enough to find its next resource.
    reserveCapacity: 10,
    initialReserve: 3,
    mealEnergyFraction: 0.18,
    maintenancePerTick: 0.04,
    repairPerTick: 0.025,
    starvationStrengthDecay: 0.03,
    supportThreshold: 24,
    supportReserveFloor: 1.5,
    maxSupportReleasePerTick: 0.35,
    supportLossFraction: 0.15,
    buddingReserveInvestment: 1.2,
    buddingCandidateTicks: 3
  },
  render: {
    background: "#08131a",
    grid: "#16303b",
    empty: "#0d1c23",
    food: "#73f0a8",
    wall: "#31414a"
  }
};

// Phase 2 generators construct the concrete physics used by the server.
export const DEFAULT_CONFIG = DEFAULT_GENERATOR_ENGINE.generate(
  BASE_CONFIG,
  BASE_CONFIG.universe.worldNumber
).config;
import { DEFAULT_GENERATOR_ENGINE } from "./generator-engine.js";
