import { describe, expect, it } from 'vitest';
import {
  attemptPurchaseUpgrade,
  computeRunCoinPayout,
  computeUpgradeCost,
  getBulletPowerMultiplier,
  getFireRateMultiplier,
  getStartingSquadCount,
  getWarChestMultiplier,
  MAX_STARTING_SQUAD_LEVEL,
} from '../src/math/progressionMath';

describe('progressionMath', () => {
  it('follows the per-stat exponential upgrade cost curves', () => {
    expect(computeUpgradeCost('fireRate', 0)).toBe(22);
    expect(computeUpgradeCost('fireRate', 1)).toBe(Math.round(22 * 1.28));
    expect(computeUpgradeCost('bulletPower', 3)).toBe(Math.round(25 * Math.pow(1.28, 3)));
    expect(computeUpgradeCost('startingSquad', 2)).toBe(Math.round(65 * Math.pow(1.55, 2)));
  });

  it('computes stat multipliers accurately and caps startingSquad at MAX_STARTING_SQUAD_LEVEL', () => {
    expect(getFireRateMultiplier(4)).toBeCloseTo(1.4);
    expect(getBulletPowerMultiplier(2)).toBeCloseTo(1.36);
    expect(getStartingSquadCount(0)).toBe(1);
    expect(getStartingSquadCount(MAX_STARTING_SQUAD_LEVEL)).toBe(1 + MAX_STARTING_SQUAD_LEVEL);
    expect(getStartingSquadCount(99)).toBe(1 + MAX_STARTING_SQUAD_LEVEL);
    expect(getWarChestMultiplier(4)).toBeCloseTo(1.6);
  });

  it('deducts coins and increments level on valid upgrade purchase, rejecting insufficient coins or capped squad', () => {
    const base = { fireRate: 0, bulletPower: 0, startingSquad: 0, warChest: 0 };
    const fail = attemptPurchaseUpgrade(10, base, 'fireRate');
    expect(fail.purchased).toBe(false);
    expect(fail.remainingCoins).toBe(10);

    const ok = attemptPurchaseUpgrade(60, base, 'fireRate');
    expect(ok.purchased).toBe(true);
    expect(ok.remainingCoins).toBe(38);
    expect(ok.nextUpgrades.fireRate).toBe(1);

    const cappedSquad = { ...base, startingSquad: MAX_STARTING_SQUAD_LEVEL };
    const failCap = attemptPurchaseUpgrade(99999, cappedSquad, 'startingSquad');
    expect(failCap.purchased).toBe(false);
  });

  it('awards end-of-run distance and clear bonus coins scaled by Revenue (warChest) multiplier', () => {
    const partial = computeRunCoinPayout({
      progressRatio: 0.45,
      stageNumber: 1,
      enemiesDefeated: 0,
      bonusCoinsCollected: 0,
      bossRewardCoins: 120,
      clearedStage: false,
      warChestLevel: 2,
    });

    expect(partial.distanceCoins).toBeGreaterThan(0);
    expect(partial.warChestMultiplier).toBeCloseTo(1.3);
    expect(partial.totalCoinsEarned).toBe(Math.round(partial.distanceCoins * 1.3));
  });
});
