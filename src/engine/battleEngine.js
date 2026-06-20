import { clamp } from "../utils/clamp.js";
import { getEnemyById } from "../data/enemyRegistry.js";

// ======================================================================
// 情緒對峙引擎（Emotional Standoff）
//
// 這不是消滅敵人的戰鬥。對峙的目標是：
//   穩定心核、建立邊界、回收記憶、降低雜訊——保護夥伴，但不支配牠。
//
// 模型：
//   noise      雜訊濃度（場域的不安定）：歸零 = 場域穩定（stabilized）
//   stability  心核穩定度：歸零 = 過載但安全（overwhelmed_but_safe，夥伴帶你離開）
//   sync       同步：行動間累積的共鳴節奏（脈衝的資源）
//   fatigue    對峙疲勞：行動的真實成本，會回寫到棲地的 energy / touchFatigue
//   boundary   邊界層數：減緩雜訊湧動，但需要持續維護（每次湧動後衰減）
//   shards     記憶微光：共鳴回收的記憶，集滿可提前溫柔收束（recovered）
//
// 四結局：stabilized / recovered / retreated / overwhelmed_but_safe
// 沒有 win/lose。撤退是被尊重的選項。
// 純函數層：零 DOM、零 store、rng 可注入。
// ======================================================================

export const STANDOFF_ACTIONS = ["resonance", "barrier", "pulse", "retreat"];
export const SHARD_GOAL = 3;
export const MAX_SYNC = 5;
export const MAX_FATIGUE = 6;
export const MAX_BOUNDARY = 3;
const PULSE_SYNC_COST = 2;
const BOUNDARY_DAMPING_PER_LAYER = 0.25;

// 各情感徽章的共鳴風味（companionRegistry.emotionalEmblem.zh 對應）。
const RESONANCE_FLAVOR = {
  "憶・幽影": { name: "幽影共鳴", line: "記憶的影子在月光裡舒展，雜訊安靜了一圈。" },
  "勇・炎志": { name: "炎志共鳴", line: "尾焰的暖光推開雜訊，像替你劃出一條回家的路。" },
  "智・玄水": { name: "玄水共鳴", line: "水紋接住了雜訊的稜角，把它磨成圓的。" },
  "和・青木": { name: "青木共鳴", line: "嫩葉的微光纏繞過去，雜訊裡長出了一點安靜。" },
  "信・金剛": { name: "金剛共鳴", line: "雷光凝成穩定的節拍，蓋過了雜訊的尖嘯。" }
};

export function getResonanceSkillName(emblem) {
  return RESONANCE_FLAVOR[emblem]?.name || "情感共鳴";
}

// 裂隙心相：每種裂隙情緒 ↔ 一個「安撫」元素；以五行相剋定「相沖」元素（輕微減益）。
// 這讓「帶哪一隻元素守護進裂隙」有戰術意義。中性元素夥伴永遠 neutral、無減益。
const RIFT_EMOTION_PROFILE = {
  sadness: {
    attuned: "fire", dissonant: "water", labelZh: "低鳴",
    attuneLine: (name) => `${name}的火，正好能溫暖這片低鳴——共鳴會特別容易。`
  },
  anger: {
    attuned: "water", dissonant: "earth", labelZh: "沉怒",
    attuneLine: (name) => `${name}的水，把這團沉怒磨成了圓的——共鳴會特別容易。`
  },
  anxiety: {
    attuned: "earth", dissonant: "wood", labelZh: "迷茫",
    attuneLine: (name) => `${name}踩穩了地基，迷茫的影子慢了下來——共鳴會特別容易。`
  },
  fatigue: {
    attuned: "wood", dissonant: "metal", labelZh: "倦怠",
    attuneLine: (name) => `${name}的綠意裡長出新的氣力，倦怠被輕輕接住——共鳴會特別容易。`
  },
  loneliness: {
    attuned: "metal", dissonant: "fire", labelZh: "孤鳴",
    attuneLine: (name) => `${name}的晶核回應了這聲孤鳴，像終於有人聽見——共鳴會特別容易。`
  }
};

