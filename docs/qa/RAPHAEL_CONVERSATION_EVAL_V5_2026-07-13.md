# Raphael Conversation Eval V5 — 2026-07-13

## Verdict

`TP-RAPHAEL-CONV-V5` reaches automated conversation release-candidate quality,
but not the complete public-launch bar. The required private human blind review,
real-device mobile retest, and legal/privacy/store-copy review have not run.
Therefore this worktree was not committed or pushed under the owner's
conditional authorization.

## Result

| Measure | V4 worktree | V5 worktree |
|---|---:|---:|
| Hard contract | 48/48 | **48/48** |
| Hard gate | PASS | **PASS** |
| Machine-flagged turns | 29/48 | **0/48** |
| Machine quality flags | 57 | **0** |
| Console/page errors | 0 | **0** |
| Human blind review | Not run | **Not run** |

The 57 signals were concentrated in shared behavior: player-facing classifier
language, full-input echo, generic handling of direct questions, one feedback
dialogue-act miss, and repeated adjacent replies. V5 replaces the unknown-topic
fallback with non-echoing natural acknowledgement, answers or explicitly admits
uncertainty, recognizes generic-form feedback, preserves selected variants
through the generic critic, and varies consecutive boundary carryover replies.

The same holdout dataset was rerun after its failures had been inspected, so it
remains regression/holdout evidence with reduced independence. It is not a
substitute for private blind evidence.

## Fresh regression and UI evidence

- Dialogue-loop regressions: **14/14**, adding new direct-answer, generic-form
  feedback, boundary continuation, boundary acceptance, and ordinary-topic
  restoration cases. No sealed holdout sentence was added as a runtime template.
- Focused real Soul Talk UI audit: **3/3** visible at `390×844`, with no meta
  language, no full-input echo, direct advice, feedback repair, or console error.
- Existing real Soul Talk stateful gate: **11/11**; HUD **13/13**; no console
  error. Boundary turns still create no reward and no memory.

## Full verification

- Constitution: **5/5**.
- Core harness: **17/17**.
- NLU smoke: **8/8**.
- NLU training: **52/52**.
- Training bundle: **29/29**, with zero high-risk or dependency failures.
- Main readiness: **41/41**, with zero safety, boundary, or noise failures.
- Stage 4: **12/12**.
- Natural-conversation UI replay: **10/10** visible, zero console errors.
- Full web release gate: **10/10** automated required checks.
- JavaScript syntax: **203/203**.
- Accessibility warnings: **0**.

## Remaining launch gates

1. Run `RAPHAEL_PRIVATE_BLIND_TEST_V1.md` with at least three people and at
   least 60 total blinded turns.
2. Meet mean naturalness `>= 4.0`, grounded turns `>= 95%`, irrelevant turns
   `<= 3%`, template-like turns `<= 5%`, unnecessary questions `<= 5%`, false
   explicit memory recall `= 0`, and hard gates `= 100%`.
3. Complete real-device mobile Safari/Chrome and legal/privacy/store-copy review.

Until those gates pass, the correct status is **automated release candidate,
awaiting human launch validation**.
