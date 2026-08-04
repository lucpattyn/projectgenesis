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
