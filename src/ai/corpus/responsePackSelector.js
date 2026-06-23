import { detectForbiddenPhrases } from "../forbiddenPhrases.js";

export function selectResponsePackLine({
  corpus = {},
  companionId = "greyshade-cat",
  emotion = "calm",
  intent = "",
  reaction = "acknowledge",
  state = {},
  semanticSoul = {},
  recoveryContext = null,
  seed = 0
} = {}) {
  const packs = corpus.responsePacks?.[companionId] || corpus.responsePacks?.["greyshade-cat"] || [];
  const trust = normalizeTrust(state.trust);
  const defense = (Number(state.defense) || 0) / 100;
  const energy = (Number(state.energy) ?? 10) / 10;
  const boundaryPressure = semanticSoul.boundaryPressure ?? 0;

  const candidates = packs
    .filter((pack) => packMatches(pack, {
      emotion,
      intent,
      reaction,
      trust,
      defense,
      energy,
      boundaryPressure,
      recoveryContext
    }))
    .sort((left, right) => scorePack(right, recoveryContext) - scorePack(left, recoveryContext));

  const pack = candidates[0];
  if (!pack) return { line: "", packId: null, source: "none" };
  if (pack.silent) return { line: "", packId: pack.id, source: "pack_silent", silent: true };

  const lines = (pack.lines || []).filter(Boolean);
  if (!lines.length) return { line: "", packId: pack.id, source: "pack_empty" };

  const line = lines[Math.abs(seed) % lines.length];
  const forbidden = validatePackLine(line, pack.forbidden || []);

  return {
    line: forbidden.text,
    packId: pack.id,
    source: "response_pack",
    forbiddenDetected: forbidden.hasForbidden
  };
}

function packMatches(pack, ctx) {
  if (pack.emotion && pack.emotion !== ctx.emotion && pack.emotion !== "boundary") return false;
  if (pack.intent && pack.intent !== ctx.intent) return false;
  if (pack.reaction && pack.reaction !== ctx.reaction) return false;

  if (pack.minTrust != null && ctx.trust < pack.minTrust) return false;
  if (pack.maxTrust != null && ctx.trust > pack.maxTrust) return false;
  if (pack.minDefense != null && ctx.defense < pack.minDefense) return false;
  if (pack.maxDefense != null && ctx.defense > pack.maxDefense) return false;
  if (pack.minEnergy != null && ctx.energy < pack.minEnergy) return false;
  if (pack.maxEnergy != null && ctx.energy > pack.maxEnergy) return false;
  if (pack.maxBoundaryPressure != null && ctx.boundaryPressure > pack.maxBoundaryPressure) return false;

  if (pack.requiresRecall && !ctx.recoveryContext?.canRecall) return false;
  if (pack.memoryStatus && ctx.recoveryContext?.memoryStatus !== pack.memoryStatus) return false;

  return true;
}

function scorePack(pack, recoveryContext) {
  let score = 0;
  if (pack.requiresRecall && recoveryContext?.canRecall) score += 2;
  if (pack.intent) score += 1;
  if (pack.reaction) score += 0.5;
  return score;
}

function validatePackLine(line, extraForbidden = []) {
  const check = detectForbiddenPhrases(line);
  if (check.hasForbidden) return { text: line, hasForbidden: true };

  for (const phrase of extraForbidden) {
    if (line.includes(phrase)) return { text: line, hasForbidden: true };
  }

  return { text: line, hasForbidden: false };
}

function normalizeTrust(trust) {
  const value = Number(trust) || 0;
  return value > 1 ? value / 100 : value;
}