/**
 * Declarative BGM registry — stable scene IDs only (no Chinese display labels).
 * Paths are relative for GitHub Pages. Do not invent missing assets.
 */

export const BGM_SCENE = Object.freeze({
  START: "screen:start",
  COMPANION_SELECT: "screen:companion-select",
  HABITAT_PREFIX: "habitat:",
  FALLBACK: "fallback:legacy"
});

const TRACKS = Object.freeze({
  login: "./assets/audio/linkara/bgm_login_page.mp3",
  // Owner-confirmed 2026-07-24: companion-select uses linkara lofi.
  companionSelect: "./assets/audio/linkara/bgm_linkara_lofi.mp3",
  // Owner-corrected 2026-07-24: Moonlake uses ethereal moon lakefront.
  moonlake: "./assets/audio/linkara/bgm_ethereal_moon_lakefront.mp3",
  plains: "./assets/audio/linkara/bgm_northern_verdant_plains.mp3",
  forge: "./assets/audio/linkara/bgm_southeast_forge_hills.mp3",
  harbor: "./assets/audio/linkara/bgm_southern_harbor_nexus.mp3",
  core: "./assets/audio/linkara/bgm_central_radiant_core.mp3",
  tidal: "./assets/audio/linkara/bgm_southwest_tidal_frontier.mp3",
  mystic: "./assets/audio/linkara/bgm_eastern_mystic_mountains.mp3",
  legacyFallback: "./assets/audio/bgm_nexuslink.m4a"
});

const SCENE_TO_SRC = Object.freeze({
  [BGM_SCENE.START]: TRACKS.login,
  [BGM_SCENE.COMPANION_SELECT]: TRACKS.companionSelect,
  "habitat:moonlake": TRACKS.moonlake,
  "habitat:plains": TRACKS.plains,
  "habitat:forge": TRACKS.forge,
  "habitat:harbor": TRACKS.harbor,
  "habitat:core": TRACKS.core,
  "habitat:tidal": TRACKS.tidal,
  "habitat:mystic": TRACKS.mystic,
  [BGM_SCENE.FALLBACK]: TRACKS.legacyFallback
});

/** Unmapped on-disk assets kept for Owner decisions (not auto-assigned). */
export const BGM_UNMAPPED_ASSETS = Object.freeze([
  // Legacy lakefront kept on disk; Moonlake canonical is ethereal (Owner 2026-07-24).
  "./assets/audio/bgm_lakefront.mp3"
]);

export function habitatSceneId(habitatId = "moonlake") {
  const id = String(habitatId || "moonlake");
  return `${BGM_SCENE.HABITAT_PREFIX}${id}`;
}

/**
 * @returns {{ sceneId: string, src: string, loop: boolean } | null}
 */
export function resolveBgmScene(sceneId = "") {
  const key = String(sceneId || "").trim();
  if (!key) return null;
  const src = SCENE_TO_SRC[key] || null;
  if (!src) {
    return {
      sceneId: BGM_SCENE.FALLBACK,
      src: TRACKS.legacyFallback,
      loop: true,
      fallback: true
    };
  }
  return { sceneId: key, src, loop: true, fallback: false };
}

export function listMappedBgmScenes() {
  return Object.keys(SCENE_TO_SRC).map((sceneId) => resolveBgmScene(sceneId));
}
