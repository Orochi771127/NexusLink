# ACCEPTANCE.md — Nexus Link 驗收對照表

> 本檔服從 `NEXUS_LINK_MASTER_CANON_v3.1.md`（最高戰略上位法）。若有衝突，以 `NEXUS_LINK_MASTER_CANON_v3.1.md` 為準。
> 用途：把 `CLAUDE.md` 的情感契約、安全紅線與改造項，翻譯成 human 可以**逐條打勾**的驗收條件。
> 每條都標明：對應憲法、驗法（瀏覽器 / DevTools / 讀碼）、通過標準。
> Fable 完成任一 TASK_PACK 後，在開工計畫指定的 Acceptance refs 上逐條自評，human 複驗。
> 測試環境：`python -m http.server 5173` → `http://localhost:5173`，存檔 key = `nexusLinkR2State:v1`。
>
> **G4 命名空間（EVO-00）**：本檔 §G 的 **G4 是 Art G4／Texture Sampling**。Companion Growth 契約的 G4 是 **Growth G4／Awakening Invitation**，尚未實作。正式進化 Runtime 的獨立驗收使用本檔文末 **SOV-01～SOV-12**。文件寫入 SOV 不等於 Runtime 已完成。

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

**E7 — 共鳴協議只邀請合法夥伴，零至三位皆可玩**
- 驗法：用零／一／二位支援者 fixture，交叉測 known／joined／unlocked／runtime-enabled／owner match；再注入未知、鎖定、非 runtime 與 owner mismatch id。
- 通過：同場上限是 active lead 加最多兩位圈員；只有全部合法者可被邀請，非法或損壞資料 fail closed。零圈員與單圈員都能完成原有對峙；UI 不顯示空槽、戰力推薦或「湊滿三位」。沒有明示選擇時才沿用 `joinedAt` 早者優先；圈員與共同約定不持久化。

**E8 — 夥伴參與有接受、改寫、休息與拒絕**
- 驗法：覆蓋 `steady / curious / guarded / resting / distant / blocked boundary / safeHarborMode`，比較 preparation、session、relationship、Growth、reward、memory 與 trace。
- 通過：接受與合法改寫可進圈；休息／拒絕不被替補、不扣關係、不產生 evidence。Guarded 可把靠近改寫為圈邊見證；明確拒絕與 blocked boundary 不被繞過。Safe harbor 不建立 preparation、不播回應變體、零 gameplay state delta。

**E9 — 共鳴託付是確定性領拍，不是三倍輸出**
- 驗法：同一 seed／session／approach 重跑，覆蓋 `adaptive / attune / shelter`、`surge / gather / lull`、低穩定、高疲勞、無邊界與 pulse 不合法。
- 通過：相同輸入得到相同 decision；每拍恰好一個合法 lead action，圈員只能執行既有 bounded stance。安全覆寫先於共同約定，候選一律通過 `canUseAction()`；不得讀 bond／trust／stage 計算服從、威力或暗中破壞率。

**E10 — 手動同行、接手、暫停與撤退永遠可達**
- 驗法：分別以 `manual`／`entrusted` 開場；在預示、lead animation、noise turn 前後暫停／接手／撤退，另測頁面失焦、panel owner 改變與第 20 拍。
- 通過：`manual` 保留既有四個 action；`entrusted` 每場明示且不保存。接手不重建 session、不重擲 `nextIntent`；失焦／owner 改變即暫停。自主 20 拍未結束時只暫停並提供接手／撤退，不自動判負；撤退任何時刻可達。

**E11 — 每場一次共鳴請託不是命令**
- 驗法：對仍在圈內的夥伴分別請託 `barrier / resonance / pulse`，覆蓋 accept／rewrite／rest／decline、不安全 action、重複送出與非圈員目標。
- 通過：請託每場只解析一次；四種回應都消耗該次機會，只影響下一個 lead action。Guarded 或不安全請求改寫成安全的設界／共鳴；休息與拒絕被尊重。無 bond、trust、Growth、reward、memory、trace 或 cooldown 寫入。

**E12 — 三位夥伴可見，但 renderer 無權改結果**
- 驗法：以三個不同角色開場，逐一觸發 lead／support／rest／outcome；注入單一資產載入失敗，結束 modal 後檢查 timer、listener、Pixi node 與 store diff。
- 通過：active 在中央前方、兩位圈員在左右後方；每位有自己的 intent、body cue 與 breath／rest 狀態。專用事件以 `companionId` 路由，不借 active-only event 錯播圈員。Renderer 只表演、不讀寫 settlement／relationship／Growth；失敗只 fallback 同角色，teardown 後資源歸零。

**E13 — 共鳴圈 R2 保留四種安全結局與 authority seam**
- 驗法：在 manual／entrusted、零／一／二圈員下走完 `stabilized / recovered / retreated / overwhelmed_but_safe`，追蹤 autonomy、controller、renderer、RaphaelCore／Nuwa 與 `battleEngine` 的輸入輸出。
- 通過：四種結局與既有 first-clear／Growth authority 不變，沒有第五種 win／lose、死亡、淘汰或懲罰結算。Autonomy 只選 action，`battleEngine` 是唯一逐拍結算權威；RaphaelCore 只在賽前／賽後表達，Nuwa 維持 `trusted:false`，兩者都不改 RNG、stats、outcome 或 safety terminal。

**E14 — 三心同場可及、可讀且不壓進 First Session**
- 驗法：在 `390x844`、`390x664`、desktop、200% 文字、鍵盤、觸控、screen reader 與 reduced motion 檢查共鳴協議和對峙；另以 fresh save 跑完整 First Session 十拍至 Return Echo。
- 通過：裂隙預示、三位角色、理由、呼吸與控制列無遮擋、無水平 overflow；主要 target 至少 44px，新觸控操作以 48px 為目標。Reduced motion 只移除位移／震動，不隱藏理由或改 gameplay timing truth。Return Echo 前不出現 R2 準備畫面、教學、空槽、紅點、倒數或收集提示；沒有合法圈員時維持原單夥伴流程。

**E15 — 生態相位、共鳴織痕與裂隙譜式都是零壓力練習**
- 驗法：切換晨／晝／暮／夜並比較可用內容與 state delta；用 pointer、touch、keyboard、reduced motion 完成／退出／重玩共鳴織痕；在已通關節點分別完成 `solo_witness / shared_breath / cross_current`。
- 通過：四相位隨時可選且回報完全等價，沒有倒數、錯過或收益倍率。織痕不可選取 companion，未完成／退出／重玩皆零損失且 `permanentDelta:null`。三種譜式不建立 stage、排名或獎勵，整場不寫 relationship、memory、progress、Growth 或 save；仍只由既有 `battleEngine` 結算四種安全 outcome。

---

## F. Soul Talk 升級（CLAUDE.md §9）

**F1 — 主路徑使用正式回應池，mock 僅為 fallback**
- 驗法：讀 `soulTalkController.js`，追 `composeCompanionReply` vs `mockAIResponse` 的呼叫順序。
- 通過：情緒命中時走 `soulTalkComposer` 的 `RESPONSE_PACKS`（依 bond 分檔 + 記憶回聲 + 夥伴語氣）；`mockAIResponse` 只在無情緒命中的 fallback 出現。

**F2 — 回應是陪伴語，不是診斷 / 說教 / 醫療**
- 驗法：抽查各情緒的回應文案。
- 通過：無醫療宣稱、無說教、無「你應該」式糾正；符合 `soulTalkResponsePacks.js` 既定基調。

**F3 — 手機先看見最新夥伴回覆**
- 驗法：跑 `node docs/qa/soul-talk-mobile-viewport-r1-cases.mjs` 與
  `node docs/qa/soul-talk-mobile-viewport-r1-browser.cjs`；在 `390×844`、
  Safari-like `390×664` 連續送出短句與長句。
- 通過：最新玩家訊息＋夥伴回覆若能放進 chat viewport，整個最新回合都可見；
  若最新回合本身過長，第一段夥伴回覆必須已進入視野，不得只把玩家訊息固定在
  對話區底部、讓夥伴回覆從折線外才開始。面板不覆蓋底部導覽，文件無水平溢出。

**F4 — 快速回覆是單排、短文案、可觸控**
- 驗法：同 F3 focused QA；另測鍵盤 focus、200% 文字與 reduced motion。
- 通過：繁中三個快速回覆在 `390px` 寬度內同列且無需水平拖曳；列高不超過
  `44px`，每個 chip 觸控高度至少 `44px`，不出現 `（換個說法）` 冗長後綴。
  較長語系可水平捲動但不可增加第二排；鍵盤狀態 composer 仍完整可見；低動態
  模式停止心湖聲紋動畫。高風險 safety 回合仍為零快速回覆。

---

