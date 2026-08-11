/**
 * Owner-approved Expedition action presentation profiles.
 *
 * These profiles only observe existing combat-log facts. They do not mutate
 * Expedition state, relationship, rewards, Growth, safety or save data.
 * `?expeditionActionPilot=0` remains the explicit fallback/QA escape hatch.
 */

export const EXPEDITION_ACTION_PILOT_QUERY = "expeditionActionPilot";

const R2_GREYSHADE_RUNTIME_ROOT =
  "./assets/characters/greyshade-cat/spritesheets/expedition/r2/runtime-256";
const R2_ENEMY_RUNTIME_ROOT =
  "./assets/enemies/rift-root-echo/expedition/r2/runtime-256";
const R3_BLAZETAIL_RUNTIME_ROOT =
  "./assets/characters/blazetail-kit/spritesheets/expedition/r3/runtime-256";
const ACTION_DIRECTIONS = Object.freeze([
  "north",
  "northeast",
  "east",
  "southeast",
  "south",
  "southwest",
  "west",
  "northwest"
]);

function directionSheets(action, frameCount, runtimeRoot = R2_GREYSHADE_RUNTIME_ROOT, ownerPrefix = "greyshade") {
  return Object.freeze(Object.fromEntries(ACTION_DIRECTIONS.map((direction) => [
    direction,
    `${runtimeRoot}/${ownerPrefix}-${action}-${direction}-runtime-${256 * frameCount}x256-${frameCount}f.png`
  ])));
}

const COMPANION_PROFILES = Object.freeze({
  "greyshade-cat": Object.freeze({
    ownerType: "companion",
    ownerId: "greyshade-cat",
    artStatus: "runtime-promoted-owner-approved",
    runtimePromotion: true,
    anchor: Object.freeze({ x: 0.5, y: 1 }),
    onScreenHeight: 112,
    actions: Object.freeze({
      attack_basic: Object.freeze({
        frameWidth: 256,
        frameHeight: 256,
        frameCount: 6,
        columns: 6,
        rows: 1,
        fps: 10,
        loop: false,
        directions: directionSheets("attack", 6),
        fallbackDirection: "south",
        presentationMeaning: "boundary-setting resonance gesture"
      }),
      hit: Object.freeze({
        frameWidth: 256,
        frameHeight: 256,
        frameCount: 4,
        columns: 4,
        rows: 1,
        fps: 12,
        loop: false,
        directions: directionSheets("hit", 4),
        fallbackDirection: "south",
        presentationMeaning: "brief boundary recoil without injury spectacle"
      })
    })
  }),
  "blazetail-kit": Object.freeze({
    ownerType: "companion",
    ownerId: "blazetail-kit",
    artStatus: "runtime-promoted-owner-approved",
    runtimePromotion: true,
    anchor: Object.freeze({ x: 0.5, y: 1 }),
    onScreenHeight: 112,
    actions: Object.freeze({
      attack_basic: Object.freeze({
        frameWidth: 256,
        frameHeight: 256,
        frameCount: 6,
        columns: 6,
        rows: 1,
        fps: 10,
        loop: false,
        directions: directionSheets("attack", 6, R3_BLAZETAIL_RUNTIME_ROOT, "blazetail"),
        fallbackDirection: "south",
        presentationMeaning: "warm boundary-setting warding gesture"
      }),
      hit: Object.freeze({
        frameWidth: 256,
        frameHeight: 256,
        frameCount: 4,
        columns: 4,
        rows: 1,
        fps: 12,
        loop: false,
        directions: directionSheets("hit", 4, R3_BLAZETAIL_RUNTIME_ROOT, "blazetail"),
        fallbackDirection: "south",
        presentationMeaning: "brief resilient recoil without injury spectacle"
      })
    })
  })
});

const ENEMY_PROFILES = Object.freeze({
  "rift-root-echo": Object.freeze({
    ownerType: "enemy",
    ownerId: "rift-root-echo",
    artStatus: "runtime-promoted-owner-approved",
    runtimePromotion: true,
    anchor: Object.freeze({ x: 0.5, y: 1 }),
    onScreenHeight: 92,
    actions: Object.freeze({
      move: Object.freeze({
        sheet: `${R2_ENEMY_RUNTIME_ROOT}/rift-root-echo-move-south-runtime-2048x256-8f.png`,
        frameWidth: 256,
        frameHeight: 256,
        frameCount: 8,
        columns: 8,
        rows: 1,
        fps: 10,
        loop: true,
        facing: "south"
      }),
      attack: Object.freeze({
        sheet: `${R2_ENEMY_RUNTIME_ROOT}/rift-root-echo-attack-south-runtime-1536x256-6f.png`,
        frameWidth: 256,
        frameHeight: 256,
        frameCount: 6,
        columns: 6,
        rows: 1,
        fps: 10,
        loop: false,
        facing: "south",
        presentationMeaning: "rift pressure pulse"
      })
    })
  })
});

export function getExpeditionCompanionActionPilotProfile(companionId) {
  return COMPANION_PROFILES[String(companionId || "")] || null;
}

export function getExpeditionEnemyActionPilotProfile(enemyId = "rift-root-echo") {
  return ENEMY_PROFILES[String(enemyId || "")] || ENEMY_PROFILES["rift-root-echo"];
}

export function isExpeditionActionPilotRequested(search = globalThis.location?.search) {
  if (typeof search !== "string" || typeof globalThis.URLSearchParams !== "function") {
    return true;
  }
  const value = new globalThis.URLSearchParams(search).get(EXPEDITION_ACTION_PILOT_QUERY);
  return value !== "0";
}
