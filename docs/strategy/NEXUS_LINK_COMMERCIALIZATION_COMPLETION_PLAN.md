# Nexus Link — 商業化完成計畫（Commercialization Completion Plan）

> Status: proposal / living plan（提案・活文件）
> Created: 2026-07-12
> Authority: 本文**不上位**於 `NEXUS_LINK_MASTER_CANON_v3.1.md` / `AGENTS.md` / `CLAUDE.md` / `ACCEPTANCE.md` / `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`。它只是**把上述文件的商業化路徑收斂成一張可排序、可追蹤、標清「AI 可做 vs 人類 gate」的落地計畫**。任何衝突以上述上位文件為準。
> Scope: 讓 Nexus Link 從「商業化前垂直切片」推進到「可上架的第一個商業產品」的完整路徑與現況對照。

---

## 0. 一句話定位

**「完成商業化」＝ 走完 `STEAM_DEMO_MASTER_BLUEPRINT` 的 10 步交付序列，在不背叛憲法（守憲法・道德變現）的前提下，把穩定的 Web runtime 經「桌面封裝 → Steam」變成可販售的產品，並通過所有人類 gate（真機 / 私測 / 法務 / 資產授權）。**

關鍵事實三條，先講清楚：

1. **變現不在 web runtime 內發生。** 憲法硬禁 backend / 帳號 / 資料庫 / npm / build step，因此 web 版**無法**做 in-app 購買。→ 變現的真正載體是**發行層**：Steam 付費本體 ＋ 章節 DLC（未來或經獨立 gate 的 mobile store）。這調和了「不做後端」與「§0.6 賣章節」。
2. **真正卡住上架的多是人類專屬 gate**（真機回歸 / 3 人私測 / 法務・隱私・商店文案 / 桌面封裝 ADR / Steam 帳號金流簽章）。**沒有任何 AI pack 能關掉這些**（見 `NEXT_AI_TASK_PACK_QUEUE.md` 的「Not in the queue」）。
3. **變現程式與章節經濟被一個產品身分決策卡住**：**TP-8 Initial Bond**（初遇是否給選角）。佇列明載這「擋住 store/chapter 層」，且「是產品身分決策，不是工程決定」。→ 見 §6。

---

## 1. 道德變現規格（Ethical Monetization Spec，鎖 §0.6 + 三契約 + 七紅線）

### 1.1 商業模式（What we sell）

| 賣什麼 | 形式 | 玩家買到的是 |
|--------|------|-------------|
| **章節篇章** | Steam DLC / 內容包 | 一段**相遇與故事**（可帶來新 companion 的登場篇章）——買的是「相遇的篇章與內容」，**不是角色所有權** |
| **棲地** | 內容包 | 新的情緒棲地場景與其日常/痕跡 |
| **音樂 / 故事 / 相遇** | 內容包 | 敘事與氛圍擴充 |
| **本體（demo→full）** | Steam 付費本體 | 完整的第一部旅程；demo 免費證明體驗 |

### 1.2 硬禁（憲法紅線，違反即嚴重缺陷）

- ❌ 抽卡 / gacha、稀有度、角色皮膚商城、戰力禮包、貨幣、loot loop、角色蒐集壓力
- ❌ 每日登入 / 連續打卡 / 紅點 / 倒數 / FOMO / 「你錯過了」
- ❌ 依賴偵測驅動、把安全求助當獎勵、浪漫依賴、醫療/治療宣稱、「永遠在等你」語言
- ❌ 在 web runtime 塞後端/帳號/金流以做 IAP

### 1.3 變現與情感契約的對齊（每個變現決策都要過這關）

- **契約一（記得你但不屬於你）** → 付費不得買到「角色所有權」；買的是相遇篇章。切換/再遇見是**敘事行為**，非快捷換皮。
- **契約二（靠近但不吞噬）** → 不得用內容包製造「不買就被冷落/懲罰」。免費本體必須情感自足。
- **契約三（影響但不支配）** → 無「付費強制進化/強制親密/強制服從」。
- **一位 active companion 為情感主體** 的約束在商業版照舊；共鳴圈（最多三隻已結緣）採意願制（見 `docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md`）。
- **旅痕**（未來系統）不得變成登入獎勵 / 每日派遣 / 離線收益農場。

### 1.4 定價/包裝形狀（待 owner 確認，見 §7）

建議 shape（非最終）：免費 demo（灰影貓 × 月湖垂直切片）→ 付費本體（第一部完整旅程）→ 章節 DLC（各帶一段相遇/一位新夥伴登場）。定價、幣別、地區、退款政策屬 §5 法務/商店 gate。

---

## 2. 10 步藍圖 × 現況對照

> 狀態為本計畫作者依現有文件＋專案記憶研判；**精確 commit/gate 以 `docs/agent/AI_EXECUTION_LEDGER.md` 為準**。當前 HEAD＝`main` / `ed3acb2`（2026-07-14 對帳）。詳見 `docs/agent/COMMERCIAL_SHIP_READINESS_2026-07-14.md`。

