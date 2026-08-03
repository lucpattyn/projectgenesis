# Evolutionary Validation Handoff

Date: 2026-08-03

## Purpose

Project Genesis has reached the point where the primary question is no longer whether a capability can be implemented. The question is whether ecological conditions select for that capability.

The long-term direction is described in the LinkedIn article, [Project Genesis - A World Written in Prime Numbers](https://www.linkedin.com/pulse/project-genesis-world-written-prime-numbers-ataul-mukit-sddjf/): use prime-factorized, interpretable genomes to explore the emergence of resilient organizations, distributed computation, and adaptive system architectures.

## Current State

- World recipe: `85470 = 2 x 3 x 5 x 7 x 11 x 37`.
- Structural founder genome: `27335490 = 2 x 3 x 5 x 7 x 13 x 17 x 19 x 31`.
- Prime 31 is structural coupling: generated Bind activity, bonds, facets, topology-aware birth seeds, collective navigation, and one-hop distributed state.
- Facets now own harvest-derived structural capital. The capital is not individual energy or ordinary bond reserve. It can only seed two inherited bonds for a local Prime-31 child.
- Prime 13 remains present in the winning non-structural lineage; the current collapse was specifically selection against Prime 31, not against persistence.

## Key Observation

In the unrestricted live baseline at approximately 394 simulation seconds:

- Population: 470.
- Food units: 251.
- Mean organism energy: 170.2.
- Active bonds and facets: 0.
- Bonds formed and broken: 4,076 / 4,076.
- Facet-funded births: 396.
- Prime-31 carriers: 2 / 470.
- Dominant genome: `881790 = 2 x 3 x 5 x 7 x 13 x 17 x 19`.

The dominant genome is exactly founder genome `27335490 / 31`. This rules out a simple "food ran out" explanation: food and organism energy remained positive while coupling disappeared.

## Diagnostic Experiment

A population-bounded, single-seed screen ran for 500 ticks using:

- Founder genome `27335490`.
- Seed `314233858`.
- Initial population 72.
- Mutation rate 0.02, intentionally elevated to accelerate a diagnostic screen.
- Food target density 0.22 and growth rate 0.45.
- Habitat reproduction fraction 0.05, used only to cap runtime population.

Results:

| Condition | Prime-31 carriers | Active bonds | Peak bonds | Facet births |
| --- | ---: | ---: | ---: | ---: |
| Coupling maintenance 0.10 | 52 / 196 (26.5%) | 76 | 337 | 71 |
| Coupling maintenance 0.02 | 103 / 194 (53.1%) | 138 | 435 | 136 |

Interpretation: lowering the private maintenance cost substantially improves Prime-31 retention and structural activity. This is a diagnostic, not a publishable result: it used one seed and modified population and mutation settings for runtime control. Both conditions exhausted visible food by the final tick.

## Why Bonds Collapse

1. Prime 31 has direct private costs: coupling maintenance, meal allocation to bond reserves, and collective movement constraints.
2. A `divide by 31` mutation keeps all other founder capabilities while escaping those costs.
3. Facet capital is bound to an exact closed triangle and disappears when that topology breaks; its benefit is therefore intermittent and fragile.
4. Bonds require adjacency and continued generated Bind activity. Death, separation, or loss of binding causes strength decay and eventual breakage.
5. When Prime-31 carriers become rare, three-member structures are difficult to form. This is a frequency-dependent (Allee-effect-like) collapse.
6. The current ecology gives independent organisms enough reproductive success that no topology-level advantage offsets the individual cost.

This is an evolutionary result, not evidence that the bond system is broken.

## Exact Next Task

Implement **Phase 14.5: Evolutionary Validation Infrastructure**, beginning with a behavior-preserving spatial-neighbor index in `Simulation.updateBonds()`.

The existing pairwise candidate scan becomes expensive at several hundred organisms and prevented a 16-run, 1,000-tick batch from completing within the available execution window. Replace it with a spatial hash keyed by world cells, comparing each candidate only to organisms in its local wrapped neighborhood. Preserve the current wrapping-aware adjacency rule and inherited structural-seed logic exactly.

Then add a bounded, server-side batch experiment runner that:

- Runs deterministic seeds without rendering.
- Stores only aggregate run records and periodic samples, with a hard 100 MB limit.
- Records world recipe, founder genome, settings, seed, population, food, energy, Prime-31 frequency, bond count, facet count, facet capital, bond break causes, and lineage longevity.
- Supports at least baseline, low-coupling-cost, high-facet-return, and combined scenarios.
- Presents experiment status and aggregate comparison in a separate UI panel, not on the world canvas.

## Decision Rule Before New Biology

Do not add Sun, Seasons, Prime 23, Prime 29, or a rescue mechanism for bonds before replicated measurements exist. First determine whether structural coupling is favored by:

- Lower private cost.
- A real topology-only ecological advantage.
- Resource patchiness and local depletion.
- Delayed consequences that make distributed state useful.
- A topology-level reproductive event that produces more structural descendants without making bonds immortal.

