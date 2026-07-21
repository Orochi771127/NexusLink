import { qs } from "../utils/dom.js";
import { prefersReducedMotion } from "../utils/motionPreference.js";
import { getCompanionById } from "../data/companionRegistry.js";
import { getEnemyRiftSilhouettePath } from "../data/assetManifest.js";
import { getExplorationNodeById } from "../data/explorationNodes.js";
import {
  applyNoiseTurn,
  applyPlayerAction,
  canUseAction,
  createStandoffSession,
  getIntentTelegraph,
  getOutcomeCopy,
  getResonanceSkillName,
  settleStandoff,
  summarizeStandoffOutcome,
  MAX_FATIGUE,
  MAX_SYNC,
  SHARD_GOAL
} from "../engine/battleEngine.js";
import { buildEventReflection } from "../engine/soulTalkComposer.js";
import { isSessionOwnerCurrent } from "../engine/sessionOwnerGuard.js";
import { deriveResonanceCircle, MAX_MEMBER_BREATH } from "../engine/resonanceCircleEngine.js";
import {
  CHAPTER_TRIAL_OUTCOMES,
  advanceChapterProgress,
  getChapterByNumber,
  getChapterForNode
} from "../data/chapterRegistry.js";
import { getChapterNarrative } from "../data/chapterNarrative.js";
import { t } from "../i18n/i18n.js";
import {
  createHabitatTraceFromMemory,
  pruneHabitatTraces,
  upsertHabitatTrace
} from "../engine/habitatTraceEngine.js";
import EventBus from "../utils/eventBus.js";
import AudioManager from "../audio/audioManager.js";

const NOISE_TURN_DELAY_MS = 620;
const COMPANION_ANIMATION_INTENT_EVENT = "COMPANION_ANIMATION_INTENT";

// 結局 → 回棲地時的動畫意圖。對峙 modal 會遮住 canvas，所以「被看見的後果」
// 安排在玩家點「回到棲地」、modal 關閉的瞬間播放（夥伴完全可見）。
// retreated 不播特別動畫——尊重「離開」，讓夥伴安靜回到 mood idle。
const OUTCOME_RETURN_INTENT = Object.freeze({
  stabilized: "standoff.stabilized",
  recovered: "standoff.recovered",
  overwhelmed_but_safe: "standoff.overwhelmed"
});

// 玩家行動 → 即時動畫意圖（按下當下就播，視覺回饋）。
// 這些 cue 在 modal 內播放（夥伴部分可見），純視覺、不影響結算。
const ACTION_INTENT = Object.freeze({
  resonance: "standoff.resonance",
  barrier: "standoff.barrier",
  pulse: "standoff.pulse"
});

// 裂隙形體（對峙視覺 v1，零美術資產）：依裂隙心相配色的程序化情緒霧體。
// 敵人不是怪物，是「卡住的情緒」——所以形體是霧、光與雜訊，不是身體。
// hue/sat 進 CSS 變數；濃度（--rift-density）跟著 noise 比例走：雜訊越輕、霧越淡。
const RIFT_EMOTION_TINT = Object.freeze({
  sadness: { hue: 215, sat: "70%" },
  anger: { hue: 18, sat: "72%" },
  anxiety: { hue: 268, sat: "68%" },
  loneliness: { hue: 226, sat: "55%" },
  fatigue: { hue: 40, sat: "28%" },
  gratitude: { hue: 190, sat: "60%" }
});

/**
 * 心核對峙 controller。
 * 介面維持 createBattleController / startBattle，app.js 與 mapController wiring 不變。
 */
