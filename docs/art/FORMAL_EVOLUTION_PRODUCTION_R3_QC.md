# Formal Evolution Production R3 QC

Date: 2026-08-13
Package: `formal-evolution-production-r3`
Branch: `codex/auriowl-wargle-evolution-pilot-r1`

## Scope and authority

This package stages later-form production art for eleven companions:

- Heartspark Council: `auriowl`, `sprigfawn`, `crystalfin-seahorse`,
  `blazetail-kit`, `starstripe-cub`.
- Ironflow Hackers: `thunder-pup`, `wavecub`, `starflame-phoenix`,
  `star-foal`, `goldenspark-wyrm`.
- Neutral heart-core life: `greyshade-cat`.

It contains twenty-two Stage 2 / Stage 3 transparent masters. It also contains
one animation Pilot for Auriowl Stage 2. This is art-production authority only:
no Growth G4 invitation, stage advance, save migration, registry change, Pixi
reference, Expedition reference or Orbit manifestation is enabled.

## Master-asset result

All twenty-two promoted masters passed:

- exact `512x512` dimensions;
- PNG with RGBA channels;
- transparent corners;
- non-empty visible alpha;
- alpha bounding box strictly inside all four frame edges;
- one readable owner identity across Stage 1, Stage 2 and Stage 3;
- no obvious missing or duplicated limbs in the accepted single-view master;
- no baked UI, text, scene, display base or white background.

The exact production paths and SHA-256 fingerprints are stored in each
`assets/characters/<id>/metadata/formal-stages.json` record. The roster-level
contract is `assets/characters/formal-evolution-production-r3.json`.

## Auriowl Stage 2 Pilot candidate

The mechanically accepted, visual-review candidate is under
`assets/characters/auriowl/formal-stages/resonant_mature/pilot/` and provides:

- one eight-direction turnaround sheet plus eight individual direction frames;
- idle, walk, attack and recovery;
- cardinal and diagonal 4x4 sheets for every action;
- four frames per direction, 128 action frames total;
- `512x512` cells, `2048x2048` action sheets and bottom-center anchors;
- minimum transparent output-cell margin of 46 px;
- zero empty frames and zero output-cell edge-touch frames.

The direction rows are deliberately explicit in `pilot-manifest.json`. The
Pilot uses the Stage 2 grounded-avian rig only. Auriowl Stage 3 is upright and
must receive its own wing-arm rig rather than inheriting this skeleton.

## Rejected generations

Two direct idle generations were rejected before promotion because one source
sheet touched its bottom cell edges and one sheet reversed the requested
direction order. Large-motion source sheets also crossed the model's implicit
source grid; they were not accepted directly. Their chroma was removed, each
source cell was isolated, and the visible subject was normalized into a new
`512x512` output cell with a fixed foot datum. The final promoted cells were
then checked independently for alpha margins.

Rejected and intermediate files remain only in the ignored `output/` review
area. They are not part of the versioned game asset surface.

## Visual review notes

- Auriowl remains recognizable as a cream-and-gold war hawk with gold eyes, hooked beak,
  swept crest, cobalt feather tips, diamond chest core and solar shoulder disc.
- Stage 2 action silhouettes remain compact enough for sprite sheets.
- Attack reads as a body-and-wing strike and does not introduce a weapon,
  projectile, human arm or additional wing pair.
- Recovery is a brief tired-to-steady loop, not injury, defeat or collapse.
- Generated directions contain small feather-layout and proportion variation.
  The candidate is useful for validating action readability and the pipeline,
  but strict per-frame identity continuity still requires the Owner motion
  feel-check and may require paintover or rig-based correction.
- All four actions remain review-staged because animation feel must be checked
  in motion; mechanical frame QC alone is not human visual approval.

## Remaining gates

1. Owner visual feel-check of the Auriowl Stage 2 Pilot in motion.
2. A dedicated Auriowl Stage 3 upright-wing-arm Pilot.
3. Species-specific Pilots and then batches for the remaining twenty forms.
4. Reference audit and mobile memory/load-budget proof before any runtime swap.
5. A separately authorized Growth G4 package before form advancement can occur.
