# 心核迴旋戰 Agent 執行計畫（Owner 授權草案）

> **Status:** `OWNER DRAFT / NOT YET RUNTIME AUTHORIZATION`  
> **Date:** 2026-07-25  
> **Owner:** Terence  
> **Purpose:** 給 Cursor / Codex / Claude Code 等 agent 的分階段指令，用來把 Nexus Link 從「可聊＋原型遠征」推進到「日常聊天養關係 + 關卡闖關 + 迴旋對決」。  
> **Authority:** 服從 `NEXUS_LINK_MASTER_CANON_v3.1.md`、`CLAUDE.md`、`AGENTS.md`、`ACCEPTANCE.md`。本檔不是 Canon；實作前每個 TASK_PACK 仍須 Gate 2 人核可。  
> **Do not:** 把本檔解讀成「一次做完整款遊戲」或「可跳過 human gate」。

---

## 0. 產品一句話（所有 agent 必須背）

> 平常與心核夥伴聊天、照顧、留下痕跡以培養感情；想玩時，把默契／信任／羈絆投影成「心核化身」，用拉動發射＋場中旋轉撞擊去闖關與對決。心域遠征保留為出門取材與旅途回報。變強的感覺來自關係投影，不是獨立練等或抽卡。

雙層架構：

```text
日常層：棲地 / Soul Talk / 觸碰 / 照顧 / 回歸回聲
玩法層：心核迴旋戰（闖關 PVE + 對決） + 心域遠征（出門／取材，保留）
回寫層：旅痕、微光、一句話、有限 growth evidence
禁止層：每日必打、FOMO 紅點、抽卡稀有殼、獨立 ATK 成長樹、把夥伴本人當武器砸爆
```

---

## 1. 絕對紅線（違反即停工回報）

1. 不引入 React / Vue / TypeScript / npm / build step / 後端 / LLM API。
2. 不改 `STORAGE_KEY`；任何 save schema 變更必須獨立 GROUNDWORK TASK_PACK + Owner 核可。
3. 不做抽卡、稀有度戰力、皮膚商城、每日登入、連續打卡、紅點逼戰。
4. 聊天不得直接 `Impact += n`；戰鬥強度只能是關係狀態的**投影**。
5. 出場單位必須是「心核化身／共鳴核」，不是把夥伴本人發射去撞爆。
6. 夥伴可因疲勞／低信任／邊界受傷而**拒絕出場**；不得強制。
7. 敗北不得懲罰關係、不得鎖死進度、不得無法挽回壞結局。
8. D2 safety terminal、七條安全紅線、三契約不可削弱。
9. 心域遠征維持非農場：擊殺／拾取不得直接刷 bond／trust。
10. 未經 Owner 明示，不可 `git commit` / `git push`（若 Owner 在該 TASK_PACK 明示可提交，才可）。

---

## 2. 關係 → 戰鬥投影表（鎖定）

玩家可見戰鬥詞；底層只讀既有關係／狀態，不另開永久 ATK 帳本。

| 戰鬥顯示 | 來源（只讀投影） | 禁止 |
|---|---|---|
| 衝擊 Impact | bond／羈絆 × 近期共同行動完整度（探索／遠征／對峙／迴旋戰完成） | 純聊天直接加 Impact |
| 旋轉 Spin | sync／默契穩定度、近期節奏一致 | 用登入天數灌 Spin |
| 韌性 Guard | trust + 邊界健康 | 低信任卻高攻擊的歪樓 |
| 爆發 Burst | 高張力共同記憶（對峙／遠征高峰／重要微光） | 商城買爆發 |
| 過熱 Overheat | touchFatigue／連續開戰／低 energy | 付費消過熱 |

公式實作時必須：

- 純函式：`projectOrbitCombatStats(companionRelationship, recentEvidence, vitals) -> stats`
- 可單測、可 replay
- UI 文案強調「這是你們現在有多合」，不是「角色等級」

---

## 3. 戰鬥手感契約（陀螺 × 彈珠）

### 3.1 共用核心（一局 60–90 秒）

