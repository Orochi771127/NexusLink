# AGENTS.md — Nexus Link 多 AI 協作規範

> 本檔服從 `NEXUS_LINK_MASTER_CANON_v3.1.md`（最高戰略上位法）。若有衝突，以 `NEXUS_LINK_MASTER_CANON_v3.1.md` 為準。
> 適用對象：Claude Fable 5、Claude Code、Codex、ChatGPT、Gemini、Grok 及所有參與本專案的 AI agent。
> 本檔與 `CLAUDE.md` 對齊；兩者都服從 `NEXUS_LINK_MASTER_CANON_v3.1.md`。

---

## 1. 專案定位

**Nexus Link / 心核連結**是一款情緒棲地型 AI 夥伴養成遊戲。

> 核心標語：「這不是電子寵物，這是你的夥伴。」

夥伴有情緒沉積、記憶痕跡、棲地狀態，**會用身體語言說不**，並因玩家行為而真實、部分不可逆地改變。
美學：Cyber-Taoism / 賽博道教。
禁止退化成：系統公告機 / 無腦順從的寵物 / 普通 RPG 打怪 / 純聊天室。

判斷準則：每個決定都問「**這讓夥伴更像一個有邊界的生命，還是更扁平？**」

**當前階段：Pre-Commercial Vertical Slice / 商業化前垂直切片期。** 本階段目標是 first-session coherence（首輪體驗連貫），不是堆功能；下一階段產品主線是 First Session Flow（新玩家首次體驗）。詳見 `CLAUDE.md` §0.5。

### RaphaelCore / Companion Shell

RaphaelCore 與角色外型解耦。灰影貓是第一個已驗證 runtime 載體與首輪焦點，不是 RaphaelCore 本體，也不是永久唯一中心。所有角色共用 RaphaelCore 的安全憲法；角色差異來自 persona 旋鈕、語氣種子、邊界門檻、身體語言、記憶偏好與冒險傾向。

RaphaelCore is a Stateful Companion Cognition Agent: safety-gated, memory-bearing, boundary-aware, companion-agnostic, and game-integrated. It is not an autonomous task agent, tool-using web agent, therapy/crisis agent, customer-service assistant, sycophantic chatbot, or generic NPC dialogue bot. Gateway / LangGraph / training bundles may advise or route, but cannot override RaphaelCore safety, boundary, memory, state delta, or response policy.

**現行接線（2026-07-16）**：Soul Talk 已直接呼叫 `src/ai/raphaelCore.js`；`PersonaConstitution.js` / `constitutionCritic.js` 已接入其策略與 critic 管線。Expedition 僅為 `Prototype + partial Core bridge`（`coreIntegrated:false`），不得把 event composer / lite critic 說成完整 Core intent、critic、voice 與 memoryWriter 整合。

商業版賣章節、棲地、音樂、故事與新相遇；不做抽卡、稀有度、角色皮膚商城或戰力禮包。旅痕與組隊／同行冒險可作未來擴充，但不得變成 FOMO、每日派遣、離線農場或戰力隊伍。

---

## 2. 三條情感契約 + 七條安全紅線（最高優先，全 agent 共用）

詳見 `CLAUDE.md` 第 1、2 節。摘要：

**契約**：① 牠會記得你，但牠不屬於你。② 牠會靠近你，但不會吞掉你。③ 你能影響牠，但不能支配牠。

**紅線（節選最易踩的）**：
- 不做依賴偵測驅動的行為（`safeHarborMode` 只能由夥伴自身狀態驅動）。
- 裂變等高張力事件的修復必須確定可達、不可失敗，且不做無法挽回的壞結局。
- safetyShield 求助訊息不可變成 gameplay 獎勵。
- 不製造 FOMO / 紅點 / 打卡焦慮；留白是特性。

任何 agent 的產出（程式、美術、文案、規格）違反上述，一律退回。

---

## 3. 技術邊界

理解這是一個雙引擎架構（Web + Unity），但請針對 Web repo 提出相容的 vanilla JS 實作方案，或者告知此功能更適合在 Unity 中實作。

允許：HTML / 純 CSS（`styles.css`）/ Vanilla JS（ES Modules，無 build step）/ PixiJS v8（CDN）/ Three.js（CDN ES Module） / GLB / localStorage（集中於 `saveManager.js`，key=`nexusLinkR2State:v1`）/ GitHub Pages。

**Moonlake Live 3D Hybrid**：月湖營地使用 Three.js 載入 GLB/glTF 即時 3D 棲地。Three.js 負責 3D 環境、水面／瀑布、風吹植被、天氣、日月光照、導航與 world-to-screen 投影；PixiJS 負責 2D illustrated companion 動畫層呈現。

