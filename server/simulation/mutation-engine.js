import { factorize } from "./prime-registry.js";

const STRENGTHENABLE_PRIMES = new Set([3, 5, 7]);
const MAX_PRIME_POWER = 3;

export class MutationEngine {
  mutate(genome, random) {
    const before = Number(genome);
    const factors = factorize(before);
    const choices = [];

    for (const prime of [13, 17, 19, 31]) {
      if (!factors.includes(prime)) {
        choices.push({ type: "gain", prime });
      }
    }

    for (const prime of new Set(factors)) {
      if (factors.length > 1) {
        choices.push({ type: "lose", prime });
      }
      if (
        STRENGTHENABLE_PRIMES.has(prime)
        && factors.filter((factor) => factor === prime).length < MAX_PRIME_POWER
        && Number.isSafeInteger(before * prime)
      ) {
        choices.push({ type: "strengthen", prime });
      }
    }

    const mutation = choices[Math.floor(random() * choices.length)];
    let after = before;

    if (mutation.type === "gain" || mutation.type === "strengthen") {
      after *= mutation.prime;
    } else {
      after /= mutation.prime;
    }

    return {
      ...mutation,
      before,
      after,
      description: mutation.type === "gain"
        ? `x ${mutation.prime}: gained Generator ${mutation.prime}.`
        : mutation.type === "lose"
          ? `/ ${mutation.prime}: lost Generator ${mutation.prime}.`
          : `x ${mutation.prime}: strengthened Generator ${mutation.prime}.`
    };
  }
}

export const DEFAULT_MUTATION_ENGINE = new MutationEngine();
