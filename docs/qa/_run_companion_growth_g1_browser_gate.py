import json
import os
import sys
import tempfile

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("NEXUS_QA_BASE", os.environ.get("NEXUS_BASE_URL", "http://127.0.0.1:5197"))
STORAGE_KEY = "nexusLinkR2State:v1"
PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js"

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

        def run_outcome(name, fixture, practice_id, expected_outcome):
            set_fixture(page, fixture)
            wait_ready(page, reload=True)
            open_growth(page)
            before = snapshot(page)
            page.evaluate("window.__growthStorageWrites = []")
            page.locator(f'[data-growth-practice="{practice_id}"]').click()
            result = page.locator(f'[data-growth-result][data-outcome="{expected_outcome}"]')
            result.wait_for(state="visible", timeout=5000)
            after = snapshot(page)
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
                page.evaluate("document.activeElement?.dataset?.growthPractice") == practice_id,
            )
            check(f"{name}_result_not_duplicate_live_region", result.get_attribute("aria-live") is None)
            check(
                f"{name}_global_live_region",
                page.locator("#status-text").get_attribute("aria-live") == "polite"
                and bool(page.locator("#status-text").inner_text().strip()),
            )
            check(f"{name}_store_unchanged", after["state"] == before["state"])
            check(f"{name}_main_save_unchanged", after["raw"] == before["raw"])
            check(f"{name}_storage_keys_unchanged", after["keys"] == before["keys"])
            check(f"{name}_zero_storage_writes", writes == [], writes)

        run_outcome("accepted", {}, "attunement", "accept")
        accepted_shot = os.path.join(tempfile.gettempdir(), "nexus-growth-g1-accepted-390x844.png")
        page.screenshot(path=accepted_shot, full_page=True)
        report["screenshots"]["accepted_mobile"] = accepted_shot

        run_outcome("modified", {"mood": "distant"}, "attunement", "modify")
        run_outcome("declined", {"lastTouchReaction": "reject"}, "pathfinding", "decline")
        run_outcome("rested", {"energy": 1, "touchFatigue": 8}, "steadfastness", "rest")

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
