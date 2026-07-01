"""Run Raphael 5-turn growth session simulation."""
import json
import sys
import time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

        page.goto(f"{BASE}/?raphaelSmoke=1", wait_until="networkidle", timeout=60000)
        time.sleep(1)

        result = page.evaluate("""async () => {
            const m = await import('./src/ai/testHarness/raphaelGrowthSession.js');
            return m.runRaphaelGrowthSession();
        }""")

        browser.close()

    result["console_errors"] = errors
    result["ok"] = (
        result["summary"]["allTurnsPass"]
        and result["summary"]["zeroForbidden"]
        and not errors
    )
    return result


if __name__ == "__main__":
    try:
        out = run()
        print(json.dumps(out, ensure_ascii=False, indent=2))
        if not out.get("ok"):
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(2)