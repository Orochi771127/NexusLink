const SYMBOLIC_LANGUAGE = /意象|象徵|象征|夢|梦|陰影|阴影|面具|原型|天氣|天气|顏色|颜色|房間|房间/;
const SYMBOLIC_INVITATION = /(?:想|可以|能不能|陪我|幫我|帮我|試著|试着).{0,12}(?:看看|探索|整理|聊|理解|想像|想象)|(?:代表|意思|怎麼看|怎么看)/;
const REFLECTIVE_INVITATION = /想.{0,8}(?:被聽見|被听见|整理.{0,4}(?:感受|心情)|理一理)|(?:先|可以|能不能).{0,8}(?:聽我說|听我说|陪我整理|不要急著給建議|不要急着给建议)/;
const NO_QUESTION_LANGUAGE = /不要問|不要问|不想回答|只想說|只想说|先聽就好|先听就好/;
const PRIVATE_CARE_STRATEGIES = new Set(["reflective_care", "symbolic_reflection"]);

export function isPrivateCareStrategy(strategy = "") {
  return PRIVATE_CARE_STRATEGIES.has(String(strategy || ""));
}

export function shouldUseSymbolicReflection({ inputText = "", frame = {} } = {}) {
  const text = String(inputText || "");
  const constraints = frame.constraints || [];
  if (constraints.includes("no_questions") || NO_QUESTION_LANGUAGE.test(text)) return false;
  if (/不想|不要/.test(text) && SYMBOLIC_LANGUAGE.test(text)) return false;

  if (/陰影|阴影|面具|原型/.test(text)) return SYMBOLIC_INVITATION.test(text) || /[？?]/.test(text);
  if (/夢到|梦到|夢裡|梦里/.test(text)) {
    return /代表|意思|怎麼看|怎么看|想聊|一直記得|一直记得|醒來|醒来/.test(text);
  }
  if (/如果.{0,12}(?:感受|心情|情緒|情绪).{0,12}(?:天氣|天气|顏色|颜色|房間|房间|動物|动物)/.test(text)) {
    return true;
  }
  return SYMBOLIC_LANGUAGE.test(text) && SYMBOLIC_INVITATION.test(text);
}

export function shouldUseReflectiveCare({ inputText = "", frame = {} } = {}) {
  const text = String(inputText || "");
  const constraints = frame.constraints || [];
  if (constraints.includes("not_seeking_comfort")) return false;
  return REFLECTIVE_INVITATION.test(text);
}

export function buildReflectiveCareVariants({ inputText = "", frame = {}, mode = "support" } = {}) {
  const text = String(inputText || "");
  const constraints = frame.constraints || [];
  const noQuestions = constraints.includes("no_questions") || NO_QUESTION_LANGUAGE.test(text);

  if (mode === "symbolic") return buildSymbolicVariants(text, noQuestions);

  if (/裝作沒事|装作没事|假裝沒事|假装没事|一直撐|一直撑/.test(text)) {
    return [
      "你像是把「我沒事」撐在外面，裡面那一部分已經很累了。先不用把它收好。",
      "一直維持沒事的樣子，本身就很耗力。現在可以先讓那個撐著的部分歇一下。"
    ];
  }
  if (/委屈|被忽略|沒人看見|没人看见|不被在意/.test(text)) {
    return [
      "真正刺到你的，好像不只那件事，而是你的感受一直沒有被放進來。",
      "那份委屈像是在說：事情發生了，卻沒有人把你的感受算進去。"
    ];
  }
  if (/生氣|生气/.test(text) && /懷疑自己|怀疑自己|太敏感|是不是我/.test(text)) {
    return [
      "你一邊生氣，一邊又開始檢查是不是自己太敏感。兩股力一起拉著，會很累。",
      "生氣已經很耗力了，還要反過來懷疑自己，難怪心裡一直鬆不下來。"
    ];
  }
  if (/不知道怎麼辦|不知道怎么办|不知道該怎麼|不知道该怎么/.test(text)) {
    if (noQuestions) return ["現在不知道怎麼辦也可以。先不逼自己做決定，我把這段聽完。"];
    return [
      "我們先不解決全部。你現在比較想把話說完，還是一起找一個能回頭調整的小步驟？",
      "先不用立刻選對答案。你想先被聽見，還是一起把眼前的一小步看清楚？"
    ];
  }
  if (shouldUseReflectiveCare({ inputText: text, frame })) {
    if (noQuestions) {
      return ["好，我先聽，不追問，也不急著把你的感受整理成結論。"];
    }
    return [
      "可以。你先照自己的順序說，我會先聽懂，再決定要不要一起整理。",
      "好，我不急著給建議。你可以先把最佔空間的那一段放下來。"
    ];
  }
  return [];
}

export function buildReflectiveCareReply({ inputText = "", frame = {}, mode = "support", seed = 0 } = {}) {
  const lines = buildReflectiveCareVariants({ inputText, frame, mode });
  if (!lines.length) return null;
  return lines[Math.abs(seed) % lines.length];
}

function buildSymbolicVariants(text, noQuestions) {
  if (noQuestions) {
    return ["好，我不替這個意象下結論。你可以只讓它待在這裡，不需要現在解釋。"];
  }
  if (/夢到|梦到|夢裡|梦里/.test(text)) {
    return [
      "我不替這個夢下結論。醒來後還留在你心裡的，是哪一個畫面？",
      "夢不一定只有一個答案。先從你的聯想開始：哪個畫面最有重量？"
    ];
  }
  if (/陰影|阴影/.test(text)) {
    return [
      "我不會把「陰影」當成邪惡的一面。若你願意，可以看看那個平常不被允許出現的部分想保護什麼。",
      "陰影不等於壞。它也可能是被你藏起來的需要、力量或怒氣；你最先想到的是哪一種？"
    ];
  }
  if (/面具/.test(text)) {
    return [
      "如果你今天一直戴著「我沒事」的面具，拿下來之後，哪一部分最想休息？",
      "面具也許曾經保護過你。我比較想知道：現在戴著它，最累的是哪一部分？"
    ];
  }
  if (/顏色|颜色/.test(text)) {
    return ["可以。若這份感受先不叫名字，只變成一種顏色，它現在會是什麼？"];
  }
  if (/房間|房间/.test(text)) {
    return ["如果這份感受是一個房間，你會先注意到光、門，還是最不想靠近的角落？"];
  }
  return [
    "可以把它當成意象看看，但由你決定它的意思。這份感受現在比較像哪一種天氣？",
    "我們不急著分析。若這份感受先變成一個畫面，最先出現的是什麼？"
  ];
}
