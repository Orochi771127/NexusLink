# Nexus Link Repair Sequence

- **Status:** Proposed Execution Roadmap / Not Yet Canon
- **Source:** Product Tension + First Session Motivation reviews (2026-07-24)
- **Purpose:** Convert review findings into executable Task Packs
- **Authority:** Does not authorize implementation beyond packs explicitly approved by Owner
- **Last updated:** 2026-07-24

---

## Recommended sequence

| Order | Pack | Mode |
|---|---|---|
| 0 | BGM Asset Audit and Integration | **Authorized now** |
| 1 | First Session Motivation Repair | **Implemented + VERIFIED_STRUCTURED** (human 5-stranger cohort still pre-launch) |
| 2 | Multi-Companion Relationship State Authority | **Phase 1–2 + Pack 2.5 guardrails shipped**; Phase 3 keep-mirror |
| 3 | Memory Single Truth Projection | **Phase 1 shipped** (projection + recall gate); no schema merge |
| 4 | Dynamic Chapter Encounter Resolver | **Phase 1 shipped** (resolver + fallback + invite resolvedId) |
| 5 | Terminology and UI Language Alignment | **Phase 1 shipped** (player-facing glossary + scan) |
| A | Qualitative Bond Presentation | **Phase 1 shipped** (UI stages; engines keep numbers) |
| B | Non-confrontation Growth Route | **Authorized next** |
| C | Initiative Budget | Authorized after B |
| D | Expedition Loot Semantics | Authorized after C |

---

## TASK PACK 0 — BGM Asset Audit and Integration

### Objective

Wire every existing BGM asset already in the repository to the correct title, companion-selection, habitat/home, and map/region scenes without inventing missing tracks or editing audio files.

### Why it matters

Playtests already noticed atmosphere positively. Scene-correct music is a low-risk way to reinforce place identity before heavier systems land.

### Likely files

- `src/data/bgmRegistry.js`
- `src/audio/audioManager.js` (extend; do not fork a second mixer)
- `src/ui/bgmController.js`
- `src/app.js`, `src/ui/onboardingController.js`, `src/ui/companionSelectController.js`
- `docs/audio/BGM_ASSET_MAP.md`, `docs/qa/bgm-integration-cases.mjs`

### Groundwork risk

Prefer EventBus + controllers. Touch `assetManifest.js` only if necessary for path constants (non-save). Avoid `index.html` / `saveManager` / `normalizeState` unless proven unavoidable.

### State migration risk

None intended. Use existing `settings.volMaster` / `volBgm` / mute.

### Non-goals

No asset rename/convert, no SFX redesign, no Resonance Thread, no relationship/memory/chapter migrations, no commit/push in the authorizing chat unless Owner later asks.

### Acceptance criteria

See `docs/audio/BGM_ASSET_MAP.md` and `docs/qa/bgm-integration-cases.mjs`. Mapped scenes play the correct loop; unmapped assets are listed; iOS autoplay unlock documented; mute/volume immediate; no dual tracks.

### Rollback strategy

Disable `bgmController` wiring and fall back to single legacy track path in `AudioManager`.

### Required human decisions

- ~~Confirm companion-select track~~ → **Resolved 2026-07-24:** `bgm_linkara_lofi.mp3`.
- ~~Confirm Moonlake track~~ → **Resolved 2026-07-24 (corrected):** `bgm_ethereal_moon_lakefront.mp3` canonical; `bgm_lakefront.mp3` unmapped alternate.

---

## TASK PACK 1 — First Session Motivation Repair

### Objective

Make the first 12 minutes communicate loop, causality, and return anticipation without FOMO mechanics.

### Why it matters

P0-A: atmosphere works; players still do not know what to do next or why to return.

### Likely files

- `src/ui/gentleInvitationController.js` or new Resonance Thread module
- `src/ui/battleController.js` / standoff copy (`src/i18n/strings.js`)
- `src/ui/firstLoopController.js`, `src/ui/interactionHintController.js`
- habitat return / trace announcement copy

### Groundwork risk

Prefer EXPERIENCE-layer UI/copy. Avoid save-schema changes.

### State migration risk

Low if thread state is session-only or already-covered flags. Any new persisted thread field needs separate approval.

### Non-goals

No currency, daily tasks, red dots, new companions, battle-content expansion, absence penalties.

### Acceptance criteria

From `FIRST_SESSION_MOTIVATION_REVIEW.md` §J (5 new players, four questions).

### Shipped acceptance (2026-07-25)

- `VERIFIED_STRUCTURED`: harness + map browser gate + moderated walkthrough — `docs/qa/PACK1_SJ_ACCEPTANCE_EVIDENCE.md`
- Human 5-stranger cohort: score sheet `docs/qa/PACK1_SJ_HUMAN_SCORESHEET.md` (pre-launch; not blocking Pack 1 repair close)

### Rollback strategy

Feature-flag Resonance Thread off; restore prior hint/standoff copy.

### Required human decisions

- Exact Resonance Thread copy voice (Greyshade-first).
- Whether first Emotional Standoff is delayed vs guided.

---

## TASK PACK 2 — Multi-Companion Relationship State Authority（Plan only）

### Objective

ADR + migration plan so invitation/bond/trust authority is always per `companionId`.

### Why it matters

P0 identity risk: Companion A’s relationship must not unlock Companion B’s invitations.

### Likely files (plan targets)

- `src/state/companionStateSchema.js`, `store.js`
- `src/engine/resonanceInviteEngine.js` (or equivalent)
- Growth / chapter invite callers

### Groundwork risk

High — likely touches normalize/defaultState. Plan must isolate migration steps.

### State migration risk

