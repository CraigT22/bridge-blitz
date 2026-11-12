import type {
  BossChassisId,
  GateDefinition,
  GatePairDefinition,
  StageDefinition,
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

/**
 * 10 Handcrafted Campaign Stages tuned for v3.1 deliberate tactical pacing (~35-50s bridge march
 * at 7.8 m/s + active ~9-12s Boss battles with telegraphed lane salvos, >=36m obstacle spacing
 * so 32m gunfire never snipes gates off-screen, and alternating lane layouts that punish AFK play).
 */
export const CAMPAIGN_STAGES: ReadonlyArray<StageDefinition> = [
  {
    stageNumber: 1,
    title: 'Golden Span Outpost',
    trackLength: 265,
    gatePairs: [
      { z: -38, left: addGate(2, 1.6), right: addGate(-5, 1.4) },
      { z: -150, left: divGate(2), right: addGate(-7, 2.0) },
      { z: -224, left: addGate(-11, 2.6), right: mulGate(2) },
    ],
    tireStacks: [
      { z: -74, lane: 'LEFT', breakCount: 18, weaponTier: 2 },
      { z: -188, lane: 'LEFT', breakCount: 52, weaponTier: 3 },
    ],
    enemyWaves: [
      { z: -112, lane: 'CENTER', count: 9, hpPerEnemy: 4.2, speed: 2.7 },
      { z: -248, lane: 'CENTER', count: 14, hpPerEnemy: 4.8, speed: 2.8 },
    ],
    boss: {
      name: 'Iron Warden Mk-I',
      chassis: 'WARDEN_MECH',
      primaryHex: 0x384352,
      accentHex: 0xc92a3e,
      trimHex: 0xf5b42e,
      maxHp: 1550,
      segments: 5,
      advanceSpeed: 1.22,
      salvoLanes: 1,
      salvoInterval: 2.45,
      salvoDamage: 6,
      rewardCoins: 75,
    },
  },
  {
    stageNumber: 2,
    title: 'Crosswind Viaduct',
    trackLength: 285,
    gatePairs: [
      { z: -38, left: addGate(-7, 1.8), right: addGate(-4, 1.7) },
      { z: -114, left: mulGate(2), right: divGate(2) },
      { z: -190, left: addGate(-13, 2.4), right: addGate(5, 2.5) },
      { z: -244, left: divGate(2), right: mulGate(2) },
    ],
    tireStacks: [
      { z: -76, lane: 'RIGHT', breakCount: 28, weaponTier: 2 },
      { z: -152, lane: 'LEFT', breakCount: 64, weaponTier: 3 },
    ],
    enemyWaves: [
      { z: -134, lane: 'RIGHT', count: 13, hpPerEnemy: 5.0, speed: 2.8 },
      { z: -266, lane: 'CENTER', count: 18, hpPerEnemy: 5.6, speed: 2.9 },
    ],
    boss: {
      name: 'Bastion Enforcer',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x434d3e,
      accentHex: 0xd9822b,
      trimHex: 0xf7d154,
      maxHp: 2600,
      segments: 5,
      advanceSpeed: 1.26,
      salvoLanes: 1,
      salvoInterval: 2.38,
      salvoDamage: 8,
      rewardCoins: 90,
    },
  },
  {
    stageNumber: 3,
    title: 'Crimson Causeway',
    trackLength: 300,
    gatePairs: [
      { z: -40, left: addGate(-10, 2.1), right: addGate(3, 2.2) },
      { z: -118, left: mulGate(3), right: divGate(2) },
      { z: -196, left: addGate(-16, 2.8), right: addGate(-11, 2.6) },
      { z: -256, left: mulGate(2), right: divGate(2) },
    ],
    tireStacks: [
      { z: -78, lane: 'LEFT', breakCount: 44, weaponTier: 3 },
      { z: -226, lane: 'RIGHT', breakCount: 95, weaponTier: 4 },
    ],
    enemyWaves: [
      { z: -158, lane: 'CENTER', count: 18, hpPerEnemy: 6.2, speed: 2.9 },
      { z: -280, lane: 'CENTER', count: 22, hpPerEnemy: 6.8, speed: 3.0 },
    ],
    boss: {
      name: 'Crimson Juggernaut',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x7a1c28,
      accentHex: 0x242b35,
      trimHex: 0xffb627,
      maxHp: 4200,
      segments: 6,
      advanceSpeed: 1.30,
      salvoLanes: 1,
      salvoInterval: 2.30,
      salvoDamage: 10,
      rewardCoins: 110,
    },
  },
  {
    stageNumber: 4,
    title: 'Steel Truss Gauntlet',
    trackLength: 315,
    gatePairs: [
      { z: -40, left: addGate(4, 2.6), right: addGate(-12, 2.4) },
      { z: -120, left: divGate(2), right: mulGate(3) },
      { z: -200, left: addGate(-19, 3.3), right: addGate(6, 3.4) },
      { z: -268, left: mulGate(2), right: divGate(2) },
    ],
    tireStacks: [
      { z: -80, lane: 'RIGHT', breakCount: 58, weaponTier: 3 },
      { z: -160, lane: 'LEFT', breakCount: 115, weaponTier: 4 },
      { z: -236, lane: 'LEFT', breakCount: 55, weaponTier: 2 },
    ],
    enemyWaves: [
      { z: -140, lane: 'RIGHT', count: 20, hpPerEnemy: 7.4, speed: 3.0 },
      { z: -292, lane: 'CENTER', count: 26, hpPerEnemy: 8.0, speed: 3.05 },
    ],
    boss: {
      name: 'Vulcan Siege Mech',
      chassis: 'WARDEN_MECH',
      primaryHex: 0x2b3440,
      accentHex: 0xe66c1f,
      trimHex: 0xffd15c,
      maxHp: 6400,
      segments: 6,
      advanceSpeed: 1.32,
      salvoLanes: 1,
      salvoInterval: 2.22,
      salvoDamage: 12,
      rewardCoins: 130,
    },
  },
  {
    stageNumber: 5,
    title: 'Stormsurge Suspension',
    trackLength: 330,
    gatePairs: [
      { z: -40, left: addGate(-14, 3.0), right: addGate(-9, 2.9) },
      { z: -122, left: mulGate(3), right: divGate(2) },
      { z: -206, left: addGate(8, 3.8), right: addGate(-22, 3.6) },
      { z: -280, left: divGate(2), right: mulGate(2) },
    ],
    tireStacks: [
      { z: -82, lane: 'LEFT', breakCount: 72, weaponTier: 3 },
      { z: -164, lane: 'RIGHT', breakCount: 155, weaponTier: 5 },
    ],
    enemyWaves: [
      { z: -142, lane: 'CENTER', count: 24, hpPerEnemy: 9.0, speed: 3.1 },
      { z: -244, lane: 'LEFT', count: 24, hpPerEnemy: 9.6, speed: 3.15 },
      { z: -306, lane: 'CENTER', count: 28, hpPerEnemy: 10.2, speed: 3.15 },
    ],
    boss: {
      name: 'Tempest Goliath',
      chassis: 'KRAKEN_WALKER',
      primaryHex: 0x26384a,
      accentHex: 0x2dc7ff,
      trimHex: 0xf5b82e,
      maxHp: 9800,
      segments: 7,
      advanceSpeed: 1.35,
      salvoLanes: 2,
      salvoInterval: 2.40,
      salvoDamage: 15,
      rewardCoins: 160,
    },
  },
  {
    stageNumber: 6,
    title: 'Twin-Tower Overwatch',
    trackLength: 340,
    gatePairs: [
      { z: -42, left: addGate(5, 3.5), right: addGate(-18, 3.4) },
      { z: -126, left: divGate(2), right: mulGate(3) },
      { z: -212, left: addGate(-24, 4.1), right: divGate(2) },
      { z: -288, left: mulGate(2), right: addGate(10, 4.2) },
    ],
    tireStacks: [
      { z: -84, lane: 'RIGHT', breakCount: 115, weaponTier: 4 },
      { z: -250, lane: 'LEFT', breakCount: 185, weaponTier: 5 },
    ],
    enemyWaves: [
      { z: -168, lane: 'CENTER', count: 28, hpPerEnemy: 11.0, speed: 3.2 },
      { z: -316, lane: 'CENTER', count: 32, hpPerEnemy: 11.8, speed: 3.25 },
    ],
    boss: {
      name: 'Aegis Dreadnought',
      chassis: 'SIEGE_TANK',
      primaryHex: 0x2c394b,
      accentHex: 0xd9384a,
      trimHex: 0x48e5ff,
      maxHp: 13500,
      segments: 7,
      advanceSpeed: 1.37,
      salvoLanes: 2,
      salvoInterval: 2.32,
      salvoDamage: 18,
      rewardCoins: 190,
    },
  },
  {
    stageNumber: 7,
    title: 'Cobalt Strait Crossing',
    trackLength: 350,
    gatePairs: [
      { z: -42, left: addGate(-20, 4.0), right: addGate(5, 4.0) },
      { z: -128, left: mulGate(3), right: divGate(2) },
      { z: -216, left: addGate(-25, 4.5), right: addGate(-16, 4.3) },
      { z: -296, left: divGate(2), right: mulGate(2) },
    ],
    tireStacks: [
      { z: -86, lane: 'LEFT', breakCount: 135, weaponTier: 4 },
      { z: -172, lane: 'RIGHT', breakCount: 215, weaponTier: 5 },
      { z: -256, lane: 'RIGHT', breakCount: 95, weaponTier: 3 },
    ],
    enemyWaves: [
      { z: -150, lane: 'CENTER', count: 32, hpPerEnemy: 12.8, speed: 3.25 },
      { z: -326, lane: 'CENTER', count: 36, hpPerEnemy: 13.8, speed: 3.3 },
    ],
    boss: {
      name: 'Kraken Command Rig',
      chassis: 'KRAKEN_WALKER',
      primaryHex: 0x1d2636,
      accentHex: 0xe82c4f,
      trimHex: 0x38f6ff,
      maxHp: 18000,
      segments: 8,
      advanceSpeed: 1.40,
      salvoLanes: 2,
      salvoInterval: 2.25,
      salvoDamage: 21,
      rewardCoins: 225,
    },
  },
  {
    stageNumber: 8,
    title: 'Ironclad Skyway',
    trackLength: 360,
    gatePairs: [
      { z: -42, left: addGate(-22, 4.6), right: addGate(6, 4.6) },
      { z: -130, left: divGate(2), right: mulGate(3) },
      { z: -220, left: addGate(-28, 5.0), right: divGate(2) },
      { z: -304, left: mulGate(2), right: addGate(12, 5.2) },
    ],
    tireStacks: [
      { z: -88, lane: 'RIGHT', breakCount: 155, weaponTier: 4 },
      { z: -262, lane: 'LEFT', breakCount: 250, weaponTier: 5 },
    ],
    enemyWaves: [
      { z: -174, lane: 'LEFT', count: 34, hpPerEnemy: 14.8, speed: 3.3 },
      { z: -240, lane: 'RIGHT', count: 30, hpPerEnemy: 15.5, speed: 3.35 },
      { z: -336, lane: 'CENTER', count: 38, hpPerEnemy: 16.2, speed: 3.35 },
    ],
    boss: {
      name: 'Obsidian Titan',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x1d2028,
      accentHex: 0xd92638,
      trimHex: 0xffa62b,
      maxHp: 23500,
      segments: 8,
      advanceSpeed: 1.42,
      salvoLanes: 2,
      salvoInterval: 2.18,
      salvoDamage: 24,
      rewardCoins: 265,
    },
  },
  {
    stageNumber: 9,
    title: 'Plasma Horizon Span',
    trackLength: 372,
    gatePairs: [
      { z: -44, left: addGate(-24, 5.2), right: addGate(-15, 5.0) },
      { z: -132, left: mulGate(3), right: divGate(2) },
      { z: -224, left: divGate(2), right: addGate(-30, 5.6) },
      { z: -312, left: addGate(14, 5.8), right: mulGate(2) },
    ],
    tireStacks: [
      { z: -88, lane: 'LEFT', breakCount: 175, weaponTier: 4 },
      { z: -178, lane: 'RIGHT', breakCount: 290, weaponTier: 5 },
      { z: -268, lane: 'CENTER', breakCount: 140, weaponTier: 4 },
    ],
    enemyWaves: [
      { z: -154, lane: 'CENTER', count: 38, hpPerEnemy: 17.2, speed: 3.4 },
      { z: -346, lane: 'CENTER', count: 42, hpPerEnemy: 18.4, speed: 3.45 },
    ],
    boss: {
      name: 'Hyperion Warlord',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x263248,
      accentHex: 0x36f3ff,
      trimHex: 0xffc845,
      maxHp: 30000,
      segments: 9,
      advanceSpeed: 1.45,
      salvoLanes: 2,
      salvoInterval: 2.12,
      salvoDamage: 27,
      rewardCoins: 310,
    },
  },
  {
    stageNumber: 10,
    title: 'Omega Citadel Bridge',
    trackLength: 385,
    gatePairs: [
      { z: -44, left: addGate(-25, 5.8), right: addGate(8, 5.8) },
      { z: -136, left: divGate(2), right: mulGate(3) },
      { z: -228, left: addGate(-32, 6.2), right: divGate(2) },
      { z: -320, left: mulGate(2), right: mulGate(3) },
    ],
    tireStacks: [
      { z: -90, lane: 'RIGHT', breakCount: 190, weaponTier: 4 },
      { z: -182, lane: 'LEFT', breakCount: 330, weaponTier: 5 },
      { z: -274, lane: 'RIGHT', breakCount: 190, weaponTier: 5 },
    ],
    enemyWaves: [
      { z: -158, lane: 'CENTER', count: 40, hpPerEnemy: 19.5, speed: 3.45 },
      { z: -250, lane: 'CENTER', count: 38, hpPerEnemy: 20.5, speed: 3.5 },
      { z: -358, lane: 'CENTER', count: 46, hpPerEnemy: 21.5, speed: 3.5 },
    ],
    boss: {
      name: 'Apex Sovereign Mech',
      chassis: 'SOVEREIGN_TITAN',
      primaryHex: 0x462440,
      accentHex: 0xf5b82e,
      trimHex: 0x38f6ff,
      maxHp: 38000,
      segments: 10,
      advanceSpeed: 1.48,
      salvoLanes: 2,
      salvoInterval: 2.05,
      salvoDamage: 30,
      rewardCoins: 380,
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
 * Generates deterministic escalating sectors for Endless Bridge Mode (310m span per wave).
 */
export function generateEndlessWaveStage(waveNumber: number): StageDefinition {
  const w = Math.max(1, Math.floor(waveNumber));
  const kScale = 1.6 + w * 0.85;
  const negBase = -(8 + w * 4);
  const posBase = Math.min(18, 4 + Math.floor(w * 1.3));

  const gatePairs: GatePairDefinition[] = [
    {
      z: -42,
      left: w % 2 === 1 ? addGate(posBase, kScale) : addGate(negBase, kScale),
      right: w % 2 === 1 ? addGate(negBase, kScale) : addGate(posBase, kScale),
    },
    {
      z: -124,
      left: w % 3 === 0 ? mulGate(3) : divGate(2),
      right: w % 3 === 0 ? divGate(2) : mulGate(2),
    },
    {
      z: -206,
      left: addGate(Math.round(negBase * 1.25), kScale * 1.15),
      right: addGate(posBase + 2, kScale * 1.15),
    },
    {
      z: -268,
      left: w % 2 === 0 ? mulGate(2) : divGate(2),
      right: w % 2 === 0 ? divGate(2) : mulGate(w >= 4 ? 3 : 2),
    },
  ];

  const tierA = Math.min(5, 2 + Math.floor((w - 1) / 2)) as WeaponTierId;
  const tierB = Math.min(5, 3 + Math.floor(w / 2)) as WeaponTierId;
  const archetype = ENDLESS_CHASSIS_ROTATION[(w - 1) % ENDLESS_CHASSIS_ROTATION.length];

  return {
    stageNumber: w,
    title: `Endless Sector ${w}`,
    trackLength: 310,
    gatePairs,
    tireStacks: [
      { z: -82, lane: w % 2 === 1 ? 'LEFT' : 'RIGHT', breakCount: 28 + w * 26, weaponTier: tierA },
      { z: -236, lane: w % 2 === 1 ? 'RIGHT' : 'LEFT', breakCount: 55 + w * 40, weaponTier: tierB },
    ],
    enemyWaves: [
      { z: -164, lane: 'CENTER', count: Math.min(60, 12 + w * 4), hpPerEnemy: 4.2 + w * 2.6, speed: 2.75 + Math.min(0.85, w * 0.07) },
      { z: -290, lane: 'CENTER', count: Math.min(70, 16 + w * 5), hpPerEnemy: 4.8 + w * 3.0, speed: 2.85 + Math.min(0.85, w * 0.07) },
    ],
    boss: {
      name: `Sector-${w} ${archetype.label}`,
      chassis: archetype.chassis,
      primaryHex: archetype.primaryHex,
      accentHex: archetype.accentHex,
      trimHex: archetype.trimHex,
      maxHp: Math.round(1650 * Math.pow(1.42, w - 1)),
      segments: Math.min(10, 5 + Math.floor(w / 2)),
      advanceSpeed: Math.min(1.60, 1.24 + w * 0.03),
      salvoLanes: w >= 4 ? 2 : 1,
      salvoInterval: Math.max(1.95, 2.55 - w * 0.05),
      salvoDamage: 5 + w * 3,
      rewardCoins: 85 + w * 35,
    },
  };
}
