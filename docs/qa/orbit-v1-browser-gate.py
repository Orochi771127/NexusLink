"""Headless Chromium gate for the Moonlake Orbit V1/V2/V3 no-save slice.

Run through webapp-testing's server helper, for example:
  python .../with_server.py --server "python -m http.server 4173" --port 4173 -- \
    python docs/qa/orbit-v1-browser-gate.py
"""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError, sync_playwright


BASE_URL = os.environ.get("NEXUS_ORBIT_QA_URL", "http://127.0.0.1:4173")
SLICE_URL = f"{BASE_URL}/?orbitCampSlice=1"
STORAGE_KEY = "nexusLinkR2State:v1"
PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js"


def install_completed_onboarding_seed(context) -> None:
    context.add_init_script(
        script=f"""(() => {{
          if (!['http:', 'https:'].includes(location.protocol)) return;
          const key = {json.dumps(STORAGE_KEY)};
          if (localStorage.getItem(key)) return;
          const now = Date.now();
          localStorage.setItem(key, JSON.stringify({{
            playerProfile: {{
              displayName: 'Orbit V3 QA',
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
            activeCompanionId: 'thunder-pup',
            unlockedCompanionIds: ['thunder-pup'],
            energy: 10,
            trust: 30,
            bond: 20,
            mood: 'calm',
            defense: 35,
            touchFatigue: 0,
            safeHarborMode: false,
            habitatTraces: [{{
              id: 'htrace_orbit_v1_qa',
              memoryId: 'emem_orbit_v1_qa',
              type: 'em_fresh_warm',
              createdAt: now,
              lastSeenAt: now
            }}],
            explorationProgress: {{
              totalExplorations: 0,
              lastNodeId: null,
              visitCounts: {{}}
            }}
          }}));
        }})()"""
    )


def click_dom(page: Page, selector: str) -> None:
    locator = page.locator(selector).first
    locator.wait_for(state="attached")
    locator.evaluate("element => element.click()")


def wait_ready(page: Page) -> None:
    try:
        page.wait_for_function(
            "document.documentElement.dataset.nexusControllersReady === 'true'",
            timeout=15_000,
        )
    except PlaywrightTimeoutError:
        print(
            json.dumps(
                page.evaluate(
                    """
                    () => ({
                      url: location.href,
                      readyState: document.readyState,
                      controllersReady: document.documentElement.dataset.nexusControllersReady,
                      pixiFailed: window.__NEXUS_PIXI_LOAD_FAILED__,
                      appScripts: [...document.scripts].map((script) => ({
                        src: script.src, type: script.type
                      }))
                    })
                    """
                ),
                ensure_ascii=False,
                indent=2,
            )
        )
        raise


def navigate(page: Page, *, reload: bool = False) -> None:
    if reload:
        page.reload(wait_until="commit", timeout=30_000)
    else:
        page.goto(SLICE_URL, wait_until="commit", timeout=30_000)
    try:
        page.wait_for_load_state("networkidle", timeout=5_000)
    except PlaywrightTimeoutError:
        # The habitat can keep CDN/media requests alive. Controller readiness is
        # the repo's stable interactive signal after the network-idle attempt.
        pass
    wait_ready(page)


def open_slice(page: Page) -> None:
    click_dom(page, ".bottom-nav [data-action='explore']")
    # The V1 slice is intentionally query-opt-in and is not in the formal
    # Moonlake stage list. Route through pageRouter's existing open-orbit action
    # without exposing a persistent QA hook in production code.
    page.evaluate(
        """
        () => {
          const host = document.querySelector('[data-page="explore"]');
          const button = document.createElement('button');
          button.type = 'button';
          button.dataset.pageAction = 'open-orbit';
          button.dataset.orbitV1QaOpen = 'true';
          host.appendChild(button);
          button.click();
        }
        """
    )
    try:
        page.locator(".orbit-battle:not([hidden])").wait_for(
            state="visible", timeout=8_000
        )
    except PlaywrightTimeoutError:
        print(
            json.dumps(
                page.evaluate(
                    """
                    () => ({
                      bodyClass: document.body.className,
                      status: document.querySelector('#status-text')?.textContent,
                      overlayCount: document.querySelectorAll('.orbit-overlay').length,
                      battleHidden: document.querySelector('.orbit-battle')?.hidden,
                      activePage: document.querySelector('[data-page]:not([hidden])')?.dataset.page,
                      nodeActions: [...document.querySelectorAll('[data-node-mode]')].map(
                        (button) => ({
                          id: button.dataset.nodeMode,
                          disabled: button.disabled,
                          busy: button.getAttribute('aria-busy')
                        })
                      )
                    })
                    """
                ),
                ensure_ascii=False,
                indent=2,
            )
        )
        raise


