# RFC: 2.5D Habitat Renderer

## Status

Accepted for Moonlake by Owner on 2026-07-28. The production contract is
`docs/design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md`; that document supersedes
the former sandbox-only and no-Three.js restrictions below for Moonlake only.

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

- Canonical runtime remains PixiJS + DOM, with a controlled Three.js environment canvas for Moonlake.
- Three.js does not replace companion rendering, DOM UI, store, save or RaphaelCore.
- Fixed-version Three.js CDN ES Modules are allowed; Tauri, Electron, Capacitor, React Three Fiber, TypeScript, npm and build steps remain prohibited.
- Production integration must preserve a static fallback and must not use save state as renderer-owned data.

## Entry criteria for a future prototype

1. The production contract defines renderer ownership, DOM/Pixi/Three boundaries, performance budgets, input routing and rollback.
2. Desktop and mobile focal-zone behavior must be proven before release.
3. Acceptance covers live companion visibility, frame time, memory pressure, accessibility, responsive sizing, and Raphael/Soul Talk continuity.
4. Human approval is obtained before any canonical integration task is opened.
