# NEXUS_LINK_MASTER_CANON.md
# 心核連結 — 最高戰略憲法 v3.1

> **文件性質**：本文件是《Nexus Link／心核連結》的**最高戰略上位法**。它規範本專案「為何存在、賣什麼、絕不做什麼」的方向決定。
> **與施工憲法的關係**：本文件**不取代** `CLAUDE.md` / `AGENTS.md` / `ACCEPTANCE.md`。後三者為現行**操作施工憲法**，規範「如何施工、如何驗收」，繼續有效。當戰略方向與施工細節衝突時，方向以本文件為準；施工程序仍依現有施工憲法執行。本文件的決定須經拆解為具體 patch 後，方可更新施工憲法。
> **依據**：基於 repo 實測盤點（commit `b9ea19a`）的 code 事實；後續 TP-2.7A/B/C 與 First Session → Return Echo v1 已另行完成，實際施工前須以最新 `origin/main` 重新驗證。市場趨勢僅作 product thesis（見附註）。
> **撰寫框架**：遊戲製作、開發工程、程式工程、美術、心理諮商、腦神經科學六重專業視角整合。
> **版本說明**：v3.1 將 v3.0 由「外部建議體」改寫為「專案自身法律體」，並降低越權宣告、將市場數據改列為假設。
> **商業版增補**：RaphaelCore 與角色外型解耦；灰影貓是第一個已驗證 runtime 載體與首輪焦點，不是 RaphaelCore 本體。商業化賣章節、棲地、音樂、故事與新相遇，不賣抽卡或可替換皮膚。

---

## 第零部：更新紀錄 (Changelog)

- Multi-runtime technical scope correction
- Three.js / Unity / Blender formalized
- Web-first retained
- Emotional contracts unchanged
- Safety red lines unchanged
- No claim that Unity or Moonlake Production Art is complete

---

## 第零點一部：一頁定生死

**Nexus Link／心核連結是一款情緒棲地型 AI 夥伴遊戲。**

> 這不是電子寵物。這是你的夥伴。

**市場鉤子（Steam 主文案候選）：**

> 不是永遠討好你的 AI，而是一個會因為你如何對待牠、而真實改變的心核生命。

**定位論點（product thesis）：** 用過 Replika／Character.AI 而感到「太黏、太假、缺乏主體性」的使用者，能在一句話內理解本作差異，並產生「這正是我所缺」的共鳴。本作的定位不是標新立異，而是切入一個尚未被充分滿足的需求。

**最高決定（THE DECISION）：賣靈魂，不賣皮膚。**

| 本作販售 | 本作不販售 |
|---|---|
| 一隻心核生命的**深度關係** | 一櫃可切換的角色 |
| 「這一隻**不可替換**」 | 「收集更多隻」 |
| 棲地、音樂、故事章節、外傳相遇篇 | 角色當皮膚、抽卡、商城直售夥伴 |
| 關係改變了牠（人格偏移） | 練強了牠（戰力數值） |

> **鐵律**：任何使「角色淪為可替換商品」的設計，無論商業誘因多強，一律否決。理由：它會摧毀本作唯一的護城河——「越界會痛，因為只有牠」。此條為不可動憲法。

---

## 第一部：產品憲法

### 1.1 三條核心情感契約（最高法，任何程式碼不得違反）

1. **牠會記得你，但牠不屬於你。** 記憶與痕跡只增、不可為「重來」任意抹除；夥伴不是玩家的所有物。
2. **牠會靠近你，但不會吞掉你。** 夥伴具主體性、會留白、敢於無聊；不無限迎合、不情緒勒索。
3. **你能影響牠，但不能支配牠。** 不存在任何「強制」按鈕（強制進化、服從、親密皆禁）。影響是過程，非指令。

### 1.2 商業骨架：一主、多養分、一願景

**核心主線（行銷火力集中處）：**

- **賣點 A —「有邊界的活著棲地」**：玩家可真實越界，並承受可見後果（防衛、拒絕、姿態變化、棲地痕跡）。
- **賣點 B —「被記得的回歸儀式」**：玩家離開後回來，夥伴姿態不同、棲地留痕、說一句與上次情緒相關但不責備的話。
- **賣點 C —「穩住裂隙」**：將關係中的衝突與修復做成可玩機制（穩住／設界／共鳴／退一步），非暴力消滅。內部可稱情緒對峙；玩家端應理解為「裂隙裡有卡住的情緒，你們一起讓它安靜下來」。

