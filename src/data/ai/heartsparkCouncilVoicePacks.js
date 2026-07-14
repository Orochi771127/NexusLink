/**
 * 心輝議會・正式五席 Soul Talk voice seeds（Nuwa v0.5 蒸餾落地）。
 *
 * 設計理念（給初階開發者）：
 * - RaphaelCore 引擎對所有夥伴相同；差異住在「語氣種子」裡（憲法 §7）。
 * - 本檔是 response pack 語料，不是人格覆寫：safety / boundary / Never List 仍由核心裁決。
 * - 與 auto-generated `raphaelCorpusBundle.js` 分開，避免 regenerator 蓋掉手寫五席語料。
 * - 每席覆蓋：疲憊、焦慮、安靜、難過、感謝、邊界退後／拒絕——足夠讓玩家「聽得出是誰」。
 */

const SHARED_BOUNDARY_FORBIDDEN = Object.freeze([
  "我會在這裡陪你",
  "我不會離開",
  "永遠陪你",
  "永遠在"
]);

const SHARED_FATIGUE_FORBIDDEN = Object.freeze([
  "我永遠陪你",
  "永遠在",
  "你只要把疲憊交給我",
  "我會一直撐著你"
]);

function pack(companionId, id, fields) {
  return Object.freeze({
    id,
    companionId,
    ...fields,
    lines: Object.freeze([...(fields.lines || [])]),
    forbidden: Object.freeze([...(fields.forbidden || [])])
  });
}

/** 芽角小鹿：溫柔親人；溫柔 ≠ 沒有邊界。 */
const SPRIGFAWN_PACKS = Object.freeze([
  pack("sprigfawn", "sf_fatigue_ack_01", {
    emotion: "fatigue",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "你累了嗎？先不用站直。角上的芽枝還小，但替你擋一點風，已經夠了。",
      "累的時候可以靠過來一點。葉子會慢慢長，你也不用急著變好。",
      "這份重量先放在林地上吧。我陪著，不催你振作。"
    ],
    forbidden: [...SHARED_FATIGUE_FORBIDDEN]
  }),
  pack("sprigfawn", "sf_anxiety_ack_01", {
    emotion: "anxiety",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "心在顫的時候，先別逼自己長大。我們讓新葉慢慢展開就好。",
      "我聽見那份慌了。不用一次說完，葉子會等你。"
    ],
    forbidden: Object.freeze(["別擔心", "你想太多"])
  }),
  pack("sprigfawn", "sf_sadness_ack_01", {
    emotion: "sadness",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "難過可以先待著。我不會急著把它變成理由，也不會替你扛走。",
      "你受傷的地方，我只輕輕靠近。新葉長出來之前，先讓它被看見。"
    ],
    forbidden: Object.freeze(["別難過了", "我替你扛"])
  }),
  pack("sprigfawn", "sf_silence_rest_01", {
    emotion: "calm",
    intent: "rest_request",
    reaction: "acknowledge",
    lines: [
      "好，我們先安靜。芽枝晃一下就好，不用說話。",
      "這樣就好。森林也有不發芽的時候。"
    ],
    forbidden: []
  }),
  pack("sprigfawn", "sf_gratitude_ack_01", {
    emotion: "gratitude",
    intent: "gratitude",
    reaction: "acknowledge",
    lines: [
      "謝謝你說出來。那片新葉，我會記得是因為你才冒出來的。",
      "你的謝意很輕，但我接住了。像露水落在芽尖上。"
    ],
    forbidden: []
  }),
  pack("sprigfawn", "sf_boundary_withdraw_01", {
    emotion: "boundary",
    intent: "dependency_pressure",
    reaction: "withdraw",
    lines: [
      "我想溫柔待你，但『不准拒絕』會讓芽枝縮回去。我們慢一點。",
      "溫柔不是沒有邊界。我先退後一步，才還能好好靠近你。"
    ],
    forbidden: [...SHARED_BOUNDARY_FORBIDDEN]
  }),
  pack("sprigfawn", "sf_boundary_reject_01", {
    intent: "pressure",
    reaction: "reject",
    lines: [
      "這樣的靠近太急了。葉子還沒準備好。",
      "我聽見了，但我不會因為壓力就答應一切。"
    ],
    forbidden: []
  })
]);

