import type {
  BossChassisId,
  GateDefinition,
  GatePairDefinition,
  MidBridgeBruteDefinition,
  StageDefinition,
  SupplyDrumDefinition,
  TireStackDefinition,
  WeaponTierId,
} from './types';

function addGate(initialValue: number, damagePerIncrement: number): GateDefinition {
  return {
    operator: 'ADD',
    initialValue,
    damagePerIncrement,
    isLocked: false,
  };
}

function shootMulGate(initialValue: number, damagePerIncrement: number): GateDefinition {
  return {
    operator: 'MUL',
    initialValue,
    damagePerIncrement,
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
      hp: centerHp,
      rewardType: centerReward.type,
      rewardValue: centerReward.val,
    },
    {
      z: zCenter - 2.6,
      lane: 'LEFT',
      hp: leftHp,
      rewardType: leftReward.type,
      rewardValue: leftReward.val,
    },
    {
      z: zCenter - 2.6,
      lane: 'RIGHT',
      hp: rightHp,
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
      breakCount: leftHp,
      weaponTier: weaponLane === 'LEFT' ? weaponTier : undefined,
      coinReward: weaponLane === 'LEFT' ? undefined : sideCoins,
    },
    {
      z,
      lane: 'CENTER',
      breakCount: centerHp,
      weaponTier: weaponLane === 'CENTER' ? weaponTier : undefined,
      coinReward: weaponLane === 'CENTER' ? undefined : sideCoins,
    },
    {
      z,
      lane: 'RIGHT',
      breakCount: rightHp,
      weaponTier: weaponLane === 'RIGHT' ? weaponTier : undefined,
      coinReward: weaponLane === 'RIGHT' ? undefined : sideCoins,
    },
  ];
}

/**
 * 10 Handcrafted Tactical Bridge Sectors tuned for Bridge Blitz v5.0:
 * - Calibrated for 1..40 commando crowds, shootable < X1.00 red fractional multiplier gates,
 *   ~3x positive-weighted split gates, standing barrel/tire lane obstacles, 30-48 unit mixed swarms,
 *   Mid-Bridge Riot Goliath Brutes (halting march 14m ahead of Tire Wall 2), and Sector-End War Machines.
 */