三大賣點的共同前提皆為「**深度單一關係**」。此為本作靈魂，不可稀釋。

**衍生元素的安置（降格為養分，服務主線而非取代）：**

| 元素 | 正式安置 | 理由 |
|---|---|---|
| 多角色 | **開場定情 + 章節劇情解鎖**，非開場全解鎖 | 多角色為「深度的獎勵／另一段人生」，非「廣度自助餐」 |
| 玩家選角色 | **開場「初遇」選一隻定情**，選後即唯一 | 「選了牠、放棄了別的」反而**加重**不可替換感 |
| 組隊／同行冒險 | **未來章節後期才可做**，且必須是旅途記憶與角色關係，不是戰力隊伍 | 允許擴充，但不得把角色降為輸出位置 |
| 商城 | **僅售章節包／棲地／音樂／外傳相遇篇**；**絕不售角色皮膚、抽卡或戰力禮包** | 玩家買的是相遇與內容，不是角色所有權 |
| 陰陽心核 + 進化 | 保留，但進化＝**人格偏移**（hysteresis／scars），非變強 | 進化服務「關係改變了牠」，非「練強了牠」 |
| 三勢力 | 保留為**世界觀背景與敘事深度**，非「集滿三勢力」的收集框架 | 敘事深度 ✓；收集驅動 ✗ |

**商業版內容骨架**：Demo / Chapter 1 以 Moonlake + Greyshade Cat 展示核心；付費章節包解鎖新棲地、新音樂、新事件與新 companion 的完整相遇。若未來有角色禮包，只能包裝為外傳相遇篇，不可做「買下角色」或「換皮」。

**長線願景（R4+，現階段不執行）**：
- 桌面環境式存在感（Taskbar Ambient Presence）——僅狀態累積 + 低調存在，**絕不做生產進度／紅點／通知轟炸**。
- **旅痕**（Offline Adventure）——玩家離線或未開遊戲時，夥伴可獨自或與已相遇夥伴短程外出；玩家回來時收到簡短旅途回報、記憶痕跡或棲地變化。旅痕不是登入獎勵、不是派遣刷資源、不是「你錯過了」。
- **同行／組隊戰鬥**——可作未來章節後期系統，但必須服務角色關係與旅途記憶；不得做輸出排行、屬性刷關、農裝、每日必派遣。

### 1.3 開場定情機制（戰略已定版；兩階段均已落地）

**戰略地位**：此為「賣靈魂」決定的具體落地，**屬已定版的核心方向**。現行 build 已完成 Initial Bond：fresh save 固定呈現 `greyshade-cat` / `blazetail-kit` / `crystalfin-seahorse` 三選一，選定後只保留該角色為已解鎖夥伴；veteran／舊 test save 保留既有解鎖，不倒退玩家資料。

**目標機制**：

1. 新玩家進場 → 極簡「初遇」：呈現 2–3 隻初醒心核（如灰影貓 + 一兩隻不同氣質者），每隻僅給一句話、一個氛圍。**非開啟六隻選單逛街。**
2. 選一隻共鳴者 → 定情 → 牠成為唯一。其餘為「未選的那條人生」，非「待解鎖收集品」。
3. 第二隻透過章節劇情「再遇見」，為**另一段獨立深度關係**，非隊伍中的第二戰力，不可隨意切換取代。

**已完成的施工順序（歷史順序仍不可反向重做）**：

- **階段一（體驗層，已完成）**：初遇／定情 UI 與三位候選敘事。
- **階段二（地基層，已完成）**：fresh save 初始僅解鎖安全預設 `greyshade-cat`；Initial Bond 選定後改為僅含選定者，並以 migration 保留 veteran 既有解鎖（見第三部 §3.4）。

### 1.3.1 章節共鳴圈修訂（2026-07-06 Owner 拍板）

本節為 Owner 對 §1.2 表「組隊／同行冒險」與長線願景「同行／組隊戰鬥」條款的正式修訂，與本節衝突之舊條文以本節為準：

