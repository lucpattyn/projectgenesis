# Phase 16 — Energy Logistics

## Purpose

Phase 16 is a diagnostic phase. It changes no prime, resource, gate, movement rule, reproduction rule, or ecological reward. Its purpose is to identify the process that follows the demonstrated finite-storage bottleneck.

The central question is:

> When a structural boom becomes a collapse, which energy-flow or distribution curve changes first?

## Per-tick server ledger

Each simulation tick records one bounded server-side time-series entry. It includes:

- population, births, deaths, energy-exhaustion deaths, and maximum-age deaths;
- total ecosystem energy, organism-held energy, bond-reserve energy, and facet-reserve energy;
- ordinary-food and gate-work harvest income;
- discarded storage overflow;
- movement, signal, gate-work, and bond-maintenance expenditure;
- reproductive investment and structural births;
- bond count, facet count, and cumulative gate completions;
- minimum, maximum, mean, median, standard deviation, and Gini coefficient of living-organism energy;
- mean lineage longevity, average structural maintenance cost, average facet reserve, and reserve turnover.

`energySpentOnGateWork` is deliberately present even when it is zero. Present gate consensus has no separate direct debit; its relevant individual cost is already measured as movement, perception, persistence, and coupling. The ledger must reveal that fact rather than inventing a cost category.

Reproduction and structural seeding remain **allocations**, not destroyed energy. Bond reserve decay and storage overflow are true losses recorded separately from organism action costs.

## Data retention

The live simulation retains the most recent 5,000 per-tick entries. Experiment records retain their full per-tick logistics series alongside their existing periodic biological samples, subject to the repository's existing 100 MB aggregate-history cap.

## Interpretation protocol

Before tuning anything, compare matched runs for the first sustained decline in:

1. gate-work harvest and gate completions;
2. facet and bond retention;
3. reproductive investment and births;
4. mean/median energy, dispersion, and Gini inequality;
5. stored and reserve energy; and
6. death causes and lineage longevity.

The result is diagnostic only. A curve that changes first is a candidate bottleneck, not proof by itself. A causal intervention must then alter that one process while holding the rest of the ecology fixed.

## Completion criterion

Phase 16 is complete only when replicated time series explain why the boom-to-collapse transition occurs and nominate one dominant causal bottleneck for a separately preregistered intervention.

## Gate-directed structural navigation screen (2026-08-06)

The generic facet trail showed structural work away from gates. This bounded intervention does not reward arbitrary structure: only a closed facet with minimum bond strength `0.7` receives a shared, non-forcing directional bias toward an inactive gate within 14 cells. Loose organisms receive no cue. A completed gate now exposes three neighbouring, stationary work ports and releases a configurable initial physical-food contract; an already-active field cannot be repeatedly re-completed.

Matched 300-tick screens over seeds `160103`–`160105` separated navigation from the start-up contract.

| Condition | Population | Bonds | Functional facets | Gate arrivals | Gate completions | Food released | Worker harvests |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Control | 28.7 | 14.3 | 3.3 | 0.0 | 0.3 | 0.7 | 0.3 |
| Navigation only | 28.7 | 34.7 | 37.3 | 21.3 | 10.3 | 59.0 | 4.7 |
| Navigation + 3-unit contract | **32.0** | **48.0** | **50.3** | 18.7 | 10.3 | **76.0** | **10.3** |

This is a causal result: strong facets can reach and solve gates when they receive a shared directional cue, and the modest start-up contract increases physical output and structural retention. It is **not** yet evidence of a self-funding structural economy. In the contract arm only `10.3 / 72.7` field harvests (about 14%) were made by the responsible facet; most energy was captured by local competitors. The next diagnosis is ownership/access to a productive field, not more navigation or more food.

### Gate commitment refinement (2026-08-06)

Close gate work radii can overlap, so nearest-gate navigation alone allowed one facet to ambiguously occupy two tasks. The live navigation rule now gives an arriving strong facet a temporary gate commitment. It keeps that target while it coordinates or maintains the corresponding field; the commitment is released if the facet dissolves, fails the response interval, or the field ends. Unassigned facets exclude committed gates when selecting an inactive target. This is task allocation, not territorial ownership: it creates no energy, excludes no organism from physical food, and does not reserve a gate permanently.

### Finite gate-energy screen (2026-08-06)

The live world now contains seven distributed gates, each with an 18-unit physical-food stock. Stock falls only when food is actually created. An empty gate becomes visibly exhausted, releases its facet commitment, remains unavailable for 140 ticks, then restores its stock. This produces a bounded harvest-and-migrate opportunity without adding a new resource or prime.

