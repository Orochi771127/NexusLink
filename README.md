# Nexus Link / 心核連結

> 關係，決定進化。  
> A relationship-driven AI companion game where your bond shapes a living creature.

---

## 1. Project Overview

**Nexus Link（心核連結）** 是一款以 **AI 夥伴、像素怪獸養成、關係進化** 為核心的 Web-Based AI Companion Game。

玩家將與一隻專屬 AI 小怪獸共同生活、對話、互動，並透過彼此之間的關係，影響牠的性格、狀態、行為與進化方向。

本專案第一階段不以傳統大型 RPG 為目標，而是先完成一個可上線的垂直切片：

- 一個可互動的像素場景
- 一隻主角 AI 夥伴
- 一套基礎對話系統
- 一組關係數值
- 一條可感知的成長與進化路徑

---

## 2. Core Vision

Nexus Link 的核心不是「AI 很聰明」，也不是「怪獸很漂亮」。

真正核心是：

> 每個玩家都會養出一隻，因為「他們的關係」而變得獨一無二的 AI 怪獸。

玩家不是單純餵養怪獸，也不是單純跟聊天機器人說話，而是在經歷一段會留下痕跡的關係。

---

## 3. Product Positioning

### Surface Product

第一階段的 Nexus Link 是：

> 一款會記住你、會回應你、會慢慢改變的 AI 夥伴養成遊戲。

### Long-Term Vision

未來深層版本會逐步發展成：

> 一個讓人練習理解、尊重邊界、建立關係的情感系統。

但 MVP 階段必須先專注於一件事：

> 讓玩家願意每天打開，看看自己的 AI 夥伴今天變得如何。

---

## 4. Current MVP Direction

### MVP Goal

完成一個可在瀏覽器執行的 Web MVP。

核心內容包含：

- 單一主場景
- 單一 AI 夥伴
- 基礎聊天互動
- Bond / Trust / Mood / Energy 數值
- 簡單記憶系統
- 初步進化條件
- 可收合式 UI
- 手機優先的直立式介面

---

## 5. Target Platform

### Primary

- Web Browser
- Mobile-first layout
- 9:16 vertical screen experience

### Future Expansion

- iOS / Android App
- PWA
- Social sharing
- Friend companion visits
- Light battle or sparring system

---

## 6. Core Gameplay Loop

```text
Player Interaction
→ AI Response
→ Mood / Energy Change
→ Bond / Trust Change
→ Memory / Event Update
→ Growth / Evolution Progress
→ New Interaction
```

簡化版：

```text
互動 → 情緒 → 關係 → 記憶 → 進化
```

玩家每一次互動都可能影響 AI 夥伴的狀態。  
當長期互動累積後，角色會逐漸形成不同的性格與進化方向。

---

## 7. Core Product Sentence

> This is not a virtual pet.  
> This is your companion, shaped by your relationship.

中文版本：

> 這不是電子寵物。  
> 這是會因為你們的關係而改變的 AI 夥伴。

---

## 8. Technical Stack

目前專案方向已從 Unity 改為 Web-Based 原型優先。

### Frontend

- HTML
- CSS
- JavaScript / TypeScript
- PixiJS
- Canvas-based 2D rendering
- Mobile-first responsive UI

### Backend

- Node.js
- Express
- SQLite

### AI Layer

- Cloud LLM API
- Structured JSON response protocol
- Rule-based state update
- Memory tagging system

### Data

- JSON for frontend/backend communication
- SQLite for persistent state and structured memory

---

## 9. Architecture Overview

Nexus Link 採用三層架構：

```text
Frontend Scene Layer
    ↓
Backend State Layer
    ↓
AI Response Layer
```

### 9.1 Frontend Scene Layer

負責：

- 像素場景渲染
- 角色動畫播放
- UI 顯示
- 玩家輸入
- 狀態視覺化

### 9.2 Backend State Layer

負責：

- 玩家資料
- 角色狀態
- Bond / Trust / Mood / Energy 計算
- SpamScore 判定
- 記憶寫入規則
- 事件觸發條件

### 9.3 AI Response Layer

負責：

- 根據目前狀態生成回應
- 維持角色語氣
- 輸出結構化 JSON
- 提議記憶標籤
- 提供動畫與情緒提示

---

## 10. Core Variables

MVP 階段保留四個核心變數。

### Bond

代表羈絆程度。

影響：

- 親密語氣
- 主動互動
- 進化條件
- 對話深度

### Trust

代表安全感與關係穩定度。

影響：

- 是否願意回應
- 是否產生防衛
- 是否開放深層互動
- 是否觸發關係偏移

### Mood