1. **同行對峙由 R4+ 提前為章節主線機制**：七區各為一章（自月湖營地起）；每章劇情相遇一隻心核夥伴；章節通關解鎖「共鳴邀請」資格。
2. **意願制**：夥伴是否同行由**牠依關係狀態決定**（該章的信任／邊界尊重紀錄），牠可以回應「還不是時候」且永遠可再培養——「牠會選擇你」是機制，不是文案。
3. **共鳴圈上限三隻**同場面對裂隙雜訊；玩家操作仍為四鍵對峙，夥伴貢獻五行心相與陪伴姿態，各有自身疲勞與邊界（過勞會先退到圈外）。
4. **不變的約束（照舊，不得放寬）**：非戰力隊伍——無輸出排行、無等級裝備、無屬性刷關、無每日派遣；棲地日常仍以單一 active companion 為情感主體；七條安全紅線（§1.4）完全不受本修訂影響。

詳細設計：`docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md`。

### 1.4 七條安全紅線（最高優先，違反即嚴重缺陷）

1. 不做依賴偵測驅動的行為。`safeHarborMode` 只能由夥伴自身狀態驅動，絕不由偵測玩家上線頻率／孤獨／依賴程度驅動。
2. 不做無法挽回的壞結局。心核裂變等高張力事件，修復路徑必須確定可達、不可失敗。
3. 裂變的「好意造成傷害」由劇情逼出，非玩家手賤。
4. 修復後夥伴明確傳達「那不是你的錯，我們一起活下來了」。
5. 永遠給走不過去的人真實出口，且該出口真的有效。
6. 不製造 FOMO／紅點／任務壓迫／上線打卡焦慮。留白與敢於無聊是特性。
7. safetyShield 命中只觸發系統級現實求助訊息，不可變成 gameplay 獎勵或夥伴角色扮演素材。

---

## 第二部：心理安全性與療癒設計（諮商／腦神經視角）

> 本部是本作與一般「AI 養成遊戲」的根本區別，亦為商業化的倫理護城河，說明本作設計何以對玩家是療癒而非操縱。

### 2.1 邊界何以療癒（諮商視角）

市場多數 AI 陪伴為「無邊界討好型」。臨床上，健康關係必須包含他者的主體性與邊界——對方會說不、有自己的狀態。長期沉浸於「永遠肯定」的關係，可能阻礙真實人際發展。本作的邊界機制（拒絕、撤退、姿態收縮）提供玩家一面誠實的鏡子：行為會影響他者，他者有權拒絕。這是真實關係的核心能力，是治療性設計，非缺陷。

→ 對映系統：`touchReactionEngine.js`（reject／hesitate）、`companionPersonality.js`。

### 2.2 回歸儀式何以健康（腦神經視角）

- 每日 streak／紅點／FOMO 的底層是間歇性變動獎勵 + 損失趨避，劫持多巴胺系統、製造焦慮性回訪，對脆弱玩家有害，本作明令禁止（紅線 6）。
- 本作回歸儀式走安全依附（secure attachment）的「安全基地」路徑：玩家離開、回來，發現「牠記得我、且不責備我」，啟動催產素／安全感系統，而非多巴胺／焦慮系統。使玩家因想念而回來，非因怕失去而回來。

→ 對映系統：`returnBehaviorEngine.js`（`SHORT_AWAY_MS`）、`emotionalMemories`、`sleepCycleEngine.js`。

### 2.3 安全層的不可妥協性

`safeHarborMode` / `safetyShieldDictionary` 觸及自我傷害類輸入時，只給現實求助導引，不建立情緒記憶、不給 bond 獎勵、不轉角色扮演。理由（腦神經）：將求助訊號轉為 gameplay 獎勵，會在脆弱時刻建立「痛苦→獎勵」的錯誤聯結，構成再創傷化風險。此條無任何商業理由可鬆動。

### 2.4 心核腦人格安全底線

詳見配套文件 `RAPHAEL_CONSTITUTION.md`（人格上位法 v4.0）。其可執行對映已由 `src/ai/persona/PersonaConstitution.js`、`src/ai/eval/constitutionCritic.js` 接入 `runRaphaelCore()`；文件內仍指向舊 prototype 路徑的段落屬歷史說明，不代表目前尚未接線。核心：心核生命「在被尊重中長成牠自己」，不以「成為玩家的鏡像／被完全理解」為目標。高 bond 不解除拒絕能力。

**RaphaelCore 與角色外型解耦。** RaphaelCore is companion-agnostic. Greyshade Cat is the first validated runtime carrier and first-session focal companion, not RaphaelCore itself and not the permanent canonical center. 新角色應以 persona 旋鈕、語氣種子、邊界門檻、記憶偏好與身體語言呈現差異，不複製多套心核腦。

