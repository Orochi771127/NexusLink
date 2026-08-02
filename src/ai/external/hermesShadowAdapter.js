/**
 * hermesShadowAdapter.js
 *
 * Adapts NexusLink requests to Hermes sidecar in Shadow P0 Mode.
 *
 * Security invariants:
 *   1. Only sends sanitised advisor-grade payloads (via buildAdvisorPayload), never raw coreResult.
 *   2. All outgoing requests pass through promptFirewall.
 *   3. All incoming replyCandidates pass through forbiddenPhrases.
 *   4. Enforced 3 000 ms timeout via AbortController — never blocks the player.
 *   5. Token read from policy, never hardcoded.
 */
import { buildAdvisorPayload } from './privacyRedactor.js';
import { evaluateExternalPrompt } from './promptFirewall.js';
import { detectForbiddenPhrases, sanitizeReply } from '../forbiddenPhrases.js';

const HERMES_TIMEOUT_MS = 3000;

/**
 * Read-only audit tag — mirrors raphaelPreviewAdapter's PREVIEW_AUDIT contract.
 */
export const HERMES_SHADOW_AUDIT = Object.freeze({
  shadowOnly: true,
  finalAuthority: "RaphaelCore",
  trusted: false,
  appliedToLive: false,
  noStatePatch: true,
  noMemoryWrite: true,   // memory proposals still require hermesMemoryBridge gatekeeper
  noTraceWrite: true,
  noAnimationTrigger: true,
  noChatWrite: true,
  noSaveSchemaChange: true
});

export function assertHermesShadowIsReadOnly(shadowResult) {
  if (!shadowResult) return { ok: true, reason: "null_shadow_is_safe" };
  return {
    ok: shadowResult.trusted === false
      && shadowResult.audit?.appliedToLive === false
      && shadowResult.audit?.noStatePatch === true
      && shadowResult.audit?.noMemoryWrite === true,
    reason: "HERMES_SHADOW_READ_ONLY_CONTRACT"
  };
}

export async function askHermesShadow(policy, perception, instruction) {
  if (!policy.hermesShadowEnabled) {
    return null;
  }

  // ── 1. Build safe, minimal payload (never leak raw coreResult) ────────
  const payload = buildAdvisorPayload({
    perception: perception?.perception || perception,
    coreDecision: perception?.autonomy || {}
  });

  // ── 2. Prompt Firewall gate ───────────────────────────────────────────
  const firewall = evaluateExternalPrompt({
    mode: "shadow",
    payload,
    settings: { ...policy, externalEnabled: true }
  });
  if (!firewall.allowed) {
    return null; // silently blocked — same as disabled
  }

  // ── 3. Build Hermes-compatible request ────────────────────────────────
  const body = {
    messages: [
      {
        role: "system",
        content:
          "You are the Hermes sidecar. Provide reply candidates, evidence, " +
          "and important memory proposals (facts/preferences mentioned by player). " +
          "Do not mutate state. Respond in JSON when possible."
      },
      {
        role: "user",
        content: `Context: ${JSON.stringify(payload)}\nInstruction: ${instruction}`
      }
    ],
    stream: false,
    max_tokens: 500,
    temperature: 0.7
  };

  // ── 4. Fetch with hard timeout ────────────────────────────────────────
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HERMES_TIMEOUT_MS);

  try {
    const url = `${policy.hermesShadowUrl}/v1/chat/completions`;
    const headers = { 'Content-Type': 'application/json' };
    if (policy.hermesShadowToken) {
      headers['Authorization'] = `Bearer ${policy.hermesShadowToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    });

    if (!response.ok) {
      console.warn(`[HermesShadow] HTTP ${response.status} from sidecar.`);
      return null;
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // ── 5. Validate reply candidates through forbiddenPhrases ───────
    const { text: sanitizedContent } = sanitizeReply(rawContent, 0);
    const forbiddenCheck = detectForbiddenPhrases(sanitizedContent);
    const warnings = ["Shadow mode response. Memory proposals require RaphaelCore validation."];
    if (forbiddenCheck.hasForbidden) {
      warnings.push("hermes_candidate_had_forbidden_phrase");
    }

    return {
      trusted: false,
      replyCandidates: [sanitizedContent],
      memoryProposals: [],
      canonEvidence: [],
      warnings,
      confidence: 0.8,
      audit: { ...HERMES_SHADOW_AUDIT }
    };
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn(`[HermesShadow] Timeout after ${HERMES_TIMEOUT_MS}ms — fallback to local.`);
    } else {
      console.error("[HermesShadow] Error communicating with sidecar:", err);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}
