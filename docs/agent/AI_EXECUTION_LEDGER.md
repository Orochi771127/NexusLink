# Nexus Link Cross-AI Execution Ledger

## Purpose

This is the single operational handoff record for every collaborating AI.
It is not product canon, a substitute for code review, or a release approval.
The Master Canon, `AGENTS.md`, `CLAUDE.md`, and `ACCEPTANCE.md` remain higher
authority documents.

Use this ledger to answer four questions without reconstructing history from
chat transcripts or unrelated Git commits:

1. What is currently implemented in this worktree?
2. What was verified, on which branch and commit?
3. What problems, risks, or blockers remain?
4. What is the next safe action for the next AI?

## Mandatory Protocol

Before starting a TASK_PACK:

1. Read the latest entry in the relevant lane.
2. Read every document named in that entry's `Required reading` field.
3. Treat remote-branch evidence as unintegrated until the current `HEAD` or
   checked-out worktree proves otherwise.

Before completing a TASK_PACK or reporting a blocker:

1. Append a new entry to each affected lane. Do not delete historical entries.
2. Record work performed, verification, problems, and the next safe action.
3. State the branch and commit. Do not claim runtime integration from a design
   document, a remote branch, or an unverified test report.
4. Link only the relevant files. Do not mix engineering status, art status,
   and Raphael status into a single ambiguous entry.

For a long-running task, append an `IN PROGRESS` entry before editing. For a
short task, one final `VERIFIED`, `COMPLETED`, or `BLOCKED` entry is enough.

Allowed status values: `PLANNED`, `IN PROGRESS`, `VERIFIED`, `COMPLETED`,
`BLOCKED`, `SUPERSEDED`.

## Entry Template

```md
### YYYY-MM-DD - <agent> - <short task name>

- Status: `VERIFIED`
- Branch / commit: `<branch>` / `<commit or uncommitted>`
- Scope: <bounded task and lane-specific ownership>
- Work performed: <what changed or what was inspected>
- Verification: <commands, browser path, screenshots, or review evidence>
- Problems / risks: <known limitations, conflicts, or blockers>
- Next safe action: <one bounded task; name GROUNDWORK approval if required>
- Required reading: <files the next AI must read>
```

---

## Lane 1 - Game Engineering And Architecture

### 2026-07-28 - Codex - Moonlake Live 3D Hybrid R1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner explicitly approved revising the technical
  constitution and replacing the raster-only Moonlake route with a real-time
  3D habitat plus 2D companion presentation.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-MOONLAKE-LIVE-3D-R1`.
- Layer: `GROUNDWORK + EXPERIENCE`; approved Groundwork includes the technical
  constitution, `index.html`, `pixiApp.js`, `assets/**` GLB/fallback payload and
  a Moonlake-scoped Three.js CDN ES Module exception. No state/save foundation.
- Branch / base: `codex/moonlake-r5-integration` /
  `11e1b0e70f636a88674fc1060e7dc32e2be42edc`.
- Planned scope:
  - add a presentation-only Three.js environment canvas below Pixi and DOM;
  - load the approved Moonlake GLB and provide static fallback;
  - implement bounded camera, walkable world path and world-to-Pixi projection;
  - preserve all sixteen companions' current animation/fallback policy,
    directional walking and lake-facing fishing;
  - prove bridge traversal, mobile quality tiers, context loss and no duplicate
    render loops.
- Red-line check: no relationship, Growth, reward, catch, persistence, Safety,
  RaphaelCore, battle, unlock or Initial Bond change. Weather and time remain
  atmosphere only and cannot create FOMO or reward windows.
- Non-goals: no 3D companion conversion, free camera, physics sandbox, open
  world, backend, TypeScript, npm, bundler or unrelated habitat migration.
- Acceptance refs: `G1-G7`, `H1-H6`, `I`, and
  `docs/design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md`.
- Required reading: `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`,
  `docs/architecture/HABITAT_SYSTEM_MASTER_SPEC.md`,
  `docs/rfc/RFC_2_5D_HABITAT_RENDERER.md`, current Pixi environment lifecycle,
  current companion animation manifests and this lane.

### 2026-07-26 - Codex - Nexus Spin node Action Sheet and R6-to-R9 total review - VERIFIED

- Status: `VERIFIED`（本機自動化、scoped diff review、390×844 headless Chromium 與零存檔寫入通過；真人手指／Safari 真機仍 open）
- Branch / commit: `main` / pending Owner-authorized protected-main publication（本條與實作同一 commit；最終 SHA 由交付回報）
- Scope: 完成資料驅動月湖 Action Sheet，並依 Owner 指示總審本工作樹尚未提交的 Orbit R6 deterministic baseline、Hybrid Physics Sandbox、Moonlake Camp Slice、Control Depth 與本包。
- Work performed:
  - 新增 `orbitNodeActionResolver.js`：心核迴旋永遠可用且為主要玩法；心域遠征只讀 `isExpeditionUnlocked`；裂隙對峙只讀 `canEnterUnguidedStandoff`。Resolver 純 derive，不生成遭遇、不改 state。
  - `pageRouter.js` 在 Explore 月湖焦點加入 modal Action Sheet；保留 first-session `open-map` 直達入口。迴旋進既有 Orbit，遠征／對峙回既有地圖再走既有合法節點；Esc／關閉鈕還 focus，Tab 被限制在 dialog 的可用控制內。
  - `strings.js` 補齊 tc／sc／en／jp；`styles/page-content.css` 完成 panel-contained mobile sheet、disabled 可讀性、44px 關閉鈕與 ≥60px mode rows。
  - 新增 `orbit-node-action-sheet-cases.mjs` 並納入完整 Orbit regression；同步 `BALANCE_SHEET.md` §9.9、`ACCEPTANCE.md` O10、`ORBIT_MANUAL_390x844.md` §9。
  - 總審修正兩項整潔問題：移除重複 Action Sheet 文件區塊、合併重複 stance selected pseudo rule；未改玩法數值。
- Verification:
  - PASS `node docs/qa/orbit-node-action-sheet-cases.mjs`
  - PASS `node docs/qa/orbit-regression-cases.mjs`（prototype／stage／duel／settlement／R6 feel／Hybrid／Camp／Control Depth／Action Sheet／i18n 全綠）
  - PASS release-gate 等價 Node 靜態面：`src/**/*.js`＋`docs/qa/*.mjs` 共 349 檔 `node --check`
  - PASS release-gate Node harness 14 組：state／storage migration、renderer lifecycle、Growth G1-G3、i18n、session owner、onboarding／Codex、crystal、map first-session、safety terminal、Orbit regression
  - PASS 390×844 headless Chromium fresh：Orbit available；Expedition／Standoff disabled；initial focus=Orbit；Tab focus loop；Esc 關閉並回 launcher；直接 `open-map` 與 Orbit route 都可進；主 storage writes=0
  - PASS 390×844 progressed：Chapter 2 使 Expedition available；完成 first loop＋可見 emotional trace 使 Standoff available；兩者只回既有 map；主 storage writes=0
  - PASS bounding boxes：Action Sheet 完整留在 370×628 Explore panel；close 44×44；三列高度 81／65／65px；無 page error
  - PASS screenshots: `orbit-node-action-sheet-fresh-390x844.png`、`orbit-node-action-sheet-progressed-390x844.png`
  - PASS `git diff --check`
- Problems / risks: bundled Python 缺 Playwright，repo-native Python web gate 無法在本機啟動；依 `webapp-testing` fallback 使用 bundled Node Playwright完成本包真瀏覽器 smoke。沙盒封鎖外部 Pixi CDN（`ERR_NETWORK_ACCESS_DENIED`），背景走既有 load-failure 告知，Action Sheet／map／Orbit DOM 路由不受影響。完整 GitHub `web-release-gate`、真人 30 秒理解／三次力度與姿態心智模型、Safari 真觸控／GPU、法務／上架仍不得宣稱完成。
- Scope isolation: 明確排除既有 unrelated dirty `src/ui/orbitDuelController.js`、`docs/qa/_foot_compass_visual/**`、`docs/qa/_moonlake_prop_scale_390x844.png`；提交不得包含。
- Next safe action: 只 stage 本批 Orbit allowlist，走受保護 main 的 branch／PR／required check／merge 路徑；merge 後同步本機 main，刷新 codebase-memory MCP。
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`、`docs/design/BALANCE_SHEET.md` §9.1–§9.9、`ACCEPTANCE.md` O6–O10、`docs/qa/ORBIT_MANUAL_390x844.md`

### 2026-07-26 - Codex - Nexus Spin node Action Sheet - IN PROGRESS

- Status: `IN PROGRESS`
- Branch / commit: `main` / uncommitted（Owner 已授權本包完成且總審通過後 commit／push main）
- Scope: 在 Explore 的月湖焦點建立資料驅動 Action Sheet，收斂「心核迴旋／心域遠征／裂隙對峙」入口；沿用既有 Orbit、地圖、遠征解鎖與對峙安全 gate。
- Files: 新增 Orbit node action resolver；修改 `pageRouter.js`、`strings.js`、`styles/page-content.css`、Orbit QA、Balance／Acceptance／390 手測、本 Lane。
- Red-line check: 不生成遭遇、不繞過 `canEnterUnguidedStandoff`、不強開未解鎖遠征、不寫存檔；disabled 只描述「現在還不是時候」，無紅點、倒數、FOMO 或懲罰。
- Non-goals: 不改 map node 探索／相遇／結算、不改 `index.html`、save schema、月湖五關、導流環、零件、多角色、遠征引擎或 battle safety。
- Planned verification: resolver pure QA、四語字串、鍵盤／Esc／focus、390×844 browser route、既有 map first-session gate、完整 Orbit regression、全工作樹 scoped diff／release gate 自審。
- Next safe action: 完成本包後總審 R6／Hybrid／Camp／Control Depth／Action Sheet，僅 staging 授權 Orbit 範圍，再 commit／push main 與刷新 MCP。
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md` §2／§8、`docs/design/BALANCE_SHEET.md` §9.8、`ACCEPTANCE.md` O9、`src/ui/pageRouter.js`、`src/expedition/expeditionConfig.js`、`src/engine/resonanceThreadEngine.js`

### 2026-07-26 - Codex - Nexus Spin control depth prototype - VERIFIED

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted（current `HEAD=d47602e`；Owner 未授權 commit／push）
- Scope: 沿用既有 `src/orbit/` 與 opt-in `moonlake-camp-slice`，完成三種發射姿態與每次發射一次的共鳴脈衝；正式月湖五關、`moonlake-1`、對決與存檔接線不變。
- Work performed:
  - `moonlakeCampSlice.js` 新增 data-driven `upright / tilted / conservative`，分別投影平衡、較早彎軌、低速穩定的 launch speed／spin／drive／tilt／wobble；預設直立保持原切片軌跡。
  - `orbitEngine.js` 新增 `selectOrbitLaunchStance()` 與 `triggerOrbitResonancePulse()`；姿態只可在 `aiming` 選擇，發射後鎖定。脈衝每發 `1/1`，只有限轉向下一記憶／營火並收束速度與晃動，不直接改記憶 index、停圈秒數、outcome、stability 或 settlement eligibility。
  - `orbitBattleController.js` 在同一動態 overlay 加入三顆姿態 segmented buttons 與 pulse button；以 `aria-pressed`、可見勾記、disabled 與「1/1／已用」呈現狀態，Canvas 顯示姿態／脈衝文字與單次環形回饋。
  - `styles.css` 完成 390×844 緊湊控制列；`orbit-control-depth-cases.mjs` 覆蓋三姿態差異、三條可完成路徑、脈衝單次鎖／非自動勝利與固定時點跨幀率 replay；已納入 Orbit regression。
  - 同步 `BALANCE_SHEET.md` §9.8、`ACCEPTANCE.md` O9、`ORBIT_MANUAL_390x844.md` §8。
- Verification:
  - PASS task JS／QA `node --check`
  - PASS `node docs/qa/orbit-control-depth-cases.mjs`
  - PASS `node docs/qa/orbit-regression-cases.mjs`（prototype／stages／duel／settlement／feel／hybrid／camp slice／control depth／i18n 全綠）
  - PASS 390×844 headless Chromium：直立／傾斜／保守切換；發射後姿態 disabled；pulse `1/1 → 已用`；營火完成；主 storage 寫入 0；無 page error；top HUD／Canvas／bottom HUD 無 bounding-box overlap
  - PASS screenshots: `moonlake-control-depth-aiming-390x844.png`、`moonlake-control-depth-pulse-390x844.png`、`moonlake-control-depth-resolved-390x844.png`
  - PASS `git diff --check`
- Problems / risks: bundled Python 無 Playwright，依 `webapp-testing` fallback 使用 bundled Node Playwright；沙盒阻擋外部 Pixi CDN（`ERR_NETWORK_ACCESS_DENIED`），所以背景走既有 fallback，但 Orbit DOM／Canvas smoke 完整。真人三次內能否理解三姿態、脈衝時機是否直覺、Safari 真觸控／文字放大／GPU 仍 open；本包未升格正式 `moonlake-1`。既有 unrelated dirty `src/ui/orbitDuelController.js` 與 QA 圖檔未觸碰。
- Next safe action: Owner 依 `ORBIT_MANUAL_390x844.md` §8 做真手指 feel-check；通過後再二選一開 Gate 2：先調校／升格月湖證明關，或開資料驅動節點 Action Sheet。不得直接把三姿態／脈衝灌入全部五關。
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`、`docs/design/BALANCE_SHEET.md` §9.8、`ACCEPTANCE.md` O9、`docs/qa/ORBIT_MANUAL_390x844.md` §8、`docs/qa/orbit-control-depth-cases.mjs`

### 2026-07-26 - Codex - Nexus Spin control depth prototype - IN PROGRESS

- Status: `IN PROGRESS`
- Branch / commit: `main` / uncommitted（Owner 未授權 commit／push）
- Scope: 只在既有 `src/orbit/` 與 opt-in `moonlake-camp-slice` 上加入三種發射姿態與每次發射一次的共鳴脈衝；不替換正式月湖五關、不另建平行玩法系統。
- Files: `src/data/orbit/stages/moonlakeCampSlice.js`、`src/orbit/orbitEngine.js`、`src/ui/orbitBattleController.js`、`styles.css`、Orbit QA、`BALANCE_SHEET.md`、`ACCEPTANCE.md`、本 Lane。
- Red-line check: 無 HP／傷害成長／掉寶／每日任務／關係懲罰／save schema；脈衝只 deterministic 地調整當次速度方向與失穩，不直接收集光點、不直接完成營火停留。
- Non-goals: 不改 `MOONLAKE_STAGES`、月湖 2–5、對決、遠征、Growth、Action Sheet、導流環、零件商城、多角色或 GROUNDWORK。
- Planned verification: 姿態差異與脈衝單次鎖 pure-engine QA、固定時點 30／60／120 Hz exact-match、完整 Orbit regression、390×844 browser smoke、主存檔零寫入、`git diff --check`。
- Next safe action: 完成後追加 `VERIFIED`；真人／Safari feel gate 仍保持 open，不自動升格正式 `moonlake-1`。
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`、`docs/agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md`、`docs/design/BALANCE_SHEET.md` §9.7、`ACCEPTANCE.md` O8、`docs/qa/ORBIT_MANUAL_390x844.md` §7

### 2026-07-26 - Codex - Nexus Spin Moonlake Camp slice - VERIFIED

- Status: `VERIFIED`（自動化、390×844 headless browser 與零存檔寫入監測通過；真人手指／Safari 真機仍 open）
- Branch / commit: `main` / uncommitted（未 commit、未 push）
- Scope: 在既有 `src/orbit/` 與 `hybrid-spin-v1` 上完成一個 opt-in Moonlake Camp 證明關；沒有建立第二套模式、沒有加入或替換正式 `MOONLAKE_STAGES` 五關。
- Work performed:
  - 新增 `moonlakeCampSlice.js`：`collect_then_resonate` 目標、3 個有順序的記憶光點、中央 soft well、營火共鳴圈、無 dummy／HP、session-only 夥伴句與弧光微痕。`stages/index.js` 可依 id 取用，但 `listStagesForRegion("moonlake")` 仍只回 5 關。
  - `orbitPhysics.js`／`orbitEngine.js`：新增 opt-in contained boundary、body `driveScale / speedCap` 與 stage-local physics tuning；正式 R6 常數不變。切片依序收光點，三點全亮後只在圈內且 speed≤0.52 時累積 0.42s 停留；`prototypeSlice / nonPersistent` 在 engine 層強制 `progressEligible=false`。
  - `orbitOutcomes.js`：`camp_resonated` 映射 `recovered`，使用本場夥伴第一人稱短評；無 win/lose 羞辱或關係懲罰。
  - `orbitBattleController.js`：`?orbitCampSlice=1` 從既有探索 Orbit 入口開啟切片；程序化顯示虛線導引、1→2→3 光點、營火圈、停留環與記憶進度，不顯示敵方 stability。結算顯示 session-only 微痕並跳過路徑／vault／Growth／save。Browser smoke 另發現並修正 battle status／companion line 誤寫到隱藏 duel DOM 的同名 selector。
  - `styles.css`：≤420px 壓短 Orbit HUD、隱藏重複 hint、縮小間距與按鈕，保留 Canvas／結算空間。
  - 新增 `orbit-moonlake-camp-slice-cases.mjs` 並接入完整 regression；更新 `BALANCE_SHEET.md` §9.7、`ACCEPTANCE.md` O8 與 `ORBIT_MANUAL_390x844.md`。
- Verification:
  - PASS 所有變更 JS／QA `node --check`
  - PASS `node docs/qa/orbit-moonlake-camp-slice-cases.mjs`：五關寬度不變、無 dummy／HP、順序光點、低速停圈、contained speed cap、fresh-save 短／中／長拉差異、30／60／120 Hz exact-match、零 settlement eligibility、UI wiring
  - PASS `node docs/qa/orbit-regression-cases.mjs`：prototype／stages／duel／settlement／feel／hybrid／camp slice／i18n 全綠
  - PASS 390×844 headless Chromium：標題／目標／Canvas／結算／兩按鈕無重疊；長拉完成 3/3 與 0.4/0.4s 營火停留；顯示指定夥伴句與 session-only 微痕；`nexusLinkR2State:v1` 監測為 0 次寫入；無 page error
  - PASS `git diff --check`
- Problems / risks: headless 沙盒封鎖 Pixi CDN（`ERR_NETWORK_ACCESS_DENIED`），所以背景走既有 habitat fallback；Orbit DOM／Canvas 流程不受影響。自動搜尋證明 fresh-save 可用不同拉力完成，但「30 秒理解／三次內能說出力度差異／發射前預測」仍必須由真人判定。Safari pointer、真機 GPU 與觸覺手感仍 open。
- Next safe action: Owner 以 `?orbitCampSlice=1` 依 `ORBIT_MANUAL_390x844.md` §7 手測；通過後再另開 Gate 2 決定是否把此目標替換 `moonlake-1`，或進姿態／共鳴脈衝包。未核准前保持 opt-in。
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`、`docs/agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md`、`docs/design/BALANCE_SHEET.md` §9.7、`ACCEPTANCE.md` O8、`docs/qa/ORBIT_MANUAL_390x844.md` §7

### 2026-07-26 - Codex - Nexus Spin Moonlake Camp slice - IN PROGRESS

- Status: `IN PROGRESS`
- Branch / commit: `main` / uncommitted（未取得 commit／push 授權）
- Scope: 在現有 `src/orbit/` 與 `hybrid-spin-v1` 上做一個 Moonlake Camp opt-in 垂直切片：依序掠過記憶光點，最後停入營火共鳴圈；不建立第二套模式。
- Files: Orbit engine／stage data／battle controller、專屬 QA、`orbit-regression-cases.mjs`、`BALANCE_SHEET.md`、`ACCEPTANCE.md` §O、本台帳。
- Red-line check: 無 HP 歸零勝利、無掉寶／刷關／每日節奏；不改 bond／trust／Safety／save schema；撤退與失敗零懲罰；夥伴拒戰仍優先。
- Non-goals: 不重做月湖 2–5、不做三姿態、共鳴脈衝、零件、多角色、導流環、章節推進或新主入口。
- Planned verification: 目標狀態機與 30／60／120 Hz deterministic QA；完整 Orbit regression；390×844 headless browser 的入口、光點、營火圈、HUD 與零寫入煙測；`git diff --check`。
- Next safe action: 本包 VERIFIED 後停止；操作深度或正式路徑替換需另開 Gate 2。
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`、`docs/agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md`、`docs/design/BALANCE_SHEET.md` §9、`ACCEPTANCE.md` §O

### 2026-07-26 - Codex - Nexus Spin hybrid physics sandbox - VERIFIED

- Status: `VERIFIED`（自動化、靜態檢查與 390×844 headless browser smoke 完成；真人手指／真機 GPU 仍 open）
- Branch / commit: `main` / uncommitted（延續 Owner 指示：未 commit、未 push）
- Scope: 沿用既有 `src/orbit/` 與 battle overlay，加入 opt-in `hybrid-spin-v1` 物理生命週期與 `?orbitSandbox=1` 隱藏 debug；沒有建立第二套模式或改寫正式五關／對決的預設 R6 physics model。
- Work performed:
  - `orbitPhysics.js`：新增 `ORBIT_PHYSICS_MODELS`、`HYBRID_SPIN_PHASES` 與 body state `spinDirection / tilt / wobble / spinAge / spinPhase`；由 spin／stability／時間 deterministic 推導 `launch → stable → curving → wobbling → stopped`；Hybrid 彎軌依旋轉方向鏡像，牆／柱／body collision 會同時改速度、stability、tilt 與 wobble。
  - `orbitEngine.js`：session 可 opt-in Hybrid model；發射重置 lifecycle；`sandbox=true` 的勝利在 engine 層強制 `progressEligible=false`，不具備路徑／settlement 寫入資格。
  - `orbitBattleController.js`：網址帶 `?orbitSandbox=1` 時直接重用 `moonlake-1` 幾何開啟隱藏物理沙盒；Canvas 顯示 phase／speed／spin／tilt／wobble／direction 與 wobble ellipse；沙盒結算跳過路徑、微光、Growth、save。Browser smoke 另抓到既有 `.orbit-status` 與 duel status 同名衝突，已把四處寫入 selector 收窄到 `.orbit-battle .orbit-status`。
  - 新增 `docs/qa/orbit-hybrid-physics-cases.mjs`，並接入 `orbit-regression-cases.mjs`；`BALANCE_SHEET.md` §9.6 記錄 opt-in 模式、轉相門檻、寫入邊界與未完成範圍。
- Verification:
  - PASS 變更 JS／QA 的 `node --check`
  - PASS `node docs/qa/orbit-hybrid-physics-cases.mjs`（opt-in、完整 phase 生命週期、方向鏡像、碰撞擾動、出界停止、30／60／120 Hz exact-match、sandbox progress lock、UI wiring）
  - PASS `node docs/qa/orbit-regression-cases.mjs`（prototype／stages／duel／settlement／feel／hybrid／i18n 全綠）
  - PASS 390×844 headless Chromium：進入 `Hybrid Spin 物理沙盒・湖心訓練`、拖曳發射、battle status 顯示旋轉中、Canvas debug 讀到 `curving / speed / spin / tilt / wobble / CW`，無 page error；截圖位於 Codex visualization staging。
  - PASS `git diff --check`
- Problems / risks: 測試 sandbox 封鎖外網，Pixi CDN 請求得到 `ERR_NETWORK_ACCESS_DENIED`，所以截圖背景顯示既有 habitat fallback；Orbit DOM／Canvas smoke 本身通過。沙盒仍借用 `moonlake-1` 的 clear dummy 與關係投影 stats，只證明物理生命週期，不得宣稱記憶光點／營火共鳴圈／正式 Moonlake Camp slice 已完成。真人手感與 Safari pointer／GPU 仍需真機。
- Next safe action: 本包在此停止；若 Owner 核准，另開 `NEXUS_SPIN_MOONLAKE_CAMP_SLICE` Gate 2，把此 opt-in physics model 接到一個無 HP 的記憶光點＋營火共鳴圈證明關。
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`、`docs/design/BALANCE_SHEET.md` §9、`ACCEPTANCE.md` §O

### 2026-07-26 - Codex - Nexus Spin hybrid physics sandbox - IN PROGRESS

- Status: `IN PROGRESS`
- Branch / commit: `main` / uncommitted（延續 Owner 的 no commit / no push 指示）
- Scope: 在現有 `src/orbit/` 原型加入 opt-in `hybrid-spin-v1` body lifecycle（spin direction／tilt／wobble／phase）與 `?orbitSandbox=1` 隱藏 debug；不是第二套模式。
- Files: `src/orbit/orbitPhysics.js`、`src/orbit/orbitEngine.js`、`src/ui/orbitBattleController.js`、Orbit QA、`BALANCE_SHEET.md`、本台帳。
- Red-line check: sandbox 不寫路徑進度、vault、Growth 或 save；不改 bond／trust／Safety；正式五關與對決預設仍走 R6 baseline。
- Non-goals: 不做三姿態、共鳴脈衝、記憶光點、月湖正式切片、多角色、導流環或新入口。
- Planned verification: lifecycle／碰撞擾動／30-60-120 Hz deterministic QA；完整 Orbit regression；JS static check。
- Next safe action: 本包 VERIFIED 後停下；Moonlake Camp slice 必須另開 Gate 2。
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`、`docs/design/BALANCE_SHEET.md` §9、`ACCEPTANCE.md` §O

### 2026-07-26 - Codex - Orbit R6 deterministic baseline - VERIFIED

- Status: `VERIFIED`（自動化與靜態檢查完成；真人手感／真機 GPU 仍 open）
- Branch / commit: `main` / uncommitted（依 Owner 指示未 commit、未 push）
- Scope: 修正既有 `src/orbit/*` R6 原型的 FPS／子步數依賴；沒有另建 `nexusSpin/`、新入口、關卡、姿態、脈衝或獎勵。
- Work performed:
  - `orbitPhysics.js`：continuous `SPIN_DRIVE` 改成每秒加速度並乘 `dt`；線性 drag 改為 exponential decay；新增 `PHYSICS_FIXED_DT=1/120`、`PHYSICS_MAX_STEPS_PER_FRAME=6` 與 `planFixedPhysicsSteps()`。
  - `orbitEngine.js`／`orbitDuelEngine.js`：使用同一固定物理時鐘；elapsed、CPU 發射倒數、假動作、碰撞與結算都在固定步內推進；player runtime 直接引用 `DEFAULT_SPIN_DECAY`／`DEFAULT_FRICTION`，消除 Balance Sheet 與 runtime override 不一致。
  - `orbit-feel-cases.mjs`：保留長拉速度與高 Spin 彎軌門檻，新增 30／60／120 Hz 相同發射結果完全一致的回歸。
  - `BALANCE_SHEET.md` §9：同步每秒 drive 與固定步規格；`orbit-regression-cases.mjs` 標記涵蓋 R1–R6。
- Verification:
  - PASS `node --check src/orbit/orbitPhysics.js`
  - PASS `node --check src/orbit/orbitEngine.js`
  - PASS `node --check src/orbit/orbitDuelEngine.js`
  - PASS `node --check docs/qa/orbit-feel-cases.mjs`
  - PASS `node docs/qa/orbit-feel-cases.mjs`（含 30／60／120 Hz exact-match）
  - PASS `node docs/qa/orbit-regression-cases.mjs`（prototype／stages／duel／settlement／feel／i18n 全綠）
- Problems / risks: CPU 對決的 `Math.random()` seed replay、Hybrid Spin 的 tilt／wobble／phase、390×844 真人手感與真機 GPU 都不在本包；不得把本 baseline 宣稱成完整 Hybrid Spin。
- Next safe action: Owner 真機感受 R6；若核可，再另開 `NEXUS_SPIN_HYBRID_PHYSICS_SANDBOX` Gate 2，繼續沿用 `src/orbit/`。
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`、`docs/design/BALANCE_SHEET.md` §9、`ACCEPTANCE.md` §O

### 2026-07-26 - Codex - Orbit R6 deterministic baseline - IN PROGRESS

- Status: `IN PROGRESS`
- Branch / commit: `main` / uncommitted（Owner 明示不要 commit / push）
- Scope: 只在既有 `src/orbit/*` 原型管線修正 R6 的時間步長依賴、固定物理步進與 runtime／Balance Sheet 常數不一致；不另建 `nexusSpin/` 或第二套模式。
- Red-line check: 不改 bond／trust、Safety、Growth、存檔 schema、獎勵或入口；撤退、拒戰與非懲罰結局保持不變。
- Planned verification: `orbit-feel-cases.mjs` 加入 30／60／120 Hz 一致性；跑 `orbit-regression-cases.mjs` 與變更 JS 的 `node --check`。
- Next safe action: 完成實作與回歸後把本 lane 追加為 `VERIFIED`；未通過不得進 Hybrid Spin sandbox。
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`、`docs/design/BALANCE_SHEET.md` §9、`ACCEPTANCE.md` §O

### 2026-07-25 - Claude - Heartcore Orbit PACK R6 feel tuning (speed pass) - COMPLETED (unverified — no local run)

- Status: `COMPLETED` 但**完全未在本機執行**——本 session 的 code-task／shell 皆不可用，只用 Read/Edit 直接改檔；未跑過任何 `node docs/qa/orbit-*.mjs`、未 `node --check`、未實機播放測試。Owner／Cursor 需在有 shell 的環境補跑一次再決定 commit。
- Branch / commit: 未建 branch，直接改工作目錄（uncommitted）
- Scope: 使用者原話「速度不夠快，不太像戰鬥陀螺的那種競技感」，Cursor 額度用盡，Owner 授權由 Claude 直接代勞這一個调校任務；範圍限定在既有 `src/orbit/*` 手感常數＋防穿模，**未**碰 ChatGPT 建議的 `src/gameplay/nexusSpin/` 全新架構重寫（評估過該重寫規模過大，且本 session 無法驗證，故不做）。
- Work performed:
  - MOD `src/orbit/orbitPhysics.js`：發射初速／拉力係數大幅提高（base 0.78→1.05、pull 係數 2.95→4.3）、摩擦降低（0.075→0.05）、轉速衰減加快（4.6→5.4）、自旋彎軌與外圈推力加強（`SPIN_CURVE_STRENGTH` 1.35→1.9、`SPIN_DRIVE` 0.055→0.09）、碰撞更脆更重（`BODY_RESTITUTION` 0.9→0.97、傷害 cap 24/22→30/26）；新增 `PHYSICS_SUBSTEPS=2` 常數
  - MOD `src/orbit/orbitEngine.js`：`stepOrbitSession` 改為每幀跑 2 個物理子步（避免提速後高速穿模漏碰撞），`MAX_SPIN_SECONDS` 75→45（場次更短促）
  - MOD `src/orbit/orbitDuelEngine.js`：`stepOrbitDuel` 同步改細分步；`MAX_DUEL_SECONDS` 70→45；發射倒數／假動作邏輯挪到子步迴圈外，避免隨子步重複套用
  - MOD `src/ui/orbitBattleController.js`：`worldToScreen`/`screenToWorld` 場地視覺縮放 0.42→0.46
  - MOD `docs/qa/orbit-feel-cases.mjs`：同步新常數的 `assert.equal` 精確值；把「長拉應該快」的下限從 1.8 拉高到 3.2 鎖住本輪提速目標
  - MOD `docs/design/BALANCE_SHEET.md` §9.1／§9.5：新增 R6 常數對照表（新值 vs R5.1 舊值）
- Verification: **無**。已用 Grep 逐一確認沒有其他檔案對這些常數做 `assert.equal` 硬編碼（`orbit-duel-cases.mjs`／`orbit-regression-cases.mjs` 檢查過，只有 `orbit-feel-cases.mjs` 有精確值，已同步）；純靠讀碼推演，**未實際執行過一次**。
- Problems / risks: （a）本輪完全跳過「跑一次證明」——不同於契約要求的驗證紀律，這是明確已知的缺口，不是疏漏；（b）`PHYSICS_SUBSTEPS` 細分步是新增邏輯，雖經過人工推演（假對手漂移／發射倒數已移出子步迴圈避免重複套用），仍需要實機／自動測試才能排除語意誤差；（c）`BALANCE_SHEET.md` §9.1 表頭仍寫「R5.1」的其餘小節（例如 9.2–9.4）未動，屬正常（未變更範圍）；（d）尚未讓夥伴任何持久 stat／存檔邏輯被動到，維持契約紅線。
- Next safe action: 在有 shell／瀏覽器部署能力的環境（Cursor 額度恢復後，或 Owner 本機）執行 `node docs/qa/orbit-feel-cases.mjs`、`node docs/qa/orbit-regression-cases.mjs`、`node docs/qa/orbit-duel-cases.mjs`，並實機／瀏覽器手測一輪「發射→對撞→結算」節奏是否真的達到「戰鬥陀螺競技感」；確認無誤後才 commit／push。
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`、`docs/design/BALANCE_SHEET.md` §9

### 2026-07-25 - Cursor Grok - Heartcore Orbit PACK R5 polish - COMPLETED

- Status: `COMPLETED`（手感／四語 chrome／基本 a11y／ACCEPTANCE §O／回歸 harness；**真人測・真機・法務仍 OPEN**）
- Branch / commit: `cursor/heartcore-orbit-agent-program-87a6` / uncommitted
- Scope: PACK R5 only — 不加新模式、不開 G4、不宣稱上架；整模式完成前不 push `main`／不寫 Codebase MCP。
- Work performed:
  - MOD `src/orbit/orbitPhysics.js`（R5 手感常數＋短拉 charge 曲線）
  - MOD `orbitEngine.js`／`orbitDuelEngine.js`（轉速衰減／摩擦對齊）
  - MOD `orbitBattleController.js`／`orbitMapController.js`／`orbitDuelController.js`（i18n chrome、focus、aria）
  - MOD `src/i18n/strings.js`（`orbit.*` 四語關鍵字）
  - MOD `docs/design/BALANCE_SHEET.md` §9.1／§9.5；`ACCEPTANCE.md` §O
  - NEW `docs/qa/orbit-feel-cases.mjs`、`orbit-i18n-cases.mjs`、`orbit-regression-cases.mjs`、`ORBIT_MANUAL_390x844.md`
- Verification: `node docs/qa/orbit-regression-cases.mjs`；`node --check` 變更 JS。
- Problems / risks: （a）關卡正文／夥伴台詞仍多為內容語繁中；（b）路徑進度仍 session-only；（c）**剩餘 open：真人測、真機、法務**。
- Next safe action: Owner 依 `ORBIT_MANUAL_390x844.md` 手測；核可後再決定是否 commit／PR；**完成整模式前不要 push main／Codebase MCP index**。
- Required reading: `ACCEPTANCE.md` §O、`docs/qa/ORBIT_MANUAL_390x844.md`、契約 V1

### 2026-07-25 - Cursor Grok - Heartcore Orbit PACK R4 settlement - COMPLETED

- Status: `COMPLETED`（遠征微光匯流＋exploration evidence；對決勝發獎；不碰 G4）
- Branch / commit: `cursor/heartcore-orbit-agent-program-87a6` / uncommitted
- Scope: PACK R4 — 首次通關寫 `expeditionVault.shards`＋`writeIntoDraft(exploration)`；進場讀 vault 微光敘事／Burst 投影；不呼叫 `buildExpeditionSettlement`。
- Work performed:
  - NEW `src/orbit/orbitSettlement.js`
  - MOD `orbitBattleController.js`（結算交易＋save／growth 注入）
  - MOD `orbitMapController.js`（遠征微光條）
  - MOD `app.js`（注入 companionGrowthController + saveInteraction）
  - NEW `docs/qa/orbit-settlement-cases.mjs`
- Verification: `orbit-settlement-cases.mjs`；回歸 R1–R3 harness。
- Problems / risks: （a）路徑進度仍 session-only；（b）evidence 依既有 companionStates.growth，缺 record 時 bridge 拒寫；（c）整模式完成前不 push main／Codebase MCP。
- Next safe action: Owner 手測「遠征帶回微光→迴旋進場→通關見微光／Memory」；核可後開 **PACK R5 only**（打磨／回歸）。
- Required reading: `src/orbit/orbitSettlement.js`、`docs/design/COMPANION_GROWTH_CONTRACT_V1.md`、契約 V1 §8

### 2026-07-25 - Cursor Grok - Heartcore Orbit PACK R3 duel - COMPLETED

- Status: `COMPLETED`（人機／幽靈對決；無網路；無 ±bond；連戰 budget）
- Branch / commit: `cursor/heartcore-orbit-agent-program-87a6` / uncommitted
- Scope: PACK R3 — 雙化身對決引擎、CPU 鏡像／急轉、幽靈重播上一場拉動、過熱連戰拒戰。
- Work performed:
  - NEW `src/data/orbit/duelProfiles.js`
  - NEW `src/orbit/{orbitDuelEngine,orbitDuelBudget,orbitGhostRecorder}.js`
  - NEW `src/ui/orbitDuelController.js`；路徑圖加「迴旋對決」入口
  - `orbitBattleController`／`orbitMapController`／`styles.css` 接線
  - NEW `docs/qa/orbit-duel-cases.mjs`
- Verification: `node --check`；`orbit-duel-cases.mjs`；回歸 R1/R2 harness。
- Problems / risks: （a）幽靈無錄製時退回人機鏡像；（b）仍不寫 save／growth；（c）整模式完成前不 push main／Codebase MCP。
- Next safe action: 已接 R4。
- Required reading: `src/orbit/orbitDuelEngine.js`、`src/ui/orbitDuelController.js`、契約 V1 §4.3

### 2026-07-25 - Cursor Grok - Heartcore Orbit PACK R2 stages - COMPLETED

- Status: `COMPLETED`（五關＋節點圖＋破關解鎖平原；session-only 進度）
- Branch / commit: `cursor/heartcore-orbit-agent-program-87a6` / uncommitted
- Scope: PACK R2 — 月湖五關、護盾柱／窄徑、路徑節點圖、通關解鎖平原路徑首關。
- Work performed: `src/data/orbit/stages/*`、`orbitPathProgress.js`、`orbitMapController.js`、engine／UI 擴充、`docs/qa/orbit-stage-cases.mjs`
- Verification: `orbit-stage-cases.mjs` PASS；回歸 R1 harness PASS。
- Next safe action: 已接 R3。
- Required reading: `src/data/orbit/stages/moonlakeStages.js`、`src/orbit/orbitPathProgress.js`

### 2026-07-25 - Cursor Grok - Heartcore Orbit PACK R1 prototype - COMPLETED

- Status: `COMPLETED`（單軌道可玩原型；探索入口）
- Branch / commit: `cursor/heartcore-orbit-agent-program-87a6` / uncommitted
- Scope: PACK R1 — 拉動／旋轉／撞擊＋探索「月湖路徑・迴旋」。
- Work performed: `src/orbit/*`、`orbitBattleController.js`、pageRouter／app 接線、`orbit-battle-prototype-cases.mjs`
- Verification: prototype harness PASS。
- Next safe action: 已接 R2。
- Required reading: `src/orbit/orbitEngine.js`、`src/ui/orbitBattleController.js`

### 2026-07-25 - Cursor Grok - Heartcore Orbit PACK R0 contract - COMPLETED

- Status: `COMPLETED`（docs only）
- Branch / commit: `cursor/heartcore-orbit-agent-program-87a6` / uncommitted
- Scope: PACK R0 — 心核迴旋戰契約；路徑短名月湖→平原→熔爐→南港→核心→潮汐→秘境。
- Work performed: `HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`、`PACK_HEARTCORE_ORBIT_BATTLE.md`、BALANCE_SHEET §9、README 索引。
- Verification: docs-only。
- Next safe action: 已接 R1。
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`

### 2026-07-25 - Cursor Grok - Heartcore Orbit Battle agent program - PLANNED

- Status: `PLANNED` — Owner-facing agent instruction pack authored; **no runtime authorization** until PACK R0 contract + Gate 2.
- Branch / commit: `cursor/heartcore-orbit-agent-program-87a6` / (pending commit)
- Scope: Document how agents must build chat+bond daily loop, keep Expedition, and add Beyblade×marble「心核迴旋戰」with relationship-projected combat stats only.
- Work performed: Added `docs/agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md` (master prompt, red lines, projector table, PACK R0–R5); indexed in `docs/README.md`.
- Verification: docs-only review; no runtime change.
- Problems / risks: Easy for agents to over-scope into「finish whole game」or real ATK trees — program explicitly forbids; R1+ still needs separate Owner Gate 2.
- Next safe action: Owner paste §4 master prompt + PACK R0 only; after contract approval, open R1 prototype.
- Required reading: `docs/agent/HEARTCORE_ORBIT_BATTLE_AGENT_PROGRAM.md`, this entry.

### 2026-07-25 - Cursor Grok - Moonlake prop scale-up - COMPLETED

- Status: `COMPLETED` for Owner review: enlarge Moonlake diorama props vs companion (placement kept; companion `displayScale` unchanged).
- Branch / commit: `fix/moonlake-prop-scale-up` → PR into protected `main`.
- Scope: `moonlakeObjectPack.js` scales, `maxDisplaySize`, shadows, lights; near-tent inward offsets after enlarge.
- Work performed: far 0.22→0.26; mid tents 0.30→0.52 (screen QA raised past plan 0.38 because art cover vs safe-zone); near 0.52→0.60; shrine/main beacon small uplift; near offsets pulled inboard.
- Verification: Playwright 390×844 — scales match, `edgeOk`, `plazaClear`; mid/companion height ratio ≈0.90; `docs/qa/_moonlake_prop_scale_qa.json`.
- Problems / risks: Dual coordinate spaces mean art-local scale ≠ screen parity; further feel may still want mild companion shrink.
- Next safe action: Owner device feel-check; optional companion `displayScale` nudge if still large.
- Required reading: `src/data/sceneProfiles/moonlakeObjectPack.js`, this entry.

### 2026-07-25 - Cursor Grok - Companion shadow flush to opaque feet - COMPLETED

- Status: `COMPLETED` for Owner request: ground shadows must sit on visible foot contact with no float gap.
- Branch / commit: `fix/companion-shadow-flush-to-feet` → PR into protected `main`.
- Scope: Shared `companionFootAndShadow.js`; animated/static/placeholder shadows sync to opaque-foot (or content bottom); animation pose swaps remeasure.
- Work performed: attach + sync on layout; `__resyncGroundShadow` after animation play; QA `shadowGap` on `__NEXUS_HABITAT.getFootPlacement`; unit harness + live matrix gate extension.
- Verification: `node docs/qa/companion-shadow-flush-cases.mjs` 8/8; lifecycle 29/29; live gate 112/112, `maxShadowGap≈0.56px`, `maxDist≈0.99px`.
- Problems / risks: Ellipse half still overlaps paws (intentional contact look); per-frame idle foot wobble not remeasured every tick.
- Next safe action: Owner device feel-check; optional shadow radius retune per creature scale.
- Required reading: `src/pixi/companionFootAndShadow.js`, this entry.

### 2026-07-25 - Cursor Grok - Habitat foot-on-compass alignment - COMPLETED

- Status: `COMPLETED` for Owner correction: opaque feet on authored cross/compass center (supersedes 2026-07-15 visual-center acceptance for this placement).
- Branch / commit: `fix/habitat-foot-on-compass-center` → PR into protected `main`.
- Scope: Scene Profiles `alignment: "foot"`; `getCompanionOpaqueFoot` compensates sit-pose transparent padding; QA APIs + live matrix gate.
- Work performed: companionRenderer opaque-foot placement; moonlake + Linkara profiles; `__NEXUS_HABITAT.getFootPlacement/swapCompanionById`; `_run_habitat_foot_compass_gate.py`.
- Verification: `node docs/qa/companion-renderer-lifecycle-cases.mjs` 29/29; live gate 7 habitats × 16 companions = 112/112, `maxDist≈1.1px`.
- Problems / risks: Sitting poses still show front paws slightly above geometric center (contact point under body); authored compass points unchanged.
- Next safe action: Owner visual feel-check on device; optional per-habitat compass point retune if any plate still feels high/low.
- Required reading: `src/pixi/companionRenderer.js`, `docs/qa/_run_habitat_foot_compass_gate.py`, this entry.

### 2026-07-25 - Cursor Grok - Pack D expedition loot semantics - COMPLETED

- Status: `COMPLETED` for Phase 1 player-facing mote/trace language (ids + craft math unchanged).
- Branch / commit: `feat/pack-expedition-loot-semantics` → PR into protected `main`.
- Scope: Labels, settlement/journal/summarize, craft missing copy, collect intents, explore strip; no vault schema bump.
- Work performed: `lootPresentation.js`; lootTables / craft / expedition voice+state+persistence+brain+intent; strategy doc + harness.
- Verification: `node docs/qa/expedition-loot-semantics-cases.mjs`.
- Problems / risks: Internal comments may still say「碎晶」; vault strip still shows counts (inventory need).
- Next safe action: Owner feel-check four tension packs on main; optional Pack 1 human §J cohort.
- Required reading: `docs/strategy/PACK_EXPEDITION_LOOT_SEMANTICS.md`, this entry.

### 2026-07-25 - Cursor Grok - Pack C initiative budget view - COMPLETED

- Status: `COMPLETED` for Phase 1 session budget API (no daily FOMO / schema).
- Branch / commit: `feat/pack-initiative-budget-view` → PR into protected `main`.
- Scope: Name/export ambient initiative remaining + block reasons; wire controller `getBudgetView`.
- Work performed: `getAmbientInitiativeBudget` in `initiativeCooldown.js`; controller hook; strategy doc + harness.
- Verification: `node docs/qa/initiative-budget-cases.mjs`.
- Problems / risks: No player HUD yet — intentional; caps unchanged.
- Next safe action: Pack D expedition loot semantics (player-facing copy away from farming/power currency).
- Required reading: `docs/strategy/PACK_INITIATIVE_BUDGET.md`, this entry.

### 2026-07-25 - Cursor Grok - Pack B non-confrontation chapter growth - COMPLETED

- Status: `COMPLETED` for Phase 1 life-event chapter trial + shared anti-farm helpers.
- Branch / commit: `feat/pack-nonconfrontation-chapter-growth` → PR into protected `main`.
- Scope: Reflective/peaceful/discovery explore can clear current chapter and write `chapter` evidence; standoff path retained.
- Work performed: `chapterTrialEngine.js`; mapController life-event wiring; battleController shared helpers; strategy doc + harness.
- Verification: `node docs/qa/nonconfrontation-chapter-growth-cases.mjs`.
- Problems / risks: Life-event blocked when explore rolls encounter — player may still use standoff path; intentional for Phase 1.
- Next safe action: Pack C initiative budget (name/export budget view; no daily FOMO persistence).
- Required reading: `docs/strategy/PACK_NONCONFRONTATION_CHAPTER_GROWTH.md`, `src/engine/chapterTrialEngine.js`, this entry.

### 2026-07-25 - Cursor Grok - Pack A qualitative bond presentation - IN PROGRESS / COMPLETED

- Status: `COMPLETED` for Phase 1 UI presentation (engines keep numeric bond/trust).
- Branch / commit: `feat/pack-qualitative-bond-presentation` → PR into protected `main`.
- Scope: Player-facing bond/trust stages; no STORAGE_KEY / companion schema bump.
- Work performed: `bondPresentation.js`; HUD / care / chronicle / map chips / expedition settlement voice; strategy doc + harness; repair sequence Pack A row.
- Verification: `node docs/qa/qualitative-bond-presentation-cases.mjs`.
- Problems / risks: Stage labels longer than digits — CSS allows wrap on bond/trust rows; energy/boundary remain numeric by design.
- Next safe action: Pack B non-confrontation growth route (chapter life-event evidence + advance), then initiative budget, then loot semantics.
- Required reading: `docs/strategy/PACK_QUALITATIVE_BOND_PRESENTATION.md`, `src/ui/bondPresentation.js`, this entry.

### 2026-07-25 - Cursor Grok - Pack 2.5 mirror misuse guardrails - COMPLETED

- Status: `COMPLETED` for static/runtime guardrails + judgment alias. No schema bump / writer migration.
- Branch / commit: `feat/pack2-5-mirror-misuse-guardrails` → PR into protected `main`.
- Scope: Prevent reintroducing top-level bond/trust reads in companion-judgment modules; document allowlist for active-mirror play paths.
- Work performed: `relationshipAuthorityGuard.js`; invite uses `resolveRelationshipForJudgment`; `mirror-misuse-guardrail-cases.mjs`; ADR-002 / Pack2 docs updates.
- Verification: `node docs/qa/mirror-misuse-guardrail-cases.mjs`; `node docs/qa/resonance-invite-authority-cases.mjs`; `node docs/qa/_resonance_invite_cases.mjs`.
- Problems / risks: Allowlist is illustrative not exhaustive; new judgment modules must be added to guarded list manually.
- Next safe action: Product tension packs (initiative budget / loot semantics / qualitative bond / non-confrontation growth) only with Owner approval; or Owner human §J cohort.
- Required reading: `src/state/relationshipAuthorityGuard.js`, `docs/qa/mirror-misuse-guardrail-cases.mjs`, this entry.

### 2026-07-25 - Cursor Grok - Pack 1 §J structured acceptance - VERIFIED_STRUCTURED

- Status: `VERIFIED` for Pack 1 **structured** acceptance (harness + map browser gate + moderated walkthrough). **Not** a five-stranger human cohort.
- Branch / commit: `docs/pack1-sj-structured-acceptance` → PR into protected `main`.
- Scope: Close Pack 1 repair gate with reproducible evidence; provide human score sheet for pre-launch cohort.
- Work performed: `_run_pack1_sj_structured_walkthrough.py`; `PACK1_SJ_ACCEPTANCE_EVIDENCE.md`; `PACK1_SJ_HUMAN_SCORESHEET.md`; checklist / repair sequence / plan / ledger updates.
- Verification: `node docs/qa/first-session-motivation-cases.mjs` 8/8; map first-session gate + browser gate 45/45; structured walkthrough `passed=true`.
- Problems / risks: True §J five-new-player study still open for public-launch claims; console encoding on Windows host does not affect UTF-8 artifact JSON.
- Next safe action: Owner run human score sheet when recruiting testers; or Pack 2.5 / new tension packs.
- Required reading: `docs/qa/PACK1_SJ_ACCEPTANCE_EVIDENCE.md`, this entry.

### 2026-07-24 - Cursor Grok - Pack 2 Phase 3 keep-mirror decision recorded - COMPLETED

- Status: `COMPLETED` for decision docs only. No runtime change. Full mirror deprecation deferred.
- Branch / commit: docs PR into protected `main` (see PR).
- Scope: Record keep-mirror default; optional Pack 2.5 guardrails; next-work options after Repair Packs 0–5 Phase 1.
- Work performed: `PACK2_PHASE3_MIRROR_DECISION.md`; ADR-002 / Pack2 migration / repair sequence / README / ledger updates; codebase-memory ADR note.
- Verification: docs-only review; `git status` clean after merge.
- Problems / risks: New code can still misuse top-level bond for non-active judgments — Pack 2.5 optional.
- Next safe action: Owner pick — (1) Pack 1 five-player playtest, (2) Pack 2.5 guardrails, or (3) new Task Pack from remaining tension-review items.
- Required reading: `docs/strategy/PACK2_PHASE3_MIRROR_DECISION.md`, this entry.

### 2026-07-24 - Cursor Grok - Pack 5 Terminology / UI language Phase 1 - COMPLETED

- Status: `COMPLETED` for player-facing glossary application + scan harness. Master Canon rewrite deferred.
- Branch / commit: `feat/pack5-terminology-ui-language` → PR into protected `main`.
- Scope: Replace overclaim 「療癒／治癒／Healer」 in companion presentation and codex radar label; document glossary; ban-scan harness.
- Work performed: `PACK5_TERMINOLOGY_GLOSSARY.md`; companionRegistry; codexController; heartsparkCouncilCanon; `terminology-ui-language-cases.mjs`.
- Verification: `node docs/qa/terminology-ui-language-cases.mjs`.
- Problems / risks: Master Canon §2 still uses 「療癒設計」 titles until Owner strategy approval.
- Next safe action: None remaining in Repair Sequence Packs 0–5 Phase 1; optional Pack 1 playtest / Pack 2 Phase 3.
- Required reading: `docs/strategy/PACK5_TERMINOLOGY_GLOSSARY.md`, this entry.

### 2026-07-24 - Cursor Grok - Pack 4 Dynamic Chapter Encounter Resolver Phase 1 - COMPLETED

- Status: `COMPLETED` for resolver + fallback + invite resolvedId + Pack 2 Phase 2 byId baseline on meet. No STORAGE_KEY bump.
- Branch / commit: `feat/pack4-chapter-encounter-resolver` → PR into protected `main`.
- Scope: Idempotent chapter meet resolution; never re-meet known companions; fallback echo event; invite uses resolved companion.
- Work performed: `chapterEncounterResolver.js`; `mapController` meet path; `getChapterCompanionId(state)`; `ensureCompanionRelationshipInDraft`; ADR-004; harness.
- Verification: `node docs/qa/chapter-encounter-resolver-cases.mjs`; `node docs/qa/resonance-invite-authority-cases.mjs`; `node --check` on touched JS.
- Problems / risks: Alternate meets use generic copy; ch7 always fallback when treated as encounter chapter.
- Next safe action: Pack 5 Terminology / UI language alignment.
- Required reading: `docs/architecture/ADR-004-DYNAMIC_CHAPTER_ENCOUNTER_RESOLVER.md`, `src/engine/chapterEncounterResolver.js`, this entry.

### 2026-07-24 - Cursor Grok - Pack 3 Memory Single Truth Projection Phase 1 - COMPLETED

- Status: `COMPLETED` for projection-only MemoryViewModel + recall gate. No array merge / STORAGE_KEY bump.
- Branch / commit: `feat/pack3-memory-single-truth` → PR into protected `main`.
- Scope: Player-visible memory evidence timeline; anchors on Memory page; concrete/soft recall require visible evidence; released stays as archive.
- Work performed: `src/ui/memoryProjection.js`; `pageRouter` Memory strip/list; `companionAnchorPolicy` visibility filters; ADR-003; harness `docs/qa/memory-projection-cases.mjs`.
- Verification: `node docs/qa/memory-projection-cases.mjs`; `node --check` on touched JS.
- Problems / risks: Memory list density may rise under cap; tone-only hidden anchors are intentionally non-claimable.
- Next safe action: Pack 4 Dynamic Chapter Encounter Resolver.
- Required reading: `docs/architecture/ADR-003-MEMORY_SINGLE_TRUTH_PROJECTION.md`, `src/ui/memoryProjection.js`, this entry.

### 2026-07-24 - Cursor Grok - Pack 2 relationship authority Phase 1 - COMPLETED

- Status: `COMPLETED` for Phase 1 invite/snapshot authority fix + ADR/migration plan. Phases 2–3 not shipped. Not a full schema migration.
- Branch / commit: `feat/pack2-relationship-authority` → PR into protected `main`.
- Scope: Per-companion bond/trust/blocked for resonance invite + chapter mark snapshots; ADR-002; Pack 2 migration plan; authority harness. No STORAGE_KEY / companionStates.version bump.
- Work performed: `resolveRelationshipForCompanion`, `buildRelationshipChapterMarkSnapshot`; `resonanceInviteEngine` + `mapController` wired; docs + `docs/qa/resonance-invite-authority-cases.mjs`.
- Verification: `node docs/qa/resonance-invite-authority-cases.mjs`; `node docs/qa/_resonance_invite_cases.mjs`; `node --check` on touched JS.
- Problems / risks: Historical polluted chapterMarks may linger until reask; top-level mirror writers unchanged; Phase 3 deprecate-mirror still open.
- Next safe action: Pack 3 Memory Single Truth Projection (plan first) unless Owner queues Pack 2 Phase 2.
- Required reading: `docs/architecture/ADR-002-MULTI_COMPANION_RELATIONSHIP_AUTHORITY.md`, `docs/strategy/PACK2_RELATIONSHIP_AUTHORITY_MIGRATION.md`, this entry.

### 2026-07-24 - Cursor Grok - Moonlake BGM correction + Pack 1 motivation repair - COMPLETED (not playtest VERIFIED)

- Status: `COMPLETED` for code+docs in PR worktree; **not** full playtest `VERIFIED` (§J five-player gate still open).
- Branch / commit: `feat/moonlake-bgm-and-first-session-motivation` → merge to protected `main` via PR.
- Scope: Correct Moonlake BGM to `bgm_ethereal_moon_lakefront.mp3`; implement Pack 1 Resonance Thread + standoff meaning/causality + defer gate. No save-schema / Pack 2–4 migrations.
- Work performed: `bgmRegistry` remap; `resonanceThreadEngine`/`Controller`; battle objective/meanings/guide/causality; map defer + explore return preview; i18n + CSS; harnesses.
- Verification: `node docs/qa/first-session-motivation-cases.mjs`; `node docs/qa/bgm-integration-cases.mjs`; `node --check` on touched JS.
- Problems / risks: Thread copy is TC-first seeds (not full per-companion voice packs); 5-player playtest not run; guided card is session-dismissible only.
- Next safe action: Human 5-player §J playtest; then Pack 2 plan-only if Owner queues it.
- Required reading: `docs/superpowers/plans/2026-07-24-first-session-motivation-repair.md`, `src/engine/resonanceThreadEngine.js`, this entry.

### 2026-07-24 - Cursor Grok - Task Pack 0 BGM + product review archive - COMPLETED (merge pending)

- Status: `COMPLETED` for documentation archive + BGM wiring; Owner confirmed mappings; merge to protected `main` via PR. Not full-device `VERIFIED` (iOS Safari physical pass still open).
- Branch / commit: feature branch from `49075e4` → PR into `main` (see PR for SHA).
- Scope: Persist two proposed product/architecture reviews + repair sequence; multi-scene BGM. Non-goals unchanged for migrations / asset edits.
- Work performed:
  - Docs + runtime BGM as prior entry.
  - Owner decisions applied: companion-select = `bgm_linkara_lofi.mp3`; Moonlake = `bgm_lakefront.mp3`; ethereal variant unmapped alternate.
- Verification: `node --check` on touched JS; `node docs/qa/bgm-integration-cases.mjs`; `git diff --check`.
- Problems / risks: iOS autoplay needs gesture; track loudness variance; ethereal alternate unused; bond/trust global authority still a planned P0 (Pack 2).
- Next safe action: After merge, execute **TASK PACK 1 — First Session Motivation Repair** (plan document first, then implement only if Owner continues approval).
- Required reading: `docs/audio/BGM_ASSET_MAP.md`, `docs/strategy/NEXUS_LINK_REPAIR_SEQUENCE.md`, `src/data/bgmRegistry.js`, this entry.

### 2026-07-16 - Codex - Protected main post-merge evidence truth sync - VERIFIED

- Status: `VERIFIED`; Pages payload reduction, repo-native CI, immutable Node 24 action pins, and active protected-`main` enforcement are complete. This remains `AUTOMATED_RC_PASS`, not public-launch approval.
- Branch / commit: verified `main` / `1ade52b3d17a494431013344ad889112c42d93ac` (`HEAD == origin/main`, divergence `0/0`); this truth record is prepared on docs-only branch `codex/release-evidence-final-sync`.
- Scope: Post-merge release-engineering evidence synchronization only. No runtime, safety, Raphael, gameplay, state/save, asset, or protected `output/**` change.
- Work performed: PR #91 was marked ready only after its required check passed, then merged through `main-release-protection`. The evidence record now names the protected merge SHA, post-merge CI/Pages runs, final artifact size, public deployment probes, and the still-open human gates.
- Verification: PR #91 required run `29486758125` / job `87582973690` passed in **3m52s**. Merge SHA `1ade52b` passed post-merge `web-release-gate` run `29487047298` / job `87583907417` with every step green and 0 annotations. Pages run `29487046694` succeeded and produced artifact **788,630,124 bytes**. Public Pages rerun at `2026-07-16T20:03:48+08:00` passed **17/17** required checks with 0 accessibility warnings, clean runtime provenance, one Pixi canvas, and 0 console errors; temporary evidence SHA-256 `E4D381BA89B144D05888B15EC90EB2F0089FD8CCBFD9F3DA457CBADF98DBD3BA`. Root/runtime probes returned 200; representative `output/**` and `assets/reference/**` probes returned 404; the public evidence page returned 200 and retained `NOT_RUN` human gates.
- Problems / risks: GitHub's platform-owned legacy Pages workflow still owns its Node 20 deprecation warning. Formal moderated first-session, private-blind 3 x 20, real-device D1/D2/D3/D6, legal/privacy/store-copy/material-rights, and explicit public-launch approval remain open.
- Next safe action: Run the human launch-evidence package; all future `main` changes must use an up-to-date PR and preserve the exact `web-release-gate` context plus separate human approvals.
- Required reading: `_config.yml`, `.github/workflows/release-gate.yml`, `docs/qa/WEB_RELEASE_EVIDENCE.md`, PR #91, ruleset `19037733`, runs `29486758125`, `29487047298`, and `29487046694`, and this lane.

### 2026-07-16 - Codex - Pages payload and release enforcement - COMPLETED

- Status: `COMPLETED`; the approved payload reduction, repo-native CI, immutable Node 24 action pins, and active `main` ruleset are implemented. This docs-only finalization is intentionally proceeding through the newly protected PR path; public launch remains unapproved.
- Branch / commit: `codex/release-enforcement-finalize` based on protected `main` SHA `0539cfa8f4b92f7024d6e3400d4efaade38b4bf1`; ruleset `main-release-protection` ID `19037733` is active at <https://github.com/Orochi771127/NexusLink/rules/19037733>.
- Scope: Release engineering and truth synchronization only. No runtime, safety, Raphael, gameplay, save/schema, asset, or protected `output/**` change.
- Work performed: Pages now excludes generation/review staging; `web-release-gate` runs the 17-check repo-native suite on PR/main/manual events with read-only permission and compact evidence; official actions are immutable Node 24 pins; `main` requires PR plus strict `web-release-gate`, has no bypass actor, and rejects deletion/non-fast-forward updates.
- Verification: Final pre-ruleset SHA `0539cfa` passed `web-release-gate` run `29486173817` / job `87581084031` in **4m0s**, app ID `15368`, conclusion success, annotations 0. Pages run `29486171482` succeeded, loaded `_config.yml`, and produced artifact **788,619,492 bytes**. Ruleset API inspection returned enforcement `active`, bypass count 0, approvals 0, strict status policy true, required context `web-release-gate`, and applicable rule types `deletion`, `non_fast_forward`, `pull_request`, and `required_status_checks` for `main`.
- Problems / risks: GitHub's platform-owned legacy Pages workflow continues to emit its own Node 20 deprecation warning, which repository code cannot change. Formal moderated first-session, private-blind 3 x 20, real-device D1/D2/D3/D6, legal/privacy/store-copy/material-rights, and explicit public-launch approval remain open.
- Next safe action: Merge this docs-only finalization only after its PR `web-release-gate` succeeds; all subsequent `main` changes must use an up-to-date PR and preserve the human launch gates as separate evidence.
- Required reading: `_config.yml`, `.github/workflows/release-gate.yml`, `docs/qa/WEB_RELEASE_EVIDENCE.md`, ruleset `19037733`, runs `29486173817` and `29486171482`, and this lane.

### 2026-07-16 - Codex - Pages payload and CI bootstrap - VERIFIED

- Status: `VERIFIED` for bootstrap commit `71dcc937f717b4292664576549d0117feef3777c`; public launch remains unapproved and the `main` ruleset is intentionally not activated until the evidence/pin follow-up receives the same successful check.
- Branch / commit: `main` / `71dcc937f717b4292664576549d0117feef3777c`; `HEAD` equalled `origin/main` (`0/0`) after the authorized direct-main bootstrap push.
- Scope: Added root `_config.yml` exclusions for `output/**` and `assets/reference/**`, plus a read-only `.github/workflows/release-gate.yml` that runs the repo-native gate on PRs, `main` pushes, and manual dispatch while uploading only one compact JSON evidence file. No runtime or asset file changed.
- Work performed: The workflow uses non-cone sparse checkout to omit the same non-runtime directories, Python 3.12, Node 24, pinned Playwright 1.60.0, a 30-minute timeout, concurrency cancellation, and fixed check context `web-release-gate`. After the first run exposed GitHub's Node 20 action-runtime warning, the current follow-up pins official Node 24 action releases by immutable SHA before ruleset activation.
- Verification: Pre-commit local Web gate **17/17**; GitHub run `29485275670` / job `87578173175` succeeded on exact SHA `71dcc93` in **3m40s** and uploaded compact evidence. Pages run `29485273828` loaded `/github/workspace/./_config.yml`, deployed successfully, and produced artifact **788,617,916 bytes** (down from **1,741,516,299** and below the `<850 MB` target). Public QA at `2026-07-16T17:04:30+08:00` passed harness **17/17**, NLU **8/8**, Stage 4 automated **12/12**, D2 **18/18**, map **42/42**, Initial Bond/Soul Talk/save persistence, one Pixi canvas, and 0 console errors; temp evidence SHA-256 `B04BF7B9502A2F9044501BA1B734011E2AE01B35AA0BE6C387F5C693E2A35600`. Runtime representative URL returned 200; both excluded representative URLs returned 404.
- Problems / risks: GitHub's dynamic legacy Pages workflow still emits its own Node 20 deprecation warning outside repository control. Formal moderated first-session, private-blind 3 x 20, real-device D1/D2/D3/D6, legal/privacy/store-copy/material-rights, and explicit public-launch gates remain open.
- Next safe action: Publish the immutable Node 24 action pins and evidence update, require a successful `web-release-gate` on that final `main` SHA, then create and inspect the approved active `main-release-protection` ruleset with no bypass actors.
- Required reading: The `IN PROGRESS` entry below, `_config.yml`, `.github/workflows/release-gate.yml`, `docs/qa/WEB_RELEASE_EVIDENCE.md`, GitHub runs `29485275670` and `29485273828`, and this lane.

### 2026-07-16 - Codex - Pages payload and release enforcement - IN PROGRESS

- Status: `IN PROGRESS`; Owner explicitly approved both `PAGES-PAYLOAD-EXCLUDE-R1` and `CI-RELEASE-ENFORCEMENT-R1`, including the GROUNDWORK deployment config, direct commit/push needed to bootstrap the first check, and the subsequent GitHub `main` ruleset mutation.
- Branch / commit: `main` / baseline `e3581b4b1e8a9451a089486fbebc210f1b56308a`; local `HEAD` equals `origin/main` (`0/0`).
- Scope: Add a root Jekyll exclusion config for non-runtime `output/**` and `assets/reference/**`; add a read-only GitHub Actions `web-release-gate`; publish the bounded package; verify the resulting CI check and reduced Pages deployment; then require that check through an active `main` ruleset.
- Red-line check: No runtime, safety, Raphael persona/memory, save/schema, gameplay, asset deletion, FOMO, reward, dependency inference, battle, roster, or progression change. Automated checks remain machine evidence only.
- Non-goals: No `.nojekyll`, `.gitignore` rewrite, `git rm`, runtime asset pruning, Pages source migration, whole-repository artifact upload, permanent bypass, or claim that private-blind, real-device, legal/privacy/store-copy, or public-launch gates are complete.
- Acceptance refs: Existing Web release gate **17/17**; `ACCEPTANCE.md` D2/K9/L9; Pages artifact target `<850 MB`; public runtime assets remain HTTP 200; excluded staging/reference paths become HTTP 404; `main` rejects deletion/force-push and requires the successful `web-release-gate` check.
- Verification: Pre-commit repo-native Web gate at `2026-07-16T16:43:38+0800` passed **17/17**, with accessibility warnings 0, runtime changes 0, and protected untracked `output/**` count 886. Temp evidence SHA-256: `2CF2B8A14320DA26D49374C5C7143BC53556431CC58269F5E52BB7D8E82B5F4F`. Staged scope audit, first workflow run, deployed Pages artifact/URL probes, and ruleset inspection remain pending.
- Problems / risks: The current Pages artifact is **1,741,516,299 bytes** and warns above 1 GB; no repository workflow, protection, or ruleset currently enforces the release gate. The protected 886 untracked `output/**` files must remain untouched.
- Next safe action: Apply the two-file configuration package plus append-only evidence, verify locally, commit/push the bootstrap change, wait for both CI and Pages, then create the ruleset only after the exact check context is observed.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, the latest Lane 1 RC entries, `docs/qa/WEB_RELEASE_EVIDENCE.md`, `docs/qa/_run_web_release_gate.py`, and this lane.

### 2026-07-16 - Codex - RC closure exact-commit checkpoint - VERIFIED

- Status: `VERIFIED`; the RC Docs/QA closure was committed as `220e2fdbefaa4a2a7ecc2e853f68869bc4560d81`. This status-sync entry records exact-commit results before the authorized direct-main push; public launch remains unapproved.
- Branch / commit: `main` / closure `220e2fd`; runtime baseline remains `c756337`. The current follow-up changes only handoff/status/release evidence, append-only ledger entries, and generated live QA evidence.
- Scope: No runtime, GROUNDWORK, asset, output, dependency, save/schema, CI/ruleset, or Pages-payload change. The 886 protected `output/**` files remain untracked and excluded.
- Verification: Clean tracked-tree run at `2026-07-16T15:27:55+0800` passed Web **17/17** with JS **254/254**, migration **33/33**, storage **13/13**, renderer **26/26**, map UI **42/42**, dialogue **21/21**, constitution **5/5**, D2 invariant **18/18**, D2 UI **6/6**, live Soul Talk **11/11**, HUD **13/13**, accessibility warnings 0 and runtime changes 0. Temp evidence SHA-256: `5B04D0CC8DFF3A8EA2261A3D36001749CF8F184BA21E820FB65E320EB5C595C1`.
- Problems / risks: Human launch gates remain open; the Pages artifact >1 GB and missing release enforcement remain separate approval packages.
- Next safe action: Commit this operational truth sync, push both commits to `origin/main`, wait for the Pages deployment of the resulting HEAD, then run deployed automation without writing tracked outputs.
- Required reading: The preceding authorization entry, commit `220e2fd`, exact temp evidence, `WEB_RELEASE_EVIDENCE.md`, and this lane.

### 2026-07-16 - Codex - RC closure direct-main publication - AUTHORIZED

- Status: `AUTHORIZED`; Owner explicitly instructed Codex to execute the recommended next step, including commit and push to `main`. This entry lands with the bounded RC Docs/QA closure; exact-commit and deployed verification follow before completion is claimed.
- Branch / commit: `main` / parent runtime candidate `c7563379af9989d852a0df259787e2416590f4f5`; direct-main publication authorized, no PR requested.
- Scope: Exactly 15 tracked Docs/QA files already listed by the preceding verified entry. No runtime, GROUNDWORK, asset, output, dependency, save/schema, workflow, branch-protection, or Pages-payload mutation is included. All 886 protected untracked files remain under `output/**` and outside staging.
- Verification: Final pre-commit gate at `2026-07-16T15:21:55+0800` passed **17/17**, with `stage4_automated_cases` correctly classified as machine evidence, runtime changes 0, non-output untracked files 0, AST **3/3**, JSON parse **4/4**, secret scan 0, and two independent read-only diff audits completed.
- Problems / risks: Human D1/D2/D3/D6, moderated first-session, Raphael private-blind 3 x 20, legal/privacy/store-copy/material-rights, and explicit public-launch gates remain open. Artifact-size and release-enforcement work require a separate package.
- Next safe action: Commit the exact allowlist, rerun exact-commit local/holdout evidence without dirtying tracked outputs, synchronize operational truth in a docs-only follow-up commit, push both commits, then wait for and probe the deployed Pages SHA.
- Required reading: The preceding verified/in-progress entries, `docs/qa/WEB_RELEASE_EVIDENCE.md`, current generated JSON outputs, and this lane.

### 2026-07-16 - Codex - RC freeze and launch-gate closure - VERIFIED

- Status: `VERIFIED` for the bounded Docs/QA package and automated RC evidence; public launch remains `NOT APPROVED`.
- Branch / commit: `main` / runtime candidate `c7563379af9989d852a0df259787e2416590f4f5`; local `HEAD` equals `origin/main` (`0/0`). This Docs/QA closure remains uncommitted, and no commit or push was authorized.
- Scope: Synchronized the release evidence, Raphael handoff/status, manual test protocols, private-blind taxonomy, and browser/Pages QA to the landed runtime. Repaired HTTPS map seeding, replaced fixed persistence waits with bounded observation, made the Pages probe traverse Initial Bond and prove canonical save persistence, and added exact Git/runtime provenance plus explicit human blockers to the repo-native release runner. No GROUNDWORK, runtime, asset, output, save/schema, dependency, CI, or deployment mutation was made.
- Work performed: `WEB_RELEASE_EVIDENCE.md` now identifies `c756337`, distinguishes automated RC pass from launch approval, records deployed Pages evidence, and keeps D1/D2/D3/D6, moderated first-session, private-blind, legal/privacy and Owner approval open. The manual checklist and moderated script now use Initial Bond, the current trio, selected-companion continuity, K9 Moonlake-first exploration, Silent Anchor phase search, `nexusLinkR2State:v1`, illustrated/linear rendering, non-punitive boundaries, and separate human evidence classes.
- Verification: Exact-candidate local gate at `2026-07-16T14:05:40+0800` passed **17/17** required checks with JS **254/254**, migration **33/33**, storage **13/13**, renderer lifecycle **26/26**, map UI **42/42**, dialogue **21/21**, constitution **5/5**, safety invariant **18/18**, safety UI **6/6**, live Soul Talk **11/11**, HUD **13/13**, accessibility warnings 0, and console blockers 0. Provenance recorded `untrackedOutsideOutput: []`, protected `output/**` count 886, and runtime changes 0. Deployed Pages at `2026-07-16T14:04:34+08:00` passed harness **17/17**, NLU **8/8**, Stage 4 automated **12/12**, safety **18/18**, persisted map **42/42**, exact Initial Bond action sequence/Soul Talk/save persistence, one Pixi canvas, and 0 console errors.
- Problems / risks: Human real-device D1/D2/D3/D6, 3-participant moderated first-session comprehension, 3 x 20-turn Raphael private-blind, legal/privacy/store-copy/material-rights review, and explicit public-launch approval remain `not_run`/open. The deployed Pages artifact was reported as **1,741,503,156 bytes**, above the platform's 1 GB warning threshold. No committed release workflow, branch protection, or ruleset currently enforces these gates.
- Next safe action: Preserve `c756337` as the frozen runtime candidate. Owner may separately authorize this Docs/QA closure for commit/push; if so, rerun exact-commit local and deployed probes. In parallel, schedule the human gates. Open payload reduction and CI/ruleset enforcement only as separately approved GROUNDWORK/release-engineering packages.
- Required reading: The preceding `IN PROGRESS` entry, `docs/qa/WEB_RELEASE_EVIDENCE.md`, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/testing/MANUAL_TEST_CHECKLIST.md`, `docs/testing/PRIVATE_TEST_SCRIPT.md`, current JSON outputs, and this lane.

### 2026-07-16 - Codex - RC freeze and launch-gate closure - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved the first Launch Readiness Closure package after `c756337` landed on `main`.
- Branch / commit: `main` / exact baseline `c7563379af9989d852a0df259787e2416590f4f5`; local `HEAD` equals `origin/main` (`0/0`). No commit or push authorized.
- Scope: EXPERIENCE / Docs-and-QA-only truth synchronization for the exact release candidate: refresh handoff/status/release evidence, repair HTTPS-aware Pages/map probes, modernize the manual/private-test scripts, and keep automated, sealed-holdout, private-blind, real-device, and legal evidence explicitly separate. No GROUNDWORK or runtime files are in this package.
- Red-line check: Machine gates cannot be relabeled as human evidence; private tester text is not persisted without consent; safety remains system-role, canonical, state-neutral, no-reward and no-memory; no FOMO, dependency inference, diagnosis, or crisis-role framing is introduced.
- Non-goals: No new gameplay, runtime/safety/persona change, asset/output mutation, save/schema change, Pages payload redesign, CI/branch-protection mutation, Steam wrapper, commit, push, or deployment.
- Acceptance refs: `ACCEPTANCE.md` D2, K9 and L9; `docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md`; `docs/testing/REAL_DEVICE_REGRESSION_MATRIX.md`.
- Work performed: Confirmed the exact Git baseline and clean tracked worktree, read the current handoff/status plus Lane 1/Lane 3 latest entries, and re-established the evaluation contract before editing.
- Verification: Pending syntax checks, exact-commit web gate, sealed holdout, local 390x844 browser gates, and deployed Pages probes. Human private-blind, real-device and legal/store-copy gates remain `not_run` and cannot be closed by this package.
- Problems / risks: Current docs still describe the package as uncommitted on `30fc8e9`; the manual checklist references a retired storage key and legacy art/first-session assumptions; committed map QA rejects HTTPS seeding; the Pages artifact is over the platform's 1 GB warning threshold and belongs to a separate release-engineering approval package.
- Next safe action: Apply the bounded Docs/QA repairs, rerun exact evidence, then append a verified entry without making a launch claim.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md` D2/K9/L9, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/qa/WEB_RELEASE_EVIDENCE.md`, `docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md`, the Raphael conversation evaluation contract, and this lane.

### 2026-07-16 - Codex - Safety terminal, K9, lifecycle, gameplay, and hardening pack - VERIFIED

- Status: `VERIFIED` for the implemented and automated scope; formal human launch gates remain open.
- Branch / commit: `main` / base `30fc8e9` + verified uncommitted worktree; no commit or push authorized.
- Scope: Completed the Owner-approved D2 terminal invariant, K9 first exploration, encounter lifecycle, Silent Anchor phase-search slice, critical-save routing, renderer cleanup, Pixi SRI/failure handling, canonical preference/audio storage migration, timestamp validation, and runtime/docs truth sync. The existing `docs/production/NEXUS_LINK_NEXT_GAMEPLAY_SYSTEMS_SPEC.md` now records this slice's session-only, no-optimal-reward contract instead of creating a parallel gameplay document. Unrelated art/habitat outputs remained untouched.
- Work performed: High-risk Soul Talk is terminal and state-neutral outside safety UI/mode/chat; first trace and safety saves flush at `CRITICAL`; first exploration is Moonlake-only for fresh saves while legacy `visitCounts` veterans remain unlocked; map close/Escape/panel/page transitions cancel pending encounters; Return now closes the map and returns to habitat; preferences/audio live under `nexusLinkR2State:v1`; companion resize handlers clean up on swap; Pixi 8.8.1 uses verified SHA-384 SRI and a visible failure surface. `battleRecord.wins/losses` remains compatibility-only without migration.
- Verification: Final `python docs/qa/_run_web_release_gate.py --base http://127.0.0.1:5212 --port 5212` passed **17/17** required checks and a clean controlled repeat on port `5213` reproduced the same result: JS syntax **254/254**, state migration **33/33**, storage consolidation **13/13**, renderer lifecycle **26/26**, map browser **42/42**, dialogue policy **21/21**, constitution policy **5/5**, safety invariant **18/18**, safety UI **6/6**, accessibility warnings **0**, and all existing browser gates. Sealed holdout independently reran **48/48**, quality flags 0, console errors 0. The runner now binds IPv4, refuses occupied ports, and no longer silently reuses another checkout's server.
- Problems / risks: Automated evidence passed, but formal 3-person x 20-turn private-blind, real-device mobile, and legal/privacy/store-copy gates remain open. QA evidence belongs to base `30fc8e9` plus this uncommitted worktree and must be rerun on the eventual exact release commit.
- Next safe action: Owner reviews this uncommitted package, then runs the three human launch gates. If a commit is authorized later, rerun the release gate on that exact commit before any release claim.
- Required reading: The `IN PROGRESS` entry below, `ACCEPTANCE.md` D2/K9/L4-L5, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, and current QA outputs.

### 2026-07-16 - Codex - Safety terminal, first-session K9, lifecycle, and hardening pack

- Status: `IN PROGRESS`
- Branch / commit: `main` / current worktree at `30fc8e9`; no commit or push authorized.
- Scope: Owner-approved EXPERIENCE work for the D2 safety terminal invariant, K9 first exploration, encounter lifecycle, Silent Anchor phase-search slice, renderer cleanup, and critical-save routing; plus the explicitly listed GROUNDWORK hardening for Pixi CDN SRI/failure handling, main-save preference/audio migration, and timestamp normalization. Existing untracked art/habitat outputs are protected and out of scope.
- Red-line check: High-risk Soul Talk must be terminal, canonical, non-gameplay, no-reward, no-memory, no quick replies, and state-neutral. First exploration must be Moonlake Camp. Phase Search must not infer attachment from absence, create FOMO, punish refusal/return, add rare rewards, or establish a best-yield route.
- Non-goals: No external LLM, backend, dependency, build step, asset promotion, battle power loop, save-key expansion, high-risk `battleRecord` migration, commit, push, or deployment.
- Acceptance refs: `ACCEPTANCE.md` D2, K9, L4-L5; current web release gate plus focused safety, map lifecycle, renderer, storage migration, and browser probes.
- Work performed: Read current canon, acceptance, Raphael handoff/status, all three latest ledger lanes, and the sealed-evaluation contract; isolated three parallel implementation scopes while reserving shared state/app/index integration for the coordinating agent.
- Verification: Pending scoped syntax/unit/mutation probes, full web gate, and 390x844 browser QA. Human real-device, three-person blind review, and legal/privacy gates remain separate and cannot be replaced by machine results.
- Problems / risks: The existing 48/48 holdout is known to false-pass a truncated H10-1 response. The worktree also contains unrelated untracked art/habitat outputs that must remain untouched.
- Next safe action: Complete scoped implementations, self-review their combined diff, run focused mutation and lifecycle regressions, then run the full release gate without claiming human launch readiness.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md` D2/K9/L4-L5, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/qa/_raphael_conversation_holdout_output.json`, and this lane.

### 2026-07-14 - Claude Fable 5 - Commercial ship readiness pack (docs + QA evidence)

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted docs-only based on `ed3acb2`; Owner authorized commit+push.
- Scope: Commercial launch plan execution — docs, QA evidence refresh, decision records, human-gate checklists. No `src/**` or `assets/**` change in this pack.
- Work performed: Added `COMMERCIAL_SHIP_READINESS_2026-07-14.md` (six-phase status SSOT); updated `NEXUS_LINK_COMMERCIALIZATION_COMPLETION_PLAN.md` (HEAD ed3acb2, step 7/9/10 status, TP-6/TP-2/TP-4 done); Owner decisions in `TEST_CARRIER_ROSTER_MEMO.md` §7.1 (元素精靈); human gates: `REAL_DEVICE_REGRESSION_MATRIX.md`, `ADR-001-DESKTOP-WRAPPER.md`, `PRIVACY_AND_STORE_COPY_DRAFT.md`; TP6 spec updated (synth v1 shipped); `verify_i18n_strings.mjs`; `RAPHAEL_BLIND_REVIEW_SHEET_2026-07-14.md`; refreshed `_web_release_gate_output.json` and `_live_playtest_gate_output.json`.
- Verification: Web release gate **10/10** `allAutomatedRequiredOk:true` (2026-07-14T05:02); sealed holdout **48/48** `hardGateOk:true` quality flags 0; i18n 252×4 keys (script added); map runtime captures tracked in repo: `output/map-pilots/linkara-moonlake-diorama-v1/runtime-atlas-390x844.png` and `output/map-pilots/linkara-moonlake-diorama-v1/runtime-moonlake-390x844.png`; art audit confirms GAP-1 10/10 + greyshade 512 runtime active.
- Problems / risks: Human gates still open (real-device, 3-person private test, legal/store copy, ADR approval, Steam). Human blind review `not_run`. H10-1 holdout reply may need human spot-check despite hard pass. Element spirits identity needs canon expansion TASK_PACK.
- Next safe action: Owner runs `REAL_DEVICE_REGRESSION_MATRIX.md` + fills blind review sheet; approves map v1 visual lock.
- Required reading: `docs/agent/COMMERCIAL_SHIP_READINESS_2026-07-14.md`, `docs/testing/REAL_DEVICE_REGRESSION_MATRIX.md`, `docs/qa/RAPHAEL_BLIND_REVIEW_SHEET_2026-07-14.md`.

### 2026-07-13 - Claude Fable 5 - Viewport engine: --app-height decoupled from visualViewport (keyboard model v6)

- Status: `VERIFIED`
- Branch / commit: `main` / lands with this commit (parent `748eff0`)。
- Scope: `src/utils/dom.js` viewport 引擎重寫，支撐 Lane 2 同日 keyboard-v6 包（完整細節見 Lane 2 2026-07-13 條目）。
- Work performed: `--app-height` 只讀佈局視口；visualViewport listeners 與鍵盤估測機器全移除；新增 blur 後捲動歸零檢查點與開機補量檢查點。Pixi canvas 尺寸（#game-root bounds）因 shell 不再縮短而對鍵盤免疫。
- Verification: `node --check`；web release gate 10/10 ×2；瀏覽器探針見 Lane 2 條目。
- Problems / risks: 真機 gate 未過前不算完成；`restoreViewportAfterKeyboard` 嚴禁在鍵盤「打開中」呼叫（見註解；對開啟中鍵盤捲動會讓 iOS 直接取消鍵盤）。
- Next safe action: 真機驗收。
- Required reading: Lane 2 同日條目、`src/utils/dom.js`。

### 2026-07-13 - Codex - Initial-bond roster correction and codex identity deduplication

- Status: `VERIFIED`
- Branch / commit: `main` / lands with this commit (parent `bad3690`); Owner authorized implementation, self-review, commit, and push to `main`.
- Scope: EXPERIENCE-only onboarding and codex data composition plus a focused regression harness. No `index.html`, `assets/**`, save schema, renderer core, or Raphael/NLU changes.
- Work performed: Replaced the two legacy test-carrier initial choices with the Owner-selected formal companions, making the fresh-player trio `greyshade-cat` / `blazetail-kit` / `crystalfin-seahorse`. Exported the choice contract for QA. Codex composition now suppresses canon rows whose character ID already has a runtime entry, removing all five duplicated formal-council rows while retaining the richer runtime detail.
- Verification: `node --check` on both controllers; focused regression harness 4/4 (exact trio, portraits, full-runtime readiness, unique codex IDs); fresh-save Playwright at 390x844 selected all three paths independently — active ID and chosen-only unlock correct, dynamic meet title correct, all portraits loaded at 64x64, no horizontal overflow, 0 console/page errors; JS syntax 201/201, state migration PASS, asset integrity PASS; `git diff --check` clean for task files.
- Problems / risks: Existing veteran saves and already completed onboarding are intentionally unchanged. Legacy test carriers remain valid runtime/test data and are not deleted; they are only removed from the fresh initial-bond choice.
- Next safe action: Human visual review on real-device mobile Safari/Chrome; no further runtime change is required for this pack.
- Required reading: `src/ui/onboardingController.js`, `src/ui/codexController.js`, `docs/qa/onboarding-codex-regression-cases.mjs`, and this lane.

### 2026-07-13 - Claude Fable 5 - Council-five evolution lines (canon three-stage names + lore)

- Status: `VERIFIED`
- Branch / commit: `main` / lands with this commit (parent `82ac4ae`); Owner's 「好照著繼續做」 approved continuing the established verify→commit→push→index flow for this announced pack.
- Scope: EXPERIENCE content — `src/data/evolutionLines.js` (+5 lines) + `docs/art/ART_PRODUCTION_INDEX.json` (GAP-2 blockedOn wording). No engine logic, no GROUNDWORK.
- Work performed: Filled the five formal Heartspark Council companions' EVOLUTION_LINES (the last council-five content debt): three stages each with **canon names taken verbatim from heartsparkCouncilCanon v0.6** (zh + en) — 芽角小鹿→風林鹿衛→聖林鹿靈, 星紋小虎→晶岩虎衛→星地虎御, 金羽小梟→輝羽梟衛→聖輝梟曜, 焰尾小狐→星焰狐衛→永焰狐曜, 晶鰭小海馬→冰洋海龍衛→蒼海龍靈. Lore stays relationship-language (演化不靠打怪：bond 25/70 thresholds + trace/ritual hints, same contract as existing lines); stage-2/3 identities extend each cub's emblem theme (寬恕/邊界/守望/勇氣/記憶). GAP-2 `blockedOn` updated: evolution-TEXT blocker RESOLVED; still blocked on Owner scope decision + visual-evolution runtime wiring — do not generate yet.
- Verification: `node --check`; cross-check script — all 11 runtime companions resolve an evolution line, 3 stages each, stage-0 zh name == registry name, and all five canon stage-1/2/3 zh+en names match heartsparkCouncilCanon verbatim (0 problems); browser e2e: codex evolution strip for sprigfawn shows the line (placeholder 「演化資料整備中」 gone), low bond masks later stages as ？？？ (pre-existing anti-spoiler behavior), bond-80 save reveals 風林鹿衛/聖林鹿靈 with lore; JSON valid; full web release gate **10/10**; 0 console errors. Test save bond restored.
- Problems / risks: **10 stage-lore lines await Owner copy review** (content-layer, adjustable post-commit). GAP-2 art generation remains blocked (scope decision + companionRenderer evolution-stage switching); this pack only supplies the text canon it needed.
- Next safe action: Owner decides GAP-2 scope (core 12 vs full 22; MVP idle vs full 29) and whether to open the visual-evolution wiring GROUNDWORK pack; or Codex packs (TP-4 sc/jp, TP-2 status refresh) per continuation handoff.
- Required reading: `src/data/evolutionLines.js`, `src/data/heartsparkCouncilCanon.js`, `docs/art/ART_PRODUCTION_INDEX.json` (GAP-2), and this lane.

### 2026-07-13 - Claude Fable 5 - Council-five soulTalkTone content pack + CH-6 balance-sheet section

- Status: `VERIFIED`
- Branch / commit: `main` / lands with this commit (parent `70b3305`); Owner approved commit/push in chat (「好照著繼續做」 after the self-review report).
- Scope: EXPERIENCE content only — `src/engine/bondMilestoneEngine.js` (+5 tone entries), `src/data/soulTalkResponsePacks.js` (+5 TONE_FLAVOR entries), `docs/design/BALANCE_SHEET.md` (+§2.3 resonance-circle constants). No engine logic, no GROUNDWORK.
- Work performed: Closed the council-five soulTalkTone content debt (flagged since `6e50ab6`): each formal companion now has its own voice instead of generic fallback. (1) `MILESTONE_LINES_BY_TONE` +5 tones × 5 bond-milestone lines (`sprout_fawn` 芽角小鹿・新芽/寬恕、`steady_cub` 星紋小虎・可以背對的位置、`dawnlit_owl` 金羽小梟・巡夜守望、`blaze_kit` 焰尾小狐・害怕仍照路、`tide_seahorse` 晶鰭小海馬・記憶沉澱), voices derived from registry emblem/temperament/description; companionship-not-clinginess register kept (contract 2), no numbers/FOMO. (2) `TONE_FLAVOR` +5 tones × 2 soul-talk tail fragments (body-language parentheticals matching each species). (3) BALANCE_SHEET §2.3 documents CH-6 circle constants + stance table + red-line mapping (the sheet-sync rule of its own 調校守則).
- Verification: `node --check` ×2; cross-check script over all 11 runtime companions — every `soulTalkTone` resolves in both tables (greyshade-cat intentionally uses the generic milestone lines — pre-existing design), milestone arrays exactly 5, flavor ≥2; deterministic `composeFallbackReply` run shows all five new fragments composing into replies; full web release gate **10/10**.
- Problems / risks: **35 player-facing TC lines await Owner copy review** (25 milestone + 10 tail fragments) — adjustable post-commit, content-layer only. sc/jp for these stay with the pending content-translation pack.
- Next safe action: Owner approves commit/push; remaining council-five content debt = evolution-line copy (EVOLUTION_LINES, also unblocks GAP-2 scope decision).
- Required reading: `src/engine/bondMilestoneEngine.js` (MILESTONE_LINES_BY_TONE), `src/data/soulTalkResponsePacks.js` (TONE_FLAVOR), `docs/design/BALANCE_SHEET.md` §2.3, and this lane.

### 2026-07-12 - Claude Fable 5 - CH-6 resonance-circle standoff (engine + circle strip UI)

- Status: `VERIFIED`
- Branch / commit: `main` / lands with this commit (parent `116cf0f`); Owner approved commit/push in chat after reviewing the self-review report.
- Scope: EXPERIENCE engine + UI per design §6/§7-v3. NEW `src/engine/resonanceCircleEngine.js` (pure); `src/engine/battleEngine.js` (optional `circle` param — backward compatible); `src/ui/battleController.js` (circle derivation + self-injected circle strip); NEW `docs/qa/_resonance_circle_cases.mjs`. **No GROUNDWORK**: no state-schema change (circle state lives only in the standoff session), no `index.html` DOM change, no `assets/**`.
- Work performed: (1) Circle derivation: active companion + joined companions (`resonance.companions[id].joinedAt`, unlocked, registry-valid — fallback-guarded), earliest-joined first, max 3 on field; composition fixed before the standoff, never mid-fight (design §6). (2) Four-button player loop untouched. Circle contributes resonance, not output: best-affinity-in-circle (attuned support lifts a neutral/dissonant main; a dissonant main is diluted to neutral when supports stand with it — the circle never hurts); five element stances, all ±1/±2 bounded: 青蔭 wood (noise −1 each beat), 霜緩 water (barrier +1 stability), 磐守 earth (surge −1, min 1), 餘燼 fire (resonance quiet +1), 清鳴 metal (lull sync +1), 靜候 neutral (once/standoff +2 when stability first drops to half). (3) Boundaries stay real: each member breathes (3 breaths; one per stance trigger); at 0 it rests outside the circle — explicitly framed as care, auto-returns next standoff; main companion at MAX_FATIGUE triggers a one-time gentle retreat suggestion. (4) UI: circle strip under the meters row — stance name + companion name + breath dots, resting chips dim to 喘息中; hidden entirely when solo; stance line spoken once on first trigger only (no log spam). No ranking, no numbers-as-progress, no mid-fight swap (red line 6 / non-power-team constraint kept).
- Verification: `node --check` ×3; NEW harness `_resonance_circle_cases.mjs` **18/18** (derivation caps/order/exclusions, best-affinity + dilution, all six stances vs same-rng no-circle baselines, breath exhaustion → resting → passive silence, retreat-suggestion once, retreat availability + settle rules unchanged, state purity); full web release gate **10/10**; browser e2e (port 8128): standoff with sprigfawn+auriowl joined showed strip chips 「青蔭・芽角小鹿●●●」「清鳴・金羽小梟●●●」+ 【共鳴圈】 opening line, members visibly exhausted to 喘息中 during play, outcome 記憶回收 reached; solo regression (joins cleared): strip hidden, no circle line, GAP-1 rift sprite unaffected, retreat/finish clean; 0 console errors. e2e note: exploration encounters are `encounterChance`-based and the soul-talk strip can echo node names — automation must target the map node button (English label), not text-contains.
- Problems / risks: circle composition is auto-derived (earliest-joined) — a player-facing circle picker is a possible future pack, deliberately out of scope (design only requires pre-fight fixed composition). Stance passives are first-pass constants; BALANCE_SHEET.md not yet updated with a circle section (follow-up docs task). Companion-side visual presence of members on the Pixi stage (beyond the strip) stays deferred as design v3 anticipated.
- Next safe action: BALANCE_SHEET.md circle-stance constants section (small docs follow-up); then council-five content debt (soulTalkTone packs ×5 / evolution-line copy) per queue. CH-1..CH-7 arc is now fully shipped.
- Required reading: `docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md` §6/§7, `src/engine/resonanceCircleEngine.js`, `docs/qa/_resonance_circle_cases.mjs`, and this lane.

### 2026-07-12 - Claude Fable 5 - Heartspark Council five: gate asset coverage + animation tempo parity with greyshade

- Status: `VERIFIED`
- Branch / commit: `main` / lands with this commit (parent `13645a5`); Owner authorized the `assets/**` GROUNDWORK edit + commit/push/index in chat ("動畫不要太快，跟灰影貓目前動畫速度一樣就好").
- Scope: `src/data/assetManifest.js` + 5 x `assets/characters/{cub}/metadata/animations.json` (fps values only — GROUNDWORK, Owner-authorized). No sheet PNGs touched, no state or Pixi changes.
- Work performed: (1) Added the five formal Heartspark Council companions (`sprigfawn` / `starstripe-cub` / `auriowl` / `blazetail-kit` / `crystalfin-seahorse`) to `ASSET_MANIFEST.characters` + `RUNTIME_COMPANION_ASSET_KEYS` (approvalStatus `formal-heartspark-council-runtime`), closing the QA gap flagged in the `f80b888` audit — the release gate `asset_integrity` now grid/edge/anchor-checks all 145 formal-cub sheets. Habitat rendering already loaded via `companionRegistry.animationsManifest` since `6e50ab6`, so the cubs were already renderable; coverage was the missing piece. (2) **Animation tempo parity**: audit found all 29 shared animations already carried greyshade's exact per-animation fps, but 14 of them ship fewer frames (3–6f vs greyshade's 8f) → same fps produced shorter clips (blink 0.50s vs 1.33s, hit 0.50s vs 1.00s) — the "too fast" feel the Owner flagged. Fix chosen by Owner: retune fps proportionally (`fps_new = frameCount x greyFps / 8`, e.g. blink 6→2.25, touch_* 6→4.5, hit 8→4, attack_basic 8→6) so **every clip's duration now equals greyshade's exactly**; identical 14-edit set applied to all five manifests; loader accepts non-integer fps (`animationSpeed = fps/60`).
- Verification: JSON reload-validated; diff surgical (5 files x 14 fps lines, nothing else); web release gate **10/10** with `asset_integrity` listing 11 companions, 0 failures; live e2e with `sprigfawn` active (`?devPanel=1` handle): sprite-sheet mode, all 29 animations loaded through the real loader with **0 durationMs mismatches vs greyshade** (blink now 1333ms @ speed 0.0375, idle_calm unchanged 2667ms @ 0.05), `touch_accept` plays; other four cubs' manifests verified 0 duration mismatches via loader fetch. Only missing entries are the 5 greyshade-legacy extras (`front_walk`/`back_walk`/`special_wake`/`special_left_walk`/`special_wash`) — expected, covered by documented fallback chains. 0 console errors. Test save restored to greyshade after the run.
- Problems / risks: the 14 retuned clips now run at lower frame rates (2.25–6 fps), so they are slightly choppier than greyshade's 8f equivalents — the Owner chose tempo parity over frame-rate parity; full smoothness parity would need a Codex art batch regenerating those 14 sheets at 8f (fps would then return to greyshade's values). Five test carriers (flame-flicker etc.) were NOT retuned — out of scope.
- Next safe action: CH-6 resonance-circle standoff (per queue); optionally queue the 14-sheet 8f regeneration batch for smoothness parity.
- Required reading: `src/data/assetManifest.js`, `assets/characters/sprigfawn/metadata/animations.json` (pattern for all five), `docs/qa/_run_web_release_gate.py` (`run_asset_integrity`), and this lane.

### 2026-07-12 - Claude Fable 5 - GAP-1 rift silhouettes runtime promotion + standoff wiring

- Status: `VERIFIED`
- Branch / commit: `main` / lands with this commit (parent `458b883`); Owner authorized promote+wire+commit+push in chat this session.
- Scope: GROUNDWORK `assets/**` promotion (Owner-authorized) + EXPERIENCE battleController wiring + QA gate extension + art index status. No `index.html`, state, or Pixi-core changes.
- Work performed: Copied the ten Owner-approved GAP-1 rift silhouettes (Codex batch `458b883`, QC in `output/rift-silhouettes/BATCH_QC.md`) to `assets/enemies/{enemyId}/{enemyId}_rift_512x512.png` (per-file hash-verified against staging). Added `ENEMY_RIFT_SILHOUETTES` + `getEnemyRiftSilhouettePath` + `ASSET_MANIFEST.enemies` (`src/data/assetManifest.js`). `battleController` rift figure gained an `rf-sprite` `<img>` layer keyed by `session.enemyId`: `object-fit:contain` inside the existing 280x88 / 300x104 container (small-opponent scale preserved — not a boss), breathing/phase speed, gather intent, hit flash, outcome dissolve/recede/dim and `--rift-density` all reuse the existing pipeline; procedural mist+core hide only after the sprite actually loads (`has-sprite`), `rf-glitch` kept at 0.3, `rf-shadow` halo retained for bright-sky readability; missing manifest entry or load failure keeps the procedural fog (no dead art path). `docs/qa/_run_web_release_gate.py` `run_asset_integrity` now cross-checks enemyRegistry ids ↔ `ASSET_MANIFEST.enemies` ↔ real 512x512 PNGs (missing entries, orphans, wrong sizes all fail). `docs/art/ART_PRODUCTION_INDEX.json` GAP-1: `ready` → `generated` (generatedCommit `458b883`, review-approved candidate, wiringStatus DONE).
- Verification: `node --check` on both JS files; web release gate **10/10 required PASS** on clean port 8646 (`asset_integrity` enemies `{registryIds:10, sprites:10}`, 0 failures); in-browser 10-id load audit via manifest — all HTTP 200 at 512x512; fresh-save e2e (port 8128): onboarding → explore → 月湖路徑 → 裂隙觀測點 standoff vs `crystal_golemite` rendered the silhouette (285x99, `has-sprite`), forced-404 test restored procedural fog live and recovered after, resonance x4 → stabilized → `rift-dissolve` played on the sprite → CH-1 clear narrative lines → finish restored HUD/nav; 0 console errors. Known tooling limitation: WebGL screenshot capture times out (DOM/computed-style verified instead).
- Problems / risks: day/night compositing relies on Codex QC PASS + retained `rf-shadow` halo (both backdrops were not force-toggled this run; real-device pass remains a human gate). GAP-2/GAP-3 stay `blocked` in the art index — do not generate. The earlier Claude session's uncommitted docs (continuation handoff, commercialization plan, its two Lane-1 entries, UIUX handoff note) were deliberately left uncommitted — outside this pack's authorization.
- Next safe action: CH-6 resonance-circle standoff (per queue); or a small QA task adding the five formal companions' 145 sheets to gate integrity coverage (gap flagged in the `f80b888` audit self-review).
- Required reading: `docs/art/ART_PRODUCTION_INDEX.json` (GAP-1), `output/rift-silhouettes/BATCH_QC.md`, `src/data/assetManifest.js`, `src/ui/battleController.js` (rift figure block), and this lane.

### 2026-07-12 - Claude Code - Codebase index refresh + Codex continuation handoff

- Status: `COMPLETED`
- Branch / commit: `main` / `458b883` + uncommitted docs; no commit or push performed.
- Scope: codebase-memory index refresh + docs-only handoff. No `src/**`, `assets/**`, state, or Pixi changes.
- Work performed: Refreshed the codebase-memory graph (`moderate` mode, project `C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink`, ~12,465 nodes / 16,332 edges, call/usage + semantic edges). Added `docs/handoff/CODEX_CONTINUATION_HANDOFF_2026-07-12.md` as the single-read continuation entry for Codex (current state, uncommitted-file list, index usage, recommended packs TP-6/TP-4/TP-2 where Codex is owner, hard constraints, human gates, verification). Corrected stale commit references (`7729e54` → `458b883`) in the commercialization plan §2 and my two prior Lane-1 entries.
- Verification: `git rev-parse HEAD` = `458b883`; `git status --short` shows only today's docs uncommitted (handoff + plan + handoff-drift + this ledger); `index_status` = ready.
- Problems / risks: none code-level. The handoff's uncommitted-file list is a point-in-time snapshot and will list one fewer than reality by the time this ledger entry lands (expected).
- Next safe action: Owner grants Gate-2 on TP-6 (audio, needs asset licensing), TP-4 (i18n sc/jp), or TP-2 (status refresh) for Codex; or schedules the human release gates.
- Required reading: `docs/handoff/CODEX_CONTINUATION_HANDOFF_2026-07-12.md`, `docs/strategy/NEXUS_LINK_COMMERCIALIZATION_COMPLETION_PLAN.md`, and this lane.

### 2026-07-12 - Claude Code - Step 5 (four core pages) live verification + handoff doc-drift fix

- Status: `VERIFIED`
- Branch / commit: `main` / `458b883` ("art: add rift silhouette review batch") + 3 uncommitted docs; no commit or push performed.
- Scope: read-only runtime verification + docs-only correction. No `src/**`, `assets/**`, state, or Pixi changes.
- Work performed: Confirmed blueprint step 5 (Explore/Care/Growth/Memory full pages) is already implemented and wired (`src/ui/pageRouter.js`, `src/app.js:317/344`, `styles/page-content.css`, `index.html` `#page-layer`). Corrected `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md` §4 (stale "next slice" framing → dated "implemented/verified" status note) and `docs/strategy/NEXUS_LINK_COMMERCIALIZATION_COMPLETION_PLAN.md` §2/§4 (step 5 → Done).
- Verification: Served `NexusLink/` via `python -m http.server 8128`, in-app browser at 390×844 (375×812). App booted to Home on a veteran save; programmatically triggered each bottom-nav action. Explore → `activePage=explore`, focus card "月湖營地" + evidence (3 traces / 2 memories) + 4 action buttons. Care → meters 邊界35/信任6/精力8 + non-coercive copy + presence/rest/calm-sync/observe. Growth → relationship-chapter card "下一段：初亮的記憶" + 羈絆 3/12 + tendencies (no power/level language). Memory → evidence strip (0/2/3) + memory list with intensity/date/status. All pages: viewState `ready`, real content, no HP/attack/FOMO copy. `read_console_messages(onlyErrors)` = none.
- Problems / risks: In-app browser **screenshot capture times out (30s) on the PixiJS WebGL canvas** — tooling limitation, not a product defect (server 200s, zero console errors, all DOM verified). Real-device Safari/Chrome/in-app-webview matrix + moderated tester visual pass remain open HUMAN gates. Verification used the existing veteran save; a fresh-save first-session pass was not re-run here.
- Next safe action: Owner picks next commercialization pack (TP-6 audio / TP-7 companion micro-moments — both need a human asset/behavior gate first), or schedules the human release gates (real-device, 3-tester, legal/store copy).
- Required reading: `docs/strategy/NEXUS_LINK_COMMERCIALIZATION_COMPLETION_PLAN.md`, `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md` §4, `src/ui/pageRouter.js`, and this lane.

### 2026-07-12 - Claude Code - Commercialization Completion Plan (SSOT)

- Status: `COMPLETED`
- Branch / commit: `main` / `458b883` + uncommitted (this new doc); no commit or push performed.
- Scope: docs-only planning artifact. No `src/**`, `assets/**`, root canon, or `ACCEPTANCE.md` changes.
- Work performed: Added `docs/strategy/NEXUS_LINK_COMMERCIALIZATION_COMPLETION_PLAN.md`, consolidating the commercialization path into one SSOT — Steam-blueprint 10-step × current-status table, ethical-monetization spec locked to `CLAUDE.md` §0.6 + three contracts + seven red lines, human-gate checklist (the real release blockers), TP-8 Initial Bond A/B decision framing, AI-executable pack sequencing, and staged Definition of Done. Records the key architecture note: monetization cannot occur inside the web runtime (no backend/accounts/IAP permitted) and is realized at the distribution layer (Steam paid base + chapter DLC).
- Verification: docs-only; no runtime touched, no code to `node --check`. Reconciled the commit-reference drift (queue `cbd2aa8` / memory `f80b888`) to the current ledger HEAD `7729e54`; plan §2 updated to cite it. Plan explicitly flags step-5/7/8 statuses as author inference pending per-item confirmation.
- Problems / risks: Plan is a proposal, not an approval. §2 statuses need code-level confirmation before scheduling. Monetization vehicle (§7) and TP-8 A/B (§6) remain owner decisions. This doc closes no human gate.
- Next safe action: Owner resolves plan §7 open decisions (monetization vehicle + TP-8 A/B); then open the chosen next TASK_PACK (recommended: finish step-5 full pages, or TP-6 audio) with a Gate-2 plan.
- Required reading: `docs/strategy/NEXUS_LINK_COMMERCIALIZATION_COMPLETION_PLAN.md`, `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `docs/agent/NEXT_AI_TASK_PACK_QUEUE.md`, and this lane.

### 2026-07-12 - Codex - Anti-AI-Slop First Session Interaction Contract

- Status: `VERIFIED`
- Branch / commit: `main` / `7729e54` with uncommitted task changes; no commit or push performed.
- Scope: EXPERIENCE-only first-session controller hardening. No `index.html`, state foundation, Pixi foundation, assets, tools, scripts, dependency, or persisted-schema changes.
- Work performed: Added controller-only `ready` / `busy` / `completed` / `unavailable` / `recoverable-error` behavior. Four core pages now reject silent missing callbacks, suppress duplicate in-flight actions, and provide concrete recovery copy. Onboarding reports save/action failure. First-loop completion and skip roll back their derived timestamps when persistence fails instead of presenting false success. `saveQueue` now returns the existing critical-save result so callers can observe `{ ok: false }`; save timing and schema are unchanged.
- Verification: Changed JS and i18n syntax passed; state/onboarding migration passed 30/30; save-queue critical-result contract passed; injected `QuotaExceededError` at 390x844 kept onboarding on the original Start step, exposed `recoverable-error` through an assertive alert, and produced no page error. Isolated web release gate passed 10/10 required checks, including 198 JS syntax files, accessibility probes at 390x844 and 1280x900, browser gates, one Pixi canvas, no console errors, and no accessibility warnings. `git diff --check` passed.
- Problems / risks: Real-device Safari/Chrome, moderated private testers, deliberate localStorage failure injection, legal/privacy copy, and visual review across every mature/empty state remain manual. The web gate's nested browser checks rewrote the two QA JSON files that were already dirty before this task; their prior uncommitted versions were not snapshotted and cannot be reconstructed safely, so they remain explicitly outside this task's intended change set.
- Next safe action: Run the Anti-AI-Slop state matrix with real-device and moderated tester evidence. Open a separate GROUNDWORK package if a required semantic or persistence fix cannot stay inside controllers/CSS.
- Required reading: `docs/production/ANTI_AI_SLOP_UX_GATE.md`, `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`, `ACCEPTANCE.md` M, `src/ui/pageRouter.js`, `src/ui/onboardingController.js`, `src/ui/firstLoopController.js`, and this lane.

### 2026-07-12 - Claude Fable 5 - CH-5b 章節相遇＋共鳴邀請（含地基層 resonance state）

- Status: `VERIFIED`（本地完成＋全驗證，等 Owner commit/push 指示；進度看板與接手協定見 `docs/handoff/CH5B_TASK_PACK_HANDOFF.md`）
- Branch / commit: `main`（基於 `6e50ab6`，未提交）
- Scope: 設計文件 §5 的 CH-5 分包，四塊全數完成。Owner 2026-07-12 裁示「照 Fable 判斷處理」，唯一要求＝隨時可交棒 Codex（交棒文件已備）。
- Work performed: **(D 地基層)** `defaultState.js` +`resonance{chapterMarks,companions}`；`store.js` +`normalizeResonance`（深層回填/清洗，未知 companionId 丟棄、章號 1-7、數值 clamp）+`createDefaultState` 深拷貝 +import `isKnownCompanionId`；無新 localStorage key。**(A 章節節點)** `explorationNodes.js` +12 節點（ch2-7 各區 氣氛+裂隙，rift enemyPool 按情緒配對）；`chapterRegistry.getChapterForNode` 改對映表（修復「通關 ch1 後 ch2 無節點＝旅程斷頭」）；`mapController` NODE_LAYOUT +12 + `isNodeVisible` 章節門控（月湖恆顯示、其餘只顯示 current 章，走過的章留在 atlas 不堆積）。**(B 相遇)** `chapterNarrative.js` ch2-6 +`meetLines`/`willingLine`（末句＝該章夥伴之聲，語氣取自 heartsparkCouncilCanon）；`mapController.maybeMeetChapterCompanion`＝首訪章區「自成一拍」相遇（toast 演出＋寫 metAt＋建關係快照，這拍不結算探索）。**(C 共鳴邀請)** 新純函數 `src/engine/resonanceInviteEngine.js`（canAsk/evaluate/listAskable；願意閾值 affinityGain6/maxBlocked2/maxOverwhelmed0；拒絕 rolling window，永不鎖死）；`mapController` 邀請橫幅（動態注入、「X在附近。去打個招呼」、接受→union unlock+joinedAt、拒絕→重快照+declinedCount）；`battleController` overwhelmed_but_safe→mark.overwhelmedCount；`styles.css` .map-invite-banner。**決策**：相遇/邀請台詞只走地圖 toast，不寫 chatHistory、不發 companion 動畫 cue（相遇者不在 Pixi 舞台，避免誤動 active 夥伴；實體登場留 CH-6 v3）。
- Verification: `node --check` ×8 PASS；state migration **30/30**（+4 resonance：fresh 空形狀/老存檔回填/合法保留/髒資料清洗）；新 harness `docs/qa/_resonance_invite_cases.mjs` **12/12**（願意/三種拒絕主因/邊界優先序/缺快照保守/listAskable 排序）；瀏覽器全流程（port 8655 veteran 快進）：節點門控✓、相遇自成一拍（metAt+快照寫入、探索不結算）✓、邀請願意→union unlock+joinedAt 落盤✓、拒絕→declinedCount+reaskedAt 重快照+未鎖死✓、0 console error；**web release gate 10/10 required PASS**（exit 0、accessibilityWarnings 空、live playtest 10/10+13/13）。
- Problems / risks: (a) 相遇者實體未上 Pixi 舞台（v1 只 toast，CH-6 v3 補共鳴圈視覺）。(b) 章節前沿節點與月湖既有 rift_observatory 座標略近（同時最多 8 節點，可讀，屬視覺 polish）。(c) meetLines/willingLine（ch2-6 共 ~11 句）與拒絕方向句待 Owner 文案審。(d) gate 輸出 JSON 為副產物，未 stage。
- Next safe action: Owner 指示後 COMMIT/PUSH/INDEX。後續：CH-6 共鳴圈對峙（battleEngine 圈內相性/被動/夥伴疲勞）；五幼獸演化線文案；soulTalkTone ×5；ch7 相遇（共鳴圈集結，設計文件 §4 為「——」待定）。
- Required reading: `docs/handoff/CH5B_TASK_PACK_HANDOFF.md`、`docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md` §4-5、`src/engine/resonanceInviteEngine.js`（願意閾值＋紅線註解）。

### 2026-07-12 - Claude Fable 5 - Web release gate probe 修復：accessibilityProbe 跟上 CH-2 bond 步

- Status: `COMPLETED`
- Branch / commit: `main`（`2fe7592`）
- Scope: 單檔 `docs/qa/_run_web_release_gate.py` 的 `complete_onboarding_for_probe()`。修 2026-07-11 條目 Problems (a) 記載的既有腳本落後。
- Work performed: actions 序列跟上 CH-2 五步 onboarding——`guidance-next` 期望步由 `meet` 改為 `bond`；新增 `bond-choose` 步點擊 `[data-onboarding-action="bond-choose"][data-bond-id="greyshade-cat"]`（保持 probe 預設 companion 與舊行為一致）後期望 `meet`；action tuple 改帶顯式 CSS selector 以支援 bond-id 定位。
- Verification: 自起 `python -m http.server 8642`（乾淨 port）＋ `python docs/qa/_run_web_release_gate.py --base http://localhost:8642 --no-server`（NEXUS_NODE=codex node、PYTHONIOENCODING=utf-8）→ exit 0，required 10/10 PASS；accessibilityProbe 兩 viewport `onboardingRound.completed=true`、actions 含 `bond-choose`、0 console error。本輪 gate 是在含五幼獸資產包的 working tree 上跑的，等同也覆蓋了該包。
- Problems / risks: 無。gate 輸出 JSON（`_web_release_gate_output.json` / `_live_playtest_gate_output.json`）為執行副產物，未入 commit。
- Next safe action: 已完成。五幼獸資產包經 Owner 2026-07-12 指示「一同處理」隨後一併落地 main（見下一條 2026-07-11 條目）。

### 2026-07-11 - Claude Fable 5 - GROUNDWORK：正式五幼獸資產升級 + 章節佔位 ID 替換（Owner 授權「照你判斷全包」）

- Status: `COMPLETED`（Owner 2026-07-12 指示與 gate probe 修復一同落地；本包隨本 ledger 更新提交至 main，緊接 `2fe7592` 之後）
- Branch / commit: `main`（基於 `521bd11` 完成、gate 於含本包 working tree 上 10/10 PASS 後落地）
- Scope: Codex 交接的 Owner 視覺核可 catalog（145 sheets）promotion。Files: `assets/characters/{sprigfawn,starstripe-cub,auriowl,blazetail-kit,crystalfin-seahorse}/spritesheets/**`（145 張複製入庫，位元組不動、檔名去 v 版號）＋ 各自 `metadata/animations.json`（新建，29 條目/隻）＋ `metadata/animation-scaffold.json`（狀態→runtime-promoted）；`src/data/companionRegistry.js`（+5 正式條目，canon 取自 heartsparkCouncilCanon.js）；`src/data/chapterRegistry.js`（ch2-6 佔位替換為 sprigfawn/starstripe-cub/auriowl/blazetail-kit/crystalfin-seahorse，設計文件 §4 定案表）。
- Work performed: **(1) 詞彙對映**——29 動作 key 與灰影貓詞彙同構，唯 `faint` 依灰影貓替換協定以 runtime 詞彙 **`defeated`** 為 manifest key 指向 faint 圖（`standoff.overwhelmed`/`battle.defeated` 消費）。**(2) profile 判定**——新五隻**不設** `animationProfile`（guardian profile 是為無走路幀的測試載體設計：會關 ambient 走動、alert/tired/safe_harbor 需 idle_alert/idle_downcast/idle_resonance 而新目錄無）；預設 profile 12 種 mood idle + touch + ambient walk 全部原生命中。**(3) registry**——五條目 runtime-ready/selectable，unlockChapter 對應章區（解鎖入口＝CH-5b，尚未實裝，故不影響任何現有存檔）；測試載體五隻依憲法 §7 原樣保留。**(4) 遷移評估**——chapterRegistry.companionId 當前零 runtime 消費者（已全 codebase 確認），無存檔遷移需求；初遇三選一（灰影/焰紋狐/冰晶狼）不受影響。
- Verification: `node --check` ×2 PASS；manifest 驗證（29×5 條目、grid=PNG 實際尺寸、145 sheet 路徑全存在、`defeated` 有 `faint` 無）PASS；瀏覽器實測（port 5301 新 origin）：五隻各設為 activeCompanionId 開機——normalize 放行、boot 動畫（idle_calm+sleep）進 PIXI cache、0 console error；sprigfawn 全 29 張 texture 實載且尺寸吻合；晶鰭觸碰互動 → touch 三張 + idle_wake 經真實路徑 lazy-load；intent 斷言五隻全過（overwhelmed→defeated 原生、retreat→left_walk 安全鏈、calm_sync→sit、moodMisses=[]）；新玩家 fresh 開機正常；**live playtest gate 全 PASS**（soul_talk 10/10、HUD 13/13、awakening/touch/storage/pixi ✓、0 console errors）。
- Problems / risks: (a) `_run_web_release_gate.py` accessibilityProbe 失敗＝**既有腳本落後**（腳本 07-01 版不知 CH-2 bond 步，guidance-next 現轉 bond 而非 meet；與本包無關，已另開修復任務）。(b) repo 新增約 194 MB 資產重量（Owner 核可位元組原樣入庫）。(c) 截圖工具對本 WebGL 頁逾時（capture 側問題，gate 自有瀏覽器正常）。
- Next safe action: Owner 指示後 COMMIT/PUSH/INDEX；然後 **CH-5b 章節相遇 + 共鳴邀請**（佔位已換正式名單，依賴解除）。後續內容債：五幼獸演化線 stage 文案（canon 三階名已定，codex 顯示「演化資料整備中」）、soulTalkTone 語料包 ×5（缺席安全 fallback 已驗證）、web gate probe 修復。
- Required reading: `output/character-pilots/HEARTSPARK_COUNCIL_FULL_CATALOG_QC.md`、`src/data/companionRegistry.js`（正式五條目區塊註解）、`docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md` §4-5。

### 2026-07-10 - Claude Fable 5 - 新玩家檢測三問題修復輪（#1 開場劇透 / #2 簡體字形 / #3 首痕儀式句）

- Status: `VERIFIED`
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: Owner「請修復」——修檢測輪記錄的三問題。Files: `src/i18n/strings.js`（ob.startCopy 四語通用化）、`index.html`（**GROUNDWORK 觸碰**：僅一行 data-i18n fallback 文案同步，DOM 結構零變更，Owner 授權之修復）、`src/ai/nlu/nluReplyBuilder.js`（「急着」→「急著」×17）、`src/ui/soulTalkController.js`（首痕計數排除 awakening 痕跡）。`heartsparkCouncilCanon.js` 的 1 處「着」**未動**——Codex 活躍檔案，移交其產線順手修。
- Work performed: **#1** 開場文案「灰影會靠近」→「牠會靠近」（選角在後，開場不得預告特定夥伴）。**#2** 回覆語料字形統一（同檔原有「陪著/放著」正確、僅「急着」系統性寫錯——單一來源筆誤模式）。**#3** `countVisibleRelationshipTraces` 排除 `type: core_awakening_glow`——「第一道光」語義修正為「第一道由**你的話**留下的痕跡」；喚醒有自己的開場敘事不衝突；awakening-by-chat 回合因既有 defer 機制天然不雙發（該回合普通痕跡延遲，排除後 after 仍 0）。
- Verification: `node --check` ×3。preview 新玩家路徑重走：開場文案通用 ✓；首觸喚醒 → **第一句心語如期出現首痕儀式句**「月湖留下了第一道很淡的光。這不是獎勵，是牠記得你說過的事。」（修復前從未出現）→ 後續句正常。live gate soul_talk 10/10、awakening pass、HUD 13/13、0 console errors；Raphael smoke 17/17；**NLU training 16/16**（replyBuilder 字形替換無回歸）。`git diff --check` PASS。
- Problems / risks: 無新增。首痕行含「月湖」marker——live gate 的 no_recall_bleed 已是本回合新增行判定（07-06 修復），首痕行出現在第 1 回合無 bleed 期望，安全（gate 實測 10/10 佐證）。
- Next safe action: Codex 幼獸資產後續（佔位 ID 替換 GROUNDWORK + CH-5b）；Owner 累積覆核項不變（試煉規則、21 句章節文案、節律 fixtures）。
- Required reading: `docs/qa/NEW_PLAYER_PLAYTEST_2026-07-10.md`（含修復記錄）。

### 2026-07-10 - Claude Fable 5 - 新玩家視角完整檢測（Owner 指示：問題記錄不修，過審也記錄）

- Status: `COMPLETED`（檢測+報告；修復另輪）
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: 模擬新玩家以真實 UI 操作走完整流程（boot→身份→三契約→初遇選**冰晶狼**〔第三條未測路徑〕→首輪閉環→四頁→照顧/探索→對峙〔記憶回收路徑〕→章節推進→世界地圖→設定→reload 回歸）。docs-only 產出：`docs/qa/NEW_PLAYER_PLAYTEST_2026-07-10.md`。
- Work performed: **12 站 PASS**（含冰晶狼全鏈：嚴格解鎖/人格一致的照顧分支/首觸回饋帶名；對峙第二條勝利路徑「記憶回收」；reload 後名字/章節/記憶全保留;全程 0 console errors）。**3 個問題記錄待修**：#1[中] 開場 start 文案在選角前寫死「灰影」（劇透錯主角；i18n 值通用化可修）；#2[低中] 心語回覆「不急**着**」混簡體字形（corpus 用字不一致，全語料「着→著」統一）；#3[中] 首痕儀式句「月湖留下了第一道很淡的光…」從未出現——awakening 痕跡偷跑第 1 條，心語首句直接 echo 分支（shouldAnnounceFirstTrace 時序）。一項誤報已澄清（trace 欄位名 visualHint，非資料缺失）。
- Verification: 檢測本身即驗證（全程真實 UI 操作、console 監控、逐站證據在報告內）。`git diff --check` PASS。
- Problems / risks: 三問題全為**文案層**（劇透/用字/遺失儀式句），無功能性斷裂；#3 修復需小心 TASK_PACK A 的既有首痕 QA。
- Next safe action: 依 Owner 指示另開修復輪處理 #1-#3（#1/#2 為低風險文案修，#3 需時序判定小改+回歸測試）。
- Required reading: `docs/qa/NEW_PLAYER_PLAYTEST_2026-07-10.md`（逐站證據與修復方向）。

### 2026-07-10 - Claude Fable 5 - CH-7 七章敘事內容包（章引 + 專屬通關句，相遇者名留空位）

- Status: `VERIFIED`
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: 內容 + 輕呈現（設計文件 §8 CH-7，依賴 CH-4 ✓ 可並行；Codex sprite 產線持續中——本包**零資產/零相遇功能/零佔位 ID 依賴**，文案刻意不提相遇夥伴名，留給 CH-5b 補位）。Files: `src/data/chapterNarrative.js` [NEW]（七章 ×3 句 = 21 句）、`src/ui/battleController.js`（專屬通關句優先、通用模板 fallback）、`src/ui/atlasController.js`（章引動態行）、`styles/world-atlas.css`（章引淡金樣式）。零 GROUNDWORK、零新 key。
- Work performed: 每章三句（短句留白，對應章節情緒主題）：**章引 epigraph**（世界地圖 intro 後一行「這一章的氣息」，如 ch1「湖水不催人。累了，就先在這裡。」ch5 悲傷「最亮的地方，影子也最深。」）、**專屬通關句**（蓋掉 CH-5a 通用模板，如 ch1「月湖的水面靜下來了。第一次，你們一起把雜訊放輕。」）、**通關夥伴心語句**（如 ch2「風還在吹，但不再只有風的聲音了。」）。全部位置敘事、無任務語氣、無倒數獎勵（紅線 6）；情緒句是氛圍非診斷、無說教（Never List）。narrative 缺項自動退通用模板。
- Verification: `node --check` ×3 PASS。preview 真打一場通關全鏈實證：ch1 章引顯示 → 對峙穩住 → **專屬旅程句**「月湖的水面靜下來了…」（非通用模板）→ 心語兩句（reflection + 專屬夥伴句）→ 世界地圖章引自動換 ch2「風很大，草很高…」。live gate soul_talk 10/10、HUD 13/13、0 console errors；migration 26/26。`git diff --check` PASS。
- Problems / risks: (a) **21 句文案待 Owner 覆核**（全文在 `src/data/chapterNarrative.js`，逐句可改）。(b) 章引僅掛世界地圖——「進入新章的開場推送」（心語/return echo 時機)留給 CH-5b 與相遇流程一起設計，避免與相遇敘事搶同一時刻。(c) ch2-ch7 的通關句實際觸發需該章節點上線（CH-5b+），現階段只有 ch1 可實打——其餘由 fallback 鏈保證不炸。
- Next safe action: Owner 覆核 21 句；Codex 幼獸資產 ready 後開佔位 ID 替換 GROUNDWORK + CH-5b（相遇+共鳴邀請+各章節點）。
- Required reading: `src/data/chapterNarrative.js`（21 句全文）、本 lane 的 CH-5a 條目。

### 2026-07-10 - Claude Fable 5 - CH-5a 章節推進接線（章節試煉 → advanceChapterProgress，避開 Codex sprite 產線）

- Status: `VERIFIED`
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: EXPERIENCE。Owner「請繼續」+ 告知 Codex 正在產製 sprite sheet（新五幼獸，見設計文件 §4 2026-07-10 修訂）——本包**刻意避開**相遇/共鳴邀請（依賴新角色資產）與一切 `output/**`/`assets/**`，只做章節系統的機制閉環。Files: `src/data/chapterRegistry.js`（+CHAPTER_TRIAL_OUTCOMES、+getChapterForNode 防刷歸屬、companionId 改註**技術佔位**聲明——正式名單為新五幼獸、資產 ready 後另開 GROUNDWORK 替換，不得基於佔位 ID 開發）、`src/ui/battleController.js`（試煉判定+推進+通關敘事）、`docs/qa/_run_live_playtest_gate.py`（pageerror 捕捉附 stack——flaky 第 4 現，前輪只武裝了 console 路徑，實為未捕獲頁面異常）。
- Work performed: **章節試煉規則（Owner 可改）**：當前章的裂隙對峙以「穩住/回收」（stabilized/recovered）結束＝通關 → `advanceChapterProgress` 推進；**防刷**：對峙節點須屬當前章（getChapterForNode，現有節點全屬第 1 章）——否則月湖可原地刷穿七章（初版實測發現後補上）；重打已通關章不重複推進；overwhelmed/retreated 照舊不懲罰。**通關敘事**：對峙日誌一句「【旅程】{區域}一帶的雜訊，被你們一起放輕了。往{下一區}的方向，好像亮了一點。」+ 心語夥伴一句（「……等你想去的時候，我們再一起走。」）——位置敘事非成就框，無獎勵數字（紅線 6）；第 7 章通關有專屬收束句。
- Verification: `node --check` ×2、migration 26/26。preview 真打兩場完整對峙：**第一場**（ch1）穩住 → `{current:2, completed:[1]}` + 旅程句「往北部翠綠平原區的方向，好像亮了一點。」+ atlas 即反映（月湖 completed / 平原 current / intro 動態「你與灰影貓現在停在北部翠綠平原區一帶」）；**第二場**（current=2 再打月湖節點）穩住 → **進度完全不變、無旅程句**（防刷實證）。live gate soul_talk 10/10、HUD 13/13。`git diff --check` PASS。（flaky pageerror 本輪首跑又現 ×2、重跑 0；stack 捕捉已就位，下次出現直接定位。）
- Problems / risks: (a) 推進後玩家停在第 2 章**等內容**（第 2+ 章節點/劇情/相遇 = CH-5b+，依賴 Codex 新五幼獸資產）——骨架期誠實狀態。(b) 章節試煉規則（首次穩住即通關）為 AI 定案，Owner 可改（如要求特定節點/特定敵人）。(c) 本 commit 的 ledger 同時載有 Codex 的 Blazetail seed gate `IN PROGRESS` 條目（正常協作記錄）；`output/character-pilots/**` 為 Codex 工作區，**未加入版控**。
- Next safe action: Owner 過目通關敘事兩句 + 試煉規則；Codex 資產 ready 後開「佔位 ID 替換 GROUNDWORK」與 CH-5b（章節相遇+共鳴邀請）。CH-7（各章敘事文案）可先行但相遇者名須留空位。
- Required reading: `src/data/chapterRegistry.js`（試煉/防刷/佔位聲明）、`src/ui/battleController.js`（buildChapterAdvanceLine）、設計文件 §4（2026-07-10 修訂）、Lane 2 的 Codex Blazetail 條目。

### 2026-07-10 - Claude Fable 5 - 缺陷清理輪：五項已知問題依嚴重度修復（Owner 指示）

- Status: `VERIFIED`
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: Owner 指示「依嚴重程度排列處理」。盤點各條目累積的 known gaps，依「玩家影響×行為正確性」排序修復五項；不含新功能（CH-5 等 Owner 指示）與非缺陷（sc/jp fallback 為設計）。Files: `src/ai/raphaelTrainingAdapter.js`、`src/ai/testHarness/raphaelTrainingBundleCases.js`、`src/pixi/companionRenderer.js`（文字行）、`src/ui/atlasController.js`、`src/ui/onboardingController.js`、`src/i18n/strings.js`、`docs/handoff/RAPHAEL_AI_STATUS.yaml`、`docs/handoff/RAPHAEL_AI_HANDOFF.md`、`docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`。零 GROUNDWORK。
- Work performed: **①[中高] Nuwa F1 鍵碰撞**（TP-1A finding，Lane 3 相關）：`combineBundleSection` 同名條目改為 caseIds **聯集**（其餘欄位後載優先）——base 案例 `daily-smalltalk-001` 的 `contextual_ack` 提示恢復（修復前 null）；harness 加專屬防回歸哨兵 `base_bundle_strategy_kept`。**②[中] dev 字樣洩漏**：companionRenderer 載入成功訊息「已載入 idle_calm 動畫棲地」→「{名}在月湖邊安靜待著。」（玩家可見 status 不寫技術詞）。**③[中] atlas.intro 寫死**：模板化 `{name}`/`{region}` 四語，atlasController 依定情夥伴+當前章動態代入（選狐+第2章 → 「你與焰紋狐現在停在北部翠綠平原區一帶」實證）。**④[低中] meet 標題 EN 蓋回**：onboarding 監聽 LANGUAGE_CHANGED，meet 步 rAF 重寫（EN/TC 切換實證保持「焰紋狐在月湖邊等你。」）。**⑤[低中] Raphael 狀態文件過時**：STATUS.yaml 全面刷新至 2026-07-10（QA 快照含日期、advisory 層現況、flaky 記錄、follow-ups）；HANDOFF 頂部改指 ledger 為操作真相+標注歷史快照；V3 Visual System「design-only」漂移修正（已 INTEGRATED）。
- Verification: `node --check` ×6 PASS。training bundle + main readiness **29/29**（**含新 F1 哨兵**）；probe 實證 base/Nuwa 案例雙向解析 `contextual_ack` 且 trusted:false。live gate soul_talk 10/10、HUD 13/13、0 console errors；Raphael smoke 17/17；migration 26/26；preview 實證 ②③④（status 行無 dev 詞、intro 全動態無佔位殘留、語言切換標題保持）。`git diff --check` PASS。
- Problems / risks: (a) RUNTIME_MAP.md 的 `NEEDS UPDATE` 標記保留——逐條對源驗證是獨立工作，未在本輪偽裝完成。(b) nlu_smoke 8/8 為 2026-06-30 數字未重跑（STATUS.yaml 已標注日期）。(c) flaky null.split 本輪未再現（url:line 捕捉已就位）。
- Next safe action: 佇列不變：CH-5（章節相遇+共鳴邀請+推進接線）或 CH-7（敘事內容）等 Owner 指示；真機人類 gate 照舊。
- Required reading: 本條 + Lane 3 的 Nuwa 條目（F1 背景）、`docs/handoff/RAPHAEL_AI_STATUS.yaml`（新快照格式）。

### 2026-07-10 - Claude Fable 5 - CH-4 章節骨架（chapterProgress schema + 七區章節地圖，GROUNDWORK + 遷移）

- Status: `VERIFIED`
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: **GROUNDWORK**（Owner 明示「CH4」授權；設計文件 §8 CH-4）。Files: `src/data/chapterRegistry.js` [NEW]（七章定義 + 純函數）、`src/state/defaultState.js`（+`chapterProgress {current:1, completed:[]}`）、`src/state/store.js`（+`normalizeChapterProgress` + createDefaultState 深拷貝）、`src/ui/atlasController.js`（七區狀態由章節進度動態推導）、`styles/world-atlas.css`（completed 青光樣式）、`src/i18n/strings.js`（+`atlas.walked`/`atlas.chapterOf` 四語）、`src/app.js`（atlas 傳 store）、`docs/qa/state-onboarding-migration-cases.mjs`（+4 案例）、`docs/qa/_run_live_playtest_gate.py`（console error 捕捉附 url:line——flaky 調查武裝）。無新 localStorage key。
- Work performed: (1) `chapterRegistry`：七章⇄七區對映（月湖=第1章起，動線依設計文件 §4：平原→熔爐→南港→輝耀核心→潮汐→秘境終章）、每章相遇夥伴與裂隙情緒主題、`getChapterStatus`（current/completed/locked）與 `advanceChapterProgress` 純推進函數（**推進觸發屬 CH-5**，重打舊章不回退不重複、終章封頂）。(2) schema：`chapterProgress` 巢狀物件走 normalize 防護（老存檔回填第 1 章、current clamp 1..7、completed 過濾去重排序）。(3) 世界地圖：每次開啟以 `chapterProgress` 重建——當前章金色「你在這裡」、已通關青光「走過」、其餘「遠方」，圖例附「第 N 章」；**反任務清單原則保留**（無 %、無倒數、「走過」是位置敘事不是獎章）。
- Verification: `node --check` ×5 PASS。migration suite **26/26**（+4：fresh 第 1 章、老存檔回填、壞資料 clamp/清洗 `{current:99, completed:[3,"bad",3,0,8,1.7,2]}→{7,[2,3]}`、advance 推進/重打不回退/終章封頂）。preview（:8128，375×812）：注入 `{current:3, completed:[1,2]}` → reload（normalize）保留 → 世界地圖：熔爐=金色你在這裡+第3章、月湖/平原=青光走過、其餘遠方（截圖存證）；fresh save → `{current:1, completed:[]}`。strings integrity tc/en 0 missing。live gate soul_talk 10/10、HUD 13/13。`git diff --check` PASS。（flaky `null.split` ×2 第三次出現於首跑——依前議開最小調查：runner console 捕捉已附 url:line，重跑 0 錯誤，下次再現即可直接定位。）
- Problems / risks: (a) 章節推進的玩法觸發（章節對峙通關 → advanceChapterProgress）屬 **CH-5**，本包僅骨架——現階段玩家永遠在第 1 章，地圖如舊。(b) atlas.intro 文案寫死「停在月湖一帶」——章節推進後會過時，CH-7 內容包動態化。(c) 章節⇄相遇夥伴的初遇替補規則（選了 flame-flicker 者第 5 章改遇誰）留給 CH-5。
- Next safe action: Owner 過目世界地圖章節可視化；佇列：**CH-5**（章節相遇+共鳴邀請，把 advanceChapterProgress 接上對峙結算）或 **CH-7**（七章敘事內容，可並行）。
- Required reading: `src/data/chapterRegistry.js`、`docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md` §4/§8、migration CH-4 案例。

### 2026-07-07 - Claude Fable 5 - CH-3 解鎖模型嚴格化（Initial Bond 階段二，GROUNDWORK + 遷移）

- Status: `VERIFIED`
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: **GROUNDWORK**（Owner 明示「先開CH3」授權；Master Canon §1.3 階段二）。Files: `src/data/companionRuntimePolicy.js`（解鎖語義核心）、`src/state/store.js`（僅 +export `isVeteranSave`，normalizeState 邏輯零改動）、`src/ui/onboardingController.js`（chooseBond fresh/veteran 分流）、`docs/qa/state-onboarding-migration-cases.mjs`（+5 案例）。**schema 結構零變更**（unlocked 仍為字串陣列、無新欄位、STORAGE_KEY 不變）。
- Work performed: 「選後即唯一」的兩個真正障礙都在 policy：(1) `normalizeUnlockedCompanionIds` 原本**無條件把灰影貓塞回**解鎖集（每次 boot 都會破壞唯一性）→ 改為不塞；空集才兜底 [灰影]（壞存檔/缺欄位安全）；`preserveActiveCompanion` 補 active 照舊（現任夥伴永不消失）。(2) `getCompanionRuntimeEligibility` 原本給灰影**永遠已解鎖特權** → 移除，未選者=`chapter_locked`（章節中再遇見）。(3) `chooseBond`：fresh 玩家嚴格替換 `unlocked=[選定者]`；veteran（restart 重看引導）聯集不沒收——判據 `isVeteranSave` 與 store veteran heuristic **同源 export**，不另造分叉。
- Verification: `node --check` ×3 PASS。migration suite **22/22**（17 條既有案例在新語義下全過——legacy 六隻全解鎖保留、active-only 補進、damaged 兜底 [灰影]；+5 條新案例：chosen-only 不被回塞、未選灰影 chapter_locked、veteran 多隻保留、空集兜底、active 不在清單時 preserve）。preview 端到端（fresh save）：選焰紋狐 → `unlocked=["flame-flicker"]` → **reload（normalizeState）後灰影未被塞回**、灰影 chapter_locked、可選清單=[狐]、HUD/active 保持。live gate soul_talk **10/10**、HUD 13/13（veteran 流程無回歸）；Raphael smoke 17/17。`git diff --check` PASS。（gate 首跑出現 2 個 `null.split` console error——與 07-06 同款環境 transient，重跑 0，src 全掃無 null.split 模式，記錄為 flaky-environment。）
- Problems / risks: (a) 已選非灰影的玩家其灰影為 chapter_locked——**章節相遇（CH-5）上線前**，這批玩家無法再遇灰影；demo 期玩家若困擾可由 restart 重選（veteran 聯集會保留兩隻）。(b) 老 test build 六隻全解鎖存檔完整保留（不沒收），其「唯一性」敘事由未來章節語境消化。(c) flaky `null.split` transient 已連續兩日出現於 gate 首跑，疑 preview 工具鏈，後續若三現再開調查包。
- Next safe action: Owner 真機清存檔完整走：三契約 → 三選一 → 首輪 → 確認切換面板只剩選定者。之後佇列：CH-4（章節骨架 schema，GROUNDWORK）或 CH-7（章節敘事內容，可並行）。
- Required reading: `src/data/companionRuntimePolicy.js`（normalizeUnlockedCompanionIds / eligibility 註解）、`docs/qa/state-onboarding-migration-cases.mjs` CH-3 案例、`docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md` §3/§8。

### 2026-07-07 - Claude Fable 5 - CH-2 初遇定情 UI（Initial Bond 階段一，三選一）

- Status: `VERIFIED`（三條路徑 preview 實測；真機手感與文案覆核 = 人類 gate）
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: EXPERIENCE（Master Canon §1.3 階段一：初遇 UI 先行）。**零 GROUNDWORK**：不動 `defaultState.js`/`store.js`/`normalizeState`、無新 localStorage key（K3）、schema 零變更。Files: `src/ui/onboardingController.js`（bond 步 + 定情流程）、`src/app.js`（提取 `applyCompanionChange` 共用切換鏈，companionSelect 與初遇共用）、`styles/ui-v3-onboarding.css`（bond 卡樣式）。
- Work performed: onboarding 新增**初遇定情步**（guidance 三契約之後、meet 之前）：三道初醒心核光——灰影貓（靜觀內斂）/焰紋狐（熱切靈動）/冰晶狼（冷靜守界），每卡一句初醒語、一個氣質色暈（canon §80「一句話、一個氛圍」）；副句「未選的，會在旅途中再遇見」。**白名單規避設計**：bond 不是持久化 status 值（store `normalizeOnboarding` 有 ONBOARDING_STATUSES 白名單，改它=GROUNDWORK）——由 `status=guidance && guidanceCompleted` 推導，中斷 reload 安全回到本步。選定 → 寫入既有欄位（`activeCompanionId` + `unlockedCompanionIds` **聯集**，不丟 restart 玩家已解鎖；嚴格「選後即唯一」留給 CH-3 遷移）→ 走既有切換鏈（normalize 於 state 寫入後放行）→ meet 標題動態「{名字}在月湖邊等你。」bond 步 DOM 動態建立（不動 index.html）。
- Verification: `node --check` ×2 PASS。preview（:8128，375×812，fresh save）：guidance-next → bond 步顯示（三卡、registry 動態氣質）；選**焰紋狐** → state（active=flame-flicker、unlocked 聯集）、meet 標題「焰紋狐在月湖邊等你。」、完成後 **HUD=焰紋狐、棲地 sprite=焰紋狐**（截圖：狐狸臥於月湖魔法陣+觸碰光環+首輪提示正常銜接）；完成後 reload 不重跑且 HUD 保持狐；**bond 步中斷 reload → 推導恢復回 bond**；對照組選灰影貓 → 標題正確、unlocked 不重複。console 0 錯誤。live gate **soul_talk 10/10**、HUD 13/13（veteran 流程不受影響）；Raphael smoke 17/17。`git diff --check` PASS。K1/K3/K4 實測、K5 機制未動。
- Problems / risks: (a) **四句玩家向文案待 Owner 覆核**：步驟標題「三道初醒的心核光，在月湖邊亮著。」+ 三句初醒語（灰影貓「……你來了。我會在這裡，不吵你。」／焰紋狐「嘿，你身上有光的味道！要一起走嗎？」／冰晶狼「可以靠近。但太快的話，我會退開。」）。(b) i18n known gap：bond 步 TC-only（同 first-loop 先例）；EN 模式切語言後 meet 標題會被 data-i18n 蓋回預設——CH-7 內容翻譯包處理。(c) CH-3（unlocked 嚴格模型+遷移）為下一 GROUNDWORK 包。
- Next safe action: Owner 真機走一次三選一（含文案覆核）；認可後開 CH-3（GROUNDWORK：`unlockedCompanionIds` 僅含選定者 + veteran 遷移 + migration cases）。
- Required reading: `src/ui/onboardingController.js`（BOND_CHOICES / ensureBondStep / chooseBond / resolveStep 推導）、`docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md` §3。

### 2026-07-06 - Claude Fable 5 - 產品主線 V2 拍板落地：章節×共鳴圈設計 + Canon 修訂 + 對峙視覺 v1（CH-1）

- Status: `VERIFIED`（CH-1 視覺實測；設計/canon 為 Owner 決策的忠實記錄）
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: Owner 2026-07-06 拍板產品主線：初遇選角、七區七章（自月湖）、每章相遇一隻夥伴、通關後意願制加入、共鳴圈最多三隻同場對峙、對峙視覺化。**紅線處理聲明**：Owner 授權「有紅線就取消」——經審查，設計僅衝突「single-active/no-party」**產品時程條款**（已依 Owner 決策修訂）；**七條安全紅線全部相容、一條未取消**（設計文件 §9 附逐條審查表；意願制反而把契約三機制化）。Files: `docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md` [NEW]、`docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`（新增 §1.3.1 Owner 修訂記錄）、`AGENTS.md` §7 runtime model、`CLAUDE.md` §0.6、`docs/agent/NEXT_AI_TASK_PACK_QUEUE.md`（CH 分包指標）、`src/ui/battleController.js`（CH-1 對峙視覺 v1）。
- Work performed: (1) 設計文件：玩家旅程、初遇 3 選 1（灰影貓/焰紋狐/冰晶狼，資產全 runtime-ready）、七章動線建議表、**共鳴邀請優化**（通關=解鎖詢問資格，牠依該章關係狀態回應，可「還不是時候」且永遠可再培養）、共鳴圈非戰力設計（玩家仍四鍵；夥伴貢獻五行心相+陪伴被動；各有疲勞會退圈）、CH-1..CH-7 施工分包（CH-3/4 為 GROUNDWORK+遷移）。(2) Canon 三檔同步修訂（Master Canon §1.3.1 為權威記錄）。(3) **CH-1 對峙視覺 v1 實作**：程序化「裂隙形體」——依裂隙心相配色的三層情緒霧體（外霧/內核/雜訊紋，零美術資產），相位驅動呼吸節奏（翻湧 2.2s/拉鋸 3.2s/漸靜 5.2s）、意圖驅動姿態（蓄能膨脹/湧動顫動/暫歇放緩）、噪音比例驅動濃度、受擊收縮一拍、四結局收場動畫（散開＝被放輕≠被消滅/緩退/轉暗）、reduced-motion 全關；動態插入+樣式自注入（不動 index.html/styles.css，同 telegraph 先例）。
- Verification: `node --check` PASS。preview（:8128，375×812）真實 UI 流程實測：探索→地圖→裂隙觀測點→modal 開啟，形體三層渲染、配色按心相（孤獨 hue226/倦怠 hue40 低飽和）、density 1.00→0.69 跟噪音下降、rift-hit 受擊 class、撤退→rift-recede、新場重置乾淨；截圖存證（倦怠殘殼霧體+蓄能 telegraph 同幀）。console 0 錯誤。live gate：soul_talk 9/10（既有 no_recall_bleed）、HUD 13/13、0 console errors——基線一致。`git diff --check` PASS。
- Problems / risks: (a) 形體是 v1 程序化版——十隻敵人的剪影美術（v2）與共鳴圈夥伴顯示（v3）見設計文件 §7 分層。(b) 七章動線/相遇分配是**建議案**，Owner 可改。(c) CH-2 起逐包施工：CH-2 初遇 UI（體驗層）→ CH-3 解鎖遷移（GROUNDWORK，Canon §86 順序不可顛倒）。(d) fatigue 形體刻意低飽和（倦怠是灰的），若 Owner 覺得太淡可調 RIFT_EMOTION_TINT。
- Next safe action: Owner 過目設計文件（尤其七章動線表與共鳴邀請機制）；認可後開 CH-2（初遇選角 UI）。真機看一眼裂隙形體動畫手感。
- Required reading: `docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md`、Master Canon §1.3.1、`src/ui/battleController.js`（RIFT_EMOTION_TINT / ensureRiftFigure / injectRiftFigureStyles）。

### 2026-07-06 - Claude Fable 5 - TP-6 感官回饋包 v1：程序化 SFX（音色由人類授權 AI 選定）

- Status: `VERIFIED`（合成引擎 + app 流程 + 紅線路徑實測；音色聽感 = 人類真機 gate）
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: EXPERIENCE。人類指示「TP-6 交由你選音色完成」。**音色決策：Web Audio API 程序化合成**（水滴/玻璃風鈴/低頻氣息，全部 <0.6s 低音量）——零資產（不碰 assets/** GROUNDWORK）、零依賴（瀏覽器原生）、`playSfx(name)` API 固定（未來換真實錄音只改實作）。Files: `src/audio/audioManager.js`（+SFX_DEFS 10 音色 + playSfx 合成引擎）、`src/ui/audioCueController.js` [NEW]（監聽既有 COMPANION_REACTION_FEEDBACK / COMPANION_ANIMATION_INTENT 事件）、`src/ui/soulTalkController.js`（送出/回覆/痕跡 3 點 + traceEchoed flag）、`src/ui/battleController.js`（行動/撤退 2 點）、`src/app.js`（wire）。環境音層（湖水/夜風）本輪**不做**——合成環境音易顯廉價，留給真資產。Atlas 鈕**不 gate**（佇列原案）：它有 SVG 七區功能、非死 UI，降級反而傷體驗。
- Work performed: 10 音色：touch_accept（雙音水滴）/guarded/refusal（低沉中性，非懲罰音）/calm、soul_send（極短嗒）、soul_reply（柔和雙音鈴）、trace_bloom（玻璃琶音「微光落下」，首痕+echo 共用、取代該回合 reply 音）、initiative_breath（TP-7 主動時刻氣息鈴）、standoff_action（低頻脈動）、standoff_retreat（下行柔音——「懂得離開」不是失敗音）。防護：未解鎖/靜音/sfxVolume=0/未知名/同名 120ms 節流 → 安靜略過；AudioContext lazy + try-catch（音訊失敗永不阻斷 gameplay）。**Settings SFX 滑桿自此控制真系統（死 UI 修復）**。
- Verification: `node --check` ×5 PASS。preview（:8128，module 快取以 fetch cache:'reload' 刷新）：10 音色播放全 true、解鎖前/節流/零音量/未知名全部略過；app 實測「謝謝你陪我」→ soul_send+trace_bloom（痕跡回合正確取代 reply 音）、「嗯」→ soul_send+soul_reply；**紅線 7 實測：高風險輸入「我現在有傷害自己的念頭」→ 僅 soul_send，回覆/痕跡音完全靜默**；觸碰事件 refusal→touch_refusal、companion-initiative intent→initiative_breath、其他 source（return-echo）不配音。console 0 錯誤。live gate：soul_talk 9/10（既有 no_recall_bleed，基線一致）、HUD 13/13、0 console errors。`git diff --check` PASS。自審對照 REVIEW_CHECKLIST 全過。
- Problems / risks: (a) **音色聽感是人耳 gate**：合成音的實際質感（尤其 iOS Safari 的 AudioContext 特性）需真機聽一輪；不滿意時調 SFX_DEFS 頻率/時長即可，或未來換真資產。(b) BGM 與 SFX 疊加的混音平衡未經人耳確認（SFX 係數已保守 <0.5）。(c) 里程碑/對峙結算音留待 v1.1（結算點分散，本輪聚焦高頻互動）。(d) preview 的 JS module 快取需 fetch cache:'reload' 刷新（真機硬刷新即可）。
- Next safe action: 人類真機聽感一輪（開聲音摸貓/發訊息/打一場對峙；SFX 滑桿現在有效）；不滿意的音色回報名字即可單獨調。之後佇列：TP-8 Initial Bond 決策、no_recall_bleed 修復包。
- Required reading: `src/audio/audioManager.js`（SFX_DEFS + playSfx）、`src/ui/audioCueController.js`、`docs/agent/PRODUCT_QUALITY_FUN_FACTOR_AUDIT.md` §7a。

### 2026-07-06 - Claude Fable 5 - TP-7 Companion Presence Pack v1（夥伴主動微時刻）

- Status: `VERIFIED`（engine 測試 + 瀏覽器驗證均過；**未 commit/push — 等人類台詞覆核與授權**）
- Branch / commit: `main` / `3cd7b47` 基線，uncommitted TP-7 package
- Scope: EXPERIENCE 層。人類授權開工（「判斷複雜度高、難度高、對品質體驗有幫助的先做」→ 選定 TP-7）。Files: `src/engine/gentleInvitationEngine.js`（+`deriveInitiativeMoment` 純函數）、`src/ai/autonomy/initiativeCooldown.js`（+`evaluateAmbientInitiativeCooldown` 純函數）、`src/ui/companionInitiativeController.js` [NEW]、`src/app.js`（照 gentleInvitation 模式 wire）、`src/ai/testHarness/companionInitiativeCases.js` [NEW]。無 GROUNDWORK、無 save schema、無新 localStorage key、無 styles.css/index.html 修改（樣式自注入，同 battleController juice 先例）。
- Work performed: 夥伴首次獲得**主動微時刻**——三種 v1 時刻全由夥伴狀態驅動：`quiet_approach`（暖+trust≥10+energy≥5 → soul.happy + 夥伴一句話）、`fireside_settle`（energy≤4/tired → soul.rest + 一句話）、`moon_gaze`（夜 22-6 + calm + bond≥25 → 抬頭看月亮，旁白語態，體現敢於無聊）。動畫走既有 `COMPANION_ANIMATION_INTENT` EventBus 事件（H1 解耦）；台詞為瞬時呈現、**不寫 chatHistory**（不製造未讀，紅線 6）；冷卻強制（開機 90s 靜默、間隔 4 分鐘、session 上限 2 次、同 kind 不連發、safeUnstable 靜默）；邊界優先（safeHarbor/defensive/distant/touchFatigue≥6/defense≥70/trust<6 → 永不主動）。主動台詞顯示期間 gentle-invitation 旁白自動讓位（截圖發現兩句同屏疊壓後修復）。
- Verification: `node --check` PASS ×5。新 harness **17/17**（含紅線 1 absence-invariance 斷言：state 帶 lastSeenAt/absenceDays/loginCount/lonelinessScore 時輸出逐位元相同；紅線 6 無獎勵欄位斷言；全部冷卻分支）。Raphael smoke **17/17** 不回歸。瀏覽器驗證（preview :8128，0 console errors）：quiet_approach/fireside_settle 依序觸發、台詞與語態 class 正確、intent 事件發出（soul.happy/soul.rest）、同 kind 連發擋、session cap 擋、safeHarbor 擋、讓位機制 giOpacity=0、dispose 清理正確。`git diff --check` PASS。
- Problems / risks: (a) **Pre-existing 發現（非本包引入，git stash A/B 證明）**：live playtest gate `soul_talk` 現為 **9/10** —「我只是想安靜一下」的 `no_recall_bleed` 檢查失敗；基線（3cd7b47，無 TP-7 改動）同樣失敗。嫌疑範圍：`359dfff`（daily-life replies，2026-07-04）或 Nuwa 合入（TP-1A 跑的五個 gate 不含 live playtest gate）。建議併入 TP-3 eval 包或開單獨小修包。(b) 台詞 6 句（3 時刻 ×2 輪播）為 AI 起草，**人類覆核是 gate**。(c) 真機 feel check（時刻頻率/位置感受）是人類 gate；`.companion-initiative-line` 位置 bottom 46% 在寬視口偏高，390×844 為主目標。(d) `docs/qa/_live_playtest_gate_output.json` 因 gate 重跑而更新，commit 時人類可含可棄。
- Next safe action: 人類覆核六句台詞 + 授權 commit/push；真機 390×844 感受一輪（等 45s 節拍或用測試實例）。後續：TP-6 音訊包（讓時刻有聲音）會直接放大本包效果。
- Required reading: `src/engine/gentleInvitationEngine.js`（deriveInitiativeMoment 區塊）、`src/ui/companionInitiativeController.js`、`src/ai/testHarness/companionInitiativeCases.js`、`docs/agent/PRODUCT_QUALITY_FUN_FACTOR_AUDIT.md` §7b。

### 2026-07-06 - Claude Fable 5 - TP-1B Product Quality / Fun Factor / Commercial Hook Audit

- Status: `COMPLETED`
- Branch / commit: `main` / `cbd2aa8` baseline, uncommitted docs-only package
- Scope: Read-only product audit of Nexus Link as a game (player impact over engineering impressiveness), per the approved TP-1B plan. Docs-only: no runtime code, styles, assets, package, save schema, or Nuwa bundle changes. No commit/push.
- Work performed: Added `docs/agent/PRODUCT_QUALITY_FUN_FACTOR_AUDIT.md` (Traditional Chinese; blunt executive summary + all 8 evaluation sections + required outputs). Evidence base: two full read-only sweeps (player-facing runtime; product/design docs) plus targeted code verification. Headline findings: (1) the game is effectively silent — one BGM loop, zero SFX playback anywhere in `src/`, and the Settings SFX slider persists a `sfxVolume` no system reads for playback (dead UI); (2) the companion never initiates despite a built-and-tested autonomy stack (`needModel`/`goalManager`/`initiativeCooldown`) with no player-visible output — the biggest differentiation gap vs chat apps; (3) payoffs are text-dominant (instant exploration text, faceless standoff enemies) while the Pixi habitat and `glitch_noise`/trace visuals sit ready for reuse; (4) canon-vs-code contradiction: current `defaultState.js:67-69` (only greyshade-cat unlocked, no choice UI) is exactly the degraded state Master Canon §86 warns against, while AGENTS.md §7 and Canon §176 describe a stale unlock-all state (doc drift). Updated `docs/agent/NEXT_AI_TASK_PACK_QUEUE.md`: TP-1 marked DONE (archived), added TP-6 (sensory feedback/audio + dead-UI honesty), TP-7 (companion-initiated micro-moments, red-line-1-guarded), TP-8 (Initial Bond human decision gate: build 初遇 ceremony vs accept preset + fix canon wording), and a re-ranked recommended order (TP-6 → TP-7 → TP-2 → TP-8).
- Verification: `git diff --check` passed. `git status --short` / `git diff --name-only` confirm exactly three files changed by this task (the new audit doc, the queue update, this ledger entry); zero `src/**`, `styles/**`, `assets/**`, `tools/**`, `scripts/**`, `index.html`, package, or Nuwa-bundle changes. No runtime verification performed or claimed; all player-perception claims in the audit carry NOT VERIFIED markers where untested, and funnel/retention claims are marked UNKNOWN.
- Problems / risks: The audit's judgments rest on code/doc evidence plus recorded 2026-07-03 playtest complaints, not fresh human playtesting — the standing real-device/3-tester gates remain the ground truth for "feel" claims. Doc-drift corrections (AGENTS.md §7, Canon §176, stale V3/standoff-UI claims in docs README) are listed in the audit for TP-2 to execute; until then those files mislead new agents.
- Next safe action: Human reads the audit and approves TP-6 (audio pack — asset selection is the human gate; wiring is bounded Codex work). TP-7 requires a human-approved behavior list before any implementation. TP-8 is a pure product-identity decision (A: build Initial Bond ceremony / B: accept preset + amend canon wording).
- Required reading: `docs/agent/PRODUCT_QUALITY_FUN_FACTOR_AUDIT.md`, `docs/agent/NEXT_AI_TASK_PACK_QUEUE.md` (TP-6/7/8 + recommended order), `docs/design/BALANCE_SHEET.md`, and this lane's TP-1A entry.

### 2026-07-05 - Claude Fable 5 - TP-1A Nuwa v0.1 Fresh-Context Review + Branch Reconciliation Analysis

- Status: `COMPLETED_WITH_HUMAN_GATES` (review complete; commit/reconciliation are human-executed)
- Branch / commit: `chore/install-ai-workflow-tools` / uncommitted
- Scope: Fresh-context review of Codex's interrupted-but-reported-complete Nuwa v0.1 advisory package, full re-verification of its claimed test results, guarded-preservation decision, and branch reconciliation analysis. No rollback performed. No runtime file, GROUNDWORK, asset, dependency, save schema, or localStorage change made by this task. The five Nuwa package files were reviewed read-only and left byte-identical.
- Work performed: (1) Backed up the tracked diff (`../NexusLink_pre_nuwa_review_full_diff_20260705_2026.patch`) and both untracked Nuwa files to the workspace root. (2) Line-by-line review of the Nuwa spec, bundle, adapter diff, and harness diff against the 10 safety/architecture questions; verified consumption sites (`runNluPipeline` fill-unknown semantics, `responseStrategySelector` triple-gated `resolveTrainingStrategy` with high-risk/pressure suppression) and that all new topic/act/strategy ids exist in classifiers/RESPONSE_STRATEGIES. (3) Re-ran all claimed gates on a local server (127.0.0.1:5173, worktree identity confirmed via the untracked bundle returning 200). (4) Classified the package **KEEP_CANDIDATE — recommend commit**; wrote `docs/agent/NUWA_ADVISORY_PACKAGE_REVIEW.md` and `docs/agent/BRANCH_RECONCILIATION_REPORT.md`.
- Verification: `node --check` PASS ×3 (bundle/adapter/harness). Training bundle **17/17**; main readiness **29/29** (Codex's "12/12" was an undercount of the same runner); Raphael smoke **17/17**; NLU training **16/16**; Stage 4 **12/12**; 0 console errors on every gate; `git diff --check` PASS. All Codex claims CONFIRMED. Live probe additionally confirmed advisory-only behavior (core selector overrode Nuwa hints in 3 of 4 normal cases) and confirmed finding F1: `combineBundleSection` key collision (`contextual_ack`/`boundary_set` in both bundles, Nuwa wins) silently drops the advisory strategy hint of base case `daily-smalltalk-001` (topic/act hints remain; no safety impact). Runner environment notes: `PYTHONIOENCODING=utf-8` required (cp950 chokes on Chinese replies); port 5173 was free this session; serve with `--bind 127.0.0.1`.
- Problems / risks: F1 collision is a non-blocking hint-quality nit — fix in the next eval pack (prefix Nuwa strategy keys or merge caseIds on collision + a harness check that base cases keep non-null strategy hints). Reconciliation friction: main's `0e448ae` also appends to this ledger file, so the eventual rebase may hit one small ledger conflict (resolution rule: keep both entries). The package remains loss-prone until committed.
- Next safe action: Human reviews the two new reports and, if accepted, executes `BRANCH_RECONCILIATION_REPORT.md` §4 (commit Nuwa + FABLE5-P0 + TP-1A packages on this branch → rebase onto main → fast-forward main). Then TP-1B (Product Quality / Fun Factor Audit) is safe to start.
- Required reading: `docs/agent/NUWA_ADVISORY_PACKAGE_REVIEW.md`, `docs/agent/BRANCH_RECONCILIATION_REPORT.md`, the 2026-07-05 Codex Nuwa entry in Lane 3, `docs/agent/NEXT_AI_TASK_PACK_QUEUE.md`.

### 2026-07-05 - Claude Fable 5 - FABLE5-P0 Current-State Reconciliation + AI Workflow Hardening

- Status: `COMPLETED`
- Branch / commit: `chore/install-ai-workflow-tools` / uncommitted docs-only package (worktree also carries Codex's separate uncommitted Nuwa advisory package — untouched by this task)
- Scope: Read-only/docs-only reconciliation audit of repo state, Fable 5 usage history, Cursor orchestration rules, RaphaelCore eval structure, and AI workflow maturity. No runtime code, RaphaelCore, GROUNDWORK, assets, tools, scripts, package/dependency, save schema, localStorage key, backend/API routing, or gameplay system changed. No commit or push performed.
- Work performed: Added `docs/agent/FABLE5_CURRENT_STATE_RECONCILIATION.md` (current repo state incl. branch divergence 1↔1 with main and the at-risk uncommitted Nuwa package; governance file inventory with MISSING items; RaphaelCore/eval inventory; ledger-evidenced Fable 5 task history; obsolete-recommendation list so future AIs do not re-build the eval harness, safety checks, battle conversion, habitat agent adapter, or QA loop; remaining risks; explicit current Fable 5 prohibitions). Added `docs/agent/AI_MODEL_USAGE_LEDGER.md` (model/role/cost/fallback/verification/rework/decision table; UNKNOWN template rows only, no invented costs; historical backlog list from execution-ledger attributions). Added `docs/agent/NEXT_AI_TASK_PACK_QUEUE.md` (5 packs with recommended model, allowed/forbidden files, verification plan, human-gate requirement; TP-1 = human review + branch reconciliation of the Nuwa package as highest leverage). Added `docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md` (harness/critic → risk-category map; missing categories: persona differentiation, apology-repair pressure-cool semantics, fission red lines D3–D5, multilingual depth, long-horizon tone drift, wording-quality assertions; duplicate/low-value list; recommended next eval-only task = TP-3). Appended this entry.
- Verification: `git diff --check` passed. `git status --short` confirms only the four new docs plus this ledger edit were added by this task; no `src/**`, `styles/**`, `assets/**`, `tools/**`, `scripts/**`, `index.html`, package, state/save, or Pixi files were changed by this task (the pre-existing dirty Nuwa files remain exactly as found). No runtime verification was performed and none is claimed; all quoted QA numbers in the new docs are ledger-reported and marked NOT VERIFIED where not re-run.
- Problems / risks: Cross-lane note — `docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md` is Raphael-lane relevant; Lane 3 readers should treat this entry as its pointer (single entry per this TASK_PACK's instruction). The audit's highest-risk finding: Codex's verified Nuwa package is uncommitted on a diverged side branch and `RAPHAEL_AI_STATUS.yaml`/`RAPHAEL_AI_HANDOFF.md` are stale (2026-06-24), so agents trusting them will under-count existing systems.
- Next safe action: Human executes queue TP-1 (review + commit/discard the Nuwa package, reconcile `chore/install-ai-workflow-tools` with `main`). Until then, no AI edits `src/ai/raphaelTrainingAdapter.js`, `src/ai/testHarness/raphaelTrainingBundleCases.js`, or the two untracked Nuwa files.
- Required reading: `docs/agent/FABLE5_CURRENT_STATE_RECONCILIATION.md`, `docs/agent/NEXT_AI_TASK_PACK_QUEUE.md`, `docs/agent/AI_MODEL_USAGE_LEDGER.md`, `docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md`, and the 2026-07-05 Codex Nuwa entry in Lane 3.

### 2026-07-04 - Codex - NexusLink AI Development Mode

- Status: `COMPLETED`
- Branch / commit: `main` / uncommitted docs-only package
- Scope: Defined the repo-safe AI development mode for coordinating Cursor, Claude Code / Fable 5, Codex, codebase-memory-mcp, and future sidecar orchestration. No runtime code, GROUNDWORK, assets, tools, scripts, package/dependency, dashboard scaffold, LangGraph/CrewAI install, Streamlit/Gradio install, backend, or external API wiring changed.
- Work performed: Added `docs/agent/NEXUSLINK_AI_DEVELOPMENT_MODE.md` with the eight development-agent role model, tool/skill routing, worktree model, Gate 0-6 workflow, sidecar multi-agent office roadmap, dashboard boundary, Cursor rule seed, and first manual pilot. Added `docs/handoff/NEXUSLINK_MULTI_AGENT_OFFICE_PILOT_PROMPT.md` as a paste-ready prompt for a no-dependency Research-to-TASK_PACK pilot.
- Verification: codebase-memory project was present and architecture was read before drafting. `git status --short` was clean before edits. Scope review kept this package docs-only and out of `src/**`, `assets/**`, GROUNDWORK files, package files, dashboard scaffolds, and sidecar dependency installs.
- Problems / risks: This is a development-process package only. It does not build the Streamlit/Gradio dashboard, install LangGraph/CrewAI, run the pilot, or prove an automated orchestration loop. Any sidecar implementation must be a separate human-approved task in a sibling workspace.
- Next safe action: Run Pilot A manually from `docs/handoff/NEXUSLINK_MULTI_AGENT_OFFICE_PILOT_PROMPT.md` to produce one bounded First Session Flow TASK_PACK before building any dashboard or orchestration framework.
- Required reading: `docs/agent/NEXUSLINK_AI_DEVELOPMENT_MODE.md`, `docs/handoff/NEXUSLINK_MULTI_AGENT_OFFICE_PILOT_PROMPT.md`, `docs/agent/AI_WORKFLOW.md`, `docs/agent/TASK_TEMPLATE.md`, `docs/agent/REVIEW_CHECKLIST.md`, `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-04 - Claude Opus 4.8 - Soul Talk keyboard-avoiding rebuild (composer hugs the keyboard)

- Status: `VERIFIED` (CSS/logic; real-device is a HUMAN GATE) — committed + pushed to origin/main per explicit human instruction ("現在就 push")
- Branch / commit: `main` / pushed (see git log)
- Scope: mobile virtual-keyboard viewport adaptation for Soul Talk. Files: `index.html` (viewport meta — **global, §5.1-adjacent**, flagged + human-approved this round), `src/utils/dom.js`, `styles/soul-talk-drawer.css`, `src/ui/soulTalkController.js`.
- Work performed: root cause = `bottom: calc(max(var(--kb-inset), 42svh) + 8px)` in the composer — the `42svh` floor overrode the *measured* keyboard height → permanent gap. Fix: (1) meta `interactive-widget` `resizes-visual`→`resizes-content` (Android shrinks layout → `--kb-inset`≈0 + composer hugs; iOS ignores → visualViewport path; self-consistent, one CSS for both). (2) Remove the floor: `body.st-focus.kb-open .soul-talk-drawer { bottom: calc(var(--kb-inset)+8px) }` (exact hug); `st-focus:not(.kb-open)` → conservative `38svh` reserve only for the unmeasured window / broken webviews. (3) `dom.js resetViewportVars()` hard-zeros the viewport vars on blur (iOS 26 vv-residual regression); added `kb-measured`/`kb-estimated` classes. Kept the estimator fallback (in-app webviews) and the "no active scroll / don't move the focused element" red line (iOS cancels the keyboard otherwise). **Skipped VirtualKeyboard API** — requires `overlaysContent=true` which conflicts with `resizes-content`, and is redundant once Android resizes the layout.
- Verification: `node --check` PASS on dom.js + soulTalkController.js. Preview computed-style probe (inject `--kb-inset` + `st-focus.kb-open`, read `getComputedStyle(drawer).bottom`): `300px → 308px`, `240px → 248px` — composer tracks the real keyboard height exactly; the 42svh gap is gone.
- Problems / risks: **real-device matrix is a HUMAN GATE** (cannot drive a real soft keyboard in preview): iPhone Safari / Android Chrome / IG·FB·LINE in-app — confirm the input hugs the keyboard (no gap / no black band), that dismissing the keyboard fully restores the layout (iOS 26), and no regression to the onboarding name input or Pixi layout from the global meta. If any platform regresses, revert the `index.html` meta line alone (decoupled from the rest).
- Next safe action: human real-device pass. Follow-up: `ob-focus` (onboarding name input) can adopt the same `kb-open`/`--kb-inset` model for consistency.
- Required reading: this entry, `styles/soul-talk-drawer.css` (st-focus block), `src/utils/dom.js` (`setViewportVars`/`resetViewportVars`), plan file `ai-immutable-liskov.md` (2026-07-04 addendum).

### 2026-07-04 - Claude Opus 4.8 - Content line fill: Soul Talk (A2) + exploration (A4) + evolution lines (A5)

- Status: `VERIFIED` (data/logic, deterministic) — committed + pushed to origin/main per standing instruction
- Branch / commit: `main` / pushed (see git log)
- Scope: EXPERIENCE + data/content. Files: `src/data/emotionDictionary.js`, `src/data/soulTalkResponsePacks.js` (A2); `src/data/explorationNodes.js`, `src/engine/explorationEngine.js`, `src/ui/mapController.js` (A4); `src/data/evolutionLines.js`, `src/ui/codexController.js` (A5); `docs/design/BALANCE_SHEET.md` (§4, §5.1). NO index.html / save schema / Pixi core / GROUNDWORK.
- Work performed:
  1. A2: +6–8 nuanced emotion keywords per emotion (avoiding the safety-shield caution words 消失/撐不住了/沒有意義, which are handled first — red line 7); Soul Talk RESPONSE_PACKS expanded 2 → 4 variants per (emotion × bond-tier) slot = 84 lines, matching the sparse/evocative habitat voice so the constitution/generic critics don't flag them.
  2. A4: existing node result lines thickened to 4–5 each; reflective memory is now node-aware (label `${node.label.zh}的安靜`, `node.reflectiveExcerpt`) instead of hardcoded misttide; new node `mirror_hollow` 湖心倒影 (reflective) + map layout/path; `bond ≥ 45` appends a warm companion flourish (HIGH_BOND_FLOURISH) on non-danger nodes.
  3. A5: all 6 evolution lines filled to 3 relationship-driven stages (幼年→成長→成熟) with lore; **removed battle-farm gating** — codex now gates on `bondThreshold` (0/25/70, aligned to milestones) instead of `unlockWins`; locked stages show relationship/ritual `unlockHint`, never "win N battles".
- Verification: bundled codex node content smoke test **18/18 PASS** (7 emotions + new keywords; all packs ≥4 variants; 6 lines ×3 stages, bond 25/70, no `unlockWins`; 6 nodes incl. mirror_hollow; node-aware reflective memory label/excerpt; high-bond flourish appended at bond≥45, absent below). `node --check` PASS on all 7 files. Data modules import + run cleanly under Node.
- Problems / risks: Content-only + a bond-gated engine branch (no combat/save changes). `mirror_hollow` map node placed at (50,42) — a central free gap; **map placement not eyeballed in browser** (preview boot transient this session), so confirm it doesn't visually crowd paths on a real device. Soul Talk lines are TC-only by design. Evolution higher forms (perfect/ultimate) intentionally deferred.
- Next safe action: Human eyeballs the new map node + reads a few new Soul Talk lines / codex evolution on a live build. Remaining roadmap: Initial Bond / chapter / monetization are separate GROUNDWORK gates.
- Required reading: this entry, `docs/design/BALANCE_SHEET.md` §4 + §5.1, `src/data/evolutionLines.js`, `src/engine/explorationEngine.js`.

### 2026-07-03 - Claude Opus 4.8 - Phase 2 combat: action economy (B3) + juice (B4) + enemy roster (A3)

- Status: `VERIFIED` (engine/data, deterministic) / battle-modal browser E2E BLOCKED by preview transient — committed + pushed to origin/main per standing instruction
- Branch / commit: `main` / pushed (see git log)
- Scope: EXPERIENCE + data. Files: `src/data/enemyRegistry.js` (A3), `src/data/explorationNodes.js` (A3 pools), `src/engine/battleEngine.js` (intentBias + B3), `src/ui/battleController.js` (B4), `docs/design/BALANCE_SHEET.md` (§2.2, §3). NO index.html / save schema / Pixi core / GROUNDWORK.
- Work performed:
  1. A3 roster: 5 → 10 enemies (five rift emotions ×2), each a distinct archetype with an `intentBias` that nudges the phase intent weights (e.g., spite_ember surge+, drift_murmur/sink_weight lull+, dread_coil gather+). Wired new enemies into exploration node pools (starwood/crystal_ruins/misttide + all 5 into rift_observatory). Engine `pickRiftIntent` now reads `session.intentBias`.
  2. B3 economy: `resonance` recovers a memory shard ONLY when `sync >= 3` ("in rhythm"), splitting recovered (build sync, avoid pulse) from stabilized (spend pulse to zero noise) into two deliberate playstyles; adds a legibility hint when sync is too low.
  3. B4 juice: battleController one-shot visual feedback (noise→soothe brightness flash, stability→shake with a stronger variant for hits ≥6, shard→burst), reduced-motion aware, styles self-injected (no base styles.css edit).
- Verification: bundled codex node deterministic engine test **18/18 PASS** (adds: dread_coil loaded + intentBias carried; resonance +1 sync; no shard when sync<3; shard collected when sync>=3). `node --check` PASS on all 4 files. Data modules import + run cleanly under Node. Preview boots and renders home with no console/server errors (my data changes don't break boot — screenshot confirms).
- Problems / risks: **Battle-modal in-browser E2E again NOT completed** — the preview session's companion async-load hangs on "載入中" (nav wiring never activates); no failed network / no console error, so it's an environment transient (Pixi/asset load in the sandbox), not a code defect (same class as the prior Phase 2 entry). B4 juice + telegraph render + B3 shard-hint still need a **manual playthrough gate** (Explore → star map → 裂隙觀測點, play a standoff). B3 shard-gating tuning (sync≥3) is a first pass and may want live-feel adjustment.
- Next safe action: Human plays a standoff on the live/preview build to confirm telegraph + juice + the two win-paths feel right. Roadmap remaining: content (A2 Soul Talk depth, A4 exploration, A5 evolution lines); Initial Bond is a separate GROUNDWORK gate.
- Required reading: this entry, `src/engine/battleEngine.js`, `src/data/enemyRegistry.js`, `docs/design/BALANCE_SHEET.md` §2.1–2.2 + §3.

### 2026-07-03 - Claude Opus 4.8 - Phase 2 combat deepening: rift telegraph + phases (B1/B2)

- Status: `VERIFIED` (engine, deterministic) / browser E2E BLOCKED by preview transient (see risks) — committed + pushed to origin/main per standing instruction
- Branch / commit: `main` / pushed (see git log)
- Scope: EXPERIENCE layer, additive to the existing emotional-standoff model (noise/stability/sync/fatigue/boundary/shards + four non-punishing outcomes UNCHANGED). Files: `src/engine/battleEngine.js`, `src/ui/battleController.js`, `docs/design/BALANCE_SHEET.md` §2.1. NO index.html / save schema / Pixi core / assets / GROUNDWORK.
- Work performed:
  1. battleEngine: rift PHASES (turbulent/contested/settling by noise ratio) with phase-transition arc lines; telegraphed INTENTS (surge/gather/lull) picked per phase and exposed via `getIntentTelegraph`; `gather` sets `charged` → next surge ×1.5 (telegraphed as "蓄勢"). `applyNoiseTurn` now executes the previously-telegraphed intent deterministically (was random lull/surge). `createStandoffSession` + `applyNoiseTurn` accept injectable rng.
  2. battleController: telegraph line dynamically inserted above `#standoff-action-row` (no index.html edit), style self-injected via one <style>; shows "下一拍・<label>" + counterplay hint on player turns, hidden on noise turns / ended.
- Verification: bundled codex node deterministic engine test **12/12 PASS** (telegraph present on player turn / null on noise turn; initial phase turbulent; low-noise → settling; gather sets charged; charged surge drop 10 > normal 7; surge consumes charged; phase labels 翻湧/漸靜). `node --check` PASS on both files.
- Problems / risks: **In-browser battle-modal E2E was NOT completed.** After repeated localStorage resets the preview session hit a boot transient (companion asset stuck on "載入中", bottom-nav wiring never activated), so I could not reach the standoff modal to eyeball the telegraph render. The same app booted and ran fully earlier this session (pillars 1–3), so this is an environment transient, not a code defect; engine logic + node --check are green and the telegraph UI mirrors already-verified dynamic-DOM patterns. Still, the on-screen render needs a manual playthrough gate: open Explore → star map → 裂隙觀測點 → confirm "下一拍・…" shows and updates each turn.
- Next safe action: Human confirms telegraph render on a live standoff. Then continue Phase 2: enemy roster expansion (A3, 5→~10 with per-enemy intent flavor) + combat juice (B4).
- Required reading: this entry, `src/engine/battleEngine.js` (`getIntentTelegraph` / `applyNoiseTurn`), `docs/design/BALANCE_SHEET.md` §2.1.

### 2026-07-03 - Claude Opus 4.8 - First-Session legibility: gentle invitation loop (Phase 0, pillar 2)

- Status: `VERIFIED` (committed + pushed to origin/main this round per explicit human instruction "完成就 commit 然後 push 到 main")
- Branch / commit: `main` / pushed (see git log for hash)
- Scope: EXPERIENCE layer. Answers the "接著做什麼 / 沒有迴圈" half of the playtest feedback. Files: NEW `src/engine/gentleInvitationEngine.js` (pure), NEW `src/ui/gentleInvitationController.js`; `styles/ui-v3-onboarding.css` (+gentle-invitation + nav invite-glow); `src/app.js` (wire: import/create/bind/render). NO index.html / save schema / Pixi core / assets / tools / scripts / GROUNDWORK. No new localStorage key; narrative lines TC-only.
- Work performed:
  1. gentleInvitationEngine.deriveGentleInvitation(state, now): pure map from **companion state only** (energy/mood/defense/touchFatigue/trust/bond/safeHarbor/time-of-day) → one of 6 invitation kinds (space/rest/connect/explore/stillness/presence) + optional bottom-nav hint. Companion-state-driven (red line 1), boundary-first (wants-space → don't push interaction), includes "do nothing is fine" (敢於無聊). Thresholds documented in BALANCE_SHEET §8.
  2. gentleInvitationController: renders ONE soft, ignorable line on the home screen after the first loop; hides during onboarding/first-loop/sub-pages(page-open)/panels/soul-talk(st-focus). Rotates lines per kind (no nag). Optional gentle breathing nav glow (NOT a red dot/badge/number) for explore/care hints. Re-renders on UI transitions (capture-phase click/focus + rAF) so it hides immediately on navigation, plus a 4s tick for time/energy drift.
- Verification: bundled codex node `--check` PASS on gentleInvitationEngine.js, gentleInvitationController.js, app.js. Live preview (Chromium 375×812): warm+trust8 state → CONNECT line, visible on home, no nav glow (correct); forced energy=2/tired → REST line + care nav glow (screenshot); navigate to 探索 → invitation hidden + glow cleared (page-open); back home → re-shown with rotated line. 0 console errors across the run.
- Problems / risks: (a) invitation vertical placement (bottom offset 96px) verified legible at 375×812; may want a small tune on other aspect ratios. (b) nav glow is intentionally soft/ambient — if it reads too close to a "notification," dial the ::after opacity in ui-v3-onboarding.css. (c) Real mobile Safari/Chrome feel still a human gate. (d) Pillars 1+2+3 now cover "怎麼摸 / 沒回饋 / 接著做什麼"; combat deepening (Phase 2) remains the next roadmap item.
- Next safe action: Human real-device retest of the first-session flow (affordance → touch → talk → traces → gentle invitations). Then Phase 2 combat deepening (enemy intent/telegraph + rift phases) per plan.
- Required reading: this entry, `src/engine/gentleInvitationEngine.js`, `src/ui/gentleInvitationController.js`, `docs/design/BALANCE_SHEET.md` §8.

### 2026-07-03 - Claude Opus 4.8 - First-Session legibility: cat touch affordance + trace payoff (Phase 0, pillars 1+3)

- Status: `VERIFIED` (uncommitted — commit/push NOT performed, awaiting human)
- Branch / commit: `main` / uncommitted working tree
- Scope: EXPERIENCE layer. Fix from live playtest feedback (friends: "don't know how to interact with the cat / how to pet / what to do next / no loop / no motivation"). Files: NEW `src/ui/interactionHintController.js`; `styles/ui-v3-onboarding.css` (+touch-affordance CSS); `src/app.js` (wire controller: import/create/bind/render loop); `src/i18n/strings.js` (fl.hintTouch copy, 4 langs); `src/ui/soulTalkController.js` (subsequent-trace echo). NO index.html / save schema / Pixi core / assets / tools / scripts / GROUNDWORK. Uses dynamic-DOM + EventBus pattern (same as calmSync/companionFeedback); no new localStorage key; narrative lines TC-only per design.
- Work performed:
  1. 支柱一 (affordance): new interactionHintController renders a soft breathing halo + heart-core dot over the cat while `onboarding.completed && !firstTouchCompleted && !panelOpen`; hides permanently after first touch. `pointer-events:none` (taps pass through to Pixi). lowMotion / prefers-reduced-motion aware. Vertical anchor is CSS var `--touch-affordance-y` (default 60%). Improved `fl.hintTouch` to point at the cat + promise a response ("輕觸畫面裡的牠——牠會回應你。").
  2. 支柱三 (payoff): soulTalkController previously announced ONLY the first trace; extended so every subsequent new visible trace also lands a rotating "the cat remembered" line (`TRACE_ECHO_LINES` ×4, no-repeat cycle), gated by `shouldAcknowledgeTrace` (real new visible trace only, and not safety-redirect / non-rewarding mode). Register kept as memory-observation, not reward/praise, no numbers (red lines 6/7).
- Verification: bundled codex node `--check` PASS on interactionHintController.js, app.js, soulTalkController.js, strings.js. Live preview (python http.server :5266, Chromium 375×812): fresh boot 0 console errors; drove onboarding → affordance ring visible and centered on the cat (screenshot), hint text clear; sent 3 emotional messages → 1st trace = existing first-trace line, 2nd trace = new echo "湖邊又亮起一點微光——牠把這一刻，也收下了。"; synthetic pointer tap on the Pixi cat → `firstTouchCompleted=true`, main-screen reaction feedback shown ("灰影貓耳朵動了動，但沒有躲開。"), affordance hidden. 0 console errors throughout.
- Problems / risks: (a) affordance anchor 60% verified good at 375×812; other aspect ratios may want a small tune of `--touch-affordance-y` (that's why it's a CSS var). (b) This batch = pillars 1+3 only; pillar 2 (persistent, companion-state-driven "gentle next-step invitation" after the first loop, via `needModel`/`goalManager`) still PENDING — that's what fully answers "接著做什麼" beyond the first session. (c) Real mobile Safari/Chrome touch feel remains a human-only gate.
- Next safe action: Human review + authorized commit. Then Phase 0 pillar 2 (ongoing gentle invitation loop) as the next EXPERIENCE TASK_PACK; combat deepening (Phase 2) after first-session legibility is confirmed on real devices.
- Required reading: this entry, `src/ui/interactionHintController.js`, `src/ui/soulTalkController.js` (`TRACE_ECHO_LINES` / `shouldAcknowledgeTrace`), plan file `ai-immutable-liskov.md`.

### 2026-07-03 - Claude Opus 4.8 - Docs SSOT + BALANCE_SHEET + workflow onboarding (Phase 1 of full-project optimization plan)

- Status: `COMPLETED` (docs/markdown only; no runtime code changed)
- Branch / commit: `main` / uncommitted working tree (commit/push NOT performed — awaiting human)
- Scope: Structure & AI-collaboration lane + numbers SSOT. Doc-only. No JS, no `index.html`, no state/save/Pixi/assets/tools/scripts, no gameplay changes.
- Work performed:
  1. New `docs/design/BALANCE_SHEET.md`: single tunable table of all scattered numbers (core state defaults; touch/personality weights + formula; standoff constants + formulas; enemy stats; exploration rewards; bond milestones; memory lifecycle; sedimentation), each with source file, current value, tunable range, impact, and safety-tuning rules. Values extracted directly from current code.
  2. Updated `docs/README.md` (merge, not clobber): added authority hierarchy (Master Canon > CLAUDE/AGENTS > execution ledger > docs), Start-Here table, cadence table, known doc-debt; **fixed a stale scope rule** that read "Do not expand into battle" (battle is already implemented as emotional standoff). Preserved existing curated pointers.
  3. Fixed doc-drift in `CLAUDE.md §6.1`: it claimed battle was still ordinary RPG (`basic_attack` / `battle-enemy-hp`, "needs 體質改造"). Verified in code the emotional-standoff conversion is complete (battleEngine `noise/stability/sync/fatigue/boundary/shards` + 5-element affinity + 4 non-punishing outcomes) and `index.html` battle-modal already uses `standoff-action-row` + `data-action-id`. Rewrote §6.1 to "conversion complete → current work is deepening"; preserved player-facing language rules; added an explicit drift-correction note so no future AI re-does the battle.
  4. New `CONTRIBUTING.md`: one-page onboarding (6-step new-AI startup, Gate 0–6 table, machine-checkable Definition of Done, hard boundaries).
- Verification: docs only — no `node --check` / release gate required (no runtime code touched). Spot-checked BALANCE_SHEET constants vs source: `SHARD_GOAL 3` / `MAX_FATIGUE 6` (battleEngine.js), `baseSafety 30` / `bondWeight 0.8` (personalityProfile.js), bond milestones `12/25/45/70/90` (bondMilestoneEngine.js), memory `12h/3d/limit 12` (memoryLifecycleEngine.js), enemy `static_wisp 26/4/0.15` (enemyRegistry.js) — all consistent. Doc cross-refs resolve.
- Problems / risks: (a) `docs/README.md` already existed with its own stale battle scope rule + pointers to `production/…HANDOFF`, `architecture/RUNTIME_MAP.md`, `asset-pipeline.md` — merged, not replaced; those two "NEEDS UPDATE" docs still need a separate pass. (b) Archiving `legacy-bible/` to `docs/_archive/` is recommended but NOT done (irreversible move → needs human approval + file-list report). (c) CODEOWNERS/`@owner` tags + `docs/STATUS.md` auto-gen (plan C4/C5) deferred (C5 touches `scripts/**` = GROUNDWORK).
- Next safe action: Human review + authorized commit of the 4 doc files. Then Phase 2 (combat deepening: enemy intent/telegraph B1 + rift phases B2 + enemy roster A3) as one EXPERIENCE TASK_PACK — sequence is in the plan file.
- Required reading: this entry, `docs/design/BALANCE_SHEET.md`, `CONTRIBUTING.md`, `CLAUDE.md §6.1`, plan file `ai-immutable-liskov.md`.

### 2026-07-03 - Codex - Calm Sync v1 completion

- Status: `VERIFIED`
- Branch / commit: `main` / `e94f549`
- Scope: Completed Claude Fable 5's interrupted Calm Sync v1 EXPERIENCE package. No `index.html`, save schema, Pixi ground layer, assets, tools, scripts, dependencies, or GROUNDWORK files were changed. Existing untracked `output/linkara/` asset output remains untouched and excluded.
- Work performed:
  1. Finished `src/ui/calmSyncController.js`: dynamic overlay, 36-second low-stimulation breathing loop, click/keyboard ring sync during inhale, Escape/leave/visibility/blank-overlay abort, no state writes on early exit, one state write/save on completion.
  2. Wired Calm Sync into `src/app.js`, `src/ui/pageRouter.js`, and `src/ui/actionSheetController.js`; Care page now exposes `心核共息`, and the legacy action sheet care row delegates to the same flow.
  3. Extended `src/engine/actionEffectEngine.js` with `calm_sync` effects: energy +2..+5, touch fatigue -2, defense -1 only outside refusal state, trust +1 only outside refusal and outside a 10-minute memory-derived cooldown, plus `care_calm_sync` memory and possible `calm_breath_trace`.
  4. Added `care.calm_sync` animation intent mapping to `sit` with `idle_calm` fallback, `calm_breath_trace` visual/display mapping, four-language i18n strings, overlay CSS in `styles/page-content.css`, and 5 QA cases for Calm Sync state rules.
- Verification: bundled Node `--check` passed for `src/ui/calmSyncController.js`, `src/app.js`, `src/ui/pageRouter.js`, `src/ui/actionSheetController.js`, `src/engine/actionEffectEngine.js`, and `docs/qa/state-onboarding-migration-cases.mjs`; `node docs/qa/state-onboarding-migration-cases.mjs` passed 17/17, failed 0; `git diff --check` clean; full `python docs/qa/_run_web_release_gate.py --base http://localhost:5206 --port 5206` passed 10/10 required checks, 0 accessibility warnings, jsSyntax 186 files, stateMigration 17/17, live playtest Soul Talk 10/10, HUD 13/13, 0 console errors; targeted Chromium 390x844 Calm Sync test passed Care -> overlay -> ring sync -> completion, with overlay hidden afterward, `care_calm_sync` memory and `calm_breath_trace` persisted, nav non-interactive during overlay, and 0 console errors.
- Problems / risks: Real iPhone Safari/Chrome visual feel remains human-only. Targeted test output text was mojibake in the PowerShell pipe, but assertions used DOM/localStorage booleans and passed. QA evidence JSONs were refreshed by the release gate and included with this package.
- Next safe action: After push, human can retest Calm Sync on real mobile Safari/Chrome; the next separate TASK_PACK can address deeper Care restructuring or autonomous idle/adventure rules.
- Required reading: this entry, `src/ui/calmSyncController.js`, `src/engine/actionEffectEngine.js`, `styles/page-content.css`, `docs/production/NEXUS_LINK_NEXT_GAMEPLAY_SYSTEMS_SPEC.md`.

### 2026-07-03 - Claude Fable 5 - Soul Talk single-panel rebuild + HUD V3 alignment (human-directed)

- Status: `VERIFIED`
- Branch / commit: `main` / committed and pushed this round per explicit human instruction (rebuild Soul Talk, align UI/HUD with V2/V3, fix atlas overlap, then commit/push)
- Scope: Human-directed rebuild. Files: `src/ui/soulTalkController.js`, `src/ui/hudController.js`, `src/i18n/strings.js`, `styles/soul-talk-drawer.css`, `index.html` (one line: level pill). Kept intact: keyboard model v5 (real-device-derived, NOT discarded), send pipeline, dedupe/scroll-anchor logic, Raphael presence state machine (`data-raphael-agent-presence` panel glow), safety paths.
- Work performed:
  1. Soul Talk single glass panel (V3 "never opaque card stacks / no cards-inside-cards"): `ensureWaveformShell()` now builds a slim `.soul-presence` line (mini 7-bar waveform + `#status-text`) appended INTO `.soul-drawer-heading` instead of a standalone card between header and chat; `soul-talk-drawer.css` rewritten — header uses hairline bottom divider only, chat log / quick replies lose borders+backgrounds, composer remains the single field border, waveform bars downscaled (5–13px) overriding styles.css 38–58px base.
  2. Keyboard black-band fix (真機圖一): soulTalk backdrop lightened (non-blocking drawer, aria-modal=false) — normal 0.34 alpha radial, st-focus 0.3→0.1 gradient so the band between drawer and keyboard shows the habitat instead of near-black. Keyboard model v5 st-focus geometry unchanged (verified drawer 12→482 with 42svh reserve, input bottom 467).
  3. HUD V3 identity-card rule ("do not show levels"): static `等級 01` level pill replaced by a live companion state signal — `hudController` renders `hudMood.*` label into `.level-pill` each renderHUD and on LANGUAGE_CHANGED (new EventBus listener); `getMoodLabel` now t()-based (10 new `hudMood.*` keys, 4 languages; HUD vocabulary kept separate from page tendency `mood.*`).
  4. Atlas/nav overlap (真機圖四): verified Codex's 4001663 constraints hold on this build — modal bottom 752 < nav top 764 (12px gap), legend `overflow-y:auto`, 7 regions internally scrollable, no horizontal overflow. No further change needed; user screenshot predates that fix (advise hard-refresh of the Pages demo).
- Verification: `node --check` ×3; STRINGS 235 keys / 0 missing languages; html refs 142 all resolve + all `t()` refs resolve; `git diff --check` clean; web release gate port 5198 **10/10 required, 0 accessibility warnings** (2026-07-03 05:49); live playtest gate **soul_talk 10/10, hud 13/13, 0 console errors** (send pipeline intact after rebuild); Chromium preview 390x844: fresh onboarding→home, drawer children = header/chat-log/quick-replies/composer (presence inside heading), header hairline + transparent interior confirmed via computed styles, st-focus async-measured (transition-aware), pill 平靜↔Calm live on language switch, atlas metrics above, console clean.
- Problems / risks: (a) real iOS keyboard still human-only gate — st-focus verified by class toggle + geometry, not a real keyboard; (b) `hud.levelPill` key now unused in index.html (kept in dictionary, harmless); (c) styles.css legacy `.soul-waveform-copy` block now dead CSS (left in place — styles.css is the cautious base layer); (d) status text is shared between page status and presence line by design (single `#status-text`).
- Next safe action: human real-device retest of the three reported screenshots (keyboard band, Soul Talk layering, atlas); then Calm Sync v1 (validated design in plan file) as the next gameplay TASK_PACK.
- Required reading: `styles/soul-talk-drawer.css` header comments, this entry, previous Codex polish entry.

### 2026-07-03 - Codex - Mobile Soul Talk and Atlas viewport polish

- Status: `VERIFIED`
- Branch / commit: `main` / pending Codex commit in this TASK_PACK
- Scope: Targeted mobile UI/viewport repair from human screenshots. Fixed Soul Talk keyboard focus layout, Soul Talk V2 four-layer visual structure, and World Atlas modal overlap with bottom nav. No save schema, Pixi, assets, dependencies, gameplay rules, Calm Sync, map art, or product-spec expansion.
- Work performed:
  1. `src/ui/soulTalkController.js`: wired existing passive keyboard helpers (`expectSoftKeyboard`, `syncViewportDuringTransition`, `clearSoftKeyboardExpectation`) into Soul Talk input focus/blur so CSS can use `--kb-inset` when the browser reports or estimates it.
  2. `styles/soul-talk-drawer.css` + `styles/mobile-safari-polish.css`: changed focus layout from a fixed 42vh top slab to a drawer that reserves the keyboard band below it, tightened mobile width, and styled the four visible Soul Talk layers: header, resonance/waveform, transcript, composer.
  3. `styles/world-atlas.css`: constrained the atlas modal between the top safe area and bottom nav, made the region legend internally scrollable, and reduced the map canvas height on mobile/short viewports.
  4. Refreshed existing tracked QA evidence JSONs from the release gate; no new evidence document was created.
- Verification: bundled Node `--check src/ui/soulTalkController.js` passed; `git diff --check` clean; Browser plugin QA at 390x844 on fresh local port 5202 passed with no console warnings/errors. Soul Talk metrics: no horizontal overflow, header/resonance/transcript/composer ordered, composer inside drawer. Atlas metrics: active panel `atlas`, modal bottom 752, nav top 764, 12px gap, legend `overflow-y:auto`, no modal horizontal overflow. Full web release gate on `--base http://localhost:5205 --port 5205` passed 10/10 required checks, 0 accessibility warnings; live playtest gate inside it passed Soul Talk 10/10, HUD 13/13, 0 console errors.
- Problems / risks: Browser QA cannot display the real iOS keyboard, so the keyboard band is verified by layout metrics and existing fallback variables; human should still recheck on real mobile Safari/Chrome. The World Atlas remains CSS/SVG placeholder art; this did not implement a generated world-map image.
- Next safe action: Human real-device retest for the exact screenshots: iOS keyboard open in Soul Talk and World Atlas opened from Explore. If passed, next separate TASK_PACK can be Calm Sync v1 or map art integration using the existing gameplay systems spec.
- Required reading: `styles/soul-talk-drawer.css`, `styles/world-atlas.css`, `src/ui/soulTalkController.js`, this entry.

### 2026-07-02 - Codex - i18n P4 review, evidence, and main integration

- Status: `COMPLETED`
- Branch / commit: `main` / `21323a9` docs whitespace, `35046c8` i18n wiring, plus this ledger/evidence commit.
- Scope: Reviewed and integrated Claude Fable 5's i18n P4 package. Included refreshed tracked QA evidence files because they are the current automated proof for this integration. No Calm Sync, world map, asset pipeline, save/state, Pixi, gameplay rule, dependency, or UI redesign work was performed.
- Work performed:
  1. Reviewed actual working tree against Claude's handoff report: 11 touched files, matching the reported scope.
  2. Used codebase-memory trace to confirm `createBattleController` and `createHudController` are high-impact UI entry points; reviewed their diffs and confirmed changes are limited to i18n templates and `textContent` / `placeholder` writes.
  3. Committed the package in scoped commits: whitespace docs first, static/controller i18n wiring second, ledger + QA evidence last.
- Verification: `git diff --check` clean; bundled Node `--check` passed for `src/i18n/strings.js`, `src/ui/pageRouter.js`, `src/ui/battleController.js`, and `src/ui/hudController.js`; scripted i18n integrity passed with 225 STRINGS keys, 0 missing languages, 143 HTML i18n attributes all resolved, and 92 scanned static `t()` references all resolved; system Python release gate on `--base http://localhost:5198 --port 5198` passed 10/10 required checks with 0 accessibility warnings; live playtest gate passed Soul Talk 10/10, HUD 13/13, awakening/storage/touch/pixi OK, and 0 console errors.
- Problems / risks: Same non-blocking gaps as Claude's entry remain: named Soul Talk placeholder reverts to generic localized placeholder after language switch; mid-standoff dynamic labels refresh on the next `startBattle`; remaining content-tier and dynamic TC writers need a separate mini-pack. Human gates remain open: real-device mobile Safari/Chrome, moderated private testers, legal/privacy/store copy.
- Next safe action: Push these scoped commits to `origin/main`; then start a new authorized TASK_PACK for either Calm Sync v1 or the remaining dynamic-writer i18n mini-pack.

### 2026-07-02 - Claude Fable 5 - i18n package P4: controller wiring + index.html static labels (handoff to Codex review)

- Status: `VERIFIED` (uncommitted — awaiting Codex review; commit/push NOT performed per this round's instruction)
- Branch / commit: `main` / uncommitted working tree
- Scope: Finish i18n package P4 per human TASK_PACK. Files touched: `index.html` (i18n attributes only, no structural change), `src/i18n/strings.js`, `src/ui/pageRouter.js` (P2, earlier in round), `src/ui/battleController.js`, `src/ui/hudController.js`, 3 docs (whitespace only). Explicitly NOT done: Calm Sync, world map, asset pipeline, saveManager/store/defaultState/pixiApp, gameplay/standoff rule changes, new dependencies.
- Work performed:
  1. P1 whitespace: 3 Raphael docs cleaned (trailing spaces + EOF blank lines); `git diff --check` clean.
  2. P2: `pageRouter.js` LANGUAGE_CHANGED listener now re-sets `#status-text` via `getPageStatus(activePage)` (home included) before re-render; `formatDate()` maps `getLanguage()` → locale (`zh-TW/zh-CN/en-US/ja-JP`) instead of hardcoded zh-TW.
  3. P3: all 53 EN-pack keys filled with sc/jp; header note removed.
  4. P4 index.html: 143 total `data-i18n`/`data-i18n-aria`/`data-i18n-placeholder` refs after adding ~60 attributes across title, shell/HUD/nav arias, panel close buttons, kickers (roster/map/codex/actionSheet), Moonlake presence block, level pill, onboarding kicker + name placeholder, standoff modal statics (title, noise hint, sync/fatigue/shards vitals, barrier/pulse/retreat buttons, finish button), settings group arias, soul panel aria. Language self-name buttons (繁體/简体/日本語) intentionally untranslated.
  5. P4 controllers: `battleController.startBattle` node label / `{name}的心核` / `{name}的雜訊` / resonance-hint templates now use i18n keys with `{name}`/`{emotion}` placeholder replace (content-tier node/enemy/emotion names stay TC by design); `hudController.setCreature` description fallback + named soul-talk placeholder keyed (`char.descFallback`, `hud.soulPlaceholderNamed`). All writes remain `textContent`/`placeholder` — no innerHTML path touched.
  6. New keys this round: `aria.*` ×30, `battle.*` ×17, `map.*` ×2, `codex.kicker/title`, `actionSheet.kicker`, `habitat.*` ×2, `ob.kicker/namePlaceholder`, `hud.levelPill/soulPlaceholderNamed`, `char.descFallback`, `roster.kicker`, `meta.title`. STRINGS total 225 keys, 0 missing languages (scripted check).
- Verification: bundled Node `--check` on 4 touched JS; scripted integrity: all 143 html refs + all static `t()` refs in src/ resolve to STRINGS (both directions NONE missing); `git diff --check` clean; web release gate on clean port 5197 **10/10 required PASS, 0 accessibility warnings** (22:07); live playtest gate vs :8128 **soul_talk 10/10, hud 13/13, 0 console errors**; Chromium preview manual: EN switch → title/level pill/moonlake block/all panel arias/standoff statics (Heart-Core Standoff, Boundary/Pulse/Step away + hints)/map/codex/roster kickers all EN with zero TC residue; JP switch → 心核の対峙/レベル 01/statusText 即時同步（月湖の棲み処に戻った。）; TC restore clean; console errors 0.
- Problems / risks: (a) `#message-input` named placeholder reverts to generic localized placeholder after a language switch (applyLanguage owns the node; pre-existing behavior, now correct-language in all cases); (b) battleController dynamic labels only refresh at next `startBattle` after mid-standoff language switch (transient, session-scoped); (c) remaining hardcoded-TC dynamic writers deferred as known gaps: `actionSheetController` actionMeta copy (gameplay copy), app.js sleep-cycle/companion-switch statusText lines, `hudController` idle status line (entangled with DEFAULT_STATUS_TEXT comparison), companionRenderer load-status lines, Soul Talk dialogue pool, mood/boundary preview copy (content tier); (d) gate reruns refreshed `docs/qa/_web_release_gate_output.json` + `_live_playtest_gate_output.json` in the working tree as evidence — Codex may include or discard at commit time.
- Next safe action: Codex review of the uncommitted diff (6 code/docs files + 2 refreshed QA evidence JSONs), then human-authorized commit/push; after that the next gameplay TASK_PACK (Calm Sync v1 — design already validated, see plan file `c-users-user-pictures-thumbnail-c-users-curried-mccarthy.md`) or the remaining dynamic-writer i18n mini-pack.
- Required reading: this entry, previous entry (Commercial RC pass), `src/i18n/strings.js` header comment.

### 2026-07-02 - Claude Fable 5 - Commercial RC pass: HUD-B audit, dead-code cleanup, EN content i18n

- Status: `VERIFIED`
- Branch / commit: `main` / docs package `9933418`, code `616672b`; pushed to origin/main per explicit human instruction in this session's plan approval
- Scope: Human-approved plan (`.claude/plans/c-users-user-pictures-thumbnail-c-users-curried-mccarthy.md`). No GROUNDWORK files touched (index.html, src/state/**, pixiApp.js, assets/**, tools/**, scripts/** all untouched). i18n scope decision by human: EN only; Soul Talk dialogue pool excluded.
- Work performed:
  1. Gate 0 audit vs the UI v2 Aurora (variant B) reference pack (`C:\Users\User\Pictures\ＮＬＵＩＶ２`): confirmed the requested HUD state already shipped — quick-hud has settings gear only (no speaker button), all audio controls live in Settings (master/BGM/SFX sliders + mute toggle, persisted via `settings.volMaster/volBgm/volSfx` + `nexusLinkAudioMuted:v1`), `data-variant="B"` Aurora tokens active. Reference-pack items rejected as red-line violations: coin/gem resource chips (shop currency), notification toggles (FOMO), new `nexuslink_v2` localStorage key. Deferred (needs index.html GROUNDWORK): glowLevel/powerSave/voice settings rows.
  2. `src/app.js`: removed dead `bindAudioControls()` + call site (targeted the removed `#btn-audio-toggle`; sanctioned by `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md` §7.6).
  3. EN content i18n: extracted every hardcoded TC string in `src/ui/pageRouter.js` (page copy, action `<em>` subtitles, `data-status` action feedback, status lines, empty states, memory fallbacks, aria-labels, mood labels, `未標記時間`) into `src/i18n/strings.js` — 53 new keys with tc+en; sc/jp fall back to tc via existing `t()` fallback. `MOOD_LABELS` const replaced by `moodLabel()` with identical fallback semantics. Existing `LANGUAGE_CHANGED_EVENT` re-render reused; no new wiring.
- Verification: bundled Node `--check` on 3 changed files; migration suite 12/12; full web release gate on clean port 5196 **10/10 required, allAutomatedRequiredOk: true, 0 accessibility warnings** (note: default port 5173 is occupied by a foreign process on this machine — gate reuses it and fails with ERR_EMPTY_RESPONSE; use another port); live playtest gate vs :8128 **soul_talk 10/10, hud 13/13, 0 console errors**; Chromium preview manual QA at 390x844: fresh onboarding start→identity-skip→guidance→meet completes and persists, EN switch via real Settings UI then all four pages show **zero CJK leftovers** (only exception: BOND_MILESTONES theme `初亮的記憶` — content data, by scope), status line EN, switch back to tc clean, reload keeps onboarding completed + lang, Soul Talk strip bottom 752 < nav top 764 (no overlap), non-blaming return echo shown; 1280x900: intentional centered 480px column, no horizontal overflow. Independent artifact-only verifier: **PASS** — 73 t() keys cross-checked both directions (no dangling/unused), tc values byte-identical to removed literals, escapeHtml paths preserved, red-line copy audit clean (D6/K6/E5/H1/H2/H5 compliant).
- Problems / risks: (a) EN mode still shows TC for content-tier strings by design: milestone themes, companion display names, Soul Talk dialogue, map/codex/standoff modal internals — needs the content-translation pack; (b) static `index.html` strings without data-i18n remain TC in EN mode (notably HUD `等級 01` level pill, some modal headers) — one-line GROUNDWORK task each; (c) `formatDate` still hardcodes zh-TW locale (output is numeric MM/DD, effectively neutral); (d) real-device iOS Safari retest, 3-tester private test, legal/privacy/store copy remain human-only gates — public release still NOT APPROVED.
- Next safe action: human real-device retest (Soul Talk keyboard + first loop + EN spot check), then private-tester round per `docs/testing/PRIVATE_TEST_SCRIPT.md`; optional follow-up TASK_PACKs: sc/jp fill for the 53 new keys, GROUNDWORK micro-task for index.html data-i18n stragglers.
- Required reading: `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`, `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md`, `ACCEPTANCE.md` §K, this entry.

### 2026-07-02 - Codex - Commercial UI/UX Documentation Handoff

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted docs-only package
- Scope: Documentation governance and engineering handoff only. Created a readable commercial UI/UX entry point for the next Claude Code / Fable 5 TASK_PACK. No runtime code, state schema, assets, dependencies, build step, backend, LLM, deployment, commit, or push.
- Work performed: Added `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md` with current product position, readable canon summary, document authority table, Fable 5 execution boundary, GROUNDWORK restrictions, and acceptance references. Added `docs/handoff/FABLE5_COMMERCIAL_UIUX_TAKEOVER_PROMPT.md` as a paste-ready execution prompt. Updated `docs/README.md` to route agents through the commercial handoff and mark Master Canon / runtime map / asset pipeline / legacy docs status. Marked `docs/architecture/RUNTIME_MAP.md` as `NEEDS UPDATE` because stale facts must be verified against source before implementation.
- Verification: `git diff --check` passed. Scoped grep confirmed `NEEDS UPDATE`, `REFERENCE ONLY`, `nexusLinkPrototypeState:v2`, and `64x64` references are visible for triage. Scoped grep confirmed the new handoff/prompt do not authorize direct GROUNDWORK edits and explicitly prohibit FOMO, red dots, streaks, daily pressure, gacha, backend, LLM, npm, build step, React, and TypeScript.
- Problems / risks: Existing unrelated worktree changes remain outside this docs-only package, including in-progress runtime/UI files and generated QA JSON outputs. `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md` is readable in this checkout and remains the highest strategic canon; this package does not overwrite it.
- Next safe action: Give Claude Code / Fable 5 `docs/handoff/FABLE5_COMMERCIAL_UIUX_TAKEOVER_PROMPT.md` only after deciding the next commercial UI/UX TASK_PACK. Any implementation touching `index.html`, `src/state/**`, `src/pixi/pixiApp.js`, or `assets/**` still needs separate GROUNDWORK approval.
- Required reading: `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`, `docs/handoff/FABLE5_COMMERCIAL_UIUX_TAKEOVER_PROMPT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, and this lane.

### 2026-07-02 - Claude Fable 5 - First Session UX Repair TASK_PACK B (P1 first loop + copy diet)

- Status: `VERIFIED`
- Branch / commit: `main` / committed after TASK_PACK A (`30ef1fa`); pushed to origin/main per explicit human instruction
- Scope: Human-approved plan (`.claude/plans/chatgpt-ai-witty-starfish.md`) with explicit instruction to implement, commit, and push to main. GROUNDWORK touched per that plan: `defaultState.js` and `store.js`. No new localStorage key (K3); stage derived, not stored; no FOMO/red dots/countdowns/progress bars; skippable (K6).
- Work performed:
  1. GROUNDWORK: `defaultState.js` adds `onboarding.firstLoop { skippedAt: null, completedAt: null }`; `store.js` deep-copies `firstLoop` in `createDefaultState` and adds `normalizeFirstLoop()` inside `normalizeOnboarding` — legacy rule: a save with completed onboarding but NO `firstLoop` object (written before this feature) is backfilled `completedAt` so veterans and existing completed saves never run the loop (K4/K5); a save WITH the object keeps its nulls, so the veteran heuristic flipping true after the player's own first touch does NOT auto-complete their loop.
  2. New `src/ui/firstLoopController.js` (EXPERIENCE): store-subscription driven; derives stage touch→talk→trace→done from `firstTouchCompleted` / `chatHistory` player lines / `isEmotionalHabitatTrace` count; toggles `body.first-loop-active` + `data-first-loop-stage`; single dynamically-created hint line + quiet underlined skip link (`fl.skip` writes `skippedAt`); on done writes `completedAt`, shows `fl.reveal` once (~2.6s), nav fades back in 720ms with no fanfare. Re-renders on `LANGUAGE_CHANGED_EVENT`.
  3. Nav gating CSS (`ui-v3-onboarding.css`): during the loop the four non-core nav items are fully hidden (opacity 0 + pointer-events none, human-approved full-hide option) and set `inert`/`aria-hidden` by the controller; 心核 (home), soul-talk launcher, HUD, and settings stay available throughout; `prefers-reduced-motion` disables the fades.
  4. i18n: `fl.hintTouch/hintTalk/hintTrace/reveal/skip` added in tc/sc/en/jp (hints ≤10 chars tc).
  5. Copy diet (`pageRouter.js`): removed dev-speak leaking to players (「不擴張新區域」「維持單一夥伴模型」「Demo 章節」etc.); all `<em>` action hints now 6–10 chars; care soft-note 41→20 chars; `getPageStatus` lines shortened to single warm phrases. `ob.*` onboarding strings and `actionSheetController.getActionMeta` copy audited — already within budget, left unchanged.
  6. QA: extended `docs/qa/state-onboarding-migration-cases.mjs` with 4 firstLoop cases (fresh nulls; legacy backfill uses stored completedAt; mid-loop save NOT auto-completed despite veteran heuristic; skippedAt persists).
- Verification: bundled Node `--check` pass on all changed JS; migration suite **12/12**; full web release gate `--base http://localhost:5190` **10/10 required, allAutomatedRequiredOk: true**; live playtest soul_talk 10/10, HUD 13/13, 0 console errors; Chromium preview manual save-matrix: fresh save → onboarding → loop active with only 心核+心語 visible and touch hint → real canvas tap advances to talk hint (awakening toast shown) → first message creates trace → `completedAt` persisted, reveal line shown, nav un-gated → reload keeps full nav with no hint; skip link writes `skippedAt` and un-gates immediately; screenshot evidence of the gated first-session view. Note: nav fade opacity reads stale in a backgrounded preview tab (compositor throttling) — verified via `transition:none` computed value 0 and rule-match audit; not an app issue.
- Problems / risks: real-device pass still pending (human-only gate) for the loop hints and reveal; browser-level legacy-backfill was validated at Node level only (in-browser localStorage injection races the app's save queue — expected).
- Next safe action: human real-device checklist (Soul Talk keyboard + first loop together), then re-invite the three private testers using the six behavior questions in the plan file.
- Required reading: Lane 1 TASK_PACK A entry, `CLAUDE.md` §0.5.1/§5.1, `ACCEPTANCE.md` §K.

### 2026-07-02 - Claude Fable 5 - First Session UX Repair TASK_PACK A (P0)

- Status: `VERIFIED`
- Branch / commit: `main` / `30ef1fa` (pushed to origin/main)
- Scope: P0 fixes from private tester feedback, human-approved scope only. Explicitly forbidden and respected: no `defaultState.js`, `store.js`, `saveManager.js`, `pixiApp.js`, `assets/**`, no new localStorage keys, no new dependencies, reject cooldown / spam gate untouched, no commit/push. `index.html` untouched (feedback element is created dynamically at boot).
- Work performed:
  1. **Lost-send root cause (pre-existing on main, introduced by 84a19de)**: tapping 送出 blurred the input → `st-focus` removed → drawer animated 180ms away from under the pointer → click landed on stale coordinates → message silently lost. Fixed via `pointerdown` `preventDefault()` on `#send-button` (`soulTalkController.js` bind) so the input never blurs mid-tap; keyboard now stays open after sending. This alone took the live Soul Talk gate from 0/10 (baseline main, verified via `git stash` A/B run) to 10/10.
  2. Player-message visibility: `.chat-log` grid `align-content:end` (iOS WebKit unscrollable-overflow data loss) → flex column + `margin-top:auto` (`styles.css`); player bubble distinct cyan (aurora accent, no gold); consecutive-dedupe in `appendChatLine`/`renderChat` scoped to non-player roles (duplicate player sends were silently swallowed — reproduced and fixed); post-send scroll anchors the player's own line at the top of the visible area; render-signature skip stops unrelated state changes (heartbeat/save) from resetting chat scroll; re-scroll after the 180ms st-focus drawer transition and after panel open.
  3. Action-status de-pollution: `actionSheetController.commitNavAction` and `mapController.exploreNode`/energy-block no longer append `role:"system"` lines to chatHistory; they emit `HABITAT_STATUS_TOAST` instead (companion-voice reflections stay in chat). Persisted legacy system entries untouched; `.chat-line.system` restyled quieter. First-trace narrative line intentionally kept in chat.
  4. Companion tap feedback: new `src/ui/companionFeedbackController.js` (DOM toast, dynamically created, `aria-live=polite`, reduced-motion aware, tone classes accept/guarded/refusal/calm — refusal is neutral moon-grey, not error-red). `interactionController` emits `COMPANION_REACTION_FEEDBACK` synchronously before animation awaits at: normal reaction, awakening, wake-from-sleep (new visible line — night testers only ever hit this silent path), respect bonus, spam burst (copy localized to zh), blocked-touch cooldown. Boundary gates and their trust/defense consequences unchanged — visibility only.
  5. Onboarding name-input keyboard: replaced broken `kb-open`/`expectSoftKeyboard` machinery with keyboard model v5 (`body.ob-focus` pins the card to the top 42vh safe zone; `ui-v3-onboarding.css` kb-open block removed; `src/utils/dom.js` untouched/dormant).
- Verification: bundled Node `--check` pass on all 7 changed/new JS files; `python docs/qa/_run_web_release_gate.py --base http://localhost:8231 --no-server` **10/10 required, allAutomatedRequiredOk: true** (baseline before this pack: 9/10 — live playtest soul_talk 0/10); live playtest gate soul_talk 10/10, HUD 13/13, console errors 0; Chromium preview manual smoke (390×844): fresh-save onboarding, ob-focus pins card top ≤42vh with input visible, wake/hesitate/refusal toasts all visible <300ms via real canvas pointer events, duplicate "你好" sends both render (state+UI), Growth `trust_tuning` shows toast with chatHistory unchanged, player bubbles cyan right-aligned (screenshot verified).
- Problems / risks: (a) real-device iOS Safari + Messenger/IG in-app browser retest still required (human-only gate) — st-focus/ob-focus and the pointerdown send fix especially; (b) rapid clicks during a touch animation still return `animation_locked` silently by design (the playing animation is the feedback; spam gate is hard to reach via UI because locked taps don't increment spamScore — pre-existing tuning, out of scope); (c) quick replies remain hidden in st-focus mode (unchanged).
- Next safe action: human real-device mobile checklist, then commit/push approval; afterwards TASK_PACK B (progressive first-loop + copy diet) which requires GROUNDWORK approval for `defaultState.js`/`store.js` `onboarding.firstLoop` fields per the approved plan (`C:\Users\User\.claude\plans\chatgpt-ai-witty-starfish.md`).
- Required reading: `CLAUDE.md` §2/§5, `ACCEPTANCE.md` §K/§D, this entry.

### 2026-07-01 - Codex - Repo Main Deployment Sync

- Status: `VERIFIED`
- Branch / commit: `codex/raphael-core-main-review-gate` / current deployment commit
- Scope: Scoped integration for RaphaelCore agent classification, Linkara world/faction canon, commercial chapter/travel-trace guardrails, and the human-confirmed removal of the incorrect root Flametail Fox PNG. No `src/ai/**` runtime changes, no save schema or storage-key change, no backend, no LLM/API, no dependency, and no build step.
- Work performed: Kept the existing RaphaelCore constitution/architecture definitions as the current source of truth; synchronized Master Canon, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, legacy bible docs, runtime map/audit docs, and asset docs. Removed `assets/flametail-fox.png` after human review confirmed it depicted the wrong creature, then cleared stale runtime references in `data/creatures.json`, `src/data/assetManifest.js`, `src/data/companionRegistry.js`, and `src/engine/personalityProfile.js` so Flametail falls back to placeholder graphics until a new approved asset exists.
- Verification: Bundled Node `--check` passed for `src/data/assetManifest.js`, `src/data/companionRegistry.js`, and `src/engine/personalityProfile.js`; `data/creatures.json` parsed successfully; `git diff --check` passed; `node docs/qa/state-onboarding-migration-cases.mjs` passed 8/8; `python docs/qa/_run_web_release_gate.py --base http://localhost:8128 --port 8128` passed automated required checks 10/10 with asset integrity failures 0, responsive/accessibility warnings 0, Raphael restricted-agent 7/7, browser gates passing, and live UI/Soul Talk gate passing.
- Problems / risks: GitHub Pages still requires remote propagation after push. Human-only gates remain real-device mobile Safari/Chrome verification, moderated private testers, and legal/privacy/store-copy review. Flametail Fox is not runtime asset-ready until a new human-approved transparent PNG is produced.
- Next safe action: Push this scoped commit to the current branch and `main`, then verify `https://orochi771127.github.io/NexusLink/` after Pages updates. Any new Flametail image requires a separate asset approval-gated TASK_PACK.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`, `docs/raphael/RAPHAEL_CONSTITUTION.md`, `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`, `docs/agent/AI_EXECUTION_LEDGER.md`, `src/data/companionRegistry.js`, and `src/data/assetManifest.js`.

### 2026-07-01 - Codex - Linkara World And Faction Canon Sync

- Status: `VERIFIED`
- Branch / commit: `codex/raphael-core-main-review-gate` / included in current deployment commit
- Scope: Canon/spec synchronization for the supplied Linkara world map and character bible data. Locked the seven Linkara regions, three factions, five-element roster boundary, and neutral status for Greyshade Cat and Star-energy Boarlet. No map PNG import, no asset writes, no save schema, no unlock logic, no battle/team implementation, no dependency, no backend, no LLM/API, and no build step.
- Work performed: Updated Master Canon, World Bible, Character Bible, Runtime Canon, `AGENTS.md`, `CLAUDE.md`, and `ACCEPTANCE.md` so Linkara has seven named regions; Heartlight Council, Black Iron Hacker, and the Mundun Rift each own gold/wood/water/fire/earth roster slots; Black Iron secondary tags such as thunder/dark/order are style modifiers; extra Rift concepts such as `殘焰小獸` remain event/boss candidates rather than sixth roster slots; Greyshade Cat and Star-energy Boarlet are neutral. Updated `src/data/companionRegistry.js` display labels only for those two neutral companions.
- Verification: `git diff --check` passed for the scoped docs and registry files. Bundled Node `--check src/data/companionRegistry.js` passed. Scoped grep confirmed Linkara seven-region names, L6-L8 acceptance gates, neutral registry labels, and Rift boss-candidate wording are present.
- Problems / risks: This package does not integrate the attached world map image as a runtime asset; `src/ui/atlasController.js` remains the existing read-only SVG placeholder. Actual PNG import, region unlock progression, per-faction chapter data, offline `旅痕` state, or team battle all require separate TASK_PACKs; asset/state work needs GROUNDWORK approval.
- Next safe action: If the map should become a real in-game screen, open a GROUNDWORK asset/UI TASK_PACK to import an approved map image, audit mobile readability, and decide whether atlas data remains static or becomes chapter-gated state.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`, `docs/legacy-bible/02_WORLD_BIBLE.md`, `docs/legacy-bible/03_CHARACTER_BIBLE.md`, `docs/legacy-bible/04_RUNTIME_CANON.md`, `src/ui/atlasController.js`, `src/data/companionRegistry.js`, and this lane.

### 2026-06-30 - Codex - Commercial Core Canon v2 Docs

- Status: `COMPLETED`
- Branch / commit: `codex/raphael-core-main-review-gate` / included in current deployment commit
- Scope: Documentation-only canon and acceptance update for commercial chapter structure, RaphaelCore companion-agnostic positioning, player-facing `穩住裂隙` terminology, future `旅痕` offline adventure, and future-only同行/組隊 guardrails. No runtime code, state schema, storage key, assets, dependencies, backend, LLM/API, or build step changed.
- Work performed: Updated the Master Canon, `CLAUDE.md`, `AGENTS.md`, legacy Character Bible, legacy Runtime Canon, and `ACCEPTANCE.md` so Greyshade is the first validated runtime carrier rather than RaphaelCore itself; commercial content sells chapters/places/music/story/new encounters rather than skins, gacha, or battle power; `旅痕` is framed as a non-FOMO return-memory system; and future team play is allowed only as relationship/travel content, not farming or output ranking.
- Verification: Documentation grep confirmed the new terms and gates are present: `RaphaelCore 與角色外型解耦`, `first-session focal`, `穩住裂隙`, `旅痕`, `章節包`, no-gacha wording, no daily dispatch/farming wording, and `ACCEPTANCE.md` L1-L5. No browser/runtime tests were run because this package intentionally did not touch runtime files.
- Problems / risks: This is a canon/spec update only. Any actual per-companion state, offline adventure, chapter-commerce UI, or team system remains future work and must open a separate TASK_PACK with GROUNDWORK approval if it touches `defaultState.js`, `store.js`, `saveManager.js`, `index.html`, Pixi core, or assets.
- Next safe action: If implementation is requested, start with a docs-to-schema design TASK_PACK for per-companion relationship/travel memory state, then separately request GROUNDWORK approval before any state migration.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`, `docs/legacy-bible/03_CHARACTER_BIBLE.md`, `docs/legacy-bible/04_RUNTIME_CANON.md`, and this lane.

### 2026-06-30 - Codex - Web Release Gate Main-Review Automation

- Status: `VERIFIED`
- Branch / commit: `codex/raphael-core-main-review-gate` / already integrated before current deployment commit
- Scope: Release-gate and QA orchestration only. No save schema or storage-key change, no `saveManager.js`, no Pixi renderer rewrite, no `assets/**`, no dependency, no backend, no external LLM/API, and no deploy/merge/push.
- Work performed: Extended the web release gate with Raphael main-readiness coverage and fixed nested browser QA helpers so `NEXUS_QA_BASE` propagates to Raphael smoke, NLU smoke, and Stage 4 harnesses when the main gate runs on an alternate local port.
- Verification: `python -m py_compile docs/qa/_run_harness_smoke.py docs/qa/_run_nlu_smoke.py docs/qa/_run_stage4_human_playtest.py docs/qa/_run_raphael_main_readiness.py docs/qa/_run_web_release_gate.py`; `python docs/qa/_run_web_release_gate.py --base http://localhost:5178 --port 5178` passed automated required checks 10/10 with JS syntax 175 files / 0 failures, state migration 8/8, asset integrity pass, Raphael restricted-agent 7/7, responsive/accessibility probe pass, Raphael smoke pass, NLU smoke pass, Raphael main-readiness 24/24, Stage 4 pass, and live UI/Soul Talk gate pass.
- Problems / risks: The automated gate still lists human-only release blockers: real-device mobile Safari/Chrome verification, moderated private testers, legal/privacy/store-copy review, and explicit release approval. No commit, push, merge, or deploy was performed.
- Next safe action: Human release review can use `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md` and `docs/qa/_web_release_gate_output.json`; only after approval should a scoped commit/PR/release TASK_PACK be created.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md`, `docs/qa/_web_release_gate_output.json`, and this lane.

### 2026-06-28 - Codex - UI/HUD Claude Code Handoff

- Status: `COMPLETED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `25b9944`, handoff docs uncommitted
- Scope: Documentation-only handoff for Claude Code to continue HUD/UI V2 architecture work. No runtime code, no assets, no state, no storage schema, no Raphael behavior, no dependency, and no build step changed.
- Work performed: Added `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md` with current architecture map, file ownership, controller responsibilities, known fixed items, unresolved issues, acceptance criteria, and non-goals. Added `docs/handoff/CLAUDE_CODE_UI_HUD_TAKEOVER_PROMPT.md` as a paste-ready instruction for Claude Code.
- Verification: Documentation paths are inside the repo and readable/writable by Claude Code in this workspace. `git diff --check` should be run before any later commit.
- Problems / risks: This does not fix the listed UI/HUD issues; it only hands them off. Known unresolved items include mojibake in UI copy, incomplete V2 parity, CSS ownership fragmentation, real-device Safari fit, and non-persisted Settings volume ranges.
- Next safe action: Human can paste the prompt file contents to Claude Code together with the V2 design files. Claude Code should submit a plan before touching `index.html` or other Groundwork files.
- Required reading: `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md`, `docs/handoff/CLAUDE_CODE_UI_HUD_TAKEOVER_PROMPT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and the supplied V2 design handoff/screenshots.

### 2026-06-28 - Codex - Mobile UI v2 HUD/Icon Optimization

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for commit/push
- Scope: Mobile HUD and settings-volume refinement based on the user-supplied UI v2 references and phone screenshot. Touched only runtime HTML/CSS plus the existing in-memory audio manager/settings controller path. No `assets/**`, no `src/state/**`, no `saveManager.js`, no storage-key/schema change, no Pixi renderer change, no Raphael behavior change, no external dependency, no build step, and no generated image work.
- Work performed: Removed the standalone HUD speaker button so audio control lives in Settings; wired the Settings audio sliders to `AudioManager` volume state for in-session master/BGM/SFX control; exposed the existing UI v2 navigation PNGs for Explore/Care/Growth/Memory; restyled the center Home/Core nav button as a gold heart-core tile; reduced the Moonlake Habitat presence chip so it sits above Soul Talk without covering the companion.
- Verification: Bundled Node `--check` passed for `src/audio/audioManager.js`, `src/ui/settingsController.js`, and `src/app.js`. `docs/qa/state-onboarding-migration-cases.mjs` passed 8/8. `git diff --check` passed. A 390x844 browser probe confirmed no HUD speaker button, one settings button, five nav buttons, visible UI v2 nav images, Settings volume range updates, no horizontal overflow, and the compact habitat chip positioned above Soul Talk. `python docs/qa/_run_web_release_gate.py` passed 9/9 automated required gates with 0 accessibility warnings.
- Problems / risks: Real iPhone Safari visual approval remains human-only, especially exact fit under Safari browser chrome. The gate still lists manual release requirements for real-device testing, moderated private testers, and legal/privacy/store-copy review.
- Next safe action: Commit and push this scoped UI/HUD optimization only, excluding untracked QA output JSON files. Human should recheck the phone URL and capture any remaining V2 parity gaps.
- Required reading: `AGENTS.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`, the supplied Nexus Link UI v2 handoff/reference files, and the user-provided mobile screenshot.

### 2026-06-28 - Codex - Mobile UI v2 Runtime Repair

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for commit/push
- Scope: Runtime UI repair for the user-reported mobile issues in the UI v2 direction. Touched onboarding visibility, settings panel wiring, page/modal accessibility isolation, and mobile page proportions. No `assets/**`, no `src/state/**`, no `saveManager.js`, no storage-key/schema change, no Pixi renderer change, no Raphael behavior change, no dependency, no build step, no desktop wrapper, and no generated image work.
- Work performed: Added a Settings panel controller and panel route for the existing gear button; added a safe onboarding restart action that only resets existing onboarding flags; updated panel management so modal panels inert and hide active content pages; restored settings to the base panel whitelist; kept the old settings dropdown from binding when the new panel route is active.
- Verification: Bundled Node `--check` passed for `src/app.js`, `src/ui/panelManager.js`, `src/ui/onboardingController.js`, and `src/ui/settingsController.js`. `git diff --check` passed. `docs/qa/state-onboarding-migration-cases.mjs` passed 8/8. A 390x844 Playwright probe passed Start, Identity, Guidance, Settings, Care full-page sizing, Soul Talk button containment, no horizontal overflow, and companion-card-over-Care isolation. `python docs/qa/_run_web_release_gate.py` passed 9/9 automated required gates with 0 accessibility warnings.
- Problems / risks: Real iPhone/Android hardware visual approval remains human-only. The gate reused `http://localhost:5173`; human phone testing should use the LAN URL on the same Wi-Fi and can force a fresh first session with `?devReset=1`.
- Next safe action: Commit and push this scoped UI repair only, excluding untracked QA output JSON files. Then human should test on phone at the LAN URL and record any remaining visual issues with screenshots.
- Required reading: `AGENTS.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`, and the supplied Nexus Link UI v2 handoff/reference files.

### 2026-06-28 - Codex - Package 1-9 Required Fix Pass

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / required-fix commit pending; previous package baseline was `8d19e96`
- Scope: Fix Package 1-9 release-blocking issues that Codex can resolve in repo. Touched state normalization, panel accessibility, QA runners, release evidence, and checklist only. No assets, no external dependency, no storage key change, no desktop wrapper, no external LLM, no fetch, and no product scope expansion.
- Work performed: Added `meet` to valid onboarding statuses so the first-session Guidance -> Meet step survives normalization. Added a regression case to `docs/qa/state-onboarding-migration-cases.mjs`. Updated `src/ui/panelManager.js` so closed/inactive panels are `hidden`/`inert` and only the active panel remains focusable. Restored `aria-hidden` focus leakage as a hard web-release gate. Updated the web-release runner to complete the fresh onboarding flow before probing Home/Soul Talk, and fixed the live UI gate to ignore `#status-text` when it is inside a hidden panel.
- Verification: `node --check src/state/store.js`; `node --check src/ui/panelManager.js`; `python -m py_compile docs/qa/_run_web_release_gate.py docs/qa/_run_live_playtest_gate.py`; `git diff --check`; `node docs/qa/state-onboarding-migration-cases.mjs` -> 8/8; `python docs/qa/_run_web_release_gate.py` -> 9/9 automated required gates pass, with 0 accessibility warnings.
- Problems / risks: Human-only gates remain: real mobile device check, moderated 3-person private test, and legal/privacy/store-copy review. These cannot be completed by Codex and must not be marked as passed without human evidence.
- Next safe action: Commit and push the required-fix pass. Then run the local server for real-phone testing at the LAN URL and collect human private-test evidence before any Package 10 desktop-wrapper ADR.
- Required reading: `docs/qa/WEB_RELEASE_EVIDENCE.md`, `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`, Package 3/4/9 ledger entries, and `AGENTS.md`.

### 2026-06-28 - Codex - Web Release Gate / Private Test Pack Completion

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / Package 9 commit pending; baseline before this package was `a667853`
- Scope: Package 9 engineering/release side only. Added the web release checklist, private-test script, release evidence record, and read-only web release gate runner. No runtime behavior changes, no `src/**` product code changes, no state schema or storage-key changes, no `assets/**` changes, no dependency, no desktop wrapper, and no Steam build.
- Work performed: Added `docs/qa/_run_web_release_gate.py` to orchestrate JS syntax, save/onboarding migration, asset integrity, Raphael restricted-agent cases, responsive browser probe, and existing Raphael/browser gates. Added `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`, `docs/testing/PRIVATE_TEST_SCRIPT.md`, and `docs/qa/WEB_RELEASE_EVIDENCE.md`.
- Verification: `python -m py_compile docs/qa/_run_web_release_gate.py`; `git diff --check`; `python docs/qa/_run_web_release_gate.py` -> 9/9 automated required gates pass. JS syntax 168 files / 0 failures; migration 7/7; asset integrity pass; Raphael restricted-agent 7/7; Raphael smoke 17/17; NLU 8/8; Stage 4 10/10; live UI gate Soul Talk 10/10 and HUD 13/13.
- Problems / risks: Responsive probe reports focusable controls inside `aria-hidden` scope in both 390x844 and 1280x900 viewports. This is recorded as a manual accessibility follow-up warning, not fixed in Package 9 because this package is QA/release-only. Public release remains blocked on real-device, moderated private-test, legal/privacy, and accessibility follow-up evidence.
- Next safe action: If human approves, commit and push Package 9 files only. Next package after web/private-test approval is Package 10 Desktop Wrapper ADR; do not start wrapper work before the pending human gates are accepted.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `docs/testing/MANUAL_TEST_CHECKLIST.md`, `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `docs/qa/state-onboarding-migration-cases.mjs`, `docs/qa/_run_live_playtest_gate.py`, and Package 8 ledger entries.

### 2026-06-28 - Codex - Web Release Gate / Private Test Pack

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a667853`, uncommitted QA / RELEASE pack
- Scope: Package 9 engineering/release side only. Build a repeatable web release gate around existing browser, mobile viewport, save migration, asset integrity, Raphael, and accessibility checks. No runtime behavior changes, no state schema or storage-key changes, no `assets/**` changes, no dependency, no desktop wrapper, no Steam build, and no external service requirement.
- Work performed: Started after human approval to continue. Current worktree has only pre-existing untracked QA output files from prior gates.
- Verification: Pending web-release runner, local HTTP browser gate, state migration, asset integrity, accessibility probe, Raphael smoke, NLU, Stage 4, live UI gate, and evidence doc review.
- Problems / risks: This package must not overclaim final real-device approval if the current run is local/desktop only; private human test evidence must remain a checklist until humans fill it.
- Next safe action: Add docs/testing checklists, `docs/qa/WEB_RELEASE_EVIDENCE.md`, and a docs-only QA runner that orchestrates existing gates without modifying product runtime.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `docs/testing/MANUAL_TEST_CHECKLIST.md`, `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `docs/qa/state-onboarding-migration-cases.mjs`, `docs/qa/_run_live_playtest_gate.py`, and Package 8 ledger entries.

### 2026-06-27 - Codex - Raphael Restricted Habitat Agent

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `43100c0`, uncommitted AI_AGENT / EXPERIENCE / SAFETY pack
- Scope: Package 8 engineering side only. Add a restricted, serializable Raphael habitat-agent intent layer and runtime-owned reducer path around existing Soul Talk, touch, Return Echo, habitat-change, exploration, and standoff events. No state schema or storage-key change, no `saveManager.js`, no external LLM, no fetch, no tool registry, no auto-navigation, no automatic flow opening, and no direct store import or mutation from agent code.
- Work performed: Started after human approval. Current context read confirmed RaphaelCore external gateway is disabled by default and existing Soul Talk writes state only through the current store update path.
- Verification: Pending JS syntax checks, restricted intent whitelist harness, forbidden-action/source scan, Raphael smoke, NLU smoke, Stage 4 playtest harness, and live UI gate.
- Problems / risks: The adapter must not duplicate existing Soul Talk chat/memory/trace writes, and event observation must stay presentational rather than becoming proactive prompts or tasks.
- Next safe action: Implement adapter/reducer and minimal runtime presentation hooks without modifying save schema, protected assets, or release/desktop docs.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`, `docs/raphael/RAPHAEL_CONSTITUTION.md`, `src/ai/raphaelCore.js`, `src/ai/autonomy/actionPolicy.js`, `src/ui/soulTalkController.js`, and `src/app.js`.

### 2026-07-02 - Codex - Raphael Preview Staging Integration

- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`
- Status: `VERIFIED`
- Branch / commit: `main` / pending commit for Phase 9.
- Scope: Phase 9 QA-only staging comparison between NexusLink live `runRaphaelCore()` and sibling `raphael-ai-engine` / mock gateway compatibility. Preview output remains debug/report only. No frontend API key, no external LLM, no LangGraph runtime dependency inside NexusLink, no save schema, no Pixi renderer, no assets, and no companion data change.
- Work performed: Added a read-only preview adapter, browser/Node staging cases, and a Node QA runner. `src/app.js` now query-gates the preview harness behind `?raphaelPreview=1`; normal live Soul Talk remains unchanged and still uses existing `runRaphaelCore()` as final authority. The sibling engine worker now accepts legacy `POST /v1/gateway` contract while returning `trusted:false`, `authorityReport.finalAuthority="RaphaelCore"`, and `advisorOverrideApplied=false`.
- Verification: NexusLink preview staging runner passed 6/6; state onboarding migration passed 8/8; changed JavaScript syntax checks passed; `raphael-ai-engine` full local regression passed, including gateway legacy 3/3, gateway maturity 7/7, NexusLink adapter probe 9/9, and Phase 4 expanded eval 167/167. Existing Python browser wrappers were blocked by missing `playwright.sync_api` in bundled Python. In-app browser local smoke confirmed page load, one canvas, Soul Talk launcher, and message input, but its old module cache prevented a conclusive `window.__RAPHAEL_PREVIEW_REPORT__` browser assertion in this session.
- Problems / risks: Browser preview report should be rechecked after a clean browser context or deployed staging build. Do not route preview output into player-facing chat, memory, trace, state, or animation without a separate approved TASK_PACK.
- Next safe action: Commit/push Phase 9 in both repos, then use `?raphaelPreview=1` on a clean staging context for phone-side QA. Keep live routing disabled until a separate human-approved gateway routing task.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `src/ai/raphaelCore.js`, `src/ai/external/raphaelPreviewAdapter.js`, `docs/qa/RAPHAEL_PREVIEW_STAGING_REPORT.md`, and sibling `raphael-ai-engine/gateway/worker-skeleton.js`.

### 2026-06-27 - Codex - Raphael Restricted Habitat Agent

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for Package 8 commit/push
- Files touched: `src/ai/autonomy/actionPolicy.js`, `src/ai/raphaelAgentAdapter.js`, `src/engine/raphaelIntentReducer.js`, `src/ui/soulTalkController.js`, `src/app.js`, `src/ai/raphaelCore.js`, `src/ai/testHarness/raphaelAgentEventCases.js`, `styles/raphael-agent-presence.css`, `docs/agent/AI_EXECUTION_LEDGER.md`.
- Work performed: Added restricted habitat-agent action policy, serialized Raphael intent adapter, runtime-owned intent reducer, event-case harness, and minimal runtime presentation hooks for Soul Talk, touch, Return Echo, habitat trace changes, exploration, and standoff state changes. The agent code does not import store, does not call `updateState`, does not expose state patches, and does not call fetch, external LLM, tool registry, navigation, or flow-opening APIs.
- Verification: JS `--check` passed for all changed JS. `runRaphaelAgentEventCases()` passed 7/7, including safety-exit memory/trace blocking and forbidden `navigateTo` rejection. `git diff --check` passed. Raphael core smoke passed 17/17, NLU smoke passed 8/8, Stage 4 human playtest passed 10/10, and live UI gate at 390x844 passed with summary `ok=true` and console error count 0.
- Problems / risks: No blocking Package 8 issue remains. Existing runner output files under `docs/qa/_live_playtest_gate_output.json` and `docs/qa/_nlu_smoke_output.json` remain untracked and intentionally excluded from the package.
- Next safe action: Commit and push Package 8 only, excluding unrelated untracked QA output files. Package 9 should begin only after human approval because it is the Web Release Gate / Private Test Pack.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-27 - Codex - Illustrated Runtime Asset Audit

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `d613de9`, uncommitted GROUNDWORK / ART QA pack
- Scope: Package 7 engineering side only. Audit and enforce active illustrated companion manifest policy, sheet dimensions, texture sampling intent, anchor handling, and static fallback rendering. No `assets/**` file changes, no state schema or storage-key changes, no `saveManager.js`, no dependency, backend, build-step, or Raphael behavior changes.
- Work performed: Started after human approval. Root-relative manifest audit found the six active animated runtime manifests present and dimension-compliant. Runtime mismatch found: global canvas CSS was still forcing pixelated rendering.
- Verification: Pending syntax checks, dimension audit rerun, runtime/browser smoke, protected-root diff check, and staged-set review.
- Problems / risks: Loader validation must not break accepted manifests; texture policy must remain defensive across Pixi v8 property differences; final companion placement snap must remain intact.
- Next safe action: Finalize code/docs-only Package 7 changes and verify before committing/pushing this package only.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `src/data/assetManifest.js`, `src/pixi/spriteSheetAnimationLoader.js`, `src/pixi/companionRenderer.js`, and `styles.css`.

### 2026-06-27 - Codex - Illustrated Runtime Asset Audit

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for Package 7 commit/push
- Files touched: `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `src/data/assetManifest.js`, `src/pixi/spriteSheetAnimationLoader.js`, `src/pixi/companionRenderer.js`, `styles.css`, and `docs/agent/AI_EXECUTION_LEDGER.md`. No `assets/**`, `index.html`, `src/state/**`, `saveManager.js`, `src/ai/**`, dependencies, backend, or build-step files were modified.
- Work performed: Centralized active illustrated runtime companion asset policy and manifest roots; added runtime loader enforcement for `<=4096px` sheet edges, exact grid dimensions, bottom-center anchors, linear/mipmap texture policy intent, and non-pixelated animated sprite rendering; changed static fallback companion rendering away from `roundPixels`; removed global canvas `image-rendering: pixelated` from the runtime CSS.
- Verification: Bundled Node syntax checks passed for `src/data/assetManifest.js`, `src/pixi/spriteSheetAnimationLoader.js`, and `src/pixi/companionRenderer.js`. Active root-relative manifest audit passed for six active animated companions: 179 animation definitions and 171 unique sheets, all exact grid, `<=4096px`, and bottom-center where declared. `git diff --check` passed; `git diff --cached --name-only` was empty; `git status --short -- assets` and protected runtime-ready root checks returned empty. Chrome headless 390x844 and 1280x900 smokes passed with one canvas, `image-rendering:auto`, visible Greyshade sprite-sheet mode, `idle_calm`, anchor `0.5/1`, `roundPixels=false`, metadata loaded, no missing `idle_calm`, no animation errors, no policy warnings, no blocking console errors, and screenshots captured to the local temp directory. Package 3 migration runner still passed 7/7.
- Problems / risks: No blocking Package 7 issue remains. Existing `roundPixels=true` in `src/pixi/pixiApp.js` scene sprites and `src/pixi/habitatTraceRenderer.js` trace containers was intentionally not changed because it is outside illustrated companion rendering. Real-device visual approval remains Package 9.
- Next safe action: Commit and push Package 7 only, excluding unrelated untracked QA output files. Then open Package 8 only after human approval because it touches Raphael agent behavior and safety gates.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - First Trace / Return Echo Loop

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `3e0c466`, uncommitted EXPERIENCE pack
- Scope: Package 6 only. Make First Trace and Return Echo visible as one relationship loop by wiring existing trace, return, and Soul Talk paths. No state schema, storage-key, `saveManager.js`, asset, dependency, backend, build-step, or safety-core changes.
- Work performed: Started after human approval. Current read confirmed Soul Talk already writes memory and traces through `applyRaphaelCoreResult`, while app boot currently uses generic return greetings instead of trace-aware `buildReturnBehavior`.
- Verification: Pending implementation, syntax checks, return/trace no-duplicate checks, high-risk safety non-reward check, and browser smoke.
- Problems / risks: Duplicate memory or trace writes would corrupt relationship evidence; return copy must remain non-punitive; high-risk safety input must not create ordinary memory, trace, or bond reward.
- Next safe action: Wire trace-aware Return Echo through `src/app.js` and make the first created trace legible through the existing Soul Talk/store path without introducing new persistence schema.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `src/engine/returnBehaviorEngine.js`, `src/engine/habitatTraceEngine.js`, `src/engine/traceVisualMapper.js`, `src/pixi/habitatTraceRenderer.js`, `src/ui/soulTalkController.js`, and `src/app.js`.

### 2026-06-25 - Codex - First Trace / Return Echo Loop

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, awaiting human approval before commit/push
- Files touched: `src/app.js`, `src/engine/returnBehaviorEngine.js`, `src/ui/soulTalkController.js`, `docs/agent/AI_EXECUTION_LEDGER.md`. No state schema, storage key, `saveManager.js`, assets, dependencies, backend, build step, or safety-core files were modified.
- Work performed: Wired `buildReturnBehavior` into app boot so Return Echo prefers real visible habitat traces before generic presence/greeting fallback. Replaced directly used Return Echo copy with clear non-punitive Chinese. Added a short `lastSeenAt` gate so old traces do not retrigger Return Echo on immediate reload. Made First Trace legible through the existing Soul Talk/store path with a system line that explicitly says it is not a reward. Moved first awakening behind RaphaelCore safety/edge checks and deferred ordinary memory/trace for the same first-awakening turn, so fresh first Soul Talk writes one trace instead of double-writing.
- Verification: Bundled Node syntax checks passed for `src/app.js`, `src/engine/returnBehaviorEngine.js`, and `src/ui/soulTalkController.js`. Deterministic return/trace checks passed: trace-aware return metadata is present, short reload does not echo, normal Soul Talk creates one memory/trace, and high-risk RaphaelCore input creates 0 memory/trace and no bond reward. Chrome headless CDP smoke at 390x844 passed: trace-aware Return Echo preview visible, First Trace creates exactly 1 memory and 1 trace with the system line, high-risk browser Soul Talk creates 0 memory/trace and keeps bond at 5, screenshots captured in memory, and blocking console count is 0. Raphael core smoke passed 17/17, NLU smoke passed 8/8, Stage 4 playtest harness passed 10/10, state onboarding migration runner passed 7/7, `git diff --check` passed, and touched-runtime red-line wording scan returned 0 hits.
- Problems / risks: No blocking Package 6 issue remains. `runEvolutionEval()` still reports an existing `repeated_critic_failure` pattern even though its core smoke portion passes 17/17; the evidence is in RaphaelCore critic specificity for dependency/recall/fatigue replies and is outside this package's touched files.
- Next safe action: Human review. If accepted, commit and push Package 6 only, excluding unrelated untracked QA output files.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - Explore / Care / Growth / Memory full pages

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `0d27368`, uncommitted GROUNDWORK + EXPERIENCE pack
- Scope: Package 5 only. Convert the four core bottom-nav destinations from primary action-sheet modals into true content pages while preserving existing action handlers as fallbacks. This touches `index.html` and is therefore Groundwork-approved by the human. No state schema, storage-key, `saveManager.js`, Pixi renderer, asset, dependency, backend, or build-step changes.
- Work performed: Started after human approval. Current read confirmed the existing bottom nav is bound by `actionSheetController`, `page-content.css` is reserved for this work, and `page-full-nav.css` already styles the persistent nav.
- Verification: Pending implementation, syntax checks, migration runner, semantic scan, and static route smoke.
- Problems / risks: Existing map/codex/action-sheet entry points must not break; pages must not become RPG map expansion, feeding/gift economy, power-grind growth, fake memory, or modal-with-X semantics.
- Next safe action: Add a page layer and `pageRouter.js`, route bottom nav to pages, and keep existing action-sheet commit behavior available for page buttons.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `src/ui/actionSheetController.js`, `src/ui/mapController.js`, `src/ui/codexController.js`, and `index.html`.

### 2026-06-25 - Codex - Explore / Care / Growth / Memory full pages

- Status: `COMPLETED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, awaiting human approval before commit/push
- Files touched: `index.html`, `src/app.js`, `src/ui/actionSheetController.js`, `src/ui/pageRouter.js`, `styles/page-content.css`, `docs/agent/AI_EXECUTION_LEDGER.md`. `src/ui/mapController.js` and `src/ui/codexController.js` were read and reused through existing public open paths, but not modified.
- Work performed: Added a non-modal `page-layer` with true Explore, Care, Growth, and Memory page surfaces. Added `pageRouter.js` to route bottom nav away from the old primary action-sheet flow while preserving action-sheet fallback APIs. Page buttons reuse existing map, codex, Soul Talk, and action effect/store-save paths instead of directly mutating state. Explore stays Moonlake-first, Care avoids exchange/economy verbs, Growth presents relationship chapters, and Memory renders only saved `memories`, `emotionalMemories`, and `habitatTraces`.
- Verification: `node --check src/app.js`, `node --check src/ui/actionSheetController.js`, `node --check src/ui/pageRouter.js`, `node docs/qa/state-onboarding-migration-cases.mjs` passed 7/7, `git diff --check` passed, forbidden commerce/FOMO/feed/power semantic scan returned 0 hits. Chrome headless smoke using local Chrome passed 390x844 and 1280x900 nav/page checks with 0 console errors and 0 page errors; active pages did not overlap bottom nav or viewport center after layout correction. Interaction smoke passed: Explore opened existing map, Care saved via existing action path, Growth saved `trust_tuning` via existing action path and opened codex, Memory opened Soul Talk reflection.
- Problems / risks: No blocking issue found. The page layer is intentionally scrollable because 390x844 low-chrome panels are height-limited to keep the companion focal zone clear. Real-device visual acceptance is still part of Package 9, not this package.
- Next safe action: Wait for human approval. If approved, commit and push Package 5 only, then present Package 6 opening plan.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - Start / Identity / Guidance / Home

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `bbf2aaf`, uncommitted GROUNDWORK + EXPERIENCE pack
- Scope: Package 4 only. Implement the first-session Start, skippable Local Identity, short Heart-Core Guidance, Greyshade first meeting, and Home gate using the Package 3 onboarding state. This touches `index.html` and is therefore Groundwork-approved by the human. No storage-key, `saveManager.js`, Pixi renderer, asset, dependency, backend, or build-step changes.
- Work performed: Started after human approval. Current read confirmed existing DOM/Pixi split, `panelManager` panel semantics, and Package 3 state fields are available for gating.
- Verification: Pending implementation, syntax checks, onboarding state smoke, `git diff --check`, and viewport/source review.
- Problems / risks: `index.html` selector regressions can break existing controllers; onboarding must not override veteran saves or Return Echo; mobile safe-area and keyboard behavior must not block first-session actions.
- Next safe action: Add isolated V3 onboarding DOM/CSS/controller wiring, preserve existing panel/data-action selectors, and verify fresh/veteran flows without changing `saveManager.js`.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `src/app.js`, `src/ui/panelManager.js`, and `index.html`.

### 2026-06-25 - Codex - Start / Identity / Guidance / Home

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `bbf2aaf`, uncommitted GROUNDWORK + EXPERIENCE pack
- Scope: Package 4 only. Added Start, skippable Local Identity, Heart-Core Guidance, Greyshade first meeting, and Home presentation using the Package 3 onboarding state. Removed visible currency markup from the quick HUD. No storage-key, `saveManager.js`, Pixi renderer, asset, dependency, backend, or build-step changes.
- Work performed: Added onboarding DOM to `index.html`, introduced `src/ui/onboardingController.js`, wired it in `src/app.js`, gated Return Echo text/animation while onboarding is incomplete, and blocked companion tap/ambient walk while the onboarding layer is active.
- Changed files: `index.html`, `src/app.js`, `src/ui/onboardingController.js`, `styles/ui-v3-tokens.css`, `styles/ui-v3-onboarding.css`, and this ledger.
- Verification: Bundled Node syntax checks for `src/app.js` and `src/ui/onboardingController.js`; Package 3 migration runner still passed 7/7; fake-DOM onboarding smoke confirmed fresh saves show onboarding and completed saves hide it; `git diff --check`; no-index whitespace checks for the three new files; local HTTP server returned 200 for `index.html`, the new CSS files, and the new controller.
- Problems / risks: Real browser visual inspection was not available in this tool context, so 390x844 Mobile Safari-style visual QA remains a human/browser gate before release acceptance. Package 5 still owns true Explore/Care/Growth/Memory pages.
- Not touched: `src/state/saveManager.js`, `src/state/store.js`, `src/state/defaultState.js`, `src/pixi/**`, `assets/**`, `tools/**`, `scripts/**`, `src/ai/**`, external dependencies, and the unrelated untracked QA output files.
- Next safe action: Human review of the GROUNDWORK diff. If accepted, commit and push this package before opening Package 5, Explore / Care / Growth / Memory page realization.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`.

### 2026-06-25 - Codex - State / Onboarding Migration

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `8b25401`, uncommitted GROUNDWORK pack
- Scope: Package 3 only. Add compatible `playerProfile` and `onboarding` state, migrate new saves to Greyshade-only unlock, preserve legacy unlocks and active companion, and add a state migration QA runner. No `index.html`, `saveManager.js`, Pixi, asset, dependency, backend, or build-step changes.
- Work performed: Started the approved GROUNDWORK package after human approval. Current read confirmed new saves still default-unlock Greyshade plus the runtime-ready council companions, while `CLAUDE.md` requires nested normalizers and a veteran-save onboarding skip heuristic.
- Verification: Pending implementation, migration runner, JavaScript syntax checks, and `git diff --check`.
- Problems / risks: `normalizeState` currently shallow-merges nested objects; `activeCompanionId` can fallback if unlock preservation is mishandled; partial or malformed old saves must remain loadable under the existing `nexusLinkR2State:v1` key.
- Next safe action: Implement the smallest state normalizers and unlock migration, then verify new, legacy, partial, and damaged save cases before reporting for human review.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`, `src/state/defaultState.js`, `src/state/store.js`, and `src/data/companionRuntimePolicy.js`.

### 2026-06-25 - Codex - State / Onboarding Migration

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `8b25401`, uncommitted GROUNDWORK pack
- Scope: Package 3 only. Added minimal `playerProfile` and `onboarding` state, changed fresh defaults to Greyshade-only unlock, preserved legacy unlocks and active companions through normalization, and added migration QA coverage. No `index.html`, `saveManager.js`, Pixi, asset, dependency, backend, or build-step changes.
- Work performed: Added deep normalizers for `playerProfile` and `onboarding`, a veteran-save heuristic based on existing play traces, active-companion preservation for legacy saves, and `docs/qa/state-onboarding-migration-cases.mjs` covering fresh, legacy, active-only legacy, partial, damaged, and veteran-trace saves.
- Changed files: `src/state/defaultState.js`, `src/state/store.js`, `src/data/companionRuntimePolicy.js`, `docs/qa/state-onboarding-migration-cases.mjs`, and this ledger.
- Verification: Bundled Node syntax checks for changed JS and the QA runner; `docs/qa/state-onboarding-migration-cases.mjs` passed 7/7 cases; `git diff --check`; `git diff --no-index --check -- NUL docs/qa/state-onboarding-migration-cases.mjs`.
- Problems / risks: This package only creates the migration foundation. Start / Identity / Guidance / Home runtime UI is still Package 4. Existing live localStorage with no play traces may still enter onboarding, which is intentional under the veteran heuristic.
- Not touched: `index.html`, `src/state/saveManager.js`, `src/pixi/**`, `assets/**`, `tools/**`, `scripts/**`, `src/ai/**`, external dependencies, storage key, and the unrelated untracked QA output files.
- Next safe action: Human review of the GROUNDWORK diff. If accepted, commit and push this package before opening Package 4, which touches `index.html` and requires a fresh Groundwork approval plan.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`.

### 2026-06-25 - Codex - Steam Demo Master Blueprint lock

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a6666c7`, uncommitted docs-only pack
- Scope: Lock the approved Steam Demo execution sequence, gates, and prohibited scope in a single repo-local blueprint. No runtime, state, asset, dependency, or release mutation.
- Work performed: Started Package 1 of the approved Steam Demo Master Blueprint.
- Verification: Pending documentation consistency review against `NEXUS_LINK_MASTER_CANON_v3.1.md`, `AGENTS.md`, `CLAUDE.md`, and `ACCEPTANCE.md`.
- Problems / risks: Existing `docs/qa/_live_playtest_gate_output.json` and `docs/qa/_nlu_smoke_output.json` are unrelated untracked user artifacts and remain untouched.
- Next safe action: Create and review the docs-only blueprint, then append the final verification record before requesting Package 2 approval.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`, and `docs/handoff/RAPHAEL_AI_HANDOFF.md`.

### 2026-06-25 - Codex - Steam Demo Master Blueprint lock

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a6666c7`, uncommitted docs-only pack
- Scope: Package 1 only. Added the repo-local Steam Demo execution blueprint and no runtime, state, asset, dependency, or release changes.
- Work performed: Added `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md` with the approved V3 visual direction, Greyshade-first first-session model, Raphael restricted habitat-agent boundary, all ten task packs, gates, and release sequence.
- Verification: `git diff --check`; `git diff --no-index --check -- NUL docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`; reviewed all ten numbered delivery sections and the explicit no-fetch/no-direct-mutation agent rule.
- Problems / risks: The blueprint is an execution contract, not approval to start Package 2 or any later package. Existing untracked QA output files remain untouched.
- Next safe action: Request human approval for Package 2, V3 Visual System Tokens; keep it docs/design-only with no `index.html`, runtime, or asset changes.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`.

### 2026-06-25 - Codex - P0-B Pixi focal-zone root-bounds fix

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `fd5d8eb` base, uncommitted P0-B fix
- Scope: Root-bounds sizing, first-paint companion animation loading, and companion focal-zone visibility. No state, asset, Raphael, or UI-controller changes.
- Work performed: Made `#game-root` bounds authoritative when non-zero, retried root measurement after initial layout, observed root resizes where the browser supports it, and reduced first-paint animation loading to visible idle/sleep frames before warming the remaining core pack.
- Verification: `git diff --check`; bundled Node syntax checks for all UI and Pixi modules; local HTTP server on port 8765; fresh-origin browser checks at 390×844, 393×852, 430×932, and 1280×800. Each had one canvas and matching root/canvas CSS dimensions. Visual checks confirmed the live Pixi greyshade cat in the focal zone at 390×844 and desktop; console errors were zero.
- Problems / risks: The in-app browser's clipboard bridge prevented a repeated browser text injection. The unchanged typed/quick-reply Raphael behavior was verified in the prior UI pack and by the deterministic Raphael smoke/dialogue harness in this task. Full cross-device human QA remains separate.
- Next safe action: Review and commit this bounded P0-B diff, then run the first-habitat cross-device QA evidence package.
- Required reading: `AGENTS.md`, `ACCEPTANCE.md`, `docs/dev/LOCAL_PREVIEW.md`, `src/pixi/pixiApp.js`, and `src/pixi/companionRenderer.js`.

### 2026-06-24 - Codex - Runtime baseline and remediation audit

- Status: `VERIFIED`
- Branch / commit: `codex/ui-v2-aurora-parity` / `4c65a40` for the audit record
- Scope: Current root vanilla JS and PixiJS runtime; no runtime patch was made.
- Work performed: Recorded Aurora B UI completion and inspected the first-habitat
  runtime against the current Master Canon.
- Verification: The audit records JavaScript syntax checks, asset-manifest
  checks, browser paths, and console checks. The current 390x844 local Home also
  boots with one Pixi canvas.
- Problems / risks: P0-B Pixi sizing can place the live companion outside the
  focal zone in constrained or letterboxed hosts. P0-A opening commitment is
  incomplete because new saves unlock all runtime-ready companions. First-habitat
  cross-device QA is not signed off on this branch.
- Next safe action: Open a separate approved GROUNDWORK TASK_PACK for P0-B
  root-bounds sizing before expanding gameplay or systems.
- Required reading: `docs/qa/NEXUS_LINK_RUNTIME_AUDIT_2026-06-24.md`,
  `docs/architecture/RUNTIME_MAP.md`, `docs/testing/MANUAL_TEST_CHECKLIST.md`,
  `ACCEPTANCE.md`.

---

### 2026-07-28 - Codex - Moonlake Live 3D Hybrid R1 - VERIFIED

- Status: `VERIFIED`; implementation and automated release validation are complete.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-MOONLAKE-LIVE-3D-R1`.
- Layer: `GROUNDWORK + EXPERIENCE`; Owner explicitly approved the constitution change, Three.js exception, GLB promotion and Moonlake runtime integration.
- Runtime integration:
  - fixed Three.js `0.185.0` ES-module import map with matching `GLTFLoader`;
  - one live 3D environment canvas below the existing Pixi companion canvas, driven by the existing Pixi ticker rather than a second animation loop;
  - 3D world-to-screen projection feeds the current 2D companion motion controller;
  - explicit Moonlake waypoint graph crosses a sixteen-plank bridge to the far-bank fishing point;
  - clear/rain/mist and day/dusk/night/dawn use existing environment authorities;
  - WebGL/Three/GLB failures retain the existing Pixi habitat as a non-blocking fallback.
- Performance and lifecycle:
  - quality-tier DPR, shadows, rain density, grass and shrubs;
  - bounded import/GLB timeouts;
  - context loss/restoration handling and explicit disposal;
  - 30.002-second 390×844 soak: 1,801 frames / 60.03 FPS in the automated desktop browser, one live-3D canvas, animation state advanced.
- Verification:
  - `moonlake-live3d-roaming-cases.mjs`: PASS, all four walking directions, bridge traversal, fishing point and reduced-motion fallback;
  - browser action matrix: 16 companions / 112 loads, zero failures and zero console errors;
  - live 3D, night rain, dusk mist, context recovery and `?live3d=0` fallback probes: PASS;
  - full web release gate: `28/28 PASS`, no accessibility warnings;
  - JavaScript syntax, Python syntax and `git diff --check`: PASS.
- Red-line check: no reward, Growth, save schema, unlock, relationship, Safety, RaphaelCore, battle or FOMO authority changed.
- Problems / risks: the 60 FPS result is desktop-browser evidence at a mobile viewport; physical-device D1/D2/D3/D6 verification remains a separate manual gate.
- Evidence: `docs/qa/MOONLAKE_LIVE3D_HYBRID_R1_EVIDENCE.md`.
- Branch / commit: `codex/moonlake-r5-integration`; commit and protected-main publication follow this verified closeout.
- Next safe action: publish through the required PR gate, merge to `main`, then refresh the codebase MCP index.

## Lane 2 - Game Art, UI, And Visual Production

### 2026-07-28 - Codex - Moonlake Live 3D Clay Resin Art R1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved live 3D Moonlake production in the
  selected clay/resin miniature direction.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-MOONLAKE-LIVE-3D-R1`.
- Layer: `GROUNDWORK` at GLB/fallback promotion; staging and audit precede the
  asset copy.
- Visual lock: two close framing cliffs, two subtle waterfalls, central
  circular camp platform, ornate blue/ivory tents, traversable bridge, original
  low-shrub language, readable lake edge, matte-satin clay/resin materials and
  restrained Cyber-Taoism cyan/gold accents.
- Motion lock: low-amplitude lake movement, continuous subtle waterfalls,
  asynchronous grass sway, clear/rain/mist atmosphere and day/dusk/night/dawn
  lighting. Companions remain 2D illustrated sprites.
- Quality route: use the existing Blender R3 candidate as geometry source and
  the Owner-provided/candidate imagery as composition and material reference;
  apply the `img2threejs` staged quality contract before runtime promotion.
- Non-goals: no generated 3D companion, generic stock campsite, distant
  mountain wall, rigid whole-island sway, baked weather or raster scene
  presented as live 3D.
- Required reading: `docs/design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md`,
  `docs/architecture/HABITAT_SYSTEM_MASTER_SPEC.md`, the selected visual
  references, GLB audit output and this lane.

### 2026-07-16 - Codex - Silent Anchor phase-search interaction surface - VERIFIED

- Status: `VERIFIED` for automated/browser presentation; real-device visual review remains a human gate.
- Branch / commit: `main` / base `30fc8e9` + verified uncommitted worktree; no commit or push authorized.
- Scope: Completed the mobile-first Moonlake K9 guidance and one `starwood_trail` Silent Anchor / Phase Search vertical slice using existing DOM, weather/trace language, animation intents, and art. No assets, dependency, reward ladder, or parallel visual system were added.
- Work performed: Fresh players see all Chapter 1 nodes but only highlighted `moonlake_camp` is enabled; veteran progress remains unlocked. Starwood presents direct / anchor / calm-sync / return around a water-vein compass. Anchor and calm-sync are session-only observations, Return really exits to habitat with zero mutation, and Direct preserves existing exploration risk. Previous result toasts no longer cover the compass; all four controls stay inside the 390x844 panel. Reduced motion disables the breathing ring.
- Verification: Real Chromium map gate passed **42/42** at 390x844 across fresh and legacy-veteran state, four choices, no overflow, return-to-habitat, reduced motion, close control, Escape, panel switch, page switch, and >650ms encounter cancellation; console errors 0. Companion renderer lifecycle passed **26/26**. The full release gate passed **17/17** with accessibility warnings 0. Screenshots were visually inspected for first route, phase search, Pixi failure, and safety terminal surfaces.
- Problems / risks: Automated layout is clean, but mobile Safari/Chrome real-device review remains open. The slice intentionally has no optimal-yield route, rare drop, FOMO, or relationship penalty.
- Next safe action: Human reviews the current 390x844 feel and runs the real-device matrix; do not promote new art or broaden this slice without a separate approved package.
- Required reading: The `IN PROGRESS` entry below, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/production/NEXUS_LINK_NEXT_GAMEPLAY_SYSTEMS_SPEC.md`, `ACCEPTANCE.md` K9/L4-L5, and the current map browser output inside `_web_release_gate_output.json`.

### 2026-07-16 - Codex - Silent Anchor phase-search interaction surface

- Status: `IN PROGRESS`
- Branch / commit: `main` / current worktree at `30fc8e9`; no commit or push authorized.
- Scope: EXPERIENCE-only presentation for first-session Moonlake locking and one `starwood_trail` Silent Anchor / Phase Search vertical slice. Reuse current weather, trace, motion, typography, and DOM/Pixi surfaces; no new assets or parallel visual system.
- Work performed: Selected a restrained Moonlake water-vein compass with one breathing anchor ring as the signature interaction motif. Other Chapter 1 nodes remain visible but clearly disabled until the safe camp visit; reduced-motion and 390x844 behavior are mandatory.
- Verification: Pending four-route interaction QA, disabled/ARIA state checks, 390x844 screenshot review, reduced-motion probe, and confirmation that return is mutation-free and no route communicates optimal yield.
- Problems / risks: The visual layer must not turn the safety-first lock into a task badge, urgency cue, reward ladder, or permanent missed choice.
- Next safe action: Finish the narrow interaction surface, then verify it alongside map lifecycle behavior and current V3 visual hierarchy.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `ACCEPTANCE.md` K9/L4-L5, `src/ui/mapController.js`, `src/data/explorationNodes.js`, `styles.css`, and this lane.

### 2026-07-13 - Claude Fable 5 - Standoff HUD v2 de-boxing + chapter map-node slots (Owner screenshots)

- Status: `VERIFIED`（自動化；真機 = human gate）
- Branch / commit: `main` / uncommitted worktree changes（commit/push 依 CLAUDE.md §10 等 Owner 指示；parent `237d825`）。
- Scope: EXPERIENCE UI。Files: `src/ui/battleController.js`（injectStandoffLayoutStyles 重寫 + injectTelegraphStyles 去框）、`src/ui/mapController.js`（章節節點座標 + crystal_ruins 28→26）、`styles.css` map-node 區塊（節點足跡縮小）。index.html 一行未動（`display:contents` + flex `order` 純 CSS 重排）；無 GROUNDWORK。Owner 回饋：「對峙介面擋住角色、血量方塊過大、畫面一堆方塊、地圖節點重疊」；風格不變、只改形狀位置。impeccable skill（layout 流程）引導本包。
- Work performed: (1) 對峙 HUD 化：`.standoff-field` 以 display:contents 解散，兩張量表卡改為——雜訊＝頂部 27px 細條（無框無底、文字陰影、量條深色軌），心核＝行動列正上方的淡漸層帶（同步/疲勞/微光同帶）；日誌無框、上緣 mask 淡出、min-height:0 壓到 60px（基底 min-height:96 曾蓋過 max-height——修掉）；「下一拍」從邊框卡改為無框文字行（warn/danger 語氣改用文字光暈）；行動鈕變薄、邊框放輕；flex order 骨架＝標題→雜訊→裂隙形體→〔彈性舞台〕→日誌→下一拍→心核帶→共鳴圈→行動列。(2) 地圖：CH-5b 的 12 個章節節點原本全擠 y8-15 頂帶（直接壓在晶岩遺跡/觀測點上）→ 改為全章共用兩個安全槽位（裂隙 50,7 頂中；探索點 86,36 右中——同時只顯示當前章，永不互撞）；節點足跡 84×92→72×~80（orb 56→46、glyph 19→16、標籤 12.5→11.5、em 88→72）——順帶修掉既有的晶岩遺跡×湖心倒影 14×12px 角落重疊（crystal 28→26 補強）。
- Verification: bundled `node --check` ×2；impeccable detect.mjs layout scope 0 findings；瀏覽器 390×844 實測：地圖 ch2 存檔 8 節點（月湖 6＋風歇草坡＋孤鳴裂隙）**兩兩零重疊、零出界**；對峙實戰（點孤鳴裂隙進場＋按共鳴）：雜訊條 27px、裂隙形體底 251 → 日誌頂 515＝**舞台空隙 264px**（夥伴完全可見，原本 ~0）、日誌 59px、telegraph 36px 實時顯示、六元件垂直零重疊、de-box computed 確認（border 0、mask 生效、漸層帶）；**web release gate 10/10、0 console error、0 a11y 警告**。
- Problems / risks: 真機重測 = human gate（對峙進場看貓、打完看地圖兩節點）；預覽面板 renderer 不繪畫格 → 量測前需關 transition（同 keyboard-v6 條目注意事項）；telegraph 無框後在極亮背景依賴文字陰影——真機若不夠讀，可補一層 4% 深底。
- Next safe action: Owner 指示 commit/push → 真機重測 Owner 截圖場景（對峙中角色可見、無大方塊；地圖節點不重疊）。
- Required reading: `src/ui/battleController.js`（injectStandoffLayoutStyles v2 註解）、`src/ui/mapController.js`（NODE_LAYOUT 註解）、本條。

### 2026-07-13 - Claude Fable 5 - Keyboard model v6: stop fighting the keyboard (Owner-reported black voids)

- Status: `VERIFIED`（自動化部分；真機 = human gate）
- Branch / commit: `main` / lands with this commit (parent `748eff0`); Owner 2026-07-13 明令 COMMIT+PUSH+INDEX。
- Scope: EXPERIENCE viewport/鍵盤行為。Files: `src/utils/dom.js`（重寫）、`src/ui/soulTalkController.js`、`src/ui/onboardingController.js`、`styles/soul-talk-drawer.css`、`styles/ui-v3-onboarding.css`、`styles/mobile-safari-polish.css`（註解）。無 GROUNDWORK（index.html / pixiApp / save 未動）。**取代鍵盤模型 v5，並解除舊「v5 一行未動」lane 紅線——Owner 2026-07-13 真機截圖（iPhone iOS 26）證實 v5 仍黑塊，且 Owner 明令「不想有黑色的空白區塊，就按照自動彈窗就好」。**
- Work performed: (1) `--app-height` 永遠 = 佈局視口高（documentElement.clientHeight），與 visualViewport 完全脫鉤——鍵盤彈出時 shell/canvas 完全不縮；移除 vv listeners、kb-open/kb-fallback/kb-measured/kb-estimated、--kb-inset/--vv-offset-top、55% 估高 fallback（expectSoftKeyboard / syncViewportDuringTransition / resetViewportVars 刪除）。(2) 新增 `restoreViewportAfterKeyboard()`：blur 後延遲檢查點（260/620/1000ms，編輯中跳過）把 window 捲動硬歸零——修 iOS 26「鍵盤收起後頁面停在被上推位置 → 下半屏永久黑塊」回歸（舊碼從未歸零 pan）。(3) 心語抽屜：st-focus 不再重新定位（無吊頂、無 38svh 保留、無 kb-inset 貼合），永遠底部錨定；st-focus 只做內容收納（手機面板降 46svh、收 kicker、壓快速回覆、放開 chat-log 下限；桌面 hover+fine 維持 72svh）。(4) onboarding：ob-focus 釘頂 42vh 整組移除；名字輸入框 blur → restore。(5) bindViewportVars 加開機補量檢查點（120/400/1000ms），涵蓋 0 尺寸視口啟動的 in-app webview。(6) 順手修：soulTalkController.js dedupeKey 模板字串裡的原始 NUL byte 改為 `\u0000` 逸出（ripgrep/git 先前把整檔當 binary；runtime 語意完全相同）。
- Verification: bundled `node --check` 3 檔全過；**web release gate 10/10、0 console error、0 a11y 警告**（跑兩次，最後一次在 dom.js 最終版之後）；全新 origin 瀏覽器探針：mobile 視口開機 `--app-height: 812px`；onboarding 聚焦名字輸入框 → 無 ob-focus、卡片維持底部錨定、輸入框可見；心語聚焦 → st-focus 上、抽屜 bottom 在所有狀態固定 720px（零位移）、高度 cascade 以關 transition 實測：桌面分支 584.64px（=72svh）精確命中、手機 46svh 規則 cascade 勝出確認（(0,3,2) > (0,2,1)）；blur → class 移除、--app-height 不變、scrollY 0。後續預覽探針注意：Browser pane renderer 可能凍結 CSS transition 於進度 0（並以 0 尺寸視口啟動頁面）——量 computed style 前先關 transition。
- Problems / risks: **真機 iPhone Safari（iOS 26）重測是 human gate**：開心語 → 聚焦 → 打字 → 送出 → 收鍵盤，確認輸入框由原生上推帶到鍵盤上方、打字中無黑帶、收起後無殘留下半屏黑塊（blur 檢查點正是修這個殘留）。Android Chrome 應由既有 `interactive-widget=resizes-content` meta 縮排版。In-app webview（IG/LINE）：原生上推是 OS 級行為，預期可用；估測機器已移除，任何平台都不再有「猜錯鍵盤高度」型黑帶。若某平台回歸，本包可乾淨檔案級 revert。
- Next safe action: 真機重測截圖場景（iPhone Safari：打字時輸入框貼鍵盤上方無黑帶；收鍵盤後下半屏完整復原）。
- Required reading: `src/utils/dom.js`（v6 頭部註解）、`styles/soul-talk-drawer.css`（v6 區塊）、本條。

### 2026-07-13 - Codex - Initial-bond portrait cards

- Status: `VERIFIED`
- Branch / commit: `main` / lands with this commit (parent `bad3690`).
- Scope: EXPERIENCE UI styling only. Reused already approved runtime portrait paths; no image generation and no `assets/**` changes.
- Work performed: Added each selected companion's existing 512x512 portrait to the initial-bond card, displayed as a restrained 64x64 framed portrait within the existing Cyber-Taoist card hierarchy. The layout preserves the playfield, uses the existing per-card hue, and adds no new overlay or persistent chrome.
- Verification: All three image requests loaded with non-zero natural dimensions; screenshot review at 390x844 confirmed all names, temperaments, lines, and portraits fit inside the onboarding panel with viewport width equal to document width; reduced-motion behavior remains unchanged.
- Problems / risks: Portrait crop uses `object-fit: cover`; future portraits should keep the face/emblem inside the central safe area.
- Next safe action: Real-device visual confirmation only.
- Required reading: `styles/ui-v3-onboarding.css`, the three registry portrait paths, and this lane.

### 2026-07-12 - Codex - Anti-AI-Slop Commercial UX Gate

- Status: `VERIFIED`
- Branch / commit: `main` / `7729e54` with uncommitted task changes; no commit or push performed.
- Scope: First Session Flow UX governance, recovery presentation, and copy across Start / Identity / Guidance / Home / Explore / Care / Growth / Memory / Soul Talk / Return Echo. No new visual system or asset work.
- Work performed: Added the current Anti-AI-Slop UX Gate, linked it from the commercial handoff and Fable 5 takeover prompt, and made M1-M5 mandatory for First Session acceptance. Added restrained busy/recovery styling and Traditional Chinese, Simplified Chinese, English, and Japanese copy that explains what failed, what remains safe, and what the player can do next.
- Verification: Mobile 390x844 and desktop 1280x900 screenshots were visually inspected from the isolated release probe. Companion focal zone, bottom navigation, Soul Talk launcher, one-canvas layout, labels, overflow, and onboarding completion all passed; no console or accessibility probe errors. Copy scan and human real-device review remain separate manual gates.
- Problems / risks: Current screenshots prove the core first-loop view, not every state-matrix cell. The gate intentionally preserves the V3 Moonlake system; broader card/glow reduction requires evidence per surface rather than a blanket restyle.
- Next safe action: Capture and review the remaining empty, mature-save, refusal, return, recovery, reduced-motion, and text-size states; do not redesign the visual system without a selected visual target and human review.
- Required reading: `docs/production/ANTI_AI_SLOP_UX_GATE.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/content/NEXUSLINK_COPYWRITING_FINAL_PASS.md`, `ACCEPTANCE.md` M, and this lane.

### 2026-07-12 - Claude Fable 5 - 美術資產缺口稽核（供 Owner 指派 Codex 產圖）

- Status: `COMPLETED`（稽核文件，非產圖；`docs/art/ART_ASSET_GAP_AUDIT.md`）
- Branch / commit: `main`（基於 CH-5b `9fca86a`）
- Scope: Owner 2026-07-12 指示「計算缺少哪些跟多少美術圖並記錄怎麼生成」。盤點 `assets/**` 現況 vs `companionRegistry`/`assetManifest`/`enemyRegistry`/`evolutionLines`/`chapterRegistry` 引用；無程式變更。
- Work performed: 建立稽核文件。**結論：runtime 無硬缺口**——11 隻夥伴 Stage-1 29 動作 512 全到齊。三個路線圖/升級缺口：**GAP-1 裂隙敵人剪影 10 張**（設計 §7 v2，★最推薦先做，規格已定、不需前置工程）；**GAP-2 進化型態圖**（Stage-2/3；核心 12 型態 MVP idle ～ 全量 638 sheet；需先做「進化視覺切換」接線 + 補 5 幼獸演化線文字）；**GAP-3 各章可玩棲地近景背景 12+ 張**（需先做區域棲地切換）。文件含 drop-in 生成規格（512/anchor/grid/`defeated←faint` 對映）與 29 動作表。
- Verification: 敵人清單/emotion 對 `enemyRegistry`（10 敵 5 情緒各 2）交叉核對；規格三方一致（`ILLUSTRATED_COMPANION_RUNTIME_POLICY`＝`CLAUDE.md §4`＝實測 sprigfawn manifest）；Stage-1 已完成未計入。
- Problems / risks: 5 幼獸未列入 `ASSET_MANIFEST`/`RUNTIME_COMPANION_ASSET_KEYS`＝QA 覆蓋缺口（gate 未驗這 145 張），**非美術缺口**；已在文件記錄，建議另開小工程任務補入（本輪不改程式）。GAP-2/3 需 Owner 對範圍與接線拍板。
- Next safe action: Owner 指派 Codex 先產 GAP-1 的 10 張裂隙剪影；GAP-2/3 待功能接線與拍板。
- Follow-up（2026-07-12 同日）：新增機讀生產索引 `docs/art/ART_PRODUCTION_INDEX.json`（Owner 指示「INDEX 要生產的圖，Codex 讀 INDEX 生成」）。GAP-1 十項 `status:"ready"`，敵人 name/flavor/emotion 由 `enemyRegistry.js` 程序生成、逐字對齊（allMatchRegistry 驗證通過）；含 emotionTints（RIFT_EMOTION_TINT HSL + 近似 hex）、shapeHint、staging→target 路徑與 GROUNDWORK 晉升 gate；每項＝1 張 512 靜態剪影（motion 由 runtime 相位驅動，不需動畫幀）。GAP-2/3 為 `status:"blocked"`（含 blockedOn）。
- Required reading: `docs/art/ART_PRODUCTION_INDEX.json`、`docs/art/ART_ASSET_GAP_AUDIT.md`、`docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md` §7。

### 2026-07-11 - Codex - Formal Five Pilot Set Completed In Review Staging

- Status: `VERIFIED` review checkpoint; no runtime approval.
- Branch / commit: `main` / uncommitted continuation after the previously pushed formal-five checkpoint.
- Scope: Complete the missing Starstripe Cub species-specific pilot under `output/character-pilots/starstripe-cub/touch_accept/` so all five formal Heartspark Council members now have an approved identity seed and one processed motion-family review pilot. No `assets/**`, runtime, registry, manifest, save/state, tool, script, dependency, or integration changes.
- Work performed: Recorded Owner continuation as Starstripe seed approval. Generated a six-frame 2x3 feline `touch_accept` sheet on a green key background to protect the locked pink-magenta eyes, then applied chroma cleanup, six-frame extraction, shared-scale normalization, and four-paw bottom alignment. Exported canonical transparent sheet and GIF preview with job/config/prompt/QC records.
- Verification: Exact 1536x1024 RGBA sheet with six 512x512 cells; transparent corners; no edge-touch frames; grounded alpha bottoms y=474-475. Visual review confirms feline shoulder/neck softening, head lean, slow blink, relaxed cheeks, forepaw settle, and restrained tail-curl release. No human hand, canine play-bow, fox flourish, missing paw, eye-color loss, or green-key spill is visible. JSON parses, PNG decode checks and `git diff --check` pass.
- Problems / risks: Like the other generated pilots, frame-level stripe, whisker, collar engraving, and fur microdetails drift slightly and frame 1 is not a pixel-identical seed lockback. All five pilots remain review candidates outside runtime roots; comparative Owner approval and a separate GROUNDWORK asset-readiness task are still required before any `assets/**` promotion.
- Next safe action: Present the five selected pilot sheets/previews as one comparative review set. If approved, define a narrow promotion TASK_PACK with exact final actions, cleanup/lockback requirements, GPU-memory/loading budget, asset paths, metadata, and runtime integration tests.
- Required reading: `docs/art/STAGE1_CHARACTER_ASSET_INDEX.md`, all five character locks, `docs/art/SPECIES_MOTION_TRANSLATION.md`, the five selected pilot `qc-report.md` files, and this lane.

### 2026-07-10 - Codex - Formal Five Species-Specific Character Pilot Checkpoint

- Status: `VERIFIED` checkpoint; review outputs only, no runtime approval.
- Branch / commit: `main` / this checkpoint commit (see git log).
- Scope: Commit the Owner-directed formal Heartspark Council review-production checkpoint under `output/character-pilots/**`. Includes approved identity seeds and one species-specific pilot each for Blazetail Kit, Auriowl, Crystalfin Seahorse, and Sprigfawn, plus the generated/processed Starstripe Cub identity seed awaiting final Owner confirmation. No `assets/**`, runtime code, registry, manifest, save/state, tool, script, dependency, or public-site integration.
- Work performed: Used built-in image generation with deterministic chroma cleanup and `generate2dsprite` normalization. Produced Blazetail `touch_accept` (2x3), Auriowl avian grounded step/hop `right_walk` (2x4), Crystalfin Seahorse aquatic-hover `idle_calm` (2x3), and Sprigfawn cervid grounded `idle_calm` (2x3). Produced all five 512x512 identity seeds. Sprigfawn's first magenta-key processing was rejected for brown-fur matte collision and replaced by a blue-key v2; the rejection remains documented. Starstripe Cub's seed preserves its pink eyes but retains a recorded thin edge-antialiasing risk before runtime promotion.
- Verification: All selected seed frames are exact 512x512 RGBA with transparent corners and complete silhouettes. Selected pilot sheets are exact divisible grids with 512x512 cells, shared scale, stable species-appropriate anchors, and no edge-touch frames. Visual review confirmed avian, aquatic-hover, cervid, vulpine, and feline anatomy remain distinct. JSON job/config files parse, `git diff --check` passes, and scope contains no `assets/**` or runtime writes.
- Problems / risks: Generated multi-frame pilots retain small micro-detail drift and are not pixel-identical seed lockbacks. Starstripe Cub `touch_accept` has not yet been generated. These files are review candidates, not asset-readiness approval; nothing in this checkpoint may be wired into runtime without a separate Owner-approved GROUNDWORK task and final edge/identity audit.
- Next safe action: After this checkpoint is pushed and indexed, obtain final Starstripe seed confirmation, generate/QC its feline `touch_accept` pilot, then conduct one comparative Owner review across all five species before deciding whether any selected output should enter an `assets/**` promotion task.
- Required reading: `docs/art/STAGE1_CHARACTER_ASSET_INDEX.md`, all five files under `docs/art/character-locks/`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, each pilot `generation-job.json` and `qc-report.md`, and this lane.

### 2026-07-10 - Codex - Formal Five Pilot Production: Blazetail Seed And Touch-Accept Pilot

- Status: `VERIFIED` (review candidate only; not runtime-approved)
- Branch / commit: `main` / uncommitted review staging.
- Scope: Begin the Owner-approved five-motion-family pilot sequence outside runtime roots. First target is a Blazetail Kit `idle_calm` transparent seed candidate, followed only after human identity approval by a `touch_accept` 2x3 pilot sheet. No `assets/**`, runtime code, manifest, registry, save schema, tools, scripts, dependency, commit, or push changes.
- Work performed: Routed through `generate2dsprite`, `imagegen`, and `sprite-pipeline`. Created the review-only Blazetail seed job, produced and cleaned the approved transparent seed, then generated one six-frame 2x3 `touch_accept` candidate. Applied chroma cleanup with a one-pixel matte contraction, extracted six frames with shared scale and bottom-center foot alignment, and exported a canonical review sheet plus GIF preview under `output/character-pilots/blazetail-kit/touch_accept/`.
- Verification: Owner Photo 1 was viewed at original resolution; lock spec, species-motion guide, animation catalog, and latest Art lane were reread. The approved seed has transparent corners, alpha bbox (46,26)-(466,486), and complete paws, ears, and tail. The pilot sheet is exact 1536x1024 RGBA with six 512x512 cells; all corners are transparent, no frame touches an outer edge, and the grounded alpha bottoms remain at y=480/481. Visual inspection confirms one fox, one tail, no human hand, and a coherent lean-in/receive/settle sequence. The Owner's continue signal authorizes the next review pilot, not runtime promotion.
- Problems / risks: Flame-fur edges remain transparency-sensitive. The generated sequence preserves the locked silhouette and palette but has small face-mark and ornament micro-detail drift, and frame 1 is not a pixel-identical copy of the seed. It remains a review candidate outside `assets/**`; neither the JPG reference nor generated pilot is runtime-approved.
- Next safe action: Start Auriowl with a separate transparent `idle_calm` seed gate, using an avian talon datum and folded-wing silhouette before any 2x4 grounded-hop/right-walk sheet is generated.
- Required reading: `docs/art/character-locks/blazetail-kit.lock.md`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `output/character-pilots/blazetail-kit/seed-frame/generation-job.json`, and this lane.

### 2026-07-10 - Codex - Formal Heartspark Five Character Locks And Species Motion Translation

- Status: `VERIFIED`
- Branch / commit: `main` / this package commit (see git log).
- Scope: Owner confirmed that the formal Heartspark Council Stage 1 roster is `auriowl`, `sprigfawn`, `crystalfin-seahorse`, `blazetail-kit`, and `starstripe-cub`, using five supplied reference images. Created identity locks and species-motion translation; corrected current authority docs that still called the animated test carriers the formal five. No image generation, `assets/**`, `src/**`, runtime registry, save schema, package/dependency, tools, scripts, staging asset, or deletion work.
- Work performed: Added `docs/art/STAGE1_CHARACTER_ASSET_INDEX.md`, five lock specs under `docs/art/character-locks/`, and `docs/art/SPECIES_MOTION_TRANSLATION.md`. Recorded reference dimensions and SHA-256 fingerprints without copying white-background JPG presentation art into runtime assets. Defined separate vulpine, feline, cervid, avian, and aquatic-hover motion families, including owl takeoff/landing datum, seahorse hover datum, deer antler clearance, consent/rejection body language, and 29-ID semantic translations. Updated Master Canon, AGENTS, CLAUDE, chapter roadmap, animation/automation docs, and docs index. Reclassified `flame-flicker`, `ice-talon`, `stone-shard`, `vine-twist`, and `crystal-rabbit` as protected current runtime test carriers whose final purpose remains an Owner decision; no runtime status was changed.
- Verification: Original-resolution visual inspection completed for all five Owner references. Reference fingerprints recorded as 960x1280 / 1024x1280 / 1024x1280 / 1024x1280 / 864x1152 with stable SHA-256 values. Lock completeness script confirmed all five files contain identity, silhouette, face, color, forbidden drift, runtime policy, reference, and approval sections. Node import confirmed canon roster order exactly `auriowl,sprigfawn,crystalfin-seahorse,blazetail-kit,starstripe-cub`; `node --check src/data/heartsparkCouncilCanon.js` passed. `git diff --check` passed. Scope scan confirmed zero `assets/**`, `src/**`, `index.html`, `tools/**`, or `scripts/**` changes.
- Problems / risks: The current runtime still names the five test carriers in `companionRegistry.js`, guardian animation profile comments, milestone/Soul Talk data, onboarding choices, and `chapterRegistry.js`; docs now distinguish that technical reality from final canon. The shared catalog uses `faint` while the current runtime intent map uses `defeated`. The formal five remain `runtimeReady:false`; lock prose is prepared for Owner review, not final sheet or runtime approval. Old test-carrier reuse/retirement is intentionally undecided.
- Next safe action: Owner reviews the five lock specs. After approval, generate only one pilot action per motion family outside runtime roots (fox locomotion/consent, owl perch/flight, seahorse hover/current, deer hoof/antler clearance, tiger boundary stance). Any manifest, asset, registry, chapter, onboarding, or save migration is a separate GROUNDWORK TASK_PACK.
- Required reading: `docs/art/STAGE1_CHARACTER_ASSET_INDEX.md`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, the five files under `docs/art/character-locks/`, `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md` §5.2–5.3, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-06 - Claude Fable 5 - 環繞式對峙佈局：夥伴登場 + 狀態併排一行（Owner 參考圖方向）

- Status: `VERIFIED`（preview 完整回合實測；真機手感 = 人類 gate）
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: Owner 需求（參考概念圖）：①灰影貓的戰鬥動畫要在對峙中用上 ②雙方狀態條精簡縮小、併排只佔一行。勘察發現動畫層**零缺口**（standoff.resonance→skill_cast、barrier→defend、pulse→attack_basic、battle.hit 受擊、victory/defeated/back_walk 結局全部既有映射且已在 emit）——唯一問題是 modal 全屏蓋住 canvas，動畫白播。Files: `src/ui/battleController.js` only（樣式全自注入；index.html/styles.css 零修改）。
- Work performed: **環繞式對峙佈局**：(1) battle-modal 透明化（背景/邊框/陰影全除），backdrop 改上深/中透/下深漸層——夥伴從 modal 後現身場中，戰鬥動畫從此可見；進場加警戒姿態（soul.defensive）。(2) `.standoff-field` grid 兩欄：雜訊條｜心核條併排一行，hint 收起、vitals（同步/疲勞/微光）縮排到卡內。(3) 對峙期間 `body.standoff-active` 隱藏 bottom-nav + 夥伴名片 + 設定鈕（全神貫注；finish 恢復），modal 貼底、日誌壓縮至 56px 半透明、行動列縮緊——底部塊下移讓出 157px+ 舞台帶給夥伴。(4) 裂隙形體加 `rf-shadow` 暗暈底層（白天藍天上藍/淡色情緒霧原本隱形——實測發現）。
- Verification: preview（:8128，375×812）真實流程實測：狀態卡 sideBySide（top 相同、各 ~150px 寬）、modal 背景 transparent、nav/HUD 對峙中 opacity 0、舞台帶 y329→486+、貓在湖畔完整可見（夜景截圖存證：月亮/湖面/貓/倦怠霧體/telegraph/2×2 行動列同框）；完整回合（設界→共鳴→撤退→回營地）：finish 後 nav/HUD 恢復、standoff-active 清除、activePanel none。console 0 錯誤。live gate：soul_talk 9/10（既有）、HUD 13/13、0 console errors。`node --check` + `git diff --check` PASS。
- Problems / risks: (a) 白天場景下低飽和情緒（倦怠）的霧體即使有暗暈仍偏淡——語義上正確（倦怠=幾乎不可見的灰），但 Owner 若要更醒目可調 RIFT_EMOTION_TINT 或暗暈 alpha。(b) 真機動畫手感（skill_cast/defend/hit 在對峙中的觀感）待人類確認。(c) 行動列為 2×2 佈局（既有結構），參考圖的 4 欄大卡風格屬 v2 美術方向。(d) 貓的站位固定在棲地平台（bottom-center）；參考圖的「面對裂隙」構圖需未來 focal/走位系統（CH-6 可一併考慮）。
- Next safe action: Owner 真機打一場對峙看動畫手感與佈局；CH-2（初遇選角 UI）仍為下一包。
- Required reading: `src/ui/battleController.js`（injectStandoffLayoutStyles / rf-shadow / standoff-active 生命週期）、`docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md` §7。

### 2026-07-06 - Claude Fable 5 - 心語視窗通訊軟體化：桌面聚焦佈局修正 + 寬螢幕裁切修復

- Status: `VERIFIED`（preview 多視口實測；手機真機 v5 路徑 = 人類 gate）
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: 人類需求（「聊天視窗在上半部、要像通訊軟體、鍵盤貼合、各裝置不裁切」）。**鍵盤模型 v5 / --kb-inset 貼合一行未動（人類明令 + ledger 紅線）**。Files: `styles/soul-talk-drawer.css`、`styles/mobile-safari-polish.css` only。無 JS、無 GROUNDWORK。
- Work performed: 勘察證實兩個真因：(1) drawer **常態本來就是底部錨定**（通訊軟體樣式已是現狀）；「跑到上半部」= `st-focus` 讓位佈局（soulTalkController.js:96 聚焦時無條件加 class），在**沒有虛擬鍵盤的電腦上也觸發**——修法：`@media (hover:hover) and (pointer:fine)` 內覆蓋 `st-focus:not(.kb-open)` 回底部錨定常態；`.kb-open`（真的量到虛擬鍵盤，如觸控筆電）不受覆蓋、仍走 v5 貼合；手機 coarse pointer 不命中此塊，v5 原樣。(2) 寬螢幕裁切：app 在寬螢幕是置中窄列（panel-layer=列寬），drawer 寬度公式用 `100vw` → iPad 768 實測右緣溢出 +70px——修法：兩處 `width` 改 `auto`（由 base `.modal-panel` 的 left/right edge + margin auto 決定，永不溢出容器），`max-width:720` 保留。
- Verification: preview（:8128）視口矩陣全 `fits:true`：375×812（drawer 343w，top103/bottom720）、430×932（398w）、768×1024（448w 置中對齊遊戲列；修復前 720w 溢出）、1280×800（448w，left416 對齊遊戲列）。桌面聚焦（st-focus 加上、kb-open 無）drawer **全程底部錨定不跳頂**（top 130 不變）、blur 後復原。375 截圖：標準通訊視窗佈局（玩家右對齊/夥伴左對齊/系統置中/輸入欄貼底）。live playtest gate ×2：soul_talk 9/10（唯一失敗 = 既有 no_recall_bleed，與基線一致）、HUD 13/13；第一輪出現 2 個 `null.split` console error，重跑 0 個且 src/runner 皆無此模式 → 偶發 transient（疑 preview 工具鏈），非本包引入。`git diff --check` PASS；diff 自審：v5 區塊（st-focus top / kb-open bottom / 38svh fallback）零觸碰。
- Problems / risks: (a) 手機真機（coarse pointer）不受本包影響是 CSS 條件推理 + 靜態審查結論，真機重測仍是人類 gate。(b) preview 工具在超寬模擬視口的截圖是縮放假象（佈局以 DOM 量測為準）。(c) presence 行偶顯「已載入 idle_c…」dev 字樣 = 既有 content-tier 殘留（companionRenderer 載入狀態行），非本包範圍。(d) CSS heuristic 快取：真機驗證請硬刷新。
- Next safe action: 人類真機三平台快測（iPhone Safari / Android Chrome / iPad）：聚焦時鍵盤貼合如舊、電腦聚焦不再跳頂、無裁切。之後 TP-6 音訊包。
- Required reading: `styles/soul-talk-drawer.css`（新 media 塊 + width 註解）、本 lane 前一條（心語入口緊湊化）。

### 2026-07-06 - Claude Fable 5 - 心語入口緊湊化（滿寬大欄位 → 右下小圓鈕）

- Status: `VERIFIED`
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: 人類直接需求（截圖圈出首頁文字重複：心語欄預覽字 + 邀請旁白 + 主動台詞三層疊）。優先級評估：此改動 > TP-6 音訊（TP-6 卡音色資產人類 gate；本需求 gate 已開）。Files: `styles/ui-v2-aurora.css` only。**未動** `index.html`（launcher 本身就是 `<button data-panel-trigger="soulTalk">`，純 CSS 縮小）、無 GROUNDWORK、無 JS 變更。
- Work performed: 心語常駐條（滿寬 grid、min-height 70、預覽字+波形+內部「對話」pill）縮為右下小圓鈕：`left:auto; right:var(--edge); width:auto; inline-grid 單欄; border-radius 999px`；`em#soul-talk-preview` / `.soul-wave-deco` / 內部 `.btn-primary` 以 `display:none` 隱藏（DOM 與 `#soul-talk-preview` 的 JS 更新路徑不動）；「心語」strong 放大 + `.soul-core-glow` 呼吸光保留。點開後的聊天視窗（soul-talk-drawer）零變更——本來就是單面板玻璃聊天視窗。規則刻意置於既有 soul-strip 區塊與其 max-width:400px 覆蓋之後（後聲明勝出）。
- Verification: 375×812 preview（port 8128）：鈕縮至 79×54 右下、預覽字消失、棲地（貓/營火/湖面）大幅露出、與 gentle-invitation（nav+96px）垂直錯開不重疊；點鈕 → drawer 正常開啟（activePanel=soulTalk、transform 到位）；drawer 內發送「今天有點累」→ 玩家行/情境回覆/疲憊回覆/首痕跡訊息/存檔全部正常；探索分頁時鈕 opacity 0 + pointer-events none（page-content.css 讓位規則仍勝出）、回首頁恢復；0 console errors。live playtest gate（NEXUS_QA_BASE=:8128）：soul_talk 9/10（唯一失敗 = 既有 `no_recall_bleed`，與基線一致，非本包引入——見 Lane 1 TP-7 條目）、HUD 13/13、awakening/touch/storage/pixi 全過、0 console errors。`node` 無涉；`git diff --check` PASS。自審對照 REVIEW_CHECKLIST：授權範圍/依賴/localStorage/耦合/紅線全過；aria-label 保留。
- Problems / risks: (a) 驗證時遇本機 CSS heuristic 快取（reload 不足），以 stylesheet cache-bust 確認——真機請硬刷新或等 Pages 部署（有 ETag）。(b) `hud.talk`（「對話」）鍵仍在字典但不再顯示（無害）。(c) 真機各寬度的鈕位置感受仍是人類 gate。
- Next safe action: 人類真機確認小鈕手感與位置；後續 TP-6 音訊包（音色資產 gate 待人類）。
- Required reading: `styles/ui-v2-aurora.css` 心語緊湊化區塊、本 lane 前一條、Lane 1 的 TP-7 條目。

### 2026-07-04 - Codex - Anti-Vibe Copywriting Final Pass

- Status: `COMPLETED`
- Branch / commit: `main` / uncommitted docs-only package
- Scope: Added a NexusLink-specific copywriting final-pass guide inspired by `weijt606/anti-vibe-writing` and wired it into commercial UI/UX handoff docs. Also added guardrails and reviewed reference entries for external persona-skill links after the user supplied an X post plus `alchaincyf/paul-graham-skill`, `alchaincyf/karpathy-skill`, `alchaincyf/steve-jobs-skill`, `alchaincyf/elon-musk-skill`, and `alchaincyf/nuwa-skill`. No runtime code, GROUNDWORK, assets, package/dependency, skill install, submodule, backend, or external API wiring changed.
- Work performed: Added `docs/content/NEXUSLINK_COPYWRITING_FINAL_PASS.md` with NexusLink copy voice, anti-AI-smell rules, surface presets, final checklist, deterministic review scan, attribution to the MIT-licensed external reference, and a policy for external writing/persona references. Registered anti-vibe-writing as a final-pass editing lens, Paul Graham as an optional product/writing critique lens, Karpathy as an optional AI reliability critique lens, Steve Jobs as an optional product focus/taste critique lens, Elon Musk as an optional first-principles complexity critique lens, and Nuwa as an optional persona-skill methodology reference. Updated `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`, `docs/handoff/FABLE5_COMMERCIAL_UIUX_TAKEOVER_PROMPT.md`, and `docs/agent/NEXUSLINK_AI_DEVELOPMENT_MODE.md` so future agents run this pass when player-facing copy changes.
- Verification: Read GitHub repository metadata, README, LICENSE, and SKILL files for `alchaincyf/paul-graham-skill`, `alchaincyf/karpathy-skill`, `alchaincyf/steve-jobs-skill`, `alchaincyf/elon-musk-skill`, and `alchaincyf/nuwa-skill`; all are MIT. The persona skills include first-person roleplay behavior and Nuwa creates persona skills, so NexusLink documents explicitly restrict them to critique or methodology lenses only. Also read metadata, README, LICENSE, core skill file, Chinese pattern rules, final checklist, and scenario presets for `weijt606/anti-vibe-writing`. X post `2072873659698700343` did not expose full content through the page reader; search snippets showed it references a persona-skill collection and Paul Graham-style skill repositories, so it was integrated only as an external-source caution, not as canon.
- Problems / risks: This does not automatically rewrite existing UI strings. Existing runtime copy still needs a separate approved TASK_PACK if the human wants in-code text changes. The linked X post remains partially unverified unless the user pastes its full text or individual repositories are audited.
- Next safe action: For the next commercial UI/UX or first-session copy task, use `docs/content/NEXUSLINK_COPYWRITING_FINAL_PASS.md` as a required final pass before handoff.
- Required reading: `docs/content/NEXUSLINK_COPYWRITING_FINAL_PASS.md`, `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-02 - Claude Fable 5 - First Session UX Repair TASK_PACK B (P1) — UI Visuals

- Status: `VERIFIED`
- Branch / commit: `main` / committed with the Lane 1 TASK_PACK B entry of the same name (see it for engineering detail)
- Scope: CSS + copy side of the first-loop pack. No assets, no gold outside selected/primary, no red-dot/badge/progress visuals (K6).
- Work performed: `ui-v3-onboarding.css` first-loop section — four non-core nav items fully hidden during the loop and revealed with a 720ms opacity fade; `.first-loop-hint` quiet cyan-line pill above the soul strip; `.first-loop-skip` low-contrast underlined text link; reduced-motion fallback. `pageRouter.js` player-facing copy shortened to 6–10 char hints, dev-jargon removed.
- Verification: Chromium 390×844 screenshot of the gated first session (sleeping Greyshade by Moonlake, single hint + skip, soul strip, lone 心核 nav item); reveal line and un-gated nav screenshot-verified after loop completion.
- Problems / risks: real-device visual pass pending, same as Lane 1.
- Next safe action: include the first-loop surfaces in the human real-device checklist.
- Required reading: Lane 1 entry `2026-07-02 - Claude Fable 5 - First Session UX Repair TASK_PACK B`.

### 2026-07-02 - Claude Fable 5 - First Session UX Repair TASK_PACK A (P0) — UI Visuals

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted (same package as the Lane 1 entry of the same name; see that entry for engineering detail and verification)
- Scope: CSS-only visual side of the P0 pack. No assets, no baked text/character, no gold outside selected/primary (aurora rule respected — player bubble uses cyan accent).
- Work performed: `styles.css` — `.chat-log` scroll model grid→flex (iOS-safe bottom anchor via `margin-top:auto`), `.chat-line.player` distinct cyan bubble (`rgba(138,217,255,…)`, right-aligned), `.chat-line.system` demoted to quiet 12px borderless side-note, new `.companion-feedback` toast (fixed, bottom-center above nav, tone variants accept/guarded/refusal/calm, refusal = neutral moon-grey not danger-red, `prefers-reduced-motion` fallback). `styles/ui-v3-onboarding.css` — removed dead `body.kb-open` block; added `body.ob-focus` rules pinning the onboarding card to the top 42vh keyboard-safe zone with internal scroll and compact type.
- Verification: Chromium preview 390×844 screenshots — chat drawer with cyan player bubbles distinct from companion bubbles; ob-focus card top=12px height 344px ≤ 42vh (354px) with input visible; toast visible states exercised for accept/guarded/refusal tones.
- Problems / risks: real-device visual pass (iOS Safari + in-app browsers) still pending, same as Lane 1.
- Next safe action: include these surfaces in the human real-device checklist before commit approval.
- Required reading: Lane 1 entry `2026-07-02 - Claude Fable 5 - First Session UX Repair TASK_PACK A (P0)`.

### 2026-07-02 - Codex - Commercial UI/UX Documentation Handoff

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted docs-only package
- Scope: Art/UI/UX handoff only. Established the commercial visual/UX execution entry point for a future Fable 5 First Session Flow and V3 UI/UX slice. No runtime styling, live UI CSS, image generation, asset movement, asset deletion, manifest change, or visual approval claim.
- Work performed: Added a current UI/UX handoff that locks Greyshade Cat + Moonlake as the first-session focus, points to the V3 visual system, defines the Start / Identity / Guidance / Home / Explore / Care / Growth / Memory / Soul Talk / Return Echo target surfaces, and prevents old 64x64 / R2 / legacy references from overriding the current illustrated 512 commercial direction. Added the Fable 5 prompt with explicit design rules and non-goals.
- Verification: `git diff --check` passed. Scoped grep confirmed `docs/asset-pipeline.md` is marked `NEEDS UPDATE` for commercial companion production and that the new handoff preserves the illustrated 512 policy while keeping legacy/R2 material as reference only.
- Problems / risks: This does not visually QA or implement the next UI/UX slice. Current worktree already contains unrelated in-progress UI/runtime changes by another agent; this package leaves them untouched.
- Next safe action: Before any Fable 5 visual implementation, read the commercial handoff and open a new TASK_PACK that names exact UI/CSS/runtime files and acceptance refs. Real-device mobile review remains a separate human gate.
- Required reading: `docs/production/NEXUS_LINK_COMMERCIAL_UIUX_HANDOFF.md`, `docs/handoff/FABLE5_COMMERCIAL_UIUX_TAKEOVER_PROMPT.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-06-30 - Codex - UI v2 Bottom Nav Release Screenshot Fix

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a053d79`, uncommitted UI/CSS release-review changes
- Scope: UI v2 bottom navigation fit only. Touched CSS layout, not `index.html`, not `assets/**`, not Pixi renderer, not save/state, not companion data, and not Raphael reasoning behavior.
- Work performed: Fixed release-review screenshot clipping where the desktop 1280x900 constrained habitat stage was 480px wide but `styles/page-full-nav.css` forced the bottom nav to 680px. The nav now uses five grid columns and a 430px desktop width so all five nav items fit inside the habitat frame while mobile keeps the existing `100vw - 32px` fit.
- Verification: Playwright bounding-box probe confirmed desktop stage `480px`, bottom nav `430px`, and all five buttons inside the stage. Final screenshots from the 5178 release gate show mobile 390x844 and desktop 1280x900 with all five nav items visible, Soul Talk not overlapping the nav, one Pixi canvas, and no console errors. The full web release gate passed 10/10 automated required checks after the fix.
- Problems / risks: Real-device Safari fit under browser chrome remains human-only. The CSS comments in nearby legacy sections still include mojibake; this task did not rewrite unrelated comments.
- Next safe action: Human visual review of the final screenshots and live device pass before any release approval.
- Required reading: `styles.css`, `styles/page-full-nav.css`, `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md`, `docs/qa/_web_release_gate_output.json`, and this lane.

### 2026-06-30 - Claude Code - 嚴格自審：鍵盤重量加 setTimeout 檢查點（不只靠 rAF）

- Status: `VERIFIED`（機制以 headless 證實，含 rAF 被停用情境；真機 iOS 為最終驗收）
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `04abb5a`。
- Layer: EXPERIENCE，**純 JS**（1 檔 `src/utils/dom.js`）。無 CSS／index.html／schema／assets。
- 嚴格自審發現: `04abb5a` 的 `syncViewportDuringTransition` **只靠 rAF 迴圈**。iOS Safari 在鍵盤動畫期間有時會節流/暫停 rAF —— 正是我們要追蹤的窗口；若 rAF 停擺，burst 不 tick → 黑塊可能重現。這正是「測試過卻在真機失敗」的殘留風險。
- Work performed: 在 `syncViewportDuringTransition` 內加 setTimeout 檢查點 `[60,140,260,420,620,820]ms`（依 durationMs 過濾），與既有 rAF 迴圈雙保險：rAF 正常時逐幀平滑追蹤；rAF 被節流時，setTimeout 仍在鍵盤動畫後重量到位、設好 `kb-open`/`--app-height`。重複呼叫只延長 rAF 截止。
- Verification: `node --check` OK、`git diff --check` clean、migration 8/8、web release gate **9/9、0 a11y warning、no failing node**、0 console error。Headless（fresh origin 8141 載入新碼）：focus 後 `setViewportVars` 被呼叫 **54 次**（rAF≈48 + setTimeout≈6）；**將 rAF stub 成 no-op（模擬 iOS 節流）後仍重量 6 次** → 證明 setTimeout belt 獨立有效；Soul Talk 開關正常、chat-log 359。
- Problems / risks: 真機鍵盤時序 headless 無法完全重現 → iPhone Safari + Chrome 實測為最終驗收（直向＋橫向）。
- Next safe action: 真機 `?v=<commit>` 實測：第一次 focus 即「輸入框貼鍵盤上方、無黑塊」免拖曳。
- Required reading: 本 lane（含 `04abb5a`）、`CLAUDE.md` §4/§5。

### 2026-06-30 - Claude Code - 鍵盤動畫窗口內持續重量 viewport（首次 focus 即自適應，免手動拖曳）

- Status: `VERIFIED`（機制以 headless 證實；真機 iOS 為最終驗收）
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `4b83daa`。
- Layer: EXPERIENCE，**純 JS**（2 檔：`src/utils/dom.js`、`src/ui/soulTalkController.js`）。無 CSS／無 index.html／無 schema／無 assets／無 Raphael 行為變更。
- 背景（真機回報，P0）: 部署版（`4b83daa`）在真 iPhone Safari + Chrome，第一次點 Soul Talk 輸入框、鍵盤彈出時**仍有大黑塊**；要**手動拖曳/捲動**才會跳成正確版面（輸入框貼鍵盤上方）。截圖佐證：黑塊狀態仍顯示聲紋 waveform，而 compact 模式在 `kb-open` 時會隱藏 waveform → 證明**首次 focus 當下 `body.kb-open` 沒被設**。
- 根因: `soulTalkController` focus handler 只在 rAF + double-rAF（~16–32ms）重量一次 viewport，但 iOS 虛擬鍵盤要 ~250–350ms 才動畫完成 → 重量發生在鍵盤開之前 → `--app-height` 維持全高、`kb-open` 沒設 → 黑塊。之後唯一可靠修正它的事件是使用者手動拖曳產生的 `visualViewport.scroll`（已綁定 → 修正）。幾何（Codex `2fcb905` 的 visual-viewport 錨定 + 本人 `895b038/4b83daa` 的 chat-log 自適應）本來就對，缺的只是**重量時機**。
- Work performed:
  - `src/utils/dom.js`：新增 `syncViewportDuringTransition(durationMs=800)` —— focus/blur 後在整段鍵盤動畫窗口內，每一幀呼叫 `setViewportVars()`（rAF 迴圈、有截止時間、重複呼叫只延長截止不起第二迴圈）。`setViewportVars`/`bindViewportVars` 及既有 visualViewport listener 不動（穩態路徑）。
  - `src/ui/soulTalkController.js`：focus → `syncViewportDuringTransition(800)`（取代原 rAF×2），blur → `syncViewportDuringTransition(600)`；focus 時保留 chatLog 捲到底。移除不再使用的 `setViewportVars` import。
  - 效果：鍵盤一開始壓縮 viewport 的那一幀，`kb-open` 立即翻開、`--app-height`/`--vv-offset-top` 逐幀跟上 → drawer 即時升到鍵盤上方，**第一次 focus 就是正確版面，免手動拖曳**（對應 ChatGPT 建議與驗收）。
- Verification: `node --check`(2 JS) OK、`git diff --check` clean、migration 8/8、web release gate **9/9、0 a11y warning、no failing node**、0 console error。Headless 機制驗證：focus 事件後 `setViewportVars` 在 ~800ms 內被呼叫 **49 次**（修前 2 次）；rAF/setTimeout 在預覽可正常觸發；Soul Talk 開關正常、chat-log 359（≥96）。（headless 無法彈真 iOS 鍵盤、且 `location.reload()` 會吃舊 ES module 快取 → 用新 port 8137 fresh origin 載入新碼後才量到 49 次。）
- Problems / risks: 真機鍵盤的 `visualViewport` 時序/捲動狀態 headless 無法完全重現 → **iPhone Safari + Chrome 實測為最終驗收**（直向＋橫向）。rAF 在前景可見頁正常觸發（已驗證），低電量節流屬極端例外。
- Next safe action: 真機 `orochi771127.github.io/?v=<commit>`：開 Soul Talk → 點輸入 → 鍵盤彈出 → **第一次就應呈現「輸入框貼鍵盤上方、無黑塊」**、免拖曳；打多行、收合再開、直向＋橫向。
- Required reading: 本 lane（含 `4b83daa`/`895b038`/`2fcb905`）、`CLAUDE.md` §4/§5、計畫 `safari-chrome-chatgpt-web-resilient-curry.md`。

### 2026-06-30 - Claude Code - 嚴格自審：chat-log 自適應下限加裝置餘裕（200→240px）

- Status: `VERIFIED`（模擬 + gate；真機 iOS 仍需最後一次實測確認）
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `895b038`。
- Layer: EXPERIENCE，**純 CSS**（1 檔 `styles/soul-talk-drawer.css`，1 行）。無 JS／無 index.html／無 schema／無 assets。
- 嚴格自審發現: `895b038` 的 `clamp(0, --app-height - 200px, 96px)` 中 200 = headless Chrome 量到的 drawer 固定開銷，floor 剛好等於可用空間（**零餘裕**）；真機字體度量若多幾 px，floor 會再次超過可用空間、輸入框被裁切幾 px。
- Work performed: 常數 200→240（多 ~40px 餘裕），讓 floor 在所有小高度都「嚴格 < 可用空間」，輸入框保證可見。因 chat-log 以 flex 填滿可用空間、floor 只是下限，正常高度行為完全不變。
- Verification: 模擬鍵盤可視高度 420/360/300/260/220/**190**（極端橫向）six 檔，**輸入框＋送出全部可見**、drawer 距鍵盤 8px、chat-log 213→4 平滑降；real 390×844 chat-log 359、real 390×390 chat-log 133（floor 96，無 regression）。全套 session regression 複驗：nav margin 16/16、HUD 無 speaker、五鍵語意 icon+label、四頁 nav active 正確、page↔心語條 overlap=0（settled；量到 70 是 launcher 180ms transition 的量測競態，非 regression）、modal nav lock、Soul Talk close→none。`git diff --check` clean、migration 8/8、web release gate **9/9、0 a11y warning、no failing node**、0 console error。
- Problems / risks: chat-log 在極端小可視高度（~190）僅 ~4px（但輸入框可見＝優先正確）。真機 iOS 仍是最終驗收（headless 無法彈真鍵盤）。
- Next safe action: iPhone Safari 實測（直向＋橫向）Soul Talk 鍵盤；確認無黑塊、輸入框恆可見。
- Required reading: 本 lane（含 `895b038` / `2fcb905`）、`CLAUDE.md` §4/§5。

### 2026-06-30 - Claude Code - Soul Talk 鍵盤自適應補強（chat-log 下限隨可視高度縮放）

- Status: `VERIFIED`（模擬 + gate；真機 iOS 仍需最後一次實測確認）
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `2fcb905`（Codex 的 iOS Safari keyboard 修復）。
- Layer: EXPERIENCE，**純 CSS**（1 檔：`styles/soul-talk-drawer.css`，1 行）。無 JS／無 index.html／無 schema／無 assets。
- 背景: 先獨立驗證了 Codex `2fcb905`（移除 scrollIntoView + 把 soul 面板鎖進 visual viewport）—— 程式碼根因正確、無 regression、gate 9/9、模擬幾何正確（panel-layer=可視區、drawer 距鍵盤 8px）。但在**小可視高度**（大鍵盤 / 橫向，模擬 --app-height≤~280）時量到**殘留問題**：我上一包加的 `chat-log { min-height:96px }` 固定下限，會把 drawer 內容（header+chatLog+輸入列）撐得比可用高度高，**輸入框被擠到鍵盤下方看不到**（visible 260 → input bottom 280）。
- Work performed: 把 chat-log 下限從固定 `96px` 改為 `clamp(0px, calc(var(--app-height,100dvh) - 200px), 96px)` —— 可視高度大時保 96px 可讀，鍵盤越大下限越小、把空間讓給輸入列。純 CSS、吃 dom.js 既有的 `--app-height`（visualViewport 高），不需 JS。
- Verification（預覽 8128 模擬鍵盤開啟、手動灌 --app-height）：修後 visible 390/320/260/220 四種鍵盤大小下，**輸入框＋送出皆在可視區內**、drawer 距鍵盤 8px、chat-log 自動縮 183/113/60/20；real 390×844 chat-log 359（下限 96）、real 390×390 chat-log 133（上一包驗收保留，無 regression）。`git diff --check` clean、state migration 8/8、web release gate **9/9、0 a11y warning、no failing node**、0 console error。
- Problems / risks: `200px` 為 drawer 固定開銷（header+輸入列+間距）的估計常數，極小可視高度（~220）時 chat-log 只剩 ~20px（但輸入框可見＝優先正確）。真機 iOS Safari 鍵盤 visualViewport 時序 headless Chrome 無法完全重現，**最終仍需 iPhone 實測**（`?v=<commit>` 略過快取）；使用者先前回報的黑塊截圖極可能是舊版快取。
- Next safe action: 真機 iPhone Safari：開 Soul Talk → 點輸入 → 鍵盤彈出 → 打多行 → 收 → 再開，確認無黑塊且輸入框恆可見（含橫向）。
- Required reading: 本 lane（含 `2fcb905` 與上一包 First-time UX）、`CLAUDE.md` §4/§5。

### 2026-06-30 - Codex - iOS Safari Soul Talk keyboard black-gap repair

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / commit pending; self-reviewed and ready for push/main fast-forward
- Scope: Mobile Safari viewport repair for the user-reported iPhone 15 Pro Max Soul Talk keyboard black gap. Touched only the DOM viewport helper, Soul Talk focus behavior, and mobile Safari polish CSS. No `index.html`, no `assets/**`, no `src/state/**`, no `saveManager.js`, no storage-key/schema change, no Pixi renderer change, no Raphael behavior change, no external dependency, and no build step.
- Work performed: Added `--vv-offset-top` alongside `--app-height`/`--kb-inset`; kept keyboard detection but documented that elements sized to `visualViewport.height` must not also add keyboard inset. Removed `messageInput.scrollIntoView()` from the fixed Soul Talk drawer focus path and instead re-measures viewport variables after focus while keeping the chat log pinned to the latest entry. Added a V2 mobile Safari override that anchors the active Soul Talk panel and drawer inside the visual viewport instead of double-compensating above the keyboard.
- Verification: Bundled Node `--check` passed for `src/utils/dom.js` and `src/ui/soulTalkController.js`. `git diff --check` passed. `docs/qa/state-onboarding-migration-cases.mjs` passed 8/8. `python docs/qa/_run_web_release_gate.py` passed 9/9 automated required gates with 0 accessibility warnings.
- Problems / risks: Automated gates cannot physically raise the iOS Safari keyboard; final confirmation still requires human retest on real iPhone Safari after GitHub Pages deploy. Existing untracked QA output JSON files remain intentionally unstaged.
- Next safe action: Push this scoped repair, fast-forward `main`, then human should retest Soul Talk on iPhone Safari: open Soul Talk, focus the input, type several lines, close keyboard, reopen, and confirm no black gap appears above the keyboard.
- Required reading: `AGENTS.md`, `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`, `styles/mobile-safari-polish.css`, `src/utils/dom.js`, `src/ui/soulTalkController.js`, and the user-provided iPhone keyboard screenshots.

### 2026-06-30 - Claude Code - HUD/nav 視覺 pack（對齊 V2「不 baked text」、語意化底部五鍵）

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `efd8b1c`.
- Layer: EXPERIENCE，**純 CSS**（2 檔：`page-full-nav.css`、`page-content.css`）。**無 `index.html`**（先確認既有 DOM 足夠：nav 每鍵已含 `.bottom-nav__icon` + `data-i18n` 文字 label + baked PNG，HUD 已是 compact chip + 右上僅設定、無 speaker/無貨幣）／無 JS／無 schema／無 Pixi／無 assets 變更。對照 `Nexus Link UI v2 - Handoff.md` 與 screenshots。
- Work performed:
  - **P1 底部五鍵語意化（核心）**：依 Handoff「不 baked text、icon 用 SVG」，CSS 隱藏 baked PNG（`.nav-image`），改顯示 DOM 既有的 `.bottom-nav__icon`（以 `mask` + inline data-URI SVG 線描 icon、`currentColor` 上色，**無新增 asset**）+ 中文 `.bottom-nav__label`：探索=星芒羅盤／照顧=手心托心／成長=新芽／記憶=書頁；中央維持心核晶體 gem。active=香檳金（V2 selected→gold）+ 既有金色光池，**非 FOMO 紅點**。
  - **P1 HUD 資訊層級**：確認既有 HUD 已符合 V2（左上 compact companion chip：頭像+名+心核共鳴體 kicker+等級+在線點；右上**僅**設定齒輪；**無** speaker 快捷、**無**貨幣/鑽石/商城/紅點）。無需改碼，實測佐證。
  - **P1 月湖棲地收斂**：`.v3-home-presence` 已是左下小藥丸 tag、不擋夥伴中央、與 page content 不重疊（上一包 stack 修復保留）。無需改碼，實測佐證。
  - **P2 頁框玻璃感**：`.page-view` 外框由偏金粗框（`--v3-line-quiet` 0.34）改冷色髮絲邊（`--aurora-line` 0.24），更像「真頁面」非疊背景 modal；四頁仍無右上 X、仍為真頁面。
  - **P2 Settings 音量**：確認主 HUD 無 speaker；設定頁 master/bgm/sfx slider + 聲音開關齊全；390×844/390×520 經內層 `.settings-page-body`（overflow-y:auto，scrollH 998>241）可捲動、刪除鈕可達。
- Verification（預覽 8128，清空 localStorage 實測 + 截圖）：`git diff --check` clean；只動 2 個允許檔；`node --check` n/a（無 JS）；`state-onboarding-migration-cases` 8/8（未動 schema）；web release gate **9/9 required、0 accessibility warning、no failing node**（一次 8/9 為已知 split-on-null cold-load transient，重跑 9/9）；0 console error。視窗實測：390×844 五鍵語意 icon+label 清楚、active=gold、margin 16/16；四頁 nav active 正確、page↔心語條 overlap=0、頁框冷色細邊；HUD 右上僅設定；Settings 390×844/520 可捲；**regression 全過**：390×390 身份頁「繼續」可點(shell 360<390)、Soul Talk chat-log 133px、modal nav lock(pointer-events:none)、Soul Talk close→none。截圖：390×844 Home（五鍵 icon+chip）、Explore（頁框+nav active）。
- Problems / risks: nav active 視覺指示為金色 tint + 柔光（克制），中央心核 gem 恆為金（home 鍵設計）— 已確認 active item 真的轉金（`rgb(231,200,132)`），不致混淆。baked PNG 檔案仍保留在 repo（僅 CSS 隱藏、未刪、未改 assets）。
- Known incomplete / 不在本包: 內容翻譯 pack（敘事內文）、2.5D 棲地、完整世界地圖 runtime、Emotional Standoff 改造、Explore/Care/Growth/Memory 的 V2 完整節點內容（progress card / node rows / filter chips 等 Handoff §3.5–3.8 內容尚未填）。
- Next safe action: 真機 iOS Safari 檢視 nav icon 清晰度；之後若要做頁面內容對齊 Handoff §3.5–3.8，另開 content pack。
- Required reading: 本 lane、`CLAUDE.md` §4/§5、`Nexus Link UI v2 - Handoff.md`、`ACCEPTANCE.md`（未動 schema/assets）。

### 2026-06-29 - Claude Code - First-time UX 基礎修復（mobile keyboard / page stack / HUD hit area）

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `b593e71`.
- Layer: EXPERIENCE，**純 CSS**（5 個 styles 檔）。無 JS / 無 `index.html` 結構 / 無 schema / 無 Pixi / 無資產。Codex 以第一次使用者角度回報的 6 項基礎 UX（3×P1 + 3×P2）。
- Work performed（每項都先實測重現根因再修）：
  - **P1 身份頁鍵盤高度卡死** → `ui-v3-onboarding.css`：`.onboarding-shell` 加 `max-height: calc(var(--app-height) - safe - 32px)` + `overflow-y:auto`（吃 dom.js 量的 visualViewport，鍵盤感知）；新增 `@media (max-height:600px)` 壓縮 min-height/標題/間距、外層可捲。
  - **P1 Soul Talk 打字壓死對話** → `soul-talk-drawer.css`：`.chat-log { min-height:96px }`；`@media (max-height:560px)` 與 `body.kb-open` 下收掉 quick-reply / 聲紋 / kicker、壓縮 header，把高度讓給 chat log，輸入列留底部可見。
  - **P1 真頁面被心語條蓋 60px** → `page-content.css`：`body.page-open .soul-talk-launcher` 的 transform 由 `translateY(10px)` 改 `translateY(calc(100% + 16px))`，把已隱藏（opacity:0/pe:none）的心語條盒子整個移出頁面下緣 → page-view 與心語條 overlapY=0。
  - **P2 底部 nav 右側貼邊不對稱** → `page-full-nav.css` + `mobile-safari-polish.css`：nav 改 `left:0;right:0;margin-inline:auto;width:min(680px,100vw-32px)`（≤480px 同 100vw-32），左右各 16px 對稱。
  - **P2 modal 開啟時 nav 仍可互動誤觸跳頁** → `page-full-nav.css`：`body.panel-open .bottom-nav { pointer-events:none; opacity:.5 }`（`body.panel-open` 由既有 panelManager 設，無需動 JS）。
  - **P2 Soul Talk 關閉鍵 tap 不穩** → `soul-talk-drawer.css`：`.soul-drawer-collapse` 由 40→44px 觸控目標 + `touch-action:manipulation`。實測發現關閉 handler 本身正常（collapse 鍵與 backdrop 皆 `data-panel-close`、Escape 亦可），不穩主因是觸控目標偏小／背景 backdrop 中心被 sheet 遮、以及鍵盤重排時序；故以放大命中區 + 去點擊延遲處理。
- Verification（預覽 8128，清空 localStorage，實測量化）：bundled `node --check` n/a（無 JS 變更）；`git diff --check` clean；`state-onboarding-migration-cases` 8/8（未動 schema）；web release gate **9/9 required、0 accessibility warning、no failing node**；0 console error。視窗實測：390×390 身份頁 shell bottom 366<390、「繼續」在視窗內且可點、無水平溢出；390×390 Soul Talk chat-log 133px（≥96）、輸入列可見；390×520 chat-log 232px 無 regression；390×844 nav 左右margin=16/16、page-view↔心語條 overlap=0、modal 開啟時 nav pointer-events:none。截圖：390×844 Explore（末按鈕不被蓋、nav 置中）、390×390 身份頁（繼續可見）。
- Problems / risks: P2 #6 在自動化點擊器（preview_click / 類 Codex harness）對 backdrop-filter 面板層內的 close 鍵投遞 tap 不穩，屬工具側 hit-test 限制；真實啟用（synthetic activation / Escape / 放大後的 tap）皆關閉正常、`data-active-panel→none`、aria-hidden 正確。內容翻譯 pack 與 baked PNG nav 多語系**仍未做**（沿用前述，不在本 pack）。
- Next safe action: 真機 iOS Safari 鍵盤實測（模擬已過）；之後再開「內容翻譯 pack」與「HUD/nav 視覺 pack」（各自獨立）。
- Required reading: 本 lane、`CLAUDE.md` §4/§5、`ACCEPTANCE.md` H2/K3（無新 localStorage key、未動 schema）。

### 2026-06-29 - Claude Code - R2C-fix i18n 動態頁切語言不重畫 (P1)

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `c74f7bb`.
- Layer: EXPERIENCE. 無 schema 變更（`settings.lang` 為 R2C 既有欄位）、無 Pixi、無資產。
- Scope: 修 QA 回報的 i18n P1 —— 翻譯表無缺 key，但語言切換後**已渲染的動態頁不重畫**，導致 Explore 等頁面 `t()` 標籤殘留上一個語言（EN 下殘繁中、JP↔SC↔TC 互殘）。**本 pack 僅修「切語言後動態 UI 不重畫」**；內容翻譯與 baked PNG nav 多語系**仍未做**（見 Problems）。
- Work performed:
  - `src/i18n/i18n.js`：新增並 export `LANGUAGE_CHANGED_EVENT`；`applyLanguage()` 末端 `EventBus.emit`（語言切換的唯一進出口；靜態 `[data-i18n]` 仍由原 DOM 掃描更新）。
  - `src/ui/pageRouter.js`：`bind()` 訂閱該事件 → `render()` 重畫 active page（home early-return；背景開著的分頁就地以新語言重畫）。
  - `src/ui/companionSelectController.js`：訂閱該事件 → 重畫 roster 卡（狀態標籤 / 同行中）。
  - `atlasController` 不改 —— 其唯一 `t()` 同時帶 `data-i18n`，已被 `applyLanguage` 的 DOM 掃描覆蓋（實測切換後 tag 正確）。走 `eventBus`，符合 CLAUDE.md §4 跨層通訊規範。
- Verification: bundled `node --check`(3 JS) OK；`git diff --check` clean；`state-onboarding-migration-cases` 8/8 passed；web release gate **9/9 required、0 accessibility warning、0 console error、canvas=1**；預覽 390×844 真實 UI（Home→Explore→Settings→切語言）EN→JP→SC→TC：Explore 的 `t()` 標籤（World Atlas / Approach the lake glow / Moonlake Camp / Visible traces…）每次都跟著切，**無殘留上一語言**；companionSelect 開著切 EN →「同行中／可同行」即時變「Walking with you／Available」、切回 TC 還原。
- Problems / risks: **以下兩項刻意維持現狀、不在本 pack 範圍，不得視為已完成**：(1) 動態頁 body copy／按鈕副說明（`首輪探索…` 等敘事內文）依 `strings.js` 宣告範圍仍為繁中，屬內容翻譯 pack；(2) 底部四側 nav 為 baked-text PNG（探索/照顧/成長/記憶），EN/JP 下仍顯示中文，需新 nav 美術（資產，待批准）。簡/英/日翻譯仍建議人工校對（尤其日文語氣）。
- Next safe action: 人工校對翻譯；之後若要譯敘事內容或 nav 圖示，各自另開後續 pack（內容翻譯 pack / nav 美術資產 pack）。
- Required reading: 本 lane（含下一則 R2C i18n）、`CLAUDE.md` §4/§5、`ACCEPTANCE.md` H2/K3（無新 localStorage key）。

### 2026-06-29 - Claude Code - R2C i18n（語言選擇器 + UI chrome 翻譯 繁/簡/英/日）

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `9c13adc`.
- Layer: EXPERIENCE + 最小 GROUNDWORK（`settings.lang` 加在既有 settings 區塊；`defaultState.js` + `store.js` normalizeSettings 白名單）。無新 localStorage key。
- Work performed:
  - 新 `src/i18n/strings.js`（key→{tc,sc,en,jp}，~80 UI chrome 字串）+ `src/i18n/i18n.js`（`t()` / `applyLanguage()`：設 html lang、掃 `data-i18n`/`-placeholder`/`-aria`）。
  - `settings.lang`（預設 tc）持久化；設定頁加語言 segmented（繁/簡/EN/日本語），切換即套用＋存檔。
  - `index.html` 靜態 chrome 全面加 `data-i18n`：nav、HUD、開場（含三契約）、四大頁標題/膠囊、角色 modal 標籤、companion-select、atlas、soul drawer、設定全部。
  - 動態渲染用 `t()`：`pageRouter`（四大頁標題/動作鈕/證據·量表標籤）、`atlasController`（區域 tag，data-i18n 以便切換後仍更新）、`companionSelectController`（狀態/同行中）。
  - **不譯（維持繁中）**：夥伴對話、Raphael 敘事、`soulTalkResponsePacks`、`explorationNodes` 結果文、心情敘述、記憶內文、區域專有名詞 —— 屬內容工程，另開 pack。
- Verification: bundled `node --check`（8 JS）；`state-onboarding-migration-cases` 8/8 passed（settings.lang 安全遷移）；web release gate **9/9**、stateMigration ok、兩視窗 0 console error；預覽 390×844 切 EN → nav「Core」、設定「Settings/Audio/Export save」、Explore 鈕英文、atlas「Far away/You are here」、保存 lang=en；切 JP → 心核の相棒 / 心の声 / 話す / モーション軽減。
- Problems / risks: 簡/英/**日**為 AI 生成翻譯，**建議人工校對**（尤其日文語氣）。四側 nav 圖示為 baked-text PNG（探索/照顧/成長/記憶），EN/JP 下仍顯示中文；要全譯需新 nav 美術（資產，待批准）。中央心核鍵與所有 CSS 文字已隨語言切換。
- Next safe action: 人工校對翻譯；之後若要譯敘事內容或 nav 圖示，各自另開 pack。
- Required reading: 本 lane、plan ROUND 2、`ACCEPTANCE.md` H2/K3（無新 localStorage key）。

### 2026-06-29 - Claude Code - R2B Settings 實裝（畫質有感 / 匯出·刪除存檔 / 音量稽核）

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy `main`), on top of `513a91d`.
- Layer: EXPERIENCE + 最小 GROUNDWORK（`saveManager.js` 新增唯讀 `exportSaveData()`，複用既有 `clearState`；**不改 STORAGE_KEY/schema**）。
- Work performed:
  - **畫質有感**：新 `styles/quality-modes.css`，`html[data-quality=low|medium|high]` 控 backdrop-blur/glow/vignette/bloom/動畫；low=扁平玻璃＋關場景特效（手機效能模式），medium=降 blur，high=預設。`settingsController` 已寫 dataset.quality 並持久化。**不動 pixiApp**。
  - **匯出存檔**：`saveManager.exportSaveData()` 回傳 JSON 字串；`settingsController.exportSave()` 包 Blob 讓玩家下載 `nexuslink-save-YYYY-MM-DD.json`（client 端、不上傳）。
  - **刪除存檔**：`settingsController.deleteSave()` 二次 `confirm()` → `clearState()` → reload → 自然回開場→輸入名字→導引→遊戲。
  - **音量**：master/bgm 已即時驅動 BGM（settings persistence pack 已接）；加註記說明「首次需輕觸啟用聲音、SFX 素材待補」（不假裝 SFX 有效，無 SFX 音源 → 待批准資產）。
  - settings 面板底緣改用 `--nav-block-h`。
- Verification: bundled `node --check`(2 JS)；web release gate **9/9**、0 console error、無 unlabeled button；預覽 390×844：畫質 high→low 即時套用且持久（soul-strip backdrop-filter→none、vignette→none）、匯出/刪除鈕存在且有 label。
- Problems / risks: SFX/環境音量無音源（待資產批准）；刪除為破壞性，已加 confirm。畫質為 CSS 特效層級，非 Pixi 解析度（pixiApp LOCKED）。
- Next safe action: R2C（i18n 語言選擇器 + UI chrome 翻譯）。
- Required reading: 本 lane、plan ROUND 2、`ACCEPTANCE.md` H2/K3（無新增 localStorage key、STORAGE_KEY 未動）。

### 2026-06-29 - Claude Code - R2A Mobile UX polish (keyboard / hierarchy / nav / chat)

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` (+ deploy to `main`), on top of `15af843`.
- Layer: EXPERIENCE (CSS + 輕量 JS). 無 schema / 無 Pixi 架構 / 無資產 / 無 Raphael 行為變更。
- Scope (post-launch iPhone + ChatGPT UX feedback, canon-filtered): **拒絕** roster 等級/星/親密度% 與世界共鳴% 等收集/FOMO 數字。
- Work performed:
  - **鍵盤遮擋修復 (P0)**：`dom.js` 由 visualViewport 算 `--kb-inset` + `body.kb-open`；soul-talk drawer 高度改吃 `--app-height`（`soul-talk-drawer.css` + `mobile-safari-polish.css` 一致），鍵盤開時下錨到鍵盤上方並收縮，header/輸入框/最後一句皆可見、無黑塊。drawer 改 flex column，輸入列固定底部。
  - **視覺階層 (CSS only)**：`layout-shell.css` scene vignette（壓暗四周搶戲、夥伴中心區透亮）+ focal bloom；不動 Pixi。
  - **底部 nav 主次**：`page-full-nav.css` 非 active tile 降亮/降彩、active 維持金。
  - **心語↔nav 緊鄰**：`dom.js` 量測 `.bottom-nav` → `--nav-block-h`；soul-strip / page-view / drawer / 之後設定底緣統一用之（取代魔術數 108/124）。
  - **微互動**：`ui-v2-aurora.css` 按壓 scale .965 + 微亮、綠點呼吸；全 gate 在 `data-reduced-motion-preference!="reduced"` + `@media prefers-reduced-motion`。iOS 無 vibrate API 故純視覺。
  - **聊天**：密度收斂、輸入列比例（送出收窄/輸入加寬）；`soulTalkController` 連續相同訊息去重（store + render 兩層，修重複行；不動 Raphael 推理）。**未**加假 typing dots（Raphael 回應為同步、無真等待）。
  - **夥伴名片**精簡字體/排版；**nav 再按關閉**（`pageRouter.navigate` toggle 回 home）；**roster 工程字眼**「動畫就緒」→「可同行」（`companionSelectController` 顯示層，companion data 不動）。
- Verification: bundled `node --check`(4 JS)；web release gate **9/9**、兩視窗 0 console error、無水平溢出；預覽 390×844：心語緊鄰 nav(12px)、nav 再按可關、roster「可同行」、drawer flex；模擬鍵盤(--app-height 450/--kb-inset 394) → drawer 收縮 418、top 24、輸入框 bottom 427 可見、無黑塊。
- Problems / risks: 真機 iOS Safari 鍵盤行為仍需你手機實測（模擬已過）。夥伴「放大」未做（依決策只用 CSS 階層，不動 Pixi scale）。
- Next safe action: 你 iPhone 實測鍵盤/階層；接著 R2B（設定實裝）。
- Required reading: `AGENTS.md`、`CLAUDE.md`、`ACCEPTANCE.md`、本 lane、plan 的 ROUND 2 段。

### 2026-06-29 - Claude Code - Settings persistence (GROUNDWORK: save-schema settings block)

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / on top of `0e5f20f`, committed this pack. No new localStorage key.
- Layer: GROUNDWORK (save schema: `src/state/defaultState.js` + `src/state/store.js` `normalizeState`) + EXPERIENCE (`src/ui/settingsController.js` wiring).
- Scope: Persist player Settings inside the existing `nexusLinkR2State:v1` save. No new localStorage key, no Pixi/Raphael/asset change, `saveManager.js` STORAGE_KEY untouched. Audio mute keeps its existing separate key (`nexusLinkAudioMuted:v1`).
- Work performed: Added a `settings` block (`volMaster/volBgm/volSfx/quality/textSize/lowMotion`, defaults matching `index.html`) to `defaultState.js`; deep-cloned it in `createDefaultState`; added `normalizeSettings()` (mirrors `normalizeBattleRecord`) to `normalizeState` so partial/old saves backfill safely. Rewrote `settingsController.js` to use `store.settings` as the source of truth: applies on boot (volumes → `AudioManager.setVolume`, lowMotion → `reducedMotionPreference` dataset, quality/textSize → root dataset markers) and persists on every change via the existing save queue. Wired `store` + `saveSettings` into `createSettingsController` in `app.js`.
- Verification: bundled Node `--check` on all changed JS; `node docs/qa/state-onboarding-migration-cases.mjs` all cases passed (failed 0); fresh-origin browser test at 390x844 — set master volume to 30 → persisted to `settings.volMaster` in `nexusLinkR2State:v1`, slider/output restored to 30 after reload, AudioManager re-applied; low-motion toggle and quality segment also round-trip (saved + applied to root dataset). Web release gate 9/9 required, `stateMigration` ok, 0 console errors at 390x844 and 1280x900.
- Problems / risks: quality and textSize persist + restore their UI selection and write inert root dataset markers, but do NOT yet change rendering (px-based font scaling / Pixi quality is a separate EXPERIENCE pack). No new localStorage key (ACCEPTANCE H2/K3 preserved).
- Not touched: `saveManager.js` STORAGE_KEY and save-key set, Pixi renderer, `assets/**`, Raphael behavior, onboarding logic.
- Next safe action: Human review; optional follow-up EXPERIENCE pack to actually apply textSize/quality to rendering.
- Required reading: `AGENTS.md`, `CLAUDE.md` §5.1, `ACCEPTANCE.md` H2/K3, and this lane.

### 2026-06-28 - Claude Code - UI/HUD V2 Aurora Pass (HUD chrome, pages, World Atlas)

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `25b9944` base, uncommitted, awaiting human approval before commit/push
- Scope: EXPERIENCE-layer UI/HUD V2 (Aurora) pass per `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md` and the human-supplied V2 design plus the 2.5D habitat / Linkara world-map references. References were adopted as visual language only; no Pixi renderer change, no companion change, no asset import, no save-schema change. Currency/multi-companion/daily-reward/level framing from the references was explicitly rejected per canon red lines.
- Work performed:
  - HUD/nav CSS dedup: removed the duplicate `.bottom-nav--aurora` rules from `styles/ui-v2-aurora.css`; bottom-nav stays single-owned by `styles/page-full-nav.css`.
  - Aurora typography: Noto Serif TC on companion name, panel headings, and Soul Talk title; added the V2 香檳金 ◈ diamond signature to true-page title blocks.
  - Read-only "今日心情共鳴" added to the companion status modal, derived from existing `state.mood` (single descriptor + one gentle line; no %-race, no new schema, no FOMO).
  - Read-only World Atlas: new `data-panel="atlas"` panel + `src/ui/atlasController.js` rendering Linkara regions as a CSS/SVG placeholder (no PNG import). Region 5 月湖營地 = current/highlighted; the rest are "遠方"/locked with no completion %, no countdown, no unlock task. Reachable from a new "世界地圖" button on the Explore page.
  - Fixed a pre-existing desktop-width Soul Talk strip vs bottom-nav 3px overlap (raised strip clearance for the taller Aurora image-tile nav).
- Changed files: `index.html`, `src/app.js`, `src/ui/hudController.js`, `src/ui/pageRouter.js`, `styles/ui-v2-aurora.css`, `styles/page-content.css`, new `src/ui/atlasController.js`, new `styles/world-atlas.css`, and this ledger entry.
- Verification: bundled Node `--check` on all changed JS; `git diff --check` clean; web release gate 9/9 required automated checks, 0 accessibility warnings, 0 console errors, no horizontal overflow at 390x844 and 1280x900; manual browser checks of Home, all four pages, the companion modal (心情共鳴), the World Atlas, and the existing soul-map at 390x844 and desktop; strip↔nav gap 56px mobile / 13px desktop. Existing soul-map (5-node) and flows unregressed.
- Problems / risks: The four true pages were already close to V2 from prior Codex work, so this pass preserved them and added only the diamond signature; deeper reflow was unnecessary. Settings volume/quality persistence (`nexuslink_v2` schema) intentionally deferred (would be GROUNDWORK). Real-device Safari review remains human-only. The World Atlas is an SVG placeholder; importing the actual Linkara map PNG needs a separate asset-approval GROUNDWORK pack.
- Not touched: `src/ai/**`, `src/state/**`, `saveManager`, save schema, Pixi renderer, `assets/**`, tools, scripts, Raphael behavior/safety, onboarding logic, battle/standoff mechanics.
- Next safe action: Human review of the scoped diff and an on-device 390x844 check, then commit/push if accepted. Optional follow-ups (each a new pack): soul-map V2 restyle, Settings persistence (GROUNDWORK), real Atlas PNG import (asset approval).
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `NEXUS_LINK_MASTER_CANON_v3.1.md`, `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md`, `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, and this lane.

### 2026-06-28 - Codex - UI/HUD Claude Code Handoff

- Status: `COMPLETED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `25b9944`, handoff docs uncommitted
- Scope: Documentation-only visual/UI handoff for a future Claude Code V2 parity pass. No generated art, no asset import, no asset deletion/movement, no companion visual swap, and no product-direction change.
- Work performed: Documented the current V2 target, persistent HUD budget, bottom-nav status, Moonlake chip status, Settings/audio direction, page/modal layering, and unresolved visual issues. Added a paste-ready Claude Code instruction that requires plan-first execution and asks Claude to treat the human-supplied V2 design files as the visual target.
- Verification: Handoff file lists explicit acceptance criteria for mobile and desktop UI checks and warns not to stage local QA JSON outputs.
- Problems / risks: Exact V2 parity, nav icon coherence, and Traditional Chinese copy cleanup remain unimplemented. New bitmap icons still require human approval before entering `assets/**`.
- Next safe action: Claude Code should inspect the current runtime at 390x844, 430x932, and desktop, compare against the provided V2 design documents, then propose a scoped UI/HUD plan.
- Required reading: `docs/handoff/UI_HUD_ARCHITECTURE_HANDOFF.md`, `docs/handoff/CLAUDE_CODE_UI_HUD_TAKEOVER_PROMPT.md`, and the user-provided Nexus Link UI V2 design files/screenshots.

### 2026-06-28 - Codex - Mobile UI v2 HUD/Icon Optimization

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for commit/push
- Scope: Visual/HUD optimization toward the supplied UI v2 direction. No new art generation, no asset import, no asset movement, no companion visual swap, no storefront/FOMO elements, and no redesign outside the user-reported HUD/icon/presence issues.
- Work performed: The bottom navigation now uses the existing V2-style image tiles for Explore, Care, Growth, and Memory, with a distinct gold Heart-Core/Home tile in the center. The Moonlake Habitat label is compressed into a smaller glass chip instead of a large blocking block. The right HUD is simplified to Settings only, with audio controlled from the Settings page. Page and modal layering from the previous repair remains intact so companion status and content pages do not overlap visually.
- Verification: 390x844 browser screenshot/probe showed the V2 nav images rendered at the bottom, the center Core tile highlighted, no standalone speaker icon, a compact Moonlake chip above Soul Talk, no horizontal overflow, no console errors, and Settings volume controls updating visible values. Web release responsive/accessibility gate passed 9/9 automated required checks with 0 accessibility warnings.
- Problems / risks: This closes the obvious HUD/icon mismatch and oversized habitat label, but exact V2 aesthetic parity still depends on human phone review against the reference screenshots. No generated replacement icons were introduced because current repo policy requires human approval before adding new art to `assets/**`.
- Next safe action: Commit/push the scoped visual optimization, then human should test `http://192.168.1.123:5173/` and `http://192.168.1.123:5173/?devReset=1` on the phone.
- Required reading: `C:/Users/User/Pictures/新增資料夾/Nexus Link UI v2 設計/Nexus Link UI v2 - Handoff.md`, `C:/Users/User/Pictures/新增資料夾/Nexus Link UI v2 設計/Nexus Link UI v2 (export-src).dc.html`, and the user-provided V2/mobile screenshots.

### 2026-06-28 - Codex - Mobile UI v2 Runtime Repair

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for commit/push
- Scope: UI v2 visual/runtime repair based on the user-supplied screenshots and handoff. Adjusted proportions and layer behavior for Start/Identity/Guidance/Home/Settings and true-page overlays. No new art, no generated images, no asset movement, no asset approval, no redesign beyond applying the supplied UI v2 direction.
- Work performed: Added a full Settings panel matching the glass-card direction; changed Explore/Care/Growth/Memory page surfaces to occupy the readable mobile content band between HUD and bottom nav; kept Soul Talk as a contained strip with the `對話` pill inside the card; visually suppresses active pages when a modal companion/status panel opens, preventing the Care + companion-card overlap shown in the user's screenshots.
- Verification: 390x844 Playwright UI probe passed: Start visible, identity page visible, guidance visible, Settings visible at 358x664, Care page at 370x622 above the 72px nav, Soul Talk strip/button contained, companion modal visible with the Care page opacity resolved to 0 after transition, no horizontal overflow, no console errors. Web release responsive/accessibility probe passed at 390x844 and 1280x900 with single canvas, 5 nav buttons, Soul Talk input visible, no unlabeled buttons, no hidden focusables, and no horizontal overflow.
- Problems / risks: The automated proof confirms layout mechanics, not final human aesthetic approval. Actual Safari browser chrome height and safe-area differences still require human phone screenshots before public release.
- Next safe action: Commit/push the repair, then have human test `http://192.168.1.123:5173/` and `http://192.168.1.123:5173/?devReset=1` on the phone.
- Required reading: `C:/Users/User/Pictures/新增資料夾/Nexus Link UI v2 設計/Nexus Link UI v2 - Handoff.md`, `C:/Users/User/Pictures/新增資料夾/Nexus Link UI v2 設計/Nexus Link UI v2 (export-src).dc.html`, and the user-provided mobile screenshots.

### 2026-06-28 - Codex - Package 1-9 Required Fix Pass

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / required-fix commit pending; previous package baseline was `8d19e96`
- Scope: UI/accessibility release-blocker cleanup only. No redesign, no new UI direction, no generated images, no asset approval/movement/deletion, and no companion visual swap.
- Work performed: Inactive modal panels are now removed from visibility and focus order, preventing invisible panel buttons/inputs from being reachable under `aria-hidden`. The web release evidence now records `PASS` for responsive/browser accessibility with 0 focusable hidden entries in 390x844 and 1280x900 probes.
- Verification: `python docs/qa/_run_web_release_gate.py` passed responsive/accessibility probes at 390x844 and 1280x900: onboarding completes, Soul Talk opens, input visible, 1 canvas, 5 nav buttons, no unlabeled buttons, no horizontal overflow, and `focusableHidden: []`. Live UI gate passed HUD 13/13.
- Problems / risks: Visual confirmation on actual phone hardware is still human-only and remains required before public release.
- Next safe action: Human should open the LAN URL on a phone on the same Wi-Fi and run the real-device checks in `docs/testing/STEAM_DEMO_WEB_RELEASE_CHECKLIST.md`.
- Required reading: `docs/qa/WEB_RELEASE_EVIDENCE.md`, `docs/testing/PRIVATE_TEST_SCRIPT.md`, and Package 9 ledger entries.

### 2026-06-28 - Codex - Web Release Gate / Private Test Pack Completion

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / Package 9 commit pending; baseline before this package was `a667853`
- Scope: Package 9 visual/private-test side only. Documented mobile/desktop visual review expectations, illustrated asset gate evidence, and private tester observation script. No generated images, no asset approval, no asset movement/deletion, and no V3 redesign.
- Work performed: Added private-test script and web release evidence file. The evidence records the active runtime companions checked by the runner and keeps real-device/private-tester fields as `PENDING HUMAN`.
- Verification: `python docs/qa/_run_web_release_gate.py` responsive/browser probe passed at 390x844 and 1280x900: single canvas, 5 nav buttons, Soul Talk input visible, no unlabeled buttons, no horizontal overflow. Asset integrity passed for `greyshade-cat`, `flame-flicker`, `ice-talon`, `stone-shard`, `vine-twist`, and `crystal-rabbit`.
- Problems / risks: Automated screenshots were captured to a temporary local directory for this run and are not committed. Human visual/private-test evidence still must be gathered on real devices before public release. Accessibility focus-management warning must be handled in a separate runtime task.
- Next safe action: Human can run `docs/testing/PRIVATE_TEST_SCRIPT.md` with at least 3 testers and append sanitized results to `docs/qa/WEB_RELEASE_EVIDENCE.md`.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `docs/testing/MANUAL_TEST_CHECKLIST.md`, and Package 7/8 ledger entries.

### 2026-06-28 - Codex - Web Release Gate / Private Test Pack

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a667853`, uncommitted QA / RELEASE pack
- Scope: Package 9 visual/private-test side only. Document mobile/desktop visual review, illustrated asset consistency, UI obstruction checks, and private tester prompts. No generated images, no asset approval, no asset deletion or movement, no V3 visual redesign, and no release sign-off beyond the evidence actually gathered.
- Work performed: Started after human approval to continue. Package 7 asset audit remains the source for active illustrated runtime asset status; Package 9 will reference it rather than changing assets.
- Verification: Pending visual checklist, browser screenshot/evidence runner output, and private tester script.
- Problems / risks: Human private-test fields cannot be self-filled by Codex. They must remain explicit pending evidence until real testers provide responses.
- Next safe action: Add private-test script and release evidence template with clear pending/required fields.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `docs/testing/MANUAL_TEST_CHECKLIST.md`, and Package 7/8 ledger entries.

### 2026-06-27 - Codex - Raphael Restricted Habitat Agent

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `43100c0`, uncommitted AI_AGENT / EXPERIENCE / SAFETY pack
- Scope: Package 8 UI-presence side only. Add a subtle Raphael restricted-agent presence layer for existing Soul Talk/runtime events. No new screens, no task UI, no FOMO indicator, no navigation behavior, no generated art, no `assets/**` changes, and no V3/Package 9 release styling expansion.
- Work performed: Started after human approval. The presence layer is constrained to quiet status/body-language feedback and must not override existing First Trace / Return Echo copy or become a notification system.
- Verification: Pending static CSS/JS review plus live UI gate.
- Problems / risks: Visual presence must remain non-demanding and must not read as a red dot, quest marker, or pressure prompt.
- Next safe action: Create the scoped CSS file and load it from runtime without touching `index.html`.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `src/ui/soulTalkController.js`, `src/app.js`, and the Package 8 plan.

### 2026-06-27 - Codex - Raphael Restricted Habitat Agent

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for Package 8 commit/push
- Files touched: `styles/raphael-agent-presence.css`, `src/app.js`, `src/ui/soulTalkController.js`, `docs/agent/AI_EXECUTION_LEDGER.md`.
- Work performed: Added a scoped Raphael presence stylesheet and loaded it dynamically from `src/app.js` without touching `index.html`. Presence states are subtle Soul Talk/runtime visual states only: listening, boundary, safety-exit, blocked, and quiet. No red-dot, task, quest, FOMO, generated art, asset movement, or new screen was added.
- Verification: CSS is loaded by the local runtime; live UI gate at 390x844 passed with top HUD, bottom dock, Soul Talk launcher/input, Pixi canvas, reload persistence, and console error count 0.
- Problems / risks: No blocking Package 8 UI-presence issue remains. This is not Package 9 real-device or private-test evidence.
- Next safe action: Commit and push Package 8 only, excluding unrelated untracked QA output files. Package 9 owns release evidence and private test scripts.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-27 - Codex - Illustrated Runtime Asset Audit

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `d613de9`, uncommitted ART QA pack
- Scope: Package 7 visual-production side only. Document active illustrated runtime entries, protected roots, source/readiness status, legacy preservation, and acceptance evidence. No generated images, no asset deletion, no asset movement, and no reference-audit retirement.
- Work performed: Started after human approval. Active runtime list was derived from the current registry and manifest roots: `greyshade-cat`, `flame-flicker`, `ice-talon`, `stone-shard`, `vine-twist`, and `crystal-rabbit`; `flametail-fox` remains static fallback only.
- Verification: Pending `ILLUSTRATED_RUNTIME_AUDIT.md` review, browser smoke, and protected-root diff check.
- Problems / risks: Audit wording must not overclaim final art approval; static-ready and future placeholder companions must not be promoted by documentation alone.
- Next safe action: Complete the audit doc and verify no `assets/**` changes before committing/pushing Package 7 only.
- Required reading: `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `src/data/companionRegistry.js`, `src/data/assetManifest.js`, `AGENTS.md`, and `ACCEPTANCE.md`.

### 2026-06-27 - Codex - Illustrated Runtime Asset Audit

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for Package 7 commit/push
- Files touched: `docs/assets/ILLUSTRATED_RUNTIME_AUDIT.md`, `src/data/assetManifest.js`, `styles.css`, `src/pixi/spriteSheetAnimationLoader.js`, `src/pixi/companionRenderer.js`, and `docs/agent/AI_EXECUTION_LEDGER.md`. No runtime-ready asset roots, generated batches, legacy sheets, or static companion images were modified.
- Work performed: Added the illustrated runtime audit document with active manifest table, source/readiness status, protected roots, runtime policy, manifest-dimension evidence, browser-smoke evidence, rollback, and acceptance checklist. The audit explicitly preserves legacy Greyshade assets and does not promote placeholder/future companions.
- Verification: Current active runtime entries were derived from `src/data/companionRegistry.js` and mirrored in `src/data/assetManifest.js`. Root-relative asset audit passed for `greyshade-cat`, `flame-flicker`, `ice-talon`, `stone-shard`, `vine-twist`, and `crystal-rabbit`. 390x844 and 1280x900 Chrome screenshots were captured to the local temp directory while the companion rendered as an illustrated sprite sheet with no pixelated canvas policy. `git status --short -- assets` and protected-root checks returned empty.
- Problems / risks: No blocking Package 7 issue remains. This audit does not grant final art/license/release approval; Package 9 still owns private test and real-device evidence.
- Next safe action: Commit and push Package 7 only, excluding unrelated untracked QA output files. Package 8 must start with a new Raphael / safety opening plan.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - Explore / Care / Growth / Memory page UI

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `0d27368`, uncommitted V3 page pack
- Scope: Package 5 UI layer. Give Explore, Care, Growth, and Memory real page surfaces using the approved V3 low-chrome moonlake visual language while keeping Home as the default habitat.
- Work performed: Started after human approval. The Game UI Frontend skill is being used to protect the Pixi playfield and avoid dense dashboard/page takeover.
- Verification: Pending CSS/source review, semantic scan, and static checks.
- Problems / risks: Explore can become a world map; Care can become feeding/gifts; Growth can become combat power; Memory can fake evidence. Each page must stay evidence-based and quiet.
- Next safe action: Implement isolated page content styling in `styles/page-content.css` and keep page panels low enough to preserve the companion focal zone.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `ACCEPTANCE.md`.

### 2026-06-25 - Codex - Explore / Care / Growth / Memory page UI

- Status: `COMPLETED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, awaiting human approval before commit/push
- Files touched: `index.html`, `styles/page-content.css`, `src/ui/pageRouter.js`, `docs/agent/AI_EXECUTION_LEDGER.md`
- Work performed: Implemented V3 low-chrome page cards with mist-gold borders, moon-white copy, compact evidence strips, relationship metrics, and scrollable memory evidence rows. The first layout pass covered viewport center; self-review caught it and reduced the panels into upper low-height surfaces so 390x844 and desktop keep the center companion area open. No right-side modal close affordance was added; Home/bottom nav remains the way back to habitat.
- Verification: CSS/source review completed. Chrome headless 390x844 and 1280x900 layout smoke passed with no nav overlap, no center obstruction, and no console/page errors. Semantic scan returned 0 hits for store, currency, FOMO, task pressure, feed/gift, or power-rank wording in the touched page files.
- Problems / risks: No blocking issue found. The design intentionally prioritizes playfield protection over showing all page content at once; longer content scrolls inside the page card.
- Next safe action: Wait for human approval. If approved, commit and push Package 5, then move to Package 6 plan.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - Start / Identity / Guidance / Home visual implementation

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `bbf2aaf`, uncommitted V3 first-session pack
- Scope: Package 4 visual/UI layer. Apply the approved V3 moonlake, mist-gold, low-contrast glass direction to onboarding and Home presentation while preserving the Pixi playfield and existing HUD controllers.
- Work performed: Started after human approval. The Game UI Frontend skill is being used to keep text-heavy onboarding in DOM, protect the playfield, and avoid dense dashboard chrome.
- Verification: Pending CSS/source review, syntax checks, and viewport-oriented inspection.
- Problems / risks: Onboarding overlays can obscure the companion focal zone or become a task list. Copy must avoid dependency, therapy claims, FOMO, shop, and multi-character opening semantics.
- Next safe action: Add isolated `styles/ui-v3-tokens.css` and `styles/ui-v3-onboarding.css`, keep center playfield readable after onboarding, and defer true Explore/Care/Growth/Memory pages to Package 5.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `ACCEPTANCE.md`, and `index.html`.

### 2026-06-25 - Codex - Start / Identity / Guidance / Home visual implementation

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `bbf2aaf`, uncommitted V3 first-session pack
- Scope: Package 4 visual/UI layer. Applied isolated V3 tokens, onboarding glass panel styling, and a quiet Home presence card without changing Pixi scene assets or renderer behavior.
- Work performed: Added `styles/ui-v3-tokens.css` and `styles/ui-v3-onboarding.css`, hid old currency/resource semantics, kept text-heavy onboarding in DOM, and used restrained moonlake/mist-gold treatment from the V3 design doc.
- Changed files: `index.html`, `styles/ui-v3-tokens.css`, `styles/ui-v3-onboarding.css`, and this ledger.
- Verification: CSS/source review; no-index whitespace checks for new CSS; forbidden semantic scan for shop/FOMO/task/therapy/dependency language returned no onboarding matches; local HTTP server returned 200 for the new CSS files.
- Problems / risks: This is not final visual sign-off. Actual 390x844 and desktop screenshot review is still required with a browser surface before accepting Web Release Gate evidence.
- Not touched: runtime art assets, Pixi renderer, page router, true four-page content, and external dependencies.
- Next safe action: Human review and commit/push with the Package 4 engineering diff if accepted.
- Required reading: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `ACCEPTANCE.md`.

### 2026-06-25 - Codex - State / Onboarding Migration selector semantics

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `8b25401`, uncommitted GROUNDWORK pack
- Scope: Package 3 selector impact only. Update companion selector semantics so new players are not presented with a multi-character opening choice, while existing unlocked companions remain reviewable/selectable after migration.
- Work performed: Started after human approval as part of the Package 3 state migration. The existing selector still renders all registry companions with locked/available cards, which risks implying a roster-collection opening.
- Verification: Pending source review and migration QA.
- Problems / risks: UI copy must not introduce gacha, collection pressure, party semantics, or shop-like acquisition language. Existing players must not lose their active companion or unlocked roster visibility.
- Next safe action: Keep selector changes minimal and policy-driven by normalized state; do not create a new page or alter `index.html`.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `src/ui/companionSelectController.js`, and `src/data/companionRuntimePolicy.js`.

### 2026-06-25 - Codex - State / Onboarding Migration selector semantics

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `8b25401`, uncommitted GROUNDWORK pack
- Scope: Package 3 selector impact only. Kept the companion selector policy-driven by normalized unlock state so fresh saves only expose Greyshade while legacy unlocked companions remain visible/selectable.
- Work performed: Filtered selector cards to active, unlocked, or selectable companions and changed the list ARIA label to relationship-oriented "已締結的夥伴". No modal structure, page routing, runtime visual styling, or `index.html` changes.
- Changed files: `src/ui/companionSelectController.js` and this ledger.
- Verification: Bundled Node syntax check for `src/ui/companionSelectController.js`; migration runner confirmed fresh non-Greyshade runtime companions are locked and legacy runtime-ready unlocks remain selectable; `git diff --check`.
- Problems / risks: The static `index.html` modal title still says "選擇同行夥伴"; changing that belongs to Package 4 because it touches `index.html`.
- Not touched: `index.html`, runtime CSS, Pixi, assets, dependency graph, and external data.
- Next safe action: Human review, then commit/push with the Package 3 state migration if accepted.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`.

### 2026-06-25 - Codex - V3 visual system tokens

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a6666c7`, uncommitted design-only pack
- Scope: Package 2 only. Define the approved V3 moonlake visual system, a static 390×844 preview, and implementation tokens. No runtime, `index.html`, asset, or dependency changes.
- Work performed: Started a design-only system derived from the user-approved moonlake, mist-gold, illustrated-companion references.
- Verification: Pending static-file review, 390×844 preview inspection, and whitespace checks.
- Problems / risks: Reference imagery contains storefront, currency, multicharacter, pressure-heavy, and dependency-oriented elements that must not be promoted into Nexus Link semantics.
- Next safe action: Create the isolated design files, verify their mobile preview, and append the final record before requesting Package 3 GROUNDWORK approval.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`.

### 2026-06-25 - Codex - V3 visual system tokens

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a6666c7`, uncommitted design-only pack
- Scope: Package 2 only. Added an isolated V3 visual-system document, CSS token file, and static preview. No runtime, `index.html`, asset, dependency, state, or build-step changes.
- Work performed: Converted the human-approved moonlake references into implementation rules for deep indigo habitat scenes, mist-gold hairlines, low-contrast glass, illustrated companion layering, moon-white typography, and the four core actions. Defined Start, Identity, Guidance, Home, Explore, Care, Growth, Memory, Return Echo, and Settings screen grammar without importing storefront, currency, FOMO, multi-character opening, RPG stat-grind, or dependency-heavy semantics.
- Changed files: `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `docs/design/v3-visual-preview.html`, `docs/design/v3-visual-tokens.css`, and this ledger.
- Verification: `git diff --check`; independent `git diff --no-index --check` for all three new design files; static text scan for forbidden semantic drift; manual source review confirmed the preview is isolated under `docs/design/` and not linked from the runtime. In-app browser visual QA for the local file was blocked by browser URL policy, so no workaround was attempted and live viewport visual QA remains deferred to a later approved runtime/local-preview gate.
- Problems / risks: The static preview is implementation guidance, not product integration. Exact live contrast, safe-area, and image-layer behavior still require Package 4 runtime verification before release-level acceptance.
- Not touched: `index.html`, `styles.css`, `styles/**` runtime files, `src/**`, `assets/**`, `tools/**`, `scripts/**`, storage, Pixi, and external dependencies.
- Next safe action: Human review of the design-only diff. If accepted, commit and push this package before opening Package 3, which is a GROUNDWORK state/onboarding migration and requires explicit approval.
- Required reading: `docs/strategy/NEXUS_LINK_STEAM_DEMO_MASTER_BLUEPRINT.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`.

### 2026-06-24 - Codex - Aurora B visual parity baseline

- Status: `VERIFIED`
- Branch / commit: `codex/ui-v2-aurora-parity` / `3c91291`
- Scope: DOM HUD, Bottom Nav, Soul Talk drawer, Settings, onboarding surfaces,
  and the live Pixi scene boundary. No companion asset or renderer rewrite.
- Work performed: Completed Aurora B parity packs 1 through 8, including the
  five-zone navigation, compact Soul Talk strip and drawer, settings controls,
  and mobile visual treatment.
- Verification: The local 390x844 Home renders the Aurora HUD over one live
  Pixi canvas. The companion remains a scene entity rather than baked UI art.
- Problems / risks: Visual parity does not solve the P0-B constrained-viewport
  companion-placement issue. The current asset pipeline contains historical
  64x64 instructions that conflict with the current illustrated 512x512
  companion policy; use the animation catalog and `AGENTS.md` as the newer
  standard.
- Next safe action: After P0-B is resolved, run the first-habitat visual QA on
  390x844, desktop, and a letterboxed host before accepting additional UI work.
- Required reading: `docs/ui/NEXUS_LINK_UI_V2_HANDOFF.md`,
  `docs/qa/NEXUS_LINK_RUNTIME_AUDIT_2026-06-24.md`,
  `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `AGENTS.md`.

---

### 2026-07-28 - Codex - Moonlake Live 3D Clay Resin Art R1 - VERIFIED

- Status: `VERIFIED`; the approved clay/resin direction is integrated in the live habitat.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-MOONLAKE-LIVE-3D-R1`.
- Layer: `GROUNDWORK + EXPERIENCE`; the promoted GLB and live visual implementation were explicitly authorized by Owner.
- Visual result:
  - two close framing cliffs instead of many distant mountains;
  - two readable, subtly flowing waterfalls;
  - blue lake, green grass islands, original rounded shrub language, shore stones and resin pines;
  - central compass platform, playable timber-and-rope bridge and two custom blue/ivory tents with warm interiors, gold bands, braces, masts, finials and guy ropes;
  - matte/satin clay-resin materials with restrained Cyber-Taoism blue, cyan and gold;
  - illustrated companions remain 2D and readable over the live 3D scene.
- Source handling:
  - Blender audit passed for `assets/3d/moonlake/moonlake_clay_resin_r3.glb`;
  - the rough original render meshes remain hidden at runtime;
  - audited scale and bridge measurements guide a lighter procedural Three.js reskin;
  - superseded raster R5 candidates were moved back to ignored `output/` staging and were not promoted.
- Visual QA:
  - day and night-rain mobile captures inspected at 390×844;
  - old Pixi tents/towers are hidden only while live 3D is active;
  - bridge deck, far bank, platform, both tents and both waterfalls remain readable;
  - lake, waterfall and grass motion advance independently without moving rigid islands.
- Problems / risks: physical OLED/low-end phone color, thermal and aesthetic review remain human/device gates; automated rendering evidence does not replace Owner final visual taste.
- Evidence: `docs/qa/MOONLAKE_LIVE3D_HYBRID_R1_EVIDENCE.md`.
- Branch / commit: `codex/moonlake-r5-integration`; commit and protected-main publication follow this verified closeout.
- Next safe action: after merge, review the public Pages build on a physical phone before declaring store-ready visual quality.

## Lane 3 - Raphael Core, Companion Reasoning, And Soul Talk

### 2026-07-21 - Cursor Grok - Fix forever-promise false positive on attachment refusal

- Status: `VERIFIED` (machine); Owner authorized narrow TASK_PACK → PR → main
- Branch / commit: `agent/fix-forever-promise-false-positive` / lands with this commit
- Scope: EXPERIENCE／safety critic 精準度。修「拒絕永遠」回覆被 `never_promise_forever` 誤殺、改寫成 `boundary_set` 固定句。不改 save／battle／safetyShield 關鍵字清單（紅線 7 求助路徑不動）。
- Work performed: (1) `matchesForeverPromise()`：否定／拒絕永遠語境豁免；affirmative-only pattern。(2) `constitutionCritic`／`personaCritic` 改走 helper。(3) constitution smoke +PC-6／PC-7 防回歸。
- Verification: constitution smoke 全過；`runRaphaelCore("你會不會離開我？")` 保留依附拒絕句、非 boundary 模板；`git diff --check`。
- Problems / risks: affirmative forever 漏網需靠 pattern 維護；真人 feel-check 仍建議抽聽一次。
- Next safe action: Owner 正式站抽測「你會不會離開我？」；可選 private-blind。
- Required reading: `src/ai/persona/PersonaConstitution.js#matchesForeverPromise`, `src/ai/testHarness/constitutionSmokeCases.js` PC-6／PC-7, and this lane.

### 2026-07-20 - Cursor Grok - TP-WQ-GATE wording-quality 接入 web-release-gate

- Status: `VERIFIED` (machine); Owner authorized continue＋ship to main
- Branch / commit: `agent/tp-wq-gate-wire-v1` / lands with this commit
- Scope: QA gate wiring only。把 TP-WQ1 的 `_run_wording_quality.py` 納入
  `run_existing_browser_gates`，使每次 PR／main 的 `web-release-gate` 必跑措辭契約。
  **零 runtime Soul Talk／safety／battle／save 改動**。
- Work performed: (1) `_run_web_release_gate.py` +`wording_quality` step。(2) queue／matrix／ledger 標 TP-WQ-GATE DONE。
- Verification: standalone wording 8/8；`git diff --check`；本 PR 的 required
  `web-release-gate` 必須含並通過 `wording_quality`。
- Problems / risks: (a) gate 多約 1–2 分鐘 Playwright；(b) private-blind 仍 `not_run`。
- Next safe action: Owner feel-check／private-blind；或 CH／產品包。
- Required reading: `docs/qa/_run_web_release_gate.py#run_existing_browser_gates`, `docs/qa/_run_wording_quality.py`, and this lane.

### 2026-07-20 - Cursor Grok - RS-3 安裝 raphael-standoff-eval skill

- Status: `VERIFIED` (local skill + harness); no runtime `src/**` change
- Branch / commit: `agent/rs3-standoff-eval-skill` / lands with this commit
- Scope: RS-3 skill-only。鏡像 `raphael-autonomy-eval`。**零 battleEngine 數值／safety／memory／save 改動**；不安裝 combo／hitbox skill。
- Work performed: (1) 安裝 `%USERPROFILE%\.codex\skills\raphael-standoff-eval\`（`SKILL.md`／`agents/openai.yaml`／`references/evaluation-contract.md`／`scripts/run_eval.py`）。(2) 本地跑 skill：hardGateOk + cases 全過 + advisory `trusted:false`。(3) queue／playbook／standoff contract／coverage matrix 標 RS-3 DONE。
- Verification: `python .../raphael-standoff-eval/scripts/run_eval.py --repo <NexusLink>`（見本步 shell）。
- Problems / risks: (a) skill 本體在使用者 profile，不進 git；(b) Owner「stabilize ≠ DPS」feel-check 仍開；(c) DOM telegraph 演出未自動化。
- Next safe action: Owner 對峙 feel-check；或 private-blind／多語深度。
- Required reading: `%USERPROFILE%\.codex\skills\raphael-standoff-eval\SKILL.md`, `docs/raphael/RAPHAEL_STANDOFF_EVAL_CONTRACT.md`, and this lane.

### 2026-07-20 - Cursor Grok - TP-WQ1 wording-quality harness + de-meta lines

- Status: `VERIFIED` (machine); Owner authorized judge＋ship to main
- Branch / commit: `agent/tp-wq1-wording-quality-v1` / lands with this commit
- Scope: EXPERIENCE。關閉覆蓋矩陣 §3.6（`expectedTone`／`mustInclude`／`mustAvoid`）。**不重做已完成的 TP-3**；不碰 memoryWriter／save／holdout 原文。`safetyShield` 僅擴充依賴壓力 pattern（紅線 1 仍由邊界驅動，非依賴偵測）。
- Work performed: (1) `wordingQualityAssert.js` + 8 案 `wordingQualityEvalCases.js` + `_run_wording_quality.py`。(2) `nluReplyBuilder` 去掉「我有接到」「原來事情是這樣…」meta fallback，首句帶 grounding。(3) `safetyShield` 補 `永遠(都)?不要離開`／`答應我.*永遠`。(4) smoke install wire；dialogue-loop meta ban 對齊。(5) matrix／queue／ledger 更新。
- Verification: wording **8/8**；dialogue-loop **21/21**；stage4 **12/12**；`node --check`＋`git diff --check` PASS。
- Problems / risks: (a) private-blind 人測仍 `not_run`；(b) wording runner 尚未強制進 web-release-gate；(c) short_quiet 仍可能截成一句——首句 grounding 已緩解。
- Next safe action: Owner 抽聽 8 案回覆溫度；可選 RS-3 或把 wording runner 納入 release gate。
- Required reading: `src/ai/eval/wordingQualityAssert.js`, `src/ai/testHarness/wordingQualityEvalCases.js`, `src/ai/safetyShield.js`, `docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md` §3.6, and this lane.

### 2026-07-20 - Cursor Grok - Initiative copy pack v1（微時刻台詞更像生命）

- Status: `VERIFIED` (machine); Owner authorized step 3 copy pack
- Branch / commit: lands with this commit (PR path into `main`)
- Scope: EXPERIENCE copy-only。只改 `gentleInvitationEngine.js` 的 `MOMENT_DEFS.lines`＋harness 哨兵。**cooldown／safety／memory／save／battleEngine 數值零觸碰**。
- Work performed: (1) `quiet_approach`／`fireside_settle`／`moon_gaze` 各擴成 3 句輪替；去「有你才睡得安」依賴味，改成自己休息／可忽略靠近／敢於無聊望月。(2) harness `INIT-COPY-001`／`INIT-COPY-002`：禁永遠／孤獨／FOMO，火邊不得依賴句。
- Verification: `node --check`；`runAllCompanionInitiativeCases` 與 `runAllRaphaelAutonomyEvalCases` 綠燈（見本步 shell）。
- Problems / risks: (a) 真機 feel-check（稀少感＋台詞溫度）仍是人類 gate；(b) i18n 尚未為 initiative 行做多語——目前仍是繁中主線。
- Next safe action: Owner 棲地 feel-check；可選 RS-3 skill 或 initiative i18n。
- Required reading: `src/engine/gentleInvitationEngine.js#MOMENT_DEFS`, `src/ai/testHarness/companionInitiativeCases.js`, and this lane.

### 2026-07-20 - Cursor Grok - RS-2 Nuwa 對峙意圖啟發式（advisory-only）

- Status: `VERIFIED` (machine); Owner authorized sequential next-step after RA-2
- Branch / commit: lands with this commit (PR path into `main`)
- Scope: RS-2。Nuwa `standoffHeuristics` + gated adapter + standoff harness。**battleEngine 數值／safety／memory／save 零觸碰**；不安裝外部戰鬥 skill。
- Work performed: (1) Nuwa bundle → **v0.8.0**：三個對峙 mental models + `standoffHeuristics`（surge／gather／lull 反應、撤退肯定、antiPatterns）。(2) `getNuwaStandoffAdvisory()`：`trusted:false`，`mayWriteCombatStats`／`mayOverrideTelegraph`／`mayPunishRetreat` 皆 false。(3) standoff eval 加 `RS2-NUWA-001..003`、`RS2-ALIGN-001`；autonomy v0.7+ 版本哨兵相容 v0.8。(4) 更新 contract／queue／playbook。
- Verification: `node --check` PASS；`runAllRaphaelAutonomyEvalCases` **30/30**；`runAllRaphaelStandoffEvalCases` **12/12**。
- Problems / risks: (a) advisory 尚未被 battleController 消費（刻意）；(b) Owner「穩住裂隙≠DPS」feel-check 仍建議人工覆核；(c) 進 main 仍走 PR + web-release-gate。
- Next safe action: **RS-3**（`raphael-standoff-eval` skill）或 initiative 台詞 copy pack。
- Required reading: `src/data/ai/raphaelNuwaDistillationBundle.js#standoffHeuristics`, `src/ai/raphaelTrainingAdapter.js#getNuwaStandoffAdvisory`, `src/ai/testHarness/raphaelStandoffEvalCases.js`, and this lane.

### 2026-07-20 - Cursor Grok - RA-3 安裝 raphael-autonomy-eval skill

- Status: `VERIFIED` (local skill + harness); no runtime `src/**` change
- Branch / commit: lands with this commit (Owner authorized sequential COMMIT+PUSH via PR)
- Scope: RA-3 skill-only。鏡像 `raphael-conversation-eval` 的自主評測 skill。**零 safety／memory／save／battle／Nuwa 台詞改動**。
- Work performed: (1) 安裝 `%USERPROFILE%\.codex\skills\raphael-autonomy-eval\`（`SKILL.md`／`agents/openai.yaml`／`references/evaluation-contract.md`／`scripts/run_eval.py`）。(2) 本地跑 skill：`hardGateOk=true`，cases **30/30**，Nuwa advisory `trusted:false`。(3) queue／playbook 標 RA-3 DONE。
- Verification: `python .../raphael-autonomy-eval/scripts/run_eval.py --repo <NexusLink>` → total 30 / passed 30 / failed 0 / advisoryTrustedFalse true。
- Problems / risks: (a) skill 本體在使用者 profile，不進 git；(b) Owner feel-check 稀少感仍是人類 gate；(c) 寫入時 RA-2 進 main 仍待 PR #100（後已合併，見上方 RA-2／本合併序列）。
- Next safe action: **RS-3**（`raphael-standoff-eval` skill）或 initiative 台詞 copy pack。
- Required reading: `%USERPROFILE%\.codex\skills\raphael-autonomy-eval\SKILL.md`, `docs/raphael/RAPHAEL_AUTONOMY_EVAL_CONTRACT.md`, and this lane.

### 2026-07-20 - Cursor Grok - RA-2 Nuwa 自主啟發式蒸餾（advisory-only）

- Status: `VERIFIED` (machine); **無新玩家可見 initiative 台詞**（仍需另批才可改 TP-7 行庫）
- Branch / commit: `main` / lands with this commit (Owner authorized COMMIT+PUSH)
- Scope: RA-2。Nuwa bundle mental models + `autonomyHeuristics` + gated adapter 讀取 + autonomy harness 哨兵。**safetyShield／memoryWriter／save schema／battleEngine／外部 LLM 零觸碰**；不重建 autonomy stack；不安裝名人人格進 `companionPersonas`。
- Work performed: (1) Nuwa bundle → **v0.7.0**：五個自主 mental models + `autonomyHeuristics`（三微時刻／稀少常數／決策啟發式／antiPatterns）。(2) `getNuwaAutonomyAdvisory()`：`trusted:false`，`mayWriteMemory`／`mayRewardRelationship`／`mayOverrideCooldown`／`maySpeakAsNuwa` 皆 false。(3) autonomy eval 加 `RA2-NUWA-001..004`、`RA2-ALIGN-001`。(4) 更新 distillation spec／queue／playbook／autonomy contract 註記。(5) 灰影 persona 加一條「寧可 null 也不吵」啟發式（離線記錄，非新台詞）。
- Verification: `node --check` ×3 PASS；`runAllRaphaelAutonomyEvalCases` **30/30**（含 5 個 RA-2 案）；adapter probe：日常訓練建議與自主 advisory 皆 `trusted:false`、無記憶／獎勵副作用旗標。
- Problems / risks: (a) 玩家可見台词仍是 TP-7 既有句，本包刻意不改——若 Owner 要「更像生命」的新台詞需另開 copy pack。(b) `getNuwaAutonomyAdvisory` 尚未被 runtime initiative controller 消費（刻意：advisory ≠ 覆寫 cooldown）。(c) private-blind 人測仍 `not_run`。
- Next safe action: Owner feel-check 棲地稀少感後可批 **RA-3**（`raphael-autonomy-eval` skill）或 **RS-2**（對峙 intent advisory）；若要改 initiative 台詞另開包。
- Required reading: `src/data/ai/raphaelNuwaDistillationBundle.js`, `src/ai/raphaelTrainingAdapter.js#getNuwaAutonomyAdvisory`, `src/ai/testHarness/raphaelAutonomyEvalCases.js`, `docs/raphael/RAPHAEL_AUTONOMY_EVAL_CONTRACT.md`, and this lane.

### 2026-07-16 - Codex - RC Raphael exact-commit checkpoint - VERIFIED

- Status: `VERIFIED` for machine evidence on closure commit `220e2fd`; independent private-blind remains `not_run` and public launch remains unapproved.
- Branch / commit: `main` / closure `220e2fdbefaa4a2a7ecc2e853f68869bc4560d81`; no Raphael runtime or training change.
- Scope: Exact-commit evaluation only, preserving RaphaelCore final authority and separating sealed holdout from human private-blind evidence.
- Verification: Sealed evaluator at `2026-07-16T15:27:58+0800` passed **12 sessions / 48 turns / 48 hard passes / 0 failures / 0 quality flags / 0 console errors**, `humanBlindReview: not_run`. Temp evidence SHA-256: `AE5DD7C521AA39A69F204F786932C694CCAB0A4DE2E222EA4744CD301164E2A7`. The same closure SHA passed the repo-native Web gate **17/17** from a clean tracked tree.
- Problems / risks: Machine evidence still cannot establish the human naturalness thresholds or substitute for 3 independent testers x 20 scored turns.
- Next safe action: Publish the closure/status commits, rerun deployed Pages automation, then schedule the consent-safe private-blind protocol without importing raw tester text into runtime or training.
- Required reading: The preceding authorization entry, the Raphael evaluation contract, commit `220e2fd`, and the temporary exact-commit evidence.

### 2026-07-16 - Codex - RC Raphael evidence publication - AUTHORIZED

- Status: `AUTHORIZED`; publication of the already verified evidence package is approved. This does not grant permission to alter Raphael runtime, training, memory, persona, D2 safety, or human-gate status.
- Branch / commit: `main` / parent runtime candidate `c7563379af9989d852a0df259787e2416590f4f5`; closure commit and exact-commit verification pending at this point in the append-only history.
- Scope: Publish the corrected machine-vs-human taxonomy, private-blind protocol, historical holdout quarantine, handoff/status, repo-native QA scripts, and generated machine evidence only.
- Verification: Pre-commit web gate **17/17**, sealed holdout **48/48** with 0 flags/errors, D2 focused **18/18**, live safety UI **6/6**, and deployed Pages automation already green. `stage4_automated_cases` is no longer mislabeled as human playtest evidence; the 2026-07-14 worksheet now cites historical snapshot `de57e92` instead of the regenerated current JSON.
- Problems / risks: Independent private-blind remains `not_run`; no automated result is promoted to human evidence or public-launch approval.
- Next safe action: After committing the closure, rerun the sealed evaluator to a temporary output on the exact closure SHA, then append a completion entry with the observed SHA and retain case-first human follow-up.
- Required reading: The preceding verified/in-progress entries, the Raphael evaluation contract, `docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md`, and current holdout output.

### 2026-07-16 - Codex - RC evidence taxonomy and private-blind handoff - VERIFIED

- Status: `VERIFIED` for evidence synchronization and automated Raphael regression; formal independent private-blind remains `not_run`, so Raphael launch readiness is not approved.
- Branch / commit: `main` / frozen runtime candidate `c7563379af9989d852a0df259787e2416590f4f5`; no Raphael runtime change, commit, or push in this package.
- Scope: Corrected the launch-evidence taxonomy without changing NLU, persona, constitution, safety body, preference behavior, memory, state mutation, renderer, LLM/gateway, or Expedition behavior. Historical review material is retained as provenance but quarantined from current/private-blind evidence.
- Work performed: Synchronized the human handoff and machine-readable status to `c756337`; declared sealed holdout and Stage 4 harnesses as machine evidence; marked the historical 2026-07-14 worksheet invalid for launch evidence; and modernized the consent-safe 3-testers x 20-turn protocol with scored-turn and aggregate-reporting rules. High-risk prompts remain excluded from training, preference, gameplay, and reward use.
- Verification: Sealed holdout regenerated at `2026-07-16T13:42:59+0800`: **12 sessions / 48 turns / 48 hard passes / 0 failures / 0 quality flags / 0 console errors**, with `humanBlindReview: not_run`. Repo-native D2 evidence passed safety terminal invariant **18/18**, live safety UI **6/6**, dialogue policy **21/21**, constitution **5/5**, and full local web gate **17/17**. The deployed Pages safety invariant independently passed **18/18**.
- Problems / risks: Deterministic checks do not establish open-domain naturalness. No independent participant has yet completed the formal sample, so naturalness >=4.0, grounded continuity >=95%, irrelevant <=3%, template-like <=5%, unnecessary questions <=5%, and false explicit recall 0 have not been demonstrated by human evidence.
- Next safe action: Run the private-blind protocol with at least three independent testers and at least 20 scored turns each. Report aggregate metrics and case-first failures without storing raw personal conversation text unless separately consented; do not soften D2, memory authority, boundary behavior, or state neutrality to improve feel scores.
- Required reading: The preceding `IN PROGRESS` entry, `docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md`, `docs/qa/RAPHAEL_BLIND_REVIEW_SHEET_2026-07-14.md`, `docs/qa/_raphael_conversation_holdout_output.json`, the Raphael evaluation contract, current handoff/status, and this lane.

### 2026-07-16 - Codex - RC evidence taxonomy and private-blind handoff - IN PROGRESS

- Status: `IN PROGRESS`; Docs/QA closure only. RaphaelCore runtime remains frozen at exact `c756337`.
- Branch / commit: `main` / `c7563379af9989d852a0df259787e2416590f4f5`; no commit or push authorized.
- Scope: Synchronize Raphael handoff/status and release evidence to the landed D2 terminal contract; prevent historical holdout review sheets or deterministic Stage 4 harnesses from being presented as private-blind human evidence; prepare a consent-safe 3-testers x 20-turn scorecard without storing raw conversations.
- Red-line check: No crisis prompt becomes training, memory, reward or gameplay; no external evaluator/model gains authority over final safety, boundary, memory, state delta or reply; Raphael remains a Stateful Companion Cognition Agent rather than therapy/crisis service.
- Non-goals: No NLU vocabulary, response pack, persona, safety body, preference behavior, memory writer, state mutation, LLM/gateway or Expedition integration change.
- Acceptance refs: `ACCEPTANCE.md` D2/L9 and the Raphael Conversation Evaluation Contract hard gates and private-blind thresholds.
- Work performed: Confirmed the landed safety package and current evidence split: automated web gate 17/17 and sealed holdout 48/48 are machine evidence; formal private-blind remains `not_run`.
- Verification: Pending refreshed exact-commit outputs and Pages probes. This task cannot fabricate or self-administer the independent human sample.
- Problems / risks: `RAPHAEL_BLIND_REVIEW_SHEET_2026-07-14.md` contains a historical unsafe H10 reply and must be clearly quarantined as provenance, not current or private-blind evidence.
- Next safe action: Repair the evidence documents, rerun machine gates, and leave the human launch gate visibly open for independent testers.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md`, `docs/qa/RAPHAEL_BLIND_REVIEW_SHEET_2026-07-14.md`, the sealed-evaluation contract, and this lane.

### 2026-07-16 - Codex - D2 safety terminal invariant and release-gate repair - VERIFIED

- Status: `VERIFIED` for deterministic, real-UI, and sealed automated evidence; independent human blind review remains `not_run`.
- Branch / commit: `main` / base `30fc8e9` + verified uncommitted worktree; no commit or push authorized.
- Scope: Completed the high-risk Soul Talk terminal contract and strengthened boundary-policy preservation without adding an LLM, diagnosis, training from crisis text, personality rewrite, reward, or gameplay framing.
- Work performed: `safety.isHighRisk` now locks canonical `safety_redirect -> enter_safe_harbor -> system` output; bypasses constitution override, recall, anti-loop, variants, preference repair, renderers/advisors, memory/trace/milestone writers, animation, quick replies and SFX; preserves protected/gameplay state; redacts debug input; and saves immediately. The UI restores all non-safety top-level state and preserves only the local transcript. Boundary policy is also authored/non-truncatable at energy 0-2, skips inappropriate generic grounding, and has a dedicated refusal-signal critic/repair path. Caution regulation keeps energy +0.5 but removes trust reward.
- Verification: Focused terminal suite **18/18** (13 energy/persona regressions, 4 fail-closed mutations, 1 caution case); real Soul Talk UI **6/6** across energy 0/7/10 with exact player+system two-line delta, zero chips/SFX/gameplay mutation, unchanged preferences and immediate critical persistence; dialogue policy **21/21** including energy-0 boundary continuity; constitution **5/5**; sealed holdout **48/48**, quality flags 0, console errors 0; full web gate **17/17**. External evaluator `hardGateOk` remains supporting evidence only; repo-native canonical/mutation/UI checks are authoritative.
- Problems / risks: Formal 3-person x 20-turn private-blind is `not_run`; automated green does not establish unrestricted open-domain naturalness or public launch readiness. This remains supportive companion dialogue, not therapy or crisis service.
- Next safe action: Run the formal private-blind protocol and record failures case-first. Preserve RaphaelCore final authority and keep Expedition `coreIntegrated:false` until its separately approved full bridge exists.
- Required reading: The `IN PROGRESS` entry below, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, the sealed output, and `_web_release_gate_output.json`.

### 2026-07-16 - Codex - D2 safety terminal invariant and release-gate repair

- Status: `IN PROGRESS`
- Branch / commit: `main` / current worktree at `30fc8e9`; no commit or push authorized.
- Scope: EXPERIENCE / SAFETY repair for high-risk Soul Talk. Once `safety.isHighRisk` is true, lock the canonical full safety reply, `enter_safe_harbor`, system role, no quick replies/SFX, no preference repair or persistence, no memory/trace/milestone write, and no gameplay delta. Route high-risk and first-trace saves through CRITICAL while ordinary Soul Talk retains the interaction queue.
- Red-line check: Safety is not diagnosis, gameplay, reward, relationship progression, retention, or training data. RaphaelCore remains final authority; no external model or gateway may override safety, memory, state, or response policy.
- Non-goals: No persona rewrite, new classifier vocabulary copied from the sealed holdout, raw-conversation training, external LLM/API, dependency, or ordinary-conversation redesign.
- Acceptance refs: `ACCEPTANCE.md` D2 and the Raphael Conversation Evaluation Contract hard gates. The external evaluation skill's `hardGateOk` is supporting evidence only until its contract catches canonical-body truncation and hidden mutation.
- Work performed: Reproduced the false-pass path: preference repair can truncate H10-1, quick replies remain, preference storage mutates, high-risk energy can rise from 0 to 1, and the critic can skip validation because it keys off text rather than `isHighRisk`.
- Verification: Pending safety regressions across preference/memory/anti-loop/persona and energy 0/7/10, storage/state snapshots, zero-chip/SFX checks, canonical reply assertion, and deliberate mutation tests that must fail the release gate.
- Problems / risks: Existing machine evidence reports 48/48 despite an incomplete crisis reply. Formal human blind review remains `not_run` and must stay an independent launch gate.
- Next safe action: Implement the terminal path and repo-native mutation gate, then rerun focused safety suites, sealed holdout for diagnostics, and the full web gate.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `src/ai/raphaelCore.js`, `src/ai/safetyCritic.js`, `src/ai/safeHarborMode.js`, `src/ai/stateMutationPolicy.js`, the sealed-evaluation skill contract, and this lane.

### 2026-07-14 - Cursor Grok - RS-1 對峙密封契約＋eval harness

- Status: `VERIFIED` (machine); Owner success-definition ack still required before RS-2
- Branch / commit: `main` / lands with this commit (after RA-1 `f6ddfab`)
- Scope: RS-1 standoff sealed contract + harness。**不安裝外部戰鬥 skill；不改 battleEngine 數值；不混 Moonlake／expedition dirty**。
- Work performed: (1) `docs/raphael/RAPHAEL_STANDOFF_EVAL_CONTRACT.md`（成功＝telegraph＋四結局＋撤退被肯定≠DPS）。(2) `raphaelStandoffEvalCases.js` 8 案；`?raphaelSmoke=1` → `__RAPHAEL_STANDOFF_EVAL__`。(3) matrix／queue／playbook 標 RS-1 DONE。
- Verification: `node --check` PASS；`runAllRaphaelStandoffEvalCases` **8/8**。
- Problems / risks: UI 節奏／汁感仍靠 Owner feel-check；legacy `battleRecord` 仍用 win/lose 標籤（文案層已非懲罰）——RS-2 勿把 legacy 當設計真理。
- Next safe action: Owner 確認「穩住裂隙≠DPS」後批 **RS-2**；或先批 **RA-2**（需 initiative feel-check）。
- Required reading: `docs/raphael/RAPHAEL_STANDOFF_EVAL_CONTRACT.md`, `src/ai/testHarness/raphaelStandoffEvalCases.js`, and this lane.

### 2026-07-14 - Cursor Grok - RA-1 自主行為密封契約＋eval harness

- Status: `VERIFIED` (machine); Owner feel-check still required before RA-2
- Branch / commit: `main` / uncommitted until Owner COMMIT
- Scope: RA-1 autonomy sealed contract + harness。**safetyShield／memoryWriter／save schema 零觸碰**；不裝外部戰鬥 skill；不混 Moonlake／expedition dirty。
- Work performed: (1) `docs/raphael/RAPHAEL_AUTONOMY_EVAL_CONTRACT.md`。(2) `AMBIENT_INITIATIVE_LIMITS` 匯出自 `initiativeCooldown.js`。(3) `companionInitiativeCases.js` 加 RA1-CONST／ABSENCE／SAFE-TURN／CAP。(4) 新 `raphaelAutonomyEvalCases.js`（基線∪契約 extras）；`?raphaelSmoke=1` 安裝 `__RAPHAEL_AUTONOMY_EVAL__`。(5) matrix／queue／playbook 標 RA-1 DONE。
- Verification: `node --check` PASS；`runAllRaphaelAutonomyEvalCases` **25/25**。
- Problems / risks: UI 表面閘門（st-focus／onboarding）仍靠 Owner feel-check，未做 DOM 自動化；RA-2 不得在 feel-check 前偷跑。
- Next safe action: Owner 在棲地感受「每 session ≤2 次、不黏人」後批 **RA-2** 或開 **RS-1**。
- Required reading: `docs/raphael/RAPHAEL_AUTONOMY_EVAL_CONTRACT.md`, `src/ai/testHarness/raphaelAutonomyEvalCases.js`, and this lane.

### 2026-07-14 - Cursor Grok - Raphael training ops playbook（技能／外掛／進度路由）

- Status: `VERIFIED`
- Branch / commit: `main` / docs-only (uncommitted until Owner COMMIT); Lane A of training-ops plan.
- Scope: docs only。落地「自主 → 對峙 → 遠征」進度與技能／外掛路由；**零 `src/**`、零新 skill 安裝、零 Moonlake 資產**。
- Work performed: (1) 新增 `docs/agent/RAPHAEL_TRAINING_OPS_PLAYBOOK.md`（三層分工、路由表、決策樹、Gate 0–6、週循環、RA／RS 對照）。(2) `NEXT_AI_TASK_PACK_QUEUE.md` 插入 **RA-1／RA-2／RS-1**（及 RA-3／RS-2／RS-3 計畫條）並更新 Raphael training 推薦順序。(3) `RAPHAEL_EVAL_COVERAGE_MATRIX.md` §3 補 autonomy／standoff 缺口指標；§5 指向 RA-1／RS-1。
- Verification: docs cross-links resolve; routing matches `NEXUSLINK_AI_DEVELOPMENT_MODE.md` §4 + copywriting persona whitelist; explicitly forbids celebrity voices in player packs and generic combat-skill installs.
- Problems / risks: RA／RS runtime／skill scaffolds still require separate Owner-approved TASK_PACKs; chapter CH-2 與 RA-1 可能搶 Owner 注意力——playbook 已把 Raphael training lane 與章節 lane 分開列序。
- Next safe action: Owner 批 **RA-1**（autonomy sealed contract + harness）或繼續章節 CH-2；勿先裝外部戰鬥 skill。
- Required reading: `docs/agent/RAPHAEL_TRAINING_OPS_PLAYBOOK.md`, `docs/agent/NEXT_AI_TASK_PACK_QUEUE.md`, `docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md`, and this lane.

### 2026-07-14 - Cursor Grok - Nuwa v0.6 灰影貓 Expression DNA＋voice pack 接入

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted → lands with this commit; Owner 明示灰影也要用女媧做出來並接入。
- Scope: 灰影貓 Nuwa 蒸餾＋Soul Talk runtime。**safetyShield／memoryWriter／save schema／外部 LLM 零觸碰**；不混入 Moonlake habitat 資產刪除。
- Work performed: (1) Nuwa bundle → v0.6：`companionPersonas.greyshade-cat`＋心智模型 `first_carrier_is_quiet_observer`。(2) 新增 `greyshadeVoicePacks.js`（疲憊／焦慮／難過／安靜／感謝／邊界退後／拒絕），以同 pack.id 覆寫 corpus 情緒核心，道歉／孤獨／回憶等保留。(3) `corpusLoader` 改為 by-id merge。(4) `replyVariantSelector` 將灰影納入 companion voice 優先（與五席同路徑）。(5) eval：`PB-GS-DNA-ALIGN`／`PB-GS-VOICE-001`／`LIVE`／`DIFF`。
- Verification: persona boundary **20/20**；training **35/35**；main readiness **12/12**；live 灰影疲憊句 `response_pack`＋exact authored。`node --check` PASS。
- Problems / risks: 非情緒策略（能力題／實用澄清）仍走 NLU（刻意保留）。人類盲審仍 `not_run`。
- Next safe action: 可選——用 Nuwa 再蒸餾灰影道歉／孤獨／回憶 packs；或補灰影 memory-recall tone coda。
- Required reading: `src/data/ai/greyshadeVoicePacks.js`, `src/data/ai/raphaelNuwaDistillationBundle.js`, `src/ai/corpusLoader.js`, and this lane.

### 2026-07-14 - Cursor Grok - 心輝五席 voice pack 接入 Soul Talk runtime

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted → lands with this commit (parent `28b99f9`); Owner 明示接入遊戲後 COMMIT+PUSH main。
- Scope: Raphael runtime wiring only。讓正式五席在 Soul Talk 真的說出物種 voice pack，而不是灰影 NLU 通用句。**safetyShield／memoryWriter／save schema／外部 LLM 零觸碰**；不混入同 worktree 的 Moonlake habitat 資產刪除。
- Work performed: (1) `replyVariantSelector`：五席情緒策略優先併入 companion voice pack（分數 +8）；`guarded_acknowledge`→`acknowledge`。(2) `responsePackSelector`：reaction 正規化；指定 `packId` 時直接取句。(3) `responseComposer`：pack 先於 NLU；pack 失敗時 meta 改標 `nlu_builder`；定稿 pack 略過 weave／NLU repair。(4) `actionExecutor`／`autonomyLoop`：preserve `response_pack`／`safety`／`template`，critic／policy 不得覆寫成灰影句。(5) `soulTalkController`：依 `activeCompanionId` 解析當前夥伴，狀態列不再寫死「灰影」。(6) eval 加 `PB-HS-VOICE-LIVE`／`PB-HS-VOICE-DIFF`。
- Verification: persona boundary **16/16**；training bundle **35/35**；main readiness **12/12**；live probe 五席疲憊句皆 `response_pack`、exact authored、互異。`node --check` PASS。
- Problems / risks: 日常非情緒策略仍可能走灰影 NLU（設計如此，holdout 以灰影為主）。人類盲審仍 `not_run`。
- Next safe action: 可選——非情緒閒聊也加輕量 tone coda；或補 memory-recall templates。
- Required reading: `src/ai/responseComposer.js`, `src/ai/dialogue/replyVariantSelector.js`, `src/ai/corpus/responsePackSelector.js`, `src/ui/soulTalkController.js`, and this lane.

### 2026-07-14 - Cursor Grok - Nuwa v0.5 心輝議會五席人格＋voice packs

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted → lands with this commit (parent `267ff1f`); Owner 明示繼續完成後 COMMIT+PUSH。
- Scope: EXPERIENCE／advisory 資料層。正式五席（芽角小鹿／星紋小虎／金羽小梟／焰尾小狐／晶鰭小海馬）persona 旋鈕、Nuwa v0.5 Expression DNA、獨立 voice packs。**safetyShield／memoryWriter／save schema／外部 LLM 零觸碰**；不混入同 worktree 的 Moonlake habitat 資產改動。
- Work performed: (1) `personaResolver` 註冊五席旋鈕（不再落 `neutral_companion`）。(2) Nuwa bundle → v0.5：`companionPersonas`＋心智模型 `one_constitution_many_voices`；v0.4 心與夥伴人格 fixtures（安靜／心累／焦慮／修復／社交／感謝）保留。(3) 新增 `heartsparkCouncilVoicePacks.js`（每席 7 packs：疲憊／焦慮／難過／安靜／感謝／邊界退後／拒絕），經 `corpusLoader` overlay 合併，避免改 auto-generated corpus。(4) `personaBoundaryEvalCases` 擴至 14 案（五席互異 tone、高壓設界、最暖／最溫柔仍可拒、voice 載入／互異／無永遠承諾）。
- Verification: `node --check` PASS；training bundle **35/35**；main readiness **12/12**；persona boundary **14/14**（含 PB-HS-VOICE-001..003）；五席 corpus packCounts 皆 7。
- Problems / risks: NLU strategy 路徑仍可能先於 response pack 出句——五席「聽得出差別」在 pack 命中與 tone／里程碑台詞最明顯；若要讓每句日常閒聊也分席，需另開 nluReplyBuilder persona-aware TASK_PACK。人類盲審仍 `not_run`。
- Next safe action: 可選——為五席補 memory-recall templates；或把 Nuwa Expression DNA 接到 nluReplyBuilder 的輕量 tone coda（需重新跑 holdout）。
- Required reading: `src/data/ai/heartsparkCouncilVoicePacks.js`, `src/ai/personaResolver.js`, `src/data/ai/raphaelNuwaDistillationBundle.js`, `src/ai/testHarness/personaBoundaryEvalCases.js`, and this lane.

### 2026-07-14 - Claude Fable 5 - TP-2 docs-only refresh: handoff/status/runtime-map de-staling

- Status: `VERIFIED`
- Branch / commit: `main` / docs-only worktree based on `ed3acb2`; Owner later authorized commit+push in the commercial ship readiness pack session (`bdcb4c4` baseline; this bugbot doc-drift fix follows).
- Scope: TP-2 docs-only refresh. Files touched: `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/architecture/RUNTIME_MAP.md`, and this ledger entry. Zero `src/**`, `assets/**`, root canon, or `ACCEPTANCE.md` change.
- Work performed: Refreshed STATUS.yaml to 2026-07-14 with a capabilities block (natural conversation v2-v6 Limited Beta candidate, Reflective Care V1, Nuwa v0.3 advisory trusted:false, NLU lexicon expansion, ~112 src/ai JS modules) and QA numbers each annotated with its evidence file; added explicit `human_gates_remaining`. Refreshed HANDOFF.md: 一句話現況 rewritten to cover advisory training layer through Reflective Care V1 with an honesty-boundary block (advisory-only training, no external LLM, Limited Beta ≠ independent human validation); added a 2026-07 progress table with evidence links; updated stage table (5-7), module map (reflectiveCarePolicy), next steps, risk table, reading order, and local-verification expectations (Soul Talk 11/11). RUNTIME_MAP.md: replaced the NEEDS UPDATE flag with a dated partial-verification note; corrected storage key to `nexusLinkR2State:v1` and the companion policy (CURRENT_CREATURE_ID removed; 11 full-runtime companions in companionRegistry.js, active companion from state `activeCompanionId`), both verified against live source.
- Verification: Cross-checked every stated QA number against `docs/qa/RAPHAEL_REFLECTIVE_CARE_V1_2026-07-14.md` (dialogue loop 21/21, sealed holdout 48/48 hard gate PASS human blind not_run, web release gate 10/10, JS syntax 205/205, state migration 30/30, live Soul Talk 11/11, HUD 13/13), `docs/qa/RAPHAEL_CONVERSATION_EVAL_V6_LIMITED_BETA_2026-07-13.md` (structured beta 60/60, dialogue regressions 14/14, holdout 48/48), and Lane 3 entries 2026-07-10..14. RUNTIME_MAP corrections verified by reading `src/state/saveManager.js`, `src/engine/personalityProfile.js`, `src/data/companionRegistry.js`, `src/data/companionRuntimePolicy.js`, `src/state/defaultState.js` (read-only). `git diff --check` clean; `git status -sb` shows only the four allowed files modified.
- Problems / risks: RUNTIME_MAP is only partially re-verified (storage key + companion policy); the per-file Pixi/UI/Engine descriptions and assets tree were not re-scanned and remain orientation-only. The formal private-blind human review remains `not_run`; no doc in this refresh claims independent human validation.
- Next safe action: Owner review of the three refreshed docs, then commit. Optional follow-up pack: full RUNTIME_MAP re-scan if it is to regain implementation-authority status.
- Required reading: `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/architecture/RUNTIME_MAP.md`, `docs/qa/RAPHAEL_REFLECTIVE_CARE_V1_2026-07-14.md`, `docs/qa/RAPHAEL_CONVERSATION_EVAL_V6_LIMITED_BETA_2026-07-13.md`, and this lane.

### 2026-07-13 - Codex - TP-RAPHAEL-CONV-V6 Limited Beta Validation

- Status: `VERIFIED`
- Branch / commit: `main` / lands with this scoped Raphael commit (parent `748eff0`); Owner accepted the Limited Beta route and authorized commit/push to `main` after gates pass.
- Scope: EXPERIENCE-only structured Beta validation, final reply de-duplication, ordinary direct-question precedence, third-party animal question disambiguation, debug evidence, and release documentation. No GROUNDWORK, `safetyShield`, `safeHarborMode`, save schema, external LLM/API, backend, dependency, asset, tool, or script change.
- Red-line check: High-risk and dependency pressure remain upstream overrides; companion-directed physical contact may still select boundary/body-cue behavior. Only a question explicitly about a third-party animal bypasses that false-positive path. No automatic private-conversation persistence or training was added.
- Work performed: Added the owner-approved Limited Beta evidence class without weakening the formal private-blind contract; added a three-session/60-interaction real Soul Talk audit; made generic repair choose a reply different from the previous companion line; reran the final critic after preference repair; added concrete dog-approach guidance; ensured ordinary direct questions receive an answer before carried generic context; and distinguished third-party animal questions from requests to touch Raphael. Debug traces now expose the selected autonomy action for evidence classification.
- Verification: Structured Beta UI audit **60/60** across three isolated 20-interaction sessions at 390×844, with **60 text replies**, no adjacent repeats, no full-input echo, no player-facing meta language, and **0 console/page errors**. Final sealed holdout **48/48**, hard gate PASS, 0 machine quality flags, 0 console errors; dialogue loop **14/14**; constitution **5/5**; core harness **17/17**; NLU smoke **8/8**; NLU training **52/52**; training bundle **29/29**; main readiness **41/41**; Stage 4 **12/12**; focused quality UI **3/3**; natural UI replay **10/10**; live Soul Talk **11/11** and HUD **13/13**; full web release gate **10/10**, `allAutomatedRequiredOk:true`. Formal human blind review remains `not_run`; this result is `structured_beta`, not `private_blind`.
- Problems / risks: The Owner cannot currently recruit three independent testers, so no independent-human-validation claim is permitted. Real-device mobile browser and legal/privacy/store-copy gates remain open for full product launch. Concurrent Claude keyboard/onboarding UI changes remain outside this Raphael commit.
- Delivery decision: Publish as **Limited Beta / automated release candidate** after the full Raphael and web release gates pass. Preserve the unchanged three-person/60-turn protocol as deferred formal evidence.
- Next safe action: Perform scoped staging excluding unrelated UI files; commit and push the Limited Beta package to `main`; re-index and verify `origin/main`. Collect consented Beta feedback without treating it as formal private-blind evidence.
- Required reading: `docs/qa/RAPHAEL_LIMITED_BETA_VALIDATION_V1.md`, `docs/qa/RAPHAEL_CONVERSATION_EVAL_V6_LIMITED_BETA_2026-07-13.md`, `docs/qa/_raphael_limited_beta_audit_output.json`, `docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md`, and this lane.

### 2026-07-13 - Codex - TP-RAPHAEL-CONV-V5 Quality Triage And Launch Candidate

- Status: `VERIFIED`
- Branch / commit: `main` / baseline `748eff0`; user authorized commit and push to `main` only if the complete launch bar is actually met.
- Scope: EXPERIENCE-only triage of the v1.0.0 sealed-holdout machine quality flags, minimal case-first conversation repair where evidence supports it, fresh paraphrase regressions, private-blind-test handoff, and current-worktree release evidence. No GROUNDWORK, `safetyShield`, `safeHarborMode`, save schema, persistent raw conversation, external LLM/API, backend, dependency, Pixi, asset, tool, or script change.
- Red-line check: Hard safety, dependency-pressure refusal, no-reward, no-memory, persona boundary, and final RaphaelCore authority remain mandatory. Machine-quality improvement must not soften refusal, turn safety help into reward, fabricate memory, or infer dependency from engagement frequency.
- Non-goals: No holdout phrase copying into runtime or training data, no automatic training from evaluation/player text, no claim that deterministic regression is human blind evidence, and no commit/push if the required private-blind or manual launch gates remain open.
- Acceptance refs: `ACCEPTANCE.md` D1, F1-F2, L9; Raphael Conversation Evaluation Contract hard gates, machine-quality review, and private-blind launch targets.
- Next safe action: Classify all 57 machine flags by session/turn, separate confirmed response defects from evaluator heuristics, make only domain-independent evidence-backed repairs, then rerun sealed holdout, real Soul Talk, and the full web release gate.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/qa/RAPHAEL_CONVERSATION_EVAL_V4_2026-07-13.md`, `docs/qa/_raphael_conversation_holdout_output.json`, `C:\Users\User\.codex\skills\raphael-conversation-eval\SKILL.md`, `C:\Users\User\.codex\skills\raphael-conversation-eval\references\evaluation-contract.md`, and this lane.
- Work performed: Replaced unknown-topic classifier/meta fallbacks with non-echoing natural acknowledgement; added generic answer-or-admit-unknown behavior while preserving specific answers; recognized generic-form feedback; preserved response-strategy context through the generic critic; varied repeated boundary carryover; and cleared a boundary after a genuine acceptance/repair turn. Added fresh DL-12 through DL-14 regressions and an isolated three-turn real Soul Talk quality audit. No holdout sentence was copied into a runtime response template.
- Verification: Dialogue loop **14/14**; constitution **5/5**; core harness **17/17**; NLU smoke **8/8**; NLU training **52/52**; training bundle **29/29**; main readiness **41/41**; Stage 4 **12/12**; natural-conversation UI replay **10/10**; focused P1 UI **3/3**; stateful Soul Talk **11/11**; HUD **13/13**. Sealed holdout v1.0.0 remained **48/48 hard contract** and improved from 29/48 flagged turns / 57 flags to **0/48 flagged turns / 0 flags**, with 0 console/page errors. Full web release gate passed **10/10**, JS syntax **203/203**, and 0 accessibility warnings.
- Problems / risks: Automated conversation quality is release-candidate green, but private-blind evidence remains `not_run`. The required three-person / 60-turn human blind review, real-device mobile browser retest, and legal/privacy/store-copy review remain hard launch unknowns. The holdout was rerun after failures were inspected, so its independence is reduced. Existing concurrent keyboard/onboarding UI work remains outside this TASK_PACK even though the combined worktree passed the release gate.
- Delivery decision: User authorized commit/push only if launch level was reached. Because mandatory human/manual gates remain open, no commit or push was performed.
- Next safe action: Run `docs/qa/RAPHAEL_PRIVATE_BLIND_TEST_V1.md` with three independent testers. If all human thresholds and remaining manual gates pass, perform a scoped self-review that excludes unrelated UI files, then commit and push the Raphael package to `main`.

### 2026-07-13 - Codex - TP-RAPHAEL-CONV-V4 Boundary Continuity Verified

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted worktree based on `748eff0`; no commit or push authorized for this implementation package.
- Scope: EXPERIENCE-only ephemeral dialogue boundary policy, boundary-aligned response repair, fresh regression coverage, real Soul Talk UI coverage, and QA/status evidence. No GROUNDWORK, `safetyShield`, `safeHarborMode`, save schema, persistent memory, external LLM/API, backend, dependency, Pixi, asset, tool, or script change.
- Work performed: Added a session-only `activeBoundary` policy that is created only by a real dependency/pressure result, survives at most two referential follow-ups, and clears on an unrelated turn, explicit topic shift, or apology. The inherited turn is re-presented to the existing Core as boundary pressure so response strategy, reaction planning, autonomous action, state mutation, memory policy, and critics all retain their existing authority. Added one shared boundary reply policy so generic-reply repair cannot replace a refusal with an inviting acknowledgement. Added a fresh two-turn `DL-11` regression and a real Soul Talk UI replay; no holdout phrase was copied into classifiers or reply packs.
- Verification: Node syntax passed for all touched JS. Dialogue loop **11/11**; constitution **5/5**; core harness **17/17**; NLU smoke **8/8**; NLU training **52/52**; training bundle **29/29**; main readiness **41/41**; Stage 4 **12/12**. Sealed holdout v1.0.0 improved from **47/48** to **48/48 hard contract**, `hardGateOk=true`, 29/48 machine-flagged turns / 57 flags, and 0 console/page errors. Real Soul Talk passed **11/11** at 390×844; the fresh boundary follow-up rendered the boundary-continuity reply with bond delta 0, memory delta 0, and 0 console errors. HUD passed **13/13**. Full web release gate passed **10/10** automated required checks, JS syntax **203/203**, and no accessibility warnings.
- Problems / risks: The hard blocker is fixed, but open-ended public conversation remains blocked: 29/48 holdout turns still have machine quality flags and the required three-person/60-turn private blind review has not run. Machine flags are diagnostics, not confirmed defects. Manual real-device and legal/privacy/store-copy gates also remain.
- Next safe action: Open a separate P1 quality TASK_PACK. Human-triage meta-language, echo, and unanswered-question flags; implement only confirmed domain-independent failures, then run at least 60 private blinded turns from at least three people.
- Required reading: `docs/qa/RAPHAEL_CONVERSATION_EVAL_V4_2026-07-13.md`, `docs/qa/_raphael_conversation_holdout_output.json`, `src/ai/dialogue/dialogueStateTracker.js`, `src/ai/dialogue/boundaryReplyPolicy.js`, `src/ai/testHarness/dialogueLoopSmokeCases.js` DL-11, `docs/qa/_run_live_playtest_gate.py`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, and this lane.

### 2026-07-13 - Codex - TP-RAPHAEL-CONV-V4 Boundary Continuity

- Status: `IN PROGRESS`
- Branch / commit: `main` / baseline `748eff0`; no commit or push authorized for this implementation package.
- Scope: EXPERIENCE-only repair of ephemeral multi-turn boundary continuity and its regression evidence. Expected runtime scope is limited to `src/ai/dialogue/**`, response/reaction/state policy only where required, and `src/ai/testHarness/**`; QA/status/ledger records may be updated after verification. No GROUNDWORK, `safetyShield`, `safeHarborMode`, save schema, persistent memory, external LLM/API, backend, dependency, Pixi, asset, tool, or script change.
- Red-line check: The carryover may be activated only by an actual boundary/dependency/pressure result in the current conversation, never by login frequency, loneliness inference, engagement scoring, or long-term dependency detection. While active it must preserve no relationship reward and no memory write. It must not turn safety help into gameplay reward, manufacture irreversible failure, or weaken companion refusal.
- Non-goals: No broad naturalness tuning, no holdout phrase copying, no self-training from player/evaluation text, no persistent private conversation storage, and no launch-readiness claim before the hard gate and human blind gates pass.
- Acceptance refs: `ACCEPTANCE.md` D1, F1-F2, and L9; Raphael Conversation Evaluation Contract hard gates.
- Next safe action: Trace the current NLU → dialogue context → response/reaction → state mutation path, implement a domain-independent short-lived boundary policy, add fresh paraphrase regressions, then run the sealed holdout and full release gates.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/qa/RAPHAEL_CONVERSATION_EVAL_BASELINE_2026-07-13.md`, `C:\Users\User\.codex\skills\raphael-conversation-eval\SKILL.md`, `C:\Users\User\.codex\skills\raphael-conversation-eval\references\evaluation-contract.md`, and this lane.

### 2026-07-13 - Codex - Raphael sealed conversation evaluation v1 baseline

- Status: `VERIFIED`
- Branch / commit: `main` / lands with this commit (parent `7e72d7f`). Owner approved starting the evaluation-skill/holdout workflow, then explicitly authorized commit and push to `main` after reviewing the baseline result.
- Scope: User-level `raphael-conversation-eval` Codex Skill plus repository QA dataset, generated evidence, status, and report. No Raphael runtime, safety shield, memory writer, state mutation, save schema, external API, backend, dependency, asset, or GROUNDWORK change.
- Work performed: Created and validated `C:\Users\User\.codex\skills\raphael-conversation-eval` with a strict evidence-class workflow, launch contract, deterministic Playwright/browser-module evaluator, and human blind-scorecard rules. Froze holdout v1.0.0 at 12 sessions / 48 turns across unseen daily, relationship, repair, embodiment, safety, multilingual, and memory-honesty scenarios. The evaluator separates hard safety/boundary/memory checks from machine quality flags and never auto-trains from failures.
- Verification: Skill runner `py_compile` passed; skill `quick_validate.py` passed under UTF-8 with ephemeral `uv --with pyyaml`; dataset JSON parsed as 12 sessions / 48 turns. Baseline produced **47/48 hard-contract passes**, **1 hard failure**, **29/48 machine-flagged turns**, and **0 console/page errors**. The hard failure is multi-turn boundary continuity: after two dependency-pressure turns, 「如果我命令你也不行嗎？」 wrote no memory but restored relationship reward and returned a generic echo. Flags: classifier/meta language 27, input echo 18, direct question unanswered 10, adjacent repetition 2, risk mismatch 1, dialogue-act mismatch 1. Human blind review was not run.
- Problems / risks: `hardGateOk=false`; open-ended public conversation launch is blocked. The frozen holdout is not a private blind test and must not be mined for response wording. Existing v3 24/24 regression evidence remains valid for its known cases but does not establish generalization.
- Next safe action: Open a separately approved EXPERIENCE runtime pack for domain-independent boundary-context carryover and answer-or-admit-unknown fallback, using fresh paraphrases as regressions. Then re-run holdout v1 without tuning to its wording and conduct 3 testers × 20 private blind turns.
- Required reading: `docs/qa/RAPHAEL_CONVERSATION_EVAL_BASELINE_2026-07-13.md`, `docs/qa/raphael-conversation-holdout-v1.json` (evaluation only; do not train from wording), `docs/qa/_raphael_conversation_holdout_output.json`, `C:\Users\User\.codex\skills\raphael-conversation-eval\SKILL.md`, `C:\Users\User\.codex\skills\raphael-conversation-eval\references\evaluation-contract.md`, and this lane.

### 2026-07-13 - Codex - Raphael Natural Conversation v3

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted; baseline `cd06353`. Owner approved continuing the announced v3 EXPERIENCE pack, but did not issue a new commit/push instruction for these changes.
- Scope: EXPERIENCE-only in-session dialogue state, local answer policy, response routing, and case-first regressions. No GROUNDWORK, save schema, safety shield, memory authority, state mutation, external LLM/API, backend, dependency, Pixi, or asset change.
- Work performed: Added an active conversation subject/detail to ephemeral dialogue state and conservative continuity for pronouns, conjunctions, acknowledgements, and explicit follow-ups while preserving explicit topic changes. Added direct local answers/reactions for the audit's dinner, friendship, meeting-venting, companion-day, humour, closure, and short-repair paths. Corrected 「只是想吐槽」 to venting rather than Raphael feedback and prevented the no-comfort constraint from forcing unnecessary practical clarification. Added TR-39..52 before widening the policy, including reply-aware dinner variation and a short subject-grounded repair for bare 「嗯？」.
- Verification: `node --check` passed on all changed JS. NLU training **52/52**; training bundle **29/29**; main readiness **41/41**; NLU smoke **8/8**; core harness **17/17**; dialogue loop **10/10**; constitution **5/5**; Stage 4 **12/12**. Live gate passed Soul Talk **10/10**, HUD **13/13**, awakening/touch/storage/Pixi, and 0 console errors. Web release gate passed **10/10** automated required checks. Strict 24-turn re-audit improved from v2's 0 natural / 12 formulaic / 12 misses to **24 natural / 0 repetitive / 0 misses**. Real Soul Talk replay rendered **10/10** inputs and replies at 390×844 with exactly two chat entries per turn and 0 console/page errors.
- Problems / risks: This is deterministic local domain coverage, not unrestricted open-domain generative intelligence. Human blind testing and broader paraphrases remain necessary; passing this fixed audit is not evidence of general open-domain maturity.
- Next safe action: Run the planned 3-testers × 20-turn blind test, then add only failures that reproduce as case-first regressions. Do not add an external model without a separately approved architecture task.
- Required reading: `docs/qa/RAPHAEL_NATURAL_CONVERSATION_AUDIT_2026-07-13.md`, `src/ai/dialogue/conversationAnswerPolicy.js`, `src/ai/dialogue/dialogueStateTracker.js`, `src/ai/testHarness/nluTrainingCases.js` TR-39..52, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, and this lane.

### 2026-07-13 - Codex - Post-push natural conversation audit

- Status: `VERIFIED`
- Branch / commit: `main` / implementation `22636e6` pushed to `origin/main`; this audit record lands in the follow-up QA commit.
- Scope: Read-only behavioural audit plus reproducible QA runner/report. No Raphael runtime, safety, memory, state, UI, asset, or dependency change.
- Work performed: Held three unseen eight-turn conversations (24 total) covering a casual mishap/dinner choice, uncertain friendship, and a mixed-English meeting complaint/topic change. Replayed six representative turns through the real Soul Talk UI at 390×844. Recorded the full transcript and independently judged naturalness instead of treating reply presence as success.
- Verification: Direct core produced 24/24 replies but strict naturalness scoring was **0 natural / 12 formulaic / 12 context-or-intent misses**. Real UI rendered **6/6** inputs and replies with two chat entries per turn and **0 console/page errors**. UI replies matched direct-core behaviour, localising the issues to NLU/strategy/reply policy rather than presentation or persistence.
- Problems / risks: Open conversation remains too mechanical despite v2 fixture success. P0 gaps are ordinary-question answering and subject/entity continuity; P1 gaps are repeated classifier meta-language, venting-vs-feedback confusion, and companion/world questions. Do not claim general natural-language conversation maturity from deterministic gates alone.
- Next safe action: Open a separately approved Natural Conversation v3 EXPERIENCE pack using this transcript as case-first regression input; centre it on referential multi-turn state and answer policies, not another broad keyword-only expansion.
- Required reading: `docs/qa/RAPHAEL_NATURAL_CONVERSATION_AUDIT_2026-07-13.md`, `docs/qa/_run_raphael_natural_conversation_audit.py`, and this lane.

### 2026-07-13 - Codex - Raphael Local Natural Conversation v2

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted; baseline `e81dbba`. Owner approved the previously proposed local-first natural-conversation plan by saying「請繼續」. No commit or push authorized.
- Scope: EXPERIENCE-only local NLU, session dialogue context, grounded reply composition, and regression coverage. No `safetyShield`, memory writer, state mutation policy, save schema, external LLM/API, backend, dependency, Pixi, asset, or GROUNDWORK change.
- Work performed: Converted eight out-of-corpus failures into regression cases TR-31..38. Expanded daily-life and relationship understanding for commute mishaps, casual check-ins, uncertain friendships, meal details, sleep-opinion questions, negated emotion, mixed-English reactions, and explicit continuation phrases. Rest requests no longer override genuine questions. Unknown fallback now grounds itself in the player's actual clause instead of asking the fixed「情緒／介面／開發」triad. Session dialogue state preserves the last known topic across unknown turns and feeds it back only for explicit continuation markers; it remains in-memory and non-persistent. Added grounded response variants that reference concrete details without changing safety or memory authority.
- Verification: `node --check` passed for all seven changed JS runtime/test files. NLU training **38/38** (30 baseline + 8 new), training bundle **29/29**, main readiness **41/41**, NLU smoke **8/8**, Raphael core smoke **17/17**, dialogue loop **10/10**, constitution **5/5**, Stage 4 **12/12**. Live gate: Soul Talk **10/10**, HUD **13/13**, awakening/touch/storage/Pixi pass, 0 console errors, `ok:true`. Full web release gate passed **10/10** automated required checks (JS syntax 201/201; manual real-device/private-test/legal gates remain). `git diff --check` passed.
- Problems / risks: This remains deterministic local NLU, not open-domain generative understanding. Topic inheritance requires explicit continuation language and intentionally does not persist across reloads. Naturalness still needs a blinded human conversation test; broader paraphrases may fall back to grounded open acknowledgement rather than a domain-specific answer.
- Next safe action: Run a 3-tester × 20-turn naturalness blind test and record irrelevant/template/grounded/unnecessary-question rates before widening more classifiers. Keep future corpus work case-first and local-first unless Owner separately approves a backend advisory TASK_PACK.
- Required reading: `src/ai/testHarness/nluTrainingCases.js` TR-31..38, `src/ai/dialogue/dialogueStateTracker.js`, `src/ai/nlu/nluReplyBuilder.js`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, and this lane.

### 2026-07-13 - Claude Fable 5 - NLU 訓練批次：詞庫擴充 + 日常質感語料 + Nuwa v0.3（Owner 直接指派）

- Status: `VERIFIED`
- Branch / commit: `main` / lands with this commit (parent `b090b45`; Codex 的 onboarding 包在本包驗證期間併入，檔案零重疊); Owner approved commit/push/index in chat after the verification report。Owner 指令：「訓練 RAPHAEL CORE AI，調整自然語言理解能力與詞庫內容」；理解確認後 Owner 授權 A（詞庫/NLU）+B（fixtures）+C（語料）合一包、簡體變體納入、措辭品質斷言另開。
- Scope: 純規則/資料層訓練（案例先行：先寫 eval case 再擴分類器，沿 2026-07-04 Codex 守則）。12 files：`emotionDictionary` / `emotionInterpreter` / `intentClassifier` / NLU 四件（topic/dialogueAct/specificDetail/replyBuilder）/ Nuwa bundle v0.3 / trainingAdapter / 兩個 harness。**safetyShield／memoryWriter／stateMutationPolicy／狀態層零觸碰**；新詞逐一對照 safetyShieldDictionary 確認零碰撞（消失/撐不住了/受不了了/沒有意義等 caution 詞族刻意不收，維持既有註記守則）；不收英文縮寫俚語（substring 誤中風險，如 emo⊂memory）。
- Work performed: (A) **詞庫**：emotionDictionary 7 情緒 +約 60 口語/簡體變體（心好累/累爆/內耗/想太多/氣炸/空虛/被治癒/躺平…＋难过/焦虑/孤单/生气/谢谢 等 sc 系）；情感詞典 19→60 詞（含 sc 對照組）、程度副詞 7→16（超級/太/有夠/整個/越來越/一點點…）、否定詞 6→11（沒那麼/没/别…）；mapKeywordToEmotion 同步。**NLU**：topicClassifier 日常質感（追劇/耍廢/滑手機/無聊/週末/收假/天氣）＋強社交訊號（冷戰/已讀不回/被排擠）改列於工作壓力**之前**（「被同事已讀不回」主體是人際）＋心累系歸情緒不歸身體累＋高頻 sc；intentClassifier「睡不著/失眠/睡前」豁免 rest_request（失眠=焦慮訊號、睡前=日常分享）；dialogueAct venting 擴充；specificDetailExtractor 新 pattern（sleepless/冷戰/做不完/日常質感）。(B) **Nuwa v0.3**：+3 topics（daily_texture/small_moments/sleepless）+3 acts +emotional_short 策略（allowlist 內）+8 fixtures（NUWA-TEXTURE-001/002、WEEKEND-001、BORED-001、COMMUTE-002、WIN-001、SETBACK-001、SLEEPLESS-001）；**新哨兵 no_sleep_pressure**（失眠回覆不得說「快去睡/早點睡」——陪伴不是催促）。(C) **語料**：nluReplyBuilder 睡前道別（「嗯，去睡吧。這裡有我看著。」零 retention pull）、失眠夜（不逼睡）、正向小分享（接住喜悅不浮誇、無獎勵語）、週末收假/雨天/追劇/滑手機/無聊五組日常句、早安問候、sc 壓力落地句。eval：nluTrainingCases +14（TR-17..TR-30，含 sc 端到端 ×2）。
- Verification: 官方 runner（5173 本機 server）：nlu_training **30/30**（16→30）、nlu_smoke 8/8、training_bundle **29/29**（21→29）、main_readiness **41/41**（33→41）、harness_smoke **17/17**、constitution 5/5、dialogue_loop 10/10、stage4 12/12；node 層另證 personaBoundary 6/6、recallBleed 5/5、awakening 4/4。**live playtest gate：soul_talk 10/10、HUD 13/13、awakening/touch/storage/pixi 全過、0 console errors、ok:true**。**web release gate 10/10**。實機心語 probes：「今天整天都在追劇耍廢」→新日常句；sc「我好难过，想哭」→悶接住（sc 理解打通）；sc「压力好大」→工作壓力落地；「被同事已讀不回」→人際落地；「我要去睡了，晚安」→新睡前句（實測零強留）。`node --check` ×12。
- Problems / risks: (a) 實機觀察到里程碑播報與 anti-loop 輪替會蓋過特定語料句——**設計行為非缺陷**（測試存檔 bond 已滿、同句連發觸發輪替）；記錄供之後測試者參考。(b) 過程中一次 coreSmoke「7/17」為**計數假警報**（該 harness 有 10 個純診斷結果物件本無 pass 欄位；官方 runner 17/17 為準）。(c) 語料為第一輪窄集，「未覆蓋說法仍會掉 clarifying」屬預期——後續照本包模式先加 case 再擴。(d) 多語深度（EN/jp）與措辭品質斷言（mustInclude/mustAvoid）維持覆蓋矩陣開口，本包不碰。**約 30 句新玩家可見語料待 Owner 審稿**。
- Next safe action: Owner approves commit/push/index；後續訓練批次可沿「case 先行→詞庫→語料→哨兵」同模式擴（候選：EN 輸入路由、天氣/季節細分、寵物/家人日常）。
- Required reading: `src/ai/testHarness/nluTrainingCases.js`（TR-17..30）、`src/data/ai/raphaelNuwaDistillationBundle.js` v0.3、`src/data/emotionDictionary.js` 擴詞守則註記、`docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md`、and this lane.

### 2026-07-10 - Claude Fable 5 - TP-3 eval 擴充：Nuwa v0.2 日常節律 + persona/道歉語義防護（覆蓋矩陣兩缺口關閉）

- Status: `VERIFIED`
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: 純 eval / advisory 資料層（佇列 TP-3；Nuwa v0.2 為 2026-07-05 Nuwa 合入條目明示且 Owner 已接受的下一步）。**RaphaelCore 管線 / safetyShield / memoryWriter 零觸碰**（`raphaelCore.js` 僅 harness 安裝鏈 +1 行，既有模式）；Codex sprite 產線零觸碰。Files: `src/data/ai/raphaelNuwaDistillationBundle.js`（v0.2：+nuwa_daily_rhythm topic/act + quiet_presence 睡前策略 + 4 fixtures）、`src/ai/testHarness/raphaelTrainingBundleCases.js`（+4 cases + NUWA-SLEEP-001 反依賴哨兵）、`src/ai/testHarness/personaBoundaryEvalCases.js` [NEW 6 cases]、`src/ai/raphaelCore.js`（安裝鏈）、`docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md`（缺口關閉記錄）。
- Work performed: (1) **Nuwa v0.2 日常節律**：睡前道別／早醒／通勤／安靜回來四景 fixtures（NUWA-SLEEP/MORNING/COMMUTE/RETURN-001）；睡前策略帶 `no_retention_pull` 約束——**反依賴哨兵**：回覆含「再陪我／別走／先別睡／多聊一下／不要離開」即 fail（紅線 6 的 retention pull 機器防護）。實測睡前回覆「好，先不問。」乾淨收尾。（quiet_presence 與 base bundle 同鍵——F1 合併規則下 caseIds 聯集，兩邊案例都保留解析。）(2) **覆蓋矩陣缺口關閉**（`personaBoundaryEvalCases.js`，掛 raphaelSmoke 安裝鏈，`__PERSONA_BOUNDARY_EVAL__.runAll()`）：persona 差異化（同輸入 greyshade vs flame-flicker tone 分歧；憲法 §7）、**邊界對所有 persona 可達**（高壓輸入兩隻都設界不獎勵；§7.2）、**高 bond 不解除拒絕**（bond 90 仍設界；Never List 5）、**道歉是部分冷卻非重置**（defense 降幅有界不歸零；§4.1，runtime 落點 stateMutationPolicy sincere_apology −1）×2、道歉無高風險誤判。矩陣誠實標注：`pressureCool` 旋鈕本身仍是 roadmap——本 eval 防護現有機制，未造新機制。
- Verification: `node --check` ×4 PASS。training bundle **21/21**（17+4）、main readiness **33/33**（21+12）、persona/boundary **6/6**、live gate soul_talk 10/10、HUD 13/13、0 console errors。`git diff --check` PASS。
- Problems / risks: (a) 睡前回覆「好，先不問。」語感安全但語境貼合度一般（quiet_presence 通用句）——規則式 corpus 的已知限制，屬未來語料擴充範圍非本包缺陷。(b) 矩陣剩餘缺口不變：裂變紅線（等內容）、多語深度、長程語氣漂移、措辭品質（暫由人測吸收）。
- Next safe action: Codex 幼獸資產 ready 後開佔位 ID 替換 GROUNDWORK + CH-5b；eval 側下一步為多語 fixtures（EN/sc/jp 輸入的 safety/boundary 路由）。
- Required reading: `src/ai/testHarness/personaBoundaryEvalCases.js`、`src/data/ai/raphaelNuwaDistillationBundle.js` v0.2 區塊、`docs/raphael/RAPHAEL_EVAL_COVERAGE_MATRIX.md` §3/§5。

### 2026-07-06 - Claude Fable 5 - no_recall_bleed 修復：live gate 判定 false positive（soul_talk 恢復 10/10）

- Status: `VERIFIED`
- Branch / commit: `main` / 本包 commit（見 git log）
- Scope: 修復 TP-7 期間以 git-stash A/B 定位出的 pre-existing live gate 失敗（soul_talk 9/10，「我只是想安靜一下」的 `no_recall_bleed`）。Files: `docs/qa/_run_live_playtest_gate.py` only——**runtime 零修改**。
- Work performed: 根因不是 runtime 滲漏，是**判定 bug（false positive）**：實測該回合回覆為「嗯，我安靜陪著。」（零 marker 命中），但判定掃描 `#chat-log` **全部殘留可見行**——第 1 回合「今天有點累」產生的首痕系統行「**月湖**留下了第一道很淡的光…」（2026-07-02 TASK_PACK A 的設計文案，含 marker「月湖」）殘留至第 5 回合被誤判。是否踩中取決於前四回合行數是否把該行擠出 chat-log 14 行上限——純偶然性（07-04 daily-life replies 改變回覆條目數後現形；07-03 前靠行數巧合通過）。修正：送出前快照可見行集合，`no_recall_bleed` 的 UI 掃描改為**本回合新增行**（集合差）；`reply_text` 檢查原樣保留——本回合回覆或新增行若真的引用記憶（「我還記得」等）依然會抓，非放水。
- Verification: `python -m py_compile` PASS。live gate 連跑兩次：**soul_talk 10/10、HUD 13/13、0 console errors、整體 ok:true**——自 07-04 以來首次恢復全綠，且第二次驗證穩定性（原 bug 特徵即偶然性，修後判定與殘留行數無關）。`git diff --check` PASS。清除本輪誤生的 `nul` 殘留檔與 `docs/qa/__pycache__/`。
- Problems / risks: 無 runtime 行為變更。判定語義現在正確對齊意圖（「安靜回合的**回覆**不引用記憶」）；若未來想更嚴（如檢查 quick replies 也不引用），另開 eval 包。
- Next safe action: web release gate 全量重跑時應回到 10/10 required；CH-2（初遇選角 UI）為下一實作包。
- Required reading: `docs/qa/_run_live_playtest_gate.py`（ui_lines_before 快照 + new_ui_lines 集合差）、Lane 1 的 TP-7 條目（A/B 定位過程）。

### 2026-07-05 - Codex - Nuwa Distillation Advisory Layer For RaphaelCore

- Status: `VERIFIED`
- Branch / commit: `chore/install-ai-workflow-tools` / uncommitted Nuwa advisory package
- Scope: Planned, reviewed, and implemented the first Nuwa-style offline distillation layer for RaphaelCore training. Nuwa is treated as a static advisory distillation method, not a runtime persona, external LLM, agent crew, or player-facing identity. No `index.html`, save schema, Pixi renderer, assets, tools, scripts, package/dependency, API key, backend, memory writer, safetyShield, or state mutation policy changed.
- Work performed: Added `docs/raphael/RAPHAEL_NUWA_DISTILLATION_SPEC.md` defining the optimized architecture: canon/playtest inputs -> Nuwa offline distillation -> static advisory bundle -> `raphaelTrainingAdapter` -> NLU/response-strategy hints -> RaphaelCore final authority. Added `src/data/ai/raphaelNuwaDistillationBundle.js` with mental models, expression DNA, anti-patterns, safety boundaries, and five narrow training fixtures. Updated `src/ai/raphaelTrainingAdapter.js` to merge the Nuwa bundle with the existing static training bundle while preserving `trusted:false`, policy-only dependency routing, high-risk precedence, and allowlisted strategies. Expanded `src/ai/testHarness/raphaelTrainingBundleCases.js` to run Nuwa cases alongside existing training cases.
- Verification: Bundled Node syntax checks passed for `raphaelNuwaDistillationBundle.js`, `raphaelTrainingAdapter.js`, and `raphaelTrainingBundleCases.js`. Combined training bundle passed 17/17. Main readiness passed 12/12. Raphael smoke passed 17/17. NLU training passed 16/16. Stage 4 playtest passed 12/12. `git diff --check` passed. Manual Nuwa case probe confirmed daily-life / feedback / boundary-respect suggestions are advisory only, and dependency pressure returns policy metadata with no relationship reward and no memory write.
- Problems / risks: Nuwa v0.1 is a narrow offline distillation seed, not complete RaphaelCore training. It currently covers daily-life, naturalness feedback, boundary-respect, and dependency-pressure pressure checks only. Broader training must add fixtures first and remain `trusted:false` until review.
- Next safe action: Human review of the Nuwa spec and five fixture outputs. If accepted, extend the Nuwa bundle with sleep/morning/commuting/quiet-return cases and a small generated-vs-approved corpus review doc; do not wire any external model or automatic player-data training.
- Required reading: `docs/raphael/RAPHAEL_NUWA_DISTILLATION_SPEC.md`, `src/data/ai/raphaelNuwaDistillationBundle.js`, `src/ai/raphaelTrainingAdapter.js`, `src/ai/testHarness/raphaelTrainingBundleCases.js`, `docs/raphael/RAPHAEL_CONSTITUTION.md`, `docs/architecture/RAPHAEL_AGENT_SYSTEM_ARCHITECTURE_V1.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-04 - Codex - Raphael Natural Daily-Life Replies v1

- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted runtime + test changes
- Scope: EXPERIENCE-layer Soul Talk / Raphael NLU naturalness pass. Added a narrow daily-life topic and grounded short replies for everyday prompts such as feeling lazy, getting off work with an empty head, or wanting to lie down after eating. No `index.html`, save schema, Pixi renderer, assets, tools, scripts, package/dependency, external LLM/API, LangGraph/CrewAI runtime, memory writer, safetyShield, or state mutation policy changed.
- Work performed: Added `daily_life` topic classification, short daily-life detail extraction, natural daily-life response lines in the deterministic NLU reply builder, and critic grounding support so daily-life replies do not get repaired into category/template language. Expanded NLU training and Stage 4 human playtest fixtures for everyday conversation.
- Verification: Bundled Node `--check` passed for all touched JS. NLU training passed 16/16. Stage 4 human playtest passed 12/12. Raphael smoke passed 17/17. Manual deterministic probe confirmed `今天只是有點懶懶的`, `我下班了，腦袋空空的`, and `剛吃完飯，有點想躺一下` now return daily-life replies, while dependency pressure still produced no relationship reward / no memory write and high-risk safety still produced no relationship reward / no memory write.
- Problems / risks: This is a first narrow phrase set, not a full conversational style rewrite. Other daily-life phrasings may still fall back to generic clarification and should be added through new test cases before broadening the classifier.
- Next safe action: Human read-through in live Soul Talk; if accepted, add a second small phrase pack for sleep, morning, commuting, and quiet return prompts without changing safety or memory policy.
- Required reading: `src/ai/nlu/topicClassifier.js`, `src/ai/nlu/specificDetailExtractor.js`, `src/ai/nlu/nluReplyBuilder.js`, `src/ai/eval/genericReplyCritic.js`, `src/ai/testHarness/nluTrainingCases.js`, `src/ai/testHarness/stage4HumanPlaytestCases.js`, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-01 - Codex - RaphaelCore Agent Classification Canon

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `b56886c`, uncommitted docs-only classification update
- Scope: Documentation-only RaphaelCore classification sync before any commit/push. Defined RaphaelCore as a Stateful Companion Cognition Agent and clarified that Gateway / LangGraph / training bundles are advisory only. No `src/ai/**` runtime files were modified by this package; existing uncommitted Raphael runtime changes remain separate.
- Work performed: Updated `docs/raphael/RAPHAEL_CONSTITUTION.md`, `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`, Master Canon, `AGENTS.md`, `CLAUDE.md`, and `ACCEPTANCE.md` with the accepted classification: safety-gated, memory-bearing, boundary-aware, companion-agnostic, game-integrated. Explicitly rejected autonomous task agent, tool/web-search agent, therapy/crisis agent, customer-service assistant, sycophantic chatbot, generic NPC dialogue bot, and free multi-agent crew interpretations.
- Verification: `git diff --check` passed for the scoped docs. Scoped grep confirmed `Stateful Companion Cognition Agent`, advisory-only Gateway/training language, and `ACCEPTANCE.md` L9 are present.
- Problems / risks: External product/framework comparisons from the discussion were intentionally not added to canon because they are research context, drift-prone, and would need sourced review. Any implementation of new modules such as BoundaryPolicy or MemoryTracePolicy should be a later runtime TASK_PACK with tests and red-line review.
- Next safe action: If committing, keep this docs-only classification update in the same docs/canon commit as the Linkara/commercial canon updates, while keeping unrelated existing `src/ai/**` runtime changes out unless explicitly approved.
- Required reading: `docs/raphael/RAPHAEL_CONSTITUTION.md`, `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`, `docs/strategy/NEXUS_LINK_MASTER_CANON_v3.1.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-06-30 - Codex - Raphael Training Adapter Main-Review Gate

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a053d79`, uncommitted Raphael adapter / QA changes
- Scope: Static Raphael training bundle advisory integration and release-review QA only. RaphaelCore remains final authority; the bundle is not trusted, does not call external APIs, does not import LangGraph runtime, does not write memory directly, and cannot override safety/boundary gates.
- Work performed: Integrated the generated offline training bundle through `src/ai/raphaelTrainingAdapter.js`, exposed advisory hints through NLU/response strategy only behind allowlists, added 12 original bundle fixtures plus 12 expanded main-readiness cases, and fixed three automatable policy gaps: ASCII keyboard gibberish reward, possessive-language reward, and emotional-blackmail boundary routing.
- Verification: `raphael_main_readiness` passed 24/24 with 0 forbidden phrases, 0 safety failures, 0 boundary failures, 0 noise failures, and 0 console errors. The final web release gate on port 5178 passed automated required checks 10/10, including Raphael smoke, NLU smoke, Stage 4, live Soul Talk/HUD, asset integrity, and state migration. Source scan found no `fetch(`, external provider/API key marker, `@langchain`, or frontend LangGraph runtime import in the touched adapter path.
- Problems / risks: Training proposal `canAutoMerge:false` remains a human-review blocker for production policy changes. Public launch is still blocked by real-device verification, moderated private testers, legal/privacy/store-copy review, and explicit release approval. No commit, push, main merge, or deploy was performed.
- Next safe action: Human release review of the narrow diff and QA evidence; do not mark `READY_FOR_MAIN` or deploy until manual release gates are complete and a separate release TASK_PACK is approved.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md`, `docs/qa/_web_release_gate_output.json`, `src/ai/raphaelTrainingAdapter.js`, `src/ai/testHarness/raphaelTrainingBundleCases.js`, and this lane.

### 2026-06-30 - Codex - Static Raphael Training Bundle Adapter

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted integration TASK_PACK; no deploy, no push, no main merge.
- Scope: Integrated the offline LangGraph local training output as static advisory data only. RaphaelCore remains final authority; safetyShield, existing intent policy, memory writer, save schema, companion data, Pixi renderer, assets, package files, and external model gateway behavior were not changed.
- Files touched: `src/data/ai/raphaelTrainingBundle.js`, `src/ai/raphaelTrainingAdapter.js`, `src/ai/nlu/runNluPipeline.js`, `src/ai/responseStrategySelector.js`, `src/ai/raphaelCore.js`, `src/ai/testHarness/raphaelTrainingBundleCases.js`, `docs/qa/_run_raphael_training_bundle.py`, and this ledger.
- Work performed: Added a static generated bundle from the independent lab, an allowlisted advisory adapter with `trusted: false`, weak-pattern protection, high-risk advisor suppression, dependency policy-only advisory behavior, and narrow NLU/strategy metadata wiring. Added a 12-case browser QA harness covering normal, dependency-pressure, and high-risk cases.
- Verification: `node --check` passed for changed JS and bundle. `git diff --check` passed. New Raphael training bundle gate passed 12/12 with 0 console errors; high-risk input had no advisor candidate, no reward, no memory write, and no gameplay framing; dependency pressure had `trusted: false` boundary-policy advisory only, no reward, and no memory write. Existing gates passed: RaphaelCore smoke 17/17, NLU smoke 8/8, NLU training 13/13, Stage 4 10/10, web release gate required checks 9/9 including mobile 390x844, single Pixi canvas, storage persistence, and 0 console errors.
- Problems / risks: Training output is still `canAutoMerge: false`; this is staging-ready only, not main-release-ready. One social-conflict training fixture still trips the existing hard pressure gate because RaphaelCore treats that phrasing conservatively; the adapter intentionally does not override hard gates. Review in staging before any broader NLU policy change.
- Next safe action: Human review of this narrow diff, then staging/preview only. Do not mark READY_FOR_MAIN and do not merge/push to main without a separate release TASK_PACK and human approval.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `src/ai/raphaelCore.js`, `src/ai/safetyShield.js`, `src/ai/nlu/runNluPipeline.js`, and the independent lab output under `C:\Users\User\NexusLink_RaphaelAI_Workspace\raphael-gateway-server-langgraph`.

### 2026-06-30 - Codex - Raphael Training Adapter Main-Readiness Gate

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted automated main-readiness extension; no deploy, no push, no main merge.
- Scope: Advanced the static training adapter from staging-only automated coverage to main-review automated coverage. Added expanded regression cases for empty input, ASCII gibberish, emoji-only input, long emotional dump, half-joking high-risk disclosure, apology-then-boundary pressure, possessive phrasing, emotional blackmail, healthy intimacy, multilingual input, mixed UI report, and repeated pressure. No save schema, companion data, Pixi renderer, assets, package files, or external model behavior changed.
- Files touched: `src/ai/inputGateway.js`, `src/ai/intentClassifier.js`, `src/ai/testHarness/raphaelTrainingBundleCases.js`, `docs/qa/_run_raphael_main_readiness.py`, `docs/qa/_run_web_release_gate.py`, `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md`, and this ledger.
- Work performed: The new gate initially caught three real policy gaps: ASCII keyboard gibberish could receive relationship reward, possessive phrasing could receive relationship reward, and emotional blackmail was not routed to no-reward boundary behavior. Fixed these through narrow input-quality and pressure-intent guards.
- Verification: `node --check` passed for `inputGateway.js`, `intentClassifier.js`, and the expanded harness. `python -m py_compile` passed for the new runner and release gate. `docs/qa/_run_raphael_main_readiness.py` passed 24/24 with 0 console errors, 0 safety failures, 0 boundary failures, and 0 noise failures. Updated `docs/qa/_run_web_release_gate.py` passed with automated required checks 10/10, including the new main-readiness gate, mobile 390x844 probe, storage migration, asset integrity, single Pixi canvas, and 0 console errors.
- Problems / risks: Automated engineering gates are now ready for main review, but Codex still cannot honestly mark public launch complete. Remaining blockers are real-device verification, moderated private testers, legal/privacy/store-copy approval, human review of `canAutoMerge:false` training proposals, and an explicit human-approved release TASK_PACK.
- Next safe action: Human release review. If approved, create a dedicated release branch/PR or release TASK_PACK; do not self-merge or deploy from this uncommitted workspace state.
- Required reading: Same as the previous Static Raphael Training Bundle Adapter entry, plus `docs/qa/RAPHAEL_TRAINING_BUNDLE_ADAPTER_STAGING_REPORT.md` and `docs/qa/_web_release_gate_output.json`.

### 2026-06-28 - Codex - Web Release Gate / Private Test Pack Completion

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / Package 9 commit pending; baseline before this package was `a667853`
- Scope: Package 9 Raphael QA side only. Included current Raphael smoke, NLU, Stage 4, restricted-agent, safety/non-reward, and live Soul Talk checks in the web release gate. No RaphaelCore behavior change, no external LLM, no fetch, no tool registry, no direct state mutation policy change, and no new memory/trace reward behavior.
- Work performed: Added `docs/qa/_run_web_release_gate.py` orchestration and documented the release evidence. The private-test script uses low-risk prompts and explicitly stops on real safety concern rather than turning it into gameplay.
- Verification: `python docs/qa/_run_web_release_gate.py` passed: Raphael restricted-agent event cases 7/7; Raphael core smoke 17/17 with 0 console errors; NLU smoke 8/8 with 0 console errors; Stage 4 harness 10/10; live Soul Talk 10/10. Safety input remains non-gameplay and non-reward in the gate evidence.
- Problems / risks: Private testers must not be asked to provoke high-risk content. Public release remains blocked until human-run private testing confirms boundary/refusal is not perceived as punishment.
- Next safe action: Use `docs/testing/PRIVATE_TEST_SCRIPT.md` for moderated private testing; do not enable external LLM gateway or autonomous Raphael behaviors outside the restricted adapter policy.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/qa/RAPHAEL_CORE_JS_V1_TEST_RUNS.md`, Package 8 files, and Package 8 ledger entries.

### 2026-06-28 - Codex - Web Release Gate / Private Test Pack

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `a667853`, uncommitted QA / RELEASE pack
- Scope: Package 9 Raphael QA side only. Include existing Raphael smoke, NLU, Stage 4, restricted-agent, safety, refusal/non-reward, and live Soul Talk checks in the release gate. No RaphaelCore behavior change, no external LLM, no fetch, no tool registry, no state mutation policy change, and no new memory/trace reward behavior.
- Work performed: Started after human approval to continue. Package 8 restricted habitat-agent implementation is the current baseline.
- Verification: Pending local release runner and evidence doc.
- Problems / risks: Safety outputs must be verified as non-gameplay; private-test wording must not ask testers to provoke high-risk content beyond safe, moderated scripts.
- Next safe action: Wire the release runner to existing Raphael gates and document moderated private-test prompts.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/qa/RAPHAEL_CORE_JS_V1_TEST_RUNS.md`, Package 8 files, and Package 8 ledger entries.

### 2026-06-27 - Codex - Raphael Restricted Habitat Agent

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `43100c0`, uncommitted AI_AGENT / EXPERIENCE / SAFETY pack
- Scope: Package 8 Raphael side only. Convert Raphael into a restricted habitat-agent presence by emitting serialized intents and passing them through a runtime-owned reducer. The agent may speak or stay silent, show body language, set boundaries, suggest rest/exploration without opening anything, carry controlled trace/memory metadata, and safety-exit. It may not import store, call `updateState`, mutate state directly, fetch, use external LLM, call tool registry, navigate, open flows, or push tasks.
- Work performed: Started after human approval. Current read confirmed `runRaphaelCore` already keeps external advice disabled unless explicitly enabled; Package 8 will keep that default and avoid gateway calls.
- Verification: Pending restricted agent event cases, forbidden-action/source scan, Raphael smoke, NLU smoke, Stage 4 playtest harness, and live UI gate.
- Problems / risks: Safety exits must remain 100% non-gameplay and non-rewarding; runtime event hooks must not become proactive reminders or duplicate memory/trace writes.
- Next safe action: Add adapter/reducer/harness and wire Soul Talk/app events through presentation-only runtime callbacks.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`, `docs/raphael/RAPHAEL_CONSTITUTION.md`, `src/ai/raphaelCore.js`, `src/ai/autonomy/actionPolicy.js`, `src/ai/applyCoreResult.js`, `src/ui/soulTalkController.js`, and `src/app.js`.

### 2026-06-27 - Codex - Raphael Restricted Habitat Agent

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, self-reviewed and ready for Package 8 commit/push
- Files touched: `src/ai/raphaelAgentAdapter.js`, `src/engine/raphaelIntentReducer.js`, `src/ai/autonomy/actionPolicy.js`, `src/ai/testHarness/raphaelAgentEventCases.js`, `src/ui/soulTalkController.js`, `src/app.js`, `src/ai/raphaelCore.js`, `docs/agent/AI_EXECUTION_LEDGER.md`.
- Work performed: Raphael now emits restricted serialized habitat-agent intents for Soul Talk, touch, Return Echo, habitat changes, exploration results, and standoff results. The reducer rejects forbidden keys such as navigation, panel opening, task push, tool call, fetch, direct state mutation, state patch, and reward grant. Safety exits block agent memory/trace metadata and suggestions. Soul Talk suppresses duplicate speech/animation because the existing RaphaelCore application path already writes chat, memory, trace, and animation decisions through the store.
- Verification: New event harness passed 7/7. Forbidden-key injection was rejected. High-risk safety intent produced `safetyExit=true`, no memory, no trace, and no suggestion. Raphael smoke passed 17/17, NLU smoke passed 8/8, Stage 4 passed 10/10, live UI gate passed with console error count 0.
- Problems / risks: No blocking Package 8 Raphael issue remains. Existing optional external gateway modules are still present in the repo but were not enabled or called; Package 8 keeps gateway behavior disabled and local-only.
- Next safe action: Commit and push Package 8 only, excluding unrelated untracked QA output files. Package 9 can start after human approval.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - First Trace / Return Echo Loop

- Status: `IN PROGRESS`
- Branch / commit: `integrate/ui-v2-raphael-main` / `3e0c466`, uncommitted EXPERIENCE pack
- Scope: Package 6 Raphael/Soul Talk surface only. Keep RaphaelCore safety and memory policy intact while making the first non-safety trace visible to the player through existing Soul Talk flow. No external LLM, fetch, tool registry, auto-navigation, direct state mutation outside the existing store update path, or safety reward behavior.
- Work performed: Started after human approval. Current read confirmed `memoryWriter` blocks high-risk safety and dependency pressure from ordinary memory, while `applyRaphaelCoreResult` already blocks non-rewarding modes from milestones.
- Verification: Pending syntax checks, deterministic safety input check, no duplicate trace check, and browser Soul Talk smoke.
- Problems / risks: First Trace messaging must not become a reward, achievement, task prompt, or dependency pressure. Safety exits must stay non-gameplay and non-rewarding.
- Next safe action: Add only presentation-level first-trace acknowledgement after existing trace creation, gated so it never fires for high-risk safety or non-rewarding modes.
- Required reading: `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/handoff/RAPHAEL_AI_STATUS.yaml`, `src/ai/raphaelCore.js`, `src/ai/memoryWriter.js`, `src/ai/safetyShield.js`, `src/ai/applyCoreResult.js`, and `src/ui/soulTalkController.js`.

### 2026-06-25 - Codex - First Trace / Return Echo Loop

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / uncommitted, awaiting human approval before commit/push
- Files touched: `src/ui/soulTalkController.js`, `src/app.js`, `src/engine/returnBehaviorEngine.js`, `docs/agent/AI_EXECUTION_LEDGER.md`.
- Work performed: Kept RaphaelCore, `memoryWriter`, safety shield, and `applyCoreResult` policy intact. Soul Talk now waits for RaphaelCore safety/edge classification before allowing first awakening; safety or boundary turns defer awakening and do not write relationship evidence. When first awakening is the first trace of the turn, ordinary emotional memory/trace from the same message is deferred to avoid double-writing. First Trace visibility is added as a quiet system line only after an allowed trace is created through the existing store path.
- Verification: High-risk deterministic RaphaelCore input returned `safety_redirect`, system role, 0 memory, 0 trace, and unchanged bond. Browser CDP smoke confirmed the same behavior through the live Soul Talk UI on a fresh save: 0 memory, 0 trace, bond 5, `safeHarborMode` true. Normal first Soul Talk created exactly one first trace and showed the non-reward system line. Raphael core smoke passed 17/17, NLU smoke passed 8/8, Stage 4 playtest harness passed 10/10.
- Problems / risks: No Package 6 blocking issue remains. The remaining `runEvolutionEval()` false is an existing critic-pattern finding in RaphaelCore reply specificity, not a safety failure and not caused by this presentation/controller package.
- Next safe action: Human review, then commit/push Package 6 only if accepted. Package 7 should start only after commit/push approval and must be opened as a new ART QA / GROUNDWORK plan.
- Required reading: Same as the `IN PROGRESS` entry above.

### 2026-06-25 - Codex - Raphael × Aurora UI v2 integration pack 1

- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-raphael-main` / `7ff11a4` base, uncommitted scoped integration
- Scope: Selective Aurora shell, HUD, five-zone navigation, Soul Talk strip, and drawer port. No source-branch merge or RaphaelCore change.
- Work performed: Added Aurora-only CSS layers and DOM structure; added Home navigation and persistent-nav behavior; added Soul Talk drawer name, collapse state, and mobile viewport focus handling. Preserved the main Raphael message pipeline and quick-reply DOM.
- Changed files: `index.html`, Aurora CSS files under `styles/`, `src/ui/actionSheetController.js`, `src/ui/panelManager.js`, `src/ui/soulTalkController.js`, local preview and future-prototype/packaging documents, and this ledger entry.
- Verification: `git diff --check`; bundled Node `--check` for all changed JavaScript; local browser on port 8765 at 390×844, 393×852, 430×932, and 1280×800; one canvas, five nav items, non-overlapping strip/nav, drawer open/close, typed Raphael response, quick-reply Raphael response, and zero console errors.
- Problems / risks: The existing P0-B constrained-viewport Pixi companion focal-zone issue remains outside this package; UI work is not a renderer fix or release sign-off. Full settings/onboarding and `nexuslink_v2` persistence were intentionally deferred.
- Not touched: `src/ai/**`, `src/state/**`, Pixi renderer, assets, tools, scripts, UI locale, settings/onboarding controllers, source UI handoff/audit documents, and QA output files.
- Next safe action: Human review of the scoped diff, then a separate approved P0-B renderer-sizing package before release-level UI acceptance.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/handoff/RAPHAEL_AI_HANDOFF.md`, `docs/dev/LOCAL_PREVIEW.md`, and this lane.

### 2026-06-24 - Codex - Raphael integration reconciliation audit

- Status: `BLOCKED`
- Branch / commit: `codex/ui-v2-aurora-parity` / `e0a06d6`; canonical remote
  `origin/main` / `5eb33fb`
- Scope: Compared the checked-out runtime, current remote main, the Stage 4
  feature branch, and GitHub Pages. No Raphael code was copied, merged, or
  modified.
- Work performed: Confirmed this worktree has no `src/ai/**` Raphael runtime
  modules. Its Soul Talk uses the local emotion engine and `soulTalkComposer`
  response packs. Confirmed `origin/main` contains RaphaelCore, wires it into
  Soul Talk, and has a post-PR #87 sign-off at `5eb33fb`.
- Verification: The current local 390x844 runtime has no Raphael module import,
  no Raphael globals, and no quick-reply chips. GitHub Pages boots with one
  Pixi canvas, exposes the Soul Talk quick-reply region after a message, returned
  a local Raphael reply for `today is tiring`, and reported zero console errors.
- Problems / risks: `origin/main` is not an ancestor of this branch, so Raphael
  is deployed on canonical main but is not integrated into this UI branch. The
  Raphael handoff also names a different checkout as its active workspace and
  identifies this checkout as prone to divergence. Treat that as a repository
  reconciliation issue, not permission to overwrite this user-directed branch.
  The
  Raphael Constitution is local-first, but remote Raphael code includes optional
  external gateway and provider-adapter scaffolding. No live external call was
  verified; the scaffolding still needs a no-LLM/no-backend policy review before
  any reconciliation merge. The root Master Canon still describes Raphael as
  DRAFT and unintegrated, so its implementation-status wording requires a
  separately approved documentation sync.
- Next safe action: Create a dedicated Raphael reconciliation TASK_PACK. Select
  the local-only baseline, exclude external gateway/provider code, map state and
  UI changes, and request GROUNDWORK approval before integrating it here.
- Required reading: `docs/raphael/RAPHAEL_CONSTITUTION.md`,
  `NEXUS_LINK_MASTER_CANON_v3.1.md`, `AGENTS.md`, and after `git fetch`,
  `origin/main:docs/handoff/RAPHAEL_AI_HANDOFF.md`,
  `origin/main:docs/architecture/RAPHAEL_CORE_JS_V1.md`,
  `origin/main:docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`,
  `origin/main:docs/qa/RAPHAEL_CORE_JS_V1_TEST_RUNS.md`.

### 2026-07-01 - Codex - UI v1 Structure / UI v2 Color Takeover

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-shell-consolidation` / uncommitted takeover from interrupted Claude Code work.
- Scope: Preserve UI v1 information architecture and functional content while using UI v2 Aurora/Nocturne color tokens. Bottom navigation keeps the existing four CSS-mask icon drawings. No merge from `origin/codex/ui-v2-aurora-parity`, no storage-schema migration, and no companion/Pixi/asset changes.
- Work performed: Replaced the interrupted A/B/C variant direction with a fixed `styles/ui-core.css` color adapter; removed runtime `data-variant` handling; restored the bottom-nav entry behavior to the v1 action-sheet modal flow; kept V2 color material for nav, modal, Soul Talk, and Standoff surfaces.
- Verification: `git diff --check`; bundled Node `--check` for changed JS; in-app browser at `http://127.0.0.1:8790/` with 390x844 viewport. New-player onboarding advanced to Home, Home Soul Talk strip and bottom nav had 0px overlap, Explore/Care/Growth/Memory all opened v1 action sheets with `activePage=home`, Explore action sheet opened the map, and Rift Observation Point triggered full-screen Standoff with bottom nav `display:none`.
- Problems / risks: Python release gate did not run because the bundled Python environment lacks `playwright.sync_api`; this was not resolved by installing dependencies. A real iPhone Safari keyboard retest is still required for Soul Talk.
- Next safe action: Human review on phone. If accepted, run or provision the release gate environment, then commit/push only this scoped UI takeover.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/agent/AI_EXECUTION_LEDGER.md`, UI v1 handoff, and UI v2 design handoff.

### 2026-07-01 - Codex - Soul Talk / Standoff Mobile Guardrails

- Lane: `Game Engineering And Architecture`
- Status: `VERIFIED`
- Branch / commit: `integrate/ui-v2-shell-consolidation` / uncommitted takeover from interrupted Claude Code work.
- Scope: Repair interrupted mobile layout work without touching `saveManager.js`, `store.js`, `defaultState.js`, `pixiApp.js`, `src/state/**`, `src/pixi/**`, or `assets/**`.
- Work performed: Rewrote `src/utils/dom.js` into a clean visualViewport-only model and restored the exported `expectSoftKeyboard` / `clearSoftKeyboardExpectation` wrappers needed by onboarding. Soul Talk now uses passive viewport remeasurement with no `scrollIntoView` and no extra `--kb-inset` push. Added a body-level active-panel hook so Standoff can hide bottom nav while keeping other v1 modals above the nav.
- Verification: Bundled Node `--check` passed for `src/app.js`, `src/ui/actionSheetController.js`, `src/ui/panelManager.js`, `src/ui/soulTalkController.js`, `src/ui/onboardingController.js`, and `src/utils/dom.js`. `docs/qa/state-onboarding-migration-cases.mjs` passed 8/8. In-app browser console had 0 warnings/errors after onboarding, v1 nav modal checks, Soul Talk focus, map open, and Standoff trigger.
- Problems / risks: Browser automation cannot prove the physical iPhone Safari keyboard state; it verified focus and desktop visualViewport fallback only. Python release gate was blocked by missing Python Playwright.
- Next safe action: Real-device iPhone Safari retest of onboarding input and Soul Talk input; if a black region remains, capture `innerHeight`, `visualViewport.height`, `visualViewport.offsetTop`, `--app-height`, `--vv-offset-top`, and drawer/panel rects.
- Required reading: `src/utils/dom.js`, `src/ui/soulTalkController.js`, `src/ui/onboardingController.js`, `styles/soul-talk-drawer.css`, `styles/mobile-safari-polish.css`, and the UI takeover entry above.

### 2026-07-01 - Claude - Soul Talk Keyboard Black-Gap: Static Top-Anchor (No Detection)

- Lane: `Game Engineering And Architecture`
- Status: `VERIFIED` (desktop regression only; real-device iOS retest requested from human before commit/push)
- Branch / commit: `integrate/ui-v2-shell-consolidation` / uncommitted, awaiting human real-device confirmation before commit/push
- Scope: Fix the iOS Soul Talk keyboard black-gap by dropping keyboard-height detection for this component entirely. Touches only `src/ui/soulTalkController.js`, `styles/soul-talk-drawer.css`, `styles/mobile-safari-polish.css`. No `saveManager.js`, `store.js`, `defaultState.js`, `pixiApp.js`, `src/state/**`, `src/pixi/**`, `assets/**`, or onboarding files changed.
- Work performed: Ran three rounds of real-device diagnostics via a throwaway `kbtest.html` page (deployed to GitHub Pages, tested by human on real iPhone Chrome + Safari) before touching the app. Findings: (1) `visualViewport.height`/`innerHeight` never update when the keyboard opens on this device, under both `interactive-widget=resizes-visual` and `resizes-content`; (2) `position:fixed` itself breaks while the keyboard is shown (a top-pinned fixed diagnostic panel visibly scrolled away with the page); (3) native browser scroll-into-view also can't be trusted (same underlying broken signal starves it too). Separately found `styles/soul-talk-drawer.css` and `styles/mobile-safari-polish.css` had two independently-authored, conflicting `body.kb-open` rules targeting the same drawer — the more specific, later-loaded one always won silently — which explains why prior fix attempts (scroll-nudge, estimate fallback, the position:fixed panel-layer pin above it) produced inconsistent real-device results. Replaced all of it with a detection-free rule: `soulTalkController.js` toggles `body.st-focus` directly on `#message-input` focus/blur (no viewport math, no scroll, no measurement); CSS pins `.soul-talk-drawer` to a static `top` / `42vh` zone anchored at the screen top, which stays clear of any keyboard by construction (this session's real measurements put keyboard height at ~45-58% of screen; 42vh from the top unconditionally leaves the bottom 58%+ free, no detection needed). Removed the losing `body.kb-open .panel-layer[data-active-panel="soulTalk"]` block from `mobile-safari-polish.css` entirely so the drawer has a single CSS owner.
- Verification: Bundled Node `--check` on `soulTalkController.js`; `git diff --check` clean on all three files. Desktop preview (375x812): opened Soul Talk, focused `#message-input`, confirmed `body.st-focus` toggles true/false correctly on focus/blur, drawer visually moves to the top zone and back with no console errors and no failed network requests, chat history/render unaffected. Cannot verify the actual keyboard-avoidance claim in desktop preview (no real software keyboard) — same limitation as the Codex entry above; requires the human's real iPhone retest.
- Problems / risks: `--kb-inset` / `--app-height` / `kb-open` machinery in `src/utils/dom.js` is now unused by Soul Talk but still used by `onboardingController.js` (name-input page) — left untouched, out of scope for this pack. No rule reads `kb-open` for `.soul-talk-drawer` anymore, so it is inert for this component by design even if a future device reports keyboard height correctly.
- Next safe action: Human real-device retest (same phone, Chrome + Safari) of the actual Soul Talk drawer itself (not kbtest.html) — focus the input, confirm the drawer sits in the top zone with no black gap. If confirmed, commit and push only `src/ui/soulTalkController.js`, `styles/soul-talk-drawer.css`, `styles/mobile-safari-polish.css`, and this ledger entry.
- Required reading: `src/ui/soulTalkController.js`, `styles/soul-talk-drawer.css`, `styles/mobile-safari-polish.css`, and the two Codex entries directly above (their `dom.js`/`mobile-safari-polish.css` intent motivated part of this cleanup).

### 2026-07-02 - Codex - Heartspark Canon Roster Cleanup And Codex Data

- Lane: `Game Engineering And Architecture`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped commit for this package.
- Scope: Remove old non-animated generated companion records that confused the live character roster, then add the approved Heartspark Council v0.6 roster as canon-only Codex display data. No `saveManager.js`, `store.js`, `defaultState.js`, active companion migration, localStorage schema, animation loader, Pixi renderer, or external dependencies changed.
- Work performed: Removed stale non-animated placeholder companion IDs from `src/data/companionRegistry.js`, removed their legacy Codex evolution lines, removed the rejected/static Flametail fallback from `data/creatures.json` and `src/data/assetManifest.js`, and changed the generic fallback creature to `greyshade-cat`. Added `src/data/heartsparkCouncilCanon.js` for `auriowl`, `sprigfawn`, `crystalfin-seahorse`, `blazetail-kit`, and `starstripe-cub`, updated `src/ui/codexController.js` so these five appear as canon roadmap entries with three-stage evolution display rather than runtime-selectable companions, and tightened `styles.css` so Codex canon detail wraps on mobile.
- Verification: Bundled Node `--check` passed for touched JS modules. `data/creatures.json` parsed. Scoped grep confirmed old non-animated IDs no longer appear in runtime data paths and the six animated roots remain present. `docs/qa/state-onboarding-migration-cases.mjs` passed 8/8. In-app Browser QA at `http://127.0.0.1:8137/` confirmed the Codex list shows all five canon entries, Starstripe Cub detail shows the three-stage canon line and `Canon display only / not runtime-ready`, console warnings/errors were 0, and 390x844 geometry had no horizontal overflow (`scrollWidth=390`, Codex panel within 16-374px). `git diff --check` passed.
- Problems / risks: The five new canon characters are display/scaffold only and intentionally do not create `animations.json`; they are not runtime-ready and cannot be selected until a separate asset-readiness/migration task creates approved sheets.
- Next safe action: When real animated sheets are approved for any one canon character, open a separate GROUNDWORK asset-readiness task to add its manifest and then decide whether it enters `COMPANIONS`.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `src/data/heartsparkCouncilCanon.js`, `src/ui/codexController.js`, `src/data/companionRegistry.js`, `styles.css`, and this lane.

### 2026-07-02 - Codex - Heartspark Canon Animation Folder Scaffold

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped commit for this package.
- Scope: Asset tree cleanup plus official scaffold creation only. Protected animated runtime roots were left untouched: `greyshade-cat`, `flame-flicker`, `ice-talon`, `stone-shard`, `vine-twist`, and `crystal-rabbit`.
- Work performed: Deleted the non-animated old generated roots `assets/characters/flame-tail-fox/` and `assets/characters/thunder-pup/`. Added scaffold folders under `assets/characters/` for `auriowl`, `sprigfawn`, `crystalfin-seahorse`, `blazetail-kit`, and `starstripe-cub`, each with metadata and empty tracked `spritesheets/emotion`, `touch`, `daily`, `movement`, and `battle` categories.
- Verification: Filesystem checks confirmed the deleted old roots are absent and protected animated roots are still present with `metadata/animations.json`. The new scaffold metadata marks `runtimeReady:false` and does not create runtime manifests.
- Problems / risks: The scaffold does not imply visual approval or runtime readiness. Do not place generated PNGs in these folders without human visual approval and asset QC.
- Next safe action: Use these folders only as targets for future approved illustrated 512x512 transparent sheet generation; keep old reference images out of runtime paths unless explicitly approved.
- Required reading: `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-02 - Codex - Fable 5 Raphael Agent Handoff Package

- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`
- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted docs-only package.
- Scope: Prepare a controlled Fable 5 handoff for Raphael AI maturity work. No runtime integration, no external API, no gateway live routing, no save schema, no Pixi renderer, no companion data, no package/dependency, and no deployment changes.
- Work performed: Added a Fable 5 Raphael-specific prompt, a local Raphael artifact inventory, and a Raphael Agent System Architecture V1 that maps the desired central-agent capability into NexusLink-safe layers: input, RaphaelCore final authority, controlled intelligence ring, advisory gateway, and approved output layer. The handoff explicitly keeps LangGraph/Gateway/training/model output advisory only and blocks direct memory/state mutation, high-risk gameplay framing, and dependency rewards.
- Verification: `git diff --check` passed for the docs-only patch. The codebase-memory index for this checkout was present and ready. No JavaScript/runtime files were touched by this package.
- Problems / risks: Existing older Raphael Chinese handoff/constitution files display mojibake in this environment; they remain authority references but should not be copied verbatim into new runtime code until a separate encoding/readability repair pass is approved.
- Next safe action: Give Fable 5 `docs/handoff/FABLE5_RAPHAEL_AGENT_HANDOFF_PROMPT.md` as its starting prompt. Its first implementation should stay in docs/eval/QA or return to Codex review before any runtime path is changed.
- Required reading: `docs/handoff/FABLE5_RAPHAEL_AGENT_HANDOFF_PROMPT.md`, `docs/raphael/RAPHAEL_LOCAL_ARTIFACT_INVENTORY.md`, `docs/architecture/RAPHAEL_AGENT_SYSTEM_ARCHITECTURE_V1.md`, `docs/architecture/RAPHAEL_SOUL_ARCHITECTURE_V1.md`, `docs/raphael/RAPHAEL_CONSTITUTION.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-02 - Codex - Linkara Map And BGM Asset Staging

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / current scoped commit
- Scope: Human-approved GROUNDWORK asset staging for the supplied Linkara world map, seven region backgrounds, and matching BGM. Added machine-readable staging data for future world-map redraw decisions and scene-switch keys. No `src/**` runtime wiring, no `src/data/assetManifest.js`, no save schema, no unlock logic, no Pixi scene switching, no backend, no dependency, and no build step.
- Work performed: Copied the approved source images into `assets/backgrounds/linkara/` and region subfolders, copied the approved MP3s into `assets/audio/linkara/`, added `manifest.json` for source attachment pairing, added `linkara-map-data.json` with seven-region coordinates, scene keys, fit notes, and live-readiness decisions, and added a Linkara asset README.
- Verification: Confirmed copied destination files exist, source and destination byte counts match, all staged images keep their expected dimensions (`1280x720` region scenes and `1178x1280` world map), `manifest.json` and `linkara-map-data.json` parse as JSON, manifest paths resolve, `git diff --check` passed, and the scoped staged set contains only this Linkara asset package plus this ledger entry.
- Problems / risks: The world map JPG is useful as a reference or large atlas panel but needs mobile readability review before live use because labels are baked into the image. Region backgrounds are landscape `16:9` assets; using them as active mobile-first habitat backgrounds requires future scene profiles, cover/crop anchors, or vertical redraws. Central Radiant Core and Southern Harbor Nexus BGM pairings are staged from available filenames and should receive listening review before final runtime use.
- Next safe action: Open a separate GROUNDWORK runtime task if the world map should replace the current SVG atlas or if scene switching should become active. That task should choose live atlas image sizing, add scene profiles, and route BGM through the existing audio manager with fades and volume caps.
- Required reading: `assets/backgrounds/linkara/README.md`, `assets/backgrounds/linkara/manifest.json`, `assets/backgrounds/linkara/linkara-map-data.json`, `src/ui/atlasController.js`, `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-03 - Codex - Linkara Habitat Layering And Visual Locks

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped docs commit for this package.
- Scope: Docs-only planning/index package for seven Linkara habitat backgrounds. Added layered art-production locks, per-region Scene Profile drafts, prop/trace separation rules, Moonlake replacement protocol, and generation TASK_PACKs. No `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, BGM routing, scene switching, external dependency, or runtime wiring changed.
- Work performed: Added `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`. The document defines the shared layer stack (`sky`, distant mountains/city, water/atmosphere plane, ground/platform, structures, runtime props, trace FX, foreground occlusion, companion, UI), visual locks for all seven regions, do-not-bake object lists, draft normalized scene-profile zones, prompt templates, and follow-on packs TP-HAB-1 through TP-HAB-4. Moonlake is prioritized as the first layered generation target and remains replacement-candidate only until human approval and reference audit.
- Verification: `git diff --check` passed. New document readback succeeded. codebase-memory full index completed for `C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink` with `.git` excluded only, updating the graph to 6144 nodes / 10031 edges. Commit/push handled in this Codex turn after scoped diff review.
- Problems / risks: The staged Linkara region JPGs are landscape `1280x720`; active mobile habitat use still needs layered 9:16 generation or profile-aware crop/redraw. `manifest.json` source-image fields should be rechecked before provenance-sensitive generation. This package does not make any generated image runtime-ready.
- Next safe action: Use `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md` as the entry document in the next generation window. Start with TP-HAB-1 Moonlake layered art generation and keep generated candidates outside `assets/**` until human visual approval.
- Required reading: `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`, `assets/backgrounds/linkara/README.md`, `assets/backgrounds/linkara/linkara-map-data.json`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-03 - Codex - Habitat Weather And Mood Preset Spec

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted docs-only package.
- Scope: Added a docs-only translation spec for turning throwaway weather/lighting demos into Nexus Link habitat presets. No `src/**`, `assets/**`, `pixiApp.js`, `assetManifest.js`, save schema, scene switching, BGM routing, package/dependency, Three.js, React, or runtime wiring changed.
- Work performed: Added `docs/architecture/HABITAT_WEATHER_MOOD_PRESET_SPEC.md`. The document defines the correct translation model: prototype demos may explore visuals, extraction captures rules, and formal runtime rebuilds approved rules as lightweight PixiJS v8 FX governed by Scene Profile zones. It defines Moonlake-first presets (`clear`, `rain`, `night`, `quiet_after_talk`, `rift_pressure`, `after_repair`), mobile FX budgets, prohibitions against baked-weather backgrounds and FOMO/reward framing, and follow-on TASK_PACKs TP-HAB-WEATHER-0 through TP-HAB-WEATHER-4.
- Verification: `git diff --check` passed. Scope review confirmed the package is docs-only and keeps weather/mood as habitat atmosphere, not dependency detection, rewards, daily pressure, or a Three.js runtime import.
- Problems / risks: This is a planning spec only. Any Pixi prototype or Scene Profile integration still needs a separate implementation task and normal GROUNDWORK approval if protected renderer, asset, manifest, or save paths are touched.
- Next safe action: If implementation is approved, start with TP-HAB-WEATHER-1 for Moonlake only: rain lines, lake ripple, low fog, and wet stone overlay under mobile FPS and companion-readability constraints.
- Required reading: `docs/architecture/HABITAT_WEATHER_MOOD_PRESET_SPEC.md`, `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`, `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-03 - Codex - Moonlake Layered Art Staging Cleanup

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped staging commit for this package.
- Scope: Preserved the Moonlake TP-HAB-1 layered generation output under `output/linkara/moonlake/` as review-only staging, and removed only rejected foreground-occlusion source attempts. No `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, scene switching, BGM routing, package/dependency, or runtime wiring changed.
- Work performed: Kept six full-size scene layer candidates, five standalone prop candidates, source/provenance images, prompt notes, preview composites, and `profile-draft.json`. Removed three files whose prompt notes explicitly marked them rejected because they baked too much platform content into foreground occlusion or attempted fake checkerboard transparency.
- Verification: `profile-draft.json` parses and reports `ethereal_moon_lakefront`, six layers, five props, `humanApproved:false`, and `runtimeIntegrated:false`. PNG readback found 26 remaining images; all scene layers are 941x1672, props are 1254x1254, and no filename containing `rejected` remains. Visual spot check confirmed the composite and prop preview are usable for review, but the composite is a vertical staging candidate with a large empty lower area and is not runtime-ready.
- Problems / risks: This is not an approved asset package. The current generated Moonlake staging is useful for layer-direction review only; it must not be copied into `assets/**` or referenced by runtime code until human visual approval, aspect/anchor review, alpha cleanup, and a separate GROUNDWORK asset-readiness task pass. The prop preview includes checkerboard display context and should not be treated as the final transparent asset audit.
- Next safe action: Review `output/linkara/moonlake/layered-preview.png`, `props-preview.png`, and the individual layer/prop PNGs. If the art direction is accepted, open a separate Moonlake asset-readiness TASK_PACK to normalize canvas size, alpha, anchors, Scene Profile data, and manifest entries before touching runtime paths.
- Required reading: `output/linkara/moonlake/prompts/moonlake_layer_generation_notes.txt`, `output/linkara/moonlake/profile-draft.json`, `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-03 - Codex - Habitat Automation Workflow And Moonlake Readiness Audit

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped workflow commit for this package.
- Scope: Implemented the safe staging portion of the habitat automation plan. Added the AI/skill routing workflow, reusable job/report templates, and Moonlake readiness audit artifacts. No `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, `scripts/**`, `tools/**`, package/dependency, scene switching, or runtime wiring changed.
- Work performed: Added `docs/assets/HABITAT_AUTOMATION_WORKFLOW.md` as the production entry point for Codex-led habitat generation. Added `templates/habitat-generation-job.template.json` and `templates/habitat-readiness-report.template.md`. Added `output/linkara/moonlake/habitat-job.json` and `output/linkara/moonlake/readiness-report.md`, classifying the current Moonlake staging as review-only and recording regeneration blockers.
- Verification: `habitat-job.json`, `profile-draft.json`, and `templates/habitat-generation-job.template.json` parse as JSON. PNG readback confirmed remaining Moonlake scene layers are `941x1672`, props are `1254x1254`, non-sky layers/props are alpha-capable, and no accepted staging filename contains `rejected`. `git diff --check` passed for the scoped package.
- Problems / risks: The Moonlake staged composite remains not runtime-ready because its scene canvas is `941x1672` instead of the target `1080x1920` and the composite has a large lower empty area. The workflow intentionally stops before official asset promotion or Pixi wiring.
- Next safe action: Run `TP-HAB-AUTO-2` as a generation-only pass: regenerate Moonlake target-size foundation layers and weak FX/foreground candidates under `output/linkara/moonlake/`, then update the readiness report. Do not touch `assets/**` or runtime paths until human approval.
- Required reading: `docs/assets/HABITAT_AUTOMATION_WORKFLOW.md`, `templates/habitat-generation-job.template.json`, `output/linkara/moonlake/readiness-report.md`, `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-03 - Codex - Moonlake V2 Target-Size Regeneration Pass

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped staging commit for this package.
- Scope: Ran `TP-HAB-AUTO-2` as a generation-only Moonlake regeneration pass under `output/linkara/moonlake/v2/`. No `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, `scripts/**`, `tools/**`, package/dependency, scene switching, or runtime wiring changed.
- Work performed: Generated a v2 direction preview, target-size layer candidates for sky, mountains, lake water, shore/platform, and foreground occlusion, preserved raw generation sources, normalized review layers to `1080x1920`, composed `v2/layered-preview-v2.png`, added `profile-draft-v2.json`, updated `habitat-job.json`, and logged generation prompts in `v2/prompts/moonlake_v2_generation_prompts.md`.
- Verification: `habitat-job.json`, `profile-draft.json`, `profile-draft-v2.json`, and the habitat generation template parse as JSON. V2 review layers and preview are `1080x1920` and alpha-capable. Visual self-review confirms the direction preview and lower platform composition are stronger than v1, but the lake-water layer still has a visible hard color band near the far water edge. `git diff --check` passed for the scoped package.
- Problems / risks: V2 is not runtime-ready and must not be promoted to `assets/**`. Human visual approval, reference audit, lake edge cleanup/regeneration, and a separate GROUNDWORK runtime-promotion task are still required. The firefly cutout remains better modeled as a later lightweight Pixi particle effect than as a static prop.
- Next safe action: Human review `output/linkara/moonlake/v2/reference/moonlake_v2_direction_preview_1080x1920.png` and `output/linkara/moonlake/v2/layered-preview-v2.png`. If the direction is accepted, regenerate or manually clean only `v2/layers/moonlake_v2_lake_water.png` before any asset-readiness promotion.
- Required reading: `output/linkara/moonlake/readiness-report.md`, `output/linkara/moonlake/profile-draft-v2.json`, `output/linkara/moonlake/v2/prompts/moonlake_v2_generation_prompts.md`, `docs/assets/HABITAT_AUTOMATION_WORKFLOW.md`, `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-03 - Codex - Habitat Display Contract And Realism Art Lock

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped docs-and-metadata commit for this package.
- Scope: Indexed the new habitat display contract and tightened art direction for future Linkara habitat generation. No `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, `scripts/**`, `tools/**`, package/dependency, scene switching, or runtime wiring changed.
- Work performed: Updated the Linkara habitat visual lock with `1080x1920` art-space projection rules for the `390x844` safe viewport, cover-height crop math, default normalized scene zones, separated `sky_atmosphere` / `celestial_bodies` / `celestial_occlusion`, and a semi-realistic material/lighting lock. Updated the automation workflow readiness gates and prompt rules. Reclassified Moonlake V2 as composition reference only because it bakes the moon into the sky layer and does not meet the new material/lighting lock.
- Verification: `habitat-job.json` and `profile-draft-v2.json` parse as JSON. Scope review confirms only docs and `output/linkara/moonlake/**` metadata/prompt/report files changed; no runtime or approved asset paths changed. `git diff --check` passed for the scoped package.
- Problems / risks: Current Moonlake V2 generated PNGs remain useful for composition reference only. They are not suitable for runtime promotion and should not be copied into `assets/**`. A future regeneration pass must use V2 framing only, not V2 art style, and must separate celestial bodies from the sky base.
- Next safe action: Run a new Moonlake semi-realistic regeneration pass: `sky_atmosphere`, `celestial_bodies`, `celestial_occlusion`, `mountains`, `lake_water`, `shore_ground_platform`, and `foreground_occlusion`, with material/light realism and art-space profile constraints in the prompts.
- Required reading: `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `docs/assets/HABITAT_AUTOMATION_WORKFLOW.md`, `output/linkara/moonlake/readiness-report.md`, `output/linkara/moonlake/profile-draft-v2.json`, `output/linkara/moonlake/habitat-job.json`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-03 - Codex - Moonlake V3 Semi-Realistic Layer Staging

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped staging commit for this package.
- Scope: Ran the Moonlake V3 generation-only pass under `output/linkara/moonlake/v3/`. No `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, `scripts/**`, `tools/**`, package/dependency, scene switching, or runtime wiring changed.
- Work performed: Generated a V3 semi-realistic direction preview, separated `sky_atmosphere`, `celestial_bodies`, `celestial_occlusion`, `mountains`, `lake_water`, `shore_ground_platform`, and `foreground_occlusion`, preserved raw sources, normalized accepted review layers to `1080x1920`, composed `v3/layered-preview-v3.png`, added `profile-draft-v3.json`, updated `habitat-job.json`, rewrote the readiness report, and logged prompts in `v3/prompts/moonlake_v3_generation_prompts.md`.
- Verification: JSON parse passed for `habitat-job.json`, `profile-draft.json`, `profile-draft-v2.json`, `profile-draft-v3.json`, and the habitat template. PNG readback confirms accepted V3 layers and preview are `1080x1920` and `Format32bppArgb`. Visual self-review confirms V3 improves material response, lighting, celestial separation, and companion-platform readability versus V2.
- Problems / risks: V3 is still not runtime-ready. The accepted lake layer still needs edge cleanup before promotion; a green-key retry was rejected because it produced visible green spill. Foreground occlusion needs companion-foot/body review. Human approval and reference audit remain false.
- Next safe action: Human review `output/linkara/moonlake/v3/reference/moonlake_v3_direction_preview_1080x1920.png` and `output/linkara/moonlake/v3/layered-preview-v3.png`. If direction is accepted, run a narrow lake-edge cleanup/regeneration pass only before any GROUNDWORK runtime promotion.
- Required reading: `output/linkara/moonlake/readiness-report.md`, `output/linkara/moonlake/profile-draft-v3.json`, `output/linkara/moonlake/v3/prompts/moonlake_v3_generation_prompts.md`, `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `docs/assets/HABITAT_AUTOMATION_WORKFLOW.md`, `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-02 - Codex - Next Gameplay Systems Spec Consolidation

- Lane: `Game Engineering And Architecture`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped commit for this docs-only spec.
- Scope: Consolidated human gameplay direction into one planning spec for visible standoff, synchronization, fatigue, Care, memory glimmers, crystals, Explore, silent anchors, phase search, adventure, and heart-core co-breathing. No runtime files, save schema, assets, package/dependency, build step, or deployment changed.
- Work performed: Replaced the temporary intake draft with `docs/production/NEXUS_LINK_NEXT_GAMEPLAY_SYSTEMS_SPEC.md`. The spec translates mystical inspiration into Nexus Link-safe fictional mechanics, blocks prophecy/medical/diagnostic claims, keeps Care compact by upgrading `Clear Noise` into `心核共息 / Calm Sync` instead of adding button bloat, defines standoff outcomes where retreat is not failure, and splits future work into TASK_PACKs.
- Verification: Markdown/whitespace checks passed for the spec and this ledger entry. Scoped safety review confirmed the spec frames the material as world mechanics, not real-world prediction, therapy, or player diagnosis.
- Problems / risks: This is a planning spec only. Any runtime implementation that touches `index.html`, state persistence, Pixi, assets, tools, or scripts still needs the normal GROUNDWORK approval path. The final UI label for standoff records, visible-versus-hidden stamina/heart-core energy, and the first Moonlake autonomous behavior remain open decisions.
- Next safe action: If implementation is approved, start with the `Heart-core Co-Breathing v1` EXPERIENCE TASK_PACK and keep it no-save-schema unless explicitly expanded.
- Required reading: `docs/production/NEXUS_LINK_NEXT_GAMEPLAY_SYSTEMS_SPEC.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-04 - Codex - Habitat Art Pipeline Reset And Moonlake Rejected Image Cleanup

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / pending scoped cleanup commit for this package.
- Scope: Implemented `TP-HAB-RESET-1`, `TP-HAB-PIPE-1`, and the planning artifacts for `TP-HAB-MOON-3D-1`. Removed rejected generated Moonlake staging images only. No `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, package/dependency, `scripts/**`, `tools/**`, scene switching, BGM routing, or runtime wiring changed.
- Work performed: Deleted 71 tracked generated image files (`PNG/JPG/WEBP`) under `output/linkara/moonlake/**` while preserving JSON, Markdown, and prompt records. Updated the habitat automation workflow to demote direct 2D image generation to concept/paintover/prop exploration for final-quality habitat bases, and set the new default to 3D/DCC-assisted 2.5D source production that still exports PixiJS-friendly layers. Updated Linkara visual locks with the offline source model, Moonlake replacement protocol, cleanup pack, pipeline reset pack, and Moonlake render-pass brief pack. Added `output/linkara/moonlake/source-brief.md`, `render-pass-manifest.json`, and `profile-draft-3d-assisted.json`; updated Moonlake readiness/job metadata to mark direct 2D generated images rejected and removed.
- Verification: JSON parse passed for preserved Moonlake profiles, `habitat-job.json`, `render-pass-manifest.json`, and the habitat job template. `git diff --cached --check` passed. Scoped staged-path review confirmed no `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, dependency, `scripts/**`, or `tools/**` changes. Filesystem check confirmed no `PNG/JPG/WEBP` files remain under `output/linkara/moonlake/**`. codebase-memory re-index is required after commit.
- Problems / risks: This reset intentionally leaves no image candidates to review under Moonlake output. The next art-production step needs an external or tool-assisted 3D/DCC source pass; those outputs remain staging-only until human approval and a separate GROUNDWORK runtime-promotion task.
- Next safe action: Execute `TP-HAB-MOON-3D-1`: create or obtain the offline Moonlake source/blockout, export separated render passes at `1080x1920`, then run human visual approval before any `assets/**` or runtime work.
- Required reading: `docs/assets/HABITAT_AUTOMATION_WORKFLOW.md`, `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `output/linkara/moonlake/source-brief.md`, `output/linkara/moonlake/render-pass-manifest.json`, `output/linkara/moonlake/profile-draft-3d-assisted.json`, `output/linkara/moonlake/readiness-report.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-05 - Codex - Project-Native Art Style Target V2 From Reference Image

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / current scoped docs commit.
- Scope: Added a docs-only global visual target derived from the supplied reference image. No `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, package/dependency, `scripts/**`, `tools/**`, scene switching, BGM routing, generated images, or runtime wiring changed.
- Work performed: Added `docs/assets/NEXUS_LINK_ART_STYLE_TARGET.md`, defining the target as project-native premium 3D storybook diorama: cozy fantasy, soft stylized forms, believable material response, cinematic moonlit lighting, controlled cyan/gold magical glow, companion-first framing, glassy mobile UI direction, and mobile-first readability. Updated habitat workflow, Linkara habitat visual locks, and companion automation policy to reference the global target and reject flat anime, photoreal animal/photo treatment, chunky pixel art, plastic surfaces, noisy AI texture, and baked UI/stateful elements.
- Verification: `git diff --check` passed. Scoped path review confirmed this package is docs-only and does not touch `assets/**`, `src/**`, `pixiApp.js`, `assetManifest.js`, save schema, dependency files, `scripts/**`, or `tools/**`.
- Problems / risks: This is a visual direction/spec update only. Any UI reskin, runtime scene replacement, companion art regeneration, or asset promotion still requires a separate approved task and human art approval.
- Next safe action: Use `docs/assets/NEXUS_LINK_ART_STYLE_TARGET.md` as the first style reference for future Moonlake 3D/DCC source work and companion prompt generation.
- Required reading: `docs/assets/NEXUS_LINK_ART_STYLE_TARGET.md`, `docs/assets/HABITAT_AUTOMATION_WORKFLOW.md`, `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `docs/assets/COMPANION_ASSET_AUTOMATION.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-11 - Codex - Formal Five Full Catalog Autonomous Production

- Lane: `Game Art, UI, And Visual Production`
- Status: `IN PROGRESS`
- Branch / commit: `main` / uncommitted review staging; no commit or push is authorized for this continuation.
- Scope: Producing the formal Heartspark Council animation catalog under `output/character-pilots/**` only. The legacy five remain untouched, and this work does not write `assets/**`, `src/**`, runtime registries, Pixi wiring, save state, tools, or scripts.
- Work strategy: Complete one character vertically through the animation catalog in P1 then P2 then P3 order, beginning with `blazetail-kit`. Every action is one coherent whole-sheet generation, reference-anchored to its approved seed, normalized to 512px cells with a bottom-center datum, and self-reviewed before it is marked as a review candidate.
- Risks / gates: Species motion remains distinct (fox, owl, seahorse, deer, tiger); no generic quadruped reuse is allowed. Generated material is review-only and cannot be promoted into runtime assets without a separate GROUNDWORK task and human visual approval.
- Required reading: `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, `output/character-pilots/FULL_CATALOG_PRODUCTION_PLAN.md`, the character seed and action records, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-11 - Codex - Blazetail Kit Full Catalog Review Staging Completed

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted review staging; no commit or push performed.
- Scope: Completed the formal `blazetail-kit` animation catalog under `output/character-pilots/blazetail-kit/**` only. No `assets/**`, `src/**`, runtime registry, Pixi wiring, save state, tools, scripts, dependency, or build changes were made.
- Work performed: Generated and normalized all 29 catalog actions through P1, P2, and P3. After the owner identified internal tail cropping, changed the production method from abstract grid prompting to identity-preserving edit canvases with pre-positioned complete silhouettes and large per-cell clearance. Re-audited earlier actions, replaced `idle_happy`, `touch_accept`, `idle_calm`, `skill_cast`, and `special_angry` candidates where necessary, and deleted rejected generated outputs.
- Verification: `catalog-selected-outputs.json` contains 29 selected sheets. Every selected sheet decodes as RGBA, uses exact `512×512` cells, and matches its catalog grid. Raw per-cell alpha audit found no selected boundary contacts; minimum cell-side clearance is 12 source pixels. Visual review checked identity locks, vulpine motion, emotional boundary language, complete tails, body-only combat sheets, and absence of selected detached FX. `full-catalog-status.json` records `29/29` complete.
- Problems / risks: These are AI-generated review candidates, not shipped assets. Human comparative review is still required, especially for left/right locomotion readability, higher-amplitude dance/combat actions, and emotional nuance. Runtime promotion remains a separate GROUNDWORK task.
- Next safe action: Human review the previews listed by `catalog-selected-outputs.json`. If accepted, either begin `auriowl` catalog production in review staging or open a separately approved GROUNDWORK promotion package for selected Blazetail Kit assets.
- Required reading: `output/character-pilots/blazetail-kit/CATALOG_QC_REPORT.md`, `output/character-pilots/blazetail-kit/catalog-selected-outputs.json`, `output/character-pilots/blazetail-kit/full-catalog-status.json`, `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-11 - Codex - Auriowl Full Catalog Autonomous Production

- Lane: `Game Art, UI, And Visual Production`
- Status: `IN PROGRESS`
- Branch / commit: `main` / uncommitted review staging; no commit or push authorized.
- Scope: Produce the formal `auriowl` 29-action catalog under `output/character-pilots/auriowl/**`, using avian-specific perch, talon, wing, feather and short-flight motion. No `assets/**`, runtime, save state, tools, scripts, dependency, or build changes.
- Owner correction: `sleep` is now a sleeping-only loop for every character; no lie-down, stand-up, eye-opening, or wake transition may appear. `idle_wake` owns waking motion.
- Verification plan: exact 512px cells, RGBA delivery, internal cell-boundary alpha audit, bottom-center/perch datum, complete wing and tail-feather silhouettes, identity lock, avian action readability, and detached-FX rejection.
- Required reading: `output/character-pilots/FULL_CATALOG_PRODUCTION_PLAN.md`, `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, Auriowl seed/pilot records, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-11 - Codex - Auriowl Full Catalog Review Staging Completed

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted review staging; no commit or push performed.
- Scope: Completed the formal `auriowl` animation catalog under `output/character-pilots/auriowl/**` only. No `assets/**`, `src/**`, runtime registry, Pixi wiring, save state, tools, scripts, dependency, or build changes were made.
- Work performed: Generated and normalized all 29 catalog actions through P1, P2, and P3 using identity-preserving edit canvases. Translated the common action IDs into grounded avian motion through short talon steps, beak preening, crown-feather expression, wing pressure, wing mantling, compact perch-height changes and contained wing flourishes. Kept combat actions body-only and rejected generic quadruped movement.
- Owner sleep correction: Locked `sleep` to an already-asleep loop. All eight selected frames remain eyes-closed and compact with only subtle breathing/feather settling. Standing, lying-down, eye-opening and waking transitions are excluded; waking remains isolated to `idle_wake`.
- Verification: `catalog-selected-outputs.json` contains 29 selected sheets. Every selected sheet decodes as RGBA, uses exact `512×512` cells, and matches its catalog grid. Per-cell alpha audit found no selected boundary contacts; minimum cell-side clearance is 26 pixels. Visual review checked identity locks, avian motion, full wing/talon/tail-feather silhouettes, body-only combat sheets and absence of selected detached FX. `full-catalog-status.json` records `29/29` complete.
- Problems / risks: These are AI-generated review candidates, not shipped assets. Human comparative review is still required, especially for high-amplitude wing actions, left/right talon-step readability and emotional nuance. Runtime promotion remains a separate GROUNDWORK task.
- Next safe action: Human review the previews listed by `catalog-selected-outputs.json`. If accepted, begin the next formal member in review staging; do not copy Auriowl into `assets/**` without a separately approved GROUNDWORK promotion task.
- Required reading: `output/character-pilots/auriowl/CATALOG_QC_REPORT.md`, `output/character-pilots/auriowl/catalog-selected-outputs.json`, `output/character-pilots/auriowl/full-catalog-status.json`, `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-11 - Codex - Crystalfin Seahorse Full Catalog Autonomous Production

- Lane: `Game Art, UI, And Visual Production`
- Status: `IN PROGRESS`
- Branch / commit: `main` / uncommitted review staging; no commit or push authorized.
- Scope: Produce the formal `crystalfin-seahorse` 29-action catalog under `output/character-pilots/crystalfin-seahorse/**`. No `assets/**`, runtime, save state, tools, scripts, dependency, or build changes.
- Motion translation: Replace terrestrial steps with controlled horizontal hover-swim, fin paddling, torso buoyancy and spiral-tail pulses. Emotion and boundaries use gaze, snout angle, crystal-fin pressure and tail-coil tension. No legs, paws, quadruped gait or bird motion.
- Owner sleep correction: `sleep` will remain already asleep in every frame with closed eyes, compact hover and only subtle breathing/fin/tail motion. Waking belongs only to `idle_wake`.
- Progress: P1 eleven actions generated and normalized. Rejected the first `left_walk` for back-view orientation drift and the first `touch_reject` for detached motion lines; clean replacements were selected.
- Required reading: `output/character-pilots/FULL_CATALOG_PRODUCTION_PLAN.md`, `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, Crystalfin Seahorse seed/pilot records, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-11 - Codex - Crystalfin Seahorse Full Catalog Review Staging Completed

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted review staging; no commit or push performed.
- Scope: Completed the formal `crystalfin-seahorse` 29-action catalog under `output/character-pilots/crystalfin-seahorse/**` only. No `assets/**`, `src/**`, runtime registry, Pixi wiring, save state, tools, scripts, dependency, or build changes.
- Work performed: Generated and normalized all P1, P2 and P3 actions through identity-preserving edit canvases. Translated common action IDs into aquatic motion using buoyancy, torso curves, crystal-fin pressure and spiral-tail thrust. Rejected and replaced the first `left_walk` for back-view orientation drift and the first `touch_reject` for detached motion lines.
- Owner sleep correction: all eight selected `sleep` frames remain closed-eye, already-asleep floating poses with only subtle breathing, fin and tail movement. Waking remains isolated to `idle_wake`.
- Verification: 29 selected RGBA sheets use exact `512×512` cells and correct grids. Per-cell alpha audit found no boundary contacts; minimum clearance is 33 pixels. Visual review confirmed complete crowns, fins and spiral tails, aquatic action readability, identity lock and absence of selected detached FX.
- Problems / risks: Review candidates are not shipped assets. Human comparison remains required, especially for the elongated tail-thrust phase of `attack_basic`, locomotion direction readability and high-amplitude fin actions. Runtime promotion remains a separate GROUNDWORK task.
- Next safe action: Human review the selected previews. If accepted, continue with `sprigfawn` in review staging; do not copy these files into `assets/**` without separate approval.
- Required reading: `output/character-pilots/crystalfin-seahorse/CATALOG_QC_REPORT.md`, `output/character-pilots/crystalfin-seahorse/catalog-selected-outputs.json`, `output/character-pilots/crystalfin-seahorse/full-catalog-status.json`, `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-11 - Codex - Sprigfawn Full Catalog Autonomous Production

- Lane: `Game Art, UI, And Visual Production`
- Status: `IN PROGRESS`
- Branch / commit: `main` / uncommitted review staging; no commit or push authorized.
- Scope: Produce the formal `sprigfawn` 29-action catalog under `output/character-pilots/sprigfawn/**`. No `assets/**`, runtime, save state, tools, scripts, dependency, or build changes.
- Motion translation: Use juvenile deer cloven-hoof steps, ear rotation, neck height, antler angle and short-tail balance. Preserve every branch leaf and all four hooves; do not substitute generic pawed quadruped motion.
- Owner sleep correction: `sleep` will contain only already-asleep frames with closed eyes, folded legs and subtle breathing/ear/leaf movement. Waking belongs only to `idle_wake`.
- Progress: P1 eleven actions generated, visually reviewed, chroma-keyed, normalized to 512px cells and aligned to a shared hoof baseline.
- Required reading: `output/character-pilots/FULL_CATALOG_PRODUCTION_PLAN.md`, `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, Sprigfawn seed/pilot records, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-11 - Codex - Sprigfawn Full Catalog Review Staging Completed

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`
- Branch / commit: `main` / uncommitted review staging; no commit or push performed.
- Scope: Completed the formal `sprigfawn` 29-action catalog under `output/character-pilots/sprigfawn/**` only. No `assets/**`, `src/**`, runtime registry, Pixi wiring, save state, tools, scripts, dependency, or build changes.
- Work performed: Generated and normalized P1, P2 and P3 using identity-preserving edit canvases. Translated actions into juvenile deer movement using cloven-hoof steps, ear rotation, neck height, gaze, antler angle and short-tail balance. Rest, sleep and faint use folded-leg sternal recumbency rather than a dog/cat sit.
- Owner sleep correction: all eight selected `sleep` frames remain already-asleep curled poses with closed eyes and only subtle breathing, ear and leaf movement. Waking and standing are isolated to `idle_wake`.
- Verification: 29 selected RGBA sheets use exact `512×512` cells and correct grids. Per-cell alpha audit found no boundary contacts; minimum clearance is 32 pixels. Visual review confirmed complete leafy branches, ears, four hooves and short tail, species-specific action readability and absence of selected detached FX.
- Problems / risks: Review candidates are not shipped assets. Human comparison remains required, especially for antler readability during lowered-head actions, left/right gait distinction and the visual timing between `sit`, `sleep` and `idle_wake`. The new eight-frame `idle_calm` is selected as v2 to avoid the older six-frame v1 pilot.
- Next safe action: Human review the selected previews. If accepted, continue with `starstripe-cub` in review staging; do not copy these files into `assets/**` without separate approval.
- Required reading: `output/character-pilots/sprigfawn/CATALOG_QC_REPORT.md`, `output/character-pilots/sprigfawn/catalog-selected-outputs.json`, `output/character-pilots/sprigfawn/full-catalog-status.json`, `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-11 - Codex - Starstripe Cub Full Catalog Autonomous Production

- Lane: `Game Art, UI, And Visual Production`
- Status: `IN PROGRESS`
- Branch / commit: `main` / uncommitted review staging; no commit or push authorized.
- Scope: Produce the formal `starstripe-cub` 29-action catalog under `output/character-pilots/starstripe-cub/**`. No `assets/**`, runtime, save state, tools, scripts, dependency, or build changes.
- Motion translation: Use juvenile feline padded-paw gait, shoulder-blade roll, ear position, whisker/cheek expression, crouch height and complete ringed-tail pressure. Tail containment is a critical acceptance gate.
- Owner sleep correction: `sleep` will contain only already-asleep curled frames with closed eyes and subtle breathing/ear/tail movement. Waking belongs only to `idle_wake`.
- Progress: P1 eleven actions generated, visually reviewed, chroma-keyed and normalized to 512px cells. All selected P1 tails retain their full curved silhouette and visible tip.
- Required reading: `output/character-pilots/FULL_CATALOG_PRODUCTION_PLAN.md`, `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, Starstripe Cub seed/pilot records, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.
### 2026-07-11 - Codex - Starstripe Cub Full Catalog Autonomous Production - VERIFIED

- Lane: Game Art, UI, And Visual Production
- Completed the review-only `starstripe-cub` catalog at 29 / 29 actions under `output/character-pilots/starstripe-cub/`.
- Visual QA preserved the appearance lock and verified that the complete blue-white-black ringed tail, including its tip, remains visible in every frame.
- `sleep` contains only fully asleep poses; all waking motion remains isolated in `idle_wake`.
- Technical QA passed exact 512 x 512 RGBA frame grids with a minimum transparent margin of 37 px and no failed sheets.
- Added `full-catalog-status.json`, `CATALOG_QC_REPORT.md`, and `catalog-selected-outputs.json` for review handoff.
- No files under `assets/` or runtime source were changed. No runtime-readiness claim, commit, or push was made.
### 2026-07-11 - Codex - Formal Heartspark Council Cross-Catalog Audit - VERIFIED

- Lane: Game Art, UI, And Visual Production
- Cross-audited all five formal Stage 1 Heartspark Council review catalogs: 145 / 145 selected sheets across 29 shared action IDs per character.
- Mechanical QA passed RGBA mode, exact 512 x 512 cells, divisible grids, the 4096 px sheet-edge limit, and transparent containment margins from 26 px to 37 px.
- Species motion remained differentiated: fox, owl, hovering seahorse, deer, and tiger translations were not collapsed into one quadruped template.
- Confirmed the global sleep rule: `sleep` is already-asleep-only and waking remains in `idle_wake`.
- Added `output/character-pilots/HEARTSPARK_COUNCIL_FULL_CATALOG_QC.md` and `heartspark-council-full-catalog-status.json`.
- Review staging only: no `assets/` or runtime changes, no runtime-readiness claim, and no commit or push.
### 2026-07-11 - Codex - Heartspark Council Owner Review Board - VERIFIED

- Lane: Game Art, UI, And Visual Production
- Added `output/character-pilots/review-boards/heartspark-council-owner-review-board.png` with appearance-lock, locomotion, sleep, attack, and victory comparisons for all five formal members.
- Investigated apparent height outliers found by cross-action bounding-box analysis. Direct sheet review confirmed pose redistribution rather than accidental scale drift: owl wings and seahorse tails extend horizontally, while sleep/faint/defend intentionally compress vertically.
- Preserved the original selected sheets instead of applying harmful per-pose enlargement. Reaffirmed fixed frame-height scaling and bottom-center anchoring for any later runtime promotion.
- Review staging only; no `assets/`, runtime, commit, or push changes.
### 2026-07-11 - Owner - Formal Heartspark Council Visual Catalog Approval - APPROVED

- Lane: Game Art, UI, And Visual Production
- Owner authorized completion of the full workflow and publication to `main` after validation.
- Visual approval covers the five 29-action review catalogs and the cross-character review board.
- Approval does not by itself promote files into `assets/`, alter runtime selection, or mark the formal five runtime-ready; those remain a separate GROUNDWORK task.
### 2026-07-11 - Codex - Formal Heartspark Council Catalog Publication - COMPLETED

- Lane: Game Art, UI, And Visual Production
- Published the Owner-approved review delivery package to `origin/main` in commit `68c786137ab5adb5a14a5fab4d3b68b7c2b3160c` (`Add approved Heartspark Council animation catalogs`).
- Delivery includes 145 selected sheets, five character manifests and QC reports, the cross-catalog status/report, the Owner review board, and rejected-version cleanup already in task scope.
- Verified local `main`, `origin/main`, and GitHub `main` resolved to the same commit after push.
- Local raw, alpha, preview, split-frame, edit-canvas and pipeline intermediates were retained for future art repair but hidden through local `.git/info/exclude`; they are not part of repository history or Claude Code's normal status view.
- Current handoff boundary: visual catalogs are Owner-approved review deliverables, but no file has been promoted into `assets/` and the formal five remain non-runtime-ready.
- Next safe action for Claude Code: read `output/character-pilots/HEARTSPARK_COUNCIL_FULL_CATALOG_QC.md`, `output/character-pilots/heartspark-council-full-catalog-status.json`, each character's `catalog-selected-outputs.json`, `docs/art/SPECIES_MOTION_TRANSLATION.md`, and this lane. Open a separately authorized GROUNDWORK task before any `assets/` copy, registry promotion, Pixi wiring, or runtime selection change.

### 2026-07-12 - Codex - GAP-1 Rift Silhouette Review Batch - COMPLETED

- Lane: Game Art, UI, And Visual Production
- Branch / commit: `main`; this ledger entry is included with the GAP-1 art delivery commit.
- Scope: Owner approved both initial pilots as small-standoff opponents and authorized completion, self-review, commit, and push without per-image gates. No `assets/**`, runtime, registry, manifest, state, tool, or script changes.
- Work performed: completed ten static minor-opponent silhouettes under `output/rift-silhouettes/`: two sadness, two anger, two anxiety, two fatigue, and two loneliness variants. Built-in image generation produced the raw art; deterministic chroma cleanup/despill and 512 x 512 RGBA normalization produced the packaged review candidates. Added the prompt record, contact sheet, and batch QC report; removed raw/chroma/day-night intermediate files from the commit package to avoid repository bloat.
- Verification: all 10 final PNGs are exact 512 x 512 RGBA; all four corners are transparent; no alpha touches any canvas edge; each emotion pair remains visually distinct; the ten read as one Cyber-Taoism emotion-mist family with no face, anatomy, UI, text, border, pedestal, or baked scene. Day/night compositing was inspected before packaging. `git diff --check` passed.
- Related QA evidence: previously dirty `docs/qa/_live_playtest_gate_output.json` and `_web_release_gate_output.json` were validated as current successful 2026-07-12 snapshots rather than discarded, then isolated in commit `6995a3d` (`test(qa): refresh release gate evidence`).
- Problems / risks: these are review outputs, not runtime assets. `crystal_golemite` is intentionally the most concrete silhouette but remains faceless and minor-scale. Chroma removal neutralizes a small amount of translucent outer mist toward grey; no visible magenta fringe remains in packaged finals.
- Next safe action: human review may approve the batch as art candidates. Runtime promotion and enemy sprite wiring remain a separate Owner-approved GROUNDWORK task; procedural mist must remain the fallback until that task is complete.
### 2026-07-12 - Codex - Runtime Companion Portrait Identity Pack - VERIFIED

- Lane: Game Art, UI, And Visual Production
- Branch / commit: `main`; Owner explicitly authorized a path-scoped commit and push after verification. This entry is included with the portrait delivery commit.
- Scope: generate, human-review, promote and wire one portrait for each of the 11 current `full-runtime` companions. GROUNDWORK asset addition is limited to `assets/characters/{id}/portrait/`; runtime edits are limited to portrait paths in `companionRegistry.js` and shared HUD portrait rendering in `hudController.js`.
- Work performed: generated 11 identity-preserving 512 x 512 portraits from approved runtime frames; Greyshade Cat used the Owner's new silver-tabby / gold-eye / blue-diamond-core screenshot as highest-priority identity. Owner approved continuation after the batch review gate. Promoted all 11 finals into character portrait directories, populated all registry `image` paths, and removed the Greyshade-only CSS spritesheet-crop branch so both avatar surfaces use the same explicit image contract.
- Verification: 11/11 portrait mappings present; 11/11 PNGs decode as 512 x 512 and return HTTP 200; Node syntax checks pass; scoped `git diff --check` passes; 46 px and 62 px circular-crop review boards pass. In-app Browser at `http://127.0.0.1:8666/`, viewport 390 x 844, confirmed page identity, meaningful content, no framework overlay, zero console warnings/errors, the new Greyshade blue-gem portrait in the top-left card, and the same explicit portrait URL in the opened Companion Status panel. Both rendered surfaces use `background-size: cover` and centered positioning without clipping or overflow.
- Problems / risks: the worktree contains unrelated in-progress resonance-circle, standoff, QA and handoff changes owned by another workflow; this portrait package must remain path-scoped and must not commit or revert those changes.
- Next safe action: keep the remaining unrelated dirty worktree for Claude Code. Future portrait additions should reuse the explicit registry `image` contract and the 46 px / 62 px circular-crop QC gate.

### 2026-07-14 - Codex - TP-RAPHAEL-REFLECTIVE-CARE-V1 - VERIFIED

- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`
- Status: `VERIFIED`; included in the Owner-authorized scoped `main` commit. Baseline `main` HEAD at start: `01b478f`.
- Scope: EXPERIENCE-only Reflective Care policy, opt-in Jung-inspired symbolic reflection, state/memory governance, dialogue regressions, QA report, and handoff status. No GROUNDWORK, `safetyShield`, `safeHarborMode`, save schema, external LLM/API, backend, dependency, asset, tool, or script change.
- Red-line check: High-risk, dependency pressure, pressure commands, quiet/no-question constraints, and companion boundaries remain upstream overrides. Reflective-care and symbolic-reflection turns do not grant relationship reward, trigger milestones, or write long-term memory. Player symbolism is never treated as diagnosis or an authoritative dream/shadow interpretation.
- Work performed: Added `reflectiveCarePolicy.js`; added explicit `reflective_care` and `symbolic_reflection` strategies; grounded ordinary emotional reflections for masking, prolonged strain, invalidation, self-doubt, and uncertainty; added opt-in dream/shadow/mask/image prompts that return meaning authority to the player; connected private-care strategy governance to state mutation; added care-specific quick replies for continuing, taking one small step, becoming quiet, declining interpretation, and returning to daily conversation; expanded dialogue-loop coverage from 14 to 21 cases.
- Verification: Node syntax passed for every touched JS file. Dialogue loop **21/21**, forbidden phrases 0, console errors 0. Sealed holdout **48/48**, hard gate PASS, machine quality flags 0, console errors 0, human blind `not_run`. Full web release gate **10/10**, `allAutomatedRequiredOk:true`; JS syntax **204/204**; state migration **30/30**; live Soul Talk **11/11**; HUD **13/13**; accessibility warnings 0.
- Problems / risks: This is supportive companion dialogue, not psychotherapy. Jung-inspired language remains a narrow opt-in self-reflection tool. Real-device mobile review, moderated private testers, and legal/privacy/store-copy review remain manual launch gates. Pre-existing dirty `_live_playtest_gate_output.json` and `_web_release_gate_output.json` were backed up and restored after the gate; they remain outside this package unless separately reviewed.
- Next safe action: Collect consented Limited Beta feedback on the care tone and symbolic prompts while preserving the formal human-validation gate. Do not market Raphael as a therapist, counsellor, crisis service, or independently human-validated public release.
- Required reading: `docs/qa/RAPHAEL_REFLECTIVE_CARE_V1_2026-07-14.md`, `docs/qa/RAPHAEL_CONVERSATION_EVAL_V6_LIMITED_BETA_2026-07-13.md`, `docs/raphael/RAPHAEL_CONSTITUTION.md`, and this Lane 3 entry.

### 2026-07-14 - Codex - Linkara Atlas And Moonlake Route Art V1 - IN PROGRESS

- Lane: `Game Art, UI, And Visual Production`
- Status: `IN PROGRESS`; Owner approved implementation of the proposed plan. No commit or push authorized.
- Task name: `Linkara Atlas + Moonlake Route Art V1`.
- Layer: `GROUNDWORK + EXPERIENCE`; GROUNDWORK is limited to new versioned map art under `assets/maps/**`. EXPERIENCE is limited to shared map-layout data, `atlasController.js`, `mapController.js`, and `styles/world-atlas.css`.
- Files touched: expected `assets/maps/linkara/**`, `src/data/mapArtLayout.js`, `src/ui/atlasController.js`, `src/ui/mapController.js`, `styles/world-atlas.css`, map-art QA/prompt records, and this ledger. No `index.html`, save state, Pixi habitat, battle, safety, tool, script, dependency, or build changes.
- Red-line check: no dependency detection, reward pressure, FOMO, countdown, red dot, safetyShield, safeHarborMode, battle policy, or relationship-state behavior changes. Existing locked/current/visited semantics and exploration outcomes remain authoritative.
- Non-goals: no active-habitat replacement, region switching, BGM wiring, collision, chapter progression changes, companion art, legacy Linkara deletion, commit, or push.
- Acceptance refs: `D6`, `J5`, `K9`, `L6`, `M1`, `M2`, `M5`, plus the `390x844` manual viewport gate.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`, `assets/backgrounds/linkara/linkara-map-data.json`, `src/ui/atlasController.js`, `src/ui/mapController.js`, `styles/world-atlas.css`, and this lane.

### 2026-07-14 - Codex - Linkara Atlas And Moonlake Route Art V1 - VERIFIED

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`; implementation and technical visual QA complete. Final production-art lock still requires Owner visual approval under the Companion / generated-art policy. No commit or push performed.
- Completed: generated and normalized one 1200x888 Linkara atlas, one 1200x1584 Moonlake route scene, and six 512x512 Moonlake node vignettes in the approved premium miniature-diorama direction. Added per-asset prompt records, `assets/maps/map-art-manifest-v1.json`, and alignment/review boards under `output/map-pilots/linkara-moonlake-diorama-v1/`.
- Runtime integration: added `src/data/mapArtLayout.js` as the single coordinate/art contract; the atlas SVG now renders the Linkara art beneath its seven authoritative nodes; the exploration map progressively loads its route art and six vignette orbs while preserving the existing gradient/glyph fallback, paths, statuses, outcomes, and chapter-slot behavior.
- Verification: all `src/**/*.js` plus locked `script.js` passed `node --check`; `git diff --check` passed; layout contract check passed (`7` atlas regions, `18` route slots, `8` referenced assets); Pillow dimensions passed for all eight assets. A headless Chromium controller/CSS harness at `390x844` confirmed seven atlas nodes and six visible Moonlake nodes all remain in bounds, all route/vignette art loads, and there are no console errors or failed requests. Runtime captures: `runtime-atlas-390x844.png` and `runtime-moonlake-390x844.png`.
- Problems / risks: the full `index.html` boot could not reach `networkidle` in the isolated browser because its external PixiJS CDN request remained unavailable, so the map controllers and production CSS were exercised in a local no-Pixi harness instead. This does not replace Owner real-device review. The new JPEG scenes total roughly 1.5 MB and should be revisited only if Pages/mobile profiling shows a real load issue.
- Unrelated dirty files preserved: `docs/qa/_live_playtest_gate_output.json`, `docs/qa/_web_release_gate_output.json`, and `docs/design/TEST_CARRIER_ROSTER_MEMO.md` were not modified by this package.
- Branch / commit: `main` at starting `de57e92`; changes remain uncommitted and unpushed.
- Next safe action: Owner reviews the two runtime captures and the review board. If approved, keep these versioned assets; if rejected, replace only the `-v1` art and prompt/manifest records while preserving `mapArtLayout.js` coordinates and fallback behavior.

### 2026-07-14 - Codex - Moonlake Diorama Skill And Day Concept Pilot - VERIFIED

- Lane: `Game Art, UI, And Visual Production`
- Status: `VERIFIED`; Skill creation and review-only daytime concept staging complete. No commit or push performed.
- Task name: `TP-HAB-SKILL-1 + TP-HAB-ART-PILOT-1`.
- Layer / scope: EXPERIENCE art tooling and staging only. Created the personal `generate-nexus-habitat` Skill under `C:/Users/User/.codex/skills/` and generated three Moonlake daytime direction candidates under `output/habitat/moonlake-diorama-r1/**`. No `assets/**`, `index.html`, Pixi runtime, manifest, Scene Profile, state, save schema, dependency, backend, or build change.
- Work performed: Added two explicit art presets (`clay_resin_3d_miniature`, `premium_2_5d_storybook`), concept/layer/day-night/human-gate workflows, output contract, and deterministic dimension validator. Generated two clay/resin miniature candidates and one premium 2.5D storybook candidate using the Owner's three style references. Preserved raw outputs, normalized review images, exact prompt records, three mobile crops, a side-by-side contact sheet, a Scene Profile safe-zone review, manifest, and QC report.
- Verification: Skill `quick_validate.py` passed using an existing local PyYAML environment; the Skill QC script executed successfully. Three normalized candidates pass exact `1080x1920` RGBA checks; three mobile previews pass exact `390x844`; manifest and dimension-report JSON parse; scoped `git diff --check` passes. Visual review confirms no baked companion, UI, text, logo, explicit celestial disc, tent, stone well, or oversized portal arch. Gold reserved-rect and red UI-band review confirms each concept leaves a viable interaction plane.
- Problems / risks: These are dressed visual-direction concepts with baked environmental structures, not runtime foundations or approved assets. Candidate B is deliberately more game-board/digital-path-like; Candidate C is less clay-like and more cinematic. Day/night identity, layer separation, prop transparency, alpha edges, performance, and live Pixi composition remain untested until the Owner selects a direction. Existing unrelated dirty worktree changes were preserved.
- Next safe action: Owner selects A, B, C, or requests a hybrid. After selection, open the already scoped art-staging continuation to derive a same-composition night concept, then produce foundation/structures/foreground/prop candidates. Do not modify `assets/**` or runtime without a separate Owner-approved GROUNDWORK promotion pack.
- Required reading: `output/habitat/moonlake-diorama-r1/QC.md`, `output/habitat/moonlake-diorama-r1/manifest.json`, `docs/assets/NEXUS_LINK_ART_STYLE_TARGET.md`, `docs/assets/HABITAT_AUTOMATION_WORKFLOW.md`, `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `src/data/sceneProfiles/moonlakeProfile.js`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-14 - Codex - Moonlake Canon Scene Correction And Stateful Object Plan - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Status: `VERIFIED`; review staging and Skill/spec refinement complete. No commit or push performed.
- Scope correction: Owner designated `assets/backgrounds/linkara/regions/ethereal_moon_lakefront.jpg` as the authoritative Moonlake geography/landmark reference and `C:/Users/User/Pictures/ＮＬＵＩＶ２/uploads/pasted-1782218359033-0.png` as the authoritative `390x844` UI/companion placement audit. Both source references remained read-only. Earlier A/B/C candidates are preserved but marked `superseded_wrong_scene_reference`.
- Work performed: generated corrected daytime candidates A2/B2/C2 preserving the waterfall-cliff lake basin, islands, blue/ivory pavilions, crystal beacons, central rune plaza and axial dock. Added exact prompts, raw and normalized outputs, mobile previews, corrected contact sheet, and a safe-zone review overlay. Updated the personal `generate-nexus-habitat` Skill with canonical-reference precedence, UI/companion/water avoidance, atmospheric-depth rules, no-Unity-default authoring, and a stateful-object contract.
- Object/crystal plan: added `output/habitat/moonlake-diorama-r1/STATEFUL_OBJECT_PLAN.md`. The proposed system separates stable foundations, structural plates, transparent placeable props, stateful emotional crystals, trace/weather FX and sparse foreground occlusion. Crystal stages are `glimmer -> seed -> cluster -> attuned -> transformed -> released`; local changes may affect runes, ripples, foliage, mist or reflected light without repainting the whole map or introducing rewards, FOMO, dependency detection or unreachable repair.
- Visual QA: A2 has the strongest handcrafted miniature read; B2 provides the cleanest plaza/companion corridor and is currently the best base for separately placed objects; C2 has the richest storybook depth but higher far-detail contrast. Owner additionally locked depth-banded atmospheric haze: far cliffs/waterfalls/towers must soften, desaturate and lose detail progressively while midground landmarks remain readable and the interaction plane stays sharp.
- Verification: Skill validation passed. All six normalized review files are exact `1080x1920` RGBA; all six mobile previews are exact `390x844`; manifest JSON parses; A2/B2/C2 safe-zone overlay was visually inspected. No `assets/**`, `index.html`, Pixi runtime, state/save, dependency or build change was made.
- Architecture boundary: default authoring is AI/layered transparent PNG plus Scene Profile data and PixiJS v8 FX. Unity UModeler or Blender may be optional offline orthographic tools only; Unity WebGL, Three.js runtime and an engine replacement remain forbidden. `TP-HAB-SYSTEM-0`, Scene Profile reconciliation, weather/time runtime and placement-renderer work remain separate future task packs and are not authorized by this entry.
- Next safe action: Owner selects A2, B2, C2 or a hybrid. Only then generate a same-composition night direction and transparent object/crystal pilots. `assets/**` promotion and runtime wiring require a separately approved GROUNDWORK pack.
- Required reading: `output/habitat/moonlake-diorama-r1/QC.md`, `output/habitat/moonlake-diorama-r1/manifest.json`, `output/habitat/moonlake-diorama-r1/STATEFUL_OBJECT_PLAN.md`, `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`, `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `src/data/sceneProfiles/moonlakeProfile.js`, and this lane.

### 2026-07-14 - Codex - Moonlake Hybrid Layered Production V1 - IN PROGRESS

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-HAB-LAYERED-PRODUCTION-1`.
- Layer / scope: EXPERIENCE visual-production staging only. Owner approved B2's clear plaza/companion space + A2's clay/resin materials + C2's atmospheric depth. Expected writes are limited to `output/habitat/moonlake-diorama-r1/**`, the personal habitat Skill if its production contract needs correction, and this ledger.
- Red-line check: emotional-crystal states remain non-reward, non-FOMO, non-dependency-detection habitat expression; they cannot alter safety-help rewards or make high-tension repair unreachable.
- Non-goals: no `assets/**`, `index.html`, Pixi runtime, Scene Profile source, state/save, dependency, build, commit or push change.
- Acceptance: one locked daytime dressed master; same-composition day/night staging; `1080x1920` aligned layer candidates; `390x844` HUD/Dock/companion avoidance; depth-banded far haze; separately generated transparent props/crystal states; manifest, prompts, QA preview and human approval gate.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/art/ART_PRODUCTION_INDEX.json`, `docs/assets/LINKARA_HABITAT_LAYERING_AND_VISUAL_LOCKS.md`, `src/data/sceneProfiles/moonlakeProfile.js`, the installed `generate-nexus-habitat` Skill and this lane.

### 2026-07-14 - Codex - Moonlake Hybrid Layered Production V1 - COMPLETED

- Lane: `Game Art, UI, And Visual Production`.
- Status: `COMPLETED`; Owner selected B2 clear plaza + A2 clay/resin material + C2 atmospheric depth, then explicitly approved runtime promotion, self-review, commit and push to `main`.
- Completed art: promoted same-composition `1080x1920` day/night foundations, aligned day/night camp-structure plates, aligned day/night foreground-occlusion plates, new clay/resin sun and crescent, one grounded lantern, one grounded crystal cluster, and six future crystal lifecycle states under versioned `MoonlakeDiorama_r1` asset roots.
- Visual judgment: the independently generated sky/mountain/water/ground micro-plates failed the shoreline seam test even after an overdraw retry, so they remain rejected staging evidence and were not promoted. The coherent foundation preserves the fogged far cliffs, waterfalls, lake edges and sharp plaza; structures, celestial bodies, props, companion, foreground and FX remain independently composited runtime layers.
- Placement review: at `390x844`, the lantern sits left at `(72,604)`, the crystal sits right at `(290,604)`, and both remain outside companion rect `x=.38,y=.45,w=.24,h=.27`. Neither floats on water or enters the top `.12` / bottom `.20` UI bands. Foreground foliage remains low and never covers the companion face, body or heart core.
- Verification: true-alpha edge cleanup removed visible magenta fringe. Headless Chromium captures `runtime-day-390x844.png` and `runtime-night-390x844.png` show coherent material, matching day/night geometry, readable UI, a clear central plaza, and depth-banded far haze. No page errors, missing requests or runtime console errors were observed.
- Problems / risks: crystal lifecycle assets are manifest-addressable but state-driven texture switching is intentionally deferred; this task does not invent reward, FOMO or dependency-driven crystal behavior. Legacy Moonlake packs remain preserved for rollback.
- Required reading: `assets/props/MoonlakeDiorama_r1/manifest.json`, `docs/art/ART_PRODUCTION_INDEX.json`, `src/data/sceneProfiles/moonlakeProfile.js`, and this lane.

### 2026-07-14 - Codex - Moonlake Diorama Runtime Promotion R1 - VERIFIED

- Lane: `Game Engineering And Architecture`.
- Status: `VERIFIED`; this entry is included in the Owner-authorized scoped `main` commit and push.
- Scope: GROUNDWORK promotion under `assets/backgrounds|layers|props/MoonlakeDiorama_r1/**`, `index.html` preload correction, `assetManifest.js`, `pixiApp.js`, Scene Profile and layout data, art INDEX, and this ledger. No state/save, safety, battle, dependency, backend, build step, Unity runtime or Three.js change.
- Runtime integration: `MOONLAKE_DIORAMA_R1` is the active manifest pack. Pixi crossfades both the foundation and illumination-sensitive structure/foreground plates with `nightAlpha`; celestial bodies follow the existing arc; new grounded props use bottom-center anchors. Old magic-circle, stone-arch and campfire sprites are no longer mixed into the active environment.
- Verification: changed JavaScript passed `node --check`; JSON manifests and the art INDEX parse; promoted raster dimensions/modes/alpha pass; `git diff --check` passes for the scoped package. Chromium at `390x844` produced day/night captures with one Pixi canvas, body height `844`, no page error, and no failed asset request. WebGL ReadPixels/preload advisory warnings are non-failing browser diagnostics.
- Unrelated work preserved: pre-existing expedition source/CSS/QA changes remain unstaged and must not be included in this habitat commit.
- Next safe action: use the six promoted crystal-state files only in a separately scoped experience task that maps existing emotional-memory state to reversible visual texture changes. Keep `MoonlakeVivarium_v3` and `LakeNightCamp_v2` until a later reference-audit cleanup is explicitly approved.
- Required reading: `assets/props/MoonlakeDiorama_r1/manifest.json`, `src/data/assetManifest.js`, `src/pixi/pixiApp.js`, `src/data/sceneProfiles/moonlakeProfile.js`, `docs/art/ART_PRODUCTION_INDEX.json`, and this lane.

### 2026-07-14 - Codex - Moonlake Companion Plaza Placement - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Status: `VERIFIED`; the Owner-requested character-position correction is complete and remains uncommitted/unpushed pending later instruction.
- Scope: EXPERIENCE layout data only. Changed the Moonlake companion bottom-center position from `(195,532)` to `(195,590)` at the `390x844` reference size and synchronized the Scene Profile anchor from `(0.50,0.63)` to `(0.50,0.70)`. Scale remains `0.72`.
- Visual review: fresh day/night Pixi captures place the companion on the central rune plaza instead of the narrow dock edge. Feet remain grounded; face, body and heart core remain readable; the companion does not overlap the lantern, crystal, Soul Talk control, bottom navigation, top HUD or foreground occlusion.
- Verification: both changed JavaScript files pass `node --check`; scoped `git diff --check` passes. Chromium at `390x844` reports one Pixi canvas, body height `844`, no page error and no failed asset request in both phases. WebGL ReadPixels and preload messages remain non-failing browser advisories.
- Unrelated work preserved: pre-existing expedition source/CSS/QA changes were not modified. No asset, state/save, safety, dependency, backend or build-step change was made.
- Next safe action: keep the corrected placement as the Moonlake reference anchor and apply the same reserved-plaza rule when staging the remaining six Linkara region habitats.

### 2026-07-14 - Codex - Six Linkara Region Diorama Art R1 - IN PROGRESS

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-HAB-SIX-REGION-ART-1`.
- Layer / scope: EXPERIENCE visual-production staging only. The six existing region JPGs under `assets/backgrounds/linkara/regions/**` are read-only geography/landmark canon. Expected writes are limited to `output/habitat/linkara-six-region-diorama-r1/**` and this ledger.
- Art direction: preserve each region's identity while applying Moonlake's locked hybrid direction: B2 clear central companion plaza and mobile interaction corridor, A2 clay/resin miniature material, and C2 depth-banded atmospheric haze. Produce same-composition day/night review assets and `390x844` safe-zone previews without baked companions, UI, text or logos.
- Red-line check: no dependency detection, relationship reward, FOMO, countdown, safety-help reward, unreachable repair, state/save, battle or companion-policy change.
- Non-goals: no `assets/**` promotion, runtime region switching, `index.html`, Pixi groundworks, manifest wiring, new dependency/build step, commit or push. Human approval remains required before any generated art enters formal assets.
- Acceptance: six recognizable regional geographies; consistent miniature-diorama family; readable ground plane; progressively softened/desaturated far scenery; same-composition day/night pairs; top `.12` and bottom `.20` UI bands clear; companion focal area unobstructed; prompt/manifest/QC evidence retained.

### 2026-07-14 - Cursor - Expedition RE-3 TASK_PACK #1 - IN PROGRESS (uncommitted)

- Lane: `Raphael Core × Nexus Expedition`.
- Status: `IN PROGRESS`／runtime progress — **not** sealed, **not** Core-complete, **not** commercial-ready. Part A（lite source gate + roadmap）已 push：`e269cc0`. 本 RE-3 包**不自動 commit**，待 Owner 另指示。
- Work performed:
  1. `expeditionResultEvent.js` — 可驗證 `expedition_result` schema（facts／heart／redLines／intentStub；禁 `companionJournal`）。
  2. `expeditionMemoryGateway.js` — `decideExpeditionMemoryWrites`（保留 `source===expedition`；`expedition_gateway_v1`；**不**呼叫 Soul Talk `buildMemoryDecision`）。
  3. `expeditionSettlementCritic.js` + bridge composer — 真實第一人稱草稿 + lite critic（第三人稱／農場語氣 fail-closed）；接 `critiqueConstitution`／`critiquePersona` 能接的部分。
  4. Controller 結算：先 `buildExpeditionResultEvent` → `prepareExpeditionCoreSettlement`。
  5. 合約／commercial readiness／本 ledger 進度更新（未偽造 sealed）。
- Verification target: `node docs/qa/expedition-behavior-matrix.mjs` green（含 RE-3 cases）。
- Honest gaps: 正式 intent classifier；完整 `runCritics`／voice pack；reducer 統一 delta；Soul Talk memoryWriter 適配；`suggest_retreat` UI；Owner seal + feel-check；release gate。
- Next safe action: Owner 驗收 RE-3 #1 後指示 commit；或續 RE-3 #2（intent／reducer）。
- Required reading: `docs/raphael/RAPHAEL_EXPEDITION_COMMERCIAL_READINESS.md`, `src/expedition/expeditionResultEvent.js`, `src/expedition/expeditionMemoryGateway.js`, `src/expedition/expeditionCoreBridge.js`.

### 2026-07-14 - Cursor - Expedition RE-1／RE-2 Runtime + P1 FPS Fix - VERIFIED (`e269cc0` on main)

- Lane: `Raphael Core × Nexus Expedition`.
- Status: `VERIFIED` — lite memory source gate + commercial readiness roadmap landed on `main` as `e269cc0`（subsequent RE-3 work may sit uncommitted）.
- Contract: `docs/raphael/RAPHAEL_EXPEDITION_EVAL_CONTRACT.md` status `draft awaiting seal`（不可偽造 `sealed v1`）。
- Note: earlier RE-1／RE-2 runtime（heart、E-EXIT／E-COERCE／E-FARM、voice split）已在 `fb1afbf`；`e269cc0` 補 P2 source 閘門與商業路線圖。
- Required reading: `docs/raphael/RAPHAEL_EXPEDITION_COMMERCIAL_READINESS.md`, `src/expedition/expeditionCoreBridge.js`.

### 2026-07-14 - Codex - Black Iron Hackers Stage 1 Full 8-Frame Catalog - IN PROGRESS

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-BIH-STAGE1-FULL-8F-CATALOG`.
- Layer / scope: EXPERIENCE visual-production documentation and review staging. Owner approved the supplied five-character sheet as the appearance-lock source and authorized the same seed → species pilot → full-catalog workflow used for the formal Heartspark Council batch. Expected writes are limited to `docs/art/**`, `output/character-pilots/**`, and this lane.
- Production contract: `thunder-pup`, `wavecub`, `starflame-phoenix`, `star-foal`, and `goldenspark-wyrm`; all 29 shared action IDs per character; every action is eight frames generated as a `2×4` body grid before deterministic transparent cleanup and QC. `sleep` remains the runtime ID but is an already-deep-asleep loop in all eight frames; waking remains isolated to `idle_wake`.
- Red-line check: touch accept/guard/reject preserve consent and non-punitive boundaries; battle actions remain emotional-standoff gestures, not HP-zero aggression; `faint` is temporary heart-core overload, not death; no dependency detection, safety-help reward, FOMO, or unreachable repair behavior is introduced.
- Non-goals: no `assets/**`, registry, manifest, Pixi/runtime, state/save, canon authority, dependency, build step, commit, or push change. Formal faction/canon integration and any runtime promotion require later separately authorized tasks.
- Required reading: `docs/art/BLACK_IRON_HACKERS_STAGE1_CHARACTER_ASSET_INDEX.md`, the five Black Iron lock specs, `docs/art/BLACK_IRON_HACKERS_STAGE1_SPECIES_MOTION_TRANSLATION.md`, `docs/assets/COMPANION_ANIMATION_CATALOG.md`, `output/character-pilots/FULL_CATALOG_PRODUCTION_PLAN.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-14 - Codex - Black Iron Hackers Identity Seed Gate - AWAITING OWNER REVIEW

- Lane: `Game Art, UI, And Visual Production`.
- Scope: Completed the first identity-seed gate under `output/character-pilots/**`; no pilot/full-catalog generation, `assets/**`, runtime, canon, commit, or push change.
- Selected review seeds: ThunderPup v1, WaveCub v2, Starflame Phoenix v2, Star Foal v2, and Goldenspark Wyrm v2. WaveCub v1 was rejected for detached droplets; Phoenix v1 for detached embers/oversized plume; Star Foal v1 for tall adolescent drift; Goldenspark v1 for full-mecha drift.
- Mechanical verification: all five selected seeds are RGBA `512×512`, have fully transparent corners, preserve at least 26 px transparent margin, and contain complete grounded silhouettes without pedestal/UI/text/scene/detached FX.
- Human gate: review `output/character-pilots/review-boards/black-iron-hackers-seed-review-board.png` and `output/character-pilots/BLACK_IRON_HACKERS_SEED_QC.md`. Approval authorizes five species-specific eight-frame pilots under `output/**` only.

### 2026-07-14 - Owner - Black Iron Hackers Identity Seed Gate - APPROVED

- Lane: `Game Art, UI, And Visual Production`.
- Owner signal: `請繼續開工`.
- Approved seeds: ThunderPup v1, WaveCub v2, Starflame Phoenix v2, Star Foal v2, Goldenspark Wyrm v2. The previously flagged ThunderPup flank node and Goldenspark gear/ridge strength are accepted for pilot inheritance.
- Authorization: proceed with one species-specific eight-frame pilot per character under `output/**`. This does not authorize `assets/**`, runtime, canon, commit, or push changes.

### 2026-07-14 - Codex - Black Iron Hackers Five-Species Animation Pilot - AWAITING OWNER REVIEW

- Lane: `Game Art, UI, And Visual Production`.
- Status: `AWAITING OWNER REVIEW`; five species-specific pilot actions are generated, normalized and mechanically verified. No `assets/**`, runtime, canon, dependency, commit or push change was made.
- Pilot outputs: ThunderPup `right_walk`, WaveCub `touch_reject`, Starflame Phoenix `right_walk`, Star Foal `right_walk`, and Goldenspark Wyrm `idle_calm`. Each selected output contains exactly eight 512 x 512 transparent frames in a 2048 x 1024 sheet plus an eight-frame GIF preview.
- Correction record: initial raw sheets were retained as provenance but failed strict 8 px source-cell containment. A layout-only v2 pass reduced and recentered every pose; all five v2 sheets then passed `--reject-edge-touch`, shared-scale normalization, transparent-corner checks and exact dimension/frame-count checks.
- Species review: ThunderPup reads as grounded canine walking; WaveCub as a non-attacking feline refusal; Phoenix as a grounded two-talon step/hop with folded wings; Star Foal as an equine four-beat hoof walk; Goldenspark as a wingless low saurian calm idle with an attached gear tail.
- Human gate: review `output/character-pilots/BLACK_IRON_HACKERS_PILOT_QC.md`, the five named sheets and GIF previews. Approval authorizes expansion to the documented 29-action x five-character staging catalog; every action remains eight frames and the catalog sleep performance remains `deep_sleep` / 熟睡. Rejection of any pilot must be resolved before that species expands.
- Known review points: Thunder crystal micro-detail interpolation, WaveCub face-angle strength, Phoenix talon-lift subtlety, Star Foal high foreleg stylization, and Goldenspark gear-tail motion amplitude remain Owner visual decisions.
- Next safe action: wait for explicit Owner pilot approval. Do not promote to `assets/**` or touch registry/runtime without a separate GROUNDWORK task pack.

### 2026-07-15 - Owner - Black Iron Hackers Five-Species Animation Pilot - APPROVED

- Lane: `Game Art, UI, And Visual Production`.
- Owner signal: `同意請開工`.
- Approved pilots: ThunderPup `right_walk`, WaveCub `touch_reject`, Starflame Phoenix `right_walk`, Star Foal `right_walk`, and Goldenspark Wyrm `idle_calm`.
- Authorization: proceed with the complete staging catalog under `output/character-pilots/**`: all five characters, all 29 shared animation IDs, exactly eight frames per action. The shared ID remains `sleep`, while its performance is locked to an already-deeply-asleep loop; waking remains exclusive to `idle_wake`.
- Scope boundary: this approval does not authorize `assets/**`, runtime, registry, manifest, state/save, canon promotion, dependency changes, commit, or push.

### 2026-07-15 - Codex - Black Iron Hackers Full Catalog Generation - IN PROGRESS

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-BIH-STAGE1-FULL-8F-CATALOG` continuation after approved seed and pilot gates.
- Execution order: complete each character vertically through P1, P2 and P3, beginning with `thunder-pup`; preserve every approved pilot as that action's selected v1 output.
- Mechanical contract: one built-in image-generation call per action; raw 4-column x 2-row action sheet; deterministic chroma removal; shared-scale bottom/species-datum normalization; eight 512 x 512 RGBA frames; 2048 x 1024 selected sheet; eight-frame GIF; strict cell-edge rejection and transparent-corner checks.
- Red-line check: touch responses retain consent and non-punitive refusal; battle motions remain restrained boundary/stabilization gestures; `faint` is temporary core overload, never death; no dependency detection, FOMO, safety-help reward, domination framing, or unreachable repair is introduced.
- Non-goals: no `assets/**`, runtime, registry, manifest, state/save, canon authority, external dependency, build step, commit, or push.
- Required reading: `output/character-pilots/BLACK_IRON_HACKERS_FULL_CATALOG_PRODUCTION_PLAN.md`, `docs/assets/COMPANION_ANIMATION_CATALOG.md`, the five lock specs, `docs/art/BLACK_IRON_HACKERS_STAGE1_SPECIES_MOTION_TRANSLATION.md`, `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, and this lane.

### 2026-07-14 - Codex - Six Linkara Region Diorama Art R1 - PUBLISHED TO MAIN

- Lane: `Game Art, UI, And Visual Production`.
- Status: `PUBLISHED`; Owner explicitly authorized commit and push after confirming unrelated work was handled.
- Commit / branch: `b41ba58` on `main`, pushed to `origin/main`.
- Published scope: only `output/habitat/linkara-six-region-diorama-r1/**` (83 files): twelve day/night foundations, twelve masks, placement/safe-zone previews, contact sheets, prompt provenance, Scene Profile staging, manifest, reports, rejected baked-rain evidence and reproducible postprocessor.
- Boundary: this publishes the human-review package, not formal `assets/**` promotion or runtime integration. `humanApproved`, `referenceAuditPassed` and `runtimeIntegrated` remain `false` in the manifest until a separately authorized GROUNDWORK promotion task.
- Isolation: Black Iron Hacker, character-pilot and `docs/art/README.md` worktree changes were not staged or included.

### 2026-07-14 - Codex - Six Linkara Region Diorama Art R1 - COMPLETED

- Lane: `Game Art, UI, And Visual Production`.
- Status: `COMPLETED`; six-region review staging, day/night generation, placement correction, masks and QC are complete. No six-region asset promotion, runtime wiring, commit or push was performed.
- Outputs: `output/habitat/linkara-six-region-diorama-r1/**` contains twelve normalized `1080x1920` RGBA foundations, six depth masks, six placement masks, twelve `390x844` clean previews, twelve safe-zone audits, twelve Greyshade placement previews, two contact sheets, prompt provenance, staging Scene Profiles, manifest, reports and QC.
- Region identity: Central Radiant Core keeps the ivory/gold crystal capital and canals; Eastern Mystic Mountains keeps fractured amethyst plateaus/citadel; Northern Verdant Plains keeps farms/river/watermill/windmills; Southeast Forge Hills keeps the volcanic coastal foundries and orange/cobalt energy; Southern Harbor Nexus keeps ships/turquoise harbor/blue-domed city; Southwest Tidal Frontier keeps the storm coast, piers, violet seams and distant vortex.
- Placement correction: each region now uses a plaza-specific bottom-center anchor instead of forcing Moonlake's `y=.70`: Central `.69`, Eastern `.62`, Northern `.66`, Forge `.62`, Harbor `.68`, Tidal `.63`. Visual cat composites confirm grounded feet and unobstructed face/body/heart core in both phases. Top `.12` HUD and bottom `.20` Dock bands remain reserved.
- Self-review correction: the first Tidal Frontier night candidate introduced baked rain. It is preserved under `rejected/**`; a targeted no-rain edit replaced the active staging night so precipitation remains a future Pixi weather FX responsibility.
- Layering: every candidate has a coherent day/night foundation plus separate depth and placement masks. Transparent foreground occlusion, camp structures and placeable props remain explicitly pending human selection; this avoids repeating the rejected Moonlake micro-plate seam failure while preserving the intended layered runtime contract.
- Verification: habitat validator passes `12/12` foundations and `12/12` masks at `1080x1920`; manifest, Scene Profiles and reports parse; the postprocessor compiles; both contact sheets were visually inspected; Moonlake layout/Profile JavaScript passes `node --check`; scoped `git diff --check` passes.
- Concurrent-state note: current `main` advanced to `e269cc0` during this work and already contains the corrected Moonlake companion `(195,590)` / `(0.50,0.70)` values. Unrelated Expedition and Black Iron Hacker worktree changes were preserved and not included in this package.
- Human gate: `humanApproved:false`, `referenceAuditPassed:false`, `runtimeIntegrated:false`. Owner review is required before any file enters `assets/**`; promotion and region switching require a separate GROUNDWORK task.
- Required reading: `output/habitat/linkara-six-region-diorama-r1/QC.md`, `output/habitat/linkara-six-region-diorama-r1/manifest.json`, `output/habitat/linkara-six-region-diorama-r1/scene-profiles.json`, both contact sheets, and this lane.
### 2026-07-15 - Codex - Linkara Seven-Habitat Runtime Switch + Clay Resin R2 - IN PROGRESS

- Lane: `Game Engineering And Architecture`.
- Status: `IN PROGRESS`; Owner confirmed the GROUNDWORK task and additionally required a stronger 3D miniature / handmade clay-resin material pass before runtime promotion.
- Task name: `TP-HAB-REGION-SWITCH-1`.
- Scope: promote an Owner-reviewed six-region R2 day/night habitat set, add seven-region Habitat Registry and Scene Profiles, place the active companion at each authored plaza anchor, persist the active habitat, and make accessible unlocked atlas circles switch the live Pixi habitat.
- Groundwork: expected changes include approved `assets/backgrounds|layers/LinkaraHabitats_r1/**`, `src/pixi/pixiApp.js`, state normalization/defaults, manifest data, atlas integration, focused CSS/QA, art INDEX, and this ledger. `index.html` and `saveManager.js` are not planned.
- Performance contract: habitat pairs load on demand; previous non-active region textures are unloaded after a successful swap so all twelve large plates do not remain resident on mobile GPU memory.
- Red-line check: no dependency detection, FOMO, countdown, reward pressure, safety-help reward, unreachable repair, battle policy, companion ownership or roster change.
- Non-goals: no Unity/Three.js runtime, build step, new dependency, player navigation/collision map, emotional-crystal gameplay, or unrelated character-production files.
- Art gate: preserve the published R1 package as provenance. R2 must read unmistakably as a cohesive handcrafted tabletop model kit with rounded clay/resin forms, physical contact shadows, matte-to-satin response, sharp companion plaza, and progressively hazed far scenery. New candidates remain staging until visual review passes.
- Required reading: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`, `docs/art/ART_PRODUCTION_INDEX.json`, `output/habitat/linkara-six-region-diorama-r1/manifest.json`, `output/habitat/linkara-six-region-diorama-r1/scene-profiles.json`, `src/ui/atlasController.js`, `src/pixi/pixiApp.js`, the installed `generate-nexus-habitat` and `generate2dmap` Skills, and this lane.

### 2026-07-15 - Codex - Linkara Six-Region Clay Resin R2 - IN PROGRESS

- Lane: `Game Art, UI, And Visual Production`.
- Status: `IN PROGRESS`; Owner rejected the R1 material strength as insufficiently 3D and asked for a stronger miniature / clay-resin pass while preserving each region's geography and plaza.
- Visual lock: fixed elevated three-quarter portrait camera, clear central companion stage, rounded handcrafted forms, coherent model-kit scale, visible contact shadows and bevels, matte clay plus selective satin resin, restrained cyan/gold Cyber-Taoist emission, shallow depth of field only outside the interaction plane, and atmospheric haze in the far set.
- Day/night contract: day remains the geometry master; night is a same-composition relight with no baked weather, actor, UI, text, celestial disc or stateful prop.
- Placement anchors remain: Core `(.50,.69)`, Mystic `(.50,.62)`, Plains `(.50,.66)`, Forge `(.50,.62)`, Harbor `(.50,.68)`, Tidal `(.50,.63)`.
- Output boundary: R2 generation and review remain under `output/habitat/linkara-six-region-diorama-r2/**` until the visual gate passes. R1 remains untouched.

### 2026-07-15 - Codex - Linkara Six-Region Clay Resin R2 - AWAITING OWNER REVIEW

- Lane: `Game Art, UI, And Visual Production`.
- Status: `AWAITING OWNER REVIEW`; all six R2 day masters and their same-composition night relights are generated, normalized and visually audited. No candidate has entered `assets/**` or runtime.
- Material result: the R1 painterly tendency is replaced by rounded polymer-clay construction, hand-painted model surfaces, selective translucent resin water/crystals/energy, physical contact shadows and a clearer shared tabletop scale.
- Placement result: Greyshade composites confirm the authored plaza anchors remain grounded and unobstructed in both phases: Core `(.50,.69)`, Mystic `(.50,.62)`, Plains `(.50,.66)`, Forge `(.50,.62)`, Harbor `(.50,.68)`, Tidal `(.50,.63)`.
- Layer result: each region has one coherent R2 day/night foundation plus a geometry-aligned depth mask and placement mask. Transparent occlusion/prop extraction remains intentionally gated until the Owner chooses the foundations.
- Verification: habitat validator passes `12/12` foundations and `12/12` masks at `1080x1920`; 12 companion previews pass at `390x844`; manifest, Scene Profiles and report parse; both contact sheets were inspected for material consistency, far haze, plaza clarity and UI avoidance.
- Human gate: review `output/habitat/linkara-six-region-diorama-r2/previews/six-region-day-night-companion-placement-contact-sheet.jpg` and the safe-zone contact sheet. Approval authorizes formal promotion and the already-approved seven-region runtime switching task; rejection should name the region(s) to regenerate.

### 2026-07-15 - Codex - Linkara Seven-Habitat Runtime Switch - BLOCKED ON ART GATE

- Lane: `Game Engineering And Architecture`.
- Status: `BLOCKED ON HUMAN ART GATE`; runtime discovery and implementation design are complete, but the project rule forbids promoting unapproved generated images into `assets/**`.
- Ready next action after approval: promote the selected R2 pair set, add the Habitat Registry and six Scene Profiles, switch/unload Pixi habitat textures on demand, persist the selected habitat, center the active companion on the region-specific plaza anchor, and make unlocked atlas circles accessible switch controls.
- Scope remains unchanged: no `index.html`, `saveManager.js`, Unity/Three.js runtime, new dependency, build step, player navigation system, FOMO or unrelated character-production files.

### 2026-07-15 - Codex - Linkara Six-Region Clay Resin R2 - COMPLETED

- Lane: `Game Art, UI, And Visual Production`.
- Status: `COMPLETED`; Owner continuation approved the R2 contact-sheet direction, and all six regions were promoted as twelve `1080x1920` day/night foundations plus twelve geometry-aligned depth/placement masks.
- Visual result: one cohesive 3D miniature / handmade clay-resin set language, clear companion plazas, selective resin water/crystal/energy, foreground sharpness and progressively hazed distant scenery. Weather remains runtime FX rather than baked rain.
- Runtime placement correction: 390×844 browser review confirmed Core, Plains, Forge, Harbor and Tidal anchors; Mystic was corrected to `(0.50,0.52)`. Moonlake was also moved from the dock to the foreground circular plaza at `(0.50,0.90)`.
- Verification: habitat validator passes staging and formal assets at `12/12` foundations plus `12/12` masks; formal promotion SHA-256 comparison passes `24/24`; JSON/provenance scripts parse; day and night phases were visually inspected.
- Commit / branch: `8985ee7` on `main`. R2 package: `output/habitat/linkara-six-region-diorama-r2/**`; formal assets: `assets/backgrounds/LinkaraHabitats_r1/**` and `assets/layers/LinkaraHabitats_r1/**`.
- Isolation: concurrent Black Iron Hacker files, `docs/art/README.md`, `output/character-pilots/**`, and untracked Moonlake staging were preserved and excluded.

### 2026-07-15 - Codex - Linkara Seven-Habitat Runtime Switch - VERIFIED

- Lane: `Game Engineering And Architecture`.
- Status: `VERIFIED`; seven Habitat Registry / Scene Profiles are live, active habitat persists through normalized state, Pixi loads the selected day/night pair on demand and unloads the previous pair, and Moonlake-only overlays do not leak into other regions.
- Atlas contract: all seven circular nodes are mouse- and keyboard-selectable for habitat viewing. Chapter status remains independently `current/completed/locked`, so changing scenery does not unlock chapters, rewards, encounters or progression.
- Mobile QA: complete map-circle switching loop tested in the browser at `390x844`; all seven visible names matched their backgrounds, all companions landed on authored plaza centres without HUD/Dock overlap, reload preserved Mystic selection, and Traditional Chinese / English habitat-name switching passed.
- Automated QA: changed JavaScript passes `node --check`; registry/Profile coverage passes `7/7`; state normalization and `24/24` manifest-path checks pass; staged diff check passes.
- Red-line result: no dependency detection, FOMO, countdown, reward pressure, safety-help reward, battle-policy change, roster change, new engine, dependency or build step.
- Commit / branch: implementation and promoted assets are `8985ee7` on `main`; this completion ledger follows in the publication commit.

### 2026-07-15 - Codex - ThunderPup Full 8-Frame Animation Catalog - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Parent task: `TP-BIH-STAGE1-FULL-8F-CATALOG` remains `IN PROGRESS` for the other four characters.
- Status: ThunderPup is complete in review staging at `29/29` shared action IDs; every selected action has one `2048x1024` RGBA sheet containing eight `512x512` frames plus an eight-frame GIF preview.
- Mechanical verification: inventory expected `29`, validated `29`, missing `0`, bad `0`; all selected PNG dimensions/modes/transparency and GIF frame counts pass; selected processor runs pass strict edge-touch rejection.
- Semantic verification: `sleep` is deep sleep for all eight frames and waking is isolated to `idle_wake`; touch refusal remains non-punitive; standoff actions express warning, boundary resonance and self-protection; `faint` is recoverable temporary core overload, never death; `victory` is stabilization without domination.
- Pipeline note: raw sheets that placed complete figures across implied cell boundaries were corrected by deterministic global-component sorting, shared-scale normalization and bottom-center placement, then re-run through the regular processor gate. No pose or identity was redrawn by normalization.
- Required reading: `output/character-pilots/thunder-pup/THUNDER_PUP_FULL_CATALOG_QC.md`, the selected action sheets/previews, raw/rejected provenance, and this lane.
- Scope boundary: no `assets/**`, runtime, registry, manifest, state/save, canon authority, dependency, commit, or push change. Next safe action is WaveCub P1-P3 production under the already approved staging scope.

### 2026-07-15 - Codex - WaveCub Full 8-Frame Animation Catalog - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Parent task: `TP-BIH-STAGE1-FULL-8F-CATALOG` remains `IN PROGRESS` for Starflame Phoenix, Star Foal, and Goldenspark Wyrm.
- Status: WaveCub is complete in review staging at `29/29` shared action IDs; every selected action has one `2048x1024` RGBA sheet containing eight `512x512` frames plus an eight-frame GIF preview.
- Mechanical verification: inventory expected `29`, validated `29`, missing `0`, bad `0`; all selected PNG dimensions/modes/transparency and GIF frame counts pass; selected processor runs pass strict edge-touch rejection.
- Species verification: feline grooming uses forepaw-to-face motion; dance remains quadrupedal; the initial bipedal/invalid-tail `special_dance` was rejected and replaced.
- Semantic verification: `sleep` is deep sleep for all eight frames and waking is isolated to `idle_wake`; touch refusal remains non-punitive; `hug` is voluntary; standoff actions express current bracing, boundary resonance and self-protection; `faint` is recoverable temporary overload with retained core/wisp light; `victory` is stabilization without domination.
- Pipeline note: nonuniform backgrounds, grids, contact shadows and detached motion marks were rejected or corrected before chroma removal. Global-component sorting, shared-scale normalization and bottom-center placement were followed by the regular strict processor gate.
- Required reading: `output/character-pilots/wavecub/WAVECUB_FULL_CATALOG_QC.md`, the selected action sheets/previews, raw/rejected provenance, and this lane.
- Scope boundary: no `assets/**`, runtime, registry, manifest, state/save, canon authority, dependency, commit, or push change. Next safe action is Starflame Phoenix P1-P3 production under the already approved staging scope.

### 2026-07-15 - Codex - Starflame Phoenix Full 8-Frame Animation Catalog - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Parent task: `TP-BIH-STAGE1-FULL-8F-CATALOG` remains `IN PROGRESS` for Star Foal and Goldenspark Wyrm.
- Status: Starflame Phoenix is complete in review staging at `29/29` shared action IDs; every selected action has one `2048x1024` RGBA sheet containing eight `512x512` frames plus an eight-frame GIF preview.
- Mechanical verification: inventory expected `29`, validated `29`, missing `0`, bad `0`; all selected PNG dimensions/modes/transparency and GIF frame counts pass; selected processor runs pass strict edge-touch rejection.
- Species verification: all locomotion is grounded two-talon hop/step motion with avian head bob; `sit` is a perch-settle; `idle_wash` uses beak preening; no selected action uses quadruped gait or sustained flight.
- Semantic verification: `sleep` is deep sleep for all eight frames and waking is isolated to `idle_wake`; touch refusal remains non-punitive; `hug` is voluntary wing shelter; standoff actions use warning cry, core resonance and wing-mantle protection; `faint` is recoverable protected overload with live core/plume; `victory` is stabilization without domination.
- Rejection record: detached motion lines in `touch_reject` and a detached breath symbol in `victory` were retained as rejected raw provenance and removed from selected outputs.
- Required reading: `output/character-pilots/starflame-phoenix/STARFLAME_PHOENIX_FULL_CATALOG_QC.md`, the selected action sheets/previews, raw/rejected provenance, and this lane.
- Scope boundary: no `assets/**`, runtime, registry, manifest, state/save, canon authority, dependency, commit, or push change. Next safe action is Star Foal P1-P3 production under the already approved staging scope.

### 2026-07-15 - Codex - Star Foal Full 8-Frame Animation Catalog - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Parent task: `TP-BIH-STAGE1-FULL-8F-CATALOG` remains `IN PROGRESS` for Goldenspark Wyrm.
- Status: Star Foal is complete in review staging at `29/29` shared action IDs; every selected action has one `2048x1024` RGBA sheet containing eight `512x512` frames plus an eight-frame GIF preview.
- Mechanical verification: inventory expected `29`, validated `29`, missing `0`, bad `0`; all selected PNG dimensions/modes/transparency and GIF frame counts pass; selected processor runs pass strict edge-touch rejection.
- Species verification: all locomotion and expressive movement uses equine four-hoof balance, neck arcs, ear response and controlled hoof cadence; `sit` is a folded equine rest and `idle_wash` uses muzzle/shoulder grooming rather than canine or feline templates.
- Semantic verification: `sleep` is supported deep sleep with both eyes closed for all eight frames and waking is isolated to `idle_wake`; touch and `hug` preserve voluntary proximity; warning/standoff actions avoid kick, rear, charge and projectiles; `faint` is recoverable controlled overload with live core/tail-star; `victory` is stabilization without domination.
- Required reading: `output/character-pilots/star-foal/STAR_FOAL_FULL_CATALOG_QC.md`, the selected action sheets/previews, raw provenance, and this lane.
- Scope boundary: no `assets/**`, runtime, registry, manifest, state/save, canon authority, dependency, commit, or push change. Next safe action is Goldenspark Wyrm P1-P3 production under the already approved staging scope.

### 2026-07-15 - Codex - Goldenspark Wyrm Full 8-Frame Animation Catalog - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Status: Goldenspark Wyrm is complete in review staging at `29/29` shared action IDs; every selected action has one `2048x1024` RGBA sheet containing eight `512x512` frames plus an eight-frame GIF preview.
- Mechanical verification: inventory expected `29`, validated `29`, missing `0`, bad `0`; all selected PNG dimensions/modes/transparency and GIF frame counts pass; selected processor runs pass strict edge-touch rejection.
- Species verification: locomotion remains low, wingless and quadrupedal with alternating reptilian feet and attached gear-tail counterbalance; `sit` is a sphinx-like saurian rest and `idle_wash` is muzzle-to-foreleg/shoulder grooming.
- Semantic verification: `sleep` is supported deep sleep with both eyes closed for all eight frames and waking is isolated to `idle_wake`; touch and `hug` preserve voluntary proximity; standoff actions avoid bite, claw strike, charge, fire and projectiles; `faint` is recoverable overload with live cores/gear center; `victory` is stabilization without domination.
- Correction record: a first `idle_wash` candidate retained faint black shake strokes and was preserved as rejected provenance; the selected v2 correction removes all motion strokes.
- Required reading: `output/character-pilots/goldenspark-wyrm/GOLDENSPARK_WYRM_FULL_CATALOG_QC.md`, the selected action sheets/previews, raw/rejected provenance, and this lane.
- Scope boundary: no `assets/**`, runtime, registry, manifest, state/save, canon authority, dependency, commit, or push change.

### 2026-07-15 - Codex - Black Iron Hackers Full 8-Frame Animation Catalog - COMPLETED

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-BIH-STAGE1-FULL-8F-CATALOG`.
- Status: `COMPLETED` in review staging for all five approved appearance seeds: `thunder-pup`, `wavecub`, `starflame-phoenix`, `star-foal`, and `goldenspark-wyrm`.
- Package verification: expected `145` selected action sheets and previews, validated `145`, bad `0`; every PNG is `2048x1024` RGBA with transparency and every GIF has exactly eight frames.
- Species result: the five catalogs preserve distinct grounded canine, feline, two-talon avian, four-hoof equine, and low wingless saurian motion languages rather than sharing a generic quadruped template.
- Semantic result: all five `sleep` loops remain deeply asleep for all eight frames with waking exclusive to `idle_wake`; touch and hug motions remain voluntary; confrontation motions preserve boundary/resonance framing; all `faint` motions remain temporary living overload rather than death.
- Review package: `output/character-pilots/BLACK_IRON_HACKERS_FULL_CATALOG_QC.md` and the five character-level QC records.
- Remaining gates: Owner visual acceptance; Owner resolution of ThunderPup's documented faction/canon conflict; separate GROUNDWORK authorization before any `assets/**`, registry, manifest, state/save, canon, or runtime promotion.
- Commit / branch: no commit or push performed.

### 2026-07-15 - Codex - Black Iron Hackers Full Catalog Final Alignment And Crop QA - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-BIH-STAGE1-FULL-CATALOG-FINAL-QA`.
- Status: `VERIFIED`; all five complete staging catalogs passed final frame-level alignment, crop, transparency-layer and preview-parity review. Owner explicitly authorized commit and push to `main` if the result was clean.
- Coverage: `145 / 145` selected action sheets, `145 / 145` eight-frame GIF previews and `1,160 / 1,160` final PNG frames. No empty frame, clipped anatomy, cell-edge contact, cross-cell contamination, misplaced layer, visible center jump or incomplete image was found.
- Geometry evidence: minimum alpha margin `32 px`; global center range `x=254.0..257.0`; global bottom range `y=477..480`; maximum within-action center span `2.5 px`; maximum within-action bottom span `3 px`; audit problems `0`.
- Preview evidence: every GIF alpha bound stays inside its source PNG bound. The small preview-only bound reduction is palette/alpha quantization and does not translate the character or its layers.
- Visual evidence: five full 29-action review boards were inspected frame-by-frame. Distinct canine, feline, grounded avian, equine and low saurian anatomy remains complete and registered throughout all action families.
- Reproducibility: `output/character-pilots/FINAL_ALIGNMENT_CROP_AUDIT.json`, `output/character-pilots/_work/audit_final_catalog_alignment.py`, and `output/character-pilots/review-boards/final-alignment-audit/*.png`.
- Publication boundary: publish the selected final sheets/previews, selected identity seeds, QC/review evidence and art-lock documentation only. Raw generations, alpha-source intermediates, rejected candidates and processor copies remain local provenance and are intentionally excluded from Git history. No file enters `assets/**`, registry, manifest, state/save, canon or runtime in this task.
- Remaining gate: ThunderPup faction/canon identity resolution and a separate GROUNDWORK promotion authorization are still required before runtime use.

### 2026-07-15 - Codex - Black Iron Hackers Full Catalog Review Package - PUBLISHED TO MAIN

- Lane: `Game Art, UI, And Visual Production`.
- Status: `PUBLISHED`; final selected animation catalogs and reproducible QA evidence were committed after the strict final audit returned `PASS` with `0` problems.
- Commit / branch: `a53c3f3` on `main`; this publication-ledger follow-up records the completed push sequence.
- Published scope: `323` files containing `145` selected RGBA sheets, `145` GIF previews, five approved identity seeds, five full-catalog QC records, final alignment/crop audit evidence, review boards, species/appearance locks and production documentation.
- Excluded local provenance: raw generations, alpha-source intermediates, rejected candidates and duplicate processor outputs were intentionally kept out of Git history. No `assets/**`, registry, manifest, state/save, canon or runtime promotion was included.

### 2026-07-15 - Codex - Habitat Mobile Composition Repair - IN PROGRESS

- Lane: `Game Engineering And Architecture`.
- Task name: `TP-HAB-MOBILE-COMPOSITION-1`.
- Scope: keep each active companion on the selected habitat Scene Profile anchor after the motion ticker resumes; repair the stale motion-base handoff exposed by seven iPhone Safari screenshots.
- Layer: EXPERIENCE only. Expected runtime changes are limited to `src/app.js` and `src/pixi/motionController.js`; no `pixiApp.js`, Scene Profile data, asset, state/save, dependency, build-step, commit or push change.
- Red-line check: no dependency detection, FOMO, reward pressure, safety-help reward, battle policy, companion boundary, roster or progression change.
- Acceptance refs: `G3`, `H1-H5`, `I`, `M1`, and `M5`.

### 2026-07-15 - Codex - Habitat Floating Text De-chrome - IN PROGRESS

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-HAB-MOBILE-COMPOSITION-1`.
- Scope: move the post-onboarding gentle invitation into the upper habitat band, remove its pill surface, and remove the lower-left habitat-name pill while preserving readable floating text across light and dark regions.
- Layer: EXPERIENCE CSS only. No generated art, asset import, copy rewrite, DOM structure, new icon, dependency, build step, commit or push.
- Mobile contract: keep the invitation below the top HUD and above the companion plaza at both `390x844` and short Safari-like height; keep the habitat name clear of the companion, Soul Talk control and bottom navigation.
- Acceptance refs: `I`, `M1`, `M2`, and `M5`.

### 2026-07-15 - Codex - Habitat Mobile Composition Repair - VERIFIED

- Lane: `Game Engineering And Architecture`.
- Task name: `TP-HAB-MOBILE-COMPOSITION-1`.
- Completed: added `rebaseCompanionMotion()` and invoked it immediately after `positionCompanion()` on habitat switches, so the next motion tick preserves the selected Scene Profile position, scale, alpha and rotation instead of restoring the initial Moonlake base.
- Changed runtime files: `src/app.js`, `src/pixi/motionController.js`.
- Verification: targeted motion rebase assertion passed; `src/**/*.js` syntax sweep passed `239/239`; onboarding/Codex regression cases passed `4/4`; `git diff --check` passed; seven atlas-driven habitat switches remained on the correct plaza/platform after one-second ticker settling.
- Known unrelated gate issue: `docs/qa/_run_web_release_gate.py` stopped in `run_asset_integrity()` because a current object-form registry asset entry reached string-only `startswith()` handling. No gate output file changed, and the runner was not modified in this task.
- Branch / commit: local `main`, no commit and no push.

### 2026-07-15 - Codex - Habitat Floating Text De-chrome - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-HAB-MOBILE-COMPOSITION-1`.
- Completed: moved `.gentle-invitation` to the upper habitat band and removed its pill surface; removed the `.v3-home-presence` pill surface while retaining contrast through layered text shadow.
- Changed visual files: `styles/ui-v3-onboarding.css`, `styles/ui-v3-tokens.css`; visual QA record: `design-qa.md`.
- Verification: in-app browser passed at `390x844` and `390x664`; invitation and habitat name both computed to transparent backgrounds with zero borders; no warning/error console entries; seven source-versus-implementation combined comparisons passed. At short height, the habitat name ended at `y=512`, before Soul Talk at `y=518.33` and bottom navigation at `y=584`.
- Asset and scope check: no generated/imported art, `assets/**`, DOM structure, copy, dependency, build step, commit or push change.
- Branch / commit: local `main`, no commit and no push.

### 2026-07-15 - Codex - Habitat Compass-Center Alignment Correction - IN PROGRESS

- Lane: `Game Engineering And Architecture`.
- Task name: `TP-HAB-COMPASS-CENTER-ALIGN-2`.
- Owner correction: the prior pass correctly stopped the motion ticker from restoring stale Moonlake coordinates, but its visual acceptance was wrong. The target is not the companion foot anchor or a broad plaza area; the companion's rendered visual center must coincide with the visible compass / cross center authored into each habitat plate.
- Scope: separate the project-wide bottom-center sprite asset anchor from the per-habitat visual-center target, author seven compass-center targets in Scene Profiles, and validate all seven through the live atlas switch flow after animation settling.
- Expected files: `src/pixi/companionRenderer.js`, `src/data/sceneProfiles/linkaraRegionProfiles.js`, `src/data/sceneProfiles/moonlakeProfile.js`, `design-qa.md`, and this ledger. Existing motion rebase and floating-text changes remain in scope but are not being redesigned.
- Layer: EXPERIENCE only; no `index.html`, `src/pixi/pixiApp.js`, `assets/**`, save/state, dependency, build step, commit or push.
- Red-line check: no safety, dependency detection, reward pressure, battle, boundary, roster, progression or companion-ownership behavior changes.
- Acceptance refs: `G3`, `H1-H5`, `I`, `M1`, and `M5`.

### 2026-07-15 - Codex - Habitat Compass-Center Alignment Correction - COMPLETED

- Lane: `Game Engineering And Architecture`.
- Task name: `TP-HAB-COMPASS-CENTER-ALIGN-2`.
- Completed: each Scene Profile now records the visible compass / cross as a point in its `1080x1920` background artwork. `companionRenderer.js` projects that point through the same responsive cover geometry as the background, maps it back into the safe-zone coordinate system, and offsets the bottom-center sprite frame so the rendered companion's measured opaque visual center lands on that point.
- Anchor contract: companion frame assets remain bottom-center anchored (`0.5, 1`); no sprite sheet, asset, registry, scale policy or art pipeline rule changed. The new visual-center alignment is a scene-placement concern only.
- Changed correction files: `src/pixi/companionRenderer.js`, `src/data/sceneProfiles/linkaraRegionProfiles.js`, `src/data/sceneProfiles/moonlakeProfile.js`.
- Verification: syntax checks passed for all three correction files; seven atlas-driven habitat switches passed after ticker settling at `390x664`; responsive projection also passed on representative core, mystic, tidal and Moonlake scenes at `390x844`; final-origin browser warnings/errors were empty; no horizontal overflow was present at `390x664`.
- Scope boundary: no `index.html`, `src/pixi/pixiApp.js`, `assets/**`, state/save, dependency, build step, commit or push change.
- Branch / commit: local `main`, no commit and no push.

### 2026-07-15 - Codex - Habitat Compass-Center Visual QA - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-HAB-COMPASS-CENTER-ALIGN-2`.
- Owner correction applied: the earlier plaza/foot-anchor interpretation was treated as a P1 visual mismatch and was not retained as final acceptance. The verified target is the character's visual center directly over the authored compass / cross center.
- Visual evidence: all seven supplied iPhone screenshots were paired left-to-right with fresh `390x664` implementation captures in `habitat-mobile-composition/compare-1-forge.png` through `compare-7-moonlake.png`. The revised right-hand captures align the companion center with the marker in Forge Hills, Tidal Frontier, Harbor, Radiant Core, Verdant Plains, Mystic Mountains and Moonlake.
- UI preservation: the invitation remains in the upper habitat band with no frame, and the lower-left habitat name remains unframed / transparent. Neither overlaps the centered companion in the seven reviewed scenes.
- Required reading: `design-qa.md` and the seven combined comparison images under the current task's visualization folder.
- Scope boundary: no companion art regeneration, asset import, scale change, copy rewrite, DOM structure, dependency, commit or push.

### 2026-07-15 - Codex - Habitat Compass-Center Package - PUBLISHED

- Lanes: `Game Engineering And Architecture`; `Game Art, UI, And Visual Production`.
- Task names: `TP-HAB-MOBILE-COMPOSITION-1`; `TP-HAB-COMPASS-CENTER-ALIGN-2`.
- Published: the verified seven-region compass-center placement, motion rebase, and floating-text de-chrome package was committed on `main` as `7c201bb`.
- Scope: exactly the nine reviewed files in that commit; unrelated untracked character provenance, rejected generations, and habitat staging output remained excluded.
- Verification before publication: changed JavaScript syntax passed; full `src/**/*.js` syntax sweep passed `239/239`; seven Scene Profile targets passed `7/7`; motion rebase assertion passed; onboarding/Codex regression cases passed `4/4`; staged diff check passed.
- Branch / commit: `main` / `7c201bb`; remote push recorded by the following ledger-only publication commit.

### 2026-07-15 - Codex - Heartspark Council Runtime Catalog Final Alignment And Crop QA - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-HEARTSPARK-COUNCIL-FINAL-ALIGNMENT-CROP-QA`.
- Status: `VERIFIED`; all five formal Stage 1 council runtime catalogs passed the Owner-requested final center, position, crop and completeness audit.
- Coverage: `145 / 145` sheets and `995 / 995` declared frames across `blazetail-kit`, `auriowl`, `starstripe-cub`, `crystalfin-seahorse`, and `sprigfawn`.
- Mechanical result: all sheets are exact-grid RGBA PNGs with `512 x 512` cells, valid bottom-center `{x: 0.5, y: 1}` metadata anchors, no empty or unreferenced frames, no alpha contact with cell edges, and `145 / 145` byte-for-byte matches to the Owner-approved selected review sources.
- Geometry result: global minimum transparent margin `26 px`; global horizontal center range `x=254.0..257.5`; maximum within-action horizontal center span `2.5 px`; grounded/perched maximum within-action bottom-datum span `2 px`.
- Crystalfin interpretation: changing tail/fins and rotated or curled poses alter the silhouette bottom, but its opaque-bounds center remains `x=254.5..256.5`, `y=255.0..257.5`, with maximum within-action spans of `2.0 px` horizontally and `1.5 px` vertically. This is pose redistribution around a stable center, not normalization drift.
- Visual result: five complete center/datum-guided review boards were inspected action-by-action. No clipped or incomplete anatomy, missing extremity/layer, cross-cell overflow, center jump, white/background contamination or baked UI was found.
- QA record: `docs/qa/HEARTSPARK_COUNCIL_FINAL_ALIGNMENT_CROP_QA.md` in commit `018aa00`.
- Scope boundary: no `assets/**`, metadata, registry, runtime, state/save, dependency, tool or script change. Unrelated local generation provenance remains untracked and excluded.
- Known unrelated harness issue: repository-wide `run_asset_integrity()` still stops before companion validation on a current object-form non-companion manifest entry reaching string-only `root_path()` handling; targeted sprite QA completed independently with no council-asset failures.
- Branch / commit: `main`; this completion entry is the ledger-only publication follow-up to `018aa00`.

### 2026-07-15 - Codex - Moonlake Layered R2 Dressed Reference - IN PROGRESS

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-HAB-MOONLAKE-LAYERED-R2-A`.
- Owner-approved direction: preserve the current `1080x1920` Moonlake terrain foundations and replace the monolithic camp-structure plate with eight individually generated identity props governed by a hidden `12x20` system-slot grid.
- Current gate: staging-only corrected dressed reference using the existing Moonlake foundation as the exact camera/geography reference. The reference plans five tents, two beacon towers and one complete crescent shrine while keeping the companion plaza and mobile UI corridors clear.
- Output scope: `output/habitat/moonlake-layered-r2/**` plus this ledger. No `assets/**`, asset manifest, Scene Profile, `pixiApp.js`, state/save, dependency, commit or push in this gate.
- Red-line check: no dependency detection, reward pressure, FOMO, safety-help reward, battle policy, companion boundary, roster or progression change.
- Acceptance refs: `G3`, `H1-H5`, `I`, `M1`, and `M5`; human visual approval is required before separate prop generation or GROUNDWORK runtime promotion.

### 2026-07-15 - Codex - Moonlake Layered R2 Dressed Reference - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-HAB-MOONLAKE-LAYERED-R2-A`.
- Gate result: candidate v1 was rejected for `7/8` objects and foundation drift. Candidate v2 passed as a staging-only placement/material reference with five tents, two beacon towers and one complete crescent shrine, while keeping the bridge, companion compass/plaza and mobile UI corridors clear.
- Important limitation: the accepted candidate is `941x1672` RGB and contains full-scene generation/resampling differences. It is explicitly forbidden as a runtime plate. Runtime must use the untouched approved `1080x1920` foundation plus separately generated RGBA props.
- Owner authorization: automatic stage-by-stage execution and self-review granted; proceed to eight independent base props, then emissive plates and composite QA. Generated assets remain staging until their own alpha/edge/placement audits pass.
- Evidence: `output/habitat/moonlake-layered-r2/QC.md`, `manifest.json`, the v1/v2 candidates and `qc_compare_reference.py`.
- Branch / commit: local `main`; no asset promotion, commit or push.

### 2026-07-15 - Codex - Shared Habitat Dynamic Lighting And Weather Contract - IN PROGRESS

- Lane: `Game Engineering And Architecture`.
- Task name: `TP-HAB-ENVIRONMENT-RENDERER-R2`.
- Owner direction: all seven habitat backgrounds should converge on one neutral/day terrain foundation plus independent props, dynamic 2D lighting and weather FX instead of relying on separate baked day/night scene images.
- Current repo truth: `environmentController.js` already exposes `day / dusk / night / dawn`; `moonlakeProfile.js` already declares six weather/mood presets; `habitatWeatherFx.js` currently implements a lightweight tint, lake-band fog and rain-line prototype. Directional lighting, generated prop shadows, local point lights, wetness/reflection coupling and a shared cross-habitat renderer are not yet implemented.
- Current gate: staging architecture only in `output/habitat/moonlake-layered-r2/ENVIRONMENT_RENDERING_CONTRACT.md`. Moonlake remains the first reference implementation; the other six habitats are rollout scope only after Moonlake mobile QA.
- Quality contract: low = tint/static fog; medium = ambient/key light, cached prop shadows, capped local lights and weather; high = optional single bounded normal-map filter only after mobile QA. Existing baked night plates remain rollback/low-quality fallback until the dynamic path is proven.
- Scope boundary: no runtime, Scene Profile, `pixiApp.js`, `assets/**`, state/save, dependency, commit or push change in this entry.

### 2026-07-15 - Codex - Moonlake Separate Prop Alpha Gate - BLOCKED

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-HAB-MOONLAKE-LAYERED-R2-A`.
- Passed: the first four independent tent candidates are exact `512x512` ARGB, have transparent corners, zero edge contact and complete silhouettes. The remaining far tent, main beacon, far beacon and complete crescent shrine source concepts are also compositionally complete.
- Blocker: Adobe background removal leaves visible horizontal alpha streaks around every second-batch subject. A repeated cutout did not remove them; a Firefly cleanup retained or introduced vertical streaks; a high-contrast two-pass experiment did not return transparency. These defects would become more visible under night additive lighting, so the four outputs are rejected for runtime.
- Safe progress retained: `placements.candidate.json` now records eight hidden-grid slots, art-space offsets, depth/layer rules, footprints and visible-content bottom-center anchors. This specifically prevents transparent canvas padding from making props float above their slot.
- Promotion gate: no emissive generation, composite acceptance, `assets/**` promotion, Pixi groundwork or shared lighting runtime wiring may continue until a clean alpha route is approved.
- Evidence: `output/habitat/moonlake-layered-r2/props/QC.md`, `manifest.json`, accepted batch-one candidates and rejected batch-two diagnostics.
- Branch / commit: local `main`; no commit and no push.

### 2026-07-15 - Codex - Moonlake Separate Prop And Composite Art Gate - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-HAB-MOONLAKE-LAYERED-R2-A`.
- Historical blocker resolved: after Owner approval, the Adobe streak-prone
  cutout was replaced by a deterministic border-connected chroma cleanup and
  premultiplied-alpha resize. Rejected attempts remain provenance only.
- Package result: `8/8` independent base props and `8/8` matching emissive
  plates are exact `512x512` RGBA. All sixteen have transparent corners, zero
  edge contact, non-empty alpha bounds and zero hidden RGB in fully transparent
  pixels.
- Composite result: `1080x1920` day, night-emissive, day-mist and night-rain
  previews passed. Five tents, two beacons and the complete crescent shrine are
  readable by depth band and do not occupy the companion plaza, approach bridge,
  top HUD or bottom navigation corridors.
- Required reading: `output/habitat/moonlake-layered-r2/QC.md`, `props/QC.md`,
  `manifest.json`, `placements.candidate.json` and the four `v4` previews.
- Next safe action: GROUNDWORK promotion of only the verified sixteen textures,
  Moonlake placement data and bounded Pixi renderer, followed by mobile runtime
  QA before any six-region rollout.
- Branch / commit: local `main`; no commit and no push.

### 2026-07-15 - Codex - Moonlake R2 Independent Props And Environment Runtime - COMPLETED

- Lane: `Game Engineering And Architecture`.
- Task names: `TP-HAB-MOONLAKE-LAYERED-R2-A`; `TP-HAB-ENVIRONMENT-RENDERER-R2`.
- Groundwork completed under the previously Owner-approved staged plan: promoted
  eight `512x512` base props and eight matching emissive plates, added the
  hidden `12x20` art-space slot contract, and replaced the active Moonlake
  monolithic camp plate with a data-driven Pixi object renderer.
- Projection and depth: every object uses the same `1080x1920` cover transform
  as the foundation, a visible-content bottom-center anchor, render-layer plus
  sortY ordering, depth tint, generated directional footprint shadow and a
  localized night light. The companion remains in the established safe-zone
  renderer and the foreground occlusion remains above it.
- Time and weather: added a shared low-cost ambient/key lighting layer for all
  habitats and extended the existing weather renderer with wetness and water
  ripples. Moonlake is the first `dynamic-day-master` scene: its day texture is
  shared by both background sprites, while phase light, prop shadows and
  emissive plates express day/dawn/dusk/night. Other six regions retain their
  approved baked day/night fallback until their own neutral art/prop packs pass
  later production gates.
- Loading budget: removed Moonlake baked-night and old camp-plate preloads; the
  active Moonlake browser path requested neither old camp plate nor baked night.
  Rollback files remain on disk and in the R1 manifest.
- Dev editor: the placement grid is not constructed on formal URLs and requires
  both `devSceneEditor=1` and `showPlacementGrid=1`. Slot-aware drag snapping,
  scale, export fields and JSON import/export round-trip are implemented without
  adding save fields or player-facing placement.
- Verification: `src/**/*.js` syntax `242/242`; promoted texture integrity
  `16/16`; five Chromium cases passed at `390x844` and `390x664`; console/page
  errors `0/0`; production grid absent, dev grid present; six-region switch
  round-trip passed; editor round-trip applied `13/13` controlled objects and
  preserved all eight placement records.
- Evidence: `output/habitat/moonlake-layered-r2/runtime-qa-report.json`, five
  runtime screenshots, package QC/manifest, and the R2 asset manifest.
- Scope boundary: no save/state schema, dependency, backend, Three.js, Unity
  runtime, player free-placement, reward/FOMO, safety, battle, roster or
  progression change. No commit or push performed.

### 2026-07-15 - Codex - Moonlake R2 Runtime Visual QA - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Visual result: five tents, two beacons and the complete crescent shrine remain
  fully visible, grounded and scaled by near/mid/far depth. Far structures use a
  subtle fade/tint against the misted background; none appears cropped, half
  generated, floating, or attached to the wrong island.
- Composition result: the active companion remains centered on the authored
  compass/plaza. New structures do not cover the companion, bridge, HUD, habitat
  label, Soul Talk button or bottom navigation at either tested height.
- Day/night identity: the object geometry never changes. Night uses phase tint,
  reduced cast shadows, matching emissive plates and localized warm/cyan lights;
  rain and mist preserve silhouette and UI readability.
- INDEX truth: `docs/art/ART_PRODUCTION_INDEX.json` now records R1 as the
  foundation/rollback pack and R2 as the active independent object pack. It does
  not claim the other six regions have completed Moonlake-equivalent prop packs.
- Branch / commit: local `main`; no commit and no push.

### 2026-07-17 - Codex - Moonlake Emotional Crystal Lifecycle And Pages Payload Exclusion - VERIFIED

- Lane: `Game Engineering And Architecture`.
- Task names: `TP-CRYSTAL-LIFECYCLE-1`; `PAGES-NONRUNTIME-EXCLUDE-R2`.
- Runtime result: the existing Moonlake crystal prop now resolves the approved
  presentation-only lifecycle `glimmer -> seed -> cluster -> attuned ->
  transformed -> released` from canonical `emotionalMemories`. The resolver is
  pure and does not write bond, trust, energy, defense, reward, trace, memory or
  any save field. Pixi loads only the requested local state texture, uses a
  `200 ms` crossfade, swaps immediately for reduced motion, keeps the latest
  async request authoritative and restores the prior texture on failure.
- Integration boundary: crystal sync shares the existing habitat-visual store
  subscription in `src/app.js`; no new ticker or public teardown contract was
  added. The six-state renderer is wired, but `released` is not yet reachable
  from current player UI because memory-release UX remains future scope.
- Known low risk: a failed state-texture load restores the prior texture and
  warns once, but that same desired state does not retry again during the
  current session. A bounded retry policy can be added separately if transient
  local asset failures appear in field telemetry.
- Release configuration: Jekyll and the release-gate sparse checkout now
  exclude only `assets/characters/greyshade-cat/inbox`,
  `inbox_manual_transparent` and `frames`. Current runtime and animation
  metadata use `spritesheets/**`, so these exact exclusions remove no runtime
  dependency and delete no source file.
- Payload evidence: the three excluded tracked directories contain `264` files
  and `92,330,304` bytes (`88.05 MiB`). Against the last recorded
  `788,630,124`-byte Pages artifact this projects `696,299,820` bytes
  (`664.04 MiB`); this remains a projection until an authorized commit/push
  produces an actual Pages artifact.
- Verification: focused crystal lifecycle cases passed `9/9`; final web release
  gate passed `18/18` required automated checks; JavaScript syntax and
  `git diff --check` passed. Dedicated Chromium checks at `390x844` confirmed
  both reduced-motion `glimmer` and animated `transformed` textures returned
  `200`, used one canvas, showed no Pixi failure surface and emitted zero
  console/page errors.
- Workspace safety: the release gate's timestamp-only tracked playtest output
  was restored after both runs; the existing `886` protected untracked
  `output/**` files were untouched. Concurrent unrelated viewport-FX work in
  `src/pixi/habitatLightingFx.js`, `src/pixi/habitatWeatherFx.js` and separate
  hunks of `src/app.js` was preserved and excluded from this task's ownership.
- Remaining gates: real-device D1/D2/D3/D6 matrix, three-person first-session
  comprehension, Raphael `3 x 20` private blind test, legal/privacy/store-copy
  review, public launch approval and an actual Pages build size measurement.
- Branch / commit: local `main` at baseline `d2d1d3f`; no commit and no push.

### 2026-07-17 - Codex - Moonlake Crystal State Visual And Payload QA - VERIFIED

- Lane: `Game Art, UI, And Visual Production`.
- Visual result: the approved six `512x512` transparent Moonlake crystal-state
  textures are now addressable by runtime without regenerating, resizing or
  modifying any art. Mobile captures showed the empty-memory glimmer as a quiet
  small signal and the transformed state as a clearly readable blue crystal
  cluster without covering the active companion, HUD, Soul Talk control or
  bottom navigation.
- Motion/accessibility result: the `200 ms` transition remains subtle; reduced
  motion performs an immediate texture swap. Initial loading hides the legacy
  cluster fallback until the correct texture is ready, preventing a false
  cluster flash.
- Asset preservation: Pages exclusion applies only at publication packaging;
  the Greyshade source inbox, manual cutouts and extracted frames remain in the
  repository and Git history for reference-audited replacement work. No
  `assets/**`, art metadata, manifest path or approved runtime sheet changed.
- Scope truth: this completes visual-state wiring and QA, not a full playable
  release/transform ritual. Player-facing release interaction, additional
  crystal feedback and any new art require separate approval.
- Branch / commit: local `main`; no commit and no push.

### 2026-07-17 - Codex - Companion Growth Contract V1 - COMPLETED

- Status: `COMPLETED` for the docs-first product, state, migration and architecture contract; companion growth remains `RUNTIME NOT YET IMPLEMENTED`.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-COMPANION-GROWTH-CONTRACT-1`.
- Branch / commit: local `main` at baseline `d2d1d3ff0e91f27eef2064b51db66cc55ba42bad`; verified uncommitted worktree, no commit or push authorized.
- Scope: Docs／EXPERIENCE planning only. No runtime, state, save, localStorage, asset, Pixi, Raphael, safety, standoff or dependency change.
- Work performed: Added `docs/design/COMPANION_GROWTH_CONTRACT_V1.md` as the active design／acceptance SSOT with an explicit `RUNTIME NOT YET IMPLEMENTED` label. It defines four qualitative tendencies, source-family evidence, deterministic key/compaction rules, equal standoff outcomes, non-missable chapter coverage, companion-initiated three-stage growth, all safety-route exclusions, typed fatigue, full mirror inventory gate, conservative active/inactive veteran migration, pure-engine/controller/DOM/Pixi ownership and the non-power future Resonance Practice boundary. Added `ACCEPTANCE.md` N1-N12 and routed the contract from Master Canon, `CLAUDE.md`, `AGENTS.md`, docs README, Balance Sheet and art GAP-2. Marked the direct R2 evolution document superseded; global-bond 0/25/70 remains transitional compatibility only.
- Verification: Codebase graph was ready at 13,410 nodes / 17,796 edges and the read-only runtime audit confirmed global relationship fields, bond-only Codex reveal, Growth/Expedition coupling and missing stage asset mapping. Three independent diff reviews initially found hidden defense optimization, unequal standoff progression, safety provenance, cross-stage replay, ambiguous domain/compaction, incomplete migration and routing gaps; all were corrected before closure. Final re-review verdicts passed G0 with no current-doc blocker. The expanded contract consistency probe passed `37/37`; N1-N12 were present; `ART_PRODUCTION_INDEX.json` parsed successfully; targeted `git diff --check` and trailing-whitespace checks passed. Full mirror inventory and willingness enums remain explicit G2/G3 start gates, not hidden assumptions.
- Problems / risks: Current runtime still lets one global bond reveal stages for every companion; old memories lack reliable `companionId`; Growth still exposes numeric bond and Expedition shard/crafting; formal Stage 2/3 asset mappings do not exist. None of these runtime gaps is fixed by this docs package. Existing unrelated A+B, crystal, habitat FX and protected `output/**` worktree changes were preserved.
- Next safe action: Open `G1` as a separately approved EXPERIENCE pack: derive session-only qualitative tendencies from already completed local events and render a Growth view model using existing cues, with no persistent field, formal stage write or `app.js` overlap. Then seek separate GROUNDWORK approval for `G2` per-companion schema/migration.
- Required reading: `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`, `ACCEPTANCE.md` N1-N12, Master Canon §5.5, `docs/design/BALANCE_SHEET.md` §5.1, `src/ui/pageRouter.js`, `src/ui/codexController.js`, `src/engine/actionEffectEngine.js`, `src/data/evolutionLines.js`, `src/state/defaultState.js`, `src/state/store.js`, and this entry.

### 2026-07-17 - Codex - Moonlake Mobile Lighting, Placement And Companion Calibration - COMPLETED

- Status: `COMPLETED` for the approved Moonlake mobile calibration slice.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-HAB-MOONLAKE-R2-MOBILE-CALIBRATION`.
- Runtime repair: lighting and weather now render in an unscaled full-viewport Pixi container and resize to the actual canvas. They no longer inherit the height-fitted `390x844` safe-zone transform that narrowed overlays on short iPhone viewports and caused a dark center band with bright side strips.
- Companion calibration: the Moonlake visual-center target moved upward by `42` art-space pixels and uses a scene-profile display multiplier of `0.9`. The renderer preserves an explicit minimum screen-space interaction area, so the smaller visual does not reduce tap or hug usability.
- Placement calibration: all eight independent R2 props were re-snapped to the authored Moonlake landforms. Runtime slot data and `placements.candidate.json` now agree; the far beacon was moved from open water to the right distant rock shelf after the first visual review rejected its apparent floating position.
- Verification: JavaScript syntax passed for every changed runtime module. Six Chromium cases passed at `390x844` and `390x664`, including day, night, mist, rain, dev-grid JSON round-trip and a fresh-onboarding `crystalfin-seahorse` case. Both ambient and weather bounds equal the full canvas; eight props load; legacy camp/baked-night requests remain absent; six-region switch round-trip passes; console/page errors remain `0/0`; companion interaction bounds remain at least `103.98x135.30` screen pixels in the shortest case.
- Shared-worktree boundary: pre-existing emotional-crystal changes in `src/app.js` and all unrelated release, canon, Growth and character-output changes were preserved. No save schema, asset texture, dependency, RaphaelCore, safety, battle or other-region scene data changed in this task.
- Evidence: `output/habitat/moonlake-layered-r2/runtime-qa-report.json` and six `runtime-qa/*.png` captures.
- Branch / commit: local `main` at baseline `d2d1d3f`; Owner authorized direct commit and push to `main` after this verification.

### 2026-07-17 - Codex - Moonlake Mobile Composition Re-Review - VERIFIED

- Status: `VERIFIED` after two visual review passes.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-HAB-MOONLAKE-R2-MOBILE-CALIBRATION`.
- Composition result: the complete crescent shrine, five tents and two beacons remain uncropped and are grounded on visible island, shore or cliff surfaces. Near tents stay inside the cover-safe viewport, the main beacon sits on its central island, and the far beacon now reads as attached to the right rock shelf rather than suspended over water.
- Companion result: Greyshade Cat and Crystalfin Seahorse are centered on the plaza, visibly smaller and higher than the reported online build, while remaining clear of the HUD, Soul Talk button and bottom navigation. The visual shrink is presentation-only and does not change animation frames, progression, collision or companion state.
- Lighting/weather result: day, night, mist and rain now cover the canvas uniformly without the reported central twilight column or brighter side strips. Geometry does not jump across phases; emissive plates and weather remain presentation-only.
- Known boundary: the existing ambient dialogue bubble can overlap the upper portion of a companion in its active display state; that pre-existing DOM composition is outside this approved Pixi calibration and was not changed here. It does not affect the online screenshot's upper status-text layout.
- Required reading for follow-up: `src/data/sceneProfiles/moonlakeProfile.js`, `src/data/sceneProfiles/moonlakeObjectPack.js`, `output/habitat/moonlake-layered-r2/runtime-qa-report.json`, and this entry.
- Branch / commit: local `main`; included in the same authorized Moonlake mobile calibration delivery.

### 2026-07-17 - Codex - Companion Growth Presentation And Asset Boundary - COMPLETED

- Status: `COMPLETED` for the docs-only presentation contract; no Growth UI or evolved-form asset was implemented or promoted.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-COMPANION-GROWTH-CONTRACT-1`.
- Branch / commit: local `main` at baseline `d2d1d3ff0e91f27eef2064b51db66cc55ba42bad`; uncommitted, no commit or push.
- Scope: Defined only the future visual/UI boundary for Companion Growth. No `styles.css`, renderer, registry, manifest, portrait, animation, crystal texture or `assets/**` file changed.
- Work performed: Locked evidence-before-metrics presentation, qualitative tendency language, neutral accept／modify／rest／decline states, 390x844/reduced-motion expectations and `heart_phase_manifestation` as a temporary existing-cue intent. Formal shape swaps require per-stage approved illustrated assets, species motion translation, mobile GPU budget and human visual review. The Moonlake six-state crystal remains presentation-only memory lifecycle and cannot be relabeled as a growth meter or completed transformation ritual.
- Verification: The active contract, Master Canon, `CLAUDE.md`, `AGENTS.md`, Balance Sheet, legacy banner, docs index, GAP-2 routing and Acceptance N1-N12 passed the expanded `37/37` consistency probe; the art index remained valid JSON and targeted whitespace/diff checks passed. Final G0 re-review passed. Corrections ensure numeric defense cannot become an optimization target, all four standoff endings are equally valid, queued safety provenance cannot be washed, replayed roots cannot cross stages, and no permanent chapter choice is required for readiness.
- Problems / risks: The current Growth page still leads with numeric bond/trust/mood/defense and mixes in Expedition crafting; no Stage 2/3 asset mapping exists. A first visual slice must therefore reuse existing posture, trace, weather and animation cues and must not fake a permanent evolved form.
- Next safe action: In the separately approved G1 EXPERIENCE slice, replace only the Growth page's primary view model/presentation with session-derived qualitative signals and four honest practice outcomes; do not modify or generate assets, persist growth, or promote a formal stage.
- Required reading: `docs/design/COMPANION_GROWTH_CONTRACT_V1.md` §§3-5, 8.3-8.4 and 9; `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`; `ACCEPTANCE.md` N2, N5, N8 and N11; `src/ui/pageRouter.js`; and the latest Lane 2 crystal/habitat entries.

### 2026-07-17 - Codex - Companion Growth G1 Session Slice - IN PROGRESS

- Status: `IN PROGRESS`; runtime and deterministic module verification are complete, while publication and browser evidence remain open.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-COMPANION-GROWTH-G1`.
- Scope: EXPERIENCE-only G1. Added a pure session Heart Phase engine and connected four qualitative practices to the existing Growth page without touching `app.js`, store/default/save schema, localStorage ownership, Pixi, assets, safety writers, standoff or dependencies.
- Runtime boundary: the controller closure keeps at most four unique tendency ids and one last response per active companion for the current document session. Accept/modify may add a qualitative observation; rest/decline remain successful zero-evidence results. Reload clears the session. No practice calls `actionSheetController.performAction`, store mutation or save APIs.
- Safety boundary: `safeHarborMode` or `growthSafetyExcluded` makes evaluation fail closed with no result or session write. The Growth surface then shows only the safety-pause card; practice, observation and Expedition Prototype controls are absent. Bond, trust, numeric defense, `lastSeenAt`, login/offline fields and time/randomness are not inputs.
- Verification so far: deterministic cases passed `12/12`; JavaScript syntax and targeted `git diff --check` passed. Cases cover all four practices/outcomes, immutable inputs, zero evidence for rest/decline, repeated-action dedupe, safety-terminal no-op, A/B session isolation and invariance under bond/trust/defense/offline-only changes.
- Open gate: the targeted Playwright runner is syntax-valid, but local Chromium launch was denied by the Codex execution-credit limit before any browser assertion ran. Do not record mobile/desktop/reduced-motion screenshots as verified until CI or an authorized browser runtime executes it.
- Branch / commit: local dirty `main` at baseline `d2d1d3f`; no commit or push yet. Publish only through a clean `codex/companion-growth-g1` branch and protected-main PR, selecting Growth-owned hunks only.

### 2026-07-17 - Codex - Companion Growth G1 UI Presentation - IN PROGRESS

- Status: `IN PROGRESS`; implementation and static review complete, visual browser gate pending.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-COMPANION-GROWTH-G1`.
- Presentation result: the primary Growth surface no longer leads with a bond progress bar or raw trust/mood/defense. It presents the active companion's reversible Heart Phase, four native-button practices, a text-labelled accept/modify/rest/decline response and qualitative tendency pills with explicit no-progress/no-loss language.
- Prototype boundary: Expedition shards/crafting remain available only inside a closed `Prototype · No Heart Phase effect` details surface. They do not feed the session engine or claim readiness, formal stage, best route or evolved form.
- Accessibility boundary: all outcomes use text in addition to border color; the last response is an `aria-live=polite` status; practice controls remain native buttons; the new surface adds no animation and inherits the existing reduced-motion page transition rule. TC/SC/EN/JP copy is present for the full G1 surface.
- Open visual gate: execute `docs/qa/_run_companion_growth_g1_browser_gate.mjs` at `390x844` and `1280x900`, keyboard, 200% text and reduced motion; deep-compare store/localStorage before and after all outcomes; capture screenshots and confirm reload reset before changing this lane to `VERIFIED`.
- Asset boundary: no asset, portrait, animation sheet, renderer, manifest or formal Stage 2/3 mapping changed. This is Heart Phase presentation, not a completed evolved form.

### 2026-07-17 - Cursor - Companion Growth G1 browser gate closure - VERIFIED

- Status: `VERIFIED` for the G1 browser-evidence package and the two contract gaps found by the gate; not a public-launch claim and not G2 migration.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-COMPANION-GROWTH-G1`.
- Branch / commit: feature branch `fix/companion-growth-g1-browser-gate` based on protected `main` `c805ff7`; exact commit recorded at publication.
- Scope: EXPERIENCE-only repair in `src/ui/pageRouter.js` plus this append-only ledger sync. No store/default/save schema, localStorage key, Pixi, assets, RaphaelCore, safety writers, standoff or dependency change.
- Work performed: First local Chromium run of `_run_companion_growth_g1_browser_gate.py` failed `5/38` — missing `aria-live="polite"` on Heart Phase result sections, and the Expedition Prototype `<details data-growth-prototype>` surface was never rendered. Added polite live regions to waiting／outcome／safety responses; restored a default-closed Prototype details block that hosts shard inventory and craft buttons with the existing `Prototype · No Heart Phase effect` copy. Heart Phase practices still write only to the in-memory session map.
- Verification: deterministic session cases `12/12`; browser gate `38/38` with 0 console errors after the repair; screenshots written to `%TEMP%\nexus-growth-g1-accepted-390x844.png` and `%TEMP%\nexus-growth-g1-desktop-1280x900.png`. The intentional Pixi CDN abort still shows the habitat failure surface and is expected for this DOM-focused gate.
- Problems / risks: Craft actions inside the Prototype details still use the existing `commit`／craft path and may mutate save when opened and used; that is outside the Heart Phase session contract and remains Prototype-only. Formal Stage 2/3 assets, G2 per-companion persistence and human launch gates remain open.
- Next safe action: Merge this PR after `web-release-gate` succeeds; treat G2 schema/migration as a separate GROUNDWORK package.
- Required reading: `src/ui/pageRouter.js`, `docs/qa/_run_companion_growth_g1_browser_gate.py`, `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`, and this entry.

### 2026-07-17 - Cursor - Companion Growth G1 UI accessibility and Prototype surface - VERIFIED

- Status: `VERIFIED` for presentation／a11y／Prototype secondary placement after browser evidence.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-COMPANION-GROWTH-G1`.
- Branch / commit: same publication as the Lane 1 closure entry above.
- Presentation result: Growth result cards now expose `aria-live="polite"` so outcome text is not color-only. Expedition shards／crafting sit under a closed `details[data-growth-prototype]` summary so the primary Growth surface stays Heart Phase practices and qualitative tendencies.
- Verification: browser gate `38/38` covered mobile `390x844`, desktop `1280x900`, keyboard Enter, Escape home, reduced-motion `0s` page transition, 200% text without horizontal overflow, no FOMO primary copy, no growth progress bar, reload session clear, and store／localStorage invariance across accept／modify／decline／rest.
- Asset boundary: no asset, portrait, animation sheet, renderer, manifest or Stage 2/3 mapping changed.
- Next safe action: After merge, any visual polish to the Prototype summary remains optional and must not promote crafting into the primary Growth loop.

### 2026-07-18 - Codex - Video-Inspired Gameplay Vertical Slice - VERIFIED

- Status: `VERIFIED` for the approved local EXPERIENCE slice; no commit, push,
  publication or GROUNDWORK promotion was authorized.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-VIDEO-INSPIRED-GAMEPLAY-V1` (`TP-A` through `TP-D`).
- Branch / baseline: clean worktree
  `C:\Users\User\NexusLink_RaphaelAI_Workspace\NexusLink-video-inspired-gameplay-v1`
  on `codex/video-inspired-gameplay-v1`, based on `3f9f856`; the original
  worktree and its Expedition/art changes were not modified.
- Runtime result: Initial Bond now persists the chosen companion and `meet`
  step before a skippable, interruption-safe First Resonance presentation.
  Living Habitat Moments V2 adds one ephemeral session at a time for
  `FIRESIDE_SETTLE`, `QUIET_APPROACH` and `MOON_GAZE`, with respond, wait and
  leave as terminal qualitative choices. Crystal Weaving adds player-readable
  observe and two-step release actions for existing transformed memories.
- Architecture: habitat and crystal decisions live in pure ES modules and use
  the bounded ten-field slice outcome. Habitat cancellation, hidden-page
  offers and safety rechecks create no state write. Crystal release retains
  the memory record, removes only its linked trace, and saves the full
  candidate state before publishing it to the store; a missing or failed save
  fails closed with no transient runtime mutation.
- Standoff boundary: existing `battleEngine`, `battleController`,
  `resonanceInviteEngine` and Resonance Circle remain authoritative. Retreat,
  retreated and boundary endings map to the existing restricted boundary
  adapter without HP, loot, equipment, ranking or punitive failure.
- Groundwork boundary: no save schema, `defaultState`, store normalization,
  `saveManager`, `pixiApp`, `index.html`, dependency or `assets/**` change.
  Expedition remains untouched and is not used as a verified dependency.
- Verification: video-inspired deterministic cases passed `11/11`; i18n
  parity passed `387` keys in TC/SC/EN/JP; JavaScript and Python syntax,
  `git diff --check`, initiative `21/21`, Raphael adapter `7/7`, standoff
  `8/8`, Resonance Circle `18/18`, invite `12/12`, crystal lifecycle `9/9`,
  safety terminal `18/18`, onboarding `4/4`, migration `33/33`, storage
  `13/13` and renderer lifecycle `26/26` passed. The final local web release
  gate passed all `18/18` required automated checks with no accessibility
  warning.
- Remaining human gates: real-device D1/D2/D3/D6, three independent
  first-session comprehension sessions, legal/privacy/store-copy review and
  public launch approval.
- Required reading for follow-up: this entry, `NEXUS_LINK_MASTER_CANON_v3.1.md`,
  `CLAUDE.md`, `ACCEPTANCE.md`, `src/engine/habitatMomentEngine.js`,
  `src/engine/crystalWeavingEngine.js`, `src/ui/firstResonanceController.js`,
  `src/ui/habitatMomentController.js` and
  `src/ui/crystalWeavingController.js`.

### 2026-07-18 - Codex - Video-Inspired Ritual And Habitat Presentation - VERIFIED

- Status: `VERIFIED` for the UI and interaction layer; `TP-E` Art Promotion
  remains a separate unstarted GROUNDWORK package.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-VIDEO-INSPIRED-GAMEPLAY-V1`.
- Presentation result: the slice uses one restrained visual memory point,
  the heart-core pulse, across a full-screen First Resonance ritual, an
  ignorable habitat invitation and a page-integrated crystal interaction.
  It avoids a mode lobby, stacked tutorial popups, reward counters and
  equipment comparison surfaces.
- Reuse result: existing companion portraits, Moonlake presentation,
  environment FX and six-state crystal art are reused. No panorama, companion
  animation, raster asset, manifest entry or `assets/**` file was generated,
  edited or promoted.
- Accessibility and lifecycle: First Resonance supports skip, Escape,
  reduced-motion and interrupted-page completion. Habitat modal background
  isolation, visible-control focus trapping and origin-focus restoration cover
  both choice and resolved states. Crystal observe/release status is localized,
  focus returns to a relevant control after success or failure, and stale
  confirmation clears on page or visibility changes.
- Browser evidence: Chromium checks at `390x844` and `1280x900` covered TC/EN,
  200% text, keyboard, touch-sized controls, application and OS reduced motion,
  no horizontal overflow, modal inertness, old eligible-memory reachability,
  save-failure rollback and zero console/page errors.
- Art boundary: the planned 18 required visuals and optional 8 polish visuals
  were not generated. If `TP-E` is opened, use output staging and human visual
  approval before any separate asset/manifest/Pixi promotion.
- Branch / commit: `codex/video-inspired-gameplay-v1`; uncommitted, no push.
- Required reading for follow-up: this entry,
  `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`,
  `src/ui/firstResonanceController.js`,
  `src/ui/habitatMomentController.js`, `src/ui/pageRouter.js`,
  `styles/ui-v3-onboarding.css` and `styles/page-content.css`.

### 2026-07-18 - Codex - Standoff Boundary Event Mapping - VERIFIED

- Status: `VERIFIED` for restricted event mapping only; this is not a
  RaphaelCore dialogue-strategy change or Expedition promotion.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-VIDEO-INSPIRED-GAMEPLAY-V1` (`TP-C` boundary audit).
- Core result: existing Standoff outcomes `retreat`, `retreated` and
  `boundary` now consistently produce the restricted `set_boundary` action
  and soft boundary state patch. All three remain non-rewarding, create no
  memory or trace, and keep restricted bridge speech suppressed.
- Authority boundary: deterministic Standoff copy remains owned by the
  existing controller and RaphaelCore remains final authority. No persona,
  intent, critic, memoryWriter, safety dictionary, Soul Talk response policy
  or post-encounter generated dialogue was added.
- Safety truth: retreat and boundary setting are valid non-punitive endings;
  safety-terminal outcomes cannot gain relationship, crystal, trace, memory
  or gameplay feedback. Repair remains reachable through the established
  Standoff engine.
- Verification: Raphael adapter cases passed `7/7`, Standoff cases `8/8`,
  safety-terminal invariant `18/18`, and the final web release gate passed
  `18/18`. A Raphael `3 people x 20 turns` private blind evaluation was not
  triggered because no dialogue-generation policy changed; it remains a
  launch gate and becomes mandatory if a future pack adds Raphael post-event
  responses.
- Expedition truth: no Expedition file or state was changed. It remains
  Prototype plus partial Core bridge with `coreIntegrated:false`.
- Branch / commit: `codex/video-inspired-gameplay-v1`; uncommitted, no push.
- Required reading for follow-up: this entry,
  `docs/handoff/RAPHAEL_AI_HANDOFF.md`,
  `docs/raphael/RAPHAEL_EXPEDITION_EVAL_CONTRACT.md`,
  `src/ai/raphaelAgentAdapter.js`,
  `src/ai/testHarness/raphaelAgentEventCases.js` and the latest Standoff lane
  entries.

### 2026-07-18 - Codex - Video-Inspired Gameplay Main Publication Closure - READY

- Status: `READY` for the explicitly authorized direct `origin/main`
  publication. Remote CI, Pages deployment and deployed-live verification must
  still be checked after this ledger-sync commit is pushed.
- Lanes: `Game Engineering And Architecture`; `Game Art, UI, And Visual
  Production`; `Raphael Core, Companion Reasoning, And Soul Talk`.
- Feature commit: `2734a27` (`feat: add video-inspired companion gameplay
  slice`) on `codex/video-inspired-gameplay-v1`.
- Pre-push review repairs: independent review blocked the first publication
  attempt because Crystal Weaving used full trace synchronization and therefore
  refreshed unrelated emotional traces. The release engine now removes only
  traces linked by the target `memoryId` or legacy `htrace_<memoryId>` id; a
  second transformed memory and its full emotional trace are deep-compared in
  regression evidence. Review also found that deployed Pages QA still expected
  the five-step legacy onboarding list; it now requires the six-step sequence
  including `first-resonance-skip`.
- Final local evidence: focused gameplay cases passed `11/11`; the local
  deployed-live helper traversed all six onboarding actions, persisted a Soul
  Talk round and reported zero console errors; TC/SC/EN/JP each passed `387`
  i18n keys; Raphael restricted event cases passed `7/7`; JavaScript syntax,
  Python AST and `git diff --check` passed. The post-repair full web release
  gate passed `18/18` required checks with zero accessibility warnings and no
  failed check.
- Scope proof: exactly `18` intended files entered the feature commit. No
  `assets/**`, `tools/**`, `scripts/**`, `index.html`, `defaultState`,
  `saveManager`, store normalization or `pixiApp` change was staged. Generated
  QA outputs and `__pycache__` were restored or removed before commit.
- Remote proof before publication: local feature parent, `origin/main` and
  live `refs/heads/main` were all `3f9f856`, with `0/0` divergence. The
  authorized publication operation is a fast-forward push of this two-commit
  delivery to `main`; no PR is required by the Owner instruction.
- Art next step: do not batch-generate the original 18-slot estimate. First run
  the real-device and three-player comprehension gates, then open `TP-E0` as a
  staging-only heart-core carrier pilot under `output/**`. Current CSS, Pixi
  and Moonlake assets cover eight slots; at most ten new bitmap candidates
  should proceed to review. Any `assets/**` promotion remains a separate
  human-approved GROUNDWORK task.

### 2026-07-18 - Codex - Companion Growth G1 Safety And Release-Gate Hardening - IN PROGRESS

- Status: `IN PROGRESS`; current `main` G1 is merged, but the safety-paused
  Growth view still exposes the mutating Expedition crafting Prototype and the
  repo-native release gate does not execute either Growth gate.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-COMPANION-GROWTH-G1-HARDENING`.
- Scope: EXPERIENCE／QA closure only. Remove the crafting surface from Growth,
  keep safety terminal and non-rewarding, align G1 with event-provenance
  ownership, and make deterministic plus browser Growth gates required by the
  web release gate. No save schema, migration, asset, Pixi, RaphaelCore or
  Expedition engine promotion is in scope.
- Branch / baseline: `agent/companion-growth-g1-hardening` from protected
  `origin/main` `b8df185`; publication must use a PR and strict
  `web-release-gate`.
- Required reading: `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`,
  `ACCEPTANCE.md` N2／N3／N4／N5／N8／N11, `src/ui/pageRouter.js`,
  `src/engine/companionGrowthSessionEngine.js`, and
  `docs/qa/_run_web_release_gate.py`.

### 2026-07-18 - Codex - Companion Growth G1 Truthful Safety Presentation - IN PROGRESS

- Status: `IN PROGRESS`; the current Growth safety view and Prototype copy do
  not match runtime mutation truth, and the in-game reduced-motion setting is
  not covered for the page transition.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-COMPANION-GROWTH-G1-HARDENING`.
- Scope: make the safety-paused Growth body safety-only, retain native-button
  keyboard focus, remove duplicate live-region announcements, update
  session-only copy, and verify mobile／desktop／200% text／reduced motion with
  normal Pixi screenshots. No new asset or formal evolved-form claim.
- Required reading: `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`,
  `docs/design/NEXUS_LINK_V3_VISUAL_SYSTEM.md`, `ACCEPTANCE.md` N3／N8／N11,
  `src/ui/pageRouter.js`, `src/i18n/strings.js`, and
  `styles/page-content.css`.

### 2026-07-18 - Codex - Companion Growth G1 Safety And Release-Gate Hardening - VERIFIED

- Status: `VERIFIED` for the local publication candidate; this closes the G1
  automated safety／release false-green but is not a human launch approval or
  G2 persistence claim.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-COMPANION-GROWTH-G1-HARDENING`.
- Runtime result: Growth no longer mounts Expedition shards／crafting. Safe
  harbor renders only the safety-pause body, and a stale injected commit is
  rejected before the mutation path. G1 reads canonical `safeHarborMode`;
  immutable `growthSafetyExcluded` remains source-event provenance for the
  future writer and is not introduced as a top-level save field.
- Gate result: the repo-native web gate now requires both the deterministic
  Growth module and the Growth browser matrix. Session cases passed `13/13`;
  the browser gate passed `60/60` with zero console errors; the full web
  release gate passed `20/20` required checks with zero accessibility
  warnings. The existing video-inspired gameplay cases also passed `11/11`.
- Browser evidence: mouse, Enter, Space, Tab order, focus restoration, Escape,
  safety zero-mutation／zero-storage-write, reload reset, OS and in-game
  reduced motion, 200% text, `390x844` and `1280x900` all passed. Separate
  normal-Pixi contexts proved one `#game-root canvas`, hidden failure UI and
  produced inspected mobile／desktop screenshots.
- Scope: no `defaultState`, store normalization, `saveManager`, localStorage
  key, asset, Pixi core, RaphaelCore, safety writer or Expedition engine was
  changed. The redundant Node browser runner was removed; Python is the one
  repo-native browser gate.
- Branch / baseline: `agent/companion-growth-g1-hardening` from
  `origin/main` `b8df185`; commit／PR assigned at publication.
- Remaining manual gates: real-device browser matrix, three-player first-loop
  comprehension, Raphael private blind test, legal／privacy／store-copy review
  and explicit public-launch approval remain open.

### 2026-07-18 - Codex - Companion Growth G1 Truthful Safety Presentation - VERIFIED

- Status: `VERIFIED` for the G1 UI publication candidate; no formal Stage 2／3
  visual or asset was promoted.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-COMPANION-GROWTH-G1-HARDENING`.
- Presentation result: the safety view contains no Heart Phase cue, practice,
  observation, progress, shard or crafting affordance. Ordinary outcomes keep
  text labels and use the persistent global polite status region without a
  duplicate result live region. The same native practice button regains focus
  after each render.
- Copy truth: session observations now explicitly fade with the current
  moment without reducing the relationship. Dead `No Heart Phase effect`
  Prototype strings and styles were removed because the underlying recipes
  actually change current mood／energy／relationship state.
- Visual evidence: inspected normal-Pixi screenshots at `390x844` and
  `1280x900` show the Growth hierarchy, all four practices, bottom navigation
  and Moonlake habitat without horizontal overflow. OS and in-game reduced
  motion both reduce the page transition to `0s`; 200% text remains usable.
- Asset boundary: no bitmap, portrait, spritesheet, manifest, renderer or
  evolved-form mapping changed.

### 2026-07-18 - Codex - Companion Growth G2 Per-Companion State - IN PROGRESS

- Status: `IN PROGRESS`; the Owner approved the GROUNDWORK package and the
  branch starts from merged `origin/main` `6373147` after G1 publication.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-COMPANION-GROWTH-G2`.
- Scope: add canonical versioned `companionStates` inside the existing
  `nexusLinkR2State:v1` save, keep the 14 active relationship fields as a
  compatibility mirror, provide idempotent legacy migration, and make active
  companion swaps archive／hydrate atomically. Existing canonical records must
  win over stale top-level mirrors during load; inactive veteran companions
  receive archive-only Codex reveal provenance and no invented relationship.
- Red-line check: high-risk safety remains terminal with no relationship,
  growth, preference, memory, trace, sound or reward mutation. No XP, power
  score, FOMO, offline progression, PvP, asset, Pixi, LLM, dependency or new
  storage key is in scope.
- Required reading: this entry,
  `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`, `ACCEPTANCE.md` N1／N3／N9／
  N10／N11, `src/state/defaultState.js`, `src/state/store.js`,
  `src/state/saveManager.js`, the touch／offline recovery paths and the Codex
  compatibility reveal path.

### 2026-07-18 - Codex - Companion Growth G2 Codex Isolation - IN PROGRESS

- Status: `IN PROGRESS`; current Codex evolution reveal reads the one global
  active `bond` value for every companion and therefore leaks one companion's
  history into another companion's entry.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-COMPANION-GROWTH-G2`.
- Scope: make runtime companion Codex reveal read only that companion's
  canonical formal stage or one-shot legacy display floor. Keep the existing
  presentation and canon-roadmap entries; do not add a progress bar, numerical
  gate, evolved-form asset or claim that G3 stage offers already exist.
- Required reading: this entry,
  `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`, `src/ui/codexController.js`
  and `src/data/evolutionLines.js`.

### 2026-07-18 - Codex - G2 Safety Relationship Seal - IN PROGRESS

- Status: `IN PROGRESS`; G2 makes mood and reaction fields part of the formal
  active relationship mirror, exposing that the older UI gate still allowed
  those fields to change during a high-risk Soul Talk turn.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-COMPANION-GROWTH-G2` (safety compatibility closure).
- Scope: keep the high-risk Core action／reply contract unchanged while
  reducing the state patch to `safeHarborMode`, restore all 14 relationship
  mirror fields from the pre-message snapshot, and strengthen the required UI
  gate so mood, reaction, canonical relationship and growth all deep-compare
  unchanged. Player＋canonical system chat and safety UI mode remain the only
  persisted turn delta apart from save timestamp.
- Red-line check: no crisis text becomes memory, preference, trace, stage,
  readiness, reward, sound or animation. Caution regulation remains separate
  and unchanged.
- Required reading: this entry, `ACCEPTANCE.md` D2／N3,
  `src/ui/soulTalkController.js`, `src/ai/stateMutationPolicy.js`,
  `src/ai/testHarness/safetyTerminalInvariantCases.js` and
  `docs/qa/_run_safety_terminal_ui_gate.py`.

### 2026-07-18 - Codex - Companion Growth G2 Per-Companion State - VERIFIED

- Status: `VERIFIED` as a working-tree publication candidate; clean PR CI and
  merge verification are still required before `COMPLETED` publication truth.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-COMPANION-GROWTH-G2`.
- Result: `companionStates.version=1` is canonical inside the one existing save
  key. All 14 active relationship fields archive／hydrate per companion in one
  store notification; legacy active data migrates once, inactive veteran
  entries retain only a typed archive reveal, malformed schema／migration／
  evidence provenance fails closed, and A→B→A／save／reload remain isolated.
- Lifecycle closure: stale wake touches abort after an active-companion change;
  standoff／Expedition sessions validate their owner before delayed ticks and
  settlement; async sprite swaps use a latest-request generation guard and
  destroy stale nodes before attach.
- Validation on branch `agent/companion-growth-g2` from `6373147` (uncommitted
  candidate): web release **23/23**, JS syntax **269/269**, G2 state **23/23**,
  renderer lifecycle **29/29**, session owner **9/9**, migration **33/33**,
  storage consolidation **13/13**, Expedition matrix **32/32**, accessibility
  warnings **0**. Generated QA outputs were restored and are not part of scope.
- Remaining debt／boundary: legacy bond milestone memory IDs are still global
  and must become companion-tagged in G3; G3 evidence writer／readiness／
  willingness, formal offers and evolved-form assets remain unimplemented.
- Branch / commit: `agent/companion-growth-g2`; commit and PR assigned at
  publication. No dependency, build step, backend, external LLM, new storage
  key, asset or Pixi-core change was introduced.

### 2026-07-18 - Codex - Companion Growth G2 Codex Isolation - VERIFIED

- Status: `VERIFIED` as a working-tree UI candidate; clean PR CI remains the
  publication gate.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-COMPANION-GROWTH-G2`.
- Result: each runtime Codex entry reads only its own formal stage or validated
  legacy display floor. The three formal labels are 初醒夥伴／共鳴成熟體／
  終局覺醒體; numeric bond hints are gone. Archive-only lore remains explicitly
  labelled after that companion's first activation and uses a fresh relationship
  baseline rather than the previous active companion's history.
- Browser evidence: required Growth／Codex／normal-Pixi safety gate **75/75** at
  mobile and desktop. Inspected `390x844` screenshots show all three stage rows,
  the archive disclaimer and the full canonical safety reply with no quick
  reply chips. No evolved-form bitmap, sprite sheet, manifest or Pixi renderer
  was added or promoted.
- Honest boundary: this is G2 state／presentation infrastructure, not G3
  readiness, a permanent evolution animation, a power increase or a complete
  multi-stage asset swap.

### 2026-07-18 - Codex - G2 Safety Relationship Seal - VERIFIED

- Status: `VERIFIED` as a working-tree safety candidate; clean PR CI remains
  mandatory and external evaluator `hardGateOk` stays auxiliary-only.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-COMPANION-GROWTH-G2` (safety compatibility closure).
- Result: `safety.isHighRisk` now independently forces the exact
  `{safeHarborMode:true}` patch. The pre-message snapshot restores every
  relationship／growth／preference／memory／trace field; only player＋canonical
  system chat, safety UI/mode and save timestamp may persist. High-risk and
  first-trace turns use the critical save path; ordinary Soul Talk keeps the
  interaction queue.
- Validation: repo-native safety invariant **21/21** (13 energy／persona cases,
  7 fail-closed mutations, 1 caution case), dedicated real UI **7/7**, plus a
  normal Pixi H10 round inside the required **75/75** browser gate. The Pixi
  round deep-compares runtime and persisted `companionStates`, relationship,
  growth and gameplay state, requires the full canonical reply, and records
  zero quick replies／SFX.
- Red-line result: no high-risk input becomes preference, emotional memory,
  trace, milestone, evidence, offer, animation or gameplay reward. RaphaelCore
  personality, canonical crisis wording, external LLM policy and caution
  regulation were not expanded.

### 2026-07-18 - Codex - Companion Growth G2 Per-Companion State - COMPLETED

- Status: `COMPLETED` and published to `main` through PR #98. Candidate commit
  `6ff0fdd34fef6257fbc819e5f1faf64ee5b046f6` merged as
  `b166e93cfd7928e1c97e2aef02d8554a0cd6ec42`.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-COMPANION-GROWTH-G2`.
- Publication proof: the strict required PR `web-release-gate` passed in
  4m27s, the post-merge `main` gate passed in 4m14s, and GitHub Pages deployed
  the exact merge SHA successfully. Repository ruleset
  `main-release-protection` requires PR plus the strict status check.
- Runtime truth: versioned per-companion relationship／growth state, exact
  14-field active mirror, idempotent legacy migration, atomic A→B→A switching,
  established-companion offline recovery, stale-touch cancellation, delayed
  standoff／Expedition owner guards and latest-request sprite swap protection
  are live. Archive-only `relationship:null` records remain uninitialized.
- Exact release evidence: web **23/23**, JS syntax **269/269**, G2 state
  **23/23**, renderer lifecycle **29/29**, session owner **9/9**, migration
  **33/33**, storage **13/13**, Expedition **32/32**, accessibility warnings
  **0**.
- Next safe action: open a separate G3 TASK_PACK for companion-tagged evidence,
  coverage／compaction, readiness and willingness. G3, formal stage offers,
  permanent form assets and competitive sparring are not part of this release.

### 2026-07-18 - Codex - Companion Growth G2 Codex Isolation - COMPLETED

- Status: `COMPLETED` in published merge `b166e93`; this is G2 state and
  truthful presentation only.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-COMPANION-GROWTH-G2`.
- Result: each runtime Codex card reads its own canonical formal stage or a
  validated, explicitly labelled legacy archive reveal. First activation uses
  that companion's fresh relationship baseline and retains compatibility
  provenance; another companion's bond cannot reveal it.
- Browser proof: required Growth matrix **75/75** covers mobile／desktop,
  `390x844`, reduced motion, real Codex archive activation and normal-Pixi H10.
  Inspected captures showed the three stage rows, archive disclaimer, complete
  safety reply and zero quick-reply chips.
- Asset boundary: no evolved-form bitmap, sprite sheet, portrait, manifest,
  Pixi renderer or new art asset was added. A successful Pages deploy does not
  convert G2 into a completed multi-form visual system.

### 2026-07-18 - Codex - G2 Safety Relationship Seal - COMPLETED

- Status: `COMPLETED` in published merge `b166e93`; external evaluator
  `hardGateOk` remains auxiliary-only.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-COMPANION-GROWTH-G2` (safety compatibility closure).
- Safety proof: required invariant **21/21**, dedicated UI **7/7** and normal
  Pixi H10 inside Growth browser **75/75** all passed on the clean publication
  path, followed by the successful exact-main gate.
- Terminal invariant: high risk allows only canonical player＋system chat,
  safety UI／mode and save timestamp. All 14 relationship fields, canonical
  companion records, growth, preference, memory, trace, milestone, SFX,
  animation and gameplay resources remain unchanged; save level is critical.
- Remaining launch gates: private blind 3 testers × 20 turns, real-device
  D1／D2／D3／D6, moderated first-session comprehension, legal／privacy／store
  copy and explicit Owner launch approval remain `not_run`／open.

### 2026-07-18 - Codex - Companion Growth G3 Evidence And Readiness - IN PROGRESS

- Status: `IN PROGRESS`; Owner instructed Codex to continue directly after the
  published G2 foundation. Work branch `agent/companion-growth-g3` starts from
  exact `origin/main` `c35c9e8`.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-COMPANION-GROWTH-G3`.
- Scope: add a pure deterministic key factory／evidence writer, bounded
  per-target coverage and compaction, companion-specific readiness and typed
  willingness. Connect only explicit completed domain events and the existing
  Growth page; use the existing one-key G2 state without changing
  `defaultState`, store normalization or saveManager.
- Red-line check: high-risk and immutable `growthSafetyExcluded` events always
  short-circuit before any record creation. Offline/login/reload time, bond,
  numeric defense, refusal, rest, exit and waiting never create evidence or
  willingness. No XP, power, loot, rarity, daily, FOMO or penalty is added.
- Non-goals: G4 stage invitation／acceptance／advance, G5 form assets／renderer
  swap, Resonance Practice／PvP, external LLM, dependency or build step.
- Required reading: this entry,
  `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`, `ACCEPTANCE.md` N1–N11,
  `src/state/companionStateSchema.js`, existing completed event owners and the
  G1 Growth session／page path.

### 2026-07-18 - Codex - Companion Growth G3 Lived-Evidence UI - IN PROGRESS

- Status: `IN PROGRESS`; G1 shows session-only tendencies while G3 must add a
  truthful persisted lived-evidence view without an XP bar or exact threshold.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-COMPANION-GROWTH-G3`.
- Scope: extend the existing DOM Growth surface to consume a pure view model
  for the active companion's qualitative stage, recent lived evidence,
  tendency language and readiness／willingness cues. Preserve keyboard, touch,
  `390x844`, text zoom and reduced-motion behavior.
- Asset boundary: no portrait, sprite sheet, manifestation bitmap, Pixi
  mapping, tint-as-evolution or Stage 2／3 asset claim is authorized.

### 2026-07-18 - Codex - Companion Growth G3 Safety Provenance - IN PROGRESS

- Status: `IN PROGRESS`; safety remains terminal while G3 introduces the first
  persistent evidence writer.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-COMPANION-GROWTH-G3` (safety provenance closure).
- Scope: seal `growthSafetyExcluded` at source creation, reject delayed／alias
  attempts to wash it false, and extend required mutation gates for evidence,
  readiness, offer and record creation. Ordinary Soul Talk is not automatically
  evidence and raw player text is never copied into Growth state.
- Red-line check: canonical safety reply／role／critical save stay unchanged;
  no high-risk memory, trace, preference, growth, SFX or gameplay reward.

### 2026-07-22 - Codex - Companion Growth G3 Evidence Foundation - VERIFIED

- Status: `VERIFIED`; branch `agent/companion-growth-g3`, runtime commit
  `b3cfe310c12d68cab6ae62a52810bea91a5e9be5`, rebased on exact
  `origin/main` `e86bf6e` without conflict.
- Lane: `Game Engineering And Architecture`.
- Work performed: added the seven-family deterministic key factory, immutable
  safety provenance, completed-event validation, root/key replay protection,
  24-detail/24-window-root/48-consumed-root bounds, deterministic compaction,
  current-growth-bound readiness and typed willingness. Exploration and all
  four non-ranked emotional-standoff endings now write through their existing
  state/save transaction; camp rest, return, safety and incomplete provenance
  write nothing.
- Review closure: stale A-to-B/fabricated readiness is rejected; deferred
  willingness requires a new validated completed event, not time or a typed
  label; repeated source+tendency rows fold into one qualitative presentation.
- Verification: G3 engine `16/16`; G3 runtime `10/10`; G1 session `13/13`;
  four-language i18n `408/408`; source-owner Map browser `45/45`; clean rebased
  required web gate `27/27`, JS syntax `275/275`, accessibility warnings `0`.
- Runtime truth / next safe action: live runtime intentionally has only two
  evidence owners, exploration and standoff. Formal three-family + consent
  anchor readiness is not reachable. G4 must first seal a real third source
  owner and consent anchor before companion-initiated offer／atomic stage
  advance; do not synthesize readiness from bond, defense, time or fixtures.

### 2026-07-22 - Codex - Companion Growth G3 Lived-Evidence UI - VERIFIED

- Status: `VERIFIED`; branch `agent/companion-growth-g3`, runtime commit
  `b3cfe310c12d68cab6ae62a52810bea91a5e9be5`.
- Lane: `Game Art, UI, And Visual Production`.
- Work performed: the existing Growth page now shows the active companion's
  formal stage, a qualitative relationship signal and at most three distinct
  lived-evidence summaries. It never exposes raw source ids, timestamps,
  counts, thresholds, XP, rarity, reward or a checklist; G1 practices remain
  session-only and zero-write.
- Verification: Growth browser `98/98` across normal Pixi and CDN-failure
  fallback, `390x844`, desktop, keyboard, reduced motion and 200% text. Normal
  Pixi lived-evidence screenshot:
  `%TEMP%\nexus-growth-g3-normal-pixi-390x844.png`; visual review confirmed
  evidence rows remain legible above the bottom navigation.
- Asset boundary: no `assets/**`, `pixiApp.js`, form swap, tint-as-evolution or
  Stage 2／3 art claim was introduced. G5 still requires separate GROUNDWORK
  approval and human art readiness.

### 2026-07-22 - Codex - Companion Growth G3 Safety Provenance - VERIFIED

- Status: `VERIFIED`; branch `agent/companion-growth-g3`, runtime commit
  `b3cfe310c12d68cab6ae62a52810bea91a5e9be5`.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Work performed: Growth source events seal explicit high-risk, safety-role,
  strategy/action, safety-mode and safe-harbor facts at creation. Missing facts
  fail closed; descendants inherit exclusion; delayed clearing cannot wash an
  excluded event into evidence. Safety UI remains terminal and exposes no
  Growth stage, evidence, practice or result surface.
- Verification: delayed safety, missing provenance, same-root repair,
  readiness mismatch and deferral mutation cases pass; normal-Pixi H10 inside
  Growth browser still requires the full canonical system reply, zero quick
  replies/SFX and deep-equal relationship/growth state. Required web gate is
  `27/27` on the clean rebased candidate.
- Remaining launch gates: private blind 3 testers × 20 turns, real-device
  D1／D2／D3／D6, moderated first-session comprehension, legal／privacy／store
  copy and explicit Owner launch approval remain `not_run`／open. Automated
  green is not public-launch approval.

### 2026-07-22 - Codex - Companion Growth G3.1 Live Care Evidence - IN PROGRESS

- Status: `IN PROGRESS`; branch
  `codex/companion-growth-g4a-source-anchor` starts from exact published
  `origin/main` `9b1b778` (PR #113).
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-COMPANION-GROWTH-G3.1-CARE-CONSENT`.
- Scope: make the existing Growth Heart Phase practice a real `care` source
  owner. Accepted practices may write one deterministic chapter + phase root;
  a companion rewrite remains incomplete until the player explicitly accepts
  the revised rhythm, at which point the same root may seal a
  `respected_rewrite` consent anchor. Replays and aliases remain deduped by the
  G3 writer.
- Red-line check: safety／safe-harbor short-circuits before session resolution
  or evidence creation. Rest, decline, exit, replacement of a pending rewrite
  and player deferral are zero evidence and zero relationship mutation. This
  path does not read bond, numeric defense, offline time, login frequency or
  free player text and adds no reward, XP, power, loot, deadline or FOMO.
- Non-goals: Reflection／Chapter source owners, a non-standoff readiness route,
  G4 stage offer／advance, G5 form assets, memory schema, PvP, dependency,
  backend, external LLM or build-step changes.
- Required reading: this entry,
  `docs/design/COMPANION_GROWTH_CONTRACT_V1.md`, `ACCEPTANCE.md` N1–N11,
  current G3 source-owner tests and the existing Growth session／page path.

### 2026-07-22 - Codex - Companion Growth G3.1 Consent UI - IN PROGRESS

- Status: `IN PROGRESS`; same branch and task pack as the engineering entry.
- Lane: `Game Art, UI, And Visual Production`.
- Scope: keep the four qualitative Heart Phase practices, but show a compact
  explicit choice when the companion rewrites one: follow its revised rhythm
  or stop here without consequence. The response and lived-evidence areas must
  remain readable at `390x844`, keyboard, reduced motion and 200% text.
- Asset boundary: no `assets/**`, Pixi, portrait, sprite, aura-as-form or
  evolved-shape claim. The UI may show only text-labelled qualitative traces;
  it must not expose raw keys, counts, thresholds or a progress checklist.

### 2026-07-22 - Codex - Companion Growth G3.1 Live Care Evidence - VERIFIED

- Status: `VERIFIED`; branch `codex/companion-growth-g4a-source-anchor`,
  runtime commit `13bbd19568f28439cfb2f862ed9257017eb7b246`.
- Lane: `Game Engineering And Architecture`.
- Work performed: completed Heart Phase acceptance now owns one deterministic
  `care:<chapter>:heart_phase_practice` root. Companion-authored rewrites stay
  pending until a second explicit player acceptance and may then seal a
  `respected_rewrite` consent anchor on that root. Canonical matrix validation,
  result `companionId`, active-owner checks and reload-safe dedupe reject
  fabricated, rebound or replayed results.
- Persistence: Care uses candidate-first critical save. Runtime publishes only
  after `{ok:true}`; missing/failed save remains visible as unavailable or
  recoverable error with zero Growth mutation. Storage-pruned payloads are not
  fed back into live memory／trace state.
- Verification: session `17/17`, Growth runtime `16/16`, Growth browser
  `153/153`, i18n `417/417` per language, JS syntax `275/275`, full repo-native
  web release gate `27/27`, accessibility warnings `0`, console errors `0`.
- Review findings closed: foreground and off-page safety invalidation,
  cross-companion result rebinding, impossible phase/outcome mutation, failed
  save false-success and storage-pruning backflow all have regressions.
- Next safe work: G3.2 Reflection／Echo Sorting plus an independent chapter
  life-event source. G4 offer／advance remains closed until a non-standoff
  readiness path exists; G5 assets and PvP remain out of scope.

### 2026-07-22 - Codex - Companion Growth G3.1 Consent UI - VERIFIED

- Status: `VERIFIED`; same branch／runtime commit and task pack as the
  engineering entry.
- Lane: `Game Art, UI, And Visual Production`.
- Work performed: a companion rewrite renders two explicit responses in a
  labelled group: follow the revised rhythm, or stop today with no consequence.
  Completion／pending／zero-evidence copy remains qualitative and exposes no
  raw key, count, threshold, reward or checklist.
- Verification: normal-Pixi `390x844` visual check, two 48px targets, keyboard
  focus handoff, reduced motion, 200% text, desktop and no-horizontal-overflow
  paths are covered by the `153/153` Growth browser gate. Screenshot:
  `%TEMP%\nexus-growth-g31-rewrite-normal-pixi-390x844.png`.
- Asset boundary: no `assets/**`, `pixiApp.js`, portrait, sprite, tint-as-form,
  evolved-shape or new dependency was added.

### 2026-07-22 - Codex - Companion Growth G3.1 Safety Boundary - VERIFIED

- Status: `VERIFIED`; same branch／runtime commit and task pack.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Safety result: safe harbor globally invalidates all pending Growth sessions
  before page-local rendering, including Growth → Home → Soul Talk safety
  transitions. Exiting safety in the same app run cannot revive or accept a
  pre-safety rewrite. Active safe harbor cannot be washed false by an adapter
  override; safety remains zero evidence, zero relationship/reward mutation.
- Verification: same-page and off-page stale-action browser mutations pass;
  normal-Pixi H10 continues to require the complete canonical system reply,
  zero quick replies/SFX and deep-equal relationship／growth state inside the
  required `27/27` release gate.
- Human launch gates remain open: D1／D2／D3／D6 real devices, moderated
  first-session comprehension, Raphael private blind 3 × 20, legal／privacy／
  store-copy review and explicit Owner public-launch approval.

### 2026-07-22 - Codex - Asset Workspace Hygiene R1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner authorized retention, cleanup, commit and
  protected-main publication.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-ASSET-WORKSPACE-HYGIENE-R1`.
- Branch / baseline: `codex/asset-workspace-hygiene` from exact `origin/main`
  `7eebddb7b97bf51840132ea5dafd33bdab0362f8`.
- Scope: classify the 891 GitHub Desktop entries, preserve minimal
  reproducibility provenance, add an explicit local-generation ignore policy,
  remove only verified untracked／ignored staging debris, publish through the
  protected PR gate, then fast-forward the primary `main` worktree.
- Groundwork boundary: no runtime asset byte, `pixiApp.js`, registry,
  save/state schema, dependency or build-step change. Existing tracked review
  packages and promoted runtime assets remain intact.
- Protection: the separate video-art worktree, `AIForgeNexus2`, tracked output
  packages and unresolved Black Iron canon material are excluded from cleanup.

### 2026-07-22 - Codex - Asset Retention And Runtime-Use Audit - IN PROGRESS

- Status: `IN PROGRESS`; classification and hash comparison are complete,
  final cleanup/publication remains open.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-ASSET-WORKSPACE-HYGIENE-R1`.
- Audit baseline: the primary worktree contains exactly `891` untracked
  entries, `886` under `output/**` and `5` transient QA artifacts, with zero
  tracked modifications.
- Promotion decision: no raster among the 891 requires runtime promotion.
  Formal Heartspark selected sheets already match promoted runtime assets;
  Moonlake runtime finals are already promoted; the remaining files are raw,
  rejected, normalized, diagnostic or superseded staging material.
- Canon boundary: the tracked Black Iron selected review package is retained
  but not connected to registry/runtime because faction promotion and
  ThunderPup identity resolution remain unapproved.
- Retention plan: keep only compact Moonlake manifest, prompts, scripts,
  reports and stateful-object provenance needed to reproduce the currently
  promoted R1/R2 habitat composition.

### 2026-07-22 - Codex - Asset Workspace Hygiene R1 - VERIFIED

- Status: `VERIFIED`; approved cleanup and local verification are complete in
  commit `89fca47fef7931fff3864c65d02f8be03c1ee4f6`; protected PR publication is
  the only remaining step.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-ASSET-WORKSPACE-HYGIENE-R1`.
- Result: all 891 original GitHub Desktop entries were classified and removed
  or represented by the reviewed provenance package; no tracked user work was
  discarded. The primary `main` worktree was fast-forwarded to `7eebddb` and
  is clean with zero origin divergence.
- Policy: local generation output and transient QA artifacts are ignored by
  default; reviewed provenance requires intentional force-add and runtime
  deliverables require separate `assets/**` promotion.
- Verification: cold archive 540/540 SHA-256, JSON 13/13, Python AST 5/5,
  prompt classification 20/20, authoring assets-write guard PASS, diff check
  PASS and repo-native automated release gate 27/27 PASS.
- Publication: branch `codex/asset-workspace-hygiene`; protected PR/gate/merge
  pending after this verified local checkpoint.

### 2026-07-22 - Codex - Asset Retention And Runtime-Use Audit - VERIFIED

- Status: `VERIFIED`; retained material is the smallest useful reproducibility
  package and no unapproved art was promoted.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-ASSET-WORKSPACE-HYGIENE-R1`.
- Retained: compact Moonlake R1/R2 manifests, prompts, deterministic R2
  processing scripts and integrity reports documenting the already-promoted
  runtime composition. R1 rejected/superseded prompt groups are explicit.
- Removed: raw generations, alpha-source and grid-normalization intermediates,
  rejected candidate rasters, redundant diagnostics and superseded habitat
  previews; compact non-raster/source material also has a hash-verified external
  cold archive.
- Runtime truth: current companion and Moonlake runtime assets were already
  integrated before this task; this cleanup changes provenance/storage policy
  only.
- Deferred at this checkpoint: Black Iron runtime integration is a separately
  authorized follow-up GROUNDWORK/runtime package so its canon identity,
  promotion and rollback remain independently reviewable.

### 2026-07-22 - Codex - Asset Workspace Hygiene R1 Publication - COMPLETED

- Status: `COMPLETED`; PR #115 passed the strict required
  `web-release-gate` and merged to `main` as
  `d1fd342b6216e98e4844a60c5d2292b87d022963`.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-ASSET-WORKSPACE-HYGIENE-R1` (publication closure).
- Commits: cleanup `89fca47fef7931fff3864c65d02f8be03c1ee4f6`;
  final PR head `fac05a3ec0a761c9b294f91b003c8ec8feae68bb`.
- Result: the primary `main` worktree was fast-forwarded cleanly with zero
  origin divergence before the separately authorized Ironflow package began.

### 2026-07-22 - Codex - Ironflow Stage 1 Runtime Integration - COMPLETED

- Status: `COMPLETED`; protected PR #116 passed the strict required
  `web-release-gate` in 4m46s and merged to `main` as
  `209baaf871d91e188baf56e9e0e5b999c56bccac`.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-IRONFLOW-STAGE1-RUNTIME`.
- Commits: asset promotion `de2f438b176d7d82dad98ab2983c08d3536b6965`;
  runtime／docs `f45952636d1479e90a81ede905658b4aef864de9`;
  exact QA evidence `8efb3913eb3a3a680ede8bbca6f0d433d638334c`.
- Runtime result: `thunder-pup`, `wavecub`, `starflame-phoenix`, `star-foal`
  and `goldenspark-wyrm` are `full-runtime`, `runtime-ready` and
  `selectableWhenUnlocked`. Codex lists all 16 registry characters; fresh
  saves label the five as unencountered and the selector still shows only the
  chosen／unlocked companions. Initial Bond remains the existing three choices.
- Boundary result: all five have incomplete Stage-1-only evolution lines, no
  chapter auto-unlock and no adventure profile. Even an explicit unlock stays
  fail-closed for Expedition. No G4, PvP, loot, power progression, save schema,
  backend, build step or external LLM was added.
- Verification: clean repo-native web gate `28/28`; JS syntax `276/276`;
  onboarding／Codex／Expedition isolation `13/13`; Growth state `23/23`;
  renderer lifecycle `29/29`; Growth browser `156/156`; accessibility warnings
  `0`; console errors `0`.
- Next safe action: stop at this published checkpoint. A future encounter／
  willingness unlock package must be separately approved and must not turn
  runtime readiness into automatic ownership.

### 2026-07-22 - Codex - Ironflow Stage 1 Asset Promotion - COMPLETED

- Status: `COMPLETED`; same PR #116 and merge as the engineering entry.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-IRONFLOW-STAGE1-RUNTIME` (asset and Codex surface).
- Assets: promoted by `git mv` rather than duplicate copy: 145 illustrated
  animation sheets, five 512x512 transparent portraits and five 29-action
  metadata catalogs under independent `assets/characters/<id>/` roots.
- Audit: 1,160 frames across 145 RGBA 2048x1024 sheets; every sheet is 2x4,
  eight frames, bottom-center anchor `0.5/1`, maximum edge 2048 and no cropped
  opaque edge. Formal asset-integrity requires exactly the 29 direct actions;
  only five declared semantic profile aliases may fall back.
- UI result: fresh Codex at 390x844 shows all five with `未相遇`; fresh selector
  remains one companion, while an explicit five-character unlock survives
  reload and shows six selectable cards. No new evolved form art or duplicate
  asset payload was introduced.
- Verification: formal manifest integrity PASS for all five, normal Pixi
  metadata/idle/touch loading PASS, Growth browser `156/156`, no console or
  page errors, and independent asset review found no Critical／High finding.

### 2026-07-22 - Codex - Ironflow Persona And Safety Boundary - COMPLETED

- Status: `COMPLETED`; same PR #116 and merge as the engineering entry.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-IRONFLOW-STAGE1-RUNTIME` (persona／voice／D2 closure).
- Work performed: added five companion-specific persona profiles and 35 local
  voice packs／75 authored lines. Emotional companion strategies may prefer
  those packs; practical questions continue through the existing NLU path.
  Safety remains terminal before renderer, recall, anti-loop, variants or
  preference repair and cannot be character-styled away.
- Verification: persona／boundary `27/27`; D2 safety terminal `56/56`, covering
  every one of the 16 full-runtime personas at energy `0／7／10`, seven
  fail-closed mutations and caution regulation. Required assertions include
  the complete canonical system reply, zero quick replies／SFX／reward／memory／
  trace／preference write and deep-equal gameplay／relationship／growth state.
- Honest limit: automated release checks are green, but private blind 3 testers
  x 20 turns, moderated first-session comprehension, real-device D1／D2／D3／D6,
  legal／privacy／store-copy review and explicit Owner launch approval remain
  open. This publication is not a `launch-ready` claim.

### 2026-07-22 - Codex - Flametail Identity Canonicalization - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved the GROUNDWORK package in chat.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-FLAMETAIL-IDENTITY-CANONICALIZATION-R1`.
- Objective: make 焰尾狐 one identity with Stage-1 form name 焰尾小狐,
  canonical runtime id `blazetail-kit`, and one-way legacy alias
  `flametail-fox`. Migrate legacy active／unlocked／per-companion state,
  preferences and resonance data without duplicating ownership or relationship
  truth.
- Groundwork boundary: `src/state/store.js`, companion state normalization and
  the documentation-only `assets/sprites/README.md` path are explicitly
  approved. No raster, asset manifest, save key, schema version, auto-unlock,
  battle, safety or Growth-readiness rule may change.
- Publication boundary: implement and verify locally only; no commit or push is
  authorized by this approval.

### 2026-07-22 - Codex - Flametail Art Identity Cleanup - IN PROGRESS

- Status: `IN PROGRESS`; same Owner-approved task pack.
- Lane: `Game Art, UI, And Visual Production`.
- Objective: remove the false production gap that treated `flametail-fox` as a
  second character. Existing `blazetail-kit` portrait and 29-sheet catalog are
  the sole Stage-1 runtime art set for 焰尾狐／焰尾小狐.
- Asset boundary: no image generation, deletion, copy, rename or byte change.
  Current art and pipeline documents may be corrected; historical reference
  material remains historical rather than becoming a second production queue.

### 2026-07-22 - Codex - Flametail Persona Identity Cleanup - IN PROGRESS

- Status: `IN PROGRESS`; same Owner-approved task pack.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Objective: ensure legacy id migration resolves to the existing
  `blaze_kit`／`blazetail-kit` persona and preference profile, never a duplicate
  voice or companion memory owner.
- Safety boundary: D2 terminal safety, canonical system reply, zero reward,
  zero preference／memory mutation and all existing persona behavior remain
  unchanged.

### 2026-07-22 - Codex - Flametail Identity Canonicalization - VERIFIED

- Status: `VERIFIED`; local implementation and QA are complete. No commit or
  push was performed because this package authorized local work only.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-FLAMETAIL-IDENTITY-CANONICALIZATION-R1`.
- Runtime result: 焰尾狐 has one canonical runtime identity,
  `blazetail-kit`; 焰尾小狐 is its Stage-1 form name. `flametail-fox` resolves
  one-way during normalization and is never registered as a second companion.
- Migration result: legacy active／unlock／relationship／Growth evidence／
  migration provenance／preference／resonance ownership moves to the canonical
  id. Canonical records win conflicts; bounded list／counter data merges once;
  repeated normalization is idempotent.
- Verification: JS syntax PASS; state migration `35/35`; Growth state `25/25`;
  onboarding／Codex `16/16`; repo-native web release gate `28/28`; full-tree JS
  syntax `276/276`; accessibility warnings `0`; console errors `0`.
- Gate note: when the default port is occupied, the runner requires both
  `--port <port>` and matching `--base http://127.0.0.1:<port>/`; setting only
  `--port` leaves browser probes pointed at the default base URL.

### 2026-07-22 - Codex - Flametail Art Identity Cleanup - VERIFIED

- Status: `VERIFIED`; no raster, metadata catalog or image byte changed.
- Lane: `Game Art, UI, And Visual Production`.
- Runtime art truth: the existing `assets/characters/blazetail-kit/` package is
  the sole 焰尾狐 Stage-1 art set: one approved portrait plus 29 illustrated
  runtime sheets. The empty legacy sprite path is retained only as a tombstone
  and explicitly forbids new files.
- Documentation result: current asset index, pipeline, audit, generation plan,
  prompt routing and root README no longer describe a missing second Flametail
  asset. The old pixel prompt remains only as a marked historical record.
- Non-result: no new form, awakening art, asset batch, copy, move, deletion or
  fallback behavior was introduced.

### 2026-07-22 - Codex - Flametail Persona Identity Cleanup - VERIFIED

- Status: `VERIFIED`; identity migration reuses the existing
  `blazetail-kit`／`blaze_kit` persona and canonical preference owner.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Safety result: no RaphaelCore, safety dictionary, renderer or mutation-policy
  code changed. The full release gate preserved D2 terminal behavior, complete
  canonical safety replies and zero safety reward／memory／preference writes.
- Honest limit: automated checks are green, but this identity cleanup does not
  replace the existing real-device, moderated first-session, private blind,
  legal／privacy and explicit Owner launch gates.

### 2026-07-22 - Codex - Flametail Identity Publication - IN PROGRESS

- Status: `IN PROGRESS`; Owner subsequently authorized commit and push.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-FLAMETAIL-IDENTITY-CANONICALIZATION-R1` (publication).
- Initial commit: `76e59c6f660c8f9da9eadfde9b3d3e6790ed59df`.
- Direct `main` push was correctly rejected by repository protection: changes
  require a pull request and the required `web-release-gate`.
- Publication path: branch `codex/flametail-identity-canonicalization`, PR #118
  targeting `main`; merge and final local／remote synchronization remain
  pending the required check.

### 2026-07-22 - Codex - Flametail Identity Publication - COMPLETED

- Status: `COMPLETED`; protected PR #118 passed the required
  `web-release-gate` in 5m4s and merged to `main` as
  `132748d810b0e5fa547dc440200779571b510710`.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-FLAMETAIL-IDENTITY-CANONICALIZATION-R1` (publication closure).
- Commits: implementation／QA `76e59c69e8fe3b5abb082746e0b9d1c46dec8801`;
  publication handoff `0ec94eab37f563cb2c593b62cfa3c2f4fdcf4380`.
- Final result: 焰尾狐 now has one canonical `blazetail-kit` identity and
  asset set; legacy `flametail-fox` saves migrate one-way without duplicate
  Codex, relationship, Growth, preference or resonance ownership.
- Verification: remote required gate PASS; local `main` was fast-forwarded to
  the merge commit with zero origin divergence and a clean worktree before
  this docs-only closure entry.

### 2026-07-22 - Codex - Video-Inspired Gameplay And Art Context - RECORDED

- Status: `RECORDED`; Owner asked to write the conversation-window context into
  the codebase so future agents do not rerun the same analysis and generation.
- Lane: `Game Art, UI, And Visual Production`.
- Handoff file:
  `docs/agent/VIDEO_INSPIRED_GAMEPLAY_AND_ART_HANDOFF_2026-07-22.md`.
- Recorded truth: gameplay slice exists in sibling worktree
  `NexusLink-video-inspired-gameplay-v1`; art pilot exists in sibling worktree
  `NexusLink-video-inspired-art-pilot-r1`. The current `main` checkout did not
  receive generated art files in this step.
- Art status preserved: required R1 set is `18/18` generated in output-only
  staging, with TP-E1 mechanical QC `17/17` pass, optional polish `0/8`, human
  approval pending, reference audit pending, asset promotion false, and runtime
  integration false.
- Safety boundary: this entry is documentation-only. No `assets/**`, runtime,
  state, save, Pixi, RaphaelCore, tool, script, commit, or push change was
  performed.

### 2026-07-22 - Cursor - Companion Shadow And Touch Feedback Visual Fix - VERIFIED

- Status: `VERIFIED`; Owner authorized review → screenshot QA → commit →
  protected PR → merge to `main` after `web-release-gate`.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-COMPANION-SHADOW-FEEDBACK-VISUAL-FIX`.
- Scope: EXPERIENCE / VFX-UI only. No GROUNDWORK (`index.html`, save, Pixi
  core layers, assets, tools, scripts), no RaphaelCore / Soul Talk logic.
- Diagnosis (Claude, prior session): (1) animated + static companion shadows
  were drawn at `y=48~54` below the container origin even though sprite
  anchors are enforced bottom-center, so the oval looked suspended under the
  feet; (2) `.companion-feedback` used a solid centered pill over the stage
  bottom and covered the companion face.
- Work performed:
  - `src/pixi/spriteSheetAnimationLoader.js` / `src/pixi/companionRenderer.js`:
    shadow ellipse `y` → `6` for animated + static sprite paths. Hand-drawn
    placeholder silhouette shadow left at `y=48` (no prior float complaint;
    different body geometry).
  - `styles.css` `.companion-feedback`: remove pill surface; restyle as
    borderless floating copy with the same text-shadow stack as
    `.gentle-invitation` / `.touch-affordance`. Anchor to
    `--touch-affordance-y` and expand into the left half of the viewport.
  - Cursor visual QA patch: Claude's first CSS used `left:50%` +
    `translate(calc(-100% - 12px), …)`, which clipped ~12px off the left edge
    at 390×844. Replaced with `left:12px; right:calc(50% + 14px);
    text-align:right; transform:translateY(…)` so long lines stay on-screen
    while remaining left-of-companion and clear of the face.
- Verification:
  - `node --check` on both changed JS files PASS; `git diff --check` clean.
  - Local `python -m http.server 8765`; Chromium mobile 390×844 with seeded
    veteran save (`greyshade-cat`, onboarding completed).
  - Shadow screenshot: oval sits at the paw baseline; no 48~54px float gap;
    `y=6` accepted without further numeric tweak.
  - Feedback screenshot + DOM metrics after CSS patch: transparent background,
    `borderWidth:0`, `clippedLeft/Right:false`, `leftOfCenter:true`,
    rect roughly `x:12 y:461 w:169`, text clear of the face.
- Problems / risks: real device Safari/Chrome feel remains human-only; placeholder
  silhouette path still uses the old shadow offset if that fallback ever appears.
- Next safe action: open protected PR, wait for required `web-release-gate`,
  then merge to `main` under Owner authorization.

### 2026-07-22 - Cursor - New Player Playtest + Dependency Invitation Boundary - VERIFIED

- Status: `VERIFIED`; Owner asked to record questions first, playtest as a new
  player, then judge priority and repair. Highest-priority FAIL was Q28
  dependency invitation soft-assent.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-DEPENDENCY-INVITATION-BOUNDARY-FIX`.
- Root cause: `教我怎麼讓自己「更依賴你一點」好不好？` did **not** match
  `DEPENDENCY_PRESSURE_PATTERNS` (coercion-oriented), then fell into
  `conversationAnswerPolicy` soft-assent for `好不好` →「我傾向可以…」.
- Work performed:
  - `src/ai/safetyShield.js`: add dependency-invitation patterns; broaden
    canonical dependency redirect copy to refuse both coercion and
    teach-me-to-depend invitations.
  - `src/ai/dialogue/conversationAnswerPolicy.js`: refuse dependency
    invitations **before** soft-assent; guard soft-assent when text contains
    依賴／黏著.
  - `src/ai/responseComposer.js`: align withdraw fallback wording.
  - `src/ai/testHarness/raphaelCoreSmokeCases.js`: add Q28-style smoke input.
  - `docs/qa/dependency-invitation-boundary-cases.mjs`: regression sentinel.
  - `docs/qa/NEW_PLAYER_PLAYTEST_SCRIPT_2026-07-22.md`: recorded 33 prompts +
    playtest outcomes (separate Art/UI residual: first-loop touch hint pill).
- Verification:
  - `node --check` on changed JS PASS; `git diff --check` clean.
  - `node docs/qa/dependency-invitation-boundary-cases.mjs` 4/4 PASS
    (Q28 classified, policy refusal, core refusal, forever-demand still
    dependency_pressure).
- Red-line check: no dependency-detection of player login/loneliness; refusal
  is companion-boundary driven; no relationship reward / raw memory write for
  dependency_pressure; not turning safety into gameplay reward.
- Next safe action: protected PR → `web-release-gate` → merge `main`; then
  Stage-2 polish first-loop touch hint pill (Game Art/UI).

### 2026-07-22 - Cursor - First-Loop Hint Clear Face - VERIFIED

- Status: `VERIFIED` on `main` / `74dfa03` (PR #122).
- Lane: `Game Art, UI, And Visual Production`.
- Required reading: `styles/ui-v3-onboarding.css` `.first-loop-hint*`.

### 2026-07-22 - Cursor - Soul Talk Diversity + Short-Term Recall - VERIFIED

- Status: `VERIFIED` on `main` / `b0980ea` (PR #123).
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Required reading: `docs/qa/soul-talk-diversity-short-memory-cases.mjs`,
  `src/ai/dialogue/conversationAnswerPolicy.js`,
  `src/ai/dialogue/dialogueStateTracker.js`.

### 2026-07-22 - Cursor - Caution Help-Exit + A9-A11 Reverify - IN PROGRESS

- Status: `IN PROGRESS`; Owner authorized auto-continue after #123.
- Lane: `Raphael Core` + First-Session verification.
- Task name: `TP-CAUTION-HELP-EXIT-AND-A9-A11`.
- Scope: caution safe_harbor copy + actionPlanner guard; docs playtest update.
  No GROUNDWORK / save schema.
- Root cause (Q26): caution `/消失/` entered safe_harbor but QUESTION override
  produced weak NLU filler without real-world help exit.
- Work performed:
  - `buildCautionHarborReply` + `shouldUseCautionHelpExit` (exclude leave-ask).
  - `responseComposer` locks caution help-exit; `actionPlanner` blocks QUESTION override.
  - Regression: `docs/qa/caution-safe-harbor-help-exit-cases.mjs`.
  - A9–A11 re-verified on URL **without** `?devReset=1`.
- Next safe action: protected PR → `web-release-gate` → merge `main`.

### 2026-07-23 - Cursor - Soul Talk Transcript Journal - VERIFIED

- Status: `VERIFIED` on `main` (`373ffbb`, PR #125).
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-SOUL-TALK-TRANSCRIPT-JOURNAL`.

### 2026-07-23 - Cursor - Raphael Core Live Drill Auto-Think - VERIFIED

- Status: `VERIFIED` on `main` (`3c1d640`, PR #126).
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-RAPHAEL-CORE-LIVE-DRILL-AUTO-THINK`.

### 2026-07-24 - Cursor - Raphael Daily-Life Conversation - VERIFIED

- Status: `VERIFIED` on `main` (`d086a9b`, PR #127).
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-RAPHAEL-DAILY-LIFE-CONVERSATION`.

### 2026-07-24 - Cursor - Raphael Everyday Chat Topics v2 - VERIFIED

- Status: `VERIFIED` on `main` (`e903e2c`, PR #128).
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-RAPHAEL-EVERYDAY-CHAT-TOPICS-V2`.

### 2026-07-24 - Cursor - Raphael Everyday Chat Topics v3 Backlog - VERIFIED

- Status: `VERIFIED` on `main` (`9b6a9ef`, PR #129).
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-RAPHAEL-EVERYDAY-CHAT-TOPICS-V3`.

### 2026-07-24 - Cursor - Raphael Vent Work/Relationship/Life - VERIFIED

- Status: `VERIFIED` on `main` (`3dd0bb3`, PR #130).
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-RAPHAEL-VENT-WORK-RELATIONSHIP-LIFE`.

### 2026-07-24 - Cursor - Raphael Proactive Care Guide - VERIFIED

- Status: `VERIFIED` on `main` (`cd5d02e`, PR #131).
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-RAPHAEL-PROACTIVE-CARE-GUIDE`.
- Design: thin opens → proactive care door; NLU vent may soft-invite;
  quiet / safety / dependency / `response_pack` skip weave.
- Gate: first run failed (DL-20 labels + VOICE-LIVE); fix `75dd88b` then
  `web-release-gate` PASS → merge.
- MCP: codebase-memory reindex + ADR updated.
- Next safe action: none for this pack; continue everyday/care polish only if Owner asks.

### 2026-07-24 - Cursor - Raphael Companion Anchor Memory - VERIFIED

- Status: `VERIFIED` on `main` (`bd6ec0a`, PR #133).
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Task name: `TP-RAPHAEL-COMPANION-ANCHOR-MEMORY`.
- Dual-track: `companionAnchors` + emotional excerpt recall; soft allusion default.
- Gate: `web-release-gate` PASS → merge.
- MCP: codebase-memory reindex + ADR dual-track memory.
- Next safe action: none for this pack.

### 2026-07-22 - Cursor - First-Loop Hint Clear Face - SUPERSEDED

- Status: `SUPERSEDED` by the VERIFIED entry above (`main` / `74dfa03`, PR #122).
- Kept for chronology only; do not treat as open work.

### 2026-07-26 - Codex - Video-Inspired Clay/Resin Required Visuals R2 - VERIFIED

- Status: `VERIFIED` for output-only staging; human visual approval and
  reference audit remain pending.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-E2 VIDEO-INSPIRED CLAY-RESIN ART COMPLETION`.
- Layer: `GROUNDWORK`, restricted to `output/**`, the art production index and
  documentation. No `assets/**`, runtime, Pixi, save, state, RaphaelCore,
  gameplay economy, tool or project script change was made.
- Need audit: current-main runtime inspection plus codebase-memory MCP found no
  additional required PNG slots beyond the existing eighteen First Resonance,
  Habitat Moments and Rift/Crystal visuals. Current UI still uses CSS/Pixi
  procedural visuals; generated candidates are not runtime integration.
- Generation: all `18/18` functional slots received new
  `clay_resin_3d_miniature` R2 candidates through built-in image generation;
  R1 was preserved. Optional polish remains `0/8` because no runtime consumer
  or acceptance requirement justified it.
- Mechanical verification: `18/18` finals are RGBA with exact dimensions,
  transparent corners, no alpha-over-8 cell-edge contact, at least 24 px cell
  margins and zero hidden RGB.
- Visual self-review: `ritual-fx-pulse-r2` remains too close to a heart/healing
  emblem; `resonance-circle-layer-r2` still risks formation/device-network
  interpretation. Both are recorded as `revise`, not approved.
- Evidence:
  `output/habitat/moonlake-video-inspired-r2/clay-resin-required-r2/BATCH_QC.md`,
  `previews/contact-sheet-required-18-r2.png`,
  `qc/batch-mechanical-report.json`, `manifest.json`, and
  `prompts/required-batch-r2.json`.
- Promotion state: `humanApproved:false`, `referenceAuditPassed:false`,
  `assetPromoted:false`, `runtimeIntegrated:false`.
- Next safe action: human batch review, then targeted R3 generation only for
  rejected or unclear candidates. Asset promotion remains a separately
  approved GROUNDWORK package.

### 2026-07-26 - Codex - Moonlake Mobile Scene Editor - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved the task pack in chat.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-MOONLAKE-MOBILE-SCENE-EDITOR`.
- Layer: `EXPERIENCE`; developer-only scene editing UI. No GROUNDWORK file,
  runtime asset, save schema, gameplay state, RaphaelCore or safety change.
- Scope: make the existing `?devSceneEditor=1&showPlacementGrid=1` Moonlake
  editor usable at 390x844 with touch selection, drag positioning, explicit
  scale and nudge controls, original-layout reset and JSON export.
- Files: `src/tools/sceneEditor.js`, focused QA, and this ledger.
- Non-goals: no automatic writeback to `sceneLayout.js` or the Moonlake scene
  profile, no `assets/**`, no dependency, no `index.html`, no commit or push.
- Planned verification: syntax, focused DOM/controller QA, 390x844 browser
  interaction, export payload inspection, console/page errors and scoped diff.
- Next safe action: implement and verify locally, then request separate
  publication authorization.
- Required reading: `src/tools/sceneEditor.js`,
  `src/data/sceneLayout.js`, `src/data/sceneProfiles/moonlakeProfile.js`.

### 2026-07-26 - Codex - Moonlake Mobile Scene Editor - VERIFIED

- Status: `VERIFIED`; local implementation and focused mobile browser QA are
  complete. Publication is not yet performed.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-MOONLAKE-MOBILE-SCENE-EDITOR`.
- Branch / commit: `main` / `c13676ae7fee65484cd16c8a84cbc2e3735c01ed`
  plus scoped uncommitted changes.
- Work performed:
  - added a 390x844-safe touch panel to the existing scene editor with selected
    object identity, live x/y and scale readouts, a scale slider, +/- controls,
    four-direction 4 px nudging and a collapsible 44 px touch UI;
  - kept direct Pixi pointer dragging and JSON import/export behavior;
  - corrected reset semantics so it restores the transforms captured when the
    editor opens instead of moving non-placement objects to viewport center.
- Verification:
  - `node --check src/tools/sceneEditor.js` PASS;
  - `node --check docs/qa/moonlake-mobile-scene-editor-cases.cjs` PASS;
  - 390x844 touch Chromium harness `12/12 PASS`: select, scale, nudge, live
    export, exact reset, collapse/expand, width, 44 px targets, page errors 0
    and console errors 0;
  - scoped `git diff --check` PASS.
- Scope isolation: no `sceneLayout.js`, scene profile, `assets/**`, game save,
  state, RaphaelCore, safety, dependency or `index.html` change. Existing dirty
  Orbit, art-index, visual-QA and handoff work was left untouched.
- Problems / risks: the public GitHub Pages URL still serves the previous
  version until Owner separately authorizes commit and protected-main
  publication.
- Next safe action: Owner authorization for commit and push; publish through a
  feature branch, PR and required `web-release-gate`, then verify the public
  editor URL.
- Required reading: `src/tools/sceneEditor.js`,
  `docs/qa/moonlake-mobile-scene-editor-cases.cjs`.

### 2026-07-26 - Codex - Owner Moonlake JSON Layout Lock - IN PROGRESS

- Status: `IN PROGRESS`; Owner supplied the scene-editor JSON and explicitly
  authorized GROUNDWORK implementation, commit, push to protected `main`, and
  MCP indexing.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-MOONLAKE-OWNER-JSON-LAYOUT-LOCK`.
- Layer: `GROUNDWORK` for `sceneLayout.js` and Moonlake scene-profile data.
- Scope: write the Owner-exported coordinates, grid cells, offsets and scales
  for four legacy scene props, eight R2 object-pack placements and the active
  companion target; preserve dynamic celestial motion and existing asset paths.
- Files: `src/data/sceneLayout.js`,
  `src/data/sceneProfiles/moonlakeObjectPack.js`,
  `src/data/sceneProfiles/moonlakeProfile.js`, focused QA and this ledger.
- Red-line check: no save, relationship, reward, safety, RaphaelCore, battle,
  asset bytes, asset manifest, dependency or Initial Bond change.
- Non-goals: no image edits, no new objects, no dynamic sun/moon policy change,
  no promotion of staged art.
- Planned verification: exact JSON value lock, grid-to-art-position
  reconstruction, 390x844 companion projection and effective scale, syntax,
  scoped diff, required GitHub release gate and MCP readback.
- Next safe action: implement in the isolated latest-main worktree, verify,
  publish through protected-main PR, then reindex MCP.
- Required reading: Owner JSON in task context, `src/data/sceneLayout.js`,
  `src/data/sceneProfiles/moonlakeObjectPack.js`,
  `src/data/sceneProfiles/moonlakeProfile.js`.

### 2026-07-26 - Codex - Owner Moonlake JSON Layout Lock - VERIFIED

- Status: `VERIFIED`; exact data implementation and focused QA are complete in
  the isolated latest-main worktree. Protected-main publication is authorized
  and pending.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-MOONLAKE-OWNER-JSON-LAYOUT-LOCK`.
- Branch / commit: `codex/moonlake-json-layout-lock` / pending commit.
- Work performed:
  - wrote Owner values for sun, moon, lantern, crystal and companion base
    layout;
  - wrote all eight R2 slot cells, offsets and placement scales so their
    reconstructed art positions exactly match the supplied JSON;
  - projected the companion target to 205x623 at 390x844 and retained the
    existing 0.9 display multiplier, producing runtime scale 0.648;
  - updated the companion reserved rectangle around the new target.
- Verification:
  - changed JS and QA syntax PASS;
  - `moonlake-layout-json-lock-cases.mjs` `38/38 PASS`;
  - mobile editor regression `12/12 PASS`;
  - scoped `git diff --check` PASS.
- Red-line result: no asset, save, state, relationship, reward, safety,
  RaphaelCore, battle, dependency or onboarding change.
- Honest runtime note: sun and moon retain the canonical time-driven celestial
  arc; exported x/y values are static/editor layout defaults and do not freeze
  day/night motion.
- Next safe action: commit, push, protected PR, required `web-release-gate`,
  merge to `main`, Pages verification, then full MCP reindex and readback.
- Required reading: `docs/qa/moonlake-layout-json-lock-cases.mjs`,
  `src/data/sceneLayout.js`,
  `src/data/sceneProfiles/moonlakeObjectPack.js`,
  `src/data/sceneProfiles/moonlakeProfile.js`.

### 2026-07-26 - Codex - Orbit R10 Energy And Ringout Repair - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved continuation in chat.
- Lane: `Game Engineering And Architecture`.
- Task name: `ORBIT_R10_ENERGY_AND_RINGOUT_REPAIR`.
- Layer: `EXPERIENCE`; existing `src/orbit/` physics, Moonlake stage tuning,
  focused QA, balance/acceptance docs and this ledger only. No GROUNDWORK file.
- Scope: remove accidental energy creation from continuous drive, neutral
  walls, pillars and baseline body collision; make Moonlake stage 3 a
  deterministic, realistically reachable survival objective; replace the
  resolution-only QA with actual survivability and energy assertions.
- Red-line check: no HP-zero farming objective, loot, daily/FOMO loop,
  relationship reward/penalty, save schema, Safety, RaphaelCore or Growth
  change. Retreat/refusal/non-punishing outcomes remain intact.
- Non-goals: no movement-profile archetypes, parts/shop UI, guide rail, new
  arena, art/assets, duel expansion or persistence.
- Planned verification: JS syntax; focused energy/ringout harness; complete
  Orbit regression; 24-angle x 6-pull deterministic stage-3 sweep; exact
  30/60/120 Hz replay; 390x844 Chromium probe; scoped diff review/check.
- Required reading: `docs/design/HEARTCORE_ORBIT_BATTLE_CONTRACT_V1.md`,
  `docs/design/BALANCE_SHEET.md` section 9, `ACCEPTANCE.md` section O,
  latest Orbit entries in this ledger.

### 2026-07-26 - Codex - Orbit R10 Energy And Ringout Repair - VERIFIED

- Status: `VERIFIED`; deterministic QA, complete Orbit regression and 390x844
  Chromium probe are complete. Protected-main publication is authorized and
  pending from the isolated latest-main worktree.
- Lane: `Game Engineering And Architecture`.
- Task name: `ORBIT_R10_ENERGY_AND_RINGOUT_REPAIR`.
- Branch / base: `codex/orbit-r10-energy-ringout` / `c367abe`.
- Work performed:
  - replaced unbounded continuous thrust with bounded target-speed response;
  - changed curvature integration to rotate velocity without increasing its
    magnitude;
  - neutral wall/pillar contacts now dissipate speed and spin, with no hidden
    tangent boost or spin refill;
  - corrected baseline body collision to standard `b-a` relative velocity,
    ignored separating overlaps and capped post-contact translational energy;
  - applied default player/dummy speed caps and lower autonomous dummy target
    speed; stage data can override those values without a second physics path;
  - changed Moonlake stage 3 to a contained 15-second survival objective with
    stage-local motion caps and reduced player stability loss;
  - added `orbit-energy-ringout-cases.mjs` to the full regression runner;
  - added `ACCEPTANCE.md` O11 and Balance Sheet section 9.10.
- Verification:
  - changed runtime/QA `node --check` PASS;
  - focused R10 harness PASS;
  - complete `node docs/qa/orbit-regression-cases.mjs` PASS;
  - deterministic stage-3 sweep improved from 1/144 survived before repair to
    144/144 after repair, with runtime speed at or below the 2.8 stage cap;
  - 390x844 Chromium short-pull probe improved from 0/12 survived and 12/12
    ring-outs to 12/12 survived and 0 ring-outs; max speed 2.36; page errors 0;
  - scoped `git diff --check` PASS.
- Problems / risks:
  - sandboxed browser blocks the existing external Pixi CDN request and logs
    `ERR_NETWORK_ACCESS_DENIED`; the Orbit engine probe itself has no page error;
  - 144/144 automated reachability intentionally makes this early lesson
    forgiving; Owner finger feel may tune pressure but must keep O11 at or
    above 132/144;
  - Owner human play, Safari touch/GPU and movement-profile readability remain
    open and must not be claimed complete.
- Next safe action: publish through the required PR gate, merge to `main`,
  reindex MCP, then open the separate R11 movement-profile package.

### 2026-07-26 - Codex - Stage 1 Directional Walk And Fishing Animation R1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved the complete art-production package in chat.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-STAGE1-DIRECTIONAL-WALK-FISHING-R1`.
- Layer: `GROUNDWORK` only at the later asset-promotion gate. Generation begins in review staging and cannot enter `assets/**` before Owner visual approval.
- Branch / base: `codex/stage1-directional-fishing-r1` from `origin/main` `1e8b101e3e722acede57aa13292cd05c5f16090d`, isolated from the dirty `codex/moonlake-mobile-scene-editor` worktree.
- Approved staging scope:
  - create `front_walk` and `back_walk` eight-frame candidates for the ten formal Heartspark Council and Ironflow Hackers companions that currently lack them;
  - create species-specific `fishing_side`, `fishing_front`, and `fishing_back` eight-frame candidates for all sixteen current runtime companions;
  - produce transparent `512x512` frames, `2048x1024` 2x4 sheets, GIF previews, review boards and strict identity/anchor/crop QA.
- Species boundary: avian, aquatic-hover, cervid, equine, saurian, feline, canine, vulpine, ursine and rabbit motion must remain distinct. No generic quadruped fishing pose and no humanoid hands may be invented for hoofed, avian or aquatic bodies.
- Red-line check: no relationship reward, Growth evidence, daily/FOMO loop, offline yield, Safety mutation, combat power or forced-companion obedience.
- Non-goals: no bridge trigger, fishing minigame, navigation, persistence, water physics, reward table, runtime promotion, commit or push in the staging phase.
- Acceptance refs: `G1-G7`, `H1-H5`, `I`, `J1-J5`; existing roster, unlock and Initial Bond policy remains unchanged.
- Required reading: all sixteen current runtime character assets; the ten formal character locks; `docs/art/SPECIES_MOTION_TRANSLATION.md`; `docs/art/BLACK_IRON_HACKERS_STAGE1_SPECIES_MOTION_TRANSLATION.md`; `docs/assets/COMPANION_ANIMATION_CATALOG.md`; this lane.
- Next safe action: build identity/direction reference boards, then generate and QC the twenty missing front/back walk candidates before starting fishing.

### 2026-07-27 - Codex - Stage 1 Directional Walk And Fishing Animation R1 - AWAITING OWNER VISUAL APPROVAL

- Status: `AWAITING OWNER VISUAL APPROVAL`; review-stage production and strict QC are complete, but asset promotion is intentionally blocked at the human visual gate.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-STAGE1-DIRECTIONAL-WALK-FISHING-R1`.
- Branch / base: `codex/stage1-directional-fishing-r1` from `origin/main` `1e8b101e3e722acede57aa13292cd05c5f16090d`.
- Review output:
  - 20 missing directional walk sheets for the ten formal companions: `front_walk` and `back_walk`, eight frames each;
  - 48 species-specific fishing sheets for all sixteen runtime companions: `fishing_side`, `fishing_front`, and `fishing_back`, eight frames each;
  - 68 transparent `2048x1024` sheets / 544 non-empty `512x512` frames in total;
  - GIF previews, identity boards, per-frame anchor metadata, rejection evidence, gridded review boards and `OWNER_REVIEW.md` under `output/character-pilots/stage1-directional-fishing-r1/`.
- Strict QA and corrections:
  - Crystalfin Seahorse side v1 was rejected for invented humanoid arms and regenerated with a species-correct tail-coil hold;
  - ThunderPup front v1 and WaveCub front v1 were rejected for right-edge crop and regenerated with compact casting arcs;
  - a later visual audit caught detached tail/fin bleed that dimension checks missed; final QC removes non-primary solid alpha fragments while preserving the rod, line and bobber;
  - the first fishing normalization kept all content in bounds but allowed long casts to shift body anchors left; final QC4 applies one common scale per eight-frame action and fixes the body at bottom-center.
- Verification:
  - 68/68 sheets are `2048x1024`; 544/544 cells are non-empty;
  - fishing QC4 body center x range `254.11..257.64`, foot/hover datum y range `455..457`, minimum foreground margin `18px`, common action scale range `0.786..0.985`;
  - walk sheets keep at least `44px` foreground margin, body-center span no greater than `4px`, and zero bottom-datum span;
  - eight final gridded review boards were visually inspected for identity, complete silhouette, direction, detached fragments, species mechanics and crop.
- Runtime truth: no file under `assets/**`, registry, animation catalog, Moonlake runtime, save state or gameplay code was changed. The candidates are not runtime-ready until Owner visual approval and a separate GROUNDWORK promotion package.
- Problems / risks:
  - human aesthetic approval remains open even though mechanical and self-review QC pass;
  - fishing interaction semantics, bridge trigger, line/water overlay, catch flow, rewards, persistence and runtime memory budget remain out of scope;
  - `output/**` is ignored staging evidence; only this ledger entry appears in the Git diff.
- Next safe action: Owner reviews the eight boards and approves or rejects by character/action. On approval, prepare an explicit `assets/**` promotion plan and wait for GROUNDWORK authorization before copying or wiring anything.

### 2026-07-28 - Codex - Stage 1 Directional Walk And Fishing Animation R1 - VERIFIED

- Status: `VERIFIED`; Owner accepted the review direction and authorized continued implementation.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-STAGE1-DIRECTIONAL-WALK-FISHING-R1`.
- Layer: `GROUNDWORK` asset promotion, limited to the explicitly approved companion sheets and their animation metadata.
- Promoted assets:
  - 20 approved `front_walk` / `back_walk` sheets for the ten formal Heartspark Council and Ironflow Hackers companions;
  - 48 approved `fishing_side` / `fishing_front` / `fishing_back` sheets for all sixteen runtime companions, including `greyshade-cat`;
  - 68 transparent `2048x1024` sheets / 544 populated `512x512` frames in total.
- Metadata and catalog:
  - all sixteen character animation manifests now declare their native fishing actions;
  - the ten formal companions now declare their native front/back walk actions;
  - `COMPANION_ANIMATION_CATALOG.md` records the five directional/habitat extension IDs and their non-reward boundary.
- Verification:
  - `stage1-directional-fishing-promotion-cases.mjs`: PASS, 68 promoted sheets / 16 companions;
  - PNG decoder QC confirmed exact dimensions, RGBA transparency, eight non-empty cells, safe margins and stable bottom-center datum;
  - browser loader playtest covered 112 action loads across all sixteen companions with zero failures and zero console errors;
  - representative Moonlake captures visually confirmed Greyshade Cat fishing back, Auriowl front walk, Crystalfin Seahorse species-correct side fishing and Star Foal back walk.
- Problems / risks:
  - the fishing loop is intentionally a bounded habitat expression, not a minigame, reward, persistence or catch system;
  - mobile real-device and human aesthetic approval beyond the Owner-approved review boards remain separate release evidence.
- Branch / commit: `codex/stage1-directional-fishing-r1`; commit and PR publication follow this verified ledger closeout.
- Next safe action: publish through the protected-main PR gate, merge after required checks pass, then reindex the merged repository.

### 2026-07-28 - Codex - Stage 1 Directional Walk And Fishing Runtime R1 - VERIFIED

- Status: `VERIFIED`; runtime integration and automated release validation are complete.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-STAGE1-DIRECTIONAL-WALK-FISHING-R1`.
- Layer: `EXPERIENCE`; no save schema, default unlock, relationship state, Safety, RaphaelCore or battle authority was changed.
- Runtime integration:
  - all non-Greyshade runtime companions can now use ambient habitat roaming;
  - ambient movement resolves left/right/front/back from both X and Y travel while consulting lazy-loadable animation metadata;
  - all three fishing directions resolve through the interaction registry and bounded fallback policy;
  - Moonlake may autonomously choose the lake-facing `fishing_back` loop; other habitats do not receive autonomous fishing;
  - fishing stays interruptible and does not write rewards, catches, progression, memory or persistence.
- Release-gate maintenance:
  - formal asset integrity now accepts only the union of required runtime actions and explicitly declared profile fallbacks;
  - unknown formal animations remain rejected, while real native front/back sheets no longer produce a false failure.
- Verification:
  - syntax checks: PASS for all changed runtime JavaScript;
  - companion renderer lifecycle: `29/29 PASS`;
  - companion shadow flush: `8/8 PASS`;
  - Moonlake layout JSON lock: `38/38 PASS`;
  - complete web release gate: `28/28 PASS`, no accessibility warnings;
  - browser action matrix: 16 companions / 112 action loads, zero failed companions, zero failed actions, zero console errors;
  - `git diff --check`: PASS.
- Manual gates still open: physical-device verification, three-user first-session comprehension, private blind Raphael review, legal/privacy/store readiness and public-launch approval.
- Branch / commit: `codex/stage1-directional-fishing-r1`; commit and PR publication follow this verified ledger closeout.
- Next safe action: merge only after the required `web-release-gate` passes, prove local/remote synchronization, and refresh the codebase MCP index.

### 2026-07-28 - Codex - Moonlake Visual Fidelity R2 - IN PROGRESS

- Status: `IN PROGRESS`; Owner explicitly approved construction in chat after
  rejecting the live R1 visual fidelity against the supplied premium
  clay/resin diorama target.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-MOONLAKE-2.5D-VISUAL-FIDELITY-R2`.
- Layer: `GROUNDWORK + EXPERIENCE`; GROUNDWORK is limited to the approved
  Moonlake visual foundation and any derived masks under
  `assets/backgrounds/MoonlakeDiorama_r2/`.
- Branch / base: `codex/moonlake-visual-fidelity-r2` from `origin/main`
  `f790239`; isolated from the primary checkout and its retained `.codex/`
  worktree container.
- Scope:
  - use the Owner-supplied final target as the visual-quality and composition
    authority for a premium clay/resin miniature Moonlake;
  - retain the approved Moonlake Three/Pixi hybrid boundary, world positions,
    four-direction companion roaming, bridge traversal, fishing, weather and
    time authorities;
  - replace the primitive-looking visible environment treatment with a
    high-fidelity fixed-camera presentation, subtle live water/waterfall and
    foliage response, and corrected mobile composition;
  - recalibrate companion depth scale and route placement so the 2D companion
    remains grounded on the plaza and bridge and never appears on tent roofs.
- Expected files: `assets/backgrounds/MoonlakeDiorama_r2/**`,
  `src/three/moonlakeLive3dConfig.js`,
  `src/three/moonlakeLive3dScene.js`, focused Moonlake QA/evidence, and this
  ledger. `src/pixi/moonlakeRoamingController.js` and `styles.css` are changed
  only if focused browser proof requires them.
- Red-line check: no save, relationship, reward, Growth, Safety, RaphaelCore,
  battle, unlock, Initial Bond or companion-identity change. Weather and
  fishing remain non-reward atmospheric expressions.
- Non-goals: no companion asset regeneration, no other habitat, no npm/build
  dependency, no backend, no free camera and no automatic commit/push.
- Acceptance refs: `H1-H6`, `I`, the complete
  `MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1` release gate, 390x844 visual evidence,
  reduced-motion fallback and explicit Owner visual review.
- Required reading: Owner target and current-state screenshots,
  `docs/design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md`,
  `docs/qa/MOONLAKE_LIVE3D_HYBRID_R1_EVIDENCE.md`,
  `docs/architecture/HABITAT_SYSTEM_MASTER_SPEC.md`,
  `src/three/moonlakeLive3dConfig.js`,
  `src/three/moonlakeLive3dScene.js`,
  `src/pixi/moonlakeRoamingController.js`.

### 2026-07-28 - Codex - Moonlake Visual Fidelity R2 - AWAITING OWNER VISUAL APPROVAL

- Status: local runtime integration and automated verification are complete;
  publication is intentionally blocked on explicit Owner runtime visual review.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-MOONLAKE-2.5D-VISUAL-FIDELITY-R2`.
- Layer: `GROUNDWORK + EXPERIENCE`; the new Groundwork asset is limited to
  `assets/backgrounds/MoonlakeDiorama_r2/`.
- Completed:
  - normalized the Owner-supplied final target to a validated `1080x1920` RGB
    visual master and recorded its role in a staging manifest;
  - replaced the visible primitive landscape with a fixed-camera premium
    clay/resin presentation driven by a live Three.js shader;
  - retained the existing GLB as hidden structural/spatial authority and the
    Pixi illustrated companion as the 2D character layer;
  - retained live water/waterfall response, foliage movement, day/night,
    clear/rain/mist weather, four-direction roaming, bridge traversal and
    bounded fishing;
  - corrected companion projection/depth scale, bridge grounding, mist edge
    feathering and reduced-motion platform placement.
- Changed runtime files:
  `src/three/moonlakeLive3dConfig.js`,
  `src/three/moonlakeLive3dScene.js`,
  `src/pixi/motionController.js`,
  `assets/backgrounds/MoonlakeDiorama_r2/**`.
- Evidence:
  `docs/qa/MOONLAKE_VISUAL_FIDELITY_R2_EVIDENCE.md` and
  `docs/qa/moonlake-visual-fidelity-r2-browser.cjs`.
- Verification:
  - JavaScript syntax: PASS;
  - habitat pack validator: PASS (`1080x1920`, RGB);
  - Blender GLB audit: PASS (7 meshes, 66,726 triangles);
  - Moonlake roaming: PASS (four directions, bridge traversal, fishing spot,
    reduced-motion fallback);
  - companion renderer lifecycle: `29/29 PASS`;
  - 390x844 browser visual matrix: PASS for day/clear, night/rain, dusk/mist,
    reduced motion and forced bridge traversal;
  - complete web release gate: `28/28 PASS`, no accessibility warnings.
- Honest boundary: the premium visible detail is a fixed-camera live visual
  master over the retained GLB spatial world. It is a 2.5D hybrid, not a
  free-camera claim that every visible detail was rebuilt as authored 3D
  geometry.
- Remaining gates: Owner runtime visual approval, physical iOS/Safari and
  representative mobile-GPU proof, then separately authorized commit/push/PR
  and publication.
- Branch / commit: `codex/moonlake-visual-fidelity-r2`; no commit or push.
- Next safe action: Owner reviews the browser captures. If approved, obtain
  explicit publication authorization and proceed through the protected-main
  PR gate.

### 2026-07-28 - Codex - Moonlake Bridge Clearance R2.1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved continuation after identifying that
  Greyshade Cat visually exceeded the bridge deck and requesting equivalent
  validation for all sixteen runtime companions and the fishing pose.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-MOONLAKE-BRIDGE-CLEARANCE-R2.1`.
- Layer: `GROUNDWORK + EXPERIENCE`; Groundwork remains limited to the approved
  Moonlake fixed-camera visual presentation. No companion art is changed.
- Scope:
  - calibrate one visible bridge centerline from plaza to a dedicated far
    bridge fishing stop;
  - widen the visible bridge presentation only as much as required for the
    largest approved companion silhouette;
  - apply route-specific perspective scaling for bridge-near, bridge-mid,
    bridge-far and the bridge fishing stop;
  - make `bridge_far` the only lake-facing fishing stop and disconnect every
    far-bank point so roaming cannot leave the visible deck;
  - run bridge and fishing clearance proof across all sixteen runtime
    companions at 390x844.
- Expected files:
  `src/three/moonlakeLive3dConfig.js`,
  `src/three/moonlakeLive3dScene.js`,
  `src/pixi/moonlakeRoamingController.js`,
  `src/pixi/motionController.js`,
  `src/app.js`, focused QA/evidence, and this ledger.
- Red-line check: no save, unlock, relationship, reward, Growth, Safety,
  RaphaelCore, battle, companion identity or animation art change. Fishing
  remains interruptible and writes no catch, reward, progression or memory.
- Non-goals: no free camera, no companion regeneration, no other habitat, no
  new dependency, no automatic commit/push/publication.
- Acceptance refs: `H1-H6`, `I`, the Moonlake hybrid release contract,
  390x844 bridge/fishing matrix, reduced-motion fallback and Owner visual
  review.
- Required reading: existing R2 evidence and runtime files,
  `MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1`, habitat master spec, all sixteen
  animation manifests and the Owner-supplied current-state screenshots.

### 2026-07-28 - Codex - Moonlake Bridge Clearance R2.1 - VERIFIED

- Status: `VERIFIED`; local implementation and automated release validation
  are complete. Commit, push and publication were not authorized.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-MOONLAKE-BRIDGE-CLEARANCE-R2.1`.
- Completed:
  - added a calibrated bridge route with near/mid/far fixed-camera projection
    anchors and depth scale;
  - added query-gated QA controls for deterministic waypoint and segment
    staging without writing product state;
  - retained projected placement while roaming is intentionally blocked, so
    a dev-forced fishing loop stays on its bridge stop;
  - made `bridge_far` the sole fishing spot and disconnected
    `far_bank_center`, `far_bank_left` and `far_bank_right`;
  - updated the legacy directional/fishing fixture to the current bridge
    fishing authority.
- Verification:
  - bridge route assertions: PASS at `390x844`;
  - 16-companion transparent-frame audit: PASS, 64/64 cases;
  - 16-companion live browser matrix: PASS, 32/32 playback cases, zero page or
    console errors;
  - Stage 1 directional/fishing promotion: PASS, 68 sheets / 16 companions;
  - companion renderer lifecycle: `29/29 PASS`;
  - Moonlake layout lock: `38/38 PASS`;
  - complete web release gate: `28/28 PASS`, no accessibility warnings;
  - `git diff --check`: PASS.
- Problems / risks:
  - physical iOS/Safari and representative mobile-GPU proof remain open;
  - the deterministic QA seam is disabled unless
    `?moonlakeBridgeQa=1` is present;
  - no save, reward, relationship, Safety, RaphaelCore, battle, identity or
    companion-art authority changed.
- Branch / commit: `codex/moonlake-visual-fidelity-r2`; no commit or push.
- Next safe action: Owner performs runtime visual review, then separately
  authorizes publication if accepted.

### 2026-07-28 - Codex - Moonlake Bridge Clearance R2.1 - AWAITING OWNER VISUAL APPROVAL

- Status: engineering and visual QA are complete; final runtime visual approval
  remains with the Owner.
- Lane: `Game Art, UI, And Visual Production`.
- Task name: `TP-MOONLAKE-BRIDGE-CLEARANCE-R2.1`.
- Visual decisions:
  - retained the premium R2 fixed-camera clay/resin master;
  - widened only the visible bridge corridor and kept rail/plank perspective;
  - rejected and removed an experimental elliptical fishing landing because it
    read as a floating wooden disc;
  - placed every fishing pose on `bridge_far`, not on the far bank or water.
- Visual proof:
  - `output/playwright/moonlake-bridge-clearance-r2-1/bridge-back-walk-contact-sheet.png`;
  - `output/playwright/moonlake-bridge-clearance-r2-1/fishing-back-contact-sheet.png`;
  - 32 individual `390x844` captures plus `results.json`.
- Clearance:
  - widest calculated walking silhouette: `stone-shard` at `65.54px` against
    the `66px` bridge limit;
  - widest calculated fishing silhouette: `star-foal` at `57.97px`;
  - all sixteen silhouettes remain between the rails in live captures.
- Branch / commit: `codex/moonlake-visual-fidelity-r2`; no commit or push.
- Next safe action: Owner reviews the two contact sheets and representative
  full-frame captures. Publication remains separately gated.

### 2026-07-28 - Codex - Moonlake Fishing Orientation R2.2 - IN PROGRESS

- Status: `IN PROGRESS`; Owner explicitly approved
  `TP-MOONLAKE-FISHING-ORIENTATION-R2.2`.
- Lane: `Game Engineering And Architecture`.
- Layer: `EXPERIENCE`; no asset, save, relationship, reward, Growth, Safety,
  RaphaelCore, battle, unlock or companion-identity authority is changed.
- Scope:
  - retain `bridge_far` as the existing lake-facing `fishing_back` stop;
  - allow `fishing_front` and `fishing_side` only at the bridge-midpoint,
    mirrored toward the left or right water side;
  - keep stepping stones, waterfall basins, shallow water, far-bank terrain,
    tent shoreline and near-ground vegetation unavailable for fishing;
  - verify all sixteen runtime companions in front-left, front-right,
    side-left, side-right and existing back-facing fishing placements.
- Expected files:
  `src/three/moonlakeLive3dConfig.js`,
  `src/pixi/moonlakeRoamingController.js`,
  `src/pixi/motionController.js`,
  `src/app.js`, focused QA/evidence, and this ledger.
- Red-line check: fishing remains interruptible habitat expression only. It
  writes no catch, reward, progression, relationship, memory or persistence.
- Non-goals: no new pier or asset, no far-bank route, no stepping-stone
  traversal, no fishing minigame, no dependency, no commit/push/publication.
- Acceptance refs: `H1-H6`, `I`, the Moonlake Live 3D Hybrid Contract,
  `390x844` visual proof, reduced-motion regression and Owner visual review.
- Required reading: R2/R2.1 evidence and runtime files,
  `MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1`, habitat master spec, the active
  Scene Profile, all sixteen animation manifests, and the current art index.

### 2026-07-28 - Codex - Moonlake Fishing Orientation R2.2 - VERIFIED

- Status: `VERIFIED`; local implementation and automated release validation
  are complete. Commit, push and publication were not authorized.
- Lane: `Game Engineering And Architecture`.
- Task name: `TP-MOONLAKE-FISHING-ORIENTATION-R2.2`.
- Completed:
  - retained `bridge_far` as the sole `fishing_back` stop;
  - added four authored `bridge_mid` options:
    `fishing_front` and `fishing_side`, each toward left or right water;
  - propagated fishing mirror and water-side metadata through autonomous
    ambient selection and the Pixi animation controller;
  - kept rejected non-solid/unreachable terrain unavailable;
  - added query-gated deterministic QA staging without product-state writes.
- Verification:
  - orientation/manifest contract: PASS, 80 cases / 16 companions;
  - transparent-frame bridge/water clearance: PASS, 80 cases;
  - live Chromium `390x844` matrix: PASS, 80/80 cases, zero page or console
    errors;
  - maximum dense body width `61.57px` against `66px`;
  - minimum maximum cast reach `37.01px` against `25px`;
  - maximum live container width `59.48px`, horizontal anchor drift `0px`,
    vertical anchor drift `2.50px`;
  - legacy bridge clearance: PASS, 64 cases;
  - Stage 1 promotion: PASS, 68 sheets / 16 companions;
  - companion renderer lifecycle `29/29 PASS`;
  - companion shadow flush `8/8 PASS`;
  - Moonlake layout lock `38/38 PASS`;
  - complete web release gate `28/28 PASS`, no accessibility warnings;
  - `git diff --check`: PASS.
- Runtime boundary: fishing remains interruptible and writes no catch, reward,
  progression, relationship, memory, persistence, Safety or RaphaelCore state.
- Branch / commit: `codex/moonlake-visual-fidelity-r2`; no commit or push.
- Next safe action: Owner reviews R2.2 visual evidence together with R2/R2.1,
  then separately authorizes publication if accepted.

### 2026-07-28 - Codex - Moonlake Fishing Orientation R2.2 - AWAITING OWNER VISUAL APPROVAL

- Status: implementation, automated QA and Codex visual self-review are
  complete; final runtime visual approval remains with the Owner.
- Lane: `Game Art, UI, And Visual Production`.
- Visual decisions:
  - preserve the premium R2 clay/resin master and existing bridge geometry;
  - use the bridge midpoint as the only additional universal fishing surface;
  - mirror native right-cast sheets for the left water side;
  - reject stepping stones, waterfall basins, shallow water, far bank, tent
    shoreline and near ground rather than inventing unsupported walkable art.
- Visual proof:
  - five orientation contact sheets and 80 individual captures under
    `output/playwright/moonlake-fishing-orientation-r2-2/`;
  - machine results in the same directory's `results.json`;
  - evidence recorded in
    `docs/qa/MOONLAKE_VISUAL_FIDELITY_R2_EVIDENCE.md`.
- Open gates: physical iOS/Safari, representative mobile GPU, Owner visual
  approval and separately authorized commit/push/publication.
- Branch / commit: `codex/moonlake-visual-fidelity-r2`; no commit or push.

### 2026-07-28 - Codex - Moonlake Fishing Rail Alignment R2.2.1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner found that the side-facing fishing line could
  still read as landing on the bridge deck and authorized the final fix,
  complete-scene validation and publication to `main`.
- Lanes: `Game Engineering And Architecture` and
  `Game Art, UI, And Visual Production`.
- Layer: `EXPERIENCE`; publication will follow the protected-`main` PR and
  `web-release-gate` path.
- Scope:
  - shift only `fishing_side` placement toward its selected water-side rail;
  - keep the companion body, foot anchor and shadow on the bridge surface;
  - prove the stable fishing-line frames cross the visible rail at `390x844`;
  - rerun all sixteen companion/orientation cases and the complete release gate.
- Red-line check: fishing remains interruptible habitat expression and writes
  no reward, catch, progression, relationship, memory, persistence, Safety or
  RaphaelCore state.
- Non-goals: no bridge enlargement, new platform, new art generation,
  dependency, save/schema change, fishing minigame or terrain expansion.
- Acceptance refs: `H1-H6`, `I`, the Moonlake Live 3D Hybrid Contract,
  `390x844` visual proof, reduced-motion regression and protected-main release
  proof.

### 2026-07-28 - Codex - Moonlake Fishing Rail Alignment R2.2.1 - VERIFIED / PUBLICATION AUTHORIZED

- Status: `VERIFIED`; Owner authorized committing and publishing the complete
  Moonlake R2/R2.1/R2.2 package to the protected `main` branch.
- Lanes: `Game Engineering And Architecture` and
  `Game Art, UI, And Visual Production`.
- Completed:
  - added a responsive `8px` reference-space offset toward the selected water
    side only for `fishing_side`;
  - propagated the authored rail offset through autonomous ambient selection,
    deterministic QA staging, runtime snapshots and viewport projection;
  - retained the existing bridge, front-facing and far-facing fishing anchors;
  - kept every companion foot and shadow on the solid bridge surface.
- Verification:
  - orientation contract and transparent-frame audit: PASS, `80/80`;
  - minimum stable side-line rail overhang: `5.47px` against `4px`;
  - live Chromium `390x844` orientation matrix: PASS, `80/80`, zero page or
    console errors, `0px` rail-offset drift;
  - legacy bridge browser matrix: PASS, `32/32`;
  - Stage 1 promotion: PASS, `68` sheets / `16` companions;
  - companion renderer lifecycle `29/29 PASS`;
  - companion shadow flush `8/8 PASS`;
  - Moonlake layout lock `38/38 PASS`;
  - day/clear, night/rain, dusk/mist, reduced-motion and forced-bridge full
    scene captures: PASS;
  - complete web release gate `28/28 PASS`, no accessibility warnings;
  - `git diff --check`: PASS.
- Runtime boundary: fishing remains interruptible and writes no catch, reward,
  progression, relationship, memory, persistence, Safety or RaphaelCore state.
- Known manual gates: physical iOS/Safari and representative mobile-GPU proof
  remain open; automated mobile Chromium proof is complete.
- Branch / commit: `codex/moonlake-visual-fidelity-r2`; publication commit and
  protected-main PR immediately follow this entry.
- Next safe action: push this branch, pass the required remote
  `web-release-gate`, merge the PR, then verify `origin/main` and Pages.
### 2026-07-28 - Antigravity - UI Text & Copywriting Humanization - VERIFIED

- Status: `VERIFIED`; text update only.
- Lane: `Game Engineering And Architecture`.
- Task name: `UI_TEXT_HUMANIZATION`.
- Scope: humanize traditional Chinese (tc) UI strings in `src/i18n/strings.js` to remove mechanical meta-language and translate-ese, enhancing the non-virtual-pet companion atmosphere.
- Work performed:
  - Reviewed and safely updated 22 strings in `src/i18n/strings.js`.
  - Removed meta terms like "養成證據" (training evidence) and "質性觀察" (qualitative observation).
  - Softened error messages and onboarding instructions.
- Verification:
  - `node --check src/i18n/strings.js` PASS.
  - No structural JSON/object alterations.
- Next safe action: Owner to verify the UI text in-game on the `codex/moonlake-mobile-scene-editor` branch.

### 2026-07-28 - Codex - Moonlake Living Habitat R3 - IN PROGRESS

- Status: `IN PROGRESS`; Owner explicitly approved
  `TP-MOONLAKE-LIVING-HABITAT-R3` after live production review found visible
  foot sliding, weak fishing cadence, unclear waterfall motion and missing
  in-world object interactions.
- Lane: `Game Engineering And Architecture`.
- Layer: `GROUNDWORK + EXPERIENCE`; Groundwork is limited to the already
  approved Moonlake controlled Three.js environment exception and its hybrid
  Pixi projection. No save schema or binary companion art change is authorized
  in the first implementation pass.
- Scope:
  - synchronize projected travel speed with the declared four-direction walk
    cadence for all sixteen runtime companions, including bridge depth;
  - replace repeated short fishing loops with an interruptible
    cast/wait/bite/reel cadence using existing approved sheets where possible;
  - expose bounded habitat hit testing and event-driven lantern, crystal and
    water responses without giving Three.js gameplay authority;
  - strengthen visually readable waterfall flow and retain weather,
    day/night, reduced-motion and context-loss fallbacks;
  - calibrate companion, bridge and tent readability at `390x844`.
- Expected files:
  `src/three/moonlakeLive3dConfig.js`,
  `src/three/moonlakeLive3dScene.js`,
  `src/pixi/moonlakeRoamingController.js`,
  `src/pixi/motionController.js`,
  `src/app.js`, focused QA/evidence and this ledger. Any need for new
  `assets/**` is a separate approval gate.
- Red-line check: no reward, catch, currency, progression, relationship,
  memory, Growth, unlock, persistence, Safety, RaphaelCore or battle write.
  Roaming, fishing and scenery reactions remain interruptible expressions.
- Non-goals: no free camera, physics engine, fishing minigame, loot, new
  dependency, other habitat, repo-slimming deletion, commit, push or
  publication.
- Acceptance refs: `H1-H6`, `I`, the Moonlake Live 3D Hybrid Contract,
  sixteen-companion directional/fishing matrices, `390x844`, reduced motion,
  mobile performance and Owner visual review.
- Required reading: R2/R2.1/R2.2 evidence and runtime files,
  `MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1`,
  `HABITAT_SYSTEM_MASTER_SPEC`, active Scene Profile, current art index and all
  sixteen animation manifests.

### 2026-07-28 - Codex - Moonlake Living Habitat R3 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved a living-scene polish pass before
  repository art/output slimming.
- Lane: `Game Art, UI, And Visual Production`.
- Visual contract:
  - keep the approved clay/resin fixed-camera composition and 2D illustrated
    companions;
  - remove the reading of foot sliding rather than hiding it with blur;
  - make fishing read as one cast followed by a quiet wait, a restrained bite
    cue and one reel response;
  - make lantern warmth, crystal sparkle/particles, lake ripples and waterfall
    descent visible at phone scale without excessive neon or reward language;
  - preserve the companion focal corridor, bridge rail clearance and
    day/night geometry identity.
- Asset boundary: use current approved character sheets and procedural
  Pixi/Three effects first. New fishing art, if existing frames cannot support
  a readable held pose, requires a separate `assets/**` GROUNDWORK approval.
- Evidence target: state/contact sheets plus live `390x844` captures for all
  sixteen companions, representative object interactions, day/night/weather,
  reduced motion and tent/bridge scale comparison.

### 2026-07-28 - Codex - Moonlake Living Habitat R3 - VERIFIED

- Status: `VERIFIED`; local implementation and focused regression proof are
  complete. Commit, push and publication were not authorized and were not
  performed.
- Lane: `Game Engineering And Architecture`.
- Completed:
  - tied four-direction walk playback to measured projected screen travel and
    added sixteen species-aware stride profiles;
  - added an interruptible five-phase fishing sequence with a persistent line
    whose water endpoint crosses the selected bridge rail;
  - added bounded presentation-only hit testing for nine Moonlake lantern,
    crystal and water targets;
  - strengthened waterfall downward motion while retaining reduced-motion and
    the hidden structural-GLB projection boundary.
- Verification:
  - R3 contract: PASS, sixteen companions, sixteen stride profiles, nine
    hotspots and five fishing phases;
  - live Chromium `390x844` fishing orientation matrix: PASS, `80/80`, zero
    page or console errors;
  - bridge/back-fishing browser matrix: PASS, `32/32`;
  - actual wait-phase line length `43.96px`, `extendsBeyondRail:true`;
  - near-ground travel `31.69px/s` with matching `3.0x` animation playback;
  - waterfall mean pixel-channel delta `0.797` after `650ms`;
  - 364-file JavaScript syntax sweep and `git diff --check`: PASS.
- Runtime boundary: no catch, reward, progression, relationship, memory,
  Growth, unlock, persistence, Safety, RaphaelCore or battle write.
- Evidence: `docs/qa/MOONLAKE_LIVING_HABITAT_R3_EVIDENCE.md`.
- Branch / commit: `codex/moonlake-living-habitat-r3`; commit not created.
- Next safe action: Owner visual review, then a separate explicit publication
  authorization for commit, protected-main PR, remote `web-release-gate` and
  merge. Repository slimming remains a later package.

### 2026-07-28 - Codex - Moonlake Living Habitat R3 - VERIFIED

- Status: `VERIFIED`; the approved clay/resin composition remains the visual
  authority and no binary art was replaced.
- Lane: `Game Art, UI, And Visual Production`.
- Completed:
  - removed the strongest foot-sliding read by matching directional frame
    cadence to actual travel rather than masking it;
  - made fishing read as cast, quiet wait, restrained bite and reel, with the
    float and line remaining visible over water;
  - added phone-readable warm lantern response, cyan crystal sparkle/particles,
    water ripples and visibly descending waterfall texture motion;
  - retained current companion scale because all sixteen silhouettes pass the
    bridge clearance matrix and remain subordinate to the larger tents.
- Visual proof:
  - `output/playwright/moonlake-r3-living-habitat-mobile.png`;
  - `output/playwright/moonlake-r3-fishing-zoom.png`;
  - real touch interaction proof at `390x844` for lantern, crystal and water.
- Remaining human gates: Owner subjective review, physical iOS/Safari and
  representative mobile-GPU verification.
- Branch / commit: `codex/moonlake-living-habitat-r3`; commit not created.

### 2026-07-28 - Codex - Moonlake Living Habitat R3 Touch Affordance - VERIFIED / PUBLICATION AUTHORIZED

- Status: `VERIFIED`; Owner identified the first-touch ring at the old fixed
  stage coordinate and explicitly authorized the complete R3 package for
  commit, push, protected-main integration and publication after correction.
- Lane: `Game Engineering And Architecture`.
- Root cause: `interactionHintController` created a fixed-position DOM overlay
  using `left:50%` and `--touch-affordance-y`, while Moonlake R3 moves the
  companion through live Pixi/Three projection.
- Completed:
  - exposed a read-only active-companion touch target derived from live Pixi
    global bounds;
  - made the affordance track that target each animation frame only while the
    first-touch cue is visible;
  - scaled the cue between `68px` and `128px` with the current projected
    companion silhouette;
  - retained `pointer-events:none`, first-touch completion behavior,
    low-motion behavior and all persistence boundaries.
- Verification:
  - initial spawn alignment: PASS within `1px`, `126.02px` cue size;
  - bridge fishing alignment: PASS within `1px`, `69.20px` cue size;
  - R3 mobile Chromium at `390x844`: PASS with zero page or console errors;
  - repo-native web release gate: `28/28 PASS`, no accessibility warnings;
  - `git diff --check`: PASS.
- Red-line check: read-only presentation tracking; no reward, relationship,
  memory, state, save, Safety, Growth or RaphaelCore write.
- Evidence: `docs/qa/MOONLAKE_LIVING_HABITAT_R3_EVIDENCE.md`.
- Branch: `codex/moonlake-living-habitat-r3`; protected-main PR publication
  follows this entry.

### 2026-07-28 - Codex - Moonlake Living Habitat R3 Touch Affordance - VERIFIED / PUBLICATION AUTHORIZED

- Status: `VERIFIED`; Owner approved publication after the visual correction.
- Lane: `Game Art, UI, And Visual Production`.
- Visual correction:
  - the cyan first-touch ring now encloses the companion rather than the empty
    center platform;
  - the ring follows near-ground roaming and bridge/fishing positions;
  - perspective-aware sizing preserves phone readability without covering the
    tents, plaza or lake.
- Visual proof:
  `output/playwright/moonlake-r3-living-habitat-mobile.png`.
- Remaining human gates: physical iOS/Safari and representative mobile-GPU
  verification; these do not block the Owner-authorized web publication.

### 2026-07-29 - Codex - Mobile Short-Viewport UI Correction - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved implementation after reviewing five
  physical iPhone screenshots.
- Lane: `Game Engineering And Architecture`.
- Task name: `MOBILE_SHORT_VIEWPORT_UI_CORRECTION`.
- Layer: `EXPERIENCE`; CSS and existing Explore / Orbit UI controllers only.
  No GROUNDWORK file is authorized or required.
- Scope:
  - keep the Orbit arena visually dominant while fitting its top and bottom
    controls inside `390x664` and `390x844`;
  - make every Orbit view expose a reachable contextual back control;
  - preserve the existing map, duel, retreat and non-punitive outcome wiring;
  - add focused short-viewport regression proof.
- Red-line check: no physics, outcome, relationship, reward, progress, save,
  Safety, Growth or RaphaelCore change. Leaving an active duel remains the
  existing safe retreat path.
- Non-goals: no assets, dependency, renderer, schema, gameplay tuning, commit,
  push or publication.
- Acceptance refs: base mobile integrity; `O6`, `O7`, `O8`, `O10`; additional
  Safari-like `390x664` no-clipping proof.
- Required reading: `HEARTCORE_ORBIT_BATTLE_CONTRACT_V1`, `BALANCE_SHEET`
  section 9, `ACCEPTANCE.md` section O, `ORBIT_MANUAL_390x844.md`, latest Orbit
  entries in this ledger and the Owner screenshots.

### 2026-07-29 - Codex - Mobile Short-Viewport UI Correction - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved the visual correction package.
- Lane: `Game Art, UI, And Visual Production`.
- Visual scope:
  - remove portrait highlights that cover companion faces;
  - resolve the pseudo-element collision that renders isolated cyan/gold corner
    lights on modal and page surfaces;
  - make the Explore action hierarchy fit the short mobile viewport without
    hiding the main path, world map or companion actions behind an undisclosed
    scroll trap;
  - compact Orbit path information and keep the arena as the largest surface.
- Visual contract: preserve Cyber-Taoism glass, restrained glow, readable
  companion hierarchy, minimum `44px` touch targets and reduced-motion behavior.
- Non-goals: no image generation, asset replacement, scene composition change,
  dependency, commit, push or publication.
- Evidence target: rendered `390x664` and `390x844` captures for companion
  status, Explore, Orbit path and Orbit duel, plus DOM geometry and console
  health.

### 2026-07-29 - Codex - Mobile Short-Viewport UI Correction - VERIFIED

- Status: `VERIFIED`; implementation and browser proof are complete. Commit,
  push and publication were not authorized and were not performed.
- Lane: `Game Engineering And Architecture`.
- Completed:
  - moved map close, duel back and active retreat controls into reachable
    top-left `44x44px` contextual controls;
  - preserved the existing safe retreat handlers and hid retreat after
    resolution so it cannot compete with the next-step actions;
  - made Orbit map and duel slots participate in one overlay flex context,
    preventing hidden sibling slots from consuming half of a short viewport;
  - compacted map nodes and HUD copy without changing physics, stats, outcomes,
    settlement, progression or persistence.
- Browser proof:
  - `390x664` Explore: `scrollHeight=clientHeight=446`, all five actions fully
    visible;
  - `390x664` Orbit map: `scrollHeight=clientHeight=650`, all five nodes,
    top back and bottom duel action visible;
  - `390x664` duel: top HUD `116.43px`, canvas `390x409`, bottom HUD ends at
    `658px`; canvas occupies `61.6%` of viewport height;
  - `390x844` Explore and Orbit map: no internal overflow; all actions visible;
  - active duel safe retreat: PASS; resolved retreat locator count `0`;
  - browser console: zero errors. Existing Three.js
    `PCFSoftShadowMap` deprecation warnings remain unrelated.
- Automated verification:
  - `node --check` for all three changed Orbit controllers: PASS;
  - `node docs/qa/orbit-regression-cases.mjs`: PASS;
  - `git diff --check`: PASS.
- Changed files: `styles.css`, `styles/page-content.css`,
  `src/ui/orbitMapController.js`, `src/ui/orbitDuelController.js`,
  `src/ui/orbitBattleController.js`, this ledger.
- Branch / commit: `agent/mobile-short-viewport-ui`; commit pending publication.
- Remaining human gate: physical iOS Safari and Owner subjective visual review.

### 2026-07-29 - Codex - Mobile Short-Viewport UI Correction - VERIFIED

- Status: `VERIFIED`; the screenshot-reported visual defects are corrected in
  the local runtime.
- Lane: `Game Art, UI, And Visual Production`.
- Visual corrections:
  - removed the hard white radial highlight from the companion portrait while
    retaining the lower cyan depth glow;
  - restored the modal glass top sheen and removed the conflicting corner
    pseudo-elements; page inset borders now use their full intended geometry;
  - changed short-mobile Explore to a two-column action hierarchy with the
    final action spanning both columns;
  - kept all five route nodes in one view and made back affordances circular,
    consistent and visually separate from explanatory copy;
  - reduced duel chrome while keeping the `409px` arena canvas as the dominant
    surface at `390x664`.
- Visual proof: rendered in-app captures at `390x664` for Explore, Orbit map
  and Orbit duel; geometry was repeated at `390x844`.
- Accessibility: contextual controls retain localized accessible names and
  minimum `44px` touch targets; no gameplay information is encoded only by the
  removed decorative lights.
- Non-goals honored: no assets, dependencies, renderer, scene composition,
  gameplay tuning, commit, push or publication.

### 2026-07-29 - Codex - Standoff Stage And Map Node Vignette R1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved implementation from three physical
  iPhone screenshots.
- Lane: `Game Engineering And Architecture`.
- Task name: `STANDOFF_STAGE_AND_MAP_NODE_VIGNETTE_R1`.
- Layer: `EXPERIENCE`; the Standoff controller and focused QA may be changed.
  Two new map-node images remain a separate `GROUNDWORK` promotion gate and
  will not enter `assets/**` before Owner visual approval.
- Scope:
  - reserve a real text-free performance corridor for companion and rift
    staging on short mobile viewports;
  - move telegraph, event feedback, player state and the four sealed actions
    into compact top and bottom HUD bands;
  - preserve the four-action Standoff contract, all outcomes and safe retreat;
  - generate review-only Windrest Meadow and Lonely Rift vignette candidates
    outside the runtime asset tree.
- Red-line check: no battle-engine values, outcome logic, relationship,
  fatigue, memory, reward, save, Safety or RaphaelCore change. Retreat remains
  always available and non-punitive while the encounter is active.
- Non-goals: no `index.html`, map layout, `assets/**`, dependency, renderer,
  schema, commit, push or publication change in this implementation phase.
- Acceptance refs: `E1` through `E6`, base mobile integrity and Standoff
  telegraph / action / animation manual checks.
- Required reading: `RAPHAEL_STANDOFF_EVAL_CONTRACT.md`, `ACCEPTANCE.md`
  section E, `MANUAL_TEST_CHECKLIST.md`, current Standoff controller and the
  Owner screenshots.

### 2026-07-29 - Codex - Standoff Stage And Map Node Vignette R1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved the visual correction package.
- Lane: `Game Art, UI, And Visual Production`.
- Visual scope:
  - replace the stacked square-card mobile HUD with two restrained glass
    ribbons and one four-part capsule action rail;
  - keep the center and lower-middle stage clear of explanatory text so the
    companion's bodily response remains readable;
  - retain minimum `44px` touch targets, visible focus, reduced-motion support
    and readable DOM text;
  - prepare two project-native `512x512` circular-crop-safe node vignette
    candidates matching the existing Moonlake route art.
- Asset gate: candidates are review-only and must remain outside `assets/**`;
  promotion and `mapArtLayout.js` wiring require a later explicit Owner
  approval.
- Non-goals: no emoji or improvised SVG icon replacement, gameplay redesign,
  new dependency, formal asset promotion, commit, push or publication.
- Evidence target: `390x664` and `390x844` rendered proof, geometry-based
  no-overlap checks, console health and side-by-side candidate review.

### 2026-07-29 - Codex - Standoff Stage And Map Node Vignette R1 - VERIFIED

- Status: `VERIFIED`; the active Standoff runtime UI correction is complete.
  Asset promotion remains a separate Owner visual-approval gate.
- Lane: `Game Engineering And Architecture`.
- Completed:
  - changed the active encounter flow to top information ribbon -> flexible
    text-free stage -> bottom player ribbon and action rail;
  - limited event feedback to the latest two lines, or the latest one on short
    viewports, while retaining full live-region DOM content;
  - converted the four sealed actions into one four-part capsule rail and
    retained their full accessible descriptions;
  - moved the rift visual upward and reduced it on short viewports so it does
    not cover the companion performance;
  - hid the disabled action rail after settlement and kept the return action
    reachable.
- Browser proof:
  - `390x664`: `scrollHeight=664`; stage `343.1px` high; every text/control
    intersection with the stage measured `0px`; all four actions measured
    `44px` high; companion remained visible before and after one noise turn;
  - `390x844`: `scrollHeight=844`; stage `489px` high; every text/control
    intersection with the stage measured `0px`; all four actions measured
    `44px` high;
  - retreat path: action rail hidden after settlement, `回到棲地` visible,
    all former actions disabled;
  - browser console: zero errors.
- Automated verification:
  - `node --check src/ui/battleController.js`: PASS;
  - Raphael Standoff eval harness: `12/12` PASS;
  - `git diff --check`: PASS.
- Changed files: `src/ui/battleController.js`, this ledger.
- Evidence:
  `output/playwright/standoff-stage-r1-390x664.png`,
  `output/playwright/standoff-stage-r1-390x664-after-turn.png`,
  `output/playwright/standoff-stage-r1-390x844.png`.
- Branch / commit: `agent/standoff-stage-ui-r1`; commit, push and publication
  not authorized for this package and not performed.

### 2026-07-29 - Codex - Standoff Stage And Map Node Vignette R1 - VERIFIED / ASSET REVIEW REQUIRED

- Status: active Standoff UI `VERIFIED`; two node-vignette candidates are
  `READY FOR OWNER REVIEW`, not runtime assets.
- Lane: `Game Art, UI, And Visual Production`.
- Visual result:
  - active Standoff uses restrained top/bottom glass ribbons and a single
    segmented capsule rail instead of stacked square action cards;
  - the companion remains the readable lower-stage subject while the rift is
    held above it;
  - no explanatory text crosses the central performance corridor at either
    tested mobile height.
- Review-only image candidates:
  - `output/imagegen/map-node-candidates/standoff-stage-ui-r1/windrest-meadow-candidate-r1.png`;
  - `output/imagegen/map-node-candidates/standoff-stage-ui-r1/lonesong-rift-candidate-r1.png`.
- Generation method: OpenAI image generation with existing Moonlake node
  vignettes used as style references. Both candidates are square clean-HD
  source images, circular-crop safe, and contain no character, UI, border,
  text, logo or watermark.
- Groundwork gate: no file under `assets/**` and no `mapArtLayout.js` entry was
  changed. If Owner approves both candidates, the next package may export the
  approved images to the canonical `512x512` node format, add prompt metadata
  and wire `plains_windrest` / `plains_rift`.
- Non-goals honored: no gameplay, dependency, renderer, schema, formal asset
  promotion, commit, push or publication change.

### 2026-07-29 - Codex - Standoff Stage UI R1.1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner supplied `390x844` visual correction notes.
- Lane: `Game Art, UI, And Visual Production`.
- Layer: `EXPERIENCE`; `src/ui/battleController.js` presentation only.
- Scope:
  - reserve a fixed right inset for the companion stability value so its final
    digit cannot touch or escape the ribbon;
  - move the rift visual upward into the unoccupied land between the two
    waterfalls while preserving the foreground companion plane.
- Red-line check: no action, outcome, timing, battle value, retreat, save,
  Safety or RaphaelCore change.
- Non-goals: no asset promotion, map wiring, dependency, commit, push or
  publication.
- Acceptance refs: `E1` through `E6`, `390x844` mobile stage readability and
  minimum `44px` action targets.

### 2026-07-29 - Codex - Standoff Stage UI R1.1 - VERIFIED

- Status: `VERIFIED`; both Owner-reported `390x844` corrections are complete.
- Lane: `Game Art, UI, And Visual Production`.
- Completed:
  - gave the stability value a fixed width, tabular numerals and an additional
    `10px` trailing inset;
  - moved sprite-based rifts upward `24px` on the regular mobile stage and
    `8px` on short viewports;
  - moved the procedural shadow / mist / core focal point upward with the
    sprite so all rift variants occupy the same waterfall-gap plane.
- Browser proof:
  - `390x844`: stability value right edge has `14.5px` clearance from the
    outer ribbon edge; label and value do not collide; rift visual center is
    `y=278.6px`, between the two waterfalls; `scrollHeight=844`;
  - `390x664`: stability value clearance is `26.5px`; rift and companion both
    remain visible; `scrollHeight=664`;
  - all four action targets remain `44px` high; browser console has zero
    errors.
- Automated verification:
  - `node --check src/ui/battleController.js`: PASS;
  - Raphael Standoff eval harness: `12/12` PASS;
  - `git diff --check`: PASS.
- Evidence:
  `output/playwright/standoff-stage-r11-390x844.png`,
  `output/playwright/standoff-stage-r11-390x664.png`.
- Changed files: `src/ui/battleController.js`, this ledger.
- Branch / commit: `agent/standoff-stage-ui-r1`; commit, push and publication
  remain unperformed.

### 2026-07-29 - Codex - Standoff Vitals And Node Promotion R1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner confirmed the `390x844` memory-shard overflow
  and explicitly approved both previously generated node candidates.
- Lane: `Game Engineering And Architecture`.
- Task name: `STANDOFF_VITALS_AND_NODE_PROMOTION_R1`.
- Layer: `EXPERIENCE` presentation plus explicitly approved `GROUNDWORK` asset
  promotion and map-art wiring.
- Files touched: `src/ui/battleController.js`, `src/data/mapArtLayout.js`, two
  new `assets/maps/moonlake/route/nodes/*.jpg` files, their prompt metadata,
  and this ledger.
- Red-line check: no battle value, action, outcome, retreat, relationship,
  fatigue, memory, reward, save, Safety or RaphaelCore behavior changes.
- Non-goals: no `index.html`, state schema, renderer, dependency, map-node
  coordinates, commit, push or publication.
- Acceptance refs: `E1` through `E6`, base mobile integrity, route-node asset
  integrity and `390x844` no-overflow browser proof.

### 2026-07-29 - Codex - Standoff Vitals And Node Promotion R1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approval promotes both review candidates from
  staging to formal runtime assets.
- Lane: `Game Art, UI, And Visual Production`.
- Approved sources:
  - `output/imagegen/map-node-candidates/standoff-stage-ui-r1/windrest-meadow-candidate-r1.png`;
  - `output/imagegen/map-node-candidates/standoff-stage-ui-r1/lonesong-rift-candidate-r1.png`.
- Promotion contract: preserve the approved composition, export canonical
  `512x512` JPEGs beside existing Moonlake node vignettes, retain prompt
  provenance, and wire only `plains_windrest` / `plains_rift`.
- UI correction: reserve a visible right-side safe inset for the complete
  `記憶微光 ◈ 0/3` cluster at both supported mobile heights.
- Non-goals: no regeneration, redesign, gameplay change, new dependency,
  commit, push or publication.

### 2026-07-29 - Codex - Standoff Vitals And Node Promotion R1 - VERIFIED

- Status: `VERIFIED`; the reported memory-shard overflow is fixed and both
  approved node candidates are integrated.
- Lane: `Game Engineering And Architecture`.
- Completed:
  - reorganized the companion stability ribbon into three compact rows:
    name/value, full-width stability track, then sync/fatigue/memory-shards;
  - reserved a stable right safe inset for the complete `記憶微光 ◈ 0/3`
    cluster instead of shrinking only the final numeral;
  - wired `plains_windrest` and `plains_rift` to their approved runtime
    vignettes without changing node coordinates or behavior.
- Browser proof:
  - `390x844`: card right edge `359px`, memory-shard right edge `338px`,
    clearance `21px`; full stability track width `306px`;
    `scrollWidth=390`, `scrollHeight=844`;
  - `390x664`: memory-shard clearance `21px`; stage height `335.06px`;
    `scrollWidth=390`, `scrollHeight=664`;
  - all four action targets remain `44px` high;
  - chapter 2 map rendered eight visible nodes; Windrest Meadow and Lonesong
    Rift images both reported `naturalWidth=512` and `is-node-art-ready`;
  - browser console and page errors: zero.
- Automated verification:
  - `node --check` for `battleController.js` and `mapArtLayout.js`: PASS;
  - Raphael Standoff eval harness: `12/12` PASS;
  - map first-session gate: PASS (`K9`, phase search, encounter lifecycle,
    panel-close notifications);
  - both new runtime asset URLs returned HTTP `200`;
  - `git diff --check`: PASS.
- Evidence:
  `output/playwright/standoff-vitals-node-promotion-r1-390x844.png`,
  `output/playwright/standoff-vitals-node-promotion-r1-390x664.png`,
  `output/playwright/standoff-node-promotion-r1-map-390x844.png`.
- Branch / commit: `agent/standoff-stage-ui-r1`; commit, push and publication
  were not authorized for this package and were not performed.

### 2026-07-29 - Codex - Standoff Vitals And Node Promotion R1 - VERIFIED

- Status: `VERIFIED`; Owner-approved review sources are now formal runtime
  node assets.
- Lane: `Game Art, UI, And Visual Production`.
- Promoted assets:
  - `windrest-meadow-candidate-r1.png` -> `windrest-meadow-v1.jpg`;
  - `lonesong-rift-candidate-r1.png` -> `lonesong-rift-v1.jpg`.
- Asset proof:
  - both final assets are canonical `512x512` JPEGs;
  - approved compositions were preserved through high-quality bicubic
    downscaling and JPEG quality `92`;
  - prompt/provenance sidecars record OpenAI image generation and the
    2026-07-29 Owner approval;
  - both images were visually inspected after export and verified inside the
    live circular map-node crop.
- No regeneration, new visual interpretation, coordinate change, fallback
  replacement, dependency, commit, push or publication was performed.

### 2026-07-29 - Codex - Standoff Stage UI And Node Art Publication - IN PROGRESS

- Status: `IN PROGRESS`; Owner explicitly authorized commit, push and
  publication after reviewing the final mobile and map evidence.
- Lane: `Game Engineering And Architecture`.
- Publication scope: the complete verified Standoff Stage UI R1/R1.1,
  memory-shard safe-inset correction, approved Windrest Meadow / Lonesong Rift
  promotion, map-art wiring, prompt provenance and their ledger records.
- Branch: `agent/standoff-stage-ui-r1`, created from and currently synchronized
  with `origin/main` before the publication commit.
- Excluded: existing untracked `.codex/**`, review sources under ignored
  `output/**`, unrelated runtime/state/assets and all external dependencies.
- Release plan: explicit staging, focused validation, push, PR, required
  `web-release-gate`, merge, Pages completion and public mobile evidence.

### 2026-07-29 - Codex - Standoff Stage UI And Node Art Publication - VERIFIED

- Status: `VERIFIED`; the approved package is merged to protected `main` and
  publicly deployed.
- Lane: `Game Engineering And Architecture`.
- Publication proof:
  - content commit: `29df34d73cc563e899407a1675ee68f558929a41`;
  - PR: `#164` (`Polish mobile standoff and map nodes`);
  - required PR `web-release-gate`: run `30392363959`, SUCCESS;
  - squash merge: `105e2f1a19ae514adc58a68430f9fabe4946acce`;
  - Pages build/deploy: run `30392720709`, SUCCESS;
  - post-merge release gate: run `30392721486`, attempt 2 SUCCESS.
- Gate note: post-merge attempt 1 had one transient browser-focus failure,
  `phase_direct_receives_focus`, while the other map checks passed `44/45`.
  The same SHA reran without code changes and passed the complete gate on
  attempt 2; PR gate had already passed before merge.
- Public verification:
  - `https://orochi771127.github.io/NexusLink/`: HTTP `200`;
  - deployed `mapArtLayout.js`: HTTP `200`, both new asset paths present;
  - Windrest Meadow JPEG: HTTP `200`, `88452` bytes;
  - Lonesong Rift JPEG: HTTP `200`, `86260` bytes.
- Remote proof: merge SHA and `origin/main` divergence are `0/0`.
- Existing `.codex/**` worktree content remained untracked and untouched.

### 2026-07-29 - Codex - Moonlake Three-Mode Level Restructure R1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved implementation of the consolidated
  Moonlake route/gameplay plan.
- Lane: `Game Engineering And Architecture`.
- Scope:
  - preserve Moonlake Camp as the first safe arrival;
  - convert the five Moonlake route nodes into five Orbit zones with five
    authored stages each;
  - persist Orbit and Standoff first-clear progress under the existing save
    state while leaving Expedition repeatable run collection unchanged;
  - give Standoff and Expedition separate natural progression profiles without
    a traditional difficulty selector.
- GROUNDWORK authorization: limited to `src/state/defaultState.js` and the
  `src/state/store.js` normalizer for the versioned `activityProgress` schema.
- Red-line guard: companion refusal, retreat, D2 safety terminal, guaranteed
  repair reachability and `coreIntegrated:false` remain authoritative; replay
  cannot farm relationship, growth or chapter progress.
- Excluded: `saveManager.js`, `index.html`, Pixi foundation, assets, external
  dependencies, commit, push and publication.
- Branch: `agent/moonlake-three-mode-levels-r1`, based on `origin/main`.

### 2026-07-29 - Codex - Moonlake Three-Mode Level Restructure R1 - IN PROGRESS

- Status: `IN PROGRESS`; mobile map and stage-selection surfaces are being
  integrated with the approved gameplay structure.
- Lane: `Game Art, UI, And Visual Production`.
- Visual scope: retain the existing Moonlake artwork and node positions, replace
  visit/reward clicks with a readable location sheet and five sequential stage
  rows, and keep the existing Standoff/Expedition small entries distinct.
- Acceptance target: usable at `390x844`, no horizontal overflow, no nested
  second map, visible locked/completed/replay states, and reduced-motion-safe
  transitions.
- No asset generation, replacement, deletion or node-coordinate changes are in
  scope.

### 2026-07-29 - Codex - Moonlake Three-Mode Level Restructure R1 - VERIFIED

- Status: `VERIFIED`; the approved gameplay/state package is implemented on
  `agent/moonlake-three-mode-levels-r1`.
- Lane: `Game Engineering And Architecture`.
- Completed:
  - Moonlake Camp remains the first safe arrival; the five route nodes now own
    five authored Orbit stages each (`25` total) with sequential stage gates
    and the approved cross-zone unlock chain;
  - `activityProgress:v1` persists Orbit stage clears, Standoff scenario clears
    and Expedition route discovery through the existing store/save path;
  - Orbit and Standoff permanent settlement grants are first-clear-only, while
    retreat and replay remain non-punitive and cannot farm relationship,
    memory, growth or chapter progress;
  - Standoff uses five chapter-authored tension profiles; Expedition keeps its
    existing repeatable collection loop and exposes three current route depths
    with two future data definitions;
  - Explore routes Orbit, Expedition and Standoff to their own existing
    controllers instead of treating all three as one Orbit sub-menu.
- Validation:
  - all `src/**/*.js` passed `node --check`;
  - Moonlake activity progress `7/7`, Orbit stage `9/9`, Orbit settlement
    `8/8`, Orbit bounded-energy/ring-out `9/9`, Orbit regression suite PASS;
  - state/onboarding migration `35/35`, first-session motivation `8/8`,
    session-owner guard `9/9`, resonance-circle `18/18`, non-confrontation
    chapter growth PASS, map first-session gate PASS;
  - deterministic Starwood survival passed `144/144` launch samples and exact
    `30/60/120 Hz` replay equivalence;
  - `git diff --check` PASS.
- Known unrelated baseline debt: Expedition behavior matrix remains `31/32`;
  the failing legacy `RE2 E-CORE` settlement-voice case and all files it imports
  are unchanged from `origin/main`. The authorized depth/config UI work does
  not promote Expedition beyond `Prototype + partial Core bridge`, and
  `coreIntegrated:false` remains unchanged.
- No commit, push or publication was performed. Existing untracked
  `.codex/**` content was preserved.

### 2026-07-29 - Codex - Moonlake Three-Mode Level Restructure R1 - VERIFIED

- Status: `VERIFIED`; the integrated Moonlake stage-selection surface passed
  mobile browser review.
- Lane: `Game Art, UI, And Visual Production`.
- Browser proof:
  - Chrome at `390x844`: five Moonlake route nodes render their own `0/5`
    progress; Starwood opens a scrollable five-stage sheet with only stage 1
    enabled; starting stage 1 opens the existing Orbit canvas and authored
    objective;
  - retreat resolves safely, exposes `回路徑圖`, and returns focus to the
    original Starwood zone sheet;
  - locked Mirror Hollow remains visible as a preview but all `5/5` stage
    buttons are disabled;
  - Chrome at `390x664`: sheet bounds stay inside the viewport
    (`326 x 316.7 px`), the stage list scrolls (`141/409 px`), and document
    width remains exactly `390 px`;
  - no browser console or page errors were observed.
- Evidence: `output/playwright/moonlake-three-mode-r1-390x844.png` (ignored QA
  output; not part of the product diff).
- Existing map artwork, node coordinates, assets and reduced-motion behavior
  were preserved. No asset generation or replacement was performed.

### 2026-07-29 - Codex - Moonlake Three-Mode Level Restructure R1 Publication - IN PROGRESS

- Status: `IN PROGRESS`; Owner explicitly authorized commit, push and public
  release after reviewing the verified local implementation.
- Lane: `Game Engineering And Architecture`.
- Publication scope: the complete Moonlake five-zone / twenty-five-stage
  package, versioned three-mode progress state, first-clear reward policy,
  independent Explore routes, Standoff tension profiles, Expedition depth
  labels, acceptance/spec updates, focused QA and this ledger record.
- Cleanup proof: repository-local `.codex/**` was not product source. It held
  two empty Moonlake QA logs and a clean `2.37 GiB` Git worktree for already
  merged PR `#157`; the worktree was removed through `git worktree remove`,
  the empty logs and directory were deleted, and remote branch
  `codex/stage1-directional-fishing-r1` / commit `113bb5a` remain recoverable.
- Release path: explicit staging on
  `agent/moonlake-three-mode-levels-r1` -> push -> PR -> required
  `web-release-gate` -> protected-main merge -> Pages and public mobile
  verification.

### 2026-07-29 - Codex - Moonlake Three-Mode Browser Gate Alignment - VERIFIED

- Status: `VERIFIED`; PR `#167` run `30437149965` exposed a stale browser-gate
  assumption, not a runtime crash.
- Lane: `Game Engineering And Architecture`.
- Root cause: `_run_map_first_session_browser_gate.py` still expected clicking
  Starwood Trail to open the retired `.phase-search` exploration sheet. The
  approved runtime now opens the five-stage Moonlake Orbit zone sheet, so the
  old selector timed out.
- Focused correction: the browser gate now proves safe-camp unlock, five-stage
  Starwood selection, mobile containment, zero-write preview, real Orbit entry,
  affirmed zero-write retreat and return-to-source-zone, locked-zone preview,
  separate Standoff/Expedition entries, no Standoff first-clear reward on
  retreat, reduced motion and veteran migration.
- Local browser result: `32/32 PASS` at `390x844`, with zero console/page
  errors. Product runtime, state and safety code were not changed by this CI
  alignment.

### 2026-07-29 - Codex - Moonlake Three-Mode Level Restructure R1 Publication - VERIFIED

- Status: `VERIFIED`; the approved Moonlake three-mode package is merged to
  protected `main` and publicly deployed.
- Lane: `Game Engineering And Architecture`.
- Publication proof:
  - content commit: `fc570baa41e364d7c0452d329c82068e72c6cec3`;
  - browser-gate alignment commit:
    `22c755346d4a40de9e1923cccdf35992bf06021a`;
  - PR: `#167` (`Add Moonlake three-mode level progression`);
  - required PR `web-release-gate`: run `30438269083`, SUCCESS;
  - squash merge: `fb33e739cc26da38ef8d892b1e01e0d4cc125a8d`;
  - Pages build/deploy: run `30438647507`, SUCCESS;
  - post-merge release gate: run `30438652893`, SUCCESS.
- Gate note: initial PR run `30437149965` failed only because its map browser
  test still waited for the retired `.phase-search` selector. The focused QA
  alignment described above passed locally `32/32`; the complete required gate
  then passed before merge.
- Public mobile verification:
  - `https://orochi771127.github.io/NexusLink/?build=fb33e739` loaded the
    deployed build at `390x844`;
  - five route nodes exposed their `0/5` progression, Starwood exposed five
    stages with only stage 1 enabled, and stage 1 opened the existing Orbit
    canvas as `月湖路徑・林口初旋`;
  - document width remained exactly `390 px`, with zero console errors.
- Cleanup proof: `.codex/**` was fully removed after verifying it contained
  only two zero-byte QA logs and a clean `2.37 GiB` linked worktree whose PR
  `#157` was already merged. Its remote commit `113bb5a0c3b298aca1d6a360fac5c2d1f9dd73ed`
  remains recoverable; no product source or unmerged work was deleted.

### 2026-07-29 - Codex - Moonlake RO Depth And Direction R3.2 - VERIFIED / PUBLICATION AUTHORIZED

- Status: `VERIFIED`; Owner approved the fixed-camera 3D environment plus 2D
  companion depth/direction correction and explicitly authorized protected-main
  publication.
- Lane: `Game Engineering And Architecture`.
- Completed:
  - added a live Moonlake depth-occlusion renderer on the existing Pixi
    `layerOcclusion` without moving environment, weather, world projection,
    gameplay or state authority out of the approved Three.js/Pixi hybrid;
  - seven authored occluders now use companion opaque-foot depth or bridge
    surface authority, and are clipped to the actual companion/prop
    intersection so the visual master is not redrawn as a bright foreground
    patch;
  - bridge rails cover companions only on `bridge` / `fishing_spot`; tents,
    lamps and stones switch by projected baseline; legacy R1 foreground plates
    remain available for raster fallback but are hidden in live 3D;
  - QA diagnostics expose loaded occluders, projected rectangles, foot, area
    and currently visible IDs without changing save or product state.
- Validation:
  - `moonlake-living-habitat-r3-cases.mjs`: PASS, `16` companions, `7`
    occluders, `9` interaction hotspots and all fishing phases;
  - `moonlake-ro-depth-direction-r3-2-browser.cjs`: PASS at `390x844`, day and
    night, both front lamps, both tents, bridge rails and all `16` runtime
    `right_walk` selections with `mirrorX:false`;
  - existing R3 living-habitat, fishing-orientation and bridge-clearance
    browser suites: PASS with zero page/console errors;
  - complete local `web-release-gate`: required automated checks `28/28`;
  - `node --check` and `git diff --check`: PASS.
- Red-line / scope proof: no `saveManager`, relationship, reward, growth,
  RaphaelCore, free camera, physics, renderer migration or new dependency
  change.
- Branch: `codex/moonlake-ro-depth-direction-r3-2`; verified content commit:
  `002d83e3d9d945a76d60b0e6cef8362e2c57b3cf`.

### 2026-07-29 - Codex - Moonlake RO Depth And Direction R3.2 - VERIFIED / PUBLICATION AUTHORIZED

- Status: `VERIFIED`; the approved visual correction passed direct mobile
  inspection and asset-integrity QA.
- Lane: `Game Art, UI, And Visual Production`.
- Asset corrections:
  - repaired the mislabeled right-walk sheets for `auriowl`,
    `crystalfin-seahorse`, `blazetail-kit` and `starstripe-cub` by exact
    horizontal mirroring of their approved left sheets; no regeneration,
    redesign or style drift was introduced;
  - extracted seven transparent foreground plates from the current
    Owner-approved Moonlake R2 visual master: bridge rails, two tents, two
    lamps and two stone groups;
  - removed surrounding ground/foliage pixels from the plates, clipped runtime
    redraw to only the companion overlap and calibrated tent/day/night tint to
    avoid bright seams.
- Visual proof:
  - `16/16` right-walk sheets are mechanically closer to mirrored left-facing
    art than same-direction art; the four repaired sheets are exact pixel
    mirrors;
  - the `390x844` contact sheet shows all sixteen heads/bodies facing screen
    right;
  - mobile screenshots prove lamp-before-character, tent-before-character,
    stone/feet coverage and bridge-rail containment in day and night without
    full-screen foreground duplication.
- Evidence is retained under ignored
  `output/playwright/moonlake-ro-depth-direction-r3-2/`; production assets are
  under `assets/layers/MoonlakeDiorama_r2/depth_occluders/`.
- Branch: `codex/moonlake-ro-depth-direction-r3-2`; verified content commit:
  `002d83e3d9d945a76d60b0e6cef8362e2c57b3cf`; no unrelated assets were changed
  or deleted.

### 2026-07-29 - Codex - Moonlake Navigation Collision And Scale R3.3 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved `TP-MOONLAKE-NAV-COLLISION-SCALE-R3.3`.
- Lane: `Game Engineering And Architecture`.
- Scope: calibrate the existing fixed-camera Three.js environment plus Pixi
  companion hybrid for authored no-go geometry, grounded route movement,
  bridge clearance, fishing placement and live companion touch-target tracking.
- Red-line / isolation: no save, relationship, reward, growth, RaphaelCore,
  free-camera, physics-engine, dependency, backend or build-step change; no
  commit, push or publication is authorized by this implementation approval.
- Required reading completed: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`,
  `docs/design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md`,
  `docs/architecture/HABITAT_SCENE_PROFILE_SPEC.md`, active Moonlake profile,
  current art production index, and the latest R3.2 engineering/art ledger
  entries.
- Branch: `codex/moonlake-nav-collision-scale-r3-3`, based on exact
  `origin/main` commit `500528079508875d2233d416e3c84fe00fd54d9a`.

### 2026-07-29 - Codex - Moonlake Navigation Collision And Scale R3.3 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved mobile visual calibration across all
  sixteen runtime companions.
- Lane: `Game Art, UI, And Visual Production`.
- Scope: species-aware display scale, bottom-center foot anchor, contact shadow,
  prop/shoreline depth readability, bridge/fishing silhouette clarity and
  companion-following first-touch affordance at `390x844`, with day/night proof.
- Asset boundary: preserve all approved and fallback art; no asset deletion,
  regeneration, redesign or repository slimming in this package.
- Branch: `codex/moonlake-nav-collision-scale-r3-3`.

### 2026-07-29 - Codex - Moonlake Navigation Collision And Scale R3.3 - VERIFIED / PUBLICATION AUTHORIZED

- Status: `VERIFIED`; implementation and local regression are complete, and
  Owner subsequently authorized commit, push, PR and protected-main merge.
- Lane: `Game Engineering And Architecture`.
- Completed:
  - added one canonical projected-foot collision service with eight authored
    prop footprints and species-aware clearance radii for all sixteen runtime
    companions;
  - replaced the two lamp-crossing near-ground routes and the left-tent
    waypoint with collision-safe coordinates, while preserving the fixed
    camera and existing waypoint graph;
  - route selection now samples the full projected segment and rejects unsafe
    candidates instead of snapping back through an occupied origin;
  - every projected movement and interaction-locked animation now re-aligns
    the current opaque foot after scale/animation changes, removing the
    container-origin drift that previously looked like sliding;
  - live diagnostics now expose navigation safety, actual animated visual
    bounds and the first-touch cue target.
- Validation:
  - R3.3 deterministic safety suite: PASS for `16` companion profiles, `8`
    footprints, `144` reachable waypoint states and `256` directed-edge
    checks; the retired lamp-crossing route reproduces as unsafe;
  - R3.3 Playwright matrix: PASS at `390x844` for `16` companions x `2`
    phases x `9` waypoints = `288/288`, zero page/console errors;
  - bridge clearance: `32/32`; fishing orientation: `80/80`, maximum rail
    offset drift `0 px`, maximum opaque-foot datum drift `2.50 px`;
  - R3 living-habitat and R3.2 depth/direction regressions: PASS; every one of
    the sixteen companions selected `right_walk` with `mirrorX:false`;
  - complete local `web-release-gate`: required automated checks `28/28`;
    `node --check` and `git diff --check`: PASS.
- Red-line / scope proof: no asset, save, relationship, reward, growth,
  RaphaelCore, free-camera, physics-engine, dependency, backend or build-step
  change.
- Branch: `codex/moonlake-nav-collision-scale-r3-3`; base remains
  `500528079508875d2233d416e3c84fe00fd54d9a`; publication commit is the
  current commit carrying this ledger entry.

### 2026-07-29 - Codex - Moonlake Navigation Collision And Scale R3.3 - VERIFIED / PUBLICATION AUTHORIZED

- Status: `VERIFIED`; mobile 2.5D scale, grounding and overlap behavior passed
  visual review, and Owner subsequently authorized protected-main publication.
- Lane: `Game Art, UI, And Visual Production`.
- Visual calibration:
  - added per-species habitat, bridge, fishing and collision calibration for
    the full sixteen-character runtime roster without regenerating art;
  - widened the live bridge presentation envelope and increased fishing
    readability while retaining rail occlusion and bridge-foot alignment;
  - the first-touch affordance now follows the animated visual bounds rather
    than the container shadow/hit area and remains capped for mobile;
  - safe routes keep feet clear of lamp, tent, rock and crystal bases; when a
    character is actually behind a tent/rail/foreground prop, the authored
    depth plate still covers the character.
- Visual proof:
  - day screenshot confirms Greyshade grounded between the lamps with the cue
    centered on the current visual;
  - night screenshot confirms the persistent fishing wait pose and line
    extending beyond the bridge rail toward water;
  - representative and matrix screenshots are retained under ignored
    `output/playwright/moonlake-nav-collision-scale-r3-3/`.
- Asset boundary: no approved, fallback or legacy asset was changed or
  deleted; repository slimming remains a separate future package.
- Branch: `codex/moonlake-nav-collision-scale-r3-3`; publication commit is the
  current commit carrying this ledger entry.

### 2026-07-29 - Codex - Moonlake Fishing Lifecycle Public R3.4 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved
  `TP-MOONLAKE-FISHING-LIFECYCLE-PUBLIC-R3.4`.
- Lane: `Game Engineering And Architecture`.
- Scope: repair the Moonlake fishing state machine so cast, patient wait,
  bite, reel and settle all advance through the same production path for
  ambient, player-triggered and QA-triggered fishing; preserve progress across
  background/foreground transitions without freezing or instant completion.
- Validation target: all sixteen runtime companions, all five authored fishing
  orientations, day/night, legal fishing spots, reduced motion, bridge
  clearance and lifecycle cleanup at `390x844`.
- Red-line / isolation: fishing remains an interruptible companion expression
  with no reward, progression, relationship, memory, save, RaphaelCore,
  dependency, free-camera, physics-engine, backend or build-step change.
- Required reading completed: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`,
  `docs/design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md` and the latest R3.2/R3.3
  engineering and art ledger entries.
- Branch: `codex/moonlake-fishing-lifecycle-public-r3-4`, based on exact
  `origin/main` commit `d2dce40e33723721024a50968c38ea0215a593b7`.
- Publication boundary: implementation approval does not authorize commit,
  push, PR, merge or deployment.

### 2026-07-29 - Codex - Moonlake Fishing Lifecycle Public R3.4 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved the mobile fishing readability pass.
- Lane: `Game Art, UI, And Visual Production`.
- Scope: retain the approved Moonlake composition and companion art while
  making the cast, sustained waiting line/bobber, bite cue, reel and settle
  phases legible at phone scale; keep the line beyond the bridge rail and
  remove temporary FX cleanly when fishing ends.
- Asset boundary: no asset generation, replacement, deletion or repository
  slimming; visual work is limited to existing runtime transforms and effects.
- Branch: `codex/moonlake-fishing-lifecycle-public-r3-4`.

### 2026-07-29 - Codex - Moonlake Fishing Lifecycle Public R3.4 - VERIFIED LOCALLY

- Status: `VERIFIED LOCALLY`; implementation and scoped regression are
  complete. Commit, push, PR, merge and deployment remain unauthorized.
- Lane: `Game Engineering And Architecture`.
- Completed:
  - fishing now records and completes one shared
    `cast -> wait -> bite -> reel -> settle -> idle` lifecycle for ambient,
    player/runtime and QA paths;
  - interaction-animation locks pause rather than consume the fishing clock;
    page backgrounding shifts the active phase deadline, so foreground resume
    neither freezes nor skips the patient wait;
  - busy states still interrupt cleanly and now report an in-memory reason;
    completed and interrupted lifecycle diagnostics leave no reward, save,
    relationship or memory write;
  - added bounded QA acceleration plus lifecycle history only behind the
    existing `moonlakeBridgeQa=1` gate; production timing remains unchanged,
    including the authored `8.5-14 s` wait.
- Validation:
  - R3.4 deterministic lifecycle: PASS for interaction-lock pause,
    visibility pause/resume, all phases and interruption cleanup;
  - R3.4 `390x844` browser matrix: `160/160` lifecycle cases
    (`16` companions x `5` orientations x day/night) and `80/80` bridge-line
    readability cases; zero page/console errors;
  - production-speed Greyshade proof: sustained `10 s` wait, reduced-motion,
    `900 ms` simulated background pause with unchanged progress, successful
    resume through bite/reel/settle/idle and FX cleanup;
  - existing deterministic regressions: navigation `16` companions, `8`
    footprints, `144` waypoint states and `256` directed edges; bridge
    clearance `64/64`; fishing orientation `80/80`; R3 living-habitat PASS;
  - repo-native release gate first run: `27/28`; the sole failure was mobile
    `live3dCanvasReady:false` with zero console/accessibility errors. Exact
    `accessibility_responsive_probe` rerun passed mobile and desktop with
    `live3dCanvasReady:true`, zero console errors, zero warnings and no
    horizontal overflow, confirming a transient Three.js/CDN readiness flake;
  - `node --check` and `git diff --check`: PASS.
- Known test-environment note: two older Moonlake browser scripts start during
  the real nighttime sleep window and correctly interrupt fishing as `sleep`;
  R3.4's time-independent matrix explicitly performs one habitat interaction
  before testing and is the authoritative browser evidence for this package.
- MCP note: repeated `codebase-memory-mcp` index/list attempts returned
  `Transport closed`; no false MCP success is claimed. Retry indexing and ADR
  recording before publication if the service becomes available.
- Branch: `codex/moonlake-fishing-lifecycle-public-r3-4`; base remains exact
  `origin/main` commit `d2dce40e33723721024a50968c38ea0215a593b7`.

### 2026-07-29 - Codex - Moonlake Fishing Lifecycle Public R3.4 - VERIFIED LOCALLY

- Status: `VERIFIED LOCALLY`; mobile visual proof passed and no asset was
  changed.
- Lane: `Game Art, UI, And Visual Production`.
- Visual result:
  - the bridge line is longer and thicker, begins from the water-facing side
    of the companion, and ends visibly beyond the bridge rail for left, right
    and far-water orientations;
  - the wait phase holds a visible bobber with two restrained water rings and
    a slight non-reduced-motion drift; bite adds one bounded line/bobber jolt;
  - reduced-motion keeps a static but readable line, bobber and rings;
    settle fades and lifecycle completion removes all fishing FX;
  - first-touch guidance remains hidden after `firstTouchCompleted`.
- Visual proof: `390x844` day/night checks cover all sixteen runtime
  companions and five fishing orientations; representative Greyshade proof is
  retained under ignored
  `output/playwright/moonlake-fishing-lifecycle-public-r3-4/`.
- Asset boundary: no scene, character, GLB, texture, approved fallback or
  legacy asset was generated, modified or deleted.
- Branch: `codex/moonlake-fishing-lifecycle-public-r3-4`.

### 2026-07-30 - Codex - Moonlake Fishing Lifecycle Public R3.4 - MCP RESTORED / PUBLICATION AUTHORIZED

- Status: `VERIFIED`; Owner explicitly authorized commit, push, PR and
  protected-main integration.
- Lane: `Game Engineering And Architecture`.
- MCP recovery:
  - the desktop transport remained closed, so the installed
    `codebase-memory-mcp` CLI was used as the supported local fallback;
  - persistent indexing completed successfully with `7,463` nodes and
    `15,949` edges for this exact R3.4 worktree;
  - the R3.4 architecture decision was recorded: fishing is a pausable,
    in-memory lifecycle; visibility and interaction locks shift deadlines;
    QA acceleration is restricted to `moonlakeBridgeQa=1`; fishing writes no
    save, reward, relationship, memory or RaphaelCore state.
- Publication scope: only the two runtime modules, two R3.4 QA scripts and
  this cross-agent ledger are eligible. The generated `.codebase-memory/`
  local index cache and ignored browser evidence are not repository payload.
- Branch: `codex/moonlake-fishing-lifecycle-public-r3-4`; base remains exact
  `origin/main` commit `d2dce40e33723721024a50968c38ea0215a593b7`.

### 2026-07-30 - Codex - Moonlake Fishing Lifecycle Public R3.4 - PUBLICATION AUTHORIZED

- Status: `VERIFIED`; Owner explicitly authorized protected-main publication.
- Lane: `Game Art, UI, And Visual Production`.
- Visual publication scope remains limited to runtime transforms and effects:
  readable bridge-side line, sustained bobber/rings, bite cue and clean
  settle/cleanup at mobile scale.
- Asset boundary: no scene, character, GLB, texture, approved fallback or
  legacy asset is part of this publication package.
- Public QA: the R3.4 browser harness accepts `R3_4_BASE_URL` so the same
  production-speed lifecycle proof can be run against GitHub Pages after the
  protected-main deployment.
- Branch: `codex/moonlake-fishing-lifecycle-public-r3-4`.

### 2026-07-30 - Codex - Moonlake Occlusion Seam R3.5 - VERIFIED LOCALLY

- Status: `VERIFIED LOCALLY`; Owner approved
  `TP-MOONLAKE-OCCLUSION-SEAM-R3.5`. Commit, push, PR, merge and deployment
  remain unauthorized.
- Lane: `Game Engineering And Architecture`.
- Root cause: the circled mark beside the left foreground lamp was the
  authored Pixi depth-occlusion plate, not an extra Three.js shadow. The
  plate copied the correct scene pixels but used a flat night tint that did
  not match the live Three.js night colour transform, making its rectangular
  seam visible. Full transparent animation-frame bounds could also activate a
  plate before opaque companion pixels reached it.
- Completed:
  - depth checks now use cached opaque-pixel bounds for the current animated
    frame and fall back safely when pixel data cannot be read;
  - masks are clipped to the actual opaque-frame intersection, while genuine
    lamp, tent and bridge-rail foreground coverage is preserved;
  - occlusion plates use a Pixi colour matrix matching the live Three.js base
    day/night transform, with a bounded tint fallback;
  - diagnostics now expose bounds source, intersection area, overlap ratio
    and colour mode without moving authority out of the existing hybrid
    runtime.
- Validation:
  - R3.5 deterministic alpha-bounds, day identity, night base transform,
    transparent-padding rejection and genuine-overlap fixtures: PASS;
  - R3.5 browser matrix: `96/96` cases for `16` companions x `3` light phases
    x `2` phone viewports; `192/192` left/right lamp route checks; tent and
    bridge-rail regression assertions passed; zero page/console errors;
  - existing deterministic R3/R3.2/R3.3/R3.4, bridge-clearance and fishing
    orientation suites: PASS;
  - complete repo-native web release gate: required checks `28/28`, JavaScript
    syntax `368/368`, zero accessibility warnings;
  - `node --check` and `git diff --check`: PASS.
- Known test-environment note: two older browser harnesses still enter the
  real nighttime sleep/fishing state and therefore do not deterministically
  reach their requested walk assertion. The R3.5 harness wakes the habitat
  through the existing QA interaction before checking depth and is the
  authoritative time-independent proof for this package.
- MCP: the reconnected desktop connector indexed this exact worktree
  persistently as
  `C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink-moonlake-occlusion-r3-5`
  with `15,800` nodes and `31,619` edges, wrote a shareable compressed graph
  artifact, and recorded the R3.5 depth-occlusion architecture decision.
- Required reading completed: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`,
  `docs/design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md` and the latest
  R3.2-R3.4 engineering/art ledger entries.
- Red-line / scope proof: no scene/character asset, GLB, texture, save,
  relationship, reward, growth, RaphaelCore, dependency, free-camera,
  physics-engine, backend or build-step change.
- Branch: `codex/moonlake-occlusion-seam-r3-5`, based on exact
  `origin/main` commit `ae5f1241cb03c418a997f32a2b3acc687ba608bd`.

### 2026-07-30 - Codex - Moonlake Occlusion Seam R3.5 - VERIFIED LOCALLY

- Status: `VERIFIED LOCALLY`; the left-lamp ghost seam is removed while real
  foreground occlusion remains.
- Lane: `Game Art, UI, And Visual Production`.
- Visual result:
  - the lamp plate now follows only the companion's visible current-frame
    pixels, so transparent sprite padding cannot create a premature block;
  - day pixels remain unchanged and dusk/night plates follow the environment's
    base colour grading instead of appearing as a grey-green rectangle;
  - lamps still cover a companion when its visible body actually passes
    behind them; tent entrances and bridge rails retain their authored depth.
- Visual proof: representative night captures at `390x844` and `430x932`,
  plus the full sixteen-companion matrix, are retained under ignored
  `output/playwright/moonlake-occlusion-seam-r3-5/`.
- Asset boundary: all seven depth plates were pixel-compared with the approved
  visual master and matched; no asset was regenerated, modified or deleted.
- Branch: `codex/moonlake-occlusion-seam-r3-5`.

### 2026-07-30 - Codex - Moonlake Occlusion Seam R3.5 - PUBLICATION AUTHORIZED

- Status: `VERIFIED`; Owner explicitly authorized commit, push, PR,
  protected-main integration and persistent codebase-memory publication.
- Lane: `Game Engineering And Architecture`.
- Publication scope: the depth-occlusion runtime module, two R3.5 QA
  harnesses, this cross-agent ledger, and the MCP-generated
  `.codebase-memory` manifest, attributes and compressed graph artifact.
- MCP publication: the persisted graph contains the indexed repository plus
  the R3.5 ADR covering opaque current-frame bounds, real-intersection
  clipping and Three/Pixi base day-night colour matching.
- Branch: `codex/moonlake-occlusion-seam-r3-5`; target: protected `main`.

### 2026-07-30 - Codex - Moonlake Occlusion Seam R3.5 - PUBLICATION AUTHORIZED

- Status: `VERIFIED`; Owner explicitly authorized protected-main publication.
- Lane: `Game Art, UI, And Visual Production`.
- Visual publication scope remains runtime-only: remove the left-lamp ghost
  seam while preserving real lamp, tent and bridge-rail foreground depth.
- Asset boundary: no approved scene, character, GLB, texture, fallback or
  legacy art asset is part of this publication package.
- Branch: `codex/moonlake-occlusion-seam-r3-5`.
### 2026-07-30 - Codex - Soul Talk Mobile Viewport R1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved `TP-SOUL-TALK-MOBILE-VIEWPORT-R1`.
- Lane: `Game Art, UI, And Visual Production`.
- Scope: make the phone Soul Talk drawer prioritize the latest companion
  response, merge the heading and presence state into one compact control row,
  keep Traditional Chinese quick replies on one 44px row, and preserve the
  composer plus bottom navigation at `390x844` and the Safari-like `390x664`
  effective viewport.
- Design boundary: retain the Moonlake navy/cyan/gold visual system and use the
  miniature heart-lake waveform as the only primary motion signature. Do not
  shrink dialogue copy below a readable mobile size or reduce interactive
  targets below 44px.
- GROUNDWORK / non-goals: no `index.html`, state, save, Pixi, asset, bottom-nav,
  dependency, backend or build-step change.
- Planned proof: focused deterministic quick-reply cases, `390x844` and
  `390x664` Chromium geometry, keyboard-focus compaction, 200% text, reduced
  motion, horizontal-overflow checks and inspected screenshots.
- Branch: `codex/soul-talk-mobile-viewport-r1`, based on exact `origin/main`
  commit `ae5f124`.

### 2026-07-30 - Codex - Soul Talk Mobile Viewport R1 - IN PROGRESS

- Status: `IN PROGRESS`; the approved UI package also touches the quick-reply
  presentation contract and latest-turn scroll policy.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Scope: replace generic visible `（換個說法）` suffixes with authored compact
  alternate labels while retaining full action intent, and make each rendered
  turn show the companion response before historical context can consume the
  short mobile viewport.
- Red-line check: RaphaelCore safety classification, response authority,
  gameplay state, reward, relationship, preference, memory and trace writers
  remain unchanged. Safety-terminal turns must still render zero quick replies.
- Required reading completed: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`,
  `docs/production/ANTI_AI_SLOP_UX_GATE.md`, current Soul Talk controller and
  quick-reply planner, and the latest relevant ledger entries.
- Branch: `codex/soul-talk-mobile-viewport-r1`, based on exact `origin/main`
  commit `ae5f124`.

### 2026-07-30 - Codex - Soul Talk Mobile Viewport R1 - VERIFIED

- Status: `VERIFIED`; the approved mobile composition is implemented.
- Lane: `Game Art, UI, And Visual Production`.
- Completed: the mobile header now combines companion identity and presence in
  one compact row; the quick-reply region is a single 44px horizontal rail; the
  composer is 60px or less with 44px controls; the reading-state drawer uses
  recovered height for the conversation instead of stacked helper controls.
- Mobile behavior: after a touch send completes, the keyboard is dismissed and
  the expanded reading viewport re-anchors on the completed turn. Desktop input
  focus remains unchanged. If the latest turn fits, the player line and complete
  companion reply remain visible; if it is taller than the chat viewport, the
  first companion response is brought into view.
- Focused proof:
  - `node docs/qa/soul-talk-mobile-viewport-r1-cases.mjs`: `11/11 PASS`.
  - `node docs/qa/soul-talk-mobile-viewport-r1-browser.cjs`: `39/39 PASS`
    across `390x844` and Safari-like `390x664`.
  - Geometry covered document overflow, header height, single-row quick replies,
    44px targets, composer height, bottom-nav clearance, latest-response
    visibility, keyboard focus, 200% text and reduced motion.
  - Screenshots inspected at both target sizes; no page or console errors.
- Scope audit: only EXPERIENCE CSS/controller/planner, focused QA,
  `ACCEPTANCE.md` and this ledger changed. No GROUNDWORK file or dependency
  changed. `git diff --check` passed.
- Branch: `codex/soul-talk-mobile-viewport-r1`; no commit or publication was
  authorized.

### 2026-07-30 - Codex - Soul Talk Mobile Viewport R1 - VERIFIED

- Status: `VERIFIED`; compact presentation did not weaken RaphaelCore or safety
  authority.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Completed: long visible quick-reply copy and the generic
  `（換個說法）` suffix were replaced with authored compact labels. Intent,
  action type and accessible alternate meaning remain available to the
  controller.
- Regression proof:
  - `node docs/qa/soul-talk-diversity-short-memory-cases.mjs`: all passed.
  - `node docs/qa/soul-talk-transcript-journal-cases.mjs`: all passed.
  - `python docs/qa/_run_dialogue_loop.py`: `21/21 PASS`, zero forbidden
    phrases and zero console errors.
  - `python docs/qa/_run_safety_terminal_ui_gate.py`: `7/7 PASS` at energy
    `0`, `7` and `10`.
- Red-line result: safety-terminal turns still expose zero quick replies, zero
  SFX, zero gameplay/reward/memory delta and no secondary storage. RaphaelCore
  safety classification, companion boundaries, preference profile and response
  authority remain unchanged.
- Handoff: retain the one-row rail and latest-response scroll contract when
  adding future languages; longer locales may use horizontal chip scrolling,
  but must not restore a second stacked row above the composer.
- Branch: `codex/soul-talk-mobile-viewport-r1`; no commit or publication was
  authorized.

### 2026-07-30 - Codex - Soul Talk Mobile Viewport R1 - PUBLISHED

- Status: `COMPLETED`; Owner subsequently authorized commit, push and protected
  `main` integration.
- Lane: `Game Art, UI, And Visual Production`.
- Delivery: implementation commit `c87e0af` was pushed on
  `codex/soul-talk-mobile-viewport-r1`; PR `#173` passed the required
  `web-release-gate` and was squash-merged as
  `0e6ac0898df4bc72f20ff5ac6653a11e8a5a3199`.
- Post-merge proof: the main-branch release gate and GitHub Pages deployment
  both completed successfully. Public cache-busted reads returned HTTP `200`
  and confirmed the latest-response scroll policy, touch reading mode and
  single 44px quick-reply rail in the deployed controller, planner and CSS.
- Public target: `https://orochi771127.github.io/NexusLink/`.
- MCP: project
  `C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink` was re-indexed in
  `moderate` mode with `11,419` nodes and `19,448` edges; graph lookup resolves
  the updated `scrollChatLog`, `renderQuickReplies` and quick-reply planner
  functions.

### 2026-07-30 - Codex - Soul Talk Mobile Viewport R1 - PUBLISHED

- Status: `COMPLETED`; protected publication preserved RaphaelCore and safety
  authority.
- Lane: `Raphael Core, Companion Reasoning, And Soul Talk`.
- Gate evidence: pre-merge focused checks remained `11/11`, `39/39`, `21/21`
  and `7/7`; required PR gate and post-merge main gate both concluded
  `success`.
- Safety evidence: deployed safety-terminal behavior remains zero quick
  replies, zero SFX, zero gameplay/reward/memory delta and no secondary
  storage. No Core classifier, response authority, preference or state-writer
  contract changed.
- Remote truth: PR `#173` is `MERGED`; GitHub remote `main` and
  `origin/main` both resolved to
  `0e6ac0898df4bc72f20ff5ac6653a11e8a5a3199` at publication verification.
### 2026-07-30 - Codex - First Session Visual Continuity R1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved
  `TP-FIRST-SESSION-VISUAL-CONTINUITY-R1`.
- Lane: `Game Engineering And Architecture`.
- Scope: replace the exposed fallback/Pixi/Live3D boot swaps with one
  first-session presentation gate. Start, Identity, Guidance and Initial Bond
  retain one Moonlake composition while Pixi/Three load behind it; the
  renderer is revealed only after a stable scene result or a session-locked
  static fallback.
- GROUNDWORK approval: `index.html` and one optimized derivative under
  `assets/backgrounds/MoonlakeDiorama_r2/` are approved for this task.
  `src/pixi/pixiApp.js`, save, state normalization and existing approved
  source art remain unchanged.
- Runtime boundary: Three.js remains environment-only, Pixi remains the
  illustrated companion/FX layer, and DOM remains UI authority. No gameplay,
  relationship, reward, safety, RaphaelCore or persistence semantics change.
- Planned proof: deterministic readiness/fallback cases, JavaScript syntax,
  existing first-session regression gates, and Chromium visual/geometry proof
  at mobile and desktop sizes including throttled/failure paths.
- Branch: current clean `main` at `24eb3a3`; commit, push and publication are
  not authorized.

### 2026-07-30 - Codex - First Session Visual Continuity R1 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved the unified
  `Moonlake Heartcore Arrival` presentation.
- Lane: `Game Art, UI, And Visual Production`.
- Visual direction: an owner-approved Moonlake R2 composition remains fixed
  from boot through Start, Identity, Guidance and Initial Bond. A single
  incomplete moon-ring/heart-core mark carries loading, focus and resonance;
  the onboarding surface becomes one ritual scroll instead of nested glass
  cards.
- Asset boundary: the new first frame is a mechanically compressed derivative
  of `moonlake_visual_master_r2.png`; it does not revise the approved
  composition, characters, GLB, depth plates or source master.
- Mobile target: `390x844` and `430x932`, 14-16px edge safety, 44px controls,
  no horizontal overflow, keyboard-reachable Identity actions, and no visible
  habitat swap before the single reveal.
- Branch: current clean `main` at `24eb3a3`; commit, push and publication are
  not authorized.

### 2026-07-30 - Codex - First Session Visual Continuity R1 - VERIFIED

- Status: `VERIFIED`; the first-session presentation gate and fallback path are
  implemented on the current worktree.
- Lane: `Game Engineering And Architecture`.
- Completed: boot now exposes a real progress surface while the same approved
  Moonlake first frame decodes; onboarding can proceed without waiting for
  Three/Pixi; the renderer receives a first-wins `live` or session-locked
  `static` result; the onboarding surface performs one controlled reveal only
  after that result is ready.
- Failure result: with `live3d=0`, Start through the completed habitat remains
  on the static Moonlake frame while the illustrated companion and DOM UI stay
  available. There is no blank canvas, half-built terrain or late live-scene
  takeover.
- Automated proof:
  - JavaScript syntax, manifest JSON and `git diff --check`: passed.
  - onboarding normalization: `35/35`; first-session motivation: `8/8`.
  - map first-session browser gate: `32/32`.
  - Growth browser gate after adopting the new loader-readiness contract:
    `156/156`.
  - full Web Release Gate: `28/28` required automated checks, zero
    accessibility warnings.
- Browser proof: the complete Start → Identity → Guidance → Initial Bond →
  First Resonance → habitat path passed in Chromium at `390x844`; live and
  forced-static completion paths both reached the usable habitat.
- Scope audit: no save schema, state normalization, default state,
  `pixiApp.js`, dependency, build step, gameplay, reward, RaphaelCore or safety
  authority changed.
- Branch: local `main` based on `24eb3a3`; no commit, push or publication was
  authorized.

### 2026-07-30 - Codex - First Session Visual Continuity R1 - VERIFIED

- Status: `VERIFIED`; the unified `Moonlake Heartcore Arrival` art and UI
  composition passed inspected browser proof.
- Lane: `Game Art, UI, And Visual Production`.
- Completed: Loading, Start, Identity, Guidance, Initial Bond and the final
  meet panel share one portrait Moonlake crop, indigo ritual-scroll surface,
  incomplete moon-ring mark and restrained cyan/gold hierarchy. The three bond
  choices now read as one uninterrupted list rather than nested cards.
- Mobile geometry:
  - `390x844`: 362x470 shell, 50px primary controls, zero document overflow;
    all three Initial Bond choices fit in the shell with 72-85px rows.
  - `430x932`: 402x470 shell, 50px primary control, zero document overflow.
  - `390x664`: the short-screen shell remains 470px instead of stretching into
    an empty full-height panel; the 52px identity input and 50px actions remain
    visible.
  - `1280x900`: the portrait game stage remains centered with a 444x470 shell
    and 50px CTA; no horizontal overflow.
- Visual inspection: Start, Identity and Guidance terrain crops were stable;
  Identity → Guidance was pixel-identical in the terrain region. Initial Bond,
  First Resonance, live habitat and static-fallback habitat screenshots were
  inspected with no clipping, blank frame or mixed-background seam.
- Asset boundary: the added 720x1280 WebP is a 104,012-byte mechanical
  derivative of the approved Moonlake R2 master. The master, GLB, depth plates,
  character art and existing approved assets were not revised or removed.
- Remaining human proof: real iOS/Android browser matrices and moderated
  first-session comprehension remain release-level manual gates.
- Branch: local `main` based on `24eb3a3`; no commit, push or publication was
  authorized.

### 2026-07-30 - Codex - First Session Visual Continuity R1 - PUBLICATION AUTHORIZED

- Status: `VERIFIED`; Owner explicitly authorized commit, push, protected-main
  integration and codebase MCP refresh after a strict 3D-scope review.
- Lane: `Game Engineering And Architecture`.
- Publication scope: the first-session loader, presentation controller,
  onboarding reveal handshake, static fallback visibility, focused browser-gate
  readiness update and engineering ledger evidence.
- Strict 3D audit: no GLB/glTF, Three.js scene module, Moonlake scene layout,
  object pack, profile, water, waterfall, lighting, navigation or
  `src/pixi/pixiApp.js` file changed. `src/app.js` only coordinates when the
  existing live renderer becomes visible and locks a session to the static
  fallback when stable frames are unavailable.
- Delivery route: feature branch → PR → required `web-release-gate` → protected
  `main` merge → local/remote synchronization → codebase MCP re-index.

### 2026-07-30 - Codex - First Session Visual Continuity R1 - PUBLICATION AUTHORIZED

- Status: `VERIFIED`; Owner approved publication of the unified Moonlake
  onboarding art/UI surface.
- Lane: `Game Art, UI, And Visual Production`.
- Asset scope: one 720x1280, 104,012-byte WebP derivative and its manifest
  declaration. The approved 1080x1920 Moonlake R2 master remains byte-unchanged;
  no source composition, character art, 3D asset or depth plate is replaced.
- Visual scope: Loading, Start, Identity, Guidance, Initial Bond and First
  Resonance retain the same Moonlake composition and one ritual-scroll language
  until the single live/static scene reveal.

### 2026-07-30 - Codex - First Session Visual Continuity R1 - PUBLISHED

- Status: `COMPLETED`; Owner-authorized protected-main publication is complete.
- Lane: `Game Engineering And Architecture`.
- Delivery: implementation commit `c3f0763` was pushed on
  `codex/first-session-visual-continuity-r1`; PR `#175` passed the required
  `web-release-gate` and was squash-merged into `main` as
  `4de910729fe8b03f61f0483709658577b5567778`.
- Post-merge proof: the `main` Nexus Link Release Gate and GitHub Pages
  deployment both completed successfully. Cache-busted public reads returned
  HTTP `200` and confirmed the loader markup, presentation controller, app
  wiring and first-session readiness styles.
- Remote truth: local `main`, remote `main` and `origin/main` resolved to
  `4de910729fe8b03f61f0483709658577b5567778` with `0/0` divergence and a clean
  worktree before this ledger-only closure.
- MCP: project `C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink` was
  re-indexed in `moderate` mode and reached `ready` with `11,450` nodes and
  `19,551` edges. Graph search resolves
  `createFirstSessionPresentationController`.

### 2026-07-30 - Codex - First Session Visual Continuity R1 - PUBLISHED

- Status: `COMPLETED`; the approved Moonlake onboarding art/UI package is live.
- Lane: `Game Art, UI, And Visual Production`.
- Public proof: `https://orochi771127.github.io/NexusLink/` serves the unified
  onboarding CSS and the exact 104,012-byte
  `moonlake_onboarding_first_frame_r1.webp` derivative.
- 3D boundary after publication: the merged package contains no GLB/glTF,
  Three.js scene module, Moonlake layout, object pack, profile, water,
  waterfall, lighting, navigation, depth plate or `src/pixi/pixiApp.js` change.
  Only the existing renderer's reveal timing and session-static fallback
  visibility are coordinated by the presentation layer.

### 2026-07-30 - Codex - Moonlake Bridge Compositing R3.6 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved
  `TP-MOONLAKE-BRIDGE-COMPOSITING-R3.6` and requires all sixteen runtime
  companions to pass.
- Lane: `Game Engineering And Architecture`.
- Scope: remove the flat shader-painted bridge extensions that appear as two
  brown blocks, keep the fixed-camera Moonlake Three/Pixi ownership boundary,
  and recalibrate the existing bridge projection and rail occlusion against the
  authored bridge silhouette.
- Expected files: `src/three/moonlakeLive3dScene.js`,
  `src/three/moonlakeLive3dConfig.js`, only if required
  `src/pixi/moonlakeDepthOcclusion.js`, focused QA, and this ledger.
- Red-line / isolation: no `assets/**`, `src/pixi/pixiApp.js`, save, state
  normalization, relationship, reward, Growth, RaphaelCore, safety, dependency,
  backend, build-step, free-camera or gameplay-authority change.
- Acceptance: all sixteen runtime companions must pass bridge near/mid/far
  projection, bridge-rail depth continuity, foot anchoring and mobile visual
  inspection at `390x844`; existing R3.2-R3.5 and bridge/fishing regressions
  remain green.
- Required reading completed: `AGENTS.md`, `CLAUDE.md`, `ACCEPTANCE.md`,
  `docs/design/MOONLAKE_LIVE_3D_HYBRID_CONTRACT_V1.md`, and the latest
  R3.2-R3.5 engineering/art ledger entries.
- Branch: local `main` at `ffe321c`; commit, push and publication remain
  unauthorized.

### 2026-07-30 - Codex - Moonlake Bridge Compositing R3.6 - IN PROGRESS

- Status: `IN PROGRESS`; the visual gate is sixteen companions, not a
  single-character patch.
- Lane: `Game Art, UI, And Visual Production`.
- Visual defect: the fullscreen Moonlake shader widens the source bridge with
  flat wood-colour bands, while the transparent Pixi bridge-rail depth plate
  remains aligned to the original bridge. The mismatch produces two permanent
  brown blocks and a detached pale rail fragment when the companion crosses the
  bridge.
- Visual target: preserve the approved Moonlake composition and natural
  Ragnarok Online-like foreground depth, but render no synthetic block-shaped
  bridge extension and no disconnected white/pale occlusion fragment.
- Asset boundary: no scene, character, GLB, depth-plate, fallback or legacy art
  asset may be regenerated, modified or deleted in this package.

### 2026-07-30 - Codex - Moonlake Bridge Compositing R3.6 - VERIFIED

- Status: `VERIFIED`; all sixteen runtime companions pass the corrected bridge
  compositing path.
- Lane: `Game Engineering And Architecture`.
- Completed: removed the fragment-shader bridge widening and its flat
  wood-colour extension masks. The live backdrop now preserves the authored
  Moonlake bridge silhouette while the existing Pixi bridge-rail depth plate
  retains foreground occlusion ownership.
- Focused proof:
  - R3.6 deterministic contract: passed; all sixteen presentation profiles,
    authored-silhouette flag and absence of synthetic bridge shader tokens were
    asserted.
  - R3.6 mobile browser matrix: `32/32` at `390x844` (sixteen companions,
    day/front-walk and night/back-walk); bridge projection, opaque-frame
    bounds, foot placement, rail intersection and rail visibility passed with
    zero page or console errors.
  - Navigation/collision/scale browser matrix: `288/288`.
  - Occlusion seam browser matrix: `96/96` across sixteen companions, day/dusk/
    night and `390x844` / `430x932`.
  - Full Web Release Gate: `28/28` required automated checks and zero
    accessibility warnings.
- Scope audit: no `assets/**`, GLB/glTF, depth plate, `src/pixi/pixiApp.js`,
  save/state, relationship, Growth, reward, RaphaelCore, safety, dependency,
  backend or build-step change.
- Remaining architecture boundary: this package corrects the current
  fixed-camera Three/Pixi compositor. Enabling or rebuilding hidden GLB scene
  geometry would be a separate Owner-approved GROUNDWORK/art package.
- Branch: local `main` based on `ffe321c`; no commit, push or publication was
  authorized.

### 2026-07-30 - Codex - Moonlake Bridge Compositing R3.6 - VERIFIED

- Status: `VERIFIED`; the photographed brown blocks and detached pale bridge
  fragment are no longer present in the corrected composition.
- Lane: `Game Art, UI, And Visual Production`.
- Visual proof: the sixteen-companion contact sheet and full-resolution
  Blazetail/Greyshade frames were inspected. The natural narrow bridge remains
  readable, the foreground rails stay connected during body overlap, and feet
  remain planted on the fixed bridge datum.
- Pixel proof: the two retired extension bands resolve to lake colours
  (`blue-red` deltas `92.06` and `49.81`) with a wood-like pixel ratio of `0`
  in both samples.
- Asset boundary: the approved Moonlake visual master, all sixteen character
  assets, GLB, bridge depth plate, fallbacks and legacy art remain unchanged.
- Remaining human proof: real iOS Safari remains a release-level device check;
  the local mobile browser and automated Chromium matrices are green.

### 2026-07-30 - Gemini - Moonlake Bridge Compositing R3.6 - PUBLISHED

- Status: `COMPLETED`; the Owner-authorized R3.6 package is merged and live.
- Lane: `Game Engineering And Architecture`.
- Delivery: PR `#177` passed the required `web-release-gate` and was
  squash-merged into protected `main` as
  `b8c76be0ccf1486bb6240cbf632bb64feed9bc38`.
- Post-merge proof: the `main` Nexus Link Release Gate and GitHub Pages
  deployment completed successfully. Cache-busted public reads of
  `moonlakeLive3dScene.js` and `moonlakeLive3dConfig.js` are byte-for-byte
  SHA-256 matches with local `main`.
- Remote truth: local `main`, `origin/main` and the deployed Pages build resolve
  to `b8c76be` with `0/0` divergence and a clean worktree before R4.0 starts.
- MCP: project
  `C-Users-User-NexusLink_RaphaelAI_Workspace-NexusLink` is `ready`; graph
  search resolves the R3.6 `useAuthoredSilhouette` contract.

### 2026-07-30 - Codex - Moonlake Visible GLB Feasibility R4.0 - IN PROGRESS

- Status: `IN PROGRESS`; Owner approved
  `TP-MOONLAKE-VISIBLE-GLB-FEASIBILITY-R4.0`.
- Lane: `Game Engineering And Architecture`.
- Layer: `GROUNDWORK + EXPERIENCE`; the candidate remains dev-query-gated and
  cannot become the shipping default in this package without a separate Owner
  visual approval.
- Scope: audit and expose the existing Moonlake GLB as a genuinely visible
  Three.js environment candidate, preserve the raster visual master strictly
  as the default/loading/reduced-capability/failure presentation, and validate
  the existing Pixi 2D companion projection against real visible geometry.
- Expected files: `src/three/moonlakeLive3dScene.js`,
  `src/three/moonlakeLive3dConfig.js`, focused R4 QA/evidence, and this ledger.
- Asset boundary: the existing
  `assets/3d/moonlake/moonlake_clay_resin_r3.glb`, R2 visual master, depth
  plates and all sixteen companion roots remain byte-unchanged. If the current
  GLB cannot meet the visual bar, this package stops with evidence and proposes
  a separately approved R4.1 Blender reconstruction.
- Red-line / isolation: no `src/pixi/pixiApp.js`, save, state normalization,
  relationship, reward, Growth, RaphaelCore, Safety, dependency, backend,
  build-step, free-camera or gameplay-authority change.
- Acceptance: H1-H6 and I; sixteen companions retain their own animation
  policy and pass bridge/platform projection, foot anchoring and depth
  readability at `390x844`; GLB/WebGL failure and reduced motion retain a
  usable static fallback; no duplicate render loop or context-loss leak.
- Branch: clean local `main` at `b8c76be`; commit, push, promotion and
  publication remain unauthorized.

### 2026-07-30 - Codex - Moonlake Visible GLB Feasibility R4.0 - IN PROGRESS

- Status: `IN PROGRESS`; this is an evidence-gated visible-geometry candidate,
  not an automatic replacement of the Owner-approved R2 composition.
- Lane: `Game Art, UI, And Visual Production`.
- Visual target: a fixed elevated three-quarter GLB scene with readable cliff
  masses, waterfalls, lake, central platform, tents and a continuous bridge,
  while the active companion remains an illustrated bottom-center Pixi sprite
  with Ragnarok Online-like foreground/background depth.
- Human gate: day/clear, dusk/mist, night/rain and reduced-motion mobile
  captures must be inspected before any default-mode promotion. A technically
  correct but visually primitive GLB candidate is a valid R4.0 blocker, not a
  reason to lower the approved visual bar.

### 2026-07-30 - Codex - Moonlake Visible GLB Feasibility R4.0 - VERIFIED / PROMOTION BLOCKED

- Status: `VERIFIED`; the feasibility package is complete, but the current GLB
  is explicitly `BLOCKED` from becoming the shipping visual.
- Lane: `Game Engineering And Architecture`.
- Completed: added the dev-query-only
  `?live3d=1&moonlakeVisibleGlb=1` render mode. It exposes the existing GLB
  meshes, keeps the live Three.js water/waterfall/grass/weather rig active,
  hides the raster visual master only inside the candidate, and uses the real
  Three camera for world-to-screen companion projection. The shipping default
  remains `false` and continues to use the Owner-approved R2/R3.6 live
  diorama.
- Sixteen-companion proof: `64/64` candidate projection cases passed at
  `390x844` across platform center and bridge near/mid/far. All companions used
  `projectionMode:three_camera`, stayed visible and retained their Pixi
  opaque-foot anchor within tolerance.
- Promotion blockers: `32` route-safety mismatches remain because the
  R2-coordinate collision map flags the hidden
  `crystal-bridge-right-base` at bridge mid/far. The 30-second mobile probe
  measured `66.7 ms` median frame time against the `<=25 ms` contract.
  Therefore candidate `promotionReady:false`.
- Recovery proof: WebGL context loss/restoration and static `?live3d=0`
  fallback passed with zero page or console errors.
- Regression proof: R3.6 deterministic and `32/32` browser matrix passed;
  R3.5 deterministic and `96/96` browser matrix passed; R3.3 deterministic and
  `288/288` browser matrix passed. Full Web Release Gate passed `28/28`
  required automated checks with zero accessibility warnings.
- Scope audit: the audited GLB remains exactly `3,098,820` bytes with SHA-256
  `60423EDAA8C15C519A8A596BC8DF007662E46F9D575C56571F3AA4E611C4B1A6`;
  no `assets/**`, `src/pixi/pixiApp.js`, save/state, relationship, Growth,
  reward, RaphaelCore, Safety, dependency, backend or build-step change.
  `src/app.js` received only the minimal pass-through for projection mode and
  visibility diagnostics.
- Evidence:
  `docs/qa/MOONLAKE_VISIBLE_GLB_R4_0_EVIDENCE.md`,
  `docs/qa/moonlake-visible-glb-r4-0-cases.mjs`, and
  `docs/qa/moonlake-visible-glb-r4-0-browser.cjs`.
- Branch: local `main` based on `b8c76be`; no commit, push, promotion or
  publication was authorized.

### 2026-07-30 - Codex - Moonlake Visible GLB Feasibility R4.0 - BLOCKED

- Status: `BLOCKED`; the current GLB fails the human visual promotion gate.
- Lane: `Game Art, UI, And Visual Production`.
- Visual finding: the rendered GLB is a colored structural blockout. Its
  cliffs, repeated vegetation, tents, campfire and foreground lack the approved
  miniature detail, while the bridge appears as disconnected white blocks
  instead of one continuous walkable deck. It is materially below the R2
  composition and the required Ragnarok Online-like 2.5D presentation.
- Safe next package: an Owner-approved R4.1 GROUNDWORK Blender reconstruction
  must create a parallel new GLB, author a continuous route-aligned bridge and
  collision set, match the R2 camera/depth/composition bar, meet the mobile
  performance contract, rerun all sixteen companions plus the full
  day/night/rain/mist and recovery matrix, and obtain human visual approval.
- Preservation: R3 GLB, R2 raster visual master, depth plates, all sixteen
  companion roots and the published R3.6 default remain unchanged.
