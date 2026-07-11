# CH-5b TASK_PACK 交棒文件（章節相遇＋共鳴邀請）

> **性質**：活文件。Fable 5 施工中，每完成一個 Block 即更新本檔。
> 若 Fable 5 因流量中斷，Codex（或任何接手 AI）從本檔 + ledger Lane 1 恢復，
> 按「§7 接手協定」繼續，**不需要重新規劃**。
>
> 最後更新：2026-07-12（Block 0 建檔；尚未動 src）

---

## 1. Owner 指示記錄（授權鏈）

- 2026-07-12 Owner：「INDEX 跟 COMMIT 跟 PUSH 至 MAIN」→ gate probe 修復 `2fe7592`；
  「一同處理」→ 五幼獸資產包 `6e50ab6`。main == origin/main == `6e50ab6`。
- 2026-07-12 Owner：「請繼續處理」→ CH-5b 開工計畫已呈報（四塊，含一項地基層）。
- 2026-07-12 Owner 對開工計畫的裁示：「**想請你判斷怎麼處理比較適當**，唯一要求＝
  隨時可因流量不足交棒給 Codex 繼續」→ Fable 5 判斷採**全包開工**（含地基層
  resonance state），本檔即交棒機制。
- **未授權事項**：完工後 commit/push 仍需 Owner 明確指示（CLAUDE.md §10）。

## 2. 目標與設計依據

- 設計：`docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md` §5（共鳴邀請）、§4（七章動線）、§8（CH-5 分包）。
- Ledger：Lane 1 的 CH-5a（`a5d44fa` 試煉接線）、CH-7（`2c1d958` 敘事包）、2026-07-11 資產升級條目。
- 一句話：通關章節＝取得「詢問資格」；牠依**這一章的關係**決定願不願意加入；
  未達→「還不是時候」＋方向句、永遠可再培養再問；達標→牠自己走過來（復用 TP-7）。

## 3. 施工前偵察結論（接手者不用重查）

1. **旅程斷頭缺口**：`chapterRegistry.getChapterForNode()` 所有節點回傳 1；
   `explorationNodes.js` 六個節點全在月湖 → 通關 ch1 後 ch2 無節點可打，**旅程走不下去**。
   CH-5b 必須補各章節點。
2. `enemyRegistry.js` 敵人自帶 `emotion` 標籤（sadness/anger/anxiety/fatigue/loneliness），
   與各章 `riftEmotion` 主題直接對得上，章節裂隙節點的 enemyPool 據此挑選。
3. `heartsparkCouncilCanon.js` 每隻有 `sampleLines.meet/battle/bond` + `temperament`
   → 相遇敘事與邀請台詞的語氣來源（內容層維持 TC，同 chapterNarrative 慣例）。
4. TP-7 機制：`gentleInvitationEngine.deriveInitiativeMoment`（純函數）+
   `companionInitiativeController`（EventBus `COMPANION_ANIMATION_INTENT`，不寫 chatHistory）
   → 「牠自己走過來」復用此管道。
5. 解鎖既有欄位：`unlockedCompanionIds` 聯集即可（companionRuntimePolicy CH-3 模型），無 schema 變更。
6. Migration 案例檔：`docs/qa/state-onboarding-migration-cases.mjs`
   （import store.js 的 `createDefaultState`/`normalizeState`，runCase/assertEqual 模式）。
7. 對峙結算落點：`battleController.js` `finishStandoff` 附近（~L290-345）——CH-5a 章節推進、
   記憶沉積、夥伴 reflection 都在這裡；overwhelmed 計數與章節快照寫入同點。

## 4. 定案設計（接手者照此實作，不重開設計）

### 4.1 State（地基層 GROUNDWORK — defaultState.js + store.js normalize）

```js
// defaultState 新增（存於既有 STORAGE_KEY = "nexusLinkR2State:v1"，絕不新增 localStorage key）
resonance: {
  // 章節起點關係快照：進入該章（advanceChapterProgress 使 current=N）時寫入一次。
  // 邀請判定用「現值 − 快照」＝這一章的增量。被拒後重新快照（見 4.3 rolling window）。
  chapterMarks: {},   // { [chapterNo]: { bondAtStart, trustAtStart, blockedTouchAtStart, overwhelmedCount, enteredAt, reaskedAt } }
  // 相遇 / 邀請狀態
  companions: {}      // { [companionId]: { metAt, lastAskAt, declinedCount, joinedAt } }
}
```

- `normalizeResonance()` 仿 `normalizeChapterProgress`：深層回填、型別清洗、未知 companionId 丟棄、
  數值 clamp；舊存檔缺整塊 → 空物件（lazy 補快照，見 4.3）。
- ch1 無相遇夥伴 → ch1 不需要快照；首個會用到的是 ch2（advance 時寫入）。

### 4.2 章節節點（explorationNodes.js + chapterRegistry.getChapterForNode + mapController）

- ch2–7 各區：1 個「氣氛節點」＋ 1 個「章節裂隙節點」（encounterChance:1、enemyPool 取該章
  riftEmotion 的敵人；mixed/all 用跨情緒池）。文案短句留白風，TC 內容層。
