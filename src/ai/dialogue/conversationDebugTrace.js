export function buildConversationDebugTrace({
  inputText = "",
  nlu = {},
  responseStrategy = null,
  composeMeta = null,
  antiLoopDecision = null,
  variantSelection = null,
  quickReplies = [],
  reply = ""
} = {}) {
  const frame = nlu.semanticFrame || {};

  return {
    input: inputText,
    nlu: {
      topic: nlu.topic || frame.topic,
      dialogueAct: nlu.dialogueAct || frame.dialogueAct,
      constraints: nlu.constraints || frame.constraints || [],
      preferredResponse: nlu.preferredResponse || frame.preferredResponse,
      userNeed: frame.userNeed || null
    },
    responseStrategy: responseStrategy?.strategy || responseStrategy || null,
    selectedTemplateId: composeMeta?.variantId || null,
    antiLoopDecision: {
      shouldForce: Boolean(antiLoopDecision?.shouldBlock),
      forcedStrategy: antiLoopDecision?.forceStrategy || null,
      reason: antiLoopDecision?.reason || null
    },
    variantSelection: variantSelection
      ? {
          variantId: variantSelection.variantId,
          variationReason: variantSelection.variationReason,
          avoidedVariants: variantSelection.avoidedVariants || []
        }
      : null,
    finalReply: reply,
    quickReplies: (quickReplies || []).map((item) => ({
      label: item.label,
      intent: item.intent,
      actionType: item.actionType,
      topic: item.topic,
      responseStrategyHint: item.responseStrategyHint
    }))
  };
}

export function logConversationDebugTrace(trace, runtime = {}) {
  if (runtime.debugTrace === false) return;
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  if (params.get("raphaelDebug") !== "1" && params.get("raphaelSmoke") !== "1") return;

  console.debug("[RaphaelDialogueTrace]", trace);
}