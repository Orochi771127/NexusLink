# COMPANION_GROWTH_CONTRACT_V1.md
# 心核夥伴養成與覺醒契約 v1

> **狀態**：`ACTIVE DESIGN CONTRACT / G1 + G2 + G3 + G3.1 CARE SOURCE IMPLEMENTED / ORBIT D0 CROSS-CONTRACT REBASELINED / ART-ONLY FORMAL FORMS EXIST / GROWTH G4+ RUNTIME NOT IMPLEMENTED`
>
> **Owner direction**：2026-07-17 已核准此契約與 G1 session-only 切片；2026-07-18 核准 G2 GROUNDWORK；2026-07-22 核准 G3／G3.1 EXPERIENCE；2026-08-01 核准 Orbit D0 文件重定版；2026-08-14 核准 EVO-00 文件重對齊（本輪只改契約／驗收／handoff／Ledger，不改 Runtime）。現已接入 per-companion 持久狀態、正式 key factory、bounded evidence／coverage、readiness／willingness、質性 Growth UI，以及由 Heart Phase completion 擁有的 `care` source。現行 live source owner 為 exploration、emotional standoff、care；Orbit first-clear 沿用 `exploration` family，不另開可農 `orbit` family。夥伴改寫只有在玩家第二次明示接受後才可封存 `respected_rewrite` consent anchor。三-family readiness 現在可經包含 standoff 的流程形成，但**第三階段不對峙路徑仍未完整可達**；**Reflection production provenance 尚未正式啟用**。**Growth G4**（覺醒邀請／rewrite／defer／accept／stage advance）尚未實作。11 隻角色的 22 個進化形態資產已完成，但仍是 **art-only**：`runtimeAuthority=false`、`runtimeFormSwapReady=false`；save／store／registry／Pixi／renderer 尚未正式接線。`evolutionLines.js` 不得成為正式 stage runtime authority。涉及 `assets/**` 或 `pixiApp.js` 時，仍須依 GROUNDWORK 核准範圍施工。
>
> **權威關係**：本文件服從 `NEXUS_LINK_MASTER_CANON_v3.1.md`，是 Companion Growth／心核夥伴養成的現行**設計與驗收 SSOT**。G1 提供當頁、可逆的質性心相觀察，phase／session 本身不持久；G2 提供 per-companion relationship／growth truth、migration 與 Codex 隔離；G3 提供正式 evidence foundation、readiness／willingness 評估與質性痕跡呈現；G3.1 只讓確實完成並存檔成功的 Heart Phase care moment 寫入一個 deterministic root。G3／G3.1 都不會自動升階，也不等於正式覺醒玩法已完成。正式進化 Runtime 的可測 assertion 使用 `ACCEPTANCE.md` 的 **SOV-01～SOV-12** 命名空間，避免與 Art G4（Texture Sampling）混淆。`docs/r2-canon/R2_EVOLUTION_SYSTEM.md` 的等級、勝場、道具、五階與能力雷達只保留為歷史參考，不得作新實作依據。
>
> **不涵蓋**：`src/ai/evolution/**` 是 Raphael 自我評估／patch 管線，不是夥伴正式形態進化 Runtime；`src/ai/awakening/raphaelAwakeningGate.js` 的 `getAwakeningStage` 只描述第一次觸碰的 dormant／stirring／awakened，不是 formal stage。G2 只把既有高風險 terminal state 收緊為完整 relationship 零變化，不改 RaphaelCore canonical reply、人格或記憶權限。

---

## 1. 一句話決定

玩家應感到「我們一起生活後，牠真的長成了不同的樣子」，但成長的答案不是 XP、戰力或刷滿進度，而是夥伴從共同經歷中形成的**心相傾向、姿態、選擇與可見成熟**。

> **成長是關係留下的形狀；覺醒是夥伴主動回應那段關係。**

這個系統要保留「陪伴一段時間後出現新姿態」的養成驚喜，但必須翻譯成 Nexus Link 自己的語言：

- 玩家可以影響，不能按下「強制進化」。
- 夥伴可以接受、改寫、婉拒或延後一次練習／覺醒。
- 不同選擇形成不同敘事傾向，但沒有唯一正解或最佳收益路線。
- 成熟改變表達、身體語言、棲地回應、情境選項，以及在 Orbit 中經正規化的輪廓／慣性／objective affordance；不得增加總戰鬥預算或形成全目標優勢。
- 一段關係只屬於那一隻夥伴，不能用 A 的 bond 解鎖 B 的成長。

---

## 2. 2026-08-14 runtime 真相（EVO-00 重對齊）

本契約不把 transitional UI、美術包或 schema 佔位欄位誤稱為已完成的正式進化 Runtime。

