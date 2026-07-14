import { getMemoryEventForExplorePoint } from "../data/expeditionMemoryEvents.js";

/**
 * 首次抵達探索點時觸發記憶事件（每場遠征每點一次）。
 */
export function tryTriggerMemoryEvent(session, explorePointId) {
  if (!session || !explorePointId) return null;
  if (session.triggeredMemoryEvents?.includes(explorePointId)) return null;

  const event = getMemoryEventForExplorePoint(session.regionId, explorePointId);
  if (!event) return null;

  session.triggeredMemoryEvents = [...(session.triggeredMemoryEvents || []), explorePointId];
  session.pendingMemoryEvent = event;
  session.lastIntent = {
    type: "INVESTIGATE",
    targetId: explorePointId,
    reason: event.excerpt,
    confidence: 0.88
  };

  return event;
}

export function consumePendingMemoryEvent(session) {
  const event = session?.pendingMemoryEvent || null;
  if (session) session.pendingMemoryEvent = null;
  return event;
}