def persistent_slice(page: Page) -> dict:
    return page.evaluate(
        """
        (key) => {
          const state = JSON.parse(localStorage.getItem(key) || '{}');
          return {
            activeCompanionId: state.activeCompanionId,
            companionStates: state.companionStates,
            bond: state.bond,
            trust: state.trust,
            mood: state.mood,
            energy: state.energy,
            defense: state.defense,
            touchFatigue: state.touchFatigue,
            spamScore: state.spamScore,
            safeHarborMode: state.safeHarborMode,
            relationshipByCompanionId: state.relationshipByCompanionId,
            explorationProgress: state.explorationProgress,
            expeditionVault: state.expeditionVault,
            companionGrowth: state.companionGrowth,
            orbitPathProgress: state.orbitPathProgress,
            battleRecord: state.battleRecord,
            emotionalMemories: state.emotionalMemories,
            habitatTraces: state.habitatTraces,
            chatHistory: state.chatHistory
          };
        }
        """,
        STORAGE_KEY,
    )


def assert_mobile_geometry(page: Page) -> dict:
    geometry = page.evaluate(
        """
        () => {
          const rect = (selector) => {
            const box = document.querySelector(selector)?.getBoundingClientRect();
            return box ? {
              x: box.x, y: box.y, top: box.top, right: box.right,
              bottom: box.bottom, width: box.width, height: box.height
            } : null;
          };
          return {
            viewport: { width: innerWidth, height: innerHeight },
            overlay: rect('.orbit-overlay'),
            top: rect('.orbit-battle .orbit-hud-top'),
            canvas: rect('.orbit-canvas'),
            bottom: rect('.orbit-battle .orbit-hud-bottom'),
            control: rect('.orbit-control-depth'),
            confirm: rect('[data-orbit-action="confirm-attunement"]'),
            rest: rect('[data-orbit-action="rest-attunement"]'),
            core: rect('[data-orbit-embodiment="core"]'),
            formal: rect('[data-orbit-embodiment="formal_stage"]'),
            stance: rect('[data-orbit-stance="upright"]'),
            pulse: rect('[data-orbit-action="pulse"]'),
            bodyScrollWidth: document.body.scrollWidth,
            documentScrollWidth: document.documentElement.scrollWidth
          };
        }
        """
    )
    viewport = geometry["viewport"]
    canvas = geometry["canvas"]
    top = geometry["top"]
    bottom = geometry["bottom"]
    assert canvas and top and bottom
    assert canvas["x"] >= -0.5
    assert canvas["right"] <= viewport["width"] + 0.5
    geometry_debug = json.dumps(geometry, ensure_ascii=False)
    assert canvas["top"] >= top["bottom"] - 0.5, geometry_debug
    assert canvas["bottom"] <= bottom["top"] + 0.5, geometry_debug
    assert bottom["bottom"] <= viewport["height"] + 0.5
    assert geometry["bodyScrollWidth"] <= viewport["width"]
    assert geometry["documentScrollWidth"] <= viewport["width"]
    for control_name in ["confirm", "rest", "core", "formal", "stance", "pulse"]:
        assert geometry[control_name]["height"] >= 44, geometry_debug
    return geometry


