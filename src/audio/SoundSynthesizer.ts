import { triggerPlatformHaptic } from '../core/MobilePlatform';
import type { GameSettings, WeaponTierId } from '../core/types';

/**
 * Zero-dependency procedural Web Audio API sound synthesizer + mobile haptics wrapper.
 * Pre-allocates one shared 1.0s white-noise AudioBuffer on unlock (zero per-shot GC) to layer
 * crisp ballistic transients, barrel/tire shatter crunches, maul slams, and metallic coin chimes.
 */
export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private settings: GameSettings;
  private lastShotSoundTime = 0;
  private lastGateTickTime = 0;
  private lastCoinSoundTime = 0;
  private noiseCursor = 0;

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
    if (this.ctx && !this.noiseBuffer) {
      const sampleRate = this.ctx.sampleRate;
      const buf = this.ctx.createBuffer(1, sampleRate, sampleRate);
      const data = buf.getChannelData(0);
      let seed = 0x9e3779b9;
      for (let i = 0; i < sampleRate; i++) {
        seed = (seed * 1664525 + 1013904223) | 0;
        data[i] = ((seed >>> 0) / 0xffffffff) * 2 - 1;
      }
      this.noiseBuffer = buf;
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

  private playFilteredNoise(
    ctx: AudioContext,
    startTime: number,
    duration: number,
    filterType: BiquadFilterType,
    freq: number,
    q: number,
    peakGain: number
  ): void {
    if (!this.noiseBuffer || peakGain <= 0.0005) {
      return;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(freq, startTime);
    filter.Q.setValueAtTime(q, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(peakGain, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

    src.connect(filter).connect(gain).connect(ctx.destination);
    this.noiseCursor = (this.noiseCursor + 0.13) % 0.72;
    src.start(startTime, this.noiseCursor, duration + 0.01);
  }

  public playGunfire(tier: WeaponTierId, squadCount = 1): void {
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime;
    if (now - this.lastShotSoundTime < 0.052) {
      return;
    }
    this.lastShotSoundTime = now;

    // Subtle crowd-size harmonic presence (1 -> 40 commandos) without speaker clipping
    const crowdFactor = Math.min(1, Math.max(0, (squadCount - 1) / 39));
    const gainScale = 1 + crowdFactor * 0.28;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (tier === 5) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.068);
      gain.gain.setValueAtTime(0.054 * gainScale, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.068);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.072);
      this.playFilteredNoise(ctx, now, 0.032, 'bandpass', 3200, 2.4, 0.022 * gainScale);
      return;
    }

    osc.type = tier >= 3 ? 'sawtooth' : 'triangle';
    const startFreq = tier === 4 ? 275 : tier === 3 ? 220 : tier === 2 ? 320 : 295;
    osc.frequency.setValueAtTime(startFreq * (1 - crowdFactor * 0.06), now);
    osc.frequency.exponentialRampToValueAtTime(64, now + 0.048);

    gain.gain.setValueAtTime(0.044 * gainScale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.052);

    // Crisp ballistic snap transient
    const snapFreq = tier >= 3 ? 1850 : 2400;
    const snapGain = (tier === 4 ? 0.036 : 0.028) * gainScale;
    this.playFilteredNoise(ctx, now, 0.030, 'bandpass', snapFreq, 1.4, snapGain);
  }

  public playCoinPickup(): void {
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime;
    if (now - this.lastCoinSoundTime < 0.068) {
      return;
    }
    this.lastCoinSoundTime = now;

    const notes = [1318.51, 1760.0];
    for (let i = 0; i < notes.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.032;
      osc.frequency.setValueAtTime(notes[i], t);
      gain.gain.setValueAtTime(0.038, t);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.085);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    }
  }

  public playGateTick(currentValue: number): void {
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const now = ctx.currentTime;
    if (now - this.lastGateTickTime < 0.038) {
      return;
    }
    this.lastGateTickTime = now;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const clampedVal = Math.max(-25, Math.min(35, currentValue));
    const freq =
      currentValue > 0 && currentValue < 4
        ? 540 + (currentValue - 1.0) * 320
        : 420 + (clampedVal + 25) * 11;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.18, now + 0.042);

    gain.gain.setValueAtTime(0.048, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.052);
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
    pop.frequency.setValueAtTime(205, base);
    pop.frequency.exponentialRampToValueAtTime(52, base + 0.12);
    popGain.gain.setValueAtTime(0.11, base);
    popGain.gain.exponentialRampToValueAtTime(0.001, base + 0.13);
    pop.connect(popGain).connect(ctx.destination);
    pop.start(base);
    pop.stop(base + 0.14);

    // Tactile crate/rubber shatter crunch
    this.playFilteredNoise(ctx, base, 0.095, 'bandpass', 920, 0.9, 0.068);

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
    this.playFilteredNoise(ctx, now, 0.038, 'lowpass', 1100, 1.0, 0.025);
  }

  public playBossDefeat(): void {
    this.vibrate(12);
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const base = ctx.currentTime;
    this.playFilteredNoise(ctx, base, 0.26, 'lowpass', 620, 0.8, 0.095);

    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
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
      this.playFilteredNoise(ctx, now, 0.16, 'lowpass', 540, 1.1, 0.085);
    }
  }

  public playUpgradeBuy(newLevel = 1): void {
    this.vibrate(10);
    const ctx = this.ensureReady();
    if (!ctx) {
      return;
    }
    const base = ctx.currentTime;
    const pipStep = ((Math.max(1, newLevel) - 1) % 5) * 0.06;
    const pitchMult = 1 + pipStep;
    const tones = [587.33 * pitchMult, 783.99 * pitchMult, 1174.66 * pitchMult];
    for (let i = 0; i < tones.length; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = base + i * 0.042;
      osc.frequency.setValueAtTime(tones[i], t);
      gain.gain.setValueAtTime(0.072, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    }
  }
}