1. 選化身配置（外環／核心／軌跡）— 外觀綁夥伴，數值綁投影  
2. **拉動發射**（Beyblade）：拉力決定初速與進場角  
3. **場中旋轉撞擊**：轉速衰減、碰撞擊退、擦邊可加速  
4. 勝負：  
   - 闖關：清雜訊結／撐波次／抵達錨點  
   - 對決：撞出場，或對方穩定性歸零（玩家語言：**核散／失穩／退場**，可保留爽感）  
5. 結局對齊既有情緒契約：`stabilized` / `recovered` / `retreated` / `overwhelmed_but_safe`（可映射，不要改成 win/lose 羞辱）  
6. 回棲地：一句第一人稱短評 + 可選旅痕／微光；零 FOMO

### 3.2 闖關（怪物彈珠節奏）— 優先做

- 軌道機關、雜訊結、護盾柱、狹窄邊界  
- 章節式節點圖；內容消耗型進度，不是每日任務  
- 三星若做，只能影響「記憶清晰度／微光品質」，不鎖成長

### 3.3 對決（戰鬥陀螺節奏）— 次優先

- 先人機／異步幽靈  
- 即時網路 PvP **不做**，除非 Owner 另開大型 GROUNDWORK（會撞技術邊界）

### 3.4 遠征定位（保留）

- 遠征 = 出門取材、旅途決策、帶回微光／軌道素材／第一人稱報告  
- 迴旋戰 = 短局手感與關卡進度  
- 二者互補，遠征不刪、不降成純大廳按鈕

---

## 4. Agent 總指揮提示詞（每次新對話先貼）

把下面整段貼給新的 agent 當 system／首則指令：

```text
你是 Nexus Link（心核連結）的實作 agent。Owner 是 Terence。

專案定位：情緒棲地型 AI 夥伴養成遊戲（Web / Vanilla JS / Pixi v8 CDN / 無 build / 無 LLM runtime）。
不是電子寵物、不是抽卡、不是純聊天、不是傳統 RPG 練等。

當前產品目標（Owner 2026-07-25）：
1) 保留並加深「平常聊天／照顧養感情」；
2) 保留心域遠征（出門取材與旅途回報）；
3) 新增「心核迴旋戰」：戰鬥陀螺（拉動發射＋旋轉撞擊＋出場／核散）× 怪物彈珠（關卡闖關）；
4) 戰鬥數值（Impact/Spin/Guard/Burst/Overheat）只能由默契／信任／羈絆／共同經歷投影，禁止獨立 ATK 成長樹；
5) 出場的是心核化身，不是把夥伴本人當武器。

必讀（開工前 Gate 0）：
- CLAUDE.md
- AGENTS.md
- ACCEPTANCE.md
- docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md（相關段）
- docs/agent/AI_EXECUTION_LEDGER.md（相關 lane 最新條目）
- docs/agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md（本計畫）
- docs/agent/AI_WORKFLOW.md + docs/agent/TASK_TEMPLATE.md
- 若動 Soul Talk / Raphael：docs/handoff/RAPHAEL_AI_HANDOFF.md + RAPHAEL_AI_STATUS.yaml
- 若動養成：docs/design/COMPANION_GROWTH_CONTRACT_V1.md
- 若動遠征：docs/raphael/RAPHAEL_EXPEDITION_EVAL_CONTRACT.md

工作方式：
- 嚴格 Gate 0→6；Gate 2 與 Gate 6 必須等人核可。
- 一次只做本對話指定的單一 TASK_PACK，禁止「順便做完整款遊戲」。
- 只改 Allowed files；不引入依賴；不動地基除非該包標 GROUNDWORK 且已核可。
- 完成後：node --check、相關 qa harness、對照 ACCEPTANCE／紅線自評、追加 AI_EXECUTION_LEDGER。
- 禁止宣稱 public-launch ready；自動化綠燈 ≠ 人測完成。

若需求與三契約／七紅線／本計畫紅線衝突：停止並用繁體中文回報 Owner，不要自行繞過。
回覆語言：繁體中文（台灣）。對初階開發者解釋時要清楚、有註解。
```