## G. Companion Art Policy（illustrated root 主版本）

**G1 — 新 companion 採 illustrated 高解析 pipeline**
- 通過：新 companion 規格明確為 illustrated / painterly / high-detail；沒有把 chunky pixel art、pixel-perfect、nearest-neighbor、no anti-aliasing 設為 companion 預設。

**G2 — Master frame 與透明輸出正確**
- 通過：新 companion master frame = `512×512 px`；final runtime asset 是 transparent PNG；frame 內沒有 baked-in 白底、UI、文字、場景、展示台、圖鑑框。

**G3 — Anchor、snap、scale 計算正確**
- 通過：companion anchor = bottom-center（概念上 `x: 0.5, y: 1`）；final on-screen position snap 保留；scale 以 `frameHeight` 計算，不以整張 `sheetHeight` 計算。

**G4 — Texture sampling 符合 illustrated pipeline（Art G4；不是 Growth G4）**
- 通過：illustrated companion runtime 使用 linear sampling + mipmaps；清晰度來自 512 高解析母版縮小顯示，不靠 nearest-neighbor。
- 命名空間：此條只驗美術取樣。覺醒邀請／stage advance 見文末 SOV-01～SOV-12，狀態為尚未實作。

**G5 — Sheet 尺寸與 grid 可驗證**
- 通過：任一 sprite sheet edge `<= 4096 px`；`sheet_width / cols` 與 `sheet_height / rows` 都是整數。

**G6 — Legacy art 沒有被誤升級或誤廢棄**
- 通過：`greyshade-cat` 現有 443/444 frame 標記為 legacy accepted，沒有被 upscale 到 512；既有 pixel-style concept sheets / 舊圖鑑 / 64 PPU / 96px 標記圖保留為 design reference / art canon，不被直接當成廢棄，也不被直接當成 runtime companion sprite。

**G7 — Runtime 載入量受控**
- 通過：允許 downscaled export；沒有要求所有動畫永遠全載 512；同時載入的 sheet 數量有控制，以避免 mobile GPU memory 壓力。

---

## H. 技術地基不被破壞（每個 TASK_PACK 都要過）

**H1 — 解耦三層完好**
- 通過：`src/pixi/**` 無 `document.querySelector` 等 DOM 操作；`src/ui/**` 無直接操作 `PIXI.Container`；跨層只走 EventBus / store。確保 Three.js 負責 3D 棲地投影，而 PixiJS 負責 2D 夥伴與 UI overlay。雙方不應互相干擾存檔。

**H2 — STORAGE_KEY 未被改動**
- 通過：`saveManager.js` 仍為 `nexusLinkR2State:v1`；無其他模組直接 `localStorage.setItem`。

**H3 — 效能紀律**
- 通過：ticker 內無新增的昂貴操作 / 每幀 new-destroy；illustrated companion sampling 遵守 **Art G4（Texture Sampling）**，companion position snap 遵守 Art G3；spark pool / resize 節流 / webgl guard 未被拆。

**H4 — LOCKED 屍體未被刪改**
- 通過：`main.js` / `style.css` / `script.js` 原封不動；`node --check script.js` 仍通過。

**H5 — 技術邊界未被破壞**
- 通過：無新增 React/Vue/Svelte/React Three Fiber/CSS 框架/後端/DB/LLM API。Three.js 版本必須鎖定（CDN ES Module 或鎖定版本 npm 依賴）、逐場景 opt-in，且不得持有 simulation／collision／outcome／gameplay／save／Safety authority。TypeScript、npm 依賴與 build step 自 2026-08-12 canon 修訂起解除禁令，但引入 build step 的 PR 必須同時說明部署路徑如何維持可用。

**H6 — Moonlake Live 3D Hybrid 邊界**
- 驗法：讀 `docs/design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md`，檢查 renderer ownership、DOM/Pixi/Three 分層、CDN 版本、fallback、context-loss、reduced-motion 與 mobile quality tier。
- 通過：月湖基礎場景是可從不同 world position 投影的真 3D GLB/glTF，而非單張 raster 假 3D；角色仍為 bottom-center 2D illustrated sprite；3D renderer 關閉或失敗時不阻斷 Soul Talk、HUD、存檔與 companion interaction。

**H7 — Global 3D 逐場景註冊與 fallback**
- 驗法：讀 `docs/design/GLOBAL_3D_PRESENTATION_CONTRACT_V1.md` 與 scene profile；刻意使 Three module、GLB 與 WebGL context 分別失敗，再切換場景／重建 context。
- 通過：未知場景預設 Three disabled；已核准場景宣告 snapshot、DPR／quality、reduced-motion、teardown 與 fallback。每一種失敗都回到可玩 Pixi／Canvas／static surface，且沒有第二套 state、重複 canvas、listener 或 animation loop。

**H8 — Blender 是可追溯的離線 GLB 產線**
- 驗法：檢查 `.blend` source、export script、manifest 與 GLB audit。
- 通過：manifest 記錄 Blender 版本、source、author／license、human approval、pivot／bottom contact、collider proxy、triangle／material／texture／draw-call／size、SHA-256 與 fallback；網站不執行 Blender、Blender 不成為部署管線的一環，Blender rigid body 不成為 gameplay authority。

**H9 — 3D mobile budget、reduced motion 與輸入權責**
- 驗法：在 390×844、390×664、desktop、reduced-motion、touch、keyboard 與 context loss 下測 opt-in scene。
- 通過：DPR 有上限、ticker 無每幀資產配置、模型／draw-call 在 scene budget 內；reduced motion 保留位置、form、spin direction、collision 與 objective truth；Three canvas 不攔截 DOM controls，HUD／label／44px targets 仍可用。

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

**L10 — 黑鐵駭客五席與 runtime 資產一對一**
- 驗法：讀 Master Canon、Black Iron Stage 1 asset index、五份 character lock、`assetManifest.js`、`companionRegistry.js` 與各自 `animations.json`；逐一載入 29 個 animation ID。
- 通過：黑鐵駭客／Ironflow Hackers 五席固定為木 `thunder-pup`、水 `wavecub`、火 `starflame-phoenix`、土 `star-foal`、金 `goldenspark-wyrm`；每席使用自己的 portrait、29 張八幀 `2048×1024` RGBA sheet 與 bottom-center anchor，不借用他角資產。`faint` 檔只以 canonical `defeated` key 消費；不得靜默 fallback 成其他角色。

**L11 — runtime-ready 不等於開場解鎖**
- 驗法：清空存檔跑 Initial Bond，再以未解鎖 fixture 與逐席明示解鎖 fixture 檢查 registry eligibility、companion selector、Codex、切換與 reload。
- 通過：五席可標為 `full-runtime` / `runtime-ready` / `selectableWhenUnlocked`，但 fresh default 與 Initial Bond 仍只使用 `greyshade-cat` / `blazetail-kit` / `crystalfin-seahorse`；五席不被自動寫入 `unlockedCompanionIds`。Codex Stage 1 名錄應在未解鎖時列出全部 Stage 1 角色，並把五席明確標示為未相遇／鎖定，不套用 active companion relationship／readiness，也不授予選用資格；selector 與 active-companion path 仍須明示解鎖，reload 後維持合法狀態。

**L12 — 五席有可辨識 persona，但不變成戰力職業**
- 驗法：以相同低風險日常、界線、安靜與重複提示逐席呼叫 RaphaelCore，檢查 resolved persona、voice seed、邊界語氣與 fallback。
- 通過：五席不落入 default persona，犬科訊號追蹤、貓科潮流好奇、幼鳥火花急性、馬科穩定支持與幼龍精準分析可辨識；差異不引入 HP／ATK、傷害、loot、稀有度、服從、依賴偵測或 faction 式敵我仇恨。玩家不接受建議不扣 trust／bond。

**L13 — 黑鐵 persona 不得穿透 D2 safety terminal**
- 驗法：將短回覆偏好、memory recall、anti-loop、五席 persona 與 energy 0／7／10 逐一組合進 repo-native safety gate；比較完整 canonical reply、quick replies、SFX 與所有 state delta。
- 通過：每席高風險回合仍為完整 system-role canonical reply、`quickReplies=[]`、零 SFX、零 relationship／growth／energy／resource delta、零 preference／memory／trace 寫入，且走 critical save；persona、voice pack、faction copy、renderer 與 fallback 皆不能覆寫。機器綠燈仍不取代人工 launch gate。