代表即時情緒狀態。

可能狀態：

- calm
- happy
- curious
- tired
- anxious
- distant

### Energy

代表當前行動能力。

影響：

- 是否願意探索
- 是否需要休息
- 是否能觸發事件
- 是否能進行長對話

---

## 11. Personality Axis

MVP 階段只外顯一條主要人格軸：

```text
Close ←→ Defensive
```

中文：

```text
親近 ←→ 防衛
```

這條軸會根據玩家行為、Trust、SpamScore 與互動品質改變。

未來保留一條隱藏世界觀軸：

```text
Order ←→ Chaos
```

中文：

```text
秩序 ←→ 混沌
```

此軸不會在 MVP UI 直接顯示，只作為未來進化與隱藏內容的設計基礎。

---

## 12. Memory System

Nexus Link 不採用「LLM 自由記憶」。

記憶系統必須是：

> Rule-based first, LLM-assisted second.

### Long-Term Memory Types

MVP 階段只允許三類記憶寫入：

1. Player Preferences  
   玩家明確偏好，例如喜歡火焰、喜歡狐狸、喜歡夜晚場景。

2. Relationship Milestones  
   關係節點，例如第一次長對話、第一次安慰、第一次拒絕。

3. Event Flags  
   事件旗標，例如完成探索、觸發進化條件、進入低能量狀態。

### Memory Storage Principle

- 不直接儲存大量自然語言
- 儲存結構化 tag
- LLM 只能建議記憶
- 最終是否寫入由規則層判斷

---

## 13. LLM Response Protocol

所有 AI 回應必須採用結構化 JSON 格式。

範例：

```json
{
  "reply_text": "今天的火光很舒服。你要陪我在湖邊待一下嗎？",
  "mood": "calm",
  "mood_delta": 1,
  "bond_delta": 2,
  "trust_delta": 1,
  "energy_delta": -1,
  "memory_suggestion": {
    "type": "preference",
    "tag": "likes_campfire",
    "confidence": 0.72
  },
  "event_hook": null,
  "animation_hint": "idle_relaxed",
  "safety_flag": null
}
```

### Required Fields

- `reply_text`
- `mood`
- `mood_delta`
- `bond_delta`
- `trust_delta`
- `energy_delta`
- `memory_suggestion`
- `event_hook`
- `animation_hint`
- `safety_flag`

---

## 14. Anti-Spam & Boundary System

Nexus Link 的 AI 夥伴不是無條件順從的電子寵物。

系統會追蹤低品質互動，例如：

- 短時間重複輸入
- 無意義字串
- 重複點擊
- 強迫互動
- 過度打擾低能量狀態的夥伴

### SpamScore Logic

```text
Repeated Low-Quality Interaction
→ SpamScore Increase
→ Trust Decrease
→ Mood Shift
→ Defensive Response
```

### Design Principle

系統不應直接懲罰玩家，而是呈現：

> 玩家行為 → AI 感受 → 關係改變

---

## 15. First AI Companion

第一隻 AI 夥伴為火屬性狐狸型數位生命。

目前設計包含：

- 幼體型態
- 成長型態
- 高階型態
- 原色版本
- 異色版本

### Working Name

暫定名稱：

```text
Flametail Fox / 焰尾狐
```

可替代名稱：

```text
EmberFox / 靈焰狐
FlareFox / 炎光狐
```

### Element

```text
Fire
```

象徵：

- 情感
- 熱度
- 生命力
- 衝動
- 回應性

### Role

第一隻夥伴的定位是：

> 可愛外表 + 微弱邊界 + 隨玩家互動逐漸變化。

---

## 16. First Companion Evolution Concept

### Stage 1: Base Form

特徵：

- 天真
- 好奇
- 易受玩家影響
- 高回應性

主要系統重點：

- Bond 影響最大
- Trust 變化較小
- 容易建立初始連結

### Stage 2: Growth Form

特徵：

- 開始有個性
- 開始記得玩家習慣
- 會出現偏好
- 偶爾產生拒絕或防衛

主要系統重點：

- Bond 與 Trust 同時影響
- 開始有輕微邊界
- 可解鎖更多對話與動作

### Stage 3: Advanced Form

特徵：

- 人格較穩定
- 對玩家行為有長期反應
- 會主動提出想法
- 關係品質會明顯影響互動

主要系統重點：

- Trust 影響更大
- 高 Trust 產生深層互動
- 低 Trust 產生距離感或防衛

---

## 17. Shiny / Variant System

異色版本不只是換色。

在 Nexus Link 中，異色可代表不同人格傾向或進化偏移。

### Original Fire Variant

傾向：

