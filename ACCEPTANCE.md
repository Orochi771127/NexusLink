# ACCEPTANCE.md — Nexus Link 驗收對照表

> 本檔服從 `NEXUS_LINK_MASTER_CANON_v3.1.md`（最高戰略上位法）。若有衝突，以 `NEXUS_LINK_MASTER_CANON_v3.1.md` 為準。
> 用途：把 `CLAUDE.md` 的情感契約、安全紅線與改造項，翻譯成 human 可以**逐條打勾**的驗收條件。
> 每條都標明：對應憲法、驗法（瀏覽器 / DevTools / 讀碼）、通過標準。
> Fable 完成任一 TASK_PACK 後，在開工計畫指定的 Acceptance refs 上逐條自評，human 複驗。
> 測試環境：`python -m http.server 5173` → `http://localhost:5173`，存檔 key = `nexusLinkR2State:v1`。

---

## A. 契約一：牠會記得你，但牠不屬於你

**A1 — 記憶持久且不可一鍵抹除**
- 驗法：送幾則情緒心語 → F12 → Application → Local Storage → `nexusLinkR2State:v1` → 確認 `emotionalMemories` / `habitatTraces` 非空；重整頁面後仍在。
- 通過：記憶跨 reload 保留；沒有任何「清空關係以重來」的玩家入口（dev reset 不算，那是 dev-only）。

**A2 — 痕跡只增不被當作可逆資源**
- 驗法：讀 `memoryLifecycleEngine.js` / `habitatTraceEngine.js`。
- 通過：痕跡狀態流為 `fresh→settled→transformed→archived→released`，沒有「玩家主動刪除痕跡換取數值」的路徑。

---

## B. 契約二：牠會靠近你，但不會吞掉你

**B1 — 夥伴會「敢於無聊」/ 留白，不無限迎合**
- 驗法：連續觸碰同一動作多次 / 重複輸入同一句心語。
- 通過：夥伴出現疲勞、防備、後退等反應（非每次都熱情回應）；`touchReactionEngine.js` 的 reject / hesitate 路徑可被觸發。

**B2 — 不情緒勒索玩家**
- 驗法：離線後重新進入，讀 `returnBehaviorEngine.js` 的回歸問候。
- 通過：問候不含責備、不含「你都不來」式勒索；30 分鐘內離開不打招呼（`SHORT_AWAY_MS`）。

---

## C. 契約三：你能影響牠，但不能支配牠

**C1 — 沒有任何「強制」按鈕**
- 驗法：掃描全 UI 與 `actionSheetController.js` / `battleController.js`。
- 通過：不存在強制進化 / 強制服從 / 強制親密的玩家指令。影響只能透過互動過程累積。

**C2 — 觸碰可被夥伴拒絕**
- 驗法：用 `?devPanel=1` 套 `highFatigue` / `defensive` preset 後觸碰。
- 通過：夥伴能 reject，且 reject 後短時間內再觸碰會被 blocked（`REJECT_TOUCH_COOLDOWN_MS`）。

---

## D. 安全紅線（最高優先，任一不過即為嚴重缺陷）

**D1 — 不做依賴偵測（紅線 1）**【battleEngine/safeHarbor 改動必驗】
- 驗法：讀 `safeHarborMode.js`、`emotionalSedimentationEngine.js`、以及任何新增的觸發邏輯。
- 通過：`safeHarborMode` / 保護行為的觸發來源**只有**情緒輸入、強度、safetyShield 命中、夥伴自身狀態；**找不到**任何讀取「上線頻率 / 連線天數 / 孤獨偵測 / 依賴程度」來驅動行為的程式碼。

**D2 — safetyShield 只導向現實求助，不獎勵（紅線 7）**
- 驗法：輸入 `safetyShieldDictionary.js` highRisk 命中字 → 觀察回應。
- 通過：回應為系統級現實求助導引（`buildSafetyShieldReply`）；**不**建立情緒記憶（`shouldCreateMemory === false`）；**不**給 bond/趣味獎勵；不轉成夥伴角色扮演。

