# Primes

Primes, also called Project Genesis, is a long-term Artificial Life research project built around a server-driven simulation engine. Its central hypothesis is that prime factorization can serve as a canonical language for generation: a prime represents one irreducible generator, while a composite represents their composition.

## Current research state — Phase 16 Energy Logistics

Project Genesis now has a functioning structural ecology: organisms can form bonds, closed triangular facets, larger bonded components, complete consensus gates, harvest physical gate-field food, and migrate between finite gate opportunities. The current research question is no longer whether visible structure can form. It is whether a **collective** can persist as an identifiable entity across energy cycles, migration, and member turnover.

Current live demonstrations use seed `160103`. They enable bounded component lifecycle (`harvest → conserve → migrate`) and bounded migrating-component transport. These are experimental mechanisms, not claims of long-horizon stability. They create no energy, food, global target, or teleportation; transport reduces only the existing movement charge of a coherent strong bonded component travelling toward a locally sensed gate.

The principal empirical findings so far are:

- finite individual energy storage was a genuine bottleneck, but removing storage overflow alone did not create persistence;
- gate-centred collective work is survival-critical in the resource-limited task ecology;
- components can form, migrate, and repeatedly exploit gates, but migration remains the dominant energy leak;
- transport improves short-horizon component energy retention and structural richness, while requiring longer replicated persistence tests;
- cumulative facet-work heatmaps show gate-centred structural-work regions distinct from ordinary food-bearing foraging space.

The research record is maintained in:

- `PHASE_16_ENERGY_LOGISTICS.md` — protocols, causal results, and interpretation constraints;
- `RESEARCHER_UPDATE_ENERGY_LOGISTICS.md` — concise researcher-facing summary;
- `NEXT_SESSION_HANDOFF.md` — the next instrumentation phase: longitudinal collective identity and morphology analysis.

The first measurement layers are now active: every 20 ticks, the server records raw topology and economics for each strong-facet bonded component—members, bonds, facets, density, cycles, bridge fragility, branching, spatial extent, energy, reserves, and gate context—then conservatively links only unambiguous consecutive samples using member/direct-descendant continuity plus bond, facet, and spatial evidence. The next planned work is replicated longer longitudinal analysis asking whether any collective outlives the organisms that founded it. No new biological mechanism is required for that question.

## Topology-native pulse and motif memory

The topology-native memory layer is an opt-in research mechanism (`bond.topologyMemory.enabled`, currently `false`). It preserves the baseline formation rules and does not use remembered world coordinates or privileged shapes. Live degree determines roles: degree-one terminals can explore, degree-three-or-higher nodes can relay, and non-terminal members of cyclic components are structural cores.

Useful outcomes—food return, gate completion, productive migration, member support, and reproduction—share the existing bounded pulse path. A pulse attenuates across the component's current bonds and reinforces only the nodes and edges it reaches. Traces decay continuously. Component reserves remain the only energy source: they are capped, protect source survival and reproduction first, then support members and weak bond reserves.

When enabled, the server also records topology signatures made from component size, bond count, cycle rank, and degree sequence. Repeated successful pulses consolidate a signature into a motif trace; a five-node ring can therefore become a learned memory without any pentagon whitelist. Consolidated motifs may modestly protect an existing adjacent edge and qualify a stable, surplus-bearing component for structural reproduction. They cannot create edges, create energy, prevent separation, or make a bond immortal. Newborns inherit only a capped, noisy fraction of local node trace.

The layer is intentionally measured against the same seed and tick horizon with the switch off and on before changing live defaults. Diagnostics expose role counts, motif counts, consolidation, topology traces, pulse paths, and reserve throughput in the bonding snapshot.

## Historical foundations: Phases 13–15.5

Phase 14 added distributed state without introducing a new prime. Prime 13 retains an organism's prior-tick state, and Prime 31 exposes that value one active bond hop away as an anonymous generated graph input. Phase 13 ecological differentiation remains active: food has green, blue, and red resource identities, and every tile has locally exhaustible fertility.

