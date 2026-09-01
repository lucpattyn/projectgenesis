# Project Genesis — Restart Handoff

**Read this file first when resuming.** It records the actual current state and the next scientific question; it is not a feature wish list.

## Tomorrow restart — topology-native persistence work (2026-08-31)

### Exact baseline and repository state

- Start from the checked-in `main` worktree, including this handoff document. Do not restore a stash or reset history.
- The current mechanics baseline is **`1fe7c8e`** — `feat: prioritize member survival in component reserves`; its immediate predecessor is **`d767402`** — `feat: add topology-native pulse and motif memory`.
- The clean formation reference remains **`18866dc`**. Do not reset to it; it is the historical control, while the current commits are the working continuation.
- Default live seed: **`160103`**. World number: **`85470`**.
- Before editing, run `git status --short`, read this section, then run `npm test`.
- Do not restore old research stashes or reactivate the older coordinate-based collective-memory / surplus-first mechanisms. They remain controls, not the active design.

### Current mechanism switches

- `bond.componentReserveEconomy.enabled`: **true**.
- `bond.componentReserveEconomy.commitmentEnabled`: **true**.
- `bond.collectiveMemory.enabled`: **false** (old location-attraction memory control).
- `bond.surplusFirstEnergy.enabled`: **false** (old control).
- `bond.topologyMemory.enabled`: **false** by default; use it only in matched headless experiments until further evidence supports a live default.

### What has been implemented

1. Component reserves are capped and funded only from real harvest surplus after the source's reproduction floor.
2. Reserve routing is now survival-first: **source survival → protected reproduction slice → weakest-member support → bond maintenance**.
3. Existing adjacent bonds can bridge short binding-drive dips only with usable local reserve and safe members.
4. The switchable topology-memory layer derives terminal, hub, interior, and cyclic-core roles from the live graph. It does not whitelist pentagons, diamonds, stars, or world coordinates.
5. Food return, gate completion, productive migration, member support, and reproduction emit attenuated pulses through existing bonds. Repeated useful topology signatures can consolidate into bounded motif traces.
6. Structural reproduction can use real component reserve only when the component is stable and adequately funded; inheritance carries only a capped/noisy local trace.
7. Diagnostics expose reserve deposits, member support, bond funding, topology roles, motif count, consolidation, and traces in the bonding snapshot.

### Measured evidence — do not overstate it

All results below are deterministic single-seed screens at seed `160103`, not replicated scientific conclusions.

| Screen | Memory off | Topology memory on | Interpretation |
| --- | ---: | ---: | --- |
| 800 ticks, final population | 29 | **38** | More members survived with the layer on. |
| 800 ticks, final bonds | 29 | **55** | More structure remained. |
| 800 ticks, final facets | 20 | **37** | Rich morphology persisted better. |
| 800 ticks, energy-exhaustion deaths | 131 | **82** | Survival-first routing reduced starvation. |
| 1,500 ticks, final population | 8 | **12** | Improvement remained, but both worlds declined. |
| 1,500 ticks, final bonds/facets | 0 / 0 | **8 / 2** | The enabled world retained one small component. |
| 1,500 ticks, energy-exhaustion deaths | 172 | **136** | Improvement, not resolution. |

At 1,500 ticks the topology-memory run still had 147 binding-loss breaks and 137 maximum-age deaths. The next bottleneck is late replacement and energy acquisition, not initial structure formation.

### Safe next design — implement and test in this order

Do not introduce free energy, privileged shape names, global targets, teleportation, or remembered coordinates. Every rule below must use current adjacency, local sensing, actual energy, graph role, and bounded trace.

1. **Core–scout energy separation.** Define core edges as non-bridge cyclic edges, trunk edges as bridges between substantial subgraphs, and tail edges as degree-one terminal bridges. Start with a *tethered* scout, not a free rover: one terminal attached to a cyclic core may make short individual moves while retaining a strict adjacency leash, time limit, and energy-return floor.
2. **Return-path rewards.** Record `departure → exploration → value → return` for the tethered scout. Only a food return, useful gate signal, or productive local discovery followed by return may emit a stronger pulse into the tail attachment and connected core. The reward is trace/commitment only; harvested energy still follows the survival-first budget.
3. **Reserve-funded reproduction before old-age collapse.** Permit a stable cyclic component to initiate a local structural birth before its members age out, but only with all core members above the support floor, real post-birth reserve, a local open site, and a cooldown. Spend real parent energy and reserve; inherit only capped/noisy local trace.
4. **Graceful edge shedding.** Under energy stress, release an unproductive tail edge before risking a cyclic core. Require a starving terminal, failed support, no recent successful-return trace, and intact remaining core. Return only a lossy fraction of the released edge's real reserve to the attached component or terminal.
5. **Maintenance scaling by topology.** Allocate maintenance after member support in this order: core-cycle edges, recently successful return paths, trunk edges, then ordinary tails. This is graph-derived; it is not a pentagon or triangle whitelist.
6. **Local reserve recycling.** When a member dies or a tail is shed, recover only a bounded lossy fraction of its existing bond reserve / stored recoverable energy into nearby component reserve or physical local residue. Do not create energy and do not make dead members a global subsidy.
7. **Re-seeding test.** Run seeds `160103–160105` for 2,000 ticks after each isolated intervention. Report final surviving components, longest cyclic-core lifetime, births before age death, starvation deaths, tail releases, successful scout returns, reserve inflow/outflow, and reproduction timing. Compare each step against the current commit with `bond.topologyMemory` both off and on.

### Scout stage completed (2026-09-01)

