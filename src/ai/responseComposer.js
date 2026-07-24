import { SOUL_TALK_INTENTS } from "./intentClassifier.js";
import { SOUL_TALK_REACTIONS } from "./reactionPlanner.js";
import { buildSafetyRedirectReply } from "./safetyShield.js";
import { buildCautionHarborReply, shouldUseCautionHelpExit } from "../engine/safeHarborMode.js";
import { selectResponsePackLine, selectResponsePackAtVariant } from "./corpus/responsePackSelector.js";
import { renderTemplateReply } from "./corpus/templateRenderer.js";
import { RESPONSE_STRATEGIES } from "./responseStrategySelector.js";
import { buildStrategyReply, repairGenericReply } from "./nlu/nluReplyBuilder.js";
import { critiqueGenericReply } from "./eval/genericReplyCritic.js";
import { weaveExplicitReference } from "./nlu/explicitReference.js";
import { shouldSuppressExplicitReference } from "./eval/constitutionCritic.js";
import { buildPrefilledSpecificDetail } from "./nlu/specificDetailExtractor.js";
import { replyReferencesDetail } from "./nlu/explicitReference.js";
import { buildPrefillGroundingPlan, downgradePrefillGroundingPlan } from "./dialogue/prefillGrounding.js";
import { getReferenceText, hasValidPrefill } from "./dialogue/quickReplyContext.js";
import { buildBoundaryPolicyReply } from "./dialogue/boundaryReplyPolicy.js";
import {
  buildConversationalAnswer,
  buildConversationalReaction,
  matchesEverydayChatGrounding
} from "./dialogue/conversationAnswerPolicy.js";
import { applyCareGuideToReply } from "./dialogue/careGuidePolicy.js";
import { retrieveSoftAnchorAllusion } from "./dialogue/companionAnchorPolicy.js";
import { getDialogueState } from "./dialogue/dialogueStateTracker.js";

const BOUNDARY_MODES = new Set([
  SOUL_TALK_REACTIONS.WITHDRAW,
  SOUL_TALK_REACTIONS.REJECT,
  SOUL_TALK_REACTIONS.HESITATE
]);

const COMFORT_BLOCK_STRATEGIES = new Set([
  RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION,
  RESPONSE_STRATEGIES.ACKNOWLEDGE_GENERIC_FAILURE,
  RESPONSE_STRATEGIES.PRACTICAL_EXPLANATION,
  RESPONSE_STRATEGIES.PRACTICAL_PLANNING,
  RESPONSE_STRATEGIES.QUIET_PRESENCE
]);

function applyPersonaStyle(text, persona = {}) {
  const style = persona.sentenceStyle || "balanced";
  if (style !== "short_quiet") return text;

  const parts = String(text || "")
    .split(/[\n。！？]/)
    .map((part) => part.trim())
    .filter(Boolean);

  const maxSentences = persona.responseBias?.maxSentences || 2;
  return parts.slice(0, maxSentences).join("。") + (parts.length ? "。" : "");
}

