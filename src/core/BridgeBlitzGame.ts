import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import { BossEntity } from '../entities/BossEntity';
import { EnemyWaveSlot } from '../entities/EnemyWave';
import { GatePairSlot } from '../entities/GatePair';
import { SquadController } from '../entities/SquadController';
import { TireWeaponStackSlot } from '../entities/TireWeaponStack';
import { computeSquadOuterRadius } from '../math/formationMath';
import {
  attemptPurchaseUpgrade,
  computeRunCoinPayout,
  getBulletPowerMultiplier,
  getFireRateMultiplier,
  getStartingSquadCount,
  UPGRADE_ORDER,
} from '../math/progressionMath';
import {
  MAX_VISUAL_SOLDIERS,
  resolveWeaponPickup,
  WEAPON_SPECS,
} from '../math/weaponMath';
import { BridgeEnvironment } from '../rendering/BridgeEnvironment';
import { CombatTextOverlay } from '../rendering/CombatTextOverlay';
import { InstancedBatchRenderer } from '../rendering/InstancedBatchRenderer';
import { SceneManager } from '../rendering/SceneManager';
import { HudController } from '../ui/HudController';
import { GameLoop } from './GameLoop';
import { GameStateMachine } from './GameStateMachine';
import { InputController } from './InputController';
import { BulletPool, ParticlePool } from './ObjectPool';
import { SaveManager } from './SaveManager';
import { getCampaignStage, generateEndlessWaveStage } from './StageData';
import type {
  GameMode,
  RunSummary,
  StageDefinition,
  TelemetrySnapshot,
  UpgradeKey,
} from './types';

const MAX_GATE_PAIRS = 6;
const MAX_TIRE_STACKS = 5;
const MAX_ENEMY_WAVES = 5;

export class BridgeBlitzGame {
  private readonly saveManager = new SaveManager();
  private readonly stateMachine = new GameStateMachine();
  private readonly sound: SoundSynthesizer;
  private readonly sceneManager: SceneManager;
  private readonly bridgeEnv: BridgeEnvironment;
  private readonly bulletPool = new BulletPool(1200);
  private readonly particlePool = new ParticlePool(900);
  private readonly batchRenderer: InstancedBatchRenderer;
  private readonly combatText: CombatTextOverlay;

  private readonly squad = new SquadController();
  private readonly gatePairs: GatePairSlot[] = [];
  private readonly tireStacks: TireWeaponStackSlot[] = [];
  private readonly enemyWaves: EnemyWaveSlot[] = [];
  private readonly boss: BossEntity;

  private readonly hud: HudController;
  private readonly input: InputController;
  private readonly loop: GameLoop;

  private activeStageDef: StageDefinition;
  private sectorBaseZ = 0;
  private endlessWave = 1;
  private elapsedTime = 0;
  private coinFountainTimer = 0;

  // Per-run counters
  private enemiesDefeatedThisRun = 0;
  private gatesFlippedThisRun = 0;
  private tiresBrokenThisRun = 0;
  private weaponLocksThisRun = 0;
  private bonusCoinsThisRun = 0;
  private pendingSummary: RunSummary | null = null;

