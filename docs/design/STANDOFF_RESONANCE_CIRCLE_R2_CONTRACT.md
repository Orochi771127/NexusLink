# STANDOFF_RESONANCE_CIRCLE_R2_CONTRACT.md
# 三心同場／共鳴圈 R2 契約

> **狀態**：`ACTIVE SUBORDINATE DESIGN CONTRACT / P0-P4 IMPLEMENTED / REFLECTION ACTIVATION GATED`
>
> **Owner direction**：2026-08-01 核准以既有情緒對峙與共鳴圈承接「三位夥伴同場自主判斷」；不新增普通 RPG 競技模式。玩家可選擇保留手動同行，或把每拍的 lead action 託付給主夥伴；每場最多提出一次共鳴請託，但夥伴保有接受、改寫、休息或拒絕的權利。
>
> **權威關係**：本文件服從 `NEXUS_LINK_MASTER_CANON_v3.1.md`、`CLAUDE.md`、`AGENTS.md` 與 `ACCEPTANCE.md`，並從屬於現行 Emotional Standoff、Chapter Resonance 與 Companion Growth 契約。衝突時，上位 canon、七條安全紅線、既有四種安全結局與 Growth source authority 優先。
>
> **Purpose**：鎖定 `STANDOFF_RESONANCE_CIRCLE_R2` 的 P1 runtime、UI、權限、生命週期與驗收邊界。P2 棲地生活節奏、P3 生態相位／共鳴織痕、P4 Reflection／Codex lived paths、P5 覺醒邀請與形態資產均須另開 TASK_PACK；不得以本契約宣稱它們已實作。

---

## 1. 一句話定位

> 對峙前，玩家與最多三位夥伴共同約定怎麼面對裂隙；對峙中，主夥伴讀取下一拍、自己的疲勞與彼此狀態後自行領拍，圈員以可見、有限且可休息的姿態加入，玩家始終能接手、撤退，或提出一次不保證服從的請託。

這不是自動刷關、戰力隊伍或把夥伴變成技能。它要保留的樂趣是：玩家在場外理解與協商，在場內看見三個有不同節奏、判斷與界線的生命一起回應。

---

## 2. Current runtime truth 與 P1 差距

| Current runtime 已有 | P1 才可宣稱完成 |
|---|---|
| `resonanceCircleEngine` 最多派生 active companion 以外兩位圈員，預設依 `joinedAt` 早者優先 | 開場前的共鳴協議、合法邀請名單與 session-only 選擇 |
| `battleEngine` 有 `resonance / barrier / pulse / retreat`、`surge / gather / lull` 預示、圈員五行姿態與每位三口呼吸 | `manual / entrusted` 兩種操控、三種共同約定、確定性 lead decision、一次共鳴請託 |
| 圈員呼吸耗盡後退到圈外休息，下一場重新開始 | 每位夥伴的接受／改寫／休息／拒絕，以及對應 body cue 與 reason id |
| `battleController` 以文字 chip 顯示圈員姓名、姿態與呼吸；只有 active companion 播放正式角色動畫 | 最多三位夥伴同場可見、每位獨立 animation event、意圖與喘息可讀 |
| 四種 outcome：`stabilized / recovered / retreated / overwhelmed_but_safe` | 保留相同四種 outcome，不新增失敗、死亡、淘汰或掉落結局 |
| RaphaelCore 可在對峙前後表達；Nuwa standoff heuristic 為 `trusted:false` | 逐拍決策由純確定性 engine 執行；RaphaelCore／Nuwa／renderer 不取得 simulation authority |

P0 只建立契約、驗收與基線證據，不得把右欄寫成 current integration。

---

## 3. 封印的不變量