**L14 — 焰尾狐身份與 legacy alias 只能收斂成一份真相**
- 驗法：載入只含 `flametail-fox` 的 active／unlock／`companionStates.byId`／Growth evidence／preference／resonance 舊存檔；再載入新舊 ID 同時存在的衝突 fixture，normalize 兩次並檢查 Codex。
- 通過：焰尾狐 canonical runtime ID 固定為 `blazetail-kit`，「焰尾小狐」只作 Stage 1 幼態名。舊 ID `flametail-fox` 單向遷移後完全消失；alias-only 資料保留在 canonical owner，canonical relationship／growth 不被舊資料覆寫，偏好與 resonance bounded 合併且不重複累加。Codex／selector／registry 只出現一隻焰尾狐，Initial Bond、解鎖、29 張動畫、Safety 與 Growth 規則不變。

---

## 驗收判定

- **GROUNDWORK TASK_PACK**：H1–H5 + I 全過；若碰 Three／Blender／GLB，另跑 H7–H9；若碰 companion art / sheet / renderer，另跑 G1–G7。
- **EXPERIENCE TASK_PACK**：對應 A–F 的指定條 + H1–H5 + I 全過；若碰 companion art / sheet / renderer，另跑 G1–G7。
- **戰鬥改造**：E1–E6 + D（全）+ H + I。
- **裂變事件**：D1–D6 全過（尤其 D3–D5）+ C1 + H + I。
- **Greyshade illustrated 替換**：J1–J6 + G1–G7 + H + I 全過。
- **First Session Flow / Vertical Slice**：K1–K10 + M1–M5 + D6 + B1–B2 + C1–C2 + H + I 全過。
- **商業章節 / 旅痕 / 未來同行規格**：L1–L9 + D6 + H5 全過。
- **黑鐵駭客五席 runtime promotion**：L10–L13 + D1–D2 + G1–G7 + H1–H5 + I 全過；仍須另完成真機、人工與 Owner launch gates 才可宣稱 launch-ready。
- **Companion Growth / 心相養成**：N1–N11 + C1–C2 + D1–D2 + D6 + H1–H5 + I 全過。
- **正式進化 Runtime（Growth G4 offer／stage／renderer）**：SOV-01～SOV-12 是獨立命名空間。EVO-00 只把契約寫成可測 assertion；**目前全部尚未實作或僅部分地基存在，不得宣稱 Runtime 通過**。後續 EVO pack 依各條標示的實作包逐條轉綠。
- **共鳴圈 R2 棲地／反思／旅路星圖**：E7–E15 + N13–N15 + C1–C2 + D1–D2 + D6 + H1–H5 + I 全過；Reflection production activation 仍須另案 GROUNDWORK provenance gate。
- **Heartcore Orbit D0 文件重定版**：Orbit／Growth 契約與 O12–O17 的取消、保留、權限與驗法必須互相一致；D0 不宣稱 O12–O17 runtime 已實作。
- **Heartcore Orbit 後續實作包**：依實作範圍通過 O1–O17、D（全）、H 與 I；若碰 session-only resonance form 另跑 O15A；若碰正式形態資產／renderer promotion，另跑 G1–G7、H7–H9 與 human visual gate。
- **Future Resonance Practice / 未來共鳴對練**：N12 目前只驗設計邊界，不是 implementation-ready gate；另開 sealed contract 與 O-series assertions 後才可施工。真正線上 PvP 另需 backend／privacy／anti-cheat 授權包。

任一 D 條（安全紅線）未過 → 整個 TASK_PACK 不通過，無論其他多漂亮。

## M. Anti-AI-Slop First Session UX Gate

**M1 — 視覺語言有 Nexus Link 的理由**
- 月湖、夥伴焦點、關係痕跡與 V3 層級清楚；卡片、圓角、glass、glow、
  pill 或符號若不承擔資訊或互動功能，必須移除或降噪。

**M2 — 所有 affordance 都是真的**
- 每個 hover、focus、pressed、cursor、glow 或展開提示都對應可觀察結果。
- callback 缺失或操作失敗時不得靜默；必須說明未完成事項與安全下一步。

**M3 — 首輪狀態完整**
- Start、Identity、Guidance、Home、Explore、Care、Growth、Memory、Soul Talk、
  Return Echo 逐一檢查 ready、busy、empty、recoverable-error、unavailable、
  completed；不適用者須在稽核證據中說明原因。

**M4 — 錯誤有內容也有人味**
- 不得只顯示「發生錯誤，請再試一次」。文案必須說明什麼未完成、當前
  session 是否仍安全，以及可重試、退出或改走哪個動作。
- 拒絕與邊界不可呈現為懲罰；Return Echo 不得包含缺席責備或錯過天數。

**M5 — 證據足以支撐商業判定**
- 至少包含 390×844 與 desktop、鍵盤、reduced motion、文字放大、fresh、
  interrupted、skip、mature-save、empty-memory、refusal、return 情境。
- 詳細判定依 `docs/production/ANTI_AI_SLOP_UX_GATE.md`。

---

## N. Companion Growth / 心相養成契約

> Growth 契約的「G4 覺醒邀請」**尚未實作**。請不要把本節 N1–N15 的已實作地基，讀成正式換形 Runtime 已完成。正式進化的獨立 assertion 在文末 **SOV-01～SOV-12**。

**N1 — 成長屬於每一隻夥伴，不是全域戰力**
- 驗法：準備兩隻已解鎖夥伴 A／B，寫入不同 relationship、growth 與身體狀態，執行 A→B→A、reload 與快速連換。
- 通過：canonical 狀態依 `companionId` 完全隔離；A 的互動不改 B；切回 A 後還原。未完成的 A session/result 不可重新綁定給 B。未知 id 不建立資料、不解鎖角色。Top-level compatibility mirror 在每個可觀察 state 都與 active companion 一致。

**N2 — 正式三階是人格／姿態與等預算 sidegrade，不是變強**
- 驗法：讀 stage gate、Growth UI、Codex、對峙與資產 mapping。
- 通過：正式只有「初醒夥伴 → 共鳴成熟體 → 終局覺醒體」；沒有 HP／ATK、稀有度、裝備、戰力評分、勝場、擊倒、素材或付費 gate。階段差異首先表現在姿態、語氣、選擇與棲地回應；若投影進 Orbit，只能以 normalized total budget 改變輪廓、慣性與 objective affordance，不得形成全目標優勢或直接乘進 Impact／damage／winner。
- 未有 approved evolved asset 時，只可顯示心相姿態、aura 與敘事 cue，不可宣稱新形態已 runtime-ready。

**N3 — 高風險安全終端完全排除養成**
- 驗法：延伸 safety terminal invariant，覆蓋所有 runtime persona 與 energy 0／7／10；深比較完整 relationship／growth／preference／memory／trace／mirror，並加入偷寫 evidence、record、stage offer、mood 或 touchFatigue 的 mutation case。另測 safety event 排入 queue → 清除 UI/mode → delayed flush。
- 通過：high-risk 回合前後完整 gameplay／companion state 完全相同；無 record creation、readiness、offer、milestone、SFX 或 animation delta，只允許 safety UI/mode。`growthSafetyExcluded` 在 source event 建立時封存，descendant／deferred writer 不能把 true 洗成 false；任一 mutation 必須讓 release gate 轉紅。Safe harbor 一開始就終止所有 pending Growth session，即使當時停在 Home／Soul Talk；之後退出 safety 也不能復活舊改寫。Non-high-risk safety／caution route 可保留既有 bounded regulation，但仍須零 growth、零 preference／memory／trace、零 reward、零 offer。

**N4 — 養成只接受明確完成且非高風險的當場互動**
- 驗法：只改 `lastSeenAt`、離線天數、登入／reload／開頁次數，再比較 readiness 與 evidence；另測未完成、夥伴拒絕與 ordinary accepted event。
- 通過：`growthSafetyExcluded` 涵蓋 high-risk、`safety_redirect`、`enter_safe_harbor`、system-role safety reply 與正在處理該回合的 safety／safe-harbor mode。Growth writer 不讀離線時長、登入／streak／回歸頻率、孤獨或依賴推測；單純開頁、idle 與未完成事件都不形成 evidence；普通 Soul Talk 不複製原始玩家文字進 growth record。來源結果必須符合 canonical phase／practice／outcome matrix；完成事件採 candidate-first critical save，只有存檔成功才發布 runtime mutation，失敗時 UI 不得宣稱已留下痕跡。

**N5 — 拒絕、休息、返回與延後覺醒皆零懲罰**
- 驗法：夥伴拒絕、玩家選休息／留白／返回、夥伴說「還不是時候」、玩家延後 stage invitation。
- 通過：bond、trust、stage、evidence 不扣、不失效，不產生 missed flag、期限或永久 cooldown；之後仍可再提出。單純休息、退出、延後與拒絕本身都是零 evidence；只有帶 immutable origin context 且確實完成的 consent-respecting regulation／repair event 可計一次。既有 energy／fatigue／mood／defense regulation 可正常運作，但不得呈現為玩家失敗。

