"""Mobile smoke test for FULL_GAME_BUG_HUNT — 390x844 Playwright pass."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
BASE = "http://127.0.0.1:5173"
OUT = ROOT / "docs" / "qa" / "_bug_hunt_smoke_output.json"


def main() -> int:
    results = {
        "viewport": {"width": 390, "height": 844},
        "console_errors": [],
        "failed_requests": [],
        "steps": [],
        "screenshots": [],
    }

    def log(step: str, ok: bool, detail: str = "") -> None:
        results["steps"].append({"step": step, "ok": ok, "detail": detail})

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        page = context.new_page()

        page.on("console", lambda msg: results["console_errors"].append(msg.text) if msg.type == "error" else None)
        page.on("requestfailed", lambda req: results["failed_requests"].append({"url": req.url, "failure": str(req.failure)}))

        page.goto(BASE, wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(1500)

        page.evaluate("localStorage.clear()")
        page.reload(wait_until="networkidle")
        page.wait_for_timeout(3000)

        shot = ROOT / "docs" / "qa" / "_bug_hunt_fresh_boot.png"
        page.screenshot(path=str(shot))
        results["screenshots"].append(str(shot.relative_to(ROOT)))

        # Onboarding: identity 3-choice then start
        choices = page.locator("[data-onboarding-choice]")
        if choices.count() >= 1:
            choices.first.click()
            page.wait_for_timeout(500)
            log("onboarding_3_choice", True, f"clicked first of {choices.count()} choices")
        start_btn = page.locator("[data-onboarding-action='start'], .onboarding-primary")
        if start_btn.count():
            start_btn.first.click()
            page.wait_for_timeout(1500)
            log("onboarding_start", True, "clicked start")
        else:
            log("onboarding_start", False, "start button missing")

        canvas = page.locator("#game-root canvas")
        if canvas.count():
            box = canvas.first.bounding_box()
            if box:
                page.touchscreen.tap(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
                page.wait_for_timeout(1200)
                log("touch_companion", True, "tapped canvas center")
            else:
                log("touch_companion", False, "canvas bbox missing")
        else:
            log("touch_companion", False, "no pixi canvas")

        soul_launcher = page.locator("#soul-talk-launcher, [data-panel-target='soul-talk'], button:has-text('心語')")
        if soul_launcher.count():
            soul_launcher.first.click()
            page.wait_for_timeout(600)

        soul_input = page.locator("#soul-talk-input, .soul-talk-input textarea, .soul-talk-input input, textarea.soul-input")
        if soul_input.count():
            soul_input.first.fill("今天有點累")
            send = page.locator("#soul-talk-send, [data-action='send-soul-talk'], button:has-text('送出')")
            if send.count():
                send.first.click()
                page.wait_for_timeout(1500)
                log("soul_talk_send", True, "message sent")
            else:
                log("soul_talk_send", False, "send button missing")
        else:
            log("soul_talk_send", False, "input missing")

        shot2 = ROOT / "docs" / "qa" / "_bug_hunt_after_soul_talk.png"
        page.screenshot(path=str(shot2))
        results["screenshots"].append(str(shot2.relative_to(ROOT)))

        map_nav = page.locator("[data-nav='map'], #nav-map, button:has-text('探索')")
        if map_nav.count():
            map_nav.first.click()
            page.wait_for_timeout(1200)
            shot3 = ROOT / "docs" / "qa" / "_bug_hunt_map.png"
            page.screenshot(path=str(shot3))
            results["screenshots"].append(str(shot3.relative_to(ROOT)))
            log("map_open", True, "map nav clicked")
        else:
            log("map_open", False, "map nav missing")

        for nav in ("home", "growth", "memory", "codex"):
            btn = page.locator(f"[data-nav='{nav}']")
            if btn.count():
                btn.first.click()
                page.wait_for_timeout(700)
                log(f"page_{nav}", True, "opened")
            else:
                log(f"page_{nav}", False, "nav missing")

        shot4 = ROOT / "docs" / "qa" / "_bug_hunt_pages.png"
        page.screenshot(path=str(shot4))
        results["screenshots"].append(str(shot4.relative_to(ROOT)))

        browser.close()

    results["summary"] = {
        "console_error_count": len(results["console_errors"]),
        "failed_request_count": len(results["failed_requests"]),
        "steps_ok": sum(1 for s in results["steps"] if s["ok"]),
        "steps_total": len(results["steps"]),
    }
    OUT.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(results["summary"], ensure_ascii=False, indent=2))
    return 0 if results["summary"]["console_error_count"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
