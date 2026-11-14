const ROYGBIV_HEX = [
  '#ff295c', // Red-Rose
  '#ff8a1e', // Vivid Orange
  '#ffe82e', // Sunbeam Yellow
  '#22eb6a', // Kelly Emerald
  '#1ec8ff', // Sky Cyan
  '#3f68ff', // Royal Blue
  '#d23cff', // Electric Violet
] as const;

interface FireworkRocket {
  active: boolean;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  age: number;
  fuseTime: number;
  colorIndex: number;
  style: 0 | 1 | 2; // 0 = Full ROYGBIV Ring, 1 = Starburst + Gold Willow, 2 = Double Peony
}

interface FireworkSpark {
  active: boolean;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  size: number;
  color: string;
  twinklePhase: number;
  isStar: boolean;
}

interface SkyFlashRing {
  active: boolean;
  x: number;
  y: number;
  age: number;
  maxAge: number;
  maxRadius: number;
  color: string;
}

export interface UnicornCelebrationCallbacks {
  onFireworkLaunchSound: (pitchStep: number) => void;
}

const MAX_ROCKETS = 18;
const MAX_SPARKS = 560;
const MAX_RINGS = 16;
export const UNICORN_SPLASH_PRE_CARD_DURATION = 1.8;
const ENDLESS_FLYBY_DURATION = 1.6;

export class UnicornCelebrationOverlay {
  private readonly rootEl: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly bannerEl: HTMLElement;
  private readonly kickerEl: HTMLElement;
  private readonly titleEl: HTMLElement;
  private readonly callbacks: UnicornCelebrationCallbacks;

  private mode: 'INACTIVE' | 'VICTORY_SPLASH' | 'VICTORY_CARD_BG' | 'ENDLESS_FLYBY' =
    'INACTIVE';
  private elapsed = 0;
  private nextLaunchTimer = 0;
  private launchCount = 0;
  private hornRecoil = 0;
  private muzzleFlash = 0;
  private revealCallback: (() => void) | null = null;

  private viewW = 412;
  private viewH = 915;
  private dpr = 1;

  private readonly rockets: FireworkRocket[] = [];
  private readonly sparks: FireworkSpark[] = [];
  private readonly rings: SkyFlashRing[] = [];

  constructor(callbacks: UnicornCelebrationCallbacks) {
    this.callbacks = callbacks;

    const root = document.getElementById('unicorn-celebration-overlay');
    const canvas = document.getElementById(
      'unicorn-celebration-canvas'
    ) as HTMLCanvasElement | null;
    const banner = document.getElementById('unicorn-splash-banner');
    const kicker = document.getElementById('unicorn-splash-kicker');
    const title = document.getElementById('unicorn-splash-title');

    if (!root || !canvas || !banner || !kicker || !title) {
      throw new Error('Missing #unicorn-celebration-overlay DOM elements');
    }

    this.rootEl = root;
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('2D context unavailable for UnicornCelebrationOverlay');
    }
    this.ctx = context;
    this.bannerEl = banner;
    this.kickerEl = kicker;
    this.titleEl = title;

    for (let i = 0; i < MAX_ROCKETS; i++) {
      this.rockets.push({
        active: false,
        x: 0,
        y: 0,
        prevX: 0,
        prevY: 0,
        vx: 0,
        vy: 0,
        age: 0,
        fuseTime: 0.3,
        colorIndex: 0,
        style: 0,
      });
    }

    for (let i = 0; i < MAX_SPARKS; i++) {
      this.sparks.push({
        active: false,
        x: 0,
        y: 0,
        prevX: 0,
        prevY: 0,
        vx: 0,
        vy: 0,
        age: 0,
        maxAge: 1,
        size: 3,
        color: '#ffffff',
        twinklePhase: 0,
        isStar: false,
      });
    }

    for (let i = 0; i < MAX_RINGS; i++) {
      this.rings.push({
        active: false,
        x: 0,
        y: 0,
        age: 0,
        maxAge: 0.45,
        maxRadius: 90,
        color: '#ffe82e',
      });
    }

