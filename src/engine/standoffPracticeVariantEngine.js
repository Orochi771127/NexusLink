// 已通關裂隙的零獎勵譜式演練。
//
// 本模組只轉換既有 battleEngine session；不建立 stage、不結算、不提供 reward、
// Growth、排名或存檔 patch。battleEngine 仍是每一拍與四種安全結局的唯一權威。

import { getCompanionById } from "../data/companionRegistry.js";
import { getEnemyById } from "../data/enemyRegistry.js";
import { getExplorationNodeById } from "../data/explorationNodes.js";
import { getRiftAffinity } from "./battleEngine.js";
import { isStandoffScenarioCleared } from "./standoffProgress.js";

export const STANDOFF_PRACTICE_VARIANTS = Object.freeze([
  Object.freeze({
    id: "solo_witness",
    labelKey: "standoff.practice.soloWitness.label",
    copyKey: "standoff.practice.soloWitness.copy"
  }),
  Object.freeze({
    id: "shared_breath",
    labelKey: "standoff.practice.sharedBreath.label",
    copyKey: "standoff.practice.sharedBreath.copy"
  }),
  Object.freeze({
    id: "cross_current",
    labelKey: "standoff.practice.crossCurrent.label",
    copyKey: "standoff.practice.crossCurrent.copy"
  })
]);

const VARIANT_BY_ID = new Map(STANDOFF_PRACTICE_VARIANTS.map((variant) => [variant.id, variant]));
const CROSS_CURRENT_SEQUENCE = Object.freeze(["surge", "lull"]);

export function listAvailableStandoffPracticeVariants(state = {}, nodeId = "") {
  if (state?.safeHarborMode === true) return [];
  const normalizedNodeId = normalizeText(nodeId);
  if (!isExistingClearedNode(state, normalizedNodeId)) return [];
  return STANDOFF_PRACTICE_VARIANTS.map((variant) => ({ ...variant }));
}

/**
 * 套用一次 session-only 譜式。輸入 session 與 state 都不會被修改。
 */
export function applyStandoffPracticeVariant(session, {
  state = {},
  nodeId = session?.nodeId || "",
  variantId = ""
} = {}) {
  if (!session || typeof session !== "object") return failResult("invalid-session", null);
  if (state?.safeHarborMode === true || session.growthSafetyExcluded === true) {
    return failResult("safety-paused", session);
  }

  const normalizedNodeId = normalizeText(nodeId);
  if (!getExplorationNodeById(normalizedNodeId)) return failResult("unknown-node", session);
  if (!isStandoffScenarioCleared(state, normalizedNodeId)) return failResult("node-not-cleared", session);
  if (normalizeText(session.nodeId) !== normalizedNodeId) return failResult("owner-mismatch", session);

  const variant = VARIANT_BY_ID.get(variantId);
  if (!variant) return failResult("unknown-variant", session);

  const next = cloneSession(session);
  const practiceVariant = {
    version: 1,
    id: variant.id,
    nodeId: normalizedNodeId,
    sessionOnly: true,
    beatIndex: 0,
    intentPolicy: variant.id === "cross_current" ? "alternating_surge_lull" : "battle_engine",
    telegraphLocked: variant.id === "cross_current",
    earlyRestCompanionId: null
  };

  if (variant.id === "solo_witness") {
    const lead = getCompanionById(next.companionId);
    const enemy = getEnemyById(next.enemyId);
    if (!lead || lead.id !== next.companionId || !enemy || enemy.id !== next.enemyId) {
      return failResult("invalid-session-owner", session);
    }
    const previousAffinityLine = next.affinityLine;
    const affinity = getRiftAffinity(lead, enemy);
    next.circle = [];
    next.affinityTier = affinity.tier;
    next.affinityMultiplier = affinity.multiplier;
    next.affinityLine = affinity.attuneLine;
    next.log = next.log.filter((entry) => (
      !String(entry?.text || "").includes("【共鳴圈】")
      && (!previousAffinityLine || entry?.text !== previousAffinityLine)
    ));
    if (affinity.attuneLine && !next.log.some((entry) => entry?.text === affinity.attuneLine)) {
      next.log.push({ kind: "system", text: affinity.attuneLine });
    }
  }

  if (variant.id === "shared_breath") {
    const restingIndex = next.circle.findIndex((member) => member && member.resting !== true);
    if (restingIndex < 0) return failResult("support-required", session);
    const restingMember = next.circle[restingIndex];
    next.circle[restingIndex] = {
      ...restingMember,
      breath: 0,
      resting: true,
      practiceRested: true
    };
    practiceVariant.earlyRestCompanionId = restingMember.id;
  }

  if (variant.id === "cross_current") {
    next.nextIntent = CROSS_CURRENT_SEQUENCE[0];
    next.charged = false;
  }

  next.practiceVariant = practiceVariant;
  next.log.push({
    kind: "system",
    text: getPracticeOpeningLine(variant.id, practiceVariant.earlyRestCompanionId, next.circle)
  });

  return okResult(next, variant);
}