- 節點 id 建議：`plains_windrest` / `plains_rift`、`forge_emberpath` / `forge_rift`、
  `harbor_quayside` / `harbor_rift`、`core_lightwell` / `core_rift`、
  `tidal_saltmarsh` / `tidal_rift`、`mystic_summitgate` / `mystic_rift`。
- `getChapterForNode`：新增 id→章 對映表；月湖既有節點維持 1；未知節點回傳 1（保守，不變）。
- `mapController`：依 `chapterProgress` 提供區域切換（月湖＝家永遠在；current/completed 章的
  區域路徑可進）。新節點需要 NODE_LAYOUT 位置。**鎖區規則**：locked 章區不出現（不做灰色
  誘餌，紅線 6）。

### 4.3 共鳴邀請引擎（新純函數檔 src/engine/resonanceInviteEngine.js）

- `deriveResonanceInvite(state, chapterNo, now)` → `{ eligible, willing, cause, lines... }`
- 資格：`chapterProgress.completed` 含 N **且** 已相遇（`resonance.companions[id].metAt`）。
- 判定資料（全部現成欄位，**絕不讀 lastSeenAt / 上線頻率 / 離線時長**——紅線 1）：
  - `bondDelta = state.bond − mark.bondAtStart`、`trustDelta` 同理
  - `blockedDelta = state.blockedTouchCount − mark.blockedTouchAtStart`（章內連拍被拒）
  - `overwhelmed = mark.overwhelmedCount`（章內對峙 overwhelmed_but_safe 次數）
- 願意（建議閾值，常數集中檔頭並註解）：`bondDelta + trustDelta >= 6` 且 `blockedDelta <= 2`
  且 `overwhelmed === 0`。
- **拒絕＝rolling window**（紅線 2 精神：永不鎖死）：被拒時把 mark 重新快照為現值
  （`reaskedAt = now`、`overwhelmedCount` 歸零）→ 之後的培養從新基線累積，「可再培養後再問」。
- 拒絕方向句（依主因擇一，不顯示數字——紅線 6）：
  - 邊界主因：「你總是急著碰我。慢一點，我會自己靠近。」
  - overwhelmed 主因：「上次裂隙那裡，我撐得有點勉強。再陪我穩一些日子。」
  - 增量不足：「我們才剛認識。多走幾段路，再問我一次。」
- 願意台詞：取該 companion canon `sampleLines.bond` 意象改寫（每隻一句專屬）。
- **明確不做**：通關即送、進度條、「差幾點」提示、每日限制。

### 4.4 相遇敘事＋邀請 UI（mapController / battleController 接線）

- 相遇：首次探索章區任一節點 → 該次探索結果改為相遇場景（2–3 句，canon meet 意象），
  寫 `resonance.companions[id].metAt`。不解鎖、不給獎勵。
- 邀請入口：該章通關後，區域路徑頁出現安靜一行「牠在附近。」＋動作「去打個招呼」
  （無紅點、無倒數）。點擊 → 引擎判定 →
  - 願意：EventBus 發 `COMPANION_ANIMATION_INTENT`（TP-7 管道）＋ 心語 companion 台詞
    ＋ `unlockedCompanionIds` 聯集 ＋ `joinedAt`；
  - 還不是時候：方向句（心語 companion 台詞），`lastAskAt`/`declinedCount`/mark 重快照。
- overwhelmed 計數：`battleController` 結算處，outcome === "overwhelmed_but_safe" 且節點屬
  current 章 → `resonance.chapterMarks[current].overwhelmedCount += 1`。
- 章節快照：`battleController` chapterAdvance 寫入處，為新 current 章寫 mark（若缺）。

## 5. Block 進度看板（接手者從第一個未完成 Block 繼續）

| Block | 內容 | 狀態 |
| --- | --- | --- |
| 0 | 本交棒文件 + ledger IN PROGRESS 條目 | ✅ 完成 |
| D | 地基層：defaultState `resonance` + store `normalizeResonance` + migration 案例 | ✅ 完成（migration 30/30，含 4 新案例：fresh 空形狀/老存檔回填/合法保留/髒資料清洗；store.js 新 import isKnownCompanionId） |
| A | 章節節點 ×12 + getChapterForNode 對映 + mapController 區域路徑 | ✅ 完成：explorationNodes 12 節點（rift pool 按情緒配對）；getChapterForNode 對映表；mapController NODE_LAYOUT +12（前沿帶 y6-16）+ isNodeVisible 章節門控（月湖恆顯示、其餘只顯示 current 章；走過的章由 atlas 留存，不在探索圖堆積） |
| B | 相遇敘事（首訪章區節點 → 相遇場景 + metAt） | ✅ 完成：chapterNarrative ch2-6 meetLines+willingLine；mapController.maybeMeetChapterCompanion＝首訪章區「自成一拍」相遇（toast 演出 + 寫 metAt + 建關係快照，這次不結算探索）。**決策：相遇/邀請台詞只走地圖 toast，不寫 chatHistory、不發 companion 動畫 cue**（相遇者不在 Pixi 舞台，避免誤動 active 夥伴；實體登場留 CH-6 v3） |
| C | resonanceInviteEngine + 邀請 UI + battleController 計數/快照接線 | ✅ 完成：新純函數 resonanceInviteEngine.js（canAsk/evaluate/listAskable，願意閾值 affinityGain6/maxBlocked2/maxOverwhelmed0，拒絕 rolling window）；mapController 邀請橫幅（動態注入 map-canvas 上方，「X在附近。去打個招呼」，接受→union unlock+joinedAt、拒絕→重快照+declinedCount）；battleController overwhelmed_but_safe→mark.overwhelmedCount；styles.css .map-invite-banner |
| E | 驗證：node --check、新 harness、migration 全綠、瀏覽器全流程、web release gate | ✅ 完成：node --check ×8 PASS；migration 30/30（+4 resonance）；新 harness `_resonance_invite_cases.mjs` 12/12；瀏覽器全流程 PASS（見下）；**web release gate 10/10 required PASS**（port 8655、exit 0、0 console error、accessibilityWarnings 空） |

