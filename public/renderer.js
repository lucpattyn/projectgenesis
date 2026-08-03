const TILE_COLORS = {
  EMPTY: "#081922",
  FOOD: "#7dff72",
  WALL: "#e2edf0"
};

const RESOURCE_COLORS = {
  GREEN: "#9dff84",
  BLUE: "#70b6ff",
  RED: "#ff8b76"
};

const CELL_SIZE = 13;

function phenotype(organism) {
  const capabilities = new Map(organism.capabilities.map((capability) => [capability.prime, capability.power]));
  const energyLightness = 42 + Math.min(22, organism.energy / 105 * 22);
  const amplified = [...capabilities.values()].reduce((total, power) => total + Math.max(0, power - 1), 0);

  return {
    // Orange remains the stable meaning for "living organism"; genetic changes appear as generated markings.
    color: `hsl(30, 88%, ${energyLightness}%)`,
    hasPersistence: capabilities.has(13),
    hasSpatialAwareness: capabilities.has(17),
    hasSignal: capabilities.has(19),
    amplified
  };
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.pixelRatio = window.devicePixelRatio || 1;
    this.lastSnapshot = null;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    if (this.lastSnapshot) {
      this.render(this.lastSnapshot);
    }
  }

  sizeCanvas(world) {
    const width = world.width * CELL_SIZE;
    const height = world.height * CELL_SIZE;

    if (this.canvas.style.width !== `${width}px` || this.canvas.style.height !== `${height}px`) {
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
      this.canvas.width = Math.floor(width * this.pixelRatio);
      this.canvas.height = Math.floor(height * this.pixelRatio);
      this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    }

    return { width, height };
  }

  render(snapshot) {
    this.lastSnapshot = snapshot;
    const { world, organisms, controls, markers, bonds = [], facets = [], signal: signalSettings = {}, bonding: bondSettings = {}, facetCapital = {} } = snapshot;
    const { width, height } = this.sizeCanvas(world);
    const cellSize = CELL_SIZE;
    const offsetX = 0;
    const offsetY = 0;

    this.context.clearRect(0, 0, width, height);

    for (let y = 0; y < world.height; y += 1) {
      for (let x = 0; x < world.width; x += 1) {
        this.context.fillStyle = TILE_COLORS.EMPTY;
        this.context.fillRect(
          offsetX + x * cellSize,
          offsetY + y * cellSize,
          cellSize,
          cellSize
        );

        if (world.tiles[y][x] === "WALL") {
          const inset = cellSize * 0.12;
          this.context.fillStyle = TILE_COLORS.WALL;
          this.context.fillRect(
            offsetX + x * cellSize + inset,
            offsetY + y * cellSize + inset,
            cellSize - inset * 2,
            cellSize - inset * 2
          );
        }

        const chemistry = world.chemistry;
        const ash = chemistry?.ash?.[y]?.[x] ?? 0;
        const detritus = chemistry?.detritus?.[y]?.[x] ?? 0;
        const nutrients = chemistry?.nutrients?.[y]?.[x] ?? 0;
        const fertility = chemistry?.fertility?.[y]?.[x] ?? 1;
        if (fertility < 0.98) {
          this.context.fillStyle = `rgba(113, 76, 49, ${Math.min(0.32, (1 - fertility) * 0.32)})`;
          this.context.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
        }
        if (nutrients > 0) {
          this.context.fillStyle = `rgba(190, 150, 65, ${Math.min(0.28, nutrients * 0.28)})`;
          this.context.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
        }
        if (detritus > 0) {
          this.context.fillStyle = `rgba(122, 83, 50, ${Math.min(0.38, detritus * 0.38)})`;
          this.context.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
        }
        if (ash > 0) {
          this.context.fillStyle = `rgba(180, 186, 190, ${Math.min(0.42, ash * 0.42)})`;
          this.context.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
        }

        const signal = world.signals?.[y]?.[x] ?? 0;
        if (signal >= 4) {
          const maximumSignal = signalSettings.maxIntensity ?? 255;
          this.context.fillStyle = `rgba(185, 107, 255, ${Math.min(0.45, (signal - 3) / Math.max(1, maximumSignal - 3) * 0.45)})`;
          this.context.fillRect(offsetX + x * cellSize, offsetY + y * cellSize, cellSize, cellSize);
        }

        // Resource marks render after environmental overlays, keeping their identity readable.
        if (world.tiles[y][x] === "FOOD") {
          const resource = world.resources?.[y]?.[x] ?? "GREEN";
          this.context.fillStyle = RESOURCE_COLORS[resource] ?? RESOURCE_COLORS.GREEN;
          this.context.shadowColor = this.context.fillStyle;
          this.context.shadowBlur = 5;
          this.context.font = `bold ${Math.max(13, cellSize * 1.35)}px ui-monospace, monospace`;
          this.context.textAlign = "center";
          this.context.textBaseline = "middle";
          this.context.fillText("*", offsetX + x * cellSize + cellSize / 2, offsetY + y * cellSize + cellSize / 2 + 1);
          this.context.shadowBlur = 0;
        }
      }
    }

    if (controls.gridEnabled) {
      this.context.strokeStyle = "rgba(255,255,255,0.06)";
      this.context.lineWidth = 1;

      for (let x = 0; x <= world.width; x += 1) {
        this.context.beginPath();
        this.context.moveTo(offsetX + x * cellSize, offsetY);
        this.context.lineTo(offsetX + x * cellSize, offsetY + world.height * cellSize);
        this.context.stroke();
      }

      for (let y = 0; y <= world.height; y += 1) {
        this.context.beginPath();
        this.context.moveTo(offsetX, offsetY + y * cellSize);
        this.context.lineTo(offsetX + world.width * cellSize, offsetY + y * cellSize);
        this.context.stroke();
      }
    }

    const organismsById = new Map(organisms.map((organism) => [organism.id, organism]));
    for (const facet of facets) {
      const members = facet.memberIds.map((id) => organismsById.get(id));
      if (members.length !== 3 || members.some((member) => !member)) continue;
      const xs = members.map((member) => member.x);
      const ys = members.map((member) => member.y);
      if (Math.max(...xs) - Math.min(...xs) > 2 || Math.max(...ys) - Math.min(...ys) > 2) continue;
      const capitalRatio = Math.min(1, (facet.reserve ?? 0) / (facetCapital.reserveCapacity ?? 1));
      this.context.fillStyle = `rgba(255, 244, 163, ${0.08 + capitalRatio * 0.34})`;
      this.context.beginPath();
      this.context.moveTo(offsetX + members[0].x * cellSize + cellSize / 2, offsetY + members[0].y * cellSize + cellSize / 2);
      this.context.lineTo(offsetX + members[1].x * cellSize + cellSize / 2, offsetY + members[1].y * cellSize + cellSize / 2);
      this.context.lineTo(offsetX + members[2].x * cellSize + cellSize / 2, offsetY + members[2].y * cellSize + cellSize / 2);
      this.context.closePath();
      this.context.fill();
    }
    for (const bond of bonds) {
      const first = organismsById.get(bond.firstId);
      const second = organismsById.get(bond.secondId);
      if (!first || !second) continue;
      // Wrapped neighbors are logically adjacent but a canvas-spanning line is misleading in this 2D view.
      if (Math.abs(first.x - second.x) > 2 || Math.abs(first.y - second.y) > 2) continue;
      const strength = bond.strength ?? 0.35;
      const reserveRatio = Math.min(1, (bond.reserve ?? 0) / (bondSettings.reserveCapacity ?? 1));
      this.context.strokeStyle = `rgba(255, 244, 163, ${0.12 + strength * 0.48 + reserveRatio * 0.4})`;
      this.context.lineWidth = Math.max(1, cellSize * (0.04 + strength * 0.1 + reserveRatio * 0.1));
      this.context.beginPath();
      this.context.moveTo(offsetX + first.x * cellSize + cellSize / 2, offsetY + first.y * cellSize + cellSize / 2);
      this.context.lineTo(offsetX + second.x * cellSize + cellSize / 2, offsetY + second.y * cellSize + cellSize / 2);
      this.context.stroke();
    }

    const organismsByTransferId = new Map(organisms.map((organism) => [organism.id, organism]));
    for (const transfer of markers.energyTransfers ?? []) {
      const source = organismsByTransferId.get(transfer.fromId);
      const target = organismsByTransferId.get(transfer.toId);
      if (!source || !target) continue;
      if (Math.abs(source.x - target.x) > 2 || Math.abs(source.y - target.y) > 2) continue;
      const alpha = Math.min(0.9, transfer.ttl / 6);
      this.context.strokeStyle = `rgba(127, 255, 212, ${alpha})`;
      this.context.lineWidth = Math.max(1, cellSize * 0.12);
      this.context.beginPath();
      this.context.moveTo(offsetX + source.x * cellSize + cellSize / 2, offsetY + source.y * cellSize + cellSize / 2);
      this.context.lineTo(offsetX + target.x * cellSize + cellSize / 2, offsetY + target.y * cellSize + cellSize / 2);
      this.context.stroke();
    }

    for (const fire of world.fires ?? []) {
      const centerX = offsetX + fire.x * cellSize + cellSize / 2;
      const centerY = offsetY + fire.y * cellSize + cellSize / 2;
      this.context.fillStyle = "#ff633d";
      this.context.beginPath();
      this.context.moveTo(centerX, centerY - cellSize * 0.36);
      this.context.lineTo(centerX - cellSize * 0.32, centerY + cellSize * 0.27);
      this.context.lineTo(centerX + cellSize * 0.32, centerY + cellSize * 0.27);
      this.context.closePath();
      this.context.fill();
    }

    for (const organism of organisms) {
      const centerX = offsetX + organism.x * cellSize + cellSize / 2;
      const centerY = offsetY + organism.y * cellSize + cellSize / 2;
      const radius = Math.max(2.5, cellSize * 0.24);
      const form = phenotype(organism);

      if (form.hasSignal && organism.signalOutput > (signalSettings.activationThreshold ?? 0)) {
        this.context.strokeStyle = `rgba(185, 107, 255, ${Math.min(0.75, 0.18 + organism.signalOutput / 8 * 0.57)})`;
        this.context.lineWidth = Math.max(1, cellSize * 0.08);
        this.context.beginPath();
        this.context.arc(centerX, centerY, radius + Math.max(2, cellSize * 0.2), 0, Math.PI * 2);
        this.context.stroke();
      }

      if (organism.energy >= 90) {
        this.context.strokeStyle = "rgba(255, 244, 163, 0.9)";
        this.context.lineWidth = Math.max(1, cellSize * 0.08);
        this.context.beginPath();
        this.context.arc(centerX, centerY, radius + Math.max(1, cellSize * 0.14), 0, Math.PI * 2);
        this.context.stroke();
      }

      this.context.fillStyle = form.color;
      this.context.beginPath();
      this.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.context.fill();

      if (form.hasPersistence) {
        this.context.strokeStyle = "rgba(235, 255, 248, 0.82)";
        this.context.lineWidth = Math.max(1, cellSize * 0.07);
        this.context.beginPath();
        this.context.arc(centerX, centerY, Math.max(1.5, radius * 0.48), 0, Math.PI * 2);
        this.context.stroke();
      }

      if (form.hasSpatialAwareness) {
        this.context.strokeStyle = "rgba(125, 255, 114, 0.9)";
        this.context.lineWidth = 1;
        for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
          this.context.beginPath();
          this.context.moveTo(centerX + dx * (radius + 1), centerY + dy * (radius + 1));
          this.context.lineTo(centerX + dx * (radius + 3), centerY + dy * (radius + 3));
          this.context.stroke();
        }
      }

      for (let ring = 0; ring < form.amplified; ring += 1) {
        this.context.strokeStyle = "rgba(255, 244, 163, 0.72)";
        this.context.lineWidth = 1;
        this.context.beginPath();
        this.context.arc(centerX, centerY, radius + 3 + ring * 2, 0, Math.PI * 2);
        this.context.stroke();
      }

    }

    for (const marker of markers.births) {
      const centerX = offsetX + marker.x * cellSize + cellSize / 2;
      const centerY = offsetY + marker.y * cellSize + cellSize / 2;
      const alpha = marker.ttl / 10;
      this.context.strokeStyle = `rgba(255, 244, 163, ${alpha})`;
      this.context.lineWidth = Math.max(1, cellSize * 0.08);
      this.context.beginPath();
      this.context.arc(centerX, centerY, Math.max(4, cellSize * 0.48), 0, Math.PI * 2);
      this.context.stroke();
    }

    for (const marker of markers.primaryProduction ?? []) {
      const centerX = offsetX + marker.x * cellSize + cellSize / 2;
      const centerY = offsetY + marker.y * cellSize + cellSize / 2;
      const alpha = Math.min(0.9, marker.ttl / 4);
      this.context.strokeStyle = `rgba(220, 255, 129, ${alpha})`;
      this.context.lineWidth = Math.max(1, cellSize * 0.09);
      this.context.beginPath();
      this.context.arc(centerX, centerY, Math.max(3, cellSize * (0.25 + (4 - marker.ttl) * 0.08)), 0, Math.PI * 2);
      this.context.stroke();
    }

    for (const marker of markers.deaths) {
      const centerX = offsetX + marker.x * cellSize + cellSize / 2;
      const centerY = offsetY + marker.y * cellSize + cellSize / 2;
      const alpha = marker.ttl / 14;
      const size = Math.max(3, cellSize * 0.26);
      this.context.strokeStyle = `rgba(255, 124, 115, ${alpha})`;
      this.context.lineWidth = Math.max(1, cellSize * 0.09);
      this.context.beginPath();
      this.context.moveTo(centerX - size, centerY - size);
      this.context.lineTo(centerX + size, centerY + size);
      this.context.moveTo(centerX + size, centerY - size);
      this.context.lineTo(centerX - size, centerY + size);
      this.context.stroke();
    }
  }

  findOrganismAt(clientX, clientY) {
    if (!this.lastSnapshot) {
      return null;
    }

    const { world, organisms } = this.lastSnapshot;
    const bounds = this.canvas.getBoundingClientRect();
    const cellSize = CELL_SIZE;
    const offsetX = 0;
    const offsetY = 0;
    const x = Math.floor((clientX - bounds.left - offsetX) / cellSize);
    const y = Math.floor((clientY - bounds.top - offsetY) / cellSize);

    return organisms.find((organism) => organism.x === x && organism.y === y) ?? null;
  }
}
