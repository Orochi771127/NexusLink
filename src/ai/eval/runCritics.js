import { critiqueSafety } from "./safetyCritic.js";
import { critiqueBoundary } from "./boundaryCritic.js";
import { critiquePersona } from "./personaCritic.js";
import { critiqueMemory } from "./memoryCritic.js";
import { critiqueReply } from "./replyCritic.js";

export function runCritics(context = {}) {
  const results = [
    critiqueSafety(context),
    critiqueBoundary(context),
    critiquePersona(context),
    critiqueMemory(context),
    critiqueReply(context)
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