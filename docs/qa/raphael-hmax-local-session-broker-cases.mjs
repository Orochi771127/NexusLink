import assert from "node:assert/strict";
import { createLocalHmaxSessionTokenProvider } from "../../src/ai/runtime/localHmaxSessionBroker.js";
import { createLocalHmaxHostedRuntime } from "../../src/ai/runtime/localHmaxHostedRuntime.js";

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test("pairs once, caches only the opaque broker token and deduplicates concurrent callers", async () => {
  let pairingCalls = 0;
  let codeCalls = 0;
  const browserToken = "broker-browser-token-123456789012345678901";
  const provider = createLocalHmaxSessionTokenProvider({
    baseUrl: "http://127.0.0.1:8790",
    getPairingCode: async () => { codeCalls += 1; return "owner-once-123456789"; },
    fetchImpl: async (_url, options) => {
      pairingCalls += 1;
      assert.equal(options.credentials, "omit");
      assert.equal(options.cache, "no-store");
      assert.equal(options.referrerPolicy, "no-referrer");
      assert.deepEqual(JSON.parse(options.body), { pairingCode: "owner-once-123456789" });
      await Promise.resolve();
      return response(201, {
        accessToken: browserToken,
        tokenType: "Bearer",
        expiresIn: 120,
        scope: "turn",
        syntheticOnly: true
      });
    }
  });

  const [first, second] = await Promise.all([
    provider.getAccessToken({ audience: "raphael-hmax", scope: "turn" }),
    provider.getAccessToken({ audience: "raphael-hmax", scope: "turn" })
  ]);
  assert.equal(first, browserToken);
  assert.equal(second, browserToken);
  assert.equal(pairingCalls, 1);
  assert.equal(codeCalls, 1);
  assert.equal(await provider.getAccessToken(), browserToken);
  assert.equal(pairingCalls, 1);
  assert.deepEqual(await provider.health(), {
    ok: true,
    mode: "local-hmax-session-broker-token-provider",
    endpoint: "http://127.0.0.1:8790",
    persistentCredential: false,
    upstreamCredentialExposed: false,
    scope: "turn"
  });
});

test("clear and expiry require a fresh one-time pairing callback", async () => {
  let clock = 1_000;
  let sequence = 0;
  const provider = createLocalHmaxSessionTokenProvider({
    baseUrl: "http://127.0.0.1:8790",
    now: () => clock,
    minimumValidityMs: 5_000,
    getPairingCode: async () => `owner-once-${String(++sequence).padStart(12, "0")}`,
    fetchImpl: async (_url, options) => {
      const code = JSON.parse(options.body).pairingCode;
      return response(201, {
        accessToken: `browser-token-${code}-12345678901234567890`,
        tokenType: "Bearer",
        expiresIn: 30,
        scope: "turn",
        syntheticOnly: true
      });
    }
  });
  const first = await provider.getAccessToken();
  provider.clear();
  const second = await provider.getAccessToken();
  assert.notEqual(first, second);
  clock += 26_000;
  const third = await provider.getAccessToken();
  assert.notEqual(second, third);
  assert.equal(sequence, 3);
});

test("rejects non-loopback brokers, forbidden scopes and malformed authority responses", async () => {
  assert.throws(() => createLocalHmaxSessionTokenProvider({
    baseUrl: "https://hmax.example.com",
    getPairingCode: async () => "owner-once-123456789"
  }), /loopback_broker_required/);

  const provider = createLocalHmaxSessionTokenProvider({
    baseUrl: "http://127.0.0.1:8790",
    getPairingCode: async () => "owner-once-123456789",
    fetchImpl: async () => response(201, {
      accessToken: "broker-browser-token-123456789012345678901",
      tokenType: "Bearer",
      expiresIn: 120,
      scope: "memory:write",
      syntheticOnly: true
    })
  });
  await assert.rejects(() => provider.getAccessToken({ scope: "memory:write" }), { code: "broker_scope_forbidden" });
  await assert.rejects(() => provider.getAccessToken(), /broker_pair_invalid_authority/);
});

test("opaque broker token plugs into the existing loopback-only HMAX turn adapter", async () => {
  const browserToken = "broker-browser-token-123456789012345678901";
  const calls = [];
  const provider = createLocalHmaxSessionTokenProvider({
    baseUrl: "http://127.0.0.1:8790",
    getPairingCode: async () => "owner-once-123456789",
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options });
      return response(201, {
        accessToken: browserToken,
        tokenType: "Bearer",
        expiresIn: 120,
        scope: "turn",
        syntheticOnly: true
      });
    }
  });
  const request = validRequest();
  const decision = validDecision(request);
  const runtime = createLocalHmaxHostedRuntime({
    baseUrl: "http://127.0.0.1:8790",
    getAccessToken: provider.getAccessToken,
    fetchImpl: async (url, options) => {
      if (String(url).endsWith("/v1/local-session/pair")) return providerFetch(url, options);
      calls.push({ url: String(url), options });
      assert.equal(options.headers.Authorization, `Bearer ${browserToken}`);
      return response(200, decision);
    }
  });

  // Pre-pair through the provider so the runtime exercises only its existing
  // turn transport with the opaque token.
  await provider.getAccessToken();
  const result = await runtime.turn(request);
  assert.equal(result.requestId, request.requestId);
  assert.equal(result.audit.modelTrusted, false);

  async function providerFetch(_url, _options) {
    return response(201, {
      accessToken: browserToken,
      tokenType: "Bearer",
      expiresIn: 120,
      scope: "turn",
      syntheticOnly: true
    });
  }
});

let passed = 0;
for (const entry of tests) {
  try {
    await entry.fn();
    passed += 1;
    console.log(`PASS ${entry.name}`);
  } catch (error) {
    console.error(`FAIL ${entry.name}`);
    throw error;
  }
}
console.log(`\n${passed}/${tests.length} HMAX local session broker cases passed.`);

function response(status, body) {
  return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) };
}

function validRequest() {
  return {
    contractVersion: "1.0.0-draft.1",
    requestId: "req-broker-1",
    idempotencyKey: "idem-broker-1",
    client: { productId: "nexus-link-web", clientVersion: "r2", instanceId: "shadow-1", locale: "zh-TW" },
    actor: { companionId: "greyshade-cat", personaVersion: "1" },
    input: { text: "synthetic ordinary turn", source: "soul_talk", timestamp: "2026-08-09T00:00:00.000Z" },
    context: { stateVersion: 1, scene: { id: "soul-talk" }, relationship: {}, currentTurnSignals: {} },
    allowedEffects: [],
    consent: { cloudProcessing: true, retention: "none", careProcessing: "not_care" },
    capabilities: { embeddedFallback: true, memoryProposals: false, effectProposals: false }
  };
}

function validDecision(request) {
  return {
    contractVersion: request.contractVersion,
    requestId: request.requestId,
    turnId: "turn-broker-1",
    coreVersion: "raphael-core-test",
    authority: {
      cognition: "RaphaelCore",
      speech: "RaphaelCore",
      memoryEligibility: "RaphaelCore",
      persistence: "MemoryPort",
      gameMutation: "NexusLinkReducer"
    },
    safety: { level: "none", category: "none", terminal: false, localOnly: false },
    speech: { role: "companion", text: "hosted marker", final: true },
    affect: null,
    boundary: { active: false },
    supportDecision: { mode: "ordinary", source: "broker-fixture" },
    memoryProposals: [],
    effectProposals: [],
    audit: { modelTrusted: false, directGameMutation: false, rawInputPersisted: false, rawInputExported: false }
  };
}
