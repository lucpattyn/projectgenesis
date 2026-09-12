# Project Genesis — Status, Predictions, and Forward Plan

## Review target

Genesis is exploring whether evolving structures can process and retain useful
information through local organisms and bonds. The long-term aim is adaptive,
self-sustaining collective morphology without prescribing shapes or relay
identities.

## Verified repository state

- Branch: `codex/delayed-cue-computation`
- Historical ecology baseline: `18866dc`
- Current commit: `330966e`
- Live ecology defaults remain unchanged by the isolated experiments.
- Regression test: `npm test` passes.

The isolated experiments use real Genesis `Simulation` organisms, real bond
entries, production `Organism.act`, Prime-13 persistent state, and Prime-31
neighbor transport. Weighted controller edges are mutation parameters; the
cue-to-answer mapping itself is not hardcoded.

## Achieved so far

### Two-member bonded memory

Across eight seeds (`160112–160119`), evolved controllers reached 100% unseen
accuracy on randomized delays from 4–24 ticks. Communication-disabled controls
were 50%. Removing recurrent memory reduced performance to approximately
50–59%. This is strong evidence of causal retained state in a two-member task.

### Three-member relay

A sender → relay → receiver chain was implemented over two real bonds. Fixed
controls showed above-chance multi-hop communication; removing either link
returned performance to chance.

### Survival accounting

The isolated task now has explicit finite energy, bond reserves, task-resource
escrow, bounded startup advances, progress-gated processing support, and
ledgered member/bond allocations. A complete ledger identified artificial
movement cost as the dominant early loss; movement was disabled only for the
stationary benchmark.

### Evolved connectivity

Connectivity is represented by a heritable two-bit mask. Mutation can remove or
restore either link, with a small link-maintenance cost. In an exploratory
eight-seed run, all seeds selected the complete two-link path. With corrected
stationary accounting, groups survived 100% of tested episodes; removing either
link produced 50% accuracy.

## What the 100% survival means

It is a real improvement, but local in scope. It applies to a stationary,
three-member diagnostic task with bounded support and short episodes. It does
not yet establish survival of larger, moving morphologies in the full ecology.

## Predictions

These are falsifiable predictions, not established facts:

1. **Scaling cost:** moving from 3 to 4–5 members will reduce survival unless
   reserve allocation becomes topology-aware; total link cost will grow faster
   than useful pulse throughput.
2. **Redundancy benefit:** allowing one alternate connection should improve
   recovery after a random link failure, but only when its maintenance cost is
   lower than the expected value of restored communication.
3. **Memory localization:** a relay need not retain memory if it can faithfully
   transmit a still-present upstream state; requiring cue erasure and delayed
   response will reveal which members actually store information.
4. **Progress-gated economics:** funding measured useful processing should
   improve survival without improving accuracy unless communication is genuinely
   causal; durability-only strategies should remain at chance in link controls.
5. **Resource scarcity:** under finite food/task resources, groups that evolve
   selective maintenance will outlast groups that fund every bond uniformly.
6. **Topology evolution:** when connection formation and removal are legal and
   charged, evolution should favor short reliable paths first, then redundant
   paths only when damage or delay makes redundancy valuable.

## Current limitations

- Prime-31 neighbor state is still aggregated by mean in the general executor;
  explicit channels are currently supplied by the diagnostic task.
- The three-member relay benchmark has not yet demonstrated recovery after
  damage; it only demonstrates failure when a link is removed.
- The isolated resource producer is a task escrow, not yet ordinary Genesis
  food/gate production.
- The fitness function can still favor survival over useful communication in
  some regimes; accuracy and causal controls must remain primary.
- No claim has yet been made about autonomous collective reproduction or
  open-ended morphology.

## Recommended execution plan

### Phase 1 — Damage and recovery

Use 4–5 members with one optional alternate edge. Randomly remove a link after
cue delivery. Permit legal reconnection at an explicit energy cost. Measure
accuracy recovery, recovery time, reserve use, and bond lifetime against fixed
and random-topology controls.

### Phase 2 — Full ledger and resource ecology

Replace diagnostic escrow with a declared local food/gate resource. Record every
member cost, pulse, reserve transfer, resource inflow, death, and bond event.
Run resource-enabled and resource-disabled matched seeds.

### Phase 3 — Evolved maintenance policy

Evolve only bounded local allocation parameters first. Keep task accuracy as the
primary objective and use survival as a small secondary term. Reject policies
that improve longevity while communication controls remain at chance.

### Phase 4 — Morphology integration

Only after replicated multi-member recovery succeeds should the mechanism be
connected to live morphology formation, movement, reproduction, and topology
mutation. Keep it switchable and leave baseline defaults available for direct
comparison.

## Promotion criteria

Do not enable the mechanism by default in live Genesis until all are true:

- at least eight independent seeds;
- unseen cue sequences above chance;
- causal drop when communication or a required link is removed;
- finite, reconciled energy ledger;
- recovery after damage measured explicitly;
- no reliance on prescribed shapes, relay identities, or forced routes;
- survival improvement persists when scaling beyond three members.

## Questions for Astra

1. Is the next best experiment alternate-link recovery or full food/gate
   integration?
2. What is the smallest topology mutation scheme that is genuinely open-ended
   but still measurable?
3. Which metric best prevents selection of durable but uninformative groups?
4. How should Prime-31 expose per-neighbor state without hardcoding roles?
5. What evidence would justify moving from isolated benchmarks to live ecology?

