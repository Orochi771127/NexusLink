import { isKnownCompanionId } from "../data/companionRegistry.js";

function normalizeCompanionId(value) {
  return typeof value === "string"
    && value.length > 0
    && value.trim() === value
    && isKnownCompanionId(value)
    ? value
    : null;
}

/**
 * Session 生命週期的 owner invariant。
 *
 * 對峙／遠征會在開始時把夥伴 ID 固定在 session；若進行期間 active companion
 * 被其他流程切換，舊 session 不得把結算反射到新的全域 relationship mirror。
 * 缺少任一 ID 也視為不可信，採 fail-closed。
 */
export function inspectSessionOwner(session, state) {
  const sessionCompanionId = normalizeCompanionId(session?.companionId);
  const activeCompanionId = normalizeCompanionId(state?.activeCompanionId);

  if (!sessionCompanionId) {
    return Object.freeze({
      ok: false,
      reason: "missing_session_companion",
      sessionCompanionId: null,
      activeCompanionId
    });
  }

  if (!activeCompanionId) {
    return Object.freeze({
      ok: false,
      reason: "missing_active_companion",
      sessionCompanionId,
      activeCompanionId: null
    });
  }

  if (sessionCompanionId !== activeCompanionId) {
    return Object.freeze({
      ok: false,
      reason: "companion_changed",
      sessionCompanionId,
      activeCompanionId
    });
  }

  return Object.freeze({
    ok: true,
    reason: "owner_current",
    sessionCompanionId,
    activeCompanionId
  });
}

export function isSessionOwnerCurrent(session, state) {
  return inspectSessionOwner(session, state).ok;
}