/**
 * cross_current 在 battleEngine 完成 noise turn、重新回到 player turn後呼叫。
 * 它只覆寫下一拍已顯示的 nextIntent，絕不執行該意圖。
 */
export function advanceStandoffPracticeIntent(session) {
  if (!session || typeof session !== "object") return failResult("invalid-session", null);
  if (session.growthSafetyExcluded === true) return failResult("safety-paused", session);
  if (session.practiceVariant?.id !== "cross_current") {
    return failResult("not-cross-current", session);
  }
  if (session.turn !== "player") return failResult("not-player-turn", session);

  const next = cloneSession(session);
  const beatIndex = finiteInteger(next.practiceVariant.beatIndex, 0) + 1;
  next.practiceVariant = {
    ...next.practiceVariant,
    beatIndex
  };
  next.nextIntent = CROSS_CURRENT_SEQUENCE[beatIndex % CROSS_CURRENT_SEQUENCE.length];
  return okResult(next, VARIANT_BY_ID.get("cross_current"));
}

export function getStandoffPracticeMetadata(session) {
  const practice = session?.practiceVariant;
  if (!practice || !VARIANT_BY_ID.has(practice.id)) return null;
  return {
    id: practice.id,
    nodeId: practice.nodeId,
    sessionOnly: true,
    beatIndex: finiteInteger(practice.beatIndex, 0),
    intentPolicy: practice.intentPolicy,
    telegraphLocked: practice.telegraphLocked === true,
    earlyRestCompanionId: normalizeText(practice.earlyRestCompanionId) || null
  };
}

function isExistingClearedNode(state, nodeId) {
  return Boolean(nodeId && getExplorationNodeById(nodeId) && isStandoffScenarioCleared(state, nodeId));
}

function cloneSession(session) {
  return {
    ...session,
    noise: session.noise ? { ...session.noise } : session.noise,
    stability: session.stability ? { ...session.stability } : session.stability,
    radarMods: session.radarMods ? { ...session.radarMods } : session.radarMods,
    intentBias: session.intentBias ? { ...session.intentBias } : session.intentBias,
    circle: Array.isArray(session.circle) ? session.circle.map((member) => ({ ...member })) : [],
    log: Array.isArray(session.log) ? session.log.map((entry) => ({ ...entry })) : [],
    practiceVariant: session.practiceVariant ? { ...session.practiceVariant } : undefined
  };
}

function getPracticeOpeningLine(variantId, earlyRestCompanionId, circle) {
  if (variantId === "solo_witness") {
    return "【譜式演練・獨自見證】這次只有你與主夥伴站進圈裡；空圈也能慢慢完成。";
  }
  if (variantId === "shared_breath") {
    const member = circle.find(({ id }) => id === earlyRestCompanionId);
    return `【譜式演練・共息】${member?.name || "一位夥伴"}先退到圈邊休息；牠沒事，也不需要被補位。`;
  }
  return "【譜式演練・交錯潮】湧動與暫歇會清楚交替；每一拍都會先讓你看見。";
}

function okResult(session, variant) {
  return {
    ok: true,
    reason: null,
    session,
    variant: variant ? { ...variant } : null,
    permanentDelta: null
  };
}

function failResult(reason, session) {
  return {
    ok: false,
    reason,
    session: session && typeof session === "object" ? cloneSession(session) : null,
    variant: null,
    permanentDelta: null
  };
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function finiteInteger(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}
