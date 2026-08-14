# Moonlake Visible GLB R4.1A Evidence

Status: **MECHANICALLY VERIFIED / OWNER VISUAL REVIEW REQUIRED**

Date: 2026-07-30

Package: `TP-MOONLAKE-VISIBLE-GLB-AUTHORING-R4.1A`

Branch: `codex/moonlake-visible-glb-r4-1a`

Base: `b8c76be0ccf1486bb6240cbf632bb64feed9bc38`

## Outcome

R4.1A adds a parallel, reproducible Blender-authored Moonlake GLB. It replaces
the disconnected structural bridge blocks with one continuous deck and
provides stable semantic, navigation and collision nodes for future R4.1B
runtime integration.

It does not change `src/**`, the shipping default, the R2 visual master, the R3
GLB or any companion asset.

## Files

- Authoring source:
  `tools/moonlake/author_moonlake_visible_r4_1.py`
- Mechanical validator:
  `tools/moonlake/validate_moonlake_visible_r4_1.py`
- Parallel GLB:
  `assets/3d/moonlake/moonlake_visible_r4_1.glb`
- Deterministic GLB contract:
  `docs/qa/moonlake-visible-glb-r4-1-cases.mjs`
- Authoring specification:
  `docs/art/MOONLAKE_VISIBLE_GLB_R4_1_AUTHORING_SPEC.md`

## GLB audit

- Bytes: `1,089,460`
- SHA-256:
  `D0DC9FF8DDE98213BC51A3D75B513D5D978393473CC2AAF4C19A51669CCAE8F2`
- glTF version: `2.0`
- Nodes: `104`
- Meshes: `58`
- Primitives: `62`
- Imported triangles: `19,116`
- Shared materials: `14`
- Cameras: `1`
- Embedded images/textures: `0`
- Negative transforms: `0`
- Navigation nodes: `5`
- Collision nodes: `5`

The authoring pass initially created 354 renderable mesh/curve objects. Static
geometry was merged only within semantic owner/material boundaries, producing
58 runtime mesh objects while preserving the bridge planks, root hierarchy,
navigation points and collider extras.

## Bridge proof

- Continuous-deck extra: `true`
- Authored planks: `18`
- Minimum deck width: `2.25 m`
- Measured maximum clear gap: `0.00944 m`
- Accepted maximum gap: `0.03 m`
- Near-shore overlap: `0.60 m`
- Far-bank overlap: `1.10 m`
- Ordered waypoints: near -> mid -> far
- Walkable collider half extents: `[1.125, 4.6, 0.18]`

This bridge is authored geometry. It does not use shader widening, disconnected
white stepping blocks, detached rails or a floating landing disc.

## Preserved source proof

`assets/3d/moonlake/moonlake_clay_resin_r3.glb` remains:

```text
60423EDAA8C15C519A8A596BC8DF007662E46F9D575C56571F3AA4E611C4B1A6
```

No existing `assets/**` file was modified or removed.

## Portrait visual review

The fixed Blender camera rendered four `390x844` review states outside the
repository:

- `%TEMP%/nexuslink-moonlake-visible-r4-1a/`
  `moonlake-visible-r4-1-day-clear-390x844.png`
- `%TEMP%/nexuslink-moonlake-visible-r4-1a/`
  `moonlake-visible-r4-1-dusk-mist-390x844.png`
- `%TEMP%/nexuslink-moonlake-visible-r4-1a/`
  `moonlake-visible-r4-1-night-clear-390x844.png`
- `%TEMP%/nexuslink-moonlake-visible-r4-1a/`
  `moonlake-visible-r4-1-day-rain-proxy-390x844.png`

The first side-biased camera attempt was rejected during review because it
cropped one cliff and one tent. The accepted evidence camera is centered and
shows both cliffs, both waterfalls, the complete bridge, both tents, the
platform and foreground foliage.

Codex visual assessment:

- clearly resolves the R4.0 white-block bridge failure;
- reads as a coherent fixed-camera clay/resin low-poly diorama;
- preserves an open companion focal area on the platform;
- is a credible authored foundation rather than another structural-only GLB;
- remains intentionally simpler and less richly surfaced than the premium R2
  raster master.

Owner review is required before calling the visual approved or starting R4.1B.

## Verification

Passed:

```text
python -m py_compile tools/moonlake/author_moonlake_visible_r4_1.py
python -m py_compile tools/moonlake/validate_moonlake_visible_r4_1.py
node docs/qa/moonlake-visible-glb-r4-1-cases.mjs
blender --background --factory-startup --python \
  tools/moonlake/validate_moonlake_visible_r4_1.py -- \
  --glb assets/3d/moonlake/moonlake_visible_r4_1.glb \
  --preserved-r3 assets/3d/moonlake/moonlake_clay_resin_r3.glb
blender --background --factory-startup --python \
  docs/qa/moonlake_live3d_glb_audit.py -- \
  assets/3d/moonlake/moonlake_visible_r4_1.glb
git diff --check
```

## R4.1B gate

R4.1B remains blocked until the Owner accepts the portrait renders. After
approval it may:

1. add a query-gated runtime asset selection for the R4.1 GLB;
2. map the authored navigation/collision extras into the existing renderer
   adapter;
3. run the complete sixteen-companion projection, traversal, fishing,
   occlusion and foot-anchor matrix;
4. measure the standard 30-second `390x844` browser performance probe;
5. verify day/dusk/night/rain/mist, reduced motion, context recovery and static
   fallback;
6. keep `shippingDefault:false` until a separate runtime visual approval.
