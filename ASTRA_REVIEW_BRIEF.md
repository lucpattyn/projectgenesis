# Project Genesis — Astra Review Brief

## Purpose

Please review the current research direction and suggest the next experiment.
The goal is to evolve collectives that retain and exchange useful information
through real bonds, while preserving Genesis's open-ended morphology and avoiding
shape-specific scripting.

## Repository state

- Working branch: `codex/delayed-cue-computation`
- Historical ecology baseline: `18866dc`
- Current HEAD: `47dddc1`
- Regression test: `npm test` passes (`Spatial bond regression checks passed`)
- The live ecology defaults have not been changed by the delayed-cue work.
- All new work is isolated in headless experiment scripts and documentation.
- Seed-count correction: the larger validation is exactly eight seeds,
  `160112–160119`; there is no ninth seed in that result set. Earlier three-
  seed and four-seed screens are separate experiments.

Recent commits:

| Commit | Contribution |
|---|---|
| `340424d` | Connect delayed-cue task to real Genesis bonds |
| `1f44782` | Sender/receiver delayed-cue benchmark |
| `a6fbe6e` | Evolve weighted controllers on the real-bond task |
| `9dc4098` | Improve mutation reachability |
| `d05a411` | Unseen long-delay replication |
| `6e58f06` | Curriculum replication |
| `6e40d64` | Search stabilization |
| `a25662b` | Larger eight-seed validation |
| `f5d82e0` | Scale to a three-member relay topology |
| `47dddc1` | Bond-retention stress test |

## What is implemented

### Real bonded memory substrate

`BrainExecutor` accepts optional weighted edges while preserving the default
weight of `1`. Organisms use production `Organism.act`, Prime-13 persistent
state, and Prime-31 neighbor-state transport. The bonded experiments use an
actual `Simulation` bond map rather than a mock message channel.

The two-member task is:

```text
sender sees cue → sender recurrent state → Prime-31 bond transport → receiver response
```

The sender has no shortcut from its output back into the environmental cue. A
heritable recurrent self-edge carries retained state. Mutation evolves bounded
edge weights; it does not receive a hardcoded cue-to-answer rule.

### Three-member relay extension

`scripts/run-group-bonded-memory.mjs` uses:

```text
sender → real bond → relay → real bond → receiver
```

The relay must carry the persistent state across the second bond. A separate
experimental reserve rule decays bond reserve every tick and adds a small bonus
for useful recurrent activity; a depleted bond is removed. This reserve rule is
not enabled in the live ecology.

## Results

### Two-member evolutionary memory

Larger validation: eight seeds (`160112–160119`), 24 candidates, 40
generations, 12 training episodes per generation, and 32 balanced unseen
episodes with randomized delays from 4–24 ticks.

- All 8/8 seeds: **100% training accuracy**
- All 8/8 seeds: **100% unseen accuracy**
- Communication-disabled control: **50% on every seed**
- Recurrent-memory weights set to zero: **50.0% on six seeds**, and
  **53.1%, 53.1%, 59.4%** on the remaining three

Interpretation: this is strong evidence for causal retained state and bonded
communication in the two-member task. It is not yet evidence of full collective
intelligence or open-ended ecology.

### Three-member relay screen

Four seeds (`160120–160123`), 16 candidates, 24 generations, eight episodes,
eight-tick delay:

- Evolved accuracy: **100%, 50%, 50%, 100%**
- Communication-disabled accuracy: **50% on all seeds**
- No bonds depleted in this short screen

This validates that the memory signal can traverse two real bonds, but search is
not yet reliable at group scale.

### Bond-retention stress test

Same relay topology, but with initial reserve `0.30`, decay `0.012/tick`, pulse
gain `0.004`, and 40 post-cue hold ticks:

- Seed `160120`: pulse-enabled run retained one bond on average and reached
  **100% accuracy**
- Its pulse-disabled and communication-disabled controls lost both bonds and
  reached **50% accuracy**
- Seeds `160121–160123`: both bonds broke even with pulses and accuracy stayed
  at **50%**

Interpretation: pulse-to-reserve support can protect a useful path, but current
reserve timing/gain is too weak or too late for reliable survival.

## What is hardcoded versus evolved

Hardcoded substrate:

- task protocol and cue timing;
- sender/relay/receiver topology;
- available Prime-13 and Prime-31 channels;
- edge-weight bounds, mutation, selection, and controls;
- experimental reserve decay/pulse parameters.

