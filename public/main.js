import { Renderer } from "./renderer.js";

const canvas = document.getElementById("world-canvas");
const statsGrid = document.getElementById("stats-grid");
const statusPill = document.getElementById("status-pill");
const speedSelect = document.getElementById("speed-select");
const foodGrowthInput = document.getElementById("food-growth");
const foodGrowthValue = document.getElementById("food-growth-value");
const initialPopulationInput = document.getElementById("initial-population");
const initialPopulationValue = document.getElementById("initial-population-value");
const universeSeedInput = document.getElementById("universe-seed");
const worldNumberInput = document.getElementById("world-number");
const founderGenomeInput = document.getElementById("founder-genome");
const toggleGridButton = document.getElementById("toggle-grid");
const generatorStatus = document.getElementById("generator-status");
const generatorList = document.getElementById("generator-list");
const generatorNote = document.getElementById("generator-note");
const recipeExpression = document.getElementById("recipe-expression");
const genomeInspector = document.getElementById("genome-inspector");
const liveBrainTitle = document.getElementById("live-brain-title");
const liveBrainContent = document.getElementById("live-brain-content");
const telemetryPanel = document.getElementById("telemetry-panel");
const ecologyNote = document.getElementById("ecology-note");
const productivityNote = document.getElementById("productivity-note");
const chemistryNote = document.getElementById("chemistry-note");
const fireEnabledInput = document.getElementById("fire-enabled");
const fireIgnitionInput = document.getElementById("fire-ignition");
const fireIgnitionValue = document.getElementById("fire-ignition-value");
const fireSpreadInput = document.getElementById("fire-spread");
const fireSpreadValue = document.getElementById("fire-spread-value");
const foodTargetInput = document.getElementById("food-target");
const foodTargetValue = document.getElementById("food-target-value");
const fireDurationInput = document.getElementById("fire-duration");
const fireDurationValue = document.getElementById("fire-duration-value");
const mutationRateInput = document.getElementById("mutation-rate");
const mutationRateValue = document.getElementById("mutation-rate-value");
const signalCostInput = document.getElementById("signal-cost");
const signalCostValue = document.getElementById("signal-cost-value");
const guideButton = document.getElementById("guide-button");
const guideDialog = document.getElementById("guide-dialog");
const guideCloseButton = document.getElementById("guide-close");

const renderer = new Renderer(canvas);
let currentSnapshot = null;
let selectedOrganismId = null;

const statLabels = {
  fps: "FPS",
  population: "Population",
  births: "Births",
  deaths: "Deaths",
  foodCount: "Food",
  averageAge: "Avg Age",
  oldestOrganism: "Oldest",
  averageEnergy: "Avg Energy",
  simulationTime: "Sim Time"
  ,bonds: "Bonds"
};

async function fetchJson(url, options) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function renderStats(statistics) {
  statsGrid.innerHTML = "";

  for (const [key, label] of Object.entries(statLabels)) {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = statistics[key];
    wrapper.append(dt, dd);
    statsGrid.appendChild(wrapper);
  }
}