// 夥伴元素 vs 裂隙情緒的契合度（attuned 1.25 / dissonant 0.85 / neutral 1）。
export function getRiftAffinity(companion, enemy) {
  const emotion = enemy?.emotion || null;
  const profile = emotion ? RIFT_EMOTION_PROFILE[emotion] : null;
  const element = companion?.element || "neutral";
  const labelZh = profile?.labelZh || enemy?.emotionLabelZh || null;
  if (!profile) return { emotion, tier: "neutral", multiplier: 1, labelZh, attuneLine: null };

  let tier = "neutral";
  if (element === profile.attuned) tier = "attuned";
  else if (element === profile.dissonant) tier = "dissonant";
  const multiplier = tier === "attuned" ? 1.25 : tier === "dissonant" ? 0.85 : 1;
  return {
    emotion,
    tier,
    multiplier,
    labelZh,
    attuneLine: tier === "attuned" ? profile.attuneLine(companion?.name || "夥伴") : null
  };
}

// 夥伴 radar 區分三個行動的強弱（偏離 50 才有小幅增減，全部限幅、不致任何夥伴無用）。
export function getRadarModifiers(radar = {}) {
  const dev = (value) => (Number(value) || 50) - 50;
  return {
    resonanceBonus: 1 + clamp(dev(radar.healing) * 0.004, -0.12, 0.16), // 治癒高 → 共鳴更安撫
    barrierStability: Math.round(clamp(dev(radar.defense) * 0.08, -2, 3)), // 防禦高 → 邊界更穩
    barrierBoundaryBonus: (Number(radar.defense) || 50) >= 80 ? 1 : 0, // 高防禦 → 邊界多疊一層
    pulseBonus: 1 + clamp(dev(radar.power) * 0.004, -0.12, 0.18) // 力量高 → 脈衝更強
  };
}

export function createStandoffSession({ companion, enemyId, nodeId, state, now = Date.now() }) {
  const enemy = getEnemyById(enemyId);
  const radar = companion?.radar || { power: 50, emotion: 50 };
  const stabilityMax = Math.round(22 + (radar.emotion || 50) * 0.16 + (state?.bond || 0) * 0.18);
  const resonancePower = Math.round(5 + (radar.emotion || 50) * 0.05 + (state?.bond || 0) * 0.08);

  const affinity = getRiftAffinity(companion, enemy);
  const radarMods = getRadarModifiers(radar);

  return {
    nodeId: nodeId || null,
    companionId: companion?.id || "greyshade-cat",
    companionName: companion?.name || "夥伴",
    emblem: companion?.emotionalEmblem?.zh || "憶・幽影",
    resonancePower,
    enemyId: enemy.id,
    enemyName: enemy.name.zh,
    enemySurge: enemy.attack,
    enemyLullChance: enemy.guardChance,
    // 裂隙心相
    riftEmotion: affinity.emotion,
    riftEmotionLabelZh: affinity.labelZh,
    affinityTier: affinity.tier,
    affinityMultiplier: affinity.multiplier,
    affinityLine: affinity.attuneLine,
    radarMods,
    noise: { current: enemy.maxHp, max: enemy.maxHp },
    stability: { current: stabilityMax, max: stabilityMax },
    sync: 1,
    fatigue: 0,
    boundary: 0,
    shards: 0,
    turn: "player",
    round: 1,
    startedAt: now,
    log: [
      {
        kind: "system",
        text: affinity.labelZh
          ? `${enemy.name.zh}的雜訊籠罩過來——這片裂隙的情緒，是「${affinity.labelZh}」。${enemy.flavor}`
          : `${enemy.name.zh}的雜訊籠罩過來。${enemy.flavor}`
      },
      ...(affinity.attuneLine ? [{ kind: "system", text: affinity.attuneLine }] : []),
      ...(affinity.tier === "dissonant"
        ? [{ kind: "system", text: `${companion?.name || "夥伴"}的氣息和這片${affinity.labelZh}有點相沖，但你們仍能慢慢靠近。` }]
        : []),
      { kind: "system", text: "穩住心核，把雜訊放輕。你們不需要消滅誰。" }
    ]
  };
}

