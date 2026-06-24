# RAPHAEL_AI_HANDOFF.md — Raphael AI 現況交接

> **接手 Raphael / Soul Talk 工作前必讀。**  
> 本檔記錄「現況、決策、未完成」；設計規格見 `docs/architecture/`，驗證證據見 `docs/qa/`。  
> 機器可讀摘要：`RAPHAEL_AI_STATUS.yaml`（同目錄）。

---

## Meta

| 欄位 | 值 |
|------|-----|
| `last_updated` | 2026-06-24 |
| `last_agent` | Grok Agent |
| `active_branch` | `feature/raphael-stage4-human-playtest` |
| `last_commit` | `3ac95c3` — docs(handoff): add Raphael AI handoff and agent onboarding hooks |
| `merged_to_main` | **否** — Stage 4 分支尚未 merge；`main` 上 PR #86 已 merge（`043efb5`） |
| `workspace` | `C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink` |
| `do_not_touch` | `AIForgeNexus2\NexusLink`（舊 checkout，易與本工作區分叉） |

---

## 一句話現況

RaphaelCore JS v1 → Soul Architecture v1.5 → NLU v1 已在 `main` 落地；**Stage 4 human playtest**（疲憊 recall 對齊、觸摸疲勞日間 QA、10 則人感對話）在 `feature/raphael-stage4-human-playtest` **全測通過、待 merge / 真人試玩**。

---

## Stage 進度（Raphael AI 主線）

| Stage | 內容 | 狀態 |
|-------|------|------|
| 1 | RaphaelCore JS v1（safety → intent → reaction → compose） | ✅ `main` |
| 2 | Soul Architecture v1.5（autonomy、critic、evolution、external gateway stub） | ✅ `main`（PR #86） |
| 3 | Awakening gate（心核初醒、first touch / first Soul Talk） | ✅ `main` |
| 3b | NLU v1（semanticFrame、responseStrategy、anti-generic） | ✅ `main` |
| 4 | Human playtest pack（fatigue recall、touch fatigue daytime、10 human-feel cases） | ✅ 分支全過；**未 merge** |
| 5 | Expanded real human playtest + corpus tuning | ⏳ 下一步 |

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
| `src/ai/dialogue/` | 反迴圈、quick reply、debug trace |
| `src/ai/external/` | External gateway（stub，預設關） |
| `src/ai/evolution/` | 自我迭代提案（需 human approval） |
| `src/ai/testHarness/` | Smoke / stage4 / NLU cases |
| `raphael-gateway-server/`（工作區外層） | 可選 gateway server，**runtime 不硬依賴** |

---

## 未完成 / 建議下一步

1. **Merge `feature/raphael-stage4-human-playtest` → `main`**（需 human 明確指示；AGENTS.md 禁止 AI 自行 commit/push）
2. Merge 後在 `main` 重跑 QA pack 做 canonical sign-off
3. **Expanded real human playtest**（規則 harness 通過 ≠ 真人語感驗收）
4. 可選：道歉線 `我剛剛對你太急了，對不起` 專用 repair pack（目前 contextual ack）
5. 可選：睡眠時段觸摸仍先 `wake`、疲勞不累積（live UI 已知限制；engine QA 已覆蓋數學）
6. 長線：corpus 擴充、NLU regex 邊界語句、gateway 真實 advisor 接入（仍須 RaphaelCore 最終裁決）

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
| Stage 4 未 merge | 中 | 接手者若在 `main` 開工會缺 Stage 4 修正 |
| NLU rule-based 覆蓋率 | 低 | 邊界語句需 corpus / regex 擴充 |
| 睡眠窗觸摸 → wake 短路 | 低 | Live UI 行為；engine 層 fatigue 已單測 |
| Apology 無專用 pack | 低 | 語氣可接受，非 merge blocker |
| Port 5173 衝突 | 中 | 多 checkout 並行時易測錯 codebase |

---

## 接手 AI 建議閱讀順序

```text
1. 本檔（docs/handoff/RAPHAEL_AI_HANDOFF.md）
2. AGENTS.md + CLAUDE.md（協作規範）
3. docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md（架構）
4. docs/raphael/RAPHAEL_CONSTITUTION.md（人格邊界）
5. docs/qa/RAPHAEL_CORE_JS_V1_TEST_RUNS.md（最新測試證據）
6. src/ai/raphaelCore.js（程式入口）
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

預期：與上表一致（17/17、8/8、live pass、10/10、7/7）。

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