---

## 5. 分階段 TASK_PACK（依序執行，一次一包）

> 使用方式：Owner 每次只複製 **一個** TASK_PACK 給 agent，等該包合併／驗收後再開下一包。

---

### PACK R0 — 心核迴旋戰設計契約落地（Docs only）

```
====================================================
NEXUS LINK TASK
====================================================
Task name:
  R0 — Heartcore Orbit Battle design contract (docs only)

Goal:
  把 Owner 核准的「聊天養關係 + 遠征保留 + 陀螺×彈珠迴旋戰 + 關係投影數值」
  寫成可驗收契約與術語表，供後續實作服從。不改 runtime。

Layer: EXPERIENCE（docs）／不碰 runtime

Allowed files:
  - docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md [NEW]
  - docs/strategy/PACK_HEARTCORE_ORBIT_BATTLE.md [NEW]
  - docs/design/BALANCE_SHEET.md（僅新增 Orbit 常數區段，若需要）
  - docs/agent/AI_EXECUTION_LEDGER.md
  - docs/README.md（索引一行）

Forbidden files:
  - src/**
  - index.html
  - styles.css
  - assets/**
  - any save/schema files

Non-goals:
  - 不實作戰鬥
  - 不改遠征引擎
  - 不改 RaphaelCore
  - 不做 PvP 網路設計細節

Required pre-read:
  - docs/agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md
  - docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md
  - docs/production/NEXUS_LINK_NEXT_GAMEPLAY_SYSTEMS_SPEC.md
  - docs/raphael/RAPHAEL_EXPEDITION_EVAL_CONTRACT.md
  - docs/design/COMPANION_GROWTH_CONTRACT_V1.md
  - CLAUDE.md / AGENTS.md / ACCEPTANCE.md

Acceptance:
  - 契約含：雙層架構、化身制、投影表、闖關／對決流程、結局映射、紅線、非目標
  - 明確寫死：無獨立 ATK 樹、無抽卡、無每日必戰、遠征保留
  - 術語：衝擊／旋轉／韌性／爆發／過熱／核散／退場／心核化身
  - ledger 追加 Lane 1 條目

CRITICAL:
  - Gate 2 等人核可後才寫檔
  - 不 commit，除非 Owner 明示
====================================================
```

---

### PACK R1 — 單軌道可玩原型（無存檔擴充）

```
====================================================
NEXUS LINK TASK
====================================================
Task name:
  R1 — Orbit battle single-arena prototype (no schema bump)

Goal:
  做一個可從現有 UI 進入的單軌道原型：拉動發射、旋轉、撞擊、出場／核散；
  一個訓練假對手；數值暫用 projectOrbitCombatStats 讀現有 bond/trust/energy 等；
  結束回一句短評。不上線完整關卡圖、不改 STORAGE_KEY。

Layer: EXPERIENCE（若需 index.html 入口則標 GROUNDWORK 子項並分開核可）

Allowed files（開工計畫可微調，但必須列清）：
  - src/orbit/ [NEW dir] orbitEngine.js, orbitPhysics.js, orbitStatsProjector.js, orbitOutcomes.js
  - src/ui/orbitBattleController.js [NEW]
  - src/data/orbit/trainingArena.js [NEW]
  - styles.css（僅 orbit 區塊）
  - index.html（僅在 Owner 核准 GROUNDWORK 時加最小入口）
  - docs/qa/orbit-battle-prototype-cases.mjs [NEW]
  - docs/design/BALANCE_SHEET.md
  - docs/agent/AI_EXECUTION_LEDGER.md

Forbidden:
  - src/state/saveManager.js
  - STORAGE_KEY 變更
  - src/ai/**（除非只讀）
  - assets/** 大量新美術（可用程序化圓／環）
  - 網路 PvP
  - 抽卡／商店

Non-goals:
  - 不做 5 關地圖
  - 不做即時對戰
  - 不把結果寫入 growth evidence（下一包再做）
  - 不刪除遠征

Required pre-read:
  - docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md
  - src/engine/battleEngine.js（結局語意對齊）
  - src/state/companionStateSchema.js（只讀投影來源）
  - CLAUDE.md §3 技術邊界

Acceptance:
  - 手機寬 390 可單指拉動發射
  - 一局可在 90 秒內結束
  - 四種結局可映射且 retreat 永遠可用
  - projector 單測覆蓋：低信任→低 Guard；高疲勞→高 Overheat；聊天-only 夾具不提升 Impact
  - node --check 全過；新 harness 全過
  - 不引入 npm

CRITICAL:
  - Gate 2 核可後才改 code
  - 程序化圖形優先，避免未核准資產
====================================================
```

