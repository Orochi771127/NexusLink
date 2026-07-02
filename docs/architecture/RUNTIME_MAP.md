# RUNTIME_MAP.md — Nexus Link Runtime 架構地圖

> 本文件根據實際 repo 掃描建立，描述各模組的職責與依賴關係。  
> AI agent 讀取此文件以快速理解 runtime 結構，不得根據此文件修改任何 runtime code。
> Status: NEEDS UPDATE. This map is useful for orientation, but some facts are
> stale. Verify storage keys, active companion policy, and current UI/runtime
> wiring against the live source files before using it as an implementation
> authority. The current commercial UI/UX entry point is
> `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`.

---

## 整體架構

```
index.html
  │
  ├── styles.css              (DOM UI 樣式)
  ├── pixi.js@8.8.1 (CDN)    (window.PIXI)
  └── src/app.js (ES module)  (主入口 bootstrap)
         │
         ├── State Layer      (src/state/)
         ├── Engine Layer     (src/engine/)
         ├── Pixi Layer       (src/pixi/)
         ├── UI Layer         (src/ui/)
         ├── Audio            (src/audio/)
         ├── Utils            (src/utils/)
         └── Data             (src/data/)
```

---

## 入口檔案

### `index.html`
- 唯一 HTML 入口，單頁應用
- DOM 結構定義：`#game-root`（Pixi canvas 掛載點）、`.core-hud`、`.soul-talk-launcher`、`.bottom-nav`、`.panel-layer`（含 `.character-modal`、`.soul-talk-modal`、`.action-sheet`）
- 引用 `styles.css`（link）
- 引用 PixiJS CDN：`pixi.js@8.8.1/dist/pixi.min.js`（全域 `window.PIXI`）
- 引用 `src/app.js`（`type="module"`）
- **DOM ID 被所有 JS 廣泛依賴，不得任意修改**

### `src/app.js`
- 主入口，`bootstrap()` 函式啟動整個應用
- 負責：初始化 store、saveQueue、UI controllers、Pixi scene、EventBus 監聽、ticker loop
- 依賴所有其他層，是整個系統的組裝點

---

## 架構核心原則：Pixi 場景層與 DOM UI 層分離

```
┌─────────────────────────────────────────┐
│  DOM UI Layer（styles.css + src/ui/）    │  ← z-index 高層，疊加在 canvas 上
│  HUD / 面板 / 導覽 / Soul Talk           │
├─────────────────────────────────────────┤
│  Pixi Canvas Layer（src/pixi/）          │  ← #game-root canvas
│  背景 / 天體 / 平台 / 角色 / 特效         │
└─────────────────────────────────────────┘
```

**嚴格分離規則**：
- Pixi 模組（`src/pixi/`）禁止直接操作 DOM（`document.querySelector` 等）
- UI 模組（`src/ui/`）禁止直接操作 Pixi 容器（`PIXI.Container` 等）
- 跨層通信唯一合法途徑：`EventBus`（`src/utils/eventBus.js`）或 store 訂閱

---

## 角色狀態三層分類

### Tier 1 — Active Runtime Companion（主動 Runtime 夥伴）

| 角色 | ID | Runtime 狀態 | 說明 |
|------|-----|------------|------|
| 灰影貓 | `greyshade-cat` | ✅ 完整 spritesheet | 目前唯一的 runtime 主夥伴，擁有完整動畫 pipeline（spritesheet + animations.json）|

**P1 主線優先**：`personalityProfile.js` 中的 `CURRENT_CREATURE_ID = "greyshade-cat"` 確定目前 runtime 使用的主角色為灰影貓。P1 所有開發工作以第一棲地與灰影貓為主，不擴張成多角色系統。

---

### Tier 2 — Registered Legacy / Fallback Creature（已登錄 Legacy/Fallback 生物）

| 角色 | ID | Runtime 狀態 | 說明 |
|------|-----|------------|------|
| 焰尾狐 | `flametail-fox` | ⚠️ placeholder / replacement needed | `data/creatures.json` 中有定義；舊 `assets/flametail-fox.png` 因內容錯誤已移除，需新 approved asset，尚無 spritesheet |

