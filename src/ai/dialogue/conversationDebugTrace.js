import { getPrefillDebugInfo } from "./quickReplyContext.js";

export function buildConversationDebugTrace({
  inputText = "",
  nlu = {},
  responseStrategy = null,
  composeMeta = null,
  antiLoopDecision = null,
  variantSelection = null,
  actionPlan = null,
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
    autonomy: actionPlan
      ? {
          selectedAction: actionPlan.selectedAction || null,
          reason: actionPlan.reason || null,
          shouldSpeak: Boolean(actionPlan.shouldSpeak)
        }
      : null,
    finalReply: reply,
    prefill: {
      ...getPrefillDebugInfo(nlu.prefillContext),
      usedPrefillDetail: composeMeta?.usedPrefillDetail || null,
      groundedByPrefill: Boolean(composeMeta?.groundedByPrefill)
    },
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

  console.debug("[RaphaelDialogueTrace]", sanitizeConversationDebugTraceForLog(trace));
}

export function sanitizeConversationDebugTraceForLog(trace = {}) {
  return {
    input: "[redacted]",
    nlu: {
      topic: trace.nlu?.topic || null,
      dialogueAct: trace.nlu?.dialogueAct || null,
      constraints: Array.isArray(trace.nlu?.constraints) ? [...trace.nlu.constraints] : [],
      preferredResponse: trace.nlu?.preferredResponse || null,
      userNeed: trace.nlu?.userNeed || null
    },
    responseStrategy: trace.responseStrategy || null,
    selectedTemplateId: trace.selectedTemplateId || null,
    antiLoopDecision: trace.antiLoopDecision || null,
    variantSelection: trace.variantSelection || null,
    autonomy: trace.autonomy || null,
    finalReply: "[redacted]",
    prefill: {
      source: trace.prefill?.source || null,
      groundedByPrefill: Boolean(trace.prefill?.groundedByPrefill),
      usedPrefillDetail: null
    },
    quickReplies: (trace.quickReplies || []).map((item) => ({
      intent: item?.intent || null,
      actionType: item?.actionType || null,
      topic: item?.topic || null,
      responseStrategyHint: item?.responseStrategyHint || null
    }))
  };
}
