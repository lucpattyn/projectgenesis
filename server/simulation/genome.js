import { factorize } from "./prime-registry.js";

const SUPERSCRIPTS = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };

export function normalizeGenome(value) {
  if (typeof value === "number" || typeof value === "bigint" || typeof value === "string") {
    const numeric = Number(value);
    if (!Number.isSafeInteger(numeric) || numeric < 2) throw new Error("Legacy genome integers must be safe integers greater than one.");
    return Object.fromEntries(factorize(numeric).reduce((map, prime) => map.set(prime, (map.get(prime) ?? 0) + 1), new Map()));
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("A genome must be a prime-exponent map.");
  const genome = {};
  for (const [rawPrime, rawPower] of Object.entries(value)) {
    const prime = Number(rawPrime); const power = Number(rawPower);
    if (!Number.isSafeInteger(prime) || prime < 2 || !Number.isSafeInteger(power) || power < 0) throw new Error("Genome exponents must be non-negative integers.");
    if (power) genome[prime] = power;
  }
  if (!Object.keys(genome).length) throw new Error("A genome must contain at least one prime.");
  return Object.fromEntries(Object.entries(genome).sort(([a], [b]) => Number(a) - Number(b)));
}
export function cloneGenome(genome) { return { ...normalizeGenome(genome) }; }
export function genomeEquals(a, b) { return JSON.stringify(normalizeGenome(a)) === JSON.stringify(normalizeGenome(b)); }
export function genomePrimes(genome) { return Object.keys(normalizeGenome(genome)).map(Number); }
export function genomeExpression(genome) { return genomePrimes(genome).map((p) => { const n=normalizeGenome(genome)[p]; return n === 1 ? String(p) : `${p}${String(n).split("").map(x=>SUPERSCRIPTS[x]).join("")}`; }).join(" · "); }
export function genomeDecimal(genome) { let value=1n; for (const p of genomePrimes(genome)) value *= BigInt(p) ** BigInt(normalizeGenome(genome)[p]); return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null; }
