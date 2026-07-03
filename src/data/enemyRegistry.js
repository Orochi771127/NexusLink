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
  },

  // ---- Phase 2 A3 擴充：五種裂隙情緒各補一個不同原型（intentBias 微調相位意圖傾向）----
  tearveil_wisp: {
    id: "tearveil_wisp",
    name: { zh: "淚幕殘影", en: "Tearveil Wisp" },
    element: "glitch",
    emotion: "sadness",
    emotionLabelZh: "低鳴",
    maxHp: 22,
    attack: 3,
    guardChance: 0.22,
    intentBias: { lull: 0.15 }, // 溫和、易安撫（適合早期節點）
    flavor: "一層薄薄的淚光懸在裂隙口，輕輕一碰就會化開。"
  },
  sink_weight: {
    id: "sink_weight",
    name: { zh: "沉墜殘殼", en: "Sinking Husk" },
    element: "void",
    emotion: "fatigue",
    emotionLabelZh: "倦怠",
    maxHp: 52,
    attack: 4,
    guardChance: 0.3,
    intentBias: { surge: -0.15, lull: 0.2 }, // 沉重、動作少，多在暫歇
    flavor: "沉得幾乎不想動的殘殼，散著「好重、好想睡」的低頻。"
  },
  spite_ember: {
    id: "spite_ember",
    name: { zh: "慍火殘影", en: "Spiteful Ember" },
    element: "earth",
    emotion: "anger",
    emotionLabelZh: "沉怒",
    maxHp: 40,
    attack: 9,
    guardChance: 0.12,
    intentBias: { surge: 0.2, lull: -0.1 }, // 一點就炸，湧動頻繁
    flavor: "一點按不下去的火星，動不動就往外炸。"
  },
  drift_murmur: {
    id: "drift_murmur",
    name: { zh: "飄鳴回響", en: "Drifting Murmur" },
    element: "void",
    emotion: "loneliness",
    emotionLabelZh: "孤鳴",
    maxHp: 44,
    attack: 6,
    guardChance: 0.28,
    intentBias: { lull: 0.2 }, // 常停下來像在等回應
    flavor: "在空曠裡反覆飄盪的回音，像對著沒人的夜輕輕問「還在嗎」。"
  },
  dread_coil: {
    id: "dread_coil",
    name: { zh: "纏懼暗影", en: "Dread Coil" },
    element: "void",
    emotion: "anxiety",
    emotionLabelZh: "迷茫",
    maxHp: 48,
    attack: 7,
    guardChance: 0.18,
    intentBias: { gather: 0.25 }, // 越纏越緊，常蓄能後重擊
    flavor: "越纏越緊的影子，總在你以為沒事時又繃起來。"
  }
};

export function getEnemyById(enemyId) {
  return ENEMIES[enemyId] || ENEMIES.static_wisp;
}
