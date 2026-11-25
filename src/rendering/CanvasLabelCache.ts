import * as THREE from 'three';
import type { GateOperator, SkinThemeId, WeaponTierId } from '../core/types';
import { formatGateLabel, isNegativeGateState } from '../math/gateMath';
import { formatObstacleHp } from '../math/progressionMath';
import { getWeaponDisplaySpec } from '../math/weaponMath';

function traceChamferRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cut: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + w - cut, y);
  ctx.lineTo(x + w, y + cut);
  ctx.lineTo(x + w, y + h - cut);
  ctx.lineTo(x + w - cut, y + h);
  ctx.lineTo(x + cut, y + h);
  ctx.lineTo(x, y + h - cut);
  ctx.lineTo(x, y + cut);
  ctx.closePath();
}

function createHeadlessTexture(): THREE.CanvasTexture {
  const data = new Uint8Array([255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 1, 1);
  tex.needsUpdate = true;
  return tex as unknown as THREE.CanvasTexture;
}

export class EditableGateTexture {
  public readonly canvas: HTMLCanvasElement | null;
  public readonly ctx: CanvasRenderingContext2D | null;
  public readonly texture: THREE.CanvasTexture;
  private lastSignature = '';

  constructor(wide = false) {
    if (typeof document === 'undefined') {
      this.canvas = null;
      this.ctx = null;
      this.texture = createHeadlessTexture();
      return;
    }
    this.canvas = document.createElement('canvas');
    this.canvas.width = wide ? 1024 : 640;
    this.canvas.height = 264;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D canvas context unavailable');
    }
    this.ctx = ctx;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
  }

  public redrawIfDirty(
    operator: GateOperator,
    value: number,
    isLocked: boolean,
    _ringProgress: number,
    flashIntensity: number,
    panelWidthMeters = 4.76,
    decayFlashIntensity = 0
  ): void {
    if (!this.ctx || !this.canvas) {
      return;
    }
    const valKey = operator === 'MUL' ? Math.round(value * 100) : Math.round(value);
    const flashFlag = flashIntensity > 0.15 ? 1 : 0;
    const decayFlag = decayFlashIntensity > 0.15 ? 1 : 0;
    const widthBucket = Math.round(panelWidthMeters * 10);
    const sig = `${operator}:${valKey}:${isLocked ? 1 : 0}:${flashFlag}:${decayFlag}:${widthBucket}`;
    if (sig === this.lastSignature) {
      return;
    }
    this.lastSignature = sig;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Orthographic world-proportioned virtual width so dynamic 20%..80% split panels never stretch text!
    const virtW = Math.max(190, h * (panelWidthMeters / 2.48));
    const isNeg = isNegativeGateState(operator, value, isLocked);

    ctx.save();
    ctx.scale(w / virtW, 1);

    // Hex-Grid Tactical Holo-Shield Field:
    // Emerald-Teal (#18f2c8) positive polarity vs Crimson-Magenta (#ff245c) breach hazard polarity
    const grad = ctx.createLinearGradient(0, 6, 0, h - 6);
    if (isNeg) {
      grad.addColorStop(0.0, 'rgba(255, 36, 92, 0.22)');
      grad.addColorStop(0.22, 'rgba(232, 24, 78, 0.34)');
      grad.addColorStop(0.65, 'rgba(184, 16, 62, 0.50)');
      grad.addColorStop(0.92, 'rgba(142, 10, 48, 0.68)');
      grad.addColorStop(1.0, 'rgba(255, 72, 118, 0.88)');
    } else {
      grad.addColorStop(0.0, 'rgba(24, 242, 200, 0.22)');
      grad.addColorStop(0.22, 'rgba(18, 208, 212, 0.34)');
      grad.addColorStop(0.65, 'rgba(12, 152, 198, 0.48)');
      grad.addColorStop(0.92, 'rgba(8, 108, 168, 0.66)');
      grad.addColorStop(1.0, 'rgba(64, 250, 224, 0.88)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(3, 8, virtW - 6, h - 14);

    // Subtle tactical diagonal holo-grid scanlines
    ctx.strokeStyle = isNeg ? 'rgba(255, 130, 160, 0.16)' : 'rgba(130, 255, 236, 0.16)';
    ctx.lineWidth = 2;
    for (let gx = -h; gx < virtW + h; gx += 44) {
      ctx.beginPath();
      ctx.moveTo(gx, 10);
      ctx.lineTo(gx + h * 0.45, h - 10);
      ctx.stroke();
    }

    // Crisp top laser emitter bar + bottom deck projector rail
    ctx.fillStyle = isNeg ? 'rgba(255, 128, 158, 0.92)' : 'rgba(138, 255, 236, 0.92)';
    ctx.fillRect(3, 6, virtW - 6, 4);
    ctx.fillRect(3, h - 11, virtW - 6, 6);

    // Chamfered corner telemetry ticks
    const tickCol = isNeg ? '#ff8ca8' : '#8cffeb';
    ctx.fillStyle = tickCol;
    ctx.fillRect(6, 14, 18, 3);
    ctx.fillRect(virtW - 24, 14, 18, 3);

    if (flashFlag) {
      const flashGrad = ctx.createLinearGradient(0, 10, 0, h - 6);
      flashGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      flashGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.42)');
      flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0.54)');
      ctx.fillStyle = flashGrad;
      ctx.fillRect(3, 8, virtW - 6, h - 14);
    } else if (decayFlag) {
      // Crisp downward amber-crimson tick-down pulse when shoot-to-charge gate passively decays!
      const decayGrad = ctx.createLinearGradient(0, 10, 0, h - 6);
      decayGrad.addColorStop(0, 'rgba(255, 180, 56, 0.36)');
      decayGrad.addColorStop(0.55, 'rgba(255, 76, 106, 0.28)');
      decayGrad.addColorStop(1, 'rgba(255, 36, 78, 0.42)');
      ctx.fillStyle = decayGrad;
      ctx.fillRect(3, 8, virtW - 6, h - 14);
    }

    // Crisp Geometric Tactical Gate Numeral (zero cartoon bubble look!)
    const label = formatGateLabel(operator, value, isLocked);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fontPx = Math.round(Math.max(108, Math.min(156, 98 + virtW * 0.080)));
    ctx.font = `900 ${fontPx}px "Segoe UI", Roboto, system-ui, sans-serif`;
    const maxTextW = Math.max(124, virtW - 38);
    const measuredW = ctx.measureText(label).width;
    if (measuredW > maxTextW) {
      fontPx = Math.max(72, Math.floor(fontPx * (maxTextW / measuredW)));
      ctx.font = `900 ${fontPx}px "Segoe UI", Roboto, system-ui, sans-serif`;
    }
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 3;
    ctx.lineWidth = Math.max(14, Math.round(fontPx * 0.145));
    ctx.strokeStyle = '#070d16';
    ctx.strokeText(label, virtW / 2, h * 0.54);
    ctx.fillStyle = '#f4fcff';
    ctx.fillText(label, virtW / 2, h * 0.54);

    ctx.restore();
    this.texture.needsUpdate = true;
  }
}

