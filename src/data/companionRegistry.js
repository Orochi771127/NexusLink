import { DEFAULT_TOUCH_PERSONALITY } from "../engine/personalityProfile.js";

export const DEFAULT_COMPANION_ID = "greyshade-cat";

export const COMPANION_TIERS = Object.freeze({
  PRIMARY: "primary",
  LEGACY: "legacy",
  ROADMAP: "roadmap",
  PLACEHOLDER: "placeholder"
});

export const COMPANION_ASSET_READINESS = Object.freeze({
  RUNTIME_READY: "runtime-ready",
  STATIC_READY: "static-ready",
  QC_PENDING: "qc-pending",
  SPEC_PENDING: "spec-pending"
});

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
    tier: COMPANION_TIERS.PRIMARY,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "prologue",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 45, defense: 60, speed: 55, wisdom: 70, emotion: 80, healing: 50 },
    defaultMood: "calm",
    description: "安靜觀察玩家的灰色貓型心核夥伴，記得每一道留在棲地的情緒痕跡。",
    image: null,
    animationsManifest: "./assets/characters/greyshade-cat/metadata/animations.json",
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
    tier: COMPANION_TIERS.LEGACY,
    runtimeStatus: "static-image",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "heartspark",
    assetReadiness: COMPANION_ASSET_READINESS.STATIC_READY,
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
    tier: COMPANION_TIERS.PLACEHOLDER,
    runtimeStatus: "placeholder",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "tide-memory",
    assetReadiness: COMPANION_ASSET_READINESS.SPEC_PENDING,
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
    tier: COMPANION_TIERS.PLACEHOLDER,
    runtimeStatus: "placeholder",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "greenwood-vow",
    assetReadiness: COMPANION_ASSET_READINESS.SPEC_PENDING,
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
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "placeholder",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "storm-ruins",
    assetReadiness: COMPANION_ASSET_READINESS.QC_PENDING,
    radar: { power: 80, defense: 65, speed: 75, wisdom: 40, emotion: 55, healing: 25 },
    defaultMood: "warm",
    description: "毛尖躍動著細小雷光的幼狼，會在你需要勇氣時第一個站到你前面。",
    image: null,
    placeholder: { bodyColor: 0x5a4fae, accentColor: 0xc4b5ff, emblemShape: "bolt" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 16, fatigueSensitivity: 1.0 }
  },
  {
    id: "star-energy-boarlet",
    name: "星能小山豬",
    displayName: { zh: "星能小山豬", en: "Star-energy Boarlet" },
    element: "star",
    faction: { zh: "星核牧野", en: "Astral Meadow" },
    emotionalEmblem: { zh: "守望 / 星核", en: "Steadfastness / Star Core" },
    temperament: { zh: "踏實而敏感", en: "Grounded & Sensitive" },
    battleRole: { zh: "穩定者", en: "Stabilizer" },
    habitatAffinity: { zh: "星露草坡", en: "Starlit Dew Meadow" },
    soulTalkTone: "steady_starlight",
    evolutionLineId: "star-energy-boarlet-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "placeholder",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "starlit-meadow",
    assetReadiness: COMPANION_ASSET_READINESS.SPEC_PENDING,
    radar: { power: 55, defense: 75, speed: 35, wisdom: 58, emotion: 68, healing: 62 },
    defaultMood: "calm",
    description: "把星光藏在小小步伐裡的夥伴；牠不急著靠近，但會在你停下來時守住地面。",
    image: null,
    placeholder: { bodyColor: 0x6a5f3a, accentColor: 0xf4d77d, emblemShape: "star" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 26, fatigueSensitivity: 1.15 }
  },

  // ──────────────────────────────────────────────────────────────────────
  // 心輝議會・五元守護（512×512 動畫 runtime 陣容）
  // 由人類產出的 14 動作 spritesheet 接入；資產位於各自 spritesheets/ 與 metadata/animations.json。
  // ──────────────────────────────────────────────────────────────────────
  {
    id: "flame-flicker",
    name: "焰紋狐",
    displayName: { zh: "焰紋狐", en: "Ember-vein Fox" },
    element: "fire",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "焰・燼紋", en: "Ember / Smolder Veins" },
    temperament: { zh: "熱切靈動", en: "Eager & Lively" },
    battleRole: { zh: "突擊者", en: "Attacker" },
    habitatAffinity: { zh: "餘燼石灘", en: "Ember Shoals" },
    soulTalkTone: "warm_blaze",
    evolutionLineId: "flame-flicker-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "ember-shoals",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 78, defense: 42, speed: 72, wisdom: 48, emotion: 60, healing: 30 },
    defaultMood: "calm",
    description: "暗毛上流著餘燼紋路的狐，胸口火核會隨你的情緒明滅；牠靠近得快，但從不灼傷你。",
    image: null,
    renderScale: 1.5,
    animationsManifest: "./assets/characters/flame-flicker/metadata/animations.json",
    placeholder: { bodyColor: 0x6a3320, accentColor: 0xff8a3c, emblemShape: "flame" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 14, fatigueSensitivity: 1.0 }
  },
  {
    id: "ice-talon",
    name: "冰晶狼",
    displayName: { zh: "冰晶狼", en: "Frostcrystal Wolf" },
    element: "ice",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "靜・霜心", en: "Stillness / Frost Heart" },
    temperament: { zh: "冷靜守界", en: "Calm & Guarded" },
    battleRole: { zh: "守望者", en: "Guardian" },
    habitatAffinity: { zh: "冰晶峽湖", en: "Glacial Lake" },
    soulTalkTone: "quiet_observer",
    evolutionLineId: "ice-talon-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "glacial-lake",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 58, defense: 78, speed: 50, wisdom: 62, emotion: 55, healing: 45 },
    defaultMood: "calm",
    description: "鬃毛與尾凝著冰晶的狼，沉默地替你劃出安全的距離；牠的冷靜不是疏遠，是守界。",
    image: null,
    renderScale: 1.5,
    animationsManifest: "./assets/characters/ice-talon/metadata/animations.json",
    placeholder: { bodyColor: 0x9fc6e8, accentColor: 0x6fb8ff, emblemShape: "droplet" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 28, fatigueSensitivity: 1.2 }
  },
  {
    id: "stone-shard",
    name: "磐石熊",
    displayName: { zh: "磐石熊", en: "Bedrock Bear" },
    element: "earth",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "穩・磐紋", en: "Steadiness / Bedrock Sigil" },
    temperament: { zh: "沉穩可靠", en: "Steady & Dependable" },
    battleRole: { zh: "壁壘", en: "Bulwark" },
    habitatAffinity: { zh: "苔原巨岩", en: "Mossrock Tundra" },
    soulTalkTone: "steady_grove",
    evolutionLineId: "stone-shard-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "mossrock-tundra",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 70, defense: 88, speed: 28, wisdom: 55, emotion: 50, healing: 55 },
    defaultMood: "calm",
    description: "披著苔蘚與岩甲的熊，胸前金色法陣穩穩亮著；牠不急著回應，但會替你擋住風。",
    image: null,
    renderScale: 1.5,
    animationsManifest: "./assets/characters/stone-shard/metadata/animations.json",
    placeholder: { bodyColor: 0x7d8470, accentColor: 0xd8c27a, emblemShape: "leaf" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 34, fatigueSensitivity: 1.3 }
  },
  {
    id: "vine-twist",
    name: "青藤鹿",
    displayName: { zh: "青藤鹿", en: "Vine Stag" },
    element: "wood",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "和・藤環", en: "Harmony / Verdant Ring" },
    temperament: { zh: "溫和悠然", en: "Gentle & Serene" },
    battleRole: { zh: "療癒者", en: "Healer" },
    habitatAffinity: { zh: "藤蔓林徑", en: "Vine Grove Trail" },
    soulTalkTone: "steady_grove",
    evolutionLineId: "vine-twist-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "vine-grove",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 45, defense: 58, speed: 48, wisdom: 68, emotion: 66, healing: 85 },
    defaultMood: "calm",
    description: "鹿角纏著藤蔓與嫩葉的雄鹿，靠近時像有雨後森林的氣息；牠的療癒來自願意陪你慢下來。",
    image: null,
    renderScale: 1.5,
    animationsManifest: "./assets/characters/vine-twist/metadata/animations.json",
    placeholder: { bodyColor: 0x6e7a3c, accentColor: 0x9fe39a, emblemShape: "leaf" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 20, fatigueSensitivity: 1.1 }
  },
  {
    id: "crystal-rabbit",
    name: "晶石兔",
    displayName: { zh: "晶石兔", en: "Crystal Rabbit" },
    element: "crystal",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "澄・晶核", en: "Clarity / Clear Core" },
    temperament: { zh: "敏感警覺", en: "Sensitive & Alert" },
    battleRole: { zh: "感應者", en: "Sensor" },
    habitatAffinity: { zh: "晶簇洞穴", en: "Crystal Hollow" },
    soulTalkTone: "bright_spark",
    evolutionLineId: "crystal-rabbit-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "crystal-hollow",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 40, defense: 50, speed: 70, wisdom: 72, emotion: 74, healing: 58 },
    defaultMood: "calm",
    // 註：runtime 動畫資產暫存於 thunder-pup/ 資料夾（與雷霆幼狼共用目錄，僅命名債、不影響載入）。
    description: "苔石身軀裡藏著澄藍晶核的兔，耳朵會先你一步察覺情緒的變化；牠敏感，但選擇留下來。",
    image: null,
    renderScale: 1.5,
    animationsManifest: "./assets/characters/thunder-pup/metadata/animations.json",
    placeholder: { bodyColor: 0x8a9486, accentColor: 0x7fd8ff, emblemShape: "droplet" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 18, fatigueSensitivity: 1.1 }
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
  thunder: { zh: "雷", en: "Thunder" },
  star: { zh: "星", en: "Star" },
  ice: { zh: "冰", en: "Ice" },
  earth: { zh: "土", en: "Earth" },
  crystal: { zh: "晶", en: "Crystal" }
};

export const RUNTIME_STATUS_LABELS = {
  "full-runtime": "動畫就緒",
  "static-image": "靜態立繪",
  placeholder: "輪廓佔位"
};

export const COMPANION_ASSET_READINESS_LABELS = {
  "runtime-ready": "Runtime ready",
  "static-ready": "Static runtime ready",
  "qc-pending": "QC pending",
  "spec-pending": "Spec pending"
};
