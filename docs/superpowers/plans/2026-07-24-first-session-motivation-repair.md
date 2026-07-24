# First Session Motivation Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓首輪約 12 分鐘內，玩家能理解「現在能做什麼／為什麼／改變了什麼／為何值得回來」，且不引入 FOMO 機制。

**Architecture:** 在既有 first-loop → gentle invitation → habitat moment 鏈上，新增 **session-only**「共鳴線索／Resonance Thread」（最多一條、可關閉），並補強 Emotional Standoff 的目標／行動意義／三層因果文案與「回棲地後果」預告。方向內容由純函式從既有 state derive，不新增 save schema。

**Tech Stack:** 純靜態 ES Modules、既有 `EventBus`／controllers／`src/i18n/strings.js`、dynamic DOM（不改 `index.html`）。

**Status:** Implementation on `main` — `VERIFIED_STRUCTURED` (2026-07-25). Formal 5-stranger cohort remains pre-launch (`PACK1_SJ_HUMAN_SCORESHEET.md`).

**Owner decisions applied (2026-07-24):**
- D1: Active-companion display name seeds (灰影／焰尾／晶鰭／夥伴)
- D2: Defer unguided standoff until first-loop done + visible emotional trace; lifetime-first guided card when allowed
- Moonlake BGM corrected to `bgm_ethereal_moon_lakefront.mp3`

**Source reviews:** `docs/audits/FIRST_SESSION_MOTIVATION_REVIEW.md`、`docs/strategy/NEXUS_LINK_REPAIR_SEQUENCE.md` TASK PACK 1。

## Global Constraints

- 低壓力 ≠ 低方向性；先清楚，後留白。
- 禁止：紅點、倒數、streak、每日重置、缺席懲罰、貨幣獎勵、新夥伴、戰鬥內容擴張、save schema／storage key 變更。
- Resonance Thread：最多一條、可選、可 dismiss、須說明「為什麼重要」與「會留下什麼」。
- Groundwork：不改 `index.html`、`defaultState.js`、`store.normalizeState`、`saveManager.js`、`pixiApp.js`、資產檔。
- 390×844 可讀；文案優先繁中（`tc`），既有 i18n 鍵一併補齊。
- 灰影不是唯一中心；Thread 文案依 **active companion** 語氣，但首輪預設可 Greyshade-first 種子。

### Owner decisions（建議預設；實作前請確認或覆寫）

| ID | 決策 | 建議預設 |
|---|---|---|
| D1 | Resonance Thread 語氣 | Active-companion 感知；首輪種子以當前 active（含灰影／焰尾／海馬）各 1 套短句，避免寫死「只有灰影」 |
| D2 | 首次 Emotional Standoff | **延後到 first-loop 完成（或 skip）且至少有一筆可見 habitat trace 之後**；若玩家提早開圖進入對峙，顯示一張 guided 說明卡（目標＋行動意義），不永久代選行動 |

---

## File map（將建立／修改）

| File | Responsibility |
|---|---|
| **NEW** `src/engine/resonanceThreadEngine.js` | 純 derive：最多一條 thread（kind、why、consequence、ctaHint） |
| **NEW** `src/ui/resonanceThreadController.js` | Session-only UI：顯示／dismiss／與 panel／onboarding／first-loop 互斥 |
| `src/engine/gentleInvitationEngine.js` | 可選：共用 eligibility helpers；避免與 Thread 雙線搶同一句 |
| `src/ui/gentleInvitationController.js` | Thread 顯示時壓低或隱藏 invitation，避免兩句並存 |
| `src/ui/battleController.js` | 目標列、行動意義、首次 guided 卡、結束時三層因果／回棲地預告 |
| `src/engine/battleEngine.js` | Copy helpers only（不改數值公式） |
| `src/ui/mapController.js` | First-standoff gate；探索結束一句回棲地預告 |
| `src/i18n/strings.js` | `rt.*`、`battle.objective*`、`battle.actMeaning*`、因果／preview 鍵 |
| `styles/ui-v3-onboarding.css`（或同家族既有 CSS） | Thread／guided 卡樣式（無紅點、無 badge 堆疊） |
| `src/app.js` | create／bind／render／subscribe wiring only |
| `docs/qa/first-session-motivation-cases.mjs` | Derive＋gate 靜態驗收 |
| `docs/testing/MANUAL_TEST_CHECKLIST.md` | 補 §J 五問 playtest 條目 |
| `docs/agent/AI_EXECUTION_LEDGER.md` | Pack 1 進度 |

---

## Task 1: Resonance Thread engine（derive only）

**Files:**
- Create: `src/engine/resonanceThreadEngine.js`
- Test: `docs/qa/first-session-motivation-cases.mjs`

- [ ] **Step 1:** 寫失敗／預期案例：onboarding 未完成 → null；first-loop touch 階段 → 一條「先靠近」；已有 trace 無探索 → 「帶牠走一段」；本日已足夠痕跡 → completion line；dismissedKinds 含該 kind → 不重複同 kind。
- [ ] **Step 2:** 實作 `deriveResonanceThread(state, session = {})` 回傳 `{ kind, title, body, why, consequence, ctaHint } | null`。
- [ ] **Step 3:** 優先序（範例，可微調）：`meet_presence` → `first_touch` → `first_soul` → `first_trace_visible` → `safe_explore` → `return_habitat_look` → `session_enough`。
- [ ] **Step 4:** 跑 `node docs/qa/first-session-motivation-cases.mjs` 至綠。
- [ ] **Step 5:** Commit：`feat(ux): add resonance thread derive engine`

---

## Task 2: Resonance Thread controller（session-only UI）

