import type { WeaponSpec, WeaponTierId } from '../core/types';

export const WEAPON_LOCK_BONUS_COINS = 50;
export const WEAPON_LOCK_BONUS_SQUAD = 1;
export const MAX_SQUAD_COUNT = 10;
export const MAX_VISUAL_SOLDIERS = 10;
export const MAX_ACTIVE_VOLLEY_EMITTERS = 10;
export const OVERFLOW_SQUAD_COIN_BONUS = 25;
export const COMMANDO_MODEL_SCALE = 1.42;
export const BASE_SOLDIER_BULLET_DAMAGE = 5.0;

const DEG_TO_RAD = Math.PI / 180;

export const WEAPON_SPECS: Readonly<Record<WeaponTierId, WeaponSpec>> = {
  1: {
    tier: 1,
    name: 'Sidearm Pistol',
    shortBadge: 'Lv1 PISTOL',
    pattern: 'SINGLE',
    fireRate: 3.4,
    damageMultiplier: 1.0,
    projectileSpeed: 29,
    pierceCount: 1,
    spreadRadians: 0,
    colorHex: 0x62f4ff,
    bossArmorFactor: 1.0,
  },
  2: {
    tier: 2,
    name: 'Tactical SMG',
    shortBadge: 'Lv2 SMG',
    pattern: 'SINGLE',
    fireRate: 6.2,
    damageMultiplier: 1.08,
    projectileSpeed: 33,
    pierceCount: 1,
    spreadRadians: 0.8 * DEG_TO_RAD,
    colorHex: 0x45ffdf,
    bossArmorFactor: 1.0,
  },
  3: {
    tier: 3,
    name: 'Assault Rifle',
    shortBadge: 'Lv3 RIFLE',
    pattern: 'BURST_2',
    fireRate: 4.5,
    damageMultiplier: 1.85,
    projectileSpeed: 36,
    pierceCount: 1,
    spreadRadians: 0.4 * DEG_TO_RAD,
    colorHex: 0xffe066,
    bossArmorFactor: 1.0,
  },
  4: {
    tier: 4,
    name: 'Rotary Minigun',
    shortBadge: 'Lv4 MINIGUN',
    pattern: 'TWIN_SPREAD',
    fireRate: 7.4,
    damageMultiplier: 1.75,
    projectileSpeed: 39,
    pierceCount: 1,
    spreadRadians: 2.6 * DEG_TO_RAD,
    colorHex: 0xff9f43,
    bossArmorFactor: 1.0,
  },
  5: {
    tier: 5,
    name: 'Plasma Pulse Rifle',
    shortBadge: 'Lv5 PLASMA',
    pattern: 'PIERCING',
    fireRate: 5.2,
    damageMultiplier: 3.15,
    projectileSpeed: 42,
    pierceCount: 2,
    spreadRadians: 0,
    colorHex: 0x38f6ff,
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
 * Breaking a crate/tire stack with a lower or equal tier weapon NEVER downgrades the player's weapon;
 * instead it keeps their higher-tier weapon and grants +50 coins and +1 elite commando.
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
 * Front-rank elite commandos (1..5) fire at full 1:1 line-of-sight efficiency;
 * second-rank commandos (6..10) add 0.82x over-the-shoulder suppressive fire.
 */
export function computeEffectiveFiringSquad(logicalSquad: number): number {
  if (logicalSquad <= 0) {
    return 0;
  }
  if (logicalSquad <= 5) {
    return logicalSquad;
  }
  return 5 + (logicalSquad - 5) * 0.82;
}

/**
 * Computes 1:1 per-commando emitter streams and projectile damage for our 1-10 elite commando squad.
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
  const clampedSquad = Math.min(logicalSquad, MAX_SQUAD_COUNT);
  const visualSoldiers = Math.min(clampedSquad, MAX_VISUAL_SOLDIERS);
  const activeEmitters = Math.min(clampedSquad, MAX_ACTIVE_VOLLEY_EMITTERS);

  const projectilesPerEmitter =
    spec.pattern === 'BURST_2' || spec.pattern === 'TWIN_SPREAD' ? 2 : 1;

  const perEventDamage =
    BASE_SOLDIER_BULLET_DAMAGE * bulletPowerMultiplier * spec.damageMultiplier;
  const effectiveSquad = computeEffectiveFiringSquad(clampedSquad);
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
