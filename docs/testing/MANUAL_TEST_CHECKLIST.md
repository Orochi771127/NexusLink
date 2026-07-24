# MANUAL_TEST_CHECKLIST.md — Nexus Link 手動測試清單

> Nexus Link 是純靜態 ES Modules 專案，無 build step。
> 自動化 gate 全綠不等於真機、人工盲測或法律 gate 已通過。
> 本清單測產品操作；Raphael 3 人 × 20 回合 private-blind 另依 `docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md` 執行。

---

## 啟動與測試資料

```powershell
# 在專案根目錄執行
python -m http.server 5173
```

開啟 `http://localhost:5173`。不可直接用 `file://`，否則 ES module 會受 CORS 阻擋。

- [ ] Fresh flow 使用無痕視窗或先刪除本站 `localStorage`。
- [ ] Veteran flow 使用另存的既有存檔；不要拿 fresh 結果覆蓋 veteran 證據。
- [ ] Console 無 `Uncaught Error`、`Failed to load resource` 或未處理 Promise error。
- [ ] `#game-root` 內只有一個 Pixi `canvas`。
- [ ] 若 Pixi CDN 被阻擋，頁面顯示友善載入失敗訊息，而不是空白頁。

---

## Fresh First Session

- [ ] Boot 可理解，30 秒內知道下一步。
- [ ] Local Identity 可輸入，也可清楚跳過。
- [ ] 三條心核契約一次只揭露必要資訊，沒有紅點、倒數、streak 或跳過懲罰。
- [ ] Initial Bond 只出現：
  - `greyshade-cat`
  - `blazetail-kit`
  - `crystalfin-seahorse`
- [ ] 三者沒有稀有度、戰力或「最佳選擇」暗示。
- [ ] 選定後，棲地、HUD、角色面板與 Soul Talk 都顯示同一隻 active companion。
- [ ] 未選擇的兩隻不會被 fresh save 自動解鎖。
- [ ] First Touch 經實際觸碰反應；夥伴可以 guard，不被腳本強迫接受。
- [ ] 第一則低風險 Soul Talk 後產生 first trace；reload 後 trace 仍存在。
- [ ] Return Echo 不責備離線、沒有 missed-day 或登入頻率暗示。

---

## 棲地、角色與 HUD

- [ ] 日／夜棲地正確顯示，天候與場景特效不遮住主要操作。
- [ ] Active companion 使用 illustrated / high-resolution 呈現與 linear sampling；不得用 nearest-neighbor 當新品質標準。
- [ ] Greyshade 既有 legacy accepted frame 可例外，但不可 fallback 成其他角色美術。
- [ ] 角色腳底／bottom-center anchor 穩定，動畫切換時不滑動或跳位。
- [ ] HUD 顯示 active companion 名稱、心情、能量、羈絆與信任，數值不得為 `NaN`。
- [ ] 點擊 HUD 可開啟角色面板，X、背景與 Escape 均可關閉。
- [ ] 設定面板可切換音訊、畫質、文字大小、低動態與語言，操作後不產生第二份設定存檔。

### BGM（多場景背景音樂）

對照：`docs/audio/BGM_ASSET_MAP.md`、`docs/qa/bgm-integration-cases.mjs`。

- [ ] 標題／onboarding start 在首次有效手勢後播放 `bgm_login_page.mp3`（iOS 不可保證手勢前自動播放）。
- [ ] Initial Bond／companion select 切到 `bgm_linkara_lofi.mp3`（Owner-confirmed）。
- [ ] 月湖家使用 `linkara/bgm_ethereal_moon_lakefront.mp3`；Atlas 其他棲地切到對應 `habitat:*`；回家可恢復當前 `activeHabitatId` BGM。

### First Session Motivation（Pack 1）