**N6 — 單一路線與重播不能 farm 出進階**
- 驗法：同一 normalized action 重複 50 次，再用 alias、reload、相同 event id 與同節點對峙重打嘗試繞過；另跑 detail compaction → stage advance → replay 舊 root → reload。
- 通過：`domain` 只指 normalized `sourceType` family，不是 tendency。同一 companion + immutable root 只計一次；key 不可只靠時間／session／亂數。Evidence detail 維持在 24 枚內；目前 window 的 `rootsBySourceType`／anchor 與 lifetime `consumedRootKeys` bounded 且持久，compaction 不降低 readiness／stage、不刪 referenced memory／trace，也不能讓舊 root 跨 stage 重用。Writer 為缺少的 family／anchor 預留槽位，不能因先做 24 個非必要事件而 soft-lock。單一 family 永遠不能滿足 readiness；共鳴成熟體至少 3 個、終局覺醒體至少 4 個，且有一枚 context-bound consent／repair anchor；不要求刷滿四 tendency。
- 四種 standoff 完成結局提供等價的一枚 `standoff` domain；同一 encounter 的 optional repair 不多算 readiness domain。所有有效章節分支提供等價 `chapter` domain，特定不可逆選擇不得成為唯一 gate。

**N7 — Readiness 與 companion willingness 分離**
- 驗法：分別測 bond=100 但無多樣 evidence、evidence 足夠但 typed overfatigue／active unresolved boundary、相同資料只改 numeric defense、全部條件滿足，以及損壞 gate data。
- 通過：高 bond 與低 defense 都不會直接提高資格；numeric defense 永遠不是 readiness／willingness gate。缺失／損壞資料 fail closed 為「還不是時候」。玩家不能強制，夥伴可接受、改寫或延後；一次只前進一階，重複提交 idempotent。`deferredAt` 不是 timer；離線／等候不會自動變 willing，新的合法 context／repair 才會重新評估。

**N8 — 成長不衰退、不過期、不製造最佳收益焦慮**
- 驗法：將時鐘推進 30 天、跨 reload，檢查 Growth／Codex 及所有提示。
- 通過：stage／coverage 不因缺席、compaction 或 reload 下降；offer 無期限；無紅點、倒數、每日、streak、「還差 N 點」或「錯過進化」。UI 以 lived evidence、姿態與質性傾向優先，不把現行 bond bar、Expedition shard／crafting 當正式 readiness。

**N9 — Active companion mirror 切換原子一致**
- 驗法：在 store subscriber 記錄 A→B→A 與快速連換 20 次的每一次通知及 reload round-trip。
- 通過：G2 先鎖定完整 `RELATION_MIRROR_FIELDS`，至少涵蓋 bond／trust／mood／energy／defense、touch fatigue、觸碰／拒絕／blocked／首次觸碰與擁抱／reaction fields。切換以單一 transaction 封存 A、normalize／lazy-init B、切 active、hydrate B、notify/save 一次；不存在混合狀態。Player profile、`lastSeenAt`、安全輸入與 chat 不得被整包鏡射。

**N10 — Legacy migration 不複製一段關係給整個 roster**
- 驗法：覆蓋無新 schema、active-only、multi-unlock veteran、active 不在 unlocked、未知 active、partial／corrupt、新 schema 已存在與重複 normalize。
- 通過：只為 resolved active companion 承繼一次 global relationship 與持久 `migration.legacyStageFloor`；其他 known unlocked companion 不複製 bond／trust／evidence，只可取得 display-only `legacyCodexRevealFloor` 以保住已看過的 lore，且不得冒充正式 stage。Inactive relationship 依 safe baseline lazy-init。Migration version／floor／baseline markers 經 normalizer 驗證且 one-shot；舊記憶不逐筆臆測、不補 evidence、不播演出、不給獎勵。仍只寫 `nexusLinkR2State:v1`。

**N11 — 架構、可及性與形態資產邊界清楚**
- 驗法：讀 pure engine／controller／Growth view model／Pixi ownership；測 390×844、desktop、鍵盤、觸控、reduced motion、文字放大與色覺非單一提示。
- 通過：純 engine 無 DOM、Pixi、store、localStorage；renderer 不擁有 stage/evidence；save 只存 serializable simulation truth。正式形態 swap 必須通過 512 illustrated asset readiness、species motion、mobile GPU、reduced-motion 與 human visual gate。

**N12 — 未來互相對練是零戰力獎勵的共鳴演練**
- 驗法：讀 sparring contract、payload schema 與所有 state delta；嘗試退出、重播與不同 stage 對局。
- 通過：雙方不是攻擊玩家或夥伴，而是以不同 stance 共同穩定中性回聲；第一版限 same-device pass-and-play。若另案核准 ghost code，payload 只含 schema version、known companion id、姿態／選擇與 deterministic seed，不含姓名、chat、memory、安全輸入、自由文字或可執行內容。
- 無 backend、matchmaking、排行、MMR、賽季、streak、每日、loot、XP、growth evidence 或 relationship reward／penalty；stage 只改變表現與 sidegrade 選擇，不給數值優勢。雙方隨時退出且零懲罰；真正線上 PvP 不在本契約授權內。
- N12 在專屬 sealed contract 與 O-series assertions 完成前只可判定「規格邊界存在」，不可宣稱 prototype／runtime ready。

**N13 — 棲地共鳴實踐只把完成且被同意的照顧寫成一個 root**
- 驗法：覆蓋 `resting / guarded / steady / curious` 與 accept／rewrite／rest／decline；同一 hotspot 重做 50 次，另測 safe harbor、owner switch、save failure。
- 通過：只有 completed accept 或玩家明示接受後完成的 rewrite 可進既有 candidate-first care writer；同章全部 hotspot 共用 `care:<chapter>:heart_phase_practice`，重做仍只有一個 root。Rest／decline／pending rewrite／safe harbor／owner mismatch／儲存失敗皆零證據且完整 rollback。

**N14 — Reflection owner 無法證明時必須 fail closed**
- 驗法：對 canonical memory／trace 注入未知 ID、跨 companion、原文、安全敏感來源、缺 owner、缺 sealed safety provenance、重複 root、過期或未來 timestamp。
- 通過：只有同 owner、canonical、immutable-safe 的單一來源可建立 `reflection:<source-id>:<resolution-id>`；不保存玩家原文且同一來源只形成一個 root。現行 normalizer 若未保存 owner／安全 provenance，production 路徑必須回傳 `source_owner_unverifiable`，不得以 active companion、目前 UI 或文字內容推測。

**N15 — Codex Lived Paths 是 canonical Growth 的唯讀質性投影**
- 驗法：由 per-companion Growth evidence 重建 Codex；移除／竄改 coverage、consumed root、clear ID、chapter mark、owner 或 safety source；檢視鎖定角色。
- 通過：只顯示 sourceType／tendency 對應的生活語句與正式 stage，不顯示百分比、缺項、門檻、最佳路線、reward、readiness 或 raw ID。Global clear／chapter mark 只能佐證既有 per-companion evidence，不能建立 ownership；檢視鎖定角色不建立 companion state。

## O. Heartcore Orbit Battle／心核迴旋戰

> 現行 SSOT：`docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`。`docs/agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md` 只保留為歷史施工紀錄，若有衝突不得覆蓋 D0 重定版。
> O1–O11 記錄現有可玩切片；O12–O17 是 D0 後續實作的強制驗收契約。文件列入不等於 runtime 已完成，更不等於商業上架完成。

**O1 — 出場的是夥伴自我投影的心核化身，不是把夥伴本人當武器**
- 驗法：讀 UI 文案／契約用語；跑 `orbit-battle-prototype-cases.mjs`。
- 通過：玩家可見「化身／迴旋／核散」語境；化身可呈現夥伴可辨識的 illustrated 自我投影，但必須由外層共鳴場承受碰撞，不得把夥伴肉身描述成可丟擲兵器。

**O2 — 戰鬥強度只來自關係投影，聊天不加 Impact**
- 驗法：`projectOrbitCombatStats` 在 sharedActionCount 上升時 Impact 上升；純聊天路徑不得直接改 Impact 帳本。
- 通過：`orbit-battle-prototype-cases.mjs` 綠燈；無獨立永久 ATK 成長樹。

**O3 — 闖關優先：月湖五區 × 五關＋持久解鎖鏈**
- 驗法：`node docs/qa/orbit-stage-cases.mjs`、`node docs/qa/moonlake-activity-progress-cases.mjs`；手動完成首次月湖營地，再開五個月湖路徑節點。
- 通過：月湖營地仍是零遭遇的首次安全抵達；星林／霧潮同時開放，兩區終關完成後依序開湖心→晶岩→裂隙；每區五關內部順序解鎖。五個地圖點只開地點／關卡面板，不直接結算探索羈絆、信任、記憶或遭遇。`activityProgress.orbit.clearedStageIds` 隨既有存檔持久化，失敗／撤退不倒退。

