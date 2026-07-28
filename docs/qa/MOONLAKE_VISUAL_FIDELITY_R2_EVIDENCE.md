# Moonlake Visual Fidelity R2 Evidence

## Status

- Task: `TP-MOONLAKE-2.5D-VISUAL-FIDELITY-R2`
- Branch: `codex/moonlake-visual-fidelity-r2`
- Base: `origin/main` at `f7902396c6604402a18d6a1173450097fedf0210`
- Runtime integration: verified locally
- Owner runtime visual review: approved for publication on `2026-07-28`
- Commit, push and publication: authorized; protected-`main` PR flow required

This package replaces the visibly primitive R1 presentation with the
Owner-supplied premium clay/resin Moonlake composition while retaining the
existing controlled Three.js/PixiJS hybrid boundary.

## Visual authority and runtime boundary

- Source authority:
  `C:\Users\User\Downloads\產生的圖片 1.png`
- Normalized runtime master:
  `assets/backgrounds/MoonlakeDiorama_r2/moonlake_visual_master_r2.png`
  (`1080x1920`, RGB)
- Environment presentation: fixed-camera visual master rendered by a live
  Three.js shader with restrained water shimmer, waterfall streaks, foliage
  response, weather response and day/night grading.
- Spatial authority: the existing
  `assets/3d/moonlake/moonlake_clay_resin_r3.glb` remains loaded as the hidden
  structural scene authority for world-space layout and projection.
- Companion presentation: the active companion remains an illustrated 2D
  PixiJS sprite with four-direction movement, bridge traversal and bounded
  Moonlake fishing.
- Fallback: the existing Pixi habitat remains the fallback when WebGL, Three.js
  or the Moonlake live scene is unavailable.

This is intentionally a fixed-camera 2.5D hybrid. It does not claim that the
visible premium detail was rebuilt as freely explorable authored 3D geometry.
A future free-camera or fully detailed visible-GLB rebuild would require a
separate approved package.

## Browser evidence

All captures use a `390x844` mobile viewport:

- `output/playwright/moonlake-r2-mobile-day-clear.png`
- `output/playwright/moonlake-r2-mobile-night-rain.png`
- `output/playwright/moonlake-r2-mobile-dusk-mist.png`
- `output/playwright/moonlake-r2-mobile-day-clear-reduced.png`
- `output/playwright/moonlake-r2-mobile-day-clear-bridge.png`

The bridge capture places the companion foot at approximately `(249, 334)`,
inside the bridge corridor. The reduced-motion capture keeps the companion on
the central platform instead of falling into the foreground foliage.

## Automated verification

- JavaScript syntax checks: PASS for all changed runtime and QA files.
- Habitat pack validator: PASS; one `1080x1920` RGB PNG.
- Blender GLB audit: PASS; `3,098,820` bytes, 7 meshes, 66,726 triangles.
- Moonlake roaming cases: PASS; one bridge traversal, all four walking
  directions, fishing spot reached and reduced-motion fallback covered.
- Companion renderer lifecycle: `29/29 PASS`.
- Mobile browser visual matrix: PASS for day/clear, night/rain, dusk/mist,
  reduced motion and forced bridge traversal.
- Complete web release gate: `28/28 PASS`; no accessibility warnings.

## Open human and release gates

- Owner must review the runtime captures and approve the R2 presentation.
- Physical iOS/Safari and representative mobile-GPU verification remain open.
- No commit, push, protected-main PR, merge or public deployment is included in
  this package.
- The complete release gate still lists its standard manual product, private
  blind review, legal/privacy/store and public-launch approvals as open.

## R2.1 bridge and fishing clearance

Task: `TP-MOONLAKE-BRIDGE-CLEARANCE-R2.1`.

The original R2 bridge projection placed Greyshade Cat wider than the visible
deck. The same risk applied to the other fifteen runtime companions and was
more severe for several `fishing_back` silhouettes. R2.1 fixes this without
regenerating any companion art:

- the visible bridge receives a restrained perspective-aware extension, with
  rails and plank rhythm retained;
- the route uses explicit `bridge_near`, `bridge_mid` and `bridge_far`
  projection anchors at `0.495`, `0.45` and `0.42` scale;
- `bridge_far` is the sole lake-facing fishing stop;
- `far_bank_center`, `far_bank_left` and `far_bank_right` are disconnected, so
  autonomous roaming cannot leave the visible deck;
- a dev-query-gated QA seam can stage a bridge segment or waypoint without
  changing product state.

The first experimental fishing-stop treatment added an elliptical wooden
landing. Visual review rejected it because it read as a floating disc. That
treatment was removed before final verification; fishing now occurs on the
existing bridge itself.

### R2.1 automated proof

- route projection and graph assertions: PASS at `390x844`;
- transparent-frame clearance audit: PASS for 16 companions, 64 cases;
- widest near-bridge walking silhouette: `stone-shard`, `65.54px` against a
  `66px` limit;
- widest bridge-fishing silhouette: `star-foal`, `57.97px` against a `66px`
  limit;
