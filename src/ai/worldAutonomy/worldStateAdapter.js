/**
 * worldStateAdapter.js
 * Read-only bridge from the canonical game state to the schema that
 * `driveModel.js` and `worldObservationBuilder.js` already expect.
 *
 * Why this exists: the Phase 1 World Autonomy runtime reads
 * `state.companion.needs.{energy,hunger,boredom,loneliness}`,
 * `state.habitat.objects` and `state.player.isOnline` — none of which exist in
 * the canonical save. Only `state.energy` (0–10) is real. Rather than invent
 * those fields (which would make the companion narrate a world that is not
 * there), this adapter maps what IS real and marks everything else
 * `"unavailable"` so downstream layers can degrade honestly.
 *
 * 100% local: no network, no LLM, no persistence, no state mutation.
 *
 * ⚠️ 紅線 1 密封（見 CLAUDE.md 第 2 節）：
 * 這個轉接層**絕不**從「玩家上線頻率 / 離線多久 / 連續登入 / 孤獨程度」推導
 * loneliness、socialDrive 或任何保護行為。`player.isOnline` 固定為 false 且
 * 標記為 unavailable —— 夥伴的行為只能由牠自己的狀態驅動。
 * ⚠️ 紅線 6：本層不產生任何「你該回來了」的訊號，也沒有日課／連續天數概念。
 */

export const WORLD_AVAILABILITY = Object.freeze({
  OK: "ok",
  UNAVAILABLE: "unavailable"
});

/** Which canonical signal backs each drive produced by `driveModel.js`. */
export const DRIVE_SOURCE_FIELD = Object.freeze({
  restDrive: "energy",
  exploreDrive: "energy",
  foodDrive: "hunger",
  playDrive: "boredom",
  socialDrive: "loneliness"
});

const SAFE_HABITAT_IDS = Object.freeze(["moonlake"]);

/**
 * Build the synthetic runtime view consumed by the existing Phase 1 modules.
 * Neutral defaults are chosen so an unavailable need yields a ZERO drive —
 * an unbacked goal must never outscore a backed one.
 */
export function buildWorldRuntimeInput(state = {}, environment = null) {
  const energy10 = clampNumber(state?.energy, 0, 10, 10);
  const habitatId = typeof state?.activeHabitatId === "string" ? state.activeHabitatId : "";

  const runtimeState = {
    companion: {
      needs: {
        energy: Math.round((energy10 / 10) * 100),
        hunger: 0,
        boredom: 0,
        loneliness: 0
      }
    },
    habitat: {
      objects: [],
      isSafeZone: SAFE_HABITAT_IDS.includes(habitatId)
    },
    player: {
      // 紅線 1：永遠 false，永遠不從玩家在線狀態推導夥伴行為。
      isOnline: false
    },
    cooldowns: isPlainObject(state?.worldActionCooldowns) ? { ...state.worldActionCooldowns } : {},
    hasAvailableFood: false,
    environment: normalizeEnvironmentView(environment)
  };

  const availability = Object.freeze({
    energy: WORLD_AVAILABILITY.OK,
    hunger: WORLD_AVAILABILITY.UNAVAILABLE,
    boredom: WORLD_AVAILABILITY.UNAVAILABLE,
    loneliness: WORLD_AVAILABILITY.UNAVAILABLE,
    habitatObjects: WORLD_AVAILABILITY.UNAVAILABLE,
    playerPresence: WORLD_AVAILABILITY.UNAVAILABLE
  });

  return { runtimeState, availability };
}

/** True only when the canonical signal behind this drive actually exists. */
export function isDriveAvailable(availability = {}, driveName = "") {
  const field = DRIVE_SOURCE_FIELD[driveName];
  if (!field) return false;
  return availability?.[field] === WORLD_AVAILABILITY.OK;
}

/** List the drives a caller may honestly act on. */
export function listAvailableDrives(availability = {}) {
  return Object.keys(DRIVE_SOURCE_FIELD).filter((drive) => isDriveAvailable(availability, drive));
}

function normalizeEnvironmentView(environment) {
  if (!isPlainObject(environment)) return { timeOfDay: null, weather: null };
  const timeOfDay = typeof environment.sceneTimePhase === "string"
    ? environment.sceneTimePhase
    : typeof environment.timePhaseId === "string"
      ? environment.timePhaseId
      : typeof environment.timeOfDay === "string"
        ? environment.timeOfDay
        : null;
  const weather = typeof environment.weatherId === "string"
    ? environment.weatherId
    : typeof environment.weather === "string"
      ? environment.weather
      : null;
  return { timeOfDay, weather };
}

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, numeric));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
