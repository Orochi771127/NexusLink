# CHARACTER_ASSET_PIPELINE.md — Nexus Link 心核夥伴角色資產管線

> 本文件定義心核夥伴從概念到 runtime 的完整資產流程。  
> 目前主要角色：**灰影貓（greyshade-cat）**

---

## 核心規則（必讀）

> ⚠️ **不可直接把漂亮圖丟進 runtime。**  
> 無論圖片多漂亮，未通過完整 pipeline 的資產不得進入 `assets/characters/<id>/spritesheets/`。

新 companion 進入 runtime 的 spritesheet 必須符合所有條件：
- illustrated / painterly / high-detail，不是 chunky pixel art default
- master frame = `512×512 px`
- final runtime PNG 必須透明（alpha channel，無白色或純色底）
- frame 內不可 baked-in 白底、UI、文字、場景、展示台、圖鑑框
- 固定 frame size（所有幀寬高一致）
- bottom-center anchor / baseline 對齊（概念上 `x: 0.5, y: 1`）
- final on-screen position snap 保留，避免動畫切換時腳底滑動
- companion sampling = linear + mipmaps，不是 nearest-neighbor
- 任一 sprite sheet edge `<= 4096 px`
- frame grid 必須整除：`sheet_width / cols` 與 `sheet_height / rows` 都必須是整數
- scale 必須使用 `frameHeight`，不可使用整張 `sheetHeight`
- 檔名符合命名規則
- `animations.json` 已更新
- human 已確認視覺品質

`greyshade-cat` 現有 443/444 frame 是 legacy accepted，不可 upscale 到 512。既有 pixel-style concept sheets、舊圖鑑、64 PPU、96px 標記圖保留為 design reference / art canon；舊設定圖不可直接視為廢棄，也不可直接視為 runtime companion sprite。若要實裝舊設計，必須依該設計重新輸出 clean `512×512` transparent companion frame。

**必須先有 approved seed frame。**  
在生成完整動畫序列前，需先產出單一 seed frame，經 Gemini review 和 human 確認後，才可展開其餘幀的生成。未 approved 的 seed frame 不得進入 spritesheets 目錄。

---

## 資產管線概覽

```
human 提供舊設計圖 / concept sheet / art canon
  ↓
Codex 整理 Character Lock Spec
  ↓
human 核准 lock spec
  ↓
Codex 產 prompt / action config
  ↓
image generation tool 產出 512×512 transparent frame 或 animation sheet
  ↓
Codex 做 validation / QC report / preview
  ↓
human 最終核准
  ↓
通過後才進 runtime assets
  ↓
spritesheet（fixed frame size，grid 整除，edge <= 4096）
  ↓
transparent PNG + bottom-center baseline / position snap 驗證
  ↓
animations.json metadata 更新
  ↓
assetManifest.js 確認路徑
  ↓
runtime 測試（MANUAL_TEST_CHECKLIST.md）
```

---

## 一、概念圖（Concept Art）

**目的**：確立角色的視覺風格、配色、情緒氣質。

**工具**：ChatGPT image generation（主）/ Gemini（輔助 review）

**規格**：
- 尺寸：512×512 或 1024×1024（供設計參考，不是 runtime 用）
- 格式：PNG
- 風格：illustrated / painterly / high-detail，Cyber-Taoism 美學，夜晚冷光調

**存放路徑**：
```
assets/characters/<character-id>/concept/
```

**注意**：概念圖不進 runtime，只作為設計參考。

---

## 二、圖鑑圖 / 立繪

**目的**：UI 面板中的角色圖像（角色 modal、HUD 頭像）。

**工具**：ChatGPT image generation

**規格**：
- 尺寸：256×256 或 512×512
- 格式：PNG，透明背景
- 風格：角色正面或 3/4 側面，情緒自然

**存放路徑**：
```
assets/characters/<character-id>/portrait/
```

---

## 三、Companion frame 規格

**目的**：sprite sheet 的單格來源。

**當前 root 主版本規格**：

| 尺寸 | 用途 |
|------|------|
| 512×512 px | 新 companion master frame 標準 |
| downscaled export | runtime 可用的效能輸出，不代表 master 降級 |
| 443/444 px | `greyshade-cat` legacy accepted，只能保留，不可 upscale |
| 64 PPU / 96px / pixel-style sheets | design reference / art canon，不是新 companion runtime 標準 |

