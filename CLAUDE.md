# CLAUDE.md — Nexus Link Web Repo Operating Constitution

這是 Nexus Link **Web 版本專案**的最高行為與技術準則（System Prompt / Constitution）。
請注意，本文件為 Web Repo 限定。關於跨運行時（Unity / Blender）之規範，請參見 `docs/architecture/NEXUS_LINK_MULTI_RUNTIME_TECHNICAL_CONSTITUTION.md`。

> 本檔服從 `NEXUS_LINK_MASTER_CANON_v3.1.md`（最高戰略上位法）。若有衝突，以 `NEXUS_LINK_MASTER_CANON_v3.1.md` 為準。
> 這是你進入 Nexus Link repo 後最先讀的協作入口文件。
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

### 0.1 RaphaelCore / Companion Shell

RaphaelCore 與角色外型解耦。RaphaelCore 是共用的心核大腦與人格憲法；不同 companion 是不同 shell、persona 旋鈕、語氣種子、身體語言與記憶偏好。

- 灰影貓是第一個已驗證 runtime 載體與首輪焦點，不是 RaphaelCore 本體，也不是永久唯一中心。
- 新角色不應複製一套心核腦；應在共用 RaphaelCore 下調整溫度、戒心、拒絕門檻、疲勞敏感度、沉默方式、修復方式與冒險傾向。
- 所有角色都必須保留拒絕能力；高 bond 不解除邊界。
- RaphaelCore is a Stateful Companion Cognition Agent: safety-gated, memory-bearing, boundary-aware, companion-agnostic, and game-integrated. It is not an autonomous task agent, web-search/tool agent, therapy/crisis agent, customer-service assistant, sycophantic chatbot, or generic NPC dialogue bot.
- Gateway / LangGraph / training bundles may advise or route, but cannot override RaphaelCore safety, boundary, memory, state delta, response policy, or companion shell boundaries.
- **現行接線（2026-07-16）**：`soulTalkController.js` 直接呼叫 `src/ai/raphaelCore.js` 的 `runRaphaelCore()`，再以 `applyRaphaelCoreResult()` 套用合法輸出；`PersonaConstitution.js` 與 `constitutionCritic.js` 已在此管線中生效。這不是外部 LLM。
- **遠征例外**：Expedition 只有 result event、第一人稱 composer、lite critic 與專用 memory gateway；`coreIntegrated:false`，不可描述為 RaphaelCore 完整整合或商業主玩法。

---

## 0.5 當前階段：Pre-Commercial Vertical Slice（商業化前垂直切片期）

**本階段目標 = first-session coherence（首輪體驗的連貫），不是 feature accumulation（堆功能）。**

不是繼續往上加系統，而是讓一個陌生玩家在第一次進入時，能在心裡回答這五件事：

- **我是誰** —— 玩家在這個世界裡的位置。
- **牠是誰** —— Initial Bond 選定的夥伴不是寵物，是有自己邊界的生命。
- **現在要做什麼** —— 當下這一步的方向。
- **做完後世界有什麼變化** —— 我的行為在棲地留下了什麼。
- **明天為什麼值得回來** —— 回來的理由是溫柔的牽掛，不是打卡焦慮。

> 凡是不服務「首輪連貫」的功能，本階段一律延後。商業化前，先把「第一次見面」做對。

### 0.5.1 First Session Flow（當前產品優先級）

當前產品主線是 First Session Flow（新玩家首次體驗），十拍序列：

`Boot Splash → Local Player Identity → Prologue → Heart-Core Guidance（心核引導）→ Initial Bond → First Touch → First Soul Talk → First Trace → Safe Moonlake Exploration → Return Echo`

Initial Bond 已接入：fresh save 固定呈現 `greyshade-cat` / `blazetail-kit` / `crystalfin-seahorse` 三選一，選定後只保留選定者；veteran 存檔保留既有解鎖。後續工作是硬化首次安全探索與 D2 安全終端，不是再建一套平行 onboarding。

設計原則（每一拍都要通過）：

