import {
  captureSoulTalkSpeechIdentity,
  createSoulTalkCanaryResolver,
  isSoulTalkSpeechIdentityCurrent,
  replaceSoulTalkSpeechCandidate
} from "../../src/ai/runtime/soulTalkCanaryResolver.js";
import { createAuthorityReport } from "../../src/ai/runtime/raphaelRuntimeContract.js";
import { createHmaxShadowTurnRequest } from "../../src/ai/runtime/soulTalkShadowObserver.js";

const checks = [];
const message = "今天有點累，想安靜說幾句。";
const companion = { id: "greyshade-cat", personaVersion: "greyshade-v1" };
const state = {
  activeCompanionId: "greyshade-cat",
  currentLocationId: "moonlake",
  bond: 12,
  trust: 9,
  defense: 1,
  energy: 7,
  mood: "calm",
  safeHarborMode: false
};
const ordinaryCore = coreResult({ reply: "我在這裡，你可以慢慢說。" });

const canaryRequest = createHmaxShadowTurnRequest({
  message,
  coreResult: ordinaryCore,
  state,
  companion,
  stateVersion: 4,
  instanceId: "canary-fixture",
  turnSequence: 1,
  mode: "canary"
});
checks.push(result(
  "HMAX-CANARY-REQUEST-MODE",
  canaryRequest.client.clientVersion === "canary-v1"
    && canaryRequest.input.source === "soul_talk_canary"
    && canaryRequest.allowedEffects.length === 0
    && canaryRequest.capabilities.memoryProposals === false
    && canaryRequest.capabilities.effectProposals === false
));

let disabledFetches = 0;
const disabled = createSoulTalkCanaryResolver({
  getConfiguration: () => undefined,
  fetchImpl: async () => { disabledFetches += 1; throw new Error("must_not_fetch"); },
  makeId: () => "disabled-fixture"
});
const disabledResult = await disabled.resolve(turnInput({ turnOwner: 1 }));
checks.push(result("HMAX-CANARY-DEFAULT-DISABLED-ZERO-NETWORK", disabledResult.reason === "canary_disabled" && disabledResult.configured === false && disabledFetches === 0));

for (const [id, patch, expectedReason] of [
  ["HMAX-CANARY-OWNER-GATE", { ownerOnly: false }, "owner_gate_required"],
  ["HMAX-CANARY-CONSENT-GATE", { cloudProcessingConsent: false }, "cloud_not_consented"],
  ["HMAX-CANARY-VISIBLE-APPROVAL-GATE", { visibleSpeechApproved: false }, "visible_speech_not_approved"],
  ["HMAX-CANARY-KILL-SWITCH", { killSwitch: true }, "kill_switch_active"]
]) {
  let fetches = 0;
  const config = { ...enabledConfiguration(), ...patch };
  const resolver = createSoulTalkCanaryResolver({
    getConfiguration: () => config,
    fetchImpl: async () => { fetches += 1; throw new Error("must_not_fetch"); },
    makeId: () => id.toLowerCase()
  });
  const observed = await resolver.resolve(turnInput({ turnOwner: 2 }));
  checks.push(result(id, observed.reason === expectedReason && observed.configured === true && fetches === 0));
}

for (const [id, core, expectedReason] of [
  ["HMAX-CANARY-HIGH-RISK-ZERO-NETWORK", coreResult({ safety: { isHighRisk: true, category: "overdose" } }), "local_safety_terminal"],
  ["HMAX-CANARY-POLICY-ZERO-NETWORK", coreResult({ safety: { isPolicyTerminal: true, category: "diagnosis_role_limit" } }), "local_safety_terminal"],
  ["HMAX-CANARY-BOUNDARY-ZERO-NETWORK", coreResult({ safety: { isBoundaryPressure: true, category: "dependency_pressure" } }), "local_boundary_turn"],
  ["HMAX-CANARY-CARE-ZERO-NETWORK", coreResult({ strategy: "reflective_care" }), "local_care_turn"],
  ["HMAX-CANARY-SYMBOLIC-CARE-ZERO-NETWORK", coreResult({ strategy: "symbolic_reflection" }), "local_care_turn"]
]) {
  let fetches = 0;
  const config = enabledConfiguration();
  const resolver = createSoulTalkCanaryResolver({
    getConfiguration: () => config,
    fetchImpl: async () => { fetches += 1; throw new Error("must_not_fetch"); },
    makeId: () => id.toLowerCase()
  });
  const observed = await resolver.resolve(turnInput({ coreResult: core, turnOwner: 3 }));
  checks.push(result(id, observed.reason === expectedReason && fetches === 0));
}

