import { askMockAdvisor } from "./mockAdvisorAdapter.js";

const ADAPTERS = Object.freeze({
  mock: askMockAdvisor
});

export async function routeAdvisorRequest({ provider = "mock", payload = {} } = {}) {
  const adapter = ADAPTERS[provider] || ADAPTERS.mock;
  return adapter(payload);
}