Structural homeostasis makes the world energy budget inspectable. Fertility-driven food regrowth is recorded as primary productivity, while bonds can return a small, lossy reserve transfer to an attached low-energy member. Bonds store and redistribute existing energy; they never create it.

Structural inheritance lets an actively bonded Prime-31 parent bud a child into an adjacent open tile. If the child retains Prime 31, its parent invests energy into a weak bond seed that must mature under the normal proximity and maintenance rules. Mutation can still remove Prime 31, producing an unbonded descendant.

Phase 15 begins distributed processing with collective navigation. Bonded Prime-17 organisms pool only their generated directional scores, then translate in the strongest legal collective direction. A resource's score depends on the observer's existing metabolic expression; no bond member transmits an action or receives a hard-coded food target.

Strong closed facets also receive bounded collective harvest capital only when a member consumes a resource. This capital belongs to the exact three-member topology, not to any body or ordinary bond reserve. When it reaches the birth threshold, it can seed two inherited bonds for a locally born Prime-31 child. A child that mutates away Prime 31 cannot inherit this capital. The UI reports held and spent capital separately from world primary productivity.

Phase 15.5 gives structure an ecological role. Red food is low-energy catalytic material: a strong closed Prime-31 facet can retain it, then spend one catalyst after twelve maintained ticks near detritus or ash to restore that local patch. Refining consumes existing material, restores fertility, and releases ordinary local food and nutrients; it never deposits energy directly into an organism or creates primary productivity. Every completed restoration also creates one bounded facet-owned nursery credit, which can provide a local structural birth opportunity only when the child retains Prime 31.

Strong facets use their existing Prime-17 directional field contextually: catalyst-poor facets value nearby red food, while catalyst-loaded facets value nearby detritus and ash. Global reproduction opportunity is deliberately bounded at 16%, leaving time for this delayed ecological cycle to matter.

Environmental state is represented as named world layers. Fertility is the first canonical layer and remains compatible with the existing chemistry view; future layers such as moisture, shelter, temperature, or signal conductivity can be added without changing tile identity.

## Collective work: consensus gates

Consensus gates are the first explicit problem-solving task in the world. Each visible three-port gate alternates between an **observe** phase and a **respond** phase. During observation it gives nearby Prime-19 organisms different local signal fragments. A complete, strong facet whose members also carry Prime 13, 19, and 31 must retain and exchange those fragments, then hold one converged state band through the response phase. The task measures agreement, not impossible exact recall of a continuously changing floating-point value. After the required consecutive consensus ticks, the gate releases a bounded set of ordinary food units nearby.

The gate never transfers energy into organisms. Success activates a visible, local production field that gradually creates ordinary food at the three work ports physically occupied by the responsible facet. Its green aura and port rings disappear if that facet leaves or dissolves, and it fades unless consensus is renewed; a nearby working facet’s existing Prime-17 field scores the active region as valuable and can harvest the resulting food. An individual cannot complete the task because it cannot form a three-member closed facet or receive direct neighbor state. This is deliberately an unfamiliar computational ecology rather than an imitation of a known food chain: facets are being tested as small distributed state machines with a survival-relevant job.

The Evolution Lab’s gate screen compares matched **gate-enabled** and **gate-disabled** worlds. It fixes food, mutation, reproduction, founder mix, and seed, disables the refinery in both arms, and records gate attendance, completions, gate-derived food, Prime-31 frequency, bonds, facets, lineage age, and extinctions. It is a selection test, not a reward guarantee.

Mobile couriers are disabled by default and can be enabled from Settings for a controlled experiment. A loose high-energy organism with Prime 19 and Prime 13 can carry one finite report only about a nearby actionable gate: its location and ready/observe phase. Food remains locally sensed by Prime 17 and is deliberately not courier-reported. When a scout comes near a bonded facet compound, the compound briefly retains that gate report and its Prime-17 directional scores gain an added gradient toward the reported location. Cyan rings identify active gate reports. The Evolution Lab includes matched gates-with-couriers and gates-without-couriers controls.

