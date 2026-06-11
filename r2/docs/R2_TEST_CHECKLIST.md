# R2 Vertical Slice — Test Checklist

啟動方式（在 repo root `NexusLink/` 執行）：

```bash
python -m http.server 5173
```

- R1：`http://localhost:5173/`
- R2：`http://localhost:5173/r2/`

---

## 0. 隔離與基礎

- [ ] R1（`/`）正常開啟，行為與施工前一致
- [ ] R2（`/r2/`）正常開啟，Pixi 場景 + 灰影貓 idle 動畫
- [ ] DevTools Console 無紅色 error
- [ ] DevTools → Application → localStorage：R2 只寫 `nexusLinkR2State:v1`
- [ ] R1 的 `nexusLinkPrototypeState:v2` 未被改動
- [ ] `git status --short` 只顯示 `r2/**`

## 1. 舊存檔相容（migration 安全）

- [ ] 先用施工前版本玩過（或手動把缺新欄位的 JSON 塞進 `nexusLinkR2State:v1`），reload 後：
  - 不 crash；`activeCompanionId` 補為 `greyshade-cat`
  - bond/trust/記憶/痕跡保留

## 2. 夥伴選擇（C）

- [ ] 點左上夥伴 HUD → 「切換夥伴」→ 看到 5 張卡片（元素徽、雙語名、徽章、素材狀態 chip、同行中標記）
- [ ] 選「水晶海馬」→ 場景出現藍色輪廓佔位夥伴，不 crash；HUD 名稱/頭像更新
- [ ] 選「焰尾狐」→ 顯示靜態立繪 + 火焰 accent
- [ ] 切回「灰影貓」→ 動畫恢復
- [ ] reload → 仍是上次選的夥伴
- [ ] 對 placeholder 夥伴點擊/雙擊（touch/hug）→ 有反應、不 crash

## 3. Soul Talk（D）

逐句輸入並確認「回應 + mood 變化 + 記憶 + 痕跡」：

- [ ] 「好累」→ fatigue 回應；營火邊出現白燼痕跡
- [ ] 「很難過」→ sadness 回應；湖面出現藍燈籠
- [ ] 「好焦慮」→ anxiety 回應；晶簇旁出現雜訊線
- [ ] 「謝謝你」→ gratitude 回應；魔法陣出現金色符文
- [ ] 「想安靜一下」→ calm 回應；湖面漣漪
- [ ] 48 小時內（同 session 即可）再輸入同類情緒 → 回應開頭出現「上次…」記憶回聲
- [ ] bond 低與 bond 高（dev hook 或多次互動後）回應語氣不同
- [ ] 不同夥伴（如焰尾狐）回應尾端偶爾出現該夥伴的語氣描寫
- [ ] 高風險字詞 → 安全防護訊息（原樣，未被改動）

## 4. 邊界（E）

- [ ] 夥伴狀態面板顯示「邊界」語意（安心/平常/警戒/防備）＋觸碰預告，無原始數字
- [ ] 連續快速點夥伴多次 → touch fatigue 上升 → 邊界等級上升、出現 guarded/hesitate/reject 反應
- [ ] Care →「靜靜陪伴」/「陪伴休息」後 → 邊界回落

## 5. Action Sheet（F）

- [ ] 四類 nav 各 ≥2 行動可用，結果寫入 system 訊息
- [ ] energy ≤3 時開 Care → 「陪伴休息」排第一、文案改變
- [ ] defense ≥60 時開 Care/Grow → 「靜靜陪伴」排第一
- [ ] 情緒記憶 ≥3 後開 Memory → 出現「回聲整理」
- [ ] Explore 第一列「開啟探索地圖」→ 地圖 panel

## 6. 探索地圖（H）

- [ ] 5 個節點卡（月湖營地/星林步道/晶岩遺跡/霧潮河岸/裂隙觀測點）含描述、標籤、到訪次數
- [ ] 月湖營地 → energy 回復、calm
- [ ] 霧潮河岸 → 產生 calm 情緒記憶 + 湖面漣漪痕跡
- [ ] 晶岩遺跡 → 約 1/3 機率遭遇戰
- [ ] 裂隙觀測點 → 必定遭遇戰
- [ ] energy 0 時點非營地節點 → 被溫和勸退，不結算
- [ ] 到訪次數隨探索累加並在 reload 後保留

## 7. 戰鬥（I）

- [ ] 遭遇開啟戰鬥面板：敵我名稱、HP bar、共鳴能量點、行動鈕
- [ ] 直覺爪擊 → 傷害 + 共鳴 +1；凝神防禦 → 下次受傷減半；共鳴 3 點時「情感共鳴」可按（不足時 disabled）
- [ ] 不同夥伴的共鳴技名稱不同（依情感徽章）
- [ ] 勝利 → bond/trust 上升、mood happy、system 訊息；`battleRecord.wins` +1（可在 Codex 進化線看到解鎖推進）
- [ ] 落敗 → 不懲罰式文案、mood tired
- [ ] 「先撤退」與 Escape/點背景 → 撤退結算（不會無聲關閉）
- [ ] 戰鬥中 reload → 回到棲地、無殘留狀態、不 crash

## 8. Codex / 進化（J）

- [ ] 夥伴狀態面板 → 「開啟圖鑑」→ 5 隻夥伴列表
- [ ] 點任一夥伴 → 雙語標題、7 個資訊 tag、SVG 六軸雷達（顏色隨屬性）
- [ ] thunder-pup → 5 階進化線；未解鎖階段顯示「？？？」+ 解鎖提示；勝場達標後解鎖顯示
- [ ] 其他夥伴 → 第一階 + 「演化資料整備中」
- [ ] 圖鑑內無任何 reference 圖片

## 9. 離線回歸（K）

- [ ] 手動把 localStorage 內 `lastSeenAt` 改為 1 小時前 → reload → 對話出現短問候
- [ ] 改為 24 小時前（lastEmotionTag 設 "sadness"）→ 出現對應的溫和長離開句，無責備語氣
- [ ] <30 分鐘 → 無問候

## 10. 效能 / 渲染

- [ ] 痕跡數量多時（連續輸入 10+ 情緒）幀率穩定、無記憶體飆升（ticker 僅 alpha pulse）
- [ ] 像素角色無模糊（nearest + 整數 snap）
- [ ] 手機直式（9:16 / 430px 寬以下）佈局正常，新 panel 可滾動、不超出畫面