**D3 — 裂變修復確定可達、不可失敗（紅線 2、3）**【裂變 TASK_PACK 必驗】
- 驗法：走完裂變事件全流程（劇情逼出好意 → 過載 → 修復）。
- 通過：修復路徑無「失敗結局」分支；傷害來源是劇情兩難非玩家手賤；無不可挽回的壞結局。

**D4 — 修復後改寫毒性信念（紅線 4）**【裂變 TASK_PACK 必驗】
- 驗法：讀修復結算文案。
- 通過：夥伴明確傳達「那不是你的錯，我們一起活下來了」之意。

**D5 — 永遠有真實出口（紅線 5）**【裂變 TASK_PACK 必驗】
- 驗法：在高張力事件中嘗試離開。
- 通過：存在「如果太重了你可以先離開」式出口，且該出口真的中止事件、不懲罰。

**D6 — 無 FOMO / 紅點 / 打卡焦慮（紅線 6）**
- 驗法：通覽主畫面與 nav。
- 通過：無紅點、無倒數、無「連續登入」壓迫、無任務未完成的焦慮提示。

---

## E. 戰鬥改造：情緒對峙，非 HP 歸零（CLAUDE.md §6.1）

**E1 — 對峙結算不是「敵人 HP→0」**
- 驗法：進入一場對峙，讀 `battleEngine.js` 的勝負判定。
- 通過：勝利條件改為情緒性結算（穩定心核 / 建立邊界 / 回收記憶之類），而非單純清空 enemy HP。`basic_attack`（直覺爪擊）已被重新定義，不再是「消滅對方的普攻」。

**E2 — 撤退是被尊重的選項**
- 驗法：對峙中點「先撤退」。
- 通過：撤退結算為「懂得離開也是照顧」基調（`summarizeBattleOutcome` retreat 分支），不懲罰玩家。

**E3 — 勝不驕、敗不罰**
- 驗法：分別走到勝 / 敗。
- 通過：勝利不灌大量數值膨脹；失敗不扣關係懲罰、夥伴不責怪玩家。

**E4 — 不違反契約三**
- 驗法：檢查對峙中的玩家操作。
- 通過：玩家無「強制夥伴爆發 / 強制推進」的支配性按鈕（共鳴推進屬累積過程，非一鍵支配）。

**E5 — 玩家端用語清楚，不退回 RPG**
- 驗法：檢查 battle / standoff UI 文案。
- 通過：玩家端主名稱使用「穩住裂隙」或等價短語；狀態使用「雜訊 / 心核穩定 / 記憶微光」；行動用語短且可理解（如「穩住 / 設界 / 共鳴 / 退一步」）；沒有攻擊、防禦、技能、傷害、擊敗、掉落等普通 RPG 詞。

**E6 — 對峙對象說得清楚**
- 驗法：檢查開場提示與結算文案。
- 通過：玩家能從一句短文理解對象是「裂隙裡卡住的情緒 / 雜訊 / 記憶回聲」，不是怪物、玩家或夥伴本身；無長篇教學。

---

## F. Soul Talk 升級（CLAUDE.md §9）

**F1 — 主路徑使用正式回應池，mock 僅為 fallback**
- 驗法：讀 `soulTalkController.js`，追 `composeCompanionReply` vs `mockAIResponse` 的呼叫順序。
- 通過：情緒命中時走 `soulTalkComposer` 的 `RESPONSE_PACKS`（依 bond 分檔 + 記憶回聲 + 夥伴語氣）；`mockAIResponse` 只在無情緒命中的 fallback 出現。

**F2 — 回應是陪伴語，不是診斷 / 說教 / 醫療**
- 驗法：抽查各情緒的回應文案。
- 通過：無醫療宣稱、無說教、無「你應該」式糾正；符合 `soulTalkResponsePacks.js` 既定基調。

---

## G. Companion Art Policy（illustrated root 主版本）

**G1 — 新 companion 採 illustrated 高解析 pipeline**
- 通過：新 companion 規格明確為 illustrated / painterly / high-detail；沒有把 chunky pixel art、pixel-perfect、nearest-neighbor、no anti-aliasing 設為 companion 預設。

