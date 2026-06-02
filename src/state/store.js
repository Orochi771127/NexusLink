import defaultState from "./defaultState.js";
import { clamp } from "../utils/clamp.js";

let state = createDefaultState();
const listeners = new Set();

export function createDefaultState() {
  return {
    ...defaultState,
    lastSeenAt: Date.now(),
    chatHistory: defaultState.chatHistory.map((item) => ({ ...item }))
  };
}

export function getState() {
  return state;
}

export function setState(partial) {
  state = normalizeState({ ...state, ...partial });
  notify();
  return state;
}

export function replaceState(nextState) {
  state = normalizeState(nextState);
  notify();
  return state;
}

export function updateState(mutator) {
  const draft = normalizeState({ ...state, chatHistory: state.chatHistory.map((item) => ({ ...item })) });
  const result = mutator(draft);
  state = normalizeState(result || draft);
  notify();
  return state;
}

export function normalizeState(rawState = {}) {
  const baseState = createDefaultState();
  const targetState = { ...baseState, ...rawState };
  const chatHistory = Array.isArray(targetState.chatHistory) ? targetState.chatHistory : baseState.chatHistory;

  return {
    ...targetState,
    bond: clamp(targetState.bond, 0, 100),
    trust: clamp(targetState.trust, 0, 100),
    mood: targetState.mood || baseState.mood,
    energy: clamp(targetState.energy, 0, 10),
    spamScore: clamp(targetState.spamScore, 0, 999),
    defense: clamp(targetState.defense ?? baseState.defense, 0, 100),
    touchFatigue: clamp(targetState.touchFatigue ?? baseState.touchFatigue, 0, 10),
    lastTouchAt: targetState.lastTouchAt ?? null,
    lastSeenAt: Number(targetState.lastSeenAt) || Date.now(),
    firstTouchCompleted: Boolean(targetState.firstTouchCompleted),
    reactionPreview: targetState.reactionPreview || "",
    lastTouchReaction: targetState.lastTouchReaction || "",
    lastMessage: targetState.lastMessage || "",
    chatHistory: chatHistory.map((item) => ({
      role: item.role === "fox" ? "companion" : item.role || "companion",
      text: String(item.text || "")
    }))
  };
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notify() {
  listeners.forEach((listener) => listener(state));
}
