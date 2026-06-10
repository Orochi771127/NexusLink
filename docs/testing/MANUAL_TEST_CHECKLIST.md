# MANUAL_TEST_CHECKLIST.md — Nexus Link 手動測試清單

> Nexus Link 是純靜態專案，無 build step，無 npm test。  
> 所有測試透過本地 HTTP server + 瀏覽器手動執行。  
> **不要求安裝 npm / Playwright / 任何測試框架。**

---

## 啟動本地伺服器

```bash
# 在專案根目錄執行
python -m http.server 5173

# 或使用 Python 2（若 Python 3 不可用）
python -m SimpleHTTPServer 5173
```

開啟瀏覽器：`http://localhost:5173`

> 注意：必須透過 HTTP server 開啟，直接開啟 `file://` 路徑會導致 ES module CORS 錯誤。

---

## 基本載入

- [ ] **頁面載入**：`http://localhost:5173` 開啟後沒有 blank page
- [ ] **Console 無錯誤**：F12 開啟 DevTools，Console tab 沒有紅色 Error 訊息
  - 允許：`[Deprecation]`、`[Warning]` 等非 Error 訊息
  - 不允許：`Uncaught Error`、`Failed to load resource`、`PixiJS is not available`
- [ ] **PixiJS 載入**：Console 中輸入 `window.PIXI` 應返回 PixiJS 物件（非 undefined）

---

## 手機比例檢查

- [ ] **DevTools 模擬手機**：F12 → Toggle device toolbar (Ctrl+Shift+M)
  - 設定尺寸：390 × 844（iPhone 14 Pro）
  - 確認畫面無水平捲軸，全頁正常顯示
- [ ] **Safe area**：頂部 / 底部 UI 不被裁切

---

## Pixi Canvas 場景

- [ ] **Canvas 顯示**：`#game-root` 內出現 `<canvas>` 元素
- [ ] **背景顯示**：出現湖畔夜景（`bg_night_base.PNG` 或 `bg_day_base.PNG`）
- [ ] **天體顯示**：月亮 / 太陽根據時間顯示並沿弧線移動
- [ ] **魔法陣顯示**：平台魔法陣（`magic_circle.PNG`）出現在場景中
- [ ] **粒子效果**：小光點粒子在場景中緩緩上升
- [ ] **篝火效果**（夜晚時）：篝火出現並有火花粒子

---

## 角色顯示

- [ ] **角色出現**：灰影貓出現在魔法陣平台附近
- [ ] **動畫播放**：角色在 idle 狀態下有動畫（idle_calm spritesheet 播放）
- [ ] **像素清晰度**：角色像素風格清晰，沒有模糊（確認 nearest-neighbor 插值）
- [ ] **角色位置**：角色座標整數，沒有亞像素偏移造成的模糊

---

## HUD 顯示

- [ ] **角色名稱**：左上角或 HUD 區域顯示角色名稱（「灰影貓」）
- [ ] **狀態點**：`.core-status-dot` 顯示（根據心情有不同顏色）
- [ ] **等級顯示**：`.level-pill` 顯示「等級 01」
- [ ] **點擊 HUD**：點擊角色頭像或名稱，打開角色狀態面板（character modal）
  - 面板內顯示：羈絆 / 心情 / 能量 / 信任 四條狀態列
  - 點擊 X 或背景可關閉面板

---

## 資源顯示

- [ ] **金幣**：右上角顯示 `1280`（初始值）
- [ ] **晶石**：右上角顯示 `36`（初始值）

---

## 設定 / 音效

- [ ] **音效按鈕**：點擊喇叭圖示，切換靜音狀態（icon 有視覺反饋）
- [ ] **設定下拉**：點擊齒輪圖示，展開設定選單（出現信件 / 支援按鈕）
- [ ] **點擊外部關閉**：設定下拉展開後，點擊其他區域可自動關閉

---

## Soul Talk（心語對話）

- [ ] **開啟 Soul Talk**：點擊底部「心語」區塊，開啟 Soul Talk 面板
- [ ] **初始訊息**：面板中顯示初始夥伴訊息「我在這裡，安靜地看著你。」
- [ ] **輸入訊息**：
  - 在輸入框輸入文字
  - 點擊「送出」或按 Enter
  - 訊息出現在聊天記錄中（「你：<訊息>」）
  - 夥伴有回應訊息（「灰影貓：...」）
- [ ] **預覽文字更新**：關閉面板後，`.soul-talk-launcher` 的預覽文字更新為最新回應
- [ ] **關閉面板**：點擊 X 或背景關閉

---

## 底部導覽

- [ ] **四個導覽按鈕**：探索 / 照顧 / 成長 / 記憶 按鈕全部顯示
- [ ] **點擊動作**：點擊任一按鈕，展開對應的 action sheet
- [ ] **Active 狀態**：被點擊的按鈕有 active 視覺狀態（nav-art-active 圖片）
- [ ] **Action Sheet 互動**：
  - action sheet 中顯示對應選項
  - 點擊選項，面板關閉，Soul Talk 顯示結果訊息
- [ ] **關閉 Action Sheet**：點擊 X 或背景關閉

---

## localStorage 存檔

- [ ] **自動存檔**：
  - 送出一條 Soul Talk 訊息
  - F12 → Application → Local Storage → `http://localhost:5173`
  - 確認 key `nexusLinkPrototypeState:v2` 存在
  - value 為有效 JSON（可展開）
- [ ] **存檔持久化**：
  - 重新整理頁面（F5）
  - 確認 Soul Talk 歷史記錄保留（聊天記錄沒有消失）

---

## 棲地痕跡（habitatTraces）

> 若目前 branch 包含 habitatTrace 相關功能：

- [ ] **痕跡顯示**：送出幾條情緒相關訊息後，場景中出現微光 / 霧氣效果
- [ ] **痕跡脈動**：痕跡效果有緩慢脈動動畫
- [ ] **痕跡寫入**：F12 → Application → Local Storage → `nexusLinkPrototypeState:v2` → `habitatTraces` 陣列非空

---

## 角色觸碰互動

- [ ] **點擊角色**：點擊 Pixi 場景中的灰影貓角色
  - 第一次觸碰：出現觸碰反應動畫（touch_accept 或 touch_guarded）
  - HUD 或狀態有變化（energy / bond）
- [ ] **多次觸碰**：連續點擊多次，疲勞度上升，可能出現 touch_reject 反應

---

## Dev Panel（選填）

> 僅在 URL 加上 `?devPanel=1` 後測試：

- [ ] **Dev Panel 出現**：`http://localhost:5173?devPanel=1`
- [ ] **State 讀數**：顯示 bond / trust / energy / mood 等數值
- [ ] **動畫測試**：可切換播放不同動畫

---

## 失敗處理

若測試發現問題：
1. 在 Console 截圖錯誤訊息
2. 記錄重現步驟
3. 回報給 AI agent，說明具體失敗的測試項目
4. **不要自行修改 runtime code** — 等待 AI 按 Gate 流程處理
