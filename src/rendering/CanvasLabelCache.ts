import * as THREE from 'three';
import type { GateOperator, WeaponTierId } from '../core/types';
import { formatGateLabel } from '../math/gateMath';
import { WEAPON_SPECS } from '../math/weaponMath';

export class EditableGateTexture {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;
  public readonly texture: THREE.CanvasTexture;
  private lastSignature = '';

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 256;
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
    ringProgress: number,
    flashIntensity: number
  ): void {
    const rounded = Math.round(value);
    const progBucket = isLocked ? 0 : Math.floor(ringProgress * 16);
    const flashFlag = flashIntensity > 0.15 ? 1 : 0;
    const sig = `${operator}:${rounded}:${isLocked ? 1 : 0}:${progBucket}:${flashFlag}`;
    if (sig === this.lastSignature) {
      return;
    }
    this.lastSignature = sig;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    let bgTop = 'rgba(12, 205, 148, 0.78)';
    let bgBottom = 'rgba(8, 124, 152, 0.86)';
    let borderStroke = '#69ffca';

    if (isLocked && operator === 'MUL') {
      bgTop = 'rgba(245, 179, 36, 0.86)';
      bgBottom = 'rgba(184, 102, 12, 0.90)';
      borderStroke = '#ffe484';
    } else if (isLocked && operator === 'DIV') {
      bgTop = 'rgba(220, 48, 62, 0.88)';
      bgBottom = 'rgba(128, 22, 34, 0.92)';
      borderStroke = '#ffbe42';
    } else if (rounded < 0) {
      bgTop = 'rgba(232, 42, 74, 0.82)';
      bgBottom = 'rgba(138, 16, 40, 0.88)';
      borderStroke = '#ff7b93';
    }

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, bgTop);
    grad.addColorStop(1, bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(8, 8, w - 16, h - 16);

    // Hazard stripes on Locked Divider gates
    if (isLocked && operator === 'DIV') {
      ctx.save();
      ctx.beginPath();
      ctx.rect(12, 12, w - 24, 34);
      ctx.clip();
      ctx.fillStyle = 'rgba(255, 196, 46, 0.88)';
      for (let sx = -40; sx < w + 40; sx += 28) {
        ctx.beginPath();
        ctx.moveTo(sx, 12);
        ctx.lineTo(sx + 14, 12);
        ctx.lineTo(sx - 4, 46);
        ctx.lineTo(sx - 18, 46);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    if (flashFlag) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
      ctx.fillRect(8, 8, w - 16, h - 16);
    }

    // Crisp outer energy border
    ctx.lineWidth = 8;
    ctx.strokeStyle = borderStroke;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Subtle status subtitle
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 22px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    if (isLocked) {
      ctx.fillText('LOCKED', w / 2, 38);
    } else {
      ctx.fillText('SHOOT +1', w / 2, 36);
    }

    // Main bold math operator (+10, -25, x3, ÷2)
    const label = formatGateLabel(operator, rounded);
    ctx.font = '900 94px system-ui, -apple-system, sans-serif';
    ctx.lineWidth = 12;
    ctx.strokeStyle = 'rgba(10, 18, 28, 0.82)';
    ctx.strokeText(label, w / 2, h / 2 + 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, w / 2, h / 2 + 12);

    // Hit accumulator progress bar along the bottom of shootable gates
    if (!isLocked) {
      const barW = w - 56;
      const barH = 14;
      const bx = 28;
      const by = h - 34;
      ctx.fillStyle = 'rgba(9, 16, 24, 0.55)';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx, by, Math.max(4, barW * (progBucket / 16)), barH);
    }

    this.texture.needsUpdate = true;
  }
}

export class EditableTirePlaqueTexture {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;
  public readonly texture: THREE.CanvasTexture;
  private lastDisplayInt = -999999;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 192;
    this.canvas.height = 128;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D canvas context unavailable');
    }
    this.ctx = ctx;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  public redrawIfDirty(remainingHits: number): void {
    const shown = Math.max(0, Math.ceil(remainingHits));
    if (shown === this.lastDisplayInt) {
      return;
    }
    this.lastDisplayInt = shown;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(15, 21, 29, 0.92)';
    ctx.fillRect(8, 10, w - 16, h - 20);

    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffd166';
    ctx.strokeRect(10, 12, w - 20, h - 24);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 66px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${shown}`, w / 2, h / 2 + 4);

    this.texture.needsUpdate = true;
  }
}

export function createStaticWeaponBadgeTexture(tier: WeaponTierId): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }

  const spec = WEAPON_SPECS[tier];
  const hex = `#${spec.colorHex.toString(16).padStart(6, '0')}`;

  ctx.fillStyle = 'rgba(12, 19, 28, 0.9)';
  ctx.fillRect(6, 8, 244, 64);
  ctx.lineWidth = 4;
  ctx.strokeStyle = hex;
  ctx.strokeRect(8, 10, 240, 60);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 30px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = hex;
  ctx.fillText(spec.shortBadge, 128, 41);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