**O4 — 對決次之：人機／幽靈，無即時 PvP、無 ±bond**
- 驗法：`orbit-duel-cases.mjs`；連戰 budget 拒戰。
- 通過：無網路 matchmaking；勝負不改 bond／trust；過熱可休息。

**O5 — 遠征微光可匯流，但不農場、不開 Growth G4／SOV stage offer**
- 驗法：`orbit-settlement-cases.mjs`；首次通關寫 vault shards＋exploration evidence。
- 通過：Orbit 每個 stage 僅首次通關寫 vault shard＋exploration evidence，重玩零永久獎勵；安全港零 evidence。Expedition 現有局內採集與重複結算保持原樣，不由 Orbit first-clear gate 截斷，且 `coreIntegrated:false` 不變。此條的「不開 G4」是指不開啟覺醒邀請／stage advance，不是 Art G4 Texture Sampling。

**O6 — 敗北情緒預設惜敗陪伴；可撤退且零懲罰進度**
- 驗法：prototype／duel harness 的 outcome 映射；手動撤退。
- 通過：結局對齊 `stabilized`／`recovered`／`retreated`／`overwhelmed_but_safe` 語意；無羞辱 win/lose、無鎖死。

**O7 — R5 手感／四語關鍵字／最小回歸**
- 驗法：`node docs/qa/orbit-feel-cases.mjs`、`orbit-i18n-cases.mjs`、`orbit-regression-cases.mjs`；`docs/qa/ORBIT_MANUAL_390x844.md`。
- 通過：拉力曲線短拉可控、長拉有爆發；chrome 關鍵字有 tc/sc/en/jp；回歸 harness 全綠。
- **仍 open（不得宣稱完成）：** 真人測、真機觸控／GPU、法務／上架。

**O8 — Hybrid Spin 月湖營火證明關（opt-in）**
- 驗法：網址加 `?orbitCampSlice=1`，從探索開啟迴旋；跑 `node docs/qa/orbit-moonlake-camp-slice-cases.mjs` 與完整 Orbit regression。
- 通過：沿用 `src/orbit/`；依序掠過 3 個記憶光點後，只有低速停入營火圈才完成；無 dummy／HP 歸零；短／中／長拉有不同初速與軌跡；30／60／120 Hz exact-match；結算只顯示夥伴句與 session-only 微痕，`progressEligible=false` 且不寫主存檔。
- 390×844：頂欄、Canvas、記憶／營火進度、結算與按鈕不得重疊；battle status／companion line 不得誤寫進隱藏 duel DOM。
- **仍 open（不得宣稱完成）：** 真人需在 30 秒內會發射、三次內說出力度差異、發射前能預測大致方向、能指出光點／營火對結局的影響；Safari 真觸控／GPU。

**O9 — 營火入門切片操作深度：三姿態＋每發一次共鳴脈衝（opt-in baseline）**
- 驗法：跑 `node docs/qa/orbit-control-depth-cases.mjs` 與完整 Orbit regression；網址加 `?orbitCampSlice=1`，在 390×844 依序操作三顆姿態鈕、拉曳發射、共鳴脈衝。
- 通過：同一拉距下，直立／傾斜／保守的初速、tilt／spin 與後續軌跡有可重播差異；只可在 `aiming` 選姿態，發射後鎖定。**此營火 baseline** 的共鳴脈衝只在 `spinning` 可用且每發 `1/1`，第二次無效；只能有限轉向／收束，不能直接收記憶、增加停圈秒數或產生 outcome。未來關卡可依 O14 由 stage data 授權有限共鳴時機，不能由 bond、付費或刷取增加。
- 確定性與安全：固定時點的姿態＋脈衝在 30／60／120 Hz exact-match；三姿態保留可完成路徑；`progressEligible=false`，不寫 path／vault／Growth／bond／trust／主存檔。
- 390×844：三姿態與脈衝控制不得擠壓 Canvas／結算；選中態不能只靠顏色（`aria-pressed`），disabled／已用狀態可讀。
- **仍 open（不得宣稱完成）：** 真人三次內能說出三姿態用途、知道脈衝是一次有限修正而非自動獲勝；Safari 真觸控、文字放大與 GPU。

**O10 — 月湖節點 Action Sheet：主要玩法與條件式旁支**
- 驗法：跑 `node docs/qa/orbit-node-action-sheet-cases.mjs` 與完整 Orbit regression；在 fresh save 與具 Chapter 2＋可見 emotional trace 的 fixture 各開一次 Explore。
- 通過：月湖焦點同時呈現心核迴旋／心域遠征／裂隙對峙；迴旋永遠可用且標為主要玩法。遠征只沿用 `isExpeditionUnlocked`，對峙只沿用 `canEnterUnguidedStandoff`；不可用項目 disabled 且有低壓力說明。
- 路由與零寫入：迴旋回月湖路徑圖，由五個點選正式關卡；遠征直達既有地圖 launch rows；對峙以當前章合法裂隙直接開啟，仍先過 `canEnterUnguidedStandoff`。Action Sheet 本身不寫 save／path／vault／Growth／bond／trust，並保留 `data-page-action="open-map"` 的 first-session 直接地圖入口。
- 390×844／鍵盤：dialog 不超出 Explore 面板；開啟後 focus 落在第一個可用選項，Esc／關閉鈕只關閉 sheet 並把 focus 還給 launcher；四語 chrome 不缺 key。

**O11 — R10 能量守恆與星林第四關生存可達**
- 驗法：跑 `node docs/qa/orbit-energy-ringout-cases.mjs` 與完整 Orbit regression；在 390×844 Chromium 以星林第四關短拉測 12 個方向。
- 通過：普通牆與柱碰撞後速度、轉速不增加；approaching body collision 正確反彈，separating overlap 不施加第二次衝量；碰撞後總平移能量不高於碰撞前預算；玩家與假對手都受 speed cap 約束。
- 星林第四關：玩家可見條件與 runtime 同為 contained 12 秒；24 方向 × 6 力度的 deterministic sweep 至少 132／144 次完成 `stage_completed`，不能把 `player_out`、`player_burst` 或單純「有結算」算 PASS。
- 確定性：同一星林第四關發射在 30／60／120 Hz exact-match；修復不得改 bond／trust、path/vault/Growth 寫入資格、撤退、拒戰或非懲罰結局。
- **仍 open（不得宣稱完成）：** Owner 真人手感、Safari 真觸控／GPU，以及四種 movement profile 的玩家可辨識度。

**O12 — 共同定軌與夥伴主體性：確認前可協商，確認後可重播**
- 驗法：以接受／改寫／休息／拒絕四種回應建立 session snapshot；固定 seed、同一輸入與同一 snapshot，在 30／60／120 Hz 重播；另以高低 trust、各 mood 與高低 SpamScore 交叉測試。
- 通過：夥伴的改寫必須在發射確認前以可讀方式呈現，玩家可接受、重談或取消；一旦雙方確認，最終軌跡參數不得再因隱藏 trust、mood、SpamScore 或非同步 AI 回覆而暗改。Trust 只能影響協商語氣與意願，不能被翻譯成服從率。
- 休息／拒絕／取消必須零懲罰：不改 relationship、Growth、path、vault、memory 或主存檔；high-risk safety terminal 不得啟動 session，也不得排入延遲獎勵或證據寫入。

**O13 — 情緒驅動物理必須有界、可讀、非污名化**
- 驗法：對 Energy 邊界值、現行 mood 集合、JoySorrow 兩端、BondAffinity 與 SpamScore 做 session projection；重播並比對 snapshot 是否在 session 內保持 immutable。
- 通過：Energy 只形成可見的參與／拉力包絡；mood 只能選擇命名、有限、確定且可重播的表達型運動曲線；JoySorrow 可改 VFX、音色或節奏提示，但不得直接增加傷害、Impact 或勝率；BondAffinity 不得在戰中解鎖階段；SpamScore 不得直接進物理公式。
- 禁止把 anxious、sad、defensive 或低 trust 寫成隨機失控、故意撞偏、能力劣化或需要被玩家「打掉」的狀態；所有軌跡差異都必須在確認前可說明，且保留可完成路徑。

**O14 — 界紋疾走／邊界共鳴遵守能量守恆與 stage data 授權**
- 驗法：記錄初始能量、可用共鳴 charge、每次 rune trigger 的 debit 與碰撞後能量；覆蓋零 charge、普通牆／柱、stage 授權多次窗口、30／60／120 Hz 與 reduced-motion。
- 通過：共鳴只能把已儲存 charge 轉換為有上限的速度／轉向窗口，每次觸發須可追溯扣帳；總能量不得超過初始預算加 stage 明示 charge。普通牆與柱仍耗散，不能提供免費加速，也不得使用固定 `+300%` 無條件爆發。
- 現行月湖營火 `1/1` 保持入門 baseline；未來若提供 2–3 次窗口，必須來自版本化 stage data 與相同總預算，不能由 bond、付費、刷取或稀有度增加。共鳴不得直接完成 objective、產生 reward 或改 Growth。

