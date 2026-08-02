/**
 * memoryLifecycleEngine.js
 *
 * Manages the turn counters, periodic Nudge reminders, Session Flush extraction,
 * and anchor capacity pruning (Cap = 20) for Raphael Core's companionAnchors.
 *
 * Primary invariants:
 *   1. All memory proposals must pass processHermesMemoryProposals (safety gatekeeper).
 *   2. companionAnchors count is capped at COMPANION_ANCHOR_CAP (20).
 *   3. Nudge reminders trigger every NUDGE_INTERVAL (default: 8) turns.
 */

import {
  COMPANION_ANCHOR_CAP,
  isPlayerVisibleAnchor,
  mergeCompanionAnchors
} from '../dialogue/companionAnchorPolicy.js';
import { processHermesMemoryProposals } from '../external/hermesMemoryBridge.js';

export const DEFAULT_NUDGE_INTERVAL = 8;

/**
 * Initializes or updates memory lifecycle metadata in state.
 */
export function updateTurnCounter(state = {}) {
  const lifecycle = state.memoryLifecycle || {
    turnCount: 0,
    turnsSinceLastFlush: 0,
    lastFlushTime: null
  };

  lifecycle.turnCount += 1;
  lifecycle.turnsSinceLastFlush += 1;
  state.memoryLifecycle = lifecycle;
  return lifecycle;
}

/**
 * Checks whether a periodic memory nudge (reminder to consider saving key facts) should trigger.
 */
export function shouldNudgeMemory(state = {}, interval = DEFAULT_NUDGE_INTERVAL) {
  const turns = state.memoryLifecycle?.turnsSinceLastFlush || 0;
  return turns >= interval;
}

/**
 * Prunes companionAnchors down to COMPANION_ANCHOR_CAP (20).
 * Prioritizes player-visible anchors, higher confidence, and recent timestamp.
 */
export function pruneCompanionAnchors(anchors = [], cap = COMPANION_ANCHOR_CAP) {
  if (!Array.isArray(anchors) || anchors.length <= cap) {
    return anchors || [];
  }

  // Separate visible vs internal/expired
  const visible = anchors.filter(isPlayerVisibleAnchor);
  const invisible = anchors.filter(a => !isPlayerVisibleAnchor(a));

  // Sort visible anchors by confidence (desc) then timestamp (desc)
  visible.sort((a, b) => {
    const confDiff = (b.confidence || 0.8) - (a.confidence || 0.8);
    if (Math.abs(confDiff) > 0.001) return confDiff;
    return (b.updatedAt || 0) - (a.updatedAt || 0);
  });

  // Keep top `cap` visible anchors
  const keptVisible = visible.slice(0, cap);

  // If there's still room, add invisible anchors
  const remainingSlots = cap - keptVisible.length;
  const keptInvisible = remainingSlots > 0 ? invisible.slice(0, remainingSlots) : [];

  return [...keptVisible, ...keptInvisible];
}

/**
 * Flushes session memories by processing candidate proposals and pruning state anchors.
 *
 * @param {Array} proposals  – Candidate anchors extracted from LLM/Hermes or rule engines
 * @param {Object} state     – Game state (contains companionAnchors & memoryLifecycle)
 * @param {Object} context   – Perception context (safety, intent, plan)
 * @param {number} now       – Current timestamp
 */
export function flushSessionMemories(
  proposals = [],
  state = {},
  context = {},
  now = Date.now()
) {
  const processResult = processHermesMemoryProposals(proposals, state, context, now);

  // Apply pruning to keep anchors bounded
  state.companionAnchors = pruneCompanionAnchors(state.companionAnchors || []);

  // Update lifecycle metadata
  if (!state.memoryLifecycle) {
    state.memoryLifecycle = { turnCount: 0, turnsSinceLastFlush: 0, lastFlushTime: null };
  }
  state.memoryLifecycle.turnsSinceLastFlush = 0;
  state.memoryLifecycle.lastFlushTime = now;

  return {
    ...processResult,
    prunedAnchors: state.companionAnchors,
    anchorsCount: state.companionAnchors.length
  };
}