In a matched 3-seed, 300-tick screen with finite stocks, navigation-only (one immediate food unit) produced mean population `37.0`, bonds `50.7`, functional facets `46.0`, gate arrivals `54.3`, completions `12.3`, and worker harvests `25.7`; the no-navigation control produced `28.7`, `34.0`, `19.0`, `0.0`, `2.7`, and `0.7`, respectively. A three-unit start-up burst was worse for structures under finite stocks (mean facets `15.0`): it front-loaded an easily contested resource and depleted short-lived opportunities too rapidly. The live default is therefore the conservative **one-unit** start-up release.

### Structural-organization check (2026-08-06)

The canvas can make a dense bonded component look like one shape even when it contains many closed triangles. A matched 250-tick, three-seed screen therefore distinguished strong triangle cliques from **distinct structural groups** (separate bonded components containing at least one strong triangle). The earlier 4-gate regime averaged `6.3` strong facets in `1.7` distinct groups; seven finite gates without navigation averaged `6.0` in `2.3` groups; the current navigation regime averaged **`29.3` strong facets** in **`2.7` distinct groups**. This does not support a formation regression. Navigation is concentrating many triangles into larger gate-oriented compounds (mean `7.8` members per structural group), which are visually less like separate simple triangles. Isolated three-member triangles were rare in every condition. The remaining question is whether larger compounds persist and divide into independent productive groups over longer horizons; the current screen does not establish that.

### Gate-field capture diagnosis (2026-08-06)

Added release-to-harvest server accounting for every gate-food unit: responsible facet and member positions at release, port, release tick, gate stock, harvester identity, responsible-member status, delay, and competitor distance. The live snapshot now exposes the bounded diagnostic aggregate and recent harvest records; `scripts/run-gate-field-capture-diagnosis.mjs` runs the matched screen.

Across the current finite-gate defaults over three seeds and 300 ticks, gates released `228` units and `217` were harvested; only `11` remained unharvested. **107 / 217 (49.3%)** were harvested by a member of the responsible facet at release, while `110` were harvested by competitors. Mean delay from release to harvest was `3.75` ticks; competitors were a mean `1.46` cells from a responsible member.

Diagnosis: the corrected neighbouring, stationary ports are physically reachable. The leading limitation is now a close-range public-goods contest, not worker inability to reach output or lack of demand. The next experiment must test whether roughly half of a gate's finite yield is enough to cover the responsible facet's energy and maintenance over a complete harvest-and-migrate cycle. Do not make gate food private before measuring that energy balance.

### Active gate-field energy-balance replication (2026-08-06)

Added a bounded field-cycle ledger. It follows the three members responsible for a successful gate from field creation to exhaustion, dissolution, or natural field decay. It records their gate-food income, ordinary-food income, movement/metabolic/coupling/signal costs, internal bond-reserve maintenance, member energy change, and change in their internal bond and facet reserves. `scripts/run-gate-cycle-balance.mjs` runs the matched 1,000-tick replication.

Across `124` completed cycles in three 1,000-tick current-default worlds, the mean active-field duration was `10.65` ticks. Gross gate income averaged `49.27` while directly logged action and internal-reserve costs averaged `42.97`; that superficially suggests a `+6.30` balance. It is not the biological answer. The responsible members' actual combined energy changed by `-7.56`, and the whole bounded structure—members plus internal bond and facet reserves—changed by **`-6.31` energy per completed field cycle**. Only `48.4%` of cycles had a positive direct ledger balance.

Conclusion: **the current finite gate is not yet a self-funding structural opportunity.** The field phase alone is energetically negative on average, before charging the journey from an exhausted gate to the next one. The discrepancy between gross income and actual stored energy is itself diagnostic: food-derived energy is being diverted, redistributed, capped, or lost while the structure operates. The next intervention must be based on a decomposition of this gap, not on an assumption that more gate food or private food is the answer.

### Field-cycle balance decomposition (2026-08-06)

The cycle ledger now separates capacity overflow, bond-reserve deposits, facet sharing, and whether a transfer leaves the three-member responsible facet. Repeating the same 124-cycle, three-seed, 1,000-tick replication decomposed the `12.61` energy gap between the superficially positive direct ledger (`+6.30`) and the actual total structural-energy change (`-6.31`).

| Channel per field cycle | Energy | Interpretation |
| --- | ---: | --- |
| Outward facet sharing | **5.37** | Gate-derived energy shared to members outside the responsible triad through overlapping facets. |
| Outward bond-reserve deposits | **3.88** | Energy deposited into a bond from a worker to a partner outside the responsible triad. |
| Capacity overflow | 1.28 | Real loss at individual energy capacity. |
| Total explicitly located | **10.54** | About 84% of the 12.61-energy gap. |

Total sharing (`12.02`) and total bond deposits (`6.77`) are larger, but their internal portions remain within the bounded working structure and are not themselves explanations for its total-energy loss. Facet capital generation averaged `+5.88`; it is not the deficit.

