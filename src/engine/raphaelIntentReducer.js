import {
  RAPHAEL_AGENT_EVENT_TYPES,
  RAPHAEL_AGENT_SCHEMA_VERSION,
  RAPHAEL_AGENT_SOURCE
} from "../ai/raphaelAgentAdapter.js";
import { validateRestrictedHabitatAgentActions } from "../ai/autonomy/actionPolicy.js";

export const RAPHAEL_AGENT_FORBIDDEN_INTENT_KEYS = Object.freeze([
  "navigate",
  "navigateTo",
  "openFlow",
  "openPanel",
  "pushTask",
  "fetch",
  "toolCall",
  "toolRegistry",
  "updateState",
  "setState",
  "mutateState",
  "statePatch",
  "reward",
  "grantReward"
]);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function findForbiddenKeys(value, path = "$", found = []) {
  if (!isPlainObject(value) && !Array.isArray(value)) {
    return found;
  }

  const entries = Array.isArray(value) ? value.entries() : Object.entries(value);
  for (const [key, child] of entries) {
    const keyText = String(key);
    const childPath = Array.isArray(value) ? `${path}[${keyText}]` : `${path}.${keyText}`;
    if (RAPHAEL_AGENT_FORBIDDEN_INTENT_KEYS.includes(keyText)) {
      found.push(childPath);
    }
    findForbiddenKeys(child, childPath, found);
  }

  return found;
}

function coerceText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function buildChatEntries(intent) {
  if (!intent?.speech?.text) {
    return [];
  }

  return [
    {
      role: intent.speech.role === "system" ? "system" : "companion",
      text: coerceText(intent.speech.text),
      source: RAPHAEL_AGENT_SOURCE,
      createdAt: intent.createdAt || Date.now()
    }
  ].filter((entry) => entry.text);
}

function buildStatusText(intent) {
  if (intent?.presence?.statusText) {
    return intent.presence.statusText;
  }

  if (intent?.boundary?.text) {
    return intent.boundary.text;
  }

  if (intent?.suggestion?.text) {
    return intent.suggestion.text;
  }

  return null;
}

export function validateRaphaelAgentIntent(intent = {}) {
  const violations = [];

  if (!isPlainObject(intent)) {
    return {
      allowed: false,
      violations: ["intent_not_object"]
    };
  }

  if (intent.schemaVersion !== RAPHAEL_AGENT_SCHEMA_VERSION) {
    violations.push(`schema_version:${intent.schemaVersion}`);
  }

  if (intent.source !== RAPHAEL_AGENT_SOURCE) {
    violations.push(`source:${intent.source}`);
  }

  if (!RAPHAEL_AGENT_EVENT_TYPES.includes(intent.eventType)) {
    violations.push(`event_type:${intent.eventType}`);
  }

  const actionValidation = validateRestrictedHabitatAgentActions(intent.actions || []);
  violations.push(...actionValidation.violations);

  const forbiddenKeys = findForbiddenKeys(intent);
  if (forbiddenKeys.length) {
    violations.push(`forbidden_keys:${forbiddenKeys.join(",")}`);
  }

  if (intent.safetyExit) {
    if (intent.memory?.allowed) {
      violations.push("safety_exit_memory_allowed");
    }
    if (intent.trace?.allowed) {
      violations.push("safety_exit_trace_allowed");
    }
    if (intent.suggestion) {
      violations.push("safety_exit_suggestion_present");
    }
  }

  return {
    allowed: violations.length === 0,
    violations
  };
}

export function reduceRaphaelAgentIntent(intent = {}, state = {}) {
  const validation = validateRaphaelAgentIntent(intent);
  const base = {
    source: RAPHAEL_AGENT_SOURCE,
    eventType: intent?.eventType || "unknown",
    companionId: intent?.companionId || state?.activeCompanionId || "greyshade-cat",
    accepted: validation.allowed,
    violations: validation.violations,
    chatEntries: [],
    statusText: null,
    presenceState: "quiet",
    animationIntent: null
  };

  if (!validation.allowed) {
    return Object.freeze({
      ...base,
      presenceState: "blocked",
      statusText: "Raphael intent blocked by restricted runtime policy."
    });
  }

  const presenceState = intent.presence?.state || (intent.safetyExit ? "safety-exit" : "quiet");

  return Object.freeze({
    ...base,
    chatEntries: buildChatEntries(intent),
    statusText: buildStatusText(intent),
    presenceState,
    animationIntent: intent.animation?.intent
      ? Object.freeze({
          intent: intent.animation.intent,
          source: intent.animation.source || RAPHAEL_AGENT_SOURCE
        })
      : null
  });
}

export function applyRaphaelAgentReduction(reduction = {}, handlers = {}) {
  if (!reduction?.accepted) {
    if (typeof handlers.setPresenceState === "function") {
      handlers.setPresenceState("blocked");
    }
    if (typeof handlers.setStatusText === "function" && reduction.statusText) {
      handlers.setStatusText(reduction.statusText);
    }
    return;
  }

  if (typeof handlers.setPresenceState === "function" && reduction.presenceState) {
    handlers.setPresenceState(reduction.presenceState);
  }

  if (typeof handlers.setStatusText === "function" && reduction.statusText) {
    handlers.setStatusText(reduction.statusText);
  }

  if (typeof handlers.addChatEntry === "function") {
    for (const entry of reduction.chatEntries || []) {
      handlers.addChatEntry(entry);
    }
  }

  if (typeof handlers.dispatchAnimation === "function" && reduction.animationIntent) {
    handlers.dispatchAnimation(reduction.animationIntent);
  }
}