  constructor() {
    const canvasContainer = document.getElementById('canvas-container');
    const combatTextContainer = document.getElementById('combat-text-layer');
    if (!canvasContainer || !combatTextContainer) {
      throw new Error('Required root DOM containers missing');
    }

    const initialSave = this.saveManager.getData();
    this.sound = new SoundSynthesizer(initialSave.settings);
    this.sceneManager = new SceneManager(canvasContainer);

    this.bridgeEnv = new BridgeEnvironment();
    this.sceneManager.scene.add(this.bridgeEnv.root);

    this.batchRenderer = new InstancedBatchRenderer(
      this.sceneManager.scene,
      this.bulletPool.capacity,
      this.particlePool.capacity
    );
    this.combatText = new CombatTextOverlay(combatTextContainer);

    for (let i = 0; i < MAX_GATE_PAIRS; i++) {
      const pair = new GatePairSlot(i);
      this.gatePairs.push(pair);
      this.sceneManager.scene.add(pair.root);
    }
    for (let i = 0; i < MAX_TIRE_STACKS; i++) {
      const stack = new TireWeaponStackSlot(i);
      this.tireStacks.push(stack);
      this.sceneManager.scene.add(stack.root);
    }
    for (let i = 0; i < MAX_ENEMY_WAVES; i++) {
      this.enemyWaves.push(new EnemyWaveSlot(i));
    }
    this.boss = new BossEntity(this.sceneManager.scene);

    this.activeStageDef = getCampaignStage(initialSave.selectedStage);

    this.hud = new HudController({
      onStartMarch: () => this.startRunIfStaging(),
      onBuyUpgrade: (key) => this.handleBuyUpgrade(key),
      onSelectMode: (mode) => this.handleSelectMode(mode),
      onStepStage: (delta) => this.handleStepStage(delta),
      onToggleMute: () => this.handleToggleMute(),
      onToggleHaptics: () => this.handleToggleHaptics(),
      onExportSave: () => this.handleExportSave(),
      onResetSave: () => this.handleResetSave(),
      onSummaryContinue: () => this.handleSummaryContinue(),
    });

    this.input = new InputController(canvasContainer, {
      onStartRequest: () => this.startRunIfStaging(),
      onUpgradeShortcut: (idx) => {
        if (this.stateMachine.state === 'PRE_RUN') {
          this.handleBuyUpgrade(UPGRADE_ORDER[idx]);
        }
      },
      onFirstGesture: () => this.sound.unlockOnGesture(),
      onContinueModal: () => {
        if (
          this.stateMachine.state === 'VICTORY' ||
          this.stateMachine.isWipeoutModalReady
        ) {
          this.handleSummaryContinue();
        }
      },
    });

    this.prepareStagingArea();

    this.loop = new GameLoop(
      (fixedDt) => this.fixedUpdate(fixedDt),
      (realDt) => this.renderFrame(realDt)
    );
    this.loop.start();
  }

  private prepareStagingArea(): void {
    const save = this.saveManager.getData();
    this.endlessWave = 1;
    this.sectorBaseZ = 0;
    this.enemiesDefeatedThisRun = 0;
    this.gatesFlippedThisRun = 0;
    this.tiresBrokenThisRun = 0;
    this.weaponLocksThisRun = 0;
    this.bonusCoinsThisRun = 0;
    this.pendingSummary = null;
    this.coinFountainTimer = 0;

    this.bulletPool.clear();
    this.particlePool.clear();
    this.combatText.clear();
    this.input.resetFrameDeltas();

    this.activeStageDef =
      save.selectedMode === 'ENDLESS'
        ? generateEndlessWaveStage(1)
        : getCampaignStage(save.selectedStage);

    this.populateSectorEntities(this.activeStageDef, 0);

    const startTroops = getStartingSquadCount(save.upgrades.startingSquad);
    this.squad.resetForRun(startTroops);

    this.stateMachine.transitionTo('PRE_RUN');
    this.hud.hideSummaryModal();
    this.hud.setStagingVisible(true);
    this.hud.syncSaveState(save, this.activeStageDef.title, this.endlessWave);
    this.hud.updateTrackProgress(0, save.selectedMode, 0, this.endlessWave);
  }

  private populateSectorEntities(stage: StageDefinition, zBase: number): void {
    for (let i = 0; i < MAX_GATE_PAIRS; i++) {
      const def = stage.gatePairs[i];
      if (def) {
        this.gatePairs[i].configure({
          ...def,
          z: zBase + def.z,
        });
      } else {
        this.gatePairs[i].hide();
      }
    }

    for (let i = 0; i < MAX_TIRE_STACKS; i++) {
      const def = stage.tireStacks[i];
      if (def) {
        this.tireStacks[i].configure({
          ...def,
          z: zBase + def.z,
        });
      } else {
        this.tireStacks[i].hide();
      }
    }

    for (let i = 0; i < MAX_ENEMY_WAVES; i++) {
      const def = stage.enemyWaves[i];
      if (def) {
        this.enemyWaves[i].configure({
          ...def,
          z: zBase + def.z,
        });
      } else {
        this.enemyWaves[i].hide();
      }
    }

    const bossTrackEnd = -zBase + stage.trackLength;
    this.bridgeEnv.configureBossPlatformZ(zBase - stage.trackLength);
    this.boss.configure(stage.boss, bossTrackEnd);
  }

