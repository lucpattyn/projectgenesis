# Next-session handoff — resource-funded collective survival

Date prepared: 2026-09-21  
Project: Genesis / Primes  
Branch: `codex/delayed-cue-computation`

## Where we ended today

The project now forms substantial bonded morphologies, but the current supported-development mode still contains an experimental assistance mechanism. It can keep organisms alive, yet it is not an adequate model of autonomous survival because pulse events can replenish a support wallet independently of physical resource accounting.

The latest relevant commits are:

- `bb61cc4` — delayed horizontal/vertical image-memory task, API, and UI.
- `d8950c5` — per-component connection budget (global 96, component 48).
- `8bbeba2` — earned conditional support wallet and optional unconditional override.
- `3cc3849` — default custom survival cue and cue-adjacent successful-return reward.
- `f3b2966` — Astra gate-discovery report.

The current support system and the unconditional override must remain available as comparison controls, but the new work must not silently change ordinary ecology defaults.

## Objective for the next session

Replace the experimental development-support wallet with a switchable **resource-funded survival mode**:

> Structures survive by harvesting physical resources, managing local energy, and transferring bounded energy through real bonds. Pulses may carry information, but never manufacture energy.

Do not describe the first designed policy as evolved intelligence. Evolution is a later comparison stage.

## Safe implementation sequence

### 1. Freeze and audit before editing

- Confirm clean worktree and record `git log -5 --oneline`.
- Preserve the clean `160103`/current committed baseline.
- Run `npm test`.
- Build a stationary three-to-five-member accounting fixture with movement disabled and reproduction disabled.
- Record per-tick movement, coupling, perception, signal, bond maintenance, food income, reserve transfers, deaths, and final energy.
- Verify the conservation equation:

  `initial energy + harvested energy = final energy + explicit costs + recorded transfers/losses`.

### 2. Add a separate switchable mode

Add `resourceFundedSurvival.enabled`, default `false`.

Keep these controls separate:

- ordinary ecology baseline;
- legacy conditional/unconditional supported-development comparison;
- new resource-funded mode.

The new mode must not call the legacy pulse-credit wallet.

### 3. Replace credits with real energy

- Remove pulse-generated spendable credits from the new mode.
- Food and gate output add energy only to the organism that physically harvests it.
- Transfers debit the sender, credit the receiver, and record throughput and loss.
- Remote energy must travel over existing bonds with explicit per-tick capacity and latency.
- No hidden top-ups, resurrection, global component pool, or energy from image brightness/stress/task phase.

### 4. Resource layer and stationary survival

- Configure a bounded regenerating food/resource layer sufficient for a small stationary collective at rest.
- Document regeneration as environmental input.
- Test resources enabled versus regeneration disabled.
- Keep movement disabled for the first functional demonstration so locomotion is not a hidden prerequisite.

### 5. Local energy-management controller

Use only local energy, recent local harvest, current demand, and directly available neighbor signals to choose among:

- process/communicate;
- rest;
- local exploration;
- fund or activate a bond;
- reproduce.

Add hysteresis and minimum dwell times. A cue can bias the choice, but sensing alone cannot create energy.

### 6. Dormant bonds

Separate structural attachment from active communication:

- active bonds pay normal maintenance and can transmit;
- dormant bonds pay lower structural upkeep but transmit nothing;
- dormant bonds can wake through a bounded local sensory event;
- dormant bonds still expire if upkeep cannot be paid;
- log active/dormant transitions, wake latency, maintenance, and transmission costs.

### 7. Gate discovery and consensus

Implement the local protocol from `ASTRA_GATE_DISCOVERY_REPORT.md`:

- bounded local gate sighting;
- relative direction, coarse distance, phase, stock, confidence, TTL;
- pulse exchange through collisions/bonds;
- decaying component memory;
- quorum-based target selection;
- arrival and successful gate work reinforce the path;
- stale/exhausted gates invalidate the record.

No global gate map should be passed to organisms.

Current status: implemented in `ac3468f` and enabled by default as `collectiveWork.gateDiscovery`. It remains independently switchable for matched controls. The API exposes sightings, relays, consensuses, active reports, and active component targets.

### 8. Structural maintenance policy

Start with a designed local policy, not evolution:

- protect minimum operating reserve;
- fund requested communication within budget;
- maintain affordable attachments;
- rest and release unaffordable connections during sustained shortage;
- repair through legal local contact after recovery;
- make reproduction debit real energy and leave a post-birth margin.

Initially keep reproduction disabled for survival accounting. Then enable paid replacement and report the difference.

### 9. Validation matrix

Run matched seeded tests with identical initial endowments:

1. resources enabled;
2. regeneration disabled;
3. fixed allocation;
4. dynamic local allocation;
5. legacy conditional support comparison;
6. new resource-funded mode.

Measure member survival, connected lifetime, active/dormant bonds, harvest, energy stocks, transfers, costs, wake latency, gate sightings, consensus completions, and task performance.

The resource-disabled world must lose energy under ongoing costs. Persistence must exceed the lifetime affordable from initial reserves alone.

### 10. Image task and evolution

Re-run the established delayed image task after accounting works:

- balanced unseen inputs;
- communication disabled;
- memory erased;
- blank input;
- untrained controllers;
- survival support equal across controls.

Report delayed accuracy, missed responses, wake latency, energy per correct response, and survival separately. Only after the designed mode works should bounded rest thresholds, reserve margins, transfer limits, activation thresholds, and exploration parameters be mutated.

## Acceptance criteria

- Ordinary ecology defaults unchanged.
- No pulse-created energy in resource-funded mode.
- Energy ledger reconciles without unexplained creation.
- Resource-disabled control loses energy.
- Dormant bonds are not free communication channels.
- Gate information is local, bounded, decaying, and consensus-based.
- A replay visibly shows harvesting → processing → shortage → rest/release → recovery → renewed activity.
- Delayed image performance is reported honestly; no tiny smoke run is presented as final success.

## First commands next session

```powershell
git status --short
git log -5 --oneline
npm test
```

Then inspect `GUIDED_STRUCTURAL_INTELLIGENCE.md`, `ASTRA_GATE_DISCOVERY_REPORT.md`, this handoff, and the energy ledger code before editing. Start with the stationary accounting fixture and do not change live defaults until its conservation result is recorded.

## Files to update after implementation

- `GUIDED_STRUCTURAL_INTELLIGENCE.md`
- `ASTRA_GATE_DISCOVERY_REPORT.md`
- `NEXT_SESSION_HANDOFF.md`
- a new resource-funded results report with raw artifacts under `research-results/`

## Explicit non-goals

- no hardcoded diamond/star/kite privileges;
- no global image decoder;
- no global gate coordinates delivered to organisms;
- no unconditional support enabled by default;
- no claim that a designed controller is evolved intelligence.
