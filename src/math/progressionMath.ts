import type { UpgradeKey, UpgradeLevels } from '../core/types';

export interface UpgradeSpec {
  readonly key: UpgradeKey;
  readonly title: string;
  readonly shortcutKey: '1' | '2' | '3' | '4';
  readonly baseCost: number;
  readonly costGrowth: number;
  readonly maxLevel: number;
  readonly description: string;
}

export const UPGRADE_COST_GROWTH = 1.28;
export const MAX_STARTING_SQUAD_LEVEL = 12;

export const UPGRADE_SPECS: Readonly<Record<UpgradeKey, UpgradeSpec>> = {
  fireRate: {
    key: 'fireRate',
    title: 'Fire Rate',
    shortcutKey: '1',
    baseCost: 22,
    costGrowth: 1.28,
    maxLevel: 999,
    description: '+10% volley speed',
  },
  bulletPower: {
    key: 'bulletPower',
    title: 'Damage',
    shortcutKey: '2',
    baseCost: 25,
    costGrowth: 1.28,
    maxLevel: 999,
    description: '+18% bullet damage',
  },
  warChest: {
    key: 'warChest',
    title: 'Revenue',
    shortcutKey: '3',
    baseCost: 25,
    costGrowth: 1.28,
    maxLevel: 999,
    description: '+15% coin bounty',
  },
  startingSquad: {
    key: 'startingSquad',
    title: 'Add Soldier',
    shortcutKey: '4',
    baseCost: 65,
    costGrowth: 1.55,
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

export function getFireRateMultiplier(level: number): number {
  return 1 + 0.10 * Math.max(0, level);
}

export function getBulletPowerMultiplier(level: number): number {
  return 1 + 0.18 * Math.max(0, level);
}

export function getStartingSquadCount(level: number): number {
  return 1 + Math.min(MAX_STARTING_SQUAD_LEVEL, Math.max(0, Math.floor(level)));
}

export function getWarChestMultiplier(level: number): number {
  return 1 + 0.15 * Math.max(0, level);
}

export function formatUpgradeStatPreview(key: UpgradeKey, level: number): {
  currentLabel: string;
  nextLabel: string;
} {
  switch (key) {
    case 'fireRate':
      return {
        currentLabel: `+${Math.round(level * 10)}%`,
        nextLabel: `+${Math.round((level + 1) * 10)}%`,
      };
    case 'bulletPower':
      return {
        currentLabel: `+${Math.round(level * 18)}%`,
        nextLabel: `+${Math.round((level + 1) * 18)}%`,
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
}

export interface RunPayoutBreakdown {
  readonly distanceCoins: number;
  readonly killCoins: number;
  readonly bonusCoins: number;
  readonly warChestMultiplier: number;
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

  const subtotal = distanceCoins + killCoins + bonusCoins;
  const totalCoinsEarned = Math.round(subtotal * warChestMultiplier);

  return {
    distanceCoins,
    killCoins,
    bonusCoins,
    warChestMultiplier,
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

