"""Touch fatigue / reject daytime QA via dev preset. QA helper only."""
import json
import sys
import time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173?devPanel=1&devFirstTouch=1"
STORAGE_KEY = "nexusLinkR2State:v1"


def invoke_touch(page, touch_type="touch"):
    return page.evaluate("""async (type) => {
        const c = window.__NEXUS_TEST_COMPANION__;
        const ic = c && c.__interactionController;
        if (!ic) return { ok: false, reason: 'no_interaction_controller' };
        const result = await ic.handleTouch(type);
        return { ok: true, result };
    }""", touch_type)


def get_state(page):
    return page.evaluate(
        f"() => JSON.parse(localStorage.getItem('{STORAGE_KEY}') || '{{}}')"
    )


def run():
    results = {"console_errors": [], "checks": [], "summary": {}}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.on(
            "console",
            lambda msg: results["console_errors"].append(msg.text) if msg.type == "error" else None,
        )
        page.on("pageerror", lambda err: results["console_errors"].append(str(err)))

        page.add_init_script("""
            window.__FORCE_DAYTIME_QA__ = true;
            const originalShouldSleep = window.shouldSleep;
        """)

        page.goto(BASE, wait_until="networkidle", timeout=90000)
        time.sleep(2)

        prep = page.evaluate(f"""async () => {{
            const companion = window.__NEXUS_TEST_COMPANION__;
            const ic = companion && companion.__interactionController;
            const key = '{STORAGE_KEY}';
            const base = JSON.parse(localStorage.getItem(key) || '{{}}');
            base.lastInteractionAt = Date.now();
            base.touchFatigue = 0;
            base.firstTouchCompleted = true;
            base.mood = 'calm';
            base.spamScore = 0;
            localStorage.setItem(key, JSON.stringify(base));

            if (ic) {{
                ic.isAnimating = false;
                ic.spamScore = 0;
                try {{
                    await ic.playAnimation('idle_calm', true);
                }} catch (error) {{
                    /* animation optional in headless */
                }}
                ic.isAnimating = false;
            }}

            const {{ evaluateTouchReaction }} = await import('./src/engine/touchReactionEngine.js');
            const {{ getTouchPersonality }} = await import('./src/engine/personalityProfile.js');
            const personality = getTouchPersonality(companion || {{ name: '灰影貓' }});
            let engineState = {{ ...base }};
            const first = evaluateTouchReaction(engineState, personality, 'touch', Date.now(), companion?.name);
            engineState = {{ ...engineState, ...first.statePatch }};
            const second = evaluateTouchReaction(engineState, personality, 'touch', Date.now() + 1, companion?.name);
            const engineFatigueRise =
                (second.statePatch.touchFatigue || 0) > (first.statePatch.touchFatigue || 0);

            return {{
                ok: true,
                engineFatigueRise,
                engineFirstFatigue: first.statePatch.touchFatigue,
                engineSecondFatigue: second.statePatch.touchFatigue,
                hasController: Boolean(ic),
                currentAnimation: ic ? ic.getCurrentAnimationName() : 'n/a'
            }};
        }}""")
        time.sleep(0.5)

        pixi = page.evaluate("""() => ({
            canvas_count: document.querySelectorAll('#game-root canvas').length,
            has_controller: !!(window.__NEXUS_TEST_COMPANION__ && window.__NEXUS_TEST_COMPANION__.__interactionController)
        })""")

        before = get_state(page)
        first = invoke_touch(page, "touch")
        time.sleep(0.5)
        after_first = get_state(page)

        spam_results = []
        for _ in range(5):
            spam_results.append(invoke_touch(page, "touch"))
            time.sleep(0.15)
        after_spam = get_state(page)

        awakening = {
            "hasAwakeningMemory": any(
                m.get("source") == "first_awakening" or m.get("theme") == "心核初醒"
                for m in (after_first.get("emotionalMemories") or [])
            ),
            "firstTouchCompleted": bool(after_first.get("firstTouchCompleted")),
        }

        checks = [
            {
                "item": "interaction_controller_present",
                "ok": pixi.get("has_controller"),
                "detail": pixi,
            },
            {
                "item": "single_pixi_canvas",
                "ok": pixi.get("canvas_count") == 1,
                "detail": {"canvas_count": pixi.get("canvas_count")},
            },
            {
                "item": "first_touch_ok",
                "ok": first.get("ok") and not first.get("result", {}).get("blocked"),
                "detail": first,
            },
            {
                "item": "touch_fatigue_rises",
                "ok": prep.get("engineFatigueRise")
                    or (after_spam.get("touchFatigue") or 0) > (before.get("touchFatigue") or 0),
                "detail": {
                    "before": before.get("touchFatigue"),
                    "after_first": after_first.get("touchFatigue"),
                    "after_spam": after_spam.get("touchFatigue"),
                    "engine": prep,
                },
            },
            {
                "item": "reject_or_guarded_under_spam",
                "ok": any(
                    (r.get("result") or {}).get("reaction") in ("reject", "guarded_accept", "hesitate", "wake")
                    or (r.get("result") or {}).get("blocked")
                    for r in spam_results
                ),
                "detail": [r.get("result") for r in spam_results if r.get("ok")],
            },
            {
                "item": "awakening_gate_intact",
                "ok": awakening["firstTouchCompleted"] and not awakening["hasAwakeningMemory"],
                "detail": awakening,
            },
            {
                "item": "soul_talk_panel_present",
                "ok": page.locator("#message-input, [data-panel='soulTalk']").count() > 0,
                "detail": {},
            },
        ]

        results["checks"] = checks
        failed = [c for c in checks if not c.get("ok")]
        results["summary"] = {
            "total": len(checks),
            "passed": len(checks) - len(failed),
            "failed": len(failed),
            "console_error_count": len(results["console_errors"]),
            "ok": not failed and not results["console_errors"],
        }

        browser.close()

    return results


if __name__ == "__main__":
    try:
        out = run()
        print(json.dumps(out, ensure_ascii=False, indent=2))
        if not out["summary"].get("ok"):
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(2)