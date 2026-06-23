import { retrieveRelevantMemories } from "../../memoryRetriever.js";

export const retrieveMemoryTool = Object.freeze({
  name: "retrieveMemory",
  risk: "low",
  requiresUserConsent: false,
  allowedInRuntime: true,
  execute(_input, context = {}) {
    const memories = retrieveRelevantMemories(context.state || {}, context.analysis || {}, {
      now: context.now || Date.now()
    });
    return { ok: true, data: memories };
  }
});