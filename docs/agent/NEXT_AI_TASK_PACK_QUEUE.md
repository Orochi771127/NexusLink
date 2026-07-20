# Next AI TASK_PACK Queue

Created: 2026-07-05 (FABLE5-P0 reconciliation audit)
Updated: 2026-07-14 (Raphael training ops playbook — RA/RS packs + skill routing)
Status: proposal — every pack still requires human approval before work
starts (Gate 1 → Gate 2 per `docs/agent/AI_WORKFLOW.md`).

**Raphael training ops (2026-07-14):** skill／外掛／進度路由見
[`docs/agent/RAPHAEL_TRAINING_OPS_PLAYBOOK.md`](./RAPHAEL_TRAINING_OPS_PLAYBOOK.md)。
外部名人人格只當批評透鏡；不安裝通用戰鬥 AI skill；自主 → 對峙 → 遠征。

**2026-07-06 Owner 拍板產品主線 V2（章節旅程 × 共鳴圈對峙）**：TP-6/TP-7 已出貨；
TP-8 已由 Owner 決策為選項 A（初遇選角），併入新的 **CH-1..CH-7 分包**（CH-1 對峙
視覺 v1 已出貨）——完整設計與分包表見
`docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md` §8。章節下一包 = **CH-2 初遇選角 UI**。

**Recommended order (Raphael training lane, after voice-pack wiring):**
1. ~~**RA-1**~~ — autonomy sealed-case contract + harness shape — ✅ 2026-07-14
2. ~~**RS-1**~~ — standoff eval contract (emotion／retreat ≠ DPS) — ✅ 2026-07-14
3. ~~**RA-2**~~ — Nuwa-style autonomy heuristics (`trusted:false`) — ✅ 2026-07-20（Owner 批 feel-check／豁免後）
4. ~~**RA-3**~~ — install `raphael-autonomy-eval` skill — ✅ 2026-07-20（見 PR #101）
5. ~~**RS-2**~~ — light standoff intent advisory — ✅ 2026-07-20（Owner 批下一步後）
6. ~~**RS-3**~~ — install `raphael-standoff-eval` skill — ✅ 2026-07-20（見本包）
7. ~~**TP-WQ-GATE**~~ — wire wording-quality into `web-release-gate` — ✅ 2026-07-20
8. Chapter packs (CH-2…) and remaining TP-* as product capacity allows；
   Owner private-blind / feel-check 仍為人類 gate

**Legacy recommended order after TP-1B (player-impact-first, kept for history):**
1. **TP-6** (audio reality — biggest perceived-quality jump, bounded)
2. **TP-7** (companion-initiated micro-moments — biggest differentiation) — ✅ shipped
3. **TP-2** (status/handoff refresh)
4. **TP-8** (Initial Bond decision — folded into CH packs)
5. ~~TP-3~~ / ~~TP-4~~ done; TP-5 (cursor rules) + **TP-WQ1** wording-quality
   as capacity allows (TP-WQ1 lands this cycle).
Rationale and evidence: `docs/agent/PRODUCT_QUALITY_FUN_FACTOR_AUDIT.md`.

Standing constraints for every pack below: no commit/push without explicit
human instruction; no new dependencies; no backend/API/LLM routing; no save
schema or localStorage key changes; no GROUNDWORK files unless the pack
explicitly grants them; ledger entry required at close.

---

## RA-1 — Autonomy sealed-case contract + harness shape — ✅ DONE 2026-07-14

Completed: sealed contract `docs/raphael/RAPHAEL_AUTONOMY_EVAL_CONTRACT.md`;
exported `AMBIENT_INITIATIVE_LIMITS`; extended `companionInitiativeCases.js`
(+ RA1-* cases); new `raphaelAutonomyEvalCases.js` suite **25/25** via node.
Owner feel-check on sparsity still required before RA-2. Original pack text
kept below for the record.

### (archived) RA-1 — Autonomy sealed-case contract + harness shape

- **Goal:** freeze what “companion initiates” must prove before deepening lines
  or behaviour lists. Cover: max moments per session, never during
  onboarding／safety turns, triggers from companion state only (energy／mood／
  boundary／time-of-day) — **never** player absence, login frequency, or
  loneliness detection; `initiativeCooldown` enforced.
- **Recommended model:** **Codex or Cursor** (docs + extend existing harness).
- **Allowed files:** `docs/agent/RAPHAEL_TRAINING_OPS_PLAYBOOK.md` (if needed),
  `docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md`,
  `src/ai/testHarness/companionInitiativeCases.js`,
  optional new `src/ai/testHarness/raphaelAutonomyEvalCases.js` `[NEW]`,
  `docs/agent/AI_EXECUTION_LEDGER.md`.
