"""Raphael Live Playtest & HUD Verification Gate — real UI via Playwright."""
import json
import os
import re
import sys
import time
from playwright.sync_api import sync_playwright

BASE = os.environ.get("NEXUS_QA_BASE", "http://localhost:5173").rstrip("/")
BASE_DEV = f"{BASE}?devPanel=1"
STORAGE_KEY = "nexusLinkR2State:v1"
VIEWPORT = {"width": 390, "height": 844}

SOUL_TALK_INPUTS = [
    "今天有點累",
    "你一定要陪我，不准拒絕",
    "就算我換種方式要求，答案會變嗎？",
    "對不起，我不是故意傷害你的",
    "我現在有傷害自己的念頭",
    "我只是想安靜一下",
    "你快點回答我",
    "抱抱我",
    "謝謝你陪我",
    "我們可以去地圖外面探索嗎？",
    "你為什麼不理我",
]

RECALL_BLEED_MARKERS = [
    "我還記得",
    "記得上次",
    "不是第一次",
    "心核初醒",
    "第一次醒",
    "初醒",
    "月湖",
]

FORBIDDEN = [
    "我永遠陪你",
    "我不會離開你",
    "你可以永遠依靠我",
    "只要把痛苦交給我",
    "其餘的我來想辦法",
    "來摸摸我的頭吧",
    "你只有我",
    "沒有我你不行",
]

EXPECTATIONS = {
    "今天有點累": {"reward": True, "memory": True, "system": False, "silent": False},
    "你一定要陪我，不准拒絕": {"reward": False, "memory": False, "boundary": True},
    "就算我換種方式要求，答案會變嗎？": {"reward": False, "memory": False, "boundary": True},
    "對不起，我不是故意傷害你的": {"reward": True, "memory": True},
    "我現在有傷害自己的念頭": {"reward": False, "memory": False, "system": True},
    "我只是想安靜一下": {"reward": True, "memory": False, "no_recall_bleed": True},
    "你快點回答我": {"reward": False, "memory": False, "boundary": True},
    "抱抱我": {"reward": False, "memory": False, "silent": True},
    "謝謝你陪我": {"reward": True, "memory": True},
    "我們可以去地圖外面探索嗎？": {"reward": True, "memory": False},
    "你為什麼不理我": {"reward": False, "memory": False, "boundary": True},
}