export function createBattleController({
  store,
  panelManager,
  soulTalkController,
  saveCurrentState,
  statusText,
  companionGrowthController
}) {
  const nodeLabelEl = qs("#battle-node-label");
  const noiseNameEl = qs("#standoff-noise-name");
  const noiseTextEl = qs("#standoff-noise-text");
  const noiseFillEl = qs("#standoff-noise-fill");
  const companionNameEl = qs("#standoff-companion-name");
  const stabilityTextEl = qs("#standoff-stability-text");
  const stabilityFillEl = qs("#standoff-stability-fill");
  const syncPipsEl = qs("#standoff-sync-pips");
  const fatiguePipsEl = qs("#standoff-fatigue-pips");
  const shardsEl = qs("#standoff-shards");
  const logEl = qs("#battle-log");
  const actionButtons = {
    resonance: qs("#standoff-act-resonance"),
    barrier: qs("#standoff-act-barrier"),
    pulse: qs("#standoff-act-pulse"),
    retreat: qs("#standoff-act-retreat")
  };
  const finishButton = qs("#battle-finish");
  const actionRowEl = qs("#standoff-action-row");
  let telegraphEl = null;
  let riftFigureEl = null;
  let circleStripEl = null;

  // 意圖預示（telegraph）：動態插到行動列上方（不動 index.html），玩家在選行動前先讀懂
  // 「裂隙下一拍要做什麼」。樣式由本檔一次性注入 <style>，避免動基底 styles.css。
  function ensureTelegraphElement() {
    if (telegraphEl || !actionRowEl) return telegraphEl;
    injectTelegraphStyles();
    telegraphEl = document.createElement("p");
    telegraphEl.className = "standoff-telegraph";
    telegraphEl.hidden = true;
    const label = document.createElement("b");
    label.className = "tel-label";
    const hint = document.createElement("span");
    hint.className = "tel-hint";
    telegraphEl.append(label, hint);
    actionRowEl.parentNode.insertBefore(telegraphEl, actionRowEl);
    return telegraphEl;
  }

  // 裂隙形體：動態插在對峙日誌上方（不動 index.html），樣式自注入。
  function ensureRiftFigure() {
    if (riftFigureEl || !logEl) return riftFigureEl;
    injectRiftFigureStyles();
    injectStandoffLayoutStyles();
    riftFigureEl = document.createElement("div");
    riftFigureEl.className = "rift-figure";
    riftFigureEl.setAttribute("aria-hidden", "true");
    // rf-shadow：暗暈底層——確保情緒霧在任何背景（白天藍天/夜景）都可讀。
    // rf-sprite：GAP-1 裂隙剪影（依 enemyId 載入）；載入成功前與失敗後都由程序霧體撐住畫面。
    riftFigureEl.innerHTML =
      '<span class="rf-shadow"></span><img class="rf-sprite" alt="" decoding="async">' +
      '<span class="rf-mist"></span><span class="rf-core"></span><span class="rf-glitch"></span>';
    const spriteEl = riftFigureEl.querySelector(".rf-sprite");
    spriteEl.addEventListener("load", () => riftFigureEl?.classList.add("has-sprite"));
    spriteEl.addEventListener("error", () => riftFigureEl?.classList.remove("has-sprite"));
    logEl.parentNode.insertBefore(riftFigureEl, logEl);
    return riftFigureEl;
  }

  // 依 enemyId 換上剪影。同一場對峙每次 render 都會經過這裡，dataset 防止重複觸發載入；
  // manifest 查無此敵人時清空 src → 維持純程序霧體（向後相容未來新敵人）。
  function applyRiftSprite(el) {
    const img = el.querySelector(".rf-sprite");
    if (!img || !session) return;
    const path = getEnemyRiftSilhouettePath(session.enemyId);
    if (!path) {
      el.classList.remove("has-sprite");
      if (img.dataset.spritePath) {
        delete img.dataset.spritePath;
        img.removeAttribute("src");
      }
      return;
    }
    if (img.dataset.spritePath === path) return;
    el.classList.remove("has-sprite");
    img.dataset.spritePath = path;
    img.src = path;
  }

  // 共鳴圈小像列（設計 §7 v3）：夥伴側顯示圈員的姿態名＋呼吸點；喘息中則轉淡。
  // 動態插在狀態列（.standoff-field）下方，不動 index.html；無圈員時整列隱藏。
  function ensureCircleStrip() {
    if (circleStripEl) return circleStripEl;
    const field = stabilityFillEl?.closest(".standoff-field");
    if (!field) return null;
    injectCircleStripStyles();
    circleStripEl = document.createElement("div");
    circleStripEl.className = "circle-strip";
    circleStripEl.setAttribute("role", "note");
    circleStripEl.setAttribute("aria-label", "共鳴圈夥伴");
    circleStripEl.hidden = true;
    field.insertAdjacentElement("afterend", circleStripEl);
    return circleStripEl;
  }

  function renderCircleStrip() {
    const strip = ensureCircleStrip();
    if (!strip) return;
    const members = session?.circle || [];
    if (!members.length) {
      strip.hidden = true;
      return;
    }
    strip.hidden = false;
    strip.innerHTML = "";
    members.forEach((member) => {
      const chip = document.createElement("span");
      chip.className = member.resting ? "cs-chip is-resting" : "cs-chip";
      chip.title = member.stanceHint || "";
      const stanceEl = document.createElement("b");
      stanceEl.textContent = member.stanceName;
      const nameEl = document.createElement("span");
      nameEl.textContent = member.name;
      const breathEl = document.createElement("i");
      breathEl.className = "cs-breath";
      breathEl.textContent = member.resting
        ? "喘息中"
        : "●".repeat(member.breath) + "○".repeat(Math.max(0, MAX_MEMBER_BREATH - member.breath));
      chip.append(stanceEl, nameEl, breathEl);
      strip.appendChild(chip);
    });
  }

  function updateRiftFigure() {
    const el = ensureRiftFigure();
    if (!el || !session) return;
    applyRiftSprite(el);
    const tint = RIFT_EMOTION_TINT[session.riftEmotion] || RIFT_EMOTION_TINT.gratitude;
    el.style.setProperty("--rift-hue", String(tint.hue));
    el.style.setProperty("--rift-sat", tint.sat);
    const density = Math.max(0.2, Math.min(1, session.noise.current / session.noise.max));
    el.style.setProperty("--rift-density", density.toFixed(2));
    el.dataset.phase = session.phase || "turbulent";
    const intent = session.turn === "player" ? session.nextIntent : null;
    el.dataset.intent = intent || "none";
    el.classList.toggle("is-charged", Boolean(session.charged));
  }

  function setRiftOutcome(outcome) {
    if (!riftFigureEl) return;
    riftFigureEl.classList.remove("rift-dissolve", "rift-recede", "rift-dim");
    if (outcome === "stabilized" || outcome === "recovered") {
      riftFigureEl.classList.add("rift-dissolve"); // 雜訊散開：不是被消滅，是被放輕。
    } else if (outcome === "retreated") {
      riftFigureEl.classList.add("rift-recede"); // 你們退開，它留在原地。
    } else {
      riftFigureEl.classList.add("rift-dim");
    }
  }

  let session = null;
  let noiseTurnTimer = null;
  let removeCloseGuard = null;
  let renderedLogCount = 0;
  let lastOutcome = null;
  // B4 juice：追蹤上一次的值，偵測變化播一次性視覺回饋。
  let prevNoise = null;
  let prevStability = null;
  let prevShards = null;

  function abortStandoffForOwnerMismatch({ closePanel = true } = {}) {
    window.clearTimeout(noiseTurnTimer);
    noiseTurnTimer = null;
    removeCloseGuard?.();
    removeCloseGuard = null;
    session = null;
    lastOutcome = null;
    document.body.classList.remove("standoff-active");
    if (telegraphEl) telegraphEl.hidden = true;
    if (circleStripEl) circleStripEl.hidden = true;
    if (finishButton) finishButton.hidden = true;
    if (statusText) statusText.textContent = "夥伴已切換，這次對峙沒有結算。";
    if (closePanel) panelManager.closePanel({ force: true });
  }

  function guardCurrentSessionOwner(options) {
    if (session && isSessionOwnerCurrent(session, store.getState())) return true;
    if (session) abortStandoffForOwnerMismatch(options);
    return false;
  }

  // UI 不直接碰 Pixi：所有動畫回饋只透過 EventBus 發送 intent，由 app/Pixi bridge 接。
  function emitBattleAnimationIntent(intent, meta = {}) {
    if (!intent) return;
    EventBus.emit(COMPANION_ANIMATION_INTENT_EVENT, {
      intent,
      source: "battle-modal",
      interrupt: true,
      ...meta
    });
  }

  function bind() {
    Object.entries(actionButtons).forEach(([actionId, button]) => {
      button?.addEventListener("click", () => handleAction(actionId));
    });
    finishButton?.addEventListener("click", () => {
      if (!guardCurrentSessionOwner()) return;
      // 回棲地：先發出「被看見的後果」動畫意圖，再關閉 modal。
      // lazy load + modal 淡出（180ms）的時間差，剛好讓動畫落在夥伴可見後播放。
      emitBattleAnimationIntent(OUTCOME_RETURN_INTENT[lastOutcome], { source: "standoff" });
      document.body.classList.remove("standoff-active");
      panelManager.closePanel({ force: true });
    });
  }

  function startBattle({ enemyId, nodeId }) {
    const state = store.getState();
    const companion = getCompanionById(state.activeCompanionId);
    // CH-6 共鳴圈：進場前定圈（最早結緣者優先，最多 3 隻同場），對峙中不換。
    const circle = deriveResonanceCircle(state);
    session = createStandoffSession({ companion, enemyId, nodeId, state, circle });
    renderedLogCount = 0;
    lastOutcome = null;
    prevNoise = null;
    prevStability = null;
    prevShards = null;
    if (logEl) logEl.innerHTML = "";
    if (riftFigureEl) riftFigureEl.classList.remove("rift-dissolve", "rift-recede", "rift-dim");

    const node = getExplorationNodeById(nodeId);
    // 節點名/敵名/心相標籤是內容層資料（維持繁中）；外框模板走 i18n key（{name} 佔位）。
    if (nodeLabelEl) {
      nodeLabelEl.textContent = node
        ? `${node.label.zh} ・ ${t("battle.nodeUnstable")}`
        : t("battle.nodeUnstable");
    }
    if (companionNameEl) {
      companionNameEl.textContent = t("battle.stabilityOwner").replace("{name}", session.companionName);
    }
    if (noiseNameEl) {
      const noiseLabel = t("battle.noiseOf").replace("{name}", session.enemyName);
      noiseNameEl.textContent = session.riftEmotionLabelZh
        ? `${noiseLabel}・${session.riftEmotionLabelZh}`
        : noiseLabel;
    }
    const resonanceButton = actionButtons.resonance;
    if (resonanceButton) {
      resonanceButton.querySelector("strong").textContent = getResonanceSkillName(session.emblem);
      // 裂隙心相：元素契合時，共鳴鈕亮起金光並換上提示（每次 startBattle 重設）。
      const isAttuned = session.affinityTier === "attuned";
      resonanceButton.classList.toggle("is-attuned", isAttuned);
      const resonanceHint = resonanceButton.querySelector("em");
      if (resonanceHint) {
        resonanceHint.textContent = isAttuned
          ? t("battle.resonanceHintEmotion").replace("{emotion}", session.riftEmotionLabelZh)
          : t("battle.resonanceHintDefault");
      }
    }
    if (finishButton) finishButton.hidden = true;

    removeCloseGuard?.();
    removeCloseGuard = panelManager.registerCloseGuard("battle", () => {
      if (!guardCurrentSessionOwner({ closePanel: false })) return true;
      // Escape／backdrop 不會無聲離開：轉成「先撤退」結算（被尊重的離開）。
      if (session && session.turn !== "ended") {
        endStandoff("retreated");
      }
      return true;
    });

    render();
    // 對峙是全神貫注的時刻：藏起 bottom-nav，把底部舞台讓給夥伴（finish 時恢復）。
    document.body.classList.add("standoff-active");
    panelManager.openPanel("battle");
    // 環繞式佈局後夥伴在對峙中可見：進場先給一個警戒面對的姿態（idle_defensive）。
    emitBattleAnimationIntent("soul.defensive", { reason: "standoff-engage" });
  }

  function handleAction(actionId) {
    if (!session || session.turn !== "player") return;
    if (!guardCurrentSessionOwner()) return;

    if (actionId === "retreat") {
      // 撤退不是失敗：下行柔音 + 回身 cue，再走「被尊重的離開」結算。
      AudioManager.playSfx("standoff_retreat");
      emitBattleAnimationIntent("standoff.retreat");
      endStandoff("retreated");
      return;
    }

    if (!canUseAction(session, actionId)) return;

    AudioManager.playSfx("standoff_action");
    session = applyPlayerAction(session, actionId);
    render();
    // 即時 cue：行動已照原流程成立後才發；能播就播，不能播也不阻斷 gameplay。
    emitBattleAnimationIntent(ACTION_INTENT[actionId]);

    const verdict = settleStandoff(session);
    if (verdict.settled) {
      endStandoff(verdict.outcome);
      return;
    }

    window.clearTimeout(noiseTurnTimer);
    noiseTurnTimer = window.setTimeout(() => {
      if (!session || session.turn !== "noise") return;
      if (!guardCurrentSessionOwner()) return;
      const stabilityBefore = session.stability.current;
      session = applyNoiseTurn(session);
      render();
      // 只有雜訊真的造成 stability 下降才播 hit（暫歇/lull 不播）→ 一回合最多一次，不 spam。
      if (session.stability.current < stabilityBefore) {
        emitBattleAnimationIntent("battle.hit", { reason: "noise-pressure" });
      }
      const noiseVerdict = settleStandoff(session);
      if (noiseVerdict.settled) {
        endStandoff(noiseVerdict.outcome);
      }
    }, NOISE_TURN_DELAY_MS);
  }

  function endStandoff(outcome) {
    if (!session) return;
    if (!guardCurrentSessionOwner()) return;
    lastOutcome = outcome;
    window.clearTimeout(noiseTurnTimer);
    session = { ...session, turn: "ended", log: [...session.log] };

    const now = Date.now();
    const stateBeforeSettlement = store.getState();
    const summary = summarizeStandoffOutcome(outcome, session, stateBeforeSettlement, now);
    const copy = getOutcomeCopy(outcome);
    session.log.push({ kind: "system", text: `【${copy.title}】${summary.message}` });

    // CH-5a 章節試煉：當前章首次「穩住/回收」即通關推進（規則見 chapterRegistry，Owner 可改）。
    // 防刷：對峙節點必須屬於當前章（否則第一章節點可原地刷穿七章）；
    // 重打已通關章不重複推進；overwhelmed/retreated 不算失敗、無任何懲罰。
    let chapterAdvance = null;
    if (CHAPTER_TRIAL_OUTCOMES.has(outcome)) {
      const progressBefore = store.getState().chapterProgress || { current: 1, completed: [] };
      const nodeChapter = getChapterForNode(session.nodeId);
      if (nodeChapter === progressBefore.current && !progressBefore.completed.includes(progressBefore.current)) {
        chapterAdvance = {
          from: getChapterByNumber(progressBefore.current),
          to: getChapterByNumber(Math.min(progressBefore.current + 1, 7))
        };
      }
    }
    if (chapterAdvance?.from) {
      // 安靜的通關敘事：一句話、無成就框、無獎勵數字（紅線 6）。
      session.log.push({ kind: "system", text: buildChapterAdvanceLine(chapterAdvance) });
    }
    render();
    setRiftOutcome(outcome);

    // 結算回寫：patch + 對峙記憶/棲地痕跡（走既有沉積鏈）+ 章節推進。
    store.updateState((draft) => {
      Object.assign(draft, summary.statePatch);
      if (summary.memorySeed) {
        draft.emotionalMemories.push(summary.memorySeed);
        draft.lastEmotionTag = summary.memorySeed.emotion;
        const trace = createHabitatTraceFromMemory(summary.memorySeed, now);
        if (trace) {
          draft.habitatTraces = pruneHabitatTraces(upsertHabitatTrace(draft.habitatTraces || [], trace));
        }
      }
      if (chapterAdvance?.from) {
        draft.chapterProgress = advanceChapterProgress(draft.chapterProgress, chapterAdvance.from.chapter);
      }
      // CH-5b：章內對峙把牠推到過載（overwhelmed_but_safe）→ 記入該章共鳴邀請的 mark，
      // 影響牠的同行意願（「撐得勉強」＝再陪穩一些日子）。只在已相遇（mark 存在）時計數。
      if (outcome === "overwhelmed_but_safe") {
        const nodeChapterNo = getChapterForNode(session.nodeId);
        const mark = draft.resonance?.chapterMarks?.[nodeChapterNo];
        if (mark) mark.overwhelmedCount = (Number(mark.overwhelmedCount) || 0) + 1;
      }
      if (getExplorationNodeById(session.nodeId)) {
        companionGrowthController?.writeIntoDraft?.(draft, {
          companionId: session.companionId,
          sourceType: "standoff",
          tendency: getStandoffGrowthTendency(outcome),
          context: {
            chapterNo: getChapterForNode(session.nodeId),
            nodeId: session.nodeId,
            outcomeFamily: outcome
          },
          createdAt: now,
          completed: true,
          completionStatus: "completed",
          safetyProvenance: {
            isHighRisk: false,
            strategyId: null,
            actionId: null,
            systemRoleSafetyReply: false,
            safetyModeActive: false,
            safeHarborModeActive: session.growthSafetyExcluded === true
              || stateBeforeSettlement.safeHarborMode === true
          }
        });
      }
    });
    // 閉環：回棲地後，夥伴用自己的聲音記得這件事（companion 角色，非 system）。
    const reflection = buildEventReflection(store.getState(), now, { outcomeOverride: outcome });
    if (reflection) {
      soulTalkController.addChat("companion", reflection);
    }
    if (chapterAdvance?.from) {
      // 章節通關也留在心語裡（夥伴之聲，同 reflection 慣例）。
      soulTalkController.addChat("companion", buildChapterAdvanceCompanionLine(chapterAdvance));
    }
    soulTalkController.renderChat();
    saveCurrentState?.(); // patch + 記憶 + 引用台詞一次落盤
    if (statusText) statusText.textContent = copy.title;

    removeCloseGuard?.();
    removeCloseGuard = null;
    if (finishButton) finishButton.hidden = false;
  }

  function render() {
    if (!session) return;

    if (noiseTextEl) noiseTextEl.textContent = `${session.noise.current} / ${session.noise.max}`;
    if (stabilityTextEl) stabilityTextEl.textContent = `${session.stability.current} / ${session.stability.max}`;
    if (noiseFillEl) noiseFillEl.style.width = `${Math.round((session.noise.current / session.noise.max) * 100)}%`;
    if (stabilityFillEl) stabilityFillEl.style.width = `${Math.round((session.stability.current / session.stability.max) * 100)}%`;
    if (syncPipsEl) syncPipsEl.textContent = "●".repeat(session.sync) + "○".repeat(Math.max(0, MAX_SYNC - session.sync));
    if (fatiguePipsEl) {
      fatiguePipsEl.textContent = "●".repeat(session.fatigue) + "○".repeat(Math.max(0, MAX_FATIGUE - session.fatigue));
      fatiguePipsEl.classList.toggle("is-strained", session.fatigue >= MAX_FATIGUE - 1);
    }
    if (shardsEl) {
      shardsEl.textContent = `◈ ${session.shards}/${SHARD_GOAL}`;
      shardsEl.classList.toggle("is-glowing", session.shards >= SHARD_GOAL - 1);
    }

    // B4 juice：雜訊放輕→柔光一閃；心核被撞→晃動（重擊更晃）；回收微光→晶光爆閃。
    if (!prefersReducedMotion()) {
      if (prevNoise !== null && session.noise.current < prevNoise) {
        flashOnce(noiseFillEl, "fx-soothe", 500);
        flashOnce(riftFigureEl, "rift-hit", 460); // 形體同步收縮一拍：被放輕了。
      }
      if (prevStability !== null && session.stability.current < prevStability) {
        const drop = prevStability - session.stability.current;
        flashOnce(stabilityFillEl, drop >= 6 ? "fx-shake-strong" : "fx-shake", drop >= 6 ? 380 : 260);
      }
      if (prevShards !== null && session.shards > prevShards) flashOnce(shardsEl, "fx-burst", 700);
    }
    prevNoise = session.noise.current;
    prevStability = session.stability.current;
    prevShards = session.shards;

    if (logEl) {
      for (let index = renderedLogCount; index < session.log.length; index += 1) {
        const entry = session.log[index];
        const line = document.createElement("p");
        line.className =
          entry.kind === "noise" ? "battle-log-enemy" : entry.kind === "system" ? "battle-log-system" : "battle-log-player";
        line.textContent = entry.text;
        logEl.appendChild(line);
      }
      renderedLogCount = session.log.length;
      while (logEl.childNodes.length > 14) logEl.removeChild(logEl.firstChild);
      logEl.scrollTop = logEl.scrollHeight;
    }

    const isPlayerTurn = session.turn === "player";
    Object.entries(actionButtons).forEach(([actionId, button]) => {
      if (!button) return;
      if (actionId === "retreat") {
        button.disabled = session.turn === "ended";
        return;
      }
      button.disabled = !isPlayerTurn || !canUseAction(session, actionId);
    });

    updateRiftFigure();
    renderCircleStrip();

    // 意圖預示：只在玩家回合顯示（讓玩家據此選穩住/設界/脈衝）；雜訊回合與結束時隱藏。
    ensureTelegraphElement();
    if (telegraphEl) {
      const tel = getIntentTelegraph(session);
      if (tel && isPlayerTurn) {
        telegraphEl.hidden = false;
        telegraphEl.dataset.tone = tel.tone;
        telegraphEl.querySelector(".tel-label").textContent = `下一拍・${tel.label}`;
        telegraphEl.querySelector(".tel-hint").textContent = tel.hint;
      } else {
        telegraphEl.hidden = true;
      }
    }
  }

  return { bind, startBattle };
}

