export const HEARTSPARK_COUNCIL_CANON_V06 = {
  factionId: "heartspark-council",
  factionName: {
    zh: "心輝議會",
    en: "Heartspark Council",
    ja: "心輝評議会（しんきひょうぎかい）"
  },
  factionTheme: {
    zh: "守護、共鳴、修復、邊界、情感穩定",
    en: "Protection, resonance, restoration, boundaries, and emotional stability",
    ja: "守護、共鳴、修復、境界、感情の安定"
  },
  namingRules: {
    evolutionSystem: "three-stage-canon",
    stage1: "幼態守護夥伴",
    stage2: "議會守衛成熟體",
    stage3: "聖域覺醒體",
    forbiddenFinalTerms: ["皇", "帝", "神", "領主", "守"],
    reservedTerms: {
      lord: "混頓裂隙專用"
    }
  },
  characters: [
    {
      id: "auriowl",
      element: "metal",
      elementName: { zh: "金", en: "Metal", ja: "金（きん）" },
      factionId: "heartspark-council",
      names: {
        stage1: { zh: "金羽小梟", en: "Auriowl", ja: "金羽小梟（コガネコフクロウ）" },
        stage2: { zh: "輝羽梟衛", en: "Radiant Owl Warden", ja: "輝羽梟衛（キバネキョウエイ）" },
        stage3: { zh: "聖輝梟曜", en: "Sacred Radiance Owl Luminary", ja: "聖輝梟曜（セイキキョウヨウ）" }
      },
      emblem: { zh: "判斷・守望", en: "Judgment / Vigilance", ja: "判断・見守り" },
      role: { zh: "偵察／破防／反制", en: "Scout / Breaker / Counter", ja: "偵察／防御崩し／反撃支援" },
      teamSlot: ["midline", "support"],
      temperament: {
        zh: "好奇、警覺、黏人但怕生",
        en: "Curious, alert, affectionate but shy",
        ja: "好奇心が強く、警戒心があり、人懐っこいが臆病"
      },
      habitat: { zh: "晨光高枝", en: "Dawnlit Highbranch", ja: "暁光の高枝" },
      stats: { power: 4, defense: 3, speed: 7, wisdom: 8, emotion: 6, healing: 3 },
      tacticTags: ["scout", "mark", "armor-break", "counter", "prediction"],
      skills: [
        { id: "golden-feather-scan", type: "active", name: { zh: "金羽偵訊", en: "Golden Feather Scan", ja: "金羽偵察" } },
        { id: "vigil-cry", type: "active", name: { zh: "守望鳴聲", en: "Vigil Cry", ja: "見守りの鳴き声" } },
        { id: "luminous-omen", type: "stage3", name: { zh: "聖輝預兆", en: "Luminous Omen", ja: "聖輝の予兆" } }
      ],
      story: {
        zh: "金羽小梟誕生於心輝議會的晨光高枝。牠的飛行還不穩，卻天生能看見情緒流向中的細小裂縫。牠一開始總覺得自己太小，無法保護任何人；直到第一次在戰鬥前發出警示，讓隊伍避開致命伏擊。牠才理解，守護不一定是站在最前面。有時候，最早看見危險的人，就是守護的開始。",
        en: "Auriowl was born among the Dawnlit Highbranches of the Heartspark Council. Its flight is still unsteady, but it can sense tiny fractures in emotional currents. It learns that protection does not always mean standing at the front.",
        ja: "金羽小梟は心輝評議会の暁光の高枝で生まれた。まだ飛ぶのは得意ではないが、感情の流れに生じる小さな亀裂を感じ取る力を持つ。"
      },
      sampleLines: {
        meet: "啾……你剛剛也聽見了嗎？那不是風聲，是心核在顫。",
        battle: "我會看著牠們的動作，你們不要急。",
        bond: "如果是你問我的話……我可以再相信自己的眼睛一點。"
      }
    },
    {
      id: "sprigfawn",
      element: "wood",
      elementName: { zh: "木", en: "Wood", ja: "木（もく）" },
      factionId: "heartspark-council",
      names: {
        stage1: { zh: "芽角小鹿", en: "Sprigfawn", ja: "芽角小鹿（メヅノコジカ）" },
        stage2: { zh: "風林鹿衛", en: "Galegrove Stag Warden", ja: "風林鹿衛（フウリンロクエイ）" },
        stage3: { zh: "聖林鹿靈", en: "Sacred Grove Stag Spirit", ja: "聖林鹿霊（セイリンロクレイ）" }
      },
      emblem: { zh: "生長・寬恕", en: "Growth / Forgiveness", ja: "成長・赦し" },
      role: { zh: "治癒／淨化／持續回復", en: "Healer / Cleanser / Regeneration", ja: "治癒／浄化／継続回復" },
      teamSlot: ["support"],
      temperament: {
        zh: "溫柔、親人、怕衝突，但會在關鍵時刻站出來",
        en: "Gentle, affectionate, conflict-avoidant, but brave when needed",
        ja: "優しく人懐っこい。争いは苦手だが、大切な時には前に出る"
      },
      habitat: { zh: "青葉聖林", en: "Verdant Sanctum Grove", ja: "青葉の聖林" },
      stats: { power: 3, defense: 5, speed: 5, wisdom: 7, emotion: 8, healing: 9 },
      tacticTags: ["heal", "cleanse", "regen", "anti-corruption", "support"],
      skills: [
        { id: "sprout-pulse", type: "active", name: { zh: "青芽脈流", en: "Sprout Pulse", ja: "若芽の脈流" } },
        { id: "forest-breath-cleanse", type: "active", name: { zh: "林息淨化", en: "Forest Breath Cleanse", ja: "森息の浄化" } },
        { id: "sacred-grove-renewal", type: "stage3", name: { zh: "聖林再生", en: "Sacred Grove Renewal", ja: "聖林再生" } }
      ],
      story: {
        zh: "芽角小鹿出生在青葉聖林的心核樹根旁。牠的角還沒有長成鹿冠，只是兩枝細細的芽枝。每當牠靠近受傷的心核，枝芽就會長出新的葉片。牠很怕衝突，甚至會因敵人受傷而遲疑。但牠必須理解：溫柔不等於沒有邊界。真正的治癒不是替所有人承擔痛苦，而是讓生命重新長出自己的力量。",
        en: "Sprigfawn was born beside the Heartcore roots of the Verdant Sanctum Grove. Its journey is to learn that gentleness does not mean having no boundaries.",
        ja: "芽角小鹿は青葉の聖林にある心核樹の根元で生まれた。優しさとは境界を失うことではないと学んでいく。"
      },
      sampleLines: {
        meet: "你受傷了嗎？不要動，我可以試著讓葉子靠近你。",
        battle: "我不想傷害牠們……但我會保護你們。",
        bond: "你沒有催我變勇敢，所以我好像真的變勇敢了一點。"
      }
    },
    {
      id: "crystalfin-seahorse",
      element: "water",
      elementName: { zh: "水", en: "Water", ja: "水（みず）" },
      factionId: "heartspark-council",
      names: {
        stage1: { zh: "晶鰭小海馬", en: "Crystalfin Seahorse", ja: "晶鰭タツノコ（ショウキタツノコ）" },
        stage2: { zh: "冰洋海龍衛", en: "Frostocean Sea Dragon Warden", ja: "氷洋海竜衛（ヒョウヨウカイリュウエイ）" },
        stage3: { zh: "蒼海龍靈", en: "Azure Sea Dragon Spirit", ja: "蒼海竜霊（ソウカイリュウレイ）" }
      },
      emblem: { zh: "記憶・沉澱", en: "Memory / Stillness", ja: "記憶・沈静" },
      role: { zh: "控場／SP回復／記憶防護", en: "Control / SP Recovery / Memory Protection", ja: "制御／SP回復／記憶防護" },
      teamSlot: ["support", "control"],
      temperament: {
        zh: "安靜、敏感、觀察型，容易感受到他人的情緒殘響",
        en: "Quiet, sensitive, observant, and receptive to emotional echoes",
        ja: "静かで繊細、観察力が高く、他者の感情残響を感じ取りやすい"
      },
      habitat: { zh: "月湖營地", en: "Moonlake Camp", ja: "月湖のキャンプ" },
      stats: { power: 4, defense: 5, speed: 4, wisdom: 8, emotion: 7, healing: 8 },
      tacticTags: ["control", "slow", "sp-recovery", "memory-shield", "cleanse-support"],
      skills: [
        { id: "crystal-tide", type: "active", name: { zh: "水晶潮息", en: "Crystal Tide", ja: "水晶の潮息" } },
        { id: "memory-backflow", type: "active", name: { zh: "記憶回流", en: "Memory Backflow", ja: "記憶回流" } },
        { id: "azure-memory-sanctuary", type: "stage3", name: { zh: "蒼海憶域", en: "Azure Memory Sanctuary", ja: "蒼海の記憶域" } }
      ],
      story: {
        zh: "晶鰭小海馬棲息在月湖營地深處。牠的水晶鰭會映出他人遺忘或不願面對的記憶，因此牠總是安靜地待在水面下，不輕易靠近任何人。牠不是害怕玩家，而是害怕自己看見太多。牠的成長主題是：記憶不只是傷口，也可以是證明自己曾經撐過來的痕跡。",
        en: "Crystalfin Seahorse lives in the depths of Moonlake Camp. It learns that memory is not only a wound, but also proof that someone survived.",
        ja: "晶鰭タツノコは月湖の奥深くに棲んでいる。記憶は傷だけではなく、生き延びた証でもあると学んでいく。"
      },
      sampleLines: {
        meet: "水面剛剛動了一下……不是風，是你的記憶在靠近。",
        battle: "慢一點。牠們的動作，會先在水裡留下痕跡。",
        bond: "你沒有逼我說出看見的東西，這讓我比較安心。"
      }
    },
    {
      id: "blazetail-kit",
      element: "fire",
      elementName: { zh: "火", en: "Fire", ja: "火（ひ）" },
      factionId: "heartspark-council",
      names: {
        stage1: { zh: "焰尾小狐", en: "Blazetail Kit", ja: "焔尾子狐（ホムラオコギツネ）" },
        stage2: { zh: "星焰狐衛", en: "Starflame Fox Warden", ja: "星焔狐衛（セイエンコエイ）" },
        stage3: { zh: "永焰狐曜", en: "Eternal Flame Fox Luminary", ja: "永焔狐曜（エイエンコヨウ）" }
      },
      emblem: { zh: "熱意・勇氣", en: "Passion / Courage", ja: "熱意・勇気" },
      role: { zh: "爆發／燃燒／鼓舞", en: "Burst / Burn / Inspire", ja: "爆発火力／燃焼／鼓舞" },
      teamSlot: ["midline"],
      temperament: {
        zh: "活潑、調皮、外向，情緒來得快也燃得亮",
        en: "Playful, spirited, outgoing, and emotionally bright",
        ja: "活発でいたずら好き。感情の立ち上がりが早く、明るく燃える"
      },
      habitat: { zh: "星火林徑", en: "Starfire Woodland Path", ja: "星火の森道" },
      stats: { power: 7, defense: 3, speed: 8, wisdom: 5, emotion: 7, healing: 4 },
      tacticTags: ["burst", "burn", "inspire", "finisher", "emotion-boost"],
      skills: [
        { id: "blazetail-pounce", type: "active", name: { zh: "焰尾突襲", en: "Blazetail Pounce", ja: "焔尾の急襲" } },
        { id: "starfire-cheer", type: "active", name: { zh: "星火鼓舞", en: "Starfire Cheer", ja: "星火の鼓舞" } },
        { id: "eternal-flame-flare", type: "stage3", name: { zh: "永焰狐曜", en: "Eternal Flame Flare", ja: "永焔狐曜" } }
      ],
      story: {
        zh: "焰尾小狐誕生在星火林徑。牠的尾巴像永遠不會熄滅的小火苗，總是在夜路上先一步亮起。牠看起來最開朗，也最容易衝動，常把害怕藏在玩笑後面。牠的成長主題是：勇氣不是沒有恐懼，而是在害怕時仍願意點亮別人的路。",
        en: "Blazetail Kit was born along the Starfire Woodland Path. Its journey is to learn that courage is not the absence of fear, but the choice to light the way even while afraid.",
        ja: "焔尾子狐は星火の森道で生まれた。勇気とは恐れがないことではなく、怖くても誰かの道を照らすことだと学んでいく。"
      },
      sampleLines: {
        meet: "嘿！這邊這邊！我尾巴很亮吧？晚上就跟著我走。",
        battle: "怕也沒關係，我先衝，火會跟上！",
        bond: "其實我也會怕啦……但你在的時候，我比較敢亮起來。"
      }
    },
    {
      id: "starstripe-cub",
      element: "earth",
      elementName: { zh: "土", en: "Earth", ja: "土（つち）" },
      factionId: "heartspark-council",
      names: {
        stage1: { zh: "星紋小虎", en: "Starstripe Cub", ja: "星紋小虎（セイモンコトラ）" },
        stage2: { zh: "晶岩虎衛", en: "Crystalrock Tiger Warden", ja: "晶岩虎衛（ショウガンコエイ）" },
        stage3: { zh: "星地虎御", en: "Stellar Earth Tiger Aegis", ja: "星地虎御（セイチコギョ）" }
      },
      emblem: { zh: "邊界・安定", en: "Boundary / Stability", ja: "境界・安定" },
      role: { zh: "前衛／護盾／減傷", en: "Vanguard / Shield / Damage Reduction", ja: "前衛／シールド／ダメージ軽減" },
      teamSlot: ["frontline"],
      temperament: {
        zh: "沉穩、可靠、慢熱，不急著回應，但會替人站穩",
        en: "Calm, reliable, slow to warm up, but always steady",
        ja: "落ち着いていて信頼できる。打ち解けるのは遅いが、誰かのために踏みとどまる"
      },
      habitat: { zh: "星地聖丘", en: "Stellar Earth Sanctum", ja: "星地の聖丘" },
      stats: { power: 6, defense: 8, speed: 4, wisdom: 5, emotion: 6, healing: 5 },
      tacticTags: ["tank", "shield", "damage-reduction", "taunt", "boundary"],
      skills: [
        { id: "starcore-barrier", type: "active", name: { zh: "星紋壁壘", en: "Starstripe Barrier", ja: "星紋の障壁" } },
        { id: "earthline-rebound", type: "passive", name: { zh: "地脈反震", en: "Earthline Rebound", ja: "地脈反震" } },
        { id: "stellar-earth-aegis", type: "stage3", name: { zh: "星地虎御", en: "Stellar Earth Aegis", ja: "星地虎御" } }
      ],
      story: {
        zh: "星紋小虎出生於星地聖丘。牠胸前的星形心核會在地脈震動時發光，像是在提醒牠：有人需要一條穩定的邊界。牠不擅長說話，也不急著親近人，但當危險靠近時，牠總會本能地站到隊伍最前方。牠的成長主題是：真正的安定不是永遠不動，而是知道什麼時候必須站住。",
        en: "Starstripe Cub was born in the Stellar Earth Sanctum. Its journey is to learn that true stability is not never moving, but knowing when to stand firm.",
        ja: "星紋小虎は星地の聖丘で生まれた。真の安定とは動かないことではなく、立ち止まるべき時を知ることだと学ぶ。"
      },
      sampleLines: {
        meet: "……我站這裡。你可以躲在後面。",
        battle: "不用急。地還在，我也還在。",
        bond: "你沒有推我往前，但我想自己站到你前面。"
      }
    }
  ]
};

const HEARTSPARK_CHARACTER_MAP = new Map(
  HEARTSPARK_COUNCIL_CANON_V06.characters.map((character) => [character.id, character])
);

export function getHeartsparkCouncilCanonCharacterById(characterId) {
  return HEARTSPARK_CHARACTER_MAP.get(characterId) || null;
}
