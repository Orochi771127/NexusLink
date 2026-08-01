/**
 * Formal Growth stage -> Orbit embodiment projection.
 *
 * This module is intentionally pure. It never reads store/localStorage, never
 * writes Growth, and never loads an illustrated asset. The controller freezes
 * canonical Growth truth before the deterministic engine receives the result.
 */

export const ORBIT_FORMAL_STAGE_IDS = Object.freeze([
  "initial_awakened",
  "resonant_mature",
  "final_awakened"
]);

const STAGE_LABELS = Object.freeze({
  initial_awakened: "初醒夥伴",
  resonant_mature: "共鳴成熟體",
  final_awakened: "終局覺醒體"
});

const CORE_PROFILE = Object.freeze({
  collisionRadius: 1,
  inertia: 1,
  speedCap: 1,
  spinRetention: 1,
  turnAuthority: 1,
  signalReach: 1
});

// Every profile totals exactly 6.00. A larger contact field or inertia is paid
// for with speed/turn/spin trade-offs; no stage multiplies Impact or damage.
const STAGE_PROFILES = Object.freeze({
  initial_awakened: Object.freeze({
    collisionRadius: 1.12,
    inertia: 1.1,
    speedCap: 0.92,
    spinRetention: 0.94,
    turnAuthority: 0.92,
    signalReach: 1
  }),
  resonant_mature: Object.freeze({
    collisionRadius: 1,
    inertia: 0.94,
    speedCap: 0.94,
    spinRetention: 0.92,
    turnAuthority: 1,
    signalReach: 1.2
  }),
  final_awakened: Object.freeze({
    collisionRadius: 1.1,
    inertia: 1.16,
    speedCap: 0.88,
    spinRetention: 1.12,
    turnAuthority: 0.84,
    signalReach: 0.9
  })
});

export function orbitEmbodimentBudget(profile) {
  return [
    "collisionRadius",
    "inertia",
    "speedCap",
    "spinRetention",
    "turnAuthority",
    "signalReach"
  ].reduce((sum, key) => sum + Number(profile?.[key] || 0), 0);
}

export function getOrbitFormalStagePhysicsProfile(stageId) {
  return STAGE_PROFILES[stageId] || STAGE_PROFILES.initial_awakened;
}

function normalizeFormalStage(value) {
  return ORBIT_FORMAL_STAGE_IDS.includes(value)
    ? value
    : "initial_awakened";
}

function freezeOption(option) {
  return Object.freeze({
    ...option,
    normalizedPhysicsProfile: Object.freeze({
      ...option.normalizedPhysicsProfile
    })
  });
}

/**
 * @param {{
 *   companionId: string,
 *   companionName?: string,
 *   formalStage?: string,
 *   availableFormalStages?: string[],
 *   assetReadiness?: { ready?: boolean, stage?: string, status?: string, animationId?: string },
 *   requestedMode?: 'core' | 'formal_stage'
 * }} input
 */
export function projectOrbitEmbodimentProfile(input = {}) {
  const companionId = typeof input.companionId === "string"
    ? input.companionId
    : "";
  const requestedStage = normalizeFormalStage(input.formalStage);
  const availableFormalStages = Array.isArray(input.availableFormalStages)
    ? input.availableFormalStages.filter((stageId) =>
        ORBIT_FORMAL_STAGE_IDS.includes(stageId)
      )
    : [];
  const initialStageAvailable = availableFormalStages.includes(
    "initial_awakened"
  );
  const requestedStageAvailable = availableFormalStages.includes(
    requestedStage
  );
  const effectiveStage = requestedStageAvailable
    ? requestedStage
    : initialStageAvailable
      ? "initial_awakened"
      : null;
  const assetReady =
    effectiveStage !== null &&
    input.assetReadiness?.ready === true &&
    input.assetReadiness?.stage === effectiveStage;

  const coreOption = freezeOption({
    id: "core",
    label: "維持核心",
    hint: "保留原本較靈活的接觸半徑與轉向。",
    formalStage: null,
    manifestationIntent: "core",
    normalizedPhysicsProfile: CORE_PROFILE,
    budget: orbitEmbodimentBudget(CORE_PROFILE)
  });
  const options = [coreOption];

  if (effectiveStage) {
    const formalProfile = getOrbitFormalStagePhysicsProfile(effectiveStage);
    options.push(freezeOption({
      id: "formal_stage",
      label: `展開・${STAGE_LABELS[effectiveStage]}`,
      hint:
        effectiveStage === "initial_awakened"
          ? "外層共鳴場擴大接觸輪廓，以部分速度與轉向換取碰撞可讀性。"
          : "以等總預算改變接觸、慣性與關卡讀取方式。",
      formalStage: effectiveStage,
      manifestationIntent: assetReady ? "illustrated" : "aura",
      normalizedPhysicsProfile: formalProfile,
      budget: orbitEmbodimentBudget(formalProfile)
    }));
  }

  const requestedMode = input.requestedMode === "core"
    ? "core"
    : "formal_stage";
  const selectedMode = options.some((option) => option.id === requestedMode)
    ? requestedMode
    : "core";

  return Object.freeze({
    version: "orbit-embodiment-v2",
    companionId,
    companionName: input.companionName || companionId || "夥伴",
    requestedFormalStage: requestedStage,
    formalStage: effectiveStage,
    formalStageLabel: effectiveStage ? STAGE_LABELS[effectiveStage] : null,
    stageLegality: requestedStageAvailable
      ? "canonical"
      : initialStageAvailable
        ? "fallback_initial"
        : "unavailable",
    stageNotice: requestedStageAvailable
      ? ""
      : initialStageAvailable
        ? "後續形態線尚未封印；這次只展開已核准的初醒形態。"
        : "目前沒有可用的正式形態；這次維持核心。",
    assetReady,
    assetStatus: input.assetReadiness?.status || "missing",
    animationId: assetReady
      ? input.assetReadiness?.animationId || null
      : null,
    selectedMode,
    options: Object.freeze(options)
  });
}
