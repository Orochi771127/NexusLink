import { projectRaphaelCoreResultToDecision } from "../../src/ai/runtime/embeddedRaphaelRuntime.js";
import { createLocalHmaxHostedRuntime, resolveLocalTurnsEndpoint } from "../../src/ai/runtime/localHmaxHostedRuntime.js";
import { createAuthorityReport } from "../../src/ai/runtime/raphaelRuntimeContract.js";
import { createRaphaelShadowClient } from "../../src/ai/runtime/raphaelShadowClient.js";
import { createHmaxShadowTurnRequest, createSoulTalkShadowObserver } from "../../src/ai/runtime/soulTalkShadowObserver.js";

ensureLocalStorage();
const checks = [];
const rawText = "今天想聊聊工作，但不要給建議";
const ordinaryCore = coreResult({ reply: "我先陪你把這段說清楚，不急著給答案。" });
const state = { activeCompanionId: "greyshade-cat", bond: 12, trust: 9, defense: 1, energy: 7, mood: "calm", currentLocationId: "moonlake" };
const companion = { id: "greyshade-cat", personaVersion: "greyshade-v1" };

const request = createHmaxShadowTurnRequest({
  message: rawText,
  coreResult: ordinaryCore,
  state,
  companion,
  stateVersion: 4,
  instanceId: "shadow-fixture",
  turnSequence: 1,
  now: () => Date.parse("2026-08-09T08:00:00.000Z")
});
checks.push(result("HMAX-REQUEST-WIRE", request.input.timestamp === "2026-08-09T08:00:00.000Z" && request.context.currentTurnSignals.energy === 7 && request.consent.retention === "none" && request.consent.careProcessing === "not_care"));
checks.push(result("HMAX-REQUEST-NO-AUTHORITY-CLAIMS", !containsAnyKey(request, new Set(["tenantId", "subjectId", "playerId", "sessionId", "accessToken", "apiKey"]))));
checks.push(result("HMAX-LOOPBACK-URL", String(resolveLocalTurnsEndpoint("http://127.0.0.1:8787")) === "http://127.0.0.1:8787/v1/turns"));
checks.push(expectCode("HMAX-REMOTE-URL-BLOCKED", () => resolveLocalTurnsEndpoint("https://example.com"), "non_loopback_url"));
checks.push(expectCode("HMAX-PATH-INJECTION-BLOCKED", () => resolveLocalTurnsEndpoint("http://127.0.0.1:8787/admin"), "invalid_base_path"));

let disabledFetches = 0;
const disabled = createSoulTalkShadowObserver({
  getConfiguration: () => undefined,
  fetchImpl: async () => { disabledFetches += 1; throw new Error("must_not_fetch"); },
  makeId: () => "disabled-fixture"
});
const disabledResult = await disabled.observe({ message: rawText, coreResult: ordinaryCore, state, companion, stateVersion: 1 });
checks.push(result("HMAX-DEFAULT-DISABLED-ZERO-NETWORK", disabledResult.reason === "shadow_disabled" && disabledFetches === 0));

let gatedFetches = 0;
const noConsent = createSoulTalkShadowObserver({
  getConfiguration: () => ({ enabled: true, ownerOnly: true, cloudProcessingConsent: false, baseUrl: "http://127.0.0.1:8787", getAccessToken: async () => "unused" }),
  fetchImpl: async () => { gatedFetches += 1; throw new Error("must_not_fetch"); },
  makeId: () => "consent-fixture"
});
const noConsentResult = await noConsent.observe({ message: rawText, coreResult: ordinaryCore, state, companion, stateVersion: 1 });
checks.push(result("HMAX-CONSENT-GATE-ZERO-NETWORK", noConsentResult.reason === "cloud_not_consented" && gatedFetches === 0));
const unavailable = createSoulTalkShadowObserver({ getConfiguration: () => { throw new Error("unavailable"); }, makeId: () => "config-fixture" });
const unavailableResult = await unavailable.observe({ message: rawText, coreResult: ordinaryCore, state, companion, stateVersion: 1 });
checks.push(result("HMAX-CONFIG-ERROR-ZERO-NETWORK", unavailableResult.reason === "configuration_unavailable" && unavailableResult.shadowAttempted === false));

