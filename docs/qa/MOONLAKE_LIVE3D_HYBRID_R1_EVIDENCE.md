# Moonlake Live 3D Hybrid R1 Evidence

Date: 2026-07-28

Task: `TP-MOONLAKE-LIVE-3D-R1`

Branch: `codex/moonlake-r5-integration`

## Delivered contract

- One Three.js WebGL environment canvas below the existing PixiJS canvas.
- Real 3D clay/resin terrain, two close waterfall cliffs, lake, two ornate
  blue/ivory/gold tents, compass platform, shrubs, trees and a traversable
  sixteen-plank bridge.
- Continuous low-amplitude lake and waterfall animation.
- Deterministic asynchronous grass sway.
- Existing `clear`, `rain` and `mist` weather authority connected to the 3D
  scene.
- Existing `day`, `dusk`, `night` and `dawn` time authority connected to
  directional light, ambient light, fog, sky and exposure.
- Existing illustrated 2D companion renderer preserved above the 3D scene.
- All sixteen runtime companions, including Greyshade Cat, use projected 3D
  world waypoints with four-direction walking and bounded fishing at the far
  bank.
- Static Pixi habitat remains available when WebGL, Three.js or GLB loading is
  unavailable.

The audited Claude/Blender GLB remains the structural source. Its rough
render-only meshes are not displayed directly; the runtime reskin uses
optimized procedural Three.js clay/resin geometry while retaining the audited
scale and bridge measurements.

## Automated verification

| Check | Result |
| --- | --- |
| Blender GLB audit | PASS — 3,098,820 bytes, 7 meshes, 66,726 triangles |
| Bridge geometry audit | PASS — 16 planks, 1.4 m minimum width, 0.03 m maximum gap, both shores overlap |
| 3D roaming path | PASS — all four directions, one full bridge traversal, far-bank fishing point, reduced-motion fallback |
| Promoted sprite sheet QC | PASS — 68 promoted sheets / 16 companions |
| Browser action matrix | PASS — 16 companions × 7 actions = 112 loads, 0 failures, 0 console errors |
| Weather/time | PASS — clear, rain, mist; day, dusk and night diagnostics |
| WebGL context lifecycle | PASS — loss detected, restoration detected, reload returns one 3D canvas |
| Static fallback | PASS — `?live3d=0` returns Pixi habitat, no Three canvas |
| 390×844 soak | PASS — 30.002 s, 1,801 frames, 60.03 FPS in the automated desktop browser |
| Full web release gate | PASS — 28/28, no accessibility warnings |
| Syntax / whitespace | PASS |

The soak number is automated desktop-browser evidence at a mobile viewport,
not a substitute for physical low-end Android/iOS testing.

## Local visual evidence

- `output/playwright/moonlake-live3d-day.png`
- `output/playwright/moonlake-live3d-night-rain.png`

These screenshots remain ignored QA output and are not runtime dependencies.
