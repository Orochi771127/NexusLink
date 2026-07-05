# Fable 5 Current-State Reconciliation

Date: 2026-07-05
Auditor: Claude Fable 5 (development auditor role, not runtime model)
Task: FABLE5-P0 — read-only/docs-only reconciliation audit
Scope: repo evidence only. Claims not backed by files or git in this checkout
are marked NOT VERIFIED. Files named in older docs but absent are marked
MISSING. No runtime code was executed or modified for this audit.

---

## 1. Current repo state (git evidence)

| Fact | Evidence |
| --- | --- |
| Workspace | `C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink` |
| Checked-out branch | `chore/install-ai-workflow-tools` |
| Branch vs `main` | Diverged 1 ↔ 1: this branch has `f7a72fb` (ignore local GSD Core install artifacts); `main` has `0e448ae` (art style target doc) that this branch lacks |
| `main` vs `origin/main` | In sync (0 ahead / 0 behind) |
| Dirty worktree | Yes — uncommitted Nuwa advisory package: modified `src/ai/raphaelTrainingAdapter.js`, `src/ai/testHarness/raphaelTrainingBundleCases.js`, `docs/agent/AI_EXECUTION_LEDGER.md`; untracked `docs/raphael/RAPHAEL_NUWA_DISTILLATION_SPEC.md`, `src/data/ai/raphaelNuwaDistillationBundle.js` |
| Owner of dirty changes | Codex, per ledger Lane 3 entry `2026-07-05 - Codex - Nuwa Distillation Advisory Layer For RaphaelCore`, status `VERIFIED`, awaiting human review |

Recent `main` history (last ~30 commits) shows the project is deep in a
Pre-Commercial Vertical Slice phase: four-page EN i18n (`616672b`,
`35046c8`), First-Session legibility pillars (`0504ac0`, `623720d`), Phase 2
combat deepening (`0546744`, `08d7bd4`, `ca8c467`), Soul Talk single-panel
rebuild (`1827bb9`), mobile keyboard fixes (`03e8af3`), moonlake habitat art
staging/reset (`b1eebe7` and earlier), and the Cursor orchestration rule +
assessment (`a742228`, `64a0b09`).

Consequences for the next AI:

- The emotional-standoff battle conversion is COMPLETE (CLAUDE.md §6.1 was
  explicitly drift-corrected on 2026-07-03). Do not re-do the battle.
- The single line of development is `main`; the current branch exists only to
  host workflow-tool installs and now carries the uncommitted Nuwa package.
  This is a reconciliation risk (see §6).

## 2. Existing governance files

All of the following EXIST in this checkout (verified by read):

| File | Role |
| --- | --- |
| `NEXUS_LINK_MASTER_CANON_v3.1.md` | Highest strategic canon |
| `CLAUDE.md` | Collaboration entry constitution (GROUNDWORK vs EXPERIENCE split, red lines) |
| `AGENTS.md` | Multi-AI division of labor, ledger protocol, art policy |
| `ACCEPTANCE.md` | Contract → checkable assertions (§A–§L) |
| `CONTRIBUTING.md` | One-page onboarding + Definition of Done |
| `.cursor/rules/nexus-ai-orchestrator.mdc` | Cursor orchestration rule: model routing, TASK_PACK format, verification rules, Fable 5 usage boundaries |
| `docs/agent/AI_EXECUTION_LEDGER.md` | Cross-AI operational ledger, 3 lanes, ~100 entries |
| `docs/agent/AI_WORKFLOW.md` | Gate 0–6 flow |
| `docs/agent/TASK_TEMPLATE.md` | TASK_PACK template |
| `docs/agent/REVIEW_CHECKLIST.md` | Diff review checklist |
| `docs/agent/CURSOR_MULTI_AI_ORCHESTRATION_ASSESSMENT.md` | Cursor-as-orchestrator assessment (2026-07-04) |
| `docs/agent/NEXUSLINK_AI_DEVELOPMENT_MODE.md` | Eight development-agent role model, worktree model, sidecar roadmap |
| `docs/handoff/FABLE5_RAPHAEL_AGENT_HANDOFF_PROMPT.md` | Paste-ready Fable 5 Raphael prompt (Phase A) |
| `docs/handoff/FABLE5_COMMERCIAL_UIUX_TAKEOVER_PROMPT.md` | Paste-ready Fable 5 UI/UX prompt |
| `docs/handoff/RAPHAEL_AI_HANDOFF.md` + `RAPHAEL_AI_STATUS.yaml` | Raphael status handoff — **STALE** (last_updated 2026-06-24; predates training adapter, agent classification canon, daily-life replies, Nuwa) |

Files recommended by `CURSOR_MULTI_AI_ORCHESTRATION_ASSESSMENT.md` §5 that are
MISSING (as of this audit; the first is created by this TASK_PACK):