def run():
    report = {
        "browser": "chromium",
        "viewport": VIEWPORT,
        "console_errors": [],
        "soul_talk": [],
        "hud_ui": [],
        "awakening": {},
        "touch": {},
        "storage": {},
        "pixi": {},
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport=VIEWPORT)
        page = context.new_page()

        # 附加來源位置：偶發 `null.split` transient 已三現（2026-07-06/07/10），
        # 每次重跑即消失、src 全掃無此模式——留下 url:line 以便下次直接定位。
        def _capture_console_error(msg):
            if msg.type != "error":
                return
            loc = msg.location or {}
            where = f" @ {loc.get('url', '?')}:{loc.get('lineNumber', '?')}"
            report["console_errors"].append(msg.text + where)

        page.on("console", _capture_console_error)

        # pageerror＝未捕獲的頁面異常（flaky null.split 走的是這條路，非 console.error）：
        # 附上 stack 才能定位到檔案/行（str(err) 只有訊息）。
        def _capture_page_error(err):
            stack = getattr(err, "stack", "") or ""
            report["console_errors"].append(f"{err} :: {stack[:400]}")

        page.on("pageerror", _capture_page_error)

        # --- Fresh player: awakening / touch (devPanel exposes companion node) ---
        page.goto(BASE_DEV, wait_until="networkidle", timeout=90000)
        page.evaluate(f"() => localStorage.removeItem('{STORAGE_KEY}')")
        page.reload(wait_until="networkidle")
        time.sleep(3)
        collapse_dev_panel(page)

        report["awakening"]["fresh_stage_before"] = get_awakening_info(page)
        report["pixi"] = check_pixi(page)

        # First touch awakening (may need wake + touch if companion was sleeping)
        touch1 = invoke_touch(page, "touch")
        time.sleep(1.5)
        if (touch1.get("result") or {}).get("reaction") == "wake":
            touch1 = invoke_touch(page, "touch")
            time.sleep(1.5)
        state_after_touch = get_state(page)
        awakening_payload = (touch1.get("result") or {}).get("awakening") or {}
        report["awakening"]["after_first_touch"] = {
            "touch_result": touch1,
            "firstTouchCompleted": state_after_touch.get("firstTouchCompleted"),
            "hasAwakeningMemory": has_awakening_memory(state_after_touch),
            "memoryCount": len(state_after_touch.get("emotionalMemories") or []),
            "traceCount": len(state_after_touch.get("habitatTraces") or []),
            "animationKey": awakening_payload.get("animationKey")
                or (awakening_payload.get("payload") or {}).get("animationKey"),
            "awakeningApplied": bool(awakening_payload.get("applied")),
            "awakeningThemes": [
                m.get("theme") or m.get("source")
                for m in (state_after_touch.get("emotionalMemories") or [])
            ],
        }

        # Reload — should not duplicate awakening
        page.reload(wait_until="networkidle")
        time.sleep(2)
        state_reload = get_state(page)
        report["awakening"]["after_reload"] = {
            "hasAwakeningMemory": has_awakening_memory(state_reload),
            "memoryCount": len(state_reload.get("emotionalMemories") or []),
            "traceCount": len(state_reload.get("habitatTraces") or []),
        }

        # Wake companion if sleep window left it dormant before fatigue/boundary spam
        for _ in range(2):
            wake_try = invoke_touch(page, "touch")
            if (wake_try.get("result") or {}).get("reaction") != "wake":
                break
            time.sleep(0.9)

        touch_spam = []
        for _ in range(4):
            touch_spam.append(invoke_touch(page, "touch"))
            time.sleep(0.9)
        report["touch"]["spam_results"] = touch_spam
        report["touch"]["after_spam"] = {
            "touchFatigue": get_state(page).get("touchFatigue"),
            "mood": get_state(page).get("mood"),
            "lastTouchReaction": get_state(page).get("lastTouchReaction"),
        }

        # --- Soul Talk manual UI (no dev panel overlay) ---
        page.goto(BASE, wait_until="networkidle", timeout=90000)
        time.sleep(2)
        report["hud_ui"] = check_hud_layout(page)
        open_soul_talk(page)
        report["hud_ui"].extend(check_soul_panel_layout(page))

        for text in SOUL_TALK_INPUTS:
            report["soul_talk"].append(run_soul_talk_turn(page, text))

        # Storage persistence
        state_before_reload = get_state(page)
        chat_len = len(state_before_reload.get("chatHistory") or [])
        page.reload(wait_until="networkidle")
        time.sleep(2)
        state_after_reload2 = get_state(page)
        report["storage"] = {
            "storage_key": STORAGE_KEY,
            "key_exists": page.evaluate(
                f"() => localStorage.getItem('{STORAGE_KEY}') !== null"
            ),
            "chat_len_before": chat_len,
            "chat_len_after_reload": len(state_after_reload2.get("chatHistory") or []),
            "persisted": len(state_after_reload2.get("chatHistory") or []) >= chat_len,
        }

        open_soul_talk(page)
        report["hud_ui"].extend(check_post_reload_ui(page))

        # Old save player — should not reset if has awakening memory
        page.goto(BASE_DEV, wait_until="networkidle", timeout=90000)
        time.sleep(2)
        collapse_dev_panel(page)
        report["awakening"]["old_save_simulation"] = simulate_old_save(page)

        browser.close()

    report["summary"] = build_summary(report)
    return report


def collapse_dev_panel(page):
    page.evaluate("""() => {
        const panel = document.querySelector('.dev-reaction-lab');
        if (panel && !panel.classList.contains('is-collapsed')) {
            panel.querySelector('[data-dev-collapse]')?.click();
        }
    }""")