The first narrow step is now implemented in the current worktree: graph-derived tethered-scout eligibility and episode diagnostics. It is observational only; no scout moves independently, no bond is changed, and no energy is transferred. A 300-tick null-intervention check with seed `160103` matched exactly with diagnostics disabled: population 39, bonds 75, facets 92, births/deaths and bond breaks identical. The diagnostic run recorded 18 candidate episodes over the interval.

### Next task

Add return-path episode state and pulse rewards as a separate commit. Begin with local movement constrained by the configured leash, excursion timer, and scout energy floor. Only a scout that finds real food or a useful gate signal and returns to its attachment should reinforce the path. Do not change reserve allocation or implement edge shedding in that commit; rerun the null intervention first, then the enabled 800-tick comparison.

### Useful commands

```powershell
git status --short
npm test
node server/index.js
```

For headless screens, stop the live server first. Use seed `160103` as the quick visual/mechanism reference, then use `160103–160105` for comparative evidence. Keep headless results out of tracked files unless they are a deliberate, documented research artifact.

## Where we are

Phase 16 moved from energy accounting into **energy logistics**: whether strong bonded facets can locate, solve, and benefit from finite computational opportunities.

The project now has evidence that gate-directed structural navigation works. Strong closed facets can reach gates, coordinate, create physical local food, and form larger bonded compounds. We do **not** yet have evidence for a persistent, self-funding ecosystem of independent productive structures.

## North star and two-track research policy

Project Genesis must not become only an ecology simulator. Its endpoint remains:

> Can evolution produce digital organisms that invent useful computations?

Ecological stability is necessary because computation cannot accumulate in a population that repeatedly collapses, but survival is not the endpoint. From now on, work should explicitly proceed on two linked tracks.

### Track A — ecological foundations

Continue the present causal process: identify and test bottlenecks in energy, persistence, public goods, information flow, structural maintenance, and reproduction. The current finite-gate work belongs here.

### Track B — periodic intelligence probes

After every few ecological phases, run a diagnostic that asks whether the current ecology shows any evidence of increasing computational sophistication. It must not be replaced by a survival metric. Candidate measurements include:

- decision-graph depth, recurrent state use, and novel graph motifs;
- lineage specialization and persistence of distinct strategies;
- whether signals or courier information predict useful future conditions rather than merely correlate with location;
- whether bonded structures solve coordination tasks that individuals cannot;
- whether environmental memory and distributed state improve task performance;
- whether a new computational motif can invade and persist in an established ecology.

“Not yet” is a valid result. The purpose is to prevent optimization of ecological longevity from being mistaken for progress toward evolved computation.

**Next probe trigger:** after the gate-field capture diagnosis and one longer (1,000-tick) finite-gate replication, define a small preregistered coordination benchmark using existing gates and existing observables—no new prime or resource solely to make the probe succeed.

## Live default ecology

The server runs via `node server/index.js` at `http://localhost:3000/`. A normal reset is deterministic with seed `160103`.

- Critical one-hop bond-reserve relay: enabled; only at energy `<= 2` after ordinary direct support fails.
- Couriers: disabled by default.
- Gate-directed navigation: enabled only for a strong closed facet (minimum bond strength `0.7`).
- Navigation range: 14 cells; a closer legal collective direction receives a `+0.8` bias.
- Gate commitment: an arriving facet temporarily claims one gate. Claims end on facet failure/dissolution or field end; unassigned facets avoid claimed gates.
- Gates: 7 distributed gates, each with 18 units of finite food-production stock.
- A successful gate initially releases 1 physical food unit at one of three neighbouring, stationary work ports.
- Every subsequent physical food unit spends one stock unit. An empty gate becomes a dim `×`, releases its facet commitment, stays dormant for 140 ticks, and then recharges.

Relevant implementation: `server/simulation/config.js`, `server/simulation/simulation.js`, and `public/renderer.js`.

## What is established

1. **Storage was a real bottleneck.** Larger storage reduced capacity-overflow loss and enabled substantially larger structural blooms. It did not establish long-run persistence by itself.
2. **Energy access was a real bottleneck.** Starvation analysis found organisms dying in reserve-rich bonded components while their own direct bond held no accessible reserve. Critical-only one-hop relay modestly reduced such deaths without the damage caused by broad continuous relaying.
3. **Navigation is causal.** In matched 300-tick finite-gate screens over seeds `160103`–`160105`, navigation-only averaged population `37.0`, bonds `50.7`, strong facets `46.0`, gate arrivals `54.3`, and completions `12.3`; the no-navigation control averaged `28.7`, `34.0`, `19.0`, `0.0`, and `2.7`.
4. **Large initial gate bursts are harmful with finite stocks.** A 3-unit start-up release front-loaded contested food and produced fewer facets than the 1-unit default.
5. **Facet formation has not regressed in the recent short screen.** The current regime averaged `29.3` strong closed triangles versus `6.3` in the earlier 4-gate regime, but these are concentrated in larger compounds. This is why the canvas can show fewer clean separate triangles while raw strong-facet counts are higher.

Full methods and tables: `PHASE_16_ENERGY_LOGISTICS.md`.

## Current weakness — do not lose sight of this

The ecology still does not demonstrate that a working facet pays for its own continuation.

Gate food is physical and contestable. In the earlier navigation-plus-contract screen only about 14% of field harvests were made by the responsible facet; the rest were captured by nearby organisms. Finite stocks make this question sharper: gates now create temporary opportunities, but we must learn whether their workers can extract enough value before the opportunity closes.