def run_normal_flow(page: Page, request_urls: list[str]) -> dict:
    navigate(page)
    before = persistent_slice(page)
    open_slice(page)

    page.locator(
        '.orbit-manifestation-picker[data-asset-ready="true"]'
    ).wait_for(state="visible", timeout=15_000)
    battle = page.locator(".orbit-battle")
    assert battle.get_attribute("data-core-entry-status") == "willing"
    assert battle.get_attribute("data-core-entry-source").startswith(
        "raphael_core_"
    )
    assert battle.get_attribute("data-core-simulation-authority") == "orbitEngine"
    assert page.locator(".orbit-battle .orbit-companion-line").get_attribute(
        "data-core-source"
    ).startswith("raphael_core_")

    page.locator(".orbit-title").wait_for(state="visible")
    assert "心核迴旋" in page.locator(".orbit-title").inner_text()
    assert "Energy" in page.locator(".orbit-battle .orbit-stats").inner_text()
    assert "界紋蓄能 1/1" in page.locator(
        ".orbit-battle .orbit-stats"
    ).inner_text()
    assert page.locator("[data-orbit-stance]").count() == 3
    assert page.locator("[data-orbit-embodiment]").count() == 2
    manifestation = page.locator(".orbit-manifestation-picker")
    assert manifestation.get_attribute("data-formal-stage") == "initial_awakened"
    assert int(manifestation.get_attribute("data-source-decoded-bytes")) <= 8_388_608
    assert int(manifestation.get_attribute("data-mip-decoded-bytes")) <= 524_288
    summary = page.locator(".orbit-manifestation-summary").inner_text()
    assert "雷霆幼狼" in summary
    assert "illustrated form 已就緒" in summary
    thunder_resources = [url for url in request_urls if "thunder-pup" in url]
    assert any(
        "thunder-pup/metadata/orbit-manifestations.json" in url
        for url in request_urls
    ), json.dumps(thunder_resources, ensure_ascii=False, indent=2)
    assert any("thunder-pup_idle_calm" in url for url in request_urls), json.dumps(
        thunder_resources, ensure_ascii=False, indent=2
    )
    assert not any("lightning-wolf-8pose" in url for url in request_urls)
    geometry = assert_mobile_geometry(page)

    click_dom(page, '[data-orbit-embodiment="core"]')
    assert "心相提案・維持核心" in page.locator(
        ".orbit-battle .orbit-status"
    ).inner_text()
    assert page.locator('[data-orbit-embodiment="core"]').get_attribute(
        "aria-pressed"
    ) == "true"
    click_dom(page, '[data-orbit-embodiment="formal_stage"]')
    assert page.locator('[data-orbit-embodiment="formal_stage"]').get_attribute(
        "aria-pressed"
    ) == "true"

    click_dom(page, '[data-orbit-stance="tilted"]')
    assert "可見改軌提案" in page.locator(
        ".orbit-battle .orbit-status"
    ).inner_text()
    assert page.locator('[data-orbit-stance="tilted"]').get_attribute(
        "aria-pressed"
    ) == "true"
    click_dom(page, '[data-orbit-stance="upright"]')
    click_dom(page, '[data-orbit-action="confirm-attunement"]')
    assert "合息定軌完成" in page.locator(
        ".orbit-battle .orbit-status"
    ).inner_text()
    assert page.locator('[data-orbit-stance="upright"]').is_disabled()
    assert page.locator('[data-orbit-embodiment="core"]').is_disabled()
    assert page.locator('[data-orbit-embodiment="formal_stage"]').is_disabled()

    canvas = page.locator(".orbit-canvas")
    box = canvas.bounding_box()
    assert box
    scale = min(box["width"], box["height"]) * 0.46
    start_x = box["x"] + box["width"] / 2
    start_y = box["y"] + box["height"] / 2 + 0.66 * scale
    page.mouse.move(start_x, start_y)
    page.mouse.down()
    page.mouse.move(start_x - 0.42 * scale, start_y, steps=6)
    page.mouse.up()
    page.locator('[data-orbit-action="pulse"]:not([disabled])').wait_for(
        state="visible"
    )
    assert "界紋" in page.locator(".orbit-battle .orbit-status").inner_text()
    page.wait_for_function(
        "document.querySelector('.orbit-battle .orbit-status')?.textContent.includes('界紋疾走')",
        timeout=5000,
    )
    click_dom(page, '[data-orbit-action="pulse"]')
    assert "可見改軌已用" in page.locator(
        ".orbit-battle .orbit-status"
    ).inner_text()

    click_dom(page, '[data-orbit-action="retreat"]')
    page.locator('[data-orbit-action="to-map"]:not([hidden])').wait_for(
        state="visible"
    )
    page.wait_for_function(
        """
        () => {
          const status = document.querySelector('.orbit-battle')
            ?.dataset.coreSettlementStatus;
          return status && status !== 'pending';
        }
        """,
        timeout=5_000,
    )
    assert "先撤退" in page.locator(".orbit-battle .orbit-status").inner_text()
    assert battle.get_attribute("data-core-settlement-status") == "reflected"
    assert battle.get_attribute("data-core-settlement-source").startswith(
        "raphael_core_"
    )
    assert battle.get_attribute("data-core-simulation-authority") == "orbitEngine"
    assert "軌道" in page.locator(
        ".orbit-battle .orbit-companion-line"
    ).inner_text()

    page.wait_for_timeout(250)
    after = persistent_slice(page)
    assert after == before, "V1/V2/V3 slice must not mutate persistent gameplay state"

    screenshot_path = Path(tempfile.gettempdir()) / "nexuslink-orbit-v3-390x844.png"
    page.screenshot(path=str(screenshot_path), full_page=False)
    return {
        "geometry": geometry,
        "screenshot": str(screenshot_path),
        "persistent_unchanged": True,
    }


def run_rest_flow(page: Page) -> None:
    navigate(page)
    before = persistent_slice(page)
    open_slice(page)
    page.locator('[data-orbit-action="rest-attunement"]:not([disabled])').wait_for(
        state="visible", timeout=15_000
    )
    click_dom(page, '[data-orbit-action="rest-attunement"]')
    page.locator('[data-orbit-action="to-map"]:not([hidden])').wait_for(
        state="visible"
    )
    page.wait_for_function(
        "document.querySelector('.orbit-battle')?.dataset.coreSettlementStatus === 'reflected'",
        timeout=5_000,
    )
    assert "先回來" in page.locator(
        ".orbit-battle .orbit-companion-line"
    ).inner_text()
    assert "未寫入路徑、微光、Growth 或存檔" in page.locator(
        ".orbit-battle .orbit-status"
    ).inner_text()
    assert persistent_slice(page) == before


