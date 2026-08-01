import json
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("NEXUS_QA_BASE", "")
STORAGE_KEY = "nexusLinkR2State:v1"
OUTPUT_DIR = Path(os.environ.get("NEXUS_QA_OUTPUT", "output/qa/standoff-resonance-r2"))


def install_seed(context):
    context.add_init_script(
        script=f"""(() => {{
          if (!['http:', 'https:'].includes(location.protocol)) return;
          const now = Date.now();
          localStorage.setItem({json.dumps(STORAGE_KEY)}, JSON.stringify({{
            playerProfile: {{ displayName: 'R2 QA', identitySkipped: false, createdAt: now, updatedAt: now }},
            onboarding: {{
              status: 'completed', completed: true, completedAt: now,
              identityCompleted: true, guidanceCompleted: true, greyshadeMetAt: now,
              veteranAutoCompleted: false, firstLoop: {{ completedAt: now }}
            }},
            firstSessionOpeningSeenAt: now,
            activeCompanionId: 'greyshade-cat',
            unlockedCompanionIds: ['greyshade-cat', 'sprigfawn', 'auriowl'],
            resonance: {{
              companions: {{
                sprigfawn: {{ joinedAt: now - 2000 }},
                auriowl: {{ joinedAt: now - 1000 }}
              }},
              chapterMarks: {{}}
            }},
            activityProgress: {{
              version: 1,
              orbit: {{ clearedStageIds: [] }},
              standoff: {{ clearedScenarioIds: ['rift_observatory'] }},
              expedition: {{ clearedRouteIds: [] }}
            }},
            firstTouchCompleted: true,
            firstHugCompleted: true,
            energy: 8,
            mood: 'calm',
            defense: 20,
            touchFatigue: 0,
            lastTouchReaction: '',
            habitatTraces: [{{
              id: 'htrace_r2_qa', memoryId: 'emem_r2_qa', companionId: 'greyshade-cat',
              type: 'em_fresh_warm', createdAt: now, lastSeenAt: now
            }}]
          }}));
        }})()"""
    )


def create_controller(page):
    return page.evaluate(
        """async () => {
          const store = await import('/src/state/store.js');
          const { createPanelManager } = await import('/src/ui/panelManager.js');
          const { createBattleController } = await import('/src/ui/battleController.js');
          const { createCompanionGrowthController } = await import('/src/ui/companionGrowthController.js');
          const seeded = JSON.parse(localStorage.getItem('nexusLinkR2State:v1') || '{}');
          store.replaceState({ ...store.getState(), ...seeded });
          const panelManager = createPanelManager();
          const saves = { count: 0 };
          const controller = createBattleController({
            store,
            panelManager,
            soulTalkController: {
              addChat() {}, renderChat() {}, openSoulTalk() {}, reflectOnMemory() {}
            },
            saveCurrentState: () => { saves.count += 1; return { ok: true }; },
            statusText: document.querySelector('#status-text'),
            companionGrowthController: createCompanionGrowthController()
          });
          controller.bind();
          window.__R2_QA = {
            controller,
            panelManager,
            store,
            saves,
            beforePractice: JSON.stringify(store.getState())
          };
          controller.startBattle({ enemyId: 'static_wisp', nodeId: 'rift_observatory' });
          return true;
        }"""
    )


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


def inspect_layout(page):
    return page.evaluate(
        """() => {
          const panel = document.querySelector('[data-panel="battle"]');
          const stage = document.querySelector('.standoff-circle-stage');
          const controls = document.querySelector('.standoff-autonomy-controls');
          const rect = (element) => element ? element.getBoundingClientRect().toJSON() : null;
          const buttons = [...document.querySelectorAll(
            '.standoff-autonomy-controls button:not([hidden]), #standoff-action-row button:not([hidden]), .sr2-prep-actions button'
          )].filter((button) => !button.closest('[hidden]')).map((button) => ({
            text: button.textContent.trim(), width: rect(button).width, height: rect(button).height
          }));
          return {
            viewport: { width: innerWidth, height: innerHeight },
            documentOverflow: document.documentElement.scrollWidth - innerWidth,
            panelOverflow: panel ? panel.scrollWidth - panel.clientWidth : null,
            panel: rect(panel), stage: rect(stage), controls: rect(controls), buttons,
            canvasCount: document.querySelectorAll('[data-standoff-circle-canvas="true"]').length,
            memberCanvasVisible: Boolean(stage && getComputedStyle(stage).display !== 'none')
          };
        }"""
    )


