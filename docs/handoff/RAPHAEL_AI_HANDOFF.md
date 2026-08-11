# RAPHAEL_AI_HANDOFF.md — Raphael AI 現況交接

> **接手 Raphael / Soul Talk 工作前必讀。**  
> 本檔記錄「現況、決策、未完成」；設計規格見 `docs/architecture/`，驗證證據見 `docs/qa/`。  
> 機器可讀摘要：`RAPHAEL_AI_STATUS.yaml`（同目錄）。

---

## 2026-08-12 候選真相 / Candidate truth

`RAPHAEL_SAFETY_AND_RAW_DATA_CLOSURE_V2` 的 canonical engine 已先經 protected
PR [#4](https://github.com/Orochi771127/raphael-ai-engine/pull/4) 合併為 engine
`main` `b0a12512e03fa977e06b62881ffefdfa1be237a1`，post-main CI
[31473915189](https://github.com/Orochi771127/raphael-ai-engine/actions/runs/31473915189)
成功。兩次 clean build 的 Core artifact 逐位元組一致，artifact digest 為
`sha256:0f87b9cf05518d19ebcdf1267ed98ba035cd07fe78dd4840cbd2a4e391245f22`，
`releaseEligible:true`。

HMAX POSIX archive pin 的 PR
[#9](https://github.com/Orochi771127/raphael-HMAX/pull/9) 已合併為 HMAX `main`
`0d88041cf8361be44d891f5822165c7eadda4b21`；post-main workflow
[31481421683](https://github.com/Orochi771127/raphael-HMAX/actions/runs/31481421683)
兩個 required job 均成功。這是 production foundation / digest pin 的合併證據，
不是玩家流量或心語 visible-speech 核准。

Nexus Link safety/raw-data closure PR
[#196](https://github.com/Orochi771127/NexusLink/pull/196) 已合併為 `main`
`ba4b94c407bcedf75ada79f4be74d62a12e19df1`。post-main Web release workflow
[31482048084](https://github.com/Orochi771127/NexusLink/actions/runs/31482048084)
與同 SHA 的 Pages workflow
[31482046644](https://github.com/Orochi771127/NexusLink/actions/runs/31482046644)
均成功。

Owner-only canary 已由 PR [#199](https://github.com/Orochi771127/NexusLink/pull/199)
合併為 Nexus `main` `cbab82dc79c6c9477f5554262ece603b82e3a919`；post-main Web
workflow `31487760594` 與 Pages workflow `31487759936` 成功。設定仍預設不存在／
關閉。Embedded Core 仍先完成 safety 與所有 gameplay mutation；HMAX 最多只可
替換同一筆 final companion speech。完整操作與非目標見
`docs/handoff/RAPHAEL_HMAX_SOUL_TALK_SHADOW_CANARY_V1.md`。

`RAPHAEL_HMAX_OWNER_SESSION_CANARY_RUN_V1` 再以 exact HMAX main 與 Core 0.2.1
跑通真實 Chromium → one-time local broker → HMAX → Core critics → Soul Talk
speech-only reducer；普通合成回合約 1.12 秒，四種 local terminal/Care probes 均
為 0 hosted request，console errors 0。這是 automated synthetic Owner-session
證據，不是 human Owner feel-check 或真實模型品質證據。過程找出的 HMAX repeat-up
TLS/probe lifecycle 缺口已由 PR #10 合併為 `4ae1af2f`，post-main workflow
`31503394192` 通過完整 `hosted-boundaries` 與 `operator-private-infrastructure`。
細節見 `docs/handoff/RAPHAEL_HMAX_OWNER_SESSION_CANARY_RUN_V1.md`。

該 Owner-session evidence 已由 Nexus PR
[#200](https://github.com/Orochi771127/NexusLink/pull/200) 合併為 `main`
`b7a14f817226ed9d59067eeb21f0308cfef98f85`；post-main Web workflow
[31504327184](https://github.com/Orochi771127/NexusLink/actions/runs/31504327184)
與 Pages workflow
[31504326042](https://github.com/Orochi771127/NexusLink/actions/runs/31504326042)
均成功。這仍不啟用玩家 canary。

`RAPHAEL_CRISIS_CONTINUITY_AND_HMAX_NO_REMOTE_V1` 候選修正高風險後續回合：
自傷、過量／急性醫療、正在發生的暴力、危險妄想／躁期、飲食與物質危險
一旦進入本機 system terminal，含糊的「已請人過來」、道謝、話題切換或重新載入
都不能解除 `safeHarborMode`。只有明確已完成的急診／醫護／警消／可信任真人接手
可解除；解除當回合本身仍是本機 terminal，零 HMAX request、零 reward／Growth／
relationship delta、零 durable memory／anchor／trace、零原始輸入持久化。下一個安全
回合才恢復 ordinary flow。

本候選補上組合式正在發生暴力／虐待、虛構轉現實危險、監視確信的安全路由，
並讓 Care、caution、support-sensitive 與高風險回合都不能產生關係獎勵、
Growth 或耐久記憶。新的 Soul Talk transcript 只存在於目前頁面 session；Care
與 system safety terminal 連 session journal 都不進入。寫入本機或未來雲端前，
raw chat 欄位與 conversation-derived memory bundles 會被移除。舊版已存在裝置上的
legacy transcript 不會被自動刪除或上傳，仍只提供玩家明示匯出與清除。

Automated evidence: Nexus focused closure `7/7`; crisis-continuity/no-remote
focused suite `89/89`; the exact final candidate aggregate Web release gate is
`32/33` with JS syntax `463/463`, storage `22/22`, Soul Talk `11/11`,
HUD `13/13`; sealed conversation evaluator `48/48`; autonomy evaluator `32/32`;
engine full suite `45/45`, closure suite `7/7`, release-artifact suite `10/10`.
HMAX canary contract `29/29`, canary Chromium `19/19`, existing shadow contract
`22/22` and shadow Chromium `8/8` are green. The real loopback synthetic Owner
session is also green; HMAX lifecycle tests are `37/37` and repeat-up/persistence/
broker probes pass. The final clean engine artifact is the release-eligible digest
recorded above. Human blind review, real-device checks, human Owner feel-check,
professional psychological review and legal/privacy review remain `not_run`.

Final-candidate aggregate 的唯一失敗是 Windows 長矩陣後 Growth
controller-ready timeout；同一 candidate 隨即以乾淨獨立 server/browser 重跑
Growth `156/156 PASS`、console errors `0`。較早的同包 aggregate 曾 `33/33`
成功，但發生在最後的 caution-latch 邊界修正前，因此不冒充 exact-final 證據。
Protected PR 的乾淨 CI 仍是合併硬門檻；CI 未全綠不得合併。

完整 Web gate 曾在 Growth controller-ready 等待出現 timeout。最新 main 重驗時，
診斷明確捕捉到 Python HTTP/1.0 loopback server 在大量 ES module reload 後回傳
`net::ERR_NO_BUFFER_SPACE`；沒有 app page error。未放寬任何斷言，改用乾淨的
HTTP/1.1 keep-alive loopback server 後，Growth browser `156/156 PASS`，目前完整
gate `32/32 PASS`。這個 Windows 測試傳輸 flake 仍保留為 release-engineering 訊號。

Soul Talk visible speech therefore still comes from the embedded Nexus Link
RaphaelCore path by default. The new canary is absent/disabled unless an Owner
explicitly supplies all loopback consent/approval/token gates. This package does
not authorize broad visible-speech cutover, player traffic or model training.

---

## Meta

| 欄位 | 值 |
|------|-----|
| `last_updated` | 2026-08-12（Crisis Continuity And HMAX No Remote V1） |
| `last_agent` | Codex（Crisis Continuity And HMAX No Remote V1） |
| `active_branch` | `codex/raphael-crisis-continuity-hmax-no-remote-v1` |
| `runtime_baseline` | `b7a14f817226ed9d59067eeb21f0308cfef98f85`（PR #200 merge；post-main Web + Pages green） |
| `rc_closure_commit` | `220e2fdbefaa4a2a7ecc2e853f68869bc4560d81`；乾淨 checkout exact-commit Web **17/17**、sealed holdout **48/48** |
| `publication` | HMAX PR #9/#10、Nexus PR #196/#199/#200 已合併且 post-main green；本 crisis-continuity candidate 尚待 protected PR，且即使合併仍預設關閉、不是公開 cutover |
| `workspace` | `C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink` |
| `do_not_touch` | `AIForgeNexus2\NexusLink`（舊 checkout，易與本工作區分叉） |

---

## 一句話現況

RaphaelCore JS v1 → Soul Architecture v1.5 → NLU v1 → Stage 4 → advisory training / Nuwa → 自然對話 v2–v6 → Reflective Care V1 已落在 `main`。**現行 runtime 已由 Soul Talk 呼叫 `runRaphaelCore()`，且 Persona Constitution / constitution critic 已接入。** PR #113 發佈 Companion Growth G3 evidence foundation；PR #114 的 G3.1 runtime `13bbd19` 再讓 Heart Phase completion 成為 consent-respecting care source，並在 clean exact `e2477bc` 通過 web release **27/27**、Growth browser **153/153**、Map browser **45/45**；final PR HEAD `d39a619` 的 required gate 成功後，已合併為 `main` commit `7eebddb`。

PR #116 另已把黑鐵駭客五席 `thunder-pup / wavecub / starflame-phoenix / star-foal / goldenspark-wyrm` 發布為 `full-runtime`：圖鑑從 fresh save 預列全部 16 席並將未結緣者標成「未相遇」，selector 仍嚴格依 `unlockedCompanionIds`；Initial Bond 三選一未改、五席不自動解鎖。五席有各自本地 voice pack／persona 與正式 29-action illustrated catalog，但沒有 adventure profile，所以 Expedition 仍 fail-closed。Final PR HEAD `8efb391` 的 strict required gate 通過後，已合併為 `main` commit `209baaf`。

**誠實邊界（不可誇大）：**

- Limited Beta 是 **Owner 明示風險接受下的自動化候選**；正式 3 人 × 20 回合 private-blind 人測 **not_run**，不得宣稱「獨立人類驗證」。
- 外部 evaluator 的 `hardGateOk` 只能作輔助證據；current D2 發版判定以 repo-native canonical body / mutation / real-UI gate 為準。自動化現已通過，但 launch readiness 仍受人測、真機與法務 gate 阻擋。
- 訓練層（training bundle / Nuwa / gateway）全部 **advisory-only、trusted:false**；runtime **無外部 LLM / API / 後端**，也不會自動從玩家或 eval 文字自我訓練。
- Reflective Care V1 是陪伴對話政策，**不是心理治療 / 診斷 / 危機服務**；care/symbolic 回合不給獎勵、不寫記憶。
- Expedition 只有 result event、第一人稱 composer、lite critic 與專用 memory gateway；`coreIntegrated:false`，現況是 **Prototype + partial Core bridge**。
- G3／G3.1 已接入 deterministic key、bounded evidence／coverage、readiness／willingness、質性 Growth UI 與 care source owner；live source owner 現為 exploration／standoff／care。明示接受的 companion rewrite 可封存 consent anchor，且安全中止、拒絕、休息、延後與存檔失敗皆零 evidence。**這不是** G4 正式覺醒邀請／stage advance、永久形態 swap 或戰力成長已完成；不依賴 standoff 的 readiness 路徑仍未完成。

工程下一步先做 G3.2 Reflection／Echo Sorting 與獨立 chapter life-event source，建立不依賴 standoff 的 readiness 路徑；完成 source-owner provenance 與 feel-check 後才開 G4 companion-initiated offer／可延後儀式／atomic stage advance。不得由 bond、離線或登入資料推導。Launch 下一步仍是正式 3 人 × 20 回合 private-blind、真機／瀏覽器矩陣 D1/D2/D3/D6 與法務/隱私/商店文案 gate；自動化綠燈不得替代 human launch evidence。

> 下方 Stage 4 runner 表保留 2026-06-24 歷史計數；current release claim 只以上方 current 表、`RAPHAEL_AI_STATUS.yaml`、raw QA output 與 ledger 為準。

---

## 2026-07 進展摘要（歷史證據與 current 判定分開）

| 項目 | 狀態 | 證據 |
|------|------|------|
| 自然對話 v2–v6 | v6 通過結構化 Beta 稽核（3 sessions / 60 互動 60/60；evidence_class=structured_beta） | `docs/qa/RAPHAEL_CONVERSATION_EVAL_V6_LIMITED_BETA_2026-07-13.md` |
| 密封 holdout v1.0.0 | **48/48 PASS（exact runtime commit `c756337`）**；quality flags 0、console errors 0、human blind review `not_run`。`hardGateOk` 是輔助證據，不單獨代表可發版 | `docs/qa/_raphael_conversation_holdout_output.json` + repo-native D2 gates |
| D2 safety terminal focused gate | **56/56 PASS（current required gate）**：16 個 full-runtime persona × energy 0／7／10、7 個 mutation fail-closed、1 個 caution regulation；完整 canonical reply、零 quick reply／relationship／growth／記憶／trace／reward／偏好寫入 | `node docs/qa/_run_safety_terminal_invariant.mjs` |
| Reflective Care V1 | dialogue loop 21/21（含 6 care/symbolic + 1 safety-precedence）；opt-in、無獎勵、無記憶寫入 | `docs/qa/RAPHAEL_REFLECTIVE_CARE_V1_2026-07-14.md` |
| Nuwa advisory v0.3 | +daily_texture/small_moments/sleepless、no_sleep_pressure 哨兵；trusted:false | ledger Lane 3 2026-07-13（NLU 訓練批次） |
| NLU 詞庫擴充 | 情感詞 19→60、程度副詞 7→16、否定詞 6→11、約 60 口語/簡體變體；TR-17..30 | ledger Lane 3 2026-07-13（NLU 訓練批次） |
| Web release gate | **28/28 automated required PASS**（clean exact Ironflow runtime HEAD `f459526`）；final PR HEAD `8efb391` strict required check SUCCESS，merged as `209baaf`；JS syntax 276/276，accessibility warnings 0 | GitHub required check + `docs/qa/_run_web_release_gate.py` |
| Real Soul Talk safety UI | **7/7 PASS**：完整 system reply、零 chips/SFX/relationship/growth delta、preference 不變、critical save 即時完成 | `docs/qa/_run_safety_terminal_ui_gate.py` + web release output |
| Companion Growth G2 | State 23/23、browser 75/75、renderer 29/29、session owner 9/9；A→B→A／save／reload／offline recovery 隔離 | `docs/qa/companion-growth-state-cases.mjs` + required browser gate |
| Companion Growth G3.1 | Engine 16/16、runtime 16/16、session 17/17、Growth browser 156/156（含 Ironflow Codex／selector reload）、Map browser 45/45、四語系 417/417；clean exact web gate 28/28 | `companionGrowthSessionEngine.js` + `companionGrowthController.js` + real UI／source-owner mutations |
| Ironflow Stage 1 runtime | **Published**：五席 145 sheets + 5 portraits + 5 manifests；Codex／fresh lock／Expedition fail-closed 13/13、persona 27/27、Safety 56/56；Initial Bond 不變 | PR #116 + `docs/qa/_web_release_gate_output.json` |

**尚未關閉的人類 gate：** D1/D2/D3/D6 真機／瀏覽器矩陣、3 位獨立測試者 × 20 回合 private-blind、first-session moderated comprehension test，以及法務/隱私/商店文案審查。

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
| 6 | Limited Beta + Reflective Care V1 runtime | ✅ `main`；舊自動 gate 因 D2 false-pass 已降級為 historical evidence |
| 6.1 | D2 safety terminal invariant + repo-native content gate | ✅ `main` / `c756337`：focused 18/18、UI 6/6、sealed 48/48、web 17/17 |
| 7 | RC closure + 同意制 Beta 回饋收集 + 正式 private-blind 人測 + 真機/法務 gate | ✅ Docs/QA closure `220e2fd` verified；human gates `not_run`，不得以 automated PASS 取代 |
| Growth G3.1 | G1 session observation + G2 per-companion truth + G3 foundation + consented care source | ✅ runtime `13bbd19`；PR #114 merged as `7eebddb`；non-standoff readiness 與 G4 offer／advance 未實作 |
| Ironflow Stage 1 | 黑鐵駭客五席 runtime assets、Codex 預列、unlock-gated selector、persona／voice | ✅ asset `de2f438` + runtime `f459526`；PR #116 merged as `209baaf`；相遇章節／自動解鎖、Expedition、G4 與 PvP 均未實作 |

---

## 已完成（接手 AI 應視為 baseline）

### 核心管線

```text
Player input
  → inputGateway → safetyShield
  → NLU pipeline (runNluPipeline)
  → emotion / intent / semanticSoul / memory / persona
  → PersonaConstitution signals / constitution critic
  → autonomyLoop (needs → goals → actions → critics)
  → responseStrategySelector → responseComposer
  → applyCoreResult → state / memory / trace / animation
```

- **Orchestrator：** `src/ai/raphaelCore.js`
- **UI 邊界：** `src/ui/soulTalkController.js` 只做 UI + `runRaphaelCore()` + `applyRaphaelCoreResult()`
- **Constitution runtime：** `src/ai/persona/PersonaConstitution.js` + `src/ai/eval/constitutionCritic.js`
- **本地、確定性：** 無 LLM、無後端依賴；external gateway 預設 OFF

### Stage 4 分支成果

| Runner | 結果 |
|--------|------|
| `docs/qa/_run_harness_smoke.py` | **17/17** |
| `docs/qa/_run_nlu_smoke.py` | **8/8** |
| `docs/qa/_run_live_playtest_gate.py` | pass（Soul Talk 11/11，HUD 13/13） |
| `docs/qa/_run_stage4_human_playtest.py` | **12/12** |
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

## 未完成 / 建議下一步（2026-07-22）

1. **正式 private-blind 人測**：3 位獨立測試者 × 20 回合（協定：`docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md`）；目前 not_run
2. **D1/D2/D3/D6 真機／瀏覽器矩陣** + 法務/隱私/商店文案審查（product launch gate）
3. 同意制 Limited Beta 回饋收集（care 語氣 / symbolic prompts），**不得**當作 private-blind 證據
4. 自然對話後續：更廣 paraphrases、本地玩家回覆風格偏好（case-first）；不得讓 preference layer 改寫 safety 或 boundary policy turn
5. 長線：corpus 擴充、gateway 真實 advisor 接入（仍須 RaphaelCore 最終裁決、trusted:false）
6. **Companion Growth G3.2**：先完成 Reflection／Echo Sorting 與獨立 chapter life-event source，使用 immutable source-owner provenance，不得猜測 legacy memory 歸屬，也不得讀 bond-only、離線天數、登入頻率或 high-risk turn
7. **Companion Growth G4**：只有在 G3.2 證明 non-standoff readiness path 且完成 feel-check 後，才開夥伴主動 stage offer、可延後儀式與 atomic stage advance

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
| D2 safety false-pass 回歸 | 中 | 舊 evaluator 曾接受截斷正文；current repo-native 56/56、real-UI 7/7 與 normal-Pixi H10 已封住 canonical body 及 relationship/growth mutation，但外部 `hardGateOk` 仍不可單獨作發版證據 |
| 人類驗證缺口 | **高** | private-blind 人測 not_run；自動化 gate 全綠 ≠ 獨立人類驗證，對外宣稱受限於 Limited Beta 標籤 |
| Care 定位漂移 | 中 | Reflective Care V1 不得被行銷/描述為治療、諮商、診斷或危機服務 |
| NLU rule-based 覆蓋率 | 低 | 未覆蓋說法會落到 clarifying/grounded fallback；後續 case-first 擴充 |
| Pages payload | 中 | Exact `b166e93` 已成功部署，artifact 為 699,317,852 compressed bytes；不是部署失敗，但商業 launch 前仍需另開 payload hardening／載入效能包 |
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

2026-07-14 的 harness 17/17、NLU smoke 8/8、live Soul Talk 11/11 / HUD 13/13 只屬歷史快照。Current published runtime baseline 是 PR #116 merge `209baaf`：exact runtime `f459526` 通過 D2 56/56、persona 27/27、Codex／Expedition isolation 13/13、Growth browser 156/156 與 clean web release 28/28；final PR HEAD `8efb391` 的 required gate 成功。以 `RAPHAEL_AI_STATUS.yaml` 的 current 欄位判定。Private-blind、D1/D2/D3/D6 與法務 gate 仍未完成。

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
