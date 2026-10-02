# Project Genesis — Gate discovery, local consensus, and earned support

Date: 2026-09-20  
Branch: `codex/delayed-cue-computation`

## Executive status

Genesis now forms substantial bonded morphologies under a bounded supported-development mode. The current direction is to replace unconditional maintenance with an earned, component-local support wallet. Structures receive support only when stress is present and useful events replenish credits. The unconditional override remains available for controlled rescue runs but is off by default.

The next bottleneck is gate discovery and consensus. Components can enter migration without an assigned gate, then follow averaged graph direction and oscillate locally. They can form visually complex structures but do not reliably reach or solve the nearest gate.

## What is implemented

- Package A: bounded 16×16 local guided input; organisms receive only local pixels.
- Package B: bounded adaptive response traces and visual response activity.
- Supported-development accounting: population/connection caps, member support, bond reserve support, age protection, and exploratory movement.
- Per-component connection budget: global cap 96, component cap 48, preventing one morphology from monopolizing all bonding capacity.
- Earned support wallet:
  - default conditional mode is active only when supported development is enabled;
  - stress must be present before credits are spent;
  - food, guided-return, gate, migration, reproduction, scout-return, and member-support pulses replenish credits;
  - credits decay and are capped per component;
  - support priority remains source survival → reproduction reserve → member support → bond reserve.
- Unconditional support override is exposed in the UI and defaults off.
- Default custom survival cue: a deterministic 16×16 radial gradient (`default-survival-cue`). Local sensing alone earns nothing; successful food return near a strong cue emits a `guided-return` pulse.

## Recent commits

- `bb61cc4` — integrated delayed image-memory task and UI/API runner.
- `2a11a72` — avoid idle drain during supported rest.
- `490c7ad` — raise bounded supported survival budget.
- `3d0d76d` — allow supported collectives to form bonds.
- `d8950c5` — cap bonds per connected component.
- `8bbeba2` — make development support earned and optional.
- `48e771e` — expose optional unconditional support override.
- `3cc3849` — reward successful cue-adjacent returns.

## Measured replay

A controlled replay was run toward the first 650 ticks. The accelerated run overshot the boundary, so the measurement is treated as a diagnostic, not an acceptance benchmark. Before extinction it recorded:

- 91 bonds formed and 91 later broken;
- 60 bond breaks caused by member energy exhaustion;
- 31 caused by bond-reserve depletion;
- 0 successful gate consensus completions;
- 0 active gate production fields;
- 0 gate assignments for the migrating component.

The component therefore formed real morphology, but its early concentration near the upper-right gate was not evidence that the gate supplied energy. It was primarily a consequence of local adjacency, food/cue geometry, and early successful bonding. Once the component entered migration without a gate target, it oscillated and eventually exhausted earned support credits.

## Proposed gate discovery protocol

1. **Local sighting:** an organism detects a gate only inside a bounded radius and records gate signature, relative direction, coarse distance, phase, remaining stock, confidence, and TTL.
2. **Contact exchange:** a collision or existing bond emits a short `gate-sighting` pulse. It carries only that bounded record and attenuates by hop distance.
3. **Component memory:** hubs/core members retain sightings temporarily; repeated sightings reinforce confidence and stale records decay.
4. **Consensus proposal:** members independently propose a gate. A component selects a target only after a quorum agrees on gate signature and direction within tolerance.
5. **Action verification:** arrival and successful gate solving reinforce the path and replenish the local support wallet. Exhaustion or failed consensus invalidates the record.
6. **No reward for information alone:** hearing or relaying a sighting does not create energy; only useful work and returned value do.

Relative vectors are preferred over unrestricted global coordinates. A short-lived coordinate/signature may be retained internally solely to recognize the same gate across relays.

## Questions for Astra to verify

1. Is a relative-vector gate record plus gate signature sufficient for consistent multi-hop navigation on the toroidal world, or should a quantized coordinate be included?
2. What quorum and confidence-decay schedule best prevents one noisy sighting from steering a whole component?
3. Should gate-sighting pulses be allowed through unbonded collisions, or only through existing bonds after a minimum contact duration?
4. Should a migrating component be allowed one low-cost exploratory scout before declaring migration failure?
5. Is the current earned-support emergency floor too generous, too weak, or appropriately bounded?
6. Should support credits be reserved per connected component exactly as implemented, or split into core reserve and scout reserve?

## Reproduction commands

```powershell
npm test
npm start
```

The visual server exposes the guided input and support controls at `http://localhost:3000/`. The delayed image benchmark remains at `scripts/run-guided-image-memory-task.mjs`; its current smoke result is below the frozen 80%-in-6/8 target and must not be described as completed learning.

## Recommended next implementation

Implement local `gate-sighting` records and TTL decay first, then add quorum-based gate assignment. Keep ordinary ecology defaults unchanged, retain the unconditional support override as a disabled comparison control, and measure gate arrivals, consensus completions, support-credit inflow/outflow, bond lifetime, and component migration distance.

## Implementation update (2026-10-02)

The local gate-discovery layer is now implemented and enabled by default under `collectiveWork.gateDiscovery.enabled`. Organisms detect nearby non-exhausted gates, exchange attenuated reports across bonds for bounded hops, and components select a target after a minimum report quorum. Reports include a gate signature, relative vector, phase, stock, confidence, and TTL. Discovery is observable through `collectiveWork.gateDiscovery` in the API snapshot and can be disabled without removing the earlier gate-navigation/consensus system.

A live smoke check after server restart reported gate sightings and multiple discovery consensuses, confirming that the protocol is active. This is an instrumentation/behavior check, not yet a long-horizon survival claim.
