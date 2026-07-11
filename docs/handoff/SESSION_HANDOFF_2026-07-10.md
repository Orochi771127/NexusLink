# Session Handoff — 2026-07-10 深夜快照

用途:Owner 開新視窗繼續作業的完整現況。新 session 的 Claude 開工前讀本檔 +
`docs/agent/AI_EXECUTION_LEDGER.md` 對應 lane 即可無縫接手。

---

## 1. 當前狀態(git)

- `main` == `origin/main` == `a5f45da`(我方工作全部入庫)
- **工作樹有 Codex 的進行中變更**(sprite 產線:`output/character-pilots/` 檔案重組 + ledger 條目)— **不是我方遺留,勿清理、勿 add、勿 revert**
- codebase-memory 已 INDEX(10418 nodes;成長來自 Codex `5c00e81` 的 pilot 資產 checkpoint)

## 2. 產品主線進度(章節旅程 × 共鳴圈,設計文件 `docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md`)

| 包 | 狀態 |
| --- | --- |
| CH-1 對峙視覺 v1(裂隙情緒霧體) | ✅ 已出貨 |
| CH-2 初遇選角 UI(3 選 1) | ✅ 已出貨 |
| CH-3 解鎖嚴格模型(選後即唯一 + 遷移) | ✅ 已出貨 |
| CH-4 章節骨架(chapterProgress + 七區章節地圖) | ✅ 已出貨 |
| CH-5a 章節試煉接線(對峙通關 → 推進,防刷) | ✅ 已出貨 |
| CH-7 七章敘事(章引 + 專屬通關句 ×21 句) | ✅ 已出貨(待 Owner 覆核文案) |
| **佔位 ID 替換** | ⏳ **等 Codex 幼獸資產** → 另開 GROUNDWORK |
| **CH-5b 章節相遇 + 共鳴邀請** | ⏳ 等佔位替換後開工(主線最後大塊) |
| CH-6 共鳴圈對峙(三隻同場) | ⏳ 依賴 CH-5b |

同日另完成:TP-3 eval 擴充(Nuwa v0.2 節律 + persona/道歉防護 6/6)、新玩家 12 站檢測 + 3 문題全修(開場劇透/簡體字形/首痕儀式句)。

## 3. Codex 產線(平行進行,勿碰)

- 產製**新五幼獸** sprite sheets(sprigfawn 芽角小鹿/starstripe-cub 星紋小虎/auriowl 金羽小梟/blazetail-kit 焰尾小狐/crystalfin-seahorse 晶鰭小海馬)— 設計文件 §4 2026-07-10 修訂
- Blazetail seed gate 已過(Owner OK),touch_accept pilot 在重組中
- **邊界**:`output/character-pilots/**`、`docs/art/**`、`heartsparkCouncilCanon.js` = Codex 領域;`chapterRegistry.js` 的 companionId 是**技術佔位**,不得基於它開發相遇功能

## 4. 等 Owner 的覆核/決策清單

1. **章節試煉規則**:當前章對峙以「穩住/回收」結束=通關(AI 定案,可改為指定節點/敵人)
2. **21 句章節敘事**(`src/data/chapterNarrative.js`:章引/通關句/夥伴句 ×7 章)
3. **TP-3 節律 fixtures** 四句輸入 + 初遇三句/CH-2 文案(若尚未覆核)
4. **真機人類 gates**(未變):三平台完整走一輪(三契約→選角→首輪→對峙→地圖)、SFX 音色聽感、3 測試者私測、法務/商店文案

## 5. 新 session 開工提示

- 我的持久記憶會自動載入(含全部操作知識);repo 內必讀:本檔 → ledger 對應 lane → `NEXT_AI_TASK_PACK_QUEUE.md`
- 工作流慣例:任務完成 → 自我審查 → COMMIT → PUSH → INDEX(Owner 逐輪指示制)
- 常用驗證:live gate `NEXUS_QA_BASE=http://localhost:8128 python docs/qa/_run_live_playtest_gate.py`(需 `PYTHONIOENCODING=utf-8`);部分 runner 硬編 5173(`python -m http.server 5173 --bind 127.0.0.1` 臨時起);preview 的 JS/CSS 快取要 `fetch(url,{cache:'reload'})` + stylesheet href bust
- 已知 flaky:`null.split` pageerror 偶現於 gate 首跑(重跑即淨;runner 已捕捉 stack,下次再現可直接定位)

## 6. 建議的下一步(依序)

1. Codex 幼獸資產齊 → **佔位 ID 替換 GROUNDWORK**(chapterRegistry + registry + migration)
2. **CH-5b**:章節相遇 + 共鳴邀請(意願判定引擎:讀該章 bond/trust 增量 + 邊界尊重紀錄;設計文件 §5)
3. CH-6 共鳴圈對峙;eval 側:多語 fixtures(EN/sc/jp 的 safety/boundary 路由)
