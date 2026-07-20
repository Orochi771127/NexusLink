# Raphael Standoff Eval Contract (RS-1)

Status: `sealed v1` — 2026-07-14（RS-2 Nuwa intent heuristics landed 2026-07-20; engine numbers unchanged）
Lane: Raphael Core / Emotional Standoff
Parent ops: [`docs/agent/RAPHAEL_TRAINING_OPS_PLAYBOOK.md`](../agent/RAPHAEL_TRAINING_OPS_PLAYBOOK.md)

> **RS-2 note:** Nuwa `standoffHeuristics`（bundle v0.8）是 advisory-only 蒸餾，
> 經 `getNuwaStandoffAdvisory()` 讀取；不得寫入戰鬥數值或覆寫本契約詞彙。
> Harness：`RS2-NUWA-001..003`、`RS2-ALIGN-001`。

## 1. Purpose

Freeze what “rift standoff success” means **before** RS-2 advisory heuristics
or RS-3 eval skills. Runtime already exists in
[`src/engine/battleEngine.js`](../../src/engine/battleEngine.js) and
[`src/ui/battleController.js`](../../src/ui/battleController.js).

**Success is emotional rhythm and mutual care — not DPS, combos, or HP bars.**

## 2. Success definition

A sealed standoff is successful when:

1. **Readable telegraph** — on the player turn, the rift shows next intent
   (`surge` / `gather` / `lull`) with a counter-hint via `getIntentTelegraph`
2. **Four non-punishing endings** — every path is a valid care outcome:
   - `stabilized` — noise cleared
   - `recovered` — memory shards goal met
   - `retreated` — leaving is affirmed (“懂得離開…”)
   - `overwhelmed_but_safe` — overload but companion escorts you out
3. **Fatigue is real cost** — actions raise `fatigue`; at/near `MAX_FATIGUE`
   rest is suggested; fatigue may soft-write habitat energy — never a
   “you died / fail the run” ending
4. **Retreat is always available** — `retreat` is a first-class action in
   `STANDOFF_ACTIONS`; choosing it must not reduce to shame language

It is **not** success if the system reads like Pokémon／Souls HP combat,
combo ladders, or kill-to-loot.

## 3. Hard must-not

| ID | Must not | Evidence |
| --- | --- | --- |
| S-DPS | Frame actions as damage／HP／kill／loot | `RS1-ACTIONS-001`, `RS1-OUTCOME-LANG-001` |
| S-FORCE | Force a win; make retreat punish bond／trust harshly | `RS1-RETREAT-001` (copy + patch shape) |
| S-TELE | Hide next intent on player turn when session has `nextIntent` | `RS1-TELEGRAPH-001` |
| S-END | Invent a fifth “game over / faint forever” outcome | `RS1-OUTCOMES-001` |
| S-SKILL | Fill gaps by installing Godot／AAA combat-design skills | ops playbook routing |

## 4. Sealed vocabulary (engine)

| Symbol | Meaning |
| --- | --- |
| `STANDOFF_ACTIONS` | `resonance`, `barrier`, `pulse`, `retreat` only |
| Outcomes | `stabilized`, `recovered`, `retreated`, `overwhelmed_but_safe` |
| Phases | `turbulent`, `contested`, `settling` |
| Intents | `surge`, `gather`, `lull` |
| `SHARD_GOAL` | `3` memory shards for early gentle close |
| `MAX_FATIGUE` | `6` |

Numeric values stay owned by `battleEngine.js`; RS-1 freezes **names and
philosophy**, not balance retunes (RS-2 must not write combat stats from
advisory bundles).

## 5. Eval runners

| Runner | Global / import | Scope |
| --- | --- | --- |
| RS-1 suite | `__RAPHAEL_STANDOFF_EVAL__.runAll()` | `raphaelStandoffEvalCases.js` |
| Node | `runAllRaphaelStandoffEvalCases()` | same |

Browser install: with `?raphaelSmoke=1` (wired from `raphaelCore.js`).

## 6. Exit criteria for RS-1

- [x] This contract checked in
- [x] Standoff eval harness green
- [ ] Owner confirms “stabilize rift ≠ DPS” success definition (human gate)
- RS-2 must not start until Owner acks (or waives in ledger)

## 7. Non-goals

- Changing battle numbers or enemy roster (separate EXPERIENCE packs)
- Nuwa autonomy heuristics (RA-2)
- Expedition `combatResolver` (Lane D)
- Installing external combat skills