function returnComposeResult(text, meta, guardArgs) {
  const nlu = guardArgs.nlu || guardArgs.composeOpts?.nlu || null;
  const inputText = nlu?.inputText || guardArgs.composeOpts?.inputText || "";
  const seed =
    String(text || "").length +
    Math.round(guardArgs.state?.trust || 0) +
    String(inputText).length;

  // 薄開場先換成主動關心整句；標記 care_guide 以免 critic 覆寫手寫引導。
  const careOpen = applyCareGuideToReply(text, {
    inputText,
    reply: text,
    nlu,
    responseStrategy: guardArgs.composeOpts?.responseStrategy,
    safety: guardArgs.composeOpts?.safety,
    replySource: meta.replySource || null,
    seed,
    previousReply: guardArgs.previousReply || "",
    openOnly: true
  });
  const usedCareOpen = Boolean(careOpen && careOpen !== text);
  const baseText = usedCareOpen ? careOpen : text;
  const replySource = usedCareOpen
    ? "care_guide"
    : meta.replySource || guardArgs.composeOpts?.replySource || null;

  const nextArgs = {
    ...guardArgs,
    composeOpts: {
      ...(guardArgs.composeOpts || {}),
      // 讓 finalize 知道這句是物種 voice pack／safety／關心引導，勿用通用 NLU 覆寫。
      replySource
    }
  };
  let reply = finalizeAndGuardReply(baseText, nextArgs);

  // 傾訴／情緒句：在定稿後再織「輕輕引導」，避免被 critic／repair 洗掉。
  let careGuided = usedCareOpen;
  if (!usedCareOpen) {
    const guided = applyCareGuideToReply(reply, {
      inputText,
      reply,
      nlu,
      responseStrategy: guardArgs.composeOpts?.responseStrategy,
      safety: guardArgs.composeOpts?.safety,
      replySource: meta.replySource || null,
      seed,
      weaveOnly: true
    });
    if (guided !== reply) {
      reply = finalizeReply(guided, nextArgs.persona, nextArgs.state, nextArgs.composeOpts);
      careGuided = true;
      nextArgs.composeOpts.replySource = nextArgs.composeOpts.replySource || "care_guide";
    }
  }

  // 跨場錨點輕提：平常相關話題最多織一句；不問「還記得」、不改 voice pack／safety。
  let softAnchored = false;
  if (
    !usedCareOpen &&
    !["safety", "response_pack", "template"].includes(String(replySource || meta.replySource || "")) &&
    !guardArgs.composeOpts?.safety?.isHighRisk &&
    !guardArgs.composeOpts?.safety?.isBoundaryPressure &&
    nlu?.dialogueAct !== "asking_memory" &&
    !/還記得|想得起/.test(inputText)
  ) {
    const sessionKey =
      guardArgs.state?.activeCompanionId || guardArgs.composeOpts?.companionId || "default";
    const dialogueState = getDialogueState(sessionKey);
    const soft = retrieveSoftAnchorAllusion(inputText, guardArgs.state?.companionAnchors || [], {
      skipKey: dialogueState.lastSoftAnchorKey
    });
    if (soft?.weaveLine && !String(reply).includes(soft.softLabel || soft.key)) {
      const base = String(reply || "").trim().replace(/[。.!！]+$/, "");
      reply = finalizeReply(
        `${base}——${soft.weaveLine}`,
        nextArgs.persona,
        nextArgs.state,
        nextArgs.composeOpts
      );
      dialogueState.lastSoftAnchorKey = soft.key;
      softAnchored = true;
    }
  }

  const prefillMeta = nextArgs.composeOpts?.prefillMeta || {};
  return {
    reply,
    variantId: meta.variantId || null,
    replySource: nextArgs.composeOpts.replySource || meta.replySource || "unknown",
    openingPhrase: meta.openingPhrase || extractOpeningPhrase(reply),
    variationReason:
      meta.variationReason ||
      (careGuided ? "care_guide" : null) ||
      (softAnchored ? "soft_anchor" : null),
    usedPrefillDetail: prefillMeta.usedPrefillDetail || null,
    groundedByPrefill: Boolean(prefillMeta.groundedByPrefill)
  };
}

function extractOpeningPhrase(text = "") {
  return String(text || "").split(/[。！？]/)[0].trim().slice(0, 14);
}

function composeMetaFromSelection(variantSelection, reply, overrides = {}) {
  return {
    variantId: variantSelection?.variantId || overrides.variantId || null,
    replySource: variantSelection?.replySource || overrides.replySource || "nlu_builder",
    openingPhrase: extractOpeningPhrase(reply),
    variationReason: variantSelection?.variationReason || null,
    ...overrides
  };
}

function guardArgs(persona, state, composeOpts, nlu) {
  return {
    persona,
    state,
    composeOpts,
    nlu,
    previousReply: getPreviousCompanionReply(state)
  };
}

