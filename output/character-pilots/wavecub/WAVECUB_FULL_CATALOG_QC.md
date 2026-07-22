# WaveCub Full 8-Frame Catalog QC

Status: `VERIFIED`; Owner approved the selected catalog for GROUNDWORK runtime promotion on 2026-07-22.

## Scope

- Character: `wavecub`
- Selected actions: 29 / 29
- Frames per action: exactly 8
- Selected sheet: `2048x1024` RGBA PNG, `4x2` grid, `512x512` per frame
- Preview: eight-frame looping GIF per action
- Runtime sheet location: `assets/characters/wavecub/<action>/`; runtime portrait: `assets/characters/wavecub/portrait/`
- Review boundary: GIF previews, rejected candidates and provenance remain under `output/**`; only selected runtime PNGs are promoted.

## Selected action set

P1:

- `idle_calm`, `idle_happy`, `idle_angry`, `idle_sad`, `idle_defensive`
- `blink`, `right_walk`, `left_walk`
- `touch_accept`, `touch_guarded`, `touch_reject`

P2:

- `idle_sick`, `idle_distant`, `idle_enjoy`, `sit`
- `sleep`, `idle_wake`
- `special_angry`, `special_sad`, `hug`

P3:

- `idle_dance`, `idle_wash`, `special_dance`
- `attack_basic`, `skill_cast`, `defend`, `hit`, `faint`, `victory`

## Mechanical verification

- Automated inventory validation: expected `29`, validated `29`, missing `0`, bad `0`.
- All selected PNG files are `2048x1024` in RGBA mode and contain transparent pixels.
- All selected GIF previews contain exactly eight frames.
- Selected processor runs pass strict cell-edge rejection after bottom-center/shared-scale normalization.
- Raw generations, rejected candidates, alpha sources, normalization reports, processor metadata and previews remain as review provenance; selected PNGs move by tracked rename into the runtime root, preserving their reviewed bytes.

## Visual and semantic verification

- Identity markers remain stable: juvenile white and ice-blue feline body, cobalt crystalline wave crest, pale-blue eyes, cyan current markings, circular blue chest core, and slim tail with an attached water-wisp tip.
- `sleep` is deep sleep with closed eyes in all eight frames. Waking is exclusive to `idle_wake`.
- `idle_wash` uses feline forepaw-and-face grooming rather than a generic quadruped motion.
- Touch responses preserve consent: acceptance is voluntary, guarded contact stays cautious, and rejection is non-punitive.
- `special_angry` establishes a warning boundary without pouncing or mauling; `special_sad` curls inward and recovers without death framing.
- `hug` is a self-chosen body lean with no external hand, person, or restraint.
- `attack_basic`, `skill_cast`, and `defend` use current bracing, body-centered resonance, and a planted protective boundary rather than damage spectacle.
- `hit` is a brief emotional recoil without injury.
- `faint` is temporary overload with retained chest-core and tail-wisp light, not death.
- `victory` is calm stabilization without an enemy, taunt, or domination framing.
- No selected action contains a pedestal, UI, text, human hand, weapon, projectile, gore, detached water effect, grid, or baked contact shadow.

## Rejection and correction notes

- White, black, or gridded generated backgrounds were retained with explicit `REJECTED` filenames and corrected before transparency processing.
- The first `special_dance` candidate was rejected for bipedal posing and invalid tail anatomy. The selected replacement stays quadrupedal with a normal-length attached tail.
- Faint grid lines, detached motion marks, and baked contact shadows were removed before selected outputs were produced.

## Deterministic grid normalization

Some raw image-generation sheets placed complete figures across implied cell boundaries even when the visible spacing looked adequate. The staging-only helper `output/character-pilots/_work/normalize_global_2x4.py` identifies the eight globally separated foreground figures, sorts them by row and horizontal position, applies one shared scale, and places them bottom-center into exact `512x512` cells. The regular `generate2dsprite.py` processor then runs again with strict edge rejection. This changes layout and anchor only; it does not redraw poses or identity.

## Promotion result and remaining gates

WaveCub's selected portrait and complete catalog are approved for `assets/**` promotion. Registry／manifest／persona／browser regression and all human launch gates remain owned by the integrating TASK_PACK; this QC record alone does not declare launch readiness.
