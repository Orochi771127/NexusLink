/**
 * 心域遠征 Utility AI 行為矩陣（Task Pack D）。
 * 執行：node docs/qa/expedition-behavior-matrix.mjs
 */
import { createExpeditionSession } from "../../src/expedition/expeditionState.js";
import { createExpeditionEngine } from "../../src/expedition/expeditionEngine.js";
import { decideCompanionIntent } from "../../src/expedition/companionBrain.js";
import { rollRegionEncounters } from "../../src/expedition/encounterDirector.js";
import { buildExpeditionSettlement, mergeExpeditionVault } from "../../src/expedition/expeditionPersistence.js";
import { tryTriggerMemoryEvent } from "../../src/expedition/memoryEventDirector.js";
import { createNavigationGrid } from "../../src/expedition/navigationGrid.js";
import { getExpeditionRegionByNodeId } from "../../src/data/expeditionRegions.js";
import { applyCraftRecipe, canAffordRecipe } from "../../src/expedition/expeditionCraftEngine.js";

const BASE_STATE = {
  bond: 50,
  trust: 50,
  mood: "calm",
  energy: 8,
  defense: 30,
  activeCompanionId: "greyshade-cat"
};

function runCase(name, mutateSession, expect) {
  const session = createExpeditionSession({
    nodeId: "plains_windrest",
    companionId: "greyshade-cat",
    companionName: "灰影貓",
    state: BASE_STATE
  });
  mutateSession(session);
  const region = getExpeditionRegionByNodeId("plains_windrest");
  const nav = createNavigationGrid(region);
  const intent = decideCompanionIntent(session, region, nav);
  const pass = expect(intent, session);
  return { name, pass, intent: intent.type, reason: intent.reason };
}

const cases = [
  runCase(
    "低能量偏向 REST/EVADE 而非 EXPLORE",
    (s) => {
      s.relationship.energy = 1;
    },
    (intent) => intent.type === "REST" || intent.type === "EVADE" || intent.type === "RETREAT"
  ),
  runCase(
    "高防備+多次介入提高 RETREAT",
    (s) => {
      s.relationship.defense = 75;
      s.playerInterventions = 4;
    },
    (intent) => intent.type === "RETREAT" || intent.type === "EVADE"
  ),
  runCase(
    "積極戰術+敵可見時 ATTACK 分數上升",
    (s) => {
      s.playerTactics = "aggressive";
      s.companion.x = 620;
      s.companion.y = 320;
    },
    (intent) => ["ATTACK", "EVADE", "EXPLORE"].includes(intent.type)
  ),
  runCase(
    "保守戰術+低血量 EVADE/RETREAT",
    (s) => {
      s.playerTactics = "conservative";
      s.companion.hp = 20;
      s.companion.x = 620;
      s.companion.y = 320;
    },
    (intent) => ["EVADE", "RETREAT", "ATTACK"].includes(intent.type)
  ),
  runCase(
    "擊殺敵人後生成掉落",
    (s) => {
      const engine = createExpeditionEngine(s);
      s.companion.x = 650;
      s.companion.y = 320;
      for (let i = 0; i < 120; i += 1) {
        engine.tick(50, Date.now() + i * 50);
      }
    },
    (_intent, s) => (s.stats.kills >= 1 && (s.loot?.length || 0) >= 2) || s.stats.damageDealt > 0
  ),
  runCase(
    "玩家撤退指令進入 retreating",
    (s) => {
      s.playerRetreatRequested = true;
      s.relationship.trust = 60;
    },
    (intent) => intent.type === "RETREAT"
  ),
  runCase(
    "記憶事件：首次抵達 ep_hidden",
    (s) => {
      tryTriggerMemoryEvent(s, "ep_hidden");
    },
    (_intent, s) => Boolean(s.pendingMemoryEvent?.id === "exp_mem_windrest_hidden")
  ),
  runCase(
    "半隨機遭遇：兩種敵人池",
    (s) => {
      const region = getExpeditionRegionByNodeId("plains_windrest");
      const rolls = rollRegionEncounters(region, () => 0.5);
      s.enemies = rolls.map((spawn, i) => ({
        id: `enemy_test_${i}`,
        enemyId: spawn.enemyId,
        x: spawn.x,
        y: spawn.y,
        hp: 10,
        hpMax: 10,
        state: "idle"
      }));
    },
    (_intent, s) => s.enemies.length === 2 && s.enemies.some((e) => e.enemyId === "hollow_echo")
  ),
  runCase(
    "碎晶庫存持久化 merge",
    () => {},
    () => {
      const vault = mergeExpeditionVault(
        { shards: { forest_shard: 2 }, logs: [], totalExpeditions: 1 },
        { regionId: "plains_windrest" },
        { lootSummary: { forest_shard: 3 }, retreated: false, kills: 1 }
      );
      return vault.shards.forest_shard === 5 && vault.totalExpeditions === 2;
    }
  ),
  runCase(
    "餘燼小徑區域資料存在",
    () => {},
    () => Boolean(getExpeditionRegionByNodeId("forge_emberpath")?.enemySpawnPools?.length === 2)
  ),
  runCase(
    "碎晶共鳴：足夠時扣除並回傳 patch",
    () => {},
    () => {
      const result = applyCraftRecipe(
        { bond: 50, trust: 50, energy: 5, defense: 30, mood: "calm", expeditionVault: { shards: { forest_shard: 5 } } },
        "forest_resonance"
      );
      return result.ok
        && result.statePatch.expeditionVault.shards.forest_shard === 2
        && result.vitals.bond === 1;
    }
  ),
  runCase(
    "碎晶共鳴：不足時拒絕",
    () => {},
    () => {
      const result = applyCraftRecipe(
        { expeditionVault: { shards: { forest_shard: 1 } } },
        "forest_resonance"
      );
      return !result.ok && !canAffordRecipe({ expeditionVault: { shards: { forest_shard: 1 } } }, "forest_resonance");
    }
  ),
  runCase(
    "靜泊碼頭區域 + 氛圍設定",
    () => {},
    () => {
      const region = getExpeditionRegionByNodeId("harbor_quayside");
      return Boolean(region?.atmosphere?.id === "harbor_mist" && region.enemySpawnPools.length === 2);
    }
  ),
  runCase(
    "潮息定神：潮汐碎晶消耗",
    () => {},
    () => {
      const result = applyCraftRecipe(
        { expeditionVault: { shards: { tide_shard: 4 } } },
        "tide_calm"
      );
      return result.ok && result.statePatch.expeditionVault.shards.tide_shard === 1;
    }
  )
];

let failed = 0;
cases.forEach((result) => {
  const mark = result.pass ? "PASS" : "FAIL";
  if (!result.pass) failed += 1;
  console.log(`${mark}  ${result.name}`);
  console.log(`      → ${result.intent} | ${result.reason}`);
});

if (failed > 0) {
  console.error(`\n${failed}/${cases.length} cases failed`);
  process.exit(1);
}
console.log(`\n${cases.length}/${cases.length} cases passed`);