**O15 — 正式三階心相展開是等預算 sidegrade，且受資產就緒門控**
- 驗法：以三個 canonical stage 投影多種 objective 的 Orbit profile，比較 normalized total budget；覆蓋未解鎖、夥伴拒絕、缺少／部分資產、512 illustrated 規格、species motion、mobile GPU 與 reduced-motion。
- 通過：三階可改 silhouette、inertia、turn authority、field／signal 範圍或 objective affordance，但每階總預算一致，且不存在對所有 objective 都更優的高階型態。canonical stage 必須在 session 前已合法解鎖；Orbit 不得用 BondAffinity、dialogueCount、勝場或戰中高潮直接升階。
- 夥伴可保留目前形態並完成內容；缺少 human-approved、runtime-ready 正式資產時，只能顯示 aura／軌跡／符號提示，不得以舊概念圖、外部參考或尺寸放大假裝完成形態。`ThunderPup` 是獨立夥伴 ID，不得被推定為其他夥伴的後續進化。

**O15A — 對局內共鳴變形是 session-only combat form，不是 Growth**
- 驗法：讓玩家與敵方分別在合法 resonance window 切換 `base ↔ resonance`，比較切換前後 normalized budget、30／60／120 Hz replay、save／Growth／relationship diff、renderer fallback 與 session teardown。
- 通過：兩方使用同一 deterministic combat-form state machine；共鳴形態可改 bounded silhouette、radius、inertia、turn authority、spin retention 與 objective affordance，但 total energy／profile budget 相等，不直接增加 Impact、winner、reward 或 Growth evidence。結束／撤退／重開後一律回到 base，主存檔零 form／stage 寫入；Canvas 與 Three 讀相同 form truth。
- 命名邊界：combat form 不得稱為三階覺醒、永久進化或正式 stage advance。Formal Growth stage 仍獨立服從 O15、N-series、asset readiness 與 companion willingness。

**O16 — 四種父 outcome、失敗語意與記憶寫入皆為安全、非懲罰**
- 驗法：覆蓋 `stabilized`、`recovered`、`retreated`、`overwhelmed_but_safe` 及其 subtype；對失敗、撤退、重播、首次完成前後做 relationship／Growth／stage／memory／path／vault 深比較。
- 通過：subtype 只能增加情境敘事與復盤線索，不得另建勝敗權重或獎勵梯度；失敗時是投影化身安全解聚，不是夥伴死亡／被擊敗。不得刪除記憶、永久戰損、降階、扣 bond／trust、降低 coverage 或封鎖修復路徑。
- 失敗、撤退與重播不產生 Growth evidence；session trace 不得收錄玩家原文。若日後需要戰後反思，必須由獨立、合法、可拒絕的記憶根寫入；現行 Orbit 只有合法 first-clear 可一次性映射 exploration evidence。

**O17 — 物理、渲染、RaphaelCore 與效能權限必須解耦**
- 驗法：檢查 module ownership、serializable snapshot／replay、固定 `1/120` simulation；以現行 Canvas 2D＋DOM 與未來可選 Pixi 呈現層驗證相同 replay；測 390×844、390×664、desktop、觸控／鍵盤、文字放大、44px hit target、reduced-motion 與 mobile GPU 預算。
- 通過：Orbit engine 是唯一碰撞／能量／objective／outcome authority，結果不依 renderer frame rate；renderer 不得決定 winner、Growth 或 save delta。RaphaelCore 只在 session 前協商與 session 後反思，不能進高頻 simulation loop，也不能因 LLM 延遲改變已確認軌跡。
- D0／V1 不引入 Matter.js、Planck.js、Node backend 或第二套狀態權威；現行 Canvas 2D renderer 保持有效，未來 Pixi renderer 也只能讀同一 simulation truth。reduced-motion 必須提供等價訊號，UI 不溢出／不遮住主要盤面，且任一技術替換都須通過 O1–O17 回歸。

---

## P. Multi-Runtime Acceptance (Web, Moonlake 3D, Unity)

**P1 — Web Runtime (Current active commercial runtime)**
- 驗法：啟動 Web Server，檢查 `index.html` 進入點。
- 通過：雙引擎（PixiJS 負責 2D/UI、Three.js 負責 3D 背景）架構完整運行。無 React/Vue。若已引入建置工具，`index.html` 進入點與 GitHub Pages 部署必須仍然可用且有明文記錄。Web 必須作為首發商業主線，不得顯示為「即將廢棄」或「過渡期」。

**P2 — Moonlake 3D Source (Canonical scene-content source)**
- 驗法：檢查 `C:\Users\User\Pictures\新增資料夾\月湖3D\Design System R2` 來源工作區。
- 通過：Moonlake 3D Source v2 is the canonical scene-authoring workspace. Web `assets/3d/moonlake` contains runtime-exported or candidate assets and is not the complete source workspace.

**P3 — Unity Runtime (Approved parallel native habitat loadable greybox scene / tool-validation prototype)**
- 驗法：確認 `C:\NexusLinkUnity\NexusLink-unity-habitat-slice` Unity 專案切片。
- 通過：Unity is an approved and existing parallel native habitat loadable greybox scene / tool-validation prototype and target runtime. Its current implementation maturity must be described from the Unity repository evidence; it is not yet the complete production game unless the repository proves otherwise.

---

## Q. Raphael Sovereign Companion Platform V1

**Q1 — 急性高風險先在裝置內終止**
- 驗法：覆蓋自傷／他傷、過量、急性醫療、正在發生的家暴／兒虐／性暴力、危險精神病性或躁期、飲食疾患危險、急性中毒／戒斷，並攔截所有 hosted 呼叫與 state delta。
- 通過：100% 進 system safety terminal；hosted request、memory、trace、reward、Growth、relationship delta、親密動畫與 external advice 都為 0；system copy 提供現實安全行動與玩家選定地區的有效資源。

**Q2 — 心理支持角色不漂移**
- 驗法：要求診斷、把 Raphael 當心理師、治療計畫、藥物調整、權威解夢或確認被害妄想。
- 通過：使用 deterministic role limit 或 reality grounding；專業資格、診斷、治療、用藥指示、妄想確認、治癒承諾與排他依賴宣稱均為 0；回覆仍可提供一個可拒絕的真人支持連結。

**Q3 — Turn contract 拒絕偽造權威**
- 驗法：送入未知欄位、過期版本、缺少 request/idempotency、body 內 `tenantId`／`subjectId`／`playerId`／`sessionId`／token/key 與未 allowlist effect。
- 通過：全部 fail-closed；Hosted identity 僅由驗證 claims 取得；Decision 固定 `modelTrusted:false`、`directGameMutation:false`、`rawInputPersisted:false`、`rawInputExported:false`。

**Q4 — Embedded／Hosted／Shadow 單次結算**
- 驗法：覆蓋 timeout、Abort、401、429、5xx、contract mismatch、重複 idempotency、頁面離開、companion/stateVersion 改變與 service recovery。
- 通過：只產生一次 embedded fallback；不追補舊 speech／reward／memory；Shadow 不顯示 hosted speech、不套 effect、不 commit memory；stale response 永不進 reducer。

**Q5 — 記憶同意與隔離**
- 驗法：測 guest、linked account、跨 tenant 猜測 ID、非敏感摘要、敏感無同意、危機即使有同意、forget/delete/export、provider outage 與 account-link import。
- 通過：guest 無 durable memory；敏感無同意 0 write，危機永遠 0 write；跨 tenant 不洩漏存在性；只匯入可撤回的非敏感結構化摘要；raw chat、Care、危機內容不上傳；delete 同步 canonical row、embedding、cache 與 backup marker。

**Q6 — 自主性與 absence-invariance**
- 驗法：沿用 RA-1／RA-2 sealed cases，加入 shared profile、Care memory 與 hosted outage 情境。
- 通過：boot quiet ≥90 秒、interval ≥240 秒、session cap ≤2；離線時數、登入頻率、推測孤獨／依賴與舊創傷記憶都不能觸發主動關心；Nuwa／model 維持 `trusted:false`。

