# PROPOSED PHASE 1 FILE TREE

Status: exact R1 proposal; no files in this tree have been implemented

Legend:

- `[Lead]` shared contract/manifest adoption; Lead Integrator only
- `[D]` canonical schema/data lane
- `[E]` core lane
- `[F]` presentation lane
- `[QA]` tests written outside reviewer authority
- Agent G is read-only and owns no implementation file

```text
src/
  championship/
    index.js                                      [Lead]
    contracts/
      championshipContracts.js                   [Lead]
      evidencePolicy.js                          [Lead]
    core/
      championshipCommands.js                    [E]
      championshipEvents.js                      [E]
      championshipStateMachine.js                [E]
      createChampionshipResearchStore.js         [E]
      championshipReducer.js                     [E]
      championshipSelectors.js                   [E]
      transaction.js                             [E]
      seededRng.js                               [E]
      invariants.js                              [E]
    heartlake/
      projectHeartlakeProfile.js                 [E]
    gate/
      selectGate.js                              [E]
    hunt/
      startHunt.js                               [E]
    encounter/
      createWildEncounter.js                     [E]
    capture/
      resolveCaptureTransaction.js               [E]
    collection/
      collectionSelectors.js                     [E]
    shop/
      resolveShopTransaction.js                  [E]
    arena/
      createArenaMatch.js                        [E]
    battle/
      createResearchBattle.js                    [E]
      resolveResearchTurn.js                     [E]
      selectResearchOpponentAction.js            [E]
      buildResearchBattleResult.js               [E]
    adapters/
      createNexusProfileReadAdapter.js           [E]
      createCanonicalCatalogAdapter.js           [E]
    flags/
      championshipResearchFlag.js                [E]
    presentation/
      createChampionshipController.js            [F]
      createChampionshipScreenStack.js           [F]
      createChampionshipViewModel.js             [F]
      createChampionshipDomRenderer.js            [F]
      createChampionshipPixiPresenter.js          [F]
      createChampionshipInputAdapter.js           [F]
      createChampionshipFocusController.js        [F]

  data/
    championship/
      schemas/
        catalog-bundle.schema.json               [D/Lead]
        entity.schema.json                       [D]
        battle-action.schema.json                [D]
        gate.schema.json                         [D]
        cage.schema.json                         [D]
        shop-record.schema.json                  [D]
        title-match.schema.json                  [D]
        eligibility-rule.schema.json             [D]
        team.schema.json                         [D]
        battle-preset.schema.json                [D]
        battle-field.schema.json                 [D]
        research-state.schema.json               [D/Lead]
        research-event.schema.json               [D/Lead]
      catalogs/
        entities.r1.json                         [D]
        battle-actions.r1.json                   [D]
        gates.r1.json                            [D]
        cages.r1.json                            [D]
        shop-records.r1.json                     [D]
        title-matches.r1.json                    [D]
        eligibility-rules.r1.json                [D]
        teams.r1.json                            [D]
        battle-presets.r1.json                   [D]
        battle-fields.r1.json                    [D]
      fixtures/
        championship-r1-content.json             [D]
        championship-r1-profile.json             [D]
      validation/
        validateChampionshipCatalog.js           [D]
        validateChampionshipRecord.js            [D]
      testing/
        createSyntheticScaleCatalog.js           [D]

research/
  championship-r1/
    index.html                                   [F]
    styles.css                                   [F]
    entry.js                                     [F]

docs/
  design/
    CHAMPIONSHIP_DOMAIN_ARCHITECTURE_R1.md        [Lead]
    CHAMPIONSHIP_PRESENTATION_CONTRACT_R1.md      [Lead/F]
    CHAMPIONSHIP_EVIDENCE_POLICY_R1.md            [Lead]
  qa/
    championship-r1-core-cases.mjs               [QA]
    championship-r1-transaction-cases.mjs        [QA]
    championship-r1-evidence-cases.mjs           [QA]
    championship-r1-boundary-cases.mjs           [QA]
    championship-r1-schema-scale-cases.mjs       [QA]
    championship-r1-presentation-cases.mjs       [QA]
    _run_championship-r1-browser-gate.py          [QA]
    CHAMPIONSHIP_R1_MANUAL_MATRIX.md              [QA]
```

## Private workspaces outside the public repository

The following conceptual lanes are deliberately not paths in the public NexusLink tree:

```text
<PRIVATE_RE_ROOT>/                         # absolute; outside every Git checkout
  reverse/battle/**
  reverse/animation/**
  reverse/hunt/**
  ROM and ROM slices
  raw tables and decoded original text
  original NANR/NCER/NCGR/NCLR/map/audio bundles
  ledger-delta-proposal.json
```

Only reviewed, IP-safe metadata or project-native contracts may cross from the private lane into the public tree.

## Standalone entry

Proposed URL:

```text
research/championship-r1/index.html?championshipResearch=r1
```

The URL is repository-relative so GitHub project Pages resolves it beneath `/NexusLink/` rather than the site root. With the flag absent, `entry.js` checks the query first and only then conditionally imports the profile adapter, core, catalogs, and Pixi presenter. It displays a disabled research notice with zero runtime module requests, no `loadState` import/call, and no Pixi app/canvas. The page is not linked from production navigation in R1.

## No implicit additions

This exact tree does not authorize generated lockfiles, packages, build configs, copied reference assets, production routes, save migrations, service workers, analytics, cloud endpoints, or unrelated cleanups. Any extra file requires explicit impact review before implementation.
