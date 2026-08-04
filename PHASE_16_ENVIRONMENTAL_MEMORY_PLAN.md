# Project Genesis — Phase 16: Environmental Memory

## Purpose

Phase 16 tests whether persistent state in the world can become a useful computational resource through evolution. It introduces no food source, objective, navigation rule, pheromone behavior, reward, or semantic label.

The new substrate is one neutral scalar per world cell. Organisms may eventually mutate the ability to write that scalar (Prime 41) and/or read it (Prime 43). Any interpretation of a value, pattern, gradient, or persistence must emerge through generated graph execution and selection.

This is the third computational substrate in Project Genesis:

1. Individual computation: generated organism graphs.
2. Distributed structural computation: state exchanged through bonds and facets.
3. Environmental computation: persistent, diffusing, decaying world state.

## Scientific question

**Will evolving lineages discover a use for a neutral persistent environmental scalar when its only effects are graph input and energy-costly graph output?**

This is explicitly not the question “can organisms leave trails?” A successful implementation must not resemble a pheromone system: no gradient-following rule, no semantic resource or danger labels, no automatic response, and no environmental effect outside the Prime-43 graph input.

## Invariants and non-goals

These constraints are acceptance criteria, not suggestions.

- Environmental memory is server-owned and deterministic.
- Every cell stores `environmentMemory` in the closed range `[0, 1]`.
- It begins at `0` when the world is created or reset.
- It changes only through Prime-41 writes, natural decay, and diffusion.
- Prime 43 receives only the current scalar value at the organism’s occupied cell.
- Existing founder genomes do not contain 41 or 43.
- No existing organism capability is reinterpreted.
- Environmental memory must never directly modify food, energy, movement, reproduction, mutation, fertility, chemistry, signals, bonds, facets, gate state, gate reward, courier messages, or any other world rule.
- The only cost of writing is an explicit configurable energy cost paid by the writer.
- Read-only capability must be physiologically neutral except for whatever graph wiring its prime convention already creates; it must not create a behavior by itself.
- All controls and experiment conditions must be seed-reproducible.

## Stage 0 — freeze a Phase 15.5 baseline

Before implementation, record a baseline experiment using the current high-output port-coupled gate ecology (`gatePortFoodRate: 0.9`), couriers off, and a fixed seed block.

Record at least:

- population and energy time series;
- Prime-31 frequency and carrier count;
- bonds, facets, facet births, and bond/facet lifetime distributions;
- gate attendances and completions;
- task-food worker versus competitor harvests;
- lineage longevity and extinctions;
- facet-work-trail summary image or snapshot at the horizon.

The Phase 16 experiments must reuse this baseline recipe so that memory is the only intended change.

## Stage 1 — independent world layer

### Data model

Add to `World`:

```js
environmentMemory: number[][]
```

The array dimensions exactly match `world.height × world.width`. It is initialized to zeros alongside fertility, nutrients, detritus, ash, and signals. It must be included in reset/serialization and nowhere else by reference.

Add world methods with narrow responsibilities:

```js
readEnvironmentMemory(x, y): number
writeEnvironmentMemory(x, y, amount): number
updateEnvironmentMemory(config): void
getEnvironmentMemoryStatistics(): { average, coverage, largestRegion, ... }
```

`writeEnvironmentMemory` clamps both the write amount and final cell value. Its return value should be the actual increase, permitting exact energy-accounting telemetry.

### Configuration

Add an independent `environmentMemory` config section, for example:

```js
environmentMemory: {
  enabled: false,
  decayRate: 0.9995,
  diffusionRate: 0.01,
  writeEnergyCost: 0.12,
  writeGain: 0.18,
  coverageThreshold: 0.05,
  regionThreshold: 0.12
}
```

The precise values are preliminary. `enabled` controls layer updates and visualization availability; it does not grant either prime. The memory-enabled experiment condition should set it true, while the baseline remains false.

### Deterministic update rule

Use a double-buffered synchronous update. Never diffuse by mutating the source grid in place, because update order would then become a hidden behavior.

For each cell:

1. Start with its retained value after decay.
2. Move a small configured fraction of the pre-update value evenly to legal cardinal neighbors.
3. Retain the remainder locally.
4. Clamp numerical round-off to `[0, 1]`.

Choose and document one boundary policy. Recommended: use the world’s existing wrap policy consistently; a non-wrapping world retains diffusion mass that would otherwise leave through a boundary. The result must conserve memory mass under diffusion alone, except for decay, clamping at saturation, and new writes.

