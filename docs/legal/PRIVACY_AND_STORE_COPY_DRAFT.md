# 隱私聲明與商店文案草案（Privacy & Store Copy Draft）

> Status: **DRAFT（草案，法務判斷與最終文字由 Owner 定案）**
> Date: 2026-07-14
> Author: Claude Fable 5（起草）
> 依據：憲法禁後端/帳號/資料庫 → 本產品**不收集任何個人資料**，隱私聲明極輕；但 AI 生成內容揭露與「非醫療」聲明必須到位。

---

## 1. 隱私聲明（Privacy Policy 草稿）

### Nexus Link 隱私聲明

**我們不收集你的資料。**

- Nexus Link 是完全離線運作的單機遊戲。沒有帳號系統、沒有伺服器、沒有資料庫。
- 你的遊戲進度、與夥伴的對話、情緒記憶，全部只儲存在**你自己的裝置**上（瀏覽器 localStorage / 桌面版本地儲存區）。
- 我們無法讀取、也從未傳輸你輸入的任何文字。夥伴的回應由裝置上的本地規則引擎產生，**不使用雲端 AI 服務**，你的心語不會離開你的裝置。
- 遊戲不含廣告、不含追蹤器、不含分析 SDK。
- 刪除遊戲（或清除瀏覽器資料）即永久刪除所有遊戲資料；我們沒有任何副本。

（桌面版補充，待 wrapper 存檔策略定案：若啟用 Steam Cloud 存檔備份，存檔檔案經 Steam 帳號同步，適用 Valve 的隱私政策；遊戲本身仍不傳輸任何資料。）

### 重要聲明：這不是醫療或心理治療服務

Nexus Link 的夥伴對話是**遊戲中的陪伴體驗**，不是心理治療、諮商、診斷或危機處理服務。如果你正處於困難之中，遊戲會引導你尋求現實世界的協助資源。緊急情況請聯繫當地的緊急服務或心理支持專線。

## 2. AI 生成內容揭露（Steam AI Disclosure 草稿）

Steam 上架表單要求揭露 AI 內容（pre-generated / live-generated 兩欄）。建議填寫：

**Pre-Generated AI content：**

> Some 2D art assets in this game (character animation sheets, map scenes, and enemy silhouettes) were created with the assistance of image-generation AI tools, then curated, quality-checked, and integrated by the developer. All AI-assisted assets went through human review and approval before inclusion.

**Live-Generated AI content：**

> None. The companion's dialogue is produced by a deterministic, hand-authored local rules engine that runs entirely on the player's device. The game does not call any AI service at runtime, does not train on player input, and does not send player text anywhere.

> ⚠️ 注意：這一欄**如實填 None** 是重要賣點也是合規重點——RaphaelCore 是本地規則引擎，非 LLM。不要因為行銷想蹭「AI 夥伴」而把 live-generated 勾成 Yes，那會觸發 Valve 對 live AI 內容的額外審查（且與事實不符）。

## 3. 商店頁文案（Store Page Copy 草稿）

### 短描述（~300 字元）

> 牠會記得你，但牠不屬於你。Nexus Link 是一場安靜的陪伴旅程：與一隻心核夥伴相遇、穿過七個章節的裂隙與情緒，學會靠近而不吞噬、影響而不支配。沒有戰力數值、沒有每日任務、沒有情緒勒索——只有一段誠實的關係。

### 關於這款遊戲（About This Game）

**三個承諾（也是三條設計契約）**

- **牠會記得你，但牠不屬於你。** 夥伴會累積與你相處的記憶與痕跡，這些痕跡不可被一鍵抹除——因為關係本來就不能重來。
- **牠會靠近你，但不會吞掉你。** 牠有自己的疲勞、防備與心情。牠敢對你說不，也敢無聊。離開一陣子再回來，牠不會責備你。
- **你能影響牠，但不能支配牠。** 沒有強制按鈕。信任只能在互動中累積，牠願不願意同行，由牠決定。

**遊戲內容**

- 七章旅程：七個區域、七種情緒心相，每章與一位新的心核夥伴相遇
- 裂隙對峙：不是打倒敵人，而是穩住卡在裂隙裡的情緒——穩住、設界、共鳴、退一步
- 共鳴圈：關係到了，牠會自己走過來。最多三隻夥伴同場，彼此都是主體，不是隊伍數值
- 心語（Soul Talk）：完全離線的本地對話引擎，你說的話不會離開你的裝置

**我們刻意不做的事**

沒有抽卡、沒有稀有度、沒有戰力數值、沒有每日登入、沒有紅點、沒有倒數、沒有 FOMO。安全求助永遠導向現實資源，永遠不是遊戲獎勵。

### 標籤建議

`Emotional` `Relaxing` `Story Rich` `Cute` `Singleplayer` `2D` `Casual` `Atmospheric`

## 4. 上架前法務檢查清單（Owner 逐項簽核）

- [ ] 隱私聲明最終文字（含桌面版存檔備份補充）
- [ ] AI 內容揭露兩欄如實填寫（pre-generated: Yes with description / live-generated: None）
- [ ] 「非醫療/非治療」聲明出現在：商店頁、遊戲內安全轉導文案附近、EULA（若有）
- [ ] 素材授權盤點：所有 AI 生成資產的生成工具條款允許商用；字型授權；音效授權（TP-6 引入時逐檔記錄）
- [ ] 年齡分級問卷（無暴力/賭博/裸露；有情緒主題文字）
- [ ] 退款政策沿用 Steam 標準；DLC 說明不得暗示「不買會被夥伴冷落」（契約二）
- [ ] 各地區定價與稅務（人類專屬）

## 5. 交付形式

Owner 定稿後：隱私聲明放遊戲內（設定頁連結）＋商店頁；可用 pdf skill 產出可交付 PDF 版本供存檔。
