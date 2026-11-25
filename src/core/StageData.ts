import type {
  BoardLayout,
  BossChassisId,
  BossDefinition,
  DifficultyTier,
  EnemyVisualRank,
  EnemyWaveDefinition,
  GateDefinition,
  GatePairDefinition,
  MidBridgeBruteDefinition,
  SplitBarrelNodeDefinition,
  SplitCausewayDefinition,
  SplitHordeEchelonDefinition,
  SplitNodeReward,
  StageDefinition,
  SupplyDrumDefinition,
  TireStackDefinition,
  WeaponTierId,
} from './types';
import { getDifficultyProfile } from '../math/progressionMath';

/** Global difficulty baseline multiplier preserved & escalated in v8.2 Skill+Progression Overhaul. */
export const DIFFICULTY_MULTIPLIER_V6 = 1.5;
/** Global marathon viaduct span multiplier (400% full-length tactical viaducts). */
export const BOARD_LENGTH_MULTIPLIER_V6 = 4.0;

function addGate(initialValue: number, damagePerIncrement: number): GateDefinition {
  return {
    operator: 'ADD',
    initialValue,
    damagePerIncrement: Math.max(5, Math.round(damagePerIncrement)),
    isLocked: false,
  };
}

function lockedPenaltyAddGate(penaltyValue: number): GateDefinition {
  return {
    operator: 'ADD',
    initialValue: -Math.max(4, Math.abs(Math.round(penaltyValue))),
    damagePerIncrement: 9999,
    isLocked: true,
  };
}

function lockedDivGate(divisor = 2): GateDefinition {
  return {
    operator: 'DIV',
    initialValue: Math.max(2, Math.round(divisor)),
    damagePerIncrement: 9999,
    isLocked: true,
  };
}

function shootMulGate(initialValue: number, damagePerIncrement: number): GateDefinition {
  return {
    operator: 'MUL',
    initialValue,
    damagePerIncrement: Math.max(8, Math.round(damagePerIncrement)),
    isLocked: false,
  };
}

function drumV3(
  zCenter: number,
  leftHp: number,
  centerHp: number,
  rightHp: number,
  leftReward: { type: 'COINS' | 'WEAPON' | 'RECRUIT'; val: number; isHazard?: boolean },
  centerReward: { type: 'COINS' | 'WEAPON' | 'RECRUIT'; val: number; isHazard?: boolean },
  rightReward: { type: 'COINS' | 'WEAPON' | 'RECRUIT'; val: number; isHazard?: boolean },
  rollSpeed = 3.4
): SupplyDrumDefinition[] {
  return [
    {
      z: zCenter,
      lane: 'CENTER',
      hp: Math.max(12, Math.round(centerHp)),
      rewardType: centerReward.type,
      rewardValue: centerReward.val,
      rollSpeed,
      isHazard: Boolean(centerReward.isHazard),
    },
    {
      z: zCenter - 2.6,
      lane: 'LEFT',
      hp: Math.max(12, Math.round(leftHp)),
      rewardType: leftReward.type,
      rewardValue: leftReward.val,
      rollSpeed: Number((rollSpeed + 0.16).toFixed(2)),
      isHazard: Boolean(leftReward.isHazard),
    },
    {
      z: zCenter - 2.6,
      lane: 'RIGHT',
      hp: Math.max(12, Math.round(rightHp)),
      rewardType: rightReward.type,
      rewardValue: rightReward.val,
      rollSpeed: Number((rollSpeed + 0.16).toFixed(2)),
      isHazard: Boolean(rightReward.isHazard),
    },
  ];
}

function rollingShieldPair(
  zLead: number,
  laneA: 'LEFT' | 'CENTER' | 'RIGHT',
  laneB: 'LEFT' | 'CENTER' | 'RIGHT',
  hpA: number,
  hpB: number,
  rewardA: { type: 'COINS' | 'WEAPON' | 'RECRUIT'; val: number; isHazard?: boolean },
  rewardB: { type: 'COINS' | 'WEAPON' | 'RECRUIT'; val: number; isHazard?: boolean },
  rollSpeed = 3.9
): SupplyDrumDefinition[] {
  return [
    {
      z: zLead,
      lane: laneA,
      hp: Math.max(24, Math.round(hpA)),
      rewardType: rewardA.type,
      rewardValue: rewardA.val,
      rollSpeed,
      isHazard: Boolean(rewardA.isHazard),
    },
    {
      z: zLead - 2.2,
      lane: laneB,
      hp: Math.max(24, Math.round(hpB)),
      rewardType: rewardB.type,
      rewardValue: rewardB.val,
      rollSpeed: Number((rollSpeed + 0.24).toFixed(2)),
      isHazard: Boolean(rewardB.isHazard),
    },
  ];
}

function tireWall3(
  z: number,
  leftHp: number,
  centerHp: number,
  rightHp: number,
  weaponLane: 'LEFT' | 'CENTER' | 'RIGHT',
  weaponTier: WeaponTierId,
  sideCoins: number
): TireStackDefinition[] {
  return [
    {
      z,
      lane: 'LEFT',
      breakCount: Math.max(115, Math.round(leftHp)),
      weaponTier: weaponLane === 'LEFT' ? weaponTier : undefined,
      coinReward: weaponLane === 'LEFT' ? undefined : sideCoins,
    },
    {
      z,
      lane: 'CENTER',
      breakCount: Math.max(115, Math.round(centerHp)),
      weaponTier: weaponLane === 'CENTER' ? weaponTier : undefined,
      coinReward: weaponLane === 'CENTER' ? undefined : sideCoins,
    },
    {
      z,
      lane: 'RIGHT',
      breakCount: Math.max(115, Math.round(rightHp)),
      weaponTier: weaponLane === 'RIGHT' ? weaponTier : undefined,
      coinReward: weaponLane === 'RIGHT' ? undefined : sideCoins,
    },
  ];
}

interface MarathonSectorSeed {
  readonly stageNumber: number;
  readonly title: string;
  readonly boardLayout: BoardLayout;
  readonly baseSpan: number;
  readonly hpScale: number;
  readonly gateK: number;
  readonly negGateBase: number;
  readonly posGateBase: number;
  readonly enemyBaseHp: number;
  readonly enemyBaseSpeed: number;
  readonly coinBase: number;
  readonly bruteName: string;
  readonly bruteMaxHp: number;
  readonly bruteSpeed: number;
  readonly bruteDamage: number;
  readonly bruteCoins: number;
  readonly boss: BossDefinition;
}

/**
 * Builds a 28-node Left-Lane `[Hex Ordnance Pod + Holo-Gate / Weapon]` conveyor queue and 26-echelon
 * Right-Lane Syndicate siege battalion + `3` Breacher Siege Goliaths for Split Causeway boards.
 *
 * v8.2 Full Difficulty Parity:
 * - Tougher Left-Column ordnance pods (damage strictly persistent — zero passive decay!)
 * - Faster Right-Column battalions with active Ranged Shooters & Armored Lane Chargers!
 */
