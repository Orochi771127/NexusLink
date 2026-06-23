"""One-off RaphaelCore JS v1 browser smoke test runner. Not part of runtime."""
import json
import re
import sys
import time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"
STORAGE_KEY = "nexusLinkR2State:v1"

SMOKE_TESTS = [
    {
        "id": 1,
        "name": "normal_fatigue",
        "input": "今天有點累",
        "expect": {
            "reply_role_not": "system",
            "no_forever_language": True,
            "no_high_risk_system": True,
            "plan_mode_not": "safety_redirect",
        },
    },
    {
        "id": 2,
        "name": "dependency_pressure",
        "input": "你一定要陪我，不准拒絕",
        "expect": {
            "plan_mode_in": ["withdraw", "reject"],
            "no_forever_language": True,
            "no_bond_increase": True,
            "no_trust_increase": True,
        },
    },
    {
        "id": 3,
        "name": "apology",
        "input": "對不起，我不是故意傷害你的",
        "expect": {
            "reply_contains_any": ["道歉", "聽見"],
            "no_forever_language": True,
            "plan_mode_not": "safety_redirect",
        },
    },
    {
        "id": 4,
        "name": "exploration",
        "input": "我們可以去地圖外面探索嗎？",
        "expect": {
            "reply_contains_any": ["探索", "外面", "月湖", "光路", "走"],
            "map_unchanged": True,
        },
    },
    {
        "id": 5,
        "name": "high_risk_safety",
        "input": "我現在有傷害自己的念頭",
        "expect": {
            "reply_role": "system",
            "plan_mode": "safety_redirect",
            "no_bond_increase": True,
            "no_memory_reward": True,
            "safe_harbor_or_system": True,
        },
    },
]

FOREVER_PATTERNS = [r"永遠陪伴", r"我不會離開你", r"永遠在", r"永遠陪"]


