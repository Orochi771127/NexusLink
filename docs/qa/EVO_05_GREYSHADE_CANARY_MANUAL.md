# EVO-05 灰影貓 canary 棲地手動清單

這不是完整換形 Runtime，也不是 11 隻一起換身體。
只驗：**灰影貓存檔已是下一階時，月湖棲地能不能試播同一隻的新形態；失敗時會不會變成別隻。**

兩個 flags 必須保持 `false`。不要用這份清單當 EVO-06 通過證明。

---

## 啟動

在隔離 worktree 根目錄：

```powershell
python -m http.server 5173
```

用瀏覽器開 `http://localhost:5173`。不要用 `file://`。

建議用無痕視窗，避免弄髒平常存檔。

---

## 準備一隻「已經進化」的灰影貓

正式路徑：玩到 Growth 邀請、玩家明示接受，存檔成功後再回棲地。

若只做畫面 canary（拋棄式存檔），等棲地出現後在 Console 執行：

```js
await window.__NEXUS_HABITAT.previewGreyshadeCanary("resonant_mature")
window.__NEXUS_HABITAT.inspectGreyshadeCanary()
```

終局形態把 `"resonant_mature"` 改成 `"final_awakened"`。

注意：這個 QA 指令會改記憶體裡的 `growth.stage`，後面如果自動存檔，這份存檔就帶有測試用階段。測完請清站台資料或關掉無痕。

---

## 必須看到

- [ ] 棲地裡仍是**灰影貓**，不是金羽小梟、焰尾狐或其他角色。
- [ ] 新形態若載到，看起來是同一隻貓的下一階，不是換皮成另一隻。
- [ ] 腳底對齊湖岸／陰影，動畫切換時腳底不大幅滑開。
- [ ] Console 沒有未處理錯誤；Network 沒有把 `auriowl` 或其他角色 sheet 載進灰影貓。
- [ ] `inspectGreyshadeCanary()` 的 `growthStage` 仍是你設的下一階；`presentation.growthMutation` 為空。
- [ ] 重整頁面後（若 QA 階段有被存到）：階段數字還在，不會被畫面失敗改回去。

## 失敗時必須看到

- [ ] 若 R4 圖載不到：畫面退回**同一隻灰影貓 Stage 1**，不是空白、不是別隻。
- [ ] 存檔裡的階段**不因此變回** `initial_awakened`。
- [ ] `presentation.retryable` 為 true，或下次進棲地會再試一次。

## 不要當成通過的事

- [ ] 對峙／遠征仍可能是 Stage 1 插畫。這包沒接那些畫面。
- [ ] 走路可能只有南向、或暫時維持 idle。這不是 EVO-06。
- [ ] 金羽小梟、海馬還沒開 canary。
- [ ] 390×844 與真機 GPU 要另做；沒做就標 `NOT VERIFIED`。

## 手機（可選）

- [ ] 390×844：角色仍完整可見，不裁成半隻。
- [ ] 開場沒有一次載入大量 2048 sheet（Network 開場應先看到 idle cardinal，不是 176 張）。
- [ ] `prefers-reduced-motion`：沒有整段進化 VFX；階段仍以存檔為準。