function renderTelemetry(telemetry, distributedState = {}, facetCapital = {}) {
  telemetryPanel.innerHTML = `
    <p class="telemetry-summary">Formed ${telemetry.bondsFormed} | Broken ${telemetry.bondsBroken}</p>
    <p class="telemetry-summary">Facet transfers ${telemetry.facetTransfers ?? 0} | Energy shared ${telemetry.facetEnergyShared ?? 0}</p>
    <p class="telemetry-summary">Facet harvests ${telemetry.facetHarvests ?? 0} | Structural capital earned ${telemetry.facetHarvestEnergy ?? 0}</p>
    <p class="telemetry-summary">Funded facets ${facetCapital.fundedFacets ?? 0}/${facetCapital.activeFacets ?? 0} | Capital held ${facetCapital.totalReserve ?? 0}</p>
    <p class="telemetry-summary">Bonds fed ${telemetry.bondsFed ?? 0} | Structural energy ${telemetry.bondEnergyFed ?? 0}</p>
    <p class="telemetry-summary">Reserve support ${telemetry.bondSupportTransfers ?? 0} transfers | Energy returned ${telemetry.bondSupportEnergyReleased ?? 0}</p>
    <p class="telemetry-summary">Structural births ${telemetry.structuralBirths ?? 0} | Facet births ${telemetry.facetBirths ?? 0} | Capital spent ${telemetry.facetReserveSpent ?? 0}</p>
    <p class="telemetry-summary">Collective moves ${telemetry.collectiveMoves ?? 0} | Resource-scored moves ${telemetry.collectiveResourceDirectedMoves ?? 0}</p>
    <p class="telemetry-summary">State bearers ${distributedState.stateBearers ?? 0} | One-hop state inputs ${distributedState.activeStateInputs ?? 0}</p>
    <p class="telemetry-storage">${telemetry.storage}</p>
    <div class="telemetry-events">
      <p class="telemetry-storage">Active bond strength: ${currentSnapshot?.bonds?.length ? (currentSnapshot.bonds.reduce((total, bond) => total + bond.strength, 0) / currentSnapshot.bonds.length).toFixed(2) : "0.00"}</p>
      <p class="telemetry-storage">Active bond reserve: ${currentSnapshot?.bonds?.length ? (currentSnapshot.bonds.reduce((total, bond) => total + (bond.reserve ?? 0), 0) / currentSnapshot.bonds.length).toFixed(2) : "0.00"}</p>
      ${telemetry.recentEvents.length
        ? telemetry.recentEvents.map((event) => `<p><strong>${event.type}</strong> at tick ${event.tick}: ${event.message}</p>`).join("")
        : "<p>No bond events recorded in this experiment yet.</p>"}
    </div>
  `;
}

function renderGenerators(generators) {
  generatorStatus.textContent = generators.status;
  generatorNote.textContent = generators.registryStatus;
  recipeExpression.textContent = generators.composition.expression;
  generatorList.innerHTML = "";

  for (const generator of generators.generators) {
    const item = document.createElement("article");
    item.className = "generator-item";
    item.innerHTML = `
      <span class="prime-badge">${generator.prime}</span>
      <div>
        <h3>Prime ${generator.prime}: ${generator.name}</h3>
        <p>${generator.description}</p>
      </div>
    `;
    generatorList.appendChild(item);
  }
}

