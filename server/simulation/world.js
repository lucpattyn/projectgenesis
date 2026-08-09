import { DEFAULT_CONFIG, RESOURCE_TYPES, TILE_TYPES } from "./config.js";
import { createTile, randomInt, wrapCoordinate } from "./utils.js";

export class World {
  constructor(config = DEFAULT_CONFIG.world, random) {
    this.width = config.width;
    this.height = config.height;
    this.wraps = config.wraps;
    this.wallChance = config.wallChance;
    this.initialFoodChance = config.initialFoodChance;
    this.foodTargetDensity = config.foodTargetDensity;
    this.random = random;
    this.tiles = [];
    this.fires = new Map();
    this.signalField = [];
    this.detritus = [];
    this.ash = [];
    this.nutrients = [];
    this.deathResidue = [];
    this.overflowPlume = [];
    this.fertility = [];
    this.environment = {};
    this.engineeredFertility = [];
    this.environmentMemory = [];
    this.environmentMemoryAgeMass = [];
    this.reset();
  }

  reset() {
    this.tiles = [];
    this.fires.clear();
    this.signalField = [];
    this.detritus = [];
    this.ash = [];
    this.nutrients = [];
    this.deathResidue = [];
    this.overflowPlume = [];
    this.fertility = [];
    this.engineeredFertility = [];
    this.environmentMemory = [];
    this.environmentMemoryAgeMass = [];

    for (let y = 0; y < this.height; y += 1) {
      const row = [];

      for (let x = 0; x < this.width; x += 1) {
        let type = TILE_TYPES.EMPTY;
        const roll = this.random();

        if (roll < this.wallChance) {
          type = TILE_TYPES.WALL;
        } else if (roll < this.wallChance + this.initialFoodChance) {
          type = TILE_TYPES.FOOD;
        }

        const tile = createTile(x, y, type);
        tile.resource = type === TILE_TYPES.FOOD ? this.chooseResourceType() : null;
        row.push(tile);
      }

      this.tiles.push(row);
      this.signalField.push(Array(this.width).fill(0));
      this.detritus.push(Array(this.width).fill(0));
      this.ash.push(Array(this.width).fill(0));
      this.nutrients.push(Array(this.width).fill(0));
      this.deathResidue.push(Array(this.width).fill(0));
      this.overflowPlume.push(Array(this.width).fill(0));
      this.fertility.push(Array(this.width).fill(1));
      this.engineeredFertility.push(Array(this.width).fill(0));
      this.environmentMemory.push(Array(this.width).fill(0));
      this.environmentMemoryAgeMass.push(Array(this.width).fill(0));
    }
    // Environmental state is extensible by layer; fertility is the first canonical layer.
    this.environment = { fertility: this.fertility, engineeredFertility: this.engineeredFertility, memory: this.environmentMemory };
  }

  readEnvironmentMemory(x, y) {
    const position = this.wrapPosition(x, y);
    return this.environmentMemory[position.y][position.x];
  }

  writeEnvironmentMemory(x, y, amount) {
    const position = this.wrapPosition(x, y);
    const before = this.environmentMemory[position.y][position.x];
    const next = Math.min(1, Math.max(0, before + Math.max(0, Number(amount) || 0)));
    this.environmentMemory[position.y][position.x] = next;
    return next - before;
  }

