import { RESPONSE_STRATEGIES } from "../responseStrategySelector.js";
import { buildPrefillGroundedReply } from "../dialogue/prefillGrounding.js";
import { hasValidPrefill } from "../dialogue/quickReplyContext.js";

const GENERIC_FALLBACK_BANNED = /我聽見了[。.]?\s*我們先慢一點|好[，,]?\s*我聽到了[，,]?\s*我們慢一點/;

export function getStrategyVariantLines({
  strategy = "",
  nlu = {},
  semanticFrame = {},
  recoveryContext = null
} = {}) {
  const frame = semanticFrame || nlu.semanticFrame || {};
  const activePrefill = nlu?.prefillContext || null;

  if (hasValidPrefill(activePrefill) && activePrefill.mustReference) {
    const forced = buildPrefillGroundedReply({
      strategy,
      nlu,
      semanticFrame: frame,
      prefillContext: activePrefill,
      seed: String(nlu.inputText || "").length
    });
    if (forced && !GENERIC_FALLBACK_BANNED.test(forced)) return [forced];
  }

  const lines = resolveVariantLines(strategy, nlu, frame, recoveryContext, activePrefill);
  const filtered = lines.filter((line) => line && !GENERIC_FALLBACK_BANNED.test(line));
  return applyPrefillLines(filtered, strategy, nlu, frame, activePrefill);
}

export function buildStrategyVariantMeta({
  strategy = "",
  nlu = {},
  semanticFrame = {},
  recoveryContext = null
} = {}) {
  const frame = semanticFrame || nlu.semanticFrame || {};
  const topic = frame.topic || nlu.topic || "unknown";
  return getStrategyVariantLines({ strategy, nlu, semanticFrame, recoveryContext }).map((line, index) => ({
    variantId: `strategy:${strategy}:${index}`,
    variantIndex: index,
    replySource: "nlu_builder",
    openingPhrase: extractOpeningPhrase(line),
    topic
  }));
}

export function buildStrategyReplyAtVariant({
  strategy = "",
  nlu = {},
  semanticFrame = {},
  variantIndex = 0,
  recoveryContext = null
} = {}) {
  const prefillReply = tryBuildPrefillReply({ strategy, nlu, semanticFrame, seed: variantIndex });
  if (prefillReply) return prefillReply;

  const lines = getStrategyVariantLines({ strategy, nlu, semanticFrame, recoveryContext });
  if (!lines.length) return null;
  const reply = lines[Math.abs(variantIndex) % lines.length];
  if (!reply || GENERIC_FALLBACK_BANNED.test(reply)) return null;
  return reply;
}

