# R2 Vertical Slice — Implementation Report

日期：2026-06-11
施工範圍：僅 `r2/**`。R1 與 repo 基礎設定零接觸。未 commit、未 push、未新增依賴。

---

## 1. 本次完成的功能（對應任務 A–L）

| 區塊 | 狀態 | 摘要 |
|------|------|------|
| A. App Shell | ✅ | `/r2/` 獨立載入；Pixi 場景、HUD、Soul Talk、Bottom nav、Action Sheet、localStorage（`nexusLinkR2State:v1`）皆延續並擴充 |
| B. Companion System | ✅ | `src/data/companionRegistry.js`：5 隻夥伴完整資料（id/雙語名/element/faction/emblem/temperament/battleRole/habitatAffinity/soulTalkTone/evolutionLine/runtimeStatus/六維 radar/touch personality） |
| C. Companion Selection | ✅ | 夥伴狀態面板 →「切換夥伴」→ 5 卡片選擇；`state.activeCompanionId` 持久化；無 sprite 夥伴安全 fallback 成元素著色輪廓（Pixi Graphics），不 crash |
| D. Soul Talk | ✅ | 既有 7 情緒關鍵字偵測保留；新增 `soulTalkResponsePacks`（7 情緒 × bond 三檔，每情緒 6 句）＋ `soulTalkComposer`（bond 分檔、語氣注入、48h 記憶回聲）；安全防護（safety shield）分支一字未動 |
| E. Companion Boundary | ✅ | 既有 touch fatigue / accept‧guarded‧hesitate‧reject / defense 機制保留；HUD 新增「邊界」語意列（安心/平常/警戒/防備）＋觸碰預告，不顯示 raw defense 數字 |
| F. Action Sheet | ✅ | 四類各 ≥2 行動；energy≤3 → 休息優先；defense≥60 → 「靜靜陪伴」優先（新 choice `gentle_presence`）；情緒記憶 ≥3 → 「回聲整理」（新 choice `memory_echo`）；探索第一列開啟地圖 |
| G. Habitat Trace | ✅ | 新鮮情緒痕跡專屬視覺：sadness→藍燈籠、fatigue→白燼、anxiety→雜訊、gratitude→金符文、calm→漣漪；沉積弧線（settled→mist、transformed→repaired_light）保留；靜態 Graphics + alpha pulse，ticker 內無 new Graphics |
| H. Exploration Map | ✅ | DOM 節點地圖：月湖營地／星林步道／晶岩遺跡／霧潮河岸／裂隙觀測點；每節點 label/description/eventType/reward/emotionalTone/encounter；結果回饋 mood/energy/bond/trust/記憶/痕跡/戰鬥 |
| I. Battle Prototype | ✅ | 1v1 回合制；3 技能（直覺爪擊／凝神防禦／情感共鳴——依 emblem 帶風味名）；HP + 共鳴能量；勝/敗/撤退回饋 bond/trust/mood/energy；`battleRecord` 持久化；中途 reload 安全（視為未發生） |
| J. Evolution / Codex | ✅ | DOM/CSS/SVG 重建：列表 → 詳情（雙語標題、屬性/陣營/徽章/定位/性情/棲地/素材狀態 tag、SVG 六軸雷達、進化線 chips）；thunder-pup 完整 5 階線（幼年期→究極體，勝場 0/1/3/5/8 解鎖顯示）；未引用任何 reference 圖 |
| K. Offline Return | ✅ | `buildReturnGreeting`：<30min 不打招呼；30min–6h 短問候；>6h 依 lastEmotionTag 的溫和長離開句；寫入 chatHistory；不責備、不情緒勒索；既有 offline 能量/疲勞恢復保留 |
| L. Docs | ✅ | 本文件 + TEST_CHECKLIST + KNOWN_LIMITATIONS + ASSET_REQUEST_LIST |

## 2. 新增檔案

```
r2/src/data/companionRegistry.js      夥伴單一真相源（5 隻）
r2/src/data/explorationNodes.js       5 個探索節點
r2/src/data/enemyRegistry.js          3 隻敵人
r2/src/data/soulTalkResponsePacks.js  回應池 / 語氣 / 回聲模板
r2/src/data/evolutionLines.js         進化線（thunder-pup 完整 5 階）
r2/src/engine/soulTalkComposer.js     回應組合（純函數）
r2/src/engine/explorationEngine.js    探索結算（純函數）
r2/src/engine/battleEngine.js         戰鬥回合邏輯（純函數）
r2/src/ui/companionSelectController.js
r2/src/ui/mapController.js
r2/src/ui/battleController.js
r2/src/ui/codexController.js
r2/docs/R2_IMPLEMENTATION_REPORT.md（本文件）
r2/docs/R2_TEST_CHECKLIST.md
r2/docs/R2_KNOWN_LIMITATIONS.md
r2/docs/R2_ASSET_REQUEST_LIST.md
```