**限制**：焰尾狐是 **legacy/fallback registered creature**，不是目前 P1 優先角色。未獲 human 明確指示，不可擅自將焰尾狐升級為完整 animation pipeline。焰尾狐在完整 spritesheet 建立前，不應在 animation 相關代碼中被引用。

---

### Tier 3 — Roadmap Companion Candidates（路線圖候選夥伴）

| 角色 | ID | 狀態 | 說明 |
|------|-----|------|------|
| 雷霆幼狼 | `thunder-pup` | 📋 roadmap candidate | 尚未正式接入 runtime，無任何 assets |
| 星能小山豬 | `star-energy-boarlet` | 📋 roadmap candidate | 尚未正式接入 runtime，無任何 assets |

**限制**：以上角色為 **roadmap candidates**，不是 runtime creature。不可因此啟動多角色隊伍系統。不可將這些 ID 加入 `data/creatures.json` 或任何 runtime 代碼，除非有明確的正式任務授權。

---

## Pixi Layer（src/pixi/）

### `src/pixi/pixiApp.js`
- PixiJS 核心初始化：`createPixiApp(gameRoot)` → `PIXI.Application`
- 定義 `GAME_WIDTH = 390`、`GAME_HEIGHT = 844`（設計尺寸）
- 建立 scene layer 架構：`layerBackground` / `layerCelestial` / `layerPlatform` / `layerForeground` / `layerEntity` / `layerFX`
- 管理響應式縮放（safe zone + background cover）
- 管理環境元素（背景、天體、篝火、水晶、粒子）
- **核心架構檔案，風險極高**

### `src/pixi/companionRenderer.js`
- 建立角色 Pixi 節點（`createCreatureNode`）
- 管理角色定位（`positionCompanion`）
- 綁定觸碰事件（`bindCompanionTap`）

### `src/pixi/spriteSheetAnimationLoader.js`
- 載入 `assets/characters/greyshade-cat/metadata/animations.json`
- 使用 `PIXI.Assets.load()` 載入 spritesheet
- 管理動畫播放與切換

### `src/pixi/motionController.js`
- 管理角色動作狀態機（idle / walk / emotion / touch）
- `createCompanionMotion` / `updateCompanionMotion` / `playDevMotion`
- 依賴 `spriteSheetAnimationLoader.js`

### `src/pixi/habitatTraceRenderer.js`
- 在 Pixi scene 中渲染棲地情緒痕跡（glow / mist / repaired_light 等）
- `createHabitatTraceRenderer(PIXI, layerTargets)` → `sync(visuals)` + `update(t)`
- 依賴 `src/engine/traceVisualMapper.js` 輸出的 visual 描述物件

### `src/pixi/platformRenderer.js`
- 平台渲染相關輔助（依賴 pixiApp layer 系統）

---

## State Layer（src/state/）

### `src/state/store.js`
- 單一 in-memory state store
- API：`getState()` / `setState(partial)` / `replaceState(nextState)` / `updateState(mutator)` / `subscribe(listener)` / `normalizeState(rawState)`
- state 欄位：`bond` / `trust` / `mood` / `energy` / `spamScore` / `lastMessage` / `chatHistory` / `defense` / `touchFatigue` / `lastTouchAt` / `lastRejectAt` / `blockedTouchCount` / `lastBlockedTouchAt` / `lastSeenAt` / `timeAnomalyCount` / `firstTouchCompleted` / `firstHugCompleted` / `reactionPreview` / `lastTouchReaction` / `memories` / `habitatTraces` / `memorySchemaVersion` / `emotionalMemories` / `safeHarborMode` / `lastEmotionTag` / `habitatRepairFactor`
- **修改 normalizeState 可能影響存檔相容性**

### `src/state/saveManager.js`
- localStorage 唯一寫入點
- `STORAGE_KEY = "nexusLinkPrototypeState:v2"`
- Legacy keys：`"nexusLinkPrototypeState"`、`"nexusLinkState"`
- `loadState()` / `saveState(state)` / `clearState()`
- 包含 QuotaExceededError 處理與 emergency pruning