| 現況 | 判定 |
|---|---|
| Growth G1／G2／G3／G3.1 | **已實作**。per-companion 狀態、evidence foundation、readiness／willingness、care source owner 已接入。 |
| Reflection production provenance | **尚未正式啟用**。`reflectionGrowthOwner.js` 已有 fail-closed（`source_owner_unverifiable`），但 G3.2 production 路徑仍未成為 live source owner。 |
| 第三階段不對峙路徑 | **尚未完整可達**。Care + Exploration + Reflection + Chapter 是契約允許的組合，但 Reflection production 未啟用，故不能宣稱不靠 standoff 的 Stage 3 readiness 已完整可玩。 |
| Growth G4 offer／rewrite／defer／accept／stage advance | **尚未實作**。G2 schema 已有 `offeredStage`／`deferredAt` 佔位欄位，這只是資料形狀，不是邀請流程。 |
| 11 隻角色 × 22 個進化形態資產 | **美術包已完成，仍是 art-only**。索引：`assets/characters/formal-evolution-index.json`、`assets/characters/formal-evolution-animation-r4.json`。176 張 2048×2048 sheet、2816 格。 |
| `runtimeAuthority` / `runtimeFormSwapReady` | **兩者皆為 `false`**。EVO-00～EVO-05 不得把它們改成 `true`。 |
| save／store／registry／Pixi／renderer | **尚未正式接線**到 Stage 2／3 形態。現行 live fallback 仍是 Stage 1 illustrated runtime。 |
| `evolutionLines.js` | **compatibility data only**。`bondThreshold` 與舊五階標籤不得成為 11 隻正式角色的 stage catalog authority。 |
| `codexController` 讀指定 companion 的 formal stage／legacy display floor | 已隔離；inactive archive 有明示，top-level bond 不會解鎖另一隻夥伴 |
| `companionStates.byId` 保存 relationship／growth；頂層欄位是 active mirror | G2 已接入；A→B→A 原子封存／hydrate，未知 id fail closed，仍只用主存檔 key |
| 舊 memory / milestone 多數沒有 `companionId` | 不可把舊歷史複製給整個 roster，也不可臆測逐筆歸屬；legacy unverifiable provenance 必須 fail closed |
| Growth 頁已有 Heart Phase 與四種質性練習 | phase、當頁觀察與未完成改寫仍是 session-only；接受並完成的練習可寫一個 care root。休息、拒絕、延後、安全中止與存檔失敗全為零 evidence |
| Orbit first-clear 已可寫 `exploration` evidence；stage 目前未投影進 Orbit 物理 | D0 只允許未來把已擁有 stage 投影為 normalized sidegrade；Stage 2／3 form runtime 仍未接入 |
| `growthHint` 只有 action effect 寫入，無 consumer／normalizer | 非正式狀態，不可據此宣稱養成已完成 |

現行 0／25／70 門檻只用來解釋舊圖鑑的可見結果。正式遷移依 §7.2 分開保存 active companion 的一次性 stage floor 與 inactive veteran 的 display-only Codex reveal floor；新玩家或新成長紀錄不得再以 bond 單獨晉階。

---

## 3. 玩家可玩的成長迴圈

每次成長互動都是一個短小、可退出、沒有失敗懲罰的共同練習：

1. **讀取訊號**：先看夥伴姿態、energy、fatigue、邊界與環境 cue。
2. **提出方向**：玩家提出一種活動，不是命令牠完成訓練。
3. **夥伴回應**：牠可接受、稍微改寫、婉拒或選擇休息。
4. **完成一小段練習**：使用既有 Care、Silent Anchor、探索、回顧、對峙修復等動詞。
5. **留下 lived evidence**：只記錄已完成且有上下文差異的共同經歷，不記可刷 XP。
6. **呈現微變化**：姿態、停頓、語氣、光紋、棲地或可選行動出現細微回應。
7. **由夥伴提出覺醒**：多樣經歷與章節條件成熟後，牠才主動提出下一階儀式；玩家也可說「改天」。

四種回應都成立：一起做、換一種做、先休息、今天不做。後三者不是失敗，也不扣關係。

### 3.1 可沿用的玩家動詞

- Care：溫柔陪伴、一起休息、共息、觀察身體語言。
- Exploration：直接前行、讀取寂靜錨、返回營地、接受未知；Orbit 只有 first-clear 且 source owner 驗證成功的共同闖關可沿此 family 留一枚 root。
- Reflection：回看一段共同記憶、提出暫定理解、接受夥伴修正或拒絕。
- Standoff：穩住、設界、回收記憶、退一步、事後修復。
- Chapter moments：完成章節分支、共鳴邀請與關係儀式；每條有效分支提供等價的 `chapter` domain，不要求某個不可逆選項。若事件可被跳過，必須另有可重做或可替代的合法路徑。

不得另建餵食條、訓練場、每日任務、勝場門檻、碰撞計數或素材農場，來取代現有情緒棲地動詞。Orbit 重玩、失敗、撤退、心相展開與 outcome subtype 都不能額外增加 readiness。

---

## 4. 四種心相傾向

傾向是**被觀察到的敘事方向**，不是屬性、職業、稀有度或高低排名。玩家不需要也不應把四項刷滿。

| Canon id | 玩家語言 | 常見證據 | 可見表達 |
|---|---|---|---|
| `attunement` | **共息** | 一起調節、聽完再回應、接受夥伴改寫節奏 | 呼吸、靠近距離、語句停頓、環境脈動 |
| `boundary_respect` | **守界** | 尊重拒絕、主動退一步、選擇休息或安全退出 | 更清楚的「可以／現在不行」、站位與防衛姿態 |
| `pathfinding` | **探路** | 讀取錨點、探索不同節點、容許暫時未知 | 觀察方向、引路動作、棲地線索與情境選項 |
| `steadfastness` | **承光** | 陪伴修復、對峙後留下、承認痕跡而不抹除 | 穩定站姿、舊傷光紋、回顧與修復語氣 |

這四種傾向不覆蓋角色 persona、五行心相或共鳴圈 stance。相同經歷經過不同夥伴的 temperament 後，可以得到不同表達。

### 4.1 Heart Phase 與 Formal Stage 必須分開

- **Heart Phase／心核相位**：當下、可逆、由目前 mood／energy／fatigue／情境形成；可改變這一幕的姿態、選項，以及未來 Orbit 中有名稱、可預覽、可重播的 session movement expression。
- **Formal Stage／正式階段**：持久、只向前一階、由多樣證據、章節條件與夥伴意願共同觸發；可在 Orbit 投影成等總預算的形態／手感 sidegrade。

相位不是「暫時進化戰力」。正式階段的 Orbit sidegrade 也不抹除原 persona、舊傷、拒絕能力或修復需求；它不能直接乘進 Impact／damage／winner，也不能讓任何 stage 在所有 objective 都更強。

`fatigue` 必須帶型別，不得混成一個通用數值：Care／Growth 只能讀 active companion 的 `touchFatigue` 與明示 regulation view；standoff session fatigue 留在 `battleEngine`；共鳴圈 breath 留在該次 circle session。後兩者只能透過已完成的 domain event 進入 evidence，不能被複製成持久 Growth fatigue。