function getStandoffGrowthTendency(outcome) {
  if (outcome === "stabilized") return "attunement";
  if (outcome === "recovered") return "steadfastness";
  return "boundary_respect";
}

function injectTelegraphStyles() {
  if (document.getElementById("standoff-telegraph-styles")) return;
  const style = document.createElement("style");
  style.id = "standoff-telegraph-styles";
  style.textContent = [
    // 下一拍＝無框文字行（v2 去方塊）：語氣改由 tel-label 顏色 + 文字光暈承載，
    // 不再用邊框卡片；描述行帶陰影確保在湖面上可讀。
    ".standoff-telegraph{margin:0;padding:2px 4px;border:0;border-radius:0;background:none;display:flex;flex-direction:column;gap:1px;font-size:11.5px;line-height:1.4;text-shadow:0 1px 5px rgba(0,0,0,.8)}",
    ".standoff-telegraph[hidden]{display:none}",
    ".standoff-telegraph .tel-label{color:#dff3ff;font-weight:700;letter-spacing:.02em}",
    ".standoff-telegraph .tel-hint{color:rgba(205,226,247,.88)}",
    '.standoff-telegraph[data-tone="warn"] .tel-label{color:#ffe08a;text-shadow:0 1px 5px rgba(0,0,0,.8),0 0 12px rgba(255,209,102,.35)}',
    '.standoff-telegraph[data-tone="danger"] .tel-label{color:#ff9a9a;text-shadow:0 1px 5px rgba(0,0,0,.8),0 0 14px rgba(255,120,120,.45)}',
    "@keyframes fx-soothe{0%{filter:brightness(1)}50%{filter:brightness(1.7)}100%{filter:brightness(1)}}",
    ".standoff-fill.fx-soothe{animation:fx-soothe 500ms ease-out}",
    "@keyframes fx-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}",
    ".standoff-fill.fx-shake{animation:fx-shake 260ms ease-in-out}",
    "@keyframes fx-shake-strong{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(3px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}",
    ".standoff-fill.fx-shake-strong{animation:fx-shake-strong 380ms ease-in-out}",
    "@keyframes fx-burst{0%{transform:scale(1)}40%{transform:scale(1.35);filter:brightness(1.8)}100%{transform:scale(1)}}",
    "#standoff-shards.fx-burst{display:inline-block;animation:fx-burst 700ms ease-out}"
  ].join("");
  document.head.appendChild(style);
}

