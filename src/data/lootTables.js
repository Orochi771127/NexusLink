/**
 * 遠征微光痕跡（依區域元素）。
 * Pack D：玩家語意是「同行微光」，不是刷怪戰利品；id 維持 *_shard 以相容存檔／配方。
 */
export const SHARD_TYPES = Object.freeze({
  forest_shard: Object.freeze({
    id: "forest_shard",
    label: { zh: "森息微光", en: "Verdant Mote" },
    element: "wood",
    color: 0x7ecf8a
  }),
  tide_shard: Object.freeze({
    id: "tide_shard",
    label: { zh: "潮汐微光", en: "Tide Mote" },
    element: "water",
    color: 0x6ecfd4
  }),
  ember_shard: Object.freeze({
    id: "ember_shard",
    label: { zh: "餘燼微光", en: "Ember Mote" },
    element: "fire",
    color: 0xe8925a
  })
});

export function getShardType(shardId) {
  return SHARD_TYPES[shardId] || SHARD_TYPES.forest_shard;
}

/** 區域 → 主要掉落碎晶 id。 */
export const REGION_LOOT_TABLE = Object.freeze({
  plains_windrest: Object.freeze({
    primaryShard: "forest_shard",
    dropCount: { min: 2, max: 4 }
  }),
  forge_emberpath: Object.freeze({
    primaryShard: "ember_shard",
    dropCount: { min: 2, max: 5 }
  }),
  harbor_quayside: Object.freeze({
    primaryShard: "tide_shard",
    dropCount: { min: 2, max: 4 }
  })
});

export function getRegionLootTable(regionId) {
  return REGION_LOOT_TABLE[regionId] || REGION_LOOT_TABLE.plains_windrest;
}
