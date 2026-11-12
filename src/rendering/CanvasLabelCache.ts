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

  constructor(wide = false) {
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
    ringProgress: number,
    flashIntensity: number,
    panelWidthMeters = 4.76
  ): void {
    const valKey = operator === 'MUL' && !isLocked ? Math.round(value * 10) : Math.round(value);
    const progBucket = isLocked ? 0 : Math.floor(ringProgress * 16);
    const flashFlag = flashIntensity > 0.15 ? 1 : 0;
    const widthBucket = Math.round(panelWidthMeters * 10);
    const sig = `${operator}:${valKey}:${isLocked ? 1 : 0}:${progBucket}:${flashFlag}:${widthBucket}`;
    if (sig === this.lastSignature) {
      return;
    }
    this.lastSignature = sig;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Orthographic world-proportioned virtual width so dynamic 22%..78% split panels never stretch text or bevels!
    const virtW = Math.max(196, h * (panelWidthMeters / 2.48));

    // High-clarity translucent forcefield so obstacles behind the gate stay 100% readable!
    let bgTop = 'rgba(24, 198, 255, 0.50)';
    let bgBottom = 'rgba(10, 120, 212, 0.62)';
    let borderStroke = '#62f4ff';

    if (isLocked && operator === 'MUL') {
      bgTop = 'rgba(235, 168, 24, 0.56)';
      bgBottom = 'rgba(138, 76, 10, 0.66)';
      borderStroke = '#ffe066';
    } else if (isLocked && operator === 'DIV') {
      bgTop = 'rgba(224, 38, 56, 0.58)';
      bgBottom = 'rgba(116, 14, 28, 0.68)';
      borderStroke = '#ff8a65';
    } else if (operator === 'ADD' && value < 0) {
      bgTop = 'rgba(232, 42, 64, 0.56)';
      bgBottom = 'rgba(128, 16, 32, 0.68)';
      borderStroke = '#ff6b81';
    }

    ctx.save();
    ctx.scale(w / virtW, 1);

    ctx.save();
    traceChamferRect(ctx, 8, 10, virtW - 16, h - 20, 20);
    ctx.clip();

    const grad = ctx.createLinearGradient(0, 10, 0, h - 10);
    grad.addColorStop(0, bgTop);
    grad.addColorStop(1, bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, virtW, h);

    // Subtle energy shimmer bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let sy = 22; sy < h - 22; sy += 24) {
      ctx.fillRect(8, sy, virtW - 16, 4);
    }

    if (flashFlag) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
      ctx.fillRect(8, 10, virtW - 16, h - 20);
    }
    ctx.restore();

    // Crisp Forcefield Border
    traceChamferRect(ctx, 8, 10, virtW - 16, h - 20, 20);
    ctx.lineWidth = 8;
    ctx.strokeStyle = borderStroke;
    ctx.stroke();

    // Giant Bold Arcade Label (scales subtly with panel width while auto-fitting narrow splits!)
    const label = formatGateLabel(operator, value, isLocked);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fontPx = Math.round(Math.max(108, Math.min(156, 98 + virtW * 0.078)));
    ctx.font = `900 ${fontPx}px system-ui, -apple-system, sans-serif`;
    const maxTextW = Math.max(120, virtW - 44);
    const measuredW = ctx.measureText(label).width;
    if (measuredW > maxTextW) {
      fontPx = Math.max(76, Math.floor(fontPx * (maxTextW / measuredW)));
      ctx.font = `900 ${fontPx}px system-ui, -apple-system, sans-serif`;
    }
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(15, Math.round(fontPx * 0.155));
    ctx.strokeStyle = '#09111c';
    ctx.strokeText(label, virtW / 2, h / 2 - 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, virtW / 2, h / 2 - 4);

    // Compact Charge Bar along bottom for shootable ADD & fractional MUL gates
    if (!isLocked) {
      const barW = Math.min(320, Math.max(96, virtW - 68));
      const startX = (virtW - barW) / 2;
      const barY = h - 28;
      ctx.fillStyle = 'rgba(7, 12, 20, 0.72)';
      ctx.fillRect(startX - 4, barY - 4, barW + 8, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(startX, barY, Math.round(barW * (progBucket / 16)), 8);
    }

    ctx.restore();
    this.texture.needsUpdate = true;
  }
}

/**
 * Giant Punchy Arcade HP Number Texture (used on front of Supply Drums & 3-Lane Tire Walls):
 * Bold white digits with thick fiery-orange + dark cartoon ink outline on a 100% transparent background!
 */
export class EditableArcadeHpTexture {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;
  public readonly texture: THREE.CanvasTexture;
  private lastSignature = '';

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 384;
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

    const text = `${shown}`;
    const fontSize = shown >= 1000 ? 124 : shown >= 100 ? 148 : 168;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.lineJoin = 'round';

    // Outer dark cartoon drop-stroke
    ctx.lineWidth = 34;
    ctx.strokeStyle = 'rgba(14, 8, 4, 0.92)';
    ctx.strokeText(text, w / 2, h / 2 + 6);

    // Mid fiery orange arcade stroke (matches reference screenshots!)
    ctx.lineWidth = 22;
    ctx.strokeStyle = flashFlag ? '#ff3b1f' : '#ea5212';
    ctx.strokeText(text, w / 2, h / 2 + 2);

    // Crisp bright white fill
    ctx.fillStyle = flashFlag ? '#fff4d6' : '#ffffff';
    ctx.fillText(text, w / 2, h / 2 + 2);

    this.texture.needsUpdate = true;
  }
}

export class EditableTirePlaqueTexture extends EditableArcadeHpTexture {}

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
