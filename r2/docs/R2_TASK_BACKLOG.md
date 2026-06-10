# R2_TASK_BACKLOG.md — Nexus Link R2 Prototype 任務 backlog（P1 Blueprint 轉譯版）

> 本 backlog 將 P1 Master Architecture Blueprint 中的任務形式與核心（Soul Talk v2、Action Sheet v2、Habitat Trace v2、Companion Boundary Feedback、Manual QA/Screenshot、架構解耦原則等）轉譯為 R2 專用版本。
> 所有任務**嚴格限定在 r2/** 內**，R1 根目錄檔案全部列入 Forbidden。
> 任務格式完全遵循 `docs/agent/TASK_TEMPLATE.md`（已轉譯路徑）。
> 優先順序受 R2_FIRST_5_TASKS.md 與 R2_BLUEPRINT_ADAPTATION.md 約束（第一輪特別強調 ≤3 runtime files、不碰 app.js、不碰 Pixi renderer、不改 state schema、不新增 dependency）。

---

## R2-T01 — R2 Asset Truth Sync（資產真相同步，r2/docs only）

**Task name:**
  R2-T01 — R2 Asset Truth Sync（資產真相同步，r2/docs only）

**Goal:**
  消除 R2 內的資產真相分裂（類比 P1-T01）：
  1. 在 r2/docs/ 建立對應的 asset pipeline 文件，宣告 r2/assets/characters/greyshade-cat/metadata/animations.json 為 R2 machine truth。
  2. 補充 R2 專屬的「真相優先序」與 Tier 邊界宣告（greyshade-cat 為 R2 Active Runtime；flametail-fox 為 Legacy；其他為 Roadmap Candidate）。
  3. 新增 r2/docs/assets/R2_VALIDATOR_FIX_PROPOSAL.md，記錄 R2 環境下 validator 與 128 grid 的潛在矛盾，提供精確修正提案（僅提案，不修改任何 r2/tools/ 或 r2/src/ 程式碼）。
  本任務「不」修改任何 runtime code 或資產二進位檔。

----------------------------------------------------
**Allowed files (ONLY these may be modified):**
  - r2/docs/asset-pipeline.md [NEW]
  - r2/docs/assets/CHARACTER_ASSET_PIPELINE.md [NEW]
  - r2/docs/assets/R2_VALIDATOR_FIX_PROPOSAL.md [NEW]

**Forbidden files (must NOT be touched):**
  - index.html
  - styles.css
  - src/**
  - assets/**
  - data/**
  - docs/**
  - tools/**
  - scripts/**
  - package.json
  - .git/**
  - r2/index.html
  - r2/styles.css
  - r2/src/**
  - r2/assets/**
  - r2/data/**
  - r2/tools/**
  - r2/scripts/**

**Non-goals (do NOT do these):**
  - 不修改 r2/tools/validateGreyshadeAssets.mjs 或任何 validator 程式碼（僅輸出提案）
  - 不修改 r2/assets/ 內任何 animations.json、spritesheet、PNG
  - 不重命名任何檔案
  - 不修改任何 runtime code（r2/src/**）
  - 不執行 git commit / git push
  - 不影響 R1 任何檔案

----------------------------------------------------
**Required pre-read files (read before editing):**
  - CLAUDE.md
  - AGENTS.md
  - r2/docs/R2_BLUEPRINT_ADAPTATION.md（本 backlog 所屬）
  - docs/agent/AI_WORKFLOW.md
  - docs/agent/TASK_TEMPLATE.md
  - assets/characters/greyshade-cat/metadata/animations.json（只讀，用於比對 29 動畫清單）
  - docs/asset-pipeline.md
  - docs/assets/CHARACTER_ASSET_PIPELINE.md
  - r2/docs/R2_FIRST_5_TASKS.md

----------------------------------------------------
**Test commands (no npm, no build step):**
  python -m http.server 5173
  # 開啟 http://localhost:5173/r2/
  # 手動驗證：
  # - r2/docs/ 下的新文件存在且內容正確
  # - 無任何 R1 檔案被改動（git status --short 只顯示 r2/docs/ 新檔）
  node -e "
    const m = require('./assets/characters/greyshade-cat/metadata/animations.json');
    console.log('P1 animations count:', Object.keys(m).length);
    console.log(Object.keys(m).join(','));
  "
  # 確認 r2/docs/ 內文件列出的 29 動畫清單與上述輸出相符
  git status --short
  # 確認只有 r2/docs/ 下的 3 個新檔案

----------------------------------------------------
**Required final output:**
  1. Changed files 清單（僅 r2/docs/ 內）
  2. 每個新增文件的說明（為什麼建立、與 P1-T01 的對應關係）
  3. animations.json keys 與 r2/docs/ 清單的比對結果
  4. R2_VALIDATOR_FIX_PROPOSAL.md 中提案 diff 的摘要
  5. 確認 R1 完全未被污染

----------------------------------------------------
**CRITICAL RULES:**
  - Do NOT commit without explicit human instruction
  - Do NOT push without explicit human instruction
  - Do NOT modify files outside Allowed files list
  - Do NOT introduce new dependencies
  - Follow docs/agent/AI_WORKFLOW.md Gate 0–6
  - 所有路徑必須使用 r2/ 前綴
  - 本任務為純 docs-only，屬 🟢 LOW 風險

====================================================

## R2-T02 — R2 HUD mood 詞彙補全（UI + Data，小修）

**Task name:**
  R2-T02 — R2 HUD mood 詞彙補全（UI + Data，小修）

**Goal:**
  補全 R2 HUD 顯示的 mood 詞彙與情緒標籤，使其與 r2/src/data/emotionDictionary.js 及 emotionalSedimentationEngine 產出的 lastEmotionTag 更一致，並在 r2/src/ui/hudController.js 中渲染更精準的中文 mood 描述。僅限 2 個 runtime files，絕不碰 state schema、Pixi renderer、app.js。

----------------------------------------------------
**Allowed files (ONLY these may be modified):**
  - r2/src/data/emotionDictionary.js
  - r2/src/ui/hudController.js

**Forbidden files (must NOT be touched):**
  - index.html
  - styles.css
  - src/**
  - assets/**
  - data/**
  - docs/**
  - tools/**
  - scripts/**
  - package.json
  - .git/**
  - r2/index.html
  - r2/styles.css
  - r2/src/app.js
  - r2/src/pixi/**
  - r2/src/state/defaultState.js
  - r2/src/state/store.js
  - r2/src/state/saveManager.js
  - r2/assets/**
  - r2/data/creatures.json
  - r2/src/engine/** （除非後續任務明確需要，本任務避免）

**Non-goals (do NOT do these):**
  - 不改 state schema 或新增 state 欄位
  - 不碰任何 Pixi 相關檔案
  - 不碰 r2/src/app.js
  - 不改動 UI 樣式（僅文案/資料補全）
  - 不影響 R1 任何檔案
  - 不執行 commit / push

----------------------------------------------------
**Required pre-read files (read before editing):**
  - CLAUDE.md
  - AGENTS.md
  - r2/docs/R2_BLUEPRINT_ADAPTATION.md
  - docs/agent/AI_WORKFLOW.md
  - docs/agent/TASK_TEMPLATE.md
  - r2/src/data/emotionDictionary.js
  - r2/src/ui/hudController.js
  - r2/src/engine/emotionalSedimentationEngine.js （只讀）
  - r2/src/state/store.js （只讀，確認 mood 欄位使用方式）

----------------------------------------------------
**Test commands (no npm, no build step):**
  python -m http.server 5173
  # 開啟 http://localhost:5173/r2/
  # 手動驗證：
  # - 開啟 Soul Talk 輸入帶情緒的訊息
  # - 確認 HUD 上的 mood 顯示與輸入情緒一致且詞彙完整
  # - 控制台無錯誤
  # - R1（http://localhost:5173/）HUD 顯示不受影響
  git status --short
  # 確認只有 2 個 r2/src/ 檔案變更，且無 R1 檔案

----------------------------------------------------
**Required final output:**
  1. Changed files 清單（僅 2 個 r2/ 檔案）
  2. 每個修改的說明
  3. 手動測試步驟與 R1/R2 隔離確認
  4. 確認未改 state schema、未碰 Pixi、未碰 app.js

----------------------------------------------------
**CRITICAL RULES:**
  - 僅 2 個 runtime files（符合第一輪 ≤3 規則）
  - 不碰 r2/src/app.js、不碰 Pixi renderer、不改 state schema
  - 所有修改前必須輸出 Gate 1 Patch Plan 並等待 human 確認
  - 禁止任何 R1 污染

====================================================

## R2-T03 — R2 Companion Boundary 文案升級（Engine + UI，小修）

**Task name:**
  R2-T03 — R2 Companion Boundary 文案升級（Engine + UI，小修）

**Goal:**
  升級 R2 的 Companion Boundary Feedback 文案（safe harbor / reject / guarded 回應），讓其更符合 Cyber-Taoism 美學與「讓夥伴更真實」原則。修改點限於 r2/src/engine/safeHarborMode.js 與 r2/src/ui/soulTalkController.js（或相關 boundary 顯示處），最多 3 個檔案。保留原有邏輯，只升級文案與提示詞。

----------------------------------------------------
**Allowed files (ONLY these may be modified):**
  - r2/src/engine/safeHarborMode.js
  - r2/src/ui/soulTalkController.js
  - r2/src/data/safetyShieldDictionary.js   （若需補充 boundary 關鍵字）

**Forbidden files (must NOT be touched):**
  - index.html
  - styles.css
  - src/**
  - assets/**
  - data/**
  - docs/**
  - tools/**
  - scripts/**
  - package.json
  - .git/**
  - r2/index.html
  - r2/styles.css
  - r2/src/app.js
  - r2/src/pixi/**
  - r2/src/state/defaultState.js
  - r2/src/state/store.js
  - r2/src/state/saveManager.js
  - r2/assets/**
  - r2/src/engine/habitatTraceEngine.js （本任務避免）

**Non-goals (do NOT do these):**
  - 不改 state schema 或任何持久化欄位
  - 不碰 Pixi renderer 或 app.js
  - 不新增 boundary 邏輯（僅文案升級）
  - 不醫療宣稱（文案必須維持「遊戲虛構情緒機制」語氣）
  - 不影響 R1

----------------------------------------------------
**Required pre-read files (read before editing):**
  - CLAUDE.md
  - AGENTS.md
  - r2/docs/R2_BLUEPRINT_ADAPTATION.md
  - docs/agent/AI_WORKFLOW.md
  - r2/src/engine/safeHarborMode.js
  - r2/src/ui/soulTalkController.js
  - r2/src/engine/companionPersonality.js （只讀）
  - r2/src/data/safetyShieldDictionary.js （只讀）

----------------------------------------------------
**Test commands (no npm, no build step):**
  python -m http.server 5173
  # 開啟 http://localhost:5173/r2/
  # 輸入高風險或 boundary 觸發訊息
  # 確認回應文案已升級且風格一致
  # 確認 R1 版本文案不受影響
  git status --short

----------------------------------------------------
**Required final output:**
  1. Changed files（≤3 個 r2/ 檔案）
  2. 文案修改前後對比
  3. 測試步驟（含 boundary 觸發案例）
  4. 確認未違反任何第一輪排序原則

----------------------------------------------------
**CRITICAL RULES:**
  - 最多 3 個 runtime files
  - 嚴禁醫療/治療宣稱
  - 必須先 Patch Plan + human 確認

====================================================

## R2-T04 — R2 Soul Talk 回應池擴充 + Memory Echo（UI + Engine）

**Task name:**
  R2-T04 — R2 Soul Talk 回應池擴充 + Memory Echo（UI + Engine）

**Goal:**
  為 R2 Soul Talk 擴充回應池（特別是 Memory Echo 機制），讓夥伴能引用先前 emotionalMemories / habitatTraces 產生更有「痕跡感」的回應。修改限於 soulTalkController 與 memoryLifecycleEngine 小範圍調整（≤3 檔案），不碰 state schema、不碰 Pixi、不碰 app.js。強化「記憶痕跡」與「讓夥伴更真實」的核心體驗。

----------------------------------------------------
**Allowed files (ONLY these may be modified):**
  - r2/src/ui/soulTalkController.js
  - r2/src/engine/memoryLifecycleEngine.js
  - r2/src/engine/emotionalSedimentationEngine.js   （若需輕量 hook）

**Forbidden files (must NOT be touched):**
  - ...（同上，明確包含 r2/src/app.js、所有 r2/src/pixi/*、r2/src/state/*schema*、R1 根目錄所有檔案、r2/assets/**）

**Non-goals (do NOT do these):**
  - 不改 state schema（memories / emotionalMemories 結構不動）
  - 不碰任何 Pixi 檔案
  - 不碰 r2/src/app.js
  - 不新增 LLM 呼叫
  - 僅擴充「回應池」與 echo 邏輯，不做完整新 feature

----------------------------------------------------
**Required pre-read files:**
  - CLAUDE.md、AGENTS.md、r2/docs/R2_BLUEPRINT_ADAPTATION.md
  - r2/src/ui/soulTalkController.js
  - r2/src/engine/memoryLifecycleEngine.js
  - r2/src/engine/habitatTraceEngine.js （只讀，理解 trace 與 memory 關係）
  - r2/src/state/store.js （只讀）

----------------------------------------------------
**Test commands:**
  python -m http.server 5173
  # http://localhost:5173/r2/
  # 連續輸入多條訊息，觸發 memory 與 trace
  # 確認後續 Soul Talk 回應出現 Memory Echo 引用
  # R1 版本不受影響

----------------------------------------------------
**Required final output:**
  1. Changed files 清單（≤3）
  2. Echo 機制修改說明
  3. 測試案例與 R1/R2 隔離證明

----------------------------------------------------
**CRITICAL RULES:**
  - 符合第一輪所有排序原則
  - 保留 Habitat Trace v2 / MemoryLifecycle 既有職責
  - Gate 流程必守

====================================================

## R2-T05 — R2 Action Sheet 情境化（UI + Engine）

**Task name:**
  R2-T05 — R2 Action Sheet 情境化（UI + Engine）

**Goal:**
  讓底部 Action Sheet（探索/照顧/成長/記憶）回應更情境化，依據當前 mood、bond、habitatTraces 狀態給予不同文案與小效果提示。修改限於 actionSheetController + actionEffectEngine（最多 3 檔案）。不碰 state schema、不碰 Pixi renderer、不碰 app.js。

----------------------------------------------------
**Allowed files (ONLY these may be modified):**
  - r2/src/ui/actionSheetController.js
  - r2/src/engine/actionEffectEngine.js
  - r2/src/ui/panelManager.js   （若僅需小量文案 hook）

**Forbidden files (must NOT be touched):**
  - r2/src/app.js
  - r2/src/pixi/**
  - r2/src/state/* （schema 相關）
  - R1 根目錄全部
  - r2/assets/**

**Non-goals:**
  - 不新增新 action
  - 不改 state schema
  - 僅情境化文案與小提示，不做大重構

----------------------------------------------------
**Required pre-read files:**
  - CLAUDE.md、r2/docs/R2_BLUEPRINT_ADAPTATION.md
  - r2/src/ui/actionSheetController.js
  - r2/src/engine/actionEffectEngine.js
  - r2/src/ui/panelManager.js

----------------------------------------------------
**Test commands:**
  python -m http.server 5173
  # r2/ 環境下切換不同 mood / bond 狀態
  # 開啟 Action Sheet 確認文案隨狀態變化
  # R1 不受影響

----------------------------------------------------
**CRITICAL RULES:**
  - ≤3 runtime files
  - 先 UI/Engine 小修原則

====================================================

## R2-T06 — R2 QA / Screenshot + Manual Test Checklist（純 docs）

**Task name:**
  R2-T06 — R2 QA / Screenshot + Manual Test Checklist（純 docs）

**Goal:**
  建立 R2 專用的 Manual QA / Screenshot Review Checklist（參考 docs/testing/MANUAL_TEST_CHECKLIST.md），並提供 Fable 5 專用的 R2 測試指令與 Gemini 截圖審查流程。純 docs 任務，0 個 runtime files。

----------------------------------------------------
**Allowed files (ONLY these may be modified):**
  - r2/docs/testing/R2_MANUAL_TEST_CHECKLIST.md [NEW]
  - r2/docs/R2_QA_GUIDE.md [NEW]

**Forbidden files (must NOT be touched):**
  - 所有 r2/src/**、r2/assets/**、R1 根目錄全部、tools/** 等

**Non-goals:**
  - 不執行任何 runtime 修改
  - 不拍攝實際截圖（僅提供 checklist 模板）

----------------------------------------------------
**Required pre-read files:**
  - docs/testing/MANUAL_TEST_CHECKLIST.md
  - docs/agent/REVIEW_CHECKLIST.md
  - r2/docs/R2_BLUEPRINT_ADAPTATION.md
  - docs/agent/AI_WORKFLOW.md

----------------------------------------------------
**Test commands:**
  git status --short
  # 確認只有 r2/docs/testing/ 與 r2/docs/ 新檔
  # 閱讀 checklist 並手動走過 http://localhost:5173/r2/ 的基本流程

----------------------------------------------------
**Required final output:**
  1. 新增文件清單
  2. Checklist 涵蓋項目（含 R1/R2 隔離驗證、localStorage key 確認、boundary 文案等）
  3. Gemini 截圖審查建議流程

----------------------------------------------------
**CRITICAL RULES:**
  - 0 runtime files，完美符合第一輪排序原則
  - 為後續所有 R2 任務提供標準 QA 基線

====================================================

（後續 backlog 可繼續擴充 Habitat Trace v2 小修、Memory Echo 深化、R2 專屬 docs 同步等，均需遵守相同路徑轉譯與隔離規則。）

---
*所有 R2 任務必須引用 r2/docs/R2_BLUEPRINT_ADAPTATION.md 作為路徑與限制來源。*
