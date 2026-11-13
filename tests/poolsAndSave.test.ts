import { describe, expect, it } from 'vitest';
import { GameStateMachine, WIPEOUT_SLOWMO_DURATION } from '../src/core/GameStateMachine';
import { BulletPool, ParticlePool, RagdollPool } from '../src/core/ObjectPool';
import { sanitizeSaveData } from '../src/core/SaveManager';
import {
  CAMPAIGN_STAGES,
  generateEndlessWaveStage,
  generateSplitCausewayStage,
} from '../src/core/StageData';
import { selectBossSalvoLaneMask } from '../src/entities/BossEntity';

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

  it('simulates RagdollPool knockback tumbles, asphalt bounces, and capacity recycling', () => {
    const ragdolls = new RagdollPool(4);
    ragdolls.spawnKnockback(0, -25, true, 1.0);
    ragdolls.spawnKnockback(1.2, -10, false, 1.15);
    expect(ragdolls.activeCount).toBe(2);
    expect(ragdolls.vz[0]).toBeLessThan(0);
    expect(ragdolls.vz[1]).toBeGreaterThan(0);

    ragdolls.spawnKnockback(-1, -20, true, 1.0);
    ragdolls.spawnKnockback(2, -22, true, 1.0);
    ragdolls.spawnKnockback(0.5, -24, true, 1.0);
    expect(ragdolls.activeCount).toBe(4);

    ragdolls.update(0.35);
    expect(ragdolls.activeCount).toBe(4);
    expect(ragdolls.y[0]).toBeGreaterThanOrEqual(Math.fround(0.16));

    ragdolls.update(0.35);
    expect(ragdolls.activeCount).toBe(0);
  });

  it('pauses and resumes both RUNNING and BOSS_FIGHT states with zeroed timeScale', () => {
    const fsm = new GameStateMachine();
    expect(fsm.pause()).toBe(false);

    fsm.transitionTo('RUNNING');
    expect(fsm.pause()).toBe(true);
    expect(fsm.state).toBe('PAUSED');
    expect(fsm.timeScale).toBe(0.0);
    expect(fsm.resumeTargetState).toBe('RUNNING');
    expect(fsm.resume()).toBe(true);
    expect(fsm.state).toBe('RUNNING');
    expect(fsm.timeScale).toBe(1.0);

    fsm.transitionTo('BOSS_FIGHT');
    expect(fsm.pause()).toBe(true);
    expect(fsm.state).toBe('PAUSED');
    expect(fsm.resumeTargetState).toBe('BOSS_FIGHT');
    expect(fsm.resume()).toBe(true);
    expect(fsm.state).toBe('BOSS_FIGHT');
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

  it('guarantees Boss telegraphed lane salvos target player lane while always leaving >= 1 safe lane', () => {
    for (const x of [-3.2, 0.0, 3.2]) {
      const expectedPlayerLane = x < -1.15 ? 0 : x > 1.15 ? 2 : 1;

      const mask1 = selectBossSalvoLaneMask(x, 1, 0);
      expect(mask1[expectedPlayerLane]).toBe(true);
      expect(mask1.filter(Boolean)).toHaveLength(1);

      for (let cycle = 0; cycle < 4; cycle++) {
        const mask2 = selectBossSalvoLaneMask(x, 2, cycle);
        expect(mask2[expectedPlayerLane]).toBe(true);
        expect(mask2.filter(Boolean)).toHaveLength(2);
        expect(mask2.some((locked) => !locked)).toBe(true);
      }
    }
  });

  it('defines 10 valid v6.0 400%-longer (+50% harder) campaign stages alternating Standard Bridge and Split Causeway boards', () => {
    expect(CAMPAIGN_STAGES).toHaveLength(10);
    const seenChassis = new Set<string>();
    for (let i = 0; i < CAMPAIGN_STAGES.length; i++) {
      const stage = CAMPAIGN_STAGES[i];
      expect(stage.stageNumber).toBe(i + 1);
      expect(stage.trackLength).toBeGreaterThanOrEqual(1120);
      expect(stage.supplyDrums.length).toBe(36);
      expect(stage.supplyDrums[0].z).toBeGreaterThanOrEqual(-22);
      expect(stage.gatePairs.length).toBe(12);
      expect(stage.tireStacks.length).toBe(24);
      expect(stage.enemyWaves.length).toBe(16);
      expect(stage.enemyWaves[1].count).toBeGreaterThanOrEqual(30);
      expect(stage.midBrute).toBeDefined();
      expect(stage.midBrutes?.length).toBe(3);
      expect(stage.midBrute!.maxHp).toBeGreaterThanOrEqual(10000);
      expect(stage.boss.maxHp).toBeGreaterThanOrEqual(18750);
      expect(stage.boss.salvoLanes === 1 || stage.boss.salvoLanes === 2).toBe(true);
      expect(stage.boss.salvoDamage).toBeGreaterThanOrEqual(6);
      expect(stage.boss.salvoDamage).toBeLessThanOrEqual(16);

      const expectedLayout = stage.stageNumber % 2 === 0 ? 'SPLIT_CAUSEWAY' : 'STANDARD_BRIDGE';
      expect(stage.boardLayout).toBe(expectedLayout);
      if (expectedLayout === 'SPLIT_CAUSEWAY') {
        expect(stage.splitCauseway).toBeDefined();
        expect(stage.splitCauseway!.leftQueue.length).toBe(28);
        expect(stage.splitCauseway!.rightEchelons.length).toBe(22);
        expect(stage.splitCauseway!.goliathSpawns.length).toBe(3);
      }

      seenChassis.add(stage.boss.chassis);
    }
    expect(seenChassis).toEqual(
      new Set(['WARDEN_MECH', 'SIEGE_TANK', 'KRAKEN_WALKER', 'SOVEREIGN_TITAN'])
    );

    const split1 = generateSplitCausewayStage(1);
    const split6 = generateSplitCausewayStage(6);
    expect(split1.boardLayout).toBe('SPLIT_CAUSEWAY');
    expect(split1.splitCauseway?.leftQueue[0].reward).toEqual({
      kind: 'GATE',
      operator: 'MUL',
      value: 2,
    });
    expect(split6.boss.maxHp).toBeGreaterThan(split1.boss.maxHp);

    const wave1 = generateEndlessWaveStage(1);
    const wave2 = generateEndlessWaveStage(2);
    const wave4 = generateEndlessWaveStage(4);
    const wave5 = generateEndlessWaveStage(5);
    expect(wave1.boardLayout).toBe('STANDARD_BRIDGE');
    expect(wave2.boardLayout).toBe('SPLIT_CAUSEWAY');
    expect(wave1.supplyDrums.length).toBe(36);
    expect(wave1.tireStacks.length).toBe(24);
    expect(wave1.midBrute).toBeDefined();
    expect(wave5.boss.maxHp).toBeGreaterThan(wave1.boss.maxHp);
    expect(wave1.boss.salvoLanes).toBe(1);
    expect(wave5.boss.salvoLanes).toBe(2);
    expect(wave4.boss.chassis).toBe('SOVEREIGN_TITAN');
  });

  it('sanitizes malformed localStorage payloads including SPLIT_CAUSEWAY mode and split stages safely', () => {
    const clean = sanitizeSaveData({
      coins: 150.9,
      unlockedStage: 99,
      selectedStage: -4,
      selectedMode: 'SPLIT_CAUSEWAY',
      splitCausewayStage: 7.8,
      bestSplitStage: -2,
      upgrades: { fireRate: 3, bulletPower: 'bad' },
    });
    expect(clean.coins).toBe(150);
    expect(clean.unlockedStage).toBe(10);
    expect(clean.selectedStage).toBe(1);
    expect(clean.selectedMode).toBe('SPLIT_CAUSEWAY');
    expect(clean.splitCausewayStage).toBe(7);
    expect(clean.bestSplitStage).toBe(7);
    expect(clean.upgrades.fireRate).toBe(3);
    expect(clean.upgrades.bulletPower).toBe(0);
  });
});