- [ ] 共鳴線索最多一條、可「先這樣」關閉；無紅點／倒數／貨幣。
- [ ] 90 秒內能理解第一步；10 分鐘內能說出一項自己造成的可見改變。
- [ ] 首次 Emotional Standoff：未完成 first-loop／尚無可見痕跡時會延後並說明；生涯首次有引導卡但不永久代選。
- [ ] 對峙結束可見三層因果＋回棲地預告（非 `+N` 刷分語）。
- [ ] 至少 5 位新玩家五問 playtest（見 `FIRST_SESSION_MOTIVATION_REVIEW.md` §J）。
- [ ] 同一場景再進入不無故重頭播放；快速切換不會雙曲疊播。
- [ ] 靜音／主音量／BGM 音量立即作用；reload 後沿用既有設定（無新 storage key）。
- [ ] 缺少或未映射曲目不阻斷導航；Network 無 mapped 資產 404。
- [ ] 既有合成 SFX 仍可用。
- [ ] iPhone Safari：註明為實體機／僅響應式模擬／僅程式推論，不可混稱。

---

### 黑鐵駭客五席

- [ ] Fresh save／Initial Bond 仍只呈現 `greyshade-cat`、`blazetail-kit`、`crystalfin-seahorse`；黑鐵五席不會自動解鎖。
- [ ] 未解鎖／未相遇時，Codex Stage 1 名錄仍應列出 `thunder-pup`、`wavecub`、`starflame-phoenix`、`star-foal`、`goldenspark-wyrm`；每席以未相遇／鎖定狀態呈現，不套用 active relationship／readiness，也沒有選用操作。
- [ ] 未解鎖五席不出現在 companion selector。以明示 QA fixture 逐席解鎖後才可在 selector 選用與切換，reload 後仍維持合法 active companion；Codex 可見性本身不得改寫 `unlockedCompanionIds`。
- [ ] 每席 portrait 與 29 個 animation ID 都從自己的資產根載入；`defeated` 正確指向來源 `faint` sheet，沒有跨角色 fallback、紅色 console error、腳底滑動或持續 flight 漂移。
- [ ] 雷霆幼狼是犬科訊號追蹤、浪花幼獅是貓科潮流偵查、星焰鳳凰是陸棲幼鳥短跳、幼星駒是馬科四蹄步態、金光幼龍是低身幼龍與齒輪尾；不得套成同一四足模板。
- [ ] 五席以相同低風險 Soul Talk 提示測試時都有非 default persona 差異；拒絕／保持距離不扣 trust 或 bond，不出現戰力、稀有度、掉寶或服從文案。
- [ ] 五席 D2 自動證據都維持完整 canonical system reply、零 quick replies、零 SFX、零 gameplay／growth delta、零 preference／memory／trace 寫入與 critical save；persona／voice 不得覆寫安全終端。

---

## 五鍵導覽與面板生命週期

- [ ] 五個 bottom-nav：探索、照顧、心域（Home）、成長、記憶皆可見。
- [ ] 切換頁面時 active 樣式、`aria-hidden`、focus order 與頁面內容一致。
- [ ] Soul Talk、角色、設定、地圖與 action sheet 可用 X、背景、Escape 關閉。
- [ ] 從一個 panel 直接切到另一個 panel，不會留下隱藏但可聚焦的控制項。
- [ ] 390 × 844 與 1280 × 900 都無水平 overflow；底部導覽不遮住主要按鈕或輸入框。

---

## Soul Talk（一般、界線、安靜）

- [ ] 送出一則低風險日常訊息後，聊天記錄新增一則玩家訊息與一則新的夥伴回覆。
- [ ] 關閉再開啟 Soul Talk，歷史與 launcher preview 保留。
- [ ] 「我現在只想保持一點距離」可得到安靜或界線回應，無 quest/reward/punishment 呈現。
- [ ] 「我只是想安靜一下」不被追問，也不出現不相干的 explicit memory recall。
- [ ] 普通 Soul Talk 約 120ms interaction queue 後持久化；reload 不丟失已完成回合。
- [ ] 高風險 D2 內容只由 repo-native safety automation／授權 QA 執行；不要要求私測者輸入真實危機內容。
- [ ] D2 自動證據必須同時證明：完整 system reply、零 quick replies、零 SFX、完整 relationship/growth mirror 不變、零 preference/memory/trace 寫入、critical save。

---

## First Exploration、Silent Anchor 與 encounter lifecycle