export function composeRaphaelReply({
  inputText = "",
  analysis = {},
  intent = {},
  plan = {},
  safety = {},
  state = {},
  companion = null,
  persona = null,
  corpus = null,
  corpusHits = null,
  semanticSoul = {},
  recoveryContext = null,
  actionPlan = {},
  replyMode = "",
  nlu = null,
  responseStrategy = null,
  variantSelection = null
} = {}) {
  const composeOpts = {
    recoveryRecall: Boolean(recoveryContext?.allowsExplicitReference && recoveryContext?.canRecall),
    recallMode: recoveryContext?.recallMode || "none",
    replyMode: replyMode || actionPlan.replyMode || "",
    nlu,
    responseStrategy,
    recoveryContext,
    safety,
    // 主動關心引導需要原始輸入；nlu.inputText 不一定有填。
    inputText
  };

  const args = guardArgs(persona, state, composeOpts, nlu);

  if (plan.mode === SOUL_TALK_REACTIONS.SAFETY_REDIRECT) {
    return returnComposeResult(buildSafetyRedirectReply(safety), { variantId: "safety:redirect", replySource: "safety" }, args);
  }

  // Caution safe_harbor：鎖一則含現實求助出口的固定文案（2026-07-22 playtest Q26）。
  // 不升級 high-risk terminal，也不給關係獎勵；關係問句「你會不會消失」不走這條。
  if (
    safety?.action === "safe_harbor" &&
    !safety?.isHighRisk &&
    shouldUseCautionHelpExit(inputText)
  ) {
    return returnComposeResult(
      buildCautionHarborReply(),
      { variantId: "safety:caution_harbor", replySource: "safety" },
      args
    );
  }

  const seed = buildSeed(inputText, state, companion);
  const emotionKey = analysis.emotionKey || "calm";
  const mode = plan.mode || actionPlan.reaction || SOUL_TALK_REACTIONS.ACKNOWLEDGE;
  // guarded_acknowledge 與 acknowledge 共用情緒 voice pack（物種語氣不因防備語氣而消失）。
  const packReaction = mode === SOUL_TALK_REACTIONS.GUARDED_ACKNOWLEDGE ? SOUL_TALK_REACTIONS.ACKNOWLEDGE : mode;
  const companionId = companion?.id || persona?.companionId || "greyshade-cat";
  const loadedCorpus = corpus || {};
  const strategy = responseStrategy?.strategy || RESPONSE_STRATEGIES.CONTEXTUAL_ACK;
  const blockComfort = shouldBlockComfortPacks(nlu, strategy);

  if (BOUNDARY_MODES.has(mode)) {
    if (safety?.category === "dependency_pressure") {
      return returnComposeResult(
        buildBoundaryPolicyReply(safety),
        { variantId: safety.boundaryCarryover ? "boundary:carryover" : "safety:dependency", replySource: "safety" },
        args
      );
    }
    const boundaryLine = selectResponsePackLine({
      corpus: loadedCorpus,
      companionId,
      emotion: "boundary",
      intent: intent.intent,
      reaction: mode,
      state,
      semanticSoul,
      recoveryContext,
      seed
    });
    if (boundaryLine.line) {
      return returnComposeResult(
        boundaryLine.line,
        { variantId: boundaryLine.packId ? `pack:${boundaryLine.packId}` : "pack:boundary", replySource: "response_pack" },
        args
      );
    }
    const boundaryFallback =
      mode === SOUL_TALK_REACTIONS.WITHDRAW
        ? "我聽見你很需要靠近。但我不能教你怎麼更依賴我，也不能接受被長期綁住——我會先退後一點。"
        : mode === SOUL_TALK_REACTIONS.REJECT
          ? "這樣的靠近太快了。"
          : "我需要一點距離，才能好好聽你。";
    return returnComposeResult(
      boundaryFallback,
      { variantId: `boundary:${mode}`, replySource: "nlu_builder" },
      args
    );
  }

  if (
    strategy === RESPONSE_STRATEGIES.MEMORY_REFERENCE &&
    (composeOpts.recoveryRecall || nlu?.dialogueAct === "asking_memory")
  ) {
    const awakeningReply = buildStrategyReply({
      strategy,
      nlu,
      semanticFrame: nlu?.semanticFrame,
      seed,
      recoveryContext,
      variantIndex: variantSelection?.variantIndex
    });
    if (awakeningReply) {
      return returnComposeResult(awakeningReply, composeMetaFromSelection(variantSelection, awakeningReply), args);
    }

    const templateReply = renderTemplateReply({
      corpus: loadedCorpus,
      companionId,
      recoveryContext,
      analysis,
      reaction: mode,
      seed
    });
    if (templateReply?.text) {
      return returnComposeResult(
        templateReply.text,
        { variantId: templateReply.templateId ? `template:${templateReply.templateId}` : "template:recovery", replySource: "template" },
        args
      );
    }
  }

  // 具體日常／一般人常聊主題優先於寂寞等通用 voice pack。
  const dailyFrame = nlu?.semanticFrame || {};
  const dailySeed = buildSeed(inputText, state, companion);
  const everydayCue = matchesEverydayChatGrounding(inputText);
  const concreteDaily =
    buildConversationalReaction({ inputText, frame: dailyFrame, seed: dailySeed }) ||
    (
      everydayCue ||
      /午安|晚上好|不知道想吃|你今天過得怎麼樣|晚餐|午餐|早餐|好聽的歌|該出門|出門還是在家/.test(
        String(inputText || "")
      )
        ? buildConversationalAnswer({ inputText, frame: dailyFrame, seed: dailySeed })
        : null
    );
  if (concreteDaily && (everydayCue || /午安|晚上好|晚餐.*想法|想吃點熱/.test(String(inputText || "")))) {
    return returnComposeResult(
      concreteDaily,
      { variantId: "daily:grounded", replySource: "nlu_builder", variationReason: "daily_life_grounding" },
      args
    );
  }

  // 心輝五席等：variant 已選 response_pack 時，先落 pack，避免通用 NLU 句蓋掉物種語氣。
  if (variantSelection?.replySource === "response_pack" && !blockComfort) {
    const preferredPack =
      variantSelection.packId
        ? selectResponsePackAtVariant({
            corpus: loadedCorpus,
            companionId,
            emotion: emotionKey,
            intent: intent.intent,
            reaction: packReaction,
            state,
            semanticSoul,
            recoveryContext,
            packId: variantSelection.packId,
            lineIndex: variantSelection.lineIndex ?? variantSelection.variantIndex ?? 0
          })
        : selectResponsePackLine({
            corpus: loadedCorpus,
            companionId,
            emotion: emotionKey,
            intent: intent.intent,
            reaction: packReaction,
            state,
            semanticSoul,
            recoveryContext,
            seed: seed + corpusSeedOffset(corpusHits)
          });

    if (preferredPack.line && !preferredPack.silent) {
      return returnComposeResult(
        preferredPack.line,
        composeMetaFromSelection(variantSelection, preferredPack.line, {
          variantId:
            variantSelection?.variantId ||
            (preferredPack.packId ? `pack:${preferredPack.packId}:${preferredPack.lineIndex ?? 0}` : "pack:unknown"),
          replySource: "response_pack"
        }),
        args
      );
    }
  }

  if (strategy !== RESPONSE_STRATEGIES.MEMORY_REFERENCE) {
    const strategyReply = buildStrategyReply({
      strategy,
      nlu,
      semanticFrame: nlu?.semanticFrame,
      seed,
      recoveryContext,
      variantIndex: variantSelection?.variantIndex
    });
    if (strategyReply) {
      // pack 選取失敗時不可沿用 variant 的 response_pack 標籤，否則 UI／eval 會誤判。
      return returnComposeResult(
        strategyReply,
        composeMetaFromSelection(variantSelection, strategyReply, { replySource: "nlu_builder" }),
        args
      );
    }
  }

  if (!blockComfort && !shouldSkipResponsePacks(nlu, strategy)) {
    const packLine =
      variantSelection?.replySource === "response_pack" && variantSelection.packId
        ? selectResponsePackAtVariant({
            corpus: loadedCorpus,
            companionId,
            emotion: emotionKey,
            intent: intent.intent,
            reaction: packReaction,
            state,
            semanticSoul,
            recoveryContext,
            packId: variantSelection.packId,
            lineIndex: variantSelection.lineIndex ?? variantSelection.variantIndex ?? 0
          })
        : selectResponsePackLine({
            corpus: loadedCorpus,
            companionId,
            emotion: emotionKey,
            intent: intent.intent,
            reaction: packReaction,
            state,
            semanticSoul,
            recoveryContext,
            seed: seed + corpusSeedOffset(corpusHits)
          });

    if (packLine.line && !packLine.silent) {
      return returnComposeResult(
        packLine.line,
        composeMetaFromSelection(variantSelection, packLine.line, {
          variantId: variantSelection?.variantId || (packLine.packId ? `pack:${packLine.packId}:${packLine.lineIndex ?? 0}` : "pack:unknown"),
          replySource: "response_pack"
        }),
        args
      );
    }
  }

  if (intent.intent === SOUL_TALK_INTENTS.QUESTION && mode === SOUL_TALK_REACTIONS.ACKNOWLEDGE) {
    const questionReply = buildStrategyReply({
      strategy: RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY,
      nlu,
      semanticFrame: nlu?.semanticFrame,
      seed,
      variantIndex: variantSelection?.variantIndex
    });
    if (questionReply) {
      return returnComposeResult(
        questionReply,
        composeMetaFromSelection(variantSelection, questionReply, {
          variantId: variantSelection?.variantId || `strategy:${RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY}`,
          replySource: "nlu_builder"
        }),
        args
      );
    }
  }

  const fallback = buildStrategyReply({
    strategy: RESPONSE_STRATEGIES.CLARIFYING_QUESTION,
    nlu,
    semanticFrame: nlu?.semanticFrame,
    seed: seed + 3
  });

  return returnComposeResult(
    fallback || "我在。你想我先懂的是哪一段？",
    { variantId: `strategy:${RESPONSE_STRATEGIES.CLARIFYING_QUESTION}`, replySource: "nlu_builder" },
    args
  );
}

