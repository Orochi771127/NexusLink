# 心核迴旋戰契約 V1.2（Heartcore Orbit Battle Contract）

> **Status:** `ACTIVE DESIGN CONTRACT / R1–R10 + V1–V3 + MOONLAKE 25-STAGE + PLAINS PROOF-STAGE RUNTIME IMPLEMENTED / GLOBAL 3D PILOT R1 OWNER-APPROVED, RUNTIME-PROMOTED AND PUBLISHED`
> **Date:** 2026-08-09
> **Owner:** Terence
> **Authority:** 服從 `NEXUS_LINK_MASTER_CANON_v3.1.md`、`CLAUDE.md`、`AGENTS.md`、`ACCEPTANCE.md`。
> **Sibling:** `docs/agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md`（分階段實作指令）
> **Purpose:** 所有「心核迴旋戰／Resonance Orbit」設計與實作的上位法。衝突時以本契約＋Master Canon 為準。舊 Agent Program 只保留歷史分期，不得覆蓋本檔的 current runtime truth 與 D0 修訂。

---

## 0. 一句話定位

> 平常與心核夥伴聊天、照顧、留下痕跡以培養感情；想玩時，由玩家與夥伴先共同定軌，再讓夥伴以「自我投影的迴旋形態」進入場域，用拉動發射、旋轉碰撞、界紋折返與心相 sidegrade 去解纏認知亂碼。心域遠征保留為出門取材與旅途回報。深度來自共同決策、軌跡理解與形態手感，不是服從度、獨立練等或抽卡。

### 0.1 Owner 拍板（2026-07-25）

| 項目 | 決定 |
|---|---|
| 模式優先序 | **闖關（PVE）優先**；對決（人機／幽靈）次之；即時網路 PvP 不做（另案） |
| 化身敗北預設情緒 | **惜敗陪伴**（全域預設）；個別角色可覆寫為偏「好勝想再來」 |
| 入口位置 | 掛在**探索（Explore）**的區域路徑上，不是另開主選單大類型 |
| 路徑命名 | 玩家可見短名（Owner 定版）＝**月湖／平原／熔爐／南港／核心／潮汐／秘境**＋「路徑」 |
| 進度節奏 | 破完當前路徑關卡 → **換地圖** → 進入下一區的短名路徑（例：月湖路徑 → 平原路徑） |
| 遠征 | **保留**；定位＝出門取材／旅途回報，與迴旋戰互補 |

### 0.2 D0 重定版（Owner 2026-08-01 核准）

本次是文件與驗收重定版，不是 runtime／資產施工授權。正式修訂如下：

- 心核化身不再被限制為抽象小球；可呈現夥伴可辨識的 illustrated 自我投影，但碰撞由外層共鳴場承受，夥伴本體不是彈藥。
- 正式 Growth stage 可改變 Orbit 的輪廓、慣性、碰撞體積與關卡 affordance，但只能是等總預算 sidegrade，不得形成垂直戰力。
- Owner 另核准一種與 Growth 完全分離的對局內 `base ↔ resonance` combat form：它是 session-only、雙方同規則、等總預算的共鳴變形，結束即清除，不是正式進化或 stage advance。
- 既有「每發一次共鳴脈衝 `1/1`」只保留為營火證明關與入門規則，不再是所有未來關卡的永久上限。
- 一局不再固定 60–90 秒；正式目標區間改為約 35–75 秒，依追跡、解纏或守定目標調整。
- 四個既有 outcome key 保留為安全上位分類，但可增加不帶羞辱或懲罰的玩法 subtype。
- 舊頁首「runtime 尚未實作」正式退役；current `main` 已有月湖五 zone 各五關、平原一個 proof stage、固定步物理、姿態、共鳴脈衝、非懲罰結算、first-clear settlement 與 CPU／local ghost 對決。

仍保留：夥伴意願、可拒絕／改寫／休息、撤退、能量守恆、確定性 replay、非 HP 殺怪、非懲罰失敗、零 FOMO／農場，以及 simulation／renderer／RaphaelCore 權限分離。

---

## 1. 雙層玩法架構（不可拆壞）

