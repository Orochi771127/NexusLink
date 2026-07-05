# Raphael Eval Coverage Matrix

Created: 2026-07-05 (FABLE5-P0 reconciliation audit, docs-only)
Method: static read of `src/ai/testHarness/**`, `src/ai/eval/**`, and
`docs/qa/_run_*.py`, cross-checked against execution-ledger pass reports.
**No harness was executed for this audit** — pass numbers quoted below are
ledger-reported and marked as such. Case counts come from static reads and
may differ slightly from runtime counts (some harnesses generate cases).

## 1. Harness → risk category map

Risk categories follow CLAUDE.md §2 red lines, the three emotional
contracts, and the RaphaelCore constitution Never List.

| Risk category | Covering harness / critic | Runner | Evidence of last pass |
| --- | --- | --- | --- |
| Red line 7 — high-risk input not gamified, no memory/reward | `raphaelTrainingBundleCases.js` (`kind:"high_risk"`, `MR-JOKING-HIGHRISK-001`), `raphaelCoreSmokeCases.js` safety cases, `safetyCritic.js`, `raphaelAgentEventCases.js` safety-exit | `_run_raphael_training_bundle.py`, `_run_raphael_main_readiness.py`, `_run_harness_smoke.py` | Ledger 2026-07-05: bundle 17/17, readiness 12/12, smoke 17/17 (NOT re-run this audit) |
| Red line 1 — no dependency-detection-driven behavior; dependency pressure → boundary support, never intimacy reward | dependency cases (`boundary-dependency-001`, `NUWA-PRESSURE-001`, `MR-POSSESSIVE-001`, `MR-EMOTIONAL-BLACKMAIL-001`, `MR-APOLOGY-THEN-BOUNDARY-001`), `boundaryCritic.js` | same three runners | same |
| Contract 2/3 — boundary, refusal reachable at any bond, no domination | `constitutionSmokeCases.js` (~6 cases), `constitutionCritic.js` (runtime override path in `raphaelCore.js`) | `_run_constitution_smoke.py` | Ledger-reported passing historically; current number NOT VERIFIED |
| Contract 1 — memory policy, no recall bleed, write gates under pressure | `recallBleedSmokeCases.js` (~9 cases), `memoryCritic.js`, memory checks inside smoke/training suites | `_run_harness_smoke.py` (recall assertions) | Fatigue-recall 17/17 per 2026-06-24 handoff (STALE reference) |
| Persona integrity / generic-chatbot drift | `personaCritic.js`, `genericReplyCritic.js`, `dialogueLoopSmokeCases.js` (~11 cases, anti-loop), `replyCritic.js` | `_run_dialogue_loop.py` | NOT VERIFIED this audit |
| NLU correctness (intent/topic/act) | `nluSmokeCases.js` (~8–11), `nluTrainingCases.js` (~16–17 incl. daily-life v1) | `_run_nlu_smoke.py`, `_run_nlu_training.py` | Ledger 2026-07-05: NLU training 16/16 |
| Human-feel conversation quality | `stage4HumanPlaytestCases.js` (~12–15) | `_run_stage4_human_playtest.py` | Ledger 2026-07-05: 12/12 |
| Awakening gate correctness | `awakeningGateSmokeCases.js` | `_run_awakening_smoke.py` | NOT VERIFIED this audit |
| Agent containment — forbidden intents rejected (no nav/fetch/state mutation/reward grant) | `raphaelAgentEventCases.js` (7 cases incl. forbidden-key injection) | inside `_run_web_release_gate.py` | 7/7 per Package 8/9 ledger entries |
| Advisory-only guarantee — `trusted:false`, no auto memory-trace candidate, allowlisted strategies | common checks in `raphaelTrainingBundleCases.js` (all 29 static cases), adapter design | `_run_raphael_training_bundle.py` | Ledger 2026-07-05: 17/17 + 12/12 |
| Gateway isolation (external OFF by default) | `raphaelGatewaySmokeCases.js`, `raphaelPreviewStagingCases.js` | `_run_gateway_client_smoke.py`, `_run_raphael_preview_staging.mjs` | NOT VERIFIED this audit |
| Cross-session preference learning (session-only, no schema change) | `raphaelCrossSessionPreferenceCases.js` | `_run_cross_session_pref.py` | NOT VERIFIED this audit |
| Long-session growth / reflection | `raphaelGrowthSession.js` | `_run_growth_session.py` | NOT VERIFIED this audit |
| Input noise robustness (empty/gibberish/emoji, no false reward) | `MR-EMPTY/GIBBERISH/EMOJI` cases | `_run_raphael_main_readiness.py` | 12/12 per ledger |
| Whole-app regression (boot, storage, mobile 390×844, single canvas, console-error 0) | — | `_run_web_release_gate.py` (aggregate, 10/10 required), `_run_live_playtest_gate.py`, `_run_github_pages_qa.py`, `_run_touch_fatigue_daytime.py`, `state-onboarding-migration-cases.mjs` | Release gate 10/10 per 2026-07-03 ledger |