**Causal conclusion:** the leading bottleneck is structural public-goods leakage across overlapping bond topology. A gate-working facet does not retain enough of the value it produces because its existing sharing and bond-feeding rules treat the larger compound as the relevant beneficiary. This is not evidence that gate food should be made magically private. The next bounded intervention should test a field-specific accounting boundary: while a gate field is active, gate-derived energy may preferentially refill the responsible facet's own members and its three internal bonds before ordinary outward sharing or outward bond feeding occurs. It must remain physically visible, capacity-limited, and switchable against the present open-sharing control.

### Responsible-field boundary test (2026-08-06)

Implemented the bounded rule exactly as specified: physical gate food remained open to every organism, but when a current responsible member harvested during an active field, its internal facet bonds and members were prioritized before outward bond feeding or outward facet sharing. The rule is configurable and **remains disabled in the live default**.

Matched three-seed, 1,000-tick runs gave a negative causal result:

| Condition | Structural-energy change / cycle | Member-energy change / cycle | Gate income / cycle | Outward facet sharing / cycle | Population |
| --- | ---: | ---: | ---: | ---: | ---: |
| Open-sharing control | **-6.31** | **-7.56** | **49.27** | 5.37 | 15.67 |
| Responsible-field boundary | -13.62 | -15.40 | 39.43 | **0.96** | **17.00** |

The intervention successfully stopped most outward sharing, but it reduced gate income and made the responsible structure less energetically viable. Therefore outward sharing is not merely leakage: it is part of the compound's current stabilizing dynamics. Do **not** enable this boundary by default and do not replace it with private food. The next hypothesis is that the relevant unit is not the triangle alone but a larger bonded component; future accounting must compare energy retention and survival at component scale before any further routing rule is proposed.

### Component-scale energy accounting (2026-08-06)

Added a parallel ledger for the connected bonded component anchored on a gate-working facet. At field start and end it measures all living member energy, all bonds internal to that component, and all fully contained facet reserves. It permits membership to change, so it measures the current connected collective rather than freezing the initial triad.

The same three-seed, 1,000-tick open-sharing replication produced `124` completed fields:

| Unit of analysis | Mean energy change / field | Positive fields | Mean members at start → end |
| --- | ---: | ---: | ---: |
| Initiating triad | -6.31 | 42.7% | 3 → 3 |
| Anchored bonded component | **+17.82** | 50.0% | 8.57 → 9.04 |

This resolves the apparent contradiction. Gate work is energetically negative for an isolated triangle but positive on average for the larger component that shares its energy. The open-sharing boundary failed because it cut off this component-scale collective benefit. The component—not the individual facet—is presently the more plausible economic organism.

This is not yet persistence proof: only half of component cycles were positive, and the result excludes the longer between-field/migration interval. The next experiment should follow components across complete exhaustion-to-next-gate episodes, reporting component survival, time to next completion, energy change over the whole episode, and whether one component can retain a distinct role while supporting its member facets.

### Whole component episode test (2026-08-06)

Implemented the requested episode ledger: field opening → field end (exhaustion, decay, or facet loss) → next gate completion by the same surviving anchored component, or extinction of its original members. It changes no ecology. `scripts/run-component-episode-survival.mjs` runs the matched three-seed, 1,000-tick protocol.

| Episode outcome | Result |
| --- | ---: |
| Completed episodes | 118 |
| Reached a next gate completion | 117 (99.2%) |
| Original-member extinction before next completion | 1 |
| Mean migration interval | 29.08 ticks |
| Mean component energy change across full episode | **-27.67** |
| Positive whole episodes | 42.7% |
| Mean component membership, start → next completion | 8.79 → 8.93 |

**Conclusion:** the bonded component is an effective navigator but not yet a self-sustaining collective organism. It almost always finds and solves another gate, retains its approximate size, and gains energy during many active fields; however, the dry migration interval more than consumes that gain on average. The next bottleneck is therefore not gate discovery, gate coordination, or immediate public-goods capture. It is the **energetic cost of between-gate logistics**. Any next intervention must be tested against this whole-episode metric, not merely field-level or navigation-level success.

### Metabolic-remnant (death-residue) dose screen (2026-08-06)

Implemented a conservative, off-by-default death-residue layer. A capped fraction of an organism's remaining stored energy becomes a visible, decaying cyan local remnant; a strong closed facet can recover it locally at 70% efficiency. It is not free food, does not require a new prime, and is charged against energy that would otherwise be recorded as lost at death. `scripts/run-death-residue-screen.mjs` compares the doses.

| Condition | Component episode energy | Positive episodes | Population | Residue recovered |
| --- | ---: | ---: | ---: | ---: |
| Control | -27.67 | 42.7% | **15.67** | 0.00 |
| 4% residual fraction | -33.33 | 42.0% | 14.67 | 11.40 |
| 8% residual fraction | **-12.10** | **43.8%** | 12.33 | 18.55 |