1. **同場上限為三位**：一位 active lead，加零至兩位合法圈員。
2. **每拍只有一個完整 lead action**：圈員只觸發既有輕量 stance，不可把一拍放大成三倍行動。
3. **玩家仍能影響，不能支配**：手動同行、接手、撤退與一次請託永遠可達；請託不是命令。
4. **退圈是喘息，不是死亡**：呼吸耗盡只讓該圈員本場休息；不受傷、不永久缺席、不扣關係。
5. **四種安全結局不變**：不得新增 win／lose、HP 歸零、擊殺、淘汰或懲罰性結算。
6. **`battleEngine` 是唯一逐拍結算權威**：pure autonomy engine 只選合法 action；controller 只調度；renderer 只表演。
7. **沒有暗中服從率**：bond、trust、rarity、Growth stage、付費或收集率不得提高接受／命中機率，也不得讓拒絕暗中破壞結果。
8. **全部準備資料為 session-only**：圈員、共同約定、操控模式、請託與回應不得加入 save schema、preset、Growth、reward、memory 或 trace。
9. **safe harbor 為終端**：開始前或 session 中進入高風險安全路徑時，立即停止自主調度與未完成請託；只保留安全 UI，零 gameplay state delta。
10. **無 FOMO／農場**：無每日、倒數、賽季、排行、勝場、圖鑑完成門檻或 replay reward。

---

## 4. 共鳴協議

### 4.1 合法邀請名單

候選者必須同時符合：

- known companion id；
- 已結緣／已解鎖；
- registry 標記 runtime-enabled／runtime-ready；
- 不是 active companion；
- 有該 companion 自己的 relationship owner snapshot；
- 不在安全終端。

未知、鎖定、非 runtime、owner mismatch、資料缺失或損壞均 fail closed。最多選兩位；零位與一位圈員都是完整合法路徑。UI 不顯示「缺一位」、補滿提示或推薦戰力。沒有使用者選擇時，才沿用既有 `joinedAt` 早者優先，維持舊行為。

### 4.2 Preparation shape

```js
{
  controlMode: "manual",        // manual | entrusted
  approach: "adaptive",         // adaptive | attune | shelter
  invitedIds: ["sprigfawn", "auriowl"],
  participation: [
    {
      companionId: "sprigfawn",
      outcomeId: "accept",      // accept | rewrite | rest | decline
      stanceId: "wood_recede",
      bodyCueId: "step_closer",
      reasonId: "steady_and_ready"
    }
  ]
}
```

只有 `accept` 與由夥伴主動縮小距離／強度的合法 `rewrite` 可進入共鳴圈：

- `steady / curious`：可接受合法邀請。
- `guarded` 且沒有近期明確拒絕：改寫為站在圈邊見證，不強迫靠近。
- `guarded` 且有明確拒絕、`distant` 或 blocked boundary：拒絕。
- `resting`：選擇休息。
- `safeHarborMode`：不建立 preparation、不播變體、不寫任何紀錄。

拒絕或休息後直接以較小的圈開始；不得自動替補另一位，也不得要求玩家反覆詢問。

### 4.3 三種共同約定

| id | 玩家可見名稱 | 預設 lead 規則 |
|---|---|---|
| `adaptive` | 順著下一拍 | `surge` 優先設界；`gather` 優先共鳴；`lull` 在安全且可用時使用脈衝，否則共鳴 |
| `attune` | 先聽清楚 | 共鳴優先；穩定偏低時設界；預設不使用脈衝 |
| `shelter` | 先護住彼此 | 邊界低於兩層或穩定低於 80% 時設界，其餘共鳴；不使用脈衝 |

共同安全覆寫永遠先於上述偏好：

- 穩定度 `<= 35%`、疲勞 `>= MAX_FATIGUE - 1`，或 `surge` 前沒有邊界時，選擇設界。
- `pulse` 只有在穩定度 `> 55%`、疲勞 `<= MAX_FATIGUE - 2` 且同步足夠時才是候選。
- 所有候選 action 必須先通過既有 `canUseAction()`。
- 規則只能使用已封存 session truth；不得讀即時 bond／trust 去算服從或威力。

---

## 5. 操控、確定性與一次共鳴請託

### 5.1 操控模式

- `manual / 同行`：保留既有 `resonance / barrier / pulse / retreat` 玩家操作。
- `entrusted / 共鳴託付`：主夥伴依共同約定自行選擇 lead action；玩家只保留暫停／接手、一次共鳴請託與撤退。

`entrusted` 可標為推薦，但每場都須由玩家明示選擇，不持久化、不默認鎖定。接手只切換 UI/control mode，不重建 session、不重擲 `nextIntent`、不重算圈員。

### 5.2 Autonomous beat contract

