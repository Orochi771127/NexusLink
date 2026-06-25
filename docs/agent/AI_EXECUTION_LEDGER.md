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