**Update from the first direct capture diagnosis:** stationary neighbouring ports corrected the earlier interpretation. Across three current-default 300-tick runs, responsible members harvested `107 / 217` gate-food units (**49.3%**), competitors harvested `110`, and only `11` released units remained unharvested. Mean harvest delay was `3.75` ticks; competitors were a mean `1.46` cells from a responsible member. The current problem is therefore a genuine close-range public-goods contest, not worker inability to reach food. Do not privatize gate food before testing whether this approximately half-share already pays the facet's full cycle cost.

**Answer from the active-field balance replication:** it does not. Across 124 completed field cycles from three current-default 1,000-tick worlds, the bounded responsible structure (three members plus internal bond and facet reserves) lost a mean **6.31 energy units per cycle**. This excludes migration after a gate dries up, so the full foraging cycle is worse. Gross gate income (`49.27`) exceeded directly logged action/reserve costs (`42.97`), but actual stored energy still declined—evidence that allocation, capacity overflow, redistribution, or other unallocated losses are consuming the apparent surplus.

**Decomposition result:** the leading cause is now identified. Of the `12.61` gap between the direct ledger (`+6.30`) and actual structural-energy change (`-6.31`), `5.37` per cycle is shared outward through overlapping facets, `3.88` is deposited into bonds leading outside the responsible triad, and `1.28` is capacity overflow. These explicit channels account for about 84% of the gap. The gate’s value is leaking across the larger bonded topology; it is not principally being lost because gates are unproductive or inaccessible.

Also, a dense bonded compound can contain many overlapping triangle cliques. `facets` alone is not a count of distinct visible societies. Use separate bonded components containing a strong triangle as the measure of **distinct structural groups**.

## Recommended next research step

Do **not** add a new prime, resource, gate type, or arbitrary structural reward.

The gate-field capture diagnosis is now implemented. Its server fields and `scripts/run-gate-field-capture-diagnosis.mjs` record:

- responsible facet key and member positions;
- harvester identity, whether it is a responsible member, and its distance to the responsible facet;
- time from release to harvest;
- gate stock remaining;
- field lifetime, worker harvest fraction, and fate of the responsible facet after exhaustion.

The triangle-first boundary has now been tested and failed. It reduced outward sharing from `5.37` to `0.96` energy per field cycle, but worsened total structural energy (`-6.31` → `-13.62`) and reduced gate income (`49.27` → `39.43`). It remains disabled. This means outward transfers are currently part of a stabilizing larger-compound dynamic, not a simple leak to suppress.

**Component-scale result:** the larger-compound hypothesis is supported. In the same 124 completed fields across three 1,000-tick open-sharing worlds, initiating triads lost `-6.31` energy per field on average, but their anchored connected bonded components gained **`+17.82`** and grew from mean `8.57` to `9.04` members. Exactly 50% of component fields were positive. The present economic organism is therefore more plausibly the connected component than a single triangle. This explains why the triangle-first boundary was harmful.

**Whole-episode result:** component-scale field gains do not survive the dry interval. Across 118 field-start → field-end → next-gate-or-extinction episodes, 117 (99.2%) reached another gate completion and only one lost its original members first. Yet the mean component energy change across the whole episode was **`-27.67`**, with only 42.7% positive. Mean migration time was 29.08 ticks and membership stayed roughly constant (8.79 → 8.93). Components can navigate and coordinate, but cannot yet finance the journey between gates.

**Metabolic-remnant result:** a new off-by-default, conserved death-residue layer was screened as a creative migration bridge. At an 8% residual fraction, components recovered 18.55 residue energy on average and improved whole-episode loss from `-27.67` to `-12.10`; however, population fell from 15.67 to 12.33 and positive episodes rose only from 42.7% to 43.8%. A 4% fraction was worse than control. The residue is promising but insufficient and must remain disabled. It must never be enabled on energy balance alone; population is a co-primary outcome.

The whole-episode test is complete. Next, decompose the between-gate loss at component scale: movement cost, coupled maintenance, bond-reserve maintenance, unsuccessful local movement, starvation/support transfers, capacity overflow, and any energy given to non-component organisms during migration. Compare that decomposition with the 8% death-residue arm to learn whether residue reduces the right expense or merely alters population turnover. Do not add a new resource, prime, or reward before that accounting identifies the dominant migration expense.

The question is:

> Which between-gate energy cost turns a field-profitable navigating component into a whole-cycle loss?

Only after that balance diagnosis should we choose an intervention. Any intervention must remain physical, visible, contestable, and experimentally switchable.

## Latest result — migration cost decomposition

That diagnosis is now complete. `scripts/run-component-migration-decomposition.mjs` ran the matched three-seed, 1,000-tick comparison between control and the 8% experimental death-residue arm. The component episode ledger now records post-field, pre-next-gate energy income, movement, organism upkeep, coupling, internal bond-reserve upkeep, idle movement, support/relay transfers, and overflow.

| Metric per completed migration episode | Control | 8% residue |
| --- | ---: | ---: |
| Whole episode component-energy change | -27.67 | **-12.10** |
| Migration operational balance | -103.79 | -105.05 |
| Movement cost | **194.14** | **197.56** |
| Ordinary maintenance + perception | 38.79 | 39.49 |
| Coupling + bond-reserve maintenance | 32.92 | 33.51 |
| Capacity overflow | 17.26 | **32.31** |
| Residue recovered during migration | 0.00 | **0.60** |

**Interpretation:** movement is the dominant measured between-gate expense. Idle movement is essentially zero, so components are not failing because they wander indecisively. The 8% residue arm improves whole-cycle balance, but not because remnants directly fund travel: nearly all recovered residue occurs outside the recorded dry migration window, the migration ledger is fractionally worse, overflow rises, and final population remains lower. Keep residue off by default. It is a useful experimental hint, not a confirmed solution.

## Immediate next research move

