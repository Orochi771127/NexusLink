# CHARACTER_ASSET_PIPELINE.md — Nexus Link 心核夥伴角色資產管線

> 本文件定義心核夥伴從概念到 runtime 的完整資產流程。  
> 目前主要角色：**灰影貓（greyshade-cat）**

---

## 核心規則（必讀）

> ⚠️ **不可直接把漂亮圖丟進 runtime。**  
> 無論圖片多漂亮，未通過完整 pipeline 的資產不得進入 `assets/characters/<id>/spritesheets/`。

進入 runtime 的 spritesheet 必須符合所有條件：
- 透明背景（alpha channel，無白色或純色底）
- 固定 frame size（所有幀寬高一致）
- bottom-center baseline 對齊（所有幀的角色腳底在同一 Y 座標）
- nearest-neighbor 友好（像素邊緣清晰，無抗鋸齒模糊）
- 檔名符合命名規則
- `animations.json` 已更新
- human 已確認視覺品質

**必須先有 approved seed frame。**  
在生成完整動畫序列前，需先產出單一 seed frame，經 Gemini review 和 human 確認後，才可展開其餘幀的生成。未 approved 的 seed frame 不得進入 spritesheets 目錄。

---

## 資產管線概覽

```
概念圖 (ChatGPT image gen)
  ↓
圖鑑圖 / 立繪 (ChatGPT image gen)
  ↓
Gemini review（視覺審查）
  ↓
human 確認
  ↓
Approved seed frame（單幀確認）← 必須先通過此步驟
  ↓
64×64 / 128×128 像素動畫幀序列（ChatGPT / Gemini / Grok 協作）
  ↓
sprite sheet（逐格橫向排列，fixed frame size）
  ↓
transparent PNG 處理 + bottom-center baseline 對齊驗證
  ↓
human 視覺確認
  ↓
assets/characters/<character-id>/spritesheets/ 存入
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
- 風格：Pixel art 風格，Cyber-Taoism 美學，夜晚冷光調

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

## 三、像素資產規格

**目的**：sprite sheet 的單格來源。

**尺寸選項**：

| 尺寸 | 用途 |
|------|------|
| 64×64 px | 標準 runtime sprite（主要） |
| 128×128 px | 高解析度版本（視裝置縮放使用） |
| 96×96 px | 備選尺寸（視設計需求） |

**工具**：ChatGPT image generation / Gemini / Grok

**技術要求**：
- 透明背景（alpha channel）
- 像素風格 pixel art 繪製
- 角色底部 baseline 必須對齊到同一水平線（所有幀的腳底位置一致）
- 禁止抗鋸齒（no anti-aliasing on edges）

---

## 四、Sprite Sheet 規格

**目的**：PixiJS `PIXI.Assets.load()` 載入的動畫 spritesheet。

### 命名規則

```
<character-id>_<animation-name>_<width>x<height>_<frame-count>f.png

範例：
greyshade-cat_idle_calm_64x64_8f.png    （8 幀，64×64）
greyshade-cat_idle_calm_128x128_8f.png  （8 幀，128×128）
greyshade-cat_attack_basic_64x64_6f.png （6 幀，64×64）
```

### Sprite Sheet 排列

- 所有幀橫向排列（單行）
- 每幀寬高一致
- 幀數由檔名的 `<N>f` 表示

### 目前動畫集（greyshade-cat）

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
- 使用工具：`tools/process_greyshade_cat_manual_transparent_128.py`（離線處理）
- 處理後存入 `inbox_manual_transparent/`，再由 pipeline 生成 spritesheet

---

## 六、Baseline 對齊

**要求**：
- 每個動畫的所有幀，角色底部腳點必須在同一 Y 座標
- 不對齊會導致角色在動畫播放時上下跳動
- 驗證方式：在 Aseprite 或 Photoshop 中用參考線逐幀確認

---

## 七、Nearest-Neighbor 渲染

**要求**：
- PixiJS 載入 sprite texture 時必須設定：
  ```js
  texture.source.scaleMode = 'nearest'
  ```
- 禁止 linear 插值，會導致像素邊緣模糊
- 目前由 `src/pixi/spriteSheetAnimationLoader.js` 負責設定

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
  "character": "greyshade-cat",
  "frameSize": 64,
  "animations": {
    "idle_calm": {
      "sheet": "assets/characters/greyshade-cat/spritesheets/emotion/greyshade-cat_idle_calm_64x64_8f.png",
      "frames": 8,
      "frameWidth": 64,
      "frameHeight": 64,
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

---

## 十、AI 分工

| AI | 職責 |
|----|------|
| **ChatGPT image generation** | 概念圖、立繪、像素 sprite 初稿生成 |
| **Gemini** | 視覺審查（看圖比較、確認 baseline 對齊、色彩一致性） |
| **Grok** | ChatGPT / Gemini 沒有額度時的備援生成 |
| **Claude Code** | animations.json 更新、assetManifest.js 更新、pipeline 工具 |
| **Human** | 最終視覺確認、approving assets 進入 runtime |

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
