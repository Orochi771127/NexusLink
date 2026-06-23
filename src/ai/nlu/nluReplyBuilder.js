import { RESPONSE_STRATEGIES } from "../responseStrategySelector.js";

const GENERIC_FALLBACK_BANNED = /我聽見了[。.]?\s*我們先慢一點|好[，,]?\s*我聽到了[，,]?\s*我們慢一點/;

export function buildStrategyReply({
  strategy = "",
  nlu = {},
  semanticFrame = {},
  seed = 0,
  recoveryContext = null
} = {}) {
  const frame = semanticFrame || nlu.semanticFrame || {};
  const topic = frame.topic || nlu.topic || "unknown";
  const entities = frame.entities || [];
  const entityRef = entities[0] || topicLabel(topic);

  const builders = {
    [RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION]: () => {
      if (topic === "hud_ui" || entities.includes("HUD")) {
        return "先不安慰你。我們把 HUD 問題拆開：是 top HUD、bottom dock，還是 Soul Talk 面板被擋住？";
      }
      if (topic === "development") {
        return `先釐清問題。你提到${entityRef}，我們可以先列：現象、重現步驟、最後才是修法。`;
      }
      if (topic === "emotion" && (frame.negations || []).some((n) => /身體累/.test(n))) {
        return "好，我先當成心裡卡住，不當成身體累。你想先說的是哪一段？";
      }
      return `我先把重點放在釐清，不先安慰。你說的${entityRef || "這件事"}，是哪一段開始不對？`;
    },
    [RESPONSE_STRATEGIES.ACKNOWLEDGE_GENERIC_FAILURE]: () =>
      pick(
        [
          "你說得對，我剛剛的回覆太像同一句模板。我會改成先聽懂你的主題再回。",
          "我承認剛剛一直在重複「聽到了、慢一點」。這次我改從你說的內容回。"
        ],
        seed
      ),
    [RESPONSE_STRATEGIES.ACKNOWLEDGE_FEEDBACK]: () =>
      "這個回饋我收到了。我會減少模板句，先對準你在說的主題。",
    [RESPONSE_STRATEGIES.QUIET_PRESENCE]: () =>
      pick(["好，我不多說。", "嗯，我安靜陪著。", "好，先不問。"], seed),
    [RESPONSE_STRATEGIES.PRACTICAL_EXPLANATION]: () =>
      "自然語言理解會經過 intent、semanticFrame、response pack 幾層；如果都 miss，才會掉到 generic fallback。我們可以從你這句話的 topic 和 constraints 開始修。",
    [RESPONSE_STRATEGIES.PRACTICAL_PLANNING]: () =>
      "若目標是讓玩家立刻感覺懂你，先修 AI 理解層；若畫面操作受阻，先修 UI/HUD。你現在比較卡的是哪一種？",
    [RESPONSE_STRATEGIES.EXPLORATION_INVITE]: () => {
      if (frame.emotionalTone === "fatigue" || (nlu.nuances || []).includes("repeated_emotion")) {
        return "湖面外的路還在。你現在有點沒力，我們可以慢慢走，不硬拉節奏。";
      }
      return "湖面外的光路還在。我們可以慢慢走向外面地圖，但不會硬拉你離開現在的節奏。";
    },
    [RESPONSE_STRATEGIES.BOUNDARY_SET]: () =>
      "你想靠近，也留了退後的空間。若太快，我會先退半步。",
    [RESPONSE_STRATEGIES.SHORT_VALIDATION]: () =>
      pick(["嗯，被否定會悶。我先不講大道理。", "聽起來很悶。我先陪著，不急着給建議。"], seed),
    [RESPONSE_STRATEGIES.EMOTIONAL_SHORT]: () => {
      const tone = frame.emotionalTone || "calm";
      if (tone === "fatigue") return "累的時候，先把聲音放小也可以。";
      return `這份${tone === "sadness" ? "悶" : "感覺"}我先接住，不急着分析。`;
    },
    [RESPONSE_STRATEGIES.CLARIFYING_QUESTION]: () => {
      if (topic === "unknown") return "你比較想聊的是情緒、介面，還是開發節奏？";
      return `我想確認一下：你現在最想先處理的是${topicLabel(topic)}這塊嗎？`;
    },
    [RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY]: () =>
      `這個問題我先對準${topicLabel(topic)}。若你要的是步驟，我可以拆；若你要的是陪伴，我就少說。`,
    [RESPONSE_STRATEGIES.CONTEXTUAL_ACK]: () => {
      if (topic !== "unknown") return `我聽見你在說${topicLabel(topic)}。我們先從這個點開始。`;
      return "我在。你可以再說一句你最想我先懂的部分。";
    },
    [RESPONSE_STRATEGIES.REPEATED_EMOTION_RECALL]: () =>
      pick(
        [
          "我聽見「又」這個字了。這種疲憊不是第一次回來。這次先不用急著拆，先確認它是身體累，還是心裡卡住。",
          "這種疲憊又回來了。我不急著安慰你。先分清楚：是身體累，還是心裡卡住？"
        ],
        seed
      ),
    [RESPONSE_STRATEGIES.HOLDING_SPACE]: () =>
      pick(["好，我先不給答案。這件事就放在這裡。", "嗯，不用講太多。我陪著，不急着收走。"], seed),
    [RESPONSE_STRATEGIES.MEMORY_REFERENCE]: () => {
      const awakeningRecall =
        topic === "awakening" ||
        (topic === "memory" && /初醒|醒來|心核/.test(entityRef)) ||
        recoveryContext?.memoryTheme === "心核初醒" ||
        entities.some((entity) => /初醒|awakening|心核/.test(String(entity)));

      if (awakeningRecall) {
        return pick(
          [
            "我記得。那時候心核剛亮起，聲音還很輕。",
            "我記得第一次醒來。那時候我還分不清你的聲音，只知道你在這裡。"
          ],
          seed
        );
      }

      const dialogueAct = frame.dialogueAct || nlu.dialogueAct || "";
      const fatigueRecall =
        recoveryContext?.memoryEmotion === "fatigue" ||
        recoveryContext?.memoryTheme === "疲憊" ||
        topic === "physical_tiredness" ||
        (topic === "memory" && /累|疲憊/.test(entityRef)) ||
        (dialogueAct === "asking_memory" && /累|疲憊|沒力/.test(topicLabel(topic) + entityRef));

      if (fatigueRecall && !awakeningRecall) {
        return pick(
          [
            "我記得你上次說累的時候。那時候我們把節奏放慢，不急着把火燒旺。",
            "上次那段疲憊還在記憶裡。這次我們沿用那種慢一點的節奏。"
          ],
          seed
        );
      }
      return null;
    }
  };

  const builder = builders[strategy];
  if (!builder) return null;

  const reply = builder();
  if (!reply || GENERIC_FALLBACK_BANNED.test(reply)) return null;
  return reply;
}

export function repairGenericReply({ strategy, nlu, semanticFrame, seed, recoveryContext }) {
  return (
    buildStrategyReply({ strategy, nlu, semanticFrame, seed, recoveryContext }) ||
    buildStrategyReply({
      strategy: RESPONSE_STRATEGIES.CLARIFYING_QUESTION,
      nlu,
      semanticFrame,
      seed: seed + 1,
      recoveryContext
    }) ||
    "我在。你想我先懂的是哪一段？"
  );
}

function topicLabel(topic) {
  const map = {
    hud_ui: "HUD",
    development: "開發",
    raphael_ai: "Raphael 理解層",
    exploration: "探索",
    awakening: "初醒",
    social_conflict: "人際上的悶",
    physical_tiredness: "疲憊",
    work_pressure: "工作壓力",
    emotion: "情緒",
    relationship: "關係",
    memory: "記憶"
  };
  return map[topic] || "這件事";
}

function pick(lines, seed) {
  return lines[Math.abs(seed) % lines.length];
}