# ADR-002: Multi-Companion Relationship State Authority

- **Status:** Accepted for Phase 1 (invite/snapshot readers); later phases Proposed
- **Date:** 2026-07-24
- **Owner:** Terence
- **Related:** `docs/audits/PRODUCT_TENSION_AND_STATE_AUTHORITY_REVIEW.md` §B, Repair Sequence Pack 2

## Context

G2 already persists per-companion relationship under `companionStates.byId[id].relationship`, with top-level `bond` / `trust` / … as an **active compatibility mirror**.

Chapter resonance invite (`evaluateResonanceInvite`) and meet/reask snapshots in `mapController` still read the **top-level mirror**. That lets Companion A’s affinity unlock Companion B’s invitation — a P0 identity failure.

## Decision

1. **Authority rule:** Any judgment about how companion X feels toward the player MUST read `companionStates.byId[X].relationship` (via `resolveRelationshipForCompanion`).
2. **Phase 1 (shipped with this ADR):** Fix invite evaluation + chapter-mark snapshots only. No `STORAGE_KEY` change. No `COMPANION_STATE_SCHEMA_VERSION` bump yet.
3. **Dual-read legacy:** If there is no canonical `companionStates` bag, or the target is the active companion with a byId miss, fall back to the top-level mirror (keeps pre-G2 fixtures and active UI writers working). If the target ≠ active and byId is missing, use **baseline defaults** — never steal the active companion’s bond/trust.
4. **Top-level mirror:** Remains for the foreseeable future as active UI/gameplay compatibility. Deprecation is a later Owner decision (Phase 3).

## Field ownership

| Field | Authority | Notes |
|---|---|---|
| `bond`, `trust`, `mood`, `energy`, `defense`, `touchFatigue`, blocked/touch flags, firstTouch/Hug, reactionPreview | **Per `companionId` in `byId[].relationship`** | Top-level = active mirror only |
| `companionStates.byId[].growth` | Per companion | Already correct |
| `unlockedCompanionIds`, `resonance.companions[id].metAt/joinedAt` | Global encounter / unlock lists | Not relationship affinity |
| `resonance.chapterMarks[n]` | Chapter affinity baseline for target companion | Snapshot MUST be taken from target relationship |
| `chapterProgress`, settings, playerProfile | Global | — |
| `emotionalMemories`, `companionAnchors`, habitatTraces | Separate memory tracks | Pack 3 projection |

## Consequences

- Invite willingness can no longer be polluted by the active companion’s mirror.
- Existing `_resonance_invite_cases.mjs` fixtures without `companionStates` still pass via dual-read.
- Polluted historical `chapterMarks` (written from the wrong mirror) may still be wrong until reask resets the snapshot; decline path now re-snapshots from the **target** relationship.
- Writers (battle/touch/explore) still patch the top-level mirror and archive into **active** byId — correct for “play the active companion”; incorrect only when judging a non-active invite target (now fixed on the read path).

## Non-goals (this ADR / Phase 1)

- Full writer migration off the top-level mirror
- Memory projection (Pack 3)
- Dynamic chapter encounter resolver (Pack 4)
- Medical/terminology sweep (Pack 5)

## Rollback

Revert `resolveRelationshipForCompanion` usage in `resonanceInviteEngine.js` and `mapController.js` snapshot helpers. No save migrate required for Phase 1.
