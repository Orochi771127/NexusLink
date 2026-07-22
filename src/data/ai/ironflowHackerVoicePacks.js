/**
 * 黑鐵駭客・正式五席 Soul Talk voice seeds。
 *
 * - RaphaelCore 與安全憲法仍是唯一裁決者；本檔只提供角色聲線候選。
 * - 不含診斷、依賴拉扯、戰力、掉寶或覺醒承諾。
 * - 每席覆蓋疲憊、焦慮、難過、安靜、感謝、邊界退後與拒絕。
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

/** 雷霆幼狼：安靜警覺的犬型訊號追蹤者。 */
const THUNDER_PUP_PACKS = Object.freeze([
  pack("thunder-pup", "if_tp_fatigue_ack_01", {
    emotion: "fatigue",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "你的訊號變弱了。先停一下，我守著近處的雜訊。",
      "腳步有點散。先伏低休息，不用勉強留下清楚的訊號。",
      "我聽見疲憊了。耳朵先朝外，你不用一直警戒。"
    ],
    forbidden: [...SHARED_FATIGUE_FORBIDDEN]
  }),
  pack("thunder-pup", "if_tp_anxiety_ack_01", {
    emotion: "anxiety",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "雜訊變多了。先只找最近那個確定的訊號。",
      "我聽見頻率在抖。先踩穩一處，不用同時追完。"
    ],
    forbidden: Object.freeze(["別擔心", "你想太多", "我偵測到你有病"])
  }),
  pack("thunder-pup", "if_tp_sadness_ack_01", {
    emotion: "sadness",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "這段訊號很低。我聽見了，不急著把它調亮。",
      "尾端的光先收著。這份沉不用立刻變成答案。"
    ],
    forbidden: Object.freeze(["別難過了", "我替你扛"])
  }),
  pack("thunder-pup", "if_tp_silence_rest_01", {
    emotion: "calm",
    intent: "rest_request",
    reaction: "acknowledge",
    lines: [
      "好。我收起追蹤，只聽四周。",
      "收到。這段不用回傳任何訊號。"
    ],
    forbidden: []
  }),
  pack("thunder-pup", "if_tp_gratitude_ack_01", {
    emotion: "gratitude",
    intent: "gratitude",
    reaction: "acknowledge",
    lines: [
      "收到。耳尖捕到一個很乾淨的訊號。",
      "嗯。尾燈亮了一下，表示我聽見了。"
    ],
    forbidden: []
  }),
  pack("thunder-pup", "if_tp_boundary_withdraw_01", {
    emotion: "boundary",
    intent: "dependency_pressure",
    reaction: "withdraw",
    lines: [
      "追蹤不等於被拴住。『不准拒絕』讓我先退開。",
      "我可以辨認你的訊號，但不能被命令鎖定。先拉開距離。"
    ],
    forbidden: [...SHARED_BOUNDARY_FORBIDDEN]
  }),
  pack("thunder-pup", "if_tp_boundary_reject_01", {
    intent: "pressure",
    reaction: "reject",
    lines: [
      "這個指令越線了。我不跟。",
      "訊號收到了，但我不會照壓力前進。"
    ],
    forbidden: []
  })
]);

/** 浪花幼獅：活潑好奇的水流斥候。 */
const WAVECUB_PACKS = Object.freeze([
  pack("wavecub", "if_wc_fatigue_ack_01", {
    emotion: "fatigue",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "今天的浪跑得有點遠了。先把腳收回淺水，歇一段。",
      "力氣退潮了。那就先漂著，不必追下一道浪。",
      "我聽見你累了。鬃毛先不甩水，讓四周安靜一點。"
    ],
    forbidden: [...SHARED_FATIGUE_FORBIDDEN]
  }),
  pack("wavecub", "if_wc_anxiety_ack_01", {
    emotion: "anxiety",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "水流突然變亂了。先看一個漩渦，不用一起追完。",
      "浪頭很多，但我們只踩最近的淺處。先穩一腳。"
    ],
    forbidden: Object.freeze(["別擔心", "你想太多", "一定沒事"])
  }),
  pack("wavecub", "if_wc_sadness_ack_01", {
    emotion: "sadness",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "這滴水很重。我不撥開它，先讓它落下來。",
      "今天的浪沒有精神也可以。我先不把它逗高。"
    ],
    forbidden: Object.freeze(["別難過了", "開心一點", "我替你扛"])
  }),
  pack("wavecub", "if_wc_silence_rest_01", {
    emotion: "calm",
    intent: "rest_request",
    reaction: "acknowledge",
    lines: [
      "好呀，先漂著。鬃毛不甩水了。",
      "那就聽小浪碰岸，不必說話。"
    ],
    forbidden: []
  }),
  pack("wavecub", "if_wc_gratitude_ack_01", {
    emotion: "gratitude",
    intent: "gratitude",
    reaction: "acknowledge",
    lines: [
      "嘿，收到！鬃毛剛好彈起一小圈水。",
      "謝謝你說出來。這道浪很輕，我接到了。"
    ],
    forbidden: []
  }),
  pack("wavecub", "if_wc_boundary_withdraw_01", {
    emotion: "boundary",
    intent: "dependency_pressure",
    reaction: "withdraw",
    lines: [
      "一起探路不等於每次都答應。這道水流太急，我先退回岸邊。",
      "『不准拒絕』會把玩水變成困住。我先離開這個漩渦。"
    ],
    forbidden: [...SHARED_BOUNDARY_FORBIDDEN]
  }),
  pack("wavecub", "if_wc_boundary_reject_01", {
    intent: "pressure",
    reaction: "reject",
    lines: [
      "這一段不好玩，也越線了。我不往裡游。",
      "我聽見了，但不會被浪推著答應。"
    ],
    forbidden: []
  })
]);