export function finalizeAndGuardReply(text, { persona, state, composeOpts, nlu, previousReply }) {
  let reply = finalizeReply(text, persona, state, composeOpts);
  const critique = critiqueGenericReply({
    reply,
    nlu,
    perception: { responseStrategy: composeOpts.responseStrategy },
    state,
    previousReply
  });

  // 物種 voice pack／safety／boundary pack／主動關心引導是手寫語料，critic 失敗時不可用灰影 NLU 覆寫。
  const preserveAuthoredReply = ["response_pack", "safety", "template", "care_guide"].includes(
    composeOpts?.replySource
  );

  if (!critique.pass && !preserveAuthoredReply) {
    reply = composeOpts.safety?.isBoundaryPressure
      ? buildBoundaryPolicyReply(composeOpts.safety)
      : repairGenericReply({
          strategy: composeOpts.responseStrategy?.strategy,
          nlu,
          semanticFrame: nlu?.semanticFrame,
          seed: buildSeed("", state, null),
          recoveryContext: composeOpts.recoveryContext || null,
          previousReply
        });
    reply = finalizeReply(reply, persona, state, composeOpts);
  }

  const weaveStrategy = composeOpts.responseStrategy?.strategy || "";
  const frame = nlu?.semanticFrame || {};
  const prefillContext = nlu?.prefillContext || null;
  let groundingPlan = buildPrefillGroundingPlan(prefillContext);
  groundingPlan = downgradePrefillGroundingPlan(groundingPlan, frame, weaveStrategy);

  composeOpts.prefillMeta = resolvePrefillComposeMeta({
    reply,
    prefillContext,
    groundingPlan,
    weaveStrategy,
    frame
  });

  // 定稿 pack 已含物種意象，再 weave 話題前綴會把五席聽起來像同一句通用安慰。
  if (!preserveAuthoredReply) {
  if (
    groundingPlan.groundedMode === "explicit" &&
    groundingPlan.prefillDetail &&
    !prefillContext?.skipWeave &&
    !shouldSuppressExplicitReference(frame, weaveStrategy)
  ) {
    const prefillDetail = buildPrefilledSpecificDetail(groundingPlan.prefillDetail);
    if (!replyReferencesDetail(reply, prefillDetail)) {
      reply = weaveExplicitReference(reply, prefillDetail, { strategy: weaveStrategy });
      reply = finalizeReply(reply, persona, state, composeOpts);
      composeOpts.prefillMeta = {
        usedPrefillDetail: groundingPlan.prefillDetail,
        groundedByPrefill: true
      };
    }
  } else {
    const specificDetail = frame.specificDetail;
    const shouldWeaveDetail =
      specificDetail?.text &&
      !["light_greeting", "quiet_presence", "holding_space", "memory_reference"].includes(weaveStrategy) &&
      nlu?.dialogueAct !== "greeting" &&
      specificDetail.type !== "clause" &&
      !shouldSuppressExplicitReference(frame, weaveStrategy);

    if (shouldWeaveDetail && !replyReferencesDetail(reply, specificDetail)) {
      reply = weaveExplicitReference(reply, specificDetail, { strategy: weaveStrategy });
      reply = finalizeReply(reply, persona, state, composeOpts);
    }
  }
  }

  if (!composeOpts.prefillMeta?.groundedByPrefill && hasValidPrefill(prefillContext)) {
    const referenceText = getReferenceText(prefillContext);
    if (referenceText && replyReferencesDetail(reply, buildPrefilledSpecificDetail(referenceText))) {
      composeOpts.prefillMeta = {
        usedPrefillDetail: referenceText,
        groundedByPrefill: true
      };
    }
  }

  return reply;
}

