import json
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("NEXUS_QA_BASE", "")
OUTPUT_DIR = Path(os.environ.get("NEXUS_QA_OUTPUT", "output/qa/resonance-weave-r2"))


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


def mount_controller(page, reduced_motion=False):
    return page.evaluate(
        """async ({ reducedMotion }) => {
          document.body.innerHTML = '';
          document.body.style.margin = '0';
          document.body.style.padding = '8px';
          document.body.style.boxSizing = 'border-box';
          document.body.style.background = '#06131f';
          const shell = document.createElement('main');
          shell.style.inlineSize = 'min(100%, 700px)';
          shell.style.marginInline = 'auto';
          const host = document.createElement('div');
          host.id = 'weave-qa-host';
          shell.appendChild(host);
          document.body.appendChild(shell);
          const { createResonanceWeaveController } = await import('/src/ui/resonanceWeaveController.js');
          const phaseChanges = [];
          const controller = createResonanceWeaveController({
            setTimePhase: (phaseId) => phaseChanges.push(phaseId),
            getTimePhase: () => 'day',
            isReducedMotion: () => reducedMotion
          });
          const opened = controller.open({
            host,
            nodeId: 'moonlake-water-qa',
            seed: 'resonance-weave-browser-gate',
            phaseId: 'day',
            companionId: 'greyshade-cat',
            onExit: () => { host.dataset.exited = 'true'; }
          });
          window.__WEAVE_QA = { controller, host, phaseChanges };
          return { opened, diagnostics: controller.getDiagnostics() };
        }""",
        {"reducedMotion": reduced_motion},
    )


def layout_snapshot(page):
    return page.evaluate(
        """() => {
          const root = document.querySelector('.resonance-weave');
          const buttons = [...document.querySelectorAll('.resonance-weave button')]
            .filter((button) => !button.hidden)
            .map((button) => {
              const rect = button.getBoundingClientRect();
              return { text: button.textContent.trim(), width: rect.width, height: rect.height };
            });
          return {
            viewport: { width: innerWidth, height: innerHeight },
            documentOverflow: document.documentElement.scrollWidth - innerWidth,
            rootOverflow: root ? root.scrollWidth - root.clientWidth : None,
            buttons,
            knotCount: document.querySelectorAll('[data-weave-knot]').length,
            phaseCount: document.querySelectorAll('[data-phase-id]').length,
            status: root?.dataset.status || null,
            boardHeight: document.querySelector('.resonance-weave__lake')?.getBoundingClientRect().height || 0
          };
        }""".replace("None", "null")
    )


def knot_geometry(page, selector):
    return page.eval_on_selector(
        selector,
        """(group) => {
          const matrix = group.getScreenCTM();
          const svg = group.ownerSVGElement;
          const point = (x, y) => {
            const p = svg.createSVGPoint();
            p.x = x; p.y = y;
            const transformed = p.matrixTransform(matrix);
            return { x: transformed.x, y: transformed.y };
          };
          const center = point(0, 0);
          const ring = point(100, 0);
          const current = group.querySelector('.resonance-weave__current');
          const cx = Number(current?.getAttribute('x2') || 46) / 46;
          const cy = Number(current?.getAttribute('y2') || 0) / 46;
          return {
            center,
            radius: Math.hypot(ring.x - center.x, ring.y - center.y),
            dragEnd: point(-cx * 140, -cy * 86.8)
          };
        }""",
    )


