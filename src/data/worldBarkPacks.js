/**
 * worldBarkPacks.js
 * World Autonomy bark tables. Data only — this file holds **i18n key ids**,
 * never literal lines; the four-language text lives in `src/i18n/strings.js`.
 *
 * Structure mirrors `src/data/soulTalkResponsePacks.js`: keyed by situation,
 * banded by intensity (high / mid / low).
 *
 * Authoring rules for every line behind these keys (enforced by
 * `docs/qa/world-bark-system-cases.mjs`):
 * - 8–24 個中文字，最多兩句。
 * - hint 必須是邀請，不是命令。
 * - 禁止 FOMO、內疚、依賴施壓、登入壓力（紅線 6）。
 * - 只反映當下的 Needs 與世界事實，不得改寫人格設定或宣告關係進展。
 */

import { WORLD_BARK_CATEGORIES } from "../ai/worldAutonomy/worldBarkPolicy.js";

/** Body language is always available, even when the text budget is spent. */
export const WORLD_BARK_BODY_CUES = Object.freeze({
  wander_safe_area: "look_around_unhurried",
  rest_at_spot: "settle_low",
  inspect_habitat_object: "look_twice_then_approach",
  eat_available_food: "lower_head_to_forage",
  play_idle_activity: "small_play_motion",
  approach_player_avatar_anchor: "hold_comfortable_distance",
  idle: "breathe_evenly"
});

/** Optional animation intents, reusing the existing vocabulary. */
export const WORLD_BARK_ANIMATION_INTENTS = Object.freeze({
  rest_at_spot: "soul.rest",
  inspect_habitat_object: "soul.acknowledge",
  approach_player_avatar_anchor: "soul.acknowledge"
});

/**
 * Ordinary, repeating actions never produce text — walking, playing and plain
 * idling are body-cue only（契約二「敢於無聊」）。
 */
export const BODY_CUE_ONLY_ACTIONS = Object.freeze([
  "wander_safe_area",
  "play_idle_activity",
  "idle"
]);

export const WORLD_BARK_PACKS = Object.freeze({
  rest_at_spot: Object.freeze({
    category: WORLD_BARK_CATEGORIES.HINT,
    primaryDrive: "restDrive",
    requires: Object.freeze(["restDrive"]),
    bands: Object.freeze({
      high: Object.freeze(["worldBark.rest.high.0", "worldBark.rest.high.1"]),
      mid: Object.freeze(["worldBark.rest.mid.0", "worldBark.rest.mid.1"]),
      low: Object.freeze(["worldBark.rest.low.0", "worldBark.rest.low.1"])
    })
  }),

  eat_available_food: Object.freeze({
    category: WORLD_BARK_CATEGORIES.DISCOVERY,
    primaryDrive: "foodDrive",
    requires: Object.freeze(["foodDrive"]),
    bands: Object.freeze({
      high: Object.freeze(["worldBark.eat.high.0", "worldBark.eat.high.1"]),
      mid: Object.freeze(["worldBark.eat.mid.0", "worldBark.eat.mid.1"]),
      low: Object.freeze(["worldBark.eat.low.0", "worldBark.eat.low.1"])
    })
  }),

  inspect_habitat_object: Object.freeze({
    category: WORLD_BARK_CATEGORIES.DISCOVERY,
    primaryDrive: "exploreDrive",
    requires: Object.freeze(["exploreDrive"]),
    bands: Object.freeze({
      high: Object.freeze(["worldBark.inspect.high.0", "worldBark.inspect.high.1"]),
      mid: Object.freeze(["worldBark.inspect.mid.0", "worldBark.inspect.mid.1"]),
      low: Object.freeze(["worldBark.inspect.low.0", "worldBark.inspect.low.1"])
    })
  }),

  approach_player_avatar_anchor: Object.freeze({
    category: WORLD_BARK_CATEGORIES.STATUS,
    primaryDrive: "socialDrive",
    requires: Object.freeze(["socialDrive"]),
    bands: Object.freeze({
      high: Object.freeze(["worldBark.approach.high.0", "worldBark.approach.high.1"]),
      mid: Object.freeze(["worldBark.approach.mid.0", "worldBark.approach.mid.1"]),
      low: Object.freeze(["worldBark.approach.low.0", "worldBark.approach.low.1"])
    })
  })
});

/**
 * Failure barks. The Phase 1 loop aborts silently on a policy block; letting the
 * companion say why is the "行動失敗，需要讓玩家知道原因" case. Keyed by the
 * `reason` prefix produced by `worldActionPolicy.validateWorldAction`.
 */
export const WORLD_BARK_FAILURE_PACK = Object.freeze({
  category: WORLD_BARK_CATEGORIES.FAILURE,
  byReason: Object.freeze({
    cooldown_active: Object.freeze([
      "worldBark.blocked.cooldown.0",
      "worldBark.blocked.cooldown.1"
    ]),
    insufficient_resource: Object.freeze([
      "worldBark.blocked.resource.0",
      "worldBark.blocked.resource.1"
    ]),
    unknown_action: Object.freeze([
      "worldBark.blocked.unknown.0",
      "worldBark.blocked.unknown.1"
    ])
  })
});

export function getWorldBarkPack(actionId = "") {
  return WORLD_BARK_PACKS[actionId] || null;
}

export function getWorldBarkBodyCue(actionId = "") {
  return WORLD_BARK_BODY_CUES[actionId] || WORLD_BARK_BODY_CUES.idle;
}

export function getWorldBarkAnimationIntent(actionId = "") {
  return WORLD_BARK_ANIMATION_INTENTS[actionId] || null;
}

export function isBodyCueOnlyAction(actionId = "") {
  return BODY_CUE_ONLY_ACTIONS.includes(actionId);
}

/** Split `cooldown_active:rest_at_spot` into the reason bucket used above. */
export function resolveFailureReasonBucket(reason = "") {
  const head = String(reason || "").split(":")[0].trim();
  return Object.prototype.hasOwnProperty.call(WORLD_BARK_FAILURE_PACK.byReason, head) ? head : null;
}

/** Every bark key this pack can ever emit — used by the i18n coverage check. */
export function listAllWorldBarkKeys() {
  const keys = [];
  for (const pack of Object.values(WORLD_BARK_PACKS)) {
    for (const banded of Object.values(pack.bands)) keys.push(...banded);
  }
  for (const banded of Object.values(WORLD_BARK_FAILURE_PACK.byReason)) keys.push(...banded);
  return keys;
}
