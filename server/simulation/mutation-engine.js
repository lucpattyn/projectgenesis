import { cloneGenome, genomePrimes, normalizeGenome } from "./genome.js";

const STRENGTHENABLE_PRIMES = new Set([3, 5, 7]);
// Every implemented organism capability is evolutionarily reachable through the same arithmetic graph.
const MUTATABLE_PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 31, 41, 43];
const MAX_PRIME_POWER = 3;

export class MutationEngine {
  mutate(genome, random, availablePrimes = MUTATABLE_PRIMES) {
    const before = normalizeGenome(genome);
    const factors = genomePrimes(before);
    const choices = [];

    for (const prime of availablePrimes) {
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
        && before[prime] < MAX_PRIME_POWER
      ) {
        choices.push({ type: "strengthen", prime });
      }
    }

    const mutation = choices[Math.floor(random() * choices.length)];
    const after = cloneGenome(before);

    if (mutation.type === "gain" || mutation.type === "strengthen") {
      after[mutation.prime] = (after[mutation.prime] ?? 0) + 1;
    } else {
      after[mutation.prime] -= 1;
      if (!after[mutation.prime]) delete after[mutation.prime];
    }

    return {
      ...mutation,
      before,
      after,
      description: mutation.type === "gain"
        ? `+${mutation.prime}: gained Generator ${mutation.prime}.`
        : mutation.type === "lose"
          ? `-${mutation.prime}: lost Generator ${mutation.prime}.`
          : `+${mutation.prime}: strengthened Generator ${mutation.prime}.`
    };
  }
}

export const DEFAULT_MUTATION_ENGINE = new MutationEngine();
