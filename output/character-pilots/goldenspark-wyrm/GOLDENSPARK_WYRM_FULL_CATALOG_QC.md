# Goldenspark Wyrm Full 8-Frame Catalog QC

Status: `VERIFIED` in review staging. Human promotion approval remains pending.

## Scope

- Character: `goldenspark-wyrm`
- Selected actions: 29 / 29
- Frames per action: exactly 8
- Selected sheet: `2048x1024` RGBA PNG, `4x2` grid, `512x512` per frame
- Preview: eight-frame looping GIF per action
- Location: `output/character-pilots/goldenspark-wyrm/<action>/`
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
- Raw generations, rejected provenance, alpha sources, normalization reports, processor metadata, selected sheets, and previews remain together for review.

## Species, visual, and semantic verification

- Identity markers remain stable: small wingless gold-armored saurian body, four short clawed legs, rigid layered white-gold dorsal ridge, green eyes, amber forehead/chest/hip cores, and one segmented attached tail ending in an attached gear-ring.
- Locomotion stays low and quadrupedal with alternating reptilian foot cadence, modest shoulder/hip roll, and attached-tail counterbalance. No selected motion uses wings, mammal bounce, biped posture, or fire breath.
- `sit` is a compact sphinx-like saurian rest; `idle_wash` uses muzzle-to-foreleg/shoulder grooming without feline paw licking or canine scratching.
- `sleep` is supported deep sleep with both eyes closed in all eight frames; cores and attached gear center remain alive. Waking is exclusive to `idle_wake`.
- Touch responses preserve consent: acceptance and `hug` are voluntary low-body proximity, guarded contact retains reserve, and rejection turns the armored head/shoulder away without punishment.
- `special_angry` is an armored ground-hold warning without bite, claw strike, charge, roar, fire, or projectile.
- `attack_basic`, `skill_cast`, and `defend` translate shared IDs into a short ground press, body-bound clockwork scan, and dorsal-ridge boundary stance rather than violent combat.
- `hit` is a brief foot slide and armored recoil without injury.
- `faint` is temporary controlled overload with lit cores and a living attached gear-tail, not death.
- `victory` is quiet restoration of low four-foot posture and stable cores, without an opponent or domination framing.
- No selected action contains a pedestal, UI, text, human hand, weapon, projectile, gore, baked contact shadow, or detached effect.

## Rejection and correction notes

- The first `idle_wash` candidate retained faint black shake strokes after cleanup. It is preserved as `REJECTED_v1_motion-lines`; the selected v2 correction uses slow foreleg/shoulder grooming and contains no motion strokes.

## Deterministic grid normalization

The staging-only helper `output/character-pilots/_work/normalize_global_2x4.py` identifies eight globally separated foreground figures, sorts them by row and horizontal position, applies one shared scale, and places each foot datum bottom-center into exact `512x512` cells. The regular `generate2dsprite.py` processor then runs again with strict edge rejection. This changes layout and anchor only; it does not redraw poses or identity.

## Remaining gate

Goldenspark Wyrm is mechanically and visually ready for Owner review as a complete staging catalog. It is not approved for `assets/**`, registry, or runtime promotion by this QC record.
