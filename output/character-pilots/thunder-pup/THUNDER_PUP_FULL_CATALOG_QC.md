# ThunderPup Full 8-Frame Catalog QC

Status: `VERIFIED` in review staging. Human promotion approval remains pending.

## Scope

- Character: `thunder-pup`
- Selected actions: 29 / 29
- Frames per action: exactly 8
- Selected sheet: `2048x1024` RGBA PNG, `4x2` grid, `512x512` per frame
- Preview: eight-frame looping GIF per action
- Location: `output/character-pilots/thunder-pup/<action>/`
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

## Visual and semantic verification

- Identity markers remain stable: black wolf-pup fur, cyan eyes, cobalt lightning seams, violet-blue crystal mane/tail, chest core, and hip core.
- `sleep` is already deep sleep in all eight frames. Waking is exclusive to `idle_wake`.
- Touch responses preserve consent: acceptance is voluntary, guarded contact stays cautious, and rejection is non-punitive.
- `attack_basic`, `skill_cast`, and `defend` use warning, boundary resonance, and self-protection rather than damage spectacle.
- `hit` is a brief emotional recoil without injury.
- `faint` is temporary core overload with closed-eye rest and retained core light, not death.
- `victory` is stabilization and relieved recovery without an enemy, taunt, or domination framing.
- No selected action contains a pedestal, UI, text, human hand, weapon, projectile, gore, or detached combat effect.

## Deterministic grid normalization

Some raw image-generation sheets placed complete figures across implied cell boundaries even when the visible spacing looked adequate. The staging-only helper `output/character-pilots/_work/normalize_global_2x4.py` identifies the eight globally separated foreground figures, sorts them by row and horizontal position, applies one shared scale, and places them bottom-center into exact `512x512` cells. The regular `generate2dsprite.py` processor then runs again with strict edge rejection. This changes layout and anchor only; it does not redraw poses or identity.

## Remaining gate

ThunderPup is mechanically and visually ready for Owner review as a complete staging catalog. It is not approved for `assets/**`, registry, or runtime promotion by this QC record.
