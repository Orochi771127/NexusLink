"""First Touch State Projection R1 real-browser regression.

Run against a static server rooted at the repository:
  $env:FIRST_TOUCH_QA_URL='http://127.0.0.1:4173/'
  python docs/qa/first_touch_state_projection_r1_browser.py
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from time import time

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("FIRST_TOUCH_QA_URL", "http://127.0.0.1:4173/")
OUTPUT_DIR = Path("output/playwright/first-touch-state-projection-r1").resolve()
STORAGE_KEY = "nexusLinkR2State:v1"
SURFACES = ("explore", "care", "grow", "memory")


def mature_first_touch_state() -> dict:
    now = int(time() * 1000)
    return {
        "activeHabitatId": "moonlake",
        "activeCompanionId": "greyshade-cat",
        "unlockedCompanionIds": ["greyshade-cat"],
        "firstTouchCompleted": False,
        "firstSoulTalkCompleted": True,
        "firstTraceCompleted": True,
        "firstExplorationCompleted": True,
        "firstSessionLoopCompletedAt": now,
        "onboarding": {
            "version": 1,
            "status": "completed",
            "completed": True,
            "completedAt": now,
            "startedAt": now - 1000,
            "identityCompleted": True,
            "guidanceCompleted": True,
            "greyshadeMetAt": now,
            "veteranAutoCompleted": False,
            "firstLoop": {"skippedAt": None, "completedAt": now},
        },
        "playerProfile": {
            "displayName": "First Touch QA",
            "identitySkipped": False,
            "createdAt": now,
            "updatedAt": now,
        },
    }


def expect(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def wait_for_hint(page, visible: bool) -> None:
    page.wait_for_function(
        """expected => {
          const hint = document.querySelector('.touch-affordance');
          return Boolean(hint?.classList.contains('is-visible')) === expected;
        }""",
        arg=visible,
        timeout=30_000,
    )


def read_projection(page) -> dict:
    return page.evaluate(
        """() => {
          const hint = document.querySelector('.touch-affordance');
          const hintBounds = hint?.getBoundingClientRect();
          const canvas = [...document.querySelectorAll('#game-root canvas')]
            .find((node) => !node.classList.contains('moonlake-live3d-canvas'));
          const canvasBounds = canvas?.getBoundingClientRect();
          const companionBounds = window.__NEXUS_ACTIVE_COMPANION__?.getBounds?.();
          const scaleX = canvasBounds && canvas ? canvasBounds.width / canvas.width : NaN;
          const scaleY = canvasBounds && canvas ? canvasBounds.height / canvas.height : NaN;
          const expected = companionBounds && canvasBounds
            ? {
                x: canvasBounds.left + (companionBounds.x + companionBounds.width / 2) * scaleX,
                y: canvasBounds.top + (companionBounds.y + companionBounds.height / 2) * scaleY
              }
            : null;
          return {
            hint: hintBounds
              ? {
                  x: hintBounds.left + hintBounds.width / 2,
                  y: hintBounds.top + hintBounds.height / 2,
                  width: hintBounds.width,
                  pointerEvents: getComputedStyle(hint).pointerEvents,
                  visible: hint.classList.contains('is-visible'),
                  lowMotion: hint.classList.contains('is-lowmotion'),
                  ringAnimation: getComputedStyle(
                    hint.querySelector('.touch-affordance__ring')
                  ).animationName
                }
              : null,
            canvas: canvasBounds
              ? {
                  left: canvasBounds.left,
                  top: canvasBounds.top,
                  right: canvasBounds.right,
                  bottom: canvasBounds.bottom,
                  width: canvasBounds.width,
                  height: canvasBounds.height
                }
              : null,
            expected,
            activePage: document.querySelector('#page-layer')?.dataset.activePage || 'home',
            bodyClass: document.body.className
          };
        }"""
    )


def run_viewport(
    browser,
    *,
    name: str,
    width: int,
    height: int,
    is_mobile: bool,
    reduced_motion: bool,
    exercise_surfaces: bool,
    complete_touch: bool,
) -> dict:
    context = browser.new_context(
        viewport={"width": width, "height": height},
        device_scale_factor=1,
        is_mobile=is_mobile,
        has_touch=is_mobile,
        reduced_motion="reduce" if reduced_motion else "no-preference",
    )
    page = context.new_page()
    page_errors: list[str] = []
    console_errors: list[str] = []
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on(
        "console",
        lambda message: console_errors.append(message.text)
        if message.type == "error"
        else None,
    )
    state_json = json.dumps(mature_first_touch_state(), ensure_ascii=False)
    page.add_init_script(
        f"localStorage.setItem({json.dumps(STORAGE_KEY)}, {json.dumps(state_json)});"
    )

    page.goto(f"{BASE_URL}?live3d=0", wait_until="commit", timeout=45_000)
    page.wait_for_function(
        """() => document.documentElement.dataset.nexusControllersReady === 'true'
          && Boolean(window.__NEXUS_ACTIVE_COMPANION__)""",
        timeout=45_000,
    )
    if page.evaluate(
        "() => document.documentElement.dataset.firstSessionLoader !== 'complete'"
    ):
        expect(
            page.locator(".touch-affordance").count() == 0
            or not page.locator(".touch-affordance").evaluate(
                "node => node.classList.contains('is-visible')"
            ),
            f"{name}: first-session presentation owns input",
        )
    page.wait_for_function(
        "() => document.documentElement.dataset.firstSessionLoader === 'complete'",
        timeout=45_000,
    )
    wait_for_hint(page, True)
    initial = read_projection(page)

    expect(bool(initial["hint"]), f"{name}: hint exists")
    expect(bool(initial["canvas"]), f"{name}: Pixi canvas exists")
    expect(bool(initial["expected"]), f"{name}: companion bounds are measurable")
    expect(initial["activePage"] == "home", f"{name}: starts on Home")
    expect(initial["hint"]["pointerEvents"] == "auto", f"{name}: cue is actionable")
    expect(
        abs(initial["hint"]["x"] - initial["expected"]["x"]) <= 3,
        f"{name}: horizontal projection aligns",
    )
    expect(
        abs(initial["hint"]["y"] - initial["expected"]["y"]) <= 3,
        f"{name}: vertical projection aligns",
    )
    expect(
        initial["canvas"]["left"] <= initial["hint"]["x"] <= initial["canvas"]["right"],
        f"{name}: cue stays inside stage x",
    )
    expect(
        initial["canvas"]["top"] <= initial["hint"]["y"] <= initial["canvas"]["bottom"],
        f"{name}: cue stays inside stage y",
    )
    expect(68 <= initial["hint"]["width"] <= 118, f"{name}: touch size is bounded")
    if width >= 1000:
        expect(initial["canvas"]["left"] > 0, f"{name}: desktop stage has viewport offset")
    if reduced_motion:
        expect(initial["hint"]["lowMotion"] is True, f"{name}: low-motion class is active")
        expect(initial["hint"]["ringAnimation"] == "none", f"{name}: ring is static")

    if exercise_surfaces:
        for surface in SURFACES:
            page.locator(f'[data-action="{surface}"]').click()
            page.wait_for_function(
                "pageName => document.querySelector('#page-layer')?.dataset.activePage === pageName",
                arg=surface,
            )
            wait_for_hint(page, False)
            hidden = read_projection(page)
            expect(
                hidden["hint"]["pointerEvents"] == "none",
                f"{name}: {surface} cannot be intercepted",
            )
            page.locator('[data-action="home"]').click()
            page.wait_for_function(
                "() => document.querySelector('#page-layer')?.dataset.activePage === 'home'"
            )
            wait_for_hint(page, True)

        for panel in ("soulTalk", "settings"):
            page.locator(f'[data-panel-trigger="{panel}"]').first.click()
            page.wait_for_function(
                "panelName => document.querySelector('.panel-layer')?.dataset.activePanel === panelName",
                arg=panel,
            )
            wait_for_hint(page, False)
            hidden = read_projection(page)
            expect(
                hidden["hint"]["pointerEvents"] == "none",
                f"{name}: {panel} cannot be intercepted",
            )
            page.locator(f'[data-panel="{panel}"] [data-panel-close]').click()
            page.wait_for_function(
                "() => document.querySelector('.panel-layer')?.dataset.activePanel === 'none'"
            )
            wait_for_hint(page, True)

    page.screenshot(path=str(OUTPUT_DIR / f"{name}.png"), full_page=False)

    if complete_touch:
        page.locator(".touch-affordance").click()
        wait_for_hint(page, False)
        page.wait_for_function(
            """storageKey => {
              const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
              return saved.firstTouchCompleted === true;
            }""",
            arg=STORAGE_KEY,
            timeout=15_000,
        )
        after_touch = read_projection(page)
        expect(
            after_touch["hint"]["pointerEvents"] == "none",
            f"{name}: completed cue cannot intercept",
        )

    expect(page_errors == [], f"{name}: page errors: {page_errors}")
    expect(console_errors == [], f"{name}: console errors: {console_errors}")
    context.close()
    return {"name": name, "initial": initial}


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    cases = (
        dict(
            name="desktop-1440x900",
            width=1440,
            height=900,
            is_mobile=False,
            reduced_motion=False,
            exercise_surfaces=True,
            complete_touch=True,
        ),
        dict(
            name="mobile-390x844",
            width=390,
            height=844,
            is_mobile=True,
            reduced_motion=False,
            exercise_surfaces=True,
            complete_touch=False,
        ),
        dict(
            name="mobile-320x720",
            width=320,
            height=720,
            is_mobile=True,
            reduced_motion=False,
            exercise_surfaces=False,
            complete_touch=False,
        ),
        dict(
            name="mobile-390x844-reduced",
            width=390,
            height=844,
            is_mobile=True,
            reduced_motion=True,
            exercise_surfaces=False,
            complete_touch=False,
        ),
    )
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True,
            args=["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader"],
        )
        try:
            results = [run_viewport(browser, **case) for case in cases]
        finally:
            browser.close()

    print(
        json.dumps(
            {
                "pass": True,
                "cases": [
                    {
                        "name": result["name"],
                        "hint": result["initial"]["hint"],
                        "canvas": result["initial"]["canvas"],
                        "expected": result["initial"]["expected"],
                    }
                    for result in results
                ],
                "screenshots": str(OUTPUT_DIR),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
