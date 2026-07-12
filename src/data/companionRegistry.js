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
    image: "./assets/characters/greyshade-cat/portrait/greyshade-cat_portrait_512x512.png",
    renderScale: 1.2,
    animationsManifest: "./assets/characters/greyshade-cat/metadata/animations.json",
    placeholder: { bodyColor: 0x5f6876, accentColor: 0x8a93a3, emblemShape: "moon" },
    personality: GREYSHADE_PERSONALITY
  },

  // ──────────────────────────────────────────────────────────────────────
  // 心輝議會・runtime 測試載體（512×512 動畫陣容）
  // 由人類產出的 14 動作 spritesheet 接入；資產位於各自 spritesheets/ 與 metadata/animations.json。
  // 2026-07-10 Owner 定版後不占正式心輝議會五行席位（CLAUDE.md §7），最終用途待另案；
  // veteran 存檔已解鎖者照舊可用，初遇三選一（焰紋狐/冰晶狼）不受影響。
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
    image: "./assets/characters/flame-flicker/portrait/flame-flicker_portrait_512x512.png",
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
    image: "./assets/characters/ice-talon/portrait/ice-talon_portrait_512x512.png",
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
    image: "./assets/characters/stone-shard/portrait/stone-shard_portrait_512x512.png",
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
    image: "./assets/characters/vine-twist/portrait/vine-twist_portrait_512x512.png",
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
    image: "./assets/characters/crystal-rabbit/portrait/crystal-rabbit_portrait_512x512.png",
    renderScale: 1.2,
    animationProfile: "guardian",
    animationsManifest: "./assets/characters/crystal-rabbit/metadata/animations.json",
    placeholder: { bodyColor: 0x8a9486, accentColor: 0x7fd8ff, emblemShape: "droplet" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 18, fatigueSensitivity: 1.1 }
  },

  // ──────────────────────────────────────────────────────────────────────
  // 心輝議會・正式五元守護 Stage 1（2026-07-10 Owner 定版，canon 見 heartsparkCouncilCanon.js）
  // 資產：Owner 2026-07-11 視覺核可的 29 動作 512×512 catalog（GROUNDWORK 升級入庫）。
  // 動畫詞彙與灰影貓完全同構（含走路幀），故**不設 animationProfile**（走預設 profile）；
  // manifest 內 faint 圖以 runtime 詞彙 `defeated` 為 key（見灰影貓替換協定）。
  // 章節對應見 chapterRegistry（設計文件 §4）；解鎖入口為 CH-5b 章節相遇（尚未實裝）。
  // 演化線（canon 三階名已定）與 soulTalkTone 語料為後續內容包，缺席時皆有安全 fallback。
  // ──────────────────────────────────────────────────────────────────────
  {
    id: "sprigfawn",
    name: "芽角小鹿",
    displayName: { zh: "芽角小鹿", en: "Sprigfawn" },
    element: "wood",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "生長・寬恕", en: "Growth / Forgiveness" },
    temperament: { zh: "溫柔親人", en: "Gentle & Affectionate" },
    battleRole: { zh: "療癒者", en: "Healer" },
    habitatAffinity: { zh: "青葉聖林", en: "Verdant Sanctum Grove" },
    soulTalkTone: "sprout_fawn",
    evolutionLineId: "sprigfawn-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "plains",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 30, defense: 50, speed: 50, wisdom: 70, emotion: 80, healing: 90 },
    defaultMood: "calm",
    description: "屬木。角上還只是兩枝芽枝的小鹿，靠近受傷的心核時會長出新葉；牠正在學：溫柔不等於沒有邊界。",
    image: "./assets/characters/sprigfawn/portrait/sprigfawn_portrait_512x512.png",
    renderScale: 1.2,
    animationsManifest: "./assets/characters/sprigfawn/metadata/animations.json",
    placeholder: { bodyColor: 0x7a8a5c, accentColor: 0xa8e88f, emblemShape: "leaf" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 16, fatigueSensitivity: 1.1 }
  },
  {
    id: "starstripe-cub",
    name: "星紋小虎",
    displayName: { zh: "星紋小虎", en: "Starstripe Cub" },
    element: "earth",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "邊界・安定", en: "Boundary / Stability" },
    temperament: { zh: "沉穩慢熱", en: "Steady & Reserved" },
    battleRole: { zh: "壁壘", en: "Bulwark" },
    habitatAffinity: { zh: "星地聖丘", en: "Stellar Earth Sanctum" },
    soulTalkTone: "steady_cub",
    evolutionLineId: "starstripe-cub-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "forge",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 60, defense: 80, speed: 40, wisdom: 50, emotion: 60, healing: 50 },
    defaultMood: "calm",
    description: "屬土。胸前星形心核會在地脈震動時發光的小虎，話不多，危險靠近時卻總站在最前面。",
    image: "./assets/characters/starstripe-cub/portrait/starstripe-cub_portrait_512x512.png",
    renderScale: 1.2,
    animationsManifest: "./assets/characters/starstripe-cub/metadata/animations.json",
    placeholder: { bodyColor: 0x7d6f5a, accentColor: 0xf0d98c, emblemShape: "star" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 30, fatigueSensitivity: 1.2 }
  },
  {
    id: "auriowl",
    name: "金羽小梟",
    displayName: { zh: "金羽小梟", en: "Auriowl" },
    element: "metal",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "判斷・守望", en: "Judgment / Vigilance" },
    temperament: { zh: "好奇警覺", en: "Curious & Alert" },
    battleRole: { zh: "偵察者", en: "Scout" },
    habitatAffinity: { zh: "晨光高枝", en: "Dawnlit Highbranch" },
    soulTalkTone: "dawnlit_owl",
    evolutionLineId: "auriowl-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "harbor",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 40, defense: 30, speed: 70, wisdom: 80, emotion: 60, healing: 30 },
    defaultMood: "calm",
    description: "屬金。飛行還不穩的金羽小梟，卻天生看得見情緒流裡的細小裂縫；最早看見危險，就是守護的開始。",
    image: "./assets/characters/auriowl/portrait/auriowl_portrait_512x512.png",
    renderScale: 1.2,
    animationsManifest: "./assets/characters/auriowl/metadata/animations.json",
    placeholder: { bodyColor: 0x8a7a4f, accentColor: 0xffd76a, emblemShape: "star" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 26, fatigueSensitivity: 1.2 }
  },
  {
    id: "blazetail-kit",
    name: "焰尾小狐",
    displayName: { zh: "焰尾小狐", en: "Blazetail Kit" },
    element: "fire",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "熱意・勇氣", en: "Passion / Courage" },
    temperament: { zh: "活潑熱烈", en: "Playful & Bright" },
    battleRole: { zh: "突擊者", en: "Attacker" },
    habitatAffinity: { zh: "星火林徑", en: "Starfire Woodland Path" },
    soulTalkTone: "blaze_kit",
    evolutionLineId: "blazetail-kit-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "core",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 70, defense: 30, speed: 80, wisdom: 50, emotion: 70, healing: 40 },
    defaultMood: "calm",
    description: "屬火。尾巴像不會熄滅的小火苗，夜路上總先一步亮起；勇氣不是不怕，是害怕時仍願意替人照路。",
    image: "./assets/characters/blazetail-kit/portrait/blazetail-kit_portrait_512x512.png",
    renderScale: 1.2,
    animationsManifest: "./assets/characters/blazetail-kit/metadata/animations.json",
    placeholder: { bodyColor: 0x8a4a2a, accentColor: 0xffa04d, emblemShape: "flame" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 14, fatigueSensitivity: 1.0 }
  },
  {
    id: "crystalfin-seahorse",
    name: "晶鰭小海馬",
    displayName: { zh: "晶鰭小海馬", en: "Crystalfin Seahorse" },
    element: "water",
    faction: { zh: "心輝議會", en: "Heartspark Council" },
    emotionalEmblem: { zh: "記憶・沉澱", en: "Memory / Stillness" },
    temperament: { zh: "靜謐敏感", en: "Quiet & Sensitive" },
    battleRole: { zh: "控場者", en: "Controller" },
    habitatAffinity: { zh: "月湖營地", en: "Moonlake Camp" },
    soulTalkTone: "tide_seahorse",
    evolutionLineId: "crystalfin-seahorse-line",
    tier: COMPANION_TIERS.ROADMAP,
    runtimeStatus: "full-runtime",
    runtimeEnabled: true,
    selectableWhenUnlocked: true,
    unlockChapter: "tidal",
    assetReadiness: COMPANION_ASSET_READINESS.RUNTIME_READY,
    radar: { power: 40, defense: 50, speed: 40, wisdom: 80, emotion: 70, healing: 80 },
    defaultMood: "calm",
    description: "屬水。水晶鰭會映出被遺忘記憶的小海馬，安靜地待在水面下；記憶不只是傷口，也是撐過來的痕跡。",
    image: "./assets/characters/crystalfin-seahorse/portrait/crystalfin-seahorse_portrait_512x512.png",
    renderScale: 1.2,
    animationsManifest: "./assets/characters/crystalfin-seahorse/metadata/animations.json",
    placeholder: { bodyColor: 0x5f7d96, accentColor: 0x8fd7ff, emblemShape: "droplet" },
    personality: { ...DEFAULT_TOUCH_PERSONALITY, baseDefense: 30, fatigueSensitivity: 1.3 }
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