Do not add another food source, prime, or unconditional reward. Design a bounded, visible, experimentally switchable **collective transport/carrying** hypothesis that lowers the measured movement cost for an intact bonded component, rather than simply increasing its income. It should preserve the project's philosophy:

- no energy creation;
- no invisible global subsidy;
- physical and contestable on the canvas;
- benefits only a genuinely connected and maintained structure;
- evaluated against the same 1,000-tick migration ledger plus population and whole-episode energy.

The success condition is not “more organisms survive.” It is a specific reduction in migration movement expenditure sufficient to improve the component’s operational migration balance, without transferring collapse elsewhere.

## Latest result — coordinated collective stride

That experiment is complete and has been independently replicated. `scripts/run-collective-stride-screen.mjs` compares control to a bounded transport mechanism: a connected gate-seeking component with at least three members and a strong facet pays 65% of normal movement cost. It creates no energy, applies to no loose organism, and does not change gates, food, primes, or maintenance. Cyan dashed rings identify actual gate-directed strides on the canvas.

| Metric | Seeds 160103–160105 control → stride | Seeds 160106–160108 control → stride |
| --- | ---: | ---: |
| Whole component episode energy | -27.67 → **+16.01** | -21.30 → **+9.68** |
| Final population | 15.67 → **23.33** | 10.33 → **23.67** |
| Movement cost per migration tick | 6.68 → **5.68** | 6.11 → **5.05** |
| Migration operational balance | -103.79 → -86.20 | -144.19 → -131.81 |

**Decision:** enabled by default. This is the first bounded logistics intervention with replicated whole-cycle benefit. It does not yet make migration itself profitable, so it is not the final answer; it restores enough component viability to expose the next bottleneck.

## Next research question

Why does the full component cycle become positive while the explicitly measured dry-migration ledger remains negative? Test whether stride changes active-field productivity, component composition, food capture, reserve retention, or an unmeasured transfer channel. Preserve the stride default while doing observation-only accounting first; do not add new food, primes, or rewards.

## Critical correction — long-horizon persistence is still failing

`scripts/run-stride-persistence-trace.mjs` now samples population, bonds, strong facets, structural groups, gate completions, overflow, and starvation every 200 ticks through 2,000 ticks. The live observation of “all facets vanished” is real, not a renderer issue.

With stride enabled, all three standard seeds bloom and then reach zero strong facets between ticks 1,200 and 1,800. By tick 2,000 each has only 3–4 loose organisms. Capacity overflow rises continuously to 71k–82k energy, then starvation and bond loss complete the collapse.

The matched stride-disabled control also collapses: two of three seeds have zero facets at tick 2,000, with 77k–95k overflow. Therefore collective stride did **not** cause the disappearance; it has not solved the pre-existing long-run overflow/storage bottleneck either. Keep stride enabled for now because of its replicated medium-horizon benefit, but do not call the ecology persistent.

## Immediate next research move

Add observation-only **overflow provenance** before tuning anything. Attribute each discarded unit by organism, component, resource origin (ordinary food versus gate field), and action phase (harvest, reproduction, bond/facet allocation). Report concentration: what fraction of overflow comes from the top 10% of organisms/components and whether overflow precedes their starvation. This will distinguish a capacity-design error from a distribution/retention error.

## Overflow provenance result — the next bottleneck is identified

Implemented the observation-only ledger and ran `scripts/run-overflow-provenance.mjs` across the current default three-seed, 1,000-tick protocol.

- `155,135.08` energy was discarded.
- **100%** occurred at the harvest boundary.
- **99.8%** came from ordinary food; only 0.2% came from gate fields.
- Green food supplied 53.5% of loss, blue 40.1%, red 6.4%.
- The top 10% of organisms account for 27–29% of overflow; the top 10% of recorded components for 42–46%. This is concentration, but not one exceptional organism.
- 96 of 150 recorded deaths had prior overflow, averaging 1,054 energy discarded by that organism.

**Conclusion:** the late collapse is not caused by gate productivity. Ordinary foragers repeatedly harvest while nearly full, discard energy instantly at an individual cap, and later age/starve without that energy ever supporting descendants or structure. This is the next causal bottleneck.

## Immediate next research move

Test a bounded, lossy, harvest-boundary **structural overflow-routing** mechanism. Only an intact local bonded structure may accept a capped portion of a member’s would-be overflow into existing bond or facet reserve capacity; the rest remains discarded. Do not add energy or new storage. Compare it with the present `overflowCapture.mode = "disabled"` control over the same 1,000-tick provenance screen and 2,000-tick persistence trace. Required outcomes: overflow reduction by origin, routed-energy destination, component size, population, strong facets, and late collapse timing. Guard against simply making oversized components live longer.

## Rejected alternative — satiety-gated migration

The user-motivated “stop harvesting when full, sense a gate, and collectively migrate” policy was implemented and tested in `scripts/run-satiety-migration-screen.mjs`. High-reserve gate-seeking components deferred only ordinary food, never gate-field food; mint-green dashed stride rings visualize the state. It remains disabled.

| Mean at 1,000 ticks (three seeds) | Stride control | Satiety migration |
| --- | ---: | ---: |
| Deferred harvests | 0 | 216.0 |
| Ordinary-food overflow | **51,607.41** | 52,091.95 |
| Population | **23.33** | 17.67 |
| Strong facets | **42.67** | **2.33** |
| Gate completions | **43.67** | 28.33 |

It changed behavior but did not touch the dominant overflow because much of that loss comes from loose foragers, not eligible structures. It starved components of the local food needed to form and travel. This is a causal negative result; do not re-enable without a new hypothesis.

## Rejected alternative — weakest-bond overflow routing