function buildSplitCausewayDefinition(
  stageIdx: number,
  hpScale: number,
  enemyBaseHp: number,
  enemyBaseSpeed: number,
  coinBase: number,
  bruteName: string,
  bruteMaxHp: number,
  bruteSpeed: number,
  bruteDamage: number,
  bruteCoins: number
): SplitCausewayDefinition {
  const d = DIFFICULTY_MULTIPLIER_V6;
  const siegeColumnSpan = Math.round((352 + (stageIdx - 1) * 9) * 1.30);
  const baseMarchSpeed = Math.min(6.45, Math.max(5.55, enemyBaseSpeed * 1.92 + stageIdx * 0.09));
  const marchSpeed = baseMarchSpeed * 1.30;

  // Earned incremental tactical progression across all 28 Left-Lane Ordnance Nodes
  const rewardPattern: ReadonlyArray<SplitNodeReward> = [
    { kind: 'GATE', operator: 'ADD', value: 2 },
    { kind: 'GATE', operator: 'ADD', value: 2 },
    { kind: 'WEAPON', weaponTier: 2 },
    { kind: 'GATE', operator: 'MUL', value: 1.4 },
    { kind: 'GATE', operator: 'ADD', value: 2 },
    { kind: 'WEAPON', weaponTier: 3 },
    { kind: 'COINS', coins: Math.round(80 * hpScale) },
    { kind: 'GATE', operator: 'ADD', value: 3 },
    { kind: 'GATE', operator: 'MUL', value: 1.4 },
    { kind: 'GATE', operator: 'ADD', value: 3 },
    { kind: 'WEAPON', weaponTier: 4 },
    { kind: 'COINS', coins: Math.round(135 * hpScale) },
    { kind: 'GATE', operator: 'ADD', value: 3 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'GATE', operator: 'ADD', value: 4 },
    { kind: 'WEAPON', weaponTier: 5 },
    { kind: 'COINS', coins: Math.round(195 * hpScale) },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'GATE', operator: 'ADD', value: 4 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'COINS', coins: Math.round(260 * hpScale) },
    { kind: 'GATE', operator: 'ADD', value: 5 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'GATE', operator: 'ADD', value: 5 },
    { kind: 'COINS', coins: Math.round(330 * hpScale) },
    { kind: 'GATE', operator: 'MUL', value: 2 },
    { kind: 'GATE', operator: 'ADD', value: 6 },
    { kind: 'GATE', operator: 'MUL', value: 2 },
  ];

  // Calibrated to v8.2 weapon DPS curve so every node demands sharp left/right straddling & timing!
  const baseQueueHps = [
    18, 34, 62, 108, 175, 265, 380, 535, 740, 1010, 1360, 1820, 2400, 3150,
    4080, 5250, 6700, 8450, 10600, 13200, 16300, 20000, 24400, 29600, 35800, 43200, 52000, 62500,
  ];

  const powerUpEarnFactor = 1.65;
  const leftQueue: SplitBarrelNodeDefinition[] = [];
  for (let i = 0; i < rewardPattern.length; i++) {
    const stageFactor = i === 0 ? Math.pow(hpScale, 0.62) : Math.pow(hpScale, 0.88);
    const barrelHp = Math.max(
      42,
      Math.round(baseQueueHps[i] * d * stageFactor * powerUpEarnFactor)
    );
    leftQueue.push({
      barrelHp,
      reward: rewardPattern[i],
    });
  }

  // 26 larger, faster Right-Lane Echelons surging down the wider right column with Shooters & Chargers
  const rightEchelons: SplitHordeEchelonDefinition[] = [];
  let cursorZ = 21.5;
  const totalEchelons = 26;
  for (let e = 0; e < totalEchelons; e++) {
    const progress = e / (totalEchelons - 1);
    let rank: EnemyVisualRank = 1;
    if (e === 0 || (e >= 3 && e % 4 === 3)) {
      rank = 0; // Fast Horned Volt-Trim Vanguard Raiders
    } else if (e === 2 || (e >= 6 && e % 4 === 2) || e >= 23) {
      rank = 2; // Towering 1.65x Horned Ironclad Enforcers (Armored Chargers!)
    }

    const cols = rank === 2 ? 5 : e === 0 ? 5 : e <= 5 ? 6 : 7;
    const rows = rank === 2 ? 3 : 4;
    const echelonGrowth = 1 + Math.pow(progress, 1.42) * 1.85;
    const rankHpMul =
      rank === 2 ? 1.85 : rank === 0 ? (e === 0 ? 0.62 : 0.82) : 1.0;
    const hpPerUnit = Math.max(
      9,
      Math.round(enemyBaseHp * d * 0.78 * echelonGrowth * rankHpMul)
    );
    const unitSpeed =
      rank === 2 ? marchSpeed * 0.96 : rank === 0 ? marchSpeed * 1.10 : marchSpeed;
    const coinPerKill =
      rank === 2
        ? Math.round((coinBase + 2) * 3.0)
        : Math.max(3, coinBase + Math.floor(progress * 4));

    rightEchelons.push({
      startZ: Number(cursorZ.toFixed(1)),
      rows,
      cols,
      rank,
      hpPerUnit,
      speed: Number(unitSpeed.toFixed(2)),
      coinPerKill,
      shooterRatio: rank === 2 ? 0 : 0.22,
      chargerRatio: rank === 2 ? 0.55 : 0,
    });

    const depthSpan = rows * (rank === 2 ? 1.42 : 1.04);
    const gapZ = e === 0 ? 9.4 : 12.6 + (stageIdx - 1) * 0.24;
    cursorZ += depthSpan + gapZ;
  }

  const fastBruteSpeed = Math.min(4.65, Math.max(3.85, bruteSpeed * 1.72)) * 1.30;
  const goliathSpawns: MidBridgeBruteDefinition[] = [
    {
      z: -Math.round(siegeColumnSpan * 0.34),
      name: `${bruteName} Alpha`,
      maxHp: Math.round(bruteMaxHp * 0.24),
      speed: Number(fastBruteSpeed.toFixed(2)),
      clubDamage: Math.max(8, bruteDamage),
      coinReward: Math.round(bruteCoins * 0.8),
    },
    {
      z: -Math.round(siegeColumnSpan * 0.64),
      name: bruteName,
      maxHp: Math.round(bruteMaxHp * 0.42),
      speed: Number(Math.min(6.15, fastBruteSpeed + 0.22).toFixed(2)),
      clubDamage: bruteDamage + 1,
      coinReward: bruteCoins,
    },
    {
      z: -Math.round(siegeColumnSpan * 0.88),
      name: `${bruteName} Prime`,
      maxHp: Math.round(bruteMaxHp * 0.58),
      speed: Number(Math.min(6.35, fastBruteSpeed + 0.40).toFixed(2)),
      clubDamage: bruteDamage + 3,
      coinReward: Math.round(bruteCoins * 1.25),
    },
  ];

  return {
    siegeColumnSpan,
    marchSpeed: Number(marchSpeed.toFixed(2)),
    dividerStartZ: 7.4,
    dividerLength: 108,
    leftQueue,
    rightEchelons,
    goliathSpawns,
  };
}

