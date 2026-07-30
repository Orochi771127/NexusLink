import { validateRestrictedHabitatAgentActions } from "./autonomy/actionPolicy.js";

export const RAPHAEL_AGENT_SCHEMA_VERSION = 1;

export const RAPHAEL_AGENT_SOURCE = "raphael-restricted-habitat-agent";

export const RAPHAEL_AGENT_EVENT_TYPES = Object.freeze([
  "soul_talk",
  "touch",
  "return_echo",
  "habitat_change",
  "exploration_result",
  "standoff_result",
  "expedition_result"
]);

const SILENT_EVENTS = new Set([
  "touch",
  "return_echo",
  "habitat_change",
  "exploration_result",
  "standoff_result"
]);

const SAFETY_MODES = new Set(["safety_redirect", "enter_safe_harbor"]);

function isObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function coerceEventType(eventType) {
  return RAPHAEL_AGENT_EVENT_TYPES.includes(eventType) ? eventType : "habitat_change";
}

function getCompanionId(companion, state = {}) {
  return companion?.id || state?.activeCompanionId || state?.companion?.id || "greyshade-cat";
}

function getCoreSafety(coreResult = {}) {
  const safety = coreResult?.perception?.safety || coreResult?.safety || {};
  const mode = coreResult?.mode || coreResult?.plan?.mode || coreResult?.output?.mode || "";

  return {
    ...safety,
    mode,
    isHighRisk: Boolean(safety.isHighRisk || safety.action === "safety_redirect" || SAFETY_MODES.has(mode))
  };
}

function getCoreAction(coreResult = {}) {
  return (
    coreResult?.autonomy?.selectedAction ||
    coreResult?.plan?.selectedAction ||
    coreResult?.selectedAction ||
    null
  );
}

function getCoreReply(coreResult = {}) {
  const reply = coreResult?.output?.reply || coreResult?.reply || "";
  return typeof reply === "string" ? reply.trim() : "";
}

function getCoreAnimation(coreResult = {}) {
  return (
    coreResult?.animationDecision?.intent ||
    coreResult?.autonomy?.animationDecision?.intent ||
    coreResult?.plan?.animationIntent ||
    null
  );
}

function uniqueActions(actions) {
  return Array.from(new Set(actions.filter(Boolean)));
}

function deriveTouchActions(event = {}) {
  const reaction = event?.touchResult?.reaction || event?.touchResult?.classification || "";
  const blocked = Boolean(event?.touchResult?.blocked || event?.touchResult?.refused);

  if (blocked || reaction === "reject" || reaction === "withdraw" || reaction === "spam_angry") {
    return ["set_boundary", "body_cue_only"];
  }

  return ["body_cue_only"];
}

function deriveEventActions(eventType, event = {}, coreResult = {}) {
  const coreAction = getCoreAction(coreResult);
  const actions = [];

  if (coreAction) {
    actions.push(coreAction);
  }

  if (eventType === "touch") {
    actions.push(...deriveTouchActions(event));
  } else if (eventType === "return_echo") {
    actions.push("offer_presence");
  } else if (eventType === "habitat_change") {
    actions.push("body_cue_only");
  } else if (eventType === "exploration_result" || eventType === "expedition_result") {
    actions.push("suggest_exploration");
  } else if (eventType === "standoff_result") {
    actions.push("body_cue_only");
    if (["retreat", "retreated", "boundary"].includes(event?.result)) {
      actions.push("set_boundary");
    }
  }

  if (getCoreAnimation(coreResult) || event?.animationIntent) {
    actions.push("choose_animation");
  }

  return uniqueActions(actions.length ? actions : ["offer_presence"]);
}

function buildSpeech({ eventType, coreResult, safety, options }) {
  if (options?.suppressSpeech || options?.speechAlreadyApplied || SILENT_EVENTS.has(eventType)) {
    return null;
  }

  const reply = getCoreReply(coreResult);
  if (!reply) {
    return null;
  }

  return {
    role: safety.isHighRisk ? "system" : "companion",
    text: reply
  };
}

function buildSilence(eventType, speech, coreResult = {}) {
  if (speech) {
    return false;
  }

  if (eventType !== "soul_talk") {
    return true;
  }

  return Boolean(coreResult?.output?.shouldSpeak === false || !getCoreReply(coreResult));
}

function buildAnimation({ eventType, event, coreResult, safety, options }) {
  if (options?.animationAlreadyApplied || safety.isHighRisk) {
    return null;
  }

  const intent = getCoreAnimation(coreResult) || event?.animationIntent;
  if (!intent) {
    if (eventType === "return_echo") {
      return { intent: "return_presence", source: RAPHAEL_AGENT_SOURCE };
    }
    if (eventType === "touch" && deriveTouchActions(event).includes("set_boundary")) {
      return { intent: "boundary_soft_withdraw", source: RAPHAEL_AGENT_SOURCE };
    }
    return null;
  }

  return {
    intent,
    source: RAPHAEL_AGENT_SOURCE
  };
}