The moderate 8% dose is a real directional improvement: it reduces whole-episode loss by more than half without making death profitable. However, it does not cross into self-sustaining positive episodes and population declines. The low dose is ineffective. Therefore residue must remain experimental and disabled in the live default. The current evidence supports metabolic remnants as a potentially useful migration bridge, not a sufficient ecological solution. Any next dose or design change must jointly report component episode balance **and** population, so a dying-population subsidy is never mistaken for a thriving ecosystem.

### Between-gate migration decomposition (2026-08-06)

Extended the component-episode ledger to account only after the first field ends and before the same component reaches its next gate. It records energy income by source, movement and component upkeep, internal bond-reserve maintenance, idle movement, support/relay transfers, and capacity overflow. `scripts/run-component-migration-decomposition.mjs` compares the unchanged control against the experimental 8% residue fraction over the same three seeds and 1,000 ticks.

| Mean per completed migration episode | Control | 8% death residue |
| --- | ---: | ---: |
| Whole episode component-energy change | -27.67 | **-12.10** |
| Completed migration episodes | 117 | 128 |
| Migration interval | 29.08 ticks | 31.45 ticks |
| Food + gate-work income during migration | 179.54 | 197.45 |
| Residue income during migration | 0.00 | **0.60** |
| Movement cost | **194.14** | **197.56** |
| Ordinary maintenance + perception | 38.79 | 39.49 |
| Coupling + bond-reserve maintenance | 32.92 | 33.51 |
| Capacity overflow | 17.26 | **32.31** |
| Operational migration balance | -103.79 | -105.05 |

The largest measured expense is unambiguously **movement**. Component upkeep is material but much smaller; idle movement is negligible, so the diagnosis is not indecision or failed local pathing. Critical support and relay are active but modest (control direct support `12.64`, relay reserve `1.56` per episode), consistent with a system that is moving functional components rather than merely rescuing stranded members.

The residue result requires a careful interpretation. Although whole-episode energy improves strongly, only `0.60` energy per completed episode is recovered during the measured dry migration interval, and the operational migration balance is slightly worse. The 8% arm also overflows more energy and ends with lower population. Therefore the current remnants do **not** yet directly pay the migration bill. Their apparent benefit is indirect—changing who survives, when components form, or what energy reaches the active field—not a demonstrated travel subsidy.

**Decision:** keep death residue experimental and disabled. The next intervention should target the dominant physical cost, collective movement, while preserving contestability and avoiding a free energy source. The correct test is a bounded, visible transport or reserve-carrying mechanism whose improvement must appear specifically in the migration ledger, not merely in final population or whole-cycle averages.

### Coordinated collective-stride replication (2026-08-06)

Implemented a physical, bounded collective-transport rule. A connected component of at least three organisms that contains a strong facet and has an available gate within its existing sensing range pays `65%` of normal movement cost while it collectively pursues that gate. The rule does not create, store, or transfer energy; it represents reduced redundant locomotion by an intact, maintained structure. It has no effect on loose organisms, non-navigating components, fields, food production, or bond maintenance. A cyan dashed ring marks members on an actual gate-directed collective stride in the canvas.

Two independent matched three-seed, 1,000-tick replications compared the unchanged control to stride only.

| Metric | Seeds 160103–160105 control → stride | Seeds 160106–160108 control → stride |
| --- | ---: | ---: |
| Whole component episode energy | -27.67 → **+16.01** | -21.30 → **+9.68** |
| Final population | 15.67 → **23.33** | 10.33 → **23.67** |
| Positive whole episodes | 42.7% → 49.6% | 46.1% → 49.5% |
| Movement cost per migration tick | 6.68 → **5.68** | 6.11 → **5.05** |

The raw movement total per completed episode is not always lower because stride components survive longer, take longer migration intervals, and remain large enough to complete more episodes. The normalized cost confirms the intended causal channel: `15–17%` less movement expenditure per migration tick. The episode-level operational migration ledger remains negative (`-103.79 → -86.20` in the first set; `-144.19 → -131.81` in the replication), so stride does not make travel free or solve the next bottleneck. It does, however, consistently restore whole-cycle component profitability and improves population without a new energy source.

**Decision:** collective stride is now enabled in the live default. It remains a switchable configuration and must continue to be evaluated against movement-normalized cost, component episode balance, and population. The next diagnosis is why improved collective logistics permits positive whole cycles while the narrowly measured migration ledger is still negative—likely field productivity, component composition, or energy retention changes caused by longer-lived structures.

### Long-horizon persistence trace (2026-08-06)

A live canvas can correctly show no facets after it has been left running: the new 2,000-tick trace confirms that the present world still undergoes a late boom-to-bust transition. Three default-stride seeds bloom strongly and then lose all strong facets between ticks `1,200` and `1,800`:

- seed `160103`: 104 strong facets at tick 1,000 → 0 at tick 1,200;
- seed `160104`: 22 at tick 200 → 0 at tick 1,400;
- seed `160105`: 34 at tick 200 → 0 at tick 1,800.

