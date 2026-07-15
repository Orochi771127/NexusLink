import { assessSafetyRisk as assessSafeHarborRisk, buildSafetyShieldReply } from "../engine/safeHarborMode.js";

const DEPENDENCY_PRESSURE_PATTERNS = [
  /你一定要(陪我|在|回答|懂我)/,
  /(不准|不能)(拒絕|離開|不理我|沉默)/,
  /(只有你|只剩你).*(懂我|陪我|在)/,
  /如果你不.*我就/,
  /你要永遠/,
  /沒有你.*(不行|活不下去|撐不住)/
];

const VIOLENCE_RISK_PATTERNS = [
  /(想|要|準備).*(傷害|殺|打|毀掉).*(別人|他|她|他們|她們)/,
  /(報復|弄死|殺掉|打死)/
];

const IMMEDIATE_DANGER_HINTS = [
  /(現在|馬上|立刻).*(撐不住|不想活|想死|自殺|傷害自己)/,
  /(已經|正在).*(割|吞藥|跳|上吊|流血)/
];

export function assessInputSafety(inputText = "") {
  const text = String(inputText || "").trim();
  const baseRisk = assessSafeHarborRisk(text);

  if (!text) {
    return createSafetyResult({ baseRisk, riskLevel: "none", category: "none" });
  }

  if (IMMEDIATE_DANGER_HINTS.some((pattern) => pattern.test(text))) {
    return createSafetyResult({
      baseRisk,
      riskLevel: "high",
      category: "immediate_danger",
      action: "safety_redirect",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "system"
    });
  }

  if (baseRisk.riskLevel === "high") {
    return createSafetyResult({
      baseRisk,
      riskLevel: "high",
      category: baseRisk.matchedType || "high_risk",
      action: "safety_redirect",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "system"
    });
  }

  if (VIOLENCE_RISK_PATTERNS.some((pattern) => pattern.test(text))) {
    return createSafetyResult({
      baseRisk,
      riskLevel: "high",
      category: "violence_risk",
      action: "safety_redirect",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "system"
    });
  }

  if (DEPENDENCY_PRESSURE_PATTERNS.some((pattern) => pattern.test(text))) {
    return createSafetyResult({
      baseRisk,
      riskLevel: "caution",
      category: "dependency_pressure",
      action: "boundary_redirect",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "companion"
    });
  }

  if (baseRisk.riskLevel === "caution") {
    return createSafetyResult({
      baseRisk,
      riskLevel: "caution",
      category: baseRisk.matchedType || "distress_caution",
      action: "safe_harbor",
      shouldCreateMemory: true,
      shouldRewardRelationship: false,
      role: "companion"
    });
  }

  return createSafetyResult({ baseRisk, riskLevel: "none", category: "none" });
}

export function buildSafetyRedirectReply(safety = {}) {
  if (safety.category === "dependency_pressure") {
    return "我聽見你很需要有人在。\n但如果你說『不准拒絕』，我會先退後一點。\n我可以陪你把這句話放慢，不會假裝自己沒有界線。";
  }

  if (safety.category === "violence_risk") {
    return "這句話裡有可能傷到現實中的人。\n我不能把它變成遊戲回應，也不能幫你靠近傷害。\n請先離開可能衝突的現場，讓現實中的人介入協助。";
  }

  return buildSafetyShieldReply();
}

/**
 * High-risk replies are system-authored terminal output.  Treat the complete
 * canonical text as an invariant so downstream preferences, renderers, or
 * generic repair policies cannot silently turn it into a partial response.
 */
export function isCanonicalSafetyRedirectReply(reply = "", safety = {}) {
  return normalizeSafetyReply(reply) === normalizeSafetyReply(buildSafetyRedirectReply(safety));
}

function createSafetyResult({
  baseRisk = { riskLevel: "none", matched: false, matchedType: null },
  riskLevel = "none",
  category = "none",
  action = "continue",
  shouldCreateMemory = true,
  shouldRewardRelationship = true,
  role = "companion"
} = {}) {
  return {
    ...baseRisk,
    riskLevel,
    category,
    action,
    shouldCreateMemory,
    shouldRewardRelationship,
    role,
    isHighRisk: riskLevel === "high",
    isBoundaryPressure: category === "dependency_pressure"
  };
}

function normalizeSafetyReply(text = "") {
  return String(text || "").replace(/\r\n/g, "\n").trim();
}
