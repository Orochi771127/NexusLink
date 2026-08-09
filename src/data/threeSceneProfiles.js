/**
 * Global opt-in Three.js presentation registry.
 *
 * Entries describe rendering ownership only. They cannot move store, input,
 * collision, objective, reward, save or RaphaelCore authority into Three.js.
 */

export const THREE_SCENE_PROFILE_SCHEMA_VERSION = 1;

const PROFILES = Object.freeze({
  moonlake: Object.freeze({
    id: "moonlake",
    renderer: "three",
    mode: "approved-live-hybrid",
    fallback: "pixi-and-dom",
    authority: "presentation-only"
  }),
  "orbit-top-pilot": Object.freeze({
    id: "orbit-top-pilot",
    renderer: "three",
    mode: "approved-live-pilot",
    enableByDefault: true,
    enableQuery: "orbit3dPilot",
    candidateQuery: "orbit3dCandidate",
    fallback: "orbit-canvas",
    authority: "snapshot-only",
    mobileDprCap: 1.5,
    reducedMotion: "freeze-decorative-motion-keep-physics-readability"
  }),
  expedition: Object.freeze({
    id: "expedition",
    renderer: "pixi",
    mode: "approved-live-sprite-pilot",
    fallback: "existing-expedition-canvas",
    authority: "unchanged"
  })
});

export function getThreeSceneProfile(sceneId) {
  return PROFILES[String(sceneId || "")] || null;
}

export function listThreeSceneProfiles() {
  return Object.values(PROFILES);
}