---

## 5. 三階正式成長

正式 canon 固定三階；不得重新擴回 Baby／Child／Adult／Perfect／Ultimate 五階線。

| Proposed id | 正式名稱 | 玩家感受 | 主要變化 | Orbit 合法表達（非固定數值） |
|---|---|---|---|---|
| `initial_awakened` | **初醒夥伴** | 牠剛開始讓你看見自己的節奏與界線 | 基礎 persona、初始姿態、可讀邊界 | 可偏靈活穿越、短半徑與快速讀軌 |
| `resonant_mature` | **共鳴成熟體** | 你們已有一段可被彼此辨認的相處方式 | 語氣分化、身體 cue、情境 sidegrade、棲地回應 | 可偏場域牽引、訊號整理與中段改軌 |
| `final_awakened` | **終局覺醒體** | 共同經歷已形成不可替換、帶痕跡的生命樣貌 | 深層 persona hysteresis、專屬儀式與完整 approved 形態表現 | 可偏守定錨點、穩定反射與長餘韻 |

表中 Orbit 欄只定義可探索的 affordance family；每隻夥伴仍須有自己的 species／persona profile，並以 radius、mass、speed cap、spin retention、steering、stability 與 objective affordance 的 normalized total budget 證明沒有垂直優勢。

### 5.1 Readiness 與 willingness 是兩道不同的門

`readiness` 只表示「共同經歷已足以讓下一階成為可能」；`willingness` 才回答「牠現在願不願意」。高 bond 永遠不能直接寫入 stage。

Readiness 至少需要：

- 達到角色 profile 指定的章節／相遇條件。
- `domain` 專指 §6.1 的 normalized `sourceType` family，不是四種 tendency；共鳴成熟體至少涵蓋 3 個 source family，終局覺醒體至少涵蓋 4 個。玩家永遠不必刷滿四種傾向。
- 至少一枚 `consentAnchorObserved`：來自具有 immutable origin context、已完成的尊重改寫／守界／修復事件。單純按休息、退出、延後，或夥伴拒絕本身都是零 evidence。
- 不是同一 action、event、節點或對峙的重播累積。
- 所有資料可驗證且屬於目前 companion；缺失或損壞時 fail closed 為「還不是時候」。
- 不要求某一章節分支、某一對峙結局或被夥伴拒絕；Care + Exploration + Reflection + Chapter 本身就是不靠對峙／誘發拒絕的可達組合。

Willingness 另外檢查（G3 已固定 typed enum／profile gate 並納入 mutation test）：

- `growthSafetyExcluded` 為 false，且夥伴沒有 typed overfatigue 或尚未被尊重／修復的 active boundary context。
- **Numeric `defense` 永遠不是 readiness／willingness 門檻。** Defense 只影響當下姿態與語氣，不得讓玩家因壓低防衛而更容易覺醒。
- 角色 persona／章節節奏允許牠主動提出。
- 牠可以接受、改寫儀式或說「還不是時候」。
- 玩家可以接受或延後；延後不扣 trust、不產生 missed flag、不設期限。
- 一次只能前進一階；重複提交已完成階段必須 idempotent。
- `deferredAt` 只記 provenance，不是 cooldown。離線時間、推進時鐘或等待本身不能把「還不是時候」變成 willing；必須由新的合法當場 context 或明示、零懲罰的 regulation／repair 行動重新評估。
- Orbit 的 `BondAffinity`、JoySorrow、dialogueCount、勝場、碰撞數、連鎖數、界紋電荷或戰中 meter 都不是 readiness／willingness gate。場中「心相展開」只能呈現進場前已持久解鎖且夥伴當場願意使用的 stage；不得在 Orbit session 內建立 stage offer 或 advance。

正式 UI 不顯示精確門檻、差幾點、最佳行動或倒數，只顯示質性線索與實際發生過的證據。

### 5.2 Growth G4 詞彙（尚未實作；EVO-00 先鎖定語意）

> **命名空間**：本節的 **Growth G4** 是「覺醒邀請與 stage advance」。它不是 `ACCEPTANCE.md` §G 的 **Art G4（Texture Sampling）**。後續可測 assertion 一律使用 **SOV-01～SOV-12**。
>
> 下列詞彙是契約定義，不是已完成 Runtime。G2 schema 的 `offeredStage`／`deferredAt` 只是佔位欄位。