- 這**不是**寵物養成教學（pet tutorial）。
- 這**不是**純聊天機器人式 onboarding。
- 這**不是**普通 RPG 任務式 onboarding。
- 夥伴**有自己的邊界**；首次互動不得腳本式強制夥伴接受。
- 棲地**會記住情緒痕跡**；玩家的第一個情緒會在湖邊留下微光。
- 玩家**能影響、不能支配**夥伴（延續契約三）。
- Heart-Core Guidance（心核引導）**不是任務欄**：不得有 FOMO / 紅點 / 倒數 / 連續登入 / 未完成焦慮（**直接對應第 2 節紅線 6**）。

> First Session Flow 的可驗收對照見 `ACCEPTANCE.md` 新增的 §K；其 state 地基注意事項見本檔 §5.1。

### 0.6 商業版擴充方向（上架後可逐步開）

- 商業版賣章節、棲地、音樂、故事與新相遇；不做抽卡、稀有度、角色皮膚商城或戰力禮包。
- 付費章節包可帶來新 companion，但玩家買的是相遇篇章與內容，不是角色所有權。
- 棲地日常仍以一位 active companion 為情感主體；切換或再遇見必須是敘事行為，不是快捷換皮。
- 【2026-07-06 Owner 修訂，見 Master Canon §1.3.1】對峙可組**共鳴圈**（最多三隻已結緣夥伴同場）；夥伴加入採意願制（章節通關後由牠依關係狀態決定）；非戰力隊伍約束照舊。詳見 `docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md`。
- **旅痕**是未來系統：玩家離線或未開遊戲時，夥伴可獨自或與已相遇夥伴短程外出；玩家回來時收到簡短旅途回報、記憶痕跡或棲地變化。旅痕不得變成登入獎勵、每日派遣、離線收益農場或「你錯過了」。
- 組隊戰鬥／同行冒險可作未來章節後期擴充，但必須服務角色關係與旅途記憶，不得做輸出排行、屬性刷關、農裝或必派遣。

---

## 1. 三條核心情感契約（任何程式碼不得違反）

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

> 這七條對應 `NEXUS_LINK_MASTER_CANON_v3.1.md` 的安全層（整合自 legacy Design Bible 第四部）。施工時若某個需求與紅線衝突，停下來回報，不要自行「想辦法繞過」。

---

## 3. 技術邊界（硬限制；受控例外須由 Owner 明文修訂）

### 1. 核心技術棧與禁令
- **絕對禁止**：未經 Human 核准的框架（React / Vue / Svelte）、TypeScript、Node.js 依賴（npm install）擴張。
- **允許清單**：Vanilla JavaScript (ES Modules)、HTML5、CSS3、DOM 操作、Canvas API、PixiJS、Three.js、GLB / glTF。
- **跨運行時邊界**：「無構建步驟（Zero-build）」與「禁止 Bundler」僅約束 Web current runtime。Unity is an approved and existing parallel native habitat loadable greybox scene / tool-validation prototype and target runtime. Its current implementation maturity must be described from the Unity repository evidence; it is not yet the complete production game unless the repository proves otherwise。
- **渲染分層**：PixiJS 不再被描述為唯一 renderer；PixiJS 繼續負責 2D、角色、特效或 legacy layer。Three.js／GLB 3D habitat 是經核准的 Web runtime 能力。Moonlake 3D Source v2 is the canonical scene-authoring workspace. Web `assets/3d/moonlake` contains runtime-exported or candidate assets and is not the complete source workspace.
- **架構本質**：Web Repo 是一個打開 `index.html`（或經簡易 local server）就能直接運行的前端遊戲，並保留向後兼容性。不得藉此授權 React、TS、npm 擴張。
- localStorage（集中於 `src/state/saveManager.js`）
- GitHub Pages（純靜態部署）

### 絕對禁止引入
- React / Vue / Svelte 或任何前端框架
- React Three Fiber 或其他框架式 3D renderer
- TypeScript
- Tailwind 或任何 CSS 框架
- 後端伺服器 / API 服務 / 資料庫（SQL / NoSQL / Firebase）
- LLM API（OpenAI / Anthropic / Gemini）—— Soul Talk 現階段是規則式回應池，不是真 LLM
- npm 套件（除非 human 明確要求並確認）
- 任何需要 build step 的工具鏈（Vite / Webpack / Rollup）

---

## 4. 架構規範（解耦三層，不可破壞）

