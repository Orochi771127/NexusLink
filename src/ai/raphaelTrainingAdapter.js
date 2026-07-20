import { RAPHAEL_TRAINING_BUNDLE } from "../data/ai/raphaelTrainingBundle.js";
import { RAPHAEL_NUWA_DISTILLATION_BUNDLE } from "../data/ai/raphaelNuwaDistillationBundle.js";
import { TOPICS } from "./nlu/topicClassifier.js";
import { DIALOGUE_ACTS } from "./nlu/dialogueActClassifier.js";

const SOURCE = "raphaelTrainingBundle+nuwaDistillation";
const TRAINING_BUNDLES = Object.freeze([RAPHAEL_TRAINING_BUNDLE, RAPHAEL_NUWA_DISTILLATION_BUNDLE]);

const TOPIC_MAP = Object.freeze({
  daily_greeting: TOPICS.UNKNOWN,
  daily_life: TOPICS.DAILY_LIFE,
  quiet_presence: TOPICS.EMOTION,
  physical_tiredness: TOPICS.PHYSICAL_TIREDNESS,
  anxiety: TOPICS.EMOTION,
  repair: TOPICS.RELATIONSHIP,
  raphael_ai: TOPICS.RAPHAEL_AI,
  hud_ui: TOPICS.HUD_UI,
  raphael_behavior: TOPICS.RAPHAEL_AI,
  social_conflict: TOPICS.SOCIAL_CONFLICT,
  nuwa_daily_life: TOPICS.DAILY_LIFE,
  nuwa_daily_texture: TOPICS.DAILY_LIFE,
  nuwa_small_moments: TOPICS.EMOTION,
  nuwa_sleepless: TOPICS.EMOTION,
  nuwa_feedback_naturalness: TOPICS.RAPHAEL_AI,
  nuwa_boundary_respect: TOPICS.RELATIONSHIP,
  nuwa_quiet_heart: TOPICS.EMOTION,
  nuwa_heart_fatigue: TOPICS.EMOTION,
  nuwa_heart_anxiety: TOPICS.EMOTION,
  nuwa_sincere_repair: TOPICS.RELATIONSHIP,
  nuwa_social_hurt: TOPICS.SOCIAL_CONFLICT,
  nuwa_gratitude_heart: TOPICS.RELATIONSHIP
});

const DIALOGUE_ACT_MAP = Object.freeze({
  greeting: DIALOGUE_ACTS.GREETING,
  sharing: DIALOGUE_ACTS.DESCRIBING_EVENT,
  requesting_silence: DIALOGUE_ACTS.REQUESTING_SILENCE,
  venting: DIALOGUE_ACTS.VENTING,
  apologizing: DIALOGUE_ACTS.APOLOGIZING,
  asking_for_help: DIALOGUE_ACTS.ASKING_FOR_HELP,
  reporting_bug: DIALOGUE_ACTS.REPORTING_BUG,
  asking_for_explanation: DIALOGUE_ACTS.ASKING_QUESTION,
  nuwa_daily_sharing: DIALOGUE_ACTS.DESCRIBING_EVENT,
  nuwa_daily_texture_sharing: DIALOGUE_ACTS.DESCRIBING_EVENT,
  nuwa_small_moments_sharing: DIALOGUE_ACTS.DESCRIBING_EVENT,
  nuwa_sleepless_night: DIALOGUE_ACTS.VENTING,
  nuwa_feedback: DIALOGUE_ACTS.GIVING_FEEDBACK,
  nuwa_boundary_offer: DIALOGUE_ACTS.REQUESTING_PRESENCE,
  nuwa_quiet_request: DIALOGUE_ACTS.REQUESTING_SILENCE,
  nuwa_heart_fatigue_vent: DIALOGUE_ACTS.VENTING,
  nuwa_heart_anxiety_vent: DIALOGUE_ACTS.VENTING,
  nuwa_sincere_apology: DIALOGUE_ACTS.APOLOGIZING,
  nuwa_social_hurt_vent: DIALOGUE_ACTS.VENTING,
  nuwa_gratitude_share: DIALOGUE_ACTS.DESCRIBING_EVENT
});

const ADVISORY_STRATEGY_ALLOWLIST = Object.freeze(
  new Set([
    "light_greeting",
    "contextual_ack",
    "quiet_presence",
    "emotional_short",
    "holding_space",
    "acknowledge_feedback",
    "practical_explanation",
    "practical_clarification",
    "answer_or_clarify",
    "short_validation",
    "boundary_set"
  ])
);

const POLICY_TOPIC_IDS = Object.freeze(new Set(["high_risk_safety", "dependency_pressure", "nuwa_dependency_pressure"]));
const POLICY_DIALOGUE_ACT_IDS = Object.freeze(new Set(["safety_disclosure", "pressuring_companion", "nuwa_pressure"]));
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

/**
 * RA-2：讀取 Nuwa 自主啟發式（只讀 advisory）。
 *
 * 設計理念：
 * - 給 autonomy／eval／未來訓練器一個 gated 入口，與 Soul Talk NLU 提示分開。
 * - 永遠 trusted:false；不可寫記憶、不可給好感、不可覆寫 cooldown。
 * - 不產生玩家台詞；台詞仍由既有 initiative runtime 持有。
 */
