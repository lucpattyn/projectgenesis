# Project Genesis — Energy Logistics Research Update

**Date:** 2026-08-06  
**Scope:** component energy use, gate-to-gate migration, and structural persistence.

## Current scientific position

Project Genesis has moved beyond the question of whether bonded triangular facets can form. They do form, harvest gate-derived energy, create larger connected structures, and can move between gate opportunities. The present bottleneck is **energy logistics**: how a collective retains and allocates energy across a full life cycle rather than simply how much energy enters the world.

The relevant cycle is:

`harvest at gate → gate weakens/exhausts → conserve or depart → migrate → arrive at another gate → complete it`

## Established findings

### 1. Energy storage mattered, but did not solve persistence

Earlier storage-capacity experiments established that finite individual storage caused substantial overflow loss. Increasing storage reduced discarded energy and increased births and structural growth. However, once storage was no longer the immediate limitation, the ecosystem still eventually declined. The limiting process shifted from storage to energy allocation and transport.

### 2. More energy or less overflow is not sufficient

Several conservative experiments ruled out simple fixes:

- Structural overflow capture into existing bond reserves reduced some waste but harmed structure because most overflow came from loose, unbonded foragers.
- Overflow plumes created a physical recyclable resource, but strong facets were spatially separated from the loose organisms that produced it.
- Strict harvest restraint eliminated most overflow but starved the ecological process.
- Partial harvesting conserved food perfectly, but left large amounts of stranded energy because organisms did not reliably convert stored energy into reproduction or another useful action.

The causal conclusion is that energy must be converted into an effective collective life-cycle action, not merely retained.

### 3. Unbounded structural reproduction is a boom, not persistence

An experimental autonomous facet-budding rule let a strong triangle create a local triangular descendant using a normal parent energy split plus a bounded facet-reserve investment. It created the intended structural offspring, but early growth increased maintenance burden.

At 500 ticks, autonomous budding increased strong facets from 23.5 to 81.5. At 1,000 ticks in the reference world, it left 22 strong facets versus 104 in the control. A stricter budgeted version avoided the birth frenzy but still did not preserve the collective.

**Conclusion:** a previously positive energy cycle is not necessarily a spendable reproductive surplus. Any future structural reproduction must retain a protected post-birth operating reserve.

## Current mechanism: bounded component lifecycle

The current live experiment gives strong bonded components a limited local energy-use policy:

1. **Harvest** while their assigned gate is productive.
2. **Conserve** ordinary food after their own gate weakens, if the component is sufficiently energy-secure.
3. **Migrate** after a fixed 18-tick dwell limit: release the exhausted gate commitment and use existing local gate-direction sensing to seek another available gate.

This adds no energy, food, global target information, or teleportation. It uses only the component's own gate state and existing directional sensing.

## Phase-resolved energy accounting

The simulation now records component energy separately during harvest, conservation, migration, and arrival at the next gate. This produced the key diagnosis.

| Mean per completed episode, 500 ticks / two seeds | Lifecycle policy |
| --- | ---: |
| Migration income | 129.71 |
| Migration expenses | 197.78 |
| Migration net operational balance | -73.72 |
| Arrival net operational balance | -25.36 |

Components acquire meaningful energy while migrating, but movement and structural maintenance cost more than that intake restores. Conservation was rarely observed: components often became energy-insecure by the time their field was visibly depleted.

**Primary bottleneck:** travel is energetically expensive, not merely poorly informed.

## Experimental migration transport

The newest experimental rule reduces only the existing movement charge of an intact, strong bonded component during explicit migration toward a locally sensed gate. It does not create or transfer energy. In the canvas, active transport is represented by an **amber dashed outer ring**; the existing cyan dashed ring denotes ordinary collective stride.

| Mean at 500 ticks, two matched seeds | Lifecycle only | Lifecycle + transport |
| --- | ---: | ---: |
| Population | 107.5 | **120.0** |
| Bonds | 155.5 | **199.5** |
| Strong closed facets | 94.0 | **140.5** |
| Whole-episode energy delta | +12.86 | **+37.90** |
| Directed migration moves | 309.5 | 374.0 |
| Migration net balance | -73.72 | -87.97 |
| Arrival net balance | -25.36 | **-13.60** |

The aggregate migration deficit increases because healthier components travel more often. However, whole-cycle retained energy and arrival condition improve, while estimated migration cost per directed move falls from roughly 0.64 to 0.58.

**Interpretation:** transport is a promising physical logistics mechanism, but it has not yet made migration self-financing. It is enabled in the live visual world for observation but remains experimental; it should not be treated as a confirmed long-term persistence result.

## What the current canvas does and does not show

The current visual world appears more structurally diverse:

- multiple spatially separated bonded colonies;
- compact triangles, chained triangles, and larger meshes;
- structural-work trails distributed across several regions rather than one location.

This is evidence of **spatial and topological diversity**. It is not yet proof of genetic diversity, lineage specialization, or evolved computational sophistication. The golden/tan background is an accumulated structural-work heatmap: it indicates where facets have worked over time, not the current location of gate energy.

## Latest live-world observation

With bounded lifecycle and migration transport enabled for visual observation, the current seeded world produced multiple colonies that remained visibly bonded over an extended live run. Several colonies formed dense overlapping triangular meshes while others appeared as smaller chains or compact triangles in separate parts of the map. This is consistent with the short-horizon transport result: the system is now capable of retaining more distributed structure while components travel.

This observation is **qualitative only**. A canvas image cannot establish duration, lineage diversity, causality, or long-term stability. It should be treated as a useful visual hypothesis for the next replicated, instrumented long-run experiment—not as confirmation that the persistence problem is solved.

## Current limitations

1. Migration remains net-negative over a complete episode.
2. Long-run persistence with transport has not yet been replicated; a dense 1,000-tick transport run exceeded the local execution window and was not treated as evidence.
3. Conservation is rarely entered under the present depletion/security thresholds.
4. The project has not yet demonstrated lineage-level specialization or novel computation; the current work is building the ecological and energetic foundation required to test those questions rigorously.

## Next research action

Do not add new food, gates, primes, or rewards yet.

Instrument transport-active distance, number of moves, and exact movement cost per component episode. Then run completed longer replications with the same phase ledger.

The criterion for success is:

> Migration loss per unit distance declines, components arrive with usable reserve, and component persistence improves without shifting the deficit into harvest or arrival.

Only after that result should the project revisit protected-surplus structural reproduction or periodic intelligence probes.
