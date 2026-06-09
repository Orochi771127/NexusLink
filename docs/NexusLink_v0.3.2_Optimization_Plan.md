# Nexus Link v0.3.2 優化執行方案

**版本名稱**：Nexus Link v0.3.2 — Greyshade Cat 128 Grid Runtime Stabilization  
**文件目的**：整理灰影貓 128 grid 動畫資產、PixiJS runtime、localStorage 存檔、WebGL context、resize 與營火粒子效能的穩定化執行順序。  
**原則**：本輪只做穩定性、動畫資產管線與效能防禦，不新增玩法。

---

## 1. 版本目標

本輪版本目標不是新增玩法，而是讓《Nexus Link / 心核連結》的第一棲地、灰影貓動畫、PixiJS runtime、localStorage 存檔與資產驗證流程穩定下來。

### 本輪不做

- 不新增戰鬥
- 不新增後端
- 不新增 LLM
- 不改底部導航
- 不大幅改 Soul Talk
- 不擴張多角色系統
- 不引入 React / Vue / Svelte
- 不引入 Vite
- 不引入 Spine

### 本輪要做

- 灰影貓 128×128 grid 動畫資產驗證
- loader 顯式支援 `rows` / `columns`
- soft / alert / safe_harbor mood 動畫對應確認
- WebGL context loss 最低限度防禦
- 營火 spark object pool
- resize requestAnimationFrame 節流
- 存檔系統檢查：以既有 `saveQueue` 為主，不新增平行的 save scheduler

---

## 2. 目前已知狀態

### 已完成

- `animations.json` 已改為 128 grid metadata。
- `validateGreyshadeAssets.mjs` 已改為 128 grid 驗證。
- `animationProfile.js` 已補上 `soft` / `alert` / `safe_harbor` 動畫映射。

### 仍待處理

- 實際 128 PNG 資產上傳或覆蓋。
- `spriteSheetAnimationLoader.js` 顯式支援 `rows` / `columns` 防呆。
- WebGL context loss guard。
- 營火 spark object pool。
- resize requestAnimationFrame 節流。
- 既有 `saveQueue` 存檔路徑 audit；不另建 `saveScheduler`。

---

## 3. 已知問題總結

### 3.1 灰影貓動畫規格不一致

原本 GitHub metadata 使用：

```json
{
  "frameWidth": 64,
  "frameHeight": 64
}
```

且隱含橫向 strip 假設。

但目前本地正式灰影貓資產為：

```txt
frameWidth: 128
frameHeight: 128
grid sprite sheet
```

正式規格：

| Layout | Grid | Frame Count | Expected Size |
|---|---:|---:|---:|
| `2x4_8f` | 2 rows × 4 columns | 8 | 512 × 256 |
| `2x3_6f` | 2 rows × 3 columns | 6 | 384 × 256 |
| `1x4_4f` | 1 row × 4 columns | 4 | 512 × 128 |
| `1x3_3f` | 1 row × 3 columns | 3 | 384 × 128 |

如果 metadata、PNG、validator、loader 沒同步，會導致：

- 動畫切錯格
- 只讀到局部角色
- 幀序錯亂
- 角色尺寸錯誤
- 腳底 anchor 不穩
- 角色與魔法陣對不齊

---

### 3.2 validator 舊規則錯誤

舊 validator 假設：

```js
expectedWidth = frameWidth * frameCount;
expectedHeight = frameHeight;
```

這只適合單列 strip，不適合 2x4 / 2x3 grid。

新規則應為：

```js
expectedWidth = columns * frameWidth;
expectedHeight = rows * frameHeight;
```

---

### 3.3 loader 需要顯式支援 rows / columns

目前 loader 若只用 `texture.width / frameWidth` 推算 columns，屬於隱性推斷。

正式版應改成：

1. 優先使用 `metadata.rows` / `metadata.columns`。
2. 沒有 rows / columns 時，才 fallback 舊格式。
3. 切圖前驗證實際 sheet 尺寸是否足夠。
4. 若實際尺寸大於宣告 grid，允許但警告，多餘像素忽略。

---

### 3.4 情緒 mood 與動畫 profile 需對齊

Soul Talk 可能產生：

```txt
soft
alert
safe_harbor
```

`animationProfile.js` 必須包含這些對應，避免 fallback 到錯誤動畫。

建議：

