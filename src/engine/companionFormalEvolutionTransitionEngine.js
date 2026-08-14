import {
  COMPANION_GROWTH_SOURCE_TYPES,
  evaluateCompanionGrowthReadiness,
  evaluateCompanionGrowthWillingness,
  sealGrowthSafetyProvenance
} from "./companionGrowthEngine.js";

/**
 * 正式進化純狀態機（EVO-02）。
 *
 * 這份模組只回答「這次邀請／改寫／延後／接受，能不能產生一份獨立 candidate」。
 * 它不存檔、不碰 store／DOM／Pixi、不讀 Date.now 或 Math.random。
 * 時間與 generation 必須由呼叫端明示注入。
 */

export const FORMAL_EVOLUTION_ACTIONS = Object.freeze([
  "offer",
  "rewrite",
  "defer",
  "accept"
]);

export const FORMAL_EVOLUTION_EXACT_NEXT = Object.freeze({
  initial_awakened: "resonant_mature",
  resonant_mature: "final_awakened",
  final_awakened: null
});

export const FORMAL_EVOLUTION_COMPANION_IDS = Object.freeze([
  "greyshade-cat",
  "auriowl",
  "sprigfawn",
  "crystalfin-seahorse",
  "blazetail-kit",
  "starstripe-cub",
  "thunder-pup",
  "wavecub",
  "starflame-phoenix",
  "star-foal",
  "goldenspark-wyrm"
]);

export const FORMAL_EVOLUTION_COMPANION_ID_SET = new Set(FORMAL_EVOLUTION_COMPANION_IDS);

const ACTION_SET = new Set(FORMAL_EVOLUTION_ACTIONS);
const STAGE_SET = new Set(Object.keys(FORMAL_EVOLUTION_EXACT_NEXT));
const TOKEN_VERSION = "fev1";
const GENERATION_PATTERN = /^[a-zA-Z0-9._-]{1,80}$/;
const SAFETY_FACT_KEYS = Object.freeze([
  "isHighRisk",
  "strategyId",
  "actionId",
  "systemRoleSafetyReply",
  "safetyModeActive",
  "safeHarborModeActive"
]);

/**
 * @param {object} input
 * @returns {object} 凍結的 decision envelope；永不改寫輸入。
 */
export function decideFormalEvolutionTransition(input = {}) {
  if (!isPlainObject(input)) return failure("invalid_input");
  if (!isPlainObject(input.growth)) return failure("invalid_growth_state");

  const companionId = input.companionId;
  if (!FORMAL_EVOLUTION_COMPANION_ID_SET.has(companionId)) {
    return failure("not_formal_evolution_companion");
  }

  const identity = inspectGrowthStateIdentity(input.state, input.growth, companionId);
  if (!identity.ok) return failure(identity.reason);

  const currentGrowth = cloneJson(input.growth);
  const currentState = input.state == null ? null : cloneJson(input.state);

  if (input.forceEvolve === true) {
    return unchangedFailure("force_evolve_forbidden", currentGrowth, currentState);
  }

  const at = normalizePositiveTimestamp(input.at);
  if (!at) return unchangedFailure("invalid_timestamp", currentGrowth, currentState);

  const action = input.action;
  if (!ACTION_SET.has(action)) {
    return unchangedFailure("unknown_action", currentGrowth, currentState);
  }

  const safety = inspectDecisionSafety(input.safetyFacts, currentState);
  if (!safety.ok) {
    return unchangedFailure(safety.reason, currentGrowth, currentState);
  }

  if (currentState?.safeHarborMode === true || safety.facts.safeHarborModeActive === true) {
    return unchangedFailure("safe_harbor_terminal", currentGrowth, currentState);
  }
  if (safety.excluded) {
    return unchangedFailure("safety_excluded", currentGrowth, currentState);
  }

  if (!STAGE_SET.has(currentGrowth.stage)) {
    return unchangedFailure("unknown_stage", currentGrowth, currentState);
  }

  const exactNext = FORMAL_EVOLUTION_EXACT_NEXT[currentGrowth.stage];
  if (input.targetStage != null && input.targetStage !== exactNext) {
    return unchangedFailure("exact_next_stage_only", currentGrowth, currentState);
  }

  if (action === "offer") return decideOffer(input, currentGrowth, currentState, at, safety);
  if (action === "rewrite") return decideRewrite(input, currentGrowth, currentState, at, safety);
  if (action === "defer") return decideDefer(input, currentGrowth, currentState, at, safety);
  return decideAccept(input, currentGrowth, currentState, at, safety);
}

