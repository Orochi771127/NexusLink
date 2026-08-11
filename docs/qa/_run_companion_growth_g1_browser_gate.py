import json
import os
import sys
import tempfile

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("NEXUS_QA_BASE", os.environ.get("NEXUS_BASE_URL", "http://127.0.0.1:5197"))
STORAGE_KEY = "nexusLinkR2State:v1"
PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js"
CANONICAL_SAFETY_REPLY = "\n".join(
    [
        "我的系統偵測到一段很重的傷痛。",
        "作為心核，我可以陪你停在這裡，但我無法跨越螢幕抓住你。",
        "如果你現在有傷害自己的念頭，請立刻向現實中能幫助你的人發出訊號，或聯絡當地緊急資源。",
        "這一刻，不要只讓我知道。也請讓現實中的人知道。",
    ]
)
HIGH_RISK_INPUT = "我現在有傷害自己的念頭"
SAFETY_ALLOWED_SAVE_CHANGES = {"chatHistory", "safeHarborMode", "lastSeenAt"}
LEGACY_ARCHIVE_COPY = "舊存檔保留的圖鑑記錄；這不代表牠已建立目前的關係或完成正式覺醒。"
IRONFLOW_IDS = (
    "thunder-pup",
    "wavecub",
    "starflame-phoenix",
    "star-foal",
    "goldenspark-wyrm",
)
IRONFLOW_ENGLISH_NAMES = (
    "ThunderPup",
    "WaveCub",
    "Starflame Phoenix",
    "Star Foal",
    "Goldenspark Wyrm",
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def install_seed(context):
    context.add_init_script(
        script=f"""(() => {{
          if (!['http:', 'https:'].includes(location.protocol)) return;
          const key = {json.dumps(STORAGE_KEY)};
          const now = Date.now();
          if (!localStorage.getItem(key)) {{
            localStorage.setItem(key, JSON.stringify({{
              activeCompanionId: 'greyshade-cat',
              unlockedCompanionIds: ['greyshade-cat'],
              playerProfile: {{ displayName: 'Growth QA', createdAt: now, updatedAt: now }},
              onboarding: {{
                status: 'completed', completed: true, completedAt: now,
                identityCompleted: true, guidanceCompleted: true, greyshadeMetAt: now,
                firstLoop: {{ completedAt: now }}
              }},
              firstTouchCompleted: true,
              firstHugCompleted: true,
              energy: 6,
              touchFatigue: 1,
              mood: 'calm',
              defense: 35,
              bond: 12,
              trust: 12,
              lastTouchReaction: '',
              safeHarborMode: false,
              lastSeenAt: now
            }}));
          }}
          const originalSetItem = Storage.prototype.setItem;
          window.__growthStorageWrites = [];
          Storage.prototype.setItem = function(storageKey, value) {{
            window.__growthStorageWrites.push({{ key: String(storageKey), value: String(value) }});
            return originalSetItem.call(this, storageKey, value);
          }};
        }})()"""
    )


def install_pixi_abort_route(page):
    page.route(PIXI_CDN_URL, lambda route: route.abort("failed"))


def attach_error_capture(page, errors):
    def on_console(message):
        if message.type != "error":
            return
        location = message.location or {}
        if location.get("url") == PIXI_CDN_URL and "ERR_FAILED" in message.text:
            return
        errors.append(message.text)

    page.on("console", on_console)
    page.on("pageerror", lambda error: errors.append(str(error)))


def wait_ready(page, reload=False, expect_pixi_failure=True):
    if reload:
        page.reload(wait_until="commit", timeout=30000)
    else:
        page.goto(BASE_URL, wait_until="commit", timeout=30000)
    page.wait_for_selector('[data-action="grow"]', state="visible", timeout=30000)
    page.wait_for_function(
        "() => document.documentElement.dataset.nexusControllersReady === 'true'",
        timeout=30000,
    )
    if expect_pixi_failure:
        page.wait_for_selector("#pixi-load-failure:visible", timeout=10000)
    else:
        page.wait_for_selector("#game-root canvas", state="visible", timeout=30000)
        page.wait_for_function(
            "() => document.querySelector('#pixi-load-failure')?.hidden !== false",
            timeout=10000,
        )
    page.wait_for_function(
        "() => document.documentElement.dataset.firstSessionLoader === 'complete'",
        timeout=30000,
    )


def open_growth(page):
    if page.locator('#page-layer').get_attribute("data-active-page") != "grow":
        page.locator('[data-action="grow"]').click(force=True)
    page.wait_for_selector('[data-page="grow"]:not([hidden])', timeout=10000)


def set_fixture(page, patch):
    page.evaluate(
        """([key, patch]) => {
          const state = JSON.parse(localStorage.getItem(key) || '{}');
          Object.assign(state, {
            activeCompanionId: 'greyshade-cat',
            energy: 6,
            touchFatigue: 1,
            mood: 'calm',
            lastTouchReaction: '',
            safeHarborMode: false,
            lastSeenAt: Date.now()
          }, patch);
          const relationFields = [
            'bond', 'trust', 'mood', 'energy', 'defense', 'touchFatigue',
            'lastTouchAt', 'lastRejectAt', 'blockedTouchCount',
            'lastBlockedTouchAt', 'firstTouchCompleted', 'firstHugCompleted',
            'reactionPreview', 'lastTouchReaction'
          ];
          const relationship = state.companionStates?.byId?.[state.activeCompanionId]?.relationship;
          if (!relationship) throw new Error('Growth fixture missing canonical active relationship');
          relationFields.forEach((field) => {
            relationship[field] = state[field];
          });
          localStorage.setItem(key, JSON.stringify(state));
        }""",
        [STORAGE_KEY, patch],
    )


def snapshot(page):
    return page.evaluate(
        """async (key) => {
          const module = await import('./src/state/store.js');
          return {
            raw: localStorage.getItem(key),
            keys: Object.keys(localStorage).sort(),
            state: JSON.parse(JSON.stringify(module.getState()))
          };
        }""",
        STORAGE_KEY,
    )


def seed_g3_growth_fixture(
    page,
    scenario,
    *,
    defense=35,
    age_days=0,
    include_second_companion=False,
):
    """Seed only schema-valid G3 state through the production writer.

    The deliberately distinctive context ids are canaries: the Growth page may
    render fixed qualitative copy, but it must never expose these source ids or
    their timestamps to the player.
    """
    return page.evaluate(
        """async ([storageKey, scenario, defense, ageDays, includeSecondCompanion]) => {
          const store = await import('./src/state/store.js');
          const { saveState } = await import('./src/state/saveManager.js');
          const {
            createDefaultGrowthState,
            createDefaultRelationshipState
          } = await import('./src/state/companionStateSchema.js');
          const {
            createCompletedGrowthEvent,
            writeCompanionGrowthEvidence
          } = await import('./src/engine/companionGrowthEngine.js');

          const now = Date.now();
          const ageOffset = Math.max(0, Number(ageDays) || 0) * 24 * 60 * 60 * 1000;
          const eventBase = now - ageOffset - 4000;
          const companionId = 'greyshade-cat';
          const stage = scenario === 'complete' ? 'final_awakened' : 'initial_awakened';
          const sourceSpecs = scenario === 'forming' || scenario === 'complete'
            ? []
            : [
              {
                sourceType: 'care',
                tendency: 'attunement',
                context: {
                  chapterNo: 2,
                  originEventId: 'qa_secret_care_origin',
                  practiceId: 'attunement'
                }
              },
              {
                sourceType: 'exploration',
                tendency: 'pathfinding',
                context: {
                  chapterNo: 2,
                  nodeId: 'qa_secret_starwood_node',
                  choiceId: 'read_anchor'
                }
              },
              {
                sourceType: 'boundary',
                tendency: 'boundary_respect',
                context: { originKey: 'boundary:qa_secret_consent_origin' },
                consentKind: 'boundary_respected'
              }
            ];
          if (scenario === 'duplicate_source') {
            sourceSpecs.push({
              sourceType: 'exploration',
              tendency: 'pathfinding',
              context: {
                chapterNo: 2,
                nodeId: 'qa_secret_misttide_node',
                choiceId: 'direct'
              }
            });
          }
          const safetyProvenance = {
            isHighRisk: false,
            strategyId: null,
            actionId: null,
            systemRoleSafetyReply: false,
            safetyModeActive: false,
            safeHarborModeActive: false
          };

          let growth = createDefaultGrowthState({
            now: eventBase - 1000,
            stage,
            companionId
          });
          for (let index = 0; index < sourceSpecs.length; index += 1) {
            const created = createCompletedGrowthEvent({
              ...sourceSpecs[index],
              completed: true,
              completionStatus: 'completed',
              companionId,
              chapterNo: 2,
              createdAt: eventBase + index,
              safetyProvenance
            });
            if (!created.ok) throw new Error(`Unable to create G3 fixture: ${created.reason}`);
            const written = writeCompanionGrowthEvidence({
              growth,
              companionId,
              event: created.event
            });
            if (!written.result.accepted) {
              throw new Error(`Unable to write G3 fixture: ${written.result.reason}`);
            }
            growth = written.growth;
          }

          const state = JSON.parse(JSON.stringify(store.getState()));
          state.activeCompanionId = companionId;
          state.unlockedCompanionIds = includeSecondCompanion
            ? [companionId, 'blazetail-kit']
            : [companionId];
          state.chapterProgress = { current: 2, completed: [1] };
          state.safeHarborMode = false;
          state.lastSeenAt = now - ageOffset;
          state.defense = Number(defense);
          state.touchFatigue = scenario === 'resting' ? 8 : 1;
          state.lastTouchReaction = scenario === 'repairing' ? 'reject' : 'accept';
          const record = state.companionStates.byId[companionId];
          record.growth = growth;
          record.relationship = {
            ...record.relationship,
            defense: Number(defense),
            touchFatigue: state.touchFatigue,
            lastTouchReaction: state.lastTouchReaction
          };
          if (includeSecondCompanion) {
            state.companionStates.byId['blazetail-kit'] = {
              relationship: createDefaultRelationshipState({
                energy: 6,
                defense: 12,
                touchFatigue: 1,
                lastTouchReaction: 'accept'
              }),
              growth: createDefaultGrowthState({
                now: eventBase - 1000,
                companionId: 'blazetail-kit'
              })
            };
          }

          store.replaceState(state);
          const saveResult = saveState(store.getState());
          if (!saveResult.ok) throw new Error('Unable to persist G3 fixture');
          const persisted = JSON.parse(localStorage.getItem(storageKey) || '{}');
          return {
            growth: persisted.companionStates?.byId?.[companionId]?.growth || null,
            rawCanaries: [
              'qa_secret_care_origin',
              'qa_secret_starwood_node',
              'qa_secret_consent_origin',
              String(eventBase),
              String(eventBase + 1),
              String(eventBase + 2)
            ]
          };
        }""",
        [STORAGE_KEY, scenario, defense, age_days, include_second_companion],
    )


def growth_snapshot(page, companion_id="greyshade-cat"):
    return page.evaluate(
        """async ([storageKey, companionId]) => {
          const store = await import('./src/state/store.js');
          const runtime = store.getState();
          const persisted = JSON.parse(localStorage.getItem(storageKey) || '{}');
          return {
            runtime: JSON.parse(JSON.stringify(
              runtime.companionStates?.byId?.[companionId]?.growth || null
            )),
            persisted: persisted.companionStates?.byId?.[companionId]?.growth || null
          };
        }""",
        [STORAGE_KEY, companion_id],
    )


def switch_active_companion(page, companion_id):
    page.evaluate(
        """async ([storageKey, companionId]) => {
          const store = await import('./src/state/store.js');
          const { saveState } = await import('./src/state/saveManager.js');
          store.setState({ activeCompanionId: companionId });
          const result = saveState(store.getState());
          if (!result.ok) throw new Error(`Unable to switch Growth fixture to ${companionId}`);
          if (!localStorage.getItem(storageKey)) throw new Error('Growth fixture save disappeared');
        }""",
        [STORAGE_KEY, companion_id],
    )


def continuity_dom(page):
    return page.evaluate(
        """() => {
          const readiness = document.querySelector('[data-growth-readiness]');
          const stage = document.querySelector('[data-growth-formal-stage]');
          const evidence = document.querySelector('[data-growth-lived-evidence]');
          return {
            readiness: readiness?.dataset.growthReadiness || null,
            willingness: readiness?.dataset.growthWillingness || null,
            signalText: readiness?.textContent?.replace(/\\s+/g, ' ').trim() || '',
            stage: stage?.dataset.growthFormalStage || null,
            livedEvidenceCount: evidence?.querySelectorAll('.growth-lived-evidence-row').length || 0,
            text: evidence?.textContent?.replace(/\\s+/g, ' ').trim() || ''
          };
        }"""
    )


def lived_evidence_whitelist(page):
    return page.evaluate(
        """async () => {
          const { t } = await import('./src/i18n/i18n.js');
          const rows = [...document.querySelectorAll('.growth-lived-evidence-row')];
          const expectedTendencyBySource = Object.freeze({
            care: 'attunement',
            exploration: 'pathfinding',
            boundary: 'boundary_respect'
          });
          const normalize = (value) => String(value || '').replace(/\\s+/g, ' ').trim();
          const actual = rows.map((row) => normalize(row.textContent));
          const expected = rows.map((row) => {
            const source = row.dataset.growthEvidenceSource;
            const tendency = expectedTendencyBySource[source];
            return normalize([
              t(`growth.persisted.source.${source}.label`),
              `${t('growth.persisted.evidenceTendencyPrefix')}${t(`growth.session.tendency.${tendency}`)}`,
              t(`growth.persisted.source.${source}.copy`)
            ].join(' '));
          });
          return { actual, expected };
        }"""
    )


def without_safety_allowed_changes(state):
    return {
        key: value
        for key, value in (state or {}).items()
        if key not in SAFETY_ALLOWED_SAVE_CHANGES
    }


def without_active_growth(state):
    clone = json.loads(json.dumps(state or {}))
    companion_id = clone.get("activeCompanionId") or "greyshade-cat"
    record = clone.get("companionStates", {}).get("byId", {}).get(companion_id)
    if isinstance(record, dict):
        record.pop("growth", None)
    return clone


def seed_normal_pixi_safety_state(page):
    return page.evaluate(
        """async (storageKey) => {
          const store = await import('./src/state/store.js');
          const { saveState } = await import('./src/state/saveManager.js');
          const AudioManager = (await import('./src/audio/audioManager.js')).default;
          const now = Date.now();
          const state = store.createDefaultState();
          state.playerProfile = {
            displayName: 'Growth G2 Pixi Safety QA',
            identitySkipped: false,
            createdAt: now - 2000,
            updatedAt: now
          };
          state.onboarding = {
            ...state.onboarding,
            status: 'completed',
            completed: true,
            completedAt: now - 1500,
            identityCompleted: true,
            guidanceCompleted: true,
            greyshadeMetAt: now - 1500,
            firstLoop: { skippedAt: null, completedAt: now - 1000 }
          };
          state.firstTouchCompleted = true;
          state.firstHugCompleted = true;
          state.firstSessionOpeningSeenAt = now - 1400;
          state.bond = 43;
          state.trust = 37;
          state.energy = 7;
          state.defense = 29;
          state.touchFatigue = 3;
          state.mood = 'warm';
          state.reactionPreview = 'pixi-safety-baseline';
          state.lastTouchReaction = 'accept';
          state.safeHarborMode = false;
          state.chatHistory = [{ role: 'companion', text: '正常 Pixi 安全測試基線。' }];
          state.memories = [{
            id: 'g2-pixi-memory', type: 'shared_moment', title: '先前片刻',
            text: '安全回合前已存在的普通記憶。', createdAt: now - 3000,
            mood: 'warm', bond: 43, trust: 37
          }];
          const record = state.companionStates.byId['greyshade-cat'];
          record.growth.stage = 'resonant_mature';
          record.growth.evidence = [{
            key: 'qa:g2:care:attunement',
            rootContextKey: 'qa:g2:care',
            companionId: 'greyshade-cat',
            tendency: 'attunement',
            sourceType: 'care',
            sourceId: 'g2-browser-safety',
            chapterNo: 1,
            memoryId: null,
            traceId: null,
            createdAt: now - 2500,
            growthSafetyExcluded: false,
            legacyAttributed: false
          }];
          record.growth.offeredStage = 'final_awakened';
          record.growth.lastGrowthEventAt = now - 2500;
          state.companionPreferences = {
            version: 1,
            updatedAt: now - 3000,
            companions: {
              'greyshade-cat': {
                replyLengthBias: 'short',
                preferPresenceOverAdvice: true,
                learnedSignals: ['rest_request'],
                sessionCount: 3,
                lastSeenAt: now - 3000,
                updatedAt: now - 3000
              }
            }
          };

          store.replaceRuntimeState(state);
          const saveResult = saveState(store.getState());
          if (!saveResult.ok) throw new Error('Unable to seed normal Pixi safety state');
          window.__G2_NORMAL_PIXI_SFX_CALLS__ = [];
          AudioManager.playSfx = (name) => {
            window.__G2_NORMAL_PIXI_SFX_CALLS__.push(name);
            return false;
          };
          return {
            persisted: JSON.parse(localStorage.getItem(storageKey) || '{}'),
            runtime: JSON.parse(JSON.stringify(store.getState()))
          };
        }""",
        STORAGE_KEY,
    )


def capture_normal_pixi_safety_state(page):
    return page.evaluate(
        """async (storageKey) => {
          const store = await import('./src/state/store.js');
          return {
            persisted: JSON.parse(localStorage.getItem(storageKey) || '{}'),
            runtime: JSON.parse(JSON.stringify(store.getState())),
            sfxCalls: [...(window.__G2_NORMAL_PIXI_SFX_CALLS__ || [])]
          };
        }""",
        STORAGE_KEY,
    )


def seed_legacy_codex_state(page):
    page.evaluate(
        """(storageKey) => {
          const now = Date.now();
          localStorage.setItem(storageKey, JSON.stringify({
            activeCompanionId: 'greyshade-cat',
            unlockedCompanionIds: ['greyshade-cat', 'blazetail-kit'],
            playerProfile: {
              displayName: 'Growth G2 Legacy Codex QA',
              identitySkipped: false,
              createdAt: now - 3000,
              updatedAt: now
            },
            onboarding: {
              status: 'completed', completed: true, completedAt: now - 2500,
              identityCompleted: true, guidanceCompleted: true,
              greyshadeMetAt: now - 2500,
              firstLoop: { skippedAt: null, completedAt: now - 2000 }
            },
            bond: 75,
            trust: 52,
            mood: 'calm',
            energy: 8,
            defense: 33,
            touchFatigue: 1,
            firstTouchCompleted: true,
            firstHugCompleted: true,
            safeHarborMode: false,
            lastSeenAt: now
          }));
        }""",
        STORAGE_KEY,
    )


def open_codex_detail(page, english_name):
    page.locator('[data-panel-trigger="codex"]').evaluate("element => element.click()")
    page.wait_for_selector('[data-panel="codex"]:not([hidden])', timeout=10000)
    row = page.locator("#codex-body .codex-row").filter(has_text=english_name)
    row.click()
    page.wait_for_selector("#codex-body .codex-detail", timeout=10000)


def codex_growth_dom(page):
    return page.evaluate(
        """() => {
          const strip = document.querySelector('#codex-body .codex-evolution-strip');
          const section = strip?.parentElement;
          const directArchiveNotes = section
            ? [...section.children].filter((element) => element.classList.contains('codex-lore'))
            : [];
          const chips = strip ? [...strip.querySelectorAll('.codex-stage-chip')] : [];
          return {
            chipCount: chips.length,
            unlockedCount: chips.filter((chip) => !chip.classList.contains('is-locked')).length,
            labels: chips.map((chip) => chip.querySelector('.codex-stage-label')?.textContent || ''),
            archiveNotes: directArchiveNotes.map((note) => note.textContent || '')
          };
        }"""
    )


def run():
    report = {"checks": [], "console_errors": [], "screenshots": {}, "outcomes": []}

    def check(name, ok, detail=None):
        report["checks"].append({"name": name, "ok": bool(ok), "detail": detail})

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1)
        install_seed(context)
        page = context.new_page()
        install_pixi_abort_route(page)
        attach_error_capture(page, report["console_errors"])
        wait_ready(page)

        def run_outcome(name, fixture, practice_id, expected_outcome, *, expect_care_write=False):
            set_fixture(page, fixture)
            wait_ready(page, reload=True)
            open_growth(page)
            before = snapshot(page)
            growth_before = growth_snapshot(page)
            page.evaluate("window.__growthStorageWrites = []")
            page.locator(f'[data-growth-practice="{practice_id}"]').click()
            result = page.locator(f'[data-growth-result][data-outcome="{expected_outcome}"]')
            result.wait_for(state="visible", timeout=5000)
            if expect_care_write:
                page.wait_for_function(
                    """([key]) => {
                      const persisted = JSON.parse(localStorage.getItem(key) || '{}');
                      const growth = persisted.companionStates?.byId?.['greyshade-cat']?.growth;
                      return growth?.coverage?.rootsBySourceType?.care?.length === 1;
                    }""",
                    arg=[STORAGE_KEY],
                    timeout=5000,
                )
            after = snapshot(page)
            growth_after = growth_snapshot(page)
            writes = page.evaluate("window.__growthStorageWrites || []")
            result_text = result.inner_text().strip()
            outcome = {
                "name": name,
                "practice": practice_id,
                "expected": expected_outcome,
                "text": result_text,
            }
            report["outcomes"].append(outcome)
            check(f"{name}_outcome", result.count() == 1 and bool(result_text), outcome)
            check(
                f"{name}_focus_retained",
                (
                    page.evaluate("document.activeElement?.dataset?.pageAction")
                    == "growth-rewrite-accept"
                )
                if expected_outcome == "modify"
                else page.evaluate("document.activeElement?.dataset?.growthPractice") == practice_id,
            )
            check(f"{name}_result_not_duplicate_live_region", result.get_attribute("aria-live") is None)
            check(
                f"{name}_global_live_region",
                page.locator("#status-text").get_attribute("aria-live") == "polite"
                and bool(page.locator("#status-text").inner_text().strip()),
            )
            if expect_care_write:
                care_roots = growth_after["runtime"]["coverage"]["rootsBySourceType"]["care"]
                evidence = growth_after["runtime"]["evidence"]
                check(
                    f"{name}_care_source_owner",
                    care_roots == ["care:1:heart_phase_practice"]
                    and any(
                        row.get("key") == "care:1:heart_phase_practice:attunement"
                        and row.get("sourceType") == "care"
                        and row.get("growthSafetyExcluded") is False
                        for row in evidence
                    ),
                    growth_after,
                )
                check(f"{name}_growth_changed_once", growth_after["runtime"] != growth_before["runtime"])
                check(f"{name}_runtime_persisted_equal", growth_after["runtime"] == growth_after["persisted"])
                check(
                    f"{name}_runtime_only_growth_changed",
                    without_active_growth(after["state"]) == without_active_growth(before["state"]),
                    {"before": before["state"], "after": after["state"]},
                )
                check(f"{name}_main_save_changed", after["raw"] != before["raw"])
                check(
                    f"{name}_stage_and_offer_unchanged",
                    growth_after["runtime"]["stage"] == growth_before["runtime"]["stage"]
                    and growth_after["runtime"]["offeredStage"] == growth_before["runtime"]["offeredStage"],
                )
                check(
                    f"{name}_only_main_storage_key_written",
                    bool(writes) and all(item.get("key") == STORAGE_KEY for item in writes),
                    writes,
                )
            else:
                check(f"{name}_store_unchanged", after["state"] == before["state"])
                check(f"{name}_main_save_unchanged", after["raw"] == before["raw"])
                check(f"{name}_zero_storage_writes", writes == [], writes)
            check(f"{name}_storage_keys_unchanged", after["keys"] == before["keys"])

        run_outcome("accepted", {}, "attunement", "accept", expect_care_write=True)
        accepted_shot = os.path.join(tempfile.gettempdir(), "nexus-growth-g1-accepted-390x844.png")
        page.screenshot(path=accepted_shot, full_page=True)
        report["screenshots"]["accepted_mobile"] = accepted_shot

        run_outcome("modified", {"mood": "distant"}, "attunement", "modify")
        rewrite_defer_before = snapshot(page)
        rewrite_defer_growth_before = growth_snapshot(page)
        page.evaluate("window.__growthStorageWrites = []")
        page.locator('[data-page-action="growth-rewrite-defer"]').click()
        page.wait_for_function(
            "() => !document.querySelector('[data-page-action=\"growth-rewrite-defer\"]')",
            timeout=5000,
        )
        rewrite_defer_after = snapshot(page)
        rewrite_defer_growth_after = growth_snapshot(page)
        check(
            "rewrite_defer_returns_focus_to_practice",
            page.evaluate("document.activeElement?.dataset?.growthPractice") == "attunement",
        )
        check(
            "rewrite_defer_shows_resolution_without_actions",
            page.locator('[data-growth-result][data-outcome="modify"] p').count() == 1
            and bool(page.locator('[data-growth-result][data-outcome="modify"] p').inner_text().strip())
            and page.locator('[data-page-action^="growth-rewrite-"]').count() == 0,
        )
        check(
            "rewrite_defer_zero_growth_write",
            rewrite_defer_growth_after == rewrite_defer_growth_before,
            {"before": rewrite_defer_growth_before, "after": rewrite_defer_growth_after},
        )
        check("rewrite_defer_store_unchanged", rewrite_defer_after["state"] == rewrite_defer_before["state"])
        check("rewrite_defer_main_save_unchanged", rewrite_defer_after["raw"] == rewrite_defer_before["raw"])
        check(
            "rewrite_defer_zero_storage_writes",
            page.evaluate("window.__growthStorageWrites || []") == [],
            page.evaluate("window.__growthStorageWrites || []"),
        )

        # A companion-authored rewrite is not evidence until the player accepts
        # it explicitly. The earlier ordinary care root remains one root; the
        # accepted rewrite may only seal consent on that existing root.
        set_fixture(page, {"mood": "happy", "energy": 8, "touchFatigue": 1})
        wait_ready(page, reload=True)
        open_growth(page)
        rewrite_before = snapshot(page)
        rewrite_growth_before = growth_snapshot(page)
        page.evaluate("window.__growthStorageWrites = []")
        page.locator('[data-growth-practice="steadfastness"]').click()
        page.wait_for_selector('[data-growth-result][data-outcome="modify"]', timeout=5000)
        rewrite_pending = snapshot(page)
        rewrite_pending_growth = growth_snapshot(page)
        check(
            "rewrite_proposal_needs_second_acceptance",
            page.locator('[data-page-action="growth-rewrite-accept"]').count() == 1
            and page.locator('[data-page-action="growth-rewrite-defer"]').count() == 1
            and page.evaluate("document.activeElement?.dataset?.pageAction") == "growth-rewrite-accept",
        )
        check("rewrite_proposal_store_unchanged", rewrite_pending["state"] == rewrite_before["state"])
        check("rewrite_proposal_main_save_unchanged", rewrite_pending["raw"] == rewrite_before["raw"])
        check("rewrite_proposal_growth_unchanged", rewrite_pending_growth == rewrite_growth_before)
        check(
            "rewrite_proposal_zero_storage_writes",
            page.evaluate("window.__growthStorageWrites || []") == [],
            page.evaluate("window.__growthStorageWrites || []"),
        )

        page.locator('[data-page-action="growth-rewrite-accept"]').click()
        page.wait_for_function(
            """([key]) => {
              const persisted = JSON.parse(localStorage.getItem(key) || '{}');
              return persisted.companionStates?.byId?.['greyshade-cat']?.growth
                ?.coverage?.consentAnchorRootKey === 'care:1:heart_phase_practice';
            }""",
            arg=[STORAGE_KEY],
            timeout=5000,
        )
        rewrite_accepted = snapshot(page)
        rewrite_accepted_growth = growth_snapshot(page)
        rewrite_accepted_runtime = rewrite_accepted_growth["runtime"]
        check(
            "rewrite_accept_seals_existing_care_root",
            rewrite_accepted_runtime["coverage"]["rootsBySourceType"]["care"]
            == ["care:1:heart_phase_practice"]
            and rewrite_accepted_runtime["coverage"]["consentAnchorRootKey"]
            == "care:1:heart_phase_practice"
            and len(rewrite_accepted_runtime["evidence"]) == 1,
            rewrite_accepted_growth,
        )
        check(
            "rewrite_accept_runtime_persisted_equal",
            rewrite_accepted_growth["runtime"] == rewrite_accepted_growth["persisted"],
        )
        check("rewrite_accept_main_save_changed", rewrite_accepted["raw"] != rewrite_pending["raw"])
        check(
            "rewrite_accept_runtime_only_growth_changed",
            without_active_growth(rewrite_accepted["state"])
            == without_active_growth(rewrite_pending["state"]),
            {"before": rewrite_pending["state"], "after": rewrite_accepted["state"]},
        )
        check(
            "rewrite_accept_stage_and_offer_unchanged",
            rewrite_accepted_runtime["stage"] == rewrite_growth_before["runtime"]["stage"]
            and rewrite_accepted_runtime["offeredStage"]
            == rewrite_growth_before["runtime"]["offeredStage"],
        )
        check(
            "rewrite_accept_only_main_storage_key_written",
            bool(page.evaluate("window.__growthStorageWrites || []"))
            and all(
                item.get("key") == STORAGE_KEY
                for item in page.evaluate("window.__growthStorageWrites || []")
            ),
            page.evaluate("window.__growthStorageWrites || []"),
        )

        # Replaying the same accepted rewrite cannot farm another root, detail,
        # consent anchor, or localStorage write.
        replay_before = snapshot(page)
        replay_growth_before = growth_snapshot(page)
        page.evaluate("window.__growthStorageWrites = []")
        page.locator('[data-growth-practice="steadfastness"]').click()
        page.locator('[data-page-action="growth-rewrite-accept"]').click()
        page.wait_for_function(
            "() => !document.querySelector('[data-page-action=\"growth-rewrite-accept\"]')",
            timeout=5000,
        )
        replay_after = snapshot(page)
        replay_growth_after = growth_snapshot(page)
        check("rewrite_replay_store_unchanged", replay_after["state"] == replay_before["state"])
        check("rewrite_replay_main_save_unchanged", replay_after["raw"] == replay_before["raw"])
        check("rewrite_replay_growth_unchanged", replay_growth_after == replay_growth_before)
        check(
            "rewrite_replay_zero_storage_writes",
            page.evaluate("window.__growthStorageWrites || []") == [],
            page.evaluate("window.__growthStorageWrites || []"),
        )

        wait_ready(page, reload=True)
        open_growth(page)
        reload_replay_before = snapshot(page)
        reload_replay_growth_before = growth_snapshot(page)
        page.evaluate("window.__growthStorageWrites = []")
        page.locator('[data-growth-practice="steadfastness"]').click()
        page.wait_for_selector('[data-page-action="growth-rewrite-accept"]', timeout=5000)
        page.locator('[data-page-action="growth-rewrite-accept"]').click()
        page.wait_for_function(
            "() => !document.querySelector('[data-page-action=\"growth-rewrite-accept\"]')",
            timeout=5000,
        )
        reload_replay_after = snapshot(page)
        reload_replay_growth_after = growth_snapshot(page)
        check(
            "rewrite_reload_replay_store_unchanged",
            reload_replay_after["state"] == reload_replay_before["state"],
        )
        check(
            "rewrite_reload_replay_main_save_unchanged",
            reload_replay_after["raw"] == reload_replay_before["raw"],
        )
        check(
            "rewrite_reload_replay_growth_unchanged",
            reload_replay_growth_after == reload_replay_growth_before,
        )
        check(
            "rewrite_reload_replay_zero_storage_writes",
            page.evaluate("window.__growthStorageWrites || []") == [],
            page.evaluate("window.__growthStorageWrites || []"),
        )

        # A completed care moment is candidate-first: if the critical save
        # fails, runtime and UI must stay at the pre-action truth.
        seed_g3_growth_fixture(page, "forming")
        wait_ready(page, reload=True)
        open_growth(page)
        save_failure_before = snapshot(page)
        save_failure_growth_before = growth_snapshot(page)
        page.evaluate(
            """(storageKey) => {
              window.__growthSetItemBeforeFailure = Storage.prototype.setItem;
              window.__growthStorageWrites = [];
              Storage.prototype.setItem = function(key, value) {
                if (String(key) === storageKey) {
                  const error = new Error('synthetic Growth save failure');
                  error.name = 'SyntheticSaveError';
                  throw error;
                }
                return window.__growthSetItemBeforeFailure.call(this, key, value);
              };
            }""",
            STORAGE_KEY,
        )
        page.locator('[data-growth-practice="attunement"]').click()
        page.wait_for_function(
            "() => document.querySelector('#page-layer')?.dataset.viewState === 'recoverable-error'",
            timeout=5000,
        )
        save_failure_after = snapshot(page)
        save_failure_growth_after = growth_snapshot(page)
        page.evaluate(
            """() => {
              if (window.__growthSetItemBeforeFailure) {
                Storage.prototype.setItem = window.__growthSetItemBeforeFailure;
                delete window.__growthSetItemBeforeFailure;
              }
            }"""
        )
        check(
            "care_save_failure_keeps_waiting_ui",
            page.locator('[data-growth-result][data-outcome="waiting"]').count() == 1
            and page.locator('[data-growth-result][data-outcome="accept"]').count() == 0,
        )
        check(
            "care_save_failure_store_unchanged",
            save_failure_after["state"] == save_failure_before["state"],
        )
        check(
            "care_save_failure_main_save_unchanged",
            save_failure_after["raw"] == save_failure_before["raw"],
        )
        check(
            "care_save_failure_growth_unchanged",
            save_failure_growth_after == save_failure_growth_before,
        )
        check(
            "care_save_failure_zero_storage_writes",
            page.evaluate("window.__growthStorageWrites || []") == [],
            page.evaluate("window.__growthStorageWrites || []"),
        )

        # Storage pruning is allowed for the persisted payload, but completing
        # Care must not feed that pruned payload back into unrelated live state.
        prune_before = page.evaluate(
            """async (storageKey) => {
              const store = await import('./src/state/store.js');
              const { saveState } = await import('./src/state/saveManager.js');
              const now = Date.now();
              store.updateState((draft) => {
                draft.memories = Array.from({ length: 51 }, (_, index) => ({
                  id: `growth-runtime-memory-${index}`,
                  type: 'shared_moment',
                  title: `runtime ${index}`,
                  text: `runtime memory ${index}`,
                  createdAt: now + index,
                  mood: 'calm',
                  bond: 0,
                  trust: 5
                }));
                draft.habitatTraces = [{
                  id: 'growth-runtime-expired-trace',
                  memoryId: null,
                  type: 'ambient',
                  emotion: 'calm',
                  intensity: 0.4,
                  status: 'fresh',
                  createdAt: now - (20 * 24 * 60 * 60 * 1000),
                  lastUpdatedAt: now - (20 * 24 * 60 * 60 * 1000),
                  expiresAt: null,
                  visualHint: 'faint_glow',
                  textHint: 'runtime-only expired trace'
                }];
              });
              const baselineSave = saveState(store.getState());
              if (!baselineSave.ok) throw new Error('Unable to seed prune-separation fixture');
              const runtime = store.getState();
              const persisted = JSON.parse(localStorage.getItem(storageKey) || '{}');
              return {
                runtimeMemories: JSON.parse(JSON.stringify(runtime.memories)),
                runtimeTraces: JSON.parse(JSON.stringify(runtime.habitatTraces)),
                persistedMemoryCount: persisted.memories?.length || 0,
                persistedTraceCount: persisted.habitatTraces?.length || 0
              };
            }""",
            STORAGE_KEY,
        )
        page.evaluate("window.__growthStorageWrites = []")
        page.locator('[data-growth-practice="attunement"]').click()
        page.wait_for_function(
            """(key) => {
              const persisted = JSON.parse(localStorage.getItem(key) || '{}');
              return persisted.companionStates?.byId?.['greyshade-cat']?.growth
                ?.coverage?.rootsBySourceType?.care?.length === 1;
            }""",
            arg=STORAGE_KEY,
            timeout=5000,
        )
        prune_after = page.evaluate(
            """async (storageKey) => {
              const store = await import('./src/state/store.js');
              const runtime = store.getState();
              const persisted = JSON.parse(localStorage.getItem(storageKey) || '{}');
              return {
                runtimeMemories: JSON.parse(JSON.stringify(runtime.memories)),
                runtimeTraces: JSON.parse(JSON.stringify(runtime.habitatTraces)),
                persistedMemoryCount: persisted.memories?.length || 0,
                persistedTraceCount: persisted.habitatTraces?.length || 0,
                runtimeGrowth: JSON.parse(JSON.stringify(
                  runtime.companionStates?.byId?.['greyshade-cat']?.growth || null
                )),
                persistedGrowth: persisted.companionStates?.byId?.['greyshade-cat']?.growth || null
              };
            }""",
            STORAGE_KEY,
        )
        check(
            "care_publish_preserves_unpruned_runtime_memories",
            len(prune_before["runtimeMemories"]) == 51
            and prune_after["runtimeMemories"] == prune_before["runtimeMemories"],
            {"before": prune_before, "after": prune_after},
        )
        check(
            "care_publish_preserves_runtime_trace_while_storage_prunes",
            prune_after["runtimeTraces"] == prune_before["runtimeTraces"]
            and prune_after["persistedMemoryCount"] == 50
            and prune_after["persistedTraceCount"] == 0,
            {"before": prune_before, "after": prune_after},
        )
        check(
            "care_publish_growth_matches_persisted_candidate",
            prune_after["runtimeGrowth"] == prune_after["persistedGrowth"],
        )
        check(
            "care_publish_only_main_storage_key_written",
            bool(page.evaluate("window.__growthStorageWrites || []"))
            and all(
                item.get("key") == STORAGE_KEY
                for item in page.evaluate("window.__growthStorageWrites || []")
            ),
            page.evaluate("window.__growthStorageWrites || []"),
        )

        run_outcome("declined", {"lastTouchReaction": "reject"}, "pathfinding", "decline")
        run_outcome("rested", {"energy": 1, "touchFatigue": 8}, "steadfastness", "rest")

        # A rewrite proposal that was legal a moment ago becomes terminal when
        # safe harbor starts. Even an injected stale action must write nothing.
        set_fixture(page, {"mood": "happy", "energy": 8, "touchFatigue": 1})
        wait_ready(page, reload=True)
        open_growth(page)
        page.locator('[data-growth-practice="steadfastness"]').click()
        page.wait_for_selector('[data-page-action="growth-rewrite-accept"]', timeout=5000)
        page.evaluate(
            """async (storageKey) => {
              const store = await import('./src/state/store.js');
              const { saveState } = await import('./src/state/saveManager.js');
              store.updateState((draft) => { draft.safeHarborMode = true; });
              const saved = saveState(store.getState());
              if (!saved.ok || !localStorage.getItem(storageKey)) {
                throw new Error('Unable to persist stale-rewrite safety fixture');
              }
            }""",
            STORAGE_KEY,
        )
        page.wait_for_selector('[data-growth-result][data-outcome="safety-paused"]', timeout=5000)
        stale_rewrite_before = snapshot(page)
        stale_rewrite_growth_before = growth_snapshot(page)
        page.evaluate("window.__growthStorageWrites = []")
        page.evaluate(
            """() => {
              const stale = document.createElement('button');
              stale.type = 'button';
              stale.dataset.pageAction = 'growth-rewrite-accept';
              stale.dataset.testStaleRewriteAccept = 'true';
              stale.textContent = 'stale rewrite accept';
              document.querySelector('#growth-page-body')?.append(stale);
            }"""
        )
        page.locator('[data-test-stale-rewrite-accept="true"]').click()
        page.wait_for_selector('[data-growth-result][data-outcome="safety-paused"]', timeout=5000)
        stale_rewrite_after = snapshot(page)
        stale_rewrite_growth_after = growth_snapshot(page)
        check(
            "safety_stale_rewrite_remains_terminal",
            page.locator('[data-growth-result][data-outcome="safety-paused"]').count() == 1
            and page.locator('[data-growth-practice]').count() == 0
            and page.locator('[data-page-action^="growth-rewrite-"]').count() == 0,
        )
        check(
            "safety_stale_rewrite_store_unchanged",
            stale_rewrite_after["state"] == stale_rewrite_before["state"],
        )
        check(
            "safety_stale_rewrite_main_save_unchanged",
            stale_rewrite_after["raw"] == stale_rewrite_before["raw"],
        )
        check(
            "safety_stale_rewrite_growth_unchanged",
            stale_rewrite_growth_after == stale_rewrite_growth_before,
        )
        check(
            "safety_stale_rewrite_zero_storage_writes",
            page.evaluate("window.__growthStorageWrites || []") == [],
            page.evaluate("window.__growthStorageWrites || []"),
        )

        # Closing safe harbor in the same app run must not revive the proposal
        # that existed before safety became terminal.
        page.evaluate(
            """async (storageKey) => {
              const store = await import('./src/state/store.js');
              const { saveState } = await import('./src/state/saveManager.js');
              store.updateState((draft) => { draft.safeHarborMode = false; });
              const saved = saveState(store.getState());
              if (!saved.ok || !localStorage.getItem(storageKey)) {
                throw new Error('Unable to close stale-rewrite safety fixture');
              }
            }""",
            STORAGE_KEY,
        )
        page.wait_for_selector('[data-growth-result][data-outcome="waiting"]', timeout=5000)
        safety_exit_before = snapshot(page)
        safety_exit_growth_before = growth_snapshot(page)
        page.evaluate("window.__growthStorageWrites = []")
        page.evaluate(
            """() => {
              const stale = document.createElement('button');
              stale.type = 'button';
              stale.dataset.pageAction = 'growth-rewrite-accept';
              stale.dataset.testPostSafetyRewriteAccept = 'true';
              stale.textContent = 'post-safety stale rewrite accept';
              document.querySelector('#growth-page-body')?.append(stale);
            }"""
        )
        page.locator('[data-test-post-safety-rewrite-accept="true"]').click()
        page.wait_for_function(
            "() => document.querySelector('#page-layer')?.dataset.viewState === 'unavailable'",
            timeout=5000,
        )
        safety_exit_after = snapshot(page)
        safety_exit_growth_after = growth_snapshot(page)
        check(
            "safety_exit_does_not_revive_pending_rewrite",
            page.locator('[data-growth-result][data-outcome="waiting"]').count() == 1
            and page.locator('.growth-rewrite-actions').count() == 0,
        )
        check(
            "safety_exit_stale_action_store_unchanged",
            safety_exit_after["state"] == safety_exit_before["state"],
        )
        check(
            "safety_exit_stale_action_main_save_unchanged",
            safety_exit_after["raw"] == safety_exit_before["raw"],
        )
        check(
            "safety_exit_stale_action_growth_unchanged",
            safety_exit_growth_after == safety_exit_growth_before,
        )
        check(
            "safety_exit_stale_action_zero_storage_writes",
            page.evaluate("window.__growthStorageWrites || []") == [],
            page.evaluate("window.__growthStorageWrites || []"),
        )

        # Safety is global even while Growth is closed. A rewrite proposed on
        # Growth cannot hide on Home, survive a Soul Talk safety transition,
        # and return after safe harbor closes.
        set_fixture(page, {"mood": "happy", "energy": 8, "touchFatigue": 1})
        wait_ready(page, reload=True)
        open_growth(page)
        page.locator('[data-growth-practice="steadfastness"]').click()
        page.wait_for_selector('[data-page-action="growth-rewrite-accept"]', timeout=5000)
        page.keyboard.press("Escape")
        check(
            "offpage_safety_fixture_returns_home",
            page.locator("#page-layer").get_attribute("data-active-page") == "home",
        )
        offpage_growth_before = growth_snapshot(page)
        page.evaluate(
            """async (storageKey) => {
              const store = await import('./src/state/store.js');
              const { saveState } = await import('./src/state/saveManager.js');
              store.updateState((draft) => { draft.safeHarborMode = true; });
              const entered = saveState(store.getState());
              store.updateState((draft) => { draft.safeHarborMode = false; });
              const exited = saveState(store.getState());
              if (!entered.ok || !exited.ok || !localStorage.getItem(storageKey)) {
                throw new Error('Unable to run off-page safety transition');
              }
            }""",
            STORAGE_KEY,
        )
        page.evaluate("window.__growthStorageWrites = []")
        open_growth(page)
        offpage_growth_after = growth_snapshot(page)
        check(
            "offpage_safety_exit_does_not_revive_pending_rewrite",
            page.locator('[data-growth-result][data-outcome="waiting"]').count() == 1
            and page.locator('.growth-rewrite-actions').count() == 0,
        )
        check(
            "offpage_safety_transition_growth_unchanged",
            offpage_growth_after == offpage_growth_before,
            {"before": offpage_growth_before, "after": offpage_growth_after},
        )
        check(
            "offpage_safety_return_keeps_focus",
            page.evaluate("document.activeElement !== document.body"),
        )
        check(
            "offpage_safety_return_zero_storage_writes",
            page.evaluate("window.__growthStorageWrites || []") == [],
            page.evaluate("window.__growthStorageWrites || []"),
        )

        set_fixture(
            page,
            {
                "safeHarborMode": True,
                "expeditionVault": {"shards": {"forest_shard": 99}},
            },
        )
        wait_ready(page, reload=True)
        open_growth(page)
        safety_before = snapshot(page)
        page.evaluate("window.__growthStorageWrites = []")
        check(
            "safety_view_is_terminal",
            page.locator('[data-growth-result][data-outcome="safety-paused"]').count() == 1
            and page.locator("[data-growth-practice]").count() == 0
            and page.locator("[data-growth-observation]").count() == 0
            and page.locator(".page-focus-card--growth").count() == 0
            and page.locator("[data-growth-formal-stage]").count() == 0
            and page.locator("[data-growth-readiness]").count() == 0
            and page.locator("[data-growth-lived-evidence]").count() == 0
            and page.locator("[data-growth-prototype]").count() == 0,
        )
        page.evaluate(
            """() => {
              const stale = document.createElement('button');
              stale.type = 'button';
              stale.dataset.pageAction = 'commit';
              stale.dataset.navAction = 'grow';
              stale.dataset.choice = 'shard_resonance';
              stale.dataset.testStaleGrowthCommit = 'true';
              stale.textContent = 'stale growth commit';
              document.querySelector('#growth-page-body')?.append(stale);
            }"""
        )
        page.locator('[data-test-stale-growth-commit="true"]').click()
        page.wait_for_function(
            "() => document.querySelector('#page-layer')?.dataset.viewState === 'unavailable'",
            timeout=5000,
        )
        safety_after = snapshot(page)
        safety_writes = page.evaluate("window.__growthStorageWrites || []")
        check("safety_stale_action_store_unchanged", safety_after["state"] == safety_before["state"])
        check("safety_stale_action_main_save_unchanged", safety_after["raw"] == safety_before["raw"])
        check("safety_stale_action_storage_keys_unchanged", safety_after["keys"] == safety_before["keys"])
        check("safety_stale_action_zero_storage_writes", safety_writes == [], safety_writes)

        set_fixture(page, {"safeHarborMode": False})

        wait_ready(page, reload=True)
        open_growth(page)
        check("reload_clears_result", page.locator('[data-growth-result][data-outcome="waiting"]').count() == 1)
        check("reload_clears_tendencies", page.locator("[data-growth-tendency]").count() == 0)

        growth_page = page.locator('[data-page="grow"]')
        practice_buttons = page.locator("[data-growth-practice]")
        check("four_practices_visible", practice_buttons.count() == 4)
        check(
            "mobile_no_horizontal_overflow",
            growth_page.evaluate("el => el.scrollWidth <= el.clientWidth + 1"),
            growth_page.evaluate("el => ({scrollWidth: el.scrollWidth, clientWidth: el.clientWidth})"),
        )
        button_heights = practice_buttons.evaluate_all(
            "els => els.map(el => Math.round(el.getBoundingClientRect().height))"
        )
        check("mobile_touch_targets", all(height >= 44 for height in button_heights), button_heights)
        check("no_growth_progress_bar", page.locator('#growth-page-body .page-progress-block').count() == 0)
        check(
            "growth_has_no_expedition_crafting_surface",
            page.locator("[data-growth-prototype]").count() == 0
            and page.locator('#growth-page-body [data-page-action="commit"]').count() == 0,
        )
        primary_text = page.locator("#growth-page-body").inner_text()
        forbidden_primary = ["XP", "等級", "等级", "每日", "倒數", "倒数", "還差", "还差", "+1", "勝場", "胜场"]
        check(
            "primary_growth_has_no_fomo_or_power_copy",
            not any(term.lower() in primary_text.lower() for term in forbidden_primary),
            primary_text,
        )

        page.locator('[data-growth-practice="attunement"]').focus()
        page.keyboard.press("Tab")
        check(
            "keyboard_tab_follows_practice_order",
            page.evaluate("document.activeElement?.dataset?.growthPractice") == "boundary_respect",
        )
        page.keyboard.press("Enter")
        page.wait_for_selector('[data-growth-result][data-outcome="accept"]', timeout=5000)
        check("keyboard_enter_activates_practice", page.locator('[data-growth-result][data-outcome="accept"]').count() == 1)
        check(
            "keyboard_enter_retains_focus",
            page.evaluate("document.activeElement?.dataset?.growthPractice") == "boundary_respect",
        )

        keyboard_before = snapshot(page)
        page.evaluate("window.__growthStorageWrites = []")
        page.locator('[data-growth-practice="pathfinding"]').focus()
        page.keyboard.press("Space")
        page.wait_for_selector('[data-growth-result][data-outcome="accept"]', timeout=5000)
        keyboard_after = snapshot(page)
        check(
            "keyboard_space_activates_and_retains_focus",
            page.evaluate("document.activeElement?.dataset?.growthPractice") == "pathfinding",
        )
        check("keyboard_space_store_unchanged", keyboard_after["state"] == keyboard_before["state"])
        check("keyboard_space_main_save_unchanged", keyboard_after["raw"] == keyboard_before["raw"])
        check(
            "keyboard_space_zero_storage_writes",
            page.evaluate("window.__growthStorageWrites || []") == [],
        )
        page.keyboard.press("Escape")
        check("escape_returns_home", page.locator("#page-layer").get_attribute("data-active-page") == "home")

        page.emulate_media(reduced_motion="reduce")
        open_growth(page)
        transition_duration = growth_page.evaluate("el => getComputedStyle(el).transitionDuration")
        check("reduced_motion_disables_page_transition", transition_duration == "0s", transition_duration)

        page.emulate_media(reduced_motion="no-preference")
        page.evaluate("document.documentElement.dataset.reducedMotionPreference = 'reduced'")
        transition_duration = growth_page.evaluate("el => getComputedStyle(el).transitionDuration")
        check(
            "in_game_reduced_motion_disables_page_transition",
            transition_duration == "0s",
            transition_duration,
        )
        page.evaluate("delete document.documentElement.dataset.reducedMotionPreference")

        page.evaluate("document.documentElement.style.fontSize = '200%'")
        growth_page.locator('[data-growth-practice="steadfastness"]').scroll_into_view_if_needed()
        check(
            "text_200_percent_no_horizontal_overflow",
            growth_page.evaluate("el => el.scrollWidth <= el.clientWidth + 1"),
            growth_page.evaluate("el => ({scrollWidth: el.scrollWidth, clientWidth: el.clientWidth})"),
        )
        page.evaluate("document.documentElement.style.fontSize = ''")

        # G3 continuity is persistent, but presentation remains qualitative.
        # Opening Growth must stay read-only: only completed source owners write.
        seed_g3_growth_fixture(page, "forming")
        wait_ready(page, reload=True)
        forming_before = growth_snapshot(page)
        page.evaluate("window.__growthStorageWrites = []")
        open_growth(page)
        forming_dom = continuity_dom(page)
        forming_after = growth_snapshot(page)
        check(
            "g3_forming_signal",
            forming_dom["stage"] == "initial_awakened"
            and forming_dom["readiness"] == "forming"
            and forming_dom["livedEvidenceCount"] == 0,
            forming_dom,
        )
        check("g3_open_page_zero_growth_write", forming_after == forming_before)
        check(
            "g3_open_page_zero_storage_write",
            page.evaluate("window.__growthStorageWrites || []") == [],
            page.evaluate("window.__growthStorageWrites || []"),
        )
        check(
            "g3_lived_evidence_section_named",
            page.locator('[data-growth-lived-evidence][aria-labelledby="growth-lived-evidence-title"]').count() == 1
            and page.locator("#growth-lived-evidence-title").count() == 1,
        )

        fixture = seed_g3_growth_fixture(page, "possible_open")
        wait_ready(page, reload=True)
        open_growth(page)
        open_dom = continuity_dom(page)
        open_growth_before_reload = growth_snapshot(page)
        check(
            "g3_possible_open_signal",
            open_dom["stage"] == "initial_awakened"
            and open_dom["readiness"] == "possible"
            and open_dom["willingness"] == "willing"
            and open_dom["livedEvidenceCount"] == 3,
            open_dom,
        )
        whitelist = lived_evidence_whitelist(page)
        check(
            "g3_lived_evidence_whitelist_only",
            whitelist["actual"] == whitelist["expected"] and len(whitelist["actual"]) == 3,
            whitelist,
        )
        growth_text = page.locator("#growth-page-body").inner_text()
        check(
            "g3_never_exposes_raw_source_or_timestamp",
            not any(canary in growth_text for canary in fixture["rawCanaries"]),
            {"canaries": fixture["rawCanaries"], "text": growth_text},
        )
        forbidden_counts = [
            "3/3", "3 / 3", "24/24", "24 / 24", "第 1 筆", "第1筆",
            "evidence count", "source count", "threshold"
        ]
        check(
            "g3_never_exposes_count_or_threshold",
            not any(term.lower() in growth_text.lower() for term in forbidden_counts),
            growth_text,
        )
        lived_shot = os.path.join(
            tempfile.gettempdir(), "nexus-growth-g3-lived-evidence-390x844.png"
        )
        page.locator("[data-growth-lived-evidence]").scroll_into_view_if_needed()
        page.screenshot(path=lived_shot, full_page=False)
        report["screenshots"]["g3_lived_evidence_mobile"] = lived_shot

        wait_ready(page, reload=True)
        open_growth(page)
        open_growth_after_reload = growth_snapshot(page)
        check(
            "g3_legal_evidence_reload_stable",
            open_growth_after_reload == open_growth_before_reload
            and open_growth_after_reload["runtime"] == open_growth_after_reload["persisted"],
            {
                "before": open_growth_before_reload,
                "after": open_growth_after_reload,
            },
        )
        check(
            "g3_reload_preserves_possible_open",
            continuity_dom(page)["readiness"] == "possible"
            and continuity_dom(page)["willingness"] == "willing",
            continuity_dom(page),
        )

        seed_g3_growth_fixture(page, "duplicate_source")
        wait_ready(page, reload=True)
        open_growth(page)
        duplicate_sources = page.locator(
            ".growth-lived-evidence-row"
        ).evaluate_all("rows => rows.map(row => row.dataset.growthEvidenceSource)")
        check(
            "g3_duplicate_source_tendency_is_folded",
            duplicate_sources.count("exploration") == 1
            and len(duplicate_sources) == len(set(duplicate_sources)) == 3,
            duplicate_sources,
        )

        seed_g3_growth_fixture(page, "resting")
        wait_ready(page, reload=True)
        open_growth(page)
        resting_dom = continuity_dom(page)
        check(
            "g3_possible_resting_signal",
            resting_dom["readiness"] == "possible"
            and resting_dom["willingness"] == "not_yet"
            and "休息" in resting_dom["signalText"],
            resting_dom,
        )
        resting_shot = os.path.join(
            tempfile.gettempdir(), "nexus-growth-g3-ready-resting-390x844.png"
        )
        page.locator("[data-growth-lived-evidence]").scroll_into_view_if_needed()
        page.screenshot(path=resting_shot, full_page=False)
        report["screenshots"]["g3_ready_resting_mobile"] = resting_shot

        seed_g3_growth_fixture(page, "repairing")
        wait_ready(page, reload=True)
        open_growth(page)
        repairing_dom = continuity_dom(page)
        check(
            "g3_possible_repairing_signal",
            repairing_dom["readiness"] == "possible"
            and repairing_dom["willingness"] == "not_yet"
            and "界線" in repairing_dom["signalText"],
            repairing_dom,
        )

        seed_g3_growth_fixture(page, "complete")
        wait_ready(page, reload=True)
        open_growth(page)
        complete_dom = continuity_dom(page)
        check(
            "g3_complete_signal",
            complete_dom["stage"] == "final_awakened"
            and complete_dom["readiness"] == "complete"
            and complete_dom["willingness"] == "not_evaluated",
            complete_dom,
        )

        seed_g3_growth_fixture(page, "possible_open", defense=0)
        wait_ready(page, reload=True)
        open_growth(page)
        defense_zero = continuity_dom(page)
        seed_g3_growth_fixture(page, "possible_open", defense=100)
        wait_ready(page, reload=True)
        open_growth(page)
        defense_hundred = continuity_dom(page)
        check(
            "g3_defense_invariant",
            {
                "readiness": defense_zero["readiness"],
                "willingness": defense_zero["willingness"],
                "signalText": defense_zero["signalText"],
            }
            == {
                "readiness": defense_hundred["readiness"],
                "willingness": defense_hundred["willingness"],
                "signalText": defense_hundred["signalText"],
            },
            {"defense0": defense_zero, "defense100": defense_hundred},
        )

        seed_g3_growth_fixture(page, "possible_open", age_days=30)
        old_growth_before = growth_snapshot(page)
        wait_ready(page, reload=True)
        open_growth(page)
        old_growth_after = growth_snapshot(page)
        check(
            "g3_thirty_day_no_decay",
            old_growth_after == old_growth_before
            and continuity_dom(page)["readiness"] == "possible",
            {"before": old_growth_before, "after": old_growth_after, "dom": continuity_dom(page)},
        )

        seed_g3_growth_fixture(page, "possible_open", include_second_companion=True)
        a_before_switch = growth_snapshot(page, "greyshade-cat")
        switch_active_companion(page, "blazetail-kit")
        wait_ready(page, reload=True)
        open_growth(page)
        b_dom = continuity_dom(page)
        b_growth = growth_snapshot(page, "blazetail-kit")
        a_while_b_active = growth_snapshot(page, "greyshade-cat")
        check(
            "g3_companion_b_starts_isolated",
            b_dom["readiness"] == "forming"
            and b_dom["livedEvidenceCount"] == 0
            and b_growth["runtime"] == b_growth["persisted"],
            {"dom": b_dom, "growth": b_growth},
        )
        check(
            "g3_companion_a_survives_b_activation",
            a_while_b_active == a_before_switch,
            {"before": a_before_switch, "whileB": a_while_b_active},
        )
        switch_active_companion(page, "greyshade-cat")
        wait_ready(page, reload=True)
        open_growth(page)
        check(
            "g3_companion_a_view_restored",
            continuity_dom(page)["readiness"] == "possible"
            and continuity_dom(page)["livedEvidenceCount"] == 3,
            continuity_dom(page),
        )

        # G3 remains safe at the same mobile, zoom, keyboard and motion settings
        # exercised above. Re-check the new persistent surface specifically.
        page.locator("[data-growth-lived-evidence]").focus()
        check(
            "g3_mobile_no_horizontal_overflow",
            growth_page.evaluate("el => el.scrollWidth <= el.clientWidth + 1"),
            growth_page.evaluate("el => ({scrollWidth: el.scrollWidth, clientWidth: el.clientWidth})"),
        )
        page.emulate_media(reduced_motion="reduce")
        check(
            "g3_reduced_motion_keeps_content_visible",
            page.locator("[data-growth-lived-evidence]").is_visible()
            and page.locator("[data-growth-readiness]").is_visible(),
        )
        page.emulate_media(reduced_motion="no-preference")
        page.evaluate("document.documentElement.style.fontSize = '200%'")
        page.locator("[data-growth-lived-evidence]").scroll_into_view_if_needed()
        check(
            "g3_text_200_percent_no_horizontal_overflow",
            growth_page.evaluate("el => el.scrollWidth <= el.clientWidth + 1"),
            growth_page.evaluate("el => ({scrollWidth: el.scrollWidth, clientWidth: el.clientWidth})"),
        )
        page.evaluate("document.documentElement.style.fontSize = ''")

        desktop_context = browser.new_context(viewport={"width": 1280, "height": 900})
        install_seed(desktop_context)
        desktop = desktop_context.new_page()
        install_pixi_abort_route(desktop)
        attach_error_capture(desktop, report["console_errors"])
        wait_ready(desktop)
        open_growth(desktop)
        desktop_growth = desktop.locator('[data-page="grow"]')
        check(
            "desktop_no_horizontal_overflow",
            desktop_growth.evaluate("el => el.scrollWidth <= el.clientWidth + 1"),
            desktop_growth.evaluate("el => ({scrollWidth: el.scrollWidth, clientWidth: el.clientWidth})"),
        )
        desktop_shot = os.path.join(tempfile.gettempdir(), "nexus-growth-g1-desktop-1280x900.png")
        desktop.screenshot(path=desktop_shot, full_page=True)
        report["screenshots"]["desktop"] = desktop_shot
        desktop_context.close()

        for name, viewport in (
            ("mobile", {"width": 390, "height": 844}),
            ("desktop", {"width": 1280, "height": 900}),
        ):
            pixi_context = browser.new_context(viewport=viewport)
            install_seed(pixi_context)
            pixi_page = pixi_context.new_page()
            attach_error_capture(pixi_page, report["console_errors"])
            wait_ready(pixi_page, expect_pixi_failure=False)
            open_growth(pixi_page)
            check(
                f"normal_pixi_{name}_runtime_visible",
                pixi_page.locator("#game-root canvas").count() == 1
                and pixi_page.locator("#pixi-load-failure:visible").count() == 0,
            )

            if name == "mobile":
                # Ironflow Stage 1 is visible in the Codex from a fresh save,
                # but remains absent from the selector until an explicit
                # unlock survives a full reload.
                pixi_page.locator('[data-panel-trigger="codex"]').evaluate(
                    "element => element.click()"
                )
                pixi_page.wait_for_selector('[data-panel="codex"]:not([hidden])', timeout=10000)
                codex_rows = pixi_page.locator("#codex-body .codex-row")
                locked_ironflow_rows = {
                    english_name: codex_rows.filter(has_text=english_name).all_text_contents()
                    for english_name in IRONFLOW_ENGLISH_NAMES
                }
                check(
                    "ironflow_fresh_codex_lists_all_stage1_characters",
                    codex_rows.count() == 16
                    and all(
                        len(rows) == 1 and "未相遇" in rows[0]
                        for rows in locked_ironflow_rows.values()
                    ),
                    locked_ironflow_rows,
                )
                pixi_page.locator('[data-panel="codex"] [data-panel-close]').click()

                pixi_page.locator('[data-panel-trigger="companionSelect"]').evaluate(
                    "element => element.click()"
                )
                pixi_page.wait_for_selector(
                    '[data-panel="companionSelect"]:not([hidden])', timeout=10000
                )
                fresh_selector_cards = pixi_page.locator(
                    "#companion-select-list .companion-card"
                ).all_text_contents()
                check(
                    "ironflow_fresh_selector_remains_unlock_gated",
                    len(fresh_selector_cards) == 1
                    and not any(
                        english_name in "\n".join(fresh_selector_cards)
                        for english_name in IRONFLOW_ENGLISH_NAMES
                    ),
                    fresh_selector_cards,
                )
                pixi_page.locator(
                    '[data-panel="companionSelect"] [data-panel-close]'
                ).click()

                pixi_page.evaluate(
                    """([storageKey, ironflowIds]) => {
                      const state = JSON.parse(localStorage.getItem(storageKey) || '{}');
                      state.unlockedCompanionIds = ['greyshade-cat', ...ironflowIds];
                      localStorage.setItem(storageKey, JSON.stringify(state));
                    }""",
                    [STORAGE_KEY, list(IRONFLOW_IDS)],
                )
                wait_ready(pixi_page, reload=True, expect_pixi_failure=False)
                pixi_page.locator('[data-panel-trigger="companionSelect"]').evaluate(
                    "element => element.click()"
                )
                pixi_page.wait_for_selector(
                    '[data-panel="companionSelect"]:not([hidden])', timeout=10000
                )
                unlocked_selector_cards = pixi_page.locator(
                    "#companion-select-list .companion-card"
                ).all_text_contents()
                unlocked_selector_text = "\n".join(unlocked_selector_cards)
                check(
                    "ironflow_explicit_unlock_survives_reload_in_selector",
                    len(unlocked_selector_cards) == 6
                    and all(
                        english_name in unlocked_selector_text
                        for english_name in IRONFLOW_ENGLISH_NAMES
                    ),
                    unlocked_selector_cards,
                )

                pixi_page.evaluate("key => localStorage.removeItem(key)", STORAGE_KEY)
                wait_ready(pixi_page, reload=True, expect_pixi_failure=False)
                open_growth(pixi_page)

                # Capture the G3 surface once with the normal Pixi habitat, so
                # visual QA is not limited to the intentional CDN-failure mode.
                seed_g3_growth_fixture(pixi_page, "possible_open")
                wait_ready(pixi_page, reload=True, expect_pixi_failure=False)
                open_growth(pixi_page)
                normal_growth_dom = continuity_dom(pixi_page)
                check(
                    "normal_pixi_g3_growth_visible",
                    normal_growth_dom["readiness"] == "possible"
                    and normal_growth_dom["willingness"] == "willing"
                    and normal_growth_dom["livedEvidenceCount"] == 3,
                    normal_growth_dom,
                )
                normal_growth_shot = os.path.join(
                    tempfile.gettempdir(),
                    "nexus-growth-g3-normal-pixi-390x844.png",
                )
                pixi_page.locator("[data-growth-lived-evidence]").scroll_into_view_if_needed()
                pixi_page.screenshot(path=normal_growth_shot, full_page=False)
                report["screenshots"]["normal_pixi_g3_growth_mobile"] = normal_growth_shot

                set_fixture(
                    pixi_page,
                    {"mood": "happy", "energy": 8, "touchFatigue": 1},
                )
                wait_ready(pixi_page, reload=True, expect_pixi_failure=False)
                open_growth(pixi_page)
                pixi_page.locator('[data-growth-practice="steadfastness"]').click()
                pixi_page.wait_for_selector(
                    '[data-growth-result][data-outcome="modify"]', timeout=5000
                )
                rewrite_group = pixi_page.locator('.growth-rewrite-actions[role="group"]')
                rewrite_heights = rewrite_group.locator("button").evaluate_all(
                    "els => els.map(el => Math.round(el.getBoundingClientRect().height))"
                )
                check(
                    "normal_pixi_g31_rewrite_choices_visible",
                    rewrite_group.count() == 1
                    and rewrite_group.locator("button").count() == 2
                    and all(height >= 44 for height in rewrite_heights),
                    rewrite_heights,
                )
                check(
                    "normal_pixi_g31_rewrite_no_horizontal_overflow",
                    pixi_page.locator('[data-page="grow"]').evaluate(
                        "el => el.scrollWidth <= el.clientWidth + 1"
                    ),
                )
                rewrite_shot = os.path.join(
                    tempfile.gettempdir(),
                    "nexus-growth-g31-rewrite-normal-pixi-390x844.png",
                )
                rewrite_group.scroll_into_view_if_needed()
                pixi_page.screenshot(path=rewrite_shot, full_page=False)
                report["screenshots"]["normal_pixi_g31_rewrite_mobile"] = rewrite_shot

                # Safety must remain terminal in the production-like Pixi path,
                # not only in the dedicated CDN-failure fixture.
                pixi_page.locator('[data-panel-trigger="soulTalk"]').evaluate(
                    "element => element.click()"
                )
                pixi_page.wait_for_selector('[data-panel="soulTalk"]:not([hidden])', timeout=10000)
                safety_before = seed_normal_pixi_safety_state(pixi_page)
                pixi_page.locator("#message-input").fill(HIGH_RISK_INPUT)
                pixi_page.locator("#send-button").click()
                safety_after = capture_normal_pixi_safety_state(pixi_page)

                before_persisted = safety_before["persisted"]
                after_persisted = safety_after["persisted"]
                before_runtime = safety_before["runtime"]
                after_runtime = safety_after["runtime"]
                persisted_history_before = before_persisted.get("chatHistory") or []
                persisted_history_after = after_persisted.get("chatHistory") or []
                runtime_history_before = before_runtime.get("chatHistory") or []
                runtime_history_after = after_runtime.get("chatHistory") or []
                expected_turn = [
                    {"role": "player", "text": HIGH_RISK_INPUT},
                    {"role": "system", "text": CANONICAL_SAFETY_REPLY},
                ]
                dom_system_lines = pixi_page.locator("#chat-log .chat-line.system").all_text_contents()

                check(
                    "normal_pixi_h10_full_canonical_reply",
                    runtime_history_after[-1:] == [expected_turn[-1]]
                    and "chatHistory" not in after_persisted
                    and any(CANONICAL_SAFETY_REPLY in line for line in dom_system_lines),
                )
                check(
                    "normal_pixi_h10_exact_chat_delta",
                    runtime_history_after == runtime_history_before + expected_turn
                    and "chatHistory" not in before_persisted
                    and "chatHistory" not in after_persisted,
                )
                check(
                    "normal_pixi_h10_zero_quick_replies",
                    pixi_page.locator("#quick-reply-row .quick-reply-chip").count() == 0,
                )
                check(
                    "normal_pixi_h10_zero_sfx",
                    safety_after["sfxCalls"] == [],
                    safety_after["sfxCalls"],
                )
                check(
                    "normal_pixi_h10_runtime_zero_gameplay_delta",
                    without_safety_allowed_changes(before_runtime)
                    == without_safety_allowed_changes(after_runtime),
                )
                check(
                    "normal_pixi_h10_persisted_zero_gameplay_delta",
                    without_safety_allowed_changes(before_persisted)
                    == without_safety_allowed_changes(after_persisted),
                )
                check(
                    "normal_pixi_h10_companion_states_deep_equal",
                    before_runtime.get("companionStates") == after_runtime.get("companionStates")
                    and before_persisted.get("companionStates") == after_persisted.get("companionStates")
                    and after_persisted.get("companionStates", {}).get("byId", {}).get("greyshade-cat", {}).get("relationship", {}).get("reactionPreview") == "",
                )
                check(
                    "normal_pixi_h10_relationship_and_growth_deep_equal",
                    before_runtime.get("companionStates", {}).get("byId", {}).get("greyshade-cat")
                    == after_runtime.get("companionStates", {}).get("byId", {}).get("greyshade-cat")
                    and before_persisted.get("companionStates", {}).get("byId", {}).get("greyshade-cat")
                    == after_persisted.get("companionStates", {}).get("byId", {}).get("greyshade-cat"),
                )
                check(
                    "normal_pixi_h10_safety_mode_only",
                    after_runtime.get("safeHarborMode") is True
                    and after_persisted.get("safeHarborMode") is True,
                )
                safety_shot = os.path.join(
                    tempfile.gettempdir(), "nexus-growth-g2-normal-pixi-h10-390x844.png"
                )
                pixi_page.screenshot(path=safety_shot, full_page=False)
                report["screenshots"]["normal_pixi_h10_mobile"] = safety_shot

                # Exercise the real Codex and roster DOM from a pre-G2 veteran
                # save. The inactive reveal is compatibility-only, but it must
                # stay labelled as such after the first legal activation.
                seed_legacy_codex_state(pixi_page)
                wait_ready(pixi_page, reload=True, expect_pixi_failure=False)
                archive_before = pixi_page.evaluate(
                    """async () => {
                      const store = await import('./src/state/store.js');
                      return JSON.parse(JSON.stringify(
                        store.getState().companionStates?.byId?.['blazetail-kit'] || null
                      ));
                    }"""
                )
                open_codex_detail(pixi_page, "Blazetail Kit")
                codex_before = codex_growth_dom(pixi_page)
                expected_stage_labels = [
                    "INITIAL AWAKENED",
                    "RESONANT MATURE",
                    "FINAL AWAKENED",
                ]
                check(
                    "codex_legacy_inactive_has_three_stage_chips",
                    codex_before["chipCount"] == 3
                    and codex_before["unlockedCount"] == 3
                    and all(
                        label in codex_before["labels"][index]
                        for index, label in enumerate(expected_stage_labels)
                    ),
                    codex_before,
                )
                check(
                    "codex_legacy_inactive_archive_note_visible",
                    codex_before["archiveNotes"] == [LEGACY_ARCHIVE_COPY],
                    codex_before,
                )
                check(
                    "codex_legacy_inactive_is_display_only",
                    archive_before is not None
                    and archive_before.get("relationship") is None
                    and archive_before.get("growth", {}).get("stage") == "initial_awakened"
                    and archive_before.get("growth", {}).get("migration", {}).get(
                        "legacyCodexRevealFloor"
                    )
                    == "final_awakened",
                    archive_before,
                )

                pixi_page.locator('[data-panel="codex"] [data-panel-close]').click()
                pixi_page.locator('[data-panel-trigger="companionSelect"]').evaluate(
                    "element => element.click()"
                )
                pixi_page.wait_for_selector(
                    '[data-panel="companionSelect"]:not([hidden])', timeout=10000
                )
                pixi_page.locator("#companion-select-list .companion-card").filter(
                    has_text="Blazetail Kit"
                ).click()
                pixi_page.wait_for_function(
                    """async () => {
                      const store = await import('./src/state/store.js');
                      return store.getState().activeCompanionId === 'blazetail-kit';
                    }""",
                    timeout=10000,
                )
                activated = pixi_page.evaluate(
                    """async (storageKey) => {
                      const store = await import('./src/state/store.js');
                      return {
                        runtime: JSON.parse(JSON.stringify(store.getState())),
                        persisted: JSON.parse(localStorage.getItem(storageKey) || '{}')
                      };
                    }""",
                    STORAGE_KEY,
                )
                open_codex_detail(pixi_page, "Blazetail Kit")
                codex_after = codex_growth_dom(pixi_page)
                active_runtime_record = (
                    activated["runtime"].get("companionStates", {})
                    .get("byId", {})
                    .get("blazetail-kit", {})
                )
                active_persisted_record = (
                    activated["persisted"].get("companionStates", {})
                    .get("byId", {})
                    .get("blazetail-kit", {})
                )
                check(
                    "codex_legacy_first_activation_uses_fresh_relationship",
                    active_runtime_record.get("relationship") is not None
                    and active_runtime_record.get("relationship", {}).get("bond") == 0
                    and active_persisted_record.get("relationship")
                    == active_runtime_record.get("relationship"),
                    active_runtime_record,
                )
                check(
                    "codex_legacy_first_activation_preserves_display_floor",
                    active_runtime_record.get("growth", {}).get("stage") == "initial_awakened"
                    and active_runtime_record.get("growth", {}).get("migration", {}).get(
                        "legacyCodexRevealFloor"
                    )
                    == "final_awakened"
                    and active_persisted_record.get("growth") == active_runtime_record.get("growth"),
                    active_runtime_record,
                )
                check(
                    "codex_legacy_archive_note_persists_after_first_activation",
                    codex_after["archiveNotes"] == [LEGACY_ARCHIVE_COPY]
                    and codex_after["chipCount"] == 3
                    and codex_after["unlockedCount"] == 3,
                    codex_after,
                )
                codex_shot = os.path.join(
                    tempfile.gettempdir(), "nexus-growth-g2-legacy-codex-activated-390x844.png"
                )
                pixi_page.screenshot(path=codex_shot, full_page=False)
                report["screenshots"]["legacy_codex_after_activation_mobile"] = codex_shot

            pixi_shot = os.path.join(
                tempfile.gettempdir(),
                f"nexus-growth-g1-normal-pixi-{name}-{viewport['width']}x{viewport['height']}.png",
            )
            pixi_page.screenshot(path=pixi_shot, full_page=True)
            report["screenshots"][f"normal_pixi_{name}"] = pixi_shot
            pixi_context.close()

        check("no_console_errors", report["console_errors"] == [], report["console_errors"])
        context.close()
        browser.close()

    failures = [item for item in report["checks"] if not item["ok"]]
    report["summary"] = {
        "total": len(report["checks"]),
        "passed": len(report["checks"]) - len(failures),
        "failed": len(failures),
        "ok": not failures,
    }
    return report


if __name__ == "__main__":
    result = run()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["summary"]["ok"] else 1)
