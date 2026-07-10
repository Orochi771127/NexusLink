# Character Lock Spec — 金羽小梟 / Auriowl

> Owner reference Photo 4 is the identity authority. This lock covers the Stage 1 form only.

## Identity

- character_id: `auriowl`
- display_name: 金羽小梟 / Auriowl
- faction: 心輝議會
- role: 金席；判斷、守望、偵察與反制
- element: Metal
- species: juvenile owl spirit; avian
- age_feel: small alert owlet; never adult eagle, hawk, griffin, or armored war bird

## Core Silhouette

- Compact upright owl body with round chest, short neck, large rounded head, short hooked beak, folded layered wings, and two strong taloned feet.
- Feather crown forms a soft backward golden fan, not long mammal ears.
- Wing silhouette is broad and layered but remains attached to a small body.
- Small-screen read: round owl head + black hooked beak + gold feather crown + two folded wing masses.
- Preserve visible talons in grounded/perched actions and readable wing edges in flight.

## Face / Eye Identity

- Very large round golden-yellow eyes with dark pupils, black rim/upper lash line, and bright highlights.
- Short black hooked beak with a gold cere/upper bridge.
- Cream facial feathers form a soft owl disk without becoming a heart-shaped barn-owl mask.
- Baseline expression is curious, vigilant, affectionate but shy—not aggressive eagle pride.

## Color System

- Primary: warm cream/ivory feathers.
- Secondary: layered metallic gold and amber-gold wing/crown feathers.
- Accent: near-black beak and talons; pale yellow-gold glow.
- Chest focus: large faceted golden diamond in an ornate but lightweight gold setting.
- Forbidden: silver body, brown realistic owl camouflage, red eyes, rainbow plumage, or heavy dark armor.

## Signature Markings and Accessories

- Round gold shoulder medallion sits over the near wing with a clear circular sun/watch motif.
- Gold chest setting and shoulder medallion are the only armor-like structures; they do not expand into a cuirass or helmet.
- Feather count may simplify for animation, but major crown layers and wing color blocks remain stable.

## Material Language

- Feathers are layered, soft-edged illustrated forms with subtle metallic gold response; never rigid metal blades across the whole body.
- Medallion and gem use engraved Cyber-Taoist geometry with restrained highlights.
- In motion, feathers overlap and compress; they do not stretch like rubber or turn into fingers.

## Personality and Motion

- First read: curious, alert, shyly affectionate, always watching emotional currents.
- Motion: precise head turns, feather compression/fluff, wing mantle, short hops, controlled low flight.
- Boundary: feathers tighten, wings mantle the body, then a backward hop; never pecking punishment.
- `right_walk`/`left_walk` default to ground hop/step; low flight requires an explicit action config.
- `sit` means perch/ground settle with folded wings. `hug` means consensual wing shelter beside the other body, not arm-like squeezing.

## Flight / Anchor Rules

- Grounded/perched loops use talon bottom-center baseline.
- Flight animation keeps the same frame anchor while body elevation occurs within the frame or controlled motion path.
- Takeoff and landing must return to the exact datum; no permanent hovering, foot sliding, or pose snap.

## Forbidden Drift

- no four-legged walk, mammal sitting, paws, arms, hands, wing fingers, eagle/hawk head, griffin body, horned owl ears, or humanoid armor
- no continuous default hovering; this companion normally grounds/perches between flights
- no full metal feather body or blade-wing weaponization
- no white background, branch/scene baked into runtime frames, floor shadow, UI, text, pedestal, or card frame
- no chunky pixel art, photoreal owl, flat sticker/anime, or plastic-toy surface

## Runtime Art Policy

- illustrated / painterly / high-detail premium 3D storybook diorama look
- 512x512 transparent PNG master frames; linear sampling + mipmaps
- bottom-center anchor at talon/perch datum; stable return position; frameHeight scaling
- sheet edge <=4096 and exactly divisible grid

## Reference

- Primary: Owner Photo 4, 1024x1280, SHA-256 `4cb137cd3026bc35ca51b8e8d760a9da90f25b4d1e1289af083defec80c2c6b9`
- Use: identity, silhouette, palette, feather/material language, accessories
- Runtime allowed: no; create clean transparent production frames from this lock

## Approval Status

- reference_set_status: Owner-confirmed 2026-07-10
- lock_spec_status: prepared-for-owner-review
- approved_for_actions: generation planning only; not runtime promotion
