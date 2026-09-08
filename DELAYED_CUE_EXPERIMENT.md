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

## Real-bond evolutionary pilot

`scripts/run-evolving-bonded-delayed-cue.mjs` evolves bounded edge weights
while evaluating through the production executor and real bond state. With 24
paired candidates, 40 generations, and 12 episodes at a four-tick delay, one of
three seeds reached 100% accuracy; the other two remained at 50%. In every run
the communication-disabled control was 50%, and an ideal-weight sanity control
was 100%. This is a useful but mixed result: the substrate is capable, while
the current mutation/search budget is not yet reliably reaching the solution.

The follow-up pilot added 25% sign-flip mutation and crossover, then used fresh
seeds `160106–160108` with a smaller bounded budget (12 candidates, 20
generations, 8 episodes). All three reached 100% while communication-disabled
controls remained at 50%. This improves reachability, but it is still a small
search screen; larger independent runs are required before treating it as an
evolutionary result.

## Unseen long-delay replication

The next replication used fresh seeds `160109–160111`, 24 candidates, 40
generations, 12 training episodes at four ticks, and 32 unseen evaluation
episodes with balanced randomized cue order and delays of 8–16 ticks. The
sender's output no longer feeds its own environmental signal; a bounded
heritable recurrent self-connection carries state instead. Training reached
100% on all three seeds. Unseen long-delay accuracy was **84.4%, 50.0%, and
50.0%**, while communication-disabled controls were 50% throughout. This is
promising evidence on one seed, but not yet robust generalization; longer-delay
memory remains the current bottleneck.

## Curriculum replication

The preregistered curriculum run used fresh seeds `160112–160119`: training
delays progressed through 4, 8, and 16 ticks, followed by 24 balanced unseen
episodes at randomized 8–16 tick delays. The bounded pilot used 12 candidates,
20 generations, and 8 episodes per generation. One seed (`160114`) reached
100% unseen accuracy with communication disabled at 50%; the other seven stayed
at 50%. This confirms reachability but rejects the claim of robust evolution.
The next bottleneck is mutation/search stability and recurrent-state retention,
not the bond transport path itself.

## Interpretation

Useful memory requires above-chance delayed accuracy on unseen cue sequences and
fresh seeds, with a causal drop when trace is disabled. This is not evidence of
collective computation; that claim requires a later interaction control.
