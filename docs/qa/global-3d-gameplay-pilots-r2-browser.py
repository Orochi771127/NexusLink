"""Browser gate for promoted R2 Expedition actions and Crystalfin Orbit top."""

from __future__ import annotations

import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("NEXUS_R2_QA_URL", "http://127.0.0.1:4175")
OUTPUT = Path("output/global-3d-gameplay-pilots-r2/browser-promotion")
STORAGE_KEY = "nexusLinkR2State:v1"
OUTPUT.mkdir(parents=True, exist_ok=True)
RESULTS: list[dict] = []


def seed_script(companion_id: str) -> str:
    state = {
        "playerProfile": {
            "displayName": "R2 QA",
            "identitySkipped": False,
            "createdAt": 1_786_294_800_000,
            "updatedAt": 1_786_294_800_000,
        },
        "onboarding": {
            "status": "completed",
            "completed": True,
            "completedAt": 1_786_294_800_000,
            "identityCompleted": True,
            "guidanceCompleted": True,
            "greyshadeMetAt": 1_786_294_800_000,
            "veteranAutoCompleted": False,
            "firstLoop": {"completedAt": 1_786_294_800_000},
        },
        "firstTouchCompleted": True,
        "firstHugCompleted": True,
        "activeCompanionId": companion_id,
        "unlockedCompanionIds": [companion_id],
        "energy": 10,
        "trust": 48,
        "bond": 42,
        "mood": "calm",
        "defense": 24,
        "touchFatigue": 0,
        "safeHarborMode": False,
        "chapterProgress": {"current": 2, "completed": [1]},
        "explorationProgress": {
            "totalExplorations": 1,
            "lastNodeId": "moonlake_camp",
            "visitCounts": {"moonlake_camp": 1},
        },
        "emotionalMemories": [],
        "habitatTraces": [],
    }
    return (
        "localStorage.setItem("
        + json.dumps(STORAGE_KEY)
        + ","
        + json.dumps(json.dumps(state, ensure_ascii=False))
        + ");"
    )


def boot(page, path: str) -> None:
    page.goto(BASE_URL + path, wait_until="commit", timeout=30_000)
    page.wait_for_function(
        "document.documentElement.dataset.nexusControllersReady === 'true'",
        timeout=20_000,
    )


def open_expedition(page) -> None:
    page.locator(".bottom-nav [data-action='explore']").click()
    page.locator('[data-page="explore"] [data-page-action="open-map"]').click()
    launch = page.locator(".map-expedition-launch:not(:disabled)").first
    launch.wait_for(state="visible", timeout=12_000)
    launch.click()
    page.wait_for_function(
        "document.body.classList.contains('expedition-active')",
        timeout=12_000,
    )
    page.wait_for_timeout(7_000)


def open_orbit(page) -> None:
    page.locator(".bottom-nav [data-action='explore']").click()
    page.evaluate(
        """() => {
          const host = document.querySelector('[data-page="explore"]');
          const button = document.createElement('button');
          button.type = 'button';
          button.dataset.pageAction = 'open-orbit';
          host.appendChild(button);
          button.click();
        }"""
    )
    page.locator(".orbit-battle:not([hidden])").wait_for(
        state="visible",
        timeout=12_000,
    )
    page.wait_for_timeout(7_000)


def geometry(page, mode: str) -> dict:
    selector = (
        ".orbit-canvas"
        if mode == "orbit"
        else "#game-root canvas:not(.moonlake-live3d-canvas)"
    )
    return page.evaluate(
        """(selector) => {
          const box = document.querySelector(selector)?.getBoundingClientRect();
          const threeCanvas = document.querySelector('.orbit-three-canvas');
          const threeBox = threeCanvas?.getBoundingClientRect();
          const threeStyle = threeCanvas ? getComputedStyle(threeCanvas) : null;
          return {
            viewport: [innerWidth, innerHeight],
            bodyScrollWidth: document.body.scrollWidth,
            stage: box ? { width: box.width, height: box.height } : null,
            threeCanvases: document.querySelectorAll('.orbit-three-canvas').length,
            threeCanvas: threeBox ? {
              width: threeBox.width,
              height: threeBox.height,
              visibility: threeStyle.visibility,
              display: threeStyle.display,
              opacity: threeStyle.opacity,
              computedWidth: threeStyle.width,
              computedHeight: threeStyle.height,
              inlineStyle: threeCanvas.getAttribute('style'),
              widthAttribute: threeCanvas.getAttribute('width'),
              heightAttribute: threeCanvas.getAttribute('height'),
              ready: threeCanvas.dataset.ready
            } : null,
            coreEntryStatus: document.querySelector('.orbit-battle')?.dataset.coreEntryStatus || null,
            orbitTopPilotStatus: document.querySelector('.orbit-battle')?.dataset.orbitTopPilotStatus || null,
            activeCompanionId: JSON.parse(localStorage.getItem('nexusLinkR2State:v1') || '{}').activeCompanionId || null
          };
        }""",
        selector,
    )


