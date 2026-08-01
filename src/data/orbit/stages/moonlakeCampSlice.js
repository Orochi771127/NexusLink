/**
 * Moonlake Camp Hybrid Spin vertical slice.
 *
 * This is intentionally not part of MOONLAKE_STAGES yet. The controller only
 * opens it through ?orbitCampSlice=1 so the five-stage R2 route remains intact
 * until the slice passes human feel testing.
 */
export const MOONLAKE_CAMP_SLICE = Object.freeze({
  id: "moonlake-camp-slice",
  regionId: "moonlake",
  index: 0,
  title: "營火共鳴",
  goal: "collect_then_resonate",
  goalLabel: "依序掠過三個記憶光點，再停入營火共鳴圈",
  copy: "決定一次啟動的方向與力度，之後讓化身自己走完這段共鳴軌跡。",
  clearNarrative: "三點記憶沿著彎軌回到營火旁。月湖沒有催你們往前。",
  companionLine: "……我記得這條彎路。停在這裡，就很好。",
  sessionTrace: "營火邊留下一道淡淡的弧光；只在這次切片裡被看見。",
  dummyEnabled: false,
  containedArena: true,
  arenaRadius: 1,
  physicsTuning: Object.freeze({
    spinDecay: 9.5,
    friction: 0.32,
    driveScale: 0.12,
    speedCap: 3.4
  }),
  attunement: Object.freeze({
    minPullDistance: 0.24,
    maxPullDistance: 0.55
  }),
  embodiment: Object.freeze({
    enabled: true,
    defaultMode: "formal_stage",
    normalizedBudget: 6,
    affordance: "collision_and_signal_contact"
  }),
  defaultLaunchStanceId: "upright",
  launchStances: Object.freeze([
    Object.freeze({
      id: "upright",
      label: "直立",
      hint: "平衡：速度與彎軌都保持中性。",
      speedScale: 1,
      spinScale: 1,
      driveScale: 1,
      spinDirection: 1,
      tilt: 0.08,
      wobble: 0
    }),
    Object.freeze({
      id: "tilted",
      label: "傾斜",
      hint: "彎軌：起步稍慢，但更早向內畫弧。",
      speedScale: 0.9,
      spinScale: 0.96,
      driveScale: 0.92,
      spinDirection: 1,
      tilt: 0.46,
      wobble: 0.08
    }),
    Object.freeze({
      id: "conservative",
      label: "保守",
      hint: "穩定：速度較低、晃動較少，適合抓停圈。",
      speedScale: 0.76,
      spinScale: 1.08,
      driveScale: 0.72,
      spinDirection: 1,
      tilt: 0.03,
      wobble: 0
    })
  ]),
  resonancePulse: Object.freeze({
    enabled: true,
    label: "可見改軌",
    steerStrength: 0.34,
    travelSpeedScale: 0.92,
    settleSpeedScale: 0.66,
    spinBoost: 0,
    tiltRecovery: 0.1,
    wobbleRecovery: 0.16,
    flashSeconds: 0.36
  }),
  boundaryResonance: Object.freeze({
    chargeBudget: 1,
    minSpeed: 0.72,
    speedRetention: 0.96,
    spinRetention: 0.94,
    contactTolerance: 0.026,
    flashSeconds: 0.32,
    rails: Object.freeze([
      Object.freeze({
        id: "moonlake-east-rune",
        startDeg: 300,
        endDeg: 48,
        direction: -1
      }),
      Object.freeze({
        id: "moonlake-west-rune",
        startDeg: 132,
        endDeg: 228,
        direction: 1
      })
    ])
  }),
  playerStart: Object.freeze({ x: 0, y: 0.66 }),
  memoryMotes: Object.freeze([
    Object.freeze({ id: "camp-memory-1", x: 0.34, y: 0.34, r: 0.105 }),
    Object.freeze({ id: "camp-memory-2", x: 0.52, y: -0.08, r: 0.105 }),
    Object.freeze({ id: "camp-memory-3", x: 0.24, y: -0.42, r: 0.105 })
  ]),
  softWell: Object.freeze({
    x: 0,
    y: 0,
    radius: 0.74,
    strength: 0.62,
    damping: 0.32
  }),
  resonanceZone: Object.freeze({
    x: 0,
    y: 0,
    r: 0.23,
    maxSpeed: 0.52,
    holdSeconds: 0.42,
    brake: 8.5
  }),
  pillars: Object.freeze([])
});
