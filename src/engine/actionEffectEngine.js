import { clamp } from "../utils/clamp.js";

const MEMORY_DEDUPE_WINDOW_MS = 5 * 60 * 1000;
const TRACE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// 心核共息 trust 冷卻：由最近一筆 care_calm_sync 記憶的 createdAt 推導（零 schema 變更）。
// 冷卻只是內部調參，絕不可變成玩家可見的「明天再來」壓力（紅線 6）。
const CALM_SYNC_TRUST_COOLDOWN_MS = 10 * 60 * 1000;

const ACTION_CHOICE_ALIASES = Object.freeze({
  "Lake glow": "lake_glow",
  "Star corridor": "star_corridor",
  "Silent crystal": "silent_crystal",
  "Soft comfort": "soft_comfort",
  "Energy supply": "energy_supply",
  "Rest together": "rest_together",
  "Clear static": "clear_static",
  "Calm sync": "calm_sync",
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

// 拒絕狀態：夥伴剛用身體語言說「不」或正處防備。共息在此狀態不動 defense、不長 trust
// （規格：boundaries respected 才有信任沉積）——判準只看夥伴自身狀態，不看玩家頻率（紅線 1）。
function isRefusalState(state) {
  return state.lastTouchReaction === "reject" || state.mood === "defensive";
}

function getLastCalmSyncAt(memories) {
  for (let index = memories.length - 1; index >= 0; index -= 1) {
    const item = memories[index];
    if (item?.type === "care_calm_sync" && Number.isFinite(item.createdAt)) return item.createdAt;
  }
  return 0;
}

export function evaluateActionEffect(currentState, action, choice, context = {}) {
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
    } else if (normalizedChoice === "calm_sync") {
      // 心核共息 v1（spec §5）：mood 是字串枚舉，規格的 mood +1..+3 以「往安定推一步」表達。
      const syncedCycles = clamp(Number(context.syncedCycles) || 0, 0, 4);
      const refusal = isRefusalState(currentState);
      const trustReady = now - getLastCalmSyncAt(memories) >= CALM_SYNC_TRUST_COOLDOWN_MS;
      const grantTrust = trustReady && !refusal;
      const nextMood = currentState.energy <= 2
        ? "tired"
        : (refusal || currentState.mood === "distant") ? "calm" : "warm";
      setVitals({
        energy: Math.min(5, 2 + syncedCycles),
        touchFatigue: -2,
        defense: refusal ? 0 : -1,
        trust: grantTrust ? 1 : 0,
        mood: nextMood
      });
      statePatch.memories = appendMemoryDeduped(
        memories,
        createMemory(currentState, "care_calm_sync", "心核共息", "你們一起放慢了呼吸，湖面安靜了一些。", now),
        now
      );
      if (grantTrust) {
        statePatch.habitatTraces = [...habitatTraces, createTrace("calm_breath_trace", 0.45, now)];
      }
      message = syncedCycles > 0
        ? "牠的呼吸慢了下來，湖面也安靜了一些。"
        : "你沒有急著說話。節奏在你們之間安定下來。";
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