/**
 * Builds a 400%-length (`1,120m..1,368m`) 4-Act Midnight Storm Viaduct Sector
 * with v8.2 Dilemma & Trap Gates, 2-Lane Spiked Barrel Gauntlets, Ranged Shooters & Armored Chargers,
 * while strictly preserving v7.4 `>= 42m` gate-to-wave clearance!
 */
function buildMarathonSector(seed: MarathonSectorSeed): StageDefinition {
  const d = DIFFICULTY_MULTIPLIER_V6;
  const actSpan = Math.max(380, Math.round(seed.baseSpan * 1.36));
  const trackLength = Math.round(actSpan * BOARD_LENGTH_MULTIPLIER_V6) + 38;

  const supplyDrums: SupplyDrumDefinition[] = [];
  const gatePairs: GatePairDefinition[] = [];
  const tireStacks: TireStackDefinition[] = [];
  const enemyWaves: EnemyWaveDefinition[] = [];

  const offCenterCycle: ReadonlyArray<'LEFT' | 'RIGHT'> = ['LEFT', 'RIGHT'];
  const laneCycle: ReadonlyArray<'LEFT' | 'CENTER' | 'RIGHT'> = ['LEFT', 'RIGHT', 'CENTER', 'LEFT'];

  for (let act = 0; act < 4; act++) {
    const actBaseZ = -act * actSpan;
    const actMul = 1 + act * 0.48;
    const s = seed.hpScale * d * actMul;
    const k = seed.gateK * d * (1 + act * 0.36);

    const earlyWeapon = Math.min(
      5,
      2 + Math.floor((seed.stageNumber - 1) / 3) + Math.floor(act / 2)
    ) as WeaponTierId;
    const midWeapon = Math.min(5, earlyWeapon + 1) as WeaponTierId;
    const lateWeapon = Math.min(5, midWeapon + (act >= 1 ? 1 : 0)) as WeaponTierId;

    // 3 V-Trio Rolling Barrel Formations + 3 Two-Lane Spiked Rolling Gauntlets per Act
    // (15 rolling barrels/Act = 60 rolling barrels total in strictly monotonic -Z order!)
    // Preserves v7.4 >= 42m gate-to-wave clearance untouched.
    const shieldLeftFirst = (seed.stageNumber + act) % 2 === 0;
    const wave1ShieldLanes: readonly ['LEFT' | 'CENTER' | 'RIGHT', 'LEFT' | 'CENTER' | 'RIGHT'] =
      shieldLeftFirst ? ['LEFT', 'RIGHT'] : ['CENTER', 'LEFT'];
    const gate2ShieldLanes: readonly ['LEFT' | 'CENTER' | 'RIGHT', 'LEFT' | 'CENTER' | 'RIGHT'] =
      shieldLeftFirst ? ['CENTER', 'RIGHT'] : ['LEFT', 'RIGHT'];
    const wave2ShieldLanes: readonly ['LEFT' | 'CENTER' | 'RIGHT', 'LEFT' | 'CENTER' | 'RIGHT'] =
      shieldLeftFirst ? ['RIGHT', 'CENTER'] : ['RIGHT', 'LEFT'];

    if (act === 0) {
      supplyDrums.push(
        // Opening V-trio: fresh 1-girl starter can focus one flank (+1) while dodging center Spiked Hazard Drum!
        ...drumV3(
          actBaseZ - 18.0,
          12 * Math.pow(seed.hpScale, 0.65),
          68 * s,
          13 * Math.pow(seed.hpScale, 0.65),
          { type: 'RECRUIT', val: 1 },
          { type: 'COINS', val: 12, isHazard: true },
          { type: 'RECRUIT', val: 1 },
          3.0
        ),
        ...drumV3(
          actBaseZ - Math.round(actSpan * 0.115),
          22 * Math.pow(seed.hpScale, 0.78),
          170 * s,
          24 * Math.pow(seed.hpScale, 0.78),
          { type: 'RECRUIT', val: 1 },
          { type: 'COINS', val: Math.round(52 + seed.stageNumber * 18) },
          { type: 'WEAPON', val: earlyWeapon },
          3.45
        ),
        // 2-Lane Rolling Gauntlet ahead of Wave 1 (0.310): Spiked Hazard + Recruit!
        ...rollingShieldPair(
          actBaseZ - Math.round(actSpan * 0.268),
          wave1ShieldLanes[0],
          wave1ShieldLanes[1],
          92 * s,
          22 * s,
          { type: 'COINS', val: 15, isHazard: true },
          { type: 'RECRUIT', val: 2 },
          3.85
        ),
        // 2-Lane Rolling Gauntlet ahead of Gate 2 (0.468): Spiked Hazard + Coin Cache!
        ...rollingShieldPair(
          actBaseZ - Math.round(actSpan * 0.432),
          gate2ShieldLanes[0],
          gate2ShieldLanes[1],
          118 * s,
          78 * s,
          { type: 'COINS', val: 18, isHazard: true },
          { type: 'COINS', val: Math.round(64 + seed.stageNumber * 20) },
          4.05
        ),
        // 2-Lane Rolling Gauntlet ahead of Wave 2 (0.585): Recruit + Spiked Hazard!
        ...rollingShieldPair(
          actBaseZ - Math.round(actSpan * 0.545),
          wave2ShieldLanes[0],
          wave2ShieldLanes[1],
          90 * s,
          136 * s,
          { type: 'RECRUIT', val: 2 },
          { type: 'COINS', val: 20, isHazard: true },
          4.15
        ),
        ...drumV3(
          actBaseZ - Math.round(actSpan * 0.795),
          155 * s,
          130 * s,
          145 * s,
          { type: 'COINS', val: Math.round(85 + seed.stageNumber * 28) },
          { type: 'RECRUIT', val: 2 },
          { type: 'WEAPON', val: midWeapon },
          3.85
        )
      );
    } else {
      supplyDrums.push(
        ...drumV3(
          actBaseZ - Math.round(actSpan * 0.065),
          115 * s,
          185 * s,
          120 * s,
          { type: 'WEAPON', val: earlyWeapon },
          { type: 'COINS', val: 24, isHazard: true },
          { type: 'RECRUIT', val: 2 },
          3.65
        ),
        ...drumV3(
          actBaseZ - Math.round(actSpan * 0.125),
          118 * s,
          245 * s,
          132 * s,
          { type: 'RECRUIT', val: 2 },
          { type: 'COINS', val: Math.round((52 + seed.stageNumber * 18) * (1 + act * 0.35)) },
          { type: 'WEAPON', val: midWeapon },
          3.8
        ),
        // 2-Lane Rolling Gauntlet ahead of Wave 1 (0.310)
        ...rollingShieldPair(
          actBaseZ - Math.round(actSpan * 0.268),
          wave1ShieldLanes[0],
          wave1ShieldLanes[1],
          175 * s,
          142 * s,
          { type: 'COINS', val: 25, isHazard: true },
          { type: 'RECRUIT', val: 2 },
          4.15
        ),
        // 2-Lane Double-Hazard / High-Stakes Gauntlet ahead of Gate 2 (0.468)
        ...rollingShieldPair(
          actBaseZ - Math.round(actSpan * 0.432),
          gate2ShieldLanes[0],
          gate2ShieldLanes[1],
          195 * s,
          act >= 2 ? 215 * s : 165 * s,
          { type: 'COINS', val: 28, isHazard: true },
          act >= 2
            ? { type: 'COINS', val: 28, isHazard: true }
            : { type: 'RECRUIT', val: 2 },
          4.35
        ),
        // 2-Lane Rolling Gauntlet ahead of Wave 2 (0.585)
        ...rollingShieldPair(
          actBaseZ - Math.round(actSpan * 0.545),
          wave2ShieldLanes[0],
          wave2ShieldLanes[1],
          178 * s,
          225 * s,
          { type: 'RECRUIT', val: 2 },
          { type: 'COINS', val: 30, isHazard: true },
          4.45
        ),
        ...drumV3(
          actBaseZ - Math.round(actSpan * 0.795),
          215 * s,
          178 * s,
          235 * s,
          { type: 'COINS', val: Math.round((88 + seed.stageNumber * 28) * (1 + act * 0.4)) },
          { type: 'RECRUIT', val: act >= 3 ? 3 : 2 },
          { type: 'WEAPON', val: lateWeapon },
          4.05
        )
      );
    }

    // 3 Dilemma & Trap Holo-Gate Pairs per Act (12 Gate Pairs total, >= 42m away from all waves!)
    // - Act 0 Gate 1: Full-span red shootable MUL (X0.70) requiring sustained focus-fire to rescue above X1.0!
    // - Acts 1-3 Gate 1: Locked Red ÷2 Trap vs. Tough Shootable MUL (X0.30)!
    // - All Acts Gate 2: Locked Red Penalty (-7..-16) vs. Shootable Negative ADD (-4..-8) — neither side is free!
    // - All Acts Gate 3: Locked Red ÷2 Trap vs. Tough Shootable MUL (X0.40)!
    const startFrac = Math.max(
      0.40,
      Number((0.70 - (seed.stageNumber - 1) * 0.015).toFixed(2))
    );
    const lockedPenalty = 7 + Math.floor(seed.stageNumber * 0.6) + act * 2;
    const shootableStartNeg = -(4 + act + Math.floor((seed.stageNumber - 1) / 3));
    const swapSides = (seed.stageNumber + act) % 2 === 0;

    const gate1Pair: GatePairDefinition =
      act === 0
        ? {
            z: actBaseZ - Math.round(actSpan * 0.195),
            left: null,
            right: null,
            full: shootMulGate(startFrac, 5.5 * k),
          }
        : {
            z: actBaseZ - Math.round(actSpan * 0.195),
            left: swapSides ? lockedDivGate(2) : shootMulGate(0.30, 16.5 * k),
            right: swapSides ? shootMulGate(0.30, 16.5 * k) : lockedDivGate(2),
          };

    const gate2Cost = (act === 0 ? 13 : 18.5) * k;
    gatePairs.push(
      gate1Pair,
      {
        z: actBaseZ - Math.round(actSpan * 0.468),
        left: swapSides
          ? lockedPenaltyAddGate(lockedPenalty)
          : addGate(shootableStartNeg, gate2Cost),
        right: swapSides
          ? addGate(shootableStartNeg, gate2Cost)
          : lockedPenaltyAddGate(lockedPenalty),
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.865),
        left: swapSides ? shootMulGate(0.40, 22 * k) : lockedDivGate(2),
        right: swapSides ? lockedDivGate(2) : shootMulGate(0.40, 22 * k),
      }
    );

    // 2 Three-Lane Modular Hex-Chevron Blast Barricades per Act (8 Walls = 24 Barricades total!)
    const wLaneA =
      act === 0
        ? offCenterCycle[seed.stageNumber % 2]
        : laneCycle[(seed.stageNumber + act) % 4];
    const wLaneB = laneCycle[(seed.stageNumber + act + 1) % 4];
    const wallHpA = (act === 0 ? 80 : 360) * s;
    const wallHpB = (act === 0 ? 155 : 510) * s;

    tireStacks.push(
      ...tireWall3(
        actBaseZ - Math.round(actSpan * 0.390),
        wLaneA === 'LEFT' ? wallHpA : wallHpA * 1.48,
        wLaneA === 'CENTER' ? wallHpA : wallHpA * 1.52,
        wLaneA === 'RIGHT' ? wallHpA : wallHpA * 1.48,
        wLaneA,
        midWeapon,
        Math.round((95 + seed.stageNumber * 28) * (1 + act * 0.3))
      ),
      ...tireWall3(
        actBaseZ - Math.round(actSpan * 0.665),
        wLaneB === 'LEFT' ? wallHpB : wallHpB * 1.28,
        wLaneB === 'CENTER' ? wallHpB : wallHpB * 1.32,
        wLaneB === 'RIGHT' ? wallHpB : wallHpB * 1.28,
        wLaneB,
        lateWeapon,
        Math.round((135 + seed.stageNumber * 38) * (1 + act * 0.35))
      )
    );

    // 4 Dedicated Open-Road Enemy Skirmish Waves per Act (16 Waves total, >= 43m behind every Gate!)
    // Each wave now fields active Ranged Enemy Shooters + Armored Lane Chargers!
    const waveSpeed = Math.min(4.05, seed.enemyBaseSpeed + act * 0.16);
    const waveHp = seed.enemyBaseHp * d * actMul;
    enemyWaves.push(
      {
        z: actBaseZ - Math.round(actSpan * 0.310),
        lane: 'CENTER',
        count: Math.min(48, (act === 0 ? 16 : 26) + seed.stageNumber + act * 3),
        hpPerEnemy: Math.max(7, Math.round(waveHp * (act === 0 ? 0.50 : 0.74))),
        heavyCount: Math.min(12, (act === 0 ? 1 : 3) + Math.floor(seed.stageNumber / 2) + act),
        vanguardRatio: 0.40,
        speed: Number(waveSpeed.toFixed(2)),
        coinPerKill: seed.coinBase + act,
        shooterCount: 3 + act,
        chargerCount: (act === 0 ? 1 : 2) + Math.floor(act / 2),
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.585),
        lane: 'CENTER',
        count: Math.min(50, 32 + seed.stageNumber + act * 3),
        hpPerEnemy: Math.max(12, Math.round(waveHp * 1.02)),
        heavyCount: Math.min(13, 5 + Math.floor(seed.stageNumber / 2) + act),
        vanguardRatio: 0.35,
        speed: Number((waveSpeed + 0.14).toFixed(2)),
        coinPerKill: seed.coinBase + act + 1,
        shooterCount: 5 + act,
        chargerCount: 3 + Math.floor(act / 2),
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.732),
        lane: 'CENTER',
        count: Math.min(52, 39 + Math.floor(seed.stageNumber / 2) + act * 2),
        hpPerEnemy: Math.max(16, Math.round(waveHp * 1.38)),
        heavyCount: Math.min(14, 6 + Math.floor(seed.stageNumber / 2) + act),
        vanguardRatio: 0.30,
        speed: Number((waveSpeed + 0.22).toFixed(2)),
        coinPerKill: seed.coinBase + act + 2,
        shooterCount: 6 + act,
        chargerCount: 3 + Math.floor((act + 1) / 2),
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.980),
        lane: 'CENTER',
        count: Math.min(52, 43 + Math.floor(seed.stageNumber / 2) + act * 2),
        hpPerEnemy: Math.max(20, Math.round(waveHp * 1.62)),
        heavyCount: Math.min(15, 7 + Math.floor(seed.stageNumber / 2) + act),
        vanguardRatio: 0.28,
        speed: Number((waveSpeed + 0.30).toFixed(2)),
        coinPerKill: seed.coinBase + act + 2,
        shooterCount: 7 + act,
        chargerCount: 4 + Math.floor(act / 2),
      }
    );
  }

  const primaryBrute: MidBridgeBruteDefinition = {
    z: -Math.round(actSpan * 1.625),
    name: seed.bruteName,
    maxHp: seed.bruteMaxHp,
    speed: seed.bruteSpeed,
    clubDamage: seed.bruteDamage,
    coinReward: seed.bruteCoins,
  };

  const midBrutes: MidBridgeBruteDefinition[] = [
    {
      z: -Math.round(actSpan * 0.625),
      name: `${seed.bruteName} Vanguard`,
      maxHp: Math.round(seed.bruteMaxHp * 0.38),
      speed: Math.max(2.25, seed.bruteSpeed - 0.05),
      clubDamage: Math.max(7, seed.bruteDamage - 1),
      coinReward: Math.round(seed.bruteCoins * 0.75),
    },
    primaryBrute,
    {
      z: -Math.round(actSpan * 3.625),
      name: `${seed.bruteName} Warden`,
      maxHp: Math.round(seed.bruteMaxHp * 1.24),
      speed: Math.min(3.15, seed.bruteSpeed + 0.16),
      clubDamage: seed.bruteDamage + 2,
      coinReward: Math.round(seed.bruteCoins * 1.3),
    },
  ];

  const splitCauseway =
    seed.boardLayout === 'SPLIT_CAUSEWAY'
      ? buildSplitCausewayDefinition(
          seed.stageNumber,
          seed.hpScale,
          seed.enemyBaseHp,
          seed.enemyBaseSpeed,
          seed.coinBase,
          seed.bruteName,
          seed.bruteMaxHp,
          seed.bruteSpeed,
          seed.bruteDamage,
          seed.bruteCoins
        )
      : undefined;

  return {
    stageNumber: seed.stageNumber,
    title: seed.title,
    boardLayout: seed.boardLayout,
    trackLength,
    supplyDrums,
    gatePairs,
    tireStacks,
    enemyWaves,
    midBrute: primaryBrute,
    midBrutes,
    splitCauseway,
    boss: seed.boss,
  };
}

