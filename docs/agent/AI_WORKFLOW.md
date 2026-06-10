# AI_WORKFLOW.md — Nexus Link AI 協作流程

> 所有 AI agent 執行任務時必須遵循以下 Gate 流程。  
> 任何 Gate 失敗均應停止並向 human 回報，不得自行跳過。

---

## Gate 流程概覽

```
Gate 0: Read-only Scan
  ↓
Gate 1: Patch Plan
  ↓
Gate 2: Allowed Files Confirmation
  ↓  ← human 確認
Gate 3: Edit
  ↓
Gate 4: Local Verification
  ↓
Gate 5: Diff Review
  ↓
Gate 6: Human Approval before Commit
```

---

## Gate 0 — Read-only Scan

**目的**：在修改任何檔案之前，先完整理解現狀。

**輸入**：任務描述 + allowed files 清單

**執行動作**：
- 讀取所有 `required pre-read files`（只讀，不修改）
- 掃描相關 `src/`、`assets/`、`data/` 路徑
- 確認現有檔案的最新狀態

**輸出**：
```
Gate 0 完成
- 已讀取：<列出讀取的檔案>
- 現狀摘要：<2-5 行重點>
- 發現問題：<如有>
```

**失敗條件**：讀取失敗、路徑不存在、檔案結構與預期不符  
**失敗處理**：停止，回報 human，等待指示

---

## Gate 1 — Patch Plan

**目的**：明確列出即將修改的內容，供 human 確認。

**輸入**：Gate 0 掃描結果

**執行動作**：
- 列出每個要修改的檔案
- 說明每個檔案要改什麼、為什麼
- 標明哪些是新增、哪些是修改、哪些是刪除
- 明確標示 non-goals（本次不做的事）

**輸出格式**：
```
Gate 1 Patch Plan
-----------------
修改檔案：
  - src/engine/habitatTraceEngine.js: 新增 pruneByTTL 函式
  - styles.css: 調整 .trace-node 透明度

不修改：
  - index.html
  - src/pixi/pixiApp.js
  - assets/**

Non-goals：
  - 不改 state schema
  - 不重構 saveManager
```

**失敗條件**：計畫涉及未授權檔案、引入新依賴  
**失敗處理**：縮小範圍後重新提交計畫

---

## Gate 2 — Allowed Files Confirmation

**目的**：human 明確確認 patch plan 後才繼續。

**輸入**：Gate 1 Patch Plan

**執行動作**：
- 將 Gate 1 輸出呈現給 human
- **等待 human 回覆確認**
- 若 human 要求修改計畫，回到 Gate 1

**輸出**：human 的確認訊息

**失敗條件**：human 未確認、human 拒絕、human 要求修改  
**失敗處理**：回到 Gate 1 或停止任務

> **禁止跳過此 Gate 直接執行修改。**

---

## Gate 3 — Edit

**目的**：依照 Gate 2 確認的計畫執行最小必要修改。

**輸入**：human 確認的 Patch Plan

**執行動作**：
- 只修改 allowed files 清單內的檔案
- 每次修改只做最小必要的變動
- 不順帶重構無關代碼
- 不新增未授權的依賴

**輸出**：
```
Gate 3 完成
Changed files：
  - src/engine/habitatTraceEngine.js (modified)
  - styles.css (modified)
```

**失敗條件**：意外修改了未授權檔案、語法錯誤  
**失敗處理**：立即停止，回報 human，等待 rollback 指示

---

## Gate 4 — Local Verification

**目的**：確認修改在本地可正常運行。

**輸入**：Gate 3 的修改結果

**執行動作**：
- 提供手動測試步驟（參見 `docs/testing/MANUAL_TEST_CHECKLIST.md`）
- 檢查 console 是否無錯誤
- 確認主要功能路徑未中斷：
  - PixiJS canvas 正常顯示
  - 角色動畫正常
  - HUD 正常更新
  - Soul Talk 可送出訊息
  - localStorage 可寫入

**輸出**：
```
Gate 4 驗證清單
- [ ] python -m http.server 5173 啟動成功
- [ ] canvas 顯示正常
- [ ] 角色顯示正常
- [ ] HUD 顯示正常
- [ ] Soul Talk 正常
- [ ] localStorage 寫入正常
- [ ] console 無錯誤
```

**失敗條件**：任何核心功能出現錯誤  
**失敗處理**：回到 Gate 3 修正，或向 human 回報問題

---

## Gate 5 — Diff Review

**目的**：在交給 human 審核前，AI 自行做最後 diff 檢查。

**輸入**：Gate 3 的修改結果

**執行動作**：
- 執行 `git diff` 或 `git status --short`
- 對照 `docs/agent/REVIEW_CHECKLIST.md` 逐項確認
- 標記任何潛在風險

**輸出**：
```
Gate 5 Diff Review
- 修改的檔案：<列表>
- 未授權修改：無 ✓
- 新依賴引入：無 ✓
- localStorage 直接寫入：無 ✓
- Pixi/DOM 耦合：無 ✓
- state schema 變更：無 ✓
- 資產刪除/重命名：無 ✓
```

**失敗條件**：發現任何 checklist 紅旗  
**失敗處理**：修正後重新通過 Gate 5，或向 human 說明風險

---

## Gate 6 — Human Approval before Commit

**目的**：human 最終審核 diff 後，由 human 決定是否 commit。

**輸入**：Gate 5 Diff Review 結果

**執行動作**：
- 將 `git diff` 輸出呈現給 human
- 等待 human 明確指示
- **未經 human 明確指示，不可執行 `git commit` 或 `git push`**

**輸出**：等待 human 指令

**失敗條件**：未經 human 指示自行 commit / push  
**失敗處理**：這是嚴重違規，應立即停止並向 human 道歉

> **commit 和 push 均須由 human 明確指示後才可執行。**

---

## Rollback 流程

若任何 Gate 發生無法修復的錯誤：

1. 停止所有修改
2. 執行 `git status --short` 確認當前狀態
3. 向 human 回報：
   - 哪個 Gate 失敗
   - 失敗原因
   - 哪些檔案已被修改
4. 等待 human 指示是否執行 `git checkout -- <file>` 或 `git restore <file>`
5. **AI 不可自行執行 destructive git 操作**
