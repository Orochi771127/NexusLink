# TASK_TEMPLATE.md — Nexus Link 標準任務模板

> 將本模板填寫後貼給 Claude Code / Codex 執行。  
> AI 必須完整讀取本模板後才開始執行，不得假設未填寫的欄位。

---

## 任務模板

```
====================================================
NEXUS LINK TASK
====================================================

Task name:
  <任務名稱，例如：P1A — 棲地痕跡視覺修正>

Goal:
  <具體目標，1-3 行。說明要完成什麼，達到什麼效果。>

----------------------------------------------------
Allowed files (ONLY these may be modified):
  - <檔案路徑 1>
  - <檔案路徑 2>
  - <如果是新增檔案，請標注 [NEW]>

Forbidden files (must NOT be touched):
  - index.html
  - styles.css  (除非本次任務明確允許)
  - src/pixi/pixiApp.js
  - src/state/saveManager.js
  - src/state/store.js  (除非本次任務明確允許)
  - assets/**
  - data/creatures.json  (除非本次任務明確允許)
  - tools/**
  - scripts/**
  - .git/**

Non-goals (do NOT do these):
  - 不重構未在 allowed files 內的程式碼
  - 不引入新的 npm 套件或外部依賴
  - 不修改 state schema（除非明確列在 Goal 中）
  - 不改動 UI 樣式（除非明確列在 Goal 中）
  - 未經 human 明確指示，不可 commit / push

----------------------------------------------------
Required pre-read files (read before editing):
  - docs/agent/AI_EXECUTION_LEDGER.md (relevant lane and its Required reading)
  - CLAUDE.md
  - AGENTS.md
  - <其他相關 runtime 檔案>

----------------------------------------------------
Test commands (no npm, no build step):
  python -m http.server 5173
  # 開啟 http://localhost:5173
  # 手動驗證項目：
  # - <具體要驗證的功能 1>
  # - <具體要驗證的功能 2>

----------------------------------------------------
Required final output:
  1. Changed files 清單
  2. 每個修改的說明（改了什麼、為什麼）
  3. 手動測試步驟
  4. 若有 state schema 變更，說明 localStorage migration 風險
  5. Updated execution-ledger entry: completed work, verification, problems, and next safe action

----------------------------------------------------
CRITICAL RULES:
  - Do NOT commit without explicit human instruction
  - Do NOT push without explicit human instruction
  - Do NOT modify files outside Allowed files list
  - Do NOT introduce new dependencies
  - Follow docs/agent/AI_WORKFLOW.md Gate 0–6

====================================================
```

---

## 使用範例

```
====================================================
NEXUS LINK TASK
====================================================

Task name:
  P0-5 — 修正 habitatTrace TTL 計算

Goal:
  修正 habitatTraceEngine.js 中的 TRACE_TTL_MS 計算，
  讓 TTL 從固定 14 天改為依 emotion intensity 動態計算。

----------------------------------------------------
Allowed files:
  - src/engine/habitatTraceEngine.js

Forbidden files:
  - index.html
  - styles.css
  - src/pixi/pixiApp.js
  - src/state/saveManager.js
  - assets/**
  - .git/**

Non-goals:
  - 不改 traceVisualMapper.js
  - 不改 habitatTraceRenderer.js
  - 不改 state schema

----------------------------------------------------
Required pre-read files:
  - CLAUDE.md
  - src/engine/habitatTraceEngine.js
  - src/state/defaultState.js

----------------------------------------------------
Test commands:
  python -m http.server 5173
  # 開啟 Soul Talk，輸入幾條訊息
  # 確認 habitatTraces 在 localStorage 中寫入正確

----------------------------------------------------
Required final output:
  1. Changed files 清單
  2. 修改說明
  3. 測試步驟
  4. localStorage migration 風險評估

----------------------------------------------------
CRITICAL RULES:
  - Do NOT commit without explicit human instruction
  - Do NOT push without explicit human instruction

====================================================
```

---

## 注意事項

- `Allowed files` 必須是明確的檔案路徑，不接受 `src/**` 這種萬用字元。
- 若任務需要新增資料夾，請在 `Allowed files` 中以 `[NEW]` 標注。
- `Non-goals` 是防止 AI 擅自「順便做」的護欄，請認真填寫。
- 若 AI 發現 allowed files 不足以完成任務，應回報 human，而非擅自擴大範圍。