function renderGenomeInspector(snapshot) {
  let organism = snapshot.organisms.find((item) => item.id === selectedOrganismId);

  if (!organism && snapshot.organisms.length > 0) {
    organism = snapshot.organisms[0];
    selectedOrganismId = organism.id;
  }

  if (!organism) {
    selectedOrganismId = null;
    genomeInspector.innerHTML = "<p>Select an organism to inspect its genome.</p>";
    return;
  }

  const capabilities = organism.capabilities
    .map((capability) => `<li><strong>${capability.prime}${capability.power > 1 ? `^${capability.power}` : ""}: ${capability.name}</strong> - ${capability.description}</li>`)
    .join("");
  const perception = organism.perception
    ? `
      <h3>Effective World: Prime 17</h3>
      <p class="perception-key">Directional values: 0 means no usable resource; positive values are this genome's local metabolic opportunity.</p>
      <div class="perception-grid">
        ${["nw", "n", "ne", "w", "center", "e", "sw", "s", "se"].map((cell) => `
          <span class="${cell === "center" ? "perception-center" : ""}">${cell === "center" ? "O" : organism.perception[cell]}</span>
        `).join("")}
      </div>`
    : `<h3>Effective World</h3><p>Without Prime 17, this organism perceives only its own energy and food beneath it.</p>`;
  const directionScores = organism.movementDecision?.scores ?? {};
  const directionChoice = organism.movementDecision
    ? `Direction scores: N ${directionScores.N ?? 0} | E ${directionScores.E ?? 0} | S ${directionScores.S ?? 0} | W ${directionScores.W ?? 0} -> ${organism.movementDecision.chosen} (${organism.movementDecision.mode})`
    : "Direction choice: waiting for the next server tick.";
  const collectiveChoice = organism.collectiveDecision
    ? `Collective scores: N ${organism.collectiveDecision.scores.N} | E ${organism.collectiveDecision.scores.E} | S ${organism.collectiveDecision.scores.S} | W ${organism.collectiveDecision.scores.W} -> ${organism.collectiveDecision.chosen}`
    : "Collective direction: not currently in a moving bonded group.";
  const persistentState = organism.persistentState === null
    ? "No Prime-13 persistent state"
    : `Persistent state ${organism.persistentState}`;
  const sharedState = organism.sharedState ?? { connectedNeighbors: 0, contributors: [], mean: 0 };
  const sharedStateDescription = sharedState.contributors.length
    ? `Neighbor state input ${sharedState.mean} from ${sharedState.contributors.map((neighbor) => `#${neighbor.id}: ${neighbor.value}`).join(", ")}`
    : `Neighbor state input 0 (${sharedState.connectedNeighbors} bonded neighbors, none expose Prime-13 state)`;

  genomeInspector.innerHTML = `
    <p class="selected-organism">Organism #${organism.id}, generation ${organism.generation}</p>
    <p class="genome-expression">${organism.genomeExpression}</p>
    <p>Energy ${organism.energy} | Age ${organism.age}</p>
    <p>${persistentState}</p>
    <p>${sharedStateDescription}</p>
    <p>${organism.mutation ? `Birth mutation: ${organism.mutation.description}` : "Birth mutation: inherited unchanged."}</p>
    <h3>Generated Capabilities</h3>
    <ul>${capabilities}</ul>
    ${perception}
    <h3>Generated Brain</h3>
    <p class="brain-status">${organism.brain.status}</p>
    <p class="brain-output">Move ${organism.brain.execution?.effectors.move ?? 0} | Consume ${organism.brain.execution?.effectors.consume ?? 0} | Reproduce ${organism.brain.execution?.effectors.reproduce ?? 0}</p>
    <p class="brain-output">${directionChoice}</p>
    <p class="brain-output">${collectiveChoice}</p>
    <div class="brain-graph" id="brain-graph"></div>
  `;

  renderBrainGraph(organism.brain, document.getElementById("brain-graph"));
}

function renderBrainGraph(brain, container) {
  const namespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(namespace, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "xMinYMid meet");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Generated live brain graph");
  const nodesById = new Map(brain.nodes.map((item) => [item.id, item]));

  for (const connection of brain.edges) {
    const from = nodesById.get(connection.from);
    const to = nodesById.get(connection.to);
    const line = document.createElementNS(namespace, "line");
    line.setAttribute("x1", from.x);
    line.setAttribute("y1", from.y);
    line.setAttribute("x2", to.x);
    line.setAttribute("y2", to.y);
    line.setAttribute("class", "brain-edge");
    svg.appendChild(line);
  }

  for (const brainNode of brain.nodes) {
    const group = document.createElementNS(namespace, "g");
    group.setAttribute("class", `brain-node ${brainNode.kind} prime-${brainNode.prime}`);
    const circle = document.createElementNS(namespace, "circle");
    circle.setAttribute("cx", brainNode.x);
    circle.setAttribute("cy", brainNode.y);
    circle.setAttribute("r", "7");
    const nodeValue = brain.execution?.nodeValues[brainNode.id] ?? 0;
    circle.setAttribute("opacity", String(Math.min(1, 0.35 + nodeValue * 0.45)));
    const text = document.createElementNS(namespace, "text");
    text.setAttribute("x", brainNode.x);
    text.setAttribute("y", brainNode.y + 11);
    text.textContent = `${brainNode.label} ${nodeValue}`;
    group.append(circle, text);
    svg.appendChild(group);
  }

  container.replaceChildren(svg);
}

function renderLiveBrain(snapshot) {
  const organism = snapshot.organisms.find((item) => item.id === selectedOrganismId);

  if (!organism) {
    liveBrainTitle.textContent = "Generated Brain";
    liveBrainContent.textContent = "No living organism is currently available to inspect.";
    return;
  }

  liveBrainTitle.textContent = `Organism #${organism.id} Brain: ${organism.genomeExpression}`;
  liveBrainContent.innerHTML = "";
  renderBrainGraph(organism.brain, liveBrainContent);
}

