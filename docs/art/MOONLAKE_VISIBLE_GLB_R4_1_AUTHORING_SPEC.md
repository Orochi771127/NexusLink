# Moonlake Visible GLB R4.1 Authoring Specification

Status: Owner-approved GROUNDWORK package `R4.1A`

Date: 2026-07-30

## 1. Purpose

Create a parallel, reproducible Blender-authored Moonlake environment that can
eventually replace the hidden structural blockout in the fixed-camera
Three.js/PixiJS hybrid. R4.1A stops at asset construction, mechanical audit and
portrait visual review. Runtime wiring belongs to R4.1B after human approval.

The approved R2 visual master remains the composition and quality reference.
The existing R3 GLB remains immutable historical/runtime evidence.

## 2. Output contract

- Authoring source:
  `tools/moonlake/author_moonlake_visible_r4_1.py`
- Mechanical validator:
  `tools/moonlake/validate_moonlake_visible_r4_1.py`
- Parallel runtime candidate:
  `assets/3d/moonlake/moonlake_visible_r4_1.glb`
- Units: metres
- Blender authoring axes: `Z` up, `-Y` toward the far lake
- Shipping exchange: glTF 2.0 binary GLB, exporter-converted to glTF `Y` up
- Applied mesh transforms; semantic node names; no negative scale
- Size target: `<= 15 MB`
- Rendered triangle target: `<= 75,000`
- Shared material target: `<= 14`
- No external textures or files in R4.1A

## 3. Required composition

The fixed portrait camera must frame:

1. two close waterfall cliff masses in the upper-left and upper-right;
2. a readable lake channel between them;
3. one continuous bridge connecting the platform shore and far bank;
4. a central circular stone platform with open companion-readable space;
5. one blue/ivory and one purple/ivory tent outside the platform centre;
6. paired trees and restrained cyan/gold Cyber-Taoist accents;
7. dense but non-blocking foreground shrubs and flowers;
8. rounded clay/resin silhouettes with matte-satin material response.

The bridge must read as one deck. It cannot use disconnected block stepping
stones, runtime shader widening, detached rails or floating landing discs.

## 4. Semantic hierarchy

Required root groups:

- `R4_ENVIRONMENT`
- `R4_PLATFORM`
- `R4_BRIDGE`
- `R4_CLIFF_LEFT`
- `R4_CLIFF_RIGHT`
- `R4_TENT_LEFT`
- `R4_TENT_RIGHT`
- `R4_FOLIAGE`
- `R4_ACCENTS`
- `R4_NAVIGATION`
- `R4_COLLIDERS`

Required navigation/collision nodes:

- `NAV_PLATFORM_CENTER`
- `NAV_BRIDGE_NEAR`
- `NAV_BRIDGE_MID`
- `NAV_BRIDGE_FAR`
- `NAV_FAR_BANK`
- `COLLIDER_PLATFORM_WALKABLE`
- `COLLIDER_BRIDGE_WALKABLE`
- `COLLIDER_FAR_BANK_WALKABLE`
- `COLLIDER_TENT_LEFT`
- `COLLIDER_TENT_RIGHT`

Navigation and collider nodes use glTF extras to declare their role, shape and
dimensions. They are authoring/runtime metadata, not visible decoration.

## 5. Bridge geometry

- Nominal deck width: `2.25 m`
- Deck length: `8.4 m`
- Plank count: `18`
- Maximum clear gap: `0.03 m`
- Both endpoints overlap authored land by at least `0.35 m`
- Rails are continuous and follow the same deck datum
- `NAV_BRIDGE_NEAR`, `MID` and `FAR` lie on the visible deck centreline
- `COLLIDER_BRIDGE_WALKABLE` covers the entire continuous deck

## 6. Material system

Use shared physically based materials:

- moss light / moss dark;
- cliff stone;
- platform stone;
- warm wood;
- ivory canvas;
- blue canvas;
- purple canvas;
- restrained gold;
- foliage light / foliage dark;
- water;
- waterfall;
- cyan crystal;

No unique material may be created per rock, bush, plank, tree or flower.

## 7. Lighting and review

The GLB may carry a reference camera but runtime lighting remains Three.js
presentation authority. Blender review renders are evidence only.

Required portrait review states:

- day / clear;
- dusk / mist;
- night / clear;
- day / rain-lighting proxy.

Review resolution is `390x844`. The central platform, both tents, complete
bridge deck and both waterfalls must remain legible in every state.

## 8. R4.1A non-goals

- No `src/**` runtime integration.
- No shipping-default switch.
- No deletion or overwrite of R2/R3 assets.
- No companion asset generation or 3D companion.
- No gameplay, save, relationship, Growth, reward, Safety or RaphaelCore
  mutation.
- No new dependency, npm package or build step.

## 9. Promotion boundary

Mechanical validation does not equal visual approval. R4.1B may begin only
after the Owner accepts the portrait renders and confirms the new GLB is a
credible improvement over R2 rather than another blockout.