def run_high_risk_flow(page: Page) -> None:
    navigate(page)
    page.evaluate(
        """
        (key) => {
          const state = JSON.parse(localStorage.getItem(key) || '{}');
          state.safeHarborMode = true;
          localStorage.setItem(key, JSON.stringify(state));
        }
        """,
        STORAGE_KEY,
    )
    navigate(page, reload=True)
    before = persistent_slice(page)
    open_slice(page)
    battle = page.locator(".orbit-battle")
    assert battle.get_attribute("data-core-entry-status") == "blocked_safety"
    assert battle.get_attribute("data-core-entry-source") == "deterministic_safety_gate"
    assert battle.get_attribute("data-core-simulation-authority") == "orbitEngine"
    assert "保留邊界" in page.locator(
        ".orbit-battle .orbit-status"
    ).inner_text()
    assert page.locator(".orbit-control-depth").is_hidden()
    assert page.locator('[data-orbit-action="again"]:not([hidden])').is_visible()
    assert persistent_slice(page) == before


def run_compact_accessibility_flow(page: Page) -> dict:
    navigate(page)
    page.evaluate(
        """
        () => {
          document.documentElement.style.fontSize = '125%';
        }
        """
    )
    before = persistent_slice(page)
    open_slice(page)
    page.locator('[data-orbit-embodiment="formal_stage"]').wait_for(
        state="visible", timeout=15_000
    )
    geometry = assert_mobile_geometry(page)
    page.locator('[data-orbit-embodiment="core"]').tap()
    page.locator('[data-orbit-embodiment="formal_stage"]').tap()
    page.locator('[data-orbit-stance="tilted"]').tap()
    assert "可見改軌提案" in page.locator(
        ".orbit-battle .orbit-status"
    ).inner_text()
    confirm = page.locator('[data-orbit-action="confirm-attunement"]')
    confirm.focus()
    page.keyboard.press("Enter")
    assert "合息定軌完成" in page.locator(
        ".orbit-battle .orbit-status"
    ).inner_text()
    assert persistent_slice(page) == before
    return geometry


def run_desktop_geometry(page: Page) -> dict:
    navigate(page)
    open_slice(page)
    page.locator('[data-orbit-embodiment="formal_stage"]').wait_for(
        state="visible", timeout=15_000
    )
    return assert_mobile_geometry(page)


def main() -> None:
    console_errors: list[str] = []
    request_urls: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 390, "height": 844})
        install_completed_onboarding_seed(context)
        context.route(
            PIXI_CDN_URL,
            lambda route: route.abort("failed"),
        )
        page = context.new_page()
        page.on("request", lambda request: request_urls.append(request.url))
        page.on("pageerror", lambda error: print(f"PAGEERROR {error}"))
        page.on(
            "requestfailed",
            lambda request: print(
                f"REQUESTFAILED {request.url} {request.failure}"
            ),
        )
        page.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        normal = run_normal_flow(page, request_urls)
        run_rest_flow(page)
        run_high_risk_flow(page)
        context.close()

        compact = browser.new_context(
            viewport={"width": 390, "height": 664},
            reduced_motion="reduce",
            has_touch=True,
        )
        install_completed_onboarding_seed(compact)
        compact.route(
            PIXI_CDN_URL,
            lambda route: route.abort("failed"),
        )
        compact_page = compact.new_page()
        compact_page.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        compact_geometry = run_compact_accessibility_flow(compact_page)
        assert compact_page.evaluate(
            "matchMedia('(prefers-reduced-motion: reduce)').matches"
        )
        compact.close()

        desktop = browser.new_context(viewport={"width": 1280, "height": 800})
        install_completed_onboarding_seed(desktop)
        desktop.route(PIXI_CDN_URL, lambda route: route.abort("failed"))
        desktop_page = desktop.new_page()
        desktop_page.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            else None,
        )
        desktop_geometry = run_desktop_geometry(desktop_page)
        desktop.close()
        browser.close()

    unexpected_errors = [
        error
        for error in console_errors
        if "favicon" not in error.lower()
        and "ERR_ABORTED" not in error
        and "ERR_FAILED" not in error
    ]
    assert not unexpected_errors, f"Unexpected console errors: {unexpected_errors}"
    print(
        json.dumps(
            {
                "ok": True,
                "viewport": "390x844",
                "normal": normal,
                "compact_touch_keyboard_reduced_geometry": compact_geometry,
                "desktop_geometry": desktop_geometry,
                "console_errors": unexpected_errors,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
