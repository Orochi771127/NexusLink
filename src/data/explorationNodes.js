export const EXPLORATION_NODES = [
  {
    id: "moonlake_camp",
    label: { zh: "月湖營地", en: "Moonlit Lake Camp" },
    description: "灰影貓棲息的靜謐夜湖。營火溫暖，月光如鏡，是冒險的起點與歸所。",
    eventType: "rest",
    emotionalTone: "calm",
    encounterChance: 0,
    enemyPool: [],
    possibleRewards: [{ stat: "energy", delta: 2 }, { stat: "mood", value: "calm" }],
    resultMessages: [
      "你們在營火邊坐了一會兒，湖面的月光輕輕晃動。",
      "夥伴靠在你身邊，營地的暖意慢慢滲進來。",
      "什麼都沒發生，這正是月湖營地最好的地方。"
    ]
  },
  {
    id: "starwood_trail",
    label: { zh: "星林步道", en: "Starlit Forest Trail" },
    description: "參天古木與滿天星辰的靜謐林道，樹上的結晶閃閃發光，溫和且神祕。",
    eventType: "peaceful",
    emotionalTone: "wonder",
    encounterChance: 0.15,
    enemyPool: ["static_wisp"],
    possibleRewards: [{ stat: "bond", delta: 2 }, { stat: "mood", value: "warm" }],
    resultMessages: [
      "一顆星晶從枝頭落下，夥伴用鼻尖碰了碰它。",
      "你們沿著步道慢慢走，星光在樹葉間流動。",
      "夜行小獸從你們腳邊穿過，夥伴的耳朵動了動。"
    ]
  },
  {
    id: "crystal_ruins",
    label: { zh: "晶岩遺跡", en: "Crystalline Ruins" },
    description: "古文明遺留的晶岩柱遺跡。地脈在此匯聚，深處隱藏著被遺忘的祕密。",
    eventType: "discovery",
    emotionalTone: "mystery",
    encounterChance: 0.35,
    enemyPool: ["crystal_golemite", "static_wisp"],
    possibleRewards: [{ stat: "trust", delta: 2 }, { stat: "bond", delta: 1 }],
    resultMessages: [
      "你們在一根晶柱底下找到一塊溫熱的記憶碎片。",
      "晶岩折射的光在夥伴身上畫出細小的符紋。",
      "遺跡深處傳來低低的共鳴聲，夥伴貼近了你一點。"
    ]
  },
  {
    id: "misttide_shore",
    label: { zh: "霧潮河岸", en: "Misty Tide Shore" },
    description: "河水如鏡面般寧靜，霧氣籠罩其上。水聲輕柔如呢喃，是冥想與反思之地。",
    eventType: "reflective",
    emotionalTone: "calm",
    encounterChance: 0.1,
    enemyPool: ["static_wisp"],
    possibleRewards: [{ stat: "energy", delta: 1 }, { stat: "mood", value: "calm" }],
    resultMessages: [
      "霧氣裡，你看見水面映出自己安靜下來的樣子。",
      "夥伴在淺灘邊停下，看著潮水一進一退。",
      "河岸的霧很輕，心裡的某個結也鬆了一點。"
    ]
  },
  {
    id: "rift_observatory",
    label: { zh: "裂隙觀測點", en: "Rift Observation Point" },
    description: "現實與虛空的邊界在此可見，光線扭曲、時間感模糊。危險，但有股力量在呼喚。",
    eventType: "danger",
    emotionalTone: "dread",
    encounterChance: 1,
    enemyPool: ["rift_shade", "crystal_golemite"],
    possibleRewards: [{ stat: "trust", delta: 3 }],
    resultMessages: [
      "裂隙邊緣的空氣在發出細小的雜訊聲——有東西過來了。"
    ]
  }
];

export const EXPLORATION_NODE_IDS = EXPLORATION_NODES.map((node) => node.id);

const NODE_MAP = new Map(EXPLORATION_NODES.map((node) => [node.id, node]));

export function getExplorationNodeById(nodeId) {
  return NODE_MAP.get(nodeId) || null;
}