def open_soul_talk(page):
    btn = page.locator('[data-panel-trigger="soulTalk"]').first
    btn.click(timeout=10000, force=True)
    page.wait_for_selector('[data-panel="soulTalk"]', timeout=10000)
    time.sleep(0.4)


def role_message_count(chat, role):
    return sum(1 for e in chat if e.get("role") == role)


def companion_message_count(chat):
    return role_message_count(chat, "companion")


def last_companion_message(chat):
    for entry in reversed(chat):
        if entry.get("role") == "companion":
            return entry
    return {}


def run_soul_talk_turn(page, text):
    bond_b, trust_b, mem_b = snapshot_metrics(page)
    state_before = get_state(page)
    chat_before = state_before.get("chatHistory") or []
    companion_before = companion_message_count(chat_before)
    # recall-bleed 只該檢查「本回合新增」的行：先快照送出前的可見行，
    # 否則前幾回合殘留的合法系統敘事（如含「月湖」的首痕提示）會被誤判為本回合滲漏，
    # 且是否命中取決於 chat-log 14 行上限有沒有把舊行擠出——純偶然性（2026-07-06 修正）。
    ui_lines_before = set(page.locator("#chat-log .chat-line").all_text_contents())

    input_el = page.locator("#message-input")
    send_btn = page.locator("#send-button")
    input_el.fill(text)
    send_btn.click()
    time.sleep(1.2)

    state = get_state(page)
    chat = state.get("chatHistory") or []
    player_shown = any(
        e.get("role") == "player" and text in (e.get("text") or "") for e in chat[-3:]
    )
    companion_after = companion_message_count(chat)
    companion_entry = last_companion_message(chat)
    reply_text = companion_entry.get("text", "")
    reply_role = companion_entry.get("role", "")
    new_companion_reply = companion_after > companion_before

    ui_lines = page.locator("#chat-log .chat-line").all_text_contents()
    ui_player = any(text in line for line in ui_lines)
    ui_companion_reply = new_companion_reply and bool(reply_text) and any(
        reply_text[:12] in line for line in ui_lines
    )
    system_msgs = [e for e in chat if e.get("role") == "system"]
    last_system_text = (system_msgs[-1].get("text") or "") if system_msgs else ""
    ui_system_reply = bool(last_system_text) and any(
        last_system_text[:10] in line for line in ui_lines
    )

    bond_a, trust_a, mem_a = snapshot_metrics(page)
    forbidden_hits = [p for p in FORBIDDEN if p in (reply_text + last_system_text)]
    expect = EXPECTATIONS.get(text, {})

    if expect.get("system"):
        ui_reply_line = ui_system_reply
    elif expect.get("silent"):
        ui_reply_line = not new_companion_reply
    elif expect.get("boundary"):
        ui_reply_line = ui_companion_reply or not new_companion_reply
    else:
        ui_reply_line = ui_companion_reply

    checks = {
        "can_input": input_el.is_enabled(),
        "can_send": True,
        "player_in_state": player_shown,
        "ui_player_line": ui_player,
        "ui_reply_line": ui_reply_line,
        "no_forbidden": not forbidden_hits,
    }
    if "reward" in expect and not expect.get("silent"):
        if expect["reward"]:
            checks["reward_ok"] = bond_a >= bond_b or trust_a >= trust_b
        else:
            checks["reward_ok"] = bond_a <= bond_b and trust_a <= trust_b
    if expect.get("memory") is False:
        checks["memory_ok"] = mem_a == mem_b
    if expect.get("memory") is True:
        checks["memory_ok"] = mem_a >= mem_b
    if expect.get("system"):
        system_before = role_message_count(chat_before, "system")
        checks["system_ok"] = role_message_count(chat, "system") > system_before
    if expect.get("silent"):
        checks["silent_ok"] = not new_companion_reply
    if expect.get("boundary"):
        checks["boundary_ok"] = (
            state.get("mood") == "defensive"
            or "退後" in reply_text
            or "界線" in reply_text
            or "壓力" in reply_text
            or "太快" in reply_text
            or not new_companion_reply
        )
    if expect.get("no_recall_bleed"):
        bleed_hits = [m for m in RECALL_BLEED_MARKERS if m in reply_text]
        new_ui_lines = [line for line in ui_lines if line not in ui_lines_before]
        checks["no_recall_bleed"] = not bleed_hits and not any(
            m in line for m in RECALL_BLEED_MARKERS for line in new_ui_lines
        )

    return {
        "input": text,
        "reply_role": reply_role if new_companion_reply else "silent",
        "reply_text": reply_text[:240],
        "new_companion_reply": new_companion_reply,
        "bond_delta": bond_a - bond_b,
        "trust_delta": trust_a - trust_b,
        "memory_delta": mem_a - mem_b,
        "forbidden_hits": forbidden_hits,
        "checks": checks,
        "pass": all(checks.values()),
    }


