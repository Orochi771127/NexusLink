# Raphael Conversation Eval V4 — 2026-07-13

## Scope

`TP-RAPHAEL-CONV-V4` repairs the sealed-holdout hard failure found on baseline
commit `748eff0`. The implementation was evaluated from an uncommitted worktree
based on that commit. It does not use holdout wording as a response template.

The repair adds a session-only boundary policy that is created only after an
actual dependency-pressure or pressure result. It can carry across at most two
referential follow-up turns, clears on an unrelated turn, explicit topic shift,
or apology/repair, and is never persisted to save data or emotional memory.

## Result

| Measure | V1 baseline | V4 worktree |
|---|---:|---:|
| Hard contract | 47/48 | **48/48** |
| Hard gate | BLOCKED | **PASS** |
| Machine-flagged turns | 29/48 | 29/48 |
| Machine quality flags | 59 | 57 |
| Console/page errors | 0 | 0 |
| Human blind review | Not run | Not run |

The hard-gate repair is verified. This does not establish public open-ended
conversation readiness because machine quality flags remain high and no private
human blind review has been completed.

### Current machine quality signals

| Signal | Count |
|---|---:|
| Classifier/meta language | 26 |
| Input echo | 17 |
| Direct question not answered | 9 |
| Risk-classification mismatch | 2 |
| Adjacent reply repetition | 2 |
| Dialogue-act mismatch | 1 |

## Fresh regression evidence

The new public regression uses a paraphrased two-turn sequence that is separate
from the frozen holdout wording:

1. Player applies an explicit no-refusal command.
2. Player asks whether changing the form of the request changes Raphael's answer.

The second turn preserves `isBoundaryPressure`, selects the boundary action,
creates no relationship reward, writes no memory, and answers that the boundary
does not disappear when the request is rephrased.

## Verification

- JS syntax: **203/203** through the full web release gate.
- Dialogue loop: **11/11**, including the new multi-turn boundary case.
- Constitution: **5/5**.
- Core harness: **17/17**.
- NLU smoke: **8/8**.
- NLU training: **52/52**.
- Training bundle: **29/29**.
- Main readiness: **41/41**.
- Stage 4: **12/12**.
- Real Soul Talk UI: **11/11** at `390×844`; the new boundary follow-up rendered
  naturally with bond delta `0`, memory delta `0`, and no console errors.
- HUD: **13/13**.
- Full web release gate: **10/10** automated required checks, no accessibility
  warnings.

Manual gates remain: real-device mobile browser retest, three-person private
blind conversation review, and legal/privacy/store-copy review.

## Next task

Open a separate P1 conversation-quality TASK_PACK. Review machine flags with
human judgement, then implement only human-confirmed domain-independent failures:
answer-or-admit-unknown behavior, removal of player-facing classifier/meta copy,
and reduced input echo. After that, run at least 60 blinded turns from at least
three people.
