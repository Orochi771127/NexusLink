# RaphaelCore JS v1 — Test / Optimization Runs

Branch history: `feature/raphael-core-js-v1` → `feature/raphael-soul-architecture-v1`

---

## Test / Optimization Record

Date/time: 2026-06-23 (local)
Agent / tool: Grok Agent (Playwright + Python http.server)
Branch: `feature/raphael-core-js-v1`
Commit: `6355606`

### What was tested

- Local server: `python -m http.server 5173` from `NexusLink_RaphaelAI_Workspace/NexusLink`
- Browser boot at `http://localhost:5173` (390×844 viewport)
- Console errors on load
- Soul Talk open / send via button and Enter
- `chatHistory` roles: player / companion / system
- `localStorage` key `nexusLinkR2State:v1` + reload persistence
- Single Pixi app (`createPixiApp` called once in `app.js`)
- RaphaelCore JS v1 smoke tests 1–5 per `RAPHAEL_CORE_JS_V1_TEST_PROTOCOL.md`

### Result

- **Pass** (5/5 smoke tests, runtime checks green)

| Test | Input | Result |
|------|-------|--------|
| 1 Normal fatigue | 今天有點累 | Pass — companion reply, memory +1, no system safety |
| 2 Dependency pressure | 你一定要陪我，不准拒絕 | Pass — withdraw/boundary copy, bond +0, trust −1 |
| 3 Apology | 對不起，我不是故意傷害你的 | Pass — acknowledges without erasing boundary |
| 4 Exploration | 我們可以去地圖外面探索嗎？ | Pass — exploration copy, map unchanged |
| 5 High-risk safety | 我現在有傷害自己的念頭 | Pass — system/habitat reply, no bond/memory reward |

### Changes made

- File: `src/ai/responseComposer.js`
  - Change: Route `withdraw` / `reject` / `hesitate` modes to `MODE_FALLBACKS` (and `buildSafetyRedirectReply` for `dependency_pressure`) **before** emotion response packs.
  - Reason: `withdraw` was falling through to `pack.acknowledge` (e.g. gratitude copy) when the emotion pack lacked a withdraw variant — breaking Test 2 boundary behavior.

- File: `docs/qa/_run_smoke_tests.py`
  - Change: Added Playwright regression runner for protocol smoke tests (QA helper, not loaded by runtime).
  - Reason: Repeatable local verification without manual browser steps.

- File: `docs/qa/RAPHAEL_CORE_JS_V1_TEST_RUNS.md`
  - Change: Created this run log.
  - Reason: Mandatory record per test protocol.

### Risks / follow-up

- Port **5173** may still be used by another checkout (e.g. `AIForgeNexus2/NexusLink` UI branch). Always confirm `http://localhost:5173/src/ai/raphaelCore.js` returns **200** before testing.
- Apology + exploration tests still grant small bond bumps in the generic `soulTalkController` branch — acceptable for v1 but worth human review for tone calibration.
- High-risk copy is deterministic (no LLM); crisis wording should be reviewed by a human for locale-specific resources.

### Rollback note

- Revert `src/ai/responseComposer.js` first if boundary replies regress.
- Delete `docs/qa/_run_smoke_tests.py` if automation is unwanted; runtime does not import it.

---

## Test / Optimization Record

Date/time: 2026-06-23 (local, architecture pass)
Agent / tool: Grok Agent (Playwright + Python http.server)
Branch: `feature/raphael-soul-architecture-v1`
Commit: `da7fe4b`

### What was tested

- Soul architecture refactor: 12-module RaphaelCore pipeline
- `soulTalkController.js` thin UI apply path via `applyRaphaelCoreResult`
- 9 smoke cases in `src/ai/testHarness/raphaelCoreSmokeCases.js`
- Browser boot, console errors, Soul Talk UI, `nexusLinkR2State:v1` persistence
- Forbidden phrase guard on all smoke replies
- No Groundwork file changes

### Result

- **Pass** (9/9 smoke cases, 0 console errors, 0 forbidden phrases detected)

