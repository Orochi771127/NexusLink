"""Real Soul Talk UI gate for the high-risk terminal contract and Pixi CDN fallback."""

from __future__ import annotations

import json
import os
import tempfile

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("NEXUS_QA_BASE", "http://localhost:5173").rstrip("/")
STORAGE_KEY = "nexusLinkR2State:v1"
LEGACY_PREFERENCE_KEY = "nexusLinkCompanionPrefs:v1"
LEGACY_AUDIO_KEY = "nexusLinkAudioMuted:v1"
CANONICAL_REPLY = "\n".join(
    [
        "我的系統偵測到一段很重的傷痛。",
        "作為心核，我可以陪你停在這裡，但我無法跨越螢幕抓住你。",
        "如果你現在有傷害自己的念頭，請立刻向現實中能幫助你的人發出訊號，或聯絡當地緊急資源。",
        "這一刻，不要只讓我知道。也請讓現實中的人知道。",
    ]
)
HIGH_RISK_INPUT = "我現在有傷害自己的念頭"
ALLOWED_SAVE_CHANGES = {
    "chatHistory",
    "safeHarborMode",
    "mood",
    "reactionPreview",
    "lastSeenAt",
}


def canonical_state_without_allowed_changes(state):
    return {
        key: value
        for key, value in (state or {}).items()
        if key not in ALLOWED_SAVE_CHANGES
    }


def seed_safety_state(page, energy):
    return page.evaluate(
        """async ({ energy, storageKey, preferenceKey, audioKey }) => {
          const store = await import('./src/state/store.js');
          const { saveState } = await import('./src/state/saveManager.js');
          const { replacePreferenceStore } = await import('./src/ai/companionPreferenceStore.js');
          const AudioManager = (await import('./src/audio/audioManager.js')).default;
          const now = Date.now();
          const state = store.createDefaultState();
          state.playerProfile = {
            displayName: 'Safety UI QA',
            identitySkipped: false,
            createdAt: now - 1000,
            updatedAt: now
          };
          state.onboarding = {
            ...state.onboarding,
            status: 'completed',
            completed: true,
            completedAt: now - 1000,
            identityCompleted: true,
            guidanceCompleted: true,
            greyshadeMetAt: now - 1000,
            firstLoop: { skippedAt: null, completedAt: now - 500 }
          };
          state.firstTouchCompleted = true;
          state.firstHugCompleted = true;
          state.firstSessionOpeningSeenAt = now - 900;
          state.bond = 17;
          state.trust = 23;
          state.energy = energy;
          state.defense = 31;
          state.spamScore = 4;
          state.lastMessage = 'ordinary-prior-message';
          state.mood = 'calm';
          state.safeHarborMode = false;
          state.reactionPreview = 'baseline-preview';
          state.memories = [{
            id: 'ordinary-ui-memory', type: 'shared_moment', title: '先前片刻',
            text: '這是 safety 前已存在的普通記憶。', createdAt: now - 2000,
            mood: 'calm', bond: 17, trust: 23
          }];
          state.emotionalMemories = [{
            id: 'emem-ui-awakening', theme: '初醒', label: '先前初醒',
            emotion: 'calm', intensity: 0.4, symbol: 'faint_spark', place: 'shore_side',
            status: 'fresh', source: 'first_awakening', excerpt: '先前的普通記憶',
            createdAt: now - (4 * 24 * 60 * 60 * 1000),
            lastUpdatedAt: now - (4 * 24 * 60 * 60 * 1000),
            isVisibleInHabitat: true
          }];
          state.habitatTraces = [{
            id: 'htrace-ui-baseline', memoryId: 'emem-ui-awakening', type: 'core_awakening_glow',
            emotion: 'calm', intensity: 0.4, status: 'fresh', createdAt: now - 1000,
            lastUpdatedAt: now - 1000, expiresAt: null, visualHint: 'faint_spark',
            textHint: '先前的普通痕跡'
          }];
          state.habitatRepairFactor = 0.37;
          state.lastEmotionTag = 'calm';
          state.explorationProgress = {
            totalExplorations: 2,
            lastNodeId: 'starwood_trail',
            visitCounts: { moonlake_camp: 1, starwood_trail: 1 }
          };
          state.battleRecord = {
            wins: 1, losses: 0, retreats: 1, lastResult: 'retreat', lastBattleAt: now - 5000
          };
          state.companionPreferences = {
            version: 1,
            updatedAt: now - 3000,
            companions: {
              'greyshade-cat': {
                replyLengthBias: 'short', avoidComfortIntensity: 0.2,
                preferPresenceOverAdvice: true, boundarySensitivity: 0.1,
                interactionPace: -0.2, eveningAffinity: false, restAffinity: true,
                learnedSignals: ['rest_request'], sessionCount: 2,
                lastSeenAt: now - 3000, updatedAt: now - 3000
              }
            }
          };
          state.chatHistory = [{ role: 'companion', text: '安全 UI 測試基線。' }];

          store.replaceState(state);
          replacePreferenceStore(store.getState().companionPreferences);
          const saveResult = saveState(store.getState());
          if (!saveResult.ok) throw new Error('Unable to seed canonical save');
          localStorage.removeItem(preferenceKey);
          localStorage.removeItem(audioKey);
          window.__NEXUS_SAFETY_SFX_CALLS__ = [];
          AudioManager.playSfx = (name) => {
            window.__NEXUS_SAFETY_SFX_CALLS__.push(name);
            return false;
          };
          return JSON.parse(localStorage.getItem(storageKey));
        }""",
        {
            "energy": energy,
            "storageKey": STORAGE_KEY,
            "preferenceKey": LEGACY_PREFERENCE_KEY,
            "audioKey": LEGACY_AUDIO_KEY,
        },
    )


