import { freezeTurnContext, validateTurnDecision } from "./raphaelRuntimeContract.js";

export function createRaphaelShadowClient({ hostedRuntime, embeddedRuntime, timeoutMs = 8000, now = () => Date.now() } = {}) {
  if (!hostedRuntime?.turn || !embeddedRuntime?.turn) throw new TypeError("hostedRuntime and embeddedRuntime are required");
  const seen = new Map();
  return Object.freeze({
    async compare(rawRequest, { signal } = {}) {
      const request = freezeTurnContext(rawRequest);
      if (request.consent.cloudProcessing !== true || request.consent.careProcessing === "device") return { requestId: request.requestId, shadowAttempted: false, reason: "cloud_not_consented", decision: null };
      if (!seen.has(request.idempotencyKey)) seen.set(request.idempotencyKey, runShadow(request, { signal, hostedRuntime, embeddedRuntime, timeoutMs, now }));
      return seen.get(request.idempotencyKey);
    },
    clearIdempotencyCache() { seen.clear(); }
  });
}

async function runShadow(request, { signal, hostedRuntime, embeddedRuntime, timeoutMs, now }) {
  const controller = new AbortController(); const onAbort = () => controller.abort(); signal?.addEventListener?.("abort", onAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), timeoutMs); const startedAt = now();
  try {
    const [embedded, hosted] = await Promise.all([embeddedRuntime.turn(request, { signal }), hostedRuntime.turn(request, { signal: controller.signal })]);
    validateTurnDecision(hosted, request);
    return { requestId: request.requestId, shadowAttempted: true, reason: "compared_no_apply", decision: null, comparison: compare(embedded, hosted), elapsedMs: Math.max(0, now() - startedAt), audit: { displayedHostedSpeech: false, appliedHostedEffects: false, committedHostedMemory: false } };
  } catch (error) {
    return { requestId: request.requestId, shadowAttempted: true, reason: error?.name === "AbortError" ? "timeout_or_abort" : "hosted_error", decision: null, errorCode: error?.code || error?.name || "unknown", audit: { displayedHostedSpeech: false, appliedHostedEffects: false, committedHostedMemory: false } };
  } finally { clearTimeout(timer); signal?.removeEventListener?.("abort", onAbort); }
}
function compare(embedded, hosted) { return { safetyCategoryEqual: embedded.safety?.category === hosted.safety?.category, safetyTerminalEqual: embedded.safety?.terminal === hosted.safety?.terminal, boundaryEqual: embedded.boundary?.active === hosted.boundary?.active, memoryProposalCount: hosted.memoryProposals?.length || 0, effectProposalCount: hosted.effectProposals?.length || 0, speechExactMatch: embedded.speech?.text === hosted.speech?.text }; }