The proposed preservation-biased routing was implemented and screened in `scripts/run-bond-overflow-routing-screen.mjs`. A conservative 35% of would-be harvest overflow could move at 85% efficiency only into the harvester’s lowest-reserve existing adjacent bond. It cannot make bonds, cannot reach loose organisms, and is visible as mint transfer strokes. Server records show destination reserve before/after. It remains disabled.

| Mean at 1,000 ticks (three seeds) | Control | Bond routing |
| --- | ---: | ---: |
| Discarded overflow | 51,711.69 | **47,593.94** |
| Energy routed | 0.00 | 135.00 |
| Population | **23.33** | 18.00 |
| Strong facets | **42.67** | 7.67 |
| Gate completions | **43.67** | 33.33 |

The amount that can enter existing 10-unit bond reserves is tiny compared with chronic loose-forager overflow. The rule reduces loss but harms every structural outcome, so it is not a viable preservation mechanism. Do not increase its dose blindly.

## Immediate next research move

Analyze **energy geometry** before adding another channel: individual energy capacity relative to food quantum, resource yields, reproduction threshold, and reproduction split. Determine how often ordinary harvesting crosses the cap, and whether a reproductively eligible organism is mechanically able to convert a typical near-cap food gain into an offspring before clipping. This may reveal a unit/threshold mismatch rather than a missing ecological mechanism.

## Rejected alternative — surplus plumes

Implemented `overflowPlume`: 15% of actual harvest overflow becomes a capped, decaying turquoise field; a strong closed facet can condense 40 units into one contestable physical green food unit. `scripts/run-overflow-plume-screen.mjs` showed 7,756.75 mean plume energy created per 1,000-tick world but **zero** condensation and zero released food.

`scripts/run-overflow-plume-navigation-screen.mjs` then tested an 8-cell strong-facet directional cue. A plume could only override a gate when it was closer. Result: zero plume moves and zero condensation, identical ecology to passive plumes.

This establishes spatial separation: loose foragers produce the waste, while gate-oriented components do not come locally near it. Do not solve this by making plume sensing global. Keep both plume mechanisms disabled. A future spatial-link hypothesis would need independent justification (for example, a bounded diffusing plume scent or rare courier report), but only after the pending energy-geometry analysis.

## Energy geometry result — strict harvest restraint is rejected

`scripts/run-harvest-restraint-screen.mjs` added per-harvest headroom, meal-size, and reproduction-eligibility accounting, then tested leaving ordinary food unharvested when its complete meal would overflow. Gate food remained untouched. The rule is disabled.

| Mean at 1,000 ticks (three seeds) | Control | Strict restraint |
| --- | ---: | ---: |
| Discarded overflow | 51,711.69 | **26.43** |
| Would-overflow harvest attempts | 3,688.33 / 5,566.33 (66.3%) | 7,077.00 |
| Reproduction-eligible attempts | 59.33 | 71.00 |
| Population | **23.33** | 14.00 |
| Strong facets | **42.67** | 1.33 |
| Gate completions | **43.67** | 19.67 |

The model has a genuine discrete-meal/capacity mismatch, but strict refusal is not viable: most potential overflow consumers are not currently reproduction-eligible, so denying their meal removes support for movement, bonding, and future reproduction. Do not re-enable it.

## Immediate next research move

Design and test **partial harvesting**: food must retain a stable energy-content amount, and an organism takes at most its available headroom, leaving the remainder physically in the tile. No energy is created; no organism gets a new store; another organism may finish the meal. First define the food-content representation and exact energy conservation ledger, then compare control versus partial harvesting on overflow, food persistence, population, bonds/facets, gate work, and 2,000-tick collapse timing.

## Partial harvesting result — overflow was not the final bottleneck

Implemented fractional food contents, dim visible partial-food rendering, and conservation-aware fertility depletion. `scripts/run-partial-harvesting-screen.mjs` compared it against control. It remains disabled.

| Mean at 1,000 ticks (three seeds) | Control | Partial harvesting |
| --- | ---: | ---: |
| Discarded overflow | 51,711.69 | **0.00** |
| Energy retained in food | 0.00 | **72,768.23** |
| Population | **23.33** | 8.00 |
| Strong facets | **42.67** | 0.00 |
| Gate completions | **43.67** | 20.33 |

Partial harvesting is physically correct but ecologically insufficient. Organisms reach capacity and leave food behind, yet do not reliably convert their stored energy into reproduction or an alternative life-cycle action. Food becomes stranded rather than wasted.

## Immediate next research move

Instrument **near-cap decision policy** before changing ecology: for organisms above a defined energy fraction, record their brain effector values and selected action (consume, reproduce, move, bond/collective behavior), plus whether a reproduction opportunity was available. Determine whether the decision graph lacks a usable high-energy transition or whether opportunity/placement constraints block reproduction despite an appropriate decision. This is now the causal bottleneck; do not add another energy mechanism yet.

## Autonomous facet budding result — growth is not persistence

The user-requested structural reproduction mechanism is now implemented as an experiment and is **disabled by default** in `config.facet.autonomousBudding`. A strong closed facet can let a high-energy member reproduce normally into a legal adjacent triangular position, while the facet spends a bounded 4-energy reserve investment to seed the two inherited structural bonds. This preserves the arithmetic-genetics/reproduction model: the child is a real organism with an ordinary energy split and mutation; the system does not manufacture an abstract copied shape or free energy.

`scripts/run-autonomous-facet-budding-screen.mjs` gave a mixed but informative result:

| Measurement | Control | Budding |
| --- | ---: | ---: |
| 500 ticks, 2 matched seeds: population | 41.5 | **55.0** |
| 500 ticks: strong facets | 23.5 | **81.5** |
| 500 ticks: gate completions | 18.0 | **24.5** |
| 500 ticks: episode energy delta | **+39.11** | -16.44 |
| 1,000 ticks, seed 160103: strong facets | **104** | 22 |
| 1,000 ticks, seed 160103: bonds | **79** | 39 |

At 1,000 ticks, 54 births came specifically from autonomous budding (81 structural births total). Therefore the code works and generates the intended local triangular descendants. But it does not yet improve persistence: early growth creates an additional maintenance burden, leaving fewer strong structures at the later checkpoint.

**Next disciplined move:** do not turn it on or tune it blindly. Add per-component bookkeeping for parent split, reserve investment, maintenance, harvest, gate income, and offspring survival. Then test a paced/budgeted budding rule only if the ledger can show that a successful component retains a positive full-cycle balance.

## Budgeted budding result — a past surplus is not a birth budget

Implemented the above bookkeeping and a strict experimental paced rule. The server snapshot now exposes a facet-level budding ledger (live component energy, latest completed cycle, births, cooldown, and denials) and each active component episode records autonomous offspring, parent energy transferred, reserve investment, and offspring survival.

The test required a recent `+15` completed component cycle, `250` live component energy, and 120 ticks between births. It remains disabled.

| Result | Control | Budgeted budding |
| --- | ---: | ---: |
| 500 ticks, two seeds: strong facets | 23.5 | **50.0** |
| 500 ticks: autonomous births | 0 | 4.5 |
| 500 ticks: episode energy delta | **+39.11** | +13.03 |
| 1,000 ticks, seed 160103: population | **35** | 13 |
| 1,000 ticks: strong facets | **104** | 7 |
| 1,000 ticks: autonomous births | 0 | 2 |

Conclusion: pacing eliminates the uncontrolled structural boom but does not create persistence. A previously positive gate-to-gate result is backward-looking; it does not guarantee the *post-birth* component can meet future movement and maintenance costs. Keep both autonomous budding variants off.

**If reproduction is revisited:** test a prospective, no-free-energy operating escrow. Before a bud, calculate the live component energy minus the parent split and bond-seed investment; permit reproduction only if that remainder covers a predefined bounded migration reserve. Record whether the offspring and parent component then survive to the next completed cycle. Do not tune thresholds until the ledger shows where this condition fails.

## Bounded conserve-and-migrate result — real logistics, not yet persistence

Implemented a disabled experimental `collectiveWork.componentLifecycle` policy. A strong component sees only its assigned gate. When that gate weakens below 0.25 or exhausts, it conserves ordinary food while it remains sufficiently energy secure; after a hard 18-tick dwell limit, the old assignment is released and the existing local gate-sensing cue directs migration to another available gate. This adds no energy and does not globally reveal targets.

The live snapshot exposes the state (`harvest`, `conserve`, `migrate`), gate, depletion tick, energy fraction, ordinary-food deferrals, and migration-directed moves per component.

| Result | Control | Lifecycle policy |
| --- | ---: | ---: |
| 500 ticks, 2 seeds: population | 41.5 | **107.5** |
| 500 ticks: strong facets | 23.5 | **94.0** |
| 500 ticks: gate completions | 18.0 | **27.5** |
| 500 ticks: migration-directed moves | 0 | 309.5 |
| 500 ticks: episode energy delta | **+34.00** | +12.86 |
| 1,000 ticks, seed 160103: strong facets | **104** | 57 |

This is promising: components demonstrably use a depletion signal to leave and reach later opportunities, producing a large short-horizon structural expansion. It does not yet beat control at 1,000 ticks, and the completed-cycle energy balance is lower. Keep it disabled pending independent replication.

**Next research move:** decompose the component ledger by lifecycle phase—harvest, conservation dwell, migration, and next-gate arrival. Measure retained energy at departure and cost per migration move before changing the dwell, threshold, or movement cost. This is now a proper energy-logistics question rather than a need for another resource or reward.

## Phase-resolved ledger result — travel is the dominant leak

Implemented phase-resolved accounting for every gate-to-gate component episode. The snapshot and `scripts/run-component-lifecycle-screen.mjs` now report harvest, conservation, migration, and arrival income/cost/overflow/deferred-food balances. This is instrumentation only; it does not change ecology.

| Mean per completed episode, 500 ticks / two seeds | Control | Lifecycle policy |
| --- | ---: | ---: |
| Harvest net balance | -0.59 | -25.17 |
| Migration income | 98.92 | 129.71 |
| Migration expenses | 151.94 | **197.78** |
| Migration net balance | -61.75 | **-73.72** |
| Arrival net balance | -15.80 | **-25.36** |
| Conservation episodes observed | 0.0 | 1.0 |

This identifies the current bottleneck: purposeful migration increases gross intake but movement plus structural maintenance still costs more than it returns. The policy’s conservation state is rare because many components become energy-insecure by the time their gate is visibly depleted.

**Next valid experiment:** a bounded physical collective transport mechanism that reduces only the already-paid movement cost of a coherent migrating component. No new energy, food, gate output, or global sensing. Compare it against control using this exact phase ledger; success requires migration balance to improve without simply shifting loss into harvest or arrival.

## Migrating-component transport screen — promising, not yet replicated

Implemented experimental `collectiveWork.migrationTransport`. A strong bonded component receives a 0.40 movement multiplier only in explicit migration state with a locally available next gate. It is physically bounded and produces no energy; the canvas shows it with an amber dashed outer ring.

