# RAPHAEL_AI_HANDOFF.md — Raphael AI 現況交接

> **接手 Raphael / Soul Talk 工作前必讀。**  
> 本檔記錄「現況、決策、未完成」；設計規格見 `docs/architecture/`，驗證證據見 `docs/qa/`。  
> 機器可讀摘要：`RAPHAEL_AI_STATUS.yaml`（同目錄）。

---

## Meta

| 欄位 | 值 |
|------|-----|
| `last_updated` | 2026-07-14（TP-2 docs-only refresh；**當前操作真相以 `docs/agent/AI_EXECUTION_LEDGER.md` Lane 3 為準**） |
| `last_agent` | Claude Fable 5 |
| `active_branch` | `main`（2026-07-02 起單線開發，integrate 分支已退役） |
| `last_commit` | 執行 `git log -1 --oneline` 取得 tip |
| `workspace` | `C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink` |
| `do_not_touch` | `AIForgeNexus2\NexusLink`（舊 checkout，易與本工作區分叉） |

---

## 一句話現況

RaphaelCore JS v1 → Soul Architecture v1.5 → NLU v1 → Stage 4 → 靜態訓練 advisory 層（training bundle + Nuwa 蒸餾 v0.3，trusted:false）→ daily-life NLU → 詞庫擴充批次 → **自然對話 v2–v6（Limited Beta 自動化候選）→ 密封 holdout eval（48/48 hard gate PASS）→ Reflective Care V1** 已全部在 `main`。逐條進展見 ledger Lane 3（2026-07-10..14）；機器可讀快照見 `RAPHAEL_AI_STATUS.yaml`。

**誠實邊界（不可誇大）：**

- Limited Beta 是 **Owner 明示風險接受下的自動化候選**；正式 3 人 × 20 回合 private-blind 人測 **not_run**，不得宣稱「獨立人類驗證」。
- 訓練層（training bundle / Nuwa / gateway）全部 **advisory-only、trusted:false**；runtime **無外部 LLM / API / 後端**，也不會自動從玩家或 eval 文字自我訓練。
- Reflective Care V1 是陪伴對話政策，**不是心理治療 / 診斷 / 危機服務**；care/symbolic 回合不給獎勵、不寫記憶。

下一步：Limited Beta 發佈與同意制回饋收集、真機人類 gate、法務/商店文案審查。

> 以下章節（Stage 進度表、模組地圖、QA 數字）為 2026-06-24 的歷史快照，架構描述仍有效；**數字與「下一步」以上方、`RAPHAEL_AI_STATUS.yaml` 與 ledger 為準**。

---

## 2026-07 進展摘要（TP-2 refresh，證據皆可追溯）

| 項目 | 狀態 | 證據 |
|------|------|------|
| 自然對話 v2–v6 | v6 通過結構化 Beta 稽核（3 sessions / 60 互動 60/60；evidence_class=structured_beta） | `docs/qa/RAPHAEL_CONVERSATION_EVAL_V6_LIMITED_BETA_2026-07-13.md` |
| 密封 holdout v1.0.0 | 48/48 hard contract、hard gate PASS、機器品質 flag 0；**人類盲審 not_run** | 同上 + `docs/qa/RAPHAEL_REFLECTIVE_CARE_V1_2026-07-14.md` |
| Reflective Care V1 | dialogue loop 21/21（含 6 care/symbolic + 1 safety-precedence）；opt-in、無獎勵、無記憶寫入 | `docs/qa/RAPHAEL_REFLECTIVE_CARE_V1_2026-07-14.md` |
| Nuwa advisory v0.3 | +daily_texture/small_moments/sleepless、no_sleep_pressure 哨兵；trusted:false | ledger Lane 3 2026-07-13（NLU 訓練批次） |
| NLU 詞庫擴充 | 情感詞 19→60、程度副詞 7→16、否定詞 6→11、約 60 口語/簡體變體；TR-17..30 | ledger Lane 3 2026-07-13（NLU 訓練批次） |
| Web release gate | 10/10 自動必要檢查；JS syntax 204/204；state migration 30/30 | `docs/qa/RAPHAEL_REFLECTIVE_CARE_V1_2026-07-14.md` |
| Live gate | Soul Talk 11/11、HUD 13/13、0 console errors | 同上 |

**尚未關閉的人類 gate：** 真機三平台重測、3 位獨立測試者 moderated private test（formal private-blind）、法務/隱私/商店文案審查、密封 holdout 人類盲審。

---

## Stage 進度（Raphael AI 主線）

