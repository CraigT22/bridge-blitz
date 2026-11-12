import { BRIDGE_PLAYABLE_HALF_WIDTH } from '../math/formationMath';

export interface InputCallbacks {
  onStartRequest: () => void;
  onUpgradeShortcut: (index: 0 | 1 | 2 | 3) => void;
  onFirstGesture: () => void;
  onContinueModal: () => void;
}

/**
 * Unified One-Axis Input Controller:
 * - Touch drag (1:1 horizontal finger tracking across screen width)
 * - Mouse hold-and-drag across viewport
 * - Keyboard A/D or ArrowLeft/ArrowRight
 * - Standard Web Gamepad horizontal left stick / D-pad
 */
export class InputController {
  private readonly callbacks: InputCallbacks;
  private leftPressed = false;
  private rightPressed = false;
  private pointerActive = false;
  private activePointerId = -1;
  private lastPointerClientX = 0;
  private accumulatedDragDeltaWorldX = 0;

  constructor(canvasElement: HTMLElement, callbacks: InputCallbacks) {
    this.callbacks = callbacks;
    this.bindEvents(canvasElement);
  }

  private bindEvents(canvasElement: HTMLElement): void {
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      this.callbacks.onFirstGesture();

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.leftPressed = true;
          this.callbacks.onStartRequest();
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.rightPressed = true;
          this.callbacks.onStartRequest();
          break;
        case 'Space':
          e.preventDefault();
          this.callbacks.onStartRequest();
          this.callbacks.onContinueModal();
          break;
        case 'Enter':
          this.callbacks.onContinueModal();
          break;
        case 'Digit1':
        case 'Numpad1':
          this.callbacks.onUpgradeShortcut(0);
          break;
        case 'Digit2':
        case 'Numpad2':
          this.callbacks.onUpgradeShortcut(1);
          break;
        case 'Digit3':
        case 'Numpad3':
          this.callbacks.onUpgradeShortcut(2);
          break;
        case 'Digit4':
        case 'Numpad4':
          this.callbacks.onUpgradeShortcut(3);
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.leftPressed = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.rightPressed = false;
          break;
      }
    });

    canvasElement.addEventListener('pointerdown', (e) => {
      this.callbacks.onFirstGesture();
      this.pointerActive = true;
      this.activePointerId = e.pointerId;
      this.lastPointerClientX = e.clientX;
      try {
        canvasElement.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic test events may omit active pointer registration
      }
      this.callbacks.onStartRequest();
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.pointerActive) {
        return;
      }
      if (this.activePointerId !== -1 && e.pointerId !== this.activePointerId) {
        return;
      }
      const dxPixels = e.clientX - this.lastPointerClientX;
      this.lastPointerClientX = e.clientX;

      const viewportW = Math.max(320, window.innerWidth);
      // Ergonomic 1-thumb sweep across playable bridge span on 6.8" Pixel 10 XL & desktop
      const playableSpan = BRIDGE_PLAYABLE_HALF_WIDTH * 2;
      const gain = viewportW > 768 ? 1.55 : 1.32;
      this.accumulatedDragDeltaWorldX += (dxPixels / viewportW) * playableSpan * gain;
    });

    const releasePointer = (e: PointerEvent): void => {
      if (this.activePointerId === -1 || e.pointerId === this.activePointerId) {
        this.pointerActive = false;
        this.activePointerId = -1;
      }
    };

    window.addEventListener('pointerup', releasePointer);
    window.addEventListener('pointercancel', releasePointer);
    window.addEventListener('blur', () => {
      this.leftPressed = false;
      this.rightPressed = false;
      this.pointerActive = false;
      this.activePointerId = -1;
    });
  }

  /**
   * Consumes frame lateral displacement in world X units combining drag, keyboard, and Web Gamepad.
   */
  public consumeHorizontalDelta(dt: number): number {
    let deltaX = this.accumulatedDragDeltaWorldX;
    this.accumulatedDragDeltaWorldX = 0;

    let axis = 0;
    if (this.leftPressed) {
      axis -= 1;
    }
    if (this.rightPressed) {
      axis += 1;
    }

    // Poll standard Web Gamepad horizontal stick & D-pad
    if (typeof navigator.getGamepads === 'function') {
      const pads = navigator.getGamepads();
      for (let i = 0; i < pads.length; i++) {
        const pad = pads[i];
        if (!pad || !pad.connected) {
          continue;
        }
        const stickX = pad.axes[0] ?? 0;
        if (Math.abs(stickX) > 0.14) {
          axis += stickX;
          this.callbacks.onStartRequest();
        }
        if (pad.buttons[14]?.pressed) {
          axis -= 1;
          this.callbacks.onStartRequest();
        }
        if (pad.buttons[15]?.pressed) {
          axis += 1;
          this.callbacks.onStartRequest();
        }
        break;
      }
    }

    const clampedAxis = Math.max(-1, Math.min(1, axis));
    const keyboardSpeed = 11.5;
    deltaX += clampedAxis * keyboardSpeed * dt;
    return deltaX;
  }

  public resetFrameDeltas(): void {
    this.accumulatedDragDeltaWorldX = 0;
  }
}