/**
 * Applies the selected Hub Difficulty Tier (`NORMAL` / `HARD` / `NIGHTMARE`) cleanly
 * across Standard Bridge, Split Causeway, and Endless StageDefinitions!
 */
export function applyDifficultyToStage(
  stage: StageDefinition,
  difficulty: DifficultyTier
): StageDefinition {
  if (difficulty === 'NORMAL') {
    return stage;
  }
  const prof = getDifficultyProfile(difficulty);
  const scaleGate = (g: GateDefinition | null | undefined): GateDefinition | null | undefined => {
    if (!g) return g;
    if (g.isLocked) return g;
    return {
      ...g,
      damagePerIncrement: Math.max(5, Math.round(g.damagePerIncrement * prof.gateCostMult)),
    };
  };

  return {
    ...stage,
    supplyDrums: stage.supplyDrums.map((dr) => ({
      ...dr,
      hp: Math.max(15, Math.round(dr.hp * prof.drumHpMult)),
      rollSpeed: dr.rollSpeed
        ? Number((dr.rollSpeed * prof.enemySpeedMult).toFixed(2))
        : undefined,
    })),
    gatePairs: stage.gatePairs.map((gp) => ({
      ...gp,
      left: scaleGate(gp.left) ?? null,
      right: scaleGate(gp.right) ?? null,
      full: gp.full ? scaleGate(gp.full) : gp.full,
    })),
    tireStacks: stage.tireStacks.map((ts) => ({
      ...ts,
      breakCount: Math.max(115, Math.round(ts.breakCount * prof.drumHpMult)),
    })),
    enemyWaves: stage.enemyWaves.map((wv) => ({
      ...wv,
      hpPerEnemy: Math.max(8, Math.round(wv.hpPerEnemy * prof.enemyHpMult)),
      speed: Number((wv.speed * prof.enemySpeedMult).toFixed(2)),
      shooterCount: Math.min(
        Math.floor(wv.count * 0.4),
        Math.round((wv.shooterCount ?? 4) * prof.threatCadenceMult)
      ),
      chargerCount: Math.min(
        wv.heavyCount ?? 4,
        Math.round((wv.chargerCount ?? 2) * prof.threatCadenceMult)
      ),
    })),
    midBrute: stage.midBrute
      ? {
          ...stage.midBrute,
          maxHp: Math.round(stage.midBrute.maxHp * prof.bossHpMult),
          speed: Number((stage.midBrute.speed * prof.enemySpeedMult).toFixed(2)),
          clubDamage: Math.min(20, Math.round(stage.midBrute.clubDamage * (0.95 + prof.bossTempoMult * 0.2))),
        }
      : undefined,
    midBrutes: stage.midBrutes?.map((b) => ({
      ...b,
      maxHp: Math.round(b.maxHp * prof.bossHpMult),
      speed: Number((b.speed * prof.enemySpeedMult).toFixed(2)),
      clubDamage: Math.min(20, Math.round(b.clubDamage * (0.95 + prof.bossTempoMult * 0.2))),
    })),
    splitCauseway: stage.splitCauseway
      ? {
          ...stage.splitCauseway,
          marchSpeed: Number((stage.splitCauseway.marchSpeed * prof.enemySpeedMult).toFixed(2)),
          leftQueue: stage.splitCauseway.leftQueue.map((node) => ({
            ...node,
            barrelHp: Math.max(42, Math.round(node.barrelHp * prof.drumHpMult)),
          })),
          rightEchelons: stage.splitCauseway.rightEchelons.map((ech) => ({
            ...ech,
            hpPerUnit: Math.max(9, Math.round(ech.hpPerUnit * prof.enemyHpMult)),
            speed: Number((ech.speed * prof.enemySpeedMult).toFixed(2)),
          })),
          goliathSpawns: stage.splitCauseway.goliathSpawns.map((b) => ({
            ...b,
            maxHp: Math.round(b.maxHp * prof.bossHpMult),
            speed: Number((b.speed * prof.enemySpeedMult).toFixed(2)),
            clubDamage: Math.min(20, Math.round(b.clubDamage * (0.95 + prof.bossTempoMult * 0.2))),
          })),
        }
      : undefined,
    boss: {
      ...stage.boss,
      maxHp: Math.round(stage.boss.maxHp * prof.bossHpMult),
      advanceSpeed: Number((stage.boss.advanceSpeed * Math.min(1.22, prof.enemySpeedMult)).toFixed(2)),
      salvoInterval: Number(Math.max(0.84, stage.boss.salvoInterval / prof.bossTempoMult).toFixed(2)),
      salvoDamage: Math.min(22, Math.round(stage.boss.salvoDamage * (0.9 + prof.bossTempoMult * 0.25))),
    },
  };
}