## 3. 修改檔案

```
r2/index.html                 4 個新 panel（companionSelect/map/battle/codex）、邊界列、切換夥伴/圖鑑入口
r2/styles.css                 panel 白名單 ×2、新 UI 樣式（玻璃 token 沿用）
r2/src/app.js                 同步載入 active companion、swapCompanion、回歸問候、各 controller wiring
r2/src/state/defaultState.js  activeCompanionId / battleRecord / explorationProgress
r2/src/state/store.js         三個新欄位的 normalizer（migration 安全）
r2/src/engine/personalityProfile.js  移除寫死的 CURRENT_CREATURE_ID
r2/src/engine/actionEffectEngine.js  gentle_presence / memory_echo
r2/src/engine/traceVisualMapper.js   EMOTION_TO_KIND + 4 個 KIND_CONFIG
r2/src/engine/returnBehaviorEngine.js buildReturnGreeting
r2/src/pixi/companionRenderer.js     placeholder 參數化著色 + 元素徽記 + resize destroyed guard
r2/src/pixi/habitatTraceRenderer.js  4 個新 draw case
r2/src/ui/panelManager.js            trigger handlers map + registerCloseGuard
r2/src/ui/hudController.js           邊界語意列 + 頭像隨夥伴切換
r2/src/ui/soulTalkController.js      composer 接入（safety shield 不動）
r2/src/ui/actionSheetController.js   狀態化排序 + open_map
```

## 3.5 驗證期修復的 Bug

1. **既有重大 bug — 純中文輸入被判為雜訊**（`src/engine/emotionalSedimentationEngine.js`）：
   原 noise 判定 `/^[\d\W_]+$/` 在無 `u` flag 下，中日韓文字全部落在 `\W`，導致**任何純中文輸入都被歸類為 noise、情緒沉積系統從未觸發**。已改為 Unicode property 判定 `/^[\d_\s\p{P}\p{S}]+$/u`（僅數字/空白/標點/符號才算 noise）。修復後 5 種情緒輸入全數命中（瀏覽器實測）。
2. **新功能 bug — open_map 列被立即關閉**（`src/ui/actionSheetController.js`）：
   action row 點擊後一律 `closePanel()`，把剛由 `openMap()` 開啟的地圖面板也關掉。已改為 `open_map` 類型的列跳過關閉。

## 3.6 高推理密度引擎的審查結論

`battleEngine.js`、`explorationEngine.js`、`soulTalkComposer.js` 三檔通過純度審查：
零 DOM / 零 store / 零 timer 依賴、`rng` 可注入、回傳新物件。
設計揭露：記憶回聲需 `trust >= 3` 才觸發（關係淺時夥伴不引用過往情緒，呼應邊界精神）；
守備 buff 的生命週期為「恰好一個對方回合」（在持有者下一次行動開頭重置）。

## 4. 架構決策

1. **資料用 ES module**，不再 fetch `creatures.json`（檔案保留未刪，僅不再被 runtime 引用）。
2. **所有新 UI 走 panelManager 的 `data-panel`**，繼承 backdrop / aria / 互動封鎖。
3. **戰鬥 session 不持久化**；只有結算 patch 寫入 state（CRITICAL save）。
4. **不新增持久化陣列**：戰鬥 log 在記憶體、探索進度用 bounded `visitCounts` 物件（key 限 5 個節點 id），避開 storageGuard 不 prune 新陣列的風險。
5. **雷達圖 inline SVG**、Codex 全 DOM/CSS，無 canvas、無 reference 圖。
6. **Pixi 規範遵守**：nearest（既有 loader）、roundPixels、整數 snap、ticker 內僅 alpha pulse / 同步，無逐幀建構。

## 5. State Schema 變更（v1 內擴充，無 breaking）

新增欄位（舊存檔載入時由 `normalizeState` 補預設值，無 migration 風險）：

```js
activeCompanionId: "greyshade-cat",            // 未知 id 自動退回 greyshade-cat
battleRecord: { wins, losses, retreats, lastResult, lastBattleAt },
explorationProgress: { totalExplorations, lastNodeId, visitCounts: { [nodeId]: n } }
```