Update this layer once per simulation tick in a documented position in the step order. Recommended order:

1. Organisms read prior-tick memory through their graph input.
2. Organism graph outputs and actions run.
3. Prime-41 writes are applied and costs accounted for.
4. Existing organism/world systems complete normally.
5. Memory decay and synchronous diffusion run once, preparing the next tick.

This preserves a read-then-write causal rule and prevents an organism from reading its own same-tick write.

## Stage 2 — Prime registry and generated graph primitives

### Prime 41: Environmental Write

Register Prime 41 in the genome/capability registry.

- Capability name: `Environmental Write`.
- Generated graph node: one effector/output, `p41-environment-write`.
- Output is clamped to `[0, 1]`.
- The output has no world meaning. It is only a requested scalar increment under the organism’s current cell.
- If output is positive and the environmental layer is enabled, the organism pays `writeEnergyCost × output` and the world receives `writeGain × output`, subject to energy availability and cell saturation.
- Record requested write, paid cost, and actual deposited amount separately.

Writing must not force movement, emit a signal, create a marker with organism-readable meaning, or influence a non-Prime-43 organism.

### Prime 43: Environmental Read

Register Prime 43 in the genome/capability registry.

- Capability name: `Environmental Read`.
- Generated graph node: one input, `p43-environment-memory`.
- Input is exactly the scalar at the organism’s current cell at tick start, normalized to `[0, 1]`.
- It has no automatic edge to any movement, consume, bind, reproduce, or signal effector.
- Graph construction determines whether and how it can interact with other generated nodes, under the same general graph-composition rules as existing primes.

### Founder and mutation rules

- Do not modify the default founder genome.
- Add 41 and 43 to the symmetric implemented-prime mutation candidate registry only after their isolated mechanism tests pass.
- Retain the existing mutation probability and choice model unless a dedicated Phase 16 mutation screen demonstrates that the rarity of both capabilities makes observation impossible.
- Arithmetic mutation must use exponent-map gain/loss operations; integer multiplication/division must not return.
- A lineage may gain either prime independently, both, or neither.

## Stage 3 — telemetry and snapshots

### World-level measurements

Expose through snapshots and experiment records:

- mean environmental memory;
- total memory mass;
- coverage: fraction of cells at or above `coverageThreshold`;
- largest connected region: number of thresholded cells in the largest cardinally connected component;
- number of connected regions;
- mean age/lifetime of memory mass, if tracked with an auxiliary age/mass representation;
- memory lost to decay and gained through writes per tick.

For the first implementation, “mean memory lifetime” should be defined precisely before coding. Recommended robust definition: maintain a parallel weighted age field and report `sum(memory × age) / sum(memory)`; diffusion transports both mass and weighted age proportionally. Do not infer lifetime from wall-clock age of a cell.

### Lineage and organism measurements

Track, without interpreting them as fitness:

- total write requests, successful writes, deposited mass, and energy spent per lineage;
- read-capable organism ticks per lineage;
- current and historical fraction of living population with Prime 41, Prime 43, and both;
- mean memory value encountered by each genotype class: neither, write-only, read-only, both;
- correlation between local memory at tick start and subsequent reproduction opportunity, reported separately by genotype class;
- correlation between write use and lineage longevity;
- optional gate/facet association tables: memory exposure versus gate completion/facet persistence, clearly labeled descriptive only.

### Safety audit telemetry

Add a development-only invariant check or deterministic test confirming that a run with no 41/43 carriers produces identical organism/world trajectories whether the neutral layer is enabled or disabled. This guards against accidental coupling.

## Stage 4 — visualization

Add a user-switchable `Environmental Memory` canvas layer, enabled for inspection but never required for simulation execution.

- Render memory as a translucent blue-to-purple heat map.
- Zero is fully transparent.
- Intensity should use a nonlinear display transform (for example square root) so weak gradients remain visible without saturating high values.
- Render it as a distinct layer, independent of fertility, chemistry, signal, traffic, gates, and the observational facet-work trail.
- Include a compact legend with the scalar range only: `0` to `1`; do not call values food, danger, home, path, message, or trail.
- Add a settings toggle that changes rendering only. The underlying layer may continue updating while hidden.
- Include the layer in snapshot serialization so the canvas and saved experiment views are consistent.