function syncControls(snapshot) {
  if (speedSelect.options.length === 0) {
    for (const speed of snapshot.controls.speedOptions) {
      const option = document.createElement("option");
      option.value = String(speed);
      option.textContent = `${speed}x`;
      speedSelect.appendChild(option);
    }
  }

  speedSelect.value = String(snapshot.controls.speed);
  foodGrowthInput.value = String(snapshot.settings.foodGrowthRate);
  foodGrowthValue.textContent = Number(snapshot.settings.foodGrowthRate).toFixed(2);
  foodTargetInput.value = String(snapshot.ecology.foodTargetDensity);
  foodTargetValue.textContent = Number(snapshot.ecology.foodTargetDensity).toFixed(2);
  mutationRateInput.value = String(snapshot.ecology.mutationRate);
  mutationRateValue.textContent = `${Math.round(snapshot.ecology.mutationRate * 100)}%`;
  signalCostInput.value = String(snapshot.signal.emissionCost);
  signalCostValue.textContent = Number(snapshot.signal.emissionCost).toFixed(2);
  initialPopulationInput.value = String(snapshot.settings.initialPopulation);
  initialPopulationValue.textContent = snapshot.settings.initialPopulation;
  universeSeedInput.value = String(snapshot.settings.universeSeed);
  worldNumberInput.value = String(snapshot.settings.worldNumber);
  founderGenomeInput.value = String(snapshot.settings.founderGenome);
  statusPill.textContent = snapshot.controls.paused ? "Paused" : "Running";
  const resources = snapshot.ecology.resources ?? {};
  const resourceSummary = `Resources G:${resources.GREEN ?? 0} B:${resources.BLUE ?? 0} R:${resources.RED ?? 0}`;
  const fertilitySummary = snapshot.ecology.localFertility
    ? ` | Mean fertility ${(snapshot.ecology.averageFertility * 100).toFixed(0)}%`
    : "";
  ecologyNote.textContent = `Food target ${(snapshot.ecology.foodTargetDensity * 100).toFixed(0)}% | ${resourceSummary}${fertilitySummary} | Mutation ${(snapshot.ecology.mutationRate * 100).toFixed(0)}% per birth | Reproduction opportunity ${(snapshot.ecology.reproduction.opportunity * 100).toFixed(0)}% | Soft capacity ${snapshot.ecology.reproduction.carryingCapacity}`;
  const productivity = snapshot.primaryProduction ?? {};
  productivityNote.textContent = `Primary productivity: ${productivity.latestResourceUnits ?? 0} resource units this tick | ${productivity.totalResourceUnits ?? 0} since reset | ${productivity.totalPotentialEnergy ?? 0} potential energy created by fertility-driven regrowth.`;
  chemistryNote.textContent = snapshot.chemistry.enabled
    ? `Prime 37 chemistry: detritus ${snapshot.chemistry.detritus} | ash ${snapshot.chemistry.ash} | nutrients ${snapshot.chemistry.nutrients}. Nutrients and recovering fertility support local food regrowth.`
    : "Prime 37 chemistry is inactive in this world recipe.";
  fireEnabledInput.checked = snapshot.hazards.fireEnabled;
  fireIgnitionInput.value = String(snapshot.hazards.fireIgnitionRate);
  fireIgnitionValue.textContent = Number(snapshot.hazards.fireIgnitionRate).toFixed(3);
  fireSpreadInput.value = String(snapshot.hazards.fireSpreadChance);
  fireSpreadValue.textContent = Number(snapshot.hazards.fireSpreadChance).toFixed(2);
  fireDurationInput.value = String(snapshot.hazards.fireDuration);
  fireDurationValue.textContent = snapshot.hazards.fireDuration;
}

function renderSnapshot(snapshot) {
  currentSnapshot = snapshot;
  syncControls(snapshot);
  renderStats(snapshot.statistics);
  renderTelemetry(snapshot.telemetry, snapshot.distributedState, snapshot.facetCapital);
  renderGenerators(snapshot.generators);
  renderGenomeInspector(snapshot);
  renderLiveBrain(snapshot);
  renderer.render(snapshot);
}

async function loadSnapshot() {
  try {
    const snapshot = await fetchJson("/api/state");
    renderSnapshot(snapshot);
  } catch (error) {
    statusPill.textContent = "Connection Error";
  }
}

