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

## 6. 探索地圖（H ・ v1-A 視覺化節點地圖）

- [ ] 地圖為視覺化節點圖：5 個符文光點（月湖營地☾/星林步道✶/晶岩遺跡◇/霧潮河岸≋/裂隙觀測點✕）+ SVG 光路連接（營地→步道、營地→河岸、步道→遺跡、河岸→觀測點）
- [ ] tone 狀態正確：營地金邊（safe）、步道/河岸青邊（calm）、遺跡 cyan（discovery）、觀測點紅邊（danger）+ 低頻符文微閃
- [ ] 未到訪節點為虛線環較暗；到訪後變實線 + 屬性色 glow + 右上「×N」次數徽章
- [ ] 最近探索節點有金色呼吸環（current）
- [ ] 點擊節點：光點 ping 一下 → 結算 → 下方 toast 滑入（節點雙語名 + 結果文 + 數值 chips 如「能量 +2」「羈絆 +2」「＋ 留下了一段記憶」）
- [ ] 月湖營地 → energy 回復、calm（toast 為 calm 色）
- [ ] 霧潮河岸 → 產生 calm 情緒記憶 + 湖面漣漪痕跡
- [ ] 晶岩遺跡 → 約 1/3 機率遭遇戰
- [ ] 裂隙觀測點 → 必定遭遇：toast 轉 danger 色 + 「！ 遭遇接近中」chip + 光路短暫染紅 → ~0.65s 後進戰鬥
- [ ] energy 0 時點非營地節點 → toast 溫和勸退，不結算
- [ ] 到訪次數/current 隨探索更新並在 reload 後保留
- [ ] 390×844 行動尺寸：節點可點（≥46px）、文字可讀、地圖不遮 bottom nav、panel 不超出
- [ ] 系統開啟「減少動態」時：光路流動/呼吸環/微閃/ping 停止，僅保留透明度過渡

## 7. 心核對峙（I ・ White Lab 情緒對峙版）

- [ ] 遭遇開啟對峙面板：「{節點} ・ 場域不安定」、雜訊濃度條（紫紅）、心核穩定條（青金）、同步/疲勞 pips、記憶微光 ◈0/3
- [ ] **無 HP/攻擊語言**：開場文案「穩住心核，把雜訊放輕。你們不需要消滅誰。」
- [ ] 共鳴（依徽章命名，如幽影共鳴）→ 雜訊下降 + 微光 +1 + 同步 +1 + 疲勞 +1
- [ ] 邊界 → 穩定 +5、邊界層數 +1（雜訊湧動被減傷、層數會衰減）
- [ ] 脈衝 → 需同步 ≥2；雜訊大降、疲勞 +2、穩定 −2；疲勞滿時 disabled
- [ ] 疲勞 ≥5 → 共鳴效率下降 + 「呼吸先慢下來」提示
- [ ] 四結局可達且文案正確：雜訊歸零=場域穩定／微光 3=記憶回收／穩定歸零=過載・但安全（牠把你拽到身後）／先撤退（懂得離開也是照顧）
- [ ] recovered → gratitude 記憶+金符文痕跡；overwhelmed → fatigue 記憶+白燼；retreated → trust +1 不懲罰
- [ ] Escape/點背景 → 轉撤退結算（不無聲關閉）；對峙中 reload → 視為未發生
- [ ] battleRecord 映射：stabilized/recovered→wins、overwhelmed→losses、retreated→retreats

## 7.5 閉環（White Lab Loop）

- [ ] 主棲地 → Explore → 星圖 → 節點 → 對峙 → 結算 → **回棲地後灰影貓以自己的聲音引用剛才的結局**（companion 角色，含節點名）
- [ ] 心語預覽即為該引用句
- [ ] 首訪節點（無遭遇）→ 一句探索引用；重訪不重複
- [ ] 對峙後 15 分鐘內 reload → 開心語補一次跨 session 引用（同句不重複）

## 7.6 邊界可玩機制（White Lab）

- [ ] 夥伴狀態面板「邊界」列含第三行身體語言（如「牠安靜地待在原地。」）
- [ ] defense ≥70 → 「牠的耳朵向後壓低了」；mood warm + bond ≥15 → 「牠正輕輕地向你靠近」；energy ≤1 → 「牠正安靜地休息」
- [ ] 被拒絕後 3 秒內連點 → 不可覆寫：第 1 次 ears_back、第 2 次 look_away、第 3 次起 step_back + defense 上升，且夥伴播對應退避動畫
- [ ] 被拒絕後等 ≥25 秒再輕碰 → 狀態文「你給了牠需要的距離…」+ trust +1 + defense −2 + 湖面出現「被尊重的距離」漣漪痕跡（每次拒絕只觸發一次）
- [ ] 被拒絕後改用 Care「靜靜陪伴」→ 「你沒有伸手，只是坐在牠夠得到的距離。」+ 同等沉積

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
