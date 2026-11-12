import type { UpgradeKey, UpgradeLevels } from '../core/types';

export interface UpgradeSpec {
  readonly key: UpgradeKey;
  readonly title: string;
  readonly shortcutKey: '1' | '2' | '3' | '4';
  readonly baseCost: number;
  readonly description: string;
}

export const UPGRADE_COST_GROWTH = 1.28;

export const UPGRADE_SPECS: Readonly<Record<UpgradeKey, UpgradeSpec>> = {
  fireRate: {
    key: 'fireRate',
    title: 'Fire Rate',
    shortcutKey: '1',
    baseCost: 25,
    description: '+8% volley speed',
  },
  bulletPower: {
    key: 'bulletPower',
    title: 'Bullet Power',
    shortcutKey: '2',
    baseCost: 30,
    description: '+15% bullet damage',
  },
  startingSquad: {
    key: 'startingSquad',
    title: 'Starting Squad',
    shortcutKey: '3',
    baseCost: 35,
    description: '+1 starting soldier',
  },
  warChest: {
    key: 'warChest',
    title: 'War Chest',
    shortcutKey: '4',
    baseCost: 25,
    description: '+12% coin payout',
  },
};

export const UPGRADE_ORDER: ReadonlyArray<UpgradeKey> = [
  'fireRate',
  'bulletPower',
  'startingSquad',
  'warChest',
];

/**
 * Exact cost curve: cost = round(baseCost * 1.28^level)
 */
export function computeUpgradeCost(key: UpgradeKey, currentLevel: number): number {
  const baseCost = UPGRADE_SPECS[key].baseCost;
  const safeLevel = Math.max(0, Math.floor(currentLevel));
  return Math.round(baseCost * Math.pow(UPGRADE_COST_GROWTH, safeLevel));
}

export function getFireRateMultiplier(level: number): number {
  return 1 + 0.08 * Math.max(0, level);
}

export function getBulletPowerMultiplier(level: number): number {
  return 1 + 0.15 * Math.max(0, level);
}

export function getStartingSquadCount(level: number): number {
  return 1 + Math.max(0, Math.floor(level));
}

export function getWarChestMultiplier(level: number): number {
  return 1 + 0.12 * Math.max(0, level);
}

export function formatUpgradeStatPreview(key: UpgradeKey, level: number): {
  currentLabel: string;
  nextLabel: string;
} {
  switch (key) {
    case 'fireRate':
      return {
        currentLabel: `+${Math.round(level * 8)}%`,
        nextLabel: `+${Math.round((level + 1) * 8)}%`,
      };
    case 'bulletPower':
      return {
        currentLabel: `+${Math.round(level * 15)}%`,
        nextLabel: `+${Math.round((level + 1) * 15)}%`,
      };
    case 'startingSquad':
      return {
        currentLabel: `${getStartingSquadCount(level)}`,
        nextLabel: `${getStartingSquadCount(level + 1)}`,
      };
    case 'warChest':
      return {
        currentLabel: `+${Math.round(level * 12)}%`,
        nextLabel: `+${Math.round((level + 1) * 12)}%`,
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
 * Computes fair skill-first coin rewards for both victories and partial wipeout runs (zero wasted runs).
 */
export function computeRunCoinPayout(input: RunPayoutInput): RunPayoutBreakdown {
  const clampedProgress = Math.max(0, input.progressRatio);
  const baseDistanceRate = 24 + input.stageNumber * 6;
  const distanceCoins = Math.max(4, Math.round(clampedProgress * baseDistanceRate));
  const killCoins = Math.round(input.enemiesDefeated * (1.5 + input.stageNumber * 0.25));
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
  const currentLevel = upgrades[key];
  const cost = computeUpgradeCost(key, currentLevel);
  if (coins < cost) {
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