```text
【日常層・棲地】
聊天 / 觸碰 / 照顧 / 回歸
→ 累積：羈絆、信任、默契、邊界、疲勞、共同記憶

【玩法層・心核迴旋戰】
闖關（PVE，怪物彈珠節奏）— 第一優先
對決（人機／幽靈，戰鬥陀螺節奏）— 第二優先
→ 出場的是「夥伴自我投影的心核化身」，外層共鳴場承受碰撞
→ 玩家提出方向／力度；夥伴可在發射前接受、可見改寫、休息或拒絕
→ 結算回寫：旅痕、微光、一句話、合法 first-clear 的有限 Growth evidence
→ 不回寫：永久攻擊成長樹、每日必打、稀有度抽殼

【橋接層・心域遠征】（保留）
出門決策、區域差異、帶回微光／軌道素材／第一人稱報告
→ 可餵給迴旋戰進場（素材），不可變成刷 trust 農場
```

設計意圖（給初階開發者）：

- **沒事做時**：在棲地聊天養感情——這是產品靈魂。
- **想開一把時**：進探索的「××路徑」打短局迴旋關——這是回來玩點。
- **想出門時**：走遠征——取材與故事，不是戰力農田。

### 1.1 Current runtime truth（2026-08-01）

| 已接入 current `main` | 尚未接入；不得宣稱完成 |
|---|---|
| `src/orbit/` 固定 `1/120s` 模擬、拉曳發射、旋轉衰減、牆／柱／body 碰撞、speed cap、出場與核散 | 合息定軌的接受／可見改寫／休息／拒絕 shared-control policy |
| 月湖五個 zone × 每區五關（25 關）＋平原一個 proof stage，以及 first-clear path／vault／Growth settlement | 界紋疾走的儲能／釋放場地機關 |
| 三種 launch stance、營火證明關每發一次共鳴脈衝、30／60／120 Hz replay | 多共鳴時機、情緒動勢 snapshot、心相展開物理 sidegrade |
| CPU／local ghost 對決、連戰休息 budget、四個安全 outcome family；Moonlake camp 的玩家／敵方陀螺 3D Pilot 與 session-only combat form 已通過 Owner 視覺核准和本地 promotion QA | Stage 2／3 approved formal-stage assets、正式 G4 stage advance；3D 陀螺尚未批次擴到全角色／全關卡 |
| 現行 Orbit 由純模擬＋Canvas 2D playfield＋DOM HUD 呈現 | Pixi Orbit renderer、Matter.js／Planck.js、Node／LLM 戰鬥 runtime |

任何後續文件、PR 或發版說明都必須把左欄與右欄分開；D0 只建立右欄的實作契約，不將它們升格為 runtime-ready。

---

## 2. 探索入口與區域路徑進度（Owner 新增，鎖定）

### 2.1 玩家怎麼進去

1. 從既有 **探索／地圖** 進入當前區域。
2. 看到一條以區域命名的路徑，例如第一章：**月湖路徑**（對齊現有 UI 語感「查看月湖路徑」）。
3. 路徑內是一連串短局迴旋關（彈珠式闖關）。
4. **破完該路徑的通關條件**後，旅程換到下一張地圖／區域。
5. 新區域的入口名稱改為該區短名＋「路徑」，以此類推。

> 玩家可見短名（Owner 2026-07-25 定版）：**月湖 → 平原 → 熔爐 → 南港 → 核心 → 潮汐 → 秘境**
> 顯示為：`月湖路徑`、`平原路徑`、`熔爐路徑`、`南港路徑`、`核心路徑`、`潮汐路徑`、`秘境路徑`。
> 系統 key 仍綁 `regionId`（`moonlake`／`plains`／…）；全名區名保留於世界地圖／章節敘事。

### 2.2 七區路徑表（對齊 `src/data/chapterRegistry.js`）

| 章 | regionId | 區域全名（敘事／地圖） | 玩家可見路徑短名 |
|---|---|---|---|
| 1 | `moonlake` | 月湖營地 | **月湖路徑** |
| 2 | `plains` | 北部翠綠平原區 | **平原路徑** |
| 3 | `forge` | 東南熔爐丘陵區 | **熔爐路徑** |
| 4 | `harbor` | 南港 | **南港路徑** |
| 5 | `core` | 中央輝耀核心區 | **核心路徑** |
| 6 | `tidal` | 西南潮汐邊疆區 | **潮汐路徑** |
| 7 | `mystic` | 秘境山脈核心 | **秘境路徑** |

