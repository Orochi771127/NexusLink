import { getRecentVariantIds } from "./dialogueStateTracker.js";
import { getStrategyVariantLines, buildStrategyVariantMeta } from "../nlu/nluReplyBuilder.js";
import { listResponsePackVariants } from "../corpus/responsePackSelector.js";
import { RESPONSE_STRATEGIES } from "../responseStrategySelector.js";
import { HEARTSPARK_COUNCIL_COMPANION_IDS } from "../../data/ai/heartsparkCouncilVoicePacks.js";

// 情緒陪伴類策略：用字面字串（避免循環依賴時 RESPONSE_STRATEGIES 尚未就緒）。
const COMPANION_VOICE_STRATEGIES = Object.freeze(
  new Set([
    "contextual_ack",
    "emotional_short",
    "holding_space",
    "quiet_presence",
    "short_validation"
  ])
);

const HEARTSPARK_VOICE_IDS = Object.freeze(new Set(HEARTSPARK_COUNCIL_COMPANION_IDS));

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

  // guarded_acknowledge 與 acknowledge 共用情緒 pack，否則五席 voice 會整段落空。
  const packReaction =
    plan.mode === "guarded_acknowledge" ? "acknowledge" : plan.mode || "acknowledge";

  const packVariants = listResponsePackVariants({
    corpus: corpus || {},
    companionId,
    emotion: analysis.emotionKey || "calm",
    intent: intent.intent || "",
    reaction: packReaction,
    state,
    semanticSoul,
    recoveryContext
  });

  // 心輝正式五席：情緒策略下把 voice pack 併入候選並提高分數，讓玩家「聽得出是誰」。
  // 灰影貓維持既有 NLU 優先（holdout／訓練語料以灰影為主），不改其預設行為。
  const preferCompanionVoice =
    HEARTSPARK_VOICE_IDS.has(companionId) &&
    packVariants.length > 0 &&
    COMPANION_VOICE_STRATEGIES.has(strategy);

  let candidates = nluVariants.length ? nluVariants : packVariants;
  if (preferCompanionVoice) {
    candidates = [...packVariants, ...nluVariants];
  }
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
      score: scoreVariant(item, { preferred, topic, strategy, preferCompanionVoice })
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
      : preferCompanionVoice && picked?.replySource === "response_pack"
        ? "companion_voice_pack"
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

function scoreVariant(variant, { preferred, topic, strategy, preferCompanionVoice = false }) {
  let score = 0;
  // 心輝五席：物種 voice pack 必須壓過 NLU 的 preferred/topic 加分，才進得了遊戲對話。
  if (preferCompanionVoice && variant.replySource === "response_pack") score += 8;
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