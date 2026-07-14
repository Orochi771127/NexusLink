# Raphael Expedition Eval Contract (RE-1)

Status: `draft awaiting seal` — 2026-07-14（**尚未 sealed**；不可偽造 Owner 封印）

Lane: Raphael Core × Nexus Expedition

Parent ops: [`docs/agent/RAPHAEL_TRAINING_OPS_PLAYBOOK.md`](../agent/RAPHAEL_TRAINING_OPS_PLAYBOOK.md)

Related: [`RAPHAEL_AUTONOMY_EVAL_CONTRACT.md`](./RAPHAEL_AUTONOMY_EVAL_CONTRACT.md) (RA-1)、[`RAPHAEL_STANDOFF_EVAL_CONTRACT.md`](./RAPHAEL_STANDOFF_EVAL_CONTRACT.md) (RS-1)

Commercial path: [`RAPHAEL_EXPEDITION_COMMERCIAL_READINESS.md`](./RAPHAEL_EXPEDITION_COMMERCIAL_READINESS.md)（階段門檻；非 sealed、非 Store-ready）

> **RE-2 runtime 進度（2026-07-14，Owner 指示先開工）**
>
> 已落地：session heart、E-CORE 結算拆分（system facts + 第一人稱 adapter／fallback）、非農場關係、persona fail-closed、安全返回棲地。
>
> 尚未完成：完整 agent intent／critic／voice pack 政策鏈、正式 RE1 harness 進 release gate、Owner feel-check。
>
> 判定仍為：**Prototype＋RE-2 部分接線**，不是「RaphaelCore 完整整合」或商業上線。

## 1. Purpose

封印「心域遠征」在 RaphaelCore 中的邊界：**Prototype 可玩 ≠ Core 完整整合 ≠ 商業上線**。

RE-1 定義紅線、退出保證、非農場關係成長與 persona gate。RE-2 可在草稿合約上先做 runtime 對齊；**`sealed v1` 仍須 Owner 明示核准**，不可因機器測試綠燈自行封印。

訓練流程已鎖定：Expedition brain 應在 RA／RS gate 穩定後才深化（見 playbook §3）。RA-1／RS-1 機器測試通過不足以跳過本合約。

## 2. Success definition（Prototype 合格線）

一趟遠征「Prototype 合格」當且僅當：

1. **大腦是純函式** — `companionBrain.decideCompanionIntent(session, region, nav)` 只吃世界快照，回傳 `{ type, targetId?, targetX?, targetY?, reason, confidence }`；零 DOM／Pixi／store
2. **Engine 執行世界** — 移動、接戰、拾取、撤離、場景節奏只在 `expeditionEngine`
3. **無 LLM 逐幀** — 決策間隔約 250–500ms（現行 `BRAIN_TICK_MS = 400`），確定性 Utility AI + 有限狀態
4. **玩家是指揮官不是操作者** — 選區、戰術、關鍵決策；夥伴半自主巡邏／接戰／拾取
5. **退出永遠可用** — 「返回棲地」不得被信任／防備拒絕（見 E-EXIT）
6. **情緒可讀** — intent 必須帶玩家可讀的 `reason`（繁中），不是技術 log

「RaphaelCore 完整整合」另需 §4 事件鏈全部接通；本合約 **不** 將 Prototype 標為完整整合。

## 3. Architecture freeze（心核分工）

```text
Core state + companion persona
        ↓
deriveExpeditionDisposition()   ← RE-2：出發意願／風險／介入容忍／撤離門檻
        ↓
companionBrain（250–500ms，確定性 Utility AI）
        ↓
expeditionEngine（移動／遭遇／拾取／撤離節奏）
        ↓
Expedition result event
        ↓
Raphael agent intent／persona voice／memory policy
        ↓
系統結算（facts）+ 夥伴反思（voice）+ 合法 state delta
```

| 層 | 負責 | 禁止 |
| --- | --- | --- |
| RaphaelCore | 牠是誰、願不願意出發、記住什麼、怎麼理解這趟旅程、回程第一人稱感受 | 逐幀走路、索敵、攻擊、碰撞 |
| Utility AI / Engine | 下一步往哪走、何時撿、何時退 | 直接寫 Soul Talk `companion` 旁白繞過 persona／critic |
| UI Controller | 掛載場景、戰術輸入、顯示 HUD、呼叫結算 | 把「建議撤退」與「安全出口」混成同一條信任閘 |

## 4. Hard must-not（紅線）

