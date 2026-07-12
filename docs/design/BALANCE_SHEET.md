# Nexus Link — 平衡數值表（BALANCE SHEET / 數值 SSOT）

> 目的：把散落在各引擎的調校常數收成**單一可讀、可調的真相來源**。改數值前先看這裡；改完程式也回來同步這裡。
> 狀態：v1（2026-07-03 建立，對照當前 `main` 程式碼抽出）。本檔為 **design reference（LOW risk）**，不是程式；程式仍以各來源檔為準，但兩者數值必須一致。
> 紅線提醒：調數值不得製造 FOMO / 打卡壓迫 / 懲罰式結算 / 依賴偵測。四結局永遠「勝不驕、敗不罰」。

---

## 0. 核心狀態初值（`src/state/defaultState.js`）

| 欄位 | 初值 | 範圍 | 說明 |
|---|---|---|---|
| `bond` | 0 | 0–100 | 羈絆深度；觸發里程碑 12/25/45/70/90 |
| `trust` | 5 | 0–100 | 信任；影響觸碰接受度、對峙回饋 |
| `mood` | `calm` | mood key | 影響待機動畫、能量、觸碰門檻 |
| `energy` | 10 | 0–10 | 夥伴精力；低（≤2）會被動拒絕觸碰 |
| `defense` | 35 | 0–100 | 邊界硬度；進觸碰公式與環境語氣 |
| `touchFatigue` | 0 | 0–10 | 觸碰飽和；高則自動拒絕 |
| `spamScore` | 0 | 0→衰減 | 洗頻偵測；每 1000ms 衰減 |

> ⚠️ 此檔屬 **GROUNDWORK**：改初值/加欄位需評估舊存檔 migration（`store.normalizeState` 為淺層 merge），要 human 逐項核可。

---

## 1. 觸碰・邊界反應（`src/engine/touchReactionEngine.js` + `src/engine/personalityProfile.js`）

**公式**
```
safetyScore     = baseSafety(30) + trust×0.5 + bond×0.8 + moodModifier + energy×0.2 − touchFatigue×1.5
defenseThreshold = baseDefense(30) + defense×0.65 − trust×0.5
delta           = safetyScore − defenseThreshold
```
**判定**：`delta ≥ 25` → accept；`≥ 0` → guarded_accept；`≥ −20` → hesitate；否則 reject。

| 權重 / 門檻 | 值 | 可調範圍 | 影響 |
|---|---|---|---|
| baseSafety | 30 | 20–40 | 整體開放基線 |
| baseDefense | 30 | 20–40 | 整體戒心基線 |
| trustWeight | 0.5 | 0.3–0.8 | 信任換開放的效率 |
| bondWeight | 0.8 | 0.5–1.0 | 羈絆換開放的效率（最強項） |
| energyWeight | 0.2 | 0.1–0.4 | 精力對開放的加成 |
| fatigueSensitivity | 1.5 | 1.0–2.0 | 觸碰疲勞的懲罰斜率 |
| defenseWeight | 0.65 | 0.4–0.8 | defense 轉戒心的效率 |
| trustDefenseReduction | 0.5 | 0.3–0.7 | 信任抵銷戒心 |
| accept 門檻 | 25 | 20–30 | 全然接受的高標 |
| guardedAccept 門檻 | 0 | −5–5 | 謹慎接受 |
| hesitate 門檻 | −20 | −25–−15 | 猶豫下限，再低即 reject |

**mood 修正**：calm +10 / happy +20 / warm +15 / sad −10 / defensive −25 / distant −15 / tired −12。

**疲勞規則**：firstTouch +0.5、touch +1、hug +1.5；`rejectAt = 8`（≥8 直接拒絕）、`acceptDowngradeAt = 6`（≥6 時 accept 降級為 hesitate）。

**保護機制**：首次觸碰恆為 guarded_accept；首次擁抱 accept→guarded_accept。**擋觸**：距上次 reject < 3000ms 視為 blocked；`blockedTouchCount ≥ 3` → defense +1、trust −1；重置窗 30000ms。

