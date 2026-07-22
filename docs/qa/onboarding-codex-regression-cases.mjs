import { INITIAL_BOND_CHOICES } from "../../src/ui/onboardingController.js";
import { getCodexEntries } from "../../src/ui/codexController.js";
import { getCompanionById } from "../../src/data/companionRegistry.js";
import { getCompanionRuntimeEligibility } from "../../src/data/companionRuntimePolicy.js";
import { getEvolutionLine } from "../../src/data/evolutionLines.js";
import { hasAdventureProfile } from "../../src/data/companionAdventureProfiles.js";
import { canLaunchExpedition } from "../../src/expedition/expeditionConfig.js";
import { normalizeState } from "../../src/state/store.js";
import { getCompanionCodexGrowthPresentation } from "../../src/state/companionStateSchema.js";

const EXPECTED_INITIAL_BOND_IDS = [
  "greyshade-cat",
  "blazetail-kit",
  "crystalfin-seahorse"
];
const IRONFLOW_IDS = [
  "thunder-pup",
  "wavecub",
  "starflame-phoenix",
  "star-foal",
  "goldenspark-wyrm"
];

const failures = [];
const actualIds = INITIAL_BOND_CHOICES.map((choice) => choice.id);

if (JSON.stringify(actualIds) !== JSON.stringify(EXPECTED_INITIAL_BOND_IDS)) {
  failures.push(`initial bond ids: expected ${EXPECTED_INITIAL_BOND_IDS.join(", ")}; got ${actualIds.join(", ")}`);
}

for (const companionId of actualIds) {
  const companion = getCompanionById(companionId);
  if (!companion) failures.push(`${companionId}: missing registry entry`);
  if (!companion?.image) failures.push(`${companionId}: missing portrait path`);
  if (companion?.runtimeStatus !== "full-runtime") failures.push(`${companionId}: not full-runtime`);
}

const codexEntries = getCodexEntries();
const duplicateIds = codexEntries
  .map((entry) => entry.id)
  .filter((id, index, ids) => ids.indexOf(id) !== index);

if (duplicateIds.length) {
  failures.push(`duplicate codex ids: ${[...new Set(duplicateIds)].join(", ")}`);
}

const codexIds = new Set(codexEntries.map((entry) => entry.id));
const freshState = normalizeState({});
for (const companionId of IRONFLOW_IDS) {
  const companion = getCompanionById(companionId);
  if (!codexIds.has(companionId)) failures.push(`${companionId}: missing Stage 1 Codex entry`);
  if (companion?.runtimeStatus !== "full-runtime") failures.push(`${companionId}: not full-runtime`);
  const eligibility = getCompanionRuntimeEligibility(companionId, freshState);
  if (eligibility.canSelect || eligibility.isUnlocked) {
    failures.push(`${companionId}: fresh save must keep Ironflow companion locked`);
  }
}

const ironflowHasNoAdventureProfile = IRONFLOW_IDS.every(
  (companionId) => !hasAdventureProfile(companionId)
);
if (!ironflowHasNoAdventureProfile) {
  failures.push("Ironflow Stage 1 companions must not gain Expedition adventure profiles in this slice");
}

const ironflowExpeditionFailClosed = IRONFLOW_IDS.every((companionId) => !canLaunchExpedition({
  activeCompanionId: companionId,
  unlockedCompanionIds: ["greyshade-cat", companionId],
  chapterProgress: { current: 2, completed: [1] },
  energy: 10
}));
if (!ironflowExpeditionFailClosed) {
  failures.push("Ironflow Stage 1 companions must remain fail-closed for Expedition after explicit unlock");
}

const migrated = normalizeState({
  activeCompanionId: "greyshade-cat",
  unlockedCompanionIds: ["greyshade-cat", "blazetail-kit"],
  bond: 72,
  trust: 40
});
const activeGrowth = getCompanionCodexGrowthPresentation(migrated.companionStates, "greyshade-cat");
const archiveGrowth = getCompanionCodexGrowthPresentation(migrated.companionStates, "blazetail-kit");
if (
  activeGrowth.formalStage !== "final_awakened"
  || activeGrowth.revealStage !== "final_awakened"
  || activeGrowth.isLegacyArchive
) {
  failures.push(`active formal stage isolation failed: ${JSON.stringify(activeGrowth)}`);
}
if (
  archiveGrowth.formalStage !== "initial_awakened"
  || archiveGrowth.revealStage !== "final_awakened"
  || !archiveGrowth.isLegacyArchive
) {
  failures.push(`inactive archive reveal failed: ${JSON.stringify(archiveGrowth)}`);
}

const canonical = normalizeState({ ...migrated, bond: 100, trust: 100 });
const unseenGrowth = getCompanionCodexGrowthPresentation(canonical.companionStates, "crystalfin-seahorse");
if (unseenGrowth.revealStage !== "initial_awakened" || unseenGrowth.isLegacyArchive) {
  failures.push(`top-level bond leaked into unrelated Codex entry: ${JSON.stringify(unseenGrowth)}`);
}

const numericLegacyHints = codexEntries
  .filter((entry) => entry.kind === "runtime")
  .flatMap((entry) => getEvolutionLine(entry.companion.evolutionLineId)?.stages || [])
  .map((stage) => stage.unlockHint || "")
  .filter((hint) => /羈絆約\s*(25|70)|bond\s*(25|70)/i.test(hint));
if (numericLegacyHints.length) {
  failures.push(`Codex still exposes numeric bond gates: ${numericLegacyHints.join(" | ")}`);
}

console.log(JSON.stringify({
  total: 13,
  failed: failures.length,
  cases: {
    initialBondIds: actualIds,
    portraitsReady: actualIds.every((id) => Boolean(getCompanionById(id)?.image)),
    fullRuntime: actualIds.every((id) => getCompanionById(id)?.runtimeStatus === "full-runtime"),
    codexUniqueCount: codexEntries.length,
    ironflowStage1Visible: IRONFLOW_IDS.every((id) => codexIds.has(id)),
    ironflowFullRuntime: IRONFLOW_IDS.every((id) => getCompanionById(id)?.runtimeStatus === "full-runtime"),
    ironflowFreshLocked: IRONFLOW_IDS.every((id) => !getCompanionRuntimeEligibility(id, freshState).canSelect),
    ironflowHasNoAdventureProfile,
    ironflowExpeditionFailClosed,
    activeFormalStage: activeGrowth,
    inactiveArchiveStage: archiveGrowth,
    unrelatedBondIsolation: unseenGrowth,
    numericLegacyHintCount: numericLegacyHints.length
  },
  failures
}, null, 2));

if (failures.length) process.exitCode = 1;
