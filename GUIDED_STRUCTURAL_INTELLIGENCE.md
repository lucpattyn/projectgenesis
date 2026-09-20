# Guided Structural Intelligence

This document is the authoritative design boundary for the new Genesis
direction. It describes the first integrated package without claiming that
the prototype already understands images or has a language.

## Design layers

| Layer | Genesis implementation | Status |
| --- | --- | --- |
| Designed substrate/support | Existing organisms, bonds, Prime-generated graphs, optional supported-development budget, gradual quiet-bond repair window | Package A, opt-in |
| Heritable properties | Prime-factor genome, generated controller graph, seeded bounded mutation, lineage and parent IDs | Existing and retained |
| Lifetime changes | Persistent Prime-13 state, bond strength/reserve, topology traces, environmental memory; Package A image input is not inherited | Existing diagnostics; Package B will test adaptation |
| Environmental inputs | Local world tiles plus optional 16×16 grayscale field sampled at the organism's world location and bounded neighborhood | Package A |
| Measured behavior | Topology, bonds/facets, activity, energy/stress, local image signal, lineage and mutations | Package A instrumentation |

## Package A implementation

The guided layer is explicitly switchable through the UI or API:

- `guidedStructuralIntelligence.enabled` defaults to `false`.
- The input is a 16×16 bounded grayscale grid.
- Built-in inputs are horizontal boundary, vertical boundary, closed outline,
  and blank; uploaded images are downsampled in the browser to 16×16.
- An organism samples only its mapped pixel and the configured local radius.
  The full grid is never passed to an organism's controller.
- Sampling is routed through the existing local Prime-17 neighborhood pathway;
  no new prime is assigned to an interpretation such as “circle” or “danger.”
- The browser shows the input preview, source, revision, enable state, and
  local signal values in the organism inspector/snapshot.

## Supported-development mode

This is deliberate external assistance, not an evolved capability. It is off
by default and visibly labeled when enabled. It has a finite per-tick budget,
prioritizes low-energy bonded members, then tops up existing bond reserves.
Existing adjacent bonds may pass through a bounded quiet repair window before
normal decay. The support cannot create edges, create food, erase movement
cost, or make a bond immortal. Every spent unit and quiet-bond tick is exposed
in `guidedStructuralIntelligence.supportedDevelopment`.

## Exact commands

```powershell
npm test
node server/index.js
```

With the server running, open `http://localhost:3000/`, enable **Guided input**,
choose a built-in pattern or upload an image, and optionally enable
**Supported development mode**. The API equivalents are:

```powershell
Invoke-RestMethod -Method Post http://localhost:3000/api/guided-input `
  -ContentType 'application/json' `
  -Body '{"pattern":"closed-outline","enabled":true}'

Invoke-RestMethod http://localhost:3000/api/state
```

## Verification

`npm test` passes both the existing spatial-bond regression and the new guided
input checks. A server smoke test confirmed the default state is disabled,
16×16, horizontal-boundary; switching to `closed-outline` and enabling it
updates the live snapshot without resetting the world. The existing ecology
defaults and historical benchmark controls remain unchanged when the layer is
off.

## What is not claimed yet

Package A only establishes persistence, local sensing, visualization, and
inspectable support. It does not yet establish image classification,
input-dependent morphology, memory after image removal, stress conventions,
collective reproduction, or useful communication between collectives. Those
belong to Packages B and C and must be tested with unseen examples and causal
controls.

## Package B first screen

Package B is now implemented as a bounded adaptive response trace. While the
guided input is active, each organism moves its local trace toward its sampled
pixel value. The trace then modestly biases the organism's existing bind and
signal effectors. When the input is removed, the trace decays exponentially;
there is no category-specific target, shape whitelist, or global label.

Run it with:

```powershell
node scripts/run-guided-structural-evaluation.mjs
```

The first three-seed screen (`160103–160105`, 60 ticks per phase, 40 ticks
without input) found:

- unseen closed-outline response trace: `0.1339` mean with adaptive input,
  versus `0` in the blank control;
- after 40 input-free ticks, the guided trace fell to `0.0102`, showing the
  intended forgetting behavior but not yet durable memory;
- mean unseen bonds were `64` in the guided arm versus `76.33` in the blank
  control;
- strong facets were `0` in both arms in this short screen.

Interpretation: Package B has a real causal local response and measurable
input-removal decay, but it has not yet demonstrated input-dependent useful
topology or retained interpretation. The next repair is measurement and
adaptation—not stronger gains: add unseen position/brightness/noise variants,
raw-pixel and shuffled controls, and compare response topology before and
after removal over a longer fixed suite.