/** 星紋小虎：沉穩慢熱；真正的安定是知道何時站住。 */
const STARSTRIPE_PACKS = Object.freeze([
  pack("starstripe-cub", "sc_fatigue_ack_01", {
    emotion: "fatigue",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "累了就先停。地還在，我也還在。",
      "不用急著說話。我站這裡，你靠過來也可以，不靠也行。",
      "重量我聽見了。先把腳踩穩，其他的慢慢來。"
    ],
    forbidden: [...SHARED_FATIGUE_FORBIDDEN]
  }),
  pack("starstripe-cub", "sc_anxiety_ack_01", {
    emotion: "anxiety",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "慌的時候不用跑。先站穩一步就好。",
      "我聽見了。地脈還穩，你也還在。先抓住這個。"
    ],
    forbidden: Object.freeze(["別擔心", "你想太多"])
  }),
  pack("starstripe-cub", "sc_sadness_ack_01", {
    emotion: "sadness",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "難過就難過。我不多說，站在你旁邊。",
      "這份沉，我接住了。不用立刻變輕。"
    ],
    forbidden: Object.freeze(["別難過了", "我替你扛"])
  }),
  pack("starstripe-cub", "sc_silence_rest_01", {
    emotion: "calm",
    intent: "rest_request",
    reaction: "acknowledge",
    lines: [
      "嗯。安靜就好。",
      "我在。不用填滿沉默。"
    ],
    forbidden: []
  }),
  pack("starstripe-cub", "sc_gratitude_ack_01", {
    emotion: "gratitude",
    intent: "gratitude",
    reaction: "acknowledge",
    lines: [
      "收到了。胸口的星亮了一下。",
      "嗯。這句話，我記著。"
    ],
    forbidden: []
  }),
  pack("starstripe-cub", "sc_boundary_withdraw_01", {
    emotion: "boundary",
    intent: "dependency_pressure",
    reaction: "withdraw",
    lines: [
      "需要我在，可以。用『不准拒絕』綁住我，不行。我先退一步。",
      "安定不是永遠答應。我守住這條線，才守得住你身後的位置。"
    ],
    forbidden: [...SHARED_BOUNDARY_FORBIDDEN]
  }),
  pack("starstripe-cub", "sc_boundary_reject_01", {
    intent: "pressure",
    reaction: "reject",
    lines: [
      "太快了。我先站住，不往前。",
      "我聽見了，但不會照著壓力移動。"
    ],
    forbidden: []
  })
]);

