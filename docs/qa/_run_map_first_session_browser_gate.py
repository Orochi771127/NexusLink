import json
import os
import tempfile

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("NEXUS_QA_BASE", os.environ.get("NEXUS_BASE_URL", "http://127.0.0.1:5197"))
STORAGE_KEY = "nexusLinkR2State:v1"
PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js"


def install_pixi_abort_route(page):
    page.route(
        PIXI_CDN_URL,
        lambda route: route.abort("failed"),
    )


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
              memoryCount: Array.isArray(state.emotionalMemories) ? state.emotionalMemories.length : 0,
              traceCount: Array.isArray(state.habitatTraces) ? state.habitatTraces.length : 0,
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
          const legacyVeteran = new URLSearchParams(location.search).has('legacy-veteran');
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
        page.wait_for_selector('[data-page="explore"]:not([hidden])', timeout=10000)
    page.locator('[data-page-action="open-map"]').click()
    page.wait_for_selector('[data-panel="map"]:not([hidden])', timeout=10000)


def navigate_ready(page, url=None):
    url = url or BASE_URL
    page.goto(url, wait_until="commit", timeout=30000)
    page.wait_for_selector('[data-action="explore"]', state="visible", timeout=30000)
    page.wait_for_function(
        """() => document.readyState !== 'loading'
          && document.querySelector('#map-canvas')
          && document.querySelector('#page-layer')""",
        timeout=30000,
    )
    page.wait_for_selector('#pixi-load-failure:visible', timeout=10000)
    page.wait_for_function(
        "() => document.documentElement.dataset.nexusControllersReady === 'true'",
        timeout=30000,
    )
    return "expected-pixi-fallback"