export function canUseAction(session, actionId) {
  if (!session || session.turn !== "player") return false;
  if (actionId === "pulse") {
    return session.sync >= PULSE_SYNC_COST && session.fatigue < MAX_FATIGUE;
  }
  return true;
}

export function applyPlayerAction(session, actionId, rng = Math.random) {
  const next = cloneSession(session);
  const aff = next.affinityMultiplier || 1; // 元素契合（attuned 1.25 / dissonant 0.85）
  const mods = next.radarMods || {}; // radar 行動修正

  if (actionId === "barrier") {
    const stabilityGain = 5 + (mods.barrierStability || 0);
    const boundaryGain = 1 + (mods.barrierBoundaryBonus || 0);
    next.boundary = clamp(next.boundary + boundaryGain, 0, MAX_BOUNDARY);
    next.stability.current = clamp(next.stability.current + stabilityGain, 0, next.stability.max);
    next.sync = clamp(next.sync + 1, 0, MAX_SYNC);
    next.log.push({
      kind: "player",
      text: `${next.companionName}沒有撲向雜訊，而是在你們周圍立起一圈柔光的邊界。（穩定 +${stabilityGain}，邊界 ${next.boundary} 層）`
    });
  } else if (actionId === "pulse" && next.sync >= PULSE_SYNC_COST) {
    next.sync -= PULSE_SYNC_COST;
    next.fatigue = clamp(next.fatigue + 2, 0, MAX_FATIGUE);
    next.stability.current = clamp(next.stability.current - 2, 0, next.stability.max);
    const quieted = Math.max(1, Math.round(next.resonancePower * 1.9 * (mods.pulseBonus || 1) + rng() * 4));
    next.noise.current = clamp(next.noise.current - quieted, 0, next.noise.max);
    next.log.push({
      kind: "player",
      text: `一道淨化脈衝盪開，雜訊被狠狠推遠。（雜訊 -${quieted}，但你們都喘了一下：疲勞 +2）`
    });
  } else {
    // resonance（預設行動）——元素契合與治癒 radar 都疊在這裡，把戰術拉力導向「安撫」。
    const tired = next.fatigue >= MAX_FATIGUE - 1;
    const efficiency = tired ? 0.7 : 1;
    const quieted = Math.max(1, Math.round(next.resonancePower * efficiency * aff * (mods.resonanceBonus || 1) + rng() * 3));
    next.noise.current = clamp(next.noise.current - quieted, 0, next.noise.max);
    next.sync = clamp(next.sync + 1, 0, MAX_SYNC);
    next.fatigue = clamp(next.fatigue + 1, 0, MAX_FATIGUE);

    const flavor = RESONANCE_FLAVOR[next.emblem] || { name: "情感共鳴", line: "你們的節奏疊在一起，雜訊低了下去。" };
    const attuneTag = next.affinityTier === "attuned" ? "・心相共鳴" : "";
    if (next.shards < SHARD_GOAL) {
      next.shards += 1;
      next.log.push({
        kind: "player",
        text: `${flavor.name}${attuneTag}——${flavor.line}（雜訊 -${quieted}，回收記憶微光 ◈${next.shards}/${SHARD_GOAL}）`
      });
    } else {
      next.log.push({ kind: "player", text: `${flavor.name}${attuneTag}——${flavor.line}（雜訊 -${quieted}）` });
    }
    if (tired) {
      next.log.push({ kind: "system", text: "牠的呼吸有點亂了。也許該立個邊界，或者先離開。" });
    }
  }

  next.turn = "noise";
  return next;
}

