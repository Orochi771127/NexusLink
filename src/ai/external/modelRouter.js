import { askMockAdvisor } from "./mockAdvisorAdapter.js";
import { renderMockReply } from "./mockRendererAdapter.js";

const ADVISOR_ADAPTERS = Object.freeze({
  mock: askMockAdvisor
});

const RENDERER_ADAPTERS = Object.freeze({
  mock: renderMockReply
});

export async function routeAdvisorRequest({ provider = "mock", payload = {} } = {}) {
  const adapter = ADVISOR_ADAPTERS[provider] || ADVISOR_ADAPTERS.mock;
  return adapter(payload);
}

export function routeRendererRequest({ provider = "mock", payload = {} } = {}) {
  const adapter = RENDERER_ADAPTERS[provider] || RENDERER_ADAPTERS.mock;
  return adapter(payload);
}