/**
 * 10 Escalating Bridge Blitz v8.2 Sectors — Skill + Progression Overhaul:
 * - Odd Sectors (1, 3, 5, 7, 9): 1,120m..1,344m Midnight Viaduct Assaults with Shooters, Chargers & Spiked Barrels
 * - Even Sectors (2, 4, 6, 8, 10): Split Causeway Tactical Sieges (Full Threat Parity + 2-Lane Boss Salvos from Sector 1!)
 */
export const CAMPAIGN_STAGES: ReadonlyArray<StageDefinition> = [
  buildMarathonSector({
    stageNumber: 1,
    title: 'Midnight Viaduct Outpost',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 280,
    hpScale: 1.0,
    gateK: 1.0,
    negGateBase: -24,
    posGateBase: 2,
    enemyBaseHp: 13.0,
    enemyBaseSpeed: 2.95,
    coinBase: 3,
    bruteName: 'Siege Goliath',
    bruteMaxHp: 6200,
    bruteSpeed: 2.38,
    bruteDamage: 8,
    bruteCoins: 280,
    boss: {
      name: 'Obsidian Warden Mk-I',
      chassis: 'WARDEN_MECH',
      primaryHex: 0x243448,
      accentHex: 0xe62454,
      trimHex: 0x28f8dc,
      maxHp: 10800,
      segments: 5,
      advanceSpeed: 1.48,
      salvoLanes: 2,
      salvoInterval: 1.48,
      salvoDamage: 8,
      rewardCoins: 360,
    },
  }),
  buildMarathonSector({
    stageNumber: 2,
    title: 'Stormwall Split Causeway',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 288,
    hpScale: 1.24,
    gateK: 1.18,
    negGateBase: -26,
    posGateBase: 2,
    enemyBaseHp: 16.5,
    enemyBaseSpeed: 3.04,
    coinBase: 4,
    bruteName: 'Breacher Goliath',
    bruteMaxHp: 8200,
    bruteSpeed: 2.46,
    bruteDamage: 9,
    bruteCoins: 360,
    boss: {
      name: 'Stormwall Enforcer',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x1e2d3e,
      accentHex: 0xff3b5c,
      trimHex: 0x28f8dc,
      maxHp: 14500,
      segments: 5,
      advanceSpeed: 1.53,
      salvoLanes: 2,
      salvoInterval: 1.42,
      salvoDamage: 9,
      rewardCoins: 460,
    },
  }),
  buildMarathonSector({
    stageNumber: 3,
    title: 'Obsidian Truss Marathon',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 296,
    hpScale: 1.52,
    gateK: 1.40,
    negGateBase: -28,
    posGateBase: 3,
    enemyBaseHp: 20.5,
    enemyBaseSpeed: 3.13,
    coinBase: 5,
    bruteName: 'Crimson Goliath',
    bruteMaxHp: 10400,
    bruteSpeed: 2.54,
    bruteDamage: 10,
    bruteCoins: 440,
    boss: {
      name: 'Crimson Juggernaut',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x5c1428,
      accentHex: 0x1c2736,
      trimHex: 0xffb830,
      maxHp: 18500,
      segments: 6,
      advanceSpeed: 1.58,
      salvoLanes: 2,
      salvoInterval: 1.36,
      salvoDamage: 10,
      rewardCoins: 580,
    },
  }),
  buildMarathonSector({
    stageNumber: 4,
    title: 'Thunderhead Divide',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 304,
    hpScale: 1.84,
    gateK: 1.64,
    negGateBase: -30,
    posGateBase: 3,
    enemyBaseHp: 25.0,
    enemyBaseSpeed: 3.22,
    coinBase: 6,
    bruteName: 'Ironclad Goliath',
    bruteMaxHp: 12800,
    bruteSpeed: 2.62,
    bruteDamage: 11,
    bruteCoins: 540,
    boss: {
      name: 'Volt-Core Siege Mech',
      chassis: 'WARDEN_MECH',
      primaryHex: 0x1e2838,
      accentHex: 0xff2e58,
      trimHex: 0xffc938,
      maxHp: 23000,
      segments: 6,
      advanceSpeed: 1.63,
      salvoLanes: 2,
      salvoInterval: 1.30,
      salvoDamage: 10,
      rewardCoins: 720,
    },
  }),
  buildMarathonSector({
    stageNumber: 5,
    title: 'Tempest Cable Viaduct',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 312,
    hpScale: 2.20,
    gateK: 1.92,
    negGateBase: -32,
    posGateBase: 3,
    enemyBaseHp: 30.5,
    enemyBaseSpeed: 3.31,
    coinBase: 7,
    bruteName: 'Tempest Goliath',
    bruteMaxHp: 15500,
    bruteSpeed: 2.70,
    bruteDamage: 11,
    bruteCoins: 660,
    boss: {
      name: 'Tempest Arachnid',
      chassis: 'KRAKEN_WALKER',
      primaryHex: 0x1a2c42,
      accentHex: 0x28f8dc,
      trimHex: 0xff3b5c,
      maxHp: 28000,
      segments: 7,
      advanceSpeed: 1.68,
      salvoLanes: 2,
      salvoInterval: 1.25,
      salvoDamage: 11,
      rewardCoins: 900,
    },
  }),
  buildMarathonSector({
    stageNumber: 6,
    title: 'Twin-Bulkhead Overwatch',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 318,
    hpScale: 2.60,
    gateK: 2.22,
    negGateBase: -34,
    posGateBase: 3,
    enemyBaseHp: 37.0,
    enemyBaseSpeed: 3.40,
    coinBase: 8,
    bruteName: 'Overwatch Goliath',
    bruteMaxHp: 18500,
    bruteSpeed: 2.78,
    bruteDamage: 12,
    bruteCoins: 800,
    boss: {
      name: 'Aegis Dreadnought',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x223246,
      accentHex: 0xe62454,
      trimHex: 0x38f6ff,
      maxHp: 33500,
      segments: 7,
      advanceSpeed: 1.72,
      salvoLanes: 2,
      salvoInterval: 1.20,
      salvoDamage: 12,
      rewardCoins: 1120,
    },
  }),
  buildMarathonSector({
    stageNumber: 7,
    title: 'Abyssal Strait Span',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 324,
    hpScale: 3.05,
    gateK: 2.55,
    negGateBase: -36,
    posGateBase: 4,
    enemyBaseHp: 44.5,
    enemyBaseSpeed: 3.49,
    coinBase: 10,
    bruteName: 'Abyssal Goliath',
    bruteMaxHp: 21800,
    bruteSpeed: 2.86,
    bruteDamage: 13,
    bruteCoins: 960,
    boss: {
      name: 'Kraken Command Rig',
      chassis: 'KRAKEN_WALKER',
      primaryHex: 0x162030,
      accentHex: 0xff2854,
      trimHex: 0x28f8dc,
      maxHp: 39500,
      segments: 8,
      advanceSpeed: 1.77,
      salvoLanes: 2,
      salvoInterval: 1.16,
      salvoDamage: 13,
      rewardCoins: 1380,
    },
  }),
  buildMarathonSector({
    stageNumber: 8,
    title: 'Vortex Partition Causeway',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 330,
    hpScale: 3.55,
    gateK: 2.92,
    negGateBase: -38,
    posGateBase: 4,
    enemyBaseHp: 53.0,
    enemyBaseSpeed: 3.58,
    coinBase: 12,
    bruteName: 'Vortex Goliath',
    bruteMaxHp: 25500,
    bruteSpeed: 2.94,
    bruteDamage: 14,
    bruteCoins: 1140,
    boss: {
      name: 'Obsidian Sovereign',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x181c28,
      accentHex: 0xe62048,
      trimHex: 0xffb830,
      maxHp: 46500,
      segments: 8,
      advanceSpeed: 1.82,
      salvoLanes: 2,
      salvoInterval: 1.12,
      salvoDamage: 14,
      rewardCoins: 1700,
    },
  }),
  buildMarathonSector({
    stageNumber: 9,
    title: 'Plasma Horizon Viaduct',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 336,
    hpScale: 4.12,
    gateK: 3.34,
    negGateBase: -40,
    posGateBase: 4,
    enemyBaseHp: 62.0,
    enemyBaseSpeed: 3.66,
    coinBase: 14,
    bruteName: 'Horizon Goliath',
    bruteMaxHp: 29500,
    bruteSpeed: 3.00,
    bruteDamage: 15,
    bruteCoins: 1360,
    boss: {
      name: 'Hyperion Warlord',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x1e2c42,
      accentHex: 0x28f8dc,
      trimHex: 0xffc845,
      maxHp: 54500,
      segments: 9,
      advanceSpeed: 1.87,
      salvoLanes: 2,
      salvoInterval: 1.08,
      salvoDamage: 15,
      rewardCoins: 2050,
    },
  }),
  buildMarathonSector({
    stageNumber: 10,
    title: 'Omega Stormwall Citadel',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 342,
    hpScale: 4.78,
    gateK: 3.80,
    negGateBase: -42,
    posGateBase: 4,
    enemyBaseHp: 72.0,
    enemyBaseSpeed: 3.75,
    coinBase: 17,
    bruteName: 'Omega Goliath',
    bruteMaxHp: 34000,
    bruteSpeed: 3.08,
    bruteDamage: 16,
    bruteCoins: 1650,
    boss: {
      name: 'Apex Sovereign Mech',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x2c1c38,
      accentHex: 0xff2858,
      trimHex: 0x28f8dc,
      maxHp: 64000,
      segments: 10,
      advanceSpeed: 1.92,
      salvoLanes: 2,
      salvoInterval: 1.04,
      salvoDamage: 16,
      rewardCoins: 2600,
    },
  }),
];