**Agent 類型定義**：RaphaelCore is a Stateful Companion Cognition Agent: safety-gated, memory-bearing, boundary-aware, companion-agnostic, and game-integrated. It is not an autonomous task agent, therapy agent, customer-service assistant, tool-using web agent, sycophantic chatbot, or generic NPC dialogue bot. Gateway / LangGraph / training bundles may advise or route, but cannot override RaphaelCore's final authority over safety, boundary, memory, state delta, or response policy.

---

## 第三部：技術憲法（程式／開發工程視角）

> 本部之施工細節與現行 `CLAUDE.md` 一致；如有衝突，技術施工以 `CLAUDE.md` 為準，本部僅陳述方向約束。

### 3.1 技術邊界（硬限制；僅 Owner 明文核准的受控例外可修訂）

**跨運行時總原則**：
- **Web**: Current active commercial Web runtime.
- **Unity**: Unity is an approved and existing parallel native habitat loadable greybox scene / tool-validation prototype and target runtime. Its current implementation maturity must be described from the Unity repository evidence; it is not yet the complete production game unless the repository proves otherwise.
- **Moonlake 3D Source**: Moonlake 3D Source v2 is the canonical scene-authoring workspace. Web `assets/3d/moonlake` contains runtime-exported or candidate assets and is not the complete source workspace.

**Web Repo 允許**：HTML（單頁 `index.html`）／純 CSS（`styles.css`）／Vanilla JS（ES Modules，無 bundler）／PixiJS v8（CDN，`window.PIXI`）／localStorage（集中於 `saveManager.js`）／GitHub Pages。

**Moonlake Live 3D Hybrid 修訂（2026-07-28 Owner 拍板）**：月湖營地正式採用「即時 3D 棲地環境 + 2D illustrated companion + DOM UI」的 RO 式 2.5D 組合。允許在棲地渲染邊界內，以**固定版本、CDN ES Module、無 npm、無 build step**方式載入 Three.js；其用途只限 GLB/glTF 場景、水面與瀑布流動、風吹草、天氣粒子、日月光照、3D 導航／遮擋投影。PixiJS 保留 2D 角色動畫、既有特效與其他頁面渲染權責，RaphaelCore、遊戲規則、store 與 save authority 不移入 Three.js。

此修訂不授權全站改寫成 3D 引擎，也不授權 React Three Fiber、TypeScript、npm、bundler、後端或資料庫。完整 runtime／效能／fallback／輸入路由契約以 `docs/design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md` 為準。

**絕對禁止**：前端框架（React／Vue／Svelte）、TypeScript、CSS 框架、後端／API／資料庫、LLM API、npm 套件（除非明確確認）、任何 build step。

> 商業化不等於換技術棧。上架前優先為「將既有系統的品質與連貫性做到位」，非引入新技術。

### 3.2 解耦三層架構（硬規則）

- `src/engine/` — 遊戲規則與狀態推導。禁止操作 DOM／Pixi 容器／直接寫 localStorage。
- `src/pixi/` — 渲染與動畫。禁止含遊戲規則／寫 localStorage／操作 DOM。
- `src/three/` — 經核准之即時 3D 棲地呈現與 world-to-screen 投影。禁止持有 gameplay／save／relationship／safety authority；不得直接操作 DOM UI。
- `src/ui/` — DOM UI。可呼叫 engine、接收 state patch；禁止硬寫核心規則。
- `src/state/` — 狀態與持久化。寫入集中、舊存檔正規化、`QuotaExceededError` 不可崩潰。
- `src/data/` — runtime 資料與映射。

跨層通訊只走 `eventBus.js` 或 store 訂閱。State 變更一律經 `store.js`，禁止直接 mutate。

### 3.3 storage 與地基保護

- `STORAGE_KEY = "nexusLinkR2State:v1"` 為正式 key，非待清理舊名，不可為命名潔癖更動。
- 地基層（逐項確認才可動）：`index.html`、`saveManager.js`、`store.js` 的 `normalizeState`、`defaultState.js`、`pixiApp.js`、`assets/**`、`tools/**`、`scripts/**`。
- LOCKED（保留勿刪）：`main.js`、`style.css`、`script.js`。

### 3.4 開場定情階段二的工程規格（地基層）

