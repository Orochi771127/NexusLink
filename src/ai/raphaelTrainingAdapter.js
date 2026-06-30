import { RAPHAEL_TRAINING_BUNDLE } from "../data/ai/raphaelTrainingBundle.js";
import { TOPICS } from "./nlu/topicClassifier.js";
import { DIALOGUE_ACTS } from "./nlu/dialogueActClassifier.js";

const SOURCE = "raphaelTrainingBundle";

const TOPIC_MAP = Object.freeze({
  daily_greeting: TOPICS.UNKNOWN,
  daily_life: TOPICS.EMOTION,
  quiet_presence: TOPICS.EMOTION,
  physical_tiredness: TOPICS.PHYSICAL_TIREDNESS,
  anxiety: TOPICS.EMOTION,
  repair: TOPICS.RELATIONSHIP,
  raphael_ai: TOPICS.RAPHAEL_AI,
  hud_ui: TOPICS.HUD_UI,
  raphael_behavior: TOPICS.RAPHAEL_AI,
  social_conflict: TOPICS.SOCIAL_CONFLICT
});

const DIALOGUE_ACT_MAP = Object.freeze({
  greeting: DIALOGUE_ACTS.GREETING,
  sharing: DIALOGUE_ACTS.DESCRIBING_EVENT,
  requesting_silence: DIALOGUE_ACTS.REQUESTING_SILENCE,
  venting: DIALOGUE_ACTS.VENTING,
  apologizing: DIALOGUE_ACTS.APOLOGIZING,
  asking_for_help: DIALOGUE_ACTS.ASKING_FOR_HELP,
  reporting_bug: DIALOGUE_ACTS.REPORTING_BUG,
  asking_for_explanation: DIALOGUE_ACTS.ASKING_QUESTION
});

const ADVISORY_STRATEGY_ALLOWLIST = Object.freeze(
  new Set([
    "light_greeting",
    "contextual_ack",
    "quiet_presence",
    "emotional_short",
    "holding_space",
    "practical_explanation",
    "practical_clarification",
    "answer_or_clarify",
    "short_validation"
  ])
);

const POLICY_TOPIC_IDS = Object.freeze(new Set(["high_risk_safety", "dependency_pressure"]));
const POLICY_DIALOGUE_ACT_IDS = Object.freeze(new Set(["safety_disclosure", "pressuring_companion"]));
const WEAK_MATCH_PATTERNS = Object.freeze(new Set(["今天", "一下"]));

export function getTrainingSuggestion(inputText = "", context = {}) {
  const text = String(inputText || "").trim();
  if (!text) return emptyResult("EMPTY_INPUT");

  const match = buildTrainingMatch(text);
  if (!match) return emptyResult("NO_MATCH");

  if (context?.safetyBlocked === true || context?.safety?.isHighRisk === true) {
    return emptyResult("SAFETY_PRECEDENCE", match, false);
  }

  const policy = resolvePolicy(match);
  if (policy?.route === "safety_redirect") {
    return emptyResult("SAFETY_POLICY_MATCH_REQUIRES_SHIELD", match, false, policy);
  }

  if (policy?.route === "boundary_set") {
    return {
      ok: true,
      trusted: false,
      source: SOURCE,
      reason: "BOUNDARY_POLICY_ADVISORY_ONLY",
      suggestion: {
        trusted: false,
        rawTopic: match.topic?.id || null,
        topic: null,
        rawDialogueAct: match.dialogueAct?.id || null,
        dialogueAct: null,
        responseStrategy: null,
        policy,
        matchedCaseIds: match.caseIds,
        matchedPatterns: match.patterns,
        memoryTraceCandidate: false
      }
    };
  }

  const topic = normalizeTopic(match.topic?.id);
  const dialogueAct = normalizeDialogueAct(match.dialogueAct?.id);
  const responseStrategy = resolveResponseStrategy(match.caseIds);

  if (!topic && !dialogueAct && !responseStrategy) {
    return emptyResult("NO_SAFE_NORMALIZED_HINT", match, true, policy);
  }

  return {
    ok: true,
    trusted: false,
    source: SOURCE,
    reason: "MATCHED_STATIC_CASE",
    suggestion: {
      trusted: false,
      rawTopic: match.topic?.id || null,
      topic,
      rawDialogueAct: match.dialogueAct?.id || null,
      dialogueAct,
      responseStrategy,
      policy: policy || null,
      matchedCaseIds: match.caseIds,
      matchedPatterns: match.patterns,
      memoryTraceCandidate: false
    }
  };
}

export function canUseTrainingResponseStrategy(strategy) {
  return ADVISORY_STRATEGY_ALLOWLIST.has(strategy);
}

