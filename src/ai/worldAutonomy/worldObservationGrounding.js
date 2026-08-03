/**
 * worldObservationGrounding.js
 * Read-only world context for the dialogue layer.
 *
 * The existing reply pipeline can already understand the player; what it cannot
 * do is reference what the companion itself is doing. This module supplies that
 * — and only that. Every field is either a real value or `null` plus an
 * `"unavailable"` marker: **the companion must never narrate a world that is
 * not there.**
 *
 * Pure function: no store read, no DOM, no clock of its own, no mutation,
 * no network, no LLM.
 *
 * ⚠️ 紅線 1：這裡不含任何「玩家上線頻率／離線多久／依賴程度」欄位，未來也不得新增。
 * ⚠️ 紅線 6：這裡沒有進度、日課、倒數或未完成計數。
 */

import { WORLD_AVAILABILITY } from "./worldStateAdapter.js";
import { isKnownHabitatId } from "../../data/habitatRegistry.js";

export const GROUNDING_FIELDS = Object.freeze([
  "timeOfDay",
  "weather",
  "habitatId",
  "currentWorldAction",
  "lastCompletedWorldAction",
  "companionEnergy",
  "nearbyInteractableSummary"
]);

const VALID_TIME_OF_DAY = new Set(["dawn", "day", "dusk", "night"]);
const TIME_ALIASES = Object.freeze({
  morning: "dawn",
  noon: "day",
  afternoon: "day",
  evening: "dusk"
});
const VALID_WEATHER = new Set(["clear", "rain", "mist"]);
const WEATHER_ALIASES = Object.freeze({
  rainy: "rain",
  drizzle: "rain",
  fog: "mist",
  foggy: "mist",
  clear_sky: "clear"
});

/**
 * @param {object} params
 * @param {object} params.state Canonical game state (read-only).
 * @param {object|null} params.environment Injected environment snapshot, e.g.
 *   `environmentController.getEnvironmentState()`. Injected rather than read so
 *   this stays a pure function.
 * @param {object|null} params.worldTick Latest `runWorldAutonomyLoop` result.
 */
export function buildWorldGrounding({ state = {}, environment = null, worldTick = null } = {}) {
  const availability = {};

  const timeOfDay = normalizeTimeOfDay(
    environment?.sceneTimePhase ?? environment?.timePhaseId ?? environment?.timeOfDay
  );
  availability.timeOfDay = mark(timeOfDay);

  const weather = normalizeWeather(environment?.weatherId ?? environment?.weather);
  availability.weather = mark(weather);

  const rawHabitatId = typeof state?.activeHabitatId === "string" ? state.activeHabitatId : "";
  const habitatId = isKnownHabitatId(rawHabitatId) ? rawHabitatId : null;
  availability.habitatId = mark(habitatId);

  const currentWorldAction = normalizeActionId(worldTick?.statePatch?.actionId);
  availability.currentWorldAction = mark(currentWorldAction);

  const lastCompletedWorldAction = normalizeActionId(worldTick?.lastCompletedActionId);
  availability.lastCompletedWorldAction = mark(lastCompletedWorldAction);

  const companionEnergy = normalizeEnergyBand(state?.energy);
  availability.companionEnergy = mark(companionEnergy);

  // No interactable-object system exists yet; an empty habitat is not the same
  // as a known-empty habitat, so this stays unavailable rather than "nothing".
  const nearbyInteractableSummary = normalizeInteractables(worldTick?.observations?.habitatObjects);
  availability.nearbyInteractableSummary = mark(nearbyInteractableSummary);

  return Object.freeze({
    timeOfDay,
    weather,
    habitatId,
    currentWorldAction,
    lastCompletedWorldAction,
    companionEnergy,
    nearbyInteractableSummary,
    availability: Object.freeze(availability)
  });
}

/** Fields a reply may safely reference. Anything else would be invention. */
export function listGroundedFields(grounding = {}) {
  const availability = grounding?.availability || {};
  return GROUNDING_FIELDS.filter((field) => availability[field] === WORLD_AVAILABILITY.OK);
}

export function hasAnyGrounding(grounding = {}) {
  return listGroundedFields(grounding).length > 0;
}

function mark(value) {
  return value === null || value === undefined
    ? WORLD_AVAILABILITY.UNAVAILABLE
    : WORLD_AVAILABILITY.OK;
}

function normalizeTimeOfDay(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  const resolved = TIME_ALIASES[normalized] || normalized;
  return VALID_TIME_OF_DAY.has(resolved) ? resolved : null;
}

function normalizeWeather(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  const resolved = WEATHER_ALIASES[normalized] || normalized;
  return VALID_WEATHER.has(resolved) ? resolved : null;
}

function normalizeActionId(value) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized && normalized !== "idle" ? normalized : null;
}

/** Coarse band only — dialogue should reference a feeling, not a number. */
function normalizeEnergyBand(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const clamped = Math.max(0, Math.min(10, numeric));
  if (clamped <= 3) return "low";
  if (clamped <= 6) return "mid";
  return "high";
}

function normalizeInteractables(objects) {
  if (!Array.isArray(objects) || objects.length === 0) return null;
  const ids = objects
    .map((entry) => (typeof entry?.id === "string" ? entry.id.trim() : ""))
    .filter(Boolean)
    .slice(0, 3);
  return ids.length ? Object.freeze({ count: objects.length, ids: Object.freeze(ids) }) : null;
}