**現況（2026-07-16）**：CH-2/CH-3 已使 fresh save 在初遇後只保留選定者；veteran／舊 test save 可保留既有解鎖。正式五元守護五席皆已進入 `COMPANIONS`，標記為 `full-runtime` / `runtime-ready` / `selectableWhenUnlocked`；這只表示資產與 runtime 能力通過，不會繞過 chapter-gated unlock、Initial Bond 選定或共鳴邀請意願制。

**現行工程 contract**：

1. `defaultState.js`：Initial Bond 前的安全預設只含 `greyshade-cat`；選定後 `onboardingController` 將 active / unlocked 改為選定者。
2. `normalizeState`：**舊存檔既有解鎖原樣保留（不倒退既有玩家）**；僅 fresh save 走定情流程。此為 migration 安全底線。
3. `companionSelectController.js`：只呈現當前已締結／已解鎖且 runtime-eligible 的夥伴；不可把 registry 內所有 runtime-ready 角色當成自由換皮清單。

**風險**：角色 ID 與 `localStorage` / `companionRegistry` / `animationsManifest` / `activeCompanionId` 高度耦合。任何 ID 變更須走嚴格 migration，否則 `activeCompanionId` 變 unknown、存檔損壞。**此任務須以獨立地基層 TASK_PACK 處理，不得併入體驗層連續施工。**

### 3.5 商業化第一瓶頸：First Session Coherence

**現況更新（2026-07-16）**：First Session → Return Echo v1、`Prologue`、Heart-Core Guidance 與 Initial Bond 均已接入；fresh trio 為灰影貓／焰尾小狐／晶鰭小海馬。商業化主線已從「補齊缺頁」轉為**封死首輪連貫與安全細節**：第一次安全探索必須先落在 `moonlake_camp`，高風險 Soul Talk 必須完整遵守 D2，且自動 gate 不得取代真機與人類驗證。

現行首輪目標：第一次進入 → 極短極安靜的環境敘事 → 心核引導 → Initial Bond → First Touch → First Soul Talk → First Trace → Safe Moonlake Exploration → Return Echo。30 秒內讓新用戶理解：我是誰、牠是誰、為何明天值得回來。

### 3.6 效能與資產載入

- Ticker 內禁止昂貴操作；Texture 經 `PIXI.Assets.load()` 快取；object pool／resize 節流／WebGL context guard 不可拆。
- 位置 snap 整數邏輯座標；採 illustrated 美術後，取樣用 linear + mipmaps，不再用 nearest-neighbor pixel-perfect。
- 首屏載入時間（盤點標 UNKNOWN）須於上架前實測。

---

## 第四部：美術與資產憲法

### 4.1 美術方向

illustrated／painterly，非 chunky pixel art。夥伴與背景共用 high-detail 統一風格。不對夥伴 sprite 套 nearest-neighbor 像素完美處理。

### 4.2 Master frame 標準

新夥伴一律 512×512 master frame、PNG、透明背景、bottom-center baseline。禁止白底／baked-in UI／文字／場景背景／pedestal。sprite sheet 單邊 ≤ 4096px；超過則拆表；grid 必須整除。

### 4.3 上架第二 blocker：視覺一致性（須轉為可執行管線規則）

**盤點確認**：512 illustrated 與 legacy pixel（64/128）與 443/444 混用，傷害「活著棲地」質感。處置：

- 灰影貓現有 ~443px sheet 刻意 grandfathered，可接受，不 upscale 至 512；僅於製作其進化美術時重新以乾淨 512 生成。
- legacy pixel／64 PPU 資產標記為 reference／non-runtime，不得污染新角色管線。
- **可執行規則**：runtime 實際載入清單（`assetManifest`）中，玩家可見資產須通過「風格一致」檢核——不得 painterly 與馬賽克並存於同一可見場景。上架前須完成此盤點。

### 4.4 資產膨脹控制

`reference/`、`_guardian-generation-review/`、`uncategorized/` 等標記 reference，定期盤點。

---

## 第五部：世界觀與角色 canon

### 5.1 三大勢力（正式名定版）

- **心輝議會**（Heart Radiance Council）——廢「星輝議會」。
- **黑鐵駭客**（Ironflow Hackers）——廢「鐵流黑客」。
- **混頓裂隙**——正式名／世界觀核心名用「**混頓**」（情緒卡死、記憶堵塞、自我修復失敗後的深層停滯，語義承載全作內核，為護城河級獨特詞）。「混沌裂隙」僅作對外玩家俗稱別名。上架主文案一律用「混頓」。