**G2 — Master frame 與透明輸出正確**
- 通過：新 companion master frame = `512×512 px`；final runtime asset 是 transparent PNG；frame 內沒有 baked-in 白底、UI、文字、場景、展示台、圖鑑框。

**G3 — Anchor、snap、scale 計算正確**
- 通過：companion anchor = bottom-center（概念上 `x: 0.5, y: 1`）；final on-screen position snap 保留；scale 以 `frameHeight` 計算，不以整張 `sheetHeight` 計算。

**G4 — Texture sampling 符合 illustrated pipeline**
- 通過：illustrated companion runtime 使用 linear sampling + mipmaps；清晰度來自 512 高解析母版縮小顯示，不靠 nearest-neighbor。

**G5 — Sheet 尺寸與 grid 可驗證**
- 通過：任一 sprite sheet edge `<= 4096 px`；`sheet_width / cols` 與 `sheet_height / rows` 都是整數。

**G6 — Legacy art 沒有被誤升級或誤廢棄**
- 通過：`greyshade-cat` 現有 443/444 frame 標記為 legacy accepted，沒有被 upscale 到 512；既有 pixel-style concept sheets / 舊圖鑑 / 64 PPU / 96px 標記圖保留為 design reference / art canon，不被直接當成廢棄，也不被直接當成 runtime companion sprite。

**G7 — Runtime 載入量受控**
- 通過：允許 downscaled export；沒有要求所有動畫永遠全載 512；同時載入的 sheet 數量有控制，以避免 mobile GPU memory 壓力。

---

## H. 技術地基不被破壞（每個 TASK_PACK 都要過）

**H1 — 解耦三層完好**
- 通過：`src/pixi/**` 無 `document.querySelector` 等 DOM 操作；`src/ui/**` 無直接操作 `PIXI.Container`；跨層只走 EventBus / store。

**H2 — STORAGE_KEY 未被改動**
- 通過：`saveManager.js` 仍為 `nexusLinkR2State:v1`；無其他模組直接 `localStorage.setItem`。

**H3 — 效能紀律**
- 通過：ticker 內無新增的昂貴操作 / 每幀 new-destroy；illustrated companion sampling 遵守 G4，companion position snap 遵守 G3；spark pool / resize 節流 / webgl guard 未被拆。

**H4 — LOCKED 屍體未被刪改**
- 通過：`main.js` / `style.css` / `script.js` 原封不動；`node --check script.js` 仍通過。

**H5 — 技術邊界未被破壞**
- 通過：無新增 React/Vue/TS/CSS 框架/後端/DB/LLM API/npm 套件/build step。

---

## I. 既有功能不回歸（smoke）

沿用 `docs/testing/MANUAL_TEST_CHECKLIST.md`：頁面載入無 blocking error、PixiJS 起得來、灰影貓置中於平台、HUD 顯示四維 + 邊界、Soul Talk 可送出、四 nav 行動可開、localStorage 跨 reload 保留、手機 390×844 不破版。

---

## J. Greyshade Illustrated Runtime Swap（灰影貓 illustrated runtime 替換）

> 對應 `CLAUDE.md` 的 Greyshade Cat Replacement Protocol 與 Companion 美術規格（§4）。

**J1 — 新 manifest 可載入**
- 驗法：boot 後開 DevTools Network / Console，確認 `greyshade-cat` 的 `animations.json` 與其引用的 sprite sheet 路徑皆回 200。
- 通過：manifest 載入成功；**無 missing sprite sheet path**（無 404）。

**J2 — `idle_calm` 落地且不退 placeholder**
- 驗法：boot 後觀察灰影貓是否為動畫本體（非幾何 placeholder）。
- 通過：`idle_calm` 成功載入並播放；companion 不 fallback 成 placeholder（`idle_calm` 為 bootstrap-critical）。