The canvas retains an observational **facet-work trail**. Each tick that a strong closed facet occupies a cell adds a faint persistent gold heat value to that cell. It resets with the world and is never read by organisms or used by any ecological rule. Long runs therefore reveal where structural work concentrated, migrated, or disappeared without altering the simulation being measured.

## Phase 16: Environmental Memory

Every cell now has a neutral `[0, 1]` environmental-memory scalar with slow deterministic decay and synchronous cardinal diffusion. Prime 41 adds an energy-costly graph write effector; Prime 43 adds a graph read sensor. Neither has a built-in interpretation and environmental memory never directly changes food, energy, movement, reproduction, signals, gates, or any other ecological system. The Settings panel can show or hide its blue-purple visualization without altering the layer. The Evolution Lab compares memory-disabled, write-only, read-only, and read+write mutation availability conditions under the same gate ecology.

## Energetic Economics

Energetic Economics is an observation phase, not a new survival mechanism. Every organism now retains a lifetime energy ledger and the simulation aggregates it into 100-tick windows. The ledger separates food and gate-work income from movement, baseline/genome maintenance, perception, bond coupling, memory writing, signals, and idle costs. Reproduction and structural bond seeding are reported as **allocations**: they move energy into a child or structural reserve rather than destroy it. Each death records its immediate cause, while the world reports food energy that remains physically available but unharvested. This makes a population crash inspectable without falsely treating energy transfers as costs or claiming that all available food was accessible.

The ledger also records surplus discarded at an organism's finite energy-storage ceiling. An initial capacity mechanism screen shows that reducing this overflow greatly increases short-run births and facets, but it also produces much denser populations. Storage capacity therefore remains an experimental variable, not a new live-world rule, until long-horizon replicated persistence results are available.

An additional disabled-by-default structural-overflow experiment can retain a lossy fraction of otherwise discarded surplus in an existing bond or closed-facet reserve. The first matched screen found a small directional benefit for bond capture and an unfavorable facet-capture result because reserve capacity fills quickly. It is an experimental diagnostic, never an automatic live-world subsidy.

The live world now enables a separate **critical-only one-hop relay**: after ordinary direct bond support fails, a member at energy `<= 2` may receive one bounded, lossy relay from an adjacent reserve-rich bond through their shared partner. It is not a global pool, cannot help loose organisms, respects reserve floors and capacities, and remains available as an off control for matched experiments. Its short-run evidence is promising but not yet a long-horizon persistence claim.

## Phase 16: Energy Logistics

Energy Logistics extends the ledger into a bounded per-tick research time series. It records population turnover, energy stocks and flows, bond and facet reserves, gate activity, reproductive investment, lineage longevity, and energy inequality (minimum, maximum, mean, median, standard deviation, and Gini coefficient). It is diagnostic only: no ecological rule changes. The full protocol and interpretation constraints are in `PHASE_16_ENERGY_LOGISTICS.md`.

The live default seed is `160103`, selected because it reproducibly exhibits a rich early structural phase under the current configuration. It is a demonstrator and research baseline, not a claim of guaranteed long-horizon persistence; changing world settings or the seed defines a different experiment.

The first 1,000-tick matched screen established that gates are survival-critical in the task-rich resource-limited setting: all gate-disabled replicates went extinct, while gate-enabled replicates persisted and reached later generations. Gate production is now port-coupled to the three occupied cells of the exact working facet and records provenance on every food unit. A matched 500-tick production sweep found a viable high-output port regime: 95 mean final facets and 56.7 bonds, versus 5 facets and 13.3 bonds for the matched diffuse-field control. The default port rate is therefore 0.9 ordinary food units per field-strength tick. Output remains physical and contestable; the remaining research question is its longer-horizon stability, not whether it can support a rich structural phase. Full method and results are in `EVOLUTIONARY_VALIDATION_HANDOFF.md`.

## Niche-dependence experiment