export function getCampaignStage(stageNumber: number): StageDefinition {
  const idx = Math.max(
    0,
    Math.min(CAMPAIGN_STAGES.length - 1, Math.floor(stageNumber) - 1)
  );
  return CAMPAIGN_STAGES[idx];
}

const ENDLESS_CHASSIS_ROTATION: ReadonlyArray<{
  chassis: BossChassisId;
  label: string;
  primaryHex: number;
  accentHex: number;
  trimHex: number;
}> = [
  { chassis: 'WARDEN_MECH', label: 'Warden', primaryHex: 0x243448, accentHex: 0xe62454, trimHex: 0x28f8dc },
  { chassis: 'SIEGE_TANK', label: 'Juggernaut', primaryHex: 0x4e1a2c, accentHex: 0xff4d6d, trimHex: 0xffc938 },
  { chassis: 'KRAKEN_WALKER', label: 'Kraken', primaryHex: 0x1c2e44, accentHex: 0x28f8dc, trimHex: 0xff3b5c },
  { chassis: 'SOVEREIGN_TITAN', label: 'Sovereign', primaryHex: 0x2c1c3a, accentHex: 0xffc938, trimHex: 0x28f8dc },
];

const SPLIT_CAUSEWAY_TITLES: ReadonlyArray<string> = [
  'Stormwall Split Causeway',
  'Thunderhead Divide',
  'Obsidian Bulkhead Wall',
  'Crimson Breach Corridor',
  'Twin-Channel Viaduct',
  'Tempest Shield Causeway',
  'Abyssal Siege Partition',
  'Vortex Gatehouse',
  'Hyperion Split Span',
  'Omega Stormwall Citadel',
];

