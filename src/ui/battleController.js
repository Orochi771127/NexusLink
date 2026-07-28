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
  buildStandoffCausalityLayers,
  getResonanceSkillName,
  settleStandoff,
  summarizeStandoffOutcome,
  MAX_FATIGUE,
  MAX_SYNC,
  SHARD_GOAL
} from "../engine/battleEngine.js";
import { isLifetimeFirstStandoff } from "../engine/resonanceThreadEngine.js";
import { buildEventReflection } from "../engine/soulTalkComposer.js";
import { isSessionOwnerCurrent } from "../engine/sessionOwnerGuard.js";
import { deriveResonanceCircle, MAX_MEMBER_BREATH } from "../engine/resonanceCircleEngine.js";
import {
  CHAPTER_TRIAL_OUTCOMES,
  getChapterForNode
} from "../data/chapterRegistry.js";
import {
  applyChapterTrialAdvance,
  buildChapterAdvanceCompanionLine,
  buildChapterAdvanceLine,
  resolveChapterTrialAdvance
} from "../engine/chapterTrialEngine.js";
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
  let objectiveEl = null;
  let guideEl = null;
  let causalityEl = null;
  let riftFigureEl = null;
  let circleStripEl = null;
  let firstGuideShownThisSession = false;

  // 意圖預示（telegraph）：動態插到行動列上方（不動 index.html），玩家在選行動前先讀懂
  // 「裂隙下一拍要做什麼」。樣式由本檔一次性注入 <style>，避免動基底 styles.css。
  function ensureTelegraphElement() {
    if (telegraphEl || !actionRowEl) return telegraphEl;
    injectTelegraphStyles();
    ensureObjectiveElement();
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

  function ensureObjectiveElement() {
    if (objectiveEl || !actionRowEl) return objectiveEl;
    objectiveEl = document.createElement("p");
    objectiveEl.className = "standoff-objective";
    objectiveEl.setAttribute("role", "status");
    actionRowEl.parentNode.insertBefore(objectiveEl, actionRowEl);
    return objectiveEl;
  }

  function ensureCausalityElement() {
    if (causalityEl || !logEl) return causalityEl;
    causalityEl = document.createElement("div");
    causalityEl.className = "standoff-causality";
    causalityEl.hidden = true;
    logEl.parentNode.insertBefore(causalityEl, logEl.nextSibling);
    return causalityEl;
  }

  function ensureGuideElement() {
    if (guideEl) return guideEl;
    const panel = qs('[data-panel="battle"]');
    if (!panel) return null;
    guideEl = document.createElement("div");
    guideEl.className = "standoff-first-guide";
    guideEl.hidden = true;
    guideEl.innerHTML =
      '<p class="sfg-title"></p><p class="sfg-body"></p><button type="button" class="sfg-continue"></button>';
    guideEl.querySelector(".sfg-continue")?.addEventListener("click", () => {
      if (guideEl) guideEl.hidden = true;
      firstGuideShownThisSession = true;
    });
    panel.appendChild(guideEl);
    return guideEl;
  }

  function applyActionMeaningHints() {
    const map = {
      resonance: "battle.actMeaning.resonance",
      barrier: "battle.actMeaning.barrier",
      pulse: "battle.actMeaning.pulse",
      retreat: "battle.actMeaning.retreat"
    };
    Object.entries(map).forEach(([actionId, key]) => {
      const button = actionButtons[actionId];
      if (!button) return;
      let meaning = button.querySelector(".act-meaning");
      if (!meaning) {
        meaning = document.createElement("span");
        meaning.className = "act-meaning";
        button.appendChild(meaning);
      }
      meaning.textContent = t(key);
    });
  }

  function showFirstGuideIfNeeded(state) {
    if (!isLifetimeFirstStandoff(state) || firstGuideShownThisSession) return;
    const el = ensureGuideElement();
    if (!el) return;
    el.querySelector(".sfg-title").textContent = t("battle.guideTitle");
    el.querySelector(".sfg-body").textContent = t("battle.guideBody");
    el.querySelector(".sfg-continue").textContent = t("battle.guideContinue");
    el.hidden = false;
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
    firstGuideShownThisSession = false;
    ensureObjectiveElement();
    if (objectiveEl) objectiveEl.textContent = t("battle.objective");
    applyActionMeaningHints();
    if (causalityEl) {
      causalityEl.hidden = true;
      causalityEl.innerHTML = "";
    }
    showFirstGuideIfNeeded(state);

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

    // CH-5a 章節試煉：當前章首次「穩住/回收」即通關推進（與非對峙 life-event 共用防刷）。
    // 重打已通關章不重複推進；overwhelmed/retreated 不算失敗、無任何懲罰。
    let chapterAdvance = null;
    if (CHAPTER_TRIAL_OUTCOMES.has(outcome)) {
      chapterAdvance = resolveChapterTrialAdvance(
        store.getState().chapterProgress,
        session.nodeId
      );
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
        draft.chapterProgress = applyChapterTrialAdvance(draft.chapterProgress, chapterAdvance);
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
    const layers = buildStandoffCausalityLayers(outcome);
    const causality = ensureCausalityElement();
    if (causality) {
      causality.hidden = false;
      causality.innerHTML =
        `<p><strong>${t("battle.layerImmediate")}</strong>${layers.immediate}</p>` +
        `<p><strong>${t("battle.layerEvent")}</strong>${layers.event}</p>` +
        `<p><strong>${t("battle.layerLong")}</strong>${layers.longTerm}</p>` +
        `<p class="standoff-return-preview">${t("battle.returnPreview")}</p>`;
    }
    if (statusText) {
      statusText.textContent = `${copy.title}｜${t("battle.returnPreview")}`;
    }

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
    if (actionRowEl) actionRowEl.hidden = session.turn === "ended";
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
    "#standoff-shards.fx-burst{display:inline-block;animation:fx-burst 700ms ease-out}",
    ".standoff-objective{margin:0 0 4px;padding:0 4px;font-size:12px;line-height:1.45;color:#e7f4ff;font-weight:600;text-shadow:0 1px 5px rgba(0,0,0,.85)}",
    ".act-meaning{display:block;margin-top:2px;font-size:10px;font-style:normal;font-weight:500;color:rgba(190,214,240,.88);line-height:1.35}",
    ".standoff-causality{margin:8px 4px 0;padding:8px 10px;border-radius:10px;background:rgba(6,12,28,.55);border:1px solid rgba(138,217,255,.18);font-size:11.5px;line-height:1.45;color:rgba(220,236,252,.94)}",
    ".standoff-causality p{margin:0 0 4px}",
    ".standoff-causality p:last-child{margin:0}",
    ".standoff-return-preview{color:#cfeaff;font-weight:600}",
    ".standoff-first-guide{position:absolute;inset:auto 12px 18%;left:12px;right:12px;z-index:5;padding:14px 14px 12px;border-radius:14px;background:rgba(8,14,30,.92);border:1px solid rgba(160,220,255,.28);box-shadow:0 10px 28px rgba(0,0,0,.35);text-align:center}",
    ".standoff-first-guide .sfg-title{margin:0 0 6px;font-size:14px;font-weight:700;color:#eaf6ff}",
    ".standoff-first-guide .sfg-body{margin:0 0 10px;font-size:12px;line-height:1.5;color:rgba(210,228,248,.92)}",
    ".standoff-first-guide .sfg-continue{appearance:none;border:0;border-radius:999px;padding:8px 16px;background:rgba(120,190,255,.22);color:#eaf6ff;font-size:12px;font-weight:600}"
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

// 環繞式對峙佈局 v3（Owner 真機回饋 2026-07-29）：資訊不能再借用中央演出空間。
// 佈局骨架（flex order，DOM 不動）：標題／目標／雜訊／下一拍／最新事件（頂部資訊帶）
// → 裂隙形體所在的可伸縮無字舞台（夥伴也在這裡演出）→ 心核／共鳴圈／四段膠囊行動列。
// `.rift-figure` 同時是明確的 stage spacer；因此日誌不會再以 margin-auto 浮到角色身上。
// 全部 override 自注入，不動 GROUNDWORK 的 index.html，也不改任何對峙數值或結算。
function injectStandoffLayoutStyles() {
  if (document.getElementById("standoff-layout-styles")) return;
  const style = document.createElement("style");
  style.id = "standoff-layout-styles";
  style.textContent = [
    // modal 透明化 + 上下貼邊；所有 flex 項目都有明確 order，中央不接受文字內容。
    'html[data-ui="v2"] .battle-modal{background:transparent;border-color:transparent;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;max-height:none;top:calc(var(--top-safe, 0px) + 6px);bottom:calc(var(--bottom-safe, 0px) + 10px);display:flex;flex-direction:column;gap:5px;overflow:hidden;padding:10px 14px}',
    'html[data-ui="v2"] body.standoff-active .bottom-nav--aurora{opacity:0;pointer-events:none;transition:opacity 260ms ease}',
    // 對峙全神貫注：夥伴名片與右上設定一併退場，避免與對峙標題疊字（finish 時恢復）。
    'html[data-ui="v2"] body.standoff-active .core-hud,html[data-ui="v2"] body.standoff-active .quick-hud{opacity:0;pointer-events:none;transition:opacity 260ms ease}',
    // 頂部資訊帶：階層靠字級、色彩與細光軌建立，不再堆疊卡片。
    'html[data-ui="v2"] .battle-modal .panel-header{order:0;flex:0 0 auto;text-shadow:0 1px 6px rgba(0,0,0,.85)}',
    'html[data-ui="v2"] .battle-modal .panel-header h2{margin:0;font-size:17px;line-height:1.2}',
    'html[data-ui="v2"] .battle-modal .panel-header p{margin:0 0 1px;font-size:11px}',
    'html[data-ui="v2"] .battle-modal .standoff-objective{order:1;flex:0 0 auto;margin:1px 0;padding:0 4px;display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;font-size:11px;line-height:1.38;color:rgba(235,246,255,.94)}',
    // 解散雙卡欄位：兩個 meter 直接成為 modal 的 flex 項目，雜訊上、心核下。
    'html[data-ui="v2"] .standoff-field{display:contents}',
    'html[data-ui="v2"] .standoff-meter-hint{display:none}',
    'html[data-ui="v2"] .standoff-meter-head strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    // 雜訊（敵方）＝頂部細條 HUD：無卡無框，文字靠陰影、量條自帶深色軌。
    'html[data-ui="v2"] .standoff-meter.standoff-noise{order:2;flex:0 0 auto;display:grid;gap:3px;margin:0;padding:0 2px;border:0;border-radius:0;background:none}',
    'html[data-ui="v2"] .standoff-noise .standoff-meter-head{font-size:12px;gap:8px;text-shadow:0 1px 6px rgba(0,0,0,.9)}',
    'html[data-ui="v2"] .standoff-noise .standoff-meter-head span{color:rgba(214,232,250,.88)}',
    'html[data-ui="v2"] .standoff-noise .standoff-bar{height:5px;background:rgba(5,9,22,.55);box-shadow:0 1px 4px rgba(0,0,0,.4),0 0 10px rgba(236,122,186,.12)}',
    // 下一拍與最新兩筆事件都固定在頂部；長文以單行 ticker 呈現，完整內容仍留在 DOM。
    'html[data-ui="v2"] .battle-modal .standoff-telegraph{order:3;flex:0 0 auto;display:grid;grid-template-columns:auto minmax(0,1fr);align-items:baseline;gap:7px;padding:1px 4px;border-inline-start:2px solid rgba(121,220,255,.48)}',
    'html[data-ui="v2"] .battle-modal .standoff-telegraph .tel-label{white-space:nowrap}',
    'html[data-ui="v2"] .battle-modal .standoff-telegraph .tel-hint{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    'html[data-ui="v2"] .battle-modal #battle-log{order:4;flex:0 0 auto;display:grid;gap:1px;margin:0;min-height:0;max-height:38px;overflow:hidden;padding:3px 8px 3px 10px;border:0;border-inline-start:1px solid rgba(159,202,255,.28);border-radius:0 999px 999px 0;background:linear-gradient(90deg,rgba(5,9,22,.48),rgba(5,9,22,.16) 78%,transparent);font-size:10.5px;line-height:1.35;text-shadow:0 1px 4px rgba(0,0,0,.82)}',
    'html[data-ui="v2"] .battle-modal #battle-log p{display:none;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    'html[data-ui="v2"] .battle-modal #battle-log p:nth-last-child(-n+2){display:block}',
    // 可伸縮的無字舞台：裂隙視覺偏上，夥伴的中央／下半身演出不再被文字橫切。
    'html[data-ui="v2"] .battle-modal .rift-figure{order:5;flex:1 1 210px;width:min(76%,288px);height:auto;min-height:140px;margin:0 auto;overflow:visible}',
    'html[data-ui="v2"] .battle-modal .rift-figure .rf-sprite{inset:-24px 0 auto;height:min(58%,190px);object-position:50% 12%;transform-origin:50% 28%}',
    'html[data-ui="v2"] .battle-modal .rift-figure .rf-shadow{background:radial-gradient(56% 38% at 50% 24%,rgba(4,8,18,calc(.42*var(--rift-density))),transparent 74%)}',
    'html[data-ui="v2"] .battle-modal .rift-figure .rf-mist{background:radial-gradient(52% 34% at 50% 24%,hsla(var(--rift-hue),var(--rift-sat),62%,calc(.36*var(--rift-density))),transparent 72%)}',
    'html[data-ui="v2"] .battle-modal .rift-figure .rf-core{background:radial-gradient(26% 18% at 50% 23%,hsla(var(--rift-hue),var(--rift-sat),78%,calc(.55*var(--rift-density))),transparent 66%)}',
    // 心核（玩家）＝底部流線狀態帶，和操作列形成一個連續的控制區。
    'html[data-ui="v2"] .standoff-meter.standoff-stability{order:6;flex:0 0 auto;display:grid;grid-template-columns:minmax(0,1fr);gap:3px;margin:0;padding:6px 10px 7px;border:1px solid rgba(138,217,255,.16);border-block-end:0;border-radius:18px 18px 7px 7px;background:linear-gradient(110deg,rgba(5,9,22,.68),rgba(10,20,40,.42) 58%,rgba(93,78,146,.22));box-shadow:inset 0 1px 0 rgba(216,241,255,.07),0 -10px 28px rgba(3,7,18,.12)}',
    'html[data-ui="v2"] .standoff-stability .standoff-meter-head{grid-column:1 / -1;min-width:0;padding-inline:2px 7px;box-sizing:border-box;font-size:12px;gap:8px;text-shadow:0 1px 5px rgba(0,0,0,.85)}',
    'html[data-ui="v2"] .standoff-stability .standoff-meter-head strong{min-width:0}',
    'html[data-ui="v2"] .standoff-stability .standoff-meter-head span{flex:0 0 auto;min-width:48px;margin-inline-end:10px;text-align:right;font-variant-numeric:tabular-nums}',
    'html[data-ui="v2"] .standoff-stability .standoff-bar{grid-column:1;grid-row:2;width:100%;height:5px;align-self:center}',
    'html[data-ui="v2"] .standoff-vitals-row{grid-column:1;grid-row:3;min-width:0;display:flex;flex-wrap:nowrap;align-items:center;justify-content:flex-end;gap:4px;margin-inline:1px 10px;font-size:9px;white-space:nowrap}',
    'html[data-ui="v2"] .battle-modal .circle-strip{order:7;margin:0}',
    // 四個動作合成一條分段膠囊；不是四張說明卡。文字提示保留為可存取內容。
    'html[data-ui="v2"] .battle-modal #standoff-action-row{order:8;flex:0 0 auto;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px;padding:3px;border:1px solid rgba(138,217,255,.18);border-radius:999px;background:linear-gradient(100deg,rgba(5,10,25,.86),rgba(20,25,54,.72));box-shadow:inset 0 1px 0 rgba(224,244,255,.08),0 10px 28px rgba(0,0,0,.22)}',
    'html[data-ui="v2"] .battle-modal #standoff-action-row[hidden]{display:none}',
    'html[data-ui="v2"] .battle-modal #standoff-action-row button{position:relative;min-width:0;min-height:44px;place-content:center;padding:7px 4px;border:0;border-radius:999px;background:transparent;text-align:center;box-shadow:none}',
    'html[data-ui="v2"] .battle-modal #standoff-action-row button+button::before{content:"";position:absolute;inset:10px auto 10px -2px;width:1px;background:linear-gradient(transparent,rgba(174,220,255,.22),transparent)}',
    'html[data-ui="v2"] .battle-modal #standoff-action-row button strong{font-size:11px;line-height:1.2;white-space:nowrap}',
    'html[data-ui="v2"] .battle-modal #standoff-action-row button:focus-visible{outline:2px solid rgba(161,228,255,.9);outline-offset:1px;background:rgba(98,179,230,.16)}',
    'html[data-ui="v2"] .battle-modal #standoff-action-row button:disabled{opacity:.38}',
    'html[data-ui="v2"] .battle-modal #battle-finish{order:10;flex:0 0 auto;min-height:44px;border-radius:999px}',
    'html[data-ui="v2"] .battle-modal .standoff-causality{order:9;flex:0 0 auto;max-height:128px;overflow:auto;margin:0;padding:8px 10px;border-radius:14px;background:linear-gradient(110deg,rgba(5,10,25,.82),rgba(17,24,48,.66))}',
    // backdrop：上深（狀態可讀）、中淡（夥伴可見）、下略深（行動列對比）。
    'html[data-ui="v2"] .panel-layer[data-active-panel="battle"] .panel-backdrop{background:linear-gradient(180deg,rgba(2,6,12,.56),rgba(2,6,12,.08) 31%,rgba(2,6,12,.04) 70%,rgba(2,6,12,.48))}',
    // 手機：次要說明只做視覺隱藏（仍可由輔助科技讀取），讓行動列保持俐落單層。
    '@media (max-width:720px){html[data-ui="v2"] .battle-modal #standoff-action-row button em,html[data-ui="v2"] .battle-modal #standoff-action-row button .act-meaning{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}}',
    // 短視窗只顯示最新事件；優先保住舞台，不把控制列縮到 44px 以下。
    '@media (max-height:720px){html[data-ui="v2"] .battle-modal{gap:4px;padding-block:8px}html[data-ui="v2"] .battle-modal .panel-header h2{font-size:16px}html[data-ui="v2"] .battle-modal .standoff-objective{-webkit-line-clamp:1;font-size:10.5px}html[data-ui="v2"] .battle-modal #battle-log{max-height:20px;padding-block:2px}html[data-ui="v2"] .battle-modal #battle-log p{display:none!important}html[data-ui="v2"] .battle-modal #battle-log p:last-child{display:block!important}html[data-ui="v2"] .battle-modal .rift-figure{flex-basis:180px;min-height:118px}html[data-ui="v2"] .battle-modal .rift-figure .rf-sprite{inset:-8px 0 auto;height:min(44%,118px)}html[data-ui="v2"] .standoff-meter.standoff-stability{padding-block:5px}html[data-ui="v2"] .standoff-vitals-row{font-size:8.75px}}'
  ].join("");
  document.head.appendChild(style);
}

function flashOnce(el, className, ms = 500) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth; // 重啟一次性動畫
  el.classList.add(className);
  window.setTimeout(() => el.classList.remove(className), ms);
}
