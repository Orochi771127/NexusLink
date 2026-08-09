export const RAPHAEL_CONTRACT_VERSION = "1.0.0-draft.1";

const REQUEST_KEYS = new Set(["contractVersion", "requestId", "idempotencyKey", "client", "actor", "input", "context", "allowedEffects", "consent", "capabilities"]);
const CLIENT_KEYS = new Set(["productId", "clientVersion", "instanceId", "locale"]);
const ACTOR_KEYS = new Set(["companionId", "personaVersion"]);
const INPUT_KEYS = new Set(["text", "source", "timestamp"]);
const CONTEXT_KEYS = new Set(["stateVersion", "scene", "relationship", "currentTurnSignals"]);
const CONSENT_KEYS = new Set(["cloudProcessing", "retention", "careProcessing"]);
const CAPABILITY_KEYS = new Set(["embeddedFallback", "memoryProposals", "effectProposals"]);
const DECISION_KEYS = new Set(["contractVersion", "requestId", "turnId", "coreVersion", "authority", "safety", "speech", "affect", "boundary", "supportDecision", "memoryProposals", "effectProposals", "audit"]);
const AUTHORITY_KEYS = new Set(["cognition", "speech", "memoryEligibility", "persistence", "gameMutation"]);
const SAFETY_KEYS = new Set(["level", "category", "terminal", "localOnly"]);
const SPEECH_KEYS = new Set(["role", "text", "final"]);
const BOUNDARY_KEYS = new Set(["active", "reason", "responseMode"]);
const SUPPORT_KEYS = new Set(["mode", "source", "cardId"]);
const AUDIT_KEYS = new Set(["modelTrusted", "directGameMutation", "rawInputPersisted", "rawInputExported"]);
const EFFECT_KEYS = new Set(["type", "payload"]);
const AFFECT_KEYS = new Set(["valence", "arousal", "energy", "agency", "socialOpenness", "curiosity", "uncertainty", "boundaryActivation", "repairNeed", "initiativeReadiness", "updatedAt"]);

export class RaphaelContractError extends Error {
  constructor(code, path, message) { super(message); this.name = "RaphaelContractError"; this.code = code; this.path = path; }
}