Evolved:

- input, recurrent, and output edge weights for each role;
- the balance between retaining, relaying, and responding to a cue;
- successful configurations rediscovered across independent seeds.

No pentagon, diamond, star, privileged member, forced movement route, or direct
cue-to-answer mapping is scripted.

## Main bottlenecks

1. Two-member memory is now robust, but three-member relay evolution is mixed.
2. Bond reserves can disappear before useful pulses accumulate.
3. The current stress pulse is a diagnostic rule, not yet a principled Genesis
   energy-allocation mechanism.
4. The experiment uses fixed topology; bond formation, breakup, and morphology
   evolution are not yet part of the learning objective.
5. We need to distinguish genuine multi-hop memory from a transient signal
   artifact with stronger timing and topology controls.

## Candidate next steps

### A. Improve pulse economics

Compare immediate pulse credit, accumulated pulse credit, and reserve escrow.
Credit should be proportional to useful returned information, attenuated by hop
distance, capped per tick, and unable to create net energy. Measure bond lifetime
and accuracy together.

### B. Make retention an evolutionary objective

Use fitness such as:

```text
communication accuracy + multi-hop generalization
                 + bond lifetime / component survival
```

Run pulse-on versus pulse-off with matched seeds and identical mutation budgets.

### C. Add topology variation carefully

Allow a small number of candidate relay links to form or disappear, with a cost
for maintaining each link. Test whether evolution discovers a relay chain or
redundant path without prescribing a shape.

### D. Add stronger causal controls

- shuffle neighbor identities while preserving values;
- break only the first or only the second bond;
- replace the relay with a memoryless relay;
- delay or corrupt one pulse;
- compare fixed topology against topology-mutating candidates.

### E. Scale gradually

Recommended sequence: 3 members → 4–5 members → small morphology in the full
ecology. Do not enable this in live defaults until multi-seed survival and
communication controls both pass.

## Questions for Astra

1. Is the current two-member result sufficient evidence of evolved memory, or
   which additional causal control is essential before accepting it?
2. How should pulse credit be allocated so it strengthens bonds without
   smuggling in an energy source or making bonds immortal?
3. Should bond survival be a direct fitness term now, or should we first evolve
   multi-hop accuracy with fixed reserves?
4. What is the least-hardcoded way to introduce bond formation/breakup while
   keeping morphology open-ended?
5. Which experiment best distinguishes true distributed memory from a relay
   timing artifact?
6. What metrics should gate promotion from isolated benchmark to live ecology?

## Recommended immediate action

Run a matched three-member study with a principled reserve escrow: pulses may
protect only the specific traversed bonds, credit is capped and delayed until a
correct receiver response, and both bond lifetime and accuracy are scored.
Include first-link/second-link break controls and at least eight independent
seeds before changing any live default.

## Fixed three-member causal-control run (2026-09-13)

The first sequential milestone was implemented as
`scripts/run-group-fixed-controls.mjs` and run with its default eight seeds
(`160120–160127`), 16 balanced episodes per seed, randomized one-tick cue
delivery, and delays uniformly sampled from 4–12 ticks. Each group used two
real bonds with an adequate diagnostic reserve of `10`; members started at
energy `150`. The cue field was explicitly erased after tick 0 so later
responses could only use retained member state and bonded transport.

Command:

```text
node scripts/run-group-fixed-controls.mjs
```

Mean accuracy across the eight seeds:

| Condition | Mean accuracy | Per-seed result |
|---|---:|---|
| Fixed communication | 78.1% | 68.8, 68.8, 75.0, 75.0, 81.3, 81.3, 87.5, 87.5% |
| Communication disabled | 50.0% | 50% on all seeds |
| First link removed | 50.0% | 50% on all seeds |
| Second link removed | 50.0% | 50% on all seeds |
| Sender recurrence disabled | 50.0% | 50% on all seeds |
| Relay recurrence disabled | 78.1% | same as fixed condition |
| Receiver recurrence disabled | 78.1% | same as fixed condition |
| All recurrence disabled | 52.3% | 50.0–56.3% |

This run corrected the previous environmental-cue leakage. It shows above-
chance multi-hop communication, causal dependence on the first link and the
sender's retained state, and no dependence on a recurrent relay/receiver in
this particular executor. That last result is informative: the relay can
transmit a still-present sender state without itself needing recurrence. It
also means this benchmark does not yet prove that every member stores memory.
No raw JSON file was retained; the table is reproducible from the command and
the script's per-episode traces.

