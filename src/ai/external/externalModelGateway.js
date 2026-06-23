import { buildAdvisorPayload, buildRendererPayload } from "./privacyRedactor.js";
import { evaluateExternalPrompt } from "./promptFirewall.js";
import { routeAdvisorRequest, routeRendererRequest } from "./modelRouter.js";
import { detectForbiddenPhrases, sanitizeReply } from "../forbiddenPhrases.js";

const DEFAULT_SETTINGS = Object.freeze({
  externalEnabled: false,
  advisorEnabled: false,
  rendererEnabled: false,
  provider: "mock",
  allowedModes: ["advisor", "renderer", "critic"]
});

/**
 * External models advise only — RaphaelCore retains final authority.
 * Default: disabled. Enable via runtime.settings.externalIntelligence only.
 */
export async function askAdvisor({ perception = {}, coreDecision = {}, settings = {} } = {}) {
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  const payload = buildAdvisorPayload({ perception, coreDecision });
  const advisorSettings = { ...merged, externalEnabled: merged.advisorEnabled || merged.externalEnabled };
  const firewall = evaluateExternalPrompt({ mode: "advisor", payload, settings: advisorSettings });

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

/**
 * Renderer polishes an already-decided draft. RaphaelCore still runs critics after.
 */
export function renderReply({
  perception = {},
  coreDecision = {},
  draftReply = "",
  preferenceProfile = {},
  settings = {}
} = {}) {
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  const payload = buildRendererPayload({
    perception,
    coreDecision,
    draftReply,
    preferenceProfile
  });
  const firewall = evaluateExternalPrompt({ mode: "renderer", payload, settings: merged });

  if (!firewall.allowed) {
    return { used: false, reason: firewall.reason, text: draftReply };
  }

  const rendered = routeRendererRequest({ provider: merged.provider, payload });
  if (!rendered.used) {
    return { used: false, reason: rendered.reason || "renderer_skipped", text: draftReply };
  }

  const check = detectForbiddenPhrases(rendered.text || "");
  if (check.hasForbidden) {
    const sanitized = sanitizeReply(draftReply, draftReply.length);
    return {
      used: true,
      reason: "renderer_forbidden_fallback",
      text: sanitized.text,
      provider: rendered.provider,
      mode: "renderer"
    };
  }

  return {
    used: true,
    reason: "ok",
    text: rendered.text,
    provider: rendered.provider,
    mode: "renderer"
  };
}