The precursor is continuous capacity-overflow loss on a very large scale, followed by accumulated starvation and bond dissolution. By tick 2,000, overflow was `71,174`–`82,072` energy across the three stride worlds and each retained only 3–4 loose organisms.

The matched no-stride trace shows the same qualitative collapse: two of three worlds also reached zero strong facets by tick 2,000, with `76,868`–`94,535` cumulative overflow. Thus **collective stride did not create the disappearance of facets**. It improves medium-horizon whole-cycle results, but it does not repair the older long-horizon storage/overflow bottleneck. It may change the timing and size of the bloom, so future conclusions about stride must remain based on matched long runs.

**Next diagnosis:** determine why high stored energy is repeatedly discarded rather than retained by a productive component, and whether that loss occurs in a small number of high-energy organisms, during gate bursts, or at reproduction/structural allocation boundaries. This is now more urgent than another navigation or gate change.

### Overflow provenance result (2026-08-06)

Implemented observation-only server accounting for every unit of actual discarded overflow after any configured capture. It records action phase, resource origin/type, organism and lineage, current bonded component, concentration, and energy discarded by organisms before death. `scripts/run-overflow-provenance.mjs` ran the three current-default 1,000-tick worlds.

| Finding | Result |
| --- | ---: |
| Total discarded overflow | 155,135.08 energy |
| Harvest phase | **100.0%** |
| Ordinary food origin | **99.8%** (154,822.23) |
| Gate-field origin | 0.2% (312.85) |
| Green / blue / red contribution | 53.5% / 40.1% / 6.4% |
| Overflow held by top 10% organisms | 27.3–29.1% per seed |
| Overflow held by top 10% recorded components | 41.9–45.5% per seed |
| Deaths with prior overflow | 96 / 150; mean 1,054.29 energy |

This rejects the gate-burst hypothesis. The overflow is a chronic **individual harvest-capacity** problem: ordinary foragers repeatedly eat while already near their cap, discard the surplus immediately, and many later die (often from maximum age) after having discarded large quantities. The accounting does not establish that every such death is caused by overflow, but it establishes that the energy is lost before it can support descendants or structures.

The next intervention must therefore act at the harvest boundary, not by adding more food or gate yield. A scientifically clean candidate is a bounded overflow-routing experiment: when an intact bonded component harvests above an individual’s capacity, a limited, lossy portion may be retained in existing local bond/facet reserve capacity before any remaining surplus is discarded. It must be compared against the current disabled overflow-capture control and must report where the routed energy ends up, whether it merely prolongs oversized components, and whether long-horizon facet persistence improves.

### Satiety-gated migration test (2026-08-06)

Tested the intuitive alternative: an intact high-reserve component with an available gate in its existing sensing range deferred ordinary-food harvests and collectively traveled toward that gate. Gate-field food remained harvestable. Mint-green dashed rings distinguish these restrained collective strides; the rule was experimental and off by default.

| Mean at 1,000 ticks, three seeds | Stride control | Satiety migration |
| --- | ---: | ---: |
| Deferred ordinary-food harvests | 0 | 216.0 |
| Total overflow | **51,711.69** | 52,190.05 |
| Ordinary-food overflow | **51,607.41** | 52,091.95 |
| Population | **23.33** | 17.67 |
| Strong facets | **42.67** | **2.33** |
| Gate completions | **43.67** | 28.33 |
| Whole component episode energy | **+16.01** | +15.12 |

This is a clean negative result. The rule did cause behavioral restraint, but it did not reduce overflow and substantially damaged structure formation and gate work. The provenance result explains why: most overflow is generated by loose ordinary foragers, outside the narrow class of intact components eligible for restraint. Those components instead need local food to remain viable while forming and traveling. Therefore the policy remains **disabled**. Do not treat “stop eating and migrate” as a general cure; it targets the wrong population while withholding the support that makes collective migration possible.

The harvest-boundary routing hypothesis remains the next appropriate test because it addresses surplus at the actual producer without denying the component its local ecological support.

### Weakest-bond overflow-routing test (2026-08-06)

Implemented the proposed local preservation bias. At the harvest boundary, a conservative 35% of would-be overflow was eligible for routing at 85% efficiency; it could enter only the harvester’s weakest existing adjacent bond reserve, never create a bond, and remained constrained by the ordinary 10-unit bond capacity. The canvas shows each successful routing event as a short mint energy transfer, and the server records source, destination bond, amount, and reserve before/after. The rule remains experimental and disabled by default.

| Mean at 1,000 ticks, three seeds | Overflow control | Weakest-bond routing |
| --- | ---: | ---: |
| Discarded overflow | 51,711.69 | **47,593.94** |
| Routed overflow | 0.00 | 135.00 |
| Routing events | 0.0 | 58.3 |
| Population | **23.33** | 18.00 |
| Bonds | **38.33** | 18.33 |
| Strong facets | **42.67** | 7.67 |
| Gate completions | **43.67** | 33.33 |
| Whole component episode energy | **+16.01** | +8.65 |

