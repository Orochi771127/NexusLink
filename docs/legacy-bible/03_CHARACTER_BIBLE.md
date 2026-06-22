> ⚠️ SUPERSEDED：本文件的現況/優先序已被 `NEXUS_LINK_MASTER_CANON_v3.1.md` 取代。
> 僅保留世界觀與角色敘事作參考。技術現況、商業方向、角色 tier 一律以 `NEXUS_LINK_MASTER_CANON_v3.1.md` 為準。

---
# 03_CHARACTER_BIBLE.md
# Nexus Link／心核連結 — Character Bible v2.0
## 第三層：角色聖經

---

## 0. 文件定位

本文件負責定義《Nexus Link／心核連結》的角色體系、角色命名、勢力歸屬、三階 canon、runtime roster 與 legacy 對照。

本文件必須同時尊重兩件事：

1. **世界觀 canon**：角色在 Nexus Link 宇宙中的正式定位。
2. **current root runtime**：目前 root 白版已經存在的 playable / selectable / placeholder 角色資料。

如果兩者不一致，不可直接刪除 runtime。
應先標記為 alias、prototype、roadmap、legacy 或 migration target。

---

## 1. 角色分類原則

目前角色分成四層：

### 1.1 Primary Runtime

目前主線預設夥伴與情緒棲地核心測試角色。

- 灰影貓／Greyshade Cat

### 1.2 Runtime-ready Companions

目前 root 已接入完整或可用 runtime asset 的角色。
可選、可展示、可在目前白版進行測試。

目前包括：

- 灰影貓／Greyshade Cat
- 焰紋狐／Ember-vein Fox
- 冰晶狼／Frostcrystal Wolf
- 磐石熊／Bedrock Bear
- 青藤鹿／Vine Stag
- 晶石兔／Crystal Rabbit

### 1.3 Legacy / Static / Placeholder Companions

目前存在於 companion registry 或 Codex，但 asset readiness 不完整，或定位已被後續 canon 取代。

包括：

- 焰尾狐／Flametail Fox
- 水晶海馬／Crystal Seahorse
- 青葉麋鹿／Verdant Stag
- 雷霆幼狼／Thunder Pup
- 星能小山豬／Star-energy Boarlet

### 1.4 Lore / Roadmap / Boss-level Entities

目前主要存在於世界觀、角色設定、美術規格或未來章節。

包括：

- 殘焰小獸
- 五大虛空領主
- 黑蓮巫后
- 虛無女帝
- 夢行領主
- 黑鐵駭客五位侵蝕者

---

## 2. 三階制總則

所有主要角色的正式 canon 統一採用 **三階制**。

原本四階制中的第二階與第三階合併為新的第二階。
原本第四階成為新的第三階。

### 第一階：初醒夥伴

玩家最初遇見的形態。
也是目前 root runtime 最應優先穩定支援的形態。

### 第二階：共鳴成熟體

融合原第二階的成長感與原第三階的完成度。
代表角色在關係、屬性與勢力影響下形成穩定方向。

### 第三階：終局覺醒體

不是單純變強，而是角色對自身命運、勢力哲學與玩家關係作出最終回應後的形態。

---

## 3. Legacy 進化資料處理原則

目前 root runtime 的 `evolutionLines.js` 仍使用五階標籤：

- 幼年期／BABY
- 成長期／CHILD
- 成熟期／ADULT
- 完全體／PERFECT
- 究極體／ULTIMATE

這是 R2 prototype legacy，不再是最新正式 canon。

處理規則：

1. 最新 canon 採三階制。
2. 現有五階資料標記為 **Legacy R2 Prototype**。
3. Legacy 第二、第三階可合併為新版第二階素材。
4. Legacy 第四、第五階可合併或改寫為新版第三階素材。
5. Codex 可短期保留 legacy 顯示，但需標記為 prototype 或待遷移。
6. 未來正式版本應以三階 canon 為準。

---

## 4. 灰影貓／Greyshade Cat

### Runtime ID

`greyshade-cat`

### 定位

灰影貓是目前 root 主線預設夥伴，也是第一棲地的核心角色。

牠不是最華麗的角色，也不是最有宣傳爆點的角色。
但牠最能展示 Nexus Link 的核心差異。

