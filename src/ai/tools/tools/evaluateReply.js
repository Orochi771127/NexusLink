import { runCritics } from "../../eval/runCritics.js";

export const evaluateReplyTool = Object.freeze({
  name: "evaluateReply",
  risk: "low",
  requiresUserConsent: false,
  allowedInRuntime: true,
  execute(_input, context = {}) {
    const critique = runCritics(context);
    return { ok: true, data: critique };
  }
});