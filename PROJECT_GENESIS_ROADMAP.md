# Project Genesis Roadmap

## Current Position

Project Genesis is a server-owned artificial-life world. Prime factorization constructs world and organism capabilities; the browser is a visualization and experiment-control surface.

Current implemented layers include graph-based directional movement, energy, differentiated resources, reproduction, terrain, persistent state, spatial awareness, anonymous shared signals, structural coupling, emergent facets, facet metabolism, Prime-37 resource transformation, local fertility, and a soft ecological carrying capacity.

## Completed Directional Choice Phase

Prime-17 organisms now generate four Prime-2 action outputs: North, East, South, and West. Raw cardinal neighborhood inputs feed those outputs; the server chooses the strongest legal direction after the generated Move output has permitted movement. Equal scores preserve the current heading, so ties do not introduce a hidden random decision rule. Organisms without Prime 17 keep the random fallback because they cannot perceive directionally.

This deliberately does not encode food seeking or fire avoidance. It only creates the computational ability to select among actions based on sensed local information. The next experimental task is to compare its ecology against the random-movement fallback over fixed seeds.

## Completed Phase 11: Emergent Facets

Closed loops of three Prime-31 structural bonds are detected as triangular facets. Adjacent facets form a mesh. Every bond now owns a small structural-energy reserve: bonded meals replenish it, maintenance consumes it, and depleted active bonds starve and break. Strong closed facets redistribute a strength-scaled share of the remaining meal from the eater to weaker members. Mint transfer pulses and bounded telemetry make this visible and inspectable.

This preserves the central rule: triangles and polygons are consequences of bond topology, not predefined organism shapes.

## Proposed Layered Registries

The system should evolve from one broad registry into compositional registries by scale.

| Layer | Responsibility | Example prime role |
| --- | --- | --- |
| Physics | Space, motion, boundaries, energy transfer | 2: movement |
| Chemistry | Materials and state transformations | 37: resource transformation |
| Ecology | Population-scale cycles, hazards, nonstationarity | 11: environment/fire |
| Biology | Metabolism, reproduction, heredity, coupling | 3, 5, 7, 31 |
| Cognition | Perception, persistence, shared information, adaptation | 13, 17, 19, 23, 29 |

The same prime identity can be interpreted by more than one registry, but every interpretation must be explicit and inspectable.

## Completed Phase 12: Prime 37 Resource Transformation

Prime 37 changes the world rather than introducing a new behavior. Food decays into detritus; organism death also leaves detritus. Fire transforms food into ash. Detritus and ash convert gradually into nutrients, and nutrients are drawn down as they support local food regrowth. When food is far below the carrying capacity, nutrient ecology receives a bounded recovery budget so resource recycling can catch up with consumption.

The organisms do not need to understand chemistry. They inhabit a world whose materials change state. This creates nutrient cycles as an ecological consequence. The live UI renders detritus, ash, and nutrients as separate translucent layers and reports their totals.

### Facet Metabolism Extension

Closed Prime-31 triangles now have a limited ecological consequence: when a member consumes food, a small portion first replenishes its attached bond reserves and a strength-scaled portion of the remaining meal is distributed to weaker members of the same strong facet. The eater retains the majority. This remains a world-level structural rule, not a new organism behavior; bond brightness, mint pulses, and bounded telemetry make every transfer inspectable.

### Ecology Balance Extension

Reproduction is no longer unlimited. A server-side soft carrying capacity combines two pressures:

1. Food pressure compares available food with the current population's resource demand.
2. Density pressure compares population with usable walkable habitat and the food-supported capacity.

The generated reproduction output and individual energy threshold are still necessary, but births also pass through this ecological opportunity. Its maximum is 35% per eligible organism per tick and it falls toward zero as food becomes scarce or habitat becomes crowded. This is not a hard population cap: deaths, food recovery, and available space can change the opportunity dynamically.

### Shared Information Stabilization

Prime 19 now emits only when its generated Signal Out value crosses an activation threshold. Baseline metabolic energy no longer drives signal output; signal output is driven by spatial or already shared information. Signal intensity is capped, decays quickly, and the UI renders only meaningful concentrations. This prevents the shared field from saturating the entire world purple.

## Completed Phase 13: Ecological Differentiation

Phase 13 introduces selection pressure without adding a new organism prime. Food tiles now carry one of three resource identities: green, blue, or red. Green yield is weighted toward existing Prime-5 digestion strength; blue toward Prime-3 energy expression; and red toward Prime-19 signal expression. These are metabolic returns, not species roles. Prime-17 organisms receive the raw resource identity in their neighborhood input, so their existing generated directional graphs can distinguish nearby resources.

Every tile also has a server-owned fertility value. Harvesting reduces fertility locally, fertility recovers slowly when undisturbed, and low fertility reduces food-regrowth probability. Nutrients continue to support recovery through the Prime-37 material cycle. This creates resource depletion, recovery, and spatial niches without encoding migration or foraging rules.

## Completed Phase 14: Distributed State

Prime 13 is now an actual prior-tick persistent graph value. Prime 31 makes that value available across one direct bond hop. Each recipient receives an anonymous mean through a generated `Neighbor state` sensor; its inspector also lists the contributing neighbors for research visibility. Sampling happens before the tick executes, so there is no same-tick propagation or execution-order dependence. A value can reach a more distant member only if intermediate bonded organisms preserve and relay it across later ticks.

