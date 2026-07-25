# Expedition Loot Semantics (Product Pack D)

- **Status:** Phase 1 shipped
- **Owner authorized:** 2026-07-25

## Objective

Keep shard IDs + craft math, but rewrite player-facing language so expedition
returns read as **shared light-traces**, not farming loot / power currency.

## Changes

| Layer | Change |
|---|---|
| `lootTables` labels | 碎晶 → 微光（ids unchanged） |
| Settlement / journal / summarize | Qualitative amounts（幾縷／一些／不少）+「不是戰利品」 |
| Craft recipes / missing copy | 縷／微光語意 |
| Companion collect intents | 「靠近微光痕跡」 |
| Explore vault strip | Count kept; label `…微光痕跡` |

Helper: `src/expedition/lootPresentation.js`

## Acceptance

`node docs/qa/expedition-loot-semantics-cases.mjs`

## Out of scope

- Vault schema bump / renaming save keys
- Changing drop rates or craft costs
- Deleting expedition combat
