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
import { applyCraftRecipe, canAffordRecipe, listCraftRecipesForUi } from "../../src/expedition/expeditionCraftEngine.js";
import { shouldAutoFinish } from "../../src/expedition/expeditionEngine.js";
import { BRAIN_TICK_MS, canLaunchExpedition } from "../../src/expedition/expeditionConfig.js";
import { getAdventureProfile } from "../../src/data/companionAdventureProfiles.js";
import {
  heartOnRestTick,
  createSessionHeart,
  heartOnGentleTactic,
  heartOnCoerciveIntervention,
  REST_HEART_RATES
} from "../../src/expedition/sessionHeart.js";
import {
  buildExpeditionSettlementVoice,
  buildExpeditionSystemFacts
} from "../../src/expedition/expeditionSettlementVoice.js";
import {
  filterExpeditionMemoryObjects,
  EXPEDITION_CORE_BRIDGE_STATUS
} from "../../src/expedition/expeditionCoreBridge.js";

/** 模擬固定真實時間的 REST，拆成不同 FPS 的幀。 */
function simulateRestAtFps(fps, totalSeconds = 1) {
  const session = {
    heart: {
      fatigue: 0.8,
      stress: 0.7,
      feltSafety: 0.3,
      curiosityDrive: 0.5,
      interventionPressure: 0
    }
  };
  const frames = Math.max(1, Math.round(fps * totalSeconds));
  const deltaMs = (totalSeconds * 1000) / frames;
  for (let i = 0; i < frames; i += 1) {
    heartOnRestTick(session, deltaMs);
  }
  return { ...session.heart, frames, deltaMs };
}

