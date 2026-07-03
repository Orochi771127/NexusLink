# Ethereal Moon Lakefront Habitat Readiness Report

Status: `REJECTED IMAGE STAGING REMOVED`
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

V3 was the best direct 2D generation direction, but the full direct 2D image-generation line has been rejected for final Moonlake production quality.

All generated image files under `output/linkara/moonlake/**` were removed by `TP-HAB-RESET-1`. JSON, Markdown, prompt logs, and profile drafts remain as failure evidence and planning material. Future Moonlake production should use the 3D-assisted 2.5D pipeline: offline source/blockout, locked `1080x1920` camera, separated render passes, masks/depth references where useful, and human approval before runtime promotion.

## Automated Checks

| Check | Result | Notes |
| --- | --- | --- |
| Profile JSON parses | Pass | `profile-draft.json`, `profile-draft-v2.json`, `profile-draft-v3.json`, and `habitat-job.json` parse. |
| V3 layer files exist | Removed | Image files intentionally removed after rejection. |
| V3 scene layer dimensions match | Removed | Former validation retained as historical evidence only. |
| Alpha-capable v3 layers | Removed | Former validation retained as historical evidence only. |
| Prompt metadata exists | Pass | V3 prompts are logged in `v3/prompts/moonlake_v3_generation_prompts.md`. |
| Accepted set has no rejected filename | Not applicable | There is no accepted image set after cleanup. |
| Celestial separation | Historical pass | V3 separated `sky_atmosphere`, `celestial_bodies`, and `celestial_occlusion`, but the images are no longer retained. |
| Material / lighting realism | Rejected for final production | V3 improved over V2 but did not meet final-quality consistency. |
| Visual spot check complete | Rejected | Direct 2D generation remains insufficient for Moonlake final background production. |

## Asset Classification

| Asset | Classification | Decision | Reason |
| --- | --- | --- | --- |
| `output/linkara/moonlake/**/*.png` | generated staging images | `removed_rejected` | Direct 2D generation did not meet final-quality expectations. Text and JSON records are retained. |

## Runtime Blockers

- Human approval is not recorded.
- `referenceAuditPassed` is false.
- Generated image files have been removed and cannot be promoted.
- Direct 2D generation is no longer the final-quality path for Moonlake backgrounds.
- Future work must produce a 3D-assisted 2.5D source package before any new image staging.
- No runtime manifest or scene profile module should reference these files yet.

## Regeneration Orders

1. Do not continue the direct 2D regeneration line as the final production path.
2. Produce `TP-HAB-MOON-3D-1`: Moonlake 3D/DCC blockout and render-pass brief.
3. Lock camera at `1080x1920`.
4. Export or plan separate passes: `sky_atmosphere`, `celestial_bodies`, `celestial_occlusion`, `mountains`, `lake_water`, `shore_ground_platform`, `camp_structures`, `foreground_occlusion`, and optional masks/depth.
5. Review companion readability against Greyshade Cat feet/body before approval.
6. Keep firefly glow out of static prop generation; plan it as runtime particle FX.
7. Do not touch `assets/**`, `assetManifest.js`, `pixiApp.js`, or save schema before a separate GROUNDWORK runtime promotion task.

## Approval Gate

Do not copy this package into `assets/**` or reference it from runtime code until:

- Human visual approval is recorded.
- `referenceAuditPassed` is true.
- Canvas, alpha, anchor, and UI-safe checks pass.
- Lake-water edge cleanup passes visual QA.
- Foreground occlusion passes companion readability QA.
- A separate GROUNDWORK runtime promotion task is approved.
