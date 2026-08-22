export function normalizeSeed(seed) {
  const normalized = Number(seed) >>> 0;
  return normalized === 0 ? 0x6d2b79f5 : normalized;
}

export function nextSeededValue(seed) {
  let state = normalizeSeed(seed);
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  state >>>= 0;
  return Object.freeze({ state, value: state / 0x100000000 });
}

export function createSeededRng(seed) {
  let state = normalizeSeed(seed);
  return Object.freeze({
    next() {
      const result = nextSeededValue(state);
      state = result.state;
      return result.value;
    },
    getState() {
      return state;
    }
  });
}