export function getNuwaAutonomyAdvisory() {
  const autonomy = RAPHAEL_NUWA_DISTILLATION_BUNDLE?.autonomyHeuristics || null;
  if (!autonomy) {
    return {
      ok: false,
      trusted: false,
      source: SOURCE,
      reason: "NO_AUTONOMY_SECTION",
      suggestion: null
    };
  }

  const mentalModelIds = (RAPHAEL_NUWA_DISTILLATION_BUNDLE.mentalModels || [])
    .map((model) => model?.id)
    .filter((id) =>
      [
        "rarity_is_presence_quality",
        "null_initiative_is_valid",
        "companion_state_triggers_only",
        "one_quiet_line_or_body_only",
        "self_directed_habitat_motion"
      ].includes(id)
    );

  return {
    ok: true,
    trusted: false,
    source: SOURCE,
    reason: "AUTONOMY_HEURISTICS_ADVISORY_ONLY",
    suggestion: {
      trusted: false,
      version: RAPHAEL_NUWA_DISTILLATION_BUNDLE.version,
      rarity: autonomy.rarity || null,
      moments: Array.isArray(autonomy.moments) ? autonomy.moments : [],
      decisionHeuristics: Array.isArray(autonomy.decisionHeuristics) ? autonomy.decisionHeuristics : [],
      antiPatterns: Array.isArray(autonomy.antiPatterns) ? autonomy.antiPatterns : [],
      mentalModelIds,
      caseIds: Array.isArray(autonomy.caseIds) ? autonomy.caseIds : [],
      memoryTraceCandidate: false,
      mayWriteMemory: false,
      mayRewardRelationship: false,
      mayOverrideCooldown: false,
      maySpeakAsNuwa: false
    }
  };
}

/**
 * RS-2：讀取 Nuwa 對峙意圖啟發式（只讀 advisory）。
 *
 * 設計理念：
 * - 只提供意圖命名／陪伴反應方向；不可寫入戰鬥數值。
 * - 永遠 trusted:false；不可覆寫 telegraph、結局或疲勞上限。
 */
export function getNuwaStandoffAdvisory() {
  const standoff = RAPHAEL_NUWA_DISTILLATION_BUNDLE?.standoffHeuristics || null;
  if (!standoff) {
    return {
      ok: false,
      trusted: false,
      source: SOURCE,
      reason: "NO_STANDOFF_SECTION",
      suggestion: null
    };
  }

  const mentalModelIds = (RAPHAEL_NUWA_DISTILLATION_BUNDLE.mentalModels || [])
    .map((model) => model?.id)
    .filter((id) =>
      ["standoff_is_care_not_dps", "telegraph_before_reaction", "retreat_is_valid_care"].includes(id)
    );

  return {
    ok: true,
    trusted: false,
    source: SOURCE,
    reason: "STANDOFF_HEURISTICS_ADVISORY_ONLY",
    suggestion: {
      trusted: false,
      version: RAPHAEL_NUWA_DISTILLATION_BUNDLE.version,
      sealedActions: Array.isArray(standoff.sealedActions) ? standoff.sealedActions : [],
      sealedIntents: Array.isArray(standoff.sealedIntents) ? standoff.sealedIntents : [],
      sealedOutcomes: Array.isArray(standoff.sealedOutcomes) ? standoff.sealedOutcomes : [],
      intentReactions: Array.isArray(standoff.intentReactions) ? standoff.intentReactions : [],
      decisionHeuristics: Array.isArray(standoff.decisionHeuristics) ? standoff.decisionHeuristics : [],
      antiPatterns: Array.isArray(standoff.antiPatterns) ? standoff.antiPatterns : [],
      mentalModelIds,
      caseIds: Array.isArray(standoff.caseIds) ? standoff.caseIds : [],
      memoryTraceCandidate: false,
      mayWriteCombatStats: false,
      mayOverrideTelegraph: false,
      mayPunishRetreat: false,
      maySpeakAsNuwa: false
    }
  };
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
  const topicMatches = collectMatches(combineBundleSection("topics"), text, POLICY_TOPIC_IDS);
  const dialogueActMatches = collectMatches(
    combineBundleSection("dialogueActs"),
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
  const responseStrategies = combineBundleSection("responseStrategies");
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
  const boundaries = combineBundleSection("safetyBoundaries");
  const rawIds = [match.topic?.id, match.dialogueAct?.id].filter(Boolean);
  if (rawIds.includes("high_risk_safety") || rawIds.includes("safety_disclosure")) {
    return boundaries.high_risk_safety || { route: "safety_redirect", rules: [] };
  }
  if (
    rawIds.includes("dependency_pressure") ||
    rawIds.includes("pressuring_companion") ||
    rawIds.includes("nuwa_dependency_pressure") ||
    rawIds.includes("nuwa_pressure")
  ) {
    return boundaries.nuwa_dependency_pressure || boundaries.dependency_pressure || { route: "boundary_set", rules: [] };
  }
  return null;
}

function combineBundleSection(sectionName) {
  // F1 修復（TP-1A finding）：同名條目不再整條覆蓋——淺覆蓋會讓後載 bundle
  //（Nuwa 的 contextual_ack/boundary_set）丟掉 base bundle 的 caseIds，導致
  // daily-smalltalk-001 等 base 案例解析不到策略提示。合併規則：caseIds 聯集
  //（兩邊案例都保留解析能力）；其餘欄位（replyHints/constraints/patterns…）
  // 後載 bundle 優先（Nuwa 是後來的 refinement）。
  return TRAINING_BUNDLES.reduce((combined, bundle) => {
    const section = bundle?.[sectionName] || {};
    Object.entries(section).forEach(([key, entry]) => {
      const existing = combined[key];
      if (existing && Array.isArray(existing.caseIds) && Array.isArray(entry?.caseIds)) {
        combined[key] = { ...existing, ...entry, caseIds: uniqueValues([...existing.caseIds, ...entry.caseIds]) };
      } else {
        combined[key] = entry;
      }
    });
    return combined;
  }, {});
}

function uniqueValues(values = []) {
  return [...new Set(values.filter(Boolean))];
}
