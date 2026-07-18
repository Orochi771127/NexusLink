// 圖鑑演化線。A5 已填充：每條線三階（幼年→成長→成熟）。
// G2 起，codexController 只讀 companionStates 內該夥伴自己的正式 stage
//（或一次性的舊存檔 display floor），不再用全域 bondThreshold 解鎖。
// bondThreshold 暫留 compatibility data，不能作 runtime stage authority。
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
const CHILD_HINT = "當牠在照顧、探索與邊界中留下足夠多不同的真實痕跡，且牠自己願意時，這一階才會亮起——不靠勝負，也不靠刷數值。";
const ADULT_HINT = "當你們一起走過多種經歷，並在牠願意的時刻完成覺醒邀請，牠才會走向這個形態；沒有倒數，也不會永久錯過。";

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
  ]),

  // ── 心輝議會・正式五席（三階名逐字取自 heartsparkCouncilCanon v0.6；
  //    幼態守護夥伴 → 議會守衛成熟體 → 聖域覺醒體）。演化仍不靠打怪，靠關係。──
  "sprigfawn-line": line(true, [
    stage(0, "芽角小鹿", "Sprigfawn",
      "角上還只是兩枝芽枝的小鹿，靠近受傷的心核時會長出新葉。牠正在學：溫柔不等於沒有邊界。", 0, ""),
    stage(1, "風林鹿衛", "Galegrove Stag Warden",
      "芽枝長成了迎風的新角，風穿過林徑時會替牠傳話。牠學會了先問「可以嗎」，再把新葉借給誰。", CHILD_BOND, CHILD_HINT),
    stage(2, "聖林鹿靈", "Sacred Grove Stag Spirit",
      "牠走過的地方，枯掉的東西會重新綠回來。寬恕在牠身上不是忘記，是讓該長的，繼續長。", ADULT_BOND, ADULT_HINT)
  ]),
  "starstripe-cub-line": line(true, [
    stage(0, "星紋小虎", "Starstripe Cub",
      "胸前星形心核會在地脈震動時發光的小虎。話不多，危險靠近時卻總站在最前面。", 0, ""),
    stage(1, "晶岩虎衛", "Crystalrock Tiger Warden",
      "星紋沉進了晶岩般的肩甲裡。牠依然慢熱，但你已經是牠願意背對的人。", CHILD_BOND, CHILD_HINT),
    stage(2, "星地虎御", "Stellar Earth Tiger Aegis",
      "牠站定的地方，地脈就安定下來。胸前的星亮著，就代表兩件事：有危險，和，有牠在。", ADULT_BOND, ADULT_HINT)
  ]),
  "auriowl-line": line(true, [
    stage(0, "金羽小梟", "Auriowl",
      "飛行還不穩的金羽小梟，卻天生看得見情緒流裡的細小裂縫。最早看見危險，就是守護的開始。", 0, ""),
    stage(1, "輝羽梟衛", "Radiant Owl Warden",
      "翅膀終於穩了，牠把巡夜排成了固定的路線。每一圈的最後，都會經過你。", CHILD_BOND, CHILD_HINT),
    stage(2, "聖輝梟曜", "Sacred Radiance Owl Luminary",
      "牠的羽光亮得像提前抵達的晨光。看見裂縫不再只是預警——牠學會了在裂開之前，先把光放進去。", ADULT_BOND, ADULT_HINT)
  ]),
  "blazetail-kit-line": line(true, [
    stage(0, "焰尾小狐", "Blazetail Kit",
      "尾巴像不會熄滅的小火苗，夜路上總先一步亮起。勇氣不是不怕，是害怕時仍願意替人照路。", 0, ""),
    stage(1, "星焰狐衛", "Starflame Fox Warden",
      "尾焰裡開始有星火明滅。牠還是會怕黑——只是有你在後面，牠敢把尾巴舉得更高。", CHILD_BOND, CHILD_HINT),
    stage(2, "永焰狐曜", "Eternal Flame Fox Luminary",
      "牠的火不再需要燃料，因為裡面有一半是你給的。就算整個世界的火都熄了，這一簇會替你們亮著。", ADULT_BOND, ADULT_HINT)
  ]),
  "crystalfin-seahorse-line": line(true, [
    stage(0, "晶鰭小海馬", "Crystalfin Seahorse",
      "水晶鰭會映出被遺忘記憶的小海馬，安靜地待在水面下。記憶不只是傷口，也是撐過來的痕跡。", 0, ""),
    stage(1, "冰洋海龍衛", "Frostocean Sea Dragon Warden",
      "鰭紋長成了海龍的輪廓，替更深的水守著更多的記憶。你交給牠的，連漩渦都帶不走。", CHILD_BOND, CHILD_HINT),
    stage(2, "蒼海龍靈", "Azure Sea Dragon Spirit",
      "牠身後展開一片蒼海憶域——所有被好好記住的事，都在那裡發著微光。牠說：這片海，有一半是你陪牠沉澱的。", ADULT_BOND, ADULT_HINT)
  ])
};

export function getEvolutionLine(lineId) {
  return EVOLUTION_LINES[lineId] || null;
}