export const CAMPAIGN_STAGES: ReadonlyArray<StageDefinition> = [
  {
    stageNumber: 1,
    title: 'Golden Span Outpost',
    trackLength: 280,
    supplyDrums: [
      ...drumV3(
        -17.5,
        145,
        36,
        165,
        { type: 'WEAPON', val: 2 },
        { type: 'COINS', val: 28 },
        { type: 'RECRUIT', val: 2 }
      ),
      ...drumV3(
        -53,
        42,
        240,
        78,
        { type: 'WEAPON', val: 2 },
        { type: 'COINS', val: 48 },
        { type: 'RECRUIT', val: 3 }
      ),
      ...drumV3(
        -204,
        290,
        180,
        360,
        { type: 'COINS', val: 85 },
        { type: 'RECRUIT', val: 4 },
        { type: 'WEAPON', val: 4 }
      ),
    ],
    gatePairs: [
      { z: -72, left: null, right: null, full: shootMulGate(0.35, 7.5) },
      { z: -146, left: addGate(4, 22), right: addGate(-18, 18) },
      { z: -246, left: shootMulGate(0.15, 26), right: shootMulGate(1.05, 34) },
    ],
    tireStacks: [
      ...tireWall3(-124, 1450, 980, 1650, 'CENTER', 3, 95),
      ...tireWall3(-182, 1750, 1900, 2000, 'LEFT', 4, 135),
    ],
    enemyWaves: [
      { z: -37, lane: 'CENTER', count: 26, hpPerEnemy: 5.0, heavyCount: 2, speed: 1.75, coinPerKill: 3 },
      { z: -98, lane: 'CENTER', count: 34, hpPerEnemy: 11.5, heavyCount: 5, speed: 1.92, coinPerKill: 3 },
      { z: -226, lane: 'CENTER', count: 40, hpPerEnemy: 22, heavyCount: 7, speed: 2.08, coinPerKill: 4 },
      { z: -264, lane: 'CENTER', count: 44, hpPerEnemy: 25, heavyCount: 8, speed: 2.15, coinPerKill: 4 },
    ],
    midBrute: {
      z: -168,
      name: 'Riot Goliath',
      maxHp: 11200,
      speed: 1.78,
      clubDamage: 6,
      coinReward: 220,
    },
    boss: {
      name: 'Iron Warden Mk-I',
      chassis: 'WARDEN_MECH',
      primaryHex: 0x485669,
      accentHex: 0xd93046,
      trimHex: 0xf5b42e,
      maxHp: 12500,
      segments: 5,
      advanceSpeed: 1.18,
      salvoLanes: 1,
      salvoInterval: 2.45,
      salvoDamage: 5,
      rewardCoins: 260,
    },
  },
  {
    stageNumber: 2,
    title: 'Crosswind Viaduct',
    trackLength: 288,
    supplyDrums: [
      ...drumV3(
        -18,
        260,
        85,
        290,
        { type: 'COINS', val: 45 },
        { type: 'RECRUIT', val: 2 },
        { type: 'WEAPON', val: 2 }
      ),
      ...drumV3(
        -56,
        130,
        310,
        115,
        { type: 'RECRUIT', val: 3 },
        { type: 'COINS', val: 65 },
        { type: 'WEAPON', val: 2 }
      ),
      ...drumV3(
        -210,
        380,
        240,
        420,
        { type: 'WEAPON', val: 4 },
        { type: 'COINS', val: 110 },
        { type: 'RECRUIT', val: 4 }
      ),
    ],
    gatePairs: [
      { z: -74, left: addGate(-16, 12), right: addGate(3, 14) },
      { z: -150, left: null, right: null, full: shootMulGate(0.25, 16) },
      { z: -252, left: shootMulGate(1.1, 38), right: shootMulGate(0.1, 28) },
    ],
    tireStacks: [
      ...tireWall3(-128, 1750, 1550, 1280, 'RIGHT', 3, 125),
      ...tireWall3(-188, 2150, 2450, 2600, 'LEFT', 4, 175),
    ],
    enemyWaves: [
      { z: -38, lane: 'CENTER', count: 30, hpPerEnemy: 8.5, heavyCount: 3, speed: 1.85, coinPerKill: 4 },
      { z: -102, lane: 'CENTER', count: 36, hpPerEnemy: 16, heavyCount: 6, speed: 2.0, coinPerKill: 4 },
      { z: -232, lane: 'CENTER', count: 42, hpPerEnemy: 28, heavyCount: 8, speed: 2.14, coinPerKill: 5 },
      { z: -270, lane: 'CENTER', count: 45, hpPerEnemy: 32, heavyCount: 9, speed: 2.2, coinPerKill: 5 },
    ],
    midBrute: {
      z: -174,
      name: 'Breaker Goliath',
      maxHp: 13500,
      speed: 1.82,
      clubDamage: 7,
      coinReward: 290,
    },
    boss: {
      name: 'Bastion Enforcer',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x434d3e,
      accentHex: 0xd9822b,
      trimHex: 0xf7d154,
      maxHp: 17000,
      segments: 5,
      advanceSpeed: 1.22,
      salvoLanes: 1,
      salvoInterval: 2.38,
      salvoDamage: 6,
      rewardCoins: 340,
    },
  },
  {
    stageNumber: 3,
    title: 'Crimson Causeway',
    trackLength: 296,
    supplyDrums: [
      ...drumV3(
        -18,
        320,
        115,
        350,
        { type: 'WEAPON', val: 2 },
        { type: 'COINS', val: 58 },
        { type: 'RECRUIT', val: 2 }
      ),
      ...drumV3(
        -58,
        165,
        390,
        180,
        { type: 'WEAPON', val: 2 },
        { type: 'COINS', val: 85 },
        { type: 'RECRUIT', val: 3 }
      ),
      ...drumV3(
        -216,
        480,
        320,
        520,
        { type: 'COINS', val: 135 },
        { type: 'RECRUIT', val: 4 },
        { type: 'WEAPON', val: 4 }
      ),
    ],
    gatePairs: [
      { z: -76, left: null, right: null, full: shootMulGate(0.2, 18) },
      { z: -154, left: addGate(-21, 22), right: addGate(5, 25) },
      { z: -258, left: shootMulGate(0.05, 32), right: shootMulGate(1.15, 44) },
    ],
    tireStacks: [
      ...tireWall3(-132, 1650, 2050, 1950, 'LEFT', 3, 155),
      ...tireWall3(-194, 2850, 2450, 2980, 'CENTER', 4, 215),
    ],
    enemyWaves: [
      { z: -39, lane: 'CENTER', count: 32, hpPerEnemy: 12, heavyCount: 4, speed: 1.92, coinPerKill: 5 },
      { z: -106, lane: 'CENTER', count: 38, hpPerEnemy: 21, heavyCount: 6, speed: 2.06, coinPerKill: 5 },
      { z: -238, lane: 'CENTER', count: 44, hpPerEnemy: 35, heavyCount: 8, speed: 2.2, coinPerKill: 6 },
      { z: -278, lane: 'CENTER', count: 46, hpPerEnemy: 40, heavyCount: 9, speed: 2.24, coinPerKill: 6 },
    ],
    midBrute: {
      z: -180,
      name: 'Crimson Goliath',
      maxHp: 14800,
      speed: 1.86,
      clubDamage: 7,
      coinReward: 360,
    },
    boss: {
      name: 'Crimson Juggernaut',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x7a1c28,
      accentHex: 0x242b35,
      trimHex: 0xffb627,
      maxHp: 22500,
      segments: 6,
      advanceSpeed: 1.25,
      salvoLanes: 1,
      salvoInterval: 2.30,
      salvoDamage: 6,
      rewardCoins: 430,
    },
  },
  {
    stageNumber: 4,
    title: 'Steel Truss Gauntlet',
    trackLength: 304,
    supplyDrums: [
      ...drumV3(
        -18,
        390,
        150,
        420,
        { type: 'COINS', val: 72 },
        { type: 'RECRUIT', val: 2 },
        { type: 'COINS', val: 75 }
      ),
      ...drumV3(
        -60,
        220,
        470,
        235,
        { type: 'WEAPON', val: 3 },
        { type: 'COINS', val: 105 },
        { type: 'RECRUIT', val: 3 }
      ),
      ...drumV3(
        -222,
        610,
        410,
        650,
        { type: 'COINS', val: 165 },
        { type: 'WEAPON', val: 4 },
        { type: 'RECRUIT', val: 4 }
      ),
    ],
    gatePairs: [
      { z: -78, left: addGate(4, 24), right: addGate(-22, 20) },
      { z: -158, left: null, right: null, full: shootMulGate(0.15, 24) },
      { z: -264, left: shootMulGate(1.1, 52), right: shootMulGate(0.1, 38) },
    ],
    tireStacks: [
      ...tireWall3(-136, 2450, 1980, 2580, 'CENTER', 3, 190),
      ...tireWall3(-200, 3450, 3300, 2950, 'RIGHT', 4, 260),
    ],
    enemyWaves: [
      { z: -40, lane: 'CENTER', count: 34, hpPerEnemy: 16, heavyCount: 4, speed: 1.98, coinPerKill: 6 },
      { z: -110, lane: 'CENTER', count: 40, hpPerEnemy: 27, heavyCount: 7, speed: 2.12, coinPerKill: 6 },
      { z: -244, lane: 'CENTER', count: 45, hpPerEnemy: 44, heavyCount: 9, speed: 2.24, coinPerKill: 7 },
      { z: -286, lane: 'CENTER', count: 47, hpPerEnemy: 50, heavyCount: 10, speed: 2.28, coinPerKill: 7 },
    ],
    midBrute: {
      z: -186,
      name: 'Ironclad Goliath',
      maxHp: 16200,
      speed: 1.9,
      clubDamage: 8,
      coinReward: 440,
    },
    boss: {
      name: 'Vulcan Siege Mech',
      chassis: 'WARDEN_MECH',
      primaryHex: 0x2b3440,
      accentHex: 0xe66c1f,
      trimHex: 0xffd15c,
      maxHp: 28500,
      segments: 6,
      advanceSpeed: 1.28,
      salvoLanes: 1,
      salvoInterval: 2.22,
      salvoDamage: 7,
      rewardCoins: 540,
    },
  },
  {
    stageNumber: 5,
    title: 'Stormsurge Suspension',
    trackLength: 312,
    supplyDrums: [
      ...drumV3(
        -18,
        470,
        190,
        510,
        { type: 'COINS', val: 90 },
        { type: 'WEAPON', val: 3 },
        { type: 'RECRUIT', val: 2 }
      ),
      ...drumV3(
        -62,
        280,
        560,
        295,
        { type: 'RECRUIT', val: 3 },
        { type: 'COINS', val: 130 },
        { type: 'WEAPON', val: 3 }
      ),
      ...drumV3(
        -228,
        740,
        520,
        790,
        { type: 'RECRUIT', val: 4 },
        { type: 'WEAPON', val: 5 },
        { type: 'COINS', val: 210 }
      ),
    ],
    gatePairs: [
      { z: -80, left: null, right: null, full: shootMulGate(0.15, 28) },
      { z: -162, left: addGate(-24, 28), right: addGate(5, 32) },
      { z: -270, left: addGate(-28, 36), right: shootMulGate(1.15, 58) },
    ],
    tireStacks: [
      ...tireWall3(-140, 2450, 2950, 2850, 'LEFT', 4, 235),
      ...tireWall3(-206, 4150, 3650, 4280, 'CENTER', 5, 320),
    ],
    enemyWaves: [
      { z: -41, lane: 'CENTER', count: 35, hpPerEnemy: 21, heavyCount: 5, speed: 2.02, coinPerKill: 7 },
      { z: -114, lane: 'CENTER', count: 41, hpPerEnemy: 34, heavyCount: 7, speed: 2.16, coinPerKill: 7 },
      { z: -250, lane: 'CENTER', count: 46, hpPerEnemy: 54, heavyCount: 9, speed: 2.28, coinPerKill: 8 },
      { z: -294, lane: 'CENTER', count: 48, hpPerEnemy: 62, heavyCount: 10, speed: 2.32, coinPerKill: 9 },
    ],
    midBrute: {
      z: -192,
      name: 'Storm Goliath',
      maxHp: 17500,
      speed: 1.94,
      clubDamage: 8,
      coinReward: 530,
    },
    boss: {
      name: 'Tempest Goliath',
      chassis: 'KRAKEN_WALKER',
      primaryHex: 0x26384a,
      accentHex: 0x2dc7ff,
      trimHex: 0xf5b82e,
      maxHp: 35500,
      segments: 7,
      advanceSpeed: 1.30,
      salvoLanes: 2,
      salvoInterval: 2.40,
      salvoDamage: 7,
      rewardCoins: 680,
    },
  },
  {
    stageNumber: 6,
    title: 'Twin-Tower Overwatch',
    trackLength: 318,
    supplyDrums: [
      ...drumV3(
        -18,
        560,
        240,
        590,
        { type: 'COINS', val: 115 },
        { type: 'RECRUIT', val: 3 },
        { type: 'WEAPON', val: 3 }
      ),
      ...drumV3(
        -64,
        350,
        680,
        370,
        { type: 'WEAPON', val: 3 },
        { type: 'COINS', val: 160 },
        { type: 'RECRUIT', val: 3 }
      ),
      ...drumV3(
        -234,
        880,
        640,
        920,
        { type: 'COINS', val: 250 },
        { type: 'RECRUIT', val: 4 },
        { type: 'WEAPON', val: 5 }
      ),
    ],
    gatePairs: [
      { z: -82, left: addGate(5, 32), right: addGate(-26, 28) },
      { z: -166, left: null, right: null, full: shootMulGate(0.1, 34) },
      { z: -276, left: shootMulGate(1.15, 66), right: shootMulGate(0.05, 48) },
    ],
    tireStacks: [
      ...tireWall3(-144, 3450, 2950, 3580, 'CENTER', 4, 285),
      ...tireWall3(-212, 4850, 5100, 4350, 'RIGHT', 5, 390),
    ],
    enemyWaves: [
      { z: -42, lane: 'CENTER', count: 36, hpPerEnemy: 27, heavyCount: 5, speed: 2.06, coinPerKill: 8 },
      { z: -118, lane: 'CENTER', count: 42, hpPerEnemy: 42, heavyCount: 8, speed: 2.2, coinPerKill: 9 },
      { z: -256, lane: 'CENTER', count: 46, hpPerEnemy: 66, heavyCount: 10, speed: 2.32, coinPerKill: 10 },
      { z: -300, lane: 'CENTER', count: 48, hpPerEnemy: 75, heavyCount: 11, speed: 2.36, coinPerKill: 11 },
    ],
    midBrute: {
      z: -198,
      name: 'Overwatch Goliath',
      maxHp: 21000,
      speed: 1.96,
      clubDamage: 9,
      coinReward: 640,
    },
    boss: {
      name: 'Aegis Dreadnought',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x2c394b,
      accentHex: 0xd9384a,
      trimHex: 0x48e5ff,
      maxHp: 43000,
      segments: 7,
      advanceSpeed: 1.32,
      salvoLanes: 2,
      salvoInterval: 2.32,
      salvoDamage: 8,
      rewardCoins: 840,
    },
  },
  {
    stageNumber: 7,
    title: 'Cobalt Strait Crossing',
    trackLength: 324,
    supplyDrums: [
      ...drumV3(
        -18,
        660,
        290,
        700,
        { type: 'COINS', val: 140 },
        { type: 'WEAPON', val: 3 },
        { type: 'RECRUIT', val: 3 }
      ),
      ...drumV3(
        -65,
        430,
        810,
        450,
        { type: 'RECRUIT', val: 3 },
        { type: 'COINS', val: 195 },
        { type: 'WEAPON', val: 4 }
      ),
      ...drumV3(
        -238,
        1020,
        760,
        1080,
        { type: 'WEAPON', val: 5 },
        { type: 'RECRUIT', val: 5 },
        { type: 'COINS', val: 310 }
      ),
    ],
    gatePairs: [
      { z: -84, left: null, right: null, full: shootMulGate(0.1, 38) },
      { z: -170, left: addGate(-28, 36), right: addGate(6, 40) },
      { z: -282, left: shootMulGate(0.05, 54), right: shootMulGate(1.2, 74) },
    ],
    tireStacks: [
      ...tireWall3(-148, 3650, 4250, 4100, 'LEFT', 4, 345),
      ...tireWall3(-216, 5650, 4950, 5850, 'CENTER', 5, 470),
    ],
    enemyWaves: [
      { z: -43, lane: 'CENTER', count: 38, hpPerEnemy: 34, heavyCount: 6, speed: 2.1, coinPerKill: 10 },
      { z: -122, lane: 'CENTER', count: 43, hpPerEnemy: 52, heavyCount: 8, speed: 2.24, coinPerKill: 11 },
      { z: -260, lane: 'CENTER', count: 47, hpPerEnemy: 80, heavyCount: 10, speed: 2.36, coinPerKill: 12 },
      { z: -306, lane: 'CENTER', count: 48, hpPerEnemy: 90, heavyCount: 11, speed: 2.4, coinPerKill: 13 },
    ],
    midBrute: {
      z: -202,
      name: 'Cobalt Goliath',
      maxHp: 24500,
      speed: 1.98,
      clubDamage: 9,
      coinReward: 760,
    },
    boss: {
      name: 'Kraken Command Rig',
      chassis: 'KRAKEN_WALKER',
      primaryHex: 0x1d2636,
      accentHex: 0xe82c4f,
      trimHex: 0x38f6ff,
      maxHp: 51000,
      segments: 8,
      advanceSpeed: 1.35,
      salvoLanes: 2,
      salvoInterval: 2.25,
      salvoDamage: 8,
      rewardCoins: 1050,
    },
  },
  {
    stageNumber: 8,
    title: 'Ironclad Skyway',
    trackLength: 330,
    supplyDrums: [
      ...drumV3(
        -18,
        780,
        350,
        820,
        { type: 'COINS', val: 175 },
        { type: 'RECRUIT', val: 3 },
        { type: 'WEAPON', val: 3 }
      ),
      ...drumV3(
        -66,
        520,
        940,
        540,
        { type: 'WEAPON', val: 4 },
        { type: 'COINS', val: 240 },
        { type: 'RECRUIT', val: 4 }
      ),
      ...drumV3(
        -244,
        1180,
        880,
        1220,
        { type: 'RECRUIT', val: 5 },
        { type: 'WEAPON', val: 5 },
        { type: 'COINS', val: 380 }
      ),
    ],
    gatePairs: [
      { z: -85, left: addGate(-30, 42), right: addGate(6, 46) },
      { z: -174, left: null, right: null, full: shootMulGate(0.05, 44) },
      { z: -288, left: shootMulGate(1.2, 82), right: addGate(-32, 58) },
    ],
    tireStacks: [
      ...tireWall3(-152, 4850, 4250, 4980, 'CENTER', 4, 420),
      ...tireWall3(-222, 5750, 6450, 6650, 'LEFT', 5, 560),
    ],
    enemyWaves: [
      { z: -43, lane: 'CENTER', count: 40, hpPerEnemy: 42, heavyCount: 6, speed: 2.14, coinPerKill: 12 },
      { z: -126, lane: 'CENTER', count: 44, hpPerEnemy: 64, heavyCount: 9, speed: 2.28, coinPerKill: 13 },
      { z: -266, lane: 'CENTER', count: 47, hpPerEnemy: 96, heavyCount: 11, speed: 2.4, coinPerKill: 15 },
      { z: -312, lane: 'CENTER', count: 48, hpPerEnemy: 108, heavyCount: 12, speed: 2.44, coinPerKill: 16 },
    ],
    midBrute: {
      z: -208,
      name: 'Obsidian Goliath',
      maxHp: 28000,
      speed: 2.0,
      clubDamage: 10,
      coinReward: 900,
    },
    boss: {
      name: 'Obsidian Titan',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x1d2028,
      accentHex: 0xd92638,
      trimHex: 0xffa62b,
      maxHp: 59000,
      segments: 8,
      advanceSpeed: 1.38,
      salvoLanes: 2,
      salvoInterval: 2.18,
      salvoDamage: 9,
      rewardCoins: 1300,
    },
  },
  {
    stageNumber: 9,
    title: 'Plasma Horizon Span',
    trackLength: 336,
    supplyDrums: [
      ...drumV3(
        -18,
        920,
        420,
        960,
        { type: 'COINS', val: 215 },
        { type: 'WEAPON', val: 4 },
        { type: 'RECRUIT', val: 3 }
      ),
      ...drumV3(
        -68,
        620,
        1080,
        650,
        { type: 'RECRUIT', val: 4 },
        { type: 'COINS', val: 290 },
        { type: 'WEAPON', val: 4 }
      ),
      ...drumV3(
        -248,
        1350,
        1020,
        1420,
        { type: 'COINS', val: 460 },
        { type: 'WEAPON', val: 5 },
        { type: 'RECRUIT', val: 5 }
      ),
    ],
    gatePairs: [
      { z: -86, left: null, right: null, full: shootMulGate(0.05, 50) },
      { z: -178, left: addGate(6, 52), right: addGate(-34, 48) },
      { z: -294, left: shootMulGate(0.05, 64), right: shootMulGate(1.2, 92) },
    ],
    tireStacks: [
      ...tireWall3(-156, 5650, 5850, 4950, 'RIGHT', 5, 510),
      ...tireWall3(-226, 7100, 6450, 7280, 'CENTER', 5, 680),
    ],
    enemyWaves: [
      { z: -44, lane: 'CENTER', count: 42, hpPerEnemy: 50, heavyCount: 7, speed: 2.18, coinPerKill: 14 },
      { z: -130, lane: 'CENTER', count: 45, hpPerEnemy: 76, heavyCount: 9, speed: 2.32, coinPerKill: 16 },
      { z: -272, lane: 'CENTER', count: 48, hpPerEnemy: 112, heavyCount: 11, speed: 2.44, coinPerKill: 18 },
      { z: -318, lane: 'CENTER', count: 48, hpPerEnemy: 126, heavyCount: 12, speed: 2.48, coinPerKill: 19 },
    ],
    midBrute: {
      z: -212,
      name: 'Horizon Goliath',
      maxHp: 31500,
      speed: 2.02,
      clubDamage: 11,
      coinReward: 1080,
    },
    boss: {
      name: 'Hyperion Warlord',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x263248,
      accentHex: 0x36f3ff,
      trimHex: 0xffc845,
      maxHp: 67000,
      segments: 9,
      advanceSpeed: 1.40,
      salvoLanes: 2,
      salvoInterval: 2.12,
      salvoDamage: 9,
      rewardCoins: 1600,
    },
  },
  {
    stageNumber: 10,
    title: 'Omega Citadel Bridge',
    trackLength: 342,
    supplyDrums: [
      ...drumV3(
        -18,
        1080,
        490,
        1120,
        { type: 'COINS', val: 260 },
        { type: 'RECRUIT', val: 4 },
        { type: 'WEAPON', val: 4 }
      ),
      ...drumV3(
        -70,
        740,
        1250,
        780,
        { type: 'WEAPON', val: 4 },
        { type: 'COINS', val: 360 },
        { type: 'RECRUIT', val: 4 }
      ),
      ...drumV3(
        -254,
        1550,
        1180,
        1620,
        { type: 'COINS', val: 560 },
        { type: 'WEAPON', val: 5 },
        { type: 'RECRUIT', val: 6 }
      ),
    ],
    gatePairs: [
      { z: -88, left: null, right: null, full: shootMulGate(0.05, 58) },
      { z: -182, left: addGate(-36, 56), right: addGate(7, 62) },
      { z: -300, left: shootMulGate(1.25, 102), right: shootMulGate(0.05, 72) },
    ],
    tireStacks: [
      ...tireWall3(-160, 5650, 6450, 6350, 'LEFT', 5, 620),
      ...tireWall3(-232, 7800, 7100, 7950, 'CENTER', 5, 820),
    ],
    enemyWaves: [
      { z: -45, lane: 'CENTER', count: 44, hpPerEnemy: 60, heavyCount: 7, speed: 2.22, coinPerKill: 17 },
      { z: -134, lane: 'CENTER', count: 46, hpPerEnemy: 90, heavyCount: 10, speed: 2.36, coinPerKill: 19 },
      { z: -278, lane: 'CENTER', count: 48, hpPerEnemy: 130, heavyCount: 12, speed: 2.48, coinPerKill: 21 },
      { z: -324, lane: 'CENTER', count: 48, hpPerEnemy: 145, heavyCount: 13, speed: 2.52, coinPerKill: 23 },
    ],
    midBrute: {
      z: -218,
      name: 'Omega Goliath',
      maxHp: 35000,
      speed: 2.06,
      clubDamage: 12,
      coinReward: 1300,
    },
    boss: {
      name: 'Apex Sovereign Mech',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x462440,
      accentHex: 0xf5b82e,
      trimHex: 0x38f6ff,
      maxHp: 76000,
      segments: 10,
      advanceSpeed: 1.44,
      salvoLanes: 2,
      salvoInterval: 2.05,
      salvoDamage: 10,
      rewardCoins: 2000,
    },
  },
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

/**
 * Generates deterministic escalating sectors for Endless Bridge Mode (296m span per wave).
 */
export function generateEndlessWaveStage(waveNumber: number): StageDefinition {
  const w = Math.max(1, Math.floor(waveNumber));
  const scale = Math.pow(1.28, w - 1);
  const kScale = Math.round(9 * scale);
  const negBase = -(16 + w * 2);
  const posBase = Math.min(8, 3 + Math.floor(w / 2));

  const tierA = Math.min(5, 2 + Math.floor((w - 1) / 2)) as WeaponTierId;
  const tierB = Math.min(5, 3 + Math.floor(w / 2)) as WeaponTierId;

  const supplyDrums: SupplyDrumDefinition[] = [
    ...drumV3(
      -18,
      Math.round(210 * scale),
      Math.round(64 * scale),
      Math.round(235 * scale),
      { type: 'WEAPON', val: tierA },
      { type: 'COINS', val: Math.round(30 + w * 14) },
      { type: 'RECRUIT', val: 2 }
    ),
    ...drumV3(
      -56,
      Math.round(95 * scale),
      Math.round(270 * scale),
      Math.round(110 * scale),
      { type: 'WEAPON', val: tierA },
      { type: 'COINS', val: Math.round(50 + w * 18) },
      { type: 'RECRUIT', val: 3 }
    ),
    ...drumV3(
      -212,
      Math.round(320 * scale),
      Math.round(195 * scale),
      Math.round(360 * scale),
      { type: 'COINS', val: Math.round(90 + w * 28) },
      { type: 'RECRUIT', val: 4 },
      { type: 'WEAPON', val: tierB }
    ),
  ];

  const startFrac = Math.max(0.05, Number((0.35 - (w - 1) * 0.05).toFixed(2)));
  const gatePairs: GatePairDefinition[] = [
    {
      z: -75,
      left: null,
      right: null,
      full: shootMulGate(startFrac, Math.max(8, kScale)),
    },
    {
      z: -152,
      left: w % 2 === 1 ? addGate(posBase, kScale * 2.2) : addGate(negBase, kScale * 1.9),
      right: w % 2 === 1 ? addGate(negBase, kScale * 1.9) : addGate(posBase, kScale * 2.2),
    },
    {
      z: -254,
      left: w % 2 === 0 ? shootMulGate(1.1, Math.max(24, kScale * 3.2)) : shootMulGate(0.1, Math.max(18, kScale * 2.4)),
      right: w % 2 === 0 ? shootMulGate(0.1, Math.max(18, kScale * 2.4)) : shootMulGate(1.1, Math.max(24, kScale * 3.2)),
    },
  ];

  const laneOrder: ReadonlyArray<'LEFT' | 'CENTER' | 'RIGHT'> = ['CENTER', 'RIGHT', 'LEFT'];
  const laneA = laneOrder[(w - 1) % 3];
  const laneB = laneOrder[w % 3];
  const baseWallA = Math.round(1020 * scale);
  const baseWallB = Math.round(1780 * scale);

  const midBrute: MidBridgeBruteDefinition = {
    z: -176,
    name: `Wave-${w} Goliath`,
    maxHp: Math.round(6800 * scale),
    speed: Math.min(2.12, 1.78 + w * 0.03),
    clubDamage: Math.min(14, 6 + Math.floor(w / 2)),
    coinReward: Math.round(230 * scale),
  };

  const archetype = ENDLESS_CHASSIS_ROTATION[(w - 1) % ENDLESS_CHASSIS_ROTATION.length];

  return {
    stageNumber: w,
    title: `Endless Sector ${w}`,
    trackLength: 296,
    supplyDrums,
    gatePairs,
    tireStacks: [
      ...tireWall3(
        -130,
        laneA === 'LEFT' ? baseWallA : Math.round(baseWallA * 1.42),
        laneA === 'CENTER' ? baseWallA : Math.round(baseWallA * 1.38),
        laneA === 'RIGHT' ? baseWallA : Math.round(baseWallA * 1.46),
        laneA,
        tierA,
        Math.round(95 + w * 28)
      ),
      ...tireWall3(
        -190,
        laneB === 'LEFT' ? baseWallB : Math.round(baseWallB * 1.15),
        laneB === 'CENTER' ? baseWallB : Math.round(baseWallB * 1.18),
        laneB === 'RIGHT' ? baseWallB : Math.round(baseWallB * 1.14),
        laneB,
        tierB,
        Math.round(140 + w * 38)
      ),
    ],
    enemyWaves: [
      {
        z: -38,
        lane: 'CENTER',
        count: Math.min(44, 28 + w * 2),
        hpPerEnemy: Math.round(6 * scale),
        heavyCount: Math.min(8, 2 + Math.floor(w / 2)),
        speed: 1.8 + Math.min(0.65, w * 0.04),
        coinPerKill: 3 + w * 2,
      },
      {
        z: -102,
        lane: 'CENTER',
        count: Math.min(46, 34 + w * 2),
        hpPerEnemy: Math.round(12 * scale),
        heavyCount: Math.min(9, 4 + Math.floor(w / 2)),
        speed: 1.95 + Math.min(0.65, w * 0.04),
        coinPerKill: 4 + w * 2,
      },
      {
        z: -234,
        lane: 'CENTER',
        count: Math.min(48, 40 + w),
        hpPerEnemy: Math.round(23 * scale),
        heavyCount: Math.min(11, 6 + Math.floor(w / 2)),
        speed: 2.1 + Math.min(0.65, w * 0.04),
        coinPerKill: 5 + w * 2,
      },
      {
        z: -274,
        lane: 'CENTER',
        count: Math.min(48, 44 + w),
        hpPerEnemy: Math.round(27 * scale),
        heavyCount: Math.min(12, 7 + Math.floor(w / 2)),
        speed: 2.18 + Math.min(0.65, w * 0.04),
        coinPerKill: 6 + w * 2,
      },
    ],
    midBrute,
    boss: {
      name: `Sector-${w} ${archetype.label}`,
      chassis: archetype.chassis,
      primaryHex: archetype.primaryHex,
      accentHex: archetype.accentHex,
      trimHex: archetype.trimHex,
      maxHp: Math.round(13000 * Math.pow(1.32, w - 1)),
      segments: Math.min(10, 5 + Math.floor(w / 2)),
      advanceSpeed: Math.min(1.52, 1.2 + w * 0.025),
      salvoLanes: w >= 4 ? 2 : 1,
      salvoInterval: Math.max(1.92, 2.42 - w * 0.05),
      salvoDamage: Math.min(12, 5 + Math.floor(w / 2)),
      rewardCoins: Math.round(280 + w * 95 * scale),
    },
  };
}