export function validateTurnRequest(value) {
  assertObject(value, "$request");
  rejectUnknown(value, REQUEST_KEYS, "$request");
  requiredString(value.contractVersion, "$request.contractVersion");
  if (value.contractVersion !== RAPHAEL_CONTRACT_VERSION) fail("unsupported_contract_version", "$request.contractVersion", `Unsupported contract ${value.contractVersion}`);
  requiredString(value.requestId, "$request.requestId");
  requiredString(value.idempotencyKey, "$request.idempotencyKey");
  if (value.requestId.length < 8 || value.idempotencyKey.length < 8 || value.requestId.length > 128 || value.idempotencyKey.length > 128) fail("invalid_identifier", "$request", "request identifiers must contain 8 to 128 characters");
  validateObject(value.client, CLIENT_KEYS, ["productId", "clientVersion", "instanceId", "locale"], "$request.client");
  validateObject(value.actor, ACTOR_KEYS, ["companionId", "personaVersion"], "$request.actor");
  validateObject(value.input, INPUT_KEYS, ["text", "source", "timestamp"], "$request.input");
  validateObject(value.context, CONTEXT_KEYS, ["stateVersion", "scene", "relationship", "currentTurnSignals"], "$request.context");
  validateObject(value.consent, CONSENT_KEYS, ["cloudProcessing", "retention", "careProcessing"], "$request.consent");
  validateObject(value.capabilities, CAPABILITY_KEYS, ["embeddedFallback", "memoryProposals", "effectProposals"], "$request.capabilities");
  boundedString(value.client.productId, "$request.client.productId", 2, 64);
  boundedString(value.client.clientVersion, "$request.client.clientVersion", 1, 64);
  boundedString(value.client.instanceId, "$request.client.instanceId", 8, 128);
  boundedString(value.client.locale, "$request.client.locale", 2, 32);
  boundedString(value.actor.companionId, "$request.actor.companionId", 2, 96);
  boundedString(value.actor.personaVersion, "$request.actor.personaVersion", 1, 64);
  boundedString(value.input.source, "$request.input.source", 2, 64);
  if (typeof value.input.text !== "string" || !value.input.text.trim() || [...value.input.text].length > 4000) fail("invalid_input_text", "$request.input.text", "input.text must contain 1 to 4000 characters");
  if (!isIsoTimestamp(value.input.timestamp)) fail("invalid_timestamp", "$request.input.timestamp", "input.timestamp must be an ISO-8601 date-time string");
  if (!Number.isSafeInteger(value.context.stateVersion) || value.context.stateVersion < 0) fail("invalid_number", "$request.context.stateVersion", "stateVersion must be a non-negative safe integer");
  for (const key of ["scene", "relationship", "currentTurnSignals"]) assertObject(value.context[key], `$request.context.${key}`);
  if (!Array.isArray(value.allowedEffects) || value.allowedEffects.length > 32 || !value.allowedEffects.every((item) => typeof item === "string" && item.length >= 1 && item.length <= 96)) fail("invalid_allowed_effects", "$request.allowedEffects", "allowedEffects must contain at most 32 bounded strings");
  if (value.consent.cloudProcessing !== true) fail("invalid_consent", "$request.consent.cloudProcessing", "Hosted requests require explicit cloud-processing consent");
  if (!["none", "session", "minimal"].includes(value.consent.retention)) fail("invalid_retention", "$request.consent.retention", "Unsupported retention consent");
  if (!["not_care", "official_raphael"].includes(value.consent.careProcessing)) fail("invalid_care_processing", "$request.consent.careProcessing", "Unsupported Care processing choice");
  for (const key of ["embeddedFallback", "memoryProposals", "effectProposals"]) if (typeof value.capabilities[key] !== "boolean") fail("invalid_capability", `$request.capabilities.${key}`, `${key} must be boolean`);
  for (const forbidden of ["tenantId", "subjectId", "playerId", "sessionId", "accessToken", "apiKey"]) {
    if (containsKey(value, forbidden)) fail("body_authority_forbidden", `$request..${forbidden}`, `${forbidden} must come from verified claims, never the body`);
  }
  return value;
}

export function validateTurnDecision(value, request) {
  assertObject(value, "$decision");
  rejectUnknown(value, DECISION_KEYS, "$decision");
  if (value.contractVersion !== RAPHAEL_CONTRACT_VERSION || value.requestId !== request.requestId) fail("decision_mismatch", "$decision", "Decision does not match request");
  boundedString(value.turnId, "$decision.turnId", 1, 256);
  boundedString(value.coreVersion, "$decision.coreVersion", 1, 128);
  validateObject(value.authority, AUTHORITY_KEYS, [...AUTHORITY_KEYS], "$decision.authority");
  validateObject(value.safety, SAFETY_KEYS, [...SAFETY_KEYS], "$decision.safety");
  validateObject(value.speech, SPEECH_KEYS, [...SPEECH_KEYS], "$decision.speech");
  validateObject(value.boundary, BOUNDARY_KEYS, ["active"], "$decision.boundary");
  validateObject(value.supportDecision, SUPPORT_KEYS, ["mode", "source"], "$decision.supportDecision");
  validateObject(value.audit, AUDIT_KEYS, [...AUDIT_KEYS], "$decision.audit");
  boundedString(value.safety.level, "$decision.safety.level", 1, 64);
  boundedString(value.safety.category, "$decision.safety.category", 1, 96);
  if (typeof value.safety.terminal !== "boolean" || typeof value.safety.localOnly !== "boolean") fail("invalid_safety_decision", "$decision.safety", "Safety terminal flags must be boolean");
  if (!["companion", "system"].includes(value.speech.role) || typeof value.speech.text !== "string" || value.speech.text.length > 1000 || value.speech.final !== true) fail("invalid_speech_decision", "$decision.speech", "Speech must be final companion or system text");
  if (value.safety.terminal && (value.safety.localOnly !== true || value.speech.role !== "system")) fail("invalid_safety_decision", "$decision", "Safety terminals must remain local system speech");
  if (typeof value.boundary.active !== "boolean") fail("invalid_boundary_decision", "$decision.boundary.active", "Boundary active must be boolean");
  boundedString(value.supportDecision.mode, "$decision.supportDecision.mode", 1, 96);
  boundedString(value.supportDecision.source, "$decision.supportDecision.source", 1, 96);
  validateAffect(value.affect);
  if (!Array.isArray(value.memoryProposals) || value.memoryProposals.length > 1 || !Array.isArray(value.effectProposals)) fail("invalid_decision_proposals", "$decision", "Proposal fields must be bounded arrays");
  if (value.audit?.modelTrusted !== false || value.audit?.directGameMutation !== false || value.audit?.rawInputPersisted !== false || value.audit?.rawInputExported !== false) fail("authority_violation", "$decision.audit", "Decision audit invariants failed");
  if (value.authority?.cognition !== "RaphaelCore" || value.authority?.speech !== "RaphaelCore" || value.authority?.memoryEligibility !== "RaphaelCore" || value.authority?.persistence !== "MemoryPort" || value.authority?.gameMutation !== "NexusLinkReducer") fail("authority_violation", "$decision.authority", "RaphaelCore, MemoryPort and NexusLinkReducer authority must remain fixed");
  const allowed = new Set(request.allowedEffects);
  if (value.effectProposals.length > 32) fail("invalid_decision_proposals", "$decision.effectProposals", "Too many effect proposals");
  for (const proposal of value.effectProposals) {
    validateObject(proposal, EFFECT_KEYS, ["type", "payload"], "$decision.effectProposals[]");
    assertObject(proposal.payload, "$decision.effectProposals[].payload");
    if (typeof proposal.type !== "string" || !allowed.has(proposal.type)) fail("effect_not_allowed", "$decision.effectProposals", "Effect is not allowlisted");
  }
  return value;
}

