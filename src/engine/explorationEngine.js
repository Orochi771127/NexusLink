import { clamp } from "../utils/clamp.js";
import { EmotionDict } from "../data/emotionDictionary.js";

// A4：高羈絆時，夥伴在探索中多一個主動的小舉動——讓「關係在長」被看見（非任務、無獎勵框架）。
const HIGH_BOND_FLOURISH = [
  "牠走在你前面一點點，又回頭確認你有跟上。",
  "牠的尾巴輕輕碰了你一下，像在說「我在」。",
  "你發現牠悄悄把好走的那一側讓給了你。",
  "牠停下來等你，等你到了，才又邁開步子。"
];

/**
 * 結算一次節點探索。純函數：回傳 patch 與事件，不直接改 state。
 * @returns {{ statePatch, message, memoryObject|null, encounter|null }}
 */
export function resolveExplorationEvent(state, node, { now = Date.now(), rng = Math.random } = {}) {
  if (!node) {
    return { statePatch: {}, message: "地圖訊號中斷了，先回營地吧。", memoryObject: null, encounter: null };
  }

  const statePatch = {};
  const applyVitals = ({ energy = 0, bond = 0, trust = 0, mood } = {}) => {
    if (energy) statePatch.energy = clamp((state.energy || 0) + energy, 0, 10);
    if (bond) statePatch.bond = clamp((state.bond || 0) + bond, 0, 100);
    if (trust) statePatch.trust = clamp((state.trust || 0) + trust, 0, 100);
    if (mood) statePatch.mood = mood;
  };

  const progress = state.explorationProgress || { totalExplorations: 0, lastNodeId: null, visitCounts: {} };
  statePatch.explorationProgress = {
    totalExplorations: (progress.totalExplorations || 0) + 1,
    lastNodeId: node.id,
    visitCounts: {
      ...(progress.visitCounts || {}),
      [node.id]: ((progress.visitCounts || {})[node.id] || 0) + 1
    }
  };

  let memoryObject = null;
  let encounter = null;
  const messagePool = Array.isArray(node.resultMessages) && node.resultMessages.length > 0
    ? node.resultMessages
    : ["你們安靜地走了一段路。"];
  let message = messagePool[Math.floor(rng() * messagePool.length)] || messagePool[0];

  if (node.eventType === "rest") {
    applyVitals({ energy: 2, bond: 1, mood: "calm" });
  } else if (node.eventType === "peaceful") {
    applyVitals({ energy: -1, bond: 2, mood: "warm" });
  } else if (node.eventType === "discovery") {
    applyVitals({ energy: -2, bond: 1, trust: 2 });
  } else if (node.eventType === "reflective") {
    applyVitals({ energy: 1, trust: 1, mood: "calm" });
    // 內省節點：留下一枚平靜的情緒記憶（會自然生成湖面漣漪痕跡）。
    const calmDict = EmotionDict.calm;
    memoryObject = {
      id: `emem_${now}_explore`,
      theme: calmDict.theme,
      label: `${node.label?.zh || "湖畔"}的安靜`,
      emotion: calmDict.key,
      intensity: 0.4,
      symbol: calmDict.symbol,
      place: calmDict.place,
      status: "fresh",
      source: "exploration",
      excerpt: node.reflectiveExcerpt || "你在這裡，看著一切慢慢靜下來。",
      createdAt: now,
      lastUpdatedAt: now,
      isVisibleInHabitat: true
    };
  } else if (node.eventType === "danger") {
    applyVitals({ energy: -1, mood: "alert" });
  }

  const encounterChance = Number(node.encounterChance) || 0;
  if (encounterChance > 0 && Array.isArray(node.enemyPool) && node.enemyPool.length > 0 && rng() < encounterChance) {
    const enemyId = node.enemyPool[Math.floor(rng() * node.enemyPool.length)] || node.enemyPool[0];
    encounter = { enemyId, nodeId: node.id };
    if (node.eventType !== "danger") {
      message = `${message}\n——不遠處傳來不對勁的聲音，有什麼正在靠近。`;
    }
  }

  // A4：關係夠深（bond ≥ 45）且非遭遇/危險時，探索多一句夥伴主動的溫柔舉動。
  const bond = state.bond || 0;
  if (!encounter && node.eventType !== "danger" && bond >= 45) {
    message = `${message}\n${HIGH_BOND_FLOURISH[Math.floor(rng() * HIGH_BOND_FLOURISH.length)] || HIGH_BOND_FLOURISH[0]}`;
  }

  return { statePatch, message, memoryObject, encounter };
}
