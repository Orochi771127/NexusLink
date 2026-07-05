# Next AI TASK_PACK Queue

Created: 2026-07-05 (FABLE5-P0 reconciliation audit)
Updated: 2026-07-06 (TP-1B product audit — TP-1 marked DONE; TP-6..TP-8
player-impact packs added; recommended order re-ranked)
Status: proposal — every pack still requires human approval before work
starts (Gate 1 → Gate 2 per `docs/agent/AI_WORKFLOW.md`).

**Recommended order after TP-1B (player-impact-first):**
1. **TP-6** (audio reality — biggest perceived-quality jump, bounded)
2. **TP-7** (companion-initiated micro-moments — biggest differentiation)
3. **TP-2** (status/handoff refresh — now also carries the TP-1B doc-drift
   corrections list)
4. **TP-8** (Initial Bond decision — human design gate, blocks store/chapter)
5. TP-3 (eval pack), TP-4 (i18n fill), TP-5 (cursor rules) as capacity allows.
Rationale and evidence: `docs/agent/PRODUCT_QUALITY_FUN_FACTOR_AUDIT.md`.

Standing constraints for every pack below: no commit/push without explicit
human instruction; no new dependencies; no backend/API/LLM routing; no save
schema or localStorage key changes; no GROUNDWORK files unless the pack
explicitly grants them; ledger entry required at close.

---

## TP-1 — Nuwa advisory package review + branch reconciliation — ✅ DONE 2026-07-05/06

Completed: TP-1A fresh-context review classified the Nuwa package
KEEP_CANDIDATE (all gates re-verified); human committed, rebased, and
fast-forwarded — `main` == `origin/main` == `cbd2aa8`, working tree clean.
Reports: `docs/agent/NUWA_ADVISORY_PACKAGE_REVIEW.md`,
`docs/agent/BRANCH_RECONCILIATION_REPORT.md`. Original pack text kept below
for the record.

### (archived) TP-1 — Nuwa advisory package review + branch reconciliation (HIGHEST LEVERAGE)

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

## TP-6 — Sensory Feedback Pack v1: audio reality (added by TP-1B, 2026-07-06)

- **Goal:** end the silent-game state. Wire 6–10 SFX (touch accept/guarded/
  reject, Soul Talk send/reply, trace bloom, standoff action/telegraph,
  milestone) + 1 ambient lake loop through the EXISTING
  `src/audio/audioManager.js` (it already persists `sfxVolume` —
  `audioManager.js:22` — but nothing plays). Includes the dead-UI honesty
  fix: until SFX land, the Settings SFX slider must be hidden or labeled;
  after, it controls real sound. Same pack gates the placeholder Atlas
  button ("尚未開放" state) — two known dead-UI items, one pass.
- **Recommended owner:** HUMAN selects/approves audio assets (assets/** =
  GROUNDWORK; licensing check); **Codex** wires playback + slider +
  atlas-button gate. Fable 5 not needed.
- **Allowed files:** `src/audio/audioManager.js`,
  `src/ui/settingsController.js`, the emitting call sites
  (`interactionController.js`, `soulTalkController.js`,
  `battleController.js`, trace-echo path), `assets/audio/**` [NEW files,
  human-approved only], `docs/agent/AI_EXECUTION_LEDGER.md`.
- **Forbidden files:** `index.html` (unless one approved line),
  `src/state/**`, `src/pixi/pixiApp.js`, everything else.
- **Red-line check:** no notification-style chimes, no reward fanfares for
  safety turns (red line 7), sounds must respect the quiet aesthetic;
  safety-redirect turns stay silent.
- **Verification plan:** `node --check` touched JS; web release gate 10/10
  on clean port; safety-turn silence asserted; HUMAN listen pass on real
  device (headphones + speaker).
- **Human gate:** REQUIRED — asset selection/licensing + final listen pass.

## TP-7 — Companion Presence Pack v1: companion-initiated micro-moments (added by TP-1B)

- **Goal:** the companion acts first, occasionally and quietly — e.g. walks
  to the lake edge and looks back at the player, one first-person line at
  most. Reuses the EXISTING autonomy stack (`needModel`, `goalManager`,
  `actionPolicy`, `initiativeCooldown`) and the gentle-invitation surface;
  no new AI systems. This closes the biggest differentiation gap found by
  TP-1B (chat apps initiate; our cat never does, despite built
  infrastructure).
- **Recommended owner:** HUMAN approves the behavior list first (design
  gate); **Claude Code** implements; **Codex** adds eval fixtures; **Fable
  5** does the red-line review of the behavior list + a fresh-context diff
  review (dev auditor only).
- **Allowed files (after design gate):** `src/ui/gentleInvitationController.js`
  or a new sibling controller [NEW], `src/engine/gentleInvitationEngine.js`,
  autonomy wiring call sites, one testHarness file [NEW ok],
  `docs/agent/AI_EXECUTION_LEDGER.md`.
- **Forbidden files:** `src/ai/raphaelCore.js` core pipeline,
  `safetyShield.js`, `memoryWriter.js`, `stateMutationPolicy.js`, all
  GROUNDWORK, save schema.
- **Red-line check (hard):** triggers must derive ONLY from companion state
  (energy/mood/boundary/time-of-day) — NEVER from player absence, login
  frequency, or loneliness detection (red line 1). `initiativeCooldown`
  enforced so initiative never becomes nagging (red line 6). Eval cases must
  assert both.
- **Verification plan:** `node --check`; new harness cases pass; Raphael
  smoke + release gate; browser check that moments fire ≤ N per session and
  never during onboarding/safety turns.
- **Human gate:** REQUIRED twice — behavior list before implementation;
  feel check after.

## TP-8 — Initial Bond decision gate (added by TP-1B)

- **Goal:** resolve the canon-vs-code contradiction. Current state IS the
  degraded state Master Canon §86 warns about: `defaultState.js:67-69`
  unlocks only `greyshade-cat` with no first-meeting choice UI ("強制只有
  一隻、又無選擇畫面"). Two exits, human must pick: (A) build the 初遇
  choose-one ceremony (2–3 companions, one line each, pick-and-commit — per
  Canon §80); or (B) accept greyshade-cat as the fixed first companion for
  the vertical slice and amend Canon §176 / AGENTS.md §7 wording (both
  currently describe a stale unlock-all state). Option B is docs-only;
  Option A is GROUNDWORK (defaultState/store migration + UI).
- **Recommended owner:** HUMAN design decision first. Then: (A) → Claude
  Code implementation + Codex migration tests; (B) → Codex docs pack.
- **Allowed files:** decision doc + (B) canon/AGENTS wording, or (A)
  onboarding controller + `src/state/defaultState.js` + `src/state/store.js`
  normalize (GROUNDWORK — item-level approval) + migration cases.
- **Forbidden files:** everything else; no store/shop/chapter code in
  either option.
- **Verification plan:** (B) `git diff --check` only; (A) migration suite
  extended (veteran saves keep their unlocked set; fresh saves get the
  ceremony exactly once), release gate, K1–K5 acceptance refs.
- **Human gate:** REQUIRED — this is a product-identity decision
  ("sell souls" credibility), not an engineering call.

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
