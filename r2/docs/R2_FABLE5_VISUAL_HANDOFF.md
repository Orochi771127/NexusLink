# R2_FABLE5_VISUAL_HANDOFF.md — 給 Fable 5 的視覺資產交接說明

> **目的**：讓 Fable 5（或任何後續 artist / AI 產圖者）在接手 R2 視覺工作時，**第一時間知道邊界與正確流程**，避免把 reference 當 runtime 直接使用。
> 本文件必須作為「新工作起手式」的第一份必讀文件。
> 與 R2_REFERENCE_ASSET_INDEX.md、R2_VISUAL_BIBLE.md、R2_ASSET_PIPELINE_SPEC.md、R2_CANON_REGISTRY.md 共同構成四件套。

**更新日期**：本任務（inbox 整理後）
**適用**：所有想為 R2 產新圖、進化線、UI 概念、prop 的人。

---

## 1. Fable 5 必須先讀哪些文件（順序重要）

1. **r2/docs/R2_BLUEPRINT_ADAPTATION.md** + **R2_IMPLEMENTATION_GUARDRAILS.md** + **R2_SANDBOX_RULES.md**
   - 了解 R2 是獨立平行宇宙、只准動 r2/**、禁止污染 R1、Gate 流程、localStorage 隔離。
2. **r2/docs/R2_REFERENCE_ASSET_INDEX.md**
   - 目前所有 reference 圖的新路徑、原始大意、分類、用途、Canon 等級、runtime 條件。
3. **r2/docs/R2_CANON_REGISTRY.md**
   - 哪些角色是 Canon / Strong Reference / Experimental / UI Style / Asset Spec。
4. **r2/docs/R2_VISUAL_BIBLE.md**
   - 主畫面風格、codex UI、三大派系視覺語言（heartspark / black-iron / chaos-rift）、pixel art 鐵律、玻璃 cyber 規範、禁止退化成什麼。
5. **r2/docs/R2_ASSET_PIPELINE_SPEC.md**（本文件姊妹篇）
   - reference ≠ runtime 的詳細條件（transparent PNG、fixed frame、sprite sheet、animations.json、baseline、nearest-neighbor...）。
6. **本文件（R2_FABLE5_VISUAL_HANDOFF.md）**
   - 實際交接流程與紅線。

**讀完以上才能開始畫圖或 prompt**。

---

## 2. 哪些資料夾是 Reference（永遠不可直接使用）

全部位於 `r2/assets/reference/`：

- **_inbox/**：未來新丟進來的 raw reference（只有 2 個非圖片檔目前）。
- **visual-north-star/**：R2 主畫面目標圖（夜湖、灰影貓、HUD、Soul Talk、Bottom Nav、營火、月光、晶體、魔法陣）。
- **home-ui/**：主畫面 UI 結構 mockup 與標註。
- **codex-ui/**：圖鑑 / 進化頁 / 角色詳情頁的 UI layout 參考。
- **evolution-lines/companion/**：玩家可培養夥伴進化線（焰尾狐、星焰雞、水晶海馬、青葉麋鹿、雷霆系列、月光兔、星能小山豬等）。
- **evolution-lines/boss/**：Boss / 敵對 / 裂隙進化線（深淵獅帝、虛土領主、血紅領主、夢行領主、漩渦領主、麒多等）。
- **evolution-lines/faction/**：陣營代表性進化線（心輝議會守護者等）。
- **faction-style/heartspark-council/**、**black-iron-hackers/**、**chaos-rift/**：三大派系純視覺語言參考。
- **emotional-emblems/**：七情感元素徽章 + 符號系統。
- **pixel-asset-specs/**：明確寫尺寸（32x32/64x64/96x96）、64 PPU、transparent PNG、prompt 工程、sprite 規格的圖。
- **uncategorized/**：尚未分類或邊緣案例（內有 uncat- 前綴的原始檔）。

**這些資料夾內的任何檔案都只是「聖經 / 參考」**。

---

## 3. 哪些角色 / 概念是 Canon（目前極少）

**Canon（已進入 R2 主線 runtime）**：
- 灰影貓（greyshade-cat）—— Tier 1，完整 spritesheet + animations.json + 夜湖棲地。
- 焰尾狐（flametail-fox）—— Tier 2 legacy，已登錄 creatures.json，僅靜態圖。

**Strong Reference（核心視覺聖經，強烈建議對齊）**：
- 心輝議會五屬守護者（5 guardians）。
- 七情感元素徽章系統（愛・赤心、勇・炎志... 陰陽・太極）。
- 夜湖棲地 + 主畫面視覺（多張 home screen）。
- 魔法陣 / 營火 / 晶體 / 陰陽太極平台等主畫面道具。

**其餘全部是 Experimental / UI Style Reference / Asset Spec Reference**（見 R2_CANON_REGISTRY.md）。

**重要**：即使是 Strong Reference，也**不是** runtime asset。

---

## 4. 哪些只是 UI Reference（不可當 sprite）

- 所有 codex-ui/ 內的 5 階段並列圖（有文字、雷達、徽章、lore 框、深藍 cyber 外框）。
- home-ui/ 內的 9:16 手機 mockup + 大量標註。
- visual-north-star/ 內帶 HUD / Soul Talk / Nav 的完整畫面（除非你只想抽單一 prop）。
- emotional-emblems/ 內的徽章大圖（可能需重新畫乾淨 icon 版）。

這些圖的**價值在 layout、配色、玻璃感、cyber 線條、屬性 accent**，不是像素素材本身。

---

## 5. 不可直接使用 Reference 圖當 Runtime Asset

**鐵律**：
- 不可把任何 reference/ 下的 PNG 直接複製到 r2/assets/characters/xxx/ 或 ui/ 或 backgrounds/。
- 不可直接在 r2/index.html / styles.css / src/ 裡面引用 reference 路徑。
- 不可把 codex 5 階段大圖當作單一 sprite 塞進 Pixi。
- 不可把 home screen 當背景圖（裡面有 baked HUD 與標註）。
- 不可假設「這張看起來透明」就直接用（很多是 preview 帶 checkerboard 或有隱藏背景）。

**違反後果**：視覺語言分裂、無法 scale、無法 animate、validator 失敗、破壞 R2 與 R1 隔離原則。

---

## 6. 若需要新 Runtime Asset，必須先輸出 Asset Request List

**標準格式（至少包含以下）**：

```
Asset Request List — [角色/道具/徽章名稱]

1. 參考來源（必須指向 reference/ 內路徑）
   - r2/assets/reference/evolution-lines/companion/xxx.png
   - r2/assets/reference/pixel-asset-specs/yyy.png

2. 角色定位
   - 中文名 / 英文名
   - faction（heartspark / black-iron / chaos-rift / neutral）
   - element
   - role（companion / boss / guardian / prop / emblem）
   - 層級（建議：Experimental → Strong Reference → Canon）

3. 需要產出的資產類型與數量
   - 進化階段數（e.g. 5 階段）
   - 每階段尺寸 / PPU（32x32 / 64x64 / 96x96）
   - 視圖（正面 / 側面 / 背面？）
   - 動畫清單（idle-calm, walk-left, touch-accept, special-wake... 完整列出）
   - 是否需要 icon / portrait / emblem 獨立版

4. 技術規格（必須引用 pixel-asset-specs/ 與本文件）
   - transparent PNG
   - fixed frame cell
   - bottom-center baseline
   - nearest-neighbor only
   - no baked text / no UI / no checkerboard
   - 預計 animations.json 結構

5. 視覺約束（必須引用 R2_VISUAL_BIBLE.md）
   - 派系風格（heartspark 自然守護 / black-iron 機械侵核 / chaos-rift 虛空 glitch）
   - 色票 accent
   - 不可使用的風格（普通手遊 / 療癒 App / 過度寫實）

6. 預計放置路徑（r2 內）
   - r2/assets/characters/[id]/frames/...
   - r2/assets/characters/[id]/spritesheets/...
   - r2/assets/characters/[id]/metadata/animations.json
   - r2/assets/characters/[id]/icons/...

7. 額外需求
   - 發光 / 粒子 / 特殊 shader？
   - 與現有 greyshade-cat 風格一致性要求

8. 簽核
   - 提出者
   - 日期
   - 預計完成後更新 R2_CANON_REGISTRY.md 層級
```

**只有當 Asset Request List 被 human 明確批准後**，才可開始生產對應的 runtime 品質資產。

---

## 7. 總結心法（給 Fable 5）

- R2 的 reference 是「為什麼」——用來對齊視覺語言與世界觀。
- R2 的 runtime asset 是「怎麼跑」——必須工程化、可動畫、可驗證、可維護。
- 兩者之間永遠有一道轉檔 + 驗證 + 審查的鴻溝。
- 當你想直接「拿這張圖用用看」時，**停下來，先讀四件套文件，再寫 Asset Request List**。
- 灰影貓 + 第一棲地 + 情感沉積 + 記憶痕跡 + Cyber-Taoism 是主線鐵律，其他都是實驗與擴充。

**違反以上任何一點，都等於超出 R2 Fable 5 的 Max Authority。**

---

**讀完本文件後，請先執行以下動作再畫任何新圖**：
1. 打開 r2/assets/reference/ 實際看過至少 5 張不同分類的圖。
2. 對照 R2_VISUAL_BIBLE.md 寫下「這張圖符合哪些、違反哪些」。
3. 寫一份 Asset Request List 給 human 確認。

這樣 R2 的視覺才不會在每次新產圖時崩壞。
