import { factorize } from "./prime-registry.js";

const ORGANISM_PRIMES = new Map([
  [2, {
    name: "Locomotion",
    description: "Builds the capacity to choose and take a movement step.",
    trait: "canMove"
  }],
  [3, {
    name: "Metabolism",
    description: "Builds the energy budget that makes survival and aging meaningful.",
    trait: "hasMetabolism"
  }],
  [5, {
    name: "Digestion",
    description: "Builds the capacity to turn encountered food into usable energy.",
    trait: "canDigest"
  }],
  [7, {
    name: "Reproduction",
    description: "Builds the capacity to create a descendant when energy is sufficient.",
    trait: "canReproduce"
  }],
  [11, {
    name: "Terrain Sense",
    description: "Builds a terrain sensor placeholder for a later generated decision system.",
    trait: "canSenseTerrain"
  }],
  [13, {
    name: "State Persistence",
    description: "Builds a persistent graph node that keeps one internal value between simulation ticks.",
    trait: "canPersistState"
  }],
  [17, {
    name: "Spatial Awareness",
    description: "Builds a raw 3 x 3 neighborhood sensor field for nearby terrain, resources, and hazards.",
    trait: "canSenseNeighborhood"
  }],
  [19, {
    name: "Shared Information",
    description: "Builds anonymous signal input and output nodes for a decaying world signal field.",
    trait: "canShareInformation"
  }],
  [31, {
    name: "Structural Coupling",
    description: "Builds a Bind output that can maintain physical links and expose direct neighbors' persistent state.",
    trait: "canCouple"
  }]
]);

function formatExpression(number, factors) {
  const powers = new Map();
  for (const factor of factors) {
    powers.set(factor, (powers.get(factor) ?? 0) + 1);
  }

  return `${number} = ${[...powers.entries()]
    .map(([prime, power]) => (power === 1 ? prime : `${prime}^${power}`))
    .join(" x ")}`;
}

export class GenomeEngine {
  construct(genome) {
    const number = Number(genome);
    if (!Number.isSafeInteger(number) || number < 2) {
      throw new Error("A genome must be an integer greater than one.");
    }

    const factors = factorize(number);
    const powers = Object.fromEntries(factors.map((prime) => [prime, factors.filter((factor) => factor === prime).length]));
    const capabilities = [...new Set(factors)].map((prime) => {
      const capability = ORGANISM_PRIMES.get(prime);
      if (!capability) {
        throw new Error(`Prime ${prime} is not registered for organism construction.`);
      }
      const power = powers[prime];
      return {
        prime,
        power,
        name: capability.name,
        description: power > 1
          ? `${capability.description} Strength ${power}.`
          : capability.description
      };
    });

    const traits = Object.fromEntries(
      [...ORGANISM_PRIMES.values()].map((capability) => [capability.trait, false])
    );
    for (const factor of factors) {
      traits[ORGANISM_PRIMES.get(factor).trait] = true;
    }

    return {
      number,
      factors,
      powers,
      expression: formatExpression(number, factors),
      capabilities,
      traits
    };
  }
}

export const DEFAULT_GENOME_ENGINE = new GenomeEngine();
