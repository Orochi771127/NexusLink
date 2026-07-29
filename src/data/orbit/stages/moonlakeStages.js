/**
 * 月湖五區二十五關。
 *
 * objectives 是依序執行的關卡語法；難度來自場地、流場與目標組合，
 * 不提供傳統 Easy / Normal / Hard 或戰力倍率。
 */

const point = (id, x, y, r = 0.1) => Object.freeze({ id, x, y, r });
const pillar = (x, y, r = 0.09) => Object.freeze({ x, y, r });
const objective = (type, extra = {}) => Object.freeze({ type, ...extra });

function makeStage(number, zoneId, zoneStageIndex, data) {
  const objectives = Object.freeze([...(data.objectives || [])]);
  return Object.freeze({
    id: `moonlake-${number}`,
    regionId: "moonlake",
    zoneId,
    index: number,
    zoneStageIndex,
    title: data.title,
    goalLabel: data.goalLabel,
    copy: data.copy,
    clearNarrative: data.clearNarrative,
    maxSeconds: data.maxSeconds || 60,
    arenaRadius: data.arenaRadius ?? 1,
    containedArena: data.containedArena === true,
    playerStart: Object.freeze(data.playerStart || { x: 0, y: 0.58 }),
    dummyStart: Object.freeze(data.dummyStart || { x: 0, y: -0.24 }),
    pillars: Object.freeze([...(data.pillars || [])]),
    memoryMotes: Object.freeze([...(data.memoryMotes || [])]),
    objectives,
    goal: objectives.length > 1 ? "sequence" : objectives[0]?.type || "reach_anchor",
    dummyEnabled: data.dummyEnabled === true ||
      objectives.some((entry) => entry.type === "clear_noise"),
    dummyName: data.dummyName || "月湖雜訊結",
    dummyStability: data.dummyStability || 72,
    dummyGuardBonus: data.dummyGuardBonus || 0,
    anchor: data.anchor ? Object.freeze(data.anchor) : null,
    resonanceZone: data.resonanceZone ? Object.freeze(data.resonanceZone) : null,
    softWell: data.softWell ? Object.freeze(data.softWell) : null,
    driftField: data.driftField ? Object.freeze(data.driftField) : null,
    physicsTuning: data.physicsTuning ? Object.freeze(data.physicsTuning) : undefined,
    collisionTuning: data.collisionTuning ? Object.freeze(data.collisionTuning) : undefined,
    unlocksNextRegion: number === 25 ? "plains" : undefined,
    objectives
  });
}

const resonance = (x = 0, y = 0, overrides = {}) => ({
  x,
  y,
  r: 0.22,
  maxSpeed: 0.55,
  holdSeconds: 0.5,
  brake: 8,
  ...overrides
});

