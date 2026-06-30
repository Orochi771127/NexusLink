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

### 2026-06-28 - Codex - UI/HUD Claude Code Handoff

- Status: `COMPLETED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `25b9944`, handoff docs uncommitted
- Scope: Documentation-only handoff for Claude Code to continue HUD/UI V2 architecture work. No runtime code, no assets, no state, no storage schema, no Raphael behavior, no dependency, and no build step changed.
- Work performed: Added `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md` with current architecture map, file ownership, controller responsibilities, known fixed items, unresolved issues, acceptance criteria, and non-goals. Added `docs/handoff/CLAUDE_CODE_UI_HUD_TAKEOVER_PROMPT.md` as a paste-ready instruction for Claude Code.
- Verification: Documentation paths are inside the repo and readable/writable by Claude Code in this workspace. `git diff --check` should be run before any later commit.
- Problems / risks: This does not fix the listed UI/HUD issues; it only hands them off. Known unresolved items include mojibake in UI copy, incomplete V2 parity, CSS ownership fragmentation, real-device Safari fit, and non-persisted Settings volume ranges.
- Next safe action: Human can paste the prompt file contents to Claude Code together with the V2 design files. Claude Code should submit a plan before touching `index.html` or other Groundwork files.
- Required reading: `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md`, `docs/handoff/CLAUDE_CODE_UI_HUD_TAKEOVER_PROMPT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and the supplied V2 design handoff/screenshots.

### 2026-06-28 - Codex - Mobile UI v2 HUD/Icon Optimization

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for commit/push
- Scope: Mobile HUD and settings-volume refinement based on the user-supplied UI v2 references and phone screenshot. Touched only runtime HTML/CSS plus the existing in-memory audio manager/settings controller path. No `assets/**`, no `src/state/**`, no `saveManager.js`, no storage-key/schema change, no Pixi renderer change, no Raphael behavior change, no external dependency, no build step, and no generated image work.
- Work performed: Removed the standalone HUD speaker button so audio control lives in Settings; wired the Settings audio sliders to `AudioManager` volume state for in-session master/BGM/SFX control; exposed the existing UI v2 navigation PNGs for Explore/Care/Growth/Memory; restyled the center Home/Core nav button as a gold heart-core tile; reduced the Moonlake Habitat presence chip so it sits above Soul Talk without covering the companion.
- Verification: Bundled Node `--check` passed for `src/audio/audioManager.js`, `src/ui/settingsController.js`, and `src/app.js`. `docs/qa/state-onboarding-migration-cases.mjs` passed 8/8. `git diff --check` passed. A 390x844 browser probe confirmed no HUD speaker button, one settings button, five nav buttons, visible UI v2 nav images, Settings volume range updates, no horizontal overflow, and the compact habitat chip positioned above Soul Talk. `python docs/qa/_run_web_release_gate.py` passed 9/9 automated required gates with 0 accessibility warnings.
- Problems / risks: Real iPhone Safari visual approval remains human-only, especially exact fit under Safari browser chrome. The gate still lists manual release requirements for real-device testing, moderated private testers, and legal/privacy/store-copy review.
- Next safe action: Commit and push this scoped UI/HUD optimization only, excluding untracked QA output JSON files. Human should recheck the phone URL and capture any remaining V2 parity gaps.
- Required reading: `AGENTS.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`, the supplied Nexus Link UI v2 handoff/reference files, and the user-provided mobile screenshot.

### 2026-06-28 - Codex - Mobile UI v2 Runtime Repair

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for commit/push
- Scope: Runtime UI repair for the user-reported mobile issues in the UI v2 direction. Touched onboarding visibility, settings panel wiring, page/modal accessibility isolation, and mobile page proportions. No `assets/**`, no `src/state/**`, no `saveManager.js`, no storage-key/schema change, no Pixi renderer change, no Raphael behavior change, no dependency, no build step, no desktop wrapper, and no generated image work.
- Work performed: Added a Settings panel controller and panel route for the existing gear button; added a safe onboarding restart action that only resets existing onboarding flags; updated panel management so modal panels inert and hide active content pages; restored settings to the base panel whitelist; kept the old settings dropdown from binding when the new panel route is active.
- Verification: Bundled Node `--check` passed for `src/app.js`, `src/ui/panelManager.js`, `src/ui/onboardingController.js`, and `src/ui/settingsController.js`. `git diff --check` passed. `docs/qa/state-onboarding-migration-cases.mjs` passed 8/8. A 390x844 Playwright probe passed Start, Identity, Guidance, Settings, Care full-page sizing, Soul Talk button containment, no horizontal overflow, and companion-card-over-Care isolation. `python docs/qa/_run_web_release_gate.py` passed 9/9 automated required gates with 0 accessibility warnings.
- Problems / risks: Real iPhone/Android hardware visual approval remains human-only. The gate reused `http://localhost:5173`; human phone testing should use the LAN URL on the same Wi-Fi and can force a fresh first session with `?devReset=1`.
- Next safe action: Commit and push this scoped UI repair only, excluding untracked QA output JSON files. Then human should test on phone at the LAN URL and record any remaining visual issues with screenshots.
- Required reading: `AGENTS.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`, and the supplied Nexus Link UI v2 handoff/reference files.

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

