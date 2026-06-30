const MIN_MEANINGFUL_LENGTH = 2;

export function prepareSoulTalkInput(inputText = "", state = {}, runtime = {}) {
  const originalInput = String(inputText ?? "");
  const normalizedInput = normalizeInput(originalInput);
  const now = Number.isFinite(runtime.now) ? runtime.now : Date.now();
  const idSuffix = buildIdSuffix(runtime.idSuffix, normalizedInput, now);
  const repeated = detectRepeated(normalizedInput, state, runtime);
  const inputQuality = assessInputQuality(normalizedInput);

  return {
    originalInput,
    normalizedInput,
    inputQuality,
    repeated,
    now,
    idSuffix,
    isEmpty: !normalizedInput,
    isNoise: inputQuality === "noise" || inputQuality === "too_short" || inputQuality === "empty"
  };
}

function normalizeInput(input) {
  return String(input || "")
    .replace(/\s+/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

function detectRepeated(normalizedInput, state, runtime) {
  if (typeof runtime.repeated === "boolean") return runtime.repeated;
  const last = normalizeInput(state.lastMessage || "");
  return Boolean(normalizedInput && last && normalizedInput === last);
}

function buildIdSuffix(runtimeSuffix, normalizedInput, now) {
  if (runtimeSuffix) return String(runtimeSuffix).padStart(3, "0").slice(-3);
  const hash = (normalizedInput.length + (now % 1000)) % 1000;
  return String(hash).padStart(3, "0");
}

function assessInputQuality(text) {
  if (!text) return "empty";
  if (text.length < MIN_MEANINGFUL_LENGTH) return "too_short";

  const compact = text.replace(/\s/g, "");
  if (isAsciiKeyboardNoise(text)) return "noise";
  if (!compact) return "empty";

  if (/^(.)(\1{5,})$/.test(compact)) return "noise";
  if (/^[\d_\s\p{P}\p{S}]+$/u.test(compact)) return "noise";
  if (/^(哈|呵|嘻|ㄏ|w){6,}$/i.test(compact)) return "noise";

  return "meaningful";
}

function isAsciiKeyboardNoise(text) {
  if (!/^[a-z0-9\s?!.:,;'"()[\]{}_-]+$/i.test(text)) return false;
  const compact = text.replace(/[^a-z0-9]/gi, "");
  if (compact.length < 8) return false;
  const meaningfulTokens =
    /\b(soul|talk|hud|ui|bug|map|ai|raphael|tired|anxious|help|hello|hi|stress|sad|angry|feel|feeling)\b/i;
  if (meaningfulTokens.test(text)) return false;
  const tokens = text.toLowerCase().match(/[a-z]{3,}/g) || [];
  return tokens.length >= 2;
}
