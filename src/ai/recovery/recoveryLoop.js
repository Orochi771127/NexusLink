const EMOTION_TRACE_MOTIF = Object.freeze({
  fatigue: "campfire_dim",
  sadness: "blue_lantern",
  anxiety: "glitch_mist",
  loneliness: "faint_spark",
  anger: "star_iron_ore",
  gratitude: "golden_rune",
  calm: "quiet_glow"
});

export function buildRecoveryContext(state = {}, memoryResult = {}, analysis = {}, runtime = {}) {
  const now = Number.isFinite(runtime.now) ? runtime.now : Date.now();
  const strongest = memoryResult.strongestMemory;
  const traces = Array.isArray(state.habitatTraces) ? state.habitatTraces : [];

  if (!strongest) {
    return { canRecall: false, phase: "none" };
  }

  const linkedTrace = findTraceForMemory(traces, strongest.id);
  const traceMotif = linkedTrace?.traceIntent?.visualMotif || EMOTION_TRACE_MOTIF[strongest.emotion] || "quiet_glow";
  const daysSince = Math.max(0, Math.floor((now - (Number(strongest.createdAt) || now)) / (24 * 60 * 60 * 1000)));

  const canRecall =
    memoryResult.hasRecentSimilarEmotion ||
    memoryResult.hasRecallableMemory ||
    daysSince >= 1 ||
    strongest.status === "settled" ||
    strongest.status === "transformed";

  return {
    canRecall,
    phase: resolveRecoveryPhase(strongest.status),
    memoryId: strongest.id,
    memoryTheme: strongest.theme || strongest.label || strongest.emotion || "那段情緒",
    memoryStatus: strongest.status || "fresh",
    memoryEmotion: strongest.emotion,
    traceMotif,
    traceMotifLabel: traceMotif,
    daysSince,
    priorIntensity: strongest.intensity,
    suggestReflectGoal: canRecall && analysis.emotionKey === strongest.emotion
  };
}

function resolveRecoveryPhase(status = "fresh") {
  if (status === "transformed") return "transformed";
  if (status === "settled") return "settled";
  return "fresh";
}

function findTraceForMemory(traces, memoryId) {
  const trace = traces.find((item) => item.memoryId === memoryId);
  if (!trace) return null;
  return { trace, traceIntent: inferTraceIntent(trace) };
}

function inferTraceIntent(trace) {
  const emotion = trace.emotion || "calm";
  return {
    visualMotif: EMOTION_TRACE_MOTIF[emotion] || "quiet_glow",
    emotion
  };
}