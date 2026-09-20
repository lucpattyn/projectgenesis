import { spawn } from "node:child_process";
import { mkdir, readFile, appendFile } from "node:fs/promises";

export class GuidedImageTaskRunner {
  constructor({ root = process.cwd() } = {}) {
    this.root = root;
    this.child = null;
    this.startedAt = null;
    this.lastExit = null;
    this.logPath = "research-results/guided-image-memory-task.stdout.log";
  }

  status() {
    return {
      running: Boolean(this.child && this.child.exitCode === null),
      startedAt: this.startedAt,
      pid: this.child?.pid ?? null,
      lastExit: this.lastExit,
      artifact: "research-results/guided-image-memory-task.json",
      log: this.logPath
    };
  }

  async start(options = {}) {
    if (this.child && this.child.exitCode === null) return this.status();
    await mkdir(`${this.root}/research-results`, { recursive: true });
    this.startedAt = new Date().toISOString();
    this.lastExit = null;
    const env = { ...process.env };
    for (const [key, value] of Object.entries({
      GENESIS_IMAGE_TASK_POPULATION: options.population,
      GENESIS_IMAGE_TASK_GENERATIONS: options.generations,
      GENESIS_IMAGE_TASK_TRAIN_TRIALS: options.trainingTrials,
      GENESIS_IMAGE_TASK_EVAL_TRIALS: options.evaluationTrials
    })) if (value !== undefined) env[key] = String(value);
    this.child = spawn(process.execPath, ["scripts/run-guided-image-memory-task.mjs"], { cwd: this.root, env });
    this.child.stdout.on("data", (chunk) => appendFile(`${this.root}/${this.logPath}`, chunk));
    this.child.stderr.on("data", (chunk) => appendFile(`${this.root}/${this.logPath}`, chunk));
    this.child.on("close", (code, signal) => { this.lastExit = { code, signal, finishedAt: new Date().toISOString() }; });
    return this.status();
  }

  stop() {
    if (this.child && this.child.exitCode === null) this.child.kill();
    return this.status();
  }

  async load() {
    try { return { ...this.status(), result: JSON.parse(await readFile(`${this.root}/research-results/guided-image-memory-task.json`, "utf8")) }; }
    catch { return { ...this.status(), result: null }; }
  }
}