### 2.3 換地圖規則

1. **一區一條主路徑**（該區的迴旋戰節點串）。
2. 通關當前路徑＝滿足該路徑的「章節節點目標」。現行月湖已落地五個 zone、每區五關與解鎖鏈；另有平原一個 proof stage。平原完整路徑及其餘五區仍是 roadmap。
3. 通關後：**換地圖／切到下一章區域**；UI 文案用位置敘事（「往××的方向好像亮了一點」），禁止成就框／%／倒數。
4. 已走過的路徑可回想／重遊，但**不得**用來刷永久戰力或刷 trust。
5. 路徑進度與既有 `chapterProgress` 的關係：
   - **產品語意**：迴旋路徑是探索內的短局玩點，應服務「想再開一把」與區域主題。
   - **current runtime**：現行以 `activityProgress.orbit.clearedStageIds` 保存 first-clear；不直接把開啟地圖、失敗、撤退或重玩寫成 chapter／relationship／Growth 進度。任何跨章接線仍須另開 GROUNDWORK。

### 2.4 與「穩住裂隙」節點並存

- 現有探索節點（氣氛／裂隙對峙）**不刪**。
- 迴旋路徑是探索頁上的**另一條可選玩點**，不是取代對峙。
- 首局入口優先掛在月湖（第一章），降低「不知道點哪」的認知負擔。

---

## 3. 術語表（玩家語言 ↔ 系統意思）

| 玩家可見 | 系統／設計意思 | 禁止說法 |
|---|---|---|
| 心核化身／共鳴核 | 夥伴主動形成、由外層共鳴場承受碰撞的自我投影迴旋形態 | 「發射夥伴」「寵物兵器」 |
| 合息定軌 | 發射前共同確認參與、方向、力度與可見改寫 | 服從度檢查、強制出場 |
| 共繪軌跡 | 玩家提出意圖，夥伴確認後形成可預測 final plan | 偷偷射歪、隱藏命中率 |
| 界紋疾走 | 將預先儲存的共鳴電荷沿符文邊界轉換為高速折返 | 碰牆免費增加能量 |
| 心相展開 | 已擁有正式 stage 的可選場中表現／物理 sidegrade | 戰中刷出新正式進化、數值碾壓 |
| 對局共鳴變形 | 本局 `base ↔ resonance` 的 transient combat form；雙方同 state machine，結束即清除 | 三階覺醒、永久進化、存檔解鎖、敵方作弊型 buff |
| 衝擊 Impact | 撞擊力度（關係投影） | ATK、攻擊力升級 |
| 旋轉 Spin | 轉速／節奏穩定 | 轉速練等 |
| 韌性 Guard | 抗擊退／抗核散 | 防禦裝等級 |
| 爆發 Burst | 短促高張力輸出 | 必殺商城技 |
| 過熱 Overheat | 連打後失穩風險 | 付費消冷卻 |
| 核散 | 化身穩定性歸零而散 | 擊殺、打死夥伴 |
| 化身解聚 | 本次共振安全中止，夥伴與玩家返回棲地 | 記憶刪除、永久戰損 |
| 退場 | 被撞出軌道／主動撤 | Game Over 羞辱 |
| 認知亂碼／雜訊結 | 外部錯置訊號、未授權覆寫或關卡目標節點；不是夥伴情緒本身 | 把焦慮／悲傷當怪物打死、怪物 HP 條殺光 |
| 邊界環 | 夥伴守界；撞到＝越界反彈 | 可無視的裝飾 |
| ××路徑 | 該區域的迴旋闖關串 | 每日副本、刷材料本 |

---

## 4. 戰鬥手感契約（共同定軌 × 彈射解纏 × 高速迴旋）

### 4.1 一局流程（約 35–75 秒）

