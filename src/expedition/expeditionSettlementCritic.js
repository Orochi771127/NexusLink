/**
 * RE-3：遠征結算反思的輕量 critic（非完整 constitution／persona 管線）。
 *
 * 能擋：第三人稱 journal、農場語氣、永遠承諾。
 * 接不到完整 runCritics 時誠實標 lite；失敗 → fail-closed（呼叫端改走 fallback）。
 */

import { critiqueConstitution } from "../ai/eval/constitutionCritic.js";
import { critiquePersona } from "../ai/eval/personaCritic.js";

/** 第三人稱遠征 journal 常見口吻（禁止當 companion 第一人稱） */
const THIRD_PERSON_MARKERS = /(?:^|。)(?:牠|它)(?:的|在|決定|湊|想|不願)|夥伴決定|灰影貓決定|驅散了雜訊/;
const FARM_MARKERS = /羈絆\s*\+|好感\s*\+|刷怪|升好感|打怪升級/;

/**
 * @param {string} text
 * @param {{ companion?: object|null, persona?: object|null }} [ctx]
 * @returns {{ pass: boolean, issues: string[], critic: string }}
 */
export function critiqueExpeditionReflection(text, { companion = null, persona = null } = {}) {
  const reply = String(text || "").trim();
  const issues = [];

  if (!reply) {
    return { pass: false, issues: ["empty_reflection"], critic: "expedition_lite" };
  }

  if (THIRD_PERSON_MARKERS.test(reply)) {
    issues.push("third_person_journal");
  }
  if (FARM_MARKERS.test(reply)) {
    issues.push("farm_relationship_tone");
  }

  // 能接的 Core critic：constitution／persona（僅看 reply，不偽造完整 perception）
  try {
    const constitution = critiqueConstitution({ reply });
    if (!constitution.pass) {
      constitution.issues.forEach((issue) => issues.push(`constitution:${issue}`));
    }
  } catch {
    // critic 拋錯不假裝通過；記 issue，仍 fail-closed
    issues.push("constitution_critic_error");
  }

  try {
    const personaCtx = {
      persona: persona || {
        companionId: companion?.id || null,
        boundaries: companion?.boundaries || { noForeverPromise: true, noDemandTouch: true }
      }
    };
    const personaResult = critiquePersona({
      perception: personaCtx,
      reply
    });
    if (!personaResult.pass) {
      personaResult.issues.forEach((issue) => issues.push(`persona:${issue}`));
    }
  } catch {
    issues.push("persona_critic_error");
  }

  return {
    pass: issues.length === 0,
    issues,
    critic: "expedition_lite"
  };
}