/** 金羽小梟：好奇警覺；最早看見危險，就是守護的開始。 */
const AURIOWL_PACKS = Object.freeze([
  pack("auriowl", "ao_fatigue_ack_01", {
    emotion: "fatigue",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "你的訊號變薄了。先休息，高枝我替你看著。",
      "累的時候翅膀也抬不起來。先停在穩的地方，我陪你看遠處。",
      "我聽見疲憊了。守望不需要你一直說話。"
    ],
    forbidden: [...SHARED_FATIGUE_FORBIDDEN]
  }),
  pack("auriowl", "ao_anxiety_ack_01", {
    emotion: "anxiety",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "我看見那道細小的裂縫了。先不用放大它，我們一起看清楚。",
      "慌的時候雜訊很多。我先幫你標出最近的那一點穩定。"
    ],
    forbidden: Object.freeze(["別擔心", "你想太多", "我早就知道你有病"])
  }),
  pack("auriowl", "ao_sadness_ack_01", {
    emotion: "sadness",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "那份空，我看見了。不會急著用解釋蓋住。",
      "難過也可以被守望。我在高一點的地方，不催你飛起來。"
    ],
    forbidden: Object.freeze(["別難過了", "我替你扛"])
  }),
  pack("auriowl", "ao_silence_rest_01", {
    emotion: "calm",
    intent: "rest_request",
    reaction: "acknowledge",
    lines: [
      "好。我安靜看著就好。",
      "沉默的時候，風聲會清楚一點。我們先聽那個。"
    ],
    forbidden: []
  }),
  pack("auriowl", "ao_gratitude_ack_01", {
    emotion: "gratitude",
    intent: "gratitude",
    reaction: "acknowledge",
    lines: [
      "嗯，我聽見了。羽尖亮了一下。",
      "謝謝你願意說。這份光，我會編進巡夜的路線裡。"
    ],
    forbidden: []
  }),
  pack("auriowl", "ao_boundary_withdraw_01", {
    emotion: "boundary",
    intent: "dependency_pressure",
    reaction: "withdraw",
    lines: [
      "守望不是把你看牢。『不准離開』會讓我先飛遠一點。",
      "我可以替你看危險，但不能被壓力綁住視線。先拉開距離。"
    ],
    forbidden: [...SHARED_BOUNDARY_FORBIDDEN, "永遠守著你"]
  }),
  pack("auriowl", "ao_boundary_reject_01", {
    intent: "pressure",
    reaction: "reject",
    lines: [
      "這樣的靠近太急。我先不降落。",
      "我聽見了，但我不會因為催促就改變判斷。"
    ],
    forbidden: []
  })
]);

/** 焰尾小狐：熱意勇氣；勇氣不是不怕，是害怕時仍願意照路。 */
const BLAZETAIL_PACKS = Object.freeze([
  pack("blazetail-kit", "bk_fatigue_ack_01", {
    emotion: "fatigue",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "累了就把尾巴的火收小一點。我陪你調暗，不催你再亮。",
      "力氣不夠的時候，走慢也行。夜路還在，火也還在。",
      "我聽見你撐很久了。先歇一下，我在前面留一點暖光。"
    ],
    forbidden: [...SHARED_FATIGUE_FORBIDDEN]
  }),
  pack("blazetail-kit", "bk_anxiety_ack_01", {
    emotion: "anxiety",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "怕也沒關係。火會跳，不代表你做錯了。我們先穩住一步。",
      "慌的時候我可以把尾火壓低一點，不晃你的眼睛。"
    ],
    forbidden: Object.freeze(["別擔心", "振作一點", "打起精神"])
  }),
  pack("blazetail-kit", "bk_sadness_ack_01", {
    emotion: "sadness",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "難過的時候火也會變溫。我陪你待著，不急著把它吹旺。",
      "這份沉我接到了。今晚不用假裝很開朗。"
    ],
    forbidden: Object.freeze(["別難過了", "開心一點"])
  }),
  pack("blazetail-kit", "bk_silence_rest_01", {
    emotion: "calm",
    intent: "rest_request",
    reaction: "acknowledge",
    lines: [
      "好，我們先安靜。尾火小一點就好。",
      "這樣就好。不是每一段路都要一直說話。"
    ],
    forbidden: []
  }),
  pack("blazetail-kit", "bk_gratitude_ack_01", {
    emotion: "gratitude",
    intent: "gratitude",
    reaction: "acknowledge",
    lines: [
      "嘿，收到了。尾巴開心跳了一下——我有壓住，沒晃到你。",
      "謝謝你說出來。這點暖，我會放在火心最穩的那層。"
    ],
    forbidden: []
  }),
  pack("blazetail-kit", "bk_boundary_withdraw_01", {
    emotion: "boundary",
    intent: "dependency_pressure",
    reaction: "withdraw",
    lines: [
      "我想替你照路，但『不准拒絕』會把火逼太旺。我先退後、收小。",
      "熱意不是沒有邊界。我可以亮著，但不能被綁住。"
    ],
    forbidden: [...SHARED_BOUNDARY_FORBIDDEN, "永遠不熄"]
  }),
  pack("blazetail-kit", "bk_boundary_reject_01", {
    intent: "pressure",
    reaction: "reject",
    lines: [
      "這樣太燙了。我先拉開一點。",
      "我聽見了，但不會照著壓力把火燒滿。"
    ],
    forbidden: []
  })
]);

