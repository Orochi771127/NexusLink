# Nuwa Advisory Package Review (TP-1A)

Date: 2026-07-05
Reviewer: Claude Fable 5 (fresh-context reviewer; did not author the package)
Package author: Codex (ledger Lane 3, 2026-07-05, interrupted by quota after reporting complete)
Classification: **KEEP_CANDIDATE** (high confidence)
Recommendation: **COMMIT** (human-executed), with one non-blocking follow-up
for the next eval pack.

---

## 1. Exact files reviewed

Package files (all read in full; tracked diffs read line by line):

| File | State | Size of change |
| --- | --- | --- |
| `docs/raphael/RAPHAEL_NUWA_DISTILLATION_SPEC.md` | untracked NEW | 156 lines |
| `src/data/ai/raphaelNuwaDistillationBundle.js` | untracked NEW | 115 lines |
| `src/ai/raphaelTrainingAdapter.js` | modified | +51 / −16 lines |
| `src/ai/testHarness/raphaelTrainingBundleCases.js` | modified | +39 / −2 lines |
| `docs/agent/AI_EXECUTION_LEDGER.md` | modified | Nuwa entry (11 lines of the diff; the rest is the FABLE5-P0 entry) |

Dependency files read to validate the package (unchanged by it):
`src/ai/nlu/runNluPipeline.js`, `src/ai/responseStrategySelector.js`,
`src/ai/nlu/topicClassifier.js`, `src/ai/nlu/dialogueActClassifier.js`,
`src/data/ai/raphaelTrainingBundle.js`, `src/ai/raphaelCore.js`.

## 2. Architecture summary

Nuwa v0.1 is a second static advisory bundle merged alongside the existing
LangGraph-lab training bundle inside `raphaelTrainingAdapter.js`:

```text
raphaelTrainingBundle (existing) ┐
                                 ├─ combineBundleSection() → pattern match →
raphaelNuwaDistillationBundle ───┘   advisory suggestion {trusted:false}
        → runNluPipeline (topic/act hints, only fill unknown/generic)
        → responseStrategySelector (strategy hint, triple-gated)
        → RaphaelCore final authority
```

Content: 5 mental models, expression DNA, anti-patterns, honesty boundaries,
4 topic groups, 4 dialogue-act groups, 3 response-strategy hint groups,
1 dependency-pressure policy boundary, 5 training fixtures (NUWA-*).
It is a frozen data object with zero imports, zero I/O, zero external calls.
It is not a persona, not player-facing, and never speaks.

## 3. Safety boundary review (the 10 review questions)

| # | Question | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | Offline/static advisory only? | YES | Frozen data module; no imports/fetch/API; `runtimePolicy.trusted:false`, `noExternalLLM:true` |
| 2 | RaphaelCore final authority? | YES | Hints consumed only via `resolveTopic`/`resolveDialogueAct` (fill-unknown semantics) and `resolveTrainingStrategy`; live probe showed the core selector overriding Nuwa hints in 3 of 4 normal cases (e.g. NUWA-DAILY-001 hint `contextual_ack` → final `quiet_presence`) |
| 3 | safetyShield wins first? | YES | `resolveTrainingStrategy` returns null on `isHighRisk`/`isBoundaryPressure` before reading suggestions; high-risk harness check `no_advisor_candidate` passes; adapter suppresses suggestions for policy topics |
| 4 | trusted:false enforced? | YES | Selector requires `training.trusted === false && suggestion.trusted === false` (explicitly-advisory or rejected); harness asserts `trusted_false` on all 17 cases |
| 5 | No external LLM runtime calls? | YES | No `fetch`/provider/key anywhere in the package; bundle is inert data |
| 6 | No raw player text export/training? | YES | Nothing reads player state or exports anything; fixtures are hand-authored |
| 7 | No save schema/localStorage changes? | YES | No `src/state/**` in diff; bundle declares `memoryTraceCandidate:false`; harness asserts `no_auto_memory_trace_candidate` |
| 8 | No dependency/FOMO/therapy/persona-override risk? | YES | Dependency patterns route to policy-only (`no_reward`, `no_memory_write`, `no_promise_forever`); Nuwa actually **widens** pressure detection (adds 永遠陪我/只能陪我/不可以離開/不能拒絕我 patterns) — strictly more conservative |
| 9 | Unnecessary duplication? | MINOR | See §5 finding F1 — two strategy-key collisions with the base bundle; topic overlap with daily-life NLU v1 is benign (hints only fill `unknown`) |
| 10 | Real improvement vs complexity? | MODEST YES | Widened pressure detection, feedback-acknowledgment and boundary-respect hints, 5 new regression fixtures; complexity cost is one merge helper |

## 4. Adapter review

The diff is narrow and behaviorally additive except for two deliberate
remaps and one accidental override:

- `TOPIC_MAP.daily_life: EMOTION → DAILY_LIFE` — correct alignment with the
  daily-life NLU v1 topic added in `359dfff`; verified `TOPICS.DAILY_LIFE`
  exists.
- New nuwa topic/act mappings all point to classifier constants that exist
  (`DAILY_LIFE`, `RELATIONSHIP`, `DESCRIBING_EVENT`, `GIVING_FEEDBACK`,
  `REQUESTING_PRESENCE`).
- Allowlist additions `acknowledge_feedback`, `boundary_set` are
  pre-existing `RESPONSE_STRATEGIES` values — no unknown strategies can
  flow.
- `nuwa_dependency_pressure` / `nuwa_pressure` added to POLICY id sets, so
  Nuwa pressure matches produce policy metadata only, never advisory
  suggestions.
- `resolvePolicy` prefers Nuwa's boundary rules
  (`no_reward`,`no_memory_write`,`no_promise_forever`) — a superset of the
  base rules. Safe direction.

## 5. Findings

**F1 (minor, non-blocking): `combineBundleSection` key collision silently
replaces two base-bundle strategy entries.** Both bundles define
`responseStrategies.contextual_ack` and `responseStrategies.boundary_set`;
Nuwa spreads last and wins. Empirically confirmed consequence: base case
`daily-smalltalk-001` lost its advisory strategy hint (probe:
`strategy: None`, previously `contextual_ack`); it still passes because
topic/act hints satisfy `usable_advisory_hint` (OR-check). No safety impact:
dependency/safety routing uses the separate `safetyBoundaries` section and
POLICY id sets, which have no collisions. Fix later (TP-3): prefix Nuwa
strategy keys (`nuwa_contextual_ack`) or merge `caseIds` arrays on
collision, plus a harness check that every base case keeps a non-null
strategy hint. Not fixed in this review per scope (review/classify only).

**F2 (observation): Codex's "mainReadiness 12/12" claim was an
undercount** — the runner actually reports 29/29 (17 training + 12
readiness). Claim confirmed in the stronger direction.

**F3 (observation): spec-doc completion criteria all hold** (bundle imports
cleanly, all gates pass, no package/backend/key/schema/Pixi change).

## 6. Test results (re-run by this reviewer, 2026-07-05, local server 127.0.0.1:5173 serving this worktree — worktree identity confirmed by fetching the untracked Nuwa bundle over HTTP)

| Gate | Codex claim | Re-run result |
| --- | --- | --- |
| `node --check` ×3 changed JS | passed | **PASS ×3** |
| `_run_raphael_training_bundle.py` | 17/17 | **17/17**, 0 forbidden, 0 console errors |
| `_run_raphael_main_readiness.py` | 12/12 | **29/29** (17+12), 0 safety/boundary/noise failures |
| `_run_harness_smoke.py` | 17/17 | **17/17**, 0 console errors |
| `_run_nlu_training.py` | 16/16 | **16/16**, 0 console errors |
| `_run_stage4_human_playtest.py` | 12/12 | **12/12**, 0 console errors |
| `git diff --check` | passed | **PASS** |

**All Codex-reported claims CONFIRMED.** Runner note: on this machine the
runners need `PYTHONIOENCODING=utf-8` (cp950 console chokes on Chinese
replies) and a server on 5173 (`python -m http.server 5173 --bind
127.0.0.1`; the port was free during this run).

## 7. Risk table

| Risk | Severity | Status |
| --- | --- | --- |
| Nuwa overrides RaphaelCore | none | Disproven by code + live probe |
| Safety weakened | none | Pressure detection widened; high-risk advisory suppression verified |
| External model/backend introduced | none | Static data only |
| Save/localStorage/schema change | none | No state files touched |
| Base-bundle strategy-hint regression (F1) | low | Quality-of-hints only; documented for TP-3 |
| Package loss (uncommitted) | medium until committed | Backups exist (see §9); commit resolves |
| Ledger merge friction at reconciliation | low | See `BRANCH_RECONCILIATION_REPORT.md` |

## 8. Verdict

**KEEP_CANDIDATE → recommend COMMIT.** All Step-4 KEEP criteria are met:
tests pass (re-verified), no forbidden files touched, no external runtime
model, no save/localStorage/schema change, advisory-only confirmed at both
data and consumption layers, RaphaelCore final authority demonstrated live,
no safety boundary weakened (one boundary strengthened). Rollback was NOT
performed and is not warranted. The F1 collision is a revise-later nit, not
a commit blocker: shipping v0.1 as-is loses one advisory hint on one base
case while adding five fixtures and wider pressure coverage.

## 9. Backups

- `../NexusLink_pre_nuwa_review_full_diff_20260705_2026.patch` (tracked-file diff)
- `../NexusLink_backup_20260705_RAPHAEL_NUWA_DISTILLATION_SPEC.md`
- `../NexusLink_backup_20260705_raphaelNuwaDistillationBundle.js`

(All in the workspace root, outside the repo.)
