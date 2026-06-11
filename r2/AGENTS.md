# AGENTS.md — Nexus Link 多 AI 協作規範

> 適用對象：Claude Fable 5、Claude Code、Codex、ChatGPT、Gemini、Grok 及所有參與本專案的 AI agent。
> 本檔與 `CLAUDE.md` 對齊。若兩者衝突，以 `CLAUDE.md` 為準（它是最高憲法）。

---

## 1. 專案定位

**Nexus Link / 心核連結**是一款情緒棲地型 AI 夥伴養成遊戲。

> 核心標語：「這不是電子寵物，這是你的夥伴。」

夥伴有情緒沉積、記憶痕跡、棲地狀態，**會用身體語言說不**，並因玩家行為而真實、部分不可逆地改變。
美學：Cyber-Taoism / 賽博道教。
禁止退化成：系統公告機 / 無腦順從的寵物 / 普通 RPG 打怪 / 純聊天室。

判斷準則：每個決定都問「**這讓夥伴更像一個有邊界的生命，還是更扁平？**」

---

## 2. 三條情感契約 + 七條安全紅線（最高優先，全 agent 共用）

詳見 `CLAUDE.md` 第 1、2 節。摘要：

**契約**：① 牠會記得你，但牠不屬於你。② 牠會靠近你，但不會吞掉你。③ 你能影響牠，但不能支配牠。

**紅線（節選最易踩的）**：
- 不做依賴偵測驅動的行為（`safeHarborMode` 只能由夥伴自身狀態驅動）。
- 裂變等高張力事件的修復必須確定可達、不可失敗，且不做無法挽回的壞結局。
- safetyShield 求助訊息不可變成 gameplay 獎勵。
- 不製造 FOMO / 紅點 / 打卡焦慮；留白是特性。

任何 agent 的產出（程式、美術、文案、規格）違反上述，一律退回。

---

## 3. 技術邊界

允許：HTML / 純 CSS（`styles.css`）/ Vanilla JS（ES Modules，無 build step）/ PixiJS v8（CDN）/ localStorage（集中於 `saveManager.js`，key=`nexusLinkR2State:v1`）/ GitHub Pages。

絕對禁止：React、Vue、Svelte、TypeScript、CSS 框架、後端、資料庫、LLM API、npm 套件（除非 human 確認）、任何 build step。

---

## 4. AI 分工

| AI | 主要職責 |
|----|---------|
| **Claude Fable 5 / Claude Code** | 體驗層大型實作、戰鬥情緒對峙改造、Soul Talk 升級、UI、自動測試、產生 diff |
| **Codex / ChatGPT** | 架構審查、規格收斂、避免技術債、TASK_PACK 拆解 |
| **ChatGPT image generation** | 角色概念圖、sprite sheet 初稿 |
| **Gemini** | 看圖 / 看截圖 review，找 UI / 資產問題（不改 runtime code） |
| **Grok** | Codex / Fable 沒額度時的備援 |

分工原則：
- 圖像生成輸出的資產需經 human 確認後才能進 `assets/`。
- Gemini 只做視覺 review，不改 runtime code。
- Spine 動畫僅後期高階選項，非 MVP 主線。

---

## 5. 修改授權分級（與 CLAUDE.md 第 5 節一致）

### 5.1 地基層（GROUNDWORK）— 嚴格保守，逐項確認
`index.html`、`saveManager.js`、`store.js` 的 `normalizeState`、`defaultState.js`、`pixiApp.js`、`assets/**`、`tools/**`、`scripts/**`。
修改前：讀取 → 列計畫 → 等 human 確認 → 最小必要 → 列 changed files → 給測試法。

### 5.2 體驗層（EXPERIENCE）— 授權連續施工
戰鬥改造、Soul Talk 升級、邊界/人格深化、星圖填充、記憶/痕跡表現、圖鑑/切換/行動、VFX polish。
這些檔案被授權做有設計野心的重構，不需逐檔拆成獨立確認。

### 5.3 開工協定（A 檔）
體驗層每個 TASK_PACK **開工前回報計畫等 human 點頭**，點頭後可在該包範圍內連續施工到完成，完成後對照 `ACCEPTANCE.md` 自評。
> 地基逐項問；體驗層問一次（開工計畫），然後一路做完。

---

## 6. 任務執行規則

### 每個 TASK_PACK 開工前明列
```
Task name:        <任務名稱>
Layer:            GROUNDWORK / EXPERIENCE（標明是否觸及地基）
Files touched:    <預期改的檔案；觸及 5.1 者單獨標出>
Red-line check:   <若觸及 battleEngine / safeHarborMode / 安全相關，逐條聲明不違反紅線>
Non-goals:        <本次不做的事>
Acceptance refs:  <對應 ACCEPTANCE.md 的哪幾條>
```

### 嚴格禁止
- 未經 human 明確指示，不可 `git commit` / `git push`。
- 自行擴張任務範圍（「順便重構地基」「順便改 saveManager」）。
- 在未獲授權的地基檔案中寫入。
- 引入任何新外部依賴。
- 繞過紅線達成需求——遇衝突即停、回報。

---

## 7. 角色狀態 Tier

| Tier | 角色 | ID | 規則 |
|------|------|-----|------|
| 1 Active Runtime | 灰影貓 | `greyshade-cat` | 唯一 runtime 主夥伴，P1 主線 |
| 2 Legacy/Fallback | 焰尾狐 | `flametail-fox` | 僅靜態圖，不可擅自升級 |
| 3 Roadmap | 雷霆幼狼 / 星能小山豬 | `thunder-pup` / `star-energy-boarlet` | 不可進 runtime，不可觸發多角色隊伍 |

圖鑑中的水晶海馬 / 青葉麋鹿為既有 placeholder 展示資料，不可升級為 runtime 主夥伴。

---

## 8. 高風險與廢棄檔案

### 高風險（地基，未確認不得改）
`index.html` ・ `src/pixi/pixiApp.js` ・ `src/state/saveManager.js` ・ `src/state/store.js` ・ `assets/**` ・ `tools/**` ・ `scripts/**`

### 廢棄但 LOCKED（保留勿刪）
`main.js`（早期 prototype）・ `style.css`（舊 CSS）・ `script.js`（CI `node --check` stub）。
**刪除 `script.js` 會破壞 static check gate。三者一律不刪不改。**

---

## 9. 指定改造項警語

- **`battleEngine.js` / `battleController.js`**：需體質改造為情緒對峙（穩定心核 / 建立邊界 / 回收記憶），非 HP 歸零；觸及 `index.html` battle-modal 結構時需分開確認。
- **`safeHarborMode.js` / `emotionalSedimentationEngine.js` / `safetyShieldDictionary.js`**：安全層核心，修改前重讀紅線並逐條聲明合規。

---

## 10. 參考文件

- `CLAUDE.md` — 最高憲法（先讀）。
- `ACCEPTANCE.md` — 契約 → 可驗收 assertion 對照表。
- `docs/agent/AI_WORKFLOW.md` — Gate 流程。
- `docs/agent/TASK_TEMPLATE.md` — 任務模板。
- `docs/testing/MANUAL_TEST_CHECKLIST.md` — 手動測試清單。
