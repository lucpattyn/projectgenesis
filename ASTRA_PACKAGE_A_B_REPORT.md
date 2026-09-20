# Project Genesis — Astra Report: Packages A and B

Date: 2026-09-20  
Branch: `codex/delayed-cue-computation`  
Current code: `8714b7f`

## Executive result

Packages A and B are implemented as an inspectable, switchable prototype.
Package A gives a collective a bounded local image input and explicitly labeled
development support. Package B adds a generic local adaptive trace that biases
existing bond/signal activity and decays when the input disappears.

The system now visibly responds to an image, but it has **not** yet shown image
understanding, useful input-dependent morphology, durable memory, or long-run
survival. The present evidence is a causal local response plus forgetting.

## Package A — persistent supported collective and local image input

### Implemented

- 16×16 normalized grayscale input grid.
- Built-in horizontal boundary, vertical boundary, closed outline, and blank
  patterns.
- Browser image upload and deterministic 16×16 downsampling.
- Organisms sample only their mapped pixel and bounded local neighborhood.
- Full image is not passed to any organism or controller.
- Existing Prime-17 local sensing pathway is reused; no new prime was added.
- UI preview, source, revision, enable state, and local signal diagnostics.
- Supported-development mode is explicit and off by default.
- Support has a finite budget of 2 units/tick, prioritizes low-energy bonded
  members, then tops up existing bond reserves.
- Existing adjacent bonds receive a bounded quiet repair window of 12 ticks;
  support cannot create edges, food, or immortal bonds.

### Live observation

With the uploaded `Coming together.png` input, a clean early reset produced:

- tick 15;
- population 24;
- 3 bonds;
- 24 active response traces;
- mean response trace 0.341;
- supported-development mode enabled.

This is the intended Package A inspection point: the image preview is visible,
organisms are alive, and support accounting is visible. It is not a claim of
long-horizon persistence.

## Package B — adaptive structural response and removal test

### Implemented mechanism

Each organism maintains a bounded `guidedResponseTrace`. While image input is
active, the trace moves toward the local grayscale signal. The trace modestly
adds to existing bind and signal effectors. When input is disabled, the trace
decays at the configured rate. Cyan rings show active trace strength; the
selected-organism inspector reports local input and trace values.

This is intentionally generic. It does not encode “outline,” “danger,” or any
other completed interpretation, and it does not prescribe a final shape.

### Headless evidence

Command:

```powershell
node scripts/run-guided-structural-evaluation.mjs
```

Protocol: seeds `160103–160105`; 60 ticks each for blank, horizontal,
vertical, unseen closed-outline, and shuffled phases; 40 input-free ticks;
blank control with the same seeds.

| Measure | Guided input | Blank control |
| --- | ---: | ---: |
| Unseen closed-outline mean trace | `0.1339` | `0` |
| Mean trace after 40 input-free ticks | `0.0102` | `0` |
| Unseen checkpoint mean bonds | `64` | `76.33` |
| Unseen checkpoint strong facets | `0` | `0` |

Interpretation: the response is causally driven by local input and then
forgets. It is not yet a useful morphology or retained semantic memory. The
lower guided bond count is a warning against increasing response gain without
first reconciling the survival ledger.

### Live uploaded-image run

The browser run used the custom uploaded image. At a later live checkpoint the
server recorded 36 bonds formed and 36 broken, with population and bonds at
zero by tick 622. The current server snapshot is still extinct (tick 804,
custom input retained, support spent `870.53`). This confirms that the canvas
was not hiding structures: the prototype formed and then lost them.

## What has been demonstrated

1. A bounded image can enter the world without exposing a global label.
2. Organisms receive local image information through an existing generic sensor
   pathway.
3. A generic local trace can respond to that input and decay after removal.
4. The mechanism is visible and inspectable in the live UI.
5. External support is accounted for separately from evolved behavior.

## What has not been demonstrated

- A collective response that predicts unseen image variations.
- A response that remains useful after input removal.
- A morphology whose topology is reliably selected by the image.
- Long-run survival under finite ecology.
- Stress expression or a second collective using that expression.
- Reproduction that inherits useful image organization.

## Recommended next sequence

1. Keep Package A/B switches and baseline defaults unchanged.
2. Add a fixed Package B evaluation suite: translated, brightness-scaled,
   thickness-varied, noisy, shuffled, and image-removal examples.
3. Add a simple raw-pixel decoder as a measurement baseline; do not treat its
   success as organism understanding.
4. Compare topology/activity descriptors with trace gain zero, guided input,
   and blank controls under the same seeds.
5. Decompose the live extinction ledger before increasing support. Report
   movement, maintenance, bond reserve, support, overflow, and death causes.
6. Only after a useful retained response and a reconciled survival budget,
   begin Package C: localized stress, visible expression, and a receiver
   collective with visible/hidden/shuffled communication controls.

## Exact commands

```powershell
npm test
node scripts/run-guided-structural-evaluation.mjs
npm start
```

The live UI is at `http://localhost:3000/`. Package A/B behavior is toggled in
the Guided substrate panel. The authoritative design boundary remains in
`GUIDED_STRUCTURAL_INTELLIGENCE.md`.