async function postJson(url, payload) {
  const snapshot = await fetchJson(url, {
    method: "POST",
    body: JSON.stringify(payload)
  });
  renderSnapshot(snapshot);
}

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    postJson("/api/control", { action: button.dataset.action });
  });
});

toggleGridButton.addEventListener("click", () => {
  postJson("/api/settings", {
    gridEnabled: !currentSnapshot?.controls.gridEnabled
  });
});

guideButton.addEventListener("click", () => guideDialog.showModal());
guideCloseButton.addEventListener("click", () => guideDialog.close());
guideDialog.addEventListener("click", (event) => {
  if (event.target === guideDialog) guideDialog.close();
});

speedSelect.addEventListener("change", () => {
  postJson("/api/settings", { speed: Number(speedSelect.value) });
});

foodGrowthInput.addEventListener("input", () => {
  foodGrowthValue.textContent = Number(foodGrowthInput.value).toFixed(2);
});

foodGrowthInput.addEventListener("change", () => {
  postJson("/api/settings", { foodGrowthRate: Number(foodGrowthInput.value) });
});

foodTargetInput.addEventListener("change", () => {
  postJson("/api/settings", { foodTargetDensity: Number(foodTargetInput.value) });
});
foodTargetInput.addEventListener("input", () => {
  foodTargetValue.textContent = Number(foodTargetInput.value).toFixed(2);
});
mutationRateInput.addEventListener("input", () => {
  mutationRateValue.textContent = `${Math.round(Number(mutationRateInput.value) * 100)}%`;
});
mutationRateInput.addEventListener("change", () => {
  postJson("/api/settings", { mutationRate: Number(mutationRateInput.value) });
});
signalCostInput.addEventListener("input", () => {
  signalCostValue.textContent = Number(signalCostInput.value).toFixed(2);
});
signalCostInput.addEventListener("change", () => {
  postJson("/api/settings", { signalEmissionCost: Number(signalCostInput.value) });
});

initialPopulationInput.addEventListener("input", () => {
  initialPopulationValue.textContent = initialPopulationInput.value;
});

initialPopulationInput.addEventListener("change", () => {
  postJson("/api/settings", { initialPopulation: Number(initialPopulationInput.value) });
});

universeSeedInput.addEventListener("change", () => {
  postJson("/api/settings", { universeSeed: Number(universeSeedInput.value) });
});

worldNumberInput.addEventListener("change", () => {
  postJson("/api/settings", { worldNumber: Number(worldNumberInput.value) }).catch(() => {
    worldNumberInput.value = String(currentSnapshot.settings.worldNumber);
  });
});

founderGenomeInput.addEventListener("change", () => {
  postJson("/api/settings", { founderGenome: Number(founderGenomeInput.value) }).catch(() => {
    founderGenomeInput.value = String(currentSnapshot.settings.founderGenome);
  });
});

fireEnabledInput.addEventListener("change", () => postJson("/api/settings", { fireEnabled: fireEnabledInput.checked }));
fireIgnitionInput.addEventListener("change", () => postJson("/api/settings", { fireIgnitionRate: Number(fireIgnitionInput.value) }));
fireSpreadInput.addEventListener("change", () => postJson("/api/settings", { fireSpreadChance: Number(fireSpreadInput.value) }));
fireDurationInput.addEventListener("change", () => postJson("/api/settings", { fireDuration: Number(fireDurationInput.value) }));
fireIgnitionInput.addEventListener("input", () => { fireIgnitionValue.textContent = Number(fireIgnitionInput.value).toFixed(3); });
fireSpreadInput.addEventListener("input", () => { fireSpreadValue.textContent = Number(fireSpreadInput.value).toFixed(2); });
fireDurationInput.addEventListener("input", () => { fireDurationValue.textContent = fireDurationInput.value; });

canvas.addEventListener("click", (event) => {
  const organism = renderer.findOrganismAt(event.clientX, event.clientY);
  selectedOrganismId = organism?.id ?? null;
  if (currentSnapshot) {
    renderGenomeInspector(currentSnapshot);
  }
});

loadSnapshot();
setInterval(loadSnapshot, 200);
