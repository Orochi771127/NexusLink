# R2_COMPANION_BIBLE.md — Nexus Link R2 夥伴、Soul Talk、邊界、痕跡與互動系統

> 來源：R2 Master Handoff v1.0 第 10、13、14、17-20 節 + 既有 R2 機制轉譯。
> 強調：夥伴有記憶、有邊界、有情緒反應，玩家的情緒會沉積。

---

## 1. 第一批建議可選夥伴

詳見 R2_SCOPE_V1.md。

- 焰尾狐（火、活力攻擊型）
- 水晶海馬（水、冷靜治癒型）
- 青葉麋鹿（木、自然共鳴型）
- 星核虎（土/星、穩定防禦型）
- 雷霆幼狼 / ThunderPup（雷、勇氣守護型，宣傳門面）

灰影貓保留為 default / tutorial / Soul Guide。

---

## 2. 情感元素徽章系統（7 種）

1. **愛・赤心** — 連結、羈絆 → 治療、支援、保護
2. **勇・炎志** — 勇氣、行動 → 攻擊、突破、主動技能
3. **信・金剛** — 信念、堅定 → 防禦、抗性、穩定
4. **和・青木** — 和諧、治癒 → 恢復、棲地修復、自然共鳴
5. **智・玄水** — 智慧、洞察 → 探索、判斷、資訊解析
6. **憶・幽影** — 記憶、預見 → memory echo、特殊事件、暗影技能
7. **陰陽・太極** — 平衡、無極 → 轉化、平衡、終階進化條件

用途：夥伴性格、進化條件、技能傾向、戰鬥共鳴、Soul Talk 情緒轉化、UI 徽章、Codex 分類。

---

## 3. 進化系統原則

進化條件應混合多維度：
- level
- bond
- trust
- emotional emblem（特定徽章解鎖或強化）
- battle experience
- map event
- habitat trace resonance
- special item or ritual
- companion temperament

階段建議：
- 五階段：Baby / 幼年期 → Child / 成長期 → Adult / 成熟期 → Perfect / 完全體 → Ultimate / 究極體
- 或部分角色四階段（Stage 1-4）

進化必須保留「關係」與「情緒棲地」特色，不可退化成普通升級制。

---

## 4. Soul Talk R2

**定位**：玩家把情緒放入棲地的入口，不是普通聊天機器人。

**功能**：
- 本地關鍵字情緒判斷（tired / sad / anxious / grateful / calm 等）
- 每種情緒 3~4 句回應池
- bond / trust 影響語氣
- 可引用近期同類 emotional memory
- 輸入後更新 mood / bond / trust / energy
- 產生 emotionalMemory + habitatTrace
- localStorage 保存，reload 後仍能被記得

**禁止**：
- 接 LLM API
- 心理診斷或醫療宣稱
- 說教、長篇治療式回應

---

## 5. Companion Boundary R2

夥伴不是無腦順從寵物，牠有邊界。

**功能**：
- touch fatigue 機制
- accept / guarded / hesitate / reject 狀態
- repeated touch 增加 defense
- defense 高時夥伴會退縮或拒絕
- Care / Rest 可降低 defense
- HUD 顯示語意狀態（不顯示 raw defense number）
- 反應進入 chat/status preview + animation fallback

**原則**：邊界不能變成懲罰，必須呈現為「關係的呼吸節奏」。

---

## 6. Habitat Trace R2

玩家情緒會具象化為棲地痕跡。

**視覺候選**（來自 reference）：
- blue lantern / sadness
- white ash / tired
- glitch noise / anxious
- golden rune / grateful
- soft ripple / calm

**技術規則**：
- Pixi Graphics 繪製
- trace 上限控制
- stable position
- reload 後保留
- ticker 只做 pulse / alpha update
- 禁止每幀 new Graphics、暴力重繪
- 不可遮擋灰影貓、HUD、Soul Talk、Bottom Nav

---

## 7. Soul Interaction / Action Sheet R2

Bottom nav（探索 / 照顧 / 成長 / 記憶）是玩家與棲地互動的行動入口。

**四類行動**：
- Explore
- Care（含 Rest、Gentle Presence 等狀態敏感行動）
- Growth
- Memory（含回聲行動）

**每個 action 應包含**：
- title + subtitle
- state-based result（依 mood / bond / trust / energy / defense）
- memory / trace optional
- short system response

**原則**：
- 行動根據當前狀態變化優先順序
- 不可任務清單化、背包化、商店化
- 必須服務情緒沉積與關係呼吸

---

## 8. Offline Return R2

玩家離開後，棲地仍有時間流動感。

**功能**：
- lastSeenAt 記錄
- return greeting（短離開：注意到你回來；長離開：更安靜但不責備）
- energy / mood 可輕微自然變化
- 不懲罰玩家、不情緒勒索

---

## 9. 與其他文件的關係

- 夥伴名單與層級 → R2_CANON_REGISTRY.md + R2_SCOPE_V1.md
- 情感元素詳細 → R2_EMOTIONAL_ELEMENT_SYSTEM.md
- 進化條件與階段 → R2_EVOLUTION_SYSTEM.md
- 視覺與 UI 呈現 → R2_VISUAL_BIBLE.md + R2_CODEX_UI_REFERENCE.md
- 資產轉換規則 → R2_ASSET_PIPELINE_SPEC.md

---

*夥伴的「真實感」來自狀態連動與時間流動，而非功能數量。*
