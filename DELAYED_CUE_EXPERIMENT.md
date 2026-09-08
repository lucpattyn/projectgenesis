# Delayed-cue computation experiment

This branch is an isolated research experiment. The historical ecology and
prime genome remain unchanged.

## Substrate audit

Current mutation can gain, lose, or strengthen prime capabilities. The brain
generator then rebuilds a fixed graph for those primes. The executor propagates
unweighted averages and supports one persistent state node, but connection
weights, signs, thresholds, and graph edges are not heritable parameters.
Therefore selection can choose among developer-authored behaviors, but cannot
currently discover a new cue-to-response relationship. The smallest missing
degree of freedom is a bounded, heritable set of controller parameters.

## Task

Each episode presents a binary local cue for one tick, followed by a blank
delay and then a response window. Output A is rewarded for cue 0 and output B
for cue 1; the mapping is randomized per episode block and never exposed as a
task-specific register. Both answers and cue orders are balanced. Activity and
incorrect responses cost energy. The first screen uses short delays and mild
penalties.

The benchmark uses generic cue, state, and output channels. A controller may
retain a bounded scalar trace and evolve input/recurrent/output weights, but
the task does not provide the correct answer or a cue-to-action shortcut.

## Controls

- unevolved founders;
- evolved controllers;
- memory disabled (trace forced to zero);
- communication disabled (for the two-member collective variant);
- topology-perturbed controllers with matched parameter count.

The initial runnable screen is individual, so communication and topology
controls are reported as reserved follow-up controls rather than conflated
with individual delayed memory.

## Real-bond substrate check

`scripts/run-bonded-delayed-cue.mjs` uses two actual Genesis organisms, a real
bond entry, the production `Organism.act` path, Prime-13 persistent state, and
Prime-31 neighbor-state transport. Across seeds `160103–160105` at a
four-tick delay, communication enabled reached 100% accuracy; removing the
bond message reached 50% chance accuracy. The trace records receiver state and
response for replay inspection. This validates substrate wiring, not evolved
communication; the next experiment must evolve sender and receiver organization
under this real-bond task.

## Interpretation

Useful memory requires above-chance delayed accuracy on unseen cue sequences and
fresh seeds, with a causal drop when trace is disabled. This is not evidence of
collective computation; that claim requires a later interaction control.