def run_viewport(browser, width, height, font_scale=1.0):
    context = browser.new_context(viewport={"width": width, "height": height})
    install_seed(context)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    # Isolate the controller surface from the production boot sequence and CDN.
    # The controller imports below remain real local modules; the full app boot is
    # covered by the repository release gates.
    page.route("**/src/app.js", lambda route: route.fulfill(
        status=200, content_type="application/javascript", body=""
    ))
    # The production shell loads pinned CDN modules. Their open connections are
    # irrelevant to this isolated controller gate, so wait for the document
    # instead of waiting for the network to become globally idle.
    page.goto(BASE_URL, wait_until="domcontentloaded", timeout=60_000)
    page.wait_for_selector("body", state="visible")
    page.evaluate(
        """() => {
          const loading = document.querySelector('#first-session-loading');
          if (loading) { loading.hidden = true; loading.style.display = 'none'; }
          const pixiFailure = document.querySelector('#pixi-load-failure');
          if (pixiFailure) pixiFailure.hidden = true;
        }"""
    )
    if font_scale != 1.0:
        page.evaluate("scale => { document.documentElement.style.fontSize = `${scale * 100}%`; }", font_scale)
    create_controller(page)
    page.wait_for_timeout(120)
    prep = page.locator('.standoff-preparation')
    if prep.count() == 0 or not prep.is_visible():
        diagnostics = page.evaluate(
            """() => ({
              prepHidden: document.querySelector('.standoff-preparation')?.hidden,
              battleHidden: document.querySelector('[data-panel="battle"]')?.hidden,
              battleClass: document.querySelector('[data-panel="battle"]')?.className,
              state: window.__R2_QA?.store?.getState?.(),
              bodyText: document.body.innerText.slice(0, 1200)
            })"""
        )
        raise AssertionError(f"preparation did not open; diagnostics={diagnostics}; errors={errors}")

    # Safety may become terminal while the invitation surface is open but
    # before any standoff session exists. No invitation variant may remain.
    prep_safe_result = page.evaluate(
        """() => {
          const qa = window.__R2_QA;
          const savesBefore = qa.saves.count;
          qa.store.updateState((draft) => { draft.safeHarborMode = true; });
          return { savesBefore };
        }"""
    )
    page.wait_for_selector('.standoff-preparation', state='hidden')
    assert_true(page.locator('[data-panel="battle"]').is_hidden(), "safe harbor during preparation must close the battle panel")
    assert_true(page.locator('[data-standoff-circle-canvas="true"]').count() == 0, "preparation safety terminal must not create a session renderer")
    assert_true(page.locator('.sr2-invite[aria-pressed="true"]').count() == 0, "preparation safety terminal must retain no invitation selection")
    assert_true(page.evaluate("() => window.__R2_QA.saves.count") == prep_safe_result["savesBefore"], "preparation safety terminal must not save")
    page.evaluate(
        """() => {
          const qa = window.__R2_QA;
          qa.store.updateState((draft) => { draft.safeHarborMode = false; });
          qa.controller.startBattle({ enemyId: 'static_wisp', nodeId: 'rift_observatory' });
        }"""
    )
    page.wait_for_selector('.standoff-preparation:not([hidden])')

    start_button = page.locator('.sr2-prep-actions .is-primary')
    assert_true(start_button.is_disabled(), "preparation must require an explicit control-mode choice")
    assert_true(page.locator('.sr2-invite[aria-pressed="true"]').count() == 0, "preparation must not auto-fill invitations")
    invite_buttons = page.locator('.sr2-invite')
    assert_true(invite_buttons.count() >= 2, "fixture must expose two eligible supporters")
    invite_buttons.nth(0).click()
    invite_buttons.nth(1).click()
    assert_true(page.locator('.sr2-invite[aria-pressed="true"]').count() == 2, "preparation may select at most two explicit invites")
    practice_buttons = page.locator('[data-practice-variant]')
    assert_true(practice_buttons.count() == 4, "cleared node must expose standard plus three zero-reward variants")
    page.locator('[data-practice-variant="cross_current"]').click()
    page.locator('[data-control-mode="entrusted"]').click()
    assert_true(not start_button.is_disabled(), "explicit entrusted choice should enable start")
    start_button.click()
    page.wait_for_selector('.standoff-circle-stage:not([hidden])')
    page.wait_for_selector('.standoff-autonomy-controls:not([hidden])')
    first_guide = page.locator('.standoff-first-guide .sfg-continue')
    if first_guide.count() and first_guide.is_visible():
        first_guide.click()
    page.locator('.standoff-autonomy-controls [data-role="pause"]').click()
    page.wait_for_timeout(80)

    layout = inspect_layout(page)
    assert_true(layout["documentOverflow"] <= 1, f"document horizontal overflow: {layout}")
    assert_true(layout["panelOverflow"] <= 1, f"battle panel horizontal overflow: {layout}")
    assert_true(layout["canvasCount"] == 1, f"expected one dedicated canvas: {layout}")
    assert_true(all(item["height"] >= 44 for item in layout["buttons"]), f"touch target below 44px: {layout}")
    assert_true(page.locator('#standoff-action-row').is_hidden(), "entrusted mode must hide manual action row")

    page.locator('.standoff-autonomy-controls [data-role="request"]').click()
    page.wait_for_selector('.standoff-request-sheet:not([hidden])')
    assert_true(page.locator('.standoff-request-sheet .sr2-request-targets button').count() == 3, "request should target lead or active supports")
    page.locator('.standoff-request-sheet .sr2-request-grid button').nth(0).click()
    page.wait_for_selector('.standoff-request-sheet', state="hidden")
    assert_true(page.locator('.standoff-autonomy-controls [data-role="request"]').is_disabled(), "request must be consumed once")

    page.locator('.standoff-autonomy-controls [data-role="pause"]').click()
    page.locator('.standoff-autonomy-controls [data-role="takeover"]').click()
    assert_true(page.locator('#standoff-action-row').is_visible(), "takeover should reveal existing manual actions")
    assert_true(page.locator('#standoff-act-retreat').is_enabled(), "retreat must remain available")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    suffix = f"{width}x{height}" + ("-font200" if font_scale == 2 else "")
    page.screenshot(path=str(OUTPUT_DIR / f"standoff-r2-{suffix}.png"), full_page=True)

    page.locator('#standoff-act-retreat').click()
    page.wait_for_selector('#battle-finish:not([hidden])')
    practice_after = page.evaluate(
        """() => ({
          state: JSON.stringify(window.__R2_QA.store.getState()),
          saves: window.__R2_QA.saves.count,
          before: window.__R2_QA.beforePractice
        })"""
    )
    assert_true(practice_after["state"] == practice_after["before"], "practice variant must keep canonical state unchanged")
    assert_true(practice_after["saves"] == 0, "practice variant must not save")
    page.locator('#battle-finish').click()
    page.wait_for_timeout(100)
    assert_true(page.locator('[data-standoff-circle-canvas="true"]').count() == 0, "finish must destroy renderer canvas")

    # A safety terminal may activate while the 1.2 s autonomous telegraph is
    # already pending. It must cancel that callback and leave only retreat.
    page.evaluate(
        """() => window.__R2_QA.controller.startBattle({
          enemyId: 'static_wisp', nodeId: 'rift_observatory'
        })"""
    )
    page.wait_for_selector('.standoff-preparation:not([hidden])')
    page.locator('[data-control-mode="entrusted"]').click()
    page.locator('.sr2-prep-actions .is-primary').click()
    page.wait_for_selector('.standoff-autonomy-controls:not([hidden])')
    terminal_started = page.evaluate(
        """() => {
          const qa = window.__R2_QA;
          qa.store.updateState((draft) => { draft.safeHarborMode = true; });
          return {
            log: document.querySelector('#battle-log')?.textContent || '',
            noise: document.querySelector('#standoff-noise-text')?.textContent || '',
            stability: document.querySelector('#standoff-stability-text')?.textContent || '',
            saves: qa.saves.count
          };
        }"""
    )
    page.wait_for_timeout(1350)
    terminal_after_delay = page.evaluate(
        """() => ({
          log: document.querySelector('#battle-log')?.textContent || '',
          noise: document.querySelector('#standoff-noise-text')?.textContent || '',
          stability: document.querySelector('#standoff-stability-text')?.textContent || '',
          saves: window.__R2_QA.saves.count
        })"""
    )
    assert_true(terminal_started == terminal_after_delay, "safe harbor during telegraph must stop all delayed gameplay mutation")
    for role in ('pause', 'takeover', 'request'):
        assert_true(page.locator(f'.standoff-autonomy-controls [data-role="{role}"]').is_disabled(), f"safe terminal must disable {role}")
    assert_true(page.locator('.standoff-autonomy-controls [data-role="retreat"]').is_enabled(), "safe terminal must preserve retreat")
    terminal_telegraph = page.evaluate(
        """() => {
          const el = document.querySelector('.standoff-telegraph');
          return { exists: Boolean(el), hidden: el?.hidden, display: el ? getComputedStyle(el).display : null };
        }"""
    )
    assert_true(
        terminal_telegraph["exists"] and terminal_telegraph["hidden"] and terminal_telegraph["display"] == "none",
        f"safe terminal must hide the next-beat telegraph: {terminal_telegraph}"
    )
    page.locator('.standoff-autonomy-controls [data-role="retreat"]').click()
    page.wait_for_selector('#battle-finish:not([hidden])')
    page.locator('#battle-finish').click()
    page.wait_for_timeout(80)

    safe_result = page.evaluate(
        """() => {
          const qa = window.__R2_QA;
          qa.store.updateState((draft) => { draft.safeHarborMode = true; });
          const before = JSON.stringify(qa.store.getState());
          const savesBefore = qa.saves.count;
          qa.controller.startBattle({ enemyId: 'static_wisp', nodeId: 'moonlake-rift' });
          return { before, savesBefore };
        }"""
    )
    assert_true(page.locator('.standoff-preparation').is_hidden(), "safe harbor must not emit preparation variants")
    for action_id in ('resonance', 'barrier', 'pulse'):
        assert_true(page.locator(f'#standoff-act-{action_id}').is_disabled(), f"safe harbor start must disable {action_id}")
    assert_true(page.locator('#standoff-act-retreat').is_enabled(), "safe harbor start must preserve retreat")
    assert_true(page.locator('.standoff-telegraph').is_hidden(), "safe harbor start must not expose a gameplay telegraph")
    page.locator('#standoff-act-retreat').click()
    page.wait_for_selector('#battle-finish:not([hidden])')
    safe_after = page.evaluate(
        """() => ({
          after: JSON.stringify(window.__R2_QA.store.getState()),
          savesAfter: window.__R2_QA.saves.count
        })"""
    )
    assert_true(safe_result["before"] == safe_after["after"], "safe harbor standoff must leave runtime state untouched")
    assert_true(safe_result["savesBefore"] == safe_after["savesAfter"], "safe harbor standoff must not save")
    page.locator('#battle-finish').click()
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

    results = []
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            for width, height, font_scale in [
                (390, 844, 1.0),
                (390, 664, 1.0),
                (1280, 900, 1.0),
                (390, 844, 2.0),
            ]:
                results.append(run_viewport(browser, width, height, font_scale))
            browser.close()
    finally:
        if server:
            server.shutdown()
            server.server_close()
        if server_thread:
            server_thread.join(timeout=2)
    print(json.dumps({"total": len(results), "failed": 0, "layouts": results}, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
