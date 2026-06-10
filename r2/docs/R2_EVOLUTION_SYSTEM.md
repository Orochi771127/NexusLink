# R2_EVOLUTION_SYSTEM.md — Nexus Link R2 進化系統設計

> 來源：R2 Master Handoff v1.0 第 14 節。
> 核心原則：進化不應只是等級制，必須保留「關係」與「情緒棲地」特色。

---

## 1. 進化條件（多維度混合）

進化不應只看 level。建議條件組合：

- level（基礎門檻）
- bond（親密）
- trust（信任）
- emotional emblem（特定情感元素徽章解鎖或達到一定共鳴）
- battle experience（戰鬥次數 / 勝利 / 特定敵人）
- map event（探索特定節點或完成事件）
- habitat trace resonance（棲地痕跡與角色元素匹配）
- special item or ritual（儀式道具或棲地儀式）
- companion temperament（夥伴當前 mood / defense 狀態）

---

## 2. 階段命名建議

**五階段（推薦大多數角色使用）**：
- Baby / 幼年期
- Child / 成長期
- Adult / 成熟期
- Perfect / 完全體
- Ultimate / 究極體

**四階段（部分角色或簡化展示可用）**：
- Stage 1
- Stage 2
- Stage 3
- Stage 4

Codex UI 應清楚顯示當前階段與下一階段條件（中英雙語 + 情感徽章圖示）。

---

## 3. 視覺與 UI 呈現

- 參考 r2/assets/reference/evolution-lines/ 與 codex-ui/ 內的 5 階段 / 4 階段圖鑑。
- 每階段應有獨立立繪（或至少 icon 與 full body）。
- 完全體 / 究極體應有特效外框與專屬 lore 區塊。
- 進化條件在 Codex 內以清單或雷達圖 + 徽章形式呈現。
- 不可直接把 reference image 當作遊戲內進化動畫使用，必須轉為符合 R2_ASSET_PIPELINE_SPEC.md 的 runtime 規格。

---

## 4. 與其他系統的連動

- **情感元素**：特定徽章可作為進化關鍵條件或強化下一階段能力。
- **戰鬥**：戰鬥勝利 / 特定敵人擊敗可累積進化經驗。
- **探索**：地圖事件與節點可提供獨特進化路徑或儀式。
- **棲地痕跡**：長期相同情緒痕跡可影響進化分支或最終形態。
- **Soul Talk / Boundary**：高 trust + 低 defense 狀態更容易觸發進化對話或儀式。
- **記憶系統**：emotionalMemory 可作為進化 lore 素材或條件。

---

## 5. 設計紅線

- 不可退化成普通寶可夢式「達到等級就進化」。
- 不可讓進化只服務戰鬥數值（必須同時服務陪伴關係與棲地故事）。
- 進化條件應鼓勵玩家與夥伴互動、探索、處理情緒，而非純刷怪。
- 不同夥伴的進化路徑應有明顯 faction / element / emotional 差異。

---

## 6. 與其他文件的關係

- 具體角色進化線 → r2/assets/reference/evolution-lines/companion/ + boss/ + faction/
- 視覺語言 → R2_VISUAL_BIBLE.md + R2_CODEX_UI_REFERENCE.md
- 角色層級與 Canon 狀態 → R2_CANON_REGISTRY.md + R2_SCOPE_V1.md
- 資產生產規則 → R2_ASSET_PIPELINE_SPEC.md

---

*進化是「夥伴與玩家共同成長的儀式」，而非單純的數值跳躍。*
