# REVIEW_CHECKLIST.md — Nexus Link Diff 審查清單

> 適用對象：ChatGPT、Codex、human reviewer 在審查 diff 時使用。  
> 每一項必須明確回答 ✓ 通過 / ✗ 失敗 / ⚠ 需要關注。

---

## 使用方式

執行以下指令取得 diff：
```bash
git diff
git status --short
```
然後對照以下清單逐項確認。

---

## 一、授權範圍

- [ ] **未授權檔案是否被修改？**
  - 確認 diff 中的每個檔案都在本次任務的 `Allowed files` 清單內
  - 特別注意：`index.html`、`src/pixi/pixiApp.js`、`src/state/saveManager.js`、`assets/**`
  - 確認未授權時沒有修改 `/r2/**`、`tools/**`、`scripts/**`
  - ✗ 失敗條件：任何未授權檔案出現在 diff 中

- [ ] **是否有意外刪除或重命名資產檔案？**
  - 確認 `assets/characters/` 下沒有任何 rename 或 delete
  - ✗ 失敗條件：任何 `assets/` 路徑出現 delete 或 rename

---

## 二、技術邊界

- [ ] **是否引入新的外部依賴？**
  - 確認沒有新的 `import` 指向 CDN URL 或 npm 套件
  - 確認 `package.json` 未被修改（若存在）
  - ✗ 失敗條件：新增任何外部 URL import 或 package 依賴

- [ ] **是否破壞 HTML / CSS / Vanilla JS / PixiJS / localStorage / GitHub Pages 邊界？**
  - 沒有引入 React / Vue / Svelte / TypeScript / Tailwind
  - 沒有引入需要 build step 的工具
  - 沒有引入後端或 API 呼叫
  - ✗ 失敗條件：任何框架或 build step 出現

---

## 三、localStorage 規範

- [ ] **是否有直接 localStorage 寫入？**
  - 確認新增代碼中沒有 `localStorage.setItem` 直接呼叫
  - 所有寫入必須透過 `src/state/saveManager.js`
  - ✗ 失敗條件：任何 `localStorage.setItem` 出現在 `saveManager.js` 以外的檔案

- [ ] **是否有 state schema 變更的 migration 風險？**
  - 若 `defaultState.js` 或 `store.js` 有新增/移除/重命名欄位，需評估舊存檔相容性
  - `normalizeState` 是否有對應更新？
  - ⚠ 關注條件：任何 state 欄位名稱或型態變更

---

## 四、架構解耦

- [ ] **是否有 Pixi / DOM 耦合？**
  - `src/pixi/` 下的程式碼是否直接操作 DOM 元素（`document.querySelector` 等）
  - `src/ui/` 下的程式碼是否直接操作 Pixi 容器（`PIXI.Container` 等）
  - ✗ 失敗條件：Pixi 模組呼叫 DOM API，或 UI 模組直接操作 Pixi 物件

- [ ] **是否直接操作 store 狀態而非透過 API？**
  - 確認所有 state 變更都透過 `setState` / `updateState` / `replaceState`
  - ✗ 失敗條件：直接對 `state` 物件做 mutation（`state.bond = 10`）

---

## 五、效能規範

- [ ] **是否新增了 ticker 或每 frame 重建物件？**
  - 確認 `app.ticker.add()` 內沒有新增 DOM 查詢、`JSON.parse`、`fetch`
  - 確認沒有在 ticker 內每 frame 建立新的 Pixi 物件（應用物件池或 sync 模式）
  - ✗ 失敗條件：ticker 內出現高頻昂貴操作

- [ ] **是否誤把 illustrated companion 改回 legacy pixel / nearest 規則？**
  - 新 companion 是否仍是 illustrated / painterly / high-detail，而不是 chunky pixel art default
  - companion sampling 是否維持 linear + mipmaps，而不是改回 nearest-neighbor
  - 是否誤把 64×64、64 PPU、96px 或 `frameSize: 64` 當成新 companion 標準
  - ⚠ 關注條件：nearest / pixel-perfect / no anti-aliasing 只可出現在 legacy / historical / greyshade-cat 專用語境

- [ ] **是否保留 bottom-center baseline 與 position snap？**
  - companion anchor 是否維持 bottom-center（概念上 `x: 0.5, y: 1`）
  - final on-screen position snap 是否保留，避免動畫切換時腳底滑動
  - scale / fit 計算是否使用 `frameHeight`，不是整張 `sheetHeight`
  - ✗ 失敗條件：角色動畫因 anchor、position 或 sheetHeight scale 造成腳底滑動

---

## 六、Companion Art Policy

- [ ] **是否符合 illustrated companion root 規格？**
  - 新 companion master frame 是否為 `512×512 px`
  - final runtime PNG 是否透明
  - frame 內是否沒有白底、UI、文字、場景、展示台、圖鑑框 baked in
  - sprite sheet edge 是否 `<= 4096 px`
  - frame grid 是否整除：`sheet_width / cols` 與 `sheet_height / rows` 都是整數
  - ✗ 失敗條件：新 companion 用 chunky pixel art / nearest-neighbor / 64×64 作為預設規格

- [ ] **是否保護 legacy / reference 邊界？**
  - `greyshade-cat` 現有 443/444 frame 是否被視為 legacy accepted，且沒有被 upscale 到 512
  - pixel-style concept sheets / 舊圖鑑 / 64 PPU / 96px 標記圖是否只作為 design reference / art canon
  - 是否沒有把 concept sheet 直接放進 runtime spritesheets
  - 是否未碰 `/r2/**`
  - ✗ 失敗條件：舊設定圖被直接當成 runtime companion sprite，或 `/r2/**` 被順手更新

---

## 七、可測試性

- [ ] **是否可以手動測試？**
  - 修改是否可以透過 `python -m http.server 5173` + 瀏覽器驗證
  - 是否提供了具體的手動測試步驟
  - ✗ 失敗條件：修改無法在無 build step 的情況下驗證

---

## 八、最終確認

所有項目通過後，填寫以下確認欄：

```
Reviewer: <AI 名稱 or human>
Review date: <日期>
Verdict: PASS / FAIL / CONDITIONAL PASS

PASS conditions met:
  - 未授權檔案：未修改 ✓
  - 新依賴：無 ✓
  - localStorage 直接寫入：無 ✓
  - Pixi/DOM 耦合：無 ✓
  - Ticker 濫用：無 ✓
  - Illustrated companion sampling：linear + mipmaps ✓
  - 64×64 未被當成新 companion 標準 ✓
  - Bottom-center baseline / position snap：保持 ✓
  - frameHeight scale：使用 ✓
  - /r2/：未修改 ✓
  - concept sheet：未直接進 runtime ✓
  - 可手動測試：是 ✓

Notes:
  <任何補充說明>
```

---

## 快速紅旗清單

以下任何情況出現即為 **立即 FAIL**，需要 human 介入：

- `localStorage.setItem` 出現在 `saveManager.js` 以外
- `assets/` 目錄下有 delete 或 rename
- 任何 CDN URL import 或 npm install
- `index.html` 被修改（未授權時）
- `git push` 被 AI 自動執行
