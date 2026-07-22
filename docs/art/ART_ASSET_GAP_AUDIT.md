# 美術資產缺口稽核（Art Asset Gap Audit）

> 日期：2026-07-12 ・ 最後棲地現況更新：2026-07-14 ・ 夥伴 runtime 現況補正：2026-07-22 ・ 稽核者：Claude Fable 5 ・ 原始稽核對象 commit：`6e50ab6`（五幼獸資產升級後）+ CH-5b working tree；月湖現況另見 `docs/art/ART_PRODUCTION_INDEX.json` → `habitats[HAB-MOONLAKE-V3]`
> 目的：盤點「缺哪些、缺多少美術圖」，並寫清楚**每一項要怎麼生成才能 drop-in 使用**，供 Owner 指派 Codex 產圖。
> 一句話結論：**目前 runtime 沒有任何「壞掉／缺圖」的硬缺口**——registry 內 16 隻夥伴的 Stage-1 動畫 manifest 都已就緒；灰影貓有 34 個 animation entries，其餘 15 隻各有 29 個。月湖可玩棲地已升至 `MoonlakeVivarium_v3`（含 v5 增量層）。以下缺口都是**路線圖／畫質升級**性質（設計文件已規劃、尚未接線），可依優先序分批生成。

---

## 0. 現況盤點（已完成，勿重做）

| 類別 | 現況 | 位置 |
| --- | --- | --- |
| 夥伴 Stage-1 動畫 | **16 隻 runtime 夥伴皆有正式 manifest**；灰影貓 34 entries，其餘 15 隻各 29 個 512×512 frame 動作 | `assets/characters/{id}/**` + `metadata/animations.json` |
| — 灰影貓 | 373 png（含 legacy 64px + 立繪 + icon + qc）| `assets/characters/greyshade-cat/` |
| — 正式心輝五席 + 正式黑鐵五席 + 5 測試載體 | 各 29 張八幀 sheet；每席另有自己的 portrait／metadata | 同上 |
| 月湖可玩棲地 | **MoonlakeVivarium_v3 runtime 已接線（本機）**：日/夜 full-bleed 背景 + 魔法陣平台 + lantern/arch/campfire/crystal；**新增** `camp_structures` + `foreground_occlusion` 增量層。日/月 celestial 仍沿用 LakeNightCamp_v2。 | `assets/backgrounds|platforms|props|layers/MoonlakeVivarium_v3/`；索引見 `ART_PRODUCTION_INDEX.json` → `habitats[HAB-MOONLAKE-V3]` |
| — 月湖仍缺（非硬缺口） | sky/mountains/lake/ground **分層視差板仍 baked 在 day/night**；天氣／晨昏＝程式 FX，**不需專用美術板**；`assets/layers/` 與層接線**可能尚未 commit**（本機已存在並已接線） | 見 INDEX `habitats[].gaps` |
| 七區世界地圖遠景 | 7 張區域 JPG（atlas 遠景底圖）+ 世界圖 | `assets/backgrounds/linkara/regions/*.jpg` |
| 裂隙敵人 | **runtime 已晉升剪影 PNG**（程序霧體保留為 fallback）| `assets/enemies/{enemyId}/` + GAP-1 `generated` |
| 圖鑑視覺 | **程序生成**（能力雷達 SVG + 徽記/演化文字），非圖檔 | `codexController.js` |

> 換句話說：**夥伴本體圖 = 完成**；**月湖近景棲地 = 完成（本機接線，層檔 commit 狀態另記）**；仍缺的是（1）夥伴進化型態的圖（GAP-2）、（2）各章可玩棲地的近景背景（GAP-3，工程未接區域切換）。裂隙剪影 GAP-1 已 generated／runtime-promoted，勿重做。

---

## 1. 生成規格（drop-in 合約）—— 所有夥伴類 spritesheet 必守

Codex 產出的夥伴／進化型態 sheet 若要「不改程式即可用」，必須完全符合既有 pipeline（來源：`assetManifest.js` 的 `ILLUSTRATED_COMPANION_RUNTIME_POLICY`、`CLAUDE.md §4 Companion 美術規格`、實測 `sprigfawn/metadata/animations.json`）：

