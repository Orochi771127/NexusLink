# ADR-001 — Desktop Wrapper 選型（Tauri vs Electron）

> Status: **PROPOSED（草案，待 Owner 拍板）**
> Date: 2026-07-14
> Author: Claude Fable 5（起草）；決策權在 Owner
> 上位法：`docs/architecture/PACKAGING_ROADMAP.md`（web 為 canonical runtime，本 ADR 未核准前不建任何封裝專案、不引入任何封裝依賴）
> 對應商業化計畫：`docs/strategy/NEXUS_LINK_COMMERCIALIZATION_COMPLETION_PLAN.md` 10 步藍圖之 step 10

---

## 1. 決策問題

Nexus Link 要上 Steam，需要把 canonical web runtime（vanilla JS + PixiJS + localStorage，無 build step）包成桌面應用。選 **Tauri** 還是 **Electron**？

## 2. 硬約束（兩案都必須滿足）

1. **不改 canonical runtime**：wrapper 只是殼，`index.html` / `src/**` / 存檔語意不因封裝而分岔（PACKAGING_ROADMAP §3 明載）。
2. **PixiJS CDN 改 vendored**：目前 `index.html` 從外部 CDN 載 PixiJS；桌面版必須離線可玩，需把 PixiJS 以本地檔案形式隨包發佈（此為 wrapper 專案內的資產，不改 web 版）。
3. **存檔策略**：webview 的 localStorage 在桌面上受 webview 儲存區管理，需明確定義：
   - 存檔實際落地位置與備份策略（Steam Cloud 或本地檔案匯出）；
   - 未來若遷移為檔案存檔，走既有 state migration 管線，**不得**破壞 `nexusLinkR2State:v1` 語意。
4. **無後端**：桌面版一樣不引入帳號 / 網路服務；變現在 Steam 發行層（付費本體 + DLC 解鎖旗標）。
5. **憲法照舊**：七紅線與 ACCEPTANCE 條款對桌面版全數適用。

## 3. 選項比較

| 面向 | Tauri 2.x | Electron |
|------|-----------|----------|
| 包體 | ~5–15 MB（用系統 WebView2/WKWebView） | ~80–150 MB（自帶 Chromium） |
| 記憶體 | 低（共用系統 webview） | 高（獨立 Chromium 行程） |
| 渲染一致性 | 依賴系統 webview 版本（Windows=WebView2 常青、macOS=WKWebView） | 完全固定的 Chromium 版本，跨機器渲染 100% 一致 |
| PixiJS/WebGL 相容 | WebView2 支援 WebGL2，一般無虞；老 Windows 需檢查 WebView2 runtime 佈署 | 最穩，Chromium 原生 |
| Steam 整合（steamworks） | Rust crate（steamworks-rs）或以檔案旗標繞過；成熟度中 | steamworks.js 等社群方案成熟 |
| 自動更新 | Steam 自身即為更新通道（桌面版可不用內建 updater） | 同左 |
| 安全面 | Rust 殼，攻擊面小；預設不開 Node 整合 | 需自行關閉 nodeIntegration、開 contextIsolation |
| 建置工具鏈 | 需 Rust toolchain（僅 wrapper 專案內，不污染遊戲 repo） | 需 Node/npm（同樣僅 wrapper 專案內） |
| 專案先例 | `PACKAGING_ROADMAP.md` §3 已明文「Treat Tauri as a future isolated desktop prototype」 | 無 |

## 4. 建議：**Tauri**（維持 roadmap 既定方向）

理由（依重要性排序）：

1. **Roadmap 已預定 Tauri**（§3），除非有硬性排除因素，不推翻既有架構文件。
2. 遊戲是輕量 2D web runtime，不需要 Electron 的重殼；小包體對 Steam demo 下載轉換率有直接好處。
3. Steam 桌面版的更新走 Steam 管道，Electron 的 updater 生態優勢用不上。
4. 已知風險（WebView2 的 WebGL 行為差異）可用**原型驗證**排除——這正是 roadmap 要求的「isolated desktop prototype」。

**排除條件（若原型驗證失敗則改 Electron）**：WebView2 上 PixiJS 渲染錯誤 / 效能不達 60fps / localStorage 持久性不可靠，且無法在 wrapper 層修復。

## 5. 原型驗證清單（核准本 ADR 後的第一個封裝任務）

1. 新建**獨立** wrapper 專案（不在 NexusLink repo 內），Tauri 2.x 最小殼載入 canonical runtime 靜態檔。
2. PixiJS 本地 vendored 替換 CDN（僅 wrapper 打包腳本處理，不改 web 版 `index.html`）。
3. 驗證：60fps 棲地動畫、全 29 動作切圖、localStorage 跨重啟持久、web release gate 逐條在 wrapper 內重跑。
4. 存檔備份/匯出方案設計（Steam Cloud 對 localStorage 的橋接或手動匯出檔）。
5. 記錄驗證證據，回寫本 ADR → Status: ACCEPTED / REJECTED。

## 6. 未決事項（Owner 決策）

- [ ] 核准 Tauri 方向（或指定 Electron）
- [ ] wrapper 專案的存放位置與命名
- [ ] Steam demo 與付費本體是否同一 wrapper 專案雙組態
- [ ] 存檔備份策略（Steam Cloud vs 本地匯出，影響法務文件的資料聲明）