牠不會一開始就完全信任玩家。
牠會觀察。
會退後。
會在壓力過高時沉默。
也會在長期穩定陪伴後，慢慢靠近。

灰影貓代表的是：

> 有邊界的陪伴。

### Runtime 狀態

- Tier：Primary Runtime
- runtimeStatus：full-runtime
- assetReadiness：runtime-ready
- default active companion
- 不可刪除
- 不可 fallback 到其他角色美術
- legacy 443/444 frame 可作 reference，但未來需經 reference-audited swap 升級至 illustrated 512

### 適合測試

- Soul Talk
- 防衛閾值
- 記憶留痕
- localStorage 記憶
- 棲地留痕
- 角色沉默
- 拒絕層次
- 高羈絆下仍保有邊界

---

## 5. Root Runtime 五元守護

目前 root 已有五位 heart / guardian 類 companion 進入 full-runtime 或 runtime-ready 狀態。
這批角色是目前白版可測的實作陣容，應與世界觀 canon 區分管理。

### 5.1 焰紋狐／Ember-vein Fox

- Runtime ID：`flame-flicker`
- 屬性：火
- 陣營：心輝議會
- Runtime 狀態：full-runtime
- 定位：火系守護、熱切靈動、突擊者

Canon 關係：

> 焰紋狐可視為焰尾狐系統的 root runtime variant。若未來正式角色名統一為焰尾狐，需另開 migration，不可直接改 ID。

---

### 5.2 冰晶狼／Frostcrystal Wolf

- Runtime ID：`ice-talon`
- 屬性：水
- 陣營：心輝議會
- Runtime 狀態：full-runtime
- 定位：水系守界、冷靜、防衛

Canon 關係：

> 冰晶狼是目前 root 水系 runtime guardian。若未來要改回水晶海馬作心輝水系代表，冰晶狼可保留為章節角色、旁支守護或 legacy runtime guardian。

---

### 5.3 磐石熊／Bedrock Bear

- Runtime ID：`stone-shard`
- 屬性：土
- 陣營：心輝議會
- Runtime 狀態：full-runtime
- 定位：穩定、防禦、地基守護

Canon 關係：

> 磐石熊是目前 root 土系 runtime guardian。若未來星核虎成為正式土系主角，磐石熊可保留為土系守護分支。

---

### 5.4 青藤鹿／Vine Stag

- Runtime ID：`vine-twist`
- 屬性：木
- 陣營：心輝議會
- Runtime 狀態：full-runtime
- 定位：木系療癒、溫和、生長

Canon 關係：

> 青藤鹿可視為青葉麋鹿系統的 root runtime variant。未來若改回青葉麋鹿命名，需保持 ID migration 安全。

---

### 5.5 晶石兔／Crystal Rabbit

- Runtime ID：`crystal-rabbit`
- 屬性：金
- 陣營：心輝議會
- Runtime 狀態：full-runtime
- 定位：金系感應、敏感警覺、晶核反應

Canon 關係：

> 晶石兔是目前 root 金系 runtime guardian。若未來金羽戰鷹成為正式金系代表，晶石兔可保留為金系支線守護。

---

## 6. 世界觀 Canon：心輝議會五位守護者

此表為世界觀長線 canon，不代表 current root 已全部實作。

| 屬性 | 第一階 | 第二階 | 第三階 |
|---|---|---|---|
| 火 | 焰尾狐 | 星焰狐王 | 永焰狐皇 |
| 水 | 水晶海馬 | 冰洋海龍 | 蒼海龍皇 |
| 木 | 青葉麋鹿 | 風暴麋將 | 聖林麋神 |
| 金 | 金羽戰鷹 | 輝鋼鷹將 | 聖輝鷹皇 |
| 土 | 星核虎 | 晶聖虎王 | 星地虎皇 |

設計原則：

- 火：陪伴與情感溫度
- 水：記憶與沉澱
- 木：修復與生長
- 金：判斷與守望
- 土：邊界與安定

---

## 7. 雷霆幼狼／ThunderPup

### Runtime ID

`thunder-pup`

### 目前狀態

