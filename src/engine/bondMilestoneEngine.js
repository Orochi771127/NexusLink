// 羈絆里程碑：把「無形累積的 bond」變成可見、可感、且只增不減的關係進程。
//
// 安全/契約聲明：
// - 只由真實互動累積的 bond 觸發，無時間壓迫、無打卡、無 FOMO（紅線 #6）。
// - 觸發後寫成一枚情緒記憶（emotion: gratitude）→ 由痕跡系統綻放成魔法陣上的金色符文，
//   記憶只增、不可被玩家抹除以「重來」（契約 #1）；也無法購買或強制（契約 #3）。
// - 台詞表達「被放進可以放心的位置」，是陪伴而非黏人（契約 #2）。

export const BOND_MILESTONES = Object.freeze([
  {
    id: "bond_milestone_1", threshold: 12, theme: "初亮的記憶",
    line: "我開始記得你來的方式了。你靠近的時候，我的心核會輕輕亮一下。"
  },
  {
    id: "bond_milestone_2", threshold: 25, theme: "信任萌芽",
    line: "說來奇怪——有你在的時候，我比較敢安靜下來。謝謝你從不催我。"
  },
  {
    id: "bond_milestone_3", threshold: 45, theme: "可以放心的地方",
    line: "我想，我已經把你放進那種『可以放心』的位置了。那裡不大，但很重要。"
  },
  {
    id: "bond_milestone_4", threshold: 70, theme: "並肩",
    line: "如果哪天你累得說不出話，也沒關係。我會在這裡，像你一直為我做的那樣。"
  },
  {
    id: "bond_milestone_5", threshold: 90, theme: "不滅的湖光",
    line: "我們之間已經攢了好多光了。就算世界很冷，這片湖，也會替我們亮著。"
  }
]);

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

// 里程碑記憶：emotion=gratitude → traceVisualMapper 渲染為魔法陣上的金色符文（golden_rune）。
export function buildMilestoneMemory(milestone, now = Date.now()) {
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
    excerpt: milestone.line,
    createdAt: now,
    lastUpdatedAt: now,
    isVisibleInHabitat: true
  };
}
