import * as THREE from 'three';
import type { GateOperator, WeaponTierId } from '../core/types';
import { formatGateLabel, isNegativeGateState } from '../math/gateMath';
import { formatObstacleHp } from '../math/progressionMath';
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
    _ringProgress: number,
    flashIntensity: number,
    panelWidthMeters = 4.76
  ): void {
    const valKey = operator === 'MUL' ? Math.round(value * 100) : Math.round(value);
    const flashFlag = flashIntensity > 0.15 ? 1 : 0;
    const widthBucket = Math.round(panelWidthMeters * 10);
    const sig = `${operator}:${valKey}:${isLocked ? 1 : 0}:${flashFlag}:${widthBucket}`;
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

    // Frameless-top translucent energy glass curtain:
    // Fades smoothly to open air at the top, rich translucent cyan/crimson through the body,
    // and terminates in a crisp glowing baseline along the bridge deck!
    const grad = ctx.createLinearGradient(0, 4, 0, h - 6);
    if (isNeg) {
      grad.addColorStop(0.0, 'rgba(244, 48, 72, 0.03)');
      grad.addColorStop(0.18, 'rgba(238, 42, 64, 0.24)');
      grad.addColorStop(0.55, 'rgba(220, 30, 52, 0.46)');
      grad.addColorStop(0.90, 'rgba(182, 16, 36, 0.64)');
      grad.addColorStop(1.0, 'rgba(255, 76, 98, 0.84)');
    } else {
      grad.addColorStop(0.0, 'rgba(42, 220, 255, 0.03)');
      grad.addColorStop(0.18, 'rgba(26, 202, 255, 0.24)');
      grad.addColorStop(0.55, 'rgba(14, 168, 246, 0.44)');
      grad.addColorStop(0.90, 'rgba(10, 126, 224, 0.62)');
      grad.addColorStop(1.0, 'rgba(68, 236, 255, 0.82)');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(2, 4, virtW - 4, h - 10);

    // Subtle vertical glass sheen columns
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.fillRect(virtW * 0.14, 28, Math.max(14, virtW * 0.08), h - 42);
    ctx.fillRect(virtW * 0.76, 36, Math.max(10, virtW * 0.05), h - 50);

    if (flashFlag) {
      const flashGrad = ctx.createLinearGradient(0, 18, 0, h - 6);
      flashGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      flashGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.36)');
      flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0.48)');
      ctx.fillStyle = flashGrad;
      ctx.fillRect(2, 14, virtW - 4, h - 20);
    }

    // Bright glowing ground-contact baseline strip
    ctx.fillStyle = isNeg ? 'rgba(255, 166, 178, 0.96)' : 'rgba(164, 250, 255, 0.96)';
    ctx.fillRect(2, h - 11, virtW - 4, 6);
    ctx.fillStyle = isNeg ? 'rgba(255, 68, 92, 0.45)' : 'rgba(42, 220, 255, 0.45)';
    ctx.fillRect(2, h - 19, virtW - 4, 8);

    // Giant Bold White Black-Outlined Arcade Label (centered cleanly with no bottom charge bar!)
    const label = formatGateLabel(operator, value, isLocked);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fontPx = Math.round(Math.max(112, Math.min(162, 102 + virtW * 0.082)));
    ctx.font = `900 ${fontPx}px system-ui, -apple-system, sans-serif`;
    const maxTextW = Math.max(124, virtW - 38);
    const measuredW = ctx.measureText(label).width;
    if (measuredW > maxTextW) {
      fontPx = Math.max(74, Math.floor(fontPx * (maxTextW / measuredW)));
      ctx.font = `900 ${fontPx}px system-ui, -apple-system, sans-serif`;
    }
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(16, Math.round(fontPx * 0.165));
    ctx.strokeStyle = '#09111c';
    ctx.strokeText(label, virtW / 2, h * 0.54);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, virtW / 2, h * 0.54);

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
      text.length >= 5 ? 104 : text.length === 4 ? 124 : text.length === 3 ? 148 : 168;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.lineJoin = 'round';

    // Outer dark cartoon drop-stroke
    ctx.lineWidth = 34;
    ctx.strokeStyle = 'rgba(14, 8, 4, 0.92)';
    ctx.strokeText(text, w / 2, h / 2 + 6);

    // Mid fiery orange arcade stroke
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
