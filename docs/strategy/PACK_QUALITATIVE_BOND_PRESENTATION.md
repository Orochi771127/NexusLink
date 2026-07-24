# Qualitative Bond Presentation (Product Pack)

- **Status:** Phase 1 shipped (UI presentation only)
- **Owner authorized:** 2026-07-25 (four tension packs sequence)
- **Non-goal:** No `state.bond` / schema / milestone threshold changes

## Objective

Players should feel relationship *depth*, not chase a score. Engines keep numeric
`bond` / `trust`; all player-facing surfaces show **stage language**.

## Surface map

| Surface | Change |
|---|---|
| Character HUD `#bond-value` / `#trust-value` | Stage label + bar; no integer |
| Care page trust meter | Qualitative label |
| Growth chronicle locked rows | Theme + presence copy; no「達 N／目前 N」 |
| Explore result chips | 「羈絆更深了一點」etc. |
| Expedition settlement facts | Qualitative relation line |

## Stage bands

Aligned to existing `BOND_MILESTONES` thresholds: 12 / 25 / 45 / 70 / 90.

Helper: `src/ui/bondPresentation.js`

## Acceptance

`node docs/qa/qualitative-bond-presentation-cases.mjs`

## Out of scope (later packs)

- Non-confrontation chapter growth path
- Initiative budget naming / contract
- Expedition loot farming semantics rewrite
