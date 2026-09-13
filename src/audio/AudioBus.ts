/**
 * Silent until first pointerdown; then Web Audio oscillator beep for ui_click.
 */

let ctx: AudioContext | null = null;
let unlocked = false;
let unlockBound = false;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

async function unlock(): Promise<void> {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') {
    try {
      await c.resume();
    } catch {
      return;
    }
  }
  unlocked = true;
}

function onFirstPointer(): void {
  void unlock();
}

export function bindAudioUnlock(): void {
  if (unlockBound) return;
  unlockBound = true;
  const opts: AddEventListenerOptions = { once: true, capture: true };
  window.addEventListener('pointerdown', onFirstPointer, opts);
  window.addEventListener('touchstart', onFirstPointer, opts);
  window.addEventListener('keydown', onFirstPointer, opts);
}

export function isAudioUnlocked(): boolean {
  return unlocked;
}

/** Tiny UI click beep (silent until unlocked). */
export function playUiClick(): void {
  if (!unlocked) return;
  const c = getCtx();
  if (!c || c.state !== 'running') return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.value = 660;
  gain.gain.value = 0.04;
  const now = c.currentTime;
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.09);
}

export const AudioBus = {
  bindUnlock: bindAudioUnlock,
  isUnlocked: isAudioUnlocked,
  uiClick: playUiClick,
};