This is another causal negative result. Routing did reduce discarded overflow, but only a tiny fraction of the total could enter the small, already-existing bond reserves. It did not protect structure; all structural outcomes worsened. The explanation is consistent with provenance: most overflow comes from loose foragers that have no eligible bond, while dense components are not capacity-starved at the particular moment of routing. A weak-bond preservation bias is therefore insufficient and may perturb the timing of formation without creating a viable energy logistics channel.

**Decision:** keep bond overflow routing disabled. Do not raise the capture fraction or bond capacity blindly. The next research question is whether the model’s individual cap itself is mismatched to its food quantum and reproduction threshold, producing chronic harvest waste before a structural recipient even exists. This calls for a capacity/food/reproduction geometry analysis before another transfer mechanism.

### Surplus-plume and local sensing screen (2026-08-06)

Implemented the environmental alternative. Fifteen percent of actual harvest overflow became a capped, decaying turquoise plume at the source cell. A strong closed facet could condense 40 plume units into one physical, contestable green food unit; this is deliberately lossy. The initial passive screen created `7,756.75` mean plume energy per world, but condensed zero units and released zero food. It changed no ecological outcome, as expected for an unused resource.

The next isolated screen added an 8-cell directional cue only for a strong facet and only when a condensable plume was nearer than that component's available gate. It also yielded zero plume-directed moves, zero condensation, and no change from passive plumes.

**Diagnosis:** the new resource is not merely unsensed. Overflow plumes arise around loose foragers, while strong gate-oriented facets occupy different spatial regions; no eligible component comes within the local sensing range. Enlarging the radius until every component can globally see overflow would undermine the physical, local-ecology principle and turn the rule into an invisible subsidy.

**Decision:** keep plumes and plume navigation disabled. The result is valuable: current components cannot capitalize on loose-forager waste without a new, independently justified spatial connection. Potential future hypotheses are a bounded diffusing scent emitted by dense plume clusters, or a rare courier-like report of an otherwise non-local recycling opportunity. Neither should be added before resolving the more basic capacity/food/reproduction geometry mismatch.

### Individual harvest-restraint and geometry result (2026-08-06)

Added harvest geometry accounting and tested the simple all-organism rule: leave ordinary food in place if consuming its full discrete meal would exceed individual capacity; gate-field food was unaffected. The rule is experimental and disabled by default.

| Mean at 1,000 ticks, three seeds | Current control | Ordinary harvest restraint |
| --- | ---: | ---: |
| Discarded overflow | 51,711.69 | **26.43** |
| Harvest attempts | 5,566.33 | 9,069.33 |
| Attempts whose full meal would overflow | 3,688.33 (66.3%) | 7,077.00 |
| Attempts currently reproduction-eligible | 59.33 | 71.00 |
| Restrained harvests | 0.00 | 7,074.67 |
| Population | **23.33** | 14.00 |
| Bonds | **38.33** | 5.67 |
| Strong facets | **42.67** | 1.33 |
| Gate completions | **43.67** | 19.67 |
| Whole component episode energy | **+16.01** | -43.72 |

This resolves the geometry question. Ordinary meals are too coarse relative to remaining storage: about two-thirds of attempted meals would clip. However, most such consumers are not simultaneously reproduction-eligible under their current decision graph. A hard refusal rule nearly eliminates overflow but also removes the ordinary energy intake that supports movement, bonding, and eventual reproduction.

**Decision:** keep strict harvest restraint disabled. The next clean hypothesis is **partial harvesting**, not more routing: an organism may take only its available headroom from a discrete food source and leave the remaining energy physically present in that cell for later harvest. This would prevent clipping without turning a food source into an all-or-nothing decision. It requires a stable per-food energy-content representation and careful conservation accounting; it should be introduced as a focused representation/physics change, not an arbitrary reward.

### Partial-harvest physics test (2026-08-06)

Implemented the representation change. Every food tile now carries a conserved fractional food amount; a partial tile remains visible but dimmer. Under the experimental rule, an organism consumes only its current headroom and leaves the remainder in that physical tile. Fertility loss scales with the fraction harvested. No energy, storage, or reward was added. The rule remains disabled by default.

| Mean at 1,000 ticks, three seeds | Current control | Partial harvesting |
| --- | ---: | ---: |
| Discarded overflow | 51,711.69 | **0.00** |
| Partial harvests | 0.00 | 7,798.33 |
| Energy retained in food tiles | 0.00 | **72,768.23** |
| Population | **23.33** | 8.00 |
| Bonds | **38.33** | 0.33 |
| Strong facets | **42.67** | 0.00 |
| Gate completions | **43.67** | 20.33 |
| Whole component episode energy | **+16.01** | -6.62 |