### 渲染分層
- **Three.js habitat canvas**（`src/three/`）：僅在核准的 Moonlake Live 3D Hybrid 啟用；3D 場景、GLB、光照、瀑布／水面、風吹植被、天氣與 world-to-screen 投影。
- **PixiJS canvas**（`src/pixi/`）：2D illustrated companion、棲地痕跡、互動特效、非 3D habitat 的既有背景與其他 Pixi 頁面。
- **DOM UI**（`src/ui/` + `styles.css`）：HUD、面板、對話框、導覽、戰鬥/地圖/圖鑑 modal。

### 解耦原則（硬規則）
- **UI 不可直接操作 Pixi／Three 容器**；**Pixi／Three 不可直接操作 DOM UI**。
- 跨層通訊只能透過 `src/utils/eventBus.js` 或 store 訂閱。
- Three.js 不得持有或改寫 save、relationship、Growth、Safety、RaphaelCore、battle 或 reward authority；場景可視狀態只接受現有 environment state 的唯讀投影。
- State 變更一律透過 `src/state/store.js` 的 `setState` / `updateState` / `replaceState`，禁止直接 mutate state 物件。

### 效能規範
- Ticker 內禁止昂貴操作（DOM 查詢、大量 JSON parse、fetch、每幀 new/destroy 物件）。
- Texture 必須透過 `PIXI.Assets.load()` 快取。
- Illustrated companion texture 應使用 linear sampling + mipmaps；清晰度來自 512 高解析母版縮小顯示，不再用 nearest-neighbor 製造 pixel-perfect 銳利感。
- Companion 最終螢幕位置仍必須 snap，並維持 bottom-center baseline，避免動畫切換時腳底滑動。
- Runtime 可以使用 downscaled export，不代表所有動畫永遠都要全載 512；必須控制同時載入的 sheet 數量，避免 mobile GPU memory 壓力。
- 既有的 object pool（營火 spark）、resize RAF 節流、WebGL context guard 不可拆除。

### Companion 美術規格（root 主版本）
- 新 companion 預設為 illustrated / painterly / high-detail，不是 chunky pixel art，也不是 nearest-neighbor pixel-perfect pipeline。
- 新 companion master frame 必須是 `512×512 px`，final runtime asset 必須是 transparent PNG。
- Frame 內不可 baked-in 白底、UI、文字、場景、展示台、圖鑑框；只保留乾淨角色本體。
- Companion anchor = bottom-center（概念上 `x: 0.5, y: 1`）；final on-screen position snap 必須保留。
- Sprite sheet 任一邊必須 `<= 4096 px`；frame grid 必須整除：`sheet_width / cols` 與 `sheet_height / rows` 都必須是整數。
- Scale 必須以 `frameHeight` 計算，不可用整張 `sheetHeight` 計算。
- `greyshade-cat` 現有 443/444 frame 是 legacy accepted；不得為了符合 512 規格而 upscale。
  - **調和（灰影貓替換）**：上述 legacy 灰影貓圖維持 **reference / art canon**，永遠不得 upscale；即將接入的新 runtime 灰影貓是**全新生成的 `512×512` illustrated 圖**，**不是** 443/444 legacy 的放大。兩者為不同來源的資產，新版上線不改寫本條對 legacy 的保護。
- 既有 pixel-style concept sheets、舊圖鑑、64 PPU、96px 標記圖保留為 design reference / art canon；舊設定圖不可直接視為廢棄，也不可直接視為 runtime companion sprite。
- 若要實裝舊設計，必須依該設計重新輸出 clean `512×512` transparent companion frame。

### Greyshade Cat Replacement Protocol（灰影貓 runtime 替換協定）
- 灰影貓（`greyshade-cat`）維持 fresh save 的 **default / 壞資料 fallback**；完成 Initial Bond 後，active companion 以玩家選定者為準。美術替換不得暗中改變此選定結果。
- 新 illustrated `512×512` 動畫資產的目標，是**取代 legacy 64×64 runtime set**；採「先並存、後退役」。
- **舊 Greyshade runtime 資產在 reference audit 通過前不得刪除**；退役是獨立、gated 的後續步驟，並保留一個 release 供 git revert rollback。
- 灰影貓**絕不可 fallback 到焰尾狐（Flametail Fox）或任何其他角色美術**；缺動畫時只能走自身 manifest 的 documented fallback chain（見 `animationProfile.js`），不得借用他角資產。
- `assets/**`（含 `animations.json` 與 spritesheets）屬 **GROUNDWORK**：替換前必須列計畫並等 human approval（見 §5.1）。
- 替換的核心風險是**動畫 ID 詞彙對映**：新檔名用 guardian 詞彙（`walk_right` / `faint` / `skill_cast`…），但 runtime / intent 層期望既有 key（`right_walk` / `defeated` / `attack_basic`…）。新 `animations.json` 的 **key 必須沿用程式期望詞彙、指向新檔**；對映錯誤不會 crash，而會靜默 fallback 到 `idle_calm`。
- 可驗收對照見 `ACCEPTANCE.md` 新增的 §J。

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

