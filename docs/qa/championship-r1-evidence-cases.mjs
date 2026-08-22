import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createResearchRule } from "../../src/championship/contracts/championshipContracts.js";
import {
  PUBLIC_EVIDENCE_POLICY,
  validateAggregateParity,
  validateEvidenceBoundExecutableRule,
  validateFindingId
} from "../../src/championship/contracts/evidencePolicy.js";
import { assertPublicCatalogShape } from "../../src/data/championship/validation/validateChampionshipRecord.js";

const windowsAbsolute = (...segments) => ["C:", ...segments].join("\\");
const forwardWindowsAbsolute = (...segments) => ["C:", ...segments].join("/");
const dottedFilename = (stem, extension) => [stem, extension].join(".");

test("public evidence matrix accepts adaptations and bounded verified rules", () => {
  assert.doesNotThrow(() => validateEvidenceBoundExecutableRule(createResearchRule({ kind: "DAMAGE", magnitude: 1 })));
  assert.doesNotThrow(() => validateEvidenceBoundExecutableRule({
    value: { numerator: 15, denominator: 10, scope: "POSITIVE_DAMAGE_CRITICAL_TRANSFORM_ONLY" },
    ruleAuthority: "VERIFIED_YDIJ_RULE",
    evidenceStatus: "VERIFIED_BINARY",
    executable: true,
    originalParityClaim: true,
    evidenceRefs: ["BATTLE-A-R1-003"]
  }));
});

test("private confidence labels and evidence-free parity claims are rejected", () => {
  for (const status of PUBLIC_EVIDENCE_POLICY.privateOnlyStatuses) {
    assert.throws(() => validateEvidenceBoundExecutableRule({
      value: { kind: "UNKNOWN" }, ruleAuthority: "VERIFIED_YDIJ_RULE", evidenceStatus: status,
      executable: true, originalParityClaim: true, evidenceRefs: ["finding-001"]
    }));
  }
  assert.throws(() => validateEvidenceBoundExecutableRule({
    value: { kind: "DAMAGE" }, ruleAuthority: "VERIFIED_YDIJ_RULE", evidenceStatus: "VERIFIED_BINARY",
    executable: true, originalParityClaim: true, evidenceRefs: []
  }), /evidence references/);
  assert.throws(() => validateEvidenceBoundExecutableRule({
    value: null, ruleAuthority: "NEXUS_ADAPTATION", evidenceStatus: "NEXUS_RESEARCH_RULE",
    executable: true, originalParityClaim: false, evidenceRefs: []
  }), /non-null/);
});

test("aggregate parity and sanitized IDs preserve unknown boundaries", () => {
  assert.doesNotThrow(() => validateAggregateParity({ status: "BLOCKED_UNKNOWN", blockingFindingIds: ["BATTLE-R1-BASE-DAMAGE-UNKNOWN"] }));
  assert.throws(() => validateAggregateParity({ status: "BLOCKED_UNKNOWN", blockingFindingIds: [] }), /requires/);
  assert.throws(() => validateAggregateParity({ status: "VERIFIED_BEHAVIOR", blockingFindingIds: ["finding-001"] }), /Only BLOCKED_UNKNOWN/);
  assert.throws(() => validateFindingId(windowsAbsolute("private", dottedFilename("raw", "bin"))), /must be short|cannot contain/);
  assert.throws(() => validateFindingId(["..", dottedFilename("raw", "bin")].join("/")), /must be short|cannot contain/);
});

test("public catalog lint rejects forensic payload fields and paths", () => {
  for (const key of ["rawHex", "romOffset", "ramAddress", "nicknamePointer", "sourceIndex", "forensicIndex", "sourceOriginalText", "originalAssetRef", "unknownFields", "rawVector", "rawFlags", "privatePath"]) {
    assert.throws(() => assertPublicCatalogShape({ [key]: "payload" }), /forbidden/);
  }
  const filename = dottedFilename("artifact", "json");
  const forbiddenPaths = [
    windowsAbsolute("private", filename),
    forwardWindowsAbsolute("private", filename),
    ["", "", "server", "private", filename].join("\\"),
    `file:///${forwardWindowsAbsolute("private", filename)}`,
    ["", "private", filename].join("/")
  ];
  for (const privatePath of forbiddenPaths) {
    assert.throws(() => assertPublicCatalogShape({ evidenceRef: privatePath }), /absolute path/);
  }
});

test("public R1 content contains only project-native authored names and shape references", () => {
  const text = fs.readFileSync(new URL("../../src/data/championship/fixtures/championship-r1-content.json", import.meta.url), "utf8");
  assert.match(text, /Greyshade Cat/);
  assert.match(text, /Blazetail Kit/);
  assert.match(text, /Crystalfin Seahorse/);
  assert.doesNotMatch(text, /\.(nds|srl|bin|nanr|ncer|ncgr|nclr|nscr|nxr)\b/i);
  assert.doesNotMatch(text, /[A-Za-z]:\\/);
});