export const MOONLAKE_STAGES = Object.freeze([
  // 星林步道：軌跡基礎
  makeStage(1, "starwood_trail", 1, {
    title: "林口初旋",
    goalLabel: "沿開放軌道抵達星林錨點",
    copy: "先感受一次啟動會留下怎樣的弧線。",
    clearNarrative: "林口亮起第一道穩定弧光。",
    anchor: { x: 0, y: -0.58, r: 0.15 },
    objectives: [objective("reach_anchor")]
  }),
  makeStage(2, "starwood_trail", 2, {
    title: "星芽掠光",
    goalLabel: "以任意順序掠過兩點星芽微光",
    copy: "兩點都在場上；路徑可以由你決定。",
    clearNarrative: "兩點星芽在同一條軌跡上回應。",
    memoryMotes: [point("starbud-a", -0.38, -0.12), point("starbud-b", 0.38, -0.22)],
    objectives: [objective("collect_motes", { ordered: false })]
  }),
  makeStage(3, "starwood_trail", 3, {
    title: "雙木折徑",
    goalLabel: "繞過雙木護柱，抵達林後錨點",
    copy: "護柱會改寫直線；利用反彈留下新的入口。",
    clearNarrative: "折徑沒有把你們推遠，反而替軌跡開了門。",
    arenaRadius: 0.9,
    pillars: [pillar(-0.28, 0.02, 0.11), pillar(0.28, -0.12, 0.11)],
    anchor: { x: 0, y: -0.62, r: 0.14 },
    objectives: [objective("reach_anchor")]
  }),
  makeStage(4, "starwood_trail", 4, {
    title: "枝風守圈",
    goalLabel: "在枝風圈內穩住 12 秒",
    copy: "不必清掉任何東西，只要一起留在場上。",
    clearNarrative: "枝風過去時，你們仍在同一個圈裡。",
    containedArena: true,
    pillars: [pillar(0, 0, 0.08)],
    physicsTuning: { friction: 0.18, driveScale: 0.7, speedCap: 2.9 },
    objectives: [objective("survive", { seconds: 12 })]
  }),
  makeStage(5, "starwood_trail", 5, {
    title: "星林回聲",
    goalLabel: "依序回收三點星光，再停入共鳴圈",
    copy: "把啟動、折徑與停泊接成一段完整回聲。",
    clearNarrative: "星林把三點微光送回中央，沒有催促下一步。",
    containedArena: true,
    memoryMotes: [
      point("star-echo-1", -0.4, 0.1),
      point("star-echo-2", 0.34, -0.05),
      point("star-echo-3", 0.1, -0.45)
    ],
    resonanceZone: resonance(0, 0),
    objectives: [
      objective("collect_motes", { ordered: true }),
      objective("resonate_zone")
    ]
  }),

  // 霧潮河岸：收束與克制
  makeStage(6, "misttide_shore", 1, {
    title: "霧岸輕推",
    goalLabel: "以低於 0.65 的速度停進岸邊錨點",
    copy: "這次不是抵達就好；要讓速度也願意安靜下來。",
    clearNarrative: "霧岸接受了這次不急的停泊。",
    containedArena: true,
    anchor: { x: 0.08, y: -0.56, r: 0.17 },
    objectives: [objective("reach_anchor", { maxSpeed: 0.65, holdSeconds: 0.25 })]
  }),
  makeStage(7, "misttide_shore", 2, {
    title: "潮回側流",
    goalLabel: "穿過側流，抵達回潮錨點",
    copy: "潮水從側邊推來；先讀方向，再決定啟動角度。",
    clearNarrative: "側流沒有替你們決定終點。",
    containedArena: true,
    anchor: { x: -0.42, y: -0.35, r: 0.15 },
    driftField: { x: 0.38, y: 0, strength: 0.42 },
    objectives: [objective("reach_anchor")]
  }),
  makeStage(8, "misttide_shore", 3, {
    title: "雙灣拾光",
    goalLabel: "順著漂流依序回收三點微光",
    copy: "兩個灣口的流向不同，光點必須依序接回。",
    clearNarrative: "漂流變成了可讀的節拍。",
    containedArena: true,
    driftField: { x: 0.2, y: -0.08, strength: 0.32 },
    memoryMotes: [
      point("bay-light-1", -0.38, 0.18),
      point("bay-light-2", 0.38, 0.02),
      point("bay-light-3", 0.08, -0.48)
    ],
    objectives: [objective("collect_motes", { ordered: true })]
  }),
  makeStage(9, "misttide_shore", 4, {
    title: "退潮窄徑",
    goalLabel: "在收窄水道中穩住 15 秒",
    copy: "退潮縮小了可用空間；守住邊界比追逐更重要。",
    clearNarrative: "水道很窄，但你們沒有互相逼迫。",
    containedArena: true,
    arenaRadius: 0.76,
    pillars: [pillar(-0.2, -0.05, 0.09), pillar(0.22, 0.16, 0.09)],
    physicsTuning: { friction: 0.2, driveScale: 0.6, speedCap: 2.65 },
    objectives: [objective("survive", { seconds: 15 })]
  }),
  makeStage(10, "misttide_shore", 5, {
    title: "霧潮定泊",
    goalLabel: "回收三點潮光，以低於 0.45 的速度停泊",
    copy: "最後一拍要求把漂流真正收束，而不是擦過中央。",
    clearNarrative: "三點潮光在霧中安靜定泊。",
    containedArena: true,
    memoryMotes: [
      point("mist-moor-1", -0.34, 0.18),
      point("mist-moor-2", 0.38, -0.02),
      point("mist-moor-3", 0.02, -0.42)
    ],
    resonanceZone: resonance(0, 0, { maxSpeed: 0.45, holdSeconds: 0.6 }),
    objectives: [
      objective("collect_motes", { ordered: true }),
      objective("resonate_zone")
    ]
  }),

  // 湖心倒影：鏡像精準
  makeStage(11, "mirror_hollow", 1, {
    title: "月影對位",
    goalLabel: "抵達與起點鏡像相對的錨點",
    copy: "看見起點在湖面的另一個位置。",
    clearNarrative: "月影與你們的軌跡短暫重合。",
    playerStart: { x: -0.36, y: 0.52 },
    anchor: { x: 0.36, y: -0.52, r: 0.14 },
    objectives: [objective("reach_anchor")]
  }),
  makeStage(12, "mirror_hollow", 2, {
    title: "倒影折返",
    goalLabel: "依序接回一對鏡像微光",
    copy: "先去，再回；兩個點彼此照見。",
    clearNarrative: "折返不是重來，而是把缺的一半接上。",
    memoryMotes: [point("mirror-pair-1", 0.42, -0.1), point("mirror-pair-2", -0.42, -0.1)],
    objectives: [objective("collect_motes", { ordered: true })]
  }),
  makeStage(13, "mirror_hollow", 3, {
    title: "雙月窄環",
    goalLabel: "在對稱護柱間穩住 15 秒",
    copy: "兩側都會反射速度，中央不是唯一答案。",
    clearNarrative: "雙月窄環沒有把你們夾成同一種走法。",
    containedArena: true,
    arenaRadius: 0.82,
    pillars: [pillar(-0.31, 0, 0.12), pillar(0.31, 0, 0.12)],
    physicsTuning: { friction: 0.18, driveScale: 0.64, speedCap: 2.75 },
    objectives: [objective("survive", { seconds: 15 })]
  }),
  makeStage(14, "mirror_hollow", 4, {
    title: "影軌回心",
    goalLabel: "依序接回外側雙光，再抵達中心錨點",
    copy: "先承認兩個外側方向，中心才會亮起。",
    clearNarrative: "外側的光被接住後，中心不再像命令。",
    containedArena: true,
    memoryMotes: [point("outer-left", -0.52, -0.05), point("outer-right", 0.52, -0.05)],
    anchor: { x: 0, y: 0, r: 0.15 },
    objectives: [
      objective("collect_motes", { ordered: true }),
      objective("reach_anchor")
    ]
  }),
  makeStage(15, "mirror_hollow", 5, {
    title: "湖心照見",
    goalLabel: "回收四點鏡光，回到湖心共鳴",
    copy: "四個方向都被看見之後，再決定是否回到中央。",
    clearNarrative: "湖心照見了完整軌跡，也保留每一段不同的方向。",
    containedArena: true,
    memoryMotes: [
      point("mirror-n", 0, -0.48),
      point("mirror-e", 0.48, 0),
      point("mirror-s", 0, 0.48),
      point("mirror-w", -0.48, 0)
    ],
    resonanceZone: resonance(0, 0, { holdSeconds: 0.55 }),
    objectives: [
      objective("collect_motes", { ordered: false }),
      objective("resonate_zone")
    ]
  }),

  // 晶岩遺跡：折光與複合
  makeStage(16, "crystal_ruins", 1, {
    title: "晶柱試響",
    goalLabel: "利用單柱折光，安定低強度雜訊",
    copy: "柱面會改變碰撞方向；讓反彈替你們工作。",
    clearNarrative: "第一根晶柱留下清脆、沒有壓迫感的回音。",
    pillars: [pillar(0, 0.03, 0.12)],
    dummyStability: 62,
    objectives: [objective("clear_noise")]
  }),
  makeStage(17, "crystal_ruins", 2, {
    title: "折光三柱",
    goalLabel: "穿過三柱折徑，抵達遺跡錨點",
    copy: "三次折向構成一條不直白的路。",
    clearNarrative: "折光把原本看不見的入口交了出來。",
    arenaRadius: 0.9,
    pillars: [pillar(-0.36, 0.12), pillar(0.02, -0.18), pillar(0.38, 0.08)],
    anchor: { x: 0, y: -0.62, r: 0.14 },
    objectives: [objective("reach_anchor")]
  }),
  makeStage(18, "crystal_ruins", 3, {
    title: "晶屑連鳴",
    goalLabel: "依序點亮四枚晶屑",
    copy: "每一枚晶屑都會提示下一次折向。",
    clearNarrative: "四聲連鳴沒有變成催促，而是一段可讀的句子。",
    containedArena: true,
    memoryMotes: [
      point("crystal-note-1", -0.46, 0.25),
      point("crystal-note-2", 0.28, 0.36),
      point("crystal-note-3", 0.45, -0.2),
      point("crystal-note-4", -0.18, -0.48)
    ],
    objectives: [objective("collect_motes", { ordered: true })]
  }),
  makeStage(19, "crystal_ruins", 4, {
    title: "共振壓力",
    goalLabel: "在主動雜訊與晶柱間穩住 18 秒",
    copy: "壓力會移動，但撤退始終可用。",
    clearNarrative: "共振壓力退去時，你們仍保留自己的節拍。",
    containedArena: true,
    dummyEnabled: true,
    pillars: [pillar(-0.34, 0), pillar(0.34, 0)],
    dummyStability: 120,
    physicsTuning: { friction: 0.17, driveScale: 0.68, speedCap: 2.8 },
    objectives: [objective("survive", { seconds: 18 })]
  }),
  makeStage(20, "crystal_ruins", 5, {
    title: "遺跡合奏",
    goalLabel: "回收三枚晶屑、安定雜訊，再抵達錨點",
    copy: "這一關把採集、對位與碰撞收成一段合奏。",
    clearNarrative: "遺跡沒有判定誰更強，只記下你們如何完成合奏。",
    containedArena: true,
    pillars: [pillar(-0.3, 0.08), pillar(0.32, -0.08)],
    memoryMotes: [
      point("ruin-song-1", -0.42, 0.28),
      point("ruin-song-2", 0.4, 0.18),
      point("ruin-song-3", 0, -0.4)
    ],
    dummyStability: 72,
    anchor: { x: 0, y: -0.62, r: 0.14 },
    objectives: [
      objective("collect_motes", { ordered: true }),
      objective("clear_noise"),
      objective("reach_anchor")
    ]
  }),

  // 裂隙觀測點：綜合觀測
  makeStage(21, "rift_observatory", 1, {
    title: "邊界預兆",
    goalLabel: "在邊界風壓中穩住 15 秒",
    copy: "先觀測裂隙如何靠近，不急著做出答案。",
    clearNarrative: "預兆被看見，但沒有被放大成命令。",
    containedArena: true,
    physicsTuning: { friction: 0.17, driveScale: 0.66, speedCap: 2.8 },
    objectives: [objective("survive", { seconds: 15 })]
  }),
  makeStage(22, "rift_observatory", 2, {
    title: "逆流轉向",
    goalLabel: "穿過會反轉的流場，抵達觀測錨點",
    copy: "流向會在場次中途反轉；保持可修正，而不是猜唯一答案。",
    clearNarrative: "逆流改變方向時，你們也保留了改變的權利。",
    containedArena: true,
    anchor: { x: 0.42, y: -0.42, r: 0.15 },
    driftField: { x: 0.36, y: 0, strength: 0.42, reverseEverySeconds: 4 },
    objectives: [objective("reach_anchor")]
  }),
  makeStage(23, "rift_observatory", 3, {
    title: "三相雜訊",
    goalLabel: "在三柱交界安定高穩定雜訊",
    copy: "三個折射面會讓正面撞擊失效；需要換角度。",
    clearNarrative: "三相雜訊散開時，觀測點留下清楚的邊界。",
    pillars: [pillar(-0.36, 0.12), pillar(0.36, 0.12), pillar(0, -0.3)],
    dummyStability: 108,
    dummyGuardBonus: 8,
    objectives: [objective("clear_noise")]
  }),
  makeStage(24, "rift_observatory", 4, {
    title: "裂隙回收",
    goalLabel: "依序回收四點裂光，再完成共鳴",
    copy: "裂光不是戰利品；它們只是需要被帶回可理解的位置。",
    clearNarrative: "四點裂光回到圈內，沒有變成可重複榨取的資源。",
    containedArena: true,
    memoryMotes: [
      point("rift-return-1", -0.46, 0.22),
      point("rift-return-2", 0.38, 0.3),
      point("rift-return-3", 0.46, -0.26),
      point("rift-return-4", -0.3, -0.4)
    ],
    resonanceZone: resonance(0, 0, { maxSpeed: 0.5, holdSeconds: 0.6 }),
    objectives: [
      objective("collect_motes", { ordered: true }),
      objective("resonate_zone")
    ]
  }),
  makeStage(25, "rift_observatory", 5, {
    title: "觀測終關",
    goalLabel: "撐住 12 秒、回收三點裂光，完成最終共鳴",
    copy: "六十秒內完成綜合觀測；撤退與重試始終存在。",
    clearNarrative: "月湖五條路在觀測圈中交會。你們完成的是理解，不是征服。",
    containedArena: true,
    maxSeconds: 60,
    pillars: [pillar(-0.3, 0), pillar(0.3, 0)],
    memoryMotes: [
      point("final-light-1", -0.42, 0.28),
      point("final-light-2", 0.42, 0.08),
      point("final-light-3", 0, -0.44)
    ],
    resonanceZone: resonance(0, 0, { maxSpeed: 0.48, holdSeconds: 0.65 }),
    physicsTuning: { friction: 0.18, driveScale: 0.64, speedCap: 2.75 },
    objectives: [
      objective("survive", { seconds: 12 }),
      objective("collect_motes", { ordered: true }),
      objective("resonate_zone")
    ]
  })
]);
