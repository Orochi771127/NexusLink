# 《Nexus Link 心核連結》第一階段架構重構總結報告

## 物理棲地與底層引擎

> 本文件紀錄《Nexus Link》第一階段重構成果：專案已從早期網頁 Prototype，升級為具備擴展能力的 Web 2.5D 情緒棲地遊戲架構。

---

## 1. 核心架構：渲染與介面解耦

### 1.1 DOM / Canvas 雙層架構

專案已改為明確分工：

| 層級 | 職責 |
|---|---|
| DOM / HTML / CSS | HUD、Soul Talk、modal、bottom navigation、設定選單 |
| PixiJS Canvas | 棲地背景、平台、角色實體、粒子、光效、動態互動 |

這樣做的目的：

- 保持 UI 清晰度。
- 避免 Canvas 文字在手機上模糊。
- 讓 PixiJS 專注遊戲實體與動畫。
- 讓未來 UI 可以獨立改版，不破壞渲染層。
- 讓 Safari / Chrome 手機瀏覽器更容易維持版面穩定。

### 1.2 固定解析度投影

專案已建立以 `390x844` 為基準的固定解析度投影概念。

核心原則：

```text
使用固定世界座標
→ 由外層容器進行等比例縮放
→ 保持角色、平台、背景之間的相對位置
→ 避免百分比座標造成空間錯位
```

設計目標：

- 防止手機瀏覽器網址列伸縮導致角色位置跳動。
- 防止角色與平台脫節。
- 防止 RWD 導致角色比例變形。
- 保持手機直式主畫面穩定。

### 1.3 Bottom Anchor 與 Cover 縮放

棲地畫面應以「角色與平台落地感」為優先，而不是單純填滿螢幕。

因此投影策略應優先考慮：

- 角色腳底基準線穩定。
- 魔法陣平台穩定。
- 背景可裁切，但角色不可漂浮。
- 畫面延伸時，底部主互動區不應破壞角色站位。

---

## 2. 環境與時間引擎

### 2.1 絕對時間剝離

專案已引入 `environmentController.js` 的時間控制思路，放棄依賴 frame count 計算時間。

時間應由設備真實時間驅動：

```text
Date.now()
→ 計算目前 phase
→ 計算 day / dusk / night / dawn
→ 控制背景 alpha、天體位置、環境氛圍
```

這樣可以避免：

- 瀏覽器背景休眠造成時間停滯。
- requestAnimationFrame 暫停導致日夜錯亂。
- 玩家切回頁面後環境狀態與真實時間不一致。

### 2.2 日夜交替與天體軌跡

環境引擎應控制：

- 白天背景。
- 夜晚背景。
- 太陽透明度。
- 月亮透明度。
- 天體移動進度。
- 夜晚前景光效。
- 營火 / 水晶 / 魔法陣氛圍。

### 2.3 開發者介入模式

開發者模式應具有高於環境引擎的臨時控制權。

當 scene editor 或 dev panel 啟用時：

- 時間引擎不得覆蓋開發者調整的 alpha。
- 角色實體不得干擾正在調整的場景物件。
- 排版調整應所見即所得。
- 可暫時凍結天體、光效、角色互動。

---

## 3. 視覺管線與動態渲染

### 3.1 2.5D 深度圖層

建議維持以下圖層：

| 圖層 | 內容 |
|---|---|
| Background | 湖畔、森林、天空、遠景 |
| Celestial | 太陽、月亮、星光 |
| Platform | 魔法陣、角色站立平台 |
| Entity | Nexus Core / 角色 / 夥伴 |
| Foreground | 營火、水晶、粒子、近景遮罩 |

這個結構能建立正確的 Z 軸遮罩關係，也能讓未來棲地物件、互動物件與角色動畫分開管理。

### 3.2 Cyber-Taoism 發光渲染

專案視覺方向可定義為：

```text
賽博道教 Cyber-Taoism
= 數位光效
+ 靈性符號
+ 東方能量場
+ 情緒棲地
```

技術上可使用：

- `SCREEN` blend mode：適合去黑底、全息光感、柔和疊光。
- `ADD` blend mode：適合強烈能量、魔法陣、水晶亮點。
- 分離光效圖層：避免把光暈死烙在背景上。

目標是讓魔法陣、水晶與情緒粒子具有活性，而不是單純靜態裝飾。

---

## 4. 現代化 UI 與音效中樞

### 4.1 語意化膠囊排版

右上角資源 HUD 應維持獨立節點與膠囊式排版。

要求：

- 使用等寬數字或 tabular-nums。
- 資源變動時不應造成 UI 跑版。
- 每個資源節點應可獨立做獲取動畫。
- 不應用 Canvas 繪製資源文字。

### 4.2 設定選單與圖標策略

MVP 階段可使用：

- 齒輪選單。
- CSS 靜音斜線。
- 高品質 Emoji 作為信件 / 客服佔位符。

但需注意：

- Emoji 只是 MVP 過渡，不是最終美術規格。
- 正式版應替換為統一 UI icon asset。
- 設定選單不應干擾 Soul Talk 與角色觸摸。

### 4.3 AudioManager 音量與解鎖機制

音訊中樞應採 Singleton 思維，避免多次初始化造成音訊重疊。

核心要求：

- 玩家首次點擊後解鎖音訊。
- 避免瀏覽器 autoplay 限制。
- BGM 初始音量鎖定在安全值，例如 `0.42`。
- 支援 fade in。
- 支援 mute / unmute。
- 不應在頁面載入瞬間出現過大音量。

---

## 5. 第一階段成果判定

