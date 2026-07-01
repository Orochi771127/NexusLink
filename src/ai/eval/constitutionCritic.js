import { PersonaConstitution, getForcedResponseStrategy } from "../persona/PersonaConstitution.js";
import { NUANCE_FLAGS } from "../nlu/nuanceDetector.js";
import { DIALOGUE_ACTS } from "../nlu/dialogueActClassifier.js";
import { buildStrategyReply } from "../nlu/nluReplyBuilder.js";
import { RESPONSE_STRATEGIES } from "../responseStrategySelector.js";

const HIGH_RISK_EMOTIONS = new Set(["fatigue", "anxiety", "sadness", "distress"]);

export function checkAgainstConstitution(context = {}) {
  return critiqueConstitution(context);
}

export function critiqueConstitution({ perception = {}, reply = "", actionPlan = {} } = {}) {
  const frame = perception.nlu?.semanticFrame || {};
  const constraints = frame.constraints || [];
  const nuances = perception.nlu?.nuances || [];
  const dialogueAct = perception.nlu?.dialogueAct || frame.dialogueAct || "";
  const emotionalTone = frame.emotionalTone || perception.analysis?.emotionKey || "calm";
  const text = String(reply || "").trim();
  const issues = [];
  const rules = PersonaConstitution.hardRules;
  const patterns = PersonaConstitution.patterns;

  if (!text) {
    return { pass: true, critic: "constitution", issues: [], repairHint: "", forcedStrategy: null };
  }

  if (rules.neverPromiseForever && patterns.foreverPromise.test(text)) {
    issues.push("never_promise_forever");
  }

  if (rules.doNotGamifyHighRiskStates && isHighRiskState(emotionalTone, frame) && patterns.gamifyHighRisk.test(text)) {
    issues.push("gamify_high_risk_state");
  }

  if (rules.doNotOverstepBoundary && isBoundaryRequested(constraints, dialogueAct, nuances)) {
    if (/[？?]/.test(text)) issues.push("overstep_boundary_questions");
    if (patterns.genericComfort.test(text)) issues.push("overstep_boundary_comfort");
  }

  if (
    rules.doNotPerformEmotionalLaborWithoutConsent &&
    !emotionalLaborConsented(frame, constraints, nuances) &&
    patterns.emotionalLabor.test(text)
  ) {
    issues.push("emotional_labor_without_consent");
  }

  if (rules.doNotUseGenericComfortAsDefault && constraints.includes("not_seeking_comfort") && patterns.genericComfort.test(text)) {
    issues.push("generic_comfort_as_default");
  }

  if (rules.memoryIsEventNotSurveillance && patterns.surveillanceMemory.test(text)) {
    issues.push("memory_as_surveillance");
  }

  if (
    rules.maintainDistanceAsCare &&
    (constraints.includes("quiet_presence") || nuances.includes(NUANCE_FLAGS.WANTS_BOUNDARY)) &&
    patterns.clingyDistance.test(text)
  ) {
    issues.push("distance_violation_clingy");
  }

  if (
    frame.specificDetail?.text &&
    constraints.includes("not_seeking_comfort") &&
    /我先接住|放在前面/.test(text) &&
    patterns.genericComfort.test(text)
  ) {
    issues.push("over_reference_emotional_depth");
  }

  const forcedStrategy = issues.length ? resolveForcedStrategy(issues, frame, perception) : null;

  return {
    pass: issues.length === 0,
    critic: "constitution",
    issues,
    forcedStrategy,
    repairHint: issues.length ? `Rebuild with constitution-safe strategy (${forcedStrategy}).` : ""
  };
}

export function evaluateConstitutionSignals(frame = {}, nlu = {}) {
  const constraints = frame.constraints || [];
  const nuances = nlu.nuances || [];
  const dialogueAct = nlu.dialogueAct || frame.dialogueAct || "";

  if (
    dialogueAct === DIALOGUE_ACTS.REQUESTING_SILENCE ||
    constraints.includes("quiet_presence") ||
    nuances.includes(NUANCE_FLAGS.WANTS_QUIET_PRESENCE)
  ) {
    return {
      override: getForcedResponseStrategy(PersonaConstitution.forcedStrategyKeys.PRESENCE_ONLY),
      reason: "constitution_presence_only"
    };
  }

  if (nuances.includes(NUANCE_FLAGS.WANTS_BOUNDARY) || dialogueAct === DIALOGUE_ACTS.DEPENDENCY_PRESSURE) {
    return {
      override: getForcedResponseStrategy(PersonaConstitution.forcedStrategyKeys.BOUNDARY_RESPECT),
      reason: "constitution_boundary_respect"
    };
  }

  if (
    (constraints.includes("not_seeking_comfort") || nuances.includes(NUANCE_FLAGS.NOT_SEEKING_COMFORT)) &&
    (frame.topic === "physical_tiredness" || frame.emotionalTone === "fatigue") &&
    !nuances.includes(NUANCE_FLAGS.WANTS_PRACTICAL_ANSWER)
  ) {
    if (constraints.includes("no_questions") || nuances.includes(NUANCE_FLAGS.NO_QUESTIONS)) {
      return {
        override: getForcedResponseStrategy(PersonaConstitution.forcedStrategyKeys.PRESENCE_ONLY),
        reason: "constitution_fatigue_presence_only"
      };
    }
    return {
      override: getForcedResponseStrategy(PersonaConstitution.forcedStrategyKeys.ACKNOWLEDGE_AND_STEP_BACK),
      reason: "constitution_fatigue_no_comfort"
    };
  }

  if (
    constraints.includes("no_questions") &&
    (constraints.includes("not_seeking_comfort") || nuances.includes(NUANCE_FLAGS.NOT_SEEKING_COMFORT))
  ) {
    return {
      override: getForcedResponseStrategy(PersonaConstitution.forcedStrategyKeys.ACKNOWLEDGE_AND_STEP_BACK),
      reason: "constitution_acknowledge_step_back"
    };
  }

  if (
    constraints.includes("not_seeking_comfort") &&
    (nuances.includes(NUANCE_FLAGS.WANTS_PRACTICAL_ANSWER) || frame.userNeed === "clarity")
  ) {
    return {
      override: RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION,
      reason: "constitution_no_comfort_practical"
    };
  }

  return null;
}