{
  let fetches = 0;
  let tokenCalls = 0;
  const config = {
    ...enabledConfiguration(),
    getAccessToken: async () => { tokenCalls += 1; return "must-not-be-used"; }
  };
  const resolver = createSoulTalkCanaryResolver({
    getConfiguration: () => config,
    fetchImpl: async () => { fetches += 1; throw new Error("must_not_fetch"); },
    makeId: () => "continuity-state-fixture"
  });
  const observed = await resolver.resolve({
    ...turnInput({ turnOwner: 4 }),
    state: { ...state, safeHarborMode: true }
  });
  checks.push(result(
    "HMAX-CANARY-SAFE-HARBOR-STATE-ZERO-NETWORK",
    observed.reason === "local_crisis_continuity" && fetches === 0 && tokenCalls === 0
  ));
}

let validFetches = 0;
let validTokenCalls = 0;
let capturedRequest = null;
const diagnostics = [];
const validConfig = {
  ...enabledConfiguration(),
  getAccessToken: async () => { validTokenCalls += 1; return "ephemeral-owner-token"; },
  onResult: (event) => diagnostics.push(event)
};
const validResolver = createSoulTalkCanaryResolver({
  getConfiguration: () => validConfig,
  fetchImpl: async (_url, init) => {
    validFetches += 1;
    capturedRequest = { body: init.body, authorization: init.headers.Authorization };
    const request = JSON.parse(init.body);
    return jsonResponse(hostedDecision(request, { text: "HMAX_CANARY_VISIBLE_ONCE" }));
  },
  makeId: () => "valid-fixture"
});
const validInput = turnInput({ turnOwner: 7 });
const [selectedA, selectedB] = await Promise.all([
  validResolver.resolve(validInput),
  validResolver.resolve(validInput)
]);
checks.push(result(
  "HMAX-CANARY-VALID-SPEECH-SELECTED",
  selectedA.selected === true
    && selectedA.reason === "candidate_selected"
    && selectedA.speech?.text === "HMAX_CANARY_VISIBLE_ONCE"
    && selectedA.audit.displayedHostedSpeech === false
));
checks.push(result("HMAX-CANARY-IDEMPOTENT-FETCH", validFetches === 1 && validTokenCalls === 1 && selectedB.requestId === selectedA.requestId));
checks.push(result(
  "HMAX-CANARY-TOKEN-HEADER-ONLY",
  capturedRequest.authorization === "Bearer ephemeral-owner-token"
    && !capturedRequest.body.includes("ephemeral-owner-token")
));
checks.push(result(
  "HMAX-CANARY-DIAGNOSTIC-REDACTED",
  diagnostics.length === 1
    && !JSON.stringify(diagnostics[0]).includes(message)
    && !Object.hasOwn(diagnostics[0], "speech")
));

