# ADR-003: Memory Single Truth Projection

- **Status:** Accepted (projection-only Phase 1)
- **Date:** 2026-07-24
- **Pack:** Task Pack 3 — Memory Single Truth Projection

## Context

Runtime memory is split across `emotionalMemories`, `memories`, `habitatTraces`, and `companionAnchors`. Soul Talk could make concrete “I remember X” claims from anchors that never appeared on the Memory page, fracturing player trust.

## Decision

1. Keep separate storage arrays (no schema merge, no STORAGE_KEY bump).
2. Introduce a player-facing **MemoryViewModel** (`src/ui/memoryProjection.js`) that projects all claimable evidence into one timeline.
3. Player-visible anchors (non-empty, non-risky `detail`) appear on the Memory page.
4. Concrete recall and soft “you mentioned…” weave lines only use player-visible anchors / active emotional memories.
5. `released` / `archived` emotional memories remain visible as archive rows (`claimable: false`) — release is not deletion.

## Consequences

- Memory page evidence strip includes anchors.
- Risk: list density rises; still capped by `MEMORY_PROJECTION_LIMIT`.
- Soft allusions that previously used hidden risky/empty anchors no longer fire (correct).

## Rollback

Revert `memoryProjection.js` wiring in `pageRouter.js` and visibility filters in `companionAnchorPolicy.js`.

## Non-goals

No RAG, no transcript-as-memory, no irreversible array deletes, no Master Canon rewrite.