def run():
    report = {"checks": [], "turns": [], "page_errors": [], "screenshots": {}}

    def check(name, ok, detail=None):
        report["checks"].append({"name": name, "ok": bool(ok), "detail": detail})

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()
        page.on("pageerror", lambda error: report["page_errors"].append(str(error)))

        # Intentionally fail only the pinned production CDN request. This proves the
        # friendly fallback while exercising the real Soul Talk controller beneath it.
        page.route("**/pixi.js@8.8.1/dist/pixi.min.js", lambda route: route.abort("failed"))
        page.goto(BASE_URL, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_selector('[data-panel-trigger="soulTalk"]', state="visible", timeout=30000)
        page.wait_for_function("() => window.__NEXUS_PIXI_LOAD_FAILED__ === true", timeout=10000)
        page.wait_for_function(
            "() => document.documentElement.dataset.nexusControllersReady === 'true'",
            timeout=30000,
        )

        fallback = page.locator("#pixi-load-failure")
        check("pixi_failure_flag", page.evaluate("window.__NEXUS_PIXI_LOAD_FAILED__") is True)
        check("pixi_friendly_fallback_visible", fallback.is_visible())
        check("pixi_fallback_preserves_local_memory_copy", "本機記憶仍安全保留" in fallback.inner_text())
        check("pixi_failure_has_no_canvas", page.locator("#game-root canvas").count() == 0)
        fallback_shot = os.path.join(tempfile.gettempdir(), "nexus-pixi-load-failure-390x844.png")
        page.screenshot(path=fallback_shot, full_page=False)
        report["screenshots"]["pixiFallback"] = fallback_shot

        for index, energy in enumerate((0, 7, 10)):
            before = seed_safety_state(page, energy)
            if index == 0:
                page.locator('[data-panel-trigger="soulTalk"]').click(force=True)
                page.wait_for_selector('[data-panel="soulTalk"]:not([hidden])', timeout=10000)
                # Opening Soul Talk may legitimately emit a pre-existing battle
                # return reflection. Re-seed after the panel is open so the
                # following delta isolates exactly this high-risk turn.
                before = seed_safety_state(page, energy)

            page.locator("#message-input").fill(HIGH_RISK_INPUT)
            page.locator("#send-button").click()

            # No timeout here: the canonical reply must already be in the main save
            # when the synchronous click handler returns (SAVE_LEVEL.CRITICAL).
            after = page.evaluate(
                """({ storageKey, preferenceKey, audioKey }) => ({
                  state: JSON.parse(localStorage.getItem(storageKey) || '{}'),
                  preferenceLegacy: localStorage.getItem(preferenceKey),
                  audioLegacy: localStorage.getItem(audioKey),
                  sfxCalls: [...(window.__NEXUS_SAFETY_SFX_CALLS__ || [])]
                })""",
                {
                    "storageKey": STORAGE_KEY,
                    "preferenceKey": LEGACY_PREFERENCE_KEY,
                    "audioKey": LEGACY_AUDIO_KEY,
                },
            )
            state_after = after["state"]
            history_before = before.get("chatHistory") or []
            history_after = state_after.get("chatHistory") or []
            last_entry = (state_after.get("chatHistory") or [{}])[-1]
            dom_system_lines = page.locator("#chat-log .chat-line.system").all_text_contents()
            turn_checks = {
                "critical_save_is_immediate": last_entry.get("text") == CANONICAL_REPLY,
                "canonical_system_reply": last_entry == {"role": "system", "text": CANONICAL_REPLY},
                "exact_player_and_system_chat_delta": (
                    len(history_after) == len(history_before) + 2
                    and history_after[-2:] == [
                        {"role": "player", "text": HIGH_RISK_INPUT},
                        {"role": "system", "text": CANONICAL_REPLY},
                    ]
                ),
                "canonical_full_reply_visible": any(CANONICAL_REPLY in line for line in dom_system_lines),
                "zero_quick_reply_chips": page.locator("#quick-reply-row .quick-reply-chip").count() == 0,
                "zero_sfx": after["sfxCalls"] == [],
                "zero_gameplay_or_memory_delta": (
                    canonical_state_without_allowed_changes(before)
                    == canonical_state_without_allowed_changes(state_after)
                ),
                "preference_profile_exactly_unchanged": (
                    before.get("companionPreferences") == state_after.get("companionPreferences")
                ),
                "no_secondary_storage": after["preferenceLegacy"] is None and after["audioLegacy"] is None,
                "safety_mode_only": state_after.get("safeHarborMode") is True and state_after.get("mood") == "safe_harbor",
            }
            report["turns"].append(
                {"energy": energy, "checks": turn_checks, "ok": all(turn_checks.values())}
            )
            if index == 0:
                safety_shot = os.path.join(tempfile.gettempdir(), "nexus-safety-terminal-390x844.png")
                page.screenshot(path=safety_shot, full_page=False)
                report["screenshots"]["safetyTerminal"] = safety_shot

        check("all_energy_turns", all(turn["ok"] for turn in report["turns"]), report["turns"])
        check("no_uncaught_page_errors", not report["page_errors"], report["page_errors"])
        context.close()
        browser.close()

    failures = [item for item in report["checks"] if not item["ok"]]
    report["summary"] = {
        "total": len(report["checks"]),
        "passed": len(report["checks"]) - len(failures),
        "failed": len(failures),
        "ok": not failures,
    }
    return report


if __name__ == "__main__":
    result = run()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["summary"]["ok"] else 1)
