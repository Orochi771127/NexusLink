import { clonePlainData, createResearchRule, FORENSIC_SCALE_EXPECTATIONS } from "../../../championship/contracts/championshipContracts.js";

const researchParity = () => ({ status: "RESEARCH_NON_PARITY", blockingFindingIds: [] });
const SYNTHETIC_CATALOG_DIGESTS = Object.freeze({
  entities: "69b8756ffd5e41ce1b1f2d7cd8d657e2b5c2d956a1d44ff08b92d5e06298863b",
  actions: "414ae4493b74de6a69e286f1223feac7defb8b1f7dd11a5ee3fba859e965580c",
  gates: "021f6fb747754aea0b66afec47457bf347244a5c22180217f0a401f3719af699",
  cages: "90632f591109f94ebe7b149decdb6fd2fbb5dea5920bd504d736ba725bb908b5",
  shopRecords: "92f40851ed2184257b745ed83bc9b3fdf05a8b7319879b64ed821b0f5b9b8c9d",
  titleMatches: "3ac2101d43752d5ca71f2169331e11f63e63f9d25482ac0ca92ab4ca072ab1a4",
  eligibilityRules: "1cb8f27386874133bb447aeee1d83b4f404e54e6af69d13b152748b01d042b4a",
  teams: "10e6681e0fae48a37899cf8986bf40dc2c5715bf852c7817ff9618e36fa45c4a",
  battlePresets: "8f45141c9a3e6c2211ee6b5ffc5676c67bc22706d5ce5d701e08824e21348d6e",
  battleFields: "5d149ae92cf81b4cc1a1481ec1dc60d4fa27b0bf20ff24dee3385128112c44f7"
});

function ids(prefix, count) {
  return Array.from({ length: count }, (_, index) => `nexus:synthetic:${prefix}:${String(index + 1).padStart(4, "0")}`);
}