The current ecology experiment deliberately avoids terrain. All four conditions use the same open world, founder population, chemistry, mutation rate, and Prime-31 starting frequency. They differ only in background food supply and whether a refined patch is actively maintained.

- **Abundant:** ordinary food is plentiful, so a facet niche should provide little selective advantage.
- **Intermediate:** ordinary food is reduced; a maintained niche may improve local reliability without being essential.
- **Scarce, maintained:** background food is scarce. A facet that has completed a refinery restoration holds a bounded engineered-fertility gradient. That gradient decays without the facet, and while it is maintained it receives a limited number of preferential local food-growth attempts. It creates food as normal primary production; it never transfers energy directly to organisms.
- **Scarce, maintenance disabled:** the matched negative control. Refinery restoration can still occur, but its gradient is allowed to decay and receives no continuing reinforcement.

This design makes the causal claim testable: if maintained facets are ecologically necessary, scarce-maintained runs should retain more structural lineages, active bonds, and refinery/niche activity than the matched maintenance-disabled control. It does **not** assume the result; the lab records extinctions and failed invasions too.

## Foundational Phase 7 goals

- Establish a clean simulation engine with clear module boundaries.
- Construct the running physics configuration from a factorized world number.
- Register each supported prime-to-generator mapping in one inspectable server-side registry.
- Show the active recipe, factorization, and generator chain in the browser UI.
- Give every organism an inspectable prime-factor genome and generated capability profile.
- Preserve an organism's genome unchanged across reproduction.
- Generate and inspect a deterministic brain graph for every organism.
- Execute generated brain graphs on every simulation tick without behavior trees or neural networks.
- Mutate heredity through prime arithmetic only; never rewrite a graph directly.
- Make Prime 13 a general persistent-node primitive.
- Make every experiment deterministic and reproducible from a server-owned world seed.
- Keep the simulation running on the server as the source of truth.
- Provide a browser control panel to start, pause, resume, step, reset, and randomize the world.
- Expose extension points for future phases: genomes, virtual CPU, memory, mutation, communication, and richer evolution.

## Prime roadmap boundary

The project will not hardcode intelligence. Phase 3 registers `2` movement, `3` energy, `5` resources, `7` reproduction, and `11` terrain. The default world recipe is `2310 = 2 x 3 x 5 x 7 x 11`; `210 = 2 x 3 x 5 x 7` omits terrain. Phase 4 uses the founder genome `210 = 2 x 3 x 5 x 7`: locomotion, metabolism, digestion, and reproduction. Phase 6 executes the resulting graph: energy and food sensors feed energy state, movement, consumption, and reproduction effectors. Prime-17 organisms now generate cardinal direction outputs from their neighborhood inputs; the server moves them along the strongest legal graph-selected direction. Organisms without Prime 17 retain random movement as a sensory fallback.

## Project structure

- `package.json`: minimal Node.js scripts for running the project.
- `server/index.js`: static file server plus JSON API for simulation control and snapshots.
- `server/simulation/config.js`: all simulation constants and tunable defaults.
- `server/simulation/prime-registry.js`: Phase 3 factorization and inspectable prime-to-generator registry.
- `server/simulation/generator-engine.js`: constructs a physics configuration from a registered prime composition.
- `server/simulation/genome-engine.js`: Phase 4 deterministic organism genome construction.
- `server/simulation/brain-generator.js`: Phase 5 deterministic brain graph generation.
- `server/simulation/brain-executor.js`: graph propagation, persistent-node state, and effector output engine.
- `server/simulation/mutation-engine.js`: Phase 7 arithmetic genome mutation engine.
- `server/simulation/utils.js`: reusable math, randomization, color, and formatting helpers.
- `server/simulation/world.js`: toroidal tile world with resources, fertility, chemistry, and wall management.
- `server/simulation/organism.js`: organism model, graph-based directional selection, resource metabolism, persistent state, and one-hop bonded-state sensing.
- `server/simulation/simulation.js`: core engine, lifecycle rules, statistics, scheduling, and control actions.
- `public/index.html`: control panel and canvas application shell.
- `public/style.css`: responsive visualization and dashboard styling.
- `public/renderer.js`: canvas renderer for tiles, organisms, and optional grid.
- `public/main.js`: browser UI controller, polling loop, and API interactions.