```js
moodIdle: Object.freeze({
  calm: "idle_calm",
  warm: "idle_calm",
  happy: "idle_happy",
  defensive: "idle_defensive",
  distant: "idle_distant",
  sad: "idle_sad",
  soft: "idle_sad",
  alert: "idle_distant",
  safe_harbor: "idle_calm",
  tired: "idle_sick",
  sleeping: "sleep",
  angry: "idle_angry"
})
```

`safe_harbor` 對應 `idle_calm` 是合理策略，代表保護模式下的穩定，而不是警戒或攻擊。

---

### 3.5 PixiJS runtime 風險

目前仍有幾個中高風險點：

1. 營火 spark 若每次 `new PIXI.Graphics()` 再 `destroy()`，會造成 GC 壓力。
2. localStorage `JSON.stringify()` 與 `setItem()` 都是同步工作；目前需 audit 既有 `saveQueue` 是否足夠。
3. WebGL context loss 無防禦時，iOS Safari / 手機 WebView 背景切回可能黑畫面。
4. resize 若未節流，可能造成頻繁 resize / relayout。
5. state normalize 若每次更新都重建大型陣列，可能造成不必要 allocation。

---

## 4. 目標架構

```txt
index.html
  ↓
src/app.js
  ↓
PixiJS Application
  ↓
createWorld()
  ↓
Scene Layers
  ├─ layerBackground
  ├─ layerCelestial
  ├─ layerPlatform
  ├─ layerForeground
  ├─ layerEntity
  └─ layerFX

State Layer
  ├─ store.js
  ├─ defaultState.js
  ├─ saveManager.js
  ├─ saveQueue.js
  └─ storageGuard.js

Companion Animation Layer
  ├─ spriteSheetAnimationLoader.js
  ├─ animationProfile.js
  ├─ companionRenderer.js
  └─ motionController.js

UI Layer
  ├─ hudController.js
  ├─ soulTalkController.js
  ├─ actionSheetController.js
  └─ panelManager.js
```

---

## 5. 灰影貓 128 grid 資產架構

```txt
assets/
  characters/
    greyshade-cat/
      metadata/
        animations.json
      spritesheets/
        emotion/
        touch/
        movement/
        battle/
        special/
```

短期允許：

```txt
檔名仍含 64x64，但實際 PNG 已替換成 128 grid。
```

中期建議改名：

```txt
greyshade-cat_idle_calm_128x128_2x4_8f.png
```

或：

```txt
greyshade-cat_idle_calm_2x4_8f_128x128.png
```

注意：若暫時保留舊檔名，不可只靠檔名判斷規格，必須以 metadata 與 validator 為準。

---

## 6. 29 個動畫 grid 規格

| # | Animation | Rows | Columns | Frames |
|---:|---|---:|---:|---:|
| 01 | `idle_calm` | 2 | 4 | 8 |
| 02 | `idle_defensive` | 2 | 4 | 8 |
| 03 | `idle_distant` | 2 | 4 | 8 |
| 04 | `blink` | 1 | 3 | 3 |
| 05 | `touch_guarded` | 2 | 3 | 6 |
| 06 | `touch_accept` | 2 | 3 | 6 |
| 07 | `touch_reject` | 2 | 3 | 6 |
| 08 | `hug` | 2 | 3 | 6 |
| 09 | `sit` | 2 | 3 | 6 |
| 10 | `sleep` | 2 | 4 | 8 |
| 11 | `right_walk` | 2 | 4 | 8 |
| 12 | `attack_basic` | 2 | 3 | 6 |
| 13 | `defend` | 2 | 3 | 6 |
| 14 | `hit` | 1 | 4 | 4 |
| 15 | `idle_sick` | 2 | 4 | 8 |
| 16 | `idle_angry` | 2 | 3 | 6 |
| 17 | `idle_sad` | 2 | 3 | 6 |
| 18 | `idle_dance` | 2 | 4 | 8 |
| 19 | `idle_wash` | 2 | 4 | 8 |
| 20 | `idle_wake` | 2 | 4 | 8 |
| 21 | `idle_happy` | 2 | 4 | 8 |
| 22 | `special_wake` | 2 | 4 | 8 |
| 23 | `left_walk` | 2 | 4 | 8 |
| 24 | `special_left_walk` | 2 | 4 | 8 |
| 25 | `special_angry` | 2 | 3 | 6 |
| 26 | `idle_enjoy` | 2 | 4 | 8 |
| 27 | `special_sad` | 2 | 3 | 6 |
| 28 | `special_dance` | 2 | 4 | 8 |
| 29 | `special_wash` | 2 | 4 | 8 |

