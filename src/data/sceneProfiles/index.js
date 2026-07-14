import { moonlakeProfile } from "./moonlakeProfile.js";

export const SCENE_PROFILES = Object.freeze({
  moonlake: moonlakeProfile
});

export const ACTIVE_PROFILE_ID = "moonlake";

/** 通用後備：月湖契約的極簡子集，避免缺 id 時崩潰。 */
const GENERIC_FALLBACK_PROFILE = moonlakeProfile;

export function getSceneProfile(id = ACTIVE_PROFILE_ID) {
  return SCENE_PROFILES[id] || GENERIC_FALLBACK_PROFILE;
}

export function getActiveSceneProfile() {
  return getSceneProfile(ACTIVE_PROFILE_ID);
}

export { moonlakeProfile };
