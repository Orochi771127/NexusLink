# CLAUDE.md — Nexus Link 開發憲法（給 Claude Fable 5 / Claude Code）

> 這是你進入 Nexus Link repo 後最先讀、且優先級最高的文件。
> 它定義三件事：（1）哪些是不可動的地基；（2）哪些是被授權的體驗層；（3）這個專案存在的意義（情感契約與安全紅線）。
> 本檔取代舊版 CLAUDE.md。舊版把「技術保守」與「體驗野心保守」綁死，導致體驗層被當成維護工程在做。本版把兩者解綁。

---

## 0. 一句話定位

**Nexus Link / 心核連結是一款情緒棲地型 AI 夥伴養成遊戲。**

> 這不是電子寵物。這是你的夥伴。

夥伴有情緒沉積、記憶痕跡、棲地狀態、**會用身體語言說不**的邊界，並因玩家的行為而真實、且部分不可逆地改變。

美學：**Cyber-Taoism / 賽博道教**——科技光效 × 道家靜謐，湖畔、月光、魔法陣、情緒漣漪、痕跡與留白。

不可退化成：系統公告機、無腦順從的寵物模板、普通 RPG 打怪、純聊天室。

每一個設計決定都必須通過這個測試：**「這讓夥伴更像一個有自己邊界的生命，還是更扁平？」**

---

## 1. 三條核心情感契約（最高憲法，任何程式碼不得違反）

這三條凌駕一切功能需求。任何讓夥伴違反這三條的修改，無論多「好玩」，一律不做。

1. **牠會記得你，但牠不屬於你。** —— 記憶與痕跡只增不可被玩家任意抹除以「重來」；夥伴不是玩家的所有物。
2. **牠會靠近你，但不會吞掉你。** —— 夥伴有主體性，會留白、會「敢於無聊」，不無限迎合、不情緒勒索玩家。
3. **你能影響牠，但不能支配牠。** —— 玩家沒有「強制」按鈕（強制進化、強制服從、強制親密皆禁）。影響是過程，不是指令。

---

## 2. 七條安全紅線（違反即為嚴重缺陷，優先級高於任何功能）

1. **不做依賴偵測驅動的行為。** 任何 `safetyMode` / `safeHarborMode` / 保護行為，只能由**夥伴自身狀態**（情緒輸入、能量、邊界）驅動，**絕不可**由「偵測到玩家依賴/上線頻率/孤獨程度」驅動。後者等於在依附對象上製造拒絕，對脆弱玩家有再創傷化風險。
2. **不做無法挽回的壞結局。** 心核裂變（Shadow Evolution）等高張力事件，其修復路徑必須**確定可達、不可失敗**。
3. **裂變的「好意造成傷害」必須由劇情逼出，不是玩家自找。** 玩家不該因為「手賤」被懲罰；傷害的來源是遊戲設計的兩難，不是玩家的錯。
4. **修復後夥伴必須明確傳達「那不是你的錯，我們一起活下來了」。** 這句話改寫的是毒性核心信念，是整個機制存在的意義。
5. **永遠給走不過去的人真實出口。** 高張力事件中，夥伴要能說出類似「如果太重了，你可以先離開」，且該出口真的有效。
6. **不製造 FOMO / 紅點 / 任務壓迫 / 上線打卡焦慮。** 留白與「敢於無聊」是特性，不是待修的 bug。
7. **自我傷害類輸入（safetyShield 命中）只觸發系統級求助訊息，不可變成 gameplay 獎勵或夥伴的角色扮演素材。**

> 這七條對應 Design Bible 第四部（安全層）。施工時若某個需求與紅線衝突，停下來回報，不要自行「想辦法繞過」。

---

## 3. 技術邊界（硬限制，永不放寬）

### 允許
- HTML（單頁 `index.html`）
- CSS（`styles.css`，純 CSS，無預處理器）
- Vanilla JavaScript（ES Modules，無 bundler，無 build step）
- PixiJS v8（CDN：`pixi.js@8.8.1`，全域 `window.PIXI`）
- localStorage（集中於 `src/state/saveManager.js`）
- GitHub Pages（純靜態部署）

### 絕對禁止引入
- React / Vue / Svelte 或任何前端框架
- TypeScript
- Tailwind 或任何 CSS 框架
- 後端伺服器 / API 服務 / 資料庫（SQL / NoSQL / Firebase）
- LLM API（OpenAI / Anthropic / Gemini）—— Soul Talk 現階段是規則式回應池，不是真 LLM
- npm 套件（除非 human 明確要求並確認）
- 任何需要 build step 的工具鏈（Vite / Webpack / Rollup）

---

## 4. 架構規範（解耦三層，不可破壞）

### 渲染分層
- **PixiJS canvas**（`src/pixi/`）：背景、天體、平台、角色、粒子、棲地痕跡、特效。
- **DOM UI**（`src/ui/` + `styles.css`）：HUD、面板、對話框、導覽、戰鬥/地圖/圖鑑 modal。

