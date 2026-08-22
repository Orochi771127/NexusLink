import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { canonicalStringify, FORENSIC_SCALE_EXPECTATIONS } from "../../src/championship/contracts/championshipContracts.js";
import { createCanonicalCatalogAdapter } from "../../src/championship/adapters/createCanonicalCatalogAdapter.js";
import { createSyntheticScaleCatalog } from "../../src/data/championship/testing/createSyntheticScaleCatalog.js";
import { validateChampionshipCatalog, validateChampionshipCatalogEnvelope } from "../../src/data/championship/validation/validateChampionshipCatalog.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const dataRoot = path.join(repoRoot, "src/data/championship");
const windowsAbsolute = (...segments) => ["C:", ...segments].join("\\");
const dottedFilename = (stem, extension) => [stem, extension].join(".");
const fixture = JSON.parse(fs.readFileSync(path.join(dataRoot, "fixtures/championship-r1-content.json"), "utf8"));
const catalogMap = {
  "entities.r1.json": "entities", "battle-actions.r1.json": "actions", "gates.r1.json": "gates",
  "cages.r1.json": "cages", "shop-records.r1.json": "shopRecords", "title-matches.r1.json": "titleMatches",
  "eligibility-rules.r1.json": "eligibilityRules", "teams.r1.json": "teams",
  "battle-presets.r1.json": "battlePresets", "battle-fields.r1.json": "battleFields"
};

test("minimal R1 catalog validates at exact version", () => {
  const result = validateChampionshipCatalog(fixture);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.match(result.digest, /^fnv1a32:[0-9a-f]{8}$/);
  assert.equal(fixture.entities.length, 3);
  assert.ok(fixture.actions.length >= 2 && fixture.actions.length <= 3);
});

test("all JSON schemas parse and individual schemas resolve to bundle definitions", () => {
  const schemaRoot = path.join(dataRoot, "schemas");
  const names = fs.readdirSync(schemaRoot).filter((name) => name.endsWith(".schema.json")).sort();
  assert.deepEqual(names, [
    "battle-action.schema.json", "battle-field.schema.json", "battle-preset.schema.json", "cage.schema.json",
    "catalog-bundle.schema.json", "eligibility-rule.schema.json", "entity.schema.json", "gate.schema.json",
    "research-event.schema.json", "research-state.schema.json", "shop-record.schema.json", "team.schema.json", "title-match.schema.json"
  ]);
  const bundle = JSON.parse(fs.readFileSync(path.join(schemaRoot, "catalog-bundle.schema.json"), "utf8"));
  assert.equal(bundle.$schema, "https://json-schema.org/draft/2020-12/schema");
  for (const name of names) {
    const schema = JSON.parse(fs.readFileSync(path.join(schemaRoot, name), "utf8"));
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
    if (schema.$ref?.includes("#/$defs/")) assert.ok(bundle.$defs[schema.$ref.split("/").at(-1)]);
  }
});

test("split catalog envelopes match fixture records and sealed SHA-256 digests", () => {
  for (const [filename, fixtureKey] of Object.entries(catalogMap)) {
    const envelope = JSON.parse(fs.readFileSync(path.join(dataRoot, "catalogs", filename), "utf8"));
    assert.equal(envelope.schemaVersion, 1);
    assert.equal(envelope.authority, "NEXUS_PRODUCT");
    assert.match(envelope.catalogKind, /^nexus:/);
    assert.deepEqual(envelope.records, fixture[fixtureKey], `${filename} drifted from canonical fixture`);
    const digest = crypto.createHash("sha256").update(canonicalStringify(envelope.records)).digest("hex");
    assert.equal(envelope.recordsDigestSha256, digest, `${filename} digest is stale`);
    const validation = validateChampionshipCatalogEnvelope(envelope, { computedRecordsDigestSha256: digest });
    assert.equal(validation.valid, true, `${filename}: ${validation.errors.join("; ")}`);
    assert.equal(fixture.catalogDigests[fixtureKey], digest, `${filename} is missing from the product manifest`);
  }
});

test("synthetic schema capacity validates exact accepted forensic scales", () => {
  const synthetic = createSyntheticScaleCatalog(fixture);
  const result = validateChampionshipCatalog(synthetic, { requireScale: true });
  assert.equal(result.valid, true, result.errors.join("\n"));
  for (const [kind, expected] of Object.entries(FORENSIC_SCALE_EXPECTATIONS)) {
    assert.equal(synthetic[kind].length, expected, kind);
  }
  for (const kind of Object.keys(catalogMap).map((filename) => catalogMap[filename])) {
    const digest = crypto.createHash("sha256").update(canonicalStringify(synthetic[kind])).digest("hex");
    assert.equal(synthetic.catalogDigests[kind], digest, `synthetic ${kind} digest is stale`);
  }
});

