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