**Global 3D Presentation 受控能力（2026-08-02 Owner 核准）**：Three.js 可依 `docs/design/GLOBAL_3D_PRESENTATION_CONTRACT_V1.md` 在全遊戲逐場景 opt-in 使用固定版本 CDN ES Module 與 GLB/glTF。每個場景必須宣告 lifecycle、read-only snapshot、mobile budget、reduced-motion、context-loss 與 fallback；Three.js 不得持有 simulation、collision、objective、outcome、store、save、RaphaelCore、Safety、Growth 或 reward authority。月湖仍另受 `docs/design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md` 約束；illustrated companion 是否留在 Pixi 層由各 scene contract 決定，不因全域權限自動改成 3D。

Blender 只可作離線建模、pivot／collider proxy 驗證與 GLB 匯出，不是 runtime 或網站 build step。絕對禁止：React、Vue、Svelte、React Three Fiber、TypeScript、CSS 框架、後端、資料庫、LLM API、未核准 npm 套件、任何 build step。全域可用不等於全站 renderer migration 或第二套遊戲狀態。

---

## 4. AI 分工

| AI | 主要職責 |
|----|---------|
| **Gemini Antigravity** | document governance, repository audit, constitution synchronization, docs-only implementation, conflict matrix, acceptance document maintenance |
| **Claude Code** | Unity, Blender, C#, Shader / Shader Graph, NavMesh, Unity Editor automation, Blender Python automation, high-risk runtime implementation |
| **Codex / ChatGPT** | architecture review, TASK_PACK decomposition, risk analysis, acceptance design, code review |
| **ChatGPT image generation** | 角色概念圖、sprite sheet 初稿 |
| **Grok** | Codex / Fable 沒額度時的備援 |

分工原則：
- 此分工是協作資源策略，不是產品情感憲法。
- 圖像生成輸出的資產需經 human 確認後才能進 `assets/`。
- Spine 動畫僅後期高階選項，非 MVP 主線。
- Game Studio 只做任務分類與工作流輔助，不可把 Nexus Link 導回 Phaser、React、TypeScript、npm 或任何 build step。
- Sprite Pipeline 可用於動畫一致性、切格、對齊、anchor、QC；套用時必須遵守 Nexus Link illustrated `512×512` companion 規格，不得回退成 chunky pixel art 預設。
- Generate 2D Sprite 可用於 AI 圖像生成；Nexus Link 預設 `art_style` 應是 project-native / clean_hd / illustrated，不是 `pixel_art`。
- 不得主動產 `64×64` chunky pixel art companion，除非 human 明確要求 legacy pixel asset。

### Companion 美術政策
- 新 companion 是 illustrated / painterly / high-detail，不是 chunky pixel art，也不是 nearest-neighbor pixel-perfect pipeline。
- 新 companion master frame = `512×512 px`；final runtime asset 必須是 transparent PNG。
- Frame 內不可 baked-in 白底、UI、文字、場景、展示台、圖鑑框。
- Companion anchor = bottom-center（概念上 `x: 0.5, y: 1`）；final on-screen position snap 必須保留，避免動畫切換時腳底滑動。
- Companion texture sampling 不再使用 nearest-neighbor；illustrated companion runtime 應使用 linear sampling + mipmaps，清晰度來自 512 高解析母版縮小顯示。
- `greyshade-cat` 現有 443/444 frame 為 legacy accepted，不得 upscale 到 512。
- 任一 sprite sheet edge 必須 `<= 4096 px`；frame grid 必須整除：`sheet_width / cols` 與 `sheet_height / rows` 都必須是整數。
- Scale 必須以 `frameHeight` 計算，不可用整張 `sheetHeight` 計算。
- Runtime 可以使用 downscaled export，不代表所有動畫永遠都要全載 512；必須控制同時載入的 sheet 數量，避免 mobile GPU memory 壓力。
- 既有 pixel-style concept sheets / 舊圖鑑 / 64 PPU / 96px 標記圖保留為 design reference / art canon，不是廢棄，也不可直接視為 runtime companion sprite。
- 若要實裝舊設計，必須依該設計重新輸出 clean `512×512` transparent companion frame。
- 灰影貓 runtime 美術正由 legacy 64 升級為 illustrated 512，採 **reference-audited swap**：新舊資產先並存，**reference audit 通過前不得刪除 legacy**；灰影貓不得 fallback 到其他角色美術。詳見 `CLAUDE.md` 的 Greyshade Cat Replacement Protocol。

---

