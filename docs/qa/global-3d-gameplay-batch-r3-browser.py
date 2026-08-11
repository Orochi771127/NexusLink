"""Real-browser gate for Blazetail R3 Expedition and Orbit promotion."""

from __future__ import annotations

import json
import mimetypes
import os
import time
from pathlib import Path
from urllib.parse import unquote, urlparse

from playwright.sync_api import sync_playwright


REPO_ROOT = Path(__file__).resolve().parents[2]
FILE_MODE = os.environ.get("NEXUS_R3_QA_FILE") == "1"
INTERCEPT_LOCAL = os.environ.get("NEXUS_R3_QA_INTERCEPT") == "1"
BASE_URL = os.environ.get(
    "NEXUS_R3_QA_URL",
    (REPO_ROOT / "index.html").as_uri() if FILE_MODE else "http://127.0.0.1:4175",
)
OUTPUT = Path("output/character-pilots/blazetail-kit-r3/browser-promotion")
STORAGE_KEY = "nexusLinkR2State:v1"
OUTPUT.mkdir(parents=True, exist_ok=True)
RESULTS: list[dict] = []


def seed_script() -> str:
    state = {
        "playerProfile": {
            "displayName": "R3 QA",
            "identitySkipped": False,
            "createdAt": 1_786_381_200_000,
            "updatedAt": 1_786_381_200_000,
        },
        "onboarding": {
            "status": "completed",
            "completed": True,
            "completedAt": 1_786_381_200_000,
            "identityCompleted": True,
            "guidanceCompleted": True,
            "greyshadeMetAt": 1_786_381_200_000,
            "veteranAutoCompleted": False,
            "firstLoop": {"completedAt": 1_786_381_200_000},
        },
        "firstTouchCompleted": True,
        "firstHugCompleted": True,
        "activeCompanionId": "blazetail-kit",
        "unlockedCompanionIds": ["blazetail-kit"],
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
        "if (location.protocol === 'http:' || location.protocol === 'https:' || location.protocol === 'file:') {"
        f"localStorage.setItem({json.dumps(STORAGE_KEY)}, {json.dumps(json.dumps(state, ensure_ascii=False))});"
        "}"
    )


def boot(page, url_path: str) -> None:
    target = BASE_URL
    if FILE_MODE:
        if "?" in url_path:
            target += "?" + url_path.split("?", 1)[1]
    else:
        target += url_path
    last_error = None
    for _attempt in range(3):
        try:
            page.goto(target, wait_until="commit", timeout=30_000)
            last_error = None
            break
        except Exception as error:
            last_error = error
            if "ERR_EMPTY_RESPONSE" not in str(error):
                raise
            time.sleep(0.25)
    if last_error:
        raise last_error
    page.wait_for_function(
        "document.documentElement.dataset.nexusControllersReady === 'true'",
        timeout=60_000,
    )


