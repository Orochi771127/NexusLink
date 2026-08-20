# CURSOR_GROK_EVOLUTION_HANDOFF.md

> **這是操作交接文件，不是 Master Canon，也不是產品憲法。**
>
> 權威順序仍是：Master Canon → `AGENTS.md`／`CLAUDE.md` → Growth Contract → `ACCEPTANCE.md` → Ledger → 本檔。
> 若本檔與上位文件衝突，以上位文件為準，並追加 Ledger `CORRECTION`／`SUPERSEDED`，不得默默改 Canon。
>
> 最後更新：2026-08-15（**停工交給 Codex**。HEAD=`a7958b0` EVO-04 已 commit；EVO-05／05.5 未提交。先讀 §0，再讀 Codebase MCP ADR。）

---

## 0. 現況快照（2026-08-15 Cursor Grok 停工；Codex 從這裡讀）

**先讀這節。下面 §2～§14 有過期句子（例如「#215 仍 OPEN」「不要開 EVO-03」），那些是當時窗口的歷史，不是現在的指令。**

| 項目 | 現值 |
|---|---|
| Worktree | `C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink-grok-formal-evolution-runtime-r1` |
| Branch | `codex/grok-formal-evolution-runtime-r1` |
| HEAD | `a7958b0` `feat(growth): catalog formal evolution forms without live swap`（EVO-04） |
| 未提交 | EVO-05 灰影貓棲地 canary ＋ EVO-05.5 自審加固。**Owner 未要求 commit／push。** |
| Codebase MCP 專案名 | `C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink-grok-formal-evolution-runtime-r1` |
| MCP 第一個動作 | `manage_adr(mode: get)`。ADR 才是這條 lane 的敘事 SSOT。`docs/` 在 moderate 索引時被排除。 |
| 畫面 | **NOT VERIFIED**。Cursor 託管瀏覽器連不到本機 `localhost:5173`。 |

### 誠實產品邊界（回報時必須照抄）

- **EVO-03** = 邀請可存檔 ＋ candidate-first accept。**不是**換形 Runtime。
- **EVO-04** = 11 隻 Stage 2／3 **目錄與對照**。`selectLiveAnimationAuthority` 一律回 `stage1-illustrated-runtime`。
- **EVO-05** = 僅 `greyshade-cat` 棲地 **試播** R4 idle。失敗退回**同一隻** Stage 1。不改存檔 stage。不改 flags。
- Care＋Exploration＋Reflection＋Chapter Stage 3 仍是 **sealed fixture proof**，不是 live Soul Talk Stage 3。
- `evolutionLines.js` 不是正式 stage authority。
- 灰影貓不得 fallback 到其他角色美術。
- 兩支 flags 必須保持 `false`：`runtimeAuthority`、`runtimeFormSwapReady`。
- **不要開始 EVO-06。不要一次開 11 隻。不要把金羽小梟當 canary（Owner Lock）。**

### 已封存 commit（不要改寫歷史）

1. `d572f40` EVO-00 契約／SOV
2. `58cdb0a` EVO-01 Reflection verifier／consumer（sealed fixture，不是 live Stage 3）
3. `6267967` EVO-02 純狀態機
4. `478041e` EVO-02.5 roster／provenance 缺口
5. `84e45b5` EVO-03 邀請 critical-save ＋ Growth UI
6. `4c33dd4` **merge** PR #215 進本 branch（不是 cherry-pick）
7. `a7958b0` EVO-04 catalog；live 仍 Stage 1

### PR #215（已 MERGED，不要再當 OPEN）

- URL：https://github.com/Orochi771127/NexusLink/pull/215
- Merge：`3b9624e`；本 branch 經 `4c33dd4` 合入。
- Codex 審查 P1 **未修**：能量見底可能把 caution／求助出口靜音。應**另開小修 PR**，不要塞進化包。
- live Reflection owner 仍要另開 `memoryWriter` + `storageGuard` Groundwork。

### 為什麼會提到「走路」（不是在做走路玩法）

Stage 1 的 `animations.json` 是扁平名字：`idle_calm`、`left_walk`。R4 美術包是 4×4 大圖：idle／walk／attack／recovery。棲地舊程式仍可能呼叫 `left_walk`。Canary 只做**名字對照**，讓舊 motion 不會因為缺別名而亂抓圖。若對照失敗或 walk sheet 變成別隻身體，整包 canary 失敗，退回同一隻 Stage 1。**沒有改 `motionController.js`。玩家要驗的仍是：還是不是同一隻灰影貓的 idle。**