**工具**：ChatGPT image generation / Gemini / Grok

**技術要求**：
- 透明背景（alpha channel）
- illustrated / painterly / high-detail 繪製
- 不可包含白底、UI、文字、場景、展示台、圖鑑框
- 角色底部 baseline 必須對齊到同一水平線（所有幀的腳底位置一致）
- companion anchor = bottom-center（概念上 `x: 0.5, y: 1`）
- 允許 illustrated anti-aliasing；不得套用 legacy pixel-art 的 no anti-aliasing 規則

---

## 四、Sprite Sheet 規格

**目的**：PixiJS `PIXI.Assets.load()` 載入的動畫 spritesheet。

### 命名規則

```
<character-id>_<animation-name>_<width>x<height>_<frame-count>f.png

範例：
new-companion_idle_calm_512x512_8f.png   （新 companion master sheet）
new-companion_idle_calm_256x256_8f.png   （downscaled runtime export）
greyshade-cat_idle_calm_443x443_8f.png   （legacy accepted 範例，不可 upscale）
```

### Sprite Sheet 排列

- 所有幀橫向排列（單行）
- 每幀寬高一致
- 幀數由檔名的 `<N>f` 表示
- 任一 sheet edge 必須 `<= 4096 px`
- frame grid 必須整除：`sheet_width / cols` 與 `sheet_height / rows` 都必須是整數
- runtime scale 必須以 `frameHeight` 計算，不可用整張 `sheetHeight`

### 目前動畫集（greyshade-cat）

以下為 `greyshade-cat` legacy runtime 動畫集。它是 P1 主線唯一 active companion，但其現有 443/444 frame 屬 legacy accepted，不可 upscale 到 512，也不可用來推導新 companion 的 64×64 / nearest-neighbor 標準。

