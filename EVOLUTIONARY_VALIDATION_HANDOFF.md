# Evolutionary Validation Handoff

Date: 2026-08-03

## Purpose

Project Genesis has reached the point where the primary question is no longer whether a capability can be implemented. The question is whether ecological conditions select for that capability.

The long-term direction is described in the LinkedIn article, [Project Genesis - A World Written in Prime Numbers](https://www.linkedin.com/pulse/project-genesis-world-written-prime-numbers-ataul-mukit-sddjf/): use prime-factorized, interpretable genomes to explore the emergence of resilient organizations, distributed computation, and adaptive system architectures.

## Current State

- World recipe: `85470 = 2 x 3 x 5 x 7 x 11 x 37`.
- Structural founder genome: `27335490 = 2 x 3 x 5 x 7 x 13 x 17 x 19 x 31`.
- Prime 31 is structural coupling: generated Bind activity, bonds, facets, topology-aware birth seeds, collective navigation, and one-hop distributed state.
- Facets now own harvest-derived structural capital. The capital is not individual energy or ordinary bond reserve. It can only seed two inherited bonds for a local Prime-31 child.
- Prime 13 remains present in the winning non-structural lineage; the current collapse was specifically selection against Prime 31, not against persistence.

## Key Observation

In the unrestricted live baseline at approximately 394 simulation seconds:

- Population: 470.
- Food units: 251.
- Mean organism energy: 170.2.
- Active bonds and facets: 0.
- Bonds formed and broken: 4,076 / 4,076.
- Facet-funded births: 396.
- Prime-31 carriers: 2 / 470.
- Dominant genome: `881790 = 2 x 3 x 5 x 7 x 13 x 17 x 19`.

The dominant genome is exactly founder genome `27335490 / 31`. This rules out a simple "food ran out" explanation: food and organism energy remained positive while coupling disappeared.

## Diagnostic Experiment

A population-bounded, single-seed screen ran for 500 ticks using:

- Founder genome `27335490`.
- Seed `314233858`.
- Initial population 72.
- Mutation rate 0.02, intentionally elevated to accelerate a diagnostic screen.
- Food target density 0.22 and growth rate 0.45.
- Habitat reproduction fraction 0.05, used only to cap runtime population.

Results:

| Condition | Prime-31 carriers | Active bonds | Peak bonds | Facet births |
| --- | ---: | ---: | ---: | ---: |
| Coupling maintenance 0.10 | 52 / 196 (26.5%) | 76 | 337 | 71 |
| Coupling maintenance 0.02 | 103 / 194 (53.1%) | 138 | 435 | 136 |

Interpretation: lowering the private maintenance cost substantially improves Prime-31 retention and structural activity. This is a diagnostic, not a publishable result: it used one seed and modified population and mutation settings for runtime control. Both conditions exhausted visible food by the final tick.

## Why Bonds Collapse

1. Prime 31 has direct private costs: coupling maintenance, meal allocation to bond reserves, and collective movement constraints.
2. A `divide by 31` mutation keeps all other founder capabilities while escaping those costs.
3. Facet capital is bound to an exact closed triangle and disappears when that topology breaks; its benefit is therefore intermittent and fragile.
4. Bonds require adjacency and continued generated Bind activity. Death, separation, or loss of binding causes strength decay and eventual breakage.
5. When Prime-31 carriers become rare, three-member structures are difficult to form. This is a frequency-dependent (Allee-effect-like) collapse.
6. The current ecology gives independent organisms enough reproductive success that no topology-level advantage offsets the individual cost.

This is an evolutionary result, not evidence that the bond system is broken.

## Phase 14.5 Implementation (2026-08-04)

Completed:

- Replaced the quadratic candidate-pair scan with a wrapping-aware spatial hash in `Simulation.updateBonds()`. Regression checks cover local pairs, edge wrapping, and inherited structural-seed maturation.
- Added a cooperative server-side batch runner with matched seeds across scenarios. It advances in small chunks so the live simulation and API remain responsive.
- Added the separate Evolution Lab UI panel and API endpoints at `/api/experiments`.
- Added compact aggregate history at `data/experiment-history.json`, ignored by Git and pruned before 100 MB.
- Recorded periodic samples for population, food, energy, Prime-31 frequency, bonds, facets, facet capital, age, generation, facet births, and grouped bond-break causes.

The initial default three-seed, 500-tick screen completed successfully. Its aggregate values are exploratory, not final evidence: the bounded experiment configuration intentionally uses mutation rate 0.02 and a habitat fraction of 0.05 to make selection observable within practical runtime.

## Exact Next Task

Use the Evolution Lab results to define a preregistered comparison matrix, then run larger replicated batches without changing organism biology. The runner currently supports:

- Runs deterministic seeds without rendering.
- Stores only aggregate run records and periodic samples, with a hard 100 MB limit.
- Records world recipe, founder genome, settings, seed, population, food, energy, Prime-31 frequency, bond count, facet count, facet capital, bond break causes, and lineage longevity.
- Baseline.
- Low coupling cost.
- High facet return.
- Combined low cost and high return.

First compare matched seeds at longer durations (for example, 1,000 ticks) and report confidence intervals or distributions, not only means. Then decide whether Prime 31 needs a genuine topology-only ecological advantage, such as a resource transformation or delayed payoff that an individual cannot exploit.

## Decision Rule Before New Biology

Do not add Sun, Seasons, Prime 23, Prime 29, or a rescue mechanism for bonds before replicated measurements exist. First determine whether structural coupling is favored by:

- Lower private cost.
- A real topology-only ecological advantage.
- Resource patchiness and local depletion.
- Delayed consequences that make distributed state useful.
- A topology-level reproductive event that produces more structural descendants without making bonds immortal.

## Replicated Cost/Return Follow-up (2026-08-04)

An eight-seed, 1,000-tick matched comparison completed after the initial three-seed screen. It used the same bounded diagnostic configuration and compared baseline, low coupling cost, high facet return, and their combination. Final mean Prime-31 frequencies were 58.6%, 42.1%, 38.9%, and 36.2% respectively. Every condition remained highly seed-sensitive, and none reliably resolved structural collapse. The earlier 500-tick improvement from lower maintenance was therefore transient rather than a stable selection result.

This permits one new world-level ecological test without adding a new organism prime: the delayed structural refinery. Red food is low-energy catalytic material. Prime-37 detritus and ash are existing recoverable material. A strong closed Prime-31 facet retains red catalyst and must sustain normal local contact with a material-rich patch for twelve ticks; if it succeeds, the world spends one catalyst, consumes that material, restores local fertility, adds nutrients, releases ordinary local food when the patch is empty, and earns one bounded structural nursery credit. No direct organism energy is created, and a lost bond resets progress.

The next comparison must isolate this refinery from the prior knobs: baseline versus refinery enabled, with matched seeds and 1,000-tick replicated runs. Record final Prime-31 frequency, bonds, facets, refinery conversions, refinery food released, nutrients recovered, lineage longevity, and extinctions. Do not combine it with lower coupling cost or increased facet return in its first test.

## First Delayed Refinery Screen (2026-08-04)

The first matched three-seed, 1,000-tick screen completed. The baseline finished with mean Prime-31 frequency 66.7%, 200.7 bonds, and one extinction. The delayed-refinery condition completed real work—24.0 mean conversions and 23.7 mean food units released—but finished with 38.4% Prime-31 frequency, 75.3 bonds, and no extinctions. This is a small exploratory screen, not evidence that the refinery harms structure; it does show that the initial sparse public-goods implementation is insufficient to solve the selection problem.

The initial public-goods refinery was not sufficient. The current iteration makes red catalytic rather than high-energy and turns a completed restoration into a bounded, topology-owned nursery credit. This gives the existing Prime-17, Prime-19, Prime-13, and Prime-31 combination an ecological loop: locate red, retain it structurally, complete delayed local restoration, then reproduce locally with inherited bond seeds. Verify this revised mechanism with short deterministic smoke simulations before beginning a new replicated selection screen.

### Ten-second mechanism smoke checks

Three deterministic 50-tick (ten-second at the five-tick-per-second server rate) simulations completed after the red-catalyst change. They produced 116–156 active bonds, 78–112 facets, and retained 7–20 red catalysts per run. No full restoration occurred in that short horizon, as expected: restoration additionally requires a catalyst, material-rich detritus/ash patch, and twelve uninterrupted maintained ticks. The deterministic regression test separately seeds that full precondition and verifies one conversion. These checks validate wiring and timing only; they are not an evolutionary result.

### Navigation and turnover adjustment

Global reproduction opportunity is reduced from 35% to 16%, preventing rapid population turnover from overwhelming delayed ecological processes. Normal individual reproduction remains available. Existing Prime-17 directional sensing now has inspectable structural context: a strong catalyst-poor facet values nearby red food; a catalyst-loaded facet values nearby detritus or ash. This creates the intended collective loop—seek red, seek material, restore habitat, then use earned nursery credit—without adding a new organism prime or directly commanding movement.

### Symmetric capability reachability

Mutation now treats the exponent-map genome as a connected arithmetic search space. Any missing implemented organism prime (2, 3, 5, 7, 11, 13, 17, 19, or 31) may be gained; present primes may be lost, and 3/5/7 retain bounded strengthening. Prime 31 can therefore reappear through the same general rule as every other capability, rather than through a special rescue mechanism. This makes future invasion and recovery experiments meaningful after complete structural loss.

## Niche-dependence screen (2026-08-04)

Implemented an open-world, four-condition ecology screen: abundant background food, intermediate background food, scarce food with maintained facet niches, and a scarce matched control with maintenance disabled. All conditions begin with 50% Prime-31 founders and otherwise share seed, population, chemistry, mutation, and reproduction settings. A completed refinery restoration creates an engineered-fertility gradient. It decays without upkeep; a maintained strong facet receives a bounded number of preferential local primary-production attempts. The mechanism creates ordinary food only, never direct organism energy.

The first valid three-seed, 500-tick batch produced the following final means:

| Condition | Prime-31 frequency | Bonds | Facets | Refinery conversions | Active gradient cells | Prime-31 extinctions |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Abundant | 11.8% | 26.0 | 13.7 | 2.0 | 28.0 | 0 / 3 |
| Intermediate | 8.1% | 19.0 | 23.3 | 1.3 | 16.3 | 0 / 3 |
| Scarce, maintained | 11.8% | 0.3 | 0.0 | 0.3 | 8.3 | 0 / 3 |
| Scarce, maintenance disabled | 12.0% | 0.7 | 0.0 | 0.3 | 0.0 | 0 / 3 |

Interpretation: the maintained environmental state is wired and observable—the scarce maintained condition has gradients while the matched control has none—but it has not yet increased final structural retention by tick 500. The likely bottleneck is establishment timing: scarce structural groups often collapse before completing enough refinery restorations. Do not claim that niche maintenance is necessary yet.

Next clean intervention: lower the **first** restoration delay for a newly formed facet-niche only, while retaining the 12-tick delay for later conversions. Re-run the same matched matrix. This tests the establishment bottleneck directly without changing terrain, coupling cost, or the public nature of food.

## Collective-work implementation (2026-08-04)

Added visible consensus gates as a separate collective-work layer. Gates have three colored ports and cycle through observe, respond, and cooldown states. During observation a nearby Prime-19 organism receives one of three local signal fragments; Prime 13 can retain that input, and Prime 31 exposes the retained state over direct bonds. A strong facet whose members all have Prime 13, 19, and 31 must remain at the same gate and converge on the observed shared state for three response ticks. Success releases three ordinary food units near the gate and is reported in live telemetry. No direct energy transfer occurs.

This is a problem-solving substrate, not evidence of evolved intelligence. The next validation is a deterministic mechanism smoke test followed by matched gate-enabled/gate-disabled selection batches. Report completions, food released, structural retention, and the distribution of gate attendance—not merely whether food appeared.

## First consensus-gate selection screen (2026-08-04)

The initial three-seed, 500-tick gate-enabled/gate-disabled comparison exposed a task-definition issue: facets attended gates (10.7 mean attendances) but completed none. The original rule mistakenly required exact recall of a continuously changing floating-point state. This was corrected before the valid screen: a gate now tests a shared state **band** over two consecutive response ticks, which is the intended consensus operation.

The corrected, matched three-seed, 500-tick screen used 50% Prime-31 founders, 10 gates, moderate food scarcity, and no refinery/niche maintenance in either arm. Final means were:

| Condition | Population | Highest generation | Prime-31 carriers | Bonds | Facets | Gate attendance | Gate completions | Gate food |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Gates enabled | 156.7 | 5.3 | 29.3 | 10.7 | 5.3 | 12.7 | 8.7 | 26.0 |
| Gates disabled | 61.3 | 1.0 | 25.7 | 11.3 | 3.7 | 0 | 0 | 0 |

Interpretation: the task is now functionally coupled to survival and turnover. Gate-enabled worlds completed work in all three runs (4, 14, and 8 completions) and sustained a much larger, reproducing population than the matched gate-disabled control. This is evidence that collective work can generate an ecological advantage. It is **not yet evidence that Prime 31 is selected for**: final Prime-31 frequencies were 18.7% versus 41.7%, partly because the gate condition supports a much larger population. The next experiment must use longer replicated runs and report absolute carrier counts, frequency, lineage duration, and successful-gate ancestry before claiming selection for collective computation.

### Long-horizon confirmation

The same three matched seeds were continued to 1,000 ticks. The result is strong and asymmetric:

| Condition | Population | Highest generation | Prime-31 carriers | Bonds | Gate completions | Prime-31 extinctions |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Gates enabled | 158.3 | 8.7 | 2.7 | 0 | 8.7 | 0 / 3 |
| Gates disabled | 0 | 0 | 0 | 0 | 0 | 3 / 3 |

All gate-disabled worlds went extinct. Gate work therefore supplies a genuine survival-critical energy route in this configuration. However, gate completions occurred early (the same 8.7 mean completions already present at tick 500), after which structural lineages largely disappeared while non-structural descendants persisted on the released food. This identifies the current public-goods weakness precisely: a one-off gate reward can bootstrap an ecosystem but does not require its later generations to continue maintaining the computational structure.

Next intervention: make gate output a **short-lived local energy channel** rather than a one-time food cache. The channel should require continued successful consensus to remain active, decay rapidly when the responsible facet dissolves, and provide ordinary food only within its maintained gate field. Then compare the same matched gate-enabled and gate-disabled conditions, plus a gate-output-persistence control. This tests whether ongoing work—not merely ancestral work—is necessary for the thriving ecosystem.

## Renewable gate-field screen (2026-08-04)

Implemented the proposed local production field. A successful gate no longer releases a three-food cache. Instead it activates a green visible field that decays by 0.035 per tick, accumulates bounded ordinary-food production locally, and is refreshed only by another completed consensus. A nearby strong facet now gives that field a high existing Prime-17 local opportunity score. A controlled mechanism check verified field activation, local food production, and gate-field sensing.

The matched three-seed, 1,000-tick screen remained survival-positive but did **not** solve structural retention:

| Condition | Population | Highest generation | Prime-31 carriers | Gate attendance | Gate completions | Field food | Prime-31 extinctions |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Renewable gates enabled | 134.3 | 7.3 | 1.0 | 24.3 | 17.7 | 24.3 | 2 / 3 |
| Gates disabled | 0 | 0 | 0 | 0 | 0 | 0 | 3 / 3 |

Completion timing matters: per-seed completions were 17→17, 13→17, and 19→19 from tick 500 to tick 1,000. Therefore renewal works mechanically, but most fields still stop being renewed after early structural collapse. Gate-enabled ecology is necessary for population survival; the topology that performs the work is not yet reliably retained.

Next causal question: after a field is active, can non-members take most of its food while the responsible facet continues paying coupling costs? Add lineage-resolved harvesting telemetry for gate-field food before changing rewards. If free-riding is confirmed, the clean intervention is not private energy: make active gate production spatially coupled to the maintained facet (for example, food production occurs in the three facet-adjacent work ports and ceases immediately if the responsible facet leaves), while remaining visible ordinary food and accessible to local competitors.

### Gate-field diagnostic (2026-08-04)

A direct internal mechanism test found two concrete failures in the first gate-field implementation.

1. An isolated fully charged field produces only **two** food units before decay. This is less visible and less useful than the previous three-unit cache, despite being intended as a sustained reward.
2. The active-field sensor assigns the same value (1.8) to every one of the eight neighboring Prime-17 directions while a facet is inside the field. Its generated cardinal scores are therefore all tied at 1.8. The rule also runs before ordinary-food sensing, so it masks rather than guides the facet toward food produced in the field.

The live server had reached population 0, bonds 0, and facets 0 at the time of this check, despite five prior gate completions and seven field-food units. Short matched default-world runs still form many facets—gate-enabled peaks were 33–148 facets versus 5–10 without gates—but those peaks are volatile and collapse after early growth. The absence of visible facets in the live view is therefore real, not merely a canvas issue.

Do not interpret the first field result as successful local harvesting. Before another selection screen, replace the flat field score with a distance gradient that augments (never replaces) ordinary-food opportunity, and increase the bounded field production rate enough for a maintained field to create visibly harvestable local food. Add telemetry that records which lineage harvests each gate-field food unit.

## Directional field and harvest-attribution repair (2026-08-04)

Implemented the diagnostic repair before the next experiment:

- Gate-field opportunity now falls with distance from the gate and is **added to**, rather than substituted for, ordinary food opportunity.
- Field production increased from an isolated total of 2 food units to 4 bounded units before decay.
- Every field-produced food tile records its gate and responsible facet key.
- Organisms now carry inherited founder-lineage IDs. Live snapshots and experiment records distinguish gate-field harvests by the responsible facet from harvests by other local lineages.

Mechanism tests passed: at an off-centre position the direction toward the gate scored 1.04, while a farther direction containing ordinary field food scored 1.63; a produced food tile retained `{ type: gate-field, gateId, facetKey }` provenance.

The repaired three-seed screens produced:

| Horizon / condition | Population | Bonds | Facets | Gate completions | Field food | Worker harvests | Competitor harvests |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500 ticks, gates enabled | 165.7 | 20.7 | 12.3 | 66.3 | 155.0 | 27.7 | 124.7 |
| 500 ticks, gates disabled | 61.3 | 11.3 | 3.7 | 0 | 0 | 0 | 0 |
| 1,000 ticks, gates enabled | 161.0 | 0 | 0 | 84.7 | 201.0 | 41.3 | 157.3 |
| 1,000 ticks, gates disabled | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Interpretation: the corrected field produces a robust early structural phase and makes continuous collective work clearly survival-critical. It does **not** retain facets through the later ecosystem: roughly 79% of field-food harvests are by competitors rather than the responsible facet, and mean final active bonds/facets are zero at tick 1,000. This is now measured free-riding, not speculation.

Next intervention should preserve public visibility and competition without returning to direct private energy: bind each active field to the responsible facet’s three visible work ports. Produce food in those ports only while that exact facet remains locally present; stop production immediately when it leaves or dissolves. Other organisms may still contest those nearby tiles, but cannot harvest a long-lived diffuse output after the workers disappear. Compare port-coupled fields with the current diffuse field using the same lineage-harvest telemetry.

## Mobile courier layer (2026-08-04)

Added an enabled-by-default, user-switchable courier layer. Loose high-energy organisms with Prime 19 and Prime 13 can record one finite observation of nearby GREEN, BLUE, RED, or GATE coordinates. A report is visibly ring-coloured by type. When such a scout comes within bond adjacency of a bonded compound, the compound receives a short-lived memory; its existing Prime-17 directional inputs receive an additive distance gradient toward the reported coordinate. Couriers do not send actions, grant energy, or overwrite food sensing.

A deterministic 250-tick smoke test produced 156 finite reports, 11 compound handoffs, 9 active scouts, and 16 informed bonded members. Disabling the toggle cleared all reports and memories. The initial implementation was corrected after it produced 1,716 report rewrites in the same horizon; each scout now carries one report until expiration rather than rewriting it every tick. The lab now includes matched gate-with-couriers, gate-without-couriers, and gate-disabled conditions, with report and handoff counts in aggregate results.

### First courier comparison

The first matched three-seed, 500-tick screen was negative for the current courier rule:

| Condition | Population | Bonds | Facets | Gate completions | Courier reports | Courier handoffs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Gates with couriers | 161.7 | 5.3 | 1.3 | 31.0 | 1,987.7 | 889.7 |
| Gates without couriers | 165.7 | 20.7 | 12.3 | 66.3 | 0 | 0 |
| Gates disabled | 64.7 | 22.3 | 14.3 | 0 | 1,077.7 | 439.3 |

The toggle and data path work, but the current broad courier channel is too noisy: offspring create many finite reports and compounds receive conflicting target locations. Gates with couriers complete less than half as much work and retain far fewer facets than the matched no-courier arm. Do not claim a courier advantage.

Next refinement should be an information-quality experiment, not a reward change: give each bonded compound one bounded report slot, accept only a newer or nearer report, and make gate reports outrank ordinary food reports while a field is inactive. Retain the courier-off control. This will test whether scarce, prioritized information helps structures instead of continuously redirecting them.

### Scarce-prioritized courier repair

Implemented the information-quality refinement. At most three highest-energy loose Prime-19/13 organisms may carry reports; a global six-tick interval limits report creation; a courier pays a small handoff cost; only a compound containing a closed facet accepts a report; and each compound accepts one memory slot, replacing it only with a higher-priority gate report, a meaningfully nearer equal-priority report, or after memory is near expiry. Courier directional cues apply only to facet members.

The deterministic 250-tick check now produces 42 reports, one handoff, at most three active scouts, 16 bonds, and two facets. The repaired matched three-seed, 500-tick screen shows that the catastrophic conflict is resolved but couriers are not yet a net advantage:

| Condition | Bonds | Facets | Gate completions | Courier reports | Handoffs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Gates with scarce couriers | 15.3 | 8.0 | 57.7 | 83.0 | 6.3 |
| Gates without couriers | 20.7 | 12.3 | 66.3 | 0 | 0 |

This is a successful stability repair: the old courier rule had 5.3 bonds, 1.3 facets, 31 completions, 1,987.7 reports, and 889.7 handoffs. The scarce rule removes that collapse. However, it remains mildly selection-negative relative to no courier; keep it enabled as a controlled feature only while measuring its informational payoff. The next question is whether reports should be restricted to otherwise-unobservable gate states rather than food coordinates that Prime-17 can already discover locally.

### Live courier regression observation

After the courier layer was enabled in the live default world, a check at simulation time 178 found population 8, Prime-31 carriers 8, bonds 0, facets 0, 393 reports, 40 handoffs, and six gate completions. The sparse structural display is therefore a real ecological regression, not a rendering issue. It agrees with the matched screen: report creation has no meaningful scarcity after reproduction, and compounds can receive incompatible global directional cues. Keep the courier layer switchable, but do not use its current default-on behavior as a structural baseline.

### Gate-state-only couriers (2026-08-04)

Couriers are now **disabled by default** and have a strictly informational role when enabled. A scarce high-energy loose Prime-19/13 scout can report only a nearby inactive gate in its actionable `observe` phase (`GATE_READY`); it cannot report green, blue, red, or gate-field food. This makes a report about an opportunity that a distant facet cannot infer from its own local Prime-17 sensing. The existing one-slot, priority, finite-memory, and facet-only handoff rules remain in force.

A deterministic check with ten seeded inactive gates and couriers explicitly enabled generated 23 finite reports and three facet-compound handoffs, all `GATE_READY`. With the default setting, an 80-tick check generated zero reports. The next matched screen compares this gate-state-only channel against the courier-off control; it should be retained only if it improves maintained gate work or structural persistence without recreating the former target-conflict collapse.

The matched three-seed, 500-tick screen supports retaining this constrained channel as an optional experiment:

| Condition | Bonds | Facets | Gate completions | Courier reports | Handoffs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Gates with gate-state-only couriers | 23.7 | 19.7 | 71.3 | 44.7 | 4.7 |
| Gates without couriers | 20.7 | 12.3 | 66.3 | 0 | 0 |
| Consensus gates disabled | 11.3 | 3.7 | 0 | 0 | 0 |

All gate-enabled replicates persisted to tick 500. This is a small deterministic screen, not a final selection claim, but it is the first courier variant to improve the measured structural outcomes over the matched courier-off control. Food remains absent from the message channel, so the apparent benefit is consistent with communicating a distant, transient gate opportunity rather than duplicating locally available resource sensing. Replicate at longer horizons and with more seed blocks before making it part of the ecological baseline; keep the default off until then.

## Facet-port-coupled production screen (2026-08-05)

The diffuse gate field was directly changed into a port-coupled physical production system. On a completed consensus, the gate creates one ordinary food unit immediately and continues gradual production only at the three cells occupied by the responsible closed facet. Those cells receive visible green rings on the canvas. The field stops on the first tick that the exact facet leaves the gate radius or dissolves. Food is still ordinary, visible, and contestable; no energy is transferred to organisms.

Two short implementation variants were screened before the valid comparison. Fixed cells near a gate made the condition too austere (13.3 food units versus 46.3 diffuse) and did not place output where the working bodies could use it. An immediate first unit improved output but still let most food be collected after the workers had moved. The final mechanism binds each active port to the current cell of one member of the exact responsible facet.

The matched three-seed, 500-tick comparison (seeds 114229–114231; couriers off; refinery/niche layer off) gives a clear ownership result:

| Condition | Bonds | Facets | Gate completions | Field food | Worker harvests | Competitor harvests | Worker share |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Port-coupled active facet ports | 12.7 | 3.7 | 16.0 | 45.0 | 29.3 | 15.7 | 65% |
| Diffuse gate field | 23.3 | 13.3 | 21.0 | 46.3 | 11.7 | 34.3 | 25% |
| Gates disabled | 17.7 | 3.7 | 0 | 0 | 0 | 0 | — |

This solves the measured public-goods failure: the workers, rather than nearby competitors, now receive most task-produced food while output remains physical and public. It does **not** yet establish a thriving structural ecology: port-coupled facets still end with fewer bonds and facets than diffuse fields. The remaining causal question is maintenance economics, not reward ownership. One port-coupled task output must reliably support three bodies, their bond reserve, and another consensus cycle; the next preregistered test should vary only the bounded port production rate while preserving the same three-body occupancy, immediate shutdown, and worker-versus-competitor telemetry.

### Port production-rate sweep (2026-08-05)

The promised calibration was run before changing any other ecological rule. Five matched conditions used three seeds (651203–651205), 500 ticks, 10 gates, 50% structural founders, couriers off, and refinery/niche maintenance off. Only `gatePortFoodRate` differed between the first three rows:

| Condition | Port rate | Bonds | Facets | Gate completions | Field food | Worker harvests | Competitor harvests |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Port-coupled, low | 0.36 | 19.0 | 8.7 | 46.0 | 125.3 | 54.3 | 71.0 |
| Port-coupled, medium | 0.60 | 25.7 | 21.7 | 34.3 | 148.3 | 36.3 | 110.7 |
| Port-coupled, high | 0.90 | **56.7** | **95.0** | 37.3 | **259.3** | 52.3 | 206.3 |
| Diffuse field control | — | 13.3 | 5.0 | 63.0 | 145.0 | 34.0 | 109.7 |
| Gates disabled | — | 15.3 | 4.0 | 0 | 0 | 0 | 0 |

This is the first tested condition with a large, sustained structural phase at tick 500: high port output produces 95 mean final facets, 56.7 bonds, 32.3 Prime-31 carriers, and 13.3 facet births. It provides enough visible physical food for the three-body work site to support repeated structure formation. The high field also produces overflow that competitors can harvest (206.3 units), so the result is not evidence of exclusive worker ownership; it is evidence that a contestable public output can nevertheless support its producers when the operating margin is high enough. `gatePortFoodRate: 0.9` is now the live default. The next validation is a longer-horizon replicated persistence screen, not further reward escalation.

## Facet-work spatial history visualization (2026-08-05)

Added a strictly observational canvas layer for long-horizon interpretation. Every tick, each member cell of a strong closed facet adds one bounded count to a persistent per-cell `facetWorkTrail` grid. The renderer displays the accumulated count as a faint logarithmic gold ground glow beneath food, gates, bonds, and organisms. It resets with the world and is never provided to organism sensing, movement, mutation, energy, reproduction, gate logic, or any other simulation rule.

This supports a 2,000-tick qualitative spatial readout of productive regions, migration corridors, repeated gate-work sites, and abandoned structural areas without changing the causal experiment. A regression test verifies that a strong facet marks its occupied cells; live snapshot verification confirms the serialized grid is 64 × 64.

## Phase 16 — Environmental Memory development screen (2026-08-05)

Implemented an independent server-owned environmental-memory layer. Every cell stores a bounded scalar in `[0, 1]`; writes are possible only through the Prime-41 generated graph effector and cost writer energy; reads are possible only through the Prime-43 generated graph sensor. The layer decays by `0.9995` per tick and diffuses synchronously by 1% to cardinal neighbors. It has no direct connection to food, energy gain, movement, reproduction, signals, gates, fertility, chemistry, bonds, or facets. Its blue-purple visual layer is user-switchable and independent of the observer-only facet-work heatmap.

Mechanism tests passed: empty state remains empty; writes clamp; diffusion is symmetric and mass-preserving before decay; Prime 41/43 generate the expected graph nodes; and a matched 20-tick null test with no 41/43 carriers gave identical living-organism trajectories with memory enabled and disabled.

The first matched development screen used three seeds (160100–160102), 500 ticks, high-output port-coupled gates, couriers off, 50% structural founders, and refinery/niche maintenance off. Mutation availability, rather than founder genomes, differed:

| Condition | Prime 41 carriers | Prime 43 carriers | Memory mean | Coverage | Largest region | Writes | Bonds | Facets |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Memory disabled | 0.0 | 0.0 | 0.000 | 0.0% | 0.0 | 0.0 | 14.7 | 8.0 |
| Write only | 0.7 | 0.0 | 0.002 | 1.4% | 6.3 | 67.7 | 7.0 | 3.7 |
| Read only | 0.0 | 0.7 | 0.000 | 0.0% | 0.0 | 0.0 | 7.7 | 3.7 |
| Read + write | 0.3 | 0.0 | 0.002 | 1.3% | 14.7 | 92.3 | 20.0 | 14.7 |

Interpretation: Phase 16 is mechanically active and produces persistent diffusing state when Prime 41 arises. There is no evidence yet that environmental memory is selected as a read/write computational substrate: Prime 43 did not persist at the 500-tick endpoint in the full condition, and this three-seed screen is too small for a selection claim. The read+write condition’s higher final facets is exploratory only because the corresponding read carrier count is zero at the endpoint. Next: run the preregistered longer selection screen with fresh seed blocks before changing decay, diffusion, write cost, graph wiring, or mutation rate.

### 2,000-tick single-seed trajectory

A fresh deterministic live-ecology trajectory (seed `160103`, standard founder genome, default 2% mutation, high port-coupled gates, environmental memory enabled) was run to 2,000 ticks as a spatial-history check. It is a single trajectory, not a selection screen:

| Tick | Population | Bonds | Facets | Gate completions | Prime 41 | Prime 43 | Memory mean | Trail cells |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 500 | 40 | 70 | 114 | 17 | 0 | 0 | 0.0000 | 919 |
| 1,000 | 12 | 1 | 0 | 49 | 0 | 0 | 0.0000 | 1,249 |
| 1,500 | 1 | 0 | 0 | 49 | 0 | 0 | 0.0000 | 1,347 |
| 2,000 | 0 | 0 | 0 | 49 | 0 | 0 | 0.0000 | 1,347 |

This makes the amber heatmap interpretable as a genuine historical record: 1,347 cells retain evidence of the early distributed structural phase even after the population is extinct. The trajectory also confirms the central current limitation. The present ecology can generate a large early facet bloom, but it did not sustain that bloom through 2,000 ticks in this seed. No 41/43 mutation appeared in the surviving lineages, so this run says nothing about environmental-memory selection beyond confirming that a zero-use layer remains neutral.

## Energetic Economics instrumentation (2026-08-05)

Implemented an observational energy ledger before making any ecological adjustment. The ledger records food income by source (ordinary food versus gate-work food); action costs (movement, genome/persistence maintenance, perception, bond coupling, memory writing, signals, and idle waiting); and two separate internal allocations (reproduction into an offspring and structural-bond seeding). It also records energy discarded when an organism reaches its finite storage ceiling, plus energy still held by an organism that dies. An allocation is intentionally not counted as energy destroyed. Deaths retain their immediate cause. Every 100 ticks, the simulation stores a bounded interval delta together with the physically present but unharvested food-energy stock.

The same deterministic seed `160103` was run for 1,000 ticks as an instrumentation check. This is one trajectory and is not a replicated causal result. At tick 1,000 it had 12 organisms. Cumulative harvested energy was 88,655 from ordinary food and 5,729 from gate-work food. Cumulative action costs were movement 26,635, maintenance 2,157, perception 3,196, bond coupling 1,493, memory 0, signals 25, and idle 15. Reproduction allocated 4,046.8 energy to offspring and structural seeding allocated 121.2; those are transfers, not losses. Death causes to tick 1,000 were 39 energy-exhaustion and 25 maximum-age deaths.

The crucial interval observation is qualitative rather than a conclusion: gate-work harvest was 1,695 in ticks 501–600, 60 in 601–700, 1,280 in 701–800, 536 in 801–900, and zero in 901–1,000, while population fell from 40 at tick 500 to 12 at tick 1,000. At the end, 14,740 energy-equivalent units of physical food remained in the world. This suggests an accessibility/organization problem may coexist with energy expenditure; it does not support the simplistic claim that the world simply ran out of food. Replicated 2,000-tick accounting runs are now the required next experiment.

### First replicated baseline and accounting correction

Three fresh 2,000-tick baseline trajectories (`160103`–`160105`) were then run with no parameter changes. All three had zero facets by tick 1,000. Their final populations were 0, 1, and 0; two were extinct by tick 2,000 and the remaining organism was unbonded. This makes structural collapse reproducible in this seed block, although three replicates remain a preliminary screen rather than a final estimate.

The initial ledger revealed a necessary correction before assigning cause: food energy is capped when an organism is already near its finite energy capacity. That discarded surplus had not previously been represented. After adding explicit overflow accounting, seed `160103` at tick 1,000 had harvested 94,384 total energy (88,655 ordinary food; 5,729 gate-work food), spent 33,522 in explicit action costs, allocated 4,047 to offspring, and discarded **56,484** at storage ceilings; 2,993 remained in organisms that subsequently died. The last 100-tick window still discarded 4,054 energy at capacity while no gate-work food was harvested and no reproduction occurred. Therefore the current evidence does not support an energy-shortage story. It points to a temporal and organizational mismatch: energy is abundant when individuals can store little of it, while later the collective structure needed to exploit gate output has already disappeared. This is a hypothesis, not yet a mechanism claim; the next experiment should test whether energy timing/storage/structural continuity, rather than total food quantity, predicts recovery.

### Storage-capacity mechanism screen (2026-08-06)

A new reproducible runner (`scripts/run-energetic-economics.mjs`) changes only the organism energy-storage multiplier; no food, gate, reproduction, mutation, or bonding rule changes. The intended 8-seed × 2,000-tick × three-condition batch was not accepted as evidence because high-capacity worlds became sufficiently dense to exceed the execution limit. This is an engineering constraint, not a biological result. A bounded one-seed, 500-tick mechanism screen (`160103`) completed:

| Capacity | Population | Bonds | Facets | Gate completions | Births | Overflow discarded | Reproductive allocation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1× baseline | 40 | 70 | 114 | 17 | 50 | 36,656 | 2,032 |
| 2× storage | 228 | 272 | 171 | 21 | 361 | 4,393 | 48,675 |
| 4× storage | 198 | 262 | 128 | 28 | 322 | 0 | 43,476 |

This is strong **mechanistic evidence**, not a persistence claim: reducing storage overflow causes a much larger reproductive and structural bloom within 500 ticks. It supports the idea that finite energy storage is causally constraining the conversion of food into descendants and facets. It does not show a stable ecosystem—both enlarged-capacity worlds also had many energy-exhaustion deaths (133 and 124), and their dense populations made naïve long runs computationally expensive. The next valid intervention is to make the batch runner scale safely (periodic aggregate sampling rather than expensive full topology work on every retained state) and then repeat the preregistered 8-seed 2,000-tick comparison. Do not make larger storage the new live default yet.

## Phase 16 — Energy Logistics (2026-08-06)

Implemented the diagnostic phase without changing any ecological mechanism. The server now retains one bounded telemetry entry per simulation tick: population, births/deaths and immediate death causes; total, organism-held, bond-reserve, and facet-reserve energy; food and gate-work harvest; overflow; movement, signal, gate-work, and bond-maintenance expenditure; reproductive investment; bonds, facets, gates, structural births; lineage longevity; and a complete living-energy distribution including Gini inequality. Experiment records now retain the same tick series alongside their periodic samples.

The ledger deliberately reports `energySpentOnGateWork: 0` when it is zero. Present consensus gates have no hidden direct debit; their real individual costs remain movement, perception, persistence, and coupling. Reproduction and structural seeding remain allocations rather than energy destruction. Bond-reserve decay is now measured as an actual reserve decrement rather than an estimate.

A deterministic 150-tick mechanism check (seed `160103`) produced 150 per-tick entries. At tick 150: population 29; stored organism energy 4,463.6; bond reserve 75.6; facet reserve 26.3; energy distribution min/median/mean/max `0.3 / 178.3 / 153.9 / 189.0`; Gini `0.1626`; 11 bonds and 3 facets. The latest tick had 140 harvest energy, 91 overflow, 29 movement cost, 1.54 actual bond-maintenance cost, zero direct gate-work cost, and zero deaths. This verifies instrumentation, not a new ecological conclusion.

### Structural overflow-capture screen (2026-08-06)

Tested one deliberately conservative logistics rule in a matched 3-seed, 500-tick screen (`160103`–`160105`). An organism first fills its normal store. Only 75% of the surplus that would otherwise be discarded is eligible, transfer is 85% efficient, and capture is capped by existing reserves. The live default remains `disabled`. No food, gate, mutation, reproduction, or prime rule changed.

| Capture mode | Population | Bonds | Facets | Gate completions | Births | Discarded overflow | Captured overflow | Starvation deaths |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Disabled | 32.3 | 38.0 | 42.7 | 11.7 | 46.3 | 35,198 | 0.0 | 14.0 |
| Bond reserve | 34.3 | 43.7 | 45.0 | 14.7 | 46.0 | 33,493 | 85.2 | 11.7 |
| Closed-facet reserve | 30.0 | 16.7 | 6.0 | 4.0 | 36.7 | 37,714 | 77.7 | 6.7 |

The mechanism itself works: captured energy enters an existing bond or facet reserve and is removed from the discarded-overflow ledger. Bond capture is directionally favorable but small: it retained only about 85 energy against ~35,000 overflow because existing bond reserves fill quickly. Closed-facet capture is unfavorable in this first screen: it changes reserve availability and structural birth paths, producing fewer gates, bonds, facets, and births. Do not enable either mode in the live ecology.

Scientific conclusion: **reserve capacity and release timing, not merely permission to capture overflow, are now the limiting logistics question.** The appropriate next experiment is not to increase reward. It is a narrowly matched reserve-throughput test: alter only how quickly a bounded bond reserve can release support to a low-energy member, while holding total capture capacity and energy loss fixed. This will test whether captured energy can bridge starvation events before it is stranded in a full reserve.

### Bond-reserve throughput screen (2026-08-06)

Tested the stated throughput hypothesis in a matched 3-seed, 500-tick screen. Bond overflow capture remained enabled in all arms at the same 75% eligibility and 85% transfer efficiency. Food, gates, founders, mutation, reproduction, reserve capacity, and transfer loss were fixed. Only `maxSupportReleasePerTick` changed:

| Release/tick | Population | Bonds | Facets | Gates | Births | Starvation deaths | Support energy released | Mean Gini |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 0.35 baseline | **34.3** | **43.7** | **45.0** | **14.7** | **46.0** | 11.7 | 278.3 | 0.18 |
| 0.70 moderate | 32.3 | 36.7 | 35.0 | 10.7 | 45.3 | 13.0 | 225.8 | 0.18 |
| 1.40 high | 29.0 | 24.0 | 9.7 | 8.3 | 40.0 | 11.0 | 177.9 | 0.18 |

This falsifies the immediate throughput hypothesis in this regime. Faster permitted release did not improve survival or reduce energy inequality; it reduced the amount eventually released because reserves emptied more quickly and led to fewer retained bonds/facets/gates. The conservative baseline is the best of the tested rates. Therefore do not increase support throughput in the live ecology.

The next bottleneck is not “support is too slow.” The combined capture and throughput screens instead indicate **reserve capacity and replenishment opportunity are too small relative to the overflow stream**, while rapid reserve draining destabilizes the topology that would retain and redistribute energy. The next diagnostic should compare the timing of reserve filling, reserve depletion, individual starvation, and bond dissolution in the Phase 16 per-tick series before proposing another intervention.

### Compact five-curve timing diagnosis (2026-08-06)

Ran the requested no-intervention diagnostic over three matched default worlds (`160103`–`160105`) for 400 ticks. This short screen compares the five curves on one tick clock: bond-reserve filling, 20% reserve depletion after its peak, first starvation death, 20% bond loss after peak, and 20% facet loss after peak.

| Event | Median tick | Interpretation constraint |
| --- | ---: | --- |
| First starvation death | **177** | Occurred while total reserves were still building. |
| Bond-reserve peak | 355 | Later than first starvation in all three seeds. |
| 20% reserve depletion after peak | 375 | Observed in two of three trajectories in this window. |
| 20% facet loss after peak | 371 | Observed in two trajectories; one remained structurally high at tick 400. |
| 20% bond loss after peak | 386 | Observed in two trajectories; one remained structurally high at tick 400. |

This rules out the simple sequence “reserves empty, then organisms starve, then structure breaks.” Starvation begins much earlier, while substantial aggregate bond reserve is accumulating. The leading diagnosis is now an **access/distribution mismatch**: reserve energy exists in some bonds, but vulnerable organisms are not necessarily attached to, eligible for, or reached by that reserve at the tick they need support. This is not yet proof of a particular cause; the relevant next measurement is lineage- and bond-resolved support: which organism starves, whether it was bonded, adjacent to a reserve, below the support threshold, and how much accessible reserve existed in its connected component.

### Starvation-access diagnosis (2026-08-06)

Added exact starvation-death context without changing any ecological rule: lineage/generation, bonded state, direct bonds and reserves, connected-component reserve, support eligibility, and support actually received on the death tick. Repeated the compact 3-seed, 400-tick default-world screen.

Across 25 starvation deaths, 23 were bonded. **Twenty-one died in a connected bond component that held accessible reserve elsewhere, yet none had accessible reserve on their own attached bond.** Consequently, zero starvation deaths met the current support eligibility rule and zero received support. Mean direct accessible reserve at starvation was `0`; mean accessible reserve elsewhere in the same component was `63.67`.

This identifies the post-storage bottleneck precisely. Bond reserve is currently a **one-hop private store**, not a connected-component energy pool. The support rule can only withdraw from a dying organism's immediate bonds above the 1.5 reserve floor; it cannot relay energy from another bond in the same connected structure. The system therefore contains energy-rich structural components in which individual members still starve.

This is strong diagnosis, not authorization for an automatic fix. The next causal test should be a bounded, lossy **one-hop reserve relay** compared with the present direct-only rule: a reserve-rich adjacent bond may transfer a limited amount into the dying member's direct bond before ordinary support is evaluated. It must retain capacity limits, transfer loss, and a per-tick cap; it must not create a global pool or allow unbonded organisms to benefit.

### One-hop reserve-relay screen (2026-08-06)

Implemented and tested the proposed relay in a matched 3-seed, 400-tick screen. It is disabled by default. When a low-energy member has no accessible direct reserve, a bond sharing its partner may move at most 0.5 reserve energy into the direct bond; the relay loses 20%, then the normal direct-support rule applies. The relay is one hop only, capacity-limited, floor-protected, and unavailable to loose organisms.

| Condition | Population | Bonds | Facets | Births | Gates | Starvation deaths | Stranded deaths |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Direct-only | **33.0** | **40.3** | **35.3** | **41.3** | **8.3** | 8.3 | 7.0 |
| One-hop relay | 31.3 | 30.3 | 25.7 | 38.7 | 6.3 | **7.3** | **5.0** |

The relay operated as intended: it made 135.7 transfers, delivered 46.3 reserve energy, and produced 44 immediate rescues on average. It modestly reduced starvation and stranded deaths, confirming the diagnosed access barrier is real. However, it also reduced every structural outcome. The current trigger is too broad: it relays whenever a member is below the ordinary support threshold (24), draining distant bonds pre-emptively and weakening the topology that must persist.

Conclusion: do not enable this relay in the live ecology. The next narrowly justified test is a **critical-only relay**: preserve the same one-hop, lossy, bounded rule but activate it only at immediate death risk (for example, energy below 1–3), after ordinary direct support has failed. This tests whether rare emergency access can prevent avoidable starvation without turning the structure into a continuously drained shared pool.

### Critical-only one-hop relay screen (2026-08-06)

Implemented the emergency version with an explicit control safeguard: ordinary direct support runs first; a one-hop relay runs only if the member remains at energy `<= 2`; ordinary support runs a second time only when relay energy was actually deposited. The direct-only arm therefore preserves the prior ecology exactly. The same 3-seed, 400-tick protocol tested only `relayEnabled`.

| Condition | Population | Bonds | Facets | Births | Gates | Starvation deaths | Stranded deaths |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Direct-only | 33.0 | **40.3** | 35.3 | 41.3 | 8.3 | 8.3 | 7.0 |
| Critical-only relay | **34.0** | 38.7 | **39.0** | 41.3 | **9.0** | **7.3** | **5.7** |

The emergency relay made only 36 transfers and delivered 13.3 reserve energy on average (3.3 lost in relay), yet produced 21.7 immediate rescues. Unlike the broad relay, it did not collapse structural outcomes: population, facets, and gate completions were directionally higher, while starvation and stranded deaths were lower. Bonds were modestly lower. This is promising mechanism evidence, not a long-horizon persistence result; three short trajectories are insufficient to enable it in the live ecology.

Next: preregister a larger, performance-safe 1,000–2,000 tick direct-only versus critical-relay replication, reporting the full Phase 16 Logistics series and extinction/last-facet time. Do not add a further mechanism before that replication.
