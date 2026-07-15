# Black Iron Hackers Full 8-Frame Catalog QC

Status: `FINAL QA VERIFIED` as a five-character review-staging package. Human asset promotion remains pending.

## Package result

- Characters: `thunder-pup`, `wavecub`, `starflame-phoenix`, `star-foal`, `goldenspark-wyrm`
- Shared animation IDs: 29 per character
- Selected actions: 145 / 145
- Frames: exactly 8 per selected action
- Selected sheet contract: `2048x1024` RGBA PNG, `4x2`, `512x512` per frame
- Preview contract: exactly eight GIF frames per selected action
- Automated package validation: expected `145`, validated `145`, bad `0`

## Final alignment, crop, and compositing audit (2026-07-15)

- Final selected sheets inspected: `145 / 145`; final frames inspected: `1,160 / 1,160`.
- Mechanical result: `PASS`, problems `0`.
- Alpha safety: minimum transparent margin `32 px`; no empty frame, cell-edge contact, cropped silhouette, or cross-cell contamination.
- Horizontal registration: observed alpha-bounds center range `x=254.0..257.0`; maximum within-action center span `2.5 px`.
- Ground registration: observed alpha-bounds bottom range `y=477..480`; maximum within-action bottom span `3 px`. The four 3 px cases are low-alpha antialias fringe changes, not visible foot or body displacement.
- Preview parity: all GIF bounding boxes remain contained inside their source PNG frame bounding boxes; palette quantization removes only faint outer alpha pixels and introduces no layer translation.
- Source parity: all `145 / 145` published selected sheets are byte-identical to one retained strict-processor output.
- Visual result: all five complete 29-action contact boards were reviewed frame-by-frame. No clipped anatomy, missing image region, mismatched transparent layer, misplaced overlay, unexplained scale jump, or anchor jump was found.
- Reproducible evidence: `FINAL_ALIGNMENT_CROP_AUDIT.json`, `_work/audit_final_catalog_alignment.py`, and `review-boards/final-alignment-audit/*.png`.

## Cross-character review

- All five appearances remain traceable to their approved identity seeds and the supplied appearance-lock sheet.
- Species translation is distinct: grounded canine, feline, two-talon grounded avian, four-hoof equine, and low wingless saurian movement.
- Every selected `sleep` is already-deep sleep for all eight frames. Waking is isolated to `idle_wake`.
- Touch acceptance, guarded contact, rejection, and `hug` preserve voluntary proximity and non-punitive boundaries.
- Shared confrontation IDs remain warning, resonance, protection, recoil, temporary overload, and stabilization gestures rather than HP-zero violence.
- `faint` is temporary recoverable overload with living core markers, never death.
- No selected asset has been promoted to `assets/**`, registry, manifest, state/save, or runtime.

## Character QC records

- `output/character-pilots/thunder-pup/THUNDER_PUP_FULL_CATALOG_QC.md`
- `output/character-pilots/wavecub/WAVECUB_FULL_CATALOG_QC.md`
- `output/character-pilots/starflame-phoenix/STARFLAME_PHOENIX_FULL_CATALOG_QC.md`
- `output/character-pilots/star-foal/STAR_FOAL_FULL_CATALOG_QC.md`
- `output/character-pilots/goldenspark-wyrm/GOLDENSPARK_WYRM_FULL_CATALOG_QC.md`

## Remaining gates

1. Owner resolution of ThunderPup's documented canon/faction identity conflict before any canon or runtime integration.
2. Separate GROUNDWORK authorization for any promotion into `assets/**`, manifests, registry, or runtime.

This QC closes `TP-BIH-STAGE1-FULL-8F-CATALOG` only as a staging-production and final-art-QA task. It does not declare canon resolution or runtime readiness.
