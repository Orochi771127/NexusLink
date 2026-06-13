# R2 Vertical Slice — Known Limitations

更新：2026-06-11

## 夥伴與素材

1. **僅 greyshade-cat 有完整 runtime 動畫。** flametail-fox 為單張靜態立繪；crystal-seahorse / verdant-stag / thunder-pup 為 Pixi Graphics 輪廓佔位（元素著色 + 簡易徽記）。正式 sprite 需求見 `R2_ASSET_REQUEST_LIST.md`。
2. **Placeholder 夥伴沒有動作動畫**：touch 反應只有狀態與文字回饋，無對應動畫（fallback 安全、不 crash）。
3. **頭像 orb**：非 greyshade 夥伴以圖片或元素色光暈替代，無正式 portrait。
4. **`data/creatures.json` 已不再被 runtime 讀取**（資料遷至 `src/data/companionRegistry.js`），檔案保留作參考、未刪除。

## Soul Talk

5. 情緒判斷為**本地關鍵字規則**（7 類），無語意理解；中英混輸、否定句（「不難過」）可能誤判。
6. 回應為預寫池（每情緒 6 句 × 語氣修飾）；長期遊玩會感到重複。
7. 記憶回聲視窗固定 48 小時、僅引用最近一筆同情緒記憶。

## 戰鬥

8. **戰鬥 session 不持久化**：戰鬥中 reload 視為戰鬥未發生（無懲罰、無獎勵）。屬刻意設計，避免存檔污染。
9. 敵人僅 3 種、無 AI 變化（固定攻擊 + 機率防禦）；無屬性克制表（情感元素相剋為後續系統）。
10. 戰鬥無 Pixi 動畫/特效，純 DOM 面板；greyshade-cat 雖有 battle frames，本版未接入戰鬥畫面。

## 探索

11. ~~地圖為 DOM 節點列表~~ → **v1-A 已升級為視覺化節點地圖**（DOM + inline SVG 光路）。仍存限制：節點間無解鎖關係（5 點全開）、光路為固定 UI 常數（非資料驅動）、地圖背景為純 CSS 漸層（無美術底圖）。
12. 探索事件池每節點僅數條訊息；獎勵為固定 stat patch + 機率遭遇。

## 進化 / Codex

13. **僅 thunder-pup 有完整 5 階進化線**，且為「圖鑑顯示解鎖」（依勝場），非真正的型態變身——夥伴外觀不會改變。
14. 進化條件僅綁 `battleRecord.wins`；設計文件中的多維條件（bond/trust/徽章共鳴/地圖事件/儀式）尚未實作。
15. Codex 未含 7 徽章共鳴條（emblem resonance bar 0–100%）與 Perfect/Ultimate 展示框特效，雷達為 6 軸單層。

## 離線回歸

16. 問候只在 app 啟動時注入一次；長時間掛機（不 reload）不會觸發。
17. `environmentHeartbeat` 的 trace-based 回歸訊息寫入 `reactionPreview`（心語預覽），與聊天問候並存——極端情況下兩者文案可能同場出現（非重複訊息，但語意相近）。

## 其他

18. 金幣/晶石資源 HUD 仍為靜態裝飾數字（非系統）。
19. 等級 pill（「等級 01」）為裝飾，無等級系統。
20. 切換夥伴會重建 Pixi 節點；greyshade 動畫包有模組層快取，但快速連續切換仍可能造成短暫載入空檔。
21. 無自動化測試；驗證依 `R2_TEST_CHECKLIST.md` 手動執行。
22. **記憶回聲需 `trust >= 3`**（設計選擇，非 bug）：全新存檔的前幾句對話不會出現「上次你也說過…」，trust 累積後才解鎖。
23. **開發注意**：以 `python -m http.server` 開發時，瀏覽器可能快取 ES module；修改 `src/**` 後請硬重新整理（Ctrl+F5），否則會跑到舊版模組（驗證期間實際遇到）。
24. `r2/.claude/launch.json` 為本次驗證新增的本地 preview 設定檔（非 runtime 資產），可保留供日後測試或自行刪除。

## White Lab — Bond Boundary Slice（2026-06-12）

W1. **對峙結局持久化走映射**：stabilized/recovered→win、overwhelmed_but_safe→lose、retreated→retreat（不改 battleRecord schema）。跨 session 的對話引用因此無法區分 stabilized 與 recovered（同 session 由 controller 傳精確結局）。
W2. **bodyCue 的 drift（位移）欄位為預留**：step_back/approach_softly 目前以既有 touch 動畫的內建位移表現，未做獨立的位置 drift；BODY_CUE_PROFILE 資料結構已就緒，待 motion 升級接入。
W3. **探索引用只在「首訪且無遭遇」觸發一次**，重訪節點不再引用（防止重複感）；探索無獨立 timestamp（不改 schema），新鮮度由呼叫端控制。
W4. **對峙仍無 Pixi 演出**：greyshade 的 attack/defend/hit frames 未接入對峙畫面，全 DOM 呈現。
W5. 連續兩個 session 內結束對峙＋reload，chat 可能出現同結局 pool 的兩句不同引用（同句已防重複）；pool 各 2 句，視覺上接近「補充說明」，暫不視為 bug。
W6. 尊重沉積每個 reject episode 僅一次（lastTouchReaction 覆寫即失效），跨 reload 的 episode 追蹤依 lastRejectAt/lastTouchReaction 持久欄位，行為一致。

## UI Polish v1-A（2026-06-11）

25. 節點完整描述只放在 `title` 屬性與 `aria-label`（桌面 hover / 螢幕閱讀器可見）；地圖上未做行動端的節點詳情視圖，行動端玩家只能從探索結果認識節點。
26. 探索結果 toast 的文案直接取自節點 `resultMessages` 池（每節點 1–3 條），長期遊玩重複感同第 12 點。
27. 探索成功/能量恢復等 HUD 數值脈動（`.feedback-pulse`）的目標元素位於夥伴狀態 modal 內——地圖開啟時不可見，實際可見回饋以 toast chips 為主。
28. `--filter-glass` 由 blur(20px) 全域調降為 blur(16px)（刻意的效能/質感平衡）；若有人偏好舊濃度，改一個 token 即可。
29. 戰鬥與 Codex 的 game feel 尚未升級（本輪刻意只做地圖 + token，依任務範圍）。