- browser playback matrix: PASS for 16 companions and 32 live animation cases,
  with zero page or console errors;
- maximum browser container bound: `59.43px` walking and `55.52px` fishing;
- reduced motion remains stationary and the existing four-direction route test
  still records one bridge traversal and a valid fishing stop.

### R2.1 visual proof

- `output/playwright/moonlake-bridge-clearance-r2-1/bridge-back-walk-contact-sheet.png`
- `output/playwright/moonlake-bridge-clearance-r2-1/fishing-back-contact-sheet.png`
- 32 individual 390x844 captures and machine-readable
  `output/playwright/moonlake-bridge-clearance-r2-1/results.json`

Owner runtime visual approval, physical iOS/Safari proof and publication remain
open. R2.1 has not been committed or pushed.

## R2.2 fishing terrain and orientation

Task: `TP-MOONLAKE-FISHING-ORIENTATION-R2.2`.

The existing Moonlake visual master was audited for solid footing, reachable
route continuity, water adjacency, occlusion and rod direction. The accepted
fishing terrain is deliberately narrow:

- `bridge_far` retains the existing `fishing_back` option toward the far lake;
- `bridge_mid` accepts `fishing_front` and `fishing_side` toward either water
  side, using the native right-facing sheet or its runtime mirror;
- stepping stones, waterfall basins, shallow water, far-bank terrain, the
  tent shoreline and near-ground vegetation remain rejected because they lack
  a universal solid standable pad, a connected route or a clear cast into
  water for all sixteen companions.

No platform, pier, shoreline asset or companion sheet was added or modified.
Fishing remains an interruptible ambient expression with no catch, reward,
progression, relationship, memory or persistence write.

### R2.2 automated proof

- orientation contract and manifest coverage: PASS, 16 companions x 5
  placements = 80 cases;
- transparent-frame clearance: PASS, widest dense character body `61.57px`
  against the `66px` bridge limit;
- every front/side loop reaches at least `37.01px` beyond the sprite anchor
  during its cast, above the `25px` bridge-to-water requirement;
- live Chromium matrix at `390x844`: PASS, 80/80 cases, zero page errors and
  zero console errors;
- runtime mirror direction: PASS for front-left and side-left on all sixteen
  companions;
- maximum live container bound `59.48px`, horizontal anchor drift `0px`,
  vertical anchor drift `2.50px`;
- legacy R2.1 bridge clearance: PASS, 64/64 cases;
- Stage 1 promotion integrity: PASS, 68 sheets / 16 companions;
- companion renderer lifecycle: `29/29 PASS`;
- companion shadow flush: `8/8 PASS`;
- Moonlake layout lock: `38/38 PASS`;
- complete web release gate: `28/28 PASS`, no accessibility warnings.

### R2.2 visual proof

Individual captures and machine results:

- `output/playwright/moonlake-fishing-orientation-r2-2/results.json`;
- 80 individual `390x844` captures.

Five reviewed contact sheets:

- `front-right-contact-sheet.png`;
- `front-left-contact-sheet.png`;
- `side-right-contact-sheet.png`;
- `side-left-contact-sheet.png`;
- `back-far-contact-sheet.png`.

The contact sheets retain the premium R2 fixed-camera clay/resin scene and
show each companion grounded on the existing bridge. Physical iOS/Safari and
representative mobile-GPU proof remain open.

## R2.2.1 side-fishing rail alignment and final release proof

Task: `TP-MOONLAKE-FISHING-ORIENTATION-R2.2.1`.

Owner review found that the stable side-facing fishing line could still read
as landing on the bridge deck. The final correction keeps the bridge geometry
unchanged and applies an `8px` reference-space offset toward the selected
water-side rail only while `fishing_side` is active. The companion foot,
shadow and animation container move together; front-facing and far-facing
fishing retain their existing anchors.

### Final automated and visual proof

- all sixteen companions x five placements: PASS, `80/80`;
- stable side-line frames cross the visible bridge rail by at least `5.47px`
  against a `4px` acceptance floor;
- live left/right rail offset drift: `0px`;
- maximum live fishing container width: `59.48px`;
- legacy bridge walk/back-fishing browser matrix: PASS, `32/32`;
- four-direction roaming and reduced-motion fallback: PASS;
- Stage 1 directional/fishing integrity: PASS, `68` sheets / `16` companions;
- companion renderer lifecycle: `29/29 PASS`;
- companion shadow flush: `8/8 PASS`;
- Moonlake layout JSON lock: `38/38 PASS`;
- full scene states: PASS for day/clear, night/rain, dusk/mist,
  reduced-motion day/clear and forced bridge traversal;
- complete web release gate: `28/28 PASS`, no accessibility warnings;
- `git diff --check`: PASS.

Final visual evidence is stored under
`output/playwright/moonlake-fishing-orientation-r2-2/`, including the refreshed
left/right contact sheets. Generated QA output remains untracked and is not
part of the runtime publication.