export function applyNoiseTurn(session, rng = Math.random) {
  const next = cloneSession(session);
  if (next.turn !== "noise") return next;

  if (rng() < next.enemyLullChance) {
    next.log.push({ kind: "noise", text: `${next.enemyName}的雜訊暫歇了一拍，像在觀察你們。` });
  } else {
    const damping = 1 - next.boundary * BOUNDARY_DAMPING_PER_LAYER;
    const surge = Math.max(1, Math.round(next.enemySurge * (0.85 + rng() * 0.3) * damping));
    next.stability.current = clamp(next.stability.current - surge, 0, next.stability.max);
    if (next.boundary > 0) {
      next.log.push({
        kind: "noise",
        text: `雜訊湧動，撞在邊界上散成細小的光屑。（穩定 -${surge}）`
      });
      next.boundary = clamp(next.boundary - 1, 0, MAX_BOUNDARY); // 邊界需要維護
    } else {
      next.log.push({ kind: "noise", text: `${next.enemyName}的雜訊直接壓了過來。（穩定 -${surge}）` });
    }
  }

  next.turn = "player";
  next.round += 1;
  return next;
}

export function settleStandoff(session) {
  if (!session) return { settled: true, outcome: "retreated" };
  if (session.noise.current <= 0) return { settled: true, outcome: "stabilized" };
  if (session.shards >= SHARD_GOAL) return { settled: true, outcome: "recovered" };
  if (session.stability.current <= 0) return { settled: true, outcome: "overwhelmed_but_safe" };
  return { settled: false, outcome: null };
}

// 結局 → 既有 battleRecord 三值的映射（不改 schema；對峙語言活在文案層）。
const OUTCOME_TO_LEGACY = {
  stabilized: "win",
  recovered: "win",
  overwhelmed_but_safe: "lose",
  retreated: "retreat"
};

const OUTCOME_COPY = {
  stabilized: {
    title: "場域穩定",
    message: "雜訊散成了月光下的細塵。你們守住了這片棲地，誰也沒有被消滅。",
    homeLine: null
  },
  recovered: {
    title: "記憶回收",
    message: "三枚記憶微光在你們之間亮起。雜訊還在遠處，但已經追不上你們了。",
    homeLine: null
  },
  retreated: {
    title: "先撤退",
    message: "你們選擇先離開。懂得離開，也是一種照顧彼此的方式。",
    homeLine: null
  },
  overwhelmed_but_safe: {
    title: "過載・但安全",
    message: "心核過載的那一刻，牠把你拽到了身後，帶著你退出了雜訊的範圍。你們都還好。",
    homeLine: null
  }
};

export function getOutcomeCopy(outcome) {
  return OUTCOME_COPY[outcome] || OUTCOME_COPY.retreated;
}

/**
 * 對峙結算 → 關係狀態回寫。
 * 沒有懲罰式結算：每種結局都長出一點關係。
 * @returns {{ statePatch, message, memorySeed|null, legacyResult }}
 */
