import hashlib
import json
import os
import tempfile
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright


STORAGE_KEY = "nexusLinkR2State:v1"
PIXI_CDN = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js"
BASE_URL = os.environ.get("NEXUS_QA_BASE", "")
OUTPUT_DIR = Path(os.environ.get("NEXUS_QA_OUTPUT", Path(tempfile.gettempdir()) / "nexus-championship-r1-qa"))


def check(report, name, condition, detail=None):
    report["checks"].append({"name": name, "ok": bool(condition), "detail": detail})


def install_production_canary(context):
    seed = {
        "schemaVersion": 1,
        "activeCompanionId": "greyshade-cat",
        "unlockedCompanionIds": ["greyshade-cat"],
        "settings": {"locale": "en", "reducedMotion": False},
        "wallet": 777,
        "inventory": {"canary-item": 3},
        "relationship": {"bond": 41, "trust": 37},
        "growth": {"canary": "growth-unchanged"},
        "standoff": {"canary": "standoff-unchanged"},
        "orbit": {"canary": "orbit-unchanged"},
        "raphael": {"canary": "raphael-unchanged"},
    }
    context.add_init_script(
        script=f"""(() => {{
          if (!['http:', 'https:'].includes(location.protocol)) return;
          const original = {{
            setItem: Storage.prototype.setItem,
            removeItem: Storage.prototype.removeItem,
            clear: Storage.prototype.clear,
            fetch: window.fetch,
            xhrOpen: XMLHttpRequest.prototype.open,
            idbOpen: indexedDB.open.bind(indexedDB),
            idbDelete: indexedDB.deleteDatabase.bind(indexedDB),
            beacon: navigator.sendBeacon?.bind(navigator)
          }};
          original.setItem.call(localStorage, {json.dumps(STORAGE_KEY)}, {json.dumps(json.dumps(seed, separators=(',', ':')))});
          window.__CHAMPIONSHIP_BOUNDARY_CALLS__ = {{ storage: [], fetch: [], xhr: [], indexedDb: [], beacon: [] }};
          Storage.prototype.setItem = function(key, value) {{
            window.__CHAMPIONSHIP_BOUNDARY_CALLS__.storage.push(['setItem', String(key)]);
            return original.setItem.call(this, key, value);
          }};
          Storage.prototype.removeItem = function(key) {{
            window.__CHAMPIONSHIP_BOUNDARY_CALLS__.storage.push(['removeItem', String(key)]);
            return original.removeItem.call(this, key);
          }};
          Storage.prototype.clear = function() {{
            window.__CHAMPIONSHIP_BOUNDARY_CALLS__.storage.push(['clear']);
            return original.clear.call(this);
          }};
          window.fetch = function(...args) {{
            window.__CHAMPIONSHIP_BOUNDARY_CALLS__.fetch.push(String(args[0]));
            return original.fetch.apply(this, args);
          }};
          XMLHttpRequest.prototype.open = function(method, url, ...rest) {{
            window.__CHAMPIONSHIP_BOUNDARY_CALLS__.xhr.push([String(method), String(url)]);
            return original.xhrOpen.call(this, method, url, ...rest);
          }};
          indexedDB.open = function(...args) {{
            window.__CHAMPIONSHIP_BOUNDARY_CALLS__.indexedDb.push(['open', String(args[0])]);
            return original.idbOpen(...args);
          }};
          indexedDB.deleteDatabase = function(...args) {{
            window.__CHAMPIONSHIP_BOUNDARY_CALLS__.indexedDb.push(['deleteDatabase', String(args[0])]);
            return original.idbDelete(...args);
          }};
          if (original.beacon) navigator.sendBeacon = function(...args) {{
            window.__CHAMPIONSHIP_BOUNDARY_CALLS__.beacon.push(String(args[0]));
            return original.beacon(...args);
          }};
        }})()"""
    )


def attach_errors(page):
    errors = []

    def on_console(message):
        if message.type != "error":
            return
        location = message.location or {}
        if ("pixi.min.js" in message.text or location.get("url") == PIXI_CDN) and "ERR_FAILED" in message.text:
            return
        errors.append(message.text)

    page.on("console", on_console)
    page.on("pageerror", lambda error: errors.append(str(error)))
    return errors


def click_action(page, text):
    button = page.get_by_role("button", name=text, exact=True)
    button.wait_for(state="visible", timeout=15_000)
    button.click()


