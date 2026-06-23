/**
 * Level 2 preference memory — session-only, no defaultState / save schema change.
 */
const SESSION_PROFILES = new Map();

const DEFAULT_PROFILE = Object.freeze({
  replyLengthBias: "normal",
  avoidComfortIntensity: 0,
  preferPresenceOverAdvice: false,
  boundarySensitivity: 0,
  interactionPace: 0,
  eveningAffinity: false,
  restAffinity: false,
  learnedSignals: []
});

const SHORT_REPLY_PATTERNS = [/短一點/, /簡短/, /少說/, /安靜/, /不用說太多/];
const LOW_COMFORT_PATTERNS = [/不要太甜/, /別安慰/, /不用哄/, /不要肉麻/];

export function getCompanionPreferenceProfile(companionId = "default") {
  const existing = SESSION_PROFILES.get(companionId);
  if (existing) return { ...existing, learnedSignals: [...existing.learnedSignals] };
  return { ...DEFAULT_PROFILE, learnedSignals: [] };
}

export function updateCompanionPreferenceProfile(
  companionId = "default",
  { reflection = {}, perception = {}, gateway = {} } = {}
) {
  const profile = getCompanionPreferenceProfile(companionId);
  const input = gateway.normalizedInput || gateway.originalInput || "";
  const futureBias = reflection.futureBias || {};
  const signal = reflection.learnedSignal || null;

  if (signal && !profile.learnedSignals.includes(signal)) {
    profile.learnedSignals = [...profile.learnedSignals, signal].slice(-12);
  }

  if (futureBias.boundarySensitivity) {
    profile.boundarySensitivity = clamp01(profile.boundarySensitivity + futureBias.boundarySensitivity);
  }
  if (futureBias.interactionPace) {
    profile.interactionPace = clamp(profile.interactionPace + futureBias.interactionPace, -1, 1);
  }
  if (futureBias.avoidComfortIntensity) {
    profile.avoidComfortIntensity = clamp01(
      profile.avoidComfortIntensity + futureBias.avoidComfortIntensity
    );
  }
  if (futureBias.preferPresenceOverAdvice) {
    profile.preferPresenceOverAdvice = true;
  }

  if (perception.intent?.intent === "rest_request" || reflection.reflectionType === "rest_event") {
    profile.restAffinity = true;
    profile.replyLengthBias = "short";
    profile.preferPresenceOverAdvice = true;
  }

  if (SHORT_REPLY_PATTERNS.some((pattern) => pattern.test(input))) {
    profile.replyLengthBias = "short";
  }
  if (LOW_COMFORT_PATTERNS.some((pattern) => pattern.test(input))) {
    profile.avoidComfortIntensity = clamp01(profile.avoidComfortIntensity + 0.15);
    profile.preferPresenceOverAdvice = true;
  }

  const hour = new Date(gateway.now || Date.now()).getHours();
  if (hour >= 21 || hour <= 5) {
    profile.eveningAffinity = true;
  }

  SESSION_PROFILES.set(companionId, profile);
  return profile;
}

export function applyPreferenceToPersona(persona = {}, profile = {}) {
  const warmthCap = clamp01(
    (persona.responseBias?.warmthCap ?? 0.65) - (profile.avoidComfortIntensity || 0) * 0.25
  );
  const maxSentences =
    profile.replyLengthBias === "short"
      ? 1
      : persona.responseBias?.maxSentences || 2;

  return {
    ...persona,
    responseBias: {
      ...persona.responseBias,
      maxSentences,
      warmthCap,
      preferPresenceOverAdvice: profile.preferPresenceOverAdvice || persona.responseBias?.preferPresenceOverAdvice
    },
    preferenceProfile: profile
  };
}

export function buildPreferenceCooldown(profile = {}) {
  const cooldown = {};
  if (profile.replyLengthBias === "short" || profile.interactionPace < -0.02) {
    cooldown.replyLengthCap = "short";
  }
  if (profile.boundarySensitivity >= 0.05) {
    cooldown.boundaryBoost = true;
  }
  return cooldown;
}

export function applyPreferenceRepairs(execution = {}, profile = {}) {
  let reply = execution.reply || "";
  let shouldSpeak = execution.shouldSpeak;

  if (profile.replyLengthBias === "short" && reply.length > 36) {
    reply = trimToShortReply(reply);
  }

  if (profile.preferPresenceOverAdvice && reply.includes("建議")) {
    reply = reply.replace(/我可以建議[^。]+。?/, "我先陪著，不急著給答案。");
  }

  return {
    ...execution,
    reply,
    shouldSpeak: shouldSpeak && Boolean(reply),
    shouldStaySilent: !shouldSpeak || !reply,
    preferenceRepaired: true
  };
}

function trimToShortReply(text) {
  const first = String(text || "")
    .split(/[\n。！？]/)
    .map((part) => part.trim())
    .filter(Boolean)[0];
  return first ? `${first}。` : "我聽見了。";
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function clearSessionPreferenceProfiles() {
  SESSION_PROFILES.clear();
}