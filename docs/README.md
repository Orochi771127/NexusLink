# NexusLink Docs Index / 文件地圖

This folder contains the planning and production references for NexusLink.
本資料夾即為《Nexus Link / 心核連結》目前的正式企劃案、工程規格、製作流程與留存文件集合。

> 有 40+ 份文件，容易「不知從何讀起」。本索引解決那個問題：**哪份是什麼、誰是權威、多久更新一次。**
> 更新：2026-07-10（v3，新增正式五元守護外觀鎖定與物種動作翻譯入口）。

---

## 0. 權威階層（衝突時誰說了算）

```
strategy/NEXUS_LINK_MASTER_CANON_v3.1.md   ← 最高戰略上位法（為什麼存在、賣什麼、永不變成什麼）
        │  只在「策略轉向」時動
        ▼
../CLAUDE.md / ../AGENTS.md                 ← 可動的作業手冊（紅線、授權分級、施工協定）
        │  流程改善時可動；不得與 Master Canon 衝突
        ▼
agent/AI_EXECUTION_LEDGER.md                ← 「當前真實狀態」唯一真相來源（SSOT）
        │  每次工作完成就追加
        ▼
其餘 docs/**                                 ← 設計細節、規格、歷史參考
```

**黃金守則**：遠端分支或歷史測試報告 ≠ 當前 runtime 狀態；一切以 checked-out worktree + 執行分類帳最新條目為準。

---

## 1. Start Here（一定要先讀）

| 文件 | 用途 | 更新頻率 |
|---|---|---|
| `../CLAUDE.md` | 開發憲法：三契約、七紅線、技術邊界、授權分級 | 流程改善時 |
| `../AGENTS.md` | 跨 AI 協作入口（與 CLAUDE.md 對齊） | 流程改善時 |
| `../CONTRIBUTING.md` | 一頁上手：Gate 0–6 + 新 AI 六步 + 完成定義 | 流程改善時 |
| `../ACCEPTANCE.md` | 可驗收條件（每個功能對照自評） | 每 release |
| `strategy/NEXUS_LINK_MASTER_CANON_v3.1.md` | 最高戰略：定位、賣點、商業紅線 | 策略轉向時 |
| `agent/AI_EXECUTION_LEDGER.md` | 當前三線狀態 SSOT（Engineering / Art / Raphael） | 每次工作 |
| `design/COMPANION_GROWTH_CONTRACT_V1.md` | 心核夥伴養成／三階覺醒的現行設計與驗收契約（G1 session-only、G2 per-companion state 已接入；G3+ 尚未實作） | 每次動養成 |
| `design/BALANCE_SHEET.md` | 所有調校數值的單一可調表（本輪新增） | 每次動數值 |
| `production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md` | 商業 UI/UX 執行入口 | 商業切片期 |

進一步的規劃連續讀物（規劃脈絡，非權威）：
`nexuslink-development-direction.md`（產品北極星）→ `nexuslink-design-brief.md`（一頁定位）→ `nexuslink-game-plan.md`（實作面）→ `nexuslink-implementation-roadmap.md`（里程碑）→ `nexuslink-production-backlog.md`（工作包）→ `nexuslink-sprint-01.md`（首片）→ `nexuslink-first-habitat-qa.md`（首輪 QA）。

---

## 2. 依主題分類

