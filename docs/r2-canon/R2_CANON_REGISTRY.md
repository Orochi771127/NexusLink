# R2_CANON_REGISTRY.md — Nexus Link R2 角色與進化線層級登錄

> 依據 R2_REFERENCE_ASSET_INDEX.md 與 inbox 整理結果，定義角色 / 進化線的 Canon 強度。
> 僅供設計與 asset pipeline 參考，**不等於 runtime 實際登錄**（runtime 仍以 r2/data/creatures.json + greyshade-cat 完整 spritesheet 為準）。

**層級定義**：
- **Canon**：已正式進入 R2 主線（creatures.json + 完整 runtime 資產 + 長期維護）。
- **Strong Reference**：核心視覺/機制聖經，強烈建議後續對齊，但尚未 runtime。
- **Experimental**：概念驗證 / 進化線草稿，未來可能升級或捨棄。
- **UI Style Reference**：純 UI / 圖鑑 / HUD 風格參考（非角色本身）。
- **Asset Spec Reference**：像素尺寸、prompt、sprite 管線規格來源（非角色本身）。

---

## Canon（目前僅 2 項，R2 主線）

| 中文名 | 英文名 | faction | element | role | status | notes |
|--------|--------|---------|---------|------|--------|-------|
| 灰影貓 | greyshade-cat | Neutral / Nexus Core | neutral | Active Runtime Companion (Tier 1) | Canon | R2 唯一完整 spritesheet + animations.json + 夜湖棲地主體。P1/R2 主線鐵律。 |
| 焰尾狐 | flametail-fox | 火 / 傳承 | fire | Registered Legacy / Fallback Creature (Tier 2) | Canon (legacy) | 已登錄 creatures.json，僅靜態圖，**不可升級為多角色**。 |

---

## Strong Reference（核心視覺聖經）

| 中文名 | 英文名 | faction | element | role | status | notes |
|--------|--------|---------|---------|------|--------|-------|
| 心輝議會五屬守護者 | Heartspark Council Guardians (ThunderPup, IceTalon, FlameFlicker, StoneShard, VineTwist) | Heartspark Council | 雷/水/火/土/木 | Faction Identity / 5 Elements Guardians | Strong Reference | 52CF... 圖明確定義 5 守護者 + 3 視圖 + 元素共鳴。R2 派系視覺語言基礎。 |
| 情感元素徽章系統 | Seven Emotional Emblems (愛・赤心、勇・炎志、信・金剛、和・青木、智・玄水、憶・幽影、陰陽・太極) | Neutral / All | 對應 7 元素 | Emotion / Memory / Boundary Symbol System | Strong Reference | 27DE... 圖為符號聖經，與 emotionalSedimentationEngine / safetyShield 直接對應。 |
| 夜湖棲地 + 主畫面視覺 | Night Lake Habitat + Greyshade Cat Core Scene | Nexus Core | neutral + moonlight | Visual North Star / Home Screen | Strong Reference | 多張 home screen（1B72、5D70、431D）定義 9:16、營火、月光、魔法陣、晶體、HUD、Soul Talk、Bottom Nav。 |
| 魔法陣 / 陰陽太極平台 / 營火 / 晶體 | Magic Circle / Taiji Platform / Campfire / Blue Crystal | Neutral | light / fire / crystal | Habitat Prop / Ritual Symbol | Strong Reference | visual-north-star/ 內 props 直接影響主畫面氛圍與 ritual 感。 |

---

## Experimental（進化線概念 / 未來候選）

**companion 類（玩家可培養候選）**：

| 中文名 | 英文名 | faction | element | role | status | notes |
|--------|--------|---------|---------|------|--------|-------|
| 星焰雞 / 星焰雞皇 | Starflame Chicken / Phoenix | 火 / 星 | fire | Companion Evolution Line | Experimental | 09F2 / 28F7 兩版 5 階段 codex，火屬性、希望/燃燒意象。 |
| 水晶海馬 → 水晶龍 | Crystal Seahorse → Crystal Dragon | 水 / 晶 | water / crystal | Companion Evolution Line | Experimental | 64AD 圖明確 4 階段，query 列為 companion。 |
| 青葉麋鹿 → 聖林麋神 | Verdant Stag / Qingye Milu → Sacred Grove Stag God | 木 / 自然 | wood / life | Companion / Heartspark Guardian | Experimental | A316 圖 4 階段，query 明確「青葉麋鹿」。 |
| 雷霆幼狼 / 雷霆戰狼 / 天狼雷皇 | ThunderPup / Thunder Warwolf / Tenrou Raikou | 雷 / 風 | thunder / wind | Companion Evolution Line (Tier 3 in AGENTS) | Experimental | 多張（11A2、351B、82D3、A3D0、9FFE），64 PPU 規格 + 3 視圖 + 裝甲進化。 |
| 月光兔 | Moonlight Rabbit | 光 / 月 | light / moon | Companion Evolution Line | Experimental | 9FF1 圖 5 階段，守護/療癒意象（非醫療）。 |
| 星能小山豬（Boarlet） | Star-Energy Boarlet | 星 / 自然 | neutral / star | Companion Concept (multiple expressions) | Experimental | 多組 8pose/3pose 圖（2E78、3F41、41B3、4691、6C76），AGENTS.md Tier 3 roadmap。 |

**boss / 裂隙類**：

