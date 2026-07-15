# Character Lock Spec — 雷霆幼狼 / ThunderPup

> Source: Owner-confirmed reference sheet "侵核者設定圖鑑" (2026-07-14), row 1 of 5. This review-production lock uses the existing Tier 3 identity `thunder-pup` for the Black Iron Wood seat; formal canon integration remains a separate task.

## Identity

- character_id: `thunder-pup`
- display_name: 雷霆幼狼 / ThunderPup
- faction: 黑鐵駭客 (Owner-confirmed visual roster; formal canon integration pending)
- role: 木席；感知細微電流、追蹤數據波動、潛伏並狙擊敵方訊號
- element: Wood, with lightning/shadow as secondary technical motifs
- species: juvenile wolf pup; canine quadruped
- age_feel: compact vigilant pup, not an adult war wolf or obedient pet dog

## Core Silhouette

- Compact dark wolf-pup body with sturdy paws, upright triangular ears, short muzzle, and a long balancing tail.
- A layered violet-blue crystalline/electric ridge runs from neck across the shoulders and upper back.
- Tail ends in a luminous violet-blue crystalline flame/bolt tuft.
- Small-screen read: black-charcoal pup + electric blue circuit cracks + violet crystalline back ridge + circular blue chest core.

## Face / Eye Identity

- Bright cyan-blue eyes with a focused, observant expression.
- Cyan circuit marks frame the eyes and run down the muzzle without becoming a mask.
- Ears remain upright and independently expressive; no floppy domestic-dog ears.
- Baseline expression is quiet vigilance and signal tracking, not aggression, panting, or eager obedience.

## Color System

- Primary: deep charcoal-black fur with cool graphite highlights.
- Secondary: saturated indigo and violet crystalline ridge/tail accents.
- Accent: electric cyan-blue eyes, chest core, and branching circuit/lightning lines.
- Forbidden: green wood-leaf recolor, warm brown domestic-wolf palette, dominant red/orange fire, full silver armor shell.

## Signature Markings

- Thin branching electric/circuit lines cross face, shoulders, torso, legs, and tail while preserving readable dark-fur negative space.
- Circular cyan chest core has a violet outer ring.
- Rear view retains a larger circular cyan-violet back-node motif between the shoulders.
- Markings should remain positionally stable across frames; do not randomize the lightning network per pose.

## Material Language

- Translate the explicit `Pixel Art (64×64 Grid)` source into high-detail illustrated fur with restrained cool rim light.
- Crystal ridge and tail tip read as hard translucent energy-mineral material, distinct from fur.
- Circuit lines glow from within/along the fur; do not turn the body into a metal robot shell.
- This character and Goldenspark Wyrm carry the strongest Black Iron material read in the five-character sheet.

## Species-Motion Note

- Canine locomotion uses shoulder-led wolf-pup steps, paw compression, ear tracking, nose-led signal checks, and tail balance.
- Do not copy WaveCub's feline shoulder roll/pounce, Star Foal's hoof rhythm, or generic happy-puppy bounce.
- Boundary language: ears rotate back, body angles away, crystalline ridge lifts, chest core narrows, and tail-bolt forms a visible distance line.
- Signal-tracking actions may use restrained head turns and short pauses; no rifle, weapon, scope, projectile, or detached targeting UI is baked into body sheets.

## Forbidden Drift

- no adult dire wolf, humanoid werewolf, armored war mount, or domestic dog read
- no green plant motifs just because the primary seat is Wood; lightning/shadow remains a secondary style, not a replacement element
- no missing crystal ridge, tail bolt, chest core, rear node, cyan eyes, or circuit network
- no white background, floor shadow, pedestal, magic circle, UI, text, scenery, weapon, projectile, or detached FX in runtime frames
- no chunky pixel art in generated masters; the pixel/isometric source remains identity/reference material only

## Runtime Art Policy

- illustrated / painterly / high-detail project-native companion art
- 512×512 transparent PNG master frames; linear sampling + mipmaps
- bottom-center anchor at four-paw baseline; frameHeight scaling
- all approved review actions use eight frames in a 2×4 grid; sheet = 2048×1024 after processing
- sheet edge <=4096 and exactly divisible grid
- review production only under `output/**`; no runtime promotion without a later GROUNDWORK gate

## Reference

- Primary: `docs/art/reference/black-iron-hackers-stage1-reference-sheet.png`, row 1
- Dimensions: 1536×1024
- SHA-256: `b6fd8fec4f0c1dbfdb840348e3e98699e1f19c1a73c2a2cd46c3f743cd0db8cf`
- View note: labeled front/side/back but rendered as isometric/three-quarter reference views, not an orthographic turnaround
- Runtime allowed: no; create clean transparent production frames from this lock

## Approval Status

- reference_set_status: Owner-confirmed and fingerprinted 2026-07-14
- lock_spec_status: approved for review production
- approved_for_actions: review-staging image generation under `output/**`; not runtime promotion; formal canon integration remains pending
