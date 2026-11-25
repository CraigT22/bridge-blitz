import type { SkinThemeId, WeaponSpec, WeaponTierId } from '../core/types';

export const WEAPON_LOCK_BONUS_COINS = 25;
export const WEAPON_LOCK_BONUS_SQUAD = 1;
export const MAX_SQUAD_COUNT = 40;
export const MAX_VISUAL_SOLDIERS = 40;
export const MAX_ACTIVE_VOLLEY_EMITTERS = 26;
export const OVERFLOW_SQUAD_COIN_BONUS = 10;
export const COMMANDO_MODEL_SCALE = 1.66;
export const BASE_SOLDIER_BULLET_DAMAGE = 3.1;
export const PARALLEL_SHOT_RANGE = 48.0;

export interface ParallelShotTrajectory {
  vx: number;
  vz: number;
  maxAge: number;
}

/**
 * v8.0 Strictly Parallel Straight-Ahead "Garden Hose" Shot Trajectory:
 * Every bullet travels purely along world -Z (`vx = 0`, zero gravity, zero inherited lateral velocity)
 * so lateral swipes paint a crisp diagonal sweeping ribbon across the bridge!
 */
export function computeParallelShotTrajectory(
  projectileSpeed: number,
  maxRangeMeters = PARALLEL_SHOT_RANGE,
  out: ParallelShotTrajectory
): void {
  const safeSpeed = Math.max(1, projectileSpeed);
  out.vx = 0;
  out.vz = -safeSpeed;
  out.maxAge = Math.max(0.15, maxRangeMeters / safeSpeed);
}

export const WEAPON_SPECS: Readonly<Record<WeaponTierId, WeaponSpec>> = {
  1: {
    tier: 1,
    name: 'Sidearm Pistol',
    shortBadge: 'Lv1 PISTOL',
    pattern: 'SINGLE',
    fireRate: 3.4,
    damageMultiplier: 1.0,
    projectileSpeed: 31,
    pierceCount: 1,
    spreadRadians: 0.03,
    colorHex: 0x28f8dc,
    bossArmorFactor: 1.0,
  },
  2: {
    tier: 2,
    name: 'Tactical SMG',
    shortBadge: 'Lv2 SMG',
    pattern: 'SINGLE',
    fireRate: 5.5,
    damageMultiplier: 1.06,
    projectileSpeed: 35,
    pierceCount: 1,
    spreadRadians: 0.042,
    colorHex: 0x18dcff,
    bossArmorFactor: 1.0,
  },
  3: {
    tier: 3,
    name: 'Assault Rifle',
    shortBadge: 'Lv3 RIFLE',
    pattern: 'BURST_2',
    fireRate: 4.5,
    damageMultiplier: 1.68,
    projectileSpeed: 38,
    pierceCount: 1,
    spreadRadians: 0.038,
    colorHex: 0xff922b,
    bossArmorFactor: 1.0,
  },
  4: {
    tier: 4,
    name: 'Rotary Minigun',
    shortBadge: 'Lv4 MINIGUN',
    pattern: 'TWIN_CONVERGE',
    fireRate: 6.6,
    damageMultiplier: 1.62,
    projectileSpeed: 40,
    pierceCount: 1,
    spreadRadians: 0.038,
    colorHex: 0xff4d6d,
    bossArmorFactor: 1.0,
  },
  5: {
    tier: 5,
    name: 'Plasma Pulse Rifle',
    shortBadge: 'Lv5 PLASMA',
    pattern: 'PIERCING',
    fireRate: 5.0,
    damageMultiplier: 2.55,
    projectileSpeed: 44,
    pierceCount: 2,
    spreadRadians: 0.028,
    colorHex: 0x38f6ff,
    bossArmorFactor: 1.25,
  },
};

export const UNICORN_WEAPON_SPECS: Readonly<Record<WeaponTierId, WeaponSpec>> = {
  1: {
    ...WEAPON_SPECS[1],
    name: 'Sparkle Star Wand',
    shortBadge: 'Lv1 STAR WAND',
    colorHex: 0xff5cb8,
  },
  2: {
    ...WEAPON_SPECS[2],
    name: 'Spiral Unicorn Horn',
    shortBadge: 'Lv2 UNI-HORN',
    colorHex: 0xd966ff,
  },
  3: {
    ...WEAPON_SPECS[3],
    name: 'Pegasus Wing Wand',
    shortBadge: 'Lv3 WING WAND',
    colorHex: 0xffcf40,
  },
  4: {
    ...WEAPON_SPECS[4],
    name: 'Rainbow Prism Horn',
    shortBadge: 'Lv4 PRISM HORN',
    colorHex: 0xff3d9a,
  },
  5: {
    ...WEAPON_SPECS[5],
    name: 'Royal Alicorn Wand',
    shortBadge: 'Lv5 ALICORN',
    colorHex: 0xf74dff,
  },
};

export function getWeaponDisplaySpec(
  tier: WeaponTierId,
  skinTheme: SkinThemeId = 'TACTICAL'
): WeaponSpec {
  return skinTheme === 'UNICORN' ? UNICORN_WEAPON_SPECS[tier] : WEAPON_SPECS[tier];
}

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
 * Breaking an ordnance pod or blast barricade with a lower or equal tier weapon NEVER downgrades the player's weapon;
 * instead it keeps their higher-tier weapon and grants +25 coins and +1 elite commando.
 */
export function resolveWeaponPickup(
  currentTier: WeaponTierId,
  pickupTier: WeaponTierId,
  skinTheme: SkinThemeId = 'TACTICAL'
): WeaponPickupResolution {
  if (pickupTier > currentTier) {
    const spec = getWeaponDisplaySpec(pickupTier, skinTheme);
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
    bannerText:
      skinTheme === 'UNICORN'
        ? `WAND LOCKED: +${WEAPON_LOCK_BONUS_COINS} COINS`
        : `WEAPON LOCKED: +${WEAPON_LOCK_BONUS_COINS} COINS`,
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
 * Disciplined crowd-scale firing curve for 1..40 commandos:
 * - 1..6 front-cluster commandos fire at 1.0x efficiency
 * - 7..20 mid-cluster commandos fire at 0.78x efficiency
 * - 21..40 rear-cluster commandos fire at 0.58x efficiency
 */
export function computeEffectiveFiringSquad(logicalSquad: number): number {
  if (logicalSquad <= 0) {
    return 0;
  }
  if (logicalSquad <= 6) {
    return logicalSquad;
  }
  if (logicalSquad <= 20) {
    return 6 + (logicalSquad - 6) * 0.78;
  }
  return 6 + 14 * 0.78 + (logicalSquad - 20) * 0.58;
}

/**
 * Computes 1:1 per-commando emitter streams and projectile damage for our 1-40 elite commando crowd.
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
    spec.pattern === 'BURST_2' || spec.pattern === 'TWIN_CONVERGE' ? 2 : 1;

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