| # | 藍圖步驟 | 研判狀態 | 負責 | 備註 |
|---|----------|----------|------|------|
| 1 | Blueprint Lock / No Code | ✅ Done | — | 藍圖已存在並鎖定 |
| 2 | V3 Visual System Tokens | ✅ 大致 Done | AI+人核 | `NEXUS_LINK_V3_VISUAL_SYSTEM.md` 為 CURRENT |
| 3 | State / Onboarding Migration | ✅ 大致 Done | AI(GROUNDWORK)+人核 | First Session Flow 地基已上（playerProfile/onboarding、veteran-save heuristic） |
| 4 | Start / Identity / Guidance / Home | ✅ 大致 Done | AI+人核 | First Session 九拍已上線並做過易讀性修補 |
| 5 | Explore/Care/Growth/Memory 全頁 | ✅ Done（2026-07-12 查證程式碼） | AI(EXPERIENCE) | `src/ui/pageRouter.js` 四頁皆完整 DOM 全頁（焦點卡/證據條/量表/進度/傾向/可反思記憶清單）+ 五種 view state + i18n + 接真效果；`index.html` `#page-layer` 四 body 已接、`styles/page-content.css` 已樣式化、`app.js:317/344` 已 wire+bind。⚠️ **`COMMERCIAL_UIUX_HANDOFF §4` 仍稱此為「下一個切片」＝過期 doc drift，待修** |
| 6 | First Trace / Return Echo loop | ✅ 大致 Done | AI | 已含於 First Session；需確認無重複記憶寫入 |
| 7 | Illustrated runtime asset audit | ✅ v1 Done | 人核(資產)+AI | GAP-1 裂隙剪影 10/10 runtime 已接（2026-07-12）；灰影貓 512 runtime **已完成**（舊述為 doc drift）。六區近景棲地＋進化美術列 post-v1（GAP-3/GAP-2） |
| 8 | Raphael Restricted Habitat Agent | 🟡 Partial | AI+人核 | RaphaelCore load-bearing；Limited Beta 候選（holdout 48/48）；人類盲評 not_run |
| 9 | Web release gate / 私測包 | 🟡 自動過、人類 gate 開 | **人核 gate** | 2026-07-14 自動 gate **10/10**；真機回歸 + 3 人私測未關 |
| 10 | Desktop wrapper ADR | 🟡 草案 | **人核 gate** | `ADR-001-DESKTOP-WRAPPER.md` 已起草（建議 Tauri）；待 Owner 拍板後建原型 |

**→ 產品體驗本體已走到 7～8 成；商業化的『最後一哩』集中在 step 7–10 的資產、agent 收尾，以及全部人類 gate。**

---

## 3. 關鍵路徑（Critical Path to Commercial Ship）

```text
[AI 可做] 收尾 step 5 全頁 + step 7 資產稽核 + step 8 agent 接線 + 體感品質(TP-6/7)
      │
      ▼
[人核 gate] TP-8 Initial Bond 決策  ──►  解鎖章節/變現層設計
      │
      ▼
[人核 gate] 真機回歸矩陣 (iOS Safari / Android Chrome / IG·FB·LINE webview)
      │
      ▼
[人核 gate] 3 人 moderated 私測（PRIVATE_TEST_SCRIPT 通過標準）
      │
      ▼
[人核 gate] 法務 / 隱私 / 商店文案
      │
      ▼
[人核 gate] Desktop wrapper ADR (Tauri vs Electron)  ──►  桌面原型
      │
      ▼
[人核 gate] Steam 帳號 / 金流 / 簽章 / 控制器 / 更新策略 / 資產授權
      │
      ▼
   Steam Demo → 付費本體 → 章節 DLC（道德變現）
```

---

## 4. AI 可執行工作流（每包仍需你 Gate-2 點頭才開工）

依 `NEXT_AI_TASK_PACK_QUEUE` 排序，這些是**我權限內、且不違憲**可推進的，用來把 step 5/7/8 收尾並拉高體感品質：

| 包 | 目標 | 層級 | 建議模型 | 人核 gate |
|----|------|------|----------|-----------|
| **TP-6** | 音效現實：Web Audio 合成 SFX v1 **已出貨**（10 種 + BGM）；CC0 錄音升級列 v1.1 polish | EXPERIENCE + assets | — | 真機聆聽 + 可選 CC0 升級 |
| **TP-7** | 夥伴主動微時刻（僅由夥伴狀態驅動，非玩家缺席）——最大差異化 | EXPERIENCE | Claude Code 實作、Codex eval、Fable5 紅線審 | 行為清單前置 + 手感後審 |
| ~~step 5 收尾~~ | ✅ 已完成（見 §2）——四頁真頁面已上線，本項移除，僅剩可選的 live 驗證/內容加厚 | — | — | 若要做＝EXPERIENCE 級 polish，非「補建」 |
| **step 7 稽核** | ✅ v1 完成（GAP-1 + greyshade 512）；post-v1：六區棲地、進化美術 | — | — | — |
| ~~TP-2~~ | ✅ 2026-07-14 完成 — Raphael status/handoff 刷新 | doc | — | Owner review |
| ~~TP-4~~ | ✅ 已完成 — 252 keys × 4 語言零缺漏（2026-07-06 起）；語氣校對仍待人核 | doc / 資料 | — | 日文語氣審 |