const localTerminalCases = [
  ["HMAX-HIGH-RISK-ZERO-NETWORK", coreResult({ safety: { isHighRisk: true, category: "acute_medical" } }), "local_safety_terminal"],
  ["HMAX-POLICY-TERMINAL-ZERO-NETWORK", coreResult({ safety: { isPolicyTerminal: true, category: "diagnosis_role_limit" } }), "local_safety_terminal"],
  ["HMAX-BOUNDARY-ZERO-NETWORK", coreResult({ safety: { isBoundaryPressure: true, category: "dependency_pressure" } }), "local_boundary_turn"],
  ["HMAX-CARE-ZERO-NETWORK", coreResult({ strategy: "reflective_care" }), "local_care_turn"],
  ["HMAX-SYMBOLIC-CARE-ZERO-NETWORK", coreResult({ strategy: "symbolic_reflection" }), "local_care_turn"]
];
for (const [id, localCore, expectedReason] of localTerminalCases) {
  let calls = 0;
  const observer = createSoulTalkShadowObserver({
    getConfiguration: enabledConfiguration,
    fetchImpl: async () => { calls += 1; throw new Error("must_not_fetch"); },
    makeId: () => `gate-${id.toLowerCase()}`
  });
  const observed = await observer.observe({ message: rawText, coreResult: localCore, state, companion, stateVersion: 2 });
  checks.push(result(id, observed.reason === expectedReason && calls === 0));
}

let tokenCalls = 0;
let fetchCalls = 0;
let captured = null;
let ownerDiagnostic = null;
const observer = createSoulTalkShadowObserver({
  getConfiguration: () => ({
    ...enabledConfiguration(),
    getAccessToken: async () => { tokenCalls += 1; return "session-only-token"; },
    onResult: (event) => { ownerDiagnostic = event; }
  }),
  fetchImpl: async (url, init) => {
    fetchCalls += 1;
    captured = { url: String(url), init, request: JSON.parse(init.body) };
    return jsonResponse(hostedDecision(captured.request));
  },
  makeId: () => "ordinary-fixture",
  now: monotonicNow()
});
const compared = await observer.observe({ message: rawText, coreResult: ordinaryCore, state, companion, stateVersion: 3 });
checks.push(result("HMAX-ORDINARY-SHADOW-COMPARED", compared.shadowAttempted && compared.reason === "compared_no_apply" && compared.decision === null && fetchCalls === 1 && tokenCalls === 1));
checks.push(result("HMAX-AUTH-IN-MEMORY-HEADER-ONLY", captured.init.headers.Authorization === "Bearer session-only-token" && !captured.init.body.includes("session-only-token") && captured.init.credentials === "omit" && captured.init.cache === "no-store"));
checks.push(result("HMAX-HOSTED-INVISIBLE", compared.audit.displayedHostedSpeech === false && compared.audit.appliedHostedEffects === false && compared.audit.committedHostedMemory === false));
checks.push(result("HMAX-DIAGNOSTIC-REDACTED", ownerDiagnostic && !JSON.stringify(ownerDiagnostic).includes(rawText) && !Object.hasOwn(ownerDiagnostic, "decision")));

const missingTokenRuntime = createLocalHmaxHostedRuntime({
  baseUrl: "http://localhost:8787",
  getAccessToken: async () => "",
  fetchImpl: async () => { throw new Error("must_not_fetch"); }
});
checks.push(await expectRejectCode("HMAX-MISSING-TOKEN-FAIL-CLOSED", () => missingTokenRuntime.turn(request), "missing_access_token"));

const invalidJsonRuntime = createLocalHmaxHostedRuntime({
  baseUrl: "http://localhost:8787",
  getAccessToken: async () => "ephemeral-token",
  fetchImpl: async () => ({ ok: true, status: 200, async text() { return "not-json"; } })
});
checks.push(await expectRejectCode("HMAX-INVALID-JSON-FAIL-CLOSED", () => invalidJsonRuntime.turn(request), "invalid_json"));

