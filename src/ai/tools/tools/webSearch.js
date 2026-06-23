export const webSearchTool = Object.freeze({
  name: "webSearch",
  risk: "medium",
  requiresUserConsent: true,
  allowedInRuntime: false,
  execute() {
    return {
      ok: false,
      reason: "web_search_disabled_by_default",
      data: null
    };
  }
});