- **母版**：每格 `512×512 px`，透明 PNG，乾淨角色本體（不可 baked 白底 / UI / 文字 / 場景 / 展示台）。
- **anchor**：bottom-center，概念 `{x:0.5, y:1}`。
- **grid 必整除**：`sheet_width/columns` 與 `sheet_height/rows` 皆為整數；frameCount→grid：`3f=1×3`、`4f=2×2`、`6f=2×3`、`8f=2×4`。任一邊 `≤ 4096`。
- **檔名**：`{companionId}_{animId}_512x512_{N}f.png`，放在對應 category 子目錄（`emotion/ movement/ touch/ daily/ battle/`）。
- **⚠ 詞彙對映（最易錯）**：manifest 的 **key 用 runtime 詞彙**，不是檔名的 guardian 詞彙。特別是 `faint` 圖，其 manifest key 必須是 **`defeated`**（`{id}_faint_512x512_6f.png` ← key `"defeated"`）。對映錯不會 crash，會**靜默 fallback 到 idle_calm**。其餘同構：走路 key 用 `right_walk`/`left_walk`。
- **sampling**：linear + mipmaps（由 runtime 設定，產圖端只要交乾淨 512 母版）。

### 一隻夥伴 = 29 動作（category / frameCount）

| category | animId（frameCount） |
| --- | --- |
| emotion（12）| idle_calm(8) idle_happy(8) idle_angry(6) idle_sad(6) idle_defensive(8) blink(3) idle_sick(8) idle_distant(8) idle_enjoy(8) idle_wake(8) special_angry(6) special_sad(6) |
| movement（2）| right_walk(8) left_walk(8) |
| touch（4）| touch_accept(6) touch_guarded(6) touch_reject(6) hug(6) |
| daily（5）| sit(6) sleep(8) idle_dance(8) idle_wash(8) special_dance(8) |
| battle（6）| attack_basic(6) skill_cast(8) defend(6) hit(4) **defeated←faint 檔(6)** victory(8) |

> 每隻附一份 `metadata/animations.json`（29 條目，格式照 `sprigfawn` 那份逐鍵複製、換 id 與路徑即可）。

---

## 2. 缺口清單（每項：缺什麼 / 缺多少 / 怎麼生成 / 需要的接線 / 優先序）

### GAP-1 ─ 裂隙敵人剪影（設計文件 §7 v2）★最推薦先做

- **缺什麼**：10 種裂隙敵人目前是程序霧體；設計 §7 v2 明列「十隻裂隙實體的剪影美術（512 規格）替換程序霧體核心」。
- **缺多少**：**10 張**（每敵一張）。若要呼吸感可各做 6f loop（→10 sheet）；靜態則 10 張單圖。
- **清單（emotion tint 已定，配色沿用 battleEngine 五行心相）**：
  | enemyId | 名稱 | emotion |
  | --- | --- | --- |
  | static_wisp | 雜訊殘影 | sadness 低鳴 |
  | tearveil_wisp | 淚幕殘影 | sadness 低鳴 |
  | crystal_golemite | 晶屑魔像 | anger 沉怒 |
  | spite_ember | 慍火殘影 | anger 沉怒 |
  | rift_shade | 裂隙暗影 | anxiety 迷茫 |
  | dread_coil | 纏懼暗影 | anxiety 迷茫 |
  | weary_husk | 倦怠殘殼 | fatigue 倦怠 |
  | sink_weight | 沉墜殘殼 | fatigue 倦怠 |
  | hollow_echo | 空鳴回響 | loneliness 孤鳴 |
  | drift_murmur | 飄鳴回響 | loneliness 孤鳴 |