No message, label, protocol, or behavior was added. This gives a bonded structure a larger distributed state capacity than an individual while keeping topology and persistence meaningful. The live monitor reports state bearers and active one-hop state inputs.

### Structural Homeostasis Extension

The world now makes its energy input explicit. Fertility-driven resource regrowth is recorded as primary productivity: resource units created this tick, total units since reset, and their baseline potential energy. This is the only new energy source; bonds cannot create energy.

Bond reserves can now return a small, lossy emergency transfer to a directly attached member below a low-energy threshold. The reserve retains a floor for structural maintenance, every transfer reduces it, and 15% is lost in transit. This lets bonds smooth temporary scarcity through time without becoming a perpetual-energy mechanism. Live bond telemetry records the count and total energy delivered by these support transfers.

### Structural Inheritance Extension

Prime-31 topology can now reproduce locally. A currently bonded Prime-31 parent that reproduces places its child in an adjacent open tile when possible. If the child retains Prime 31, the parent pays a small energy investment into a weak parent-child bond seed. The pair must remain adjacent for several ticks before it matures, and then maintains itself under the usual reserve and distance rules. A child that loses Prime 31 remains unbonded. This creates a costly inheritance path for structure without protecting it from arithmetic mutation or ecological selection.

## Completed Phase 15: Collective Navigation

This is the first constrained form of distributed processing. Prime-17 organisms already generate North, East, South, and West numeric scores from their local metabolic opportunity. Prime-31 bond groups now average those scores and translate together in the strongest legal direction, preserving their previous heading on ties. Only numeric scores are pooled: no member transmits an action, command, target, or named food instruction.

Resource colors no longer have an accidental numeric rank. A nearby resource contributes a direction value according to the observing organism's existing Prime-3, Prime-5, and Prime-19 metabolic expression. This gives a facet a wider distributed sensory footprint while retaining genome-dependent niche value. The live inspector and telemetry expose collective scores and resource-scored moves.

### Structural Lineage Accounting Extension

A strong closed facet receives a bounded ecological payoff only when one of its members actually consumes a resource. Up to 16% additional conversion return, scaled by facet strength, is retained as capital owned by that exact three-member topology. It is neither individual energy nor bond reserve. At the birth threshold, this capital can seed two inherited bonds for a locally born Prime-31 child adjacent to two facet members; a child that loses Prime 31 cannot inherit it. This is not world primary productivity and cannot occur without a real harvest. Telemetry records capital earned, held, spent, and facet births.

## Phase 15.5: Delayed Structural Refinery Experiment

The replicated 1,000-tick cost/return screen showed that lower coupling maintenance and a larger existing facet-capital return did not reliably retain Prime 31. Those changes tune costs or rewards but do not make topology ecologically necessary.

Prime 37 now supplies a targeted next experiment. Red food is low-energy catalytic material, while detritus and ash are recoverable chemical material. A strong three-member Prime-31 facet retains harvested red catalyst and must remain within its normal local structural range of a material-rich patch for twelve consecutive ticks. The completed process spends one catalyst, consumes the detritus/ash, restores local fertility, deposits bounded nutrients, and releases one ordinary local food unit if the patch is empty. It also earns one bounded facet-owned nursery credit.

This is deliberately a world transformation, not a new organism behavior or hidden energy transfer: no body receives direct energy; material must already exist; losing a bond or leaving the patch resets progress; a non-structural mutant may consume the resulting food but cannot initiate another conversion; and a nursery credit can only bypass normal ecological birth opportunity for a locally seeded Prime-31 child.

### Validation protocol

Run matched-seed, replicated comparisons with the same bounded experiment settings used for the Phase 14.5 screen. Compare the unmodified baseline against the refinery-enabled world at 1,000 ticks. Report final Prime-31 frequency, active bonds, facets, refinery conversions, released food, lineage longevity, and extinction counts. Do not change coupling maintenance or facet harvest return during this first refinery comparison.

## Later: Multi-layer Environment

Replace a mostly exclusive tile type with an inspectable tile dictionary:

```text
terrain
food
heat
signal
moisture
nutrients
```

Each layer evolves independently. Existing food, fire, terrain, and signal systems become named layers rather than competing tile types.

## Later: Delayed Consequences

Introduce processes that unfold across ticks. Eating may initiate digestion before energy becomes available. This makes Prime 13 persistence materially valuable and creates conditions for later prediction.

## Later: Cycles Rather Than Weather

Introduce slow deterministic cycles that vary food growth, fire risk, and signal decay. The world becomes nonstationary without adding a named weather behavior.

## Later Cognition

Prime 23 remains internal graph plasticity and should follow experiments showing whether shared information and facets create measurable value. Prime 29 remains temporal prediction, to be introduced only after delayed consequences and cycles make anticipation meaningful.

## Experimental Discipline

Use fixed seeds and compare conditions one variable at a time. Track population, births, deaths, food, fire exposure, signals, bond formation/breakage, facet count, and compound lifetime. Telemetry should remain bounded in memory unless selected experiments are explicitly persisted.
