# Pack 2 Phase 3 — Top-level Bond Mirror Decision

- **Status:** Owner decision recorded (2026-07-24) — **Keep mirror; full deprecation deferred**
- **Authority:** Does not override Master Canon; updates ADR-002 Phase 3 stance
- **Related:** `docs/architecture/ADR-002-MULTI_COMPANION_RELATIONSHIP_AUTHORITY.md`, `docs/strategy/PACK2_RELATIONSHIP_AUTHORITY_MIGRATION.md`

## Decision (recommended & recorded)

**Keep** the top-level `bond` / `trust` / mood / energy / defense / touch fields as an **active-companion compatibility mirror** for the foreseeable future.

Do **not** schedule a schema bump or STORAGE_KEY change solely to delete the mirror.

## Why this is the right default

1. **P0 identity bug is already fixed** (Phase 1): invite / chapter-mark readers use per-`companionId` authority.
2. **Phase 2 shipped** (with Pack 4): meet ensures `byId[target]` baseline without copying active affinity.
3. Top-level mirror still powers HUD, battle, explore, touch, expedition, and many AI helpers. Removing it is a large writer migration, not a one-line delete.
4. Risk/cost of full deprecation ≫ benefit while the game still thinks in “play the active companion.”

## What “keep” means in practice

| Layer | Rule |
|---|---|
| Judging companion X (invite, meet snapshot, non-active affinity) | Must use `resolveRelationshipForCompanion` / `byId[X]` |
| Playing the active companion (HUD, standoff, explore patches) | May read/write top-level mirror; archive/hydrate on switch |
| New features | Must not invent a third store; prefer byId for multi-companion truth |

## Optional follow-up (cheap, not required to open immediately)

**Pack 2.5 — Mirror misuse guardrails** — **SHIPPED 2026-07-25**

- Documented in ADR-002 Pack 2.5 section.
- Runtime/static harness: `docs/qa/mirror-misuse-guardrail-cases.mjs`
- Helpers: `src/state/relationshipAuthorityGuard.js` (`resolveRelationshipForJudgment`, diagnose helper)
- No writer rewrite; no schema bump.

## Full deprecation (deferred indefinitely)

Only reopen when **all** are true:

1. Owner schedules a HUD / relationship-presentation rewrite that already touches every mirror reader.
2. A dual-write period is budgeted (write byId + mirror, then read byId only, then drop mirror).
3. Legacy fixtures and save normalize path are explicitly updated (`COMPANION_STATE_SCHEMA_VERSION` bump if needed).

Until then, “Phase 3 deprecate” stays **Proposed / not authorized**.

## Next after Repair Sequence Packs 0–5 Phase 1

Repair Sequence Task Packs 0–5 Phase 1 are **shipped on `main`**. Suggested next work (pick one):

1. **Human:** Pack 1 §J five-player playtest → mark VERIFIED or open copy fixes.
2. **Optional engineering:** ~~Pack 2.5 mirror misuse guardrails~~ → **shipped**.
3. **Product backlog (from tension review, not yet packed):** initiative budget, expedition loot semantics, qualitative bond presentation, non-confrontation growth routes — each needs its own Task Pack + Owner approval before coding.

## Codebase memory note

Project: `C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink`  
Record: Keep top-level bond mirror; Pack 2 Phase 3 deprecate deferred; next = playtest or Pack 2.5 or new tension packs.
