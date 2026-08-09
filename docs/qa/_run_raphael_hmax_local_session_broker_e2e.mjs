import assert from "node:assert/strict";
import { createLocalHmaxHostedRuntime } from "../../src/ai/runtime/localHmaxHostedRuntime.js";
import { createLocalHmaxSessionTokenProvider } from "../../src/ai/runtime/localHmaxSessionBroker.js";

const pairingCode = process.env.HMAX_LOCAL_PAIRING_CODE;
if (typeof pairingCode !== "string" || pairingCode.length < 16) throw new Error("HMAX_LOCAL_PAIRING_CODE is required");

const baseUrl = "http://127.0.0.1:8790";
const origin = "http://127.0.0.1:4173";
const originFetch = (url, options = {}) => fetch(url, {
  ...options,
  headers: { ...(options.headers || {}), Origin: origin }
});
const tokenProvider = createLocalHmaxSessionTokenProvider({
  baseUrl,
  getPairingCode: async () => pairingCode,
  fetchImpl: originFetch
});
const runtime = createLocalHmaxHostedRuntime({
  baseUrl,
  getAccessToken: tokenProvider.getAccessToken,
  fetchImpl: originFetch
});
const request = {
  contractVersion: "1.0.0-draft.1",
  requestId: "broker-e2e-request-0001",
  idempotencyKey: "broker-e2e-idempotency-0001",
  client: {
    productId: "nexus-link-web",
    clientVersion: "r2-local-shadow",
    instanceId: "broker-e2e-instance-0001",
    locale: "zh-TW"
  },
  actor: { companionId: "greyshade-cat", personaVersion: "raphael-v1" },
  input: {
    text: "今天完成了一個小測試。",
    source: "soul_talk",
    timestamp: new Date().toISOString()
  },
  context: {
    stateVersion: 1,
    scene: { id: "soul-talk" },
    relationship: { bondBand: "developing", trustBand: "developing" },
    currentTurnSignals: { synthetic: true, care: false }
  },
  allowedEffects: [],
  consent: { cloudProcessing: true, retention: "none", careProcessing: "not_care" },
  capabilities: { embeddedFallback: true, memoryProposals: false, effectProposals: false }
};

const decision = await runtime.turn(request, { signal: AbortSignal.timeout(8_000) });
assert.equal(decision.requestId, request.requestId);
assert.equal(decision.authority.gameMutation, "NexusLinkReducer");
assert.equal(decision.audit.modelTrusted, false);
assert.equal(decision.audit.directGameMutation, false);
assert.equal(decision.audit.rawInputPersisted, false);
assert.equal(decision.audit.rawInputExported, false);
assert.equal(decision.memoryProposals.length, 0);
assert.equal(decision.effectProposals.length, 0);

process.stdout.write(`${JSON.stringify({
  ok: true,
  package: "RAPHAEL_HMAX_LOCAL_SESSION_BROKER_V1",
  requestId: decision.requestId,
  coreVersion: decision.coreVersion,
  brokerLoopback: true,
  upstreamCredentialExposed: false,
  modelTrusted: decision.audit.modelTrusted,
  directGameMutation: decision.audit.directGameMutation,
  memoryProposalCount: decision.memoryProposals.length,
  effectProposalCount: decision.effectProposals.length,
  playerTraffic: false,
  soulTalkCutover: false
})}\n`);