The next evidence-supported action is sustained repeated cues under a finite
energy budget, with a resource-disabled control. Do not yet evolve topology or
change live defaults.

## Sustained finite-budget run (2026-09-13)

`scripts/run-sustained-group-memory.mjs` ran eight fresh seeds
(`160128–160135`) for 16 alternating episodes each, with no internal-state
reset between episodes, randomized 4–12 tick delays, initial member energy
`90`, and initial reserve `10`. Member act costs and bond reserve decay were
charged; no energy was minted. The resource-disabled condition is a declared
finite-budget run with no external refill (the current isolated task has no
resource producer yet), while communication-disabled removes neighbor state.

| Condition | Mean accuracy | Bond loss |
|---|---:|---:|
| Sustained communication | **87.5%** (75.0–100.0% per seed) | 0.00 mean; 2 bonds remained |
| Resource disabled | **87.5%**, identical | 0.00 mean |
| Communication disabled | **50.0%** on every seed | 0.00 mean |

All seeds completed all 16 episodes despite energy reaching zero by the end;
this indicates the isolated `Organism.act` path does not yet terminate a
member at zero energy. The positive result demonstrates repeated updating and
communication, but it is not yet a full survival experiment. The next code
step must add an explicit finite-energy death/resource boundary and then test
whether task-linked resource income can sustain the group without silently
refilling reserves.

## Evolved maintenance-allocation pass (2026-09-13)

`scripts/run-evolving-maintenance-allocation.mjs` added an explicit
`energy <= 0` death boundary, removed bonds attached to dead members, and
evolved bounded member-versus-bond reward shares. Eight fresh seeds
(`160136–160143`) used 20 generations, 16 episodes, initial member energy 42,
initial bond reserve 4, and an 8-unit reward paid only after a correct response.
Fitness was accuracy plus a small survival term (`accuracy + 0.1 × survival`).

The run exposed a real bottleneck: evolved groups survived only 12.5–18.8% of
episodes and averaged 1.62–1.75 lost bonds. Resource-enabled accuracy exceeded
the resource-disabled control on only one seed (`160137`: 66.7% vs 50.0%);
several seeds showed identical accuracy because the group died before it could
earn a reward. This is not yet a successful maintenance policy, but it confirms
the accounting boundary and shows why reward timing matters: rewards arriving
only after a fully valid response cannot rescue a group that cannot reach the
first response.

The next implementation should provide a declared, bounded work advance (not
free energy) or lower initial operating cost enough to reach the first
task-linked reward, then compare allocation policies under the same finite
budget. Do not promote this mechanism to live defaults yet.

## Bounded work-advance pass (2026-09-13)

The maintenance study was extended with a declared task escrow: a `1.5`-unit
startup advance is released only to an intact group at episode start, and an
`8`-unit reward is released only after a correct response. Both are deducted
from a finite pool (`EPISODES × 9.5`); no bond or member store is refilled from
outside that ledger. The same eight seeds and search budget were rerun.

The advance produced a measurable but limited improvement. On seeds `160136`
and `160137`, resource-enabled accuracy/survival improved from the
resource-disabled baseline (66.7% vs 50.0% accuracy; 18.8% vs 12.5% survival).
The remaining seeds were unchanged or already at 100% accuracy despite only
18.8% survival. Each run paid six startup advances before the group became
unable to continue, and bond loss remained about 1.62 per run. The mechanism
therefore confirms that timing—not merely reward size—matters, but the current
advance is insufficient to bridge the full operating horizon.

Next action: tune only the declared escrow and operating-cost parameters in a
matched sweep, recording pool depletion and first-death tick. Do not add a
larger survival reward or alter live defaults until a finite-budget group can
complete most episodes with communication-disabled performance remaining at
chance.

## Escrow/cost sweep (2026-09-13)

A matched six-cell sweep varied work advance (`0.75`, `1.5`, `3.0`) and
isolated operating-cost scale (`1.0`, `0.5`) using the same eight seeds and
reduced exploratory budget (10 candidates, 10 generations, 12 episodes) in
each cell. Mean results:

| Advance | Cost scale | Resource-on accuracy | Survival | Bond loss | Resource-off accuracy | Off survival |
|---:|---:|---:|---:|---:|---:|---:|
| 0.75 | 1.0 | 85.4% | 24.0% | 1.52 | 83.3% | 22.9% |
| 1.5 | 1.0 | **87.5%** | 25.0% | 1.50 | 83.3% | 22.9% |
| 3.0 | 1.0 | 84.4% | 26.0% | 1.48 | 83.3% | 22.9% |
| 0.75 | 0.5 | 84.4% | 26.0% | 1.48 | 85.4% | 24.0% |
| 1.5 | 0.5 | 84.4% | 28.1% | 1.44 | 85.4% | 24.0% |
| 3.0 | 0.5 | 81.2% | **29.2%** | **1.32** | 85.4% | 24.0% |

The positive signal is survival: lower operating cost and larger escrow reduce
bond loss, with the best cell retaining roughly 29% of episode participation
and 1.32 lost bonds per run. Accuracy does not improve monotonically, and the
resource-off control remains high on some seeds, so this is not yet evidence
that maintenance allocation is selecting useful communication rather than
durability. The next step is to add a task-linked resource producer and a
first-death/energy-ledger trace, then repeat the best two cells at the full
search budget.

## Task-resource ledger and full-budget confirmation (2026-09-13)

The maintenance script now records a complete task-resource ledger: initial
pool, startup advances, correct-response rewards, member allocation, bond
allocation, and unspent balance. It also records the first episode in which a
member reaches the explicit zero-energy death boundary. Credits are released
only from the declared pool and only at episode start or after a correct
response.

The two best sweep cells were rerun at the full budget (16 candidates, 20
generations, 16 episodes, eight seeds):

| Advance | Cost scale | Resource-on accuracy | Survival | Bond loss | Resource-off accuracy | Off survival |
|---:|---:|---:|---:|---:|---:|---:|
| 1.5 | 1.0 | **87.5%** | 18.8% | 1.62 | 83.3% | 17.2% |
| 3.0 | 0.5 | 81.2% | **21.9%** | 1.56 | 85.4% | 18.0% |

First deaths occurred around episode 3–4 in every seed. The larger advance and
lower cost modestly improved survival and bond retention, but not task accuracy;
resource-off accuracy was sometimes higher. The evidence says the current
allocation search preserves life briefly without reliably preserving useful
communication. The next step should add a small, explicit pre-response work
budget tied to processing cost (still deducted from the task pool), then test
whether successful communication—not mere longevity—improves before topology
evolution.

## Progress-gated work budget (2026-09-13)

The pre-response budget is now released after the startup advance only when the
relay or receiver persistent state changes by at least `0.05`; the credit is
held until the following tick and remains debited from the finite task pool.
This blocks a motionless but durable group from receiving unlimited operating
support.

At the strongest prior configuration (advance `3.0`, cost scale `0.5`, full
16×20×16 budget, eight seeds), the progress-gated run reached 81.2% mean
accuracy, 21.9% survival, and 1.56 mean bond losses. The resource-disabled
control reached 85.4% accuracy and 18.0% survival. The gated budget paid 13.5
startup units and only 3.69 progress-linked work units on average; first deaths
returned to episodes 3–4. This is a principled constraint, but it currently
starves the group before useful communication can consolidate. The next step
should tune the progress threshold and grant a small bounded processing window
after verified relay delivery, while keeping the same ledger and controls.

## Pre-response processing budget (2026-09-13)

The isolated maintenance study now includes a capped `0.5`-unit per-tick
pre-response work budget, deducted from the same finite task pool and split
among the three members. It is released only while the group is intact, before
the response is known; successful responses still earn the separate bounded
reward. The ledger records this inflow independently.

At the full budget, the two best configurations were rerun across all eight
seeds:

| Advance | Cost scale | Resource-on accuracy | Survival | Bond loss | Resource-off accuracy | Off survival |
|---:|---:|---:|---:|---:|---:|---:|
| 1.5 | 1.0 | 81.2% | 21.9% | 1.56 | 83.3% | 17.2% |
| 3.0 | 0.5 | 81.9% | **26.6%** | **1.47** | 85.4% | 18.0% |

First deaths moved from episode 3–4 to episode 4–5 in the best cell, and bond
loss decreased. Accuracy still did not exceed the resource-disabled control,
so the budget is currently buying persistence more reliably than useful
communication. This is a positive survival signal, but not sufficient to
promote the mechanism. The next step is to make the work budget conditional on
measurable processing progress (state transition or relay delivery), preventing
durability-only strategies from consuming the task pool.
