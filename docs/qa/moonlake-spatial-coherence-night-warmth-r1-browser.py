import json
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright


BASE_URL = None
OUTPUT_DIR = Path("output/playwright/moonlake-spatial-coherence-night-warmth-r1")
WAYPOINT_IDS = [
    "platform_center",
    "platform_left",
    "platform_right",
    "near_ground_center",
    "near_ground_left",
    "near_ground_right",
    "bridge_near",
    "bridge_mid",
    "bridge_far",
]


def seed_state(first_loop_complete=True):
    first_loop_literal = "true" if first_loop_complete else "false"
    script = """
    (() => {
      const firstLoopComplete = __FIRST_LOOP_COMPLETE__;
      const now = Date.now();
      localStorage.setItem("nexusLinkR2State:v1", JSON.stringify({
        activeHabitatId: "moonlake",
        activeCompanionId: "greyshade-cat",
        unlockedCompanionIds: ["greyshade-cat"],
        mood: "calm",
        firstTouchCompleted: firstLoopComplete,
        onboarding: {
          version: 1,
          status: "completed",
          completed: true,
          completedAt: now,
          startedAt: now - 1000,
          identityCompleted: true,
          guidanceCompleted: true,
          greyshadeMetAt: now,
          veteranAutoCompleted: false,
          firstLoop: {
            skippedAt: null,
            completedAt: firstLoopComplete ? now : null
          }
        },
        playerProfile: {
          displayName: "Moonlake Spatial R1 QA",
          identitySkipped: false,
          createdAt: now,
          updatedAt: now
        }
      }));
    })();
    """
    return script.replace("__FIRST_LOOP_COMPLETE__", first_loop_literal)


def wait_ready(page):
    try:
        page.wait_for_function(
            "window.__NEXUS_HABITAT?.getLive3dDiagnostics?.()?.ready === true",
            timeout=25_000,
        )
    except Exception:
        print(json.dumps(page.evaluate("""
          () => ({
            readyState: document.readyState,
            hasHabitatApi: Boolean(window.__NEXUS_HABITAT),
            diagnostics: window.__NEXUS_HABITAT?.getLive3dDiagnostics?.() || null,
            pixiLoadFailed: Boolean(window.__NEXUS_PIXI_LOAD_FAILED__),
            canvasCount: document.querySelectorAll("#game-root canvas").length,
            bodyClass: document.body?.className || null
          })
        """), ensure_ascii=False, indent=2))
        raise
    page.wait_for_timeout(900)
    dismiss = page.locator(".resonance-thread .rt-dismiss")
    if dismiss.is_visible():
        dismiss.click()
        page.wait_for_timeout(180)


def collect_errors(page):
    page_errors = []
    console_errors = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on(
        "console",
        lambda message: console_errors.append(message.text)
        if message.type == "error"
        else None,
    )
    return page_errors, console_errors


def mean_rgb(image_path, center_x, center_y, radius=7):
    image = Image.open(image_path).convert("RGB")
    left = max(0, int(round(center_x)) - radius)
    top = max(0, int(round(center_y)) - radius)
    right = min(image.width, int(round(center_x)) + radius + 1)
    bottom = min(image.height, int(round(center_y)) + radius + 1)
    pixels = list(image.crop((left, top, right, bottom)).get_flattened_data())
    return {
        "r": sum(pixel[0] for pixel in pixels) / len(pixels),
        "g": sum(pixel[1] for pixel in pixels) / len(pixels),
        "b": sum(pixel[2] for pixel in pixels) / len(pixels),
    }


def mean_luminance(image_path):
    image = Image.open(image_path).convert("RGB").resize((78, 169))
    values = [
        0.2126 * red + 0.7152 * green + 0.0722 * blue
        for red, green, blue in image.get_flattened_data()
    ]
    return sum(values) / len(values)


def assert_no_errors(label, page_errors, console_errors):
    assert not page_errors, f"{label} page errors: {page_errors}"
    assert not console_errors, f"{label} console errors: {console_errors}"


