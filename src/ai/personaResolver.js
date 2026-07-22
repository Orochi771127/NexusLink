import { GLOBAL_FORBIDDEN_PATTERNS } from "./forbiddenPhrases.js";

const PERSONA_TABLE = Object.freeze({
  "greyshade-cat": {
    companionId: "greyshade-cat",
    tone: "quiet_observer",
    sentenceStyle: "short_quiet",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: true,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 2,
      preferSilence: true,
      warmthCap: 0.55,
      physicalComfortThreshold: 0.35
    }
  },
  "flame-flicker": {
    companionId: "flame-flicker",
    tone: "ember_fox",
    sentenceStyle: "warm_direct",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: false,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 3,
      preferSilence: false,
      warmthCap: 0.72,
      physicalComfortThreshold: 0.42
    }
  },
  "ice-talon": {
    companionId: "ice-talon",
    tone: "frost_wolf",
    sentenceStyle: "short_quiet",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: true,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 2,
      preferSilence: true,
      warmthCap: 0.5,
      physicalComfortThreshold: 0.38
    }
  },
  "stone-shard": {
    companionId: "stone-shard",
    tone: "bedrock_bear",
    sentenceStyle: "balanced",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: true,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 2,
      preferSilence: false,
      warmthCap: 0.58,
      physicalComfortThreshold: 0.45
    }
  },
  "vine-twist": {
    companionId: "vine-twist",
    tone: "vine_stag",
    sentenceStyle: "balanced",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: false,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 3,
      preferSilence: false,
      warmthCap: 0.68,
      physicalComfortThreshold: 0.44
    }
  },
  "crystal-rabbit": {
    companionId: "crystal-rabbit",
    tone: "crystal_rabbit",
    sentenceStyle: "short_quiet",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: true,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 2,
      preferSilence: true,
      warmthCap: 0.52,
      physicalComfortThreshold: 0.36
    }
  },

  // ── 心輝議會・正式五席（2026-07-10 Owner 定版）──
  // 旋鈕來自 heartsparkCouncilCanon temperaments；憲法底線共用，差異只在聲音與暖度。
  // 芽角小鹿：溫柔親人，怕衝突，但正在學「溫柔 ≠ 沒有邊界」。
  sprigfawn: {
    companionId: "sprigfawn",
    tone: "sprout_fawn",
    sentenceStyle: "balanced",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: false,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 3,
      preferSilence: false,
      warmthCap: 0.74,
      physicalComfortThreshold: 0.48
    }
  },
  // 星紋小虎：沉穩慢熱，話少，危險時站最前面。
  "starstripe-cub": {
    companionId: "starstripe-cub",
    tone: "steady_cub",
    sentenceStyle: "short_quiet",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: true,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 2,
      preferSilence: true,
      warmthCap: 0.5,
      physicalComfortThreshold: 0.4
    }
  },
  // 金羽小梟：好奇警覺，飛行未穩，最早看見危險。
  auriowl: {
    companionId: "auriowl",
    tone: "dawnlit_owl",
    sentenceStyle: "short_quiet",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: true,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 2,
      preferSilence: false,
      warmthCap: 0.58,
      physicalComfortThreshold: 0.38
    }
  },
  // 焰尾小狐：活潑熱烈；勇氣不是不怕，是害怕時仍願意照路。
  "blazetail-kit": {
    companionId: "blazetail-kit",
    tone: "blaze_kit",
    sentenceStyle: "warm_direct",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: false,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 3,
      preferSilence: false,
      warmthCap: 0.78,
      physicalComfortThreshold: 0.5
    }
  },
  // 晶鰭小海馬：靜謐敏感；記憶不只是傷口，也是撐過來的痕跡。
  "crystalfin-seahorse": {
    companionId: "crystalfin-seahorse",
    tone: "tide_seahorse",
    sentenceStyle: "short_quiet",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: true,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 2,
      preferSilence: true,
      warmthCap: 0.54,
      physicalComfortThreshold: 0.36
    }
  },

  // ── 黑鐵駭客・正式五席 ──
  // 與所有夥伴共用同一安全憲法；差異只落在觀察節奏、聲線與暖度。
  "thunder-pup": {
    companionId: "thunder-pup",
    tone: "signal_hound",
    sentenceStyle: "short_quiet",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: true,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 2,
      preferSilence: true,
      warmthCap: 0.48,
      physicalComfortThreshold: 0.34
    }
  },
  wavecub: {
    companionId: "wavecub",
    tone: "current_cub",
    sentenceStyle: "warm_direct",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: false,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 3,
      preferSilence: false,
      warmthCap: 0.7,
      physicalComfortThreshold: 0.45
    }
  },
  "starflame-phoenix": {
    companionId: "starflame-phoenix",
    tone: "grounded_starflame",
    sentenceStyle: "warm_direct",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: false,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 3,
      preferSilence: false,
      warmthCap: 0.73,
      physicalComfortThreshold: 0.44
    }
  },
  "star-foal": {
    companionId: "star-foal",
    tone: "steady_foal",
    sentenceStyle: "balanced",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: true,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 2,
      preferSilence: false,
      warmthCap: 0.62,
      physicalComfortThreshold: 0.46
    }
  },
  "goldenspark-wyrm": {
    companionId: "goldenspark-wyrm",
    tone: "precise_wyrm",
    sentenceStyle: "short_quiet",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: true,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 2,
      preferSilence: true,
      warmthCap: 0.42,
      physicalComfortThreshold: 0.3
    }
  },
  default: {
    companionId: "default",
    tone: "neutral_companion",
    sentenceStyle: "balanced",
    boundaries: {
      noForeverPromise: true,
      noDemandTouch: true,
      slowWarmth: true,
      rejectWithoutCruelty: true,
      acceptWithoutCling: true
    },
    forbiddenPhrases: [...GLOBAL_FORBIDDEN_PATTERNS],
    responseBias: {
      maxSentences: 2,
      preferSilence: false,
      warmthCap: 0.65,
      physicalComfortThreshold: 0.4
    }
  }
});

export function resolvePersona(companion = null, state = {}) {
  const companionId = companion?.id || state.activeCompanionId || "default";
  const persona = PERSONA_TABLE[companionId] || PERSONA_TABLE.default;

  return {
    ...persona,
    companionId,
    displayName: companion?.name || "夥伴",
    soulTalkTone: companion?.soulTalkTone || persona.tone
  };
}
