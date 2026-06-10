# R2_SANDBOX_RULES.md — Nexus Link R2 Sandbox Max Authority Rules

## 核心定位

**R2 是獨立實驗版（Sandbox / Prototype）**  
R2 存在於 `r2/**` 目錄中，是從 R1 完整複製而來的獨立平行開發環境，專門供 Fable 5 進行大膽實驗、重構與原型驗證。

**R1 是穩定主線**  
R1 位於專案根目錄，是目前穩定、可對外展示的主線版本。任何對 R1 的修改都可能影響穩定性與既有的 localStorage 存檔。

## Fable 5 權限邊界

### 可以做的事（Max Authority 範圍）
- 在 `r2/**` 內進行**大幅重構**（refactor）
- 自由修改以下 R2 檔案：
  - `r2/index.html`
  - `r2/styles.css`
  - `r2/src/**`
  - `r2/data/**`
  - `r2/assets/**`
  - `r2/docs/**`
- 建立新的 R2 專屬文件、測試流程、prompt 模板
- 在 R2 內實現完整可玩的 Prototype（包含 Soul Talk R2、Companion Boundary R2 等）
- 實驗性質的 UI、互動、Engine 邏輯調整（只要遵守技術邊界）

### 絕對禁止的事（Red Lines）
- **絕對不可修改 `r2/**` 以外的任何檔案**（包含根目錄的所有 R1 檔案）
- 禁止修改 R1 的：
  - `index.html`
  - `styles.css`
  - `src/**`
  - `data/**`
  - `assets/**`
  - `docs/**`
  - `tools/**`
  - `scripts/**`
  - `package.json` / `package-lock.json`
- 禁止污染 R1 的 localStorage

## localStorage 隔離規則（最高優先級）

- **R2 唯一允許的 localStorage key**：`nexusLinkR2State:v1`
- R2 的 `r2/src/state/saveManager.js` 必須永遠使用此 key
- **R1 localStorage 絕對不可被污染**
  - R1 使用 `nexusLinkPrototypeState:v2`（或其他 legacy key）
  - 任何 R2 程式碼都不得寫入 R1 的 key
  - 測試時必須同時驗證：
    - `http://localhost:5173/`（R1）
    - `http://localhost:5173/r2/`（R2）

## 技術邊界（與 R1 一致，但 R2 可更彈性）

- **不新增 dependency**
  - 禁止 `npm install`、引入新 npm 套件
  - 禁止引入 React / Vue / Svelte / TypeScript / Tailwind 或任何前端框架
- **不接 LLM API**
  - 禁止在 runtime code 中呼叫 OpenAI、Anthropic、Gemini、Claude API 或任何外部 LLM
  - Prompt 工程僅限於 client-side 靜態回應池或規則驅動
- **不使用後端 / DB**
  - 維持純靜態 GitHub Pages 架構
  - 所有狀態僅使用 localStorage + in-memory store
- **遊戲範圍限制**
  - 不做戰鬥系統
  - 不做背包 / 物品系統
  - 不做大地圖 / 場景切換
  - 不做多角色隊伍（維持單一主要夥伴 greyshade-cat 為主）
- **不做心理治療或醫療宣稱**
  - 所有情緒沉積、記憶痕跡、棲地狀態、boundary feedback 皆為**遊戲虛構機制**
  - 不得使用「治療」「療癒」「心理健康」「mental health」「therapy」等醫療用語
  - 目標是「讓夥伴更真實」，而非提供真實心理支持

## 版本與分支紀律

- R2 開發永遠在 `r2-prototype-fable5` branch（或後續 R2 專屬 branch）
- 完成後的 R2 成果，需經人工審查才能考慮回移 R1
- **禁止自動覆蓋 R1**：任何從 R2 複製回 R1 的動作都必須由 human 手動執行，並經過完整 diff 審查

## 測試紀律

每次施工後必須執行：
```bash
git status --short
```
- 輸出**必須只顯示 `r2/**` 相關變更**
- 若出現任何非 r2/ 檔案，立即停止並 rollback

測試環境：
- `python -m http.server 5173`
- 同時開啟並驗證 R1 與 R2 兩個頁面，確認隔離正常

## 總結原則

R2 是 Fable 5 的「沙盒實驗室」——在 r2/** 裡可以盡情重構與創新，但**邊界之外一寸都不能碰**。  
R1 的穩定性與存檔相容性是最高優先事項。

**違反以上任何一條規則，即視為超出 Max Authority，必須立即停止並向 human 報告。**
