# Moonlake 棲地美術風格鎖 — v2

**狀態：** `STAGING / 待 Owner 確認`  
**適用：** 月湖 Phase 1 概念包（`output/linkara/moonlake/`）

---

## v1 哪裡不對？

| 維度 | v1 試稿 | 你的參考圖 | 差距 |
|------|---------|-----------|------|
| **渲染語言** | 2D 手繪數位� landscape | 3D 微縮模型 macro 攝影 | ❌ 最大問題 |
| **材質** | 筆觸、大氣透視、寫實樹葉 | 霧面絲光黏土／樹脂、圓角模組 | ❌ |
| **空間感** | 開放式風景照 | 飼養箱／景盒舞台、tilt-shift 景深 | ❌ |
| **物件形狀** | 自然有機輪廓 | chunky 圓角模組（像手捏零件） | ❌ |
| **色盤** | 偏冷靛蓝，尚可 | Nexus 月湖 navy/cyan + 少量暖光 | △ 方向對但語言錯 |

**一句話：** v1 像「背景插畫」；你要的是「有人把月湖做成實體黏土樹脂微景，再用 macro 鏡頭拍下來」。

---

## v2 混合規則（借什麼、守什麼）

### 從 Digimon 參考「借空間與材質」

- ✅ 3D 微縮模型／黏土樹脂實體感（matte-satin clay/resin）
- ✅ 模組化圓角地形塊（chunky modular pieces）
- ✅ 飼養箱舞台（terrarium stage box）
- ✅ tilt-shift 淺景深（中心銳、邊緣柔）
- ✅ 工作室柔光（studio soft lighting）

### 從 Nexus 月湖參考「借色與情緒」

- ✅ 深 navy 夜空、月湖 cyan #00CED1、紫影
- ✅ Cyber-Tao 魔法感（符文光、湖面冷光）
- ✅ 寧靜陪伴，不是競技場
- ✅ 少量暖色（營火/燈）作 anchor，不要搶戲

### 明確拒絕（Reject List）

| 拒絕 | 原因 |
|------|------|
| 2D 手繪 landscape / 數位油畫筆觸 | 與夥伴 3D diorama 割裂 |
| 亮面塑膠公仔（glossy vinyl toy） | 太像廉價扭蛋，不是黏土樹脂 |
| Digimon 原色（大紅大黃大綠積木） | IP 與色調都不屬 Nexus |
| 格線訓練室地板 | 太 UI、破壞棲地情緒 |
| 寫實照片 / photobash | 不符合 storybook diorama |
| 把夥伴、UI、文字 bake 進背景 | runtime 分層契約 |
| 競技對戰構圖 | Nexus 是陪伴棲地 |

---

## v2 正式 prompt 關鍵字（給 Codex / 生圖用）

```
clay/resin miniature diorama macro studio photograph,
matte-satin handcrafted scale model, NOT 2D painting,
chunky rounded modular terrain, terrarium vivarium stage,
tilt-shift shallow depth of field,
Nexus moonlake navy cyan violet palette,
Cyber-Tao magical glow accents
```

---

## 與 character lock 對齊

`docs/art/character-locks/*.lock.md` 已有：

> illustrated / painterly / **premium 3D storybook diorama look**

v2 棲地應讓夥伴 sprite **像站在同一個實體景盒裡**，材質語言一致。

---

## 下一版若仍要修

1. ~~**Foundation** 移除 bake 的拱門、燈柱（應為獨立 prop）~~ → **v3 已完成**
2. **Foundation** 月亮仍不 bake，走 celestial runtime 層
3. **Platform / props** 洋紅底 chroma-key 去背 → transparent PNG
4. 補 **day 版** clay diorama foundation

---

## v3 增量（2026-07-14，Terence 核准 v2 後）

**狀態：** `STAGING / 待 Owner 確認 v3 QC`

### v3 做了什麼

| 項目 | v2 問題 | v3 修正 |
|------|---------|---------|
| Foundation 純度 | 燈柱、石拱 bake 在底圖 | ✅ 純地形景盒，中央留空平台 |
| 燈柱 | bake 在 foundation | ✅ `props/moonlake-lantern-post-v3.png` 獨立 prop |
| 石拱 | bake 在 foundation | ✅ `props/moonlake-stone-arch-v3.png` 獨立 prop |
| 魔法陣 | v2 深色底 | ✅ `props/moonlake-magic-circle-platform-v3.png` 洋紅底待去背 |
| 月亮 | 未 bake | ✅ 維持 celestial runtime 層 |

### v3 風格鎖不變

仍沿用 v2 混合規則與 reject list。v3 是**分層契約修正**，不是風格轉向。

### v3 晉升前必做

1. Owner 目檢 v3 foundation + 三個 prop
2. 洋紅底 prop → `generate2dsprite` 或 chroma-key 去背
3. `moonlake-props.json` 錨點 → Scene Editor 實機微調
4. 仍 **禁止** 未核准前 promote 至 `assets/**`
