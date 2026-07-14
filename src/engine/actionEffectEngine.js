import { clamp } from "../utils/clamp.js";
import { applyCraftByChoice } from "../expedition/expeditionCraftEngine.js";

const MEMORY_DEDUPE_WINDOW_MS = 5 * 60 * 1000;
const TRACE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// 心核共息 trust 冷卻：由最近一筆 care_calm_sync 記憶的 createdAt 推導（零 schema 變更）。
// 冷卻只是內部調參，絕不可變成玩家可見的「明天再來」壓力（紅線 6）。
const CALM_SYNC_TRUST_COOLDOWN_MS = 10 * 60 * 1000;

// 可凝結／可回顧的共享時刻記憶類型（探索錨點、照顧在場、尊重沉積）。
const SHARED_MOMENT_MEMORY_TYPES = Object.freeze(new Set([
  "explore_lake_glow",
  "explore_silent_crystal",
  "care_gentle_presence",
  "care_soft_comfort",
  "care_rest",
  "care_calm_sync",
  "care_observe_body",
  "grow_trust_reflection",
  "memory_echo"
]));

const ACTION_CHOICE_ALIASES = Object.freeze({
  "Lake glow": "lake_glow",
  "Star corridor": "star_corridor",
  "Silent crystal": "silent_crystal",
  "Soft comfort": "soft_comfort",
  "Energy supply": "energy_supply",
  "Rest together": "rest_together",
  "Clear static": "clear_static",
  "Calm sync": "calm_sync",
  "Observe body": "observe_body",
  // 舊「信任校準」按鈕相容 → 新「回顧信任時刻」
  "Trust tuning": "trust_reflection",
  trust_tuning: "trust_reflection",
  "Trust reflection": "trust_reflection",
  shard_resonance: "shard_resonance",
  shard_breath: "shard_breath",
  shard_ember_ward: "shard_ember_ward",
  shard_tide_calm: "shard_tide_calm",
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

function countActiveTraces(habitatTraces, now) {
  return habitatTraces.filter((trace) => {
    if (!trace) return false;
    const expiresAt = Number(trace.expiresAt);
    return !Number.isFinite(expiresAt) || expiresAt > now;
  }).length;
}

function countSharedMomentMemories(memories) {
  return memories.filter((item) => SHARED_MOMENT_MEMORY_TYPES.has(item?.type)).length;
}

function hasRespectMoment(state, memories) {
  if (state.lastTouchReaction === "respected") return true;
  return memories.some((item) => item?.type === "care_gentle_presence");
}

/**
 * 依夥伴當下狀態產出「讀身體語言」解讀——給玩家資訊，不是數值儀表。
 */
function buildBodyLanguageReading(state) {
  const defense = Number(state.defense) || 0;
  const energy = Number(state.energy) || 0;
  const trust = Number(state.trust) || 0;
  const mood = state.mood || "calm";

  if (state.lastTouchReaction === "reject" || defense >= 60 || mood === "defensive") {
    return {
      message: "耳朵壓低，肩線收緊。牠現在需要空間——先別伸手。",
      reactionPreview: "牠的耳朵貼著，視線避開你，但沒有離開這片湖岸。",
      trustDelta: 1,
      defenseDelta: 0
    };
  }
  if (energy <= 3 || mood === "tired") {
    return {
      message: "呼吸偏淺，尾巴幾乎不動。牠累了，比起玩更需要一起慢下來。",
      reactionPreview: "牠把身體靠在岸邊的陰影裡，偶爾才抬眼看你一眼。",
      trustDelta: 0,
      defenseDelta: 0
    };
  }
  if (mood === "distant" || trust < 25) {
    return {
      message: "牠停在剛好夠得到的距離。願意待著，但還沒準備好靠近。",
      reactionPreview: "牠側身站著，尾巴輕輕擺了一下，像在確認你不會突然伸手。",
      trustDelta: 0,
      defenseDelta: 0
    };
  }
  if (mood === "warm" || trust >= 55) {
    return {
      message: "肩線鬆了，耳朵微微朝你。這是願意靠近的身體語言。",
      reactionPreview: "牠往你這邊挪了半步，鼻息輕輕打在空氣裡。",
      trustDelta: 0,
      defenseDelta: -1
    };
  }
  return {
    message: "呼吸平穩，尾巴偶爾輕擺。此刻沒有急著要什麼，也不排斥你在場。",
    reactionPreview: "牠安靜地待著，偶爾看一眼湖面，再看一眼你。",
    trustDelta: 0,
    defenseDelta: 0
  };
}

function applyGentlePresence(currentState, statePatch, memories, setVitals, now) {
  setVitals({ defense: -6, trust: 1, mood: "calm" });
  let message = "你只是待在牠身邊，沒有伸手。牠的肩膀慢慢鬆了。";
  let memoryText = "你沒有伸手，只是安靜地待在夠得到的距離。";
  statePatch.reactionPreview = "牠的肩膀慢慢鬆開，但仍保持自己選的距離。";

  // 剛被拒絕後選擇「靜靜陪伴」＝聽見了牠的「不要」：額外的正向沉積。
  if (currentState.lastTouchReaction === "reject") {
    statePatch.trust = clamp((statePatch.trust ?? currentState.trust) + 1, 0, 100);
    statePatch.defense = clamp((statePatch.defense ?? currentState.defense) - 2, 0, 100);
    statePatch.lastTouchReaction = "respected";
    message = "你沒有伸手，只是坐在牠夠得到的距離。牠記住了這個。";
    memoryText = "你聽見了牠的「不要」，只坐在夠得到的距離。牠記住了被尊重的感覺。";
    statePatch.reactionPreview = "牠沒有再後退。過了一會兒，尾巴輕輕落回地面。";
  }

  statePatch.memories = appendMemoryDeduped(
    memories,
    createMemory(currentState, "care_gentle_presence", "靜靜陪伴", memoryText, now),
    now
  );
  return message;
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
      // 與夥伴走近湖畔：共同片刻，不是點亮風景。
      const bondGain = (Number(currentState.trust) || 0) >= 40 ? 2 : 1;
      const nextMood = currentState.mood === "distant" || currentState.mood === "defensive"
        ? "calm"
        : "warm";
      setVitals({ energy: -1, bond: bondGain, mood: nextMood });
      const lakeText = bondGain >= 2
        ? "你們一起走近湖岸。牠沒有退開，湖面留下一圈柔和微光。"
        : "你們一起走近湖岸。牠停在半步之外，湖面仍亮起一圈微光。";
      statePatch.memories = appendMemoryDeduped(
        memories,
        createMemory(currentState, "explore_lake_glow", "湖畔片刻", lakeText, now),
        now
      );
      statePatch.habitatTraces = [...habitatTraces, createTrace("lake_glow_trace", 0.5, now)];
      statePatch.reactionPreview = bondGain >= 2
        ? "牠跟你並肩停在岸邊，耳朵朝向湖面的微光。"
        : "牠跟到岸邊，卻留了一點距離，視線落在水紋上。";
      message = lakeText;
    } else if (normalizedChoice === "star_corridor") {
      setVitals({ energy: -2, trust: 1, mood: currentState.mood === "defensive" ? "calm" : "distant" });
      statePatch.memories = appendMemoryDeduped(
        memories,
        createMemory(currentState, "explore_star_corridor", "星圖回廊", "星圖回廊回應了一道安靜脈動。", now),
        now
      );
      message = "星圖回廊留下安靜的距離。";
    } else if (normalizedChoice === "silent_crystal") {
      // 靜默錨點：有痕跡／共享記憶才凝結；沒有則說明缺什麼，不懲罰。
      const activeTraces = countActiveTraces(habitatTraces, now);
      const sharedMoments = countSharedMomentMemories(memories);
      const canCondense = activeTraces > 0 || sharedMoments > 0;

      if (canCondense) {
        setVitals({ touchFatigue: -1, defense: -2, trust: 1, mood: "calm" });
        const crystalText = activeTraces > 0
          ? "散落的微光被收進晶簇。空氣安定下來，這段痕跡可以回看了。"
          : "你們把近期安靜的片刻凝進晶簇。空氣安定了一點。";
        statePatch.memories = appendMemoryDeduped(
          memories,
          createMemory(currentState, "explore_silent_crystal", "靜默晶簇", crystalText, now),
          now
        );
        statePatch.habitatTraces = [...habitatTraces, createTrace("crystal_trace", 0.55, now)];
        statePatch.reactionPreview = "牠靠向晶簇，鼻尖幾乎碰到光，像在確認這段記憶還在。";
        environmentEvent = { type: "crystal_touch", color: "#8deeff", x: 260, y: 500 };
        message = crystalText;
      } else {
        // 無內容可凝結：不改數值（或僅極小安定），說清楚為什麼。
        setVitals({ defense: -1, mood: currentState.mood === "defensive" ? "calm" : currentState.mood });
        statePatch.reactionPreview = "晶簇仍暗著。牠看了一眼，又把視線放回湖面。";
        message = "晶簇還沒亮起。先一起留下一點微光或安靜的片刻，再來對準這裡。";
      }
    } else {
      setVitals({ energy: -1, defense: -1, mood: "calm" });
      statePatch.habitatTraces = [...habitatTraces, createTrace("crystal_trace", 0.55, now)];
      environmentEvent = { type: "crystal_touch", color: "#8deeff", x: 260, y: 500 };
      message = "晶簇亮起微光，空氣變得穩定。";
    }
  } else if (action === "care") {
    if (normalizedChoice === "gentle_presence") {
      message = applyGentlePresence(currentState, statePatch, memories, setVitals, now);
    } else if (normalizedChoice === "soft_comfort") {
      setVitals({ defense: -2, trust: 1, mood: "calm" });
      statePatch.memories = appendMemoryDeduped(
        memories,
        createMemory(currentState, "care_soft_comfort", "輕聲安撫", "你放輕聲音，夥伴稍微放鬆了一點。", now),
        now
      );
      statePatch.reactionPreview = "牠的耳朵動了一下，肩線鬆開半寸。";
      message = "你放輕聲音。夥伴稍微放鬆了一點。";
    } else if (normalizedChoice === "energy_supply") {
      setVitals({ energy: 2, mood: "warm" });
      message = "溫暖能量回到心核。";
    } else if (normalizedChoice === "rest_together") {
      const lowEnergy = (Number(currentState.energy) || 0) <= 3;
      if (lowEnergy) {
        setVitals({ energy: 2, touchFatigue: -2, mood: "calm" });
        statePatch.memories = appendMemoryDeduped(
          memories,
          createMemory(currentState, "care_rest", "一起休息", "牠累了。你們一起把節奏放慢，棲地安靜下來。", now),
          now
        );
        statePatch.reactionPreview = "牠在你附近躺下，呼吸漸漸變慢。";
        message = "牠累了。你們一起休息，棲地安靜下來。";
      } else {
        // 精力已夠：不白堆能量，改成願意陪坐的羈絆感。
        setVitals({ energy: 0, bond: 1, touchFatigue: -1, mood: "calm" });
        statePatch.memories = appendMemoryDeduped(
          memories,
          createMemory(currentState, "care_rest", "一起休息", "牠精神還不錯，但仍願意陪你坐一會兒。", now),
          now
        );
        statePatch.reactionPreview = "牠在你身邊坐下，尾巴輕輕掃過草地。";
        message = "牠精神還不錯，但仍願意陪你坐一會兒。";
      }
    } else if (normalizedChoice === "observe_body") {
      const reading = buildBodyLanguageReading(currentState);
      setVitals({
        trust: reading.trustDelta,
        defense: reading.defenseDelta,
        mood: currentState.mood
      });
      statePatch.reactionPreview = reading.reactionPreview;
      statePatch.memories = appendMemoryDeduped(
        memories,
        createMemory(currentState, "care_observe_body", "讀身體語言", reading.message, now),
        now
      );
      message = reading.message;
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
      message = applyGentlePresence(currentState, statePatch, memories, setVitals, now);
    } else if (normalizedChoice === "trust_reflection") {
      // 回顧信任時刻：必須已有共享／尊重記憶，否則不加信任並說清楚。
      const sharedMoments = countSharedMomentMemories(memories);
      const respected = hasRespectMoment(currentState, memories);
      const canReflect = sharedMoments > 0 || respected;

      if (canReflect) {
        setVitals({ trust: 2, bond: 1, defense: -2, mood: "calm" });
        const reflectText = respected
          ? "你回想起那個被尊重的距離。信任在安靜裡往前了一點。"
          : "你回想起你們一起度過的安靜片刻。信任回路對齊了一點。";
        statePatch.memories = appendMemoryDeduped(
          memories,
          createMemory(currentState, "grow_trust_reflection", "回顧信任時刻", reflectText, now),
          now
        );
        statePatch.reactionPreview = "牠聽你提起那一刻，耳朵輕輕轉了一下，沒有躲開。";
        statePatch.growthHint = "trust_reflection";
        message = reflectText;
      } else {
        statePatch.growthHint = "trust_reflection_blocked";
        statePatch.reactionPreview = "牠看著你，像在等一個還沒發生的共同片刻。";
        message = "還沒有足夠的共同記憶可回顧。先一起度過安靜的時刻——陪伴、休息，或心核共息。";
      }
    } else if (
      normalizedChoice === "shard_resonance"
      || normalizedChoice === "shard_breath"
      || normalizedChoice === "shard_ember_ward"
      || normalizedChoice === "shard_tide_calm"
    ) {
      // 遠征碎晶消耗：關係向強化，數值由配方 vitals 決定。
      const craft = applyCraftByChoice(currentState, normalizedChoice, now);
      if (!craft.ok) {
        statePatch.growthHint = `${normalizedChoice}_blocked`;
        statePatch.reactionPreview = craft.reactionPreview;
        message = craft.message;
      } else {
        Object.assign(statePatch, craft.statePatch);
        if (craft.vitals) setVitals(craft.vitals);
        if (craft.memory) {
          statePatch.memories = appendMemoryDeduped(
            memories,
            createMemory(
              currentState,
              craft.memory.type,
              craft.memory.title,
              craft.memory.text,
              now
            ),
            now
          );
        }
        statePatch.reactionPreview = craft.reactionPreview;
        statePatch.growthHint = craft.growthHint;
        message = craft.message;
      }
    } else if (normalizedChoice === "emotional_balance") {
      // 舊按鈕相容：不再免費加能量，引導玩家去共息。
      message = "情緒安定請走「心核共息」。一起把節奏放慢，比按鈕更靠近牠。";
      statePatch.reactionPreview = "牠等著你放慢，而不是被快速調校。";
    } else if (normalizedChoice === "skill_circuit") {
      message = "技能回路暫時維持休眠。關係章節比回路更重要。";
    } else {
      message = "這一章先停在關係本身。";
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
      ),
      now
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
      createMemory(currentState, type, title, memoryText, now),
      now
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
