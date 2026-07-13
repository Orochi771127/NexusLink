# 商業上架就緒度總表（Commercial Ship Readiness）

> Date: 2026-07-14
> HEAD: `main` / `bdcb4c4`（`docs: commercial ship readiness pack`）
> 本表整合商業上架計畫六階段執行結果；人類 gate 仍須 Owner 親自關閉。

---

## Phase 0 — Owner 決策 ✅

| 決策 | 結果 |
|------|------|
| Linkara 地圖 v1 | runtime 截圖已產且已追蹤：`output/map-pilots/linkara-moonlake-diorama-v1/runtime-atlas-390x844.png`、`output/map-pilots/linkara-moonlake-diorama-v1/runtime-moonlake-390x844.png`；**視覺鎖定待 Owner 審** |
| 測試載體五隻 | **元素精靈**（見 `docs/design/TEST_CARRIER_ROSTER_MEMO.md` §7.1）；實作另立 TASK_PACK + canon 擴充 |
| 音效來源 | **CC0 授權**；現行 **Web Audio 合成 SFX v1 已出貨**（見 Phase 2） |

## Phase 1 — 美術收尾 ✅（v1 範圍內）

| 項目 | 狀態 | 備註 |
|------|------|------|
| GAP-1 裂隙剪影 10/10 | ✅ | runtime 已接，失敗才 fallback 霧體 |
| 灰影貓 512 runtime | ✅ | 商業化計畫舊述「未完成」為 doc drift |
| 月湖可玩棲地 | ✅ | v1 唯一可玩棲地（設計接受範圍） |
| 六區近景棲地 | 🔜 post-v1 | GAP-3 優先序低 |
| 進化型態美術 | 🔜 post-v1 | 現為純文字/lore |
| 元素精靈改造 | 🔜 | 待 TASK_PACK |

## Phase 2 — 音效 TP-6 ✅（合成 v1）

- `audioManager.js`：BGM（`bgm_nexuslink.m4a`）+ 10 種 Web Audio 合成 SFX + `initUnlock` + 音量持久化
- 呼叫點已接：觸碰、心語、痕跡、對峙、主動微時刻
- **紅線驗證**：`soulTalkController.js` safety 回合靜音（`isSafetyTurn` gate）
- **CC0 錄音升級**：列為 v1.1 polish（`docs/design/TP6_AUDIO_SFX_SPEC.md` §3 選項 A）

## Phase 3 — Raphael 品質關 🟡

| 項目 | 結果 |
|------|------|
| Sealed holdout | **48/48**，hardGateOk **true**，quality flags **0** |
| Web release gate | **10/10**，`allAutomatedRequiredOk: true`（2026-07-14 重跑） |
| 人類盲評 | **not_run** — 表單：`docs/qa/RAPHAEL_BLIND_REVIEW_SHEET_2026-07-14.md` |
| 狀態文件 | TP-2 刷新完成（`docs/handoff/RAPHAEL_AI_STATUS.yaml` / `docs/handoff/RAPHAEL_AI_HANDOFF.md`） |

## Phase 4 — UI 商業打磨 🟡

- 自動 gate：390×844 responsive/accessibility probe 通過
- 反 AI-slop：`docs/production/ANTI_AI_SLOP_UX_GATE.md` 為審查標準；**Owner 真機視覺審**仍待執行
- 建議：用 `docs/testing/REAL_DEVICE_REGRESSION_MATRIX.md` N1–N10 一併完成 UI 審

## Phase 5 — QA 與安全 🟡

| 項目 | 狀態 |
|------|------|
| Web release gate | ✅ 10/10（2026-07-14） |
| i18n sc/jp | ✅ 252 keys × 4 語言零缺漏；驗證腳本 `docs/qa/verify_i18n_strings.mjs` |
| TP-4 doc drift | 已標記完成（佇列待更新） |
| Bugbot / Security | 見本輪 ledger；上架前建議對候選 commit 再跑一輪 |

## Phase 6 — 人類上架 gate 🔴（僅 Owner）

| Gate | 交付物 | 狀態 |
|------|--------|------|
| 真機矩陣 | `docs/testing/REAL_DEVICE_REGRESSION_MATRIX.md` | 待執行 |
| 3 人私測 | `docs/testing/PRIVATE_TEST_SCRIPT.md` | 待執行 |
| 法務/商店 | `docs/legal/PRIVACY_AND_STORE_COPY_DRAFT.md` | 草案待定稿 |
| Desktop ADR | `docs/architecture/ADR-001-DESKTOP-WRAPPER.md` | 草案待拍板 |
| Steam | — | 未開始 |

---

## 結論

**AI 可關的 gate 已基本關閉**（自動 QA、資產 runtime、對話 hard gate、音效 v1、文件除鏽）。**上架仍卡在 Owner 專屬六項**：地圖視覺鎖、真機、私測、法務、ADR、Steam。

下一個最高槓桿動作：**真機跑 `docs/testing/REAL_DEVICE_REGRESSION_MATRIX.md`（尤其鍵盤 v6 + 新地圖美術）**，同時填 `docs/qa/RAPHAEL_BLIND_REVIEW_SHEET_2026-07-14.md`。
