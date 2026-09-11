// Tiny helper for one-shot local SFX playback. Sounds must be bundled under
// public/assets/sfx and referenced by path — no external URLs at runtime.
export function playSound(src: string, volume = 0.6) {
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    // play() rejects if the browser blocks autoplay before any user gesture;
    // these are only ever called from click handlers, but swallow just in case.
    audio.play().catch(() => {});
  } catch {
    // ignore — sound is a non-critical enhancement
  }
}
