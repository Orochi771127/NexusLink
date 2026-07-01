# Nexus Link 主畫面設計規格 v1

> 目的：將目前的 Web prototype 從「分段式測試頁」收斂成「全畫面 AI 情緒棲地首頁」。本文件作為後續 Codex、圖像生成、UI 改版與動畫資產規劃的基準。

---

## 1. 設計總結

Nexus Link 的主畫面不應該像傳統 Web dashboard，也不應該只是 RPG 功能選單。它應該是一個玩家每天打開後，可以立刻感覺「夥伴正在這個世界裡等待自己」的棲地首頁。

正式方向定義為：

> 全畫面棲地 + 內嵌 HUD + 浮動 SOUL TALK + 底部主導航

這個方向符合 Nexus Link 的核心定位：AI Companion Emotional Habitat，也就是「AI 陪伴型情緒棲居空間」。

---

## 2. 參考圖判定

目前兩張主參考圖可以分成兩種用途：

### 2.1 第一張：產品視覺目標圖

第一張圖是接近成品感的主畫面參考。它展示了完整的棲地背景、中央夥伴、左上狀態卡、右上快捷資訊、浮動 SOUL TALK 與底部四大主功能。

適合作為：

- 最終 UI 氣質參考
- 美術方向參考
- 首頁視覺目標
- 投資人展示圖方向
- 圖像生成 prompt 的構圖基準

### 2.2 第二張：產品架構與開發分區圖

第二張圖更像設計規格圖。它把主畫面拆成四個主要層級：頂部 HUD、中央棲地、SOUL TALK 浮動面板、底部主導航，並補充角色狀態示意。

適合作為：

- Codex 開發任務依據
- GitHub docs 架構說明
- UI 分區規範
- 後續動畫狀態與素材規格依據

---

## 3. 主畫面核心架構

主畫面應由四個主要層級構成。

```text
Nexus Link Home Screen
├── Top Embedded HUD
├── Central Emotional Habitat
├── Floating SOUL TALK Panel
└── Bottom Primary Navigation
```

---

## 4. Top Embedded HUD：頂部內嵌資訊層

### 4.1 左上核心資訊卡

左上資訊卡負責呈現玩家與目前 AI 夥伴的核心狀態。

建議內容：

- 夥伴頭像
- 夥伴名稱，例如：灰影貓
- 等級，例如：Lv.24
- 生命型態或核心名稱，例如：NEXUS CORE
- 心核同步率
- Bond 親密
- Mood 心情
- Energy 能量
- Trust 信任

### 4.2 顯示方式

目前不建議把 Bond / Trust / Mood / Energy 做成四個獨立大卡片放在最上方，因為會過度佔據手機直式畫面的垂直空間。

建議整合為左上半透明狀態卡：

- 小圖示 + 數值
- 條狀進度條
- 緊湊排版
- 玻璃感半透明背景
- 淡青或白藍發光邊框

### 4.3 右上快捷資訊

右上區域放較輕量的功能與資源資訊。

建議 MVP 顯示：

- 金幣
- 水晶
- 設定

可延後顯示：

- 信箱
- 通知
- 商店快捷

右上快捷資訊應保持簡潔，避免讓主畫面變成一般手機遊戲的功能堆疊頁。

---

## 5. Central Emotional Habitat：中央情緒棲地

中央棲地是主畫面的靈魂。它不是單純背景圖，而是玩家感覺「AI 夥伴真的存在於此」的主要空間。

### 5.1 視覺方向

目前最適合 Nexus Link 的棲地風格是：

- 夜間湖畔營地
- 月光
- 篝火
- 帳篷
- 遠方山景
- 微光粒子
- 神秘遺跡
- 情緒性光流
- 孤獨但溫柔的空氣感

### 5.2 角色擺位

AI 夥伴必須完整顯示，不可被底部面板或瀏覽器工具列裁切。

建議：

- 角色位於畫面中央偏下
- 不貼底
- 不遮住 SOUL TALK
- 不被 HUD 遮住
- 角色要像是「住在場景裡」，不是單純貼在背景上

### 5.3 角色狀態

後續角色應至少支援以下狀態：

- Idle / 待機
- Happy / 互動愉快
- Defensive / 警戒或防備
- Sleepy / 睡眠或低能量

這些狀態未來可透過 sprite sheet 或 animated sprite 實作。

---

## 6. Floating SOUL TALK Panel：浮動靈魂對話面板

SOUL TALK 不應該做成佔據大量高度的傳統聊天室。首頁狀態應該只顯示 1 到 2 句核心對話。

