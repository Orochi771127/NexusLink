# R2_FIRST_5_TASKS.md — R2 Prototype 第一輪施工建議任務（排序後）

> **排序原則（嚴格遵守，來自本次 query 與 R2_BLUEPRINT_ADAPTATION.md）**：
> 1. 不碰 `r2/src/app.js`
> 2. 不碰 Pixi renderer（r2/src/pixi/*Renderer*.js、r2/src/pixi/pixiApp.js、r2/src/pixi/motionController.js 等）
> 3. 不改 state schema（r2/src/state/defaultState.js、store.js、saveManager.js 除非任務本身是 storage 隔離）
> 4. 不新增 dependency（無 npm、無新 import 外部）
> 5. 每個任務最多改 3 個 runtime files
> 6. 優先順序：UI / 文案 / Engine 小修 → 再考慮 Pixi → 最後才 app.js
>
> 此外，第一輪強烈建議以「準備工作 + 小修 + docs」為主，讓 R2 快速建立可驗證的基礎，而不冒高風險。

所有任務完整定義見 `r2/docs/R2_TASK_BACKLOG.md`。

---

## 第一輪推薦順序（已按原則排序）

### 1. R2-T06 — R2 QA / Screenshot + Manual Test Checklist（純 docs，0 runtime files）
**為什麼排第一**：
- 完全符合所有 6 條原則（0 個 runtime files）。
- 為後續所有 R2 任務（包含 Fable 5 施工）提供標準測試基線與 Gemini 截圖審查流程。
- 純 docs（🟢 LOW），風險最低，可立即建立。
- 包含 R1/R2 隔離驗證、localStorage key 確認、boundary 文案測試等 R2 專屬項目。
- 產出 `r2/docs/testing/R2_MANUAL_TEST_CHECKLIST.md` 與 `r2/docs/R2_QA_GUIDE.md`。

**預計影響**：僅 r2/docs/**（2 個新檔）
**需要角色**：Fable 5（主要）、Claude Code（可協助）、ChatGPT/Codex 審查（建議）、Gemini 截圖審查（流程定義）
**是否需要 image generation**：否

**執行提示**：先讀 R2_BLUEPRINT_ADAPTATION.md + 原始 docs/testing/MANUAL_TEST_CHECKLIST.md + AI_WORKFLOW.md，輸出 Patch Plan 後等待確認。

---

### 2. R2-T02 — R2 HUD mood 詞彙補全（UI + Data，2 runtime files）
**為什麼排第二**：
- 僅 2 個 runtime files（r2/src/data/emotionDictionary.js + r2/src/ui/hudController.js）。
- 不碰 app.js、不碰任何 Pixi renderer、不改 state schema。
- 屬「UI / 文案 / Engine 小修」類別，立即可見效果（HUD 顯示更精準的情緒詞彙）。
- 對 R2 玩家體驗有直接正面影響，且容易在 http://localhost:5173/r2/ 手動驗證。
- 風險低（資料補充 + 渲染顯示）。

**預計影響**：2 個 r2/src/ 檔案
**需要角色**：Fable 5（主要執行）、Claude Code（可 parallel 小 patch）、ChatGPT/Codex 審查（建議對 emotion 一致性）
**是否需要 image generation**：否
**Gemini 截圖審查**：建議（HUD 視覺確認）

**執行提示**：嚴格限制只改這兩個檔案。Patch Plan 必須明確說明「未動 state schema」與「R1 HUD 完全不受影響」。

---

### 3. R2-T03 — R2 Companion Boundary 文案升級（Engine + UI，≤3 runtime files）
**為什麼排第三**：
- 符合 ≤3 檔案上限。
- 專注「文案升級」而非邏輯重構，屬小修類別。
- 強化 Companion Boundary Feedback（P1 保留核心原則之一）。
- 不碰 app.js、Pixi renderer、state schema。
- 文案必須維持「遊戲虛構情緒機制」語氣，嚴禁醫療宣稱（已在 R2_BLUEPRINT_ADAPTATION.md 強調）。

**預計影響**：2~3 個 r2/src/ 檔案（safeHarborMode.js + soulTalkController.js + 可選 safetyShieldDictionary.js）
**需要角色**：Fable 5、ChatGPT/Codex 審查（文案風格）、Gemini（若有視覺回饋）
**是否需要 image generation**：否

**執行提示**：Gate 1 Patch Plan 必須附上「修改前後文案對比」與「如何避免醫療宣稱」的說明。

---

### 4. R2-T04 — R2 Soul Talk 回應池擴充 + Memory Echo（UI + Engine，≤3 runtime files）
**為什麼排第四**：
- 直接對應 P1 保留核心「Soul Talk v2」與「Memory Echo / Habitat Trace 痕跡感」。
- 僅限 soulTalkController + memoryLifecycleEngine（+ 可選 emotionalSedimentationEngine），嚴守 ≤3 檔案。
- 不動 state schema（只擴充回應池與 echo 引用邏輯）。
- 不碰 Pixi、不碰 app.js。
- 能讓 R2 快速展現「夥伴有記憶痕跡」的差異化體驗。

**預計影響**：2~3 個 r2/src/ 檔案
**需要角色**：Fable 5（核心）、Claude Code（可協助 engine 小修）、ChatGPT/Codex 審查（對話自然度）、Gemini 截圖審查（強烈建議）
**是否需要 image generation**：否（後續若要做視覺 echo 可另開任務）

**執行提示**：Patch Plan 必須證明「未改 emotionalMemories / habitatTraces 結構」。

---

### 5. R2-T05 — R2 Action Sheet 情境化（UI + Engine，≤3 runtime files）
**為什麼排第五**：
- 對應 P1 核心「Soul Interaction / Action Sheet v2」。
- 僅 actionSheetController + actionEffectEngine（+ 可選 panelManager），符合 ≤3。
- 依 mood / bond / traces 讓 action 回應更情境化，屬「Engine 小修 + UI 文案」類別。
- 不碰 app.js、不碰 Pixi renderer、不改 state schema。
- 完成後 R2 的「探索/照顧/成長/記憶」會明顯更有生命力。

**預計影響**：2~3 個 r2/src/ 檔案
**需要角色**：Fable 5、ChatGPT/Codex（行動效果一致性審查）
**Gemini 截圖審查**：建議（Action Sheet 視覺 + 文字）

**執行提示**：Patch Plan 需列出「情境化判斷依據」（哪些 state 欄位，只讀不寫）。

---

## 執行順序建議與 Gate 提醒

1. **R2-T06（QA Checklist）** → 建立測試基線。
2. **R2-T02（HUD mood）** → 快速可見小勝。
3. **R2-T03（Boundary 文案）** → 強化核心原則。
4. **R2-T04（Soul Talk + Memory Echo）** → 展現 R2 差異化記憶痕跡。
5. **R2-T05（Action Sheet 情境化）** → 完成第一輪互動閉環。

**每次執行前必須**：
- 讀取 `r2/docs/R2_BLUEPRINT_ADAPTATION.md` + 對應任務的 pre-read files。
- 輸出 Gate 0 Read-only Scan 摘要。
- 輸出 Gate 1 Patch Plan（明確 ≤3 檔案清單 + Non-goals + R1 隔離宣告）。
- **等待 human 明確確認** 才進入 Gate 3 Edit。
- 結束時提供完整的 Changed files、測試步驟（含 http://localhost:5173/r2/ 與 R1 對照）、git status --short。

**嚴禁事項（重複強調）**：
- 任何時候都不可碰 r2/src/app.js（第一輪）。
- 任何時候都不可碰 r2/src/pixi/ 下的 renderer 類檔案（第一輪）。
- 任何時候都不可改動 state schema 相關檔案。
- 任何時候都不可修改 R1 根目錄任何檔案。
- 除非 human 明確指示，否則 **不 commit、不 push**。

---

**下一輪（本輪完成後）** 可考慮：
- 更深入的 Habitat Trace v2 小修（若符合 ≤3 且不碰 renderer）。
- R2 專屬 docs 同步（延續 R2-T01）。
- 準備少量 Pixi 小修任務（但仍需避開 app.js 與高風險 renderer 核心）。

本文件與 R2_TASK_BACKLOG.md、R2_BLUEPRINT_ADAPTATION.md 共同構成 R2 第一輪的完整施工地圖。

---
*建立於 R2 隔離環境，僅供 Fable 5 / Claude Code 參考。*