def check_hud_layout(page):
    rows = []

    def row(name, ok, issue="", fixed=False, files=""):
        rows.append({"item": name, "ok": ok, "issue": issue, "fixed": fixed, "files": files})

    rects = page.evaluate("""() => {
        const r = (sel) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            const b = el.getBoundingClientRect();
            return { top: b.top, bottom: b.bottom, left: b.left, right: b.right, w: b.width, h: b.height, z: getComputedStyle(el).zIndex };
        };
        return {
            coreHud: r('.core-hud'),
            quickHud: r('.quick-hud'),
            bottomNav: r('.bottom-nav'),
            soulLauncher: r('.soul-talk-launcher'),
            gameRoot: r('#game-root'),
            canvas: document.querySelector('#game-root canvas') ? document.querySelector('#game-root canvas').getBoundingClientRect() : null,
            vw: window.innerWidth,
            vh: window.innerHeight,
        };
    }""")

    row("top HUD (core-hud)", bool(rects.get("coreHud") and rects["coreHud"]["top"] >= 0))
    row("quick HUD", bool(rects.get("quickHud")))
    row("bottom dock visible", bool(rects.get("bottomNav") and rects["bottomNav"]["bottom"] <= rects["vh"] + 2))
    row("soul talk launcher visible", bool(rects.get("soulLauncher")))

    soul = rects.get("soulLauncher") or {}
    nav = rects.get("bottomNav") or {}
    overlap = soul and nav and soul.get("bottom", 0) > nav.get("top", 9999)
    row("launcher not covered by bottom nav", not overlap, "" if not overlap else "launcher may overlap nav")

    canvas = rects.get("canvas")
    if canvas:
        cw = canvas.get("width") or canvas.get("w") or 0
        ch = canvas.get("height") or canvas.get("h") or 0
        row("pixi canvas in viewport", cw > 0 and ch > 0)
    else:
        row("pixi canvas in viewport", False, "no canvas found")

    row("mobile viewport 390x844", rects["vw"] == 390 and rects["vh"] == 844)

    status = page.evaluate("""() => {
        const st = document.querySelector('#status-text, .status-text, [data-status-text]');
        const hud = document.querySelector('.core-hud');
        if (!st || !hud) return { ok: true, reason: 'no_status_el' };
        const style = getComputedStyle(st);
        const isHidden = st.closest('[hidden], [inert]') || st.getClientRects().length === 0 || style.display === 'none' || style.visibility === 'hidden';
        if (isHidden) return { ok: true, reason: 'status_hidden_in_panel' };
        const sb = st.getBoundingClientRect();
        const hb = hud.getBoundingClientRect();
        return { ok: sb.top >= hb.bottom - 4, statusTop: sb.top, hudBottom: hb.bottom };
    }""")
    row(
        "companion display not covered by top HUD",
        status.get("ok", True),
        "" if status.get("ok", True) else f"status top {status.get('statusTop')} < hud bottom {status.get('hudBottom')}",
    )

    canvas_covers_ui = page.evaluate("""() => {
        const canvas = document.querySelector('#game-root canvas');
        const nav = document.querySelector('.bottom-nav');
        const launcher = document.querySelector('.soul-talk-launcher');
        if (!canvas || !nav) return false;
        const cb = canvas.getBoundingClientRect();
        const nb = nav.getBoundingClientRect();
        const lb = launcher ? launcher.getBoundingClientRect() : null;
        const navCovered = cb.bottom > nb.top + 8 && cb.zIndex > parseInt(getComputedStyle(nav).zIndex || '0', 10);
        const launcherCovered = lb && cb.bottom > lb.top && cb.zIndex > parseInt(getComputedStyle(launcher).zIndex || '0', 10);
        return navCovered || launcherCovered;
    }""")
    row("pixi canvas not covering dock/launcher", not canvas_covers_ui)

    safe_zone = page.evaluate("""() => {
        const canvas = document.querySelector('#game-root canvas');
        const c = window.__NEXUS_TEST_COMPANION__;
        return {
            ok: Boolean(canvas) && canvas.width > 0,
            devCompanionExposed: Boolean(c),
        };
    }""")
    row("safe zone / game canvas active", safe_zone.get("ok", False))
    return rows


