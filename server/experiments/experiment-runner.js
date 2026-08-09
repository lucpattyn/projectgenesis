import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { Simulation } from "../simulation/simulation.js";
import { TILE_TYPES } from "../simulation/config.js";

const MAX_STORAGE_BYTES = 100 * 1024 * 1024;
const MAX_HISTORY_RECORDS = 100;
const TICKS_PER_TURN = 5;

const DEFAULT_SETTINGS = {
  worldNumber: 85470,
  founderGenome: { 2: 1, 3: 1, 5: 1, 7: 1, 13: 1, 17: 1, 19: 1, 31: 1 },
  initialPopulation: 72,
  mutationRate: 0.02,
  foodTargetDensity: 0.12,
  foodGrowthRate: 0.28,
  reproductionHabitatFraction: 0.05,
  replicates: 3,
  ticks: 500,
  sampleEvery: 50,
  baseSeed: 314233858
};

const SCENARIOS = [
  { id: "memory-disabled", label: "Memory disabled", memoryEnabled: false, memoryPrimes: [] },
  { id: "memory-write-only", label: "Memory write only", memoryEnabled: true, memoryPrimes: [41] },
  { id: "memory-read-only", label: "Memory read only", memoryEnabled: true, memoryPrimes: [43] },
  { id: "memory-read-write", label: "Memory read + write", memoryEnabled: true, memoryPrimes: [41, 43] }
];
const BASE_MUTATION_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 31];

function mean(records, key) {
  return Number((records.reduce((total, record) => total + record.final[key], 0) / Math.max(1, records.length)).toFixed(3));
}

function readNumber(value, fallback, minimum, maximum) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(maximum, Math.max(minimum, numeric)) : fallback;
}

export class ExperimentRunner {
  constructor(storagePath) {
    this.storagePath = storagePath;
    this.history = [];
    this.current = null;
    this.ready = this.loadHistory();
  }

