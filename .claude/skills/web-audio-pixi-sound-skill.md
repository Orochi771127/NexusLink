# Web Audio & Pixi Sound Synthesis Skill

This skill provides audio synthesis, ambient music, and interactive sound effect patterns for Nexus Link.

## Core Rules
1. Handle browser AudioContext user-gesture unlock automatically.
2. Use dynamic Web Audio synthesis or `@pixi/sound` for low-footprint audio.
3. Ambient soundscapes (Moonlake wind, water, rain) should fade smoothly.

## Code Pattern: Web Audio Synthesis
```javascript
export function playEmotionalCueSynth(audioCtx, frequency = 440, type = 'sine') {
  if (!audioCtx || audioCtx.state !== 'running') return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 1.2);
}
```
