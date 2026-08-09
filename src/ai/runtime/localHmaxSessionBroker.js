const MAX_PAIR_RESPONSE_CHARS = 4_096;
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "[::1]"]);

export class HmaxLocalSessionError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "HmaxLocalSessionError";
    this.code = code;
  }
}

export function createLocalHmaxSessionTokenProvider({
  baseUrl,
  getPairingCode,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  minimumValidityMs = 5_000
} = {}) {
  const endpoint = resolvePairingEndpoint(baseUrl);
  if (typeof getPairingCode !== "function") throw new TypeError("getPairingCode must be an ephemeral owner callback");
  if (typeof fetchImpl !== "function") throw new TypeError("fetch is unavailable");
  if (!Number.isSafeInteger(minimumValidityMs) || minimumValidityMs < 0 || minimumValidityMs > 30_000) {
    throw new TypeError("minimumValidityMs is out of range");
  }

  let cachedSession = null;
  let pairingInFlight = null;
  let cacheGeneration = 0;

  async function getAccessToken({ signal, audience = "raphael-hmax", scope = "turn" } = {}) {
    if (audience !== "raphael-hmax" || scope !== "turn") {
      throw new HmaxLocalSessionError("broker_scope_forbidden", "The local broker grants turn-only HMAX access");
    }
    if (cachedSession && cachedSession.expiresAt - now() > minimumValidityMs) return cachedSession.accessToken;
    cachedSession = null;
    if (!pairingInFlight) {
      const generation = cacheGeneration;
      pairingInFlight = pair({ endpoint, getPairingCode, fetchImpl, signal, now })
        .then((session) => {
          if (generation === cacheGeneration) cachedSession = session;
          return session.accessToken;
        })
        .finally(() => { pairingInFlight = null; });
    }
    return pairingInFlight;
  }

  return Object.freeze({
    getAccessToken,
    clear() {
      cacheGeneration += 1;
      cachedSession = null;
    },
    async health() {
      return {
        ok: true,
        mode: "local-hmax-session-broker-token-provider",
        endpoint: endpoint.origin,
        persistentCredential: false,
        upstreamCredentialExposed: false,
        scope: "turn"
      };
    }
  });
}

async function pair({ endpoint, getPairingCode, fetchImpl, signal, now }) {
  const pairingCode = await getPairingCode({ signal });
  if (typeof pairingCode !== "string" || pairingCode.length < 16 || pairingCode.length > 128) {
    throw new HmaxLocalSessionError("invalid_pairing_code", "A valid one-time local pairing code is required");
  }

  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: Object.freeze({ Accept: "application/json", "Content-Type": "application/json" }),
    body: JSON.stringify({ pairingCode }),
    cache: "no-store",
    credentials: "omit",
    redirect: "error",
    referrerPolicy: "no-referrer",
    signal
  });
  if (!response?.ok) {
    const status = Number(response?.status) || 0;
    throw new HmaxLocalSessionError(`broker_pair_http_${status || "error"}`, `Local HMAX pairing failed with HTTP ${status || "error"}`);
  }
  const text = await response.text();
  if (text.length > MAX_PAIR_RESPONSE_CHARS) {
    throw new HmaxLocalSessionError("broker_pair_response_too_large", "Local HMAX pairing response exceeded the limit");
  }

  let body;
  try { body = JSON.parse(text); } catch {
    throw new HmaxLocalSessionError("broker_pair_invalid_json", "Local HMAX pairing returned invalid JSON");
  }
  validatePairingResponse(body);
  return Object.freeze({
    accessToken: body.accessToken,
    expiresAt: now() + (body.expiresIn * 1_000)
  });
}

function validatePairingResponse(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("broker_pair_invalid_response");
  const allowed = new Set(["accessToken", "tokenType", "expiresIn", "scope", "syntheticOnly"]);
  for (const key of Object.keys(value)) if (!allowed.has(key)) fail("broker_pair_unknown_field");
  if (typeof value.accessToken !== "string" || value.accessToken.length < 32 || value.accessToken.length > 256) fail("broker_pair_invalid_token");
  if (value.tokenType !== "Bearer" || value.scope !== "turn" || value.syntheticOnly !== true) fail("broker_pair_invalid_authority");
  if (!Number.isSafeInteger(value.expiresIn) || value.expiresIn < 30 || value.expiresIn > 300) fail("broker_pair_invalid_expiry");
}

function resolvePairingEndpoint(baseUrl) {
  let url;
  try { url = new URL(baseUrl); } catch { fail("invalid_broker_url"); }
  if (url.protocol !== "http:" || !LOOPBACK_HOSTS.has(url.hostname) || url.pathname !== "/" || url.search || url.hash) {
    fail("loopback_broker_required");
  }
  return new URL("/v1/local-session/pair", url);
}

function fail(code) {
  throw new HmaxLocalSessionError(code, code);
}
