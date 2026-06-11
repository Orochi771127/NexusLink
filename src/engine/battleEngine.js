import { clamp } from "../utils/clamp.js";
import { getEnemyById } from "../data/enemyRegistry.js";

const RESONANCE_COST = 3;
const MAX_BATTLE_ENERGY = 5;

// 各情感徽章的共鳴技風味（companionRegistry.emotionalEmblem.zh 對應）。
const RESONANCE_FLAVOR = {
  "憶・幽影": { name: "幽影回想", line: "記憶的影子在月光裡放大，化成一道安靜而銳利的弧光。" },
  "勇・炎志": { name: "炎志爆燃", line: "尾焰轟地竄起，把勇氣燒成一道直線的火光。" },
  "智・玄水": { name: "玄水洞察", line: "水紋展開成一面鏡子，看穿了對方的破綻。" },
  "和・青木": { name: "青木共生", line: "嫩葉的微光纏上對方，也替你們補回一口氣。" },
  "信・金剛": { name: "金剛雷誓", line: "雷光凝成不動的誓言，正面劈了下去。" }
};

export function createBattleSession({ companion, enemyId, nodeId, state, now = Date.now() }) {
  const enemy = getEnemyById(enemyId);
  const radar = companion?.radar || { power: 50, defense: 50 };
  const maxHp = Math.round(30 + radar.defense * 0.4 + (state?.bond || 0) * 0.2);

  return {
    nodeId: nodeId || null,
    companionId: companion?.id || "greyshade-cat",
    companionName: companion?.name || "夥伴",
    emblem: companion?.emotionalEmblem?.zh || "憶・幽影",
    basePower: Math.round(6 + radar.power * 0.08),
    bond: state?.bond || 0,
    enemyId: enemy.id,
    enemyName: enemy.name.zh,
    enemyAttack: enemy.attack,
    enemyGuardChance: enemy.guardChance,
    playerHp: maxHp,
    playerMaxHp: maxHp,
    playerEnergy: 2,
    enemyHp: enemy.maxHp,
    enemyMaxHp: enemy.maxHp,
    playerGuarding: false,
    enemyGuarding: false,
    turn: "player",
    startedAt: now,
    log: [{ kind: "system", text: `${enemy.name.zh}擋住了去路。${enemy.flavor}` }]
  };
}

export function getResonanceSkillName(emblem) {
  return RESONANCE_FLAVOR[emblem]?.name || "情感共鳴";
}

export function canUseSkill(session, skillId) {
  if (!session || session.turn !== "player") return false;
  if (skillId === "resonance") return session.playerEnergy >= RESONANCE_COST;
  return true;
}

export function applyPlayerSkill(session, skillId, rng = Math.random) {
  const next = { ...session, log: [...session.log], playerGuarding: false };

  if (skillId === "guard") {
    next.playerGuarding = true;
    next.playerEnergy = clamp(next.playerEnergy + 1, 0, MAX_BATTLE_ENERGY);
    next.log.push({ kind: "player", text: `${next.companionName}收緊身形，凝神防禦。（共鳴 +1）` });
  } else if (skillId === "resonance" && next.playerEnergy >= RESONANCE_COST) {
    next.playerEnergy -= RESONANCE_COST;
    const flavor = RESONANCE_FLAVOR[next.emblem] || { name: "情感共鳴", line: "你們之間的羈絆化成了一道光。" };
    const damage = Math.round(next.basePower * 1.6 + next.bond * 0.25 + rng() * 4);
    const dealt = applyDamageToEnemy(next, damage);
    next.log.push({ kind: "player", text: `${flavor.name}！${flavor.line}（造成 ${dealt} 傷害）` });
  } else {
    const damage = Math.round(next.basePower + rng() * 4);
    const dealt = applyDamageToEnemy(next, damage);
    next.playerEnergy = clamp(next.playerEnergy + 1, 0, MAX_BATTLE_ENERGY);
    next.log.push({ kind: "player", text: `${next.companionName}撲出直覺一擊。（造成 ${dealt} 傷害，共鳴 +1）` });
  }

  next.turn = next.enemyHp <= 0 ? "ended" : "enemy";
  return next;
}

export function applyEnemyTurn(session, rng = Math.random) {
  const next = { ...session, log: [...session.log], enemyGuarding: false };
  if (next.turn !== "enemy") return next;

  if (rng() < next.enemyGuardChance) {
    next.enemyGuarding = true;
    next.log.push({ kind: "enemy", text: `${next.enemyName}縮起身體，警戒地觀察著。` });
  } else {
    let damage = Math.round(next.enemyAttack + rng() * 3);
    if (next.playerGuarding) {
      damage = Math.max(1, Math.round(damage / 2));
      next.log.push({ kind: "enemy", text: `${next.enemyName}的攻擊被防禦削弱了。（受到 ${damage} 傷害）` });
    } else {
      next.log.push({ kind: "enemy", text: `${next.enemyName}發出尖嘯，撞了過來。（受到 ${damage} 傷害）` });
    }
    next.playerHp = clamp(next.playerHp - damage, 0, next.playerMaxHp);
  }

  next.turn = next.playerHp <= 0 ? "ended" : "player";
  return next;
}

function applyDamageToEnemy(session, rawDamage) {
  let damage = Math.max(1, Math.round(rawDamage));
  if (session.enemyGuarding) {
    damage = Math.max(1, Math.round(damage / 2));
  }
  session.enemyHp = clamp(session.enemyHp - damage, 0, session.enemyMaxHp);
  return damage;
}

export function isBattleOver(session) {
  if (!session) return { over: true, result: "lose" };
  if (session.enemyHp <= 0) return { over: true, result: "win" };
  if (session.playerHp <= 0) return { over: true, result: "lose" };
  return { over: false, result: null };
}

/**
 * 戰鬥結果回饋到關係狀態：勝不驕、敗不罰。
 */
export function summarizeBattleOutcome(result, state, now = Date.now()) {
  const record = state.battleRecord || { wins: 0, losses: 0, retreats: 0, lastResult: null, lastBattleAt: null };
  const statePatch = {
    battleRecord: {
      ...record,
      lastResult: result,
      lastBattleAt: now
    }
  };

  if (result === "win") {
    statePatch.battleRecord.wins = (record.wins || 0) + 1;
    statePatch.bond = clamp((state.bond || 0) + 3, 0, 100);
    statePatch.trust = clamp((state.trust || 0) + 1, 0, 100);
    statePatch.mood = "happy";
    statePatch.energy = clamp((state.energy || 0) - 2, 0, 10);
    return { statePatch, message: "你們一起守住了這片棲地。夥伴靠過來，輕輕碰了碰你。" };
  }

  if (result === "lose") {
    statePatch.battleRecord.losses = (record.losses || 0) + 1;
    statePatch.bond = clamp((state.bond || 0) + 1, 0, 100);
    statePatch.mood = "tired";
    statePatch.energy = clamp((state.energy || 0) - 3, 0, 10);
    return { statePatch, message: "你們退回了營地。沒有誰責怪誰——一起喘口氣，下次再來。" };
  }

  statePatch.battleRecord.retreats = (record.retreats || 0) + 1;
  statePatch.mood = "calm";
  statePatch.energy = clamp((state.energy || 0) - 1, 0, 10);
  return { statePatch, message: "你們選擇先撤退。懂得離開，也是一種照顧彼此的方式。" };
}
