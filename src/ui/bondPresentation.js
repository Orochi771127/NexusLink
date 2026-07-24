/**
 * 質性羈絆呈現（Product Pack — qualitative bond）
 *
 * 引擎仍用 state.bond / state.trust 數字；本模組只負責「玩家看得見什麼」。
 * 禁止輸出「還差幾點／目前 N」類刷分文案。
 */

export const BOND_STAGE_BANDS = Object.freeze([
  Object.freeze({
    id: "nascent",
    min: 0,
    label: { zh: "初識微光", en: "First glimmer" },
    note: { zh: "你們剛開始靠近，還不必急著定義什麼。", en: "You're only beginning to draw near." }
  }),
  Object.freeze({
    id: "first_glow",
    min: 12,
    label: { zh: "初亮的記憶", en: "First bright memory" },
    note: { zh: "牠開始記得你靠近的方式。", en: "It is starting to remember how you approach." }
  }),
  Object.freeze({
    id: "trust_sprout",
    min: 25,
    label: { zh: "信任萌芽", en: "Trust sprouting" },
    note: { zh: "有你在時，牠比較敢安靜下來。", en: "With you near, it dares to grow quiet." }
  }),
  Object.freeze({
    id: "safe_place",
    min: 45,
    label: { zh: "可以放心", en: "A place to rest" },
    note: { zh: "你被放進一個不大、但很重要的位置。", en: "You've been placed somewhere small and important." }
  }),
  Object.freeze({
    id: "side_by_side",
    min: 70,
    label: { zh: "並肩", en: "Side by side" },
    note: { zh: "累得說不出話也可以；牠會在。", en: "Even wordless fatigue is okay; it stays." }
  }),
  Object.freeze({
    id: "lake_light",
    min: 90,
    label: { zh: "不滅的湖光", en: "Unfading lake light" },
    note: { zh: "你們攢下的光，夠替彼此亮著。", en: "The light you've gathered is enough to hold." }
  })
]);

export const TRUST_STAGE_BANDS = Object.freeze([
  Object.freeze({
    id: "watching",
    min: 0,
    label: { zh: "還在觀望", en: "Still watching" }
  }),
  Object.freeze({
    id: "step_closer",
    min: 20,
    label: { zh: "願意靠近一點", en: "Willing to step closer" }
  }),
  Object.freeze({
    id: "easing",
    min: 40,
    label: { zh: "漸漸放心", en: "Easing into trust" }
  }),
  Object.freeze({
    id: "leaning",
    min: 60,
    label: { zh: "願意依靠", en: "Willing to lean" }
  }),
  Object.freeze({
    id: "deep_trust",
    min: 80,
    label: { zh: "深信靠近", en: "Trusts the nearness" }
  })
]);

function pickBand(bands, value) {
  const n = Number(value);
  const score = Number.isFinite(n) ? n : 0;
  let chosen = bands[0];
  for (const band of bands) {
    if (score >= band.min) chosen = band;
  }
  return chosen;
}

export function getBondStagePresentation(bond = 0, lang = "zh") {
  const band = pickBand(BOND_STAGE_BANDS, bond);
  const useEn = String(lang).toLowerCase().startsWith("en");
  return {
    id: band.id,
    label: useEn ? band.label.en : band.label.zh,
    note: useEn ? band.note.en : band.note.zh,
    barPercent: Math.max(0, Math.min(100, Math.round(Number(bond) || 0)))
  };
}

export function getTrustStagePresentation(trust = 0, lang = "zh") {
  const band = pickBand(TRUST_STAGE_BANDS, trust);
  const useEn = String(lang).toLowerCase().startsWith("en");
  return {
    id: band.id,
    label: useEn ? band.label.en : band.label.zh,
    barPercent: Math.max(0, Math.min(100, Math.round(Number(trust) || 0)))
  };
}

/** 探索 toast：用質性短語取代「羈絆 +3」。 */
export function formatAffinityDeltaChip(key, delta, lang = "zh") {
  const useEn = String(lang).toLowerCase().startsWith("en");
  const up = Number(delta) > 0;
  if (key === "bond") {
    if (up) return useEn ? "The bond feels a little deeper" : "羈絆更深了一點";
    return useEn ? "The bond feels strained" : "羈絆有點緊繃";
  }
  if (key === "trust") {
    if (up) return useEn ? "Trust loosened a little" : "信任鬆了一點";
    return useEn ? "Trust pulled back" : "信任往後退了一點";
  }
  return null;
}

/** 年表未亮起時的下一道光痕說明（無 threshold／無目前分數）。 */
export function formatUpcomingMilestoneCopy(theme, lang = "zh") {
  const useEn = String(lang).toLowerCase().startsWith("en");
  const name = String(theme || (useEn ? "the next light" : "下一段光痕"));
  return useEn
    ? `Next light: ${name} — no need to chase; presence lets it rise.`
    : `下一段光痕：${name}——不必追趕，陪伴會自己亮起。`;
}