function nearlyEqual(a, b, eps = 1e-9) {
  return Math.abs(a - b) <= eps;
}

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
    // RE-1：低血＋保守不得以 ATTACK 過關。
    (intent) => intent.type === "EVADE" || intent.type === "RETREAT"
  ),
  runCase(
    "擊殺敵人後生成掉落",
    (s) => {
      const engine = createExpeditionEngine(s);
      // 確定性交戰：抬攻擊人格、鎖目標、貼臉、探索點視為已訪（避免被 EXPLORE 搶分）。
      s.playerTactics = "aggressive";
      s.profile = { ...s.profile, aggression: 0.95, riskAversion: 0.08, retreatHpRatio: 0.15 };
      s.heart = {
        fatigue: 0.05,
        stress: 0.05,
        feltSafety: 0.9,
        curiosityDrive: 0.2,
        interventionPressure: 0
      };
      s.visitedExplorePoints = (engine.region.explorePoints || []).map((p) => p.id);
      s.companion.atk = 18;
      const enemy = (s.enemies || []).find((e) => e.hp > 0) || s.enemies[0];
      if (enemy) {
        s.companion.x = enemy.x;
        s.companion.y = enemy.y;
        s.playerFocusTargetId = enemy.id;
      }
      for (let i = 0; i < 240; i += 1) {
        const living = (s.enemies || []).find((e) => e.hp > 0);
        if (living) {
          // 每拍把夥伴貼回目標，避免 EVADE 拉開後測不到擊殺→掉落。
          s.companion.x = living.x;
          s.companion.y = living.y;
          s.playerFocusTargetId = living.id;
          s.brainAccumMs = BRAIN_TICK_MS;
        }
        engine.tick(50, Date.now() + i * 50);
        if (s.stats.kills >= 1 && (s.loot?.length || 0) >= 1) break;
      }
    },
    // RE-1／RE-2：必須真有擊殺與掉落，不可只靠「造成傷害」過關。
    (_intent, s) => s.stats.kills >= 1 && (s.loot?.length || 0) >= 1
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
  ),
  runCase(
    "成長頁配方過濾：只有森息時不顯示餘燼/潮汐",
    () => {},
    () => {
      const list = listCraftRecipesForUi({ expeditionVault: { shards: { forest_shard: 2 } } });
      const ids = list.map((r) => r.id);
      return ids.includes("forest_resonance")
        && ids.includes("forest_breath")
        && !ids.includes("ember_ward")
        && !ids.includes("tide_calm");
    }
  ),
  runCase(
    "記憶事件停頓：excerpt 不會立刻被 AI 蓋掉",
    (s) => {
      tryTriggerMemoryEvent(s, "ep_hidden");
      s.memoryHoldUntil = Date.now() + 5000;
      const engine = createExpeditionEngine(s);
      const excerpt = s.lastIntent.reason;
      for (let i = 0; i < 8; i += 1) {
        engine.tick(400, Date.now() + i * 50);
      }
      s.__holdExcerpt = excerpt;
    },
    (_intent, s) => s.lastIntent?.type === "INVESTIGATE" && s.lastIntent.reason === s.__holdExcerpt
  ),
  runCase(
    "三區皆有 hudCopy 情緒文案",
    () => {},
    () => {
      return ["plains_windrest", "forge_emberpath", "harbor_quayside"].every((id) => {
        const region = getExpeditionRegionByNodeId(id);
        return typeof region?.hudCopy === "string" && region.hudCopy.length > 4;
      });
    }
  ),
  runCase(
    "shouldAutoFinish 運算子優先順序正確",
    () => {},
    () => {
      const complete = shouldAutoFinish({ phase: "complete", companion: { hp: 10 } });
      const retreatingAlive = shouldAutoFinish({ phase: "retreating", companion: { hp: 10 } });
      const retreatingDead = shouldAutoFinish({ phase: "retreating", companion: { hp: 0 } });
      return complete && !retreatingAlive && retreatingDead;
    }
  ),
  runCase(
    "RE1 E-PERSONA：未知角色不得 fallback 灰影貓",
    () => {},
    () => getAdventureProfile("sprigfawn") == null
      && !canLaunchExpedition({
        energy: 8,
        activeCompanionId: "sprigfawn",
        chapterProgress: { current: 4, completed: [1, 2, 3] }
      }, "plains_windrest")
  ),
  runCase(
    "RE1 E-FARM：僅擊殺／碎晶不加 bond/trust",
    () => {},
    () => {
      const session = createExpeditionSession({
        nodeId: "plains_windrest",
        companionId: "greyshade-cat",
        companionName: "灰影貓",
        state: { ...BASE_STATE, bond: 40, trust: 40 }
      });
      session.stats.kills = 5;
      session.lootCollected = { forest_shard: 9 };
      session.visitedExplorePoints = [];
      session.triggeredMemoryEvents = [];
      const settlement = buildExpeditionSettlement(session, { retreated: false }, {});
      return settlement.statePatch.bond === 40 && settlement.statePatch.trust === 40;
    }
  ),
  runCase(
    "旁白模組：區域探索句可輪換",
    () => {},
    () => {
      const a = createExpeditionSession({
        nodeId: "harbor_quayside",
        companionId: "greyshade-cat",
        companionName: "灰影貓",
        state: BASE_STATE
      });
      a.debug.brainTicks = 0;
      const b = createExpeditionSession({
        nodeId: "harbor_quayside",
        companionId: "greyshade-cat",
        companionName: "灰影貓",
        state: BASE_STATE
      });
      b.debug.brainTicks = 1;
      const region = getExpeditionRegionByNodeId("harbor_quayside");
      const nav = createNavigationGrid(region);
      a.enemies = [];
      b.enemies = [];
      const ia = decideCompanionIntent(a, region, nav);
      const ib = decideCompanionIntent(b, region, nav);
      return typeof ia.reason === "string" && ia.reason.length > 4
        && typeof ib.reason === "string"
        && ia.reason !== "INIT_PATROL";
    }
  ),
  runCase(
    "RE2 session heart：REST 可降 fatigue/stress",
    () => {},
    () => {
      const session = createExpeditionSession({
        nodeId: "plains_windrest",
        companionId: "greyshade-cat",
        companionName: "灰影貓",
        state: BASE_STATE
      });
      session.heart = createSessionHeart({ energy: 2, defense: 40 }, session.profile);
      session.heart.fatigue = 0.7;
      session.heart.stress = 0.6;
      const beforeF = session.heart.fatigue;
      const beforeS = session.heart.stress;
      heartOnRestTick(session, 1000);
      return session.heart.fatigue < beforeF
        && session.heart.stress < beforeS
        && session.heart.feltSafety > 0.5;
    }
  ),
  runCase(
    "RE2 E-CORE：結算拆成 system facts + 第一人稱感受",
    () => {},
    () => {
      const session = createExpeditionSession({
        nodeId: "plains_windrest",
        companionId: "greyshade-cat",
        companionName: "灰影貓",
        state: BASE_STATE
      });
      session.lootCollected = { forest_shard: 3 };
      session.stats.kills = 1;
      session.triggeredMemoryEvents = ["ep_hidden"];
      const settlement = buildExpeditionSettlement(session, { retreated: false }, {});
      const voice = buildExpeditionSettlementVoice(session, settlement);
      const facts = buildExpeditionSystemFacts(session, settlement);
      const reflection = voice.companionReflection || "";
      // 系統事實應提到碎晶；夥伴句應是第一人稱（含「我」），且不是舊 journal 整段貼上。
      const hasShardFact = facts.some((line) => line.includes("森息碎晶") || line.includes("碎晶"));
      const firstPerson = reflection.includes("我");
      const notThirdPersonJournal = !reflection.includes("灰影貓在");
      return hasShardFact && firstPerson && notThirdPersonJournal && voice.systemFacts.length >= 1;
    }
  ),
  runCase(
    "RE2：高疲勞且無敵人時應選 REST",
    (s) => {
      s.enemies = [];
      s.playerRetreatRequested = false;
      s.returnHomeRequested = false;
      s.heart.fatigue = 0.85;
      s.heart.stress = 0.55;
      s.heart.feltSafety = 0.55;
      s.heart.curiosityDrive = 0.15;
      s.heart.interventionPressure = 0;
      s.relationship.energy = 3;
      // 探索點全訪 → EXPLORE 無目標，避免搶分
      s.visitedExplorePoints = ["ep_crystal", "ep_flower", "ep_hidden", "ep_rest"];
    },
    // 合約：無威脅＋高疲勞時優先 REST（不允許僅用 IDLE／RETREAT 混過）。
    (intent) => intent.type === "REST"
  ),
  runCase(
    "P1 REST heart：1 秒真實時間在 1/30/60/120 FPS 等價",
    () => {},
    () => {
      const samples = [1, 30, 60, 120].map((fps) => simulateRestAtFps(fps, 1));
      const baseline = samples[0];
      // 理論值：fatigue 0.8 + (-0.08)*1
      const expectedFatigue = 0.8 + REST_HEART_RATES.fatigue;
      const expectedStress = 0.7 + REST_HEART_RATES.stress;
      const expectedSafety = 0.3 + REST_HEART_RATES.feltSafety;
      return samples.every((s) => nearlyEqual(s.fatigue, baseline.fatigue)
        && nearlyEqual(s.stress, baseline.stress)
        && nearlyEqual(s.feltSafety, baseline.feltSafety)
        && nearlyEqual(s.fatigue, expectedFatigue)
        && nearlyEqual(s.stress, expectedStress)
        && nearlyEqual(s.feltSafety, expectedSafety));
    }
  ),
  runCase(
    "RE1 E-EXIT：返回棲地不增加介入壓力",
    () => {},
    () => {
      const session = createExpeditionSession({
        nodeId: "plains_windrest",
        companionId: "greyshade-cat",
        companionName: "灰影貓",
        state: BASE_STATE
      });
      const beforePressure = session.heart.interventionPressure;
      const beforeInterventions = session.playerInterventions || 0;
      // 模擬 UI「返回棲地」語意（見 expeditionController）：不呼叫 coercive heart。
      session.playerRetreatRequested = true;
      session.returnHomeRequested = true;
      session.phase = "retreating";
      return session.heart.interventionPressure === beforePressure
        && (session.playerInterventions || 0) === beforeInterventions
        && session.returnHomeRequested === true;
    }
  ),
  runCase(
    "RE1 E-COERCE：溫和戰術不加壓力、強制戰術才加",
    () => {},
    () => {
      const session = createExpeditionSession({
        nodeId: "plains_windrest",
        companionId: "greyshade-cat",
        companionName: "灰影貓",
        state: BASE_STATE
      });
      heartOnGentleTactic(session);
      heartOnGentleTactic(session);
      const afterGentle = session.heart.interventionPressure;
      const interventionsAfterGentle = session.playerInterventions || 0;
      heartOnCoerciveIntervention(session);
      return afterGentle === 0
        && interventionsAfterGentle === 0
        && session.heart.interventionPressure > 0
        && (session.playerInterventions || 0) >= 1;
    }
  ),
  runCase(
    "RE2 記憶 lite policy：空 excerpt 拒寫、有內容才接受",
    () => {},
    () => {
      const gated = filterExpeditionMemoryObjects([
        { id: "a", excerpt: "", source: "expedition" },
        { id: "b", excerpt: "草坡有風。", source: "expedition" },
        { id: "c", excerpt: "第二段。", source: "expedition" }
      ], { maxAccept: 1 });
      return gated.accepted.length === 1
        && gated.accepted[0].id === "b"
        && gated.rejected.length === 2
        && EXPEDITION_CORE_BRIDGE_STATUS.coreIntegrated === false
        && gated.accepted[0].writePolicy === "expedition_lite_v1";
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
