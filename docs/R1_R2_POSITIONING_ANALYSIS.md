# Nexus Link R1 / R2 定位盤點與分析報告

**日期**：2026（本次盤點）  
**目的**：釐清 r1（R2 Demo Stable）與 r2（R2 Lab / 阿兔實驗室）內容定位，先盤點現況，不做大規模 UI 重構或覆蓋。  
**工程限制遵守**：純 HTML/CSS/Vanilla JS/PixiJS/localStorage；資料層與渲染層分離；不引入 React/Vue/Svelte、後端、DB、真登入、LLM；保持 GitHub Pages 單一 repo 部署；不把所有邏輯塞 Pixi ticker。

---

## 一、專案盤點總覽

### Root（目前被視為 R1 候選基底）
- **入口**：`index.html`（**目前為 launcher**，指向 `./r2/` + 1.5s 自動 + 手動按鈕。原完整遊戲殼已被覆寫）。
- **樣式**：`styles.css`（主）、`style.css`（舊）、`main.js`、`script.js`（疑似舊入口）。
- **程式碼**：`src/`（**不完整子集**）
  - `data/`：`creatures.json`（載入）、`assetManifest.js`、`emotionDictionary.js`、`safetyShieldDictionary.js`、`sceneLayout.js`（較少）。
  - `engine/`：缺少 `battleEngine.js`、`explorationEngine.js`、`memoryLifecycleEngine.js`、`soulTalkComposer.js` 等；有 actionEffect、interaction、emotionalSedimentation、habitatTrace、save 相關、runtimeGuard 等。
  - `ui/`：只有 `actionSheetController.js`、`devPanelController.js`、`hudController.js`、`panelManager.js`、`soulTalkController.js`。**無 mapController、battleController、companionSelectController、codexController**。
  - `pixi/`、`state/`（saveManager、saveQueue、store、defaultState）、`utils/`、`audio/`、`tools/sceneEditor.js` 存在。
- **資料**：`data/creatures.json`（至少含 greyshade-cat 為主）。
- **資源**：`assets/`（完整，含 flame-tail-fox 完整 frames、greyshade-cat、LakeNightCamp_v2 背景、nav 圖、ui 圖等）。
- **文件**：`docs/`（大量規劃文件：nexuslink-*.md、architecture/、prompts/ 等）。
- **其他**：`tmp/`、`tools/`（Python 資產處理）、`.git` 等。

**目前載入 root `/`**：顯示 launcher（非遊戲）。若要跑 R1 邏輯，需直接使用 root `src/` + 樣式 + 完整殼 HTML。

### r2/（目前被視為 Lab / 阿兔實驗室，自成一體）
- **入口**：`r2/index.html`（完整遊戲殼：habitat-stage、core-hud、quick-hud、soul-talk-launcher、bottom-nav 4 鈕、character / soulTalk / actionSheet / **額外 map-modal、battle-modal、companion-select-modal、codex-modal**）。
- **樣式**：`r2/styles.css`。
- **程式碼**：`r2/src/`（**完整版**）
  - `data/`：多出 `companionRegistry.js`、`enemyRegistry.js`、`evolutionLines.js`、`explorationNodes.js`、`soulTalkResponsePacks.js`。
  - `engine/`：多出 `battleEngine.js`、`explorationEngine.js`、`memoryLifecycleEngine.js`、`soulTalkComposer.js`、`returnBehaviorEngine.js` 等完整實驗引擎。
  - `ui/`：多出 `battleController.js`、`mapController.js`、`companionSelectController.js`、`codexController.js`。
  - 其餘與 root 高度重疊但有強化（app.js 支援 companion 切換、return greeting、map/battle 注入）。
- **資料**：`r2/data/creatures.json`。
- **資源**：`r2/assets/`（重複但精簡，greyshade-cat 處理過版本 + `reference/` 大量設計參考圖 + evolution-lines 等）。
- **文件**：`r2/docs/`（極豐富 R2_* 規格：R2_GAME_PILLARS.md、R2_SYSTEM_BLUEPRINT.md、R2_TASK_BACKLOG.md、R2_TEST_CHECKLIST.md、R2_EMOTIONAL_ELEMENT_SYSTEM.md、R2_EVOLUTION_SYSTEM.md、R2_SCOPE_V1.md 等）。
- **其他**：自包含，可獨立部署 `/r2/`。

