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

  it('converges left, center, and right crowd muzzles to a single forward focal point with zero crossover past the tip', async () => {
    const {
      computeConvergingShotTrajectory,
      FOCAL_CONVERGENCE_DISTANCE,
      WEAPON_SPECS,
    } = await import('../src/math/weaponMath');
    const { BulletPool } = await import('../src/core/ObjectPool');
    const { SquadController } = await import('../src/entities/SquadController');

    expect(WEAPON_SPECS[4].pattern).toBe('TWIN_CONVERGE');

    const outLeft = { vx: 0, vz: 0, maxAge: 0 };
    const outRight = { vx: 0, vz: 0, maxAge: 0 };
    computeConvergingShotTrajectory(-1.75, 0, 0, -FOCAL_CONVERGENCE_DISTANCE, 40, outLeft);
    computeConvergingShotTrajectory(1.75, 0, 0, -FOCAL_CONVERGENCE_DISTANCE, 40, outRight);

    expect(outLeft.vx).toBeGreaterThan(0);
    expect(outRight.vx).toBeLessThan(0);
    expect(outLeft.vx).toBeCloseTo(-outRight.vx, 5);

    // At t = maxAge, both left and right flank rays meet at x = 0 and never cross over for 0 <= t < maxAge
    expect(-1.75 + outLeft.vx * outLeft.maxAge).toBeCloseTo(0, 5);
    expect(1.75 + outRight.vx * outRight.maxAge).toBeCloseTo(0, 5);
    expect(-1.75 + outLeft.vx * (outLeft.maxAge * 0.99)).toBeLessThan(0);
    expect(1.75 + outRight.vx * (outRight.maxAge * 0.99)).toBeGreaterThan(0);

    // Full 40-commando Lv4 Minigun crowd volley converges every single bullet inward toward focalX = 0
    const squad = new SquadController();
    squad.resetForRun(40);
    squad.weaponTier = 4;
    const pool = new BulletPool(256);
    squad.updateAutoFire(0.2, 1.0, 1.0, pool, 0, -FOCAL_CONVERGENCE_DISTANCE, false);

    expect(pool.activeCount).toBe(52);
    for (let i = 0; i < pool.activeCount; i++) {
      const endX = pool.x[i] + pool.vx[i] * pool.maxAge[i];
      expect(Math.abs(endX)).toBeLessThanOrEqual(0.06);
    }
  });
});
