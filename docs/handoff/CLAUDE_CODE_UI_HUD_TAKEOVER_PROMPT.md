# Prompt To Paste Into Claude Code

請接手 Nexus Link 的 UI / HUD V2 化工作。請先不要直接寫 code，先讀文件、檢查目前 runtime，然後提交開工計畫給我確認。

目前工作區與基線：

- Repo：`C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink`
- Branch：`integrate/ui-v2-raphael-main`
- Baseline commit：`25b9944`
- 交接文件：`docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md`

請先讀：

1. `AGENTS.md`
2. `CLAUDE.md`
3. `ACCEPTANCE.md`
4. `NEXUS_LINK_MASTER_CANON_v3.1.md`
5. `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md`
6. 我接下來貼給你的 Nexus Link UI V2 設計文件與截圖

任務目標：

- 讓目前 runtime 的 HUD / UI 更接近 UI V2 設計。
- 特別處理：
  - 底部五個按鍵：探索、照顧、心核、成長、記憶的圖示語意與視覺一致性；
  - Home / HUD / Soul Talk / Settings 的比例與層級；
  - Moonlake Habitat / 月湖棲地資訊不要遮擋夥伴；
  - 設定頁保留音量控制，不要恢復右上角獨立喇叭按鈕；
  - 修正目前可見的 Traditional Chinese mojibake / 亂碼問題；
  - 避免頁面與夥伴狀態 modal 重疊。

硬限制：

- 不要引入 React、Vue、TypeScript、CSS framework、npm dependency、build step、後端、資料庫、LLM API。
- 不要改 Raphael 行為或安全策略。
- 不要改 `src/state/**`、`saveManager.js`、localStorage schema，除非你先提出 Groundwork 計畫並取得我同意。
- 不要新增、刪除、移動 `assets/**`，除非我明確批准。若需要新 icon 圖檔，先提出資產計畫，不要直接寫入。
- 不要加入 shop / FOMO / 紅點 / 日課壓力 / 普通 RPG 戰力升級 / 多夥伴隊伍。
- 不要 stage 或 commit 本地 QA 輸出 JSON：
  - `docs/qa/_live_playtest_gate_output.json`
  - `docs/qa/_nlu_smoke_output.json`
  - `docs/qa/_web_release_gate_output.json`

請先回報開工計畫，格式如下：

```text
Task name:
Layer:
Files touched:
Canon / Acceptance refs:
Risk:
Rollback:
Red-line check:
Non-goals:
Test plan:
```

我確認後，你再開始實作。完成後請先自我審查與測試，再回報：

- changed files
- 已修問題
- 未修問題
- 測試結果
- 是否建議 commit / push

必要測試至少包含：

- `node --check` for changed JS files
- `git diff --check`
- 若 touched onboarding/state-adjacent flow：`node docs/qa/state-onboarding-migration-cases.mjs`
- `python docs/qa/_run_web_release_gate.py`
- 390x844 mobile browser visual check
- desktop browser visual check
