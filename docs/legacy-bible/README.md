> ⚠️ SUPERSEDED：本文件的現況/優先序已被 `NEXUS_LINK_MASTER_CANON_v3.md` 取代。
> 僅保留世界觀與角色敘事作參考。技術現況、商業方向、角色 tier 一律以 `NEXUS_LINK_MASTER_CANON_v3.md` 為準。

---
# README.md
# Nexus Link／心核連結 — Bible Documents v2.0

本資料夾包含《Nexus Link／心核連結》的四層核心文件。

這一版已依照目前 GitHub `main` 狀態重新校正：
**R2 prototype 已 promote 到 root；root White Lab 是現行主版本。**

---

## 文件列表

```text
01_DESIGN_BIBLE.md
02_WORLD_BIBLE.md
03_CHARACTER_BIBLE.md
04_RUNTIME_CANON.md
README.md
```

---

## 1. 01_DESIGN_BIBLE.md

產品憲法。

定義：

- 產品本質
- 核心情感契約
- 邊界原則
- 安全紅線
- 心核裂變產品定位
- 最高驗收標準

最高優先。
所有其他文件都必須服從它。

---

## 2. 02_WORLD_BIBLE.md

世界觀聖經。

定義：

- Nexus Core／心核
- Raphael Core／靈魂原點
- Nexus Link／心核連結
- 情緒棲地
- 心輝議會
- 黑鐵駭客
- 混頓裂隙
- 外域意識
- 五大虛空領主
- 黑蓮線

此文件避免工程語言，主要作為劇情、美術、角色、宣傳與敘事基礎。

---

## 3. 03_CHARACTER_BIBLE.md

角色聖經。

定義：

- 角色分類
- Primary Runtime
- Runtime-ready Companions
- Legacy / Placeholder companions
- 三階 canon
- legacy 五階進化對照
- current root runtime roster
- 長線世界觀角色線

重要：
目前 root runtime 已有五元守護可測角色，因此本文件不直接刪除現有角色，而是建立 world canon 與 runtime roster 的對照。

---

## 4. 04_RUNTIME_CANON.md

現況與落地規格。

定義：

- root 是 current active runtime
- `/r2/` 為歷史階段，不是主入口
- current root features
- storage key
- current runtime roster
- battle canon
- evolution migration
- heart-core fracture policy
- art runtime standard
- do-not-expand list

此文件給 Claude Code、Codex、Fable、ChatGPT 等 agent 使用。

---

## Canon Priority

當文件衝突時，依照以下順序判定：

1. `01_DESIGN_BIBLE.md`
2. `04_RUNTIME_CANON.md`
3. `03_CHARACTER_BIBLE.md`
4. `02_WORLD_BIBLE.md`
5. Roadmap / future ideas
6. 單次任務中的未確認靈感

理由：

- Design Bible 是產品憲法。
- Runtime Canon 反映目前 GitHub main 的真實狀態。
- Character Bible 管角色與 migration。
- World Bible 管敘事與神話，但不能推翻現有 runtime 安全與產品契約。

---

## 目前最重要的判定

### Root is active

目前主版本是 root：

```text
/
  index.html
  styles.css
  src/
  assets/
```

不要再假設 `/r2/` 是主開發入口。

### Storage key remains

雖然 R2 已 promote 到 root，但 localStorage key 暫時仍維持：

```js
nexusLinkR2State:v1
```

不要為了命名潔癖改 storage key。

### Evolution is legacy-to-canon migration

目前 `evolutionLines.js` 仍有五階資料。
最新 canon 是三階制。

處理方式：

- 短期保留 legacy display。
- 中期轉為三階 canon。
- 不新增更多五階正式線。

### Heart-core fracture is safety-gated

心核裂變不可再被寫成單純未來靈感。
它有驗收紅線，若進一步實作或擴張，必須補齊安全文件。

---

## 建議放置路徑

```text
docs/bible/
  01_DESIGN_BIBLE.md
  02_WORLD_BIBLE.md
  03_CHARACTER_BIBLE.md
  04_RUNTIME_CANON.md
  README.md
```

---

## 給 agent 的一句話

> 目前 Nexus Link 是 root White Lab 主版本。所有功能都必須服務「有邊界、會記得、會因共同經歷而改變」的心核夥伴體驗。不要把它導回 `/r2/`，不要擴張成普通 RPG，不要繼續量產五階進化。