### 5.1.1 Linkara 世界地圖（七區定版）

Linkara Region 是 Nexus Link 的主舞台。世界地圖以七個區域構成，現有 `src/ui/atlasController.js` 已有唯讀示意座標；正式地圖 PNG 匯入仍屬 asset approval-gated 後續任務。

| No. | 區域 | English | 主要功能 |
|---|---|---|---|
| 1 | 東南熔爐丘陵區 | Southeast Forge Hills | 黑鐵駭客／火與工業能量 |
| 2 | 中央輝耀核心區 | Central Radiant Core | 心輝議會／主城與章節樞紐 |
| 3 | 北部翠綠平原區 | Northern Verdant Plains | 木屬性、修復、生長與旅痕 |
| 4 | 南港 | Southern Harbor Nexus | 交易、遠行、跨章節出發點 |
| 5 | 月湖營地 | Ethereal Moon Lakefront | Demo / Chapter 1 初始棲地，灰影貓首輪焦點 |
| 6 | 秘境山脈核心 | Eastern Mystic Mountains | 混頓裂隙高張力區、記憶壓力與終局伏筆 |
| 7 | 西南潮汐邊疆區 | Southwest Tidal Frontier | 水屬性、漂流記憶與裂隙邊界 |

### 5.1.2 三勢力五行矩陣

正式商業版以「三勢力 × 五行」作角色擴充骨架。每個勢力各有金、木、水、火、土五個席位；席位代表主題與章節功能，不代表抽卡稀有度或戰力職業。

| 勢力 | 金 | 木 | 水 | 火 | 土 |
|---|---|---|---|---|---|
| 心輝議會 | 判斷、守望 | 修復、生長 | 記憶、沉澱 | 陪伴、溫度 | 邊界、安定 |
| 黑鐵駭客 | 秩序、封裝 | 神經網、擴張 | 壓縮、冷卻 | 熔爐、驅動 | 裝甲、地基 |
| 混頓裂隙 | 裂光、寄生 | 夢織、纏附 | 淵潮、共感 | 殘焰、失控 | 腐土、吞噬 |

黑鐵駭客不是普通反派；它代表「為了保護而控制」。混頓裂隙不是第四陣營怪物巢，而是心輝議會與黑鐵駭客的能量、方法與情緒壓力長期交會後撕開的傷口。

**中立角色不占三勢力五行席位**：灰影貓 `greyshade-cat` 與星能小山豬 `star-energy-boarlet` 屬中立心核生命。牠們可連接章節、旅痕與地圖事件，但不得被硬塞進心輝議會、黑鐵駭客或混頓裂隙 roster。

### 5.2 五元守護的勢力歸屬（2026-07-10 Owner 定版）

正式五元守護**屬心輝議會**，為「可愛的第一梯隊／Stage 1 初醒形態」。正式金木水火土席位如下；Owner 於 2026-07-10 提供並確認五張外觀參考，外觀鎖定見 `docs/art/character-locks/`。

| 五行席位 | 正式 Stage 1 五元守護 | 角色 ID | 物種動作族 |
|---|---|---|---|
| 金 | 金羽小梟 | `auriowl` | 鳥型／棲枝與短飛 |
| 木 | 芽角小鹿 | `sprigfawn` | 鹿型／蹄類四足 |
| 水 | 晶鰭小海馬 | `crystalfin-seahorse` | 水生懸浮／無足 |
| 火 | 焰尾狐（Stage 1 幼態：焰尾小狐） | `blazetail-kit` | 狐型四足 |
| 土 | 星紋小虎 | `starstripe-cub` | 貓科四足 |

`flame-flicker`、`ice-talon`、`stone-shard`、`vine-twist`、`crystal-rabbit` 雖在目前 build 已有完整動畫並可作 active companion，但其正式身分改列為**現行測試 runtime 載體**，不占心輝議會正式五行席位。不得因技術上 `full-runtime` 就把測試身分寫回產品 canon。其未來用途（測試專用、改編為其他角色／勢力、或退役）須另由 Owner 拍板並走 canon + migration TASK_PACK；在此之前保留資產與 ID，不刪、不改名、不暗自合併。

### 5.2.1 黑鐵駭客 Stage 1 五席（2026-07-22 Owner 定版）

