# Non-confrontation Chapter Growth (Product Pack B)

- **Status:** Phase 1 shipped
- **Owner authorized:** 2026-07-25 (four tension packs sequence)

## Objective

Players can complete a chapter trial through a calm **life-event** exploration
(reflective / peaceful / discovery) without entering standoff, while still
writing `chapter` growth evidence for readiness families.

## Rules (shared with standoff path)

1. Node chapter must equal `chapterProgress.current`
2. Current chapter must not already be in `completed`
3. Quiet journey copy only — no achievement framing / reward numbers

## Life-event extras

- Node `eventType` ∈ reflective | peaceful | discovery
- This explore must **not** roll an encounter
- On success: `advanceChapterProgress` + `sourceType: "chapter"` evidence

## Files

- `src/engine/chapterTrialEngine.js` — shared pure helpers
- `src/ui/mapController.js` — life-event write path
- `src/ui/battleController.js` — standoff path uses same helpers

## Acceptance

`node docs/qa/nonconfrontation-chapter-growth-cases.mjs`

## Out of scope

- Echo Sorting / G4 awaken changes
- Changing required family counts
- New save schema fields
- Removing the standoff trial path
