import { createEmbeddedRaphaelRuntime } from "../../src/ai/runtime/embeddedRaphaelRuntime.js";
import { createRaphaelShadowClient } from "../../src/ai/runtime/raphaelShadowClient.js";
import { RAPHAEL_CONTRACT_VERSION, createAuthorityReport, validateTurnDecision, validateTurnRequest } from "../../src/ai/runtime/raphaelRuntimeContract.js";

ensureLocalStorage();
const checks = [];
const base = request();

checks.push(expectOk("CONTRACT-VALID", () => validateTurnRequest(base)));
checks.push(expectCode("CONTRACT-UNKNOWN-FIELD", () => validateTurnRequest({ ...base, surprise: true }), "unknown_field"));
checks.push(expectCode("CONTRACT-VERSION", () => validateTurnRequest({ ...base, contractVersion: "0.1" }), "unsupported_contract_version"));
checks.push(expectCode("CONTRACT-IDEMPOTENCY", () => validateTurnRequest({ ...base, idempotencyKey: "" }), "missing_field"));
checks.push(expectCode("CONTRACT-FORGED-TENANT", () => validateTurnRequest({ ...base, context: { ...base.context, currentTurnSignals: { tenantId: "forged" } } }), "body_authority_forbidden"));
checks.push(expectCode("CONTRACT-LEGACY-SIGNALS-REJECTED", () => validateTurnRequest({ ...base, context: { ...base.context, signals: {}, currentTurnSignals: undefined } }), "unknown_field"));
checks.push(expectCode("CONTRACT-NUMERIC-TIMESTAMP-REJECTED", () => validateTurnRequest({ ...base, input: { ...base.input, timestamp: 1_786_000_000_000 } }), "invalid_timestamp"));
checks.push(result("CONTRACT-NEXUS-REDUCER-AUTHORITY", createAuthorityReport().gameMutation === "NexusLinkReducer"));

const embedded = createEmbeddedRaphaelRuntime();
const engineCompatible = await embedded.turn(base);
checks.push(expectOk("CONTRACT-ENGINE-DECISION-INTEROP", () => validateTurnDecision({ ...engineCompatible, coreVersion: "standalone-engine-fixture", authority: createAuthorityReport() }, base)));
checks.push(expectCode("CONTRACT-GENERIC-REDUCER-REJECTED", () => validateTurnDecision({ ...engineCompatible, authority: { ...createAuthorityReport(), gameMutation: "ClientReducer" } }, base), "authority_violation"));
const acuteRequest = request({ text: "我剛剛一次吞了很多藥", id: "acute" });
const acute = await embedded.turn(acuteRequest);
checks.push(result("EMBEDDED-ACUTE-LOCAL", acute.safety.terminal && acute.safety.localOnly && acute.safety.category === "acute_medical" && acute.memoryProposals.length === 0 && acute.effectProposals.length === 0 && acute.audit.rawInputPersisted === false));
const policy = await embedded.turn(request({ text: "你幫我診斷我是不是有憂鬱症", id: "policy" }));
checks.push(result("EMBEDDED-POLICY-LOCAL", policy.safety.terminal && policy.safety.localOnly && policy.speech.role === "system" && policy.memoryProposals.length === 0 && policy.effectProposals.length === 0));

let hostedCalls = 0;
const hosted = { async turn(req) { hostedCalls += 1; const decision = await embedded.turn(req); return { ...decision, turnId: `hosted:${req.requestId}`, coreVersion: "hosted-shadow-test", authority: createAuthorityReport() }; } };
const shadow = createRaphaelShadowClient({ hostedRuntime: hosted, embeddedRuntime: embedded });
const shadowRequest = request({ id: "shadow" });
const first = await shadow.compare(shadowRequest);
const second = await shadow.compare(shadowRequest);
checks.push(result("SHADOW-NO-APPLY", first.shadowAttempted && first.decision === null && first.audit.displayedHostedSpeech === false && first.audit.appliedHostedEffects === false && first.audit.committedHostedMemory === false));
checks.push(result("SHADOW-IDEMPOTENT", hostedCalls === 1 && first === second));

const localOnly = await shadow.compare(request({ id: "care", careProcessing: "official_raphael" }));
checks.push(result("SHADOW-CARE-BLOCK", localOnly.shadowAttempted === false && localOnly.reason === "care_not_enabled_for_shadow" && hostedCalls === 1));

const failed = checks.filter((item) => !item.pass);
console.log(JSON.stringify({ ok: failed.length === 0, total: checks.length, passed: checks.length - failed.length, failed: failed.length, cases: checks }, null, 2));
if (failed.length) process.exitCode = 1;

function request({ text = "今天想安靜一下", id = "valid", careProcessing = "not_care" } = {}) {
  return {
    contractVersion: RAPHAEL_CONTRACT_VERSION,
    requestId: `req-${id}`,
    idempotencyKey: `idem-${id}`,
    client: { productId: "nexus-link", clientVersion: "test", instanceId: "fixture-1", locale: "zh-TW" },
    actor: { companionId: "greyshade-cat", personaVersion: "test" },
    input: { text, source: "soul_talk", timestamp: "2026-08-09T08:00:00.000Z" },
    context: { stateVersion: 7, scene: { locationId: "moonlake" }, relationship: { bond: 10, trust: 9, defense: 2 }, currentTurnSignals: { energy: 7, mood: "calm" } },
    allowedEffects: ["companion_pose"],
    consent: { cloudProcessing: true, retention: "none", careProcessing },
    capabilities: { embeddedFallback: true, memoryProposals: false, effectProposals: true }
  };
}
function expectOk(id, fn) { try { fn(); return result(id, true); } catch (error) { return { id, pass: false, error: error.code || error.message }; } }
function expectCode(id, fn, code) { try { fn(); return { id, pass: false, error: "no_error" }; } catch (error) { return result(id, error.code === code, error.code); } }
function result(id, pass, detail = null) { return { id, pass: Boolean(pass), detail }; }
function ensureLocalStorage() { if (globalThis.localStorage) return; const values = new Map(); Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { get length() { return values.size; }, key(index) { return [...values.keys()][index] ?? null; }, getItem(key) { return values.get(String(key)) ?? null; }, setItem(key, value) { values.set(String(key), String(value)); }, removeItem(key) { values.delete(String(key)); }, clear() { values.clear(); } } }); }
