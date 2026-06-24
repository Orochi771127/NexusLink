import { buildPrefilledSpecificDetail } from "../nlu/specificDetailExtractor.js";
import { RESPONSE_STRATEGIES } from "../responseStrategySelector.js";
import { QUICK_REPLY_ACTION_TYPES } from "./quickReplyPlanner.js";

const FOCUS_DETAIL_MAP = {
  top_hud: "top HUD 被擋住",
  soul_talk_panel: "Soul Talk 面板被擋住",
  hud_layering: "HUD 疊層問題"
};

const FORCE_REFERENCE_TYPES = new Set([
  QUICK_REPLY_ACTION_TYPES.CLARIFY,
  QUICK_REPLY_ACTION_TYPES.CONSTRAINT,
  QUICK_REPLY_ACTION_TYPES.REPAIR
]);

export function createPrefillContext(quickReplyMeta = {}, currentNlu = {}) {
  if (!quickReplyMeta) return null;

  const payload = quickReplyMeta.payload || quickReplyMeta.metadata || {};

  return {
    prefillSpecificDetail: sanitizeDetail(payload.prefillSpecificDetail),
    focus: sanitizeDetail(payload.focus),
    constraints: mergeConstraints(currentNlu?.semanticFrame?.constraints || currentNlu?.constraints || [], payload.constraints || []),
    actionType: quickReplyMeta.actionType || "continue",
    topic: quickReplyMeta.topic || currentNlu?.semanticFrame?.topic || currentNlu?.topic || null,
    responseStrategyHint: quickReplyMeta.responseStrategyHint || null,
    source: "quick_reply",
    mustReference: shouldForceReference(quickReplyMeta),
    skipWeave: shouldSkipWeave(quickReplyMeta),
    isQuietMode: quickReplyMeta.actionType === QUICK_REPLY_ACTION_TYPES.QUIET
  };
}

export function applyQuickReplyContext(nlu = {}, quickReply = null) {
  if (!quickReply) return nlu;

  const prefillContext = createPrefillContext(quickReply, nlu);
  const frame = { ...(nlu.semanticFrame || {}) };
  const payload = quickReply.payload || quickReply.metadata || {};

  if (prefillContext?.constraints?.length) {
    frame.constraints = prefillContext.constraints;
    nlu.constraints = frame.constraints;
  } else if (payload.constraints?.length) {
    frame.constraints = [...new Set([...(frame.constraints || []), ...payload.constraints])];
    nlu.constraints = frame.constraints;
  }

  if (!prefillContext?.isQuietMode) {
    const referenceText = getReferenceText(prefillContext);
    if (referenceText) {
      frame.specificDetail = buildPrefilledSpecificDetail(referenceText, nlu.entities || []);
    }
  }

  if (quickReply.topic && quickReply.topic !== "unknown") {
    frame.topic = quickReply.topic;
    nlu.topic = quickReply.topic;
  }

  if (quickReply.dialogueAct) {
    frame.dialogueAct = quickReply.dialogueAct;
    nlu.dialogueAct = quickReply.dialogueAct;
  }

  nlu.semanticFrame = frame;
  nlu.prefillContext = prefillContext;
  return nlu;
}

export function resolveQuickReplyStrategy(quickReply = null, currentStrategy = null) {
  if (!quickReply) return currentStrategy;

  if (quickReply.actionType === QUICK_REPLY_ACTION_TYPES.QUIET) {
    return {
      strategy: RESPONSE_STRATEGIES.QUIET_PRESENCE,
      reason: "quick_reply_quiet"
    };
  }

  if (quickReply.responseStrategyHint) {
    return {
      strategy: quickReply.responseStrategyHint,
      reason: "quick_reply_selection"
    };
  }

  return currentStrategy;
}

export function hasValidPrefill(prefillContext = null) {
  if (!prefillContext || prefillContext.isQuietMode) return false;
  return Boolean(prefillContext.prefillSpecificDetail || prefillContext.focus);
}

export function getReferenceText(prefillContext = null) {
  if (!prefillContext) return null;
  if (prefillContext.prefillSpecificDetail) return prefillContext.prefillSpecificDetail;
  if (prefillContext.focus) {
    return FOCUS_DETAIL_MAP[prefillContext.focus] || prefillContext.focus;
  }
  return null;
}

export function getPrefillDebugInfo(prefillContext = null) {
  if (!prefillContext) {
    return {
      hasPrefill: false,
      referenceText: null,
      actionType: null,
      mustReference: false,
      isQuietMode: false,
      source: null
    };
  }

  return {
    hasPrefill: hasValidPrefill(prefillContext),
    referenceText: getReferenceText(prefillContext),
    actionType: prefillContext.actionType,
    mustReference: prefillContext.mustReference,
    isQuietMode: prefillContext.isQuietMode,
    skipWeave: prefillContext.skipWeave,
    source: prefillContext.source
  };
}

function sanitizeDetail(detail) {
  if (!detail || typeof detail !== "string") return null;
  const trimmed = detail.trim();
  if (!trimmed || trimmed.length > 120) return null;
  return trimmed;
}

function mergeConstraints(existing = [], incoming = []) {
  return [...new Set([...existing, ...incoming])];
}

function shouldForceReference(quickReplyMeta = {}) {
  return FORCE_REFERENCE_TYPES.has(quickReplyMeta.actionType);
}

function shouldSkipWeave(quickReplyMeta = {}) {
  return quickReplyMeta.actionType === QUICK_REPLY_ACTION_TYPES.QUIET;
}