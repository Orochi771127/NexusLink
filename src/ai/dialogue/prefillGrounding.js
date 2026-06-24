import { RESPONSE_STRATEGIES } from "../responseStrategySelector.js";
import { PersonaConstitution } from "../persona/PersonaConstitution.js";
import { getReferenceText, hasValidPrefill } from "./quickReplyContext.js";

export function buildPrefillGroundingPlan(prefillContext = null) {
  if (!hasValidPrefill(prefillContext)) {
    return {
      groundedMode: "none",
      prefillDetail: null,
      mustReference: false,
      weavePrefix: null
    };
  }

  const prefillDetail = getReferenceText(prefillContext);
  return {
    groundedMode: prefillContext.mustReference ? "explicit" : "soft",
    prefillDetail,
    mustReference: Boolean(prefillContext.mustReference),
    weavePrefix: null
  };
}

export function buildPrefillGroundedReply({
  strategy = "",
  nlu = {},
  semanticFrame = {},
  prefillContext = null,
  seed = 0
} = {}) {
  if (!hasValidPrefill(prefillContext)) return null;

  const frame = semanticFrame || nlu.semanticFrame || {};
  const detail = getReferenceText(prefillContext);
  const topic = prefillContext.topic || frame.topic || nlu.topic || "unknown";

  if (!detail) return null;

  const constraints = prefillContext.constraints || frame.constraints || [];
  if (PersonaConstitution.patterns.gamifyHighRisk.test(detail) && constraints.includes("not_seeking_comfort")) {
    return pick(
      [
        "好，我先不給建議。這件事就放在這裡。",
        "嗯，不用講太多。我陪著，不急着收走。"
      ],
      seed
    );
  }

  switch (strategy) {
    case RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION:
      if (topic === "hud_ui" || /HUD|Soul Talk|面板|dock|疊/.test(detail)) {
        if (/Soul Talk|面板/.test(detail) && /擋|遮|疊/.test(detail)) {
          return `先對準你說的「${detail}」。我們先拆：是 top HUD 疊上來，還是 bottom dock 擋住？`;
        }
        if (/top HUD/.test(detail)) {
          return `先對準「${detail}」。top HUD 這塊，是資訊疊太多，還是點擊區被擋？`;
        }
        return `先對準「${detail}」。你現在最想先釐清的是哪一段？`;
      }
      return `先對準「${detail}」。我們先把現象和重現步驟列出來。`;

    case RESPONSE_STRATEGIES.ACKNOWLEDGE_GENERIC_FAILURE:
      return pick(
        [
          `你說的「${detail}」我收到了。我會減少模板句，改從你點的這個重點回。`,
          `關於「${detail}」——我承認剛剛太像重複。這次我從這裡改。`
        ],
        seed
      );

    case RESPONSE_STRATEGIES.ACKNOWLEDGE_FEEDBACK:
      return `關於「${detail}」——這個回饋我收到了。我會調整說法，不沿用剛剛那句。`;

    case RESPONSE_STRATEGIES.PRACTICAL_EXPLANATION:
      return `先對準「${detail}」。我會用步驟拆，不先給安慰句。`;

    case RESPONSE_STRATEGIES.PRACTICAL_PLANNING:
      return `以「${detail}」為起點，我們先列現象、重現，再談修法。`;

    case RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY:
      return `我先對準你點的「${detail}」。若你要步驟我拆；若你要陪伴我就少說。`;

    case RESPONSE_STRATEGIES.SHORT_VALIDATION:
      return `「${detail}」我先放著。不急着給建議。`;

    case RESPONSE_STRATEGIES.EMOTIONAL_SHORT:
      return `「${detail}」我先聽見了。不急着分析。`;

    case RESPONSE_STRATEGIES.CONTEXTUAL_ACK:
      return `你點的「${detail}」我先放在前面，不套通用句。`;

    default:
      if (prefillContext.mustReference) {
        return `先對準你說的「${detail}」。`;
      }
      return null;
  }
}

export function downgradePrefillGroundingPlan(plan = {}, frame = {}, strategy = "") {
  if (plan.groundedMode !== "explicit") return plan;
  if (!plan.mustReference) return plan;

  const constraints = frame.constraints || [];
  if (constraints.includes("quiet_presence") || constraints.includes("no_questions")) {
    return {
      ...plan,
      groundedMode: "soft",
      mustReference: false
    };
  }

  if (
    constraints.includes("not_seeking_comfort") &&
    (frame.emotionalTone === "fatigue" || frame.topic === "physical_tiredness") &&
    !["practical_clarification", "practical_explanation", "practical_planning"].includes(strategy)
  ) {
    return {
      ...plan,
      groundedMode: "soft",
      mustReference: false
    };
  }

  return plan;
}

function pick(lines, seed) {
  return lines[Math.abs(seed) % lines.length];
}