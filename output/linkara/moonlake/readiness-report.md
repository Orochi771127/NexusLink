# Ethereal Moon Lakefront Habitat Readiness Report

Status: `STAGING REVIEW`
Runtime status: not integrated.
Human approval: pending.

## Summary

- Region id: `ethereal_moon_lakefront`
- Output root: `output/linkara/moonlake/`
- V1 profile draft: `output/linkara/moonlake/profile-draft.json`
- V2 profile draft: `output/linkara/moonlake/profile-draft-v2.json`
- V3 profile draft: `output/linkara/moonlake/profile-draft-v3.json`
- Job file: `output/linkara/moonlake/habitat-job.json`
- V3 composite preview: `output/linkara/moonlake/v3/layered-preview-v3.png`
- V3 direction preview: `output/linkara/moonlake/v3/reference/moonlake_v3_direction_preview_1080x1920.png`
- V3 prompt log: `output/linkara/moonlake/v3/prompts/moonlake_v3_generation_prompts.md`

V3 is the current best Moonlake staging direction. It improves the V2 blockers by separating celestial bodies from `sky_atmosphere`, increasing semi-realistic material response, improving wet-stone lighting, and making the companion platform more readable.

V3 is still not runtime-ready. The lake-water edge still needs cleanup or a focused regeneration pass, foreground occlusion needs companion-foot review, and human approval/reference audit are still false. Keep V3 under `output/**` only.

## Automated Checks

| Check | Result | Notes |
| --- | --- | --- |
| Profile JSON parses | Pass | `profile-draft.json`, `profile-draft-v2.json`, `profile-draft-v3.json`, and `habitat-job.json` parse. |
| V3 layer files exist | Pass | Seven v3 layer files are present under `v3/layers/`. |
| V3 scene layer dimensions match | Pass | All accepted v3 scene layers are `1080x1920`. |
| Alpha-capable v3 layers | Pass | All accepted v3 layer files are `Format32bppArgb`. |
| Prompt metadata exists | Pass | V3 prompts are logged in `v3/prompts/moonlake_v3_generation_prompts.md`. |
| Accepted set has no rejected filename | Pass | Accepted v3 layer/profile paths do not include rejected filenames. |
| Celestial separation | Pass | V3 separates `sky_atmosphere`, `celestial_bodies`, and `celestial_occlusion`. |
| Material / lighting realism | Pass with review | V3 is materially stronger than V2; final human art review still required. |
| Visual spot check complete | Pass with blocker | Direction and platform are strong; lake-water edge needs cleanup before promotion. |

## Asset Classification

| Asset | Classification | Decision | Reason |
| --- | --- | --- | --- |
| `v3/reference/moonlake_v3_direction_preview_1080x1920.png` | direction preview | `keep_for_review` | Best current composition/material target; not a runtime layer. |
| `v3/layers/moonlake_v3_sky_atmosphere.png` | foundation layer | `keep_for_review` | Sky atmosphere is separated from celestial bodies; review for unwanted stars/noise before approval. |
| `v3/layers/moonlake_v3_celestial_bodies.png` | celestial layer | `keep_for_review` | Separate moon/sun/star candidates; later runtime task may crop or position them along profile arc. |
| `v3/layers/moonlake_v3_celestial_occlusion.png` | celestial occlusion | `keep_for_review` | Upper cloud/canopy/cliff-edge occlusion candidate. |
| `v3/layers/moonlake_v3_mountains.png` | foundation layer | `keep_for_review` | Stronger cliff/waterfall material and atmospheric depth than V2. |
| `v3/layers/moonlake_v3_lake_water.png` | foundation layer | `regenerate_or_manual_cleanup` | Better water material than V2, but edge cleanup is still required. Green-key retry was rejected due visible green spill. |
| `v3/layers/moonlake_v3_shore_ground_platform.png` | foundation layer | `keep_for_review` | Strong wet-stone platform candidate with clear companion floor. |
| `v3/layers/moonlake_v3_foreground_occlusion.png` | foreground occlusion | `keep_for_review` | Improved material; density must be checked against companion foot/body readability. |
| `v3/layered-preview-v3.png` | preview | `keep_for_review` | QA preview only, never runtime asset. |
| `props/prop_crystal_cluster.png` | compact prop | `keep_for_review` | V1 candidate; separate prop review still needed. |
| `props/prop_lantern_post.png` | tall prop | `keep_for_review` | V1 candidate; placement must avoid companion and UI safe zones. |
| `props/prop_dock_posts.png` | compact prop | `keep_for_review` | V1 candidate. |
| `props/prop_shrine_marker.png` | tall prop | `keep_for_review` | V1 candidate; needs height and occlusion review. |
| `props/prop_firefly_glow.png` | FX candidate | `use_runtime_particle_instead` | Better handled as lightweight Pixi particles in a later FX pack. |

## Runtime Blockers

- Human approval is not recorded.
- `referenceAuditPassed` is false.
- Lake-water edge needs cleanup or regeneration.
- Foreground occlusion density needs companion-foot review.
- V3 files are under `output/**`, not approved `assets/**`.
- No runtime manifest or scene profile module should reference these files yet.

## Regeneration Orders

1. Use V3 as the current direction target.
2. Do a narrow `lake_water` cleanup/regeneration pass only; do not regenerate the whole scene.
3. Keep `sky_atmosphere`, `celestial_bodies`, `celestial_occlusion`, `mountains`, and `shore_ground_platform` as review candidates.
4. Review foreground occlusion against Greyshade Cat feet/body before approval.
5. Keep firefly glow out of static prop generation; plan it as runtime particle FX.
6. Do not touch `assets/**`, `assetManifest.js`, `pixiApp.js`, or save schema before a separate GROUNDWORK runtime promotion task.

## Approval Gate

Do not copy this package into `assets/**` or reference it from runtime code until:

- Human visual approval is recorded.
- `referenceAuditPassed` is true.
- Canvas, alpha, anchor, and UI-safe checks pass.
- Lake-water edge cleanup passes visual QA.
- Foreground occlusion passes companion readability QA.
- A separate GROUNDWORK runtime promotion task is approved.