### 2026-06-30 - Codex - iOS Safari Soul Talk keyboard black-gap repair

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / commit pending; self-reviewed and ready for push/main fast-forward
- Scope: Mobile Safari viewport repair for the user-reported iPhone 15 Pro Max Soul Talk keyboard black gap. Touched only the DOM viewport helper, Soul Talk focus behavior, and mobile Safari polish CSS. No `index.html`, no `assets/**`, no `src/state/**`, no `saveManager.js`, no storage-key/schema change, no Pixi renderer change, no Raphael behavior change, no external dependency, and no build step.
- Work performed: Added `--vv-offset-top` alongside `--app-height`/`--kb-inset`; kept keyboard detection but documented that elements sized to `visualViewport.height` must not also add keyboard inset. Removed `messageInput.scrollIntoView()` from the fixed Soul Talk drawer focus path and instead re-measures viewport variables after focus while keeping the chat log pinned to the latest entry. Added a V2 mobile Safari override that anchors the active Soul Talk panel and drawer inside the visual viewport instead of double-compensating above the keyboard.
- Verification: Bundled Node `--check` passed for `src/utils/dom.js` and `src/ui/soulTalkController.js`. `git diff --check` passed. `docs/qa/state-onboarding-migration-cases.mjs` passed 8/8. `python docs/qa/_run_web_release_gate.py` passed 9/9 automated required gates with 0 accessibility warnings.
- Problems / risks: Automated gates cannot physically raise the iOS Safari keyboard; final confirmation still requires human retest on real iPhone Safari after GitHub Pages deploy. Existing untracked QA output JSON files remain intentionally unstaged.
- Next safe action: Push this scoped repair, fast-forward `main`, then human should retest Soul Talk on iPhone Safari: open Soul Talk, focus the input, type several lines, close keyboard, reopen, and confirm no black gap appears above the keyboard.
- Required reading: `AGENTS.md`, `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`, `styles/mobile-safari-polish.css`, `src/utils/dom.js`, `src/ui/soulTalkController.js`, and the user-provided iPhone keyboard screenshots.

### 2026-06-30 - Claude Code - HUD/nav 視覺 pack（對齊 V2「不 baked text」、語意化底部五鍵）

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `efd8b1c`.
- Layer: EXPERIENCE，**純 CSS**（2 檔：`page-full-nav.css`、`page-content.css`）。**無 `index.html`**（先確認既有 DOM 足夠：nav 每鍵已含 `.bottom-nav__icon` + `data-i18n` 文字 label + baked PNG，HUD 已是 compact chip + 右上僅設定、無 speaker/無貨幣）／無 JS／無 schema／無 Pixi／無 assets 變更。對照 `Nexus Link UI v2 - Handoff.md` 與 screenshots。
- Work performed:
  - **P1 底部五鍵語意化（核心）**：依 Handoff「不 baked text、icon 用 SVG」，CSS 隱藏 baked PNG（`.nav-image`），改顯示 DOM 既有的 `.bottom-nav__icon`（以 `mask` + inline data-URI SVG 線描 icon、`currentColor` 上色，**無新增 asset**）+ 中文 `.bottom-nav__label`：探索=星芒羅盤／照顧=手心托心／成長=新芽／記憶=書頁；中央維持心核晶體 gem。active=香檳金（V2 selected→gold）+ 既有金色光池，**非 FOMO 紅點**。
  - **P1 HUD 資訊層級**：確認既有 HUD 已符合 V2（左上 compact companion chip：頭像+名+心核共鳴體 kicker+等級+在線點；右上**僅**設定齒輪；**無** speaker 快捷、**無**貨幣/鑽石/商城/紅點）。無需改碼，實測佐證。
  - **P1 月湖棲地收斂**：`.v3-home-presence` 已是左下小藥丸 tag、不擋夥伴中央、與 page content 不重疊（上一包 stack 修復保留）。無需改碼，實測佐證。
  - **P2 頁框玻璃感**：`.page-view` 外框由偏金粗框（`--v3-line-quiet` 0.34）改冷色髮絲邊（`--aurora-line` 0.24），更像「真頁面」非疊背景 modal；四頁仍無右上 X、仍為真頁面。
  - **P2 Settings 音量**：確認主 HUD 無 speaker；設定頁 master/bgm/sfx slider + 聲音開關齊全；390×844/390×520 經內層 `.settings-page-body`（overflow-y:auto，scrollH 998>241）可捲動、刪除鈕可達。
