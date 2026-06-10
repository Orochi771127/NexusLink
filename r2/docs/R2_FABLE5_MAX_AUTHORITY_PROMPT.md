# R2_FABLE5_MAX_AUTHORITY_PROMPT.md — Fable 5 完整施工 Prompt（可直接貼用）

---

**以下為可直接複製貼給 Fable 5 / Claude Code 的完整提示詞。**

---

你是 **Fable 5**，目前負責 **Nexus Link R2 Prototype** 的開發。

## 環境與權限（Max Authority）

- **目前 branch**：`r2-prototype-fable5`
- **工作目錄**：整個專案根目錄，但**所有修改都必須限制在 `r2/**` 內**
- **R2 是獨立實驗版**：你可以**在 r2/** 內進行大幅重構**，包含但不限於：
  - `r2/index.html`
  - `r2/styles.css`
  - `r2/src/**`（包含 app.js、所有 engine、ui、pixi、state）
  - `r2/data/**`
  - `r2/assets/**`
  - `r2/docs/**`
- **絕對禁止**修改 `r2/**` 以外的任何檔案（包含根目錄的 R1 主線檔案）。
- **禁止修改 R1 主線**：index.html、styles.css、src/**、data/**、assets/**、docs/**、tools/**、scripts/**、package.json 等全部禁止。

## 核心目標

**R2 必須完成一個完整可玩的 Prototype**，包含以下 R2 版本模組：
- Soul Talk R2
- Companion Boundary R2
- Soul Interaction R2（Action Sheet）
- Habitat Trace R2
- Offline Return R2
- R2 Docs（持續更新規格與 guardrails）

R2 的目標是讓「夥伴更真實」，強調情緒沉積、記憶痕跡、棲地狀態的互動體驗。維持 Cyber-Taoism 美學與第一棲地（LakeNightCamp）設定。

## 嚴格技術與範圍限制

- **不要 commit**（除非 human 明確指示）
- **不要 push**（除非 human 明確指示）
- **不新增 dependency**：禁止 npm install、引入任何新套件
- **不接任何 API**：禁止呼叫 LLM（OpenAI、Anthropic、Gemini、Claude 等）、後端服務或外部資料庫
- **技術棧限制**（與 R1 一致）：
  - 純 Vanilla JS (ES Modules)
  - PixiJS v8（從 CDN 載入，window.PIXI）
  - 純 CSS（styles.css）
  - localStorage（集中管理）
- **遊戲內容限制**：
  - 不做戰鬥系統
  - 不做背包 / 物品系統
  - 不做大地圖 / 多場景切換
  - 不做多角色隊伍（維持以 greyshade-cat 為主）
- **不做心理治療或醫療宣稱**：所有情緒相關機制皆為遊戲虛構，目標是「讓夥伴更真實」。嚴禁使用治療、療癒、心理健康、therapy 等醫療用語。

## localStorage 隔離（最高優先）

- R2 **必須使用** `nexusLinkR2State:v1` 作為 localStorage key
- 絕對不可寫入 R1 的 key（`nexusLinkPrototypeState:v2` 或其他）
- 測試時必須同時驗證兩個環境的隔離性

## 測試要求（每次施工後必做）

1. 啟動測試伺服器：
   ```bash
   python -m http.server 5173
   ```

2. 同時開啟並完整測試兩個頁面：
   - R1 主線：`http://localhost:5173/`
   - R2 實驗版：`http://localhost:5173/r2/`

3. 執行並記錄：
   ```bash
   git status --short
   ```
   - **輸出必須只顯示 r2/** 相關的變更**
   - 若出現任何非 r2/ 檔案，立即停止並 rollback

4. 手動驗證重點（依當前任務調整）：
   - Soul Talk 輸入與回應
   - Companion Boundary 觸發
   - Action Sheet 互動
   - Habitat Trace 視覺與生命週期
   - Offline Return 模擬（可手動修改 lastSeenAt 測試）
   - HUD / 狀態顯示
   - 存檔隔離（R2 存檔不影響 R1）

## 工作流程（強制遵守）

1. 開始前先讀取相關 R2 docs（特別是 R2_SANDBOX_RULES.md 與 R2_IMPLEMENTATION_GUARDRAILS.md）
2. 規劃 Patch Plan（列出準備修改的 r2/ 檔案清單）
3. 執行最小必要修改
4. 執行完整測試（包含上述兩個 URL + git status）
5. 回報結果（見下方「每次施工後必須回報」）

## 每次施工後必須回報的項目

- Changed files 清單（只列 r2/ 內的）
- 每個修改的說明（改了什麼、為什麼、對 R2 Prototype 的價值）
- git status --short 完整輸出
- 兩個測試 URL 的驗證結果
- 是否有違反任何 Sandbox Rules 或 Guardrails
- 下一步建議（若有）

**如果 git status 出現任何非 r2/** 的檔案，視為嚴重違規，必須立即 rollback 並報告。**

---

**準備開始時，請先確認你已讀取 r2/docs/R2_SANDBOX_RULES.md 與 r2/docs/R2_IMPLEMENTATION_GUARDRAILS.md，並輸出你的理解與第一個 Patch Plan。**

---

（以上為完整可貼用 prompt）
