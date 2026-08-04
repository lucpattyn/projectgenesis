export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeSeed(seed) {
  const numericSeed = Number(seed);
  return Number.isFinite(numericSeed) ? Math.floor(numericSeed) >>> 0 : 1;
}

export function createSeededRandom(seed) {
  let state = normalizeSeed(seed);

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(maxExclusive, random) {
  return Math.floor(random() * maxExclusive);
}

export function randomChoice(items, random) {
  return items[randomInt(items.length, random)];
}

export function wrapCoordinate(value, size) {
  return (value + size) % size;
}

export function average(values) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function jitterHue(hue, amount, random) {
  const shifted = hue + Math.floor((random() * (amount * 2 + 1)) - amount);
  return (shifted + 360) % 360;
}

export function hueToColor(hue, saturation = 70, lightness = 58) {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function createTile(x, y, type) {
  return { x, y, type, foodOrigin: null };
}

export function formatNumber(value, decimals = 1) {
  return Number.isInteger(value) ? String(value) : value.toFixed(decimals);
}