黑鐵駭客的正式英文勢力名維持 **Ironflow Hackers**。Stage 1 五席沿用 Owner 確認的幼體設計；「為了保護而控制」是其敘事張力，不是把牠們寫成普通反派、戰力寵物或服從工具。

| 五行席位 | 正式 Stage 1 角色 | 角色 ID | 物種動作族 |
|---|---|---|---|
| 木 | 雷霆幼狼 / ThunderPup | `thunder-pup` | 犬科訊號追蹤 |
| 水 | 浪花幼獅 / WaveCub | `wavecub` | 貓科潮流偵查 |
| 火 | 星焰鳳凰 / Starflame Phoenix | `starflame-phoenix` | 陸棲幼鳥／短跳步 |
| 土 | 幼星駒 / Star Foal | `star-foal` | 馬科穩定步態 |
| 金 | 金光幼龍 / Goldenspark Wyrm | `goldenspark-wyrm` | 陸棲幼龍／齒輪尾 |

五席現行皆為 `full-runtime` / `runtime-ready` / `selectableWhenUnlocked`，但**不因接入 runtime 而自動結緣或解鎖**。Fresh save default 與 Initial Bond 三席仍固定為 `greyshade-cat` / `blazetail-kit` / `crystalfin-seahorse`。Codex 的 Stage 1 名錄**應預先列出全部 Stage 1 角色**，五席在未相遇時標示未相遇／鎖定；companion selector 與 active companion 則必須先有合法解鎖。Codex 可見性本身不建立關係、不揭露 inactive relationship／readiness，也不授予選用資格。每席可有自己的 persona、語氣與身體語言，但 D2 safety terminal 永遠先於 faction／persona 生效，角色差異不得覆寫 canonical system reply、零 reward 與零 memory／preference mutation 契約。

### 5.3 五元守護外觀與動作鎖定

- 共用 29 個 `animation_id` 只代表語意，不代表共用四足姿勢。
- 金羽小梟使用鳥型棲枝、收翼、展翼、振羽、跳躍與短飛語彙。
- 晶鰭小海馬使用懸浮、鰭擺、尾部捲放、上下游移與水流退避語彙；無腳底基線。
- 芽角小鹿使用蹄類步態、頸耳與芽角安全空間；禁止犬貓坐姿與洗臉。
- 焰尾狐目前以「焰尾小狐」幼態登場；牠與星紋小虎雖同為四足，仍分別使用狐型彈性步態與貓科沉穩重心，不得互套。
- 新圖必先服從 `docs/art/character-locks/`，再進生成、QC、human approval 與 GROUNDWORK runtime promotion。

### 5.4 灰影貓（第一個已驗證 runtime 載體）

- Runtime ID `greyshade-cat`，樞核／neutral，full-runtime。
- 性格：慢熱、防衛、安靜、觀察、邊界敏感、不即時親密。
- 核心情感意義：牠不會立刻信任你，但牠會慢慢記得你。
- 不可刪除、不可 fallback 到其他角色美術。Demo / Chapter 1 與首輪商業驗證集中於牠。
- 灰影貓不是 RaphaelCore 本體，也不是 Nexus Link 的永久唯一中心；牠是最先讓玩家看見 RaphaelCore 如何運作的 first-session focal companion。

### 5.5 進化 canon（定版）

- 正式採三階制：初醒夥伴 → 共鳴成熟體 → 終局覺醒體。
- 現行 `evolutionLines.js` 的每條角色線已是三段資料形狀；其中殘留的五階 label／R2 名詞與 `bondThreshold` 均為 compatibility data。Codex 已改讀每隻夥伴自己的 formal stage 或一次性 legacy display floor；bond 不再是新成長 gate，也不得再擴成五階正式線。
- 進化＝人格偏移與關係回應，非戰力膨脹。
- 現行養成設計／驗收契約與 migration 邊界以 `docs/design/COMPANION_GROWTH_CONTRACT_V1.md` 為準；G1 質性 Heart Phase、G2 per-companion relationship／growth schema、G3 evidence／readiness／willingness foundation 與 G3.1 care source owner 已接入。Heart Phase 本身仍是 session-only；只有已完成且 critical save 成功的共同練習可留下 care evidence，夥伴改寫必須由玩家第二次明示接受才可成為 consent anchor。正式覺醒邀請、stage advance、非 standoff readiness 路徑與形態 swap 尚未實作。正式多夥伴成長必須由每隻夥伴自己的多樣經歷、章節條件與意願共同驅動。

