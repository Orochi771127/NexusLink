import { detectForbiddenPhrases } from "../forbiddenPhrases.js";

/** guarded_acknowledge 與 acknowledge 共用情緒 voice pack。 */
function normalizePackReaction(reaction = "acknowledge") {
  return reaction === "guarded_acknowledge" ? "acknowledge" : reaction;
}

export function listResponsePackVariants({
  corpus = {},
  companionId = "greyshade-cat",
  emotion = "calm",
  intent = "",
  reaction = "acknowledge",
  state = {},
  semanticSoul = {},
  recoveryContext = null
} = {}) {
  const packs = corpus.responsePacks?.[companionId] || corpus.responsePacks?.["greyshade-cat"] || [];
  const trust = normalizeTrust(state.trust);
  const defense = (Number(state.defense) || 0) / 100;
  const energy = (Number(state.energy) ?? 10) / 10;
  const boundaryPressure = semanticSoul.boundaryPressure ?? 0;
  const ctx = {
    emotion,
    intent,
    reaction: normalizePackReaction(reaction),
    trust,
    defense,
    energy,
    boundaryPressure,
    recoveryContext
  };

  const candidates = packs
    .filter((pack) => packMatches(pack, ctx))
    .sort((left, right) => scorePack(right, recoveryContext) - scorePack(left, recoveryContext));

  const pack = candidates[0];
  if (!pack || pack.silent) return [];

  return (pack.lines || [])
    .filter(Boolean)
    .map((line, index) => ({
      variantId: `pack:${pack.id}:${index}`,
      variantIndex: index,
      packId: pack.id,
      lineIndex: index,
      replySource: "response_pack",
      openingPhrase: String(line).split(/[。！？]/)[0].trim().slice(0, 14),
      preview: line
    }));
}

export function selectResponsePackAtVariant({
  corpus = {},
  companionId = "greyshade-cat",
  emotion = "calm",
  intent = "",
  reaction = "acknowledge",
  state = {},
  semanticSoul = {},
  recoveryContext = null,
  packId = null,
  lineIndex = 0
} = {}) {
  const packs = corpus.responsePacks?.[companionId] || corpus.responsePacks?.["greyshade-cat"] || [];

  // variant 已指定 packId 時直接取句，避免 plan.mode 對齊後 reaction 不一致導致落空。
  if (packId) {
    const pack = packs.find((item) => item.id === packId);
    const lines = (pack?.lines || []).filter(Boolean);
    if (pack && lines.length) {
      const safeIndex = ((Number(lineIndex) || 0) % lines.length + lines.length) % lines.length;
      const line = lines[safeIndex];
      const forbidden = validatePackLine(line, pack.forbidden || []);
      return {
        line: forbidden.text,
        packId: pack.id,
        source: "response_pack",
        forbiddenDetected: forbidden.hasForbidden,
        lineIndex: safeIndex
      };
    }
  }

  const variants = listResponsePackVariants({
    corpus,
    companionId,
    emotion,
    intent,
    reaction: normalizePackReaction(reaction),
    state,
    semanticSoul,
    recoveryContext
  });

  const matched =
    variants.find((item) => item.packId === packId && item.lineIndex === lineIndex) ||
    variants.find((item) => item.lineIndex === lineIndex) ||
    variants[0];

  if (!matched) {
    return selectResponsePackLine({
      corpus,
      companionId,
      emotion,
      intent,
      reaction: normalizePackReaction(reaction),
      state,
      semanticSoul,
      recoveryContext,
      seed: lineIndex
    });
  }

  const pack = packs.find((item) => item.id === matched.packId);
  const line = pack?.lines?.[matched.lineIndex] || "";
  const forbidden = validatePackLine(line, pack?.forbidden || []);

  return {
    line: forbidden.text,
    packId: matched.packId,
    source: "response_pack",
    forbiddenDetected: forbidden.hasForbidden,
    lineIndex: matched.lineIndex
  };
}

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
      reaction: normalizePackReaction(reaction),
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

  if (pack.requiresRecall && !ctx.recoveryContext?.allowsExplicitReference) return false;
  if (pack.memoryStatus && ctx.recoveryContext?.memoryStatus !== pack.memoryStatus) return false;

  return true;
}

function scorePack(pack, recoveryContext) {
  let score = 0;
  if (pack.requiresRecall && recoveryContext?.allowsExplicitReference) score += 2;
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