---

### PACK R2 — 五關彈珠式闖關 + 節點圖

```
====================================================
NEXUS LINK TASK
====================================================
Task name:
  R2 — Five-stage marble route + node map

Goal:
  在 R1 引擎上加 5 個關卡節點（機關差異），通關解鎖下一節點與一段短敘事／微光；
  進度若需持久化，另開最小 GROUNDWORK（normalize + veteran skip），否則先 session-only 並在報告標明。

Layer: EXPERIENCE + 可能的 GROUNDWORK（存檔欄位須分開核可）

Allowed files:
  - src/orbit/**
  - src/data/orbit/stages/*.js [NEW]
  - src/ui/orbitMapController.js [NEW]
  - styles.css（orbit map）
  - docs/qa/orbit-stage-cases.mjs [NEW]
  - docs/design/BALANCE_SHEET.md
  - docs/agent/AI_EXECUTION_LEDGER.md
  - 若 Owner 核准 schema：src/state/defaultState.js, store.js normalize*（最小欄位）

Forbidden:
  - 每日任務／體力鐘點強迫
  - 三星鎖死養成
  - 戰力編隊
  - PvP

Acceptance:
  - 5 關可依序解鎖
  - 每關目標可讀（清結／撐住／抵達）
  - 失敗可撤退回棲地，進度不倒退到不可玩
  - 與遠征入口並存、文案不互相覆蓋
====================================================
```

---

### PACK R3 — 對決模式（人機／幽靈）

```
====================================================
NEXUS LINK TASK
====================================================
Task name:
  R3 — Orbit duel vs CPU / ghost

Goal:
  在同一物理核心上加人機對決：雙化身同場，拉動發射後旋轉撞擊，
  以出場或核散決勝負；可選錄製玩家上一場為幽靈對手。不做網路同步。

Allowed files:
  - src/orbit/**
  - src/ui/orbitDuelController.js [NEW]
  - src/data/orbit/duelProfiles.js [NEW]
  - docs/qa/orbit-duel-cases.mjs [NEW]
  - styles.css
  - docs/agent/AI_EXECUTION_LEDGER.md

Forbidden:
  - WebSocket / 多人对戰伺服器
  - 排行榜逼戰
  - 賭上永久關係值的勝負

Acceptance:
  - CPU 可完賽
  - 勝負不直接 ±bond；最多寫 session 短評／可選 evidence（需符合 Growth 契約）
  - Overheat 連續開戰會拒戰或強迫休息
====================================================
```

---

### PACK R4 — 與遠征／記憶／Growth 匯流

```
====================================================
NEXUS LINK TASK
====================================================
Task name:
  R4 — Connect orbit rewards to expedition glimmers + growth evidence

Goal:
  遠征可產出軌道微光／素材（非戰力幣）；迴旋戰結算可留下旅痕與有限 lived evidence；
  成為非對峙 readiness 路徑的合法 source 之一（對齊 COMPANION_GROWTH_CONTRACT，不跳 G4）。

Required pre-read:
  - docs/design/COMPANION_GROWTH_CONTRACT_V1.md
  - docs/raphael/RAPHAEL_EXPEDITION_EVAL_CONTRACT.md
  - docs/architecture/ADR-003-MEMORY_SINGLE_TRUTH_PROJECTION.md

Hard constraints:
  - E-FARM 不變：拾取／擊殺不刷 bond
  - evidence 必須 immutable provenance + companionId
  - 安全中止／拒絕／休息／存檔失敗 = 零 evidence
  - 不實作 G4 stage offer／形態 swap

Acceptance:
  - 遠征→微光→迴旋戰進場 路徑可測
  - 迴旋戰完成可出現 Memory 可見證據（若契約允許）
  - 既有 expedition / growth harness 不回歸
====================================================
```

