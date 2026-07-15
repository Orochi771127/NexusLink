# Star Foal Full 8-Frame Catalog QC

Status: `VERIFIED` in review staging. Human promotion approval remains pending.

## Scope

- Character: `star-foal`
- Selected actions: 29 / 29
- Frames per action: exactly 8
- Selected sheet: `2048x1024` RGBA PNG, `4x2` grid, `512x512` per frame
- Preview: eight-frame looping GIF per action
- Location: `output/character-pilots/star-foal/<action>/`
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
- Raw generations, alpha sources, normalization reports, processor metadata, selected sheets, and previews remain together as review provenance.

## Species, visual, and semantic verification

- Identity markers remain stable: juvenile cream-white foal, four golden hooves, green eyes, orange-gold crystal mane and forehead crest, golden circuit markings, amber chest core, and one physically attached star-tip tail.
- Locomotion and expressive shifts use true four-hoof balance, equine neck arcs, ear response, and controlled hoof cadence. No selected motion uses deer, canine, feline, caprine, or biped anatomy.
- `sit` is a species-safe folded equine rest rather than a dog sit; `idle_wash` uses muzzle-to-shoulder grooming and a mane shake rather than paw grooming.
- `sleep` is supported deep sleep with both eyes closed in all eight frames; chest core and attached tail-star remain alive. Waking is exclusive to `idle_wake`.
- Touch responses preserve consent: acceptance and `hug` are voluntary proximity, guarded contact retains reserve, and rejection establishes distance without punishment.
- `special_angry` is a planted-hoof boundary warning without kick, rear, charge, bite, or projectile.
- `attack_basic`, `skill_cast`, and `defend` translate the shared IDs into a grounded hoof press, body-bound resonance, and a stable protective stance rather than violent combat.
- `hit` is a brief hoof-slide and neck recoil without injury.
- `faint` is temporary controlled overload with a lit chest core and living tail-star, not death.
- `victory` is quiet recovery of posture and composure, without an opponent or domination framing.
- No selected action contains a pedestal, UI, text, human hand, weapon, projectile, gore, baked contact shadow, or detached effect.

## Deterministic grid normalization

The staging-only helper `output/character-pilots/_work/normalize_global_2x4.py` identifies the eight globally separated foreground figures, sorts them by row and horizontal position, applies one shared scale, and places each hoof datum bottom-center into exact `512x512` cells. The regular `generate2dsprite.py` processor then runs again with strict edge rejection. This changes layout and anchor only; it does not redraw poses or identity.

## Remaining gate

Star Foal is mechanically and visually ready for Owner review as a complete staging catalog. It is not approved for `assets/**`, registry, or runtime promotion by this QC record.