/**
 * Dedicated Split Causeway Mode generator (`SPLIT_CAUSEWAY` mode on Hub, Stages 1..infinity).
 */
export function generateSplitCausewayStage(stageNumber: number): StageDefinition {
  const sNum = Math.max(1, Math.floor(stageNumber));
  const scale = Math.pow(1.22, sNum - 1);
  const archetype = ENDLESS_CHASSIS_ROTATION[(sNum - 1) % ENDLESS_CHASSIS_ROTATION.length];
  const titleName = SPLIT_CAUSEWAY_TITLES[(sNum - 1) % SPLIT_CAUSEWAY_TITLES.length];

  return buildMarathonSector({
    stageNumber: sNum,
    title: titleName,
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: Math.min(345, 286 + sNum * 6),
    hpScale: 1.0 * scale,
    gateK: scale,
    negGateBase: -(22 + sNum * 2),
    posGateBase: Math.min(5, 2 + Math.floor(sNum / 3)),
    enemyBaseHp: 13.5 * scale,
    enemyBaseSpeed: Math.min(3.75, 2.95 + sNum * 0.08),
    coinBase: 3 + sNum * 2,
    bruteName: `Causeway-${sNum} Goliath`,
    bruteMaxHp: Math.round(6600 * Math.pow(1.22, sNum - 1)),
    bruteSpeed: Math.min(3.05, 2.38 + sNum * 0.06),
    bruteDamage: Math.min(16, 8 + Math.floor(sNum / 2)),
    bruteCoins: Math.round(310 * scale),
    boss: {
      name: `Causeway-${sNum} ${archetype.label}`,
      chassis: archetype.chassis,
      primaryHex: archetype.primaryHex,
      accentHex: archetype.accentHex,
      trimHex: archetype.trimHex,
      maxHp: Math.round(11500 * Math.pow(1.24, sNum - 1)),
      segments: Math.min(10, 5 + Math.floor(sNum / 2)),
      advanceSpeed: Math.min(1.94, 1.48 + sNum * 0.045),
      salvoLanes: 2,
      salvoInterval: Math.max(1.02, 1.48 - (sNum - 1) * 0.05),
      salvoDamage: Math.min(16, 8 + Math.floor(sNum / 2)),
      rewardCoins: Math.round(360 + sNum * 115 * scale),
    },
  });
}

