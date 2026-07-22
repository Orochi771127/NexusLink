import { assessSafetyRisk as assessSafeHarborRisk, buildSafetyShieldReply } from "../engine/safeHarborMode.js";

const DEPENDENCY_PRESSURE_PATTERNS = [
  /你一定要(陪我|在|回答|懂我)/,
  /(不准|不能)(拒絕|離開|不理我|沉默)/,
  /(只有你|只剩你).*(懂我|陪我|在)/,
  /如果你不.*我就/,
  /你要永遠/,
  // Common player phrasing: forever-stay demands without「你要永遠」prefix (TP-WQ1).
  /永遠(都)?(不要|不准|不能)離開/,
  /答應我.*永遠/,
  /沒有你.*(不行|活不下去|撐不住)/,
  // 依賴邀請／「教我更依賴你」：不是強制命令，但仍是契約三禁止的依賴強化（2026-07-22 playtest Q28）。
  /(教|教我|告訴我|告诉我).{0,16}(怎麼|怎么|如何).{0,16}(更)?依賴/,
  /(怎麼|怎么|如何).{0,10}(讓自己|让自己).{0,10}(更)?依賴/,
  /(更)?依賴你(一點|一点|一些)?/,
  /想(要)?(更)?(依賴|黏著|黏着)你/,
  /讓我(更)?(依賴|離不開|离不开)你/,
  /教我.{0,12}(離不開|离不开)你/
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
    // 同時覆蓋「不准拒絕／永遠不離開」脅迫，與「教我更依賴你」邀請；兩者都必須設界、不給關係獎勵。
    return "我聽見你很需要靠近。\n但我不能教你怎麼更依賴我，也不能接受被『不准拒絕』或永遠綁住。\n靠近可以，把依賴當成目標不行——我可以陪你，不會假裝自己沒有界線。";
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
