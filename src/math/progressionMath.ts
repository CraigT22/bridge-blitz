import type { DifficultyTier, UpgradeKey, UpgradeLevels } from '../core/types';

export interface DifficultyProfile {
  readonly id: DifficultyTier;
  readonly label: string;
  readonly shortBadge: string;
  readonly coinMultiplier: number;
  readonly enemyHpMult: number;
  readonly enemySpeedMult: number;
  readonly waveCountMult: number;
  readonly drumHpMult: number;
  readonly gateCostMult: number;
  readonly bossHpMult: number;
  readonly bossTempoMult: number;
  readonly threatCadenceMult: number;
  readonly enemyBoltDamage: number;
  readonly chargerDamageBonus: number;
}

export const DIFFICULTY_ORDER: ReadonlyArray<DifficultyTier> = [
  'NORMAL',
  'HARD',
  'NIGHTMARE',
];

export const DIFFICULTY_PROFILES: Readonly<Record<DifficultyTier, DifficultyProfile>> = {
  NORMAL: {
    id: 'NORMAL',
    label: 'Normal',
    shortBadge: 'NORMAL 1×',
    coinMultiplier: 1.0,
    enemyHpMult: 1.0,
    enemySpeedMult: 1.0,
    waveCountMult: 1.0,
    drumHpMult: 1.0,
    gateCostMult: 1.0,
    bossHpMult: 1.0,
    bossTempoMult: 1.0,
    threatCadenceMult: 1.0,
    enemyBoltDamage: 2,
    chargerDamageBonus: 2,
  },
  HARD: {
    id: 'HARD',
    label: 'Hard',
    shortBadge: 'HARD 1.5×',
    coinMultiplier: 1.5,
    enemyHpMult: 1.65,
    enemySpeedMult: 1.18,
    waveCountMult: 1.20,
    drumHpMult: 1.48,
    gateCostMult: 1.36,
    bossHpMult: 1.65,
    bossTempoMult: 1.24,
    threatCadenceMult: 1.45,
    enemyBoltDamage: 3,
    chargerDamageBonus: 3,
  },
  NIGHTMARE: {
    id: 'NIGHTMARE',
    label: 'Nightmare',
    shortBadge: 'NIGHTMARE 2.25×',
    coinMultiplier: 2.25,
    enemyHpMult: 2.45,
    enemySpeedMult: 1.32,
    waveCountMult: 1.35,
    drumHpMult: 1.98,
    gateCostMult: 1.72,
    bossHpMult: 2.35,
    bossTempoMult: 1.42,
    threatCadenceMult: 1.85,
    enemyBoltDamage: 4,
    chargerDamageBonus: 4,
  },
};

export function getDifficultyProfile(tier: DifficultyTier = 'NORMAL'): DifficultyProfile {
  return DIFFICULTY_PROFILES[tier] ?? DIFFICULTY_PROFILES.NORMAL;
}

export interface UpgradeSpec {
  readonly key: UpgradeKey;
  readonly title: string;
  readonly shortcutKey: '1' | '2' | '3' | '4';
  readonly baseCost: number;
  readonly costGrowth: number;
  readonly maxLevel: number;
  readonly description: string;
}

export const UPGRADE_COST_GROWTH = 1.42;
export const MAX_STARTING_SQUAD_LEVEL = 8;

export const UPGRADE_SPECS: Readonly<Record<UpgradeKey, UpgradeSpec>> = {
  fireRate: {
    key: 'fireRate',
    title: 'Fire Rate',
    shortcutKey: '1',
    baseCost: 40,
    costGrowth: 1.42,
    maxLevel: 999,
    description: 'Faster volley cadence',
  },
  bulletPower: {
    key: 'bulletPower',
    title: 'Ordnance',
    shortcutKey: '2',
    baseCost: 45,
    costGrowth: 1.44,
    maxLevel: 999,
    description: 'Higher shot damage',
  },
  warChest: {
    key: 'warChest',
    title: 'Bounty',
    shortcutKey: '3',
    baseCost: 45,
    costGrowth: 1.40,
    maxLevel: 999,
    description: 'Higher coin bounty',
  },
  startingSquad: {
    key: 'startingSquad',
    title: 'Vanguard',
    shortcutKey: '4',
    baseCost: 110,
    costGrowth: 1.72,
    maxLevel: MAX_STARTING_SQUAD_LEVEL,
    description: '+1 starting commando',
  },
};

export const UPGRADE_ORDER: ReadonlyArray<UpgradeKey> = [
  'fireRate',
  'bulletPower',
  'warChest',
  'startingSquad',
];

/**
 * Exact exponential upgrade cost curve per stat.
 */
export function computeUpgradeCost(key: UpgradeKey, currentLevel: number): number {
  const spec = UPGRADE_SPECS[key];
  const safeLevel = Math.max(0, Math.floor(currentLevel));
  return Math.round(spec.baseCost * Math.pow(spec.costGrowth, safeLevel));
}

/**
 * v8.2 Smooth Diminishing-Returns Fire Rate Multiplier:
 * Punchy early upgrades (+5%/lv) tapering smoothly toward a disciplined ceiling so late-level saves stay exciting.
 */
export function getFireRateMultiplier(level: number): number {
  const l = Math.max(0, level);
  return 1 + (0.055 * l) / (1 + 0.045 * l);
}

/**
 * v8.2 Smooth Diminishing-Returns Ordnance Multiplier:
 * Meaningful per-level punch (+8%/lv early) without runaway 10x steamrolling at high levels.
 */
export function getBulletPowerMultiplier(level: number): number {
  const l = Math.max(0, level);
  return 1 + (0.085 * l) / (1 + 0.038 * l);
}