const proposalRuntime = createLocalHmaxHostedRuntime({
  baseUrl: "http://localhost:8787",
  getAccessToken: async () => "ephemeral-token",
  fetchImpl: async () => jsonResponse({ ...hostedDecision(request), memoryProposals: [{ summary: "must not enter shadow" }] })
});
checks.push(await expectRejectCode("HMAX-PROPOSAL-FAIL-CLOSED", () => proposalRuntime.turn(request), "hosted_proposal_forbidden"));

const embeddedRuntime = Object.freeze({ async turn(req) { return projectRaphaelCoreResultToDecision(ordinaryCore, req); } });
const timeoutShadow = createRaphaelShadowClient({
  embeddedRuntime,
  hostedRuntime: { async turn(_req, { signal } = {}) { await untilAborted(signal); throw abortError(); } },
  timeoutMs: 10
});
const timeoutResult = await timeoutShadow.compare(createHmaxShadowTurnRequest({ message: rawText, coreResult: ordinaryCore, state, companion, instanceId: "timeout-fixture" }));
checks.push(result("HMAX-TIMEOUT-ONE-FALLBACK", timeoutResult.reason === "timeout_or_abort" && timeoutResult.decision === null && timeoutResult.audit.displayedHostedSpeech === false));

const failed = checks.filter((item) => !item.pass);
console.log(JSON.stringify({ ok: failed.length === 0, total: checks.length, passed: checks.length - failed.length, failed: failed.length, cases: checks }, null, 2));
if (failed.length) process.exitCode = 1;

function enabledConfiguration() {
  return { enabled: true, ownerOnly: true, cloudProcessingConsent: true, baseUrl: "http://127.0.0.1:8787", getAccessToken: async () => "fixture-token" };
}
function coreResult({ reply = "本機回覆", safety = {}, strategy = "contextual_ack" } = {}) {
  return { now: Date.parse("2026-08-09T08:00:00.000Z"), safety, responseStrategy: { strategy }, output: { replyRole: safety.isHighRisk || safety.isPolicyTerminal ? "system" : "companion", reply } };
}
function hostedDecision(req) {
  return {
    contractVersion: req.contractVersion,
    requestId: req.requestId,
    turnId: `hosted:${req.requestId}`,
    coreVersion: "hmax-shadow-fixture-v1",
    authority: createAuthorityReport(),
    safety: { level: "none", category: "none", terminal: false, localOnly: false },
    speech: { role: "companion", text: "HMAX 候選回覆（不可見）", final: true },
    affect: null,
    boundary: { active: false },
    supportDecision: { mode: "ordinary", source: "hmax-fixture" },
    memoryProposals: [],
    effectProposals: [],
    audit: { modelTrusted: false, directGameMutation: false, rawInputPersisted: false, rawInputExported: false }
  };
}
function jsonResponse(value) { return { ok: true, status: 200, async text() { return JSON.stringify(value); } }; }
function containsAnyKey(value, needles) { if (!value || typeof value !== "object") return false; return Object.entries(value).some(([key, child]) => needles.has(key) || containsAnyKey(child, needles)); }
function monotonicNow() { let value = 100; return () => { value += 5; return value; }; }
function untilAborted(signal) { return new Promise((resolve) => { if (signal?.aborted) resolve(); else signal?.addEventListener("abort", resolve, { once: true }); }); }
function abortError() { const error = new Error("aborted"); error.name = "AbortError"; return error; }
function expectCode(id, fn, code) { try { fn(); return { id, pass: false, error: "no_error" }; } catch (error) { return result(id, error.code === code, error.code); } }
async function expectRejectCode(id, fn, code) { try { await fn(); return { id, pass: false, error: "no_error" }; } catch (error) { return result(id, error.code === code, error.code); } }
function result(id, pass, detail = null) { return { id, pass: Boolean(pass), detail }; }
function ensureLocalStorage() { if (globalThis.localStorage) return; const values = new Map(); Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { get length() { return values.size; }, key(index) { return [...values.keys()][index] ?? null; }, getItem(key) { return values.get(String(key)) ?? null; }, setItem(key, value) { values.set(String(key), String(value)); }, removeItem(key) { values.delete(String(key)); }, clear() { values.clear(); } } }); }