The existing facet-work trail must remain visually distinct: it is an observer-only historical heatmap, whereas environmental memory is a live world state that a Prime-43 graph may read.

## Stage 5 — Evolution Lab design

Run staged experiments; do not combine Phase 16 with new terrain, new resources, altered gate rules, or courier changes.

### A. Mechanism and null tests

1. Empty-layer decay: a zero layer remains zero.
2. Single write: increases one cell by the expected clamped amount and pays exactly the expected energy cost.
3. Diffusion: symmetric cross-shaped spreading from one write; total mass changes only through specified decay.
4. Read isolation: Prime 43 sees the exact prior-tick cell scalar.
5. Write isolation: Prime 41 changes no existing ecological field.
6. No-carrier equivalence: enabled/disabled runs with no 41/43 genomes have identical trajectories under the same seed.
7. Reset determinism: same seed recreates the same memory history; randomize creates a new one.

### B. Capability controls

Use the same founder mix, ecology, gates, mutation rate, horizon, and seed block in every condition:

| Condition | Layer | Prime 41 available | Prime 43 available | Purpose |
| --- | --- | --- | --- | --- |
| Memory disabled | Off | No | No | Ecological baseline |
| Write only | On | Yes | No | Cost and pattern formation without read use |
| Read only | On | No writes possible | Yes | Neutral sensing control |
| Read + write | On | Yes | Yes | Full environmental-computation substrate |

The “available” rows should be implemented by restricting the mutation candidate registry for that experimental run, not by seeding capabilities into founders. This preserves the claim that the primes arise evolutionarily.

### C. Replication schedule

1. Development screen: 3 seeds × 500 ticks to catch regressions and inspect visualization.
2. Selection screen: at least 8 independent seeds × 1,000 ticks.
3. Persistence screen: at least 8 independent seeds × 2,000 ticks, using the viable port-coupled gate baseline.
4. If any apparent advantage appears, repeat with a fresh preregistered seed block before making a causal claim.

### Primary outcomes

- frequency and persistence of 41, 43, and 41+43 lineages;
- population survival and lineage longevity;
- bond and facet lifetime, not merely counts;
- gate completion and responsible-worker harvest;
- memory use and spatial persistence;
- memory-disabled versus read/write comparative outcomes.

### Decision rules

- Evidence of use is not a colorful map or nonzero writes.
- A phase result is promising only if the read+write condition repeatedly differs from both write-only and read-only controls in lineage persistence or task-relevant performance, while preserving the no-direct-coupling invariant.
- If writes appear but 43 does not persist, report environmental modification without demonstrated environmental computation.
- If 43 persists but 41 does not, report value of passive world-state sensing only if controls support it.
- If neither prime persists, that is a valid negative result: this ecology may not reward environmental memory.

## Implementation order for tomorrow

1. Add the world layer, reset behavior, deterministic decay/diffusion, and unit tests.
2. Add snapshot serialization and a read-only visual overlay; verify it cannot alter state.
3. Add Prime 43 input only; test prior-tick read isolation.
4. Add Prime 41 output, write cost, exact accounting, and isolation tests.
5. Add both primes to the mutation registry behind experiment-level availability controls.
6. Extend experiment runner, aggregate records, and Evolution Lab UI with the four controls.
7. Run mechanism tests, then the 3 × 500 development screen.
8. Append outcomes—positive or negative—to `EVOLUTIONARY_VALIDATION_HANDOFF.md` before changing parameters.

## Explicit anti-patterns to reject during review

Reject any implementation that does any of the following:

- chooses a direction from a memory gradient;
- calls a value a food, danger, home, gate, path, pheromone, or message field;
- causes a write to create food, energy, fertility, a signal, a gate reward, or a reproduction benefit;
- lets non-Prime-43 organisms react to memory;
- lets Prime 43 bypass generated graph execution;
- applies in-place diffusion with order-dependent results;
- seeds 41 or 43 into the standard founder genome;
- interprets a spatial pattern as intelligence without matched controls and replication.

## Deliverables

- Independent `World.environmentMemory` layer with deterministic update tests.
- Prime 41/43 registry and generated graph support.
- Mutation integration using exponent-map arithmetic only.
- Memory telemetry, lineage accounting, and experiment persistence.
- Blue-purple memory visualization toggle and legend.
- Four-condition Evolution Lab screen.
- Updated `README.md` and `EVOLUTIONARY_VALIDATION_HANDOFF.md` with definitions, methods, controls, results, and known limits.
