export type FixedUpdateCallback = (fixedDt: number) => void;
export type RenderFrameCallback = (realDt: number, alpha: number) => void;

export const FIXED_TIMESTEP = 1 / 60;
const MAX_FRAME_DELTA = 0.1;

export class GameLoop {
  private readonly onFixedUpdate: FixedUpdateCallback;
  private readonly onRender: RenderFrameCallback;
  private accumulator = 0;
  private lastTimestamp = 0;
  private rafId = 0;
  private running = false;

  constructor(onFixedUpdate: FixedUpdateCallback, onRender: RenderFrameCallback) {
    this.onFixedUpdate = onFixedUpdate;
    this.onRender = onRender;
  }

  public start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTimestamp = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  public stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private readonly tick = (now: number): void => {
    if (!this.running) {
      return;
    }
    const rawDt = Math.max(0, (now - this.lastTimestamp) / 1000);
    this.lastTimestamp = now;

    const clampedDt = Math.min(MAX_FRAME_DELTA, rawDt);
    this.accumulator += clampedDt;

    while (this.accumulator >= FIXED_TIMESTEP) {
      this.onFixedUpdate(FIXED_TIMESTEP);
      this.accumulator -= FIXED_TIMESTEP;
    }

    const alpha = this.accumulator / FIXED_TIMESTEP;
    this.onRender(clampedDt, alpha);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