**目前載入 `/r2/`**：完整可玩 Lab 版本（有地圖、戰鬥原型、夥伴切換等）。

**重複現象**：大量 `src/` 檔案在 root 與 r2 之間近乎複製（actionEffectEngine、emotional 系列、save、pixi renderers 等）。assets 也有重複。

---

## 二、四個按鈕（探索 / 照顧 / 成長 / 記憶）實際做了什麼

**共同結構**（兩版都有 bottom-nav + data-action + 圖片）：
- 點擊 → `actionSheetController` 設定 active nav + 開啟 `actionSheet` panel（標題 + copy + 動態 rows）。
- 選 row → `commitNavAction` → `evaluateActionEffect(state, action, choice)` 回傳 patch → `store.setState` + 可能 emit env event + 加 system 訊息到 soulTalk chat + save。
- 這**不是純 UI 按鈕**，有真實遊戲邏輯（數值變化 + 記憶生成 + 視覺 trace + 環境事件）。

**Root 版 `actionSheetController.js` + `actionEffectEngine.js`**：
- 靜態 meta（explore/care/grow/memory 各 3-4 選項）。
- explore 包含「星圖回廊」choice → 產生 memory + vitals patch（無地圖開啟）。
- 所有選擇都走相同 effect 路徑：vitals（bond/trust/energy/mood/defense/touchFatigue）、memories append（dedupe）、habitatTraces、偶爾 environmentEvent（crystal touch）。
- 結果只反應在 HUD 數值 + soulTalk 聊天記錄 + 棲地 trace 視覺。**沒有導向獨立頁面**。

**r2 版（強化）**：
- `getActionMeta` 依 state 動態調整（defense 高時 care/grow 優先「靜靜陪伴」；energy 低時 care 優先休息；memory 累積後出現「回聲整理」）。
- explore 第一項特別：「開啟探索地圖」（kind: "open_map"）→ 呼叫注入的 `openMap()`（來自 app.js 傳入 mapController.open()），**不關 actionSheet，直接開 map panel**。
- 其餘選擇仍走 effectEngine（與 root 幾乎相同邏輯）。
- 額外：map 本身可觸發 explorationEngine → 可能開 battle。

**結論**：四鈕目前主要是「行動選擇器 + 狀態突變器 + 記憶收集器」。**真實邏輯存在**（不在只是心語文字），但「獨立頁面」（記憶列表、成長頁、照顧頁、星圖迴廊 UI）**幾乎不存在**，只有 action sheet 作為統一入口。

---

## 三、關鍵功能存在性盤點（是否有入口？是否只有 stub？）

| 功能           | Root (R1 候選)                  | r2 (Lab)                          | 備註 / 入口問題 |
|----------------|----------------------------------|-----------------------------------|-----------------|
| Title / Start 畫面 | 無（目前 launcher；原殼直入 habitat） | 無（直入 habitat） | 重大缺失 |
| 本地玩家檔案建立 | localStorage save 存在（saveManager + offlineRecovery + store） | 同 + returnBehavior | 無明確「建立 profile / 取名」UI |
| 初始夥伴選擇   | 無（硬編或從 save 取 CURRENT_CREATURE_ID） | 有 companionSelectController + panel + swapCompanion runtime | r2 有但非強制初始流程 |
| 主棲地         | 有（Pixi + companion + env + traces + interaction） | 有（更完整，支援 swap） | 兩版都有 |
| 星圖迴廊       | 只有 action choice 文字 + memory 建立 | 同（explore 選項之一） | **無 UI、無節點視覺**（只是記憶標籤） |
| 地圖節點（>=3）| 無（無 explorationNodes） | 有（5 個：moonlake_camp 起點 + starwood_trail 等；EXPLORATION_NODES.js） | r2 專屬 |
| 地圖切換 / 地圖 UI | 無 | 有 mapController（SVG 節點 + 路徑 + visitCounts + 點擊觸發 exploration） + map-modal | 只有從 explore action 進入 |
| 簡化戰鬥       | 無（無 battle*） | 有 battleController + battleEngine + 技能（basic/guard/resonance）+ hp/log/retreat + battle-modal | 從 map 節點遭遇進入 |
| Memory 記憶列表 | memories / emotionalMemories 存在於 state，被多 engine 使用（trace、lifecycle、return greeting） | 同 + 更多 | **無 dedicated 列表 UI / 瀏覽面板** |
| Growth 成長狀態頁 | HUD + character modal 顯示 vitals + 偶爾 growthHint | 同 | **無獨立成長頁** |
| Care 照顧互動頁 | 只有 action sheet 選項 | 同（動態） | **無獨立頁面** |
| localStorage 存檔 | 完整（saveQueue 分級、storageGuard、offlineRecovery） | 更完整（含 battleRecord、explorationProgress） | 兩版都有，穩定 |