| 詞彙 | 白話意思 | 契約規則 |
|---|---|---|
| **offer** | 夥伴主動提出「要不要一起走向下一階」 | 只能由 readiness + willingness 同時成立時發出；玩家不能按下強制進化。一次只能對 **exact-next-stage** 發出。 |
| **rewrite** | 夥伴接受方向，但改寫儀式怎麼進行 | 改寫後仍須玩家第二次明示接受才可封存；未接受的 rewrite 是 session-only，零 stage mutation。 |
| **defer** | 玩家或夥伴說「改天／還不是時候」 | 必須 **no-penalty**。不扣 bond／trust、不產生 missed flag、不設期限、不進 evidence。 |
| **accept** | 玩家明示接受目前這一次合法 offer | 必須先通過 **critical-save**，存檔成功後才能把 visible stage 發布給 UI／renderer。 |
| **re-offer** | 延後之後，在新的合法當場 context 再次提出 | 必須是 **lawful re-offer**：新 context 或明示零懲罰的 regulation／repair 後重新評估；離線等待本身不能自動變 willing。 |
| **exact-next-stage** | 只能前進目前的下一階 | `initial_awakened → resonant_mature` 或 `resonant_mature → final_awakened`。禁止跳階、禁止跨角色、禁止把 Stage 1 直接寫成終局。 |
| **idempotency** | 同一合法 accept 重複提交不會再升一階 | 已完成 stage 的重複 accept 必須回傳已完成結果，不得再寫 evidence、不得再播演出、不得再改 renderer。 |
| **stale-offer rejection** | 過期、錯伴侶、錯 stage、錯 generation 的邀請必須拒絕 | 例如：切換夥伴後仍送出舊 offer、stage 已變、save 已前進、offer token 不匹配。拒絕時零 stage mutation。 |
| **no-penalty defer** | 延後不是失敗 | 關係、stage、evidence、readiness coverage 完全不變；UI 不得顯示倒數、紅點或「錯過進化」。 |
| **critical-save boundary** | 可見換形之前必須先存檔成功 | 順序固定：讀取 immutable current state → 建立並驗證獨立 candidate state → 將 candidate 傳入 critical persistence → 儲存成功後才把 candidate 發布成 canonical in-memory state → 最後發布 UI／Pixi intent。儲存失敗時直接丟棄 candidate；canonical state、store、localStorage 與畫面從頭到尾都維持舊 stage，不依賴事後 rollback 才恢復安全。 |
| **renderer fallback** | 畫面載入失敗時不能弄髒已存檔的 stage | 同角色同 stage 近似 action → 同角色 Stage 1 明示 fallback → 最後安全姿勢。**禁止跨角色**。fallback 不回寫較低 stage。 |
| **legacy provenance fail-closed** | 舊資料無法證明主人時，不准猜 | 缺 `companionId`、缺 sealed safety provenance、跨角色、原文推測，一律 `source_owner_unverifiable`。不得用 `activeCompanionId` 或 UI 現況補洞。 |
| **safeHarbor terminal** | 安全港一開始就終止所有進化副作用 | 禁止 gameplay mutation、save、reward、memory、relationship、Growth evidence、evolution offer、stage advance、VFX telegraph、delayed callbacks、renderer transition、autonomous invitation。退出安全港也不得復活舊 offer。 |
| **high-risk evidence exclusion** | 高風險回合永遠不是成長證據，也不能開邀請 | `growthSafetyExcluded=true` 在 source event 建立時封存，後代事件不能洗成 false。high-risk 前後完整 companion／growth／stage 必須完全不變。 |

---

## 6. Growth Evidence 契約

### 6.1 合法來源

合法來源 family 限於：

- `care`
- `exploration`
- `reflection`
- `standoff`
- `chapter`
- `boundary`
- `recovery`

普通 Soul Talk 只有在形成明確、非高風險、由現有記憶政策允許的共同反思事件時，才可由 controller 轉成 `reflection` evidence；原始玩家文字不得複製進 growth record。

### 6.2 最小紀錄形狀

以下是後續 GROUNDWORK 的建議 contract，不是本輪已存在的 save schema：

```js
{
  key: "exploration:1:starwood_trail:anchor_read",
  rootContextKey: "exploration:1:starwood_trail",
  companionId: "greyshade-cat",
  tendency: "pathfinding",
  sourceType: "exploration",
  sourceId: "starwood_trail:anchor_read",
  chapterNo: 1,
  memoryId: null,
  traceId: null,
  createdAt: 1784227200000, // positive finite epoch milliseconds
  growthSafetyExcluded: false, // immutable provenance from source event
  legacyAttributed: false
}
```

規則：

- `key + companionId` 必須唯一；alias、reload 與重播相同 event id 不得繞過去重。
- 所有 alias 必須先經 source owner 的固定 normalization table，再建立 key；key 不可只靠 timestamp、session id、亂數或玩家自由文字。
- Source/domain event 建立時必須固化 immutable `growthSafetyExcluded`，所有 descendant／queued／deferred event 只能繼承 true、不能洗成 false。Writer 必須讀 event provenance，而不是等 flush 時再看可能已清除的 UI/mode。
- 最小 deterministic key factory：
  - `care:<chapterNo>:<originEventId>:<practiceId>`
  - `exploration:<chapterNo>:<nodeId>:<choiceId>`
  - `reflection:<memoryId-or-traceId>:<resolutionId>`
  - `standoff:<chapterNo>:<nodeId>:<outcome-family>`
  - `chapter:<chapterNo>:<eventId>:<normalized-branch-family>`
  - `boundary:<immutable-origin-key>:respected`
  - `recovery:<immutable-origin-key>:completed`
- Orbit 不新增 `orbit` source family。合法 first-clear 由 Orbit settlement 先正規化為 `exploration:<chapterNo>:<stageId>:first_clear`（或 source owner 鎖定的等價固定 key）；同一 stage 的 replay、不同 outcome subtype、心相展開、界紋疾走、失敗與撤退都不得建立第二枚 root。
- `createdAt` 必須是正有限的 epoch timestamp；0、負數、NaN 或 Infinity 視為損壞資料，不得參與 readiness。
- 每隻夥伴最多保留 24 枚 evidence detail；`coverage.rootsBySourceType` 與 `consentAnchorRootKey` 是目前 target stage 的 bounded、monotonic readiness summary，不因 evidence compaction 倒退。Stage 一旦完成也永不倒退。
- 每個 target window 最多接受 24 個 immutable root，writer 必須為尚缺的必要 source family 與 consent anchor 預留槽位；非必要 root 在會吃掉預留槽位時只作敘事，不進 growth。兩次正式升階合計的 `consumedRootKeys` 上限為 48，接受時立即寫入且不因 detail compaction 刪除。
- `coverage.windowOpenedAt` 之後新完成的 event 才能進目前 target；stage advance 後舊 event replay 即使 detail 已壓縮也不得再用。`consumedRootKeys`、原始 positive timestamp 與 source owner 的 immutable key 三者共同 fail closed。
- 第 25 枚起採 deterministic compaction：先保留每個 source family 至少一枚、所有 offer／stage audit anchor，以及仍被 canonical memory／trace 引用的 key；再以 `createdAt + key` 排序，替換最舊的非 anchor 重複 family。若沒有可替換項，只更新 coverage 而不新增 detail row。
- Compaction 只移除 Growth detail row，不得刪除或改寫它引用的 canonical memory／trace。未來任何 growth-linked memory／trace 都必須有合法 `companionId`；legacy 無歸屬資料只能作 migration provenance。
- 優先引用既有 `memoryId`／`traceId`，不複製玩家對話或安全輸入。
- 單一 domain 無論重複多少次都不能使 stage ready。
- 同一節點的 standoff detail key 使用 `standoff:<chapterNo>:<nodeId>:<outcome-family>`，但 `rootContextKey` 固定為 `standoff:<chapterNo>:<nodeId>`；只有第一枚合法 root 可進 detail／tendency／readiness，之後重打或換結局都只作敘事。
- `stabilized`、`recovered`、`retreated`、`overwhelmed_but_safe` 四種完成結局都留下**等價的一枚 `standoff` domain evidence**；只可有不同 tendency／敘事標籤，不得有不同 readiness 權重。任何結局後的 repair 都是可選敘事；同一 `rootContextKey` 不可再多算一個 readiness domain，沒有 catch-up tax 或最佳結局。
- Orbit 四個上位 outcome family 與未來 subtype 同樣沒有 readiness 高低差；只有 source owner 判定為合法 first-clear 的完成結果可沿 `exploration` 留一枚 root。失敗／撤退可保留 session trace，但 trace 本身不是 evidence。
- Evidence 只證明「這件事發生過」，不直接給 bond、trust、素材、戰力或 stage。