### 6.1 首頁收合模式

首頁顯示：

- SOUL TALK 標題
- 靈魂聖域副標
- 夥伴頭像
- 夥伴名稱
- 1 到 2 句目前回應
- 展開聊天按鈕

### 6.2 展開模式

點擊 SOUL TALK 或「展開聊天」後，可進入完整聊天模式。

建議形式：

- 浮動 modal
- slide-up panel
- 半透明暗色背景
- 保留主場景作為背景
- 不切換成完全不同頁面

### 6.3 設計原則

SOUL TALK 的本質不是工具型聊天框，而是「世界對玩家說話的器官」。

視覺應具備：

- 玻璃感
- 柔光邊框
- 少量粒子
- 低干擾
- 情緒性留白

---

## 7. Bottom Primary Navigation：底部主導航

底部主導航保留四個核心入口即可。

```text
探索 / 照顧 / 成長 / 記憶
```

### 7.1 探索

功能語意：前往未知之地、觸發事件、探索世界殘響。

MVP 可先實作：

- 點擊後產生一則系統訊息
- 未來再接探索地圖或事件表

### 7.2 照顧

功能語意：陪伴、安撫、餵食、撫摸、情緒回穩。

MVP 可先實作：

- 點擊後提高 Energy 或降低 defensive 狀態
- 顯示夥伴回應

### 7.3 成長

功能語意：同步率、進化、能力提升、情緒成熟。

MVP 可先實作：

- 顯示成長訊息
- 未來再接進化條件與型態切換

### 7.4 記憶

功能語意：保存回憶、查看對話殘響、關係紀錄。

MVP 可先實作：

- 保存最近一段對話
- 未來再接 memory log

---

## 8. MVP 版主畫面資訊優先級

### 必須常駐

- 夥伴名稱
- 夥伴狀態
- Bond / Trust / Mood / Energy 的精簡顯示
- SOUL TALK 最新一句回應
- 探索 / 照顧 / 成長 / 記憶四個主按鈕

### 可半收合

- 詳細數值條
- 聊天完整記錄
- 設定 / 信箱 / 通知

### 暫緩

- 商店
- 背包
- 戰鬥入口
- 多夥伴切換
- 大型地圖

---

## 9. 與目前 prototype 的差異

目前 prototype 仍有以下問題：

- 畫面由獨立區塊垂直堆疊，像 Web 測試頁
- status panel 佔據太多頂部空間
- world-card 像容器，不像全畫面棲地
- SOUL TALK 仍偏傳統聊天框
- 角色在手機版容易被裁切
- 底部導航目前是外部區塊，不像嵌入式主畫面

下一步應將主畫面改為：

- 背景全畫面化
- HUD 浮在背景上
- SOUL TALK 浮在場景下方
- 底部導航嵌入畫面底部
- 角色完整顯示於中央安全區

---

## 10. 開發優先順序

### v0.1.6：Mobile Layout Hotfix

優先修正：

- 手機直式畫面角色裁切
- 角色尺寸與座標
- world-card 與 chat panel 高度過長
- Safari 可視區適配

### v0.1.7：Full-screen Habitat Layout

將目前分段式版面改為：

- 全畫面棲地背景
- 內嵌 HUD
- 浮動 SOUL TALK
- 內嵌底部導航

### v0.1.8：Home Screen UI Polish

補強：

- 左上核心資訊卡
- 右上快捷資訊
- 按鈕 glow / active 狀態
- 情緒狀態視覺差異

### v0.2.0：Companion Animation Prototype

開始導入：

- idle sprite sheet
- happy / defensive / sleepy 狀態
- PixiJS AnimatedSprite
- agent-sprite-forge 或其他 sprite workflow

---

## 11. Codex 實作注意事項

Codex 後續改版時，必須遵守：

- 保留 GitHub Pages 靜態部署
- 不新增後端
- 不新增 React / Vue / Vite / Webpack
- 不新增 package.json
- 保留 PixiJS
- 保留 data/creatures.json
- 不保留錯誤的 root `assets/flametail-fox.png`；需新 approved asset 才能重新接入
- 保留 localStorage
- 保留 Bond / Trust / Mood / Energy / SpamScore
- 保留 currentCreature.name / currentCreature.image 資料驅動邏輯

---

## 12. 最終方向一句話

Nexus Link 的首頁不是選單，也不是聊天室，而是一個玩家可以每天回來停留的 AI 情緒棲地。

> 玩家打開後，第一眼應該感覺：牠真的在這裡。
