import type {
  BoardLayout,
  BossChassisId,
  BossDefinition,
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

/** Global v6.0 difficulty multiplier (+50% harder across obstacles, gates, hordes, Goliaths & Bosses). */
export const DIFFICULTY_MULTIPLIER_V6 = 1.5;
/** Global v6.0 marathon span multiplier (400% longer sectors & sieges). */
export const BOARD_LENGTH_MULTIPLIER_V6 = 4.0;

function addGate(initialValue: number, damagePerIncrement: number): GateDefinition {
  return {
    operator: 'ADD',
    initialValue,
    damagePerIncrement: Math.max(4, Math.round(damagePerIncrement)),
    isLocked: false,
  };
}

function shootMulGate(initialValue: number, damagePerIncrement: number): GateDefinition {
  return {
    operator: 'MUL',
    initialValue,
    damagePerIncrement: Math.max(6, Math.round(damagePerIncrement)),
    isLocked: false,
  };
}

function drumV3(
  zCenter: number,
  leftHp: number,
  centerHp: number,
  rightHp: number,
  leftReward: { type: 'COINS' | 'WEAPON' | 'RECRUIT'; val: number },
  centerReward: { type: 'COINS' | 'WEAPON' | 'RECRUIT'; val: number },
  rightReward: { type: 'COINS' | 'WEAPON' | 'RECRUIT'; val: number }
): SupplyDrumDefinition[] {
  return [
    {
      z: zCenter,
      lane: 'CENTER',
      hp: Math.max(12, Math.round(centerHp)),
      rewardType: centerReward.type,
      rewardValue: centerReward.val,
    },
    {
      z: zCenter - 2.6,
      lane: 'LEFT',
      hp: Math.max(18, Math.round(leftHp)),
      rewardType: leftReward.type,
      rewardValue: leftReward.val,
    },
    {
      z: zCenter - 2.6,
      lane: 'RIGHT',
      hp: Math.max(18, Math.round(rightHp)),
      rewardType: rightReward.type,
      rewardValue: rightReward.val,
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
      breakCount: Math.max(120, Math.round(leftHp)),
      weaponTier: weaponLane === 'LEFT' ? weaponTier : undefined,
      coinReward: weaponLane === 'LEFT' ? undefined : sideCoins,
    },
    {
      z,
      lane: 'CENTER',
      breakCount: Math.max(120, Math.round(centerHp)),
      weaponTier: weaponLane === 'CENTER' ? weaponTier : undefined,
      coinReward: weaponLane === 'CENTER' ? undefined : sideCoins,
    },
    {
      z,
      lane: 'RIGHT',
      breakCount: Math.max(120, Math.round(rightHp)),
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
 * Builds a 28-node Left-Lane `[Barrel + Gate/Weapon]` conveyor queue and 22-echelon Right-Lane
 * siege battalion (`~375` ranked troopers + `3` Breacher Riot Goliaths) for Split Causeway boards.
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
  const siegeColumnSpan = Math.round(320 + (stageIdx - 1) * 8);
  // Urgent, relentless right-lane charge speed (>2.15x faster than v6.0)!
  const marchSpeed = Math.min(6.15, Math.max(4.85, enemyBaseSpeed * 2.52 + stageIdx * 0.10));

  // Disciplined reward cadence: earned weapon & multiplier power spikes spaced across all 28 nodes!
  const rewardPattern: ReadonlyArray<SplitNodeReward> = [
    { kind: 'GATE', operator: 'MUL', value: 2 },
    { kind: 'GATE', operator: 'ADD', value: 2 },
    { kind: 'WEAPON', weaponTier: 2 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'GATE', operator: 'ADD', value: 3 },
    { kind: 'WEAPON', weaponTier: 3 },
    { kind: 'COINS', coins: Math.round(85 * hpScale) },
    { kind: 'GATE', operator: 'ADD', value: 3 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'GATE', operator: 'ADD', value: 4 },
    { kind: 'WEAPON', weaponTier: 4 },
    { kind: 'COINS', coins: Math.round(145 * hpScale) },
    { kind: 'GATE', operator: 'ADD', value: 4 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'GATE', operator: 'ADD', value: 5 },
    { kind: 'WEAPON', weaponTier: 5 },
    { kind: 'COINS', coins: Math.round(210 * hpScale) },
    { kind: 'GATE', operator: 'MUL', value: 2 },
    { kind: 'GATE', operator: 'ADD', value: 5 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'COINS', coins: Math.round(280 * hpScale) },
    { kind: 'GATE', operator: 'ADD', value: 6 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'GATE', operator: 'ADD', value: 6 },
    { kind: 'COINS', coins: Math.round(355 * hpScale) },
    { kind: 'GATE', operator: 'MUL', value: 2 },
    { kind: 'GATE', operator: 'ADD', value: 8 },
    { kind: 'GATE', operator: 'MUL', value: 2 },
  ];

  // Exponentially scaled barrel HP curve matching player squad + weapon DPS growth so boosts require multi-window chipping!
  const baseQueueHps = [
    52, 120, 260, 520, 880, 1400, 2100, 3100, 4500, 6400, 9000, 12400, 16800, 22500,
    29500, 38500, 49000, 62000, 77000, 95000, 115000, 138000, 164000, 192000, 224000, 260000, 298000, 340000,
  ];

  const leftQueue: SplitBarrelNodeDefinition[] = [];
  for (let i = 0; i < rewardPattern.length; i++) {
    const stageFactor = i === 0 ? Math.pow(hpScale, 0.72) : Math.pow(hpScale, 0.94);
    const barrelHp = Math.max(45, Math.round(baseQueueHps[i] * d * stageFactor));
    leftQueue.push({
      barrelHp,
      reward: rewardPattern[i],
    });
  }

  // 22 fast-charging Right-Lane Battalion Echelons: nonlinear HP ramp punishes both Left-Campers AND unboosted Right-Campers!
  const rightEchelons: SplitHordeEchelonDefinition[] = [];
  let cursorZ = 18.5;
  const totalEchelons = 22;
  for (let e = 0; e < totalEchelons; e++) {
    const progress = e / (totalEchelons - 1);
    let rank: EnemyVisualRank = 1;
    if (e === 0 || (e >= 3 && e % 4 === 3)) {
      rank = 0; // Fast Olive-Moss Vanguard Raiders spearheading each surge
    } else if (e === 2 || (e >= 6 && e % 4 === 2) || e >= 20) {
      rank = 2; // Towering 1.65x Dark Ironclad Heavy Juggernauts anchoring each surge
    }

    const cols = rank === 2 ? 4 : e === 0 ? 4 : e <= 5 ? 5 : 6;
    const rows = rank === 2 ? (e <= 8 ? 2 : 3) : 3;
    const echelonGrowth = 1 + Math.pow(progress, 1.35) * 4.85;
    const rankHpMul =
      rank === 2 ? 2.65 : rank === 0 ? (e === 0 ? 0.82 : 0.96) : 1.24;
    const hpPerUnit = Math.max(
      10,
      Math.round(enemyBaseHp * d * echelonGrowth * rankHpMul)
    );
    const unitSpeed =
      rank === 2 ? marchSpeed * 0.93 : rank === 0 ? marchSpeed * 1.08 : marchSpeed;
    const coinPerKill =
      rank === 2 ? Math.round((coinBase + 2) * 3.0) : Math.max(3, coinBase + Math.floor(progress * 4));

    rightEchelons.push({
      startZ: Number(cursorZ.toFixed(1)),
      rows,
      cols,
      rank,
      hpPerUnit,
      speed: Number(unitSpeed.toFixed(2)),
      coinPerKill,
    });

    const depthSpan = rows * (rank === 2 ? 1.44 : 1.05);
    const gapZ = e === 0 ? 8.2 : 11.2 + (stageIdx - 1) * 0.28;
    cursorZ += depthSpan + gapZ;
  }

  const fastBruteSpeed = Math.min(4.25, Math.max(3.42, bruteSpeed * 1.82));
  const goliathSpawns: MidBridgeBruteDefinition[] = [
    {
      z: -Math.round(siegeColumnSpan * 0.26),
      name: `${bruteName} Alpha`,
      maxHp: Math.round(bruteMaxHp * 0.22),
      speed: Number(fastBruteSpeed.toFixed(2)),
      clubDamage: Math.max(6, bruteDamage - 1),
      coinReward: Math.round(bruteCoins * 0.8),
    },
    {
      z: -Math.round(siegeColumnSpan * 0.56),
      name: bruteName,
      maxHp: Math.round(bruteMaxHp * 0.36),
      speed: Number(Math.min(4.35, fastBruteSpeed + 0.14).toFixed(2)),
      clubDamage: bruteDamage,
      coinReward: bruteCoins,
    },
    {
      z: -Math.round(siegeColumnSpan * 0.82),
      name: `${bruteName} Prime`,
      maxHp: Math.round(bruteMaxHp * 0.50),
      speed: Number(Math.min(4.45, fastBruteSpeed + 0.26).toFixed(2)),
      clubDamage: bruteDamage + 2,
      coinReward: bruteCoins * 1.25 ? Math.round(bruteCoins * 1.25) : bruteCoins,
    },
  ];

  return {
    siegeColumnSpan,
    marchSpeed: Number(marchSpeed.toFixed(2)),
    dividerStartZ: 8.2,
    dividerLength: 108,
    leftQueue,
    rightEchelons,
    goliathSpawns,
  };
}

/**
 * Builds a 400%-longer (`1,120m..1,368m`), +50%-harder 4-Act Bridge Sector (and populates
 * `splitCauseway` as well when `seed.boardLayout === 'SPLIT_CAUSEWAY'`).
 */
function buildMarathonSector(seed: MarathonSectorSeed): StageDefinition {
  const d = DIFFICULTY_MULTIPLIER_V6;
  const actSpan = seed.baseSpan;
  const trackLength = Math.round(actSpan * BOARD_LENGTH_MULTIPLIER_V6);

  const supplyDrums: SupplyDrumDefinition[] = [];
  const gatePairs: GatePairDefinition[] = [];
  const tireStacks: TireStackDefinition[] = [];
  const enemyWaves: EnemyWaveDefinition[] = [];

  const laneCycle: ReadonlyArray<'LEFT' | 'CENTER' | 'RIGHT'> = ['CENTER', 'LEFT', 'RIGHT', 'CENTER'];

  for (let act = 0; act < 4; act++) {
    const actBaseZ = -act * actSpan;
    const actMul = 1 + act * 0.52;
    const s = seed.hpScale * d * actMul;
    const k = seed.gateK * d * (1 + act * 0.38);

    const earlyWeapon = Math.min(5, 2 + Math.floor((seed.stageNumber - 1) / 3) + Math.floor(act / 2)) as WeaponTierId;
    const midWeapon = Math.min(5, earlyWeapon + 1) as WeaponTierId;
    const lateWeapon = Math.min(5, midWeapon + (act >= 1 ? 1 : 0)) as WeaponTierId;

    // 3 V-Trio Supply Drum Formations per Act (12 formations = 36 drums total across 400% bridge!)
    const centerFirstHp = act === 0 && seed.stageNumber === 1 ? 48 : Math.round(78 * s);
    supplyDrums.push(
      ...drumV3(
        actBaseZ - 17.5,
        155 * s,
        centerFirstHp,
        175 * s,
        { type: 'WEAPON', val: earlyWeapon },
        { type: 'COINS', val: Math.round((28 + seed.stageNumber * 12) * (1 + act * 0.3)) },
        { type: 'RECRUIT', val: 2 + Math.floor(act / 2) }
      ),
      ...drumV3(
        actBaseZ - Math.round(actSpan * 0.20),
        95 * s,
        255 * s,
        115 * s,
        { type: 'RECRUIT', val: 3 },
        { type: 'COINS', val: Math.round((48 + seed.stageNumber * 18) * (1 + act * 0.35)) },
        { type: 'WEAPON', val: midWeapon }
      ),
      ...drumV3(
        actBaseZ - Math.round(actSpan * 0.73),
        310 * s,
        205 * s,
        355 * s,
        { type: 'COINS', val: Math.round((85 + seed.stageNumber * 28) * (1 + act * 0.4)) },
        { type: 'RECRUIT', val: 4 },
        { type: 'WEAPON', val: lateWeapon }
      )
    );

    // 3 Gate Pairs per Act (12 Gate Pairs total across 400% bridge!)
    const startFrac = Math.max(0.05, Number((0.35 - seed.stageNumber * 0.025 - act * 0.05).toFixed(2)));
    const negVal = seed.negGateBase - act * 4;
    const posVal = seed.posGateBase + Math.floor(act / 2);
    const swapSides = (seed.stageNumber + act) % 2 === 0;

    gatePairs.push(
      {
        z: actBaseZ - Math.round(actSpan * 0.26),
        left: null,
        right: null,
        full: shootMulGate(startFrac, 9 * k),
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.52),
        left: swapSides ? addGate(negVal, 18 * k) : addGate(posVal, 21 * k),
        right: swapSides ? addGate(posVal, 21 * k) : addGate(negVal, 18 * k),
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.88),
        left: swapSides ? shootMulGate(1.1, 34 * k) : shootMulGate(0.1, 26 * k),
        right: swapSides ? shootMulGate(0.1, 26 * k) : shootMulGate(1.1, 34 * k),
      }
    );

    // 2 Three-Lane Tire Barricade Walls per Act (8 Walls = 24 Tire Stacks total!)
    const wLaneA = laneCycle[(seed.stageNumber + act) % 4];
    const wLaneB = laneCycle[(seed.stageNumber + act + 1) % 4];
    const wallHpA = 1050 * s;
    const wallHpB = 1780 * s;

    tireStacks.push(
      ...tireWall3(
        actBaseZ - Math.round(actSpan * 0.44),
        wLaneA === 'LEFT' ? wallHpA : wallHpA * 1.38,
        wLaneA === 'CENTER' ? wallHpA : wallHpA * 1.34,
        wLaneA === 'RIGHT' ? wallHpA : wallHpA * 1.42,
        wLaneA,
        midWeapon,
        Math.round((95 + seed.stageNumber * 28) * (1 + act * 0.3))
      ),
      ...tireWall3(
        actBaseZ - Math.round(actSpan * 0.65),
        wLaneB === 'LEFT' ? wallHpB : wallHpB * 1.18,
        wLaneB === 'CENTER' ? wallHpB : wallHpB * 1.15,
        wLaneB === 'RIGHT' ? wallHpB : wallHpB * 1.22,
        wLaneB,
        lateWeapon,
        Math.round((135 + seed.stageNumber * 38) * (1 + act * 0.35))
      )
    );

    // 4 Mixed 3-Rank Enemy Waves per Act (16 Waves total across 400% bridge!)
    const waveSpeed = Math.min(2.65, seed.enemyBaseSpeed + act * 0.10);
    const waveHp = seed.enemyBaseHp * d * actMul;
    enemyWaves.push(
      {
        z: actBaseZ - Math.round(actSpan * 0.13),
        lane: 'CENTER',
        count: Math.min(48, 28 + seed.stageNumber + act * 3),
        hpPerEnemy: Math.max(6, Math.round(waveHp * 0.72)),
        heavyCount: Math.min(12, 3 + Math.floor(seed.stageNumber / 2) + act),
        vanguardRatio: 0.40,
        speed: Number(waveSpeed.toFixed(2)),
        coinPerKill: seed.coinBase + act,
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.35),
        lane: 'CENTER',
        count: Math.min(50, 35 + seed.stageNumber + act * 3),
        hpPerEnemy: Math.max(9, Math.round(waveHp * 1.15)),
        heavyCount: Math.min(13, 5 + Math.floor(seed.stageNumber / 2) + act),
        vanguardRatio: 0.34,
        speed: Number((waveSpeed + 0.10).toFixed(2)),
        coinPerKill: seed.coinBase + act + 1,
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.81),
        lane: 'CENTER',
        count: Math.min(52, 41 + Math.floor(seed.stageNumber / 2) + act * 2),
        hpPerEnemy: Math.max(14, Math.round(waveHp * 1.75)),
        heavyCount: Math.min(14, 7 + Math.floor(seed.stageNumber / 2) + act),
        vanguardRatio: 0.28,
        speed: Number((waveSpeed + 0.18).toFixed(2)),
        coinPerKill: seed.coinBase + act + 2,
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.94),
        lane: 'CENTER',
        count: Math.min(52, 45 + Math.floor(seed.stageNumber / 2) + act * 2),
        hpPerEnemy: Math.max(18, Math.round(waveHp * 2.05)),
        heavyCount: Math.min(15, 8 + Math.floor(seed.stageNumber / 2) + act),
        vanguardRatio: 0.25,
        speed: Number((waveSpeed + 0.24).toFixed(2)),
        coinPerKill: seed.coinBase + act + 2,
      }
    );
  }

  const primaryBrute: MidBridgeBruteDefinition = {
    z: -Math.round(actSpan * 1.60),
    name: seed.bruteName,
    maxHp: seed.bruteMaxHp,
    speed: seed.bruteSpeed,
    clubDamage: seed.bruteDamage,
    coinReward: seed.bruteCoins,
  };

  const midBrutes: MidBridgeBruteDefinition[] = [
    {
      z: -Math.round(actSpan * 0.60),
      name: `${seed.bruteName} Vanguard`,
      maxHp: Math.round(seed.bruteMaxHp * 0.68),
      speed: Math.max(1.75, seed.bruteSpeed - 0.05),
      clubDamage: Math.max(6, seed.bruteDamage - 1),
      coinReward: Math.round(seed.bruteCoins * 0.75),
    },
    primaryBrute,
    {
      z: -Math.round(actSpan * 3.60),
      name: `${seed.bruteName} Warden`,
      maxHp: Math.round(seed.bruteMaxHp * 1.24),
      speed: Math.min(2.35, seed.bruteSpeed + 0.08),
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
 * 10 Escalating Bridge Blitz v6.0 Sectors (400% Longer & +50% Harder):
 * - Odd Sectors (1, 3, 5, 7, 9): 1,120m..1,344m Marathon Bridge Assaults
 * - Even Sectors (2, 4, 6, 8, 10): Split Causeway Tactical Sieges (Left Barrel+Gate Queue | Right 3-Rank Army)
 */
export const CAMPAIGN_STAGES: ReadonlyArray<StageDefinition> = [
  buildMarathonSector({
    stageNumber: 1,
    title: 'Golden Span Outpost',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 280,
    hpScale: 1.0,
    gateK: 1.0,
    negGateBase: -18,
    posGateBase: 4,
    enemyBaseHp: 7.5,
    enemyBaseSpeed: 1.82,
    coinBase: 3,
    bruteName: 'Riot Goliath',
    bruteMaxHp: 16800,
    bruteSpeed: 1.85,
    bruteDamage: 8,
    bruteCoins: 280,
    boss: {
      name: 'Iron Warden Mk-I',
      chassis: 'WARDEN_MECH',
      primaryHex: 0x485669,
      accentHex: 0xd93046,
      trimHex: 0xf5b42e,
      maxHp: 18750,
      segments: 5,
      advanceSpeed: 1.24,
      salvoLanes: 1,
      salvoInterval: 2.30,
      salvoDamage: 7,
      rewardCoins: 360,
    },
  }),
  buildMarathonSector({
    stageNumber: 2,
    title: 'Bastion Split Causeway',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 288,
    hpScale: 1.32,
    gateK: 1.25,
    negGateBase: -20,
    posGateBase: 4,
    enemyBaseHp: 10.5,
    enemyBaseSpeed: 1.90,
    coinBase: 4,
    bruteName: 'Breaker Goliath',
    bruteMaxHp: 20250,
    bruteSpeed: 1.90,
    bruteDamage: 9,
    bruteCoins: 360,
    boss: {
      name: 'Bastion Enforcer',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x434d3e,
      accentHex: 0xd9822b,
      trimHex: 0xf7d154,
      maxHp: 25500,
      segments: 5,
      advanceSpeed: 1.28,
      salvoLanes: 1,
      salvoInterval: 2.22,
      salvoDamage: 8,
      rewardCoins: 460,
    },
  }),
  buildMarathonSector({
    stageNumber: 3,
    title: 'Crimson Viaduct Marathon',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 296,
    hpScale: 1.68,
    gateK: 1.55,
    negGateBase: -22,
    posGateBase: 5,
    enemyBaseHp: 14,
    enemyBaseSpeed: 1.96,
    coinBase: 5,
    bruteName: 'Crimson Goliath',
    bruteMaxHp: 22200,
    bruteSpeed: 1.94,
    bruteDamage: 9,
    bruteCoins: 440,
    boss: {
      name: 'Crimson Juggernaut',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x7a1c28,
      accentHex: 0x242b35,
      trimHex: 0xffb627,
      maxHp: 33750,
      segments: 6,
      advanceSpeed: 1.32,
      salvoLanes: 1,
      salvoInterval: 2.16,
      salvoDamage: 8,
      rewardCoins: 580,
    },
  }),
  buildMarathonSector({
    stageNumber: 4,
    title: 'Iron Divide Causeway',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 304,
    hpScale: 2.12,
    gateK: 1.88,
    negGateBase: -24,
    posGateBase: 5,
    enemyBaseHp: 18.5,
    enemyBaseSpeed: 2.02,
    coinBase: 6,
    bruteName: 'Ironclad Goliath',
    bruteMaxHp: 24300,
    bruteSpeed: 1.98,
    bruteDamage: 10,
    bruteCoins: 540,
    boss: {
      name: 'Vulcan Siege Mech',
      chassis: 'WARDEN_MECH',
      primaryHex: 0x2b3440,
      accentHex: 0xe66c1f,
      trimHex: 0xffd15c,
      maxHp: 42750,
      segments: 6,
      advanceSpeed: 1.35,
      salvoLanes: 1,
      salvoInterval: 2.10,
      salvoDamage: 9,
      rewardCoins: 720,
    },
  }),
  buildMarathonSector({
    stageNumber: 5,
    title: 'Stormsurge Suspension',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 312,
    hpScale: 2.65,
    gateK: 2.25,
    negGateBase: -26,
    posGateBase: 5,
    enemyBaseHp: 24,
    enemyBaseSpeed: 2.08,
    coinBase: 7,
    bruteName: 'Storm Goliath',
    bruteMaxHp: 26250,
    bruteSpeed: 2.02,
    bruteDamage: 10,
    bruteCoins: 660,
    boss: {
      name: 'Tempest Goliath',
      chassis: 'KRAKEN_WALKER',
      primaryHex: 0x26384a,
      accentHex: 0x2dc7ff,
      trimHex: 0xf5b82e,
      maxHp: 53250,
      segments: 7,
      advanceSpeed: 1.38,
      salvoLanes: 2,
      salvoInterval: 2.22,
      salvoDamage: 9,
      rewardCoins: 900,
    },
  }),
  buildMarathonSector({
    stageNumber: 6,
    title: 'Twin-Wall Overwatch',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 318,
    hpScale: 3.25,
    gateK: 2.68,
    negGateBase: -28,
    posGateBase: 6,
    enemyBaseHp: 31,
    enemyBaseSpeed: 2.12,
    coinBase: 8,
    bruteName: 'Overwatch Goliath',
    bruteMaxHp: 31500,
    bruteSpeed: 2.05,
    bruteDamage: 11,
    bruteCoins: 800,
    boss: {
      name: 'Aegis Dreadnought',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x2c394b,
      accentHex: 0xd9384a,
      trimHex: 0x48e5ff,
      maxHp: 64500,
      segments: 7,
      advanceSpeed: 1.40,
      salvoLanes: 2,
      salvoInterval: 2.16,
      salvoDamage: 10,
      rewardCoins: 1120,
    },
  }),
  buildMarathonSector({
    stageNumber: 7,
    title: 'Cobalt Strait Crossing',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 324,
    hpScale: 3.95,
    gateK: 3.15,
    negGateBase: -30,
    posGateBase: 6,
    enemyBaseHp: 39,
    enemyBaseSpeed: 2.16,
    coinBase: 10,
    bruteName: 'Cobalt Goliath',
    bruteMaxHp: 36750,
    bruteSpeed: 2.08,
    bruteDamage: 11,
    bruteCoins: 960,
    boss: {
      name: 'Kraken Command Rig',
      chassis: 'KRAKEN_WALKER',
      primaryHex: 0x1d2636,
      accentHex: 0xe82c4f,
      trimHex: 0x38f6ff,
      maxHp: 76500,
      segments: 8,
      advanceSpeed: 1.42,
      salvoLanes: 2,
      salvoInterval: 2.10,
      salvoDamage: 10,
      rewardCoins: 1380,
    },
  }),
  buildMarathonSector({
    stageNumber: 8,
    title: 'Obsidian Bulwark Causeway',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 330,
    hpScale: 4.75,
    gateK: 3.68,
    negGateBase: -32,
    posGateBase: 6,
    enemyBaseHp: 48,
    enemyBaseSpeed: 2.20,
    coinBase: 12,
    bruteName: 'Obsidian Goliath',
    bruteMaxHp: 42000,
    bruteSpeed: 2.10,
    bruteDamage: 12,
    bruteCoins: 1140,
    boss: {
      name: 'Obsidian Titan',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x1d2028,
      accentHex: 0xd92638,
      trimHex: 0xffa62b,
      maxHp: 88500,
      segments: 8,
      advanceSpeed: 1.45,
      salvoLanes: 2,
      salvoInterval: 2.04,
      salvoDamage: 11,
      rewardCoins: 1700,
    },
  }),
  buildMarathonSector({
    stageNumber: 9,
    title: 'Plasma Horizon Span',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 336,
    hpScale: 5.65,
    gateK: 4.25,
    negGateBase: -34,
    posGateBase: 7,
    enemyBaseHp: 58,
    enemyBaseSpeed: 2.24,
    coinBase: 14,
    bruteName: 'Horizon Goliath',
    bruteMaxHp: 47250,
    bruteSpeed: 2.12,
    bruteDamage: 13,
    bruteCoins: 1360,
    boss: {
      name: 'Hyperion Warlord',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x263248,
      accentHex: 0x36f3ff,
      trimHex: 0xffc845,
      maxHp: 100500,
      segments: 9,
      advanceSpeed: 1.48,
      salvoLanes: 2,
      salvoInterval: 1.98,
      salvoDamage: 11,
      rewardCoins: 2050,
    },
  }),
  buildMarathonSector({
    stageNumber: 10,
    title: 'Omega Citadel Causeway',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 342,
    hpScale: 6.75,
    gateK: 4.90,
    negGateBase: -36,
    posGateBase: 7,
    enemyBaseHp: 70,
    enemyBaseSpeed: 2.28,
    coinBase: 17,
    bruteName: 'Omega Goliath',
    bruteMaxHp: 52500,
    bruteSpeed: 2.15,
    bruteDamage: 14,
    bruteCoins: 1650,
    boss: {
      name: 'Apex Sovereign Mech',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x462440,
      accentHex: 0xf5b82e,
      trimHex: 0x38f6ff,
      maxHp: 114000,
      segments: 10,
      advanceSpeed: 1.52,
      salvoLanes: 2,
      salvoInterval: 1.92,
      salvoDamage: 12,
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
  { chassis: 'WARDEN_MECH', label: 'Warden', primaryHex: 0x465468, accentHex: 0xd9384a, trimHex: 0xf5b42e },
  { chassis: 'SIEGE_TANK', label: 'Juggernaut', primaryHex: 0x6e2b3b, accentHex: 0xff8c38, trimHex: 0xffd15c },
  { chassis: 'KRAKEN_WALKER', label: 'Kraken', primaryHex: 0x2c425a, accentHex: 0x36f3ff, trimHex: 0xff4757 },
  { chassis: 'SOVEREIGN_TITAN', label: 'Sovereign', primaryHex: 0x4a2b50, accentHex: 0xf5b82e, trimHex: 0x38f6ff },
];

const SPLIT_CAUSEWAY_TITLES: ReadonlyArray<string> = [
  'Bastion Split Causeway',
  'Iron Divide Bulwark',
  'Sunstone Garrison Wall',
  'Crimson Breach Corridor',
  'Twin-Channel Viaduct',
  'Tempest Shield Causeway',
  'Cobalt Siege Partition',
  'Obsidian Gatehouse',
  'Hyperion Split Span',
  'Omega Citadel Causeway',
];

/**
 * Dedicated Split Causeway Mode generator (`SPLIT_CAUSEWAY` mode on Hub, Stages 1..infinity).
 * Every stage features the fortified Cut-Stone Causeway, Center Ballistic Divider Wall,
 * 28-node Left Barrel+Gate Conveyor Queue, and 22-echelon Right Battalion Siege + Boss Finale!
 */
export function generateSplitCausewayStage(stageNumber: number): StageDefinition {
  const sNum = Math.max(1, Math.floor(stageNumber));
  const scale = Math.pow(1.30, sNum - 1);
  const archetype = ENDLESS_CHASSIS_ROTATION[(sNum - 1) % ENDLESS_CHASSIS_ROTATION.length];
  const titleName = SPLIT_CAUSEWAY_TITLES[(sNum - 1) % SPLIT_CAUSEWAY_TITLES.length];

  return buildMarathonSector({
    stageNumber: sNum,
    title: titleName,
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: Math.min(345, 286 + sNum * 6),
    hpScale: 1.0 * scale,
    gateK: scale,
    negGateBase: -(18 + sNum * 2),
    posGateBase: Math.min(8, 4 + Math.floor(sNum / 2)),
    enemyBaseHp: 7.8 * scale,
    enemyBaseSpeed: Math.min(2.42, 1.92 + sNum * 0.045),
    coinBase: 3 + sNum * 2,
    bruteName: `Causeway-${sNum} Goliath`,
    bruteMaxHp: Math.round(11200 * DIFFICULTY_MULTIPLIER_V6 * Math.pow(1.25, sNum - 1)),
    bruteSpeed: Math.min(2.30, 1.94 + sNum * 0.035),
    bruteDamage: Math.min(15, 7 + Math.floor(sNum / 2)),
    bruteCoins: Math.round(310 * scale),
    boss: {
      name: `Causeway-${sNum} ${archetype.label}`,
      chassis: archetype.chassis,
      primaryHex: archetype.primaryHex,
      accentHex: archetype.accentHex,
      trimHex: archetype.trimHex,
      maxHp: Math.round(15500 * DIFFICULTY_MULTIPLIER_V6 * Math.pow(1.30, sNum - 1)),
      segments: Math.min(10, 5 + Math.floor(sNum / 2)),
      advanceSpeed: Math.min(1.56, 1.28 + sNum * 0.025),
      salvoLanes: sNum >= 3 ? 2 : 1,
      salvoInterval: Math.max(1.85, 2.28 - sNum * 0.05),
      salvoDamage: Math.min(14, 7 + Math.floor(sNum / 2)),
      rewardCoins: Math.round(360 + sNum * 115 * scale),
    },
  });
}

/**
 * Generates deterministic 400%-longer, +50%-harder escalating sectors for Endless Bridge Mode
 * (`1,184m` span per wave), alternating Standard Bridge (odd waves) & Split Causeway (even waves)!
 */
export function generateEndlessWaveStage(waveNumber: number): StageDefinition {
  const w = Math.max(1, Math.floor(waveNumber));
  const scale = Math.pow(1.28, w - 1);
  const archetype = ENDLESS_CHASSIS_ROTATION[(w - 1) % ENDLESS_CHASSIS_ROTATION.length];
  const boardLayout: BoardLayout = w % 2 === 0 ? 'SPLIT_CAUSEWAY' : 'STANDARD_BRIDGE';

  return buildMarathonSector({
    stageNumber: w,
    title: boardLayout === 'SPLIT_CAUSEWAY' ? `Endless Causeway ${w}` : `Endless Sector ${w}`,
    boardLayout,
    baseSpan: 296,
    hpScale: scale,
    gateK: scale,
    negGateBase: -(16 + w * 2),
    posGateBase: Math.min(8, 3 + Math.floor(w / 2)),
    enemyBaseHp: 7.5 * scale,
    enemyBaseSpeed: Math.min(2.38, 1.84 + w * 0.04),
    coinBase: 3 + w * 2,
    bruteName: `Wave-${w} Goliath`,
    bruteMaxHp: Math.round(10200 * DIFFICULTY_MULTIPLIER_V6 * scale),
    bruteSpeed: Math.min(2.22, 1.82 + w * 0.03),
    bruteDamage: Math.min(15, 7 + Math.floor(w / 2)),
    bruteCoins: Math.round(290 * scale),
    boss: {
      name: `Sector-${w} ${archetype.label}`,
      chassis: archetype.chassis,
      primaryHex: archetype.primaryHex,
      accentHex: archetype.accentHex,
      trimHex: archetype.trimHex,
      maxHp: Math.round(13000 * DIFFICULTY_MULTIPLIER_V6 * Math.pow(1.32, w - 1)),
      segments: Math.min(10, 5 + Math.floor(w / 2)),
      advanceSpeed: Math.min(1.54, 1.22 + w * 0.025),
      salvoLanes: w >= 4 ? 2 : 1,
      salvoInterval: Math.max(1.88, 2.38 - w * 0.05),
      salvoDamage: Math.min(14, 7 + Math.floor(w / 2)),
      rewardCoins: Math.round(350 + w * 110 * scale),
    },
  });
}
