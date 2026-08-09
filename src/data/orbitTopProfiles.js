/**
 * Orbit top identity registry.
 *
 * This is presentation/profile data only. The fixed-step engine remains the
 * sole collision, energy, objective and outcome authority. A profile marked
 * Candidate paths remain available for local review, while an Owner-approved
 * `glbPath` may drive the live presentation without changing physics authority.
 */

export const ORBIT_TOP_PROFILE_SCHEMA_VERSION = 1;

const BASE_PHYSICS = Object.freeze({
  collisionRadius: 1,
  inertia: 1,
  speedCap: 1,
  spinRetention: 1,
  turnAuthority: 1,
  signalReach: 1
});

const GREYSHADE_RESONANCE = Object.freeze({
  collisionRadius: 0.92,
  inertia: 0.94,
  speedCap: 1.08,
  spinRetention: 1.09,
  turnAuthority: 1.06,
  signalReach: 0.91
});

const CRYSTALFIN_RESONANCE = Object.freeze({
  collisionRadius: 0.95,
  inertia: 0.95,
  speedCap: 1.05,
  spinRetention: 1.05,
  turnAuthority: 1,
  signalReach: 1
});

const RIFT_RESONANCE = Object.freeze({
  collisionRadius: 1.08,
  inertia: 1.05,
  speedCap: 0.95,
  spinRetention: 1.08,
  turnAuthority: 0.86,
  signalReach: 0.98
});

const PROFILES = Object.freeze({
  "greyshade-cat": Object.freeze({
    schemaVersion: ORBIT_TOP_PROFILE_SCHEMA_VERSION,
    id: "greyshade-cat-orbit-top-r1",
    ownerType: "companion",
    ownerId: "greyshade-cat",
    displayName: "灰影貓・心核迴旋",
    artStatus: "runtime-promoted-owner-approved",
    materialFamily: "nexus-clay-resin-miniature-v1",
    model: Object.freeze({
      glbPath: "assets/3d/orbit-tops-r1/greyshade-cat-orbit-top-r1.glb",
      candidateGlbPath:
        "output/global-3d-gameplay-pilots-r1/blender/greyshade-cat-orbit-top-r1.glb",
      baseNode: "BaseForm",
      resonanceNode: "ResonanceForm",
      spinAxis: Object.freeze([0, 0, 1]),
      bottomContactZ: 0,
      visualScale: 1
    }),
    forms: Object.freeze({
      base: Object.freeze({
        id: "base",
        label: "本相",
        physics: BASE_PHYSICS
      }),
      resonance: Object.freeze({
        id: "resonance",
        label: "共鳴形",
        physics: GREYSHADE_RESONANCE
      })
    }),
    palette: Object.freeze({
      clay: "#797d77",
      stripe: "#353a38",
      resin: "#55dff4",
      core: "#86f4ff",
      trim: "#d6bd77"
    })
  }),
  "crystalfin-seahorse": Object.freeze({
    schemaVersion: ORBIT_TOP_PROFILE_SCHEMA_VERSION,
    id: "crystalfin-seahorse-orbit-top-r2",
    ownerType: "companion",
    ownerId: "crystalfin-seahorse",
    displayName: "Crystalfin Seahorse Orbit Top R2 Pilot",
    artStatus: "runtime-promoted-owner-approved",
    materialFamily: "nexus-clay-resin-miniature-v1",
    model: Object.freeze({
      glbPath: "assets/3d/orbit-tops-r2/crystalfin-seahorse-orbit-top-r2.glb",
      candidateGlbPath:
        "output/global-3d-gameplay-pilots-r2/blender/crystalfin-seahorse-orbit-top-r2.glb",
      baseNode: "BaseForm",
      resonanceNode: "ResonanceForm",
      colliderProxyNode: "ColliderProxy_Deterministic2D",
      spinAxis: Object.freeze([0, 0, 1]),
      bottomContactZ: 0,
      visualScale: 1
    }),
    forms: Object.freeze({
      base: Object.freeze({
        id: "base",
        label: "Base form",
        physics: BASE_PHYSICS
      }),
      resonance: Object.freeze({
        id: "resonance",
        label: "Crystalfin resonance form",
        physics: CRYSTALFIN_RESONANCE
      })
    }),
    palette: Object.freeze({
      clay: "#237fc0",
      deepClay: "#0f3d77",
      resin: "#43d8fa",
      core: "#1fc5f5",
      ivory: "#e9e2be",
      trim: "#ddb85c"
    })
  }),
  "rift-echo": Object.freeze({
    schemaVersion: ORBIT_TOP_PROFILE_SCHEMA_VERSION,
    id: "rift-echo-orbit-top-r1",
    ownerType: "enemy",
    ownerId: "rift-echo",
    displayName: "裂隙回聲・心核迴旋",
    artStatus: "runtime-promoted-owner-approved",
    materialFamily: "nexus-clay-resin-miniature-v1",
    model: Object.freeze({
      glbPath: "assets/3d/orbit-tops-r1/rift-echo-orbit-top-r1.glb",
      candidateGlbPath:
        "output/global-3d-gameplay-pilots-r1/blender/rift-echo-orbit-top-r1.glb",
      baseNode: "BaseForm",
      resonanceNode: "ResonanceForm",
      spinAxis: Object.freeze([0, 0, 1]),
      bottomContactZ: 0,
      visualScale: 1
    }),
    forms: Object.freeze({
      base: Object.freeze({
        id: "base",
        label: "收束形",
        physics: BASE_PHYSICS
      }),
      resonance: Object.freeze({
        id: "resonance",
        label: "裂響形",
        physics: RIFT_RESONANCE
      })
    }),
    palette: Object.freeze({
      clay: "#302b42",
      resin: "#a765d1",
      core: "#ed719d",
      fault: "#ff8aa8",
      trim: "#c7b8aa"
    })
  })
});

export const ORBIT_TOP_PROFILE_IDS = Object.freeze(Object.keys(PROFILES));

export function getOrbitTopProfile(ownerId) {
  return PROFILES[String(ownerId || "")] || null;
}

export function createOrbitTopCombatFormConfig(
  companionId,
  {
    enemyId = "rift-echo",
    playerWindowOpensAt = 1.6,
    enemyWindowOpensAt = 3.2,
    resonanceDurationSeconds = 4.2
  } = {}
) {
  const player = getOrbitTopProfile(companionId);
  const dummy = getOrbitTopProfile(enemyId);
  if (!player || !dummy) return null;
  return {
    enabled: true,
    resonanceDurationSeconds,
    player: {
      profileId: player.id,
      forms: player.forms,
      windowOpensAt: playerWindowOpensAt,
      autoActivateAt: null
    },
    dummy: {
      profileId: dummy.id,
      forms: dummy.forms,
      windowOpensAt: enemyWindowOpensAt,
      autoActivateAt: enemyWindowOpensAt
    }
  };
}
