# R2_REFERENCE_ASSET_INDEX.md — Nexus Link R2 Reference Image Catalog

> **目的**：整理 r2/assets/reference/_inbox/（原 inbox/）中約 60 張 reference / concept / design bible 圖片，依照用途分類至 r2/assets/reference/** 子資料夾。
> 所有圖片**皆為 reference 性質，絕不可直接作為 runtime asset**。
> 本文件為 machine-readable + human 導覽索引，供後續 Fable 5 / asset pipeline 使用。

**生成日期**：2026（本任務）
**來源**：r2/assets/reference/_inbox/（內含 UUID.PNG + IMG_*.PNG + 少量 jpg）
**分類原則**：嚴格依 query 規則（visual-north-star、codex-ui、evolution-lines/*、faction-style/*、emotional-emblems、pixel-asset-specs、home-ui、uncategorized）。
**禁止**：壓縮、改尺寸、重繪、轉檔、直接引入 r2/src/** 或 r2/data/** 或 asset manifest。

---

## 統計摘要

- 總處理圖片數：60 張（PNG/JPG）
- _inbox 殘留（非圖片）：Nexus link.zip + 1 支 MP4（保留作為未來 inbox 參考）
- 主要分類：
  - visual-north-star/: 6
  - home-ui/: 1
  - codex-ui/: 1（代表性 UI layout + spec 混合）
  - evolution-lines/companion/: 14（焰尾狐、星焰雞、水晶海馬、青葉麋鹿、雷霆系列、月光兔、星能小山豬等）
  - evolution-lines/boss/: 9（血紅領主、虛土領主、夢行領主、漩渦領主、深淵獅帝、麒多等）
  - evolution-lines/faction/: 1（心輝議會守護者）
  - faction-style/heartspark-council/: 1
  - faction-style/black-iron-hackers/: 3（腐化綠焰狐 + 黑鐵相關）
  - faction-style/chaos-rift/: 1（夢行領主混沌版）
  - emotional-emblems/: 1
  - pixel-asset-specs/: 5（含明確 32x32/64x64/96x96、PPU、prompt、transparent PNG 規格者）
  - uncategorized/: 20（未充分檢視或邊緣案例，保留原始命名加 uncat- 前綴，待後續人工 review）

**所有圖片「是否可直接 runtime」預設：No**。

---

## 詳細索引（按新路徑）

### visual-north-star/（R2 主畫面目標圖）

- **visual-north-star/home-greyshade-cat-night-lake-hud-soultalk-nav.png**
  - 原始大意：夜湖棲地 + 灰影貓中央 + 營火 + 月光 + 魔法陣 + HUD 狀態 + Soul Talk 面板 + Bottom Nav（探索/照顧/成長/記憶）
  - 分類：visual-north-star
  - 用途：R2 主畫面視覺北極星、9:16 手機直式構圖參考
  - Canon?：Strong Reference（灰影貓 + 第一棲地為 P1/R2 主線）
  - Reference only?：Yes
  - 可直接 runtime：No
  - 若要變 runtime 條件：需轉為 transparent PNG + fixed frame cell + sprite sheet + animations.json + bottom-center baseline + nearest-neighbor 設定，獨立於此 reference

- **visual-north-star/home-greyshade-cat-night-lake-soultalk-bottomnav.png**
  - 原始大意：類似主畫面，月光更亮、棲地氛圍、Soul Talk 開啟狀態、底部導航高亮
  - 分類：visual-north-star
  - 用途：主畫面構圖、氛圍、光影、UI 玻璃感 / cyber 疊加參考
  - Canon?：Strong Reference
  - Reference only?：Yes
  - 可直接 runtime：No
  - 條件：同上 + 需與 r2/src/pixi/habitatTraceRenderer 等對齊

- **visual-north-star/magic-circle-taiji-platform-glowing-runes.png**
  - 原始大意：陰陽太極魔法陣石台、發光符文、粒子
  - 分類：visual-north-star / emotional-emblems（陰陽・太極）
  - 用途：主畫面魔法陣 / 平台 / 情感符號系統
  - Canon?：Strong Reference（情感元素 + 棲地）
  - Reference only?：Yes
  - 可直接 runtime：No
  - 條件：pixel perfect 抽離 + 作為 platformRenderer 素材

- **visual-north-star/prop-campfire-stone-circle-pixel.png**
  - 原始大意：石圍營火、火焰、火星（像素風）
  - 分類：visual-north-star
  - 用途：主畫面營火 prop、粒子參考
  - Canon?：Strong Reference
  - Reference only?：Yes
  - 可直接 runtime：No
  - 條件：需做成 sprite sheet 含 idle / flicker 動畫

- **visual-north-star/prop-blue-crystal-gem-emblem.png** (及 dup)
  - 原始大意：藍色發光晶體 + 金屬底座（Nexus Core / 晶體象徵）
  - 分類：visual-north-star
  - 用途：主畫面晶體、HUD 元素、情感共鳴符號
  - Canon?：Strong Reference
  - Reference only?：Yes
  - 可直接 runtime：No
  - 條件：透明 PNG + 多幀動畫

- **visual-north-star/habitat-landscape-day-lake-mountains-path.png** （移至 uncategorized 較安全，但視為棲地概念）
  - 原始大意：藍天白雲、山湖、石板路、發光結晶塔、碼頭（非夜湖）
  - 分類：uncategorized（或 visual-north-star 棲地擴展）
  - 用途：第二棲地或白日概念
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

### home-ui/

- **home-ui/home-screen-9-16-mockup-annotated-hud-nav.png**
  - 原始大意：手機直式 mockup + 詳細標註（頂部 HUD、核心資訊卡、右上快捷、側邊功能入口、底部主導航、Soul Talk 浮動面板、互動狀態示例）
  - 分類：home-ui / visual-north-star
  - 用途：R2 主畫面 UI 結構、layout、responsive 9:16 規範、玻璃 cyber 風格
  - Canon?：UI Golden Reference
  - Reference only?：Yes
  - 可直接 runtime：No
  - 條件：需拆解為 DOM (r2/index.html + styles.css) + Pixi 層，嚴禁直接貼圖

### codex-ui/

- **codex-ui/flametail-fox-evolution-codex-ui-layout-32x64-spec.png**
  - 原始大意：焰尾狐橫向 4 階段進化（焰尾狐 → 焰炎狐 → 烈焰狐王 → 永焰狐皇）、32x32 / 64x64 小圖預覽、屬性標籤、進化條件說明
  - 分類：codex-ui / pixel-asset-specs / evolution-lines/companion
  - 用途：圖鑑 UI 橫向 layout、中英/屬性色 accent、像素尺寸規範參考
  - Canon?：Strong Reference（焰尾狐已在 creatures.json 為 legacy）
  - Reference only?：Yes
  - 可直接 runtime：No
  - 條件：需配合 r2/src/data/ 與圖鑑 UI 實作（目前 R2 無完整 codex 頁）

### evolution-lines/companion/

（玩家可培養夥伴進化線，含 焰尾狐、星焰雞、水晶海馬、青葉麋鹿、雷霆幼狼/戰狼、月光兔、影貓相關、星能小山豬等）

- evolution-lines/companion/flametail-fox-... （見 codex-ui 代表）
- evolution-lines/companion/starflame-chicken-phoenix-5stage-codex.png (及 v2)
  - 原始大意：星焰雞 5 階段（幼年期 BABY → 究極體 ULTIMATE）、情感元素徽章、雷達圖、深藍 cyber UI + 火屬性 accent、完全體特效展示
  - 分類：evolution-lines/companion / codex-ui
  - 用途：星焰雞進化線 + codex 頁 UI 範例
  - Canon?：Experimental（未登錄 creatures.json）
  - Reference only?：Yes
  - 可直接 runtime：No
  - 條件：需先加入 data/creatures.json + 完整 sprite pipeline + animations

- evolution-lines/companion/crystal-seahorse-to-dragon-4stage-evo.png
  - 原始大意：水晶海馬 → 藍水晶龍 4 階段（明確列於 query）
  - 分類：evolution-lines/companion
  - 用途：水晶海馬進化線
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

- evolution-lines/companion/verdant-stag-qingye-milu-4stage-evo-green.png
  - 原始大意：青葉麋鹿 → 蒼林麋皇 → 風暴麋將 → 聖林麋神（明確列於 query）
  - 分類：evolution-lines/companion
  - 用途：青葉麋鹿進化線
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

- evolution-lines/companion/moonlight-rabbit-5stage-codex-purple-moon.png
  - 原始大意：月光兔 5 階段、月光/星光、守護者定位
  - 分類：evolution-lines/companion
  - 用途：月光兔進化線（query 明確提及）
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

- evolution-lines/companion/thunder-battle-wolf-5stage-codex.png (及 alt、tenrou-raikou 版)
  - 原始大意：雷霆幼狼 / 雷霆戰狼 / 雷霆霸狼 / 天狼雷皇 系列，5 階段或 4 階段、雷電屬性、裝甲/武器進化
  - 分類：evolution-lines/companion
  - 用途：雷霆系列進化線（query 明確）
  - Canon?：Experimental（AGENTS.md 中為 roadmap candidate）
  - Reference only?：Yes
  - 可直接 runtime：No

- evolution-lines/companion/star-energy-boarlet-*.png (多組 3pose / 8pose / expression)
  - 原始大意：星能小山豬（或類 boarlet）多表情、多角度像素概念（非 5 階段 codex）
  - 分類：evolution-lines/companion
  - 用途：其他適合玩家培養的夥伴（query 允許「其他明顯適合」）
  - Canon?：Experimental（AGENTS.md Tier 3）
  - Reference only?：Yes
  - 可直接 runtime：No

- evolution-lines/companion/thunder-pup-lightning-wolf-8pose-transparent.png
  - 原始大意：雷霆幼狼 / 黑紫雷電狼 8 種姿態，透明背景
  - 分類：evolution-lines/companion
  - 用途：雷霆系列 sprite 概念 / 透明 PNG 範例
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

### evolution-lines/boss/

（Boss / 敵對 / 裂隙進化線：深淵獅帝、虛土領主、血紅領主、夢行領主、漩渦領主等）

- evolution-lines/boss/blood-red-lord-moth-5stage-codex.png (及 dup)
  - 原始大意：血紅領主 5 階段（幼年期眼球 → 究極體巨型紅蛾）、紅黑混沌風格、戰鬥型
  - 分類：evolution-lines/boss
  - 用途：血紅領主進化線
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

- evolution-lines/boss/void-soil-lord-tentacle-5stage-codex.png (及 dup)
  - 原始大意：虛土領主 5 階段（眼球肉塊 → 冠王觸手怪）、土/虛空
  - 分類：evolution-lines/boss
  - 用途：虛土領主（query 明確）
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

- evolution-lines/boss/dream-walker-lord-butterfly-5stage-codex.png (及 dup 部分移至 chaos)
  - 原始大意：夢行領主 5 階段（藍紫蝶/蛾）、夢境/虛空/心理操控
  - 分類：evolution-lines/boss
  - 用途：夢行領主（query 明確）
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

- evolution-lines/boss/vortex-lord-squid-5stage-codex.png
  - 原始大意：漩渦領主 5 階段（金色章魚/漩渦怪）、混沌
  - 分類：evolution-lines/boss
  - 用途：漩渦領主（query 明確）
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

- evolution-lines/boss/qiduo-lion-5stage-codex-purple.png
  - 原始大意：麒多（或類獅帝）5 階段、紫雷/暗雷、領袖型
  - 分類：evolution-lines/boss
  - 用途：Boss 型領主進化線
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

- evolution-lines/boss/abyssal-lion-emperor-4stage-32x64-spec-blackiron.png
  - 原始大意：深淵獅帝 4 階段（浪花幼獅 → 深淵獅帝）、32x32/64x64 icon、黑鐵駭客標記、水+暗屬性
  - 分類：evolution-lines/boss / faction-style/black-iron-hackers
  - 用途：深淵獅帝（query 明確 Boss）+ 黑鐵 faction 視覺
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

### evolution-lines/faction/

- evolution-lines/faction/heartspark-council-5-guardians-faction-identity.png
  - 原始大意：HEARTSPARK COUNCIL GUARDIANS 五屬守護者（ThunderPup 雷、IceTalon 水晶冰狼、FlameFlicker 火狐、StoneShard 土熊、VineTwist 木鹿）、每隻 3 視圖（正/側/背）、石台、64 PPU 風格
  - 分類：evolution-lines/faction / faction-style/heartspark-council
  - 用途：心輝議會 faction identity、五屬守護者進化/設定圖
  - Canon?：Strong Reference（faction 核心）
  - Reference only?：Yes
  - 可直接 runtime：No
  - 條件：需為每隻守護者建立獨立 sprite + metadata

### faction-style/

#### heartspark-council/
（自然、守護、柔和、生命、光、元素共鳴）

- faction-style/heartspark-council/heartspark-council-5-guardians-... （已移至 evolution-lines/faction 作為主要，此處保留分類標記；實際檔案位於 evolution-lines/faction/）

#### black-iron-hackers/
（金屬、機械、工業、侵核、資料污染、秩序/駭入）

- faction-style/black-iron-hackers/corrupted-greenflame-fox-*.png (armored / robed / walking)
  - 原始大意：綠焰電路腐化狐（黑鐵/侵核風格、霓虹綠 + 黑甲）
  - 分類：faction-style/black-iron-hackers
  - 用途：黑鐵駭客高階角色 / 混沌狐概念
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

- faction-style/black-iron-hackers/ 相關已併入 pixel-asset-specs 的 96x96 黑鐵哥吉拉龍

#### chaos-rift/
（虛空、錯誤記憶、恐懼、裂隙、混沌、心理 glitch）

- faction-style/chaos-rift/dream-walker-lord-chaos-butterfly-codex.png
  - 原始大意：夢行領主（紫藍虛空蝶、心理/夢魘 glitch 感）
  - 分類：faction-style/chaos-rift / evolution-lines/boss
  - 用途：混沌裂隙 / 心理領主視覺語言
  - Canon?：Experimental
  - Reference only?：Yes
  - 可直接 runtime：No

### emotional-emblems/

- emotional-emblems/seven-emotional-emblems-love-brave-faith-harmony-wisdom-memory-yinyang-plus-flametail-evo.png
  - 原始大意：七情感元素徽章（愛・赤心、勇・炎志、信・金剛、和・青木、智・玄水、憶・幽影、陰陽・太極） + 焰尾狐 5 階段進化
  - 分類：emotional-emblems / evolution-lines/companion
  - 用途：情感符號系統 + 徽章設計語言（query 明確 7 種）
  - Canon?：Strong Reference（核心情感機制）
  - Reference only?：Yes
  - 可直接 runtime：No
  - 條件：需抽離為獨立 UI icon / badge 資產 + 對應 emotionDictionary

### pixel-asset-specs/

（明確描述像素尺寸、transparent PNG、sprite 規格、prompt 規格的圖）

- pixel-asset-specs/flametail-fox-evolution-codex-ui-layout-32x64-spec.png （見 codex-ui）
- pixel-asset-specs/black-iron-hackers-godzilla-dragon-96x96-4stage-pixel-perfect-prompt-spec.png
  - 原始大意：黑鐵駭客（哥吉拉×賽博魔龍）4 階段、96x96px、透明背景 PNG、Pixel Perfect、16-bit 風格、每階段詳細單體 prompt、共用規格（sharp edges、no anti-aliasing、Unity Sprite / 角色圖鑑用途）
  - 分類：pixel-asset-specs / faction-style/black-iron-hackers
  - 用途：**最佳 pixel asset spec 範例**（尺寸、prompt engineering、pipeline 規格）
  - Canon?：Asset Spec Reference
  - Reference only?：Yes
  - 可直接 runtime：No
  - 條件：完全符合「96x96 透明 PNG + nearest + no blur + animation metadata」

- pixel-asset-specs/thunderpup-64ppu-3view-specs-color-palette.png (及 wolf variant)
  - 原始大意：ThunderPup / 雷鳴幼狼 64 PPU 規格、front/side/back、正側背視圖、色票、設計重點（低頻率與環境同步、PPU 參考）
  - 分類：pixel-asset-specs / evolution-lines/companion
  - 用途：64x64 / 64 PPU 角色規格 + 視角參考
  - Canon?：Asset Spec Reference
  - Reference only?：Yes
  - 可直接 runtime：No

- pixel-asset-specs/greyshade-cat-simple-pixel-sprite.png
  - 原始大意：簡單灰影貓像素立繪（早期 sprite 概念）
  - 分類：pixel-asset-specs
  - 用途：pixel perfect 基礎、透明/輪廓範例
  - Canon?：Asset Spec Reference（灰影貓為 Tier 1 runtime）
  - Reference only?：Yes
  - 可直接 runtime：No（已有完整 greyshade-cat spritesheets）

- pixel-asset-specs/thunder-pup-lightning-wolf-8pose-transparent.png （見 companion）

### uncategorized/

19 張 + 1 景觀：
- uncat-*.PNG / uncat-IMG_1259.jpg （原始 UUID 或 IMG 名稱保留）
- 內容多為未檢視的 codex 變體、重複、邊緣概念或 prompt 草稿
- 狀態：待人工 review 後重新分類
- 規則：**不可猜測為 runtime**，保持 reference 性質

---

## 通用規則（所有條目適用）

- **是否可作為 Canon**：僅 greyshade-cat + 當前棲地 + 情感元素徽章系統 + 心輝議會概念 為 Strong Reference；其餘多為 Experimental / UI Style / Asset Spec。
- **是否只是 reference**：全部 Yes（本任務核心）。
- **是否可直接 runtime**：**全部 No**。
- **若要變 runtime asset 需要什麼條件**（通用）：
  1. 輸出獨立 transparent PNG（無 baked text、無 checkerboard、無 UI 疊加）。
  2. 固定 frame cell（32x32 / 64x64 / 96x96 等）。
  3. 產生 sprite sheet（movement / emotion / battle / special / touch 等資料夾）。
  4. 產生 animations.json（frame 定義、loop 類型、baseline）。
  5. bottom-center baseline + Math.round() integer snap。
  6. texture.source.scaleMode = 'nearest'。
  7. 通過 validator（無 blur、對齊、尺寸正確）。
  8. 先更新 r2/data/creatures.json（若為新角色）。
  9. 先在 r2/docs/ 留下 asset request 記錄。
  10. 不可直接把 reference 圖片複製進 characters/xxx/frames/ 或 spritesheets/。

**下一次 inbox 整理時，建議先閱讀本文件 + R2_ASSET_PIPELINE_SPEC.md + R2_FABLE5_VISUAL_HANDOFF.md。**

---
*本文件僅供 R2 內部參考，嚴禁直接用於 R1 或 runtime 載入。*
