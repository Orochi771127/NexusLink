# Character Lock Spec — 焰尾狐（Stage 1：焰尾小狐） / Blazetail Kit

> Owner reference Photo 1 is the identity authority. This lock covers the Stage 1 form only.

## Identity

- character_id: `blazetail-kit`
- display_name: 焰尾狐 / Blazetail Kit
- stage_1_form_name: 焰尾小狐
- legacy_id_alias: `flametail-fox`（只作存檔遷移；不是第二隻角色或第二套美術）
- faction: 心輝議會
- role: 火席；陪伴、溫度、勇氣與鼓舞
- element: Fire
- species: juvenile fox spirit; vulpine quadruped
- age_feel: small, bright Stage 1 companion; never adult fox or wolf

## Core Silhouette

- Compact fox body with a large head, very large upright triangular ears, short muzzle, four sturdy small paws, and one oversized flame-shaped tail.
- Head/body ratio is strongly juvenile; the head and eyes read first, while the torso stays compact.
- Tail is one continuous fox tail whose fur becomes layered flame tongues. It is not multiple tails and not a detached fire effect.
- Small-screen read: paired tall ears + huge upright flame tail + diamond chest gem.
- Preserve the clean four-paw stance and the tail's upward S-curve.

## Face / Eye Identity

- Very large warm amber-orange eyes with dark upper lash line and round highlights.
- Cream eyebrow wedges, cream cheek ruffs, small black-brown nose, short smiling mouth.
- Baseline expression is playful, warm, alert, and emotionally bright—not manic or obedient.
- Never lengthen the muzzle into a wolf/dog face or shrink the eyes into an adult predator stare.

## Color System

- Primary: saturated orange and ember red-orange fur.
- Secondary: cream muzzle, cheeks, inner-ear fur, chest, and underside.
- Accent: yellow-gold flame curls and bright yellow tail core.
- Chest focus: faceted orange diamond in a restrained gold mount.
- Forbidden: blue fire, black charred body, realistic smoke, purple corruption, or uniform flat orange.

## Signature Markings

- Golden spiral-flame markings on shoulder/flank and legs.
- Small flame lick rises from the crown; it remains integrated with the fur silhouette.
- Marking placement may articulate with motion but must not migrate, multiply, or become text-like runes.

## Material Language

- Premium illustrated storybook fur with distinct soft tufts; flame reads as luminous layered fur-fire, not plastic or photoreal combustion.
- Gem is translucent faceted crystal; mount is warm gold with restrained Cyber-Taoist geometry.
- Keep body readable under glow. Fire VFX never obscures paws, face, or silhouette.

## Personality and Motion

- First read: lively, teasing, courageous, hiding small fears behind brightness.
- Motion: quick anticipation, springy fox steps, ear-led reactions, tail-led arcs.
- Boundary: rejection is a clear step back with ears angled and tail placed between spaces; never snarling domination.
- See `../SPECIES_MOTION_TRANSLATION.md`; do not inherit wolf/bear weight.

## Forbidden Drift

- no wolf, dog, cat, nine-tailed fox, adult fox, armor suit, wings, horns, or humanoid posture
- no extra tails or detached flame familiar
- no generic lava-rock body; fur remains the dominant material
- no white background, floor shadow, UI, text, scene, pedestal, or card frame in runtime output
- no chunky pixel art, photoreal animal, flat sticker/anime, or plastic-toy surface

## Runtime Art Policy

- illustrated / painterly / high-detail premium 3D storybook diorama look
- 512x512 transparent PNG master frames; linear sampling + mipmaps
- bottom-center anchor at four-paw baseline; stable foot position; frameHeight scaling
- sheet edge <=4096 and exactly divisible grid

## Reference

- Primary: Owner Photo 1, 960x1280, SHA-256 `6655a7f737abcc9d2ea85cb6dc3a2428aeb24791e83b0148c40017a0338af928`
- Use: identity, silhouette, palette, markings, material language
- Runtime allowed: no; create clean transparent production frames from this lock

## Approval Status

- reference_set_status: Owner-confirmed 2026-07-10
- lock_spec_status: prepared-for-owner-review
- approved_for_actions: generation planning only; not runtime promotion