> 調校備註：`bondWeight`（0.8）是「高 bond 解鎖親密」的主槓桿。**不得**把 rejectAt 拉到永不拒絕——夥伴永遠保有拒絕能力（契約三）。

---

## 2. 情緒對峙 / 穩住裂隙（`src/engine/battleEngine.js`）

**全域常數**

| 常數 | 值 | 可調 | 影響 |
|---|---|---|---|
| `SHARD_GOAL` | 3 | 3–4 | 集滿記憶微光 → recovered 結局 |
| `MAX_SYNC` | 5 | 4–6 | 同步上限（脈衝資源天花板） |
| `MAX_FATIGUE` | 6 | 5–8 | 對峙疲勞上限；≥5 共鳴效率降 0.7× |
| `MAX_BOUNDARY` | 3 | 2–4 | 邊界層上限 |
| `PULSE_SYNC_COST` | 2 | 2–3 | 脈衝耗同步 |
| `BOUNDARY_DAMPING_PER_LAYER` | 0.25 | 0.2–0.33 | 每層邊界減湧動 25% |

**開場（`createStandoffSession`）**
```
stability.max = round(22 + radar.emotion×0.16 + bond×0.18)
resonancePower = round(5 + radar.emotion×0.05 + bond×0.08)
noise.current = noise.max = enemy.maxHp    // ← 底層仍是「把 noise 歸零」；語言層包成情緒讀取
sync = 1, fatigue = 0, boundary = 0, shards = 0
```

**行動**

| 行動 | 雜訊(noise) | 同步 | 疲勞 | 其他 |
|---|---|---|---|---|
| resonance | −max(1, round(resonancePower × eff × aff × resonanceBonus + rng×3)) | +1 | +1 | eff=疲勞≥5 時 0.7 否則 1；未滿 3 時收 1 shard |
| barrier | — | +1 | — | stability +（5 + barrierStability）；boundary +（1 + barrierBoundaryBonus） |
| pulse | −max(1, round(resonancePower × 1.9 × pulseBonus + rng×4)) | −2 | +2 | stability −2；需 sync≥2 且 fatigue<6 |
| retreat | — | — | — | 立即 retreated 結局（永遠有效） |

**裂隙心相（元素契合）**：attuned ×1.25 / dissonant ×0.85 / neutral ×1。

| 裂隙情緒 | attuned（安撫） | dissonant（相沖） |
|---|---|---|
| sadness 低鳴 | fire | water |
| anger 沉怒 | water | earth |
| anxiety 迷茫 | earth | wood |
| fatigue 倦怠 | wood | metal |
| loneliness 孤鳴 | metal | fire |

**Radar 修正**（`dev(x)=x−50`，全部限幅、不讓任何夥伴無用）
```
resonanceBonus       = 1 + clamp(dev(healing)×0.004, −0.12, 0.16)
barrierStability     = round(clamp(dev(defense)×0.08, −2, 3))
barrierBoundaryBonus = defense ≥ 80 ? 1 : 0
pulseBonus           = 1 + clamp(dev(power)×0.004, −0.12, 0.18)
```

**雜訊回合（`applyNoiseTurn`）**：`rng < enemyLullChance` → 暫歇；否則 `surge = max(1, round(enemySurge × (0.85 + rng×0.3) × damping))`，`damping = 1 − boundary×0.25`，湧動後 boundary −1。

**四結局結算（`summarizeStandoffOutcome`）**

| 結局 | 條件 | bond | trust | mood | energy | 記憶種子 |
|---|---|---|---|---|---|---|
| stabilized | noise ≤ 0 | +3 | +1 | happy | −2 | 安撫過的裂隙（intensity 0.5） |
| recovered | shards ≥ 3 | +2 | +2 | happy | −1 | 被接住的微光（0.5） |
| overwhelmed_but_safe | stability ≤ 0 | +1 | +1 | tired | −3 | 被護住的疲憊（0.6） |
| retreated | 玩家撤退 | 0 | +1 | calm | −1 | 無 |

