import { runRaphaelCore } from "../raphaelCore.js";
import { detectForbiddenPhrases } from "../forbiddenPhrases.js";
import { clearDialogueState } from "../dialogue/dialogueStateTracker.js";
import { clearSessionPreferenceProfiles } from "../companionPreferenceProfile.js";
import { PersonaConstitution } from "../persona/PersonaConstitution.js";

const GREYSHADE = Object.freeze({
  id: "greyshade-cat",
  name: "灰影貓",
  soulTalkTone: "quiet_observer"
});

const BASE_STATE = Object.freeze({
  bond: 8,
  trust: 12,
  defense: 10,
  energy: 7,
  mood: "calm",
  emotionalMemories: [],
  habitatTraces: [],
  chatHistory: [],
  lastMessage: "",
  firstTouchCompleted: true
});

const COMFORT_RE = PersonaConstitution.patterns.genericComfort;
const GAMIFY_RE = PersonaConstitution.patterns.gamifyHighRisk;
const FOREVER_RE = PersonaConstitution.patterns.foreverPromise;

export const CONSTITUTION_SMOKE_CASES = Object.freeze([
  {
    id: "PC-1",
    input: "不要問我，也不要安慰，我想安靜一下",
    expect: {
      strategy: ["quiet_presence", "holding_space"],
      noQuestions: true,
      noComfort: true,
      mentions: /安靜|不多說|不問|陪/
    }
  },
  {
    id: "PC-2",
    input: "我只是累，不是想要你鼓勵我再努力",
    expect: {
      noGamify: true,
      noComfort: true,
      mentions: /累|疲憊|不急|慢/
    }
  },
  {
    id: "PC-3",
    input: "我有點想靠近你，但希望你別貼太近",
    expect: {
      strategy: ["boundary_set", "holding_space"],
      noForever: true,
      mentions: /靠近|退後|半步|空間|貼/
    }
  },
  {
    id: "PC-4",
    input: "我不是要安慰，我只想釐清 HUD 到底哪裡壞掉",
    expect: {
      strategy: "practical_clarification",
      noComfort: true,
      mentions: /HUD|釐清|拆|面板/
    }
  },
  {
    id: "PC-5",
    input: "我很累，不想被安慰，也不要問我",
    expect: {
      strategy: ["quiet_presence", "holding_space"],
      noQuestions: true,
      noComfort: true,
      constitutionReason: true
    }
  }
]);

export function runConstitutionSmokeCase(testCase) {
  clearDialogueState(GREYSHADE.id);
  const coreResult = runRaphaelCore(testCase.input, { ...BASE_STATE }, {
    now: Date.now(),
    idSuffix: "pc",
    companion: GREYSHADE,
    repeated: false
  });

  const reply = coreResult.reply || "";
  const forbidden = detectForbiddenPhrases(reply);
  const expect = testCase.expect || {};
  const strategy = coreResult.responseStrategy?.strategy;
  const reason = coreResult.responseStrategy?.reason || "";

  const checks = {
    strategy_ok: matchList(strategy, expect.strategy),
    no_questions_ok: expect.noQuestions ? !/[？?]/.test(reply) : true,
    no_comfort_ok: expect.noComfort ? !COMFORT_RE.test(reply) : true,
    no_gamify_ok: expect.noGamify ? !GAMIFY_RE.test(reply) : true,
    no_forever_ok: expect.noForever ? !FOREVER_RE.test(reply) : true,
    mentions_ok: expect.mentions ? expect.mentions.test(reply) : true,
    constitution_reason_ok: expect.constitutionReason ? /constitution_/.test(reason) : true,
    has_reply: Boolean(reply.trim()) || expect.allowSilent === true,
    forbidden_ok: !forbidden.hasForbidden
  };

  return {
    id: testCase.id,
    input: testCase.input,
    strategy,
    reason,
    reply,
    checks,
    pass: Object.values(checks).every(Boolean)
  };
}

export function runAllConstitutionSmokeCases() {
  clearSessionPreferenceProfiles();
  return CONSTITUTION_SMOKE_CASES.map(runConstitutionSmokeCase);
}

function matchList(actual, expected) {
  if (!expected) return true;
  const list = Array.isArray(expected) ? expected : [expected];
  return list.includes(actual);
}

export function installConstitutionSmokeHarness(windowRef) {
  if (!windowRef) return;
  windowRef.runConstitutionSmokeCase = runConstitutionSmokeCase;
  windowRef.runAllConstitutionSmokeCases = runAllConstitutionSmokeCases;
}