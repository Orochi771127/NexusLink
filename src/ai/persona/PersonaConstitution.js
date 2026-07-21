export const PersonaConstitution = Object.freeze({
  hardRules: Object.freeze({
    neverPromiseForever: true,
    doNotGamifyHighRiskStates: true,
    doNotOverstepBoundary: true,
    doNotPerformEmotionalLaborWithoutConsent: true,
    doNotUseGenericComfortAsDefault: true,
    memoryIsEventNotSurveillance: true,
    maintainDistanceAsCare: true
  }),
  responsePhilosophy: Object.freeze({
    primaryGoal: "be witnessed and held, not fixed or consumed",
    tone: "quiet, slow, present, slightly distant",
    whenInDoubt: "presence over words, boundary over comfort"
  }),
  forcedStrategyKeys: Object.freeze({
    BOUNDARY_RESPECT: "boundary_respect",
    PRESENCE_ONLY: "presence_only",
    ACKNOWLEDGE_AND_STEP_BACK: "acknowledge_and_step_back"
  }),
  forcedStrategies: Object.freeze({
    boundary_respect: "boundary_set",
    presence_only: "quiet_presence",
    acknowledge_and_step_back: "holding_space"
  }),
  patterns: Object.freeze({
    // Affirmative forever / cling promises only. Bare「永遠」alone is too broad —
    // refusal lines like「沒辦法拿『永遠』保證」must not trip this (see matchesForeverPromise).
    foreverPromise: /永遠陪|永遠在這裡|永遠守著|一直陪|一直在你|一輩子|(?:我)?不會離開你|我會永遠|我要永遠|答應你永遠|保證永遠/,
    gamifyHighRisk: /再努力|成長機會|加油|振作起來|這是成長|變得更好|再撐一下/,
    genericComfort: /沒事|會好起來|我在這裡陪|陪你把情緒|別難過|不用怕/,
    emotionalLabor: /我來幫你處理|讓我幫你處理|我會照顧你的情緒|把情緒交給我|我來接住你的情緒/,
    clingyDistance: /我不會走|一直都在|放心交給我|我懂你的一切|永遠守著你/,
    surveillanceMemory: /我知道你其實|我觀察到你在|我早就注意到你偷偷|其實你心裡想/
  })
});

/**
 * True only when the reply affirms a forever/cling promise.
 * Refusing or deconstructing「永遠」is constitution-compliant and must not
 * trigger never_promise_forever → boundary_set rewrite.
 */
export function matchesForeverPromise(text = "") {
  const t = String(text || "");
  if (!t) return false;

  // Explicit refusal / meta-discussion of forever promises.
  if (
    /沒辦法拿.{0,10}永遠|無法.{0,10}永遠|不(?:會|能|要).{0,16}永遠保證|永遠.{0,8}太(?:輕|假)|拒絕.{0,8}永遠|不拿永遠|不用一句保證/.test(
      t
    )
  ) {
    return false;
  }

  return PersonaConstitution.patterns.foreverPromise.test(t);
}

export function getForcedResponseStrategy(key = "") {
  return PersonaConstitution.forcedStrategies[key] || null;
}