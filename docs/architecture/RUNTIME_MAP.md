# RUNTIME_MAP.md — Nexus Link Runtime 架構地圖

> Status: 2026-07-22 current-worktree truth sync。
> 本檔是定位地圖，不是產品 canon，也不取代 current `HEAD`、實際 worktree、測試或
> `docs/agent/AI_EXECUTION_LEDGER.md`。標為「歷史」的段落不得用來推導新實作。

---

## 1. Runtime 入口與層次

```text
index.html
  ├─ styles.css + styles/**          DOM presentation
  ├─ PixiJS 8.8.1                   window.PIXI
  └─ src/app.js                     composition root / bootstrap
       ├─ src/state/**               in-memory state + persistence
       ├─ src/engine/**              deterministic game rules
       ├─ src/ai/**                  RaphaelCore / companion cognition
       ├─ src/expedition/**          Expedition prototype runtime
       ├─ src/pixi/**                scene rendering / animation / FX
       ├─ src/ui/**                  DOM controllers
       ├─ src/data/**                runtime registries and content data
       ├─ src/audio/**               BGM / SFX
       ├─ src/i18n/**                localization runtime
       └─ src/utils/**               EventBus / DOM / time / clamp helpers
```

- `index.html` 是唯一頁面入口；DOM ID 是 controller contract，不能任意改名。
- `src/app.js` 組裝 store、save queue、controllers、Pixi scene、EventBus 與 ticker。
- 無 build step、無 runtime 外部 LLM、無後端；Pixi 由固定版本 CDN + SHA-384 SRI / `crossorigin="anonymous"` 載入，失敗時留下明確 boot failure signal。

### 分層硬規則

- `src/engine/`：規則與 state 推導；不得操作 DOM / Pixi / localStorage。
- `src/ai/`：輸入理解、safety、persona、memory policy、critic 與合法 mutation proposal；不得繞過 store 或直接成為外部模型代理。
- `src/pixi/`：渲染、動畫、相機與 FX；不得寫 DOM、核心規則或 localStorage。
- `src/ui/`：DOM lifecycle 與 player input；核心結果須由 engine / RaphaelCore 產出。
- `src/state/`：唯一主存檔與 migration；state 變更走 store API。
- 跨 Pixi / UI 使用 EventBus、callback 或 store subscription。

---

## 2. Current first-session 與 companion flow

```text
Boot → Identity → Prologue → Heart-Core Guidance → Initial Bond
     → First Touch → First Soul Talk → First Trace
     → Safe Moonlake Exploration → Return Echo
```

- Initial Bond runtime：`src/ui/onboardingController.js`。
- Fresh trio 固定為 `greyshade-cat` / `blazetail-kit` / `crystalfin-seahorse`。
- Fresh save 初始以 `greyshade-cat` 為安全預設；選定後 `activeCompanionId` 與
  `unlockedCompanionIds` 只保留選定者。
- Veteran migration 保留既有已解鎖角色；不沒收舊玩家資料。
- `src/data/companionRuntimePolicy.js` 以 known id、asset readiness、runtime flag、
  `selectableWhenUnlocked` 與 `unlockedCompanionIds` 共同裁決可否選取。
- 正式五元守護五席目前皆為 `full-runtime` / `runtime-ready` /
  `selectableWhenUnlocked`；這不會繞過 Initial Bond、chapter-gated unlock 或共鳴邀請意願制。
- 黑鐵駭客／Ironflow Hackers 五席 `thunder-pup` / `wavecub` /
  `starflame-phoenix` / `star-foal` / `goldenspark-wyrm` 也已是
  `full-runtime` / `runtime-ready` / `selectableWhenUnlocked`。Fresh save
  不自動解鎖；Codex 預列全部 Stage 1 並標示未相遇／鎖定，但 selector
  與 active-companion path 仍只接受 `unlockedCompanionIds` 內的合法角色。
- `companionRegistry.tier` 目前只有 `primary` / `legacy` / `roadmap` /
  `placeholder` 四種粗粒度 compatibility 值；正式心輝／黑鐵 Stage 1 記錄使用
  `roadmap` 不代表 canon 上仍是 Tier 3。正式 roster 身分以 Master Canon、faction
  與本節 runtime truth 為準，不得用該舊 enum 將已核准角色降級。
- 棲地日常同時只有一位 active companion；對峙共鳴圈不是一般戰力隊伍。

Authoritative sources：

