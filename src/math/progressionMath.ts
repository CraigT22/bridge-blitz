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
export const MAX_STARTING_SQUAD_LEVEL = 5;

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
