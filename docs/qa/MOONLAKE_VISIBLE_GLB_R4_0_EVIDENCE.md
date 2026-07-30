# Moonlake Visible GLB Feasibility R4.0 Evidence

Status: **VERIFIED FEASIBILITY / PROMOTION BLOCKED**

Date: 2026-07-30

Package: `TP-MOONLAKE-VISIBLE-GLB-FEASIBILITY-R4.0`

## Outcome

R4.0 proves that Moonlake can render the current GLB as a query-gated visible
Three.js environment while keeping all sixteen companions in the existing Pixi
2D layer. It does **not** approve the current GLB as the shipping Moonlake
visual.

The candidate is available only through:

```text
?live3d=1&moonlakeVisibleGlb=1
```

`shippingDefault` remains `false`. Without the query, the Owner-approved R2
raster/live-diorama presentation and the published R3.6 bridge-compositing fix
remain unchanged.

## Asset audit

Source:
`assets/3d/moonlake/moonlake_clay_resin_r3.glb`

- Bytes: `3,098,820`
- SHA-256:
  `60423EDAA8C15C519A8A596BC8DF007662E46F9D575C56571F3AA4E611C4B1A6`
- Blender mesh objects: `7`
- Blender triangles: `66,726`
- Source materials: `4`
- Object groups: environment, platform, backdrop, campfire, water, tent A,
  tent B
- Asset mutation: none

The browser loader exposes seven visible mesh primitives after the backdrop and
water primitives are deliberately hidden. The live water, waterfalls, grass and
weather rig remain Three.js geometry in candidate mode.

## Sixteen-companion result

The 390x844 browser matrix covered all sixteen current runtime companions at:

- `platform_center`
- `bridge_near`
- `bridge_mid`
- `bridge_far`

Result: `64/64` candidate-camera projections resolved, used
`projectionMode: "three_camera"`, remained visible, and kept the Pixi opaque-foot
anchor within the asserted drift tolerance. This verifies the 2D companion /
3D world projection seam for every current runtime carrier.

The matrix also found `32` promotion blockers: every companion at
`bridge_mid` and `bridge_far` intersects the legacy R2 raster collision map.
The collision is against `crystal-bridge-right-base`, which belongs to the
hidden raster composition and has no equivalent visible candidate object.
Therefore the current navigation safety map is not valid for a shipping
GLB-first scene.

## Performance and recovery

Standard 30-second mobile probe:

- Viewport: `390x844`
- Frames: `400`
- Median frame time: `66.7 ms`
- Contract threshold: `<= 25 ms`
- Rendered triangles observed: `84,440`
- Performance promotion gate: **FAIL**

WebGL context loss and restoration both completed successfully. Static
`?live3d=0` fallback kept the game root visible. No page or console errors were
recorded.

## Human visual review

The visible result reads as a colored structural blockout, not the
Owner-approved miniature-quality Moonlake:

- cliffs are simple massing with sparse repeated vegetation;
- the bridge is disconnected white block geometry rather than a finished
  walkable authored bridge;
- tents and campfire lack the R2 material, silhouette and prop detail;
- foreground terrain, foliage depth and composition framing are insufficient;
- the scene does not meet the premium clay/resin or Ragnarok Online-like 2.5D
  bar.

Human visual promotion gate: **BLOCKED**

## Verification

Passed:

```text
node docs/qa/moonlake-visible-glb-r4-0-cases.mjs
node docs/qa/moonlake-visible-glb-r4-0-browser.cjs
node docs/qa/moonlake-bridge-compositing-r3-6-cases.mjs
node docs/qa/moonlake-bridge-compositing-r3-6-browser.cjs
node docs/qa/moonlake-occlusion-seam-r3-5-cases.mjs
node docs/qa/moonlake-occlusion-seam-r3-5-browser.cjs
node docs/qa/moonlake-nav-collision-scale-r3-3-cases.mjs
node docs/qa/moonlake-nav-collision-scale-r3-3-browser.cjs
```

The R4.0 browser harness passing means the diagnostic run completed and wrote
its evidence. Its explicit `promotionReady` field is `false`.

## R4.1 entry criteria

Do not flip the shipping default using this GLB. A separately approved R4.1
GROUNDWORK asset package should:

1. create a new parallel GLB instead of overwriting or deleting the R3 source;
2. rebuild the bridge as one continuous walkable deck with authored rails and
   route-aligned collision/navigation data;
3. match the approved R2 camera composition, foreground depth, cliffs, tents,
   foliage, water and waterfall quality in Blender-authored geometry/materials;
4. reduce the complete visible scene to the mobile `<= 25 ms` median frame-time
   contract;
5. rerun all sixteen companions, both bridge directions, day/night/rain/mist,
   context recovery and static fallback;
6. obtain Owner human visual approval before changing `shippingDefault`.