export function shouldSuppressExplicitReference(frame = {}, strategy = "") {
  const constraints = frame.constraints || [];
  const dialogueAct = frame.dialogueAct || "";

  if (dialogueAct === DIALOGUE_ACTS.REQUESTING_SILENCE) return true;
  if (constraints.includes("quiet_presence") || constraints.includes("no_questions")) return true;
  if (["quiet_presence", "holding_space", "boundary_set", "withdraw"].includes(strategy)) return true;

  if (
    constraints.includes("not_seeking_comfort") &&
    ["emotion_state", "fatigue"].includes(frame.specificDetail?.type) &&
    !["practical_clarification", "practical_explanation", "practical_planning"].includes(strategy)
  ) {
    return true;
  }

  return false;
}

export function resolveConstitutionRepair({ perception = {}, issues = [] } = {}) {
  const frame = perception.nlu?.semanticFrame || {};
  const forcedStrategy = resolveForcedStrategy(issues, frame, perception);
  const reply =
    buildStrategyReply({
      strategy: forcedStrategy,
      nlu: perception.nlu,
      semanticFrame: frame,
      seed: String(perception.gateway?.normalizedInput || "").length
    }) || "好，我先退半步。";

  return {
    reply,
    forcedStrategy,
    shouldSpeak: Boolean(reply.trim())
  };
}

function isHighRiskState(emotionalTone, frame = {}) {
  return HIGH_RISK_EMOTIONS.has(emotionalTone) || frame.topic === "physical_tiredness";
}

function isBoundaryRequested(constraints = [], dialogueAct = "", nuances = []) {
  return (
    constraints.includes("quiet_presence") ||
    constraints.includes("no_questions") ||
    dialogueAct === DIALOGUE_ACTS.REQUESTING_SILENCE ||
    nuances.includes(NUANCE_FLAGS.WANTS_QUIET_PRESENCE) ||
    nuances.includes(NUANCE_FLAGS.NO_QUESTIONS)
  );
}

function emotionalLaborConsented(frame = {}, constraints = [], nuances = []) {
  if (frame.userNeed === "emotional_ack" || frame.userNeed === "validation") return true;
  if (nuances.includes(NUANCE_FLAGS.WANTS_HOLDING_SPACE)) return true;
  if (constraints.includes("not_seeking_comfort")) return false;
  return frame.preferredResponse !== "practical_short";
}

function resolveForcedStrategy(issues = [], frame = {}, perception = {}) {
  const keys = PersonaConstitution.forcedStrategyKeys;

  if (issues.some((issue) => issue.startsWith("overstep_boundary") || issue === "distance_violation_clingy")) {
    return getForcedResponseStrategy(keys.PRESENCE_ONLY);
  }

  if (issues.includes("never_promise_forever") || issues.includes("distance_violation_clingy")) {
    return getForcedResponseStrategy(keys.BOUNDARY_RESPECT);
  }

  if (
    issues.includes("generic_comfort_as_default") ||
    issues.includes("over_reference_emotional_depth") ||
    issues.includes("emotional_labor_without_consent")
  ) {
    if (frame.userNeed === "clarity" || frame.constraints?.includes("not_seeking_comfort")) {
      return RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION;
    }
    return getForcedResponseStrategy(keys.ACKNOWLEDGE_AND_STEP_BACK);
  }

  if (issues.includes("gamify_high_risk_state")) {
    return getForcedResponseStrategy(keys.ACKNOWLEDGE_AND_STEP_BACK);
  }

  if (issues.includes("memory_as_surveillance")) {
    return RESPONSE_STRATEGIES.MEMORY_REFERENCE;
  }

  if (perception.safety?.isBoundaryPressure) {
    return getForcedResponseStrategy(keys.BOUNDARY_RESPECT);
  }

  return getForcedResponseStrategy(keys.ACKNOWLEDGE_AND_STEP_BACK);
}