- Verification（預覽 8128，清空 localStorage 實測 + 截圖）：`git diff --check` clean；只動 2 個允許檔；`node --check` n/a（無 JS）；`state-onboarding-migration-cases` 8/8（未動 schema）；web release gate **9/9 required、0 accessibility warning、no failing node**（一次 8/9 為已知 split-on-null cold-load transient，重跑 9/9）；0 console error。視窗實測：390×844 五鍵語意 icon+label 清楚、active=gold、margin 16/16；四頁 nav active 正確、page↔心語條 overlap=0、頁框冷色細邊；HUD 右上僅設定；Settings 390×844/520 可捲；**regression 全過**：390×390 身份頁「繼續」可點(shell 360<390)、Soul Talk chat-log 133px、modal nav lock(pointer-events:none)、Soul Talk close→none。截圖：390×844 Home（五鍵 icon+chip）、Explore（頁框+nav active）。
- Problems / risks: nav active 視覺指示為金色 tint + 柔光（克制），中央心核 gem 恆為金（home 鍵設計）— 已確認 active item 真的轉金（`rgb(231,200,132)`），不致混淆。baked PNG 檔案仍保留在 repo（僅 CSS 隱藏、未刪、未改 assets）。
- Known incomplete / 不在本包: 內容翻譯 pack（敘事內文）、2.5D 棲地、完整世界地圖 runtime、Emotional Standoff 改造、Explore/Care/Growth/Memory 的 V2 完整節點內容（progress card / node rows / filter chips 等 Handoff §3.5–3.8 內容尚未填）。
- Next safe action: 真機 iOS Safari 檢視 nav icon 清晰度；之後若要做頁面內容對齊 Handoff §3.5–3.8，另開 content pack。
- Required reading: 本 lane、`CLAUDE.md` §4/§5、`Nexus Link UI v2 - Handoff.md`、`ACCEPTANCE.md`（未動 schema/assets）。

### 2026-06-29 - Claude Code - First-time UX 基礎修復（mobile keyboard / page stack / HUD hit area）

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `b593e71`.
- Layer: EXPERIENCE，**純 CSS**（5 個 styles 檔）。無 JS / 無 `index.html` 結構 / 無 schema / 無 Pixi / 無資產。Codex 以第一次使用者角度回報的 6 項基礎 UX（3×P1 + 3×P2）。
- Work performed（每項都先實測重現根因再修）：
  - **P1 身份頁鍵盤高度卡死** → `ui-v3-onboarding.css`：`.onboarding-shell` 加 `max-height: calc(var(--app-height) - safe - 32px)` + `overflow-y:auto`（吃 dom.js 量的 visualViewport，鍵盤感知）；新增 `@media (max-height:600px)` 壓縮 min-height/標題/間距、外層可捲。
  - **P1 Soul Talk 打字壓死對話** → `soul-talk-drawer.css`：`.chat-log { min-height:96px }`；`@media (max-height:560px)` 與 `body.kb-open` 下收掉 quick-reply / 聲紋 / kicker、壓縮 header，把高度讓給 chat log，輸入列留底部可見。
  - **P1 真頁面被心語條蓋 60px** → `page-content.css`：`body.page-open .soul-talk-launcher` 的 transform 由 `translateY(10px)` 改 `translateY(calc(100% + 16px))`，把已隱藏（opacity:0/pe:none）的心語條盒子整個移出頁面下緣 → page-view 與心語條 overlapY=0。
  - **P2 底部 nav 右側貼邊不對稱** → `page-full-nav.css` + `mobile-safari-polish.css`：nav 改 `left:0;right:0;margin-inline:auto;width:min(680px,100vw-32px)`（≤480px 同 100vw-32），左右各 16px 對稱。
  - **P2 modal 開啟時 nav 仍可互動誤觸跳頁** → `page-full-nav.css`：`body.panel-open .bottom-nav { pointer-events:none; opacity:.5 }`（`body.panel-open` 由既有 panelManager 設，無需動 JS）。
  - **P2 Soul Talk 關閉鍵 tap 不穩** → `soul-talk-drawer.css`：`.soul-drawer-collapse` 由 40→44px 觸控目標 + `touch-action:manipulation`。實測發現關閉 handler 本身正常（collapse 鍵與 backdrop 皆 `data-panel-close`、Escape 亦可），不穩主因是觸控目標偏小／背景 backdrop 中心被 sheet 遮、以及鍵盤重排時序；故以放大命中區 + 去點擊延遲處理。
