# EVO-03～EVO-05 Groundwork 核准計畫

> 這是操作核准文件，不是 Canon，也不是授權開工。
>
> 目前隔離 branch 的 EVO-03 critical-save 已通過自審與 PR #215 impact audit，準備本地 commit。**沒有 Owner 對 EVO-04／EVO-05 的精確檔案核准前，不得開始 catalog／renderer。不得 push。**
>
> 基準：`codex/grok-formal-evolution-runtime-r1`，EVO-02 純引擎已本地完成，並另有 EVO-02.5 correction。`runtimeAuthority` 與 `runtimeFormSwapReady` 仍必須是 `false`。EVO-03～05 **不包含** flags promotion。
>
> EVO-02.5 誠實狀態：Reflection 是 verifier／consumer + sealed fixture，不是 live Soul Talk production source creation。EVO-03 可以把正式 accept 存進 schema；**不能**順便假裝 live Reflection Stage 3 已可玩。live owner 需要 `memoryWriter.js` + `storageGuard.js`，且與 PR #215 重疊，應另開 Groundwork。

---

## 1. 為什麼現在必須停

EVO-02 只產生獨立 candidate。若要把「接受邀請」變成玩家看得見、且可重開遊戲還在的下一階，就會碰到：

- 把 candidate 寫進 store／localStorage
- 讓 `formalOffer` token 活過 `normalizeGrowth`
- Growth UI 與可能的 `index.html`
- 之後才是形態 catalog 與 Pixi loader

這些是 Groundwork 或高風險 renderer。不能靠 EVO-02 的純函式偷偷做完。

---

## 2. EVO-03 精確修改檔案（critical-save + UI）

目標：candidate-first／commit-late 的正式 accept；存檔成功才發布可見 stage。對應 SOV-03、SOV-05、SOV-08。

### 必須改（Groundwork，需逐項核准）

| 檔案 | 為什麼必要 |
|---|---|
| `src/state/companionStateSchema.js` | 現行 `normalizeGrowth` 只保留 `offeredStage`／`deferredAt`。EVO-02 的 `formalOffer`（token／generation／consumed）會被剝掉，reload 後無法做 stale／idempotent accept。 |
| `src/state/store.js` | `normalizeState` 會走 schema。若 token 要成為 canonical，store 正規化必須承認同一形狀。不應改 STORAGE_KEY。 |
| `src/state/saveManager.js` | 這是唯一准許的 localStorage 寫入口。accept 必須把 **candidate** 傳進 critical persistence，失敗時不發布。可能只需沿用 `saveState(candidate)`，但仍屬 Groundwork。 |
| `src/state/defaultState.js` | **只有** schema 預設 growth 形狀需要新欄位時才改。若只在 `createDefaultGrowthState` 加 `formalOffer: null`，通常會連到這檔的間接依賴；能只改 schema 就不要動 defaultState。 |

### 很可能要改（EXPERIENCE，但要寫進同一核准包以免漏接）

| 檔案 | 為什麼 |
|---|---|
| `src/ui/companionGrowthController.js` | 把 EVO-02 純函式接到 Growth UI：顯示邀請、改寫、延後、接受。不自己改 canonical stage。 |
| `src/ui/pageRouter.js` 或現有 Growth 頁 action | 轉接玩家選擇。沿用 G3.1 `saveCandidateState` 模式。 |
| `src/app.js` | 只若必須把 accept 接到既有 `saveCriticalSnapshot`。避免新的存檔入口。 |
| `styles.css` 非地基區塊 | 邀請／延後文案與按鈕。禁止 FOMO、倒數、紅點。 |

### 可能碰到、盡量避免

| 檔案 | 能否避免 |
|---|---|
| `index.html` | **盡量避免。** 若現有 Growth 頁 DOM 已能放邀請文案／三個選擇，就只改 controller。若必須加新節點，需單獨標 GROUNDWORK。 |
| `src/engine/storageGuard.js` | **本包盡量避免。** 它與 PR #215 重疊。EVO-03 只要求 growth token 活過 schema；不要順便讓 live memory 帶 owner。 |
| `src/pixi/**` | EVO-03 不通知 renderer。畫面仍停在 Stage 1。 |

---

## 3. EVO-04 精確修改檔案（catalog + adapter）

目標：11 隻正式角色的 Stage 2／3 形態 catalog，以及 row-aware／stage-aware adapter。對應 SOV-04、SOV-12 的資料面。**不改 flags。**

