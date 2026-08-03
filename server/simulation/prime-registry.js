export function factorize(value) {
  let remaining = Number(value);
  const factors = [];

  for (let divisor = 2; divisor * divisor <= remaining; divisor += 1) {
    while (remaining % divisor === 0) {
      factors.push(divisor);
      remaining /= divisor;
    }
  }

  if (remaining > 1) {
    factors.push(remaining);
  }

  return factors;
}

export class PrimeRegistry {
  constructor() {
    this.entries = new Map();
  }

  register(prime, generator) {
    this.entries.set(prime, { prime, ...generator });
    return this;
  }

  resolveWorld(number) {
    const value = Number(number);

    if (!Number.isSafeInteger(value) || value < 2) {
      throw new Error("A world recipe must be an integer greater than one.");
    }

    const factors = factorize(value);
    const duplicate = factors.find((factor, index) => factors.indexOf(factor) !== index);
    if (duplicate) {
      throw new Error(`Prime ${duplicate} appears more than once. Prime powers are reserved for Phase 7.`);
    }

    const generators = factors.map((prime) => {
      const generator = this.entries.get(prime);
      if (!generator) {
        throw new Error(`Prime ${prime} is not registered in the Phase 3 world registry.`);
      }
      return generator;
    });

    const missingPrime = [2, 3, 5, 7].find((prime) => !factors.includes(prime));
    if (missingPrime) {
      throw new Error(`World recipes currently require prime ${missingPrime} for stable baseline physics.`);
    }

    return { number: value, factors, generators };
  }

  serialize() {
    return [...this.entries.values()].map(({ prime, name, description }) => ({ prime, name, description }));
  }
}