```js
{
  session: nextSession,
  leadDecision: {
    companionId: "greyshade-cat",
    actionId: "barrier",
    reasonId: "surge_without_boundary",
    animationIntent: "standoff.barrier"
  },
  supportEvents: [
    {
      companionId: "sprigfawn",
      stanceId: "wood_recede",
      state: "acted"            // acted | waiting | resting
    }
  ],
  verdict: null
}
```

- 同一 seed、session truth、approach 與 pending request 必須得到同一結果。
- 下一拍預示至少可見 `1200ms`，再開始 lead action。
- lead animation／明確 reduced-motion 替代完成後，才執行既有 noise turn。
- entrusted 最多連續運行 20 拍；尚未結束則暫停，讓玩家接手或撤退，不自動判負。
- `visibilitychange`、panel owner 改變、modal 關閉、active companion 改變或安全終端都必須立即暫停／清理。

### 5.3 一次共鳴請託

每場只可解析一次，目標必須是仍在圈內且未休息的夥伴：

| 玩家請託 | requested action |
|---|---|
| 請幫我們守住界線 | `barrier` |
| 一起聽清這道回聲 | `resonance` |
| 現在放輕這一拍 | `pulse` |

回應規則：

- `steady / curious` 且 action 安全合法：`accept`。
- `guarded` 或 requested action 不安全：`rewrite` 成 `barrier` 或 `resonance`。
- `resting`：`rest`。
- 明確拒絕／blocked boundary：`decline`。

四種回應都消耗本場唯一請託，避免反覆施壓；只影響下一個 lead action，不改後續偏好，不寫 bond、trust、Growth、reward、memory、trace 或 cooldown。請託對 support companion 不產生額外 stance 數值。

---

## 6. Authority 與資料流

```text
known registry + per-companion owner snapshot
  -> preparation eligibility / participation（純推導）
  -> createStandoffSession（封存 session truth）
  -> deterministic autonomy chooses one legal lead action
  -> existing battleEngine applies lead + support stance + noise turn
  -> existing outcome/settlement/Growth owner

renderer <- animation events / display snapshot only
RaphaelCore <- pre/post expression only
Nuwa <- trusted:false advisory/eval only
```

模組邊界：

- `standoffAutonomyEngine`：無 DOM、Pixi、store、localStorage、RaphaelCore、wall-clock mutation；輸入快照，輸出 decision／request resolution。
- `resonanceCircleEngine`：負責合法成員、stance 與每場呼吸，不建立永久隊伍。
- `battleEngine`：唯一 noise／stability／sync／fatigue／boundary／微光與 outcome 結算權威。
- `battleController`：準備 UI、節奏、暫停、接手、撤退與 teardown；不得自行改 outcome。
- `standoffCircleRenderer`：只消費 display snapshot 與專用動畫事件；不得讀寫 store、Growth、relationship 或 settlement。
- RaphaelCore／Nuwa：只可組合賽前／賽後語句或離線評估；不得逐拍決定 action、改 RNG、改 stats、改冷卻或改安全終端。

專用動畫事件 shape：

```js
{
  sessionKey,
  beatIndex,
  companionId,
  role: "lead",                // lead | support
  intent: "standoff.barrier",
  reasonId,
  bodyCueId
}
```

不得借用只能指向 active companion 的全域 animation event 播放圈員。

---

## 7. 三心同場視覺與可及性

- battle modal 內動態掛載透明 Pixi surface；關閉／結算時完整 destroy，不修改全域 `pixiApp.js` ownership。
- active companion 在中央前方，最多兩位圈員分居左後／右後；裂隙保持上方中央。
- 同時只載入本場三位角色需要的 standoff animation subset，不暖載全 roster／全 512 sheets。
- 每位夥伴都要有可讀 intent、body cue、breath/rest state；玩家不需從顏色單獨推斷。
- reduced motion 停用衝刺、位移與震動，但保留姿態、理由、事件順序與所有 gameplay timing truth。
- 缺資產只可 fallback 到同一 companion 的 approved static visual 或中性輪廓；不得 fallback 成其他角色。
- 新主要 target 至少 `44px`，新觸控操作以 `48px` 為目標；支援鍵盤與 screen reader label。
- `390x844`、`390x664`、desktop 與 200% 文字下，不得出現水平 overflow；裂隙預示、三位角色、理由、呼吸與控制列不可互相遮擋。

---