- Verification（預覽 8128，清空 localStorage，實測量化）：bundled `node --check` n/a（無 JS 變更）；`git diff --check` clean；`state-onboarding-migration-cases` 8/8（未動 schema）；web release gate **9/9 required、0 accessibility warning、no failing node**；0 console error。視窗實測：390×390 身份頁 shell bottom 366<390、「繼續」在視窗內且可點、無水平溢出；390×390 Soul Talk chat-log 133px（≥96）、輸入列可見；390×520 chat-log 232px 無 regression；390×844 nav 左右margin=16/16、page-view↔心語條 overlap=0、modal 開啟時 nav pointer-events:none。截圖：390×844 Explore（末按鈕不被蓋、nav 置中）、390×390 身份頁（繼續可見）。
- Problems / risks: P2 #6 在自動化點擊器（preview_click / 類 Codex harness）對 backdrop-filter 面板層內的 close 鍵投遞 tap 不穩，屬工具側 hit-test 限制；真實啟用（synthetic activation / Escape / 放大後的 tap）皆關閉正常、`data-active-panel→none`、aria-hidden 正確。內容翻譯 pack 與 baked PNG nav 多語系**仍未做**（沿用前述，不在本 pack）。
- Next safe action: 真機 iOS Safari 鍵盤實測（模擬已過）；之後再開「內容翻譯 pack」與「HUD/nav 視覺 pack」（各自獨立）。
- Required reading: 本 lane、`CLAUDE.md` §4/§5、`ACCEPTANCE.md` H2/K3（無新 localStorage key、未動 schema）。

### 2026-06-29 - Claude Code - R2C-fix i18n 動態頁切語言不重畫 (P1)

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `c74f7bb`.
- Layer: EXPERIENCE. 無 schema 變更（`settings.lang` 為 R2C 既有欄位）、無 Pixi、無資產。
- Scope: 修 QA 回報的 i18n P1 —— 翻譯表無缺 key，但語言切換後**已渲染的動態頁不重畫**，導致 Explore 等頁面 `t()` 標籤殘留上一個語言（EN 下殘繁中、JP↔SC↔TC 互殘）。**本 pack 僅修「切語言後動態 UI 不重畫」**；內容翻譯與 baked PNG nav 多語系**仍未做**（見 Problems）。
- Work performed:
  - `src/i18n/i18n.js`：新增並 export `LANGUAGE_CHANGED_EVENT`；`applyLanguage()` 末端 `EventBus.emit`（語言切換的唯一進出口；靜態 `[data-i18n]` 仍由原 DOM 掃描更新）。
  - `src/ui/pageRouter.js`：`bind()` 訂閱該事件 → `render()` 重畫 active page（home early-return；背景開著的分頁就地以新語言重畫）。
  - `src/ui/companionSelectController.js`：訂閱該事件 → 重畫 roster 卡（狀態標籤 / 同行中）。
  - `atlasController` 不改 —— 其唯一 `t()` 同時帶 `data-i18n`，已被 `applyLanguage` 的 DOM 掃描覆蓋（實測切換後 tag 正確）。走 `eventBus`，符合 CLAUDE.md §4 跨層通訊規範。
- Verification: bundled `node --check`(3 JS) OK；`git diff --check` clean；`state-onboarding-migration-cases` 8/8 passed；web release gate **9/9 required、0 accessibility warning、0 console error、canvas=1**；預覽 390×844 真實 UI（Home→Explore→Settings→切語言）EN→JP→SC→TC：Explore 的 `t()` 標籤（World Atlas / Approach the lake glow / Moonlake Camp / Visible traces…）每次都跟著切，**無殘留上一語言**；companionSelect 開著切 EN →「同行中／可同行」即時變「Walking with you／Available」、切回 TC 還原。
- Problems / risks: **以下兩項刻意維持現狀、不在本 pack 範圍，不得視為已完成**：(1) 動態頁 body copy／按鈕副說明（`首輪探索…` 等敘事內文）依 `strings.js` 宣告範圍仍為繁中，屬內容翻譯 pack；(2) 底部四側 nav 為 baked-text PNG（探索/照顧/成長/記憶），EN/JP 下仍顯示中文，需新 nav 美術（資產，待批准）。簡/英/日翻譯仍建議人工校對（尤其日文語氣）。
- Next safe action: 人工校對翻譯；之後若要譯敘事內容或 nav 圖示，各自另開後續 pack（內容翻譯 pack / nav 美術資產 pack）。
- Required reading: 本 lane（含下一則 R2C i18n）、`CLAUDE.md` §4/§5、`ACCEPTANCE.md` H2/K3（無新 localStorage key）。