- **怎麼生成**：512×512 透明 PNG，剪影／半透明霧體風（非寫實生物），情緒色調對齊該敵 emotion；bottom-center anchor；命名建議 `assets/enemies/{enemyId}/{enemyId}_idle_512x512_{N}f.png` + 一份小 manifest（或併入既有敵人資料）。**風格錨點**：延續現行程序霧體的「外霧／內核／雜訊紋」三層感，不要畫成有臉的怪物（會破壞「情緒污染而非敵人」的敘事）。
- **需要的接線（產圖後由工程做，非美術）**：`battleController` 的 rift 圖層目前吃 `RIFT_EMOTION_TINT`（程序）；要新增「若該 enemyId 有 sprite 則貼圖、否則回退程序」的分支。**產圖不阻塞、可先入庫**。
- **優先序**：**高**。範圍最小最明確、戰鬥畫面收益最大、設計文件已點名。

### GAP-2 ─ 夥伴進化型態（Stage-2／Stage-3）

- **缺什麼**：canon（`heartsparkCouncilCanon.js` 三階名 / `evolutionLines.js` 三階文字）已定，但**進化只在圖鑑以文字呈現**（`codexController.buildEvolutionStrip` 純文字 chip），棲地永遠顯示 Stage-1，**無任何進化型態圖**。
- **缺多少（依採用範圍）**：
  - 核心陣容（正式五幼獸 + 灰影貓）= **12 個進化型態**（6 隻 × 2 階）。
  - 含 5 測試載體 = **22 個進化型態**。
  - 每個型態的「完整度」二選一：
    - **MVP（建議先走）**：每型態只做 `idle_calm` 一張 8f loop（讓棲地能顯示進化樣貌）→ 核心 **12 張** / 全量 22 張。
    - **完整**：每型態一整套 29 動作 → 核心 12×29 = **348 sheet** / 全量 22×29 = 638 sheet（龐大，不建議一次做）。
- **怎麼生成**：同 §1 規格；型態外觀依 canon 三階描述演進（如金羽小梟 stage2 輝羽梟衛 / stage3 聖輝梟曜）。命名沿用 `{companionId}` 但需決定型態如何分目錄（建議 `assets/characters/{id}/evolutions/stage2/**` + 各自 manifest）。
- **需要的接線（先於美術的決策）**：目前 `companionRenderer` 不會依 bond 換 stage sheet——**要先做「進化視覺切換」這個功能**（讀 bond 門檻選 stage manifest）才有地方掛圖。**故本項需先有工程/設計拍板，才適合大量產圖。**
- **相關內容債（非美術，但同源）**：正式五幼獸的 `evolutionLineId`（sprigfawn-line 等）在 `EVOLUTION_LINES` **無對應資料** → 圖鑑顯示「演化資料整備中。」。要先補這 5 條演化線**文字**（canon 已有三階名，補 lore + bondThreshold），圖鑑才完整；此為文字工作，可與美術並行。
- **優先序**：**中**。需先接線／拍板；建議先補文字演化線，美術走 MVP（12 張 idle）驗證視覺切換後再擴。

### GAP-3 ─ 各章可玩棲地近景背景（章 2–7）

- **缺什麼**：只有月湖有「可玩棲地」近景美術（現況：`MoonlakeVivarium_v3` 日/夜背景 + 平台 + props + v5 增量層；見 INDEX `habitats[HAB-MOONLAKE-V3]`）。其餘 6 區只有 atlas **遠景 JPG**，沒有等價的近景可玩棲地。
- **缺多少**：6 區 × {日背景, 夜背景} = **12 張背景**（最小）；若各區要專屬平台/道具，另計（月湖基準：1 平台 + 4 props + 2 增量層）。
- **怎麼生成**：對齊 `MoonlakeVivarium_v3` 規格（分層 PNG：`bg_day_base` / `bg_night_base` + 選用 `magic_circle` 平台 + props；增量層可選 `camp_structures` / `foreground_occlusion`）；賽博道教美學、月光/湖畔/魔法陣語彙；每區依 riftEmotion 主題調色（平原孤獨、熔爐沉怒…）。命名 `assets/backgrounds/{Region}_v1/bg_{day|night}_base.png`。**不要**為月湖重做已存在的 v3 資產；sky/mountains/lake/ground 分層視差屬升級項、非 GAP-3 範圍。
- **需要的接線**：目前遊戲**恆在月湖棲地**，章節以 map→對峙 overlay 呈現，**未實作「進入該區換棲地背景」**。要先做區域棲地切換才掛得上。
- **優先序**：**低**。功能未接線、範圍大；商業版擴充再做。atlas 遠景 JPG 已足夠支撐目前的「你走到哪」敘事。月湖本身已就緒，勿與 GAP-3 混算。