| Stage | 內容 | 狀態 |
|-------|------|------|
| 1 | RaphaelCore JS v1（safety → intent → reaction → compose） | ✅ `main` |
| 2 | Soul Architecture v1.5（autonomy、critic、evolution、external gateway stub） | ✅ `main`（PR #86） |
| 3 | Awakening gate（心核初醒、first touch / first Soul Talk） | ✅ `main` |
| 3b | NLU v1（semanticFrame、responseStrategy、anti-generic） | ✅ `main` |
| 4 | Human playtest pack（fatigue recall、touch fatigue daytime、10 human-feel cases） | ✅ `main`（PR #87） |
| 5 | Advisory 訓練層 + NLU 詞庫/語料擴充 + 自然對話 v2–v6 + 密封 holdout eval | ✅ `main`（2026-07-05..13，見 ledger Lane 3） |
| 6 | Limited Beta + Reflective Care V1（自動化 gate 全綠；人類 gate 未關） | ✅ `main`（2026-07-13..14） |
| 7 | 同意制 Beta 回饋收集 + 正式 private-blind 人測 + 真機/法務 gate | ⏳ 下一步 |

---

## 已完成（接手 AI 應視為 baseline）

### 核心管線

```text
Player input
  → inputGateway → safetyShield
  → NLU pipeline (runNluPipeline)
  → emotion / intent / semanticSoul / memory / persona
  → autonomyLoop (needs → goals → actions → critics)
  → responseStrategySelector → responseComposer
  → applyCoreResult → state / memory / trace / animation
```

- **Orchestrator：** `src/ai/raphaelCore.js`
- **UI 邊界：** `src/ui/soulTalkController.js` 只做 UI + `runRaphaelCore()` + `applyRaphaelCoreResult()`
- **本地、確定性：** 無 LLM、無後端依賴；external gateway 預設 OFF

### Stage 4 分支成果

| Runner | 結果 |
|--------|------|
| `docs/qa/_run_harness_smoke.py` | **17/17** |
| `docs/qa/_run_nlu_smoke.py` | **8/8** |
| `docs/qa/_run_live_playtest_gate.py` | pass（Soul Talk 10/10，HUD 13/13） |
| `docs/qa/_run_stage4_human_playtest.py` | **10/10** |
| `docs/qa/_run_touch_fatigue_daytime.py` | **7/7** |
| Console errors | **0** |
| Forbidden phrases | **0** |

**疲憊 recall 對齊：** `我又覺得自己很累` 從 generic clarifying question 改為 `repeated_fatigue_recall` 策略（`isRepeatedEmotionSignal` + `REPEATED_EMOTION_RECALL`），harness `recallHit` 已 **17/17**。

詳細紀錄：`docs/qa/RAPHAEL_CORE_JS_V1_TEST_RUNS.md`（Stage 4 章節）。

### 模組地圖（精簡）

| 目錄 | 職責 |
|------|------|
| `src/ai/` | RaphaelCore orchestrator + 感知 / 回覆 |
| `src/ai/nlu/` | 自然語言理解 v1 |
| `src/ai/autonomy/` | 有界自主迴圈 |
| `src/ai/awakening/` | 心核初醒 gate |
| `src/ai/eval/` | Critic 層（safety / boundary / persona / generic reply） |
| `src/ai/dialogue/` | 反迴圈、quick reply、debug trace、對話狀態追蹤、boundary/answer policy、**Reflective Care V1**（`reflectiveCarePolicy.js`） |
| `src/ai/external/` | External gateway（stub，預設關） |
| `src/ai/evolution/` | 自我迭代提案（需 human approval） |
| `src/ai/testHarness/` | Smoke / stage4 / NLU cases |
| `raphael-gateway-server/`（工作區外層） | 可選 gateway server，**runtime 不硬依賴** |

---

## 未完成 / 建議下一步（2026-07-14）

1. **正式 private-blind 人測**：3 位獨立測試者 × 20 回合（協定：`docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md`）；目前 not_run，是「獨立人類驗證」宣稱的硬前提
2. **真機三平台重測** + 法務/隱私/商店文案審查（product launch gate）
3. 同意制 Limited Beta 回饋收集（care 語氣 / symbolic prompts），**不得**當作 private-blind 證據
4. 自然對話後續：更廣 paraphrases、本地玩家回覆風格偏好（case-first）
5. 可選：睡眠時段觸摸仍先 `wake`、疲勞不累積（live UI 已知限制；engine QA 已覆蓋數學）
6. 長線：corpus 擴充、gateway 真實 advisor 接入（仍須 RaphaelCore 最終裁決、trusted:false）

---

## 上一個 AI 的決策與約束（必讀）

以下為 Grok Agent 在本工作區累積的**不可擅自推翻**約定，除非 human 明確改規格：

### 產品紅線（全 agent 共用）

- 服從 `AGENTS.md` + `CLAUDE.md` + `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`
- Raphael **不是 GPT**；外部模型只能 advise，**RaphaelCore 保留最終權威**
- 不做依賴偵測驅動行為、不把 safety 變 gameplay 獎勵、不製造 FOMO
- `localStorage` key 固定：`nexusLinkR2State:v1`；勿擅自改 schema

### 技術約束