  updateEnvironmentMemory(config) {
    if (!config.enabled) return { gained: 0, decayed: 0 };
    const next = Array.from({ length: this.height }, () => Array(this.width).fill(0));
    const nextAgeMass = Array.from({ length: this.height }, () => Array(this.width).fill(0));
    let beforeTotal = 0;
    let afterDecayTotal = 0;
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const value = this.environmentMemory[y][x];
        const decayed = value * config.decayRate;
        const agedMass = this.environmentMemoryAgeMass[y][x] * config.decayRate + decayed;
        beforeTotal += value;
        afterDecayTotal += decayed;
        const neighbors = [{ x, y: y - 1 }, { x: x + 1, y }, { x, y: y + 1 }, { x: x - 1, y }]
          .map((candidate) => this.wrapPosition(candidate.x, candidate.y));
        const uniqueNeighbors = [...new Map(neighbors.map((position) => [`${position.x},${position.y}`, position])).values()];
        const spread = decayed * config.diffusionRate;
        const spreadAge = agedMass * config.diffusionRate;
        next[y][x] += decayed - spread;
        nextAgeMass[y][x] += agedMass - spreadAge;
        for (const neighbor of uniqueNeighbors) {
          next[neighbor.y][neighbor.x] += spread / uniqueNeighbors.length;
          nextAgeMass[neighbor.y][neighbor.x] += spreadAge / uniqueNeighbors.length;
        }
      }
    }
    this.environmentMemory = next.map((row) => row.map((value) => Math.min(1, Math.max(0, value))));
    this.environmentMemoryAgeMass = nextAgeMass;
    this.environment.memory = this.environmentMemory;
    return { gained: 0, decayed: Math.max(0, beforeTotal - afterDecayTotal) };
  }

  getEnvironmentMemoryStatistics(config) {
    const threshold = config.regionThreshold;
    let total = 0;
    let ageMass = 0;
    let coverage = 0;
    const visited = Array.from({ length: this.height }, () => Array(this.width).fill(false));
    let largestRegion = 0;
    let regions = 0;
    for (let y = 0; y < this.height; y += 1) for (let x = 0; x < this.width; x += 1) {
      const value = this.environmentMemory[y][x];
      total += value;
      ageMass += this.environmentMemoryAgeMass[y][x];
      if (value >= config.coverageThreshold) coverage += 1;
      if (visited[y][x] || value < threshold) continue;
      regions += 1;
      let size = 0;
      const queue = [{ x, y }];
      visited[y][x] = true;
      while (queue.length) {
        const current = queue.shift();
        size += 1;
        for (const neighbor of [{ x: current.x, y: current.y - 1 }, { x: current.x + 1, y: current.y }, { x: current.x, y: current.y + 1 }, { x: current.x - 1, y: current.y }]) {
          const position = this.wrapPosition(neighbor.x, neighbor.y);
          if (visited[position.y][position.x] || this.environmentMemory[position.y][position.x] < threshold) continue;
          visited[position.y][position.x] = true;
          queue.push(position);
        }
      }
      largestRegion = Math.max(largestRegion, size);
    }
    const cells = this.width * this.height;
    return {
      average: total / cells,
      total,
      coverage: coverage / cells,
      largestRegion,
      regions,
      meanLifetime: total > 0 ? ageMass / total : 0
    };
  }

  wrapPosition(x, y) {
    if (!this.wraps) {
      return {
        x: Math.min(this.width - 1, Math.max(0, x)),
        y: Math.min(this.height - 1, Math.max(0, y))
      };
    }

    return {
      x: wrapCoordinate(x, this.width),
      y: wrapCoordinate(y, this.height)
    };
  }

  getTile(x, y) {
    const position = this.wrapPosition(x, y);
    return this.tiles[position.y][position.x];
  }

  setTileType(x, y, type) {
    const tile = this.getTile(x, y);
    tile.type = type;
    return tile;
  }

  isWalkable(x, y) {
    return this.getTile(x, y).type !== TILE_TYPES.WALL;
  }

  isEmpty(x, y) {
    return this.getTile(x, y).type === TILE_TYPES.EMPTY;
  }

  countTilesByType(type) {
    let count = 0;

    for (const row of this.tiles) {
      for (const tile of row) {
        if (tile.type === type) {
          count += 1;
        }
      }
    }

    return count;
  }

  countResources() {
    const counts = Object.fromEntries(Object.values(RESOURCE_TYPES).map((resource) => [resource, 0]));
    for (const row of this.tiles) {
      for (const tile of row) {
        if (tile.type === TILE_TYPES.FOOD && tile.resource) counts[tile.resource] += 1;
      }
    }
    return counts;
  }

  chooseResourceType() {
    const roll = this.random();
    if (roll < 0.44) return RESOURCE_TYPES.GREEN;
    if (roll < 0.76) return RESOURCE_TYPES.BLUE;
    return RESOURCE_TYPES.RED;
  }

  findRandomOpenPosition(occupiedKeys = new Set()) {
    const maxAttempts = this.width * this.height * 2;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const x = randomInt(this.width, this.random);
      const y = randomInt(this.height, this.random);
      const key = `${x},${y}`;

      if (this.isWalkable(x, y) && !occupiedKeys.has(key)) {
        return { x, y };
      }
    }

    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const key = `${x},${y}`;
        if (this.isWalkable(x, y) && !occupiedKeys.has(key)) {
          return { x, y };
        }
      }
    }

    return null;
  }

  growFood(growthRate, attempts, chemistry, ecology = DEFAULT_CONFIG.ecology, environment = DEFAULT_CONFIG.environment) {
    const targetFoodCount = Math.floor(this.width * this.height * this.foodTargetDensity);
    let foodCount = this.countTilesByType(TILE_TYPES.FOOD);
    const missingFood = Math.max(0, targetFoodCount - foodCount);
    const recoveryAttempts = chemistry.enabled
      ? Math.min(chemistry.maxRecoveryAttempts, Math.ceil(missingFood * chemistry.recoveryAttemptsPerMissingFood))
      : 0;
    let produced = 0;
    const positions = [];

    const standardAttempts = attempts + recoveryAttempts;
    const nicheCandidates = [];
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        if (this.engineeredFertility[y][x] >= environment.nicheGrowthThreshold) nicheCandidates.push({ x, y });
      }
    }
    const nicheAttempts = nicheCandidates.length
      ? Math.min(environment.nicheGrowthAttemptsPerTick, nicheCandidates.length)
      : 0;

    for (let attempt = 0; attempt < standardAttempts + nicheAttempts; attempt += 1) {
      if (foodCount >= targetFoodCount) {
        break;
      }

      const nichePosition = attempt >= standardAttempts
        ? nicheCandidates[randomInt(nicheCandidates.length, this.random)]
        : null;
      const x = nichePosition?.x ?? randomInt(this.width, this.random);
      const y = nichePosition?.y ?? randomInt(this.height, this.random);
      const nutrientBoost = chemistry.enabled ? this.nutrients[y][x] * chemistry.nutrientGrowthBoost : 0;
      const fertility = Math.min(1, this.fertility[y][x] + this.engineeredFertility[y][x]);
      const fertilityFactor = ecology.localFertilityEnabled
        ? Math.max(0, (fertility - ecology.minimumFertilityForGrowth) / (1 - ecology.minimumFertilityForGrowth))
        : 1;
      const localGrowthRate = nichePosition
        ? Math.max(growthRate, environment.nicheGrowthRate)
        : growthRate;
      if (this.random() > Math.min(1, localGrowthRate * (1 + nutrientBoost) * fertilityFactor)) continue;
      const tile = this.getTile(x, y);

      if (tile.type === TILE_TYPES.EMPTY && !this.isBurning(x, y)) {
        tile.type = TILE_TYPES.FOOD;
        tile.resource = this.chooseResourceType();
        tile.foodOrigin = null;
        tile.foodEnergy = 1;
        if (chemistry.enabled && this.nutrients[y][x] > 0) {
          this.nutrients[y][x] = Math.max(0, this.nutrients[y][x] - chemistry.nutrientCostPerFood);
        }
        foodCount += 1;
        produced += 1;
        positions.push({ x, y });
      }
    }
    return { count: produced, positions };
  }

  isBurning(x, y) {
    const position = this.wrapPosition(x, y);
    return this.fires.has(`${position.x},${position.y}`);
  }

  findRandomFoodPosition() {
    const foodPositions = [];
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        if (this.getTile(x, y).type === TILE_TYPES.FOOD && !this.isBurning(x, y)) {
          foodPositions.push({ x, y });
        }
      }
    }

    return foodPositions.length ? foodPositions[randomInt(foodPositions.length, this.random)] : null;
  }

  igniteRandomFood(fireDuration, chemistryEnabled = false) {
    const position = this.findRandomFoodPosition();
    if (!position) return false;
    this.fires.set(`${position.x},${position.y}`, fireDuration);
    this.burnFood(position.x, position.y, chemistryEnabled);
    return true;
  }

  updateFire({ fireEnabled, fireIgnitionRate, fireSpreadChance, fireDuration, fireMaxActive, chemistryEnabled }) {
    if (!fireEnabled) {
      this.fires.clear();
      return;
    }

    const nextFires = new Map();
    for (const [key, remaining] of this.fires) {
      const [x, y] = key.split(",").map(Number);
      if (remaining > 1) {
        nextFires.set(key, remaining - 1);
      }

      for (const direction of [
        { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
      ]) {
        if (nextFires.size >= fireMaxActive || this.random() > fireSpreadChance) continue;
        const position = this.wrapPosition(x + direction.x, y + direction.y);
        if (this.getTile(position.x, position.y).type !== TILE_TYPES.FOOD) continue;
        const spreadKey = `${position.x},${position.y}`;
        nextFires.set(spreadKey, fireDuration);
        this.burnFood(position.x, position.y, chemistryEnabled);
      }
    }

    if (nextFires.size < fireMaxActive && this.random() < fireIgnitionRate) {
      const position = this.findRandomFoodPosition();
      if (position) {
        nextFires.set(`${position.x},${position.y}`, fireDuration);
        this.burnFood(position.x, position.y, chemistryEnabled);
      }
    }

    this.fires = nextFires;
  }

  addDetritus(x, y, amount = 1) {
    const position = this.wrapPosition(x, y);
    this.detritus[position.y][position.x] = Math.min(1, this.detritus[position.y][position.x] + amount);
  }

  addDeathResidue(x, y, energy, maximum) {
    const position = this.wrapPosition(x, y);
    const accepted = Math.min(Math.max(0, energy), Math.max(0, maximum - this.deathResidue[position.y][position.x]));
    this.deathResidue[position.y][position.x] += accepted;
    return accepted;
  }

  takeDeathResidue(x, y, amount) {
    const position = this.wrapPosition(x, y);
    const taken = Math.min(Math.max(0, amount), this.deathResidue[position.y][position.x]);
    this.deathResidue[position.y][position.x] -= taken;
    return taken;
  }

  addOverflowPlume(x, y, energy, maximum) {
    const position = this.wrapPosition(x, y);
    const accepted = Math.min(Math.max(0, energy), Math.max(0, maximum - this.overflowPlume[position.y][position.x]));
    this.overflowPlume[position.y][position.x] += accepted;
    return accepted;
  }

  takeOverflowPlume(x, y, amount) {
    const position = this.wrapPosition(x, y);
    const taken = Math.min(Math.max(0, amount), this.overflowPlume[position.y][position.x]);
    this.overflowPlume[position.y][position.x] -= taken;
    return taken;
  }

  materialAt(x, y) {
    const position = this.wrapPosition(x, y);
    return this.detritus[position.y][position.x] + this.ash[position.y][position.x];
  }

  refineMaterial(x, y, nutrientYield) {
    const position = this.wrapPosition(x, y);
    const material = this.materialAt(position.x, position.y);
    if (material <= 0) return { material: 0, nutrients: 0, foodReleased: 0 };

    const detritusUsed = this.detritus[position.y][position.x];
    const ashUsed = this.ash[position.y][position.x];
    this.detritus[position.y][position.x] = 0;
    this.ash[position.y][position.x] = 0;
    const nutrients = Math.min(1 - this.nutrients[position.y][position.x], material * nutrientYield);
    this.nutrients[position.y][position.x] += nutrients;
    this.fertility[position.y][position.x] = 1;

    const tile = this.getTile(position.x, position.y);
    let foodReleased = 0;
    if (tile.type === TILE_TYPES.EMPTY && !this.isBurning(position.x, position.y)) {
      tile.type = TILE_TYPES.FOOD;
      tile.resource = this.chooseResourceType();
      tile.foodOrigin = null;
      tile.foodEnergy = 1;
      foodReleased = 1;
    }
    return { material: detritusUsed + ashUsed, nutrients, foodReleased };
  }

  harvestFood(x, y, ecology = DEFAULT_CONFIG.ecology, requestedAmount = 1) {
    const tile = this.getTile(x, y);
    if (tile.type !== TILE_TYPES.FOOD) return null;

    const resource = tile.resource ?? RESOURCE_TYPES.GREEN;
    const foodOrigin = tile.foodOrigin;
    const availableAmount = Math.max(0, Math.min(1, tile.foodEnergy ?? 1));
    const amount = Math.min(availableAmount, Math.max(0, requestedAmount));
    if (amount <= 0) return null;
    const remainingAmount = Math.max(0, availableAmount - amount);
    tile.foodEnergy = remainingAmount;
    if (remainingAmount <= 0.000001) {
      tile.type = TILE_TYPES.EMPTY;
      tile.resource = null;
      tile.foodOrigin = null;
      tile.foodEnergy = 0;
    }
    if (ecology.localFertilityEnabled) {
      this.fertility[tile.y][tile.x] = Math.max(0, this.fertility[tile.y][tile.x] - ecology.fertilityLossPerHarvest * amount);
    }
    return { resource, foodOrigin, amount, remainingAmount };
  }

  burnFood(x, y, chemistryEnabled) {
    const tile = this.getTile(x, y);
    if (tile.type === TILE_TYPES.FOOD) {
      tile.type = TILE_TYPES.EMPTY;
      tile.resource = null;
      tile.foodOrigin = null;
      tile.foodEnergy = 0;
      if (chemistryEnabled) this.ash[tile.y][tile.x] = Math.min(1, this.ash[tile.y][tile.x] + 1);
    }
  }

  updateChemistry(chemistry, ecology = DEFAULT_CONFIG.ecology, environment = DEFAULT_CONFIG.environment) {
    if (!chemistry.enabled && !ecology.localFertilityEnabled) return;
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        this.engineeredFertility[y][x] = Math.max(0, this.engineeredFertility[y][x] - environment.engineeredFertilityDecay);
        if (ecology.localFertilityEnabled) {
          this.fertility[y][x] = Math.min(1, this.fertility[y][x] + ecology.fertilityRecoveryPerTick);
        }
        if (!chemistry.enabled) continue;
        if (chemistry.deathResidueEnabled) {
          this.deathResidue[y][x] = Math.max(0, this.deathResidue[y][x] - chemistry.deathResidueDecay);
        }
        if (chemistry.overflowPlumeEnabled) {
          this.overflowPlume[y][x] = Math.max(0, this.overflowPlume[y][x] - chemistry.overflowPlumeDecay);
        }
        if (this.tiles[y][x].type === TILE_TYPES.FOOD && this.random() < chemistry.foodDecayRate) {
          this.tiles[y][x].type = TILE_TYPES.EMPTY;
          this.tiles[y][x].resource = null;
          this.tiles[y][x].foodEnergy = 0;
          this.detritus[y][x] = Math.min(1, this.detritus[y][x] + 1);
        }
        const fromDetritus = Math.min(this.detritus[y][x], chemistry.detritusToNutrients);
        const fromAsh = Math.min(this.ash[y][x], chemistry.ashToNutrients);
        this.detritus[y][x] -= fromDetritus;
        this.ash[y][x] -= fromAsh;
        this.nutrients[y][x] = Math.min(1, this.nutrients[y][x] + fromDetritus + fromAsh);
      }
    }
  }

  getSignal(x, y) {
    const position = this.wrapPosition(x, y);
    return this.signalField[position.y][position.x];
  }

  addSignal(x, y, intensity, maximum = 255) {
    const position = this.wrapPosition(x, y);
    this.signalField[position.y][position.x] = Math.min(maximum, this.signalField[position.y][position.x] + intensity);
  }

  decaySignals(decay) {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        this.signalField[y][x] = Math.round(this.signalField[y][x] * decay * 10) / 10;
      }
    }
  }

  serializeTiles() {
    return this.tiles.map((row) => row.map((tile) => tile.type));
  }

  serializeResources() {
    return this.tiles.map((row) => row.map((tile) => tile.resource));
  }

  serializeFoodAmounts() {
    return this.tiles.map((row) => row.map((tile) => Number((tile.foodEnergy ?? 0).toFixed(3))));
  }

  serializeFires() {
    return [...this.fires.keys()].map((key) => {
      const [x, y] = key.split(",").map(Number);
      return { x, y };
    });
  }

  serializeSignals() {
    return this.signalField.map((row) => row.map((value) => Math.round(value)));
  }

  serializeChemistry() {
    return { detritus: this.detritus, ash: this.ash, nutrients: this.nutrients, deathResidue: this.deathResidue, overflowPlume: this.overflowPlume, fertility: this.fertility };
  }

  serializeEnvironment() {
    return this.environment;
  }

  reinforceEngineeredFertility(x, y, amount = 0.08, maximum = 0.8) {
    for (let dy = -2; dy <= 2; dy += 1) for (let dx = -2; dx <= 2; dx += 1) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 2) continue;
      const position = this.wrapPosition(x + dx, y + dy);
      const falloff = 1 - Math.max(Math.abs(dx), Math.abs(dy)) / 3;
      this.engineeredFertility[position.y][position.x] = Math.min(maximum, this.engineeredFertility[position.y][position.x] + amount * falloff);
    }
  }

  totalMaterial(material) {
    return material.flat().reduce((total, value) => total + value, 0);
  }
}
