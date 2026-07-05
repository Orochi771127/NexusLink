# Next AI TASK_PACK Queue

Created: 2026-07-05 (FABLE5-P0 reconciliation audit)
Status: proposal — every pack still requires human approval before work
starts (Gate 1 → Gate 2 per `docs/agent/AI_WORKFLOW.md`).
Ordering: TP-1 is blocking; TP-2..TP-5 are ordered by leverage but are
mutually independent after TP-1 resolves.

Standing constraints for every pack below: no commit/push without explicit
human instruction; no new dependencies; no backend/API/LLM routing; no save
schema or localStorage key changes; no GROUNDWORK files unless the pack
explicitly grants them; ledger entry required at close.

---

## TP-1 — Nuwa advisory package review + branch reconciliation (HIGHEST LEVERAGE)

- **Why first:** Codex-verified runtime work (Nuwa distillation advisory
  layer) sits uncommitted on `chore/install-ai-workflow-tools`, which is
  diverged 1↔1 from `main`. Everything else risks building on the wrong
  base until this resolves.
- **Recommended model:** Human decision, supported by **Codex** (it authored
  the package) for walkthrough; a fresh-context verifier (Claude Code or
  Fable 5, cheap read-only pass) may audit the diff before commit.
- **Allowed files:** none for the AI beyond `docs/agent/AI_EXECUTION_LEDGER.md`
  (status entry). Commit/branch actions are human-executed or
  human-instructed line by line.
- **Forbidden files:** everything else; especially do not "clean up" the
  five dirty/untracked files before the decision.
- **Verification plan:** after commit/rebase decision: `git status --short`
  clean or intentionally scoped; `git diff --check`; if the Nuwa package is
  kept, re-run the Raphael suite the Nuwa entry cites (training bundle,
  main readiness, smoke, NLU training, Stage 4) on the final branch state.
- **Human gate:** REQUIRED (commit/push + branch strategy are human-only).

## TP-2 — Raphael status/handoff refresh (kill the stale-doc trap)

- **Goal:** update `docs/handoff/RAPHAEL_AI_STATUS.yaml` and
  `docs/handoff/RAPHAEL_AI_HANDOFF.md` from last_updated 2026-06-24 to
  current reality (training adapter, agent classification canon, restricted
  habitat agent, daily-life replies, Nuwa pending state, current QA
  numbers); clear or update `docs/architecture/RUNTIME_MAP.md`'s
  `NEEDS UPDATE` flag against source.
- **Recommended model:** **Codex or Claude Code** (docs-only, evidence
  transcription — no Fable 5 needed).
- **Allowed files:** `docs/handoff/RAPHAEL_AI_STATUS.yaml`,
  `docs/handoff/RAPHAEL_AI_HANDOFF.md`,
  `docs/architecture/RUNTIME_MAP.md`, `docs/agent/AI_EXECUTION_LEDGER.md`.
- **Forbidden files:** all `src/**`, `assets/**`, root canon files,
  `ACCEPTANCE.md`.
- **Verification plan:** `git diff --check`; cross-check every stated QA
  number against `docs/qa/*` evidence files or a fresh run; every claim
  without evidence marked NOT VERIFIED.
- **Human gate:** review-only (docs), plus commit approval.

## TP-3 — Eval-only pack: Nuwa fixture extension + eval-shape alignment

- **Goal:** the next eval-only step already named in the ledger's Nuwa
  entry: add sleep / morning / commuting / quiet-return fixtures to the Nuwa
  advisory cases, plus persona-differentiation and apology-repair eval cases
  identified as gaps in `docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md`; add
  a short doc section reconciling the Cursor rule's preferred eval-case JSON
  shape with the implemented boolean-check shape (align the doc, don't
  rewrite 14 harnesses).
- **Recommended model:** **Codex** (narrow, fixture-driven, pattern follows
  existing files). Fable 5 only if a design question emerges (e.g. how to
  test persona differentiation without a second runtime persona).