- **Forbidden files:** `safetyShield.js`, `memoryWriter.js`,
  `stateMutationPolicy.js`, save schema, GROUNDWORK, new npm deps.
- **Verification plan:** `node --check`; initiative harness green; assert
  red-line silence cases; `git diff --check`.
- **Human gate:** REQUIRED — behaviour list feel check after cases land.
- **Required reading:** `RAPHAEL_TRAINING_OPS_PLAYBOOK.md`,
  `src/ui/companionInitiativeController.js`,
  `src/ai/autonomy/initiativeCooldown.js`.

## RA-2 — Nuwa-style autonomy heuristics (advisory only) — ✅ DONE 2026-07-20

Completed: Nuwa bundle **v0.7.0** adds `autonomyHeuristics` + five autonomy
mental models; `getNuwaAutonomyAdvisory()` exposes gated `trusted:false` read
path; autonomy eval suite gains RA2-NUWA-001..004 + RA2-ALIGN-001. **No new
player-facing initiative lines** in this pack (TP-7 lines unchanged). Original
pack text kept below.

### (archived) RA-2 — Nuwa-style autonomy heuristics (advisory only)

- **Goal:** distill “when to walk to the lake / glance back / one quiet line”
  into mental models + decision heuristics in the Nuwa advisory bundle
  (`trusted:false`). Does not rebuild autonomy systems.
- **Recommended model:** **Codex** (pattern follows Nuwa voice distillation).
  Karpathy lens for “demo ≠ ship”; Jobs lens to keep the behaviour list tiny.
- **Allowed files:** `src/data/ai/raphaelNuwaDistillationBundle.js` (heuristics /
  mental models only), `src/ai/raphaelTrainingAdapter.js` only if a gated
  advisory hint path already exists and stays allowlisted,
  harness fixtures, `docs/agent/AI_EXECUTION_LEDGER.md`.
- **Forbidden files:** `safetyShield.js`, `memoryWriter.js`,
  `stateMutationPolicy.js`, battle numeric tables, installing celebrity
  persona skills into `companionPersonas`.
- **Verification plan:** training bundle + main readiness; advisory probes
  show `trusted:false`; no memory／reward side effects from heuristics.
- **Human gate:** REQUIRED before any player-visible line text ships from this pack.
- **Depends on:** RA-1 contract merged or explicitly waived by Owner.

## RS-1 — Standoff eval contract (emotion／retreat ≠ DPS) — ✅ DONE 2026-07-14

Completed: `docs/raphael/RAPHAEL_STANDOFF_EVAL_CONTRACT.md`;
`raphaelStandoffEvalCases.js` **8/8**; smoke install
`__RAPHAEL_STANDOFF_EVAL__`. Owner success-definition ack still required
before RS-2. Original pack text kept below.

### (archived) RS-1 — Standoff eval contract (emotion／retreat ≠ DPS)

- **Goal:** define sealed success criteria for rift standoff: telegraph
  readability, four non-punishing endings, fatigue withdraw respected,
  “retreat affirmed” language. Explicitly reject HP／combo framing.
- **Recommended model:** **Codex or Cursor** (docs-first). Jobs lens to say no
  to traditional combat skill installs.
- **Allowed files:** `docs/raphael/` standoff contract section or new
  `docs/raphael/RAPHAEL_STANDOFF_EVAL_CONTRACT.md` `[NEW]`,
  `docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md`,
  optional harness stub under `src/ai/testHarness/` or `docs/qa/` `[NEW]`,
  `docs/agent/AI_EXECUTION_LEDGER.md`.
- **Forbidden files:** installing Godot／AAA combat skills; rewriting
  `battleEngine.js` numbers in this pack; GROUNDWORK.
- **Verification plan:** `git diff --check`; contract cross-links to
  `battleEngine.js`／`battleController.js` behaviours that already exist;
  every claim without a harness marked NOT VERIFIED.
- **Human gate:** REQUIRED — Owner confirms “stabilize rift” success definition.
- **Required reading:** `RAPHAEL_TRAINING_OPS_PLAYBOOK.md`,
  `docs/agent/PRODUCT_QUALITY_FUN_FACTOR_AUDIT.md` (standoff section),
  `src/engine/battleEngine.js`.

## RA-3 — Install `raphael-autonomy-eval` skill — ✅ DONE 2026-07-20

