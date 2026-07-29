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

### 5.1 演化線 compatibility reveal（`src/data/evolutionLines.js`）

現行既有 11 條 runtime evolution line 各保留 3 段 compatibility 資料；2026-07-22 接入的黑鐵駭客五席只登記已封印的 Stage 1，並以 `complete:false` 明示後續形態尚未定版。以下 0／25／70 只描述舊三段資料的 transitional compatibility 參數（已移除 `unlockWins`），Codex 正式揭露權限已改讀每隻夥伴自己的 per-companion stage／legacy display floor；它們不是正式 Companion Growth readiness 或覺醒契約：

| 階 | bondThreshold | 對齊里程碑 |
|---|---|---|
| compatibility stage 1 | 0 | 一開始即見 |
| compatibility stage 2 | 25 | 信任萌芽 |
| compatibility stage 3 | 70 | 並肩 |

> 鎖住階目前顯示 `unlockHint`，解鎖階顯示 `lore`。正式 canon 固定為「初醒夥伴 → 共鳴成熟體 → 終局覺醒體」，不新增完全體／究極體五階線；多樣 evidence、夥伴意願、per-companion state、legacy stage floor 與 UI 邊界以 `COMPANION_GROWTH_CONTRACT_V1.md` 為準。任何新成長實作不得只調本表門檻就宣稱完成。

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

## 9. 心核迴旋戰／Orbit（R1–R6；仍服從契約）

> SSOT 契約：`docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`。
> 本節與 `src/orbit/*` 對齊；改程式時同步改表。
> 紅線：數值只能當關係投影的輸出縮放，**禁止**獨立 ATK 成長樹、每日必戰倍率、付費消過熱。

### 9.1 一局節奏（R6 deterministic baseline／2026-07-26）

> 2026-07-25 R6 speed pass 保留較快發射、彎軌與碰撞手感；2026-07-26 baseline
> 把 continuous drive 改為每秒加速度並統一 120 Hz 固定物理步，避免 FPS／子步數越高
> 就憑空得到更多速度。Runtime player 的摩擦／轉速衰減須直接引用本表常數，不可另藏 override。

| 常數（暫名） | 現行值（R6） | 舊值（R5.1） | 來源 |
|---|---|---|---|
| `MAX_SPIN_SECONDS` / `MAX_DUEL_SECONDS` | 45 / 45 | 75 / 70 | `orbitEngine.js` / `orbitDuelEngine.js` |
| 玩家轉速衰減基線 | 5.4 + overheat×0.03 /s | 4.6 + overheat×0.03 /s | `orbitEngine.js` / `orbitDuelEngine.js` |
| `LAUNCH_PULL_MIN` / `MAX` | 0.04–0.55（不變） | 同左 | `orbitPhysics.js` |
| `LAUNCH_CHARGE_EXP` | 0.82（不變，短拉仍可控） | 同左 | 同上 |
| 發射速度 | base 1.05 + charge×4.3 + Impact×0.9 | base 0.78 + charge×2.95 + Impact×0.7 | `launchVelocityFromPull` |
| 預設摩擦 / 轉速衰減 | 0.05 / 5.4 | 0.075 / 4.6 | `orbitPhysics.js` |
| `SPIN_CURVE_STRENGTH` / `SPIN_DRIVE` | 1.9 / 5.4 每秒 | 1.35 / 0.055 每畫面步 | 自旋彎軌＋持續推進；continuous drive 必須乘 `dt` |
| 牆彈／體彈 | 0.98 / 0.97 | 0.98 / 0.9 | `WALL_BOUNCE` / `BODY_RESTITUTION` |
| 碰撞傷害 cap（對 B／對 A） | 30 / 26 | 24 / 22 | `collideBodies` |
| 固定物理步／每畫面最大補步 | 1/120 s／6 | `PHYSICS_SUBSTEPS=2` | `orbitPhysics.js`；30／60／120 Hz 共用同一物理時鐘 |
| 場地視覺縮放（canvas） | 0.46 | 0.42 | `orbitBattleController.js`（`worldToScreen`/`screenToWorld`） |
| 拒戰：energy | ≤1（不變） | 同左 | `orbitStatsProjector.js` |
| 拒戰：trust+疲勞 | trust&lt;3 且 touchFatigue≥7（不變） | 同左 | 同上 |

### 9.2 投影輸出範圍（設計意圖，非最終公式）

