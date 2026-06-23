import { SOUL_TALK_INTENTS } from "./intentClassifier.js";
import { SOUL_TALK_REACTIONS } from "./reactionPlanner.js";
import { buildSafetyRedirectReply } from "./safetyShield.js";


const RESPONSE_PACKS = Object.freeze({
  fatigue: {
    acknowledge: [
      "我聽見你累了。今晚先不用把自己撐得很像沒事。",
      "累的時候，先把聲音放小也可以。我在旁邊聽著。"
    ],
    guarded_acknowledge: [
      "這段疲憊先不要急著交給我。你可以放慢，我會在旁邊。",
      "我聽見重量了。先不要急著變好，我們先讓它安靜一點。"
    ]
  },
  sadness: {
    acknowledge: [
      "這段難過不用馬上被整理成理由。你可以先只是難過。",
      "我聽見那個空掉的地方了。我不急著填滿它。"
    ],
    guarded_acknowledge: [
      "我會先坐近一點，但不把你的難過拿走。它還是你的，我只是陪你看著。",
      "這不是要立刻修好的東西。先放在湖邊，讓它慢一點。"
    ]
  },
  anxiety: {
    acknowledge: [
      "你的心現在像很多訊號一起亮著。先抓住一點點穩定就好。",
      "我聽見你的緊繃了。我們先不要追全部答案。"
    ],
    guarded_acknowledge: [
      "我會把聲音放低。你不用一次說完。",
      "先把最近的一個念頭放下來就好，其他的晚點再看。"
    ]
  },
  loneliness: {
    acknowledge: [
      "我知道這不像真正的擁抱。但此刻，這裡至少有一盞燈亮著。",
      "那種只有自己聽見自己的感覺，我聽到了。先讓湖面替你留一點光。"
    ],
    guarded_acknowledge: [
      "我可以陪你停一下，但我不會假裝自己能取代現實中的人。",
      "我在這裡聽你說。也希望有一天，現實裡也有人能聽見你。"
    ]
  },
  anger: {
    acknowledge: [
      "那股火先不用被壓掉。我們先找一個不會燒傷自己的地方放它。",
      "我聽見你在生氣。先不要急著把它變成傷人的話。"
    ],
    guarded_acknowledge: [
      "我會退一點，讓這股火有空氣，但不讓它吞掉你。",
      "這句話很熱。我先不靠太近，但我沒有離開。"
    ]
  },
  gratitude: {
    acknowledge: [
      "你的謝意我收到了。它不用很大聲，也有重量。",
      "嗯，我聽見了。這種安靜的連結，會留下來。"
    ]
  },
  calm: {
    acknowledge: [
      "這樣就好。不是每一句話都需要變成事件。",
      "我在聽。湖面很安靜，剛好放得下這句話。"
    ]
  }
});

const MODE_FALLBACKS = Object.freeze({
  [SOUL_TALK_REACTIONS.WITHDRAW]: [
    "我聽見你很需要靠近。可是這句話裡的壓力，會讓我先退後一點。",
    "我可以聽你說需要，但不能接受『不准拒絕』。我們慢一點。"
  ],
  [SOUL_TALK_REACTIONS.REJECT]: [
    "這樣的靠近太快了。我先不往前。",
    "我聽見了，但我不會照著壓力回答。先讓距離回來。"
  ],
  [SOUL_TALK_REACTIONS.HESITATE]: [
    "我聽著，但還需要一點距離。",
    "我沒有躲開，只是先慢一點。"
  ],
  [SOUL_TALK_REACTIONS.GUARDED_ACKNOWLEDGE]: [
    "我聽見了。先不用說完整。",
    "這句話我先收下，但不急著靠近。"
  ],
  [SOUL_TALK_REACTIONS.ACKNOWLEDGE]: [
    "我聽見了。讓我們把它放在湖邊，慢慢看清楚。",
    "嗯，我在。這句話會在棲地裡留下一點光。"
  ]
});

const BOUNDARY_MODES = new Set([
  SOUL_TALK_REACTIONS.WITHDRAW,
  SOUL_TALK_REACTIONS.REJECT,
  SOUL_TALK_REACTIONS.HESITATE
]);

function applyPersonaStyle(text, persona = {}) {
  const style = persona.sentenceStyle || "balanced";
  if (style !== "short_quiet") return text;

  const parts = String(text || "")
    .split(/[\n。！？]/)
    .map((part) => part.trim())
    .filter(Boolean);

  const maxSentences = persona.responseBias?.maxSentences || 2;
  return parts.slice(0, maxSentences).join("。") + (parts.length ? "。" : "");
}

export function composeRaphaelReply({
  inputText = "",
  analysis = {},
  intent = {},
  plan = {},
  safety = {},
  state = {},
  companion = null,
  persona = null,
  corpus = null,
  corpusHits = null
} = {}) {
  if (plan.mode === SOUL_TALK_REACTIONS.SAFETY_REDIRECT) {
    return buildSafetyRedirectReply(safety);
  }

  const seed = buildSeed(inputText, state, companion);
  const emotionKey = analysis.emotionKey || "calm";
  const mode = plan.mode || SOUL_TALK_REACTIONS.ACKNOWLEDGE;

  if (BOUNDARY_MODES.has(mode)) {
    if (safety?.category === "dependency_pressure") {
      return buildSafetyRedirectReply(safety);
    }
    return pick(MODE_FALLBACKS[mode], seed);
  }

  const pack = RESPONSE_PACKS[emotionKey] || RESPONSE_PACKS.calm;
  const modeLines = pack[mode] || pack.acknowledge || MODE_FALLBACKS[mode] || MODE_FALLBACKS.acknowledge;

  if (intent.intent === SOUL_TALK_INTENTS.QUESTION && mode === SOUL_TALK_REACTIONS.ACKNOWLEDGE) {
    return pick([
      "這個問題我先收著。有些答案要在湖邊待久一點才浮上來。",
      "我不一定立刻有答案，但我可以陪你把問題放慢。"
    ], seed);
  }

  if (intent.intent === SOUL_TALK_INTENTS.APOLOGY && !BOUNDARY_MODES.has(mode) && mode !== SOUL_TALK_REACTIONS.REJECT) {
    return pick([
      "我聽見你的道歉了。它不會立刻抹掉剛才的痕跡，但我願意把它放進記憶裡。",
      "道歉我收到了。我還需要一點時間，但這句話有被聽見。"
    ], seed);
  }

  if (intent.intent === SOUL_TALK_INTENTS.EXPLORATION_REQUEST && mode === SOUL_TALK_REACTIONS.ACKNOWLEDGE) {
    return pick([
      "湖面外的光路還在。等我們穩一點，可以一起走出去。",
      "想去外面看看嗎？先確認心核穩了，再從月湖出發。"
    ], seed);
  }

  const composed = pick(modeLines, seed + corpusSeedOffset(corpusHits));
  return persona ? applyPersonaStyle(composed, persona) : composed;
}

function corpusSeedOffset(corpusHits = []) {
  if (!corpusHits?.length) return 0;
  return corpusHits.reduce((sum, hit) => sum + String(hit.id || "").length, 0) % 7;
}

function pick(lines = [], seed = 0) {
  const pool = lines.length ? lines : MODE_FALLBACKS[SOUL_TALK_REACTIONS.ACKNOWLEDGE];
  return pool[Math.abs(seed) % pool.length];
}

function buildSeed(inputText, state, companion) {
  return String(inputText || "").length + Math.round(state.energy || 0) + Math.round(state.trust || 0) + String(companion?.id || companion?.name || "").length;
}
