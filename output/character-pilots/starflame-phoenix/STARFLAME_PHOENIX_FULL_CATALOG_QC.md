# Starflame Phoenix Full 8-Frame Catalog QC

Status: `VERIFIED` in review staging. Human promotion approval remains pending.

## Scope

- Character: `starflame-phoenix`
- Selected actions: 29 / 29
- Frames per action: exactly 8
- Selected sheet: `2048x1024` RGBA PNG, `4x2` grid, `512x512` per frame
- Preview: eight-frame looping GIF per action
- Location: `output/character-pilots/starflame-phoenix/<action>/`
- Promotion boundary: no file has entered `assets/**` or runtime.

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
- Raw generations, rejected candidates, alpha sources, normalization reports, processor metadata, selected sheets, and previews remain together as review provenance.

## Species, visual, and semantic verification

- Identity markers remain stable: round orange-red phoenix chick, golden belly/beak/talons, attached flame-feather fan tail, small wings, cyan facial circuits and chest core, and blue flame crest.
- Ground locomotion uses two taloned legs with hop/step and head-bob timing. No selected motion uses a four-leg gait or sustained flight.
- `sit` is an avian perch-settle and `idle_wash` uses beak preening across breast and wing feathers.
- `sleep` is compact deep sleep with both eyes closed in all eight frames; chest core and plume remain alive. Waking is exclusive to `idle_wake`.
- Touch responses preserve consent: acceptance is a voluntary closer hop, guarded contact retains reserve, and rejection uses a wing mantle plus backward hop without punishment.
- `hug` is a voluntary wing shelter beside the body, never an arm-like squeeze.
- `attack_basic`, `skill_cast`, and `defend` use warning cry, body-centered resonance, and wing-mantle protection rather than damage spectacle.
- `hit` is a brief feather/wing recoil without injury.
- `faint` is temporary protected overload with a lit core and living plume, not death.
- `victory` is one restrained grounded wing opening and stabilization, without an enemy or domination framing.
- No selected action contains a pedestal, UI, text, human hand, weapon, projectile, gore, detached fire effect, or baked contact shadow.

## Rejection and correction notes

- `touch_reject` initially contained detached cyan motion lines; the raw candidate remains marked `REJECTED` and the selected correction removes them.
- `victory` initially contained a detached breath symbol; the raw candidate remains marked `REJECTED` and the selected correction removes it.

## Deterministic grid normalization

The staging-only helper `output/character-pilots/_work/normalize_global_2x4.py` identifies the eight globally separated foreground figures, sorts them by row and horizontal position, applies one shared scale, and places each talon datum bottom-center into exact `512x512` cells. The regular `generate2dsprite.py` processor then runs again with strict edge rejection. This changes layout and anchor only; it does not redraw poses or identity.

## Remaining gate

Starflame Phoenix is mechanically and visually ready for Owner review as a complete staging catalog. It is not approved for `assets/**`, registry, or runtime promotion by this QC record.