export function summarizeStandoffOutcome(outcome, session, state, now = Date.now()) {
  const record = state.battleRecord || { wins: 0, losses: 0, retreats: 0, lastResult: null, lastBattleAt: null };
  const legacyResult = OUTCOME_TO_LEGACY[outcome] || "retreat";
  const copy = getOutcomeCopy(outcome);
  const fatigue = session?.fatigue || 0;
  const riftEmotion = session?.riftEmotion || null;
  const riftLabelZh = session?.riftEmotionLabelZh || "雜訊";

  const statePatch = {
    battleRecord: {
      ...record,
      wins: record.wins + (legacyResult === "win" ? 1 : 0),
      losses: record.losses + (legacyResult === "lose" ? 1 : 0),
      retreats: record.retreats + (legacyResult === "retreat" ? 1 : 0),
      lastResult: legacyResult,
      lastBattleAt: now
    }
  };

  let memorySeed = null;

  if (outcome === "stabilized") {
    statePatch.bond = clamp((state.bond || 0) + 3, 0, 100);
    statePatch.trust = clamp((state.trust || 0) + 1, 0, 100);
    // 場域穩定下來——夥伴會開心（勝不驕，但允許一起鬆一口氣的喜悅）。回棲地後播 idle_happy。
    statePatch.mood = "happy";
    statePatch.energy = clamp((state.energy || 0) - 2, 0, 10);
    // 安撫過的裂隙會在記憶回廊留下一枚情緒對應的痕跡。
    memorySeed = {
      id: `emem_${now}_standoff`,
      theme: "安撫過的裂隙",
      label: "在裂隙裡留下的安靜",
      emotion: riftEmotion || "gratitude",
      intensity: 0.5,
      symbol: "golden_rune",
      place: "magic_circle",
      status: "fresh",
      source: "standoff",
      excerpt: `你們沒有消滅誰，只是把這片${riftLabelZh}輕輕放下了。`,
      createdAt: now,
      lastUpdatedAt: now,
      isVisibleInHabitat: true
    };
  } else if (outcome === "recovered") {
    statePatch.bond = clamp((state.bond || 0) + 2, 0, 100);
    statePatch.trust = clamp((state.trust || 0) + 2, 0, 100);
    // 一起把記憶撿回來，也是一種勝利——同樣以 idle_happy 表達喜悅。
    statePatch.mood = "happy";
    statePatch.energy = clamp((state.energy || 0) - 1, 0, 10);
    memorySeed = {
      id: `emem_${now}_standoff`,
      theme: "被接住的微光",
      label: "對峙中回收的記憶",
      emotion: riftEmotion || "gratitude",
      intensity: 0.5,
      symbol: "golden_rune",
      place: "magic_circle",
      status: "fresh",
      source: "standoff",
      excerpt: `在這片${riftLabelZh}裡，你們一起把三枚記憶微光帶了回來。`,
      createdAt: now,
      lastUpdatedAt: now,
      isVisibleInHabitat: true
    };
  } else if (outcome === "overwhelmed_but_safe") {
    statePatch.bond = clamp((state.bond || 0) + 1, 0, 100);
    statePatch.trust = clamp((state.trust || 0) + 1, 0, 100); // 牠保護了你，這份信任是真的
    statePatch.mood = "tired";
    statePatch.energy = clamp((state.energy || 0) - 3, 0, 10);
    memorySeed = {
      id: `emem_${now}_standoff`,
      theme: "被護住的疲憊",
      label: "過載那一刻的記憶",
      emotion: "fatigue",
      intensity: 0.6,
      symbol: "white_ash",
      place: "campfire_side",
      status: "fresh",
      source: "standoff",
      excerpt: "心核過載的那一刻，牠把你拽到了身後。",
      createdAt: now,
      lastUpdatedAt: now,
      isVisibleInHabitat: true
    };
  } else {
    // retreated
    statePatch.trust = clamp((state.trust || 0) + 1, 0, 100); // 尊重「離開」這個選擇
    statePatch.mood = "calm";
    statePatch.energy = clamp((state.energy || 0) - 1, 0, 10);
  }

  // 對峙疲勞回寫棲地：勉強太久，回家要付出休息的代價（不是懲罰，是真實感）。
  if (fatigue >= 4) {
    statePatch.energy = clamp((statePatch.energy ?? state.energy ?? 0) - 1, 0, 10);
  }
  if (fatigue >= 5) {
    statePatch.touchFatigue = clamp((state.touchFatigue || 0) + 1, 0, 10);
  }

  return { statePatch, message: copy.message, memorySeed, legacyResult };
}

function cloneSession(session) {
  return {
    ...session,
    noise: { ...session.noise },
    stability: { ...session.stability },
    log: [...session.log]
  };
}
