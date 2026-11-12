import { describe, expect, it } from 'vitest';
import {
  computeEffectiveFiringSquad,
  computeSquadVolleyPlan,
  MAX_VISUAL_SOLDIERS,
  resolveWeaponPickup,
  WEAPON_LOCK_BONUS_COINS,
  WEAPON_LOCK_BONUS_SQUAD,
} from '../src/math/weaponMath';

describe('weaponMath', () => {
  it('upgrades weapon tier when breaking a strictly higher-tier tire stack', () => {
    const res = resolveWeaponPickup(1, 3);
    expect(res.equippedTier).toBe(3);
    expect(res.upgraded).toBe(true);
    expect(res.lockedBonusTriggered).toBe(false);
    expect(res.bonusCoins).toBe(0);
    expect(res.bonusSquad).toBe(0);
  });

  it('enforces Mandatory Weapon Lock Rule: never downgrades on lower or equal tier and awards +50 coins + 3 squad', () => {
    const lowerPickup = resolveWeaponPickup(4, 2);
    expect(lowerPickup.equippedTier).toBe(4);
    expect(lowerPickup.upgraded).toBe(false);
    expect(lowerPickup.lockedBonusTriggered).toBe(true);
    expect(lowerPickup.bonusCoins).toBe(WEAPON_LOCK_BONUS_COINS);
    expect(lowerPickup.bonusSquad).toBe(WEAPON_LOCK_BONUS_SQUAD);
    expect(lowerPickup.bannerText).toContain('WEAPON LOCKED: +50 COINS');

    const equalPickup = resolveWeaponPickup(3, 3);
    expect(equalPickup.equippedTier).toBe(3);
    expect(equalPickup.upgraded).toBe(false);
    expect(equalPickup.lockedBonusTriggered).toBe(true);
    expect(equalPickup.bonusCoins).toBe(50);
    expect(equalPickup.bonusSquad).toBe(3);
  });

  it('scales front-rank DPS linearly up to 6 commandos and smoothly sublinearly for large platoons', () => {
    expect(computeEffectiveFiringSquad(1)).toBe(1);
    expect(computeEffectiveFiringSquad(6)).toBe(6);
    // Smooth C1 transition above 6
    expect(computeEffectiveFiringSquad(7)).toBeGreaterThan(6);
    expect(computeEffectiveFiringSquad(7)).toBeLessThan(7);

    const plan6 = computeSquadVolleyPlan(6, 2, 1.0, 1.0);
    const plan38 = computeSquadVolleyPlan(38, 2, 1.0, 1.0);
    const plan1000 = computeSquadVolleyPlan(1000, 2, 1.0, 1.0);

    expect(plan6.visualSoldiers).toBe(6);
    expect(plan1000.visualSoldiers).toBe(MAX_VISUAL_SOLDIERS);

    const dps6 =
      (plan6.activeEmitters * plan6.projectilesPerEmitter * plan6.damagePerProjectile) /
      plan6.intervalSeconds;
    const dps38 =
      (plan38.activeEmitters * plan38.projectilesPerEmitter * plan38.damagePerProjectile) /
      plan38.intervalSeconds;
    const dps1000 =
      (plan1000.activeEmitters * plan1000.projectilesPerEmitter * plan1000.damagePerProjectile) /
      plan1000.intervalSeconds;

    // 38 troops => 4*sqrt(36)-2 = 22 effective firing soldiers (22/6 = 3.666x)
    expect(dps38 / dps6).toBeCloseTo(22 / 6, 4);
    expect(dps1000).toBeGreaterThan(dps38);
    // Prevents 1,000-troop snowball from dealing 166x front-rank DPS
    expect(dps1000 / dps6).toBeLessThan(25);
  });
});
