import * as THREE from 'three';
import type { GateOperator, WeaponTierId } from '../core/types';
import { formatGateLabel } from '../math/gateMath';
import { WEAPON_SPECS } from '../math/weaponMath';

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

export class EditableGateTexture {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;
  public readonly texture: THREE.CanvasTexture;
  private lastSignature = '';

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 512;
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

    // Tactical Holographic Forcefield Palette
    let bgTop = 'rgba(10, 178, 122, 0.74)';
    let bgBottom = 'rgba(6, 78, 96, 0.84)';
    let borderStroke = '#5effb8';
    let bracketStroke = '#b8ffe0';
    let headerText = 'TARGET // SHOOT +1';

    if (isLocked && operator === 'MUL') {
      bgTop = 'rgba(218, 148, 22, 0.82)';
      bgBottom = 'rgba(116, 62, 8, 0.88)';
      borderStroke = '#ffd966';
      bracketStroke = '#fff2bd';
      headerText = 'LOCKED // FORCE MULTIPLIER';
    } else if (isLocked && operator === 'DIV') {
      bgTop = 'rgba(198, 32, 48, 0.84)';
      bgBottom = 'rgba(92, 12, 22, 0.90)';
      borderStroke = '#ffb830';
      bracketStroke = '#ffe082';
      headerText = 'HAZARD // ARMOR LOCKED';
    } else if (rounded < 0) {
      bgTop = 'rgba(212, 34, 62, 0.78)';
      bgBottom = 'rgba(98, 12, 28, 0.86)';
      borderStroke = '#ff6b81';
      bracketStroke = '#ffc2cb';
      headerText = 'HOSTILE // SHOOT TO FLIP';
    }

    ctx.save();
    traceChamferRect(ctx, 14, 14, w - 28, h - 28, 34);
    ctx.clip();

    const grad = ctx.createLinearGradient(0, 14, 0, h - 14);
    grad.addColorStop(0, bgTop);
    grad.addColorStop(0.5, 'rgba(12, 22, 32, 0.56)');
    grad.addColorStop(1, bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle Holographic Horizontal Scanlines & Tactical Crosshair Grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.045)';
    for (let sy = 20; sy < h - 20; sy += 8) {
      ctx.fillRect(14, sy, w - 28, 2);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2, 84);
    ctx.lineTo(w / 2, h - 84);
    ctx.moveTo(48, h / 2 + 12);
    ctx.lineTo(w - 48, h / 2 + 12);
    ctx.stroke();

    // Top Dark Tactical Header Bar
    ctx.fillStyle = 'rgba(9, 14, 20, 0.72)';
    ctx.fillRect(14, 14, w - 28, 68);

    // Hazard diagonal stripes on Locked Divider / Negative Penalty Gates
    if (isLocked && operator === 'DIV') {
      ctx.save();
      ctx.beginPath();
      ctx.rect(14, 14, w - 28, 68);
      ctx.clip();
      ctx.fillStyle = 'rgba(245, 178, 34, 0.34)';
      for (let sx = -80; sx < w + 80; sx += 44) {
        ctx.beginPath();
        ctx.moveTo(sx, 14);
        ctx.lineTo(sx + 22, 14);
        ctx.lineTo(sx - 12, 82);
        ctx.lineTo(sx - 34, 82);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    if (flashFlag) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
      ctx.fillRect(14, 14, w - 28, h - 28);
    }

    ctx.restore();

    // Chamfered Outer Energy Frame
    traceChamferRect(ctx, 14, 14, w - 28, h - 28, 34);
    ctx.lineWidth = 10;
    ctx.strokeStyle = borderStroke;
    ctx.stroke();

    // Reinforced Corner Tactical Brackets
    ctx.strokeStyle = bracketStroke;
    ctx.lineWidth = 6;
    const bLen = 46;
    for (const [cx, cy, dx, dy] of [
      [26, 26, 1, 1],
      [w - 26, 26, -1, 1],
      [26, h - 26, 1, -1],
      [w - 26, h - 26, -1, -1],
    ]) {
      ctx.beginPath();
      ctx.moveTo(cx + dx * bLen, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * bLen);
      ctx.stroke();
    }

    // Stencil Tactical Status Subtitle
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 26px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = bracketStroke;
    ctx.fillText(headerText, w / 2, 50);

    // Main High-Impact Stencil Math Value (+12, -25, x3, ÷2)
    const label = formatGateLabel(operator, rounded);
    ctx.font = '900 182px system-ui, -apple-system, sans-serif';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 24;
    ctx.strokeStyle = 'rgba(7, 12, 18, 0.92)';
    ctx.strokeText(label, w / 2, h / 2 + 22);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, w / 2, h / 2 + 22);

    // 16-Segment Tactical LED Charge Meter along bottom of shootable gates
    if (!isLocked) {
      const segs = 16;
      const totalW = w - 108;
      const startX = 54;
      const barY = h - 62;
      const gap = 5;
      const segW = (totalW - gap * (segs - 1)) / segs;

      ctx.fillStyle = 'rgba(7, 12, 18, 0.74)';
      ctx.fillRect(startX - 8, barY - 6, totalW + 16, 32);

      for (let s = 0; s < segs; s++) {
        const sx = startX + s * (segW + gap);
        ctx.fillStyle =
          s < progBucket ? borderStroke : 'rgba(255, 255, 255, 0.16)';
        ctx.fillRect(sx, barY, segW, 20);
      }
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
    this.canvas.width = 256;
    this.canvas.height = 160;
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

    traceChamferRect(ctx, 10, 10, w - 20, h - 20, 18);
    ctx.fillStyle = 'rgba(16, 21, 28, 0.95)';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#f5b82e';
    ctx.stroke();

    // Corner rivets
    ctx.fillStyle = '#9aa6b4';
    for (const [rx, ry] of [
      [26, 26],
      [w - 26, 26],
      [26, h - 26],
      [w - 26, h - 26],
    ]) {
      ctx.beginPath();
      ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#f5b82e';
    ctx.fillText('BARRICADE HP', w / 2, 36);

    ctx.font = '900 84px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${shown}`, w / 2, 98);

    this.texture.needsUpdate = true;
  }
}

export function createStaticWeaponBadgeTexture(tier: WeaponTierId): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }

  const spec = WEAPON_SPECS[tier];
  const hex = `#${spec.colorHex.toString(16).padStart(6, '0')}`;

  traceChamferRect(ctx, 8, 10, 304, 76, 14);
  ctx.fillStyle = 'rgba(13, 18, 25, 0.94)';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = hex;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 36px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = hex;
  ctx.fillText(spec.shortBadge.toUpperCase(), 160, 49);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