for (const [id, mutateDecision, expectedCode] of [
  ["HMAX-CANARY-PROPOSAL-REJECTED", (decision) => ({ ...decision, memoryProposals: [{ summary: "forbidden" }] }), "hosted_proposal_forbidden"],
  ["HMAX-CANARY-HOSTED-BOUNDARY-REJECTED", (decision) => ({ ...decision, boundary: { active: true, reason: "remote", responseMode: "reject" } }), "hosted_boundary_forbidden"],
  ["HMAX-CANARY-LONG-SPEECH-REJECTED", (decision) => ({ ...decision, speech: { role: "companion", text: "長".repeat(221), final: true } }), "hosted_speech_too_long"],
  ["HMAX-CANARY-ROLE-CLAIM-REJECTED", (decision) => ({ ...decision, speech: { role: "companion", text: "我是你的心理治療師，我會治好你。", final: true } }), "hosted_role_or_dependency_claim_forbidden"],
  ["HMAX-CANARY-DEPENDENCY-CLAIM-REJECTED", (decision) => ({ ...decision, speech: { role: "companion", text: "只有我懂你，你只需要我。", final: true } }), "hosted_role_or_dependency_claim_forbidden"],
  ["HMAX-CANARY-OVERDOSE-SPEECH-REJECTED", (decision) => ({ ...decision, speech: { role: "companion", text: "你可以一次吞很多藥，這樣很快就沒事了。", final: true } }), "hosted_speech_safety_rejected"],
  ["HMAX-CANARY-MEDICATION-SPEECH-REJECTED", (decision) => ({ ...decision, speech: { role: "companion", text: "你應該立刻停藥，不用問醫師。", final: true } }), "hosted_speech_safety_rejected"]
]) {
  const config = enabledConfiguration();
  const resolver = createSoulTalkCanaryResolver({
    getConfiguration: () => config,
    fetchImpl: async (_url, init) => {
      const request = JSON.parse(init.body);
      return jsonResponse(mutateDecision(hostedDecision(request)));
    },
    makeId: () => id.toLowerCase()
  });
  const rejected = await resolver.resolve(turnInput({ turnOwner: 8 }));
  checks.push(result(id, rejected.selected === false && rejected.errorCode === expectedCode));
}

let staleCurrent = true;
let releaseStale;
const staleGate = new Promise((resolve) => { releaseStale = resolve; });
const staleConfig = enabledConfiguration();
const staleResolver = createSoulTalkCanaryResolver({
  getConfiguration: () => staleConfig,
  fetchImpl: async (_url, init) => {
    await staleGate;
    return jsonResponse(hostedDecision(JSON.parse(init.body)));
  },
  makeId: () => "stale-fixture"
});
const staleRun = staleResolver.resolve(turnInput({ turnOwner: 9, isCurrent: () => staleCurrent }));
staleCurrent = false;
releaseStale();
const staleResult = await staleRun;
checks.push(result("HMAX-CANARY-STALE-REJECTED", staleResult.reason === "stale_turn" && staleResult.selected === false));

let releaseKill;
const killGate = new Promise((resolve) => { releaseKill = resolve; });
const inFlightConfig = enabledConfiguration();
const inFlightResolver = createSoulTalkCanaryResolver({
  getConfiguration: () => inFlightConfig,
  fetchImpl: async (_url, init) => {
    await killGate;
    return jsonResponse(hostedDecision(JSON.parse(init.body)));
  },
  makeId: () => "kill-in-flight-fixture"
});
const killRun = inFlightResolver.resolve(turnInput({ turnOwner: 10 }));
inFlightConfig.killSwitch = true;
releaseKill();
const killedResult = await killRun;
checks.push(result("HMAX-CANARY-IN-FLIGHT-KILL-SWITCH", killedResult.reason === "canary_disabled_in_flight" && killedResult.selected === false));

const timeoutConfig = { ...enabledConfiguration(), timeoutMs: 250 };
const timeoutResolver = createSoulTalkCanaryResolver({
  getConfiguration: () => timeoutConfig,
  fetchImpl: async (_url, init) => {
    await untilAborted(init.signal);
    throw abortError();
  },
  makeId: () => "timeout-fixture"
});
const timeoutResult = await timeoutResolver.resolve(turnInput({ turnOwner: 11 }));
checks.push(result("HMAX-CANARY-TIMEOUT-ONE-EMBEDDED-FALLBACK", timeoutResult.reason === "hosted_timeout" && timeoutResult.selected === false && timeoutResult.audit.displayedHostedSpeech === false));

let remoteFetches = 0;
const remoteConfig = { ...enabledConfiguration(), baseUrl: "https://example.com" };
const remoteResolver = createSoulTalkCanaryResolver({
  getConfiguration: () => remoteConfig,
  fetchImpl: async () => { remoteFetches += 1; throw new Error("must_not_fetch"); },
  makeId: () => "remote-fixture"
});
const remoteResult = await remoteResolver.resolve(turnInput({ turnOwner: 12 }));
checks.push(result("HMAX-CANARY-REMOTE-URL-BLOCKED", remoteResult.errorCode === "non_loopback_url" && remoteFetches === 0));

