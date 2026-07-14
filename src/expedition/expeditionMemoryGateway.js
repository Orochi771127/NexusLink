/**
 * RE-3 TASK_PACK #1：遠征專用記憶寫入 gateway。
 *
 * 誠實邊界：
 * - **不**呼叫 `memoryWriter.buildMemoryDecision`（那套依賴玩家心語 gateway／intent／safety）。
 * - 保留 source===expedition 閘門，再標記 `expedition_gateway_v1`。
 * - 完整 sedimentation／safetyShield 進遠征仍屬後續 TASK_PACK。
 */

/** lite／gateway 唯一合法來源；禁止 soul_talk／unknown／缺省混入 */
export const EXPEDITION_MEMORY_SOURCE = "expedition";

export const EXPEDITION_MEMORY_GATEWAY_ID = "expedition_memory_v1";
export const EXPEDITION_MEMORY_WRITE_POLICY = "expedition_gateway_v1";

const RISKY_EXCERPT = /自殺|輕生|傷害自己|想死|不想活/;

/**
 * 探索記憶寫入政策（lite 閘門）。
 * - 必須有 excerpt
 * - source 必須**明確**為 `"expedition"`
 * - 單次結算最多接受 maxAccept 筆
 */
export function filterExpeditionMemoryObjects(memoryObjects = [], { maxAccept = 4 } = {}) {
  const accepted = [];
  const rejected = [];

  (Array.isArray(memoryObjects) ? memoryObjects : []).forEach((memory) => {
    if (!memory || typeof memory !== "object") {
      rejected.push({ memory, reason: "invalid_object" });
      return;
    }
    const excerpt = String(memory.excerpt || "").trim();
    if (!excerpt) {
      rejected.push({ memory, reason: "empty_excerpt" });
      return;
    }
    const source = String(memory.source ?? "").trim();
    if (source !== EXPEDITION_MEMORY_SOURCE) {
      rejected.push({ memory, reason: "non_expedition_source" });
      return;
    }
    if (accepted.length >= maxAccept) {
      rejected.push({ memory, reason: "per_settlement_cap" });
      return;
    }
    accepted.push({
      ...memory,
      excerpt,
      source: EXPEDITION_MEMORY_SOURCE,
      writePolicy: "expedition_lite_v1"
    });
  });

  return {
    accepted,
    rejected,
    status: "lite_policy_only"
  };
}

/**
 * 決定本趟結算可寫入的記憶物件（gateway 層）。
 * @param {object[]} memoryObjects settlement 或 resultEvent.memoryCandidates
 * @param {{ maxAccept?: number }} [options]
 */
export function decideExpeditionMemoryWrites(memoryObjects = [], { maxAccept = 4 } = {}) {
  const gated = filterExpeditionMemoryObjects(memoryObjects, { maxAccept });
  const accepted = [];
  const rejected = [...gated.rejected];

  gated.accepted.forEach((memory) => {
    const excerpt = String(memory.excerpt || "").trim();
    if (RISKY_EXCERPT.test(excerpt)) {
      rejected.push({ memory, reason: "risky_excerpt_blocked" });
      return;
    }
    accepted.push({
      ...memory,
      excerpt,
      source: EXPEDITION_MEMORY_SOURCE,
      writePolicy: EXPEDITION_MEMORY_WRITE_POLICY,
      gateway: EXPEDITION_MEMORY_GATEWAY_ID,
      viaSoulTalkMemoryWriter: false
    });
  });

  return {
    accepted,
    rejected,
    status: EXPEDITION_MEMORY_WRITE_POLICY,
    gatewayId: EXPEDITION_MEMORY_GATEWAY_ID,
    soulTalkMemoryWriter: false
  };
}
