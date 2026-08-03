# Handoff to Claude Code: Raphael Embodied Autonomy v1 (Phase 2)

## 📌 Context
我們正在升級 Raphael Core，目標是達成 **「零伺服器 API 成本」** 且 **「保留夥伴生命感」**。
在 Phase 1 階段，Antigravity 已經建立了基於 Utility AI 的 **World Autonomy Runtime**。這套系統目前完全在本地端高效運行，不消耗 LLM 預算。

## 📍 目前架構狀態 (Phase 1 完成)
- 我們已經在 `src/ai/worldAutonomy/` 建立了一整套確定性行為系統（包含 `utilityScorer.js`, `worldGoalManager.js`, `worldActionExecutor.js` 等）。
- Raphael 已經能根據自身的 Needs (Energy, Hunger 等) 計算 Drives，並自主發出移動、休息或探索的 `statePatch` 意圖。

---

## 🚀 你的任務 (Phase 2) - 零成本動態台詞與本地語意擴充
請基於目前的 `worldAutonomy` 架構，接手完成以下兩件事。
**⚠️ 嚴格限制：絕對禁止引入或呼叫任何會產生雲端計費的 LLM API (如 OpenAI/Anthropic SDK)。**

### 1. 實作狀態機台詞系統 (Bark System)
- 請建立 `src/ai/worldAutonomy/worldBarkSystem.js`。
- 在 `worldActionExecutor.js` 決定發射具身行動 (例如 `eat_available_food`) 時，攔截這個動作並呼叫 Bark System。
- 根據 Raphael 當前的 Drives (飢餓度、疲勞度) 與 Context，從本地預設的台詞庫中隨機挑選一句符合情境的短句（例如：「終於有東西吃了...」）。
- 將這句短句打包進 `statePatch`，讓遊戲前端可以直接渲染出對話泡泡。

### 2. 強化本地 NLU 意圖樹 (Local Intent Rules)
- 檢視現有的 NLU 機制（如 `intentClassifier.js` 或 `nluReplyBuilder.js`）。
- 擴充一套「純腳本式」的關鍵字與意圖匹配矩陣。如果玩家輸入特定文字（如「累」、「想休息」），系統必須能在完全不呼叫外部 LLM 的情況下，拼湊出帶有同理心的回應模板，並結合他目前的 `worldObservation` 來做出回答。

---
💡 **給 Claude Code 的提示**：
請先仔細閱讀 `src/ai/worldAutonomy/` 下的所有檔案以理解目前的 Utility AI 架構，確保你新增的 Bark System 能完美融入 `worldAutonomyLoop.js` 中。能力擴充的同時，絕對不要破壞主權隔離！