export function getStartingSquadCount(level: number): number {
  return 1 + Math.min(MAX_STARTING_SQUAD_LEVEL, Math.max(0, Math.floor(level)));
}

export function getWarChestMultiplier(level: number): number {
  const l = Math.max(0, level);
  return 1 + (0.10 * l) / (1 + 0.025 * l);
}

export function formatUpgradeStatPreview(key: UpgradeKey, level: number): {
  currentLabel: string;
  nextLabel: string;
} {
  switch (key) {
    case 'fireRate':
      return {
        currentLabel: `+${Math.round((getFireRateMultiplier(level) - 1) * 100)}%`,
        nextLabel: `+${Math.round((getFireRateMultiplier(level + 1) - 1) * 100)}%`,
      };
    case 'bulletPower':
      return {
        currentLabel: `+${Math.round((getBulletPowerMultiplier(level) - 1) * 100)}%`,
        nextLabel: `+${Math.round((getBulletPowerMultiplier(level + 1) - 1) * 100)}%`,
      };
    case 'startingSquad': {
      const cur = getStartingSquadCount(level);
      const nxt = getStartingSquadCount(level + 1);
      return {
        currentLabel: `${cur}`,
        nextLabel: level >= MAX_STARTING_SQUAD_LEVEL ? 'MAX' : `${nxt}`,
      };
    }
    case 'warChest':
      return {
        currentLabel: `x${getWarChestMultiplier(level).toFixed(2)}`,
        nextLabel: `x${getWarChestMultiplier(level + 1).toFixed(2)}`,
      };
  }
}

export interface RunPayoutInput {
  readonly progressRatio: number;
  readonly stageNumber: number;
  readonly enemiesDefeated: number;
  readonly bonusCoinsCollected: number;
  readonly bossRewardCoins: number;
  readonly clearedStage: boolean;
  readonly warChestLevel: number;
  readonly difficultyMultiplier?: number;
}

export interface RunPayoutBreakdown {
  readonly distanceCoins: number;
  readonly killCoins: number;
  readonly bonusCoins: number;
  readonly warChestMultiplier: number;
  readonly difficultyMultiplier: number;
  readonly totalCoinsEarned: number;
}

/**
 * Computes end-of-run completion & distance bonus coins on top of live coins earned mid-bridge.
 */
export function computeRunCoinPayout(input: RunPayoutInput): RunPayoutBreakdown {
  const clampedProgress = Math.max(0, input.progressRatio);
  const baseDistanceRate = 18 + input.stageNumber * 8;
  const distanceCoins = Math.max(5, Math.round(clampedProgress * baseDistanceRate));
  const killCoins = Math.round(input.enemiesDefeated * (1.2 + input.stageNumber * 0.35));
  const stageClearPart = input.clearedStage ? input.bossRewardCoins : 0;
  const bonusCoins = Math.round(input.bonusCoinsCollected + stageClearPart);
  const warChestMultiplier = getWarChestMultiplier(input.warChestLevel);
  const difficultyMultiplier = Math.max(1.0, input.difficultyMultiplier ?? 1.0);

  const subtotal = distanceCoins + killCoins + bonusCoins;
  const totalCoinsEarned = Math.round(subtotal * warChestMultiplier * difficultyMultiplier);

  return {
    distanceCoins,
    killCoins,
    bonusCoins,
    warChestMultiplier,
    difficultyMultiplier,
    totalCoinsEarned,
  };
}

export function attemptPurchaseUpgrade(
  coins: number,
  upgrades: UpgradeLevels,
  key: UpgradeKey
): { purchased: boolean; remainingCoins: number; nextUpgrades: UpgradeLevels; cost: number } {
  const spec = UPGRADE_SPECS[key];
  const currentLevel = upgrades[key];
  const cost = computeUpgradeCost(key, currentLevel);
  if (currentLevel >= spec.maxLevel || coins < cost) {
    return {
      purchased: false,
      remainingCoins: coins,
      nextUpgrades: upgrades,
      cost,
    };
  }

  return {
    purchased: true,
    remainingCoins: coins - cost,
    nextUpgrades: {
      ...upgrades,
      [key]: currentLevel + 1,
    },
    cost,
  };
}

/**
 * Formats large coin wallets, upgrade costs, and rewards cleanly with K / M / B suffixes
 * while keeping sub-1,000 values crisp integers (e.g. 292, 1.27K, 25.3K, 1.45M).
 */
export function formatCoinAmount(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(Math.round(amount));
  if (abs < 1000) {
    return `${sign}${abs}`;
  }
  if (abs < 1_000_000) {
    const k = abs / 1000;
    const digits = k >= 100 ? 0 : k >= 10 ? 1 : 2;
    return `${sign}${k.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')}K`;
  }
  if (abs < 1_000_000_000) {
    const m = abs / 1_000_000;
    const digits = m >= 100 ? 0 : m >= 10 ? 1 : 2;
    return `${sign}${m.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')}M`;
  }
  const b = abs / 1_000_000_000;
  const digits = b >= 100 ? 0 : b >= 10 ? 1 : 2;
  return `${sign}${b.toFixed(digits).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1')}B`;
}

/**
 * Formats obstacle & Brute HP: raw integers up to 9,999 (e.g. 90, 1900, 7300, 8508)
 * and K/M suffixes at 10,000+ so 4-digit tire & Brute HP plaques read just like classic arcade counters!
 */
export function formatObstacleHp(hp: number): string {
  const val = Math.max(0, Math.ceil(hp));
  if (val < 10_000) {
    return `${val}`;
  }
  return formatCoinAmount(val);
}