export function createFormalEvolutionOfferToken({
  companionId,
  currentStage,
  targetStage,
  generation
} = {}) {
  if (!FORMAL_EVOLUTION_COMPANION_ID_SET.has(companionId) || !STAGE_SET.has(currentStage)) return null;
  if (FORMAL_EVOLUTION_EXACT_NEXT[currentStage] !== targetStage) return null;
  const normalizedGeneration = normalizeGeneration(generation);
  if (!normalizedGeneration) return null;
  return `${TOKEN_VERSION}:${companionId}:${currentStage}:${targetStage}:${normalizedGeneration}`;
}

export function parseFormalEvolutionOfferToken(token) {
  if (typeof token !== "string") return null;
  const parts = token.split(":");
  if (parts.length !== 5 || parts[0] !== TOKEN_VERSION) return null;
  const [, companionId, currentStage, targetStage, generation] = parts;
  if (createFormalEvolutionOfferToken({
    companionId,
    currentStage,
    targetStage,
    generation
  }) !== token) return null;
  return Object.freeze({
    companionId,
    currentStage,
    targetStage,
    generation
  });
}

function decideOffer(input, currentGrowth, currentState, at, safety) {
  if (currentGrowth.stage === "final_awakened" || !FORMAL_EVOLUTION_EXACT_NEXT[currentGrowth.stage]) {
    return unchangedFailure("final_stage_complete", currentGrowth, currentState);
  }

  const generation = normalizeGeneration(input.generation);
  if (!generation) return unchangedFailure("missing_generation", currentGrowth, currentState);

  const gate = inspectReadinessAndWillingness(input, currentGrowth);
  if (!gate.ok) return unchangedFailure(gate.reason, currentGrowth, currentState);
  if (gate.willingness.state === "rewrite") {
    return unchangedFailure("companion_requests_rewrite", currentGrowth, currentState);
  }
  if (gate.willingness.state !== "willing") {
    return unchangedFailure(gate.willingness.reason || "companion_not_willing", currentGrowth, currentState);
  }

  const targetStage = FORMAL_EVOLUTION_EXACT_NEXT[currentGrowth.stage];
  const token = createFormalEvolutionOfferToken({
    companionId: input.companionId,
    currentStage: currentGrowth.stage,
    targetStage,
    generation
  });
  const existing = currentGrowth.formalOffer;
  if (isOpenOffer(existing) && existing.token === token) {
    return success({
      action: "offer",
      reason: "offer_already_open",
      changed: false,
      companionId: input.companionId,
      currentGrowth,
      currentState,
      nextGrowth: currentGrowth,
      offer: existing
    });
  }
  if (isOpenOffer(existing) && existing.generation === generation) {
    return unchangedFailure("duplicate_token", currentGrowth, currentState);
  }
  if (isOpenOffer(existing) && existing.generation !== generation) {
    return unchangedFailure("stale_offer", currentGrowth, currentState);
  }

  const nextGrowth = cloneJson(currentGrowth);
  nextGrowth.offeredStage = targetStage;
  nextGrowth.formalOffer = {
    status: "open",
    token,
    companionId: input.companionId,
    currentStage: currentGrowth.stage,
    targetStage,
    generation,
    issuedAt: at,
    rewritePending: false,
    safetySeal: safety.sealed.seal
  };
  return success({
    action: "offer",
    reason: "offer_opened",
    changed: true,
    companionId: input.companionId,
    currentGrowth,
    currentState,
    nextGrowth,
    offer: nextGrowth.formalOffer
  });
}

function decideRewrite(input, currentGrowth, currentState, at, safety) {
  const open = requireOpenOffer(currentGrowth, input.companionId);
  if (!open.ok) return unchangedFailure(open.reason, currentGrowth, currentState);

  const nextGrowth = cloneJson(currentGrowth);
  nextGrowth.stage = currentGrowth.stage;
  nextGrowth.offeredStage = open.offer.targetStage;
  nextGrowth.formalOffer = {
    ...open.offer,
    rewritePending: true,
    rewrittenAt: at,
    safetySeal: safety.sealed.seal
  };
  return success({
    action: "rewrite",
    reason: "rewrite_pending",
    changed: true,
    companionId: input.companionId,
    currentGrowth,
    currentState,
    nextGrowth,
    offer: nextGrowth.formalOffer
  });
}

