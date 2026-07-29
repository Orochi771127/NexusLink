import json
import os
import tempfile

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get(
    "NEXUS_QA_BASE",
    os.environ.get("NEXUS_BASE_URL", "http://127.0.0.1:5197"),
)
STORAGE_KEY = "nexusLinkR2State:v1"
PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js"


def install_pixi_abort_route(page):
    page.route(PIXI_CDN_URL, lambda route: route.abort("failed"))


def state_slice(page):
    return page.evaluate(
        """(key) => {
            const state = JSON.parse(localStorage.getItem(key) || '{}');
            const companionId = state.activeCompanionId || 'greyshade-cat';
            return {
              bond: state.bond,
              trust: state.trust,
              energy: state.energy,
              defense: state.defense,
              mood: state.mood,
              touchFatigue: state.touchFatigue,
              progress: state.explorationProgress,
              activityProgress: state.activityProgress,
              memoryCount: Array.isArray(state.emotionalMemories)
                ? state.emotionalMemories.length
                : 0,
              traceCount: Array.isArray(state.habitatTraces)
                ? state.habitatTraces.length
                : 0,
              growth: state.companionStates?.byId?.[companionId]?.growth || null
            };
        }""",
        STORAGE_KEY,
    )


def wait_for_exploration_total(page, expected, timeout=10000):
    page.wait_for_function(
        """([key, target]) => {
          try {
            const state = JSON.parse(localStorage.getItem(key) || '{}');
            return state?.explorationProgress?.totalExplorations === target;
          } catch (_) {
            return false;
          }
        }""",
        arg=[STORAGE_KEY, expected],
        timeout=timeout,
    )


def install_fresh_completed_onboarding_seed(context):
    context.add_init_script(
        script=f"""(() => {{
          if (!['http:', 'https:'].includes(location.protocol)) return;
          const now = Date.now();
          const legacyVeteran = new URLSearchParams(location.search)
            .has('legacy-veteran');
          localStorage.setItem({json.dumps(STORAGE_KEY)}, JSON.stringify({{
            playerProfile: {{
              displayName: 'Map QA',
              identitySkipped: false,
              createdAt: now,
              updatedAt: now
            }},
            onboarding: {{
              status: 'completed',
              completed: true,
              completedAt: now,
              identityCompleted: true,
              guidanceCompleted: true,
              greyshadeMetAt: now,
              veteranAutoCompleted: false,
              firstLoop: {{ completedAt: now }}
            }},
            firstTouchCompleted: true,
            firstHugCompleted: true,
            energy: 10,
            mood: 'calm',
            defense: 35,
            touchFatigue: 0,
            lastTouchReaction: '',
            habitatTraces: [{{
              id: 'htrace_map_qa_1',
              memoryId: 'emem_map_qa_1',
              type: 'em_fresh_warm',
              createdAt: now,
              lastSeenAt: now
            }}],
            explorationProgress: {{
              totalExplorations: 0,
              lastNodeId: legacyVeteran ? 'starwood_trail' : null,
              visitCounts: legacyVeteran ? {{ starwood_trail: 2 }} : {{}}
            }}
          }}));
        }})()"""
    )


def open_map(page):
    explore_page = page.locator('[data-page="explore"]')
    if not explore_page.is_visible():
        page.locator('[data-action="explore"]').click(force=True)
        page.wait_for_selector(
            '[data-page="explore"]:not([hidden])',
            timeout=10000,
        )
    page.locator('[data-page-action="open-map"]').click()
    page.wait_for_selector('[data-panel="map"]:not([hidden])', timeout=10000)


def navigate_ready(page, url=None):
    url = url or BASE_URL
    page.goto(url, wait_until="commit", timeout=30000)
    page.wait_for_selector(
        '[data-action="explore"]',
        state="visible",
        timeout=30000,
    )
    page.wait_for_function(
        """() => document.readyState !== 'loading'
          && document.querySelector('#map-canvas')
          && document.querySelector('#page-layer')""",
        timeout=30000,
    )
    page.wait_for_selector("#pixi-load-failure:visible", timeout=10000)
    page.wait_for_function(
        "() => document.documentElement.dataset.nexusControllersReady === 'true'",
        timeout=30000,
    )
    return "expected-pixi-fallback"