## 5. 修改授權分級（與 CLAUDE.md 第 5 節一致）

### 5.1 地基層（GROUNDWORK）— 嚴格保守，逐項確認
`index.html`、`saveManager.js`、`store.js` 的 `normalizeState`、`defaultState.js`、`pixiApp.js`、`assets/**`、`tools/**`、`scripts/**`。
修改前：讀取 → 列計畫 → 等 human 確認 → 最小必要 → 列 changed files → 給測試法。

### 5.2 體驗層（EXPERIENCE）— 授權連續施工
戰鬥改造、Soul Talk 升級、邊界/人格深化、星圖填充、記憶/痕跡表現、圖鑑/切換/行動、VFX polish。
這些檔案被授權做有設計野心的重構，不需逐檔拆成獨立確認。

### 5.3 開工協定（A 檔）
體驗層每個 TASK_PACK **開工前回報計畫等 human 點頭**，點頭後可在該包範圍內連續施工到完成，完成後對照 `ACCEPTANCE.md` 自評。
> 地基逐項問；體驗層問一次（開工計畫），然後一路做完。

### 5.4 跨 AI 執行台帳（必讀、必寫）

`docs/agent/AI_EXECUTION_LEDGER.md` 是所有協作 AI 的單一操作交接台帳，
不是產品 canon，也不取代 Git diff、測試或 human 驗收。

- 每個 TASK_PACK 開工前，必讀相關 lane 的最新條目與其 `Required reading`。
- 每個 TASK_PACK 結案或 block 時，必須在相關 lane 追加：完成內容、驗證、
  遇到的狀況／風險、下一個 AI 的安全操作，以及 branch / commit。
- 三個 lane 必須分開寫：`Game Engineering And Architecture`、`Game Art, UI,
  And Visual Production`、`Raphael Core, Companion Reasoning, And Soul Talk`。
  跨 lane 任務必須各寫一筆，不得混成無法追溯的總結。
- 遠端 branch、設計文件或舊測試紀錄不等於已接入目前 runtime；只有 current
  `HEAD`／實際 worktree 驗證可標為 current integration。
- 長任務先追加 `IN PROGRESS`；完成後追加 `VERIFIED`、`COMPLETED` 或
  `BLOCKED`。不可刪除舊條目掩蓋歷史。

---

## 6. 任務執行規則

### 每個 TASK_PACK 開工前明列
```
Task name:        <任務名稱>
Layer:            GROUNDWORK / EXPERIENCE（標明是否觸及地基）
Files touched:    <預期改的檔案；觸及 5.1 者單獨標出>
Red-line check:   <若觸及 battleEngine / safeHarborMode / 安全相關，逐條聲明不違反紅線>
Non-goals:        <本次不做的事>
Acceptance refs:  <對應 ACCEPTANCE.md 的哪幾條>
```

### 嚴格禁止
- 未經 human 明確指示，不可 `git commit` / `git push`。
- 自行擴張任務範圍（「順便重構地基」「順便改 saveManager」）。
- 在未獲授權的地基檔案中寫入。
- 引入任何新外部依賴。
- 繞過紅線達成需求——遇衝突即停、回報。

---

## 7. 角色狀態 Tier

| Tier | 角色 | ID | 規則 |
|------|------|-----|------|
| 1 First Runtime Carrier | 灰影貓 | `greyshade-cat` | 第一個已驗證 runtime 載體、fresh save default / fallback；Initial Bond 後以選定者為 active companion |
| 1 Formal Heartspark Council Stage 1 | 金羽小梟／芽角小鹿／晶鰭小海馬／焰尾狐（幼態：焰尾小狐）／星紋小虎 | `auriowl` / `sprigfawn` / `crystalfin-seahorse` / `blazetail-kit` / `starstripe-cub` | Owner 定版正式五行席位；現行皆為 `full-runtime` / `runtime-ready` / `selectableWhenUnlocked`，仍服從 Initial Bond、章節解鎖與意願制 |
| 1 Formal Ironflow Hackers Stage 1 | 雷霆幼狼／浪花幼獅／星焰鳳凰／幼星駒／金光幼龍 | `thunder-pup` / `wavecub` / `starflame-phoenix` / `star-foal` / `goldenspark-wyrm` | 黑鐵駭客正式五行席位；現行皆為 `full-runtime` / `runtime-ready` / `selectableWhenUnlocked`，但初始鎖定、不自動解鎖、不加入 Initial Bond |
| 1 Runtime Test Carriers | 焰紋狐／冰晶狼／磐石熊／青藤鹿／晶石兔 | `flame-flicker` / `ice-talon` / `stone-shard` / `vine-twist` / `crystal-rabbit` | 現行 `full-runtime` 測試載體，不占正式心輝議會五行席位；未來用途待 Owner 另開 canon/migration 包 |
| 3 Roadmap Runtime Candidate | 星能小山豬 | `star-energy-boarlet` | 可逐章節升級為 runtime candidate；未通過 asset readiness 前不可選 |

