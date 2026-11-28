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
    expect(computeEffectiveFiringSquad(6)).toBe(6);
    expect(computeEffectiveFiringSquad(16)).toBeCloseTo(6 + 10 * 0.70, 4);
    expect(computeEffectiveFiringSquad(40)).toBeCloseTo(6 + 12 * 0.70 + 22 * 0.48, 4);

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

  it('fires strictly parallel vx = 0 staggered bullets and clamps off-curb flanking shots onto the outer-lane playable rail', async () => {
    const {
      computeParallelShotTrajectory,
      PARALLEL_SHOT_RANGE,
      WEAPON_SPECS,
    } = await import('../src/math/weaponMath');
    const {
      BRIDGE_PLAYABLE_HALF_WIDTH,
      BULLET_PLAYABLE_RAIL_X,
      SQUAD_CENTER_BOUNDARY_X,
    } = await import('../src/math/formationMath');
    const { BulletPool } = await import('../src/core/ObjectPool');
    const { SquadController } = await import('../src/entities/SquadController');

    expect(WEAPON_SPECS[4].pattern).toBe('TWIN_CONVERGE');

    const traj = { vx: 99, vz: 0, maxAge: 0 };
    computeParallelShotTrajectory(40, PARALLEL_SHOT_RANGE, traj);
    expect(traj.vx).toBe(0);
    expect(traj.vz).toBe(-40);
    expect(traj.maxAge).toBeCloseTo(PARALLEL_SHOT_RANGE / 40, 4);

    // Full 40-soldier squad emits staggered parallel shots over multiple 1/60s ticks (no synchronized horizontal bars!)
    const squad = new SquadController();
    squad.resetForRun(40);
    squad.weaponTier = 3;
    const pool = new BulletPool(512);
    let ticksWithShots = 0;
    const perTickCounts: number[] = [];
    for (let t = 0; t < 18; t++) {
      const before = pool.activeCount;
      squad.updateAutoFire(1 / 60, 1.0, 1.0, pool, 42);
      const spawned = pool.activeCount - before;
      if (spawned > 0) {
        ticksWithShots++;
        perTickCounts.push(spawned);
      }
    }
    expect(ticksWithShots).toBeGreaterThanOrEqual(6);
    expect(Math.max(...perTickCounts)).toBeLessThan(40);
    expect(pool.activeCount).toBeGreaterThan(20);
    for (let i = 0; i < pool.activeCount; i++) {
      expect(pool.vx[i]).toBe(0);
      expect(pool.vz[i]).toBeLessThan(0);
    }

    // Push full 40-soldier squad to far-right outer lane: flanking soldiers overhang curb, yet 100% of bullets clamp inside ±BULLET_PLAYABLE_RAIL_X
    pool.clear();
    squad.x = SQUAD_CENTER_BOUNDARY_X;
    squad.updateMovement(0, 0, false, true);
    let maxSoldierX = -Infinity;
    for (let i = 0; i < 40; i++) {
      maxSoldierX = Math.max(maxSoldierX, squad.soldierWorldX[i]);
    }
    expect(maxSoldierX).toBeGreaterThan(BRIDGE_PLAYABLE_HALF_WIDTH);

    for (let t = 0; t < 20; t++) {
      squad.updateAutoFire(1 / 60, 1.0, 1.0, pool, 42);
    }
    expect(pool.activeCount).toBeGreaterThan(25);
    for (let i = 0; i < pool.activeCount; i++) {
      expect(pool.vx[i]).toBe(0);
      expect(Math.abs(pool.x[i])).toBeLessThanOrEqual(BULLET_PLAYABLE_RAIL_X + 1e-4);
    }
  });

  it('exposes Unicorn Magic Horns & Wands specs in UNICORN skin while preserving exact combat DPS parity', async () => {
    const {
      getWeaponDisplaySpec,
      UNICORN_WEAPON_SPECS,
      WEAPON_SPECS,
    } = await import('../src/math/weaponMath');

    for (const tier of [1, 2, 3, 4, 5] as const) {
      const tactical = getWeaponDisplaySpec(tier, 'TACTICAL');
      const unicorn = getWeaponDisplaySpec(tier, 'UNICORN');

      expect(tactical).toBe(WEAPON_SPECS[tier]);
      expect(unicorn).toBe(UNICORN_WEAPON_SPECS[tier]);
      expect(unicorn.damage).toBe(tactical.damage);
      expect(unicorn.fireInterval).toBe(tactical.fireInterval);
      expect(unicorn.projectilesPerVolley).toBe(tactical.projectilesPerVolley);
      expect(unicorn.pierce).toBe(tactical.pierce);
      expect(unicorn.bossArmorFactor).toBe(tactical.bossArmorFactor);
      expect(unicorn.name).not.toBe(tactical.name);
      expect(unicorn.shortBadge).not.toBe(tactical.shortBadge);
    }

    expect(UNICORN_WEAPON_SPECS[1].name).toContain('Wand');
    expect(UNICORN_WEAPON_SPECS[2].name).toContain('Horn');
    expect(UNICORN_WEAPON_SPECS[3].name).toContain('Wand');
    expect(UNICORN_WEAPON_SPECS[4].name).toContain('Horn');
    expect(UNICORN_WEAPON_SPECS[5].name).toContain('Wand');

    const upUnicorn = resolveWeaponPickup(1, 5, 'UNICORN');
    expect(upUnicorn.upgraded).toBe(true);
    expect(upUnicorn.bannerText).toBe('Lv5 ALICORN EQUIPPED!');
  });
});