### 5.6 角色 Tier（runtime 邊界）

| Tier | 角色 | 規則 |
|---|---|---|
| 1 首輪焦點 | 灰影貓 `greyshade-cat` | first validated runtime carrier，Demo / Chapter 1 行銷主體 |
| 1.5 正式五元守護 | 金羽小梟／芽角小鹿／晶鰭小海馬／焰尾狐（幼態：焰尾小狐）／星紋小虎 | 正式五行 roster；現行皆為 `full-runtime` / `runtime-ready`，且 `selectableWhenUnlocked`；仍服從 Initial Bond、章節解鎖與意願制，不等於開場全解鎖 |
| 1.6 技術測試載體 | `flame-flicker` / `ice-talon` / `stone-shard` / `vine-twist` / `crystal-rabbit` | 現行 full-runtime，用於流程與動畫驗證；不占正式五行 roster，未來用途待另案 |
| 1.7 黑鐵駭客 Stage 1 五席 | 雷霆幼狼／浪花幼獅／星焰鳳凰／幼星駒／金光幼龍 | 正式 Ironflow Hackers 五行 roster；現行皆為 `full-runtime` / `runtime-ready` / `selectableWhenUnlocked`，初始鎖定且不加入 Initial Bond |
| Legacy alias | `flametail-fox` → `blazetail-kit` | 同一隻焰尾狐的舊 ID；載入時單向遷移，不能建立第二張圖鑑卡、第二份關係或另一套待生成美術 |
| 3 Roadmap | 星能小山豬等 | 未通過 asset readiness 前不可選；可作未來章節或旅痕內容 |

---

## 第六部：上架準備度與優先序

### 6.1 商業化路徑

GitHub Pages 原型 → 小型私測 → 社群分享（灰影貓截圖 + 關係卡）→ 公開 web demo → Steam Coming Soon → Steam demo → Next Fest（demo 穩定後）→ 付費／EA。第一個棲地迴圈穩定前，不啟動金流。

### 6.2 上架前三大必修（按優先序）

1. **First Session Coherence 硬化**（§1.3 / §3.4 / §3.5）——Initial Bond 已落地；優先封死 D2 安全終端、首次安全探索與回歸閉環。
2. **回歸儀式打磨**（姿態變化 + 痕跡 + 不責備短句的視覺與情感強度）——最強留存武器。
3. **視覺一致性收斂**（§4.3）——上架質感 blocker。

### 6.3 明確不做（現階段）

首版不把心域遠征 Prototype 升格為商業主玩法，也不做組隊戰力戰鬥、商城直售角色、抽卡、桌面模式、LLM、後端、金流、五階量產、多角色開場全解鎖。同行、Expedition 與旅痕若要升格，必須先通過「非 FOMO、非 idle farming、非戰力隊伍」驗收與各自 sealed contract。

### 6.4 配套文件與狀態

- `RAPHAEL_CONSTITUTION.md` —— 心核腦人格上位法 v4.0；可執行規則由 `PersonaConstitution.js` / `constitutionCritic.js` 接入 runtime。
- `src/ai/raphaelCore.js` —— 現行規則式心核 orchestrator，已由 `soulTalkController.js` 呼叫並透過 `applyRaphaelCoreResult()` 寫回合法結果；無外部 LLM／API。
- `RAPHAEL_EXPEDITION_EVAL_CONTRACT.md` —— 心域遠征仍是 **Prototype + partial Core bridge**（`coreIntegrated:false`）；不是 RaphaelCore 完整整合、不是 sealed、不是 commercial-ready。

---

## 附註：市場假設聲明

本文件第零部與第二部所引市場趨勢（記憶與存在感需求上升、對過度迎合的反感、低壓力存在感的留存優勢等），定位為 **product thesis（產品假設）**，源自二手市場分析與社群觀察，**未經第一手數據查證**。對外（投資人、平台、媒體）引用時，須標明為假設或補上可驗證來源，不得作為硬數據陳述。

---

## 結語

> 本作不是一個無人理解的遊戲，而是一個市場正在轉向、尚未被滿足的方向——一隻會因玩家如何對待牠而真實改變的心核生命。
>
> 本作最大的風險，從不是「過於獨特」，而是「為求安全而填平唯一的護城河，淪為人人看得懂、卻無人需要的仿作」。
>
> 賣靈魂，不賣皮膚。守住此句，其餘皆為執行。
