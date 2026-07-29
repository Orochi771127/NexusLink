# 月湖三模式關卡結構 R1

Status: Implemented vertical-slice structure
Date: 2026-07-29

## 1. 玩家路徑

月湖營地保留為首次安全抵達，不是 Orbit 關卡。玩家完成這一拍後，月湖地圖
五個路徑點改為心核迴旋區域；點擊只開該地點的五關面板，不直接發放一般探索
羈絆、信任、記憶或遭遇。

解鎖鏈：

`月湖營地 → 星林＋霧潮 → 湖心 → 晶岩 → 裂隙`

星林與霧潮必須各完成第五關才開湖心。每區內部依 1→5 順序開放，已完成關卡
永久可重玩。

## 2. 三模式分工

| 模式 | 入口 | 自然難度 | 重玩規則 |
|---|---|---|---|
| 心核迴旋 | 月湖五個地圖點 | 五區各五關，從軌跡基礎走到綜合觀測 | 每關首通有微光／Growth；重玩零永久獎勵 |
| 裂隙對峙 | Explore 獨立小入口 | CH1–7 依序為聽見雜訊、交疊回聲、邊界風壓、記憶回潮、裂隙合奏 | 每個 canonical scenario 首次穩住／回收有結算；重玩零關係／記憶／Growth／章節獎勵 |
| 心域遠征 | Explore 獨立小入口 | 現行三區為近岸、轉折、深徑；遠回／邊界只保留未來資料 | 現有局內採集與重複結算完全保留 |

三種模式都不顯示 Easy／Normal／Hard，也沒有獎勵倍率。難度來自目標組合、
場地、流向與判讀節奏。

## 3. 持久化

沿用 `nexusLinkR2State:v1`，不新增 localStorage key：

```js
activityProgress: {
  version: 1,
  orbit: { clearedStageIds: [] },
  standoff: { clearedScenarioIds: [] },
  expedition: { clearedRouteIds: [] }
}
```

解鎖一律由 IDs 推導。Orbit 首通進度與同一筆 shard／Growth settlement 原子
寫入；Standoff 只有首次 canonical clear 可寫關係、記憶、Growth 與章節推進。

## 4. 安全邊界

- 對峙的 D2 safety、拒絕、撤退與必達修復優先於張力 profile。
- 撤退不是失敗，也不會鎖關。
- 安全港不產生 Growth evidence。
- 不新增紅點、倒數、每日刷新、掉寶倍率或戰力隊伍。
- Expedition 仍是 `Prototype + partial Core bridge`，`coreIntegrated:false`
  不因本結構變更而升格。