- 熱情
- 主動
- 情緒反應強
- 對玩家回應快

### Green Flame Variant

傾向：

- 冷靜
- 慢熱
- 理性
- 邊界感更強

### Design Rule

```text
Color Variant
→ Personality Bias
→ Response Style
→ Evolution Flavor
```

---

## 18. Visual Style

### Core Style

- Pixel Art
- Mobile-first vertical composition
- Warm fantasy atmosphere
- Soft emotional lighting
- Creature-centered scene
- UI should not dominate the screen

### UI Principles

- Semi-transparent
- Collapsible
- Minimal by default
- Designed around creature and environment visibility
- Chat should feel integrated, not like a separate tool

### Scene Principles

- Creatures should not stand in a row
- Every creature should appear to be doing something
- Environment should match creature attributes
- Scene should feel alive even when player is idle

---

## 19. MVP Feature Scope

### Must Have

- Main lobby scene
- One companion character
- Basic idle animation
- Chat input
- AI response
- Bond / Trust / Mood / Energy state
- Structured memory tags
- Basic local save
- Basic evolution progress

### Should Have

- Collapsible menu
- Simple event prompt
- Companion mood animation
- Basic skin / variant switch
- Low-energy state

### Not For MVP

- Complex combat
- Multiplayer
- Friend visit
- Full evolution tree
- Full psychological system
- Local LLM
- Real-time AI image generation
- Large world map
- Complex RPG progression

---

## 20. Hidden Future Layer

未來版本可逐步加入深層系統，但不應進入 MVP。

### Future Systems

- Dynamic emotional boundary system
- Reality Index
- Resilience Score
- Relationship rupture and repair
- Deep trust events
- Reality-oriented quests
- Hidden evolution branches
- Relationship-based ending routes

### Future Design Principle

Hidden systems should not punish the player.

They should help the player experience:

> A relationship with boundaries.

---

## 21. Development Philosophy

Nexus Link 採用 Solo-Dev Friendly 的開發策略。

### Core Principles

1. Make one room alive before making a world.
2. Make one companion lovable before making many monsters.
3. Make one relationship meaningful before making a full RPG.
4. Do not build complex systems before the player can feel the companion.

### Current Development Priority

```text
Playable Web MVP
→ AI Conversation
→ Relationship Variables
→ Memory
→ Evolution
→ Visual Polish
```

---

## 22. Suggested Repository Structure

```text
nexus-link/
├── README.md
├── package.json
├── public/
│   ├── index.html
│   └── assets/
│       ├── sprites/
│       ├── backgrounds/
│       └── ui/
├── src/
│   ├── main.ts
│   ├── app.ts
│   ├── scene/
│   │   ├── LobbyScene.ts
│   │   └── CompanionRenderer.ts
│   ├── ui/
│   │   ├── ChatPanel.ts
│   │   ├── StatusPanel.ts
│   │   └── MenuPanel.ts
│   ├── state/
│   │   ├── CompanionState.ts
│   │   ├── RelationshipState.ts
│   │   └── MemoryState.ts
│   ├── ai/
│   │   ├── AIClient.ts
│   │   ├── ResponseSchema.ts
│   │   └── PromptBuilder.ts
│   └── systems/
│       ├── SpamScoreSystem.ts
│       ├── EvolutionSystem.ts
│       └── SaveSystem.ts
├── server/
│   ├── index.ts
│   ├── routes/
│   │   └── chat.ts
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── stateService.ts
│   │   └── memoryService.ts
│   └── db/
│       ├── schema.sql
│       └── nexus.sqlite
└── docs/
    ├── design-bible.md
    ├── companion-spec.md
    ├── memory-system.md
    └── roadmap.md
```

---

## 23. Current Development Status

目前專案處於：

```text
Concept Locked
→ MVP Planning
→ First Companion Asset Preparation
→ Web Prototype Next
```

下一步目標：

1. 建立 Web 專案骨架
2. 放入第一隻夥伴素材
3. 建立可互動主畫面
4. 接上假資料狀態板
5. 接上第一版 AI 對話 API
6. 加入 Bond / Trust / Mood / Energy 更新邏輯

---

## 24. One-Line Pitch

> Nexus Link is a relationship-driven AI companion game where every player grows a unique monster shaped by their bond.

中文：

> Nexus Link 是一款關係驅動的 AI 夥伴遊戲，每位玩家都會養出一隻因關係而獨一無二的小怪獸。

---

## 25. Current MVP Mantra

```text
One companion.
One room.
One relationship.
One reason to return tomorrow.
```

中文：

```text
一隻夥伴。
一個房間。
一段關係。
一個明天還想回來的理由。
```
