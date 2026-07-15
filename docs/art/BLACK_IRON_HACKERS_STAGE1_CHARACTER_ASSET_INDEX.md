# Black Iron Hackers Stage 1 Character Asset Index

Status: **Owner-confirmed visual lock and review-production roster; formal canon integration pending.** The Owner supplied and confirmed the 2026-07-14 five-character sheet, then approved the same seed → species pilot → full-catalog workflow used for the formal Heartspark Council batch. Nothing in this index grants runtime readiness.

## Visual roster

| Element | Character | ID | Species-motion family | Lock spec | Review-production state |
|---|---|---|---|---|---|
| Wood | ThunderPup / 雷霆幼狼 | `thunder-pup` | canine signal tracker | `character-locks/thunder-pup.lock.md` | appearance locked; existing Tier 3 identity reused |
| Water | WaveCub / 浪花幼獅 | `wavecub` | feline current scout | `character-locks/wavecub.lock.md` | appearance locked |
| Fire | Starflame Phoenix / 星焰鳳凰 | `starflame-phoenix` | grounded avian firebird | `character-locks/starflame-phoenix.lock.md` | appearance locked; sustained-flight authority not granted |
| Earth | Star Foal / 幼星駒 | `star-foal` | equine stabilizer | `character-locks/star-foal.lock.md` | appearance locked |
| Metal | Goldenspark Wyrm / 金光幼龍 | `goldenspark-wyrm` | saurian gear-tail analyst | `character-locks/goldenspark-wyrm.lock.md` | appearance locked |

## Owner decisions recorded for this production task

1. The supplied sheet is the appearance-lock source for all five characters.
2. The existing Tier 3 `thunder-pup` identity is reused for the Wood seat shown on the sheet. Do not create a second homonymous character or a replacement ID for review production.
3. Formal canon/faction integration is deferred. The current Master Canon remains authoritative until a separate canon task updates it.
4. All five characters receive the shared 29 action IDs.
5. Every action uses eight frames. Raw generation uses a `2×4` body grid; processed cells are `512×512` and the delivery sheet is `2048×1024`.
6. `sleep` remains the action ID but depicts an already-deep-asleep loop in all eight frames. Waking belongs only to `idle_wake`.
7. Generated work stays under `output/**` until separate human review and later GROUNDWORK promotion approval.

## Resolved and remaining identity debt

### ThunderPup

- `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md` currently lists 雷霆幼狼 as a Tier 3 Roadmap candidate but does not assign it to the formal Heartspark Council five-seat roster.
- `docs/r2-canon/R2_FACTION_BIBLE.md` retains an older reference-era Heartspark representative list containing ThunderPup. That lower-level historical assignment does not override the 2026-07-10 formal Heartspark roster in Master Canon.
- Current filesystem verification found no `assets/characters/thunder-pup/` root, and current `src/data/companionRegistry.js` has no `thunder-pup` registry entry. The old directory-collision warning survives in coordination docs but is not a present filesystem/runtime collision.
- `src/engine/companionPersonality.js` still contains a dormant `thunderPup` archetype. Its warm/playful baseline may need a later persona/canon review if this visual identity is promoted; it is outside this art-production task.

### English faction label

- The supplied sheet and older R2 references say `BLACK IRON HACKERS`.
- Master Canon currently gives 黑鐵駭客 the English name `Ironflow Hackers`.
- Generated body sheets contain no text, so review production can proceed without silently changing the strategic canon. A later canon task must choose the public English label.

### Soft naming echoes

- `Starflame Phoenix / 星焰鳳凰` echoes the formal Heartspark Fire stage-2 name `Starflame Fox Warden / 星焰狐衛`.
- `Star Foal / 幼星駒` shares a broad star/young-mammal motif with `Starstripe Cub / 星紋小虎`.
- These do not collide at the ID level. Preserve the supplied display names during visual production; any player-facing rename belongs to the later canon task.

## Visual-language audit

The source is not uniformly Heartspark-like:

- **ThunderPup:** strong Black Iron read — charcoal body, neon circuit cracks, violet crystalline ridge/tail, chest and rear nodes.
- **Goldenspark Wyrm:** strong Black Iron read — plated metallic scales, rigid ridge, circular core plates, functional gear tail.
- **Starflame Phoenix:** medium read — clear circuit/core language, but the elemental baby-phoenix silhouette remains soft.
- **WaveCub:** medium-to-soft read — core/circuit markings carry the faction cue while white-blue plush anatomy remains approachable.
- **Star Foal:** weakest Black Iron material read — cream/gold softness dominates; identity depends on the raised crest, circuit/star traces, core, and later motion/persona rather than adding unauthorized heavy armor.

Stage 1 may remain younger and softer than adult faction representatives. Do not “fix” this by turning the five companions into boss forms, coating every body in armor, or drifting away from the supplied silhouettes.

## Reference fingerprint

| File | Dimensions | Format | SHA-256 | Use |
|---|---:|---|---|---|
| `reference/black-iron-hackers-stage1-reference-sheet.png` | 1536×1024 | RGB PNG | `b6fd8fec4f0c1dbfdb840348e3e98699e1f19c1a73c2a2cd46c3f743cd0db8cf` | identity, palette, silhouette, markings, orientation |

The footer explicitly describes the source as `Pixel Art (64×64 Grid)`. It is reference-only and must be translated into illustrated / painterly / high-detail `512×512` transparent production frames. The labeled front/side/back images are isometric/three-quarter views, not orthographic turnarounds.

## Gate order

1. Owner reference set confirmed and fingerprinted.
2. Five Character Lock Specs written and corrected against the original-resolution sheet.
3. Five-family motion translation approved in `BLACK_IRON_HACKERS_STAGE1_SPECIES_MOTION_TRANSLATION.md`.
4. Generate and human-review one transparent identity seed per character.
5. Generate and human-review one eight-frame pilot per motion family.
6. Produce each character vertically through P1, P2, and P3 until all 29 eight-frame actions pass local QC.
7. Build a five-character comparison board and cross-catalog QC report.
8. Human approves or rejects individual review sheets.
9. Open separate canon and GROUNDWORK asset-readiness/runtime migration tasks if promotion is desired.

## Non-promotion boundary

No file in this package grants runtime readiness. Do not write generated PNGs into `assets/**`, register companions, change manifests, alter save/state, or update public canon as a side effect of review production.
