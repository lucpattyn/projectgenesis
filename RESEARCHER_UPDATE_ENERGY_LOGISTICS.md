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

## Internal test of apparent empty regions

The dark areas of the structural-work heatmap were tested quantitatively in two independent 500-tick seeded worlds (`160103`, `160104`). Cells with no cumulative facet work were compared with historically worked cells.

| Mean across both seeds | Zero-trail cells | Worked cells |
| --- | ---: | ---: |
| Mean distance to nearest gate | **14.49** | 9.76 |
| Within gate-sensing range | 55.0% | **74.3%** |
| Current food occupancy | **17.7%** | 12.8% |

The result replicated: low-work regions are farther from gates but retain more food. Thus they are not simply empty, depleted, or inaccessible territory. They appear to be ordinary-foraging space that is not profitable enough for sustained collective structural work. This is preliminary evidence for an emergent spatial niche distinction: gate-centered productive structural zones versus food-bearing but structurally underused regions.

This does not yet prove permanent niche boundaries. The next stronger test would relocate gates or observe the same regions over longer time windows and ask whether the work landscape reorganizes predictably.

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

## Next measurement layer: collective identity and morphology

The next planned phase adds no new ecological mechanism. It will track bonded collectives over time despite member replacement, bond turnover, migration, and topology change. The central question is whether a collective can outlive its founding organisms.

The tracker will also measure morphology rather than infer it visually: density, triangle/cycle richness, bridge bonds, branching, spatial extent, and transport/maintenance economics. This permits testable claims such as “dense meshes are more disruption-tolerant but more expensive,” rather than treating a shape as an intrinsic biological label.

The first audit-only census layer is now implemented. It samples every strong-facet bonded component every 20 ticks and has already distinguished, in a seeded 250-tick run, a dense 12-member mesh with 40 bonds and no bridge bonds from a four-member triangle-plus-appendage with one bridge bond and a compact three-member facet. This validates that morphology can be measured as topology before any collective identity or adaptive meaning is assigned to it.

The second layer now conservatively links unambiguous consecutive census samples into collective-lineage candidates. In the first 250-tick audit, one candidate persisted for 150 ticks while changing membership 28 times, recruiting 12 direct descendants, changing topology seven times, and migrating three times. Four founders were still alive at the final sample; this validates the tracker but does not yet establish a collective that outlived its founders. Split and merge ambiguity is recorded rather than silently resolved.
## Replicated collective-continuity baseline (2026-08-10)

We have added a conservative lineage instrument for strong-facet components. It
uses member and direct-offspring continuity, shared bonds/facets, and bounded
centroid motion; it does not force an identity through ambiguous split or merge
events.

Two 500-tick baseline worlds yielded 12 and 9 candidate collective lineages.
Their longest-lived candidates persisted for 240 and 260 ticks, respectively,
while gaining and losing members, changing topology, migrating three times, and
visiting multiple gates. The first reached 17 members, 45 bonds, and 47 strong
facets; the second reached 14, 38, and 44.

This is an important but limited result: Genesis now has measured examples of
collectives with continuity beyond a static cluster. It has **not** yet shown a
collective remaining recognizable after every founder has died. That is the next
threshold to test, not a claim we should make prematurely.
## Scalable 2,000-tick collective test (2026-08-10)

We separated long research runs from the canvas. A headless batch runner now keeps all ecological rules intact but omits visual-only markers and uses compact, coarse lineage observation. This made an isolated 2,000-tick run feasible without a live browser simulation competing for resources.

Two seeds completed. Seed 160103 ended with a thriving population of 264 and contained 29 candidate collective lineages; its longest lasted 400 ticks, travelled 41.31 cells, changed membership 14 times, and recruited three direct descendants. Seed 160104 produced an even longer 500-tick lineage which migrated, changed membership 12 times, recruited four direct descendants, and visited gates 4 and 6, but the world later declined to eight organisms with no bonds.

Neither world showed founder-independent persistence. This is not a negative result disguised as a positive one: we have now made the test repeatable at the relevant horizon and narrowed the scientific boundary. The system supports durable, changing collectives, but has not yet demonstrated a collective identity surviving full founder turnover.