- tier：roadmap
- runtimeStatus：placeholder
- assetReadiness：qc-pending
- 有完整 legacy 5 階 evolution display

### Canon 三階線

> 雷霆幼狼 → 雷鳴蒼狼 → 天狼雷皇

### Current Root Legacy Prototype

目前 `evolutionLines.js` 內存在五階展示：

> 雷霆幼狼 → 嘯雷狼 → 蒼雷狼 → 天雷狼君 → 太雷狼皇

### Migration 建議

| Legacy 階段 | New Canon 處理 |
|---|---|
| 雷霆幼狼 | Stage 1 |
| 嘯雷狼 | Stage 2 素材 |
| 蒼雷狼 | Stage 2 主體素材 |
| 天雷狼君 | Stage 3 素材 |
| 太雷狼皇 | Stage 3 主體素材 |

---

## 8. 星能小山豬／Star-energy Boarlet

### Runtime ID

`star-energy-boarlet`

### 定位

星能小山豬是中立野生心核生命。

牠不屬於心輝議會、黑鐵駭客或混頓裂隙。
牠更像是世界自然生成的小型心核生命。

牠的能力不是戰鬥，而是感知被埋在地層中的舊心核記憶。

角色用途：

- Explore
- Memory
- 地圖事件
- 棲地挖掘
- 失落心核碎片
- 世界生活感

命名建議：

> 目前 runtime 用「星能小山豬」。若要保留「外星小山豬」的童趣感，可作為別稱或早期暱稱，不建議直接改 ID。

---

## 9. 黑鐵駭客五位侵蝕者

此表為世界觀長線 canon，不代表 current root 已實作。

| 屬性 | 第一階 | 第二階 | 第三階 |
|---|---|---|---|
| 木＋雷 | 雷霆幼狼 | 雷鳴蒼狼 | 天狼雷皇 |
| 水＋闇 | 浪花幼獅 | 冰潮獅皇 | 深淵獅帝 |
| 金＋秩序 | 金光幼龍 | 輝鋼龍將 | 聖金龍神 |
| 土 | 幼星駒 | 晶地戰駒 | 泰坦星皇 |
| 火 | 星焰鳳凰 | 星輝聖者 | 永恆星皇 |

設計原則：

> 黑鐵角色不是普通機械獸。它們是被工程化、被演算塑形、被裝甲化的心核生命。

---

## 10. 混頓裂隙異常覺醒線

混頓裂隙角色不稱為正常進化，而稱為：

> 污染顯化 → 異常成熟 → 虛空覺醒

| 屬性 | 第一階 | 第二階 | 第三階 |
|---|---|---|---|
| 影／火 | 殘焰小獸 | 無主裂王 | 殞焰無主神 |
| 木／虛空 | 潛行蝶 | 夢織蝶 | 幻蝶虛空領主 |
| 金／虛空 | 裂光螳螂 | 螺旋寄生體 | 螺旋虛空領主 |
| 水／虛空 | 深螢孢子體 | 淵螢共感體 | 終潮虛空領主 |
| 土／虛空 | 腐土殘核 | 蛭塔掘墓體 | 虛土吞噬領主 |
| 火／虛空 | 赤燄幼核 | 夢魘召火者 | 赤燄虛空主母 |

---

## 11. 命名統一

| 混用名稱 | 正式處理 |
|---|---|
| 星輝議會 | 統一為心輝議會 |
| 鐵流黑客 | 統一為黑鐵駭客 |
| 混沌裂隙 | 對外俗稱 |
| 混頓裂隙 | 世界觀正式古稱／核心名稱 |
| 心核虎 | 統一為星核虎 |
| ThunderPup | 雷霆幼狼英文／幼名 |
| FlameFlicker | 目前 root 已作為 `flame-flicker`／焰紋狐 runtime ID，未來若要與焰尾狐合流需開 migration |
| 幻屬性 | 不是正式屬性，只作主題 |

---

## 12. 重要警告

不要為了對齊世界觀而直接刪除已接入 root 的 runtime-ready companion。
角色改名、合併、遷移都必須另開 TASK_PACK，並保證：

- localStorage 不壞
- companion ID fallback 安全
- Codex 顯示不壞
- animation manifest 不壞
- active companion 不會變 unknown
