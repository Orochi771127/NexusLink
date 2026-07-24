/**
 * Short live drill for proactive care + guide.
 * Run: node docs/qa/raphael-proactive-care-guide-drill.mjs
 */

import { clearDialogueState } from "../../src/ai/dialogue/dialogueStateTracker.js";
import { runRaphaelCore } from "../../src/ai/raphaelCore.js";

const sessionKey = "drill-proactive-care";
clearDialogueState(sessionKey);

const state = {
  energy: 7,
  trust: 40,
  bond: 32,
  defense: 10,
  mood: "calm",
  chatHistory: [],
  memories: [],
  onboarding: { completed: true, firstLoop: { completedAt: Date.now() } },
  activeCompanionId: "greyshade-cat",
  firstTouchCompleted: true
};

const turns = [
  "嗨",
  "還好",
  "今天其實沒大事，就是悶",
  "先別問了，陪我一下"
];

for (const input of turns) {
  const result = runRaphaelCore(input, state, { sessionKey });
  const reply = String(result.reply || result.output?.reply || "");
  console.log(`YOU: ${input}`);
  console.log(`RAPHAEL: ${reply}`);
  console.log("---");
  state.chatHistory = [
    ...(state.chatHistory || []),
    { role: "player", text: input },
    { role: "companion", text: reply }
  ];
}
