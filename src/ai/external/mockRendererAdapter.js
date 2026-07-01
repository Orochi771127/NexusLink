import { detectForbiddenPhrases, sanitizeReply } from "../forbiddenPhrases.js";

/**
 * Mock renderer — polishes Raphael's decided draft without changing intent.
 * No network, no API key. Future: swap for OpenAI/Grok renderer adapter.
 */
export function renderMockReply(payload = {}) {
  const draft = String(payload.draftReply || "").trim();
  if (!draft) return { used: false, text: "", reason: "empty_draft" };

  const mode = payload.reaction || "acknowledge";
  const personaTone = payload.personaTone || "quiet_observer";
  let rendered = draft;

  if (personaTone === "quiet_observer" && rendered.length > 42) {
    const parts = rendered.split(/[\n。！？]/).map((p) => p.trim()).filter(Boolean);
    rendered = parts.slice(0, 2).join("。") + "。";
  }

  if (mode === "withdraw" || mode === "reject") {
    if (!/界線|退後|距離|慢/.test(rendered)) {
      rendered = `${rendered.replace(/。$/, "")}。我先保留一點距離。`;
    }
  }

  if (payload.preferPresenceOverAdvice && /建議|應該|試著/.test(rendered)) {
    rendered = rendered.replace(/你可以[^。]+。?/, "你不用急著做什麼。我在。");
  }

  const seed = draft.length + (payload.emotion || "").length;
  const sanitized = sanitizeReply(rendered, seed);
  const forbidden = detectForbiddenPhrases(sanitized.text);

  return {
    used: true,
    provider: "mock",
    mode: "renderer",
    text: sanitized.text,
    forbiddenPhraseDetected: forbidden.hasForbidden,
    reason: "ok"
  };
}