import { canEnterUnguidedStandoff } from "../engine/resonanceThreadEngine.js";
import { isExpeditionUnlocked } from "../expedition/expeditionConfig.js";

export const ORBIT_NODE_ACTION_IDS = Object.freeze({
  ORBIT: "orbit",
  EXPEDITION: "expedition",
  STANDOFF: "standoff"
});

/**
 * Pure presentation resolver for the Moonlake Explore focus.
 * It reuses current runtime gates and routes; it never mutates state or starts
 * an encounter on its own.
 */
export function resolveOrbitNodeActionSheet(state = {}) {
  const expeditionAvailable = isExpeditionUnlocked(state);
  const standoffAvailable = canEnterUnguidedStandoff(state);

  return Object.freeze({
    nodeId: "moonlake_camp",
    titleKey: "explore.nodeActions.title",
    copyKey: "explore.nodeActions.copy",
    actions: Object.freeze([
      Object.freeze({
        id: ORBIT_NODE_ACTION_IDS.ORBIT,
        route: "orbit",
        available: true,
        primary: true,
        labelKey: "explore.nodeActions.orbit",
        copyKey: "explore.nodeActions.orbitSub"
      }),
      Object.freeze({
        id: ORBIT_NODE_ACTION_IDS.EXPEDITION,
        route: "map",
        available: expeditionAvailable,
        primary: false,
        labelKey: "explore.nodeActions.expedition",
        copyKey: expeditionAvailable
          ? "explore.nodeActions.expeditionSub"
          : "explore.nodeActions.expeditionLocked"
      }),
      Object.freeze({
        id: ORBIT_NODE_ACTION_IDS.STANDOFF,
        route: "map",
        available: standoffAvailable,
        primary: false,
        labelKey: "explore.nodeActions.standoff",
        copyKey: standoffAvailable
          ? "explore.nodeActions.standoffSub"
          : "explore.nodeActions.standoffLocked"
      })
    ])
  });
}
