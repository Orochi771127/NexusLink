import { canExecuteTool } from "./toolPermissionPolicy.js";
import { retrieveMemoryTool } from "./tools/retrieveMemory.js";
import { searchCorpusTool } from "./tools/searchCorpus.js";
import { getGameStateTool } from "./tools/getGameState.js";
import { evaluateReplyTool } from "./tools/evaluateReply.js";
import { proposePatchTool } from "./tools/proposePatch.js";
import { webSearchTool } from "./tools/webSearch.js";

const TOOL_MAP = Object.freeze({
  retrieveMemory: retrieveMemoryTool,
  searchCorpus: searchCorpusTool,
  getGameState: getGameStateTool,
  evaluateReply: evaluateReplyTool,
  proposePatch: proposePatchTool,
  webSearch: webSearchTool
});

export function listTools() {
  return Object.values(TOOL_MAP).map((tool) => ({
    name: tool.name,
    risk: tool.risk,
    requiresUserConsent: tool.requiresUserConsent,
    allowedInRuntime: tool.allowedInRuntime
  }));
}

export function executeTool(name, input = {}, context = {}) {
  const tool = TOOL_MAP[name];
  if (!tool) return { ok: false, reason: "tool_not_found" };

  const permission = canExecuteTool(tool, context);
  if (!permission.allowed) return { ok: false, reason: permission.reason };

  return tool.execute(input, context);
}