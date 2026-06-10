# R2_SYSTEM_BLUEPRINT.md — Nexus Link R2 系統藍圖與施工邊界

> 來源：R2 Master Handoff v1.0 第 1-4、23、25 節 + 既有 R2_BLUEPRINT_ADAPTATION.md / R2_SANDBOX_RULES.md 整合。
> 用途：給 Fable 5 與 Grok Build 的最高層架構與權限參考。

---

## 1. 專案雙線策略

**R1（穩定主線）**
- 可公開測試
- 不被 Fable 5 / Grok Build 大改
- 保留為 fallback / legacy backup
- 任何從 R2 回移 R1 的動作必須 human 手動 + 完整 diff 審查

**R2（獨立實驗版）**
- 位於 `r2/**`
- Fable 5 可在 r2/** 內最大權限施工
- Grok Build 負責 docs/**、reference/** 整理與轉譯
- 目標是成為商業版候選 prototype
- 成功後走 release candidate 流程（不可直接覆蓋 R1）

R2 產品方向升級為：
情緒陪伴 × 多夥伴養成 × 地圖探索 × 進化 × 基礎戰鬥 × 圖鑑

---

## 2. 技術限制（鐵律）

**允許**
- HTML + CSS + Vanilla JavaScript ES Modules
- PixiJS v8（CDN）
- localStorage（key 必須是 `nexusLinkR2State:v1`）
- GitHub Pages compatible

**絕對禁止**
- React / Vue / Svelte / TypeScript / Tailwind
- 後端 / 資料庫
- LLM API（OpenAI / Anthropic / Gemini / Claude 等）
- npm dependency（除非 human 明確要求）
- build step

**localStorage 隔離**
- R2 唯一合法 key：`nexusLinkR2State:v1`
- 絕對不可寫入 R1 的 `nexusLinkPrototypeState:v2`
- 測試時必須同時驗證 `/` 與 `/r2/`

---

## 3. 最大權限邊界（Fable 5 在 r2/** 可做的事）

**可以修改**
- r2/index.html
- r2/styles.css
- r2/src/**（重構 State / Engine / UI / Pixi 分層）
- r2/data/**
- r2/assets/**（包含 reference 整理後的轉檔產物）
- r2/docs/**（本任務主要產出區）

**可以做的事**
- 大幅重構 r2 內部架構
- 刪除 r2 內不需要的舊檔案
- 新增模組
- 重建 UI、戰鬥、探索、Codex、進化系統
- 建立完整可玩 vertical slice

**絕對禁止**
- 修改任何 r2/** 以外檔案（根目錄 R1 全部 forbidden）
- 自動 commit / push（除非 human 明確指示）
- 新增外部 dependency 或接 LLM API
- 醫療宣稱或心理治療定位

**每次施工後必做**
- `python -m http.server 5173`
- 同時測試 R1（/）與 R2（/r2/）
- `git status --short`（必須只顯示 r2/ 相關變更）
- 回報 changed files + 測試結果

---

## 4. Pixi / 像素渲染鐵律

- antialias: false
- resolution: 1
- roundPixels: true
- nearest-neighbor（texture.source.scaleMode = 'nearest'）
- 每幀 integer coordinate snap（Math.round）
- 禁止 blur、checkerboard、per-frame new Graphics
- 強制 object reuse / sync model
- texture cache
- trace / 粒子不遮擋主要 UI（灰影貓、HUD、Soul Talk、Bottom Nav）
- Habitat Trace 使用 Pixi Graphics 但只做 pulse / alpha update

---

## 5. AI 分工（Grok Build / Fable 5 / 其他）

**Grok Build 適合**
- 分類 reference images（已完成 inbox → 各子資料夾）
- 寫 / 更新 r2/docs/**（本任務主責）
- 轉譯 Master Handoff 為結構化規格
- 建立任務規格與 guardrails 文件
- 前置整理與索引

**Fable 5（Claude Code）適合**
- R2 大型架構重構
- 完整可玩 prototype 實作
- R2 bug hunt + self-test and repair
- commercial candidate polish

**ChatGPT / Codex 適合**
- 審查、砍範圍、找盲點、審 diff、防止過度設計

**Gemini 適合**
- 視覺截圖 QA
- UI 一致性檢查
- pixel blur / layout / readability 檢查

**Human 必須拍板**
- Canon 名單
- 第一版可選角色與 Boss
- R2 是否升格主線
- commit / push 決策
- migration / archive plan

---

## 6. 與既有文件的對應關係

- 權限與 guardrails 細節 → R2_IMPLEMENTATION_GUARDRAILS.md + R2_SANDBOX_RULES.md
- 路徑轉譯與 P1 原則 → R2_BLUEPRINT_ADAPTATION.md
- 視覺與 reference 規則 → R2_VISUAL_BIBLE.md + R2_ASSET_PIPELINE_SPEC.md + R2_REFERENCE_ASSET_INDEX.md
- 玩法與範圍 → R2_GAME_PILLARS.md + R2_SCOPE_V1.md
- 角色與陣營 → R2_COMPANION_BIBLE.md + R2_FACTION_BIBLE.md + R2_CANON_REGISTRY.md

---

**R2 不是 R1 的 fork 實驗場，而是完全隔離的平行宇宙。**
所有施工從 r2/docs/ 開始思考，再落地到最小必要的 r2/src/ patch。
