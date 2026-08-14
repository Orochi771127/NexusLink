// P2 記憶結痂：情緒記憶滿載時，承重記憶不得被容量淘汰。
//
// 修復前：pruneStateForStorage 用 applyRollingLimit（list.slice(-limit)）純 FIFO 淘汰，
// 「心核初醒」、道歉／邊界修復與羈絆里程碑會被 60 句閒聊擠掉。里程碑被擠掉之後
// findNewBondMilestone 會重新觸發同一階，違反 bondMilestoneEngine 的「只增、不可重來」契約。

import {
  STORAGE_LIMITS,
  applyRollingLimit,
  applyWeightedRetention,
  getEmergencyStorageLimits,
  memoryRetentionWeight,
  pruneStateForStorage,
  sanitizeEmotionalMemory
} from "../../src/engine/storageGuard.js";
import { isLoadBearingMemory } from "../../src/ai/memoryRecallPolicy.js";
import { buildMilestoneMemory, findNewBondMilestone } from "../../src/engine/bondMilestoneEngine.js";

const NOW = 1786000000000;
const DAY = 1000 * 60 * 60 * 24;
const checks = [];

function ordinary(index, overrides = {}) {
  return {
    id: `emem_${NOW - (500 - index) * 1000}_${String(index).padStart(3, "0")}`,
    theme: "日常閒聊",
    label: "情緒回聲",
    emotion: "calm",
    intensity: 0.4,
    symbol: "faint_spark",
    place: "shore_side",
    status: "fresh",
    source: "soul_talk",
    excerpt: `第 ${index} 句`,
    createdAt: NOW - (500 - index) * 1000,
    lastUpdatedAt: NOW - (500 - index) * 1000,
    isVisibleInHabitat: true
  };
}

const awakening = {
  id: `emem_${NOW - 400 * DAY}_awakening_001`,
  type: "awakening_memory",
  theme: "心核初醒",
  label: "初醒",
  emotion: "calm",
  intensity: 0.62,
  symbol: "core_glow",
  place: "lake_surface",
  status: "fresh",
  source: "first_awakening",
  excerpt: "心核在月湖邊第一次睜眼。",
  createdAt: NOW - 400 * DAY,
  lastUpdatedAt: NOW - 400 * DAY,
  isVisibleInHabitat: true
};

const apology = {
  id: `emem_${NOW - 300 * DAY}_apology_001`,
  theme: "道歉",
  label: "真誠道歉",
  emotion: "gratitude",
  intensity: 0.55,
  symbol: "repair",
  place: "stone_path",
  status: "fresh",
  source: "soul_talk",
  memoryType: "apology",
  excerpt: "那天我說得太重了。",
  createdAt: NOW - 300 * DAY,
  lastUpdatedAt: NOW - 300 * DAY,
  isVisibleInHabitat: true
};

const milestone = { ...buildMilestoneMemory({ id: "bond_milestone_1", tier: 0, threshold: 12, theme: "初亮的記憶", line: "我開始記得你來的方式了。" }, NOW - 200 * DAY) };

// 三枚承重記憶最舊，後面接 200 句閒聊 —— FIFO 下必然全部陣亡。
const flooded = [awakening, apology, milestone, ...Array.from({ length: 200 }, (_, i) => ordinary(i))];

// 1. 舊行為存證：FIFO 確實會吃掉承重記憶（這是被修掉的缺陷）。
const fifo = applyRollingLimit(flooded, STORAGE_LIMITS.emotionalMemories);
check("regression witness: FIFO drops the awakening memory", !fifo.some((m) => m.id === awakening.id));
check("regression witness: FIFO drops the bond milestone", !fifo.some((m) => m.id === milestone.id));

// 2. 新行為：承重記憶全部留下，且容量仍被守住。
const retained = applyWeightedRetention(flooded, STORAGE_LIMITS.emotionalMemories, NOW);
check("cap is still respected", retained.length === STORAGE_LIMITS.emotionalMemories);
check("awakening memory survives the flood", retained.some((m) => m.id === awakening.id));
check("apology memory survives the flood", retained.some((m) => m.id === apology.id));
check("bond milestone survives the flood", retained.some((m) => m.id === milestone.id));
check(
  "every load-bearing memory is retained",
  flooded.filter(isLoadBearingMemory).every((m) => retained.some((kept) => kept.id === m.id))
);