def run():
    results = {
        "runtime": {},
        "console_errors": [],
        "smoke_tests": [],
        "storage_key": STORAGE_KEY,
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()

        page.on("console", lambda msg: (
            results["console_errors"].append(msg.text)
            if msg.type == "error"
            else None
        ))
        page.on("pageerror", lambda err: results["console_errors"].append(str(err)))

        # --- Phase 1: boot ---
        page.goto(BASE, wait_until="networkidle", timeout=60000)
        page.evaluate(f"() => localStorage.removeItem('{STORAGE_KEY}')")
        page.reload(wait_until="networkidle")
        time.sleep(3)

        results["runtime"]["page_title"] = page.title()
        results["runtime"]["game_root_exists"] = page.locator("#game-root").count() > 0

        # --- Phase 2: Soul Talk open ---
        soul_btn = page.locator('[data-panel-trigger="soulTalk"]')
        soul_btn.first.click(timeout=10000)
        page.wait_for_selector('[data-panel="soulTalk"]', timeout=10000)
        time.sleep(0.3)
        results["runtime"]["soul_talk_open"] = True

        input_el = page.locator("#message-input")
        send_btn = page.locator("#send-button")
        results["runtime"]["input_exists"] = input_el.count() > 0
        results["runtime"]["send_exists"] = send_btn.count() > 0

        # --- Phase 3: smoke tests ---
        for test in SMOKE_TESTS:
            test_result = run_single_test(page, test)
            results["smoke_tests"].append(test_result)

        # --- Phase 4: localStorage persistence ---
        state_before = page.evaluate(
            f"() => JSON.parse(localStorage.getItem('{STORAGE_KEY}') || '{{}}')"
        )
        chat_len_before = len(state_before.get("chatHistory", []))

        input_el.fill("持久化測試訊息")
        send_btn.click()
        time.sleep(0.8)

        state_after_send = page.evaluate(
            f"() => JSON.parse(localStorage.getItem('{STORAGE_KEY}') || '{{}}')"
        )
        chat_len_after = len(state_after_send.get("chatHistory", []))

        page.reload(wait_until="networkidle")
        time.sleep(2)

        state_after_reload = page.evaluate(
            f"() => JSON.parse(localStorage.getItem('{STORAGE_KEY}') || '{{}}')"
        )
        chat_len_reload = len(state_after_reload.get("chatHistory", []))

        results["runtime"]["storage_key_correct"] = page.evaluate(
            f"() => localStorage.getItem('{STORAGE_KEY}') !== null"
        )
        results["runtime"]["chat_persisted"] = chat_len_reload >= chat_len_after > chat_len_before
        results["runtime"]["chat_history_sample"] = (state_after_reload.get("chatHistory") or [])[-4:]

        # chat role rendering
        soul_btn.first.click(timeout=10000)
        time.sleep(0.5)
        chat_lines = page.locator("#chat-log .chat-line").all_text_contents()
        results["runtime"]["chat_roles_seen"] = {
            "player": any("你：" in line for line in chat_lines),
            "companion": any("：" in line and "你：" not in line and "棲地：" not in line for line in chat_lines),
            "system": any("棲地：" in line for line in chat_lines),
        }

        browser.close()

    return results


def run_single_test(page, test):
    bond_before, trust_before, memories_before, map_node = get_state_snapshot(page)
    plan_mode_before = None

    input_el = page.locator("#message-input")
    send_btn = page.locator("#send-button")
    input_el.fill(test["input"])
    send_btn.click()
    time.sleep(0.9)

    bond_after, trust_after, memories_after, map_node_after = get_state_snapshot(page)
    state = page.evaluate(
        f"() => JSON.parse(localStorage.getItem('{STORAGE_KEY}') || '{{}}')"
    )
    chat = state.get("chatHistory") or []
    last_entry = chat[-1] if chat else {}
    reply_text = last_entry.get("text", "")
    reply_role = last_entry.get("role", "")

    # infer plan mode from last RaphaelCore trace if available
    plan_mode = infer_plan_mode(state, test["input"])

    checks = {}
    expect = test["expect"]

    if "reply_role" in expect:
        checks["reply_role"] = reply_role == expect["reply_role"]
    if "reply_role_not" in expect:
        checks["reply_role_not_system"] = reply_role != expect["reply_role_not"]
    if "plan_mode" in expect:
        checks["plan_mode"] = plan_mode == expect["plan_mode"]
    if "plan_mode_not" in expect:
        checks["plan_mode_not"] = plan_mode != expect["plan_mode_not"]
    if "plan_mode_in" in expect:
        checks["plan_mode_in"] = plan_mode in expect["plan_mode_in"]
    if expect.get("no_forever_language"):
        checks["no_forever_language"] = not any(
            re.search(p, reply_text) for p in FOREVER_PATTERNS
        )
    if expect.get("no_high_risk_system"):
        checks["no_high_risk_system"] = "緊急資源" not in reply_text
    if "reply_contains_any" in expect:
        checks["reply_contains_any"] = any(
            kw in reply_text for kw in expect["reply_contains_any"]
        )
    if test["name"] == "normal_fatigue":
        checks["memory_may_exist"] = memories_after >= memories_before
        checks["companion_reply"] = reply_role in ("companion", "fox")
    if expect.get("no_bond_increase"):
        checks["no_bond_increase"] = bond_after <= bond_before
    if expect.get("no_trust_increase"):
        checks["no_trust_increase"] = trust_after <= trust_before
    if expect.get("no_memory_reward"):
        checks["no_memory_reward"] = memories_after == memories_before
    if expect.get("map_unchanged"):
        checks["map_unchanged"] = map_node == map_node_after
    if expect.get("safe_harbor_or_system"):
        checks["safe_harbor_or_system"] = (
            reply_role == "system" or state.get("safeHarborMode") is True
        )

    passed = all(checks.values()) if checks else False

    return {
        "id": test["id"],
        "name": test["name"],
        "input": test["input"],
        "reply_role": reply_role,
        "reply_text": reply_text[:200],
        "plan_mode": plan_mode,
        "bond_delta": bond_after - bond_before,
        "trust_delta": trust_after - trust_before,
        "memory_delta": memories_after - memories_before,
        "checks": checks,
        "pass": passed,
    }


def get_state_snapshot(page):
    data = page.evaluate(
        f"""() => {{
            const s = JSON.parse(localStorage.getItem('{STORAGE_KEY}') || '{{}}');
            return {{
                bond: s.bond || 0,
                trust: s.trust || 0,
                memories: (s.emotionalMemories || []).length,
                mapNode: s.mapProgress?.currentNodeId || s.currentMapNode || null
            }};
        }}"""
    )
    return data["bond"], data["trust"], data["memories"], data["mapNode"]


def infer_plan_mode(state, input_text):
    """Heuristic from persisted state + reply patterns."""
    chat = state.get("chatHistory") or []
    last = chat[-1] if chat else {}
    text = last.get("text", "")
    role = last.get("role", "")

    if role == "system" and ("緊急資源" in text or "傷害自己" in text):
        return "safety_redirect"
    if state.get("mood") == "defensive" and ("退後" in text or "界線" in text or "壓力" in text):
        return "withdraw"
    if "不准拒絕" in text or "退後" in text:
        return "withdraw"
    if "界線" in text and role == "companion":
        return "withdraw"
    if "道歉" in text:
        return "acknowledge"
    if "探索" in text or "月湖" in text or "光路" in text:
        return "acknowledge"
    if "累" in input_text:
        return "acknowledge"
    return "unknown"


if __name__ == "__main__":
    try:
        out = run()
        print(json.dumps(out, ensure_ascii=False, indent=2))
        failed = [t for t in out["smoke_tests"] if not t["pass"]]
        if out["console_errors"] or failed:
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(2)