**其他觀察**：
- r2/index.html 殼內已有 map-modal、battle-modal 等 DOM，root 原殼（被覆寫前）只有 character / soulTalk / actionSheet。
- explorationProgress、battleRecord 只存在 r2 defaultState/store。
- 「星圖回廊」在 action meta 與 effectEngine 裡是硬編文字 + 記憶，並非地圖功能。
- 許多 engine（memoryLifecycleEngine、emotionalSedimentationEngine 等）已在跑，但效果多為內部狀態或 dev 面板可見，玩家無直接入口。
- Codex 與 companion 切換只在 r2。

**孤兒功能 / 沒有入口的實作**：
- 收集到的 memories（強大資料層，已有 dedupe、sanitze、trace 轉換、lifecycle），但玩家看不到列表。
- 星圖迴廊效果（只剩記憶條目）。
- r2 的 5 地圖節點 + explorationEngine + battle 全鏈路（只有經由 explore action 的一個選項才開）。
- Flame-tail-fox 等額外角色資產（root assets 有完整 frames，creatures.json 可能有，但目前主要用 greyshade-cat，無切換入口在 root）。
- 大量 r2/docs/ 規格（evolution、faction、emotional element system 等）尚未落地。

---

## 四、版本定位對照（依使用者定義的最低需求）

### r1 必須是「R2 Demo Stable」（可展示、較穩定商業 Demo）
**目前缺口（重大）**：
- 缺少 Title/Start 畫面。
- 缺少本地玩家檔案建立 UI。
- 缺少初始夥伴選擇流程。
- 缺少星圖迴廊實體 UI。
- 缺少地圖節點（>=3）+ 地圖切換 + 簡化戰鬥。
- 缺少 Memory 記憶列表瀏覽。
- 缺少 Growth 成長狀態頁、Care 照顧互動頁（目前只有 action sheet）。
- **入口問題**：目前 root index 是 launcher，無法直接當 stable demo 展示。root src/ 缺少上述功能對應的 controller/engine/HTML。

**已有基礎（可保留強化）**：
- 主棲地 + Pixi 渲染 + interaction + 環境心跳 + habitat traces。
- 四行動 + 真實 effect 邏輯 + memory 收集 + localStorage 完整存檔機制。
- HUD / character / soulTalk / actionSheet 面板。
- 數值系統（bond/trust/mood/energy/defense 等）+ 離線恢復。

### r2 必須是「R2 Lab / 阿兔實驗室」（快速實驗）
**目前已有優勢**：
- 5 地圖節點 + 真實 map UI + 探索事件 + 戰鬥 prototype（可再擴）。
- 夥伴切換 runtime + companionSelect + codex 骨架。
- 更多實驗引擎（exploration、battle、returnBehavior、memoryLifecycle 等）。
- 動態 action meta + 更豐富 state（explorationProgress、battleRecord）。
- 豐富 r2/docs/ 作為實驗藍圖。
- Dev reset / query hooks / scene editor 已存在。

**仍缺 / 可加強的方向**（符合 Lab 角色）：
- 缺少明顯的「Lab 入口」或 debug 快速測試 landing（目前仍像完整遊戲）。
- 可再增加更多節點、事件、角色、更大膽 VFX（目前已有部分）。
- 實驗性功能應容易開關或有明顯標記（避免污染 stable 感覺）。
- 仍缺少乾淨的 Title/Start + 初始選擇（Lab 也可以有，但要能快速重置）。

---

## 五、檔案保留 / 死碼建議（先盤點，不刪）

**強烈建議保留**：
- `r2/` 整個資料夾（Lab 自包含，完美符合定位）。
- `src/` 核心共用邏輯（actionEffectEngine、emotional 系列、interaction、saveManager、pixi 渲染層、utils、state/store）。root/src 可作為 stable 基礎子集。
- `assets/`（兩邊都保留；r2/assets 偏向當前使用 greyshade + reference 設計稿；root/assets 有更廣角色 frames）。
- `data/creatures.json` 及 r2 版。
- `docs/` 全部（尤其是 r2/docs/R2_* 系列規格 + 舊規劃，作為未來最小修改依據）。
- localStorage 相關（storageGuard、saveQueue、offlineRecovery）—— 已符合「資料層分離」。