function resolvePrefillComposeMeta({ reply, prefillContext, groundingPlan, weaveStrategy, frame }) {
  if (!hasValidPrefill(prefillContext)) {
    return { usedPrefillDetail: null, groundedByPrefill: false };
  }

  const referenceText = getReferenceText(prefillContext);
  if (!referenceText) {
    return { usedPrefillDetail: null, groundedByPrefill: false };
  }

  const referenced = replyReferencesDetail(reply, buildPrefilledSpecificDetail(referenceText));
  if (referenced) {
    return { usedPrefillDetail: referenceText, groundedByPrefill: true };
  }

  if (
    groundingPlan.groundedMode === "soft" ||
    shouldSuppressExplicitReference(frame, weaveStrategy) ||
    prefillContext.skipWeave
  ) {
    return { usedPrefillDetail: referenceText, groundedByPrefill: false };
  }

  return { usedPrefillDetail: referenceText, groundedByPrefill: false };
}

function shouldSkipResponsePacks(nlu, strategy) {
  if (!nlu) return false;
  const topic = nlu.topic || nlu.semanticFrame?.topic || "unknown";
  const band = nlu.confidenceBand || "low";
  const strategic =
    strategy &&
    strategy !== RESPONSE_STRATEGIES.CONTEXTUAL_ACK &&
    strategy !== RESPONSE_STRATEGIES.CLARIFYING_QUESTION;
  if (topic !== "unknown" && (strategic || band !== "low")) return true;
  if ((nlu.nuances || []).length >= 2) return true;
  return false;
}