def perform_mouse_cycle(page):
    geometry = knot_geometry(page, ".resonance-weave__knot.is-focused")
    center = geometry["center"]
    radius = geometry["radius"]
    page.mouse.move(center["x"] + radius, center["y"])
    page.mouse.down()
    for index in range(1, 17):
        angle = 2 * 3.141592653589793 * index / 16
        page.mouse.move(
            center["x"] + radius * __import__("math").cos(angle),
            center["y"] + radius * __import__("math").sin(angle),
            steps=2,
        )
    page.mouse.up()
    assert_true(page.locator(".resonance-weave__knot.is-circled").count() == 1, "mouse circle did not advance")

    geometry = knot_geometry(page, ".resonance-weave__knot.is-circled")
    page.mouse.move(geometry["center"]["x"], geometry["center"]["y"])
    page.mouse.down()
    page.mouse.move(geometry["dragEnd"]["x"], geometry["dragEnd"]["y"], steps=8)
    page.mouse.up()
    assert_true(page.locator(".resonance-weave__knot.is-stable").count() == 1, "mouse reverse-current drag did not advance")

    geometry = knot_geometry(page, ".resonance-weave__knot.is-stable")
    page.mouse.click(geometry["center"]["x"], geometry["center"]["y"])
    assert_true(page.locator(".resonance-weave__knot.is-released").count() == 1, "mouse release did not advance")


def dispatch_touch_step(page, step):
    return page.evaluate(
        """step => {
          const selector = step === 'circle'
            ? '.resonance-weave__knot.is-focused'
            : step === 'drag'
              ? '.resonance-weave__knot.is-circled'
              : '.resonance-weave__knot.is-stable';
          const group = document.querySelector(selector);
          if (!group) return false;
          const svg = group.ownerSVGElement;
          const matrix = group.getScreenCTM();
          const point = (x, y) => {
            const p = svg.createSVGPoint(); p.x = x; p.y = y;
            const transformed = p.matrixTransform(matrix);
            return { x: transformed.x, y: transformed.y };
          };
          const emit = (target, type, position, buttons) => target.dispatchEvent(new PointerEvent(type, {
            bubbles: true, cancelable: true, pointerId: 77, pointerType: 'touch', isPrimary: true,
            buttons, clientX: position.x, clientY: position.y
          }));
          const center = point(0, 0);
          if (step === 'circle') {
            const points = [];
            for (let index = 0; index <= 16; index += 1) {
              const angle = Math.PI * 2 * index / 16;
              points.push(point(Math.cos(angle) * 100, Math.sin(angle) * 100));
            }
            emit(group, 'pointerdown', points[0], 1);
            points.slice(1, -1).forEach((position) => emit(svg, 'pointermove', position, 1));
            emit(svg, 'pointerup', points.at(-1), 0);
            return true;
          }
          if (step === 'drag') {
            const current = group.querySelector('.resonance-weave__current');
            const cx = Number(current?.getAttribute('x2') || 46) / 46;
            const cy = Number(current?.getAttribute('y2') || 0) / 46;
            const end = point(-cx * 140, -cy * 86.8);
            emit(group, 'pointerdown', center, 1);
            emit(svg, 'pointermove', end, 1);
            emit(svg, 'pointerup', end, 0);
            return true;
          }
          emit(group, 'pointerdown', center, 1);
          emit(svg, 'pointerup', center, 0);
          return true;
        }""",
        step,
    )


def finish_with_keyboard(page):
    guard = 0
    while page.locator(".resonance-weave").get_attribute("data-status") == "active" and guard < 24:
        page.locator(".resonance-weave__lake").focus()
        page.keyboard.press("Enter")
        guard += 1
    assert_true(page.locator(".resonance-weave").get_attribute("data-status") == "completed", "keyboard did not complete weave")


