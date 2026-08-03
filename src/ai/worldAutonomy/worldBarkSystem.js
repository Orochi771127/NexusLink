/**
 * worldBarkSystem.js
 * Turns an embodied World Autonomy action into (at most) one short bark.
 *
 * Design contract:
 * - Body language first. Every action yields a bodyCue; only a few situations
 *   also yield text（狀態說明／發現／提示／失敗原因／敘事時刻）。
 * - Text is budgeted by `worldBarkPolicy.js`; over budget it degrades to a body
 *   cue and **never cancels the action** — a bark is decoration, not a gate.
 * - Deterministic: seeded selection, no `Math.random()`, so the same input
 *   always yields the same key（可測試）。
 * - Sovereignty: barks only reflect current Needs and world facts. They never
 *   rewrite persona, never grant rewards, never advance a quest, never mutate
 *   state, and never bypass `worldActionPolicy.js`.
 *
 * 100% local: no network, no LLM, no persistence.
 */

import {
  WORLD_BARK_CATEGORIES,
  evaluateWorldBarkBudget
} from "./worldBarkPolicy.js";
import {
  WORLD_BARK_FAILURE_PACK,
  getWorldBarkAnimationIntent,
  getWorldBarkBodyCue,
  getWorldBarkPack,
  isBodyCueOnlyAction,
  resolveFailureReasonBucket
} from "../../data/worldBarkPacks.js";
import { isDriveAvailable } from "./worldStateAdapter.js";

/** Same banding thresholds as `worldReflection.js` so traces and barks agree. */
export function bandDrive(value) {
  const numeric = Number(value) || 0;
  if (numeric > 0.6) return "high";
  if (numeric > 0.3) return "mid";
  return "low";
}

/** Session-only bark ledger the caller carries between ticks. */
export function createWorldBarkBudgetState(bootAt = Date.now()) {
  return {
    bootAt: Number.isFinite(Number(bootAt)) ? Number(bootAt) : Date.now(),
    lastBarkAt: 0,
    barksThisSession: 0,
    hintBarksThisSession: 0,
    recentBarkKeys: [],
    lastPlayerInteractionAt: 0
  };
}

const RECENT_KEY_MEMORY = 6;

/**
 * @returns {{
 *   spoken: boolean, barkKey: string|null, category: string|null,
 *   bodyCueId: string, animationIntent: string|null,
 *   degraded: boolean, degradedReason: string|null, blocks: string[],
 *   budget: object, budgetAfter: object
 * }}
 */
export function buildWorldBark({
  plannedAction = null,
  drives = {},
  availability = {},
  budgetState = null,
  safeUnstable = false,
  abortReason = null,
  now = Date.now(),
  seed = 0
} = {}) {
  const actionId = String(plannedAction?.actionId || "idle");
  const ledger = normalizeBudgetState(budgetState, now);
  const bodyCueId = getWorldBarkBodyCue(actionId);
  const animationIntent = getWorldBarkAnimationIntent(actionId);

  const resolved = abortReason
    ? resolveFailureCandidates(abortReason)
    : resolveActionCandidates(actionId, drives, availability);

  if (!resolved) {
    return silentResult({
      bodyCueId,
      animationIntent,
      degradedReason: "not_text_eligible",
      blocks: ["not_text_eligible"],
      ledger,
      now,
      safeUnstable
    });
  }

  const budget = evaluateWorldBarkBudget({
    now,
    bootAt: ledger.bootAt,
    lastBarkAt: ledger.lastBarkAt,
    barksThisSession: ledger.barksThisSession,
    hintBarksThisSession: ledger.hintBarksThisSession,
    safeUnstable,
    lastPlayerInteractionAt: ledger.lastPlayerInteractionAt,
    recentBarkKeys: ledger.recentBarkKeys,
    candidateKeys: resolved.candidateKeys,
    category: resolved.category,
    driveAvailable: resolved.driveAvailable
  });

  if (!budget.allowed) {
    return {
      spoken: false,
      barkKey: null,
      category: null,
      bodyCueId,
      animationIntent,
      degraded: true,
      degradedReason: budget.blocks[0] || "blocked",
      blocks: [...budget.blocks],
      budget,
      // 行動照常執行：預算用盡只是降級成身體語言，不取消夥伴的行動。
      budgetAfter: freezeLedger(ledger)
    };
  }

  const barkKey = pickDeterministic(budget.freshKeys, seed);
  const isHint = resolved.category === WORLD_BARK_CATEGORIES.HINT;

  const budgetAfter = freezeLedger({
    ...ledger,
    lastBarkAt: toTime(now, ledger.lastBarkAt),
    barksThisSession: ledger.barksThisSession + 1,
    hintBarksThisSession: ledger.hintBarksThisSession + (isHint ? 1 : 0),
    recentBarkKeys: [...ledger.recentBarkKeys, barkKey].slice(-RECENT_KEY_MEMORY)
  });

  return {
    spoken: true,
    barkKey,
    category: resolved.category,
    bodyCueId,
    animationIntent,
    degraded: false,
    degradedReason: null,
    blocks: [],
    budget,
    budgetAfter
  };
}