def full_flow(page):
    click_action(page, "Enter research gate")
    click_action(page, "Moonlit Reed Gate")
    page.wait_for_function("() => document.querySelector('#championship-root')?.dataset.phase === 'HUNT_FIELD'")
    for key in ["ArrowDown", *(["ArrowRight"] * 9), "ArrowUp", "ArrowUp"]:
        page.keyboard.press(key)
    page.wait_for_function("() => document.querySelector('#championship-root')?.dataset.phase === 'WILD_ENCOUNTER'")
    click_action(page, "Prepare capture")
    click_action(page, "Register capture")
    click_action(page, "Open research collection")
    click_action(page, "Visit field shop")
    click_action(page, "Reed Tonic · 20 mist")
    click_action(page, "Leave for Arena")
    click_action(page, "Select Reedlight Trial")
    click_action(page, "Begin match")
    for _ in range(4):
        click_action(page, "Comet Pounce")
    click_action(page, "Complete research run")
    page.wait_for_function("() => document.querySelector('#championship-root')?.dataset.phase === 'COMPLETE'")


def layout_snapshot(page):
    return page.evaluate(
        """() => ({
          width: innerWidth,
          height: innerHeight,
          overflow: document.documentElement.scrollWidth - innerWidth,
          canvasCount: document.querySelectorAll('#championship-canvas-host canvas').length,
          buttonSizes: [...document.querySelectorAll('[data-championship-action]')].map((button) => {
            const rect = button.getBoundingClientRect();
            return { width: rect.width, height: rect.height, text: button.textContent.trim() };
          }),
          phase: document.querySelector('#championship-root')?.dataset.phase || null,
          fallbackVisible: !document.querySelector('#championship-canvas-fallback')?.hidden,
          hudTextOverlaps: (() => {
            const nodes = [...document.querySelectorAll('.championship-phase-pill, .championship-hud-stats dt, .championship-hud-stats dd, .championship-meter__label')];
            const entries = nodes.map((node) => {
              const range = document.createRange();
              range.selectNodeContents(node);
              return { text: node.textContent.trim(), rect: range.getBoundingClientRect() };
            }).filter((entry) => entry.rect.width > 0 && entry.rect.height > 0);
            const overlaps = [];
            for (let left = 0; left < entries.length; left += 1) {
              for (let right = left + 1; right < entries.length; right += 1) {
                const a = entries[left];
                const b = entries[right];
                const width = Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left);
                const height = Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top);
                if (width > 1 && height > 1) overlaps.push([a.text, b.text]);
              }
            }
            return overlaps;
          })(),
          reducedTransition: document.querySelector('.championship-action')
            ? getComputedStyle(document.querySelector('.championship-action')).transitionDuration
            : null
        })"""
    )


def run_disabled(browser, base_url, report):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    install_production_canary(context)
    page = context.new_page()
    errors = attach_errors(page)
    requests = []
    page.on("request", lambda request: requests.append(request.url))
    page.goto(f"{base_url}/research/championship-r1/index.html", wait_until="domcontentloaded", timeout=30_000)
    page.wait_for_selector("#championship-research-status:not([hidden])")
    championship_module_requests = [url for url in requests if "/src/championship/" in url or "/src/data/championship/" in url]
    check(report, "default_off_notice_visible", page.locator("#championship-research-status").is_visible())
    check(report, "default_off_root_hidden", page.locator("#championship-root").is_hidden())
    check(report, "default_off_zero_championship_module_requests", not championship_module_requests, championship_module_requests)
    check(report, "default_off_zero_state_reader_requests", not any("/src/state/saveManager.js" in url for url in requests), requests)
    check(report, "default_off_zero_pixi_requests", not any("pixi" in url.lower() for url in requests), requests)
    check(report, "default_off_zero_canvas", page.locator("canvas").count() == 0)
    check(report, "default_off_zero_boundary_calls", all(not calls for calls in page.evaluate("() => window.__CHAMPIONSHIP_BOUNDARY_CALLS__").values()))
    check(report, "default_off_no_console_errors", errors == [], errors)
    context.close()