export function freezeTurnContext(request) { validateTurnRequest(request); return deepFreeze(clone(request)); }
export function createAuthorityReport() { return Object.freeze({ cognition: "RaphaelCore", speech: "RaphaelCore", memoryEligibility: "RaphaelCore", persistence: "MemoryPort", gameMutation: "NexusLinkReducer" }); }

function validateObject(value, keys, required, path) { assertObject(value, path); rejectUnknown(value, keys, path); for (const key of required) if (!(key in value)) fail("missing_field", `${path}.${key}`, `Missing ${path}.${key}`); }
function assertObject(value, path) { if (!value || typeof value !== "object" || Array.isArray(value)) fail("invalid_object", path, `${path} must be an object`); }
function requiredString(value, path) { if (typeof value !== "string" || !value.trim()) fail("missing_field", path, `${path} must be a non-empty string`); }
function boundedString(value, path, min, max) { requiredString(value, path); if (value.length < min || value.length > max) fail("field_length", path, `${path} must contain ${min} to ${max} characters`); }
function validateAffect(value) { if (value == null) return; validateObject(value, AFFECT_KEYS, [], "$decision.affect"); for (const [key, item] of Object.entries(value)) { if (key === "updatedAt") { if (!isIsoTimestamp(item)) fail("invalid_affect", `$decision.affect.${key}`, "Affect updatedAt must be an ISO timestamp"); } else if (!Number.isFinite(item)) fail("invalid_affect", `$decision.affect.${key}`, "Affect values must be finite numbers"); } }
function isIsoTimestamp(value) { if (typeof value !== "string" || value.length > 40 || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return false; return Number.isFinite(Date.parse(value)); }
function rejectUnknown(value, allowed, path) { for (const key of Object.keys(value)) if (!allowed.has(key)) fail("unknown_field", `${path}.${key}`, `Unknown field ${path}.${key}`); }
function containsKey(value, needle) { if (!value || typeof value !== "object") return false; if (Object.prototype.hasOwnProperty.call(value, needle)) return true; return Object.values(value).some((item) => containsKey(item, needle)); }
function fail(code, path, message) { throw new RaphaelContractError(code, path, message); }
function clone(value) { return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; Object.freeze(value); Object.values(value).forEach(deepFreeze); return value; }