### Block E 瀏覽器驗證證據（port 8655，veteran 存檔快進）

- **節點門控**：月湖 6 節點恆顯示；當前章 2 節點顯示；其餘章節點不建立（ch2 時見風歇草坡/孤鳴裂隙，ch3 時見餘燼小徑/沉怒裂隙，且前章節點消失）。
- **相遇（自成一拍）**：點風歇草坡 → toast「相遇 ・ 芽角小鹿」+ meetLines；`resonance.companions.sprigfawn.metAt` 寫入；`chapterMarks[2]` 快照 bond20/trust15；`explorationProgress.visitCounts.plains_windrest` 仍 0（相遇這拍不結算探索）。
- **共鳴邀請—願意**：ch2 通關 + bond26/trust17（Δ8≥6）→ 橫幅「芽角小鹿在附近。去打個招呼」→ 點擊 → toast「共鳴 ・ 芽角小鹿」+ willingLine；存檔 `unlockedCompanionIds=[greyshade-cat, sprigfawn]`、`joinedAt` 寫入；橫幅收起。
- **共鳴邀請—拒絕（rolling window）**：ch3 met + Δ0 → toast「星紋小虎」+「我們才剛認識。多走幾段路，再問我一次。」；`declinedCount=1`、`reaskedAt` 重快照、`joinedAt=null`、未解鎖；**橫幅維持顯示（可再問，不鎖死）**。
- **0 console error**（screenshot 工具對本 WebGL 頁逾時＝既知 capture 限制，非頁面問題）。

> 狀態標記規範：⬜ 未開始 / 🔶 進行中（附「做到哪、下一步」）/ ✅ 完成（附驗證證據）。

## 6. 預計 changed files

- `src/state/defaultState.js`（GROUNDWORK：+resonance）
- `src/state/store.js`（GROUNDWORK：+normalizeResonance + createDefaultState 深拷貝）
- `src/data/explorationNodes.js`（+12 節點）
- `src/data/chapterRegistry.js`（getChapterForNode 對映表）
- `src/engine/resonanceInviteEngine.js`（NEW，純函數）
- `src/ui/mapController.js`（區域路徑 + 相遇 + 邀請入口）
- `src/ui/battleController.js`（overwhelmed 計數 + 章節快照，緊鄰既有 CH-5a 塊）
- `docs/qa/state-onboarding-migration-cases.mjs`（+resonance 案例）
- 新 harness（src/ai/testHarness/ 或 docs/qa/ 慣例，實作時定）
- `docs/agent/AI_EXECUTION_LEDGER.md`（Lane 1 條目）
- 本檔（進度更新）

## 7. 接手協定（Codex 看這裡）

1. 讀本檔 §4 定案設計 + §5 看板，從第一個 ⬜/🔶 Block 繼續；🔶 者先讀其「做到哪」註記。
2. 憲法約束照舊：CLAUDE.md §1–2（三契約七紅線）、§5.1（本包地基層僅限 §6 列出的兩檔、
   已由 Owner 2026-07-12 裁示授權）、內容層 TC、不新增 localStorage key、不碰 index.html 結構、
   不碰安全層、**未經 Owner 指示不 commit/push**。
3. 驗證環境：node 不在 PATH → `NEXUS_NODE=C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`；
   `PYTHONIOENCODING=utf-8`；gate 用乾淨 port（5173 被占）：
   先 `python -m http.server 8642 --bind 127.0.0.1`，再
   `python docs/qa/_run_web_release_gate.py --base http://localhost:8642 --no-server`。
   Migration 單跑：`$NEXUS_NODE docs/qa/state-onboarding-migration-cases.mjs`。
4. gate 輸出 JSON（docs/qa/_*_output.json）為副產物，勿 stage。
5. 完工：更新本檔 §5 全 ✅ + ledger 條目（VERIFIED，等 Owner commit 指示）+ 向 Owner 回報
   changed files + 驗證證據 + 手動測試法。
