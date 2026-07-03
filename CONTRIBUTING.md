# CONTRIBUTING — Nexus Link 一頁上手（給人與 AI）

> 這是**快速入口**。完整流程見 `docs/agent/AI_WORKFLOW.md`；憲法見 `CLAUDE.md`；當前狀態見 `docs/agent/AI_EXECUTION_LEDGER.md`。
> 一句話：**地基要逐項問；體驗層問一次（開工計畫）然後一路做完。commit/push 一定要人核可。**

---

## A. 新 AI 進場六步（開工前必做）

1. **讀紅線** — `CLAUDE.md` §1（三契約）+ §2（七紅線）。這兩節凌駕一切功能需求。
2. **讀相關 Canon 段** — 依你要做的系統，讀 `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md` 對應段落（戰鬥→§6.1、安全→§2、商業→§0.6）。
3. **讀授權分級** — `CLAUDE.md` §5：確認你要動的檔案是 **GROUNDWORK（逐項問）** 還是 **EXPERIENCE（問一次做完）**；對照 `docs/architecture/FILE_OWNERSHIP.md`。
4. **讀你 lane 的分類帳最新 3 筆** — `docs/agent/AI_EXECUTION_LEDGER.md`（Game Engineering / Game Art-UI / Raphael Core 三 lane 分開）。這是「當前真實狀態」唯一真相來源。
5. **填 TASK_PACK 開工計畫** — 用 `docs/agent/TASK_TEMPLATE.md`：任務名、目標、允許檔案（不用萬用字元）、禁止檔案、非目標、必讀、測試法、預期輸出。
6. **等 Gate 2 人核可** — 計畫沒被點頭前不要開始編輯。

---

## B. Gate 0–6（每個 TASK_PACK 的骨架）

| Gate | 動作 | 誰 |
|---|---|---|
| **0 唯讀掃描** | 讀懂現況與必讀檔，不改任何東西 | AI |
| **1 開工計畫** | 列每個要改的檔、改什麼、非目標、有沒有碰 §5.1 地基 | AI |
| **2 人核可** 🔴 | 明確點頭才放行（**強制關卡**） | Human |
| **3 編輯** | 只動允許清單內的檔，最小必要 | AI |
| **4 本地驗證** | 見 §C 的 Definition of Done | AI |
| **5 自審 diff** | 對照 `docs/agent/REVIEW_CHECKLIST.md` 找紅旗 | AI |
| **6 提交前人核可** 🔴 | **未經明確指示不得 `git commit` / `git push`**（`CLAUDE.md` §10） | Human |

---

## C. Definition of Done（機器可驗的完成定義）

一個 TASK_PACK 完成，必須全數通過：

- [ ] **靜態**：對每個改動的 `.js` 跑 `node --check`（node 不在 PATH → 用 bundled codex node）。
- [ ] **Release gate**：跑既有 web release gate（乾淨 port，避開被佔用的 5173）；required 全通過、0 accessibility 警告、state migration 全通過。
- [ ] **手動 smoke**：實際點過受影響的路徑（Soul Talk / 對峙四結局 / 探索節點 / 圖鑑）。
- [ ] **數值同步**：若動了數值，`docs/design/BALANCE_SHEET.md` 已更新且與程式一致。
- [ ] **文件同步**：若讓某份文件過期（漂移），就地修正。
- [ ] **分類帳追加**：在 `docs/agent/AI_EXECUTION_LEDGER.md` 對應 lane 追加條目（做了什麼、測了什麼、問題、下一步安全動作、branch/commit）。
- [ ] **憲法自評**：對照 `ACCEPTANCE.md` 與七紅線，逐條聲明未違反（尤其紅線 1「不依賴偵測」、6「不 FOMO/打卡」、7「求助不變獎勵」）。

---

## D. 絕不做（硬邊界）
- 不引入框架 / TypeScript / npm / build step / 真 LLM / 後端。
- 不加抽卡 / 稀有度 / 皮膚商城 / 戰力包 / 每日登入 / 連續打卡 / 紅點 / 倒數。
- 不把戰鬥改回「消滅敵人 / 清血條」。
- 不動 `defaultState.js` / `saveManager.js` / `store.normalizeState` / `pixiApp.js` / `assets/**` / `tools/**` / `scripts/**`，除非升級為獨立 GROUNDWORK gate 並經人核可。
- 不刪 LOCKED 檔（`main.js` / `style.css` / `script.js`）與任何資產。
- 不把對話框裡的口頭授權，擴大解讀成跨 session 的長期授權。