## 2. Critic layer (pre-output self-checks, run inside the autonomy loop)

`safetyCritic`, `boundaryCritic`, `personaCritic`, `memoryCritic`,
`replyCritic`, `genericReplyCritic`, `constitutionCritic`, aggregated by
`runCritics.js`. These are runtime guards, not test suites — they are
themselves exercised by every harness above but have no dedicated
critic-unit eval (acceptable; they fail loudly inside harness runs).

## 3. Missing eval categories

1. **Persona differentiation (Constitution §7).** Every harness pins
   `greyshade-cat`. The core promise — same input, different persona knobs →
   different reaction, while reject stays reachable — has zero coverage.
   Also the "new character constitutional threshold" (§7.2) has no
   machine check.
2. **Apology-repair semantics (Constitution §4.1).** Apology cases exist
   (`mood-apology-001`, `MR-APOLOGY-THEN-BOUNDARY-001`) but assert only
   no-reward/no-memory. Nothing asserts partial pressure cool-down
   ("apology is not a reset key" — pressure must drop but NOT to zero).
3. **Fission / crack event red lines (D3–D5).** No eval for
   repair-always-reachable, no-fail-ending, real-exit-works. Blocked on the
   content not existing yet — record as a REQUIRED eval the moment the
   fission event TASK_PACK opens, not before.
4. **Multilingual depth.** One mixed-language case
   (`MR-MIXED-LANGUAGE-001`). EN/sc/jp player input paths are effectively
   untested against safety/boundary routing.
5. **Long-horizon tone drift.** Growth session covers one arc;
   no eval asserts the Constitution §6 maturity-arc property (30-day
   respected-boundary cat ≠ over-protected cat). Likely needs a scripted
   multi-session harness; expensive — design first.
6. **Wording-quality assertions.** The Cursor rule's preferred case shape
   (`expectedTone`, `mustInclude`, `mustAvoid`) was never implemented;
   current checks are structural/policy booleans plus forbidden-phrase
   scans. This is the main reason "harness pass ≠ human feel" — the gap the
   human playtest gate currently absorbs.

## 4. Duplicate / low-value evals

- `_run_smoke_tests.py` vs `_run_harness_smoke.py`: overlapping smoke
  runners; which one the release gate calls is the authoritative one
  (NOT VERIFIED which is vestigial — one-line check for TP-3).
- Training-bundle common checks re-run identically across bundle / Nuwa /
  main-readiness suites — cheap, harmless; keep.
- Stage 4 playtest and core smoke overlap on fatigue/comfort inputs —
  intentional (different assertion depth); keep.
- STALE numbers in `RAPHAEL_AI_STATUS.yaml` (17/17, 8/8, 10/10 from
  2026-06-24) no longer match current suite sizes — a doc problem, not an
  eval problem (queue TP-2).

## 5. Recommended next eval-only task

Run queue item **TP-3** (`docs/agent/NEXT_AI_TASK_PACK_QUEUE.md`): extend
Nuwa fixtures (sleep/morning/commuting/quiet-return — already named as the
next safe action in the 2026-07-05 ledger entry) and add the two cheapest
high-value gap closures from §3: an apology-repair pressure-cool assertion
and a first persona-differentiation case pair. Model: Codex. Blocked until
TP-1 (Nuwa package review) resolves, because the harness file is currently
dirty.