1. **合息定軌**：在 session 開始時凍結合法、非 high-risk 的 energy／mood／relationship projection／formal stage／persona context；夥伴可接受、可見改寫、休息或拒絕。
2. **共繪軌跡**：玩家提供方向、力度區間與 stance。任何 companion rewrite 必須先畫進預覽或以短句說明，玩家確認後才形成 final launch plan。
3. **拉動發射**：拉距決定初速區間，進場角與 stance 決定旋轉、傾斜及後續軌跡。
4. **場中解纏**：旋轉衰減、碰撞轉移、記憶回收、守定錨點與界紋折返；可在關卡授權的共鳴時機做有限修正。
5. **可選對局共鳴變形／心相展開**：stage data 可授權 session-only `base ↔ resonance` combat form；另有正式 stage 者才可使用對應心相展開。兩者皆須等預算、可拒絕／改寫、維持 base 也可完成，且不可在戰中產生永久 Growth。
6. **返棲沉澱**：化身收回或安全解聚；夥伴給一句第一人稱短評，四個安全 outcome family 承接結算。

時間不是評分門檻。追跡／連鎖回收關可短至約 35 秒；守定／多段解纏關可接近 75 秒。不得以倒數焦慮、每日效率或最佳農法迫使玩家選快解。

### 4.2 Shared-control／夥伴介入契約

- 玩家提供的是**意圖**，不是對夥伴身體的 100% 遙控權。
- 夥伴的 `accept / rewrite / rest / refuse` 必須發生在 final plan 鎖定前；拒絕、休息與玩家取消都是零 relationship／Growth／path 懲罰。
- 一旦雙方確認 final plan，相同 session snapshot、input、stage seed 與 fixed-step schedule 必須可重播；禁止在發射瞬間依 Trust、SpamScore 或 mood 偷偷加隨機偏移。
- Trust 表示溝通與預覽可讀性，不是服從度或命中率。低 Trust 可以讓夥伴選擇保守 stance、先改寫或不出場，但不能把 UI 承諾的軌跡暗改成懲罰。
- RaphaelCore 未來最多提供 session 前意願／短句與 session 後回應；碰撞、軌跡、objective、outcome、reward、Growth 與 save truth 一律由 deterministic runtime 擁有。

### 4.3 闖關（優先）

- 軌道機關、認知亂碼、雜訊結、護盾柱、狹窄邊界、記憶序列與守定錨點。
- 目標語言：依序回收錯位記憶、將侵入訊號導出邊界、守住穩定錨點、讓衝突回聲重新對齊——**不要寫成屠城打怪**。
- 認知亂碼是外部錯置訊號或未授權覆寫，不得把 `anxious`、悲傷、疲勞或夥伴自身心理狀態塑造成應被攻擊的怪物。
- 若做「星級／更乾淨記憶」，只影響微光品質敘事，**不鎖成長、不強迫完美農**。

### 4.4 對決（次優先）

- 先人機鏡像，再異步幽靈；現行只屬 CPU／local ghost 垂直切片。
- 關係投影不可成為 formal competition 的不公平優勢；任何未來正式公平對決須另做 normalized total budget 與 privacy／authority contract。
- 即時網路 PvP：**不在 D0 或本輪 runtime 授權內**。

### 4.5 界紋疾走／Boundary Resonance

- 場地可把玩家在軌道內取得的 session-only 共鳴電荷儲存在符文邊界；符合角度、速度與目標條件時，將既有電荷轉為沿牆折返、spin recovery 或有限 steering。
- 界紋疾走不得讓普通牆／柱憑空創造平移或旋轉能量；每次釋放都必須有可追蹤的 charge debit、速度上限與碰撞後能量預算。
- 高速感來自殘影、聲音、短 hit-stop、鏡頭／HUD 回饋與路徑穿越，不等於 `+300%` 無條件速度。Reduced motion 必須以亮度／音色／線寬或短提示替代強震與長殘影。
- 現行營火證明關的 `resonancePulse 1/1` 保留；未來關卡可以資料化授權兩至三個共鳴時機，但次數來自 stage contract，不由 bond、付費或刷取增加。

### 4.6 情緒驅動物理的合法邊界