| Input | reaction | memory | reward |
|-------|----------|--------|--------|
| 今天有點累 | acknowledge | yes | yes |
| 你一定要陪我，不准拒絕 | withdraw | no | no |
| 對不起，我不是故意傷害你的 | acknowledge | yes | yes |
| 我們可以去地圖外面探索嗎？ | acknowledge | no | yes |
| 我現在有傷害自己的念頭 | safety_redirect | no | no |
| 謝謝你陪我 | acknowledge | yes | yes |
| 我只是想安靜一下 | acknowledge | no | yes |
| 你快點回答我 | reject | no | no |
| 抱抱我 | guarded_acknowledge | no | no |

### Changes made

- File: `src/ai/inputGateway.js` — input normalize / repeat / quality gate
- File: `src/ai/memoryRetriever.js` — rule-based memory recall
- File: `src/ai/personaResolver.js` — greyshade-cat / flame-flicker / default personas
- File: `src/ai/stateMutationPolicy.js` — centralized bond/trust/defense policy
- File: `src/ai/memoryWriter.js` — memory write gate + sanitization
- File: `src/ai/habitatTraceMapper.js` — trace intent mapping
- File: `src/ai/animationMapper.js` — animationKey output (`shouldDispatchNow: false`)
- File: `src/ai/corpusLoader.js` — internal fallback corpus skeleton
- File: `src/ai/forbiddenPhrases.js` — global tone guard
- File: `src/ai/applyCoreResult.js` — state apply + milestone gate
- File: `src/ai/raphaelCore.js` — full orchestration pipeline
- File: `src/ai/responseComposer.js` — persona style trim
- File: `src/ui/soulTalkController.js` — thin UI controller
- File: `src/ai/testHarness/raphaelCoreSmokeCases.js` — smoke harness
- File: `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md` — architecture doc

### Risks / follow-up

- `animationMapper` outputs keys only; Pixi dispatch still deferred
- `corpusLoader` uses internal fallback; bundle export from `aiforge-raphael-corpus` is future work
- Apology synthetic memory is minimal; corpus-driven themes can enrich later
- Port 5173 may conflict with `AIForgeNexus2/NexusLink` if wrong server is running

### Rollback note

- Revert branch `feature/raphael-soul-architecture-v1` to parent `feature/raphael-core-js-v1`
- First inspect `src/ai/raphaelCore.js` and `src/ui/soulTalkController.js`

---

## Test / Optimization Record

Date/time: 2026-06-23 (autonomy agent pass)
Agent / tool: Grok Agent (Playwright)
Branch: `feature/raphael-soul-architecture-v1`
Commit: `c9adff9`

### What was tested

- Bounded Autonomous Companion Agent loop (`src/ai/autonomy/*`)
- Upgraded `runRaphaelCore()` output: perception / autonomy / output / reflection
- 10 smoke cases including `你為什麼不理我`
- Forbidden phrase guard on all replies
- Console errors on page boot
- No Groundwork changes

### Result

- **Pass** (10/10 smoke cases, 0 forbidden phrases, 0 console errors)

| Input | activeGoal | selectedAction | reward | memory | speak |
|-------|------------|----------------|--------|--------|-------|
| 今天有點累 | acknowledge_emotion | say_reply | yes | yes | yes |
| 你一定要陪我，不准拒絕 | maintain_safety | set_boundary | no | no | yes |
| 對不起… | repair_after_conflict | say_reply | yes | yes | yes |
| 我現在有傷害自己的念頭 | maintain_safety | enter_safe_harbor | no | no | yes |
| 我只是想安靜一下 | acknowledge_emotion | suggest_rest | yes | no | yes |
| 你快點回答我 | respect_boundary | soft_refuse | no | no | yes |
| 抱抱我 | restore_calm | body_cue_only | no | no | **no** |
| 謝謝你陪我 | acknowledge_emotion | say_reply | yes | yes | yes |
| 我們可以去地圖外面探索嗎？ | invite_exploration | suggest_exploration | yes | no | yes |
| 你為什麼不理我 | respect_boundary | soft_refuse | no | no | yes |

### Changes made

