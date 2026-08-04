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
    worldNumber: 85470
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
    founderGenome: { 2: 1, 3: 1, 5: 1, 7: 1, 13: 1, 17: 1, 19: 1, 31: 1 },
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
  refinery: {
    // Red is a low-energy catalyst. Prime-31 facets spend it to recover existing chemical material.
    enabled: false,
    minimumMaterial: 0.6,
    candidateTicks: 12,
    nutrientYield: 0.65,
    catalystCapacity: 3,
    nurseryCreditCapacity: 2
  },
  environment: {
    // Maintained facets create a bounded local primary-production gradient.
    // It is environmental state, never an organism energy transfer.
    engineeredFertilityDecay: 0.006,
    engineeredFertilityReinforcement: 0.08,
    engineeredFertilityMaximum: 0.8,
    nicheGrowthAttemptsPerTick: 0,
    nicheGrowthThreshold: 0.25,
    nicheGrowthRate: 0
  },
  collectiveWork: {
    enabled: true,
    gateCount: 4,
    gateRadius: 3,
    observeTicks: 8,
    responseTicks: 8,
    requiredConsensusTicks: 2,
    // Consensus is a shared state band, not an exact floating-point recall task.
    consensusTolerance: 0.45,
    gateFieldMaximum: 1,
    gateFieldDecay: 0.035,
    gateFieldFoodRate: 0.36,
    // Kept separate from diffuse output so port-coupled ecology can be calibrated without changing its control.
    gatePortFoodRate: 0.9,
    gateFieldSenseRadius: 5,
    // Food is produced at the three visible gate ports while the responsible facet remains intact.
    // "diffuse" is retained only as the matched experimental control.
    gateOutputMode: "port-coupled"
  },
  courier: {
    // Mobile Prime-19/13 scouts can carry rare gate-state information to bonded compounds.
    enabled: false,
    highEnergyThreshold: 90,
    maxActiveScouts: 3,
    observationRadius: 5,
    reportLifetime: 24,
    reportInterval: 6,
    handoffRadius: 2,
    handoffEnergyCost: 0.15
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