    // Tapping during the 1.8s unobstructed splash reveals the Victory Payout Card early
    this.rootEl.addEventListener('pointerdown', (e) => {
      if (this.mode === 'VICTORY_SPLASH' && this.elapsed >= 0.12) {
        e.stopPropagation();
        this.revealVictoryCardNow();
      }
    });

    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }

  public get isPreCardSplashActive(): boolean {
    return this.mode === 'VICTORY_SPLASH';
  }

  public get isActive(): boolean {
    return this.mode !== 'INACTIVE';
  }

  private readonly handleResize = (): void => {
    const rect = this.rootEl.parentElement?.getBoundingClientRect();
    this.viewW = Math.max(1, Math.round(rect?.width || window.innerWidth || 412));
    this.viewH = Math.max(1, Math.round(rect?.height || window.innerHeight || 915));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.viewW * this.dpr);
    this.canvas.height = Math.round(this.viewH * this.dpr);
  };

  private clearPools(): void {
    for (let i = 0; i < MAX_ROCKETS; i++) this.rockets[i].active = false;
    for (let i = 0; i < MAX_SPARKS; i++) this.sparks[i].active = false;
    for (let i = 0; i < MAX_RINGS; i++) this.rings[i].active = false;
  }

  public startVictoryFinale(
    kickerText: string,
    titleText: string,
    onRevealCard: () => void
  ): void {
    this.handleResize();
    this.clearPools();
    this.mode = 'VICTORY_SPLASH';
    this.elapsed = 0;
    this.nextLaunchTimer = 0.08;
    this.launchCount = 0;
    this.hornRecoil = 0;
    this.muzzleFlash = 1;
    this.revealCallback = onRevealCard;

    this.kickerEl.textContent = kickerText;
    this.titleEl.textContent = titleText;
    this.bannerEl.classList.remove('is-hidden');

    this.rootEl.classList.remove('is-hidden', 'is-behind-card', 'is-flyby');
    this.rootEl.classList.add('is-splash-interactive');
  }

  public playEndlessWaveFlyby(waveCleared: number): void {
    this.handleResize();
    this.clearPools();
    this.mode = 'ENDLESS_FLYBY';
    this.elapsed = 0;
    this.nextLaunchTimer = 0.06;
    this.launchCount = 0;
    this.hornRecoil = 0;
    this.muzzleFlash = 0.9;
    this.revealCallback = null;

    this.kickerEl.textContent = `ENDLESS WAVE ${waveCleared} CLEARED!`;
    this.titleEl.textContent = 'UNICORN FIREWORKS!';
    this.bannerEl.classList.remove('is-hidden');

    this.rootEl.classList.remove('is-hidden', 'is-splash-interactive', 'is-behind-card');
    this.rootEl.classList.add('is-flyby');
  }

  public revealVictoryCardNow(): void {
    if (this.mode !== 'VICTORY_SPLASH') {
      return;
    }
    this.mode = 'VICTORY_CARD_BG';
    this.bannerEl.classList.add('is-hidden');
    this.rootEl.classList.remove('is-splash-interactive');
    this.rootEl.classList.add('is-behind-card');
    this.nextLaunchTimer = 0.25;

    const cb = this.revealCallback;
    this.revealCallback = null;
    if (cb) {
      cb();
    }
  }

  public stop(): void {
    if (this.mode === 'INACTIVE') {
      return;
    }
    this.mode = 'INACTIVE';
    this.revealCallback = null;
    this.clearPools();
    this.bannerEl.classList.add('is-hidden');
    this.rootEl.classList.add('is-hidden');
    this.rootEl.classList.remove('is-splash-interactive', 'is-behind-card', 'is-flyby');
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private computeHornGeometry(): {
    baseX: number;
    baseY: number;
    tipX: number;
    tipY: number;
    hornLength: number;
    baseHalfWidth: number;
    tiltAngle: number;
  } {
    const w = this.viewW;
    const h = this.viewH;

    let popProgress = 1;
    if (this.mode === 'ENDLESS_FLYBY') {
      const enter = Math.min(1, this.elapsed / 0.26);
      const exit =
        this.elapsed > ENDLESS_FLYBY_DURATION - 0.34
          ? Math.max(0, (ENDLESS_FLYBY_DURATION - this.elapsed) / 0.34)
          : 1;
      popProgress = (1 - Math.pow(1 - enter, 3)) * exit;
    } else {
      const t = Math.min(1, this.elapsed / 0.34);
      // Crisp spring overshoot
      popProgress = 1 - Math.pow(1 - t, 3) + Math.sin(t * Math.PI) * 0.08;
    }

    const settleFactor =
      this.mode === 'VICTORY_CARD_BG'
        ? Math.min(1, Math.max(0, (this.elapsed - UNICORN_SPLASH_PRE_CARD_DURATION) / 0.35))
        : 0;

    const fullLen =
      this.mode === 'ENDLESS_FLYBY'
        ? Math.min(250, h * 0.29)
        : Math.min(355, h * (0.39 - settleFactor * 0.13));

    const recoilPx = this.hornRecoil * 16;
    const slideOffset = (1 - popProgress) * (fullLen + 70);
    const tiltAngle = Math.sin(this.elapsed * 3.4) * 0.045;

    const baseX = w * 0.5;
    const baseY = h + 18 + slideOffset + recoilPx;
    const tipX = baseX + Math.sin(tiltAngle) * fullLen;
    const tipY = baseY - Math.cos(tiltAngle) * fullLen;
    const baseHalfWidth = Math.max(30, Math.min(54, fullLen * 0.165));

    return {
      baseX,
      baseY,
      tipX,
      tipY,
      hornLength: fullLen,
      baseHalfWidth,
      tiltAngle,
    };
  }

  private spawnRocketVolley(tipX: number, tipY: number): void {
    const w = this.viewW;
    const h = this.viewH;

    // Initial grand 3-shell fan on first launch in VICTORY_SPLASH!
    const count =
      this.mode === 'VICTORY_SPLASH' && this.launchCount === 0
        ? 3
        : this.mode === 'VICTORY_SPLASH' && this.launchCount === 2
          ? 2
          : 1;

    for (let k = 0; k < count; k++) {
      const slot = this.rockets.find((r) => !r.active);
      if (!slot) {
        break;
      }
      const idx = this.launchCount + k;
      let targetX: number;
      let targetY: number;

      if (this.mode === 'VICTORY_CARD_BG') {
        // Frame left/right/top edges around the centered payout card!
        const leftSide = idx % 2 === 0;
        targetX = leftSide
          ? w * (0.14 + ((idx * 17) % 16) * 0.01)
          : w * (0.86 - ((idx * 13) % 16) * 0.01);
        targetY = h * (0.15 + ((idx * 19) % 24) * 0.01);
      } else if (count === 3) {
        const lanes = [0.22, 0.50, 0.78];
        const heights = [0.32, 0.21, 0.30];
        targetX = w * lanes[k];
        targetY = h * heights[k];
      } else {
        const presetsX = [0.50, 0.24, 0.76, 0.34, 0.66, 0.20, 0.80];
        const presetsY = [0.23, 0.31, 0.28, 0.20, 0.22, 0.36, 0.34];
        targetX = w * presetsX[idx % presetsX.length];
        targetY = h * presetsY[idx % presetsY.length];
      }

      const fuse = this.mode === 'VICTORY_CARD_BG' ? 0.34 : 0.25 + (k % 2) * 0.05;
      const gravity = 240;
      const vx = (targetX - tipX) / fuse;
      const vy = (targetY - tipY - 0.5 * gravity * fuse * fuse) / fuse;

      slot.active = true;
      slot.x = tipX;
      slot.y = tipY;
      slot.prevX = tipX;
      slot.prevY = tipY;
      slot.vx = vx;
      slot.vy = vy;
      slot.age = 0;
      slot.fuseTime = fuse;
      slot.colorIndex = idx % ROYGBIV_HEX.length;
      slot.style = (idx % 3) as 0 | 1 | 2;
    }

    this.hornRecoil = 1.0;
    this.muzzleFlash = 1.0;
    this.callbacks.onFireworkLaunchSound(this.launchCount);
    this.launchCount += count;

    // Muzzle star sparks right out of the Unicorn Horn tip!
    for (let m = 0; m < 10; m++) {
      const sp = this.sparks.find((s) => !s.active);
      if (!sp) break;
      const ang = -Math.PI * 0.5 + ((m / 9) - 0.5) * 1.15;
      const spd = 110 + (m % 4) * 45;
      sp.active = true;
      sp.x = tipX;
      sp.y = tipY;
      sp.prevX = tipX;
      sp.prevY = tipY;
      sp.vx = Math.cos(ang) * spd;
      sp.vy = Math.sin(ang) * spd;
      sp.age = 0;
      sp.maxAge = 0.28;
      sp.size = 3.2;
      sp.color = m % 2 === 0 ? '#fff59e' : ROYGBIV_HEX[m % ROYGBIV_HEX.length];
      sp.twinklePhase = m * 0.9;
      sp.isStar = m % 3 === 0;
    }
  }

  private detonateRocket(r: FireworkRocket): void {
    const ring = this.rings.find((fl) => !fl.active);
    if (ring) {
      ring.active = true;
      ring.x = r.x;
      ring.y = r.y;
      ring.age = 0;
      ring.maxAge = 0.44;
      ring.maxRadius = this.mode === 'VICTORY_CARD_BG' ? 86 : 112;
      ring.color = ROYGBIV_HEX[r.colorIndex];
    }

    const outerCount = this.mode === 'VICTORY_CARD_BG' ? 34 : 46;
    const innerCount = r.style === 2 ? 20 : 14;

    for (let i = 0; i < outerCount; i++) {
      const sp = this.sparks.find((s) => !s.active);
      if (!sp) break;
      const frac = i / outerCount;
      const ang = frac * Math.PI * 2 + (i % 2) * 0.04;
      const starLobe = r.style === 1 ? 1 + 0.26 * Math.cos(ang * 5) : 1;
      const spd = (155 + (i % 5) * 28) * starLobe;

      sp.active = true;
      sp.x = r.x;
      sp.y = r.y;
      sp.prevX = r.x;
      sp.prevY = r.y;
      sp.vx = Math.cos(ang) * spd;
      sp.vy = Math.sin(ang) * spd;
      sp.age = 0;
      sp.maxAge = 0.78 + (i % 4) * 0.12;
      sp.size = i % 4 === 0 ? 4.4 : 3.1;
      sp.color =
        r.style === 0
          ? ROYGBIV_HEX[i % ROYGBIV_HEX.length]
          : i % 3 === 0
            ? '#fff7ad'
            : ROYGBIV_HEX[(r.colorIndex + (i % 3)) % ROYGBIV_HEX.length];
      sp.twinklePhase = i * 0.7;
      sp.isStar = i % 5 === 0;
    }

    for (let j = 0; j < innerCount; j++) {
      const sp = this.sparks.find((s) => !s.active);
      if (!sp) break;
      const ang = (j / innerCount) * Math.PI * 2 + 0.2;
      const spd = 72 + (j % 3) * 22;
      sp.active = true;
      sp.x = r.x;
      sp.y = r.y;
      sp.prevX = r.x;
      sp.prevY = r.y;
      sp.vx = Math.cos(ang) * spd;
      sp.vy = Math.sin(ang) * spd;
      sp.age = 0;
      sp.maxAge = 0.62 + (j % 3) * 0.10;
      sp.size = 3.4;
      sp.color = j % 2 === 0 ? '#ffffff' : '#ffe82e';
      sp.twinklePhase = j * 1.1;
      sp.isStar = j % 2 === 0;
    }
  }

  public tick(dt: number): void {
    if (this.mode === 'INACTIVE') {
      return;
    }

    const clampedDt = Math.min(0.05, Math.max(0.001, dt));
    this.elapsed += clampedDt;
    this.hornRecoil = Math.max(0, this.hornRecoil - clampedDt * 5.2);
    this.muzzleFlash = Math.max(0, this.muzzleFlash - clampedDt * 6.5);

    if (
      this.mode === 'VICTORY_SPLASH' &&
      this.elapsed >= UNICORN_SPLASH_PRE_CARD_DURATION
    ) {
      this.revealVictoryCardNow();
    } else if (
      this.mode === 'ENDLESS_FLYBY' &&
      this.elapsed >= ENDLESS_FLYBY_DURATION
    ) {
      this.stop();
      return;
    }

    const horn = this.computeHornGeometry();

    // Launch schedule
    const canLaunch =
      this.mode === 'VICTORY_SPLASH'
        ? this.elapsed < UNICORN_SPLASH_PRE_CARD_DURATION - 0.18
        : this.mode === 'ENDLESS_FLYBY'
          ? this.elapsed < ENDLESS_FLYBY_DURATION - 0.55
          : true;

    if (canLaunch) {
      this.nextLaunchTimer -= clampedDt;
      if (this.nextLaunchTimer <= 0) {
        this.spawnRocketVolley(horn.tipX, horn.tipY);
        this.nextLaunchTimer =
          this.mode === 'VICTORY_SPLASH'
            ? 0.24
            : this.mode === 'ENDLESS_FLYBY'
              ? 0.22
              : 0.58;
      }
    }

    // Update flying firework shells
    for (let i = 0; i < MAX_ROCKETS; i++) {
      const r = this.rockets[i];
      if (!r.active) continue;
      r.prevX = r.x;
      r.prevY = r.y;
      r.vy += 240 * clampedDt;
      r.x += r.vx * clampedDt;
      r.y += r.vy * clampedDt;
      r.age += clampedDt;

      // Comet glitter trail
      if (Math.floor(r.age * 60) % 2 === 0) {
        const trail = this.sparks.find((s) => !s.active);
        if (trail) {
          trail.active = true;
          trail.x = r.x;
          trail.y = r.y;
          trail.prevX = r.x;
          trail.prevY = r.y;
          trail.vx = -r.vx * 0.08 + (i % 3 - 1) * 18;
          trail.vy = 24;
          trail.age = 0;
          trail.maxAge = 0.22;
          trail.size = 2.6;
          trail.color = '#ffe97d';
          trail.twinklePhase = r.age * 12;
          trail.isStar = false;
        }
      }

      if (r.age >= r.fuseTime) {
        r.active = false;
        this.detonateRocket(r);
      }
    }

    // Update detonation flash rings
    for (let i = 0; i < MAX_RINGS; i++) {
      const ring = this.rings[i];
      if (!ring.active) continue;
      ring.age += clampedDt;
      if (ring.age >= ring.maxAge) {
        ring.active = false;
      }
    }

    // Update ROYGBIV firework sparks
    const drag = Math.pow(0.26, clampedDt);
    for (let i = 0; i < MAX_SPARKS; i++) {
      const sp = this.sparks[i];
      if (!sp.active) continue;
      sp.prevX = sp.x;
      sp.prevY = sp.y;
      sp.vx *= drag;
      sp.vy = sp.vy * drag + 165 * clampedDt;
      sp.x += sp.vx * clampedDt;
      sp.y += sp.vy * clampedDt;
      sp.age += clampedDt;
      if (sp.age >= sp.maxAge) {
        sp.active = false;
      }
    }

    this.render(horn);
  }

  private render(horn: {
    baseX: number;
    baseY: number;
    tipX: number;
    tipY: number;
    hornLength: number;
    baseHalfWidth: number;
    tiltAngle: number;
  }): void {
    const ctx = this.ctx;
    const w = this.viewW;
    const h = this.viewH;

    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // 1. Subtle magical twilight starlight backdrop during VICTORY_SPLASH / VICTORY_CARD_BG
    if (this.mode !== 'ENDLESS_FLYBY') {
      const bgAlpha = this.mode === 'VICTORY_SPLASH' ? 0.56 : 0.34;
      const skyGrad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.34,
        24,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.85
      );
      skyGrad.addColorStop(0, `rgba(72, 26, 128, ${(bgAlpha * 0.85).toFixed(3)})`);
      skyGrad.addColorStop(0.55, `rgba(18, 16, 48, ${bgAlpha.toFixed(3)})`);
      skyGrad.addColorStop(1, `rgba(7, 10, 24, ${(bgAlpha * 1.18).toFixed(3)})`);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Render Firework Detonation Rings & Glow Halos
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < MAX_RINGS; i++) {
      const ring = this.rings[i];
      if (!ring.active) continue;
      const t = ring.age / ring.maxAge;
      const ease = 1 - Math.pow(1 - t, 3);
      const rad = 10 + ring.maxRadius * ease;
      const alpha = (1 - t) * 0.72;

      const glow = ctx.createRadialGradient(ring.x, ring.y, 0, ring.x, ring.y, rad);
      glow.addColorStop(0, `rgba(255, 255, 255, ${(alpha * 0.85).toFixed(3)})`);
      glow.addColorStop(0.45, `${ring.color}66`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, rad, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = ring.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 3.0 * (1 - t * 0.6);
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, rad * 0.84, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // 3. Render Ascending Firework Rockets
    for (let i = 0; i < MAX_ROCKETS; i++) {
      const r = this.rockets[i];
      if (!r.active) continue;
      const col = ROYGBIV_HEX[r.colorIndex];
      ctx.strokeStyle = col;
      ctx.lineWidth = 5.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(r.prevX - r.vx * 0.035, r.prevY - r.vy * 0.035);
      ctx.lineTo(r.x, r.y);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(r.x, r.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Render Multi-Burst ROYGBIV Firework Sparks & 4-Point Stars
    ctx.lineCap = 'round';
    for (let i = 0; i < MAX_SPARKS; i++) {
      const sp = this.sparks[i];
      if (!sp.active) continue;
      const lifeRatio = 1 - sp.age / sp.maxAge;
      const twinkle = 0.72 + 0.28 * Math.sin(this.elapsed * 26 + sp.twinklePhase);
      const alpha = Math.max(0, Math.min(1, lifeRatio * 1.25)) * twinkle;

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = sp.color;
      ctx.lineWidth = sp.size * (0.55 + lifeRatio * 0.55);
      ctx.beginPath();
      ctx.moveTo(sp.prevX - sp.vx * 0.026, sp.prevY - sp.vy * 0.026);
      ctx.lineTo(sp.x, sp.y);
      ctx.stroke();

      if (sp.isStar && lifeRatio > 0.22) {
        const sr = sp.size * 2.1 * lifeRatio;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(sp.x, sp.y - sr);
        ctx.lineTo(sp.x + sr * 0.28, sp.y - sr * 0.28);
        ctx.lineTo(sp.x + sr, sp.y);
        ctx.lineTo(sp.x + sr * 0.28, sp.y + sr * 0.28);
        ctx.lineTo(sp.x, sp.y + sr);
        ctx.lineTo(sp.x - sr * 0.28, sp.y + sr * 0.28);
        ctx.lineTo(sp.x - sr, sp.y);
        ctx.lineTo(sp.x - sr * 0.28, sp.y - sr * 0.28);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // 5. Render the Giant Sculpted 3D-Shaded Unicorn Horn Rising from Bottom-Center!
    this.drawGiantUnicornHorn(
      ctx,
      horn.baseX,
      horn.baseY,
      horn.hornLength,
      horn.baseHalfWidth,
      horn.tiltAngle
    );

    ctx.restore();
  }

  private drawGiantUnicornHorn(
    ctx: CanvasRenderingContext2D,
    baseX: number,
    baseY: number,
    len: number,
    baseHalfW: number,
    tiltAngle: number
  ): void {
    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.rotate(tiltAngle);

    // A. Radiant Rainbow Aura Halo behind the Giant Horn
    const auraGrad = ctx.createRadialGradient(0, -len * 0.46, 12, 0, -len * 0.46, len * 0.68);
    auraGrad.addColorStop(0, 'rgba(255, 232, 110, 0.44)');
    auraGrad.addColorStop(0.45, 'rgba(255, 92, 200, 0.26)');
    auraGrad.addColorStop(1, 'rgba(40, 180, 255, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, -len * 0.46, len * 0.68, 0, Math.PI * 2);
    ctx.fill();

    // B. Flanking Swept Pegasus Wings at Base of the Giant Horn
    const wingFlap = Math.sin(this.elapsed * 5.2) * 0.09 + this.hornRecoil * 0.12;
    for (const side of [-1, 1] as const) {
      ctx.save();
      ctx.translate(side * baseHalfW * 0.72, -36);
      ctx.scale(side, 1);
      ctx.rotate(-0.22 - wingFlap);

      for (let f = 3; f >= 0; f--) {
        const fw = baseHalfW * (2.35 - f * 0.34);
        const fh = 26 - f * 3;
        const fy = -f * 13;
        ctx.fillStyle = f === 0 ? '#ffe45e' : f % 2 === 1 ? '#fff7ff' : '#ffb8ec';
        ctx.strokeStyle = '#120824';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(0, fy);
        ctx.quadraticCurveTo(fw * 0.62, fy - fh * 1.15, fw, fy - fh * 0.35);
        ctx.quadraticCurveTo(fw * 0.58, fy + fh * 0.65, 0, fy + 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // C. Sculpted 8-Segment Twisted Spiral Unicorn Horn Cone
    const segments = 8;
    for (let s = 0; s < segments; s++) {
      const t0 = s / segments;
      const t1 = (s + 1) / segments;
      const y0 = -t0 * len;
      const y1 = -t1 * len;
      const w0 = baseHalfW * Math.pow(1 - t0, 0.84) + 3.0 * (1 - t0);
      const w1 =
        s === segments - 1
          ? 2.2
          : baseHalfW * Math.pow(1 - t1, 0.84) + 3.0 * (1 - t1);

      const bulge = (s === segments - 1 ? 0.3 : 1.0) * (5.5 * (1 - t0 * 0.65));

      const grad = ctx.createLinearGradient(-w0, (y0 + y1) * 0.5, w0, (y0 + y1) * 0.5);
      grad.addColorStop(0, '#d8c4ff');
      grad.addColorStop(0.28, '#ffffff');
      grad.addColorStop(0.62, '#fff5d6');
      grad.addColorStop(1, '#f39ce0');

      ctx.fillStyle = grad;
      ctx.strokeStyle = '#120824';
      ctx.lineWidth = 3.4;
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(-w0, y0);
      ctx.quadraticCurveTo(-w0 - bulge, (y0 + y1) * 0.5, -w1, y1);
      ctx.lineTo(w1, y1);
      ctx.quadraticCurveTo(w0 + bulge, (y0 + y1) * 0.5, w0, y0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Diagonal ROYGBIV + Gold Spiral Flute Groove across each horn segment!
      if (s < segments - 1) {
        const bandColor = ROYGBIV_HEX[s % ROYGBIV_HEX.length];
        ctx.strokeStyle = bandColor;
        ctx.lineWidth = Math.max(2.6, 5.2 * (1 - t0 * 0.55));
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-w0 * 0.88, y0 - (y0 - y1) * 0.15);
        ctx.quadraticCurveTo(0, (y0 + y1) * 0.5 - 5, w1 * 0.92, y1);
        ctx.stroke();

        // Crisp pearlescent specular highlight along the spiral ridge
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.86)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(-w0 * 0.42, y0 - 3);
        ctx.lineTo(-w1 * 0.36, y1 + 3);
        ctx.stroke();
      }
    }

    // D. Royal Gold & Rainbow Gem Crown Collar at Base of Horn
    const collarW = baseHalfW * 1.28;
    const collarGrad = ctx.createLinearGradient(-collarW, -20, collarW, -20);
    collarGrad.addColorStop(0, '#e09112');
    collarGrad.addColorStop(0.35, '#ffe96b');
    collarGrad.addColorStop(0.7, '#ffc928');
    collarGrad.addColorStop(1, '#c9780b');

    ctx.fillStyle = collarGrad;
    ctx.strokeStyle = '#120824';
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(-collarW, 8);
    ctx.lineTo(-collarW * 1.06, -28);
    ctx.lineTo(-collarW * 0.55, -18);
    ctx.lineTo(0, -38);
    ctx.lineTo(collarW * 0.55, -18);
    ctx.lineTo(collarW * 1.06, -28);
    ctx.lineTo(collarW, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 5 Rainbow Gems set into the Royal Crown Collar
    const gemOffsets = [-0.72, -0.36, 0, 0.36, 0.72];
    for (let g = 0; g < gemOffsets.length; g++) {
      const gx = gemOffsets[g] * collarW;
      const gy = g === 2 ? -14 : -10;
      ctx.fillStyle = ROYGBIV_HEX[(g * 2) % ROYGBIV_HEX.length];
      ctx.strokeStyle = '#120824';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(gx, gy, g === 2 ? 7.5 : 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // E. Blazing Starlight Tip Beacon & Firework Launch Muzzle Starburst!
    const tipOrbR = 9 + this.muzzleFlash * 15;
    const tipGlow = ctx.createRadialGradient(0, -len, 0, 0, -len, tipOrbR * 2.6);
    tipGlow.addColorStop(0, '#ffffff');
    tipGlow.addColorStop(0.35, 'rgba(255, 240, 128, 0.92)');
    tipGlow.addColorStop(0.7, 'rgba(255, 90, 210, 0.48)');
    tipGlow.addColorStop(1, 'rgba(255, 90, 210, 0)');
    ctx.fillStyle = tipGlow;
    ctx.beginPath();
    ctx.arc(0, -len, tipOrbR * 2.6, 0, Math.PI * 2);
    ctx.fill();

    // 4-point star flare at the exact horn tip
    const starR = 14 + this.muzzleFlash * 18;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -len - starR);
    ctx.lineTo(starR * 0.24, -len - starR * 0.24);
    ctx.lineTo(starR, -len);
    ctx.lineTo(starR * 0.24, -len + starR * 0.24);
    ctx.lineTo(0, -len + starR);
    ctx.lineTo(-starR * 0.24, -len + starR * 0.24);
    ctx.lineTo(-starR, -len);
    ctx.lineTo(-starR * 0.24, -len - starR * 0.24);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
