import { projectHeartlakeProfile } from "../heartlake/projectHeartlakeProfile.js";

export function createNexusProfileReadAdapter(loadStatePort) {
  if (typeof loadStatePort !== "function") throw new TypeError("loadState port must be a function");
  return Object.freeze({
    read() {
      return projectHeartlakeProfile(loadStatePort());
    }
  });
}
