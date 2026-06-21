# R2_IMPLEMENTATION_GUARDRAILS.md — R2 實施護欄與決策準則

## 目的

本文件定義 Fable 5 在 R2 Sandbox 中的**可為與不可為**，以及每次施工後的標準回報流程。目標是讓 R2 能在「最大自由度」與「最小污染風險」之間取得平衡。

---

## 一、Fable 5 在 r2/** 內可以做什麼（Yes 區）

### 完全允許的範圍
- 在 `r2/**` 內進行**大幅重構**與實驗性設計
- 修改以下所有 R2 檔案：
  - `r2/index.html`（DOM 結構、標題、載入順序）
  - `r2/styles.css`（樣式、變數、動畫）
  - `r2/src/**`（app.js、所有 engine、ui、pixi、state、utils 等）
  - `r2/data/**`（creatures.json、emotionDictionary 等）
  - `r2/assets/**`（圖片、音效、prompt 文字檔等，需謹慎）
  - `r2/docs/**`（規格文件、prompt、checklist、guardrails）
- 新增 R2 專屬的模組、資料結構、視覺效果（只要符合技術邊界）
- 實作完整可玩的 R2 Prototype（Soul Talk R2、Boundary R2、Habitat Trace R2、Offline Return R2 等）
- 更新 R2 專屬的測試流程、QA checklist、Fable 5 prompt
- 自由調整 R2 內的 localStorage 使用方式（**但必須維持 `nexusLinkR2State:v1`**）

### 鼓勵的方向
- 強化情緒沉積、記憶痕跡、棲地狀態的真實感
- 改善 Companion Boundary 與回應品質
- 優化離線返回體驗（Offline Return R2）
- 改善文件與規格，讓後續工作更容易追蹤

---

## 二、Fable 5 絕對不能做什麼（No 區）