def run():
    report = {"checks": [], "console_errors": [], "screenshots": {}}

    def check(name, ok, detail=None):
        report["checks"].append(
            {"name": name, "ok": bool(ok), "detail": detail}
        )

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=1,
        )
        install_fresh_completed_onboarding_seed(context)

        def create_test_page():
            next_page = context.new_page()

            def capture_console_error(message):
                if message.type != "error":
                    return
                location = message.location or {}
                url = location.get("url", "")
                if url == PIXI_CDN_URL and "ERR_FAILED" in message.text:
                    return
                report["console_errors"].append(message.text)

            next_page.on("console", capture_console_error)
            next_page.on(
                "pageerror",
                lambda error: report["console_errors"].append(str(error)),
            )
            install_pixi_abort_route(next_page)
            return next_page

        page = create_test_page()
        report["readiness"] = navigate_ready(page)
        page.wait_for_timeout(900)
        try:
            open_map(page)
        except PlaywrightTimeoutError:
            diagnostic = page.evaluate(
                """() => ({
                  readyState: document.readyState,
                  activePage:
                    document.querySelector('#page-layer')?.dataset.activePage
                    || null,
                  onboardingHidden:
                    document.querySelector('#onboarding-root')?.hidden ?? null,
                  exploreButtons:
                    document.querySelectorAll('[data-action="explore"]').length,
                  status:
                    document.querySelector('#status-text')?.textContent || null
                })"""
            )
            print(
                json.dumps(
                    {
                        "map_open_diagnostic": diagnostic,
                        "console_errors": report["console_errors"],
                    },
                    ensure_ascii=False,
                )
            )
            raise

        visible_nodes = page.locator(".map-node:visible")
        camp = page.locator(".map-node", has_text="月湖營地")
        locked = page.locator(".map-node:visible:disabled")
        check(
            "fresh_nodes_visible",
            visible_nodes.count() >= 6,
            {"count": visible_nodes.count()},
        )
        check(
            "only_camp_interactive",
            locked.count() == visible_nodes.count() - 1,
        )
        check("camp_enabled", camp.count() == 1 and camp.is_enabled())
        check(
            "camp_highlighted",
            "is-first-safe" in (camp.get_attribute("class") or ""),
        )
        check(
            "locked_nodes_aria_disabled",
            all(
                value == "true"
                for value in locked.evaluate_all(
                    "els => els.map(el => el.getAttribute('aria-disabled'))"
                )
            ),
        )
        check(
            "first_route_guide_visible",
            page.locator("#map-first-route-guide:visible").count() == 1,
        )

        fresh_shot = os.path.join(
            tempfile.gettempdir(),
            "nexus-map-first-route-390x844.png",
        )
        page.screenshot(path=fresh_shot, full_page=True)
        report["screenshots"]["fresh"] = fresh_shot

        camp.click()
        wait_for_exploration_total(page, 1)
        after_camp = state_slice(page)
        check(
            "camp_settles_first_exploration",
            after_camp["progress"]["totalExplorations"] == 1,
        )
        check(
            "camp_rest_creates_no_growth_evidence",
            after_camp["growth"] is not None
            and after_camp["growth"]["evidence"] == []
            and after_camp["growth"]["coverage"]["rootsBySourceType"][
                "exploration"
            ]
            == [],
            after_camp["growth"],
        )
        check(
            "routes_unlock_after_camp",
            page.locator(".map-node:visible:disabled").count() == 0,
        )
        check(
            "first_route_guide_hides",
            page.locator("#map-first-route-guide:visible").count() == 0,
        )

        before_zone = state_slice(page)
        page.locator(".map-node", has_text="星林步道").click()
        page.wait_for_selector(
            ".moonlake-orbit-zone-sheet:visible",
            timeout=5000,
        )
        zone_sheet = page.locator(".moonlake-orbit-zone-sheet")
        stage_buttons = zone_sheet.locator("[data-moonlake-orbit-stage]")
        check("starwood_has_five_orbit_stages", stage_buttons.count() == 5)
        check(
            "starwood_only_first_stage_enabled",
            stage_buttons.nth(0).is_enabled()
            and all(
                stage_buttons.nth(index).is_disabled()
                for index in range(1, 5)
            ),
        )
        page.wait_for_timeout(350)
        toast_state = page.locator("#map-result").evaluate(
            """el => ({
              hidden: el.hidden,
              visibleClass: el.classList.contains('is-visible'),
              opacity: getComputedStyle(el).opacity
            })"""
        )
        check(
            "zone_sheet_hides_previous_result_toast",
            toast_state["visibleClass"] is False
            and float(toast_state["opacity"]) == 0,
            toast_state,
        )
        page.wait_for_function(
            "() => document.activeElement?.hasAttribute('data-orbit-zone-close')",
            timeout=5000,
        )
        check(
            "zone_back_receives_focus",
            page.evaluate(
                "() => document.activeElement?.hasAttribute("
                "'data-orbit-zone-close')"
            )
            is True,
        )
        check(
            "zone_sheet_no_horizontal_overflow",
            zone_sheet.evaluate(
                "el => el.scrollWidth <= el.clientWidth + 1"
            ),
            zone_sheet.evaluate(
                """el => ({
                  scrollWidth: el.scrollWidth,
                  clientWidth: el.clientWidth
                })"""
            ),
        )
        zone_box = zone_sheet.bounding_box()
        stage_list_metrics = zone_sheet.locator(
            ".moonlake-orbit-stage-list"
        ).evaluate(
            """el => ({
              clientHeight: el.clientHeight,
              scrollHeight: el.scrollHeight
            })"""
        )
        check(
            "zone_sheet_inside_viewport",
            bool(zone_box)
            and zone_box["x"] >= 0
            and zone_box["x"] + zone_box["width"] <= 390
            and zone_box["y"] >= 0
            and zone_box["y"] + zone_box["height"] <= 844,
            zone_box,
        )
        check(
            "zone_stage_list_scrolls_on_mobile",
            stage_list_metrics["scrollHeight"]
            > stage_list_metrics["clientHeight"],
            stage_list_metrics,
        )
        check("opening_zone_is_zero_write", state_slice(page) == before_zone)

        zone_shot = os.path.join(
            tempfile.gettempdir(),
            "nexus-moonlake-orbit-zone-390x844.png",
        )
        page.screenshot(path=zone_shot, full_page=True)
        report["screenshots"]["orbit_zone"] = zone_shot

        stage_buttons.nth(0).click()
        page.wait_for_selector(".orbit-battle:visible", timeout=5000)
        check(
            "stage_one_opens_orbit_gameplay",
            "林口初旋"
            in page.locator("#orbit-battle-title").inner_text()
            and page.locator(".orbit-battle canvas:visible").count() == 1,
        )
        page.locator(
            '.orbit-battle [data-orbit-action="retreat"]'
        ).click()
        page.wait_for_selector(
            '.orbit-battle [data-orbit-action="to-map"]:visible',
            timeout=5000,
        )
        check("orbit_retreat_is_zero_write", state_slice(page) == before_zone)
        check(
            "orbit_retreat_affirms_exit",
            "先撤退"
            in page.locator(".orbit-battle .orbit-status").inner_text(),
        )
        page.locator(
            '.orbit-battle [data-orbit-action="to-map"]'
        ).click()
        page.wait_for_selector(
            ".moonlake-orbit-zone-sheet:visible",
            timeout=5000,
        )
        check(
            "orbit_returns_to_source_zone",
            "星林步道"
            in page.locator("#moonlake-orbit-zone-title").inner_text(),
        )

        page.locator("[data-orbit-zone-close]").click()
        page.locator(".map-node", has_text="湖心倒影").click()
        page.wait_for_selector(
            ".moonlake-orbit-zone-sheet:visible",
            timeout=5000,
        )
        locked_stages = page.locator(
            ".moonlake-orbit-zone-sheet [data-moonlake-orbit-stage]"
        )
        check(
            "locked_zone_is_preview_only",
            locked_stages.count() == 5
            and all(
                locked_stages.nth(index).is_disabled()
                for index in range(5)
            ),
        )
        check(
            "locked_zone_preview_is_zero_write",
            state_slice(page) == before_zone,
        )
        page.locator("[data-orbit-zone-close]").click()
        page.locator('[data-panel="map"] [data-panel-close]').click()
        page.wait_for_function(
            "() => document.querySelector('.panel-layer')"
            "?.dataset.activePanel === 'none'",
            timeout=5000,
        )

        before_standoff = state_slice(page)
        page.locator('[data-page-action="open-node-actions"]').click()
        page.wait_for_selector("[data-node-action-sheet]", timeout=5000)
        standoff_entry = page.locator('[data-node-mode="standoff"]')
        check(
            "standoff_entry_available_separately",
            standoff_entry.is_enabled(),
        )
        standoff_entry.click()
        page.wait_for_selector(
            '[data-panel="battle"]:not([hidden])',
            timeout=5000,
        )
        page.locator("#standoff-act-retreat").click()
        page.wait_for_selector("#battle-finish:visible", timeout=5000)
        after_standoff_retreat = state_slice(page)
        check(
            "standoff_retreat_grants_no_first_clear_reward",
            after_standoff_retreat["bond"] == before_standoff["bond"]
            and after_standoff_retreat["trust"] == before_standoff["trust"]
            and after_standoff_retreat["memoryCount"]
            == before_standoff["memoryCount"]
            and len(after_standoff_retreat["growth"]["evidence"])
            == len(before_standoff["growth"]["evidence"])
            and after_standoff_retreat["activityProgress"]["standoff"][
                "clearedScenarioIds"
            ]
            == [],
        )
        page.locator("#battle-finish").click()
        page.wait_for_function(
            "() => document.querySelector('.panel-layer')"
            "?.dataset.activePanel === 'none'",
            timeout=5000,
        )

        before_expedition = state_slice(page)
        page.locator('[data-page-action="open-node-actions"]').click()
        page.wait_for_selector("[data-node-action-sheet]", timeout=5000)
        expedition_entry = page.locator('[data-node-mode="expedition"]')
        check(
            "expedition_entry_remains_separate_and_chapter_gated",
            expedition_entry.count() == 1
            and expedition_entry.is_disabled()
            and expedition_entry.get_attribute("aria-disabled") == "true",
        )
        check(
            "opening_mode_sheet_is_zero_write",
            state_slice(page) == before_expedition,
        )
        page.locator(
            '[data-page-action="close-node-actions"]'
        ).click()

        page.emulate_media(reduced_motion="reduce")
        open_map(page)
        page.locator(".map-node", has_text="星林步道").click()
        page.wait_for_selector(
            ".moonlake-orbit-zone-sheet:visible",
            timeout=5000,
        )
        map_path_animation = page.locator(".map-path").first.evaluate(
            "el => getComputedStyle(el).animationName"
        )
        check(
            "reduced_motion_disables_map_path_animation",
            map_path_animation == "none",
            map_path_animation,
        )

        veteran_page = create_test_page()
        navigate_ready(veteran_page, f"{BASE_URL}?legacy-veteran=1")
        veteran_page.wait_for_timeout(300)
        open_map(veteran_page)
        veteran_nodes = veteran_page.locator(".map-node:visible")
        check(
            "legacy_veteran_visit_counts_unlock_routes",
            veteran_nodes.count() > 1
            and all(
                not veteran_nodes.nth(index).is_disabled()
                for index in range(veteran_nodes.count())
            ),
        )
        check(
            "legacy_veteran_guide_hidden",
            veteran_page.locator(
                "#map-first-route-guide:visible"
            ).count()
            == 0,
        )
        veteran_page.close()

        check(
            "no_console_errors",
            not report["console_errors"],
            report["console_errors"],
        )
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