test("duplicates, broken references, forbidden fields, and version drift fail closed", () => {
  const duplicate = structuredClone(fixture);
  duplicate.entities.push(structuredClone(duplicate.entities[0]));
  assert.equal(validateChampionshipCatalog(duplicate).valid, false);

  const broken = structuredClone(fixture);
  broken.titleMatches[0].battleFieldId = "nexus:missing:field";
  assert.equal(validateChampionshipCatalog(broken).valid, false);

  const privateField = structuredClone(fixture);
  privateField.actions[0].rawHex = "00";
  assert.equal(validateChampionshipCatalog(privateField).valid, false);

  const topLevelPrivate = structuredClone(fixture);
  topLevelPrivate.privateEvidence = { rawHex: "00", privatePath: windowsAbsolute("secret", dottedFilename("raw", "bin")) };
  assert.equal(validateChampionshipCatalog(topLevelPrivate).valid, false);

  const contradictoryAggregate = structuredClone(fixture);
  contradictoryAggregate.actions[0].aggregateParity.status = "VERIFIED_BEHAVIOR";
  assert.equal(validateChampionshipCatalog(contradictoryAggregate).valid, false);

  const unsupportedRuleField = structuredClone(fixture);
  unsupportedRuleField.actions[0].targetRule.rawBytes = "00";
  assert.equal(validateChampionshipCatalog(unsupportedRuleField).valid, false);

  const brokenRuleReference = structuredClone(fixture);
  brokenRuleReference.titleMatches[0].entryRule.value.ruleId = "nexus:missing:eligibility";
  assert.equal(validateChampionshipCatalog(brokenRuleReference).valid, false);

  const future = structuredClone(fixture);
  future.schemaVersion = 2;
  assert.equal(validateChampionshipCatalog(future).valid, false);
});

test("every schema-required record field and runtime rule array fails closed when omitted", () => {
  const bundleSchema = JSON.parse(fs.readFileSync(path.join(dataRoot, "schemas", "catalog-bundle.schema.json"), "utf8"));
  const schemaByCatalog = {
    entities: "entity", actions: "battleAction", gates: "gate", cages: "cage", shopRecords: "shopRecord",
    titleMatches: "titleMatch", eligibilityRules: "eligibilityRule", teams: "team",
    battlePresets: "battlePreset", battleFields: "battleField"
  };
  for (const [catalogKind, schemaName] of Object.entries(schemaByCatalog)) {
    for (const requiredKey of bundleSchema.$defs[schemaName].required) {
      const candidate = structuredClone(fixture);
      delete candidate[catalogKind][0][requiredKey];
      assert.equal(validateChampionshipCatalog(candidate).valid, false, `${catalogKind}.${requiredKey} omission must fail`);
    }
  }
  for (const [catalogKind, ruleKey] of [["actions", "timelineRules"], ["actions", "effectRules"], ["battlePresets", "arenaStatRules"], ["battlePresets", "actionLoadoutRules"]]) {
    const candidate = structuredClone(fixture);
    candidate[catalogKind][0][ruleKey] = [];
    assert.equal(validateChampionshipCatalog(candidate).valid, false, `${catalogKind}.${ruleKey} cannot be empty`);
  }
});

test("catalog envelope digest mismatch and duplicate animation slots fail closed", () => {
  const envelope = JSON.parse(fs.readFileSync(path.join(dataRoot, "catalogs", "entities.r1.json"), "utf8"));
  const mutated = structuredClone(envelope);
  mutated.records[0].displayName = "Mutated test record";
  const computed = crypto.createHash("sha256").update(canonicalStringify(mutated.records)).digest("hex");
  assert.equal(validateChampionshipCatalogEnvelope(mutated, { computedRecordsDigestSha256: computed }).valid, false);

  const synthetic = createSyntheticScaleCatalog(fixture);
  synthetic.regularMainAnimationSlots[39].rawSlot = 0;
  assert.equal(validateChampionshipCatalog(synthetic, { requireScale: true }).valid, false);
});

test("canonical serialization is key-order stable and rejects non-finite data", () => {
  assert.equal(canonicalStringify({ b: 2, a: 1 }), canonicalStringify({ a: 1, b: 2 }));
  assert.throws(() => canonicalStringify({ value: Number.NaN }), /Non-finite/);
  assert.throws(() => canonicalStringify({ value: Number.POSITIVE_INFINITY }), /Non-finite/);
});

test("catalog adapter owns an immutable plain-data copy and rejects executable object graphs", () => {
  const source = structuredClone(fixture);
  const adapter = createCanonicalCatalogAdapter(source);
  const catalog = adapter.read();
  const originalName = catalog.entities[0].displayName;
  source.entities[0].displayName = "Mutated after adapter construction";
  assert.equal(catalog.entities[0].displayName, originalName);
  assert.equal(Object.isFrozen(catalog), true);
  assert.equal(Object.isFrozen(catalog.entities), true);
  assert.equal(Object.isFrozen(catalog.entities[0]), true);
  assert.throws(() => createCanonicalCatalogAdapter({ ...structuredClone(fixture), callback() {} }), /plain serializable data/);

  const accessorBundle = structuredClone(fixture);
  Object.defineProperty(accessorBundle, "privateEvidence", { enumerable: true, get: () => "forbidden" });
  assert.throws(() => createCanonicalCatalogAdapter(accessorBundle), /Accessor property is forbidden/);

  const cyclicBundle = structuredClone(fixture);
  cyclicBundle.cycle = cyclicBundle;
  assert.throws(() => createCanonicalCatalogAdapter(cyclicBundle), /Cyclic Championship data/);

  const poisonedBundle = structuredClone(fixture);
  Object.defineProperty(poisonedBundle.entities[0], "__proto__", { enumerable: true, value: { sourceAuthority: "FORGED" } });
  assert.throws(() => createCanonicalCatalogAdapter(poisonedBundle), /Forbidden Championship data key/);
});
