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
    this.fertility = [];
    this.environment = {};
    this.engineeredFertility = [];
    this.reset();
  }

  reset() {
    this.tiles = [];
    this.fires.clear();
    this.signalField = [];
    this.detritus = [];
    this.ash = [];
    this.nutrients = [];
    this.fertility = [];
    this.engineeredFertility = [];

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
      this.fertility.push(Array(this.width).fill(1));
      this.engineeredFertility.push(Array(this.width).fill(0));
    }
    // Environmental state is extensible by layer; fertility is the first canonical layer.
    this.environment = { fertility: this.fertility, engineeredFertility: this.engineeredFertility };
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
      foodReleased = 1;
    }
    return { material: detritusUsed + ashUsed, nutrients, foodReleased };
  }

  harvestFood(x, y, ecology = DEFAULT_CONFIG.ecology) {
    const tile = this.getTile(x, y);
    if (tile.type !== TILE_TYPES.FOOD) return null;

    const resource = tile.resource ?? RESOURCE_TYPES.GREEN;
    const foodOrigin = tile.foodOrigin;
    tile.type = TILE_TYPES.EMPTY;
    tile.resource = null;
    tile.foodOrigin = null;
    if (ecology.localFertilityEnabled) {
      this.fertility[tile.y][tile.x] = Math.max(0, this.fertility[tile.y][tile.x] - ecology.fertilityLossPerHarvest);
    }
    return { resource, foodOrigin };
  }

  burnFood(x, y, chemistryEnabled) {
    const tile = this.getTile(x, y);
    if (tile.type === TILE_TYPES.FOOD) {
      tile.type = TILE_TYPES.EMPTY;
      tile.resource = null;
      tile.foodOrigin = null;
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
        if (this.tiles[y][x].type === TILE_TYPES.FOOD && this.random() < chemistry.foodDecayRate) {
          this.tiles[y][x].type = TILE_TYPES.EMPTY;
          this.tiles[y][x].resource = null;
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
    return { detritus: this.detritus, ash: this.ash, nutrients: this.nutrients, fertility: this.fertility };
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