def capture_variant(browser, name, viewport, reduced_motion="no-preference"):
    context = browser.new_context(
        viewport=viewport,
        device_scale_factor=1,
        is_mobile=viewport["width"] <= 430,
        has_touch=viewport["width"] <= 430,
        reduced_motion=reduced_motion,
    )
    context.add_init_script(script=seed_state(True))
    page = context.new_page()
    page_errors, console_errors = collect_errors(page)
    page.goto(
        f"{BASE_URL}?live3d=1&moonlakeBridgeQa=1&timePhase=night&weather=clear",
        wait_until="commit",
        timeout=60_000,
    )
    wait_ready(page)
    diagnostics = page.evaluate("window.__NEXUS_HABITAT.getLive3dDiagnostics()")
    assert diagnostics["environment"]["nightMix"] > 0.9
    assert diagnostics["environment"]["nightWarmthProfile"] == "moonlake-night-warmth-r1"
    assert diagnostics["environment"]["persistentLanterns"] == 2
    assert diagnostics["environment"]["dayGeometryPreserved"] is True
    assert diagnostics["reducedMotion"] is (reduced_motion == "reduce")
    safe_waypoints = []
    for waypoint_id in WAYPOINT_IDS:
        assert page.evaluate(
            "id => window.__NEXUS_HABITAT.setRoamingWaypointForQa(id)",
            waypoint_id,
        )
        page.wait_for_function(
            """
            id => {
              const roaming = window.__NEXUS_HABITAT.getRoamingSnapshot();
              const safety = window.__NEXUS_HABITAT.getNavigationSafetyDiagnostics().footSafety;
              return roaming?.currentId === id && safety?.reason !== "projection_unavailable";
            }
            """,
            arg=waypoint_id,
            timeout=5_000,
        )
        safety = page.evaluate(
            "window.__NEXUS_HABITAT.getNavigationSafetyDiagnostics().footSafety"
        )
        assert safety["safe"] is True, f"{name} {waypoint_id}: {safety}"
        safe_waypoints.append(waypoint_id)
    screenshot = OUTPUT_DIR / f"{name}.png"
    page.screenshot(path=str(screenshot), full_page=False)
    assert_no_errors(name, page_errors, console_errors)
    context.close()
    return {
        "name": name,
        "viewport": viewport,
        "reducedMotion": reduced_motion == "reduce",
        "safeWaypointCount": len(safe_waypoints),
        "screenshot": str(screenshot.resolve()),
        "renderer": diagnostics["renderer"],
    }


class QuietStaticHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        return


