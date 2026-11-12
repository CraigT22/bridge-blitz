import type {
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
 * 10 Handcrafted Campaign Stages tuned for skill-first progression (beatable in 1–3 smart runs,
 * zero soft-lock grind walls) plus an Endless Bridge Sector generator.
 */
export const CAMPAIGN_STAGES: ReadonlyArray<StageDefinition> = [
  {
    stageNumber: 1,
    title: 'Golden Span Outpost',
    trackLength: 215,
    gatePairs: [
      { z: -34, left: addGate(-4, 1.1), right: addGate(3, 1.4) },
      { z: -78, left: addGate(-8, 1.5), right: mulGate(2) },
      { z: -146, left: divGate(2), right: addGate(6, 2.0) },
    ],
    tireStacks: [
      { z: -54, lane: 'LEFT', breakCount: 14, weaponTier: 2 },
      { z: -122, lane: 'RIGHT', breakCount: 24, weaponTier: 3 },
      { z: -168, lane: 'RIGHT', breakCount: 18, weaponTier: 2 },
    ],
    enemyWaves: [
      { z: -102, lane: 'CENTER', count: 7, hpPerEnemy: 3.0, speed: 2.2 },
      { z: -186, lane: 'CENTER', count: 10, hpPerEnemy: 3.6, speed: 2.4 },
    ],
    boss: {
      name: 'Iron Warden Mk-I',
      maxHp: 210,
      segments: 5,
      advanceSpeed: 1.85,
      rewardCoins: 65,
    },
  },
  {
    stageNumber: 2,
    title: 'Crosswind Viaduct',
    trackLength: 235,
    gatePairs: [
      { z: -34, left: addGate(-7, 1.6), right: addGate(-5, 1.5) },
      { z: -84, left: mulGate(2), right: addGate(8, 2.2) },
      { z: -142, left: addGate(-14, 2.2), right: divGate(2) },
      { z: -188, left: addGate(5, 2.4), right: mulGate(2) },
    ],
    tireStacks: [
      { z: -56, lane: 'RIGHT', breakCount: 22, weaponTier: 2 },
      { z: -116, lane: 'LEFT', breakCount: 38, weaponTier: 3 },
    ],
    enemyWaves: [
      { z: -104, lane: 'LEFT', count: 10, hpPerEnemy: 4.2, speed: 2.4 },
      { z: -168, lane: 'CENTER', count: 14, hpPerEnemy: 4.6, speed: 2.5 },
    ],
    boss: {
      name: 'Bastion Enforcer',
      maxHp: 370,
      segments: 5,
      advanceSpeed: 1.95,
      rewardCoins: 80,
    },
  },
  {
    stageNumber: 3,
    title: 'Crimson Causeway',
    trackLength: 250,
    gatePairs: [
      { z: -36, left: addGate(-10, 2.0), right: addGate(4, 2.0) },
      { z: -88, left: divGate(2), right: mulGate(3) },
      { z: -146, left: addGate(-16, 2.6), right: addGate(-12, 2.4) },
      { z: -198, left: mulGate(2), right: divGate(2) },
    ],
    tireStacks: [
      { z: -60, lane: 'LEFT', breakCount: 32, weaponTier: 3 },
      { z: -170, lane: 'RIGHT', breakCount: 65, weaponTier: 4 },
    ],
    enemyWaves: [
      { z: -116, lane: 'CENTER', count: 16, hpPerEnemy: 5.2, speed: 2.5 },
      { z: -218, lane: 'CENTER', count: 18, hpPerEnemy: 5.8, speed: 2.6 },
    ],
    boss: {
      name: 'Crimson Juggernaut',
      maxHp: 620,
      segments: 6,
      advanceSpeed: 2.0,
      rewardCoins: 95,
    },
  },
  {
    stageNumber: 4,
    title: 'Steel Truss Gauntlet',
    trackLength: 260,
    gatePairs: [
      { z: -36, left: addGate(-12, 2.4), right: addGate(6, 2.6) },
      { z: -90, left: mulGate(3), right: divGate(2) },
      { z: -152, left: addGate(-20, 3.2), right: addGate(9, 3.2) },
      { z: -206, left: divGate(2), right: mulGate(2) },
    ],
    tireStacks: [
      { z: -62, lane: 'RIGHT', breakCount: 45, weaponTier: 3 },
      { z: -124, lane: 'LEFT', breakCount: 85, weaponTier: 4 },
      { z: -182, lane: 'LEFT', breakCount: 45, weaponTier: 2 },
    ],
    enemyWaves: [
      { z: -110, lane: 'RIGHT', count: 18, hpPerEnemy: 6.5, speed: 2.6 },
      { z: -226, lane: 'CENTER', count: 22, hpPerEnemy: 7.0, speed: 2.7 },
    ],
    boss: {
      name: 'Vulcan Siege Mech',
      maxHp: 940,
      segments: 6,
      advanceSpeed: 2.05,
      rewardCoins: 115,
    },
  },
  {
    stageNumber: 5,
    title: 'Stormsurge Suspension',
    trackLength: 270,
    gatePairs: [
      { z: -38, left: addGate(-15, 3.0), right: addGate(-9, 2.8) },
      { z: -92, left: divGate(2), right: mulGate(3) },
      { z: -154, left: addGate(10, 3.6), right: addGate(-22, 3.5) },
      { z: -212, left: mulGate(2), right: addGate(14, 3.8) },
    ],
    tireStacks: [
      { z: -64, lane: 'LEFT', breakCount: 55, weaponTier: 3 },
      { z: -126, lane: 'RIGHT', breakCount: 120, weaponTier: 5 },
    ],
    enemyWaves: [
      { z: -112, lane: 'CENTER', count: 22, hpPerEnemy: 8.0, speed: 2.7 },
      { z: -184, lane: 'LEFT', count: 20, hpPerEnemy: 8.5, speed: 2.8 },
      { z: -236, lane: 'CENTER', count: 24, hpPerEnemy: 8.8, speed: 2.8 },
    ],
    boss: {
      name: 'Tempest Goliath',
      maxHp: 1380,
      segments: 7,
      advanceSpeed: 2.1,
      rewardCoins: 140,
    },
  },
  {
    stageNumber: 6,
    title: 'Twin-Tower Overwatch',
    trackLength: 275,
    gatePairs: [
      { z: -38, left: addGate(7, 3.4), right: addGate(-18, 3.4) },
      { z: -94, left: mulGate(2), right: mulGate(3) },
      { z: -158, left: divGate(2), right: addGate(-24, 4.0) },
      { z: -218, left: mulGate(2), right: divGate(2) },
    ],
    tireStacks: [
      { z: -66, lane: 'RIGHT', breakCount: 90, weaponTier: 4 },
      { z: -188, lane: 'LEFT', breakCount: 150, weaponTier: 5 },
    ],
    enemyWaves: [
      { z: -124, lane: 'CENTER', count: 26, hpPerEnemy: 9.5, speed: 2.8 },
      { z: -242, lane: 'CENTER', count: 28, hpPerEnemy: 10.2, speed: 2.9 },
    ],
    boss: {
      name: 'Aegis Dreadnought',
      maxHp: 1850,
      segments: 7,
      advanceSpeed: 2.12,
      rewardCoins: 165,
    },
  },
  {
    stageNumber: 7,
    title: 'Cobalt Strait Crossing',
    trackLength: 285,
    gatePairs: [
      { z: -38, left: addGate(-20, 4.0), right: addGate(6, 4.0) },
      { z: -96, left: mulGate(3), right: divGate(2) },
      { z: -162, left: addGate(-25, 4.4), right: addGate(-18, 4.2) },
      { z: -224, left: divGate(2), right: mulGate(3) },
    ],
    tireStacks: [
      { z: -66, lane: 'LEFT', breakCount: 110, weaponTier: 4 },
      { z: -132, lane: 'RIGHT', breakCount: 180, weaponTier: 5 },
      { z: -194, lane: 'RIGHT', breakCount: 80, weaponTier: 3 },
    ],
    enemyWaves: [
      { z: -114, lane: 'CENTER', count: 28, hpPerEnemy: 11.2, speed: 2.9 },
      { z: -250, lane: 'CENTER', count: 32, hpPerEnemy: 12.0, speed: 2.95 },
    ],
    boss: {
      name: 'Kraken Command Rig',
      maxHp: 2450,
      segments: 8,
      advanceSpeed: 2.15,
      rewardCoins: 195,
    },
  },
  {
    stageNumber: 8,
    title: 'Ironclad Skyway',
    trackLength: 290,
    gatePairs: [
      { z: -40, left: addGate(-22, 4.6), right: addGate(8, 4.6) },
      { z: -100, left: divGate(2), right: mulGate(3) },
      { z: -166, left: addGate(-28, 5.0), right: divGate(2) },
      { z: -228, left: mulGate(3), right: addGate(16, 5.0) },
    ],
    tireStacks: [
      { z: -70, lane: 'RIGHT', breakCount: 120, weaponTier: 4 },
      { z: -196, lane: 'LEFT', breakCount: 220, weaponTier: 5 },
    ],
    enemyWaves: [
      { z: -132, lane: 'LEFT', count: 30, hpPerEnemy: 13.0, speed: 3.0 },
      { z: -178, lane: 'RIGHT', count: 26, hpPerEnemy: 13.5, speed: 3.0 },
      { z: -256, lane: 'CENTER', count: 34, hpPerEnemy: 14.0, speed: 3.0 },
    ],
    boss: {
      name: 'Obsidian Titan',
      maxHp: 3200,
      segments: 8,
      advanceSpeed: 2.18,
      rewardCoins: 230,
    },
  },
  {
    stageNumber: 9,
    title: 'Plasma Horizon Span',
    trackLength: 300,
    gatePairs: [
      { z: -40, left: addGate(-25, 5.2), right: addGate(-16, 5.0) },
      { z: -102, left: mulGate(3), right: mulGate(2) },
      { z: -170, left: divGate(2), right: addGate(-30, 5.6) },
      { z: -236, left: addGate(20, 5.8), right: mulGate(3) },
    ],
    tireStacks: [
      { z: -70, lane: 'LEFT', breakCount: 140, weaponTier: 4 },
      { z: -138, lane: 'RIGHT', breakCount: 260, weaponTier: 5 },
      { z: -204, lane: 'CENTER', breakCount: 120, weaponTier: 4 },
    ],
    enemyWaves: [
      { z: -120, lane: 'CENTER', count: 34, hpPerEnemy: 15.0, speed: 3.05 },
      { z: -266, lane: 'CENTER', count: 38, hpPerEnemy: 16.0, speed: 3.1 },
    ],
    boss: {
      name: 'Hyperion Warlord',
      maxHp: 4200,
      segments: 9,
      advanceSpeed: 2.2,
      rewardCoins: 275,
    },
  },
  {
    stageNumber: 10,
    title: 'Omega Citadel Bridge',
    trackLength: 315,
    gatePairs: [
      { z: -40, left: addGate(-25, 5.8), right: addGate(10, 5.8) },
      { z: -104, left: divGate(2), right: mulGate(3) },
      { z: -172, left: addGate(-32, 6.2), right: divGate(2) },
      { z: -242, left: mulGate(3), right: mulGate(2) },
    ],
    tireStacks: [
      { z: -72, lane: 'RIGHT', breakCount: 150, weaponTier: 4 },
      { z: -140, lane: 'LEFT', breakCount: 300, weaponTier: 5 },
      { z: -210, lane: 'RIGHT', breakCount: 180, weaponTier: 5 },
    ],
    enemyWaves: [
      { z: -122, lane: 'CENTER', count: 38, hpPerEnemy: 17.5, speed: 3.1 },
      { z: -190, lane: 'CENTER', count: 34, hpPerEnemy: 18.0, speed: 3.15 },
      { z: -278, lane: 'CENTER', count: 44, hpPerEnemy: 19.0, speed: 3.2 },
    ],
    boss: {
      name: 'Apex Sovereign Mech',
      maxHp: 5600,
      segments: 10,
      advanceSpeed: 2.25,
      rewardCoins: 350,
    },
  },
];

export function getCampaignStage(stageNumber: number): StageDefinition {
  const idx = Math.max(0, Math.min(CAMPAIGN_STAGES.length - 1, Math.floor(stageNumber) - 1));
  return CAMPAIGN_STAGES[idx];
}

/**
 * Generates deterministic escalating sectors for Endless Bridge Mode.
 * Every sector spans 240m and culminates in an Endless Wave Boss before seamlessly continuing
 * or advancing the wave counter!
 */
export function generateEndlessWaveStage(waveNumber: number): StageDefinition {
  const w = Math.max(1, Math.floor(waveNumber));
  const kScale = 1.4 + w * 0.85;
  const negBase = -(8 + w * 4);
  const posBase = 5 + Math.floor(w * 1.5);

  const gatePairs: GatePairDefinition[] = [
    {
      z: -38,
      left: w % 2 === 1 ? addGate(negBase, kScale) : addGate(posBase, kScale),
      right: w % 2 === 1 ? addGate(posBase, kScale) : addGate(negBase, kScale),
    },
    {
      z: -94,
      left: w % 3 === 0 ? mulGate(3) : divGate(2),
      right: w % 3 === 0 ? divGate(2) : mulGate(w >= 3 ? 3 : 2),
    },
    {
      z: -158,
      left: addGate(Math.round(negBase * 1.3), kScale * 1.15),
      right: addGate(posBase + 3, kScale * 1.15),
    },
    {
      z: -214,
      left: mulGate(2),
      right: w % 2 === 0 ? mulGate(3) : divGate(2),
    },
  ];

  const tierA = Math.min(5, 2 + Math.floor((w - 1) / 2)) as WeaponTierId;
  const tierB = Math.min(5, 3 + Math.floor(w / 2)) as WeaponTierId;

  return {
    stageNumber: w,
    title: `Endless Sector ${w}`,
    trackLength: 255,
    gatePairs,
    tireStacks: [
      { z: -66, lane: w % 2 === 1 ? 'LEFT' : 'RIGHT', breakCount: 25 + w * 22, weaponTier: tierA },
      { z: -184, lane: w % 2 === 1 ? 'RIGHT' : 'LEFT', breakCount: 45 + w * 35, weaponTier: tierB },
    ],
    enemyWaves: [
      { z: -124, lane: 'CENTER', count: Math.min(55, 10 + w * 4), hpPerEnemy: 3.5 + w * 2.4, speed: 2.4 + Math.min(1.0, w * 0.08) },
      { z: -234, lane: 'CENTER', count: Math.min(65, 14 + w * 5), hpPerEnemy: 4.0 + w * 2.8, speed: 2.5 + Math.min(1.0, w * 0.08) },
    ],
    boss: {
      name: `Sector-${w} Dreadnought`,
      maxHp: Math.round(280 * Math.pow(1.42, w - 1)),
      segments: Math.min(10, 5 + Math.floor(w / 2)),
      advanceSpeed: Math.min(2.4, 1.9 + w * 0.05),
      rewardCoins: 75 + w * 30,
    },
  };
}