### 6.3 絕對排除

`growthSafetyExcluded` 在下列任一條成立時為 true：`safety.isHighRisk`、`strategyId === "safety_redirect"`、`actionId === "enter_safe_harbor"`、system-role safety reply，或 safety／safe-harbor mode 正在處理該回合。此值在 source event 建立時封存；即使 queue 延遲到 mode 清除後才 flush，仍必須拒絕 growth write。

下列資訊／事件永遠不是 growth evidence：

- safety `isHighRisk` 回合、危機字詞、完整安全回覆與 safety UI/mode。
- `lastSeenAt`、離線天數、登入次數、reload 次數、streak、回歸頻率。
- 依賴、孤獨、診斷或心理狀態推測。
- 夥伴的拒絕本身、玩家單純打開頁面、idle 等待。
- 每日任務、倒數活動、稀有掉落、勝場、敵人擊倒、付費內容。
- Orbit 的發射次數、命中／碰撞數、速度、界紋疾走、心相展開、outcome subtype、重玩、核散、失敗與撤退。

High-risk 回合前後，完整 gameplay／companion state（含 relationship、growth、mood、touchFatigue、record creation）、preference、memory、trace、stage readiness、stage offer、SFX 與 animation intent 必須完全不變；只允許既有 safety UI/mode 狀態。非 high-risk 的 safety／caution route 若依既有政策做 bounded regulation，該 regulation 可保留，但仍是零 growth、零 preference/memory/trace、零 reward、零 stage offer。

---

## 7. 未來 per-companion state 與 migration

### 7.1 Canonical target（最小示意；G2 必須完成 full inventory）

正式多夥伴養成需要每隻夥伴自己的關係與成長真相。建議目標形狀：

```js
companionStates: {
  version: 1,
  byId: {
    [companionId]: {
      relationship: {
        bond: 0,
        trust: 5,
        mood: "calm",
        energy: 10,
        defense: 35,
        touchFatigue: 0,
        lastTouchAt: null,
        lastRejectAt: null,
        blockedTouchCount: 0,
        lastBlockedTouchAt: null,
        firstTouchCompleted: false,
        firstHugCompleted: false,
        reactionPreview: "",
        lastTouchReaction: ""
      },
      growth: {
        stage: "initial_awakened",
        evidence: [],
        coverage: {
          targetStage: "resonant_mature",
          windowOpenedAt: 1784227200000,
          rootsBySourceType: {
            care: [],
            exploration: [],
            reflection: [],
            standoff: [],
            chapter: [],
            boundary: [],
            recovery: []
          },
          consentAnchorRootKey: null
        },
        consumedRootKeys: [],
        offeredStage: null,
        deferredAt: null,
        lastGrowthEventAt: null,
        migration: {
          appliedVersion: 0,
          legacyStageFloor: null,
          legacyCodexRevealFloor: null,
          legacyBaselineKey: null
        }
      }
    }
  }
}
```

G2 必須先鎖定完整 `RELATION_MIRROR_FIELDS` 並以 migration test 證明不會洩漏另一隻夥伴的觸碰、拒絕、擁抱或 regulation 歷史；以上列出的是現行已知最小集合，不代表可跳過完整 inventory。Player profile、`lastSeenAt`、chat／safety input 與全域 onboarding 不屬於 relationship mirror。傾向應由 evidence 衍生；若為效能快取數值，快取不得成為 authoritative XP。

`coverage` 只覆蓋目前 `targetStage` 的 source-family readiness；domain 數由非空的 `rootsBySourceType` key 衍生，不另存可漂移 count。每個 window 最多接受 24 個 root，兩個升階 window 的 `consumedRootKeys` 總上限 48。Stage 接受後把已完成 stage 固定，再以 deterministic transaction 開啟下一個 target window；舊 coverage 可壓成 stage audit，但 consumed roots 必須保留，不能讓 stage 倒退或讓舊 event 跨 stage 重播。

`companionPreferences` 是 Raphael 表達偏好，`resonance.companions` 是相遇／邀請狀態，兩者都不能挪作 relationship 或 growth truth。

### 7.2 Legacy migration 原則

現行只有一份全域關係數值，無法真實重建 veteran 過去對每一隻夥伴的關係。遷移必須保守：

