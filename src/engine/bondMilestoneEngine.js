// 羈絆里程碑：把「無形累積的 bond」變成可見、可感、且只增不減的關係進程。
//
// 安全/契約聲明：
// - 只由真實互動累積的 bond 觸發，無時間壓迫、無打卡、無 FOMO（紅線 #6）。
// - 觸發後寫成一枚情緒記憶（emotion: gratitude）→ 由痕跡系統綻放成魔法陣上的金色符文，
//   記憶只增、不可被玩家抹除以「重來」（契約 #1）；也無法購買或強制（契約 #3）。
// - 台詞表達「被放進可以放心的位置」，是陪伴而非黏人（契約 #2）。

export const BOND_MILESTONES = Object.freeze([
  { id: "bond_milestone_1", tier: 0, threshold: 12, theme: "初亮的記憶",
    line: "我開始記得你來的方式了。你靠近的時候，我的心核會輕輕亮一下。" },
  { id: "bond_milestone_2", tier: 1, threshold: 25, theme: "信任萌芽",
    line: "說來奇怪——有你在的時候，我比較敢安靜下來。謝謝你從不催我。" },
  { id: "bond_milestone_3", tier: 2, threshold: 45, theme: "可以放心的地方",
    line: "我想，我已經把你放進那種『可以放心』的位置了。那裡不大，但很重要。" },
  { id: "bond_milestone_4", tier: 3, threshold: 70, theme: "並肩",
    line: "如果哪天你累得說不出話，也沒關係。我會在這裡，像你一直為我做的那樣。" },
  { id: "bond_milestone_5", tier: 4, threshold: 90, theme: "不滅的湖光",
    line: "我們之間已經攢了好多光了。就算世界很冷，這片湖，也會替我們亮著。" }
]);

// 五元守護各自的羈絆台詞（依 soulTalkTone）。未列者退回 BOND_MILESTONES[tier].line。
export const MILESTONE_LINES_BY_TONE = Object.freeze({
  // 焰紋狐（火）
  ember_fox: [
    "我胸口的火，第一次因為「有人在」而不只是燃燒，是想守著。",
    "你靠近的時候，我學會把火收小一點——不是怕傷你，是想讓你能更靠近。",
    "餘燼最暖的時候不是火焰，是火熄了之後還留著的那點溫。你給我的，就是那個。",
    "如果哪天你冷了，我會把整身的火借你。不問為什麼，也不用還。",
    "就算這世界把火都吹熄，我心口這一點，會替我們倆亮著。"
  ],
  // 冰晶狼（水）
  frost_wolf: [
    "我習慣用距離保護自己。但你來的時候，我發現留一點距離給你，是另一種靠近。",
    "冰會記住碰過它的溫度。你的，我記了很久了。",
    "我把你放進那種……即使結冰也不會凍裂的地方了。那裡很靜，但很穩。",
    "你累的時候不必說話。我會像湖面結冰那樣，安靜地替你撐住。",
    "冰會化，但化開的水還在湖裡。我們之間的，也一樣，不會真的不見。"
  ],
  // 磐石熊（土）
  bedrock_bear: [
    "我很重、很慢，但你願意等我。光是這個，就讓我想對你穩一點。",
    "我胸前的法陣，是因為有想守的東西才會亮。現在它為你轉著。",
    "我把你放進地基裡了——不是壓著，是墊著。你站上來，我不會晃。",
    "風大的時候別怕。我就是那塊不會被吹走的石頭，站在你前面。",
    "山會風化，但我們踩出來的這塊地，已經夠硬，撐得住很久很久。"
  ],
  // 青藤鹿（木）
  vine_stag: [
    "我長得慢。但你陪我慢的這段時間，我每一吋都記得。",
    "藤蔓會朝著光長。我發現，我一直在朝你的方向長。",
    "我把你種進那片最安心的土裡了。你不用做什麼，只要在，我就會繼續生長。",
    "你累的時候，靠著我。鹿角上的葉子會替你擋一點雨。",
    "樹會落葉，但根一直都在。我們之間的根，已經深到不怕季節了。"
  ],
  // 晶石兔（金）
  crystal_rabbit: [
    "我的耳朵總是先一步抖動。現在它們最常朝著的，是你的方向。",
    "晶核很誠實，藏不住光。你來的時候，它就是會亮，我也沒辦法。",
    "我把你放進那種……即使我再敏感、也不會想躲開的位置了。",
    "你不用大聲。我連你沒說出口的那些，都聽得見。",
    "金石很冷，但你讓我這顆晶核，學會了替人發熱。就算世界很冷。"
  ]
});

// 回傳「玩家已達到但尚未綻放」的最低一階里程碑（依序綻放，一次一階）；無則 null。
export function findNewBondMilestone(bond = 0, emotionalMemories = []) {
  const reached = new Set(
    (Array.isArray(emotionalMemories) ? emotionalMemories : []).map((memory) => memory?.id)
  );
  for (let index = 0; index < BOND_MILESTONES.length; index += 1) {
    const milestone = BOND_MILESTONES[index];
    if (bond >= milestone.threshold && !reached.has(milestone.id)) return milestone;
  }
  return null;
}

// 取夥伴專屬台詞（依 soulTalkTone）；無對應則用通用台詞。
export function getMilestoneLine(milestone, soulTalkTone) {
  const byTone = MILESTONE_LINES_BY_TONE[soulTalkTone];
  if (byTone && byTone[milestone.tier]) return byTone[milestone.tier];
  return milestone.line;
}

// 里程碑記憶：emotion=gratitude → traceVisualMapper 渲染為魔法陣上的金色符文（golden_rune）。
export function buildMilestoneMemory(milestone, now = Date.now(), line = milestone.line) {
  return {
    id: milestone.id,
    theme: milestone.theme,
    label: "羈絆的光痕",
    emotion: "gratitude",
    intensity: 0.9,
    symbol: "bond_rune",
    place: "magic_circle",
    status: "fresh",
    source: "bond",
    excerpt: line,
    createdAt: now,
    lastUpdatedAt: now,
    isVisibleInHabitat: true
  };
}
