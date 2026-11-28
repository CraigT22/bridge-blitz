import { describe, expect, it } from 'vitest';
import {
  attemptPurchaseUpgrade,
  computeRunCoinPayout,
  computeUpgradeCost,
  DIFFICULTY_ORDER,
  formatCoinAmount,
  formatObstacleHp,
  getBulletPowerMultiplier,
  getDifficultyProfile,
  getFireRateMultiplier,
  getStartingSquadCount,
  getWarChestMultiplier,
  MAX_STARTING_SQUAD_LEVEL,
} from '../src/math/progressionMath';

describe('progressionMath', () => {
  it('follows the v8.2 Skill+Progression exponential upgrade cost curves', () => {
    expect(computeUpgradeCost('fireRate', 0)).toBe(40);
    expect(computeUpgradeCost('fireRate', 1)).toBe(Math.round(40 * 1.42));
    expect(computeUpgradeCost('bulletPower', 3)).toBe(Math.round(45 * Math.pow(1.44, 3)));
    expect(computeUpgradeCost('warChest', 2)).toBe(Math.round(45 * Math.pow(1.40, 2)));
    expect(computeUpgradeCost('startingSquad', 2)).toBe(Math.round(110 * Math.pow(1.72, 2)));
  });

  it('computes v8.2 smooth diminishing-returns stat multipliers and caps startingSquad at MAX_STARTING_SQUAD_LEVEL (8)', () => {
    expect(MAX_STARTING_SQUAD_LEVEL).toBe(8);
    expect(getFireRateMultiplier(0)).toBe(1);
    expect(getFireRateMultiplier(4)).toBeCloseTo(1 + (0.055 * 4) / (1 + 0.045 * 4), 5);
    expect(getBulletPowerMultiplier(2)).toBeCloseTo(1 + (0.085 * 2) / (1 + 0.038 * 2), 5);
    expect(getWarChestMultiplier(4)).toBeCloseTo(1 + (0.10 * 4) / (1 + 0.025 * 4), 5);

    // Diminishing returns: marginal gain from lv10->lv11 is strictly smaller than lv0->lv1, yet always positive
    const fireGainEarly = getFireRateMultiplier(1) - getFireRateMultiplier(0);
    const fireGainLate = getFireRateMultiplier(11) - getFireRateMultiplier(10);
    expect(fireGainLate).toBeGreaterThan(0);
    expect(fireGainLate).toBeLessThan(fireGainEarly);

    const powerGainEarly = getBulletPowerMultiplier(1) - getBulletPowerMultiplier(0);
    const powerGainLate = getBulletPowerMultiplier(11) - getBulletPowerMultiplier(10);
    expect(powerGainLate).toBeGreaterThan(0);
    expect(powerGainLate).toBeLessThan(powerGainEarly);

    expect(getStartingSquadCount(0)).toBe(1);
    expect(getStartingSquadCount(MAX_STARTING_SQUAD_LEVEL)).toBe(9);
    expect(getStartingSquadCount(99)).toBe(9);
  });

  it('defines strictly escalating NORMAL, HARD, and NIGHTMARE difficulty tier profiles', () => {
    expect(DIFFICULTY_ORDER).toEqual(['NORMAL', 'HARD', 'NIGHTMARE']);
    const normal = getDifficultyProfile('NORMAL');
    const hard = getDifficultyProfile('HARD');
    const nightmare = getDifficultyProfile('NIGHTMARE');

    expect(normal.coinMultiplier).toBe(1.0);
    expect(hard.coinMultiplier).toBe(1.5);
    expect(nightmare.coinMultiplier).toBe(2.25);

    expect(hard.enemyHpMult).toBeGreaterThan(normal.enemyHpMult);
    expect(nightmare.enemyHpMult).toBeGreaterThan(hard.enemyHpMult);
    expect(hard.bossHpMult).toBeGreaterThan(normal.bossHpMult);
    expect(nightmare.bossHpMult).toBeGreaterThan(hard.bossHpMult);
    expect(hard.enemyBoltDamage).toBeGreaterThan(normal.enemyBoltDamage);
    expect(nightmare.enemyBoltDamage).toBeGreaterThan(hard.enemyBoltDamage);
  });

  it('formats large coins with K/M/B suffixes while keeping < 10,000 obstacle/Brute HP raw integers', () => {
    expect(formatCoinAmount(950)).toBe('950');
    expect(formatCoinAmount(1250)).toBe('1.25K');
    expect(formatCoinAmount(48500)).toBe('48.5K');
    expect(formatCoinAmount(2400000)).toBe('2.4M');

    expect(formatObstacleHp(1750)).toBe('1750');
    expect(formatObstacleHp(8508)).toBe('8508');
    expect(formatObstacleHp(12500)).toBe('12.5K');
    expect(formatObstacleHp(76000)).toBe('76K');
  });

  it('deducts coins and increments level on valid upgrade purchase, rejecting insufficient coins or capped squad', () => {
    const base = { fireRate: 0, bulletPower: 0, startingSquad: 0, warChest: 0 };
    const fail = attemptPurchaseUpgrade(10, base, 'fireRate');
    expect(fail.purchased).toBe(false);
    expect(fail.remainingCoins).toBe(10);

    const ok = attemptPurchaseUpgrade(60, base, 'fireRate');
    expect(ok.purchased).toBe(true);
    expect(ok.remainingCoins).toBe(20);
    expect(ok.nextUpgrades.fireRate).toBe(1);

    const cappedSquad = { ...base, startingSquad: MAX_STARTING_SQUAD_LEVEL };
    const failCap = attemptPurchaseUpgrade(99999, cappedSquad, 'startingSquad');
    expect(failCap.purchased).toBe(false);
  });

  it('awards end-of-run distance and clear bonus coins scaled by Bounty (warChest) and Difficulty multipliers', () => {
    const expectedWarChest = getWarChestMultiplier(2);
    const partial = computeRunCoinPayout({
      progressRatio: 0.45,
      stageNumber: 1,
      enemiesDefeated: 0,
      bonusCoinsCollected: 0,
      bossRewardCoins: 260,
      clearedStage: false,
      warChestLevel: 2,
      difficultyMultiplier: 1.5,
    });

    expect(partial.distanceCoins).toBeGreaterThan(0);
    expect(partial.warChestMultiplier).toBeCloseTo(expectedWarChest, 5);
    expect(partial.difficultyMultiplier).toBe(1.5);
    expect(partial.totalCoinsEarned).toBe(
      Math.round(partial.distanceCoins * expectedWarChest * 1.5)
    );
  });

  it('maintains strictly monotonic v8.3 Siege Goliath HP, Boss HP, waveCountMult, and 2-lane salvos across all 10 Campaign sectors & difficulty scaling', async () => {
    const { applyDifficultyToStage, CAMPAIGN_STAGES } = await import('../src/core/StageData');
    expect(CAMPAIGN_STAGES).toHaveLength(10);
    expect(CAMPAIGN_STAGES[0].boss.maxHp).toBe(18000);
    expect(CAMPAIGN_STAGES[9].boss.maxHp).toBe(92000);
    expect(CAMPAIGN_STAGES[0].boss.salvoLanes).toBe(2);

    for (let i = 1; i < CAMPAIGN_STAGES.length; i++) {
      const prev = CAMPAIGN_STAGES[i - 1];
      const curr = CAMPAIGN_STAGES[i];
      expect(curr.boss.maxHp).toBeGreaterThan(prev.boss.maxHp);
      expect(curr.boss.salvoLanes).toBe(2);
      expect(curr.midBrute).toBeDefined();
      expect(prev.midBrute).toBeDefined();
      expect(curr.midBrute!.maxHp).toBeGreaterThan(prev.midBrute!.maxHp);
    }

    // applyDifficultyToStage scales wave count, HP, speed, gate cost, and salvo cadence without mutating base stages
    const baseS1 = CAMPAIGN_STAGES[0];
    const hardS1 = applyDifficultyToStage(baseS1, 'HARD');
    const nmS1 = applyDifficultyToStage(baseS1, 'NIGHTMARE');
    expect(baseS1.boss.maxHp).toBe(18000);
    expect(hardS1.boss.maxHp).toBeGreaterThan(baseS1.boss.maxHp);
    expect(nmS1.boss.maxHp).toBeGreaterThan(hardS1.boss.maxHp);
    expect(hardS1.enemyWaves[0].count).toBeGreaterThan(baseS1.enemyWaves[0].count);
    expect(nmS1.enemyWaves[0].count).toBeGreaterThan(hardS1.enemyWaves[0].count);
    expect(nmS1.enemyWaves[nmS1.enemyWaves.length - 1].count).toBeLessThanOrEqual(144);
    expect(hardS1.enemyWaves[0].hpPerEnemy).toBeGreaterThan(baseS1.enemyWaves[0].hpPerEnemy);
    expect(nmS1.boss.salvoInterval).toBeLessThan(baseS1.boss.salvoInterval);
  });
});
