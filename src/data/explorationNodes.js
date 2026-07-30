export const EXPLORATION_NODES = [
  {
    id: "moonlake_camp",
    label: { zh: "月湖營地", en: "Moonlit Lake Camp" },
    description: "夥伴棲息的靜謐夜湖。營火溫暖，月光如鏡，是冒險的起點與歸所。",
    eventType: "rest",
    emotionalTone: "calm",
    encounterChance: 0,
    enemyPool: [],
    possibleRewards: [{ stat: "energy", delta: 2 }, { stat: "mood", value: "calm" }],
    resultMessages: [
      "你們在營火邊坐了一會兒，湖面的月光輕輕晃動。",
      "夥伴靠在你身邊，營地的暖意慢慢滲進來。",
      "什麼都沒發生，這正是月湖營地最好的地方。",
      "營火劈啪響了一聲，牠朝聲音微微一動，又放鬆下來。",
      "你替火添了根柴，牠看著火光，把身體收得更靠近暖意。"
    ]
  },
  {
    id: "starwood_trail",
    label: { zh: "星林步道", en: "Starlit Forest Trail" },
    description: "參天古木與滿天星辰的靜謐林道，樹上的結晶閃閃發光，溫和且神祕。",
    eventType: "peaceful",
    emotionalTone: "wonder",
    encounterChance: 0.15,
    enemyPool: ["static_wisp", "tearveil_wisp"],
    possibleRewards: [{ stat: "bond", delta: 2 }, { stat: "mood", value: "warm" }],
    phaseSearch: {
      id: "silent_anchor",
      title: "寂靜錨・相位尋路",
      prompt: "星林入口的水脈分成四道微光。先讀牠的姿態，再決定你們這一拍怎麼走。",
      choices: [
        { id: "direct", label: "直接前行", detail: "沿水脈踏入星林" },
        { id: "anchor", label: "讀取錨點", detail: "先聽清地脈回聲" },
        { id: "calm_sync", label: "心核共息", detail: "只放慢此刻呼吸" },
        { id: "return", label: "返回營地", detail: "把這條路留到之後" }
      ],
      anchorReading: "寂靜錨把遠近兩層回聲分開了。路沒有變得更安全，你們只是更清楚自己正站在哪裡。",
      calmReading: "你們沒有推動任何結果，只讓呼吸在同一拍上停了一會兒。牠仍保有原本的距離與選擇。",
      returnMessage: "你們把未走的路留在星光裡，轉身回到營地。沒有什麼因此失去。"
    },
    resultMessages: [
      "一顆星晶從枝頭落下，夥伴輕輕碰了碰它。",
      "你們沿著步道慢慢走，星光在樹葉間流動。",
      "夜行小獸從你們身邊穿過，夥伴停了一拍才繼續走。",
      "一隻夜蛾停在牠身旁，牠停住動作，怕嚇跑它。",
      "步道盡頭的星晶輕輕共鳴，像在替你們指路。"
    ]
  },
  {
    id: "crystal_ruins",
    label: { zh: "晶岩遺跡", en: "Crystalline Ruins" },
    description: "古文明遺留的晶岩柱遺跡。地脈在此匯聚，深處隱藏著被遺忘的祕密。",
    eventType: "discovery",
    emotionalTone: "mystery",
    encounterChance: 0.35,
    enemyPool: ["crystal_golemite", "static_wisp", "dread_coil"],
    possibleRewards: [{ stat: "trust", delta: 2 }, { stat: "bond", delta: 1 }],
    resultMessages: [
      "你們在一根晶柱底下找到一塊溫熱的記憶碎片。",
      "晶岩折射的光在夥伴身上畫出細小的符紋。",
      "遺跡深處傳來低低的共鳴聲，夥伴貼近了你一點。",
      "一段古老的紋路在你掌心亮了一下，又暗下去。",
      "牠對著某根晶柱低鳴了一聲，像認得這裡。"
    ]
  },
  {
    id: "misttide_shore",
    label: { zh: "霧潮河岸", en: "Misty Tide Shore" },
    description: "河水如鏡面般寧靜，霧氣籠罩其上。水聲輕柔如呢喃，是冥想與反思之地。",
    eventType: "reflective",
    emotionalTone: "calm",
    encounterChance: 0.1,
    enemyPool: ["static_wisp", "drift_murmur"],
    possibleRewards: [{ stat: "energy", delta: 1 }, { stat: "mood", value: "calm" }],
    reflectiveExcerpt: "在霧潮河岸，你看著潮水安靜下來。",
    resultMessages: [
      "霧氣裡，你看見水面映出自己安靜下來的樣子。",
      "夥伴在淺灘邊停下，看著潮水一進一退。",
      "河岸的霧很輕，心裡的某個結也鬆了一點。",
      "霧散開一角，對岸似乎有另一個模糊的身影，眨眼又不見了。",
      "潮水退下去，露出幾枚被磨圓的小石，牠叼起一枚放到你腳邊。"
    ]
  },
  {
    id: "rift_observatory",
    label: { zh: "裂隙觀測點", en: "Rift Observation Point" },
    description: "現實與虛空的邊界在此可見，光線扭曲、時間感模糊。危險，但有股力量在呼喚。",
    eventType: "danger",
    emotionalTone: "dread",
    encounterChance: 1,
    // 每次裂隙隨機呈現一種情緒（五行各一）；帶對的元素守護來會更契合（見 battleEngine 裂隙心相）。
    enemyPool: ["rift_shade", "crystal_golemite", "weary_husk", "hollow_echo", "static_wisp", "tearveil_wisp", "sink_weight", "spite_ember", "drift_murmur", "dread_coil"],
    possibleRewards: [{ stat: "trust", delta: 3 }],
    resultMessages: [
      "裂隙邊緣的空氣在發出細小的雜訊聲——有東西過來了。",
      "光線在你們面前扭曲了一下，牠壓低身體，擋在你前面。"
    ]
  },
  // ---- 章節區域節點（CH-5b）：每章 1 氣氛節點 + 1 章節裂隙節點。 ----
  // 節點 → 章節歸屬見 chapterRegistry.getChapterForNode；區域 = 該章 regionId。
  // 裂隙節點 enemyPool 對齊該章 riftEmotion（enemyRegistry 的 emotion 標籤）。
  {
    id: "plains_windrest",
    label: { zh: "風歇草坡", en: "Windrest Meadow" },
    description: "北部平原的草長得比人高。風一停，世界就安靜得能聽見自己的心跳。",
    eventType: "peaceful",
    emotionalTone: "calm",
    encounterChance: 0.12,
    enemyPool: ["hollow_echo", "drift_murmur"],
    possibleRewards: [{ stat: "bond", delta: 2 }, { stat: "mood", value: "warm" }],
    resultMessages: [
      "風把草壓低又放開，像一片會呼吸的海。",
      "你們在草浪裡走了一段，誰都沒說話，卻不覺得孤單。",
      "一隻草間小蟲跳上牠的背，牠決定裝作不知道。",
      "遠處有一聲很輕的鳴叫。牠停下來，往聲音的方向看了很久。",
      "風停了一拍，你聽見自己的腳步聲，和牠的，走在一起。"
    ]
  },
  {
    id: "plains_rift",
    label: { zh: "孤鳴裂隙", en: "Lonesong Rift" },
    description: "平原深處，風繞著一個看不見的洞打轉。孤獨的低鳴從那裡漏出來。",
    eventType: "danger",
    emotionalTone: "dread",
    encounterChance: 1,
    enemyPool: ["hollow_echo", "drift_murmur"],
    possibleRewards: [{ stat: "trust", delta: 3 }],
    resultMessages: [
      "草浪在這裡分開成一個圓。圓心的空氣，在低低地鳴。",
      "牠把身體收緊了一點。有什麼很孤單的東西，在裡面轉。"
    ]
  },
  {
    id: "forge_emberpath",
    label: { zh: "餘燼小徑", en: "Emberpath" },
    description: "熔爐丘陵的舊礦道邊，餘燼在石縫裡明明滅滅，像沒說完的話。",
    eventType: "discovery",
    emotionalTone: "mystery",
    encounterChance: 0.15,
    enemyPool: ["crystal_golemite", "spite_ember"],
    possibleRewards: [{ stat: "trust", delta: 2 }, { stat: "bond", delta: 1 }],
    resultMessages: [
      "石縫裡的餘燼亮了一下，又安靜下來。",
      "牠輕輕碰了碰一塊溫熱的石頭，然後決定尊重它。",
      "舊礦道的風有鐵的味道。你們放慢了腳步。",
      "一段廢棄的軌道通向黑暗，牠在入口停住，搖了搖頭。今天不進去。",
      "你把手放在石壁上，還有一點餘溫，像這座丘陵沒有真的熄滅。"
    ]
  },
  {
    id: "forge_rift",
    label: { zh: "沉怒裂隙", en: "Smolderwrath Rift" },
    description: "丘陵最深的爐膛舊址。被留下的怒氣在這裡結成了塊。",
    eventType: "danger",
    emotionalTone: "dread",
    encounterChance: 1,
    enemyPool: ["crystal_golemite", "spite_ember"],
    possibleRewards: [{ stat: "trust", delta: 3 }],
    resultMessages: [
      "空氣悶得發燙。裂隙裡的東西，把火氣憋成了石頭。",
      "牠壓低重心，周身的光繃緊——這裡的怒氣，不是牠的，也不是你的。"
    ]
  },
  {
    id: "harbor_quayside",
    label: { zh: "靜泊碼頭", en: "Stillharbor Quay" },
    description: "潮水拍著木樁，一下，又一下。要出海的人總是睡不好，這裡教人先呼吸。",
    eventType: "reflective",
    emotionalTone: "calm",
    encounterChance: 0.1,
    enemyPool: ["rift_shade", "dread_coil"],
    possibleRewards: [{ stat: "energy", delta: 1 }, { stat: "mood", value: "calm" }],
    reflectiveExcerpt: "在靜泊碼頭，你看著船纜鬆了又緊，學會了先呼吸。",
    resultMessages: [
      "潮水拍著碼頭的木樁，一下，又一下，比心跳慢。",
      "一艘小船在遠處起伏。要出海的人，總是睡不好。",
      "牠停在纜樁旁看水，一點也不急。",
      "你數了七下浪。數完，肩膀鬆了一點。",
      "霧笛在很遠的地方響了一聲，像有人說「還早，慢慢來」。"
    ]
  },
  {
    id: "harbor_rift",
    label: { zh: "迷茫裂隙", en: "Mistknot Rift" },
    description: "防波堤盡頭，霧聚成一團解不開的結。焦慮在裡面繞圈。",
    eventType: "danger",
    emotionalTone: "dread",
    encounterChance: 1,
    enemyPool: ["rift_shade", "dread_coil"],
    possibleRewards: [{ stat: "trust", delta: 3 }],
    resultMessages: [
      "霧在這裡打轉，一副找不到出口的樣子。",
      "牠貼近你的腳邊。這團霧裡的心跳，太快了。"
    ]
  },
  {
    id: "core_lightwell",
    label: { zh: "光井迴廊", en: "Lightwell Gallery" },
    description: "輝耀核心區的邊廊。光從高處落成一口一口的井，最亮的地方，影子也最深。",
    eventType: "discovery",
    emotionalTone: "mystery",
    encounterChance: 0.15,
    enemyPool: ["static_wisp", "tearveil_wisp"],
    possibleRewards: [{ stat: "trust", delta: 2 }, { stat: "bond", delta: 1 }],
    resultMessages: [
      "光柱裡的塵埃緩緩上升，像一場倒著下的雪。",
      "牠碰了碰光的邊緣，影子在牆上跟著動。",
      "迴廊很亮，也很安靜。亮得讓人想起一些收起來的事。",
      "你們站在光和影的交界線上，誰也沒有先過去。",
      "一滴水從高處落進光井，聲音很小，卻傳得很遠。"
    ]
  },
  {
    id: "core_rift",
    label: { zh: "低鳴裂隙", en: "Sorrowdim Rift" },
    description: "核心區最亮處背後的陰影。悲傷積在這裡，藍得很深。",
    eventType: "danger",
    emotionalTone: "dread",
    encounterChance: 1,
    enemyPool: ["static_wisp", "tearveil_wisp"],
    possibleRewards: [{ stat: "trust", delta: 3 }],
    resultMessages: [
      "光走不進來的地方，有東西在低低地哭。",
      "牠停在陰影邊緣，回頭看你——這一步，要一起走。"
    ]
  },
  {
    id: "tidal_saltmarsh",
    label: { zh: "鹽風濕原", en: "Saltwind Marsh" },
    description: "潮汐邊疆的濕原。一半是海的，一半是心的，浪來一層，退一層。",
    eventType: "peaceful",
    emotionalTone: "wonder",
    encounterChance: 0.15,
    enemyPool: ["hollow_echo", "spite_ember", "dread_coil", "tearveil_wisp", "sink_weight"],
    possibleRewards: [{ stat: "bond", delta: 2 }, { stat: "energy", delta: 1 }],
    resultMessages: [
      "退潮把濕原刻成一面鏡子，天空整個躺在地上。",
      "牠踩進淺水，濺起的水花讓牠自己嚇了一跳。",
      "鹽風吹過來，鹹鹹的，像很遠的地方寄來的信。",
      "濕原的水窪裡有一整片雲。牠低頭喝了一口天空。",
      "浪聲一半規律、一半任性。你們坐著聽了很久。"
    ]
  },
  {
    id: "tidal_rift",
    label: { zh: "亂潮裂隙", en: "Crosscurrent Rift" },
    description: "濕原盡頭的暗流交匯處。好幾種心緒在這裡攪成一團亂潮。",
    eventType: "danger",
    emotionalTone: "dread",
    encounterChance: 1,
    enemyPool: ["hollow_echo", "spite_ember", "dread_coil", "tearveil_wisp", "sink_weight"],
    possibleRewards: [{ stat: "trust", delta: 3 }],
    resultMessages: [
      "這裡的浪不聽潮汐的話，各走各的方向。",
      "牠停下來聽，分不清這裡是難過、還是生氣——都有。"
    ]
  },
  {
    id: "mystic_summitgate",
    label: { zh: "霧脊山門", en: "Mistridge Gate" },
    description: "秘境山脈的入口。石階往霧裡去，山頂上什麼都沒有——只有走過的路在身後發光。",
    eventType: "reflective",
    emotionalTone: "mystery",
    encounterChance: 0.1,
    enemyPool: ["rift_shade", "hollow_echo", "tearveil_wisp"],
    possibleRewards: [{ stat: "trust", delta: 1 }, { stat: "mood", value: "calm" }],
    reflectiveExcerpt: "在霧脊山門，你回頭看了一眼來時的路。",
    resultMessages: [
      "石階上的霧讓每一步都只看得見下一步。也夠了。",
      "牠走在你前面半步，身側的微光像一盞小燈。",
      "山風把霧掀開一角，來時的路在很下面，安安靜靜地亮著。",
      "你們在山門下歇了一會兒。誰都沒提山頂的事。",
      "一塊古老的石碑立在霧裡，字跡已經模糊。牠聞了聞，繞了過去。"
    ]
  },
  {
    id: "mystic_rift",
    label: { zh: "萬相裂隙", en: "Allmind Rift" },
    description: "山脈核心的裂口。七片土地的雜訊都往這裡匯，輪著換心相。",
    eventType: "danger",
    emotionalTone: "dread",
    encounterChance: 1,
    enemyPool: ["rift_shade", "crystal_golemite", "weary_husk", "hollow_echo", "static_wisp", "tearveil_wisp", "sink_weight", "spite_ember", "drift_murmur", "dread_coil"],
    possibleRewards: [{ stat: "trust", delta: 3 }],
    resultMessages: [
      "裂口的光一陣一陣變色，像在輪流說七個地方的夢話。",
      "牠站定，深深吸了一口氣，然後看了你一眼。最後一段了。"
    ]
  },
  {
    id: "mirror_hollow",
    label: { zh: "湖心倒影", en: "Mirror Hollow" },
    description: "湖水最深、最靜的一處。月亮整個沉在水裡，映出你，也映出牠。",
    eventType: "reflective",
    emotionalTone: "calm",
    encounterChance: 0.08,
    enemyPool: ["tearveil_wisp"],
    possibleRewards: [{ stat: "trust", delta: 1 }, { stat: "mood", value: "calm" }],
    reflectiveExcerpt: "在湖心倒影裡，你看見自己，也看見牠靜靜坐在旁邊。",
    resultMessages: [
      "水面太靜了，你看見自己，也看見牠靜靜坐在你旁邊的倒影。",
      "月亮沉在湖心，你們的影子疊在一起，像早就認識很久。",
      "什麼都沒說，但湖心把這一刻含住了。"
    ]
  }
];

export const EXPLORATION_NODE_IDS = EXPLORATION_NODES.map((node) => node.id);

const NODE_MAP = new Map(EXPLORATION_NODES.map((node) => [node.id, node]));

export function getExplorationNodeById(nodeId) {
  return NODE_MAP.get(nodeId) || null;
}
