import { deriveKeywords } from "./specificDetailExtractor.js";

export function replyReferencesDetail(reply = "", specificDetail = null) {
  if (!specificDetail?.text) return true;

  const text = String(reply || "");
  const detail = String(specificDetail.text || "").trim();
  if (!detail) return true;

  if (detail.length >= 3 && text.includes(detail)) return true;

  const shortSpan = detail.slice(0, Math.min(detail.length, 8));
  if (shortSpan.length >= 3 && text.includes(shortSpan)) return true;

  const keywords = specificDetail.keywords || deriveKeywords(detail);
  return keywords.some((keyword) => keyword && text.includes(keyword));
}

export function weaveExplicitReference(reply = "", specificDetail = null, { strategy = "" } = {}) {
  if (!specificDetail?.text) return String(reply || "").trim();
  if (replyReferencesDetail(reply, specificDetail)) return String(reply || "").trim();

  const detail = truncateDetail(specificDetail.text);
  const body = String(reply || "").trim();

  if (strategy === "practical_clarification" || strategy === "practical_explanation") {
    return `先對準你說的「${detail}」。${body}`;
  }

  if (strategy === "quiet_presence" || strategy === "holding_space") {
    return body;
  }

  const prefixes = [
    `你說的「${detail}」我先放在前面。`,
    `我先接住你提到的${detail}。`,
    `關於${detail}——`
  ];

  const prefix = prefixes[detail.length % prefixes.length];
  if (!body) return prefix.replace(/[。——]$/, "。");
  return `${prefix}${body}`;
}

function truncateDetail(text = "", max = 18) {
  const trimmed = String(text || "").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}