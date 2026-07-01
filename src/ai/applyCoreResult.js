import {
  createHabitatTraceFromMemory,
  pruneHabitatTraces,
  upsertHabitatTrace
} from "../engine/habitatTraceEngine.js";
import { buildMilestoneMemory, findNewBondMilestone, getMilestoneLine } from "../engine/bondMilestoneEngine.js";
import { shouldBlockMilestone } from "./stateMutationPolicy.js";
import { dispatchRaphaelAnimationCue } from "./raphaelAnimationBridge.js";

const NON_REWARDING_MODES = new Set(["safety_redirect", "withdraw", "reject"]);

export function applyRaphaelCoreResult(
  state,
  coreResult,
  { companion = null, now = Date.now(), dispatchAnimation = true } = {}
) {
  const plan = coreResult.plan || {};
  const mutation = coreResult.stateMutation || {};
  const memoryDecision = coreResult.memoryDecision || {};
  const traceDecision = coreResult.traceDecision || {};
  const output = coreResult.output || {};

  state.lastMessage = coreResult.input?.normalizedInput || coreResult.inputText || state.lastMessage;

  applyStatePatch(state, mutation.statePatch || {});
  if (mutation.spamScoreDelta) {
    state.spamScore = Math.max(0, (state.spamScore || 0) + mutation.spamScoreDelta);
  }

  if (memoryDecision.shouldWrite && memoryDecision.memoryObject) {
    pushEmotionalMemoryWithTrace(state, memoryDecision.memoryObject, now, traceDecision);
  } else if (traceDecision.shouldApplyTrace && traceDecision.traceObject) {
    state.habitatTraces = pruneHabitatTraces(
      upsertHabitatTrace(state.habitatTraces || [], traceDecision.traceObject)
    );
  }

  state.habitatRepairFactor = calculateHabitatRepairFactor(state.emotionalMemories);
  state.reactionPreview =
    mutation.statePatch?.reactionPreview ||
    plan.statePatch?.reactionPreview ||
    "";

  const shouldSpeak = output.shouldSpeak !== false;
  const replyRole = output.replyRole || coreResult.replyRole || plan.replyRole || "companion";
  const replyText = output.reply ?? coreResult.reply ?? "";

  if (shouldSpeak && replyText) {
    state.chatHistory.push({ role: replyRole, text: replyText });
  }

  const milestone = resolveMilestone(state, coreResult, companion, now);
  if (milestone) {
    pushEmotionalMemoryWithTrace(state, milestone.memory, now);
    state.chatHistory.push({ role: "companion", text: milestone.line });
  }

  if (state.chatHistory.length > 24) state.chatHistory.shift();

  if (dispatchAnimation && coreResult.animationDecision) {
    dispatchRaphaelAnimationCue(coreResult.animationDecision, { source: "raphael-soul-talk" });
  }

  return {
    replyRole,
    replyText,
    shouldSpeak,
    milestone,
    reflection: coreResult.reflection || null,
    animationDispatched: Boolean(dispatchAnimation && coreResult.animationDecision?.shouldDispatchNow)
  };
}

function resolveMilestone(state, coreResult, companion, now) {
  const plan = coreResult.plan || {};
  const mutation = coreResult.stateMutation || {};

  if (shouldBlockMilestone(plan, mutation) || NON_REWARDING_MODES.has(plan.mode)) {
    return null;
  }

  if (!mutation.shouldTriggerMilestone || !mutation.shouldRewardRelationship) {
    return null;
  }

  const newMilestone = findNewBondMilestone(state.bond, state.emotionalMemories);
  if (!newMilestone) return null;

  const line = getMilestoneLine(newMilestone, companion?.soulTalkTone);
  return {
    memory: buildMilestoneMemory(newMilestone, now, line),
    line
  };
}

function applyStatePatch(state, patch = {}) {
  const allowedKeys = [
    "safeHarborMode",
    "mood",
    "energy",
    "trust",
    "bond",
    "defense",
    "reactionPreview",
    "touchFatigue",
    "lastTouchReaction"
  ];

  allowedKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      state[key] = patch[key];
    }
  });
}

function pushEmotionalMemoryWithTrace(state, memoryObject, now, traceDecision = {}) {
  state.emotionalMemories.push(memoryObject);
  state.lastEmotionTag = memoryObject.emotion;

  const trace = traceDecision.traceObject || createHabitatTraceFromMemory(memoryObject, now);
  if (!trace) return;

  state.habitatTraces = pruneHabitatTraces(upsertHabitatTrace(state.habitatTraces || [], trace));
}

function calculateHabitatRepairFactor(emotionalMemories = []) {
  if (!Array.isArray(emotionalMemories) || emotionalMemories.length === 0) return 0;

  const transformedCount = emotionalMemories.filter((memory) => memory.status === "transformed").length;
  const settledCount = emotionalMemories.filter((memory) => memory.status === "settled").length;
  const total = emotionalMemories.length;

  return Math.max(0, Math.min(1, (transformedCount * 0.08 + settledCount * 0.04) / Math.max(1, total)));
}