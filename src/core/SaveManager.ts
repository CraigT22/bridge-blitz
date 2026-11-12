import type { SaveDataV1 } from './types';

export const SAVE_STORAGE_KEY = 'bridge_blitz_save_v1';

export function createDefaultSaveData(): SaveDataV1 {
  return {
    version: 1,
    coins: 0,
    unlockedStage: 1,
    selectedStage: 1,
    selectedMode: 'CAMPAIGN',
    upgrades: {
      fireRate: 0,
      bulletPower: 0,
      startingSquad: 0,
      warChest: 0,
    },
    highScoreSquad: 1,
    bestEndlessDistance: 0,
    settings: {
      muted: false,
      haptics: true,
    },
  };
}

function clampNonNegativeInt(val: unknown, fallback: number): number {
  if (typeof val !== 'number' || !Number.isFinite(val)) {
    return fallback;
  }
  return Math.max(0, Math.floor(val));
}

export function sanitizeSaveData(raw: unknown): SaveDataV1 {
  const defaults = createDefaultSaveData();
  if (!raw || typeof raw !== 'object') {
    return defaults;
  }
  const obj = raw as Record<string, unknown>;
  const rawUpgrades =
    obj.upgrades && typeof obj.upgrades === 'object'
      ? (obj.upgrades as Record<string, unknown>)
      : {};
  const rawSettings =
    obj.settings && typeof obj.settings === 'object'
      ? (obj.settings as Record<string, unknown>)
      : {};

  const unlockedStage = Math.min(10, Math.max(1, clampNonNegativeInt(obj.unlockedStage, 1)));
  const selectedStage = Math.min(
    unlockedStage,
    Math.max(1, clampNonNegativeInt(obj.selectedStage, unlockedStage))
  );

  return {
    version: 1,
    coins: clampNonNegativeInt(obj.coins, defaults.coins),
    unlockedStage,
    selectedStage,
    selectedMode: obj.selectedMode === 'ENDLESS' ? 'ENDLESS' : 'CAMPAIGN',
    upgrades: {
      fireRate: clampNonNegativeInt(rawUpgrades.fireRate, 0),
      bulletPower: clampNonNegativeInt(rawUpgrades.bulletPower, 0),
      startingSquad: clampNonNegativeInt(rawUpgrades.startingSquad, 0),
      warChest: clampNonNegativeInt(rawUpgrades.warChest, 0),
    },
    highScoreSquad: Math.max(1, clampNonNegativeInt(obj.highScoreSquad, 1)),
    bestEndlessDistance: clampNonNegativeInt(obj.bestEndlessDistance, 0),
    settings: {
      muted: typeof rawSettings.muted === 'boolean' ? rawSettings.muted : defaults.settings.muted,
      haptics:
        typeof rawSettings.haptics === 'boolean' ? rawSettings.haptics : defaults.settings.haptics,
    },
  };
}

export class SaveManager {
  private data: SaveDataV1;

  constructor() {
    this.data = this.load();
  }

  public getData(): SaveDataV1 {
    return this.data;
  }

  public load(): SaveDataV1 {
    try {
      const serialized = window.localStorage.getItem(SAVE_STORAGE_KEY);
      if (!serialized) {
        return createDefaultSaveData();
      }
      const parsed: unknown = JSON.parse(serialized);
      return sanitizeSaveData(parsed);
    } catch {
      return createDefaultSaveData();
    }
  }

  public save(nextData?: SaveDataV1): void {
    if (nextData) {
      this.data = sanitizeSaveData(nextData);
    }
    try {
      window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Ignore storage quota issues in restricted environments
    }
  }

  public update(mutator: (draft: SaveDataV1) => void): SaveDataV1 {
    const clone: SaveDataV1 = {
      ...this.data,
      upgrades: { ...this.data.upgrades },
      settings: { ...this.data.settings },
    };
    mutator(clone);
    this.save(clone);
    return this.data;
  }

  public exportJson(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public reset(): SaveDataV1 {
    const fresh = createDefaultSaveData();
    this.save(fresh);
    return this.data;
  }
}