圖鑑中的水晶海馬 / 青葉麋鹿為既有 placeholder 展示資料；可列為 future runtime candidate，但必須先完成正式 companion spec、512×512 transparent master asset、human approval 與 asset readiness gate。多角色版本首版仍維持「同一時間只有一隻 active companion」。未來可做同行／組隊內容，但必須是章節後期、非戰力導向、非普通收集 RPG。

焰尾狐的 canonical runtime ID 為 `blazetail-kit`；「焰尾小狐」是 Stage 1 幼態名。舊 ID `flametail-fox` 僅可由 state normalizer 單向遷移，不得加入 registry、Codex、selector、第二份 companion state 或新的資產生成佇列。

### Runtime model（與現況同步）

> 此區描述目前 `companionRegistry.js` / `companionRuntimePolicy.js` 的技術實況；技術實況不覆蓋上方 2026-07-10 Owner 定版的正式 roster。

- Greyshade Cat 是 fresh save 的 default / 壞資料 fallback；Initial Bond 已上線，fresh trio 固定為 `greyshade-cat` / `blazetail-kit` / `crystalfin-seahorse`，選定後 active / unlocked 只保留選定者。Veteran 存檔保留既有解鎖。
- 可以有多個 runtime-ready companion（目前 `flame-flicker` / `ice-talon` / `stone-shard` / `vine-twist` / `crystal-rabbit` 已是 `full-runtime` / `runtime-ready` 並可選，但屬測試載體，不是正式五元守護 roster）。
- 正式五元守護 `auriowl` / `sprigfawn` / `crystalfin-seahorse` / `blazetail-kit` / `starstripe-cub` 已通過資產與 GROUNDWORK promotion，registry 為 `full-runtime` / `runtime-ready` / `selectableWhenUnlocked`。是否能選仍由 `unlockedCompanionIds`、chapter gate 與產品意願制決定，runtime-ready 不等於預設全解鎖。
- 黑鐵駭客（Ironflow Hackers）正式五席 `thunder-pup` / `wavecub` / `starflame-phoenix` / `star-foal` / `goldenspark-wyrm` 已通過各自的資產與 GROUNDWORK promotion，registry 同為 `full-runtime` / `runtime-ready` / `selectableWhenUnlocked`。五席初始保持鎖定；Codex Stage 1 名錄應預先列出全部 Stage 1 角色並標示未相遇／鎖定，但 companion selector／active companion 仍須先合法解鎖，且不得改寫 Initial Bond 三席。Codex 可見不建立 relationship、readiness 或選用資格。
- 【2026-07-06 Owner 修訂，見 Master Canon §1.3.1】棲地日常仍以單一 active companion 為情感主體；**對峙可組共鳴圈**：最多三隻已結緣夥伴同場面對裂隙雜訊。
- 共鳴圈不是戰力隊伍：無輸出排行、無等級裝備、無屬性刷關、無站位商品化；夥伴以五行心相與陪伴姿態參與，各有自身疲勞與邊界（過勞會先退到圈外）。
- 夥伴加入採**意願制**：章節通關解鎖「共鳴邀請」資格，由牠依關係狀態回應；牠可以說「還不是時候」，且永遠可再培養。
- 不做每日派遣、離線收益農場。
- 正式產品方向是 chapter-gated unlock（七區七章，自月湖營地起；詳見 `docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md`）。
- `defaultState.js` 的 fresh save 目前只解鎖 `greyshade-cat`；測試若需多角色，必須用明示 fixture / dev flow，不得把測試全解鎖寫回產品預設。
- Greyshade 替換是 **asset-readiness-gated GROUNDWORK swap**：legacy 64 → illustrated 512，先並存後退役，audit 通過前不刪 legacy。
- single-active-companion 模型不因替換而改變；灰影貓不得 fallback 到其他角色美術。
- `crystal-rabbit` 已使用自己的 `assets/characters/crystal-rabbit/` runtime root；過去借用 `thunder-pup` 目錄的命名債已解除。
- 正式五元守護共用 animation ID，但不得共用四足姿勢模板；鳥型、海馬懸浮、鹿型蹄步、狐型與虎型動作翻譯以 `docs/art/SPECIES_MOTION_TRANSLATION.md` 為準。
- 黑鐵駭客五席共用 animation ID，但犬科、貓科、陸棲幼鳥、馬科與陸棲幼龍各自服從 `docs/art/BLACK_IRON_HACKERS_STAGE1_SPECIES_MOTION_TRANSLATION.md`；persona 只調整角色表達，D2 safety terminal 永遠先於 faction／persona。
- 心域遠征保持 Prototype；現行 `expeditionCoreBridge.js` 的 `coreIntegrated:false` 是強制誠實標記，Owner seal、feel-check 與完整 Core 鏈未完成前不得升格為 commercial-ready。