目前第一階段已完成或接近完成的底層成果：

- DOM / Canvas 解耦。
- 手機直式主畫面。
- PixiJS 棲地渲染。
- 390x844 世界基準。
- 背景、天體、平台、實體、前景分層。
- 日夜與真實時間邏輯。
- compact HUD。
- Soul Talk modal。
- bottom action sheet。
- localStorage 狀態保存。
- 灰影貓主角色方向。
- 觸摸 / 抱抱互動。
- 防衛閾值反應引擎。
- 開發測試入口。
- 音訊管理器。

這代表專案已經不是單純網頁展示，而是具備「情緒棲地遊戲引擎」雛形。

---

## 6. 架構自我檢討：狀態信任邊界

### 6.1 目前重大盲點

目前所有核心邏輯仍在前端：

- `bond`
- `trust`
- `mood`
- `energy`
- `defense`
- `touchFatigue`
- `lastSeenAt`
- `chatHistory`

在展示、單機原型、GitHub Pages 階段，這完全可以接受。

但當專案進入更深的 Soul Interaction、Barrier Protocol、長期記憶與帳號化階段時，這會形成設計風險：

> 若玩家直接修改本機狀態資料，可能繞過角色防衛閾值，破壞「角色有邊界」的核心體驗。

### 6.2 長期架構方向

如果《Nexus Link》要成為真正的陪伴型資訊生命體，它的「真實記憶」不應永久只存放在客戶端。

長期架構可考慮：

```text
前端：只負責發送互動請求、播放動畫、顯示 UI
後端：負責狀態判定、記憶保存、防衛閾值、角色人格狀態
資料庫：保存玩家與角色的長期關係紀錄
```

可能路線：

- Node.js backend。
- SQLite 作為早期本地 / 輕量資料庫。
- 未來再遷移到雲端資料庫。
- 前端不再直接擁有關係數值的最終修改權。

### 6.3 目前不必立即後端化

但也不能過早後端化。

原因：

- 第一棲地 loop 尚未完整。
- 動畫接入仍在進行。
- Soul Talk 還是 mock reply。
- 記憶結構尚未穩定。
- 後端會增加部署、權限、API、debug 成本。

因此現階段建議：

```text
短期：繼續 localStorage，完成 first emotional habitat loop。
中期：建立 state schema 與 export/import 共鳴碼。
長期：Node.js + SQLite，將真實記憶與防衛邏輯移往後端。
```

---

## 7. 下一步路線選擇

物理軀殼與棲地環境已經具備基礎。下一步要選擇「先喚醒哪一部分」。

### 路線 A：肉體反射

實作 Soul Interaction。

目標：

- 讓貓咪觸摸神經上線。
- 根據 Trust、Defense、Touch Fatigue 觸發：
  - `reject`
  - `guarded`
  - `accept`
- 播放對應動畫。
- 微幅更新 bond / trust / fatigue。
- 將反應寫入短期記憶。

適合現在優先做，因為：

- 不需要 API。
- 能立刻提升生命感。
- 能驗證動畫資產管線。
- 能讓玩家感受到角色有界線。

### 路線 B：語言大腦

實作 Soul Talk 與 Barrier Protocol。

目標：

- 搭建本地 Node.js server。
- 串接 LLM API，例如 Gemini。
- 讀取環境參數與情緒值。
- 生成具備防衛意識的對話。
- 將對話影響動畫、狀態與記憶。

適合稍後做，因為：

- 架構複雜度較高。
- 需要 API key 與安全處理。
- 需要更穩定的記憶 schema。
- 會增加 debug 面向。

### 建議結論

第一階段後的最合理順序：

```text
1. 先走路線 A：肉體反射。
2. 完成灰影貓 touch / hug / idle 動畫閉環。
3. 將 bottom action sheet 行為真正接入 state mutation。
4. 建立記憶節點 schema。
5. 再走路線 B：語言大腦。
```

---

## 8. 第一階段後的工程任務清單

### 8.1 立即任務

- 確認灰影貓 `animations.json` 與實際 PNG 檔案一致。
- 將 metadata 中已有但未被 loader 使用的動畫接入 runtime。
- 將 `hug` 接到雙擊互動。
- 將 `left_walk` / `right_walk` 接入 ambient walk。
- 將 `idle_happy`、`idle_sad`、`idle_angry` 等情緒動畫接入 mood mapping。

### 8.2 中期任務

- 建立 `memories[]` schema。
- 建立 action sheet state mutation。
- 建立心核渡引經 export / import。
- 建立非同步情緒留痕。
- 將 Raphael responseTemplates 最小版接入 Soul Talk。

### 8.3 長期任務

- Node.js backend。
- SQLite persistence。
- LLM API integration。
- Barrier Protocol。
- 多角色人格矩陣。
- 進化與淨化系統。

---

## 9. 結論

《Nexus Link》第一階段重構完成後，專案不再只是「能看的網頁」，而是已經具備：

```text
穩定手機棲地
+ PixiJS 角色實體
+ DOM UI 系統
+ 真實時間環境
+ localStorage 狀態
+ 觸摸防衛邏輯
+ 角色動畫資產管線
+ 未來 AI 大腦接入空間
```

下一步不應急著擴大成戰鬥 RPG 或完整 AI 伴侶，而是要讓第一隻角色真的產生「生命反射」。

優先目標：

> 讓灰影貓能根據信任、防衛與疲勞，播放正確的 idle / touch / reject / hug / walk 動畫，並把互動結果保存為關係狀態。

這會讓《Nexus Link》的第一個情緒棲地閉環真正成立。