function decideDefer(input, currentGrowth, currentState, at, safety) {
  const open = requireOpenOffer(currentGrowth, input.companionId);
  if (!open.ok) return unchangedFailure(open.reason, currentGrowth, currentState);

  const nextGrowth = cloneJson(currentGrowth);
  nextGrowth.stage = currentGrowth.stage;
  nextGrowth.offeredStage = null;
  nextGrowth.deferredAt = at;
  nextGrowth.formalOffer = {
    ...open.offer,
    status: "deferred",
    rewritePending: false,
    deferredAt: at,
    token: open.offer.token,
    safetySeal: safety.sealed.seal
  };
  return success({
    action: "defer",
    reason: "offer_deferred",
    changed: true,
    companionId: input.companionId,
    currentGrowth,
    currentState,
    nextGrowth,
    offer: nextGrowth.formalOffer
  });
}

function decideAccept(input, currentGrowth, currentState, at, safety) {
  const parsed = parseFormalEvolutionOfferToken(input.offerToken);
  if (!parsed) return unchangedFailure("invalid_offer_token", currentGrowth, currentState);
  if (parsed.companionId !== input.companionId) {
    return unchangedFailure("companion_mismatch", currentGrowth, currentState);
  }

  const existing = currentGrowth.formalOffer;
  if (existing?.status === "consumed" && existing.token === input.offerToken) {
    return success({
      action: "accept",
      reason: "already_accepted",
      changed: false,
      companionId: input.companionId,
      currentGrowth,
      currentState,
      nextGrowth: currentGrowth,
      offer: existing
    });
  }
  if (currentGrowth.stage === parsed.targetStage) {
    return unchangedFailure("stale_offer", currentGrowth, currentState);
  }
  if (currentGrowth.stage === "final_awakened") {
    return unchangedFailure("final_stage_complete", currentGrowth, currentState);
  }
  if (!isOpenOffer(existing)) {
    return unchangedFailure("stale_offer", currentGrowth, currentState);
  }
  if (existing.token !== input.offerToken) {
    return unchangedFailure("stale_offer", currentGrowth, currentState);
  }
  if (existing.companionId !== input.companionId
    || existing.currentStage !== currentGrowth.stage
    || existing.targetStage !== parsed.targetStage
    || existing.generation !== parsed.generation) {
    return unchangedFailure("stale_offer", currentGrowth, currentState);
  }
  if (FORMAL_EVOLUTION_EXACT_NEXT[currentGrowth.stage] !== parsed.targetStage) {
    return unchangedFailure("exact_next_stage_only", currentGrowth, currentState);
  }
  if (existing.rewritePending === true && input.rewriteAccepted !== true) {
    return unchangedFailure("rewrite_pending_unaccepted", currentGrowth, currentState);
  }

  const nextStage = parsed.targetStage;
  const nextGrowth = cloneJson(currentGrowth);
  nextGrowth.stage = nextStage;
  nextGrowth.offeredStage = null;
  nextGrowth.deferredAt = null;
  nextGrowth.lastGrowthEventAt = at;
  nextGrowth.coverage = createNextWindowCoverage(nextStage, at);
  nextGrowth.formalOffer = {
    ...existing,
    status: "consumed",
    rewritePending: false,
    acceptedAt: at,
    consumedToken: existing.token,
    safetySeal: safety.sealed.seal
  };
    return success({
      action: "accept",
      reason: "stage_candidate_ready",
      changed: true,
      companionId: input.companionId,
      currentGrowth,
      currentState,
      nextGrowth,
      offer: nextGrowth.formalOffer
    });
}

function inspectReadinessAndWillingness(input, growth) {
  const readiness = evaluateCompanionGrowthReadiness({
    growth,
    companionId: input.companionId,
    chapterNo: input.chapterNo,
    profile: input.profile
  });
  if (readiness.integrityOk !== true) {
    return { ok: false, reason: readiness.reason || "invalid_growth_state" };
  }
  if (readiness.ready !== true) {
    return { ok: false, reason: readiness.reason || "readiness_incomplete" };
  }
  const willingness = evaluateCompanionGrowthWillingness({
    growth,
    companionId: input.companionId,
    readiness,
    context: input.willingnessContext
  });
  return { ok: true, readiness, willingness };
}