> 註：所有變現程式（store/chapter economy）在 **TP-8 決策前不排入**——那是憲法明文延後、需獨立 gate 的 GROUNDWORK。

---

## 5. 人類 Gate 清單（真正的 release blocker — 你要做的事）

這些**我做不到**，是實際擋住上架的關卡。依序：

1. **真機回歸矩陣** — iPhone Safari、Android Chrome、IG/FB Messenger/LINE 內嵌各跑首輪 + Soul Talk 鍵盤避讓 + 對峙四結局。標準見 `STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`。
2. **3 人 moderated 私測** — 依 `PRIVATE_TEST_SCRIPT.md`；通過標準＝測試者理解「記得的互動 / 夥伴邊界 / 棲地變化」，且**不把拒絕解讀為懲罰**。
3. **法務 / 隱私 / 商店文案** — 隱私揭露、年齡分級、商店頁文案（守反-AI-slop 文風）、免責（非醫療/治療）。
4. **TP-8 Initial Bond 產品決策**（見 §6）— 解鎖變現層。
5. **Desktop wrapper ADR** — Tauri vs Electron；評估 runtime 重用、存檔備份、離線、輸入、更新、崩潰、封裝大小、SteamPipe、隱私、法務。
6. **Steam 上架要件** — Steam 開發者帳號、金流/稅務、程式簽章、控制器/鍵盤方案、更新策略、**所有 runtime 資產的授權/來源合規**（生成圖在人核核可前僅為 reference）。

---

## 6. TP-8 Initial Bond 決策框架（變現層的鑰匙）

現況矛盾：`defaultState.js` 只解鎖 `greyshade-cat` 且無初遇選擇畫面，正是 Master Canon §86 警告的退化態。兩條出路，**只有你能決定**：

- **選項 A — 建「初遇選一」儀式**（2–3 隻、各一句、pick-and-commit，符 Canon §80）。
  - 層級：GROUNDWORK（動 `defaultState.js` + `store.normalizeState` migration + onboarding UI）。較慢、較重，但把「賣相遇篇章」的產品可信度做滿。
- **選項 B — 定灰影貓為垂直切片的固定首夥伴**，修訂 Canon §176 / AGENTS.md §7 過期敘述。
  - 層級：docs-only。快、低風險；把「選角」留到章節 DLC 才登場。

> 我的傾向（可辯論）：**垂直切片/demo 走 B**（最快讓 demo 可私測、可上架），**選角儀式留給付費章節**登場——既符「買的是相遇篇章」的變現定位，又不讓 demo 因 GROUNDWORK migration 延期。最終仍由你拍板。

---

## 7. 待 Owner 拍板的開放決策

1. **變現載體確認**：接受「Steam 付費本體 + 章節 DLC」為主變現通路（web 保持免費 demo、無 IAP）？或另有想法（如 itch.io 贊助、mobile store）？
2. **TP-8 A / B**（見 §6）。
3. **定價/包裝形狀**（§1.4）。
4. **首個要收尾的 AI 包**：TP-6 音效 / TP-7 夥伴主動 / step 5 全頁 —— 哪個先。

---

## 8. 完成定義（Definition of Done，分階段）

- **Demo 可私測**：step 5 全頁 + step 7 資產無衝突 + release gate 綠 + TP-6/7 到位 + 首輪對陌生玩家可懂。
- **Demo 可上架**：3 人私測過 + 真機矩陣過 + 法務/商店文案過 + 桌面封裝 ADR 定案。
- **商業化完成（第一部）**：Steam 付費本體上線 + 至少一個章節 DLC 走通「道德變現」全流程（買到相遇篇章、非所有權）+ 全程六紅線自評無違反。

---

## 9. 驗證與收尾（沿用專案工作法）

每個 AI 包：`node --check`（bundled codex node）→ web release gate（乾淨 port，避開被佔的 5173）→ 手動 smoke → 附 changed files + 測試法 → 追加 `docs/agent/AI_EXECUTION_LEDGER.md` → 對照 `ACCEPTANCE.md` 與七紅線逐條自評 → **未經你明確指示不 commit/push**。

---

## 10. 不做什麼（明文邊界）

- 不在 web runtime 引入後端/帳號/金流/IAP。
- 不做抽卡/稀有度/皮膚商城/戰力包/每日登入/紅點/倒數。
- TP-8 決策前不寫任何 store/chapter economy 程式。
- 不動 GROUNDWORK（`index.html`/`state/*`/`pixiApp.js`/`assets/**`）除非升級為獨立 gated 包。
- 不把「完成商業化」解讀為可跳過人類 gate。