- `src/data/companionRegistry.js` — 角色資料、runtime status、manifest、persona tone。
- `src/data/companionRuntimePolicy.js` — runtime eligibility / unlocked selection。
- `src/ui/onboardingController.js` — fresh trio 與選定流程。
- `src/ui/companionSelectController.js` — 已解鎖夥伴檢視／切換。
- `src/data/chapterRegistry.js` + `src/ui/battleController.js` — 章節資料與對峙後推進。
- `src/engine/resonanceInviteEngine.js` + `resonanceCircleEngine.js` — 共鳴邀請意願制與共鳴圈規則。

---

## 3. State 與 persistence

### 主 state 群組

| 群組 | Current fields |
|---|---|
| Per-companion canonical | `companionStates.version` + `byId[companionId].relationship/growth`; each companion owns its own relationship, stage shell and migration provenance |
| Active relationship mirror | The exact 14 `RELATION_MIRROR_FIELDS`: bond／trust／mood／energy／defense／touch fatigue, touch/reject/blocked timestamps and counters, first touch/hug, reaction preview/last reaction |
| Conversation | `lastMessage`, `chatHistory` |
| Memory / habitat trace | `memories`, `memorySchemaVersion`, `emotionalMemories`, `habitatTraces`, `lastEmotionTag`, `habitatRepairFactor` |
| Safety / time | `safeHarborMode`, `lastSeenAt`, `timeAnomalyCount` |
| First session | `playerProfile`, `onboarding`, `firstSessionOpeningSeenAt`; first touch/hug remain in the active relationship mirror |
| World / roster | `activeHabitatId`, `activeCompanionId`, `unlockedCompanionIds` |
| Progress | `battleRecord`, `chapterProgress`, `resonance`, `explorationProgress` |
| Expedition prototype | `expeditionVault` |
| Preferences | `settings`, `companionPreferences` |

Notes：

- `battleRecord.wins/losses/retreats` 是 legacy compatibility-only schema；新設計只消費 canonical standoff outcome，不得把欄位名解讀為傳統 RPG 勝負。
- `settings` 包含音量、品質、文字、low-motion、語言與 audio mute。
- `companionPreferences` 是跨回合語氣偏好；safety turn 不得更新或套用它覆寫 canonical safety response。
- `companionStates.byId` 是 G2 持久真相；頂層 14 欄只相容目前 active companion。切換以一個 store transaction 封存 A、lazy-init／hydrate B、reset transient spam、notify 一次。Inactive veteran 只可有 display-only Codex floor，不得複製 active relationship。
- Boot offline recovery 只對已有 relationship 的每隻夥伴套用相同的 bounded energy／touch-fatigue 調節，再 hydrate active mirror；archive-only 紀錄不會因此建立關係，且此路徑不寫 stage／evidence／bond。

### State modules

- `src/state/defaultState.js` — fresh state shape。
- `src/state/companionStateSchema.js` — G2 schema、14-field inventory、legacy migration、Codex presentation 與 mirror archive／hydrate pure helpers。
- `src/state/store.js` — `getState` / `setState` / `replaceState` / `updateState` /
  `replaceRuntimeState` / `subscribe` / `normalizeState`。Persisted `replaceState` 以 canonical 為準；boot recovery 才用 `replaceRuntimeState` 封存已 hydrate 的 runtime mirror。
- `src/state/saveManager.js` — 主存檔 `nexusLinkR2State:v1`、legacy migration、quota pruning。
- `src/state/saveQueue.js` — `CRITICAL` / `INTERACTION` / `DEBOUNCE` save levels。

`lastSeenAt` 的合法值是正有限 timestamp；0、負數、NaN 與非數值視為損壞／缺失。
Legacy preference/audio keys 只可作一次性讀取遷移；成功寫入主 state 後移除，不得成為第二套權威狀態。

---

## 4. RaphaelCore / Soul Talk

```text
soulTalkController.handlePlayerMessage
  → runRaphaelCore(input, state, runtime)
       → inputGateway + safetyShield
       → NLU / intent / dialogue context
       → PersonaConstitution signals
       → memory recall / semantic soul / reaction plan
       → bounded autonomy + critics
       → reply / action / memory / trace / animation decisions
  → applyRaphaelCoreResult(state, coreResult)
  → Raphael agent intent reduction
  → save + DOM render
```

Current authority：