**可能死碼 / 冗餘 / 需清理（後續最小步驟）**：
- Root `index.html` 目前的 launcher（會阻擋 R1 stable demo 展示，需調整為 stable 遊戲殼）。
- Root `main.js`、`script.js`、`style.css`（singular）—— 疑似舊遺留。
- root/src 與 r2/src 之間大量**近乎重複的檔案**（actionEffectEngine.js、emotionalSedimentationEngine.js 等）。未來可考慮 root 為「stable 子集」、r2 為「lab 超集」，或用簡單條件式載入，但目前先不要重構。
- `tmp/`、部分 `tools/*.py`（資產處理用，保留但非 runtime）。
- 未被 creatures.json 引用或無 companionRegistry 登錄的額外角色 frames（flame-tail 在 root 有完整但目前未活躍）。
- 重複的背景/平台圖（root vs r2/assets 內 LakeNightCamp_v2 有部分重複）。

**不建議現在刪**：任何可能被 Lab 實驗或未來 stable 回流使用的東西。先標記。

---

## 七、R2 Hard Promotion to Root 計畫（2026）

**新決策**：停止「把 root 恢復成舊 R1 stable shell」。改採 **Nexus Link R2 Hard Promotion to Root**。

**目標**：
- 讓目前 `r2/` 的內容成為 GitHub Pages root `/` 的主版本。
- 玩家打開主網址時，看到的是目前 R2 的進度。
- 定位：
  - `/` = 目前 R2 的正式展示入口
  - `/r2/` = 保留為 Lab / 備份 / 實驗入口
- 不要讓 root 退回功能較少的舊 R1 子集。

**嚴格限制（本計畫完全遵守）**：
- 不要新增 dependency / CDN / build step
- 不要改 package.json
- 不要刪除 `r2/` 整個資料夾
- 不要刪除 `assets/reference/`（位於 r2/assets/ 內）
- 不要重構核心 engine、不要改遊戲邏輯、不要改 UI 視覺
- 不要 commit / push
- 本輪只產生計畫 + 精準檔案操作列表 + 更新本文件，不執行任何覆蓋

### 盤點結果（必須先完成）

1. **r2/index.html 內所有相對路徑**  
   全部乾淨且一致（相對於 HTML 檔案）：
   - Preload / href: `./assets/backgrounds/LakeNightCamp_v2/bg_day_base.png`、`bg_night_base.png`
   - `./assets/platforms/LakeNightCamp_v2/magic_circle.png`
   - `./assets/characters/greyshade-cat/metadata/previews/greyshade-cat_idle_calm_preview.png`
   - `./styles.css`
   - `<script type="module" src="./src/app.js">`
   - Pixi: 外部 CDN（`https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/...`）—— 已存在，非本次新增。

2. **r2/styles.css 內所有 asset url**  
   - `--asset-bg-lake: url("./assets/backgrounds/LakeNightCamp_v2/bg_night_base.png");`
   - `background-image: url("./assets/characters/greyshade-cat/metadata/previews/greyshade-cat_idle_calm_preview.png");`（少數規則）
   - 其餘皆為 gradient / var() / 純色，無其他硬編檔名。