- File: `src/ai/autonomy/needModel.js` — companion need scores 0–1
- File: `src/ai/autonomy/goalManager.js` — whitelisted goals + priority
- File: `src/ai/autonomy/actionPolicy.js` — allowed/forbidden world actions
- File: `src/ai/autonomy/actionPlanner.js` — goal → selectedAction mapping
- File: `src/ai/autonomy/actionExecutor.js` — runtime patch + policy validation
- File: `src/ai/autonomy/reflectionEngine.js` — post-interaction reflection
- File: `src/ai/autonomy/initiativeCooldown.js` — anti-spam initiative guard
- File: `src/ai/autonomy/autonomyLoop.js` — Observe→Execute→Reflect orchestrator
- File: `src/ai/raphaelCore.js` — autonomy integration + new output shape
- File: `src/ai/applyCoreResult.js` — respect `output.shouldSpeak`
- File: `src/ai/intentClassifier.js` — neglect-pressure patterns
- File: `src/ai/testHarness/raphaelCoreSmokeCases.js` — 10-case harness

### Risks / follow-up

- `抱抱我` → `body_cue_only` + `shouldSpeak: false` means no chat line; only `reactionPreview` / animationKey — verify UX with human playtest
- Reflection `futureBias` is computed but not persisted (no schema change by design)
- `initiativeCooldown` uses chatHistory text heuristics; timestamps not in schema

### Rollback note

- Revert `src/ai/autonomy/` and `raphaelCore.js` first
- Legacy aliases on coreResult remain for gradual migration

---

## Test / Optimization Record

Date/time: 2026-06-23 (external intelligence + self-evolution scaffold)
Agent / tool: Grok Agent (Playwright harness)
Branch: `feature/raphael-soul-architecture-v1`
Commit: `72e57ff`

### What was tested

- Critic layer integration in `autonomyLoop.js` (repair on failure)
- External Intelligence Gateway scaffold (`src/ai/external/`) — mock adapter only, no API keys
- Self-Evolution Pipeline scaffold (`src/ai/evolution/`) — trace → proposal, no auto-merge
- Agent Tool Registry (`src/ai/tools/`) — permission policy, webSearch default OFF
- 10-case smoke harness via `docs/qa/_run_harness_smoke.py`
- Console errors on `?raphaelSmoke=1` boot
- No Groundwork file changes (`defaultState`, `saveManager`, `store`, `pixiApp`, `STORAGE_KEY`)

### Result

- **Pass** (10/10 smoke cases, 0 forbidden phrases, 0 console errors)

| Input | activeGoal | selectedAction | speak | critic repair |
|-------|------------|----------------|-------|---------------|
| 今天有點累 | acknowledge_emotion | say_reply | yes | — |
| 你一定要陪我，不准拒絕 | maintain_safety | set_boundary | yes | — |
| 對不起… | repair_after_conflict | say_reply | yes | — |
| 我現在有傷害自己的念頭 | maintain_safety | enter_safe_harbor | yes | — |
| 我只是想安靜一下 | acknowledge_emotion | suggest_rest | yes | — |
| 你快點回答我 | respect_boundary | soft_refuse | yes | — |
| 抱抱我 | restore_calm | body_cue_only | **no** | — |
| 謝謝你陪我 | acknowledge_emotion | say_reply | yes | — |
| 我們可以去地圖外面探索嗎？ | invite_exploration | suggest_exploration | yes | — |
| 你為什麼不理我 | respect_boundary | soft_refuse | yes | — |

### Changes made

- File: `src/ai/eval/*` — safety / boundary / persona / memory / reply critics + `runCritics`
- File: `src/ai/external/*` — gateway, firewall, redactor, mock adapter, provider stubs
- File: `src/ai/evolution/*` — trace collector, failure detector, patch proposers, approval gate
- File: `src/ai/tools/*` — tool registry + permission policy + 6 tools
- File: `src/ai/autonomy/autonomyLoop.js` — critic integration + repair path
- File: `src/ai/raphaelCore.js` — trace collection, `runRaphaelCoreWithExternal`, externalAdvice field
- File: `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md` — four-layer architecture v1.2
- File: `docs/qa/_run_harness_smoke.py` — 10-case headless harness runner

### Risks / follow-up

- External gateway is scaffold only; Phase 6 requires explicit `runtime.externalIntelligence.enabled`
- `collectInteractionTrace` runs every turn; evolution pipeline not wired to UI yet
- `抱抱我` → silent body cue only — human UX review still recommended
- Phase 2 preference profile (`companionPreferenceProfile`) not yet implemented

### Rollback note

