# CLAUDE.md — Nexus Link 開發規範

## 1. 專案定位

**Nexus Link / 心核連結**是一款情緒棲地型 AI 夥伴養成遊戲。

- 這不是電子寵物。這是你的夥伴。
- 夥伴有情緒沉積、記憶痕跡、棲地狀態，會因你的行為而真實變化。
- 美學風格：**Cyber-Taoism / 賽博道教**——科技感與道家靜謐並存，湖畔、月光、魔法陣、情緒漣漪。
- 不可退化成：普通電子寵物、普通聊天室、普通系統公告機。
- 每一個設計決定都必須問：「這讓夥伴更真實，還是更扁平？」

---

## 2. 技術邊界

### 允許使用
- HTML（單頁 `index.html`）
- CSS（`styles.css`，純 CSS，無預處理器）
- Vanilla JavaScript（ES Modules，無 bundler，無編譯步驟）
- PixiJS v8（從 CDN 載入，`window.PIXI`）
- localStorage（集中管理，透過 `src/state/saveManager.js`）
- GitHub Pages（純靜態部署）

### 絕對禁止引入
- React / Vue / Svelte 或任何前端框架
- TypeScript
- Tailwind 或任何 CSS 框架
- 後端伺服器或 API 服務
- 資料庫（SQL / NoSQL）
- LLM API（OpenAI / Anthropic / Gemini 等）
- npm 套件（除非使用者明確要求並確認）
- 任何需要 build step 的工具鏈

---

## 3. 架構規範

### 渲染分層
- **PixiJS canvas**：負責所有場景渲染（背景、角色、粒子、棲地痕跡、特效）
- **DOM UI**：疊加在 canvas 上，負責 HUD、面板、對話框、導覽列
- 兩層必須保持獨立，不可交叉操作

### 解耦原則
- `State / EventBus / Renderer` 三者必須解耦
- **UI 不可直接操作 Pixi 容器**（透過 EventBus 或 store 訂閱驅動）
- **Pixi 不可直接操作 DOM**（透過 EventBus 發送事件）
- State 變更統一透過 `src/state/store.js` 的 `setState` / `updateState` / `replaceState`

### 效能規範
- **Ticker**：不可在 ticker 內執行昂貴操作（DOM 查詢、大量 JSON parse、fetch）
- **Texture**：必須透過 `PIXI.Assets.load()` 快取，禁止重複載入同一材質
- **像素角色**：必須設定 `texture.source.scaleMode = 'nearest'`，禁止 linear 插值
- **角色座標**：必須整數 snap（`Math.round()`），禁止浮點座標導致模糊

### localStorage 規範
- 所有寫入必須集中在 `src/state/saveManager.js`
- 使用 `STORAGE_KEY = "nexusLinkPrototypeState:v2"`
- 禁止在其他模組直接呼叫 `localStorage.setItem`

---

## 4. 修改規範

### 修改流程
1. **開始任何修改前**，先讀取相關檔案，確認現狀
2. **列出修改計畫**：說明要改哪些檔案、改什麼、為什麼
3. **等使用者確認後**，才執行 runtime code 修改
4. **修改後列出 changed files**，並提供手動測試方式

### 範圍控制
- 每次只改**最小必要檔案**，禁止順帶重構無關代碼
- 禁止大規模重構，除非使用者明確要求
- 禁止自行引入新的第三方依賴
- 禁止自動 push 到 git remote
- 禁止自動刪除任何資產檔案
- 禁止重新命名既有角色資產（`assets/characters/` 下的所有檔案）

### State Schema 修改
- 若需修改 state 結構，**必須事先說明**：
  - 新增/移除/重命名的欄位
  - localStorage migration 風險（舊存檔是否相容）
  - `normalizeState` 是否需要更新

---

## 5. 安全流程

```
開始任務
  ↓
讀取現有相關檔案（Read）
  ↓
說明修改範圍與影響
  ↓
等待使用者確認
  ↓
執行修改（最小必要）
  ↓
列出 changed files
  ↓
提供測試方式
```

禁止跳過「等待確認」步驟直接修改 runtime code。

---

## 6. 關鍵檔案索引

| 類別 | 檔案 |
|------|------|
| HTML 入口 | `index.html` |
| 主要 CSS | `styles.css` |
| JS 主入口 | `src/app.js` |
| Pixi 初始化 | `src/pixi/pixiApp.js` |
| 角色渲染 | `src/pixi/companionRenderer.js` |
| 棲地痕跡渲染 | `src/pixi/habitatTraceRenderer.js` |
| 動作控制 | `src/pixi/motionController.js` |
| State 管理 | `src/state/store.js` |
| localStorage | `src/state/saveManager.js` |
| 預設狀態 | `src/state/defaultState.js` |
| 棲地痕跡邏輯 | `src/engine/habitatTraceEngine.js` |
| 痕跡視覺映射 | `src/engine/traceVisualMapper.js` |
| 情緒沉積 | `src/engine/emotionalSedimentationEngine.js` |
| 角色資料 | `data/creatures.json` |

### 高風險檔案，未經明確確認不得修改
- `index.html`（DOM 結構被 JS 廣泛依賴）
- `src/pixi/pixiApp.js`（Pixi 核心 layer 架構）
- `src/state/saveManager.js`（localStorage key 與格式穩定）
- `assets/**`（二進位資源）
- `tools/**`、`scripts/**`（離線 sprite pipeline）
