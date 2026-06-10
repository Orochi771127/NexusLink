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

- [ ] **是否破壞 pixel-perfect 渲染？**
  - 角色座標是否仍為整數（`Math.round()`）
  - sprite 的 `scaleMode` 是否仍為 `nearest`
  - ⚠ 關注條件：任何浮點數座標賦值給角色 sprite

---

## 六、可測試性

- [ ] **是否可以手動測試？**
  - 修改是否可以透過 `python -m http.server 5173` + 瀏覽器驗證
  - 是否提供了具體的手動測試步驟
  - ✗ 失敗條件：修改無法在無 build step 的情況下驗證

---

## 七、最終確認

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
  - Pixel-perfect：保持 ✓
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
