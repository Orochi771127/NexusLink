# Character Lock Spec — 金光幼龍 / Goldenspark Wyrm

> Source: Owner-supplied reference sheet "侵核者設定圖鑑" (2026-07-14), row 5 of 5 (front/side/back). Provisional Black Iron Hackers Metal seat — see `../BLACK_IRON_HACKERS_STAGE1_CHARACTER_ASSET_INDEX.md` for roster-level conflict log before treating this as final. Of the five characters on this sheet, this one carries the established Black Iron Hackers material language (metal plating, gear motif) most strongly — see index note.

## Identity

- character_id: `goldenspark-wyrm`
- display_name: 金光幼龍 / Goldenspark Wyrm
- faction: 黑鐵駭客 (Owner-confirmed visual roster; formal canon integration pending)
- role: 金席；偵測與破解結構弱點
- element: Metal
- species: juvenile dragon/wyrm whelp; **saurian quadruped**, not a mammal template — see Species-Motion note

## Species-Motion Note (read before generating any action beyond idle)

Per the user's explicit instruction, this is a dragon and must not share a motion family with the mammal quadrupeds on this sheet (ThunderPup, WaveCub) or the equine Star Foal.
- No wings are visible in the reference — treat as a grounded whelp, not a flier, unless the Owner specifies otherwise.
- Reptilian/saurian gait: lower-slung body than a mammal cub, tail used actively for balance (not just decorative), hip rotation reads differently from a mammal's shoulder-led stride.
- Signature interactive detail: the tail ends in a gear/cog shape. This should be treated as a functional-looking mechanical tail tip that can visibly spin/whir as an idle or alert tell — a unique motion beat none of the other four companions have, and one that directly earns the Black Iron Hackers "gear/circuit" material language the rest of the roster is currently missing (see index note).
- Spiky ridge plating down the back and head should move as a rigid unit (like stiff dorsal spines), not flex like fur or feathers.

## Core Silhouette

- Compact, low-slung dragon-whelp body, short sturdy legs, rounded snout, no visible wings.
- Prominent spiked ridge running from head down the spine to the tail.
- Tail terminates in a stylized gold gear/cog shape.
- Small-screen read: gold/yellow spiky-ridged body + gear-tail silhouette + green glowing eyes + metallic body-plate seams.

## Face / Eye Identity

- Bright green glowing eyes (the sheet's only green-eyed character — a deliberate distinguishing feature within the roster).
- Short rounded snout, no visible fangs at rest, small nostril slits.
- Small spike "eyebrow" ridges above the eyes echoing the dorsal spike motif.
- Baseline expression: watchful and analytical rather than aggressive — matches the "偵測與破解結構弱點" role description (a scanner/analyst temperament, not a brute).

## Color System

- Primary: warm gold/yellow scaled body.
- Secondary: deeper amber-gold spike ridge and tail gear.
- Accent: green glowing eyes; thin darker-gold seam lines across the body suggesting armor-plate joints rather than organic scale texture alone.
- Forbidden: red/fire-toned dragon palette (would collide with Starflame Phoenix's fire read), full black-iron-gray body (would lose this character's gold "treasure/precision metal" identity), cool blue/cyan recolor.

## Signature Markings

- Body-plate seam lines suggesting micro-armor segmentation, concentrated on shoulders, back, and haunches.
- Small gear-tooth motif repeated at the tail tip. Preserve the visible circular gold chest/core emblem from the front view and the larger circular back plate from the rear view; the gear tail complements rather than replaces the core motif.
- Symmetry: ridge spikes and body seams mirrored left-right.

## Material Language

- Scales render as small overlapping metallic-sheen plates rather than soft organic reptile skin — this is the character where "body armor" is diegetic (scales *are* the armor), unlike the other four where any armor language should stay accent-only.
- Gear tail tip should read as a genuinely mechanical object (visible teeth, slight metallic highlight) rather than a soft toy shape.
- Spike ridge has a harder material read (like polished horn/metal) than the plush fur language used for ThunderPup/WaveCub/Star Foal.

## Personality and Motion

- First read: watchful, precise, a little aloof — an analyst/scout temperament rather than a cuddly companion, while still staying within Cyber-Taoism's "not purely dark" tone per `R2_FACTION_BIBLE.md` §4.
- Motion: low, deliberate saurian steps, head tracking side to side when scanning, tail gear spinning faster as an alert/focus tell.
- Boundary language: ridge spikes may flare/lift and gear-tail spins rapidly as a warning display, distinct from a mammal's ear-flatten or crouch.
- Do not reuse any mammal cub's bounce, the horse's head-bob stride, or a Western fire-breathing adult dragon's aggressive stance.

## Forbidden Drift

- no wings unless the Owner explicitly authorizes a flight-capable redesign
- no red/fire palette, no full gunmetal-gray body (must stay gold-primary)
- no adult dragon proportions, no fire-breathing pose baked into idle/portrait frames
- no white background, floor shadow, stone pedestal ring, magic-circle platform, UI, text, scene, or codex frame baked into runtime output
- no chunky pixel art in generated masters; the source explicitly says `Pixel Art (64×64 Grid)` and remains identity/reference material only

## Runtime Art Policy

- illustrated / painterly / high-detail, matching root Companion 美術規格 in `CLAUDE.md` §4
- 512x512 transparent PNG master frames; linear sampling + mipmaps
- bottom-center anchor at four-leg baseline; frameHeight scaling
- sheet edge <=4096 and exactly divisible grid
- this lock spec authorizes generation *planning* only — no image generation, asset writes, or registry changes without a separate approval-gated task per `docs/assets/CHARACTER_ASSET_PIPELINE.md`

## Reference

- Primary: Owner-supplied reference sheet "侵核者設定圖鑑" (uploaded 2026-07-14), row 5 — front/side/back three-quarter views on stone pedestal
- File: `docs/art/reference/black-iron-hackers-stage1-reference-sheet.png`; 1536×1024; SHA-256 `b6fd8fec4f0c1dbfdb840348e3e98699e1f19c1a73c2a2cd46c3f743cd0db8cf`.
- View note: labeled front/side/back but rendered as isometric/three-quarter reference views, not an orthographic turnaround.
- Use: identity, silhouette, palette, marking placement
- Runtime allowed: no — pedestal, stone ring, glow-ring platform, and codex frame in the reference must never enter runtime output

## Approval Status

- reference_set_status: Owner-confirmed and fingerprinted 2026-07-14
- lock_spec_status: approved for review production; chest/core motif resolved from the supplied front/back views
- approved_for_actions: review-staging image generation under `output/**`; not runtime promotion; formal canon integration remains pending