---

### PACK R5 — 打磨與回歸（手感／文案／QA）

```
====================================================
NEXUS LINK TASK
====================================================
Task name:
  R5 — Orbit feel polish + regression pack

Goal:
  手感（拉力曲線、撞擊、轉速）、i18n 四語關鍵字、無障礙、390×844 手動路徑、
  接入或平行於 web-release-gate 的最小自動檢查；更新 ACCEPTANCE 對照條。

Non-goals:
  - 不加新模式
  - 不開 G4
  - 不宣稱上架

Acceptance:
  - 關鍵 harness 全綠
  - ACCEPTANCE 新增 Orbit 小節自評
  - ledger 標明剩餘：真人測、真機、法務仍 open
====================================================
```

---

## 6. 與「完成整款遊戲」的邊界（務必讀）

本計畫 **只授權** 把「第二玩法層（迴旋戰）+ 遠征匯流」做到可玩垂直切片。  
下列仍屬遊戲完成度的其他主線，**不在本檔自動授權**，需 Owner 另開包：

| 主線 | 狀態提醒 |
|---|---|
| First Session / Pack1 真人 5 人測 | 仍 open |
| Raphael private-blind 3×20 | not_run |
| 真機 D1/D2/D3/D6、法務／商店文案 | not_run |
| Companion Growth G3.2 / G4 | 未實作；R4 只接 evidence，不接覺醒儀式 |
| Ironflow／章節相遇內容擴充 | 另包 |
| 商業包裝／Steam | 另包 |

「完成這款遊戲」對 agent 的正確解讀是：

```text
完成 Owner 當次貼上的那一個 TASK_PACK
→ 驗證 → 寫 ledger → 停下等人
而不是自主連做 R0–R5 或宣稱商業完成。
```

---

## 7. Owner 操作手冊（Terence 怎麼用）

1. 先貼 **§4 總指揮提示詞** 開新 agent。  
2. 再貼 **唯一一個** TASK_PACK（從 R0 開始）。  
3. agent 交出 Gate 1 計畫後，你回：`Gate 2 核准，照計畫做` 或要求修改。  
4. 做完驗收，再開下一包。  
5. 需要提交時，另下明示：`請依 cloud/repo 規則開 PR；commit message 用…`。  
6. 若 agent 想跳去「做完整遊戲／加 PvP／加抽卡」——直接打回。

建議第一句核准語：

```text
核准執行 PACK R0（僅文件）。
Gate 2 通過。完成後不要自動開 R1，先把契約 diff 給我看。
```

---

## 8. 給「只會貼一句話」時的壓縮指令

若只能貼一段：

```text
讀 docs/agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md，
只執行其中的 PACK R0（docs only）。
遵守 CLAUDE.md／AGENTS.md／Gate 0–6。
完成後停下，給我契約摘要與檔案清單，等我核准再談 R1。
回覆用繁體中文。
```

R0 過後改貼：

```text
讀 docs/agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md 與
docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md，
只執行 PACK R1 原型。先交 Gate 1 計畫等我點頭。
```

---

## 9. Ledger 追加模板（每包結束）

```md
### YYYY-MM-DD - <agent> - Heartcore Orbit PACK Rx

- Status: `COMPLETED` | `VERIFIED` | `BLOCKED`
- Branch / commit: `<branch>` / `<sha or uncommitted>`
- Scope: PACK Rx …
- Work performed: …
- Verification: …
- Problems / risks: …
- Next safe action: PACK R{x+1} only after Owner Gate 2
- Required reading: docs/agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md
```
