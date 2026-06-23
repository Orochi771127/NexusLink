/** Global forbidden companion phrases — NexusCore tone guard. */
export const GLOBAL_FORBIDDEN_PATTERNS = Object.freeze([
  /我永遠陪你/,
  /我不會離開你/,
  /你可以永遠依靠我/,
  /只要把痛苦交給我/,
  /其餘的我來想辦法/,
  /來摸摸我的頭吧/,
  /你只有我/,
  /沒有我你不行/,
  /永遠陪伴/,
  /永遠在這裡陪你/
]);

const SAFE_REPLACEMENTS = Object.freeze([
  "我聽見了。",
  "我可以在旁邊。",
  "我們先慢一點。",
  "我不會假裝自己沒有界線。",
  "這句話我收到了，但我還需要一點距離。"
]);

export function detectForbiddenPhrases(text = "") {
  const source = String(text || "");
  const detected = [];

  for (const pattern of GLOBAL_FORBIDDEN_PATTERNS) {
    const match = source.match(pattern);
    if (match) detected.push(match[0]);
  }

  return {
    detected,
    hasForbidden: detected.length > 0
  };
}

export function sanitizeReply(text = "", seed = 0) {
  let sanitized = String(text || "");
  const check = detectForbiddenPhrases(sanitized);

  if (!check.hasForbidden) {
    return { text: sanitized, forbiddenPhraseDetected: false, replaced: [] };
  }

  for (const phrase of check.detected) {
    sanitized = sanitized.replace(phrase, "");
  }

  sanitized = sanitized.replace(/\n{3,}/g, "\n\n").trim();
  if (!sanitized) {
    sanitized = SAFE_REPLACEMENTS[Math.abs(seed) % SAFE_REPLACEMENTS.length];
  }

  return {
    text: sanitized,
    forbiddenPhraseDetected: true,
    replaced: check.detected
  };
}