localStorage key 不變：`nexusLinkR2State:v1`。R1 key（`nexusLinkPrototypeState:v2`）未被觸碰。

## 6. Rollback 方式

所有變更未 commit。完整回滾：

```bash
git checkout -- r2/
git clean -fd r2/src/data/companionRegistry.js r2/src/data/explorationNodes.js \
  r2/src/data/enemyRegistry.js r2/src/data/soulTalkResponsePacks.js r2/src/data/evolutionLines.js \
  r2/src/engine/soulTalkComposer.js r2/src/engine/explorationEngine.js r2/src/engine/battleEngine.js \
  r2/src/ui/companionSelectController.js r2/src/ui/mapController.js r2/src/ui/battleController.js \
  r2/src/ui/codexController.js r2/docs/R2_IMPLEMENTATION_REPORT.md r2/docs/R2_TEST_CHECKLIST.md \
  r2/docs/R2_KNOWN_LIMITATIONS.md r2/docs/R2_ASSET_REQUEST_LIST.md
```

（注意：`git clean` 也會影響 Grok Build 前置的未追蹤 docs/reference，請逐檔確認後再執行；最保守做法是只 `git checkout -- r2/` 還原被修改的已追蹤檔，再手動刪除上列新檔。）

玩家端 rollback：清除瀏覽器 localStorage 的 `nexusLinkR2State:v1` 即可重置 R2 進度（不影響 R1）。

---

# 附錄：UI Polish v1-A（2026-06-11）

範圍：Glassmorphism/Game Feel token 系統 + 探索地圖視覺化。改動 3 檔，全部 `r2/**`：`styles.css`、`index.html`、`src/ui/mapController.js`。引擎（battle/exploration/soulTalkComposer）、`resolveExplorationEvent`、encounter、localStorage schema 零改動。

## A. Token 系統（styles.css `:root`）

新增 token：
- Glass：`--glass-bg` `--glass-bg-strong` `--glass-border` `--glass-highlight` `--glass-shadow` `--glass-blur-subtle(13px)` `--glass-blur(16px)` `--glass-blur-strong(22px)`
- Glow：`--glow-cyan` `--glow-gold` `--glow-purple` `--glow-danger` `--glow-calm`
- Feedback：`--feedback-bond` `--feedback-trust` `--feedback-progress` `--feedback-success` `--feedback-danger`

整併方式：既有 alias（`--bg-panel-glass / --border-glass / --filter-glass / --shadow-glass`）重新指向新 token，18 處既有使用點（含 `.glass-panel` 共用塊 styles.css:155 區）自動升級，未重複宣告。`--shadow-glass` 升級為四層（頂緣高光 / 內陰影厚度 / 微弱折射 glow / 外部深影）。

Reusable class：`.glass-subtle` `.glass-strong` `.glass-interactive`（hover 包 `@media(hover:hover)`）`.state-feedback` `.bond-glow` `.trust-glow` `.progress-glow` `.feedback-pulse`（一次性 620ms，只套小元素）`.rune-border`（四角符文角標方案，無 mask-composite、無相容性風險）。`.modal-panel/.action-sheet` 加 `::before` 頂緣 1px 高光。所有 backdrop-filter 均帶 `-webkit-` 前綴；統一 `prefers-reduced-motion` 區塊關閉常駐動畫。

## B. 探索地圖視覺化

- 列表卡片 → 「心核路徑」節點地圖：`#map-canvas`（`.soul-map.rune-border`，高 min(52vh,460px)）內含 inline SVG 光路層（`pointer-events:none`，4 條二次曲線，stroke-dash 慢速流動，→觀測點段帶 cyan→紫→紅漸層）+ 絕對定位節點層。
- 佈局（UI 常數在 mapController，資料檔不動）：營地 (50,83) 中心、步道 (22,57)、河岸 (78,61)、遺跡 (28,24)、觀測點 (74,15)。
- 節點狀態：`tone-safe/calm/discovery/danger`（eventType→tone 映射在 UI 層）、`is-visited`（visitCounts>0：實線+glow+×N 徽章）、`is-current`（lastNodeId：金色 3.2s 呼吸環）；danger 節點另有 4.4s 低頻符文微閃。
- 互動流程不變：點擊 → 既有 `exploreNode` → `resolveExplorationEvent`；新行為僅 UI 層——探索後地圖保持開啟讓玩家看到狀態變化。

## C. Game Feel 回饋

