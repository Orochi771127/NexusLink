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


export const COMPANIONS = [
  {
    id: "greyshade-cat",
    name: "灰影貓",
    displayName: { zh: "灰影貓", en: "Greyshade Cat" },
    element: "neutral",
    faction: { zh: "中立／樞核", en: "Neutral / Nexus Core" },
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
    renderScale: 1.2,
    animationsManifest: "./assets/characters/greyshade-cat/metadata/animations.json",
    placeholder: { bodyColor: 0x5f6876, accentColor: 0x8a93a3, emblemShape: "moon" },
    personality: GREYSHADE_PERSONALITY
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
    soulTalkTone: "ember_fox",
    evolutionLineId: "flame-flicker-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "ember-shoals",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 78, defense: 42, speed: 72, wisdom: 48, emotion: 60, healing: 30 },
    defaultMood: "calm",
    description: "屬火。暗毛上流著餘燼紋路的狐，胸口火核會隨你的情緒明滅；牠靠近得快，卻從不灼傷你。",
    image: null,
    renderScale: 1.2,
    animationProfile: "guardian",
    animationsManifest: "./assets/characters/flame-flicker/metadata/animations.json",
    placeholder: { bodyColor: 0x6a3320, accentColor: 0xff8a3c, emblemShape: "flame" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 14, fatigueSensitivity: 1.0 }
  },
  {
    id: "ice-talon",
    name: "冰晶狼",
    displayName: { zh: "冰晶狼", en: "Frostcrystal Wolf" },
    element: "water",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "靜・霜心", en: "Stillness / Frost Heart" },
    temperament: { zh: "冷靜守界", en: "Calm & Guarded" },
    battleRole: { zh: "守望者", en: "Guardian" },
    habitatAffinity: { zh: "冰晶峽湖", en: "Glacial Lake" },
    soulTalkTone: "frost_wolf",
    evolutionLineId: "ice-talon-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "glacial-lake",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 58, defense: 78, speed: 50, wisdom: 62, emotion: 55, healing: 45 },
    defaultMood: "calm",
    description: "屬水。鬃毛與尾凝成冰晶的狼，沉默地替你劃出剛好的距離；水會結冰，也會在你需要時化開。",
    image: null,
    renderScale: 1.2,
    animationProfile: "guardian",
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
    soulTalkTone: "bedrock_bear",
    evolutionLineId: "stone-shard-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "mossrock-tundra",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 70, defense: 88, speed: 28, wisdom: 55, emotion: 50, healing: 55 },
    defaultMood: "calm",
    description: "屬土。披著苔蘚與岩甲的熊，胸前金色法陣穩穩亮著；牠不急著回應，但會替你把地基踩穩。",
    image: null,
    renderScale: 1.2,
    animationProfile: "guardian",
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
    soulTalkTone: "vine_stag",
    evolutionLineId: "vine-twist-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "vine-grove",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 45, defense: 58, speed: 48, wisdom: 68, emotion: 66, healing: 85 },
    defaultMood: "calm",
    description: "屬木。鹿角纏著藤蔓與嫩葉的雄鹿，靠近時像有雨後森林的氣息；牠的療癒，是願意陪你慢慢生長。",
    image: null,
    renderScale: 1.2,
    animationProfile: "guardian",
    animationsManifest: "./assets/characters/vine-twist/metadata/animations.json",
    placeholder: { bodyColor: 0x6e7a3c, accentColor: 0x9fe39a, emblemShape: "leaf" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 20, fatigueSensitivity: 1.1 }
  },
  {
    id: "crystal-rabbit",
    name: "晶石兔",
    displayName: { zh: "晶石兔", en: "Crystal Rabbit" },
    element: "metal",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "澄・晶核", en: "Clarity / Clear Core" },
    temperament: { zh: "敏感警覺", en: "Sensitive & Alert" },
    battleRole: { zh: "感應者", en: "Sensor" },
    habitatAffinity: { zh: "晶簇洞穴", en: "Crystal Hollow" },
    soulTalkTone: "crystal_rabbit",
    evolutionLineId: "crystal-rabbit-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "crystal-hollow",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 40, defense: 50, speed: 70, wisdom: 72, emotion: 74, healing: 58 },
    defaultMood: "calm",
    // runtime 動畫資產位於自身 assets/characters/crystal-rabbit/ 目錄（命名債已解，與雷霆幼狼資料夾分離）。
    description: "屬金。身軀藏著澄藍晶核的兔，耳朵會先你一步察覺情緒的變化；金石雖冷，牠卻選擇為你豎起耳朵。",
    image: null,
    renderScale: 1.2,
    animationProfile: "guardian",
    animationsManifest: "./assets/characters/crystal-rabbit/metadata/animations.json",
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
  earth: { zh: "土", en: "Earth" },
  metal: { zh: "金", en: "Metal" }
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
