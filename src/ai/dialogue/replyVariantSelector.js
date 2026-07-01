import { getRecentVariantIds } from "./dialogueStateTracker.js";
import { getStrategyVariantLines, buildStrategyVariantMeta } from "../nlu/nluReplyBuilder.js";
import { listResponsePackVariants } from "../corpus/responsePackSelector.js";
import { RESPONSE_STRATEGIES } from "../responseStrategySelector.js";

export function selectReplyVariant({
  responseStrategy = null,
  nlu = {},
  dialogueState = {},
  corpus = null,
  companionId = "greyshade-cat",
  analysis = {},
  intent = {},
  plan = {},
  state = {},
  semanticSoul = {},
  recoveryContext = null,
  seed = 0
} = {}) {
  const strategy = responseStrategy?.strategy || responseStrategy || RESPONSE_STRATEGIES.CONTEXTUAL_ACK;
  const frame = nlu.semanticFrame || {};
  const recentVariantIds = getRecentVariantIds(dialogueState, 4);
  const recentOpenings = getRecentOpeningPhrases(dialogueState, 3);

  const nluVariants = buildStrategyVariantMeta({
    strategy,
    nlu,
    semanticFrame: frame,
    recoveryContext
  });

  const packVariants = listResponsePackVariants({
    corpus: corpus || {},
    companionId,
    emotion: analysis.emotionKey || "calm",
    intent: intent.intent || "",
    reaction: plan.mode || "acknowledge",
    state,
    semanticSoul,
    recoveryContext
  });

  let candidates = nluVariants.length ? nluVariants : packVariants;
  if (!candidates.length) {
    candidates = [
      {
        variantId: `strategy:${strategy}:0`,
        variantIndex: 0,
        replySource: "nlu_builder",
        openingPhrase: ""
      }
    ];
  }

  const avoidedVariants = recentVariantIds.filter((id) => candidates.some((item) => item.variantId === id));

  let filtered = candidates.filter((item) => !recentVariantIds.includes(item.variantId));
  if (!filtered.length) {
    filtered = candidates;
  }

  filtered = filtered.filter((item) => {
    const opening = normalizeOpening(item.openingPhrase);
    return !opening || !recentOpenings.includes(opening);
  });
  if (!filtered.length) {
    filtered = candidates;
  }

  const preferred = frame.preferredResponse || nlu.preferredResponse || "";
  const topic = frame.topic || nlu.topic || "unknown";
  const scored = filtered
    .map((item) => ({
      ...item,
      score: scoreVariant(item, { preferred, topic, strategy })
    }))
    .sort((left, right) => right.score - left.score);

  const bestScore = scored[0]?.score ?? 0;
  const top = scored.filter((item) => item.score === bestScore);
  const picked = top[Math.abs(seed) % top.length];

  const variationReason =
    avoidedVariants.length && filtered.length < candidates.length
      ? filtered.length < candidates.length && filtered.every((item) => recentVariantIds.includes(item.variantId))
        ? "fallback_all_variants_recent"
        : "avoided_recent_variants"
      : "preferred_topic_match";

  return {
    strategy,
    variantId: picked.variantId,
    variantIndex: picked.variantIndex ?? 0,
    replySource: picked.replySource || "nlu_builder",
    packId: picked.packId || null,
    lineIndex: picked.lineIndex ?? null,
    variationReason,
    avoidedVariants,
    candidateCount: candidates.length
  };
}

function scoreVariant(variant, { preferred, topic, strategy }) {
  let score = 0;
  if (variant.replySource === "nlu_builder") score += 1;
  if (preferred && String(variant.variantId || "").includes(preferred)) score += 2;
  if (topic !== "unknown" && variant.topic === topic) score += 1.5;
  if (String(variant.variantId || "").startsWith(`strategy:${strategy}:`)) score += 0.5;
  return score;
}

function getRecentOpeningPhrases(dialogueState = {}, n = 3) {
  const turns = Array.isArray(dialogueState.recentTurns) ? dialogueState.recentTurns : [];
  return turns
    .slice(-n)
    .map((turn) => normalizeOpening(turn.openingPhrase || extractOpeningFromReply(turn.reply)))
    .filter(Boolean);
}

function extractOpeningFromReply(reply = "") {
  return String(reply || "").split(/[。！？]/)[0].trim().slice(0, 14);
}

function normalizeOpening(phrase = "") {
  return String(phrase || "").trim().slice(0, 14);
}

export { getRecentOpeningPhrases, normalizeOpening, extractOpeningFromReply };