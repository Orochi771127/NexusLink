# Moonlake R2 Separate Prop QC

## Base prop batch 1 - REJECTED FOR RUNTIME

Files:

- `raw/tent_near_left_base_v1_REJECTED_RGB_CHECKERBOARD.png`
- `raw/tent_near_right_base_v1_REJECTED_RGB_CHECKERBOARD.png`
- `raw/tent_mid_left_base_v1_REJECTED_RGB_CHECKERBOARD.png`
- `raw/tent_mid_right_base_v1_REJECTED_RGB_CHECKERBOARD.png`

Mechanical result:

- All four files are `1254x1254 Format24bppRgb`.
- All four corners are opaque and contain a baked white/gray checkerboard.
- None contains a usable alpha channel, so none may be normalized, composed or
  promoted as a runtime prop.

Visual result:

- Both near tents have complete silhouettes, consistent three-quarter camera,
  acceptable margins and useful distinct identities.
- The mid-left tent is too gray and loses the approved Moonlake blue-white plus
  warm-brass material identity.
- The mid-right tent retains some blue but is too muted.

Decision:

- Preserve these four only as rejected staging provenance.
- Run image editing to convert the baked checkerboard to genuine transparency
  while preserving ropes and finials.
- Recolor both mid tents to the shared blue-white/brass kit during the edit.
- Re-run format, alpha, corner, edge-touch and visual completeness checks before
  proceeding to normalization.

## Base prop batch 1 cutout and normalization - PASSED

Accepted staging runtime candidates:

- `runtime-candidate/tent_near_left_base.png`
- `runtime-candidate/tent_near_right_base.png`
- `runtime-candidate/tent_mid_left_base.png`
- `runtime-candidate/tent_mid_right_base.png`

Pipeline correction:

- A second image-generation attempt still returned opaque RGB checkerboards and
  was not accepted as transparency.
- The installed Adobe Photoshop background-removal capability produced genuine
  `1254x1254` ARGB cutouts without redrawing the approved tent designs.
- Adobe subject-preserving resize produced the four exact `512x512` ARGB PNGs.

Mechanical result:

- All four outputs are exact `512x512 Format32bppArgb`.
- All four corners have alpha `0`.
- Edge-touch pixels at alpha greater than 8: `0 / 0 / 0 / 0`.
- Alpha bounds and margins `(left, top, right, bottom)`:
  - near-left: `(23, 35, 48, 56)`
  - near-right: `(46, 40, 43, 79)`
  - mid-left: `(48, 63, 49, 72)`
  - mid-right: `(52, 37, 49, 56)`
- Pixels at alpha `1..8` are only `124..176` per image, consistent with edge
  antialiasing rather than residual checkerboard regions.

Visual result:

- All ropes, pegs, finials, doorway edges, bedroll, pouch and lantern brackets
  remain complete after cutout and resize.
- Camera, blue-white/brass kit and clay-resin finish are mutually consistent.
- No baked cast shadow, island, water, UI or text was found.

Decision:

- Accept the first four base props in staging.
- Generate the remaining four on plain white rather than requesting simulated
  transparency, then use the same verified Adobe cutout/resize path.

## Base prop batch 2 cutout - REJECTED FOR RUNTIME

Affected subjects:

- far tent
- main beacon
- far beacon
- complete crescent shrine

What passed:

- All four subjects are visually complete; the crescent has two intentional
  tips, its hanging lantern and its full stepped pedestal.
- The first normalized attempt produced exact `512x512 Format32bppArgb`, alpha
  zero in all four corners and zero alpha-greater-than-8 pixels touching the
  canvas edge.
- The visible-content anchor can be derived independently of transparent canvas
  padding and has been recorded in `placements.candidate.json`.

What failed:

- Visual inspection found faint horizontal alpha streaks outside every subject.
- A second Adobe background-removal pass did not remove the streaks.
- An Adobe Firefly cleanup pass removed some horizontal marks but introduced or
  retained vertical streaks below the tent, so it also failed the clean-alpha
  gate.
- A high-contrast magenta two-pass experiment did not yield transparency and is
  preserved only as diagnostic evidence.

Decision:

- Keep the four object designs as approved source concepts, but reject every
  current batch-two cutout for runtime use.
- Do not generate emissive plates, composite previews, write `assets/**`, or
  connect Pixi runtime until the alpha-cleaning route is resolved.
- Preserve the first four accepted tent candidates and the draft slot contract;
  unrelated character staging files remain untouched.

## Alpha blocker resolution and complete prop package - PASSED

The Owner approved a deterministic local alpha-cleaning fallback after repeated
Adobe cutouts preserved streak artifacts. The accepted path composites the
approved white-background source against a diagnostic solid magenta field,
removes only border-connected key-color regions and enclosed key-color pockets,
decontaminates the antialiased edge, then performs a premultiplied-alpha
LANCZOS normalization to `512x512`.

Accepted staging runtime candidates now include all eight base props and their
eight matching emissive plates under `runtime-candidate/`.

Mechanical result:

- `16/16` files are exact `512x512` RGBA PNGs.
- All four corner alpha values are zero for every file.
- Alpha edge-touch count is zero for every file.
- Fully transparent pixels with non-zero RGB are zero for every file, avoiding
  linear-sampling halos.
- Every base has one same-size emissive plate and a non-empty alpha bound.
- The complete crescent shrine retains both tips, hanging lantern and pedestal;
  none of the eight base silhouettes touches or exits its canvas.

Composite result:

- Day, night-emissive, day-mist and night-rain previews are all `1080x1920`.
- Five tents, two beacons and the crescent shrine remain complete and visually
  grounded across far, mid and near depth bands.
- The companion compass/plaza, approach bridge, top HUD and bottom navigation
  corridors remain free of opaque props.
- Night lighting stays localized; mist softens far/mid depth without veiling the
  foreground plaza; rain preserves prop and companion readability.

Decision:

- Resolve the historical alpha blocker and pass the staging art gate.
- Preserve rejected attempts as provenance only.
- Proceed to the separately authorized GROUNDWORK promotion and Moonlake runtime
  renderer; do not roll this package out to the other six habitats until
  Moonlake mobile QA passes.