This is a crucial negative result. Partial harvesting removes the accounting artifact perfectly, but not the ecological collapse. The conserved food becomes **stranded surplus**: organisms fill to capacity, leave fractional food behind, but do not reliably convert their already-stored energy into reproduction or another meaningful expenditure. The strict and partial tests together rule out both “discard it” and “leave it behind” as sufficient solutions.

**Updated causal diagnosis:** the limiting process is now the conversion of near-cap stored energy into a life-cycle action. The next observation-only work should examine the organism decision graph around high energy: how often a near-cap organism emits reproduction, movement, bonding, or other action versus continuing to seek food. Do not add more storage, routing, food, or global sensing before measuring that decision-policy bottleneck.

### Autonomous facet budding screen (2026-08-06)

Implemented an experimental structural-reproduction rule, disabled by default. A strong closed facet with at least 14 reserve energy may select an energetic member (at least 110 energy), perform that member's ordinary real energy split, and use 4 reserve energy to seed the two new bonds needed for a legal adjacent triangle. The offspring is a normal mutated organism; no energy is created and no shape is copied as an abstract object. This is local **budding into the existing triangular form**, not a free clone.

| Result | Control | Autonomous budding |
| --- | ---: | ---: |
| 500 ticks, two matched seeds: population | 41.5 | **55.0** |
| 500 ticks: strong closed facets | 23.5 | **81.5** |
| 500 ticks: gate completions | 18.0 | **24.5** |
| 500 ticks: whole-episode energy delta | **+39.11** | -16.44 |
| 1,000 ticks, seed 160103: strong closed facets | **104** | 22 |
| 1,000 ticks, seed 160103: bonds | **79** | 39 |
| 1,000 ticks, seed 160103: gate completions | 47 | **53** |

The rule succeeds mechanistically: in the 1,000-tick budding run it created 54 autonomous facet births and 81 structural births total. However, it is not yet a persistence mechanism. It accelerates early structural growth, then increases maintenance and reproduction burden enough that fewer strong facets remain at the later checkpoint and the full harvest-to-next-gate energy cycle is weaker.

**Decision:** leave autonomous budding disabled. It is a useful capability and a precise negative result: *structural reproduction without a component-level energy budget produces a boom, not a self-sustaining lineage.* Before changing its thresholds or enabling it, add component-scale energy accounting for parent split, reserve investment, maintenance, and offspring survival, then test a paced/budgeted variant against this exact control.

### Budgeted facet budding screen (2026-08-06)

Added component-scale budding bookkeeping. Every active component episode can now record autonomous births, parent energy transferred into offspring, facet-reserve investment, and whether those offspring survive to the completed episode. Each facet also has an inspectable live ledger: current component energy, its latest qualifying completed cycle, prior births, cooldown, and denial reason.

The paced experimental rule required all of the following before one bud: a recent completed gate-to-gate cycle with at least `+15` component energy, live component energy of at least `250`, and a `120`-tick facet cooldown. It remains disabled by default.

| Result | Control | Budgeted budding |
| --- | ---: | ---: |
| 500 ticks, two matched seeds: population | **41.5** | 37.5 |
| 500 ticks: strong closed facets | 23.5 | **50.0** |
| 500 ticks: autonomous births | 0 | 4.5 |
| 500 ticks: whole-episode energy delta | **+39.11** | +13.03 |
| 1,000 ticks, seed 160103: population | **35** | 13 |
| 1,000 ticks: strong closed facets | **104** | 7 |
| 1,000 ticks: gate completions | **47** | 16 |
| 1,000 ticks: autonomous births | 0 | 2 |

The paced rule successfully avoids a birth frenzy (only two autonomous births at 1,000 ticks), but it still does not preserve the component. This distinguishes an important point: a **historically positive** cycle is not yet a spendable reproductive surplus. The parent split plus two-bond seed can be unaffordable even after a prior positive cycle, and the historical cycle can cease to describe the changed component after one birth.

**Decision:** keep both budding variants disabled. The new ledger is retained as research instrumentation. The next valid reproductive hypothesis, if pursued, is an explicit prospective escrow: a component must retain a protected post-birth operating reserve sufficient for a bounded migration interval, not merely have earned energy earlier. That escrow must be measured before and after the birth and must not be financed by newly created energy.

### Bounded conserve-and-migrate component policy (2026-08-06)

Implemented the first collective energy-use policy, as a disabled-by-default experiment. A strong component recognizes only the state of its **own assigned gate**. When that gate weakens below field strength `0.25` or exhausts, the component enters `conserve`: sufficiently energy-secure members leave ordinary food in place but may still consume local gate output. After a fixed `18`-tick dwell limit, its old gate commitment is released and existing local gate-direction sensing guides the group toward another available gate. No energy is awarded and no global target is revealed.

The server now exposes each component's state (`harvest`, `conserve`, or `migrate`), assigned gate, depletion time, mean energy fraction, deferred ordinary harvests, and migration-directed moves.

