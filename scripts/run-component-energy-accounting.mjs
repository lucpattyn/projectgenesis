import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { Simulation } from "../server/simulation/simulation.js";

const SEEDS = [160103, 160104, 160105];
const TICKS = 1000;

function run(seed) {
  const simulation = new Simulation();
  simulation.stop();
  simulation.setSeed(seed);
  for (let tick = 0; tick < TICKS; tick += 1) simulation.step();
  return { seed, cycles: simulation.gateFieldCycles.filter((cycle) => cycle.endedTick !== null) };
}

if (!isMainThread) {
  parentPort.postMessage(run(workerData));
} else {
  const results = await Promise.all(SEEDS.map((seed) => new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), { workerData: seed });
    worker.once("message", resolve);
    worker.once("error", reject);
  })));
  const cycles = results.flatMap((result) => result.cycles);
  const mean = (key) => cycles.length ? Number((cycles.reduce((sum, cycle) => sum + cycle[key], 0) / cycles.length).toFixed(3)) : 0;
  console.log(JSON.stringify({
    protocol: { ticks: TICKS, seeds: SEEDS, ecology: "current open-sharing finite-gate default" },
    summary: {
      completedCycles: cycles.length,
      meanTriadEnergyDelta: mean("totalStructuralEnergyDelta"),
      meanComponentEnergyDelta: mean("componentEnergyDelta"),
      meanComponentSizeStart: mean("componentMemberCountStart"),
      meanComponentSizeEnd: mean("componentMemberCountEnd"),
      positiveTriadCycles: cycles.length ? Number((cycles.filter((cycle) => cycle.totalStructuralEnergyDelta > 0).length / cycles.length).toFixed(3)) : 0,
      positiveComponentCycles: cycles.length ? Number((cycles.filter((cycle) => cycle.componentEnergyDelta > 0).length / cycles.length).toFixed(3)) : 0
    }
  }, null, 2));
}