### 建議新建（EXPERIENCE）

- `src/engine/formalEvolutionCatalog.js`（或同等新純模組）
  - 讀現有 `assets/characters/formal-evolution-index.json` 與 R4 索引，但 **flags 仍當 false**
  - 不得讓 `src/data/evolutionLines.js` 成為 authority

### 很可能要改

| 檔案 | 為什麼 |
|---|---|
| `src/engine/animationProfile.js` | Stage 2／3 需要自己的動作翻譯，不能把鳥／海馬／鹿套四足。 |
| `src/pixi/spriteSheetAnimationLoader.js` | 現在是 Stage 1 flat loader；需要 stage／row-aware 解析。`createSpriteAnimationController` 仍未 export。 |
| `src/data/companionRegistry.js` | **盡量只加唯讀指標**，不要在 flags 為 false 時把 R4 設成 live animation authority。 |

### 必須避免

- `assets/**` 內容改寫、刪 legacy、改 `runtimeAuthority`／`runtimeFormSwapReady`
- 把 R4 硬塞進舊 flat loader
- 一次對 11 隻啟用

---

## 4. EVO-05 精確修改檔案（renderer canary）

目標：最多三隻 canary 在 **已存新 stage** 後嘗試播新形態；失敗不回寫 stage。對應 SOV-09、SOV-12。

### 很可能要改

| 檔案 | 為什麼 |
|---|---|
| `src/pixi/spriteSheetAnimationLoader.js` | 載入失敗走同角色 fallback；保留可重試狀態。 |
| `src/pixi/companionRenderer.js` | 接收「已發布的 canonical stage」投影，不得持有 stage 權威。 |
| `src/pixi/motionController.js` | 若動作名／方向列不同，需同角色安全姿勢。 |

### Groundwork 風險

| 檔案 | 判定 |
|---|---|
| `src/pixi/pixiApp.js` | **預設不要改。** 若 canary 能在現有 layer 完成，就不要動 Pixi 核心。真的要動，必須單獨核准。 |
| `assets/**` | 不改圖、不改 flags。只讀現有 R4 包。 |

建議 canary（人類可改）：`greyshade-cat`、`auriowl`、`crystalfin-seahorse`。`auriowl` 的 Owner Lock 排除必須在視覺決策時重提。

---

## 5. store／save 交易設計（EVO-03 核心）

沿用 G3.1 care 已驗證的順序，套到正式 accept：

1. 讀取 immutable `store.getState()`。
2. 呼叫 `decideFormalEvolutionTransition` 得到獨立 candidate（EVO-02 已有）。
3. 驗證 companionId、currentStage、exact-next-stage、offer token、generation、readiness、willingness、safety provenance。
4. 將 **candidate state** 傳入 `saveCriticalSnapshot`／`saveState`。
5. 失敗：丟棄 candidate；canonical in-memory、store、localStorage、UI、Pixi 從頭到尾不變。禁止先改 canonical 再 rollback。
6. 成功：才 `replaceState(candidate)` → 才更新 Growth UI → **最後**才發 renderer intent（EVO-03 可先把 renderer intent 設成 no-op）。
7. renderer 失敗（EVO-05）：已存新 stage 不回退；同角色 fallback；禁止跨角色。

`saveState` 今天會 `normalizeState`。若 schema 不認識 `formalOffer`，成功存檔也會把 token 洗掉，idempotent／stale 會壞掉。所以 schema 與 save 必須同一包。

---

## 6. 失敗與 migration

| 情況 | 正確行為 |
|---|---|
| save 失敗 | 丟棄 candidate；玩家看到舊 stage。 |
| save 成功、UI 失敗 | reload 後仍是新 stage。 |
| renderer 失敗 | 不回寫 stage；同角色 Stage 1 或安全姿勢；可重試。 |
| 舊存檔沒有 `formalOffer` | 視為沒有進行中邀請，不是猜一個 token。 |
| 舊存檔只有 `offeredStage` 沒有 token | fail closed：不得接受。可允許夥伴重新邀請（新 generation）。 |
| 未知 companion／未知 stage | fail closed。 |
| PR #215 合併後 memory／energy／boundary 形狀改變 | 重做 EVO impact audit。若要改 storageGuard／defaultState 才能過，停下來再核准。 |

Rollback：還原 EVO-03 commit；不刪存檔 key；不改 flags。

---

## 7. PR #215／#216 影響

