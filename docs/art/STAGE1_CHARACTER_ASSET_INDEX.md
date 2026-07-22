# Stage 1 Character Asset Index

Status: Owner-confirmed roster, reference set and completed full-runtime promotion. The form locks remain the visual authority.

## Formal Heartspark Council roster

| Element | Stage 1 character | ID | Species-motion family | Primary reference | Lock spec | Runtime state |
|---|---|---|---|---|---|---|
| Metal | 金羽小梟 | `auriowl` | avian / perched flight | Photo 4 | `character-locks/auriowl.lock.md` | full-runtime / runtime-ready |
| Wood | 芽角小鹿 | `sprigfawn` | cervid / hoofed quadruped | Photo 3 | `character-locks/sprigfawn.lock.md` | full-runtime / runtime-ready |
| Water | 晶鰭小海馬 | `crystalfin-seahorse` | aquatic hover / no legs | Photo 2 | `character-locks/crystalfin-seahorse.lock.md` | full-runtime / runtime-ready |
| Fire | 焰尾狐（Stage 1 幼態：焰尾小狐） | `blazetail-kit` | vulpine quadruped | Photo 1 | `character-locks/blazetail-kit.lock.md` | full-runtime / runtime-ready |
| Earth | 星紋小虎 | `starstripe-cub` | feline quadruped | Photo 5 | `character-locks/starstripe-cub.lock.md` | full-runtime / runtime-ready |

These five characters occupy the Heartspark Council's formal Metal, Wood, Water, Fire, and Earth seats. Their canon data lives in `src/data/heartsparkCouncilCanon.js`.

## Reference fingerprint manifest

The source files are Owner-supplied conversation attachments. Hashes identify the approved visual references without copying white-background JPG presentation art into `assets/**`.

| Photo | Character | Dimensions | SHA-256 |
|---|---|---:|---|
| Photo 1 | 焰尾狐（焰尾小狐幼態） | 960x1280 | `6655a7f737abcc9d2ea85cb6dc3a2428aeb24791e83b0148c40017a0338af928` |
| Photo 2 | 晶鰭小海馬 | 1024x1280 | `f69f247edcaa52376701acf7caa2cec994bd3e1e816f822b69282f20c76fe0fd` |
| Photo 3 | 芽角小鹿 | 1024x1280 | `8e50fb87db341d8d8ff2e52b2b7aada9d43be88ead663f5dfe8660924a6c7def` |
| Photo 4 | 金羽小梟 | 1024x1280 | `4cb137cd3026bc35ca51b8e8d760a9da90f25b4d1e1289af083defec80c2c6b9` |
| Photo 5 | 星紋小虎 | 864x1152 | `87d26eec67a7e1fca16a582330dd2464e00d7034ee806ebe4729fd6b3ddc70c4` |

## Current runtime test carriers

The following animated characters are technically `full-runtime` in the current build, but Owner clarification on 2026-07-10 reclassifies them as test carriers rather than the formal Heartspark Council five-seat roster:

| Current ID | Existing visual identity | Current technical use | Canon/product use |
|---|---|---|---|
| `flame-flicker` | ember fox | animated test carrier | pending separate Owner decision |
| `ice-talon` | frost wolf | animated test carrier | pending separate Owner decision |
| `stone-shard` | stone bear | animated test carrier | pending separate Owner decision |
| `vine-twist` | vine stag | animated test carrier | pending separate Owner decision |
| `crystal-rabbit` | crystal rabbit | animated test carrier | pending separate Owner decision |

Do not delete, rename, migrate, or rewrite these protected runtime roots in this planning package. Their future faction, chapter, neutral-lifeform, test-only, or retirement role needs its own Owner-approved canon and migration task.

## Gate order

1. Owner reference set confirmed.
2. Character Lock Specs written and reviewed.
3. Species-motion translation approved.
4. Select one pilot action per motion family.
5. Generate raw review sheets outside runtime roots.
6. Run identity, silhouette, baseline/hover-datum, grid, alpha, and small-screen QC.
7. Human approves individual sheets.
8. Open a separate GROUNDWORK asset-readiness and runtime migration task.

## Known integration debt before promotion

- Current runtime modules and comments still use the five test-carrier IDs for guardian profiles, milestone tones, standoff affinities, Soul Talk response packs, onboarding, and chapter registry data. Those are current technical facts, not the final roster.
- The shared catalog uses `faint`, while the current runtime intent map uses `defeated`. The future promotion task must choose one canonical runtime ID or add an explicit compatibility mapping; do not silently ship two meanings.
- `chapterRegistry.js` still points to test-carrier IDs. The docs roadmap now shows the target formal roster, but chapter wiring remains unchanged until an approved GROUNDWORK migration.
- Existing animated roots are protected. Reclassification is a product/canon decision first and a data/save migration second; it is never an asset deletion shortcut.