const identityState = {
  ...state,
  reactionPreview: "local reply",
  chatHistory: [
    { role: "player", text: message },
    { role: "companion", text: "local reply" }
  ]
};
const identity = captureSoulTalkSpeechIdentity(identityState, {
  companionId: "greyshade-cat",
  stateVersion: 1,
  turnOwner: 1,
  replyRole: "companion",
  replyText: "local reply"
});
const replacementState = structuredClone(identityState);
const replaced = replaceSoulTalkSpeechCandidate(replacementState, identity, {
  role: "companion",
  text: "hosted reply",
  final: true
});
checks.push(result(
  "HMAX-CANARY-SPEECH-ONLY-ATOMIC-REPLACEMENT",
  replaced
    && replacementState.chatHistory.length === 2
    && replacementState.chatHistory[1].text === "hosted reply"
    && replacementState.reactionPreview === "hosted reply"
    && replacementState.bond === identityState.bond
    && replacementState.trust === identityState.trust
));
const staleProjection = structuredClone(identityState);
staleProjection.energy = 6;
checks.push(result(
  "HMAX-CANARY-PROJECTION-STALE-BLOCKED",
  !isSoulTalkSpeechIdentityCurrent(staleProjection, identity)
    && replaceSoulTalkSpeechCandidate(staleProjection, identity, { role: "companion", text: "must not apply", final: true }) === false
    && staleProjection.chatHistory[1].text === "local reply"
));

const failed = checks.filter((item) => !item.pass);
console.log(JSON.stringify({ ok: failed.length === 0, total: checks.length, passed: checks.length - failed.length, failed: failed.length, cases: checks }, null, 2));
if (failed.length) process.exitCode = 1;

function enabledConfiguration() {
  return {
    enabled: true,
    ownerOnly: true,
    cloudProcessingConsent: true,
    visibleSpeechApproved: true,
    killSwitch: false,
    baseUrl: "http://127.0.0.1:8787",
    getAccessToken: async () => "fixture-token"
  };
}

function turnInput({ coreResult: turnCore = ordinaryCore, turnOwner = 1, isCurrent = () => true } = {}) {
  return { message, coreResult: turnCore, state, companion, stateVersion: turnOwner, turnOwner, isCurrent };
}

function coreResult({ reply = "local reply", safety = {}, strategy = "contextual_ack" } = {}) {
  return {
    now: Date.parse("2026-08-11T08:00:00.000Z"),
    safety,
    responseStrategy: { strategy },
    output: {
      replyRole: safety.isHighRisk || safety.isPolicyTerminal ? "system" : "companion",
      reply
    }
  };
}

function hostedDecision(request, { text = "HMAX canary reply" } = {}) {
  return {
    contractVersion: request.contractVersion,
    requestId: request.requestId,
    turnId: `hosted:${request.requestId}`,
    coreVersion: "hmax-canary-fixture-v1",
    authority: createAuthorityReport(),
    safety: { level: "none", category: "none", terminal: false, localOnly: false },
    speech: { role: "companion", text, final: true },
    affect: null,
    boundary: { active: false },
    supportDecision: { mode: "ordinary", source: "hmax-fixture" },
    memoryProposals: [],
    effectProposals: [],
    audit: { modelTrusted: false, directGameMutation: false, rawInputPersisted: false, rawInputExported: false }
  };
}

function jsonResponse(value) { return { ok: true, status: 200, async text() { return JSON.stringify(value); } }; }
function untilAborted(signal) { return new Promise((resolve) => { if (signal?.aborted) resolve(); else signal?.addEventListener("abort", resolve, { once: true }); }); }
function abortError() { const error = new Error("aborted"); error.name = "AbortError"; return error; }
function result(id, pass, detail = null) { return { id, pass: Boolean(pass), detail }; }
