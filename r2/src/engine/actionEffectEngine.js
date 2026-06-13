import { clamp } from "../utils/clamp.js";

const MEMORY_DEDUPE_WINDOW_MS = 5 * 60 * 1000;
const TRACE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const ACTION_CHOICE_ALIASES = Object.freeze({
  "Lake glow": "lake_glow",
  "Star corridor": "star_corridor",
  "Silent crystal": "silent_crystal",
  "Soft comfort": "soft_comfort",
  "Energy supply": "energy_supply",
  "Rest together": "rest_together",
  "Clear static": "clear_static",
  "Trust tuning": "trust_tuning",
  "Emotional balance": "emotional_balance",
  "Skill circuit": "skill_circuit",
  "Lake fragment": "lake_fragment",
  "Today echo": "today_echo",
  "Companion note": "companion_note"
});

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
  const normalizedChoice = normalizeActionChoice(choice);
  const memories = Array.isArray(currentState.memories) ? currentState.memories : [];
  const habitatTraces = Array.isArray(currentState.habitatTraces) ? currentState.habitatTraces : [];
  let message = "棲地安靜地穩定下來。";
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
    if (normalizedChoice === "lake_glow") {
      setVitals({ energy: -1, bond: 1, mood: currentState.mood === "distant" ? "calm" : "warm" });
      statePatch.memories = appendMemoryDeduped(
        memories,
        createMemory(currentState, "explore_lake_glow", "湖畔微光", "湖面留下了一圈柔和微光。", now)
      );
      message = "湖畔留下了一圈柔和微光。";
    } else if (normalizedChoice === "star_corridor") {
      setVitals({ energy: -2, trust: 1, mood: currentState.mood === "defensive" ? "calm" : "distant" });
      statePatch.memories = appendMemoryDeduped(
        memories,
        createMemory(currentState, "explore_star_corridor", "星圖回廊", "星圖回廊回應了一道安靜脈動。", now)
      );
      message = "星圖回廊留下安靜的距離。";
    } else {
      setVitals({ energy: -1, defense: -1, mood: "calm" });
      statePatch.habitatTraces = [...habitatTraces, createTrace("crystal_trace", 0.55, now)];
      environmentEvent = { type: "crystal_touch", color: "#8deeff", x: 260, y: 500 };
      message = "晶簇亮起微光，空氣變得穩定。";
    }
  } else if (action === "care") {
    if (normalizedChoice === "gentle_presence") {
      setVitals({ defense: -6, trust: 1, mood: "calm" });
      message = "你只是待在牠身邊，沒有伸手。牠的肩膀慢慢鬆了。";
      // 剛被拒絕後選擇「靜靜陪伴」＝聽見了牠的「不要」：額外的正向沉積。
      if (currentState.lastTouchReaction === "reject") {
        statePatch.trust = clamp((statePatch.trust ?? currentState.trust) + 1, 0, 100);
        statePatch.defense = clamp((statePatch.defense ?? currentState.defense) - 2, 0, 100);
        statePatch.lastTouchReaction = "respected";
        message = "你沒有伸手，只是坐在牠夠得到的距離。牠記住了這個。";
      }
    } else if (normalizedChoice === "soft_comfort") {
      setVitals({ defense: -2, trust: 1, mood: "calm" });
      message = "夥伴稍微放鬆了一點。";
    } else if (normalizedChoice === "energy_supply") {
      setVitals({ energy: 2, mood: "warm" });
      message = "溫暖能量回到心核。";
    } else if (normalizedChoice === "rest_together") {
      setVitals({ energy: 1, touchFatigue: -2, mood: currentState.energy <= 3 ? "tired" : "calm" });
      statePatch.memories = appendMemoryDeduped(
        memories,
        createMemory(currentState, "care_rest", "陪伴休息", "棲地安靜下來，適合一起休息。", now)
      );
      message = "棲地安靜下來，適合一起休息。";
    } else {
      setVitals({ defense: -1, touchFatigue: -1, mood: "calm" });
      message = "空氣中的雜訊被清掉了一些。";
    }
  } else if (action === "grow") {
    if (normalizedChoice === "gentle_presence") {
      setVitals({ defense: -6, trust: 1, mood: "calm" });
      message = "你只是待在牠身邊，沒有伸手。牠的肩膀慢慢鬆了。";
      if (currentState.lastTouchReaction === "reject") {
        statePatch.trust = clamp((statePatch.trust ?? currentState.trust) + 1, 0, 100);
        statePatch.defense = clamp((statePatch.defense ?? currentState.defense) - 2, 0, 100);
        statePatch.lastTouchReaction = "respected";
        message = "你沒有伸手，只是坐在牠夠得到的距離。牠記住了這個。";
      }
    } else if (normalizedChoice === "trust_tuning") {
      setVitals({ trust: 1, defense: -1 });
      statePatch.growthHint = "trust_tuning";
      message = "信任回路略微對齊。";
    } else if (normalizedChoice === "emotional_balance") {
      setVitals({ energy: 1, mood: "calm" });
      message = "心核回到更穩定的節奏。";
    } else {
      message = "技能回路暫時維持休眠。";
    }
  } else if (action === "memory" && normalizedChoice === "memory_echo") {
    const emotionalMemories = Array.isArray(currentState.emotionalMemories) ? currentState.emotionalMemories : [];
    const latestEmotional = emotionalMemories[emotionalMemories.length - 1];
    const echoTheme = latestEmotional?.theme || "安靜";
    setVitals({ mood: "calm", trust: 1 });
    statePatch.memories = appendMemoryDeduped(
      memories,
      createMemory(
        currentState,
        "memory_echo",
        "回聲整理",
        `你們把「${echoTheme}」附近的回聲輕輕排好，棲地安靜了一點。`,
        now
      )
    );
    message = "回聲被輕輕整理好了。";
  } else if (action === "memory") {
    const recentChat = [...(currentState.chatHistory || [])].reverse().find((item) => item?.text)?.text || "";
    const memoryText = normalizedChoice === "today_echo"
      ? recentChat.slice(0, 160) || "安靜的一天被記錄下來。"
      : normalizedChoice === "companion_note"
        ? "這則筆記記下了此刻的距離與信任。"
        : "一枚湖面片段被保存在心核裡。";
    const type = normalizedChoice === "today_echo"
      ? "today_echo"
      : normalizedChoice === "companion_note"
        ? "companion_note"
        : "lake_fragment";
    const title = normalizedChoice === "today_echo"
      ? "今日回聲"
      : normalizedChoice === "companion_note"
        ? "夥伴筆記"
        : "湖面片段";
    statePatch.memories = appendMemoryDeduped(
      memories,
      createMemory(currentState, type, title, memoryText, now)
    );
    message = "記憶已收入心核。";
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

function normalizeActionChoice(choice) {
  return ACTION_CHOICE_ALIASES[choice] || choice || "";
}
