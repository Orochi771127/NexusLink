# Moonlake Phase 1 — Readiness Report (v3)

**Date:** 2026-07-14  
**Active revision:** `v3`  
**Style lock:** `STYLE-LOCK-v2.md`（v3 增量見文末）

---

## v1 → v2 → v3 修正摘要

| 版本 | 重點 |
|------|------|
| v1 | 2D 手繪 landscape — **風格錯誤** |
| v2 | 黏土樹脂微縮 macro — Terence 核准「好」 |
| v3 | 分層契約修正：foundation 純地形 + 道具獨立 prop |

---

## 已產出（v3，staging only）

| 檔案 | 用途 |
|------|------|
| `layers/moonlake-night-foundation-v3.png` | 純地形景盒底圖（無 bake 道具） |
| `props/moonlake-lantern-post-v3.png` | 左側燈柱獨立 prop（洋紅底） |
| `props/moonlake-stone-arch-v3.png` | 右側石拱獨立 prop（洋紅底） |
| `props/moonlake-magic-circle-platform-v3.png` | 魔法陣平台（洋紅底，待去背） |
| `data/moonlake-props.json` | v3 錨點草案（schemaVersion 2） |
| `manifest.json` | activeRevision → v3 |

v1/v2 檔案保留作對照，manifest 已標 `deprecated`。

**未 promote 至 `assets/**`** — 依 approval gate 僅存於 `output/linkara/moonlake/`。

---

## QC：v3 誠實評估

### Foundation v3 — **通過（分層目標達成）**

| 項目 | 結果 |
|------|------|
| 黏土／樹脂材質 | ✅ 圓角模組、霧面絲光、實體感 |
| 飼養箱／景盒舞台 | ✅ terrarium 玻璃框、tilt-shift 景深 |
| Nexus 色盤 | ✅ navy/cyan/violet，無 Digimon 原色 |
| 非 2D 手繪 | ✅ 3D 微縮模型 macro 語言 |
| Foundation 純度 | ✅ **無** bake 燈柱、石拱、魔法陣、角色 |
| 中央留空平台 | ✅ 圓形沙石平台 bare，可疊 prop |
| 月亮 | ✅ 未 bake |

**殘留風險：** 景盒玻璃框邊緣仍可見（與 v2 一致）；若 runtime 要滿版裁切需工程裁切或重出無框版。

### Lantern post v3 — **通過（待去背）**

| 項目 | 結果 |
|------|------|
| 黏土樹脂 chunky 造型 | ✅ 木柱 + 暖色燈籠 |
| 洋紅隔離底 | ✅ 適合 chroma-key |
| 獨立 prop | ✅ 無場景 bake |

### Stone arch v3 — **通過（待去背）**

| 項目 | 結果 |
|------|------|
| 黏土樹脂 chunky 石塊 | ✅ |
| cyan 符文門戶 | ✅ 對齊 Nexus Cyber-Tao |
| 洋紅隔離底 | ✅ |
| 獨立 prop | ✅ |

### Magic circle v3 — **通過（待去背）**

| 項目 | 結果 |
|------|------|
| 黏土樹脂 chunky 邊角 | ✅ |
| cyan 符文 + gold 鑲邊 | ✅ |
| 洋紅隔離底 | ✅ 比 v2 深色底更適合去背 |
| 透明背景 | ⚠️ **尚未** postprocess — 晉升前必做 |

---

## 晉升路徑（Owner approval gate）

1. ~~Terence 確認 v2 風格方向~~ → **已核准**
2. ~~v3 foundation 拆 prop~~ → **已完成**
3. **Terence 目檢 v3 QC**（本報告）
4. 洋紅底 prop chroma-key → transparent PNG
5. Scene Editor 實機微調 `moonlake-props.json` 錨點
6. GROUNDWORK → `assets/backgrounds/MoonlakeVivarium_v1/`（Owner 簽核後）

---

## 請 Terence 回覆

- **v3 QC OK** → 進去背 + Scene Editor 錨點微調
- **還要調** → 指出哪個 asset（foundation / 燈柱 / 石拱 / 魔法陣）與調整方向
- **景盒玻璃框** → 要保留 vivarium 感還是要滿版無框版？

---

## 仍待 Owner 核准才能 runtime promotion

- [ ] v3 foundation 視覺確認
- [ ] v3 三個 prop 視覺確認
- [ ] 去背後 magic circle / lantern / arch 邊緣品質
- [ ] Scene Editor 錨點實機對位
- [ ] 是否補 day 版 foundation
- [ ] 正式 promote 至 `assets/**`
