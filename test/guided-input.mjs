import assert from "node:assert/strict";
import { createGuidedInput, sampleGuidedInput, setGuidedGrid, setGuidedPattern } from "../server/simulation/guided-input.js";

const horizontal = createGuidedInput({ pattern: "horizontal-boundary", enabled: true });
assert.equal(horizontal.size, 16);
assert.equal(horizontal.grid[0][0], 0);
assert.equal(horizontal.grid[15][0], 1);
assert.equal(sampleGuidedInput(horizontal, 2, 60, 64, 64, 0), 1);

const outline = setGuidedPattern(horizontal, "closed-outline");
assert.equal(outline.pattern, "closed-outline");
assert.equal(outline.revision, 1);
assert.equal(outline.grid[4][4], 1);
assert.equal(outline.grid[8][8], 0);

const custom = setGuidedGrid(outline, [[2]], "test");
assert.equal(custom.source, "test");
assert.equal(custom.grid[0][0], 1);
assert.equal(custom.grid[15][15], 0);

console.log("Guided input checks passed");
