export const DEFAULT_HABITAT_ID = "moonlake";

function habitat(id, names, nameEn = names.en) {
  return Object.freeze({ id, name: names.tc, nameEn, names: Object.freeze(names), profileId: id });
}

export const HABITAT_REGISTRY = Object.freeze({
  moonlake: habitat("moonlake", { tc: "月湖營地", sc: "月湖营地", en: "Moonlake Habitat", jp: "月湖の野営地" }),
  plains: habitat("plains", { tc: "北部翠綠平原區", sc: "北部翠绿平原区", en: "Northern Verdant Plains", jp: "北部翠緑平原" }),
  forge: habitat("forge", { tc: "東南熔爐丘陵區", sc: "东南熔炉丘陵区", en: "Southeast Forge Hills", jp: "南東炉丘陵" }),
  harbor: habitat("harbor", { tc: "南港", sc: "南港", en: "Southern Harbor Nexus", jp: "南港" }),
  core: habitat("core", { tc: "中央輝耀核心區", sc: "中央辉耀核心区", en: "Central Radiant Core", jp: "中央輝耀核域" }),
  tidal: habitat("tidal", { tc: "西南潮汐邊疆區", sc: "西南潮汐边疆区", en: "Southwest Tidal Frontier", jp: "南西潮汐辺境" }),
  mystic: habitat("mystic", { tc: "秘境山脈核心", sc: "秘境山脉核心", en: "Eastern Mystic Mountains", jp: "東部秘境山脈" })
});

export const HABITAT_IDS = Object.freeze(Object.keys(HABITAT_REGISTRY));

export function getHabitatById(id) {
  return HABITAT_REGISTRY[id] || HABITAT_REGISTRY[DEFAULT_HABITAT_ID];
}

export function isKnownHabitatId(id) {
  return typeof id === "string" && Object.prototype.hasOwnProperty.call(HABITAT_REGISTRY, id);
}

export function normalizeHabitatId(id) {
  return isKnownHabitatId(id) ? id : DEFAULT_HABITAT_ID;
}
