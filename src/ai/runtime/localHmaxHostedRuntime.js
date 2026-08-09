import { freezeTurnContext, validateTurnDecision } from "./raphaelRuntimeContract.js";

const MAX_RESPONSE_CHARS = 262_144;

export class HmaxShadowTransportError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "HmaxShadowTransportError";
    this.code = code;
  }
}

export function createLocalHmaxHostedRuntime({ baseUrl, getAccessToken, fetchImpl = globalThis.fetch } = {}) {
  const endpoint = resolveLocalTurnsEndpoint(baseUrl);
  if (typeof getAccessToken !== "function") {
    throw new TypeError("getAccessToken must be an in-memory token provider");
  }
  if (typeof fetchImpl !== "function") {
    throw new TypeError("fetch is unavailable");
  }

  return Object.freeze({
    async turn(rawRequest, { signal } = {}) {
      const request = freezeTurnContext(rawRequest);
      const token = await getAccessToken({ signal, audience: "raphael-hmax", scope: "turn" });
      if (typeof token !== "string" || !token.trim()) {
        throw new HmaxShadowTransportError("missing_access_token", "No in-memory HMAX access token is available");
      }

      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: Object.freeze({
          Accept: "application/json",
          Authorization: `Bearer ${token.trim()}`,
          "Content-Type": "application/json"
        }),
        body: JSON.stringify(request),
        cache: "no-store",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal
      });

      if (!response?.ok) {
        const status = Number(response?.status) || 0;
        throw new HmaxShadowTransportError(`hmax_http_${status || "error"}`, `HMAX turn failed with HTTP ${status || "error"}`);
      }

      const body = await response.text();
      if (body.length > MAX_RESPONSE_CHARS) {
        throw new HmaxShadowTransportError("response_too_large", "HMAX response exceeded the shadow-client limit");
      }

      let decision;
      try {
        decision = JSON.parse(body);
      } catch {
        throw new HmaxShadowTransportError("invalid_json", "HMAX returned invalid JSON");
      }

      validateTurnDecision(decision, request);
      validateShadowOnlyHostedDecision(decision);
      return decision;
    },

    async health() {
      return {
        ok: true,
        mode: "local-hmax-shadow-adapter",
        endpoint: endpoint.origin,
        persistentCredential: false
      };
    }
  });
}

export function resolveLocalTurnsEndpoint(baseUrl) {
  let url;
  try {
    url = new URL(String(baseUrl || ""));
  } catch {
    throw new HmaxShadowTransportError("invalid_base_url", "HMAX base URL is invalid");
  }

  const host = url.hostname.toLowerCase();
  if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) {
    throw new HmaxShadowTransportError("non_loopback_url", "HMAX shadow traffic is restricted to this device");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new HmaxShadowTransportError("invalid_base_url", "HMAX base URL contains unsupported components");
  }
  if (url.pathname !== "/" && url.pathname !== "") {
    throw new HmaxShadowTransportError("invalid_base_path", "HMAX base URL must not contain an API path");
  }

  url.pathname = "/v1/turns";
  return url;
}

function validateShadowOnlyHostedDecision(decision) {
  if (decision.speech?.role !== "companion" || decision.speech?.final !== true) {
    throw new HmaxShadowTransportError("hosted_decision_not_final", "HMAX shadow speech must be final companion speech");
  }
  if (decision.safety?.terminal === true || decision.safety?.localOnly === true) {
    throw new HmaxShadowTransportError("hosted_terminal_forbidden", "Safety terminals must never be served by HMAX");
  }
  if (decision.memoryProposals.length || decision.effectProposals.length) {
    throw new HmaxShadowTransportError("hosted_proposal_forbidden", "This shadow client does not accept memory or effect proposals");
  }
}
