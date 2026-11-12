import type { GameState } from './types';

export type StateChangeListener = (next: GameState, prev: GameState) => void;

export const WIPEOUT_SLOWMO_DURATION = 0.8;
export const WIPEOUT_TIME_SCALE = 0.28;

export class GameStateMachine {
  private current: GameState = 'PRE_RUN';
  private pausedFromState: 'RUNNING' | 'BOSS_FIGHT' = 'RUNNING';
  private wipeoutTimer = 0;
  private wipeoutModalReady = false;
  private readonly listeners: StateChangeListener[] = [];

  public get state(): GameState {
    return this.current;
  }

  public get resumeTargetState(): 'RUNNING' | 'BOSS_FIGHT' {
    return this.pausedFromState;
  }

  public get isWipeoutModalReady(): boolean {
    return this.current === 'DEFEAT' && this.wipeoutModalReady;
  }

  public get timeScale(): number {
    if (this.current === 'PAUSED') {
      return 0.0;
    }
    if (this.current === 'DEFEAT' && !this.wipeoutModalReady) {
      return WIPEOUT_TIME_SCALE;
    }
    return 1.0;
  }

  public onChange(listener: StateChangeListener): void {
    this.listeners.push(listener);
  }

  public pause(): boolean {
    if (this.current !== 'RUNNING' && this.current !== 'BOSS_FIGHT') {
      return false;
    }
    this.pausedFromState = this.current;
    this.transitionTo('PAUSED');
    return true;
  }

  public resume(): boolean {
    if (this.current !== 'PAUSED') {
      return false;
    }
    this.transitionTo(this.pausedFromState);
    return true;
  }

  public transitionTo(next: GameState): void {
    if (this.current === next) {
      return;
    }
    const prev = this.current;
    this.current = next;

    if (next === 'DEFEAT') {
      this.wipeoutTimer = WIPEOUT_SLOWMO_DURATION;
      this.wipeoutModalReady = false;
    } else if (next !== 'PAUSED') {
      this.wipeoutTimer = 0;
      this.wipeoutModalReady = false;
    }

    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i](next, prev);
    }
  }

  /**
   * Advances real-time transition timers (such as the 0.8s slow-motion wipeout reveal).
   * Returns true on the exact frame the wipeout slow-motion finishes so the summary modal opens.
   */
  public tickRealTime(realDt: number): boolean {
    if (this.current === 'DEFEAT' && !this.wipeoutModalReady) {
      this.wipeoutTimer -= realDt;
      if (this.wipeoutTimer <= 0) {
        this.wipeoutTimer = 0;
        this.wipeoutModalReady = true;
        return true;
      }
    }
    return false;
  }
}
