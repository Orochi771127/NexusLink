# Ethereal Moon Lakefront Habitat Readiness Report

Status: `STAGING REVIEW`
Runtime status: not integrated.
Human approval: pending.

## Summary

- Region id: `ethereal_moon_lakefront`
- Output root: `output/linkara/moonlake/`
- Profile draft: `output/linkara/moonlake/profile-draft.json`
- Job file: `output/linkara/moonlake/habitat-job.json`
- Composite preview: `output/linkara/moonlake/layered-preview.png`
- Props preview: `output/linkara/moonlake/props-preview.png`
- Source notes: `output/linkara/moonlake/prompts/moonlake_layer_generation_notes.txt`

This package is useful as a first Moonlake layered-generation staging set. It is not runtime-ready. The main blocker is canvas and composition readiness: all scene layers are `941x1672`, while the target mobile art size remains `1080x1920`, and the composite has a large lower empty area that needs a stricter runtime-frame redraw or normalization pass.

## Automated Checks

| Check | Result | Notes |
| --- | --- | --- |
| Profile JSON parses | Pass | `ethereal_moon_lakefront`, six layers, five props. |
| Layer files exist | Pass | Six listed layer files are present. |
| Prop files exist | Pass | Five listed prop files are present. |
| Scene layer dimensions match | Pass with blocker | Scene layers all match each other at `941x1672`, but not the target `1080x1920`. |
| Alpha-capable layers / props | Pass | Non-sky scene layers and all prop candidates are `Format32bppArgb`. |
| Prompt metadata exists | Pass | Prompt notes explain layer locks, source paths, and rejected attempts. |
| No rejected files in accepted set | Pass | No remaining file path contains `rejected`. |
| Visual spot check complete | Pass with blocker | Composite and prop preview are reviewable; not runtime-ready. |

## Asset Classification

| Asset | Classification | Decision | Reason |
| --- | --- | --- | --- |
| `layers/moonlake_sky.png` | foundation layer | `regenerate` | Direction is useful, but canvas is `941x1672`, and sky should be regenerated to target frame with stronger lower boundary control. |
| `layers/moonlake_mountains.png` | foundation layer | `keep_for_review` | Alpha-capable distant layer; needs target-canvas normalization and visual approval. |
| `layers/moonlake_lake_water.png` | foundation layer | `keep_for_review` | Useful water-plane candidate for zone review. |
| `layers/moonlake_shore_ground_platform.png` | foundation layer | `regenerate` | Current composite leaves too much lower empty area; platform must lock companion floor and bottom UI clearance. |
| `layers/moonlake_camp_structures.png` | structure layer | `keep_for_review` | Useful structure layer; review for baked runtime props before approval. |
| `layers/moonlake_foreground_occlusion.png` | foreground occlusion | `regenerate` | Needs stricter companion-foot occlusion and bottom-edge composition pass. |
| `props/prop_crystal_cluster.png` | compact prop | `keep_for_review` | Readable cyan memory-crystal candidate. |
| `props/prop_lantern_post.png` | tall prop | `keep_for_review` | Good candidate, but placement must avoid companion and UI safe zones. |
| `props/prop_dock_posts.png` | compact prop | `keep_for_review` | Useful dock-post candidate. |
| `props/prop_shrine_marker.png` | tall prop | `keep_for_review` | Strong identity candidate; needs height and occlusion review. |
| `props/prop_firefly_glow.png` | FX candidate | `regenerate` | Too subtle after chroma-key removal; runtime particles may be better. |
| `layered-preview.png` | preview | `keep_for_review` | QA preview only, never runtime asset. |
| `layered-preview-candidate-01.png` | reference | `keep_for_review` | Concept/reference only, not a layer deliverable. |

## Runtime Blockers

- Canvas is `941x1672`, not the target `1080x1920`.
- Composite has a large lower empty area that would waste mobile viewport space.
- Human approval is not recorded.
- `referenceAuditPassed` is false.
- Asset paths are under `output/**`, not approved `assets/**`.
- No runtime manifest or scene profile module should reference these files yet.

## Regeneration Orders

1. Regenerate Moonlake target-frame foundation pass at `1080x1920`.
2. Keep the layer stack: sky, mountains, lake water, shore/platform, structures, foreground occlusion.
3. Lock companion anchor around `{ x: 0.5, y: 0.7 }` and keep the reserved rect clear.
4. Regenerate platform/shore so the lower half feels intentional, not blank.
5. Regenerate foreground occlusion as sparse bottom/side edge elements only.
6. Treat firefly glow as runtime particle or regenerate as a stronger FX sprite candidate.

## Approval Gate

Do not copy this package into `assets/**` or reference it from runtime code until:

- Human visual approval is recorded.
- `referenceAuditPassed` is true.
- Canvas, alpha, anchor, and UI-safe checks pass.
- A separate GROUNDWORK runtime promotion task is approved.