- `docs/agent/AI_MODEL_USAGE_LEDGER.md` — created 2026-07-05 by this audit.
- `.cursor/rules/nexus-raphaelcore-safety.mdc` — MISSING.
- `.cursor/rules/nexus-ui-mobile.mdc` (a.k.a. `nexus-mobile-ui.mdc`) — MISSING.
- `docs/agent/FABLE5_RAPHAEL_CORE_WORKFLOW.md` — MISSING as named; largely
  covered by `docs/handoff/FABLE5_RAPHAEL_AGENT_HANDOFF_PROMPT.md`.
- `scripts/evalRaphaelCore.mjs` / `scripts/validateRaphaelCorpus.mjs` —
  MISSING as named; the eval function is served by `docs/qa/_run_*.py`
  runners instead. Do not create duplicates in `scripts/**` (GROUNDWORK).
- `docs/agent/TASK_PACK_TEMPLATE.md` / `VERIFIER_CHECKLIST.md` — exist under
  the names `TASK_TEMPLATE.md` / `REVIEW_CHECKLIST.md`; name drift only.

## 3. Existing RaphaelCore / eval systems

RaphaelCore is implemented and mature: `src/ai/` contains 107+ modules across
orchestrator (`raphaelCore.js`), NLU (`src/ai/nlu/`), autonomy
(`src/ai/autonomy/`), critics (`src/ai/eval/`: safety, boundary, persona,
memory, reply, generic-reply, constitution), awakening, dialogue loop
control, evolution (proposal-only), external gateway (default OFF, stubs
only), tools (whitelisted), and the advisory training adapter
(`raphaelTrainingAdapter.js`, `trusted:false`).

Eval/test harnesses that EXIST (`src/ai/testHarness/`, 14 files) and QA
runners (`docs/qa/_run_*.py`, 18 runners incl. the aggregate
`_run_web_release_gate.py`). Full mapping, case counts, and gaps:
`docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md` (new, this audit).

Latest ledger-reported pass numbers (2026-07-05 Nuwa entry; reported by
Codex, NOT re-run in this audit): combined training bundle 17/17, main
readiness 12/12, Raphael smoke 17/17, NLU training 16/16, Stage 4 playtest
12/12.

Sibling workspaces exist as directories (contents NOT VERIFIED this audit):
`raphael-ai-engine`, `raphael-gateway-server`,
`raphael-gateway-server-langgraph`, `aiforge-raphael-corpus`.

## 4. Existing Fable 5 involvement (repo evidence)

Ledger entries explicitly attributed to **Claude Fable 5**:

| Date | Task | Outcome / what it proved |
| --- | --- | --- |
| 2026-07-02 | First Session UX Repair TASK_PACK A (P0) | `30ef1fa` pushed. Proved Fable 5 can root-cause a cross-file live bug (lost-send pointerdown/blur race) and take the live Soul Talk gate 0/10 → 10/10. |
| 2026-07-02 | First Session UX Repair TASK_PACK B (P1 first loop + copy diet) | Committed+pushed. Proved Fable 5 can execute an approved GROUNDWORK touch (`defaultState.js`/`store.js` firstLoop) with a migration test suite (12/12). |
| 2026-07-02 | Commercial RC pass (HUD-B audit, dead-code cleanup, EN content i18n) | `9933418`+`616672b` pushed. Proved Fable 5 can run a Gate-0 audit that **rejects** reference-pack items violating red lines (coin/gem chips, notification toggles). |
| 2026-07-02 | i18n P4 (controller wiring + static labels) | Handed to Codex review; integrated as `35046c8`. Proved the Fable-implements → Codex-reviews → human-push pipeline works. |
| 2026-07-03 | Soul Talk single-panel rebuild + HUD V3 alignment | Committed+pushed. Proved Fable 5 can do a human-directed UI rebuild while keeping the send pipeline and safety paths intact (release gate 10/10). |

Notes on attribution: adjacent ledger entries are labeled `Claude Opus 4.8`
(2026-07-03/04 combat + first-session + keyboard work) and `Claude Code`
(2026-06-28..30 UI work). Whether those sessions used the Fable 5 model is
UNKNOWN from repo evidence; the ledger label is the only record. This is
exactly the gap `AI_MODEL_USAGE_LEDGER.md` now closes.

No ledger entry shows Fable 5 acting as a runtime model, chat generator, or
RaphaelCore dependency. Consistent with the Cursor rule: Fable 5 has been
used as implementer/auditor only.

## 5. Obsolete recommendations (already implemented or superseded)

From `.cursor/rules/nexus-ai-orchestrator.mdc` "RaphaelCore Training
Priority" and "Commercial-Grade Priority" lists, and from earlier Fable/
ChatGPT discussions, the following asks are ALREADY DONE — do not re-issue
them as tasks:

1. **"Build a RaphaelCore Eval Harness" — DONE.** 14 harness files + 18 QA
   runners + aggregate release gate exist (see §3 and the coverage matrix).
