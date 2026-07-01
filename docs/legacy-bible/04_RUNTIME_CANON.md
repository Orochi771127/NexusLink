> ⚠️ SUPERSEDED：本文件的現況/優先序已被 `NEXUS_LINK_MASTER_CANON_v3.1.md` 取代。
> 僅保留世界觀與角色敘事作參考。技術現況、商業方向、角色 tier 一律以 `NEXUS_LINK_MASTER_CANON_v3.1.md` 為準。

---
# 04_RUNTIME_CANON.md
# Nexus Link／心核連結 — Runtime Canon v2.0
## 第四層：現況與落地規格

---

## 0. 文件定位

本文件負責對齊 current repo 的實作現況、legacy prototype、最新 canon 與後續遷移規則。

它不是世界觀文件。
它是給 Claude Code、Codex、開發者與未來協作者使用的落地規格。

---

## 1. Current Repo 判定

目前 repo 的現況是：

> R2 prototype 已經 promote 到 root。root 現在是 current active runtime。

因此：

- `/` 是現行主入口。
- `/r2/` 不是目前主入口。
- 舊 R2 文件仍可作 reference，但不可再要求 agent 回到 `/r2/` 開發。
- `R2` 這個名稱在文件中應改成「R2-derived root runtime」或「Root White Lab」。

目前 root `index.html` 標題為：

> Nexus Link White Lab / 白版

目前 root 直接載入：

- LakeNightCamp 背景
- magic circle
- nav icons
- greyshade-cat preview
- styles.css
- root app shell

---

## 2. Current Active Runtime

目前 active runtime 位於 root：

```text
/
  index.html
  styles.css
  src/
  assets/
```

現行 app 直接從 root `src/app.js` 啟動，並載入：

- companion registry
- companion runtime policy
- interaction controller
- event bus
- save manager
- runtime guard
- sleep cycle
- return behavior
- habitat trace mapper
- HUD controller
- Soul Talk controller
- Action Sheet controller
- Companion Select controller
- Map controller
- Battle controller
- Codex controller
- Pixi renderer
- motion controller

因此，所有新工作預設應在 root runtime 上進行，除非 human 明確要求處理歷史 `/r2/`。

---

## 3. Current Runtime Features

目前 root runtime 已具備：

### 3.1 主棲地

- LakeNightCamp / Moonlake 類主棲地
- magic circle
- Pixi 場景
- DOM HUD
- bottom nav
- quick settings
- companion render

### 3.2 Companion System

- `activeCompanionId`
- `unlockedCompanionIds`
- companion registry
- runtimeEnabled
- tier
- assetReadiness
- selectableWhenUnlocked
- fallback policy

### 3.3 Soul Talk

- 情緒輸入
- response packs
- memory echo
- safety shield
- companion tone
- chatHistory
- reload 後保留

### 3.4 Boundary / Touch

- defense
- touchFatigue
- lastRejectAt
- blockedTouchCount
- accept / guarded / hesitate / reject
- 觸碰拒絕與冷卻

### 3.5 Habitat Trace / Memory

- memories
- habitatTraces
- emotionalMemories
- memory lifecycle
- trace visual mapping
- gratitude / calm / anxiety / fatigue / sadness 類痕跡

### 3.6 Exploration

- explorationProgress
- totalExplorations
- lastNodeId
- visitCounts
- map controller
- safe moonlake / node-based exploration

### 3.7 Battle / Emotional Standoff

目前戰鬥已不應再理解為普通 HP 歸零戰鬥，而是：

> Emotional Standoff／情緒對峙。

玩家端名稱優先用：

> 穩住裂隙

玩家需要理解的對象不是怪物、玩家或夥伴，而是裂隙裡卡住的情緒、雜訊與記憶回聲。

現有 battle engine 已定義：

- noise
- stability
- sync
- fatigue
- boundary
- shards
- 四結局：stabilized / recovered / retreated / overwhelmed_but_safe
- 沒有傳統 win / lose
- 撤退是被尊重的選項
- 裂隙心相與元素契合

### 3.8 Codex / Evolution Display

目前 Codex 已存在 evolution display。
但現有 evolutionLines 仍為 R2 legacy 五階展示，需遷移成三階 canon。

---

## 4. Storage / State Canon

目前 root 存檔 key：

```js
nexusLinkR2State:v1
```

雖然 root 已是主 runtime，但 storage key 暫時不要改。
改 storage key 會增加 migration 風險。

目前 defaultState 包含：

- bond
- trust
- mood
- energy
- spamScore
- chatHistory
- defense
- touchFatigue
- lastTouchAt
- lastRejectAt
- blockedTouchCount
- lastSeenAt
- memories
- habitatTraces
- memorySchemaVersion
- emotionalMemories
- safeHarborMode
- activeCompanionId
- unlockedCompanionIds
- battleRecord
- explorationProgress

商業版後續可新增 per-companion state，但必須另開 GROUNDWORK TASK_PACK 並做 migration。目標欄位包含：

