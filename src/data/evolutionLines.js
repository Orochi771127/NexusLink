// 圖鑑演化線。A5 已填充：每條線三階（幼年→成長→成熟）。
// 契約：演化**不靠打怪**（見 CLAUDE.md）——解鎖條件是羈絆（bond）+ 痕跡 + 儀式，
// 由 codexController 以 `bondThreshold` 判定（不再用 unlockWins）。unlockHint 為關係語言，
// 明文不寫「打贏 N 場」。更高階（完全體/究極體）留待未來章節，故此處三階為 demo 完整弧。
export const STAGE_LABELS = [
  { zh: "幼年期", en: "BABY" },
  { zh: "成長期", en: "CHILD" },
  { zh: "成熟期", en: "ADULT" },
  { zh: "完全體", en: "PERFECT" },
  { zh: "究極體", en: "ULTIMATE" }
];

// 關係門檻對齊既有羈絆里程碑：25「信任萌芽」、70「並肩」。
const CHILD_BOND = 25;
const ADULT_BOND = 70;
const CHILD_HINT = "當你們的羈絆長到「信任萌芽」（羈絆約 25），且湖邊已留下夠多情緒痕跡時，這一階會自己亮起——不靠勝負，靠你怎麼對待牠。";
const ADULT_HINT = "當羈絆深到「並肩」（羈絆約 70），並一起走過一段靜心儀式後，牠會走向這個形態。";

function line(complete, stages) {
  return { complete, stages };
}
function stage(index, zh, en, lore, bondThreshold, unlockHint) {
  return { stage: STAGE_LABELS[index], name: { zh, en }, lore, bondThreshold, unlockHint };
}

export const EVOLUTION_LINES = {
  "greyshade-cat-line": line(true, [
    stage(0, "灰影貓", "Greyshade Cat",
      "夜湖棲地的守望者。牠的進化不靠戰鬥，而靠你們之間累積的記憶痕跡。", 0, ""),
    stage(1, "暮影貓", "Duskshade Cat",
      "當你們攢下夠多安靜的夜，牠背上的灰影裡浮出了淡淡的月痕——那是被你記得的形狀。", CHILD_BOND, CHILD_HINT),
    stage(2, "湖華貓", "Lakeglow Cat",
      "牠學會把整片湖光收進毛色裡。牠仍然會拒絕、會留白，但你靠近時，牠不再先退。", ADULT_BOND, ADULT_HINT)
  ]),
  "flame-flicker-line": line(true, [
    stage(0, "焰紋狐", "Ember-vein Fox",
      "暗毛上流著餘燼紋路的狐。牠的火，第一次因為「有人在」而不只是燃燒。", 0, ""),
    stage(1, "燼羽狐", "Emberdown Fox",
      "胸口的火核安穩下來了，餘燼順著背脊長成一道暖紋——牠開始懂得把火收小，好讓你靠近。", CHILD_BOND, CHILD_HINT),
    stage(2, "熾鎧狐", "Emberguard Fox",
      "當牠願意為你守著什麼，整身的餘燼會亮成一片溫熱的鎧紋。牠的火不再只是燃燒，是想守。", ADULT_BOND, ADULT_HINT)
  ]),
  "ice-talon-line": line(true, [
    stage(0, "冰晶狼", "Frostcrystal Wolf",
      "鬃毛凝著冰晶的守界之狼。牠習慣用距離保護自己。", 0, ""),
    stage(1, "霜鬃狼", "Frostmane Wolf",
      "鬃毛上的冰晶結得更深了。牠學會留一段剛好的距離給你——那是另一種靠近。", CHILD_BOND, CHILD_HINT),
    stage(2, "鏡湖狼", "Mirrorlake Wolf",
      "牠睡著時，整片湖面會結成一面鏡。冰會化，但化開的水還在湖裡——你們之間的，也一樣。", ADULT_BOND, ADULT_HINT)
  ]),
  "stone-shard-line": line(true, [
    stage(0, "磐石熊", "Bedrock Bear",
      "披著苔蘚與岩甲的熊。牠很重、很慢，但你願意等牠。", 0, ""),
    stage(1, "苔甲熊", "Mossplate Bear",
      "岩甲上長出了苔與微光。你願意等，牠就想對你穩一點。", CHILD_BOND, CHILD_HINT),
    stage(2, "磐殿熊", "Bastion Bear",
      "牠胸前的法陣為你轉著。風大的時候，牠就是那塊不會被吹走的石頭，站在你前面。", ADULT_BOND, ADULT_HINT)
  ]),
  "vine-twist-line": line(true, [
    stage(0, "青藤鹿", "Vine Stag",
      "鹿角纏著藤蔓與嫩葉的雄鹿。牠長得慢，卻記得每一段被陪伴的時光。", 0, ""),
    stage(1, "綻葉鹿", "Bloomleaf Stag",
      "鹿角間的嫩葉開了花。你陪牠慢的每一吋，牠都記得。", CHILD_BOND, CHILD_HINT),
    stage(2, "林徑鹿", "Trailweaver Stag",
      "牠每長一階，林裡就多開一條無人見過的小路。你累的時候靠著牠，鹿角的葉會替你擋雨。", ADULT_BOND, ADULT_HINT)
  ]),
  "crystal-rabbit-line": line(true, [
    stage(0, "晶石兔", "Crystal Rabbit",
      "苔石身軀裡藏著澄藍晶核的兔。牠的成長不靠勝負，而靠牠願意為誰豎起耳朵。", 0, ""),
    stage(1, "澄核兔", "Clearcore Rabbit",
      "苔石身軀裡的晶核更亮了。牠的耳朵總先一步朝你，藏不住那點光。", CHILD_BOND, CHILD_HINT),
    stage(2, "曦鳴兔", "Dawnchime Rabbit",
      "金石很冷，但你讓這顆晶核學會了替人發熱。牠連你沒說出口的，都聽得見。", ADULT_BOND, ADULT_HINT)
  ])
};

export function getEvolutionLine(lineId) {
  return EVOLUTION_LINES[lineId] || null;
}