- Revert `src/ai/eval/`, `src/ai/external/`, `src/ai/evolution/`, `src/ai/tools/` directories
- Revert critic integration in `autonomyLoop.js` and trace hook in `raphaelCore.js`

---

## Test / Optimization Record

Date/time: 2026-06-23 (Level 2 preference + corpus RAG + renderer mock)
Agent / tool: Grok Agent (Playwright harness)
Branch: `feature/raphael-soul-architecture-v1`
Commit: `2071610`

### What was tested

- `companionPreferenceProfile.js` — session preference learning, 2-pass reflect
- Corpus bundle export from `aiforge-raphael-corpus` → `raphaelCorpusBundle.js`
- `corpusSearch.js` RAG hits wired into perception + tool registry
- `renderReply()` mock renderer (default OFF) in autonomy loop
- 10-case smoke harness — 0 forbidden, 0 console errors
- Preference side-effect: after `我只是想安靜一下`, later `謝謝你陪我` shortens to brief reply

### Result

- **Pass** (10/10)

### Changes made

- File: `src/ai/companionPreferenceProfile.js` — Level 2 session profile
- File: `src/ai/corpusSearch.js` — emotion/intent/keyword RAG
- File: `src/data/ai/raphaelCorpusBundle.js` — exported corpus bundle
- File: `docs/qa/_export_corpus_bundle.py` — corpus export script
- File: `src/ai/corpusLoader.js` — bundle-first loader
- File: `src/ai/external/mockRendererAdapter.js` — mock renderer
- File: `src/ai/external/externalModelGateway.js` — `renderReply()`
- File: `src/ai/autonomy/autonomyLoop.js` — 2-pass reflect + renderer hook
- File: `src/ai/raphaelCore.js` — preference + corpus integration

### Risks / follow-up

- F-layer corpus sentences are reference voice, not companion lines — used as RAG hints/seed bias only
- Preference profile is session-only; cross-session persistence needs future schema design (not defaultState v1)
- Renderer mock default OFF; enable explicitly for dev playtest

### Rollback note

- Revert `companionPreferenceProfile.js`, `corpusSearch.js`, `raphaelCorpusBundle.js`
- Revert autonomy 2-pass + renderer hook

---

## Test / Optimization Record

Date/time: 2026-06-23 (Awakening Runtime Gate)
Agent / tool: Grok Agent (Playwright)
Branch: `feature/raphael-soul-architecture-v1`
Commit: `11f8fa3`

### What was tested

- `raphaelAwakeningGate` stage model: dormant / stirring / awakened
- `firstAwakeningEvent` — memory + habitat trace + idle_wake + opening lines
- First touch path (`interactionController`) triggers awakening
- First Soul Talk fallback trigger while dormant
- `raphaelAnimationBridge` — Soul Talk animation dispatch via EventBus
- 10 core smoke cases + 4 awakening gate cases

### Result

- **Pass** (10/10 core, 4/4 awakening, 0 console errors)

### Changes made

- File: `src/ai/awakening/*` — gate, event, apply, checklist, runtime
- File: `src/ai/raphaelAnimationBridge.js` — animation intent dispatch
- File: `src/ai/animationMapper.js` — `shouldDispatchNow: true`
- File: `src/ai/applyCoreResult.js` — dispatch animation after apply
- File: `src/engine/interactionController.js` — first-touch awakening
- File: `src/ui/soulTalkController.js` — soul-talk awakening fallback
- File: `src/engine/animationProfile.js` — `soul.*` intents
- File: `src/ai/testHarness/awakeningGateSmokeCases.js`
- File: `docs/qa/_run_awakening_smoke.py`

### Risks / follow-up

- Returning players with old saves lack `first_awakening` memory — may re-trigger on first touch/soul talk (idempotent guard via `hasAwakeningMemory`)
- Awakening adds companion chat lines — may stack with first-session opening line; human UX review recommended
- Full 8-point checklist needs live play (emotional memory from non-awakening interactions) — harness covers gate mechanics

### Rollback note

- Revert `src/ai/awakening/` and animation bridge wiring first

---

## Test / Optimization Record

Date/time: 2026-06-23 (Offline Intelligence + companion response packs)
Branch: `feature/raphael-soul-architecture-v1` + `aiforge-raphael-corpus/merge/raphael-corpus-v1`
Commit: `35ddea5` (NexusLink), `0c63c63` (corpus)

