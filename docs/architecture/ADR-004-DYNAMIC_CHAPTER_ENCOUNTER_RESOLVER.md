# ADR-004: Dynamic Chapter Encounter Resolver

- **Status:** Accepted (Phase 1)
- **Date:** 2026-07-24
- **Pack:** Task Pack 4 — Dynamic Chapter Encounter Resolver

## Context

`chapterRegistry` hardcodes one `companionId` per chapter. First-bond trio includes `blazetail-kit` and `crystalfin-seahorse`, so chapters 5–6 can replay a “first meeting” for an already-unlocked companion.

## Decision

1. Chapters define an encounter **slot**; `chapterEncounterResolver` picks the first eligible unmet candidate (preferred → Heartspark Council pool).
2. Known companions = `activeCompanionId` ∪ `unlockedCompanionIds` ∪ `resonance.companions` with `metAt`/`joinedAt`.
3. Empty candidate set → meaningful **fallback** event (`chapter_N_quiet_echo`), recorded via `chapterMarks.fallbackEventId`.
4. Successful meet writes `chapterMarks.resolvedCompanionId` + `ensureCompanionRelationshipInDraft` baseline (Pack 2 Phase 2).
5. Invite / ask paths read `resolvedCompanionId` via `getChapterCompanionId(chapterNo, state)`.
6. Resolution is idempotent (`already_met` / `already_fallback`).

## Consequences

- Alternate meets use generic meet lines / willing fallback (no wrong-name dedicated copy).
- Chapter 7 (no preferred) always falls back when entered as an encounter chapter.

## Rollback

Revert resolver wiring in `mapController.js` and restore registry-only `getChapterCompanionId`.

## Non-goals

No full chapter narrative rewrite; no STORAGE_KEY bump.
