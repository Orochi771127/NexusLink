import assert from "node:assert/strict";

import {
  planQuickReplies,
  QUICK_REPLY_ACTION_TYPES
} from "../../src/ai/dialogue/quickReplyPlanner.js";
import { RESPONSE_STRATEGIES } from "../../src/ai/responseStrategySelector.js";

let passed = 0;

function pass(label) {
  passed += 1;
  console.log(`PASS ${label}`);
}

function labelsOf(items) {
  return items.map((item) => item.label);
}

function assertCompactSet(label, items) {
  assert.equal(items.length, 3, `${label} should expose three choices`);
  assert.equal(
    items.every((item) => item.label.length <= 8),
    true,
    `${label} contains an overlong visible label: ${labelsOf(items).join(" / ")}`
  );
  assert.equal(
    items.some((item) => item.label.includes("換個說法")),
    false,
    `${label} must not restore the verbose parenthetical suffix`
  );
  assert.equal(
    items.every((item) => Object.values(QUICK_REPLY_ACTION_TYPES).includes(item.actionType)),
    true,
    `${label} lost its machine action type`
  );
  pass(`${label} compact labels`);
}

const sharedNlu = {
  dialogueAct: "describing_event",
  semanticFrame: {
    topic: "unknown",
    constraints: [],
    userNeed: ""
  }
};

const cases = [
  {
    label: "symbolic",
    args: {
      nlu: sharedNlu,
      responseStrategy: RESPONSE_STRATEGIES.SYMBOLIC_REFLECTION
    }
  },
  {
    label: "practical",
    args: {
      nlu: {
        ...sharedNlu,
        topic: "development",
        semanticFrame: { ...sharedNlu.semanticFrame, topic: "development" }
      }
    }
  },
  {
    label: "quiet",
    args: {
      nlu: {
        ...sharedNlu,
        constraints: ["quiet_presence"],
        semanticFrame: {
          ...sharedNlu.semanticFrame,
          constraints: ["quiet_presence"],
          userNeed: "quiet_presence"
        }
      }
    }
  },
  {
    label: "reflective care",
    args: {
      nlu: sharedNlu,
      responseStrategy: RESPONSE_STRATEGIES.REFLECTIVE_CARE
    }
  },
  {
    label: "clarification",
    args: {
      nlu: {
        ...sharedNlu,
        semanticFrame: { ...sharedNlu.semanticFrame, userNeed: "clarity" }
      }
    }
  },
  {
    label: "exploration",
    args: {
      nlu: {
        ...sharedNlu,
        topic: "exploration",
        semanticFrame: { ...sharedNlu.semanticFrame, topic: "exploration" }
      },
      responseStrategy: RESPONSE_STRATEGIES.EXPLORATION_INVITE
    }
  },
  {
    label: "fatigue",
    args: {
      nlu: {
        ...sharedNlu,
        topic: "physical_tiredness",
        semanticFrame: { ...sharedNlu.semanticFrame, topic: "physical_tiredness" }
      }
    }
  },
  {
    label: "default",
    args: { nlu: sharedNlu }
  }
];

for (const testCase of cases) {
  assertCompactSet(testCase.label, planQuickReplies(testCase.args));
}

const fatigue = planQuickReplies(cases.find((item) => item.label === "fatigue").args);
assert.deepEqual(
  labelsOf(fatigue),
  ["先慢一點", "身體或心裡？", "先不給建議"]
);
pass("fatigue labels match the approved phone copy");

const defaultReplies = planQuickReplies({ nlu: sharedNlu });
assert.deepEqual(
  labelsOf(defaultReplies),
  ["再說重點", "先講重點", "換個方向"]
);
pass("default labels match the approved phone copy");

const repeatedReplies = planQuickReplies({
  nlu: sharedNlu,
  dialogueState: {
    lastQuickReplySet: defaultReplies.map((item) => item.intent),
    recentTurns: [{ quickReplyLabels: labelsOf(defaultReplies) }]
  }
});
assert.deepEqual(
  labelsOf(repeatedReplies),
  ["再說重點", "再換方向", "再說一次"]
);
assert.equal(
  repeatedReplies.every((item) => item.intent.includes("_alt")),
  true,
  "repeated choices should retain distinct alternate machine intents"
);
assert.equal(
  repeatedReplies.every((item) => !item.ariaLabel || item.ariaLabel.includes("換個說法")),
  true,
  "alternate accessibility labels should explain the relabeling"
);
pass("repeated set uses compact authored alternates");

console.log(`Soul Talk mobile viewport R1 deterministic QA: ${passed}/${passed} PASS`);