## How it works

The server owns the entire simulation state. The browser never simulates organisms locally. Instead:

1. The Node.js server runs a long-lived `Simulation` instance.
2. The UI fetches snapshots from the API at a steady rate.
3. Control actions from the UI call server endpoints.
4. The renderer draws the latest server snapshot onto a canvas.

This keeps the architecture aligned with future deployment, persistence, and multi-client monitoring needs.

## Running locally

1. Open a terminal in the project folder.
2. Run `npm start`.
3. Open `http://localhost:3000`.

## API overview

- `GET /api/state`: current world snapshot, organisms, settings, and statistics.
- `POST /api/control`: control actions such as `pause`, `resume`, `step`, `reset`, and `randomize`.
- `POST /api/settings`: update speed, food growth rate, initial population, or grid visibility.

## Foundational Phase 7 behavior

- World size: `64 x 64`
- Tiles: `EMPTY`, `FOOD`, `WALL`
- Organisms: 24 by default
- Movement: graph-based cardinal choice for Prime-17 organisms; random fallback without directional perception
- Resources: green (Prime-5 digestion weighted), blue (Prime-3 energy weighted), and red (Prime-19 signal weighted)
- Fertility: harvesting lowers local fertility; slow recovery governs where food can regrow
- Default food growth: tuned to retain a small baseline population for the initial seed
- Energy: consumed by movement, restored by eating
- Reproduction: duplicates when energy passes a threshold
- Statistics: simulation time, fps estimate, population, births, deaths, average age, oldest organism, average energy, food count
- Reproducibility: resetting a world recreates it from its displayed seed; changing the seed creates a new inspectable experiment
- World recipe: the server factorizes `2310` by default and applies its registered generators to construct the active configuration
- Founder genome: `210` constructs locomotion (`2`), metabolism (`3`), digestion (`5`), and reproduction (`7`)
- Inspection: clicking a living organism reveals its factorization, generated capabilities, energy, age, and lineage
- Brain graph: clicking an organism also reveals its generated sensors, internal state nodes, effectors, and edges
- Brain execution: live node values propagate through the graph each tick and gate movement, food consumption, and reproduction
- Arithmetic heredity: a child has a 2% chance to gain Prime 13, lose one existing generator, or strengthen an existing generator through a prime power
- Prime powers: repeated `3` expands energy capacity, repeated `5` improves food energy with diminishing returns, and repeated `7` lowers the reproduction energy threshold with diminishing returns; Phase 7 caps powers at three
- Persistence: Prime `13` replaces direct energy-to-action links with a one-tick persistent state node, evaluated deterministically as read-then-write
- Ecology: food regrows up to an 18% world carrying capacity; amplified genes and persistence consume maintenance energy each tick
- Facet refinery: strong Prime-31 triangles can recover existing detritus or ash after sustained local contact; conversions, released food, and recovered nutrients are live telemetry

## Extension roadmap

Future phases can add:

- prime-based genomes or compositional encodings
- instruction sets and virtual CPUs
- mutable memory and sensors
- richer environments and resource types
- persistence with SQLite
- experiment logging and replay tools
- server deployment with PM2 and GitHub sync

Phase 7 makes inheritance arithmetic. Prediction, communication, abstraction, planning, and richer persistent structures remain future phases.

## Collective memory layer (switchable)

The experimental `bond.collectiveMemory` layer starts disabled and can be
enabled without changing the baseline seed or world recipe. Useful events emit
bounded pulses through existing bonds; organisms and bonds retain decaying
traces, and repeated event locations can provide a small movement and energy
routing bias. Pulses never create energy, override legal movement, or privilege
a named geometric shape. The current implementation covers food, gate
completion, migration arrival, reproduction, and member-support pulses;
inheritance/consolidation diagnostics are intentionally staged for later work.
