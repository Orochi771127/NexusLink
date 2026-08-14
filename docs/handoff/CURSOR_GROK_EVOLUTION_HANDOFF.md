# CURSOR_GROK_EVOLUTION_HANDOFF.md

> **這是操作交接文件，不是 Master Canon，也不是產品憲法。**
>
> 權威順序仍是：Master Canon → `AGENTS.md`／`CLAUDE.md` → Growth Contract → `ACCEPTANCE.md` → Ledger → 本檔。
> 若本檔與上位文件衝突，以上位文件為準，並追加 Ledger `CORRECTION`／`SUPERSEDED`，不得默默改 Canon。
>
> 最後更新：2026-08-15（EVO-02 純進化 transition engine 已本地完成；停在 EVO-03 Groundwork 核准前）

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

GO 判定：資料完整時可寫合法 reflection evidence；舊資料 fail closed；Stage 3 用 fixture 證明。
不得宣稱：live Soul Talk 記憶跨存檔後仍可被 Reflection 使用。那需要改 `storageGuard.js`／可能的 schema，且與 PR #215 重疊，必須另開 Groundwork。

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
- **G3.2 Reflection writer（有限）**：production fail-closed writer 已接線；合法 in-session sealed source 可寫 `reflection` evidence。live persist owner 尚未完成。
- **EVO-02 純 G4 狀態機**：`src/engine/companionFormalEvolutionTransitionEngine.js` 可產出獨立 candidate（offer／rewrite／defer／accept）。不存檔、不發布、無 renderer。

### 尚未完成（不得寫成已完成）

- **live Reflection persist owner**：`storageGuard` 仍剝掉 memory／trace 的 `companionId` 與 sealed safety provenance。現有存檔路徑 fail closed。
- **第三階段不對峙路徑的完整可玩 live persist**：fixture 已證明 Care＋Exploration＋Reflection＋Chapter 可達 Stage 3 readiness；live 記憶目前無法安全跨存檔保留 owner。
- **Growth G4 Runtime**：offer／accept 尚未接 UI、critical-save、store 發布或 renderer。`formalOffer` 尚未進入 schema；normalize 會剝掉 token。
- **save／store／registry／Pixi／renderer 接線**：未做。Stage 1 illustrated runtime 仍是 live fallback。
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
| Reflection owner | `src/engine/reflectionGrowthOwner.js` | `createOwnedSafeReflectionSource`／`createReflectionGrowthWriteInput` | production writer 已接線；live persist owner 未完成 |
| Formal evolution transition | `src/engine/companionFormalEvolutionTransitionEngine.js` | `decideFormalEvolutionTransition` | 純函式；回傳 candidate；不存檔 |
| Reflection production writer | `src/ui/companionGrowthController.js` | `writeReflectionPracticeIntoDraft` | 不寫 relationship／reward／玩家原文；不開始 offer |
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

## 8. PR #215／#216 潛在影響（本次重新驗證仍為未合併）

查詢時間：2026-08-14 EVO-00 開工前 `gh pr view`。

| PR | 狀態 | 為何重要 |
|---|---|---|
| [#215](https://github.com/Orochi771127/NexusLink/pull/215) `feat/raphael-continuity-and-boundary` | **OPEN**，head `7bb29136c448181ca252ec179860da114c60503a` | 會改 `defaultState.js`、`store.js`、記憶、能量、邊界。直接影響未來 EVO-01／EVO-03 |
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
5. **停住 EVO-03**。EVO-01 全過後可進 EVO-02 純邏輯。沒有新的 Groundwork 核准就不要開 EVO-03。

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