// 共鳴圈小像列樣式：玻璃小藥丸＋呼吸點；喘息中轉淡。全部自注入，不動基底 CSS。
function injectCircleStripStyles() {
  if (document.getElementById("circle-strip-styles")) return;
  const style = document.createElement("style");
  style.id = "circle-strip-styles";
  style.textContent = [
    ".circle-strip{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:2px 0 0;flex:0 0 auto}",
    ".circle-strip[hidden]{display:none}",
    ".cs-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:999px;border:1px solid rgba(138,217,255,.22);background:rgba(8,13,32,.6);font-size:10.5px;line-height:1.4;color:rgba(214,232,250,.92);transition:opacity .4s ease}",
    ".cs-chip b{font-weight:700;color:#cfeaff}",
    ".cs-chip .cs-breath{font-style:normal;letter-spacing:2px;color:#8ad9ff;font-size:9px}",
    ".cs-chip.is-resting{opacity:.5}",
    ".cs-chip.is-resting .cs-breath{letter-spacing:normal;color:rgba(200,222,245,.65)}"
  ].join("");
  document.head.appendChild(style);
}

// 裂隙形體樣式：三層（外霧/內核/雜訊紋）＋ 相位節奏 ＋ 意圖姿態 ＋ 結局動畫。
// 顏色全部由 --rift-hue/--rift-sat 驅動；濃度由 --rift-density（noise 比例）驅動。
function injectRiftFigureStyles() {
  if (document.getElementById("rift-figure-styles")) return;
  const style = document.createElement("style");
  style.id = "rift-figure-styles";
  style.textContent = [
    ".rift-figure{position:relative;width:min(72%,280px);height:88px;margin:2px auto 6px;pointer-events:none;--rf-speed:3.2s}",
    ".rift-figure .rf-shadow,.rift-figure .rf-mist,.rift-figure .rf-core,.rift-figure .rf-glitch{position:absolute;inset:0}",
    // GAP-1 剪影：contain 鎖進既有容器（88/104px 高）＝維持「小型對峙對手」尺度，不放大成 Boss。
    // 載入成功（has-sprite）前不顯示，程序霧體先撐住；濃度仍跟 --rift-density 走（雜訊越輕、影越淡）。
    ".rift-figure .rf-sprite{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:none;opacity:calc(.5 + .5*var(--rift-density));filter:drop-shadow(0 3px 12px rgba(4,8,18,.55));animation:rfSpriteBreath var(--rf-speed) ease-in-out infinite}",
    ".rift-figure.has-sprite .rf-sprite{display:block}",
    // 剪影自帶三層霧體讀感（外霧/內核/絲紋都烘在圖裡）→ 程序霧/核退場；雜訊紋保留但放輕，維持「活著的雜訊」動態。
    ".rift-figure.has-sprite .rf-mist,.rift-figure.has-sprite .rf-core{opacity:0;animation:none}",
    ".rift-figure.has-sprite .rf-glitch{opacity:.3}",
    "@keyframes rfSpriteBreath{0%,100%{transform:scale(.97)}50%{transform:scale(1.04)}}",
    '.rift-figure[data-intent="gather"] .rf-sprite{animation:rfSpriteGather 1.6s ease-in-out infinite}',
    "@keyframes rfSpriteGather{0%,100%{transform:scale(1)}50%{transform:scale(1.12);filter:drop-shadow(0 3px 12px rgba(4,8,18,.55)) brightness(1.3)}}",
    // 暗暈底層：讓情緒霧在白天藍天上也讀得出形體（夜景時只是多一點深度）。
    ".rift-figure .rf-shadow{background:radial-gradient(56% 52% at 50% 52%,rgba(4,8,18,calc(.42*var(--rift-density))),transparent 74%);filter:blur(12px)}",
    ".rift-figure .rf-mist{background:radial-gradient(52% 48% at 50% 52%,hsla(var(--rift-hue),var(--rift-sat),62%,calc(.36*var(--rift-density))),transparent 72%);filter:blur(10px);animation:rfBreath var(--rf-speed) ease-in-out infinite}",
    ".rift-figure .rf-core{background:radial-gradient(26% 24% at 50% 50%,hsla(var(--rift-hue),var(--rift-sat),78%,calc(.55*var(--rift-density))),transparent 66%);filter:blur(3px);animation:rfBreath var(--rf-speed) ease-in-out infinite reverse}",
    ".rift-figure .rf-glitch{background:repeating-linear-gradient(0deg,transparent 0 3px,hsla(var(--rift-hue),var(--rift-sat),72%,calc(.13*var(--rift-density))) 3px 4px);mix-blend-mode:screen;opacity:.55;animation:rfGlitch 2.4s steps(7) infinite}",
    "@keyframes rfBreath{0%,100%{transform:scale(.96);opacity:.8}50%{transform:scale(1.05);opacity:1}}",
    "@keyframes rfGlitch{0%,100%{transform:translateY(0)}30%{transform:translateY(-2px)}60%{transform:translateY(1.5px)}}",
    // 相位節奏：翻湧快、拉鋸中、漸靜慢且轉柔。
    '.rift-figure[data-phase="turbulent"]{--rf-speed:2.2s}',
    '.rift-figure[data-phase="contested"]{--rf-speed:3.2s}',
    '.rift-figure[data-phase="settling"]{--rf-speed:5.2s;opacity:.82}',
    // 意圖姿態：蓄能=膨脹變亮；湧動=低頻顫；暫歇=放緩。
    '.rift-figure[data-intent="gather"] .rf-core{animation:rfGather 1.6s ease-in-out infinite}',
    "@keyframes rfGather{0%,100%{transform:scale(1)}50%{transform:scale(1.22);filter:blur(2px) brightness(1.35)}}",
    '.rift-figure[data-intent="surge"]{animation:rfTremble .5s ease-in-out infinite}',
    "@keyframes rfTremble{0%,100%{transform:translateX(0)}25%{transform:translateX(-1.5px)}75%{transform:translateX(1.5px)}}",
    '.rift-figure[data-intent="lull"]{--rf-speed:6s}',
    ".rift-figure.is-charged{filter:brightness(1.25) saturate(1.2)}",
    // 受擊（雜訊被放輕）：收縮一拍。
    "@keyframes rfHit{0%{transform:scale(1)}35%{transform:scale(.86);filter:brightness(1.4)}100%{transform:scale(1)}}",
    ".rift-figure.rift-hit{animation:rfHit 460ms ease-out}",
    // 結局：散開（被放輕，不是被消滅）／緩退（你們離開）／轉暗（撐住了）。
    "@keyframes rfDissolve{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.4);filter:blur(16px)}}",
    ".rift-figure.rift-dissolve{animation:rfDissolve 1.4s ease-out forwards}",
    "@keyframes rfRecede{0%{opacity:1}100%{opacity:.25;transform:scale(.9) translateY(-6px)}}",
    ".rift-figure.rift-recede{animation:rfRecede 1s ease-out forwards}",
    ".rift-figure.rift-dim{opacity:.35;transition:opacity .8s ease}",
    "@media (prefers-reduced-motion: reduce){.rift-figure,.rift-figure *{animation:none !important}}",
    'html[data-reduced-motion-preference="reduced"] .rift-figure,html[data-reduced-motion-preference="reduced"] .rift-figure *{animation:none !important}'
  ].join("");
  document.head.appendChild(style);
}