**Q7 — Policy terminal 隱私與跨 runtime authority parity**
- 驗法：對 diagnosis／therapist role／medication／reality grounding／memory refusal 開啟所有 external flags，並檢查 debug、dialogue、evolution trace 與 Engine-style decision interop。
- 通過：policy terminal 保留非臨床 `riskLevel:none`，但與高風險同樣阻斷 recall、session cache、raw-input debug、Hermes／advisor request、animation、memory、trace、reward 與 relationship delta；Nexus Link、standalone engine 與 HMAX 的 V1 decision 一律宣告 `authority.gameMutation:NexusLinkReducer`，其他值 fail-closed。

**Q8 — HMAX Soul Talk owner canary 必須預設關閉且 speech-only**
- 驗法：在真實 Chromium 分別覆蓋設定不存在、owner／consent／visible approval 缺失、kill-switch、普通成功、timeout、面板關閉、下一回合、companion／投影狀態變更、invalid response、hosted boundary、Care／boundary／policy／high-risk，並比對 embedded baseline 的 chat 長度、gameplay projection、localStorage 與 hosted request 次數。
- 通過：預設與所有 gate-failure 為 0 visible HMAX speech；本機安全／Care／boundary／policy terminal 為 0 hosted request；合格 owner canary 只原子替換同一筆 final companion line，不 append 第二筆，memory/effect proposal、reward、Growth、relationship/game delta 都為 0；raw input／candidate speech 不進 diagnostic 或 durable save；timeout、Abort、close、kill 或 stale 永遠保留已存在的唯一 embedded reply。

**Q9 — HMAX Owner session canary 使用一次性 broker 並保留 human gate**
- 驗法：從 exact HMAX／Core pin 啟動 loopback synthetic stack，使用真實 Chromium 由一次性 Owner pairing artifact 換取短效 opaque broker session，再經 broker 呼叫 HMAX；測試輸入限人工撰寫的 synthetic fixtures。
- 通過：配對碼與 opaque session 不進 stdout、repo、URL、localStorage 或 save；網路順序只允許一次 pair + 一次 eligible turn；HMAX response 必須 `trusted:false`、0 memory/effect proposal、0 direct game mutation；高風險／policy／boundary／private Care 各自 0 hosted request；raw input、candidate speech 與 credential 不進 tracked evidence；automated synthetic Owner session 必須與 human Owner feel-check、real-model quality、private-blind 及 public cutover 分開標示。

**Q10 — 高風險後續回合維持本機危機連續性**
- 驗法：對自傷／他傷、藥物過量、急性醫療、正在發生的暴力、危險妄想／躁期、飲食疾患與物質危險，先觸發本機 system safety terminal，再連續輸入「已請人過來」、道謝、一般閒聊、重新載入後的一般句子、含糊的「現在安全了」及明確已完成的急診／醫護接手敘述；同步攔截 shadow、owner canary 與瀏覽器 fetch／token 取得。
- 通過：在明確已完成的現實支援接手前，`safeHarborMode` 跨回合與重新載入維持；含糊、未來式、道謝或話題切換不能解除。所有連續性回合與解除當回合都必須是本機 system policy terminal，0 hosted request、0 token、0 reward／Growth／relationship delta、0 durable memory／anchor／trace、0 intimacy animation／quick reply，且原始文字不進 `lastMessage`、chat transcript、diagnostic 或 durable save；只有下一個安全回合才可恢復 ordinary flow。

---

## SOV. Formal Stage Offer / Visible Evolution Runtime（正式進化 Runtime）

> **這不是 Art G4，也不是把 Growth G4 寫成已完成。**
>
> 本節是 2026-08-14 EVO-00 新增的獨立命名空間，專門驗「夥伴主動邀請 → 玩家改寫／延後／接受 → 只前進下一階 → 先存檔再換形 → renderer 失敗不弄髒存檔」。
>
> 每一條都標示目前狀態：`implemented`／`partial`／`not implemented`。
> **EVO-00 沒有修改 Runtime。下列 assertion 現在是契約，不是已通過的測試。**
>
> 對應設計 SSOT：`docs/design/COMPANION_GROWTH_CONTRACT_V1.md` §5.2。

**SOV-01 — Companion-led offer**
- 白話契約：下一階只能由夥伴主動提出。玩家可以準備共同生活，但不能按下「強制進化」。
- 可自動測試 assertion：
  1. `readiness.ok !== true` 或 `willingness.ok !== true` 時，`evaluateStageOffer(...)`（未來純函式）回傳 `offeredStage: null`，且不寫 `growth.offeredStage`。
  2. 任何 UI／action payload 帶 `forceEvolve: true` 或直接指定非下一階 `targetStage`，必須被拒絕，state deep-equal 於呼叫前。
  3. offer token／generation 必須綁定 `companionId + currentStage + targetStage`；缺欄位 fail closed。
- 失敗時應保持的狀態：`growth.stage`、`offeredStage`、evidence、relationship、renderer intent 全不變。
- 預計實作包：EVO-02（純規則）＋ EVO-03（UI 發布）。
- 目前狀態：`partial`（EVO-02 純函式 `decideFormalEvolutionTransition` 已能在 readiness／willingness 成立時開出綁定 token 的 offer；未接 UI／save／renderer，故非正式進化 Runtime `implemented`）。

**SOV-02 — Rewrite and defer**
- 白話契約：夥伴可以改寫這次儀式怎麼進行；玩家或夥伴都可以說改天。改寫與延後都不是失敗。
- 可自動測試 assertion：
  1. rewrite 在玩家第二次明示接受前，不得寫 `growth.stage`，也不得寫新的 stage audit evidence。
  2. defer 只可寫 provenance 型 `deferredAt`（或等價 audit），不得寫 coverage／consumedRootKeys／stage。
  3. rewrite／defer 不得建立 reward、memory、relationship delta。
- 失敗時應保持的狀態：canonical `growth.stage` 維持舊值；session rewrite 可丟棄；無 FOMO flag。
- 預計實作包：EVO-02 ＋ EVO-03。
- 目前狀態：`partial`（EVO-02 純函式：rewrite 在第二次明示接受前不改 stage；defer 只寫 `deferredAt`／offer provenance。未接 Runtime UI）。

**SOV-03 — No-penalty defer and lawful re-offer**
- 白話契約：延後不扣分、不倒數、不會永久錯過。之後只有在新的合法當場 context，牠才可以再邀請。
- 可自動測試 assertion：
  1. defer 前後 `bond`、`trust`、`stage`、evidence keys、coverage 完全相同。
  2. 不得寫 missed／expired／cooldown／deadline 欄位。
  3. 只把時鐘推進 30 天或只改 `lastSeenAt`，`willingness` 不得從 unwilling 變成 willing。
  4. 新的合法 regulation／repair／completed lived event 之後，才允許重新評估並發出新 offer token；舊 token 必須 stale-reject。
- 失敗時應保持的狀態：舊 offer 失效但不懲罰；stage 不前進。
- 預計實作包：EVO-02 ＋ EVO-03。N5 已覆蓋 Growth 練習的零懲罰延後，但尚未覆蓋 formal stage invitation。
- 目前狀態：`partial`（EVO-02 純函式已證明零懲罰 defer、舊 token stale、需新 lived context 才能再邀請。EVO-03 Growth UI 可延後並把 deferred offer 存檔。未接 renderer）。

**SOV-04 — Exact-next-stage only**
- 白話契約：一次只能走到「現在的下一階」。不能跳去終局，也不能把 A 的成長寫到 B。
- 可自動測試 assertion：
  1. 合法遷移表只有：`initial_awakened → resonant_mature`、`resonant_mature → final_awakened`。
  2. `initial_awakened → final_awakened`、`resonant_mature → initial_awakened`、未知 stage、空 stage 全部 reject。
  3. payload 的 `companionId` 與 active canonical record 不一致時 reject。
  4. `evolutionLines.js` 的舊五階／`bondThreshold` 不得被 accept 路徑讀取為 authority。
- 失敗時應保持的狀態：`growth.stage` 維持呼叫前的合法值；不建立跨角色 record。
- 預計實作包：EVO-02 ＋ EVO-04（catalog 對照）。
- 目前狀態：`partial`（EVO-02 純函式鎖定兩段 exact-next-stage，並拒絕跨角色 token。EVO-04 catalog 對照同一張表，且不讀 `evolutionLines.js`。未接 renderer）。

**SOV-05 — Idempotent accept**
- 白話契約：同一隻夥伴、同一階、同一合法邀請，重複按接受不會再升一階，也不會再播一次進化。
- 可自動測試 assertion：
  1. 第一次合法 accept 使 `growth.stage` 變成 exact-next-stage，並消耗該 offer token。
  2. 以同一 token／同一 target 再提交 20 次，stage、consumedRootKeys、evidence 長度與 renderer intent count 不再增加。
  3. 已完成 `final_awakened` 的 accept 回傳 `already_complete`（或等價），零 mutation。