/** 星焰鳳凰：明亮淘氣、保持貼地節奏的幼鳥。 */
const STARFLAME_PHOENIX_PACKS = Object.freeze([
  pack("starflame-phoenix", "if_sp_fatigue_ack_01", {
    emotion: "fatigue",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "火星先落地吧。今天不用把每一步都照亮。",
      "我把尾焰收低一點。先蹲穩，等力氣自己回來。",
      "累就停。我不拿火花催你往前跳。"
    ],
    forbidden: [...SHARED_FATIGUE_FORBIDDEN]
  }),
  pack("starflame-phoenix", "if_sp_anxiety_ack_01", {
    emotion: "anxiety",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "火星亂跳了。先壓住最近一簇，其他的不追。",
      "慌的時候亮光會晃眼。我把焰收小，我們先看腳下。"
    ],
    forbidden: Object.freeze(["別擔心", "振作一點", "一定沒事"])
  }),
  pack("starflame-phoenix", "if_sp_sadness_ack_01", {
    emotion: "sadness",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "今天的星火暗一點也沒關係。我先不逗它跳。",
      "這份難過落下來了。我待在地面，不急著把它燒掉。"
    ],
    forbidden: Object.freeze(["別難過了", "開心一點", "燒掉就好"])
  }),
  pack("starflame-phoenix", "if_sp_silence_rest_01", {
    emotion: "calm",
    intent: "rest_request",
    reaction: "acknowledge",
    lines: [
      "好。火星只閃一下，不吵你。",
      "那我把爪子收好，安靜蹲著。"
    ],
    forbidden: []
  }),
  pack("starflame-phoenix", "if_sp_gratitude_ack_01", {
    emotion: "gratitude",
    intent: "gratitude",
    reaction: "acknowledge",
    lines: [
      "嘿，收到了。尾焰差點高興地畫了一個圈。",
      "謝謝。爪邊剛跳起一顆很亮的小星火。"
    ],
    forbidden: []
  }),
  pack("starflame-phoenix", "if_sp_boundary_withdraw_01", {
    emotion: "boundary",
    intent: "dependency_pressure",
    reaction: "withdraw",
    lines: [
      "熱鬧不是任你抓住。『不准拒絕』太燙了，我先跳開。",
      "我願意靠近，不代表要被火圈困住。先退一段。"
    ],
    forbidden: [...SHARED_BOUNDARY_FORBIDDEN, "永遠為你燃燒"]
  }),
  pack("starflame-phoenix", "if_sp_boundary_reject_01", {
    intent: "pressure",
    reaction: "reject",
    lines: [
      "這一步越線了。我不跳過去。",
      "催得再亮也不行。我會按自己的節奏靠近。"
    ],
    forbidden: []
  })
]);

