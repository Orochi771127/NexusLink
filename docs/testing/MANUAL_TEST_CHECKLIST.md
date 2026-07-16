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
- [ ] D2 自動證據必須同時證明：完整 system reply、零 quick replies、零 SFX、零 gameplay delta、零 preference/memory/trace 寫入、critical save。

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

- [ ] Application → Local Storage 只有主狀態 key `nexusLinkR2State:v1` 承擔遊戲狀態。
- [ ] `nexusLinkR2State:v1` 為有效 JSON，包含 `chatHistory`、`habitatTraces`、`companionPreferences` 與 `settings.audioMuted`。
- [ ] 成功寫入主存檔後，legacy `nexusLinkCompanionPrefs:v1` 與 `nexusLinkAudioMuted:v1` 被移除。
- [ ] reload 後 active companion、聊天、trace、設定與 exploration progress 保留。
- [ ] `lastSeenAt` 的 0、負數或非數字損壞值會被安全正規化，不產生離線懲罰。
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