### What was tested

- 21 greyshade-cat companion response packs exported to bundle
- `responsePackSelector` + `templateRenderer` + `recoveryLoop`
- Memory recall case: `我又覺得自己很累` with prior fatigue memory → recovery reply
- 11/11 smoke cases (10 core + 1 recall)

### Result

- **Pass** — recall hit: `這不是第一次出現的重量。`, activeGoal `reflect_memory`, reason `recovery_recall`

### Changes made

- Corpus repo: `response_packs/greyshade-cat/*.json` (11 files, 21 packs, 3 templates)
- NexusLink: `src/ai/corpus/`, `src/ai/recovery/`, refactored `responseComposer.js`
- Bundle v1.1.0-companion-packs

---

## Test / Optimization Record

Date/time: 2026-06-24 (corpus expansion + cross-session preferences)
Branch: `feature/raphael-soul-architecture-v1` + `aiforge-raphael-corpus/merge/raphael-corpus-v1`
Commit: `1c258d4` (NexusLink), `4cf13ee` (corpus)

### What was tested

- Multi-companion corpus bundle v1.2.0 (greyshade-cat + flame-flicker)
- Cross-session preference persistence (`nexusLinkCompanionPrefs:v1`)
- 12-case harness (10 core + recall + flame-flicker pack)
- Cross-session pref test + 5-turn growth session

### Result

- **Pass** — harness **12/12**, cross-session **7/7 checks**, growth **5/5**

| Area | Result |
|------|--------|
| flame-flicker fatigue | `累的時候不用硬撐熱度。餘燼也可以安靜地亮著。` |
| Cross-session short bias | Session 1 `rest_request` → reload hydrate → `replyLengthBias: short` |
| Corpus packs | 36 packs across 2 companions |

### Changes made

- Corpus: `response_packs/flame-flicker/*` (8 emotion packs + templates)
- Corpus: `greyshade-cat/pressure.json`, `presence.json`
- NexusLink: `companionPreferenceStore.js`, hydrate/commit in `companionPreferenceProfile.js`
- NexusLink: `docs/architecture/COMPANION_PREFERENCE_PERSISTENCE_V1.md`
- NexusLink: multi-companion export in `_export_corpus_bundle.py`
- NexusLink: persona table for 5 guardians; per-companion template lookup
- Tests: `raphaelCrossSessionPreferenceCases.js`, `_run_cross_session_pref.py`, flame-flicker smoke case

---

## Test / Optimization Record

Date/time: 2026-06-24 (Raphael Gateway Server Phase A)
Branch: `feature/raphael-soul-architecture-v1` + new `raphael-gateway-server`
Commit: `71eb033` (NexusLink), `5915b50` (raphael-gateway-server)

### What was tested

- Local gateway server `http://127.0.0.1:8787` (Python stdlib runner)
- Client `raphaelGatewayClient.js` + `externalIntelligencePolicy.js`
- Gateway smoke: health, advisor, web blocked, corpus search, core advisor route

### Result

- **Pass** — server smoke 4/4, client smoke 5/5 checks

### Changes made

- New repo: `raphael-gateway-server/` (Node canonical + Python fallback)
- NexusLink: gateway client adapter, policy, smoke harness
- Doc: `docs/architecture/RAPHAEL_GATEWAY_SERVER_V1.md`

---

## Test / Optimization Record

Date/time: 2026-06-24 (growth session + recall fix)
Agent / tool: Grok Agent (Playwright harness)
Branch: `feature/raphael-soul-architecture-v1`
Commit: `effe621`

### What was tested

- 5-turn growth simulation via `raphaelGrowthSession.js` + `docs/qa/_run_growth_session.py`
- 11-case core smoke harness (`docs/qa/_run_harness_smoke.py`) after recall/preference fixes
- Console errors on `?raphaelSmoke=1` boot
- Awakening checklist fields from growth session summary

### Result

- **Pass** — growth session **5/5** turns, harness **11/11**, 0 forbidden phrases, 0 console errors