疲勞回寫：`fatigue ≥ 4` → 額外 energy −1；`fatigue ≥ 5` → touchFatigue +1。

> 調校備註：深度應來自「意圖可讀 + 心相選擇 + sync/fatigue 經濟 + 相位弧」（見 roadmap B1–B3），**不是**把傷害/掉寶加大。四結局的 bond/trust 差距刻意小（±1–3），避免逼玩家追求「最優結局」。

### 2.1 裂隙相位 + 意圖 telegraph（Phase 2・B1/B2，已實作）

每個玩家回合，裂隙「預示」下一拍意圖（telegraph），玩家據此選穩住/設界/脈衝；相位隨 noise 比例推移，給對峙一條情緒弧。

| 相位（noise 比例） | 意圖權重 surge / gather / lull | 感覺 |
|---|---|---|
| turbulent 翻湧（≥ 66%） | 0.60 / 0.30 / 0.10 | 一開場最躁，多湧動 |
| contested 拉鋸（33–66%） | 0.45 / 0.25 / 0.30 | 拉鋸、混合 |
| settling 漸靜（< 33%） | 0.20 / 0.10 / 0.70 | 安撫下來、多暫歇 |

- 高 `enemyLullChance` 裂隙：lull 權重額外 +`guardChance × 0.4`（觀察型更常暫歇）。
- **意圖效果**：`surge` 湧動＝扣穩定（邊界每層減 25%）；`gather` 蓄能＝這拍不扣、設 `charged`，**下一次 surge ×1.5**（telegraph 標「蓄勢」danger 色）；`lull` 暫歇＝不扣、可安心共鳴回收微光。
- 全程仍非懲罰、撤退永遠有效；深度來自可讀性與節奏，非傷害膨脹。

### 2.2 記憶微光的節奏門檻（B3）+ 手感（B4）

- **B3**：`resonance` 回收記憶微光（shard）只在 **`sync ≥ 3`（進入節奏）** 時發生。這讓兩條收束路線明確分開：
  - `stabilized`＝把 noise 清零（多用 `pulse`，但 pulse 耗 2 sync、會打斷節奏）。
  - `recovered`＝集滿 3 微光（養 sync、少 pulse、持續 `resonance`／`barrier`）。
  同步不足時共鳴會提示「養起節奏才接得住微光」。
- **B4 手感**（`battleController.js` 一次性視覺，尊重 reduced-motion）：雜訊放輕→noise 條柔光一閃；心核被撞→stability 條晃動（單次掉 ≥6 更晃）；回收微光→shard 晶光爆閃。

### 2.3 共鳴圈（CH-6，`src/engine/resonanceCircleEngine.js`）

非戰力隊伍：圈員貢獻共鳴與陪伴，不是輸出。玩家四鍵不變、對峙中不換人。

| 常數 | 值 | 意義 |
|---|---|---|
| `MAX_CIRCLE_SIZE` | 3 | 同場上限（主夥伴＋最多 2 圈員；Owner 定版） |
| `MAX_MEMBER_BREATH` | 3 | 圈員呼吸：姿態每發動一次用 1 口氣，用盡退圈喘息（非懲罰，下一場自動回歸） |
| 圈組成 | 最早結緣優先 | `resonance.companions[id].joinedAt` 升冪、需已解鎖；進場前定圈 |
| 圈內相性 | 取最佳 | attuned > neutral > dissonant；主夥伴相沖且有圈員陪同時稀釋回 neutral（圈只幫不害） |

陪伴姿態（element → 一個輕量被動，全部 ±1/±2、有上限）：

| 元素 | 姿態 | 效果 | 觸發 |
|---|---|---|---|
| 木 | 青蔭 | noise −1／位 | 每個雜訊拍 |
| 水 | 霜緩 | 設界穩定 +1／位 | `barrier` |
| 土 | 磐守 | 湧動衝擊 −1／位（至少留 1） | `surge` |
| 火 | 餘燼 | 共鳴放輕 +1／位 | `resonance` |
| 金 | 清鳴 | 同步 +1／位（上限 MAX_SYNC） | `lull` |
| 中性 | 靜候 | 穩定 +2，一場一次 | 心核首次跌破 50% |