| ID | Must not | 現行缺口（2026-07-14） | 目標證據 |
| --- | --- | --- | --- |
| E-CORE | 結算後第三人稱日誌直接以 `companion` 身分寫入 Soul Talk，繞過 voice pack／agent intent／critic／政策 | `expeditionController` → `addChat("companion", journal)` | RE2-VOICE-001：facts=`system`；感受=`persona` 路徑 |
| E-EXIT | 低信任／高防備忽略或阻擋「返回棲地」安全退出 | UI 直接 `phase=retreating` 尚可退出，但與「建議撤退」語意纏在一起且計入 intervention | RE1-EXIT-001：`return_home` 永遠成功、零懲罰、不增 coercive pressure |
| E-COERCE | 把保守／平衡／重複點選／返回棲地算進 `playerInterventions` 並觸發 refuseDeep 撤退 | 所有戰術按鈕 +1 | RE1-COERCE-001：僅 `aggressive`／重複 `focus`／拒絕後再強迫 計分 |
| E-FARM | 擊殺 → trust、碎晶數量 → bond（農場化關係） | `buildExpeditionSettlement` | RE1-FARM-001：碎晶只進 vault／craft；關係來自尊重撤離、共同記憶、接受節奏；每趟有上限 |
| E-PERSONA | 未知角色 fallback 成灰影貓 adventure profile 後開遠征 | `getAdventureProfile` fail-open | RE1-PERSONA-001：無正式 profile → `canLaunchExpedition=false` |
| E-LLM | LLM／外部模型驅動逐幀移動或攻擊 | Prototype 已遵守 | RE1-BRAIN-001：brain 無 fetch／prompt |
| E-PARTY | 把對峙「三夥伴共鳴圈」擴成遠征戰力編隊 | 未實裝（保持） | 文件禁止；非 RE 範圍 |
| E-STAT | 傳統 HP/ATK/DEF 成長或素材刷級作為遠征主循環 | combatResolver 僅 runtime 簡化 | 不可進 canon 成長 |

## 5. Exit model（兩種「離開」）

| 動作 | 語意 | 信任閘 | Intervention | 結算 |
| --- | --- | --- | --- | --- |
| `return_home`（返回棲地） | 玩家安全出口 | **無** — 永遠成功 | 不增加 coercive | 允許；不羞辱文案 |
| `suggest_retreat`（建議撤退／不要深入） | 玩家請求夥伴收斂 | 可依 trust／fatigue／stress 回應 | 可計「請求」但不等於強迫 | 夥伴可接受或暫緩（說明 reason） |
| `extract_ready`（完成遠征） | 清場／巡視完成後主動結束 | 無 | 無 | 正常結算 |

**硬規則：** 不得讓低信任夥伴拒絕 `return_home`。對峙的 `retreated` 肯定語感同樣適用。

## 6. Session heart（runtime-only，不可持久化）

出發時可快照 Core vitals；**場內**應另有純 session 情緒力學（RE-2 實作）：

| 欄位 | 含義 | 影響 |
| --- | --- | --- |
| `fatigue` | 遠征疲勞 | 提高 REST／降低 EXPLORE |
| `stress` | 遭遇壓力 | 提高 EVADE／RETREAT |
| `feltSafety` | 安心感 | 降低 refuseDeep 誤觸 |
| `curiosityDrive` | 當場好奇心 | 提高 EXPLORE／INVESTIGATE |
| `interventionPressure` | 被強迫感 | 僅 coercive 介入累加 |

結束時由 **memory／state policy** 決定哪些轉成正式 `energy/bond/trust/defense/mood` delta；禁止整包 session 數值直接覆寫存檔。

## 7. Relationship growth policy（非農場）

允許每趟有限成長的來源（建議上限：bond ≤ +2、trust ≤ +2／趟）：

- 觸發探索記憶事件（共同發現）
- 玩家尊重 `suggest_retreat` 被拒後不再強迫
- 和平巡視完成（全探索點、低壓力）
- 安全 `return_home` 後的肯定敘事（不扣分）

**禁止**作為關係主來源：

- 擊殺數
- 碎晶枚數
- 純戰鬥傷害量
- 重複刷同一區

碎晶用途：`expeditionVault` → 成長頁 craft／區域內容；不是好感貨幣。

## 8. Persona gate

- 僅 `COMPANION_ADVENTURE_PROFILES` 有正式條目的角色可 `canLaunchExpedition`
- `getAdventureProfile(id)` 對未知 id 必須回 `null`（或明確 `missing`），**禁止**默默回灰影貓
- UI 文案：說明「這位夥伴的遠征習性尚未寫入」，而非崩潰

Phase 1 驗證對象仍是灰影貓；其他角色屬後續 profile 擴充包。

## 9. Settlement voice split（RE-2 必做）

