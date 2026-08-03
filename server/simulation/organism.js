import { DEFAULT_CONFIG, DIRECTIONS, RESOURCE_TYPES, TILE_TYPES } from "./config.js";
import { clamp, hueToColor, randomChoice } from "./utils.js";

function resourceYield(resource, strengths) {
  const digestion = strengths[5] ?? 0;
  const energy = strengths[3] ?? 0;
  const signal = strengths[19] ?? 0;

  if (resource === RESOURCE_TYPES.BLUE) return 0.55 + energy * 0.25 + digestion * 0.2;
  if (resource === RESOURCE_TYPES.RED) return 0.55 + signal * 0.25 + digestion * 0.2;
  return 0.55 + digestion * 0.45;
}

export class Organism {
  constructor({
    id,
    x,
    y,
    generation = 1,
    energy = DEFAULT_CONFIG.organism.startingEnergy,
    age = 0,
    genomeProfile,
    brain,
    brainExecution = null,
    mutation = null,
    hue,
    direction,
    random
  }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.random = random;
    this.direction = direction ?? randomChoice(DIRECTIONS, this.random);
    this.energy = energy;
    this.age = age;
    this.generation = generation;
    this.genome = genomeProfile.number;
    this.genomeProfile = genomeProfile;
    this.brain = brain;
    this.brainExecution = brainExecution;
    this.mutation = mutation;
    this.perception = null;
    this.hue = hue ?? Math.floor(this.random() * 360);
    this.color = hueToColor(this.hue);
    this.alive = true;
    this.deathReason = null;
    this.movementDecision = null;
    this.lastConsumedResource = null;
    this.sharedState = { connectedNeighbors: 0, contributors: [], mean: 0 };
    this.collectiveDecision = null;
  }

  chooseRandomDirection() {
    this.direction = randomChoice(DIRECTIONS, this.random);
    return this.direction;
  }

  chooseGraphDirection(world, occupiedKeys) {
    const scores = this.brainExecution?.effectors.direction ?? {};
    const legalDirections = DIRECTIONS.filter((candidate) => {
      const target = world.wrapPosition(this.x + candidate.x, this.y + candidate.y);
      return world.isWalkable(target.x, target.y) && !occupiedKeys.has(`${target.x},${target.y}`);
    });
    if (!legalDirections.length) {
      this.movementDecision = { mode: "graph", chosen: this.direction.name, scores };
      return this.direction;
    }

    const strongestScore = Math.max(...legalDirections.map((candidate) => scores[candidate.name] ?? 0));
    const strongestDirections = legalDirections.filter((candidate) => (scores[candidate.name] ?? 0) === strongestScore);
    // Keeping the current heading on a tie avoids adding a hidden random movement rule.
    const chosen = strongestDirections.find((candidate) => candidate.name === this.direction.name) ?? strongestDirections[0];
    this.direction = chosen;
    this.movementDecision = { mode: "graph", chosen: chosen.name, scores };
    return chosen;
  }

  getPersistentState() {
    if (!this.genomeProfile.traits.canPersistState) return null;
    const value = Number(this.brainExecution?.persistentState?.["p13-persistence"]);
    return Number.isFinite(value) ? clamp(value, 0, 1.8) : null;
  }

