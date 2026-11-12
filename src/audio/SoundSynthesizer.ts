import { triggerPlatformHaptic } from '../core/MobilePlatform';
import type { GameSettings, WeaponTierId } from '../core/types';

/**
 * Zero-dependency procedural Web Audio API sound synthesizer + mobile haptics wrapper.
 * Unlocks AudioContext cleanly on the first user gesture without throwing warnings.
 */
export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private settings: GameSettings;
  private lastShotSoundTime = 0;
  private lastGateTickTime = 0;

  constructor(settings: GameSettings) {
    this.settings = settings;
  }

  public updateSettings(settings: GameSettings): void {
    this.settings = settings;
  }

  public unlockOnGesture(): void {
    if (this.settings.muted) {
      return;
    }
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  public vibrate(durationMs = 12): void {
    if (!this.settings.haptics) {
      return;
    }
    triggerPlatformHaptic(durationMs);
  }

  private ensureReady(): AudioContext | null {
    if (this.settings.muted || !this.ctx || this.ctx.state !== 'running') {
      return null;
    }
    return this.ctx;
  }

  public playGunfire(tier: WeaponTierId): void {
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime;
    if (now - this.lastShotSoundTime < 0.055) {
      return;
    }
    this.lastShotSoundTime = now;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (tier === 5) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.065);
      gain.gain.setValueAtTime(0.055, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
      return;
    }

    osc.type = tier >= 3 ? 'sawtooth' : 'triangle';
    const startFreq = tier === 4 ? 260 : tier === 3 ? 210 : 300;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(68, now + 0.045);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playGateTick(currentValue: number): void {
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime;
    if (now - this.lastGateTickTime < 0.04) {
      return;
    }
    this.lastGateTickTime = now;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const clampedVal = Math.max(-25, Math.min(35, currentValue));
    const freq = 420 + (clampedVal + 25) * 9;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + 0.04);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playGateFlipChime(): void {
    this.vibrate(12);
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const base = ctx.currentTime;
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = base + i * 0.045;
      osc.frequency.setValueAtTime(notes[i], t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    }
  }

  public playGateCollect(positive: boolean): void {
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = positive ? 'triangle' : 'sawtooth';
    if (positive) {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.14);
    } else {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(85, now + 0.18);
    }
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playRicochet(): void {
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime;
    if (now - this.lastGateTickTime < 0.07) {
      return;
    }
    this.lastGateTickTime = now;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1350, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.035);
    gain.gain.setValueAtTime(0.022, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  public playTireBreak(upgradedWeapon: boolean): void {
    this.vibrate(12);
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const base = ctx.currentTime;
    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    pop.type = 'triangle';
    pop.frequency.setValueAtTime(190, base);
    pop.frequency.exponentialRampToValueAtTime(55, base + 0.11);
    popGain.gain.setValueAtTime(0.11, base);
    popGain.gain.exponentialRampToValueAtTime(0.001, base + 0.12);
    pop.connect(popGain).connect(ctx.destination);
    pop.start(base);
    pop.stop(base + 0.13);

    const tones = upgradedWeapon ? [587.33, 880, 1174.66] : [659.25, 987.77];
    for (let i = 0; i < tones.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = base + 0.04 + i * 0.05;
      osc.frequency.setValueAtTime(tones[i], t);
      gain.gain.setValueAtTime(0.075, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    }
  }

  public playEnemyPop(): void {
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.06);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playBossDefeat(): void {
    this.vibrate(12);
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    const base = ctx.currentTime;
    for (let i = 0; i < chord.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = base + i * 0.065;
      osc.frequency.setValueAtTime(chord[i], t);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    }
  }

  public playBossSalvoWarning(): void {
    this.vibrate(10);
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const base = ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const t = base + i * 0.12;
      osc.frequency.setValueAtTime(540, t);
      osc.frequency.exponentialRampToValueAtTime(820, t + 0.09);
      gain.gain.setValueAtTime(0.055, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.11);
    }
  }

  public playBossSalvoImpact(dodged: boolean): void {
    if (!dodged) {
      this.vibrate(20);
    }
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    if (dodged) {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.09);
      gain.gain.setValueAtTime(0.055, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(165, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.22);
      gain.gain.setValueAtTime(0.13, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  public playUpgradeBuy(): void {
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const base = ctx.currentTime;
    const tones = [659.25, 880];
    for (let i = 0; i < tones.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = base + i * 0.045;
      osc.frequency.setValueAtTime(tones[i], t);
      gain.gain.setValueAtTime(0.065, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    }
  }
}
