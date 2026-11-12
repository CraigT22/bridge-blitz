import { describe, expect, it } from 'vitest';
import {
  attemptPurchaseUpgrade,
  computeRunCoinPayout,
  computeUpgradeCost,
  getBulletPowerMultiplier,
  getFireRateMultiplier,
  getStartingSquadCount,
  getWarChestMultiplier,
} from '../src/math/progressionMath';

describe('progressionMath', () => {
  it('follows the exact cost = round(baseCost * 1.28^level) curve', () => {
    expect(computeUpgradeCost('fireRate', 0)).toBe(25);
    expect(computeUpgradeCost('fireRate', 1)).toBe(Math.round(25 * 1.28));
    expect(computeUpgradeCost('bulletPower', 3)).toBe(Math.round(30 * Math.pow(1.28, 3)));
    expect(computeUpgradeCost('startingSquad', 5)).toBe(Math.round(35 * Math.pow(1.28, 5)));
  });

  it('computes stat multipliers accurately across upgrade levels', () => {
    expect(getFireRateMultiplier(4)).toBeCloseTo(1.32);
    expect(getBulletPowerMultiplier(2)).toBeCloseTo(1.3);
    expect(getStartingSquadCount(0)).toBe(1);
    expect(getStartingSquadCount(6)).toBe(7);
    expect(getWarChestMultiplier(5)).toBeCloseTo(1.6);
  });

  it('deducts coins and increments level on valid upgrade purchase, rejecting insufficient coins', () => {
    const base = { fireRate: 0, bulletPower: 0, startingSquad: 0, warChest: 0 };
    const fail = attemptPurchaseUpgrade(10, base, 'fireRate');
    expect(fail.purchased).toBe(false);
    expect(fail.remainingCoins).toBe(10);

    const ok = attemptPurchaseUpgrade(60, base, 'fireRate');
    expect(ok.purchased).toBe(true);
    expect(ok.remainingCoins).toBe(35);
    expect(ok.nextUpgrades.fireRate).toBe(1);
  });

  it('awards partial distance and kill coins on defeat so zero runs are wasted', () => {
    const partial = computeRunCoinPayout({
      progressRatio: 0.6,
      stageNumber: 1,
      enemiesDefeated: 8,
      bonusCoinsCollected: 50,
      bossRewardCoins: 80,
      clearedStage: false,
      warChestLevel: 2,
    });

    expect(partial.distanceCoins).toBeGreaterThan(0);
    expect(partial.killCoins).toBeGreaterThan(0);
    expect(partial.bonusCoins).toBe(50);
    expect(partial.totalCoinsEarned).toBe(
      Math.round((partial.distanceCoins + partial.killCoins + 50) * 1.24)
    );
  });
});