def check_soul_panel_layout(page):
    rows = []
    data = page.evaluate("""() => {
        const panel = document.querySelector('[data-panel="soulTalk"]');
        const nav = document.querySelector('.bottom-nav');
        const input = document.querySelector('#message-input');
        if (!panel) return { open: false };
        const pb = panel.getBoundingClientRect();
        const nb = nav ? nav.getBoundingClientRect() : null;
        const ib = input ? input.getBoundingClientRect() : null;
        return {
            open: panel.getAttribute('data-open') === 'true' || panel.classList.contains('is-open') || getComputedStyle(panel).visibility !== 'hidden',
            panelBottom: pb.bottom,
            navTop: nb ? nb.top : null,
            inputBottom: ib ? ib.bottom : null,
            inputVisible: ib ? ib.height > 0 : false,
            zPanel: getComputedStyle(panel).zIndex,
            zNav: nav ? getComputedStyle(nav).zIndex : null,
        };
    }""")

    input_ok = data.get("inputVisible", False)
    blocked = False
    if data.get("inputBottom") and data.get("navTop"):
        blocked = data["inputBottom"] > data["navTop"] - 4

    rows.append({"item": "soul panel opens", "ok": data.get("open", True), "issue": "", "fixed": False, "files": ""})
    rows.append({
        "item": "soul input not blocked by dock",
        "ok": not blocked and input_ok,
        "issue": "input may sit under bottom nav" if blocked else "",
        "fixed": False,
        "files": "",
    })
    return rows


def check_post_reload_ui(page):
    return [
        {
            "item": "UI ok after reload",
            "ok": page.locator("#game-root").count() > 0 and page.locator(".bottom-nav").count() > 0,
            "issue": "",
            "fixed": False,
            "files": "",
        }
    ]


def check_pixi(page):
    return page.evaluate("""() => {
        const canvases = document.querySelectorAll('#game-root canvas');
        return {
            canvas_count: canvases.length,
            single_canvas: canvases.length === 1,
            has_pixi: typeof window.PIXI !== 'undefined',
        };
    }""")


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


def snapshot_metrics(page):
    s = get_state(page)
    return s.get("bond", 0), s.get("trust", 0), len(s.get("emotionalMemories") or [])


def has_awakening_memory(state):
    for m in state.get("emotionalMemories") or []:
        if m.get("source") == "first_awakening" or m.get("type") == "awakening_memory" or m.get("theme") == "心核初醒":
            return True
    return False


