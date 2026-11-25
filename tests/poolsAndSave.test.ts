import { describe, expect, it } from 'vitest';
import { GameStateMachine, WIPEOUT_SLOWMO_DURATION } from '../src/core/GameStateMachine';
import { BulletPool, ParticlePool, RagdollPool } from '../src/core/ObjectPool';
import { createDefaultSaveData, sanitizeSaveData } from '../src/core/SaveManager';
import {
  CAMPAIGN_STAGES,
  generateEndlessWaveStage,
  generateSplitCausewayStage,
  getBossVisualProfile,
} from '../src/core/StageData';
import { selectBossSalvoLaneMask } from '../src/entities/BossEntity';
import { EnemyWaveSlot } from '../src/entities/EnemyWave';

describe('ObjectPool & Core State Integrity', () => {
  it('maintains contiguous O(1) swap-remove invariants in BulletPool', () => {
    const pool = new BulletPool(10);
    const i0 = pool.spawn(1, 0.5, -5, 0, -40, 2, 1, 1.0, 1, 1, 0xffffff);
    const i1 = pool.spawn(2, 0.5, -10, 0, -40, 4, 2, 1.0, 1, 5, 0x36f3ff);
    const i2 = pool.spawn(3, 0.5, -15, 0, -40, 6, 1, 1.0, 1, 3, 0xffaa00);

    expect(i0).toBe(0);
    expect(i1).toBe(1);
    expect(i2).toBe(2);
    expect(pool.activeCount).toBe(3);

    pool.deactivate(0);
    expect(pool.activeCount).toBe(2);
    expect(pool.x[0]).toBe(3);
    expect(pool.damage[0]).toBe(6);
    expect(pool.x[1]).toBe(2);
  });

  it('expires particles cleanly in ParticlePool without leaking slots', () => {
    const p = new ParticlePool(32);
    p.spawnBurst(0, 1, -10, 12, 5, 0xffd166, 0.2, 0.4);
    expect(p.activeCount).toBe(12);

    p.update(0.2);
    expect(p.activeCount).toBe(12);

    p.update(0.25);
    expect(p.activeCount).toBe(0);
  });

  it('simulates RagdollPool knockback tumbles, asphalt bounces, and capacity recycling', () => {
    const ragdolls = new RagdollPool(4);
    ragdolls.spawnKnockback(0, -25, true, 1.0);
    ragdolls.spawnKnockback(1.2, -10, false, 1.15);
    expect(ragdolls.activeCount).toBe(2);
    expect(ragdolls.vz[0]).toBeLessThan(0);
    expect(ragdolls.vz[1]).toBeGreaterThan(0);

    ragdolls.spawnKnockback(-1, -20, true, 1.0);
    ragdolls.spawnKnockback(2, -22, true, 1.0);
    ragdolls.spawnKnockback(0.5, -24, true, 1.0);
    expect(ragdolls.activeCount).toBe(4);

    ragdolls.update(0.35);
    expect(ragdolls.activeCount).toBe(4);
    expect(ragdolls.y[0]).toBeGreaterThanOrEqual(Math.fround(0.16));

    ragdolls.update(0.35);
    expect(ragdolls.activeCount).toBe(0);
  });

  it('pauses and resumes both RUNNING and BOSS_FIGHT states with zeroed timeScale', () => {
    const fsm = new GameStateMachine();
    expect(fsm.pause()).toBe(false);

    fsm.transitionTo('RUNNING');
    expect(fsm.pause()).toBe(true);
    expect(fsm.state).toBe('PAUSED');
    expect(fsm.timeScale).toBe(0.0);
    expect(fsm.resumeTargetState).toBe('RUNNING');
    expect(fsm.resume()).toBe(true);
    expect(fsm.state).toBe('RUNNING');
    expect(fsm.timeScale).toBe(1.0);

    fsm.transitionTo('BOSS_FIGHT');
    expect(fsm.pause()).toBe(true);
    expect(fsm.state).toBe('PAUSED');
    expect(fsm.resumeTargetState).toBe('BOSS_FIGHT');
    expect(fsm.resume()).toBe(true);
    expect(fsm.state).toBe('BOSS_FIGHT');
  });

  it('runs a 0.8s slow-motion wipeout transition on DEFEAT before unlocking summary modal', () => {
    const fsm = new GameStateMachine();
    fsm.transitionTo('RUNNING');
    expect(fsm.timeScale).toBe(1.0);

    fsm.transitionTo('DEFEAT');
    expect(fsm.timeScale).toBeLessThan(1.0);
    expect(fsm.isWipeoutModalReady).toBe(false);

    expect(fsm.tickRealTime(0.4)).toBe(false);
    expect(fsm.isWipeoutModalReady).toBe(false);

    expect(fsm.tickRealTime(WIPEOUT_SLOWMO_DURATION)).toBe(true);
    expect(fsm.isWipeoutModalReady).toBe(true);
    expect(fsm.timeScale).toBe(1.0);
  });

  it('guarantees Boss telegraphed lane salvos target player lane, alternate safe lanes, and always leave >= 1 safe lane', () => {
    for (const x of [-3.85, 0.0, 3.85]) {
      const expectedPlayerLane = x < -1.45 ? 0 : x > 1.45 ? 2 : 1;

      const mask1 = selectBossSalvoLaneMask(x, 1, 0);
      expect(mask1[expectedPlayerLane]).toBe(true);
      expect(mask1.filter(Boolean)).toHaveLength(1);

      let prevSafe = -1;
      for (let cycle = 0; cycle < 4; cycle++) {
        const mask2 = selectBossSalvoLaneMask(x, 2, cycle, prevSafe);
        expect(mask2[expectedPlayerLane]).toBe(true);
        expect(mask2.filter(Boolean)).toHaveLength(2);
        const safeLane = mask2.findIndex((locked) => !locked);
        expect(safeLane).toBeGreaterThanOrEqual(0);
        if (prevSafe >= 0 && prevSafe !== expectedPlayerLane) {
          // Alternating safe-lane rule forces the player to actually move when they camp the prior safe lane
          expect(safeLane).not.toBe(prevSafe);
        }
        prevSafe = safeLane;
      }
    }
  });

  it('defines 10 valid v8.2 marathon stages with Spiked Hazard Drums, Dilemma Gates, Shooters/Chargers, and 2-lane Boss Salvos while preserving >= 42m gate clearance', () => {
    expect(CAMPAIGN_STAGES).toHaveLength(10);
    const seenChassis = new Set<string>();
    for (let i = 0; i < CAMPAIGN_STAGES.length; i++) {
      const stage = CAMPAIGN_STAGES[i];
      expect(stage.stageNumber).toBe(i + 1);
      expect(stage.trackLength).toBeGreaterThanOrEqual(1120);
      expect(stage.supplyDrums.length).toBe(60);
      expect(stage.supplyDrums[0].z).toBeGreaterThanOrEqual(-22);
      expect(stage.supplyDrums.every((d) => (d.rollSpeed ?? 0) > 0)).toBe(true);
      expect(stage.supplyDrums.some((d) => d.isHazard === true)).toBe(true);
      expect(stage.gatePairs.length).toBe(12);
      expect(
        stage.gatePairs.some(
          (g) => (g.left?.isLocked && (g.left.operator === 'DIV' || g.left.initialValue < 0)) ||
                 (g.right?.isLocked && (g.right.operator === 'DIV' || g.right.initialValue < 0))
        )
      ).toBe(true);
      expect(stage.tireStacks.length).toBe(24);
      expect(stage.enemyWaves.length).toBe(16);
      expect(stage.enemyWaves[1].count).toBeGreaterThanOrEqual(24);
      expect(stage.enemyWaves.some((w) => (w.shooterCount ?? 0) > 0)).toBe(true);
      expect(stage.enemyWaves.some((w) => (w.chargerCount ?? 0) > 0)).toBe(true);
      expect(stage.midBrute).toBeDefined();
      expect(stage.midBrutes?.length).toBe(3);
      expect(stage.midBrute!.maxHp).toBeGreaterThanOrEqual(6000);
      expect(stage.boss.maxHp).toBeGreaterThanOrEqual(10500);
      expect(stage.boss.salvoLanes).toBe(2);
      expect(stage.boss.salvoDamage).toBeGreaterThanOrEqual(7);
      expect(stage.boss.salvoDamage).toBeLessThanOrEqual(18);

      const expectedLayout = stage.stageNumber % 2 === 0 ? 'SPLIT_CAUSEWAY' : 'STANDARD_BRIDGE';
      expect(stage.boardLayout).toBe(expectedLayout);
      if (expectedLayout === 'SPLIT_CAUSEWAY') {
        expect(stage.splitCauseway).toBeDefined();
        expect(stage.splitCauseway!.leftQueue.length).toBe(28);
        expect(stage.splitCauseway!.rightEchelons.length).toBe(26);
        expect(
          stage.splitCauseway!.rightEchelons[0].cols *
            stage.splitCauseway!.rightEchelons[0].rows
        ).toBeGreaterThanOrEqual(20);
        expect(stage.splitCauseway!.goliathSpawns.length).toBe(3);
        expect(stage.splitCauseway!.marchSpeed).toBeGreaterThanOrEqual(6.80);
        expect(stage.splitCauseway!.leftQueue[0].barrelHp).toBeGreaterThanOrEqual(35);
        expect(stage.splitCauseway!.leftQueue[27].barrelHp).toBeGreaterThanOrEqual(40000);
        expect(stage.splitCauseway!.goliathSpawns[0].speed).toBeGreaterThanOrEqual(4.60);
      }

      seenChassis.add(stage.boss.chassis);
    }
    expect(seenChassis).toEqual(
      new Set(['WARDEN_MECH', 'SIEGE_TANK', 'KRAKEN_WALKER', 'SOVEREIGN_TITAN'])
    );

    const split1 = generateSplitCausewayStage(1);
    const split2 = generateSplitCausewayStage(2);
    const split6 = generateSplitCausewayStage(6);
    expect(split1.boardLayout).toBe('SPLIT_CAUSEWAY');
    expect(split1.splitCauseway?.leftQueue[0].reward).toEqual({
      kind: 'GATE',
      operator: 'ADD',
      value: 2,
    });
    expect(split1.boss.salvoLanes).toBe(2);
    expect(split2.boss.salvoLanes).toBe(2);
    expect(split1.splitCauseway!.marchSpeed).toBeGreaterThanOrEqual(6.80);
    expect(split6.splitCauseway!.marchSpeed).toBeGreaterThan(split1.splitCauseway!.marchSpeed);
    expect(split6.boss.maxHp).toBeGreaterThan(split1.boss.maxHp);

    const wave1 = generateEndlessWaveStage(1);
    const wave2 = generateEndlessWaveStage(2);
    const wave4 = generateEndlessWaveStage(4);
    const wave5 = generateEndlessWaveStage(5);
    expect(wave1.boardLayout).toBe('STANDARD_BRIDGE');
    expect(wave2.boardLayout).toBe('SPLIT_CAUSEWAY');
    expect(wave1.supplyDrums.length).toBe(60);
    expect(wave1.tireStacks.length).toBe(24);
    expect(wave1.midBrute).toBeDefined();
    expect(wave5.boss.maxHp).toBeGreaterThan(wave1.boss.maxHp);
    expect(wave1.boss.salvoLanes).toBe(2);
    expect(wave2.boss.salvoLanes).toBe(2);
    expect(wave5.boss.salvoLanes).toBe(2);
    expect(wave4.boss.chassis).toBe('SOVEREIGN_TITAN');

    // Every EnemyWave on Standard Bridge stages must sit >= 42m away from every GatePair (front & rear)
    for (const stdStage of [
      ...CAMPAIGN_STAGES.filter((s) => s.boardLayout === 'STANDARD_BRIDGE'),
      wave1,
      wave5,
    ]) {
      for (const gate of stdStage.gatePairs) {
        for (const wv of stdStage.enemyWaves) {
          expect(Math.abs(wv.z - gate.z)).toBeGreaterThanOrEqual(42);
        }
      }
    }
  });

  it('defaults to UNICORN skin & NORMAL difficulty while sanitizing HARD/NIGHTMARE saves and Boss visual profiles', () => {
    const fresh = createDefaultSaveData();
    expect(fresh.settings.skinTheme).toBe('UNICORN');
    expect(fresh.settings.skinDefaultV72Applied).toBe(true);
    expect(fresh.difficulty).toBe('NORMAL');

    const clean = sanitizeSaveData({
      coins: 150.9,
      unlockedStage: 99,
      selectedStage: -4,
      selectedMode: 'SPLIT_CAUSEWAY',
      difficulty: 'NIGHTMARE',
      splitCausewayStage: 7.8,
      bestSplitStage: -2,
      upgrades: { fireRate: 3, bulletPower: 'bad' },
    });
    expect(clean.coins).toBe(150);
    expect(clean.unlockedStage).toBe(10);
    expect(clean.selectedStage).toBe(1);
    expect(clean.selectedMode).toBe('SPLIT_CAUSEWAY');
    expect(clean.difficulty).toBe('NIGHTMARE');
    expect(clean.splitCausewayStage).toBe(7);
    expect(clean.bestSplitStage).toBe(7);
    expect(clean.upgrades.fireRate).toBe(3);
    expect(clean.upgrades.bulletPower).toBe(0);
    expect(clean.settings.skinTheme).toBe('UNICORN');
    expect(clean.settings.skinDefaultV72Applied).toBe(false);

    const invalidDiff = sanitizeSaveData({ difficulty: 'IMPOSSIBLE_MODE' });
    expect(invalidDiff.difficulty).toBe('NORMAL');

    const tacticalClean = sanitizeSaveData({
      difficulty: 'HARD',
      settings: {
        muted: true,
        haptics: false,
        skinTheme: 'TACTICAL',
        skinDefaultV72Applied: true,
      },
    });
    expect(tacticalClean.difficulty).toBe('HARD');
    expect(tacticalClean.settings.skinTheme).toBe('TACTICAL');
    expect(tacticalClean.settings.skinDefaultV72Applied).toBe(true);
    expect(tacticalClean.settings.muted).toBe(true);
    expect(tacticalClean.settings.haptics).toBe(false);

    const invalidSkinClean = sanitizeSaveData({
      settings: { skinTheme: 'RAINBOW_INVALID' },
    });
    expect(invalidSkinClean.settings.skinTheme).toBe('UNICORN');

    // Verify Giant Battle Unicorn boss profiles across all 10 Campaign stages
    for (const stage of CAMPAIGN_STAGES) {
      const uniProfile = getBossVisualProfile(stage.boss, 'UNICORN');
      const tacProfile = getBossVisualProfile(stage.boss, 'TACTICAL');
      expect(uniProfile.name.length).toBeGreaterThan(4);
      expect(uniProfile.name).not.toBe(tacProfile.name);
      expect(uniProfile.archetypeLabel.length).toBeGreaterThan(4);
      expect(tacProfile.name).toBe(stage.boss.name);
    }
  });

  it('prevents enemy waves from marching toward or through uncollected Holo-Gates ahead of them', () => {
    const wave = new EnemyWaveSlot(0);
    wave.configure({
      z: -118,
      lane: 'CENTER',
      count: 36,
      hpPerEnemy: 12,
      speed: 2.8,
      coinPerKill: 4,
    });
    const initialFrontZ = wave.z;

    // Even if squad stands 2m in front of Gate (-74m) for 15s, wave holds behind the gate
    for (let t = 0; t < 150; t++) {
      wave.update(0.1, 0, -72, -74);
    }
    expect(wave.isMarching).toBe(false);
    expect(wave.z).toBeLessThanOrEqual(-74 - 32);
    expect(wave.z).toBeCloseTo(initialFrontZ, 3);

    // Once player passes through the gate (blockingGateZ = null) and approaches within 36m, wave engages!
    wave.update(0.5, 0, -86, null);
    expect(wave.isMarching).toBe(true);
    expect(wave.z).toBeGreaterThan(initialFrontZ);
  });

  it('rolls lane barrels & Spiked Hazard Drums toward squad with lethal-capable casualties, dodged pass-through, and break rewards', async () => {
    const {
      computeRollingBarrelAttrition,
      ROLLING_BARREL_CRASH_HALF_X,
      SupplyDrumSlot,
    } = await import('../src/entities/SupplyDrum');

    // v8.2 Attrition scales with remaining HP and removes artificial immortality floor on depleted squads,
    // while Spiked Hazard Drums deal strictly heavier damage than standard barrels!
    for (const squadSize of [6, 15, 40]) {
      const lossFull = computeRollingBarrelAttrition(squadSize, 100, 100, false);
      const lossLow = computeRollingBarrelAttrition(squadSize, 20, 100, false);
      const lossSpiked = computeRollingBarrelAttrition(squadSize, 100, 100, true);
      expect(lossFull).toBeGreaterThanOrEqual(2);
      expect(lossLow).toBeLessThanOrEqual(lossFull);
      expect(lossSpiked).toBeGreaterThan(lossFull);
    }
    // Small 2-soldier squad hit by a full-HP barrel can be wiped out (no artificial immortality!)
    expect(computeRollingBarrelAttrition(2, 100, 100, false)).toBe(2);
    expect(computeRollingBarrelAttrition(1, 50, 50, false)).toBe(1);

    // Rolling physics: translates +Z and rotates around local X-axis during combat
    const barrel = new SupplyDrumSlot(0);
    barrel.configure({
      z: -24,
      lane: 'CENTER',
      hp: 68,
      rewardType: 'COINS',
      rewardValue: 4,
      rollSpeed: 3.4,
      isHazard: true,
    });
    expect(barrel.isHazard).toBe(true);
    const startZ = barrel.z;
    barrel.update(0.5, 0, null, true);
    expect(barrel.isRolling).toBe(true);
    expect(barrel.z).toBeGreaterThan(startZ);
    expect(barrel.rollAngleX).toBeGreaterThan(0);

    // Dodged laterally: returns null so barrel rolls harmlessly past flank
    expect(
      barrel.resolveSquadCollision(ROLLING_BARREL_CRASH_HALF_X + 0.4, barrel.z, 10)
    ).toBeNull();

    // Direct center collision: flags isHazard=true, deals heavy casualties, and consumes barrel
    const crash = barrel.resolveSquadCollision(0, barrel.z, 10);
    expect(crash).not.toBeNull();
    expect(crash!.isHazard).toBe(true);
    expect(crash!.losses).toBeGreaterThanOrEqual(3);
    expect(barrel.broken).toBe(true);

    // Breaking a rolling barrel with bullets returns 'SHATTERED' with reward preserved
    const rewardBarrel = new SupplyDrumSlot(1);
    rewardBarrel.configure({
      z: -18,
      lane: 'RIGHT',
      hp: 25,
      rewardType: 'WEAPON',
      rewardValue: 2,
      rollSpeed: 3.0,
    });
    expect(rewardBarrel.tryBulletHit(rewardBarrel.x, -18, -16, 15, -1)).toBe('HIT');
    expect(rewardBarrel.tryBulletHit(rewardBarrel.x, -18, -16, 15, -1)).toBe('SHATTERED');
    expect(rewardBarrel.rewardType).toBe('WEAPON');
    expect(rewardBarrel.rewardValue).toBe(2);
  });

  it('simulates Ranged Enemy Shooters firing lane-locked bolts and Armored Lane Chargers rushing with 1.5x stop bonus', async () => {
    const THREE = await import('three');
    const {
      doesEnemyBoltHitSquad,
      EnemyProjectileSystem,
    } = await import('../src/entities/EnemyProjectileSystem');

    // Pure hit-test geometry: direct hit vs. lateral dodge
    expect(doesEnemyBoltHitSquad(0, 0, 10)).toBe(true);
    expect(doesEnemyBoltHitSquad(-2.6, 2.6, 10)).toBe(false);

    const scene = new THREE.Scene();
    const proj = new EnemyProjectileSystem(scene);
    const wave = new EnemyWaveSlot(2);
    wave.configure({
      z: -24,
      lane: 'CENTER',
      count: 14,
      hpPerEnemy: 18,
      speed: 3.0,
      heavyCount: 3,
      shooterCount: 4,
      chargerCount: 2,
      coinPerKill: 10,
    });

    let sawBoltFired = false;
    let sawChargeStart = false;
    for (let step = 0; step < 65; step++) {
      proj.beginTelegraphs();
      wave.update(0.05, 0, 0, null, proj, 1.35, 2);
      proj.finishTelegraphs();
      if (wave.lastStepFiredBolt) sawBoltFired = true;
      if (wave.lastStepStartedCharge) sawChargeStart = true;
      // Keep squad dodged far away so we can inspect bolts & rushing chargers cleanly
      proj.update(0.05, 4.8, 0, 12);
    }

    expect(sawBoltFired).toBe(true);
    expect(sawChargeStart).toBe(true);

    // Direct bolt hit deducts exact bolt damage
    proj.clear();
    proj.spawnBolt(0, -1.0, 20, 3);
    proj.update(0.05, 0, 0, 10);
    expect(proj.lastStepHitDamage).toBe(3);

    // Dodged bolt increments lastStepDodgedCount with zero hit damage
    proj.spawnBolt(-3.5, 0.9, 20, 2);
    proj.update(0.05, 3.2, 0, 10);
    expect(proj.lastStepHitDamage).toBe(0);
    expect(proj.lastStepDodgedCount).toBe(1);
  });

  it('triggers Boss 50% HP Enrage Phase, Escort Squad Summons, and Armor Segment pushback recoil', async () => {
    const THREE = await import('three');
    const { BossEntity } = await import('../src/entities/BossEntity');
    const scene = new THREE.Scene();
    const boss = new BossEntity(scene);
    boss.configure(CAMPAIGN_STAGES[0].boss, 100);

    const startZ = boss.z;
    // Break first armor segment (>20% of 5-segment boss HP) -> triggers recoil pushback (-Z)
    boss.tryBulletHit(0, boss.z, boss.z + 2, boss.maxHp * 0.25, 1.0, -1);
    expect(boss.lastStepSegmentBroken).toBe(true);
    expect(boss.z).toBeLessThan(startZ);

    // Drop below 50% HP -> triggers Enrage on next update & periodic Escort Summon shortly after
    boss.tryBulletHit(0, boss.z, boss.z + 2, boss.maxHp * 0.30, 1.0, -1);
    boss.update(0.05, true, 0, -100, 20, 1.0);
    expect(boss.isEnraged).toBe(true);
    expect(boss.lastStepEnrageTriggered).toBe(true);

    let summonedEscorts = false;
    for (let step = 0; step < 25; step++) {
      boss.update(0.05, true, 0, -100, 20, 1.0);
      if (boss.lastStepSummonEscorts && boss.lastStepEscortCount >= 6) {
        summonedEscorts = true;
        break;
      }
    }
    expect(summonedEscorts).toBe(true);
  });

  it('keeps Split Causeway Left-Column power-up barrel HP damage persistent with zero passive decay', async () => {
    const {
      LEFT_LANE_CENTER_X,
      SplitCausewayController,
    } = await import('../src/entities/SplitCausewayController');

    const splitStage = generateSplitCausewayStage(1);
    const ctrl = new SplitCausewayController();
    ctrl.configure(splitStage.splitCauseway!, 0);

    const startHp = ctrl.getFrontLeftBarrelHp();
    expect(startHp).toBeGreaterThan(20);

    const hit = ctrl.tryLeftQueueBulletHit(LEFT_LANE_CENTER_X, -10.4, -8.0, 14, -1);
    expect(hit.type).toBe('BARREL_HIT');
    const damagedHp = ctrl.getFrontLeftBarrelHp();
    expect(damagedHp).toBeCloseTo(startHp - 14, 3);

    // Shift squad right for 3 full seconds while fighting Right-Column enemies: Left barrel HP NEVER regenerates!
    for (let i = 0; i < 60; i++) {
      ctrl.update(0.05, 2.8, 0, true);
    }
    expect(ctrl.getFrontLeftBarrelHp()).toBeCloseTo(damagedHp, 4);
  });

  it('steers Split Causeway Right-Column enemies across the open foreground arena toward squadX after clearing dividerTipZ', async () => {
    const {
      LEFT_LANE_CENTER_X,
      SplitCausewayController,
    } = await import('../src/entities/SplitCausewayController');

    const splitStage = generateSplitCausewayStage(1);
    const ctrl = new SplitCausewayController();
    ctrl.configure(splitStage.splitCauseway!, 0);

    // Record initial X of front-row right-column enemies (all start right of SPLIT_DIVIDER_X = -0.88)
    const initialFrontX = ctrl.unitX[0];
    expect(initialFrontX).toBeGreaterThan(-0.88);

    // Hold squad in Left Power-Up Column (-3.50) until front echelon marches past dividerTipZ (-7.4)
    for (let i = 0; i < 75; i++) {
      ctrl.update(0.05, LEFT_LANE_CENTER_X, 0, true);
    }

    // Front-row chasers must have crossed past dividerTipZ and peeled left toward squadX (-3.50)!
    let crossedAndSteeredLeft = 0;
    for (let i = 0; i < Math.min(20, ctrl.totalTroopers); i++) {
      if (ctrl.unitAlive[i] && ctrl.unitZ[i] > ctrl.dividerTipZ && ctrl.unitX[i] < -0.5) {
        crossedAndSteeredLeft++;
      }
    }
    expect(crossedAndSteeredLeft).toBeGreaterThanOrEqual(2);
  });
});
