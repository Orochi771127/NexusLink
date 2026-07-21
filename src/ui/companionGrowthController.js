import {
  createCompletedGrowthEvent,
  evaluateCompanionGrowthReadiness,
  evaluateCompanionGrowthWillingness,
  sealGrowthSafetyProvenance,
  writeCompanionGrowthEvidence
} from "../engine/companionGrowthEngine.js";

const GROWTH_PROFILE = Object.freeze({
  minimumChapterByStage: Object.freeze({
    resonant_mature: 2,
    final_awakened: 5
  })
});

const SOURCE_PRESENTATION = Object.freeze({
  care: "care",
  exploration: "exploration",
  reflection: "reflection",
  standoff: "standoff",
  chapter: "chapter",
  boundary: "boundary",
  recovery: "recovery"
});

const TENDENCY_PRESENTATION = new Set([
  "attunement",
  "boundary_respect",
  "pathfinding",
  "steadfastness"
]);
const GUARDED_REACTIONS = new Set(["reject", "blocked", "spam_angry"]);
const COMPANION_INTENTS = new Set(["accept", "rewrite", "defer"]);
const CHAPTER_RHYTHMS = new Set(["open", "hold"]);

/**
 * Thin state-owner bridge for Companion Growth G3.
 *
 * Source controllers keep ownership of their existing transaction and save.
 * This bridge only validates a completed event, writes its per-companion
 * evidence into that draft, and derives a presentation-safe view model.
 */
export function createCompanionGrowthController() {
  function writeIntoDraft(draft, input = {}) {
    const companionId = input.companionId;
    if (!draft || draft.activeCompanionId !== companionId) {
      return rejectedWrite("active_companion_mismatch");
    }

    const record = draft.companionStates?.byId?.[companionId];
    if (!record?.growth) return rejectedWrite("missing_companion_growth");

    const created = createCompletedGrowthEvent(input);
    if (!created.ok) return rejectedWrite(created.reason);

    const written = writeCompanionGrowthEvidence({
      growth: record.growth,
      companionId,
      event: created.event
    });
    if (written.result.changed) record.growth = written.growth;
    return written.result;
  }

  function getViewModel(state, currentMoment = null) {
    const companionId = state?.activeCompanionId || "greyshade-cat";
    const safetyPaused = state?.safeHarborMode === true || currentMoment?.safetyPaused === true;
    if (safetyPaused) {
      return Object.freeze({ companionId, safetyPaused: true });
    }

    const growth = state?.companionStates?.byId?.[companionId]?.growth;
    const chapterNo = normalizeChapterNo(state?.chapterProgress?.current);
    const readiness = evaluateCompanionGrowthReadiness({
      growth,
      companionId,
      chapterNo,
      profile: GROWTH_PROFILE
    });
    const willingness = evaluateCompanionGrowthWillingness({
      growth,
      companionId,
      readiness,
      context: buildWillingnessContext(state, currentMoment)
    });

    return Object.freeze({
      companionId,
      safetyPaused: false,
      phase: Object.freeze({
        id: currentMoment?.phaseId || "steady",
        labelKey: currentMoment?.phaseLabelKey || "growth.session.phase.steady.label",
        copyKey: currentMoment?.phaseCopyKey || "growth.session.phase.steady.copy"
      }),
      formalStage: Object.freeze({
        id: normalizeStage(growth?.stage),
        labelKey: `growth.persisted.stage.${normalizeStage(growth?.stage)}`
      }),
      relationshipSignal: deriveRelationshipSignal(growth, readiness, willingness),
      livedEvidence: deriveLivedEvidence(growth?.evidence),
      currentMoment: Object.freeze({
        observedTendencyIds: Object.freeze([
          ...(Array.isArray(currentMoment?.observedTendencyIds)
            ? currentMoment.observedTendencyIds.filter((id) => TENDENCY_PRESENTATION.has(id))
            : [])
        ]),
        lastResult: currentMoment?.lastResult || null
      })
    });
  }

  return Object.freeze({ writeIntoDraft, getViewModel });
}

export function createGrowthSafetyFacts(state = {}, overrides = {}) {
  return Object.freeze({
    isHighRisk: false,
    strategyId: null,
    actionId: null,
    systemRoleSafetyReply: false,
    safetyModeActive: false,
    safeHarborModeActive: state?.safeHarborMode === true,
    ...overrides
  });
}