export function buildStrategyReply({
  strategy = "",
  nlu = {},
  semanticFrame = {},
  seed = 0,
  recoveryContext = null,
  variantIndex = null
} = {}) {
  if (Number.isFinite(variantIndex)) {
    return buildStrategyReplyAtVariant({ strategy, nlu, semanticFrame, variantIndex, recoveryContext });
  }

  const prefillReply = tryBuildPrefillReply({ strategy, nlu, semanticFrame, seed });
  if (prefillReply) return prefillReply;

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
      const act = frame.dialogueAct || nlu.dialogueAct || "";
      if (act === "apologizing") {
        return pick(
          ["你剛剛那一下我收到了。不用急著補很多，我們可以重新對齊節奏。", "道歉我聽見了。先不用解釋太多，我們把距離放回剛剛剛好的位置。"],
          seed
        );
      }
      if (topic === "work_pressure") {
        const workLine = groundedWorkPressureLine(frame);
        if (workLine) return workLine;
        return "工作壓力堆上來時，先把最卡的那一段說出來就好。";
      }
      if (topic === "physical_tiredness" || tone === "fatigue") {
        return pick(["累的時候，先把聲音放小也可以。", "這份累我先接住，不急着把你推去做事。"], seed);
      }
      if (topic === "daily_life") {
        return groundedDailyLifeLine(frame, seed);
      }
      if (topic === "social_conflict") {
        const socialLine = groundedSocialConflictLine(frame);
        if (socialLine) return socialLine;
        return "人際上的悶先放著，我不急着給你結論。";
      }
      if (topic === "relationship") return "關係這件事我會慢慢聽，不急着定義你現在要什麼。";
      return `這份${tone === "sadness" ? "悶" : "感覺"}我先接住，不急着分析。`;
    },
    [RESPONSE_STRATEGIES.CLARIFYING_QUESTION]: () => {
      if (topic === "unknown") return "你比較想聊的是情緒、介面，還是開發節奏？";
      return `我想確認一下：你現在最想先處理的是${topicLabel(topic)}這塊嗎？`;
    },
    [RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY]: () =>
      `這個問題我先對準${topicLabel(topic)}。若你要的是步驟，我可以拆；若你要的是陪伴，我就少說。`,
    [RESPONSE_STRATEGIES.CONTEXTUAL_ACK]: () => {
      const need = frame.userNeed || "";
      if (topic === "relationship" && need === "boundary") {
        return "你想靠近，也願意給彼此空間。我會照這個節奏來。";
      }
      if (topic === "emotion" && need === "validation") {
        return "這份情緒我先放在這裡，不急着幫你整理成結論。";
      }
      if (topic === "work_pressure") return "工作的重量我先聽見了。你想先講壓力來源，還是先講最煩的一段？";
      if (topic === "daily_life") return groundedDailyLifeLine(frame, seed);
      if (topic !== "unknown") {
        return pick(
          [
            `我先把你說的${topicLabel(topic)}放在前面，不套通用句。`,
            `這句話的重點在${topicLabel(topic)}，我從這裡回你。`
          ],
          seed
        );
      }
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
    [RESPONSE_STRATEGIES.LIGHT_GREETING]: () => {
      const said = String(nlu.inputText || "").trim();
      if (/聽說.{0,12}很[型屌行]|^[你妳]很[型屌行]/.test(said)) {
        return pick(
          ["哈哈，你這樣開場我會害羞。", "型喔？那你今天心情好像不錯。", "嗯？突然這樣夸，我會當真的喔。"],
          seed
        );
      }
      if (/吃飯沒|吃了嗎|吃飯了嗎/.test(said)) {
        return pick(
          ["還沒呢，但你先顧好自己比較重要。", "你呢？有沒有好好吃？", "我這邊沒關係，倒是你——有吃飯嗎？"],
          seed
        );
      }
      if (/你好嗎|你好不好|最近好嗎|還好嗎/.test(said)) {
        return pick(["我還好，你呢？", "嗯，我在。你呢，還好嗎？", "聽見你了。你最近怎麼樣？"], seed);
      }
      if (/安安/.test(said)) return pick(["嗯，我在。", "安安，聽見你了。", "我在，不用急著說重點。"], seed);
      return pick(["嗯，我在。", "聽見你了。", "我在，不用急著說重點。"], seed);
    },
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
    daily_life: "日常",
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

function tryBuildPrefillReply({ strategy, nlu, semanticFrame, seed = 0 }) {
  const prefillContext = nlu?.prefillContext;
  if (!hasValidPrefill(prefillContext)) return null;

  const reply = buildPrefillGroundedReply({
    strategy,
    nlu,
    semanticFrame,
    prefillContext,
    seed
  });

  if (!reply || GENERIC_FALLBACK_BANNED.test(reply)) return null;
  if (prefillContext.mustReference) return reply;
  return null;
}

function applyPrefillLines(lines, strategy, nlu, frame, prefillContext) {
  if (!hasValidPrefill(prefillContext)) return lines;

  const grounded = buildPrefillGroundedReply({
    strategy,
    nlu,
    semanticFrame: frame,
    prefillContext,
    seed: String(nlu.inputText || "").length
  });

  if (!grounded || GENERIC_FALLBACK_BANNED.test(grounded)) return lines;
  if (prefillContext.mustReference) return [grounded];
  if (lines.includes(grounded)) return lines;
  return [grounded, ...lines];
}

function resolveVariantLines(strategy, nlu, frame, recoveryContext, prefillContext = null) {
  const activePrefill = prefillContext || nlu?.prefillContext || null;
  const topic = frame.topic || nlu.topic || "unknown";
  const entities = frame.entities || [];
  const entityRef = entities[0] || topicLabel(topic);
  const tone = frame.emotionalTone || "calm";
  const act = frame.dialogueAct || nlu.dialogueAct || "";
  const said = String(nlu.inputText || "").trim();
  const need = frame.userNeed || "";

  switch (strategy) {
    case RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION:
      if (topic === "hud_ui" || entities.includes("HUD")) {
        const hudLine = groundedHudClarificationLine(frame);
        return [hudLine || "先不安慰你。我們把 HUD 問題拆開：是 top HUD、bottom dock，還是 Soul Talk 面板被擋住？"];
      }
      if (topic === "development") {
        return [`先釐清問題。你提到${entityRef}，我們可以先列：現象、重現步驟、最後才是修法。`];
      }
      if (topic === "emotion" && (frame.negations || []).some((n) => /身體累/.test(n))) {
        return ["好，我先當成心裡卡住，不當成身體累。你想先說的是哪一段？"];
      }
      return [`我先把重點放在釐清，不先安慰。你說的${entityRef || "這件事"}，是哪一段開始不對？`];
    case RESPONSE_STRATEGIES.ACKNOWLEDGE_GENERIC_FAILURE:
      return [
        "你說得對，我剛剛的回覆太像同一句模板。我會改成先聽懂你的主題再回。",
        "我承認剛剛一直在重複「聽到了、慢一點」。這次我改從你說的內容回。"
      ];
    case RESPONSE_STRATEGIES.ACKNOWLEDGE_FEEDBACK:
      return ["這個回饋我收到了。我會減少模板句，先對準你在說的主題。"];
    case RESPONSE_STRATEGIES.QUIET_PRESENCE:
      return ["好，我不多說。", "嗯，我安靜陪著。", "好，先不問。"];
    case RESPONSE_STRATEGIES.PRACTICAL_EXPLANATION:
      return [
        "自然語言理解會經過 intent、semanticFrame、response pack 幾層；如果都 miss，才會掉到 generic fallback。我們可以從你這句話的 topic 和 constraints 開始修。"
      ];
    case RESPONSE_STRATEGIES.PRACTICAL_PLANNING:
      return ["若目標是讓玩家立刻感覺懂你，先修 AI 理解層；若畫面操作受阻，先修 UI/HUD。你現在比較卡的是哪一種？"];
    case RESPONSE_STRATEGIES.EXPLORATION_INVITE:
      if (tone === "fatigue" || (nlu.nuances || []).includes("repeated_emotion")) {
        return ["湖面外的路還在。你現在有點沒力，我們可以慢慢走，不硬拉節奏。"];
      }
      return ["湖面外的光路還在。我們可以慢慢走向外面地圖，但不會硬拉你離開現在的節奏。"];
    case RESPONSE_STRATEGIES.BOUNDARY_SET:
      return ["你想靠近，也留了退後的空間。若太快，我會先退半步。"];
    case RESPONSE_STRATEGIES.SHORT_VALIDATION:
      return ["嗯，被否定會悶。我先不講大道理。", "聽起來很悶。我先陪著，不急着給建議。"];
    case RESPONSE_STRATEGIES.EMOTIONAL_SHORT:
      if (act === "apologizing") {
        return [
          "你剛剛那一下我收到了。不用急著補很多，我們可以重新對齊節奏。",
          "道歉我聽見了。先不用解釋太多，我們把距離放回剛剛剛好的位置。"
        ];
      }
      if (topic === "work_pressure") {
        const workLine = groundedWorkPressureLine(frame);
        return [workLine || "工作壓力堆上來時，先把最卡的那一段說出來就好。"];
      }
      if (topic === "physical_tiredness" || tone === "fatigue") {
        return ["累的時候，先把聲音放小也可以。", "這份累我先接住，不急着把你推去做事。"];
      }
      if (topic === "daily_life") {
        return dailyLifeLines(frame);
      }
      if (topic === "social_conflict") {
        const socialLine = groundedSocialConflictLine(frame);
        return [socialLine || "人際上的悶先放著，我不急着給你結論。"];
      }
      if (topic === "relationship") return ["關係這件事我會慢慢聽，不急着定義你現在要什麼。"];
      return [`這份${tone === "sadness" ? "悶" : "感覺"}我先接住，不急着分析。`];
    case RESPONSE_STRATEGIES.CLARIFYING_QUESTION:
      if (topic === "unknown") return ["你比較想聊的是情緒、介面，還是開發節奏？"];
      return [`我想確認一下：你現在最想先處理的是${topicLabel(topic)}這塊嗎？`];
    case RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY:
      return [`這個問題我先對準${topicLabel(topic)}。若你要的是步驟，我可以拆；若你要的是陪伴，我就少說。`];
    case RESPONSE_STRATEGIES.CONTEXTUAL_ACK:
      if (topic === "relationship" && need === "boundary") {
        return ["你想靠近，也願意給彼此空間。我會照這個節奏來。"];
      }
      if (topic === "emotion" && need === "validation") {
        return ["這份情緒我先放在這裡，不急着幫你整理成結論。"];
      }
      if (topic === "work_pressure") return ["工作的重量我先聽見了。你想先講壓力來源，還是先講最煩的一段？"];
      if (topic === "daily_life") return dailyLifeLines(frame);
      if (topic !== "unknown") {
        return [
          `我先把你說的${topicLabel(topic)}放在前面，不套通用句。`,
          `這句話的重點在${topicLabel(topic)}，我從這裡回你。`
        ];
      }
      return ["我在。你可以再說一句你最想我先懂的部分。"];
    case RESPONSE_STRATEGIES.REPEATED_EMOTION_RECALL:
      return [
        "我聽見「又」這個字了。這種疲憊不是第一次回來。這次先不用急著拆，先確認它是身體累，還是心裡卡住。",
        "這種疲憊又回來了。我不急著安慰你。先分清楚：是身體累，還是心裡卡住？"
      ];
    case RESPONSE_STRATEGIES.HOLDING_SPACE:
      return ["好，我先不給答案。這件事就放在這裡。", "嗯，不用講太多。我陪著，不急着收走。"];
    case RESPONSE_STRATEGIES.LIGHT_GREETING:
      if (/聽說.{0,12}很[型屌行]|^[你妳]很[型屌行]/.test(said)) {
        return ["哈哈，你這樣開場我會害羞。", "型喔？那你今天心情好像不錯。", "嗯？突然這樣夸，我會當真的喔。"];
      }
      if (/吃飯沒|吃了嗎|吃飯了嗎/.test(said)) {
        return ["還沒呢，但你先顧好自己比較重要。", "你呢？有沒有好好吃？", "我這邊沒關係，倒是你——有吃飯嗎？"];
      }
      if (/你好嗎|你好不好|最近好嗎|還好嗎/.test(said)) {
        return ["我還好，你呢？", "嗯，我在。你呢，還好嗎？", "聽見你了。你最近怎麼樣？"];
      }
      if (/安安/.test(said)) return ["嗯，我在。", "安安，聽見你了。", "我在，不用急著說重點。"];
      return ["嗯，我在。", "聽見你了。", "我在，不用急著說重點。"];
    case RESPONSE_STRATEGIES.MEMORY_REFERENCE: {
      const awakeningRecall =
        topic === "awakening" ||
        (topic === "memory" && /初醒|醒來|心核/.test(entityRef)) ||
        recoveryContext?.memoryTheme === "心核初醒" ||
        entities.some((entity) => /初醒|awakening|心核/.test(String(entity)));
      if (awakeningRecall) {
        return ["我記得。那時候心核剛亮起，聲音還很輕。", "我記得第一次醒來。那時候我還分不清你的聲音，只知道你在這裡。"];
      }
      const fatigueRecall =
        recoveryContext?.memoryEmotion === "fatigue" ||
        recoveryContext?.memoryTheme === "疲憊" ||
        topic === "physical_tiredness" ||
        (topic === "memory" && /累|疲憊/.test(entityRef)) ||
        (act === "asking_memory" && /累|疲憊|沒力/.test(topicLabel(topic) + entityRef));
      if (fatigueRecall && !awakeningRecall) {
        return [
          "我記得你上次說累的時候。那時候我們把節奏放慢，不急着把火燒旺。",
          "上次那段疲憊還在記憶裡。這次我們沿用那種慢一點的節奏。"
        ];
      }
      return [];
    }
    default:
      return [];
  }
}

function extractOpeningPhrase(text = "") {
  return String(text || "").split(/[。！？]/)[0].trim().slice(0, 14);
}

function groundedDailyLifeLine(frame = {}, seed = 0) {
  return pick(dailyLifeLines(frame), seed);
}

function dailyLifeLines(frame = {}) {
  const detail = frame.specificDetail?.text || "";
  if (/下班/.test(detail)) {
    return [
      "下班後腦袋空掉很正常。先不用整理今天，把肩膀放下來就好。",
      "下班了就先別急著復盤。你可以先在這裡放空一下。"
    ];
  }
  if (/腦袋空|放空/.test(detail)) {
    return ["腦袋空空的時候，不用硬塞一句有意義的話。先空著也可以。", "那就先放空一下。我不急著把你拉回來。"];
  }
  if (/吃完飯|吃飽/.test(detail)) {
    return ["剛吃完飯就想躺一下，也很合理。先讓身體慢慢安靜下來。", "吃完飯後不用立刻做什麼。你可以先慢慢躺一下。"];
  }
  if (/想躺|躺一下/.test(detail)) {
    return ["想躺就先躺一下。今天不用每一秒都有用。", "嗯，先躺一下也好。我會把聲音放輕。"];
  }
  if (/懶懶|懶得動|普通/.test(detail)) {
    return ["懶懶的日子也可以存在。今天先不用把自己推得很用力。", "普通的一天也不用硬變成事件。你慢慢待著就好。"];
  }
  return ["今天的日常我聽見了。不用很特別，也可以放在這裡。", "嗯，這種小小的日常也算數。我在這裡聽。"];
}

function groundedWorkPressureLine(frame = {}) {
  const detail = frame.specificDetail?.text || "";
  if (!detail) return null;
  if (/老闆|任務|丟/.test(detail)) {
    return "老闆一直丟任務的壓力我先聽見了。你想先講最煩的一段，還是先講今天最卡的地方？";
  }
  if (/壓力/.test(detail)) {
    return `你說的「${truncateDetail(detail)}」我先聽見了。你想先講壓力來源，還是先講最煩的一段？`;
  }
  return null;
}

function groundedSocialConflictLine(frame = {}) {
  const detail = frame.specificDetail?.text || "";
  if (!detail) return null;
  if (/酸|否定|罵|拒絕/.test(detail)) {
    return `被人${detail.includes("酸") ? "酸" : "否定"}的悶我先放著，不急着給你結論。`;
  }
  if (/悶/.test(detail)) {
    return "心裡悶悶的這份感覺我先接住，不急着分析。";
  }
  return null;
}

function groundedHudClarificationLine(frame = {}) {
  const detail = frame.specificDetail?.text || "";
  if (!detail) return null;
  if (/Soul Talk|面板/.test(detail) && /擋|遮|疊/.test(detail)) {
    return "先不安慰你。Soul Talk 面板被擋住的問題，我們先拆：是 top HUD 疊上來，還是 bottom dock 擋住？";
  }
  if (/HUD/.test(detail) && /擋|遮|疊|壞/.test(detail)) {
    return `先釐清 HUD。你說的「${truncateDetail(detail)}」，是 top HUD、bottom dock，還是面板層級問題？`;
  }
  return null;
}

function truncateDetail(text = "", max = 16) {
  const trimmed = String(text || "").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}