def run_viewport(browser, width, height, font_scale=1.0, reduced_motion=False, full_inputs=False):
    context = browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce" if reduced_motion else "no-preference",
        has_touch=True,
    )
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.route("**/src/app.js", lambda route: route.fulfill(status=200, content_type="application/javascript", body=""))
    page.route("https://**", lambda route: route.abort())
    page.goto(BASE_URL, wait_until="domcontentloaded", timeout=60_000)
    if font_scale != 1.0:
        page.evaluate("scale => { document.documentElement.style.fontSize = `${scale * 100}%`; }", font_scale)

    mounted = mount_controller(page, reduced_motion)
    assert_true(mounted["opened"], "controller failed to open")
    layout = layout_snapshot(page)
    assert_true(layout["documentOverflow"] <= 1, f"document overflow: {layout}")
    assert_true((layout["rootOverflow"] or 0) <= 1, f"component overflow: {layout}")
    assert_true(layout["phaseCount"] == 4, f"missing phase choices: {layout}")
    assert_true(4 <= layout["knotCount"] <= 7, f"unexpected knot count: {layout}")
    assert_true(all(button["height"] >= 48 for button in layout["buttons"]), f"touch target below 48px: {layout}")

    page.locator('[data-phase-id="night"]').click()
    assert_true(page.locator(".resonance-weave").get_attribute("data-phase") == "night", "phase did not switch")
    assert_true(page.evaluate("window.__WEAVE_QA.phaseChanges.at(-1)") == "night", "visual phase callback missing")
    page.get_by_role("button", name="開始整理環境微光").click()

    if full_inputs:
        perform_mouse_cycle(page)
        finish_with_keyboard(page)
        page.get_by_role("button", name="用同一片水流再整理一次").click()
        assert_true(dispatch_touch_step(page, "circle"), "touch circle dispatch failed")
        assert_true(page.locator(".resonance-weave__knot.is-circled").count() == 1, "touch circle did not advance")
        assert_true(dispatch_touch_step(page, "drag"), "touch drag dispatch failed")
        assert_true(page.locator(".resonance-weave__knot.is-stable").count() == 1, "touch drag did not advance")
        assert_true(dispatch_touch_step(page, "release"), "touch release dispatch failed")
        assert_true(page.locator(".resonance-weave__knot.is-released").count() == 1, "touch release did not advance")
    else:
        before_transform = page.locator(".resonance-weave__knot.is-focused").get_attribute("transform")
        page.get_by_role("button", name="圈住這束").click()
        page.get_by_role("button", name="沿逆流帶回").click()
        if reduced_motion:
            after_transform = page.locator(".resonance-weave__knot.is-stable").get_attribute("transform")
            assert_true(before_transform == after_transform, "reduced motion changed knot displacement")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    suffix = f"{width}x{height}" + ("-font200" if font_scale == 2 else "") + ("-reduced" if reduced_motion else "")
    page.screenshot(path=str(OUTPUT_DIR / f"weave-r2-{suffix}.png"), full_page=True)

    page.get_by_role("button", name="先離開，沒有損失").click()
    diagnostics = page.evaluate("window.__WEAVE_QA.controller.getDiagnostics()")
    assert_true(page.locator(".resonance-weave").count() == 0, "exit did not remove component")
    assert_true(diagnostics["listenerCount"] == 0 and diagnostics["timerCount"] == 0, f"lifecycle leak: {diagnostics}")
    assert_true(diagnostics["permanentWriteCount"] == 0, f"unexpected permanent write: {diagnostics}")
    assert_true(not errors, f"page errors: {errors}")
    context.close()
    return layout


def main():
    global BASE_URL
    server = None
    server_thread = None
    if not BASE_URL:
        class QuietHandler(SimpleHTTPRequestHandler):
            def log_message(self, format, *args):
                return

        repo_root = Path(__file__).resolve().parents[2]
        handler = partial(QuietHandler, directory=str(repo_root))
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        BASE_URL = f"http://127.0.0.1:{server.server_port}"
        server_thread = Thread(target=server.serve_forever, daemon=True)
        server_thread.start()

    layouts = []
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            layouts.append(run_viewport(browser, 390, 844, full_inputs=True))
            layouts.append(run_viewport(browser, 390, 664))
            layouts.append(run_viewport(browser, 1280, 900))
            layouts.append(run_viewport(browser, 390, 844, font_scale=2.0))
            layouts.append(run_viewport(browser, 390, 844, reduced_motion=True))
            browser.close()
    finally:
        if server:
            server.shutdown()
            server.server_close()
        if server_thread:
            server_thread.join(timeout=2)

    print(json.dumps({"total": len(layouts), "failed": 0, "layouts": layouts}, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
