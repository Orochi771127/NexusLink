# R2_GAME_PILLARS.md — Nexus Link R2 四大玩法支柱與成功定義

> 來源：R2 Master Handoff v1.0 第 8、28 節 + 核心定位。
> 目標：確保 R2 不退化成普通電子寵物 / 聊天工具 / 心理 App / 純戰鬥 RPG。

---

## 核心標語

「這不是電子寵物，這是你的夥伴。」

R2 必須保留 Nexus Link 的核心差異：
- 夥伴有記憶
- 有邊界
- 有情緒反應
- 玩家的情緒會沉積成棲地痕跡

---

## 四大玩法支柱

1. **陪伴**
   - Soul Talk（情緒輸入與回應）
   - Companion Boundary（夥伴有接受/拒絕/防禦）
   - Habitat Trace（情緒具象化為環境痕跡）
   - Offline Return（離線後棲地仍有變化）

2. **探索**
   - 節點式小型地圖（非開放世界）
   - 事件池、敵人池、資源池
   - 與情緒沉積、進化條件、記憶回聲連動

3. **進化**
   - 不只是等級制
   - 條件包含：level + bond + trust + emotional emblem + battle experience + map event + habitat trace resonance + special ritual
   - 五階段（Baby → Child → Adult → Perfect → Ultimate）或四階段
   - 保留「關係」與「情緒棲地」特色

4. **戰鬥**
   - 第一版控制範圍：1v1、回合制、少量技能、防禦、共鳴技
   - 戰鬥結果影響 bond / trust / mood / energy
   - 必須與陪伴系統連動（trust 高 → 共鳴技更穩；mood 差 → 表現波動）

---

## 禁止退化方向

- 不可變成普通電子寵物（無腦順從、無邊界）
- 不可變成普通聊天工具（純對話、無狀態沉積、無痕跡）
- 不可變成純戰鬥刷圖遊戲（戰鬥必須服務陪伴與探索）
- 不可變成一般手遊數值農場（無記憶、無邊界、無情緒沉積）
- 不可變成失去美術靈魂的功能堆疊（必須維持 Cyber-Taoism 夜湖棲地與靈性 UI）

---

## R2 成功定義（不是「功能很多」）

R2 成功是：

- R2 可從 `/r2/` 開啟，R1 仍可從 `/` 開啟
- R2 無 console error
- localStorage key 正確（nexusLinkR2State:v1）
- Soul Talk 可用且能產生 emotionalMemory + habitatTrace
- 夥伴可選（3~5 隻）
- 主棲地可看、情緒可轉換為記憶與 trace
- Action Sheet 可互動且狀態敏感
- 有至少 1 條完整進化展示
- 有至少 1 個 Codex UI 原型
- 有簡化探索地圖 + 簡化戰鬥
- reload 後狀態保留
- 手機直式可用
- 視覺風格符合 Nexus Link（Cyber-Taoism、夜湖、玻璃 cyber、屬性色 accent）
- 完全沒有污染 R1

---

## 與其他文件的關係

- 詳細 UI 風格 → R2_VISUAL_BIBLE.md
- 夥伴與進化細節 → R2_COMPANION_BIBLE.md + R2_EVOLUTION_SYSTEM.md + R2_EMOTIONAL_ELEMENT_SYSTEM.md
- 陣營視覺語言 → R2_FACTION_BIBLE.md
- 戰鬥與探索範圍控制 → R2_SCOPE_V1.md
- 資產與 reference 規則 → R2_ASSET_PIPELINE_SPEC.md + R2_REFERENCE_ASSET_INDEX.md

---

*本文件為 R2 設計決策的最高層過濾器。任何功能若違反四大支柱或退化方向，應被砍掉或重構。*