- `src/ai/raphaelCore.js` — orchestrator，已 live 接入 Soul Talk。
- `src/ui/soulTalkController.js` — UI boundary；不得自行發明 Core state delta。
- `src/ai/applyCoreResult.js` — 合法結果套用。
- `src/ai/persona/PersonaConstitution.js` — 可執行人格硬規則。
- `src/ai/eval/constitutionCritic.js` + `src/ai/eval/runCritics.js` — Constitution / critic path。
- `src/ai/autonomy/` — bounded need / goal / action / critic loop。
- `src/ai/nlu/` + `src/ai/dialogue/` — deterministic NLU、context、anti-loop、quick replies。
- `src/data/ai/` — voice/corpus/training/Nuwa bundles；advisory-only，不能凌駕 Core。

Safety invariant：高風險輸入必須終止於完整 system safety response、零 quick reply、完整 relationship／growth／資源不變、零 emotional memory／trace／preference write；只允許 canonical chat、safety UI/mode 與 save timestamp。自動 holdout 分數不能取代正文 contract 或 human gate。

---

## 5. Engine layer

| Domain | Current modules |
|---|---|
| Touch / boundary | `interactionController.js`, `touchReactionEngine.js`, `companionPersonality.js`, `personalityProfile.js` |
| Memory / sedimentation | `emotionalSedimentationEngine.js`, `memoryLifecycleEngine.js`, `habitatTraceEngine.js`, `traceVisualMapper.js` |
| Safety | `safeHarborMode.js` + `src/data/safetyShieldDictionary.js` |
| First/return loop | `returnBehaviorEngine.js`, `offlineRecovery.js`, `offlineTraceEngine.js`, `firstLoopController.js`（UI） |
| Exploration | `explorationEngine.js` + `src/data/explorationNodes.js` |
| Standoff | `battleEngine.js` + `src/ui/battleController.js`; player-facing contract is emotional standoff, not HP-zero RPG |
| Chapter / resonance | `chapterRegistry.js`（data）, `battleController.js`（UI progression）, `resonanceInviteEngine.js`, `resonanceCircleEngine.js` |
| Habitat / time | `environmentController.js`, `environmentHeartbeat.js`, `recoveryEngine.js` |
| Initiative | `src/ai/autonomy/initiativeCooldown.js` + `src/ui/companionInitiativeController.js` |
| Companion Growth | `companionGrowthSessionEngine.js`（Heart Phase／explicit rewrite consent）+ `companionGrowthEngine.js`（G3 deterministic evidence／coverage／readiness／willingness）+ `companionGrowthController.js`（source-owner bridge／qualitative view）+ `companionStateSchema.js`（G2 persistent foundation）。Live owners：exploration／standoff／care；G4 offer／advance 未接入 |

---

## 6. Pixi layer — current modules

### Composition / companion

- `pixiApp.js` — Pixi application、safe-zone / background-cover projection、scene layers、habitat switch assembly。GROUNDWORK。
- `companionRenderer.js` — companion node、scene-profile placement、visual-center target projection、tap binding。
- `spriteSheetAnimationLoader.js` — per-companion `animations.json`、linear sampling / mipmap policy、animation switching；正式 catalog 必須提供 29 個 runtime action，另有 5 個明示 profile fallback 語意 key 可不重複資產。
- `motionController.js` — idle / walk / emotion / touch motion state and scene rebase。
- `platformRenderer.js` — platform helper。
- `chromaKeyTexture.js` — bounded texture preprocessing helper。

### Memory / habitat

- `habitatTraceRenderer.js` — mapped relationship traces。
- `memorySymbolFactory.js`, `memorySymbolLayout.js`, `memorySymbolRenderer.js`,
  `memoryVisualContract.js` — emotional memory symbols and lifecycle visuals。
- `habitatObjectRenderer.js` — Moonlake R2 independent props、depth sort、shadow/light placement。
- `habitatLightingFx.js` — shared ambient/key phase lighting。
- `habitatWeatherFx.js` — bounded fog/rain/wetness/ripple FX。

Moonlake 是目前第一個 `dynamic-day-master`：中性／日間 foundation + independent props +
runtime lighting/weather。其他六區仍可保留 approved baked day/night fallback，直到各自的 neutral art/prop pack 通過。

### Expedition prototype

- `expeditionScene.js` — scene entities and lifecycle。
- `expeditionCamera.js` — bounded camera transform。
- `expeditionAtmosphere.js` — region atmosphere cues。

---

## 7. UI layer — current controllers

