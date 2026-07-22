# Ironflow Hackers Stage 1 Character Asset Index

Status: **Owner-confirmed canon and GROUNDWORK runtime promotion (2026-07-22).** The Owner supplied and confirmed the 2026-07-14 five-character sheet, approved the seed → species pilot → full-catalog workflow, then explicitly authorized all five 黑鐵駭客 / Ironflow Hackers seats to enter the game. Each selected catalog is now mapped as a distinct `full-runtime` / `runtime-ready` / `selectableWhenUnlocked` companion. Runtime readiness does not auto-unlock a character and is not launch approval. The filename retains the older `BLACK_IRON_HACKERS` production label for stable links; player-facing English follows Master Canon.

## Visual roster

| Element | Character | ID | Species-motion family | Lock spec | Runtime promotion state |
|---|---|---|---|---|---|
| Wood | ThunderPup / 雷霆幼狼 | `thunder-pup` | canine signal tracker | `character-locks/thunder-pup.lock.md` | promoted; existing identity becomes the formal Wood seat |
| Water | WaveCub / 浪花幼獅 | `wavecub` | feline current scout | `character-locks/wavecub.lock.md` | promoted as the formal Water seat |
| Fire | Starflame Phoenix / 星焰鳳凰 | `starflame-phoenix` | grounded avian firebird | `character-locks/starflame-phoenix.lock.md` | promoted; Stage 1 remains grounded with no sustained flight |
| Earth | Star Foal / 幼星駒 | `star-foal` | equine stabilizer | `character-locks/star-foal.lock.md` | promoted as the formal Earth seat |
| Metal | Goldenspark Wyrm / 金光幼龍 | `goldenspark-wyrm` | saurian gear-tail analyst | `character-locks/goldenspark-wyrm.lock.md` | promoted as the formal Metal seat |

## Owner decisions recorded for this production task

1. The supplied sheet is the appearance-lock source for all five characters.
2. The existing `thunder-pup` identity is reused for the Wood seat shown on the sheet. Do not create a second homonymous character or replacement ID; this promotion removes ThunderPup from the Tier 3 roadmap-candidate row.
3. Formal canon/faction integration is approved. The public English faction label remains the Master Canon name `Ironflow Hackers`; Chinese remains `黑鐵駭客`.
4. All five characters receive the shared 29 action IDs.
5. Every action uses eight frames. Raw generation uses a `2×4` body grid; processed cells are `512×512` and the delivery sheet is `2048×1024`.
6. `sleep` remains the action ID but depicts an already-deep-asleep loop in all eight frames. Waking belongs only to `idle_wake`.
7. Selected portrait and 29 selected action sheets per character may enter `assets/characters/<id>/` under this approved GROUNDWORK package. GIF previews, rejected candidates and production provenance remain review material under `output/**`; they are not runtime-loaded.

## Resolved identity and visibility boundaries

### ThunderPup

- `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md` now assigns 雷霆幼狼 to the formal Ironflow Hackers Wood seat and removes it from the Tier 3 roadmap-candidate row.
- `docs/r2-canon/R2_FACTION_BIBLE.md` retains an older reference-era Heartspark representative list containing ThunderPup. That lower-level historical assignment does not override the 2026-07-10 formal Heartspark roster in Master Canon.
- `assets/characters/thunder-pup/` is now ThunderPup's own runtime root. `crystal-rabbit` owns `assets/characters/crystal-rabbit/`; the historical directory-collision warning is resolved and must not be reintroduced.
- The five new registry records remain initially locked. The Codex should list the complete Stage 1 roster and present these five in a clearly marked unmet／locked state, but the companion selector and active-companion path still require a legal unlock／encounter state; Codex visibility creates no relationship or eligibility. Fresh default and Initial Bond remain unchanged.

### English faction label

- The supplied sheet and older R2 references say `BLACK IRON HACKERS`; this remains source-reference wording only.
- Master Canon's public English name `Ironflow Hackers` is authoritative. Generated body sheets contain no text, so no raster needs correction.

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

## Completed promotion gates and remaining product gates

1. Owner reference set confirmed and fingerprinted — complete.
2. Five Character Lock Specs corrected against the original-resolution sheet — complete.
3. Five-family motion translation approved in `BLACK_IRON_HACKERS_STAGE1_SPECIES_MOTION_TRANSLATION.md` — complete.
4. Transparent identity seeds and one eight-frame species pilot per character reviewed — complete.
5. P1／P2／P3 catalogs completed; all 29 eight-frame actions per character pass local mechanical and visual QC — complete.
6. Owner approved canon and GROUNDWORK runtime promotion — complete for this package.
7. Registry／manifest／persona／Codex visibility and repo-native regression gates — required before merge and recorded by the implementing task, not by this art index alone.
8. Real-device, moderated first-session, private-blind, legal／privacy／store-copy and explicit Owner launch approval — remain separate launch gates.

## Compatibility fields and Expedition boundary

- The five registry records carry the existing `radar` shape because the current Codex renders that compatibility surface and emotional Standoff reads its `emotion` axis when deriving stability／resonance. These values are not Companion Growth XP, readiness, a permanent-stage gate, rarity, a combat class or a PvP ranking.
- None of the five has an entry in `companionAdventureProfiles.js`. Expedition therefore fails closed in both `canLaunchExpedition()` and `createExpeditionSession()` even if a QA／veteran state explicitly unlocks one of them; this promotion does not open the prototype HP／ATK／loot path for the five seats.
- Adding any future adventure profile requires its own Owner-approved Expedition／Core contract and cannot be inferred from registry `radar`, faction, runtime readiness or Codex visibility.

## Runtime promotion boundary

This package authorizes the selected five catalogs and portraits to be promoted into distinct runtime roots and registered as initially locked companions. It does **not** authorize a new save schema, fresh-save auto-unlock, Initial Bond roster changes, PvP, G4 stage advance, evolved forms, new power-stat progression／combat-class use, loot, rewards, dependency／backend work or a launch-ready claim. Persona differences remain downstream of the D2 safety terminal.
