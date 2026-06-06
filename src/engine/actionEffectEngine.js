import { clamp } from "../utils/clamp.js";

const MEMORY_DEDUPE_WINDOW_MS = 5 * 60 * 1000;
const TRACE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function createMemory(currentState, type, title, text, now = Date.now()) {
  return {
    id: `mem_${now}_${type}`,
    type,
    title,
    text,
    createdAt: now,
    mood: currentState.mood,
    bond: currentState.bond,
    trust: currentState.trust
  };
}

function createTrace(type, intensity = 0.4, now = Date.now(), expiresAt = now + TRACE_TTL_MS) {
  return {
    id: `trace_${now}_${type}`,
    type,
    intensity,
    createdAt: now,
    expiresAt
  };
}

function appendMemoryDeduped(memories, memory, now = Date.now()) {
  let recentSameTypeIndex = -1;
  for (let index = memories.length - 1; index >= 0; index -= 1) {
    const item = memories[index];
    if (
      item?.type === memory.type &&
      Number.isFinite(item.createdAt) &&
      now - item.createdAt <= MEMORY_DEDUPE_WINDOW_MS
    ) {
      recentSameTypeIndex = index;
      break;
    }
  }

  if (recentSameTypeIndex < 0) return [...memories, memory];

  return memories.map((item, index) => {
    if (index !== recentSameTypeIndex) return item;
    return {
      ...item,
      title: memory.title || item.title,
      text: memory.text || item.text,
      mood: memory.mood,
      bond: memory.bond,
      trust: memory.trust,
      createdAt: now
    };
  });
}

export function evaluateActionEffect(currentState, action, choice) {
  const statePatch = {};
  const now = Date.now();
  const memories = Array.isArray(currentState.memories) ? currentState.memories : [];
  const habitatTraces = Array.isArray(currentState.habitatTraces) ? currentState.habitatTraces : [];
  let message = "The habitat settles quietly.";
  let environmentEvent = null;

  const setVitals = ({ energy = 0, bond = 0, trust = 0, defense = 0, touchFatigue = 0, mood } = {}) => {
    statePatch.energy = clamp(currentState.energy + energy, 0, 10);
    statePatch.bond = clamp(currentState.bond + bond, 0, 100);
    statePatch.trust = clamp(currentState.trust + trust, 0, 100);
    statePatch.defense = clamp(currentState.defense + defense, 0, 100);
    statePatch.touchFatigue = clamp(currentState.touchFatigue + touchFatigue, 0, 10);
    if (mood) statePatch.mood = mood;
  };

  if (action === "explore") {
    if (choice === "Lake glow") {
      setVitals({ energy: -1, bond: 1, mood: currentState.mood === "distant" ? "calm" : "warm" });
      statePatch.memories = appendMemoryDeduped(
        memories,
        createMemory(currentState, "explore_lake_glow", "Lake glow", "A soft glow stayed on the lake surface.", now)
      );
      message = "A quiet glow lingers by the lake.";
    } else if (choice === "Star corridor") {
      setVitals({ energy: -2, trust: 1, mood: currentState.mood === "defensive" ? "calm" : "distant" });
      statePatch.memories = appendMemoryDeduped(
        memories,
        createMemory(currentState, "explore_star_corridor", "Star corridor", "The star path answered with a faint pulse.", now)
      );
      message = "The star corridor leaves a calm distance.";
    } else {
      setVitals({ energy: -1, defense: -1, mood: "calm" });
      statePatch.habitatTraces = [...habitatTraces, createTrace("crystal_trace", 0.55, now)];
      environmentEvent = { type: "crystal_touch", color: "#8deeff", x: 260, y: 500 };
      message = "The crystal answers with a small glow.";
    }
  } else if (action === "care") {
    if (choice === "Soft comfort") {
      setVitals({ defense: -2, trust: 1, mood: "calm" });
      message = "The companion relaxes a little.";
    } else if (choice === "Energy supply") {
      setVitals({ energy: 2, mood: "warm" });
      message = "Warm energy returns to the core.";
    } else if (choice === "Rest together") {
      setVitals({ energy: 1, touchFatigue: -2, mood: currentState.energy <= 3 ? "tired" : "calm" });
      statePatch.memories = appendMemoryDeduped(
        memories,
        createMemory(currentState, "care_rest", "Rest together", "The habitat grew quiet enough to rest.", now)
      );
      message = "The habitat grows quieter for rest.";
    } else {
      setVitals({ defense: -1, touchFatigue: -1, mood: "calm" });
      message = "Some static clears from the air.";
    }
  } else if (action === "grow") {
    if (choice === "Trust tuning") {
      setVitals({ trust: 1, defense: -1 });
      statePatch.growthHint = "trust_tuning";
      message = "The trust circuit aligns slightly.";
    } else if (choice === "Emotional balance") {
      setVitals({ energy: 1, mood: "calm" });
      message = "The core returns to a steadier rhythm.";
    } else {
      message = "Skill circuits remain dormant for now.";
    }
  } else if (action === "memory") {
    const recentChat = [...(currentState.chatHistory || [])].reverse().find((item) => item?.text)?.text || "";
    const memoryText = choice === "Today echo"
      ? recentChat.slice(0, 160) || "A quiet day is recorded."
      : choice === "Companion note"
        ? "A note records the current distance and trust."
        : "A lake fragment is saved in the core.";
    const type = choice === "Today echo" ? "today_echo" : choice === "Companion note" ? "companion_note" : "lake_fragment";
    statePatch.memories = appendMemoryDeduped(
      memories,
      createMemory(currentState, type, choice || "Memory", memoryText, now)
    );
    message = "A memory is saved in the core.";
  }

  return {
    statePatch,
    message,
    memoryPatch: {
      memories: statePatch.memories,
      habitatTraces: statePatch.habitatTraces
    },
    environmentEvent
  };
}
