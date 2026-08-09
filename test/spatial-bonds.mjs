import assert from "node:assert/strict";
import { Simulation } from "../server/simulation/simulation.js";
import { World } from "../server/simulation/world.js";

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

// Structural overflow capture is opt-in, capacity-limited, and can only retain surplus that was already discarded.
simulation.config.overflowCapture.mode = "bond";
simulation.config.overflowCapture.captureFraction = 1;
simulation.config.overflowCapture.transferEfficiency = 1;
const captureBond = simulation.bonds.get(simulation.bondKey(first.id, second.id));
captureBond.reserve = 0;
const overflowResult = { overflowEnergy: 4, energyFlow: { losses: { capacityOverflow: 4 } } };
const capturedOverflow = simulation.captureStructuralOverflow(first, overflowResult);
assert.equal(capturedOverflow, 4, "Bond capture should retain available overflow up to reserve capacity.");
assert.equal(captureBond.reserve, 4, "Captured overflow should enter the existing bond reserve.");
assert.equal(overflowResult.energyFlow.losses.capacityOverflow, 0, "Captured energy must not also be counted as discarded.");
simulation.config.overflowCapture.mode = "disabled";

// A relay may cross exactly one shared organism, then the ordinary direct support rule delivers energy to the member.
simulation.bonds.clear();
const relayDirectKey = simulation.bondKey(first.id, second.id);
const relaySourceKey = simulation.bondKey(second.id, third.id);
simulation.bonds.set(relayDirectKey, { firstId: first.id, secondId: second.id, strength: 1, reserve: 1.4, inherited: false });
simulation.bonds.set(relaySourceKey, { firstId: second.id, secondId: third.id, strength: 1, reserve: 5, inherited: false });
simulation.config.bond.relayEnabled = true;
simulation.config.bond.maxRelayPerTick = 0.5;
first.energy = 0;
const relayContext = simulation.getSupportContext(first);
const relay = simulation.relayReserveToMember(first, relayContext);
assert.ok(relay.delivered > 0, "A reserve-rich adjacent bond should relay energy into the starving member's direct bond.");
assert.ok(simulation.supportLowEnergyMember(first) > 0, "Ordinary direct support should consume relayed reserve energy.");
simulation.config.bond.relayEnabled = false;

// Phase 16 environmental memory is a bounded, synchronous scalar layer with no ecological side effects.
const memoryWorld = new World({ width: 5, height: 5, wraps: false, wallChance: 0, initialFoodChance: 0, foodTargetDensity: 0 }, () => 0.5);
assert.equal(memoryWorld.readEnvironmentMemory(2, 2), 0, "Memory starts empty.");
assert.equal(memoryWorld.writeEnvironmentMemory(2, 2, 1.5), 1, "Writes clamp to the scalar maximum.");
memoryWorld.updateEnvironmentMemory({ enabled: true, decayRate: 1, diffusionRate: 0.01, coverageThreshold: 0.05, regionThreshold: 0.5 });
assert.equal(memoryWorld.readEnvironmentMemory(2, 2), 0.99, "Diffusion retains the configured local fraction.");
assert.equal(memoryWorld.readEnvironmentMemory(2, 1), 0.0025, "Diffusion is synchronous and symmetric into cardinal neighbors.");
assert.equal(memoryWorld.getEnvironmentMemoryStatistics({ coverageThreshold: 0.05, regionThreshold: 0.5 }).largestRegion, 1, "Region telemetry uses thresholded neutral memory only.");

const neutralProfile = simulation.genomeEngine.construct({ 2: 1, 3: 1, 5: 1, 7: 1, 13: 1, 17: 1, 19: 1, 31: 1, 41: 1, 43: 1 });
const neutralBrain = simulation.brainGenerator.generate(neutralProfile);
assert.ok(neutralBrain.nodes.some((item) => item.id === "p41-environment-write"), "Prime 41 must generate an environmental-write effector.");
assert.ok(neutralBrain.nodes.some((item) => item.id === "p43-environment-memory"), "Prime 43 must generate an environmental-memory sensor.");

// With no 41/43 carriers, enabling the neutral layer must not perturb deterministic ecology.
const memoryEnabledSimulation = new Simulation();
const memoryDisabledSimulation = new Simulation();
memoryEnabledSimulation.stop();
memoryDisabledSimulation.stop();
for (const candidate of [memoryEnabledSimulation, memoryDisabledSimulation]) {
  candidate.config.organism.mutationRate = 0;
  candidate.config.energeticEconomics.intervalTicks = 5;
  candidate.config.organism.founderGenome = { 2: 1, 3: 1, 5: 1, 7: 1, 13: 1, 17: 1, 19: 1, 31: 1 };
}
memoryEnabledSimulation.config.environmentMemory.enabled = true;
memoryDisabledSimulation.config.environmentMemory.enabled = false;
memoryEnabledSimulation.setSeed(1601);
memoryDisabledSimulation.setSeed(1601);
for (let tick = 0; tick < 20; tick += 1) {
  memoryEnabledSimulation.step();
  memoryDisabledSimulation.step();
}
assert.deepEqual(
  memoryEnabledSimulation.organisms.map((organism) => [organism.id, organism.x, organism.y, organism.energy, organism.alive]),
  memoryDisabledSimulation.organisms.map((organism) => [organism.id, organism.x, organism.y, organism.energy, organism.alive]),
  "The memory layer must be a deterministic null intervention when no organism can read or write it."
);
assert.equal(memoryEnabledSimulation.energyEconomicsSnapshot().intervals.length, 4, "Energy accounting should retain deterministic interval snapshots.");
assert.ok(memoryEnabledSimulation.energyEconomicsSnapshot().totalIncome > 0, "Energy accounting should record harvested food income.");
assert.equal(memoryEnabledSimulation.energyLogistics.timeSeries.length, 20, "Energy Logistics should retain one diagnostic entry per simulation tick.");
assert.ok(Number.isFinite(memoryEnabledSimulation.energyLogistics.timeSeries.at(-1).energyDistribution.gini), "Energy Logistics should calculate a finite inequality metric.");

console.log("Spatial bond regression checks passed");
