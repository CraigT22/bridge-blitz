import type { WeaponSpec, WeaponTierId } from '../core/types';

export const WEAPON_LOCK_BONUS_COINS = 25;
export const WEAPON_LOCK_BONUS_SQUAD = 1;
export const MAX_SQUAD_COUNT = 40;
export const MAX_VISUAL_SOLDIERS = 40;
export const MAX_ACTIVE_VOLLEY_EMITTERS = 26;
export const OVERFLOW_SQUAD_COIN_BONUS = 10;
export const COMMANDO_MODEL_SCALE = 1.24;
export const BASE_SOLDIER_BULLET_DAMAGE = 5.2;

const DEG_TO_RAD = Math.PI / 180;

export const WEAPON_SPECS: Readonly<Record<WeaponTierId, WeaponSpec>> = {
  1: {
    tier: 1,
    name: 'Sidearm Pistol',
    shortBadge: 'Lv1 PISTOL',
    pattern: 'SINGLE',
    fireRate: 3.6,
    damageMultiplier: 1.0,
    projectileSpeed: 31,
    pierceCount: 1,
    spreadRadians: 0.4 * DEG_TO_RAD,
    colorHex: 0x1ee6ff,
    bossArmorFactor: 1.0,
  },
  2: {
    tier: 2,
    name: 'Tactical SMG',
    shortBadge: 'Lv2 SMG',
    pattern: 'SINGLE',
    fireRate: 6.5,
    damageMultiplier: 1.12,
    projectileSpeed: 35,
    pierceCount: 1,
    spreadRadians: 1.2 * DEG_TO_RAD,
    colorHex: 0x08dcff,
    bossArmorFactor: 1.0,
  },
  3: {
    tier: 3,
    name: 'Assault Rifle',
    shortBadge: 'Lv3 RIFLE',
    pattern: 'BURST_2',
    fireRate: 4.8,
    damageMultiplier: 1.88,
    projectileSpeed: 38,
    pierceCount: 1,
    spreadRadians: 1.0 * DEG_TO_RAD,
    colorHex: 0xff7d24,
    bossArmorFactor: 1.0,
  },
  4: {
    tier: 4,
    name: 'Rotary Minigun',
    shortBadge: 'Lv4 MINIGUN',
    pattern: 'TWIN_SPREAD',
    fireRate: 7.6,
    damageMultiplier: 1.82,
    projectileSpeed: 40,
    pierceCount: 1,
    spreadRadians: 2.8 * DEG_TO_RAD,
    colorHex: 0xff6614,
    bossArmorFactor: 1.0,
  },
  5: {
    tier: 5,
    name: 'Plasma Pulse Rifle',
    shortBadge: 'Lv5 PLASMA',
    pattern: 'PIERCING',
    fireRate: 5.5,
    damageMultiplier: 3.25,
    projectileSpeed: 44,
    pierceCount: 2,
    spreadRadians: 0.8 * DEG_TO_RAD,
    colorHex: 0x18f4ff,
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
 * instead it keeps their higher-tier weapon and grants +25 coins and +1 elite commando.
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
 * Crowd-scale firing curve for 1..40 commandos:
 * - 1..8 front-cluster commandos fire at 1.0x efficiency
 * - 9..24 mid-cluster commandos fire at 0.85x efficiency
 * - 25..40 rear-cluster commandos fire at 0.72x efficiency
 */
export function computeEffectiveFiringSquad(logicalSquad: number): number {
  if (logicalSquad <= 0) {
    return 0;
  }
  if (logicalSquad <= 8) {
    return logicalSquad;
  }
  if (logicalSquad <= 24) {
    return 8 + (logicalSquad - 8) * 0.85;
  }
  return 8 + 16 * 0.85 + (logicalSquad - 24) * 0.72;
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
