# Pack 2 — Relationship Authority Migration Plan

- **Status:** Phase 1–2 + Pack 2.5 guardrails shipped; Phase 3 keep-mirror (deprecate deferred)
- **Last updated:** 2026-07-25
- **ADR:** `docs/architecture/ADR-002-MULTI_COMPANION_RELATIONSHIP_AUTHORITY.md`
- **Phase 3 decision:** `docs/strategy/PACK2_PHASE3_MIRROR_DECISION.md`

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

## Pack 2.5 — Mirror misuse guardrails (SHIPPED 2026-07-25)

- `src/state/relationshipAuthorityGuard.js`
- `docs/qa/mirror-misuse-guardrail-cases.mjs`
- Invite path uses `resolveRelationshipForJudgment`
- No schema bump

See ADR-002 Pack 2.5 section.

## Phase 3 — Top-level mirror (DECIDED 2026-07-24)

- **Decision:** Keep top-level bond/trust/… mirror as active compatibility layer.
- **Full deprecation:** Deferred indefinitely (needs HUD/writer mega-migration + dual-write).
- **Pack 2.5:** Shipped (static/runtime guardrails); no longer “optional pending”.
- Details: `docs/strategy/PACK2_PHASE3_MIRROR_DECISION.md`

### Previous Phase 3 options (superseded)

- ~~Propose `COMPANION_STATE_SCHEMA_VERSION = 2` only if normalize must rewrite polluted marks.~~ Not required for “keep.”
- ~~Deprecate top-level mirror now.~~ Rejected for now.

## Rollback

Phase 1: git revert the three runtime files. No save repair needed.

## Explicit non-goals

Pack 3 memory projection, Pack 4 encounter resolver, medical terminology, asset/BGM changes.