- 情緒／關係只在進場或明示 phase transition 建立 immutable session snapshot；async AI 回覆不得逐 frame 改寫物理。
- Energy 可決定是否參與、建議拉力 envelope、過熱與 settle window；低 energy 應先讓夥伴休息／拒絕，不得用看不見的手感削弱羞辱玩家。
- Mood 可映射成**有名稱、可預覽、可重播**的動勢：例如 calm 偏直穩、alert 偏早轉向、defensive 偏減速守界、tired 偏低衝量／長 settle。禁止把 anxious／chaotic 等同不可預測暴走。
- `JoySorrow` 只能影響節奏、VFX、音色、短句或共鳴 timing window，不直接給 critical damage／winner advantage。
- `BondAffinity` 不是心相展開或 formal stage 的捷徑；`SpamScore` 不直接進入速度、偏角、傷害或掉落公式。既有 mood／energy／boundary context 承接可見結果。

### 4.7 心相展開／Formal-stage sidegrade

- 初醒、共鳴成熟、終局覺醒可分別偏向靈活穿越、場域牽引／訊號整理、守定錨點／穩定反射；這是通用示意，角色仍須依 persona、species motion 與 approved profile 實作。
- 每階以 normalized total budget 平衡 radius、mass、speed cap、spin retention、steering、stability 與 objective affordance；不得存在「大形態在所有目標都更強」。
- 場中展開只呈現**已持久解鎖**的 formal stage；不能靠 dialogueCount、BondAffinity、勝場、碰撞數或戰中 meter 直接升階，也不能繞過 Growth readiness／willingness。
- 無 approved Stage 2／3 illustrated asset 時，只能顯示 aura、光紋、姿態與 session cue，不能放大／染色 Stage 1 冒充新形態。
- 夥伴與玩家都可選擇維持當前形態；所有合法形態都必須能完成核心 objective，差異在路線與手感，不在通關資格。

### 4.7.1 對局內共鳴變形／Session combat form

- `combatForm` 只有 `base` 與 `resonance`；狀態屬於本次 Orbit session，不能寫入 save、Growth、formal stage、relationship、Codex 或 unlock。
- 玩家與敵方使用同一 deterministic state machine、相同合法 resonance window、charge debit、cooldown／duration 規則與 fixed-step authority。敵方不得因 renderer、AI timing 或隱藏 profile 取得額外能量。
- 每個 form profile 必須通過 normalized budget。可交換的維度限於 radius、inertia、turn authority、spin retention、field／signal 範圍與 objective affordance；不得直接改 Impact、reward、Growth evidence、winner 或 total energy budget。
- 變形只由 engine 事件決定；Three／Canvas／Pixi 只能表演同一 `combatForm` truth。GLB 載入失敗時以 aura／輪廓 fallback 顯示，不得改變碰撞、timing 或 outcome。
- `resonance` 不等於三階制的「共鳴成熟體」。正式 stage 仍由 Growth readiness、companion willingness 與 human-approved asset 擁有；本節不得用來繞過 O15／N-series。
- Session resolved、retreated、aborted、owner changed 或 teardown 後必須回到 `base`，且 replay snapshot 能在 30／60／120 Hz 得到相同 form transition、碰撞與 outcome。

### 4.8 結局映射與 subtype

| 迴旋戰結果 | 上位 outcome key | 可用 subtype 範例 | 玩家感受 |
|---|---|---|---|
| 乾淨穩住軌道／清結 | `stabilized` | `signal_aligned`、`boundary_held` | 一起把雜訊放輕 |
| 回收到關鍵微光 | `recovered` | `memory_resequenced`、`anchor_reached` | 帶回記得的東西 |
| 主動／被迫先撤 | `retreated` | `companion_rest`、`player_withdrew` | 懂得離開也是照顧 |
| 過熱／被壓但安全回家 | `overwhelmed_but_safe` | `avatar_disperse`、`resonance_interrupted` | 累但沒有被羞辱 |

Subtype 只增加 objective、演出與短評精度；不能建立高低排名、不同 Growth 權重或「真正勝利」捷徑。

### 4.9 敗北、記憶與返回

- 正式失敗語意是「本次心核化身無法繼續維持，共振安全解聚，夥伴與玩家返回棲地」，不是 Nexus Core 或夥伴被擊敗。
- 禁止刪除記憶、永久戰損、外觀降級、stage 倒退、扣 bond／trust、鎖死關卡或不可挽回壞結局。
- 可有 session-only 疲累、守備姿態、雜訊痕與第一人稱短評；持久 regulation 只能沿用既有 bounded energy／fatigue／mood policy，且不得呈現為玩家失敗。
- 失敗／撤退本身不寫 Growth evidence。可保留不含玩家文字的 session trace；只有之後完成合法、非 high-risk、可歸屬的 reflection，才可依 Growth contract 考慮一枚去重 evidence。
- **全域預設：惜敗陪伴**。個別角色可偏「好勝想再來」，但仍禁止羞辱玩家、責備離開或懲罰關係。

