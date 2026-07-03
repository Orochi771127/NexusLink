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

V2 is still not runtime-ready. Visual self-review found a hard color band near the far lake-water edge after chroma-key cleanup. Keep this as a human-review candidate and regeneration evidence, not an approved asset package.

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
| Visual spot check complete | Pass with blocker | Direction preview is strong; layered preview still needs lake-edge cleanup. |

## Asset Classification

| Asset | Classification | Decision | Reason |
| --- | --- | --- | --- |
| `v2/reference/moonlake_v2_direction_preview_1080x1920.png` | direction preview | `keep_for_review` | Stronger composition than v1: target-size, clear companion platform, no empty lower half. Not a runtime layer. |
| `v2/layers/moonlake_v2_sky.png` | foundation layer | `keep_for_review` | Target-size sky-only layer. |
| `v2/layers/moonlake_v2_mountains.png` | foundation layer | `keep_for_review` | Target-size alpha-capable cliffs/waterfalls layer; review edge quality. |
| `v2/layers/moonlake_v2_lake_water.png` | foundation layer | `regenerate_or_manual_cleanup` | Target-size water plane, but self-review found a hard color band near the far water edge. |
| `v2/layers/moonlake_v2_shore_ground_platform.png` | foundation layer | `keep_for_review` | Fixes the v1 empty lower-half problem and gives a clear companion platform. |
| `v2/layers/moonlake_v2_foreground_occlusion.png` | foreground occlusion | `keep_for_review` | Sparse bottom/side foliage candidate; review companion-foot occlusion. |
| `v2/layered-preview-v2.png` | preview | `keep_for_review` | QA preview only, never runtime asset. |
| `props/prop_crystal_cluster.png` | compact prop | `keep_for_review` | Readable cyan memory-crystal candidate from v1 staging. |
| `props/prop_lantern_post.png` | tall prop | `keep_for_review` | Good candidate, but placement must avoid companion and UI safe zones. |
| `props/prop_dock_posts.png` | compact prop | `keep_for_review` | Useful dock-post candidate from v1 staging. |
| `props/prop_shrine_marker.png` | tall prop | `keep_for_review` | Strong identity candidate; needs height and occlusion review. |
| `props/prop_firefly_glow.png` | FX candidate | `use_runtime_particle_instead` | Too subtle as a cutout; better handled as lightweight Pixi particles in a later FX pack. |

## Runtime Blockers

- Human approval is not recorded.
- `referenceAuditPassed` is false.
- Lake-water edge needs cleanup or regeneration.
- V2 files are under `output/**`, not approved `assets/**`.
- No runtime manifest or scene profile module should reference these files yet.

## Regeneration Orders

1. If human likes the v2 direction, regenerate or manually clean only `lake_water` next.
2. Keep the v2 platform/shore composition as the next prompt reference.
3. Keep firefly glow out of static prop generation; plan it as runtime particle FX.
4. Do not touch `assets/**`, `assetManifest.js`, `pixiApp.js`, or save schema before a separate GROUNDWORK runtime promotion task.

## Approval Gate

Do not copy this package into `assets/**` or reference it from runtime code until:

- Human visual approval is recorded.
- `referenceAuditPassed` is true.
- Canvas, alpha, anchor, and UI-safe checks pass.
- Lake-water edge cleanup passes visual QA.
- A separate GROUNDWORK runtime promotion task is approved.

