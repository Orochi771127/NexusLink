# Heartspark Council Final Alignment And Crop QA

Date: 2026-07-15
Result: **PASS**

## Scope

This final read-only audit covers the runtime animation catalogs for the five formal Stage 1 Heartspark Council companions:

- `blazetail-kit`
- `auriowl`
- `starstripe-cub`
- `crystalfin-seahorse`
- `sprigfawn`

No sprite sheet, metadata manifest, registry entry, runtime code, state, or asset file was changed by this audit.

## Coverage And Mechanical Result

- Catalog coverage: `5` companions, `29 / 29` action IDs each, `145 / 145` runtime sheets.
- Frame coverage: `995 / 995` declared frames inspected.
- Approved-source parity: `145 / 145` runtime sheets are byte-identical to the Owner-approved selected review sheets.
- Every sheet decodes as RGBA PNG, uses exact `512 x 512` cells, matches its declared rows, columns, and frame count, and remains within the `4096 px` maximum edge.
- Every metadata anchor is exactly bottom-center: `{ "x": 0.5, "y": 1 }`.
- No empty frame, missing sheet, extra unreferenced sheet, alpha contact with a cell edge, or cross-cell overflow was found.

## Crop And Containment Result

Minimum transparent margin observed across every occupied frame:

| Companion | Minimum margin |
| --- | ---: |
| `blazetail-kit` | `27 px` |
| `auriowl` | `26 px` |
| `starstripe-cub` | `37 px` |
| `crystalfin-seahorse` | `33 px` |
| `sprigfawn` | `32 px` |

The global minimum is `26 px`. Flame-tail tips, owl wing and crown extremities, tiger tail tips, seahorse snout/crystals/fins/tail, and fawn antlers/ears/leaves/hooves remain fully visible in every reviewed frame.

## Alignment Result

- Global horizontal opaque-bounds center range: `x = 254.0 .. 257.5` in a `512 px` frame.
- Maximum within-action horizontal center span: `2.5 px`.
- For grounded/perched companions (`blazetail-kit`, `auriowl`, `starstripe-cub`, and `sprigfawn`), the maximum within-action bottom-datum span is `2 px`.
- `crystalfin-seahorse` uses a hovering aquatic translation. Its rotating and curled poses change silhouette height, but its actual opaque-bounds center remains `x = 254.5 .. 256.5`, `y = 255.0 .. 257.5`; the maximum within-action center span is `2.0 px` horizontally and `1.5 px` vertically. The larger bottom-bound changes in `attack_basic`, `defend`, `special_sad`, `idle_wash`, and `defeated` are pose rotation/compression around a stable center, not asset translation or normalization drift.

## Visual Review

Five full-catalog review boards were rendered with per-frame center and datum guides and inspected action-by-action. The review found:

- no clipped or incomplete anatomy;
- no missing tail, wing, fin, antler, ear, leaf, paw, hoof, or crystal layer;
- no visibly misplaced body layer;
- no accidental frame-to-frame center jump;
- no white/background contamination or baked UI;
- no species-template regression in the reviewed motion silhouettes.

## Known Unrelated QA Harness Issue

The repository-wide `run_asset_integrity()` helper currently stops before companion validation because its `root_path()` helper assumes every manifest entry is a string while a current non-companion manifest entry is object-shaped. This is a pre-existing QA-runner compatibility issue, not a failure in any of the 145 council sheets. The targeted frame, metadata, hash-parity, alignment, containment, and visual checks above completed independently.

## Final Verdict

All five final runtime catalogs pass this alignment, crop, completeness, and visual-position audit. No corrective asset edit is required.
