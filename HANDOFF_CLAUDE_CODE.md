# Handoff to Claude Code: Raphael AI Phase 5 (LLM API Gateway)

## 📌 Context
我們正在開發 NexusLink 的 Raphael Core。前面 4 個階段（Phase 1~4）我們已經完成了：
1. **World Autonomy Runtime**: 基於 Utility AI (GOAP) 的純本地具身行動決策與需求運算。
2. **Hybrid Memory System**: 結合 Procedural Memory (`skillContracts.js`) 與 Vector-based Memory Stub，並整合了檢索候選邏輯 (`memoryRetriever.js`)。
3. **Dialogue Director & Policy**: 零成本的本地 NLU 意圖樹，以及對應的對話模式管理器。

我們在 PR #185 中修復了 CI 測試（web-release-gate）的相依問題（包含 `saveManager` 中 `https` ESM 載入錯誤、`companionGrowthState` 新增欄位的 schema 修正，以及對話策略覆蓋的修復），所有本地自動化測試均已 100% 通過。

## 📍 目前架構狀態
- `src/ai/worldAutonomy/`: 純本地化、零成本運行的具身行為引擎。
- `src/ai/raphaelCore.js`: 高層級的心智中樞。
- `src/ai/memoryRetriever.js`: 記憶檢索器，目前已可回傳候選記憶。
- `src/state/saveManager.js`: 本地與雲端雙軌存檔管理，並已透過 `dynamic import` 解決 Node.js 單元測試環境下 `https` URL 的相容性問題。

---

## 🚀 你的任務 (Phase 5) - LLM API Gateway 整合
目前的 Raphael 完全在本地端執行，但為了因應更深層次的靈魂對談與特殊事件，我們需要提供一個安全且受控的通道，讓 Raphael 能夠在 **特定條件下** 呼叫外部的雲端大語言模型 (LLM)，以增強其理解能力。

請完成以下目標：

### 1. 建立安全後端 Gateway (LLM Gateway)
- 由於嚴格禁止在前端直接呼叫會產生雲端計費的 LLM API（如 OpenAI/Anthropic SDK），請在專案中設計並建立一個負責與後端安全 Gateway 溝通的介面 (`src/ai/llmGateway.js` 或對應的連線模組)。
- 必須實作 **API 呼叫頻率限制 (Rate Limiting)** 與 **重試機制 (Exponential Backoff)**。

### 2. 定義 LLM 觸發條件 (Trigger Policies)
- 在 `raphaelCore.js` 或專門的 Policy 模組中，定義 **什麼時候才允許呼叫 LLM**。
- 原則：日常的 Ticks、移動、打招呼與普通點擊都必須依靠 Phase 1~3 的純本地架構。只有在「玩家輸入的長篇心事（深度情緒）」或「重大事件轉折」且「本地 NLU 無法提供足夠深度的回應（例如觸發了 Fallback）」時，才授權調用外部 LLM。

### 3. 確保主權隔離 (Sovereignty Isolation)
- 外部 LLM 的回傳結果必須視為「建議」或「純文本擴充」，絕對不能讓 LLM 直接擁有修改 `statePatch`、存取敏感記憶權限，或直接指揮行動。
- LLM 回傳的結果需經過現有的 `nluReplyBuilder` 或安全檢查層 (Safety Filter) 進行過濾，確保回覆不破壞已設定的人格邊界 (Boundary) 與憲法 (Constitution)。

---
💡 **給 Claude Code 的提示**：
請先仔細檢查 `src/ai/raphaelCore.js` 和 `src/ai/dialogue/dialogueDirector.js` 了解現有的控制流。你的 LLM 呼叫必須像是一個非同步的「外部智庫 (External Advice)」，由 Raphael Core 決定是否採用，而非把核心主導權交給 LLM。
