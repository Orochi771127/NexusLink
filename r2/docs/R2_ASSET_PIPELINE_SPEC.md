# R2_ASSET_PIPELINE_SPEC.md — Nexus Link R2 資產管線規格

> **核心鐵律**：reference image ≠ runtime asset。
> 本文件定義「什麼是 reference」與「runtime asset 必須滿足的條件」。
> 來源：r2/assets/reference/ 整理經驗 + 歷史 P1 pipeline 原則（CHARACTER_ASSET_PIPELINE.md 等）轉譯為 R2 版。
> 適用對象：所有想把 reference 變成遊戲內可用的圖片的人（Fable 5、未來 artist、validator）。

---

## 1. Reference Image（本任務整理的全部內容）

**定義**：
- 來自 _inbox/ 的所有圖（UUID.PNG、IMG_*.PNG、少量 jpg）。
- 性質：concept art / design bible / mood board / UI mockup / evolution line showcase / pixel spec sheet / prop study。
- **永遠不是**：可直接載入的 sprite、背景、icon、UI 素材。

**特徵**（常見問題）：
- 可能包含 baked UI 文字、標註、HUD 疊加、背景、粒子特效、lore 文字框。
- 可能不是 transparent PNG（有背景或 checkerboard 預覽）。
- 可能不是固定 frame（單張大圖、5 階段並列、3 視圖並列）。
- 可能尺寸不統一、比例不合 grid。
- 可能有 anti-aliasing、blur、寫實光影、漸層。
- 可能只是 prompt 工程示意或 96x96 單張展示。

**用途**：
- 視覺語言對齊（Cyber-Taoism）。
- 角色進化線定義。
- 派系美術語言（heartspark / black-iron / chaos-rift）。
- 情感徽章系統。
- Pixel 尺寸與 pipeline 規格參考。
- 主畫面構圖與 home UI layout 參考。

**絕對禁止**：
- 直接複製進 r2/assets/characters/xxx/frames/ 或 spritesheets/。
- 直接當 img src 塞進 r2/index.html 或 UI。
- 當作 texture 餵給 Pixi（除非先轉檔 + 驗證）。

---

## 2. Runtime Asset 必須滿足的條件

只有同時滿足以下全部條件，才可視為「可進入 runtime」的資產。

### 2.1 檔案格式與透明度
- **必須是 transparent PNG**（alpha 通道正確，無背景色、無 checkerboard 殘影）。
- 單一 frame 檔案放在對應資料夾（frames/battle/、frames/emotion/ 等）。
- 不可有任何 baked 文字、HUD 元素、邊框、lore 框。

### 2.2 尺寸與 Grid
- **固定 frame cell**：32x32、64x64、96x96 等（依角色階段與用途決定，參考 pixel-asset-specs/）。
- 角色基準尺寸與 PPU 對齊（常見 64 PPU）。
- 所有 frame 必須**完全相同尺寸**，無裁切誤差。

### 2.3 Sprite Sheet 與 Animation
- 必須產生 **spritesheet**（可水平或垂直排列，或多行）。
- 必須附 **animations.json**（或等效 metadata），定義：
  - 每個動畫的名稱（idle-calm、walk-left、touch-accept、special...）。
  - frame 範圍、fps、loop 類型（loop / once / pingpong）。
  - baseline（bottom-center 錨點）。
- 常見動畫分類（來自 greyshade-cat 經驗）：
  - movement（walk left/right、idle）
  - emotion（happy、sad、angry、defensive...）
  - touch / hug / reject
  - battle / defend / hit（若未來擴張）
  - special / wake / sleep

### 2.4 定位與渲染規則（R2 鐵律，來自 R2_BLUEPRINT_ADAPTATION.md）
- **bottom-center baseline**：角色腳底置中，方便 Pixi Container 定位與對齊平台/魔法陣。
- **integer coordinate snap**：每幀 `Math.round(x)`、`Math.round(y)`，禁止浮點導致 sub-pixel 模糊。
- **nearest-neighbor**：`texture.source.scaleMode = 'nearest'`，永遠。
- **禁止 linear / bilinear / trilinear 插值**。
- **禁止 blur**（任何高斯、motion blur、軟化邊緣）。
- **object reuse**：不在 ticker 每幀 new Graphics 或 new Sprite，盡量重用。

