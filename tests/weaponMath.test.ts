import { describe, expect, it } from 'vitest';
import {
  computeEffectiveFiringSquad,
  computeSquadVolleyPlan,
  MAX_SQUAD_COUNT,
  resolveWeaponPickup,
  WEAPON_LOCK_BONUS_COINS,
  WEAPON_LOCK_BONUS_SQUAD,
} from '../src/math/weaponMath';

describe('weaponMath', () => {
  it('upgrades weapon tier when shattering a higher-tier weapon drum or tire stack', () => {
    const res = resolveWeaponPickup(1, 3);
    expect(res.equippedTier).toBe(3);
    expect(res.upgraded).toBe(true);
    expect(res.lockedBonusTriggered).toBe(false);
    expect(res.bonusCoins).toBe(0);
    expect(res.bonusSquad).toBe(0);
  });

  it('enforces Mandatory Weapon Lock Rule: never downgrades on lower or equal tier and awards +50 coins + 1 commando', () => {
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
    expect(equalPickup.bonusSquad).toBe(1);
  });

  it('scales front-rank DPS 1:1 for 1..5 commandos and 0.82x per rear-rank commando up to MAX_SQUAD_COUNT (10)', () => {
    expect(computeEffectiveFiringSquad(1)).toBe(1);
    expect(computeEffectiveFiringSquad(5)).toBe(5);
    expect(computeEffectiveFiringSquad(6)).toBeCloseTo(5.82, 4);
    expect(computeEffectiveFiringSquad(10)).toBeCloseTo(9.1, 4);

    const plan1 = computeSquadVolleyPlan(1, 2, 1.0, 1.0);
    const plan5 = computeSquadVolleyPlan(5, 2, 1.0, 1.0);
    const plan10 = computeSquadVolleyPlan(10, 2, 1.0, 1.0);

    expect(plan5.visualSoldiers).toBe(5);
    expect(plan10.visualSoldiers).toBe(MAX_SQUAD_COUNT);

    const dps1 =
      (plan1.activeEmitters * plan1.projectilesPerEmitter * plan1.damagePerProjectile) /
      plan1.intervalSeconds;
    const dps5 =
      (plan5.activeEmitters * plan5.projectilesPerEmitter * plan5.damagePerProjectile) /
      plan5.intervalSeconds;
    const dps10 =
      (plan10.activeEmitters * plan10.projectilesPerEmitter * plan10.damagePerProjectile) /
      plan10.intervalSeconds;

    expect(dps5 / dps1).toBeCloseTo(5.0, 4);
    expect(dps10 / dps1).toBeCloseTo(9.1, 4);
  });
});