| Mean at 500 ticks, 2 seeds | Lifecycle only | Lifecycle + transport |
| --- | ---: | ---: |
| Strong facets | 94.0 | **140.5** |
| Bonds | 155.5 | **199.5** |
| Population | 107.5 | **120.0** |
| Whole-cycle energy delta | +12.86 | **+37.90** |
| Directed migration moves | 309.5 | 374.0 |
| Migration net balance | **-73.72** | -87.97 |
| Arrival net balance | -25.36 | **-13.60** |

Interpretation: more healthy components travel more often, so aggregate migration spending rises. But retained whole-cycle energy and arrival condition improve materially. Estimated migration expense per directed move falls from ~0.64 to ~0.58. Transport is promising, but it is not yet enough to make travel net-positive.

The attempted 1,000-tick transport run was stopped after exceeding the local execution window as the world became dense; do not cite it as a result. Keep the toggle disabled. Next add explicit transport-active distance/move/cost telemetry, then run a completed longer replication. Success requires lower migration loss per distance and improved persistence, not just a short-horizon facet bloom.

## Next research phase — collective identity longitudinal analysis

### Why this is next

The recent live world shows multiple dense, long-looking bonded colonies. Phase 16 established that dark heatmap regions are generally farther from gates while retaining more food: the world now distinguishes ordinary foraging territory from productive structural-work territory. The next question is no longer merely whether facets form or migrate.

> Does a structural collective have a lifetime longer than the individual organisms that compose it?

If organisms can die, offspring can join, bonds can turn over, and the same recognizable collective can still migrate, exploit gates, and persist, then the relevant evolutionary unit may be a collective rather than only an individual genome.

### Scope rule

This phase is **instrumentation only**. Do not add primes, food, resources, gate mechanics, reproduction rules, neural networks, or new ecological rewards. The immediate goal is to measure collective continuity honestly.

### Required implementation: collective lineage tracker

Add server-side tracking of a persistent `collectiveLineage` entity across snapshots. Do **not** equate a lineage with a single instantaneous bond-group ID, because groups can gain/lose members and alter bonds.

At a bounded snapshot cadence, derive each candidate collective from bonded components containing at least one strong closed facet. Match candidates to prior collective lineages using explicit, inspectable continuity evidence:

1. member overlap (including direct descendants where lineage identity is available);
2. bond overlap;
3. facet/topology overlap;
4. spatial proximity / centroid continuity.

Use conservative thresholds. Record uncertainty rather than forcing a match. Explicitly represent:

- birth;
- continuation;
- split;
- merge;
- death / disappearance;
- uncertain match.

### Stage 1 complete — instantaneous collective census (2026-08-10)

Implemented the first, audit-only layer as `collectiveWork.collectiveCensus`. Every 20 ticks it records every bonded component that contains at least one strong facet. The snapshot exposes a bounded recent census; `scripts/run-collective-census-screen.mjs` runs an offline check.

Each census record includes the raw member IDs, member/bond/facet counts, bond density, cycle rank, bridge bonds, articulation points, leaves, branch points, maximum degree, graph diameter, mean shortest path, centroid, spatial extent, elongation, energy, bond/facet reserve, lifecycle state, transport-active members, assigned gates, and nearest-gate distance. These are descriptive measurements only; no morphology label has ecological force.

First 250-tick audit, seed `160103`, demonstrates that the census distinguishes meaningful topologies:

- a 12-member dense component: 40 bonds, 19 strong facets, cycle rank 29, zero bridge bonds, graph diameter 3;
- a 4-member triangle-plus-appendage: 4 bonds, one strong facet, one bridge bond, one articulation point;
- a compact 3-member facet: 3 bonds, one triangle, zero bridges, graph diameter 1.

This validates the measurement substrate. **Next implementation step:** conservative matching of consecutive census records into collective-lineage candidates; do not add ecological behavior or morphology-specific tuning.

### Stage 2 complete — conservative collective lineage matching (2026-08-10)

Implemented `collectiveWork.collectiveLineageTracking` on top of consecutive census samples. A continuation requires conservative evidence from exact-member and direct parent→child replacement, with bond overlap, strong-facet overlap, and centroid proximity as corroboration. A score of at least `0.62` and member continuity of at least `0.50` are required.

The tracker deliberately refuses to force identity through ambiguity. Candidate split and merge evidence becomes `split-ambiguous`, `merge-ambiguous`, or `uncertain-birth` events; only one-to-one qualifying matches continue a lineage. Each lineage records founding/current members, maximum size/bonds/facets, turnover, direct-descendant recruits, topology changes, distance travelled, migration transitions, observed gate assignments, founder survival, and bounded recent history.

Initial 250-tick audit, seed `160103`:

- collective lineage 1 persisted from tick 100 to 240 (150 ticks; 8 samples);
- it changed membership 28 times, recruited 12 direct descendants, changed topology 7 times, and entered migration 3 times;
- it travelled 30.9 cells, reached maximum size 20, maximum 74 bonds, and maximum 130 strong facets;
- four founders were still alive at the final sample, so this is **not** evidence that the collective outlived its founders.

This validates matching mechanics, not the central biological claim. **Next research action:** run replicated longer, fixed-seed longitudinal screens and report the fraction of lineages persisting after all founding members have died, together with ambiguous split/merge rates.

### Per-collective longitudinal record

For each collective lineage, store a time series and final summary containing:

- collective ID, birth tick, end tick, lifetime;
- current / maximum population;
- original member IDs, retained founding members, member turnover, member deaths, recruits, offspring;
- bond count, facet count, topology signature and topology-change rate;
- gates approached, visited, completed, and field harvests;
- ordinary food harvested, gate food harvested, food captured by competitors where attributable;
- distance travelled, directed migration moves, migration events;
- component energy start/end, phase-resolved surplus/deficit, reserve estimates;
- structural births and autonomous births if enabled in future;
- centroid/path history at a bounded cadence;
- whether the collective persists after every founding member has died.

