# R2_CODEX_UI_REFERENCE.md — Nexus Link R2 圖鑑 / 進化頁 UI 參考

> 來源：R2 Master Handoff v1.0 第 22 節 + r2/assets/reference/codex-ui/ 與 evolution-lines/ 內圖片。
> 原則：Codex UI 必須用 HTML/CSS/DOM 重建，不可直接貼 reference image。

---

## 核心 UI 元素（必須包含）

- **五階段橫向進化 layout**
  - 幼年期（BABY）→ 成長期（CHILD）→ 成熟期（ADULT）→ 完全體（PERFECT）→ 究極體（ULTIMATE）
  - 用箭頭或漸層連接
  - 每格顯示角色立繪 + 階段標題（中英雙語）

- **雷達能力圖**
  - 六角或多軸（力量、防禦、速度、智慧、情感、治癒等）
  - 填色依角色主要情感元素 / 屬性

- **情感元素徽章**
  - 六角盾形或圓形徽章
  - 對應 7 種情感元素色 + 簡化圖示 + 文字
  - 可顯示當前共鳴程度

- **完全體 / 究極體展示框**
  - 加大尺寸 + 特效外框（火焰、雷電、夢境粒子、虛空觸手等）
  - 專屬 lore / 數碼寶貝式介紹 block

- **中英雙語標籤**
  - 中文大標題
  - 英文小字（BABY / CHILD... 或屬性 / faction）

- **深藍 cyber UI 基調**
  - 深藍 / 黑底（#0a0f2e 類）
  - 霓虹藍 / 金 / 紫 / 紅 / 綠邊框
  - 玻璃半透明 panel + 細線條科技紋理 + 微光粒子

- **屬性色 accent**
  - 火 = 橙紅、水 = 藍、雷 = 青紫、木 = 綠、土 = 褐、暗 = 深紫紅等
  - 只用在邊框、徽章、雷達填色、重要文字

---

## 其他推薦元素

- 角色 lore 短文（象徵意義、陣營定位）
- 進化條件清單（level / bond / emotional emblem / habitat trace 等）
- 派系色邊框（Heartspark 自然金綠、Black Iron 鐵橘、Chaos Rift 紫黑 glitch）
- 小型 32x32 / 64x64 icon 對照（來自 pixel-asset-specs/ 概念）

---

## 嚴格禁止事項

- 不可直接把 reference image（尤其是 5 階段並列 codex 圖）當作 UI 背景或元件貼上。
- 不可在 sprite / UI 貼圖內 baked 文字（所有標籤必須 DOM / CSS 控制）。
- 不可退化成普通 RPG 圖鑑（木質/紙張風、過多裝飾花紋）。
- 不可退化成療癒 App 清新卡片風（粉彩、雲朵、無科技感）。
- 不可忽略 9:16 與主畫面 Cyber-Taoism 基調的一致性。

---

## 與 reference 的正確關係

- r2/assets/reference/codex-ui/ 與 evolution-lines/*/ 內的圖片是 **UI Style Reference + 角色進化線參考**。
- 它們定義了「應該長什麼樣子」與「應該有哪些資訊區塊」。
- 實際實作必須用 HTML + CSS + 少量 Pixi（角色立繪）重建，並遵守 R2_ASSET_PIPELINE_SPEC.md 的 transparent / pixel perfect 規則。

---

## 與其他文件的關係

- 視覺語言細節 → R2_VISUAL_BIBLE.md
- 角色與進化資料來源 → R2_CANON_REGISTRY.md + R2_COMPANION_BIBLE.md + R2_EVOLUTION_SYSTEM.md
- 情感徽章呈現 → R2_EMOTIONAL_ELEMENT_SYSTEM.md
- 資產生產規則 → R2_ASSET_PIPELINE_SPEC.md + R2_REFERENCE_ASSET_INDEX.md

---

*Codex 是玩家理解夥伴與世界觀的最重要窗口，必須同時美觀、資訊清晰、且完全符合 R2 的 Cyber-Taoism 靈魂。*