1. 先用現行規則 resolve 合法 `activeCompanionId` 與 unlocked roster。
2. 只把全域 `RELATION_MIRROR_FIELDS` 歸給 resolved active companion；不可複製給所有 unlocked companion。
3. Legacy active companion 依舊圖鑑 0／25／70 結果設定一次 `growth.migration.legacyStageFloor`，再令 `growth.stage = max(initial_awakened, legacyStageFloor)`；不播覺醒演出、不補 evidence、不給獎勵。
4. 為避免 veteran 已看過的 Codex lore 消失，其他**已知且已解鎖** companion 只可取得 display-only `legacyCodexRevealFloor` 與不含玩家文字的 `legacy:v1:<companionId>:codex-archive` provenance key。它不設定 relationship、growth stage、evidence、readiness、willingness 或形態資產；UI 必須標成 archive／compatibility reveal，且首次啟用後仍保留該說明，不冒充正式覺醒。
5. Inactive companion 首次合法切入時，以 normalizer 核准的 fresh／persona baseline lazy-init relationship；不能承接 active companion 數值。切換 transaction 固定為：封存 A mirror → normalize／lazy-init B → 設 active B → hydrate B mirror → 單次 notify/save。
6. 舊 memory／milestone 沒有 `companionId` 時，不逐筆臆測、不轉成 GrowthEvidence；只可保存不含玩家文字的 `legacyBaselineKey` provenance。未來新增的 growth-linked memory／trace 必須帶合法 `companionId`。
7. `migration.appliedVersion`、兩種 floor 與 baseline key 都是經 normalizer enum／strict type／companion-key correlation 驗證的持久 one-shot marker。版本不是整數 current version、key 不屬於該 companion，或 archive／relationship marker 與 floor 不相符時一律 fail closed；重複 normalize 不得重新推導、重播、重建或重複 evidence。
8. 過渡期 top-level 欄位只能作 active companion compatibility mirror；所有步驟在同一 transaction 完成，不能讓 observer 看見混合狀態。
9. 新 schema 已存在時 canonical record 優先，不得被 stale mirror 覆寫；stage、已取得 coverage 與 display reveal 不因 compaction、時間或 reload 倒退。
10. 未知 companion id 不建立資料、不解鎖角色；損壞／缺失資料 fail closed 並回到安全預設。
11. 仍使用單一 `nexusLinkR2State:v1`；不得新增 localStorage key。
12. Boot offline recovery 對每隻已有 relationship 的 companion 套用同一 bounded energy／touch-fatigue 調節後才 hydrate active mirror；archive-only `relationship:null` 不得因此初始化，且此路徑不寫 bond、stage 或 evidence。

---

## 8. 架構所有權

本契約採 simulation／rendering／UI 分離；renderer 永遠不擁有成長真相。

### 8.1 純規則 engine（未來 EXPERIENCE）

建議新檔：`src/engine/companionGrowthEngine.js`

```js
deriveHeartPhaseSnapshot(state, companion)
evaluateHeartPhasePractice(snapshot, practiceId, context)
evaluateStageOffer(snapshot, evidence)
```

責任：去重、domain diversity、readiness、willingness、拒絕／休息、high-risk/fatigue/boundary gates。不得碰 DOM、Pixi、store、localStorage 或音效。

不要把規則繼續塞進已很複雜的 `evaluateActionEffect()`；舊 action engine 最多發出一個已完成的 domain event。

### 8.2 Controller（未來 EXPERIENCE + GROUNDWORK writer）

```js
createCompanionGrowthController({
  store,
  saveCurrentState,
  emitAnimationIntent
})
```

責任：建立 active `companionId` context、把合法結果寫回經 normalizer 核准的 state、要求存檔、送出視覺 intent。Safety terminal 必須在 writer 前直接短路。

### 8.3 DOM UI

既有 Growth 頁應重構為只吃 view model，不再自行計算 stage：

- 顯示夥伴目前姿態與可讀訊號。
- 顯示「最近比較常出現的傾向」與 lived evidence，不顯示 raw score。
- 提供 2–4 個有真實結果的共同練習；拒絕、休息與退出都可用。
- Expedition shard/crafting 降為明確 Prototype 的次級入口，不能當 Growth 主循環。
- 不顯示 XP bar、每日、倒數、差 N 點、最佳收益、紅點或 missed state。

### 8.4 Pixi／美術

Pixi 只消費 `heart_phase_manifestation`、姿態與環境 cue，不讀寫 stage／evidence。

在完整資產包通過前，只能用既有動畫、光紋、weather、trace、音樂與短暫相位 cue 呈現微變化。正式形態替換至少需要該 companion 每階的 approved portrait、必要 512×512 illustrated animation set、species motion translation、mobile GPU budget、reduced-motion fallback 與 human visual gate；不得用 tint／放大原圖冒充新形態。

月湖情緒水晶六態是 presentation-only memory lifecycle，不是夥伴 XP bar 或正式覺醒儀式。

### 8.5 Orbit cross-system ownership（D0；未實作）

未來 Orbit 只能透過純投影邊界讀取 Growth truth：

```js
projectOrbitEmbodimentProfile({
  companionId,
  formalStage,
  heartPhaseSnapshot,
  personaProfile,
  assetReadiness,
  stageContract
}) -> {
  participation,
  visibleRewrite,
  movementExpression,
  normalizedPhysicsProfile,
  manifestationIntent
}
```

- 此函式必須純、可 replay、無 DOM／Pixi／store／localStorage／RaphaelCore call；輸出不能改寫 `growth.stage`、evidence、relationship 或 asset readiness。
- `formalStage` 只能來自 canonical per-companion Growth state；Heart Phase 只能調整當次可見動勢，不能冒充 stage。
- `normalizedPhysicsProfile` 必須先通過等總預算與跨 objective reachability gate；stage 不直接乘進 Impact、damage、reward 或 winner。
- `manifestationIntent` 只有在該 companion／stage 的 illustrated asset 已 human-approved 時才可要求形態 swap；否則只可要求 aura／姿態／光紋 cue。
- 夥伴可在 session 前接受、可見改寫、休息或拒絕；已確認後 Orbit deterministic engine 擁有軌跡與結果，Growth／RaphaelCore 不得逐 frame 改寫。

---

## 9. 首片與後續施工順序