/**
 * Chamfered Dark-Glass Tactical HUD HP Plaque (replaces fiery-orange cartoon bubble digits
 * on Armored Hex Ordnance Pods & Modular Blast Barricades):
 * Translucent obsidian-slate oct-plate + glowing electric-teal / volt-amber corner bracket frame
 * + razor-sharp white/cyan numerals!
 */
export class EditableArcadeHpTexture {
  public readonly canvas: HTMLCanvasElement | null;
  public readonly ctx: CanvasRenderingContext2D | null;
  public readonly texture: THREE.CanvasTexture;
  private lastSignature = '';

  constructor() {
    if (typeof document === 'undefined') {
      this.canvas = null;
      this.ctx = null;
      this.texture = createHeadlessTexture();
      return;
    }
    this.canvas = document.createElement('canvas');
    this.canvas.width = 416;
    this.canvas.height = 224;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D canvas context unavailable');
    }
    this.ctx = ctx;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
  }

  public redrawIfDirty(remainingHp: number, hitFlash = 0): void {
    if (!this.ctx || !this.canvas) {
      return;
    }
    const shown = Math.max(0, Math.ceil(remainingHp));
    const flashFlag = hitFlash > 0.25 ? 1 : 0;
    const sig = `${shown}:${flashFlag}`;
    if (sig === this.lastSignature) {
      return;
    }
    this.lastSignature = sig;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const text = formatObstacleHp(shown);
    const fontSize =
      text.length >= 5 ? 96 : text.length === 4 ? 114 : text.length === 3 ? 132 : 146;

    // Chamfered Dark-Glass Tactical Telemetry Plate
    const padX = 28;
    const padY = 26;
    const pw = w - padX * 2;
    const ph = h - padY * 2;
    traceChamferRect(ctx, padX, padY, pw, ph, 24);
    ctx.fillStyle = flashFlag ? 'rgba(32, 62, 88, 0.90)' : 'rgba(8, 16, 28, 0.86)';
    ctx.fill();

    ctx.lineWidth = 6;
    ctx.strokeStyle = flashFlag ? '#ffd25a' : '#28f2d4';
    ctx.stroke();

    // Inner volt-amber / cyan corner accents
    ctx.fillStyle = flashFlag ? '#ffffff' : '#ffb838';
    ctx.fillRect(padX + 26, padY + 6, 44, 4);
    ctx.fillRect(padX + pw - 70, padY + ph - 10, 44, 4);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${fontSize}px "Segoe UI", Roboto, system-ui, sans-serif`;
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 3;

    ctx.lineWidth = 16;
    ctx.strokeStyle = '#050a12';
    ctx.strokeText(text, w / 2, h / 2 + 4);

    ctx.fillStyle = flashFlag ? '#fff6c8' : '#eefcff';
    ctx.fillText(text, w / 2, h / 2 + 4);

    this.texture.needsUpdate = true;
  }
}

export class EditableTirePlaqueTexture extends EditableArcadeHpTexture {}

const _badgeTexCache = new Map<string, THREE.CanvasTexture>();

export function createStaticWeaponBadgeTexture(
  tier: WeaponTierId,
  skinTheme: SkinThemeId = 'TACTICAL'
): THREE.CanvasTexture {
  const cacheKey = `${skinTheme}:${tier}`;
  const cached = _badgeTexCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  if (typeof document === 'undefined') {
    const tex = createHeadlessTexture();
    _badgeTexCache.set(cacheKey, tex);
    return tex;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 336;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }

  const spec = getWeaponDisplaySpec(tier, skinTheme);
  const hex = `#${spec.colorHex.toString(16).padStart(6, '0')}`;

  traceChamferRect(ctx, 8, 10, 320, 76, 16);
  ctx.fillStyle = skinTheme === 'UNICORN' ? 'rgba(34, 10, 44, 0.94)' : 'rgba(8, 15, 26, 0.94)';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = hex;
  ctx.stroke();

  const badgeText = spec.shortBadge.toUpperCase();
  const fontSize = badgeText.length >= 13 ? 30 : badgeText.length >= 11 ? 33 : 35;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${fontSize}px "Segoe UI", Roboto, system-ui, sans-serif`;
  ctx.fillStyle = hex;
  ctx.fillText(badgeText, 168, 49);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  _badgeTexCache.set(cacheKey, tex);
  return tex;
}