### `src/state/saveQueue.js`
- 防抖 save queue，避免每次 state 變更都寫 localStorage
- `SAVE_LEVEL.CRITICAL` / `SAVE_LEVEL.INTERACTION` / `SAVE_LEVEL.DEBOUNCE`

### `src/state/defaultState.js`
- 預設 state 物件，包含所有欄位的初始值

---

## Engine Layer（src/engine/）

### `src/engine/emotionalSedimentationEngine.js`
- 處理玩家輸入的情緒沉積
- `processEmotionInput(message, state, options)` → 情緒分析結果

### `src/engine/habitatTraceEngine.js`
- 管理棲地情緒痕跡（habitatTraces）的生命週期
- `createHabitatTraceFromMemory(memory, now)` / `upsertHabitatTrace(traces, trace)` / `pruneHabitatTraces(traces)`
- TTL：14 天（`TRACE_TTL_MS = 14 * 24 * 60 * 60 * 1000`）

### `src/engine/traceVisualMapper.js`
- 將 habitatTrace 資料映射為 Pixi 視覺描述物件
- `mapHabitatTracesToVisuals(traces)` → visual array

### `src/engine/memoryLifecycleEngine.js`
- 管理 emotionalMemories 的狀態轉換（fresh → settled → transformed）

### `src/engine/interactionController.js`
- 管理角色觸碰互動邏輯（touch / hug / reject）
- 依賴 `touchReactionEngine.js` 和 `companionPersonality.js`

### `src/engine/touchReactionEngine.js`
- 計算觸碰反應（accept / guarded_accept / reject）

### `src/engine/actionEffectEngine.js`
- 計算底部導覽行動（探索 / 照顧 / 成長 / 記憶）的 state patch

### `src/engine/environmentController.js`
- 管理環境狀態（時間、天光、天體位置）

### `src/engine/environmentHeartbeat.js`
- 定時更新環境狀態，驅動日夜循環

### `src/engine/offlineRecovery.js`
- 處理離線返回後的狀態恢復

### `src/engine/offlineTraceEngine.js`
- 離線期間的 trace 模擬計算

### `src/engine/returnBehaviorEngine.js`
- 計算玩家長時間離線返回後的夥伴行為

### `src/engine/recoveryEngine.js`
- 棲地修復計算

### `src/engine/personalityProfile.js`
- 定義 `CURRENT_CREATURE_ID`（目前為 `"greyshade-cat"`）和 `FALLBACK_CREATURE`

### `src/engine/companionPersonality.js`
- 夥伴性格計算輔助

### `src/engine/animationProfile.js`
- 動畫狀態到 spritesheet 動畫名稱的映射

### `src/engine/safeHarborMode.js`
- 安全港模式：高風險情緒輸入的回應策略

### `src/engine/storageGuard.js`
- localStorage 容量保護，state pruning 策略

### `src/engine/runtimeGuard.js`
- Pixi ticker 的 frame 保護（防止 tab 切換導致的大 delta）

---

## UI Layer（src/ui/）

### `src/ui/hudController.js`
- 管理 HUD（`#fox-name`、`.core-status-dot`、角色狀態列）
- 監聽 store 訂閱，渲染 bond / trust / energy / mood

### `src/ui/soulTalkController.js`
- 管理 Soul Talk 面板（`#chat-log`、`#message-input`、`#send-button`）
- 處理玩家訊息輸入 → `processEmotionInput` → 更新 store → 觸發 saveCurrentState
- 依賴 `emotionalSedimentationEngine`、`habitatTraceEngine`、`memoryLifecycleEngine`

### `src/ui/actionSheetController.js`
- 管理底部導覽（探索 / 照顧 / 成長 / 記憶）的 action sheet
- 依賴 `actionEffectEngine`、`EventBus`

### `src/ui/panelManager.js`
- 管理 `.panel-layer` 的開關（`openPanel` / `closePanel`）
- 支援 character / soulTalk / actionSheet 三種面板

