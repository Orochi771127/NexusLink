// 簡化戰鬥用敵人。視覺僅以名稱與顏色呈現（無 sprite），屬 vertical slice 範圍。

export const ENEMIES = {
  static_wisp: {
    id: "static_wisp",
    name: { zh: "雜訊殘影", en: "Static Wisp" },
    element: "glitch",
    emotion: "sadness",
    emotionLabelZh: "低鳴",
    maxHp: 26,
    attack: 4,
    guardChance: 0.15,
    flavor: "一縷從裂隙飄散出來的雜訊，碰到情緒就會嗡嗡作響。"
  },
  crystal_golemite: {
    id: "crystal_golemite",
    name: { zh: "晶屑魔像", en: "Crystal Golemite" },
    element: "earth",
    emotion: "anger",
    emotionLabelZh: "沉怒",
    maxHp: 38,
    attack: 6,
    guardChance: 0.3,
    flavor: "由遺跡碎晶聚成的小魔像，動作慢，但每一步都很沉。"
  },
  rift_shade: {
    id: "rift_shade",
    name: { zh: "裂隙暗影", en: "Rift Shade" },
    element: "void",
    emotion: "anxiety",
    emotionLabelZh: "迷茫",
    maxHp: 46,
    attack: 8,
    guardChance: 0.2,
    flavor: "貼著裂隙邊緣游動的影子，會試圖模仿你夥伴的輪廓。"
  },
  weary_husk: {
    id: "weary_husk",
    name: { zh: "倦怠殘殼", en: "Weary Husk" },
    element: "void",
    emotion: "fatigue",
    emotionLabelZh: "倦怠",
    maxHp: 32,
    attack: 5,
    guardChance: 0.25,
    flavor: "一具被情緒掏空後留下的殼，沉沉地散著「好累」的低頻。"
  },
  hollow_echo: {
    id: "hollow_echo",
    name: { zh: "空鳴回響", en: "Hollow Echo" },
    element: "void",
    emotion: "loneliness",
    emotionLabelZh: "孤鳴",
    maxHp: 42,
    attack: 7,
    guardChance: 0.18,
    flavor: "在裂隙裡反覆迴盪的空響，像有人對著無人的夜一直喊。"
  }
};

export function getEnemyById(enemyId) {
  return ENEMIES[enemyId] || ENEMIES.static_wisp;
}