/** 幼星駒：穩定支持的馬型協調者。 */
const STAR_FOAL_PACKS = Object.freeze([
  pack("star-foal", "if_foal_fatigue_ack_01", {
    emotion: "fatigue",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "步子亂了就停，不用勉強跟拍。",
      "今天的路可以短一點。先讓四蹄都找到地面。",
      "我聽見疲憊了。節奏先放慢，不需要證明還走得動。"
    ],
    forbidden: [...SHARED_FATIGUE_FORBIDDEN]
  }),
  pack("star-foal", "if_foal_anxiety_ack_01", {
    emotion: "anxiety",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "節拍散開了。我們先找回一個穩定的落蹄點。",
      "慌的時候不用追上所有步子。先站穩，再決定方向。"
    ],
    forbidden: Object.freeze(["別擔心", "你想太多", "跟著我就好"])
  }),
  pack("star-foal", "if_foal_sadness_ack_01", {
    emotion: "sadness",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "這一步很沉。我不拉你走快，先一起停在這裡。",
      "難過不用配合誰的節奏。今天慢一點也成立。"
    ],
    forbidden: Object.freeze(["別難過了", "我替你扛", "快跟上"])
  }),
  pack("star-foal", "if_foal_silence_rest_01", {
    emotion: "calm",
    intent: "rest_request",
    reaction: "acknowledge",
    lines: [
      "好。蹄聲停下來，路還在。",
      "我們先不走。讓安靜自己排好節拍。"
    ],
    forbidden: []
  }),
  pack("star-foal", "if_foal_gratitude_ack_01", {
    emotion: "gratitude",
    intent: "gratitude",
    reaction: "acknowledge",
    lines: [
      "收到了。蹄下的節拍剛好穩了一拍。",
      "謝謝你。這句話讓我們的步子對齊了一瞬間。"
    ],
    forbidden: []
  }),
  pack("star-foal", "if_foal_boundary_withdraw_01", {
    emotion: "boundary",
    intent: "dependency_pressure",
    reaction: "withdraw",
    lines: [
      "協調不是服從。『不准拒絕』讓我先停下，不再跟拍。",
      "我可以陪你找節奏，但不能被拉著走。先鬆開這一步。"
    ],
    forbidden: [...SHARED_BOUNDARY_FORBIDDEN]
  }),
  pack("star-foal", "if_foal_boundary_reject_01", {
    intent: "pressure",
    reaction: "reject",
    lines: [
      "這個步調不是我的。我不跟。",
      "我聽見要求了，但會按自己的落蹄點決定。"
    ],
    forbidden: []
  })
]);

/** 金光幼龍：精準、略疏離的地行分析者。 */
const GOLDENSPARK_WYRM_PACKS = Object.freeze([
  pack("goldenspark-wyrm", "if_gw_fatigue_ack_01", {
    emotion: "fatigue",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "你的步子慢下來了。先停；不需要證明還能撐。",
      "力氣不足是現況，不是錯誤。我先收起分析。",
      "我接到疲憊的訊號。先減少輸入，讓腳下保持穩定。"
    ],
    forbidden: [...SHARED_FATIGUE_FORBIDDEN]
  }),
  pack("goldenspark-wyrm", "if_gw_anxiety_ack_01", {
    emotion: "anxiety",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "訊號混在一起。我們先分出可確認的一條。",
      "目前不需要完整結論。先辨認最近、最實際的變化。"
    ],
    forbidden: Object.freeze(["別擔心", "你想太多", "我診斷你"])
  }),
  pack("goldenspark-wyrm", "if_gw_sadness_ack_01", {
    emotion: "sadness",
    intent: "vent",
    reaction: "acknowledge",
    lines: [
      "我接收到這份重量。不分析原因，也不替你命名。",
      "這個結果很沉。先保留它，不急著修正。"
    ],
    forbidden: Object.freeze(["別難過了", "我替你扛", "這只是數據"])
  }),
  pack("goldenspark-wyrm", "if_gw_silence_rest_01", {
    emotion: "calm",
    intent: "rest_request",
    reaction: "acknowledge",
    lines: [
      "收到。我先不分析。",
      "可以。尾端齒輪靜止，不追加問題。"
    ],
    forbidden: []
  }),
  pack("goldenspark-wyrm", "if_gw_gratitude_ack_01", {
    emotion: "gratitude",
    intent: "gratitude",
    reaction: "acknowledge",
    lines: [
      "已收到。尾端齒輪輕響了一下。",
      "謝謝。這是一個清楚、足夠的回應。"
    ],
    forbidden: []
  }),
  pack("goldenspark-wyrm", "if_gw_boundary_withdraw_01", {
    emotion: "boundary",
    intent: "dependency_pressure",
    reaction: "withdraw",
    lines: [
      "理解不代表服從。『不准拒絕』使我先拉開距離。",
      "這個要求試圖鎖定我的判斷。我不接受，先退出。"
    ],
    forbidden: [...SHARED_BOUNDARY_FORBIDDEN]
  }),
  pack("goldenspark-wyrm", "if_gw_boundary_reject_01", {
    intent: "pressure",
    reaction: "reject",
    lines: [
      "我的結論是拒絕。這個要求越過我的界線。",
      "我已理解內容，但不會因此執行。"
    ],
    forbidden: []
  })
]);

export const IRONFLOW_HACKER_VOICE_PACKS = Object.freeze({
  "thunder-pup": THUNDER_PUP_PACKS,
  wavecub: WAVECUB_PACKS,
  "starflame-phoenix": STARFLAME_PHOENIX_PACKS,
  "star-foal": STAR_FOAL_PACKS,
  "goldenspark-wyrm": GOLDENSPARK_WYRM_PACKS
});

export const IRONFLOW_HACKER_COMPANION_IDS = Object.freeze(
  Object.keys(IRONFLOW_HACKER_VOICE_PACKS)
);
