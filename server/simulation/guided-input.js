import { clamp } from "./utils.js";

export const GUIDED_INPUT_SIZE = 16;

const BUILT_IN_PATTERNS = {
  "horizontal-boundary": (x, y, size) => y >= Math.floor(size / 2) ? 1 : 0,
  "vertical-boundary": (x, y, size) => x >= Math.floor(size / 2) ? 1 : 0,
  "closed-outline": (x, y, size) => {
    const margin = Math.max(2, Math.floor(size / 4));
    const max = size - margin - 1;
    return (x >= margin && x <= max && y >= margin && y <= max
      && (x === margin || x === max || y === margin || y === max)) ? 1 : 0;
  },
  blank: () => 0
};

export function normalizeGuidedGrid(grid, size = GUIDED_INPUT_SIZE) {
  const result = Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => {
    const value = Number(grid?.[y]?.[x] ?? 0);
    return Number.isFinite(value) ? clamp(value, 0, 1) : 0;
  }));
  return result;
}

export function createGuidedInput({ size = GUIDED_INPUT_SIZE, pattern = "horizontal-boundary", enabled = false } = {}) {
  const generator = BUILT_IN_PATTERNS[pattern] ?? BUILT_IN_PATTERNS["horizontal-boundary"];
  const grid = Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => generator(x, y, size)));
  return { enabled: Boolean(enabled), size, pattern, grid, source: "built-in", revision: 0 };
}

export function setGuidedPattern(input, pattern) {
  const next = createGuidedInput({ size: input.size, pattern, enabled: input.enabled });
  next.revision = (input.revision ?? 0) + 1;
  return next;
}

export function setGuidedGrid(input, grid, source = "uploaded") {
  return {
    ...input,
    pattern: "custom",
    source,
    grid: normalizeGuidedGrid(grid, input.size),
    revision: (input.revision ?? 0) + 1
  };
}

export function sampleGuidedInput(input, worldX, worldY, worldWidth, worldHeight, radius = 0) {
  if (!input?.enabled || !input.grid?.length) return 0;
  const centerX = Math.min(input.size - 1, Math.max(0, Math.floor((worldX + 0.5) / worldWidth * input.size)));
  const centerY = Math.min(input.size - 1, Math.max(0, Math.floor((worldY + 0.5) / worldHeight * input.size)));
  const values = [];
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      const x = Math.min(input.size - 1, Math.max(0, centerX + dx));
      const y = Math.min(input.size - 1, Math.max(0, centerY + dy));
      values.push(input.grid[y]?.[x] ?? 0);
    }
  }
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function serializeGuidedInput(input) {
  return {
    enabled: Boolean(input?.enabled),
    size: input?.size ?? GUIDED_INPUT_SIZE,
    pattern: input?.pattern ?? "blank",
    source: input?.source ?? "built-in",
    revision: input?.revision ?? 0,
    grid: normalizeGuidedGrid(input?.grid, input?.size ?? GUIDED_INPUT_SIZE)
  };
}
