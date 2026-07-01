# RFC: Future 2.5D Habitat Renderer Prototype

## Status

Future prototype lane. This RFC does not authorize a runtime change.

## Proposed composition

```text
3D / 2.5D habitat background
        +
2D illustrated companion
        +
HTML/CSS UI overlay
        +
Raphael / Soul Talk runtime
```

The visual target may take inspiration from RO-like 2.5D depth and staging: a spatial habitat, illustrated companion readability, and an unobstructed interaction focal zone. The companion remains a 2D illustrated entity with bottom-center anchoring; it is not converted into a 3D model by this proposal.

## Boundaries

- Canonical runtime remains the current PixiJS + DOM architecture.
- This RFC does not replace `src/pixi/pixiApp.js`, companion rendering, or RaphaelCore.
- Do not add Three.js, Tauri, Electron, Capacitor, a build step, or new dependencies to `main` for this exploration.
- A prototype must be isolated in a sandbox and cannot reuse production save state as an experimental data store.

## Entry criteria for a future prototype

1. A separate ADR defines renderer ownership, DOM/Pixi boundaries, performance budgets, input routing, and rollback.
2. A sandbox prototype proves desktop and mobile focal-zone behavior without altering canonical runtime files.
3. Acceptance covers live companion visibility, frame time, memory pressure, accessibility, responsive sizing, and Raphael/Soul Talk continuity.
4. Human approval is obtained before any canonical integration task is opened.
