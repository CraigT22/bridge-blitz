import { describe, expect, it } from 'vitest';
import { GameStateMachine, WIPEOUT_SLOWMO_DURATION } from '../src/core/GameStateMachine';
import { BulletPool, ParticlePool } from '../src/core/ObjectPool';
import { sanitizeSaveData } from '../src/core/SaveManager';
import { CAMPAIGN_STAGES, generateEndlessWaveStage } from '../src/core/StageData';

describe('ObjectPool & Core State Integrity', () => {
  it('maintains contiguous O(1) swap-remove invariants in BulletPool', () => {
    const pool = new BulletPool(10);
    const i0 = pool.spawn(1, 0.5, -5, 0, -40, 2, 1, 1.0, 1, 1, 0xffffff);
    const i1 = pool.spawn(2, 0.5, -10, 0, -40, 4, 2, 1.0, 1, 5, 0x36f3ff);
    const i2 = pool.spawn(3, 0.5, -15, 0, -40, 6, 1, 1.0, 1, 3, 0xffaa00);

    expect(i0).toBe(0);
    expect(i1).toBe(1);
    expect(i2).toBe(2);
    expect(pool.activeCount).toBe(3);

    // Deactivating index 0 swaps index 2 into slot 0
    pool.deactivate(0);
    expect(pool.activeCount).toBe(2);
    expect(pool.x[0]).toBe(3);
    expect(pool.damage[0]).toBe(6);
    expect(pool.x[1]).toBe(2);
  });

  it('expires particles cleanly in ParticlePool without leaking slots', () => {
    const p = new ParticlePool(32);
    p.spawnBurst(0, 1, -10, 12, 5, 0xffd166, 0.2, 0.4);
    expect(p.activeCount).toBe(12);

    p.update(0.2);
    expect(p.activeCount).toBe(12);

    p.update(0.25);
    expect(p.activeCount).toBe(0);
  });

  it('runs a 0.8s slow-motion wipeout transition on DEFEAT before unlocking summary modal', () => {
    const fsm = new GameStateMachine();
    fsm.transitionTo('RUNNING');
    expect(fsm.timeScale).toBe(1.0);

    fsm.transitionTo('DEFEAT');
    expect(fsm.timeScale).toBeLessThan(1.0);
    expect(fsm.isWipeoutModalReady).toBe(false);

    expect(fsm.tickRealTime(0.4)).toBe(false);
    expect(fsm.isWipeoutModalReady).toBe(false);

    expect(fsm.tickRealTime(WIPEOUT_SLOWMO_DURATION)).toBe(true);
    expect(fsm.isWipeoutModalReady).toBe(true);
    expect(fsm.timeScale).toBe(1.0);
  });

  it('defines 10 valid handcrafted campaign stages and scalable Endless waves', () => {
    expect(CAMPAIGN_STAGES).toHaveLength(10);
    for (let i = 0; i < CAMPAIGN_STAGES.length; i++) {
      expect(CAMPAIGN_STAGES[i].stageNumber).toBe(i + 1);
      expect(CAMPAIGN_STAGES[i].gatePairs.length).toBeGreaterThanOrEqual(3);
      expect(CAMPAIGN_STAGES[i].boss.maxHp).toBeGreaterThan(0);
    }

    const wave1 = generateEndlessWaveStage(1);
    const wave5 = generateEndlessWaveStage(5);
    expect(wave5.boss.maxHp).toBeGreaterThan(wave1.boss.maxHp);
  });

  it('sanitizes malformed localStorage payloads safely', () => {
    const clean = sanitizeSaveData({
      coins: 150.9,
      unlockedStage: 99,
      selectedStage: -4,
      selectedMode: 'ENDLESS',
      upgrades: { fireRate: 3, bulletPower: 'bad' },
    });
    expect(clean.coins).toBe(150);
    expect(clean.unlockedStage).toBe(10);
    expect(clean.selectedStage).toBe(1);
    expect(clean.selectedMode).toBe('ENDLESS');
    expect(clean.upgrades.fireRate).toBe(3);
    expect(clean.upgrades.bulletPower).toBe(0);
  });
});
