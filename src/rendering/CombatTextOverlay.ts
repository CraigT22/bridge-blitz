import type { SceneManager, ScreenProjection } from './SceneManager';

export type PopupVariant = 'positive' | 'negative' | 'gold' | 'cyan';

interface PooledPopupNode {
  el: HTMLDivElement;
  active: boolean;
  worldX: number;
  worldY: number;
  worldZ: number;
  age: number;
  maxAge: number;
}

const POPUP_POOL_SIZE = 32;
const _screenProj: ScreenProjection = { x: 0, y: 0, visible: false };

export class CombatTextOverlay {
  private readonly pool: PooledPopupNode[] = [];
  private cursor = 0;

  constructor(container: HTMLElement) {
    for (let i = 0; i < POPUP_POOL_SIZE; i++) {
      const el = document.createElement('div');
      el.className = 'combat-popup';
      el.style.opacity = '0';
      container.appendChild(el);
      this.pool.push({
        el,
        active: false,
        worldX: 0,
        worldY: 0,
        worldZ: 0,
        age: 0,
        maxAge: 0.75,
      });
    }
  }

  public spawn(
    worldX: number,
    worldY: number,
    worldZ: number,
    text: string,
    variant: PopupVariant,
    duration = 0.82
  ): void {
    // Nudge any recent nearby popups upward so rapid taps or multi-hits stack cleanly
    for (let i = 0; i < POPUP_POOL_SIZE; i++) {
      const other = this.pool[i];
      if (
        other.active &&
        other.age < 0.45 &&
        Math.abs(other.worldX - worldX) < 1.6 &&
        Math.abs(other.worldZ - worldZ) < 2.8
      ) {
        other.worldY += 0.56;
      }
    }

    const slot = this.pool[this.cursor];
    this.cursor = (this.cursor + 1) % POPUP_POOL_SIZE;

    slot.active = true;
    slot.worldX = worldX;
    slot.worldY = worldY;
    slot.worldZ = worldZ;
    slot.age = 0;
    slot.maxAge = duration;
    slot.el.textContent = text;
    slot.el.className = `combat-popup combat-popup--${variant}`;
  }

  public update(dt: number, sceneManager: SceneManager): void {
    for (let i = 0; i < POPUP_POOL_SIZE; i++) {
      const slot = this.pool[i];
      if (!slot.active) {
        continue;
      }
      slot.age += dt;
      if (slot.age >= slot.maxAge) {
        slot.active = false;
        slot.el.style.opacity = '0';
        continue;
      }

      const t = slot.age / slot.maxAge;
      const floatY = slot.worldY + t * 1.45;
      sceneManager.projectToScreen(slot.worldX, floatY, slot.worldZ, _screenProj);

      if (!_screenProj.visible) {
        slot.el.style.opacity = '0';
        continue;
      }

      const marginX = 64;
      const marginY = 64;
      const clampedX = Math.max(
        marginX,
        Math.min(Math.max(marginX, window.innerWidth - marginX), _screenProj.x)
      );
      const clampedY = Math.max(
        marginY,
        Math.min(Math.max(marginY, window.innerHeight - marginY), _screenProj.y)
      );

      const alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
      const scale = t < 0.16 ? 0.75 + (t / 0.16) * 0.35 : 1.1 - t * 0.12;
      slot.el.style.opacity = alpha.toFixed(2);
      slot.el.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${clampedY.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(2)})`;
    }
  }

  public clear(): void {
    for (let i = 0; i < POPUP_POOL_SIZE; i++) {
      this.pool[i].active = false;
      this.pool[i].el.style.opacity = '0';
    }
  }
}
