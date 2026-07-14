import { moonlakeProfile } from "./moonlakeProfile.js";
import { linkaraRegionProfiles } from "./linkaraRegionProfiles.js";

export const SCENE_PROFILES = Object.freeze({
  moonlake: moonlakeProfile,
  ...linkaraRegionProfiles
});

export const ACTIVE_PROFILE_ID = "moonlake";
let activeProfileId = ACTIVE_PROFILE_ID;

/** 通用後備：月湖契約的極簡子集，避免缺 id 時崩潰。 */
const GENERIC_FALLBACK_PROFILE = moonlakeProfile;

export function getSceneProfile(id = ACTIVE_PROFILE_ID) {
  return SCENE_PROFILES[id] || GENERIC_FALLBACK_PROFILE;
}

export function getActiveSceneProfile() {
  return getSceneProfile(activeProfileId);
}

export function getActiveSceneProfileId() {
  return activeProfileId;
}

export function setActiveSceneProfile(id) {
  activeProfileId = SCENE_PROFILES[id] ? id : ACTIVE_PROFILE_ID;
  return getActiveSceneProfile();
}

export { linkaraRegionProfiles, moonlakeProfile };