---

## 5. 關係 → 戰鬥投影表（鎖定）

面板可顯示戰鬥詞；底層**只讀**關係／狀態，不另開永久 ATK 帳本。

| 戰鬥顯示 | 來源（只讀投影） | 禁止 |
|---|---|---|
| 衝擊 Impact | bond × 近期共同行動完整度（探索／遠征／對峙／迴旋完成） | 純聊天直接加 Impact |
| 旋轉 Spin | sync／默契穩定度、近期節奏一致 | 用登入天數灌 Spin、把 Trust 當命中率 |
| 韌性 Guard | trust + 邊界健康 | 用服從度包裝 Guard、壓低 defense 換優勢 |
| 爆發 Burst | 高張力共同記憶（對峙／遠征高峰／重要微光）與合法進場 attunement | 商城買爆發、JoySorrow 直接加暴擊 |
| 過熱 Overheat | touchFatigue／連續開戰／低 energy | 付費消過熱 |

### 5.1 投影硬規則

1. **聊天本身不直接加 Impact**——聊天養信任／理解；衝擊來自「一起經歷」。
2. **Trust 不是服從度、瞄準精度或隱藏命中率**；它可以影響夥伴是否願意、預覽清晰度與所選 stance。
3. **邊界被尊重 → 共同行動更可讀；被無視 → 夥伴可改寫、休息或拒絕**。禁止以最後一刻射歪或手感破壞懲罰玩家。
4. **沒有獨立武器升級樹**。
5. **化身可以有張力，夥伴本人永遠可拒絕出場或心相展開**（疲勞／低信任／剛被傷過）。
6. 實作必須是純函式，可單測：
   `projectOrbitCombatStats(companionRelationship, recentEvidence, vitals) -> stats`
7. UI 文案必須傳達：
   > 數值不是等級，是你們現在有多合得來。
8. 正式 stage sidegrade 必須另經 pure profile 將 total budget 正規化；不得把 stage 直接乘進 `Impact`／damage／winner。
9. 所有投影在 session 開始時封存；simulation 期間不讀 mutable Soul Talk／LLM／DOM state。

---

## 6. 自我投影化身制（為什麼可看見夥伴、但不能把牠當彈藥）

| 必須 | 禁止 |
|---|---|
| 場上單位叫心核化身／共鳴核；可呈現夥伴可辨識的 illustrated 自我投影 | 把夥伴肉身當陀螺殼或彈藥砸 |
| 外層共鳴場承受碰撞；夥伴以姿態、視線、聲音與主動修正表達意願 | 「寵物兵器」或完全無主體性的子彈演出 |
| 核散＝化身散 | 夥伴死亡、永久倒下 |
| 贏：興奮或餘韻短評 | 戰報式 DPS 結算 |
| 輸：惜敗陪伴（預設） | 扣 bond、羞辱、鎖關 |

自我投影可以由高解析 illustrated portrait／animation、外環、拖尾與 field silhouette 組成。D0 取消的是「抽象球唯一外觀」，不是取消夥伴的身體安全與主體性。

---

## 7. 進度三條（不要只留戰力）

1. **世界區域路徑圖（闖關）**——本契約 §2；清關解鎖下一區路徑與敘事碎片。
2. **關係章節（養成）**——既有章節／共鳴／Growth evidence。
3. **化身譜（收集感，非抽卡）**——共同記憶解鎖軌跡皮膚／旋轉音色；**不賣戰力、不抽稀有度**。

回來意願靠：下一關好奇、手感、夥伴評語——**不是紅點逼戰**。

---

## 8. 與遠征、對峙、Growth 的邊界