function inspectDecisionSafety(rawFacts, state) {
  if (!isPlainObject(rawFacts)) return { ok: false, reason: "legacy_provenance_unverifiable" };
  if (Object.keys(rawFacts).some((key) => !SAFETY_FACT_KEYS.includes(key))) {
    return { ok: false, reason: "legacy_provenance_unverifiable" };
  }
  const booleanFields = [
    "isHighRisk",
    "systemRoleSafetyReply",
    "safetyModeActive",
    "safeHarborModeActive"
  ];
  if (!booleanFields.every((field) => typeof rawFacts[field] === "boolean")) {
    return { ok: false, reason: "legacy_provenance_unverifiable" };
  }
  if (!Object.prototype.hasOwnProperty.call(rawFacts, "strategyId")
    || !Object.prototype.hasOwnProperty.call(rawFacts, "actionId")) {
    return { ok: false, reason: "legacy_provenance_unverifiable" };
  }

  const facts = {
    isHighRisk: rawFacts.isHighRisk,
    strategyId: rawFacts.strategyId,
    actionId: rawFacts.actionId,
    systemRoleSafetyReply: rawFacts.systemRoleSafetyReply,
    safetyModeActive: rawFacts.safetyModeActive,
    safeHarborModeActive: rawFacts.safeHarborModeActive || state?.safeHarborMode === true
  };
  const sealed = sealGrowthSafetyProvenance(facts);
  return {
    ok: true,
    facts,
    sealed,
    excluded: sealed.excluded === true
  };
}

function requireOpenOffer(growth, companionId) {
  if (!isOpenOffer(growth.formalOffer)) return { ok: false, reason: "offer_not_open" };
  if (growth.formalOffer.companionId !== companionId) {
    return { ok: false, reason: "companion_mismatch" };
  }
  if (growth.formalOffer.currentStage !== growth.stage) {
    return { ok: false, reason: "stale_offer" };
  }
  return { ok: true, offer: growth.formalOffer };
}

function isOpenOffer(offer) {
  return isPlainObject(offer) && offer.status === "open" && typeof offer.token === "string";
}

function createNextWindowCoverage(stage, at) {
  const targetStage = FORMAL_EVOLUTION_EXACT_NEXT[stage];
  return {
    targetStage,
    windowOpenedAt: at,
    rootsBySourceType: Object.fromEntries(
      COMPANION_GROWTH_SOURCE_TYPES.map((sourceType) => [sourceType, []])
    ),
    consentAnchorRootKey: null
  };
}

function inspectGrowthStateIdentity(state, growth, companionId) {
  if (state == null) return { ok: true };
  if (!isPlainObject(state)) return { ok: false, reason: "growth_state_mismatch" };
  const stateGrowth = state.companionStates?.byId?.[companionId]?.growth;
  if (!isPlainObject(stateGrowth)) return { ok: false, reason: "growth_state_mismatch" };
  if (JSON.stringify(stateGrowth) !== JSON.stringify(growth)) {
    return { ok: false, reason: "growth_state_mismatch" };
  }
  return { ok: true };
}

function success({
  action,
  reason,
  changed,
  companionId,
  currentGrowth,
  currentState,
  nextGrowth,
  offer
}) {
  return freezeDecision({
    ok: true,
    accepted: true,
    changed,
    reason,
    action,
    offer: offer ? cloneJson(offer) : null,
    candidateGrowth: cloneJson(nextGrowth),
    candidateState: attachGrowth(currentState, companionId, nextGrowth),
    candidateTransition: changed && action === "accept"
      ? {
        fromStage: currentGrowth.stage,
        toStage: nextGrowth.stage,
        token: offer?.token || offer?.consumedToken || null
      }
      : null,
    persistRequested: false,
    rendererIntent: null
  });
}

function unchangedFailure(reason, currentGrowth, currentState) {
  return freezeDecision({
    ok: false,
    accepted: false,
    changed: false,
    reason,
    action: null,
    offer: currentGrowth?.formalOffer ? cloneJson(currentGrowth.formalOffer) : null,
    candidateGrowth: cloneJson(currentGrowth),
    candidateState: cloneJson(currentState),
    candidateTransition: null,
    persistRequested: false,
    rendererIntent: null
  });
}

function failure(reason) {
  return freezeDecision({
    ok: false,
    accepted: false,
    changed: false,
    reason,
    action: null,
    offer: null,
    candidateGrowth: null,
    candidateState: null,
    candidateTransition: null,
    persistRequested: false,
    rendererIntent: null
  });
}

function attachGrowth(state, companionId, growth) {
  if (state == null) return null;
  const nextState = cloneJson(state);
  nextState.companionStates.byId[companionId].growth = cloneJson(growth);
  return nextState;
}

function normalizeGeneration(value) {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return String(value);
  }
  return typeof value === "string" && GENERATION_PATTERN.test(value) ? value : null;
}

function normalizePositiveTimestamp(value) {
  return Number.isFinite(value) && value > 0 ? value : null;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cloneJson(value) {
  if (value == null) return null;
  return JSON.parse(JSON.stringify(value));
}

function freezeDecision(value) {
  return Object.freeze(value);
}
