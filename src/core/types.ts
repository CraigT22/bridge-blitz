export type GameState = 'PRE_RUN' | 'RUNNING' | 'BOSS_FIGHT' | 'PAUSED' | 'VICTORY' | 'DEFEAT';

export type MenuTabId = 'BATTLE' | 'UPGRADES' | 'ARMORY' | 'MAP';

export type ArmorySubTabId = 'WEAPONS' | 'BOSSES';

export type BossChassisId =
  | 'WARDEN_MECH'
  | 'SIEGE_TANK'
  | 'KRAKEN_WALKER'
  | 'SOVEREIGN_TITAN';

export type GameMode = 'CAMPAIGN' | 'SPLIT_CAUSEWAY' | 'ENDLESS';

export type BoardLayout = 'STANDARD_BRIDGE' | 'SPLIT_CAUSEWAY';

export type EnemyVisualRank = 0 | 1 | 2;

export type SplitNodeReward =
  | { readonly kind: 'GATE'; readonly operator: 'ADD' | 'MUL'; readonly value: number }
  | { readonly kind: 'WEAPON'; readonly weaponTier: WeaponTierId }
  | { readonly kind: 'COINS'; readonly coins: number };

export interface SplitBarrelNodeDefinition {
  readonly barrelHp: number;
  readonly reward: SplitNodeReward;
}

export interface SplitHordeEchelonDefinition {
  readonly startZ: number;
  readonly rows: number;
  readonly cols: number;
  readonly rank: EnemyVisualRank;
  readonly hpPerUnit: number;
  readonly speed: number;
  readonly coinPerKill: number;
}

export interface SplitCausewayDefinition {
  readonly siegeColumnSpan: number;
  readonly marchSpeed: number;
  readonly dividerStartZ: number;
  readonly dividerLength: number;
  readonly leftQueue: ReadonlyArray<SplitBarrelNodeDefinition>;
  readonly rightEchelons: ReadonlyArray<SplitHordeEchelonDefinition>;
  readonly goliathSpawns: ReadonlyArray<MidBridgeBruteDefinition>;
}

export type WeaponTierId = 1 | 2 | 3 | 4 | 5;

export type ProjectilePattern = 'SINGLE' | 'BURST_2' | 'TWIN_CONVERGE' | 'PIERCING';

export interface WeaponSpec {
  readonly tier: WeaponTierId;
  readonly name: string;
  readonly shortBadge: string;
  readonly pattern: ProjectilePattern;
  readonly fireRate: number;
  readonly damageMultiplier: number;
  readonly projectileSpeed: number;
  readonly pierceCount: number;
  readonly spreadRadians: number;
  readonly colorHex: number;
  readonly bossArmorFactor: number;
}

export type GateOperator = 'ADD' | 'MUL' | 'DIV';

export type LaneSide = 'LEFT' | 'RIGHT';

export type ObstacleLane = 'LEFT' | 'CENTER' | 'RIGHT' | 'LEFT_MID' | 'RIGHT_MID';

export type DrumRewardType = 'COINS' | 'WEAPON' | 'RECRUIT';

export interface GateDefinition {
  readonly operator: GateOperator;
  readonly initialValue: number;
  readonly damagePerIncrement: number;
  readonly isLocked: boolean;
}

export interface GatePairDefinition {
  readonly z: number;
  readonly left: GateDefinition | null;
  readonly right: GateDefinition | null;
  /** Optional full-bridge shootable gate (e.g. X1.0 -> X1.7 fractional multiplier across roadway) */
  readonly full?: GateDefinition | null;
}

export interface SupplyDrumDefinition {
  readonly z: number;
  readonly lane: ObstacleLane;
  readonly hp: number;
  readonly rewardType: DrumRewardType;
  /** Coin payout, WeaponTierId (2..5), or recruit soldier count */
  readonly rewardValue: number;
}