> **First Session Flow 地基注意**：新增 `playerProfile` / `onboarding` 等欄位會同時動到 `src/state/defaultState.js` 與 `src/state/store.js` 的 `normalizeState`，屬本層 GROUNDWORK。施工時必須：（a）為巢狀物件加 `normalizePlayerProfile()` / `normalizeOnboarding()`（仿既有 `normalizeBattleRecord`），讓 partial / 舊存檔安全回填——`normalizeState` 是淺層 merge，巢狀物件不會自動 deep-merge；（b）加 **veteran-save heuristic**，讓既有有遊玩痕跡的存檔**跳過 onboarding**，而不是被當新玩家重跑；（c）**不得新增 localStorage key**，identity 一律存在既有 `STORAGE_KEY = "nexusLinkR2State:v1"` 之內。

### 5.2 體驗層（EXPERIENCE）— 明文授權，連續施工
下列工作**被授權**進行有設計野心的實作、重構與擴充，不需要把每一個檔案的每一行都拆成獨立確認。
這些檔案就是要被大膽改寫成「有靈魂」的樣子：

- 情緒對峙深化：`src/engine/battleEngine.js`、`src/ui/battleController.js`、相關 `styles.css` 區塊、`index.html` 的 `battle-modal` 內容**文案/結構**（結構若動到要回報，見 5.1）。現行玩家契約已是穩定裂隙而非 HP 歸零；`battleRecord.wins/losses` 僅是 compatibility-only schema。
- Soul Talk 升級：`src/ui/soulTalkController.js`、`src/engine/soulTalkComposer.js`、`src/data/soulTalkResponsePacks.js`
- 邊界 / 人格系統深化：`src/ui/hudController.js`（boundary view）、`src/engine/companionPersonality.js`、`src/engine/touchReactionEngine.js`、`src/engine/animationProfile.js`
- 星圖 / 探索內容填充：`src/ui/mapController.js`、`src/data/explorationNodes.js`、`src/engine/explorationEngine.js`
- 記憶 / 痕跡表現：`src/engine/memoryLifecycleEngine.js`、`src/engine/traceVisualMapper.js`、`src/pixi/habitatTraceRenderer.js`
- 圖鑑 / 夥伴切換 / 行動：`src/ui/codexController.js`、`src/ui/companionSelectController.js`、`src/ui/actionSheetController.js`、`src/engine/actionEffectEngine.js`
- VFX / 動效 / 玻璃感 polish：`styles.css` 的非地基區塊、`src/pixi/` 的特效（非 `pixiApp.js` 核心 layer）

> **Companion Growth 路由**：任何心核夥伴養成、心相傾向、三階覺醒、Growth UI、Codex stage 或 evolved-form 工作，開工前必讀 `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`。該檔是設計／驗收 SSOT；G1／G2／G3 foundation 與 G3.1 Heart Phase care source 已接入，live source family 為 exploration／standoff／care。明示接受的 companion rewrite 可封存 consent anchor，但不依賴 standoff 的 readiness 路徑、G4 stage offer/advance 與 G5 正式資產仍未完成。不得把 G3／G3.1 說成完整覺醒玩法。

### 5.3 體驗層的開工協定（A 檔：保留把關感）
體驗層雖被授權，但**每個 TASK_PACK 開工前**仍須：
1. 回報「我要做哪個系統、預期改哪些檔案、預期效果、有沒有碰到 5.1 地基」。
2. 等 human 點頭。
3. 然後可在該 TASK_PACK 範圍內**連續施工到完成**，不必每改一個檔案就停。
4. 完成後列 changed files + 手動測試法 + 對照 `ACCEPTANCE.md` 自評。