3. **r2/src/** import 路徑**  
   全部相對路徑，規律一致：
   - 頂層（如 app.js、audioManager）：`./engine/xxx.js`、`./data/xxx.js`、`./ui/xxx.js`、`./pixi/xxx.js`、`./state/xxx.js`、`./utils/xxx.js`、`./audio/xxx.js`、`./tools/xxx.js`
   - 子資料夾：`../data/yyy.js`、`../utils/zzz.js`、`../engine/aaa.js`
   - 重度依賴 `r2/src/data/` 下的檔案（見第4點）。

4. **r2/data/** 是否被引用**  
   - `r2/data/` 目錄下**只有** `creatures.json`。
   - 目前 r2/src 主要使用 `src/data/` 下的 registry/manifest（companionRegistry、explorationNodes、enemyRegistry、assetManifest、emotionDictionary、soulTalkResponsePacks、evolutionLines、sceneLayout、safetyShieldDictionary）。
   - `creatures.json` 在 r2 當前 bootstrap 中引用極少（多已被 companionRegistry 取代）。可視為相容性/遺留。

5. **r2/assets/** 是否被引用**  
   是，大量引用：
   - 透過 `src/data/assetManifest.js`（backgrounds、platforms、props、audio、characters greyshadeCat/flametailFox 的 animations 路徑）
   - r2/index.html 中的 preload
   - r2/styles.css 中的 url()
   - pixiApp.js、companionRenderer.js、spriteSheetAnimationLoader.js、audioManager.js 等多處載入。
   - 關鍵子路徑：`LakeNightCamp_v2/`、`greyshade-cat/`（含 metadata/animations.json + spritesheets）、`audio/`、`props/`、`platforms/`。

6. **root 目前 index.html / styles.css / src / data / assets 與 r2 對應差異**  
   - `index.html`：launcher vs 完整 R2 遊戲殼（含 map/battle/companionSelect/codex panels）
   - `styles.css`：舊 R1 token 與 `--asset-bg-lake` 定義 vs R2 版
   - `src/`：舊版不完整子集（缺少 battleEngine、explorationEngine、mapController、battleController、companionSelectController、codexController 以及較豐富的 src/data/ 與 engine） vs 完整 R2 版
   - `data/`：root 只有 creatures.json；r2 主要資料在 src/data/
   - `assets/`：root 有較多原始/未處理版本（flametail 完整 frames 等）；r2/assets/ 是當前 R2 使用的 processed 版本（尤其是 greyshade-cat）
   - 其他：STORAGE_KEY 不同（見第7點）

7. **localStorage key 是否仍維持 nexusLinkR2State:v1**  
   - r2（欲推廣的版本）：`STORAGE_KEY = "nexusLinkR2State:v1"`（位於 `r2/src/state/saveManager.js`）
   - 目前 root：`"nexusLinkPrototypeState:v2"`
   - r2 的 saveManager 有 legacy fallback（會讀取舊的 "nexusLinkPrototypeState" / "nexusLinkState"）。
   - 硬推廣後，主 `/` 將使用 `nexusLinkR2State:v1` 作為主要存檔 key。

8. **`/r2/` 是否要保留原樣可開**  
   **是**。必須 100% 保留 `r2/` 資料夾不動，讓 `/r2/` 繼續作為獨立、可完整運行的 Lab / 備份 / 實驗入口。所有其內部 `./` 相對路徑會讓它與 root 層級的檔案完全隔離。

### 兩個方案比較

**方案 A（Soft Promotion）**  
- root `index.html` 維持或優化 launcher，自動或手動導向 `/r2/`。
- 優點：改動極少、風險最低、rollback 極簡單。
- 缺點：主網址 `/` 本身不直接顯示 R2 內容（與「Hard Promotion」目標不符）。

**方案 B（Hard Promotion）** —— 使用者目前偏好  
- 把 r2 runtime **複製** 到 root 層級，讓 `/` 真正載入並執行目前的 R2 程式碼與素材。
- `/r2/` 保持原樣獨立運作。
- 這是本計畫主要描述的方案。

### 方案 B 精準檔案操作計畫（僅計畫，尚未執行）

**會修改的檔案**（執行前先建立本地 .bak）：
- `index.html`（把 launcher 內容替換成 r2/index.html 的內容）
- `styles.css`（替換成 r2/styles.css 的內容）

**會複製（duplicate）的檔案/目錄**（從 r2/ 複製到 root 對應位置，不移動）：
- `r2/index.html` → `index.html`
- `r2/styles.css` → `styles.css`
- 整個 `r2/src/` 樹狀 → `src/`（這會帶入完整的 R2 engine、ui controllers、src/data/ manifests）
- `r2/data/creatures.json` → `data/creatures.json`（若仍需相容）
- `r2/assets/` 中被引用的部分同步到 `assets/`：
  - `backgrounds/LakeNightCamp_v2/`
  - `platforms/LakeNightCamp_v2/`
  - `props/LakeNightCamp_v2/`
  - `audio/`
  - `characters/greyshade-cat/`（processed 版本，含 metadata/animations.json）
  - `flametail-fox.png`（若 manifest 引用）

**會保留的 root 舊檔 / 不動的東西**：
- 整個 `r2/` 資料夾（含 `r2/assets/reference/`、r2/docs/、r2/index.html 等）—— 完全不碰
- `docs/`、README.md、AGENTS.md、CLAUDE.md、tools/、scripts/、tmp/ 等
- root 內目前 assets/ 中**只有 root 擁有**的額外檔案（例如未處理的 flame-tail frames 等），除非它們與 r2 版本衝突才覆寫
- 任何不屬於 R2 runtime 的舊 root 檔案

**不會刪除任何檔案**：
- 明確不刪 `r2/`、不刪 `assets/reference/`（它在 r2/ 內）、不刪任何舊 root 檔案（只會有選擇性覆寫 + 先備份）。

**路徑如何修正**：
- **幾乎不需要修改任何內部路徑**。
- r2/index.html、r2/styles.css、r2/src/（含 assetManifest.js）裡的所有相對路徑都是 `./assets/...`、 `./src/...`、 `./data/...` 或 `../data/...`。
- 把對應目標放在 root 層級後，這些路徑自然解析到正確的 root 位置。
- `/r2/` 因為仍在子目錄內，其 `./` 仍解析到 `/r2/` 內部，完全不受影響。

** `/` 與 `/r2/` 如何同時保持可用**：
- `/` 使用 root 層級的複製檔（index + styles + src + data + assets）
- `/r2/` 使用完全未動過的 `r2/` 內原始檔（其 index.html 仍指向自己的 `./styles.css`、`./src/`、`./assets/`）
- 兩者獨立。即使之後只在 `r2/` 內做 Lab 實驗，主 `/` 仍維持推廣當時的 R2 快照，直到下一次手動 re-promote。

**Rollback 方式（本地，無需 commit）**：
- 執行任何覆寫前，先建立備份：
  - `index.html.bak`
  - `styles.css.bak`
  - `src-pre-promo/`（整個目錄複製）
  - `data-pre-promo/`
  - `assets-pre-promo/`（只複製即將被覆寫的子目錄）
- Rollback：直接把 .bak 還原即可。`r2/` 本身從頭到尾都沒動過，可隨時作為「目前 R2」的來源重新複製。
- 額外保險：`r2/` 目錄本身就是最好的 canonical source。

**其他注意事項**：
- 推廣後，主 `/` 的 localStorage 會使用 `nexusLinkR2State:v1`（有 legacy 回退）。
- Pixi 仍使用既有 CDN（已在 r2 內）。
- 完成後 `/` 將擁有完整的 R2 功能（地圖、戰鬥、夥伴切換、豐富資料等），`/r2/` 繼續作為獨立實驗區。

### 建議執行順序（確認後）

1. 使用者明確回覆「同意執行 Scheme B」或指定調整。
2. 先建立所有 .bak 備份（terminal 指令）。
3. 依上述列表複製/覆寫（可一次或分批）。
4. 本地用 `python -m http.server` 測試：
   - `/` 是否載入 R2 完整體驗（含地圖、戰鬥等）
   - `/r2/` 是否仍完全正常、獨立
   - console 無新錯誤
   - 存檔 key 正確
5. 如需，更新 README 簡短說明新定位（`/ = R2 主展示，/r2/ = Lab`）。

---

**本輪狀態**：僅產生計畫 + 更新本文件。**尚未執行任何檔案複製或覆寫**。

如需我現在就把以上計畫內容補充進本 markdown 檔案，或調整任何細節，請指示。等你確認後才會進行實際操作。

**原則**：
- 只做「讓定位正確」的最小必要調整。
- 優先修復入口與缺失的「穩定展示閉環」。
- 資料層（state/defaultState + engines）與渲染層（pixi + DOM controllers）保持分離。
- 任何新 UI 盡量複用現有 panelManager + actionSheet 模式，或極薄新增 DOM（不動現有 habitat）。
- root 負責 Stable，r2 負責 Lab（兩個 index 各自完整載入自己的 src/ + assets/）。

**建議順序（最小到較小）**：

1. **建立/輸出本報告**（已完成：寫入 `docs/R1_R2_POSITIONING_ANALYSIS.md`）。更新 README.md 簡短提及新定位（最小文字）。

2. **修復 root 入口，使 `/` 成為 R2 Demo Stable**（最高優先）：
   - 將 root `index.html` 改回（或建立）完整的 app-shell 遊戲殼（參考 r2/index.html 的結構，但只包含 root 目前支援的 panels：character、soulTalk、actionSheet）。
   - 載入 root `styles.css` + `<script type="module" src="./src/app.js">`。
   - 保留或移除 launcher 內的 auto-redirect（或改成小提示「R2 Lab 請前往 /r2/」）。
   - 目標：直接打開 `/` 就能看到 stable habitat + 四鈕 + 數值 + 存檔，作為可展示的 Demo。

3. **讓 r1 至少達到「可展示閉環」的最小補強**（不重構，只補薄層）：
   - 在 root 殼內加入極簡的「記憶回顧」入口（例如在 actionSheet memory 之後或 character modal 裡加一個小列表，讀 state.memories 渲染。純 DOM，無新 engine）。
   - 確認/補「星圖迴廊」至少有視覺回饋（目前只有記憶，可在 habitatTraceRenderer 或 action 後加簡單提示）。
   - 考慮把 r2 的 map/battle 視為「Lab 獨有」，r1 先不搬（或極簡 stub 一個「探索地圖（實驗中）」按鈕只開空 panel + 說明）。
   - 確保 localStorage 在 root 正常（已有）。

4. **強化 r2 作為 Lab 的可辨識度**（小調整）：
   - 在 r2/index.html 或 HUD 加明顯「R2 Lab / 阿兔實驗室」標記 + 版本提示。
   - 確保 devPanel / reset 容易從 UI 觸發（已接近）。
   - 可在 explore action 增加更多實驗性選項（只動 r2 版 actionSheet meta）。

5. **資料與渲染分離確認 + 清理**（觀察期）：
   - 確認 root app.js / controllers 只操作 store + engine，不在 ticker 裡放業務決策（目前大致 ok）。
   - 長期可考慮把 root/src 明確當「stable core」，r2/src 為「+ lab extensions」，但**現在不要動大量檔案複製或刪除**。

6. **驗證與文件**：
   - 本地 python server 測試 `/` 看到 stable habitat + 四鈕有效、存檔正常；`/r2/` 看到 Lab 地圖/戰鬥。
   - 更新 GitHub Pages 預期行為說明。
   - 在 docs/ 內補充「R1 穩定展示 checklist」與「R2 Lab 實驗項目」清單（從現有 R2_*.md 抽取）。

**不做的事（本次）**：
- 不把 r2 功能大量搬回 root。
- 不重寫四鈕為獨立頁面（除非極薄）。
- 不碰 Pixi ticker 裡塞新邏輯。
- 不新增任何 framework / backend。
- 不刪除任何檔案（只標記）。
- 不改變現有 habitat 視覺（除非 launcher 調整）。

---

## 七、風險與注意

- 目前 root index 是 launcher，**直接影響「r1 作為 Stable Demo」展示**。這是本次最該先修的點。
- root/src 與 r2/src 重複度高，未來任何 bug 修復或功能穩定化都需要小心同步（建議以 root 為 stable 來源，實驗先在 r2 做，成熟後最小 diff 回流）。
- memories 系統其實已經相當完整（dedupe、emotional 版、trace 視覺化），只是缺少玩家可見的「記憶列表」入口，這是低成本就能補強「閉環」的點。
- Git 狀態：launcher 變更是最近的；r2 內部有 pre-existing 修改。任何後續 commit 都要明確說明「R1 stable entry 修復」或「Lab 標記」。

---

**下一步行動建議**：先確認本報告內容與定位定義是否符合預期。確認後，再以「最小必要」方式執行第 2 點（root 入口恢復為 stable demo 殼），並以另一份小 PR / commit 補充記憶列表薄層等。所有變更都將先經過盤點與限制檢查。

此報告純分析 + 計畫，**未對現有程式碼進行破壞性覆寫**。所有原始檔案結構與邏輯保持原狀（除先前 launcher 外）。

---

**參考檔案**（盤點時讀取）：
- root/src/app.js, actionSheetController.js, actionEffectEngine.js, defaultState.js, hudController.js, panelManager.js
- r2/src/app.js（完整版）、同上 + mapController.js、battleController.js、explorationNodes.js、r2 defaultState/store
- r2/index.html（完整殼與 panels）
- 兩邊 creatures.json、assets 結構、docs/ 多份

如需更細的某檔案 diff 或特定 engine 追蹤，再提供指示。