**Files:**
- Create: `src/ui/resonanceThreadController.js`
- Modify: `src/app.js`, `styles/ui-v3-onboarding.css`, `src/i18n/strings.js`
- Modify: `src/ui/gentleInvitationController.js`（互斥）

- [ ] **Step 1:** Dynamic DOM 掛在 home 訊息區旁（同 gentle-invitation 家族）；按鈕「先這樣」= dismiss（只寫 session `dismissedKinds`／`dismissedAt`）。
- [ ] **Step 2:** `canShow`：onboarding 完成、非 panel-open、非 first-loop 進行中、非 st-focus、有 derive 結果。
- [ ] **Step 3:** Thread 可見時 `gentleInvitation` 不顯示（或降為不搶主句）。
- [ ] **Step 4:** 無 countdown／紅點／streak／currency。
- [ ] **Step 5:** 手動：完成 touch 後出現一條；dismiss 後本 session 不再同 kind；reload 可再出現（session-only 可接受）。
- [ ] **Step 6:** Commit：`feat(ux): add dismissible resonance thread UI`

---

## Task 3: Early Emotional Standoff meaning + objective

**Files:**
- Modify: `src/ui/battleController.js`, `src/engine/battleEngine.js`, `src/i18n/strings.js`

- [ ] **Step 1:** 對峙面板頂部加一行可讀目標（例：`battle.objective.fatigueNoise`）。
- [ ] **Step 2:** 為 共鳴／設界／穩定／撤退 各加 `actMeaning.*`（預期後果，非數值刷分）。
- [ ] **Step 3:** 首次對峙（`battleRecord` 無先前 wins／或 session `firstStandoffGuideShown`）顯示建議，**不永久代選**；之後只留 telegraph。
- [ ] **Step 4:** 撤退文案明確：保留進度（若適用）、非失敗、無關係懲罰。
- [ ] **Step 5:** `node --check` + 手動開一場對峙確認版面不炸 390×844。
- [ ] **Step 6:** Commit：`feat(standoff): clarify objective and action meanings`

---

## Task 4: Three-layer causality + return-to-habitat preview

**Files:**
- Modify: `src/engine/battleEngine.js`（或 outcome copy helper）, `src/ui/battleController.js`, `src/ui/mapController.js`, `src/i18n/strings.js`

- [ ] **Step 1:** 對峙／探索結束時輸出三層句骨架：Immediate／Event／Long-term（禁止只顯示 `+2 trust`）。
- [ ] **Step 2:** 結束卡或 `statusText` 加一句「回到棲地可能看見…」preview（不保證具體資產，只承諾關係／痕跡向）。
- [ ] **Step 3:** 若已有 trace／memory 寫入路徑，preview 對齊真實會發生的事（勿承諾未實作系統）。
- [ ] **Step 4:** Commit：`feat(ux): add three-layer causality and habitat return preview`

---

## Task 5: Delay / guide first standoff gate

**Files:**
- Modify: `src/ui/mapController.js`（觸發前）, optionally `battleController.startBattle`

- [ ] **Step 1:** Gate：`!onboarding.firstLoop.completedAt && !skippedAt` 或尚無 emotional habitat trace → 不直接 `startBattle`；改顯示短引導（回 Thread／先完成 first-loop）。
- [ ] **Step 2:** First-loop 完成後允許對峙；若仍是生涯首次，走 Task 3 guided 卡。
- [ ] **Step 3:** 案例：gate true/false 寫入 harness。
- [ ] **Step 4:** Commit：`fix(map): delay unguided first emotional standoff`

---

## Task 6: Docs, checklist, ledger, acceptance wiring

**Files:**
- Modify: `docs/testing/MANUAL_TEST_CHECKLIST.md`, `docs/agent/AI_EXECUTION_LEDGER.md`, `docs/strategy/NEXUS_LINK_REPAIR_SEQUENCE.md`（Pack 1 status）
- Optional: `docs/qa/NEW_PLAYER_PLAYTEST_SCRIPT_*.md` 對齊五問

- [ ] **Step 1:** 清單加入 §J：90 秒知第一步、10 分鐘能說出一項可見改變、結束能說出一項期待、無開發者解說、無 FOMO 動機。
- [ ] **Step 2:** Ledger 記 Pack 1 IN PROGRESS → VERIFIED（僅在驗收後）。
- [ ] **Step 3:** Commit：`docs: first-session motivation repair acceptance hooks`

---

## Out of scope（明確不做）

- Per-companion bond/trust migration（Pack 2）
- Memory projection SSOT（Pack 3）
- Dynamic chapter encounters（Pack 4）
- 醫療／治療性用語大掃除全文（Pack 5；本包文案避免新增醫療宣稱即可）
- 新 BGM／資產／依賴／build step

## Rollback

- Feature-flag 或 `resonanceThreadController` no-op bind；還原 standoff／map 文案鍵為舊字串；不需 save migrate。

## Verification commands

```powershell
node --check src/engine/resonanceThreadEngine.js
node --check src/ui/resonanceThreadController.js
node docs/qa/first-session-motivation-cases.mjs
git diff --check
python -m http.server 5173
```

手動：無痕首輪 12 分鐘路徑；Dismiss Thread；首次對峙引導；390×844；Console 無未處理錯誤。

## Playtest gate（合入後人工）

至少 5 位未接觸過 Nexus Link 的玩家，問：

1. 這隻角色和普通電子寵物有什麼不同？
2. 你現在知道下一步可以做什麼嗎？
3. 剛才哪個行動改變了角色或世界？
4. 你知道為什麼下次可能值得回來嗎？
5. 你剛才有沒有感到被逼著繼續？