### EVO-05／05.5 未提交檔

新建：`src/engine/formalEvolutionCanaryPlan.js`、`docs/qa/evo-05-formal-evolution-canary-cases.mjs`、`docs/qa/EVO_05_GREYSHADE_CANARY_MANUAL.md`

修改：`src/app.js`、`src/pixi/companionRenderer.js`、`src/pixi/spriteSheetAnimationLoader.js`、`src/ui/pageRouter.js`、`src/engine/formalEvolutionCatalog.js`（註解）、`ACCEPTANCE.md`、`docs/design/COMPANION_GROWTH_CONTRACT_V1.md`、`docs/testing/MANUAL_TEST_CHECKLIST.md`、`docs/agent/AI_EXECUTION_LEDGER.md`

**沒動：** `pixiApp.js`、`assets/**`、flags、`index.html`、save schema、`motionController.js`。

關鍵接線：

- 階段投影用 `getCompanionCodexGrowthPresentation(...).formalStage`，**不要用** `revealStage`。
- Canary 僅 `greyshade-cat` 且 canonical `growth.stage` 已是 `resonant_mature`／`final_awakened`。
- 開場只載 R4 idle cardinal south 4 格，不是 176 張。
- `commitFormalEvolutionTransition.rendererIntent` 仍是 null；refresh 在 `pageRouter` 且僅灰影貓 published accept。
- 對峙 `standoffCircleRenderer.js` 仍走 Stage 1 pack。
- QA helper `previewGreyshadeCanary` 會改記憶體 `growth.stage`，可能被自動存檔；必須拋棄式／無痕。

### 驗證（Grok 最後一次）

EVO-05 **15/15**（含 05.5）；EVO-04 10/10；EVO-03 9/9；EVO-02 15/15；EVO-01 9/9；G2 25/25；G3 engine 16/16。瀏覽器畫面 **NOT VERIFIED**。自審：**PASS WITH RISKS**。

### Codex 安全下一步（順序不可跳）

1. 在這個 worktree 讀 ADR：`manage_adr(mode: get)`。
2. 讀 Ledger Lane 1 最新 `EVO-05.5 VERIFIED` 與本節。
3. **等 Terence 用** `docs/qa/EVO_05_GREYSHADE_CANARY_MANUAL.md` 看畫面。不要自己宣稱 visual PASS。
4. 只有 Terence 明確要求才本地 commit。建議訊息：`feat(growth): canary greyshade formal evolution presentation without live swap`
5. 不要 EVO-06、不要改 flags、不要 push／PR／merge、不要開海馬或金羽小梟 canary。

---

## 1. 這份文件是什麼

給下一位 AI（或 Terence 人工複驗）用的 **EVO-00～EVO-06 施工交接**。

它回答：

- 現在站在哪一條 branch、哪一個 HEAD
- 美術包有多少、Runtime 接了沒有
- Growth 哪些層級已完成、哪些沒有
- 程式要從哪個函式開始讀
- 下一包能不能開工（預設：**EVO-02 可在 EVO-01 全過後進入**；EVO-03 必須另開 Groundwork 核准）

它**不**授權：push、PR、merge、改未核准 Groundwork、改 `assets/**`、把 runtime flags 改成 true、開始 EVO-03。

Owner 已授權本隔離 branch 在通過後建立本地 EVO-00／EVO-01／EVO-02 commit，並在 EVO-02 後停下。

---

## 2. 基準（2026-08-15 重新驗證）

| 項目 | 值 | 驗證方式 |
|---|---|---|
| 工作性質 | 隔離 worktree | 既有路徑 |
| Branch | `codex/grok-formal-evolution-runtime-r1` | `git branch --show-current` |
| Worktree | `C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink-grok-formal-evolution-runtime-r1` | 目前施工區 |
| 基準 remote | `origin/main` | `git ls-remote origin refs/heads/main` |
| HEAD | `076a65f610caba0c0090fecc15c43bf936e84906` | Merge PR #218 First Touch |
| origin/main | 同 HEAD | `0 / 0` |
| Git status at window start | clean | `git status --short` |
| 平常工作區 | **禁止碰** | 不進入 dirty checkout |

已合併、不得重做：

- EVO-00 原文：PR #217 / commit `0820fa5`
- First Touch：PR #218
- **不要回到 `8b5360f`**

PR 漂移（開工時仍未合併）：

