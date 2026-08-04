import assert from "node:assert/strict";
import { Simulation } from "../server/simulation/simulation.js";

function pairKeys(simulation, pairs) {
  return pairs.map(([first, second]) => simulation.bondKey(first.id, second.id)).sort();
}

const simulation = new Simulation();
simulation.stop();
simulation.setWorldNumber(85470);
simulation.setFounderGenome(27335490);
simulation.config.organism.initialPopulation = 6;
simulation.reset();

const positions = [[0, 0], [63, 0], [2, 2], [5, 0], [30, 30], [31, 32]];
for (const [index, organism] of simulation.organisms.entries()) {
  [organism.x, organism.y] = positions[index];
  organism.brainExecution = { effectors: { bind: 1 } };
}

const candidates = simulation.organisms;
const expected = [];
for (let index = 0; index < candidates.length; index += 1) {
  for (let otherIndex = index + 1; otherIndex < candidates.length; otherIndex += 1) {
    if (simulation.areAdjacent(candidates[index], candidates[otherIndex])) {
      expected.push([candidates[index], candidates[otherIndex]]);
    }
  }
}
assert.deepEqual(pairKeys(simulation, simulation.findAdjacentCandidatePairs(candidates)), pairKeys(simulation, expected));

const [first, second] = simulation.organisms;
simulation.structuralBirthSeeds.set(simulation.bondKey(first.id, second.id), 1.2);
for (let tick = 0; tick < simulation.config.bond.buddingCandidateTicks; tick += 1) simulation.updateBonds();
const inherited = simulation.bonds.get(simulation.bondKey(first.id, second.id));
assert.ok(inherited, "Inherited seed should still mature into a bond.");
assert.equal(inherited.inherited, true);

// A strong three-member facet must maintain contact with a chemical patch before it can recover it.
const [third] = simulation.organisms.slice(2, 3);
for (const organism of [first, second, third]) organism.brainExecution = { effectors: { bind: 1 } };
[[first, second], [first, third], [second, third]].forEach(([left, right]) => {
  simulation.bonds.set(simulation.bondKey(left.id, right.id), {
    firstId: left.id,
    secondId: right.id,
    strength: 1,
    reserve: 10,
    inherited: false
  });
});
simulation.config.refinery.enabled = true;
simulation.facetCatalysts.set(simulation.facetKey([first.id, second.id, third.id]), 1);
simulation.world.setTileType(first.x, first.y, "EMPTY");
simulation.world.detritus[first.y][first.x] = 1;
for (let tick = 0; tick < simulation.config.refinery.candidateTicks - 1; tick += 1) simulation.updateFacetRefineries();
assert.equal(simulation.refineryConversions, 0, "Refinery must require sustained facet contact.");
simulation.updateFacetRefineries();
assert.equal(simulation.refineryConversions, 1, "Strong facets should refine stored chemical material.");
assert.equal(simulation.world.getTile(first.x, first.y).type, "FOOD", "Refining material should release ordinary local food.");

// A port-coupled gate produces only while the exact responsible facet remains present.
simulation.config.collectiveWork.gateOutputMode = "port-coupled";
const facetKey = simulation.facetKey([first.id, second.id, third.id]);
[[first, [20, 19]], [second, [21, 21]], [third, [19, 21]]].forEach(([organism, [x, y]]) => {
  organism.x = x;
  organism.y = y;
});
const portGate = { id: 99, x: 20, y: 20, fieldStrength: 1, productionBudget: 1, fieldFacetKey: facetKey, nextPortIndex: 0 };
simulation.workGates = [portGate];
simulation.updateCollectiveWorkFields();
const ports = simulation.getGateWorkPorts(portGate);
assert.ok(ports.some((port) => simulation.world.getTile(port.x, port.y).foodOrigin?.mode === "port-coupled"), "A maintained facet should produce food at a visible work port.");
simulation.bonds.delete(simulation.bondKey(first.id, second.id));
simulation.updateCollectiveWorkFields();
assert.equal(portGate.fieldStrength, 0, "Port production must stop immediately when the responsible facet dissolves.");

// Facet history is observational: a strong closed triangle marks each occupied cell.
simulation.bonds.set(simulation.bondKey(first.id, second.id), { firstId: first.id, secondId: second.id, strength: 1, reserve: 10, inherited: false });
simulation.recordFacetWorkTrail();
assert.ok(simulation.facetWorkTrail[first.y][first.x] > 0, "A strong facet should leave a cell-level work trace.");

console.log("Spatial bond regression checks passed");