### World faction model（Linkara）

- Linkara 世界地圖固定七區：東南熔爐丘陵區、中央輝耀核心區、北部翠綠平原區、南港、月湖營地、秘境山脈核心、西南潮汐邊疆區。
- 三勢力固定為心輝議會、黑鐵駭客、混頓裂隙；玩家口語可見「混沌裂隙」，正式 canon 用「混頓裂隙」。
- 三勢力各有金、木、水、火、土五個角色席位；副屬性只能作風格，不取代五行席位。
- 黑鐵駭客正式英文名為 `Ironflow Hackers`；五席固定為木 `thunder-pup`、水 `wavecub`、火 `starflame-phoenix`、土 `star-foal`、金 `goldenspark-wyrm`。
- 灰影貓與星能小山豬是中立心核生命，不屬於三勢力，也不占五行 roster。

---

## 8. 高風險與廢棄檔案

### 高風險（地基，未確認不得改）
`index.html` ・ `src/pixi/pixiApp.js` ・ `src/state/saveManager.js` ・ `src/state/store.js` ・ `assets/**` ・ `tools/**` ・ `scripts/**`

### 廢棄但 LOCKED（保留勿刪）
`main.js`（早期 prototype）・ `style.css`（舊 CSS）・ `script.js`（CI `node --check` stub）。
**刪除 `script.js` 會破壞 static check gate。三者一律不刪不改。**

---

## 9. 指定改造項警語

- **`battleEngine.js` / `battleController.js`**：現行玩家契約已是情緒對峙（穩定心核 / 建立邊界 / 回收記憶），非 HP 歸零；任何深化不得退回傳統戰鬥。`battleRecord.wins/losses` 僅為 compatibility-only schema；觸及 `index.html` battle-modal 結構時需分開確認。
- **`safeHarborMode.js` / `emotionalSedimentationEngine.js` / `safetyShieldDictionary.js`**：安全層核心，修改前重讀紅線並逐條聲明合規。
- **Companion Growth / evolution / Growth UI / Codex stage**：開工前必讀 `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`。該檔是現行設計／驗收 SSOT；G1／G2／G3 foundation 與 G3.1 Heart Phase care source 已接入。Live runtime source family 為 exploration／standoff／care，明示接受的 companion rewrite 可封存 consent anchor；不依賴 standoff 的 readiness 路徑、G4 覺醒邀請／stage advance 與形態 swap仍未實作。不得把 bond、R2 五階、Expedition crafting 或 `src/ai/evolution/**` 誤稱為正式養成 gate；`evolutionLines.js` 的 bondThreshold 只剩 compatibility data。正式形態資產仍須另取 GROUNDWORK 核准。

---

## 10. 參考文件

- `NEXUS_LINK_MASTER_CANON_v3.1.md` — 最高戰略上位法（最高 canon）。
- `CLAUDE.md` — 協作入口與執行規範（先讀，但服從 Master Canon v3.1）。
- `ACCEPTANCE.md` — 契約 → 可驗收 assertion 對照表。
- `docs/design/COMPANION_GROWTH_CONTRACT_V1.md` — 心核夥伴養成、三階覺醒、證據、安全、migration 與未來對練的設計／驗收 SSOT（G1／G2／G3／G3.1 Care Source 已接入；G4+ 尚未實作）。
- `docs/handoff/RAPHAEL_AI_HANDOFF.md` — **Raphael AI 現況交接（接手 Soul Talk / RaphaelCore 前必讀）**。
- `docs/handoff/RAPHAEL_AI_STATUS.yaml` — Raphael AI 機器可讀狀態（branch / QA 數字）。
- `docs/raphael/RAPHAEL_EXPEDITION_EVAL_CONTRACT.md` — Expedition Prototype / partial Core bridge 的權限與發版邊界。
- `docs/agent/AI_WORKFLOW.md` — Gate 流程。
- `docs/agent/TASK_TEMPLATE.md` — 任務模板。
- `docs/testing/MANUAL_TEST_CHECKLIST.md` — 手動測試清單。
