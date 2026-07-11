export type ArenaSound = "play" | "pass";

const SOUND_CONFIG: Record<ArenaSound, { frequency: number; duration: number }> = {
  play: { frequency: 520, duration: 0.08 },
  pass: { frequency: 260, duration: 0.06 },
};

export function playArenaSound(sound: ArenaSound, enabled: boolean): void {
  if (!enabled || typeof window === "undefined" || !window.AudioContext) return;

  const context = new window.AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const config = SOUND_CONFIG[sound];
  const now = context.currentTime;

  oscillator.frequency.value = config.frequency;
  oscillator.type = "sine";
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + config.duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + config.duration);
  oscillator.addEventListener("ended", () => void context.close());
}