> 一句話：**地基要逐項問；體驗層問一次（開工計畫），然後一路做完。**

---

## 6. 兩個指定優先改造項（帶警語）

### 6.1 `battleEngine.js` + `battleController.js` — 情緒對峙**已完成**，本輪為「深化」（非重做）
**現況（已更新 2026-07-03）**：情緒對峙改造**已完成並上線**，不是待辦。`battleEngine.js` 已是純函數的「穩住裂隙」模型——`noise / stability / sync / fatigue / boundary / shards` + 五行裂隙心相 + 四種**不懲罰**結局（stabilized / recovered / overwhelmed_but_safe / retreated），沒有 win/lose。`index.html` battle-modal 也已改為 `standoff-action-row` + `data-action-id="resonance|barrier|pulse|retreat"`（共鳴/邊界/脈衝/先撤退）；**舊的 `basic_attack`、`battle-enemy-hp` 標記已不存在**。
> ⚠️ 文件漂移修正：本節舊版仍寫「目前是普通 RPG 打怪、待體質改造」——那是過期敘述，程式早已改完。**不要據舊句去重做戰鬥或把它當未開發。**

**本輪方向＝加深，不是改造**：深度來自「敵人意圖可讀（telegraph）／裂隙相位弧／sync·fatigue 經濟張力／手感回饋」，**不是**加大傷害或掉寶。詳見 `plan`（roadmap B1–B4）與 `docs/design/BALANCE_SHEET.md` 第 2 節的常數。`resonance` 是主軸、`retreat`「懂得離開也是照顧」保留、`summarizeStandoffOutcome` 的「勝不驕、敗不罰」延續。

**玩家端用語規則（仍有效，續守）**：主名稱用「穩住裂隙」；狀態用「雜訊 / 心核穩定 / 記憶微光」；行動優先用「穩住 / 設界 / 共鳴 / 退一步」。不要把 UI 寫成攻擊、防禦、技能、傷害、擊敗、掉落。每個按鈕盡量 2–4 個字，每個說明盡量一句話。

**警語**：`battleEngine.js` 核心迴圈與 `battleController.js` 渲染屬**授權的體驗層大改**（§5.2）。battle-modal 目前**文案**調整為純體驗層；但若動到 `index.html` battle-modal 的 **DOM 結構**仍觸及 §5.1 GROUNDWORK，開工計畫要分開標示、分開確認。

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
| 1 First Runtime Carrier | 灰影貓 | `greyshade-cat` | 第一個已驗證 runtime 載體、fresh save default / fallback、完整 spritesheet；Initial Bond 後以選定者為 active companion |
| 1 Formal Heartspark Council Stage 1 | 金羽小梟(金)／芽角小鹿(木)／晶鰭小海馬(水)／焰尾狐（幼態：焰尾小狐，火）／星紋小虎(土) | `auriowl` / `sprigfawn` / `crystalfin-seahorse` / `blazetail-kit` / `starstripe-cub` | Owner 定版正式 roster；現行皆為 `full-runtime` / `runtime-ready` / `selectableWhenUnlocked`，但仍服從 Initial Bond、chapter gate 與意願制 |
| 1 Formal Ironflow Hackers Stage 1 | 雷霆幼狼(木)／浪花幼獅(水)／星焰鳳凰(火)／幼星駒(土)／金光幼龍(金) | `thunder-pup` / `wavecub` / `starflame-phoenix` / `star-foal` / `goldenspark-wyrm` | 黑鐵駭客正式五席；現行皆為 `full-runtime` / `runtime-ready` / `selectableWhenUnlocked`，但初始鎖定、不自動解鎖、不加入 Initial Bond |
| 1 Runtime Test Carriers | 焰紋狐／冰晶狼／磐石熊／青藤鹿／晶石兔 | `flame-flicker` / `ice-talon` / `stone-shard` / `vine-twist` / `crystal-rabbit` | 現行 `full-runtime` 動畫測試載體；不占正式心輝議會五行席位，最終用途待另案 |
| 3 Roadmap Runtime Candidate | 星能小山豬 | `star-energy-boarlet` | 可逐章節升級為 runtime candidate；未通過 asset readiness 前不可選 |