主夥伴 `fatigue == MAX_FATIGUE` 時追加一次性「先撤退也是照顧彼此」建議（不強制、不懲罰）。
> 紅線對照：無排行、無等級、無數值進度提示（紅線 6）；退圈是喘息不是死亡（紅線 2 精神）。

---

## 3. 敵人（裂殘影）（`src/data/enemyRegistry.js`）

| id | 情緒 | maxHp(=noise) | attack(=surge) | guardChance(=lull) |
|---|---|---|---|---|
| static_wisp 雜訊殘影 | sadness | 26 | 4 | 0.15 |
| weary_husk 倦怠殘殼 | fatigue | 32 | 5 | 0.25 |
| crystal_golemite 晶屑魔像 | anger | 38 | 6 | 0.30 |
| hollow_echo 空鳴回響 | loneliness | 42 | 7 | 0.18 |
| rift_shade 裂隙暗影 | anxiety | 46 | 8 | 0.20 | — |
| tearveil_wisp 淚幕殘影 | sadness | 22 | 3 | 0.22 | lull +0.15（溫和易安撫） |
| sink_weight 沉墜殘殼 | fatigue | 52 | 4 | 0.30 | surge −0.15 / lull +0.2（沉重多歇） |
| spite_ember 慍火殘影 | anger | 40 | 9 | 0.12 | surge +0.2 / lull −0.1（一點就炸） |
| drift_murmur 飄鳴回響 | loneliness | 44 | 6 | 0.28 | lull +0.2（常停下等回應） |
| dread_coil 纏懼暗影 | anxiety | 48 | 7 | 0.18 | gather +0.25（纏緊後重擊） |

（表頭第 6 欄＝`intentBias`：加到相位意圖權重上的傾向，見 §2.1。）

> 現況（A3 已做）：10 隻、五情緒各 2、各具原型與 intentBias。`maxHp/attack` 命名底層仍是 HP 形狀（B5 可選：改名 `noiseDensity/surge`）。

---

## 4. 探索節點（`src/data/explorationNodes.js`）

| id | 類型 | encounterChance | 敵人池 | 主要獎勵 |
|---|---|---|---|---|
| moonlake_camp 月湖營地 | rest | 0 | — | energy +2, mood calm |
| starwood_trail 星林步道 | peaceful | 0.15 | static_wisp | bond +2, mood warm |
| crystal_ruins 晶岩遺跡 | discovery | 0.35 | crystal_golemite, static_wisp | trust +2, bond +1 |
| misttide_shore 霧潮河岸 | reflective | 0.10 | static_wisp | energy +1, mood calm（掛記憶種子） |
| rift_observatory 裂隙觀測點 | danger | 1.00 | 五情緒隨機（10 隻池） | trust +3 |
| mirror_hollow 湖心倒影 | reflective | 0.08 | tearveil_wisp | trust +1, mood calm（掛記憶種子） |

> A4 已做：6 節點（單一月湖區）；每節點 result 訊息加厚到 4–5 句；reflective 記憶改為**節點感知**（label/excerpt 依節點，見 `explorationEngine`）；`bond ≥ 45` 時非危險節點多一句夥伴主動舉動（`HIGH_BOND_FLOURISH`）。**不擴世界地圖、不做每日派遣**。

---

## 5. 羈絆里程碑（`src/engine/bondMilestoneEngine.js`）

| id | tier | 門檻 bond | 主題 |
|---|---|---|---|
| bond_milestone_1 | 0 | 12 | 初亮的記憶 |
| bond_milestone_2 | 1 | 25 | 信任萌芽 |
| bond_milestone_3 | 2 | 45 | 可以放心的地方 |
| bond_milestone_4 | 3 | 70 | 並肩 |
| bond_milestone_5 | 4 | 90 | 不滅的湖光 |