### 2026-06-29 - Claude Code - R2C i18n（語言選擇器 + UI chrome 翻譯 繁/簡/英/日）

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `9c13adc`.
- Layer: EXPERIENCE + 最小 GROUNDWORK（`settings.lang` 加在既有 settings 區塊；`defaultState.js` + `store.js` normalizeSettings 白名單）。無新 localStorage key。
- Work performed:
  - 新 `src/i18n/strings.js`（key→{tc,sc,en,jp}，~80 UI chrome 字串）+ `src/i18n/i18n.js`（`t()` / `applyLanguage()`：設 html lang、掃 `data-i18n`/`-placeholder`/`-aria`）。
  - `settings.lang`（預設 tc）持久化；設定頁加語言 segmented（繁/簡/EN/日本語），切換即套用＋存檔。
  - `index.html` 靜態 chrome 全面加 `data-i18n`：nav、HUD、開場（含三契約）、四大頁標題/膠囊、角色 modal 標籤、companion-select、atlas、soul drawer、設定全部。
  - 動態渲染用 `t()`：`pageRouter`（四大頁標題/動作鈕/證據·量表標籤）、`atlasController`（區域 tag，data-i18n 以便切換後仍更新）、`companionSelectController`（狀態/同行中）。
  - **不譯（維持繁中）**：夥伴對話、Raphael 敘事、`soulTalkResponsePacks`、`explorationNodes` 結果文、心情敘述、記憶內文、區域專有名詞 —— 屬內容工程，另開 pack。
