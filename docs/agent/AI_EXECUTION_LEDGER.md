# Nexus Link Cross-AI Execution Ledger

## Purpose

This is the single operational handoff record for every collaborating AI.
It is not product canon, a substitute for code review, or a release approval.
The Master Canon, `AGENTS.md`, `CLAUDE.md`, and `ACCEPTANCE.md` remain higher
authority documents.

Use this ledger to answer four questions without reconstructing history from
chat transcripts or unrelated Git commits:

1. What is currently implemented in this worktree?
2. What was verified, on which branch and commit?
3. What problems, risks, or blockers remain?
4. What is the next safe action for the next AI?

## Mandatory Protocol

Before starting a TASK_PACK:

1. Read the latest entry in the relevant lane.
2. Read every document named in that entry's `Required reading` field.
3. Treat remote-branch evidence as unintegrated until the current `HEAD` or
   checked-out worktree proves otherwise.

Before completing a TASK_PACK or reporting a blocker:

1. Append a new entry to each affected lane. Do not delete historical entries.
2. Record work performed, verification, problems, and the next safe action.
3. State the branch and commit. Do not claim runtime integration from a design
   document, a remote branch, or an unverified test report.
4. Link only the relevant files. Do not mix engineering status, art status,
   and Raphael status into a single ambiguous entry.

For a long-running task, append an `IN PROGRESS` entry before editing. For a
short task, one final `VERIFIED`, `COMPLETED`, or `BLOCKED` entry is enough.

Allowed status values: `PLANNED`, `IN PROGRESS`, `VERIFIED`, `COMPLETED`,
`BLOCKED`, `SUPERSEDED`.

## Entry Template

```md
### YYYY-MM-DD - <agent> - <short task name>

- Status: `VERIFIED`
- Branch / commit: `<branch>` / `<commit or uncommitted>`
- Scope: <bounded task and lane-specific ownership>
- Work performed: <what changed or what was inspected>
- Verification: <commands, browser path, screenshots, or review evidence>
- Problems / risks: <known limitations, conflicts, or blockers>
- Next safe action: <one bounded task; name GROUNDWORK approval if required>
- Required reading: <files the next AI must read>
```

---

## Lane 1 - Game Engineering And Architecture

### 2026-06-28 - Codex - Package 1-9 Required Fix Pass

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / required-fix commit pending; previous package baseline was `8d19e96`
- Scope: Fix Package 1-9 release-blocking issues that Codex can resolve in repo. Touched state normalization, panel accessibility, QA runners, release evidence, and checklist only. No assets, no external dependency, no storage key change, no desktop wrapper, no external LLM, no fetch, and no product scope expansion.
- Work performed: Added `meet` to valid onboarding statuses so the first-session Guidance -> Meet step survives normalization. Added a regression case to `docs/qa/state-onboarding-migration-cases.mjs`. Updated `src/ui/panelManager.js` so closed/inactive panels are `hidden`/`inert` and only the active panel remains focusable. Restored `aria-hidden` focus leakage as a hard web-release gate. Updated the web-release runner to complete the fresh onboarding flow before probing Home/Soul Talk, and fixed the live UI gate to ignore `#status-text` when it is inside a hidden panel.
- Verification: `node --check src/state/store.js`; `node --check src/ui/panelManager.js`; `python -m py_compile docs/qa/_run_web_release_gate.py docs/qa/_run_live_playtest_gate.py`; `git diff --check`; `node docs/qa/state-onboarding-migration-cases.mjs` -> 8/8; `python docs/qa/_run_web_release_gate.py` -> 9/9 automated required gates pass, with 0 accessibility warnings.
- Problems / risks: Human-only gates remain: real mobile device check, moderated 3-person private test, and legal/privacy/store-copy review. These cannot be completed by Codex and must not be marked as passed without human evidence.
- Next safe action: Commit and push the required-fix pass. Then run the local server for real-phone testing at the LAN URL and collect human private-test evidence before any Package 10 desktop-wrapper ADR.
- Required reading: `docs/qa/WEB_RELEASE_EVIDENCE.md`, `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`, Package 3/4/9 ledger entries, and `AGENTS.md`.

### 2026-06-28 - Codex - Web Release Gate / Private Test Pack Completion

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / Package 9 commit pending; baseline before this package was `a667853`
- Scope: Package 9 engineering/release side only. Added the web release checklist, private-test script, release evidence record, and read-only web release gate runner. No runtime behavior changes, no `src/**` product code changes, no state schema or storage-key changes, no `assets/**` changes, no dependency, no desktop wrapper, and no Steam build.
- Work performed: Added `docs/qa/_run_web_release_gate.py` to orchestrate JS syntax, save/onboarding migration, asset integrity, Raphael restricted-agent cases, responsive browser probe, and existing Raphael/browser gates. Added `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`, `docs/testing/PRIVATE_TEST_SCRIPT.md`, and `docs/qa/WEB_RELEASE_EVIDENCE.md`.
- Verification: `python -m py_compile docs/qa/_run_web_release_gate.py`; `git diff --check`; `python docs/qa/_run_web_release_gate.py` -> 9/9 automated required gates pass. JS syntax 168 files / 0 failures; migration 7/7; asset integrity pass; Raphael restricted-agent 7/7; Raphael smoke 17/17; NLU 8/8; Stage 4 10/10; live UI gate Soul Talk 10/10 and HUD 13/13.
- Problems / risks: Responsive probe reports focusable controls inside `aria-hidden` scope in both 390x844 and 1280x900 viewports. This is recorded as a manual accessibility follow-up warning, not fixed in Package 9 because this package is QA/release-only. Public release remains blocked on real-device, moderated private-test, legal/privacy, and accessibility follow-up evidence.
- Next safe action: If human approves, commit and push Package 9 files only. Next package after web/private-test approval is Package 10 Desktop Wrapper ADR; do not start wrapper work before the pending human gates are accepted.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `docs/testing/MANUAL_TEST_CHECKLIST.md`, `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `docs/qa/state-onboarding-migration-cases.mjs`, `docs/qa/_run_live_playtest_gate.py`, and Package 8 ledger entries.

### 2026-06-28 - Codex - Web Release Gate / Private Test Pack

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a667853`, uncommitted QA / RELEASE pack
- Scope: Package 9 engineering/release side only. Build a repeatable web release gate around existing browser, mobile viewport, save migration, asset integrity, Raphael, and accessibility checks. No runtime behavior changes, no state schema or storage-key changes, no `assets/**` changes, no dependency, no desktop wrapper, no Steam build, and no external service requirement.
- Work performed: Started after human approval to continue. Current worktree has only pre-existing untracked QA output files from prior gates.
- Verification: Pending web-release runner, local HTTP browser gate, state migration, asset integrity, accessibility probe, Raphael smoke, NLU, Stage 4, live UI gate, and evidence doc review.
- Problems / risks: This package must not overclaim final real-device approval if the current run is local/desktop only; private human test evidence must remain a checklist until humans fill it.
- Next safe action: Add docs/testing checklists, `docs/qa/WEB_RELEASE_EVIDENCE.md`, and a docs-only QA runner that orchestrates existing gates without modifying product runtime.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `docs/testing/MANUAL_TEST_CHECKLIST.md`, `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `docs/qa/state-onboarding-migration-cases.mjs`, `docs/qa/_run_live_playtest_gate.py`, and Package 8 ledger entries.

### 2026-06-27 - Codex - Raphael Restricted Habitat Agent

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `43100c0`, uncommitted AI_AGENT / EXPERIENCE / SAFETY pack
- Scope: Package 8 engineering side only. Add a restricted, serializable Raphael habitat-agent intent layer and runtime-owned reducer path around existing Soul Talk, touch, Return Echo, habitat-change, exploration, and standoff events. No state schema or storage-key change, no `saveManager.js`, no external LLM, no fetch, no tool registry, no auto-navigation, no automatic flow opening, and no direct store import or mutation from agent code.
- Work performed: Started after human approval. Current context read confirmed RaphaelCore external gateway is disabled by default and existing Soul Talk writes state only through the current store update path.
- Verification: Pending JS syntax checks, restricted intent whitelist harness, forbidden-action/source scan, Raphael smoke, NLU smoke, Stage 4 playtest harness, and live UI gate.
- Problems / risks: The adapter must not duplicate existing Soul Talk chat/memory/trace writes, and event observation must stay presentational rather than becoming proactive prompts or tasks.
- Next safe action: Implement adapter/reducer and minimal runtime presentation hooks without modifying save schema, protected assets, or release/desktop docs.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`, `docs/raphael/RAPHAEL_CONSTITUTION.md`, `src/ai/raphaelCore.js`, `src/ai/autonomy/actionPolicy.js`, `src/ui/soulTalkController.js`, and `src/app.js`.

