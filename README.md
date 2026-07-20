# Nexus Link / 心核連結

> **這不是電子寵物，這是你的夥伴。**  
> A mobile-first emotional habitat game about memory, boundaries, and a relationship that changes through shared experience.

[開啟 GitHub Pages 預覽](https://orochi771127.github.io/NexusLink/)

> [!IMPORTANT]
> Nexus Link 目前是**商業化前垂直切片（pre-commercial vertical slice）**。自動化驗證已建立，但獨立真人測試、必要實機矩陣、隱私與法務審查尚未完成，因此目前不代表正式公開發行版本。

---

## 專案簡介

**Nexus Link／心核連結**是一款以 Web 為優先、針對手機直式體驗設計的敘事情緒棲地遊戲。

玩家會與一位具有記憶、情緒、身體語言與個體邊界的「心核夥伴」建立關係。牠會記得你如何靠近、如何離開，以及你如何回來；你的互動會透過對話、動作、棲地痕跡與關係狀態留下後果。

玩家可以影響夥伴，但不能支配牠。高羈絆不會取消牠拒絕、沉默或保持距離的能力。

```text
初次進入
→ 建立本機身分
→ 心核引導
→ 初遇定情
→ 第一次觸碰與心語
→ 留下棲地痕跡
→ 探索月湖
→ 離開後再次返回
→ 看見關係留下的回聲
```

---

## 核心體驗

| 系統 | 玩家體驗 |
|---|---|
| **Initial Bond／初遇定情** | 新玩家從灰影貓、焰尾小狐、晶鰭小海馬中選擇一位初始夥伴。選擇代表一段關係的開始，不是角色收集選單。 |
| **Soul Talk／心語** | 玩家輸入自己的感受，夥伴依意圖、情緒、記憶、人格與邊界給出回應。 |
| **Boundary-aware Interaction／邊界互動** | 觸碰可能得到接受、保留接受、猶豫或拒絕；重複越界會改變夥伴的反應。 |
| **Habitat Traces／棲地痕跡** | 情緒與共同經歷會在月湖棲地留下可見痕跡，而不是只存在於聊天紀錄。 |
| **Return Echo／回歸回聲** | 玩家離開後再次回來，夥伴會依離開時間與先前經歷給出不帶罪惡感的回應。 |
| **Relationship Growth／關係成長** | 每位夥伴擁有獨立的持久關係與成長狀態，不共享同一份羈絆數值。 |
| **Emotional Standoff／穩住裂隙** | 衝突被設計成關係修復與情緒調節，而不是傳統 HP 歸零戰鬥。 |

遠征（Expedition）目前仍屬實驗性原型，只完成部分心核橋接，不代表正式商業主玩法。

---

## RaphaelCore：本地心核認知層

目前的心語系統由 **RaphaelCore** 驅動。它是本地、可測試、規則式的夥伴認知管線，不會在執行時呼叫外部大型語言模型。

```text
玩家輸入
→ 安全檢查
→ 意圖與情緒理解
→ 人格、記憶與邊界判斷
→ 回應與動作規劃
→ 評估與合法狀態更新
→ 對話、動畫與棲地痕跡
```

RaphaelCore 負責：

- 安全與高風險輸入處理
- 意圖與情緒辨識
- 夥伴人格與拒絕邏輯
- 記憶召回與寫入政策
- 回應策略、動作與動畫提示
- 關係狀態與棲地痕跡更新

目前執行環境**沒有外部 LLM、後端、資料庫或雲端 API**。未來即使加入語言模型，也只能作為可選的文字表達層，不能覆寫 RaphaelCore 的安全、記憶、人格或邊界決策。

---

## 現行版本包含

- Mobile-first Web 介面
- 月湖棲地與動態光影、天候效果
- Explore／探索、Care／照顧、Growth／成長、Memory／記憶四個主要頁面
- 多位具動畫資產的心核夥伴
- 初遇定情三選一流程
- 觸碰、疲勞、拒絕與關係修復
- 心語對話、情緒記憶與棲地痕跡
- 離線恢復與回歸回聲
- 每位夥伴獨立的持久關係狀態
- 世界圖鑑、棲地切換與章節／共鳴系統基礎
- 實驗性遠征原型

目前開發重點不是繼續堆疊功能，而是讓第一次進入、第一次相遇、第一次探索與第一次返回形成完整且安全的體驗。

---

## 技術架構

| 層級 | 技術 |
|---|---|
| 介面 | HTML、CSS、Vanilla JavaScript、ES Modules |
| 遊戲渲染 | PixiJS 8.8.1（CDN） |
| 狀態與存檔 | localStorage，主鍵 `nexusLinkR2State:v1` |
| 夥伴認知 | RaphaelCore，本地 deterministic pipeline |
| 部署 | GitHub Pages |
| 建置流程 | 無 npm、無 bundler、無 build step |
| 後端 | 目前沒有 |

### Runtime 分層

```text
index.html
└─ src/app.js
   ├─ src/state/       狀態、存檔與 migration
   ├─ src/engine/      遊戲規則與狀態推導
   ├─ src/ai/          RaphaelCore 與對話政策
   ├─ src/pixi/        場景、角色、動畫與特效
   ├─ src/ui/          DOM controller 與玩家輸入
   ├─ src/data/        角色、棲地、章節與內容資料
   ├─ src/expedition/  遠征實驗性原型
   ├─ src/audio/       BGM 與音效
   ├─ src/i18n/        多語系
   └─ src/utils/       EventBus、DOM、時間與通用工具
```

分層原則：規則層不直接操作 DOM 或 Pixi；渲染層不直接寫入存檔；所有持久狀態由 state/store 路徑管理。

---

## 在本機執行

本專案不需要安裝 npm 套件。使用任一靜態檔案伺服器即可。

```bash
python3 -m http.server 5173
```

若系統使用 `python` 指令：

```bash
python -m http.server 5173
```

開啟：

```text
http://localhost:5173
```

直接以 `file://` 開啟可能因 ES Modules 與瀏覽器安全限制而失敗，因此建議使用本機 HTTP server。

---

## 產品原則

Nexus Link 的設計受三條情感契約約束：

1. **牠會記得你，但牠不屬於你。**
2. **牠會靠近你，但不會吞掉你。**
3. **你能影響牠，但不能支配牠。**

因此，本專案不以以下機制作為核心：

- 抽卡、稀有度與角色換皮商城
- 連續登入、紅點、倒數與 FOMO 壓力
- 無條件服從或永遠迎合玩家的 AI
- 把角色當作可任意替換的戰力單位
- 把心語包裝成心理治療、診斷或危機服務
- 傳統刷裝、輸出排行與 HP 歸零式主循環

---

## 開發狀態與限制

- 專案目前仍是商業化前垂直切片。
- 自動化 release gate、狀態 migration、對話政策、邊界、安全與瀏覽器流程已有測試覆蓋。
- 獨立真人盲測、必要手機／瀏覽器實機矩陣、隱私與法務審查仍待完成。
- 玩家資料目前保存在單一裝置的 localStorage，沒有帳號、雲端同步或跨裝置備份。
- RaphaelCore 目前是規則式本地系統，不是生成式雲端 AI。
- 媒體與部署體積仍需要在商業發行前持續最佳化。

最新的機器可讀狀態與驗證結果請以 [`docs/handoff/RAPHAEL_AI_STATUS.yaml`](docs/handoff/RAPHAEL_AI_STATUS.yaml) 為準，不在 README 固定複製容易過期的測試數字。

---

## 重要文件

| 文件 | 用途 |
|---|---|
| [`docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`](docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md) | 產品定位、商業方向與不可違反的核心原則 |
| [`CLAUDE.md`](CLAUDE.md) | AI 協作與施工憲法 |
| [`AGENTS.md`](AGENTS.md) | 多代理協作規範 |
| [`ACCEPTANCE.md`](ACCEPTANCE.md) | 功能與體驗驗收標準 |
| [`docs/architecture/RUNTIME_MAP.md`](docs/architecture/RUNTIME_MAP.md) | 現行 Runtime 架構地圖 |
| [`docs/architecture/RAPHAEL_CORE_JS_V1.md`](docs/architecture/RAPHAEL_CORE_JS_V1.md) | RaphaelCore 架構與資料流 |
| [`docs/handoff/RAPHAEL_AI_STATUS.yaml`](docs/handoff/RAPHAEL_AI_STATUS.yaml) | 現行能力、測試與尚未完成的 launch gates |
| [`docs/agent/AI_EXECUTION_LEDGER.md`](docs/agent/AI_EXECUTION_LEDGER.md) | 跨代理實際完成工作紀錄 |

歷史設計 Bible 已移至 `docs/legacy-bible/`，只作歷史參考；現行實作應以目前程式碼、Master Canon、施工憲法與驗收文件為準。

---

## 開發判斷標準

每一項功能都必須回答：

> **它是否讓夥伴更像一個具有記憶、邊界與自身意志的生命？**

若答案是否定的，就不應擴張現行核心 Runtime。
