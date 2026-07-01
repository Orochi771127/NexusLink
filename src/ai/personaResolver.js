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