註：正式五元守護的外觀鎖定、512×512 runtime 資產、human approval 與 asset readiness gate 已完成；物種動作翻譯位於 `docs/art/`。鳥型、海馬型、鹿型不得套用通用四足動作。多角色版本首版仍維持「同一時間只有一隻 active companion」。

註：焰尾狐的 canonical runtime ID 為 `blazetail-kit`；「焰尾小狐」是牠的 Stage 1 幼態名。舊 ID `flametail-fox` 只作單向存檔 alias，不能成為第二隻角色、第二份關係或另一套資產需求。

註：`crystal-rabbit` 已使用自己的 `assets/characters/crystal-rabbit/` runtime root；過去借用 `thunder-pup` 目錄的命名債已解除。黑鐵駭客五席使用各自獨立資產根與 persona；Codex Stage 1 名錄應預先列出全部 Stage 1 角色並標示未相遇／鎖定，但 companion selector／active companion 仍須先合法解鎖。Codex 可見不建立 relationship 或選用資格。Fresh Initial Bond 仍只呈現 `greyshade-cat` / `blazetail-kit` / `crystalfin-seahorse`。

### Linkara world faction model

- 世界地圖固定七區：東南熔爐丘陵區、中央輝耀核心區、北部翠綠平原區、南港、月湖營地、秘境山脈核心、西南潮汐邊疆區。
- 三勢力固定為心輝議會、黑鐵駭客、混頓裂隙；「混沌裂隙」可作玩家口語，正式 canon 用「混頓裂隙」。
- 每個勢力各有金、木、水、火、土五個角色席位；這是章節與角色擴充骨架，不是抽卡池或戰力職業表。
- 黑鐵駭客正式英文名為 `Ironflow Hackers`；五席固定為木 `thunder-pup`、水 `wavecub`、火 `starflame-phoenix`、土 `star-foal`、金 `goldenspark-wyrm`。
- 灰影貓與星能小山豬是中立心核生命，不屬於三勢力，也不占五行 roster。

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
| State | `store.js` ・ `saveManager.js`（key=`nexusLinkR2State:v1`）・ `saveQueue.js` ・ `defaultState.js` ・ `companionStateSchema.js`（G2 canonical per-companion relationship／growth） |
| 邊界/觸碰 | `touchReactionEngine.js` ・ `interactionController.js` ・ `hudController.js`(boundary view) |
| 情緒沉積 | `emotionalSedimentationEngine.js` ・ `memoryLifecycleEngine.js` ・ `safeHarborMode.js` |
| 痕跡 | `habitatTraceEngine.js` ・ `traceVisualMapper.js` ・ `habitatTraceRenderer.js` |
| Soul Talk / RaphaelCore | `soulTalkController.js` ・ `src/ai/raphaelCore.js` ・ `applyCoreResult.js` ・ `PersonaConstitution.js` ・ `constitutionCritic.js` ・ `soulTalkResponsePacks.js` |
| 情緒對峙 | `battleEngine.js` ・ `battleController.js` ・ `enemyRegistry.js`（`battleRecord.wins/losses` compatibility-only） |
| 探索 | `mapController.js` ・ `explorationEngine.js` ・ `explorationNodes.js` |
| Expedition（Prototype） | `expeditionController.js` ・ `src/expedition/` ・ `RAPHAEL_EXPEDITION_EVAL_CONTRACT.md`（partial Core bridge，`coreIntegrated:false`） |
| Companion Growth（G1 + G2 + G3 + G3.1 Care Source 已接入；G4+ 未實作） | `companionGrowthSessionEngine.js` ・ `companionGrowthEngine.js` ・ `companionGrowthController.js` ・ `companionStateSchema.js` ・ `pageRouter.js` ・ `codexController.js` ・ `docs/design/COMPANION_GROWTH_CONTRACT_V1.md` ・ `ACCEPTANCE.md` N1–N12 ・ `evolutionLines.js`（compatibility data only） |
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

---

## 11. Cross-AI Execution Ledger

Every TASK_PACK must read the relevant lane in
`docs/agent/AI_EXECUTION_LEDGER.md` before editing. Before a final report or a
blocked handoff, append the completed work, verification, problems, and next
safe action to the relevant lane. Keep Game Engineering, Game Art/UI, and
Raphael Core entries separate. A remote branch or historical test report is not
evidence of current runtime integration until the checked-out worktree proves it.