  async loadHistory() {
    try {
      const parsed = JSON.parse(await readFile(this.storagePath, "utf8"));
      this.history = Array.isArray(parsed.records) ? parsed.records.slice(-MAX_HISTORY_RECORDS) : [];
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  snapshot() {
    const current = this.current;
    return {
      storage: {
        path: "data/experiment-history.json",
        limitBytes: MAX_STORAGE_BYTES,
        records: this.history.length,
        policy: "Aggregate records and periodic samples only; oldest records are pruned before 100 MB."
      },
      status: current ? {
        state: current.cancelled ? "cancelling" : "running",
        completedRuns: current.completed.length,
        totalRuns: current.tasks.length,
        scenario: current.active?.scenario.label ?? "Preparing",
        tick: current.active?.ticksCompleted ?? 0,
        ticks: current.settings.ticks
      } : { state: "idle", completedRuns: 0, totalRuns: 0 },
      latest: this.history.at(-1) ?? null,
      scenarios: SCENARIOS.map(({ id, label }) => ({ id, label }))
    };
  }

  async start(request = {}) {
    await this.ready;
    if (this.current) throw new Error("An evolutionary experiment is already running.");

    const settings = {
      ...DEFAULT_SETTINGS,
      replicates: Math.round(readNumber(request.replicates, DEFAULT_SETTINGS.replicates, 1, 8)),
      ticks: Math.round(readNumber(request.ticks, DEFAULT_SETTINGS.ticks, 100, 1200)),
      baseSeed: Math.round(readNumber(request.baseSeed, DEFAULT_SETTINGS.baseSeed, 1, 0xffffffff))
    };
    const tasks = SCENARIOS.flatMap((scenario) => Array.from({ length: settings.replicates }, (_, replicate) => ({
      scenario,
      replicate: replicate + 1,
      // Each condition receives the same replicate seed, isolating the scenario change.
      seed: (settings.baseSeed + replicate) >>> 0
    })));
    this.current = { settings, tasks, completed: [], active: null, cancelled: false, startedAt: new Date().toISOString() };
    setImmediate(() => this.advance());
    return this.snapshot();
  }

  cancel() {
    if (this.current) this.current.cancelled = true;
    return this.snapshot();
  }

  createSimulation(task, settings) {
    const simulation = new Simulation();
    simulation.stop();
    simulation.setWorldNumber(settings.worldNumber);
    simulation.setFounderGenome(settings.founderGenome);
    simulation.config.organism.initialPopulation = settings.initialPopulation;
    simulation.config.organism.mutationRate = settings.mutationRate;
    simulation.config.world.foodTargetDensity = settings.foodTargetDensity;
    simulation.world.foodTargetDensity = settings.foodTargetDensity;
    simulation.config.food.growthRate = settings.foodGrowthRate;
    simulation.config.ecology.reproductionHabitatFraction = settings.reproductionHabitatFraction;
    // This screen isolates the task layer: refinery and niche-maintenance remain off in both arms.
    simulation.config.refinery.enabled = false;
    simulation.nicheMaintenanceEnabled = false;
    simulation.config.collectiveWork.enabled = task.scenario.collectiveWorkEnabled;
    simulation.config.collectiveWork.enabled = true;
    simulation.config.collectiveWork.gateOutputMode = "port-coupled";
    simulation.config.collectiveWork.gatePortFoodRate = 0.9;
    simulation.config.courier.enabled = false;
    simulation.config.environmentMemory.enabled = task.scenario.memoryEnabled;
    simulation.config.organism.mutationPrimes = [...BASE_MUTATION_PRIMES, ...task.scenario.memoryPrimes];
    simulation.config.collectiveWork.gateCount = 10;
    simulation.config.collectiveWork.gateRadius = 4;
    simulation.nicheMaintenanceEnabled = task.scenario.maintenance;
    simulation.config.hazards.fireEnabled = false;
    simulation.setSeed(task.seed);
    if (!simulation.config.courier.enabled) simulation.setCourierEnabled(false);
    const structuralCount = Math.round(simulation.organisms.length * 0.5);
    for (const organism of simulation.organisms.slice(structuralCount)) {
      const genome = { ...organism.genome }; delete genome[31];
      organism.genomeProfile = simulation.genomeEngine.construct(genome);
      organism.genome = organism.genomeProfile.genome;
      organism.brain = simulation.brainGenerator.generate(organism.genomeProfile);
    }
    return simulation;
  }

  measure(simulation, ticks) {
    const living = simulation.organisms.filter((organism) => organism.alive);
    const p31Carriers = living.filter((organism) => organism.genomeProfile.traits.canCouple).length;
    const totalEnergy = living.reduce((total, organism) => total + organism.energy, 0);
    const economics = simulation.energyEconomicsSnapshot();
    return {
      tick: ticks,
      population: living.length,
      food: simulation.world.countTilesByType(TILE_TYPES.FOOD),
      averageEnergy: Number((totalEnergy / Math.max(1, living.length)).toFixed(2)),
      p31Carriers,
      p31Frequency: Number((p31Carriers / Math.max(1, living.length)).toFixed(4)),
      p41Carriers: living.filter((organism) => organism.genomeProfile.traits.canWriteEnvironment).length,
      p43Carriers: living.filter((organism) => organism.genomeProfile.traits.canReadEnvironment).length,
      bonds: simulation.bonds.size,
      facets: simulation.getFacets().length,
      facetCapital: Number([...simulation.facetReserves.values()].reduce((total, value) => total + value, 0).toFixed(2)),
      oldestAge: living.reduce((oldest, organism) => Math.max(oldest, organism.age), 0),
      highestGeneration: living.reduce((highest, organism) => Math.max(highest, organism.generation), 0),
      refineryConversions: simulation.refineryConversions,
      refineryFoodReleased: simulation.refineryFoodReleased,
      refineryNutrientsProduced: Number(simulation.refineryNutrientsProduced.toFixed(2)),
      engineeredFertilityCells: simulation.world.engineeredFertility.flat()
        .filter((value) => value >= simulation.config.environment.nicheGrowthThreshold).length,
      gateAttendances: simulation.collectiveWorkAttendances,
      gateCompletions: simulation.collectiveWorkCompletions,
      gateFoodReleased: simulation.collectiveWorkFoodReleased,
      gateFieldHarvests: simulation.collectiveWorkFieldHarvests,
      gateFieldWorkerHarvests: simulation.collectiveWorkFieldHarvestsByWorkers,
      gateFieldOtherHarvests: simulation.collectiveWorkFieldHarvestsByOthers
      ,courierReports: simulation.courierReportsCreated
      ,courierHandoffs: simulation.courierHandoffs
      ,memoryAverage: Number(simulation.world.getEnvironmentMemoryStatistics(simulation.config.environmentMemory).average.toFixed(5))
      ,memoryCoverage: Number(simulation.world.getEnvironmentMemoryStatistics(simulation.config.environmentMemory).coverage.toFixed(5))
      ,memoryLargestRegion: simulation.world.getEnvironmentMemoryStatistics(simulation.config.environmentMemory).largestRegion
      ,memoryLifetime: Number(simulation.world.getEnvironmentMemoryStatistics(simulation.config.environmentMemory).meanLifetime.toFixed(3))
      ,memoryWrites: simulation.environmentMemoryWrites
      ,energyIncome: economics.totalIncome
      ,energyExpenses: economics.totalExpenses
      ,energyLosses: economics.totalLosses
      ,capacityOverflow: economics.losses.capacityOverflow
      ,unharvestedPotentialEnergy: economics.unharvestedPotentialEnergy
      ,reproductionAllocation: economics.allocations.reproduction
      ,structuralSeedAllocation: economics.allocations.structuralSeed
      ,deathCauses: economics.deathCauses
      ,energyLogistics: simulation.energyLogistics.timeSeries.at(-1) ?? null
    };
  }

  async advance() {
    const job = this.current;
    if (!job) return;
    if (job.cancelled) {
      this.current = null;
      return;
    }
    if (!job.active) {
      const task = job.tasks[job.completed.length];
      if (!task) {
        await this.finish(job);
        return;
      }
      job.active = { ...task, simulation: this.createSimulation(task, job.settings), ticksCompleted: 0, samples: [], p31ExtinctionTick: null };
    }

    const active = job.active;
    const endTick = Math.min(job.settings.ticks, active.ticksCompleted + TICKS_PER_TURN);
    while (active.ticksCompleted < endTick) {
      active.simulation.step();
      active.ticksCompleted += 1;
      if (active.ticksCompleted % job.settings.sampleEvery === 0 || active.ticksCompleted === job.settings.ticks) {
        const sample = this.measure(active.simulation, active.ticksCompleted);
        active.samples.push(sample);
        if (sample.p31Carriers === 0 && active.p31ExtinctionTick === null) active.p31ExtinctionTick = active.ticksCompleted;
      }
    }

    if (active.ticksCompleted >= job.settings.ticks) {
      const final = this.measure(active.simulation, active.ticksCompleted);
      job.completed.push({
        scenario: active.scenario.id,
        scenarioLabel: active.scenario.label,
        replicate: active.replicate,
        seed: active.seed,
        final,
        p31ExtinctionTick: active.p31ExtinctionTick,
        bondsFormed: active.simulation.bondsFormed,
        bondsBroken: active.simulation.bondsBroken,
        bondBreakReasons: active.simulation.bondBreakReasons,
        facetBirths: active.simulation.facetBirths,
        energyLogistics: active.simulation.energyLogistics.timeSeries,
        samples: active.samples
      });
      job.active = null;
    }
    setImmediate(() => this.advance());
  }

  async finish(job) {
    const grouped = Object.groupBy(job.completed, (record) => record.scenario);
    const summary = Object.entries(grouped).map(([scenario, records]) => ({
      scenario,
      label: records[0].scenarioLabel,
      runs: records.length,
      meanPopulation: mean(records, "population"),
      meanAverageEnergy: mean(records, "averageEnergy"),
      meanOldestAge: mean(records, "oldestAge"),
      meanHighestGeneration: mean(records, "highestGeneration"),
      meanP31Frequency: mean(records, "p31Frequency"),
      meanP31Carriers: mean(records, "p31Carriers"),
      meanP41Carriers: mean(records, "p41Carriers"),
      meanP43Carriers: mean(records, "p43Carriers"),
      meanBonds: mean(records, "bonds"),
      meanFacets: mean(records, "facets"),
      meanFacetBirths: Number((records.reduce((total, record) => total + record.facetBirths, 0) / records.length).toFixed(2)),
      meanRefineryConversions: mean(records, "refineryConversions"),
      meanRefineryFoodReleased: mean(records, "refineryFoodReleased"),
      meanEngineeredFertilityCells: mean(records, "engineeredFertilityCells"),
      meanGateAttendances: mean(records, "gateAttendances"),
      meanGateCompletions: mean(records, "gateCompletions"),
      meanGateFoodReleased: mean(records, "gateFoodReleased"),
      meanGateFieldHarvests: mean(records, "gateFieldHarvests"),
      meanGateFieldWorkerHarvests: mean(records, "gateFieldWorkerHarvests"),
      meanGateFieldOtherHarvests: mean(records, "gateFieldOtherHarvests"),
      meanCourierReports: mean(records, "courierReports"),
      meanCourierHandoffs: mean(records, "courierHandoffs"),
      meanMemoryAverage: mean(records, "memoryAverage"),
      meanMemoryCoverage: mean(records, "memoryCoverage"),
      meanMemoryLargestRegion: mean(records, "memoryLargestRegion"),
      meanMemoryLifetime: mean(records, "memoryLifetime"),
      meanMemoryWrites: mean(records, "memoryWrites"),
      meanEnergyIncome: mean(records, "energyIncome"),
      meanEnergyExpenses: mean(records, "energyExpenses"),
      meanEnergyLosses: mean(records, "energyLosses"),
      meanCapacityOverflow: mean(records, "capacityOverflow"),
      meanUnharvestedPotentialEnergy: mean(records, "unharvestedPotentialEnergy"),
      meanReproductionAllocation: mean(records, "reproductionAllocation"),
      p31Extinctions: records.filter((record) => record.p31ExtinctionTick !== null).length
    }));
    this.history.push({ id: `experiment-${Date.now()}`, startedAt: job.startedAt, completedAt: new Date().toISOString(), settings: job.settings, summary, runs: job.completed });
    await this.persist();
    this.current = null;
  }

  async persist() {
    await mkdir(dirname(this.storagePath), { recursive: true });
    while (this.history.length > MAX_HISTORY_RECORDS || Buffer.byteLength(JSON.stringify({ records: this.history })) > MAX_STORAGE_BYTES) {
      this.history.shift();
    }
    const temporaryPath = `${this.storagePath}.tmp`;
    await writeFile(temporaryPath, JSON.stringify({ records: this.history }), "utf8");
    await rename(temporaryPath, this.storagePath);
  }
}
