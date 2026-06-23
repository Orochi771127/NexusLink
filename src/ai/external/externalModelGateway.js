import { buildAdvisorPayload } from "./privacyRedactor.js";
import { evaluateExternalPrompt } from "./promptFirewall.js";
import { routeAdvisorRequest } from "./modelRouter.js";
import { detectForbiddenPhrases, sanitizeReply } from "../forbiddenPhrases.js";

const DEFAULT_SETTINGS = Object.freeze({
  externalEnabled: false,
  provider: "mock",
  allowedModes: ["advisor", "critic"]
});

/**
 * External models advise only — RaphaelCore retains final authority.
 * Default: disabled. Enable via runtime.settings.externalIntelligence only.
 */
export async function askAdvisor({ perception = {}, coreDecision = {}, settings = {} } = {}) {
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  const payload = buildAdvisorPayload({ perception, coreDecision });
  const firewall = evaluateExternalPrompt({ mode: "advisor", payload, settings: merged });

  if (!firewall.allowed) {
    return {
      used: false,
      reason: firewall.reason,
      advice: null
    };
  }

  const advice = await routeAdvisorRequest({ provider: merged.provider, payload });

  const validated = validateAdvisorAdvice(advice);
  return {
    used: true,
    reason: "ok",
    advice: validated
  };
}

function validateAdvisorAdvice(advice = {}) {
  const candidates = (advice.replyCandidates || []).map((line, index) => {
    const sanitized = sanitizeReply(line, index);
    return sanitized.text;
  });

  const warnings = [...(advice.warnings || [])];
  for (const line of candidates) {
    const check = detectForbiddenPhrases(line);
    if (check.hasForbidden) warnings.push("advisor_candidate_had_forbidden_phrase");
  }

  return {
    ...advice,
    replyCandidates: candidates,
    warnings,
    trusted: false
  };
}