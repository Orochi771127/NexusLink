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
check("preference key removed only after success", !values.has(LEGACY_PREFS));
check("audio key removed only after success", !values.has(LEGACY_AUDIO));

const failed = checks.filter((item) => !item.pass);
console.log(JSON.stringify({ total: checks.length, failed: failed.length, checks }, null, 2));
if (failed.length) process.exitCode = 1;

function check(name, pass) {
  checks.push({ name, pass: Boolean(pass) });
}
