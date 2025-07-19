# 1. 專案高級概述
- 專案名稱: Nexus Link (心核連結)
- 類型: 2D 像素風怪獸養成 RPG，以手機端 (Mobile-First) 為主要平台。
- 核心願景: 打造一個具備情感與智慧的 AI 夥伴，讓玩家體驗「共構命運」的感覺。
- MVP 階段核心目標: 專注於「焰尾狐 (Flametail Fox)」，完成核心垂直切片。

# 2. 核心技術棧
- 遊戲引擎: Unity 6 (LTS 版本 2022.3.x)
- 程式語言: C# 11
- 數據格式: JSON 用於存檔與後端通訊。
- AI 詠唱辨識: 採用 Unity Sentis 引擎。

# 3. 關鍵架構與設計模式
- 網路架構: 客戶端-伺服器模型，戰鬥邏輯在後端處理 (MVP本地模擬)。
- 數據管理: 核心靜態數據必須使用 ScriptableObjects 管理。
- 檔案結構: C# 腳本存放於 `Assets/_Project/Scripts/` 下，並依職責劃分子資料夾。
- 命名規範: 類別使用大駝峰命名法 (PascalCase)，私有欄位使用 `_privateField`。

# 4. 核心玩法機制
- AI 夥伴: 核心是 Raphael 模擬心智 AI，受情感向量 (JoySorrow, FearCourage, BondAffinity) 驅動。
- 戰鬥系統: 採用「RPS-反應式戰鬥」融合「十屬性（五行+五能）」的雙層模型。
- 進化系統 (MVP): 初始進化流程為 Nexus Core -> 焰尾狐 (火系)。
- 共鳴怒吼: 遊戲的「熱血逆轉」終極技能。

# 5. AI 產出內容規範
- 遊戲內 AI 人格: Raphael 的對話風格必須「溫和深沉、擅長以哲學性反問引導思考」。
- 美術風格提示詞範本: 應包含 `pixel art, 16-bit, vibrant colors, retro RPG style`。
- 對開發者的指導風格: 所有 Unity 實作步驟，除了程式碼，還必須包含 Inspector 視窗中的詳細設定指南。