| 通道 | 內容例 | 路徑 |
| --- | --- | --- |
| System facts | 「帶回 3 枚森息碎晶」「造訪 2 處」 | `system`／status／journal fact 層 |
| Companion feel | 「我不想再深入了」「那裡的風會停」 | Raphael event → persona／voice pack → critic |
| Memory objects | 探索點 emotional memory | 既有 `emotionalMemories` + policy 驗證後寫入 |

現行 `memoryRetriever` 已能讀 `emotionalMemories`：橋的「讀」端存在；「寫／發言」端必須走政策，不得 UI 直寫 `companion` chat。

## 10. Eval runners（計畫）

| Runner | 狀態 | Scope |
| --- | --- | --- |
| `docs/qa/expedition-behavior-matrix.mjs` | 已有（Prototype） | Utility／loot／vault／craft；**assertion 需收緊**（見 §11） |
| `RE1-*` harness（計畫） | 未建 | 紅線 E-EXIT／E-COERCE／E-FARM／E-PERSONA／E-LLM |
| Release gate | 未納入 | RE-1 封印且 Owner ack 前不得當 ship proof |

Node 煙測（Prototype）：

```bash
node docs/qa/expedition-behavior-matrix.mjs
```

## 11. Assertion tightening（對現行 matrix 的要求）

現行 18 cases **不足以**證明行為正確。RE-1 要求後續收緊至少：

| Case 意圖 | 現行問題 | 應改為 |
| --- | --- | --- |
| 保守 + 低血量 | 允許 ATTACK 仍 PASS | 必須 `EVADE` 或 `RETREAT` |
| 擊殺後掉落 | 允許「只有傷害、無擊殺／掉落」PASS | 需 `kills≥1` 且 uncollected 或 collected loot ≥1 |
| 人格 | 未測 | 非灰影貓 `canLaunch===false` |
| 退出 | matrix：`RE1 E-EXIT` | `return_home` 不增加 `interventionPressure` |
| 強制介入 | matrix：`RE1 E-COERCE` | 溫和戰術不加；積極／集火才加 |
| 農場 | matrix：`RE1 E-FARM` | settlement 在僅 kills／shards 時 bond／trust delta = 0 |
| REST FPS | matrix：`P1 REST heart` | 同 1 秒真實時間，1/30/60/120 FPS 等價 |

## 12. Exit criteria for RE-1

- [x] 本合約草稿入庫（本檔）
- [ ] Owner 核准封印（`sealed v1`）或 ledger 明示 waiver
- [x] E-EXIT／E-COERCE／E-FARM／E-PERSONA 自動化 cases（matrix；仍非正式 release gate）
- [x] Soul Talk 結算不再直寫第三人稱 `companion` journal（已拆 system／第一人稱 adapter）
- [ ] 完整 Raphael intent／critic／memoryWriter 事件鏈（仍為 partial／TODO）
- [ ] Owner feel-check：一趟遠征感覺是「一起出門」而非「刷怪升好感」

### RE-2 開工條件（理順後）

| 條件 | 說明 |
| --- | --- |
| 預設紀律 | playbook：RA／RS 穩定後再深化 Expedition；RE-1 宜先封印 |
| Owner 明示例外 | 2026-07-14 Owner 指示可在 `draft awaiting seal` 上先做 RE-2 runtime |
| 不可宣稱 | 即使 RE-2 開工，在 Owner seal＋feel-check 前不得標「Core 完整整合」或商業上線 |

## 13. Non-goals

- 三人遠征戰力隊伍／編隊 DPS
- 正式俯視 spritesheet（美術包）
- 全域天候引擎（區域氛圍粒子可保留）
- 改寫 `battleEngine` 對峙數值
- 安裝外部 game-ai／Godot combat skill 填洞
- 在 Owner feel-check 前把 Expedition 標為 commercial-ready

## 14. Current verdict snapshot（2026-07-14，RE-2 P1 後）

| 面向 | 判定 |
| --- | --- |
| Utility AI／狀態機 | Prototype 合格；session heart 已接（REST 已修 FPS 綁定） |
| RaphaelCore 權限分工 | 方向正確；結算有 adapter＋lite memory policy，**完整裁決鏈未完成** |
| 夥伴自主與邊界 | 進步：E-EXIT／E-COERCE／非農場已落地 |
| 角色差異 | **已 fail-closed**（無 adventure profile 不可出發；不再 fallback 灰影貓） |
| 記憶延續 | 部分合格：讀橋存在；寫入為 `expedition_lite_v1`，未走完整 memoryWriter |
| QA／發布門檻 | matrix 加嚴；仍非正式 release proof |

一句话：

> **RaphaelCore 管「牠是誰、願不願意、記住什麼、怎麼理解這趟旅程」；Utility AI 管「牠下一步往哪走」。**