  public startRunIfStaging(): void {
    if (this.stateMachine.state !== 'PRE_RUN') {
      return;
    }
    this.sound.unlockOnGesture();
    this.hud.setStagingVisible(false);
    this.stateMachine.transitionTo('RUNNING');
  }

  private handleBuyUpgrade(key: UpgradeKey): void {
    if (this.stateMachine.state !== 'PRE_RUN') {
      return;
    }
    this.sound.unlockOnGesture();
    const save = this.saveManager.getData();
    const res = attemptPurchaseUpgrade(save.coins, save.upgrades, key);
    if (!res.purchased) {
      return;
    }

    const updated = this.saveManager.update((draft) => {
      draft.coins = res.remainingCoins;
      draft.upgrades = res.nextUpgrades;
    });

    this.sound.playUpgradeBuy();
    if (key === 'startingSquad') {
      const nextCount = getStartingSquadCount(updated.upgrades.startingSquad);
      this.squad.setLogicalCount(nextCount);
      this.particlePool.spawnBurst(this.squad.x, 0.7, this.squad.z, 14, 4.5, 0x3bf088);
      this.combatText.spawn(this.squad.x, 1.5, this.squad.z, '+1 STARTING SQUAD', 'positive');
    } else {
      this.particlePool.spawnBurst(this.squad.x, 0.7, this.squad.z, 10, 3.8, 0xffd166);
    }

    this.hud.syncSaveState(updated, this.activeStageDef.title, this.endlessWave);
  }

  private handleSelectMode(mode: GameMode): void {
    if (this.stateMachine.state !== 'PRE_RUN') {
      return;
    }
    this.saveManager.update((draft) => {
      draft.selectedMode = mode;
    });
    this.prepareStagingArea();
  }

  private handleStepStage(delta: -1 | 1): void {
    if (this.stateMachine.state !== 'PRE_RUN') {
      return;
    }
    this.saveManager.update((draft) => {
      const next = Math.max(1, Math.min(draft.unlockedStage, draft.selectedStage + delta));
      draft.selectedStage = next;
    });
    this.prepareStagingArea();
  }

  private handleToggleMute(): void {
    const next = this.saveManager.update((draft) => {
      draft.settings.muted = !draft.settings.muted;
    });
    this.sound.updateSettings(next.settings);
    this.hud.syncSaveState(next, this.activeStageDef.title, this.endlessWave);
  }

  private handleToggleHaptics(): void {
    const next = this.saveManager.update((draft) => {
      draft.settings.haptics = !draft.settings.haptics;
    });
    this.sound.updateSettings(next.settings);
    this.hud.syncSaveState(next, this.activeStageDef.title, this.endlessWave);
  }