### 解耦原則（硬規則）
- **UI 不可直接操作 Pixi 容器**；**Pixi 不可直接操作 DOM**。
- 跨層通訊只能透過 `src/utils/eventBus.js` 或 store 訂閱。
- State 變更一律透過 `src/state/store.js` 的 `setState` / `updateState` / `replaceState`，禁止直接 mutate state 物件。

### 效能規範
- Ticker 內禁止昂貴操作（DOM 查詢、大量 JSON parse、fetch、每幀 new/destroy 物件）。
- Texture 必須透過 `PIXI.Assets.load()` 快取。
- 像素角色：`scaleMode = 'nearest'`，座標 `Math.round()` 整數 snap，禁止亞像素模糊。
- 既有的 object pool（營火 spark）、resize RAF 節流、WebGL context guard 不可拆除。

### localStorage 規範（注意：key 已更新）
- 所有寫入集中在 `src/state/saveManager.js`。
- **`STORAGE_KEY = "nexusLinkR2State:v1"`**（這是當前正確的 key）。
- legacy fallback：`nexusLinkPrototypeState`、`nexusLinkState`（唯讀回退，不可寫入）。
- 禁止在其他模組直接呼叫 `localStorage.setItem`。

---

## 5. 修改授權分級（本檔核心：解綁緊箍咒）

舊版對「所有檔案」一律要求「最小必要 / 禁止重構 / 凡事等確認」。
本版改為**依層級分級**：地基層維持高度保守；體驗層明文授權連續施工。

### 5.1 地基層（GROUNDWORK）— 維持嚴格保守
未經 human 明確逐項確認，**不得**修改下列檔案；變更前必須說明影響與 migration 風險：

- `index.html`（DOM 結構被全體 JS 依賴）
- `src/state/saveManager.js`（STORAGE_KEY 與存檔格式）
- `src/state/store.js` 的 `normalizeState`（影響存檔相容性）
- `src/state/defaultState.js`（新增欄位需評估舊存檔 migration）
- `src/pixi/pixiApp.js`（Pixi 核心 layer 架構）
- `assets/**`（二進位資源，刪除/改名不可逆）
- `tools/**`、`scripts/**`（離線 sprite pipeline）

地基層的規則沿用舊流程：讀取 → 列計畫 → **等 human 確認** → 最小必要修改 → 列 changed files → 給測試法。

### 5.2 體驗層（EXPERIENCE）— 明文授權，連續施工
下列工作**被授權**進行有設計野心的實作、重構與擴充，不需要把每一個檔案的每一行都拆成獨立確認。
這些檔案就是要被大膽改寫成「有靈魂」的樣子：

- 戰鬥情緒對峙改造：`src/engine/battleEngine.js`、`src/ui/battleController.js`、相關 `styles.css` 區塊、`index.html` 的 `battle-modal` 內容**文案/結構**（結構若動到要回報，見 5.1）
- Soul Talk 升級：`src/ui/soulTalkController.js`、`src/engine/soulTalkComposer.js`、`src/data/soulTalkResponsePacks.js`
- 邊界 / 人格系統深化：`src/ui/hudController.js`（boundary view）、`src/engine/companionPersonality.js`、`src/engine/touchReactionEngine.js`、`src/engine/animationProfile.js`
- 星圖 / 探索內容填充：`src/ui/mapController.js`、`src/data/explorationNodes.js`、`src/engine/explorationEngine.js`
- 記憶 / 痕跡表現：`src/engine/memoryLifecycleEngine.js`、`src/engine/traceVisualMapper.js`、`src/pixi/habitatTraceRenderer.js`
- 圖鑑 / 夥伴切換 / 行動：`src/ui/codexController.js`、`src/ui/companionSelectController.js`、`src/ui/actionSheetController.js`、`src/engine/actionEffectEngine.js`
- VFX / 動效 / 玻璃感 polish：`styles.css` 的非地基區塊、`src/pixi/` 的特效（非 `pixiApp.js` 核心 layer）

### 5.3 體驗層的開工協定（A 檔：保留把關感）
體驗層雖被授權，但**每個 TASK_PACK 開工前**仍須：
1. 回報「我要做哪個系統、預期改哪些檔案、預期效果、有沒有碰到 5.1 地基」。
2. 等 human 點頭。
3. 然後可在該 TASK_PACK 範圍內**連續施工到完成**，不必每改一個檔案就停。
4. 完成後列 changed files + 手動測試法 + 對照 `ACCEPTANCE.md` 自評。

> 一句話：**地基要逐項問；體驗層問一次（開工計畫），然後一路做完。**

---

## 6. 兩個指定優先改造項（帶警語）

### 6.1 `battleEngine.js` + `battleController.js` — 需「體質改造」，非調參
**現況問題**：目前是普通 RPG 打怪——`basic_attack`、敵我 HP bar、HP 歸零判勝負（見 `index.html` battle-modal 的 `data-skill="basic_attack"`、`battle-enemy-hp`）。這**違反** Bible：Nexus Link 的「對峙」不是把對方血條清零。