| 戰鬥詞 | 建議顯示區間 | 來源提醒 |
|---|---|---|
| Impact | 低–高相對條，非永久等級 | bond × 共同行動；**純聊天不加** |
| Spin | 同上 | sync／默契 |
| Guard | 同上 | trust + 邊界健康 |
| Burst | 觸發型，非常駐 | 高張力共同記憶 |
| Overheat | 風險條 | fatigue／連戰／低 energy |

### 9.3 Session budget（防刷）

| 意圖 | 規則草稿 |
|---|---|
| 連打上限 | 過熱升高 → 化身易核散／夥伴拒戰；休息後回穩 |
| 重遊舊路徑 | 允許手感練習；**不得**刷永久攻擊帳或 trust |
| 星級（若做） | 只影響微光／記憶清晰度敘事，不鎖成長 |

### 9.4 月湖五區 × 五關

| 區域 | 關卡 1–5 的核心節奏 | 開放條件 |
|---|---|---|
| 星林步道 | 錨點 → 任意拾光 → 雙柱折徑 → 守圈 12s → 依序拾光＋共鳴 | 首次安全抵達月湖營地 |
| 霧潮河岸 | 低速錨點 → 側流 → 漂流拾光 → 窄徑 15s → 低速定泊 | 首次安全抵達月湖營地 |
| 湖心倒影 | 鏡像錨點 → 鏡像折返 → 對稱守圈 → 外側雙光＋中心 → 四光共鳴 | 星林與霧潮終關 |
| 晶岩遺跡 | 單柱清訊 → 三柱錨點 → 四晶連鳴 → 主動雜訊 18s → 拾光／清訊／錨點 | 湖心終關 |
| 裂隙觀測點 | 守圈 → 逆流 → 三柱清訊 → 四光共鳴 → 12s／三光／最終共鳴 | 晶岩終關 |

進度：`activityProgress.orbit.clearedStageIds` 隨既有存檔持久化；區域與
關內解鎖皆由 clear IDs 推導。撤退／失穩不倒退；重玩不再發 shard、Growth、
bond、trust 或章節推進。月湖五個地圖節點只開關卡面板，不再呼叫一般探索
結算。完整關卡值以 `src/data/orbit/stages/moonlakeStages.js` 為準。

### 9.5 R6 手感意圖（給 Owner／手測）

| 意圖 | 調校方向 |
|---|---|
| 速度感／陀螺感 | 再提初速（base 1.05／pull×4.3）、再降摩擦（0.05）；**自旋彎軌**加強（1.9） |
| 場次更短促 | `MAX_SPIN_SECONDS`/`MAX_DUEL_SECONDS` 75/70 → 45／45，轉速衰減加快（5.4），避免長時間漂移 |
| 短拉可控 | charge 曲線 `^0.82` 不變；短拉仍明顯慢於長拉（`orbit-feel-cases.mjs` 門檻同步拉高） |
| 長拉有爆發 | pull×4.3＋Impact×0.9；牆擦回饋轉速不變 |
| 多段撞擊可讀更重 | 彈性 0.97＋側向 spinKick；傷害 cap 提高到 30／26，減少乾磨 |
| 高速防穿模／可重播 | `PHYSICS_FIXED_DT=1/120`、每畫面最多補 6 步；continuous drive 全部乘 `dt` |
| 連戰過熱 | 仍由 `orbitDuelBudget`／Overheat 拒戰，不改 FOMO（本輪未動這塊） |

自動檢查：`docs/qa/orbit-feel-cases.mjs` 必須證明同一發射在 30／60／120 Hz 得到相同結果；再跑 `docs/qa/orbit-regression-cases.mjs`。
2026-07-26 本機驗證：上述兩項皆 PASS；真人手感／真機 GPU 仍依 `ORBIT_MANUAL_390x844.md` 另驗。
手動：`docs/qa/ORBIT_MANUAL_390x844.md`（真人／真機仍 open；本輪提速後應優先重測）。

### 9.6 Hybrid Spin 物理沙盒（opt-in，未進正式關卡）

> 這不是第二套模式。Runtime 仍沿用 `src/orbit/*`；只有網址帶
> `?orbitSandbox=1` 時，現有 Orbit battle controller 才為測試 body 選用
> `physicsModel="hybrid-spin-v1"`。五關與對決預設仍是 `orbit-r6`。