| PR | 現況 | 對 EVO-03～05 |
|---|---|---|
| #215 `feat/raphael-continuity-and-boundary` | 仍 OPEN，head `7bb2913` | 會改 `defaultState.js`、`store.js`、`storageGuard.js`、memory／energy／boundary。與 EVO-03 schema／save 重疊。**不得 cherry-pick。** 若合併，先 rebase 審計再開工。 |
| #216 Cursor Cloud AGENTS | 仍 OPEN + draft，head `abfc9e9` | 只應影響協作文件。合併後重讀 `AGENTS.md`。 |

---

## 8. 三種 canary 建議

1. **灰影貓 `greyshade-cat`**：預設／fallback，最能驗「同角色 Stage 1 fallback」。
2. **金羽小梟 `auriowl`**：鳥型動作，專門抓四足誤用。視覺 Owner Lock 排除必須由人類決定要不要當 canary。
3. **晶鰭小海馬 `crystalfin-seahorse`**：懸浮體，驗非四足與手機 GPU。

一次只開一隻，通過再加第二隻。不要 11 隻一起。

---

## 9. 手機 GPU 與 lazy loading

- R4 單張 sheet 2048×2048，動作×方向很多。canary 必須 **lazy load**：只載目前角色、目前 stage、目前需要的 action 列。
- 禁止開場一次載入 176 張。
- 缺 sheet／decode 失敗：同角色 fallback，不跨角色。
- reduced-motion：不要播完整進化 VFX；stage 仍以存檔為準。
- 390×844 與短手機視窗要納入 EVO-05 手動清單。

---

## 10. 完整測試矩陣（核准後才跑，現在不開工）

### EVO-03

- mock save 失敗：subscriber／UI／renderer 從未看到新 stage
- save 成功 + UI 失敗：reload 後 stage 仍新
- 重複 accept ×20
- defer 零懲罰 deep-equal
- rewrite 未二次接受前零 stage
- safeHarbor／high-risk deep-equal
- 11 隻 ownership
- 舊存檔缺 token fail closed
- 既有 G2 state／G3 care critical-save 回歸
- `git diff --check`、allowlist

### EVO-04

- catalog 不讀 `evolutionLines.js` 當 authority
- flags 仍 false 時不得選 R4 當 live authority
- 11 隻 ID 對照、鳥／海馬／鹿動作翻譯

### EVO-05

- 故意 404／decode 失敗不回寫 stage
- 跨角色 sheet 解析 fail closed
- 三隻 canary 手動視覺（人類）
- 手機 GPU／lazy load

---

## 10.5 EVO-02.5 之後：EVO-03 與 PR #215 怎麼排

- **EVO-03 可以繼續當獨立 Groundwork**：它要的是 `formalOffer` schema、critical-save、UI。它**不需要**改 `memoryWriter.js`。
- **不要把 EVO-03 當成 live Reflection Stage 3 完工包。** 玩家實際 Soul Talk 寫入的記憶仍沒有 owner／sealed safety；那是另一個 Groundwork，而且會碰到 `storageGuard.js` 與 PR #215。
- **若目標是「第三階段不對峙路徑可真實遊玩」**：應先處理或等待 PR #215，再另開 `memoryWriter` + `storageGuard` owner Groundwork。不要把這件事塞進 EVO-03。
- **若目標只是「正式進化邀請可存檔」**：仍可先做 EVO-03，但必須繼續避開 `storageGuard.js`，並假設 #215 可能同時改同一條 save 管線。

---

## 11. 只有人類能過的門

- 邀請文案與身體語言是否像「夥伴主動」，而不是系統升級鈕
- `auriowl` 要不要當 canary
- 進化瞬間的手感、留白、有沒有太像抽卡變身
- flags 何時才能改 true（**不在 EVO-03～05**）
- 是否接受 schema 新增 `formalOffer`

---

## 12. 請 Owner 核准時可用的單句

若你同意這份範圍，下一個最小開工指令可以是：

> 核准 EVO-03 Groundwork：允許改 `companionStateSchema.js`（持久化 `formalOffer`）、必要時 `store.js`／`saveManager.js`／`defaultState.js`，以及 Growth UI／pageRouter／app.js 的 candidate-first accept；禁止改 `index.html`（除非另訊）、`storageGuard.js`、`pixiApp.js`、`assets/**` 與 runtime flags；PR #215／#216 仍不得 cherry-pick。

EVO-04／EVO-05 請分開點頭，不要和 EVO-03 綁成一包自動連做。
