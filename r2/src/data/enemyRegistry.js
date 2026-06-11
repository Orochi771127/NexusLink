// 簡化戰鬥用敵人。視覺僅以名稱與顏色呈現（無 sprite），屬 vertical slice 範圍。

export const ENEMIES = {
  static_wisp: {
    id: "static_wisp",
    name: { zh: "雜訊殘影", en: "Static Wisp" },
    element: "glitch",
    maxHp: 26,
    attack: 4,
    guardChance: 0.15,
    flavor: "一縷從裂隙飄散出來的雜訊，碰到情緒就會嗡嗡作響。"
  },
  crystal_golemite: {
    id: "crystal_golemite",
    name: { zh: "晶屑魔像", en: "Crystal Golemite" },
    element: "earth",
    maxHp: 38,
    attack: 6,
    guardChance: 0.3,
    flavor: "由遺跡碎晶聚成的小魔像，動作慢，但每一步都很沉。"
  },
  rift_shade: {
    id: "rift_shade",
    name: { zh: "裂隙暗影", en: "Rift Shade" },
    element: "void",
    maxHp: 46,
    attack: 8,
    guardChance: 0.2,
    flavor: "貼著裂隙邊緣游動的影子，會試圖模仿你夥伴的輪廓。"
  }
};

export function getEnemyById(enemyId) {
  return ENEMIES[enemyId] || ENEMIES.static_wisp;
}
