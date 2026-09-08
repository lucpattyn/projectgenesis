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