def run_case(browser, options: dict) -> None:
    context = browser.new_context(
        viewport=options["viewport"],
        reduced_motion=options.get("reduced_motion", "no-preference"),
    )
    context.add_init_script(script=seed_script(options["companion_id"]))
    if options.get("abort_r2"):
        for pattern in (
            "**/assets/characters/greyshade-cat/spritesheets/expedition/r2/**",
            "**/assets/enemies/rift-root-echo/expedition/r2/**",
            "**/assets/3d/orbit-tops-r2/**",
        ):
            context.route(pattern, lambda route: route.abort("failed"))

    page = context.new_page()
    page_errors: list[str] = []
    console_errors: list[str] = []
    console_messages: list[str] = []
    r2_responses: list[dict] = []
    orbit_top_responses: list[dict] = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    def record_console(message) -> None:
        console_messages.append(f"{message.type}:{message.text}")
        if message.type == "error":
            console_errors.append(message.text)

    page.on("console", record_console)

    def record_response(response) -> None:
        if "/assets/" in response.url and (
            "/r2/" in response.url or "-r2/" in response.url
        ):
            r2_responses.append({"url": response.url, "status": response.status})
        if "/assets/3d/orbit-tops-" in response.url:
            orbit_top_responses.append({"url": response.url, "status": response.status})

    page.on("response", record_response)
    boot(page, options["path"])
    open_expedition(page) if options["mode"] == "expedition" else open_orbit(page)
    layout = geometry(page, options["mode"])
    assert layout["stage"] and layout["stage"]["width"] > 300
    assert layout["stage"]["height"] > 250
    assert layout["bodyScrollWidth"] <= options["viewport"]["width"] + 1
    assert not page_errors, page_errors
    expected_abort_errors = (
        ["Failed to load resource: net::ERR_FAILED"]
        if options.get("abort_r2")
        else []
    )
    unexpected_console_errors = [
        message for message in console_errors
        if message not in expected_abort_errors
    ]
    assert not unexpected_console_errors, {
        "name": options["name"],
        "consoleErrors": console_errors,
    }
    screenshot = OUTPUT / (options["name"] + ".png")
    page.screenshot(path=str(screenshot))
    canvas_screenshot = None
    if options.get("expect_3d") is True:
        canvas_screenshot = OUTPUT / (options["name"] + "-three-canvas.png")
        canvas_box = page.locator(".orbit-three-canvas").bounding_box()
        assert canvas_box and canvas_box["width"] > 0 and canvas_box["height"] > 0, layout
        page.screenshot(path=str(canvas_screenshot), clip=canvas_box, omit_background=True)
    if options.get("expect_r2"):
        assert any(item["status"] == 200 for item in r2_responses), {
            "name": options["name"],
            "layout": layout,
            "responses": r2_responses,
            "console": console_messages,
        }
    if options.get("expect_3d") is True:
        assert layout["threeCanvases"] == 1, layout
        assert layout["orbitTopPilotStatus"] == "ready", layout
        assert layout["threeCanvas"]["width"] >= layout["stage"]["width"] - 1, layout
        assert layout["threeCanvas"]["height"] >= layout["stage"]["height"] - 1, layout
        successful_orbit_urls = {
            item["url"] for item in orbit_top_responses if item["status"] == 200
        }
        assert any("crystalfin-seahorse-orbit-top-r2.glb" in url for url in successful_orbit_urls), orbit_top_responses
        assert any("rift-echo-orbit-top-r1.glb" in url for url in successful_orbit_urls), orbit_top_responses
    if options.get("expect_3d") is False:
        assert layout["threeCanvases"] == 0, layout
        assert layout["orbitTopPilotStatus"] not in (None, "loading", "ready"), layout
    RESULTS.append(
        {
            **options,
            "layout": layout,
            "r2Responses": r2_responses,
            "orbitTopResponses": orbit_top_responses,
            "pageErrors": page_errors,
            "consoleErrors": console_errors,
            "unexpectedConsoleErrors": unexpected_console_errors,
            "consoleMessages": console_messages,
            "screenshot": screenshot.as_posix(),
            "canvasScreenshot": canvas_screenshot.as_posix() if canvas_screenshot else None,
        }
    )
    context.close()


CASES = (
    {
        "name": "expedition-actions-390x844",
        "viewport": {"width": 390, "height": 844},
        "mode": "expedition",
        "companion_id": "greyshade-cat",
        "path": "/",
        "expect_r2": True,
    },
    {
        "name": "expedition-fallback-390x664",
        "viewport": {"width": 390, "height": 664},
        "mode": "expedition",
        "companion_id": "greyshade-cat",
        "path": "/?expeditionActionPilot=0",
        "abort_r2": True,
    },
    {
        "name": "expedition-reduced-motion-1280x800",
        "viewport": {"width": 1280, "height": 800},
        "reduced_motion": "reduce",
        "mode": "expedition",
        "companion_id": "greyshade-cat",
        "path": "/",
        "expect_r2": True,
    },
    {
        "name": "orbit-crystalfin-390x844",
        "viewport": {"width": 390, "height": 844},
        "mode": "orbit",
        "companion_id": "crystalfin-seahorse",
        "path": "/?orbitCampSlice=1&orbit3dPilot=1",
        "expect_r2": True,
        "expect_3d": True,
    },
    {
        "name": "orbit-crystalfin-fallback-390x664",
        "viewport": {"width": 390, "height": 664},
        "mode": "orbit",
        "companion_id": "crystalfin-seahorse",
        "path": "/?orbitCampSlice=1&orbit3dPilot=1",
        "abort_r2": True,
        "expect_3d": False,
    },
)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    try:
        case_filter = os.environ.get("NEXUS_R2_QA_FILTER", "")
        selected_cases = [case for case in CASES if case_filter in case["name"]]
        for case in selected_cases:
            run_case(browser, case)
    finally:
        browser.close()

(OUTPUT / "results.json").write_text(
    json.dumps(RESULTS, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
print(f"global-3d-gameplay-pilots-r2-browser: {len(RESULTS)} selected cases PASS")
