import { readFileSync } from "node:fs";

const values = new Map();
let failWrites = false;

globalThis.localStorage = {
  getItem(key) {
    return values.has(key) ? values.get(key) : null;
  },
  setItem(key, value) {
    if (failWrites) {
      const error = new Error("synthetic write failure");
      error.name = "SyntheticStorageError";
      throw error;
    }
    values.set(key, String(value));
  },
  removeItem(key) {
    values.delete(key);
  }
};

const { loadState, saveState, STORAGE_KEY } = await import("../../src/state/saveManager.js");
const { pruneStateForCloudSync } = await import("../../src/engine/storageGuard.js");
const { sanitizeConversationDebugTraceForLog } = await import("../../src/ai/dialogue/conversationDebugTrace.js");

const LEGACY_PREFS = "nexusLinkCompanionPrefs:v1";
const LEGACY_AUDIO = "nexusLinkAudioMuted:v1";
const checks = [];

values.set(
  STORAGE_KEY,
  JSON.stringify({
    lastSeenAt: 1782600000000,
    activeCompanionId: "greyshade-cat",
    unlockedCompanionIds: ["greyshade-cat"],
    settings: { lang: "tc" }
  })
);
values.set(
  LEGACY_PREFS,
  JSON.stringify({
    version: 1,
    updatedAt: 1782600000001,
    companions: {
      "greyshade-cat": {
        replyLengthBias: "short",
        learnedSignals: ["rest_request"],
        lastSeenAt: 1782600000001,
        updatedAt: 1782600000001
      }
    }
  })
);
values.set(LEGACY_AUDIO, "true");

const loaded = loadState();
check("legacy preference merged into state", loaded.companionPreferences.companions["greyshade-cat"]?.replyLengthBias === "short");
check("legacy audio mute merged into settings", loaded.settings.audioMuted === true);
check("offline timestamp preserved during load", loaded.lastSeenAt === 1782600000000);
check("preference key retained before canonical write", values.has(LEGACY_PREFS));
check("audio key retained before canonical write", values.has(LEGACY_AUDIO));

loaded.chatHistory = [
  { role: "player", text: "這是不得持久化的玩家原句" },
  { role: "companion", text: "這是不得持久化的完整回覆" }
];
loaded.lastMessage = "這是不得持久化的玩家原句";
loaded.reactionPreview = "這是不得持久化的完整回覆";
loaded.memories = [{ id: "m1", text: "legacy raw memory text" }];
loaded.emotionalMemories = [{ id: "e1", theme: "日常", excerpt: "legacy raw excerpt" }];
loaded.companionAnchors = [{ id: "a1", kind: "preference", key: "tea", detail: "烏龍茶" }];
if (loaded.companionStates?.byId?.["greyshade-cat"]?.relationship) {
  loaded.companionStates.byId["greyshade-cat"].relationship.reactionPreview = "nested raw reply";
}

failWrites = true;
const failedSave = saveState(loaded);
check("failed canonical write reports failure", failedSave.ok === false);
check("preference key survives failed write", values.has(LEGACY_PREFS));
check("audio key survives failed write", values.has(LEGACY_AUDIO));

failWrites = false;
const successfulSave = saveState(loaded);
const canonical = JSON.parse(values.get(STORAGE_KEY));
check("canonical write succeeds", successfulSave.ok === true);
check("canonical save contains preferences", canonical.companionPreferences.companions["greyshade-cat"]?.replyLengthBias === "short");
check("canonical save contains audio mute", canonical.settings.audioMuted === true);
check("canonical save excludes raw chat history", !Object.prototype.hasOwnProperty.call(canonical, "chatHistory"));
check("canonical save excludes raw last message", !Object.prototype.hasOwnProperty.call(canonical, "lastMessage"));
check("canonical save excludes raw reaction preview", !Object.prototype.hasOwnProperty.call(canonical, "reactionPreview"));
check(
  "canonical save blanks nested companion reaction preview without breaking schema",
  canonical.companionStates?.byId?.["greyshade-cat"]?.relationship?.reactionPreview === ""
);
const cloudSafe = pruneStateForCloudSync(loaded, 1782600000100);
check("cloud sync excludes chat transcript fields", !Object.prototype.hasOwnProperty.call(cloudSafe, "chatHistory") && !Object.prototype.hasOwnProperty.call(cloudSafe, "lastMessage"));
check("cloud sync excludes conversation-derived memory bundles", !["memories", "habitatTraces", "emotionalMemories", "companionAnchors"].some((key) => Object.prototype.hasOwnProperty.call(cloudSafe, key)));
const cloudSyncSource = readFileSync(new URL("../../src/auth/cloudSync.js", import.meta.url), "utf8");
check(
  "cloud pull applies the cloud-safe projector before exposing legacy data",
  /data:\s*pruneStateForCloudSync\(data\.save_data\s*\|\|\s*\{\}\)/.test(cloudSyncSource)
);
const safeDebugLog = sanitizeConversationDebugTraceForLog({
  input: "raw player input",
  finalReply: "raw companion reply",
  prefill: { source: "session", usedPrefillDetail: "raw recalled detail", groundedByPrefill: true },
  quickReplies: [{ label: "raw authored label", intent: "quiet", actionType: "send", topic: "care" }]
});
check("debug log redacts raw input reply and recalled detail", safeDebugLog.input === "[redacted]" && safeDebugLog.finalReply === "[redacted]" && safeDebugLog.prefill.usedPrefillDetail === null);
check("debug log omits quick-reply labels", !Object.prototype.hasOwnProperty.call(safeDebugLog.quickReplies[0] || {}, "label"));
check("preference key removed only after success", !values.has(LEGACY_PREFS));
check("audio key removed only after success", !values.has(LEGACY_AUDIO));

const failed = checks.filter((item) => !item.pass);
console.log(JSON.stringify({ total: checks.length, failed: failed.length, checks }, null, 2));
if (failed.length) process.exitCode = 1;

function check(name, pass) {
  checks.push({ name, pass: Boolean(pass) });
}
