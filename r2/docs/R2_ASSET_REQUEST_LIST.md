# R2 Asset Request List

依 `R2_FABLE5_VISUAL_HANDOFF.md` 的 Asset Request 格式提出。
**所有項目需人類核准後才進入製作；reference 圖僅為美術方向，不得直接轉為 runtime 素材。**

---

## Request 1 — 雷霆幼狼 Thunder Pup（優先度最高）

1. **Reference Source**
   - `r2/assets/reference/evolution-lines/companion/`（thunder wolf 5-stage codex 系列）
   - `r2/assets/reference/pixel-asset-specs/thunderpup-64ppu-3view-specs-color-palette.png`
2. **定位與 Canon 層級**
   - 雷霆幼狼 / Thunder Pup；心輝議會；雷屬性；companion / vanguard；現況 Strong Reference → 申請升 Canon
3. **Deliverables**
   - 進化階段：第一階（幼年期）runtime 優先；後續 4 階分批
   - 尺寸：64x64 frame cell（64 PPU）；icons 32x32 + portrait 64x64
   - 視角：front / side（home 棲地用 side 為主）
   - 動畫：idle_calm(8f)、idle_defensive(8f)、blink(3f)、left_walk(8f)、right_walk(8f)、touch_accept(6f)、touch_guarded(6f)、touch_reject(4f)、attack_basic(6f)、defend(6f)、hit(4f)
4. **技術規格**（R2_ASSET_PIPELINE_SPEC.md 2.1–2.6 全套）
   - 透明 PNG α-channel；固定 frame cell；sprite sheet + animations.json（含 fps/loop/anchor）；bottom-center baseline + 整數 snap；nearest-neighbor；無烘焙文字/HUD/陰影；validator 通過
5. **視覺約束**（R2_VISUAL_BIBLE.md）
   - Heartspark 視覺語言：暖金 + 雷紫 accent、圓潤有機輪廓；禁止 edgelord / 寫實 3D / 抗鋸齒
6. **交付路徑**
   - `r2/assets/characters/thunder-pup/{frames,spritesheets,metadata,icons}/`
7. **核准欄**：提案 Fable 5（2026-06-11）／核准：＿＿＿＿

## Request 2 — 水晶海馬 Crystal Seahorse

- Reference：`evolution-lines/companion/crystal-seahorse-to-dragon-4stage-evo.png`（64AD）
- 定位：心輝議會／水／support companion；Experimental → 申請 Strong Reference
- Deliverables：第一階 64x64；動畫同 Request 3 基礎組（idle_calm/blink/walk×2/touch×3）；icons 32/64
- 視覺：通透晶藍（#00b4ff 系）、流動曲線；技術規格與交付路徑同上（`crystal-seahorse/`）

## Request 3 — 青葉麋鹿 Verdant Stag

- Reference：`evolution-lines/companion/verdant-stag-qingye-milu-4stage-evo-green.png`（A316）
- 定位：心輝議會／木／healer companion；Experimental → 申請 Strong Reference
- Deliverables：第一階 64x64；基礎動畫組；icons 32/64
- 視覺：翠玉綠（#2ecc71 系）+ 嫩葉微光；交付 `verdant-stag/`

## Request 4 — 焰尾狐 Flametail Fox 動畫化

- Reference：既有 `r2/assets/flametail-fox.png` + `codex-ui/flametail-fox-evolution-codex-ui-layout-32x64-spec.png`
- 定位：Canon Tier 2（legacy static）→ 申請補 runtime 動畫
- Deliverables：以現有造型為準的 64x64 frame 化：idle_calm/blink/walk×2/touch×3；icons 32/64
- 交付 `flame-tail-fox/`（沿用既有目錄骨架，目前皆為 .gitkeep）

## Request 5 — 戰鬥敵人三隻（雜訊殘影／晶屑魔像／裂隙暗影）

- Reference：`faction-style/chaos-rift/`、`evolution-lines/boss/`（風格參考，非同一角色）
- 定位：enemy / 混沌裂隙外圍雜兵；新提案（Experimental）
- Deliverables：每隻 48x48 或 64x64：idle(4–6f)、attack(4f)、hit(3f)；無 icons 需求
- 視覺：Chaos Rift 語言（深紫/血紅/glitch 藍、不規則輪廓、噪點）；禁止純 grimdark
- 交付 `r2/assets/enemies/<enemy-id>/`

## Request 6 — UI 補件（低優先）

- 探索節點縮圖 ×5（96x96，各節點地景 icon，沿 LakeNightCamp 視覺）
- 七情徽章 glyph ×7（24x24 + 48x48，依 `emotional-emblems/27DE` 重繪，禁直接裁切 reference）
- 進化階段框（Perfect/Ultimate 展示框金色特效 9-slice）

---

### 共通驗收標準

所有 request 適用 R2_ASSET_PIPELINE_SPEC 的 10 項 runtime 轉換條件（透明、固定 cell、sheet+metadata、baseline、整數 snap、nearest、無烘焙元素、validator、creatures/registry 登錄）。未全數通過者一律維持 reference-only。