// 環繞式對峙佈局 v2（Owner 真機回饋 2026-07-13：「介面擋住角色、血量方塊過大、
// 畫面一堆方塊」）——HUD 化：狀態不再是卡片，而是貼邊的細條。
// 佈局骨架（flex order，DOM 不動）：標題 → 雜訊細條（敵方，頂部）→ 裂隙形體 →
// ［彈性舞台：夥伴在這裡］→ 日誌（上緣淡出）→ 下一拍（無框）→ 心核帶（玩家，
// 貼行動列上方＝操作語境）→ 共鳴圈 → 行動列。
// 去方塊手段：邊框全移除、深底改文字陰影/淡漸層、standoff-field 以 display:contents
// 解散成 flex 項目重排。全部 override 自注入，不動 index.html / styles.css 基底。
function injectStandoffLayoutStyles() {
  if (document.getElementById("standoff-layout-styles")) return;
  const style = document.createElement("style");
  style.id = "standoff-layout-styles";
  style.textContent = [
    // modal 透明化 + 上下貼邊：中段讓出「舞台」給 canvas 上的夥伴。
    // 對峙期間 bottom-nav 隱藏（standoff-active），modal 直接貼到底部安全區。
    'html[data-ui="v2"] .battle-modal{background:transparent;border-color:transparent;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;max-height:none;top:calc(var(--top-safe, 0px) + 6px);bottom:calc(var(--bottom-safe, 0px) + 10px);display:flex;flex-direction:column;gap:6px;overflow:hidden;padding:10px 14px}',
    'html[data-ui="v2"] body.standoff-active .bottom-nav--aurora{opacity:0;pointer-events:none;transition:opacity 260ms ease}',
    // 對峙全神貫注：夥伴名片與右上設定一併退場，避免與對峙標題疊字（finish 時恢復）。
    'html[data-ui="v2"] body.standoff-active .core-hud,html[data-ui="v2"] body.standoff-active .quick-hud{opacity:0;pointer-events:none;transition:opacity 260ms ease}',
    // 標題收斂：kicker + 標題各一行，不佔舞台。
    'html[data-ui="v2"] .battle-modal .panel-header{order:0;flex:0 0 auto;text-shadow:0 1px 6px rgba(0,0,0,.85)}',
    'html[data-ui="v2"] .battle-modal .panel-header h2{margin:0;font-size:17px;line-height:1.2}',
    'html[data-ui="v2"] .battle-modal .panel-header p{margin:0 0 1px;font-size:11px}',
    // 解散雙卡欄位：兩個 meter 直接成為 modal 的 flex 項目，雜訊上、心核下。
    'html[data-ui="v2"] .standoff-field{display:contents}',
    'html[data-ui="v2"] .standoff-meter-hint{display:none}',
    'html[data-ui="v2"] .standoff-meter-head strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    // 雜訊（敵方）＝頂部細條 HUD：無卡無框，文字靠陰影、量條自帶深色軌。
    'html[data-ui="v2"] .standoff-meter.standoff-noise{order:1;flex:0 0 auto;display:grid;gap:4px;margin:0;padding:0 2px;border:0;border-radius:0;background:none}',
    'html[data-ui="v2"] .standoff-noise .standoff-meter-head{font-size:12px;gap:8px;text-shadow:0 1px 6px rgba(0,0,0,.9)}',
    'html[data-ui="v2"] .standoff-noise .standoff-meter-head span{color:rgba(214,232,250,.88)}',
    'html[data-ui="v2"] .standoff-noise .standoff-bar{height:6px;background:rgba(5,9,22,.55);box-shadow:0 1px 4px rgba(0,0,0,.4)}',
    // 形體＝夥伴面對的對象：置中段上方；其後以彈性空隙讓出舞台。
    'html[data-ui="v2"] .battle-modal .rift-figure{order:2;flex:0 0 auto;width:min(80%,300px);height:104px;margin:2px auto auto}',
    // 日誌：無框、上緣淡出的半透明帶——像浮在湖面上的字，不是一塊面板。
    'html[data-ui="v2"] .battle-modal #battle-log{order:3;flex:0 0 auto;margin-top:auto;min-height:0;max-height:60px;overflow-y:auto;padding:6px 8px 4px;border:0;border-radius:10px;background:rgba(5,9,22,.32);font-size:11.5px;line-height:1.4;text-shadow:0 1px 4px rgba(0,0,0,.75);-webkit-mask-image:linear-gradient(180deg,transparent,#000 12px);mask-image:linear-gradient(180deg,transparent,#000 12px)}',
    'html[data-ui="v2"] .battle-modal .standoff-telegraph{order:4;flex:0 0 auto}',
    // 心核（玩家）＝行動列上方的淡漸層帶：跟按鈕同一個「操作區」語境，頂部完全讓出。
    'html[data-ui="v2"] .standoff-meter.standoff-stability{order:5;flex:0 0 auto;display:grid;gap:4px;margin:0;padding:6px 10px 7px;border:0;border-radius:12px;background:linear-gradient(180deg,rgba(5,9,22,.14),rgba(5,9,22,.5))}',
    'html[data-ui="v2"] .standoff-stability .standoff-meter-head{font-size:12px;gap:8px;text-shadow:0 1px 5px rgba(0,0,0,.85)}',
    'html[data-ui="v2"] .standoff-stability .standoff-bar{height:6px}',
    'html[data-ui="v2"] .standoff-vitals-row{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:10px}',
    'html[data-ui="v2"] .battle-modal .circle-strip{order:6}',
    // 行動列變薄：邊框放輕、底色降透明，按鈕是「可按的地方」而不是又一疊卡。
    'html[data-ui="v2"] .battle-modal #standoff-action-row{order:7;flex:0 0 auto;gap:7px}',
    'html[data-ui="v2"] .battle-modal #standoff-action-row button{padding-top:7px;padding-bottom:7px;border-color:rgba(138,217,255,.18);background:rgba(8,13,32,.44)}',
    'html[data-ui="v2"] .battle-modal #standoff-action-row button em{font-size:9px;opacity:.8}',
    'html[data-ui="v2"] .battle-modal #battle-finish{order:8;flex:0 0 auto}',
    // backdrop：上深（狀態可讀）、中淡（夥伴可見）、下略深（行動列對比）。
    'html[data-ui="v2"] .panel-layer[data-active-panel="battle"] .panel-backdrop{background:linear-gradient(180deg,rgba(2,6,12,.5),rgba(2,6,12,.1) 40%,rgba(2,6,12,.1) 62%,rgba(2,6,12,.36))}'
  ].join("");
  document.head.appendChild(style);
}

