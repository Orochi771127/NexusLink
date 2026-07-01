import { askMockAdvisor } from "./mockAdvisorAdapter.js";
import { renderMockReply } from "./mockRendererAdapter.js";
import { askGatewayAdvisor } from "./raphaelGatewayClient.js";

const ADVISOR_ADAPTERS = Object.freeze({
  mock: askMockAdvisor,
  gateway: askGatewayAdvisor
});

const RENDERER_ADAPTERS = Object.freeze({
  mock: renderMockReply
});

export async function routeAdvisorRequest({
  provider = "mock",
  payload = {},
  perception = null,
  coreDecision = null,
  settings = {},
  runtime = {}
} = {}) {
  if (provider === "gateway") {
    const gatewayResult = await askGatewayAdvisor({
      perception: perception || payload._perception || {},
      coreDecision: coreDecision || payload._coreDecision || {},
      settings,
      runtime
    });
    if (!gatewayResult.used) throw new Error(gatewayResult.reason || "gateway_failed");
    return gatewayResult.advice;
  }

  const adapter = ADVISOR_ADAPTERS[provider] || ADVISOR_ADAPTERS.mock;
  return adapter(payload);
}

export function routeRendererRequest({ provider = "mock", payload = {} } = {}) {
  const adapter = RENDERER_ADAPTERS[provider] || RENDERER_ADAPTERS.mock;
  return adapter(payload);
}