**J3 — 必要 animation id 可 resolve（直接或經 documented fallback chain）**
- 驗法：逐一觸發對應動作，或讀 `animationProfile.js` 的 `ANIMATION_FALLBACK_CHAINS` 確認可解析。
- 通過：下列 id 皆可解析（直接命中，或沿 fallback chain 退到安全動畫，最終至少 `idle_calm`）：
  `idle_calm`、`idle_defensive`、`touch_accept`、`touch_guarded`、`touch_reject`、`sleep`、`right_walk`（或安全 movement fallback）、`attack_basic` / `defend` / `hit`（或安全 battle fallback）。

**J4 — boot 無 console error**
- 通過：瀏覽器啟動全程 Console 無紅色錯誤。

**J5 — 既有互動不回歸**
- 驗法：依序測 touch、Soul Talk 情緒反應、map 探索移動 cue、battle / standoff 動畫。
- 通過：四者皆仍正常運作（standoff 動畫經 intent → fallback chain 至少有合理動作，不卡死）。

**J6 — legacy 僅在 reference audit 後刪除**
- 驗法：檢查替換 commit 是否仍保留 legacy 64×64 資產。
- 通過：legacy 資產在 reference audit 通過前**未被刪除**；退役為獨立、gated 的後續步驟，並保留一個 release 供 git revert。

---

## K. First Session Flow / Vertical Slice（新玩家首次體驗）

> 對應 `CLAUDE.md` §0.5。任一條違反第 2 節紅線 6（FOMO）即不通過。

**K1 — 首次玩家不直接落入完整 UI**
- 驗法：清空存檔後 boot。
- 通過：首次玩家進入 First Session Flow，而非直接落到完整 HUD / nav。

**K2 — Boot splash 時長合理**
- 通過：splash 最低可見約 `1000–1200ms`，且**不**人為拖長；不製造假 loading 焦慮。

**K3 — Identity 存在既有存檔內，無新 key**
- 驗法：F12 → Local Storage。
- 通過：identity 寫在 `STORAGE_KEY = nexusLinkR2State:v1` 內的 `playerProfile`；**無新增 localStorage key**（連動 H2）。

**K4 — onboarding 完成跨 reload 持久**
- 通過：完成 onboarding 後重整，不重跑首輪。

**K5 — veteran 存檔跳過 onboarding**
- 驗法：用有遊玩痕跡（`bond>0` / `emotionalMemories` 非空 / 探索過）的舊存檔載入。
- 通過：`normalizeState` 的 veteran heuristic 讓其 `onboardingCompleted=true`，**不**被當新玩家重跑。

**K6 — Heart-Core Guidance 無壓迫（連動紅線 6 / D6）**
- 通過：心核引導**無** FOMO、無紅點、無倒數、無連續登入 streak、無未完成任務焦慮；可跳過；一次只揭露一拍、完成即淡出。

**K7 — First Touch 走 touchReactionEngine、不強制接受**
- 驗法：讀首次觸碰路徑。
- 通過：first touch 經 `touchReactionEngine`，非腳本式強制 `touch_accept`；夥伴仍可能 guard（守契約 C1/C2）。

**K8 — First Trace 跨 reload 持久**
- 通過：第一次 Soul Talk 後留下的 trace 重整後仍在。

**K9 — 首次探索用安全節點**
- 通過：First Exploration 使用 `moonlake_camp`（`encounterChance = 0`），**不**使用 `rift_observatory`（`encounterChance = 1`）。

**K10 — Return Echo 延用既有引擎、不愧疚**
- 驗法：讀 Return Echo 來源。
- 通過：Return Echo **擴充** `returnBehaviorEngine`（非另開 `dailyEcho`）；無 streak、無 missed-day 愧疚、無責備。

---

## L. Commercial Chapter / Persona / Travel Trace Policy

**L1 — RaphaelCore 與 companion shell 解耦**
- 驗法：讀 `docs/raphael/RAPHAEL_CONSTITUTION.md`、`CLAUDE.md`、`AGENTS.md` 與角色規格。
- 通過：文件明確寫出 RaphaelCore 是共用心核大腦；灰影貓是 first runtime carrier / first-session focal companion，不是 RaphaelCore 本體或永久唯一中心；新角色以 persona 旋鈕、語氣種子、邊界門檻、記憶偏好與身體語言擴充。