| 狀態／規則 | 沙盒定義 |
|---|---|
| body state | `spinDirection`（±1）、`tilt`（0–1）、`wobble`（0–1）、`spinAge`、`spinPhase` |
| lifecycle | `launch`（前 0.28s）→ `stable`（spin≥55、低晃動）→ `curving`（spin≥18、wobble&lt;0.72）→ `wobbling` → `stopped` |
| 彎軌 | 由 spin direction、tilt、wobble 的 deterministic wave 推導；不使用 RNG |
| 失穩 | 牆／柱／body 碰撞依法線撞擊強度增加 tilt 與 wobble；同時改變速度與 stability |
| 確定性 | 與 R6 共用 1/120s fixed dt；同一發射在 30／60／120 Hz 必須 exact-match |
| 寫入邊界 | `sandbox=true` 的勝利在 engine 層強制 `progressEligible=false`；controller 也跳過路徑、微光、Growth 與 save settlement |
| 可視化 | Canvas debug 顯示 phase／speed／spin／tilt／wobble／direction；body 以 tilt／wobble 橢圓化呈現 |

自動檢查：`node docs/qa/orbit-hybrid-physics-cases.mjs`。
本節只證明 Hybrid Spin 的可預測生命週期與碰撞因果；**尚未**代表月湖營地垂直切片、記憶光點、營火共鳴圈、姿態或脈衝已完成。

### 9.7 Moonlake Camp 垂直切片（opt-in）

> `?orbitCampSlice=1` 從既有探索 Orbit 入口直接開啟
> `moonlake-camp-slice`。它不加入 `MOONLAKE_STAGES`，所以月湖正式路徑仍維持
> 五關；通過真人手感 Gate 前不替換 `moonlake-1`。

| 項目 | 切片值／規則 |
|---|---|
| 目標 | `collect_then_resonate`：依序掠過 3 個記憶光點，再低速停入營火圈 0.42s |
| 對手／HP | `dummyEnabled=false`；無雜訊血條、無 HP 歸零勝利 |
| Arena | 半徑 1.0 的 contained 圓場；中央 soft well 半徑 0.74、strength 0.62、damping 0.32 |
| Stage-local physics | spin decay 9.5/s、friction 0.32、drive scale 0.12、speed cap 3.4；不改正式 R6 常數 |
| 營火圈 | 半徑 0.23；進圈後 brake 8.5/s；speed≤0.52 才累積停留 |
| 引導 | 場內虛線串起發射點 → 1 → 2 → 3 → 營火；只顯示記憶進度與停圈進度，不顯示敵方 stability |
| 結算 | `camp_resonated → recovered`；一句夥伴台詞＋session-only 弧光微痕 |
| 寫入邊界 | `prototypeSlice=true / nonPersistent=true`；engine 強制 `progressEligible=false`，controller 不呼叫路徑／vault／Growth／save settlement |
| 390 HUD | ≤420px 隱藏重複 hint、縮短 padding／字級／行高；保留 Canvas 與結算按鈕空間 |

自動檢查：`node docs/qa/orbit-moonlake-camp-slice-cases.mjs`，包含 fresh-save
短／中／長拉、順序光點、停圈、contained speed cap、零結算資格與
30／60／120 Hz exact-match。

仍未完成：真人 30 秒理解、三次手指拉動 feel-check、Safari 真觸控／GPU、
正式五關語意替換。三姿態與共鳴脈衝已於 §9.8 進入同一 opt-in 原型，
但尚未升格正式路徑。

### 9.8 Control Depth 原型（三姿態＋單次共鳴脈衝，opt-in）

> 只擴充 §9.7 的 `moonlake-camp-slice`；正式 `MOONLAKE_STAGES`、
> `moonlake-1`、對決與 R6 baseline 不套用。姿態與脈衝規則都由 stage data
> 傳入既有 `orbitEngine.js`，不建立第二套 controller／physics。

| 控制 | 決定性規則 |
|---|---|
| 直立 `upright` | speed×1.00、spin×1.00、drive×1.00、tilt 0.08、wobble 0；保留 §9.7 原始軌跡 |
| 傾斜 `tilted` | speed×0.90、spin×0.96、drive×0.92、tilt 0.46、wobble 0.08；起步較慢、較早畫弧 |
| 保守 `conservative` | speed×0.76、spin×1.08、drive×0.72、tilt 0.03、wobble 0；速度較低、較容易抓停圈 |
| 選擇時機 | 只可在 `aiming` 切換；發射後姿態鎖定，沒有中途換零件 |
| 共鳴脈衝 | 每次發射 `1/1`；只在 `spinning` 可用。速度方向以 0.34 權重有限轉向下一個未收記憶／營火，不 teleport、不直接收點 |
| 脈衝速度 | 尋路階段 speed×0.92；三點全亮後 speed×0.66，協助收束但仍須實際入圈並低速停留 |
| 脈衝穩定 | spin +6、tilt -0.10、wobble -0.16；全數 clamp，不改 stability／HP／objective |
| 寫入邊界 | 延續 `prototypeSlice / nonPersistent`；姿態與脈衝皆為 session state，不寫路徑、vault、Growth 或 save |
| 390 UI | 三顆姿態 segmented buttons＋一顆 pulse button；發射後姿態 disabled，脈衝用後顯示「已用」 |

