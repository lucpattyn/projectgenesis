import { BASE_CONFIG, DEFAULT_CONFIG, DIRECTIONS, RESOURCE_TYPES, TILE_TYPES } from "./config.js";
import { DEFAULT_GENERATOR_ENGINE } from "./generator-engine.js";
import { DEFAULT_GENOME_ENGINE } from "./genome-engine.js";
import { DEFAULT_BRAIN_GENERATOR } from "./brain-generator.js";
import { DEFAULT_BRAIN_EXECUTOR } from "./brain-executor.js";
import { DEFAULT_MUTATION_ENGINE } from "./mutation-engine.js";
import { Organism } from "./organism.js";
import { World } from "./world.js";
import { average, clamp, createSeededRandom, normalizeSeed } from "./utils.js";

const MAX_TELEMETRY_EVENTS = 1000;
const MAX_PRIMARY_PRODUCTION_MARKERS = 90;

export class Simulation {
  constructor(config = DEFAULT_CONFIG) {
    this.generatorEngine = DEFAULT_GENERATOR_ENGINE;
    this.genomeEngine = DEFAULT_GENOME_ENGINE;
    this.brainGenerator = DEFAULT_BRAIN_GENERATOR;
    this.brainExecutor = DEFAULT_BRAIN_EXECUTOR;
    this.mutationEngine = DEFAULT_MUTATION_ENGINE;
    this.baseConfig = structuredClone(BASE_CONFIG);
    this.worldNumber = config.universe.worldNumber ?? this.baseConfig.universe.worldNumber;
    this.config = this.generatorEngine.generate(this.baseConfig, this.worldNumber).config;
    this.seed = normalizeSeed(this.config.universe.initialSeed);
    this.random = createSeededRandom(this.seed);
    this.world = new World(this.config.world, this.random);
    this.organisms = [];
    this.nextOrganismId = 1;
    this.isPaused = false;
    this.gridEnabled = false;
    this.facetTrailEnabled = true;
    this.speed = this.config.simulation.defaultSpeed;
    this.tickIntervalMs = 1000 / this.config.simulation.tickRate;
    this.timer = null;
    this.lastTickTime = Date.now();
    this.simulationTicks = 0;
    this.births = 0;
    this.deaths = 0;
    this.fpsEstimate = 0;
    this.snapshotVersion = 0;
    this.deathMarkers = [];
    this.birthMarkers = [];
    this.energyTransfers = [];
    this.primaryProductionMarkers = [];
    this.facetWorkTrail = Array.from({ length: this.world.height }, () => Array(this.world.width).fill(0));
    this.compoundHeadings = new Map();
    this.bonds = new Map();
    this.bondCandidates = new Map();
    this.structuralBirthSeeds = new Map();
    this.facetReserves = new Map();
    this.telemetryEvents = [];
    this.bondsFormed = 0;
    this.bondsBroken = 0;
    this.bondBreakReasons = {};
    this.refineryProgress = new Map();
    this.facetCatalysts = new Map();
    this.facetNurseryCredits = new Map();
    this.facetNiches = new Map();
    this.refineryConversions = 0;
    this.nicheMaintenanceEnabled = true;
    this.refineryFoodReleased = 0;
    this.refineryNutrientsProduced = 0;
    this.workGates = [];
    this.collectiveWorkCompletions = 0;
    this.collectiveWorkFoodReleased = 0;
    this.collectiveWorkAttendances = 0;
    this.collectiveWorkFieldHarvests = 0;
    this.collectiveWorkFieldHarvestsByWorkers = 0;
    this.collectiveWorkFieldHarvestsByOthers = 0;
    this.collectiveWorkHarvestLineages = new Map();
    this.nextCourierReportId = 1;
    this.courierReportsCreated = 0;
    this.courierHandoffs = 0;
    this.nextCourierReportTick = 0;
    this.facetTransfers = 0;
    this.facetEnergyShared = 0;
    this.facetHarvests = 0;
    this.facetHarvestEnergy = 0;
    this.facetHarvestReserveEnergy = 0;
    this.facetBirths = 0;
    this.facetReserveSpent = 0;
    this.bondsFed = 0;
    this.bondEnergyFed = 0;
    this.bondSupportTransfers = 0;
    this.bondSupportEnergyReleased = 0;
    this.structuralBirths = 0;
    this.structuralSeedEnergy = 0;
    this.collectiveMoves = 0;
    this.collectiveResourceDirectedMoves = 0;
    this.primaryResourceUnits = 0;
    this.primaryPotentialEnergy = 0;
    this.latestPrimaryProduction = 0;
    this.initializeWorkGates();
    this.seedInitialPopulation(this.config.organism.initialPopulation);
    this.start();
  }