  private handleExportSave(): void {
    const json = this.saveManager.exportJson();
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bridge-blitz-save.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Ignore if download blocked in headless environments
    }
  }

  private handleResetSave(): void {
    const fresh = this.saveManager.reset();
    this.sound.updateSettings(fresh.settings);
    this.prepareStagingArea();
  }

  private handleSummaryContinue(): void {
    this.prepareStagingArea();
  }

  private fixedUpdate(rawDt: number): void {
    const dt = rawDt * this.stateMachine.timeScale;
    this.elapsedTime += dt;

    const state = this.stateMachine.state;
    const save = this.saveManager.getData();
    const lateralDelta =
      state === 'RUNNING' || state === 'BOSS_FIGHT'
        ? this.input.consumeHorizontalDelta(dt)
        : 0;
    if (state !== 'RUNNING' && state !== 'BOSS_FIGHT') {
      this.input.resetFrameDeltas();
    }

    if (state === 'PRE_RUN') {
      this.squad.updateMovement(dt, 0, false, false);
    } else if (state === 'RUNNING') {
      this.squad.updateMovement(dt, lateralDelta, true, true);
      const fired = this.squad.updateAutoFire(
        dt,
        getFireRateMultiplier(save.upgrades.fireRate),
        getBulletPowerMultiplier(save.upgrades.bulletPower),
        this.bulletPool
      );
      if (fired) {
        this.sound.playGunfire(this.squad.weaponTier);
      }

      // Check transition to Boss Platform at 100% sector progress
      const sectorDist = this.sectorBaseZ - this.squad.z;
      if (sectorDist >= this.activeStageDef.trackLength) {
        this.squad.z = this.sectorBaseZ - this.activeStageDef.trackLength;
        this.stateMachine.transitionTo('BOSS_FIGHT');
        this.combatText.spawn(
          0,
          2.6,
          this.boss.z,
          `${this.boss.name.toUpperCase()}!`,
          'negative',
          1.1
        );
      }
    } else if (state === 'BOSS_FIGHT') {
      this.squad.updateMovement(dt, lateralDelta, false, true);
      const fired = this.squad.updateAutoFire(
        dt,
        getFireRateMultiplier(save.upgrades.fireRate),
        getBulletPowerMultiplier(save.upgrades.bulletPower),
        this.bulletPool
      );
      if (fired) {
        this.sound.playGunfire(this.squad.weaponTier);
      }
    }

    // Update Gate Visuals & Squad Gate Passes
    for (let i = 0; i < MAX_GATE_PAIRS; i++) {
      const pair = this.gatePairs[i];
      pair.updateVisuals(dt);
      if (state === 'RUNNING' && this.squad.logicalCount > 0) {
        const collect = pair.trySquadCollect(
          this.squad.x,
          this.squad.z,
          this.squad.logicalCount
        );
        if (collect) {
          this.squad.setLogicalCount(collect.nextSquadCount);
          this.sound.playGateCollect(collect.positive);
          this.particlePool.spawnBurst(
            collect.worldX,
            1.2,
            collect.worldZ,
            18,
            5.8,
            collect.positive ? 0x3bf088 : 0xff4757
          );
          const sign = collect.deltaSquad >= 0 ? '+' : '';
          this.combatText.spawn(
            collect.worldX,
            1.8,
            collect.worldZ,
            `${collect.label} (${sign}${collect.deltaSquad})`,
            collect.positive ? 'positive' : 'negative'
          );
          if (this.squad.logicalCount <= 0) {
            this.triggerRunDefeat();
          }
        }
      }
    }

    // Update Tire Stacks & Unbroken Roadblock Bumps
    const squadRadius = computeSquadOuterRadius(this.squad.logicalCount);
    for (let i = 0; i < MAX_TIRE_STACKS; i++) {
      const stack = this.tireStacks[i];
      stack.update(dt);
      if (
        state === 'RUNNING' &&
        this.squad.logicalCount > 0 &&
        stack.checkUnbrokenSquadBump(this.squad.x, this.squad.z, squadRadius)
      ) {
        this.sceneManager.addShake(0.32);
        this.particlePool.spawnBurst(stack.x, 0.8, stack.z, 14, 5.0, 0x2d3436);
        this.squad.setLogicalCount(this.squad.logicalCount - 1);
        this.combatText.spawn(stack.x, 1.4, stack.z, '-1 TIRE CRASH', 'negative');
        if (this.squad.logicalCount <= 0) {
          this.triggerRunDefeat();
        }
      }
    }

    // Update Enemy Waves & 1-for-1 Collisions
    for (let i = 0; i < MAX_ENEMY_WAVES; i++) {
      const wave = this.enemyWaves[i];
      if (state === 'RUNNING' || state === 'BOSS_FIGHT') {
        wave.update(dt, this.squad.x, this.squad.z);
        if (this.squad.logicalCount > 0) {
          const cancelled = wave.resolveSquadCollision(
            this.squad.x,
            this.squad.z,
            this.squad.logicalCount
          );
          if (cancelled > 0) {
            this.enemiesDefeatedThisRun += cancelled;
            this.squad.setLogicalCount(this.squad.logicalCount - cancelled);
            this.sceneManager.addShake(0.24);
            this.sound.playEnemyPop();
            this.particlePool.spawnBurst(
              (this.squad.x + wave.x) * 0.5,
              0.7,
              (this.squad.z + wave.z) * 0.5,
              12,
              5.2,
              0xff4757
            );
            this.combatText.spawn(
              this.squad.x,
              1.4,
              this.squad.z,
              `-${cancelled}`,
              'negative',
              0.55
            );
            if (this.squad.logicalCount <= 0) {
              this.triggerRunDefeat();
            }
          }
        }
      }
    }

    // Update Boss Mech
    if (state === 'RUNNING' || state === 'BOSS_FIGHT') {
      this.boss.update(
        dt,
        state === 'BOSS_FIGHT',
        this.squad.x,
        this.squad.z,
        this.squad.logicalCount
      );
      if (this.boss.lastStepTriggeredShake) {
        this.sceneManager.addShake(this.boss.lastStepSlamDamage > 0 ? 0.55 : 0.16);
      }
      if (this.boss.lastStepSlamDamage > 0 && this.squad.logicalCount > 0) {
        const lost = Math.min(this.squad.logicalCount, this.boss.lastStepSlamDamage);
        this.squad.setLogicalCount(this.squad.logicalCount - lost);
        this.sound.playEnemyPop();
        this.particlePool.spawnBurst(this.squad.x, 0.9, this.squad.z, 18, 6.8, 0xff3838);
        this.combatText.spawn(this.squad.x, 1.7, this.squad.z, `-${lost} SLAM!`, 'negative');
        if (this.squad.logicalCount <= 0) {
          this.triggerRunDefeat();
        }
      }
    }

    // Update Active Bullets & Collisions
    this.updateBullets(dt);

    // Celebratory Victory Coin Fountain
    if (this.stateMachine.state === 'VICTORY') {
      this.coinFountainTimer -= dt;
      if (this.coinFountainTimer <= 0) {
        this.coinFountainTimer = 0.055;
        for (let c = 0; c < 3; c++) {
          const ang = (this.elapsedTime * 7 + c * 2.1) % (Math.PI * 2);
          this.particlePool.spawn(
            Math.cos(ang) * 0.8,
            0.9,
            this.squad.z - 5.5,
            Math.cos(ang) * 4.5,
            9.8 + (c % 3) * 1.4,
            Math.sin(ang) * 3.5,
            -18,
            1.1,
            0.22,
            0xffd166
          );
        }
      }
    }

    this.particlePool.update(dt);
    this.bridgeEnv.update(dt, this.elapsedTime, this.squad.z);
    this.sceneManager.updateCamera(
      dt,
      this.squad.x,
      this.squad.z,
      this.stateMachine.state === 'BOSS_FIGHT'
    );
  }

  private updateBullets(dt: number): void {
    const pool = this.bulletPool;
    const bossArmorFactor = WEAPON_SPECS[this.squad.weaponTier].bossArmorFactor;

    let i = 0;
    while (i < pool.activeCount) {
      const nextAge = pool.age[i] + dt;
      if (nextAge >= pool.maxAge[i]) {
        pool.deactivate(i);
        continue;
      }

      const prevZ = pool.z[i];
      const bx = pool.x[i] + pool.vx[i] * dt;
      const bz = prevZ + pool.vz[i] * dt;

      if (bz < this.squad.z - 58) {
        pool.deactivate(i);
        continue;
      }

      pool.age[i] = nextAge;
      pool.x[i] = bx;
      pool.z[i] = bz;

      const dmg = pool.damage[i];
      const lastHit = pool.lastHitEntityId[i];
      let consumedHit = false;

      // 1. Check Gate Pairs
      for (let g = 0; g < MAX_GATE_PAIRS; g++) {
        const hit = this.gatePairs[g].tryBulletHit(bx, bz, prevZ, dmg, lastHit);
        if (!hit) {
          continue;
        }
        pool.lastHitEntityId[i] = hit.entityId;
        consumedHit = true;

        if (hit.ricochet) {
          this.sound.playRicochet();
          this.particlePool.spawnBurst(hit.hitX, 1.2, hit.hitZ, 3, 4.2, 0xffe066, 0.1, 0.25);
        } else {
          this.particlePool.spawnBurst(
            hit.hitX,
            1.2,
            hit.hitZ,
            3,
            3.5,
            hit.newValue >= 0 ? 0x48ffa7 : 0xff6b81,
            0.11,
            0.24
          );
          if (hit.flippedToPositive) {
            this.gatesFlippedThisRun++;
            this.sound.playGateFlipChime();
            this.sceneManager.addShake(0.2);
            this.particlePool.spawnBurst(hit.hitX, 1.5, hit.hitZ, 20, 6.5, 0x36f3ff, 0.18, 0.55);
            this.combatText.spawn(hit.hitX, 2.3, hit.hitZ, 'GATE FLIPPED!', 'cyan', 0.95);
          } else if (hit.deltaIncrements > 0) {
            this.sound.playGateTick(hit.newValue);
            this.combatText.spawn(
              hit.hitX,
              2.0,
              hit.hitZ,
              `+${hit.deltaIncrements}`,
              hit.newValue >= 0 ? 'positive' : 'gold',
              0.45
            );
          }
        }
        break;
      }

      // 2. Check Weapon Tire Stacks
      if (!consumedHit) {
        for (let t = 0; t < MAX_TIRE_STACKS; t++) {
          const stack = this.tireStacks[t];
          const res = stack.tryBulletHit(bx, bz, prevZ, dmg, lastHit);
          if (res === 'NONE') {
            continue;
          }
          pool.lastHitEntityId[i] = stack.entityId;
          consumedHit = true;

          if (res === 'HIT') {
            this.particlePool.spawnBurst(bx, 0.85, stack.z, 3, 4.0, 0xffd166, 0.11, 0.25);
          } else if (res === 'SHATTERED') {
            this.handleTireStackShattered(stack);
          }
          break;
        }
      }

      // 3. Check Enemy Waves
      if (!consumedHit) {
        for (let w = 0; w < MAX_ENEMY_WAVES; w++) {
          const wave = this.enemyWaves[w];
          const kills = wave.tryBulletHit(bx, bz, prevZ, dmg, lastHit);
          if (kills < 0) {
            continue;
          }
          pool.lastHitEntityId[i] = wave.entityId;
          consumedHit = true;

          if (kills > 0) {
            this.enemiesDefeatedThisRun += kills;
            this.sound.playEnemyPop();
            this.particlePool.spawnBurst(bx, 0.65, wave.z, Math.min(10, 4 + kills * 2), 5.0, 0xff384c);
          } else {
            this.particlePool.spawnBurst(bx, 0.65, wave.z, 2, 3.2, 0xffffff, 0.09, 0.2);
          }
          break;
        }
      }

      // 4. Check Boss Entity (vulnerable once squad reaches Boss Platform in BOSS_FIGHT)
      if (!consumedHit && this.stateMachine.state === 'BOSS_FIGHT' && this.boss.active) {
        const bossRes = this.boss.tryBulletHit(
          bx,
          bz,
          prevZ,
          dmg,
          bossArmorFactor,
          lastHit
        );
        if (bossRes !== 'NONE') {
          pool.lastHitEntityId[i] = this.boss.entityId;
          consumedHit = true;
          this.particlePool.spawnBurst(bx, 1.4, this.boss.z + 0.6, 4, 4.6, 0xffbe3b, 0.12, 0.28);
          if (bossRes === 'DEFEATED') {
            this.handleBossDefeated();
          }
        }
      }

      if (consumedHit) {
        pool.pierceLeft[i] -= 1;
        if (pool.pierceLeft[i] <= 0) {
          pool.deactivate(i);
          continue;
        }
      }

      i++;
    }
  }

  private handleTireStackShattered(stack: TireWeaponStackSlot): void {
    this.tiresBrokenThisRun++;
    this.sceneManager.addShake(0.38);
    this.particlePool.spawnBurst(stack.x, 1.1, stack.z, 24, 6.8, 0x2d3436, 0.2, 0.55);

    const pickup = resolveWeaponPickup(this.squad.weaponTier, stack.weaponTier);
    this.sound.playTireBreak(pickup.upgraded);

    if (pickup.upgraded) {
      this.squad.weaponTier = pickup.equippedTier;
      const colorHex = WEAPON_SPECS[pickup.equippedTier].colorHex;
      this.particlePool.spawnBurst(this.squad.x, 1.1, this.squad.z, 20, 6.0, colorHex, 0.18, 0.55);
      this.combatText.spawn(
        stack.x,
        2.1,
        stack.z,
        pickup.bannerText,
        pickup.equippedTier === 5 ? 'cyan' : 'gold',
        1.1
      );
    } else {
      // Mandatory Anti-Frustration Weapon Lock Bonus!
      this.weaponLocksThisRun++;
      this.bonusCoinsThisRun += pickup.bonusCoins;
      this.squad.setLogicalCount(this.squad.logicalCount + pickup.bonusSquad);
      this.particlePool.spawnBurst(stack.x, 1.3, stack.z, 22, 6.2, 0xffd166, 0.18, 0.6);
      this.combatText.spawn(
        stack.x,
        2.2,
        stack.z,
        `${pickup.bannerText} & +${pickup.bonusSquad} SQUAD`,
        'gold',
        1.15
      );
    }
  }

  private handleBossDefeated(): void {
    this.sound.playBossDefeat();
    this.sceneManager.addShake(0.68);
    this.particlePool.spawnBurst(this.boss.x, 2.0, this.boss.z, 46, 9.5, 0xffae42, 0.26, 0.85);
    this.particlePool.spawnBurst(this.boss.x, 2.2, this.boss.z, 32, 8.0, 0xff384c, 0.24, 0.75);

    const save = this.saveManager.getData();

    // In Endless Bridge Mode, seamlessly chain into the next Endless Sector!
    if (save.selectedMode === 'ENDLESS') {
      this.bonusCoinsThisRun += this.boss.rewardCoins;
      this.combatText.spawn(
        0,
        2.6,
        this.squad.z - 4,
        `WAVE ${this.endlessWave} CLEARED! +${this.boss.rewardCoins} COINS`,
        'gold',
        1.3
      );
      this.endlessWave += 1;
      this.sectorBaseZ = this.squad.z;
      this.activeStageDef = generateEndlessWaveStage(this.endlessWave);
      this.populateSectorEntities(this.activeStageDef, this.sectorBaseZ);
      this.stateMachine.transitionTo('RUNNING');
      return;
    }

    // Campaign Stage Cleared -> VICTORY!
    const summary = this.finalizeRunRewards('VICTORY', true);
    this.pendingSummary = summary;
    this.stateMachine.transitionTo('VICTORY');
    this.hud.showSummaryModal(summary);
  }

  private triggerRunDefeat(): void {
    if (
      this.stateMachine.state === 'DEFEAT' ||
      this.stateMachine.state === 'VICTORY'
    ) {
      return;
    }
    this.squad.setLogicalCount(0);
    this.sceneManager.addShake(0.55);
    const summary = this.finalizeRunRewards('DEFEAT', false);
    this.pendingSummary = summary;
    this.stateMachine.transitionTo('DEFEAT');
  }

  private finalizeRunRewards(
    outcome: 'VICTORY' | 'DEFEAT',
    clearedStage: boolean
  ): RunSummary {
    const save = this.saveManager.getData();
    const totalDistanceMeters = Math.max(0, -this.squad.z);
    const sectorProgress = Math.max(
      0,
      Math.min(1, (this.sectorBaseZ - this.squad.z) / this.activeStageDef.trackLength)
    );

    const effectiveProgressForCoins =
      save.selectedMode === 'ENDLESS'
        ? totalDistanceMeters / 220
        : clearedStage
          ? 1.0
          : sectorProgress;

    const payout = computeRunCoinPayout({
      progressRatio: effectiveProgressForCoins,
      stageNumber: this.activeStageDef.stageNumber,
      enemiesDefeated: this.enemiesDefeatedThisRun,
      bonusCoinsCollected: this.bonusCoinsThisRun,
      bossRewardCoins: this.boss.rewardCoins,
      clearedStage,
      warChestLevel: save.upgrades.warChest,
    });

    const summary: RunSummary = {
      outcome,
      mode: save.selectedMode,
      stageNumber:
        save.selectedMode === 'ENDLESS' ? this.endlessWave : save.selectedStage,
      distanceMeters: clearedStage && save.selectedMode === 'CAMPAIGN'
        ? this.activeStageDef.trackLength
        : totalDistanceMeters,
      progressRatio: clearedStage ? 1 : sectorProgress,
      enemiesDefeated: this.enemiesDefeatedThisRun,
      gatesFlipped: this.gatesFlippedThisRun,
      peakSquad: this.squad.peakCount,
      distanceCoins: payout.distanceCoins,
      killCoins: payout.killCoins,
      bonusCoins: payout.bonusCoins,
      warChestMultiplier: payout.warChestMultiplier,
      totalCoinsEarned: payout.totalCoinsEarned,
    };

    const updated = this.saveManager.update((draft) => {
      draft.coins += payout.totalCoinsEarned;
      draft.highScoreSquad = Math.max(draft.highScoreSquad, this.squad.peakCount);
      if (draft.selectedMode === 'ENDLESS') {
        draft.bestEndlessDistance = Math.max(
          draft.bestEndlessDistance,
          Math.round(totalDistanceMeters)
        );
      } else if (clearedStage) {
        if (draft.selectedStage >= draft.unlockedStage && draft.unlockedStage < 10) {
          draft.unlockedStage += 1;
        }
        if (draft.selectedStage < 10) {
          draft.selectedStage += 1;
        }
      }
    });

    this.hud.updateCoins(updated.coins);
    return summary;
  }

  private renderFrame(realDt: number): void {
    // Advance real-time 0.8s wipeout slow-motion reveal
    if (this.stateMachine.tickRealTime(realDt) && this.pendingSummary) {
      this.hud.showSummaryModal(this.pendingSummary);
    }

    const state = this.stateMachine.state;
    const isMoving = state === 'RUNNING' || state === 'BOSS_FIGHT';

    // Sync GPU InstancedMesh batches
    this.batchRenderer.syncPlayerSoldiers(
      this.squad.logicalCount,
      this.squad.soldierWorldX,
      this.squad.soldierWorldZ,
      this.squad.marchPhase,
      isMoving
    );

    this.batchRenderer.beginEnemyFrame();
    for (let i = 0; i < MAX_ENEMY_WAVES; i++) {
      this.enemyWaves[i].pushInstances(this.batchRenderer);
    }
    this.batchRenderer.finishEnemyFrame();

    this.batchRenderer.syncBullets(this.bulletPool);
    this.batchRenderer.syncParticles(this.particlePool);

    this.sceneManager.render();

    // Update 2D / Projected HUD overlays
    const save = this.saveManager.getData();
    const sectorRatio = Math.max(
      0,
      Math.min(1, (this.sectorBaseZ - this.squad.z) / this.activeStageDef.trackLength)
    );
    this.hud.updateTrackProgress(
      sectorRatio,
      save.selectedMode,
      Math.max(0, -this.squad.z),
      this.endlessWave
    );

    this.hud.updateWorldOverlays(
      this.sceneManager,
      this.squad.x,
      this.squad.z,
      this.squad.logicalCount,
      this.squad.weaponTier,
      this.enemyWaves,
      state === 'BOSS_FIGHT' && this.boss.active,
      this.boss.name,
      this.boss.currentHp,
      this.boss.maxHp,
      this.boss.segments
    );

    this.combatText.update(realDt, this.sceneManager);
  }

  /**
   * Read-only telemetry snapshot & deterministic steering helper for automated verification.
   */
  public getTelemetrySnapshot(): TelemetrySnapshot {
    const save = this.saveManager.getData();
    const progress = Math.max(
      0,
      Math.min(1, (this.sectorBaseZ - this.squad.z) / this.activeStageDef.trackLength)
    );
    return {
      state: this.stateMachine.state,
      mode: save.selectedMode,
      stage: save.selectedMode === 'ENDLESS' ? this.endlessWave : save.selectedStage,
      coins: save.coins,
      logicalSquad: this.squad.logicalCount,
      visualSquad: Math.min(this.squad.logicalCount, MAX_VISUAL_SOLDIERS),
      squadX: this.squad.x,
      squadZ: this.squad.z,
      progress,
      weaponTier: this.squad.weaponTier,
      weaponBadge: WEAPON_SPECS[this.squad.weaponTier].shortBadge,
      bossHp: this.boss.currentHp,
      bossMaxHp: this.boss.maxHp,
      gatesFlippedThisRun: this.gatesFlippedThisRun,
      tiresBrokenThisRun: this.tiresBrokenThisRun,
      weaponLocksTriggeredThisRun: this.weaponLocksThisRun,
      enemiesDefeatedThisRun: this.enemiesDefeatedThisRun,
      activeBullets: this.bulletPool.activeCount,
      activeParticles: this.particlePool.activeCount,
      upgrades: { ...save.upgrades },
    };
  }
}