**改造方向**（情緒對峙，非消滅敵人）：對峙的目標應是**穩定心核 / 建立邊界 / 回收記憶**之類的情緒性結算，而非 enemy HP→0。`resonance`（情感共鳴）已是對的方向，`basic_attack`（直覺爪擊）是要被重新定義的舊骨。retreat（先撤退）「懂得離開也是照顧」的設計是對的，保留。勝負回饋必須「勝不驕、敗不罰」（`summarizeBattleOutcome` 已是對的基調，延續它）。

**警語**：這是一次**體質改造**，會動到 engine 的核心迴圈與 controller 的渲染，屬於「授權的大改」，但因為它同時牽涉 `index.html` 的 battle-modal **結構**，所以開工計畫要明確標出哪些是純體驗層、哪些觸及 5.1，分開確認。

### 6.2 `safeHarborMode.js` + `emotionalSedimentationEngine.js` — 需安全審查，動前先讀紅線
**現況**：`safeHarborMode` 目前由情緒輸入 / safetyShield 命中驅動（符合紅線 1，這是對的，不要改壞）。`buildSafetyShieldReply` 提供現實求助導引（符合紅線 7）。

**警語**：這兩個檔案是安全層的核心。任何修改前**必須重讀本檔第 2 節七條紅線**，並在開工計畫中逐條聲明「本次修改不違反紅線 1（不引入依賴偵測）、不違反紅線 7（不把求助訊息變獎勵）」。
- 嚴禁新增任何「偵測玩家上線頻率 / 孤獨 / 依賴程度」來觸發行為的邏輯。
- 嚴禁把 safetyShield 的求助文案改成夥伴角色扮演或 gameplay 獎勵。
- `safetyShieldDictionary.js` 的關鍵字清單若要動，視同安全層變更，需 human 確認。

---

## 7. 角色 Tier（runtime 邊界）

| Tier | 角色 | ID | 規則 |
|------|------|-----|------|
| 1 Active Runtime | 灰影貓 | `greyshade-cat` | 唯一 runtime 主夥伴，完整 spritesheet，P1 主線 |
| 2 Legacy/Fallback | 焰尾狐 | `flametail-fox` | 已登錄、僅靜態圖，非優先，不可擅自升級為完整動畫 |
| 3 Roadmap | 雷霆幼狼 `thunder-pup` / 星能小山豬 `star-energy-boarlet` | 不可進 runtime、不可觸發多角色隊伍系統 |

註：`companionRegistry.js` 已含水晶海馬、青葉麋鹿等 placeholder 角色作圖鑑展示用，屬已存在設計，非本檔需新增。不可因圖鑑存在就把它們升級成 runtime 主夥伴。

---

## 8. 廢棄檔案（LOCKED，保留勿刪）

下列檔案**未被 `index.html` 引用**，但**刻意保留**，任何情況不得刪除或修改：

- `main.js` —— 早期 800×450 falling-dots prototype，歷史參考。
- `style.css` —— 早期 CSS（active CSS 是 `styles.css`）。
- `script.js` —— stub，僅供 `node --check script.js` 通過 CI 驗證。**刪了會破壞 static check gate。**

> 上一輪曾誤判這三者「可安全刪除」。糾正：它們是 LOCKED，留著。

---

## 9. 關鍵檔案索引（與實際 repo 對齊）

| 類別 | 檔案 |
|------|------|
| 入口 | `index.html` ・ `src/app.js` |
| State | `store.js` ・ `saveManager.js`（key=`nexusLinkR2State:v1`）・ `saveQueue.js` ・ `defaultState.js` |
| 邊界/觸碰 | `touchReactionEngine.js` ・ `interactionController.js` ・ `hudController.js`(boundary view) |
| 情緒沉積 | `emotionalSedimentationEngine.js` ・ `memoryLifecycleEngine.js` ・ `safeHarborMode.js` |
| 痕跡 | `habitatTraceEngine.js` ・ `traceVisualMapper.js` ・ `habitatTraceRenderer.js` |
| Soul Talk | `soulTalkController.js` ・ `soulTalkComposer.js` ・ `soulTalkResponsePacks.js` |
| 戰鬥（待改造）| `battleEngine.js` ・ `battleController.js` ・ `enemyRegistry.js` |
| 探索 | `mapController.js` ・ `explorationEngine.js` ・ `explorationNodes.js` |
| Pixi 核心 | `pixiApp.js`(LOCKED 級) ・ `companionRenderer.js` ・ `spriteSheetAnimationLoader.js` ・ `motionController.js` |
| 人格 | `companionPersonality.js` ・ `personalityProfile.js` ・ `animationProfile.js` |
| 資料 | `companionRegistry.js` ・ `evolutionLines.js` ・ `emotionDictionary.js` ・ `safetyShieldDictionary.js` |

---

## 10. 通用禁令

- 未經 human 明確指示，不可 `git commit` / `git push`。
- 不可自動刪除任何資產或 LOCKED 檔案。
- 不可引入新依賴。
- 不可繞過紅線「想辦法達成需求」——遇衝突就停下回報。
- 不可把對話框內的口頭授權擴大解讀成跨 session 的長期授權；每個 TASK_PACK 重新確認。