### 2.5 無 checkerboard / 無 baked UI
- 生產過程必須使用透明背景輸出。
- 最終 sprite 內**絕不可**出現：
  - 任何文字（即使很小）。
  - HUD 元素、按鈕、面板。
  - 背景、粒子特效（粒子應由 runtime engine 產生）。
  - 陰影 / 反光若非角色本身一部分，應分離。

### 2.6 驗證流程（建議）
1. 通過 r2/tools/ 類 validator（或等效檢查：尺寸一致、透明度、baseline 對齊、無明顯 artifact）。
2. 在 r2/ 環境下手動載入測試（python -m http.server 5173 → http://localhost:5173/r2/）。
3. 與現有 greyshade-cat 並排比對 pixel 風格一致性。
4. 更新 r2/docs/ 對應 registry（R2_REFERENCE_ASSET_INDEX.md、R2_CANON_REGISTRY.md）。

---

## 3. Reference → Runtime 的正確流程（Gate）

1. **閱讀聖經**（必讀）：
   - r2/docs/R2_REFERENCE_ASSET_INDEX.md
   - r2/docs/R2_CANON_REGISTRY.md
   - r2/docs/R2_VISUAL_BIBLE.md
   - r2/docs/R2_ASSET_PIPELINE_SPEC.md（本文件）
   - r2/docs/R2_FABLE5_VISUAL_HANDOFF.md

2. **產出 Asset Request List**（見 handoff 文件）：
   - 角色/進化線名稱 + faction + element
   - 需要哪些動畫（列出完整清單）
   - 目標尺寸 / PPU
   - 參考圖路徑（reference/ 內）
   - 特殊需求（發光、粒子、特定 pose）

3. **生產**：
   - 使用 pixel art 工具 + 嚴格 nearest + 透明 PNG。
   - 拆解成 frames + 產生 spritesheet + animations.json。
   - 放進正確資料夾結構（characters/xxx/frames/...、spritesheets/...、metadata/...）。

4. **驗證 + 登錄**：
   - 通過 validator。
   - 更新 creatures.json（若新角色）。
   - 更新本 registry 與 index（把層級從 Experimental 升為 Strong Reference 或 Canon）。
   - 測試 R1 / R2 隔離。

5. **Human 確認**後才可視為「進入 runtime」。

**永遠記得**：reference 圖可能花了 10 秒 prompt 出來，runtime 資產要花 10 小時以上打磨 + 驗證。

---

## 4. 常見錯誤（來自 inbox 整理經驗）

- 把 codex 5 階段整張大圖當 sprite → 錯（有文字、有並列、有背景）。
- 把 home screen mockup 當背景 → 錯（有 HUD baked、有標註）。
- 直接用 64x64 單張當 icon → 可能 ok，但若有 glow 或外框要先裁乾淨。
- 忽略 baseline 導致角色漂浮或踩進平台。
- 使用 linear filter 導致「看起來糊」。

---

## 5. 與 P1 / 根目錄 pipeline 的關係

- R2 資產完全獨立於根目錄 assets/characters/。
- r2/assets/ 為 R2 專用複製副本。
- 任何從 R2 回移 R1 的動作，必須 human 手動 + 完整 diff 審查 + 更新兩邊文件。
- 本文件為 R2 專屬，根目錄 docs/assets/CHARACTER_ASSET_PIPELINE.md 僅供參考（路徑不同）。

---

**總結**：reference 是「為什麼長這樣」的聖經，runtime 是「實際跑得動」的工程產物。兩者之間有一道不可跨越的轉檔 + 驗證 + 審查鴻溝。

遵守本文件，即可讓 R2 視覺語言長期一致且可維護。
