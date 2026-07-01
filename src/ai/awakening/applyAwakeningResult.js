import { pruneHabitatTraces, upsertHabitatTrace } from "../../engine/habitatTraceEngine.js";

export function applyFirstAwakeningResult(state, payload = {}) {
  if (!payload.shouldApply) return { applied: false, reason: payload.reason || "skipped" };

  if (payload.memoryObject) {
    state.emotionalMemories = [...(state.emotionalMemories || []), payload.memoryObject];
    state.lastEmotionTag = payload.memoryObject.emotion;
  }

  if (payload.traceObject) {
    state.habitatTraces = pruneHabitatTraces(
      upsertHabitatTrace(state.habitatTraces || [], payload.traceObject)
    );
  }

  if (payload.statePatch) {
    Object.assign(state, payload.statePatch);
  }

  if (payload.chatEntry?.text) {
    state.chatHistory = [...(state.chatHistory || []), payload.chatEntry].slice(-24);
  }

  return {
    applied: true,
    reason: payload.reason,
    animationIntent: payload.animationIntent,
    animationKey: payload.animationKey,
    awakeningLine: payload.awakeningLine
  };
}