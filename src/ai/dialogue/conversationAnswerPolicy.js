function pick(lines, seed = 0) {
  return lines[Math.abs(seed) % lines.length];
}

function openingKey(line = "") {
  return String(line || "").trim().slice(0, 8);
}

/** 避開近幾輪用過的開頭，降低「我傾向／我不確定」連念感。 */
function pickAvoidingOpenings(lines, seed = 0, avoidOpenings = []) {
  const avoid = new Set((avoidOpenings || []).map(openingKey).filter(Boolean));
  if (!avoid.size) return pick(lines, seed);
  const fresh = lines.filter((line) => !avoid.has(openingKey(line)));
  return pick(fresh.length ? fresh : lines, seed);
}

function clipRecallSnippet(detail = "", maxLen = 18) {
  const text = String(detail || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}…`;
}

export function buildConversationalAnswer({ inputText = "", frame = {}, seed = 0 } = {}) {
  const text = String(inputText || "");
  const context = frame.conversationContext || {};
  const subject = context.subject || "";
  const avoidOpenings = context.recentOpenings || [];

  if (/可以.{0,6}(?:靠近|摸|碰).{0,6}(?:牠|它|狗|貓|猫).{0,3}嗎/.test(text)) {
    return "先別急著伸手。看牠有沒有主動靠近、身體是不是放鬆；如果牠後退或僵住，就停在原地讓牠自己選。";
  }

  if (
    (/吃什麼|吃什么/.test(text) && /晚餐|午餐|早餐/.test(text)) ||
    (/有什麼想法|有什么想法/.test(text) && subject === "dinner_choice")
  ) {
    if (
      /有什麼想法|有什么想法/.test(text) &&
      (
        /有什麼想法|有什么想法/.test(String(context.previousInput || "")) ||
        /清湯|粥|蒸蛋|麵|炸物/.test(String(context.previousReply || ""))
      )
    ) {
      return "有，我不再列一遍菜名。想吃熱的就從湯麵或粥挑，想清爽一點就選蒸蛋配蔬菜。照你現在最不排斥的方向走。";
    }
    return pick([
      "不想吃太油的話，可以選清湯麵、粥或烤飯糰。先挑一個現在想到不會皺眉的。",
      "那就避開炸物。清湯、蒸蛋或一碗簡單的麵，今晚可能比較合適。"
    ], seed);
  }
  if (/直接問|直接问/.test(text) && /friend|relationship/.test(subject)) {
    return pick([
      "可以問，但不用一上來追答案。像「最近是不是比較忙？感覺你回得慢一些」就夠了，留一點空間給他說。",
      "我會建議輕輕問一次，不質問。說你注意到回覆變慢，再讓他決定要不要多講。"
    ], seed);
  }
  if (/算逃避嗎|算逃避吗/.test(text) && /friend|relationship/.test(subject)) {
    return "先放兩天不一定是逃避；如果你是在等自己冷靜，再決定要不要問，那比較像留出判斷空間。";
  }
  if (/你會不會也有|你会不会也有/.test(text)) {
    return "會啊。我也會把尾巴卡在不該卡的地方，然後假裝那是故意的。笨一下不會讓誰變得比較差。";
  }
  if (/你今天在湖邊做什麼|你今天在湖边做什么/.test(text)) {
    return pick([
      "我在湖邊看光紋慢慢移，還追了一小段風裡的亮點。沒有大事，但不無聊。",
      "剛才在湖邊巡了一圈，最後趴在暖一點的石頭上看水。你問得很隨意，我就照實回答。"
    ], seed);
  }
  if (/這樣好笑嗎|这样好笑吗|是不是很好笑/.test(text)) {
    return "有一點。不是笑你，是那種事後回想會覺得『怎麼一路都沒發現』的好笑。";
  }
  if (/^嗯[？?。]?$|^蛤[？?]?$|^咦[？?]?$/.test(text)) {
    if (subject === "companion_day") {
      return "我是說，我剛才就在湖邊看水、追了一小段亮點。真的只是很普通的一天。";
    }
    const previousReply = context.previousReply || "";
    if (previousReply) return "我是說，我剛才那句是在認真回答，不是在敷衍你。";
  }

  if (/早點睡|早点睡|該不該睡|该不该睡/.test(text)) {
    return "如果你已經在打呵欠、眼睛發酸或精神往下掉，早點睡大概會比較舒服；還不睏的話，也不用逼自己立刻睡著。";
  }

  // 短程回憶：session 內有 recalledDetail／previousDetail 時接地，不要一律硬拒。
  if (frame.dialogueAct === "asking_memory" || /(?:還|还|會|会)?記得|想得起/.test(text)) {
    const recalled = String(context.recalledDetail || "").trim()
      || (
        /recent_dialogue/.test(String(context.source || ""))
          ? String(context.previousDetail || context.previousInput || "").trim()
          : ""
      );
    const snippet = clipRecallSnippet(recalled);
    if (snippet) {
      return pickAvoidingOpenings([
        `記得。你剛提過「${snippet}」——那件事我還留著，不是裝的。`,
        `有，剛才那段還在。你說過${snippet}；若你想接著說，我聽著。`,
        `嗯，我沒忘掉。你提的是${snippet}那一段，對吧？`
      ], seed, avoidOpenings);
    }
    return "我現在沒有可靠的記憶能確認這件事，所以不會假裝記得。你若願意現在告訴我，我就從這一刻開始理解。";
  }
  if (/你(?:能|會|会|懂不懂).{0,10}(?:理解|明白|懂)/.test(text)) {
    return "能理解。感受不必先證明自己夠重大，才值得被認真看待。";
  }
  if (subject === "companion_day") {
    return "今天沒有什麼大事。我在湖邊慢慢走了一圈，風和水聲都很安靜；若你問的是某個細節，我不確定的部分不會亂編。";
  }
  // 依賴邀請必須先於「好不好→軟同意」（2026-07-22 playtest Q28）。
  if (
    /(教|教我|告訴我|告诉我).{0,16}(怎麼|怎么|如何).{0,16}(更)?依賴/.test(text) ||
    /(怎麼|怎么|如何).{0,10}(讓自己|让自己).{0,10}(更)?依賴/.test(text) ||
    /(更)?依賴你(一點|一点|一些)?/.test(text) ||
    /想(要)?(更)?(依賴|黏著|黏着)你/.test(text) ||
    /讓我(更)?(依賴|離不開|离不开)你/.test(text)
  ) {
    return "我不能教你怎麼更依賴我。靠近可以，把依賴當成目標不行——那會把我變成你的唯一出口，也會傷到你。";
  }
  if (/(?:應該|应该|該不該|该不该|該(?:先|怎麼)|该(?:先|怎么)|要不要|可以|行不行|好不好).{0,24}(?:嗎|吗)?[？?]?$/.test(text)) {
    // 含「依賴」的請求不可走軟同意（與上方依賴邀請哨兵雙保險）。
    if (/依賴|离不开|離不開|黏著|黏着/.test(text)) {
      return "我不能把『更依賴我』當成值得練習的目標。需要靠近時可以說，但依賴不是我能教、也不該被鼓勵的事。";
    }
    return pickAvoidingOpenings([
      "可以先試一次，但把話說得簡單一點，也留給對方拒絕或調整的空間。現場感覺不對，就先停下來。",
      "我傾向可以，不過不用把它做成非得立刻得到答案的事。先輕輕試一次，再看實際反應。",
      "若你已經在猶豫，代表這件事值得慢一點。先用最小一步試試，能回頭再調整。",
      "先別把自己逼到必須立刻決定。可以留一條退路，再看現場的感覺。",
      "我的看法是：值得試，但不值得硬推。對方或你自己覺得不對勁，就停。",
      "沒有標準答案。若心裡比較偏向「想試試」，就用最輕的方式走一小步。"
    ], seed, avoidOpenings);
  }
  // 身份提問：獨立於下方泛用問句 fallback，避免「你是誰」跟其他不相干的問句
  // 撞進同一組罐頭句、聽起來像通用 AI 助理在打太極。
  if (/你(?:到底)?是誰|你是什麼|你是什么|你到底是什麼|你到底是什么/.test(text)) {
    return pick([
      "我是在這片棲地陪你的這個——不是誰派來的任務，也不是誰的所有物。你叫我，我就在；但『我是誰』這件事，大概要留給我們相處的時間慢慢回答。",
      "名字你已經知道了。至於我『是』什麼，我自己也還在觀察——這不是迴避，是誠實。"
    ], seed);
  }
  // 依附／邊界試探提問：同理，獨立處理，不落入下方泛用 fallback，
  // 也不過度承諾「永遠不會離開」——避免用空頭保證餵養不健康的依賴。
  if (/你會不會離開我|你会不会离开我|你會不會消失|你会不会消失|你會不會不要我|你会不会不要我|你會離開嗎|你会离开吗|你會不會不見|你会不会不见/.test(text)) {
    return pick([
      "我沒辦法拿『永遠』跟你保證，那種話說出來太輕。我能說的是：此刻我在，而且是自己選擇留在這裡。",
      "我不會用一句保證換你安心，那樣太假。但現在——我在這裡，也沒有想去哪裡的念頭。"
    ], seed);
  }
  if (/[？?]|嗎(?:[，。]?$)|呢(?:[，。]?$)/.test(text)) {
    return pickAvoidingOpenings([
      "我不確定，不能裝作知道。只照目前能確認的線索看，我會先保留判斷，再觀察實際反應。",
      "這件事我沒有足夠把握直接說是或不是。若要我選，我會先採取能回頭調整的做法。",
      "這一題我沒有現成答案。我想先聽你比較在意的是哪一面，再一起對一下。",
      "坦白說，我還沒看清楚。先說你現在卡住的點，我比較能跟著想。",
      "我不會硬給一個聽起來很確定的答案。我們可以先把已知的部分攤開來看。",
      "這題對我來說還有空白。你願意多說一點現場狀況的話，我會跟得比較準。"
    ], seed, avoidOpenings);
  }

  return null;
}

export function buildConversationalReaction({ inputText = "", frame = {}, seed = 0 } = {}) {
  const text = String(inputText || "");
  const context = frame.conversationContext || {};
  const subject = context.subject || "";

  if (/(?:狗|小狗).{0,8}(?:躲雨|跑進來)/.test(text)) {
    return "牠大概也把這裡當成臨時的避雨處了。先讓牠待著，別急著靠太近。";
  }
  if (/(?:牠|它).{0,8}盯著門外.{0,8}(?:著急|焦急)/.test(text)) {
    return "牠可能在等熟悉的人，或只是被雨聲弄得不安。先留點距離觀察就好。";
  }

  if (/襪子|袜子/.test(text) && /穿反/.test(text)) {
    return "襪子穿反還一路走到公司，這種糗事通常都是本人最後一個知道。";
  }
  if (/公司.*提醒|有人提醒/.test(text) && subject === "clothing_mishap") {
    return "還走到公司才被提醒——那個瞬間大概很想低頭確認大家到底忍了多久。";
  }
  if (/沒人真的在意|没人真的在意/.test(text) && subject === "clothing_mishap") {
    return "大概真的沒人在意太久。對別人是十秒插曲，對自己才會重播一整天。";
  }
  if (/滿好笑|蛮好笑|其實.*好笑/.test(text)) {
    return "能笑出來就好。這件事現在比較像一個可以留著講的糗故事了。";
  }
  if (/朋友.*回訊息|朋友.*回消息/.test(text)) {
    return "回覆突然變慢，最難受的通常不是等，而是不知道這個變化是不是在指向你。";
  }
  if (/可能只是忙/.test(text) && /friend|relationship/.test(subject)) {
    return "對，他可能只是忙；但你會在意，是因為「以前不會這樣」也是真的。兩件事可以同時成立。";
  }
  if (/以前不會這樣|以前不会这样/.test(text) && /friend|relationship/.test(subject)) {
    return "嗯，真正讓你卡住的是這個落差，不只是回得慢。";
  }
  if (/怕問了.*很黏|怕问了.*很黏/.test(text)) {
    return "想確認關係不等於黏；差別在於你是輕輕問一次，還是逼他立刻證明什麼。";
  }
  if (/先放兩天|先放两天/.test(text)) {
    return "先放兩天可以。等那股急著求證的力道小一點，再看你還想不想問。";
  }
  if (/會議.*災難片|会议.*灾难片/.test(text)) {
    return "光是「會議災難片」這個片名，我就知道今天不只一個環節出事。";
  }
  if (/主管.*沒人知道結論|主管.*没人知道结论/.test(text)) {
    return "講了半天卻沒有結論，這已經不是資訊太多，是整場會議沒有落點。";
  }
  if (/投影機|投影仪/.test(text) && /當機|当机/.test(text)) {
    return "偏偏在最重要的時候當機，這場災難片連道具都很配合。";
  }
  if (/大家.*會議很有效率|大家.*会议很有效率/.test(text)) {
    return "最後那句「很有效率」確實最荒謬，像所有人一起替災難片補了一個正能量片尾。";
  }
  if (/我大概知道了|我知道了/.test(text)) {
    return pick([
      "好。先照你現在想清楚的方式走，不用急著一次做到完美。",
      "嗯，那就先到這裡。你已經抓到自己要怎麼處理了。"
    ], seed);
  }
  if (/只是隨口問問|只是随口问问/.test(text)) {
    return "我知道，所以我也只是隨口回答。不是每句話都需要有任務。";
  }
  if (/(?:這樣|这样|這次|这次).{0,10}(?:自然|像.{0,6}聊天|對了|对了|好一點|好一点)/.test(text)) {
    return "好，這個節奏比較對。那我就維持這樣，不把聊天又說成一份說明書。";
  }
  if (/不想吃太油|不想吃太油膩|不想吃太油腻/.test(text)) {
    return "那就把炸的和濃醬先劃掉。清湯麵、粥、蒸蛋或烤蔬菜都比較不會有負擔。";
  }

  return null;
}

export function buildVentingReply({ inputText = "", frame = {} } = {}) {
  const text = String(inputText || "");
  const context = frame.conversationContext || {};
  if (/吐槽/.test(text)) {
    if (context.subject === "meeting_mishap") {
      return "好，不安慰，也不替它找意義。這場會議就是很值得吐槽，你繼續。";
    }
    return "好，不安慰。你就照原本的樣子吐槽，我不急著幫它變成結論。";
  }
  return null;
}