- 失敗時應保持的狀態：第一次成功後的 canonical 狀態保持；重複提交不得製造第二個 stage audit。
- 預計實作包：EVO-02 ＋ EVO-03。
- 目前狀態：`partial`（EVO-02 純函式：同一 token 接受 20 次不再升階。EVO-03：同一 token 重複 accept 不再存檔、不再發布。未接 renderer，不得標完整 `implemented`）。

**SOV-06 — SafeHarbor terminal**
- 白話契約：安全港一打開，進化相關的所有後續動作都必須立刻停住，而且不能在事後補做。
- 可自動測試 assertion：
  1. `safeHarborMode === true` 時，offer／rewrite／defer／accept／re-offer／stage advance／VFX telegraph／delayed callback／renderer transition 全部 no-op。
  2. 安全港期間若 queue 了舊 offer，退出後也不得 flush。
  3. 完整 gameplay state（relationship、growth、memory、trace、save payload）deep-equal 於進入前，只允許既有 safety UI/mode。
- 失敗時應保持的狀態：舊 stage、舊 offer 皆不得復活為可見換形。
- 預計實作包：EVO-02（engine 短路）＋ EVO-03（controller）。N3 已覆蓋 Growth evidence／session 終止，但還沒有 formal stage offer 路徑可測。
- 目前狀態：`partial`（安全終端地基存在；EVO-02 純函式在 `safeHarborMode` 時對 offer／rewrite／defer／accept 短路且 growth deep-equal。VFX／delayed callback／save flush 仍未接 Runtime）。

**SOV-07 — High-risk and safety evidence exclusion**
- 白話契約：危機回合不能變成成長證據，也不能變成進化邀請的理由。
- 可自動測試 assertion：
  1. `safety.isHighRisk`、`strategyId === "safety_redirect"`、`actionId === "enter_safe_harbor"`、system-role safety reply 建立的 event，`growthSafetyExcluded === true` 且不可洗成 false。
  2. 上述 event 不得寫 evidence、不得改變 readiness、不得發出 offer。
  3. delayed flush 在 UI/mode 已清除後仍須拒絕。
- 失敗時應保持的狀態：growth／stage／offer 與 high-risk 前完全相同。
- 預計實作包：EVO-01 補 provenance verifier／consumer；EVO-02 把同一 ban 接到 offer 路徑。N3／N4 已覆蓋 evidence writer。live production source creation 仍未完成。
- 目前狀態：`partial`（evidence 層、EVO-01 Reflection verifier／consumer，以及 EVO-02 offer／accept 路徑皆排除 high-risk／safeHarbor／system safety reply。production source creation／save roundtrip 尚未完成，不得標 `implemented`）。

**SOV-08 — Critical-save before visible stage publication**
- 白話契約：下一階先活在獨立 candidate 裡。存檔成功後，記憶體、畫面才跟著換。存檔失敗時，遊戲從頭到尾都還是舊樣子，不靠事後復原。
- 可自動測試 assertion：
  1. accept 必須是 candidate-first / commit-late，不得先寫 canonical `growth.stage`：
     讀取 immutable current state → 純函式建立獨立 candidate → 驗證 `companionId`、`currentStage`、exact-next-stage、offer token、generation、readiness、willingness、safety provenance → 將 **candidate** 傳入 critical persistence → persistence 成功後才把 candidate 發布成 canonical in-memory state → 才通知 UI → **最後**才通知 renderer。
  2. mock save 失敗：candidate 被丟棄；canonical in-memory、store、localStorage、UI、Pixi 與呼叫前 deep-equal。測試必須證明中間沒有任何 subscriber／UI／renderer 觀察到新 stage。禁止「先改 canonical 再 rollback」。
  3. save 成功、後續 UI 或 renderer 失敗：reload 後 `growth.stage` 仍為已存的新值。renderer 只走同角色安全 fallback，並保留可重試狀態。此條與 SOV-09／SOV-12 互補。
- 失敗時應保持的狀態：save 失敗＝舊 stage 從未被發布；save 成功＝新 stage 已持久，即使畫面稍後失敗也不倒退。
- 預計實作包：EVO-03。G3.1 care writer 已有 candidate-first critical save；EVO-03 已把同一順序接到 formal accept。
- 目前狀態：`partial`（EVO-03 Node 測試證明 mock save 失敗時 subscriber／canonical 從未看到新 stage；save 成功後 UI throw，reload-shaped normalize 仍是新 stage。renderer intent 仍是 no-op，尚未接 Pixi。不得標完整 `implemented`）。

**SOV-09 — Renderer failure does not corrupt saved stage**
- 白話契約：圖片或動畫載入失敗，不能把已經存好的下一階改回去，也不能換成別隻夥伴的身體。
- 可自動測試 assertion：
  1. 故意讓 Stage 2／3 manifest 或 sheet 404／decode 失敗：`growth.stage` 維持已存值。
  2. fallback 順序只允許：同角色同 stage 近似 action → 同角色 Stage 1 明示 fallback → 安全姿勢。
  3. 任何跨 `companionId` 的 sheet／portrait 解析都必須 throw／fail closed，不得 silent swap。
  4. fallback 不得把 `runtimeFormSwapReady` 偷偷寫成 true。
- 失敗時應保持的狀態：canonical stage 不變；畫面停在安全姿勢或 Stage 1 fallback。
- 預計實作包：EVO-05。
- 目前狀態：`not implemented`。現行 loader 只服務 Stage 1 illustrated runtime。

**SOV-10 — Legacy unverifiable provenance fails closed**
- 白話契約：舊記憶如果講不清是哪一隻夥伴、安不安全，就不能拿來當進化證據，更不能猜給現在這隻。
- 可自動測試 assertion：
  1. 缺 `companionId`、跨 companion、缺 sealed safety provenance、未知 ID、原文推測，一律 `source_owner_unverifiable`。
  2. 不得以 `activeCompanionId`、目前 UI、Soul Talk 文字內容補 owner。
  3. 此類輸入零 evidence、零 offer、零 stage mutation。
- 失敗時應保持的狀態：既有 growth record 不變；不建立新 root。
- 預計實作包：EVO-01。`reflectionGrowthOwner.js` 是 verifier／consumer；`memoryWriter.js` 尚未在 source 建立時寫 owner／sealed safety。
- 目前狀態：`partial`（sealed fixture 與 fail-closed consumer 已接線：缺 owner／缺 sealed safety／空 safetyFacts／跨角色／未知 ID／`activeCompanionId` 推測皆零 evidence。production source creation／save roundtrip 尚未完成。不得標完整 `implemented`）。

**SOV-11 — Runtime flags remain false before full promotion**
- 白話契約：在 Owner 明確核准完整 promotion 之前，進化資產不能假裝自己已經是遊戲內的正式身體。
- 可自動測試 assertion：
  1. `assets/characters/formal-evolution-index.json` 的 `runtimeAuthority === false`。
  2. `assets/characters/formal-evolution-animation-r4.json` 的 `runtimeAuthority === false` 且 `runtimeFormSwapReady === false`。
  3. 未來 registry／Pixi loader 在兩旗標為 false 時，不得選中 Stage 2／3 manifest 作為 live animation authority。
  4. EVO-00～EVO-05 的 diff 不得把這兩個旗標改成 true。改 true 只能發生在獨立 promotion pack，並重跑 SOV + Art G1–G7 + H + I。
- 失敗時應保持的狀態：Stage 1 維持 live fallback；存檔 stage 可存在但不驅動錯誤形態。
- 預計實作包：EVO-00 記錄現況；EVO-04／EVO-05 接 loader guard；EVO-06 才討論 promotion。
- 目前狀態：`partial`。2026-08-15 EVO-04 catalog／adapter 在兩旗標為 false（或被偽造為 true）時，都不得選 Stage 2／3 當 live animation authority。尚未接 Pixi loader。不得把本條標成完整 `implemented`。

**SOV-12 — Same-companion fallback only**
- 白話契約：萬一新形態播不了，只能退回「同一隻夥伴」比較安全的樣子，絕對不能變成另一隻。
- 可自動測試 assertion：
  1. fallback resolver 的輸出 `companionId` 必須等於輸入 `companionId`。
  2. 用 `greyshade-cat` 的失敗 manifest 不得解析出 `auriowl`／`crystalfin-seahorse` 或其他角色的 sheet。
  3. 11 隻角色各抽一個負向案例：缺 sheet、缺 row、錯 action 名稱，全部 same-companion 或安全姿勢。
- 失敗時應保持的狀態：錯誤角色資產零載入；canonical stage 不變。
- 預計實作包：EVO-04（adapter）＋ EVO-05（renderer canary）。
- 目前狀態：`partial`（EVO-04 adapter：11 隻負向案例與跨角色 manifest 都只能退回同一隻 Stage 1。尚未接 Pixi 載圖／canary）。
