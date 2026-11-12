import { describe, expect, it } from 'vitest';
import {
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

  it('caps visual soldiers at 150 while scaling total volley DPS linearly up to 9,999+ logical troops', () => {
    const plan10 = computeSquadVolleyPlan(10, 2, 1.0, 1.0);
    const plan1000 = computeSquadVolleyPlan(1000, 2, 1.0, 1.0);

    expect(plan10.visualSoldiers).toBe(10);
    expect(plan1000.visualSoldiers).toBe(MAX_VISUAL_SOLDIERS);

    const dps10 =
      (plan10.activeEmitters * plan10.projectilesPerEmitter * plan10.damagePerProjectile) /
      plan10.intervalSeconds;
    const dps1000 =
      (plan1000.activeEmitters * plan1000.projectilesPerEmitter * plan1000.damagePerProjectile) /
      plan1000.intervalSeconds;

    expect(dps1000 / dps10).toBeCloseTo(100, 5);
  });
});
