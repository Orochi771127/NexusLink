import { runRaphaelCore } from "../raphaelCore.js";
import { RAPHAEL_CONTRACT_VERSION, createAuthorityReport, freezeTurnContext, validateTurnDecision } from "./raphaelRuntimeContract.js";

export function createEmbeddedRaphaelRuntime({ coreVersion = "nexuslink-embedded-v1" } = {}) {
  return Object.freeze({
    async turn(rawRequest, { signal } = {}) {
      if (signal?.aborted) throw abortError();
      const request = freezeTurnContext(rawRequest);
      const result = runRaphaelCore(request.input.text, projectState(request), {
        now: request.input.timestamp,
        companion: { id: request.actor.companionId, name: request.actor.companionId },
        readOnly: true,
        externalIntelligence: { rendererEnabled: false, advisorEnabled: false, externalEnabled: false }
      });
      if (signal?.aborted) throw abortError();
      const decision = {
        contractVersion: RAPHAEL_CONTRACT_VERSION, requestId: request.requestId, turnId: `embedded:${request.requestId}`, coreVersion,
        authority: createAuthorityReport(),
        safety: { level: result.safety?.riskLevel || "none", category: result.safety?.category || "none", terminal: result.safety?.isHighRisk === true, localOnly: result.safety?.isHighRisk === true },
        speech: { role: result.output?.replyRole || "companion", text: result.output?.reply || "", final: true },
        affect: null, boundary: { active: result.safety?.isBoundaryPressure === true },
        supportDecision: { mode: result.safety?.category || "ordinary", source: "embedded" }, memoryProposals: [], effectProposals: [],
        audit: { modelTrusted: false, directGameMutation: false, rawInputPersisted: false, rawInputExported: false }
      };
      return validateTurnDecision(decision, request);
    },
    async listMemories() { return []; },
    async commitMemoryProposal() { return { committed: false, reason: "embedded_no_durable_memory" }; },
    async forgetMemory() { return { forgotten: false, reason: "embedded_no_durable_memory" }; },
    async exportUserData() { return { contractVersion: RAPHAEL_CONTRACT_VERSION, memories: [] }; },
    async health() { return { ok: true, mode: "embedded", contractVersion: RAPHAEL_CONTRACT_VERSION, coreVersion }; }
  });
}
function projectState(request) { const r = request.context.relationship || {}; const s = request.context.signals || {}; return { activeCompanionId: request.actor.companionId, bond: Number(r.bond) || 0, trust: Number(r.trust) || 0, defense: Number(r.defense) || 0, energy: Number(s.energy) || 7, mood: s.mood || "calm", safeHarborMode: false, emotionalMemories: [], companionAnchors: [], habitatTraces: [], chatHistory: [], lastMessage: "" }; }
function abortError() { const error = new Error("Raphael turn aborted"); error.name = "AbortError"; return error; }