2. **"Build a Raphael Safety Verifier" — substantially DONE.**
   `safetyCritic.js`, safety-kind cases across training-bundle / main-
   readiness / smoke suites, forbidden-phrase detection, and non-reward
   assertions on high-risk input all exist. What does NOT exist: a
   standalone `.cursor/rules/nexus-raphaelcore-safety.mdc` rule file.
3. **"Add Cursor rules + first read-only orchestration audit" — DONE**
   (`a742228`, `64a0b09`; this document completes the follow-up
   reconciliation).
4. **"Add ledger files" — half done.** Execution ledger existed;
   `AI_MODEL_USAGE_LEDGER.md` was missing until this audit.
5. **"Convert battle from RPG to emotional standoff" — DONE and
   drift-corrected** (CLAUDE.md §6.1, 2026-07-03). Any plan that says
   "battle is still ordinary RPG" is reading stale text.
6. **"Response template cleanup / de-generic pass" — in progress via
   Codex**, not open for Fable: Anti-Vibe Copywriting Final Pass
   (Lane 2, 2026-07-04), daily-life replies v1 (Lane 3, 2026-07-04), Nuwa
   advisory layer (Lane 3, 2026-07-05, uncommitted).
7. **"Habitat state output adapter" — DONE** as the restricted habitat agent
   (`raphaelAgentAdapter.js` + `raphaelIntentReducer.js`, Package 8,
   forbidden-key injection tested).
8. **"Automated QA loop" — DONE** as `_run_web_release_gate.py` (10/10
   required checks, includes mobile probe, storage migration, asset
   integrity, live playtest).

Partially obsolete: the Cursor rule's preferred eval-case JSON shape
(`expectedTier` / `mustInclude` / `mustAvoid`) was never adopted; the
implemented harnesses use boolean policy checks instead. Treat the rule's
shape as aspirational, not as evidence of a missing system (detail in the
coverage matrix §4).

## 6. Remaining risks

1. **Uncommitted verified work at risk (highest).** The Nuwa advisory
   package sits uncommitted on a side branch. A crash, checkout, or careless
   clean discards Codex-verified work. Needs human review + commit/discard
   decision (TASK_PACK queue #1).
2. **Branch divergence.** `chore/install-ai-workflow-tools` ↔ `main` are
   1/1 diverged. The project's working convention (per ledger history) is
   single-line development on `main`. Left alone, the next AI may build on
   the wrong base.
3. **Stale status documents.** `RAPHAEL_AI_STATUS.yaml` and
   `RAPHAEL_AI_HANDOFF.md` still describe the 2026-06-24 Stage-4/PR-#87
   world. An AI that trusts them will under-count existing systems (this is
   precisely the duplication failure mode this audit exists to prevent).
   `docs/architecture/RUNTIME_MAP.md` was flagged `NEEDS UPDATE` by Codex on
   2026-07-02 and remains so (NOT VERIFIED whether since fixed).
4. **No model/cost accountability.** Model labels in the execution ledger
   are inconsistent (`Claude Fable 5` / `Claude Opus 4.8` / `Claude Code` /
   `Claude` / `Codex` / `Grok Agent`); costs, fallbacks, and human-rework
   are recorded nowhere. Fixed going forward by `AI_MODEL_USAGE_LEDGER.md`.
5. **Human gates still open (unchanged since 2026-07-02):** real-device
   mobile retest, moderated 3-tester private playtest, legal/privacy/store
   copy review. No AI task can close these.
6. **Eval blind spots.** Persona differentiation, apology-repair semantics,
   and fission-event red lines (D3–D5) have no eval coverage; multilingual
   coverage is one case deep. See coverage matrix §3.
7. **Mojibake in older Raphael Chinese docs** (per 2026-07-02 handoff
   package entry) — authority references must not be copy-pasted into new
   files. NOT VERIFIED which specific files are affected in this checkout.

## 7. Next safe action

Human decision on the Nuwa advisory package (review → commit on the intended
branch, or discard), then branch reconciliation back to single-line `main`.
Until that decision, no AI should modify `src/ai/raphaelTrainingAdapter.js`,
`src/ai/testHarness/raphaelTrainingBundleCases.js`, or the two untracked
Nuwa files. The full prioritized queue is in
`docs/agent/NEXT_AI_TASK_PACK_QUEUE.md`.

### What Fable 5 should be explicitly forbidden right now

- Acting as runtime chatbot / NPC generator / RaphaelCore dependency
  (standing Cursor-rule prohibition).
- Touching the uncommitted Nuwa package files (another agent's pending
  review).
- Any GROUNDWORK edit, dependency add, backend/API/cloud routing, save
  schema or localStorage key change without item-level human approval.
- `git commit` / `git push` (standing prohibition).
- Bulk-generating new Raphael response copy — the eval structure exists, but
  content passes are currently owned by the Codex lane (daily-life v1,
  Nuwa); parallel copy generation would collide.
- Re-implementing anything in §5's DONE list.
