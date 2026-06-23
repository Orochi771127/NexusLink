import { buildPrefilledSpecificDetail } from "../nlu/specificDetailExtractor.js";
import { RESPONSE_STRATEGIES } from "../responseStrategySelector.js";
import { QUICK_REPLY_ACTION_TYPES } from "./quickReplyPlanner.js";

const FOCUS_DETAIL_MAP = {
  top_hud: "top HUD 被擋住",
  soul_talk_panel: "Soul Talk 面板被擋住",
  hud_layering: "HUD 疊層問題"
};

export function applyQuickReplyContext(nlu = {}, quickReply = null) {
  if (!quickReply) return nlu;

  const frame = { ...(nlu.semanticFrame || {}) };
  const payload = quickReply.payload || quickReply.metadata || {};

  if (payload.constraints?.length) {
    frame.constraints = [...new Set([...(frame.constraints || []), ...payload.constraints])];
    nlu.constraints = frame.constraints;
  }

  if (payload.prefillSpecificDetail) {
    frame.specificDetail = buildPrefilledSpecificDetail(payload.prefillSpecificDetail, nlu.entities || []);
  } else if (payload.focus) {
    const focusDetail = FOCUS_DETAIL_MAP[payload.focus];
    if (focusDetail) {
      frame.specificDetail = buildPrefilledSpecificDetail(focusDetail, nlu.entities || []);
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