### Primary analyses

Run replicated fixed-seed worlds and report:

1. distribution of collective lifetimes;
2. fraction of collectives outliving their median member lifetime;
3. fraction persisting after zero founding members remain;
4. member, bond, and facet turnover versus collective continuity;
5. topology persistence / change rate;
6. gate productivity, energy balance, and migration cost for persistent vs transient collectives;
7. split/merge frequency and uncertainty rate.

### Success criterion

The phase succeeds if the system can make a defensible statement such as:

> “Some bonded collectives persisted across multiple gate cycles and substantial member turnover; their continuation cannot be explained merely by an unchanged set of individuals.”

This is not a claim of intelligence. It is evidence for a candidate **persistent collective organism**, the necessary substrate for later collective specialization, memory, computation, and adaptive problem solving.

### Important caveat

The present live canvas is suggestive but not proof. Never infer collective identity from visual similarity alone. Preserve raw continuity evidence, thresholds, and uncertain cases so researchers can audit every asserted lineage.

## Morphology analysis — required within the collective tracker

The tracker must describe morphology as measured structure, not as a visual label. Do not hard-code conclusions such as “mesh means durable.” For every tracked collective at each sampling point, compute at minimum:

- member count; bond count; facet count; bond density;
- connected-component diameter and mean shortest-path length;
- articulation points / bridge-bond count (fragility of chains);
- cycle and triangle density (redundancy / facet richness);
- maximum member degree, leaf fraction, and branch-point count;
- spatial extent, centroid, perimeter proxy, and directional elongation;
- reserve held, maintenance cost, migration cost per distance, food/gate income, and survival under member/bond loss.

Test these observations rather than assuming them:

| Morphology hypothesis | Required evidence |
| --- | --- |
| Dense mesh is durable but expensive | Greater survival after bond/member loss **and** higher maintenance per tick |
| Long chain is mobile/exploratory | Greater distance or gate discovery per member **and** more bridge-related fragmentation |
| Triangle-rich structure retains resources | Higher accessible reserve / positive cycle balance after controlling for size |
| Branched network covers territory | Greater spatial extent or gate detection **and** a measured coordination/maintenance cost |
| Small compact facet is efficient but fragile | Lower cost and fast gate completion **but** lower reserve/redundancy survival |
| Large compound is stable but slow/scarcity-vulnerable | Higher disruption survival **but** higher migration cost per distance or food requirement |

Only after the longitudinal data establishes a missing but theoretically justified trade-off should a narrow physical rule be considered. The first task is correlation and causal comparison, not morphology-specific tuning.

## Useful commands

```powershell
npm test
node scripts/run-gate-logistics.mjs
node scripts/run-structural-organization.mjs
node scripts/run-gate-field-capture-diagnosis.mjs
node server/index.js
```

`run-gate-logistics.mjs` compares navigation and gate-contract conditions. `run-structural-organization.mjs` measures strong triangles versus distinct bonded structural groups. Both use seeds `160103`–`160105`.

## Repository state

The worktree contains substantial uncommitted Phase 16 and earlier work. Preserve unrelated changes; inspect `git status --short` before staging or committing. The current session has passed `npm test` after the recent gate, commitment, and finite-stock changes.
### Replicated 500-tick collective-lineage baseline (2026-08-10)

The conservative tracker was screened on two fixed seeds:

| Seed | Candidate lineages | Longest lifetime | Max members | Turnover | Direct descendant recruits | Topology changes | Migration events |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 160103 | 12 | 240 ticks | 17 | 18 | 8 | 11 | 3 |
| 160104 | 9 | 260 ticks | 14 | 12 | 4 | 9 | 3 |

No lineage yet persisted through complete founder loss. Treat this as the
current scientific boundary: component-scale continuity has been measured;
founder-independent collective persistence has not yet been demonstrated.
### Scalable headless lineage-batch protocol and first 2,000-tick results (2026-08-10)

Implemented `scripts/run-collective-lineage-batch.mjs`.

- It runs without the browser server or canvas-only marker/trail work.
- It leaves ecology, gate mechanics, bonding, reproduction, and energy rules unchanged.
- It uses `collectiveCensus.detailLevel = "lightweight"` at a configurable coarse cadence, with compact checkpoints written to `research-results/`.
- Engine optimization: bond connected components are cached between bond updates; BFS no longer uses `Array.shift()`.

Verified two 2,000-tick isolated seeds:

| Seed | Final pop. | Candidate lineages | Longest | Result |
| --- | ---: | ---: | ---: | --- |
| 160103 | 264 | 29 | 400 ticks | Dynamic turnover/migration, no full-founder replacement |
| 160104 | 8 | 15 | 500 ticks | Gate-visiting collective followed by ecosystem collapse, no full-founder replacement |

Research conclusion: the pipeline is now scalable enough for replicated long-horizon lineage work. The next question is no longer whether components can persist and reorganize; it is what prevents a component from maintaining identity once its founders are fully replaced.
### Headless batch parity validation (2026-08-10)

Added `scripts/check-headless-batch-parity.mjs`. At seed 160103 for 500 ticks
and a shared 20-tick census cadence, normal and headless/lightweight observation
matched exactly on population, births, deaths, bonds, strong facets, gate work,
and lineage counts. The batch mode is therefore validated as an observer-only
optimization.

This clears the prerequisite for Phase 17 morphology work. Recommended first
morphology stage: observation and classification before assigning any new
morphology-specific benefit/cost contracts.