def run_enabled_fallback(browser, base_url, report, width, height, font_scale=1.0, reduced_motion=False):
    context = browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce" if reduced_motion else "no-preference",
    )
    install_production_canary(context)
    page = context.new_page()
    errors = attach_errors(page)
    page.route(PIXI_CDN, lambda route: route.abort("failed"))
    page.goto(f"{base_url}/research/championship-r1/index.html?championshipResearch=r1", wait_until="domcontentloaded", timeout=30_000)
    page.wait_for_selector('[data-championship-action="ACCEPT_PROFILE"]', state="visible", timeout=30_000)
    page.wait_for_function("() => Boolean(window.__NEXUS_CHAMPIONSHIP_R1__)", timeout=30_000)
    check(report, f"fallback_{width}x{height}_{font_scale}_disabled_notice_hidden", page.locator("#championship-research-status").is_hidden())
    before_raw = page.evaluate(f"() => localStorage.getItem({json.dumps(STORAGE_KEY)})")
    if font_scale != 1.0:
        page.evaluate("scale => { document.documentElement.style.fontSize = `${scale * 100}%`; }", font_scale)
    initial_layout = layout_snapshot(page)
    full_flow(page)
    complete_layout = layout_snapshot(page)
    snapshot = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R1__.runtime.getSnapshot()")
    after_raw = page.evaluate(f"() => localStorage.getItem({json.dumps(STORAGE_KEY)})")
    boundary_calls = page.evaluate("() => window.__CHAMPIONSHIP_BOUNDARY_CALLS__")
    check(report, f"fallback_{width}x{height}_{font_scale}_complete", snapshot["session"]["phase"] == "COMPLETE", {"phase": snapshot["session"]["phase"], "revision": snapshot["revision"], "events": len(snapshot["eventLog"])})
    check(report, f"fallback_{width}x{height}_{font_scale}_dom_fallback", initial_layout["fallbackVisible"] and initial_layout["canvasCount"] == 0, initial_layout)
    check(report, f"fallback_{width}x{height}_{font_scale}_no_horizontal_overflow", initial_layout["overflow"] <= 1 and complete_layout["overflow"] <= 1, {"initial": initial_layout, "complete": complete_layout})
    check(report, f"fallback_{width}x{height}_{font_scale}_hud_text_no_overlap", initial_layout["hudTextOverlaps"] == [] and complete_layout["hudTextOverlaps"] == [], {"initial": initial_layout["hudTextOverlaps"], "complete": complete_layout["hudTextOverlaps"]})
    check(report, f"fallback_{width}x{height}_{font_scale}_touch_targets", all(item["height"] >= 44 for item in initial_layout["buttonSizes"]), initial_layout["buttonSizes"])
    check(report, f"fallback_{width}x{height}_{font_scale}_production_save_raw_unchanged", before_raw == after_raw, {"before": hashlib.sha256(before_raw.encode()).hexdigest(), "after": hashlib.sha256(after_raw.encode()).hexdigest()})
    check(report, f"fallback_{width}x{height}_{font_scale}_zero_storage_network_calls", all(not calls for calls in boundary_calls.values()), boundary_calls)
    check(report, f"fallback_{width}x{height}_{font_scale}_research_boundaries", snapshot["economy"]["source"] == "RESEARCH_FIXTURE" and snapshot["collection"]["authority"] == "RESEARCH_FIXTURE" and snapshot["results"][0]["committable"] is False, snapshot["results"])
    if reduced_motion:
        duration = initial_layout["reducedTransition"]
        check(report, f"fallback_{width}x{height}_reduced_motion", duration in ("0s", "1e-06s", "0.001ms"), duration)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(OUTPUT_DIR / f"championship-r1-fallback-{width}x{height}-font{int(font_scale * 100)}.png"), full_page=True)
    page.evaluate("() => { window.__NEXUS_CHAMPIONSHIP_R1__.dispose(); window.__NEXUS_CHAMPIONSHIP_R1__.dispose(); }")
    check(report, f"fallback_{width}x{height}_{font_scale}_dispose_clears_mount", page.locator("#championship-root").evaluate("root => root.childElementCount") == 0 and page.locator("canvas").count() == 0)
    check(report, f"fallback_{width}x{height}_{font_scale}_no_console_errors", errors == [], errors)
    context.close()