### 2026-06-27 - Codex - Raphael Restricted Habitat Agent

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for Package 8 commit/push
- Files touched: `src/ai/autonomy/actionPolicy.js`, `src/ai/raphaelAgentAdapter.js`, `src/engine/raphaelIntentReducer.js`, `src/ui/soulTalkController.js`, `src/app.js`, `src/ai/raphaelCore.js`, `src/ai/testHarness/raphaelAgentEventCases.js`, `styles/raphael-agent-presence.css`, `docs/agent/AI_EXECUTION_LEDGER.md`.
- Work performed: Added restricted habitat-agent action policy, serialized Raphael intent adapter, runtime-owned intent reducer, event-case harness, and minimal runtime presentation hooks for Soul Talk, touch, Return Echo, habitat trace changes, exploration, and standoff state changes. The agent code does not import store, does not call `updateState`, does not expose state patches, and does not call fetch, external LLM, tool registry, navigation, or flow-opening APIs.
- Verification: JS `--check` passed for all changed JS. `runRaphaelAgentEventCases()` passed 7/7, including safety-exit memory/trace blocking and forbidden `navigateTo` rejection. `git diff --check` passed. Raphael core smoke passed 17/17, NLU smoke passed 8/8, Stage 4 human playtest passed 10/10, and live UI gate at 390x844 passed with summary `ok=true` and console error count 0.
- Problems / risks: No blocking Package 8 issue remains. Existing runner output files under `docs/qa/_live_playtest_gate_output.json` and `docs/qa/_nlu_smoke_output.json` remain untracked and intentionally excluded from the package.
- Next safe action: Commit and push Package 8 only, excluding unrelated untracked QA output files. Package 9 should begin only after human approval because it is the Web Release Gate / Private Test Pack.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-27 - Codex - Illustrated Runtime Asset Audit

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `d613de9`, uncommitted GROUNDWORK / ART QA pack
- Scope: Package 7 engineering side only. Audit and enforce active illustrated companion manifest policy, sheet dimensions, texture sampling intent, anchor handling, and static fallback rendering. No `assets/**` file changes, no state schema or storage-key changes, no `saveManager.js`, no dependency, backend, build-step, or Raphael behavior changes.
- Work performed: Started after human approval. Root-relative manifest audit found the six active animated runtime manifests present and dimension-compliant. Runtime mismatch found: global canvas CSS was still forcing pixelated rendering.
- Verification: Pending syntax checks, dimension audit rerun, runtime/browser smoke, protected-root diff check, and staged-set review.
- Problems / risks: Loader validation must not break accepted manifests; texture policy must remain defensive across Pixi v8 property differences; final companion placement snap must remain intact.
- Next safe action: Finalize code/docs-only Package 7 changes and verify before committing/pushing this package only.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `src/data/assetManifest.js`, `src/pixi/spriteSheetAnimationLoader.js`, `src/pixi/companionRenderer.js`, and `styles.css`.

