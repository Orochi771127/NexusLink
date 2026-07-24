# Pack 2 — Relationship Authority Migration Plan

- **Status:** Phase 1 implemented; Phases 2–3 Proposed / not yet approved for schema bump
- **Last updated:** 2026-07-24
- **ADR:** `docs/architecture/ADR-002-MULTI_COMPANION_RELATIONSHIP_AUTHORITY.md`

## Objective

Invitation / bond / trust judgments for companion X always use X’s relationship authority.

## Why it matters

Without this, Greyshade affinity can make Blazetail (or any chapter target) accept a resonance invite.

## Phase 1 — Reader + snapshot fix (DONE in this pack)

| Change | File |
|---|---|
| `resolveRelationshipForCompanion`, `buildRelationshipChapterMarkSnapshot` | `src/state/companionStateSchema.js` |
| Invite reads target relationship | `src/engine/resonanceInviteEngine.js` |
| Meet / decline snapshots use target | `src/ui/mapController.js` |
| Authority harness | `docs/qa/resonance-invite-authority-cases.mjs` |

**Save risk:** None (no version bump, no STORAGE_KEY change).

**Acceptance:**
- High active (A) + low target (B) ⇒ invite for B declines `early`.
- Cultivating B’s byId until delta ≥ threshold ⇒ willing.
- Legacy fixtures without `companionStates` still pass dual-read.

## Phase 2 — Ensure byId rows + dual-write telemetry (SHIPPED with Pack 4)

- On chapter meet, `ensureCompanionRelationshipInDraft` creates baseline `byId[target]` (never copies active).
- Dual-read telemetry flag deferred (optional).
- Files: `companionStateSchema.js`, `mapController.js` meet path.

## Phase 3 — Optional schema bump (Owner decision)

- Propose `COMPANION_STATE_SCHEMA_VERSION = 2` only if normalize must rewrite polluted marks.
- Prefer leaving top-level mirror forever unless Owner deprecates it.
- Required human decisions:
  1. Move invite fields only (done) vs migrate all 14 mirror writers next.
  2. Keep top-level mirror permanently vs deprecate.

## Rollback

Phase 1: git revert the three runtime files. No save repair needed.

## Explicit non-goals

Pack 3 memory projection, Pack 4 encounter resolver, medical terminology, asset/BGM changes.
