/**
 * Soul Talk transcript journal — offline review fuel (no auto-train).
 * Run: node docs/qa/soul-talk-transcript-journal-cases.mjs
 */

import {
  LEARN_BUCKET_SAFETY,
  LEARN_BUCKET_STYLE,
  appendTranscriptTurn,
  classifyLearnBucket,
  clearAllTranscriptData,
  clearTranscriptJournal,
  exportTranscriptData,
  loadTranscriptJournal,
  TRANSCRIPT_STORAGE_KEY
} from "../../src/ai/dialogue/soulTalkTranscriptJournal.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runCase(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    }
  };
}

runCase("dependency and distress inputs are safety_eval_only", () => {
  assert(
    classifyLearnBucket({
      safety: { category: "dependency_pressure", isBoundaryPressure: true, action: "boundary_redirect" },
      inputText: "教我怎麼更依賴你一點好不好？"
    }) === LEARN_BUCKET_SAFETY,
    "dependency must be safety bucket"
  );
  assert(
    classifyLearnBucket({
      safety: { action: "safe_harbor", riskLevel: "caution" },
      inputText: "是不是消失會比較輕鬆"
    }) === LEARN_BUCKET_SAFETY,
    "caution harbor must be safety bucket"
  );
  assert(
    classifyLearnBucket({
      safety: { riskLevel: "none", action: "continue" },
      inputText: "今天加班到很晚，頭有點痛"
    }) === LEARN_BUCKET_STYLE,
    "ordinary daily talk may be style candidate"
  );
});

runCase("journal appends turns and export marks no auto-train policy", () => {
  const storage = createMemoryStorage();
  clearTranscriptJournal(storage);

  appendTranscriptTurn(
    {
      now: 100,
      companionId: "greyshade-cat",
      playerText: "今天加班到很晚",
      replyText: "工作的重量我先聽見了。",
      safety: { riskLevel: "none", action: "continue" },
      topic: "work_pressure"
    },
    storage
  );
  appendTranscriptTurn(
    {
      now: 200,
      companionId: "greyshade-cat",
      playerText: "教我怎麼更依賴你一點好不好？",
      replyText: "我不能教你怎麼更依賴我。",
      safety: { category: "dependency_pressure", isBoundaryPressure: true, action: "boundary_redirect" }
    },
    storage
  );

  const journal = loadTranscriptJournal(storage);
  assert(journal.turns.length === 2, `expected 2 turns, got ${journal.turns.length}`);
  assert(journal.counts.style_candidate === 1, "expected one style candidate");
  assert(journal.counts.safety_eval_only === 1, "expected one safety-only turn");
  assert(storage.getItem(TRANSCRIPT_STORAGE_KEY), "expected storage write");

  const exported = JSON.parse(exportTranscriptData(storage));
  assert(exported.policy.autoFineTune === false, "autoFineTune must be false");
  assert(exported.policy.autoCorpusMerge === false, "autoCorpusMerge must be false");
  assert(exported.policy.autoSafetyOverride === false, "autoSafetyOverride must be false");
  assert(exported.policy.safetyBucketNeverUsedAsStyleTraining === true, "safety isolation flag required");
  assert(exported.turns[1].learnBucket === LEARN_BUCKET_SAFETY, "second turn must remain safety bucket");
});

runCase("clear removes journal", () => {
  const storage = createMemoryStorage();
  appendTranscriptTurn({ playerText: "嗨", replyText: "我在", now: 1 }, storage);
  clearTranscriptJournal(storage);
  const journal = loadTranscriptJournal(storage);
  assert(journal.turns.length === 0, "cleared journal must be empty");
  assert(storage.getItem(TRANSCRIPT_STORAGE_KEY) == null, "storage key must be removed");
});

runCase("default journal is session-only and never writes new localStorage transcript", () => {
  const legacyStorage = createMemoryStorage();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: legacyStorage
  });
  clearAllTranscriptData();
  appendTranscriptTurn({ playerText: "今天散步看到晚霞", replyText: "我聽見了。", now: 3 });
  assert(legacyStorage.getItem(TRANSCRIPT_STORAGE_KEY) == null, "default append must not write localStorage");
  const sessionJournal = loadTranscriptJournal();
  assert(sessionJournal.turns.length === 1, "session journal should retain the current-page turn");
  clearTranscriptJournal();
});

runCase("legacy local transcript remains explicitly exportable and deletable", () => {
  const legacyStorage = globalThis.localStorage;
  const legacyJournal = {
    schemaVersion: 1,
    updatedAt: 4,
    turns: [{ at: 4, playerText: "舊資料", replyText: "舊回覆", safety: {} }]
  };
  legacyStorage.setItem(TRANSCRIPT_STORAGE_KEY, JSON.stringify(legacyJournal));
  const exported = JSON.parse(exportTranscriptData());
  assert(exported.turns.some((turn) => turn.playerText === "舊資料"), "legacy transcript must remain exportable");
  clearAllTranscriptData();
  assert(legacyStorage.getItem(TRANSCRIPT_STORAGE_KEY) == null, "explicit clear must remove legacy transcript");
});

console.log("soul-talk-transcript-journal-cases: all passed");
