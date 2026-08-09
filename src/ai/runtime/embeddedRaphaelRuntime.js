import { runRaphaelCore } from "../raphaelCore.js";
import { isSafetyTerminalDecision } from "../safetyShield.js";
import { RAPHAEL_CONTRACT_VERSION, createAuthorityReport, freezeTurnContext, validateTurnDecision } from "./raphaelRuntimeContract.js";

export function createEmbeddedRaphaelRuntime({ coreVersion = "nexuslink-embedded-v1" } = {}) {
  return Object.freeze({
    async turn(rawRequest, { signal } = {}) {
      if (signal?.aborted) throw abortError();
      const request = freezeTurnContext(rawRequest);
      const result = runRaphaelCore(request.input.text, projectState(request), {
        now: Date.parse(request.input.timestamp),
        companion: { id: request.actor.companionId, name: request.actor.companionId },
        readOnly: true,
        externalIntelligence: { rendererEnabled: false, advisorEnabled: false, externalEnabled: false }
      });
      if (signal?.aborted) throw abortError();
      return projectRaphaelCoreResultToDecision(result, request, { coreVersion });
    },
    async listMemories() { return []; },
    async commitMemoryProposal() { return { committed: false, reason: "embedded_no_durable_memory" }; },
    async forgetMemory() { return { forgotten: false, reason: "embedded_no_durable_memory" }; },
    async exportUserData() { return { contractVersion: RAPHAEL_CONTRACT_VERSION, memories: [] }; },
    async health() { return { ok: true, mode: "embedded", contractVersion: RAPHAEL_CONTRACT_VERSION, coreVersion }; }
  });
}

export function projectRaphaelCoreResultToDecision(result, request, {
  coreVersion = "nexuslink-embedded-v1",
  turnId = `embedded:${request.requestId}`
} = {}) {
  const safety = result?.safety || result?.perception?.safety || {};
  const terminal = isSafetyTerminalDecision(safety);
  const decision = {
    contractVersion: RAPHAEL_CONTRACT_VERSION,
    requestId: request.requestId,
    turnId,
    coreVersion,
    authority: createAuthorityReport(),
    safety: {
      level: safety.riskLevel || "none",
      category: safety.category || "none",
      terminal,
      localOnly: terminal
    },
    speech: {
      role: result?.output?.replyRole || result?.replyRole || "companion",
      text: result?.output?.reply || result?.reply || "",
      final: true
    },
    affect: null,
    boundary: { active: safety.isBoundaryPressure === true },
    supportDecision: { mode: safety.category || "ordinary", source: "embedded" },
    memoryProposals: [],
    effectProposals: [],
    audit: {
      modelTrusted: false,
      directGameMutation: false,
      rawInputPersisted: false,
      rawInputExported: false
    }
  };
  return validateTurnDecision(decision, request);
}

function projectState(request) {
  const relationship = request.context.relationship || {};
  const signals = request.context.currentTurnSignals || {};
  const energy = Number(signals.energy);
  return {
    activeCompanionId: request.actor.companionId,
    bond: Number(relationship.bond) || 0,
    trust: Number(relationship.trust) || 0,
    defense: Number(relationship.defense) || 0,
    energy: Number.isFinite(energy) ? energy : 7,
    mood: signals.mood || "calm",
    safeHarborMode: false,
    emotionalMemories: [],
    companionAnchors: [],
    habitatTraces: [],
    chatHistory: [],
    lastMessage: ""
  };
}
function abortError() { const error = new Error("Raphael turn aborted"); error.name = "AbortError"; return error; }