- Shell / routing：`pageRouter.js`, `panelManager.js`, `hudController.js`, `settingsController.js`。
- First session：`onboardingController.js`, `firstLoopController.js`, `gentleInvitationController.js`, `interactionHintController.js`。
- Companion：`companionSelectController.js`, `companionFeedbackController.js`, `companionInitiativeController.js`。
- Play：`mapController.js`, `battleController.js`, `calmSyncController.js`, `actionSheetController.js`。
- Content surfaces：`soulTalkController.js`, `atlasController.js`, `codexController.js`；Codex 列出全部 Stage 1 registry 角色，未相遇可見性不授予 unlock／relationship／readiness。
- Prototype / dev：`expeditionController.js`, `devPanelController.js`。

Panel lifecycle 由 `panelManager` 統一處理；延遲行為（例如 encounter timer）必須在 close / panel switch 時取消，不能在隱藏面板後啟動 gameplay。

---

## 8. Data sources — authoritative vs reference

### Runtime authoritative

| Source | Responsibility |
|---|---|
| `assetManifest.js` | runtime asset URLs and preload groups |
| `companionRegistry.js` | companion identity/runtime/asset/persona metadata |
| `companionRuntimePolicy.js` | known/unlocked/asset-ready/selectable policy |
| `habitatRegistry.js` | seven habitat entries |
| `sceneProfiles/**` | scene placement, visual-center target, weather/object contracts |
| `chapterRegistry.js`, `chapterNarrative.js` | seven-chapter runtime data |
| `explorationNodes.js`, `mapArtLayout.js` | map nodes and map projection |
| `emotionDictionary.js`, `safetyShieldDictionary.js` | emotion/safety input dictionaries |
| `soulTalkResponsePacks.js`, `data/ai/**` | deterministic dialogue/corpus/voice data |
| `companionAdventureProfiles.js` | Expedition persona fail-closed profiles |
| `expeditionRegions.js`, `expeditionMemoryEvents.js`, `lootTables.js`, `expeditionCraftRecipes.js` | Expedition prototype data |

`heartsparkCouncilCanon.js` is Codex/canon display data; it does not replace
`companionRegistry.js` runtime eligibility.

### Historical / reference only

- `data/creatures.json`：早期 creature source；**不是**現行 companion runtime authority。
- 舊 `LakeNightCamp_v2` 單體 camp/background 樹：rollback / legacy reference；Moonlake R2 active path 以 current asset manifest + scene profile 為準。
- 舊 pixel / concept / 64 PPU / 96px assets：art reference，不能直接推導新 runtime companion readiness。

---

## 9. Expedition honesty boundary

Expedition 已有 Utility AI、session heart、result event、system facts / first-person reflection split、lite critic 與專用 memory gateway；`src/expedition/expeditionCoreBridge.js` 明確標記：

```text
reflection   = event_composer_lite_critic
memoryWrite  = expedition_gateway_v1
intent       = stub_only
coreIntegrated = false
```

因此現況只能稱 **Prototype + partial Core bridge**。完整 `runRaphaelCore` intent / full critics /
voice pack / Soul Talk memoryWriter 尚未接通；Owner seal、feel-check 與 commercial gate 未完成。

---

## 10. 明確歷史區

以下內容只用來理解演進，不得作為 current implementation 指令：

- 「只有灰影貓可 runtime、其他角色皆 placeholder」：已過時。
- 「Initial Bond 尚未實作／fresh save 預設全解鎖」：已過時。
- 「RaphaelCore 只在 docs prototype、不得接 Soul Talk」：已過時。
- 「`soulTalkController` 直接以 `processEmotionInput` 組回覆」：已過時。
- 「`data/creatures.json` 是所有可用夥伴來源」：已過時。
- 「Pixi 只有背景／平台／單角色／痕跡四類 renderer」：已過時。
- 舊 `CURRENT_CREATURE_ID` 單一主角常數：已移除。

刻意保留且不可修改／刪除：

| File | Status |
|---|---|
| `main.js` | early 800×450 prototype |
| `style.css` | legacy CSS; active root is `styles.css` |
| `script.js` | static-check stub; deletion breaks the gate |

---

## 11. 接手檢查

1. `git status --short --branch`，先辨識 unrelated dirty work。
2. 以 current source / graph 驗證本次要改的 symbol，不靠歷史段落猜。
3. 讀相關 ledger lane 與 required reading。
4. 涉及 `index.html`、state normalize/save、`pixiApp.js`、assets/tools/scripts 時走 GROUNDWORK approval。
5. Raphael QA 分開回報：hard contract、machine flags、human blind、real UI、full release gate；不可把舊自動數字合成「可上架」。
