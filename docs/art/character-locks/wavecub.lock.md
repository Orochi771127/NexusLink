# Character Lock Spec — 浪花幼獅 / WaveCub

> Source: Owner-supplied reference sheet "侵核者設定圖鑑" (2026-07-14), row 2 of 5 (front/side/back). Formal Ironflow Hackers Water seat; Owner authorized canon and GROUNDWORK runtime promotion on 2026-07-22.

## Identity

- character_id: `wavecub`
- display_name: 浪花幼獅 / WaveCub
- faction: 黑鐵駭客 / Ironflow Hackers (formal Water seat)
- role: 水席；訊號潮汐感知，數據洪流穿梭型偵查/機動
- element: Water
- species: juvenile lion-spirit cub; feline quadruped
- age_feel: small playful cub, rounder and less "combat-ready" than an adult signature beast; must not read as a lion pride leader

## Core Silhouette

- Compact lion-cub body, round head, oversized paws, short thick legs, small rounded ear tufts.
- Mane is not a full adult mane — a short spiky "wave-crest" fringe around the face, echoing water motion rather than lion dominance.
- Tail is slim and ends in a small blue flame/water-wisp tuft (not a bushy lion tail).
- Small-screen read: white-blue fur + spiky wave-fringe mane + glowing blue tail-tip + pale cyan cheek/body markings.

## Face / Eye Identity

- Large pale blue eyes, calm and alert, no aggressive predator glare.
- Small pink/pale nose, soft muzzle, no visible fangs at rest.
- Thin cyan marking lines sweep from brow to cheek, echoing water-current motifs.
- Baseline expression: curious, alert, quick to react — "活潑好奇" per source reference, not sleepy or docile.

## Color System

- Primary: white / very pale ice-blue fur.
- Secondary: deeper cobalt-blue mane fringe, ear interiors, and paw tips.
- Accent: glowing cyan-blue circuitry-thin markings on cheeks, shoulders, and haunches; blue flame-wisp tail tip.
- Forbidden: golden/tawny lion palette, orange or fire-warm tones, black iron/rust plating dominating the silhouette (accent-only if any).

## Signature Markings

- Thin glowing cyan line markings following a current/ripple pattern across face, shoulders, and haunches (distinct from Starstripe Cub's tiger stripe bands — these are single thin flowing lines, not repeated parallel stripes).
- Chest core: soft blue glow point, echoing the faction's "core" motif seen across the sheet's other four companions.
- Symmetry: markings are left-right mirrored; no scars or asymmetric damage marks unless specified later.

## Material Language

- Translate the pixel/isometric reference into plush illustrated fur, with a slightly damp-look sheen on the mane fringe to suggest water affinity (not wet/dripping, just a soft sheen).
- Tail-tip flame-wisp is a soft translucent glow effect, not a solid blue pom.
- Any circuitry-thin markings should read as bioluminescent skin/fur glow, not hard-edged metal inlay — reserve hard metal edges for material language that should differentiate this roster from Heartspark Council (see roster index conflict note on faction-visual-language mismatch).

## Personality and Motion

- First read: lively, curious, quick, and a little mischievous — a scout/skirmisher temperament, not a tank or a glowing sage.
- Motion: light bouncy feline steps with a slight "ripple" weight-shift, tail flicks like a small current; darts and pounces rather than steady planted stance.
- Boundary language: ears flatten and tail-flame flares brighter when alert/defensive; does not freeze-and-stare like Starstripe Cub's `defend` read.
- Do not reuse Starstripe Cub's steady/protective stance, Blazetail Kit's fire-burst temperament, or a generic "happy puppy" bounce.

## Forbidden Drift

- no adult lion mane, no golden/tawny palette, no savanna/pride imagery
- no bushy tail (tail must stay slim with a wisp tip)
- no armor plating covering the body; the approved Stage 1 Ironflow Hackers read uses accent-only materials. Any heavier mechanical redesign requires a separate Owner art／canon gate.
- no white background, floor shadow, stone pedestal ring, magic-circle platform, UI, text, scene, or codex frame baked into runtime output
- no chunky pixel art in generated masters; the source explicitly says `Pixel Art (64×64 Grid)` and is identity/reference material only

## Runtime Art Policy

- illustrated / painterly / high-detail, matching root Companion 美術規格 in `CLAUDE.md` §4 (not the source reference's own semi-pixel/isometric rendering)
- 512x512 transparent PNG master frames; linear sampling + mipmaps
- bottom-center anchor at four-paw baseline; frameHeight scaling
- sheet edge <=4096 and exactly divisible grid
- selected 29-action catalog and portrait are approved for this GROUNDWORK runtime promotion; future generation or replacement still requires a separate gate per `docs/assets/CHARACTER_ASSET_PIPELINE.md`

## Reference

- Primary: Owner-supplied reference sheet "侵核者設定圖鑑" (uploaded 2026-07-14), row 2 — front/side/back three-quarter views on stone pedestal
- File: `docs/art/reference/black-iron-hackers-stage1-reference-sheet.png`; 1536×1024; SHA-256 `b6fd8fec4f0c1dbfdb840348e3e98699e1f19c1a73c2a2cd46c3f743cd0db8cf`.
- View note: the sheet labels front/side/back, but the rendered bodies are isometric/three-quarter views rather than an orthographic turnaround. Use them for identity and orientation, not literal projection measurements.
- Use: identity, silhouette, palette, marking placement
- Runtime allowed: no — pedestal, stone ring, glow-ring platform, and codex frame in the reference must never enter runtime output; create clean transparent production frames from this lock only

## Approval Status

- reference_set_status: Owner-confirmed and fingerprinted 2026-07-14
- lock_spec_status: approved formal Ironflow Hackers Water-seat lock
- approved_for_actions: selected portrait + 29 eight-frame actions approved for `assets/**` runtime promotion 2026-07-22; future regeneration not implied