- per-companion relationship state
- travel memories / 旅痕
- chapter unlock progress
- companion persona profile overrides

---

## 5. Current Runtime Roster

目前 root 預設 active companion：

```js
greyshade-cat
```

目前 default unlocked companions：

```js
greyshade-cat
flame-flicker
ice-talon
stone-shard
vine-twist
crystal-rabbit
```

其中：

- `greyshade-cat` 是第一個已驗證 runtime carrier 與 default first-session companion；不是 RaphaelCore 本體，也不是永久唯一中心。
- `flame-flicker`、`ice-talon`、`stone-shard`、`vine-twist`、`crystal-rabbit` 是目前 root 可測的五元守護 runtime-ready 陣容。
- `flametail-fox`、`crystal-seahorse`、`verdant-stag`、`thunder-pup`、`star-energy-boarlet` 等仍存在於 registry，但 runtime readiness 不同，不能混為同一層級。`flametail-fox` 的舊靜態圖已因內容錯誤移除，需新 approved asset 才可恢復 static/runtime readiness。

---

## 6. Evolution Canon Migration

### 6.1 Current Legacy

現有 `evolutionLines.js` 使用五階標籤：

- Baby / 幼年期
- Child / 成長期
- Adult / 成熟期
- Perfect / 完全體
- Ultimate / 究極體

完整五階線目前主要在 `thunder-pup-line`。

這是 R2 prototype legacy。

### 6.2 New Canon

最新正式角色制為三階：

- Stage 1：初醒夥伴
- Stage 2：共鳴成熟體
- Stage 3：終局覺醒體

### 6.3 Migration Rule

以 ThunderPup 為例。

Legacy R2 Prototype：

> 雷霆幼狼 → 嘯雷狼 → 蒼雷狼 → 天雷狼君 → 太雷狼皇

New Canon Target：

> 雷霆幼狼 → 雷鳴蒼狼 → 天狼雷皇

對應建議：

| Legacy 階段 | New Canon 處理 |
|---|---|
| 雷霆幼狼 | Stage 1 |
| 嘯雷狼 | Stage 2 素材 |
| 蒼雷狼 | Stage 2 主體素材 |
| 天雷狼君 | Stage 3 素材 |
| 太雷狼皇 | Stage 3 主體素材 |

### 6.4 Runtime Handling

短期：

- 保留 legacy Codex 顯示。
- 在文件中標記為 prototype。
- 不新增更多五階正式線。

中期：

- 重構 evolutionLines 為三階資料。
- Codex UI 改顯示三階 canon。
- legacy 名稱轉入 lore、技能、稱號或歷史型態。

長期：

- gameplay 進化若實作，必須服從三階 canon。
- 不得回到五階量產。

---

## 7. Heart-core Fracture / 心核裂變

### 7.1 Status

心核裂變相關驗收條款已存在於 acceptance policy。
因此裂變不可再被視為純世界觀幻想或純未來靈感。

正式處理：

> 心核裂變列為 Experimental / Safety-Gated Feature。

如果 runtime 已接入任何裂變流程，必須補文件。
如果尚未有完整 runtime flow，也不得以未完成為理由移除安全條款。

### 7.2 Required Documentation

心核裂變必須補齊以下文件：

- 觸發條件
- 是否與 battle / exploration / Soul Talk / boundary 連動
- 是否留下 scars
- 是否影響 Persona Tree
- 是否影響 trust / bond / stability
- 修復路徑
- 中止出口
- 夥伴不歸咎玩家的修復台詞
- 是否存在不可逆後果
- 是否符合安全紅線

### 7.3 Expansion Guardrail

心核裂變可以存在，但不得無限制擴張。

禁止：

- 做成懲罰性壞結局
- 做成玩家一失誤就永久失去夥伴
- 做成強制進化按鈕
- 做成普通黑化變身
- 讓夥伴責怪玩家
- 沒有修復路徑
- 沒有中止出口

---

## 8. Battle Canon

目前 battle 應統一稱為：

> Emotional Standoff／情緒對峙（內部詞）

玩家端 UI 應稱為：

> 穩住裂隙

不是：

- 普通 RPG 戰鬥
- 怪物 HP 歸零
- 刷怪
- 敵人消滅

戰鬥目標是：

- 穩定心核
- 建立邊界
- 回收記憶
- 降低雜訊
- 讓夥伴與玩家共同穿越裂隙情緒

玩家端行動詞優先使用：

- 穩住
- 設界
- 共鳴
- 退一步

禁止新增：

- 傳統暴力勝利敘事
- 大量刷怪
- 純戰力數值膨脹
- 強制爆發按鈕

---

## 9. Current Do-Not-Expand List

即使某些功能已存在，也不應繼續無限擴張：