---

## 7. 推薦執行順序

### Phase 0：安全基線

```bash
git checkout main
git pull origin main
git checkout -b fix/greyshade-loader-grid-slicing
```

---

### Phase 1：資產與 metadata 驗證

1. 確認 `assets/characters/greyshade-cat/metadata/animations.json` 每個 animation 有：

```json
{
  "frameWidth": 128,
  "frameHeight": 128,
  "rows": 2,
  "columns": 4,
  "frameCount": 8,
  "fps": 4,
  "loop": true,
  "anchor": { "x": 0.5, "y": 1 }
}
```

2. 手動上傳或覆蓋 29 張正式 128 grid PNG。
3. 執行：

```bash
node tools/validateGreyshadeAssets.mjs
```

正常通過：

```txt
Greyshade asset validation passed.
```

若 PNG 尚未換成 128 grid，尺寸錯誤是預期結果，代表 validator 正常工作。

---

### Phase 2：loader 顯式支援 rows / columns

目標檔案：

```txt
src/pixi/spriteSheetAnimationLoader.js
```

核心要求：

- 使用 `definition.rows` / `definition.columns`。
- 缺少 rows / columns 時 fallback 舊 strip 邏輯。
- 切圖前驗證 sheet 尺寸。
- 若尺寸不足，throw error。
- 若尺寸較大，warn 並忽略多餘像素。
- 保留 PixiJS v8 Texture 建構方式。

建議 helper：

```txt
resolveGridDefinition(texture, definition)
validateSpriteSheetDimensions(texture, definition, animationName)
sliceSpriteSheet(texture, definition)
```

---

### Phase 3：情緒動畫映射確認

目標檔案：

```txt
src/engine/animationProfile.js
```

確認 mood 對應包含：

```txt
soft → idle_sad
alert → idle_distant
safe_harbor → idle_calm
```

---

### Phase 4：顯示比例與 pixel-perfect 檢查

先不要急著改 `sceneLayout.js`。

檢查：

- 灰影貓是否太大
- 腳底是否穩定
- 魔法陣是否仍在腳下
- `idle_calm` / `idle_sad` / `idle_happy` 切換是否跳動
- `touch_accept` / `touch_reject` 是否位移異常
- `left_walk` / `right_walk` 是否腳底飄移
- `sleep` / `sit` 是否被裁切

若 128 灰影貓太大，再微調：

```js
{ id: "companion", x: 195, y: 586, scale: { x: 0.62, y: 0.62 } }
```

禁止：

- 不用 CSS 硬拉 canvas
- 不改 anchor
- 不對不同動畫給不同 scale
- 不讓每個 animation 自己補 position

---

### Phase 5：WebGL Context Loss Guard

新增檔案：

```txt
src/pixi/webglContextGuard.js
```

MVP 策略：context restore 後直接 reload，讓 PixiJS 與 textures 重新初始化。正式版再改 scene rebuild。

---

### Phase 6：存檔系統 audit，不新增 saveScheduler

目前專案已有：

```txt
src/state/saveQueue.js
```

原則：

- 不新增 `saveScheduler.js`。
- 不做雙層 debounce。
- 優先檢查既有 `saveQueue` 的 `CRITICAL` / `INTERACTION` / `DEBOUNCE` 是否覆蓋目前情境。
- 若不足，應擴充 `saveQueue`，不要建立平行存檔系統。

要驗證：

- `visibilitychange → hidden` 會 flush。
- `beforeunload` / `pagehide` 是否需要補齊。
- `CRITICAL` 初始保存不是 no-op。
- interaction save 不造成每幀寫入。

---

### Phase 7：營火 Spark Object Pool

目標檔案：

```txt
src/pixi/pixiApp.js
```

目的：避免 ticker 內反覆 `new PIXI.Graphics()` / `destroy()`。

原則：

- 初始化固定 pool。
- emit 時 acquire。
- 結束時 release，不 destroy。
- pool size 建議 40。

---

### Phase 8：resize requestAnimationFrame 節流

目標檔案：

```txt
src/pixi/pixiApp.js
```

目的：避免 resize event 直接連續觸發 layout。

建議：

```js
let resizeRaf = 0;
const handleResize = () => {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    world.__resizeScene();
  });
};
```

---

## 8. 測試清單

### 8.1 資產驗證

```bash
node tools/validateGreyshadeAssets.mjs
```

期待：