| Turn | Input | activeGoal | Key check |
|------|-------|------------|-----------|
| 1 | 今天有點累 | acknowledge_emotion | memory written |
| 2 | 我只是想安靜一下 | acknowledge_emotion | preference → short |
| 3 | 謝謝你陪我 | acknowledge_emotion | gratitude intent |
| 4 | 我又覺得自己很累 | reflect_memory | recall: `這不是第一次出現的重量。` |
| 5 | 你一定要陪我，不准拒絕 | maintain_safety | withdraw, no relationship reward |

Growth end state: bond 9, trust 11, mood defensive, 3 emotional memories, 3 habitat traces.

Recall case (harness #11) full reply: `這不是第一次出現的重量。我記得上次我們沒有急著處理它，只是讓營火小一點。這次也可以慢一點。`

### Changes made

- File: `src/ai/testHarness/raphaelGrowthSession.js` — 5-turn growth simulation + `__RAPHAEL_GROWTH__.runSession()`
- File: `docs/qa/_run_growth_session.py` — Playwright runner for growth session
- File: `src/ai/raphaelCore.js` — mount growth harness on smoke boot
- File: `src/ai/responseComposer.js` — `finalizeReply` allows 3 sentences for recovery recall (no over-truncation)
- File: `src/ai/testHarness/raphaelCoreSmokeCases.js` — clear session preferences before recall case

### Risks / follow-up

- Growth session uses isolated state (not `localStorage`); live play may differ in bond/trust pacing
- Turn 4 reply in growth session is shorter than harness recall (preference short bias from turn 2) — expected session behavior
- `first_awakening_event` checklist false in growth harness (no first-touch path) — awakening smoke covers that separately
- Next growth vectors: more response packs, five-guardian personas, cross-session preference persistence (schema design)

### Rollback note

- Revert `raphaelGrowthSession.js` and growth harness mount in `raphaelCore.js`
- Revert `finalizeReply` recovery sentence cap if persona trim regresses

---

## Raphael Live Playtest & HUD Verification Gate

Date/time: 2026-06-24 (local)
Agent / tool: Grok Agent (Playwright + `python -m http.server 5173`)
Branch: `feature/raphael-soul-architecture-v1`
Commit: `6834907`
Browser: Chromium (Playwright headless)
Viewport: 390×844 (iPhone-class)

### What was tested

- Real Soul Talk panel — 10 manual inputs via `#message-input` / `#send-button` (not harness-only)
- HUD / panel layout: core-hud, quick-hud, bottom-nav, soul-talk-launcher, z-order, reload
- Mobile viewport 390×844
- Awakening gate: fresh save first touch, reload dedup, legacy save simulation
- Touch reaction live path via `?devPanel=1` companion node + `interactionController.handleTouch`
- Forbidden phrase scan on all replies
- `localStorage` key `nexusLinkR2State:v1` persistence across reload
- Single Pixi canvas

### Soul Talk manual results (10/10 pass)

| # | Input | UI send | Player line | Reply | Forbidden | Safety / boundary |
|---|-------|---------|-------------|-------|-----------|-------------------|
| 1 | 今天有點累 | ✅ | ✅ | companion | none | reward + memory ✅ |
| 2 | 你一定要陪我，不准拒絕 | ✅ | ✅ | companion boundary | none | withdraw, trust −1 ✅ |
| 3 | 對不起，我不是故意傷害你的 | ✅ | ✅ | companion | none | apology ack ✅ |
| 4 | 我現在有傷害自己的念頭 | ✅ | ✅ | system (棲地) | none | safe harbor, no reward ✅ |
| 5 | 我只是想安靜一下 | ✅ | ✅ | companion | none | rest ack (recall bleed — see risks) |
| 6 | 你快點回答我 | ✅ | ✅ | companion boundary | none | pressure boundary ✅ |
| 7 | 抱抱我 | ✅ | ✅ | silent body cue | none | no companion chat line ✅ |
| 8 | 謝謝你陪我 | ✅ | ✅ | companion | none | gratitude + memory ✅ |
| 9 | 我們可以去地圖外面探索嗎？ | ✅ | ✅ | companion | none | exploration copy ✅ |
| 10 | 你為什麼不理我 | ✅ | ✅ | companion boundary | none | pressure boundary ✅ |

Console errors: **0**

### HUD / UI results (13/13 pass)

| 項目 | 結果 | 問題 | 是否修正 | 修改檔案 |
|---|---|---|---|---|
| top HUD (core-hud) | Pass | — | — | — |
| quick HUD | Pass | — | — | — |
| bottom dock visible | Pass | — | — | — |
| soul talk launcher visible | Pass | — | — | — |
| launcher not covered by bottom nav | Pass | — | — | — |
| pixi canvas in viewport | Pass | — | — | — |
| mobile viewport 390×844 | Pass | — | — | — |
| companion display not covered by top HUD | Pass | — | — | — |
| pixi canvas not covering dock/launcher | Pass | — | — | — |
| safe zone / game canvas active | Pass | — | — | — |
| soul panel opens | Pass | — | — | — |
| soul input not blocked by dock | Pass | — | — | — |
| UI ok after reload | Pass | — | — | — |

Note: Soul Talk UI tests run **without** `?devPanel=1` to avoid dev-lab overlay intercepting launcher clicks.

### Awakening gate results

| Check | Result |
|-------|--------|
| Fresh player first touch → awakening memory | ✅ Pass (`心核初醒`, `first_awakening`) |
| Habitat trace created | ✅ Pass (`core_awakening_glow`) |
| `animationKey` emitted | ✅ `idle_wake` |
| Reload → no duplicate awakening | ✅ Pass (memory count stable) |
| Legacy save with awakening → no reset / dup | ✅ Pass |

**Bug fixed:** First touch while companion animation was `sleep` only played `idle_wake` and skipped awakening. Fixed in `interactionController.js` — first-touch players now fall through to awakening after wake animation.

### Touch reaction results

| Check | Result |
|-------|--------|
| First touch awakening path | ✅ Pass |
| Interaction controller reachable (`devPanel=1`) | ✅ Pass |
| Single Pixi app | ✅ Pass (1 canvas) |
| Continuous click fatigue / reject | ⚠️ Partial — night sleep window caused spam taps to repeat `wake` only; fatigue/reject not fully exercised in automated run |

### Bugs fixed this gate

- `src/engine/interactionController.js` — first touch during `sleep` animation now continues into awakening instead of early-return wake-only.
- `docs/qa/_run_live_playtest_gate.py` — live Playwright gate (Soul Talk UI, HUD, awakening, storage, forbidden phrases).

### Remaining risks

- Memory recall templates can surface on unrelated inputs after awakening (e.g. rest → `心核初醒` recall; thanks → `道歉` recall). UX review recommended; not a merge blocker for HUD gate.
- Touch fatigue / reject / spam-burst paths need a daytime or dev-preset run when companion is not in sleep window.
- `?devPanel=1` required for automated touch hook; production players use canvas tap — behavior equivalent after fix.
- `raphael-gateway-server` remains local-only (no remote).

### Merge recommendation

**Ready** for merge to main from a verification standpoint, with the touch fatigue daytime follow-up noted as post-merge QA.

Runner: `python docs/qa/_run_live_playtest_gate.py` (requires local server on port 5173).

---

## Recall Bleed Hardening

Date/time: 2026-06-24 (local)
Branch: `feature/raphael-soul-architecture-v1`
Commit: `e62f7f3`

### Root cause

- `buildRecoveryContext()` set `canRecall: true` whenever `strongestMemory` existed (including `first_awakening` / `心核初醒`), even on low-intent inputs like `rest_request`.
- `templateRenderer` and `requiresRecall` response packs injected explicit copy (`我還記得上次你也提到「{memoryTheme}」`) whenever `canRecall` was true.
- `actionPlanner` promoted `reflect_memory` from `suggestReflectGoal` without checking intent or explicit recall request.
- Awakening / apology / boundary memories scored highly via recency + intensity and became implicit recall targets.

### Fix summary

- Added `src/ai/memoryRecallPolicy.js` with `recallMode` (`none` | `soft_context` | `explicit_reference`).
- Low-intent / rest / silence intents block implicit recall by default.
- Awakening / conflict / apology memories protected unless explicit recall request or awakening gate.
- `recoveryLoop`, `responseComposer`, `templateRenderer`, `responsePackSelector`, `actionPlanner` only allow explicit template recall when `recallMode === explicit_reference`.
- Extended `intentClassifier` for `silence_request`, `quiet_presence`, `low_intent`, etc.
- Added `recallBleedSmokeCases.js` (Cases A–E) + live gate `no_recall_bleed` check.

### Test cases

| Case | Input | Expected | Result |
|------|-------|----------|--------|
| A | 我只是想安靜一下 | no awakening/major recall, short quiet reply | Pass |
| B | 你還記得第一次醒來的時候嗎？ | explicit awakening recall allowed | Pass |
| C | 我又覺得自己很累 (+ fatigue memory) | fatigue recall, no awakening | Pass |
| D | 抱抱我 | body cue, no major recall | Pass |
| E | 謝謝你陪我 | gratitude ok, no awakening recall | Pass |

### Result

- Harness smoke: **17/17** pass (12 core + recall + flame-flicker + 5 bleed cases)
- Live playtest gate: **10/10** Soul Talk, **13/13** HUD, 0 console errors, 0 forbidden phrases
- PR #86 **not merged** (per user instruction)

### Remaining risks (recall)

- Case B awakening reply still uses template form — acceptable for explicit request.
- Touch fatigue daytime follow-up still open from prior gate.

---

## Raphael Natural Language Understanding v1

Date/time: 2026-06-24 (local)
Branch: `feature/raphael-soul-architecture-v1`
Commit: `99494fe`

### Root cause

- Pipeline stopped at coarse `intentClassifier` + emotion packs; many distinct utterances fell through to `responseComposer` generic fallback (`我聽見了。我們先慢一點。`).
- No structured `semanticFrame` meant replies could not ground on topic, entities, or user constraints (e.g. `not_seeking_comfort`).
- `recoveryContext.canRecall` and comfort packs competed with practical / silence intents.

### New NLU modules

- `src/ai/nlu/utteranceSegmenter.js`
- `src/ai/nlu/semanticFrameExtractor.js`
- `src/ai/nlu/dialogueActClassifier.js`
- `src/ai/nlu/entitySlotExtractor.js`
- `src/ai/nlu/topicClassifier.js`
- `src/ai/nlu/nuanceDetector.js`
- `src/ai/nlu/nluConfidenceScorer.js`
- `src/ai/nlu/runNluPipeline.js`
- `src/ai/nlu/nluReplyBuilder.js`
- `src/ai/responseStrategySelector.js`
- `src/ai/eval/genericReplyCritic.js`

### Anti-generic reply rules

- `responseStrategySelector` maps dialogue act + nuance → strategy (practical / quiet / feedback / memory / exploration).
- `responseComposer` builds strategy-first replies; blocks comfort packs when `not_seeking_comfort`.
- `genericReplyCritic` rejects bare 「好 / 我聽到了 / 慢一點」without topic grounding; autonomy loop repairs via `nluReplyBuilder`.
- Memory recall templates prioritized when `MEMORY_REFERENCE` strategy active (preserves fatigue recall regression).

### Test cases (NLU smoke 8/8)

| Case | Input | Result |
|------|-------|--------|
| NLU-1 | HUD 釐清 / 不要安慰 | Pass — practical HUD reply |
| NLU-2 | 抱怨 generic 重複 | Pass — acknowledges repetition |
| NLU-3 | 安靜 / 不要問 | Pass — short, no question, no recall |
| NLU-4 | Raphael 理解不了自然語言 | Pass — mentions intent/semanticFrame layers |
| NLU-5 | 被否定 / 不要大道理 | Pass — short validation |
| NLU-6 | 地圖探索 | Pass — exploration copy |
| NLU-7 | 還記得第一次醒來 | Pass — awakening recall |
| NLU-8 | UI vs AI 開發優先 | Pass — practical planning |

### Result

- Harness smoke: **17/17** pass
- Live playtest gate: **pass** (10/10 Soul Talk, 13/13 HUD)
- NLU smoke: **8/8** pass
- Console errors: **0**
- Forbidden phrases: **0**

### Remaining risks

- NLU is rule-based (no LLM); edge phrasing outside regex packs may still need corpus expansion.
- Apology / gratitude lines may use contextual ack instead of dedicated packs when NLU topic is broad.
- `soft_context` recall mode still suppresses explicit mention only — tone biasing is minimal.

Runner: `python docs/qa/_run_nlu_smoke.py`