| 事件 | 回饋 | 技術 |
|---|---|---|
| 節點點擊 | 光點 ping 360ms | WAAPI 一次性 |
| 探索結算 | toast 滑入（雙語節點名 + 結果文 + 數值 chips），4.6s 自動淡出 | CSS transition |
| 遭遇敵人 | toast 轉 danger + 光路染紅（`.is-alert`）+ 650ms 後進戰鬥 | class + setTimeout |
| 能量/羈絆/信任變化 | toast chips（成功綠/羈絆紫/信任金/負值紅）+ 對應 HUD 數值 `.feedback-pulse` | CSS keyframes |
| 記憶生成 | 「＋ 留下了一段記憶」chip + 心語預覽脈動 | 同上 |
| 探索完成 | 節點金色 ring burst 700ms | WAAPI |

JS 端以 `matchMedia('(prefers-reduced-motion: reduce)')` 跳過全部 WAAPI；遭遇延遲在 reduced-motion 下為 0。

## 驗證結果（smoke check 全過）

R1 `/` 正常（key 548B 未變）；`/r2/` console 0 error；Soul Talk（含回聲）、夥伴切換、地圖 5 節點點擊、visited/current/×N（含 reload）、裂隙→戰鬥→勝場入帳、Codex 5 列、storage 僅 `nexusLinkR2State:v1`、390×844 佈局；`git status` 僅 3 個 r2 檔。修正過程中的小 bug：`.map-node-visits` 顯式 display 蓋掉 `[hidden]`（已補 `[hidden]{display:none}`）。未 commit、未 push。

---

# 附錄：White Lab — Bond Boundary Slice（2026-06-12）

範圍：r2/** 體驗層。13 個檔案修改，零新檔、零依賴、零 schema 變更、saveManager/store/pixiApp 零接觸。

## 一、戰鬥 → 心核對峙（battleEngine / battleController / index.html battle panel / styles）

- 模型：noise（雜訊濃度，取代 enemyHp）、stability（心核穩定，取代 playerHp）、sync（同步）、fatigue（對峙疲勞，回寫棲地）、boundary（邊界層數，會衰減需維護）、shards（記憶微光 0-3）。
- 四行動：共鳴（依徽章命名）／邊界／脈衝（耗 2 同步、自損）／先撤退（同排公民、無懲罰）。
- 四結局：stabilized / recovered / retreated / overwhelmed_but_safe。無 win/lose 語言；overwhelmed 文案=「牠把你拽到身後」，trust 仍 +1。
- 持久化映射回 battleRecord 三值（不改 schema）；recovered/overwhelmed 產生情緒記憶（source:"standoff"）+ 棲地痕跡。

## 二、閉環：Explore → Map → Standoff → Memory/Trace → Home Dialogue

- soulTalkComposer.buildEventReflection（純函數）+ EVENT_REFLECTION 文案池（4 結局×2 + 探索×2，{node} 插值）。
- 對峙結束 → battleController 推 companion 角色引用台詞（即時，含精確結局）。
- 探索首訪（無遭遇）→ 一句探索引用。
- 跨 session：對峙後 15 分鐘內 reload，開心語補一次引用（pageLoadedAt gate + 同句防重複）。

## 三、邊界可玩化（touchReactionEngine / interactionController / animationProfile / actionEffectEngine / hudController）

- BODY_CUE_PROFILE 資料結構（neutral/ears_back/step_back/look_away/resting/approach_softly；drift 欄位預留）。
- 觸碰結果與 blocked 結果附 bodyCue；blocked 連點播退避動畫（ears_back→look_away→step_back 漸進），拒絕不可被連點覆寫（既有 3s cooldown + blockedTouch 鏈保留）。
- 尊重沉積 evaluateRespectBonus（純函數）：拒絕後 >=25s 再互動 → trust+1、defense-2、「被尊重的距離」calm 記憶+漣漪痕跡，每 episode 一次；Care/Grow 靜靜陪伴在剛被拒絕時同等沉積（lastTouchReaction→"respected"）。觸發全為單次互動事件，與上線頻率/時長無關（無依賴偵測）。
- HUD 邊界列新增第三行 ambient 身體語言（getAmbientBodyCue 推導，無 raw 數字）。

## 四、實測（瀏覽器）

recovered（共鳴×3）/ retreated / overwhelmed_but_safe（純函數 14 回合模擬）三結局驗證；閉環引用即時+跨 session 皆中；blocked cue 序列與 respect bonus（<25s 不給、>=25s 給）純函數驗證；console 0 error；R1 黑版正常；localStorage 僅既有三 key。
