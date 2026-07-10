# Character Lock Spec — 晶鰭小海馬 / Crystalfin Seahorse

> Owner reference Photo 2 is the identity authority. This lock covers the Stage 1 form only.

## Identity

- character_id: `crystalfin-seahorse`
- display_name: 晶鰭小海馬 / Crystalfin Seahorse
- faction: 心輝議會
- role: 水席；記憶、沉澱、控場與記憶防護
- element: Water
- species: juvenile seahorse spirit; aquatic hover; no legs
- age_feel: small sensitive Stage 1 companion; never mature sea dragon

## Core Silhouette

- Upright seahorse body with rounded forehead, short tubular snout, segmented pale belly, curled prehensile tail, and crystalline dorsal/side fins.
- No arms, legs, paws, hooves, or floor contact.
- Head is large and friendly; torso narrows into one continuous spiral tail.
- Crystal crown and back fin create a jagged upper/right silhouette while the belly and tail remain soft and rounded.
- Small-screen read: upright S-body + spiral tail + blue crystal fan.

## Face / Eye Identity

- One large visible deep-blue eye with cyan inner glow and round highlights; preserve matching eye identity when angle reveals both eyes.
- Short rounded snout with small nostril, pale cheek plate, and calm closed mouth.
- Baseline expression is quiet, observant, sensitive, and cautious—not vacant or infantile.
- Never turn the head into a horse, lizard, dragon, crocodile, or generic fish.

## Color System

- Primary: luminous turquoise/cyan scales.
- Secondary: ivory-to-pale-blue segmented belly and cheek.
- Accent: saturated sapphire/cobalt crystals with white facets and cyan edge light.
- Chest focus: blue faceted diamond embedded/mounted at upper belly.
- Forbidden: green swamp palette, purple corruption, opaque stone body, metallic robot plating, or rainbow crystals.

## Signature Anatomy and Markings

- Crown crystals begin above/behind the forehead and continue along the back.
- Two larger lateral crystal fins project rearward from mid-body; they are fins, not wings.
- Small crystal nodes may appear along the side but must not multiply into full armor.
- Spiral tail curl direction and proportion remain recognizable across frames.

## Material Language

- Scales are soft illustrated aquatic plates with pearlescent response; belly plates remain smooth and readable.
- Crystals are translucent faceted glass/mineral, not ice cubes or metal blades.
- Water motion may use subtle separate VFX, but no baked ocean scene, bubbles, pedestal, or white backdrop.

## Personality and Motion

- First read: quiet, receptive, memory-sensitive, easily overwhelmed by emotional echoes.
- Motion: fin-led hover, tail coil/uncoil, slow water-resistance timing, small vertical drift.
- Boundary: rejection is a controlled backward current with fins closing and tail coiling inward.
- Shared locomotion IDs translate to swimming. `sit` means stationary settled hover; `faint` means slow safe sink with living fin motion.
- Never use quadruped pose transfer.

## Anchor / Hover Datum

- Runtime anchor remains bottom-center for loader compatibility.
- The visual datum is the lowest stable point of the curled tail plus a fixed invisible hover margin—not a foot baseline.
- Each loop must return to the same hover datum. Vertical motion occurs inside the frame or through controlled motion data and must not create snap on animation changes.

## Forbidden Drift

- no legs, feet, paws, hooves, arms, mammal sitting, floor impacts, or walking
- no adult sea dragon, serpentine dragon, fish tail fan, mermaid torso, wings, or humanoid hands
- no crystal armor covering the face or belly
- no white background, water tank, bubbles-as-scene, UI, text, pedestal, or card frame in runtime output
- no chunky pixel art, photoreal seahorse, flat sticker/anime, or plastic-toy surface

## Runtime Art Policy

- illustrated / painterly / high-detail premium 3D storybook diorama look
- 512x512 transparent PNG master frames; linear sampling + mipmaps
- stable bottom-center hover datum; frameHeight scaling
- sheet edge <=4096 and exactly divisible grid

## Reference

- Primary: Owner Photo 2, 1024x1280, SHA-256 `f69f247edcaa52376701acf7caa2cec994bd3e1e816f822b69282f20c76fe0fd`
- Use: identity, silhouette, palette, crystal anatomy, material language
- Runtime allowed: no; create clean transparent production frames from this lock

## Approval Status

- reference_set_status: Owner-confirmed 2026-07-10
- lock_spec_status: prepared-for-owner-review
- approved_for_actions: generation planning only; not runtime promotion