| 系統 | 角色 | 迴旋戰可做 | 迴旋戰不可做 |
|---|---|---|---|
| 棲地／Soul Talk | 關係本體 | 結束後可被邀請聊天 | 聊天刷 Impact |
| 穩住裂隙 | 情緒對峙 | 四個上位 outcome family 與撤退語意對齊 | 退化成 HP 殺怪 |
| 心域遠征 | 出門取材 | 微光／軌道素材進場 | 擊殺刷 bond／trust |
| Companion Growth | lived evidence／formal stage truth | first-clear Orbit 可沿既有 `exploration` family 留一枚去重 evidence；已擁有 stage 可投影成 normalized 手感 sidegrade | 戰中升階、勝場進化、另開 `orbit` farm family、繞過 readiness／willingness |

Growth 備註：current runtime 已把 Orbit first-clear 映射為 `exploration` evidence，但它只是多樣 lived evidence 的其中一個 root；重玩、失敗、撤退、心相展開與 subtype 都不能額外增加 readiness。G4 stage offer／advance 與 G5 form asset 仍未實作。

對局共鳴變形補充：session-only `combatForm` 不屬於 Growth source family；觸發、維持、結束或重玩都不能建立 evidence，也不能被 Codex 顯示為正式 stage。

---

## 9. D0 正式取消的舊限制

以下限制在 2026-08-01 後不得再被當成上位契約：

1. **取消「心核化身只能是抽象小球」**：允許 illustrated 自我投影＋外層共鳴場。
2. **取消「正式 Growth stage 不能改變任何 Orbit 物理手感」**：允許 normalized sidegrade，不允許垂直戰力。
3. **取消「所有發射永遠只能一次共鳴脈衝」**：`1/1` 是現行營火切片／入門規則；未來由 stage data 授權有限共鳴時機。
4. **取消「每局固定 60–90 秒」**：改為約 35–75 秒的 objective-driven 範圍。
5. **取消「四個 outcome key 已窮盡所有結果語意」**：保留四個安全 family，允許 subtype。
6. **取消「Orbit runtime 尚未實作」的文件狀態**：現行 25-stage Moonlake route、Plains proof stage、CPU／ghost 與 fixed-step physics 必須被承認。

取消以上限制不等於授權 runtime、資產、state 或 dependency 修改；每一項落地仍需自己的 EXPERIENCE／GROUNDWORK TASK_PACK。

---

## 10. D0 保留的核心契約

1. 不做抽卡、稀有度戰力殼、皮膚商城賣數值。
2. 不做每日必戰、連續打卡、FOMO 紅點逼戰。
3. 不做獨立 ATK／武器成長樹或可刷永久攻擊帳本。
4. 不把夥伴本體當彈藥；碰撞由自我投影的共鳴場承受。
5. 不做強制出場或最後一刻隱藏抗命；夥伴在 final plan 前可接受、改寫、休息或拒絕。
6. 不把 Trust 當服從／命中率，不把 mood 當隨機暴走，不把 JoySorrow 當暴擊，不把 SpamScore 當直接物理參數。
7. 不做 HP 擊殺認知亂碼；不把夥伴的焦慮、悲傷、疲勞或心理狀態塑造成敵人。
8. 不做敗北刪記憶、永久戰損、stage／relationship 倒退或無法挽回壞結局。
9. 不以普通牆／柱或界紋疾走憑空創造能量；固定步確定性與 replay 必須保留。
10. 不做即時網路 PvP、刪除遠征、橫向動作主循環、排行榜、賽季或 MMR（皆需另案）。
11. 不引入 React／Vue／TS／npm／build／後端／LLM runtime；不擅自改 `STORAGE_KEY`。D0 不需要 Matter.js／Planck.js，現有 `src/orbit/` 仍是 simulation authority。
12. High-risk／safety terminal 永遠零 Orbit 啟動、零 outcome reward、零 memory／Growth／relationship delta。

---

## 11. 架構與效能權限

- `src/orbit/orbitEngine.js`／`orbitPhysics.js`：objective、fixed-step、collision、energy、outcome 的唯一 authority。
- `src/ui/orbitBattleController.js`：現行 Canvas 2D playfield、DOM input／HUD 與 accessibility plumbing；不能擁有 simulation truth。
- 未來 Pixi `orbitArenaRenderer`：只消費 serializable snapshot／event 呈現 illustrated form、trail、VFX 與 camera feedback；不得重算 winner／collision／Growth。
- RaphaelCore／Companion Shell：只在 session 前後提供意願、可見 rewrite 與第一人稱回應；不得進 fixed-step loop。
- Stage data：可以宣告 objective、rune rail、charge budget、resonance timing、form affordance 與 reduced-motion cue；不能寫 relationship、reward 或 AI policy。
- Performance：保持 `1/120s` deterministic simulation；render 可依裝置降粒子／殘影，但不能改 outcome。正式 gate 必須覆蓋 30／60／120 Hz、390×844、390×664、desktop、touch、keyboard、reduced motion、文字放大與 mobile GPU。