- **Allowed files:** `src/ai/testHarness/raphaelTrainingBundleCases.js`,
  `src/data/ai/raphaelNuwaDistillationBundle.js` (fixtures only), a new
  harness file under `src/ai/testHarness/` if persona/repair cases need one
  `[NEW]`, `docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md` (update),
  `docs/agent/AI_EXECUTION_LEDGER.md`.
- **Forbidden files:** `src/ai/raphaelCore.js`, `safetyShield.js`,
  `memoryWriter.js`, `stateMutationPolicy.js`, all GROUNDWORK, all UI.
- **Verification plan:** `node --check` on touched JS (bundled codex node);
  run training-bundle + main-readiness + smoke runners; `git diff --check`.
- **Human gate:** approval to start (depends on TP-1 outcome — these files
  are currently dirty); review of new fixture wording.

## TP-4 — i18n fill: sc/jp for the 53 EN keys (cheap-model candidate)

- **Goal:** fill simplified-Chinese and Japanese values for the 53 content
  keys added in the Commercial RC pass (currently falling back to tc), per
  the standing "sc/jp fill" follow-up in the ledger and project memory.
  Content-tier translation (Soul Talk dialogue pool, milestone themes) stays
  out of scope pending a human language-policy decision.
- **Recommended model:** **cheapest capable model** (Haiku-class or Codex
  small) — mechanical key-by-key translation with a fixed glossary;
  Fable 5 explicitly NOT justified here.
- **Allowed files:** `src/i18n/strings.js`,
  `docs/agent/AI_EXECUTION_LEDGER.md`.
- **Forbidden files:** `index.html`, all controllers, everything else.
- **Verification plan:** `node --check src/i18n/strings.js`; scripted
  STRINGS integrity check (0 missing languages, all `t()` refs resolve);
  web release gate on a clean port (5173 is squatted on this machine);
  human native-speaker spot check of tone (translations must keep the
  sparse, non-coercive companion voice).
- **Human gate:** tone review before commit.

## TP-5 — Cursor rule completion: safety + mobile rule files

- **Goal:** create the two rule files the orchestration assessment planned
  but never landed: `.cursor/rules/nexus-raphaelcore-safety.mdc` (distill
  red lines 1–7, Never List, advisory-only gateway contract, forbidden
  RaphaelCore edits) and `.cursor/rules/nexus-ui-mobile.mdc` (keyboard model
  v5 constraints, 390×844 baseline, no-FOMO UI rules, GROUNDWORK list).
  Content must be distilled from CLAUDE.md/AGENTS.md/constitution — no new
  policy invention.
- **Recommended model:** **Claude Code or Codex** (docs-only distillation).
- **Allowed files:** `.cursor/rules/nexus-raphaelcore-safety.mdc` `[NEW]`,
  `.cursor/rules/nexus-ui-mobile.mdc` `[NEW]`,
  `docs/agent/AI_EXECUTION_LEDGER.md`.
- **Forbidden files:** the existing `nexus-ai-orchestrator.mdc` (append-only
  ecosystem — don't rewrite it in the same pack), everything else.
- **Verification plan:** `git diff --check`; human read-through confirming
  each rule line traces to an existing canon sentence (no invented policy).
- **Human gate:** approval of rule wording (these steer every future Cursor
  session).

---

## Not in the queue (and why)

- **Real-device retest, 3-tester private playtest, legal/privacy/store
  copy** — open HUMAN GATES; no AI pack can close them. They remain the
  actual release blockers.
- **Phase 2+ content / chapter / monetization / Initial Bond** — separate
  GROUNDWORK gates per the plan file; not schedulable until the human
  re-opens them.
- **Sidecar dashboard / LangGraph office (Phases B–D of
  NEXUSLINK_AI_DEVELOPMENT_MODE)** — explicitly gated on Pilot A succeeding
  first; running Pilot A is a human-initiated exercise, not an AI backlog
  item.
- **Anything on the §5 DONE list** in
  `docs/agent/FABLE5_CURRENT_STATE_RECONCILIATION.md` — already implemented.
