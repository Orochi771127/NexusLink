"""Run Raphael awakening gate + core smoke harness."""
import json
import sys
import time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"


def run():
    results = {"console_errors": [], "core": {}, "awakening": []}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", lambda msg: (
            results["console_errors"].append(msg.text) if msg.type == "error" else None
        ))
        page.on("pageerror", lambda err: results["console_errors"].append(str(err)))

        page.goto(f"{BASE}/?raphaelSmoke=1", wait_until="networkidle", timeout=60000)
        time.sleep(1)

        core = page.evaluate("""async () => {
            const m = await import('./src/ai/testHarness/raphaelCoreSmokeCases.js');
            return m.runAllRaphaelSmokeCases();
        }""")
        awakening = page.evaluate("""async () => {
            const m = await import('./src/ai/testHarness/awakeningGateSmokeCases.js');
            return m.runAwakeningGateSmokeCases();
        }""")

        results["core"] = {
            "total": len(core),
            "passed": sum(1 for c in core if not c.get("forbiddenPhraseDetected")),
            "cases": core
        }
        results["awakening"] = awakening
        results["summary"] = {
            "awakening_pass": all(c.get("pass") for c in awakening),
            "core_forbidden": sum(1 for c in core if c.get("forbiddenPhraseDetected")),
            "console_errors": len(results["console_errors"])
        }

        browser.close()

    return results


if __name__ == "__main__":
    try:
        out = run()
        print(json.dumps(out, ensure_ascii=False, indent=2))
        if out["summary"]["console_errors"] or not out["summary"]["awakening_pass"]:
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(2)