// 章節通關敘事（CH-5a 骨架 → CH-7 專屬內容）：安靜一句，位置敘事而非成就——
// 「路亮了」不是「解鎖了」。優先取 chapterNarrative 的每章專屬句（對應該章情緒主題），
// 缺項時退回通用模板。內容層維持 TC。
function buildChapterAdvanceLine(chapterAdvance) {
  const narrative = getChapterNarrative(chapterAdvance.from?.chapter);
  if (narrative?.clearLine) return `【旅程】${narrative.clearLine}`;
  const fromZh = chapterAdvance.from?.zh || "這裡";
  const toZh = chapterAdvance.to?.zh || "";
  if (chapterAdvance.from?.chapter === 7) {
    return `【旅程】${fromZh}的雜訊，也安靜下來了。Linkara 的七片土地，你們一起走過了。`;
  }
  return `【旅程】${fromZh}一帶的雜訊，被你們一起放輕了。往${toZh}的方向，好像亮了一點。`;
}

function buildChapterAdvanceCompanionLine(chapterAdvance) {
  const narrative = getChapterNarrative(chapterAdvance.from?.chapter);
  if (narrative?.clearCompanionLine) return narrative.clearCompanionLine;
  if (chapterAdvance.from?.chapter === 7) {
    return "七片土地都走過了。接下來去哪，我們慢慢想，不急。";
  }
  const toZh = chapterAdvance.to?.zh || "下一片土地";
  return `這一帶安靜下來了。${toZh}那邊……等你想去的時候，我們再一起走。`;
}

function flashOnce(el, className, ms = 500) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth; // 重啟一次性動畫
  el.classList.add(className);
  window.setTimeout(() => el.classList.remove(className), ms);
}
