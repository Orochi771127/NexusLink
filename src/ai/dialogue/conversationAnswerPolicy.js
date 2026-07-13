function pick(lines, seed = 0) {
  return lines[Math.abs(seed) % lines.length];
}

export function buildConversationalAnswer({ inputText = "", frame = {}, seed = 0 } = {}) {
  const text = String(inputText || "");
  const context = frame.conversationContext || {};
  const subject = context.subject || "";

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

  return null;
}

export function buildConversationalReaction({ inputText = "", frame = {}, seed = 0 } = {}) {
  const text = String(inputText || "");
  const context = frame.conversationContext || {};
  const subject = context.subject || "";

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