```txt
29 animations checked
No critical errors
```

允許暫時警告：

```txt
sheet filename still contains 64x64
```

不允許：

- missing sheet
- wrong dimensions
- rows × columns < frameCount

---

### 8.2 Runtime 測試

```bash
python -m http.server 5173
```

瀏覽：

```txt
http://localhost:5173
```

檢查：

1. 灰影貓是否正常顯示
2. `idle_calm` 是否正常播放
3. `touch_accept` 是否正常播放
4. `touch_reject` 是否正常播放
5. `hug` 是否正常播放
6. `idle_sad` / `idle_happy` / `idle_sick` 是否正常切換
7. `left_walk` / `right_walk` 是否沒有跳格
8. 腳底是否穩定
9. 魔法陣是否對齊
10. console 是否無 critical error

---

### 8.3 儲存測試

操作：

- 輸入心語
- 點擊 Care
- 點擊 Memory
- 摸灰影貓
- 背景切換後回來
- 重新整理頁面

確認：

- 狀態仍保存
- `chatHistory` 不爆量
- localStorage 無 `QuotaExceededError`
- 沒有明顯卡頓

---

### 8.4 手機測試

必測：

- iPhone Safari
- iPhone Chrome
- Android Chrome

測試情境：

1. 開遊戲 5 分鐘
2. 連續觸摸 20 次
3. 輸入 10 則心語
4. 切到背景再切回
5. 鎖屏再解鎖
6. 旋轉螢幕
7. 回首頁再回瀏覽器

檢查：

- 是否黑畫面
- 是否掉幀
- 是否角色消失
- 是否動畫停止
- 是否 localStorage 保存

---

## 9. Commit 拆分建議

| Commit | Message |
|---:|---|
| 1 | `Update greyshade animation metadata to 128 grid layout` |
| 2 | `Update greyshade asset validator for 128 grid sheets` |
| 3 | `Support explicit rows columns slicing in spriteSheetAnimationLoader` |
| 4 | `Map sedimentation moods to available greyshade animations` |
| 5 | `Add WebGL context loss guard` |
| 6 | `Audit saveQueue hidden flush behavior` |
| 7 | `Pool campfire sparks to reduce runtime allocations` |
| 8 | `Throttle resize handling with requestAnimationFrame` |

---

## 10. 完成定義

本輪完成標準：

1. `animations.json` 29 個動畫全部為 128×128 grid metadata。
2. 29 張 PNG 實際尺寸與 metadata 對齊。
3. `validateGreyshadeAssets.mjs` 通過。
4. loader 顯式支援 `rows` / `columns`。
5. `soft` / `alert` / `safe_harbor` 不再 fallback 到錯誤動畫。
6. 營火 spark 不再每次 new / destroy。
7. 存檔系統以既有 `saveQueue` 完成 debounce / flush audit。
8. WebGL context loss 有最低限度保護。
9. resize 有 requestAnimationFrame 節流。
10. 手機瀏覽器切背景回來不黑畫面。
11. 灰影貓腳底穩定，動畫切換不跳。
12. console 無 critical error。

---

## 11. 最終判斷

灰影貓正式改成 128×128 是正確方向。

理由：

1. 本地完整動畫包已是 128×128 grid。
2. 128 在手機主畫面可讀性更好。
3. 後續 ThunderPup / 星能小山豬可往 96 或 128 對齊。
4. 角色作為情緒棲地核心，需要更高存在感。
5. 64×64 適合小型圖示，不適合目前主夥伴 runtime 表演。

但必須避免錯誤做法：

- 只改 metadata，不換 PNG → runtime 會切錯。
- 只換 PNG，不改 validator → 驗證會誤報。
- 只改 validator，不改 loader → 未來多尺寸資產風險仍在。
- 只調 scene scale，不檢查 anchor → 腳底會飄。
- 一次順手改太多 gameplay → MVP 會失控。

正確順序：

```txt
metadata
→ PNG 資產
→ validator
→ loader
→ animationProfile
→ 顯示比例
→ WebGL guard
→ saveQueue audit
→ spark pool
→ mobile QA
```

---

## 12. 下一步建議

下一個 coding task 應只做：

```txt
v0.3.2A — spriteSheetAnimationLoader explicit rows / columns support
```

不要一次執行全部 Phase。完成後再貼回：

```txt
git diff -- src/pixi/spriteSheetAnimationLoader.js
node tools/validateGreyshadeAssets.mjs
```