---

## 12. 非目標（D0 歷史邊界；後續另案依核准範圍施工）

- D0 當時不實作合息定軌、界紋疾走、情緒動勢或心相展開；其中 V1–V3 後續狀態以 current `main` 與 ledger 為準。2026-08-02 另核准的 session-only combat-form 3D Pilot 只涵蓋本契約 4.7.1，不包含正式 stage advance。
- 修改 `src/**`、save／schema、`assets/**`、`pixiApp.js`、依賴、backend 或 network。
- G4 覺醒邀請／stage advance、`thunder-pup` 或任何夥伴的 Stage 2／3 canon 與正式資產。
- 完整 Steam 商業包裝、法務、即時 PvP、排行榜、賽季或 MMR。
- 把「移除舊限制」解讀成可跳過 Acceptance、human art gate 或 protected-main release gate。

---

## 13. Current baseline 與下一階段

| Pack | 狀態／內容 | 最低退出 gate |
|---|---|---|
| Legacy R1–R10 | ✅ 現有拉曳、固定步物理、Moonlake 25 stages＋Plains proof stage、姿態／營火脈衝、CPU／ghost、settlement 與 mobile UI | O1–O11；不得把 open human／Safari gate 說成完成 |
| D0 | ✅ 本次文件重定版 | Orbit／Growth／Acceptance／ledger 一致；O12–O17 存在；docs diff hygiene |
| V1 | 合息定軌＋可見 rewrite＋界紋疾走的單關 non-persistent slice | O12–O14、O16–O17 + existing O7/O11；無 schema／asset |
| V2 | 一隻 asset-ready companion 的 formal-stage 心相展開 sidegrade | O15–O17 + N2/N5/N7/N11 + G1–G7；另取 GROUNDWORK／human art approval |
| Global 3D Pilot R1 | ✅ Owner-approved／runtime-promoted：灰影貓玩家陀螺＋裂隙敵方陀螺的 session-only `base ↔ resonance` combat form、Three presentation／Canvas fallback | O15A／O17 + H7–H9 + Blender／GLB audit + human visual approval；不寫 Growth／save；批次擴充另案 |
| V3 | session 前後 Companion Shell 表達橋接 | O12/O16/O17 + safety／memory／Core regression；Core 不進 simulation |
| V4 | 多關調整、真機與真人手感 | O1–O17 + 30／60／120 Hz + mobile／Safari／GPU／reduced-motion／human gates |

`HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md` 的 R0–R5 是歷史施工計畫；current baseline 與後續新包以本表為準。任何 V1+ 開工前仍須另交 Task name、Layer、Files touched、Red-line check、Non-goals 與 Acceptance refs，取得 Owner 核可。

---

## 14. 驗收清單（文件層）

- [x] 承認 current Orbit runtime；不再把它描述為未實作。
- [x] 正式列出六項取消限制與十二項保留契約。
- [x] 自我投影、shared-control、情緒 snapshot、界紋疾走、formal-stage sidegrade、outcome subtype 與安全失敗皆有權限邊界。
- [x] Growth 仍由 readiness／willingness／approved asset 擁有 stage truth；Orbit 不可戰中升階或 farm evidence。
- [x] Acceptance O12–O17 可驗證確定性、非隱藏抗命、能量守恆、sidegrade、公平失敗與架構／可及性。
- [x] D0 仍是 docs-only；未宣稱 V1–V4 runtime-ready。

---

## 15. 給下一位 AI 的一句話

先把 D0 當成「擴大表達與手感空間、收緊主體性與確定性證據」：可以讓夥伴更可見、形態更有手感、場地更高速；不能用隱藏射偏、戰力進化、刪記憶或新物理引擎捷徑換取刺激。