---

## 3. 總量速算

| 缺口 | 立即可產（drop-in，不需先接線） | 需先接線/拍板才適合大量產 |
| --- | --- | --- |
| GAP-1 裂隙剪影 | ~~10 張~~ **已 generated + runtime-promoted（勿重做）** | — |
| GAP-2 進化型態 | — | 12（MVP idle）～ 638（全量） |
| GAP-3 區域棲地 | — | 12+ 背景（月湖本身已就緒，見 INDEX `habitats`） |

> **建議**：勿重做 GAP-1 或月湖 v3。下一美術決策點在 GAP-2（需進化視覺切換接線＋Owner 範圍拍板）與 GAP-3（需區域棲地切換）。月湖視差分層屬可選升級，非硬缺口。

---

## 4. 自我審查（Self-review）

- ✅ **「缺圖是否會 crash」**：不會。`ASSET_MANIFEST.characters` 與 `RUNTIME_COMPANION_ASSET_KEYS` 現在涵蓋全部 16 隻 runtime 夥伴；正式心輝五席與正式黑鐵五席各自的 145 張 sheet 都已納入 repo-native asset-integrity gate。角色渲染仍以 `companionRegistry.animationsManifest` 指向各自 metadata，不借用其他角色資產；先前「只有 6 keys／五幼獸未入 manifest」的 QA 覆蓋缺口已關閉。
- ✅ **敵人清單交叉核對**：`enemyRegistry.js` 恰 10 敵，emotion 標籤 5 類各 2，與 GAP-1 表一致；章節 rift 節點 enemyPool 已在 CH-5b 按情緒配對。
- ✅ **規格來源三方一致**：`ILLUSTRATED_COMPANION_RUNTIME_POLICY`（512/anchor/maxEdge/grid-exact）＝ `CLAUDE.md §4` ＝ 實測 sprigfawn manifest；`defeated←faint` 對映經 CH-5b 對峙結算路徑實證消費。
- ✅ **不重複計數**：Stage-1（已完成）未計入缺口；atlas 遠景 JPG（已存在）不與 GAP-3 近景背景混算。
- ⚠ **待 Owner 決策**：GAP-2 採「核心 12 vs 全量 22」與「MVP idle vs 完整 29 套」；GAP-2/3 的接線功能是否本階段做。這些非美術能單獨解決，需產品拍板。

---

## 5. 給接手者 / Codex 的最短路徑

**機讀生產索引：`docs/art/ART_PRODUCTION_INDEX.json`**（Codex 直接讀這份逐項產圖；GAP-1 已 `status:"generated"` 且 runtime-promoted、GAP-2/3 `status:"blocked"`；月湖棲地現況在 `habitats[]`，不是產圖佇列）。索引的敵人 name/flavor/emotion 由 `enemyRegistry.js` **程序生成、逐字對齊**（勿手改，registry 變了就重生）。

1. 讀 `ART_PRODUCTION_INDEX.json`，先看 `habitats[]`（月湖已就緒則勿重產），再迭代 `batches[].status=="ready"` 的 `items[]`。
2. 每項產 **1 張 512×512 透明 PNG**（`frameCount:1`，剪影霧體風、無臉、情緒配色見 `emotionTints`），寫到 `item.output.stagingPath`（`output/` 工作區，**勿直接寫 `assets/**`**——GROUNDWORK，晉升是另一步 Owner 核可）。
3. 交回後由工程加 rift sprite 圖層分支（`targetAssetPath` 依 enemyId 貼圖，回退程序霧體）。（GAP-1 已完成此步，僅作歷史流程參考。）
4. GAP-2/3 待 Owner 對「範圍 + 是否接線」拍板後才改 `status:"ready"`。
