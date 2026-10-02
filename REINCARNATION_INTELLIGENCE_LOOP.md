# Reincarnation Intelligence Loop

This branch (`codex/reincarnation-intelligence-loop`) runs Project Genesis as a sequence of bounded, inspectable worlds. A world lasts 1,000 simulation ticks. At the boundary, the current world is scored, its result is retained, and a new world is seeded with a different environmental recipe.

## What changes between worlds

Recipes vary environmental and ecological parameters only:

- food growth and replenishment attempts;
- gate discovery and navigation;
- resource-funded physical reserves;
- dormant-bond availability;
- collective movement cost.

Organism code, pretrained data, and external labels are never injected. The organisms receive only the world, local resources, local gate reports, and their existing topology/pulses.

## Cycle policy

The controller explores each recipe once. Afterwards it selects the next recipe adjacent to the best-scoring result, using a transparent search rather than a hidden model. Each result records population, births, deaths, bonds, facets, gate sightings, relays, consensus, gate completions, and bond turnover.

The score rewards:

- population retention;
- connected structure and facets;
- gate consensus and completed environmental work;
- continuity without assuming survival alone is intelligence.

Low-scoring cycles are explicitly marked as exploration. A high score is not a claim of intelligence; it is a cue for the next controlled comparison.

## Topology continuity

At the boundary, the strongest connected component with at least four living members is carried into the next world. Its relative geometry, local controller state, traces, and bond reserves survive with a 10% reserve transition loss. New organisms and the environmental field are still seeded afresh around it. This creates a controlled continuity test: a morphology can encounter a new world, interact with new resources, and either adapt, consolidate, or fail.

## Live observability

The API snapshot exposes `reincarnation` with the current recipe, cycle, generation, remaining ticks, last score, and bounded history. The live canvas header displays the cycle and recipe. The default branch behavior is not changed by this work; this branch starts the loop enabled for observation.

## Safety and interpretation

- No pulse creates energy.
- Resource-funded mode uses physical harvest and bounded transfers.
- Dormant bonds pay reduced upkeep but cannot communicate until a nearby food or available gate cue wakes them.
- Gate information remains local, decaying, and quorum-based.
- A cycle reset is a deliberate experimental boundary, not evidence that a morphology reproduced itself.

Run the server with `node server/index.js` and watch `http://localhost:3000/`. Use `/api/state` to inspect the current recipe and cycle history.
