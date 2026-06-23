const SESSION_TRACES = [];
const MAX_TRACES = 48;

export function collectInteractionTrace(coreResult = {}) {
  const trace = {
    at: coreResult.now || Date.now(),
    input: coreResult.input?.normalizedInput || coreResult.inputText || "",
    intent: coreResult.perception?.intent?.intent,
    activeGoal: coreResult.autonomy?.activeGoal,
    selectedAction: coreResult.autonomy?.selectedAction,
    reaction: coreResult.plan?.mode,
    replyRole: coreResult.output?.replyRole,
    shouldSpeak: coreResult.output?.shouldSpeak,
    criticPass: coreResult.critique?.pass,
    criticFailures: coreResult.critique?.failureCodes || [],
    reflectionType: coreResult.reflection?.reflectionType,
    forbiddenPhraseDetected: coreResult.forbiddenPhraseDetected
  };

  SESSION_TRACES.push(trace);
  if (SESSION_TRACES.length > MAX_TRACES) SESSION_TRACES.shift();

  return trace;
}

export function getSessionTraces() {
  return [...SESSION_TRACES];
}

export function clearSessionTraces() {
  SESSION_TRACES.length = 0;
}