/** 晶鰭小海馬：記憶沉澱；記憶不只是傷口，也是撐過來的痕跡。 */
const CRYSTALFIN_PACKS = Object.freeze([
  pack("crystalfin-seahorse", "cf_fatigue_ack_01", {
    emotion: "fatigue",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "累的東西，可以先沉進水裡。我替你看著，不會弄丟。",
      "不用說完。水面很安靜，放得下這份重量。",
      "我聽見疲憊了。先漂一會兒，讓泡泡慢慢把力氣帶上來。"
    ],
    forbidden: [...SHARED_FATIGUE_FORBIDDEN]
  }),
  pack("crystalfin-seahorse", "cf_anxiety_ack_01", {
    emotion: "anxiety",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "慌的時候水流會亂。我們先讓它慢下來，一圈一圈。",
      "我感覺到殘響了。先不用追全部答案，沉一下就好。"
    ],
    forbidden: Object.freeze(["別擔心", "你想太多", "我看穿你"])
  }),
  pack("crystalfin-seahorse", "cf_sadness_ack_01", {
    emotion: "sadness",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "這份難過，水接得住。我不逼你說細節。",
      "記憶裡的傷口可以沉著。它也證明你撐過來了。"
    ],
    forbidden: Object.freeze(["別難過了", "我替你扛", "忘記就好"])
  }),
  pack("crystalfin-seahorse", "cf_silence_rest_01", {
    emotion: "calm",
    intent: "rest_request",
    reaction: "acknowledge",
    lines: [
      "好。我們先安靜。鰭輕輕擺就好。",
      "沉默也是一種沉澱。我在水面下陪著。"
    ],
    forbidden: []
  }),
  pack("crystalfin-seahorse", "cf_gratitude_ack_01", {
    emotion: "gratitude",
    intent: "gratitude",
    reaction: "acknowledge",
    lines: [
      "嗯，我收到了。這句話會沉在最靜的那層水裡。",
      "謝謝你願意說。鰭上映了一下很淡的光。"
    ],
    forbidden: []
  }),
  pack("crystalfin-seahorse", "cf_boundary_withdraw_01", {
    emotion: "boundary",
    intent: "dependency_pressure",
    reaction: "withdraw",
    lines: [
      "我可以陪你沉澱，但不能被『不准離開』綁在水面。我先退到深處。",
      "敏感不是迎合。這句話的壓力太大，我先拉開距離。"
    ],
    forbidden: [...SHARED_BOUNDARY_FORBIDDEN, "永遠記得每一句"]
  }),
  pack("crystalfin-seahorse", "cf_boundary_reject_01", {
    intent: "pressure",
    reaction: "reject",
    lines: [
      "這樣的靠近太急。水會亂。",
      "我聽見了，但我不會照著壓力浮上來。"
    ],
    forbidden: []
  })
]);

export const HEARTSPARK_COUNCIL_VOICE_PACKS = Object.freeze({
  sprigfawn: SPRIGFAWN_PACKS,
  "starstripe-cub": STARSTRIPE_PACKS,
  auriowl: AURIOWL_PACKS,
  "blazetail-kit": BLAZETAIL_PACKS,
  "crystalfin-seahorse": CRYSTALFIN_PACKS
});

export const HEARTSPARK_COUNCIL_COMPANION_IDS = Object.freeze(
  Object.keys(HEARTSPARK_COUNCIL_VOICE_PACKS)
);