| Result | Control | Bounded conserve-and-migrate |
| --- | ---: | ---: |
| 500 ticks, two matched seeds: population | 41.5 | **107.5** |
| 500 ticks: bonds | 51.0 | **155.5** |
| 500 ticks: strong closed facets | 23.5 | **94.0** |
| 500 ticks: gate completions | 18.0 | **27.5** |
| 500 ticks: directed migration moves | 0 | 309.5 |
| 500 ticks: whole-episode energy delta | **+34.00** | +12.86 |
| 1,000 ticks, seed 160103: population | **35** | 29 |
| 1,000 ticks: strong closed facets | **104** | 57 |
| 1,000 ticks: gate completions | **47** | 46 |

This is the first evidence that an explicit energy-use policy can create a large, visibly organized structural expansion without adding energy: components actually leave depleted work sites and find further gates. It is not yet a demonstrated persistence improvement. The lower completed-cycle balance and weaker 1,000-tick endpoint indicate that migration is still spending more operational energy than it returns in retained component capital.

**Decision:** retain the mechanism as an experimental toggle, disabled by default pending independent 1,000-tick replication. The next diagnostic is not parameter tuning: use the component ledger to compare `harvest → conserve → migrate → next-gate` energy separately, especially the energy retained at departure and spent per migration move. That will tell whether the remaining loss lies in departure timing, travel cost, or post-arrival exploitation.

### Phase-resolved component energy ledger (2026-08-06)

Implemented the requested observation layer without changing any ecological parameter. Every live gate-to-gate component episode now separates `harvest`, `conservation`, `migration`, and `arrival` accounting. Each phase records food/gate income, movement and maintenance expenses, reserve maintenance, overflow, deliberately deferred ordinary food, action records, and net operational balance. Arrival is timestamped when the bonded group reaches its next targeted gate; the episode closes only when that gate is completed.

| Mean per completed episode, 500 ticks / two seeds | Control | Bounded lifecycle |
| --- | ---: | ---: |
| Harvest net operational balance | -0.59 | -25.17 |
| Conservation net operational balance | 0.00 | -0.07 |
| Migration income | 98.92 | 129.71 |
| Migration expenses | 151.94 | **197.78** |
| Migration net operational balance | -61.75 | **-73.72** |
| Arrival net operational balance | -15.80 | **-25.36** |
| Episodes with observed conservation | 0.0 | 1.0 |

This answers the immediate question. The principal leak is **not** an absence of energy sources: components acquire substantial energy while moving, but movement plus structural maintenance consumes more than it returns. The bounded lifecycle makes this worse in the tested world because it induces more purposeful travel (`309.5` directed moves) without yet reducing cost enough or delivering enough usable arrival energy. The near-zero conservation observation is also diagnostic: the depletion signal normally reaches a component after it is no longer sufficiently energy-secure to enter the intended holding state.

**Next causal hypothesis:** do not add food or alter dwell time yet. Test a bounded, physical collective transport rule that reduces only the movement cost of a coherent migrating component, then use this exact phase ledger to ask whether migration becomes non-negative while harvest and arrival remain unchanged. This is the narrowest intervention justified by the evidence.

### Bounded migrating-component transport screen (2026-08-06)

Implemented the narrow transport hypothesis as an experimental disabled toggle. Only a strong, bonded component in explicit `migrate` state with a locally available next gate receives a lower existing movement-cost multiplier (`0.40` rather than the ordinary collective stride multiplier of `0.65`). It creates no energy, reserve, food, target, or teleportation. The canvas distinguishes this state with an amber dashed ring outside the existing cyan stride ring.

| Mean at 500 ticks, two matched seeds | Lifecycle only | Lifecycle + transport |
| --- | ---: | ---: |
| Population | 107.5 | **120.0** |
| Bonds | 155.5 | **199.5** |
| Strong closed facets | 94.0 | **140.5** |
| Births | 145.0 | **157.5** |
| Gate completions | **27.5** | 27.0 |
| Whole-episode energy delta | +12.86 | **+37.90** |
| Directed migration moves | 309.5 | 374.0 |
| Migration expenses | **197.78** | 216.94 |
| Migration net balance | **-73.72** | -87.97 |
| Arrival net balance | -25.36 | **-13.60** |

The apparent contradiction is informative. Aggregate migration expense rose because healthier components made more migration moves, but the cycle as a whole retained substantially more energy and arrived in a better state. Relative to directed moves, estimated migration expense fell from about `0.64` to `0.58` energy per move. Thus transport is doing physical work rather than creating an accounting illusion, but migration remains net-negative at this setting.

A one-seed 1,000-tick transport run became sufficiently structurally dense to exceed the local execution window and was stopped without treating it as evidence. **Decision:** keep transport experimental and disabled by default until a completed longer replication; add explicit per-move transport cost and distance telemetry before changing the multiplier. The next success criterion is not more facets at 500 ticks, but a completed longer run in which migration loss per unit distance falls and component persistence improves without shifting the deficit into another phase.