## 8. Outcome、Growth 與 First Session

### 8.1 結局封印

R2 只能沿用：

- `stabilized`
- `recovered`
- `retreated`
- `overwhelmed_but_safe`

支援者接受、改寫、休息、拒絕、退圈或玩家切換 control mode 不得建立第五種 outcome，也不得改變四種 outcome 對 Growth 的既有等價規則。

### 8.2 零額外持久寫入

共鳴協議、圈員參與、autonomy reason、請託與三角色表演本身全部為零永久寫入。只有既有 standoff settlement／first-clear／Growth source owner 可依上位契約寫入既有 canonical state；replay、拒絕、休息、撤退與安全中止不得因此增加額外 evidence。

### 8.3 First Session 邊界

- First Session 十拍、安全 `moonlake_camp` 與 Return Echo 不新增 R2 教學、準備畫面或三夥伴要求。
- R2 入口只可在 Return Echo 後、且玩家已有合法多夥伴狀態時出現。
- 玩家尚無圈員時，原本單夥伴對峙仍完整可玩；不得展示空槽、鎖圖或收集引導。
- 不新增 onboarding flag、localStorage key、紅點、倒數、每日、未完成提醒或「湊滿三位」提示。

---

## 9. Release gate

P1 至少須自動驗證：

1. 相同輸入的確定性；每拍恰好一個 lead action；最多兩個 bounded support events。
2. known／joined／unlocked／runtime-enabled／owner match 與零至兩圈員矩陣；非法輸入 fail closed。
3. 三 approach、安全覆寫、`canUseAction()`、20 拍上限、暫停／接手／撤退。
4. 請託的 accept／rewrite／rest／decline、once-only 與完整零寫入。
5. safe harbor preflight／mid-session 終止，完整 relationship／Growth／reward／memory／trace 零變化。
6. 圈員耗盡只休息；四種 outcome、single-companion path、first-clear 與 replay regression 不變。
7. renderer teardown 後 timer、listener、Pixi node 為零；角色 fallback 不串角。
8. mobile／desktop／200% text／keyboard／touch／screen reader／reduced-motion proof。
9. First Session、Initial Bond、selector、chapter gate、resonance invite、Growth、Orbit 與 Expedition 回歸保持全綠。

人類 feel-check：至少 4/5 測試者能說明兩位夥伴為何那樣做、至少 4/5 理解請託不是命令、5/5 在十秒內找到接手與撤退，且不超過 1/5 將它理解成 DPS／屬性剋制的普通 RPG 自動戰鬥。

---

## 10. 明確不做

- 不新增普通 RPG 戰鬥、競技場、PvP、排名、MMR、賽季、掉落或戰力隊伍。
- 不新增 HP／ATK／DEF、裝備、稀有度、屬性刷關或技能指令列。
- 不新增捕捉、擁有、死亡、蛋化、永久失去、餵食／排泄／疾病或 offline decay。
- 不修改 Master Canon、First Session、`index.html`、save schema、`pixiApp.js` 或 `assets/**`。
- 不把 Expedition Utility AI 或 `coreIntegrated:false` bridge 當成對峙 autonomy authority。
- 不把本契約視為 P5 形態資產、save schema 或其他 GROUNDWORK 的施工授權。

---

## 11. 2026-08-01 實作狀態

- P0：契約、Acceptance、雙 lane 台帳與 Expedition「微光」測試漂移已完成。
- P1：共鳴協議、三種共同約定、manual／entrusted、一次請託、20 拍暫停、專用三角色 Pixi renderer 與安全終端已接入。
- P2：Heart Phase 棲地節奏與 care evidence candidate-first 接線已完成；rest／decline／未接受 rewrite 仍為零證據。
- P3：晨／晝／暮／夜等價相位、程序化共鳴織痕與三種已通關裂隙譜式已完成；全部保持 session-only／零獎勵。
- P4：Codex lived paths 已成為既有 canonical Growth state 的唯讀投影。Reflection owner／去重／安全 gate 已實作，但現行 normalized memory／trace 尚未保存不可變 owner 與 safety provenance，因此 production activation 必須 fail closed；後續需另開 schema／source-creator GROUNDWORK，禁止以 active companion 推測 owner。
- P5：覺醒邀請與正式形態資產未納入本包，維持另案核准。