/**
 * Generates deterministic 400%-length escalating sectors for Endless Viaduct Mode,
 * alternating Standard Midnight Viaduct (odd waves) & Split Causeway (even waves)!
 */
export function generateEndlessWaveStage(waveNumber: number): StageDefinition {
  const w = Math.max(1, Math.floor(waveNumber));
  const scale = Math.pow(1.22, w - 1);
  const archetype = ENDLESS_CHASSIS_ROTATION[(w - 1) % ENDLESS_CHASSIS_ROTATION.length];
  const boardLayout: BoardLayout = w % 2 === 0 ? 'SPLIT_CAUSEWAY' : 'STANDARD_BRIDGE';

  return buildMarathonSector({
    stageNumber: w,
    title: boardLayout === 'SPLIT_CAUSEWAY' ? `Endless Causeway ${w}` : `Endless Viaduct ${w}`,
    boardLayout,
    baseSpan: 296,
    hpScale: scale,
    gateK: scale,
    negGateBase: -(22 + w * 2),
    posGateBase: Math.min(5, 2 + Math.floor(w / 3)),
    enemyBaseHp: 13.0 * scale,
    enemyBaseSpeed: Math.min(3.75, 2.95 + w * 0.075),
    coinBase: 3 + w * 2,
    bruteName: `Wave-${w} Goliath`,
    bruteMaxHp: Math.round(6400 * scale),
    bruteSpeed: Math.min(3.05, 2.36 + w * 0.06),
    bruteDamage: Math.min(16, 8 + Math.floor(w / 2)),
    bruteCoins: Math.round(290 * scale),
    boss: {
      name: `Sector-${w} ${archetype.label}`,
      chassis: archetype.chassis,
      primaryHex: archetype.primaryHex,
      accentHex: archetype.accentHex,
      trimHex: archetype.trimHex,
      maxHp: Math.round(11200 * Math.pow(1.24, w - 1)),
      segments: Math.min(10, 5 + Math.floor(w / 2)),
      advanceSpeed: Math.min(1.94, 1.48 + w * 0.045),
      salvoLanes: 2,
      salvoInterval: Math.max(1.02, 1.48 - (w - 1) * 0.05),
      salvoDamage: Math.min(16, 8 + Math.floor(w / 2)),
      rewardCoins: Math.round(350 + w * 110 * scale),
    },
  });
}

const UNICORN_BOSS_NAME_MAP: Readonly<Record<string, string>> = {
  'Obsidian Warden Mk-I': 'Sapphire Charger Stallion',
  'Stormwall Enforcer': 'Emerald Chariot Unicorn',
  'Crimson Juggernaut': 'Cobalt Chariot Stallion',
  'Volt-Core Siege Mech': 'Verdant Knight Stallion',
  'Tempest Arachnid': 'Tempest Pegasus Alicorn',
  'Aegis Dreadnought': 'Aegis Chariot War-Unicorn',
  'Kraken Command Rig': 'Sky-Wing Pegasus Alicorn',
  'Obsidian Sovereign': 'Royal Crowned Alicorn',
  'Hyperion Warlord': 'Emerald King Alicorn',
  'Apex Sovereign Mech': 'Omega Sovereign Alicorn',
};

const UNICORN_ARCHETYPE_LABELS: Readonly<Record<BossChassisId, string>> = {
  WARDEN_MECH: 'CHARGER STALLION',
  SIEGE_TANK: 'CHARIOT WAR-UNICORN',
  KRAKEN_WALKER: 'WINGED PEGASUS ALICORN',
  SOVEREIGN_TITAN: 'CROWNED SOVEREIGN ALICORN',
};

export interface BossVisualProfile {
  readonly name: string;
  readonly archetypeLabel: string;
  readonly primaryHex: number;
  readonly accentHex: number;
  readonly trimHex: number;
}

export function getBossVisualProfile(
  def: BossDefinition,
  skinTheme: 'TACTICAL' | 'UNICORN'
): BossVisualProfile {
  if (skinTheme !== 'UNICORN') {
    const tacticalLabels: Record<BossChassisId, string> = {
      WARDEN_MECH: 'BIPEDAL MECH',
      SIEGE_TANK: 'HEAVY SIEGE TANK',
      KRAKEN_WALKER: 'ARACHNID WALKER',
      SOVEREIGN_TITAN: 'SOVEREIGN TITAN',
    };
    return {
      name: def.name,
      archetypeLabel: tacticalLabels[def.chassis],
      primaryHex: def.primaryHex,
      accentHex: def.accentHex,
      trimHex: def.trimHex,
    };
  }

  let mappedName = UNICORN_BOSS_NAME_MAP[def.name];
  if (!mappedName) {
    mappedName = def.name
      .replace('Warden', 'Charger Stallion')
      .replace('Juggernaut', 'Chariot Unicorn')
      .replace('Kraken', 'Pegasus Alicorn')
      .replace('Sovereign', 'Crowned Alicorn');
  }

  const isGreenLead =
    def.name.includes('Stormwall') ||
    def.name.includes('Volt') ||
    def.name.includes('Kraken') ||
    def.name.includes('Hyperion');

  return {
    name: mappedName,
    archetypeLabel: UNICORN_ARCHETYPE_LABELS[def.chassis],
    primaryHex: isGreenLead ? 0x16b852 : 0x1864f2,
    accentHex: isGreenLead ? 0x1864f2 : 0x1ec95b,
    trimHex: def.chassis === 'SOVEREIGN_TITAN' ? 0xffd84d : 0xffcf38,
  };
}
