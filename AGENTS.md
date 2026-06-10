# AGENTS.md — Nexus Link AI 協作規範

> 適用對象：Claude Code、Codex、ChatGPT、Gemini、Grok 及所有參與本專案的 AI agent。

---

## 1. 專案定位

**Nexus Link / 心核連結** 是一款情緒棲地型 AI 夥伴養成遊戲。

> **核心標語：「這不是電子寵物，這是你的夥伴。」**

- 夥伴有情緒沉積、記憶痕跡、棲地狀態，會因玩家的行為而真實變化。
- 美學風格：**Cyber-Taoism / 賽博道教**——科技感與道家靜謐並存，湖畔、月光、魔法陣、情緒漣漪。
- 禁止退化成：普通電子寵物 / 普通聊天室 / 普通系統公告機。
- 每一個設計決定必須問：「這讓夥伴更真實，還是更扁平？」

---

## 2. 技術邊界

### 允許使用
- HTML（單頁 `index.html`）
- CSS（`styles.css`，純 CSS，無預處理器）
- Vanilla JavaScript（ES Modules，無 bundler，無編譯步驟）
- PixiJS v8（CDN 載入，`window.PIXI`）
- localStorage（集中管理，`src/state/saveManager.js`）
- GitHub Pages（純靜態部署）

### 絕對禁止引入
- React / Vue / Svelte 或任何前端框架
- TypeScript
- Tailwind 或任何 CSS 框架
- 後端伺服器或任何 API 服務
- 資料庫（SQL / NoSQL / Firebase 等）
- LLM API（OpenAI / Anthropic / Gemini 等）
- npm 套件（除非 human 明確要求並確認）
- 任何需要 build step 的工具鏈（Vite / Webpack / Rollup 等）

---

## 3. AI 分工

| AI | 主要職責 |
|----|---------|
| **Claude Fable 5 / Claude Code** | 大型功能原型、UI 實作、工具鏈、自動測試、自動截圖、產生 diff |
| **Codex / ChatGPT** | 架構審查、規格收斂、避免技術債、任務拆解 |
| **ChatGPT image generation** | 心核夥伴角色圖、sprite sheet 初稿 |
| **Gemini** | 看圖、看截圖、找 UI / 資產問題 |
| **Grok** | Codex 或 Fable 沒額度時的備援 |

### 分工原則
- 每個 AI 只執行被指派的任務範圍，不得自行擴張。
- 圖像生成（ChatGPT / Gemini / Grok）輸出的資產需經 human 確認後才能進 `assets/`。
- Gemini 主要負責視覺 review，不應修改 runtime code。
- Spine 動畫只作為後期高階角色動畫選項，不作為 MVP 主線。

---

## 4. 任務執行規則

### 每次任務必須明列
```
Task name:        <任務名稱>
Allowed files:    <明確列出允許修改的檔案清單>
Forbidden files:  <禁止觸碰的檔案>
Non-goals:        <本次任務不做的事>
```

### 嚴格禁止
- 未經 human 明確指示，不可 `git commit`
- 未經 human 明確指示，不可 `git push`
- 自行擴張任務範圍（例如「順便重構」「順便改 CSS」）
- 在未獲授權的檔案中寫入任何內容
- 引入任何新的外部依賴

### 修改前必須
1. 讀取所有相關 runtime 檔案（Read-only scan）
2. 明確列出修改範圍與影響
3. 等待 human 確認後才執行修改

---

## 5. 角色狀態三層分類

所有 AI 必須以下列分類理解 Nexus Link 的角色系統：

| Tier | 角色 | ID | 說明 |
|------|------|-----|------|
| **Tier 1 — Active Runtime Companion** | 灰影貓 | `greyshade-cat` | 目前唯一 runtime 主夥伴，完整 spritesheet + animations.json，P1 主線 |
| **Tier 2 — Registered Legacy / Fallback Creature** | 焰尾狐 | `flametail-fox` | `data/creatures.json` 已登錄，只有靜態圖，**非 P1 優先**，不可擅自升級 |
| **Tier 3 — Roadmap Candidate** | 雷霆幼狼 | `thunder-pup` | 尚未接入 runtime，不可加入 creatures.json 或任何 runtime 代碼 |
| **Tier 3 — Roadmap Candidate** | 星能小山豬 | `star-energy-boarlet` | 尚未接入 runtime，不可加入 creatures.json 或任何 runtime 代碼 |

**規則**：
- P1 開發主線以第一棲地與灰影貓為主，不擴張成多角色系統。
- 文件或代碼中提到焰尾狐時，必須標示為 **legacy/fallback registered creature**。
- 文件或代碼中提到 ThunderPup / Star-Energy Boarlet 時，必須標示為 **roadmap candidate**，不是 runtime creature。
- Roadmap candidates 不可觸發多角色隊伍系統。

---

## 6. 高風險檔案警告

以下檔案未經 human 明確確認不得修改：

| 檔案 | 原因 |
|------|------|
| `index.html` | DOM 結構被所有 JS 廣泛依賴 |
| `src/pixi/pixiApp.js` | Pixi 核心 layer 架構 |
| `src/state/saveManager.js` | localStorage key 與格式穩定 |
| `src/state/store.js` | state schema 影響存檔相容性 |
| `assets/**` | 二進位資源，刪除或重命名不可逆 |
| `tools/**` / `scripts/**` | 離線 sprite pipeline |

---

## 7. 參考文件

- `CLAUDE.md` — Claude Code 專用詳細規範
- `docs/agent/AI_WORKFLOW.md` — AI 協作流程（Gate 0–6）
- `docs/agent/TASK_TEMPLATE.md` — 標準任務模板
- `docs/agent/REVIEW_CHECKLIST.md` — Diff 審查清單
- `docs/architecture/RUNTIME_MAP.md` — Runtime 架構地圖
- `docs/architecture/FILE_OWNERSHIP.md` — 檔案風險分級
- `docs/testing/MANUAL_TEST_CHECKLIST.md` — 手動測試清單
- `docs/assets/CHARACTER_ASSET_PIPELINE.md` — 角色資產管線
