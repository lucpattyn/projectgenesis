function node(id, label, kind, x, y, prime) {
  return { id, label, kind, x, y, prime };
}

function edge(from, to) {
  return { from, to };
}

export class BrainGenerator {
  generate(genomeProfile) {
    const nodes = [];
    const edges = [];
    const factors = new Set(genomeProfile.factors);

    if (factors.has(2)) {
      nodes.push(node("p2-move", "Move", "effector", 82, 50, 2));
      if (factors.has(3) && !factors.has(13)) {
        edges.push(edge("p3-state", "p2-move"));
      }
    }

    if (factors.has(3)) {
      nodes.push(node("p3-energy", "Energy", "sensor", 18, 22, 3));
      nodes.push(node("p3-state", "Energy state", "internal", 50, 22, 3));
      edges.push(edge("p3-energy", "p3-state"));
    }

    if (factors.has(5)) {
      nodes.push(node("p5-food", "Food", "sensor", 18, 78, 5));
      nodes.push(node("p5-consume", "Consume", "effector", 82, 78, 5));
      edges.push(edge("p5-food", "p5-consume"));
    }

    if (factors.has(7)) {
      nodes.push(node("p7-reproduce", "Reproduce", "effector", 82, 22, 7));
      if (factors.has(3) && !factors.has(13)) {
        edges.push(edge("p3-state", "p7-reproduce"));
      }
    }

    if (factors.has(13)) {
      nodes.push(node("p13-persistence", "Persist", "persistent", 50, 50, 13));
      if (factors.has(3)) {
        edges.push(edge("p3-state", "p13-persistence"));
      }
      if (factors.has(2)) {
        edges.push(edge("p13-persistence", "p2-move"));
      }
      if (factors.has(7)) {
        edges.push(edge("p13-persistence", "p7-reproduce"));
      }
      // Prime 19 can write an environmental task fragment into persistent state.
      // Prime 31 then makes that prior-tick value available to bonded neighbors.
      if (factors.has(19)) {
        edges.push(edge("p19-input", "p13-persistence"));
      }
    }

    if (factors.has(11)) {
      nodes.push(node("p11-terrain", "Terrain", "sensor", 18, 50, 11));
      nodes.push(node("p11-terrain-state", "Terrain state", "internal", 50, 50, 11));
      edges.push(edge("p11-terrain", "p11-terrain-state"));
      if (factors.has(2)) {
        edges.push(edge("p11-terrain-state", "p2-move"));
      }
    }

    if (factors.has(17)) {
      const neighborhoodNodes = [
        ["nw", "NW", 12, 12], ["n", "N", 28, 12], ["ne", "NE", 44, 12],
        ["w", "W", 12, 36], ["e", "E", 44, 36],
        ["sw", "SW", 12, 60], ["s", "S", 28, 60], ["se", "SE", 44, 60]
      ];
      for (const [id, label, x, y] of neighborhoodNodes) {
        nodes.push(node(`p17-${id}`, label, "sensor", x, y, 17));
      }
      nodes.push(node("p17-field", "Neighborhood", "internal", 60, 64, 17));
      for (const [id] of neighborhoodNodes) {
        edges.push(edge(`p17-${id}`, "p17-field"));
      }
      if (factors.has(2)) {
        const directionalActions = [
          ["n", "North", "p2-north", 82, 34],
          ["e", "East", "p2-east", 93, 50],
          ["s", "South", "p2-south", 82, 66],
          ["w", "West", "p2-west", 71, 50]
        ];
        for (const [sensor, label, id, x, y] of directionalActions) {
          nodes.push(node(id, label, "effector", x, y, 2));
          edges.push(edge(`p17-${sensor}`, id));
        }
      }
    }

    if (factors.has(19)) {
      nodes.push(node("p19-input", "Signal in", "sensor", 18, 88, 19));
      nodes.push(node("p19-output", "Signal out", "effector", 82, 88, 19));
      edges.push(edge("p19-input", "p19-output"));
      // Signal output is driven by information, not the organism's baseline energy level.
      if (factors.has(17)) {
        edges.push(edge("p17-field", "p19-output"));
      }
      if (factors.has(13)) {
        edges.push(edge("p13-persistence", "p19-output"));
      }
    }

    if (factors.has(31)) {
      nodes.push(node("p31-neighbor-state", "Neighbor state", "sensor", 18, 64, 31));
      nodes.push(node("p31-bind", "Bind", "effector", 82, 66, 31));
      if (factors.has(3) && !factors.has(13)) {
        edges.push(edge("p3-state", "p31-bind"));
      }
      if (factors.has(13)) {
        edges.push(edge("p13-persistence", "p31-bind"));
        // Structural coupling makes direct neighbors' prior persistent values available to this node.
        edges.push(edge("p31-neighbor-state", "p13-persistence"));
      }
    }

    if (factors.has(43)) {
      nodes.push(node("p43-environment-memory", "Memory in", "sensor", 18, 12, 43));
      // Read is only a scalar input. Existing graph composition decides whether it matters.
      if (factors.has(13)) edges.push(edge("p43-environment-memory", "p13-persistence"));
    }

    if (factors.has(41)) {
      nodes.push(node("p41-environment-write", "Memory write", "effector", 82, 12, 41));
      // The write output has no semantic edge; persistent state can compose it with other inputs.
      if (factors.has(13)) edges.push(edge("p13-persistence", "p41-environment-write"));
    }

    return {
      status: "Active: generated graphs execute on the server. Prime 17 can drive directional outputs; Prime 31 exposes direct neighbor state; Prime 41/43 add neutral environmental write/read nodes.",
      nodes,
      edges
    };
  }
}

export const DEFAULT_BRAIN_GENERATOR = new BrainGenerator();