- **禁止：** React / TS / npm build step / 後端 / LLM API 進 runtime（除非 human 確認）
- **修改分級：** `saveManager.js`、`index.html`、`assets/**` 為 GROUNDWORK，需 human 逐項確認
- **測試埠：** 本地 `python -m http.server 5173`；測前確認 `http://localhost:5173/src/ai/raphaelCore.js` 回 **200**（避免連到 `AIForgeNexus2` 舊 instance）

### 實作決策（Stage 4 相關）

- 疲憊「又」訊號走 **既有** `responseStrategySelector` + `memoryRecallPolicy`，**不新增模組**
- Stage 4 harness 為 rule-based；`S4-6` 接受 `quiet_presence` 作為 comfort-feedback 有效策略（commit `bcc663e`）
- `raphael-gateway-server` 與 root runtime **分離**；勿把 gateway 硬耦合進 `index.html` 載入鏈

### Git 約束

- **未經 human 指示，不可 `git commit` / `git push`**
- 當前有效開發在 `NexusLink_RaphaelAI_Workspace\NexusLink`，非 `AIForgeNexus2\NexusLink`

---

## 已知風險

| 風險 | 嚴重度 | 說明 |
|------|--------|------|
| 人類驗證缺口 | **高** | private-blind 人測 not_run；自動化 gate 全綠 ≠ 獨立人類驗證，對外宣稱受限於 Limited Beta 標籤 |
| Care 定位漂移 | 中 | Reflective Care V1 不得被行銷/描述為治療、諮商、診斷或危機服務 |
| NLU rule-based 覆蓋率 | 低 | 未覆蓋說法會落到 clarifying/grounded fallback；後續 case-first 擴充 |
| 睡眠窗觸摸 → wake 短路 | 低 | Live UI 行為；engine 層 fatigue 已單測 |
| 首跑 flaky console error | 低 | null.split ×2 首次 gate run 偶發（3 次紀錄，重跑必乾淨；runner 已補 url:line 擷取） |
| Port 5173 衝突 | 中 | 多 checkout 並行時易測錯 codebase |

---

## 接手 AI 建議閱讀順序

```text
1. 本檔（docs/handoff/RAPHAEL_AI_HANDOFF.md）
2. AGENTS.md + CLAUDE.md（協作規範）
3. docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md（架構）
4. docs/raphael/RAPHAEL_CONSTITUTION.md（人格邊界）
5. docs/agent/AI_EXECUTION_LEDGER.md Lane 3（操作真相，newest-first）
6. docs/qa/RAPHAEL_REFLECTIVE_CARE_V1_2026-07-14.md + docs/qa/RAPHAEL_CONVERSATION_EVAL_V6_LIMITED_BETA_2026-07-13.md（最新測試證據）
7. src/ai/raphaelCore.js（程式入口）
```

遊戲內容（非 AI 實作）另讀：`docs/r2-canon/R2_CANON_REGISTRY.md`

---

## 本地驗證（接手後第一個動作）

```bash
cd C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink
python -m http.server 5173
```

另開終端（確認在 **本工作區** 分支上）：

```bash
python docs/qa/_run_harness_smoke.py
python docs/qa/_run_nlu_smoke.py
python docs/qa/_run_live_playtest_gate.py
python docs/qa/_run_stage4_human_playtest.py
python docs/qa/_run_touch_fatigue_daytime.py
```

預期（2026-07-14 快照）：harness 17/17、NLU smoke 8/8、live gate soul_talk **11/11** + HUD 13/13 + 0 console errors、stage4 pass、touch fatigue pass。完整 gate 清單與最新數字見 `RAPHAEL_AI_STATUS.yaml` 的 `qa:` 區塊。

---

## 文件索引（分類導航）

| 類別 | 路徑 | 用途 |
|------|------|------|
| **交接（本檔）** | `docs/handoff/` | 現況、決策、下一步 |
| 架構 | `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md` | 四層架構、模組職責 |
| 架構 | `docs/architecture/RAPHAEL_GATEWAY_SERVER_V1.md` | Gateway server 規格 |
| 人格憲法 | `docs/raphael/RAPHAEL_CONSTITUTION.md` | 語氣、邊界、禁止句 |
| QA 證據 | `docs/qa/RAPHAEL_CORE_JS_V1_TEST_RUNS.md` | 歷次 runner 結果 |
| QA 協定 | `docs/qa/RAPHAEL_CORE_JS_V1_TEST_PROTOCOL.md` | 測試協定 |
| 遊戲 canon | `docs/r2-canon/` | 角色、HUD、世界觀（非 AI 實作） |
| AI 流程 | `docs/agent/AI_WORKFLOW.md` | Gate 0–6 |
| 程式真相 | `src/ai/` | Runtime 實作 |

---

## 更新本檔的時機

- 每個 milestone 完成或 merge 前
- 分支切換、重大決策、QA 全跑後
- 同步更新 `RAPHAEL_AI_STATUS.yaml` 的 branch / commit / qa 數字