**High.** Needs backfill from active mirror, veteran unlock lists, and dual-write period.

### Non-goals

Do not ship migration in the same pack as BGM or Motivation UI without explicit approval.

### Acceptance criteria (for the plan)

- Explicit field ownership table (per-companion vs global).
- Save version bump proposal.
- Failure cases for already-met companions and veteran saves.
- Rollback / dual-read strategy.

### Required human decisions

- ~~Which fields move first~~ → **Phase 1:** invite path uses bond/trust/blockedTouch from target `companionId` only.
- ~~Whether top-level bond remains a mirror~~ → **Keep forever for now** (active compatibility); deprecation deferred to Phase 3 Owner call.

See also: `docs/architecture/ADR-002-MULTI_COMPANION_RELATIONSHIP_AUTHORITY.md`, `docs/strategy/PACK2_RELATIONSHIP_AUTHORITY_MIGRATION.md`.

---

## TASK PACK 3 — Memory Single Truth Projection（Phase 1 shipped）

### Objective

Design MemoryViewModel so every concrete “I remember X” claim has player-visible evidence.

### Why it matters

`companionAnchors` can be recalled in Soul Talk while invisible on Memory page → trust fracture.

### Likely files (plan targets)

- `src/ui/pageRouter.js` Memory rendering
- `src/ai/dialogue/companionAnchorPolicy.js`
- possible `src/ui/memoryProjection.js`

### Groundwork risk

Medium if projection is UI-only; high if schema merges arrays.

### State migration risk

Prefer projection-only first (no array merge). Avoid irreversible deletes for `released`.

### Non-goals

No RAG, no transcript-as-runtime-memory, no automatic fine-tune.

### Acceptance criteria (for the plan)

- Projection rules for emotional / manual / anchors / traces / released.
- Copy rules for soft allusion vs concrete claim.

### Required human decisions

- Which anchors become player-visible vs tone-only.

### Shipped (2026-07-24)

- `src/ui/memoryProjection.js` + Memory page evidence strip includes anchors.
- Visible anchors = non-empty, non-risky detail; soft + concrete recall gated.
- Released emotional memories remain as archive rows (`claimable: false`).
- ADR: `docs/architecture/ADR-003-MEMORY_SINGLE_TRUTH_PROJECTION.md`
- Harness: `docs/qa/memory-projection-cases.mjs`

---

## TASK PACK 4 — Dynamic Chapter Encounter Resolver（Phase 1 shipped）

### Objective

Replace hardcoded chapter meet companions with slot + resolver + fallback event.

### Why it matters

First-bond trio selection will collide with chapter meet tables.

### Likely files (plan targets)

- `src/data/chapterRegistry.js`
- new `encounterResolver.js`
- chapter advancement callers (CH-5+)

### Groundwork risk

High once progression writes `chapterProgress` / unlocks.

### State migration risk

Medium–high for saves that already unlocked meet targets.

### Non-goals

No full chapter content rewrite in the plan pack.

### Acceptance criteria (for the plan)

- Idempotent resolution.
- Never re-run first-meeting for already-met IDs.
- Fallback event when candidate set empty.

### Required human decisions

- Candidate priority order per chapter.
- Fallback narrative tone.

### Shipped (2026-07-24)

- `src/engine/chapterEncounterResolver.js` — preferred → council pool → fallback.
- `mapController.maybeMeetChapterCompanion` wired; `resolvedCompanionId` / `fallbackEventId` on marks.
- Invite paths use `getChapterCompanionId(chapterNo, state)`.
- Pack 2 Phase 2: `ensureCompanionRelationshipInDraft` on meet.
- ADR: `docs/architecture/ADR-004-DYNAMIC_CHAPTER_ENCOUNTER_RESOLVER.md`
- Harness: `docs/qa/chapter-encounter-resolver-cases.mjs`

---

## TASK PACK 5 — Terminology and UI Language Alignment（Phase 1 shipped）

### Objective

Migrate clinical / overclaim language to psychologically safe product language across canon-facing docs and player UI strings.

### Why it matters

Legal / store / player trust: do not claim treatment outcomes.

### Likely files

- `docs/strategy/*` (only with Owner strategy approval)
- `src/i18n/strings.js`
- selected README / marketing blurbs

### Groundwork risk

Low for strings; high for Master Canon edits (needs strategy approval).

### State migration risk

None.

### Non-goals

Do not weaken safety hard gates while rewriting copy.

### Acceptance criteria

- Glossary table applied to player-facing strings.
- Search for banned clinical claims returns zero in UI strings (or documented exceptions).

### Required human decisions

- Whether Master Canon terminology updates ship with UI strings or later.

### Shipped (2026-07-24)

- Glossary: `docs/strategy/PACK5_TERMINOLOGY_GLOSSARY.md`
- Player-facing: companion `battleRole`／描述、圖鑑雷達「安撫」、heartspark role 摘要
- Master Canon 標題用語 **deferred**（需策略核准）
- Harness: `docs/qa/terminology-ui-language-cases.mjs`

---

## TASK PACK A — Qualitative Bond Presentation（Phase 1 shipped）

### Objective

Show relationship as stages / light-marks, not grind scores, while engines keep numeric `bond` / `trust`.

### Shipped (2026-07-25)

- Helper: `src/ui/bondPresentation.js`
- HUD / care / chronicle / explore chips / expedition settlement facts
- Doc: `docs/strategy/PACK_QUALITATIVE_BOND_PRESENTATION.md`
- Harness: `docs/qa/qualitative-bond-presentation-cases.mjs`

### Non-goals

No schema bump; no milestone threshold rewrite; no deleting bars.
