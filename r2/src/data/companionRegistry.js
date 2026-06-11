import { DEFAULT_TOUCH_PERSONALITY } from "../engine/personalityProfile.js";

export const DEFAULT_COMPANION_ID = "greyshade-cat";

const GREYSHADE_PERSONALITY = {
  ...DEFAULT_TOUCH_PERSONALITY,
  baseSafety: 30,
  baseDefense: 30,
  fatigueSensitivity: 1.5
};

const FLAMETAIL_PERSONALITY = {
  ...DEFAULT_TOUCH_PERSONALITY,
  baseSafety: 30,
  baseDefense: 10,
  fatigueSensitivity: 1.0
};

export const COMPANIONS = [
  {
    id: "greyshade-cat",
    name: "灰影貓",
    displayName: { zh: "灰影貓", en: "Greyshade Cat" },
    element: "neutral",
    faction: { zh: "樞核", en: "Nexus Core" },
    emotionalEmblem: { zh: "憶・幽影", en: "Memory / Shadow Echo" },
    temperament: { zh: "靜觀內斂", en: "Observant & Quiet" },
    battleRole: { zh: "守望者", en: "Guardian" },
    habitatAffinity: { zh: "夜湖月畔", en: "Moonlit Lakeside" },
    soulTalkTone: "quiet_observer",
    evolutionLineId: "greyshade-cat-line",
    runtimeStatus: "full-runtime",
    radar: { power: 45, defense: 60, speed: 55, wisdom: 70, emotion: 80, healing: 50 },
    defaultMood: "calm",
    description: "安靜觀察玩家的灰色貓型心核夥伴，記得每一道留在棲地的情緒痕跡。",
    image: null,
    placeholder: { bodyColor: 0x5f6876, accentColor: 0x8a93a3, emblemShape: "moon" },
    personality: GREYSHADE_PERSONALITY
  },
  {
    id: "flametail-fox",
    name: "焰尾狐",
    displayName: { zh: "焰尾狐", en: "Flametail Fox" },
    element: "fire",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "勇・炎志", en: "Courage / Flaming Will" },
    temperament: { zh: "熱烈直率", en: "Passionate & Direct" },
    battleRole: { zh: "突擊者", en: "Attacker" },
    habitatAffinity: { zh: "營火石圈", en: "Campfire Circle" },
    soulTalkTone: "warm_blaze",
    evolutionLineId: "flametail-fox-line",
    runtimeStatus: "static-image",
    radar: { power: 75, defense: 40, speed: 70, wisdom: 50, emotion: 65, healing: 30 },
    defaultMood: "warm",
    description: "火屬性的陪伴型心核夥伴，尾上的火光會跟著你的情緒明滅。",
    image: "./assets/flametail-fox.png",
    placeholder: { bodyColor: 0x9a4a2e, accentColor: 0xffb27a, emblemShape: "flame" },
    personality: FLAMETAIL_PERSONALITY
  },
  {
    id: "crystal-seahorse",
    name: "水晶海馬",
    displayName: { zh: "水晶海馬", en: "Crystal Seahorse" },
    element: "water",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "智・玄水", en: "Wisdom / Dark Water" },
    temperament: { zh: "沉靜如流", en: "Calm & Flowing" },
    battleRole: { zh: "支援者", en: "Support" },
    habitatAffinity: { zh: "霧潮河岸", en: "Misty Tide Shore" },
    soulTalkTone: "deep_current",
    evolutionLineId: "crystal-seahorse-line",
    runtimeStatus: "placeholder",
    radar: { power: 35, defense: 50, speed: 45, wisdom: 80, emotion: 70, healing: 75 },
    defaultMood: "calm",
    description: "通透如晶的水之夥伴，擅長傾聽情緒底層的潮汐律動。",
    image: null,
    placeholder: { bodyColor: 0x2a7fae, accentColor: 0x7fe3ff, emblemShape: "droplet" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 24, fatigueSensitivity: 1.2 }
  },
  {
    id: "verdant-stag",
    name: "青葉麋鹿",
    displayName: { zh: "青葉麋鹿", en: "Verdant Stag" },
    element: "wood",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "和・青木", en: "Harmony / Green Wood" },
    temperament: { zh: "溫厚守序", en: "Gentle & Steady" },
    battleRole: { zh: "療癒者", en: "Healer" },
    habitatAffinity: { zh: "星林步道", en: "Starlit Forest Trail" },
    soulTalkTone: "steady_grove",
    evolutionLineId: "verdant-stag-line",
    runtimeStatus: "placeholder",
    radar: { power: 50, defense: 55, speed: 40, wisdom: 65, emotion: 60, healing: 85 },
    defaultMood: "calm",
    description: "鹿角間棲著嫩葉與微光的木之夥伴，靠近時能聞到森林雨後的氣息。",
    image: null,
    placeholder: { bodyColor: 0x2e7d52, accentColor: 0x8fe3a0, emblemShape: "leaf" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 20, fatigueSensitivity: 1.1 }
  },
  {
    id: "thunder-pup",
    name: "雷霆幼狼",
    displayName: { zh: "雷霆幼狼", en: "Thunder Pup" },
    element: "thunder",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "信・金剛", en: "Faith / Diamond Resolve" },
    temperament: { zh: "勇敢忠誠", en: "Brave & Loyal" },
    battleRole: { zh: "前鋒", en: "Vanguard" },
    habitatAffinity: { zh: "晶岩遺跡", en: "Crystalline Ruins" },
    soulTalkTone: "bright_spark",
    evolutionLineId: "thunder-pup-line",
    runtimeStatus: "placeholder",
    radar: { power: 80, defense: 65, speed: 75, wisdom: 40, emotion: 55, healing: 25 },
    defaultMood: "warm",
    description: "毛尖躍動著細小雷光的幼狼，會在你需要勇氣時第一個站到你前面。",
    image: null,
    placeholder: { bodyColor: 0x5a4fae, accentColor: 0xc4b5ff, emblemShape: "bolt" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 16, fatigueSensitivity: 1.0 }
  }
];

const COMPANION_MAP = new Map(COMPANIONS.map((companion) => [companion.id, companion]));

export function isKnownCompanionId(companionId) {
  return COMPANION_MAP.has(companionId);
}

export function getCompanionById(companionId) {
  return COMPANION_MAP.get(companionId) || COMPANION_MAP.get(DEFAULT_COMPANION_ID);
}

export const ELEMENT_LABELS = {
  neutral: { zh: "中性", en: "Neutral" },
  fire: { zh: "火", en: "Fire" },
  water: { zh: "水", en: "Water" },
  wood: { zh: "木", en: "Wood" },
  thunder: { zh: "雷", en: "Thunder" }
};

export const RUNTIME_STATUS_LABELS = {
  "full-runtime": "動畫就緒",
  "static-image": "靜態立繪",
  placeholder: "輪廓佔位"
};
