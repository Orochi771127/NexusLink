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

### 2026-07-03 - Codex - Mobile Soul Talk and Atlas viewport polish

- Status: `VERIFIED`
- Branch / commit: `main` / pending Codex commit in this TASK_PACK
- Scope: Targeted mobile UI/viewport repair from human screenshots. Fixed Soul Talk keyboard focus layout, Soul Talk V2 four-layer visual structure, and World Atlas modal overlap with bottom nav. No save schema, Pixi, assets, dependencies, gameplay rules, Calm Sync, map art, or product-spec expansion.
- Work performed:
  1. `src/ui/soulTalkController.js`: wired existing passive keyboard helpers (`expectSoftKeyboard`, `syncViewportDuringTransition`, `clearSoftKeyboardExpectation`) into Soul Talk input focus/blur so CSS can use `--kb-inset` when the browser reports or estimates it.
  2. `styles/soul-talk-drawer.css` + `styles/mobile-safari-polish.css`: changed focus layout from a fixed 42vh top slab to a drawer that reserves the keyboard band below it, tightened mobile width, and styled the four visible Soul Talk layers: header, resonance/waveform, transcript, composer.
  3. `styles/world-atlas.css`: constrained the atlas modal between the top safe area and bottom nav, made the region legend internally scrollable, and reduced the map canvas height on mobile/short viewports.
  4. Refreshed existing tracked QA evidence JSONs from the release gate; no new evidence document was created.
- Verification: bundled Node `--check src/ui/soulTalkController.js` passed; `git diff --check` clean; Browser plugin QA at 390x844 on fresh local port 5202 passed with no console warnings/errors. Soul Talk metrics: no horizontal overflow, header/resonance/transcript/composer ordered, composer inside drawer. Atlas metrics: active panel `atlas`, modal bottom 752, nav top 764, 12px gap, legend `overflow-y:auto`, no modal horizontal overflow. Full web release gate on `--base http://localhost:5205 --port 5205` passed 10/10 required checks, 0 accessibility warnings; live playtest gate inside it passed Soul Talk 10/10, HUD 13/13, 0 console errors.
- Problems / risks: Browser QA cannot display the real iOS keyboard, so the keyboard band is verified by layout metrics and existing fallback variables; human should still recheck on real mobile Safari/Chrome. The World Atlas remains CSS/SVG placeholder art; this did not implement a generated world-map image.
- Next safe action: Human real-device retest for the exact screenshots: iOS keyboard open in Soul Talk and World Atlas opened from Explore. If passed, next separate TASK_PACK can be Calm Sync v1 or map art integration using the existing gameplay systems spec.
- Required reading: `styles/soul-talk-drawer.css`, `styles/world-atlas.css`, `src/ui/soulTalkController.js`, this entry.

### 2026-07-02 - Codex - i18n P4 review, evidence, and main integration

- Status: `COMPLETED`
- Branch / commit: `main` / `21323a9` docs whitespace, `35046c8` i18n wiring, plus this ledger/evidence commit.
- Scope: Reviewed and integrated Claude Fable 5's i18n P4 package. Included refreshed tracked QA evidence files because they are the current automated proof for this integration. No Calm Sync, world map, asset pipeline, save/state, Pixi, gameplay rule, dependency, or UI redesign work was performed.
- Work performed:
  1. Reviewed actual working tree against Claude's handoff report: 11 touched files, matching the reported scope.
  2. Used codebase-memory trace to confirm `createBattleController` and `createHudController` are high-impact UI entry points; reviewed their diffs and confirmed changes are limited to i18n templates and `textContent` / `placeholder` writes.
  3. Committed the package in scoped commits: whitespace docs first, static/controller i18n wiring second, ledger + QA evidence last.
- Verification: `git diff --check` clean; bundled Node `--check` passed for `src/i18n/strings.js`, `src/ui/pageRouter.js`, `src/ui/battleController.js`, and `src/ui/hudController.js`; scripted i18n integrity passed with 225 STRINGS keys, 0 missing languages, 143 HTML i18n attributes all resolved, and 92 scanned static `t()` references all resolved; system Python release gate on `--base http://localhost:5198 --port 5198` passed 10/10 required checks with 0 accessibility warnings; live playtest gate passed Soul Talk 10/10, HUD 13/13, awakening/storage/touch/pixi OK, and 0 console errors.
- Problems / risks: Same non-blocking gaps as Claude's entry remain: named Soul Talk placeholder reverts to generic localized placeholder after language switch; mid-standoff dynamic labels refresh on the next `startBattle`; remaining content-tier and dynamic TC writers need a separate mini-pack. Human gates remain open: real-device mobile Safari/Chrome, moderated private testers, legal/privacy/store copy.
- Next safe action: Push these scoped commits to `origin/main`; then start a new authorized TASK_PACK for either Calm Sync v1 or the remaining dynamic-writer i18n mini-pack.

### 2026-07-02 - Claude Fable 5 - i18n package P4: controller wiring + index.html static labels (handoff to Codex review)

