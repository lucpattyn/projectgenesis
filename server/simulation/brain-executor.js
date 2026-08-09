import { clamp } from "./utils.js";

const EFFECTOR_IDS = {
  move: "p2-move",
  consume: "p5-consume",
  reproduce: "p7-reproduce",
  signal: "p19-output",
  bind: "p31-bind",
  environmentWrite: "p41-environment-write"
};

const DIRECTION_EFFECTOR_IDS = {
  N: "p2-north",
  E: "p2-east",
  S: "p2-south",
  W: "p2-west"
};

export class BrainExecutor {
  execute(brain, senses, previousPersistentState = {}) {
    const values = new Map();
    const incoming = new Map(brain.nodes.map((node) => [node.id, []]));

    for (const connection of brain.edges) {
      incoming.get(connection.to)?.push(connection.from);
    }

    for (const brainNode of brain.nodes) {
      if (brainNode.kind === "sensor") {
        values.set(brainNode.id, clamp(Number(senses[brainNode.id] ?? 0), 0, 8));
      } else if (brainNode.kind === "persistent") {
        values.set(brainNode.id, clamp(Number(previousPersistentState[brainNode.id] ?? 0), 0, 1.8));
      }
    }

    // A bounded propagation pass keeps execution deterministic even after future feedback edges are introduced.
    for (let pass = 0; pass < brain.nodes.length; pass += 1) {
      for (const brainNode of brain.nodes) {
        if (brainNode.kind === "sensor" || brainNode.kind === "persistent") {
          continue;
        }

        const sources = incoming.get(brainNode.id) ?? [];
        const total = sources.reduce((sum, source) => sum + (values.get(source) ?? 0), 0);
        values.set(brainNode.id, sources.length ? total / sources.length : 0);
      }
    }

    const nodeValues = Object.fromEntries(
      brain.nodes.map((brainNode) => [brainNode.id, Number((values.get(brainNode.id) ?? 0).toFixed(2))])
    );
    const persistentState = Object.fromEntries(
      brain.nodes
        .filter((brainNode) => brainNode.kind === "persistent")
        .map((brainNode) => {
          const sources = incoming.get(brainNode.id) ?? [];
          const total = sources.reduce((sum, source) => sum + (values.get(source) ?? 0), 0);
          return [brainNode.id, Number((sources.length ? total / sources.length : 0).toFixed(2))];
        })
    );

    const effectors = Object.fromEntries(
      Object.entries(EFFECTOR_IDS).map(([name, id]) => [name, nodeValues[id] ?? 0])
    );
    effectors.direction = Object.fromEntries(
      Object.entries(DIRECTION_EFFECTOR_IDS).map(([name, id]) => [name, nodeValues[id] ?? 0])
    );

    return {
      nodeValues,
      persistentState,
      effectors
    };
  }
}

export const DEFAULT_BRAIN_EXECUTOR = new BrainExecutor();
