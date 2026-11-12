import type {
  BossChassisId,
  GateDefinition,
  GatePairDefinition,
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

function mulGate(factor: number): GateDefinition {
  return {
    operator: 'MUL',
    initialValue: factor,
    damagePerIncrement: 0,
    isLocked: true,
  };
}

function divGate(divisor: number): GateDefinition {
  return {
    operator: 'DIV',
    initialValue: divisor,
    damagePerIncrement: 0,
    isLocked: true,
  };
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
 * 10 Handcrafted Tactical Bridge Sectors tuned for Bridge Blitz v4.0:
 * - Close over-the-shoulder sightlines with opening Supply Drums at z = -17.5m visible right from the Start Screen
 * - Multi-run attrition pacing: high-HP 3-lane Tire Wall checkpoints + Heavy Juggernauts stop under-geared runs
 *   mid-bridge while showering live coins for immediate FIRE RATE / DAMAGE / REVENUE / ADD SOLDIER upgrades
 * - Calibrated for 1..10 elite commandos (5.0 base bullet dmg, 6.5 m/s march speed)
 */
export const CAMPAIGN_STAGES: ReadonlyArray<StageDefinition> = [
  {
    stageNumber: 1,
    title: 'Golden Span Outpost',
    trackLength: 260,
    supplyDrums: [
      { z: -17.5, lane: 'LEFT_MID', hp: 22, rewardType: 'COINS', rewardValue: 22 },
      { z: -17.5, lane: 'RIGHT_MID', hp: 36, rewardType: 'COINS', rewardValue: 30 },
      { z: -74, lane: 'LEFT', hp: 40, rewardType: 'WEAPON', rewardValue: 2 },
      { z: -74, lane: 'CENTER', hp: 30, rewardType: 'COINS', rewardValue: 24 },
      { z: -74, lane: 'RIGHT', hp: 44, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -168, lane: 'LEFT', hp: 92, rewardType: 'COINS', rewardValue: 36 },
      { z: -168, lane: 'CENTER', hp: 115, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -168, lane: 'RIGHT', hp: 96, rewardType: 'COINS', rewardValue: 38 },
    ],
    gatePairs: [
      { z: -53, left: null, right: null, full: shootMulGate(1.0, 11.5) },
      { z: -144, left: addGate(1, 14), right: addGate(-14, 11) },
      { z: -232, left: divGate(2), right: shootMulGate(1.1, 16) },
    ],
    tireStacks: [
      ...tireWall3(-118, 290, 265, 310, 'CENTER', 3, 55),
      ...tireWall3(-212, 440, 520, 355, 'CENTER', 4, 75),
    ],
    enemyWaves: [
      { z: -36, lane: 'CENTER', count: 5, hpPerEnemy: 8.5, heavyCount: 0, speed: 1.65, coinPerKill: 7 },
      { z: -96, lane: 'CENTER', count: 8, hpPerEnemy: 15.5, heavyCount: 2, speed: 1.95, coinPerKill: 8 },
      { z: -190, lane: 'CENTER', count: 12, hpPerEnemy: 22, heavyCount: 3, speed: 2.15, coinPerKill: 8 },
      { z: -246, lane: 'CENTER', count: 14, hpPerEnemy: 24, heavyCount: 4, speed: 2.2, coinPerKill: 9 },
    ],
    boss: {
      name: 'Iron Warden Mk-I',
      chassis: 'WARDEN_MECH',
      primaryHex: 0x384352,
      accentHex: 0xc92a3e,
      trimHex: 0xf5b42e,
      maxHp: 2200,
      segments: 5,
      advanceSpeed: 1.18,
      salvoLanes: 1,
      salvoInterval: 2.45,
      salvoDamage: 2,
      rewardCoins: 120,
    },
  },
  {
    stageNumber: 2,
    title: 'Crosswind Viaduct',
    trackLength: 272,
    supplyDrums: [
      { z: -18, lane: 'LEFT', hp: 46, rewardType: 'COINS', rewardValue: 24 },
      { z: -18, lane: 'CENTER', hp: 34, rewardType: 'COINS', rewardValue: 20 },
      { z: -18, lane: 'RIGHT', hp: 52, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -78, lane: 'LEFT_MID', hp: 72, rewardType: 'COINS', rewardValue: 32 },
      { z: -78, lane: 'RIGHT_MID', hp: 64, rewardType: 'WEAPON', rewardValue: 2 },
      { z: -176, lane: 'LEFT', hp: 145, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -176, lane: 'CENTER', hp: 128, rewardType: 'COINS', rewardValue: 44 },
      { z: -176, lane: 'RIGHT', hp: 155, rewardType: 'WEAPON', rewardValue: 3 },
    ],
    gatePairs: [
      { z: -56, left: addGate(-12, 10), right: addGate(1, 13) },
      { z: -150, left: null, right: null, full: shootMulGate(1.0, 14) },
      { z: -242, left: mulGate(2), right: divGate(2) },
    ],
    tireStacks: [
      ...tireWall3(-124, 340, 290, 260, 'RIGHT', 3, 68),
      ...tireWall3(-220, 560, 680, 740, 'LEFT', 4, 92),
    ],
    enemyWaves: [
      { z: -37, lane: 'CENTER', count: 8, hpPerEnemy: 16, heavyCount: 1, speed: 1.95, coinPerKill: 6 },
      { z: -102, lane: 'RIGHT', count: 10, hpPerEnemy: 22, heavyCount: 2, speed: 2.1, coinPerKill: 7 },
      { z: -198, lane: 'CENTER', count: 14, hpPerEnemy: 28, heavyCount: 3, speed: 2.2, coinPerKill: 8 },
      { z: -256, lane: 'CENTER', count: 16, hpPerEnemy: 32, heavyCount: 4, speed: 2.25, coinPerKill: 9 },
    ],
    boss: {
      name: 'Bastion Enforcer',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x434d3e,
      accentHex: 0xd9822b,
      trimHex: 0xf7d154,
      maxHp: 3500,
      segments: 5,
      advanceSpeed: 1.22,
      salvoLanes: 1,
      salvoInterval: 2.38,
      salvoDamage: 2,
      rewardCoins: 155,
    },
  },
  {
    stageNumber: 3,
    title: 'Crimson Causeway',
    trackLength: 284,
    supplyDrums: [
      { z: -18, lane: 'LEFT_MID', hp: 62, rewardType: 'COINS', rewardValue: 30 },
      { z: -18, lane: 'RIGHT_MID', hp: 78, rewardType: 'WEAPON', rewardValue: 2 },
      { z: -82, lane: 'LEFT', hp: 105, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -82, lane: 'CENTER', hp: 92, rewardType: 'COINS', rewardValue: 38 },
      { z: -82, lane: 'RIGHT', hp: 115, rewardType: 'COINS', rewardValue: 45 },
      { z: -184, lane: 'LEFT_MID', hp: 195, rewardType: 'COINS', rewardValue: 56 },
      { z: -184, lane: 'RIGHT_MID', hp: 215, rewardType: 'RECRUIT', rewardValue: 1 },
    ],
    gatePairs: [
      { z: -58, left: null, right: null, full: shootMulGate(1.0, 16) },
      { z: -156, left: addGate(-18, 15), right: addGate(2, 18) },
      { z: -252, left: divGate(2), right: mulGate(2) },
    ],
    tireStacks: [
      ...tireWall3(-130, 390, 480, 440, 'LEFT', 3, 85),
      ...tireWall3(-228, 920, 780, 980, 'CENTER', 4, 115),
    ],
    enemyWaves: [
      { z: -38, lane: 'CENTER', count: 10, hpPerEnemy: 22, heavyCount: 2, speed: 2.05, coinPerKill: 7 },
      { z: -106, lane: 'CENTER', count: 12, hpPerEnemy: 30, heavyCount: 3, speed: 2.18, coinPerKill: 8 },
      { z: -206, lane: 'LEFT', count: 15, hpPerEnemy: 36, heavyCount: 4, speed: 2.26, coinPerKill: 9 },
      { z: -268, lane: 'CENTER', count: 18, hpPerEnemy: 40, heavyCount: 4, speed: 2.3, coinPerKill: 10 },
    ],
    boss: {
      name: 'Crimson Juggernaut',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x7a1c28,
      accentHex: 0x242b35,
      trimHex: 0xffb627,
      maxHp: 5400,
      segments: 6,
      advanceSpeed: 1.25,
      salvoLanes: 1,
      salvoInterval: 2.30,
      salvoDamage: 2,
      rewardCoins: 195,
    },
  },
  {
    stageNumber: 4,
    title: 'Steel Truss Gauntlet',
    trackLength: 294,
    supplyDrums: [
      { z: -18, lane: 'LEFT', hp: 85, rewardType: 'COINS', rewardValue: 36 },
      { z: -18, lane: 'CENTER', hp: 105, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -18, lane: 'RIGHT', hp: 85, rewardType: 'COINS', rewardValue: 36 },
      { z: -86, lane: 'LEFT_MID', hp: 135, rewardType: 'WEAPON', rewardValue: 3 },
      { z: -86, lane: 'RIGHT_MID', hp: 125, rewardType: 'COINS', rewardValue: 50 },
      { z: -190, lane: 'LEFT', hp: 260, rewardType: 'COINS', rewardValue: 68 },
      { z: -190, lane: 'CENTER', hp: 290, rewardType: 'WEAPON', rewardValue: 4 },
      { z: -190, lane: 'RIGHT', hp: 270, rewardType: 'RECRUIT', rewardValue: 1 },
    ],
    gatePairs: [
      { z: -60, left: addGate(2, 22), right: addGate(-20, 18) },
      { z: -162, left: null, right: null, full: shootMulGate(1.0, 22) },
      { z: -260, left: shootMulGate(1.1, 26), right: divGate(2) },
    ],
    tireStacks: [
      ...tireWall3(-134, 620, 540, 660, 'CENTER', 3, 105),
      ...tireWall3(-236, 1250, 1120, 1020, 'RIGHT', 4, 140),
    ],
    enemyWaves: [
      { z: -39, lane: 'CENTER', count: 11, hpPerEnemy: 30, heavyCount: 2, speed: 2.1, coinPerKill: 8 },
      { z: -110, lane: 'RIGHT', count: 14, hpPerEnemy: 38, heavyCount: 3, speed: 2.22, coinPerKill: 9 },
      { z: -214, lane: 'CENTER', count: 16, hpPerEnemy: 46, heavyCount: 4, speed: 2.3, coinPerKill: 11 },
      { z: -278, lane: 'CENTER', count: 19, hpPerEnemy: 52, heavyCount: 5, speed: 2.34, coinPerKill: 12 },
    ],
    boss: {
      name: 'Vulcan Siege Mech',
      chassis: 'WARDEN_MECH',
      primaryHex: 0x2b3440,
      accentHex: 0xe66c1f,
      trimHex: 0xffd15c,
      maxHp: 8200,
      segments: 6,
      advanceSpeed: 1.28,
      salvoLanes: 1,
      salvoInterval: 2.22,
      salvoDamage: 3,
      rewardCoins: 245,
    },
  },
  {
    stageNumber: 5,
    title: 'Stormsurge Suspension',
    trackLength: 304,
    supplyDrums: [
      { z: -18, lane: 'LEFT_MID', hp: 115, rewardType: 'COINS', rewardValue: 46 },
      { z: -18, lane: 'RIGHT_MID', hp: 130, rewardType: 'WEAPON', rewardValue: 3 },
      { z: -88, lane: 'LEFT', hp: 175, rewardType: 'COINS', rewardValue: 60 },
      { z: -88, lane: 'CENTER', hp: 195, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -88, lane: 'RIGHT', hp: 175, rewardType: 'COINS', rewardValue: 60 },
      { z: -196, lane: 'LEFT_MID', hp: 350, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -196, lane: 'RIGHT_MID', hp: 380, rewardType: 'WEAPON', rewardValue: 5 },
    ],
    gatePairs: [
      { z: -60, left: null, right: null, full: shootMulGate(1.0, 26) },
      { z: -168, left: addGate(-24, 24), right: addGate(2, 26) },
      { z: -268, left: divGate(2), right: mulGate(2) },
    ],
    tireStacks: [
      ...tireWall3(-138, 740, 860, 820, 'LEFT', 4, 130),
      ...tireWall3(-244, 1620, 1380, 1680, 'CENTER', 5, 175),
    ],
    enemyWaves: [
      { z: -40, lane: 'CENTER', count: 12, hpPerEnemy: 38, heavyCount: 3, speed: 2.15, coinPerKill: 10 },
      { z: -114, lane: 'CENTER', count: 15, hpPerEnemy: 48, heavyCount: 4, speed: 2.26, coinPerKill: 11 },
      { z: -220, lane: 'LEFT', count: 18, hpPerEnemy: 58, heavyCount: 4, speed: 2.34, coinPerKill: 12 },
      { z: -288, lane: 'CENTER', count: 20, hpPerEnemy: 64, heavyCount: 5, speed: 2.38, coinPerKill: 13 },
    ],
    boss: {
      name: 'Tempest Goliath',
      chassis: 'KRAKEN_WALKER',
      primaryHex: 0x26384a,
      accentHex: 0x2dc7ff,
      trimHex: 0xf5b82e,
      maxHp: 12200,
      segments: 7,
      advanceSpeed: 1.30,
      salvoLanes: 2,
      salvoInterval: 2.40,
      salvoDamage: 3,
      rewardCoins: 310,
    },
  },
  {
    stageNumber: 6,
    title: 'Twin-Tower Overwatch',
    trackLength: 312,
    supplyDrums: [
      { z: -18, lane: 'LEFT', hp: 150, rewardType: 'COINS', rewardValue: 55 },
      { z: -18, lane: 'CENTER', hp: 165, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -18, lane: 'RIGHT', hp: 150, rewardType: 'COINS', rewardValue: 55 },
      { z: -90, lane: 'LEFT_MID', hp: 235, rewardType: 'WEAPON', rewardValue: 3 },
      { z: -90, lane: 'RIGHT_MID', hp: 255, rewardType: 'COINS', rewardValue: 72 },
      { z: -202, lane: 'LEFT', hp: 440, rewardType: 'COINS', rewardValue: 90 },
      { z: -202, lane: 'CENTER', hp: 480, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -202, lane: 'RIGHT', hp: 460, rewardType: 'WEAPON', rewardValue: 5 },
    ],
    gatePairs: [
      { z: -62, left: addGate(2, 30), right: addGate(-26, 26) },
      { z: -172, left: null, right: null, full: shootMulGate(1.0, 32) },
      { z: -276, left: mulGate(2), right: divGate(2) },
    ],
    tireStacks: [
      ...tireWall3(-142, 1080, 940, 1120, 'CENTER', 4, 155),
      ...tireWall3(-252, 1980, 2120, 1740, 'RIGHT', 5, 210),
    ],
    enemyWaves: [
      { z: -41, lane: 'CENTER', count: 13, hpPerEnemy: 48, heavyCount: 3, speed: 2.2, coinPerKill: 11 },
      { z: -116, lane: 'RIGHT', count: 16, hpPerEnemy: 60, heavyCount: 4, speed: 2.3, coinPerKill: 12 },
      { z: -226, lane: 'CENTER', count: 19, hpPerEnemy: 72, heavyCount: 5, speed: 2.38, coinPerKill: 14 },
      { z: -296, lane: 'CENTER', count: 21, hpPerEnemy: 78, heavyCount: 5, speed: 2.4, coinPerKill: 15 },
    ],
    boss: {
      name: 'Aegis Dreadnought',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x2c394b,
      accentHex: 0xd9384a,
      trimHex: 0x48e5ff,
      maxHp: 17500,
      segments: 7,
      advanceSpeed: 1.32,
      salvoLanes: 2,
      salvoInterval: 2.32,
      salvoDamage: 3,
      rewardCoins: 380,
    },
  },
  {
    stageNumber: 7,
    title: 'Cobalt Strait Crossing',
    trackLength: 320,
    supplyDrums: [
      { z: -18, lane: 'LEFT_MID', hp: 190, rewardType: 'COINS', rewardValue: 68 },
      { z: -18, lane: 'RIGHT_MID', hp: 210, rewardType: 'WEAPON', rewardValue: 3 },
      { z: -92, lane: 'LEFT', hp: 310, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -92, lane: 'CENTER', hp: 290, rewardType: 'COINS', rewardValue: 85 },
      { z: -92, lane: 'RIGHT', hp: 320, rewardType: 'COINS', rewardValue: 90 },
      { z: -208, lane: 'LEFT_MID', hp: 580, rewardType: 'WEAPON', rewardValue: 5 },
      { z: -208, lane: 'RIGHT_MID', hp: 610, rewardType: 'RECRUIT', rewardValue: 1 },
    ],
    gatePairs: [
      { z: -62, left: null, right: null, full: shootMulGate(1.0, 38) },
      { z: -178, left: addGate(-28, 32), right: addGate(3, 36) },
      { z: -284, left: divGate(2), right: shootMulGate(1.1, 44) },
    ],
    tireStacks: [
      ...tireWall3(-146, 1180, 1380, 1320, 'LEFT', 4, 185),
      ...tireWall3(-260, 2450, 2150, 2550, 'CENTER', 5, 250),
    ],
    enemyWaves: [
      { z: -42, lane: 'CENTER', count: 14, hpPerEnemy: 60, heavyCount: 3, speed: 2.24, coinPerKill: 13 },
      { z: -120, lane: 'CENTER', count: 17, hpPerEnemy: 74, heavyCount: 4, speed: 2.34, coinPerKill: 14 },
      { z: -234, lane: 'RIGHT', count: 20, hpPerEnemy: 88, heavyCount: 5, speed: 2.4, coinPerKill: 15 },
      { z: -304, lane: 'CENTER', count: 22, hpPerEnemy: 96, heavyCount: 5, speed: 2.44, coinPerKill: 16 },
    ],
    boss: {
      name: 'Kraken Command Rig',
      chassis: 'KRAKEN_WALKER',
      primaryHex: 0x1d2636,
      accentHex: 0xe82c4f,
      trimHex: 0x38f6ff,
      maxHp: 24000,
      segments: 8,
      advanceSpeed: 1.35,
      salvoLanes: 2,
      salvoInterval: 2.25,
      salvoDamage: 3,
      rewardCoins: 460,
    },
  },
  {
    stageNumber: 8,
    title: 'Ironclad Skyway',
    trackLength: 328,
    supplyDrums: [
      { z: -18, lane: 'LEFT', hp: 230, rewardType: 'COINS', rewardValue: 82 },
      { z: -18, lane: 'CENTER', hp: 250, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -18, lane: 'RIGHT', hp: 230, rewardType: 'COINS', rewardValue: 82 },
      { z: -94, lane: 'LEFT_MID', hp: 390, rewardType: 'WEAPON', rewardValue: 4 },
      { z: -94, lane: 'RIGHT_MID', hp: 370, rewardType: 'COINS', rewardValue: 105 },
      { z: -214, lane: 'LEFT', hp: 740, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -214, lane: 'CENTER', hp: 710, rewardType: 'COINS', rewardValue: 125 },
      { z: -214, lane: 'RIGHT', hp: 780, rewardType: 'WEAPON', rewardValue: 5 },
    ],
    gatePairs: [
      { z: -64, left: addGate(-30, 38), right: addGate(3, 42) },
      { z: -182, left: null, right: null, full: shootMulGate(1.0, 46) },
      { z: -292, left: mulGate(2), right: divGate(2) },
    ],
    tireStacks: [
      ...tireWall3(-150, 1680, 1480, 1740, 'CENTER', 4, 220),
      ...tireWall3(-268, 2650, 3050, 3150, 'LEFT', 5, 295),
    ],
    enemyWaves: [
      { z: -42, lane: 'CENTER', count: 15, hpPerEnemy: 74, heavyCount: 4, speed: 2.28, coinPerKill: 14 },
      { z: -124, lane: 'LEFT', count: 18, hpPerEnemy: 90, heavyCount: 4, speed: 2.36, coinPerKill: 15 },
      { z: -240, lane: 'CENTER', count: 21, hpPerEnemy: 106, heavyCount: 5, speed: 2.44, coinPerKill: 17 },
      { z: -312, lane: 'CENTER', count: 23, hpPerEnemy: 116, heavyCount: 6, speed: 2.46, coinPerKill: 18 },
    ],
    boss: {
      name: 'Obsidian Titan',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x1d2028,
      accentHex: 0xd92638,
      trimHex: 0xffa62b,
      maxHp: 32000,
      segments: 8,
      advanceSpeed: 1.38,
      salvoLanes: 2,
      salvoInterval: 2.18,
      salvoDamage: 4,
      rewardCoins: 560,
    },
  },
  {
    stageNumber: 9,
    title: 'Plasma Horizon Span',
    trackLength: 334,
    supplyDrums: [
      { z: -18, lane: 'LEFT_MID', hp: 265, rewardType: 'COINS', rewardValue: 96 },
      { z: -18, lane: 'RIGHT_MID', hp: 295, rewardType: 'WEAPON', rewardValue: 4 },
      { z: -96, lane: 'LEFT', hp: 470, rewardType: 'COINS', rewardValue: 120 },
      { z: -96, lane: 'CENTER', hp: 510, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -96, lane: 'RIGHT', hp: 470, rewardType: 'COINS', rewardValue: 120 },
      { z: -218, lane: 'LEFT_MID', hp: 920, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -218, lane: 'RIGHT_MID', hp: 960, rewardType: 'WEAPON', rewardValue: 5 },
    ],
    gatePairs: [
      { z: -64, left: null, right: null, full: shootMulGate(1.0, 54) },
      { z: -186, left: addGate(3, 50), right: addGate(-32, 46) },
      { z: -298, left: divGate(2), right: mulGate(2) },
    ],
    tireStacks: [
      ...tireWall3(-154, 2050, 2180, 1820, 'RIGHT', 5, 260),
      ...tireWall3(-274, 3450, 3100, 3550, 'CENTER', 5, 340),
    ],
    enemyWaves: [
      { z: -43, lane: 'CENTER', count: 16, hpPerEnemy: 88, heavyCount: 4, speed: 2.32, coinPerKill: 16 },
      { z: -126, lane: 'CENTER', count: 19, hpPerEnemy: 108, heavyCount: 5, speed: 2.4, coinPerKill: 17 },
      { z: -246, lane: 'LEFT', count: 22, hpPerEnemy: 128, heavyCount: 6, speed: 2.46, coinPerKill: 19 },
      { z: -318, lane: 'CENTER', count: 24, hpPerEnemy: 140, heavyCount: 6, speed: 2.5, coinPerKill: 20 },
    ],
    boss: {
      name: 'Hyperion Warlord',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x263248,
      accentHex: 0x36f3ff,
      trimHex: 0xffc845,
      maxHp: 41000,
      segments: 9,
      advanceSpeed: 1.40,
      salvoLanes: 2,
      salvoInterval: 2.12,
      salvoDamage: 4,
      rewardCoins: 680,
    },
  },
  {
    stageNumber: 10,
    title: 'Omega Citadel Bridge',
    trackLength: 340,
    supplyDrums: [
      { z: -18, lane: 'LEFT', hp: 310, rewardType: 'COINS', rewardValue: 115 },
      { z: -18, lane: 'CENTER', hp: 340, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -18, lane: 'RIGHT', hp: 310, rewardType: 'COINS', rewardValue: 115 },
      { z: -98, lane: 'LEFT_MID', hp: 580, rewardType: 'WEAPON', rewardValue: 4 },
      { z: -98, lane: 'RIGHT_MID', hp: 620, rewardType: 'RECRUIT', rewardValue: 1 },
      { z: -222, lane: 'LEFT', hp: 1080, rewardType: 'COINS', rewardValue: 165 },
      { z: -222, lane: 'CENTER', hp: 1180, rewardType: 'WEAPON', rewardValue: 5 },
      { z: -222, lane: 'RIGHT', hp: 1120, rewardType: 'RECRUIT', rewardValue: 1 },
    ],
    gatePairs: [
      { z: -66, left: null, right: null, full: shootMulGate(1.0, 64) },
      { z: -190, left: addGate(-35, 55), right: addGate(4, 60) },
      { z: -304, left: mulGate(2), right: shootMulGate(1.2, 72) },
    ],
    tireStacks: [
      ...tireWall3(-158, 2250, 2550, 2480, 'LEFT', 5, 310),
      ...tireWall3(-280, 4100, 3650, 4200, 'CENTER', 5, 420),
    ],
    enemyWaves: [
      { z: -44, lane: 'CENTER', count: 18, hpPerEnemy: 105, heavyCount: 4, speed: 2.35, coinPerKill: 18 },
      { z: -130, lane: 'RIGHT', count: 20, hpPerEnemy: 128, heavyCount: 5, speed: 2.42, coinPerKill: 20 },
      { z: -252, lane: 'CENTER', count: 23, hpPerEnemy: 150, heavyCount: 6, speed: 2.48, coinPerKill: 22 },
      { z: -324, lane: 'CENTER', count: 24, hpPerEnemy: 165, heavyCount: 7, speed: 2.52, coinPerKill: 24 },
    ],
    boss: {
      name: 'Apex Sovereign Mech',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x462440,
      accentHex: 0xf5b82e,
      trimHex: 0x38f6ff,
      maxHp: 52000,
      segments: 10,
      advanceSpeed: 1.44,
      salvoLanes: 2,
      salvoInterval: 2.05,
      salvoDamage: 4,
      rewardCoins: 850,
    },
  },
];

export function getCampaignStage(stageNumber: number): StageDefinition {
  const idx = Math.max(0, Math.min(CAMPAIGN_STAGES.length - 1, Math.floor(stageNumber) - 1));
  return CAMPAIGN_STAGES[idx];
}

const ENDLESS_CHASSIS_ROTATION: ReadonlyArray<{
  chassis: BossChassisId;
  label: string;
  primaryHex: number;
  accentHex: number;
  trimHex: number;
}> = [
  { chassis: 'WARDEN_MECH', label: 'Warden', primaryHex: 0x344050, accentHex: 0xd9384a, trimHex: 0xf5b42e },
  { chassis: 'SIEGE_TANK', label: 'Juggernaut', primaryHex: 0x5c2432, accentHex: 0xff8c38, trimHex: 0xffd15c },
  { chassis: 'KRAKEN_WALKER', label: 'Kraken', primaryHex: 0x24364a, accentHex: 0x36f3ff, trimHex: 0xff4757 },
  { chassis: 'SOVEREIGN_TITAN', label: 'Sovereign', primaryHex: 0x3d2342, accentHex: 0xf5b82e, trimHex: 0x38f6ff },
];

/**
 * Generates deterministic escalating sectors for Endless Bridge Mode (290m span per wave).
 */
export function generateEndlessWaveStage(waveNumber: number): StageDefinition {
  const w = Math.max(1, Math.floor(waveNumber));
  const scale = Math.pow(1.34, w - 1);
  const kScale = Math.round(8 * scale);
  const negBase = -(12 + w * 3);
  const posBase = Math.min(5, 1 + Math.floor(w / 3));

  const tierA = Math.min(5, 2 + Math.floor((w - 1) / 2)) as WeaponTierId;
  const tierB = Math.min(5, 3 + Math.floor(w / 2)) as WeaponTierId;

  const supplyDrums: SupplyDrumDefinition[] = [
    {
      z: -18,
      lane: 'LEFT_MID',
      hp: Math.round(28 * scale),
      rewardType: 'COINS',
      rewardValue: Math.round(20 + w * 8),
    },
    {
      z: -18,
      lane: 'RIGHT_MID',
      hp: Math.round(38 * scale),
      rewardType: w % 2 === 1 ? 'COINS' : 'RECRUIT',
      rewardValue: w % 2 === 1 ? Math.round(28 + w * 10) : 1,
    },
    {
      z: -80,
      lane: 'LEFT',
      hp: Math.round(52 * scale),
      rewardType: 'WEAPON',
      rewardValue: tierA,
    },
    {
      z: -80,
      lane: 'CENTER',
      hp: Math.round(44 * scale),
      rewardType: 'COINS',
      rewardValue: Math.round(26 + w * 10),
    },
    {
      z: -80,
      lane: 'RIGHT',
      hp: Math.round(58 * scale),
      rewardType: 'RECRUIT',
      rewardValue: 1,
    },
    {
      z: -182,
      lane: 'LEFT_MID',
      hp: Math.round(115 * scale),
      rewardType: 'COINS',
      rewardValue: Math.round(40 + w * 14),
    },
    {
      z: -182,
      lane: 'RIGHT_MID',
      hp: Math.round(128 * scale),
      rewardType: 'RECRUIT',
      rewardValue: 1,
    },
  ];

  const gatePairs: GatePairDefinition[] = [
    {
      z: -56,
      left: null,
      right: null,
      full: shootMulGate(1.0, Math.max(8, kScale)),
    },
    {
      z: -154,
      left: w % 2 === 1 ? addGate(posBase, kScale * 1.4) : addGate(negBase, kScale * 1.2),
      right: w % 2 === 1 ? addGate(negBase, kScale * 1.2) : addGate(posBase, kScale * 1.4),
    },
    {
      z: -250,
      left: w % 2 === 0 ? mulGate(2) : divGate(2),
      right: w % 2 === 0 ? divGate(2) : shootMulGate(1.1, Math.max(14, kScale * 1.8)),
    },
  ];

  const laneOrder: ReadonlyArray<'LEFT' | 'CENTER' | 'RIGHT'> = ['CENTER', 'RIGHT', 'LEFT'];
  const laneA = laneOrder[(w - 1) % 3];
  const laneB = laneOrder[w % 3];
  const baseWallA = Math.round(195 * scale);
  const baseWallB = Math.round(390 * scale);

  const archetype = ENDLESS_CHASSIS_ROTATION[(w - 1) % ENDLESS_CHASSIS_ROTATION.length];

  return {
    stageNumber: w,
    title: `Endless Sector ${w}`,
    trackLength: 290,
    supplyDrums,
    gatePairs,
    tireStacks: [
      ...tireWall3(
        -126,
        laneA === 'LEFT' ? baseWallA : Math.round(baseWallA * 1.22),
        laneA === 'CENTER' ? baseWallA : Math.round(baseWallA * 1.2),
        laneA === 'RIGHT' ? baseWallA : Math.round(baseWallA * 1.24),
        laneA,
        tierA,
        Math.round(55 + w * 18)
      ),
      ...tireWall3(
        -224,
        laneB === 'LEFT' ? baseWallB : Math.round(baseWallB * 1.22),
        laneB === 'CENTER' ? baseWallB : Math.round(baseWallB * 1.24),
        laneB === 'RIGHT' ? baseWallB : Math.round(baseWallB * 1.2),
        laneB,
        tierB,
        Math.round(80 + w * 24)
      ),
    ],
    enemyWaves: [
      {
        z: -36,
        lane: 'CENTER',
        count: Math.min(18, 6 + w * 2),
        hpPerEnemy: Math.round(12 * scale),
        heavyCount: Math.min(4, Math.floor(w / 2)),
        speed: 1.9 + Math.min(0.65, w * 0.05),
        coinPerKill: 5 + w * 2,
      },
      {
        z: -102,
        lane: 'CENTER',
        count: Math.min(20, 9 + w * 2),
        hpPerEnemy: Math.round(17 * scale),
        heavyCount: Math.min(5, 1 + Math.floor(w / 2)),
        speed: 2.05 + Math.min(0.65, w * 0.05),
        coinPerKill: 6 + w * 2,
      },
      {
        z: -202,
        lane: 'CENTER',
        count: Math.min(22, 12 + w * 2),
        hpPerEnemy: Math.round(23 * scale),
        heavyCount: Math.min(6, 2 + Math.floor(w / 2)),
        speed: 2.15 + Math.min(0.65, w * 0.05),
        coinPerKill: 7 + w * 2,
      },
      {
        z: -268,
        lane: 'CENTER',
        count: Math.min(24, 14 + w * 2),
        hpPerEnemy: Math.round(26 * scale),
        heavyCount: Math.min(7, 3 + Math.floor(w / 2)),
        speed: 2.22 + Math.min(0.65, w * 0.05),
        coinPerKill: 8 + w * 2,
      },
    ],
    boss: {
      name: `Sector-${w} ${archetype.label}`,
      chassis: archetype.chassis,
      primaryHex: archetype.primaryHex,
      accentHex: archetype.accentHex,
      trimHex: archetype.trimHex,
      maxHp: Math.round(2400 * Math.pow(1.38, w - 1)),
      segments: Math.min(10, 5 + Math.floor(w / 2)),
      advanceSpeed: Math.min(1.52, 1.2 + w * 0.025),
      salvoLanes: w >= 5 ? 2 : 1,
      salvoInterval: Math.max(1.98, 2.48 - w * 0.04),
      salvoDamage: Math.min(5, 2 + Math.floor(w / 3)),
      rewardCoins: 120 + w * 45,
    },
  };
}
