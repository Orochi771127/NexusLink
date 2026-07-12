# Codex Continuation Handoff — 2026-07-12

> 目的：讓 Codex 讀完這一份就能安全接手，不必從 chat 重建脈絡。
> 本文服從 `CLAUDE.md` / `AGENTS.md` / `ACCEPTANCE.md` / `NEXUS_LINK_MASTER_CANON_v3.1.md`；衝突以上位文件為準。

## 0. 讀取順序（Codex 開工前）

1. 本文（現況 + 你的下一步候選）
2. `docs/agent/AI_EXECUTION_LEDGER.md` → Lane 1 最新 3 筆
3. `docs/strategy/NEXUS_LINK_COMMERCIALIZATION_COMPLETION_PLAN.md`（商業化 SSOT）
4. 你認領的那一包在 `docs/agent/NEXT_AI_TASK_PACK_QUEUE.md` 的 allowed/forbidden files
5. `CLAUDE.md` §1 三契約、§2 七紅線、§5 授權分級

## 1. 現況（2026-07-12 已驗證）

- **Branch / commit**：`main` / `458b883`（"art: add rift silhouette review batch"）。
- **工作區**：乾淨，**僅 3 份 doc 未提交**（見 §2）；無 src/assets 變動。**未 commit / push**——提交與否由 Owner 決定。
- **商業化定位**：見 SSOT 計畫。變現載體＝發行層（Steam 付費本體 + 章節 DLC），web 無 IAP（憲法禁後端）。
- **step 5（Explore/Care/Growth/Memory 四大頁）已完成並實機驗證可運行**（`src/ui/pageRouter.js` + `src/app.js:317/344` + `styles/page-content.css` + `index.html #page-layer`；390×844 四頁渲染正常、view state 正確、console 零錯誤）。
- **真正的 release blocker 是人類 gate**（真機矩陣 / 3 人私測 / 法務・商店文案 / 桌面封裝 ADR → Steam），非 AI 可關。

## 2. 未提交檔案（提交前請 review）

| 狀態 | 檔案 | 內容 |
|------|------|------|
| M | `docs/agent/AI_EXECUTION_LEDGER.md` | 我今日 Lane 1 兩筆條目（plan + step5 驗證） |
| M | `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md` | §4 doc-drift 修正（step 5 已實裝） |
| ?? | `docs/strategy/NEXUS_LINK_COMMERCIALIZATION_COMPLETION_PLAN.md` | 新增商業化完成計畫 SSOT |
| ?? | `docs/handoff/CODEX_CONTINUATION_HANDOFF_2026-07-12.md` | 本交接文件 |

以上皆 docs-only、LOW 風險。要不要 commit 由 Owner 決定（`git diff --check` 應乾淨）。

## 3. Codebase memory 索引（導航用，已刷新）

- Project：`C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink`（2026-07-12 以 `moderate` 重建，~12,465 nodes / 16,332 edges，含 call/usage + similarity/semantic 邊）。
- **優先用圖工具而非盲 grep**：`search_graph`（找 fn/class/route）、`trace_path`（呼叫鏈/資料流）、`get_code_snippet`（精確取源）、`get_architecture`（結構總覽 + Leiden 群集）。
- 排除目錄（非 code）：`docs` / `assets` / `scripts` / `tools` / `src/i18n` / `src/tools` / `src/ai/external` / `src/ai/tools`。

## 4. 你（Codex）建議認領的下一步（每包仍需 Owner Gate-2 才開工）

依 `NEXT_AI_TASK_PACK_QUEUE.md`，以下推薦 owner 為 Codex：

### TP-6 — 音效現實（體感最大跳升）
- 目標：接 6–10 個 SFX（touch accept/guarded/reject、Soul Talk send/reply、trace bloom、standoff action/telegraph、milestone）+ 1 個湖景 ambient loop，走既有 `src/audio/audioManager.js`（已持久化 `sfxVolume`，目前無播放）。含 Settings SFX slider 誠實化 + Atlas 佔位鈕 gate。
- Allowed：`src/audio/audioManager.js`、`src/ui/settingsController.js`、發聲點（`interactionController.js` / `soulTalkController.js` / `battleController.js` / trace-echo path）、`assets/audio/**`（**新檔僅限 Owner 授權**）、`AI_EXECUTION_LEDGER.md`。
- Forbidden：`index.html`（除非一行經核可）、`src/state/**`、`src/pixi/pixiApp.js`、其他。
- 紅線：安全轉場（safety-redirect）**保持靜默**、無通知音、無獎勵 fanfare（紅線 7）。
- Gate：**Owner 先選/授權音檔（assets=GROUNDWORK + 授權檢查）**；完成後 Owner 真機聆聽。

### TP-4 — i18n sc/jp 補齊（便宜、機械式）
- 目標：把 Commercial RC pass 新增、目前 fallback 到 tc 的 53 個 content key 補上簡中/日文值。內容層（Soul Talk 對話池、里程碑主題）翻譯**不在範圍**（待 Owner 語言政策）。
- Allowed：`src/i18n/strings.js`、`AI_EXECUTION_LEDGER.md`。Forbidden：其他全部。
- 驗證：`node --check src/i18n/strings.js` + STRINGS 完整性（0 缺語言、所有 `t()` 可解）+ web release gate（乾淨 port）。Gate：Owner 語氣審（須維持稀疏、非強迫的夥伴嗓音）。

### TP-2 — Raphael 狀態/handoff 刷新（殺過期文件陷阱）
- 目標：更新 `docs/handoff/RAPHAEL_AI_STATUS.yaml` / `RAPHAEL_AI_HANDOFF.md`（last_updated 2026-06-24 → 現況），清 `docs/architecture/RUNTIME_MAP.md` 的 `NEEDS UPDATE`。
- Allowed：上述 doc + `AI_EXECUTION_LEDGER.md`。Forbidden：`src/**`、`assets/**`、root canon、`ACCEPTANCE.md`。QA 數字每一項都要對得上 `docs/qa/*` 證據，否則標 NOT VERIFIED。

## 5. 硬約束（不可違反）

- **憲法**：三契約（記得你但不屬於你／靠近但不吞噬／影響但不支配）、七紅線（尤其 1 不做依賴偵測、6 不做 FOMO/紅點、7 求助不變獎勵）。
- **授權分級**：GROUNDWORK（`index.html`/`src/state/*`/`pixiApp.js`/`assets/**`/`tools/**`/`scripts/**`）逐項問 Owner；EXPERIENCE 問一次開工計畫後連續做完。
- **不引入** 框架/TS/npm/build/後端/真 LLM。
- **變現程式**（store/chapter economy）在 **TP-8 Initial Bond 決策前不寫**（見 SSOT §6）。
- **不 commit / push**，除非 Owner 明確指示。每包**收尾追加 ledger**（Lane 分開，勿混）。

## 6. 不是 Codex 能關的（人類 gate，別排進 backlog）

真機回歸矩陣、3 人 moderated 私測、法務/隱私/商店文案、Desktop wrapper ADR、Steam 上架要件。

## 7. 驗證與收尾（每包）

`node --check`（用 bundled codex node，node 不在遊戲 PATH）→ web release gate（乾淨 port，**避開被佔的 5173，以及本機曾用 8128 預覽**）→ 手動 smoke → 附 changed files + 測試法 → 追加 `AI_EXECUTION_LEDGER.md` → 對照 `ACCEPTANCE.md` 與七紅線逐條自評。

> 本機預覽：`.claude/launch.json` 有 `nexuslink`（`python -m http.server 8128 --directory NexusLink`）等設定可直接用。
