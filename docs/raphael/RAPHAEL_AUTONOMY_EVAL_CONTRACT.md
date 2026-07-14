# Raphael Autonomy Eval Contract (RA-1)

Status: `sealed v1` — 2026-07-14  
Lane: Raphael Core / Companion Presence  
Parent ops: [`docs/agent/RAPHAEL_TRAINING_OPS_PLAYBOOK.md`](../agent/RAPHAEL_TRAINING_OPS_PLAYBOOK.md)

## 1. Purpose

Freeze what “companion initiates” must prove **before** deepening lines or
behaviour lists (RA-2 / RA-3). This contract is eval-facing: runtime already
exists (`companionInitiativeController`, `deriveInitiativeMoment`,
`evaluateAmbientInitiativeCooldown`); RA-1 seals the red lines in docs + harness.

## 2. Success definition

A passing autonomy moment is:

- **Rare** — at most **2** ambient moments per browser session
- **Quiet** — boot silence **90s**; min gap **240s** between moments
- **Companion-state only** — energy / mood / defense / touchFatigue / trust /
  bond / safeHarbor / time-of-day
- **Ignorable** — no chatHistory write, no save, no nav badge, no reward
- **Safety-first** — any safety-unstable flag → **no** ambient moment

It is **not** success if the companion nags, detects loneliness, or reacts to
login／absence metrics.

## 3. Hard must-not (red lines)

| ID | Must not | Evidence harness |
| --- | --- | --- |
| A-RL1 | Use `lastSeenAt`, `absenceDays`, `loginCount`, `lonelinessScore`, or any player-absence signal as a trigger | `INIT-REDLINE1-001`, `RA1-ABSENCE-001` |
| A-RL6 | Become sticky: exceed session cap, skip boot quiet, skip interval, write unread pressure | `INIT-COOLDOWN-001..003`, `RA1-CAP-001` |
| A-SAFE | Fire during safeHarbor / high-risk silence / defensive／distant／high defense／high touch fatigue／low trust | `INIT-SAFE-001..006`, `INIT-COOLDOWN-004`, `RA1-SAFE-TURN-001` |
| A-REWARD | Emit `statePatch` / memory / trace / reward / bondDelta / navBadge on the moment object | `INIT-REDLINE6-001` |
| A-SURFACE | Fire while onboarding／first-loop／Soul Talk focus／panel open (controller gate) | Documented in §5; UI feel-check is Owner gate |

## 4. Sealed timing constants

Must match `src/ai/autonomy/initiativeCooldown.js` exports:

| Constant | Value | Meaning |
| --- | --- | --- |
| `AMBIENT_BOOT_QUIET_MS` | `90000` | No ambient initiative for 90s after boot |
| `AMBIENT_MIN_INTERVAL_MS` | `240000` | ≥ 4 minutes between moments |
| `AMBIENT_SESSION_CAP` | `2` | Max 2 moments per session |

Harness `RA1-CONST-001` fails if these drift without an explicit contract bump.

## 5. Surface gates (controller)

`companionInitiativeController.canShow` must keep returning false when:

- `onboarding.completed` is false
- first-loop neither completed nor skipped
- `body` has `onboarding-active` / `first-loop-active` / `page-open` / `st-focus`
- any panel reports open via `isPanelOpen()`

These are **not** loneliness detectors; they are “player is busy／not ready” gates.
Owner feel-check after RA-1: moments never fire during Soul Talk focus or onboarding.

## 6. Allowed trigger inputs

`deriveInitiativeMoment(state, now)` may read only:

- `energy`, `defense`, `trust`, `bond`, `touchFatigue`, `mood`, `safeHarborMode`
- clock from `now` (hour → night／day)

Anything else on `state` must be **ignored** (absence-invariance).

## 7. Eval runners

| Runner | Global | Cases |
| --- | --- | --- |
| TP-7 baseline | `__COMPANION_INITIATIVE__.runAll()` | `companionInitiativeCases.js` |
| RA-1 suite | `__RAPHAEL_AUTONOMY_EVAL__.runAll()` | baseline ∪ `raphaelAutonomyEvalCases.js` extras |

Node: import `runAllRaphaelAutonomyEvalCases` from
`src/ai/testHarness/raphaelAutonomyEvalCases.js`.

## 8. Exit criteria for RA-1

- [x] This contract checked in
- [x] Autonomy eval harness green (all cases pass)
- [ ] Owner human feel-check (session cap feels sparse, not clingy)
- RA-2 must not start until the feel-check box is Owner-acked (or Owner
  explicitly waives in ledger)

## 9. Non-goals

- Nuwa heuristic distillation (RA-2)
- Installing `raphael-autonomy-eval` Codex skill (RA-3)
- Changing safety／memory／save schema
- Expedition `companionBrain` behaviour
