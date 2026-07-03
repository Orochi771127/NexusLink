# Ethereal Moon Lakefront Habitat Readiness Report

Status: `STAGING REVIEW`
Runtime status: not integrated.
Human approval: pending.

## Summary

- Region id: `ethereal_moon_lakefront`
- Output root: `output/linkara/moonlake/`
- V1 profile draft: `output/linkara/moonlake/profile-draft.json`
- V2 profile draft: `output/linkara/moonlake/profile-draft-v2.json`
- Job file: `output/linkara/moonlake/habitat-job.json`
- V1 composite preview: `output/linkara/moonlake/layered-preview.png`
- V2 composite preview: `output/linkara/moonlake/v2/layered-preview-v2.png`
- V2 direction preview: `output/linkara/moonlake/v2/reference/moonlake_v2_direction_preview_1080x1920.png`
- Props preview: `output/linkara/moonlake/props-preview.png`
- V2 prompt log: `output/linkara/moonlake/v2/prompts/moonlake_v2_generation_prompts.md`

V2 fixes the two largest V1 blockers: target canvas and lower composition. The v2 layer candidates in `v2/layers/` are normalized to `1080x1920`, and the lower half now contains an intentional stone platform and shore path instead of a large blank area.

V2 is still not runtime-ready. The composition is useful, but the current generated style no longer matches the tightened art lock: the layer set is too painterly/illustrated, material response and lighting are not realistic enough, and the sky layer bakes a moon into the background instead of separating celestial bodies for runtime time-of-day movement. Visual self-review also found a hard color band near the far lake-water edge after chroma-key cleanup.

Keep V2 as composition and prompt evidence only. Do not promote it to runtime, and do not copy it into `assets/**`.

## Automated Checks

| Check | Result | Notes |
| --- | --- | --- |
| Profile JSON parses | Pass | `profile-draft.json`, `profile-draft-v2.json`, and `habitat-job.json` parse. |
| V2 layer files exist | Pass | Five v2 layer files are present under `v2/layers/`. |
| Prop files exist | Pass | Five v1 prop candidates remain present for review. |
| V2 scene layer dimensions match | Pass | All v2 scene layers are `1080x1920`. |
| Alpha-capable v2 layers | Pass | All v2 layer files are `Format32bppArgb`. |
| Prompt metadata exists | Pass | V2 prompts are logged in `v2/prompts/moonlake_v2_generation_prompts.md`. |
| Accepted set has no rejected filename | Pass | Accepted v2 layer/profile paths do not include rejected filenames. |
| Visual spot check complete | Pass with blockers | Direction preview has useful composition; layered preview still needs lake-edge cleanup and art-style regeneration. |
| Celestial separation | Fail | `moonlake_v2_sky.png` bakes the moon into the sky. Future `sky_atmosphere` must not include sun, moon, stars, or other moving celestial bodies. |
| Material / lighting realism | Fail | Current V2 layers read as painterly fantasy concept art. Future pass must use semi-realistic material response, believable shadows/reflections, and restrained bloom. |

## Asset Classification

| Asset | Classification | Decision | Reason |
| --- | --- | --- | --- |
| `v2/reference/moonlake_v2_direction_preview_1080x1920.png` | direction preview | `composition_reference_only` | Strong composition and platform framing, but not a runtime layer and not the final art style target. |
| `v2/layers/moonlake_v2_sky.png` | foundation layer | `regenerate` | Bakes the moon into the sky and does not support runtime celestial arc movement. |
| `v2/layers/moonlake_v2_mountains.png` | foundation layer | `regenerate_for_realism_pass` | Useful composition, but material depth and lighting need the semi-realistic pass. |
| `v2/layers/moonlake_v2_lake_water.png` | foundation layer | `regenerate` | Has a hard color band near the far water edge and needs more realistic water reflections/ripples. |
| `v2/layers/moonlake_v2_shore_ground_platform.png` | foundation layer | `regenerate_for_realism_pass` | Strong platform composition, but stone material and contact lighting need more realism. |
| `v2/layers/moonlake_v2_foreground_occlusion.png` | foreground occlusion | `regenerate_for_realism_pass` | Composition is usable; foliage/stone material and lighting need a realistic pass. |
| `v2/layered-preview-v2.png` | preview | `composition_reference_only` | QA preview only, never runtime asset. |
| `props/prop_crystal_cluster.png` | compact prop | `keep_for_review` | Readable cyan memory-crystal candidate from v1 staging. |
| `props/prop_lantern_post.png` | tall prop | `keep_for_review` | Good candidate, but placement must avoid companion and UI safe zones. |
| `props/prop_dock_posts.png` | compact prop | `keep_for_review` | Useful dock-post candidate from v1 staging. |
| `props/prop_shrine_marker.png` | tall prop | `keep_for_review` | Strong identity candidate; needs height and occlusion review. |
| `props/prop_firefly_glow.png` | FX candidate | `use_runtime_particle_instead` | Too subtle as a cutout; better handled as lightweight Pixi particles in a later FX pack. |

## Runtime Blockers

- Human approval is not recorded.
- `referenceAuditPassed` is false.
- Art direction lock is not met: generated style is too painterly and lacks realistic material/light response.
- Celestial separation is not met: moon is baked into the sky layer.
- Lake-water edge needs cleanup or regeneration.
- V2 files are under `output/**`, not approved `assets/**`.
- No runtime manifest or scene profile module should reference these files yet.

## Regeneration Orders

1. Use V2 only as a composition reference, not as a style reference.
2. Regenerate Moonlake as semi-realistic material/lighting layers: `sky_atmosphere`, `celestial_bodies`, `celestial_occlusion`, `mountains`, `lake_water`, `shore_ground_platform`, and `foreground_occlusion`.
3. `sky_atmosphere` must not include moon, sun, stars, UI, text, companion, traces, or runtime props.
4. `celestial_bodies` should be a separate runtime-controlled pass or separate generated sprite/layer set placed from the profile arc.
5. Keep the v2 platform/shore framing as the composition reference, but rework stone material, wetness, contact shadows, water reflection, and lighting.
6. Keep firefly glow out of static prop generation; plan it as runtime particle FX.
7. Do not touch `assets/**`, `assetManifest.js`, `pixiApp.js`, or save schema before a separate GROUNDWORK runtime promotion task.

## Approval Gate

Do not copy this package into `assets/**` or reference it from runtime code until:

- Human visual approval is recorded.
- `referenceAuditPassed` is true.
- Canvas, alpha, anchor, and UI-safe checks pass.
- Semi-realistic material and lighting review passes.
- Celestial bodies are separated from `sky_atmosphere`.
- Lake-water edge cleanup passes visual QA.
- A separate GROUNDWORK runtime promotion task is approved.