- [#215](https://github.com/Orochi771127/NexusLink/pull/215) OPEN，head `7bb2913`。會改 `defaultState.js`、`store.js`、`storageGuard.js`、memory／energy／boundary。
- [#216](https://github.com/Orochi771127/NexusLink/pull/216) OPEN + draft，head `abfc9e9`。會改 `AGENTS.md`。

---

## 2.1 EVO-00 CORRECTION：candidate-first / commit-late

先前可能被讀成：validate offer → 先寫 canonical `growth.stage` → save → 失敗再 rollback。

這不安全。正式契約改為：

1. 讀取 immutable current state
2. 純函式建立獨立 candidate
3. 驗證 companionId／currentStage／exact-next-stage／offer token／generation／readiness／willingness／safety provenance
4. 把 candidate 傳入 critical persistence
5. 失敗：丟棄 candidate；canonical／store／localStorage／UI／Pixi 從頭到尾不變
6. 成功：才發布 canonical in-memory → 才通知 UI → 最後才通知 renderer
7. renderer 失敗：已存新 stage 不回退；同角色 fallback；禁止跨角色；可重試

這仍是文件契約。**Formal stage accept Runtime 尚未實作。**

---

## 2.2 EVO-01 A 檔：精確 allowlist 與 pageRouter 轉接理由

Task name: `EVO-01 Reflection Owner And Safety Provenance`
Layer: EXPERIENCE
Red-line: 不引入依賴偵測；不把 safetyShield 當獎勵；safeHarbor／high-risk 零 evidence；不猜 owner。
Non-goals: 不開始 offer／stage advance／renderer；不改 runtime flags；不改 `storageGuard`／store／schema／saveManager。

### 為什麼可以改 `src/ui/pageRouter.js`

- 它不是 `CLAUDE.md` §5.1 Groundwork 禁區（不是 `index.html`、`saveManager.js`、`store.js`、`defaultState.js`、`companionStateSchema.js`、`pixiApp.js`、`assets/**`、`tools/**`、`scripts/**`）。
- 圖譜追蹤後，Memory Echo 的 production caller 在 `handlePageAction` 的 `memory_echo` commit 成功之後。
- 本次只做 provenance 轉接：呼叫 `writeReflectionPracticeIntoDraft`；缺主人／缺 sealed safety 時 fail closed、不丟錯、不猜 `activeCompanionId` 當 source owner。
- 既有 `memory_echo` 的 trust 效果仍走 `actionEffectEngine`；Reflection writer 本身不寫 relationship／reward／原始玩家文字。
- 沿用 G3.1 care 既有的 candidate-first save helper，不修改 `saveManager.js` 或 save schema。

### 精確 allowlist

- `src/engine/reflectionGrowthOwner.js`
- `src/ui/companionGrowthController.js`
- `src/ui/pageRouter.js`（僅 provenance 轉接）
- `docs/qa/evo-01-reflection-production-cases.mjs`
- `docs/qa/companion-growth-non-standoff-readiness-cases.mjs`
- `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`
- `ACCEPTANCE.md`
- 本檔
- `docs/agent/AI_EXECUTION_LEDGER.md`（只追加）

### 誠實邊界（不是 STOP，也不是完整 live persist）

GO 判定：sealed fixture 資料完整時可寫合法 reflection evidence；舊資料 fail closed。
**誠實狀態：** Reflection provenance verifier／consumer 與 fixture path 已完成；production source creation／save roundtrip 尚未完成。`memoryWriter.js` 尚未在 source 建立時寫 `companionId`／`safetyProvenance`。不得宣稱 live Soul Talk Reflection 已有完整 Stage 3 production path。

---

---

## 3. 已知資產數量（本次重新驗證）

來源：`assets/characters/formal-evolution-animation-r4.json`、`assets/characters/formal-evolution-index.json`、`docs/art/FORMAL_EVOLUTION_ANIMATION_R4_QC.md`。

| 項目 | 數量／狀態 |
|---|---|
| 角色 | 11 |
| 進化形態（Stage 2＋3） | 22 |
| Sprite Sheet | 176 張 2048×2048 |
| 格數 | 2816（每格 512×512，4×4） |
| 動作 | idle／walk／attack／recovery |
| 方向 | cardinal＋diagonal（八向） |
| `runtimeAuthority` | `false` |
| `runtimeFormSwapReady` | `false` |
| 包狀態 | `strict-self-qc-pass-runtime-not-wired` |

正式 11 隻 ID：

- 中立：`greyshade-cat`
- 議會：`auriowl`、`sprigfawn`、`crystalfin-seahorse`、`blazetail-kit`、`starstripe-cub`
- 黑鐵：`thunder-pup`、`wavecub`、`starflame-phoenix`、`star-foal`、`goldenspark-wyrm`

**Owner Lock R2（本次讀檔確認，不是重做美術 QC）**：10 隻視覺設計已 owner-approved；**刻意排除 `auriowl`**（金羽戰鷹視覺改向，技術 ID 仍為 `auriowl`）。R4 動畫索引包含 11 隻。小梟是否當 renderer canary，留給人類。

EVO-00 **沒有**修改 `assets/**`，也 **沒有**重新執行 176 張 sheet 的機械 QC。上表是讀現有索引與 QC 文件。

---

## 4. 已完成的 Growth 層級 vs 尚未完成的 Runtime

### 已實作（本次以 origin/main 程式入口核對，不是重跑瀏覽器套件）

- **G1** 質性心相觀察（session-only）
- **G2** per-companion `companionStates`、migration、Codex 隔離
- **G3** evidence foundation、`evaluateCompanionGrowthReadiness`、`evaluateCompanionGrowthWillingness`
- **G3.1** Heart Phase care source owner、candidate-first critical save
- **G3.2 Reflection verifier／consumer（有限）**：sealed fixture 可寫 `reflection` evidence。production source creation／save roundtrip 尚未完成（`memoryWriter.js` 未寫 owner／sealed safety）。
- **EVO-02 純 G4 狀態機**：`src/engine/companionFormalEvolutionTransitionEngine.js` 可產出獨立 candidate（offer／rewrite／defer／accept）。
- **EVO-03 critical-save + Growth UI**：`formalOffer` 可活過 schema；accept 先存檔再發布。renderer intent 仍是 no-op。
- **EVO-04 catalog＋adapter**：`src/engine/formalEvolutionCatalog.js` 可查出 11 隻 Stage 2／3 路徑、動作家族與同角色 fallback。flags 為 false 時不得選 R4 當 live。

### 尚未完成（不得寫成已完成）

- **live Reflection production source creation**：`memoryWriter.js` 尚未在建立記憶時寫 `companionId`／`safetyProvenance`。#215 已合進 main，但仍沒有 live owner 戳記。
- **第三階段不對峙路徑的完整可玩 live path**：只有 sealed fixture 證明；不得宣稱 live Soul Talk Reflection 已有完整 Stage 3 production path。
- **Growth G4 renderer**：尚未接 Pixi 或真正換形。Stage 1 illustrated runtime 仍是 live fallback。
- **runtime flags**：仍必須是 false。
- **`evolutionLines.js`**：不是正式 stage catalog authority。

G2 schema 已有 `offeredStage`、`deferredAt` 佔位欄位。這只代表資料形狀預留，**不代表邀請流程已上線**。

---

## 5. 主要程式入口（本次重新驗證函式存在）

| 目的 | 檔案 | 符號 | 注意 |
|---|---|---|---|
| Readiness | `src/engine/companionGrowthEngine.js` | `evaluateCompanionGrowthReadiness` | 已實作；不讀 bond／defense／時間 |
| Willingness | 同上 | `evaluateCompanionGrowthWillingness` | 已實作；還不會發出 Growth G4 offer |
| Growth UI VM | `src/ui/companionGrowthController.js` | `getViewModel` | 已實作質性 VM；無 stage offer UI |
| Safety provenance helper | `src/engine/companionGrowthEngine.js` | `validateSafetyProvenance` | 內部函式 |
| Reflection owner | `src/engine/reflectionGrowthOwner.js` | `createOwnedSafeReflectionSource`／`createReflectionGrowthWriteInput` | verifier／consumer；production source creation 未完成 |
| Formal evolution transition | `src/engine/companionFormalEvolutionTransitionEngine.js` | `decideFormalEvolutionTransition` | 純函式；回傳 candidate；不存檔 |
| Reflection evidence consumer | `src/ui/companionGrowthController.js` | `writeReflectionPracticeIntoDraft` | 消費已封存來源；不寫 relationship／reward／玩家原文；不開始 offer |
| Memory Echo 轉接 | `src/ui/pageRouter.js` | `recordCompletedReflectionPractice` | 只做 provenance 轉接；缺資料 fail closed |
| Sprite controller | `src/pixi/spriteSheetAnimationLoader.js` | `createSpriteAnimationController` | **未 export**；Stage 1 loader。R4 manifest 不可硬塞進來 |
| 第一次觸碰覺醒 | `src/ai/awakening/raphaelAwakeningGate.js` | `getAwakeningStage` | dormant／stirring／awakened，**不是** formal stage |
| Raphael 自我改進 | `src/ai/evolution/**` | （提案管線） | **不是**換形 Runtime |
| 舊圖鑑線 | `src/data/evolutionLines.js` | `EVOLUTION_LINES` | compatibility data only |

下一位 AI 若用 Codebase MCP，應先讀本檔與 Growth Contract §5.2／§13，再 `query_graph`／`search_code` 以上符號。不要對 PNG 建呼叫圖。

---

## 6. 預計 EVO-01～EVO-06（EVO-00 文件已封存；EVO-01 本窗口施工）

施工順序刻意是：契約 → provenance → 純狀態 → 存檔／UI → 動畫轉接 → Renderer → QA／promotion。

| Pack | 做什麼 | Groundwork 觸點 | 禁止 |
|---|---|---|---|
| **EVO-00** | 本包：契約、SOV、handoff、Ledger | 四份文件 | 改 Runtime／assets／Canon |
| **EVO-01** | Reflection owner 正式啟用；證明不靠 standoff 的 Stage 3 路徑 | memory／trace owner、safety provenance、`reflectionGrowthOwner.js`、controller／pageRouter 轉接。**未改** storageGuard／store／schema | 開始 offer／換形；猜 owner |
| **EVO-02** | 純 G4 狀態機 | `companionFormalEvolutionTransitionEngine.js`；禁止碰 DOM／Pixi／save。`formalOffer` 尚未進 schema | DOM、Pixi、save、assets、flags |
| **EVO-03** | UI＋critical-save | controller、store、saveManager、Growth UI | 改 flags、改 Pixi loader |
| **EVO-04** | 正式 catalog＋R4 adapter | 新 catalog；stage-aware／row-aware adapter | 讓 `evolutionLines.js` 當 authority；把 R4 硬塞進舊 flat loader |
| **EVO-05** | Renderer canary | `spriteSheetAnimationLoader.js`、Pixi | 一次開 11 隻；跨角色 fallback |
| **EVO-06** | QA 與 promotion 決策 | 獨立 Groundwork 才能改 flags | 把 promotion 藏在別包 |

建議 canary（人類可改）：`greyshade-cat`、`auriowl`、`crystalfin-seahorse`。`auriowl` 的 Owner Lock 排除必須在 canary 決策時重提。

Orbit／Expedition 不得成為 Growth 或 stage authority。

---

## 7. 安全紅線（進化路徑也要守）

- `safeHarborMode` 是 terminal：禁止 offer、accept、stage advance、VFX、delayed callback、renderer transition、save、reward、memory、relationship。
- high-risk 與 `growthSafetyExcluded` 不得當 evidence，也不得開邀請。
- 延後零懲罰，無 FOMO、無倒數、無錯過旗標。
- 一次只前進 exact-next-stage。
- 存檔成功前，canonical in-memory state 與畫面都不得發布新 stage：必須 candidate-first／commit-late（見 §2.1 與 Growth Contract §5.3）。失敗時丟棄 candidate，不依賴事後 rollback。
- renderer 失敗不得回寫或污染已存 stage。
- fallback 只允許同一隻夥伴。
- 舊資料無法證明主人時 fail closed，不准用 `activeCompanionId` 猜。
- 兩支 runtime flags 在完整 promotion 前保持 false。
- 不新增 TypeScript 編譯、bundler、npm runtime／dev dependency、不改 lockfile、不改 Pages 部署根。JSDoc／`// @ts-check` 可以使用。

---

## 8. PR #215／#216 潛在影響（**§0 已更新：#215 已 MERGED**。以下是 EVO-00 當時紀錄，勿當現況）

查詢時間：2026-08-14 EVO-00 開工前 `gh pr view`。

| PR | 狀態 | 為何重要 |
|---|---|---|
| [#215](https://github.com/Orochi771127/NexusLink/pull/215) `feat/raphael-continuity-and-boundary` | **OPEN**，head `7bb29136c448181ca252ec179860da114c60503a`（2026-08-15 再查） | 改 `storageGuard.js` 情緒記憶保留、`store.js`／`defaultState.js` 頂層 `boundaryPressure`／`boundaryBand`、能量撤退。**不改** Growth schema／controller。EVO-03 **未 cherry-pick**；可並行。live Reflection owner 仍要另開 `memoryWriter` + `storageGuard` Groundwork。 |
| [#216](https://github.com/Orochi771127/NexusLink/pull/216) `cursor/setup-dev-environment-0511` | **OPEN + isDraft:true**，head `abfc9e99e30ad97cfd0ce440d6ef3313fd03ddd3` | 會改 `AGENTS.md`。若在 EVO-00 期間合併，下一包必須重讀協作規範 |

兩者的 `web-release-gate` 先前盤點報告為通過。**本次 EVO-00 沒有重新跑 CI logs**；「gate 通過」列為歷史報告，見 §10。

EVO-00 可以在目前 `origin/main` 上做，因為本包只改文件。

**開始 EVO-01 前必須：**

1. 重新 `git fetch origin main`
2. 重新檢查 PR #215／#216 是否合併或 rebase
3. 若已合併，以新的 main 為基準重建或 rebase 計畫（需 Owner 指示）
4. 重新閱讀 `AGENTS.md`／`CLAUDE.md`
5. 重新做 Growth／state／memory impact audit
6. 不得把 EVO-00 的 `8b5360f` 直接當成 EVO-01 永久基準

---

## 9. 下一位 AI 如何用 Codebase MCP 接手

本次 EVO-00 已對本 worktree 完成索引：

| 項目 | 值 |
|---|---|
| MCP project name | `C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink-grok-formal-evolution-runtime-r1` |
| root path | `C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink-grok-formal-evolution-runtime-r1` |
| status | `ready` |
| nodes | 20466 |
| edges | 43546 |
| persistence | `.codebase-memory/graph.db.zst` 已寫入；**未 commit**（本包禁止 commit） |

已能在此 project 查到：

- `evaluateCompanionGrowthReadiness` → `src/engine/companionGrowthEngine.js`
- `evaluateCompanionGrowthWillingness` → 同上
- `getViewModel` → `src/ui/companionGrowthController.js`
- `createSpriteAnimationController` → `src/pixi/spriteSheetAnimationLoader.js`（未 export）
- `source_owner_unverifiable` → `src/engine/reflectionGrowthOwner.js` 的 `inspectOwnedSafeSourceRecord`

接手步驟：

1. 確認自己在 **這個 worktree**，不要索引平常 dirty 工作區然後以為那是施工區。
2. 若 index 過期，再對本路徑執行 `index_repository` `mode: full` `persistence: true`，等 `index_status` 的 `status=ready`。失敗就報失敗，不得偽造 node／edge。
3. 先 `query_graph`／`search_code` 上述符號。
4. 讀：
   - `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`（尤其 §2、§5.2、§12、§13）
   - `ACCEPTANCE.md` **SOV-01～SOV-12**
   - `docs/agent/AI_EXECUTION_LEDGER.md` 最新 Lane 1／Lane 3（以及 Lane 2 的唯讀資產確認）
   - 本檔
5. **（過期）停住 EVO-03**。這是 EVO-00 窗口的指令。2026-08-15 現況：EVO-03／04 已 commit，EVO-05 未提交。改看 §0 與 §18。

PNG 不進呼叫圖。資產正確性靠 git、manifest、既有 QC 文件、SHA／尺寸／格線；不要用 MCP 假裝驗證了 176 張圖。

---

## 10. 哪些事實是本次重新驗證，哪些只是歷史報告

### 本次重新驗證（2026-08-14 EVO-00）

- `origin/main` SHA = `8b5360fabeab08c71291dbf35537fad11d939e03`
- PR #215 OPEN、未合併
- PR #216 OPEN + draft、未合併
- 目標 branch／worktree 原先不存在，並已從 `origin/main` 建立
- 11／22／176／2816 與兩支 runtime flags = false（讀索引 JSON）
- Growth 入口函式存在於上述檔案
- `reflectionGrowthOwner.js` 存在 fail-closed；未被 production controller 作為 live source owner 接上（import 僅 QA 與 `codexLivedPaths.js`）
- `createSpriteAnimationController` 未 export，服務 Stage 1
- `origin/main` 的 `CLAUDE.md` **與** `AGENTS.md` 都已允許 TypeScript／npm／bundler（這點修正了「只有 CLAUDE.md 允許」的較舊說法）
- EVO-00 只改四份允許清單文件
- 本 worktree Codebase MCP：project `C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink-grok-formal-evolution-runtime-r1`，status=`ready`，nodes=20389，edges=43309（EVO-01 重索引；EVO-00 當時為 20329／43379）

### 歷史報告，尚未在本包重新驗證

- PR #215／#216 的 `web-release-gate` 綠燈（先前盤點；本包未重拉 check runs）
- R4 機械 QC 對 176 張 sheet 的逐格結果（讀 QC 文件，未重跑影像審計）
- Owner 對 10 隻 R2 視覺的人工手感
- 平常 dirty 工作區的具體 diff 內容（本包刻意不進入該工作區）
- 完整 Runtime／瀏覽器／手機測試
- PR #215／#216 的 check-run 細節（本包只重查 open／draft／head SHA，未重拉 CI logs）

---

## 11. EVO-00 實際改了哪些檔

允許清單：

1. `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`
2. `ACCEPTANCE.md`
3. `docs/handoff/CURSOR_GROK_EVOLUTION_HANDOFF.md`（本檔，新建）
4. `docs/agent/AI_EXECUTION_LEDGER.md`（只追加，不刪歷史）

未改：Master Canon、`AGENTS.md`、`CLAUDE.md`、`index.html`、`src/**`、`assets/**`、`styles/**`、`tools/**`、`scripts/**`、package／lockfile、runtime flags。

---

## 12. 驗證聲明

EVO-00 是文件與驗收契約包，沒有修改 Runtime，因此本包沒有宣稱 Runtime 測試通過。

本包應執行的驗證僅限：

- `git status --short`
- `git diff --check`
- 只允許清單檔變更
- 無 `src/**`、無 `assets/**`
- 兩支 runtime flags 未被改動
- Ledger 只有追加
- `SOV-01`～`SOV-12` 完整且無重號
- 每條 SOV 都有 implementation status，且 Growth G4 未標成 `implemented`

---

## 13. EVO-01 實際改了哪些檔

允許清單：

1. `src/engine/reflectionGrowthOwner.js`
2. `src/ui/companionGrowthController.js`
3. `src/ui/pageRouter.js`（僅 Memory Echo provenance 轉接；見 §2.2）
4. `docs/qa/evo-01-reflection-production-cases.mjs`
5. `docs/qa/companion-growth-non-standoff-readiness-cases.mjs`
6. `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`
7. `ACCEPTANCE.md`（SOV-07／SOV-10 依實際接線標 `partial`）
8. `docs/handoff/CURSOR_GROK_EVOLUTION_HANDOFF.md`
9. `docs/agent/AI_EXECUTION_LEDGER.md`（只追加）

未改：Master Canon、`AGENTS.md`、`CLAUDE.md`、`index.html`、`saveManager.js`、`store.js`、`defaultState.js`、`companionStateSchema.js`、`storageGuard.js`、`pixiApp.js`、`assets/**`、package／lockfile、runtime flags。

SOV-01～SOV-06、SOV-08、SOV-09、SOV-11、SOV-12 不因本包變綠。正式進化 Runtime 仍未標 `implemented`。

---

## 14. EVO-02 實際改了哪些檔

1. `src/engine/companionFormalEvolutionTransitionEngine.js`（新建純函式）
2. `docs/qa/evo-02-formal-evolution-transition-cases.mjs`
3. `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`
4. `ACCEPTANCE.md`（SOV-01～SOV-07 依純引擎標 `partial`；SOV-08／09／11／12 不變綠）
5. 本檔
6. `docs/agent/AI_EXECUTION_LEDGER.md`（只追加）
7. `docs/handoff/EVO_03_TO_05_GROUNDWORK_APPROVAL_PLAN.md`（停工核准計畫，未開始 Runtime）

未改：store、saveManager、schema、index.html、Pixi、assets、flags。`formalOffer` 尚未進入持久 schema。

> 歷史註記：上句是 EVO-02 停工當下的真相。EVO-03 之後 `formalOffer` 已進 schema 並可 critical-save。以 §0 與下列 §15～§18 為準。

---

## 15. EVO-03 實際改了哪些檔（已 commit `84e45b5`）

目標：邀請可存檔；accept 採 candidate-first。**不是換形。**

1. `src/state/companionStateSchema.js` — `formalOffer` 活過 `normalizeGrowth`
2. `src/ui/companionGrowthController.js` — `commitFormalEvolutionTransition`：clone → decide → `saveCandidateState` → 成功才 `publishState`。存檔失敗 `formal_evolution_save_failed`，subscribers 看不到新 stage。`rendererIntent` 保持 null。
3. `src/ui/pageRouter.js` — Growth UI 動態插入，**沒改** `index.html`
4. `docs/qa/evo-03-formal-evolution-runtime-cases.mjs` — 9/9
5. Growth Contract、ACCEPTANCE、Ledger、本檔

未改：Pixi loader、assets、flags、`pixiApp.js`。

---

## 16. EVO-04 實際改了哪些檔（已 commit `a7958b0`）

目標：11 隻 Stage 2／3 目錄對照。**live 動畫權威仍是 Stage 1。**

1. `src/engine/formalEvolutionCatalog.js`（新建）
   - 讀現有 `assets/characters/formal-evolution-index.json` 與 `formal-evolution-animation-r4.json`，**不改寫 assets**
   - `selectLiveAnimationAuthority` 即使 flags 被偽造 true，也一律 `stage1-illustrated-runtime`／`formalSheetsSelected: false`
   - `assetBelongsToCompanion` 拒絕灰影貓指向金羽小梟路徑
   - `COMPANION_ALLOWED_RIGS` 防止鳥型套四足
   - 缺圖／外來 sheet → `resolveSameCompanionFallback`
2. `docs/qa/evo-04-formal-evolution-catalog-cases.mjs` — 10/10

當時**沒有**把 catalog 接進 `animationProfile.js` live path（以免 Growth 引擎被 Pixi 拉進來）。EVO-05 後來經 canary plan 接到棲地 Pixi；不要再經 `animationProfile` 擴散。

---

## 17. EVO-05／05.5 實際改了哪些檔（**未提交**，疊在 `a7958b0`）

目標：灰影貓棲地試播。不是 EVO-06，不是 11 隻換形。

新建：

- `src/engine/formalEvolutionCanaryPlan.js`
  - 啟用 ID **只有** `greyshade-cat`
  - `planFormalEvolutionCanaryAttempt`、`prepareFormalEvolutionCanaryLoad({ fetchJson })`、`stampCanaryFallbackPresentation`
  - 外來 walk sheet 讓**整包** canary 失敗（05.5），避免身體混種
- `docs/qa/evo-05-formal-evolution-canary-cases.mjs` — 15/15
- `docs/qa/EVO_05_GREYSHADE_CANARY_MANUAL.md`

修改：

- `src/app.js` — 把 `formalStage` 投影進 `createCreatureNode`；聽 `FORMAL_EVOLUTION_PRESENTATION_REFRESH`；QA：`previewGreyshadeCanary`／`inspectGreyshadeCanary`
- `src/pixi/companionRenderer.js` — 試 canary，失敗同角色 Stage 1，並 stamp retryable
- `src/pixi/spriteSheetAnimationLoader.js` — 載 R4 idle 4 格；不可把 4×4 sheet 硬塞進 Stage 1 flat loader
- `src/ui/pageRouter.js` — 僅灰影貓 **published** accept 後 refresh
- `src/engine/formalEvolutionCatalog.js` — 註解：實際 canary 是灰影貓
- ACCEPTANCE SOV-08／09／11／12 標 partial、Growth Contract、手動清單、Ledger

沒動：`pixiApp.js`、`assets/**`、flags、`index.html`、save schema、`motionController.js`。

對峙仍 Stage 1。畫面 NOT VERIFIED。

---

## 18. Codex 用 Codebase MCP 接手（取代 §9 過期步驟）

`docs/` 在 moderate 索引時被排除。`search_code` 目前可能找不到未提交的 `formalEvolutionCanaryPlan.js`／甚至已 commit 的 `formalEvolutionCatalog.js`。**不要只靠圖譜當施工現況。**

必做：

1. 確認 worktree 就是這條路徑，不要索引平常 dirty checkout。
2. `manage_adr({ project: "C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink-grok-formal-evolution-runtime-r1", mode: "get" })`
3. 讀本檔 §0 與 Ledger Lane 1 最新 EVO-05.5。
4. 直接 Read 檔案：`src/engine/formalEvolutionCanaryPlan.js`、`src/engine/formalEvolutionCatalog.js`、`src/engine/companionFormalEvolutionTransitionEngine.js`。
5. 圖譜目前較穩的符號：`decideFormalEvolutionTransition`、`createFormalEvolutionOfferToken`（在 `companionFormalEvolutionTransitionEngine.js`）。
6. `ingest_traces` 已寫入 3 條敘事 trace，但伺服器回 `Runtime edge creation from traces not yet implemented`，**不會長出呼叫邊**。
7. 不要對 PNG 建呼叫圖。不要把 visual 寫成 PASS。

禁止：EVO-06、改 flags、commit／push（除非 Terence 明文要求）、開金羽小梟／海馬 canary、把 #215 P1 塞進進化包。