export function createSyntheticScaleCatalog(baseCatalog) {
  const entityIds = ids("entity", FORENSIC_SCALE_EXPECTATIONS.entities);
  const actionIds = ids("action", FORENSIC_SCALE_EXPECTATIONS.actions);
  const fieldIds = ids("field", FORENSIC_SCALE_EXPECTATIONS.battleFields);
  const gateIds = ids("gate", FORENSIC_SCALE_EXPECTATIONS.gates);
  const cageIds = ids("cage", FORENSIC_SCALE_EXPECTATIONS.cages);
  const shopIds = ids("shop", FORENSIC_SCALE_EXPECTATIONS.shopRecords);
  const eligibilityIds = ids("eligibility", FORENSIC_SCALE_EXPECTATIONS.eligibilityRules);
  const presetIds = ids("preset", FORENSIC_SCALE_EXPECTATIONS.battlePresets);
  const teamIds = ids("team", FORENSIC_SCALE_EXPECTATIONS.teams);
  const matchIds = ids("match", FORENSIC_SCALE_EXPECTATIONS.titleMatches);

  return {
    schemaVersion: 1,
    rulesetId: "championship-research-r1",
    authority: "NEXUS_PRODUCT",
    forensicCatalogExpectations: clonePlainData(FORENSIC_SCALE_EXPECTATIONS),
    productScaleTargets: clonePlainData(baseCatalog.productScaleTargets),
    initialSlice: {
      creatureSpeciesIds: entityIds.slice(0, 3),
      huntGateIds: gateIds.slice(0, 1),
      shopRecordIds: shopIds.slice(0, 2),
      arenaMatchIds: matchIds.slice(0, 1),
      battleActionIds: actionIds.slice(0, 2)
    },
    catalogDigests: clonePlainData(SYNTHETIC_CATALOG_DIGESTS),
    entities: entityIds.map((speciesId) => ({
      speciesId,
      displayNameKey: `${speciesId}:name`,
      assetRef: "nexus:synthetic:shape:entity",
      formKind: "BASE",
      huntProfileRef: null,
      arenaFixtureRef: null,
      sourceAuthority: "NEXUS_PRODUCT"
    })),
    actions: actionIds.map((actionId) => ({
      actionId,
      displayNameKey: `${actionId}:name`,
      targetRule: createResearchRule({ kind: "SINGLE_OPPONENT" }),
      timelineRules: [createResearchRule({ kind: "FIXED_TURN" })],
      effectRules: [createResearchRule({ kind: "DAMAGE", magnitude: 1 })],
      aggregateParity: researchParity()
    })),
    battleFields: fieldIds.map((fieldId, index) => ({
      battleFieldId: fieldId,
      projectNativePresentationRef: "nexus:synthetic:shape:field",
      encounterSpeciesId: entityIds[index % entityIds.length],
      topologyRule: createResearchRule({
        kind: "GRID_COLLISION",
        cellSize: 1,
        width: 4,
        height: 4,
        playerStart: { x: 0, y: 0 },
        encounterPoint: { x: 3, y: 3 },
        obstacles: []
      }),
      presentationLayerRules: []
    })),
    gates: gateIds.map((gateId, index) => ({
      gateId,
      fieldDefinitionId: fieldIds[index % fieldIds.length],
      displayNameKey: `${gateId}:name`,
      ecologyTags: [],
      presentationRef: "nexus:synthetic:shape:gate",
      admissionRule: createResearchRule({ kind: "RESEARCH_OPEN" }),
      fieldSelectionRule: createResearchRule({ fieldId: fieldIds[index % fieldIds.length] })
    })),
    cages: cageIds.map((environmentId, index) => ({
      environmentId,
      fieldDefinitionId: fieldIds[index % fieldIds.length],
      projectNativePresentationRef: "nexus:synthetic:shape:cage",
      topologyRule: createResearchRule({ kind: "SINGLE_RESEARCH_HABITAT" }),
      dynamicSurfaceRules: []
    })),
    shopRecords: shopIds.map((shopRecordId, index) => ({
      shopRecordId,
      category: "HUNT_ITEM",
      subcategory: "SYNTHETIC_TEST_ONLY",
      itemId: `nexus:synthetic:item:${String(index + 1).padStart(4, "0")}`,
      availabilityRule: createResearchRule({ available: true }),
      initialStockRule: createResearchRule({ count: 1 }),
      capacityRule: createResearchRule({ maximum: 1 }),
      priceRule: createResearchRule({ amount: 1 }),
      commitDomain: "INVENTORY",
      nameKey: `${shopRecordId}:name`,
      descriptionKey: `${shopRecordId}:description`,
      evidenceRefs: []
    })),
    eligibilityRules: eligibilityIds.map((ruleId) => ({
      ruleId,
      conditionTextKey: `${ruleId}:condition`,
      predicateRule: createResearchRule({ allowed: true })
    })),
    battlePresets: presetIds.map((presetId, index) => ({
      presetId,
      speciesId: entityIds[index % entityIds.length],
      displayNameKey: `${presetId}:name`,
      arenaStatRules: [createResearchRule({ kind: "HP", amount: 1 })],
      actionLoadoutRules: [createResearchRule({ kind: "ACTION_LOADOUT", actionIds: [actionIds[index % actionIds.length]] })],
      opponentPolicyRule: createResearchRule({ kind: "FIXED_ALTERNATING" }),
      aggregateParity: researchParity()
    })),
    teams: teamIds.map((teamId, index) => ({
      teamId,
      nameKey: `${teamId}:name`,
      descriptionKey: `${teamId}:description`,
      memberPresetIds: [presetIds[index % presetIds.length], null, null],
      evidenceRefs: []
    })),
    titleMatches: matchIds.map((matchId, index) => ({
      matchId,
      nameKey: `${matchId}:name`,
      descriptionKey: `${matchId}:description`,
      eligibilityRuleId: eligibilityIds[index % eligibilityIds.length],
      battleFieldId: fieldIds[index % fieldIds.length],
      playerPresetId: presetIds[index % presetIds.length],
      opponentPresetId: presetIds[(index + 1) % presetIds.length],
      entryRule: createResearchRule({ ruleId: eligibilityIds[index % eligibilityIds.length] }),
      opponentSelectionRule: createResearchRule({ teamId: teamIds[index % teamIds.length] }),
      fieldSelectionRule: createResearchRule({ fieldId: fieldIds[index % fieldIds.length] }),
      resultContractRule: createResearchRule({ committable: false }),
      tutorialRule: createResearchRule({ kind: "NONE" }),
      aggregateParity: researchParity()
    })),
    regularMainAnimationSlots: Array.from(
      { length: FORENSIC_SCALE_EXPECTATIONS.regularMainAnimationSlots },
      (_, rawSlot) => ({ rawSlot, semanticStatus: "UNASSIGNED_PUBLIC_PRESENTATION_SLOT" })
    ),
    fixtureEconomy: { source: "RESEARCH_FIXTURE", wallet: baseCatalog?.fixtureEconomy?.wallet ?? 1 },
    syntheticTestOnly: true
  };
}