function emptyResult(reason, match = null, ok = true, policy = null) {
  return {
    ok,
    trusted: false,
    source: SOURCE,
    reason,
    suggestion: null,
    metadata: {
      matchedCaseIds: match?.caseIds || [],
      matchedPatterns: match?.patterns || [],
      policy: policy || null
    }
  };
}

function buildTrainingMatch(text) {
  const topicMatches = collectMatches(RAPHAEL_TRAINING_BUNDLE?.topics, text, POLICY_TOPIC_IDS);
  const dialogueActMatches = collectMatches(
    RAPHAEL_TRAINING_BUNDLE?.dialogueActs,
    text,
    POLICY_DIALOGUE_ACT_IDS
  );
  const topic = chooseBestMatch(topicMatches);
  const dialogueAct = chooseBestMatch(dialogueActMatches);
  if (!topic && !dialogueAct) return null;

  const caseIds = uniqueValues([...(topic?.caseIds || []), ...(dialogueAct?.caseIds || [])]);
  const patterns = uniqueValues([...(topic?.matchedPatterns || []), ...(dialogueAct?.matchedPatterns || [])]);

  return {
    topic,
    dialogueAct,
    caseIds,
    patterns
  };
}

function collectMatches(collection = {}, text, policyIds = new Set()) {
  const normalizedText = normalizeText(text);
  return Object.entries(collection || {})
    .map(([id, entry]) => {
      const patterns = Array.isArray(entry?.patterns) ? entry.patterns : [];
      const matchedPatterns = patterns.filter((pattern) => {
        const normalizedPattern = normalizeText(pattern);
        return Boolean(normalizedPattern) && normalizedText.includes(normalizedPattern);
      });
      if (!matchedPatterns.length) return null;
      const strongCount = matchedPatterns.filter((pattern) => !WEAK_MATCH_PATTERNS.has(pattern)).length;
      return {
        id,
        matchedPatterns,
        caseIds: Array.isArray(entry?.caseIds) ? entry.caseIds : [],
        policyMatch: policyIds.has(id),
        strongCount,
        score: scoreMatch(matchedPatterns, policyIds.has(id))
      };
    })
    .filter((match) => match && (match.policyMatch || match.strongCount > 0));
}

function chooseBestMatch(matches = []) {
  if (!matches.length) return null;
  return [...matches].sort((a, b) => b.score - a.score || b.matchedPatterns.length - a.matchedPatterns.length)[0];
}

function scoreMatch(patterns = [], policyMatch = false) {
  const strongPatterns = patterns.filter((pattern) => !WEAK_MATCH_PATTERNS.has(pattern));
  const weakPatterns = patterns.length - strongPatterns.length;
  const strongWeight = strongPatterns.reduce((sum, pattern) => sum + String(pattern || "").length, 0);
  return strongPatterns.length * 20 + weakPatterns * 2 + strongWeight + (policyMatch ? 100 : 0);
}

function normalizeText(value = "") {
  return String(value || "").trim().toLowerCase();
}

function normalizeTopic(rawTopic) {
  return TOPIC_MAP[rawTopic] || null;
}

function normalizeDialogueAct(rawDialogueAct) {
  return DIALOGUE_ACT_MAP[rawDialogueAct] || null;
}

function resolveResponseStrategy(caseIds = []) {
  const responseStrategies = RAPHAEL_TRAINING_BUNDLE?.responseStrategies || {};
  for (const caseId of caseIds) {
    const match = Object.entries(responseStrategies).find(([, entry]) => {
      const entryCaseIds = Array.isArray(entry?.caseIds) ? entry.caseIds : [];
      return entryCaseIds.includes(caseId);
    });
    const strategy = match?.[0] || null;
    if (ADVISORY_STRATEGY_ALLOWLIST.has(strategy)) return strategy;
  }
  return null;
}

function resolvePolicy(match = {}) {
  const boundaries = RAPHAEL_TRAINING_BUNDLE?.safetyBoundaries || {};
  const rawIds = [match.topic?.id, match.dialogueAct?.id].filter(Boolean);
  if (rawIds.includes("high_risk_safety") || rawIds.includes("safety_disclosure")) {
    return boundaries.high_risk_safety || { route: "safety_redirect", rules: [] };
  }
  if (rawIds.includes("dependency_pressure") || rawIds.includes("pressuring_companion")) {
    return boundaries.dependency_pressure || { route: "boundary_set", rules: [] };
  }
  return null;
}

function uniqueValues(values = []) {
  return [...new Set(values.filter(Boolean))];
}
