import type { WeaponSpec, WeaponTierId } from '../core/types';

export const WEAPON_LOCK_BONUS_COINS = 50;
export const WEAPON_LOCK_BONUS_SQUAD = 3;
export const MAX_VISUAL_SOLDIERS = 150;
export const MAX_ACTIVE_VOLLEY_EMITTERS = 48;
export const BASE_SOLDIER_BULLET_DAMAGE = 1.0;

const DEG_TO_RAD = Math.PI / 180;

export const WEAPON_SPECS: Readonly<Record<WeaponTierId, WeaponSpec>> = {
  1: {
    tier: 1,
    name: 'Sidearm Pistol',
    shortBadge: 'Lv1 PISTOL',
    pattern: 'SINGLE',
    fireRate: 2.5,
    damageMultiplier: 1.0,
    projectileSpeed: 28,
    pierceCount: 1,
    spreadRadians: 0,
    colorHex: 0xffd85a,
    bossArmorFactor: 1.0,
  },
  2: {
    tier: 2,
    name: 'Tactical SMG',
    shortBadge: 'Lv2 SMG',
    pattern: 'SINGLE',
    fireRate: 5.0,
    damageMultiplier: 1.15,
    projectileSpeed: 32,
    pierceCount: 1,
    spreadRadians: 0.9 * DEG_TO_RAD,
    colorHex: 0xffe66d,
    bossArmorFactor: 1.0,
  },
  3: {
    tier: 3,
    name: 'Assault Rifle',
    shortBadge: 'Lv3 RIFLE',
    pattern: 'BURST_2',
    fireRate: 4.5,
    damageMultiplier: 1.6,
    projectileSpeed: 36,
    pierceCount: 1,
    spreadRadians: 0.4 * DEG_TO_RAD,
    colorHex: 0xffae42,
    bossArmorFactor: 1.0,
  },
  4: {
    tier: 4,
    name: 'Rotary Minigun',
    shortBadge: 'Lv4 MINIGUN',
    pattern: 'TWIN_SPREAD',
    fireRate: 8.5,
    damageMultiplier: 1.4,
    projectileSpeed: 39,
    pierceCount: 1,
    spreadRadians: 3.0 * DEG_TO_RAD,
    colorHex: 0xff8c38,
    bossArmorFactor: 1.0,
  },
  5: {
    tier: 5,
    name: 'Plasma Pulse Rifle',
    shortBadge: 'Lv5 PLASMA',
    pattern: 'PIERCING',
    fireRate: 4.0,
    damageMultiplier: 2.75,
    projectileSpeed: 42,
    pierceCount: 2,
    spreadRadians: 0,
    colorHex: 0x36f3ff,
    bossArmorFactor: 1.35,
  },
};

export interface WeaponPickupResolution {
  readonly equippedTier: WeaponTierId;
  readonly upgraded: boolean;
  readonly lockedBonusTriggered: boolean;
  readonly bonusCoins: number;
  readonly bonusSquad: number;
  readonly bannerText: string;
}

/**
 * Mandatory Weapon Lock Rule:
 * Breaking a tire stack with a lower or equal tier weapon NEVER downgrades the player's weapon;
 * instead it keeps their higher-tier weapon and grants +50 coins and +3 squad soldiers.
 */
export function resolveWeaponPickup(
  currentTier: WeaponTierId,
  pickupTier: WeaponTierId
): WeaponPickupResolution {
  if (pickupTier > currentTier) {
    const spec = WEAPON_SPECS[pickupTier];
    return {
      equippedTier: pickupTier,
      upgraded: true,
      lockedBonusTriggered: false,
      bonusCoins: 0,
      bonusSquad: 0,
      bannerText: `${spec.shortBadge} EQUIPPED!`,
    };
  }

  return {
    equippedTier: currentTier,
    upgraded: false,
    lockedBonusTriggered: true,
    bonusCoins: WEAPON_LOCK_BONUS_COINS,
    bonusSquad: WEAPON_LOCK_BONUS_SQUAD,
    bannerText: `WEAPON LOCKED: +${WEAPON_LOCK_BONUS_COINS} COINS`,
  };
}

export interface VolleyDamagePlan {
  readonly visualSoldiers: number;
  readonly activeEmitters: number;
  readonly projectilesPerEmitter: number;
  readonly damagePerProjectile: number;
  readonly intervalSeconds: number;
}

/**
 * Models front-rank clear line-of-sight (1:1 up to 6 commandos) plus smooth C1 sublinear
 * rear-platoon suppressive fire (4 * sqrt(n - 2) - 2 for n > 6).
 * Every additional commando increases total squad DPS and 1-for-1 durability without letting
 * 500+ troop snowballs vaporize Bosses in 0.2 seconds.
 */
export function computeEffectiveFiringSquad(logicalSquad: number): number {
  if (logicalSquad <= 0) {
    return 0;
  }
  if (logicalSquad <= 6) {
    return logicalSquad;
  }
  return 4 * Math.sqrt(logicalSquad - 2) - 2;
}

/**
 * Computes visual soldier cap (<=150), emitter count (<=48), and platoon-scaled
 * per-projectile damage while keeping projectile counts inside the fixed BulletPool at 60 FPS.
 */
export function computeSquadVolleyPlan(
  logicalSquad: number,
  weaponTier: WeaponTierId,
  fireRateMultiplier: number,
  bulletPowerMultiplier: number
): VolleyDamagePlan {
  if (logicalSquad <= 0) {
    return {
      visualSoldiers: 0,
      activeEmitters: 0,
      projectilesPerEmitter: 0,
      damagePerProjectile: 0,
      intervalSeconds: 1,
    };
  }

  const spec = WEAPON_SPECS[weaponTier];
  const visualSoldiers = Math.min(logicalSquad, MAX_VISUAL_SOLDIERS);
  const activeEmitters = Math.min(logicalSquad, MAX_ACTIVE_VOLLEY_EMITTERS);

  const projectilesPerEmitter =
    spec.pattern === 'BURST_2' || spec.pattern === 'TWIN_SPREAD' ? 2 : 1;

  const perEventDamage =
    BASE_SOLDIER_BULLET_DAMAGE * bulletPowerMultiplier * spec.damageMultiplier;
  const effectiveSquad = computeEffectiveFiringSquad(logicalSquad);
  const squadScale = effectiveSquad / activeEmitters;
  const damagePerProjectile = (perEventDamage / projectilesPerEmitter) * squadScale;

  const effectiveFireRate = Math.max(0.5, spec.fireRate * fireRateMultiplier);
  const intervalSeconds = 1 / effectiveFireRate;

  return {
    visualSoldiers,
    activeEmitters,
    projectilesPerEmitter,
    damagePerProjectile,
    intervalSeconds,
  };
}