### `src/ui/devPanelController.js`
- Dev panel（`?devPanel=1` 啟動）：顯示 state 讀數、動畫測試、存檔狀態

---

## Data Layer（src/data/）

### `src/data/assetManifest.js`
- 所有 runtime 資產路徑的集中定義
- 包含：backgrounds、platforms、props、audio、characters

### `src/data/emotionDictionary.js`
- 情緒關鍵字對應表（用於訊息情緒分析）

### `src/data/safetyShieldDictionary.js`
- 高風險訊息關鍵字對應表

### `src/data/sceneLayout.js`
- 場景物件的預設座標/縮放資料

---

## Audio（src/audio/）

### `src/audio/audioManager.js`
- BGM 播放管理（`bgm_lakefront.mp3`）
- 解鎖 AudioContext（需要使用者互動）
- 靜音切換

---

## Utils（src/utils/）

### `src/utils/dom.js`
- `qs(selector)` / `qsa(selector)`（`document.querySelector` 包裝）
- `bindViewportVars()`（設定 CSS `--app-height`）

### `src/utils/eventBus.js`
- 簡單 pub/sub 系統（`EventBus.on` / `EventBus.emit`）
- 主要用於 Pixi → UI 的單向通信（不破壞耦合規則）

### `src/utils/clamp.js`
- `clamp(value, min, max)` 工具函式

### `src/utils/time.js`
- 時間相關工具函式

---

## Tools（src/tools/）

### `src/tools/sceneEditor.js`
- Scene editor 模式（`?devSceneEditor=1` 啟動）
- 允許在場景中拖拉調整物件位置
- 僅 dev 模式使用，不影響 production

---

## Assets（assets/）

```
assets/
├── audio/
│   └── bgm_lakefront.mp3           (背景音樂)
├── backgrounds/LakeNightCamp_v2/
│   ├── bg_day_base.PNG             (白天背景，1080x1920)
│   └── bg_night_base.PNG           (夜晚背景，1080x1920)
├── characters/
│   └── greyshade-cat/
│       ├── spritesheets/           (64x64 / 128x128 透明 PNG spritesheet)
│       │   ├── emotion/            (idle_calm, idle_happy, etc.)
│       │   ├── movement/           (left_walk, right_walk, sit, sleep)
│       │   ├── special/            (idle_dance, idle_wake, idle_wash, etc.)
│       │   ├── touch/              (touch_accept, touch_guarded, touch_reject, hug)
│       │   └── battle/             (attack_basic, defend, hit)
│       ├── frames/                 (個別 frame PNG，用於工具生成 spritesheet)
│       ├── metadata/
│       │   └── animations.json     (動畫 metadata，spritesheet loader 的設定來源)
│       └── inbox* / inbox_manual_transparent*  (原始素材 inbox)
├── platforms/LakeNightCamp_v2/
│   └── magic_circle.PNG           (魔法陣平台)
├── props/LakeNightCamp_v2/
│   ├── prop_campfire.PNG
│   ├── prop_crystal.PNG
│   ├── celestial_sun.png
│   └── celestial_moon.png
└── ui/
    ├── nav/                        (bottom nav 圖示，active/default 各4個)
    ├── buttons/                    (BTN_Care, BTN_Explore, BTN_Growth, BTN_Memory)
    └── panels/                     (UI 參考設計稿)
```

---

## Data（data/）

### `data/creatures.json`
- 所有可用心核夥伴的定義（目前有 `greyshade-cat` 和 `flametail-fox`）
- 包含：id、name、element、personality 參數、reactionThresholds、fatigueRules
- 由 `src/app.js` 透過 `fetch()` 載入

---

## 廢棄 / 遺留檔案

| 檔案 | 狀態 | 說明 |
|------|------|------|
| `main.js` | 遺留（廢棄） | 早期 800×450 prototype Pixi demo，未被 index.html 引用，不應修改 |
| `style.css` | 遺留（廢棄） | 早期 CSS，未被 index.html 引用（active CSS 是 `styles.css`） |
| `script.js` | stub | 只有一行注釋，供 `node --check` 驗證用，不應修改 |