Completed: skill installed at `%USERPROFILE%\.codex\skills\raphael-autonomy-eval\`
(`SKILL.md`, `agents/openai.yaml`, `references/evaluation-contract.md`,
`scripts/run_eval.py`). Local run: **30/30** + Nuwa advisory `trusted:false`
(`hardGateOk=true`). No `src/**` runtime change. Original pack text kept below.

### (archived) RA-3 — Install `raphael-autonomy-eval` skill (planned)

- **Goal:** mirror `raphael-conversation-eval` for initiative／autonomy gates.
  Skill lives under `%USERPROFILE%\.codex\skills\raphael-autonomy-eval\`.
- **Allowed files:** skill directory only + ledger pointer; no runtime until
  RA-1／RA-2 evidence exists.
- **Forbidden files:** all `src/**` unless a follow-up pack grants them.
- **Human gate:** REQUIRED before `npx skills` or skill scaffold lands.
- **Depends on:** RA-1.

## RS-2 — Light standoff intent advisory — ✅ DONE 2026-07-20

Completed: Nuwa bundle **v0.8.0** adds `standoffHeuristics` + three standoff
mental models; `getNuwaStandoffAdvisory()` exposes gated `trusted:false` read
path; standoff eval gains RS2-NUWA-001..003 + RS2-ALIGN-001. **No battleEngine
numeric changes.** Original pack text kept below.

### (archived) RS-2 — Light standoff intent advisory (planned)

- **Goal:** intent naming／companion reaction heuristics as advisory only;
  combat numbers stay in `battleEngine.js`.
- **Depends on:** RS-1.

## RS-3 — Install `raphael-standoff-eval` skill — ✅ DONE 2026-07-20

Completed: skill installed at `%USERPROFILE%\.codex\skills\raphael-standoff-eval\`
(`SKILL.md`, `agents/openai.yaml`, `references/evaluation-contract.md`,
`scripts/run_eval.py`). Local run: **12/12** + Nuwa standoff advisory
`trusted:false`. Skill lives outside git (same pattern as RA-3).

### (archived) RS-3 — Install `raphael-standoff-eval` skill (planned)

- **Goal:** sealed standoff evaluator skill; ban traditional combo／hitbox skills.
- **Depends on:** RS-1.

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

## TP-3 — Eval-only pack: Nuwa fixture extension + eval-shape alignment — ✅ DONE 2026-07-10

Completed earlier: Nuwa rhythm fixtures + `personaBoundaryEvalCases.js`.
Preferred wording-shape (`expectedTone` / `mustInclude` / `mustAvoid`) was
the residual gap — closed by **TP-WQ1** below (2026-07-20), not by redoing
TP-3 fixtures.

## TP-WQ-GATE — Wire wording-quality into web-release-gate — ✅ DONE 2026-07-20

- **Goal:** TP-WQ1 runner must not be optional — every PR to `main` runs
  `docs/qa/_run_wording_quality.py` inside `run_existing_browser_gates`.
- **Allowed files:** `docs/qa/_run_web_release_gate.py`, queue / ledger /
  coverage matrix notes.
- **Forbidden:** runtime Soul Talk packs, holdout wording, battleEngine,
  GROUNDWORK.
- **Verification:** wording runner 8/8 standalone; release-gate includes
  `wording_quality` browser step; `git diff --check`.

## TP-WQ1 — Wording-quality harness v1 + Daily Presence de-meta — ✅ DONE 2026-07-20

- **Goal:** close coverage-matrix §3.6 — implement preferred eval case shape
  and remove the most bot-like meta fallbacks in daily grounded lines.
- **Allowed files:** `src/ai/eval/wordingQualityAssert.js` `[NEW]`,
  `src/ai/testHarness/wordingQualityEvalCases.js` `[NEW]`,
  `docs/qa/_run_wording_quality.py` `[NEW]`, `src/ai/nlu/nluReplyBuilder.js`
  (de-meta only), `src/ai/raphaelCore.js` (smoke install wire only),
  `src/ai/testHarness/dialogueLoopSmokeCases.js` (meta ban sync), coverage
  matrix / queue / ledger.
- **Forbidden:** holdout wording → packs; save/schema; safetyShield; LLM API.
- **Verification:** `_run_wording_quality.py` 8/8; dialogue-loop + stage4
  regression; `git diff --check`.

## TP-4 — i18n fill: sc/jp for the 53 EN keys — ✅ DONE 2026-07-06 / 查證 2026-07-14

Completed: `src/i18n/strings.js` 現有 **252 keys × 4 語言（tc/sc/en/jp）零缺漏**。
驗證：`docs/qa/verify_i18n_strings.mjs`（本輪新增）。
殘餘：日文/簡中**語氣人工校對**仍待人核（非缺 key）。
原 pack 文字保留如下供紀錄。

### (archived) TP-4 — i18n fill: sc/jp for the 53 EN keys (cheap-model candidate)

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
