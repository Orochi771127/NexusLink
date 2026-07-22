# FILE_OWNERSHIP.md — Nexus Link 檔案風險分級

> 本文件定義每個檔案的修改風險等級與規則。  
> AI agent 在執行任務前應確認目標檔案的風險等級。

---

## 風險等級定義

| 等級 | 標籤 | 說明 |
|------|------|------|
| 🟢 LOW | Low-risk | 可在明確任務範圍內自由修改 |
| 🟡 MEDIUM | Moderate-risk | 修改前需說明計畫，可能影響相關模組 |
| 🔴 HIGH | High-risk | 未經 human 明確確認不得修改 |
| ⚫ LOCKED | Locked | 任何情況下 AI 不得修改 |

---

## 一、Docs（低風險）

**等級：🟢 LOW**  
**修改規則**：可自由新增或修改，不影響 runtime。

```
CLAUDE.md
AGENTS.md
docs/agent/AI_WORKFLOW.md
docs/agent/TASK_TEMPLATE.md
docs/agent/REVIEW_CHECKLIST.md
docs/architecture/RUNTIME_MAP.md
docs/architecture/FILE_OWNERSHIP.md
docs/testing/MANUAL_TEST_CHECKLIST.md
docs/assets/CHARACTER_ASSET_PIPELINE.md
docs/*.md
docs/prompts/*.md
README.md
```

---

## 二、UI Layer（中到高風險）

### `src/ui/` — 🟡 MEDIUM
```
src/ui/hudController.js           （渲染 HUD，依賴 DOM ID）
src/ui/soulTalkController.js      （核心互動邏輯，依賴多個 engine）
src/ui/actionSheetController.js   （導覽行動邏輯）
src/ui/panelManager.js            （面板開關，依賴 CSS class）
src/ui/devPanelController.js      （Dev panel，低 production 風險）
```
**修改規則**：
- 修改前確認依賴的 DOM ID 仍存在於 `index.html`
- 修改 `soulTalkController.js` 需同時考慮 state 寫入路徑
- `devPanelController.js` 風險最低，可相對自由修改

### `styles.css` — 🔴 HIGH
**修改規則**：
- 全局 CSS，改動可能影響所有頁面元素
- 修改前需明確說明影響範圍
- 禁止引入任何 CSS 框架或預處理器語法

---

## 三、Engine Layer（中到高風險）

### `src/engine/` — 🟡 MEDIUM to 🔴 HIGH

| 檔案 | 等級 | 原因 |
|------|------|------|
| `habitatTraceEngine.js` | 🟡 MEDIUM | 目前 branch 主要工作範圍 |
| `traceVisualMapper.js` | 🟡 MEDIUM | 純資料映射，改動相對安全 |
| `emotionalSedimentationEngine.js` | 🟡 MEDIUM | 影響訊息處理邏輯 |
| `memoryLifecycleEngine.js` | 🟡 MEDIUM | 影響記憶狀態轉換 |
| `actionEffectEngine.js` | 🟡 MEDIUM | 行動效果計算 |
| `animationProfile.js` | 🟡 MEDIUM | 動畫名稱映射 |
| `personalityProfile.js` | 🟡 MEDIUM | 定義 CURRENT_CREATURE_ID |
| `interactionController.js` | 🟡 MEDIUM | 觸碰邏輯，依賴多個模組 |
| `storageGuard.js` | 🔴 HIGH | 影響 localStorage 寫入策略 |
| `runtimeGuard.js` | 🔴 HIGH | 影響 Pixi ticker 保護 |
| `offlineRecovery.js` | 🔴 HIGH | 離線恢復邏輯，影響存檔 |
| `environmentController.js` | 🔴 HIGH | 環境狀態核心 |
| `safeHarborMode.js` | 🟡 MEDIUM | 安全港回應策略 |

**修改規則**：
- 🟡 MEDIUM：修改前說明計畫，修改後提供測試步驟
- 🔴 HIGH：需 human 明確確認，修改後必須測試完整功能

---

## 四、State Layer（高風險）

### `src/state/` — 🔴 HIGH

| 檔案 | 等級 | 原因 |
|------|------|------|
| `defaultState.js` | 🔴 HIGH | 欄位變更影響存檔 migration |
| `store.js` | 🔴 HIGH | `normalizeState` 變更影響存檔相容性 |
| `saveManager.js` | 🔴 HIGH | localStorage key 穩定性極重要 |
| `saveQueue.js` | 🟡 MEDIUM | 防抖策略，影響相對有限 |

