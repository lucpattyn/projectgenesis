# Primes

Primes, also called Project Genesis, is a long-term Artificial Life research project built around a server-driven simulation engine. Its central hypothesis is that prime factorization can serve as a canonical language for generation: a prime represents one irreducible generator, while a composite represents their composition.

Phase 14 adds distributed state without introducing a new prime. Prime 13 retains an organism's prior-tick state, and Prime 31 exposes that value one active bond hop away as an anonymous generated graph input. Phase 13 ecological differentiation remains active: food has green, blue, and red resource identities, and every tile has locally exhaustible fertility.

Structural homeostasis makes the world energy budget inspectable. Fertility-driven food regrowth is recorded as primary productivity, while bonds can return a small, lossy reserve transfer to an attached low-energy member. Bonds store and redistribute existing energy; they never create it.

Structural inheritance lets an actively bonded Prime-31 parent bud a child into an adjacent open tile. If the child retains Prime 31, its parent invests energy into a weak bond seed that must mature under the normal proximity and maintenance rules. Mutation can still remove Prime 31, producing an unbonded descendant.

Phase 15 begins distributed processing with collective navigation. Bonded Prime-17 organisms pool only their generated directional scores, then translate in the strongest legal collective direction. A resource's score depends on the observer's existing metabolic expression; no bond member transmits an action or receives a hard-coded food target.

Strong closed facets also receive bounded collective harvest capital only when a member consumes a resource. This capital belongs to the exact three-member topology, not to any body or ordinary bond reserve. When it reaches the birth threshold, it can seed two inherited bonds for a locally born Prime-31 child. A child that mutates away Prime 31 cannot inherit this capital. The UI reports held and spent capital separately from world primary productivity.

## Phase 7 goals

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

## Phase 7 behavior

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