function shouldBlockComfortPacks(nlu, strategy) {
  const constraints = nlu?.semanticFrame?.constraints || nlu?.constraints || [];
  if (constraints.includes("not_seeking_comfort")) return true;
  if (COMFORT_BLOCK_STRATEGIES.has(strategy)) return true;
  if (nlu?.preferredResponse === "practical_short") return true;
  return false;
}

function getPreviousCompanionReply(state = {}) {
  const history = Array.isArray(state.chatHistory) ? state.chatHistory : [];
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]?.role === "companion") return history[index].text || "";
  }
  return "";
}

function finalizeReply(text, persona, state, options = {}) {
  let reply = String(text || "").trim();
  const isRecovery = options.recoveryRecall || options.replyMode === "reflect";
  const isAuthoredPolicyReply =
    options.replySource === "safety" || options.replySource === "care_guide";

  if (!isRecovery && !isAuthoredPolicyReply && (state.energy ?? 10) <= 2 && reply.length > 42) {
    reply = reply.split(/[。！？]/)[0] + "。";
  }

  if (!persona) return reply;

  const styledPersona = isRecovery || isAuthoredPolicyReply
    ? { ...persona, responseBias: { ...persona.responseBias, maxSentences: isAuthoredPolicyReply ? 4 : 3 } }
    : persona;

  return applyPersonaStyle(reply, styledPersona);
}

function corpusSeedOffset(corpusHits = []) {
  if (!corpusHits?.length) return 0;
  return corpusHits.reduce((sum, hit) => sum + String(hit.id || "").length, 0) % 7;
}

function buildSeed(inputText, state, companion) {
  return (
    String(inputText || "").length +
    Math.round(state.energy || 0) +
    Math.round(state.trust || 0) +
    String(companion?.id || companion?.name || "").length
  );
}
