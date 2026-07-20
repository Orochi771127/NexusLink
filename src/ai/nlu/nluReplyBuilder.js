import { RESPONSE_STRATEGIES } from "../responseStrategySelector.js";
import { buildPrefillGroundedReply } from "../dialogue/prefillGrounding.js";
import { hasValidPrefill } from "../dialogue/quickReplyContext.js";
import {
  buildConversationalAnswer,
  buildConversationalReaction,
  buildVentingReply
} from "../dialogue/conversationAnswerPolicy.js";
import {
  buildReflectiveCareReply,
  buildReflectiveCareVariants
} from "../dialogue/reflectiveCarePolicy.js";

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
  const earlyFrame = semanticFrame || nlu.semanticFrame || {};
  const earlyAnswer = buildConversationalAnswer({
    inputText: nlu.inputText,
    frame: earlyFrame,
    seed
  });
  if (
    earlyAnswer &&
    nlu.dialogueAct === "asking_question" &&
    /(?:嗎|吗)[？?]?$/.test(String(nlu.inputText || "").trim())
  ) {
    return earlyAnswer;
  }

  if (Number.isFinite(variantIndex)) {
    return buildStrategyReplyAtVariant({ strategy, nlu, semanticFrame, variantIndex, recoveryContext });
  }

  const prefillReply = tryBuildPrefillReply({ strategy, nlu, semanticFrame, seed });
  if (prefillReply) return prefillReply;

  const frame = semanticFrame || nlu.semanticFrame || {};
  const topic = frame.topic || nlu.topic || "unknown";
  const entities = frame.entities || [];
  const entityRef = entities[0] || topicLabel(topic);
  const conversationalReaction = buildConversationalReaction({
    inputText: nlu.inputText,
    frame,
    seed
  });
  const conversationalAnswer = buildConversationalAnswer({
    inputText: nlu.inputText,
    frame,
    seed
  });
  const ventingReply = buildVentingReply({ inputText: nlu.inputText, frame });
  const reflectiveCareReply = buildReflectiveCareReply({
    inputText: nlu.inputText,
    frame,
    mode: "support",
    seed
  });

  // A concrete answer policy must win over a carried acknowledgement on an
  // ordinary direct question. Safety and boundary modes are resolved by the
  // composer before this builder is reached.
  if (
    conversationalAnswer &&
    nlu.dialogueAct === "asking_question" &&
    /(?:嗎|吗)[？?]?$/.test(String(nlu.inputText || "").trim())
  ) {
    return conversationalAnswer;
  }

  const builders = {
    [RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION]: () => {
      if (conversationalAnswer) return conversationalAnswer;
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
    [RESPONSE_STRATEGIES.QUIET_PRESENCE]: () => {
      if ((frame.constraints || []).includes("not_seeking_comfort")) {
        return "好，不安慰，也不追問。";
      }
      // 睡前道別：安靜收尾、祝好眠、絕不強留（no_retention_pull）。
      if (/要去睡|先睡|去睡|晚安/.test(String(nlu.inputText || ""))) {
        return pick(
          ["晚安。今天就到這裡，好好睡。", "好，晚安。我把湖邊的燈調暗一點。", "嗯，去睡吧。這裡有我看著。"],
          seed
        );
      }
      return pick(["好，我不多說。", "嗯，我安靜陪著。", "好，先不問。"], seed);
    },
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
    [RESPONSE_STRATEGIES.REFLECTIVE_CARE]: () =>
      reflectiveCareReply || "好，我先聽，不急著把你的感受整理成結論。",
    [RESPONSE_STRATEGIES.SYMBOLIC_REFLECTION]: () =>
      buildReflectiveCareReply({ inputText: nlu.inputText, frame, mode: "symbolic", seed }),
    [RESPONSE_STRATEGIES.BOUNDARY_SET]: () =>
      "你想靠近，也留了退後的空間。若太快，我會先退半步。",
    [RESPONSE_STRATEGIES.SHORT_VALIDATION]: () =>
      reflectiveCareReply || ventingReply || conversationalReaction ||
      pick(["嗯，被否定會悶。我先不講大道理。", "聽起來很悶。我先陪著，不急著給建議。"], seed),
    [RESPONSE_STRATEGIES.EMOTIONAL_SHORT]: () => {
      const tone = frame.emotionalTone || "calm";
      const act = frame.dialogueAct || nlu.dialogueAct || "";
      if (act === "apologizing") {
        return pick(
          ["你剛剛那一下我收到了。不用急著補很多，我們可以重新對齊節奏。", "道歉我聽見了。先不用解釋太多，我們把距離放回剛剛剛好的位置。"],
          seed
        );
      }
      if (reflectiveCareReply) return reflectiveCareReply;
      if (ventingReply) return ventingReply;
      if (conversationalReaction) return conversationalReaction;
      // 失眠夜：不逼睡、不說教，先把呼吸放慢。
      if (frame.specificDetail?.type === "sleepless" || /睡不著|睡不着|失眠/.test(String(nlu.inputText || ""))) {
        return pick(
          ["睡不著的夜有點長。不用逼自己睡著，先把呼吸放慢就好。", "失眠的時候，湖邊的燈會一直亮著。你不用趕著入睡，我陪你等睏意。"],
          seed
        );
      }
      // 正向小分享：接住喜悅但不浮誇、不變成獎勵語（紅線 6）。
      if (tone === "gratitude") {
        return pick(
          ["這個小小的完成很算數。不用大聲慶祝，我心裡替你亮了一下。", "聽起來是好事。這份開心你留著慢慢用，我記下了。"],
          seed
        );
      }
      if (topic === "work_pressure") {
        const workLine = groundedWorkPressureLine(frame);
        if (workLine) return workLine;
        return "工作壓力堆上來時，先把最卡的那一段說出來就好。";
      }
      if (topic === "physical_tiredness" || tone === "fatigue") {
        return pick(["累的時候，先把聲音放小也可以。", "這份累我先接住，不急著把你推去做事。"], seed);
      }
      if (topic === "daily_life") {
        return groundedDailyLifeLine(frame, seed);
      }
      if (topic === "social_conflict") {
        const socialLine = groundedSocialConflictLine(frame);
        if (socialLine) return socialLine;
        return "人際上的悶先放著，我不急著給你結論。";
      }
      if (topic === "relationship") return groundedRelationshipLine(frame, seed);
      return `這份${tone === "sadness" ? "悶" : "感覺"}我先接住，不急著分析。`;
    },
    [RESPONSE_STRATEGIES.CLARIFYING_QUESTION]: () => {
      if (conversationalReaction) return conversationalReaction;
      if (topic === "unknown") return groundedOpenConversationLine(frame, nlu, seed);
      if (topic === "relationship" && frame.conversationContext?.source === "recent_dialogue") {
        return groundedRelationshipLine(frame, seed);
      }
      return `我想確認一下：你現在最想先處理的是${topicLabel(topic)}這塊嗎？`;
    },
    [RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY]: () => {
      const answer = buildConversationalAnswer({ inputText: nlu.inputText, frame, seed });
      if (answer) return answer;
      if (/早點睡|早点睡|該不該睡|该不该睡/.test(String(nlu.inputText || ""))) {
        return "如果你已經在打呵欠、眼睛發酸或精神往下掉，早點睡大概會比較舒服；還不睏的話，也不用逼自己立刻睡著。";
      }
      return groundedOpenConversationLine(frame, nlu, seed);
    },
    [RESPONSE_STRATEGIES.CONTEXTUAL_ACK]: () => {
      if (reflectiveCareReply) return reflectiveCareReply;
      if (conversationalReaction) return conversationalReaction;
      const need = frame.userNeed || "";
      if (topic === "relationship" && need === "boundary") {
        return "你想靠近，也願意給彼此空間。我會照這個節奏來。";
      }
      if (frame.emotionalTone === "gratitude" && (topic === "emotion" || topic === "unknown")) {
        return pick(
          ["這個小小的完成很算數。不用大聲慶祝，我心裡替你亮了一下。", "聽起來是好事。這份開心你留著慢慢用，我記下了。"],
          seed
        );
      }
      if (topic === "emotion" && need === "validation") {
        return "這份情緒我先放在這裡，不急著幫你整理成結論。";
      }
      if (topic === "work_pressure") return "工作的重量我先聽見了。你想先講壓力來源，還是先講最煩的一段？";
      if (topic === "daily_life") return groundedDailyLifeLine(frame, seed);
      if (topic === "relationship") return groundedRelationshipLine(frame, seed);
      if (topic !== "unknown") {
        return pick(
          [
            `你提到的${topicLabel(topic)}不只是背景，我會從這裡跟上。`,
            `${topicLabel(topic)}的部分我沒有略過。先照它現在的樣子放著。`
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
      reflectiveCareReply || conversationalReaction ||
      pick(["好，我先不給答案。這件事就放在這裡。", "嗯，不用講太多。我陪著，不急著收走。"], seed),
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
      if (/^(早安|午安|早呀)/.test(said)) {
        return pick(["早安。今天可以慢慢開始。", "早。湖面剛亮，不用急。", "早安，我在。先伸個懶腰再說。"], seed);
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
            "我記得你上次說累的時候。那時候我們把節奏放慢，不急著把火燒旺。",
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

export function repairGenericReply({
  strategy,
  nlu,
  semanticFrame,
  seed,
  recoveryContext,
  previousReply = ""
}) {
  const previous = normalizeReplyForComparison(previousReply);
  const candidates = [];

  for (let offset = 1; offset <= 4; offset += 1) {
    candidates.push(
      buildStrategyReply({
        strategy,
        nlu,
        semanticFrame,
        seed: seed + offset,
        recoveryContext,
        variantIndex: seed + offset
      })
    );
  }

  candidates.push(
    buildStrategyReply({ strategy, nlu, semanticFrame, seed: seed + 5, recoveryContext }),
    buildStrategyReply({
      strategy: RESPONSE_STRATEGIES.CLARIFYING_QUESTION,
      nlu,
      semanticFrame,
      seed: seed + 6,
      recoveryContext,
      variantIndex: seed + 6
    })
  );

  return (
    candidates.find(
      (candidate) => candidate && (!previous || normalizeReplyForComparison(candidate) !== previous)
    ) ||
    candidates.find(Boolean) ||
    "我在。你想我先懂的是哪一段？"
  );
}

function normalizeReplyForComparison(text = "") {
  return String(text || "")
    .replace(/\s+/g, "")
    .replace(/[，。！？、；：,.!?;:]/g, "")
    .trim();
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
  const conversationalReaction = buildConversationalReaction({ inputText: said, frame, seed: said.length });
  const conversationalAnswer = buildConversationalAnswer({ inputText: said, frame, seed: said.length });
  const ventingReply = buildVentingReply({ inputText: said, frame });
  const reflectiveCareLines = buildReflectiveCareVariants({ inputText: said, frame, mode: "support" });

  switch (strategy) {
    case RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION:
      if (conversationalAnswer) return [conversationalAnswer];
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
      if ((frame.constraints || []).includes("not_seeking_comfort")) {
        return ["好，不安慰，也不追問。", "好，我不補安慰句，也不問你問題。"];
      }
      if (/要去睡|先睡|去睡|晚安/.test(said)) {
        return ["晚安。今天就到這裡，好好睡。", "好，晚安。我把湖邊的燈調暗一點。", "嗯，去睡吧。這裡有我看著。"];
      }
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
    case RESPONSE_STRATEGIES.REFLECTIVE_CARE:
      return reflectiveCareLines.length
        ? reflectiveCareLines
        : ["好，我先聽，不急著把你的感受整理成結論。"];
    case RESPONSE_STRATEGIES.SYMBOLIC_REFLECTION:
      return buildReflectiveCareVariants({ inputText: said, frame, mode: "symbolic" });
    case RESPONSE_STRATEGIES.BOUNDARY_SET:
      return ["你想靠近，也留了退後的空間。若太快，我會先退半步。"];
    case RESPONSE_STRATEGIES.SHORT_VALIDATION:
      if (reflectiveCareLines.length) return reflectiveCareLines;
      if (ventingReply) return [ventingReply];
      if (conversationalReaction) return [conversationalReaction];
      return ["嗯，被否定會悶。我先不講大道理。", "聽起來很悶。我先陪著，不急著給建議。"];
    case RESPONSE_STRATEGIES.EMOTIONAL_SHORT:
      if (act === "apologizing") {
        return [
          "你剛剛那一下我收到了。不用急著補很多，我們可以重新對齊節奏。",
          "道歉我聽見了。先不用解釋太多，我們把距離放回剛剛剛好的位置。"
        ];
      }
      if (reflectiveCareLines.length) return reflectiveCareLines;
      if (ventingReply) return [ventingReply];
      if (conversationalReaction) return [conversationalReaction];
      if (frame.specificDetail?.type === "sleepless" || /睡不著|睡不着|失眠/.test(said)) {
        return [
          "睡不著的夜有點長。不用逼自己睡著，先把呼吸放慢就好。",
          "失眠的時候，湖邊的燈會一直亮著。你不用趕著入睡，我陪你等睏意。"
        ];
      }
      if (tone === "gratitude") {
        return [
          "這個小小的完成很算數。不用大聲慶祝，我心裡替你亮了一下。",
          "聽起來是好事。這份開心你留著慢慢用，我記下了。"
        ];
      }
      if (topic === "work_pressure") {
        const workLine = groundedWorkPressureLine(frame);
        return [workLine || "工作壓力堆上來時，先把最卡的那一段說出來就好。"];
      }
      if (topic === "physical_tiredness" || tone === "fatigue") {
        return ["累的時候，先把聲音放小也可以。", "這份累我先接住，不急著把你推去做事。"];
      }
      if (topic === "daily_life") {
        return dailyLifeLines(frame);
      }
      if (topic === "social_conflict") {
        const socialLine = groundedSocialConflictLine(frame);
        return [socialLine || "人際上的悶先放著，我不急著給你結論。"];
      }
      if (topic === "relationship") return groundedRelationshipLines(frame);
      return [`這份${tone === "sadness" ? "悶" : "感覺"}我先接住，不急著分析。`];
    case RESPONSE_STRATEGIES.CLARIFYING_QUESTION:
      if (conversationalReaction) return [conversationalReaction];
      if (topic === "unknown") return groundedOpenConversationLines(frame, nlu);
      if (topic === "relationship" && frame.conversationContext?.source === "recent_dialogue") {
        return groundedRelationshipLines(frame);
      }
      return [`我想確認一下：你現在最想先處理的是${topicLabel(topic)}這塊嗎？`];
    case RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY:
      {
        const answer = buildConversationalAnswer({ inputText: said, frame, seed: said.length });
        if (answer) return [answer];
      }
      if (/早點睡|早点睡|該不該睡|该不该睡/.test(said)) {
        return [
          "如果你已經在打呵欠、眼睛發酸或精神往下掉，早點睡大概會比較舒服；還不睏的話，也不用逼自己立刻睡著。",
          "可以先看身體的訊號：累了就早點收尾，還有精神也不用把睡覺變成命令。"
        ];
      }
      return groundedOpenConversationLines(frame, nlu);
    case RESPONSE_STRATEGIES.CONTEXTUAL_ACK:
      if (reflectiveCareLines.length) return reflectiveCareLines;
      if (conversationalReaction) return [conversationalReaction];
      if (topic === "relationship" && need === "boundary") {
        return ["你想靠近，也願意給彼此空間。我會照這個節奏來。"];
      }
      if (tone === "gratitude" && (topic === "emotion" || topic === "unknown")) {
        return ["這個小小的完成很算數。不用大聲慶祝，我心裡替你亮了一下。", "聽起來是好事。這份開心你留著慢慢用，我記下了。"];
      }
      if (topic === "emotion" && need === "validation") {
        return ["這份情緒我先放在這裡，不急著幫你整理成結論。"];
      }
      if (topic === "work_pressure") return ["工作的重量我先聽見了。你想先講壓力來源，還是先講最煩的一段？"];
      if (topic === "daily_life") return dailyLifeLines(frame);
      if (topic === "relationship") return groundedRelationshipLines(frame);
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
      if (reflectiveCareLines.length) return reflectiveCareLines;
      if (conversationalReaction) return [conversationalReaction];
      return ["好，我先不給答案。這件事就放在這裡。", "嗯，不用講太多。我陪著，不急著收走。"];
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
      if (/^(早安|午安|早呀)/.test(said)) {
        return ["早安。今天可以慢慢開始。", "早。湖面剛亮，不用急。", "早安，我在。先伸個懶腰再說。"];
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
          "我記得你上次說累的時候。那時候我們把節奏放慢，不急著把火燒旺。",
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
  if (/捷運|地鐵|地铁|公車|公交|坐過站|坐过站/.test(detail)) {
    return [
      `差點坐過站真的會讓人瞬間清醒。你這段${detail.includes("糗") ? "糗事" : "插曲"}我收到了。`,
      "發現坐過站的那一刻真的會瞬間清醒；既然最後趕上了，這個小插曲現在可以笑一下。"
    ];
  }
  if (/晚餐|午餐|早餐|便當|便当|青菜|冷掉|難吃|难吃/.test(detail)) {
    return [
      "便當已經難吃了，青菜還冷掉，這頓真的很敷衍人。",
      "晚餐踩雷就算了，連青菜都是冷的；難怪會想抱怨兩句。"
    ];
  }
  if (/想來找你講兩句|想来找你讲两句|想聊兩句|想聊两句|沒發生什麼|没发生什么/.test(detail)) {
    return [
      "沒發生什麼也可以來講兩句。普通的一天不需要先變成故事。",
      "你只是想來找我說說話，我懂。今天平平的也沒關係。"
    ];
  }
  if (/不知道要幹嘛|不知道要干嘛/.test(detail)) {
    return [
      "沒有難過，只是不知道要幹嘛——那就先別急著替空白找用途。",
      "這比較像沒方向，不一定是難過。先發呆一下也成立。"
    ];
  }
  if (/荒謬|荒谬/.test(detail)) {
    return [
      "光聽你說有夠荒謬，我就有點想知道今天到底演到哪一齣。",
      "今天看來很有戲。這個荒謬程度，是能笑的還是只想翻白眼的？"
    ];
  }
  if (/週末|周末|收假|放假/.test(detail)) {
    return [
      "週末咻一下就過完，很正常。明天的事讓明天扛，今晚先慢慢收尾。",
      "收假前的悶我懂。先不急著切回上班模式，這裡的節奏還是你的。"
    ];
  }
  if (/下雨|天氣|天气|好熱|好热|好冷/.test(detail)) {
    return [
      "下雨天就適合懶懶的。不想出門就窩著，湖邊今天也很安靜。",
      "這種天氣本來就會把人變慢。你就照這個速度過今天，可以的。"
    ];
  }
  if (/追劇|追剧|耍廢|耍废/.test(detail)) {
    return [
      "追劇耍廢的日子也算數。休息不需要理由，我不會催你。",
      "整天耍廢聽起來剛剛好。有些日子本來就是拿來浪費的。"
    ];
  }
  if (/滑手機|滑手机/.test(detail)) {
    return [
      "滑到空空的感覺我懂。先把手機放遠一點，讓眼睛和心都歇一下。",
      "睡前滑太久很容易越滑越空。先放下來，聽一下湖水的聲音也可以。"
    ];
  }
  if (/無聊|无聊|發呆|发呆/.test(detail)) {
    return [
      "無聊也可以是一種休息。不知道要幹嘛的時候，先陪我發呆一下也行。",
      "不用急著找事做。敢無聊，其實是一種本事。"
    ];
  }
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

function groundedRelationshipLine(frame = {}, seed = 0) {
  return pick(groundedRelationshipLines(frame), seed);
}

function groundedRelationshipLines(frame = {}) {
  const detail = frame.specificDetail?.text || "";
  if (/朋友|怪怪|想太多|疏遠/.test(detail)) {
    return [
      "朋友最近怪怪的，又怕只是自己想太多，這種拿不準最磨人。先別急著替關係下結論。",
      "你有注意到朋友不太一樣，但還留著『也可能是我想太多』的空間。可以先看看是哪個細節讓你起疑。"
    ];
  }
  if (frame.conversationContext?.source === "recent_dialogue") {
    return [
      "嗯，我接得上。你後來又想了一下剛才那件事，現在看起來有哪裡不一樣？",
      "剛才那段關係上的不確定還在。你想了一下之後，比較靠近哪個感覺了？"
    ];
  }
  // De-meta (TP-WQ1): avoid classifier-flavored「我有接到」— keep grounding only.
  // Put grounding words in the first clause so short_quiet persona still feels human.
  return [
    "先不用急著定義關係裡那個拿不準的地方。",
    "可以先放著朋友之間這種不確定，不必立刻下結論。"
  ];
}

function groundedOpenConversationLine(frame = {}, nlu = {}, seed = 0) {
  return pick(groundedOpenConversationLines(frame, nlu), seed);
}

function groundedOpenConversationLines(frame = {}, nlu = {}) {
  const constraints = frame.constraints || nlu.constraints || [];
  const context = frame.conversationContext || {};
  if (constraints.includes("no_questions")) {
    return [
      "好，先讓它停在這裡。我不整理，也不催你往下說。",
      "先放著就好。我不追問，也不急著替你找結論。"
    ];
  }
  if (frame.emotionalTone === "gratitude" || frame.emotionalTone === "positive") {
    return [
      "這確實值得開心一下。事情不必很大，感覺才算數。",
      "這種小小的亮點很好。先讓開心留一會兒，不用急著解釋。"
    ];
  }
  if (context.source === "recent_dialogue") {
    return [
      "原來後面還有這一層。先不用急著替整件事下結論。",
      "這讓前面的事多了一個轉折。我跟得上，你照自己的速度說。"
    ];
  }
  // De-meta (TP-WQ1): drop「原來事情是這樣…」bot summary tone.
  // First clause carries grounding so maxSentences=1 still reads as presence.
  return [
    "先聽著就好，這個轉折有點出乎意料。",
    "先不用急著下結論，事情好像拐了一個彎。"
  ];
}

function groundedWorkPressureLine(frame = {}) {
  const detail = frame.specificDetail?.text || "";
  if (!detail) return null;
  if (/老闆|任務|丟/.test(detail)) {
    return "老闆一直丟任務的壓力我先聽見了。你想先講最煩的一段，還是先講今天最卡的地方？";
  }
  if (/做不完/.test(detail)) {
    return "事情做不完的那種壓力我聽見了。先不用全部扛起來，我們挑最卡的一件先說。";
  }
  if (/壓力|压力/.test(detail)) {
    return `你說的「${truncateDetail(detail)}」我先聽見了。你想先講壓力來源，還是先講最煩的一段？`;
  }
  return null;
}

function groundedSocialConflictLine(frame = {}) {
  const detail = frame.specificDetail?.text || "";
  if (!detail) return null;
  if (/酸|否定|罵|拒絕/.test(detail)) {
    return `被人${detail.includes("酸") ? "酸" : "否定"}的悶我先放著，不急著給你結論。`;
  }
  if (/悶/.test(detail)) {
    return "心裡悶悶的這份感覺我先接住，不急著分析。";
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
