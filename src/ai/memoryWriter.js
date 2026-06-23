import { processEmotionInput } from "../engine/emotionalSedimentationEngine.js";
import { SOUL_TALK_INTENTS } from "./intentClassifier.js";
import { SOUL_TALK_REACTIONS } from "./reactionPlanner.js";

const BLOCKED_MEMORY_REASONS = new Set([
  "high_risk_safety",
  "dependency_pressure",
  "pressure_command",
  "repeated_spam",
  "noise_or_empty"
]);

export function buildMemoryDecision({
  state = {},
  gateway = {},
  safety = {},
  analysis = {},
  intent = {},
  plan = {},
  stateMutation = {},
  sedimentationResult = null
} = {}) {
  const sedimentation =
    sedimentationResult ||
    processEmotionInput(gateway.normalizedInput || gateway.originalInput, state, {
      now: gateway.now,
      idSuffix: gateway.idSuffix
    });

  if (BLOCKED_MEMORY_REASONS.has(stateMutation.reason)) {
    return emptyDecision("blocked_by_policy", sedimentation);
  }

  if (safety?.isHighRisk || safety?.action === "safety_redirect") {
    return emptyDecision("high_risk_no_ordinary_memory", sedimentation);
  }

  if (plan.mode === SOUL_TALK_REACTIONS.WITHDRAW || plan.mode === SOUL_TALK_REACTIONS.REJECT) {
    return emptyDecision("boundary_no_raw_memory", sedimentation);
  }

  if (!stateMutation.shouldCreateMemory) {
    return emptyDecision("mutation_policy_skip", sedimentation);
  }

  if (gateway.isNoise || gateway.isEmpty) {
    return emptyDecision("noise_or_empty", sedimentation);
  }

  let memoryType = "emotional_expression";
  let sanitizedExcerpt = buildExcerpt(gateway.normalizedInput);
  let baseObject = sedimentation.memoryObject;

  if (intent.intent === SOUL_TALK_INTENTS.APOLOGY) {
    memoryType = "apology";
    sanitizedExcerpt = sanitizeExcerpt(gateway.normalizedInput, "玩家留下一句道歉。");
    baseObject =
      baseObject ||
      buildSyntheticMemory({
        gateway,
        emotion: "gratitude",
        theme: "道歉",
        label: "真誠道歉",
        symbol: "repair",
        place: "stone_path"
      });
  } else if (intent.intent === SOUL_TALK_INTENTS.GRATITUDE) {
    memoryType = "gratitude";
  } else if (stateMutation.reason === "safe_harbor_caution") {
    memoryType = "safe_harbor_summary";
    sanitizedExcerpt = sanitizeExcerpt(gateway.normalizedInput, "一段需要放慢的情緒。");
  }

  if (!baseObject) {
    return emptyDecision("no_emotion_match", sedimentation);
  }

  const memoryObject = {
    ...baseObject,
    excerpt: sanitizedExcerpt,
    source: memoryType === "apology" ? "soul_talk" : baseObject.source || "soul_talk",
    memoryType
  };

  return {
    memoryObject,
    shouldWrite: true,
    memoryType,
    sanitizedExcerpt,
    sedimentationResult: sedimentation
  };
}

function emptyDecision(reason, sedimentationResult = null) {
  return {
    memoryObject: null,
    shouldWrite: false,
    memoryType: reason,
    sanitizedExcerpt: "",
    sedimentationResult
  };
}

function buildExcerpt(text, max = 80) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return "";
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

function sanitizeExcerpt(text, fallback) {
  const risky = /自殺|輕生|傷害自己|想死|不想活|殺|暴力|不准拒絕|你一定要陪我/;
  if (risky.test(text)) return fallback;
  return buildExcerpt(text);
}

function buildSyntheticMemory({ gateway, emotion, theme, label, symbol, place }) {
  return {
    id: `emem_${gateway.now}_${gateway.idSuffix}`,
    theme,
    label,
    emotion,
    intensity: 0.55,
    symbol,
    place,
    status: "fresh",
    source: "soul_talk",
    excerpt: buildExcerpt(gateway.normalizedInput),
    createdAt: gateway.now,
    lastUpdatedAt: gateway.now,
    isVisibleInHabitat: true
  };
}