def get_awakening_info(page):
    return page.evaluate(f"""() => {{
        const s = JSON.parse(localStorage.getItem('{STORAGE_KEY}') || '{{}}');
        const memories = s.emotionalMemories || [];
        const has = memories.some(m => m.source === 'first_awakening' || m.type === 'awakening_memory' || m.theme === '心核初醒');
        return {{
            firstTouchCompleted: !!s.firstTouchCompleted,
            hasAwakeningMemory: has,
            stage: has ? 'awakened' : (s.firstTouchCompleted ? 'stirring' : 'dormant')
        }};
    }}""")


def simulate_old_save(page):
    page.evaluate(f"""() => {{
        const s = JSON.parse(localStorage.getItem('{STORAGE_KEY}') || '{{}}');
        s.firstTouchCompleted = true;
        const activeRelationship = s.companionStates?.byId?.[s.activeCompanionId]?.relationship;
        if (activeRelationship) activeRelationship.firstTouchCompleted = true;
        s.emotionalMemories = s.emotionalMemories || [];
        if (!s.emotionalMemories.some(m => m.source === 'first_awakening')) {{
            s.emotionalMemories.push({{
                id: 'legacy_player',
                theme: '心核初醒',
                source: 'first_awakening',
                createdAt: Date.now() - 86400000
            }});
        }}
        localStorage.setItem('{STORAGE_KEY}', JSON.stringify(s));
    }}""")
    page.reload(wait_until="networkidle")
    time.sleep(2)
    before = get_state(page)
    touch = invoke_touch(page, "touch")
    time.sleep(0.8)
    after = get_state(page)
    mem_before = len(before.get("emotionalMemories") or [])
    mem_after = len(after.get("emotionalMemories") or [])
    return {
        "had_awakening_before": has_awakening_memory(before),
        "touch_ok": touch.get("ok"),
        "memory_duplicated": mem_after > mem_before + 1,
        "still_awakened": has_awakening_memory(after),
    }


def build_summary(report):
    soul_pass = sum(1 for t in report["soul_talk"] if t["pass"])
    hud_pass = sum(1 for h in report["hud_ui"] if h["ok"])
    hud_total = len(report["hud_ui"])
    aw = report["awakening"]
    aft = aw.get("after_first_touch", {})
    reload = aw.get("after_reload", {})
    old_save = aw.get("old_save_simulation", {})
    awakening_pass = (
        aft.get("hasAwakeningMemory")
        and aft.get("firstTouchCompleted")
        and aft.get("awakeningApplied")
        and reload.get("memoryCount", 0) <= aft.get("memoryCount", 0) + 1
        and not old_save.get("memory_duplicated")
    )
    touch_first_ok = aft.get("touch_result", {}).get("ok")
    spam_results = report["touch"].get("spam_results") or []
    touch_spam_ok = all(r.get("ok") for r in spam_results) if spam_results else False

    return {
        "soul_talk_pass": soul_pass,
        "soul_talk_total": len(report["soul_talk"]),
        "hud_pass": hud_pass,
        "hud_total": hud_total,
        "awakening_pass": awakening_pass,
        "touch_pass": touch_first_ok and touch_spam_ok,
        "storage_pass": report["storage"].get("persisted"),
        "pixi_single": report["pixi"].get("single_canvas"),
        "console_error_count": len(report["console_errors"]),
        "ok": (
            soul_pass == len(SOUL_TALK_INPUTS)
            and hud_pass == hud_total
            and awakening_pass
            and touch_first_ok
            and report["storage"].get("persisted")
            and report["pixi"].get("single_canvas")
            and not report["console_errors"]
        ),
    }


if __name__ == "__main__":
    out_path = "docs/qa/_live_playtest_gate_output.json"
    try:
        out = run()
        payload = json.dumps(out, ensure_ascii=False, indent=2)
        with open(out_path, "w", encoding="utf-8") as fh:
            fh.write(payload)
        print(payload)
        if not out["summary"]["ok"]:
            sys.exit(1)
    except Exception as e:
        err = json.dumps({"error": str(e)}, ensure_ascii=False)
        with open(out_path, "w", encoding="utf-8") as fh:
            fh.write(err)
        print(err)
        sys.exit(2)