**emotion/**
- `idle_calm` (8f)、`idle_happy` (8f)、`idle_angry` (6f)
- `idle_sad` (6f)、`idle_sick` (8f)、`idle_defensive` (8f)
- `idle_distant` (8f)、`idle_enjoy` (8f)、`blink` (3f)

**movement/**
- `right_walk` (8f)、`left_walk` (8f)
- `sit` (6f)、`sleep` (8f)

**special/**
- `idle_dance` (8f)、`idle_wake` (8f)、`idle_wash` (8f)
- `special_angry` (6f)、`special_sad` (6f)
- `special_wake` (8f)、`special_wash` (8f)
- `special_dance` (8f)、`special_left_walk` (8f)

**touch/**
- `touch_accept` (6f)、`touch_guarded` (6f)、`touch_reject` (6f)、`hug` (6f)

**battle/**
- `attack_basic` (6f)、`defend` (6f)、`hit` (4f)

---

## 五、Transparent PNG 處理

**要求**：
- 所有 sprite sheet 必須有透明背景
- 禁止白色或純色背景
- 禁止把 UI、文字、場景、展示台、圖鑑框 baked into frame
- 舊設計圖只能作為 reference / art canon；若要 runtime 化，必須重新輸出 clean `512×512` transparent companion frame
- 既有 greyshade-cat 離線處理工具屬 legacy 專用，不代表新 companion 要走 64×64 / nearest-neighbor 管線

---

## 六、Baseline 對齊

**要求**：
- 每個動畫的所有幀，角色底部腳點必須在同一 Y 座標
- 不對齊會導致角色在動畫播放時上下跳動
- companion anchor = bottom-center（概念上 `x: 0.5, y: 1`）
- final on-screen position snap 必須保留，避免動畫切換時腳底滑動
- 驗證方式：在 Aseprite 或 Photoshop 中用參考線逐幀確認

---

## 七、Texture sampling 與縮放

**要求**：
- 新 illustrated companion runtime 應使用 linear sampling + mipmaps。
- 清晰度來自 512 高解析母版縮小顯示，不靠 nearest-neighbor 製造 pixel-perfect 銳利感。
- `scaleMode = 'nearest'` 僅可保留在 legacy pixel-art / historical / greyshade-cat 專用語境，不是新 companion 標準。
- Runtime 可以使用 downscaled export，不代表所有動畫永遠都要全載 512。
- 必須控制同時載入的 sheet 數量，避免 mobile GPU memory 壓力。

---

## 八、assets/characters/ 目錄結構

```
assets/characters/<character-id>/
├── concept/                   （概念圖，非 runtime）
├── portrait/                  （圖鑑立繪，UI 用）
├── spritesheets/
│   ├── emotion/               （情緒 idle 動畫 spritesheet）
│   ├── movement/              （移動動畫 spritesheet）
│   ├── special/               （特殊動畫 spritesheet）
│   ├── touch/                 （觸碰互動動畫 spritesheet）
│   └── battle/                （戰鬥動畫 spritesheet）
├── frames/                    （個別 frame PNG，生成 spritesheet 的原始素材）
│   ├── emotion/
│   ├── movement/
│   ├── special/
│   ├── touch/
│   └── battle/
├── metadata/
│   ├── animations.json        （動畫 metadata，PixiJS loader 設定來源）
│   └── previews/              （預覽圖，非 runtime）
├── inbox/                     （原始素材 inbox，非 runtime）
└── inbox_manual_transparent/  （透明化處理後的素材，非 runtime）
```

---

## 九、animations.json 格式

```json
{
  "character": "new-companion",
  "frameSize": 512,
  "animations": {
    "idle_calm": {
      "sheet": "assets/characters/new-companion/spritesheets/emotion/new-companion_idle_calm_512x512_8f.png",
      "frames": 8,
      "frameWidth": 512,
      "frameHeight": 512,
      "fps": 8,
      "loop": true
    }
  }
}
```

**更新規則**：
- 新增動畫時同步更新 `animations.json`
- 同步確認 `src/data/assetManifest.js` 中的路徑
- 禁止修改現有 key 名稱（sprite loader 依賴這些 key）
- metadata 的 scale / fit 計算必須使用 `frameHeight`，不可使用整張 `sheetHeight`
- 新 companion metadata 不得把 `frameSize: 64` 當預設；64/96 類數值只可出現在 legacy/reference 註記

---

## 十、AI 分工

| AI | 職責 |
|----|------|
| **ChatGPT image generation** | 概念圖、立繪、illustrated 512×512 frame / sheet 初稿生成 |
| **Gemini** | 視覺審查（看圖比較、確認 baseline 對齊、色彩一致性） |
| **Grok** | ChatGPT / Gemini 沒有額度時的備援生成 |
| **Codex / Claude Code** | Character Lock Spec、prompt / action config、validation、QC report、preview、metadata 更新 |
| **Human** | 核准 lock spec、最終視覺確認、approving assets 進入 runtime |

---

## 十一、Spine 動畫說明

- **Spine** 是骨骼動畫工具，可以實現更流暢的角色動畫。
- 目前 **MVP 主線不使用 Spine**，所有動畫使用 spritesheet。
- Spine 只作為**後期高階角色動畫**的選項，在 MVP 完成後再評估引入。
- 引入 Spine 需要 PixiJS Spine 插件，屆時會大幅修改 spriteSheetAnimationLoader，需要 human 明確授權。

---

## 十二、角色狀態三層分類

### Tier 1 — Active Runtime Companion

| Character ID | 名稱 | 狀態 | 說明 |
|-------------|------|------|------|
| `greyshade-cat` | 灰影貓 | ✅ 已實作 | 完整 spritesheet + animations.json，P1 主線唯一角色 |

P1 開發主線以灰影貓與第一棲地為主，不擴張多角色系統。

---

### Tier 2 — Registered Legacy / Fallback Creature

| Character ID | 名稱 | 狀態 | 說明 |
|-------------|------|------|------|
| `flametail-fox` | 焰尾狐 | ⚠️ fallback image only | `data/creatures.json` 已登錄，只有靜態圖，無 spritesheet |

焰尾狐為 **legacy/fallback registered creature**。未獲 human 明確指示，不可啟動完整 asset pipeline，不可視為下一個優先角色。

---

### Tier 3 — Roadmap Companion Candidates（尚未接入 runtime）

| Character ID | 名稱 | 狀態 | 說明 |
|-------------|------|------|------|
| `thunder-pup` | 雷霆幼狼 | 📋 roadmap candidate | 尚未接入 runtime，無任何 assets，不可加入 creatures.json |
| `star-energy-boarlet` | 星能小山豬 | 📋 roadmap candidate | 尚未接入 runtime，無任何 assets，不可加入 creatures.json |

Roadmap candidates 不是 runtime creature。不可因此啟動多角色隊伍系統或任何 asset pipeline，需正式任務授權才可推進。
