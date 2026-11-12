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
import { CombatVfxRenderer } from '../rendering/CombatVfxRenderer';
import { InstancedBatchRenderer } from '../rendering/InstancedBatchRenderer';
import {
  SceneManager,
  type CameraFramingMode,
} from '../rendering/SceneManager';
import { HudController } from '../ui/HudController';
import { GameLoop } from './GameLoop';
import { GameStateMachine } from './GameStateMachine';
import { InputController } from './InputController';
import { BulletPool, ParticlePool, RagdollPool } from './ObjectPool';
import { SaveManager } from './SaveManager';
import {
  CAMPAIGN_STAGES,
  generateEndlessWaveStage,
  getCampaignStage,
} from './StageData';
import type {
  GameMode,
  MenuTabId,
  RunSummary,
  StageDefinition,
  TelemetrySnapshot,
  UpgradeKey,
  WeaponTierId,
} from './types';

const MAX_GATE_PAIRS = 6;
const MAX_TIRE_STACKS = 5;
const MAX_ENEMY_WAVES = 5;
const HERO_DIORAMA_YAW = Math.PI * 0.84;

export class BridgeBlitzGame {
  private readonly saveManager = new SaveManager();
  private readonly stateMachine = new GameStateMachine();
  private readonly sound: SoundSynthesizer;
  private readonly sceneManager: SceneManager;
  private readonly bridgeEnv: BridgeEnvironment;
  private readonly bulletPool = new BulletPool(1200);
  private readonly particlePool = new ParticlePool(900);
  private readonly ragdollPool = new RagdollPool(64);
  private readonly batchRenderer: InstancedBatchRenderer;
  private readonly vfx: CombatVfxRenderer;
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
  private activeMenuTab: MenuTabId = 'BATTLE';
  private hubPreviewWeaponTier: WeaponTierId = 1;
  private commandoFacingYaw = HERO_DIORAMA_YAW;
  private dioramaYawOffset = 0;

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
  private bossSalvosDodgedThisRun = 0;
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
    this.vfx = new CombatVfxRenderer(this.sceneManager.scene);
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
      onSelectStageDirect: (stageNum) => this.handleSelectStageDirect(stageNum),
      onHubStateChange: (info) => {
        this.activeMenuTab = info.tab;
        this.hubPreviewWeaponTier = info.hubPreviewWeaponTier;
        if (info.tab === 'ARMORY') {
          if (info.armorySubTab === 'WEAPONS') {
            this.sceneManager.configureArmoryWeapon(info.armoryWeaponTier);
          } else {
            const stageIdx = Math.max(
              0,
              Math.min(CAMPAIGN_STAGES.length - 1, info.armoryBossStage - 1)
            );
            this.sceneManager.configureArmoryBoss(CAMPAIGN_STAGES[stageIdx].boss);
          }
        }
      },
      onPauseRequest: () => this.handlePauseRequest(),
      onResumeRequest: () => this.handleResumeRequest(),
      onRestartRequest: () => this.handleRestartSector(),
      onRetreatToHubRequest: () => this.handleRetreatToHub(),
      onToggleMute: () => this.handleToggleMute(),
      onToggleHaptics: () => this.handleToggleHaptics(),
      onExportSave: () => this.handleExportSave(),
      onResetSave: () => this.handleResetSave(),
      onSummaryContinue: () => this.handleSummaryContinue(),
    });

    this.stateMachine.onChange((next) => {
      this.hud.syncTopHudForState(next);
    });

    this.input = new InputController(canvasContainer, {
      onStartRequest: () => this.startRunIfStaging(),
      onMenuCanvasDrag: (dxPixels) => {
        if (this.stateMachine.state !== 'PRE_RUN') {
          return;
        }
        if (this.activeMenuTab === 'ARMORY') {
          this.sceneManager.rotateArmoryTurntable(dxPixels * 0.012);
        } else if (this.activeMenuTab === 'BATTLE' || this.activeMenuTab === 'UPGRADES') {
          this.dioramaYawOffset = Math.max(
            -1.05,
            Math.min(1.05, this.dioramaYawOffset + dxPixels * 0.009)
          );
        }
      },
      onTogglePause: () => {
        if (this.stateMachine.state === 'PAUSED') {
          this.handleResumeRequest();
        } else if (
          this.stateMachine.state === 'RUNNING' ||
          this.stateMachine.state === 'BOSS_FIGHT'
        ) {
          this.handlePauseRequest();
        }
      },
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
    this.bossSalvosDodgedThisRun = 0;
    this.pendingSummary = null;
    this.coinFountainTimer = 0;
    this.dioramaYawOffset = 0;
    this.commandoFacingYaw = HERO_DIORAMA_YAW;

    this.bulletPool.clear();
    this.particlePool.clear();
    this.ragdollPool.clear();
    this.vfx.clear();
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
    this.hud.hidePauseModal();
    this.hud.hideSummaryModal();
    this.hud.setStagingVisible(true);
    this.hud.syncTopHudForState('PRE_RUN');
    this.hud.syncSaveState(
      save,
      this.activeStageDef.title,
      this.activeStageDef.boss.name,
      this.endlessWave
    );
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
    this.squad.weaponTier = 1;
    this.hud.setStagingVisible(false);
    this.stateMachine.transitionTo('RUNNING');
  }

  private handlePauseRequest(): void {
    if (!this.stateMachine.pause()) {
      return;
    }
    const progress = Math.max(
      0,
      Math.min(1, (this.sectorBaseZ - this.squad.z) / this.activeStageDef.trackLength)
    );
    this.hud.showPauseModal(
      this.squad.logicalCount,
      this.squad.weaponTier,
      progress,
      this.enemiesDefeatedThisRun
    );
  }

  private handleResumeRequest(): void {
    if (!this.stateMachine.resume()) {
      return;
    }
    this.hud.hidePauseModal();
  }

  private handleRestartSector(): void {
    this.hud.hidePauseModal();
    this.prepareStagingArea();
    this.startRunIfStaging();
  }

  private handleRetreatToHub(): void {
    this.hud.hidePauseModal();
    this.prepareStagingArea();
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
      this.combatText.spawn(this.squad.x, 1.5, this.squad.z, '+1 COMMANDO', 'positive');
    } else {
      this.particlePool.spawnBurst(this.squad.x, 0.7, this.squad.z, 10, 3.8, 0xffd166);
    }

    this.hud.syncSaveState(
      updated,
      this.activeStageDef.title,
      this.activeStageDef.boss.name,
      this.endlessWave
    );
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

  private handleSelectStageDirect(stageNumber: number): void {
    if (this.stateMachine.state !== 'PRE_RUN') {
      return;
    }
    this.saveManager.update((draft) => {
      draft.selectedMode = 'CAMPAIGN';
      draft.selectedStage = Math.max(1, Math.min(draft.unlockedStage, stageNumber));
    });
    this.prepareStagingArea();
  }

  private handleToggleMute(): void {
    const next = this.saveManager.update((draft) => {
      draft.settings.muted = !draft.settings.muted;
    });
    this.sound.updateSettings(next.settings);
    this.hud.syncSaveState(
      next,
      this.activeStageDef.title,
      this.activeStageDef.boss.name,
      this.endlessWave
    );
  }

  private handleToggleHaptics(): void {
    const next = this.saveManager.update((draft) => {
      draft.settings.haptics = !draft.settings.haptics;
    });
    this.sound.updateSettings(next.settings);
    this.hud.syncSaveState(
      next,
      this.activeStageDef.title,
      this.activeStageDef.boss.name,
      this.endlessWave
    );
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

  private spawnVolleyMuzzleVfx(): void {
    const vis = Math.min(this.squad.logicalCount, MAX_VISUAL_SOLDIERS);
    if (vis <= 0) {
      return;
    }
    const tier = this.squad.weaponTier;
    const flashColor = tier === 5 ? 0x38f6ff : 0xffbe42;
    const flashScale = tier >= 4 ? 1.28 : 0.94;
    const burstCount = Math.min(3, vis);
    const seed = Math.floor(this.elapsedTime * 60);

    for (let k = 0; k < burstCount; k++) {
      const idx = (seed + k * 5) % vis;
      const sx = this.squad.soldierWorldX[idx] + 0.178;
      const sz = this.squad.soldierWorldZ[idx] - 0.68;
      this.vfx.spawnMuzzleFlash(sx, 0.56, sz, flashScale, flashColor);

      if (k === 0) {
        this.particlePool.spawn(
          sx + 0.08,
          0.56,
          sz + 0.24,
          1.8 + (seed % 3) * 0.45,
          2.6,
          0.6,
          -14,
          0.34,
          0.065,
          0xf5b82e
        );
        this.particlePool.spawn(
          sx,
          0.58,
          sz - 0.12,
          ((seed % 5) - 2) * 0.3,
          1.2,
          -2.4,
          1.8,
          0.26,
          0.14,
          0x636e7b
        );
      }
    }
  }

  private computeCameraFramingMode(): CameraFramingMode {
    const state = this.stateMachine.state;
    if (state === 'PRE_RUN') {
      return this.activeMenuTab === 'ARMORY' ? 'ARMORY_INSPECT' : 'HERO_DIORAMA';
    }
    const effectiveRunState =
      state === 'PAUSED' ? this.stateMachine.resumeTargetState : state;
    if (effectiveRunState === 'BOSS_FIGHT' || effectiveRunState === 'VICTORY') {
      return 'BOSS_TACTICAL';
    }
    return 'RUN_TACTICAL';
  }

  private fixedUpdate(rawDt: number): void {
    const dt = rawDt * this.stateMachine.timeScale;
    const state = this.stateMachine.state;

    if (state === 'PAUSED') {
      this.input.resetFrameDeltas();
      return;
    }

    this.elapsedTime += dt;
    const save = this.saveManager.getData();

    const lateralDelta =
      state === 'RUNNING' || state === 'BOSS_FIGHT'
        ? this.input.consumeHorizontalDelta(dt)
        : 0;
    if (state !== 'RUNNING' && state !== 'BOSS_FIGHT') {
      this.input.resetFrameDeltas();
    }

    // In BOSS_FIGHT, commandos angle slightly inward toward the Boss so strafing lane salvos keeps fire on target!
    const bossAimYaw =
      state === 'BOSS_FIGHT' && this.boss.active
        ? Math.max(
            -0.34,
            Math.min(
              0.34,
              Math.atan2(
                this.boss.x - this.squad.x,
                Math.max(2.2, this.squad.z - this.boss.z)
              )
            )
          )
        : 0;

    // Smoothly orient commandos toward the low-angle Hero Diorama in PRE_RUN, and down-bridge / Boss in combat!
    const targetFacingYaw =
      state === 'PRE_RUN'
        ? HERO_DIORAMA_YAW + this.dioramaYawOffset
        : state === 'BOSS_FIGHT'
          ? -bossAimYaw
          : 0;
    this.commandoFacingYaw +=
      (targetFacingYaw - this.commandoFacingYaw) * Math.min(1, dt * 12);

    if (state === 'PRE_RUN') {
      this.squad.updateMovement(dt, 0, false, false);
    } else if (state === 'RUNNING') {
      this.squad.updateMovement(dt, lateralDelta, true, true);
      const fired = this.squad.updateAutoFire(
        dt,
        getFireRateMultiplier(save.upgrades.fireRate),
        getBulletPowerMultiplier(save.upgrades.bulletPower),
        this.bulletPool,
        0
      );
      if (fired) {
        this.sound.playGunfire(this.squad.weaponTier);
        this.spawnVolleyMuzzleVfx();
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
        this.bulletPool,
        bossAimYaw
      );
      if (fired) {
        this.sound.playGunfire(this.squad.weaponTier);
        this.spawnVolleyMuzzleVfx();
      }
    }

    // Update Gate Visuals & Squad Gate Passes
    for (let i = 0; i < MAX_GATE_PAIRS; i++) {
      const pair = this.gatePairs[i];
      pair.updateVisuals(dt, this.squad.z);
      if (state === 'RUNNING' && this.squad.logicalCount > 0) {
        const collect = pair.trySquadCollect(
          this.squad.x,
          this.squad.z,
          this.squad.logicalCount
        );
        if (collect) {
          if (collect.deltaSquad < 0) {
            const ragCount = Math.min(3, Math.abs(collect.deltaSquad));
            for (let r = 0; r < ragCount; r++) {
              this.ragdollPool.spawnKnockback(this.squad.x, this.squad.z, false, 0.9);
            }
          }
          this.squad.setLogicalCount(collect.nextSquadCount);
          this.sound.playGateCollect(collect.positive);
          const fxColor = collect.positive ? 0x3bf088 : 0xff4757;
          this.vfx.spawnShockwave(
            collect.worldX,
            collect.worldZ,
            2.9,
            0.34,
            fxColor
          );
          this.particlePool.spawnBurst(
            collect.worldX,
            1.2,
            collect.worldZ,
            18,
            5.8,
            fxColor
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
      stack.update(dt, this.squad.z);
      if (
        state === 'RUNNING' &&
        this.squad.logicalCount > 0 &&
        stack.checkUnbrokenSquadBump(this.squad.x, this.squad.z, squadRadius)
      ) {
        this.sceneManager.addShake(0.32);
        this.vfx.spawnShockwave(stack.x, stack.z, 2.5, 0.3, 0xff4757);
        this.particlePool.spawnBurst(stack.x, 0.8, stack.z, 14, 5.0, 0x2d3436);
        this.ragdollPool.spawnKnockback(stack.x, this.squad.z, false, 1.0);
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
            const ragBursts = Math.min(2, cancelled);
            for (let r = 0; r < ragBursts; r++) {
              this.ragdollPool.spawnKnockback(wave.x, wave.z, true, 0.95);
              this.ragdollPool.spawnKnockback(this.squad.x, this.squad.z, false, 0.95);
            }
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

    // Update Boss War Machine & Telegraphed Lane Salvos
    if (state === 'RUNNING' || state === 'BOSS_FIGHT') {
      this.boss.update(
        dt,
        state === 'BOSS_FIGHT',
        this.squad.x,
        this.squad.z,
        this.squad.logicalCount
      );
      if (this.boss.lastStepSalvoWarning) {
        this.sound.playBossSalvoWarning();
        this.combatText.spawn(
          this.squad.x,
          1.95,
          this.squad.z - 1.2,
          'DODGE LANE!',
          'gold',
          0.75
        );
      }
      if (this.boss.lastStepSalvoLaunched) {
        this.sceneManager.addShake(0.22);
        this.vfx.spawnShockwave(this.boss.x, this.boss.z + 1.4, 2.8, 0.26, 0xff5e2b);
      }
      if (this.boss.lastStepSalvoHitDamage > 0 && this.squad.logicalCount > 0) {
        const lost = Math.min(this.squad.logicalCount, this.boss.lastStepSalvoHitDamage);
        const ragLost = Math.min(4, lost);
        for (let r = 0; r < ragLost; r++) {
          this.ragdollPool.spawnKnockback(this.squad.x, this.squad.z, false, 1.3);
        }
        this.squad.setLogicalCount(this.squad.logicalCount - lost);
        this.sound.playBossSalvoImpact(false);
        this.sceneManager.addShake(0.46);
        this.vfx.spawnShockwave(this.boss.lastStepSalvoHitX, this.squad.z, 3.6, 0.36, 0xff2e4c);
        this.particlePool.spawnBurst(
          this.boss.lastStepSalvoHitX,
          0.9,
          this.squad.z,
          20,
          6.6,
          0xff384c
        );
        this.combatText.spawn(
          this.squad.x,
          1.75,
          this.squad.z,
          `-${lost} SALVO!`,
          'negative',
          0.95
        );
        if (this.squad.logicalCount <= 0) {
          this.triggerRunDefeat();
        }
      } else if (this.boss.lastStepSalvoDodgedCount > 0 && this.squad.logicalCount > 0) {
        this.bossSalvosDodgedThisRun += this.boss.lastStepSalvoDodgedCount;
        this.sound.playBossSalvoImpact(true);
        this.vfx.spawnShockwave(
          this.boss.lastStepSalvoDodgeX,
          this.squad.z + 0.3,
          2.2,
          0.26,
          0xff9f43
        );
        this.particlePool.spawnBurst(
          this.boss.lastStepSalvoDodgeX,
          0.6,
          this.squad.z + 0.3,
          10,
          4.4,
          0xffae42
        );
        this.combatText.spawn(
          this.squad.x,
          1.65,
          this.squad.z,
          'DODGED!',
          'cyan',
          0.75
        );
      }
      if (this.boss.lastStepTriggeredShake) {
        const isSlam = this.boss.lastStepSlamDamage > 0;
        this.sceneManager.addShake(isSlam ? 0.55 : 0.16);
        this.vfx.spawnShockwave(
          this.boss.x,
          this.boss.z + 0.4,
          isSlam ? 4.2 : 2.5,
          isSlam ? 0.38 : 0.28,
          0xff4757
        );
      }
      if (this.boss.lastStepSlamDamage > 0 && this.squad.logicalCount > 0) {
        const lost = Math.min(this.squad.logicalCount, this.boss.lastStepSlamDamage);
        const ragLost = Math.min(4, lost);
        for (let r = 0; r < ragLost; r++) {
          this.ragdollPool.spawnKnockback(this.squad.x, this.squad.z, false, 1.35);
        }
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
    this.ragdollPool.update(dt);

    this.sceneManager.updateCamera(
      dt,
      this.squad.x,
      this.squad.z,
      this.computeCameraFramingMode()
    );
    this.bridgeEnv.update(
      dt,
      this.elapsedTime,
      this.squad.z,
      this.sceneManager.camera.position
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

      // 32m tactical engagement range prevents bullets from sniping unseen gates off-screen!
      if (bz < this.squad.z - 32) {
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
            this.vfx.spawnShockwave(hit.hitX, hit.hitZ, 3.2, 0.38, 0x36f3ff);
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
            const ragCount = Math.min(3, kills);
            for (let r = 0; r < ragCount; r++) {
              this.ragdollPool.spawnKnockback(bx, wave.z, true, 1.0);
            }
            this.particlePool.spawnBurst(bx, 0.65, wave.z, Math.min(10, 4 + kills * 2), 5.0, 0xff384c);
          } else {
            this.particlePool.spawnBurst(bx, 0.65, wave.z, 2, 3.2, 0xffffff, 0.09, 0.2);
          }
          break;
        }
      }

      // 4. Check Boss Entity
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
    this.vfx.spawnShockwave(
      stack.x,
      stack.z,
      3.4,
      0.42,
      WEAPON_SPECS[stack.weaponTier].colorHex
    );
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
    this.vfx.spawnShockwave(this.boss.x, this.boss.z, 6.5, 0.62, 0xffae42);
    this.vfx.spawnShockwave(this.boss.x, this.boss.z, 4.2, 0.44, 0xff384c);
    this.particlePool.spawnBurst(this.boss.x, 2.0, this.boss.z, 46, 9.5, 0xffae42, 0.26, 0.85);
    this.particlePool.spawnBurst(this.boss.x, 2.2, this.boss.z, 32, 8.0, 0xff384c, 0.24, 0.75);

    const save = this.saveManager.getData();

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
        ? totalDistanceMeters / 265
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
      distanceMeters:
        clearedStage && save.selectedMode === 'CAMPAIGN'
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
    if (this.stateMachine.tickRealTime(realDt) && this.pendingSummary) {
      this.hud.showSummaryModal(this.pendingSummary);
    }

    const state = this.stateMachine.state;
    const isMoving = state === 'RUNNING' || state === 'BOSS_FIGHT';
    const displayedWeaponTier =
      state === 'PRE_RUN' ? this.hubPreviewWeaponTier : this.squad.weaponTier;

    this.batchRenderer.syncPlayerSoldiers(
      this.squad.logicalCount,
      this.squad.soldierWorldX,
      this.squad.soldierWorldZ,
      this.squad.marchPhase,
      isMoving,
      displayedWeaponTier,
      this.squad.steerBankAngle,
      this.squad.recoilImpulse,
      this.squad.barrelSpinAngle,
      this.commandoFacingYaw
    );

    this.batchRenderer.beginEnemyFrame();
    for (let i = 0; i < MAX_ENEMY_WAVES; i++) {
      this.enemyWaves[i].pushInstances(this.batchRenderer);
    }
    this.batchRenderer.finishEnemyFrame();

    this.batchRenderer.syncRagdolls(this.ragdollPool);
    this.batchRenderer.syncBullets(this.bulletPool);
    this.batchRenderer.syncParticles(this.particlePool);
    this.vfx.updateAndSync(realDt * this.stateMachine.timeScale);

    this.sceneManager.render();

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

    const bossHudActive =
      (state === 'BOSS_FIGHT' ||
        (state === 'PAUSED' && this.stateMachine.resumeTargetState === 'BOSS_FIGHT')) &&
      this.boss.active;

    this.hud.updateWorldOverlays(
      this.sceneManager,
      state,
      this.squad.x,
      this.squad.z,
      this.squad.logicalCount,
      this.squad.weaponTier,
      this.enemyWaves,
      bossHudActive,
      this.boss.name,
      this.boss.currentHp,
      this.boss.maxHp,
      this.boss.segments
    );

    if (state !== 'PAUSED') {
      this.combatText.update(realDt, this.sceneManager);
    }
  }

  public advanceSimulation(seconds: number, targetX?: number): TelemetrySnapshot {
    const step = 1 / 60;
    const ticks = Math.max(1, Math.round(seconds / step));
    for (let i = 0; i < ticks; i++) {
      if (typeof targetX === 'number') {
        const dx = targetX - this.squad.x;
        this.squad.x += Math.sign(dx) * Math.min(Math.abs(dx), 12 * step);
      }
      this.fixedUpdate(step);
    }
    this.renderFrame(step);
    return this.getTelemetrySnapshot();
  }

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
      bossSalvosDodgedThisRun: this.bossSalvosDodgedThisRun,
      activeBullets: this.bulletPool.activeCount,
      activeParticles: this.particlePool.activeCount,
      upgrades: { ...save.upgrades },
    };
  }
}
