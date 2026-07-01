import { searchCorpus } from "../../corpusSearch.js";

export const searchCorpusTool = Object.freeze({
  name: "searchCorpus",
  risk: "low",
  requiresUserConsent: false,
  allowedInRuntime: true,
  execute(input = {}, _context = {}) {
    const result = searchCorpus({
      emotionKey: input.emotion || input.emotionKey || "calm",
      intent: input.intent || "",
      inputText: input.query || input.inputText || "",
      limit: input.limit || 3
    });
    return { ok: true, data: result };
  }
});