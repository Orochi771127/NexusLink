# R2_BLUEPRINT_ADAPTATION.md — Nexus Link P1 Master Architecture Blueprint 轉為 R2 Prototype 專用規格

> **目的**：將原本針對 R1 主線設計的 P1 Blueprint（包含 NexusLink_Full_Game_Architecture_v1.md、RUNTIME_MAP.md、FILE_OWNERSHIP.md、AI_WORKFLOW.md、TASK_TEMPLATE.md、CLAUDE.md、AGENTS.md 以及各 production-backlog / sprint 文件的核心原則）轉譯為 **R2 Prototype 專用版本**。
> R2 已由 R1 完整複製到 `r2/**`，後續所有 Fable 5 / Claude Code 開發必須**僅限在 r2/** 內**進行，絕不污染 R1 根目錄或任何 R1 檔案。
> 本文件為「轉譯規格」，本身為 docs-only，不涉及任何 runtime 修改。

---

## 1. 可直接沿用到 R2 的模組（Path 已轉譯為 r2/**）

以下 P1 核心原則與架構**直接適用**，只需將所有路徑前綴替換為 `r2/` 即可：

### 架構分層與解耦原則（來自 RUNTIME_MAP.md + CLAUDE.md）
- **DOM UI Layer**（r2/styles.css + r2/src/ui/*）與 **Pixi Canvas Layer**（r2/src/pixi/*）**嚴格分離**。
  - Pixi 禁止直接操作 DOM（`document.querySelector`）。
  - UI 禁止直接操作 Pixi Container。
  - 唯一合法跨層通道：`EventBus`（r2/src/utils/eventBus.js）或 `store.subscribe` / `setState`。
- State / Engine / UI / Pixi Renderer 四層分離（r2/src/state/、r2/src/engine/、r2/src/ui/、r2/src/pixi/）。
- EventBus 單向通知（Pixi → UI）。
- State 變更統一走 `r2/src/state/store.js` 的 `setState` / `updateState` / `replaceState` + `normalizeState`。
- **localStorage 唯一寫入點**：`r2/src/state/saveManager.js`（**必須使用 `STORAGE_KEY = "nexusLinkR2State:v1"`**，詳見下方）。

### 效能與渲染規範（來自 CLAUDE.md + RUNTIME_MAP）
- **Ticker**：不可在 ticker 內執行昂貴操作（DOM 查詢、大量 JSON parse、fetch）。
- **Texture**：必須透過 `PIXI.Assets.load()` 快取，禁止重複載入。
- **像素角色**：`texture.source.scaleMode = 'nearest'`，禁止 linear 插值。
- **角色座標**：必須 `Math.round()` integer snap，禁止浮點導致模糊。
- **Pixi draw calls 控制**：物件重用（object reuse / sync model），**不在 ticker 裡每幀 new Graphics**。
- Pixel-perfect nearest-neighbor + integer coordinate snap 為鐵律。

### 角色狀態三層分類（來自 RUNTIME_MAP + AGENTS.md + CLAUDE.md）
- **Tier 1 — Active Runtime Companion**：`greyshade-cat`（目前唯一完整 spritesheet + animations.json 的 runtime 主夥伴）。
- **Tier 2 — Registered Legacy / Fallback**：`flametail-fox`（僅靜態圖，**不可升級**）。
- **Tier 3 — Roadmap Candidate**：`thunder-pup`、`star-energy-boarlet`（**不可加入 runtime**、不可進 `data/creatures.json`、不可啟動多角色隊伍）。
- P1/R2 主線優先：第一棲地 + 灰影貓。**不可擴張成多角色系統**。

### 其他可直接沿用
- Soul Talk v2、Soul Interaction / Action Sheet v2、Habitat Trace v2、Companion Boundary Feedback 的**設計意圖與職責分離**。
- Manual QA / Screenshot Review 流程（Gate 4 + Gemini 視覺審查）。
- Docs 為 🟢 LOW 風險（可自由新增/修改，不影響 runtime）。
- AI 協作流程（AI_WORKFLOW.md Gate 0–6）、TASK_TEMPLATE.md 格式、REVIEW_CHECKLIST.md。
- **禁止事項**（CLAUDE.md / AGENTS.md）：React/Vue/Svelte/TypeScript/Tailwind、npm 套件（除非 human 明確要求）、LLM API、build step、資料庫、後端。

---

## 2. 必須調整的模組 / 規則（R2 專屬強化）

### 路徑轉譯規則（鐵律）
| 原 P1 (R1)       | R2 對應                  | 備註 |
|------------------|--------------------------|------|
| src/**           | r2/src/**                | 所有 runtime JS |
| assets/**        | r2/assets/**             | 二進位資源（本任務不碰） |
| data/**          | r2/data/**               | creatures.json 等 |
| docs/**          | r2/docs/**               | 本任務唯一允許新增/修改區 |
| index.html       | r2/index.html            | 僅供 http://.../r2/ 載入 |
| styles.css       | r2/styles.css            | 僅供 r2/index.html 引用 |
| tools/**         | （禁止）                 | R2 內不可使用 R1 tools |
| scripts/**       | （禁止）                 | 同上 |

**所有任務的 Allowed files 必須明確列出完整 r2/ 路徑**，禁止使用萬用字元 `r2/src/**`。

### localStorage 隔離（最高優先）
- **R2 必須使用**：`nexusLinkR2State:v1`（已在 `r2/src/state/saveManager.js` 設定為 `STORAGE_KEY`）。
- LEGACY keys 可保留用於讀取相容，但**寫入永遠只用 R2 key**。
- **R1 localStorage 絕對不可被污染**：任何任務的 Forbidden files 必須明確包含根目錄的 `src/state/saveManager.js` 與 `index.html` 等。
- 測試時必須分別用 `http://localhost:5173/`（R1）和 `http://localhost:5173/r2/`（R2）驗證隔離。

### R2 施工總原則（Gate 流程強化）
1. **只允許修改 r2/****（本任務已建立 r2/docs/** 作為起點）。
2. **禁止修改 R1 任何檔案**（根目錄 index.html、styles.css、src/**、assets/**、data/**、docs/**、tools/**、scripts/**、package.json 等全部列入 Forbidden）。
3. **每次任務最多改 3 個 runtime files**（第一輪特別嚴格）。
4. **排序優先**：
   - 不碰 `r2/src/app.js`
   - 不碰 Pixi renderer（r2/src/pixi/*Renderer*.js、r2/src/pixi/pixiApp.js）
   - 不改 state schema（r2/src/state/defaultState.js、store.js、saveManager.js 除非任務明確為 storage 隔離）
   - 不新增 dependency / 不 npm / 不 build step
   - 先 UI / 文案 / Engine 小修 → 再 Pixi → 最後才 app.js
5. **Gate 流程必守**（AI_WORKFLOW.md）：
   - Gate 0: Read-only Scan（讀所有 pre-read files）
   - Gate 1: 輸出 Patch Plan（明確列出要改的檔案、內容、為什麼 + Non-goals）
   - Gate 2: **等待 human 明確確認** 才進 Gate 3 Edit
   - Gate 4: Local Verification（用 `python -m http.server 5173` + 手動測 `http://localhost:5173/r2/`）
   - Gate 5: Diff Review（對照 REVIEW_CHECKLIST）
   - Gate 6: human 批准才可 commit/push（**本任務及後續除非 human 明確指示，否則絕不 commit / push**）
6. **保留所有 P1 核心原則**（用 r2/ 路徑實踐）。
7. **R2 專屬硬限制**（來自本次 query + 歷史隔離需求）：
   - 不可接 LLM API（OpenAI/Anthropic/Gemini 等）。
   - 不可做戰鬥、背包、大地圖、多角色隊伍系統。
   - 不可做心理治療或醫療宣稱（情緒沉積、記憶痕跡、棲地狀態均為**遊戲虛構機制**，目的是「讓夥伴更真實」，不是 therapy）。
   - 不可污染 R1（即使是「順便」也禁止）。
   - 不可重構非必要範圍（每次最小必要）。

### P1-T01（Asset Truth Sync）轉譯範例
原 P1-T01 為「docs only」任務（更新 docs/asset-pipeline.md 與 CHARACTER_ASSET_PIPELINE.md 對齊 animations.json，新增 VALIDATOR_FIX_PROPOSAL.md 但**不改** validator 程式碼）。

**R2 轉譯版本原則**：
- 路徑全部變成 r2/docs/...
- Allowed files 限定在 r2/docs/**（即使未來要提議 r2/docs/assets/ 下的文件，也只在本 docs 區作業）。
- 強調「R2 資產 pipeline 與 R1 完全隔離，r2/assets/ 為獨立複製副本」。
- 保留「machine truth = animations.json，文件僅為 pipeline 記錄」與 Tier 邊界宣告。
- Non-goals 明確寫「不修改 r2/tools/**、r2/src/**、r2/assets/** 本身」。

（完整 R2 版任務見 R2_TASK_BACKLOG.md 的 R2-T01）

---

## 3. 參考來源（Pre-read 建議）
- 原始 P1：`docs/NexusLink_Full_Game_Architecture_v1.md`、`docs/architecture/RUNTIME_MAP.md`、`docs/architecture/FILE_OWNERSHIP.md`、`docs/agent/*`、`CLAUDE.md`、`AGENTS.md`、`docs/asset-pipeline.md`、`docs/assets/CHARACTER_ASSET_PIPELINE.md`
- 提供的 P1-T01 範例（本次 query 內文）
- R2 當前實作：`r2/src/state/saveManager.js`（STORAGE_KEY）、`r2/index.html`（載入路徑）、`r2/src/app.js`（bootstrap）
- 測試環境：`python -m http.server 5173` + 分別驗證 `/` 與 `/r2/`

---

## 4. 後續維護
- 任何新的 R2 任務都必須引用本文件作為「Allowed / Forbidden / 路徑轉譯 / 硬限制」的來源。
- 本文件本身屬 docs（🟢 LOW），可持續更新以反映 R2 演進，但**不得**因此修改 runtime。

**R2 不是 R1 的 fork 實驗場，而是「完全隔離的平行宇宙」**。所有施工從 r2/docs/ 開始思考，再落地到 r2/src/ 最小必要 patch。

---
*本文件由 Grok 依 user 指示轉譯建立，僅供 Fable 5 / Claude Code 後續參考。*