export interface TireStackDefinition {
  readonly z: number;
  readonly lane: 'LEFT' | 'CENTER' | 'RIGHT';
  readonly breakCount: number;
  readonly weaponTier?: WeaponTierId;
  readonly coinReward?: number;
}

export interface EnemyWaveDefinition {
  readonly z: number;
  readonly lane: LaneSide | 'CENTER';
  readonly count: number;
  readonly hpPerEnemy: number;
  readonly speed: number;
  readonly heavyCount?: number;
  readonly vanguardRatio?: number;
  readonly coinPerKill?: number;
}

export interface BossDefinition {
  readonly name: string;
  readonly chassis: BossChassisId;
  readonly primaryHex: number;
  readonly accentHex: number;
  readonly trimHex: number;
  readonly maxHp: number;
  readonly segments: number;
  readonly advanceSpeed: number;
  readonly salvoLanes: 1 | 2;
  readonly salvoInterval: number;
  readonly salvoDamage: number;
  readonly rewardCoins: number;
}

export interface MidBridgeBruteDefinition {
  readonly z: number;
  readonly name: string;
  readonly maxHp: number;
  readonly speed: number;
  readonly clubDamage: number;
  readonly coinReward: number;
}

export interface StageDefinition {
  readonly stageNumber: number;
  readonly title: string;
  readonly boardLayout?: BoardLayout;
  readonly trackLength: number;
  readonly supplyDrums: SupplyDrumDefinition[];
  readonly gatePairs: GatePairDefinition[];
  readonly tireStacks: TireStackDefinition[];
  readonly enemyWaves: EnemyWaveDefinition[];
  readonly midBrute?: MidBridgeBruteDefinition;
  readonly midBrutes?: ReadonlyArray<MidBridgeBruteDefinition>;
  readonly splitCauseway?: SplitCausewayDefinition;
  readonly boss: BossDefinition;
}

export type UpgradeKey = 'fireRate' | 'bulletPower' | 'startingSquad' | 'warChest';

export interface UpgradeLevels {
  fireRate: number;
  bulletPower: number;
  startingSquad: number;
  warChest: number;
}

export interface GameSettings {
  muted: boolean;
  haptics: boolean;
}

export interface SaveDataV1 {
  version: 1;
  coins: number;
  unlockedStage: number;
  selectedStage: number;
  selectedMode: GameMode;
  splitCausewayStage: number;
  bestSplitStage: number;
  upgrades: UpgradeLevels;
  highScoreSquad: number;
  bestEndlessDistance: number;
  settings: GameSettings;
}

export interface RunSummary {
  outcome: 'VICTORY' | 'DEFEAT';
  mode: GameMode;
  stageNumber: number;
  distanceMeters: number;
  progressRatio: number;
  enemiesDefeated: number;
  drumsBroken: number;
  gatesFlipped: number;
  peakSquad: number;
  liveCoinsEarned: number;
  distanceCoins: number;
  killCoins: number;
  bonusCoins: number;
  warChestMultiplier: number;
  totalCoinsEarned: number;
}

export interface TelemetrySnapshot {
  state: GameState;
  mode: GameMode;
  boardLayout: BoardLayout;
  stage: number;
  coins: number;
  liveCoinsThisRun: number;
  logicalSquad: number;
  visualSquad: number;
  squadX: number;
  squadZ: number;
  progress: number;
  weaponTier: WeaponTierId;
  weaponBadge: string;
  bruteHp: number;
  bruteMaxHp: number;
  marchHaltedByBrute: boolean;
  bossHp: number;
  bossMaxHp: number;
  splitQueueRemaining: number;
  splitRightAlive: number;
  drumsBrokenThisRun: number;
  gatesFlippedThisRun: number;
  tiresBrokenThisRun: number;
  weaponLocksTriggeredThisRun: number;
  enemiesDefeatedThisRun: number;
  bossSalvosDodgedThisRun: number;
  activeBullets: number;
  activeParticles: number;
  upgrades: UpgradeLevels;
}