- 不擴張成完整 RPG 戰鬥
- 首版不擴張成多角色隊伍系統
- 不擴張成抽卡
- 不擴張成五階全角色量產
- 不擴張成大量 boss 實戰
- 不擴張虛空領主為早期戰鬥主線
- 不讓 Codex 壓過棲地與夥伴互動
- 不讓探索變成純資源農場
- 不恢復 `/r2/` 作為主開發入口，除非 human 明確要求

核心仍然是：

> 一隻有邊界、會記得、會留下痕跡的心核夥伴。

未來可做同行／組隊戰鬥，但必須是章節後期擴充，目標是共同旅途、角色間記憶與事件分歧，不得做輸出排行、屬性刷關、農裝或每日必派遣。

---

## 10. Art Runtime Standard

新角色統一採用：

- Illustrated / painterly / high-detail
- 512×512 master frame
- transparent PNG
- 禁止白底
- 禁止 baked-in UI
- 禁止文字
- 禁止場景背景
- 禁止 pedestal / catalog frame
- anchor bottom-center，x = 0.5，y = 1
- sampling：linear + mipmaps
- scale basis：frameHeight
- sheet max edge：4096 px
- grid 必須整除

目前不再以 chunky pixel art 作為新角色主規格。
舊像素規格可視為 legacy，不應覆蓋新角色管線。

---

## 11. Runtime Acceptance Criteria

任何功能都必須回答：

> 它是否讓玩家更清楚感覺到：牠有邊界、會記得、會因共同經歷而改變？

最低驗收：

1. 玩家回來時，角色能根據上次互動產生不同反應。
2. 玩家過度互動時，角色能以身體語言或行為表達壓力。
3. 玩家尊重拒絕後，後續互動能留下正向痕跡。
4. 棲地能反映最近關係狀態。
5. 記憶不是列表，而是關係證據。
6. 高 bond 不等於角色無限討好玩家。
7. 沒有登入懲罰。
8. 沒有 FOMO。
9. 沒有強制覆寫角色意志。
10. Codex / battle / exploration 都必須回到夥伴關係與棲地痕跡。
11. root 主線不得被誤導回 `/r2/` 子資料夾開發。
12. 離線或未開遊戲期間若產生旅痕，玩家回來時不得被責備、不得被提示「錯過」，且不得給大量離線收益。

---

## 12. Future Systems: 旅痕與同行

### 12.1 旅痕 / Offline Adventure

旅痕是未來回歸系統，不是放置遊戲。玩家下線或未開遊戲時，夥伴可以獨自或與已相遇夥伴短程外出；玩家下次回來時，收到簡短回報、旅途記憶或棲地痕跡。

旅痕可使用 Linkara 七區作短事件舞台：東南熔爐丘陵區、中央輝耀核心區、北部翠綠平原區、南港、月湖營地、秘境山脈核心、西南潮汐邊疆區。旅痕回報只描述「去了哪裡、遇到什麼、留下什麼痕跡」，不做長篇報告或任務壓力。

規則：

- 不懲罰離線。
- 不做登入 streak。
- 不做每日派遣。
- 不用離線時長換大量資源。
- 不讓 safetyShield 或痛苦輸入產生旅痕獎勵。
- 旅痕以短句、痕跡與小事件呈現，不用長篇報告壓迫玩家。

### 12.2 同行／組隊戰鬥

組隊戰鬥可保留為未來章節後期方向，但不是首版範圍。若實作，隊伍的主要產物應是共同旅痕、角色間對話與章節事件，不是傳統 RPG 戰力。

禁止：

- 輸出排行。
- 屬性刷關。
- 掉寶農裝。
- 沒派遣就落後。
- 把 companion 當隊伍位置或皮膚。

---

## 13. 文件遷移建議

需要更新或對齊的文件：

- `R2_EVOLUTION_SYSTEM.md`：從五階／四階改為三階 canon + legacy 對照。
- `R2_SCOPE_V1.md`：修正「展示五階段或四階段」說法。
- `R2_CANON_REGISTRY.md`：補入 root promoted status 與三階 canon。
- `CLAUDE.md`：已大致對齊 root 主版本，但可補 `/r2/ legacy` 一句。
- `AGENTS.md`：補 root active runtime，不再指向 `/r2/`。
- `ACCEPTANCE.md`：保留 `nexusLinkR2State:v1`，但測試網址應明確為 `http://localhost:5173/`。
- `evolutionLines.js`：短期標記 legacy，中期改三階資料。
- `codexController.js`：短期標示 prototype，長期改三階展示。

---

## 14. Runtime Canon 結語

目前 Nexus Link 的主線不是 `/r2/`，而是 root White Lab。
它繼承 R2 prototype 的核心系統，並已持續在 root 上開發。

後續工作不是「復原 R2」，而是：

1. 承認 root 是主版本。
2. 控制功能膨脹。
3. 把 legacy 五階資料遷移成三階 canon。
4. 補齊心核裂變安全文件。
5. 讓所有系統重新服務核心情感契約。

最終判斷：

> 如果一個功能不能讓玩家感覺到牠有邊界、會記得、會因共同經歷而改變，就不應繼續擴張。
