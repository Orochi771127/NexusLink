import { critiqueSafety } from "./safetyCritic.js";
import { critiqueBoundary } from "./boundaryCritic.js";
import { critiquePersona } from "./personaCritic.js";
import { critiqueMemory } from "./memoryCritic.js";
import { critiqueReply } from "./replyCritic.js";
import { critiqueGenericReply } from "./genericReplyCritic.js";

export function runCritics(context = {}) {
  const results = [
    critiqueSafety(context),
    critiqueBoundary(context),
    critiquePersona(context),
    critiqueMemory(context),
    critiqueReply(context),
    critiqueGenericReply({
      reply: context.reply,
      nlu: context.perception?.nlu,
      perception: context.perception,
      state: context.state,
      previousReply: getPreviousCompanionReply(context.state)
    })
  ];

  const failed = results.filter((result) => !result.pass);

  return {
    pass: failed.length === 0,
    results,
    failed,
    primaryRepairHint: failed[0]?.repairHint || "",
    failureCodes: failed.flatMap((result) => result.issues)
  };
}

function getPreviousCompanionReply(state = {}) {
  const history = Array.isArray(state?.chatHistory) ? state.chatHistory : [];
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]?.role === "companion") return history[index].text || "";
  }
  return "";
}