# Character Lock Spec — 星焰鳳凰 / Starflame Phoenix

> Source: Owner-supplied reference sheet "侵核者設定圖鑑" (2026-07-14), row 3 of 5 (front/side/back). Formal Ironflow Hackers Fire seat; Owner authorized canon and GROUNDWORK runtime promotion on 2026-07-22.

## Identity

- character_id: `starflame-phoenix`
- display_name: 星焰鳳凰 / Starflame Phoenix
- faction: 黑鐵駭客 / Ironflow Hackers (formal Fire seat)
- role: 火席；干擾與灼燒敵方程序
- element: Fire
- species: juvenile phoenix; **avian**, not a quadruped — see Species-Motion note below
- age_feel: hatchling/chick, round-bodied and top-heavy with an oversized tail plume, not a majestic adult phoenix in flight

## Species-Motion Note (read before generating any action beyond idle)

This is a bird. Per `CLAUDE.md` §7 footnote and the existing `auriowl` (owl) precedent in the Heartspark Council roster, **bird-type companions must not be given generic four-leg mammal locomotion.** Concretely for this character:
- No four-leg walk cycle. Ground movement (if any at Stage 1) should be a hip-forward waddle/hop on two legs.
- Signature motion is wing/tail flame combustion, not paw-based attack or defend poses.
- Stage 1 is grounded: locomotion uses two-leg hops／steps and may use brief balance flutters, but no sustained flight or airborne idle. The selected 29-action catalog is the approved motion authority for this stage.

## Core Silhouette

- Round, top-heavy chick body with a disproportionately large fanned tail of flame-feather plumes.
- Short legs, clawed feet planted wide for balance under the heavy tail.
- Small hooked beak, rounded head, no visible neck-ruff feathers beyond a light collar tuft.
- Small-screen read: orange/red round bird body + large fan of flame-orange tail plumes + glowing blue chest core.

## Face / Eye Identity

- Round dark eyes with a bright highlight, alert and lively rather than fierce.
- Short curved orange-yellow beak.
- Thin glowing cyan-blue linework around the face/crown, contrasting the warm body plumage (same "circuit-thin glow line" language as WaveCub, establishing it as a roster-wide signature rather than a one-off).
- Baseline expression: bright, energetic, slightly impish — a young firebrand, not a serene sacred phoenix.

## Color System

- Primary: warm orange-red plumage across the body.
- Secondary: golden-yellow underbelly and beak/feet.
- Accent: bright flame-orange tail and wing-edge plumes with a soft outer glow; glowing cyan-blue chest core and facial linework.
- Forbidden: cool-toned phoenix (blue/purple firebird recolors), fully white/pale plumage, peacock-style eye-spot tail feathers.

## Signature Markings

- Cyan glow linework framing the face and running down the chest to the core point (roster-wide "core glow" signature, matching WaveCub's chest point and the other three sheet characters).
- Flame plume tail is the dominant marking feature — treat as pseudo-plumage more than "fire FX bolted on"; individual plume strands should be readable, not a solid painted blob.
- Symmetry: wings and plume fan are left-right mirrored at rest.

## Material Language

- Feathers read as soft illustrated plumage on the body, transitioning to stylized painterly flame at the tail/wingtip tips — the transition point from feather to flame should be a deliberate, consistent boundary across every frame, not redrawn ad hoc per animation.
- Chest core and face linework are bioluminescent glow, not metal inlay.
- Small spark/ember particles may drift off the tail plume in motion frames, consistent with the sheet's "羽焰融合高能熱源" description — keep particle density light so it reads clean at small screen size.

## Personality and Motion

- First read: bright, quick-tempered in a young/impish way, easily excitable — not a solemn mythic guardian.
- Motion: bobbing head, wide-set balancing steps/hops, tail plume flares and resettles with each movement beat.
- Boundary language: tail plume fans wide and chest core flares brighter when alarmed; wings mantle forward as a threat/defensive display (a bird-appropriate boundary gesture, not a mammal flinch or crouch).
- Do not reuse Blazetail Kit's fox motion, any mammal walk cycle, or a "majestic soaring adult phoenix" read at this life stage.

## Forbidden Drift

- no four-leg mammal gait, no fox/wolf/tiger motion borrowing
- no adult/majestic phoenix proportions; must stay chick-round and top-heavy
- no cool-toned recolor, no peacock eye-spot tail
- no white background, floor shadow, stone pedestal ring, magic-circle platform, UI, text, scene, or codex frame baked into runtime output
- no chunky pixel art in generated masters; the source explicitly says `Pixel Art (64×64 Grid)` and remains identity/reference material only

## Runtime Art Policy

- illustrated / painterly / high-detail, matching root Companion 美術規格 in `CLAUDE.md` §4
- 512x512 transparent PNG master frames; linear sampling + mipmaps
- anchor: bottom-center at the feet/balance point, never a flight-hover datum at Stage 1
- sheet edge <=4096 and exactly divisible grid
- selected 29-action catalog and portrait are approved for this GROUNDWORK runtime promotion; future generation or replacement still requires a separate gate per `docs/assets/CHARACTER_ASSET_PIPELINE.md`

## Reference

- Primary: Owner-supplied reference sheet "侵核者設定圖鑑" (uploaded 2026-07-14), row 3 — front/side/back three-quarter views on stone pedestal
- File: `docs/art/reference/black-iron-hackers-stage1-reference-sheet.png`; 1536×1024; SHA-256 `b6fd8fec4f0c1dbfdb840348e3e98699e1f19c1a73c2a2cd46c3f743cd0db8cf`.
- View note: labeled front/side/back but rendered as isometric/three-quarter reference views, not an orthographic turnaround.
- Use: identity, silhouette, palette, plume/marking placement
- Runtime allowed: no — pedestal, stone ring, glow-ring platform, and codex frame in the reference must never enter runtime output

## Approval Status

- reference_set_status: Owner-confirmed and fingerprinted 2026-07-14
- lock_spec_status: approved formal Ironflow Hackers Fire-seat lock; grounded Stage 1 motion resolved
- approved_for_actions: selected portrait + 29 eight-frame actions approved for `assets/**` runtime promotion 2026-07-22; future regeneration not implied