- Verification: bundled `node --check`（8 JS）；`state-onboarding-migration-cases` 8/8 passed（settings.lang 安全遷移）；web release gate **9/9**、stateMigration ok、兩視窗 0 console error；預覽 390×844 切 EN → nav「Core」、設定「Settings/Audio/Export save」、Explore 鈕英文、atlas「Far away/You are here」、保存 lang=en；切 JP → 心核の相棒 / 心の声 / 話す / モーション軽減。
- Problems / risks: 簡/英/**日**為 AI 生成翻譯，**建議人工校對**（尤其日文語氣）。四側 nav 圖示為 baked-text PNG（探索/照顧/成長/記憶），EN/JP 下仍顯示中文；要全譯需新 nav 美術（資產，待批准）。中央心核鍵與所有 CSS 文字已隨語言切換。
- Next safe action: 人工校對翻譯；之後若要譯敘事內容或 nav 圖示，各自另開 pack。
- Required reading: 本 lane、plan ROUND 2、`ACCEPTANCE.md` H2/K3（無新 localStorage key）。

### 2026-06-29 - Claude Code - R2B Settings 實裝（畫質有感 / 匯出·刪除存檔 / 音量稽核）

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `513a91d`.
- Layer: EXPERIENCE + 最小 GROUNDWORK（`saveManager.js` 新增唯讀 `exportSaveData()`，複用既有 `clearState`；**不改 STORAGE_KEY/schema**）。
- Work performed:
  - **畫質有感**：新 `styles/quality-modes.css`，`html[data-quality=low|medium|high]` 控 backdrop-blur/glow/vignette/bloom/動畫；low=扁平玻璃＋關場景特效（手機效能模式），medium=降 blur，high=預設。`settingsController` 已寫 dataset.quality 並持久化。**不動 pixiApp**。
  - **匯出存檔**：`saveManager.exportSaveData()` 回傳 JSON 字串；`settingsController.exportSave()` 包 Blob 讓玩家下載 `nexuslink-save-YYYY-MM-DD.json`（client 端、不上傳）。
  - **刪除存檔**：`settingsController.deleteSave()` 二次 `confirm()` → `clearState()` → reload → 自然回開場→輸入名字→導引→遊戲。
  - **音量**：master/bgm 已即時驅動 BGM（settings persistence pack 已接）；加註記說明「首次需輕觸啟用聲音、SFX 素材待補」（不假裝 SFX 有效，無 SFX 音源 → 待批准資產）。
  - settings 面板底緣改用 `--nav-block-h`。
- Verification: bundled `node --check`(2 JS)；web release gate **9/9**、0 console error、無 unlabeled button；預覽 390×844：畫質 high→low 即時套用且持久（soul-strip backdrop-filter→none、vignette→none）、匯出/刪除鈕存在且有 label。
- Problems / risks: SFX/環境音量無音源（待資產批准）；刪除為破壞性，已加 confirm。畫質為 CSS 特效層級，非 Pixi 解析度（pixiApp LOCKED）。
- Next safe action: R2C（i18n 語言選擇器 + UI chrome 翻譯）。
- Required reading: 本 lane、plan ROUND 2、`ACCEPTANCE.md` H2/K3（無新增 localStorage key、STORAGE_KEY 未動）。

### 2026-06-29 - Claude Code - R2A Mobile UX polish (keyboard / hierarchy / nav / chat)

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy to `main`), on top of `15af843`.
- Layer: EXPERIENCE (CSS + 輕量 JS). 無 schema / 無 Pixi 架構 / 無資產 / 無 Raphael 行為變更。
- Scope (post-launch iPhone + ChatGPT UX feedback, canon-filtered): **拒絕** roster 等級/星/親密度% 與世界共鳴% 等收集/FOMO 數字。
- Work performed:
  - **鍵盤遮擋修復 (P0)**：`dom.js` 由 visualViewport 算 `--kb-inset` + `body.kb-open`；soul-talk drawer 高度改吃 `--app-height`（`soul-talk-drawer.css` + `mobile-safari-polish.css` 一致），鍵盤開時下錨到鍵盤上方並收縮，header/輸入框/最後一句皆可見、無黑塊。drawer 改 flex column，輸入列固定底部。
  - **視覺階層 (CSS only)**：`layout-shell.css` scene vignette（壓暗四周搶戲、夥伴中心區透亮）+ focal bloom；不動 Pixi。
  - **底部 nav 主次**：`page-full-nav.css` 非 active tile 降亮/降彩、active 維持金。
  - **心語↔nav 緊鄰**：`dom.js` 量測 `.bottom-nav` → `--nav-block-h`；soul-strip / page-view / drawer / 之後設定底緣統一用之（取代魔術數 108/124）。
  - **微互動**：`ui-v2-aurora.css` 按壓 scale .965 + 微亮、綠點呼吸；全 gate 在 `data-reduced-motion-preference!="reduced"` + `@media prefers-reduced-motion`。iOS 無 vibrate API 故純視覺。
  - **聊天**：密度收斂、輸入列比例（送出收窄/輸入加寬）；`soulTalkController` 連續相同訊息去重（store + render 兩層，修重複行；不動 Raphael 推理）。**未**加假 typing dots（Raphael 回應為同步、無真等待）。
  - **夥伴名片**精簡字體/排版；**nav 再按關閉**（`pageRouter.navigate` toggle 回 home）；**roster 工程字眼**「動畫就緒」→「可同行」（`companionSelectController` 顯示層，companion data 不動）。
- Verification: bundled `node --check`(4 JS)；web release gate **9/9**、兩視窗 0 console error、無水平溢出；預覽 390×844：心語緊鄰 nav(12px)、nav 再按可關、roster「可同行」、drawer flex；模擬鍵盤(--app-height 450/--kb-inset 394) → drawer 收縮 418、top 24、輸入框 bottom 427 可見、無黑塊。
- Problems / risks: 真機 iOS Safari 鍵盤行為仍需你手機實測（模擬已過）。夥伴「放大」未做（依決策只用 CSS 階層，不動 Pixi scale）。
- Next safe action: 你 iPhone 實測鍵盤/階層；接著 R2B（設定實裝）。
- Required reading: `AGENTS.md`、`CLAUDE.md`、`ACCEPTANCE.md`、本 lane、plan 的 ROUND 2 段。

### 2026-06-29 - Claude Code - Settings persistence (GROUNDWORK: save-schema settings block)

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / on top of `0e5f20f`, committed this pack. No new localStorage key.
- Layer: GROUNDWORK (save schema: `src/state/defaultState.js` + `src/state/store.js` `normalizeState`) + EXPERIENCE (`src/ui/settingsController.js` wiring).
- Scope: Persist player Settings inside the existing `nexusLinkR2State:v1` save. No new localStorage key, no Pixi/Raphael/asset change, `saveManager.js` STORAGE_KEY untouched. Audio mute keeps its existing separate key (`nexusLinkAudioMuted:v1`).
- Work performed: Added a `settings` block (`volMaster/volBgm/volSfx/quality/textSize/lowMotion`, defaults matching `index.html`) to `defaultState.js`; deep-cloned it in `createDefaultState`; added `normalizeSettings()` (mirrors `normalizeBattleRecord`) to `normalizeState` so partial/old saves backfill safely. Rewrote `settingsController.js` to use `store.settings` as the source of truth: applies on boot (volumes → `AudioManager.setVolume`, lowMotion → `reducedMotionPreference` dataset, quality/textSize → root dataset markers) and persists on every change via the existing save queue. Wired `store` + `saveSettings` into `createSettingsController` in `app.js`.
- Verification: bundled Node `--check` on all changed JS; `node docs/qa/state-onboarding-migration-cases.mjs` all cases passed (failed 0); fresh-origin browser test at 390x844 — set master volume to 30 → persisted to `settings.volMaster` in `nexusLinkR2State:v1`, slider/output restored to 30 after reload, AudioManager re-applied; low-motion toggle and quality segment also round-trip (saved + applied to root dataset). Web release gate 9/9 required, `stateMigration` ok, 0 console errors at 390x844 and 1280x900.
- Problems / risks: quality and textSize persist + restore their UI selection and write inert root dataset markers, but do NOT yet change rendering (px-based font scaling / Pixi quality is a separate EXPERIENCE pack). No new localStorage key (ACCEPTANCE H2/K3 preserved).
- Not touched: `saveManager.js` STORAGE_KEY and save-key set, Pixi renderer, `assets/**`, Raphael behavior, onboarding logic.
- Next safe action: Human review; optional follow-up EXPERIENCE pack to actually apply textSize/quality to rendering.
- Required reading: `AGENTS.md`, `CLAUDE.md` §5.1, `ACCEPTANCE.md` H2/K3, and this lane.

### 2026-06-28 - Claude Code - UI/HUD V2 Aurora Pass (HUD chrome, pages, World Atlas)

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `25b9944` base, uncommitted, awaiting human approval before commit/push
- Scope: EXPERIENCE-layer UI/HUD V2 (Aurora) pass per `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md` and the human-supplied V2 design plus the 2.5D habitat / Linkara world-map references. References were adopted as visual language only; no Pixi renderer change, no companion change, no asset import, no save-schema change. Currency/multi-companion/daily-reward/level framing from the references was explicitly rejected per canon red lines.
- Work performed:
  - HUD/nav CSS dedup: removed the duplicate `.bottom-nav--aurora` rules from `styles/ui-v2-aurora.css`; bottom-nav stays single-owned by `styles/page-full-nav.css`.
  - Aurora typography: Noto Serif TC on companion name, panel headings, and Soul Talk title; added the V2 香檳金 ◈ diamond signature to true-page title blocks.
  - Read-only "今日心情共鳴" added to the companion status modal, derived from existing `state.mood` (single descriptor + one gentle line; no %-race, no new schema, no FOMO).
  - Read-only World Atlas: new `data-panel="atlas"` panel + `src/ui/atlasController.js` rendering Linkara regions as a CSS/SVG placeholder (no PNG import). Region 5 月湖營地 = current/highlighted; the rest are "遠方"/locked with no completion %, no countdown, no unlock task. Reachable from a new "世界地圖" button on the Explore page.
  - Fixed a pre-existing desktop-width Soul Talk strip vs bottom-nav 3px overlap (raised strip clearance for the taller Aurora image-tile nav).
- Changed files: `index.html`, `src/app.js`, `src/ui/hudController.js`, `src/ui/pageRouter.js`, `styles/ui-v2-aurora.css`, `styles/page-content.css`, new `src/ui/atlasController.js`, new `styles/world-atlas.css`, and this ledger entry.
- Verification: bundled Node `--check` on all changed JS; `git diff --check` clean; web release gate 9/9 required automated checks, 0 accessibility warnings, 0 console errors, no horizontal overflow at 390x844 and 1280x900; manual browser checks of Home, all four pages, the companion modal (心情共鳴), the World Atlas, and the existing soul-map at 390x844 and desktop; strip↔nav gap 56px mobile / 13px desktop. Existing soul-map (5-node) and flows unregressed.
- Problems / risks: The four true pages were already close to V2 from prior Codex work, so this pass preserved them and added only the diamond signature; deeper reflow was unnecessary. Settings volume/quality persistence (`nexuslink_v2` schema) intentionally deferred (would be GROUNDWORK). Real-device Safari review remains human-only. The World Atlas is an SVG placeholder; importing the actual Linkara map PNG needs a separate asset-approval GROUNDWORK pack.
- Not touched: `src/ai/**`, `src/state/**`, `saveManager`, save schema, Pixi renderer, `assets/**`, tools, scripts, Raphael behavior/safety, onboarding logic, battle/standoff mechanics.
- Next safe action: Human review of the scoped diff and an on-device 390x844 check, then commit/push if accepted. Optional follow-ups (each a new pack): soul-map V2 restyle, Settings persistence (GROUNDWORK), real Atlas PNG import (asset approval).
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `NEXUS_LINK_MASTER_CANON_v3.1.md`, `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, and this lane.

### 2026-06-28 - Codex - UI/HUD Claude Code Handoff

- Status: `COMPLETED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `25b9944`, handoff docs uncommitted
- Scope: Documentation-only visual/UI handoff for a future Claude Code V2 parity pass. No generated art, no asset import, no asset deletion/movement, no companion visual swap, and no product-direction change.
- Work performed: Documented the current V2 target, persistent HUD budget, bottom-nav status, Moonlake chip status, Settings/audio direction, page/modal layering, and unresolved visual issues. Added a paste-ready Claude Code instruction that requires plan-first execution and asks Claude to treat the human-supplied V2 design files as the visual target.
- Verification: Handoff file lists explicit acceptance criteria for mobile and desktop UI checks and warns not to stage local QA JSON outputs.
- Problems / risks: Exact V2 parity, nav icon coherence, and Traditional Chinese copy cleanup remain unimplemented. New bitmap icons still require human approval before entering `assets/**`.
- Next safe action: Claude Code should inspect the current runtime at 390x844, 430x932, and desktop, compare against the provided V2 design documents, then propose a scoped UI/HUD plan.
- Required reading: `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md`, `docs/handoff/CLAUDE_CODE_UI_HUD_TAKEOVER_PROMPT.md`, and the user-provided Nexus Link UI V2 design files/screenshots.

### 2026-06-28 - Codex - Mobile UI v2 HUD/Icon Optimization

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for commit/push
- Scope: Visual/HUD optimization toward the supplied UI v2 direction. No new art generation, no asset import, no asset movement, no companion visual swap, no storefront/FOMO elements, and no redesign outside the user-reported HUD/icon/presence issues.
- Work performed: The bottom navigation now uses the existing V2-style image tiles for Explore, Care, Growth, and Memory, with a distinct gold Heart-Core/Home tile in the center. The Moonlake Habitat label is compressed into a smaller glass chip instead of a large blocking block. The right HUD is simplified to Settings only, with audio controlled from the Settings page. Page and modal layering from the previous repair remains intact so companion status and content pages do not overlap visually.
- Verification: 390x844 browser screenshot/probe showed the V2 nav images rendered at the bottom, the center Core tile highlighted, no standalone speaker icon, a compact Moonlake chip above Soul Talk, no horizontal overflow, no console errors, and Settings volume controls updating visible values. Web release responsive/accessibility gate passed 9/9 automated required checks with 0 accessibility warnings.
- Problems / risks: This closes the obvious HUD/icon mismatch and oversized habitat label, but exact V2 aesthetic parity still depends on human phone review against the reference screenshots. No generated replacement icons were introduced because current repo policy requires human approval before adding new art to `assets/**`.
- Next safe action: Commit/push the scoped visual optimization, then human should test `http://192.168.1.123:5173/` and `http://192.168.1.123:5173/?devReset=1` on the phone.
- Required reading: `C:/Users/User/Pictures/新增資料夾/Nexus Link UI v2 設計/Nexus Link UI v2 - Handoff.md`, `C:/Users/User/Pictures/新增資料夾/Nexus Link UI v2 設計/Nexus Link UI v2 (export-src).dc.html`, and the user-provided V2/mobile screenshots.

### 2026-06-28 - Codex - Mobile UI v2 Runtime Repair

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for commit/push
- Scope: UI v2 visual/runtime repair based on the user-supplied screenshots and handoff. Adjusted proportions and layer behavior for Start/Identity/Guidance/Home/Settings and true-page overlays. No new art, no generated images, no asset movement, no asset approval, no redesign beyond applying the supplied UI v2 direction.
- Work performed: Added a full Settings panel matching the glass-card direction; changed Explore/Care/Growth/Memory page surfaces to occupy the readable mobile content band between HUD and bottom nav; kept Soul Talk as a contained strip with the `對話` pill inside the card; visually suppresses active pages when a modal companion/status panel opens, preventing the Care + companion-card overlap shown in the user's screenshots.
- Verification: 390x844 Playwright UI probe passed: Start visible, identity page visible, guidance visible, Settings visible at 358x664, Care page at 370x622 above the 72px nav, Soul Talk strip/button contained, companion modal visible with the Care page opacity resolved to 0 after transition, no horizontal overflow, no console errors. Web release responsive/accessibility probe passed at 390x844 and 1280x900 with single canvas, 5 nav buttons, Soul Talk input visible, no unlabeled buttons, no hidden focusables, and no horizontal overflow.
- Problems / risks: The automated proof confirms layout mechanics, not final human aesthetic approval. Actual Safari browser chrome height and safe-area differences still require human phone screenshots before public release.
- Next safe action: Commit/push the repair, then have human test `http://192.168.1.123:5173/` and `http://192.168.1.123:5173/?devReset=1` on the phone.
- Required reading: `C:/Users/User/Pictures/新增資料夾/Nexus Link UI v2 設計/Nexus Link UI v2 - Handoff.md`, `C:/Users/User/Pictures/新增資料夾/Nexus Link UI v2 設計/Nexus Link UI v2 (export-src).dc.html`, and the user-provided mobile screenshots.

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