| Phase | Layer | 內容 | 最低 gate／退出條件 |
|---|---|---|---|
| G0 | Docs | 本契約、Acceptance、legacy 與 agent/art 路由 | 文件一致；G1／G2／G3／G3.1 Care Source 已接入，**Growth G4+ Runtime 未實作**；EVO-00 已把 art-only 資產與 SOV 命名空間寫入契約 |
| G1 | EXPERIENCE | **已實作**：只從本 session 合法事件衍生 qualitative tendency；Growth view model，不新增持久 schema | N2／N3／N4／N5／N8／N11 的 presentation subset + M1–M5 + H + I；4 種 practice、390×844、reduced motion |
| G2 | GROUNDWORK | **已實作**：`companionStates`／full mirror inventory／normalize／migration／single-key save；active mirror 原子切換 | N1／N3／N9／N10／N11 + H + I；11-companion ring、veteran、corrupt、idempotent 全過 |
| G3 | EXPERIENCE | 正式 key factory、evidence writer、coverage／compaction、readiness／willingness、Growth UI | ✅ Evidence Foundation 已接入；N1–N11 + safety／alias／repeat-50／compaction／source-owner browser tests 全過；不包含 Growth G4 stage offer／advance |
| G3.1 | EXPERIENCE | Heart Phase completion 成為 care source owner；夥伴改寫需第二次明示接受 | ✅ candidate-first critical save、canonical result validation、A/B owner guard、全域 safety session invalidation、root／anchor dedupe 已接入；零 relationship／reward mutation |
| G3.2 | EXPERIENCE | Reflection／Echo Sorting source owner + 不依賴 standoff 的獨立章節生活事件 | **尚未正式啟用**；對應未來 EVO-01。先封 immutable provenance、零記憶臆測與 source-owner gate，再考慮 Growth G4 offer |
| Orbit D0 | Docs | 已擁有 formal stage 可投影為 normalized Orbit sidegrade；心相展開不得戰中升階 | O12–O17 + N2／N5／N7／N11 的文件一致性；不改 runtime／schema／assets |
| **Growth G4** | EXPERIENCE | 夥伴主動 stage offer、rewrite、defer、accept、exact-next-stage、idempotent advance | **尚未實作**。對應 EVO-02／EVO-03。驗收使用 SOV-01～SOV-08、SOV-10；不得與 Art G4 混淆 |
| G5 art-only | ART | 11 隻 × 22 形態 Sprite Sheet 已完成機械 QC | **美術完成、Runtime 未接線**。`runtimeAuthority=false`、`runtimeFormSwapReady=false`。這不是 renderer promotion |
| G5 runtime | GROUNDWORK + RENDERER | catalog adapter、Pixi stage-aware loader、canary、promotion | **尚未實作**。對應 EVO-04／EVO-05／EVO-06。驗收使用 SOV-09、SOV-11、SOV-12 與 Art G1–G7 |

G1 不得偷偷建立 localStorage 欄位；G2 只完成每隻夥伴的狀態地基；G3／G3.1 只完成 evidence/readiness/willingness 與 care source，不得把它宣稱為完整正式覺醒玩法已上線。**Growth G4 開工前必須先證明 readiness 有不依賴 standoff 的產品路徑**（EVO-01）。11 隻進化資產存在，不構成 Growth G4 或 renderer 已完成。

表中的 subset 只是各 phase 的最低退出 gate，不取代回歸責任；任何 merge／runtime-complete 宣告仍須重跑 N1–N11、相關既有 Acceptance、web gate 與 human/mobile gate。

---

## 10. 未來互相對練：Resonance Practice（未授權實作）

玩家希望未來有互相對戰感；Nexus Link 的第一版應翻譯為**共鳴演練**，不是戰力 PvP。雙方夥伴不是互相攻擊，而是從不同 stance 共同穩定一個中性回聲，結果呈現彼此節奏與相性。

- 優先採 same-device pass-and-play；任何 ghost code 都須另做 schema／privacy review。
- 雙方以同一組 normalized 當下資源進場；stage 與傾向只改變 stance、敘事與 sidegrade 選擇，不提高數值預算。
- 無排名、MMR、賽季、streak、每日、loot、XP、成長 evidence、relationship reward 或 penalty。
- 結果是相性觀察與回聲，不是死亡、捕捉、永久輸贏或角色價值排名。
- 雙方可隨時退出，零懲罰。
- Ghost payload 不得含玩家姓名、chat、memory、安全輸入、自由文字或可執行內容。
- 真正網路即時 PvP 需要後端、隱私、同意、反作弊、濫用防護與營運成本的獨立 Owner 授權；本契約不授權。

對練只能在 G3 成長真相穩定後另開 sealed contract 與專屬 O-series assertions；N12 目前只是設計邊界，不能作為 runtime-ready 宣告，也不得拿來先補「養成不夠像遊戲」的洞。

---

## 11. Definition of Done

Companion Growth 只有在以下條件同時成立時，才能稱為 runtime-complete：

- 每隻 companion 的 relationship／growth 狀態彼此隔離，切換與 reload 一致。
- 正式三階由多樣 evidence + chapter + willingness 驅動，bond-only reveal 已降為 migration compatibility。
- High-risk 與所有 `growthSafetyExcluded` route、離線／登入資料、重複刷取與付費內容皆不能推進 growth；numeric defense 也永遠不是資格門檻。
- 拒絕、休息、返回、夥伴延後、玩家延後均零關係懲罰、零 FOMO。
- Evidence detail bounded 在 24 枚內，source-family coverage／stage 不因 compaction 倒退；四種 standoff 結局與所有有效章節分支沒有 readiness 高低差。
- 成長首先可見於姿態、語氣、環境與選擇；在 Orbit 可增加等總預算的輪廓／慣性／objective sidegrade，但沒有戰力、勝場、稀有度、stage 全面優勢或素材最佳路線。
- DOM、純 engine、state writer 與 Pixi ownership 清楚，save 只保存 serializable simulation truth。
- 沒有 approved 形態資產時，不宣稱新形態已完成。
- Orbit 的場中心相展開只呈現進場前已解鎖且當場願意使用的 stage；BondAffinity、JoySorrow、dialogueCount、命中、碰撞、勝負與 meter 都不能建立 stage offer／advance。
- Orbit failure／retreat／replay 不刪記憶、不降 stage／coverage、不扣 relationship，也不形成額外 evidence；合法 first-clear 只沿 `exploration` family 去重一次。
- `ACCEPTANCE.md` N1–N11、既有安全紅線、web gate 與 human/mobile gate 全部通過。
- 正式進化 Runtime 另須通過 `ACCEPTANCE.md` **SOV-01～SOV-12**。文件寫入 SOV 不等於 Runtime 已完成。