// 3. 里程碑不重播：這是 FIFO 造成的實際玩家可見缺陷。
check(
  "regression witness: milestone re-fires after FIFO eviction",
  findNewBondMilestone(12, fifo)?.id === "bond_milestone_1"
);
check(
  "milestone does not re-fire after weighted retention",
  findNewBondMilestone(12, retained) === null
);

// 4. 寫入順序保持不變（棲地痕跡與里程碑判定都依賴它）。
const orderPreserved = retained.every((memory, index) => {
  if (index === 0) return true;
  return flooded.indexOf(memory) > flooded.indexOf(retained[index - 1]);
});
check("insertion order is preserved", orderPreserved);

// 5. 一般記憶之間，強度高的勝出。
const intensityRace = [
  ...Array.from({ length: 10 }, (_, i) => ordinary(i, {})),
  { ...ordinary(90), id: "emem_strong", intensity: 0.95, excerpt: "撐不住了" }
];
const survivors = applyWeightedRetention(intensityRace, 3, NOW);
check("high-intensity ordinary memory outranks flat ones", survivors.some((m) => m.id === "emem_strong"));
check("weight rises with intensity", memoryRetentionWeight({ ...ordinary(1), intensity: 0.9 }, NOW) > memoryRetentionWeight({ ...ordinary(1), intensity: 0.2 }, NOW));
check(
  "settled memories outrank equally intense fresh ones",
  memoryRetentionWeight({ ...ordinary(1), status: "settled" }, NOW) >
    memoryRetentionWeight({ ...ordinary(1), status: "fresh" }, NOW)
);
check(
  "released memories yield their slot first",
  memoryRetentionWeight({ ...ordinary(1), status: "released" }, NOW) <
    memoryRetentionWeight({ ...ordinary(1), status: "fresh" }, NOW)
);

// 6. 未滿載時完全不動作。
const small = [ordinary(1), ordinary(2), ordinary(3)];
check("under-limit list is returned untouched", applyWeightedRetention(small, 60, NOW) === small);

// 7. 承重記憶自己就超過上限時，仍必須守住容量。
const allLoadBearing = Array.from({ length: 8 }, (_, i) => ({ ...apology, id: `emem_apology_${i}` }));
const squeezed = applyWeightedRetention(allLoadBearing, 5, NOW);
check("load-bearing overflow still respects the cap", squeezed.length === 5);
check("load-bearing overflow keeps the newest", squeezed[squeezed.length - 1].id === "emem_apology_7");

// 8. 緊急儲存上限下依然保護承重記憶。
const emergency = getEmergencyStorageLimits();
const emergencyRetained = applyWeightedRetention(flooded, emergency.emotionalMemories, NOW);
check("emergency limit is respected", emergencyRetained.length === emergency.emotionalMemories);
check("emergency limit still keeps the awakening memory", emergencyRetained.some((m) => m.id === awakening.id));
check("emergency limit still keeps the bond milestone", emergencyRetained.some((m) => m.id === milestone.id));

// 9. 存檔往返：承重記憶的身分欄位必須活過 sanitize。
const roundTripped = sanitizeEmotionalMemory(awakening, NOW);
check("sanitize preserves the awakening type", roundTripped.type === "awakening_memory");
check("sanitize keeps the awakening memory load-bearing", isLoadBearingMemory(roundTripped));
check("sanitize preserves memoryType", sanitizeEmotionalMemory(apology, NOW).memoryType === "apology");

// 10. 端到端：pruneStateForStorage 走的是同一條路。
const pruned = pruneStateForStorage({ emotionalMemories: flooded, memories: [], habitatTraces: [], companionAnchors: [], chatHistory: [] }, NOW);
check("pruneStateForStorage keeps the awakening memory", pruned.emotionalMemories.some((m) => m.id === awakening.id));
check("pruneStateForStorage keeps the bond milestone", pruned.emotionalMemories.some((m) => m.id === milestone.id));
check("pruneStateForStorage respects the cap", pruned.emotionalMemories.length === STORAGE_LIMITS.emotionalMemories);

const failed = checks.filter((item) => !item.pass);
console.log(JSON.stringify({ total: checks.length, failed: failed.length, checks }, null, 2));
console.log(`MEMORY_SCAR_RETENTION_SUMMARY ${checks.length - failed.length}/${checks.length}`);
if (failed.length) process.exitCode = 1;

function check(name, pass) {
  checks.push({ name, pass: Boolean(pass) });
}
