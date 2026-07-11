# Heartspark Council Full Catalog QC

## Verdict

**PASS — owner visually approved on 2026-07-11; not runtime-ready.**

The five formal Heartspark Council Stage 1 members each have a selected 29-action review catalog. All 145 selected sheets pass the mechanical asset checks described below.

| Character | Species motion identity | Actions | Minimum transparent margin |
| --- | --- | ---: | ---: |
| `blazetail-kit` | grounded fox steps, paw gestures, full flame-tail follow-through | 29 / 29 | 27 px |
| `auriowl` | hops, talon balance, wing-led gestures and controlled wingbeats | 29 / 29 | 26 px |
| `crystalfin-seahorse` | continuous hover, curled-tail propulsion and fin-led motion | 29 / 29 | 33 px |
| `sprigfawn` | cloven-hoof steps, deer bracing and antler-aware silhouettes | 29 / 29 | 32 px |
| `starstripe-cub` | grounded tiger-cub steps, oversized paw gestures and ringed-tail follow-through | 29 / 29 | 37 px |

## Mechanical QA

- Selected coverage: 145 / 145 sheets; no missing or extra action IDs.
- Every selected sheet is RGBA and divides into exact 512 x 512 frame cells.
- Every occupied frame exceeds the 8 px containment threshold.
- No selected sheet exceeds the 4096 px edge limit.
- Character extremities remain contained: flame tail, wings, seahorse fins/tail, antlers/hooves, and tiger tail tip.

## Motion and loop QA

- The shared action vocabulary does not imply a shared four-legged pose template.
- Bird actions remain wing/talon/hop based.
- Seahorse actions remain suspended and fin/tail driven; no invented ground walk.
- Deer actions retain hoof gait and antler clearance.
- Fox and tiger actions remain distinct through silhouette, gait weight and tail behavior.
- Every `sleep` sheet contains already-asleep poses only. Falling asleep and waking are excluded.
- Waking transitions remain isolated in `idle_wake`.

## Cross-action scale review

The Owner review board exposed apparent height variation in owl attack poses, seahorse attack poses, sleep, faint, and defensive poses. Direct sheet inspection confirmed that the variation comes from horizontal wing/tail extension or intentional body compression, not accidental per-action character scaling. No corrective enlargement was applied. Runtime scale must remain based on the fixed 512 px frame height rather than opaque-pixel bounds.

## Gate status

This is a review and handoff package under `output/character-pilots/`. It does not grant human visual approval, asset readiness, runtime selection, or permission to copy anything into `assets/`. Promotion requires a separate GROUNDWORK task and explicit owner approval.