---

## 12. 文件衝突（EVO-00 記錄；本次不改 Canon／AGENTS／CLAUDE）

這些衝突必須讓後續 AI 看見。EVO-00 **禁止**修改 `NEXUS_LINK_MASTER_CANON_v3.1.md`、`AGENTS.md`、`CLAUDE.md`。若認為必須改那些檔，停在建議階段。

1. **工具鏈允許 vs 本窗口範圍**：`origin/main` 的 `CLAUDE.md` 與 `AGENTS.md` 已允許 TypeScript、npm 依賴與 bundler／build step。但 EVO-00～EVO-06 **不進行工具鏈遷移**。允許現有 Vanilla JS ES Modules、JSDoc／`// @ts-check`、以及執行專案已存在且已核准的測試／QA scripts。未授權：新增 TypeScript 編譯流程、新增或更換 bundler、新增 npm runtime／dev dependency、修改 `package.json` 或 lockfile、把 JavaScript 全面遷移成 TypeScript、改變 GitHub Pages deployment root、建立新的 `dist` 發佈權威、改變 PixiJS／Three.js 載入方式。工具鏈升級應另開獨立 `BUILD-*` TASK_PACK。
2. **兩個 G4**：`ACCEPTANCE.md` §G 的 G4 是 Texture Sampling（Art G4）。本契約的 G4 是 Awakening Invitation（Growth G4）。後續一律用 Art G4／Growth G4，或直接寫 SOV-xx。
3. **`src/ai/evolution/**`**：Raphael 自我改進提案／patch 管線，不是 companion formal-form evolution runtime。
4. **`src/data/evolutionLines.js`**：圖鑑 compatibility data，不是 11 隻正式角色的 stage catalog authority。
5. **`getAwakeningStage`**：位於 `src/ai/awakening/raphaelAwakeningGate.js`，描述第一次觸碰的 dormant／stirring／awakened，不是 `initial_awakened`／`resonant_mature`／`final_awakened`。
6. **auriowl Owner Lock**：`FORMAL_EVOLUTION_OWNER_LOCK_R2.md` 刻意排除 `auriowl` 的視覺鎖定（金羽戰鷹視覺改向，技術 ID 仍為 `auriowl`）。R4 動畫包含 11 隻。ID 不得改名；小梟是否當 canary 留給人類決定。

---

## 13. EVO TASK_PACK 對照（文件計畫；僅 EVO-00 已授權）

| Pack | 目標 | Groundwork 觸點 | 對應 SOV |
|---|---|---|---|
| **EVO-00** | 契約重對齊、SOV 命名空間、handoff、Ledger | 只改文件 | 把 SOV 寫成可測契約；不實作 Runtime |
| **EVO-01** | Reflection owner／safety provenance；證明不依賴 standoff 的 Stage 3 路徑可達 | `reflectionGrowthOwner.js`、memory／trace owner、safety provenance | SOV-07、SOV-10 |
| **EVO-02** | 純狀態機：offer／rewrite／defer／accept／exact-next-stage／idempotency | `companionGrowthEngine.js`；禁止碰 DOM／Pixi／save | SOV-01～SOV-06 |
| **EVO-03** | UI + critical-save；存檔成功才發布可見 stage | `companionGrowthController.js`、`saveManager.js`、`store.js`、Growth UI | SOV-03、SOV-05、SOV-08 |
| **EVO-04** | 正式 catalog 與 Sprite Sheet manifest adapter | 新 catalog module；**不得**讓 `evolutionLines.js` 成為 authority；stage-aware／row-aware adapter | SOV-04、SOV-12 |
| **EVO-05** | Renderer canary（建議 `greyshade-cat`／`auriowl`／`crystalfin-seahorse`，人類可改） | `spriteSheetAnimationLoader.js`、Pixi；同角色 fallback | SOV-09、SOV-12 |
| **EVO-06** | 完整 QA 與 promotion 決策 | 旗標改 `true` 必須獨立 Owner／Groundwork，不可藏在別包 | SOV-11 與回歸 N／H／I／Art G |

**PR 漂移**：EVO-01 開工前必須重新 fetch `origin/main`，重查 [PR #215](https://github.com/Orochi771127/NexusLink/pull/215)（會改 `defaultState.js`／`store.js`／memory／energy／boundary）與 [PR #216](https://github.com/Orochi771127/NexusLink/pull/216)（會改 `AGENTS.md`）。不得把 EVO-00 的舊基準直接當成 EVO-01 的永久基準。

---

## 14. 本窗口工具鏈範圍（不是長期憲法）

這不是「Nexus Link 永遠不能用 TypeScript／npm／build」。這是為了讓進化 Runtime 的錯誤能被單獨定位。

- **允許**：Vanilla JS ES Modules；JSDoc 與 `// @ts-check`；執行已存在的 npm scripts／QA；現有 local server。
- **未授權**：新增編譯／bundler／runtime 或 dev dependency；改 lockfile；改 Pages 部署根；把進化模組單獨做成 TypeScript 雙軌。
- 若發現現有已核准工具鏈可直接使用，先回報 `package.json`、lockfile、build script、CI、Pages 與 canon 依據，不得自行擴張。