里程碑記憶：`emotion=gratitude`、`intensity=0.9`、`symbol=bond_rune`、`place=magic_circle`。一次綻放一階、只增不減（契約一）。五元守護有各自 tone 台詞（`MILESTONE_LINES_BY_TONE`）。

### 5.1 演化線（`src/data/evolutionLines.js`，A5 已填充）

六條線各 3 階（幼年→成長→成熟）。**解鎖由羈絆推進、不由勝負**（契約：不打怪 farm）——`codexController` 以 `bondThreshold` 判定（已移除 `unlockWins`）：

| 階 | bondThreshold | 對齊里程碑 |
|---|---|---|
| 幼年期 | 0 | 一開始即見 |
| 成長期 | 25 | 信任萌芽 |
| 成熟期 | 70 | 並肩 |

> 鎖住階顯示 `unlockHint`（關係/儀式語言，明文不寫「打贏 N 場」）；解鎖階顯示 `lore`。完全體/究極體留待未來章節。

---

## 6. 記憶生命週期（`src/engine/memoryLifecycleEngine.js`）

| 常數 | 值 | 說明 |
|---|---|---|
| SETTLED | 12 小時 | fresh → settled |
| TRANSFORMED | 3 天 | settled → transformed |
| VISIBLE_MEMORY_LIMIT | 12 | 活躍可見上限，超出自動 archive 最舊者 |

狀態：fresh / settled / transformed（可見）→ released / archived（隱藏、不刪除）。記憶**只增不減**，archive/release 只隱藏不刪（契約一）。

---

## 7. 情緒沉積（`src/engine/emotionalSedimentationEngine.js` + `src/data/emotionDictionary.js`）

- 情緒與 baseIntensity：fatigue 0.55 / sadness 0.60 / anxiety 0.65 / loneliness 0.55 / anger 0.70 / gratitude 0.45 / calm 0.40。
- Safe Harbor 觸發：safety=high/caution，或 intensity ≥ 0.82，或情緒重複分 ≥ 0.65，或近期同情緒 ≥ 3 筆。
- 關鍵字：7 情緒、共 ~80 詞（roadmap A2 補 nuanced 觸發）。
- ⚠️ `safetyShieldDictionary.js`（16 條 regex）視同**安全層**，要動需 human 核可（紅線 7）。

---

## 8. 柔性邀請（`src/engine/gentleInvitationEngine.js`）

首輪後由**夥伴狀態**推導「此刻牠像是想做什麼」的門檻（純觀察式邀請、非任務）：

| kind | 觸發條件（依序，先者優先） | nav 暖光 |
|---|---|---|
| space 給空間 | safeHarborMode，或 mood ∈ {defensive, distant}，或 touchFatigue ≥ 6，或 defense ≥ 70 | 無（不推互動） |
| rest 休息 | energy ≤ 3，或 mood = tired | care |
| connect 傾訴 | mood ∈ {warm, happy} 且 trust ≥ 8 | 無（心語非 nav 項） |
| explore 探索 | 非夜間(22–6) 且 energy ≥ 5 且 bond < 45 且 mood ∈ {calm, warm} | explore |
| stillness 安穩 | mood = calm 且 bond ≥ 45 且 defense ≤ 35（敢於無聊） | 無 |
| presence 陪伴 | 以上皆非 | 無 |

> 紅線：只讀夥伴狀態，**不得**加入玩家上線頻率/孤獨/依賴偵測（紅線 1）；邀請可忽略、無紅點/倒數（紅線 6）；邊界優先（想要空間時不推互動）。

---

## 調校守則（給下一個 AI）
1. 動任何數值前，在對應 TASK_PACK 的開工計畫標明「改哪個常數、預期玩家體感差異」。
2. 改完程式**同步更新本表**，並在驗收時抽查 3–5 個常數「表↔程式」一致。
3. 禁止用數值製造：FOMO、打卡、懲罰式失敗、無法挽回結局、依賴偵測、強制進化。
4. `defaultState` / `safetyShieldDictionary` / `saveManager` 相關屬 GROUNDWORK / 安全層，逐項問。