  start() {
    this.stop();
    this.lastTickTime = Date.now();
    this.timer = setInterval(() => {
      this.runLoop();
    }, this.tickIntervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  runLoop() {
    if (this.isPaused) {
      return;
    }

    const ticksToRun = this.speed;
    for (let tick = 0; tick < ticksToRun; tick += 1) {
      this.step();
    }

    const now = Date.now();
    const elapsed = Math.max(1, now - this.lastTickTime);
    this.fpsEstimate = (ticksToRun * 1000) / elapsed;
    this.lastTickTime = now;
  }

  seedInitialPopulation(count) {
    const occupied = new Set();
    this.organisms = [];
    this.nextOrganismId = 1;

    for (let index = 0; index < count; index += 1) {
      const position = this.world.findRandomOpenPosition(occupied);
      if (!position) {
        break;
      }

      const genomeProfile = this.genomeEngine.construct(this.config.organism.founderGenome);
      const organism = new Organism({
        id: this.nextOrganismId,
        x: position.x,
        y: position.y,
        energy: this.config.organism.startingEnergy,
        genomeProfile,
        brain: this.brainGenerator.generate(genomeProfile),
        random: this.random
      });

      this.nextOrganismId += 1;
      this.organisms.push(organism);
      occupied.add(`${position.x},${position.y}`);
      this.births += 1;
    }
  }

  step() {
    this.decayCourierKnowledge();
    this.world.updateFire({ ...this.config.hazards, chemistryEnabled: this.config.chemistry.enabled });
    this.world.updateChemistry(this.config.chemistry, this.config.ecology, this.config.environment);
    this.updateFacetNiches();
    this.updateFacetRefineries();
    this.world.decaySignals(this.config.signal.decay);
    const occupiedBefore = new Set(this.organisms.filter((item) => item.alive).map((item) => `${item.x},${item.y}`));

    const coupledIds = this.getCoupledIds();
    // Capture only prior-tick persistent values, so state transport is one hop and execution order cannot leak information.
    const neighborStatesByOrganism = this.getNeighborStatesByOrganism();
    for (const organism of this.organisms) {
      if (!organism.alive) {
        continue;
      }

      occupiedBefore.delete(`${organism.x},${organism.y}`);
      const result = organism.act({
        world: this.world,
        occupiedKeys: occupiedBefore,
        config: this.config.organism,
        ecologyConfig: this.config.ecology,
        signalConfig: this.config.signal,
        coupled: coupledIds.has(organism.id),
        structuralFocus: this.getStructuralFocus(organism),
        collectiveWorkCue: this.getCollectiveWorkCue(organism),
        collectiveWorkFields: this.getActiveCollectiveWorkFields(),
        courierTarget: this.getCourierTarget(organism),
        neighborStates: neighborStatesByOrganism.get(organism.id) ?? [],
        brainExecutor: this.brainExecutor
      });

      if (result.consumedEnergy > 0 && organism.alive) {
        const structuralAllocation = this.feedAttachedBonds(organism, result.consumedEnergy);
        this.shareFacetEnergy(organism, result.consumedEnergy - structuralAllocation);
        this.applyFacetHarvestAdvantage(organism, result.consumedEnergy);
      }
      if (result.consumedResource === RESOURCE_TYPES.RED && organism.alive) {
        this.storeFacetCatalyst(organism);
      }
      if (result.consumedFoodOrigin?.type === "gate-field") {
        this.recordCollectiveWorkHarvest(organism, result.consumedFoodOrigin);
      }
      this.createCourierReport(organism);

      if (organism.alive) {
        this.supportLowEnergyMember(organism);
        if (organism.energy <= 0) {
          organism.alive = false;
          organism.deathReason = "energy exhaustion";
        }
      }

      if (organism.alive) {
        occupiedBefore.add(`${organism.x},${organism.y}`);
      }
    }

    this.moveCompounds();
    this.updateCourierExchange();
    this.handleReproduction();
    this.updateBonds();
    this.removeDeadOrganisms();
    this.updateFacetReserves();
    this.recordFacetWorkTrail();
    this.updateCollectiveWork();
    this.updateMarkers();
    const production = this.world.growFood(
      this.config.food.growthRate,
      this.config.food.maxGrowthAttemptsPerTick * this.speed,
      this.config.chemistry,
      this.config.ecology,
      this.config.environment
    );
    this.latestPrimaryProduction = production.count;
    this.primaryResourceUnits += production.count;
    this.primaryPotentialEnergy += production.count * this.config.organism.foodEnergy;
    this.primaryProductionMarkers.push(...production.positions.map((position) => ({ ...position, ttl: 4 })));
    if (this.primaryProductionMarkers.length > MAX_PRIMARY_PRODUCTION_MARKERS) {
      this.primaryProductionMarkers.splice(0, this.primaryProductionMarkers.length - MAX_PRIMARY_PRODUCTION_MARKERS);
    }

    this.simulationTicks += 1;
    this.snapshotVersion += 1;
  }

  handleReproduction() {
    const newborns = [];
    const occupied = new Set(this.organisms.filter((item) => item.alive).map((item) => `${item.x},${item.y}`));
    const reproductionOpportunity = this.getReproductionOpportunity().opportunity;

    for (const organism of this.organisms) {
      if (!organism.canReproduce(this.config.organism)) {
        continue;
      }
      const structuralParent = this.isActivelyBonded(organism.id) && organism.genomeProfile.traits.canCouple;
      const sourceFacet = structuralParent ? this.getStrongestFacetForMember(organism.id) : null;
      const nurseryCredit = sourceFacet ? (this.facetNurseryCredits.get(sourceFacet.key) ?? 0) : 0;
      const ordinaryOpportunity = this.random() <= reproductionOpportunity;
      if (!ordinaryOpportunity && nurseryCredit <= 0) continue;
      const facetBirthSite = sourceFacet ? this.findFacetBirthSite(organism, sourceFacet, occupied) : null;
      if (!ordinaryOpportunity && !facetBirthSite) continue;
      const localPosition = facetBirthSite?.position ?? (structuralParent ? this.findLocalBirthPosition(organism, occupied) : null);
      const childPosition = localPosition ?? this.world.findRandomOpenPosition(occupied);
      if (!childPosition) {
        continue;
      }

      const child = organism.reproduce(this.nextOrganismId, childPosition, this.config.organism, {
        genomeEngine: this.genomeEngine,
        brainGenerator: this.brainGenerator,
        mutationEngine: this.mutationEngine
      });
      this.nextOrganismId += 1;
      newborns.push(child);
      occupied.add(`${childPosition.x},${childPosition.y}`);
      this.births += 1;
      this.birthMarkers.push({
        x: childPosition.x,
        y: childPosition.y,
        ttl: 10
      });

      if (facetBirthSite && child.genomeProfile.traits.canCouple
        && (this.facetReserves.get(sourceFacet.key) ?? 0) >= this.config.facet.reserveRequiredForBirth) {
        const investment = Math.min(this.config.facet.reserveInvestmentPerBirth, this.facetReserves.get(sourceFacet.key));
        this.facetReserves.set(sourceFacet.key, this.facetReserves.get(sourceFacet.key) - investment);
        this.seedStructuralBond(organism.id, child.id, investment / 2);
        this.seedStructuralBond(facetBirthSite.partner.id, child.id, investment / 2);
        this.structuralBirths += 1;
        this.facetBirths += 1;
        this.facetReserveSpent += investment;
        this.structuralSeedEnergy += investment;
        this.recordTelemetry("facet-birth", `Facet ${sourceFacet.key} budded #${child.id} and invested ${investment.toFixed(1)} structural capital into two bond seeds.`);
      } else if (localPosition && child.genomeProfile.traits.canCouple) {
        const seedEnergy = Math.min(organism.energy, this.config.bond.buddingReserveInvestment);
        if (seedEnergy > 0) {
          organism.energy -= seedEnergy;
          this.seedStructuralBond(organism.id, child.id, seedEnergy);
          this.structuralBirths += 1;
          this.structuralSeedEnergy += seedEnergy;
          this.recordTelemetry("structural-birth", `Organism #${organism.id} locally budded #${child.id} and invested ${seedEnergy.toFixed(1)} energy into a bond seed.`);
        }
      }
      if (facetBirthSite && child.genomeProfile.traits.canCouple && nurseryCredit > 0) {
        this.facetNurseryCredits.set(sourceFacet.key, nurseryCredit - 1);
        this.recordTelemetry("refinery-nursery", `Facet ${sourceFacet.key} spent one restored-habitat nursery credit on structural child #${child.id}.`);
      }
    }

    this.organisms.push(...newborns);
  }

  isActivelyBonded(organismId) {
    return [...this.bonds.values()].some((bond) => bond.firstId === organismId || bond.secondId === organismId);
  }

  findLocalBirthPosition(parent, occupied) {
    const offset = Math.floor(this.random() * DIRECTIONS.length);
    for (let index = 0; index < DIRECTIONS.length; index += 1) {
      const direction = DIRECTIONS[(offset + index) % DIRECTIONS.length];
      const position = this.world.wrapPosition(parent.x + direction.x, parent.y + direction.y);
      if (this.world.isWalkable(position.x, position.y) && !occupied.has(`${position.x},${position.y}`)) {
        return position;
      }
    }
    return null;
  }

  findFacetBirthSite(parent, facet, occupied) {
    const byId = new Map(this.organisms.filter((organism) => organism.alive).map((organism) => [organism.id, organism]));
    const partners = facet.memberIds.map((id) => byId.get(id)).filter((member) => member && member.id !== parent.id);
    const offset = Math.floor(this.random() * DIRECTIONS.length);
    for (let index = 0; index < DIRECTIONS.length; index += 1) {
      const direction = DIRECTIONS[(offset + index) % DIRECTIONS.length];
      const position = this.world.wrapPosition(parent.x + direction.x, parent.y + direction.y);
      if (!this.world.isWalkable(position.x, position.y) || occupied.has(`${position.x},${position.y}`)) continue;
      const partner = partners.find((member) => this.isPositionAdjacentToMember(position, member));
      if (partner) return { position, partner };
    }
    return null;
  }

  isPositionAdjacentToMember(position, member) {
    const xDistance = Math.abs(position.x - member.x);
    const yDistance = Math.abs(position.y - member.y);
    const wrappedX = this.world.wraps ? Math.min(xDistance, this.world.width - xDistance) : xDistance;
    const wrappedY = this.world.wraps ? Math.min(yDistance, this.world.height - yDistance) : yDistance;
    return wrappedX <= 2 && wrappedY <= 2;
  }

  seedStructuralBond(firstId, secondId, energy) {
    const key = this.bondKey(firstId, secondId);
    this.structuralBirthSeeds.set(key, (this.structuralBirthSeeds.get(key) ?? 0) + energy);
    this.bondCandidates.set(key, 0);
  }

  getReproductionOpportunity() {
    const population = this.organisms.filter((organism) => organism.alive).length;
    const food = this.world.countTilesByType(TILE_TYPES.FOOD);
    const walkableTiles = this.world.width * this.world.height - this.world.countTilesByType(TILE_TYPES.WALL);
    const foodCapacity = Math.floor((this.world.width * this.world.height * this.config.world.foodTargetDensity)
      / this.config.ecology.reproductionFoodUnitsPerOrganism);
    const habitatCapacity = Math.floor(walkableTiles * this.config.ecology.reproductionHabitatFraction);
    const carryingCapacity = Math.max(1, Math.min(foodCapacity, habitatCapacity));
    const foodPressure = clamp(food / Math.max(1, population * this.config.ecology.reproductionFoodUnitsPerOrganism), 0, 1);
    const densityPressure = clamp(1 - (population / carryingCapacity) ** 2, 0, 1);

    return {
      opportunity: Number((this.config.ecology.maximumReproductionOpportunity * foodPressure * densityPressure).toFixed(3)),
      carryingCapacity,
      foodPressure: Number(foodPressure.toFixed(3)),
      densityPressure: Number(densityPressure.toFixed(3))
    };
  }

  removeDeadOrganisms() {
    const deadOrganisms = this.organisms.filter((organism) => !organism.alive);
    for (const organism of deadOrganisms) {
      if (this.config.chemistry.enabled) this.world.addDetritus(organism.x, organism.y);
      this.deathMarkers.push({
        x: organism.x,
        y: organism.y,
        ttl: 14
      });
    }

    const before = this.organisms.length;
    this.organisms = this.organisms.filter((organism) => organism.alive);
    this.removeInvalidBonds();
    this.deaths += before - this.organisms.length;
  }

  updateMarkers() {
    this.birthMarkers = this.birthMarkers
      .map((marker) => ({ ...marker, ttl: marker.ttl - 1 }))
      .filter((marker) => marker.ttl > 0);

    this.deathMarkers = this.deathMarkers
      .map((marker) => ({ ...marker, ttl: marker.ttl - 1 }))
      .filter((marker) => marker.ttl > 0);

    this.energyTransfers = this.energyTransfers
      .map((transfer) => ({ ...transfer, ttl: transfer.ttl - 1 }))
      .filter((transfer) => transfer.ttl > 0);

    this.primaryProductionMarkers = this.primaryProductionMarkers
      .map((marker) => ({ ...marker, ttl: marker.ttl - 1 }))
      .filter((marker) => marker.ttl > 0);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
    this.lastTickTime = Date.now();
  }

  togglePause() {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  reset() {
    this.random = createSeededRandom(this.seed);
    this.world = new World(this.config.world, this.random);
    if (this.config.hazards.fireEnabled) {
      this.world.igniteRandomFood(this.config.hazards.fireDuration, this.config.chemistry.enabled);
    }
    this.organisms = [];
    this.simulationTicks = 0;
    this.births = 0;
    this.deaths = 0;
    this.birthMarkers = [];
    this.deathMarkers = [];
    this.bonds.clear();
    this.bondCandidates.clear();
    this.structuralBirthSeeds.clear();
    this.facetReserves.clear();
    this.telemetryEvents = [];
    this.bondsFormed = 0;
    this.bondsBroken = 0;
    this.bondBreakReasons = {};
    this.refineryProgress.clear();
    this.facetCatalysts.clear();
    this.facetNurseryCredits.clear();
    this.facetNiches.clear();
    this.refineryConversions = 0;
    this.refineryFoodReleased = 0;
    this.refineryNutrientsProduced = 0;
    this.collectiveWorkCompletions = 0;
    this.collectiveWorkFoodReleased = 0;
    this.collectiveWorkAttendances = 0;
    this.collectiveWorkFieldHarvests = 0;
    this.collectiveWorkFieldHarvestsByWorkers = 0;
    this.collectiveWorkFieldHarvestsByOthers = 0;
    this.collectiveWorkHarvestLineages.clear();
    this.nextCourierReportId = 1;
    this.courierReportsCreated = 0;
    this.courierHandoffs = 0;
    this.nextCourierReportTick = 0;
    this.energyTransfers = [];
    this.primaryProductionMarkers = [];
    this.facetWorkTrail = Array.from({ length: this.world.height }, () => Array(this.world.width).fill(0));
    this.compoundHeadings.clear();
    this.facetTransfers = 0;
    this.facetEnergyShared = 0;
    this.facetHarvests = 0;
    this.facetHarvestEnergy = 0;
    this.facetHarvestReserveEnergy = 0;
    this.facetBirths = 0;
    this.facetReserveSpent = 0;
    this.bondsFed = 0;
    this.bondEnergyFed = 0;
    this.bondSupportTransfers = 0;
    this.bondSupportEnergyReleased = 0;
    this.structuralBirths = 0;
    this.structuralSeedEnergy = 0;
    this.collectiveMoves = 0;
    this.collectiveResourceDirectedMoves = 0;
    this.primaryResourceUnits = 0;
    this.primaryPotentialEnergy = 0;
    this.latestPrimaryProduction = 0;
    this.initializeWorkGates();
    this.snapshotVersion += 1;
    this.seedInitialPopulation(this.config.organism.initialPopulation);
  }

  randomize() {
    this.setSeed((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
  }

  setSeed(seed) {
    this.seed = normalizeSeed(seed);
    this.reset();
  }

  setWorldNumber(worldNumber) {
    const generatedWorld = this.generatorEngine.generate(this.baseConfig, worldNumber);
    const founderGenome = this.config.organism.founderGenome;
    this.worldNumber = generatedWorld.composition.number;
    this.config = generatedWorld.config;
    this.config.organism.founderGenome = founderGenome;
    this.speed = this.config.simulation.defaultSpeed;
    this.reset();
  }

  setSpeed(speed) {
    const numericSpeed = Number(speed);
    if (this.config.simulation.speedOptions.includes(numericSpeed)) {
      this.speed = numericSpeed;
    }
  }

  setFoodGrowthRate(growthRate) {
    this.config.food.growthRate = clamp(Number(growthRate), 0, 1);
  }

  setFoodTargetDensity(targetDensity) {
    this.config.world.foodTargetDensity = clamp(Number(targetDensity), 0, 0.5);
  }

  setMutationRate(mutationRate) {
    this.config.organism.mutationRate = clamp(Number(mutationRate), 0, 0.25);
  }

  setSignalEmissionCost(emissionCost) {
    this.config.signal.emissionCost = clamp(Number(emissionCost), 0, 1);
  }

  bondKey(firstId, secondId) {
    return firstId < secondId ? `${firstId}:${secondId}` : `${secondId}:${firstId}`;
  }

  recordTelemetry(type, message) {
    this.telemetryEvents.push({ tick: this.simulationTicks, type, message });
    if (this.telemetryEvents.length > MAX_TELEMETRY_EVENTS) this.telemetryEvents.shift();
  }

  getCoupledIds() {
    const ids = new Set([...this.bonds.values()].flatMap((bond) => [bond.firstId, bond.secondId]));
    for (const key of this.bondCandidates.keys()) {
      const [firstId, secondId] = key.split(":").map(Number);
      ids.add(firstId);
      ids.add(secondId);
    }
    return ids;
  }

  getNeighborStatesByOrganism() {
    const statesById = new Map(this.organisms
      .filter((organism) => organism.alive)
      .map((organism) => [organism.id, []]));
    const organismsById = new Map(this.organisms
      .filter((organism) => organism.alive)
      .map((organism) => [organism.id, organism]));

    for (const bond of this.bonds.values()) {
      const first = organismsById.get(bond.firstId);
      const second = organismsById.get(bond.secondId);
      if (!first || !second) continue;
      statesById.get(first.id)?.push({ id: second.id, value: second.getPersistentState() });
      statesById.get(second.id)?.push({ id: first.id, value: first.getPersistentState() });
    }
    return statesById;
  }

  getStructuralFocus(organism) {
    if (!organism.genomeProfile.traits.canCouple) return null;
    const facet = this.getStrongestFacetForMember(organism.id);
    if (!facet) return null;
    if (this.getActiveCollectiveWorkFields().some((field) => this.distanceToGate(organism, field) <= field.radius)) return "gate-field";
    if (!this.config.refinery.enabled) return null;
    return (this.facetCatalysts.get(facet.key) ?? 0) > 0 ? "material" : "catalyst";
  }

  recordFacetWorkTrail() {
    const organismsById = new Map(this.organisms.filter((organism) => organism.alive).map((organism) => [organism.id, organism]));
    const activeFacets = this.getFacets()
      .filter((facet) => this.getFacetStrength(facet.memberIds) >= this.config.facet.minimumBondStrength);
    for (const facet of activeFacets) {
      for (const memberId of facet.memberIds) {
        const member = organismsById.get(memberId);
        if (!member) continue;
        // Observation only: this history is never consulted by simulation physics.
        this.facetWorkTrail[member.y][member.x] = Math.min(255, this.facetWorkTrail[member.y][member.x] + 1);
      }
    }
  }

  getActiveCollectiveWorkFields() {
    return this.workGates
      .filter((gate) => gate.fieldStrength > 0)
      .map((gate) => ({
        x: gate.x,
        y: gate.y,
        strength: gate.fieldStrength,
        radius: this.config.collectiveWork.gateFieldSenseRadius,
        outputMode: this.config.collectiveWork.gateOutputMode
      }));
  }

  decayCourierKnowledge() {
    if (!this.config.courier.enabled) return;
    for (const organism of this.organisms) {
      for (const key of ["courierReport", "courierMemory"]) {
        if (!organism[key]) continue;
        organism[key].ttl -= 1;
        if (organism[key].ttl <= 0) organism[key] = null;
      }
    }
    this.limitCourierReports();
  }

  limitCourierReports() {
    const activeReports = this.organisms.filter((organism) => organism.alive && organism.courierReport)
      .sort((first, second) => second.energy - first.energy || first.id - second.id);
    for (const organism of activeReports.slice(this.config.courier.maxActiveScouts)) organism.courierReport = null;
  }

  getCourierSpecialists() {
    return this.organisms
      .filter((organism) => organism.alive && !this.isActivelyBonded(organism.id)
        && organism.energy >= this.config.courier.highEnergyThreshold
        && organism.genomeProfile.traits.canShareInformation && organism.genomeProfile.traits.canPersistState)
      .sort((first, second) => second.energy - first.energy || first.id - second.id)
      .slice(0, this.config.courier.maxActiveScouts);
  }

  findCourierObservation(organism) {
    const radius = this.config.courier.observationRadius;
    const actionableGate = this.workGates
      .filter((gate) => gate.fieldStrength <= 0 && gate.phase === "observe")
      .sort((first, second) => this.distanceToGate(organism, first) - this.distanceToGate(organism, second))[0];
    if (!actionableGate || this.distanceToGate(organism, actionableGate) > radius) return null;
    return {
      x: actionableGate.x,
      y: actionableGate.y,
      type: "GATE_READY",
      phase: actionableGate.phase,
      distance: this.distanceToGate(organism, actionableGate)
    };
  }

  createCourierReport(organism) {
    if (!this.config.courier.enabled || !organism.alive || organism.energy < this.config.courier.highEnergyThreshold
      || !organism.genomeProfile.traits.canShareInformation || !organism.genomeProfile.traits.canPersistState
      || this.isActivelyBonded(organism.id)) return;
    if (!this.getCourierSpecialists().some((specialist) => specialist.id === organism.id)) return;
    if (this.simulationTicks < this.nextCourierReportTick) return;
    const observation = this.findCourierObservation(organism);
    if (!observation) return;
    // A scout carries one observation through its finite lifetime; it does not rewrite its message every tick.
    if (organism.courierReport) return;
    organism.courierReport = {
      id: this.nextCourierReportId++,
      type: observation.type,
      x: observation.x,
      y: observation.y,
      ttl: this.config.courier.reportLifetime,
      sourceId: organism.id,
      sourceLineageId: organism.lineageId
    };
    this.courierReportsCreated += 1;
    this.nextCourierReportTick = this.simulationTicks + this.config.courier.reportInterval;
    this.limitCourierReports();
    this.recordTelemetry("courier-observation", `Scout #${organism.id} recorded ${observation.type} at ${observation.x},${observation.y}.`);
  }

  updateCourierExchange() {
    if (!this.config.courier.enabled) return;
    const byId = new Map(this.organisms.filter((organism) => organism.alive).map((organism) => [organism.id, organism]));
    const coupledIds = this.getCoupledIds();
    const couriers = this.organisms.filter((organism) => organism.alive && !coupledIds.has(organism.id) && organism.courierReport);
    for (const groupIds of this.getBondGroups()) {
      const members = groupIds.map((id) => byId.get(id)).filter(Boolean);
      const eligibleFacet = members.length >= 3 && members.some((member) => this.getStrongestFacetForMember(member.id));
      if (!eligibleFacet) continue;
      for (const courier of couriers) {
        if (!members.some((member) => this.areAdjacent(courier, member))) continue;
        const report = courier.courierReport;
        const existing = members.find((member) => member.courierMemory)?.courierMemory ?? null;
        if (!this.shouldAcceptCourierReport(report, existing, members)) continue;
        let accepted = false;
        for (const member of members) {
          if (member.courierMemory?.id === report.id) continue;
          member.courierMemory = { ...report };
          accepted = true;
        }
        if (accepted) {
          this.courierHandoffs += 1;
          courier.energy = Math.max(0, courier.energy - this.config.courier.handoffEnergyCost);
          this.recordTelemetry("courier-handoff", `Scout #${courier.id} passed ${report.type} location to bonded compound ${groupIds.join(",")}.`);
        }
      }
    }
  }

  courierReportPriority(report) {
    return report?.type === "GATE_READY" ? 2 : 1;
  }

  shouldAcceptCourierReport(candidate, existing, members) {
    if (!existing) return true;
    if (existing.id === candidate.id) return false;
    const candidatePriority = this.courierReportPriority(candidate);
    const existingPriority = this.courierReportPriority(existing);
    if (candidatePriority !== existingPriority) return candidatePriority > existingPriority;
    const distance = (report) => Math.min(...members.map((member) => {
      const xDistance = Math.abs(member.x - report.x);
      const yDistance = Math.abs(member.y - report.y);
      const wrappedX = this.world.wraps ? Math.min(xDistance, this.world.width - xDistance) : xDistance;
      const wrappedY = this.world.wraps ? Math.min(yDistance, this.world.height - yDistance) : yDistance;
      return Math.max(wrappedX, wrappedY);
    }));
    return existing.ttl <= this.config.courier.reportLifetime / 3 || distance(candidate) + 1 < distance(existing);
  }

  getCourierTarget(organism) {
    if (!this.config.courier.enabled || !this.isActivelyBonded(organism.id) || !this.getStrongestFacetForMember(organism.id) || !organism.courierMemory) return null;
    return organism.courierMemory;
  }

  initializeWorkGates() {
    this.workGates = [];
    if (!this.config.collectiveWork.enabled) return;
    const occupied = new Set();
    for (let index = 0; index < this.config.collectiveWork.gateCount; index += 1) {
      const position = this.world.findRandomOpenPosition(occupied);
      if (!position) break;
      occupied.add(`${position.x},${position.y}`);
      this.workGates.push({
        id: index + 1,
        ...position,
        phase: "observe",
        phaseTick: 0,
        progress: 0,
        targetState: null,
        attendingFacetKey: null,
        cooldown: 0,
        fieldStrength: 0,
        productionBudget: 0,
        fieldFacetKey: null,
        fieldPorts: null,
        nextPortIndex: 0
      });
    }
  }

  distanceToGate(organism, gate) {
    const xDistance = Math.abs(organism.x - gate.x);
    const yDistance = Math.abs(organism.y - gate.y);
    const wrappedX = this.world.wraps ? Math.min(xDistance, this.world.width - xDistance) : xDistance;
    const wrappedY = this.world.wraps ? Math.min(yDistance, this.world.height - yDistance) : yDistance;
    return Math.max(wrappedX, wrappedY);
  }

  getCollectiveWorkCue(organism) {
    if (!this.config.collectiveWork.enabled || !organism.genomeProfile.traits.canShareInformation) return 0;
    const gate = this.workGates
      .filter((candidate) => candidate.phase === "observe" && candidate.cooldown <= 0)
      .sort((first, second) => this.distanceToGate(organism, first) - this.distanceToGate(organism, second))[0];
    if (!gate || this.distanceToGate(organism, gate) > this.config.collectiveWork.gateRadius) return 0;
    // A gate exposes three local fragments rather than one globally labelled answer.
    const fragment = Math.abs(organism.x - gate.x + 2 * (organism.y - gate.y) + 9) % 3;
    return [0.25, 0.8, 1.35][fragment];
  }

  getFacetAtWorkGate(gate) {
    const organismsById = new Map(this.organisms.filter((organism) => organism.alive).map((organism) => [organism.id, organism]));
    return this.getFacets()
      .map((facet) => ({ ...facet, members: facet.memberIds.map((id) => organismsById.get(id)).filter(Boolean) }))
      .filter((facet) => facet.members.length === 3)
      .filter((facet) => this.getFacetStrength(facet.memberIds) >= this.config.facet.minimumBondStrength)
      .filter((facet) => facet.members.every((member) => member.genomeProfile.traits.canCouple
        && member.genomeProfile.traits.canPersistState && member.genomeProfile.traits.canShareInformation))
      .filter((facet) => facet.members.every((member) => this.distanceToGate(member, gate) <= this.config.collectiveWork.gateRadius))
      .sort((first, second) => first.key.localeCompare(second.key))[0] ?? null;
  }

  releaseCollectiveWorkFood(gate, requested = 1) {
    if (this.config.collectiveWork.gateOutputMode === "port-coupled") {
      return this.releasePortCoupledFood(gate, requested);
    }
    return this.releaseDiffuseCollectiveWorkFood(gate, requested);
  }

  getGateWorkPorts(gate) {
    if (Array.isArray(gate.fieldPorts) && gate.fieldPorts.length) {
      return gate.fieldPorts.map((port, index) => ({ x: port.x, y: port.y, index }));
    }
    const offsets = [{ x: 0, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }];
    const seen = new Set();
    return offsets.flatMap((offset, index) => {
      const position = this.world.wrapPosition(gate.x + offset.x, gate.y + offset.y);
      const key = `${position.x},${position.y}`;
      if (seen.has(key)) return [];
      seen.add(key);
      return [{ ...position, index }];
    });
  }

  setGateFieldPorts(gate, facet) {
    // The active ports are the three cells physically occupied by the exact facet doing the work.
    // They remain readable on canvas as green rings, while the gate itself remains fixed in the world.
    gate.fieldPorts = facet.members.map((member) => ({ x: member.x, y: member.y }));
  }

  releasePortCoupledFood(gate, requested = 1) {
    const ports = this.getGateWorkPorts(gate);
    let released = 0;
    for (let attempt = 0; attempt < ports.length && released < requested; attempt += 1) {
      const portIndex = (gate.nextPortIndex + attempt) % ports.length;
      const port = ports[portIndex];
      const tile = this.world.getTile(port.x, port.y);
      if (tile.type !== TILE_TYPES.EMPTY || this.world.isBurning(port.x, port.y)) continue;
      tile.type = TILE_TYPES.FOOD;
      tile.resource = [RESOURCE_TYPES.GREEN, RESOURCE_TYPES.BLUE, RESOURCE_TYPES.RED][port.index % 3];
      tile.foodOrigin = { type: "gate-field", mode: "port-coupled", gateId: gate.id, facetKey: gate.fieldFacetKey ?? null, portIndex: port.index };
      gate.nextPortIndex = (portIndex + 1) % ports.length;
      released += 1;
    }
    return released;
  }

  releaseDiffuseCollectiveWorkFood(gate, requested = 1) {
    let released = 0;
    for (let radius = 0; radius <= 2 && released < requested; radius += 1) {
      for (let dy = -radius; dy <= radius && released < requested; dy += 1) {
        for (let dx = -radius; dx <= radius && released < requested; dx += 1) {
          const position = this.world.wrapPosition(gate.x + dx, gate.y + dy);
          const tile = this.world.getTile(position.x, position.y);
          if (tile.type !== TILE_TYPES.EMPTY || this.world.isBurning(position.x, position.y)) continue;
          tile.type = TILE_TYPES.FOOD;
          tile.resource = [RESOURCE_TYPES.GREEN, RESOURCE_TYPES.BLUE, RESOURCE_TYPES.RED][released % 3];
          tile.foodOrigin = { type: "gate-field", mode: "diffuse", gateId: gate.id, facetKey: gate.fieldFacetKey ?? null };
          released += 1;
        }
      }
    }
    return released;
  }

  updateCollectiveWorkFields() {
    for (const gate of this.workGates) {
      if (gate.fieldStrength <= 0) continue;
      if (this.config.collectiveWork.gateOutputMode === "port-coupled") {
        const maintainingFacet = this.getFacetAtWorkGate(gate);
        if (!maintainingFacet || maintainingFacet.key !== gate.fieldFacetKey) {
          gate.fieldStrength = 0;
          gate.productionBudget = 0;
          gate.fieldPorts = null;
          this.recordTelemetry("gate-field-ended", `Gate #${gate.id} production stopped because facet ${gate.fieldFacetKey ?? "unknown"} left or dissolved.`);
          continue;
        }
        this.setGateFieldPorts(gate, maintainingFacet);
      }
      gate.fieldStrength = Math.max(0, gate.fieldStrength - this.config.collectiveWork.gateFieldDecay);
      const productionRate = this.config.collectiveWork.gateOutputMode === "port-coupled"
        ? this.config.collectiveWork.gatePortFoodRate
        : this.config.collectiveWork.gateFieldFoodRate;
      gate.productionBudget += gate.fieldStrength * productionRate;
      while (gate.productionBudget >= 1) {
        const released = this.releaseCollectiveWorkFood(gate, 1);
        if (released <= 0) break;
        gate.productionBudget -= 1;
        this.collectiveWorkFoodReleased += released;
      }
    }
  }

  recordCollectiveWorkHarvest(organism, origin) {
    const facet = this.getStrongestFacetForMember(organism.id);
    const workerHarvest = Boolean(origin.facetKey && facet?.key === origin.facetKey);
    this.collectiveWorkFieldHarvests += 1;
    if (workerHarvest) this.collectiveWorkFieldHarvestsByWorkers += 1;
    else this.collectiveWorkFieldHarvestsByOthers += 1;
    const lineage = this.collectiveWorkHarvestLineages.get(organism.lineageId) ?? {
      lineageId: organism.lineageId,
      harvests: 0,
      workerHarvests: 0,
      otherHarvests: 0,
      latestGeneration: organism.generation,
      genome: organism.genomeProfile.expression
    };
    lineage.harvests += 1;
    if (workerHarvest) lineage.workerHarvests += 1;
    else lineage.otherHarvests += 1;
    lineage.latestGeneration = Math.max(lineage.latestGeneration, organism.generation);
    this.collectiveWorkHarvestLineages.set(organism.lineageId, lineage);
    this.recordTelemetry("gate-field-harvest", `Lineage ${organism.lineageId}, organism #${organism.id} (generation ${organism.generation}) harvested gate #${origin.gateId} food as ${workerHarvest ? "responsible facet member" : "local competitor"}.`);
  }

  updateCollectiveWork() {
    if (!this.config.collectiveWork.enabled) return;
    this.updateCollectiveWorkFields();
    for (const gate of this.workGates) {
      if (gate.cooldown > 0) {
        gate.cooldown -= 1;
        if (gate.cooldown === 0) {
          gate.phase = "observe";
          gate.phaseTick = 0;
        }
        continue;
      }
      gate.phaseTick += 1;
      const facet = this.getFacetAtWorkGate(gate);
      if (gate.phase === "observe") {
        if (gate.phaseTick < this.config.collectiveWork.observeTicks) continue;
        gate.phase = "respond";
        gate.phaseTick = 0;
        gate.progress = 0;
        gate.attendingFacetKey = facet?.key ?? null;
        if (facet) this.collectiveWorkAttendances += 1;
        gate.targetState = facet
          ? average(facet.members.map((member) => member.getPersistentState() ?? 0))
          : null;
        continue;
      }

      const validFacet = facet && facet.key === gate.attendingFacetKey && gate.targetState !== null;
      const values = validFacet ? facet.members.map((member) => member.getPersistentState() ?? 0) : [];
      const spread = values.length ? Math.max(...values) - Math.min(...values) : Infinity;
      if (validFacet && spread <= this.config.collectiveWork.consensusTolerance) {
        gate.progress += 1;
      } else {
        gate.progress = 0;
      }
      if (gate.progress >= this.config.collectiveWork.requiredConsensusTicks) {
        this.collectiveWorkCompletions += 1;
        gate.fieldStrength = this.config.collectiveWork.gateFieldMaximum;
        gate.productionBudget = 0;
        gate.fieldFacetKey = facet.key;
        this.setGateFieldPorts(gate, facet);
        gate.nextPortIndex = 0;
        // A solved gate immediately materializes one ordinary unit at a visible work port.
        // This is not energy transfer: the unit remains physical, contestable food. It prevents a
        // newly successful facet from having to survive an additional tick before its field can begin.
        if (this.config.collectiveWork.gateOutputMode === "port-coupled") {
          this.collectiveWorkFoodReleased += this.releasePortCoupledFood(gate, 1);
        }
        this.recordTelemetry("consensus-gate", `Facet ${facet.key} completed consensus gate #${gate.id}; its ${this.config.collectiveWork.gateOutputMode === "port-coupled" ? "three work-port" : "local production"} field is active.`);
        gate.cooldown = 0;
        gate.phase = "observe";
        gate.phaseTick = 0;
        gate.progress = 0;
        gate.targetState = null;
        gate.attendingFacetKey = null;
      } else if (gate.phaseTick >= this.config.collectiveWork.responseTicks) {
        gate.phase = "observe";
        gate.phaseTick = 0;
        gate.progress = 0;
        gate.targetState = null;
        gate.attendingFacetKey = null;
      }
    }
  }

  getBondGroups() {
    const links = new Map();
    for (const bond of this.bonds.values()) {
      if (!links.has(bond.firstId)) links.set(bond.firstId, new Set());
      if (!links.has(bond.secondId)) links.set(bond.secondId, new Set());
      links.get(bond.firstId).add(bond.secondId);
      links.get(bond.secondId).add(bond.firstId);
    }

    const groups = [];
    const visited = new Set();
    for (const id of links.keys()) {
      if (visited.has(id)) continue;
      const group = [];
      const queue = [id];
      visited.add(id);
      while (queue.length) {
        const currentId = queue.shift();
        group.push(currentId);
        for (const neighborId of links.get(currentId) ?? []) {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      }
      groups.push(group);
    }
    return groups;
  }

  getFacets() {
    const links = new Map();
    for (const bond of this.bonds.values()) {
      if (!links.has(bond.firstId)) links.set(bond.firstId, new Set());
      if (!links.has(bond.secondId)) links.set(bond.secondId, new Set());
      links.get(bond.firstId).add(bond.secondId);
      links.get(bond.secondId).add(bond.firstId);
    }
    const facets = [];
    for (const [firstId, firstLinks] of links) {
      for (const secondId of firstLinks) {
        if (secondId <= firstId) continue;
        for (const thirdId of links.get(secondId) ?? []) {
          if (thirdId <= secondId || !firstLinks.has(thirdId)) continue;
          const memberIds = [firstId, secondId, thirdId];
          const key = this.facetKey(memberIds);
          facets.push({ memberIds, key, reserve: this.facetReserves.get(key) ?? 0 });
        }
      }
    }
    return facets;
  }

  facetKey(memberIds) {
    return [...memberIds].sort((first, second) => first - second).join(":");
  }

  updateFacetReserves() {
    const activeKeys = new Set(this.getFacets().map((facet) => facet.key));
    for (const key of this.facetReserves.keys()) {
      if (!activeKeys.has(key)) this.facetReserves.delete(key);
    }
    for (const key of this.facetCatalysts.keys()) {
      if (!activeKeys.has(key)) this.facetCatalysts.delete(key);
    }
    for (const key of this.facetNurseryCredits.keys()) {
      if (!activeKeys.has(key)) this.facetNurseryCredits.delete(key);
    }
  }

  storeFacetCatalyst(eater) {
    if (!this.config.refinery.enabled) return;
    const facet = this.getStrongestFacetForMember(eater.id);
    if (!facet) return;
    const stored = Math.min(this.config.refinery.catalystCapacity, (this.facetCatalysts.get(facet.key) ?? 0) + 1);
    this.facetCatalysts.set(facet.key, stored);
    this.recordTelemetry("red-catalyst", `Facet ${facet.key} retained red catalyst ${stored}/${this.config.refinery.catalystCapacity}.`);
  }

  updateFacetRefineries() {
    if (!this.config.refinery.enabled) {
      this.refineryProgress.clear();
      return;
    }
    const byId = new Map(this.organisms.filter((organism) => organism.alive).map((organism) => [organism.id, organism]));
    const activeKeys = new Set();
    for (const facet of this.getFacets()) {
      if (this.getFacetStrength(facet.memberIds) < this.config.facet.minimumBondStrength) continue;
      if ((this.facetCatalysts.get(facet.key) ?? 0) < 1) continue;
      const members = facet.memberIds.map((id) => byId.get(id)).filter(Boolean);
      if (members.length !== 3) continue;
      const patch = this.findFacetRefineryPatch(members);
      if (!patch) continue;
      const key = `${facet.key}@${patch.x},${patch.y}`;
      activeKeys.add(key);
      const ticks = (this.refineryProgress.get(key) ?? 0) + 1;
      if (ticks < this.config.refinery.candidateTicks) {
        this.refineryProgress.set(key, ticks);
        continue;
      }
      const result = this.world.refineMaterial(patch.x, patch.y, this.config.refinery.nutrientYield);
      this.refineryProgress.delete(key);
      if (result.material <= 0) continue;
      this.refineryConversions += 1;
      this.facetNiches.set(facet.key, { x: patch.x, y: patch.y });
      this.facetCatalysts.set(facet.key, Math.max(0, (this.facetCatalysts.get(facet.key) ?? 0) - 1));
      const credits = Math.min(this.config.refinery.nurseryCreditCapacity, (this.facetNurseryCredits.get(facet.key) ?? 0) + 1);
      this.facetNurseryCredits.set(facet.key, credits);
      this.refineryFoodReleased += result.foodReleased;
      this.refineryNutrientsProduced += result.nutrients;
      this.recordTelemetry("facet-refinery", `Facet ${facet.key} refined ${result.material.toFixed(2)} stored material at ${patch.x},${patch.y}, releasing ${result.foodReleased} food and ${result.nutrients.toFixed(2)} nutrients.`);
    }
    for (const key of this.refineryProgress.keys()) {
      if (!activeKeys.has(key)) this.refineryProgress.delete(key);
    }
  }

  updateFacetNiches() {
    if (!this.nicheMaintenanceEnabled) return;
    const active = new Set();
    const byId = new Map(this.organisms.filter((organism) => organism.alive).map((organism) => [organism.id, organism]));
    for (const facet of this.getFacets()) {
      const niche = this.facetNiches.get(facet.key);
      const members = facet.memberIds.map((id) => byId.get(id)).filter(Boolean);
      if (!niche || members.length !== 3 || this.getFacetStrength(facet.memberIds) < this.config.facet.minimumBondStrength) continue;
      if (!members.some((member) => this.areAdjacent(member, niche))) continue;
      this.world.reinforceEngineeredFertility(
        niche.x,
        niche.y,
        this.config.environment.engineeredFertilityReinforcement,
        this.config.environment.engineeredFertilityMaximum
      );
      active.add(facet.key);
    }
    for (const key of this.facetNiches.keys()) if (!active.has(key) && !this.getFacets().some((facet) => facet.key === key)) this.facetNiches.delete(key);
  }

  findFacetRefineryPatch(members) {
    const positions = new Map();
    for (const member of members) {
      for (let deltaX = -2; deltaX <= 2; deltaX += 1) {
        for (let deltaY = -2; deltaY <= 2; deltaY += 1) {
          const position = this.world.wrapPosition(member.x + deltaX, member.y + deltaY);
          positions.set(`${position.x},${position.y}`, position);
        }
      }
    }
    let strongest = null;
    for (const position of positions.values()) {
      if (!members.every((member) => this.areAdjacent(member, position))) continue;
      const material = this.world.materialAt(position.x, position.y);
      if (material < this.config.refinery.minimumMaterial || material <= (strongest?.material ?? 0)) continue;
      strongest = { ...position, material };
    }
    return strongest;
  }

  getStrongestFacetForMember(organismId) {
    return this.getFacets()
      .filter((facet) => facet.memberIds.includes(organismId))
      .map((facet) => ({ ...facet, strength: this.getFacetStrength(facet.memberIds) }))
      .filter((facet) => facet.strength >= this.config.facet.minimumBondStrength)
      .sort((first, second) => (second.reserve - first.reserve) || (second.strength - first.strength))[0] ?? null;
  }

  getFacetStrength(memberIds) {
    const strengths = [];
    for (let first = 0; first < memberIds.length; first += 1) {
      for (let second = first + 1; second < memberIds.length; second += 1) {
        const bond = this.bonds.get(this.bondKey(memberIds[first], memberIds[second]));
        if (!bond) return 0;
        strengths.push(bond.strength);
      }
    }
    return average(strengths);
  }

  shareFacetEnergy(eater, mealEnergy) {
    const byId = new Map(this.organisms.filter((organism) => organism.alive).map((organism) => [organism.id, organism]));
    const eligibleFacets = this.getFacets()
      .filter((facet) => facet.memberIds.includes(eater.id))
      .map((facet) => ({ ...facet, strength: this.getFacetStrength(facet.memberIds) }))
      .filter((facet) => facet.strength >= this.config.facet.minimumBondStrength);
    if (!eligibleFacets.length) return;

    const recipients = new Map();
    for (const facet of eligibleFacets) {
      for (const memberId of facet.memberIds) {
        if (memberId === eater.id) continue;
        const member = byId.get(memberId);
        if (member && member.energy < eater.energy) {
          recipients.set(memberId, { organism: member, strength: facet.strength });
        }
      }
    }
    if (!recipients.size) return;

    const averageStrength = average([...recipients.values()].map((recipient) => recipient.strength));
    const pool = Math.min(eater.energy, mealEnergy * this.config.facet.sharingFraction * averageStrength);
    if (pool <= 0) return;

    const orderedRecipients = [...recipients.values()].sort((first, second) => first.organism.energy - second.organism.energy);
    const share = pool / orderedRecipients.length;
    const transfers = orderedRecipients.map((recipient) => {
      const maximumEnergy = this.config.organism.reproductionThreshold * 1.8 * (recipient.organism.genomeProfile.powers[3] ?? 1);
      return { ...recipient, transferred: Math.min(share, Math.max(0, maximumEnergy - recipient.organism.energy)) };
    }).filter((recipient) => recipient.transferred > 0);
    const transferredTotal = transfers.reduce((total, recipient) => total + recipient.transferred, 0);
    if (transferredTotal <= 0) return;

    eater.energy -= transferredTotal;
    for (const recipient of transfers) {
      const transferred = recipient.transferred;
      if (transferred <= 0) continue;
      recipient.organism.energy += transferred;
      this.energyTransfers.push({ fromId: eater.id, toId: recipient.organism.id, amount: Number(transferred.toFixed(2)), ttl: 6 });
      this.facetTransfers += 1;
      this.facetEnergyShared += transferred;
    }
    this.recordTelemetry("facet-sharing", `Facet around organism #${eater.id} shared ${transferredTotal.toFixed(1)} meal energy with weaker members.`);
  }

  applyFacetHarvestAdvantage(eater, mealEnergy) {
    const facet = this.getStrongestFacetForMember(eater.id);
    if (!facet) return 0;

    const potential = mealEnergy * this.config.facet.harvestBonusFraction * facet.strength;
    if (potential <= 0) return 0;
    const currentReserve = this.facetReserves.get(facet.key) ?? 0;
    const granted = Math.min(potential, Math.max(0, this.config.facet.reserveCapacity - currentReserve));
    if (granted <= 0) return 0;
    this.facetReserves.set(facet.key, currentReserve + granted);
    this.facetHarvests += 1;
    this.facetHarvestEnergy += granted;
    this.facetHarvestReserveEnergy += granted;
    this.recordTelemetry("facet-harvest", `Facet around organism #${eater.id} added ${granted.toFixed(1)} structural capital to facet ${facet.key}.`);
    return granted;
  }

  feedAttachedBonds(eater, mealEnergy) {
    const attachedBonds = [...this.bonds.values()].filter((bond) => bond.firstId === eater.id || bond.secondId === eater.id);
    if (!attachedBonds.length) return 0;

    const availableEnergy = Math.min(eater.energy, mealEnergy * this.config.bond.mealEnergyFraction);
    const proposedShare = availableEnergy / attachedBonds.length;
    let allocatedEnergy = 0;
    for (const bond of attachedBonds) {
      const reserve = bond.reserve ?? this.config.bond.initialReserve;
      const deposited = Math.min(proposedShare, Math.max(0, this.config.bond.reserveCapacity - reserve));
      if (deposited <= 0) continue;
      bond.reserve = reserve + deposited;
      allocatedEnergy += deposited;
      this.bondsFed += 1;
      this.bondEnergyFed += deposited;
    }
    eater.energy -= allocatedEnergy;
    return allocatedEnergy;
  }

  supportLowEnergyMember(member) {
    if (member.energy >= this.config.bond.supportThreshold) return 0;
    const attachedBonds = [...this.bonds.values()]
      .filter((bond) => bond.firstId === member.id || bond.secondId === member.id)
      .filter((bond) => (bond.reserve ?? 0) > this.config.bond.supportReserveFloor);
    if (!attachedBonds.length) return 0;

    const efficiency = 1 - this.config.bond.supportLossFraction;
    let remainingNeed = this.config.bond.supportThreshold - member.energy;
    let received = 0;
    for (const bond of attachedBonds) {
      if (remainingNeed <= 0) break;
      const available = Math.max(0, (bond.reserve ?? 0) - this.config.bond.supportReserveFloor);
      const withdrawn = Math.min(
        available,
        this.config.bond.maxSupportReleasePerTick,
        remainingNeed / efficiency
      );
      if (withdrawn <= 0) continue;
      const transferred = withdrawn * efficiency;
      bond.reserve -= withdrawn;
      member.energy += transferred;
      remainingNeed -= transferred;
      received += transferred;
      this.bondSupportTransfers += 1;
      this.bondSupportEnergyReleased += transferred;
    }
    return received;
  }

  moveCompounds() {
    const byId = new Map(this.organisms.filter((organism) => organism.alive).map((organism) => [organism.id, organism]));
    const occupied = new Set(this.organisms.filter((organism) => organism.alive).map((organism) => `${organism.x},${organism.y}`));

    const activeGroupKeys = new Set();
    for (const groupIds of this.getBondGroups()) {
      const members = groupIds.map((id) => byId.get(id)).filter(Boolean);
      if (!members.length || !members.some((member) => member.brainExecution?.effectors.move >= 0.05)) continue;
      const memberPositions = new Set(members.map((member) => `${member.x},${member.y}`));
      const groupKey = [...groupIds].sort((first, second) => first - second).join(":");
      activeGroupKeys.add(groupKey);
      const collectiveScores = Object.fromEntries(DIRECTIONS.map((direction) => [direction.name,
        members.reduce((total, member) => total + (member.brainExecution?.effectors.direction?.[direction.name] ?? 0), 0) / members.length
      ]));
      const legalDirections = DIRECTIONS.filter((direction) => {
        const targets = members.map((member) => this.world.wrapPosition(member.x + direction.x, member.y + direction.y));
        return targets.every((target) => this.world.isWalkable(target.x, target.y)
          && (!occupied.has(`${target.x},${target.y}`) || memberPositions.has(`${target.x},${target.y}`)));
      });
      if (!legalDirections.length) continue;
      const heading = this.compoundHeadings.get(groupKey) ?? members[0].direction.name;
      const strongestScore = Math.max(...legalDirections.map((direction) => collectiveScores[direction.name] ?? 0));
      const strongestDirections = legalDirections.filter((direction) => (collectiveScores[direction.name] ?? 0) === strongestScore);
      const direction = strongestDirections.find((candidate) => candidate.name === heading)
        ?? strongestDirections[0];
      this.compoundHeadings.set(groupKey, direction.name);
      const targets = members.map((member) => this.world.wrapPosition(member.x + direction.x, member.y + direction.y));
      const decision = {
        mode: "collective-graph",
        chosen: direction.name,
        scores: Object.fromEntries(Object.entries(collectiveScores).map(([name, score]) => [name, Number(score.toFixed(2))]))
      };
      members.forEach((member) => { member.collectiveDecision = decision; });
      this.collectiveMoves += 1;
      if (strongestScore > 0) this.collectiveResourceDirectedMoves += 1;

      for (const member of members) occupied.delete(`${member.x},${member.y}`);
      members.forEach((member, index) => {
        member.x = targets[index].x;
        member.y = targets[index].y;
        occupied.add(`${member.x},${member.y}`);
      });
    }
    for (const key of this.compoundHeadings.keys()) {
      if (!activeGroupKeys.has(key)) this.compoundHeadings.delete(key);
    }
  }

  areAdjacent(first, second) {
    const xDistance = Math.abs(first.x - second.x);
    const yDistance = Math.abs(first.y - second.y);
    const wrappedX = this.world.wraps ? Math.min(xDistance, this.world.width - xDistance) : xDistance;
    const wrappedY = this.world.wraps ? Math.min(yDistance, this.world.height - yDistance) : yDistance;
    return wrappedX <= 2 && wrappedY <= 2;
  }

  findAdjacentCandidatePairs(candidates) {
    const cells = new Map();
    for (const candidate of candidates) {
      const key = `${candidate.x},${candidate.y}`;
      const occupants = cells.get(key) ?? [];
      occupants.push(candidate);
      cells.set(key, occupants);
    }

    const pairs = [];
    const pairKeys = new Set();
    for (const candidate of candidates) {
      // Bonds use a Chebyshev distance of two cells, so only these 25 local cells can qualify.
      for (let deltaX = -2; deltaX <= 2; deltaX += 1) {
        for (let deltaY = -2; deltaY <= 2; deltaY += 1) {
          const position = this.world.wrapPosition(candidate.x + deltaX, candidate.y + deltaY);
          for (const neighbor of cells.get(`${position.x},${position.y}`) ?? []) {
            if (neighbor.id <= candidate.id || !this.areAdjacent(candidate, neighbor)) continue;
            const key = this.bondKey(candidate.id, neighbor.id);
            if (pairKeys.has(key)) continue;
            pairKeys.add(key);
            pairs.push([candidate, neighbor]);
          }
        }
      }
    }
    return pairs;
  }

  updateBonds() {
    for (const bond of this.bonds.values()) {
      bond.reserve = Math.max(0, (bond.reserve ?? this.config.bond.initialReserve) - this.config.bond.maintenancePerTick);
    }
    const candidates = this.organisms.filter((organism) => organism.alive && organism.brainExecution?.effectors.bind >= 0.35);
    const adjacentPairs = this.findAdjacentCandidatePairs(candidates);
    const adjacentPairKeys = new Set(adjacentPairs.map(([first, second]) => this.bondKey(first.id, second.id)));
    const neighbors = new Map(candidates.map((organism) => [organism.id, new Set()]));
    const addAdjacentPair = (first, second) => {
      const key = this.bondKey(first.id, second.id);
      if (adjacentPairKeys.has(key)) return;
      adjacentPairKeys.add(key);
      adjacentPairs.push([first, second]);
    };
    for (const [first, second] of adjacentPairs) {
      neighbors.get(first.id).add(second.id);
      neighbors.get(second.id).add(first.id);
    }
    const eligibleIds = new Set();
    const visited = new Set();
    for (const candidate of candidates) {
      if (visited.has(candidate.id)) continue;
      const component = [];
      const queue = [candidate.id];
      visited.add(candidate.id);
      while (queue.length) {
        const id = queue.shift();
        component.push(id);
        for (const neighborId of neighbors.get(id) ?? []) {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      }
      if (component.length >= 3) component.forEach((id) => eligibleIds.add(id));
    }
    const byId = new Map(this.organisms.filter((organism) => organism.alive).map((organism) => [organism.id, organism]));
    const inheritedKeys = new Set([
      ...this.structuralBirthSeeds.keys(),
      ...[...this.bonds.entries()].filter(([, bond]) => bond.inherited).map(([key]) => key)
    ]);
    for (const key of inheritedKeys) {
      const [firstId, secondId] = key.split(":").map(Number);
      const first = byId.get(firstId);
      const second = byId.get(secondId);
      if (first && second && this.areAdjacent(first, second)) {
        addAdjacentPair(first, second);
      } else if (this.structuralBirthSeeds.has(key)) {
        this.structuralBirthSeeds.delete(key);
      }
    }
    const activeKeys = new Set();
    for (const [first, second] of adjacentPairs) {
      const key = this.bondKey(first.id, second.id);
      if ((!eligibleIds.has(first.id) || !eligibleIds.has(second.id)) && !inheritedKeys.has(key)) continue;
      activeKeys.add(key);
      const ticks = (this.bondCandidates.get(key) ?? 0) + 1;
      this.bondCandidates.set(key, ticks);
      const existingBond = this.bonds.get(key);
      if (existingBond) {
        if (existingBond.reserve > 0) {
          existingBond.strength = Math.min(1, existingBond.strength + this.config.bond.repairPerTick);
        }
      } else if (ticks >= this.config.bond.buddingCandidateTicks) {
        const seedEnergy = this.structuralBirthSeeds.get(key) ?? 0;
        this.bonds.set(key, {
          firstId: first.id,
          secondId: second.id,
          strength: 0.35,
          reserve: Math.min(this.config.bond.reserveCapacity, this.config.bond.initialReserve + seedEnergy),
          inherited: this.structuralBirthSeeds.has(key)
        });
        this.structuralBirthSeeds.delete(key);
        this.bondsFormed += 1;
        this.recordTelemetry("bond-formed", `Bond formed: organisms #${first.id} and #${second.id}${seedEnergy ? " from a structural birth seed" : ""}.`);
      }
    }
    for (const key of this.bondCandidates.keys()) {
      if (!activeKeys.has(key)) {
        this.bondCandidates.delete(key);
        this.structuralBirthSeeds.delete(key);
      }
    }
    this.removeInvalidBonds();
  }

  removeInvalidBonds() {
    const byId = new Map(this.organisms.map((organism) => [organism.id, organism]));
    for (const [key, bond] of this.bonds) {
      const first = byId.get(bond.firstId);
      const second = byId.get(bond.secondId);
      if (!first || !second || !first.alive || !second.alive || !this.areAdjacent(first, second)) {
        this.bonds.delete(key);
        const deadMember = first && !first.alive ? first : second && !second.alive ? second : null;
        const reason = deadMember ? `organism #${deadMember.id} died: ${deadMember.deathReason ?? "unknown cause"}`
          : !first || !second ? "member was removed" : "members separated";
        this.recordBondBreak(bond, reason, deadMember ? `member died: ${deadMember.deathReason ?? "unknown cause"}` : reason);
      } else if (!this.bondCandidates.has(key)) {
        bond.strength = Math.max(0, bond.strength - 0.015);
        if (bond.strength === 0) {
          this.bonds.delete(key);
          const reason = bond.reserve <= 0 ? "bond energy reserve depleted" : "binding was no longer maintained";
          this.recordBondBreak(bond, reason);
        }
      } else if (bond.reserve <= 0) {
        bond.strength = Math.max(0, bond.strength - this.config.bond.starvationStrengthDecay);
        if (bond.strength === 0) {
          this.bonds.delete(key);
          this.recordBondBreak(bond, "bond energy reserve depleted");
        }
      }
    }
  }

  recordBondBreak(bond, reason, category = reason) {
    this.bondsBroken += 1;
    this.bondBreakReasons[category] = (this.bondBreakReasons[category] ?? 0) + 1;
    this.recordTelemetry("bond-broken", `Bond #${bond.firstId}-#${bond.secondId} broke: ${reason}.`);
  }

  setInitialPopulation(count) {
    this.config.organism.initialPopulation = clamp(Number(count), 1, this.world.width * this.world.height);
  }

  setFounderGenome(genome) {
    this.config.organism.founderGenome = this.genomeEngine.construct(genome).genome;
    this.reset();
  }

  setGridEnabled(enabled) {
    this.gridEnabled = Boolean(enabled);
  }

  setFacetTrailEnabled(enabled) {
    this.facetTrailEnabled = Boolean(enabled);
  }

  setCourierEnabled(enabled) {
    this.config.courier.enabled = Boolean(enabled);
    if (!this.config.courier.enabled) {
      for (const organism of this.organisms) {
        organism.courierReport = null;
        organism.courierMemory = null;
      }
    }
  }

  setFireSettings({ fireEnabled, fireIgnitionRate, fireSpreadChance, fireDuration }) {
    if (fireEnabled !== undefined) {
      this.config.hazards.fireEnabled = Boolean(fireEnabled);
      if (this.config.hazards.fireEnabled && this.world.fires.size === 0) {
        this.world.igniteRandomFood(this.config.hazards.fireDuration, this.config.chemistry.enabled);
      }
      if (!this.config.hazards.fireEnabled) this.world.fires.clear();
    }
    if (fireIgnitionRate !== undefined) this.config.hazards.fireIgnitionRate = clamp(Number(fireIgnitionRate), 0, 0.05);
    if (fireSpreadChance !== undefined) this.config.hazards.fireSpreadChance = clamp(Number(fireSpreadChance), 0, 1);
    if (fireDuration !== undefined) this.config.hazards.fireDuration = clamp(Math.round(Number(fireDuration)), 1, 20);
  }

  getStatistics() {
    const ages = this.organisms.map((organism) => organism.age);
    const energies = this.organisms.map((organism) => organism.energy);

    return {
      fps: Number(this.fpsEstimate.toFixed(1)),
      population: this.organisms.length,
      births: this.births,
      deaths: this.deaths,
      foodCount: this.world.countTilesByType(TILE_TYPES.FOOD),
      averageAge: Number(average(ages).toFixed(1)),
      oldestOrganism: ages.length ? Math.max(...ages) : 0,
      averageEnergy: Number(average(energies).toFixed(1)),
      bonds: this.bonds.size,
      simulationTime: Number((this.simulationTicks / this.config.simulation.tickRate).toFixed(1))
    };
  }

  getSnapshot() {
    const stateBearers = this.organisms.filter((organism) => organism.genomeProfile.traits.canPersistState);
    const activeStateInputs = this.organisms.reduce((total, organism) => total + (organism.sharedState?.contributors.length ?? 0), 0);
    const facets = this.getFacets();
    const totalFacetReserve = facets.reduce((total, facet) => total + facet.reserve, 0);
    return {
      version: this.snapshotVersion,
      world: {
        width: this.world.width,
        height: this.world.height,
        tiles: this.world.serializeTiles(),
        resources: this.world.serializeResources(),
        fires: this.world.serializeFires(),
        signals: this.world.serializeSignals(),
        chemistry: this.world.serializeChemistry(),
        environment: this.world.serializeEnvironment()
      },
      bonds: [...this.bonds.values()],
      facets,
      organisms: this.organisms.map((organism) => organism.serialize()),
      controls: {
        paused: this.isPaused,
        speed: this.speed,
        gridEnabled: this.gridEnabled,
        facetTrailEnabled: this.facetTrailEnabled,
        speedOptions: this.config.simulation.speedOptions
      },
      settings: {
        foodGrowthRate: this.config.food.growthRate,
        initialPopulation: this.config.organism.initialPopulation,
        universeSeed: this.seed,
        worldNumber: this.worldNumber,
        founderGenome: this.config.organism.founderGenome,
        founderGenomeDecimal: this.genomeEngine.construct(this.config.organism.founderGenome).number
      },
      ecology: {
        foodTargetDensity: this.config.world.foodTargetDensity,
        mutationRate: this.config.organism.mutationRate,
        maxPrimePower: 3,
        localFertility: this.config.ecology.localFertilityEnabled,
        averageFertility: Number(average(this.world.fertility.flat()).toFixed(3)),
        resources: this.world.countResources(),
        reproduction: this.getReproductionOpportunity(),
        principle: "Prime strength gains are bounded, diminishing, and carry maintenance costs."
      },
      environment: {
        ...this.config.environment,
        engineeredFertilityCells: this.world.engineeredFertility.flat().filter((value) => value >= this.config.environment.nicheGrowthThreshold).length
      },
      collectiveWork: {
        ...this.config.collectiveWork,
        completions: this.collectiveWorkCompletions,
        foodReleased: this.collectiveWorkFoodReleased,
        attendances: this.collectiveWorkAttendances,
        activeFields: this.workGates.filter((gate) => gate.fieldStrength > 0).length,
        fieldHarvests: this.collectiveWorkFieldHarvests,
        fieldHarvestsByWorkers: this.collectiveWorkFieldHarvestsByWorkers,
        fieldHarvestsByOthers: this.collectiveWorkFieldHarvestsByOthers,
        harvestingLineages: [...this.collectiveWorkHarvestLineages.values()].sort((first, second) => second.harvests - first.harvests),
        gates: this.workGates.map((gate) => ({
          id: gate.id,
          x: gate.x,
          y: gate.y,
          phase: gate.phase,
          phaseTick: gate.phaseTick,
          progress: gate.progress,
          cooldown: gate.cooldown,
          fieldStrength: Number(gate.fieldStrength.toFixed(2)),
          activeFacet: gate.attendingFacetKey,
          fieldFacetKey: gate.fieldFacetKey,
          outputMode: this.config.collectiveWork.gateOutputMode,
          ports: this.getGateWorkPorts(gate)
        }))
      },
      courier: {
        ...this.config.courier,
        reportsCreated: this.courierReportsCreated,
        handoffs: this.courierHandoffs,
        activeScouts: this.organisms.filter((organism) => organism.courierReport).length,
        informedBondedMembers: this.organisms.filter((organism) => organism.courierMemory && this.isActivelyBonded(organism.id)).length
      },
      hazards: { ...this.config.hazards },
      signal: { ...this.config.signal },
      bonding: { ...this.config.bond },
      facetCapital: {
        source: "Extra energy recovered when a strong closed facet harvests a resource.",
        rule: "Capital belongs to the three-member topology and can only seed two inherited bonds for a Prime-31 child.",
        reserveCapacity: this.config.facet.reserveCapacity,
        reserveRequiredForBirth: this.config.facet.reserveRequiredForBirth,
        activeFacets: facets.length,
        fundedFacets: facets.filter((facet) => facet.reserve > 0).length,
        totalReserve: Number(totalFacetReserve.toFixed(1)),
        averageReserve: Number((totalFacetReserve / Math.max(1, facets.length)).toFixed(1))
      },
      primaryProduction: {
        source: "Fertility-driven resource regrowth",
        latestResourceUnits: this.latestPrimaryProduction,
        totalResourceUnits: this.primaryResourceUnits,
        totalPotentialEnergy: Number(this.primaryPotentialEnergy.toFixed(1))
      },
      distributedState: {
        transport: "Prior-tick persistent values travel across one active bond hop.",
        stateBearers: stateBearers.length,
        activeStateInputs,
        bondedStateBearers: stateBearers.filter((organism) => (organism.sharedState?.connectedNeighbors ?? 0) > 0).length
      },
      chemistry: {
        ...this.config.chemistry,
        detritus: Number(this.world.totalMaterial(this.world.detritus).toFixed(1)),
        ash: Number(this.world.totalMaterial(this.world.ash).toFixed(1)),
        nutrients: Number(this.world.totalMaterial(this.world.nutrients).toFixed(1))
      },
      refinery: {
        enabled: this.config.refinery.enabled,
        candidateTicks: this.config.refinery.candidateTicks,
        activeProcesses: this.refineryProgress.size,
        catalystsHeld: [...this.facetCatalysts.values()].reduce((total, value) => total + value, 0),
        nurseryCredits: [...this.facetNurseryCredits.values()].reduce((total, value) => total + value, 0),
        conversions: this.refineryConversions,
        foodReleased: this.refineryFoodReleased,
        nutrientsProduced: Number(this.refineryNutrientsProduced.toFixed(1)),
        principle: "Red is a low-energy catalyst. Only a maintained strong Prime-31 facet can spend it to convert existing detritus or ash into local food, nutrients, and one structural nursery opportunity."
      },
      telemetry: {
        storage: "In memory only; newest 1,000 events retained (0 bytes written to disk).",
        bondsFormed: this.bondsFormed,
        bondsBroken: this.bondsBroken,
        bondBreakReasons: { ...this.bondBreakReasons },
        facetTransfers: this.facetTransfers,
        facetEnergyShared: Number(this.facetEnergyShared.toFixed(1)),
        facetHarvests: this.facetHarvests,
        facetHarvestEnergy: Number(this.facetHarvestEnergy.toFixed(1)),
        facetHarvestReserveEnergy: Number(this.facetHarvestReserveEnergy.toFixed(1)),
        facetBirths: this.facetBirths,
        facetReserveSpent: Number(this.facetReserveSpent.toFixed(1)),
        bondsFed: this.bondsFed,
        bondEnergyFed: Number(this.bondEnergyFed.toFixed(1)),
        bondSupportTransfers: this.bondSupportTransfers,
        bondSupportEnergyReleased: Number(this.bondSupportEnergyReleased.toFixed(1)),
        structuralBirths: this.structuralBirths,
        structuralSeedEnergy: Number(this.structuralSeedEnergy.toFixed(1)),
        collectiveMoves: this.collectiveMoves,
        collectiveResourceDirectedMoves: this.collectiveResourceDirectedMoves,
        refineryConversions: this.refineryConversions,
        refineryFoodReleased: this.refineryFoodReleased,
        refineryNutrientsProduced: Number(this.refineryNutrientsProduced.toFixed(1)),
        collectiveWorkCompletions: this.collectiveWorkCompletions,
        collectiveWorkFoodReleased: this.collectiveWorkFoodReleased,
        collectiveWorkAttendances: this.collectiveWorkAttendances,
        collectiveWorkActiveFields: this.workGates.filter((gate) => gate.fieldStrength > 0).length,
        collectiveWorkFieldHarvests: this.collectiveWorkFieldHarvests,
        collectiveWorkFieldHarvestsByWorkers: this.collectiveWorkFieldHarvestsByWorkers,
        collectiveWorkFieldHarvestsByOthers: this.collectiveWorkFieldHarvestsByOthers,
        courierReportsCreated: this.courierReportsCreated,
        courierHandoffs: this.courierHandoffs,
        recentEvents: this.telemetryEvents.slice(-12).reverse()
      },
      genesis: {
        phase: 15.5,
        layer: "Structural lineage accounting",
        principle: "Prime 31 couples bodies into a topology that can retain harvest capital and spend it only on inheriting that topology.",
        status: "A structural mutation may still lose Prime 31, but it cannot inherit the facet's collective capital."
      },
      generators: this.generatorEngine.serialize(this.worldNumber),
      markers: {
        births: this.birthMarkers,
        deaths: this.deathMarkers,
        energyTransfers: this.energyTransfers,
        primaryProduction: this.primaryProductionMarkers,
        facetWorkTrail: this.facetWorkTrail,
        collectiveWork: this.workGates.map((gate) => ({ ...gate }))
      },
      statistics: this.getStatistics()
    };
  }
}