/** Record a player-initiated interaction so the grace window can open. */
export function markPlayerInteraction(budgetState, now = Date.now()) {
  const ledger = normalizeBudgetState(budgetState, now);
  return freezeLedger({ ...ledger, lastPlayerInteractionAt: toTime(now, 0) });
}

function resolveActionCandidates(actionId, drives, availability) {
  if (isBodyCueOnlyAction(actionId)) return null;
  const pack = getWorldBarkPack(actionId);
  if (!pack) return null;

  const band = bandDrive(drives?.[pack.primaryDrive]);
  const candidateKeys = pack.bands?.[band] || [];
  const driveAvailable = (pack.requires || []).every((drive) => isDriveAvailable(availability, drive));

  return { category: pack.category, candidateKeys: [...candidateKeys], driveAvailable, band };
}

function resolveFailureCandidates(abortReason) {
  const bucket = resolveFailureReasonBucket(abortReason);
  if (!bucket) return null;
  return {
    category: WORLD_BARK_FAILURE_PACK.category,
    candidateKeys: [...WORLD_BARK_FAILURE_PACK.byReason[bucket]],
    // 失敗原因來自 policy 本身，不依賴任何世界資料是否可用。
    driveAvailable: true,
    band: "n/a"
  };
}

function silentResult({ bodyCueId, animationIntent, degradedReason, blocks, ledger, now, safeUnstable }) {
  const budget = evaluateWorldBarkBudget({
    now,
    bootAt: ledger.bootAt,
    lastBarkAt: ledger.lastBarkAt,
    barksThisSession: ledger.barksThisSession,
    hintBarksThisSession: ledger.hintBarksThisSession,
    safeUnstable,
    lastPlayerInteractionAt: ledger.lastPlayerInteractionAt,
    recentBarkKeys: ledger.recentBarkKeys,
    candidateKeys: [],
    category: null,
    driveAvailable: false
  });

  return {
    spoken: false,
    barkKey: null,
    category: null,
    bodyCueId,
    animationIntent,
    degraded: true,
    degradedReason,
    blocks: [...blocks],
    budget,
    budgetAfter: freezeLedger(ledger)
  };
}

/** Seeded pick — deterministic variety without `Math.random()`. */
function pickDeterministic(keys, seed) {
  if (!keys.length) return null;
  const numeric = Number(seed);
  const safeSeed = Number.isFinite(numeric) ? Math.abs(Math.trunc(numeric)) : 0;
  return keys[safeSeed % keys.length];
}

function normalizeBudgetState(budgetState, now) {
  const base = createWorldBarkBudgetState(toTime(now, Date.now()));
  if (!budgetState || typeof budgetState !== "object") return base;
  return {
    bootAt: toTime(budgetState.bootAt, base.bootAt),
    lastBarkAt: toTime(budgetState.lastBarkAt, 0),
    barksThisSession: toCount(budgetState.barksThisSession),
    hintBarksThisSession: toCount(budgetState.hintBarksThisSession),
    recentBarkKeys: Array.isArray(budgetState.recentBarkKeys)
      ? budgetState.recentBarkKeys.map((key) => String(key || "")).filter(Boolean).slice(-RECENT_KEY_MEMORY)
      : [],
    lastPlayerInteractionAt: toTime(budgetState.lastPlayerInteractionAt, 0)
  };
}

function freezeLedger(ledger) {
  return Object.freeze({
    ...ledger,
    recentBarkKeys: Object.freeze([...ledger.recentBarkKeys])
  });
}

function toCount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
}

function toTime(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}