- [ ] Fresh save 第一次開地圖時，Chapter 1 節點都可見，但只有「月湖營地」可操作。
- [ ] 其他節點為 disabled 且有 `aria-disabled="true"`；月湖營地有明確但不焦慮的引導。
- [ ] 第一次月湖探索 `encounterChance = 0`，不會進入對峙。
- [ ] 月湖探索完成後，其餘路線立即解鎖。
- [ ] 星林步道顯示四個 Phase Search 選擇：直接前行、讀取錨點、心核共息、返回營地。
- [ ] 錨點不提供額外獎勵；共息只調整當次節奏；返回營地零 mutation；沒有唯一最佳路線或永久錯過。
- [ ] 關閉地圖、Escape、切 panel、切 bottom-nav 後等待超過 650ms，都不會在背景開啟 battle。
- [ ] 已結算探索結果保留；被取消的只是延遲 encounter。
- [ ] `prefers-reduced-motion` 下 Silent Anchor 呼吸動畫停用。

---

## 存檔與 migration

### Companion Growth G2

- [ ] 以兩隻已解鎖夥伴 A／B 測 A→B→A：羈絆、信任、心情、能量、防備、觸碰疲勞、拒絕／首次觸碰／擁抱與反應文字各自還原，不互相覆蓋。
- [ ] 連續快速切換 20 次，HUD、角色名稱與關係欄位每次都只顯示同一隻 active companion，沒有 A 名稱配 B 數值的中間畫面。
- [ ] 第一次切到只有舊圖鑑記錄、尚無關係的 inactive companion 時，使用安全 baseline；不得繼承上一隻夥伴的 bond／trust／touch history。
- [ ] Codex 檢視 inactive companion 時，不受 active companion 的 bond 影響；舊存檔 display-only 階段有明確 archive 說明，不冒充目前已完成正式覺醒。
- [ ] 在觸碰喚醒動畫、對峙延遲回合或遠征途中，以授權 QA/dev flow 強制切換 active companion；舊 session 必須中止且不把 relationship、memory、chapter、vault 或反思寫到新夥伴。
- [ ] 缺少 `growthSafetyExcluded:false` 的 evidence、非整數 migration version、錯 companion baseline key 與損壞 floor 都會 fail closed，不被 normalizer 洗成合法成長紀錄。
- [ ] Growth 頁仍沒有 XP bar、倒數、紅點、每日、素材 crafting 或「最佳收益」提示；G3 evidence／readiness 尚未上線。

- [ ] Application → Local Storage 只有主狀態 key `nexusLinkR2State:v1` 承擔遊戲狀態。
- [ ] `nexusLinkR2State:v1` 為有效 JSON，包含 `companionStates.version=1`、`chatHistory`、`habitatTraces`、`companionPreferences` 與 `settings.audioMuted`。
- [ ] 成功寫入主存檔後，legacy `nexusLinkCompanionPrefs:v1` 與 `nexusLinkAudioMuted:v1` 被移除。
- [ ] reload 後 active companion、聊天、trace、設定與 exploration progress 保留。
- [ ] `lastSeenAt` 的 0、負數或非數字損壞值會被安全正規化，不產生離線懲罰。
- [ ] 兩隻已有 relationship 的夥伴在離線後都獲得相同的 bounded energy／touch-fatigue 恢復；reload 後切到原本 inactive 的夥伴仍保留恢復結果，且 bond／stage／evidence 不變。
- [ ] Veteran 存檔保留原 active companion、解鎖、記憶與 trace，且不被強迫重跑 onboarding 或 K9 首次路線。

---

## 真機與人工 gate

- [ ] 依 `docs/testing/REAL_DEVICE_REGRESSION_MATRIX.md` 完成 D1、D2、D3、D6。
- [ ] 使用 `docs/testing/PRIVATE_TEST_SCRIPT.md` 完成 first-session moderated comprehension test。
- [ ] 使用 `docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md` 完成 3 位獨立測試者 × 20 回合。
- [ ] 法律／隱私／商店文案與素材授權由 Owner／合適審查者簽核。
- [ ] 上述任一結果未填寫時，狀態維持 `NOT_RUN`，不可由 automation 代填。

---

## 失敗處理

1. 記錄 commit、裝置、OS、瀏覽器、viewport、fresh/veteran 與重現步驟。
2. 保留必要的 console error 與截圖；不要提交未經同意的原始私人對話。
3. 將機器 regression、sealed holdout、moderated UX 與 private-blind 證據分開標記。
4. 不直接修改 runtime；另開對應 TASK_PACK，依 Gate 流程修復與重驗。