def open_expedition(page) -> None:
    page.locator(".bottom-nav [data-action='explore']").click()
    page.locator('[data-page="explore"] [data-page-action="open-map"]').click()
    launch = page.locator(".map-expedition-launch:not(:disabled)").first
    launch.wait_for(state="visible", timeout=12_000)
    launch.click()
    page.wait_for_function("document.body.classList.contains('expedition-active')", timeout=12_000)
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
          button.remove();
        }"""
    )
    page.locator(".orbit-battle:not([hidden])").wait_for(state="visible", timeout=12_000)
    page.wait_for_timeout(7_000)


def decode_expedition_actions(page) -> dict:
    return page.evaluate(
        """async () => {
          const module = await import('./src/data/expeditionActionSpriteProfiles.js');
          const profile = module.getExpeditionCompanionActionPilotProfile('blazetail-kit');
          const entries = [
            ['attack_basic', profile.actions.attack_basic.directions.south],
            ['hit', profile.actions.hit.directions.south]
          ];
          const decoded = {};
          for (const [action, url] of entries) {
            const image = new Image();
            image.src = url;
            await image.decode();
            decoded[action] = { width: image.naturalWidth, height: image.naturalHeight, url };
          }
          return decoded;
        }"""
    )


def geometry(page, mode: str) -> dict:
    selector = ".orbit-canvas" if mode == "orbit" else "#game-root canvas:not(.moonlake-live3d-canvas)"
    return page.evaluate(
        """(selector) => {
          const box = document.querySelector(selector)?.getBoundingClientRect();
          const threeCanvas = document.querySelector('.orbit-three-canvas');
          const threeBox = threeCanvas?.getBoundingClientRect();
          const style = threeCanvas ? getComputedStyle(threeCanvas) : null;
          const visibleButtons = [...document.querySelectorAll('button:not([hidden])')]
            .map((node) => node.getBoundingClientRect())
            .filter((box) => box.width > 0 && box.height > 0);
          return {
            viewport: [innerWidth, innerHeight],
            bodyScrollWidth: document.body.scrollWidth,
            stage: box ? { width: box.width, height: box.height } : null,
            threeCanvases: document.querySelectorAll('.orbit-three-canvas').length,
            threeCanvas: threeBox ? {
              width: threeBox.width,
              height: threeBox.height,
              visibility: style.visibility,
              display: style.display,
              ready: threeCanvas.dataset.ready
            } : null,
            orbitTopPilotStatus: document.querySelector('.orbit-battle')?.dataset.orbitTopPilotStatus || null,
            activeCompanionId: JSON.parse(localStorage.getItem('nexusLinkR2State:v1') || '{}').activeCompanionId || null,
            minVisibleButtonHeight: visibleButtons.length ? Math.min(...visibleButtons.map((box) => box.height)) : null
          };
        }""",
        selector,
    )


def run_case(browser, options: dict) -> None:
    context = browser.new_context(
        viewport=options["viewport"],
        reduced_motion=options.get("reduced_motion", "no-preference"),
    )
    context.add_init_script(script=seed_script())
    if INTERCEPT_LOCAL:
        def serve_local(route) -> None:
            request_path = unquote(urlparse(route.request.url).path).lstrip("/") or "index.html"
            candidate = (REPO_ROOT / request_path).resolve()
            if candidate.is_dir():
                candidate /= "index.html"
            if not candidate.is_relative_to(REPO_ROOT) or not candidate.is_file():
                route.fulfill(status=404, body="Not found", content_type="text/plain")
                return
            content_type = mimetypes.guess_type(candidate.name)[0] or "application/octet-stream"
            route.fulfill(status=200, path=str(candidate), content_type=content_type)

        context.route("http://127.0.0.1:4175/**", serve_local)
    if options.get("abort_r3"):
        for pattern in (
            "**/assets/characters/blazetail-kit/spritesheets/expedition/r3/**",
            "**/assets/3d/orbit-tops-r3/**",
        ):
            context.route(pattern, lambda route: route.abort("failed"))
    page = context.new_page()
    page_errors: list[str] = []
    console_errors: list[str] = []
    r3_responses: list[dict] = []
    orbit_responses: list[dict] = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)

    def record_response(response) -> None:
        if "/r3/" in response.url or "-r3/" in response.url:
            r3_responses.append({"url": response.url, "status": response.status})
        if "/assets/3d/orbit-tops-" in response.url:
            orbit_responses.append({"url": response.url, "status": response.status})

    page.on("response", record_response)
    try:
        boot(page, options["path"])
    except Exception as error:
        print(json.dumps({
            "bootFailure": options["name"],
            "url": page.url,
            "error": str(error),
            "pageErrors": page_errors,
            "consoleErrors": console_errors,
        }, ensure_ascii=False))
        raise
    try:
        open_expedition(page) if options["mode"] == "expedition" else open_orbit(page)
    except Exception as error:
        print(json.dumps({
            "modeOpenFailure": options["name"],
            "error": str(error),
            "bodyClass": page.locator("body").get_attribute("class"),
            "pageErrors": page_errors,
            "consoleErrors": console_errors,
        }, ensure_ascii=False))
        raise
    action_decodes = None
    if options["mode"] == "expedition" and options.get("expect_r3"):
        action_decodes = decode_expedition_actions(page)
    layout = geometry(page, options["mode"])
    assert layout["activeCompanionId"] == "blazetail-kit", layout
    assert layout["stage"] and layout["stage"]["width"] > 300, layout
    assert layout["stage"]["height"] > 250, layout
    assert layout["bodyScrollWidth"] <= options["viewport"]["width"] + 1, layout
    if options["viewport"]["width"] <= 390:
        assert layout["minVisibleButtonHeight"] >= 44, layout
    assert not page_errors, page_errors
    unexpected_console_errors = [
        value for value in console_errors
        if not options.get("abort_r3") or value != "Failed to load resource: net::ERR_FAILED"
    ]
    assert not unexpected_console_errors, unexpected_console_errors
    if options.get("expect_r3"):
        assert any(item["status"] == 200 for item in r3_responses), r3_responses
    if action_decodes:
        assert action_decodes["attack_basic"]["width"] == 1536, action_decodes
        assert action_decodes["attack_basic"]["height"] == 256, action_decodes
        assert action_decodes["hit"]["width"] == 1024, action_decodes
        assert action_decodes["hit"]["height"] == 256, action_decodes
    if options.get("expect_3d") is True:
        assert layout["threeCanvases"] == 1, layout
        assert layout["orbitTopPilotStatus"] == "ready", layout
        assert layout["threeCanvas"]["width"] >= layout["stage"]["width"] - 1, layout
        assert layout["threeCanvas"]["height"] >= layout["stage"]["height"] - 1, layout
        successful = {item["url"] for item in orbit_responses if item["status"] == 200}
        assert any("blazetail-kit-orbit-top-r3.glb" in url for url in successful), orbit_responses
        assert any("rift-echo-orbit-top-r1.glb" in url for url in successful), orbit_responses
    if options.get("expect_3d") is False:
        assert layout["threeCanvases"] == 0, layout
        assert layout["orbitTopPilotStatus"] not in (None, "loading", "ready"), layout
    screenshot = OUTPUT / f"{options['name']}.png"
    page.screenshot(path=str(screenshot))
    RESULTS.append({
        **options,
        "layout": layout,
        "actionDecodes": action_decodes,
        "r3Responses": r3_responses,
        "orbitResponses": orbit_responses,
        "pageErrors": page_errors,
        "consoleErrors": console_errors,
        "unexpectedConsoleErrors": unexpected_console_errors,
        "screenshot": screenshot.as_posix(),
    })
    context.close()


CASES = (
    {
        "name": "expedition-blazetail-390x844", "viewport": {"width": 390, "height": 844},
        "mode": "expedition", "path": "/index.html", "expect_r3": True,
    },
    {
        "name": "expedition-blazetail-fallback-390x664", "viewport": {"width": 390, "height": 664},
        "mode": "expedition", "path": "/index.html", "abort_r3": True,
    },
    {
        "name": "expedition-blazetail-reduced-motion-1280x800", "viewport": {"width": 1280, "height": 800},
        "reduced_motion": "reduce", "mode": "expedition", "path": "/index.html", "expect_r3": True,
    },
    {
        "name": "orbit-blazetail-390x844", "viewport": {"width": 390, "height": 844},
        "mode": "orbit", "path": "/index.html?orbitCampSlice=1&orbit3dPilot=1", "expect_r3": True, "expect_3d": True,
    },
    {
        "name": "orbit-blazetail-fallback-390x664", "viewport": {"width": 390, "height": 664},
        "mode": "orbit", "path": "/index.html?orbitCampSlice=1&orbit3dPilot=1", "abort_r3": True, "expect_3d": False,
    },
)


with sync_playwright() as playwright:
    browser_args = ["--allow-file-access-from-files", "--disable-web-security"] if FILE_MODE else []
    browser = playwright.chromium.launch(headless=True, args=browser_args)
    try:
        case_filter = os.environ.get("NEXUS_R3_QA_FILTER", "")
        for case in (case for case in CASES if case_filter in case["name"]):
            run_case(browser, case)
    finally:
        browser.close()

(OUTPUT / "results.json").write_text(json.dumps(RESULTS, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"global-3d-gameplay-batch-r3-browser: {len(RESULTS)} selected cases PASS")