- Status: `VERIFIED` (uncommitted — awaiting Codex review; commit/push NOT performed per this round's instruction)
- Branch / commit: `main` / uncommitted working tree
- Scope: Finish i18n package P4 per human TASK_PACK. Files touched: `index.html` (i18n attributes only, no structural change), `src/i18n/strings.js`, `src/ui/pageRouter.js` (P2, earlier in round), `src/ui/battleController.js`, `src/ui/hudController.js`, 3 docs (whitespace only). Explicitly NOT done: Calm Sync, world map, asset pipeline, saveManager/store/defaultState/pixiApp, gameplay/standoff rule changes, new dependencies.
- Work performed:
  1. P1 whitespace: 3 Raphael docs cleaned (trailing spaces + EOF blank lines); `git diff --check` clean.
  2. P2: `pageRouter.js` LANGUAGE_CHANGED listener now re-sets `#status-text` via `getPageStatus(activePage)` (home included) before re-render; `formatDate()` maps `getLanguage()` → locale (`zh-TW/zh-CN/en-US/ja-JP`) instead of hardcoded zh-TW.
  3. P3: all 53 EN-pack keys filled with sc/jp; header note removed.
  4. P4 index.html: 143 total `data-i18n`/`data-i18n-aria`/`data-i18n-placeholder` refs after adding ~60 attributes across title, shell/HUD/nav arias, panel close buttons, kickers (roster/map/codex/actionSheet), Moonlake presence block, level pill, onboarding kicker + name placeholder, standoff modal statics (title, noise hint, sync/fatigue/shards vitals, barrier/pulse/retreat buttons, finish button), settings group arias, soul panel aria. Language self-name buttons (繁體/简体/日本語) intentionally untranslated.
  5. P4 controllers: `battleController.startBattle` node label / `{name}的心核` / `{name}的雜訊` / resonance-hint templates now use i18n keys with `{name}`/`{emotion}` placeholder replace (content-tier node/enemy/emotion names stay TC by design); `hudController.setCreature` description fallback + named soul-talk placeholder keyed (`char.descFallback`, `hud.soulPlaceholderNamed`). All writes remain `textContent`/`placeholder` — no innerHTML path touched.
  6. New keys this round: `aria.*` ×30, `battle.*` ×17, `map.*` ×2, `codex.kicker/title`, `actionSheet.kicker`, `habitat.*` ×2, `ob.kicker/namePlaceholder`, `hud.levelPill/soulPlaceholderNamed`, `char.descFallback`, `roster.kicker`, `meta.title`. STRINGS total 225 keys, 0 missing languages (scripted check).
- Verification: bundled Node `--check` on 4 touched JS; scripted integrity: all 143 html refs + all static `t()` refs in src/ resolve to STRINGS (both directions NONE missing); `git diff --check` clean; web release gate on clean port 5197 **10/10 required PASS, 0 accessibility warnings** (22:07); live playtest gate vs :8128 **soul_talk 10/10, hud 13/13, 0 console errors**; Chromium preview manual: EN switch → title/level pill/moonlake block/all panel arias/standoff statics (Heart-Core Standoff, Boundary/Pulse/Step away + hints)/map/codex/roster kickers all EN with zero TC residue; JP switch → 心核の対峙/レベル 01/statusText 即時同步（月湖の棲み処に戻った。）; TC restore clean; console errors 0.
- Problems / risks: (a) `#message-input` named placeholder reverts to generic localized placeholder after a language switch (applyLanguage owns the node; pre-existing behavior, now correct-language in all cases); (b) battleController dynamic labels only refresh at next `startBattle` after mid-standoff language switch (transient, session-scoped); (c) remaining hardcoded-TC dynamic writers deferred as known gaps: `actionSheetController` actionMeta copy (gameplay copy), app.js sleep-cycle/companion-switch statusText lines, `hudController` idle status line (entangled with DEFAULT_STATUS_TEXT comparison), companionRenderer load-status lines, Soul Talk dialogue pool, mood/boundary preview copy (content tier); (d) gate reruns refreshed `docs/qa/_web_release_gate_output.json` + `_live_playtest_gate_output.json` in the working tree as evidence — Codex may include or discard at commit time.
- Next safe action: Codex review of the uncommitted diff (6 code/docs files + 2 refreshed QA evidence JSONs), then human-authorized commit/push; after that the next gameplay TASK_PACK (Calm Sync v1 — design already validated, see plan file `c-users-user-pictures-thumbnail-c-users-curried-mccarthy.md`) or the remaining dynamic-writer i18n mini-pack.
- Required reading: this entry, previous entry (Commercial RC pass), `src/i18n/strings.js` header comment.

### 2026-07-02 - Claude Fable 5 - Commercial RC pass: HUD-B audit, dead-code cleanup, EN content i18n

- Status: `VERIFIED`
- Branch / commit: `main` / docs package `9933418`, code `616672b`; pushed to origin/main per explicit human instruction in this session's plan approval
- Scope: Human-approved plan (`.claude/plans/c-users-user-pictures-thumbnail-c-users-curried-mccarthy.md`). No GROUNDWORK files touched (index.html, src/state/**, pixiApp.js, assets/**, tools/**, scripts/** all untouched). i18n scope decision by human: EN only; Soul Talk dialogue pool excluded.
- Work performed:
  1. Gate 0 audit vs the UI v2 Aurora (variant B) reference pack (`C:\Users\User\Pictures\ＮＬＵＩＶ２`): confirmed the requested HUD state already shipped — quick-hud has settings gear only (no speaker button), all audio controls live in Settings (master/BGM/SFX sliders + mute toggle, persisted via `settings.volMaster/volBgm/volSfx` + `nexusLinkAudioMuted:v1`), `data-variant="B"` Aurora tokens active. Reference-pack items rejected as red-line violations: coin/gem resource chips (shop currency), notification toggles (FOMO), new `nexuslink_v2` localStorage key. Deferred (needs index.html GROUNDWORK): glowLevel/powerSave/voice settings rows.
  2. `src/app.js`: removed dead `bindAudioControls()` + call site (targeted the removed `#btn-audio-toggle`; sanctioned by `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md` §7.6).
  3. EN content i18n: extracted every hardcoded TC string in `src/ui/pageRouter.js` (page copy, action `<em>` subtitles, `data-status` action feedback, status lines, empty states, memory fallbacks, aria-labels, mood labels, `未標記時間`) into `src/i18n/strings.js` — 53 new keys with tc+en; sc/jp fall back to tc via existing `t()` fallback. `MOOD_LABELS` const replaced by `moodLabel()` with identical fallback semantics. Existing `LANGUAGE_CHANGED_EVENT` re-render reused; no new wiring.
- Verification: bundled Node `--check` on 3 changed files; migration suite 12/12; full web release gate on clean port 5196 **10/10 required, allAutomatedRequiredOk: true, 0 accessibility warnings** (note: default port 5173 is occupied by a foreign process on this machine — gate reuses it and fails with ERR_EMPTY_RESPONSE; use another port); live playtest gate vs :8128 **soul_talk 10/10, hud 13/13, 0 console errors**; Chromium preview manual QA at 390x844: fresh onboarding start→identity-skip→guidance→meet completes and persists, EN switch via real Settings UI then all four pages show **zero CJK leftovers** (only exception: BOND_MILESTONES theme `初亮的記憶` — content data, by scope), status line EN, switch back to tc clean, reload keeps onboarding completed + lang, Soul Talk strip bottom 752 < nav top 764 (no overlap), non-blaming return echo shown; 1280x900: intentional centered 480px column, no horizontal overflow. Independent artifact-only verifier: **PASS** — 73 t() keys cross-checked both directions (no dangling/unused), tc values byte-identical to removed literals, escapeHtml paths preserved, red-line copy audit clean (D6/K6/E5/H1/H2/H5 compliant).
- Problems / risks: (a) EN mode still shows TC for content-tier strings by design: milestone themes, companion display names, Soul Talk dialogue, map/codex/standoff modal internals — needs the content-translation pack; (b) static `index.html` strings without data-i18n remain TC in EN mode (notably HUD `等級 01` level pill, some modal headers) — one-line GROUNDWORK task each; (c) `formatDate` still hardcodes zh-TW locale (output is numeric MM/DD, effectively neutral); (d) real-device iOS Safari retest, 3-tester private test, legal/privacy/store copy remain human-only gates — public release still NOT APPROVED.
- Next safe action: human real-device retest (Soul Talk keyboard + first loop + EN spot check), then private-tester round per `docs/testing/PRIVATE_TEST_SCRIPT.md`; optional follow-up TASK_PACKs: sc/jp fill for the 53 new keys, GROUNDWORK micro-task for index.html data-i18n stragglers.
- Required reading: `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`, `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md`, `ACCEPTANCE.md` §K, this entry.

### 2026-07-02 - Codex - Commercial UI/UX Documentation Handoff

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted docs-only package
- Scope: Documentation governance and engineering handoff only. Created a readable commercial UI/UX entry point for the next Claude Code / Fable 5 TASK_PACK. No runtime code, state schema, assets, dependencies, build step, backend, LLM, deployment, commit, or push.
- Work performed: Added `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md` with current product position, readable canon summary, document authority table, Fable 5 execution boundary, GROUNDWORK restrictions, and acceptance references. Added `docs/handoff/FABLE5_COMMERCIAL_UIUX_TAKEOVER_PROMPT.md` as a paste-ready execution prompt. Updated `docs/README.md` to route agents through the commercial handoff and mark Master Canon / runtime map / asset pipeline / legacy docs status. Marked `docs/architecture/RUNTIME_MAP.md` as `NEEDS UPDATE` because stale facts must be verified against source before implementation.
- Verification: `git diff --check` passed. Scoped grep confirmed `NEEDS UPDATE`, `REFERENCE ONLY`, `nexusLinkPrototypeState:v2`, and `64x64` references are visible for triage. Scoped grep confirmed the new handoff/prompt do not authorize direct GROUNDWORK edits and explicitly prohibit FOMO, red dots, streaks, daily pressure, gacha, backend, LLM, npm, build step, React, and TypeScript.
- Problems / risks: Existing unrelated worktree changes remain outside this docs-only package, including in-progress runtime/UI files and generated QA JSON outputs. `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md` is readable in this checkout and remains the highest strategic canon; this package does not overwrite it.
- Next safe action: Give Claude Code / Fable 5 `docs/handoff/FABLE5_COMMERCIAL_UIUX_TAKEOVER_PROMPT.md` only after deciding the next commercial UI/UX TASK_PACK. Any implementation touching `index.html`, `src/state/**`, `src/pixi/pixiApp.js`, or `assets/**` still needs separate GROUNDWORK approval.
- Required reading: `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`, `docs/handoff/FABLE5_COMMERCIAL_UIUX_TAKEOVER_PROMPT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, and this lane.

### 2026-07-02 - Claude Fable 5 - First Session UX Repair TASK_PACK B (P1 first loop + copy diet)

- Status: `VERIFIED`
- Branch / commit: `main` / committed after TASK_PACK A (`30ef1fa`); pushed to origin/main per explicit human instruction
- Scope: Human-approved plan (`.claude/plans/chatgpt-ai-witty-starfish.md`) with explicit instruction to implement, commit, and push to main. GROUNDWORK touched per that plan: `defaultState.js` and `store.js`. No new localStorage key (K3); stage derived, not stored; no FOMO/red dots/countdowns/progress bars; skippable (K6).
- Work performed:
  1. GROUNDWORK: `defaultState.js` adds `onboarding.firstLoop { skippedAt: null, completedAt: null }`; `store.js` deep-copies `firstLoop` in `createDefaultState` and adds `normalizeFirstLoop()` inside `normalizeOnboarding` — legacy rule: a save with completed onboarding but NO `firstLoop` object (written before this feature) is backfilled `completedAt` so veterans and existing completed saves never run the loop (K4/K5); a save WITH the object keeps its nulls, so the veteran heuristic flipping true after the player's own first touch does NOT auto-complete their loop.
  2. New `src/ui/firstLoopController.js` (EXPERIENCE): store-subscription driven; derives stage touch→talk→trace→done from `firstTouchCompleted` / `chatHistory` player lines / `isEmotionalHabitatTrace` count; toggles `body.first-loop-active` + `data-first-loop-stage`; single dynamically-created hint line + quiet underlined skip link (`fl.skip` writes `skippedAt`); on done writes `completedAt`, shows `fl.reveal` once (~2.6s), nav fades back in 720ms with no fanfare. Re-renders on `LANGUAGE_CHANGED_EVENT`.
  3. Nav gating CSS (`ui-v3-onboarding.css`): during the loop the four non-core nav items are fully hidden (opacity 0 + pointer-events none, human-approved full-hide option) and set `inert`/`aria-hidden` by the controller; 心核 (home), soul-talk launcher, HUD, and settings stay available throughout; `prefers-reduced-motion` disables the fades.
  4. i18n: `fl.hintTouch/hintTalk/hintTrace/reveal/skip` added in tc/sc/en/jp (hints ≤10 chars tc).
  5. Copy diet (`pageRouter.js`): removed dev-speak leaking to players (「不擴張新區域」「維持單一夥伴模型」「Demo 章節」etc.); all `<em>` action hints now 6–10 chars; care soft-note 41→20 chars; `getPageStatus` lines shortened to single warm phrases. `ob.*` onboarding strings and `actionSheetController.getActionMeta` copy audited — already within budget, left unchanged.
  6. QA: extended `docs/qa/state-onboarding-migration-cases.mjs` with 4 firstLoop cases (fresh nulls; legacy backfill uses stored completedAt; mid-loop save NOT auto-completed despite veteran heuristic; skippedAt persists).
- Verification: bundled Node `--check` pass on all changed JS; migration suite **12/12**; full web release gate `--base http://localhost:5190` **10/10 required, allAutomatedRequiredOk: true**; live playtest soul_talk 10/10, HUD 13/13, 0 console errors; Chromium preview manual save-matrix: fresh save → onboarding → loop active with only 心核+心語 visible and touch hint → real canvas tap advances to talk hint (awakening toast shown) → first message creates trace → `completedAt` persisted, reveal line shown, nav un-gated → reload keeps full nav with no hint; skip link writes `skippedAt` and un-gates immediately; screenshot evidence of the gated first-session view. Note: nav fade opacity reads stale in a backgrounded preview tab (compositor throttling) — verified via `transition:none` computed value 0 and rule-match audit; not an app issue.
- Problems / risks: real-device pass still pending (human-only gate) for the loop hints and reveal; browser-level legacy-backfill was validated at Node level only (in-browser localStorage injection races the app's save queue — expected).
- Next safe action: human real-device checklist (Soul Talk keyboard + first loop together), then re-invite the three private testers using the six behavior questions in the plan file.
- Required reading: Lane 1 TASK_PACK A entry, `CLAUDE.md` §0.5.1/§5.1, `ACCEPTANCE.md` §K.

### 2026-07-02 - Claude Fable 5 - First Session UX Repair TASK_PACK A (P0)

- Status: `VERIFIED`
- Branch / commit: `main` / `30ef1fa` (pushed to origin/main)
- Scope: P0 fixes from private tester feedback, human-approved scope only. Explicitly forbidden and respected: no `defaultState.js`, `store.js`, `saveManager.js`, `pixiApp.js`, `assets/**`, no new localStorage keys, no new dependencies, reject cooldown / spam gate untouched, no commit/push. `index.html` untouched (feedback element is created dynamically at boot).
- Work performed:
  1. **Lost-send root cause (pre-existing on main, introduced by 84a19de)**: tapping 送出 blurred the input → `st-focus` removed → drawer animated 180ms away from under the pointer → click landed on stale coordinates → message silently lost. Fixed via `pointerdown` `preventDefault()` on `#send-button` (`soulTalkController.js` bind) so the input never blurs mid-tap; keyboard now stays open after sending. This alone took the live Soul Talk gate from 0/10 (baseline main, verified via `git stash` A/B run) to 10/10.
  2. Player-message visibility: `.chat-log` grid `align-content:end` (iOS WebKit unscrollable-overflow data loss) → flex column + `margin-top:auto` (`styles.css`); player bubble distinct cyan (aurora accent, no gold); consecutive-dedupe in `appendChatLine`/`renderChat` scoped to non-player roles (duplicate player sends were silently swallowed — reproduced and fixed); post-send scroll anchors the player's own line at the top of the visible area; render-signature skip stops unrelated state changes (heartbeat/save) from resetting chat scroll; re-scroll after the 180ms st-focus drawer transition and after panel open.
  3. Action-status de-pollution: `actionSheetController.commitNavAction` and `mapController.exploreNode`/energy-block no longer append `role:"system"` lines to chatHistory; they emit `HABITAT_STATUS_TOAST` instead (companion-voice reflections stay in chat). Persisted legacy system entries untouched; `.chat-line.system` restyled quieter. First-trace narrative line intentionally kept in chat.
  4. Companion tap feedback: new `src/ui/companionFeedbackController.js` (DOM toast, dynamically created, `aria-live=polite`, reduced-motion aware, tone classes accept/guarded/refusal/calm — refusal is neutral moon-grey, not error-red). `interactionController` emits `COMPANION_REACTION_FEEDBACK` synchronously before animation awaits at: normal reaction, awakening, wake-from-sleep (new visible line — night testers only ever hit this silent path), respect bonus, spam burst (copy localized to zh), blocked-touch cooldown. Boundary gates and their trust/defense consequences unchanged — visibility only.
  5. Onboarding name-input keyboard: replaced broken `kb-open`/`expectSoftKeyboard` machinery with keyboard model v5 (`body.ob-focus` pins the card to the top 42vh safe zone; `ui-v3-onboarding.css` kb-open block removed; `src/utils/dom.js` untouched/dormant).
- Verification: bundled Node `--check` pass on all 7 changed/new JS files; `python docs/qa/_run_web_release_gate.py --base http://localhost:8231 --no-server` **10/10 required, allAutomatedRequiredOk: true** (baseline before this pack: 9/10 — live playtest soul_talk 0/10); live playtest gate soul_talk 10/10, HUD 13/13, console errors 0; Chromium preview manual smoke (390×844): fresh-save onboarding, ob-focus pins card top ≤42vh with input visible, wake/hesitate/refusal toasts all visible <300ms via real canvas pointer events, duplicate "你好" sends both render (state+UI), Growth `trust_tuning` shows toast with chatHistory unchanged, player bubbles cyan right-aligned (screenshot verified).
- Problems / risks: (a) real-device iOS Safari + Messenger/IG in-app browser retest still required (human-only gate) — st-focus/ob-focus and the pointerdown send fix especially; (b) rapid clicks during a touch animation still return `animation_locked` silently by design (the playing animation is the feedback; spam gate is hard to reach via UI because locked taps don't increment spamScore — pre-existing tuning, out of scope); (c) quick replies remain hidden in st-focus mode (unchanged).
- Next safe action: human real-device mobile checklist, then commit/push approval; afterwards TASK_PACK B (progressive first-loop + copy diet) which requires GROUNDWORK approval for `defaultState.js`/`store.js` `onboarding.firstLoop` fields per the approved plan (`C:\Users\User\.claude\plans\chatgpt-ai-witty-starfish.md`).
- Required reading: `CLAUDE.md` §2/§5, `ACCEPTANCE.md` §K/§D, this entry.

### 2026-07-01 - Codex - Repo Main Deployment Sync

- Status: `VERIFIED`
- Branch / commit: `codex/raphael-core-main-review-gate` / current deployment commit
- Scope: Scoped integration for RaphaelCore agent classification, Linkara world/faction canon, commercial chapter/travel-trace guardrails, and the human-confirmed removal of the incorrect root Flametail Fox PNG. No `src/ai/**` runtime changes, no save schema or storage-key change, no backend, no LLM/API, no dependency, and no build step.
- Work performed: Kept the existing RaphaelCore constitution/architecture definitions as the current source of truth; synchronized Master Canon, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, legacy bible docs, runtime map/audit docs, and asset docs. Removed `assets/flametail-fox.png` after human review confirmed it depicted the wrong creature, then cleared stale runtime references in `data/creatures.json`, `src/data/assetManifest.js`, `src/data/companionRegistry.js`, and `src/engine/personalityProfile.js` so Flametail falls back to placeholder graphics until a new approved asset exists.
- Verification: Bundled Node `--check` passed for `src/data/assetManifest.js`, `src/data/companionRegistry.js`, and `src/engine/personalityProfile.js`; `data/creatures.json` parsed successfully; `git diff --check` passed; `node docs/qa/state-onboarding-migration-cases.mjs` passed 8/8; `python docs/qa/_run_web_release_gate.py --base http://localhost:8128 --port 8128` passed automated required checks 10/10 with asset integrity failures 0, responsive/accessibility warnings 0, Raphael restricted-agent 7/7, browser gates passing, and live UI/Soul Talk gate passing.
- Problems / risks: GitHub Pages still requires remote propagation after push. Human-only gates remain real-device mobile Safari/Chrome verification, moderated private testers, and legal/privacy/store-copy review. Flametail Fox is not runtime asset-ready until a new human-approved transparent PNG is produced.
- Next safe action: Push this scoped commit to the current branch and `main`, then verify `https://orochi771127.github.io/NexusLink/` after Pages updates. Any new Flametail image requires a separate asset approval-gated TASK_PACK.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`, `docs/raphael/RAPHAEL_CONSTITUTION.md`, `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`, `docs/agent/AI_EXECUTION_LEDGER.md`, `src/data/companionRegistry.js`, and `src/data/assetManifest.js`.

### 2026-07-01 - Codex - Linkara World And Faction Canon Sync

- Status: `VERIFIED`
- Branch / commit: `codex/raphael-core-main-review-gate` / included in current deployment commit
- Scope: Canon/spec synchronization for the supplied Linkara world map and character bible data. Locked the seven Linkara regions, three factions, five-element roster boundary, and neutral status for Greyshade Cat and Star-energy Boarlet. No map PNG import, no asset writes, no save schema, no unlock logic, no battle/team implementation, no dependency, no backend, no LLM/API, and no build step.
- Work performed: Updated Master Canon, World Bible, Character Bible, Runtime Canon, `AGENTS.md`, `CLAUDE.md`, and `ACCEPTANCE.md` so Linkara has seven named regions; Heartlight Council, Black Iron Hacker, and the Mundun Rift each own gold/wood/water/fire/earth roster slots; Black Iron secondary tags such as thunder/dark/order are style modifiers; extra Rift concepts such as `殘焰小獸` remain event/boss candidates rather than sixth roster slots; Greyshade Cat and Star-energy Boarlet are neutral. Updated `src/data/companionRegistry.js` display labels only for those two neutral companions.
- Verification: `git diff --check` passed for the scoped docs and registry files. Bundled Node `--check src/data/companionRegistry.js` passed. Scoped grep confirmed Linkara seven-region names, L6-L8 acceptance gates, neutral registry labels, and Rift boss-candidate wording are present.
- Problems / risks: This package does not integrate the attached world map image as a runtime asset; `src/ui/atlasController.js` remains the existing read-only SVG placeholder. Actual PNG import, region unlock progression, per-faction chapter data, offline `旅痕` state, or team battle all require separate TASK_PACKs; asset/state work needs GROUNDWORK approval.
- Next safe action: If the map should become a real in-game screen, open a GROUNDWORK asset/UI TASK_PACK to import an approved map image, audit mobile readability, and decide whether atlas data remains static or becomes chapter-gated state.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`, `docs/legacy-bible/02_WORLD_BIBLE.md`, `docs/legacy-bible/03_CHARACTER_BIBLE.md`, `docs/legacy-bible/04_RUNTIME_CANON.md`, `src/ui/atlasController.js`, `src/data/companionRegistry.js`, and this lane.

### 2026-06-30 - Codex - Commercial Core Canon v2 Docs

- Status: `COMPLETED`
- Branch / commit: `codex/raphael-core-main-review-gate` / included in current deployment commit
- Scope: Documentation-only canon and acceptance update for commercial chapter structure, RaphaelCore companion-agnostic positioning, player-facing `穩住裂隙` terminology, future `旅痕` offline adventure, and future-only同行/組隊 guardrails. No runtime code, state schema, storage key, assets, dependencies, backend, LLM/API, or build step changed.
- Work performed: Updated the Master Canon, `CLAUDE.md`, `AGENTS.md`, legacy Character Bible, legacy Runtime Canon, and `ACCEPTANCE.md` so Greyshade is the first validated runtime carrier rather than RaphaelCore itself; commercial content sells chapters/places/music/story/new encounters rather than skins, gacha, or battle power; `旅痕` is framed as a non-FOMO return-memory system; and future team play is allowed only as relationship/travel content, not farming or output ranking.
- Verification: Documentation grep confirmed the new terms and gates are present: `RaphaelCore 與角色外型解耦`, `first-session focal`, `穩住裂隙`, `旅痕`, `章節包`, no-gacha wording, no daily dispatch/farming wording, and `ACCEPTANCE.md` L1-L5. No browser/runtime tests were run because this package intentionally did not touch runtime files.
- Problems / risks: This is a canon/spec update only. Any actual per-companion state, offline adventure, chapter-commerce UI, or team system remains future work and must open a separate TASK_PACK with GROUNDWORK approval if it touches `defaultState.js`, `store.js`, `saveManager.js`, `index.html`, Pixi core, or assets.
- Next safe action: If implementation is requested, start with a docs-to-schema design TASK_PACK for per-companion relationship/travel memory state, then separately request GROUNDWORK approval before any state migration.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`, `docs/legacy-bible/03_CHARACTER_BIBLE.md`, `docs/legacy-bible/04_RUNTIME_CANON.md`, and this lane.

### 2026-06-30 - Codex - Web Release Gate Main-Review Automation

- Status: `VERIFIED`
- Branch / commit: `codex/raphael-core-main-review-gate` / already integrated before current deployment commit
- Scope: Release-gate and QA orchestration only. No save schema or storage-key change, no `saveManager.js`, no Pixi renderer rewrite, no `assets/**`, no dependency, no backend, no external LLM/API, and no deploy/merge/push.
- Work performed: Extended the web release gate with Raphael main-readiness coverage and fixed nested browser QA helpers so `NEXUS_QA_BASE` propagates to Raphael smoke, NLU smoke, and Stage 4 harnesses when the main gate runs on an alternate local port.
- Verification: `python -m py_compile docs/qa/_run_harness_smoke.py docs/qa/_run_nlu_smoke.py docs/qa/_run_stage4_human_playtest.py docs/qa/_run_raphael_main_readiness.py docs/qa/_run_web_release_gate.py`; `python docs/qa/_run_web_release_gate.py --base http://localhost:5178 --port 5178` passed automated required checks 10/10 with JS syntax 175 files / 0 failures, state migration 8/8, asset integrity pass, Raphael restricted-agent 7/7, responsive/accessibility probe pass, Raphael smoke pass, NLU smoke pass, Raphael main-readiness 24/24, Stage 4 pass, and live UI/Soul Talk gate pass.
- Problems / risks: The automated gate still lists human-only release blockers: real-device mobile Safari/Chrome verification, moderated private testers, legal/privacy/store-copy review, and explicit release approval. No commit, push, merge, or deploy was performed.
- Next safe action: Human release review can use `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md` and `docs/qa/_web_release_gate_output.json`; only after approval should a scoped commit/PR/release TASK_PACK be created.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md`, `docs/qa/_web_release_gate_output.json`, and this lane.

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

### 2026-07-02 - Codex - Raphael Preview Staging Integration

- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`
- Status: `VERIFIED`
- Branch / commit: `main` / pending commit for Phase 9.
- Scope: Phase 9 QA-only staging comparison between NexusLink live `runRaphaelCore()` and sibling `raphael-ai-engine` / mock gateway compatibility. Preview output remains debug/report only. No frontend API key, no external LLM, no LangGraph runtime dependency inside NexusLink, no save schema, no Pixi renderer, no assets, and no companion data change.
- Work performed: Added a read-only preview adapter, browser/Node staging cases, and a Node QA runner. `src/app.js` now query-gates the preview harness behind `?raphaelPreview=1`; normal live Soul Talk remains unchanged and still uses existing `runRaphaelCore()` as final authority. The sibling engine worker now accepts legacy `POST /v1/gateway` contract while returning `trusted:false`, `authorityReport.finalAuthority="RaphaelCore"`, and `advisorOverrideApplied=false`.
- Verification: NexusLink preview staging runner passed 6/6; state onboarding migration passed 8/8; changed JavaScript syntax checks passed; `raphael-ai-engine` full local regression passed, including gateway legacy 3/3, gateway maturity 7/7, NexusLink adapter probe 9/9, and Phase 4 expanded eval 167/167. Existing Python browser wrappers were blocked by missing `playwright.sync_api` in bundled Python. In-app browser local smoke confirmed page load, one canvas, Soul Talk launcher, and message input, but its old module cache prevented a conclusive `window.__RAPHAEL_PREVIEW_REPORT__` browser assertion in this session.
- Problems / risks: Browser preview report should be rechecked after a clean browser context or deployed staging build. Do not route preview output into player-facing chat, memory, trace, state, or animation without a separate approved TASK_PACK.
- Next safe action: Commit/push Phase 9 in both repos, then use `?raphaelPreview=1` on a clean staging context for phone-side QA. Keep live routing disabled until a separate human-approved gateway routing task.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `src/ai/raphaelCore.js`, `src/ai/external/raphaelPreviewAdapter.js`, `docs/qa/RAPHAEL_PREVIEW_STAGING_REPORT.md`, and sibling `raphael-ai-engine/gateway/worker-skeleton.js`.

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

### 2026-07-02 - Claude Fable 5 - First Session UX Repair TASK_PACK B (P1) — UI Visuals

- Status: `VERIFIED`
- Branch / commit: `main` / committed with the Lane 1 TASK_PACK B entry of the same name (see it for engineering detail)
- Scope: CSS + copy side of the first-loop pack. No assets, no gold outside selected/primary, no red-dot/badge/progress visuals (K6).
- Work performed: `ui-v3-onboarding.css` first-loop section — four non-core nav items fully hidden during the loop and revealed with a 720ms opacity fade; `.first-loop-hint` quiet cyan-line pill above the soul strip; `.first-loop-skip` low-contrast underlined text link; reduced-motion fallback. `pageRouter.js` player-facing copy shortened to 6–10 char hints, dev-jargon removed.
- Verification: Chromium 390×844 screenshot of the gated first session (sleeping Greyshade by Moonlake, single hint + skip, soul strip, lone 心核 nav item); reveal line and un-gated nav screenshot-verified after loop completion.
- Problems / risks: real-device visual pass pending, same as Lane 1.
- Next safe action: include the first-loop surfaces in the human real-device checklist.
- Required reading: Lane 1 entry `2026-07-02 - Claude Fable 5 - First Session UX Repair TASK_PACK B`.

### 2026-07-02 - Claude Fable 5 - First Session UX Repair TASK_PACK A (P0) — UI Visuals

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted (same package as the Lane 1 entry of the same name; see that entry for engineering detail and verification)
- Scope: CSS-only visual side of the P0 pack. No assets, no baked text/character, no gold outside selected/primary (aurora rule respected — player bubble uses cyan accent).
- Work performed: `styles.css` — `.chat-log` scroll model grid→flex (iOS-safe bottom anchor via `margin-top:auto`), `.chat-line.player` distinct cyan bubble (`rgba(138,217,255,…)`, right-aligned), `.chat-line.system` demoted to quiet 12px borderless side-note, new `.companion-feedback` toast (fixed, bottom-center above nav, tone variants accept/guarded/refusal/calm, refusal = neutral moon-grey not danger-red, `prefers-reduced-motion` fallback). `styles/ui-v3-onboarding.css` — removed dead `body.kb-open` block; added `body.ob-focus` rules pinning the onboarding card to the top 42vh keyboard-safe zone with internal scroll and compact type.
- Verification: Chromium preview 390×844 screenshots — chat drawer with cyan player bubbles distinct from companion bubbles; ob-focus card top=12px height 344px ≤ 42vh (354px) with input visible; toast visible states exercised for accept/guarded/refusal tones.
- Problems / risks: real-device visual pass (iOS Safari + in-app browsers) still pending, same as Lane 1.
- Next safe action: include these surfaces in the human real-device checklist before commit approval.
- Required reading: Lane 1 entry `2026-07-02 - Claude Fable 5 - First Session UX Repair TASK_PACK A (P0)`.

### 2026-07-02 - Codex - Commercial UI/UX Documentation Handoff

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted docs-only package
- Scope: Art/UI/UX handoff only. Established the commercial visual/UX execution entry point for a future Fable 5 First Session Flow and V3 UI/UX slice. No runtime styling, live UI CSS, image generation, asset movement, asset deletion, manifest change, or visual approval claim.
- Work performed: Added a current UI/UX handoff that locks Greyshade Cat + Moonlake as the first-session focus, points to the V3 visual system, defines the Start / Identity / Guidance / Home / Explore / Care / Growth / Memory / Soul Talk / Return Echo target surfaces, and prevents old 64x64 / R2 / legacy references from overriding the current illustrated 512 commercial direction. Added the Fable 5 prompt with explicit design rules and non-goals.
- Verification: `git diff --check` passed. Scoped grep confirmed `docs/asset-pipeline.md` is marked `NEEDS UPDATE` for commercial companion production and that the new handoff preserves the illustrated 512 policy while keeping legacy/R2 material as reference only.
- Problems / risks: This does not visually QA or implement the next UI/UX slice. Current worktree already contains unrelated in-progress UI/runtime changes by another agent; this package leaves them untouched.
- Next safe action: Before any Fable 5 visual implementation, read the commercial handoff and open a new TASK_PACK that names exact UI/CSS/runtime files and acceptance refs. Real-device mobile review remains a separate human gate.
- Required reading: `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`, `docs/handoff/FABLE5_COMMERCIAL_UIUX_TAKEOVER_PROMPT.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-06-30 - Codex - UI v2 Bottom Nav Release Screenshot Fix

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a053d79`, uncommitted UI/CSS release-review changes
- Scope: UI v2 bottom navigation fit only. Touched CSS layout, not `index.html`, not `assets/**`, not Pixi renderer, not save/state, not companion data, and not Raphael reasoning behavior.
- Work performed: Fixed release-review screenshot clipping where the desktop 1280x900 constrained habitat stage was 480px wide but `styles/page-full-nav.css` forced the bottom nav to 680px. The nav now uses five grid columns and a 430px desktop width so all five nav items fit inside the habitat frame while mobile keeps the existing `100vw - 32px` fit.
- Verification: Playwright bounding-box probe confirmed desktop stage `480px`, bottom nav `430px`, and all five buttons inside the stage. Final screenshots from the 5178 release gate show mobile 390x844 and desktop 1280x900 with all five nav items visible, Soul Talk not overlapping the nav, one Pixi canvas, and no console errors. The full web release gate passed 10/10 automated required checks after the fix.
- Problems / risks: Real-device Safari fit under browser chrome remains human-only. The CSS comments in nearby legacy sections still include mojibake; this task did not rewrite unrelated comments.
- Next safe action: Human visual review of the final screenshots and live device pass before any release approval.
- Required reading: `styles.css`, `styles/page-full-nav.css`, `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md`, `docs/qa/_web_release_gate_output.json`, and this lane.

### 2026-06-30 - Claude Code - 嚴格自審：鍵盤重量加 setTimeout 檢查點（不只靠 rAF）

- Status: `VERIFIED`（機制以 headless 證實，含 rAF 被停用情境；真機 iOS 為最終驗收）
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `04abb5a`。
- Layer: EXPERIENCE，**純 JS**（1 檔 `src/utils/dom.js`）。無 CSS／index.html／schema／assets。
- 嚴格自審發現: `04abb5a` 的 `syncViewportDuringTransition` **只靠 rAF 迴圈**。iOS Safari 在鍵盤動畫期間有時會節流/暫停 rAF —— 正是我們要追蹤的窗口；若 rAF 停擺，burst 不 tick → 黑塊可能重現。這正是「測試過卻在真機失敗」的殘留風險。
- Work performed: 在 `syncViewportDuringTransition` 內加 setTimeout 檢查點 `[60,140,260,420,620,820]ms`（依 durationMs 過濾），與既有 rAF 迴圈雙保險：rAF 正常時逐幀平滑追蹤；rAF 被節流時，setTimeout 仍在鍵盤動畫後重量到位、設好 `kb-open`/`--app-height`。重複呼叫只延長 rAF 截止。
- Verification: `node --check` OK、`git diff --check` clean、migration 8/8、web release gate **9/9、0 a11y warning、no failing node**、0 console error。Headless（fresh origin 8141 載入新碼）：focus 後 `setViewportVars` 被呼叫 **54 次**（rAF≈48 + setTimeout≈6）；**將 rAF stub 成 no-op（模擬 iOS 節流）後仍重量 6 次** → 證明 setTimeout belt 獨立有效；Soul Talk 開關正常、chat-log 359。
- Problems / risks: 真機鍵盤時序 headless 無法完全重現 → iPhone Safari + Chrome 實測為最終驗收（直向＋橫向）。
- Next safe action: 真機 `?v=<commit>` 實測：第一次 focus 即「輸入框貼鍵盤上方、無黑塊」免拖曳。
- Required reading: 本 lane（含 `04abb5a`）、`CLAUDE.md` §4/§5。

### 2026-06-30 - Claude Code - 鍵盤動畫窗口內持續重量 viewport（首次 focus 即自適應，免手動拖曳）

- Status: `VERIFIED`（機制以 headless 證實；真機 iOS 為最終驗收）
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `4b83daa`。
- Layer: EXPERIENCE，**純 JS**（2 檔：`src/utils/dom.js`、`src/ui/soulTalkController.js`）。無 CSS／無 index.html／無 schema／無 assets／無 Raphael 行為變更。
- 背景（真機回報，P0）: 部署版（`4b83daa`）在真 iPhone Safari + Chrome，第一次點 Soul Talk 輸入框、鍵盤彈出時**仍有大黑塊**；要**手動拖曳/捲動**才會跳成正確版面（輸入框貼鍵盤上方）。截圖佐證：黑塊狀態仍顯示聲紋 waveform，而 compact 模式在 `kb-open` 時會隱藏 waveform → 證明**首次 focus 當下 `body.kb-open` 沒被設**。
- 根因: `soulTalkController` focus handler 只在 rAF + double-rAF（~16–32ms）重量一次 viewport，但 iOS 虛擬鍵盤要 ~250–350ms 才動畫完成 → 重量發生在鍵盤開之前 → `--app-height` 維持全高、`kb-open` 沒設 → 黑塊。之後唯一可靠修正它的事件是使用者手動拖曳產生的 `visualViewport.scroll`（已綁定 → 修正）。幾何（Codex `2fcb905` 的 visual-viewport 錨定 + 本人 `895b038/4b83daa` 的 chat-log 自適應）本來就對，缺的只是**重量時機**。
- Work performed:
  - `src/utils/dom.js`：新增 `syncViewportDuringTransition(durationMs=800)` —— focus/blur 後在整段鍵盤動畫窗口內，每一幀呼叫 `setViewportVars()`（rAF 迴圈、有截止時間、重複呼叫只延長截止不起第二迴圈）。`setViewportVars`/`bindViewportVars` 及既有 visualViewport listener 不動（穩態路徑）。
  - `src/ui/soulTalkController.js`：focus → `syncViewportDuringTransition(800)`（取代原 rAF×2），blur → `syncViewportDuringTransition(600)`；focus 時保留 chatLog 捲到底。移除不再使用的 `setViewportVars` import。
  - 效果：鍵盤一開始壓縮 viewport 的那一幀，`kb-open` 立即翻開、`--app-height`/`--vv-offset-top` 逐幀跟上 → drawer 即時升到鍵盤上方，**第一次 focus 就是正確版面，免手動拖曳**（對應 ChatGPT 建議與驗收）。
- Verification: `node --check`(2 JS) OK、`git diff --check` clean、migration 8/8、web release gate **9/9、0 a11y warning、no failing node**、0 console error。Headless 機制驗證：focus 事件後 `setViewportVars` 在 ~800ms 內被呼叫 **49 次**（修前 2 次）；rAF/setTimeout 在預覽可正常觸發；Soul Talk 開關正常、chat-log 359（≥96）。（headless 無法彈真 iOS 鍵盤、且 `location.reload()` 會吃舊 ES module 快取 → 用新 port 8137 fresh origin 載入新碼後才量到 49 次。）
- Problems / risks: 真機鍵盤的 `visualViewport` 時序/捲動狀態 headless 無法完全重現 → **iPhone Safari + Chrome 實測為最終驗收**（直向＋橫向）。rAF 在前景可見頁正常觸發（已驗證），低電量節流屬極端例外。
- Next safe action: 真機 `orochi771127.github.io/?v=<commit>`：開 Soul Talk → 點輸入 → 鍵盤彈出 → **第一次就應呈現「輸入框貼鍵盤上方、無黑塊」**、免拖曳；打多行、收合再開、直向＋橫向。
- Required reading: 本 lane（含 `4b83daa`/`895b038`/`2fcb905`）、`CLAUDE.md` §4/§5、計畫 `safari-chrome-chatgpt-web-resilient-curry.md`。

### 2026-06-30 - Claude Code - 嚴格自審：chat-log 自適應下限加裝置餘裕（200→240px）

- Status: `VERIFIED`（模擬 + gate；真機 iOS 仍需最後一次實測確認）
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `895b038`。
- Layer: EXPERIENCE，**純 CSS**（1 檔 `styles/soul-talk-drawer.css`，1 行）。無 JS／無 index.html／無 schema／無 assets。
- 嚴格自審發現: `895b038` 的 `clamp(0, --app-height - 200px, 96px)` 中 200 = headless Chrome 量到的 drawer 固定開銷，floor 剛好等於可用空間（**零餘裕**）；真機字體度量若多幾 px，floor 會再次超過可用空間、輸入框被裁切幾 px。
- Work performed: 常數 200→240（多 ~40px 餘裕），讓 floor 在所有小高度都「嚴格 < 可用空間」，輸入框保證可見。因 chat-log 以 flex 填滿可用空間、floor 只是下限，正常高度行為完全不變。
- Verification: 模擬鍵盤可視高度 420/360/300/260/220/**190**（極端橫向）six 檔，**輸入框＋送出全部可見**、drawer 距鍵盤 8px、chat-log 213→4 平滑降；real 390×844 chat-log 359、real 390×390 chat-log 133（floor 96，無 regression）。全套 session regression 複驗：nav margin 16/16、HUD 無 speaker、五鍵語意 icon+label、四頁 nav active 正確、page↔心語條 overlap=0（settled；量到 70 是 launcher 180ms transition 的量測競態，非 regression）、modal nav lock、Soul Talk close→none。`git diff --check` clean、migration 8/8、web release gate **9/9、0 a11y warning、no failing node**、0 console error。
- Problems / risks: chat-log 在極端小可視高度（~190）僅 ~4px（但輸入框可見＝優先正確）。真機 iOS 仍是最終驗收（headless 無法彈真鍵盤）。
- Next safe action: iPhone Safari 實測（直向＋橫向）Soul Talk 鍵盤；確認無黑塊、輸入框恆可見。
- Required reading: 本 lane（含 `895b038` / `2fcb905`）、`CLAUDE.md` §4/§5。

### 2026-06-30 - Claude Code - Soul Talk 鍵盤自適應補強（chat-log 下限隨可視高度縮放）

- Status: `VERIFIED`（模擬 + gate；真機 iOS 仍需最後一次實測確認）
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `2fcb905`（Codex 的 iOS Safari keyboard 修復）。
- Layer: EXPERIENCE，**純 CSS**（1 檔：`styles/soul-talk-drawer.css`，1 行）。無 JS／無 index.html／無 schema／無 assets。
- 背景: 先獨立驗證了 Codex `2fcb905`（移除 scrollIntoView + 把 soul 面板鎖進 visual viewport）—— 程式碼根因正確、無 regression、gate 9/9、模擬幾何正確（panel-layer=可視區、drawer 距鍵盤 8px）。但在**小可視高度**（大鍵盤 / 橫向，模擬 --app-height≤~280）時量到**殘留問題**：我上一包加的 `chat-log { min-height:96px }` 固定下限，會把 drawer 內容（header+chatLog+輸入列）撐得比可用高度高，**輸入框被擠到鍵盤下方看不到**（visible 260 → input bottom 280）。
- Work performed: 把 chat-log 下限從固定 `96px` 改為 `clamp(0px, calc(var(--app-height,100dvh) - 200px), 96px)` —— 可視高度大時保 96px 可讀，鍵盤越大下限越小、把空間讓給輸入列。純 CSS、吃 dom.js 既有的 `--app-height`（visualViewport 高），不需 JS。
- Verification（預覽 8128 模擬鍵盤開啟、手動灌 --app-height）：修後 visible 390/320/260/220 四種鍵盤大小下，**輸入框＋送出皆在可視區內**、drawer 距鍵盤 8px、chat-log 自動縮 183/113/60/20；real 390×844 chat-log 359（下限 96）、real 390×390 chat-log 133（上一包驗收保留，無 regression）。`git diff --check` clean、state migration 8/8、web release gate **9/9、0 a11y warning、no failing node**、0 console error。
- Problems / risks: `200px` 為 drawer 固定開銷（header+輸入列+間距）的估計常數，極小可視高度（~220）時 chat-log 只剩 ~20px（但輸入框可見＝優先正確）。真機 iOS Safari 鍵盤 visualViewport 時序 headless Chrome 無法完全重現，**最終仍需 iPhone 實測**（`?v=<commit>` 略過快取）；使用者先前回報的黑塊截圖極可能是舊版快取。
- Next safe action: 真機 iPhone Safari：開 Soul Talk → 點輸入 → 鍵盤彈出 → 打多行 → 收 → 再開，確認無黑塊且輸入框恆可見（含橫向）。
- Required reading: 本 lane（含 `2fcb905` 與上一包 First-time UX）、`CLAUDE.md` §4/§5。

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

### 2026-07-01 - Codex - RaphaelCore Agent Classification Canon

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `b56886c`, uncommitted docs-only classification update
- Scope: Documentation-only RaphaelCore classification sync before any commit/push. Defined RaphaelCore as a Stateful Companion Cognition Agent and clarified that Gateway / LangGraph / training bundles are advisory only. No `src/ai/**` runtime files were modified by this package; existing uncommitted Raphael runtime changes remain separate.
- Work performed: Updated `docs/raphael/RAPHAEL_CONSTITUTION.md`, `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`, Master Canon, `AGENTS.md`, `CLAUDE.md`, and `ACCEPTANCE.md` with the accepted classification: safety-gated, memory-bearing, boundary-aware, companion-agnostic, game-integrated. Explicitly rejected autonomous task agent, tool/web-search agent, therapy/crisis agent, customer-service assistant, sycophantic chatbot, generic NPC dialogue bot, and free multi-agent crew interpretations.
- Verification: `git diff --check` passed for the scoped docs. Scoped grep confirmed `Stateful Companion Cognition Agent`, advisory-only Gateway/training language, and `ACCEPTANCE.md` L9 are present.
- Problems / risks: External product/framework comparisons from the discussion were intentionally not added to canon because they are research context, drift-prone, and would need sourced review. Any implementation of new modules such as BoundaryPolicy or MemoryTracePolicy should be a later runtime TASK_PACK with tests and red-line review.
- Next safe action: If committing, keep this docs-only classification update in the same docs/canon commit as the Linkara/commercial canon updates, while keeping unrelated existing `src/ai/**` runtime changes out unless explicitly approved.
- Required reading: `docs/raphael/RAPHAEL_CONSTITUTION.md`, `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-06-30 - Codex - Raphael Training Adapter Main-Review Gate

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a053d79`, uncommitted Raphael adapter / QA changes
- Scope: Static Raphael training bundle advisory integration and release-review QA only. RaphaelCore remains final authority; the bundle is not trusted, does not call external APIs, does not import LangGraph runtime, does not write memory directly, and cannot override safety/boundary gates.
- Work performed: Integrated the generated offline training bundle through `src/ai/raphaelTrainingAdapter.js`, exposed advisory hints through NLU/response strategy only behind allowlists, added 12 original bundle fixtures plus 12 expanded main-readiness cases, and fixed three automatable policy gaps: ASCII keyboard gibberish reward, possessive-language reward, and emotional-blackmail boundary routing.
- Verification: `raphael_main_readiness` passed 24/24 with 0 forbidden phrases, 0 safety failures, 0 boundary failures, 0 noise failures, and 0 console errors. The final web release gate on port 5178 passed automated required checks 10/10, including Raphael smoke, NLU smoke, Stage 4, live Soul Talk/HUD, asset integrity, and state migration. Source scan found no `fetch(`, external provider/API key marker, `@langchain`, or frontend LangGraph runtime import in the touched adapter path.
- Problems / risks: Training proposal `canAutoMerge:false` remains a human-review blocker for production policy changes. Public launch is still blocked by real-device verification, moderated private testers, legal/privacy/store-copy review, and explicit release approval. No commit, push, main merge, or deploy was performed.
- Next safe action: Human release review of the narrow diff and QA evidence; do not mark `READY_FOR_MAIN` or deploy until manual release gates are complete and a separate release TASK_PACK is approved.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md`, `docs/qa/_web_release_gate_output.json`, `src/ai/raphaelTrainingAdapter.js`, `src/ai/testHarness/raphaelTrainingBundleCases.js`, and this lane.

### 2026-06-30 - Codex - Static Raphael Training Bundle Adapter

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted integration TASK_PACK; no deploy, no push, no main merge.
- Scope: Integrated the offline LangGraph local training output as static advisory data only. RaphaelCore remains final authority; safetyShield, existing intent policy, memory writer, save schema, companion data, Pixi renderer, assets, package files, and external model gateway behavior were not changed.
- Files touched: `src/data/ai/raphaelTrainingBundle.js`, `src/ai/raphaelTrainingAdapter.js`, `src/ai/nlu/runNluPipeline.js`, `src/ai/responseStrategySelector.js`, `src/ai/raphaelCore.js`, `src/ai/testHarness/raphaelTrainingBundleCases.js`, `docs/qa/_run_raphael_training_bundle.py`, and this ledger.
- Work performed: Added a static generated bundle from the independent lab, an allowlisted advisory adapter with `trusted: false`, weak-pattern protection, high-risk advisor suppression, dependency policy-only advisory behavior, and narrow NLU/strategy metadata wiring. Added a 12-case browser QA harness covering normal, dependency-pressure, and high-risk cases.
- Verification: `node --check` passed for changed JS and bundle. `git diff --check` passed. New Raphael training bundle gate passed 12/12 with 0 console errors; high-risk input had no advisor candidate, no reward, no memory write, and no gameplay framing; dependency pressure had `trusted: false` boundary-policy advisory only, no reward, and no memory write. Existing gates passed: RaphaelCore smoke 17/17, NLU smoke 8/8, NLU training 13/13, Stage 4 10/10, web release gate required checks 9/9 including mobile 390x844, single Pixi canvas, storage persistence, and 0 console errors.
- Problems / risks: Training output is still `canAutoMerge: false`; this is staging-ready only, not main-release-ready. One social-conflict training fixture still trips the existing hard pressure gate because RaphaelCore treats that phrasing conservatively; the adapter intentionally does not override hard gates. Review in staging before any broader NLU policy change.
- Next safe action: Human review of this narrow diff, then staging/preview only. Do not mark READY_FOR_MAIN and do not merge/push to main without a separate release TASK_PACK and human approval.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `src/ai/raphaelCore.js`, `src/ai/safetyShield.js`, `src/ai/nlu/runNluPipeline.js`, and the independent lab output under `C:\Users\User\NexusLink_RaphaelAI_Workspace\raphael-gateway-server-langgraph`.

### 2026-06-30 - Codex - Raphael Training Adapter Main-Readiness Gate

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted automated main-readiness extension; no deploy, no push, no main merge.
- Scope: Advanced the static training adapter from staging-only automated coverage to main-review automated coverage. Added expanded regression cases for empty input, ASCII gibberish, emoji-only input, long emotional dump, half-joking high-risk disclosure, apology-then-boundary pressure, possessive phrasing, emotional blackmail, healthy intimacy, multilingual input, mixed UI report, and repeated pressure. No save schema, companion data, Pixi renderer, assets, package files, or external model behavior changed.
- Files touched: `src/ai/inputGateway.js`, `src/ai/intentClassifier.js`, `src/ai/testHarness/raphaelTrainingBundleCases.js`, `docs/qa/_run_raphael_main_readiness.py`, `docs/qa/_run_web_release_gate.py`, `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md`, and this ledger.
- Work performed: The new gate initially caught three real policy gaps: ASCII keyboard gibberish could receive relationship reward, possessive phrasing could receive relationship reward, and emotional blackmail was not routed to no-reward boundary behavior. Fixed these through narrow input-quality and pressure-intent guards.
- Verification: `node --check` passed for `inputGateway.js`, `intentClassifier.js`, and the expanded harness. `python -m py_compile` passed for the new runner and release gate. `docs/qa/_run_raphael_main_readiness.py` passed 24/24 with 0 console errors, 0 safety failures, 0 boundary failures, and 0 noise failures. Updated `docs/qa/_run_web_release_gate.py` passed with automated required checks 10/10, including the new main-readiness gate, mobile 390x844 probe, storage migration, asset integrity, single Pixi canvas, and 0 console errors.
- Problems / risks: Automated engineering gates are now ready for main review, but Codex still cannot honestly mark public launch complete. Remaining blockers are real-device verification, moderated private testers, legal/privacy/store-copy approval, human review of `canAutoMerge:false` training proposals, and an explicit human-approved release TASK_PACK.
- Next safe action: Human release review. If approved, create a dedicated release branch/PR or release TASK_PACK; do not self-merge or deploy from this uncommitted workspace state.
- Required reading: Same as the previous Static Raphael Training Bundle Adapter entry, plus `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md` and `docs/qa/_web_release_gate_output.json`.

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

### 2026-07-01 - Codex - UI v1 Structure / UI v2 Color Takeover

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-shell-consolidation` / uncommitted takeover from interrupted Claude Code work.
- Scope: Preserve UI v1 information architecture and functional content while using UI v2 Aurora/Nocturne color tokens. Bottom navigation keeps the existing four CSS-mask icon drawings. No merge from `origin/codex/ui-v2-aurora-parity`, no storage-schema migration, and no companion/Pixi/asset changes.
- Work performed: Replaced the interrupted A/B/C variant direction with a fixed `styles/ui-core.css` color adapter; removed runtime `data-variant` handling; restored the bottom-nav entry behavior to the v1 action-sheet modal flow; kept V2 color material for nav, modal, Soul Talk, and Standoff surfaces.
- Verification: `git diff --check`; bundled Node `--check` for changed JS; in-app browser at `http://127.0.0.1:8790/` with 390x844 viewport. New-player onboarding advanced to Home, Home Soul Talk strip and bottom nav had 0px overlap, Explore/Care/Growth/Memory all opened v1 action sheets with `activePage=home`, Explore action sheet opened the map, and Rift Observation Point triggered full-screen Standoff with bottom nav `display:none`.
- Problems / risks: Python release gate did not run because the bundled Python environment lacks `playwright.sync_api`; this was not resolved by installing dependencies. A real iPhone Safari keyboard retest is still required for Soul Talk.
- Next safe action: Human review on phone. If accepted, run or provision the release gate environment, then commit/push only this scoped UI takeover.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/agent/AI_EXECUTION_LEDGER.md`, UI v1 handoff, and UI v2 design handoff.

### 2026-07-01 - Codex - Soul Talk / Standoff Mobile Guardrails

- Lane: `Game Engineering And Architecture`
- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-shell-consolidation` / uncommitted takeover from interrupted Claude Code work.
- Scope: Repair interrupted mobile layout work without touching `saveManager.js`, `store.js`, `defaultState.js`, `pixiApp.js`, `src/state/**`, `src/pixi/**`, or `assets/**`.
- Work performed: Rewrote `src/utils/dom.js` into a clean visualViewport-only model and restored the exported `expectSoftKeyboard` / `clearSoftKeyboardExpectation` wrappers needed by onboarding. Soul Talk now uses passive viewport remeasurement with no `scrollIntoView` and no extra `--kb-inset` push. Added a body-level active-panel hook so Standoff can hide bottom nav while keeping other v1 modals above the nav.
- Verification: Bundled Node `--check` passed for `src/app.js`, `src/ui/actionSheetController.js`, `src/ui/panelManager.js`, `src/ui/soulTalkController.js`, `src/ui/onboardingController.js`, and `src/utils/dom.js`. `docs/qa/state-onboarding-migration-cases.mjs` passed 8/8. In-app browser console had 0 warnings/errors after onboarding, v1 nav modal checks, Soul Talk focus, map open, and Standoff trigger.
- Problems / risks: Browser automation cannot prove the physical iPhone Safari keyboard state; it verified focus and desktop visualViewport fallback only. Python release gate was blocked by missing Python Playwright.
- Next safe action: Real-device iPhone Safari retest of onboarding input and Soul Talk input; if a black region remains, capture `innerHeight`, `visualViewport.height`, `visualViewport.offsetTop`, `--app-height`, `--vv-offset-top`, and drawer/panel rects.
- Required reading: `src/utils/dom.js`, `src/ui/soulTalkController.js`, `src/ui/onboardingController.js`, `styles/soul-talk-drawer.css`, `styles/mobile-safari-polish.css`, and the UI takeover entry above.

### 2026-07-01 - Claude - Soul Talk Keyboard Black-Gap: Static Top-Anchor (No Detection)

- Lane: `Game Engineering And Architecture`
- Status: `VERIFIED` (desktop regression only; real-device iOS retest requested from human before commit/push)
- Branch / commit: `integrate/ui-v2-shell-consolidation` / uncommitted, awaiting human real-device confirmation before commit/push
- Scope: Fix the iOS Soul Talk keyboard black-gap by dropping keyboard-height detection for this component entirely. Touches only `src/ui/soulTalkController.js`, `styles/soul-talk-drawer.css`, `styles/mobile-safari-polish.css`. No `saveManager.js`, `store.js`, `defaultState.js`, `pixiApp.js`, `src/state/**`, `src/pixi/**`, `assets/**`, or onboarding files changed.
- Work performed: Ran three rounds of real-device diagnostics via a throwaway `kbtest.html` page (deployed to GitHub Pages, tested by human on real iPhone Chrome + Safari) before touching the app. Findings: (1) `visualViewport.height`/`innerHeight` never update when the keyboard opens on this device, under both `interactive-widget=resizes-visual` and `resizes-content`; (2) `position:fixed` itself breaks while the keyboard is shown (a top-pinned fixed diagnostic panel visibly scrolled away with the page); (3) native browser scroll-into-view also can't be trusted (same underlying broken signal starves it too). Separately found `styles/soul-talk-drawer.css` and `styles/mobile-safari-polish.css` had two independently-authored, conflicting `body.kb-open` rules targeting the same drawer — the more specific, later-loaded one always won silently — which explains why prior fix attempts (scroll-nudge, estimate fallback, the position:fixed panel-layer pin above it) produced inconsistent real-device results. Replaced all of it with a detection-free rule: `soulTalkController.js` toggles `body.st-focus` directly on `#message-input` focus/blur (no viewport math, no scroll, no measurement); CSS pins `.soul-talk-drawer` to a static `top` / `42vh` zone anchored at the screen top, which stays clear of any keyboard by construction (this session's real measurements put keyboard height at ~45-58% of screen; 42vh from the top unconditionally leaves the bottom 58%+ free, no detection needed). Removed the losing `body.kb-open .panel-layer[data-active-panel="soulTalk"]` block from `mobile-safari-polish.css` entirely so the drawer has a single CSS owner.
- Verification: Bundled Node `--check` on `soulTalkController.js`; `git diff --check` clean on all three files. Desktop preview (375x812): opened Soul Talk, focused `#message-input`, confirmed `body.st-focus` toggles true/false correctly on focus/blur, drawer visually moves to the top zone and back with no console errors and no failed network requests, chat history/render unaffected. Cannot verify the actual keyboard-avoidance claim in desktop preview (no real software keyboard) — same limitation as the Codex entry above; requires the human's real iPhone retest.
- Problems / risks: `--kb-inset` / `--app-height` / `kb-open` machinery in `src/utils/dom.js` is now unused by Soul Talk but still used by `onboardingController.js` (name-input page) — left untouched, out of scope for this pack. No rule reads `kb-open` for `.soul-talk-drawer` anymore, so it is inert for this component by design even if a future device reports keyboard height correctly.
- Next safe action: Human real-device retest (same phone, Chrome + Safari) of the actual Soul Talk drawer itself (not kbtest.html) — focus the input, confirm the drawer sits in the top zone with no black gap. If confirmed, commit and push only `src/ui/soulTalkController.js`, `styles/soul-talk-drawer.css`, `styles/mobile-safari-polish.css`, and this ledger entry.
- Required reading: `src/ui/soulTalkController.js`, `styles/soul-talk-drawer.css`, `styles/mobile-safari-polish.css`, and the two Codex entries directly above (their `dom.js`/`mobile-safari-polish.css` intent motivated part of this cleanup).

### 2026-07-02 - Codex - Heartspark Canon Roster Cleanup And Codex Data

- Lane: `Game Engineering And Architecture`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped commit for this package.
- Scope: Remove old non-animated generated companion records that confused the live character roster, then add the approved Heartspark Council v0.6 roster as canon-only Codex display data. No `saveManager.js`, `store.js`, `defaultState.js`, active companion migration, localStorage schema, animation loader, Pixi renderer, or external dependencies changed.
- Work performed: Removed stale non-animated placeholder companion IDs from `src/data/companionRegistry.js`, removed their legacy Codex evolution lines, removed the rejected/static Flametail fallback from `data/creatures.json` and `src/data/assetManifest.js`, and changed the generic fallback creature to `greyshade-cat`. Added `src/data/heartsparkCouncilCanon.js` for `auriowl`, `sprigfawn`, `crystalfin-seahorse`, `blazetail-kit`, and `starstripe-cub`, updated `src/ui/codexController.js` so these five appear as canon roadmap entries with three-stage evolution display rather than runtime-selectable companions, and tightened `styles.css` so Codex canon detail wraps on mobile.
- Verification: Bundled Node `--check` passed for touched JS modules. `data/creatures.json` parsed. Scoped grep confirmed old non-animated IDs no longer appear in runtime data paths and the six animated roots remain present. `docs/qa/state-onboarding-migration-cases.mjs` passed 8/8. In-app Browser QA at `http://127.0.0.1:8137/` confirmed the Codex list shows all five canon entries, Starstripe Cub detail shows the three-stage canon line and `Canon display only / not runtime-ready`, console warnings/errors were 0, and 390x844 geometry had no horizontal overflow (`scrollWidth=390`, Codex panel within 16-374px). `git diff --check` passed.
- Problems / risks: The five new canon characters are display/scaffold only and intentionally do not create `animations.json`; they are not runtime-ready and cannot be selected until a separate asset-readiness/migration task creates approved sheets.
- Next safe action: When real animated sheets are approved for any one canon character, open a separate GROUNDWORK asset-readiness task to add its manifest and then decide whether it enters `COMPANIONS`.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `src/data/heartsparkCouncilCanon.js`, `src/ui/codexController.js`, `src/data/companionRegistry.js`, `styles.css`, and this lane.

### 2026-07-02 - Codex - Heartspark Canon Animation Folder Scaffold

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped commit for this package.
- Scope: Asset tree cleanup plus official scaffold creation only. Protected animated runtime roots were left untouched: `greyshade-cat`, `flame-flicker`, `ice-talon`, `stone-shard`, `vine-twist`, and `crystal-rabbit`.
- Work performed: Deleted the non-animated old generated roots `assets/characters/flame-tail-fox/` and `assets/characters/thunder-pup/`. Added scaffold folders under `assets/characters/` for `auriowl`, `sprigfawn`, `crystalfin-seahorse`, `blazetail-kit`, and `starstripe-cub`, each with metadata and empty tracked `spritesheets/emotion`, `touch`, `daily`, `movement`, and `battle` categories.
- Verification: Filesystem checks confirmed the deleted old roots are absent and protected animated roots are still present with `metadata/animations.json`. The new scaffold metadata marks `runtimeReady:false` and does not create runtime manifests.
- Problems / risks: The scaffold does not imply visual approval or runtime readiness. Do not place generated PNGs in these folders without human visual approval and asset QC.
- Next safe action: Use these folders only as targets for future approved illustrated 512x512 transparent sheet generation; keep old reference images out of runtime paths unless explicitly approved.
- Required reading: `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-02 - Codex - Fable 5 Raphael Agent Handoff Package

- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`
- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted docs-only package.
- Scope: Prepare a controlled Fable 5 handoff for Raphael AI maturity work. No runtime integration, no external API, no gateway live routing, no save schema, no Pixi renderer, no companion data, no package/dependency, and no deployment changes.
- Work performed: Added a Fable 5 Raphael-specific prompt, a local Raphael artifact inventory, and a Raphael Agent System Architecture V1 that maps the desired central-agent capability into NexusLink-safe layers: input, RaphaelCore final authority, controlled intelligence ring, advisory gateway, and approved output layer. The handoff explicitly keeps LangGraph/Gateway/training/model output advisory only and blocks direct memory/state mutation, high-risk gameplay framing, and dependency rewards.
- Verification: `git diff --check` passed for the docs-only patch. The codebase-memory index for this checkout was present and ready. No JavaScript/runtime files were touched by this package.
- Problems / risks: Existing older Raphael Chinese handoff/constitution files display mojibake in this environment; they remain authority references but should not be copied verbatim into new runtime code until a separate encoding/readability repair pass is approved.
- Next safe action: Give Fable 5 `docs/handoff/FABLE5_RAPHAEL_AGENT_HANDOFF_PROMPT.md` as its starting prompt. Its first implementation should stay in docs/eval/QA or return to Codex review before any runtime path is changed.
- Required reading: `docs/handoff/FABLE5_RAPHAEL_AGENT_HANDOFF_PROMPT.md`, `docs/raphael/RAPHAEL_LOCAL_ARTIFACT_INVENTORY.md`, `docs/architecture/RAPHAEL_AGENT_SYSTEM_ARCHITECTURE_V1.md`, `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`, `docs/raphael/RAPHAEL_CONSTITUTION.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-02 - Codex - Linkara Map And BGM Asset Staging

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / current scoped commit
- Scope: Human-approved GROUNDWORK asset staging for the supplied Linkara world map, seven region backgrounds, and matching BGM. Added machine-readable staging data for future world-map redraw decisions and scene-switch keys. No `src/**` runtime wiring, no `src/data/assetManifest.js`, no save schema, no unlock logic, no Pixi scene switching, no backend, no dependency, and no build step.
- Work performed: Copied the approved source images into `assets/backgrounds/linkara/` and region subfolders, copied the approved MP3s into `assets/audio/linkara/`, added `manifest.json` for source attachment pairing, added `linkara-map-data.json` with seven-region coordinates, scene keys, fit notes, and live-readiness decisions, and added a Linkara asset README.
- Verification: Confirmed copied destination files exist, source and destination byte counts match, all staged images keep their expected dimensions (`1280x720` region scenes and `1178x1280` world map), `manifest.json` and `linkara-map-data.json` parse as JSON, manifest paths resolve, `git diff --check` passed, and the scoped staged set contains only this Linkara asset package plus this ledger entry.
- Problems / risks: The world map JPG is useful as a reference or large atlas panel but needs mobile readability review before live use because labels are baked into the image. Region backgrounds are landscape `16:9` assets; using them as active mobile-first habitat backgrounds requires future scene profiles, cover/crop anchors, or vertical redraws. Central Radiant Core and Southern Harbor Nexus BGM pairings are staged from available filenames and should receive listening review before final runtime use.
- Next safe action: Open a separate GROUNDWORK runtime task if the world map should replace the current SVG atlas or if scene switching should become active. That task should choose live atlas image sizing, add scene profiles, and route BGM through the existing audio manager with fades and volume caps.
- Required reading: `assets/backgrounds/linkara/README.md`, `assets/backgrounds/linkara/manifest.json`, `assets/backgrounds/linkara/linkara-map-data.json`, `src/ui/atlasController.js`, `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-03 - Codex - Linkara Habitat Layering And Visual Locks

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped docs commit for this package.
- Scope: Docs-only planning/index package for seven Linkara habitat backgrounds. Added layered art-production locks, per-region Scene Profile drafts, prop/trace separation rules, Moonlake replacement protocol, and generation TASK_PACKs. No `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, BGM routing, scene switching, external dependency, or runtime wiring changed.
- Work performed: Added `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`. The document defines the shared layer stack (`sky`, distant mountains/city, water/atmosphere plane, ground/platform, structures, runtime props, trace FX, foreground occlusion, companion, UI), visual locks for all seven regions, do-not-bake object lists, draft normalized scene-profile zones, prompt templates, and follow-on packs TP-HAB-1 through TP-HAB-4. Moonlake is prioritized as the first layered generation target and remains replacement-candidate only until human approval and reference audit.
- Verification: `git diff --check` passed. New document readback succeeded. codebase-memory full index completed for `C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink` with `.git` excluded only, updating the graph to 6144 nodes / 10031 edges. Commit/push handled in this Codex turn after scoped diff review.
- Problems / risks: The staged Linkara region JPGs are landscape `1280x720`; active mobile habitat use still needs layered 9:16 generation or profile-aware crop/redraw. `manifest.json` source-image fields should be rechecked before provenance-sensitive generation. This package does not make any generated image runtime-ready.
- Next safe action: Use `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md` as the entry document in the next generation window. Start with TP-HAB-1 Moonlake layered art generation and keep generated candidates outside `assets/**` until human visual approval.
- Required reading: `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`, `assets/backgrounds/linkara/README.md`, `assets/backgrounds/linkara/linkara-map-data.json`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-02 - Codex - Next Gameplay Systems Spec Consolidation

- Lane: `Game Engineering And Architecture`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped commit for this docs-only spec.
- Scope: Consolidated human gameplay direction into one planning spec for visible standoff, synchronization, fatigue, Care, memory glimmers, crystals, Explore, silent anchors, phase search, adventure, and heart-core co-breathing. No runtime files, save schema, assets, package/dependency, build step, or deployment changed.
- Work performed: Replaced the temporary intake draft with `docs/production/NEXUS_LINK_NEXT_GAMEPLAY_SYSTEMS_SPEC.md`. The spec translates mystical inspiration into Nexus Link-safe fictional mechanics, blocks prophecy/medical/diagnostic claims, keeps Care compact by upgrading `Clear Noise` into `心核共息 / Calm Sync` instead of adding button bloat, defines standoff outcomes where retreat is not failure, and splits future work into TASK_PACKs.
- Verification: Markdown/whitespace checks passed for the spec and this ledger entry. Scoped safety review confirmed the spec frames the material as world mechanics, not real-world prediction, therapy, or player diagnosis.
- Problems / risks: This is a planning spec only. Any runtime implementation that touches `index.html`, state persistence, Pixi, assets, tools, or scripts still needs the normal GROUNDWORK approval path. The final UI label for standoff records, visible-versus-hidden stamina/heart-core energy, and the first Moonlake autonomous behavior remain open decisions.
- Next safe action: If implementation is approved, start with the `Heart-core Co-Breathing v1` EXPERIENCE TASK_PACK and keep it no-save-schema unless explicitly expanded.
- Required reading: `docs/production/NEXUS_LINK_NEXT_GAMEPLAY_SYSTEMS_SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.