自動檢查：`node docs/qa/orbit-control-depth-cases.mjs`。必須證明同一拉距的
速度／tilt／spin 差異、三姿態各有可完成路徑、脈衝單次鎖且不直接改
objective／outcome，以及固定時點脈衝在 30／60／120 Hz exact-match。

本包仍是操作深度證明，不代表姿態／脈衝已升格正式月湖路徑；真人是否能在
三次內說出三姿態用途、是否理解脈衝是有限修正而非自動獲勝，仍由 §7 手測
延伸項目驗收。

### 9.9 月湖節點 Action Sheet（入口收斂）

> Explore 的月湖焦點以同一張 Action Sheet 呈現三種玩法；它只解析既有
> runtime gate 與路由，不建立第二套探索、遠征或對峙流程。

| 選項 | 可用條件 | 路由／邊界 |
|---|---|---|
| 心核迴旋 | 永遠可見且為主要玩法 | 回到月湖路徑圖；五個地點各開五關面板 |
| 心域遠征 | 沿用 `isExpeditionUnlocked(state)` | 直達既有地圖 launch rows，再檢查角色、能量與節點資格 |
| 裂隙對峙 | 沿用 `canEnterUnguidedStandoff(state)` | 直開當前章合法裂隙；不先結算一般探索，也不繞過 safety gate |

直達「月湖路徑」按鈕保留，維持 first-session map gate 與既有玩家路徑。
Action Sheet 是純呈現：不寫 save、不解鎖節點、不改 bond／trust／Growth，
disabled 文案只說明目前狀態，沒有紅點、倒數或懲罰。

自動檢查：`node docs/qa/orbit-node-action-sheet-cases.mjs`，包含 fresh／進度
狀態、既有 gate 對齊、零 mutation、四語 chrome、直接地圖入口、dialog／Esc
與 mobile CSS 結構。

### 9.10 R10 能量與出界修復

| 項目 | R10 規則 |
|---|---|
| 自旋推進 | `SPIN_DRIVE=5.4` 改為目標速度回應率；只追逐 `SPIN_TARGET_SPEED=3.2`，不在高於目標時繼續加速 |
| 全域速度安全 | 預設 `speedCap=4.2`；stage 可用 `physicsTuning.speedCap` 收窄 |
| 彎軌 | 旋轉速度向量而不增加向量長度；保留彎軌但不生成動能 |
| 普通牆／柱 | `WALL_BOUNCE=0.82`；只耗能反彈，牆損失 spin 2、柱損失 spin 1；不再補速或補轉速 |
| 化身碰撞 | 所有 model 使用標準 `b-a` 相對速度；`BODY_RESTITUTION=0.78`，總平移能量上限為碰撞前 `0.96` |
| 假對手 | 預設 target speed 1.6、speed cap 2.2，避免自動巡場成為能量泵 |
| 月湖第三關 | 15 秒 contained 生存場；玩家 target 2.35／cap 2.8，假對手 target 1.25／cap 1.7；生存關玩家 stability loss ×0.18 |
| 驗收 | `orbit-energy-ringout-cases.mjs`：牆／柱／body 守恆、分離不重複衝量、144-shot 可達率、speed cap、30／60／120 Hz exact-match |

普通牆不是導流環。未來若加入裂隙導流環，必須是可見、資料驅動且獨立驗收的特殊場地規則，不能重新把加速藏回共用 boundary。

---

## 調校守則（給下一個 AI）
1. 動任何數值前，在對應 TASK_PACK 的開工計畫標明「改哪個常數、預期玩家體感差異」。
2. 改完程式**同步更新本表**，並在驗收時抽查 3–5 個常數「表↔程式」一致。
3. 禁止用數值製造：FOMO、打卡、懲罰式失敗、無法挽回結局、依賴偵測、強制進化。
4. `defaultState` / `safetyShieldDictionary` / `saveManager` 相關屬 GROUNDWORK / 安全層，逐項問。