  act({ world, occupiedKeys, config, ecologyConfig, signalConfig, brainExecutor, coupled, neighborStates = [] }) {
    let consumedEnergy = 0;
    if (world.isBurning(this.x, this.y)) {
      this.alive = false;
      this.deathReason = "fire";
      return { consumedEnergy };
    }

    const currentTile = world.getTile(this.x, this.y);
    const contributors = neighborStates.filter((neighbor) => Number.isFinite(neighbor.value));
    const neighborState = contributors.length
      ? contributors.reduce((total, neighbor) => total + neighbor.value, 0) / contributors.length
      : 0;
    this.sharedState = {
      connectedNeighbors: neighborStates.length,
      contributors: contributors.map((neighbor) => ({ id: neighbor.id, value: Number(neighbor.value.toFixed(2)) })),
      mean: Number(neighborState.toFixed(2))
    };
    const terrainSignal = DIRECTIONS.filter((candidate) => {
      const position = world.wrapPosition(this.x + candidate.x, this.y + candidate.y);
      return !world.isWalkable(position.x, position.y);
    }).length / DIRECTIONS.length;
    const neighborhoodDirections = [
      ["nw", -1, -1], ["n", 0, -1], ["ne", 1, -1], ["w", -1, 0],
      ["e", 1, 0], ["sw", -1, 1], ["s", 0, 1], ["se", 1, 1]
    ];
    const tileSignal = (x, y) => {
      const tile = world.getTile(x, y);
      // The value is metabolic opportunity for this organism, not a global ordering of resource colors.
      if (tile.type === TILE_TYPES.FOOD) return resourceYield(tile.resource, this.genomeProfile.powers);
      return 0;
    };
    this.perception = this.genomeProfile.traits.canSenseNeighborhood
      ? Object.fromEntries(neighborhoodDirections.map(([id, dx, dy]) => [id, tileSignal(this.x + dx, this.y + dy)]))
      : null;
    this.brainExecution = brainExecutor.execute(this.brain, {
      "p3-energy": this.energy / (config.reproductionThreshold / (this.genomeProfile.powers[7] ?? 1)),
      "p5-food": currentTile.type === TILE_TYPES.FOOD ? 1 : 0,
      "p11-terrain": terrainSignal,
      "p19-input": world.getSignal(this.x, this.y) / 255 * 8,
      "p31-neighbor-state": neighborState,
      ...Object.fromEntries(Object.entries(this.perception ?? {}).map(([id, value]) => [`p17-${id}`, value]))
    }, this.brainExecution?.persistentState);

    const shouldMove = !coupled && this.brainExecution.effectors.move >= 0.05;
    const direction = shouldMove
      ? (this.genomeProfile.traits.canSenseNeighborhood
        ? this.chooseGraphDirection(world, occupiedKeys)
        : this.chooseRandomDirection())
      : this.direction;
    if (shouldMove && !this.genomeProfile.traits.canSenseNeighborhood) {
      this.movementDecision = { mode: "random-fallback", chosen: direction.name, scores: {} };
    }
    const target = world.wrapPosition(this.x + direction.x, this.y + direction.y);
    const targetKey = `${target.x},${target.y}`;
    const canMove = shouldMove
      && world.isWalkable(target.x, target.y)
      && !occupiedKeys.has(targetKey);

    this.age += 1;
    const strengths = this.genomeProfile.powers;
    const amplifiedGenes = [3, 5, 7]
      .reduce((total, prime) => total + Math.max(0, (strengths[prime] ?? 0) - 1), 0);
    const maintenanceCost = amplifiedGenes * config.genomeMaintenancePerStrength
      + ((strengths[13] ?? 0) * config.persistenceMaintenance);
    const perceptionCost = (strengths[17] ?? 0) * config.perceptionMaintenance;
    const couplingCost = coupled ? config.couplingMaintenance : 0;

    this.energy -= config.moveCost + maintenanceCost + perceptionCost + couplingCost;

    const signalOutput = this.brainExecution.effectors.signal;
    if (signalOutput > signalConfig.activationThreshold) {
      const intensity = clamp(
        (signalOutput - signalConfig.activationThreshold) / (8 - signalConfig.activationThreshold) * signalConfig.maxIntensity,
        0,
        signalConfig.maxIntensity
      );
      world.addSignal(this.x, this.y, intensity, signalConfig.maxIntensity);
      this.energy -= intensity / signalConfig.maxIntensity * signalConfig.emissionCost;
    }

    if (canMove) {
      this.x = target.x;
      this.y = target.y;
    } else if (!coupled) {
      this.energy -= config.idleCost;
    }

    if (this.brainExecution.effectors.consume >= 0.5 && currentTile.type === TILE_TYPES.FOOD) {
      const resource = world.harvestFood(currentTile.x, currentTile.y, ecologyConfig);
      if (resource) {
        consumedEnergy = config.foodEnergy * resourceYield(resource, this.genomeProfile.powers);
        this.energy += consumedEnergy;
        this.lastConsumedResource = resource;
      }
    }

    this.energy = clamp(this.energy, 0, config.reproductionThreshold * 1.8 * (this.genomeProfile.powers[3] ?? 1));

    if (this.age >= config.maxAge) {
      this.alive = false;
      this.deathReason = "maximum age";
    }

    return { consumedEnergy };
  }

  canReproduce(config) {
    return this.alive
      && this.brainExecution?.effectors.reproduce >= 1
      && this.energy >= config.reproductionThreshold / (1 + ((this.genomeProfile.powers[7] ?? 1) - 1) * 0.25);
  }

  reproduce(newId, childPosition, config, { genomeEngine, brainGenerator, mutationEngine }) {
    const sharedEnergy = this.energy * config.reproductionCostFactor;
    this.energy = sharedEnergy;
    const mutation = this.random() < config.mutationRate
      ? mutationEngine.mutate(this.genome, this.random)
      : null;
    const childGenomeProfile = genomeEngine.construct(mutation?.after ?? this.genome);

    return new Organism({
      id: newId,
      x: childPosition.x,
      y: childPosition.y,
      generation: this.generation + 1,
      energy: sharedEnergy,
      genomeProfile: childGenomeProfile,
      brain: brainGenerator.generate(childGenomeProfile),
      hue: mutation ? this.hue + (this.random() - 0.5) * config.mutationHueJitter : this.hue,
      direction: randomChoice(DIRECTIONS, this.random),
      random: this.random,
      mutation
    });
  }

  serialize() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      direction: this.direction.name,
      energy: Number(this.energy.toFixed(2)),
      age: this.age,
      generation: this.generation,
      genome: this.genome,
      genomeExpression: this.genomeProfile.expression,
      capabilities: this.genomeProfile.capabilities,
      brain: {
        ...this.brain,
        execution: this.brainExecution
      },
      mutation: this.mutation,
      perception: this.perception,
      persistentState: this.getPersistentState(),
      sharedState: this.sharedState,
      lastConsumedResource: this.lastConsumedResource,
      signalOutput: Number((this.brainExecution?.effectors.signal ?? 0).toFixed(2)),
      movementDecision: this.movementDecision,
      collectiveDecision: this.collectiveDecision,
      color: this.color
    };
  }
}