### 2026-06-27 - Codex - Illustrated Runtime Asset Audit

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for Package 7 commit/push
- Files touched: `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `src/data/assetManifest.js`, `src/pixi/spriteSheetAnimationLoader.js`, `src/pixi/companionRenderer.js`, `styles.css`, and `docs/agent/AI_EXECUTION_LEDGER.md`. No `assets/**`, `index.html`, `src/state/**`, `saveManager.js`, `src/ai/**`, dependencies, backend, or build-step files were modified.
- Work performed: Centralized active illustrated runtime companion asset policy and manifest roots; added runtime loader enforcement for `<=4096px` sheet edges, exact grid dimensions, bottom-center anchors, linear/mipmap texture policy intent, and non-pixelated animated sprite rendering; changed static fallback companion rendering away from `roundPixels`; removed global canvas `image-rendering: pixelated` from the runtime CSS.
- Verification: Bundled Node syntax checks passed for `src/data/assetManifest.js`, `src/pixi/spriteSheetAnimationLoader.js`, and `src/pixi/companionRenderer.js`. Active root-relative manifest audit passed for six active animated companions: 179 animation definitions and 171 unique sheets, all exact grid, `<=4096px`, and bottom-center where declared. `git diff --check` passed; `git diff --cached --name-only` was empty; `git status --short -- assets` and protected runtime-ready root checks returned empty. Chrome headless 390x844 and 1280x900 smokes passed with one canvas, `image-rendering:auto`, visible Greyshade sprite-sheet mode, `idle_calm`, anchor `0.5/1`, `roundPixels=false`, metadata loaded, no missing `idle_calm`, no animation errors, no policy warnings, no blocking console errors, and screenshots captured to the local temp directory. Package 3 migration runner still passed 7/7.
- Problems / risks: No blocking Package 7 issue remains. Existing `roundPixels=true` in `src/pixi/pixiApp.js` scene sprites and `src/pixi/habitatTraceRenderer.js` trace containers was intentionally not changed because it is outside illustrated companion rendering. Real-device visual approval remains Package 9.
- Next safe action: Commit and push Package 7 only, excluding unrelated untracked QA output files. Then open Package 8 only after human approval because it touches Raphael agent behavior and safety gates.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - First Trace / Return Echo Loop

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `3e0c466`, uncommitted EXPERIENCE pack
- Scope: Package 6 only. Make First Trace and Return Echo visible as one relationship loop by wiring existing trace, return, and Soul Talk paths. No state schema, storage-key, `saveManager.js`, asset, dependency, backend, build-step, or safety-core changes.
- Work performed: Started after human approval. Current read confirmed Soul Talk already writes memory and traces through `applyRaphaelCoreResult`, while app boot currently uses generic return greetings instead of trace-aware `buildReturnBehavior`.
- Verification: Pending implementation, syntax checks, return/trace no-duplicate checks, high-risk safety non-reward check, and browser smoke.
- Problems / risks: Duplicate memory or trace writes would corrupt relationship evidence; return copy must remain non-punitive; high-risk safety input must not create ordinary memory, trace, or bond reward.
- Next safe action: Wire trace-aware Return Echo through `src/app.js` and make the first created trace legible through the existing Soul Talk/store path without introducing new persistence schema.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `src/engine/returnBehaviorEngine.js`, `src/engine/habitatTraceEngine.js`, `src/engine/traceVisualMapper.js`, `src/pixi/habitatTraceRenderer.js`, `src/ui/soulTalkController.js`, and `src/app.js`.

### 2026-06-25 - Codex - First Trace / Return Echo Loop

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, awaiting human approval before commit/push
- Files touched: `src/app.js`, `src/engine/returnBehaviorEngine.js`, `src/ui/soulTalkController.js`, `docs/agent/AI_EXECUTION_LEDGER.md`. No state schema, storage key, `saveManager.js`, assets, dependencies, backend, build step, or safety-core files were modified.
- Work performed: Wired `buildReturnBehavior` into app boot so Return Echo prefers real visible habitat traces before generic presence/greeting fallback. Replaced directly used Return Echo copy with clear non-punitive Chinese. Added a short `lastSeenAt` gate so old traces do not retrigger Return Echo on immediate reload. Made First Trace legible through the existing Soul Talk/store path with a system line that explicitly says it is not a reward. Moved first awakening behind RaphaelCore safety/edge checks and deferred ordinary memory/trace for the same first-awakening turn, so fresh first Soul Talk writes one trace instead of double-writing.
- Verification: Bundled Node syntax checks passed for `src/app.js`, `src/engine/returnBehaviorEngine.js`, and `src/ui/soulTalkController.js`. Deterministic return/trace checks passed: trace-aware return metadata is present, short reload does not echo, normal Soul Talk creates one memory/trace, and high-risk RaphaelCore input creates 0 memory/trace and no bond reward. Chrome headless CDP smoke at 390x844 passed: trace-aware Return Echo preview visible, First Trace creates exactly 1 memory and 1 trace with the system line, high-risk browser Soul Talk creates 0 memory/trace and keeps bond at 5, screenshots captured in memory, and blocking console count is 0. Raphael core smoke passed 17/17, NLU smoke passed 8/8, Stage 4 playtest harness passed 10/10, state onboarding migration runner passed 7/7, `git diff --check` passed, and touched-runtime red-line wording scan returned 0 hits.
- Problems / risks: No blocking Package 6 issue remains. `runEvolutionEval()` still reports an existing `repeated_critic_failure` pattern even though its core smoke portion passes 17/17; the evidence is in RaphaelCore critic specificity for dependency/recall/fatigue replies and is outside this package's touched files.
- Next safe action: Human review. If accepted, commit and push Package 6 only, excluding unrelated untracked QA output files.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - Explore / Care / Growth / Memory full pages

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `0d27368`, uncommitted GROUNDWORK + EXPERIENCE pack
- Scope: Package 5 only. Convert the four core bottom-nav destinations from primary action-sheet modals into true content pages while preserving existing action handlers as fallbacks. This touches `index.html` and is therefore Groundwork-approved by the human. No state schema, storage-key, `saveManager.js`, Pixi renderer, asset, dependency, backend, or build-step changes.
- Work performed: Started after human approval. Current read confirmed the existing bottom nav is bound by `actionSheetController`, `page-content.css` is reserved for this work, and `page-full-nav.css` already styles the persistent nav.
- Verification: Pending implementation, syntax checks, migration runner, semantic scan, and static route smoke.
- Problems / risks: Existing map/codex/action-sheet entry points must not break; pages must not become RPG map expansion, feeding/gift economy, power-grind growth, fake memory, or modal-with-X semantics.
- Next safe action: Add a page layer and `pageRouter.js`, route bottom nav to pages, and keep existing action-sheet commit behavior available for page buttons.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `src/ui/actionSheetController.js`, `src/ui/mapController.js`, `src/ui/codexController.js`, and `index.html`.

### 2026-06-25 - Codex - Explore / Care / Growth / Memory full pages

- Status: `COMPLETED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, awaiting human approval before commit/push
- Files touched: `index.html`, `src/app.js`, `src/ui/actionSheetController.js`, `src/ui/pageRouter.js`, `styles/page-content.css`, `docs/agent/AI_EXECUTION_LEDGER.md`. `src/ui/mapController.js` and `src/ui/codexController.js` were read and reused through existing public open paths, but not modified.
- Work performed: Added a non-modal `page-layer` with true Explore, Care, Growth, and Memory page surfaces. Added `pageRouter.js` to route bottom nav away from the old primary action-sheet flow while preserving action-sheet fallback APIs. Page buttons reuse existing map, codex, Soul Talk, and action effect/store-save paths instead of directly mutating state. Explore stays Moonlake-first, Care avoids exchange/economy verbs, Growth presents relationship chapters, and Memory renders only saved `memories`, `emotionalMemories`, and `habitatTraces`.
- Verification: `node --check src/app.js`, `node --check src/ui/actionSheetController.js`, `node --check src/ui/pageRouter.js`, `node docs/qa/state-onboarding-migration-cases.mjs` passed 7/7, `git diff --check` passed, forbidden commerce/FOMO/feed/power semantic scan returned 0 hits. Chrome headless smoke using local Chrome passed 390x844 and 1280x900 nav/page checks with 0 console errors and 0 page errors; active pages did not overlap bottom nav or viewport center after layout correction. Interaction smoke passed: Explore opened existing map, Care saved via existing action path, Growth saved `trust_tuning` via existing action path and opened codex, Memory opened Soul Talk reflection.
- Problems / risks: No blocking issue found. The page layer is intentionally scrollable because 390x844 low-chrome panels are height-limited to keep the companion focal zone clear. Real-device visual acceptance is still part of Package 9, not this package.
- Next safe action: Wait for human approval. If approved, commit and push Package 5 only, then present Package 6 opening plan.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - Start / Identity / Guidance / Home

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `bbf2aaf`, uncommitted GROUNDWORK + EXPERIENCE pack
- Scope: Package 4 only. Implement the first-session Start, skippable Local Identity, short Heart-Core Guidance, Greyshade first meeting, and Home gate using the Package 3 onboarding state. This touches `index.html` and is therefore Groundwork-approved by the human. No storage-key, `saveManager.js`, Pixi renderer, asset, dependency, backend, or build-step changes.
- Work performed: Started after human approval. Current read confirmed existing DOM/Pixi split, `panelManager` panel semantics, and Package 3 state fields are available for gating.
- Verification: Pending implementation, syntax checks, onboarding state smoke, `git diff --check`, and viewport/source review.
- Problems / risks: `index.html` selector regressions can break existing controllers; onboarding must not override veteran saves or Return Echo; mobile safe-area and keyboard behavior must not block first-session actions.
- Next safe action: Add isolated V3 onboarding DOM/CSS/controller wiring, preserve existing panel/data-action selectors, and verify fresh/veteran flows without changing `saveManager.js`.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `src/app.js`, `src/ui/panelManager.js`, and `index.html`.

### 2026-06-25 - Codex - Start / Identity / Guidance / Home

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `bbf2aaf`, uncommitted GROUNDWORK + EXPERIENCE pack
- Scope: Package 4 only. Added Start, skippable Local Identity, Heart-Core Guidance, Greyshade first meeting, and Home presentation using the Package 3 onboarding state. Removed visible currency markup from the quick HUD. No storage-key, `saveManager.js`, Pixi renderer, asset, dependency, backend, or build-step changes.
- Work performed: Added onboarding DOM to `index.html`, introduced `src/ui/onboardingController.js`, wired it in `src/app.js`, gated Return Echo text/animation while onboarding is incomplete, and blocked companion tap/ambient walk while the onboarding layer is active.
- Changed files: `index.html`, `src/app.js`, `src/ui/onboardingController.js`, `styles/ui-v3-tokens.css`, `styles/ui-v3-onboarding.css`, and this ledger.
- Verification: Bundled Node syntax checks for `src/app.js` and `src/ui/onboardingController.js`; Package 3 migration runner still passed 7/7; fake-DOM onboarding smoke confirmed fresh saves show onboarding and completed saves hide it; `git diff --check`; no-index whitespace checks for the three new files; local HTTP server returned 200 for `index.html`, the new CSS files, and the new controller.
- Problems / risks: Real browser visual inspection was not available in this tool context, so 390x844 Mobile Safari-style visual QA remains a human/browser gate before release acceptance. Package 5 still owns true Explore/Care/Growth/Memory pages.
- Not touched: `src/state/saveManager.js`, `src/state/store.js`, `src/state/defaultState.js`, `src/pixi/**`, `assets/**`, `tools/**`, `scripts/**`, `src/ai/**`, external dependencies, and the unrelated untracked QA output files.
- Next safe action: Human review of the GROUNDWORK diff. If accepted, commit and push this package before opening Package 5, Explore / Care / Growth / Memory page realization.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`.

### 2026-06-25 - Codex - State / Onboarding Migration

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `8b25401`, uncommitted GROUNDWORK pack
- Scope: Package 3 only. Add compatible `playerProfile` and `onboarding` state, migrate new saves to Greyshade-only unlock, preserve legacy unlocks and active companion, and add a state migration QA runner. No `index.html`, `saveManager.js`, Pixi, asset, dependency, backend, or build-step changes.
- Work performed: Started the approved GROUNDWORK package after human approval. Current read confirmed new saves still default-unlock Greyshade plus the runtime-ready council companions, while `CLAUDE.md` requires nested normalizers and a veteran-save onboarding skip heuristic.
- Verification: Pending implementation, migration runner, JavaScript syntax checks, and `git diff --check`.
- Problems / risks: `normalizeState` currently shallow-merges nested objects; `activeCompanionId` can fallback if unlock preservation is mishandled; partial or malformed old saves must remain loadable under the existing `nexusLinkR2State:v1` key.
- Next safe action: Implement the smallest state normalizers and unlock migration, then verify new, legacy, partial, and damaged save cases before reporting for human review.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`, `src/state/defaultState.js`, `src/state/store.js`, and `src/data/companionRuntimePolicy.js`.

### 2026-06-25 - Codex - State / Onboarding Migration

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `8b25401`, uncommitted GROUNDWORK pack
- Scope: Package 3 only. Added minimal `playerProfile` and `onboarding` state, changed fresh defaults to Greyshade-only unlock, preserved legacy unlocks and active companions through normalization, and added migration QA coverage. No `index.html`, `saveManager.js`, Pixi, asset, dependency, backend, or build-step changes.
- Work performed: Added deep normalizers for `playerProfile` and `onboarding`, a veteran-save heuristic based on existing play traces, active-companion preservation for legacy saves, and `docs/qa/state-onboarding-migration-cases.mjs` covering fresh, legacy, active-only legacy, partial, damaged, and veteran-trace saves.
- Changed files: `src/state/defaultState.js`, `src/state/store.js`, `src/data/companionRuntimePolicy.js`, `docs/qa/state-onboarding-migration-cases.mjs`, and this ledger.
- Verification: Bundled Node syntax checks for changed JS and the QA runner; `docs/qa/state-onboarding-migration-cases.mjs` passed 7/7 cases; `git diff --check`; `git diff --no-index --check -- NUL docs/qa/state-onboarding-migration-cases.mjs`.
- Problems / risks: This package only creates the migration foundation. Start / Identity / Guidance / Home runtime UI is still Package 4. Existing live localStorage with no play traces may still enter onboarding, which is intentional under the veteran heuristic.
- Not touched: `index.html`, `src/state/saveManager.js`, `src/pixi/**`, `assets/**`, `tools/**`, `scripts/**`, `src/ai/**`, external dependencies, storage key, and the unrelated untracked QA output files.
- Next safe action: Human review of the GROUNDWORK diff. If accepted, commit and push this package before opening Package 4, which touches `index.html` and requires a fresh Groundwork approval plan.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`.

### 2026-06-25 - Codex - Steam Demo Master Blueprint lock

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a6666c7`, uncommitted docs-only pack
- Scope: Lock the approved Steam Demo execution sequence, gates, and prohibited scope in a single repo-local blueprint. No runtime, state, asset, dependency, or release mutation.
- Work performed: Started Package 1 of the approved Steam Demo Master Blueprint.
- Verification: Pending documentation consistency review against `NEXUS_LINK_MASTER_CANON_v3.1.md`, `AGENTS.md`, `CLAUDE.md`, and `ACCEPTANCE.md`.
- Problems / risks: Existing `docs/qa/_live_playtest_gate_output.json` and `docs/qa/_nlu_smoke_output.json` are unrelated untracked user artifacts and remain untouched.
- Next safe action: Create and review the docs-only blueprint, then append the final verification record before requesting Package 2 approval.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`, and `docs/handoff/RAPHAEL_AI_HANDOFF.md`.

### 2026-06-25 - Codex - Steam Demo Master Blueprint lock

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a6666c7`, uncommitted docs-only pack
- Scope: Package 1 only. Added the repo-local Steam Demo execution blueprint and no runtime, state, asset, dependency, or release changes.
- Work performed: Added `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md` with the approved V3 visual direction, Greyshade-first first-session model, Raphael restricted habitat-agent boundary, all ten task packs, gates, and release sequence.
- Verification: `git diff --check`; `git diff --no-index --check -- NUL docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`; reviewed all ten numbered delivery sections and the explicit no-fetch/no-direct-mutation agent rule.
- Problems / risks: The blueprint is an execution contract, not approval to start Package 2 or any later package. Existing untracked QA output files remain untouched.
- Next safe action: Request human approval for Package 2, V3 Visual System Tokens; keep it docs/design-only with no `index.html`, runtime, or asset changes.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`.

### 2026-06-25 - Codex - P0-B Pixi focal-zone root-bounds fix

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `fd5d8eb` base, uncommitted P0-B fix
- Scope: Root-bounds sizing, first-paint companion animation loading, and companion focal-zone visibility. No state, asset, Raphael, or UI-controller changes.
- Work performed: Made `#game-root` bounds authoritative when non-zero, retried root measurement after initial layout, observed root resizes where the browser supports it, and reduced first-paint animation loading to visible idle/sleep frames before warming the remaining core pack.
- Verification: `git diff --check`; bundled Node syntax checks for all UI and Pixi modules; local HTTP server on port 8765; fresh-origin browser checks at 390×844, 393×852, 430×932, and 1280×800. Each had one canvas and matching root/canvas CSS dimensions. Visual checks confirmed the live Pixi greyshade cat in the focal zone at 390×844 and desktop; console errors were zero.
- Problems / risks: The in-app browser's clipboard bridge prevented a repeated browser text injection. The unchanged typed/quick-reply Raphael behavior was verified in the prior UI pack and by the deterministic Raphael smoke/dialogue harness in this task. Full cross-device human QA remains separate.
- Next safe action: Review and commit this bounded P0-B diff, then run the first-habitat cross-device QA evidence package.
- Required reading: `AGENTS.md`, `ACCEPTANCE.md`, `docs/dev/LOCAL_PREVIEW.md`, `src/pixi/pixiApp.js`, and `src/pixi/companionRenderer.js`.

### 2026-06-24 - Codex - Runtime baseline and remediation audit

- Status: `VERIFIED`
- Branch / commit: `codex/ui-v2-aurora-parity` / `4c65a40` for the audit record
- Scope: Current root vanilla JS and PixiJS runtime; no runtime patch was made.
- Work performed: Recorded Aurora B UI completion and inspected the first-habitat
  runtime against the current Master Canon.
- Verification: The audit records JavaScript syntax checks, asset-manifest
  checks, browser paths, and console checks. The current 390x844 local Home also
  boots with one Pixi canvas.
- Problems / risks: P0-B Pixi sizing can place the live companion outside the
  focal zone in constrained or letterboxed hosts. P0-A opening commitment is
  incomplete because new saves unlock all runtime-ready companions. First-habitat
  cross-device QA is not signed off on this branch.
- Next safe action: Open a separate approved GROUNDWORK TASK_PACK for P0-B
  root-bounds sizing before expanding gameplay or systems.
- Required reading: `docs/qa/NEXUS_LINK_RUNTIME_AUDIT_2026-06-24.md`,
  `docs/architecture/RUNTIME_MAP.md`, `docs/testing/MANUAL_TEST_CHECKLIST.md`,
  `ACCEPTANCE.md`.

---

## Lane 2 - Game Art, UI, And Visual Production

### 2026-06-28 - Codex - Package 1-9 Required Fix Pass

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / required-fix commit pending; previous package baseline was `8d19e96`
- Scope: UI/accessibility release-blocker cleanup only. No redesign, no new UI direction, no generated images, no asset approval/movement/deletion, and no companion visual swap.
- Work performed: Inactive modal panels are now removed from visibility and focus order, preventing invisible panel buttons/inputs from being reachable under `aria-hidden`. The web release evidence now records `PASS` for responsive/browser accessibility with 0 focusable hidden entries in 390x844 and 1280x900 probes.
- Verification: `python docs/qa/_run_web_release_gate.py` passed responsive/accessibility probes at 390x844 and 1280x900: onboarding completes, Soul Talk opens, input visible, 1 canvas, 5 nav buttons, no unlabeled buttons, no horizontal overflow, and `focusableHidden: []`. Live UI gate passed HUD 13/13.
- Problems / risks: Visual confirmation on actual phone hardware is still human-only and remains required before public release.
- Next safe action: Human should open the LAN URL on a phone on the same Wi-Fi and run the real-device checks in `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`.
- Required reading: `docs/qa/WEB_RELEASE_EVIDENCE.md`, `docs/testing/PRIVATE_TEST_SCRIPT.md`, and Package 9 ledger entries.

### 2026-06-28 - Codex - Web Release Gate / Private Test Pack Completion

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / Package 9 commit pending; baseline before this package was `a667853`
- Scope: Package 9 visual/private-test side only. Documented mobile/desktop visual review expectations, illustrated asset gate evidence, and private tester observation script. No generated images, no asset approval, no asset movement/deletion, and no V3 redesign.
- Work performed: Added private-test script and web release evidence file. The evidence records the active runtime companions checked by the runner and keeps real-device/private-tester fields as `PENDING HUMAN`.
- Verification: `python docs/qa/_run_web_release_gate.py` responsive/browser probe passed at 390x844 and 1280x900: single canvas, 5 nav buttons, Soul Talk input visible, no unlabeled buttons, no horizontal overflow. Asset integrity passed for `greyshade-cat`, `flame-flicker`, `ice-talon`, `stone-shard`, `vine-twist`, and `crystal-rabbit`.
- Problems / risks: Automated screenshots were captured to a temporary local directory for this run and are not committed. Human visual/private-test evidence still must be gathered on real devices before public release. Accessibility focus-management warning must be handled in a separate runtime task.
- Next safe action: Human can run `docs/testing/PRIVATE_TEST_SCRIPT.md` with at least 3 testers and append sanitized results to `docs/qa/WEB_RELEASE_EVIDENCE.md`.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `docs/testing/MANUAL_TEST_CHECKLIST.md`, and Package 7/8 ledger entries.

### 2026-06-28 - Codex - Web Release Gate / Private Test Pack

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a667853`, uncommitted QA / RELEASE pack
- Scope: Package 9 visual/private-test side only. Document mobile/desktop visual review, illustrated asset consistency, UI obstruction checks, and private tester prompts. No generated images, no asset approval, no asset deletion or movement, no V3 visual redesign, and no release sign-off beyond the evidence actually gathered.
- Work performed: Started after human approval to continue. Package 7 asset audit remains the source for active illustrated runtime asset status; Package 9 will reference it rather than changing assets.
- Verification: Pending visual checklist, browser screenshot/evidence runner output, and private tester script.
- Problems / risks: Human private-test fields cannot be self-filled by Codex. They must remain explicit pending evidence until real testers provide responses.
- Next safe action: Add private-test script and release evidence template with clear pending/required fields.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `docs/testing/MANUAL_TEST_CHECKLIST.md`, and Package 7/8 ledger entries.

### 2026-06-27 - Codex - Raphael Restricted Habitat Agent

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `43100c0`, uncommitted AI_AGENT / EXPERIENCE / SAFETY pack
- Scope: Package 8 UI-presence side only. Add a subtle Raphael restricted-agent presence layer for existing Soul Talk/runtime events. No new screens, no task UI, no FOMO indicator, no navigation behavior, no generated art, no `assets/**` changes, and no V3/Package 9 release styling expansion.
- Work performed: Started after human approval. The presence layer is constrained to quiet status/body-language feedback and must not override existing First Trace / Return Echo copy or become a notification system.
- Verification: Pending static CSS/JS review plus live UI gate.
- Problems / risks: Visual presence must remain non-demanding and must not read as a red dot, quest marker, or pressure prompt.
- Next safe action: Create the scoped CSS file and load it from runtime without touching `index.html`.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `src/ui/soulTalkController.js`, `src/app.js`, and the Package 8 plan.

### 2026-06-27 - Codex - Raphael Restricted Habitat Agent

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for Package 8 commit/push
- Files touched: `styles/raphael-agent-presence.css`, `src/app.js`, `src/ui/soulTalkController.js`, `docs/agent/AI_EXECUTION_LEDGER.md`.
- Work performed: Added a scoped Raphael presence stylesheet and loaded it dynamically from `src/app.js` without touching `index.html`. Presence states are subtle Soul Talk/runtime visual states only: listening, boundary, safety-exit, blocked, and quiet. No red-dot, task, quest, FOMO, generated art, asset movement, or new screen was added.
- Verification: CSS is loaded by the local runtime; live UI gate at 390x844 passed with top HUD, bottom dock, Soul Talk launcher/input, Pixi canvas, reload persistence, and console error count 0.
- Problems / risks: No blocking Package 8 UI-presence issue remains. This is not Package 9 real-device or private-test evidence.
- Next safe action: Commit and push Package 8 only, excluding unrelated untracked QA output files. Package 9 owns release evidence and private test scripts.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-27 - Codex - Illustrated Runtime Asset Audit

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `d613de9`, uncommitted ART QA pack
- Scope: Package 7 visual-production side only. Document active illustrated runtime entries, protected roots, source/readiness status, legacy preservation, and acceptance evidence. No generated images, no asset deletion, no asset movement, and no reference-audit retirement.
- Work performed: Started after human approval. Active runtime list was derived from the current registry and manifest roots: `greyshade-cat`, `flame-flicker`, `ice-talon`, `stone-shard`, `vine-twist`, and `crystal-rabbit`; `flametail-fox` remains static fallback only.
- Verification: Pending `ILLUSTRATED_RUNTIME_AUDIT.md` review, browser smoke, and protected-root diff check.
- Problems / risks: Audit wording must not overclaim final art approval; static-ready and future placeholder companions must not be promoted by documentation alone.
- Next safe action: Complete the audit doc and verify no `assets/**` changes before committing/pushing Package 7 only.
- Required reading: `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `src/data/companionRegistry.js`, `src/data/assetManifest.js`, `AGENTS.md`, and `ACCEPTANCE.md`.

### 2026-06-27 - Codex - Illustrated Runtime Asset Audit

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for Package 7 commit/push
- Files touched: `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `src/data/assetManifest.js`, `styles.css`, `src/pixi/spriteSheetAnimationLoader.js`, `src/pixi/companionRenderer.js`, and `docs/agent/AI_EXECUTION_LEDGER.md`. No runtime-ready asset roots, generated batches, legacy sheets, or static companion images were modified.
- Work performed: Added the illustrated runtime audit document with active manifest table, source/readiness status, protected roots, runtime policy, manifest-dimension evidence, browser-smoke evidence, rollback, and acceptance checklist. The audit explicitly preserves legacy Greyshade assets and does not promote placeholder/future companions.
- Verification: Current active runtime entries were derived from `src/data/companionRegistry.js` and mirrored in `src/data/assetManifest.js`. Root-relative asset audit passed for `greyshade-cat`, `flame-flicker`, `ice-talon`, `stone-shard`, `vine-twist`, and `crystal-rabbit`. 390x844 and 1280x900 Chrome screenshots were captured to the local temp directory while the companion rendered as an illustrated sprite sheet with no pixelated canvas policy. `git status --short -- assets` and protected-root checks returned empty.
- Problems / risks: No blocking Package 7 issue remains. This audit does not grant final art/license/release approval; Package 9 still owns private test and real-device evidence.
- Next safe action: Commit and push Package 7 only, excluding unrelated untracked QA output files. Package 8 must start with a new Raphael / safety opening plan.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - Explore / Care / Growth / Memory page UI

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `0d27368`, uncommitted V3 page pack
- Scope: Package 5 UI layer. Give Explore, Care, Growth, and Memory real page surfaces using the approved V3 low-chrome moonlake visual language while keeping Home as the default habitat.
- Work performed: Started after human approval. The Game UI Frontend skill is being used to protect the Pixi playfield and avoid dense dashboard/page takeover.
- Verification: Pending CSS/source review, semantic scan, and static checks.
- Problems / risks: Explore can become a world map; Care can become feeding/gifts; Growth can become combat power; Memory can fake evidence. Each page must stay evidence-based and quiet.
- Next safe action: Implement isolated page content styling in `styles/page-content.css` and keep page panels low enough to preserve the companion focal zone.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `ACCEPTANCE.md`.

### 2026-06-25 - Codex - Explore / Care / Growth / Memory page UI

- Status: `COMPLETED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, awaiting human approval before commit/push
- Files touched: `index.html`, `styles/page-content.css`, `src/ui/pageRouter.js`, `docs/agent/AI_EXECUTION_LEDGER.md`
- Work performed: Implemented V3 low-chrome page cards with mist-gold borders, moon-white copy, compact evidence strips, relationship metrics, and scrollable memory evidence rows. The first layout pass covered viewport center; self-review caught it and reduced the panels into upper low-height surfaces so 390x844 and desktop keep the center companion area open. No right-side modal close affordance was added; Home/bottom nav remains the way back to habitat.
- Verification: CSS/source review completed. Chrome headless 390x844 and 1280x900 layout smoke passed with no nav overlap, no center obstruction, and no console/page errors. Semantic scan returned 0 hits for store, currency, FOMO, task pressure, feed/gift, or power-rank wording in the touched page files.
- Problems / risks: No blocking issue found. The design intentionally prioritizes playfield protection over showing all page content at once; longer content scrolls inside the page card.
- Next safe action: Wait for human approval. If approved, commit and push Package 5, then move to Package 6 plan.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - Start / Identity / Guidance / Home visual implementation

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `bbf2aaf`, uncommitted V3 first-session pack
- Scope: Package 4 visual/UI layer. Apply the approved V3 moonlake, mist-gold, low-contrast glass direction to onboarding and Home presentation while preserving the Pixi playfield and existing HUD controllers.
- Work performed: Started after human approval. The Game UI Frontend skill is being used to keep text-heavy onboarding in DOM, protect the playfield, and avoid dense dashboard chrome.
- Verification: Pending CSS/source review, syntax checks, and viewport-oriented inspection.
- Problems / risks: Onboarding overlays can obscure the companion focal zone or become a task list. Copy must avoid dependency, therapy claims, FOMO, shop, and multi-character opening semantics.
- Next safe action: Add isolated `styles/ui-v3-tokens.css` and `styles/ui-v3-onboarding.css`, keep center playfield readable after onboarding, and defer true Explore/Care/Growth/Memory pages to Package 5.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `ACCEPTANCE.md`, and `index.html`.

### 2026-06-25 - Codex - Start / Identity / Guidance / Home visual implementation

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `bbf2aaf`, uncommitted V3 first-session pack
- Scope: Package 4 visual/UI layer. Applied isolated V3 tokens, onboarding glass panel styling, and a quiet Home presence card without changing Pixi scene assets or renderer behavior.
- Work performed: Added `styles/ui-v3-tokens.css` and `styles/ui-v3-onboarding.css`, hid old currency/resource semantics, kept text-heavy onboarding in DOM, and used restrained moonlake/mist-gold treatment from the V3 design doc.
- Changed files: `index.html`, `styles/ui-v3-tokens.css`, `styles/ui-v3-onboarding.css`, and this ledger.
- Verification: CSS/source review; no-index whitespace checks for new CSS; forbidden semantic scan for shop/FOMO/task/therapy/dependency language returned no onboarding matches; local HTTP server returned 200 for the new CSS files.
- Problems / risks: This is not final visual sign-off. Actual 390x844 and desktop screenshot review is still required with a browser surface before accepting Web Release Gate evidence.
- Not touched: runtime art assets, Pixi renderer, page router, true four-page content, and external dependencies.
- Next safe action: Human review and commit/push with the Package 4 engineering diff if accepted.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `ACCEPTANCE.md`.

### 2026-06-25 - Codex - State / Onboarding Migration selector semantics

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `8b25401`, uncommitted GROUNDWORK pack
- Scope: Package 3 selector impact only. Update companion selector semantics so new players are not presented with a multi-character opening choice, while existing unlocked companions remain reviewable/selectable after migration.
- Work performed: Started after human approval as part of the Package 3 state migration. The existing selector still renders all registry companions with locked/available cards, which risks implying a roster-collection opening.
- Verification: Pending source review and migration QA.
- Problems / risks: UI copy must not introduce gacha, collection pressure, party semantics, or shop-like acquisition language. Existing players must not lose their active companion or unlocked roster visibility.
- Next safe action: Keep selector changes minimal and policy-driven by normalized state; do not create a new page or alter `index.html`.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `src/ui/companionSelectController.js`, and `src/data/companionRuntimePolicy.js`.

### 2026-06-25 - Codex - State / Onboarding Migration selector semantics

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `8b25401`, uncommitted GROUNDWORK pack
- Scope: Package 3 selector impact only. Kept the companion selector policy-driven by normalized unlock state so fresh saves only expose Greyshade while legacy unlocked companions remain visible/selectable.
- Work performed: Filtered selector cards to active, unlocked, or selectable companions and changed the list ARIA label to relationship-oriented "已締結的夥伴". No modal structure, page routing, runtime visual styling, or `index.html` changes.
- Changed files: `src/ui/companionSelectController.js` and this ledger.
- Verification: Bundled Node syntax check for `src/ui/companionSelectController.js`; migration runner confirmed fresh non-Greyshade runtime companions are locked and legacy runtime-ready unlocks remain selectable; `git diff --check`.
- Problems / risks: The static `index.html` modal title still says "選擇同行夥伴"; changing that belongs to Package 4 because it touches `index.html`.
- Not touched: `index.html`, runtime CSS, Pixi, assets, dependency graph, and external data.
- Next safe action: Human review, then commit/push with the Package 3 state migration if accepted.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`.

### 2026-06-25 - Codex - V3 visual system tokens

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a6666c7`, uncommitted design-only pack
- Scope: Package 2 only. Define the approved V3 moonlake visual system, a static 390×844 preview, and implementation tokens. No runtime, `index.html`, asset, or dependency changes.
- Work performed: Started a design-only system derived from the user-approved moonlake, mist-gold, illustrated-companion references.
- Verification: Pending static-file review, 390×844 preview inspection, and whitespace checks.
- Problems / risks: Reference imagery contains storefront, currency, multicharacter, pressure-heavy, and dependency-oriented elements that must not be promoted into Nexus Link semantics.
- Next safe action: Create the isolated design files, verify their mobile preview, and append the final record before requesting Package 3 GROUNDWORK approval.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`.

### 2026-06-25 - Codex - V3 visual system tokens

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a6666c7`, uncommitted design-only pack
- Scope: Package 2 only. Added an isolated V3 visual-system document, CSS token file, and static preview. No runtime, `index.html`, asset, dependency, state, or build-step changes.
- Work performed: Converted the human-approved moonlake references into implementation rules for deep indigo habitat scenes, mist-gold hairlines, low-contrast glass, illustrated companion layering, moon-white typography, and the four core actions. Defined Start, Identity, Guidance, Home, Explore, Care, Growth, Memory, Return Echo, and Settings screen grammar without importing storefront, currency, FOMO, multi-character opening, RPG stat-grind, or dependency-heavy semantics.
- Changed files: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/design/v3-visual-preview.html`, `docs/design/v3-visual-tokens.css`, and this ledger.
- Verification: `git diff --check`; independent `git diff --no-index --check` for all three new design files; static text scan for forbidden semantic drift; manual source review confirmed the preview is isolated under `docs/design/` and not linked from the runtime. In-app browser visual QA for the local file was blocked by browser URL policy, so no workaround was attempted and live viewport visual QA remains deferred to a later approved runtime/local-preview gate.
- Problems / risks: The static preview is implementation guidance, not product integration. Exact live contrast, safe-area, and image-layer behavior still require Package 4 runtime verification before release-level acceptance.
- Not touched: `index.html`, `styles.css`, `styles/**` runtime files, `src/**`, `assets/**`, `tools/**`, `scripts/**`, storage, Pixi, and external dependencies.
- Next safe action: Human review of the design-only diff. If accepted, commit and push this package before opening Package 3, which is a GROUNDWORK state/onboarding migration and requires explicit approval.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`.

### 2026-06-24 - Codex - Aurora B visual parity baseline

- Status: `VERIFIED`
- Branch / commit: `codex/ui-v2-aurora-parity` / `3c91291`
- Scope: DOM HUD, Bottom Nav, Soul Talk drawer, Settings, onboarding surfaces,
  and the live Pixi scene boundary. No companion asset or renderer rewrite.
- Work performed: Completed Aurora B parity packs 1 through 8, including the
  five-zone navigation, compact Soul Talk strip and drawer, settings controls,
  and mobile visual treatment.
- Verification: The local 390x844 Home renders the Aurora HUD over one live
  Pixi canvas. The companion remains a scene entity rather than baked UI art.
- Problems / risks: Visual parity does not solve the P0-B constrained-viewport
  companion-placement issue. The current asset pipeline contains historical
  64x64 instructions that conflict with the current illustrated 512x512
  companion policy; use the animation catalog and `AGENTS.md` as the newer
  standard.
- Next safe action: After P0-B is resolved, run the first-habitat visual QA on
  390x844, desktop, and a letterboxed host before accepting additional UI work.
- Required reading: `docs/ui/NEXUS_LINK_UI_V2_HANDOFF.md`,
  `docs/qa/NEXUS_LINK_RUNTIME_AUDIT_2026-06-24.md`,
  `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `AGENTS.md`.

---

## Lane 3 - Raphael Core, Companion Reasoning, And Soul Talk

### 2026-06-28 - Codex - Web Release Gate / Private Test Pack Completion

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / Package 9 commit pending; baseline before this package was `a667853`
- Scope: Package 9 Raphael QA side only. Included current Raphael smoke, NLU, Stage 4, restricted-agent, safety/non-reward, and live Soul Talk checks in the web release gate. No RaphaelCore behavior change, no external LLM, no fetch, no tool registry, no direct state mutation policy change, and no new memory/trace reward behavior.
- Work performed: Added `docs/qa/_run_web_release_gate.py` orchestration and documented the release evidence. The private-test script uses low-risk prompts and explicitly stops on real safety concern rather than turning it into gameplay.
- Verification: `python docs/qa/_run_web_release_gate.py` passed: Raphael restricted-agent event cases 7/7; Raphael core smoke 17/17 with 0 console errors; NLU smoke 8/8 with 0 console errors; Stage 4 harness 10/10; live Soul Talk 10/10. Safety input remains non-gameplay and non-reward in the gate evidence.
- Problems / risks: Private testers must not be asked to provoke high-risk content. Public release remains blocked until human-run private testing confirms boundary/refusal is not perceived as punishment.
- Next safe action: Use `docs/testing/PRIVATE_TEST_SCRIPT.md` for moderated private testing; do not enable external LLM gateway or autonomous Raphael behaviors outside the restricted adapter policy.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/qa/RAPHAEL_CORE_JS_V1_TEST_RUNS.md`, Package 8 files, and Package 8 ledger entries.

### 2026-06-28 - Codex - Web Release Gate / Private Test Pack

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a667853`, uncommitted QA / RELEASE pack
- Scope: Package 9 Raphael QA side only. Include existing Raphael smoke, NLU, Stage 4, restricted-agent, safety, refusal/non-reward, and live Soul Talk checks in the release gate. No RaphaelCore behavior change, no external LLM, no fetch, no tool registry, no state mutation policy change, and no new memory/trace reward behavior.
- Work performed: Started after human approval to continue. Package 8 restricted habitat-agent implementation is the current baseline.
- Verification: Pending local release runner and evidence doc.
- Problems / risks: Safety outputs must be verified as non-gameplay; private-test wording must not ask testers to provoke high-risk content beyond safe, moderated scripts.
- Next safe action: Wire the release runner to existing Raphael gates and document moderated private-test prompts.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/qa/RAPHAEL_CORE_JS_V1_TEST_RUNS.md`, Package 8 files, and Package 8 ledger entries.

### 2026-06-27 - Codex - Raphael Restricted Habitat Agent

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `43100c0`, uncommitted AI_AGENT / EXPERIENCE / SAFETY pack
- Scope: Package 8 Raphael side only. Convert Raphael into a restricted habitat-agent presence by emitting serialized intents and passing them through a runtime-owned reducer. The agent may speak or stay silent, show body language, set boundaries, suggest rest/exploration without opening anything, carry controlled trace/memory metadata, and safety-exit. It may not import store, call `updateState`, mutate state directly, fetch, use external LLM, call tool registry, navigate, open flows, or push tasks.
- Work performed: Started after human approval. Current read confirmed `runRaphaelCore` already keeps external advice disabled unless explicitly enabled; Package 8 will keep that default and avoid gateway calls.
- Verification: Pending restricted agent event cases, forbidden-action/source scan, Raphael smoke, NLU smoke, Stage 4 playtest harness, and live UI gate.
- Problems / risks: Safety exits must remain 100% non-gameplay and non-rewarding; runtime event hooks must not become proactive reminders or duplicate memory/trace writes.
- Next safe action: Add adapter/reducer/harness and wire Soul Talk/app events through presentation-only runtime callbacks.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`, `docs/raphael/RAPHAEL_CONSTITUTION.md`, `src/ai/raphaelCore.js`, `src/ai/autonomy/actionPolicy.js`, `src/ai/applyCoreResult.js`, `src/ui/soulTalkController.js`, and `src/app.js`.

### 2026-06-27 - Codex - Raphael Restricted Habitat Agent

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for Package 8 commit/push
- Files touched: `src/ai/raphaelAgentAdapter.js`, `src/engine/raphaelIntentReducer.js`, `src/ai/autonomy/actionPolicy.js`, `src/ai/testHarness/raphaelAgentEventCases.js`, `src/ui/soulTalkController.js`, `src/app.js`, `src/ai/raphaelCore.js`, `docs/agent/AI_EXECUTION_LEDGER.md`.
- Work performed: Raphael now emits restricted serialized habitat-agent intents for Soul Talk, touch, Return Echo, habitat changes, exploration results, and standoff results. The reducer rejects forbidden keys such as navigation, panel opening, task push, tool call, fetch, direct state mutation, state patch, and reward grant. Safety exits block agent memory/trace metadata and suggestions. Soul Talk suppresses duplicate speech/animation because the existing RaphaelCore application path already writes chat, memory, trace, and animation decisions through the store.
- Verification: New event harness passed 7/7. Forbidden-key injection was rejected. High-risk safety intent produced `safetyExit=true`, no memory, no trace, and no suggestion. Raphael smoke passed 17/17, NLU smoke passed 8/8, Stage 4 passed 10/10, live UI gate passed with console error count 0.
- Problems / risks: No blocking Package 8 Raphael issue remains. Existing optional external gateway modules are still present in the repo but were not enabled or called; Package 8 keeps gateway behavior disabled and local-only.
- Next safe action: Commit and push Package 8 only, excluding unrelated untracked QA output files. Package 9 can start after human approval.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - First Trace / Return Echo Loop

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `3e0c466`, uncommitted EXPERIENCE pack
- Scope: Package 6 Raphael/Soul Talk surface only. Keep RaphaelCore safety and memory policy intact while making the first non-safety trace visible to the player through existing Soul Talk flow. No external LLM, fetch, tool registry, auto-navigation, direct state mutation outside the existing store update path, or safety reward behavior.
- Work performed: Started after human approval. Current read confirmed `memoryWriter` blocks high-risk safety and dependency pressure from ordinary memory, while `applyRaphaelCoreResult` already blocks non-rewarding modes from milestones.
- Verification: Pending syntax checks, deterministic safety input check, no duplicate trace check, and browser Soul Talk smoke.
- Problems / risks: First Trace messaging must not become a reward, achievement, task prompt, or dependency pressure. Safety exits must stay non-gameplay and non-rewarding.
- Next safe action: Add only presentation-level first-trace acknowledgement after existing trace creation, gated so it never fires for high-risk safety or non-rewarding modes.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `src/ai/raphaelCore.js`, `src/ai/memoryWriter.js`, `src/ai/safetyShield.js`, `src/ai/applyCoreResult.js`, and `src/ui/soulTalkController.js`.

### 2026-06-25 - Codex - First Trace / Return Echo Loop

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, awaiting human approval before commit/push
- Files touched: `src/ui/soulTalkController.js`, `src/app.js`, `src/engine/returnBehaviorEngine.js`, `docs/agent/AI_EXECUTION_LEDGER.md`.
- Work performed: Kept RaphaelCore, `memoryWriter`, safety shield, and `applyCoreResult` policy intact. Soul Talk now waits for RaphaelCore safety/edge classification before allowing first awakening; safety or boundary turns defer awakening and do not write relationship evidence. When first awakening is the first trace of the turn, ordinary emotional memory/trace from the same message is deferred to avoid double-writing. First Trace visibility is added as a quiet system line only after an allowed trace is created through the existing store path.
- Verification: High-risk deterministic RaphaelCore input returned `safety_redirect`, system role, 0 memory, 0 trace, and unchanged bond. Browser CDP smoke confirmed the same behavior through the live Soul Talk UI on a fresh save: 0 memory, 0 trace, bond 5, `safeHarborMode` true. Normal first Soul Talk created exactly one first trace and showed the non-reward system line. Raphael core smoke passed 17/17, NLU smoke passed 8/8, Stage 4 playtest harness passed 10/10.
- Problems / risks: No Package 6 blocking issue remains. The remaining `runEvolutionEval()` false is an existing critic-pattern finding in RaphaelCore reply specificity, not a safety failure and not caused by this presentation/controller package.
- Next safe action: Human review, then commit/push Package 6 only if accepted. Package 7 should start only after commit/push approval and must be opened as a new ART QA / GROUNDWORK plan.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - Raphael × Aurora UI v2 integration pack 1

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `7ff11a4` base, uncommitted scoped integration
- Scope: Selective Aurora shell, HUD, five-zone navigation, Soul Talk strip, and drawer port. No source-branch merge or RaphaelCore change.
- Work performed: Added Aurora-only CSS layers and DOM structure; added Home navigation and persistent-nav behavior; added Soul Talk drawer name, collapse state, and mobile viewport focus handling. Preserved the main Raphael message pipeline and quick-reply DOM.
- Changed files: `index.html`, Aurora CSS files under `styles/`, `src/ui/actionSheetController.js`, `src/ui/panelManager.js`, `src/ui/soulTalkController.js`, local preview and future-prototype/packaging documents, and this ledger entry.
- Verification: `git diff --check`; bundled Node `--check` for all changed JavaScript; local browser on port 8765 at 390×844, 393×852, 430×932, and 1280×800; one canvas, five nav items, non-overlapping strip/nav, drawer open/close, typed Raphael response, quick-reply Raphael response, and zero console errors.
- Problems / risks: The existing P0-B constrained-viewport Pixi companion focal-zone issue remains outside this package; UI work is not a renderer fix or release sign-off. Full settings/onboarding and `nexuslink_v2` persistence were intentionally deferred.
- Not touched: `src/ai/**`, `src/state/**`, Pixi renderer, assets, tools, scripts, UI locale, settings/onboarding controllers, source UI handoff/audit documents, and QA output files.
- Next safe action: Human review of the scoped diff, then a separate approved P0-B renderer-sizing package before release-level UI acceptance.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/dev/LOCAL_PREVIEW.md`, and this lane.

### 2026-06-24 - Codex - Raphael integration reconciliation audit

- Status: `BLOCKED`
- Branch / commit: `codex/ui-v2-aurora-parity` / `e0a06d6`; canonical remote
  `origin/main` / `5eb33fb`
- Scope: Compared the checked-out runtime, current remote main, the Stage 4
  feature branch, and GitHub Pages. No Raphael code was copied, merged, or
  modified.
- Work performed: Confirmed this worktree has no `src/ai/**` Raphael runtime
  modules. Its Soul Talk uses the local emotion engine and `soulTalkComposer`
  response packs. Confirmed `origin/main` contains RaphaelCore, wires it into
  Soul Talk, and has a post-PR #87 sign-off at `5eb33fb`.
- Verification: The current local 390x844 runtime has no Raphael module import,
  no Raphael globals, and no quick-reply chips. GitHub Pages boots with one
  Pixi canvas, exposes the Soul Talk quick-reply region after a message, returned
  a local Raphael reply for `today is tiring`, and reported zero console errors.
- Problems / risks: `origin/main` is not an ancestor of this branch, so Raphael
  is deployed on canonical main but is not integrated into this UI branch. The
  Raphael handoff also names a different checkout as its active workspace and
  identifies this checkout as prone to divergence. Treat that as a repository
  reconciliation issue, not permission to overwrite this user-directed branch.
  The
  Raphael Constitution is local-first, but remote Raphael code includes optional
  external gateway and provider-adapter scaffolding. No live external call was
  verified; the scaffolding still needs a no-LLM/no-backend policy review before
  any reconciliation merge. The root Master Canon still describes Raphael as
  DRAFT and unintegrated, so its implementation-status wording requires a
  separately approved documentation sync.
- Next safe action: Create a dedicated Raphael reconciliation TASK_PACK. Select
  the local-only baseline, exclude external gateway/provider code, map state and
  UI changes, and request GROUNDWORK approval before integrating it here.
- Required reading: `docs/raphael/RAPHAEL_CONSTITUTION.md`,
  `NEXUS_LINK_MASTER_CANON_v3.1.md`, `AGENTS.md`, and after `git fetch`,
  `origin/main:docs/handoff/RAPHAEL_AI_HANDOFF.md`,
  `origin/main:docs/architecture/RAPHAEL_CORE_JS_V1.md`,
  `origin/main:docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`,
  `origin/main:docs/qa/RAPHAEL_CORE_JS_V1_TEST_RUNS.md`.
