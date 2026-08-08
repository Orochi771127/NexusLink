export const RAPHAEL_CONTRACT_VERSION = "1.0.0-draft.1";

const REQUEST_KEYS = new Set(["contractVersion", "requestId", "idempotencyKey", "client", "actor", "input", "context", "allowedEffects", "consent", "capabilities"]);
const CLIENT_KEYS = new Set(["productId", "clientVersion", "instanceId", "locale"]);
const ACTOR_KEYS = new Set(["companionId", "personaVersion"]);
const INPUT_KEYS = new Set(["text", "source", "timestamp"]);
const CONTEXT_KEYS = new Set(["stateVersion", "scene", "relationship", "signals"]);
const CONSENT_KEYS = new Set(["cloudProcessing", "retention", "careProcessing"]);
const CAPABILITY_KEYS = new Set(["embeddedFallback", "memoryProposals", "effectProposals"]);

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
  if (value.requestId.length > 128 || value.idempotencyKey.length > 128) fail("field_too_long", "$request", "request identifiers exceed 128 characters");
  validateObject(value.client, CLIENT_KEYS, ["productId", "clientVersion", "instanceId", "locale"], "$request.client");
  validateObject(value.actor, ACTOR_KEYS, ["companionId", "personaVersion"], "$request.actor");
  validateObject(value.input, INPUT_KEYS, ["text", "source", "timestamp"], "$request.input");
  validateObject(value.context, CONTEXT_KEYS, ["stateVersion", "scene", "relationship", "signals"], "$request.context");
  validateObject(value.consent, CONSENT_KEYS, ["cloudProcessing", "retention", "careProcessing"], "$request.consent");
  validateObject(value.capabilities, CAPABILITY_KEYS, ["embeddedFallback", "memoryProposals", "effectProposals"], "$request.capabilities");
  if (typeof value.input.text !== "string" || value.input.text.length > 4000) fail("invalid_input_text", "$request.input.text", "input.text must contain at most 4000 characters");
  if (!Number.isFinite(value.input.timestamp) || !Number.isFinite(value.context.stateVersion)) fail("invalid_number", "$request", "timestamp and stateVersion must be finite numbers");
  if (!Array.isArray(value.allowedEffects) || !value.allowedEffects.every((item) => typeof item === "string")) fail("invalid_allowed_effects", "$request.allowedEffects", "allowedEffects must be strings");
  if (typeof value.consent.cloudProcessing !== "boolean") fail("invalid_consent", "$request.consent.cloudProcessing", "cloudProcessing must be boolean");
  if (!["none", "ephemeral", "eligible_summary"].includes(value.consent.retention)) fail("invalid_retention", "$request.consent.retention", "Unsupported retention consent");
  if (!["official", "device", "not_care"].includes(value.consent.careProcessing)) fail("invalid_care_processing", "$request.consent.careProcessing", "Unsupported Care processing choice");
  for (const key of ["embeddedFallback", "memoryProposals", "effectProposals"]) if (typeof value.capabilities[key] !== "boolean") fail("invalid_capability", `$request.capabilities.${key}`, `${key} must be boolean`);
  for (const forbidden of ["tenantId", "subjectId", "playerId", "sessionId", "accessToken", "apiKey"]) {
    if (containsKey(value, forbidden)) fail("body_authority_forbidden", `$request..${forbidden}`, `${forbidden} must come from verified claims, never the body`);
  }
  return value;
}

export function validateTurnDecision(value, request) {
  assertObject(value, "$decision");
  rejectUnknown(value, new Set(["contractVersion", "requestId", "turnId", "coreVersion", "authority", "safety", "speech", "affect", "boundary", "supportDecision", "memoryProposals", "effectProposals", "audit"]), "$decision");
  if (value.contractVersion !== RAPHAEL_CONTRACT_VERSION || value.requestId !== request.requestId) fail("decision_mismatch", "$decision", "Decision does not match request");
  if (!Array.isArray(value.memoryProposals) || !Array.isArray(value.effectProposals)) fail("invalid_decision_proposals", "$decision", "Proposal fields must be arrays");
  if (value.audit?.modelTrusted !== false || value.audit?.directGameMutation !== false || value.audit?.rawInputPersisted !== false || value.audit?.rawInputExported !== false) fail("authority_violation", "$decision.audit", "Decision audit invariants failed");
  if (value.authority?.gameMutation !== "NexusLinkReducer") fail("authority_violation", "$decision.authority.gameMutation", "Client reducer must retain game authority");
  const allowed = new Set(request.allowedEffects);
  if (value.effectProposals.some((proposal) => !proposal || typeof proposal.type !== "string" || !allowed.has(proposal.type))) fail("effect_not_allowed", "$decision.effectProposals", "Effect is not allowlisted");
  return value;
}

export function freezeTurnContext(request) { validateTurnRequest(request); return deepFreeze(clone(request)); }
export function createAuthorityReport() { return Object.freeze({ cognition: "RaphaelCore", speech: "RaphaelCore", memoryEligibility: "RaphaelCore", persistence: "MemoryPort", gameMutation: "NexusLinkReducer" }); }

function validateObject(value, keys, required, path) { assertObject(value, path); rejectUnknown(value, keys, path); for (const key of required) if (!(key in value)) fail("missing_field", `${path}.${key}`, `Missing ${path}.${key}`); }
function assertObject(value, path) { if (!value || typeof value !== "object" || Array.isArray(value)) fail("invalid_object", path, `${path} must be an object`); }
function requiredString(value, path) { if (typeof value !== "string" || !value.trim()) fail("missing_field", path, `${path} must be a non-empty string`); }
function rejectUnknown(value, allowed, path) { for (const key of Object.keys(value)) if (!allowed.has(key)) fail("unknown_field", `${path}.${key}`, `Unknown field ${path}.${key}`); }
function containsKey(value, needle) { if (!value || typeof value !== "object") return false; if (Object.prototype.hasOwnProperty.call(value, needle)) return true; return Object.values(value).some((item) => containsKey(item, needle)); }
function fail(code, path, message) { throw new RaphaelContractError(code, path, message); }
function clone(value) { return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
function deepFreeze(value) { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; Object.freeze(value); Object.values(value).forEach(deepFreeze); return value; }