### 最高優先禁止事項
1. **修改任何 r2/** 以外的檔案**（包含 R1 主線）
   - 根目錄的 `index.html`、`styles.css`、`src/**`、`data/**`、`assets/**`、`docs/**`、`tools/**`、`scripts/**`、`package.json` 等
2. **污染 R1 localStorage**
   - 不得寫入 `nexusLinkPrototypeState:v2` 或任何 R1 key
3. **新增 dependency**
   - 禁止 `npm install`
   - 禁止引入 React、Vue、Svelte、TypeScript、Tailwind、任何 CSS 預處理器或前端框架
4. **接外部 API**
   - 禁止呼叫任何 LLM API（OpenAI、Anthropic、Gemini、Claude、xAI 等）
   - 禁止後端服務、資料庫、第三方服務
5. **超出遊戲範圍的內容**
   - 戰鬥系統
   - 背包 / 物品系統
   - 大地圖 / 多場景切換
   - 多角色隊伍（除非 human 明確授權）
6. **醫療或治療宣稱**
   - 不得使用「治療」「療癒」「心理健康」「mental health」「therapy」「counseling」等詞彙
   - 所有情緒機制必須維持「遊戲虛構機制，用來讓夥伴更真實」的定位
7. **未經授權的 commit / push**
   - 除非 human 明確指示，否則禁止執行 `git commit` 或 `git push`
8. **自動覆蓋 R1**
   - 任何從 R2 複製檔案回 R1 的動作，必須由 human 手動執行，並經過完整人工 diff 審查

### 其他禁止行為
- 在 ticker 內執行昂貴操作（大量 DOM 查詢、JSON parse、fetch）
- 每幀 new Graphics（必須 object reuse / sync model）
- 違反 integer coordinate snap 與 nearest-neighbor 規則
- 直接跨層操作（Pixi 直接操作 DOM、UI 直接操作 Pixi Container）

---

## 三、每次施工後必須回報的項目

完成任何修改後，**必須**提供以下報告（可直接貼在回覆中）：

1. **Changed files** 清單（只列 `r2/` 內的檔案）
2. **每個修改的說明**（改了什麼、為什麼、對 R2 Prototype 的價值）
3. **git status --short** 完整輸出
4. **測試結果**：
   - `http://localhost:5173/`（R1）是否正常且未受影響
   - `http://localhost:5173/r2/`（R2）功能是否正常
   - localStorage key 隔離是否正確
5. **是否違反任何 Guardrails 或 Sandbox Rules**
6. **Rollback 狀態**（若有需要 rollback 的情況）
7. **下一步建議**（若有）

**如果 `git status --short` 出現任何非 `r2/**` 的項目，必須在報告中特別標註為「嚴重違規」並立即執行 rollback。**

---

## 四、如何判斷可以 Yes（繼續執行）

當以下條件**全部滿足**時，可以判斷為 Yes：

- 修改範圍完全在 `r2/**` 內
- `git status --short` 只顯示 r2/ 相關變更
- 未引入新 dependency
- 未呼叫任何外部 API
- 未使用禁止的框架或技術
- 未出現醫療/治療宣稱
- 未破壞 R1/R2 localStorage 隔離
- 功能在 `http://localhost:5173/r2/` 可正常運作
- R1 在 `http://localhost:5173/` 完全未受影響
- 符合當前任務的 Allowed files 與 Non-goals

---

## 五、如何判斷必須 No（立即停止）

出現以下任何一項，**必須立即停止**並向 human 報告：

- `git status --short` 出現非 r2/ 的檔案
- 嘗試修改根目錄或 R1 檔案
- 引入新 npm 套件或前端框架
- 在 code 中呼叫 LLM API
- 出現醫療或治療相關用語
- 破壞 R1 localStorage（寫入錯誤 key）
- 測試時 R1 頁面出現異常或資料被覆寫
- 未經 human 指示執行 commit / push
- 任務範圍超出當前 Patch Plan 且未重新取得確認

**遇到以上情況時，優先執行 rollback，然後報告。**

---

## 六、Rollback 原則

- 任何時候發現違規或問題，都應優先使用 `git checkout -- <file>` 或 `git restore <file>` 回復單一檔案
- 重大問題時可使用 `git checkout -- r2/` 回復整個 r2/ 目錄（需 human 同意）
- **AI 不可自行執行大規模 destructive 操作**（例如 `git reset --hard`），除非 human 明確指示
- Rollback 後必須重新執行 `git status --short` 並確認狀態乾淨

---

## 七、R2 回移 R1 時的特別規則

當 R2 某個功能成熟，考慮將成果移回 R1 時，**必須**遵守以下流程：

1. **絕對不可自動覆蓋**：禁止使用 `cp`、script 或任何自動化方式直接覆蓋 R1 檔案。
2. **必須人工審查**：
   - human 必須親自執行 diff 比對
   - 審查 localStorage key 變更風險
   - 審查 state schema 相容性
   - 審查是否引入新 dependency 或違反技術邊界
3. **必須先在 R2 docs 中留下完整記錄**：
   - 功能說明
   - 變更清單
   - 測試結果
   - 已知風險
4. **只有 human 明確指示後**，才能開始手動合併動作
5. 合併後必須同時更新 R1 與 R2 的對應文件，並標註「已回移」狀態

**「R2 成果優秀」不等於「可以直接覆蓋 R1」**。R1 的穩定性與既有玩家存檔相容性永遠優先於實驗速度。

---

## 八、總結心法

- R2 = 實驗室（可以大膽）
- R1 = 穩定主線（絕對不能被污染）
- 邊界之外 = 零容忍
- 每次施工後的 `git status --short` 是最重要的健康檢查指標
- 當有疑問時，優先選擇「No」並詢問 human，而不是冒險

**違反 Guardrails 將被視為超出 Max Authority。**

---

*本文件與 R2_SANDBOX_RULES.md 共同構成 R2 Fable 5 作業的最高護欄。所有施工前後都應重新閱讀本文件。*
