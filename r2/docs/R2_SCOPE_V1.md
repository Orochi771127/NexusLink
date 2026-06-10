# R2_SCOPE_V1.md — Nexus Link R2 第一版 Vertical Slice 範圍與優先順序

> 來源：R2 Master Handoff v1.0 第 9、10、11、24、28 節。
> 原則：第一版不做無限擴張，先做出可玩的 vertical slice。

---

## Vertical Slice 核心範圍（必須達成）

- 1 個主棲地（夜湖 / LakeNightCamp 為主）
- 3 到 5 隻可選夥伴
- 1 張小型探索地圖（節點式，非開放世界）
- 5 個探索節點
- 1 套完整 Soul Talk（含 memory echo）
- 1 套情緒記憶系統
- 1 套棲地痕跡（Habitat Trace）
- 1 套基礎戰鬥（1v1 回合制）
- 1 條完整進化線（展示五階段或四階段）
- 1 到 2 個 Boss teaser（可為 encounter 或 codex 預告）
- 1 套 Codex / 圖鑑 UI 原型
- 1 套 localStorage 存檔（nexusLinkR2State:v1）
- 支援 reload 後狀態保留
- 手機直式 9:16 可用

---

## 建議第一批玩家可選夥伴（Canon / Candidate）

1. **焰尾狐 / Flametail Fox line**
   - 屬性：火
   - 定位：活力、熱情、攻擊、成長門面
   - 適合：第一批玩家可選夥伴

2. **水晶海馬 / Crystal Seahorse line**
   - 屬性：水
   - 定位：冷靜、流動、治癒、支援
   - 適合：水域探索、情緒穩定玩法

3. **青葉麋鹿 / Verdant Stag line**
   - 屬性：木
   - 定位：自然、治癒、棲地共鳴
   - 適合：棲地互動、恢復、地圖支援

4. **星核虎 / Stellar Tiger line**
   - 屬性：土 / 星
   - 定位：穩定、防禦、晶體成長
   - 適合：防禦型夥伴、地脈互動

5. **雷霆幼狼 / ThunderPup line**
   - 屬性：雷
   - 定位：勇氣、守護、速度、攻擊
   - 適合：宣傳門面、第一條完整進化展示

**灰影貓**：
- R1 主夥伴
- R2 可作為 default / tutorial / first Nexus Core companion
- 不可直接被刪除
- 可轉型為 Soul Guide 或初始夥伴之一

---

## 建議第一批敵方 / Boss

1. **深淵獅帝 / Abyss Lion Emperor**
   - 屬性：水 + 暗
   - 陣營：黑鐵駭客或深層黑鐵資料海
   - 定位：資料深淵、記憶污染、強敵 Boss

2. **虛土領主 / Voidsoil Lord**
   - 屬性：暗 + 土
   - 陣營：混沌裂隙
   - 定位：空虛、侵蝕、支配型 Boss

3. **聖金龍神 / Sacred Golden Dragon God**（中後期 teaser）
   - 屬性：金屬 + 秩序
   - 陣營：黑鐵駭客 / 秩序核心
   - 用途：高階陣營代表，第一版建議僅 codex / encounter 預告

---

## 第一階段推薦任務順序（Grok Build + Fable 5 協作）

1. R2 reference image classification（已完成）
2. R2 Canon Registry / Visual Bible / Asset Pipeline Spec（已完成多份）
3. R2 HUD mood label 補全
4. R2 Boundary 文案升級
5. R2 Soul Talk response pool / memory echo
6. R2 Action Sheet contextual rows
7. R2 Companion Selection data model（3~5 隻）
8. R2 Codex UI prototype（參考 R2_CODEX_UI_REFERENCE.md）
9. R2 simple exploration map（節點式）
10. R2 simple battle prototype（1v1 + 狀態連動）
11. R2 trace visual mapper + renderer
12. R2 app.js subscription optimization
13. R2 localStorage 與 Offline Return 強化

**第一輪原則**（來自既有 guardrails）：
- 優先 docs + 小修
- 每次 ≤ 少量 runtime files
- 不碰 app.js / Pixi renderer 除非必要
- 不改 state schema 除非明確需要
- 每次必跑 git status --short + 雙環境測試

---

## 成功驗收標準（對照第 28 節）

- 可從 /r2/ 開啟並完成一次完整循環（選擇夥伴 → 探索 → 戰鬥/事件 → Soul Talk → 進化展示 → Codex 查看 → reload 狀態保留）
- 視覺風格符合 Cyber-Taoism
- 無 R1 污染
- 無 console error
- 所有新功能都有對應 docs 更新

---

*本文件定義 R2 v1 的「夠用就好」範圍。超出此範圍的功能需經 human 重新確認優先級。*
