export const EXPEDITION_WALK_DIRECTIONS = Object.freeze([
  "north",
  "northeast",
  "east",
  "southeast",
  "south",
  "southwest",
  "west",
  "northwest"
]);

const GREYSHADE_WALK_RUNTIME_ROOT =
  "./assets/characters/greyshade-cat/spritesheets/expedition/r1/runtime-256";
const BLAZETAIL_WALK_RUNTIME_ROOT =
  "./assets/characters/blazetail-kit/spritesheets/expedition/r3/runtime-256";

const EXPEDITION_SPRITE_PROFILES = Object.freeze({
  "greyshade-cat": Object.freeze({
    companionId: "greyshade-cat",
    artStatus: "runtime-promoted-owner-approved",
    runtimePromotion: true,
    localPilotQuery: "expedition8dirPilot",
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 8,
    columns: 8,
    rows: 1,
    fps: 10,
    onScreenHeight: 112,
    anchor: Object.freeze({ x: 0.5, y: 1 }),
    directions: Object.freeze(Object.fromEntries(
      EXPEDITION_WALK_DIRECTIONS.map((direction) => [
        direction,
        `${GREYSHADE_WALK_RUNTIME_ROOT}/greyshade-walk-${direction}-runtime-2048x256-8f.png`
      ])
    ))
  }),
  "blazetail-kit": Object.freeze({
    companionId: "blazetail-kit",
    artStatus: "runtime-promoted-owner-approved",
    runtimePromotion: true,
    localPilotQuery: "expedition8dirPilot",
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 8,
    columns: 8,
    rows: 1,
    fps: 10,
    onScreenHeight: 112,
    anchor: Object.freeze({ x: 0.5, y: 1 }),
    directions: Object.freeze(Object.fromEntries(
      EXPEDITION_WALK_DIRECTIONS.map((direction) => [
        direction,
        `${BLAZETAIL_WALK_RUNTIME_ROOT}/blazetail-walk-${direction}-runtime-2048x256-8f.png`
      ])
    ))
  })
});

export function getExpeditionSpritePilotProfile(companionId) {
  return EXPEDITION_SPRITE_PROFILES[companionId] || null;
}

export function isExpeditionSpritePilotRequested(companionId, search = globalThis.location?.search) {
  const profile = getExpeditionSpritePilotProfile(companionId);
  if (!profile || typeof search !== "string" || typeof globalThis.URLSearchParams !== "function") {
    return false;
  }
  const queryValue = new globalThis.URLSearchParams(search).get(profile.localPilotQuery);
  if (queryValue === "0") return false;
  return profile.runtimePromotion === true || queryValue === "1";
}
