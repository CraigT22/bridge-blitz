import { describe, expect, it } from 'vitest';
import {
  attemptPurchaseUpgrade,
  computeRunCoinPayout,
  computeUpgradeCost,
  formatCoinAmount,
  formatObstacleHp,
  getBulletPowerMultiplier,
  getFireRateMultiplier,
  getStartingSquadCount,
  getWarChestMultiplier,
  MAX_STARTING_SQUAD_LEVEL,
} from '../src/math/progressionMath';

describe('progressionMath', () => {
  it('follows the v7.0 Punishing Tactical exponential upgrade cost curves', () => {
    expect(computeUpgradeCost('fireRate', 0)).toBe(30);
    expect(computeUpgradeCost('fireRate', 1)).toBe(Math.round(30 * 1.34));
    expect(computeUpgradeCost('bulletPower', 3)).toBe(Math.round(35 * Math.pow(1.35, 3)));
    expect(computeUpgradeCost('startingSquad', 2)).toBe(Math.round(85 * Math.pow(1.65, 2)));
  });

  it('computes v7.0 stat multipliers accurately and caps startingSquad at MAX_STARTING_SQUAD_LEVEL (8)', () => {
    expect(MAX_STARTING_SQUAD_LEVEL).toBe(8);
    expect(getFireRateMultiplier(4)).toBeCloseTo(1.24);
    expect(getBulletPowerMultiplier(2)).toBeCloseTo(1.20);
    expect(getStartingSquadCount(0)).toBe(1);
    expect(getStartingSquadCount(MAX_STARTING_SQUAD_LEVEL)).toBe(9);
    expect(getStartingSquadCount(99)).toBe(9);
    expect(getWarChestMultiplier(4)).toBeCloseTo(1.40);
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
    expect(ok.remainingCoins).toBe(30);
    expect(ok.nextUpgrades.fireRate).toBe(1);

    const cappedSquad = { ...base, startingSquad: MAX_STARTING_SQUAD_LEVEL };
    const failCap = attemptPurchaseUpgrade(99999, cappedSquad, 'startingSquad');
    expect(failCap.purchased).toBe(false);
  });

  it('awards end-of-run distance and clear bonus coins scaled by Bounty (warChest) multiplier', () => {
    const partial = computeRunCoinPayout({
      progressRatio: 0.45,
      stageNumber: 1,
      enemiesDefeated: 0,
      bonusCoinsCollected: 0,
      bossRewardCoins: 260,
      clearedStage: false,
      warChestLevel: 2,
    });

    expect(partial.distanceCoins).toBeGreaterThan(0);
    expect(partial.warChestMultiplier).toBeCloseTo(1.2);
    expect(partial.totalCoinsEarned).toBe(Math.round(partial.distanceCoins * 1.2));
  });

  it('maintains strictly monotonic v7.0 Siege Goliath HP and Boss HP progression across all 10 Campaign sectors', async () => {
    const { CAMPAIGN_STAGES } = await import('../src/core/StageData');
    expect(CAMPAIGN_STAGES).toHaveLength(10);
    expect(CAMPAIGN_STAGES[0].boss.maxHp).toBe(19500);
    expect(CAMPAIGN_STAGES[9].boss.maxHp).toBe(138000);
    expect(CAMPAIGN_STAGES[0].boss.salvoLanes).toBe(1);
    for (let i = 1; i < CAMPAIGN_STAGES.length; i++) {
      const prev = CAMPAIGN_STAGES[i - 1];
      const curr = CAMPAIGN_STAGES[i];
      expect(curr.boss.maxHp).toBeGreaterThan(prev.boss.maxHp);
      expect(curr.boss.salvoLanes).toBe(2);
      expect(curr.midBrute).toBeDefined();
      expect(prev.midBrute).toBeDefined();
      expect(curr.midBrute!.maxHp).toBeGreaterThan(prev.midBrute!.maxHp);
    }
  });
});
