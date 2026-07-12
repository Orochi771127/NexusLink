import { INITIAL_BOND_CHOICES } from "../../src/ui/onboardingController.js";
import { getCodexEntries } from "../../src/ui/codexController.js";
import { getCompanionById } from "../../src/data/companionRegistry.js";

const EXPECTED_INITIAL_BOND_IDS = [
  "greyshade-cat",
  "blazetail-kit",
  "crystalfin-seahorse"
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

console.log(JSON.stringify({
  total: 4,
  failed: failures.length,
  cases: {
    initialBondIds: actualIds,
    portraitsReady: actualIds.every((id) => Boolean(getCompanionById(id)?.image)),
    fullRuntime: actualIds.every((id) => getCompanionById(id)?.runtimeStatus === "full-runtime"),
    codexUniqueCount: codexEntries.length
  },
  failures
}, null, 2));

if (failures.length) process.exitCode = 1;
