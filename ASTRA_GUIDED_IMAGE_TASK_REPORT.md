# Guided image-memory task status

This package adds one bounded, reproducible capability on top of the Genesis substrate: a three-member bonded collective receives a local 16×16 horizontal or vertical image for 20 ticks, removes the image, waits a seeded 10–30 tick delay, and emits a response through the designated receiver. The sender uses Prime-17 local sensing and Prime-13 recurrent state; the relay and receiver use Prime-31 neighbor transport and Prime-13 state. Labels never enter organism inputs.

## Current implementation

- `scripts/run-guided-image-memory-task.mjs` runs seeded mutation/evolution and writes `research-results/guided-image-memory-task.json`.
- Supported-development assistance is explicit and bounded: movement suppression, maintenance energy, population cap (48), connection cap (96), and temporary existing-bond preservation. It is off for ordinary live ecology.
- `/api/guided-task` and the “Integrated delayed-cue task” panel start/stop/load the isolated benchmark. The UI reports the saved per-seed accuracy and target count.
- `guided-input.js` supports a direct 16×16 mapping for the benchmark while retaining the scaled mapping used by Package A.

## Smoke result (not acceptance)

The latest smoke run used 8 seeds, population 6, 2 generations, 6 training trials, and 10 evaluation trials. Evaluation accuracies were 0.50, 0.50, 0.70, 0.50, 0.40, 0.80, 0.40, 0.60; communication-disabled controls stayed at 0.50 and memory-erasure controls were generally lower. This is evidence that the relay path is active, but it misses the frozen engineering target (≥0.80 in 6/8 seeds). No claim of autonomous learning or target success is made.

## Reproduction

```powershell
$env:GENESIS_IMAGE_TASK_POPULATION='6'
$env:GENESIS_IMAGE_TASK_GENERATIONS='2'
$env:GENESIS_IMAGE_TASK_TRAIN_TRIALS='6'
$env:GENESIS_IMAGE_TASK_EVAL_TRIALS='10'
node scripts/run-guided-image-memory-task.mjs
```

The full protocol is eight seeds, 24 individuals, 24 generations, 20 training trials, and 100 unseen evaluation trials. Run it only after the smoke path is satisfactory; the current result is a measured limitation, not a completed capability.

Heritable parameters are the controller weights in the JSON artifact. Temporary state is Prime-13 state and per-trial queues; lifetime adaptation is the existing bounded guided response trace. Structural parameters are not yet evolved.