def run_browser_qa():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            args=[
                "--enable-webgl",
                "--ignore-gpu-blocklist",
                "--ignore-certificate-errors",
                "--use-angle=swiftshader",
            ],
        )

        locked_context = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=1,
            is_mobile=True,
            has_touch=True,
        )
        locked_context.add_init_script(script=seed_state(False))
        locked_page = locked_context.new_page()
        locked_errors, locked_console = collect_errors(locked_page)
        locked_page.goto(
            f"{BASE_URL}?live3d=1&moonlakeBridgeQa=1&timePhase=day&weather=clear",
            wait_until="commit",
            timeout=60_000,
        )
        wait_ready(locked_page)
        locked_page.wait_for_timeout(3_400)
        locked_roaming = locked_page.evaluate(
            "window.__NEXUS_HABITAT.getRoamingSnapshot()"
        )
        assert locked_roaming["currentId"] == "platform_center"
        assert locked_roaming["targetId"] is None
        assert locked_roaming["distanceTravelled"] == 0
        assert abs(locked_roaming["projected"]["x"] - 195) <= 1
        assert abs(locked_roaming["projected"]["y"] - 472.64) <= 1
        assert_no_errors("first-loop-home-lock", locked_errors, locked_console)
        locked_context.close()

        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=1,
            is_mobile=True,
            has_touch=True,
        )
        context.add_init_script(script=seed_state(True))
        page = context.new_page()
        page_errors, console_errors = collect_errors(page)
        page.goto(
            f"{BASE_URL}?live3d=1&moonlakeBridgeQa=1&timePhase=night&weather=clear",
            wait_until="commit",
            timeout=60_000,
        )
        wait_ready(page)

        matrix = []
        for waypoint_id in WAYPOINT_IDS:
            assert page.evaluate(
                "id => window.__NEXUS_HABITAT.setRoamingWaypointForQa(id)",
                waypoint_id,
            )
            page.wait_for_function(
                """
                id => {
                  const roaming = window.__NEXUS_HABITAT.getRoamingSnapshot();
                  const safety = window.__NEXUS_HABITAT.getNavigationSafetyDiagnostics().footSafety;
                  return roaming?.currentId === id && safety?.reason !== "projection_unavailable";
                }
                """,
                arg=waypoint_id,
                timeout=5_000,
            )
            snapshot = page.evaluate(
                """
                () => ({
                  roaming: window.__NEXUS_HABITAT.getRoamingSnapshot(),
                  navigation: window.__NEXUS_HABITAT.getNavigationSafetyDiagnostics()
                })
                """
            )
            safety = snapshot["navigation"]["footSafety"]
            assert safety["safe"] is True, f"{waypoint_id}: {safety}"
            assert safety["walkableSurfaceId"] in {
                "central-stone-plaza",
                "platform-bridge-corridor",
            }
            matrix.append(
                {
                    "waypointId": waypoint_id,
                    "x": snapshot["roaming"]["projected"]["x"],
                    "y": snapshot["roaming"]["projected"]["y"],
                    "surface": safety["walkableSurfaceId"],
                }
            )

        bush_safety = page.evaluate(
            """
            async () => {
              const module = await import("./src/pixi/moonlakeNavigationSafety.js");
              return module.getMoonlakeProjectedFootSafety(
                { x: 174, y: 557, referenceScale390: 1 },
                { companionId: "greyshade-cat", area: "near_ground" }
              );
            }
            """
        )
        assert bush_safety["safe"] is False
        assert bush_safety["reason"] == "outside_walkable_surface"

        page.evaluate(
            "window.__NEXUS_HABITAT.setRoamingWaypointForQa('platform_center')"
        )
        page.wait_for_timeout(220)
        night_path = OUTPUT_DIR / "night-warmth-390x844.png"
        page.locator(".moonlake-live3d-canvas").screenshot(path=str(night_path))

        page.evaluate("window.__NEXUS_HABITAT.setTimePhase('day')")
        page.wait_for_timeout(300)
        day_path = OUTPUT_DIR / "day-reference-390x844.png"
        page.locator(".moonlake-live3d-canvas").screenshot(path=str(day_path))

        left_lamp = mean_rgb(night_path, 139, 470)
        right_lamp = mean_rgb(night_path, 270, 470)
        night_luminance = mean_luminance(night_path)
        day_luminance = mean_luminance(day_path)
        for label, lamp in (("left", left_lamp), ("right", right_lamp)):
            assert lamp["r"] >= 70, f"{label} lamp is not visibly lit: {lamp}"
            assert lamp["r"] - lamp["b"] >= 12, f"{label} lamp is not warm: {lamp}"
        assert night_luminance >= 38, f"night remains too dark: {night_luminance}"
        assert night_luminance < day_luminance, "night must remain visually distinct from day"
        assert_no_errors("mobile-matrix", page_errors, console_errors)
        context.close()

        variants = [
            capture_variant(browser, "night-short-phone-390x664", {"width": 390, "height": 664}),
            capture_variant(browser, "night-desktop-1440x900", {"width": 1440, "height": 900}),
            capture_variant(
                browser,
                "night-reduced-motion-390x844",
                {"width": 390, "height": 844},
                reduced_motion="reduce",
            ),
        ]
        browser.close()

    report = {
        "pass": True,
        "homeAnchor": {
            "currentId": locked_roaming["currentId"],
            "targetId": locked_roaming["targetId"],
            "distanceTravelled": locked_roaming["distanceTravelled"],
            "projected": locked_roaming["projected"],
        },
        "walkableWaypointCount": len(matrix),
        "waypoints": matrix,
        "foregroundBush": bush_safety,
        "nightMetrics": {
            "leftLamp": left_lamp,
            "rightLamp": right_lamp,
            "nightMeanLuminance": night_luminance,
            "dayMeanLuminance": day_luminance,
        },
        "screenshots": [
            str(night_path.resolve()),
            str(day_path.resolve()),
            *[variant["screenshot"] for variant in variants],
        ],
        "variants": variants,
    }
    report_path = OUTPUT_DIR / "results.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({**report, "report": str(report_path.resolve())}, ensure_ascii=False, indent=2))


def main():
    global BASE_URL
    handler = partial(QuietStaticHandler, directory=str(Path.cwd()))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    BASE_URL = f"http://127.0.0.1:{server.server_port}/"
    try:
        run_browser_qa()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


if __name__ == "__main__":
    main()
