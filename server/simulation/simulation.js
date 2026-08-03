import { BASE_CONFIG, DEFAULT_CONFIG, DIRECTIONS, TILE_TYPES } from "./config.js";
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
    this.compoundHeadings = new Map();
    this.bonds = new Map();
    this.bondCandidates = new Map();
    this.structuralBirthSeeds = new Map();
    this.facetReserves = new Map();
    this.telemetryEvents = [];
    this.bondsFormed = 0;
    this.bondsBroken = 0;
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
    this.world.updateFire({ ...this.config.hazards, chemistryEnabled: this.config.chemistry.enabled });
    this.world.updateChemistry(this.config.chemistry, this.config.ecology);
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
        neighborStates: neighborStatesByOrganism.get(organism.id) ?? [],
        brainExecutor: this.brainExecutor
      });

      if (result.consumedEnergy > 0 && organism.alive) {
        const structuralAllocation = this.feedAttachedBonds(organism, result.consumedEnergy);
        this.shareFacetEnergy(organism, result.consumedEnergy - structuralAllocation);
        this.applyFacetHarvestAdvantage(organism, result.consumedEnergy);
      }

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
    this.handleReproduction();
    this.updateBonds();
    this.removeDeadOrganisms();
    this.updateFacetReserves();
    this.updateMarkers();
    const production = this.world.growFood(
      this.config.food.growthRate,
      this.config.food.maxGrowthAttemptsPerTick * this.speed,
      this.config.chemistry,
      this.config.ecology
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

      if (this.random() > reproductionOpportunity) {
        continue;
      }

      const structuralParent = this.isActivelyBonded(organism.id) && organism.genomeProfile.traits.canCouple;
      const sourceFacet = structuralParent ? this.getStrongestFacetForMember(organism.id) : null;
      const facetBirthSite = sourceFacet ? this.findFacetBirthSite(organism, sourceFacet, occupied) : null;
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
    this.energyTransfers = [];
    this.primaryProductionMarkers = [];
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

  updateBonds() {
    for (const bond of this.bonds.values()) {
      bond.reserve = Math.max(0, (bond.reserve ?? this.config.bond.initialReserve) - this.config.bond.maintenancePerTick);
    }
    const candidates = this.organisms.filter((organism) => organism.alive && organism.brainExecution?.effectors.bind >= 0.35);
    const adjacentPairs = [];
    const adjacentPairKeys = new Set();
    const neighbors = new Map(candidates.map((organism) => [organism.id, new Set()]));
    const addAdjacentPair = (first, second) => {
      const key = this.bondKey(first.id, second.id);
      if (adjacentPairKeys.has(key)) return;
      adjacentPairKeys.add(key);
      adjacentPairs.push([first, second]);
    };
    for (let index = 0; index < candidates.length; index += 1) {
      for (let otherIndex = index + 1; otherIndex < candidates.length; otherIndex += 1) {
        if (!this.areAdjacent(candidates[index], candidates[otherIndex])) continue;
        addAdjacentPair(candidates[index], candidates[otherIndex]);
        neighbors.get(candidates[index].id).add(candidates[otherIndex].id);
        neighbors.get(candidates[otherIndex].id).add(candidates[index].id);
      }
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
        this.bondsBroken += 1;
        const deadMember = first && !first.alive ? first : second && !second.alive ? second : null;
        const reason = deadMember ? `organism #${deadMember.id} died: ${deadMember.deathReason ?? "unknown cause"}`
          : !first || !second ? "member was removed" : "members separated";
        this.recordTelemetry("bond-broken", `Bond #${bond.firstId}-#${bond.secondId} broke: ${reason}.`);
      } else if (!this.bondCandidates.has(key)) {
        bond.strength = Math.max(0, bond.strength - 0.015);
        if (bond.strength === 0) {
          this.bonds.delete(key);
          this.bondsBroken += 1;
          const reason = bond.reserve <= 0 ? "bond energy reserve depleted" : "binding was no longer maintained";
          this.recordTelemetry("bond-broken", `Bond #${bond.firstId}-#${bond.secondId} broke: ${reason}.`);
        }
      } else if (bond.reserve <= 0) {
        bond.strength = Math.max(0, bond.strength - this.config.bond.starvationStrengthDecay);
        if (bond.strength === 0) {
          this.bonds.delete(key);
          this.bondsBroken += 1;
          this.recordTelemetry("bond-broken", `Bond #${bond.firstId}-#${bond.secondId} broke: bond energy reserve depleted.`);
        }
      }
    }
  }

  setInitialPopulation(count) {
    this.config.organism.initialPopulation = clamp(Number(count), 1, this.world.width * this.world.height);
  }

  setFounderGenome(genome) {
    this.genomeEngine.construct(genome);
    this.config.organism.founderGenome = Number(genome);
    this.reset();
  }

  setGridEnabled(enabled) {
    this.gridEnabled = Boolean(enabled);
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
        chemistry: this.world.serializeChemistry()
      },
      bonds: [...this.bonds.values()],
      facets,
      organisms: this.organisms.map((organism) => organism.serialize()),
      controls: {
        paused: this.isPaused,
        speed: this.speed,
        gridEnabled: this.gridEnabled,
        speedOptions: this.config.simulation.speedOptions
      },
      settings: {
        foodGrowthRate: this.config.food.growthRate,
        initialPopulation: this.config.organism.initialPopulation,
        universeSeed: this.seed,
        worldNumber: this.worldNumber,
        founderGenome: this.config.organism.founderGenome
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
      telemetry: {
        storage: "In memory only; newest 1,000 events retained (0 bytes written to disk).",
        bondsFormed: this.bondsFormed,
        bondsBroken: this.bondsBroken,
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
        primaryProduction: this.primaryProductionMarkers
      },
      statistics: this.getStatistics()
    };
  }
}
