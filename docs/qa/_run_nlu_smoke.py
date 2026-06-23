"""Run Raphael NLU v1 smoke cases in browser. QA helper only."""
import json
import sys
import time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"


def run():
    results = {"console_errors": [], "cases": [], "summary": {}}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", lambda msg: (
            results["console_errors"].append(msg.text) if msg.type == "error" else None
        ))
        page.on("pageerror", lambda err: results["console_errors"].append(str(err)))

        page.goto(f"{BASE}/?raphaelSmoke=1", wait_until="networkidle", timeout=60000)
        time.sleep(1)

        cases = page.evaluate("""async () => {
            const m = await import('./src/ai/testHarness/nluSmokeCases.js');
            return m.runAllNluSmokeCases();
        }""")

        results["cases"] = cases
        failed = [c for c in cases if not c.get("pass")]
        forbidden = [c for c in cases if c.get("forbiddenPhraseDetected")]
        results["summary"] = {
            "total": len(cases),
            "passed": len(cases) - len(failed),
            "failed": len(failed),
            "forbidden_count": len(forbidden),
            "console_error_count": len(results["console_errors"]),
        }
        browser.close()

    return results


if __name__ == "__main__":
    out_path = "docs/qa/_nlu_smoke_output.json"
    try:
        out = run()
        payload = json.dumps(out, ensure_ascii=False, indent=2)
        with open(out_path, "w", encoding="utf-8") as fh:
            fh.write(payload)
        print(payload)
        if out["summary"]["failed"] or out["summary"]["forbidden_count"] or out["console_errors"]:
            sys.exit(1)
    except Exception as e:
        err = json.dumps({"error": str(e)}, ensure_ascii=False)
        with open(out_path, "w", encoding="utf-8") as fh:
            fh.write(err)
        print(err)
        sys.exit(2)