function buildBoundary({ eventType, event, coreResult, safety }) {
  const coreAction = getCoreAction(coreResult);
  const touchBoundary = eventType === "touch" && deriveTouchActions(event).includes("set_boundary");
  const standoffBoundary = eventType === "standoff_result"
    && ["retreat", "retreated", "boundary"].includes(event?.result);

  if (
    !touchBoundary
    && !standoffBoundary
    && !["set_boundary", "soft_refuse", "lower_interaction_intensity"].includes(coreAction)
  ) {
    return null;
  }

  return {
    mode: safety.isHighRisk ? "safety_exit" : "soft_boundary",
    text: safety.isHighRisk ? null : "Raphael lowers the interaction intensity and stays near the habitat boundary."
  };
}

function buildSuggestion(eventType, safety) {
  if (safety.isHighRisk) {
    return null;
  }

  if (eventType === "exploration_result") {
    return {
      type: "exploration",
      text: "可稍後再探索；Raphael 只會把路徑留在原處。"
    };
  }

  if (eventType === "standoff_result") {
    return {
      type: "rest",
      text: "可以先休息；邊界不會被視為失敗。"
    };
  }

  return null;
}

function buildMemoryMetadata(coreResult = {}, safety) {
  const decision = coreResult?.memoryDecision || {};
  return {
    controlled: true,
    allowed: Boolean(!safety.isHighRisk && decision.shouldWrite),
    reason: safety.isHighRisk ? "safety_exit_blocks_gameplay_memory" : decision.reason || null
  };
}

function buildTraceMetadata(coreResult = {}, safety) {
  const decision = coreResult?.traceDecision || {};
  return {
    controlled: true,
    allowed: Boolean(!safety.isHighRisk && (decision.shouldWrite || decision.shouldApplyTrace)),
    reason: safety.isHighRisk ? "safety_exit_blocks_gameplay_trace" : decision.reason || null
  };
}

function buildPresence(eventType, safety, boundary) {
  if (safety.isHighRisk) {
    return {
      state: "safety-exit",
      statusText: "Raphael 已切換成安全陪伴，不建立遊戲獎勵或痕跡。"
    };
  }

  if (boundary) {
    return {
      state: "boundary",
      statusText: "Raphael 保留距離，仍然留在棲地裡。"
    };
  }

  if (eventType === "soul_talk") {
    return {
      state: "listening",
      statusText: null
    };
  }

  return {
    state: "quiet",
    statusText: null
  };
}

function removeDisallowedActions(actions) {
  const validation = validateRestrictedHabitatAgentActions(actions);
  if (validation.allowed) {
    return {
      actions,
      validation
    };
  }

  const allowedActions = actions.filter((action) => {
    return !validation.violations.includes(`restricted_forbidden_action:${action}`);
  });

  return {
    actions: allowedActions.length ? allowedActions : ["stay_silent"],
    validation: validateRestrictedHabitatAgentActions(allowedActions.length ? allowedActions : ["stay_silent"]),
    originalValidation: validation
  };
}

export function createRaphaelAgentIntent({
  eventType = "habitat_change",
  event = {},
  coreResult = {},
  state = {},
  companion = null,
  now = Date.now(),
  options = {}
} = {}) {
  const normalizedEventType = coerceEventType(eventType);
  const normalizedEvent = isObject(event) ? event : {};
  const safety = getCoreSafety(coreResult);

  let actions = deriveEventActions(normalizedEventType, normalizedEvent, coreResult);
  if (safety.isHighRisk) {
    actions = uniqueActions(["enter_safe_harbor", "stay_silent"]);
  }
  const actionPolicy = removeDisallowedActions(actions);
  const speech = buildSpeech({
    eventType: normalizedEventType,
    coreResult,
    safety,
    options
  });
  const boundary = buildBoundary({
    eventType: normalizedEventType,
    event: normalizedEvent,
    coreResult,
    safety
  });
  const suggestion = buildSuggestion(normalizedEventType, safety);
  const presence = buildPresence(normalizedEventType, safety, boundary);

  return Object.freeze({
    schemaVersion: RAPHAEL_AGENT_SCHEMA_VERSION,
    source: RAPHAEL_AGENT_SOURCE,
    id: `${RAPHAEL_AGENT_SOURCE}:${normalizedEventType}:${now}`,
    createdAt: now,
    eventType: normalizedEventType,
    companionId: getCompanionId(companion, state),
    safetyExit: Boolean(safety.isHighRisk),
    actions: actionPolicy.actions,
    speech,
    silence: buildSilence(normalizedEventType, speech, coreResult),
    animation: buildAnimation({
      eventType: normalizedEventType,
      event: normalizedEvent,
      coreResult,
      safety,
      options
    }),
    boundary,
    suggestion,
    memory: buildMemoryMetadata(coreResult, safety),
    trace: buildTraceMetadata(coreResult, safety),
    presence,
    policy: {
      allowed: actionPolicy.validation.allowed,
      violations: actionPolicy.validation.violations,
      originalViolations: actionPolicy.originalValidation?.violations || []
    }
  });
}
