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

/** Global difficulty baseline multiplier preserved & escalated in v7.0 Punishing Tactical overhaul. */
export const DIFFICULTY_MULTIPLIER_V6 = 1.5;
/** Global marathon viaduct span multiplier (400% full-length tactical viaducts). */
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
      hp: Math.max(18, Math.round(centerHp)),
      rewardType: centerReward.type,
      rewardValue: centerReward.val,
    },
    {
      z: zCenter - 2.6,
      lane: 'LEFT',
      hp: Math.max(20, Math.round(leftHp)),
      rewardType: leftReward.type,
      rewardValue: leftReward.val,
    },
    {
      z: zCenter - 2.6,
      lane: 'RIGHT',
      hp: Math.max(20, Math.round(rightHp)),
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
      breakCount: Math.max(140, Math.round(leftHp)),
      weaponTier: weaponLane === 'LEFT' ? weaponTier : undefined,
      coinReward: weaponLane === 'LEFT' ? undefined : sideCoins,
    },
    {
      z,
      lane: 'CENTER',
      breakCount: Math.max(140, Math.round(centerHp)),
      weaponTier: weaponLane === 'CENTER' ? weaponTier : undefined,
      coinReward: weaponLane === 'CENTER' ? undefined : sideCoins,
    },
    {
      z,
      lane: 'RIGHT',
      breakCount: Math.max(140, Math.round(rightHp)),
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
 * Builds a 28-node Left-Lane `[Hex Ordnance Pod + Holo-Gate / Weapon]` conveyor queue and 22-echelon
 * Right-Lane Syndicate siege battalion + `3` Breacher Siege Goliaths for Split Causeway boards.
 *
 * v7.0 Punishing Tactical Calibration:
 * - Removes the cheap instant `X2` Node #0 handout; players earn incremental `ADD +2` -> `ADD +2` ->
 *   `WEAPON Lv2` -> `MUL 1.5` progression while repelling fast-surging right-lane echelons!
 * - Camping Left wipes out to breaching Raider/Enforcer squads; camping Right wipes out to scaling armor HP!
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
  const siegeColumnSpan = Math.round(326 + (stageIdx - 1) * 9);
  const marchSpeed = Math.min(6.20, Math.max(5.25, enemyBaseSpeed * 2.12 + stageIdx * 0.10));

  // Earned incremental tactical progression across all 28 Left-Lane Ordnance Nodes
  const rewardPattern: ReadonlyArray<SplitNodeReward> = [
    { kind: 'GATE', operator: 'ADD', value: 2 },
    { kind: 'GATE', operator: 'ADD', value: 2 },
    { kind: 'WEAPON', weaponTier: 2 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'GATE', operator: 'ADD', value: 3 },
    { kind: 'WEAPON', weaponTier: 3 },
    { kind: 'COINS', coins: Math.round(80 * hpScale) },
    { kind: 'GATE', operator: 'ADD', value: 3 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'GATE', operator: 'ADD', value: 4 },
    { kind: 'WEAPON', weaponTier: 4 },
    { kind: 'COINS', coins: Math.round(135 * hpScale) },
    { kind: 'GATE', operator: 'ADD', value: 4 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'GATE', operator: 'ADD', value: 5 },
    { kind: 'WEAPON', weaponTier: 5 },
    { kind: 'COINS', coins: Math.round(195 * hpScale) },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'GATE', operator: 'ADD', value: 5 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'COINS', coins: Math.round(260 * hpScale) },
    { kind: 'GATE', operator: 'ADD', value: 6 },
    { kind: 'GATE', operator: 'MUL', value: 1.5 },
    { kind: 'GATE', operator: 'ADD', value: 6 },
    { kind: 'COINS', coins: Math.round(330 * hpScale) },
    { kind: 'GATE', operator: 'MUL', value: 2 },
    { kind: 'GATE', operator: 'ADD', value: 8 },
    { kind: 'GATE', operator: 'MUL', value: 2 },
  ];

  // Calibrated to v7.0 weapon DPS curve so every node demands active left/right tactical windows!
  const baseQueueHps = [
    18, 32, 54, 92, 148, 225, 325, 455, 630, 860, 1160, 1550, 2050, 2680,
    3480, 4480, 5700, 7200, 9000, 11200, 13800, 16900, 20600, 25000, 30200, 36400, 43800, 52500,
  ];

  const leftQueue: SplitBarrelNodeDefinition[] = [];
  for (let i = 0; i < rewardPattern.length; i++) {
    const stageFactor = i === 0 ? Math.pow(hpScale, 0.68) : Math.pow(hpScale, 0.92);
    const barrelHp = Math.max(26, Math.round(baseQueueHps[i] * d * stageFactor));
    leftQueue.push({
      barrelHp,
      reward: rewardPattern[i],
    });
  }

  // 22 fast-surging Right-Lane Syndicate Echelons with tight inter-wave spacing
  const rightEchelons: SplitHordeEchelonDefinition[] = [];
  let cursorZ = 21.5;
  const totalEchelons = 22;
  for (let e = 0; e < totalEchelons; e++) {
    const progress = e / (totalEchelons - 1);
    let rank: EnemyVisualRank = 1;
    if (e === 0 || (e >= 3 && e % 4 === 3)) {
      rank = 0; // Fast Horned Volt-Trim Vanguard Raiders
    } else if (e === 2 || (e >= 6 && e % 4 === 2) || e >= 20) {
      rank = 2; // Towering 1.65x Horned Ironclad Enforcers
    }

    const cols = rank === 2 ? 4 : e === 0 ? 3 : e <= 5 ? 4 : 5;
    const rows = rank === 2 ? 2 : 3;
    const echelonGrowth = 1 + Math.pow(progress, 1.45) * 2.05;
    const rankHpMul =
      rank === 2 ? 1.95 : rank === 0 ? (e === 0 ? 0.68 : 0.85) : 1.00;
    const hpPerUnit = Math.max(
      7,
      Math.round(enemyBaseHp * d * echelonGrowth * rankHpMul)
    );
    const unitSpeed =
      rank === 2 ? marchSpeed * 0.94 : rank === 0 ? marchSpeed * 1.08 : marchSpeed;
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
    });

    const depthSpan = rows * (rank === 2 ? 1.42 : 1.04);
    const gapZ = e === 0 ? 8.6 : 12.2 + (stageIdx - 1) * 0.24;
    cursorZ += depthSpan + gapZ;
  }

  const fastBruteSpeed = Math.min(4.35, Math.max(3.55, bruteSpeed * 1.76));
  const goliathSpawns: MidBridgeBruteDefinition[] = [
    {
      z: -Math.round(siegeColumnSpan * 0.34),
      name: `${bruteName} Alpha`,
      maxHp: Math.round(bruteMaxHp * 0.13),
      speed: Number(fastBruteSpeed.toFixed(2)),
      clubDamage: Math.max(7, bruteDamage - 1),
      coinReward: Math.round(bruteCoins * 0.8),
    },
    {
      z: -Math.round(siegeColumnSpan * 0.64),
      name: bruteName,
      maxHp: Math.round(bruteMaxHp * 0.22),
      speed: Number(Math.min(4.45, fastBruteSpeed + 0.15).toFixed(2)),
      clubDamage: bruteDamage,
      coinReward: bruteCoins,
    },
    {
      z: -Math.round(siegeColumnSpan * 0.88),
      name: `${bruteName} Prime`,
      maxHp: Math.round(bruteMaxHp * 0.30),
      speed: Number(Math.min(4.55, fastBruteSpeed + 0.28).toFixed(2)),
      clubDamage: bruteDamage + 2,
      coinReward: Math.round(bruteCoins * 1.25),
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
 * Builds a 400%-length (`1,120m..1,368m`) Punishing Tactical 4-Act Midnight Storm Viaduct Sector
 * (and populates `splitCauseway` when `seed.boardLayout === 'SPLIT_CAUSEWAY'`).
 */
function buildMarathonSector(seed: MarathonSectorSeed): StageDefinition {
  const d = DIFFICULTY_MULTIPLIER_V6;
  const actSpan = seed.baseSpan;
  const trackLength = Math.round(actSpan * BOARD_LENGTH_MULTIPLIER_V6);

  const supplyDrums: SupplyDrumDefinition[] = [];
  const gatePairs: GatePairDefinition[] = [];
  const tireStacks: TireStackDefinition[] = [];
  const enemyWaves: EnemyWaveDefinition[] = [];

  const offCenterCycle: ReadonlyArray<'LEFT' | 'RIGHT'> = ['LEFT', 'RIGHT'];
  const laneCycle: ReadonlyArray<'LEFT' | 'CENTER' | 'RIGHT'> = ['LEFT', 'RIGHT', 'CENTER', 'LEFT'];

  for (let act = 0; act < 4; act++) {
    const actBaseZ = -act * actSpan;
    const actMul = 1 + act * 0.46;
    const s = seed.hpScale * d * actMul;
    const k = seed.gateK * d * (1 + act * 0.34);

    const earlyWeapon = Math.min(
      5,
      2 + Math.floor((seed.stageNumber - 1) / 3) + Math.floor(act / 2)
    ) as WeaponTierId;
    const midWeapon = Math.min(5, earlyWeapon + 1) as WeaponTierId;
    const lateWeapon = Math.min(5, midWeapon + (act >= 1 ? 1 : 0)) as WeaponTierId;

    // 3 V-Trio Hex Ordnance Pod Formations per Act (12 formations = 36 pods total!)
    // Act 0 removes the cheap -17.5m weapon drop & places a heavy center pod so AFK center-camping crashes!
    if (act === 0) {
      supplyDrums.push(
        ...drumV3(
          actBaseZ - 17.5,
          36 * seed.hpScale,
          96 * s,
          34 * seed.hpScale,
          { type: 'RECRUIT', val: 1 },
          { type: 'COINS', val: Math.round(32 + seed.stageNumber * 12) },
          { type: 'RECRUIT', val: 2 }
        ),
        ...drumV3(
          actBaseZ - Math.round(actSpan * 0.16),
          54 * s,
          295 * s,
          56 * s,
          { type: 'RECRUIT', val: 2 },
          { type: 'COINS', val: Math.round(52 + seed.stageNumber * 18) },
          { type: 'WEAPON', val: earlyWeapon }
        ),
        ...drumV3(
          actBaseZ - Math.round(actSpan * 0.82),
          195 * s,
          155 * s,
          215 * s,
          { type: 'COINS', val: Math.round(85 + seed.stageNumber * 28) },
          { type: 'RECRUIT', val: 3 },
          { type: 'WEAPON', val: midWeapon }
        )
      );
    } else {
      supplyDrums.push(
        ...drumV3(
          actBaseZ - 17.5,
          120 * s,
          175 * s,
          130 * s,
          { type: 'WEAPON', val: earlyWeapon },
          { type: 'COINS', val: Math.round((32 + seed.stageNumber * 12) * (1 + act * 0.3)) },
          { type: 'RECRUIT', val: 2 + Math.floor(act / 2) }
        ),
        ...drumV3(
          actBaseZ - Math.round(actSpan * 0.16),
          110 * s,
          285 * s,
          125 * s,
          { type: 'RECRUIT', val: 3 },
          { type: 'COINS', val: Math.round((52 + seed.stageNumber * 18) * (1 + act * 0.35)) },
          { type: 'WEAPON', val: midWeapon }
        ),
        ...drumV3(
          actBaseZ - Math.round(actSpan * 0.82),
          240 * s,
          185 * s,
          265 * s,
          { type: 'COINS', val: Math.round((88 + seed.stageNumber * 28) * (1 + act * 0.4)) },
          { type: 'RECRUIT', val: 4 },
          { type: 'WEAPON', val: lateWeapon }
        )
      );
    }

    // 3 Hex Holo-Gate Pairs per Act (12 Gate Pairs total, cleanly separated from Ordnance Pods!)
    const startFrac = Math.max(
      0.05,
      Number((0.22 - (seed.stageNumber - 1) * 0.02 - act * 0.04).toFixed(2))
    );
    const negVal = seed.negGateBase - act * 5;
    const posVal = seed.posGateBase + Math.floor(act / 2);
    const swapSides = (seed.stageNumber + act) % 2 === 0;

    gatePairs.push(
      {
        z: actBaseZ - Math.round(actSpan * 0.27),
        left: null,
        right: null,
        full: shootMulGate(startFrac, 7.2 * k),
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.55),
        left: swapSides ? addGate(negVal, 16 * k) : addGate(posVal, 18 * k),
        right: swapSides ? addGate(posVal, 18 * k) : addGate(negVal, 16 * k),
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.92),
        left: swapSides ? shootMulGate(1.0, 28 * k) : shootMulGate(0.1, 22 * k),
        right: swapSides ? shootMulGate(0.1, 22 * k) : shootMulGate(1.0, 28 * k),
      }
    );

    // 2 Three-Lane Modular Hex-Chevron Blast Barricades per Act (8 Walls = 24 Barricades total!)
    const wLaneA =
      act === 0
        ? offCenterCycle[seed.stageNumber % 2]
        : laneCycle[(seed.stageNumber + act) % 4];
    const wLaneB = laneCycle[(seed.stageNumber + act + 1) % 4];
    const wallHpA = (act === 0 ? 235 : 495) * s;
    const wallHpB = (act === 0 ? 430 : 660) * s;

    tireStacks.push(
      ...tireWall3(
        actBaseZ - Math.round(actSpan * 0.47),
        wLaneA === 'LEFT' ? wallHpA : wallHpA * 1.48,
        wLaneA === 'CENTER' ? wallHpA : wallHpA * 1.52,
        wLaneA === 'RIGHT' ? wallHpA : wallHpA * 1.48,
        wLaneA,
        midWeapon,
        Math.round((95 + seed.stageNumber * 28) * (1 + act * 0.3))
      ),
      ...tireWall3(
        actBaseZ - Math.round(actSpan * 0.75),
        wLaneB === 'LEFT' ? wallHpB : wallHpB * 1.28,
        wLaneB === 'CENTER' ? wallHpB : wallHpB * 1.32,
        wLaneB === 'RIGHT' ? wallHpB : wallHpB * 1.28,
        wLaneB,
        lateWeapon,
        Math.round((135 + seed.stageNumber * 38) * (1 + act * 0.35))
      )
    );

    // 4 Mixed 3-Rank Horned Syndicate Mech Waves per Act (16 Waves total, waking at 46m!)
    const waveSpeed = Math.min(3.25, seed.enemyBaseSpeed + act * 0.14);
    const waveHp = seed.enemyBaseHp * d * actMul;
    enemyWaves.push(
      {
        z: actBaseZ - Math.round(actSpan * 0.37),
        lane: 'CENTER',
        count: Math.min(48, 26 + seed.stageNumber + act * 3),
        hpPerEnemy: Math.max(6, Math.round(waveHp * 0.72)),
        heavyCount: Math.min(12, 3 + Math.floor(seed.stageNumber / 2) + act),
        vanguardRatio: 0.40,
        speed: Number(waveSpeed.toFixed(2)),
        coinPerKill: seed.coinBase + act,
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.62),
        lane: 'CENTER',
        count: Math.min(50, 32 + seed.stageNumber + act * 3),
        hpPerEnemy: Math.max(9, Math.round(waveHp * 1.02)),
        heavyCount: Math.min(13, 5 + Math.floor(seed.stageNumber / 2) + act),
        vanguardRatio: 0.35,
        speed: Number((waveSpeed + 0.12).toFixed(2)),
        coinPerKill: seed.coinBase + act + 1,
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.87),
        lane: 'CENTER',
        count: Math.min(52, 39 + Math.floor(seed.stageNumber / 2) + act * 2),
        hpPerEnemy: Math.max(13, Math.round(waveHp * 1.42)),
        heavyCount: Math.min(14, 6 + Math.floor(seed.stageNumber / 2) + act),
        vanguardRatio: 0.30,
        speed: Number((waveSpeed + 0.20).toFixed(2)),
        coinPerKill: seed.coinBase + act + 2,
      },
      {
        z: actBaseZ - Math.round(actSpan * 0.97),
        lane: 'CENTER',
        count: Math.min(52, 43 + Math.floor(seed.stageNumber / 2) + act * 2),
        hpPerEnemy: Math.max(16, Math.round(waveHp * 1.68)),
        heavyCount: Math.min(15, 7 + Math.floor(seed.stageNumber / 2) + act),
        vanguardRatio: 0.28,
        speed: Number((waveSpeed + 0.26).toFixed(2)),
        coinPerKill: seed.coinBase + act + 2,
      }
    );
  }

  const primaryBrute: MidBridgeBruteDefinition = {
    z: -Math.round(actSpan * 1.64),
    name: seed.bruteName,
    maxHp: seed.bruteMaxHp,
    speed: seed.bruteSpeed,
    clubDamage: seed.bruteDamage,
    coinReward: seed.bruteCoins,
  };

  const midBrutes: MidBridgeBruteDefinition[] = [
    {
      z: -Math.round(actSpan * 0.64),
      name: `${seed.bruteName} Vanguard`,
      maxHp: Math.round(seed.bruteMaxHp * 0.30),
      speed: Math.max(1.92, seed.bruteSpeed - 0.04),
      clubDamage: Math.max(7, seed.bruteDamage - 1),
      coinReward: Math.round(seed.bruteCoins * 0.75),
    },
    primaryBrute,
    {
      z: -Math.round(actSpan * 3.64),
      name: `${seed.bruteName} Warden`,
      maxHp: Math.round(seed.bruteMaxHp * 1.12),
      speed: Math.min(2.65, seed.bruteSpeed + 0.12),
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
 * 10 Escalating Bridge Blitz v7.0 Sectors — Midnight Storm Viaduct & Punishing Tactical Overhaul:
 * - Odd Sectors (1, 3, 5, 7, 9): 1,120m..1,344m Armored Midnight Viaduct Assaults
 * - Even Sectors (2, 4, 6, 8, 10): Split Causeway Tactical Sieges (2-Lane Boss Salvos from Sector 2+!)
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
    enemyBaseHp: 6.8,
    enemyBaseSpeed: 2.38,
    coinBase: 3,
    bruteName: 'Siege Goliath',
    bruteMaxHp: 10800,
    bruteSpeed: 2.04,
    bruteDamage: 9,
    bruteCoins: 280,
    boss: {
      name: 'Obsidian Warden Mk-I',
      chassis: 'WARDEN_MECH',
      primaryHex: 0x243448,
      accentHex: 0xe62454,
      trimHex: 0x28f8dc,
      maxHp: 19500,
      segments: 5,
      advanceSpeed: 1.38,
      salvoLanes: 1,
      salvoInterval: 1.82,
      salvoDamage: 8,
      rewardCoins: 360,
    },
  }),
  buildMarathonSector({
    stageNumber: 2,
    title: 'Stormwall Split Causeway',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 288,
    hpScale: 1.32,
    gateK: 1.25,
    negGateBase: -26,
    posGateBase: 2,
    enemyBaseHp: 9.2,
    enemyBaseSpeed: 2.46,
    coinBase: 4,
    bruteName: 'Breacher Goliath',
    bruteMaxHp: 15600,
    bruteSpeed: 2.10,
    bruteDamage: 10,
    bruteCoins: 360,
    boss: {
      name: 'Stormwall Enforcer',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x1e2d3e,
      accentHex: 0xff3b5c,
      trimHex: 0x28f8dc,
      maxHp: 26500,
      segments: 5,
      advanceSpeed: 1.42,
      salvoLanes: 2,
      salvoInterval: 1.78,
      salvoDamage: 9,
      rewardCoins: 460,
    },
  }),
  buildMarathonSector({
    stageNumber: 3,
    title: 'Obsidian Truss Marathon',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 296,
    hpScale: 1.68,
    gateK: 1.55,
    negGateBase: -28,
    posGateBase: 3,
    enemyBaseHp: 12.5,
    enemyBaseSpeed: 2.54,
    coinBase: 5,
    bruteName: 'Crimson Goliath',
    bruteMaxHp: 18800,
    bruteSpeed: 2.16,
    bruteDamage: 10,
    bruteCoins: 440,
    boss: {
      name: 'Crimson Juggernaut',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x5c1428,
      accentHex: 0x1c2736,
      trimHex: 0xffb830,
      maxHp: 35000,
      segments: 6,
      advanceSpeed: 1.45,
      salvoLanes: 2,
      salvoInterval: 1.72,
      salvoDamage: 9,
      rewardCoins: 580,
    },
  }),
  buildMarathonSector({
    stageNumber: 4,
    title: 'Thunderhead Divide',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 304,
    hpScale: 2.12,
    gateK: 1.88,
    negGateBase: -30,
    posGateBase: 3,
    enemyBaseHp: 16.5,
    enemyBaseSpeed: 2.62,
    coinBase: 6,
    bruteName: 'Ironclad Goliath',
    bruteMaxHp: 22400,
    bruteSpeed: 2.22,
    bruteDamage: 11,
    bruteCoins: 540,
    boss: {
      name: 'Volt-Core Siege Mech',
      chassis: 'WARDEN_MECH',
      primaryHex: 0x1e2838,
      accentHex: 0xff2e58,
      trimHex: 0xffc938,
      maxHp: 45000,
      segments: 6,
      advanceSpeed: 1.48,
      salvoLanes: 2,
      salvoInterval: 1.66,
      salvoDamage: 10,
      rewardCoins: 720,
    },
  }),
  buildMarathonSector({
    stageNumber: 5,
    title: 'Tempest Cable Viaduct',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 312,
    hpScale: 2.65,
    gateK: 2.25,
    negGateBase: -32,
    posGateBase: 3,
    enemyBaseHp: 21.5,
    enemyBaseSpeed: 2.70,
    coinBase: 7,
    bruteName: 'Tempest Goliath',
    bruteMaxHp: 26500,
    bruteSpeed: 2.28,
    bruteDamage: 11,
    bruteCoins: 660,
    boss: {
      name: 'Tempest Arachnid',
      chassis: 'KRAKEN_WALKER',
      primaryHex: 0x1a2c42,
      accentHex: 0x28f8dc,
      trimHex: 0xff3b5c,
      maxHp: 56500,
      segments: 7,
      advanceSpeed: 1.52,
      salvoLanes: 2,
      salvoInterval: 1.60,
      salvoDamage: 10,
      rewardCoins: 900,
    },
  }),
  buildMarathonSector({
    stageNumber: 6,
    title: 'Twin-Bulkhead Overwatch',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 318,
    hpScale: 3.25,
    gateK: 2.68,
    negGateBase: -34,
    posGateBase: 3,
    enemyBaseHp: 27.5,
    enemyBaseSpeed: 2.78,
    coinBase: 8,
    bruteName: 'Overwatch Goliath',
    bruteMaxHp: 31200,
    bruteSpeed: 2.34,
    bruteDamage: 12,
    bruteCoins: 800,
    boss: {
      name: 'Aegis Dreadnought',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x223246,
      accentHex: 0xe62454,
      trimHex: 0x38f6ff,
      maxHp: 69000,
      segments: 7,
      advanceSpeed: 1.55,
      salvoLanes: 2,
      salvoInterval: 1.54,
      salvoDamage: 11,
      rewardCoins: 1120,
    },
  }),
  buildMarathonSector({
    stageNumber: 7,
    title: 'Abyssal Strait Span',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 324,
    hpScale: 3.95,
    gateK: 3.15,
    negGateBase: -36,
    posGateBase: 4,
    enemyBaseHp: 34.5,
    enemyBaseSpeed: 2.86,
    coinBase: 10,
    bruteName: 'Abyssal Goliath',
    bruteMaxHp: 36500,
    bruteSpeed: 2.38,
    bruteDamage: 12,
    bruteCoins: 960,
    boss: {
      name: 'Kraken Command Rig',
      chassis: 'KRAKEN_WALKER',
      primaryHex: 0x162030,
      accentHex: 0xff2854,
      trimHex: 0x28f8dc,
      maxHp: 83500,
      segments: 8,
      advanceSpeed: 1.58,
      salvoLanes: 2,
      salvoInterval: 1.48,
      salvoDamage: 12,
      rewardCoins: 1380,
    },
  }),
  buildMarathonSector({
    stageNumber: 8,
    title: 'Vortex Partition Causeway',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 330,
    hpScale: 4.75,
    gateK: 3.68,
    negGateBase: -38,
    posGateBase: 4,
    enemyBaseHp: 42.5,
    enemyBaseSpeed: 2.94,
    coinBase: 12,
    bruteName: 'Vortex Goliath',
    bruteMaxHp: 42400,
    bruteSpeed: 2.42,
    bruteDamage: 13,
    bruteCoins: 1140,
    boss: {
      name: 'Obsidian Sovereign',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x181c28,
      accentHex: 0xe62048,
      trimHex: 0xffb830,
      maxHp: 99500,
      segments: 8,
      advanceSpeed: 1.62,
      salvoLanes: 2,
      salvoInterval: 1.42,
      salvoDamage: 13,
      rewardCoins: 1700,
    },
  }),
  buildMarathonSector({
    stageNumber: 9,
    title: 'Plasma Horizon Viaduct',
    boardLayout: 'STANDARD_BRIDGE',
    baseSpan: 336,
    hpScale: 5.65,
    gateK: 4.25,
    negGateBase: -40,
    posGateBase: 4,
    enemyBaseHp: 51.5,
    enemyBaseSpeed: 3.02,
    coinBase: 14,
    bruteName: 'Horizon Goliath',
    bruteMaxHp: 49000,
    bruteSpeed: 2.46,
    bruteDamage: 14,
    bruteCoins: 1360,
    boss: {
      name: 'Hyperion Warlord',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x1e2c42,
      accentHex: 0x28f8dc,
      trimHex: 0xffc845,
      maxHp: 117500,
      segments: 9,
      advanceSpeed: 1.66,
      salvoLanes: 2,
      salvoInterval: 1.35,
      salvoDamage: 14,
      rewardCoins: 2050,
    },
  }),
  buildMarathonSector({
    stageNumber: 10,
    title: 'Omega Stormwall Citadel',
    boardLayout: 'SPLIT_CAUSEWAY',
    baseSpan: 342,
    hpScale: 6.75,
    gateK: 4.90,
    negGateBase: -42,
    posGateBase: 4,
    enemyBaseHp: 62,
    enemyBaseSpeed: 3.10,
    coinBase: 17,
    bruteName: 'Omega Goliath',
    bruteMaxHp: 56500,
    bruteSpeed: 2.50,
    bruteDamage: 15,
    bruteCoins: 1650,
    boss: {
      name: 'Apex Sovereign Mech',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x2c1c38,
      accentHex: 0xff2858,
      trimHex: 0x28f8dc,
      maxHp: 138000,
      segments: 10,
      advanceSpeed: 1.72,
      salvoLanes: 2,
      salvoInterval: 1.28,
      salvoDamage: 15,
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
    negGateBase: -(22 + sNum * 2),
    posGateBase: Math.min(5, 2 + Math.floor(sNum / 3)),
    enemyBaseHp: 7.0 * scale,
    enemyBaseSpeed: Math.min(3.05, 2.38 + sNum * 0.06),
    coinBase: 3 + sNum * 2,
    bruteName: `Causeway-${sNum} Goliath`,
    bruteMaxHp: Math.round(9800 * DIFFICULTY_MULTIPLIER_V6 * Math.pow(1.25, sNum - 1)),
    bruteSpeed: Math.min(2.50, 2.04 + sNum * 0.04),
    bruteDamage: Math.min(16, 8 + Math.floor(sNum / 2)),
    bruteCoins: Math.round(310 * scale),
    boss: {
      name: `Causeway-${sNum} ${archetype.label}`,
      chassis: archetype.chassis,
      primaryHex: archetype.primaryHex,
      accentHex: archetype.accentHex,
      trimHex: archetype.trimHex,
      maxHp: Math.round(14500 * DIFFICULTY_MULTIPLIER_V6 * Math.pow(1.30, sNum - 1)),
      segments: Math.min(10, 5 + Math.floor(sNum / 2)),
      advanceSpeed: Math.min(1.72, 1.38 + sNum * 0.03),
      salvoLanes: sNum >= 2 ? 2 : 1,
      salvoInterval: Math.max(1.26, 1.82 - sNum * 0.05),
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
  const scale = Math.pow(1.28, w - 1);
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
    enemyBaseHp: 6.8 * scale,
    enemyBaseSpeed: Math.min(3.05, 2.36 + w * 0.055),
    coinBase: 3 + w * 2,
    bruteName: `Wave-${w} Goliath`,
    bruteMaxHp: Math.round(9200 * DIFFICULTY_MULTIPLIER_V6 * scale),
    bruteSpeed: Math.min(2.48, 2.02 + w * 0.04),
    bruteDamage: Math.min(16, 8 + Math.floor(w / 2)),
    bruteCoins: Math.round(290 * scale),
    boss: {
      name: `Sector-${w} ${archetype.label}`,
      chassis: archetype.chassis,
      primaryHex: archetype.primaryHex,
      accentHex: archetype.accentHex,
      trimHex: archetype.trimHex,
      maxHp: Math.round(13500 * DIFFICULTY_MULTIPLIER_V6 * Math.pow(1.32, w - 1)),
      segments: Math.min(10, 5 + Math.floor(w / 2)),
      advanceSpeed: Math.min(1.70, 1.36 + w * 0.03),
      salvoLanes: w >= 2 ? 2 : 1,
      salvoInterval: Math.max(1.26, 1.84 - w * 0.05),
      salvoDamage: Math.min(16, 8 + Math.floor(w / 2)),
      rewardCoins: Math.round(350 + w * 110 * scale),
    },
  });
}