| 中文名 | 英文名 | faction | element | role | status | notes |
|--------|--------|---------|---------|------|--------|-------|
| 深淵獅帝 | Abyssal Lion Emperor | Black Iron Hackers / Ironflow | water + dark | Boss / Abyssal Ruler | Experimental | B3BE 圖 4 階段 + 32x64 icon + 黑鐵標記。 |
| 血紅領主 | Blood Red Lord | Chaos / Desire | fire + dark | Boss / Emotional Devourer | Experimental | 3382 / 58DA 兩版 5 階段紅蛾。 |
| 虛土領主 | Void Soil Lord | Chaos / Void | earth + void | Boss / Reality Eraser | Experimental | 606F / 6EEC 5 階段肉眼觸手。 |
| 夢行領主 | Dream Walker Lord | Chaos Rift | dark + dream | Boss / Nightmare Weaver | Experimental | 4733 / 7FC0 5 階段紫蝶（部分移至 chaos-rift 視覺）。 |
| 漩渦領主 | Vortex Lord | Chaos Rift | wind + void | Boss / Spiral Corruptor | Experimental | 9B13 5 階段金色章魚漩渦。 |
| 麒多（領主型） | Qiduo / Kirin-like Lord | Unknown / Storm | thunder + dark | Boss / Legion Leader | Experimental | 1B4D 5 階段紫雷獅。 |

**faction 代表**：

| 中文名 | 英文名 | faction | element | role | status | notes |
|--------|--------|---------|---------|------|--------|-------|
| 黑鐵駭客（哥吉拉×賽博魔龍） | Black Iron Hacker (Godzilla-Cyber Dragon) | Black Iron Hackers | metal / data | Faction Elite / Corruptor | Experimental | 623D 圖 96x96 4 階段 + 完整 prompt + pixel spec。 |
| 腐化綠焰狐（黑鐵/侵核風） | Corrupted Greenflame Fox | Black Iron Hackers / Chaos | fire + glitch | Faction Agent | Experimental | IMG_8324/5/8 三張，電路霓虹綠 + 黑甲。 |

---

## UI Style Reference

| 名稱 | 對應圖 | 用途 | status | notes |
|------|--------|------|--------|-------|
| 五階段橫向進化 + 雷達 + 徽章 codex 模板 | 多張 5 階段 codex（星焰雞、雷霆戰狼、血紅領主等） | 圖鑑頁 UI 結構、深藍 cyber、屬性色 accent、中英標籤 | UI Style Reference | 所有 codex 頁共同構成 codex-ui/ 語言，禁止直接 runtime 貼圖 |
| 9:16 主畫面 + HUD + Soul Talk + Nav 結構 | 431DA 手機 mockup + 標註 | Home UI layout 與 glassmorphism / cyber 疊加規範 | UI Style Reference | home-ui/ 核心 |
| 情感元素徽章視覺 | 27DE 七徽章 | Badge / icon 設計系統 | UI Style Reference | 同時為 Strong Reference |

---

## Asset Spec Reference（像素 / pipeline 規格來源）

| 名稱 | 對應圖 | 規格重點 | status | notes |
|------|--------|----------|--------|-------|
| 96x96 Black Iron Dragon Spec | 623D5ACE | 96x96px、transparent PNG、Pixel Perfect、16-bit、每階段 prompt、sharp edges、no anti-aliasing、Unity Sprite 用 | Asset Spec Reference | 目前 inbox 中最完整 prompt + size + pipeline 範例 |
| 64 PPU ThunderPup 3 視圖 Spec | 11A2FEE0 + 9FFE2BA8 | 64 PPU、角色尺寸 64x64、front/side/back、色票、設計重點（低頻率同步） | Asset Spec Reference | 角色建模視角與 PPU 標準 |
| 焰尾狐 32x32 / 64x64 進化尺寸 | 5C7C9580（已移 codex-ui） | 明確標註不同階段使用 32x32 / 64x64、屬性標籤 | Asset Spec Reference | 進化線尺寸遞增規範 |
| 深淵獅帝 32x32 / 64x64 icon | B3BE48C7 | 每階段立繪 + 64x64 立繪對照 | Asset Spec Reference | icon vs full body 對照 |
| 簡單灰影貓像素 sprite | IMG_0996 | 基礎像素輪廓、透明背景 | Asset Spec Reference | 早期 greyshade 原型 |

---

## 總結與禁令

- **目前 R2 唯一 Canon runtime 角色**：灰影貓（greyshade-cat）。
- 焰尾狐為 legacy，僅保留登錄地位。
- 所有其他（包含 ThunderPup、星焰雞、青葉麋鹿、心輝守護者、所有 Boss）皆為 **reference / experimental**，**不可加入 creatures.json 或 r2/src/** 除非走完整 asset request + human 批准流程。
- UI Style 與 Asset Spec 圖片**永遠不可直接當 sprite 使用**。
- 每次新角色要進入 runtime，必須先：
  1. 更新本文件（升級層級）。
  2. 產出 asset request list（見 R2_FABLE5_VISUAL_HANDOFF.md）。
  3. 完成 sprite sheet + metadata + validator。
  4. 通過 Gate 審查。

**R2 不是角色收集遊戲**。主線永遠圍繞「灰影貓 + 第一棲地 + 情感沉積 + 記憶痕跡」。

---
*與 R2_REFERENCE_ASSET_INDEX.md、R2_VISUAL_BIBLE.md、R2_ASSET_PIPELINE_SPEC.md、R2_FABLE5_VISUAL_HANDOFF.md 共同構成 R2 資產聖經。*
