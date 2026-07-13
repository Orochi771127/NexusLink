# 真機回歸矩陣（Real-Device Regression Matrix）

> Status: checklist（供 Owner 真機執行；此 gate 只有人類能關）
> Date: 2026-07-14
> 補充既有 `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md` 的「Manual real-device gate」，展開為逐機型 × 逐項的可打勾矩陣。
> 測試 build：`main` 最新 commit，本機 `python -m http.server 8128 --directory NexusLink` 或已部署的 Pages URL。

---

## 0. 機型矩陣

| # | 環境 | 必測 | 備註 |
|---|------|------|------|
| D1 | iPhone Safari（實機） | ✅ 必測 | 鍵盤模型 v6 的主要目標平台 |
| D2 | Android Chrome（實機） | ✅ 必測 | |
| D3 | iPhone LINE 內建 webview | ✅ 必測 | 台灣玩家主要分享路徑 |
| D4 | iPhone IG / FB 內建 webview | 🟡 有機會就測 | |
| D5 | iPad Safari（或大屏 Android） | 🟡 有機會就測 | 平板佈局 |
| D6 | 桌面 Chrome ≥1280×800 | ✅ 必測 | Steam 桌面版的前哨 |

每個環境跑一次「新玩家流程」＋一次「老存檔流程」。發現問題照 `NEW_PLAYER_PLAYTEST_2026-07-10.md` 慣例記錄：現象、環境、重現步驟、嚴重度。

## 1. 新玩家流程（每環境 ~15 分鐘）

| 項 | 檢查 | 通過標準 |
|----|------|----------|
| N1 | 首屏載入 | 無白屏/黑屏；PixiJS CDN 載入成功；載入 <5s（行動網路下記錄實際秒數） |
| N2 | Start → Identity → Guidance → Home 九拍 | 每拍可讀可點；30 秒內看懂引導；Identity 可跳過 |
| N3 | 初遇三選一 | 三張立繪 64×64 全載入；選任一隻皆成立；標題動態正確 |
| N4 | 首次觸碰 + 首次心語 | 觸碰有反應；心語送出不丟字（pointerdown/blur race 已修，實機複驗）；回覆可讀 |
| N5 | **虛擬鍵盤** | 鍵盤彈出時輸入框可見、canvas 不變形、收鍵盤後無黑洞（keyboard v6 真機驗收——此項是本輪重點） |
| N6 | 世界地圖 / 月湖路線 | 新地圖美術載入；7 節點 + 6 vignette 不重疊、不出界；圖載失敗時 glyph fallback 正常 |
| N7 | 章節對峙 | 四鍵可按；HUD v2 不擋夥伴；撤退不懲罰；結算文案可讀 |
| N8 | 四大頁（Explore/Care/Growth/Memory） | 開啟與返回可預期；無橫向捲動；無空白頁 |
| N9 | 安全轉導 | 輸入高風險字詞 → 現實求助導引；無記憶寫入、無獎勵、無音效 |
| N10 | 重載回歸 | 重整後存檔在、Return Echo 不責備 |

## 2. 老存檔流程（每環境 ~5 分鐘）

| 項 | 檢查 | 通過標準 |
|----|------|----------|
| V1 | 存檔遷移 | 老存檔載入不炸；active companion / 記憶 / 痕跡 / 章節進度全保留 |
| V2 | veteran 規則 | 已有遊玩痕跡者不重跑初遇 |
| V3 | 新地圖對老存檔 | 已到訪節點狀態正確渲染在新美術上 |

## 3. 效能與體感（每環境記錄，不設硬線但需回報）

- 棲地動畫目測流暢度（順 / 偶爾掉幀 / 明顯卡）
- 地圖頁進入時間（新美術 ~1.5MB JPEG 的實際體感）
- 機身發熱 / 電量異常
- 記憶體崩潰（長玩 10 分鐘以上）

## 4. 結果記錄

每環境一行總結填入下表，證據（截圖/錄影）放 `docs/qa/real-device-evidence/`：

| 環境 | 日期 | N1–N10 | V1–V3 | 阻斷性問題 | 結論 |
|------|------|--------|-------|-----------|------|
| D1 iPhone Safari | | | | | |
| D2 Android Chrome | | | | | |
| D3 LINE webview | | | | | |
| D4 IG/FB webview | | | | | |
| D5 平板 | | | | | |
| D6 桌面 Chrome | | | | | |

**通過標準**：D1/D2/D3/D6 全綠（或僅剩非阻斷性小瑕疵且已記錄）才算關閉此 gate。