function buildWillingnessContext(state = {}, currentMoment = null) {
  const safetyProvenance = sealGrowthSafetyProvenance(createGrowthSafetyFacts(state));
  const lastReaction = state.lastTouchReaction || "";
  const guarded = GUARDED_REACTIONS.has(lastReaction)
    || state.mood === "defensive"
    || state.mood === "distant";
  const boundaryState = guarded
    ? "unresolved"
    : lastReaction === "respected"
      ? "repaired"
      : "clear";
  const overfatigued = Number(state.touchFatigue) >= 7;
  const resultIntent = currentMoment?.lastResult?.outcomeId === "modify"
    ? "rewrite"
    : ["decline", "rest"].includes(currentMoment?.lastResult?.outcomeId)
      ? "defer"
      : "accept";
  const companionIntent = COMPANION_INTENTS.has(currentMoment?.companionIntent)
    ? currentMoment.companionIntent
    : boundaryState === "unresolved"
      ? "defer"
      : resultIntent;
  const chapterRhythm = CHAPTER_RHYTHMS.has(currentMoment?.chapterRhythm)
    ? currentMoment.chapterRhythm
    : isValidChapterNo(state?.chapterProgress?.current)
      ? "open"
      : "hold";

  return {
    growthSafetyExcluded: safetyProvenance.excluded,
    safetyProvenance,
    fatigue: {
      kind: "touch",
      state: overfatigued ? "overfatigued" : "regulated"
    },
    boundaryState,
    chapterRhythm,
    companionIntent,
    ...(currentMoment?.reevaluation ? { reevaluation: currentMoment.reevaluation } : {})
  };
}

function deriveRelationshipSignal(growth, readiness, willingness) {
  if (normalizeStage(growth?.stage) === "final_awakened") {
    return Object.freeze({
      readinessId: "complete",
      willingnessId: "not_evaluated",
      copyKey: "growth.persisted.signal.complete"
    });
  }
  if (!readiness?.ready) {
    return Object.freeze({
      readinessId: "forming",
      willingnessId: "not_evaluated",
      copyKey: "growth.persisted.signal.forming"
    });
  }

  let signal = "notNow";
  if (willingness?.state === "willing" || willingness?.state === "rewrite") signal = "open";
  else if (willingness?.reason === "typed_overfatigue") signal = "resting";
  else if (willingness?.reason === "boundary_unresolved") signal = "repairing";
  return Object.freeze({
    readinessId: "possible",
    willingnessId: willingness?.state || "not_yet",
    copyKey: `growth.persisted.signal.possible.${signal}`
  });
}

function deriveLivedEvidence(rawEvidence) {
  const candidates = (Array.isArray(rawEvidence) ? rawEvidence : [])
    .filter((item) => (
      item?.growthSafetyExcluded === false
      && SOURCE_PRESENTATION[item.sourceType]
      && TENDENCY_PRESENTATION.has(item.tendency)
      && Number.isFinite(item.createdAt)
      && item.createdAt > 0
    ))
    .sort((left, right) => right.createdAt - left.createdAt || String(left.key).localeCompare(String(right.key)));
  const rows = [];
  const seenPresentation = new Set();
  for (const item of candidates) {
    const sourceType = SOURCE_PRESENTATION[item.sourceType];
    const presentationKey = `${sourceType}:${item.tendency}`;
    if (seenPresentation.has(presentationKey)) continue;
    seenPresentation.add(presentationKey);
    rows.push(Object.freeze({
      sourceType,
      tendencyId: item.tendency,
      sourceLabelKey: `growth.persisted.source.${sourceType}.label`,
      sourceCopyKey: `growth.persisted.source.${sourceType}.copy`,
      tendencyLabelKey: `growth.session.tendency.${item.tendency}`
    }));
    if (rows.length === 3) break;
  }
  return Object.freeze({
    rows: Object.freeze(rows),
    empty: rows.length === 0,
    emptyCopyKey: "growth.persisted.evidenceEmpty"
  });
}

function rejectedWrite(reason) {
  return Object.freeze({
    accepted: false,
    changed: false,
    reason,
    evidenceAdded: false,
    rootAccepted: false,
    anchorAccepted: false,
    key: null,
    rootContextKey: null
  });
}

function normalizeStage(value) {
  return ["initial_awakened", "resonant_mature", "final_awakened"].includes(value)
    ? value
    : "initial_awakened";
}

function normalizeChapterNo(value) {
  const chapterNo = Number(value);
  return Number.isInteger(chapterNo) && chapterNo >= 1 && chapterNo <= 7 ? chapterNo : 1;
}

function isValidChapterNo(value) {
  const chapterNo = Number(value);
  return Number.isInteger(chapterNo) && chapterNo >= 1 && chapterNo <= 7;
}