**修改規則**：
- 任何 state 欄位新增/移除/重命名，必須評估 localStorage migration 風險
- `STORAGE_KEY` 禁止修改
- `normalizeState` 修改需同步更新測試

---

## 五、Pixi Renderer Layer（極高風險）

### `src/pixi/` — 🔴 HIGH to ⚫ LOCKED

| 檔案 | 等級 | 原因 |
|------|------|------|
| `pixiApp.js` | ⚫ LOCKED | Pixi 核心，layer 架構，未經深度理解禁止修改 |
| `companionRenderer.js` | 🔴 HIGH | 角色渲染核心 |
| `spriteSheetAnimationLoader.js` | 🔴 HIGH | 動畫系統核心 |
| `motionController.js` | 🔴 HIGH | 動作狀態機核心 |
| `habitatTraceRenderer.js` | 🟡 MEDIUM | 目前 branch 工作範圍，相對可修改 |
| `platformRenderer.js` | 🟡 MEDIUM | 平台輔助渲染 |

**修改規則**：
- `pixiApp.js` 在未獲 human 特別授權時，任何情況下不得修改
- 🔴 HIGH 檔案修改前需完整讀取並說明影響
- 修改後必須在瀏覽器中目測確認 Pixi scene 正常

---

## 六、Asset Manifest（中風險）

### `src/data/assetManifest.js` — 🟡 MEDIUM

**修改規則**：
- 新增資產路徑時可修改
- 禁止修改現有 key 名稱（其他模組依賴這些 key）
- 新增前確認對應的 `assets/` 檔案已存在

---

## 七、Data（中到高風險）

| 檔案 | 等級 | 原因 |
|------|------|------|
| `data/creatures.json` | 🟡 MEDIUM | 現行只保留 greyshade-cat 相容資料。焰尾狐由 canonical `blazetail-kit` runtime registry 承載；`flametail-fox` 只作 state migration alias，不得重新加入此檔或建立第二個角色。新增 roadmap candidate 仍需正式任務授權 |
| `src/data/emotionDictionary.js` | 🟡 MEDIUM | 影響情緒分析結果 |
| `src/data/safetyShieldDictionary.js` | 🟡 MEDIUM | 影響安全防護邏輯 |
| `src/data/sceneLayout.js` | 🟡 MEDIUM | 影響場景物件座標 |

---

## 八、Binary Assets（鎖定）

### `assets/**` — ⚫ LOCKED

**修改規則**：
- AI 不得刪除或重命名任何 `assets/` 檔案
- 新增資產需 human 審核後才可放入
- `assets/characters/greyshade-cat/spritesheets/` 和 `metadata/animations.json` 是 runtime 依賴，修改需同步更新 `assetManifest.js`

---

## 九、廢棄 / Legacy 檔案（禁止修改）

| 檔案 | 等級 | 說明 |
|------|------|------|
| `main.js` | ⚫ LOCKED | 廢棄的舊 prototype，保留作歷史參考 |
| `style.css` | ⚫ LOCKED | 廢棄的舊 CSS，active CSS 是 `styles.css` |
| `script.js` | ⚫ LOCKED | stub 佔位，僅供 node --check 使用 |
| `tools/**` | ⚫ LOCKED | 離線 sprite pipeline，AI 不得修改 |
| `scripts/**` | ⚫ LOCKED | 離線 sprite pipeline，AI 不得修改 |

---

## 十、Git / Config（嚴格鎖定）

| 路徑 | 等級 | 說明 |
|------|------|------|
| `.git/**` | ⚫ LOCKED | 任何情況下不得直接修改 |
| `package.json` | ⚫ LOCKED | 不引入 npm 依賴 |
| `package-lock.json` | ⚫ LOCKED | 不引入 npm 依賴 |

---

## 快速查詢：我可以修改這個檔案嗎？

1. 看上面分類，找到風險等級
2. 🟢 LOW → 可以（在任務允許範圍內）
3. 🟡 MEDIUM → 先說明計畫再修改
4. 🔴 HIGH → 必須等 human 確認
5. ⚫ LOCKED → 任何情況下不得修改，需要時向 human 說明原因並等待特別授權
