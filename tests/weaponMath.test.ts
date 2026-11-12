import { describe, expect, it } from 'vitest';
import {
  computeEffectiveFiringSquad,
  computeSquadVolleyPlan,
  MAX_ACTIVE_VOLLEY_EMITTERS,
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

  it('enforces Mandatory Weapon Lock Rule: never downgrades on lower or equal tier and awards +25 coins + 1 commando', () => {
    const lowerPickup = resolveWeaponPickup(4, 2);
    expect(lowerPickup.equippedTier).toBe(4);
    expect(lowerPickup.upgraded).toBe(false);
    expect(lowerPickup.lockedBonusTriggered).toBe(true);
    expect(lowerPickup.bonusCoins).toBe(WEAPON_LOCK_BONUS_COINS);
    expect(lowerPickup.bonusSquad).toBe(WEAPON_LOCK_BONUS_SQUAD);
    expect(lowerPickup.bannerText).toContain('WEAPON LOCKED: +25 COINS');
  });

  it('scales crowd DPS smoothly across 1..40 commandos while capping emitters at MAX_ACTIVE_VOLLEY_EMITTERS', () => {
    expect(MAX_SQUAD_COUNT).toBe(40);
    expect(computeEffectiveFiringSquad(1)).toBe(1);
    expect(computeEffectiveFiringSquad(4)).toBe(4);
    expect(computeEffectiveFiringSquad(16)).toBeGreaterThan(13);
    expect(computeEffectiveFiringSquad(40)).toBeGreaterThan(30);

    const plan1 = computeSquadVolleyPlan(1, 2, 1.0, 1.0);
    const plan40 = computeSquadVolleyPlan(40, 2, 1.0, 1.0);

    expect(plan40.visualSoldiers).toBe(40);
    expect(plan40.activeEmitters).toBe(MAX_ACTIVE_VOLLEY_EMITTERS);

    const dps1 =
      (plan1.activeEmitters * plan1.projectilesPerEmitter * plan1.damagePerProjectile) /
      plan1.intervalSeconds;
    const dps40 =
      (plan40.activeEmitters * plan40.projectilesPerEmitter * plan40.damagePerProjectile) /
      plan40.intervalSeconds;

    expect(dps40 / dps1).toBeCloseTo(computeEffectiveFiringSquad(40), 4);
  });
});
