// Package B: bounded input-dependent structural response and input-removal test.
// This is an isolated headless diagnostic; live defaults are not changed.
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160103, 160104, 160105];
const PHASE_TICKS = Number(process.env.GENESIS_GUIDED_PHASE_TICKS ?? 60);
const REMOVAL_TICKS = Number(process.env.GENESIS_GUIDED_REMOVAL_TICKS ?? 40);

function flatten(grid) { return grid.flat(); }

function shuffledGrid(grid, seed) {
  const values = flatten(grid).slice();
  let state = seed >>> 0;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [values[index], values[swap]] = [values[swap], values[index]];
  }
  return Array.from({ length: grid.length }, (_, y) => values.slice(y * grid.length, (y + 1) * grid.length));
}

function metrics(simulation, label) {
  const snapshot = simulation.getSnapshot();
  const organisms = snapshot.organisms;
  const traces = organisms.map((organism) => organism.guidedResponseTrace ?? 0);
  const inputSignals = organisms.map((organism) => organism.guidedInputSignal ?? 0);
  const mean = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const strongFacets = snapshot.facets.filter((facet) => facet.strength >= simulation.config.facet.minimumBondStrength).length;
  return {
    label,
    tick: snapshot.statistics.tick,
    population: snapshot.statistics.population,
    bonds: snapshot.bonds.length,
    strongFacets,
    components: simulation.getBondGroups().filter((group) => group.length >= 3).length,
    inputMean: Number(mean(inputSignals).toFixed(4)),
    responseTraceMean: Number(mean(traces).toFixed(4)),
    activeResponseTraces: traces.filter((value) => value > 0.05).length,
    meanBondStrength: snapshot.bonds.length ? Number(mean(snapshot.bonds.map((bond) => bond.strength)).toFixed(4)) : 0,
    bondsFormed: snapshot.telemetry.bondsFormed,
    bondsBroken: snapshot.telemetry.bondsBroken
  };
}

function run(seed, scenario) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setHeadlessObservationMode(true);
  simulation.setSeed(seed);
  simulation.stop();
  simulation.config.guidedStructuralIntelligence.adaptiveResponse.enabled = scenario !== "blank";
  simulation.setGuidedStructuralIntelligenceEnabled(true);
  simulation.setGuidedPattern("blank");
  for (let tick = 0; tick < 20; tick += 1) simulation.step();
  const phases = [metrics(simulation, "blank-start")];

  if (scenario !== "blank") simulation.setGuidedPattern("horizontal-boundary");
  for (let tick = 0; tick < PHASE_TICKS; tick += 1) simulation.step();
  phases.push(metrics(simulation, "horizontal-train"));

  if (scenario !== "blank") simulation.setGuidedPattern("vertical-boundary");
  for (let tick = 0; tick < PHASE_TICKS; tick += 1) simulation.step();
  phases.push(metrics(simulation, "vertical-train"));

  if (scenario !== "blank") simulation.setGuidedPattern("closed-outline");
  for (let tick = 0; tick < PHASE_TICKS; tick += 1) simulation.step();
  phases.push(metrics(simulation, "closed-outline-unseen"));

  simulation.setGuidedStructuralIntelligenceEnabled(false);
  for (let tick = 0; tick < REMOVAL_TICKS; tick += 1) simulation.step();
  phases.push(metrics(simulation, "input-removed"));

  simulation.setGuidedStructuralIntelligenceEnabled(true);
  if (scenario !== "blank") {
    const shuffled = shuffledGrid(simulation.guidedInput.grid, seed);
    simulation.setGuidedGrid(shuffled, "shuffled-control");
  }
  for (let tick = 0; tick < PHASE_TICKS; tick += 1) simulation.step();
  phases.push(metrics(simulation, "shuffled-control"));

  return { seed, scenario, phases };
}

const runs = [];
for (const seed of SEEDS) {
  runs.push(run(seed, "guided"));
  runs.push(run(seed, "blank"));
}

const guided = runs.filter((run) => run.scenario === "guided");
const blank = runs.filter((run) => run.scenario === "blank");
const phase = (records, label) => records.flatMap((run) => run.phases.filter((entry) => entry.label === label));
const mean = (records, field) => records.length ? Number((records.reduce((sum, entry) => sum + entry[field], 0) / records.length).toFixed(4)) : 0;
const report = {
  protocol: {
    task: "input-dependent local response with input removal",
    seeds: SEEDS,
    phaseTicks: PHASE_TICKS,
    removalTicks: REMOVAL_TICKS,
    scenarios: ["guided", "blank"],
    controls: ["blank input", "shuffled closed-outline", "input removed"],
    claimBoundary: "Package B infrastructure screen; not evidence of image understanding"
  },
  summary: {
    guidedUnseenTrace: mean(phase(guided, "closed-outline-unseen"), "responseTraceMean"),
    blankUnseenTrace: mean(phase(blank, "closed-outline-unseen"), "responseTraceMean"),
    guidedRemovedTrace: mean(phase(guided, "input-removed"), "responseTraceMean"),
    guidedUnseenBonds: mean(phase(guided, "closed-outline-unseen"), "bonds"),
    blankUnseenBonds: mean(phase(blank, "closed-outline-unseen"), "bonds"),
    guidedUnseenFacets: mean(phase(guided, "closed-outline-unseen"), "strongFacets"),
    blankUnseenFacets: mean(phase(blank, "closed-outline-unseen"), "strongFacets")
  },
  runs
};

console.log(JSON.stringify(report, null, 2));