def run():
    report = {"checks": [], "console_errors": [], "screenshots": {}}

    def check(name, ok, detail=None):
        report["checks"].append({"name": name, "ok": bool(ok), "detail": detail})

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1)
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
            next_page.on("pageerror", lambda error: report["console_errors"].append(str(error)))
            # The production app binds its DOM controllers before checking Pixi.
            # Abort only the CDN request so this gate exercises the accessible
            # fallback and map behavior without waiting for rendering assets.
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
                  activePage: document.querySelector('#page-layer')?.dataset.activePage || null,
                  onboardingHidden: document.querySelector('#onboarding-root')?.hidden ?? null,
                  exploreButtons: document.querySelectorAll('[data-action=\"explore\"]').length,
                  status: document.querySelector('#status-text')?.textContent || null
                })"""
            )
            print(json.dumps({
                "map_open_diagnostic": diagnostic,
                "console_errors": report["console_errors"],
            }, ensure_ascii=False))
            raise

        visible_nodes = page.locator(".map-node:visible")
        camp = page.locator(".map-node", has_text="月湖營地")
        locked = page.locator(".map-node:visible:disabled")
        check("fresh_nodes_visible", visible_nodes.count() >= 6, {"count": visible_nodes.count()})
        check("only_camp_interactive", locked.count() == visible_nodes.count() - 1)
        check("camp_enabled", camp.count() == 1 and camp.is_enabled())
        check("camp_highlighted", "is-first-safe" in (camp.get_attribute("class") or ""))
        check("locked_nodes_aria_disabled", all(value == "true" for value in locked.evaluate_all("els => els.map(el => el.getAttribute('aria-disabled'))")))
        check("first_route_guide_visible", page.locator("#map-first-route-guide:visible").count() == 1)

        fresh_shot = os.path.join(tempfile.gettempdir(), "nexus-map-first-route-390x844.png")
        page.screenshot(path=fresh_shot, full_page=True)
        report["screenshots"]["fresh"] = fresh_shot

        camp.click()
        wait_for_exploration_total(page, 1)
        after_camp = state_slice(page)
        check("camp_settles_first_exploration", after_camp["progress"]["totalExplorations"] == 1)
        check(
            "camp_rest_creates_no_growth_evidence",
            after_camp["growth"] is not None
            and after_camp["growth"]["evidence"] == []
            and after_camp["growth"]["coverage"]["rootsBySourceType"]["exploration"] == [],
            after_camp["growth"],
        )
        check("routes_unlock_after_camp", page.locator(".map-node:visible:disabled").count() == 0)
        check("first_route_guide_hides", page.locator("#map-first-route-guide:visible").count() == 0)

        page.locator(".map-node", has_text="星林步道").click()
        page.wait_for_selector(".phase-search:visible", timeout=5000)
        phase = page.locator(".phase-search")
        choices = phase.locator("[data-phase-choice]")
        check("phase_four_choices", choices.count() == 4)
        toast_state = page.locator("#map-result").evaluate(
            "el => ({ hidden: el.hidden, visibleClass: el.classList.contains('is-visible'), opacity: getComputedStyle(el).opacity })"
        )
        check(
            "phase_hides_previous_result_toast",
            toast_state["hidden"] is True and toast_state["visibleClass"] is False,
            toast_state,
        )
        check("phase_direct_receives_focus", page.evaluate("document.activeElement?.dataset?.phaseChoice") == "direct")
        check(
            "phase_no_horizontal_overflow",
            phase.evaluate("el => el.scrollWidth <= el.clientWidth + 1"),
            phase.evaluate("el => ({scrollWidth: el.scrollWidth, clientWidth: el.clientWidth})"),
        )
        boxes = choices.evaluate_all(
            """els => els.map(el => {
              const r = el.getBoundingClientRect();
              return { id: el.dataset.phaseChoice, left: r.left, right: r.right, top: r.top, bottom: r.bottom };
            })"""
        )
        check(
            "phase_choices_inside_viewport",
            all(box["left"] >= 0 and box["right"] <= 390 and box["top"] >= 0 and box["bottom"] <= 844 for box in boxes),
            boxes,
        )
        phase_box = phase.bounding_box()
        check(
            "phase_choices_inside_phase_panel",
            bool(phase_box)
            and all(
                box["left"] >= phase_box["x"]
                and box["right"] <= phase_box["x"] + phase_box["width"]
                and box["top"] >= phase_box["y"]
                and box["bottom"] <= phase_box["y"] + phase_box["height"]
                for box in boxes
            ),
            {"phase": phase_box, "choices": boxes},
        )

        phase_shot = os.path.join(tempfile.gettempdir(), "nexus-phase-search-390x844.png")
        page.screenshot(path=phase_shot, full_page=True)
        report["screenshots"]["phase"] = phase_shot

        before_observe = state_slice(page)
        phase.locator('[data-phase-choice="anchor"]').click()
        page.wait_for_timeout(120)
        check("anchor_zero_persistent_mutation", state_slice(page) == before_observe)
        check("anchor_reading_announced", "路沒有變得更安全" in phase.locator(".phase-search-reading").inner_text())

        phase.locator('[data-phase-choice="calm_sync"]').click()
        page.wait_for_timeout(120)
        check("phase_calm_sync_session_only", state_slice(page) == before_observe)
        check("calm_sync_preserves_boundary_copy", "仍保有原本的距離與選擇" in phase.locator(".phase-search-reading").inner_text())

        phase.locator('[data-phase-choice="return"]').click()
        page.wait_for_timeout(120)
        check("return_closes_phase", page.locator(".phase-search:visible").count() == 0)
        check("return_closes_map", page.locator('[data-panel="map"]:visible').count() == 0)
        check("return_navigates_home", page.locator('#page-layer').get_attribute("data-active-page") == "home")
        check("return_zero_mutation", state_slice(page) == before_observe)

        open_map(page)
        page.locator(".map-node", has_text="星林步道").click()
        page.wait_for_selector(".phase-search:visible", timeout=5000)
        page.evaluate("Math.random = () => 0.9")
        page.locator('.phase-search [data-phase-choice="direct"]').click()
        wait_for_exploration_total(page, 2)
        after_direct = state_slice(page)
        check("direct_uses_existing_exploration", after_direct["progress"]["totalExplorations"] == 2)
        check("direct_records_starwood_visit", after_direct["progress"]["visitCounts"].get("starwood_trail") == 1)
        direct_growth_rows = [
            row for row in after_direct["growth"]["evidence"]
            if row.get("rootContextKey") == "exploration:1:starwood_trail"
        ]
        check(
            "direct_records_one_safe_starwood_growth_root",
            len(direct_growth_rows) == 1
            and direct_growth_rows[0].get("sourceType") == "exploration"
            and direct_growth_rows[0].get("growthSafetyExcluded") is False,
            direct_growth_rows,
        )

        before_rift = state_slice(page)
        page.locator(".map-node", has_text="裂隙觀測點").click()
        page.locator('[data-panel="map"] [data-panel-close]').click()
        page.wait_for_timeout(900)
        after_rift = state_slice(page)
        check("closed_map_stays_closed", page.locator('.panel-layer').get_attribute("data-active-panel") == "none")
        check("closed_map_does_not_open_battle", page.locator('[data-panel="battle"]:visible').count() == 0)
        check(
            "cancelled_encounter_keeps_settled_exploration",
            after_rift["progress"]["totalExplorations"] == before_rift["progress"]["totalExplorations"] + 1,
        )

        # Escape closes the map through panelManager and must cancel the pending timer.
        open_map(page)
        before_escape = state_slice(page)
        page.locator(".map-node", has_text="裂隙觀測點").click()
        page.keyboard.press("Escape")
        page.wait_for_timeout(900)
        after_escape = state_slice(page)
        check("escape_closes_map", page.locator('.panel-layer').get_attribute("data-active-panel") == "none")
        check("escape_does_not_open_battle", page.locator('[data-panel="battle"]:visible').count() == 0)
        check(
            "escape_keeps_settled_exploration",
            after_escape["progress"]["totalExplorations"] == before_escape["progress"]["totalExplorations"] + 1,
        )

        # Switching panels notifies the map close lifecycle before the 650 ms battle delay.
        open_map(page)
        before_panel_switch = state_slice(page)
        page.locator(".map-node", has_text="裂隙觀測點").click()
        page.evaluate("document.querySelector('[data-panel-trigger=\"soulTalk\"]')?.click()")
        page.wait_for_timeout(900)
        after_panel_switch = state_slice(page)
        active_panel_after_switch = page.locator('.panel-layer').get_attribute("data-active-panel")
        check("panel_switch_opens_soul_talk", active_panel_after_switch == "soulTalk", active_panel_after_switch)
        battle_after_panel_switch = page.locator('[data-panel="battle"]').evaluate(
            "el => ({ hidden: el.hidden, ariaHidden: el.getAttribute('aria-hidden') })"
        )
        check(
            "panel_switch_does_not_open_battle",
            active_panel_after_switch != "battle"
            and battle_after_panel_switch["hidden"] is True
            and battle_after_panel_switch["ariaHidden"] == "true",
            battle_after_panel_switch,
        )
        check(
            "panel_switch_keeps_settled_exploration",
            after_panel_switch["progress"]["totalExplorations"]
            == before_panel_switch["progress"]["totalExplorations"] + 1,
        )
        page.keyboard.press("Escape")
        page.wait_for_function(
            "() => document.querySelector('.panel-layer')?.dataset.activePanel === 'none'",
            timeout=5000,
        )

        # Switching the bottom-nav page also closes map and cancels its pending encounter.
        open_map(page)
        before_page_switch = state_slice(page)
        page.locator(".map-node", has_text="裂隙觀測點").click()
        page.evaluate("document.querySelector('[data-action=\"care\"]')?.click()")
        page.wait_for_timeout(900)
        after_page_switch = state_slice(page)
        check("page_switch_closes_map", page.locator('.panel-layer').get_attribute("data-active-panel") == "none")
        active_page_after_switch = page.locator('#page-layer').get_attribute("data-active-page")
        check("page_switch_opens_care", active_page_after_switch == "care", active_page_after_switch)
        check("page_switch_does_not_open_battle", page.locator('[data-panel="battle"]:visible').count() == 0)
        check(
            "page_switch_keeps_settled_exploration",
            after_page_switch["progress"]["totalExplorations"]
            == before_page_switch["progress"]["totalExplorations"] + 1,
        )

        # Let one real encounter complete, then retreat. The controller must
        # settle exactly one non-ranked standoff root inside the same save
        # transaction; prior cancelled encounters must not fabricate one.
        open_map(page)
        page.locator(".map-node", has_text="裂隙觀測點").click()
        page.wait_for_selector('[data-panel="battle"]:not([hidden])', timeout=5000)
        page.locator("#standoff-act-retreat").click()
        page.wait_for_selector("#battle-finish:visible", timeout=5000)
        after_retreat = state_slice(page)
        standoff_rows = [
            row for row in after_retreat["growth"]["evidence"]
            if row.get("rootContextKey") == "standoff:1:rift_observatory"
        ]
        check(
            "retreat_records_one_equal_rank_standoff_growth_root",
            len(standoff_rows) == 1
            and standoff_rows[0].get("key") == "standoff:1:rift_observatory:retreated"
            and standoff_rows[0].get("growthSafetyExcluded") is False,
            standoff_rows,
        )
        page.locator("#battle-finish").click()
        page.wait_for_function(
            "() => document.querySelector('.panel-layer')?.dataset.activePanel === 'none'",
            timeout=5000,
        )

        page.emulate_media(reduced_motion="reduce")
        open_map(page)
        page.locator(".map-node", has_text="星林步道").click()
        page.wait_for_selector(".phase-search:visible", timeout=5000)
        animation_name = page.locator(".phase-anchor-ring").evaluate("el => getComputedStyle(el).animationName")
        check("reduced_motion_disables_anchor_breath", animation_name == "none", animation_name)

        # Legacy saves may have visitCounts but no totalExplorations. They are
        # veteran progress and must never be pushed back through the K9 first route.
        veteran_page = create_test_page()
        navigate_ready(veteran_page, f"{BASE_URL}?legacy-veteran=1")
        veteran_page.wait_for_timeout(300)
        open_map(veteran_page)
        veteran_nodes = veteran_page.locator(".map-node:visible")
        check(
            "legacy_veteran_visit_counts_unlock_routes",
            veteran_nodes.count() > 1
            and all(not veteran_nodes.nth(index).is_disabled() for index in range(veteran_nodes.count())),
        )
        check("legacy_veteran_guide_hidden", veteran_page.locator("#map-first-route-guide:visible").count() == 0)
        veteran_page.close()

        check("no_console_errors", not report["console_errors"], report["console_errors"])
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