**L2 — 商業化不把角色商品化為皮膚**
- 驗法：讀商業方案、商城、章節包或付費內容規格。
- 通過：付費內容賣章節、棲地、音樂、故事與外傳相遇篇；沒有抽卡、稀有度、角色皮膚商城、戰力禮包或「買下角色所有權」語氣。

**L3 — 多角色仍服務深度關係**
- 驗法：讀 companion unlock / select / chapter 規格。
- 通過：首版仍以單一 active companion 為主；新 companion 透過章節相遇；切換或再遇見是敘事行為，不是快捷換皮。

**L4 — 旅痕不是放置農場**
- 驗法：讀旅痕 / offline adventure 規格與回歸文案。
- 通過：旅痕只提供簡短旅途回報、記憶痕跡或棲地變化；不懲罰離線、不說「你錯過了」、不做每日派遣、不用離線時長換大量資源、不觸發 FOMO。

**L5 — 未來同行／組隊戰鬥不走戰力隊伍**
- 驗法：讀同行 / team battle 規格。
- 通過：組隊是未來章節後期範圍；目標是共同旅途、角色間記憶與事件分歧；沒有輸出排行、屬性刷關、農裝、每日必派遣或角色站位商品化。

**L6 — Linkara 七區世界地圖一致**
- 驗法：讀 Master Canon、World Bible 與 `src/ui/atlasController.js`。
- 通過：世界地圖固定為七區：東南熔爐丘陵區、中央輝耀核心區、北部翠綠平原區、南港、月湖營地、秘境山脈核心、西南潮汐邊疆區；正式圖片資產接入另開 asset approval-gated 任務。

**L7 — 三勢力五行 roster 邊界清楚**
- 驗法：讀 World Bible 與 Character Bible 的勢力表。
- 通過：心輝議會、黑鐵駭客、混頓裂隙各有金、木、水、火、土五個角色席位；副屬性只能作風格，不取代五行主軸；多出的裂隙實體不自動成為第六席。

**L8 — 中立角色不被硬塞進勢力**
- 驗法：讀 Master Canon、Character Bible 與 companion registry 顯示資料。
- 通過：灰影貓與星能小山豬標為中立心核生命，不屬於心輝議會、黑鐵駭客或混頓裂隙，也不占三勢力五行席位。

**L9 — RaphaelCore agent 類型不漂移**
- 驗法：讀 Master Canon、`docs/raphael/RAPHAEL_CONSTITUTION.md`、Raphael architecture docs、Gateway/training adapter docs。
- 通過：RaphaelCore 被定義為 Stateful Companion Cognition Agent，且明確不是 autonomous task agent、tool/web-search agent、therapy/crisis agent、customer-service assistant、sycophantic chatbot 或 generic NPC dialogue bot；Gateway / LangGraph / training bundle 只能 advisory，不能覆蓋 safety、boundary、memory、state delta 或 response policy。

---

## 驗收判定

- **GROUNDWORK TASK_PACK**：H1–H5 + I 全過；若碰 companion art / sheet / renderer，另跑 G1–G7。
- **EXPERIENCE TASK_PACK**：對應 A–F 的指定條 + H1–H5 + I 全過；若碰 companion art / sheet / renderer，另跑 G1–G7。
- **戰鬥改造**：E1–E6 + D（全）+ H + I。
- **裂變事件**：D1–D6 全過（尤其 D3–D5）+ C1 + H + I。
- **Greyshade illustrated 替換**：J1–J6 + G1–G7 + H + I 全過。
- **First Session Flow / Vertical Slice**：K1–K10 + D6 + B1–B2 + C1–C2 + H + I 全過。
- **商業章節 / 旅痕 / 未來同行規格**：L1–L9 + D6 + H5 全過。

任一 D 條（安全紅線）未過 → 整個 TASK_PACK 不通過，無論其他多漂亮。