- **戰略 / 商業**：`strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`、`strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`、`research/MARKET_EVIDENCE_AI_COMPANION.md`、`production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`。
- **產品／架構審查（Proposed，未升格 Canon）**：`audits/PRODUCT_TENSION_AND_STATE_AUTHORITY_REVIEW.md`、`audits/FIRST_SESSION_MOTIVATION_REVIEW.md`、`strategy/NEXUS_LINK_REPAIR_SEQUENCE.md`、`strategy/PACK2_RELATIONSHIP_AUTHORITY_MIGRATION.md`、`strategy/PACK2_PHASE3_MIRROR_DECISION.md`、`strategy/PACK5_TERMINOLOGY_GLOSSARY.md`、`strategy/PACK_QUALITATIVE_BOND_PRESENTATION.md`、`strategy/PACK_NONCONFRONTATION_CHAPTER_GROWTH.md`、`strategy/PACK_INITIATIVE_BUDGET.md`、`strategy/PACK_EXPEDITION_LOOT_SEMANTICS.md`；Pack 1 §J 證據：`qa/PACK1_SJ_ACCEPTANCE_EVIDENCE.md`。
- **音訊**：`audio/BGM_ASSET_MAP.md`（BGM 資產盤點與 runtime 場景對照）、`../assets/audio/README.md`。
- **AI 協作流程（作業核心）**：`agent/AI_WORKFLOW.md`（6-Gate 全文）、`agent/TASK_TEMPLATE.md`、`agent/REVIEW_CHECKLIST.md`、`agent/AI_EXECUTION_LEDGER.md`（**當前狀態 SSOT**）、`agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md`（**心核迴旋戰分階段 agent 指令；Owner 草案，逐包 Gate 2 核可**）。
- **架構 / 檔案治理**：`architecture/FILE_OWNERSHIP.md`、`architecture/ADR-002-MULTI_COMPANION_RELATIONSHIP_AUTHORITY.md`（Pack 2 + Pack 2.5 guardrails）、`architecture/ADR-003-MEMORY_SINGLE_TRUTH_PROJECTION.md`（Pack 3）、`architecture/ADR-004-DYNAMIC_CHAPTER_ENCOUNTER_RESOLVER.md`（Pack 4）、`architecture/RAPHAEL_CORE_JS_V1.md`、`architecture/COMPANION_PREFERENCE_PERSISTENCE_V1.md`、`architecture/RAPHAEL_GATEWAY_SERVER_V1.md`、`architecture/PACKAGING_ROADMAP.md`、`architecture/RUNTIME_MAP.md`（⚠️ NEEDS UPDATE：對照現行程式驗證舊 storage/runtime 陳述）。
- **設計規格**：`design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`、`design/COMPANION_GROWTH_CONTRACT_V1.md`（**夥伴養成設計／驗收 SSOT；G1 session-only、G2 per-companion state 已接入，G3+ 尚未實作**）、`design/BALANCE_SHEET.md`（**數值 SSOT**）、`rfc/RFC_2_5D_HABITAT_RENDERER.md`。`r2-canon/*` 為歷史詳規；只有被現行文件明確引用且不衝突的部分才能沿用。
- **品保 / 測試**：`testing/MANUAL_TEST_CHECKLIST.md`、`testing/PRIVATE_TEST_SCRIPT.md`、`testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`、`qa/WEB_RELEASE_EVIDENCE.md`、`qa/RAPHAEL_CORE_JS_V1_TEST_PROTOCOL.md`、`qa/bgm-integration-cases.mjs`、`qa/resonance-invite-authority-cases.mjs`（Pack 2）。
- **資產 / 美術管線**：`art/STAGE1_CHARACTER_ASSET_INDEX.md`（正式五元守護入口）、`art/character-locks/*`（外觀權威）、`art/SPECIES_MOTION_TRANSLATION.md`（鳥／海馬／鹿／狐／虎動作翻譯）、`assets/CHARACTER_ASSET_PIPELINE.md`、`assets/COMPANION_ANIMATION_CATALOG.md`、`assets/COMPANION_ASSET_AUTOMATION.md`、`assets/SKILL_ORCHESTRATED_COMPANION_PIPELINE.md`、`asset-pipeline.md`（⚠️ NEEDS UPDATE：64×64 步驟需與現行 illustrated 512 政策分開）、`prompts/*`。
- **交接歷史**：`handoff/*` — 各輪 AI 交接；**歷史軌跡非當前狀態**，當前狀態一律查執行分類帳。
- **歷史參考（⚠️ 僅供歷史，保留勿刪）**：`legacy-bible/**`、早期 v0.3/v1 規劃文件、`r2-canon/**`（除非現行文件明確引用某段，否則 REFERENCE ONLY）。

### 中文完整企劃留存
- `NexusLink_Full_Game_Architecture_v1.md` — 企劃案 v1.0：情緒棲地型 AI 夥伴養成遊戲完整架構書。
- `NexusLink_Phase1_Engine_Refactor_Report.md` — 第一階段引擎重構總結（DOM/PixiJS 分層、固定投影、時間引擎、2.5D、state 信任邊界）。
- 其他：`Asset_Generation_Plan.md`、`NexusLink_Emotional_Habitat_Plan.md`、`NexusLink_HomeScreen_DesignSpec_v1.md`。部分舊檔可能有編碼問題，實作決策優先看 `nexuslink-*` 與 `design/`。

---

## 3. 更新節奏（Cadence）

| 何時 | 更新什麼 |
|---|---|
| 每次工作完成 | `agent/AI_EXECUTION_LEDGER.md`（對應 lane） |
| 每次動數值 | `design/BALANCE_SHEET.md` |
| 每個 TASK_PACK | 相關 handoff / 規格文件 |
| 每 release | `../ACCEPTANCE.md`、`testing/*`、`strategy/STEAM_DEMO_*` |
| 策略轉向 | `strategy/NEXUS_LINK_MASTER_CANON_v3.1.md` |

---

## 4. 已知文件債（待收斂）
- **歷史 canon 仍留在樹中**：`strategy/` 是現行最高權威；`r2-canon/` 與 `legacy-bible/` 都是歷史參考。主題已有 ACTIVE contract 時一律以現行 contract 為準；實體歸檔待核可，搬移前列清單報備（不可逆）。
- **handoff 增生**：當前狀態只信執行分類帳，不要逐份讀 handoff。
- **文件漂移**：程式常跑在文件前面。發現漂移就地修並在分類帳註記。

---

## 5. Current Scope Rule（現行範圍守則，已更新）

當前主線是把**第一次見面（First Session Flow）做對 + 既有系統加深**：

- 一個棲地（月湖）、一位主夥伴（灰影貓）、觸碰/擁抱/Soul Talk/照顧、持久情緒狀態、可信任的已註冊動畫、至少一層分離的棲地 FX。
- **戰鬥已存在且已改造為「穩住裂隙」情緒對峙**（非傳統打怪；四結局不懲罰）。本輪工作是**加深**它（意圖/相位/經濟），不是重做，也不是回退成 HP 戰鬥。

> 過期守則已修正：舊版寫「Do not expand into battle … until first loop passes QA」。事實上情緒對峙戰鬥早已實裝並通過首輪。**不要**據舊句把戰鬥當未開發。
> 仍然延後（需獨立 gate）：inventory、開放大地圖、多人、章節擴張、Initial Bond 夥伴 roster 選擇、商業變現框架。
