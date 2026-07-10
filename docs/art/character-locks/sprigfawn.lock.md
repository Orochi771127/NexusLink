# Character Lock Spec — 芽角小鹿 / Sprigfawn

> Owner reference Photo 3 is the identity authority. This lock covers the Stage 1 form only.

## Identity

- character_id: `sprigfawn`
- display_name: 芽角小鹿 / Sprigfawn
- faction: 心輝議會
- role: 木席；修復、生長、寬恕與持續回復
- element: Wood
- species: juvenile deer/fawn spirit; cervid hoofed quadruped
- age_feel: gentle Stage 1 fawn; never adult stag or elk

## Core Silhouette

- Slender fawn body with long fine legs, split dark hooves, short tail, large lateral ears, and two small branch-like sprouting antlers.
- Head remains juvenile and rounded; neck is elegant but not adult-long.
- Antlers are living young branches with a few fresh leaves. They are intentionally sparse and asymmetrical in leaf placement, not a mature rack.
- Small-screen read: tall ears + twin budding branch antlers + slim hoofed legs.
- Preserve safe negative space between antler branches and ears.

## Face / Eye Identity

- Large leaf-green eyes with dark upper lash line and rounded highlights.
- Warm dark-brown nose, small calm smile, cream muzzle/throat.
- White/cream fawn spots around forehead, cheeks, and back.
- Baseline expression is kind and approachable with cautious courage; never permanently timid or vacant.

## Color System

- Primary: warm chestnut/caramel brown fur.
- Secondary: cream muzzle, inner ears, throat, belly, and fawn spots.
- Accent: fresh leaf green vines/leaves and emerald chest gem.
- Antlers: natural warm wood with green shoots.
- Forbidden: neon toxic green, full bark body, autumn/dead leaves, icy blue, or adult dark-stag palette.

## Signature Markings

- Pale fawn spots remain discrete and organic; do not become leopard rosettes.
- Green vine spirals run along flank and legs with consistent major curl locations.
- A leafy collar/vine supports the emerald diamond at the chest.
- Vines never bind the legs or cover the face.

## Material Language

- Soft illustrated fur remains dominant; bark is limited to antlers and vine stems.
- Leaves are fresh, matte-to-soft-translucent, individually readable without becoming noisy foliage.
- Gem is faceted emerald crystal, not a glowing flat badge.

## Personality and Motion

- First read: gentle, affectionate, conflict-avoidant, brave when protection matters.
- Motion: hoof-led light gait, neck/ear phrasing, careful lateral retreat, restrained leaf response.
- Boundary: step back on hooves, angle body away, ears monitor; never dog crouch or paw block.
- `sit` translates to cervid folded-leg rest or standing rest. `idle_wash` uses muzzle/shoulder grooming or a leaf shake.
- Antlers must never clip, squash, rubber-bend, or change branch count across frames.

## Forbidden Drift

- no dog/cat sitting, paw grooming, feline pounce, bear lumber, antler attack gore, saddle, reins, armor suit, or humanoid posture
- no adult stag proportions or giant mature antler crown
- no extra horns, flowers replacing leaves, or full tree growing from the back
- no white background, floor shadow, UI, text, scene, pedestal, or card frame in runtime output
- no chunky pixel art, photoreal deer, flat sticker/anime, or plastic-toy surface

## Runtime Art Policy

- illustrated / painterly / high-detail premium 3D storybook diorama look
- 512x512 transparent PNG master frames; linear sampling + mipmaps
- bottom-center anchor at four-hoof baseline; stable hooves; frameHeight scaling
- sheet edge <=4096 and exactly divisible grid
- antlers and ears remain inside a conservative safe area at 390x844

## Reference

- Primary: Owner Photo 3, 1024x1280, SHA-256 `8e50fb87db341d8d8ff2e52b2b7aada9d43be88ead663f5dfe8660924a6c7def`
- Use: identity, silhouette, palette, antlers, markings, material language
- Runtime allowed: no; create clean transparent production frames from this lock

## Approval Status

- reference_set_status: Owner-confirmed 2026-07-10
- lock_spec_status: prepared-for-owner-review
- approved_for_actions: generation planning only; not runtime promotion
