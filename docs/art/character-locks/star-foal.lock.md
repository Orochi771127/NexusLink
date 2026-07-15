# Character Lock Spec — 幼星駒 / Star Foal

> Source: Owner-supplied reference sheet "侵核者設定圖鑑" (2026-07-14), row 4 of 5 (front/side/back). Provisional Black Iron Hackers Earth seat — see `../BLACK_IRON_HACKERS_STAGE1_CHARACTER_ASSET_INDEX.md` for roster-level conflict log, including a naming/motif echo against Heartspark Council's Earth seat (`starstripe-cub`), before treating this as final.

## Identity

- character_id: `star-foal`
- display_name: 幼星駒 / Star Foal
- faction: 黑鐵駭客 (Owner-confirmed visual roster; formal canon integration pending)
- role: 土席；穩定環境場域，防禦與支援友方系統
- element: Earth
- species: juvenile horse/pony foal; **equine**, not a generic four-leg mammal template — see Species-Motion note

## Species-Motion Note (read before generating any action beyond idle)

Per the user's explicit instruction, this character must not share a motion family with the roster's canine/feline members (ThunderPup, WaveCub) or with the codebase's existing deer/cervid family (`sprigfawn`). Horses have their own gait vocabulary:
- Longer neck reach and head-bob timing than a cat/dog/deer walk cycle.
- Single-hoof foot silhouette (no toe/claw spread) and a straighter, more vertical pastern/leg line than a paw-footed quadruped.
- Mane and tail are hair-tuft physics (flowing strands), distinct from a fox/wolf's bushy tail or a lion cub's tufted tail.
- A horse's "alert" and "boundary" body language reads through ear rotation and a raised/arched neck, not crouching or flattening low to the ground like a cat.

## Core Silhouette

- Small pony-foal body, slightly gangly long-legged proportions (foals read "young" partly through longer legs relative to body vs. an adult horse), rounded barrel body kept soft/cute rather than anatomically gangly-awkward.
- Short mane with flame/star-shaped spike tips rather than flowing horsehair — this is the character's signature departure from a plain pony silhouette.
- Tail ends in a small star/spark shape (matching the reference image's tail motif), not a full hair tuft.
- Small-screen read: cream/tan pony body + spiky gold-flame mane + glowing gold star-tail-tip + gold circuit/star markings on flank.

## Face / Eye Identity

- Large soft green eyes, gentle and steady rather than skittish.
- Small muzzle, no visible teeth at rest, soft nostril shading.
- A raised orange-gold flame/star crest rises between the ears. It is a dimensional mane/crest feature, not a flat coat-color blaze.
- Baseline expression: calm, grounded, quietly attentive — supportive-type temperament per the source description ("親和地核頻率，能穩定環境場域").

## Color System

- Primary: cream/pale tan body coat.
- Secondary: warm gold-orange mane spikes and tail star.
- Accent: thin gold circuit/star-line markings on shoulder, flank, and hindquarters; glowing gold chest core (roster-wide core-glow signature, same language as WaveCub and Starflame Phoenix).
- Forbidden: brown/chestnut realistic horse palette, blue/cool palette drift, dark/black "shadow horse" recolor.

## Signature Markings

- Raised flame/star forehead crest; the separate tail tip ends in a clear five-point spark/star.
- Thin gold linework markings on the body reading as a stylized star-map/constellation trace rather than tribal-band stripes (differentiates from Starstripe Cub's parallel tiger-stripe bands even though both use a "star" name root).
- Symmetry: markings mirrored left-right at rest.

## Material Language

- Plush illustrated coat; mane spikes render as soft stylized flame-shape tufts, not sharp hard-edged blades.
- Star-line markings are a soft inner glow (bioluminescent), not metal inlay or tattoo-hard edges.
- Hooves may carry a faint metallic sheen as a light nod to the Black Iron Hackers material language, but should not read as full metal shoes/armor.

## Personality and Motion

- First read: steady, warm, supportive, a grounding presence for the rest of the roster.
- Motion: equine gait — longer stride reach, head-bob on each step, gentle sway rather than a bouncy cub trot; at rest, weight settles evenly on all four slim legs rather than crouching.
- Boundary language: ears pin back and neck arches/raises (equine alert posture), plus chest-star flare, rather than baring teeth or a defensive crouch.
- Do not reuse Starstripe Cub's paw-planted `defend` stance, any cervid (deer) bounding gait, or a generic four-leg cartoon trot shared with the roster's canine/feline members.

## Forbidden Drift

- no adult horse proportions or realistic tack/saddle/bridle
- no cervid antlers or deer-style bounding gait
- no full metal horseshoes/leg armor (accent sheen only, pending Owner confirmation of roster-wide "how mechanical" direction)
- no white background, floor shadow, stone pedestal ring, magic-circle platform, UI, text, scene, or codex frame baked into runtime output
- no chunky pixel art in generated masters; the source explicitly says `Pixel Art (64×64 Grid)` and remains identity/reference material only

## Runtime Art Policy

- illustrated / painterly / high-detail, matching root Companion 美術規格 in `CLAUDE.md` §4
- 512x512 transparent PNG master frames; linear sampling + mipmaps
- bottom-center anchor at four-hoof baseline; frameHeight scaling
- sheet edge <=4096 and exactly divisible grid
- this lock spec authorizes generation *planning* only — no image generation, asset writes, or registry changes without a separate approval-gated task per `docs/assets/CHARACTER_ASSET_PIPELINE.md`

## Reference

- Primary: Owner-supplied reference sheet "侵核者設定圖鑑" (uploaded 2026-07-14), row 4 — front/side/back three-quarter views on stone pedestal
- File: `docs/art/reference/black-iron-hackers-stage1-reference-sheet.png`; 1536×1024; SHA-256 `b6fd8fec4f0c1dbfdb840348e3e98699e1f19c1a73c2a2cd46c3f743cd0db8cf`.
- View note: labeled front/side/back but rendered as isometric/three-quarter reference views, not an orthographic turnaround.
- Use: identity, silhouette, palette, marking placement
- Runtime allowed: no — pedestal, stone ring, glow-ring platform, and codex frame in the reference must never enter runtime output

## Approval Status

- reference_set_status: Owner-confirmed and fingerprinted 2026-07-14
- lock_spec_status: prepared-for-owner-review
- approved_for_actions: review-staging image generation under `output/**`; not runtime promotion; formal canon integration remains pending