def run_enabled_pixi(browser, base_url, report):
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    install_production_canary(context)
    page = context.new_page()
    errors = attach_errors(page)
    page.goto(f"{base_url}/research/championship-r1/index.html?championshipResearch=r1", wait_until="domcontentloaded", timeout=30_000)
    page.wait_for_selector('[data-championship-action="ACCEPT_PROFILE"]', state="visible", timeout=30_000)
    page.wait_for_selector("#championship-canvas-host canvas", state="visible", timeout=60_000)
    check(report, "pixi_disabled_notice_hidden", page.locator("#championship-research-status").is_hidden())
    pixi_script = page.locator('script[data-championship-pixi="r1"]')
    check(report, "pixi_script_has_pinned_sri_and_anonymous_cors", pixi_script.count() == 1 and pixi_script.get_attribute("integrity") == "sha384-zdhGmV2SoYr+2tn3rLxuKWeeNdIcsEK3qFdEqFlmHOPdYCbq++efc+FP7DE8r4kC" and pixi_script.get_attribute("crossorigin") == "anonymous" and pixi_script.get_attribute("referrerpolicy") == "no-referrer")
    check(report, "pixi_exactly_one_decorative_canvas", page.locator("#championship-canvas-host canvas").count() == 1)
    check(report, "pixi_canvas_hidden_from_accessibility", page.locator("#championship-canvas-host canvas").get_attribute("aria-hidden") == "true" and page.locator("#championship-canvas-host canvas").get_attribute("tabindex") == "-1")
    for _ in range(3):
        page.reload(wait_until="domcontentloaded", timeout=30_000)
        page.wait_for_selector("#championship-canvas-host canvas", state="visible", timeout=60_000)
        check(report, f"pixi_reload_mount_single_canvas_{_ + 1}", page.locator("#championship-canvas-host canvas").count() == 1)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(OUTPUT_DIR / "championship-r1-pixi-1280x900.png"), full_page=True)
    page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R1__.dispose()")
    check(report, "pixi_dispose_removes_canvas", page.locator("canvas").count() == 0)
    check(report, "pixi_no_console_errors", errors == [], errors)
    context.close()


def run_preexisting_pixi_rejection(browser, base_url, report):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    install_production_canary(context)
    context.add_init_script("window.PIXI = { Application: function UntrustedPixi() {} };")
    page = context.new_page()
    errors = attach_errors(page)
    requests = []
    page.on("request", lambda request: requests.append(request.url))
    page.goto(f"{base_url}/research/championship-r1/index.html?championshipResearch=r1", wait_until="domcontentloaded", timeout=30_000)
    page.wait_for_selector('[data-championship-action="ACCEPT_PROFILE"]', state="visible", timeout=30_000)
    page.wait_for_function("() => Boolean(window.__NEXUS_CHAMPIONSHIP_R1__)", timeout=30_000)
    fallback = page.locator("#championship-canvas-fallback")
    check(report, "preexisting_pixi_global_zero_cdn_request", not any(url == PIXI_CDN for url in requests), requests)
    check(report, "preexisting_pixi_global_uses_safe_dom_fallback", fallback.is_visible() and "Safe DOM game flow" in fallback.text_content() and page.locator("canvas").count() == 0)
    check(report, "preexisting_pixi_global_zero_boundary_calls", all(not calls for calls in page.evaluate("() => window.__CHAMPIONSHIP_BOUNDARY_CALLS__").values()))
    check(report, "preexisting_pixi_global_no_console_errors", errors == [], errors)
    page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R1__.dispose()")
    context.close()


def main():
    global BASE_URL
    server = None
    thread = None
    if not BASE_URL:
        class QuietHandler(SimpleHTTPRequestHandler):
            def log_message(self, format, *args):
                return

        repo_root = Path(__file__).resolve().parents[2]
        handler = partial(QuietHandler, directory=str(repo_root))
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        BASE_URL = f"http://127.0.0.1:{server.server_port}"
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()

    report = {"checks": [], "outputDir": str(OUTPUT_DIR)}
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            run_disabled(browser, BASE_URL, report)
            run_enabled_fallback(browser, BASE_URL, report, 320, 640)
            run_enabled_fallback(browser, BASE_URL, report, 390, 844)
            run_enabled_fallback(browser, BASE_URL, report, 1280, 900)
            run_enabled_fallback(browser, BASE_URL, report, 390, 844, font_scale=2.0, reduced_motion=True)
            run_preexisting_pixi_rejection(browser, BASE_URL, report)
            run_enabled_pixi(browser, BASE_URL, report)
            browser.close()
    finally:
        if server:
            server.shutdown()
            server.server_close()
        if thread:
            thread.join(timeout=2)

    failures = [item for item in report["checks"] if not item["ok"]]
    report["summary"] = {"total": len(report["checks"]), "passed": len(report["checks"]) - len(failures), "failed": len(failures), "ok": not failures}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if not failures else 1)


if __name__ == "__main__":
    main()
