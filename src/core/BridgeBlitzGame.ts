import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import { BossEntity } from '../entities/BossEntity';
import { EnemyWaveSlot } from '../entities/EnemyWave';
import { GatePairSlot } from '../entities/GatePair';
import { MidBridgeBrute } from '../entities/MidBridgeBrute';
import {
  LEFT_LANE_CENTER_X,
  RIGHT_LANE_CENTER_X,
  SplitCausewayController,
} from '../entities/SplitCausewayController';
import { SquadController } from '../entities/SquadController';
import { SupplyDrumSlot } from '../entities/SupplyDrum';
import { TireWeaponStackSlot } from '../entities/TireWeaponStack';
import { SPLIT_DIVIDER_X } from '../math/formationMath';
import { formatGateLabel, resolveGateSquadCount } from '../math/gateMath';
import {
  attemptPurchaseUpgrade,
  computeRunCoinPayout,
  formatCoinAmount,
  getBulletPowerMultiplier,
  getFireRateMultiplier,
  getStartingSquadCount,
  getWarChestMultiplier,
  UPGRADE_ORDER,
} from '../math/progressionMath';
import {
  COMMANDO_MODEL_SCALE,
  FOCAL_CONVERGENCE_DISTANCE,
  getWeaponDisplaySpec,
  MAX_VISUAL_SOLDIERS,
  OVERFLOW_SQUAD_COIN_BONUS,
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
  generateSplitCausewayStage,
  getBossVisualProfile,
  getCampaignStage,
} from './StageData';
import type {
  BoardLayout,
  GameMode,
  MenuTabId,
  MidBridgeBruteDefinition,
  RunSummary,
  SkinThemeId,
  SplitNodeReward,
  StageDefinition,
  TelemetrySnapshot,
  UpgradeKey,
  WeaponTierId,
} from './types';

const MAX_SUPPLY_DRUMS = 24;
const MAX_GATE_PAIRS = 6;
const MAX_TIRE_STACKS = 12;
const MAX_ENEMY_WAVES = 6;
const MAX_MID_BRUTES = 2;
const RAINBOW_SPARK_HEX = [
  0xff295c,
  0xff8c1a,
  0xffe82b,
  0x22eb6a,
  0x249dff,
  0xb83bff,
] as const;

export class BridgeBlitzGame {
  private readonly saveManager = new SaveManager();
  private readonly stateMachine = new GameStateMachine();
  private readonly sound: SoundSynthesizer;
  private readonly sceneManager: SceneManager;
  private readonly bridgeEnv: BridgeEnvironment;
  private readonly bulletPool = new BulletPool(1200);
  private readonly particlePool = new ParticlePool(900);
  private readonly ragdollPool = new RagdollPool(96);
  private readonly batchRenderer: InstancedBatchRenderer;
  private readonly vfx: CombatVfxRenderer;
  private readonly combatText: CombatTextOverlay;

  private readonly squad = new SquadController();
  private readonly supplyDrums: SupplyDrumSlot[] = [];
  private readonly gatePairs: GatePairSlot[] = [];
  private readonly tireStacks: TireWeaponStackSlot[] = [];
  private readonly enemyWaves: EnemyWaveSlot[] = [];
  private readonly midBrutes: MidBridgeBrute[] = [
    new MidBridgeBrute(0),
    new MidBridgeBrute(1),
  ];
  private readonly splitCauseway = new SplitCausewayController();
  private readonly boss: BossEntity;

  private readonly hud: HudController;
  private readonly input: InputController;
  private readonly loop: GameLoop;

  private activeStageDef: StageDefinition;
  private activeMenuTab: MenuTabId = 'BATTLE';
  private hubPreviewWeaponTier: WeaponTierId = 1;
  private commandoFacingYaw = 0;

  // Streaming cursors for 400%-longer (1,120m-1,368m) bridges & Split Causeway Goliath waves
  private nextDrumCursor = 0;
  private nextGateCursor = 0;
  private nextTireCursor = 0;
  private nextWaveCursor = 0;
  private nextBruteCursor = 0;

  private sectorBaseZ = 0;
  private endlessWave = 1;
  private elapsedTime = 0;
  private coinFountainTimer = 0;
  private celebrateHopTimer = 0;

  // Per-run counters
  private liveCoinsThisRun = 0;
  private drumsBrokenThisRun = 0;
  private enemiesDefeatedThisRun = 0;
  private gatesFlippedThisRun = 0;
  private tiresBrokenThisRun = 0;
  private weaponLocksThisRun = 0;
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

    for (let i = 0; i < MAX_SUPPLY_DRUMS; i++) {
      const drum = new SupplyDrumSlot(i);
      this.supplyDrums.push(drum);
      this.sceneManager.scene.add(drum.root);
    }
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
    for (let i = 0; i < MAX_MID_BRUTES; i++) {
      this.sceneManager.scene.add(this.midBrutes[i].root);
    }
    this.sceneManager.scene.add(this.splitCauseway.root);
    this.boss = new BossEntity(this.sceneManager.scene);

    this.activeStageDef = getCampaignStage(initialSave.selectedStage);

    this.hud = new HudController({
      onStartMarch: () => this.startRunIfStaging(),
      onBuyUpgrade: (key) => this.handleBuyUpgrade(key),
      onSelectMode: (mode) => this.handleSelectMode(mode),
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
      onToggleSkin: () => this.handleToggleSkin(),
      onToggleMute: () => this.handleToggleMute(),
      onToggleHaptics: () => this.handleToggleHaptics(),
      onExportSave: () => this.handleExportSave(),
      onResetSave: () => this.handleResetSave(),
      onSummaryContinue: () => this.handleSummaryContinue(),
      onFireworkLaunchSound: (pitchStep) =>
        this.sound.playUnicornFireworkBurst(pitchStep),
    });

    this.stateMachine.onChange((next) => {
      this.hud.syncTopHudForState(next);
    });

    this.input = new InputController(canvasContainer, {
      onStartRequest: () => this.startRunIfStaging(),
      onBridgePointerLaunch: () => {
        if (this.stateMachine.state !== 'PRE_RUN') {
          return;
        }
        if (this.hud.isSettingsOpen) {
          this.hud.closeSettingsDrawer();
          return;
        }
        if (this.activeMenuTab !== 'BATTLE') {
          return;
        }
        this.startRunIfStaging();
      },
      onMenuCanvasDrag: (dxPixels) => {
        if (this.stateMachine.state === 'PRE_RUN' && this.activeMenuTab === 'ARMORY') {
          this.sceneManager.rotateArmoryTurntable(dxPixels * 0.012);
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
        if (this.hud.isUnicornPreCardSplashActive) {
          this.hud.revealUnicornVictoryCardEarly();
          return;
        }
        if (
          this.stateMachine.state === 'VICTORY' ||
          this.stateMachine.isWipeoutModalReady
        ) {
          this.handleSummaryContinue();
        }
      },
    });

    this.applySkinTheme(initialSave.settings.skinTheme);
    this.prepareStagingArea();

    this.loop = new GameLoop(
      (fixedDt) => this.fixedUpdate(fixedDt),
      (realDt) => this.renderFrame(realDt)
    );
    this.loop.start();
  }

  private get activeBoardLayout(): BoardLayout {
    return this.activeStageDef.boardLayout ?? 'STANDARD_BRIDGE';
  }

  private getActiveBossDisplayName(theme: SkinThemeId): string {
    return getBossVisualProfile(this.activeStageDef.boss, theme).name;
  }

  private getStageBruteDefs(
    stage: StageDefinition
  ): ReadonlyArray<MidBridgeBruteDefinition> {
    if (stage.boardLayout === 'SPLIT_CAUSEWAY' && stage.splitCauseway) {
      return stage.splitCauseway.goliathSpawns;
    }
    if (stage.midBrutes && stage.midBrutes.length > 0) {
      return stage.midBrutes;
    }
    return stage.midBrute ? [stage.midBrute] : [];
  }

  private anyBruteAlive(): boolean {
    for (let i = 0; i < MAX_MID_BRUTES; i++) {
      const b = this.midBrutes[i];
      if (b.active && !b.defeated && b.hp > 0) {
        return true;
      }
    }
    return false;
  }

  private isAnyBruteHaltingMarch(squadZ: number): boolean {
    if (this.activeBoardLayout === 'SPLIT_CAUSEWAY') {
      return false;
    }
    for (let i = 0; i < MAX_MID_BRUTES; i++) {
      if (this.midBrutes[i].isHaltingMarch(squadZ)) {
        return true;
      }
    }
    return false;
  }

  private getPrimaryBruteTelemetry(): { hp: number; maxHp: number } {
    let best: MidBridgeBrute | null = null;
    let bestZ = -999999;
    for (let i = 0; i < MAX_MID_BRUTES; i++) {
      const b = this.midBrutes[i];
      if (b.active && !b.defeated && b.hp > 0 && b.z > bestZ) {
        best = b;
        bestZ = b.z;
      }
    }
    if (best) {
      return { hp: best.hp, maxHp: best.maxHp };
    }
    return { hp: 0, maxHp: this.midBrutes[0].maxHp };
  }

  private computeSectorProgressRatio(): number {
    const state = this.stateMachine.state;
    if (state === 'VICTORY') {
      return 1;
    }
    if (this.activeBoardLayout === 'SPLIT_CAUSEWAY') {
      const effectiveState =
        state === 'PAUSED' ? this.stateMachine.resumeTargetState : state;
      if (effectiveState === 'BOSS_FIGHT' || this.splitCauseway.retractedForBoss) {
        return 1;
      }
      return this.splitCauseway.getProgress();
    }
    return Math.max(
      0,
      Math.min(1, (this.sectorBaseZ - this.squad.z) / this.activeStageDef.trackLength)
    );
  }

  private computeRunDistanceMeters(): number {
    const baseMarch = Math.max(0, -this.squad.z);
    if (this.activeBoardLayout === 'SPLIT_CAUSEWAY') {
      return Math.round(
        baseMarch + this.computeSectorProgressRatio() * this.activeStageDef.trackLength
      );
    }
    return baseMarch;
  }

  private prepareStagingArea(): void {
    const save = this.saveManager.getData();
    this.endlessWave = 1;
    this.sectorBaseZ = 0;
    this.liveCoinsThisRun = 0;
    this.drumsBrokenThisRun = 0;
    this.enemiesDefeatedThisRun = 0;
    this.gatesFlippedThisRun = 0;
    this.tiresBrokenThisRun = 0;
    this.weaponLocksThisRun = 0;
    this.bossSalvosDodgedThisRun = 0;
    this.pendingSummary = null;
    this.coinFountainTimer = 0;
    this.celebrateHopTimer = 0;
    this.commandoFacingYaw = 0;

    this.bulletPool.clear();
    this.particlePool.clear();
    this.ragdollPool.clear();
    this.vfx.clear();
    this.combatText.clear();
    this.input.resetFrameDeltas();

    this.activeStageDef =
      save.selectedMode === 'ENDLESS'
        ? generateEndlessWaveStage(1)
        : save.selectedMode === 'SPLIT_CAUSEWAY'
          ? generateSplitCausewayStage(save.splitCausewayStage)
          : getCampaignStage(save.selectedStage);

    const startTroops = getStartingSquadCount(save.upgrades.startingSquad);
    this.squad.resetForRun(startTroops);

    this.populateSectorEntities(this.activeStageDef, 0);
    this.applySkinTheme(save.settings.skinTheme);

    this.stateMachine.transitionTo('PRE_RUN');
    this.hud.hidePauseModal();
    this.hud.hideSummaryModal();
    this.hud.setStagingVisible(true);
    this.hud.syncTopHudForState('PRE_RUN');
    this.hud.syncSaveState(
      save,
      this.activeStageDef.title,
      this.getActiveBossDisplayName(save.settings.skinTheme),
      this.endlessWave,
      this.activeBoardLayout
    );
    this.hud.updateTrackProgress(
      0,
      save.selectedMode,
      0,
      this.endlessWave,
      save.splitCausewayStage
    );
  }

  private populateSectorEntities(stage: StageDefinition, zBase: number): void {
    const isSplit =
      stage.boardLayout === 'SPLIT_CAUSEWAY' && Boolean(stage.splitCauseway);

    if (isSplit && stage.splitCauseway) {
      for (let i = 0; i < MAX_SUPPLY_DRUMS; i++) {
        this.supplyDrums[i].hide();
      }
      for (let i = 0; i < MAX_GATE_PAIRS; i++) {
        this.gatePairs[i].hide();
      }
      for (let i = 0; i < MAX_TIRE_STACKS; i++) {
        this.tireStacks[i].hide();
      }
      for (let i = 0; i < MAX_ENEMY_WAVES; i++) {
        this.enemyWaves[i].hide();
      }
      for (let i = 0; i < MAX_MID_BRUTES; i++) {
        this.midBrutes[i].hide();
      }

      this.nextDrumCursor = 0;
      this.nextGateCursor = 0;
      this.nextTireCursor = 0;
      this.nextWaveCursor = 0;
      this.nextBruteCursor = 0;

      this.splitCauseway.configure(stage.splitCauseway, zBase);
      this.bridgeEnv.configureBoardLayout(
        'SPLIT_CAUSEWAY',
        this.splitCauseway.dividerTipZ
      );
      this.bridgeEnv.configureBossPlatformZ(zBase - 420, false);

      // Load Boss telemetry/stats while keeping the Boss rig hidden until the 100% siege finale!
      this.boss.configure(stage.boss, -zBase + stage.trackLength);
      this.boss.hide();

      // Align squad cleanly into the Left Power-Up Column facing the front pod at launch
      this.squad.x = LEFT_LANE_CENTER_X;
      this.squad.z = zBase;
      this.squad.updateMovement(0, 0, false, false, true);
      return;
    }

    this.splitCauseway.hide();
    this.bridgeEnv.configureBoardLayout('STANDARD_BRIDGE');

    for (let i = 0; i < MAX_SUPPLY_DRUMS; i++) {
      const def = stage.supplyDrums[i];
      if (def) {
        this.supplyDrums[i].configure({
          ...def,
          z: zBase + def.z,
        });
      } else {
        this.supplyDrums[i].hide();
      }
    }
    this.nextDrumCursor = Math.min(MAX_SUPPLY_DRUMS, stage.supplyDrums.length);

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
    this.nextGateCursor = Math.min(MAX_GATE_PAIRS, stage.gatePairs.length);

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
    this.nextTireCursor = Math.min(MAX_TIRE_STACKS, stage.tireStacks.length);

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
    this.nextWaveCursor = Math.min(MAX_ENEMY_WAVES, stage.enemyWaves.length);

    const bruteDefs = this.getStageBruteDefs(stage);
    for (let i = 0; i < MAX_MID_BRUTES; i++) {
      const def = bruteDefs[i];
      if (def) {
        this.midBrutes[i].configure({
          ...def,
          z: zBase + def.z,
        });
      } else {
        this.midBrutes[i].hide();
      }
    }
    this.nextBruteCursor = Math.min(MAX_MID_BRUTES, bruteDefs.length);

    const bossTrackEnd = -zBase + stage.trackLength;
    const isCampaign = this.saveManager.getData().selectedMode === 'CAMPAIGN';
    this.bridgeEnv.configureBossPlatformZ(zBase - stage.trackLength, isCampaign);
    this.boss.configure(stage.boss, bossTrackEnd);
  }

  private streamUpcomingEntities(): void {
    const stage = this.activeStageDef;
    const zBase = this.sectorBaseZ;

    if (this.activeBoardLayout === 'SPLIT_CAUSEWAY') {
      const goliaths = stage.splitCauseway?.goliathSpawns ?? [];
      if (
        this.splitCauseway.retractedForBoss ||
        this.nextBruteCursor >= goliaths.length
      ) {
        return;
      }
      const nextDef = goliaths[this.nextBruteCursor];
      const triggerDist = Math.max(12, Math.abs(nextDef.z) - 38);
      const ready =
        this.splitCauseway.siegeDistance >= triggerDist ||
        this.splitCauseway.rightAliveCount <= 14;
      if (!ready) {
        return;
      }
      for (let i = 0; i < MAX_MID_BRUTES; i++) {
        const brute = this.midBrutes[i];
        if (!brute.active || brute.defeated) {
          const spawnZ =
            this.splitCauseway.rightAliveCount <= 14 ? zBase - 26 : zBase - 38;
          brute.configure({ ...nextDef, z: spawnZ }, RIGHT_LANE_CENTER_X);
          this.nextBruteCursor++;
          break;
        }
      }
      return;
    }

    for (
      let i = 0;
      i < MAX_SUPPLY_DRUMS && this.nextDrumCursor < stage.supplyDrums.length;
      i++
    ) {
      const drum = this.supplyDrums[i];
      if (!drum.active || drum.z > this.squad.z + 10) {
        const def = stage.supplyDrums[this.nextDrumCursor++];
        drum.configure({ ...def, z: zBase + def.z });
      }
    }

    for (
      let i = 0;
      i < MAX_GATE_PAIRS && this.nextGateCursor < stage.gatePairs.length;
      i++
    ) {
      const pair = this.gatePairs[i];
      if (!pair.active || pair.z > this.squad.z + 9) {
        const def = stage.gatePairs[this.nextGateCursor++];
        pair.configure({ ...def, z: zBase + def.z });
      }
    }

    for (
      let i = 0;
      i < MAX_TIRE_STACKS && this.nextTireCursor < stage.tireStacks.length;
      i++
    ) {
      const stack = this.tireStacks[i];
      if (!stack.active || stack.z > this.squad.z + 10) {
        const def = stage.tireStacks[this.nextTireCursor++];
        stack.configure({ ...def, z: zBase + def.z });
      }
    }

    for (
      let i = 0;
      i < MAX_ENEMY_WAVES && this.nextWaveCursor < stage.enemyWaves.length;
      i++
    ) {
      const wave = this.enemyWaves[i];
      if (!wave.active || wave.aliveCount <= 0 || wave.z > this.squad.z + 12) {
        const def = stage.enemyWaves[this.nextWaveCursor++];
        wave.configure({ ...def, z: zBase + def.z });
      }
    }

    const bruteDefs = this.getStageBruteDefs(stage);
    for (
      let i = 0;
      i < MAX_MID_BRUTES && this.nextBruteCursor < bruteDefs.length;
      i++
    ) {
      const brute = this.midBrutes[i];
      if (!brute.active || brute.defeated || brute.z > this.squad.z + 12) {
        const def = bruteDefs[this.nextBruteCursor++];
        brute.configure({ ...def, z: zBase + def.z });
      }
    }
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

  private awardLiveCoins(
    rawBaseCoins: number,
    worldX: number,
    worldZ: number,
    spawnWorldText: boolean
  ): number {
    if (rawBaseCoins <= 0) {
      return 0;
    }
    const save = this.saveManager.getData();
    const mult = getWarChestMultiplier(save.upgrades.warChest);
    const earned = Math.max(1, Math.round(rawBaseCoins * mult));
    this.liveCoinsThisRun += earned;

    const updated = this.saveManager.update((draft) => {
      draft.coins += earned;
    });
    this.hud.flashLiveCoinGain(earned, updated.coins);
    this.sound.playCoinPickup();

    if (spawnWorldText) {
      this.combatText.spawn(
        worldX,
        1.95,
        worldZ,
        `+${formatCoinAmount(earned)}`,
        'gold',
        0.82
      );
    }
    return earned;
  }

  private applySquadCountWithOverflow(
    targetCount: number,
    worldX: number,
    worldZ: number
  ): void {
    const overflow = this.squad.setLogicalCount(targetCount);
    if (overflow > 0) {
      const cappedBase = Math.min(240, overflow * OVERFLOW_SQUAD_COIN_BONUS);
      const earned = this.awardLiveCoins(cappedBase, worldX, worldZ, false);
      this.combatText.spawn(
        worldX,
        2.2,
        worldZ,
        `MAX 40! +${formatCoinAmount(earned)}`,
        'gold',
        0.95
      );
    }
  }

  private handlePauseRequest(): void {
    if (!this.stateMachine.pause()) {
      return;
    }
    const progress = this.computeSectorProgressRatio();
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

    const newLevel = updated.upgrades[key];
    this.sound.playUpgradeBuy(newLevel);
    this.hud.flashUpgradePurchase(key);
    this.celebrateHopTimer = 0.38;

    if (key === 'startingSquad') {
      const nextCount = getStartingSquadCount(updated.upgrades.startingSquad);
      this.squad.setLogicalCount(nextCount);
      const isUnicorn = updated.settings.skinTheme === 'UNICORN';
      const recruitFx = isUnicorn ? 0xff5cb8 : 0x3bf088;
      const recruitSplash = isUnicorn ? 0xff9be0 : 0x56ff9d;
      this.vfx.spawnShockwave(this.squad.x, this.squad.z, 2.7, 0.38, recruitFx);
      this.vfx.spawnImpactSplash(this.squad.x, 1.1, this.squad.z, 1.45, recruitSplash);
      this.particlePool.spawnBurst(this.squad.x, 0.9, this.squad.z, 18, 5.2, recruitFx);
      this.combatText.spawn(
        this.squad.x,
        1.95,
        this.squad.z,
        isUnicorn ? '+1 PINK GIRL!' : '+1 SOLDIER!',
        'positive',
        0.85
      );
    } else {
      const fxHex = key === 'fireRate' ? 0x28f8dc : key === 'bulletPower' ? 0xff4d6d : 0xffc938;
      this.vfx.spawnShockwave(this.squad.x, this.squad.z, 2.5, 0.36, fxHex);
      this.vfx.spawnImpactSplash(this.squad.x, 1.1, this.squad.z, 1.35, fxHex);
      this.particlePool.spawnBurst(this.squad.x, 0.9, this.squad.z, 14, 4.6, fxHex);
      const label =
        key === 'fireRate'
          ? '+6% FIRE RATE!'
          : key === 'bulletPower'
            ? '+10% ORDNANCE!'
            : '+10% BOUNTY!';
      this.combatText.spawn(
        this.squad.x,
        1.95,
        this.squad.z,
        label,
        key === 'warChest' ? 'gold' : 'cyan',
        0.82
      );
    }

    this.hud.syncSaveState(
      updated,
      this.activeStageDef.title,
      this.getActiveBossDisplayName(updated.settings.skinTheme),
      this.endlessWave,
      this.activeBoardLayout
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

  private applySkinTheme(theme: SkinThemeId): void {
    this.squad.skinTheme = theme;
    this.batchRenderer.setSkinTheme(theme);
    this.sceneManager.setSkinTheme(theme);
    this.splitCauseway.setSkinTheme(theme);
    this.boss.setSkinTheme(theme);
    for (let i = 0; i < MAX_SUPPLY_DRUMS; i++) {
      this.supplyDrums[i].setSkinTheme(theme);
    }
    for (let i = 0; i < MAX_TIRE_STACKS; i++) {
      this.tireStacks[i].setSkinTheme(theme);
    }
    for (let i = 0; i < MAX_MID_BRUTES; i++) {
      this.midBrutes[i].setSkinTheme(theme);
    }
  }

  private handleToggleSkin(): void {
    this.sound.unlockOnGesture();
    const next = this.saveManager.update((draft) => {
      draft.settings.skinTheme =
        draft.settings.skinTheme === 'UNICORN' ? 'TACTICAL' : 'UNICORN';
    });
    const isUnicorn = next.settings.skinTheme === 'UNICORN';
    this.applySkinTheme(next.settings.skinTheme);
    this.sound.playGateFlipChime();
    this.celebrateHopTimer = 0.36;

    const burstHex = isUnicorn ? 0xff4fb8 : 0x28f8dc;
    const accentHex = isUnicorn ? 0xffe066 : 0x62f4ff;
    this.vfx.spawnShockwave(this.squad.x, this.squad.z, 3.1, 0.42, burstHex);
    this.vfx.spawnImpactSplash(this.squad.x, 1.15, this.squad.z, 1.6, accentHex);
    this.particlePool.spawnBurst(this.squad.x, 1.0, this.squad.z, 22, 5.8, burstHex, 0.16, 0.48);

    if (this.stateMachine.state !== 'PAUSED') {
      this.combatText.spawn(
        this.squad.x,
        2.05,
        this.squad.z,
        isUnicorn ? 'UNICORN MAGIC ON!' : 'TACTICAL OPS ON!',
        isUnicorn ? 'gold' : 'cyan',
        0.92
      );
    }

    this.hud.syncSaveState(
      next,
      this.activeStageDef.title,
      this.getActiveBossDisplayName(next.settings.skinTheme),
      this.endlessWave,
      this.activeBoardLayout
    );

    if (this.stateMachine.state === 'PAUSED') {
      this.hud.showPauseModal(
        this.squad.logicalCount,
        this.squad.weaponTier,
        this.computeSectorProgressRatio(),
        this.enemiesDefeatedThisRun
      );
    }
  }

  private handleToggleMute(): void {
    const next = this.saveManager.update((draft) => {
      draft.settings.muted = !draft.settings.muted;
    });
    this.sound.updateSettings(next.settings);
    this.hud.syncSaveState(
      next,
      this.activeStageDef.title,
      this.getActiveBossDisplayName(next.settings.skinTheme),
      this.endlessWave,
      this.activeBoardLayout
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
      this.getActiveBossDisplayName(next.settings.skinTheme),
      this.endlessWave,
      this.activeBoardLayout
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
    this.applySkinTheme(fresh.settings.skinTheme);
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
    const skinTheme = this.saveManager.getData().settings.skinTheme;
    const flashColor = getWeaponDisplaySpec(tier, skinTheme)?.colorHex ?? 0x62f4ff;
    const flashScale = tier >= 4 ? 1.42 : 1.08;
    const burstCount = Math.min(4, vis);
    const seed = Math.floor(this.elapsedTime * 60);

    const muzzleLocalX = 0.255 * COMMANDO_MODEL_SCALE;
    const my = 0.548 * COMMANDO_MODEL_SCALE;
    const muzzleLocalZ = -0.68 * COMMANDO_MODEL_SCALE;

    for (let k = 0; k < burstCount; k++) {
      const idx = (seed + k * 5) % vis;
      const soldierX = this.squad.soldierWorldX[idx];
      const soldierZ = this.squad.soldierWorldZ[idx];
      const gunYaw = Math.max(
        -0.38,
        Math.min(
          0.38,
          -Math.atan2(
            this.focalTargetX - soldierX,
            Math.max(5.5, soldierZ - this.focalTargetZ)
          )
        )
      );
      const cy = Math.cos(gunYaw);
      const sy = Math.sin(gunYaw);
      const sx = soldierX + muzzleLocalX * cy + muzzleLocalZ * sy;
      const sz = soldierZ - muzzleLocalX * sy + muzzleLocalZ * cy;
      this.vfx.spawnMuzzleFlash(sx, my, sz, flashScale, flashColor);

      if (k === 0) {
        this.particlePool.spawn(
          sx + 0.08,
          my,
          sz + 0.24,
          1.9 + (seed % 3) * 0.45,
          2.6,
          0.6,
          -14,
          0.34,
          0.075,
          0xf5b82e
        );
      }
    }
  }

  private computeCameraFramingMode(): CameraFramingMode {
    const state = this.stateMachine.state;
    if (state === 'PRE_RUN') {
      return this.activeMenuTab === 'ARMORY' ? 'ARMORY_INSPECT' : 'LIVE_BRIDGE';
    }
    const effectiveRunState =
      state === 'PAUSED' ? this.stateMachine.resumeTargetState : state;
    if (effectiveRunState === 'BOSS_FIGHT' || effectiveRunState === 'VICTORY') {
      return 'BOSS_TACTICAL';
    }
    return 'RUN_TACTICAL';
  }

  private findBlockingGateZ(entityZ: number): number | null {
    if (this.activeBoardLayout === 'SPLIT_CAUSEWAY') {
      return null;
    }
    let closestGateZ: number | null = null;
    for (let g = 0; g < MAX_GATE_PAIRS; g++) {
      const pair = this.gatePairs[g];
      if (!pair.active || pair.triggered) {
        continue;
      }
      if (pair.z >= entityZ - 1.5 && pair.z <= this.squad.z + 1.5) {
        if (closestGateZ === null || pair.z < closestGateZ) {
          closestGateZ = pair.z;
        }
      }
    }
    return closestGateZ;
  }

  private focalTargetX = 0;
  private focalTargetZ = -FOCAL_CONVERGENCE_DISTANCE;

  private updateFocalTarget(): void {
    const vis = Math.min(this.squad.logicalCount, MAX_VISUAL_SOLDIERS);
    const muzzleOffsetX = 0.255 * COMMANDO_MODEL_SCALE;

    if (vis <= 0) {
      this.focalTargetX = this.squad.x;
    } else if (vis === 1) {
      this.focalTargetX = this.squad.soldierWorldX[0] + muzzleOffsetX;
    } else {
      let sumX = 0;
      for (let i = 0; i < vis; i++) {
        sumX += this.squad.soldierWorldX[i];
      }
      this.focalTargetX = sumX / vis + muzzleOffsetX * 0.35;
    }
    this.focalTargetZ = this.squad.z - FOCAL_CONVERGENCE_DISTANCE;
  }

  private fixedUpdate(rawDt: number): void {
    const dt = rawDt * this.stateMachine.timeScale;
    const state = this.stateMachine.state;

    if (state === 'PAUSED') {
      this.input.resetFrameDeltas();
      return;
    }

    this.elapsedTime += dt;
    if (this.celebrateHopTimer > 0) {
      this.celebrateHopTimer = Math.max(0, this.celebrateHopTimer - dt);
    }
    const save = this.saveManager.getData();
    const isSplit = this.activeBoardLayout === 'SPLIT_CAUSEWAY';
    const splitDividerActive = isSplit && !this.splitCauseway.retractedForBoss;

    if (state === 'RUNNING') {
      this.streamUpcomingEntities();
    }

    const lateralDelta =
      state === 'RUNNING' || state === 'BOSS_FIGHT'
        ? this.input.consumeHorizontalDelta(dt)
        : 0;
    if (state !== 'RUNNING' && state !== 'BOSS_FIGHT') {
      this.input.resetFrameDeltas();
    }

    this.commandoFacingYaw = 0;

    const haltedByBrute =
      state === 'RUNNING' && this.isAnyBruteHaltingMarch(this.squad.z);

    if (state === 'PRE_RUN') {
      this.squad.updateMovement(dt, 0, false, false, splitDividerActive);
      if (isSplit) {
        this.splitCauseway.update(dt, this.squad.x, this.squad.z, false);
      }
      this.updateFocalTarget();
    } else if (state === 'RUNNING') {
      const marchingForward = !isSplit && !haltedByBrute;
      this.squad.updateMovement(
        dt,
        lateralDelta,
        marchingForward,
        true,
        splitDividerActive
      );
      if (isSplit) {
        this.squad.z = this.sectorBaseZ;
      }
      this.updateFocalTarget();
      const fired = this.squad.updateAutoFire(
        dt,
        getFireRateMultiplier(save.upgrades.fireRate),
        getBulletPowerMultiplier(save.upgrades.bulletPower),
        this.bulletPool,
        this.focalTargetX,
        this.focalTargetZ,
        marchingForward
      );
      if (fired) {
        this.sound.playGunfire(this.squad.weaponTier, this.squad.logicalCount);
        this.spawnVolleyMuzzleVfx();
      }

      if (isSplit) {
        this.splitCauseway.update(dt, this.squad.x, this.squad.z, true);
        if (this.squad.logicalCount > 0) {
          const splitClash = this.splitCauseway.resolveSquadCollision(
            this.squad.x,
            this.squad.z,
            this.squad.logicalCount
          );
          if (splitClash && splitClash.playerLosses > 0) {
            const lost = splitClash.playerLosses;
            this.squad.setLogicalCount(this.squad.logicalCount - lost);
            const ragBursts = Math.min(4, lost);
            for (let r = 0; r < ragBursts; r++) {
              this.ragdollPool.spawnKnockback(
                splitClash.hitX,
                splitClash.hitZ,
                true,
                0.98
              );
              this.ragdollPool.spawnKnockback(
                this.squad.x,
                this.squad.z,
                false,
                0.95
              );
            }
            this.sceneManager.addShake(0.28);
            this.sound.playEnemyPop();
            this.particlePool.spawnBurst(
              splitClash.hitX,
              0.8,
              splitClash.hitZ,
              12,
              5.2,
              0xff4757
            );
            this.combatText.spawn(
              this.squad.x,
              1.6,
              this.squad.z,
              `-${lost}`,
              'negative',
              0.68
            );
            if (this.squad.logicalCount <= 0) {
              this.triggerRunDefeat();
            }
          }
        }

        const totalGoliaths =
          this.activeStageDef.splitCauseway?.goliathSpawns.length ?? 0;
        if (
          this.stateMachine.state === 'RUNNING' &&
          this.splitCauseway.isSiegeComplete() &&
          this.nextBruteCursor >= totalGoliaths &&
          !this.anyBruteAlive()
        ) {
          this.splitCauseway.retractQueueForBoss();
          this.bridgeEnv.setDividerRetracted(true);
          this.boss.configure(this.activeStageDef.boss, -this.squad.z + 6.5);
          this.stateMachine.transitionTo('BOSS_FIGHT');
          this.sceneManager.addShake(0.34);
          this.vfx.spawnShockwave(0, this.squad.z - 8.2, 4.2, 0.42, 0xffae42);
          this.combatText.spawn(
            0,
            2.6,
            this.boss.z,
            `${this.boss.name.toUpperCase()}!`,
            'negative',
            1.1
          );
        }
      } else {
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
      }
    } else if (state === 'BOSS_FIGHT') {
      this.squad.updateMovement(dt, lateralDelta, false, true, false);
      if (isSplit) {
        this.splitCauseway.update(dt, this.squad.x, this.squad.z, false);
      }
      this.updateFocalTarget();
      const fired = this.squad.updateAutoFire(
        dt,
        getFireRateMultiplier(save.upgrades.fireRate),
        getBulletPowerMultiplier(save.upgrades.bulletPower),
        this.bulletPool,
        this.focalTargetX,
        this.focalTargetZ,
        false
      );
      if (fired) {
        this.sound.playGunfire(this.squad.weaponTier, this.squad.logicalCount);
        this.spawnVolleyMuzzleVfx();
      }
    }

    if (!isSplit) {
      // Update Supply Drums: core lane crash ends run right at intact barrel; outer soldiers funnel smoothly!
      for (let i = 0; i < MAX_SUPPLY_DRUMS; i++) {
        const drum = this.supplyDrums[i];
        drum.update(dt, this.squad.z);
        if (state === 'RUNNING' && this.squad.logicalCount > 0) {
          if (drum.checkCoreLaneCrash(this.squad.x, this.squad.z)) {
            const ragBursts = Math.min(10, this.squad.logicalCount);
            for (let r = 0; r < ragBursts; r++) {
              this.ragdollPool.spawnKnockback(
                this.squad.x + ((r % 3) - 1) * 0.4,
                this.squad.z,
                false,
                1.12
              );
            }
            this.sceneManager.addShake(0.48);
            this.vfx.spawnShockwave(drum.x, drum.z, 2.8, 0.34, 0xff2e58);
            this.particlePool.spawnBurst(drum.x, 0.9, drum.z, 18, 5.4, 0x5c7c9e);
            this.sound.playEnemyPop();
            this.combatText.spawn(drum.x, 1.8, drum.z, 'POD BREACH!', 'negative', 0.95);
            this.triggerRunDefeat();
          } else if (drum.active && !drum.broken) {
            this.squad.funnelAroundStandingObstacle(drum.x, drum.z, 1.02, 0.95, dt);
          }
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
              const ragCount = Math.min(6, Math.abs(collect.deltaSquad));
              for (let r = 0; r < ragCount; r++) {
                this.ragdollPool.spawnKnockback(this.squad.x, this.squad.z, false, 0.95);
              }
            }
            this.applySquadCountWithOverflow(
              collect.rawUnclampedCount,
              collect.worldX,
              collect.worldZ
            );
            this.sound.playGateCollect(collect.positive);
            const fxColor = collect.positive ? 0x38f6ff : 0xff4757;
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
              1.9,
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

      // Update 3-Lane Tire Wall Checkpoints: unbroken sibling stacks stay standing!
      for (let i = 0; i < MAX_TIRE_STACKS; i++) {
        const stack = this.tireStacks[i];
        stack.update(dt, this.squad.z);
        if (state === 'RUNNING' && this.squad.logicalCount > 0) {
          if (stack.checkCoreLaneCrash(this.squad.x, this.squad.z)) {
            const ragBursts = Math.min(12, this.squad.logicalCount);
            for (let r = 0; r < ragBursts; r++) {
              this.ragdollPool.spawnKnockback(
                this.squad.x + ((r % 3) - 1) * 0.45,
                this.squad.z,
                false,
                1.18
              );
            }
            this.sceneManager.addShake(0.55);
            this.vfx.spawnShockwave(stack.x, stack.z, 3.2, 0.38, 0xff3b56);
            this.particlePool.spawnBurst(stack.x, 0.95, stack.z, 22, 5.8, 0x2d3540);
            this.sound.playEnemyPop();
            this.combatText.spawn(
              stack.x,
              1.85,
              stack.z,
              'BARRICADE!',
              'negative',
              1.0
            );
            this.triggerRunDefeat();
          } else if (stack.active && !stack.broken) {
            this.squad.funnelAroundStandingObstacle(stack.x, stack.z, 1.28, 1.14, dt);
          }
        }
      }

      // Update Enemy Skirmish Waves & Per-Trooper Collisions
      for (let i = 0; i < MAX_ENEMY_WAVES; i++) {
        const wave = this.enemyWaves[i];
        if (state === 'RUNNING' || state === 'BOSS_FIGHT') {
          const blockingGateZ = this.findBlockingGateZ(wave.z);
          wave.update(dt, this.squad.x, this.squad.z, blockingGateZ);
          if (this.squad.logicalCount > 0) {
            const collision = wave.resolveSquadCollision(
              this.squad.x,
              this.squad.z,
              this.squad.logicalCount
            );
            if (collision && collision.playerLosses > 0) {
              const lost = collision.playerLosses;
              this.squad.setLogicalCount(this.squad.logicalCount - lost);
              const ragBursts = Math.min(4, lost);
              for (let r = 0; r < ragBursts; r++) {
                this.ragdollPool.spawnKnockback(collision.hitX, collision.hitZ, true, 0.98);
                this.ragdollPool.spawnKnockback(this.squad.x, this.squad.z, false, 0.95);
              }
              this.sceneManager.addShake(0.28);
              this.sound.playEnemyPop();
              this.particlePool.spawnBurst(
                collision.hitX,
                0.8,
                collision.hitZ,
                12,
                5.2,
                0xff4757
              );
              this.combatText.spawn(
                this.squad.x,
                1.6,
                this.squad.z,
                `-${lost}`,
                'negative',
                0.65
              );
              if (this.squad.logicalCount <= 0) {
                this.triggerRunDefeat();
              }
            }
          }
        }
      }
    }

    // Update Mid-Bridge / Right-Corridor Riot Goliath Brutes
    if (this.stateMachine.state === 'RUNNING') {
      const dividerZ = splitDividerActive
        ? this.splitCauseway.dividerTipZ
        : undefined;
      for (let bIdx = 0; bIdx < MAX_MID_BRUTES; bIdx++) {
        const brute = this.midBrutes[bIdx];
        if (!brute.active || brute.defeated) {
          continue;
        }
        // Fast-forward distant Split Causeway Goliaths when the corridor ahead is clear
        if (
          isSplit &&
          this.squad.z - brute.z > 24 &&
          !this.splitCauseway.getClosestRightTarget(24)
        ) {
          brute.z += brute.speed * 1.15 * dt;
        }
        const bruteBlockingGateZ = isSplit ? null : this.findBlockingGateZ(brute.z);
        const bruteSmash = brute.update(
          dt,
          this.squad.x,
          this.squad.z,
          this.squad.logicalCount,
          dividerZ,
          bruteBlockingGateZ
        );
        if (bruteSmash) {
          this.sceneManager.addShake(0.48);
          this.vfx.spawnShockwave(
            bruteSmash.impactX,
            bruteSmash.impactZ,
            3.4,
            0.36,
            0xff384c
          );
          this.particlePool.spawnBurst(
            bruteSmash.impactX,
            0.7,
            bruteSmash.impactZ,
            18,
            6.2,
            0xff4757
          );
          if (bruteSmash.playerLosses > 0 && this.squad.logicalCount > 0) {
            const lost = Math.min(this.squad.logicalCount, bruteSmash.playerLosses);
            const ragLost = Math.min(5, lost);
            for (let r = 0; r < ragLost; r++) {
              this.ragdollPool.spawnKnockback(this.squad.x, this.squad.z, false, 1.25);
            }
            this.squad.setLogicalCount(this.squad.logicalCount - lost);
            this.sound.playBossSalvoImpact(false);
            this.combatText.spawn(
              this.squad.x,
              1.85,
              this.squad.z,
              `-${lost} MAUL!`,
              'negative',
              0.95
            );
            if (this.squad.logicalCount <= 0) {
              this.triggerRunDefeat();
            }
          } else if (this.squad.logicalCount > 0) {
            this.sound.playBossSalvoImpact(true);
            this.combatText.spawn(
              this.squad.x,
              1.75,
              this.squad.z,
              'DODGED!',
              'cyan',
              0.78
            );
          }
        }
      }
    }

    // Update Boss War Machine & Telegraphed Lane Salvos
    if (this.stateMachine.state === 'RUNNING' || this.stateMachine.state === 'BOSS_FIGHT') {
      this.boss.update(
        dt,
        this.stateMachine.state === 'BOSS_FIGHT',
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
        const ragLost = Math.min(3, lost);
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
          1.8,
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
          1.7,
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
        const ragLost = Math.min(3, lost);
        for (let r = 0; r < ragLost; r++) {
          this.ragdollPool.spawnKnockback(this.squad.x, this.squad.z, false, 1.35);
        }
        this.squad.setLogicalCount(this.squad.logicalCount - lost);
        this.sound.playEnemyPop();
        this.particlePool.spawnBurst(this.squad.x, 0.9, this.squad.z, 18, 6.8, 0xff3838);
        this.combatText.spawn(this.squad.x, 1.75, this.squad.z, `-${lost} SLAM!`, 'negative');
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
    const skinTheme = this.saveManager.getData().settings.skinTheme;
    const isSplit = this.activeBoardLayout === 'SPLIT_CAUSEWAY';
    const maxBulletRange = isSplit ? 46 : 36;

    let i = 0;
    while (i < pool.activeCount) {
      const nextAge = pool.age[i] + dt;
      if (nextAge >= pool.maxAge[i]) {
        pool.deactivate(i);
        continue;
      }

      const prevX = pool.x[i];
      const prevZ = pool.z[i];
      const bx = prevX + pool.vx[i] * dt;
      const bz = prevZ + pool.vz[i] * dt;

      if (bz < this.squad.z - maxBulletRange) {
        pool.deactivate(i);
        continue;
      }

      pool.age[i] = nextAge;
      pool.x[i] = bx;
      pool.z[i] = bz;

      // Asymmetric Divider Wall ballistic block on Split Causeway boards
      if (isSplit && this.splitCauseway.checkDividerWallBlock(bx, bz, prevX)) {
        this.vfx.spawnImpactSplash(SPLIT_DIVIDER_X, 1.05, bz, 0.55, 0xffe066);
        this.particlePool.spawnBurst(SPLIT_DIVIDER_X, 1.05, bz, 2, 3.4, 0xffe066, 0.08, 0.18);
        pool.deactivate(i);
        continue;
      }

      const dmg = pool.damage[i];
      const lastHit = pool.lastHitEntityId[i];
      const wTier = (pool.weaponTier[i] || this.squad.weaponTier) as WeaponTierId;
      const weaponSplashHex = getWeaponDisplaySpec(wTier, skinTheme)?.colorHex ?? 0x62f4ff;
      let consumedHit = false;

      if (isSplit && !this.splitCauseway.retractedForBoss) {
        // 1A. Split Causeway Left-Lane [Barrel + Gate/Weapon] Conveyor Queue
        const qRes = this.splitCauseway.tryLeftQueueBulletHit(
          bx,
          bz,
          prevZ,
          dmg,
          lastHit
        );
        if (qRes.type === 'BARREL_HIT') {
          pool.lastHitEntityId[i] = qRes.entityId;
          consumedHit = true;
          this.vfx.spawnImpactSplash(qRes.hitX, 1.08, qRes.hitZ, 0.94, weaponSplashHex);
          this.particlePool.spawnBurst(
            qRes.hitX,
            1.02,
            qRes.hitZ,
            2,
            4.0,
            weaponSplashHex,
            0.09,
            0.22
          );
        } else if (qRes.type === 'NODE_CLEARED') {
          pool.lastHitEntityId[i] = qRes.entityId;
          consumedHit = true;
          this.handleSplitNodeCleared(qRes.worldX, qRes.worldZ, qRes.reward);
        }

        // 1B. Split Causeway Right-Corridor Riot Goliaths
        if (!consumedHit) {
          const blockedByDivider =
            bz <= this.splitCauseway.dividerTipZ && bx < SPLIT_DIVIDER_X + 0.22;
          if (!blockedByDivider) {
            for (let bIdx = 0; bIdx < MAX_MID_BRUTES; bIdx++) {
              const brute = this.midBrutes[bIdx];
              if (!brute.active || brute.defeated) {
                continue;
              }
              const bruteRes = brute.tryBulletHit(
                bx,
                bz,
                prevZ,
                dmg,
                lastHit,
                this.squad.z,
                42
              );
              if (bruteRes === 'NONE') {
                continue;
              }
              pool.lastHitEntityId[i] = brute.entityId;
              consumedHit = true;
              if (bruteRes === 'HIT') {
                this.vfx.spawnImpactSplash(
                  bx,
                  1.55,
                  brute.z + 0.85,
                  1.06,
                  weaponSplashHex
                );
                this.particlePool.spawnBurst(
                  bx,
                  1.5,
                  brute.z + 0.6,
                  3,
                  4.4,
                  weaponSplashHex,
                  0.11,
                  0.24
                );
              } else if (bruteRes === 'DEFEATED') {
                this.handleMidBruteDefeated(brute);
              }
              break;
            }
          }
        }

        // 1C. Split Causeway Right-Lane Multi-Echelon Battalion
        if (!consumedHit) {
          const armyRes = this.splitCauseway.tryRightArmyBulletHit(
            bx,
            bz,
            prevZ,
            dmg,
            lastHit
          );
          if (armyRes.status !== 'MISS') {
            pool.lastHitEntityId[i] = armyRes.entityId;
            consumedHit = true;
            if (armyRes.status === 'KILL') {
              const ev = this.splitCauseway.lastKill;
              this.enemiesDefeatedThisRun += 1;
              this.sound.playEnemyPop();
              this.vfx.spawnImpactSplash(
                ev.x,
                0.96,
                ev.z,
                ev.isHeavy ? 1.42 : 0.96,
                weaponSplashHex
              );
              this.ragdollPool.spawnKnockback(
                ev.x,
                ev.z,
                true,
                ev.isHeavy ? 1.28 : 1.02
              );
              this.spawnGoldConfettiShower(ev.x, 1.05, ev.z, ev.isHeavy ? 10 : 3);
              this.awardLiveCoins(ev.coinReward, ev.x, ev.z, ev.isHeavy);
            } else {
              this.vfx.spawnImpactSplash(bx, 0.94, bz, 0.78, weaponSplashHex);
            }
          }
        }
      } else if (!isSplit) {
        // 1. Check Supply Drums
        for (let d = 0; d < MAX_SUPPLY_DRUMS; d++) {
          const drum = this.supplyDrums[d];
          const res = drum.tryBulletHit(bx, bz, prevZ, dmg, lastHit);
          if (res === 'NONE') {
            continue;
          }
          pool.lastHitEntityId[i] = drum.entityId;
          consumedHit = true;

          if (res === 'HIT') {
            this.vfx.spawnImpactSplash(bx, 1.04, drum.z + 0.95, 0.92, weaponSplashHex);
            this.particlePool.spawnBurst(bx, 1.0, drum.z, 2, 4.0, weaponSplashHex, 0.09, 0.22);
          } else if (res === 'SHATTERED') {
            this.handleSupplyDrumShattered(drum);
          }
          break;
        }

        // 2. Check Mid-Bridge Siege Goliath Brutes first so Holo-Gates behind/near a duel never block bullets!
        if (!consumedHit) {
          for (let bIdx = 0; bIdx < MAX_MID_BRUTES; bIdx++) {
            const brute = this.midBrutes[bIdx];
            if (!brute.active || brute.defeated) {
              continue;
            }
            const bruteRes = brute.tryBulletHit(
              bx,
              bz,
              prevZ,
              dmg,
              lastHit,
              this.squad.z
            );
            if (bruteRes === 'NONE') {
              continue;
            }
            pool.lastHitEntityId[i] = brute.entityId;
            consumedHit = true;
            if (bruteRes === 'HIT') {
              this.vfx.spawnImpactSplash(
                bx,
                1.55,
                brute.z + 0.85,
                1.06,
                weaponSplashHex
              );
              this.particlePool.spawnBurst(
                bx,
                1.5,
                brute.z + 0.6,
                3,
                4.4,
                weaponSplashHex,
                0.11,
                0.24
              );
            } else if (bruteRes === 'DEFEATED') {
              this.handleMidBruteDefeated(brute);
            }
            break;
          }
        }

        // 2.5 Check Gate Pairs
        if (!consumedHit) {
          for (let g = 0; g < MAX_GATE_PAIRS; g++) {
            const hit = this.gatePairs[g].tryBulletHit(bx, bz, prevZ, dmg, lastHit);
            if (!hit) {
              continue;
            }
            pool.lastHitEntityId[i] = hit.entityId;
            consumedHit = true;

            if (hit.ricochet) {
              this.sound.playRicochet();
              this.vfx.spawnImpactSplash(hit.hitX, 0.52, hit.hitZ, 0.55, 0xffe066);
              this.particlePool.spawnBurst(hit.hitX, 0.52, hit.hitZ, 3, 4.0, 0xffe066, 0.09, 0.22);
            } else {
              this.vfx.spawnImpactSplash(hit.hitX, 0.46, hit.hitZ, 0.56, weaponSplashHex);
              this.particlePool.spawnBurst(
                hit.hitX,
                0.48,
                hit.hitZ,
                2,
                3.2,
                weaponSplashHex,
                0.09,
                0.20
              );
              if (hit.flippedToPositive) {
                this.gatesFlippedThisRun++;
                this.sound.playGateFlipChime();
                this.sceneManager.addShake(0.2);
                this.vfx.spawnShockwave(hit.hitX, hit.hitZ, 3.2, 0.38, 0x36f3ff);
                this.particlePool.spawnBurst(hit.hitX, 1.5, hit.hitZ, 20, 6.5, 0x36f3ff, 0.18, 0.55);
                this.combatText.spawn(
                  hit.hitX,
                  2.3,
                  hit.hitZ,
                  `${hit.formattedLabel}!`,
                  'cyan',
                  0.95
                );
              } else if (hit.deltaIncrements > 0) {
                this.sound.playGateTick(hit.newValue);
              }
            }
            break;
          }
        }

        // 3. Check 3-Lane Tire Wall Checkpoints
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
              this.vfx.spawnImpactSplash(bx, 1.08, stack.z + 1.15, 0.94, weaponSplashHex);
              this.particlePool.spawnBurst(bx, 0.95, stack.z, 2, 4.0, weaponSplashHex, 0.1, 0.22);
            } else if (res === 'SHATTERED') {
              this.handleTireStackShattered(stack);
            }
            break;
          }
        }

        // 4. Check Enemy Skirmish Waves (per-trooper hit, grey ragdoll knockback & gold coin pop)
        if (!consumedHit) {
          for (let w = 0; w < MAX_ENEMY_WAVES; w++) {
            const wave = this.enemyWaves[w];
            const kills = wave.tryBulletHit(bx, bz, prevZ, dmg, lastHit);
            if (kills < 0) {
              continue;
            }
            pool.lastHitEntityId[i] = wave.entityId;
            consumedHit = true;

            if (kills > 0 && wave.lastKillCount > 0) {
              const ev = wave.lastKills[0];
              this.enemiesDefeatedThisRun += kills;
              this.sound.playEnemyPop();
              this.vfx.spawnImpactSplash(
                ev.x,
                0.96,
                ev.z,
                ev.isHeavy ? 1.42 : 0.96,
                weaponSplashHex
              );
              this.ragdollPool.spawnKnockback(ev.x, ev.z, true, ev.isHeavy ? 1.28 : 1.02);
              this.spawnGoldConfettiShower(ev.x, 1.05, ev.z, ev.isHeavy ? 10 : 3);
              this.awardLiveCoins(
                ev.coinReward * kills,
                ev.x,
                ev.z,
                ev.isHeavy
              );
            } else {
              this.vfx.spawnImpactSplash(bx, 0.94, bz, 0.78, weaponSplashHex);
            }
            break;
          }
        }
      }

      // 5. Check Boss Entity (including final approach at 95%-100% so bullets strike the visible Boss!)
      const canHitBoss =
        this.boss.active &&
        !this.boss.defeated &&
        (this.stateMachine.state === 'BOSS_FIGHT' ||
          (this.stateMachine.state === 'RUNNING' && this.squad.z - this.boss.z <= 28));
      if (!consumedHit && canHitBoss) {
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
          this.vfx.spawnImpactSplash(bx, 1.45, this.boss.z + 0.95, 1.02, weaponSplashHex);
          this.particlePool.spawnBurst(bx, 1.4, this.boss.z + 0.6, 3, 4.6, weaponSplashHex, 0.12, 0.26);
          if (this.boss.lastStepSegmentBroken) {
            this.sound.playTireBreak(false);
            this.sceneManager.addShake(0.28);
            this.vfx.spawnShockwave(this.boss.x, this.boss.z + 0.5, 3.4, 0.34, 0xffb830);
            this.spawnGoldConfettiShower(this.boss.x, 2.2, this.boss.z + 0.6, 14);
            const segEarned = this.awardLiveCoins(25, this.boss.x, this.boss.z + 0.8, false);
            this.combatText.spawn(
              this.boss.x,
              3.9,
              this.boss.z,
              `ARMOR BREAK! +${formatCoinAmount(segEarned)}`,
              'gold',
              0.78
            );
          }
          if (bossRes === 'DEFEATED') {
            this.handleBossDefeated();
          }
        }
      }

      if (consumedHit) {
        if (skinTheme === 'UNICORN') {
          this.spawnRainbowSparkles(bx, 1.06, bz, 3, 4.4);
        }
        pool.pierceLeft[i] -= 1;
        if (pool.pierceLeft[i] <= 0) {
          pool.deactivate(i);
          continue;
        }
      }

      i++;
    }
  }

  private rainbowSparkCursor = 0;

  private spawnRainbowSparkles(
    x: number,
    y: number,
    z: number,
    count: number,
    speed = 4.6
  ): void {
    for (let c = 0; c < count; c++) {
      const idx = (this.rainbowSparkCursor + c) % RAINBOW_SPARK_HEX.length;
      const colorHex = RAINBOW_SPARK_HEX[idx];
      const ang = (c / Math.max(1, count)) * Math.PI * 2 + this.elapsedTime * 5.3 + idx * 0.65;
      const spd = speed * (0.65 + (c % 3) * 0.24);
      this.particlePool.spawn(
        x + Math.cos(ang) * 0.14,
        y,
        z + Math.sin(ang) * 0.14,
        Math.cos(ang) * spd,
        3.2 + (c % 4) * 1.15,
        Math.sin(ang) * spd * 0.85,
        -13.5,
        0.34,
        0.15,
        colorHex
      );
    }
    this.rainbowSparkCursor = (this.rainbowSparkCursor + count) % RAINBOW_SPARK_HEX.length;
  }

  private spawnGoldConfettiShower(x: number, y: number, z: number, count: number): void {
    for (let c = 0; c < count; c++) {
      const ang = (c / count) * Math.PI * 2 + this.elapsedTime * 3.1;
      const spd = 2.6 + (c % 3) * 1.35;
      this.particlePool.spawn(
        x + Math.cos(ang) * 0.25,
        y,
        z + Math.sin(ang) * 0.25,
        Math.cos(ang) * spd,
        5.8 + (c % 4) * 1.15,
        Math.sin(ang) * spd * 0.85,
        -16.5,
        0.72,
        0.19,
        c % 2 === 0 ? 0xffdf4d : 0xfff099
      );
    }
  }

  private handleSplitNodeCleared(
    worldX: number,
    worldZ: number,
    reward: SplitNodeReward
  ): void {
    this.drumsBrokenThisRun++;
    this.celebrateHopTimer = 0.38;
    this.splitCauseway.triggerSquadCelebration(this.squad.x, this.squad.z);

    this.sceneManager.addShake(0.24);
    this.vfx.spawnShockwave(worldX, worldZ, 2.8, 0.36, 0x28f8dc);
    this.vfx.spawnImpactSplash(worldX, 1.25, worldZ + 0.5, 1.65, 0x70ffe8);
    this.particlePool.spawnBurst(worldX, 1.0, worldZ, 20, 6.2, 0x6c86a4, 0.18, 0.5);

    if (reward.kind === 'GATE') {
      this.gatesFlippedThisRun++;
      const prevSquad = this.squad.logicalCount;
      const nextSquad = resolveGateSquadCount(
        prevSquad,
        reward.operator,
        reward.value
      );
      const delta = nextSquad - prevSquad;
      const label = formatGateLabel(reward.operator, reward.value, true);

      this.applySquadCountWithOverflow(nextSquad, this.squad.x, this.squad.z);
      this.sound.playGateCollect(true);
      this.vfx.spawnShockwave(worldX, worldZ - 1.6, 3.1, 0.36, 0x18f2c8);
      this.particlePool.spawnBurst(
        this.squad.x,
        1.15,
        this.squad.z,
        18,
        5.8,
        0x28f8dc,
        0.16,
        0.48
      );
      const deltaLabel = delta > 0 ? ` (+${delta})` : '';
      this.combatText.spawn(
        this.squad.x,
        2.05,
        this.squad.z,
        `${label}!${deltaLabel}`,
        'positive',
        1.02
      );
    } else if (reward.kind === 'WEAPON') {
      this.applyWeaponDrop(reward.weaponTier, worldX, worldZ - 1.5);
    } else {
      this.sound.playTireBreak(false);
      this.spawnGoldConfettiShower(worldX, 1.45, worldZ, 16);
      this.awardLiveCoins(reward.coins, worldX, worldZ, true);
    }
  }

  private handleMidBruteDefeated(brute: MidBridgeBrute): void {
    this.enemiesDefeatedThisRun += 1;
    this.sound.playBossDefeat();
    this.sceneManager.addShake(0.56);
    const isUnicorn = this.saveManager.getData().settings.skinTheme === 'UNICORN';
    const ringColor = isUnicorn ? 0x1d70ff : 0xff2e5c;
    this.vfx.spawnShockwave(brute.x, brute.z, 5.2, 0.5, ringColor);
    this.vfx.spawnImpactSplash(brute.x, 1.8, brute.z, 2.2, 0xffbe3b);
    this.particlePool.spawnBurst(
      brute.x,
      1.7,
      brute.z,
      32,
      8.2,
      ringColor,
      0.22,
      0.72
    );
    for (let r = 0; r < 3; r++) {
      this.ragdollPool.spawnKnockback(
        brute.x + (r - 1) * 0.45,
        brute.z,
        true,
        1.55
      );
    }
    if (isUnicorn) {
      this.spawnRainbowSparkles(brute.x, 2.0, brute.z, 18, 7.5);
    }
    this.spawnGoldConfettiShower(brute.x, 1.8, brute.z, 22);
    const earned = this.awardLiveCoins(
      brute.coinReward,
      brute.x,
      brute.z,
      false
    );
    this.combatText.spawn(
      brute.x,
      2.7,
      brute.z,
      `${isUnicorn ? 'WAR-UNICORN DOWN!' : 'GOLIATH DOWN!'} +${formatCoinAmount(earned)}`,
      'gold',
      1.15
    );
  }

  private applyWeaponDrop(
    droppedTier: WeaponTierId,
    worldX: number,
    worldZ: number
  ): void {
    const skinTheme = this.saveManager.getData().settings.skinTheme;
    const pickup = resolveWeaponPickup(this.squad.weaponTier, droppedTier, skinTheme);
    this.sound.playTireBreak(pickup.upgraded);

    if (pickup.upgraded) {
      this.squad.weaponTier = pickup.equippedTier;
      const colorHex = getWeaponDisplaySpec(pickup.equippedTier, skinTheme).colorHex;
      this.particlePool.spawnBurst(this.squad.x, 1.2, this.squad.z, 20, 6.0, colorHex, 0.18, 0.55);
      this.combatText.spawn(
        worldX,
        2.15,
        worldZ,
        pickup.bannerText,
        pickup.equippedTier === 5 ? 'cyan' : 'gold',
        1.1
      );
    } else {
      this.weaponLocksThisRun++;
      const earned = this.awardLiveCoins(pickup.bonusCoins, worldX, worldZ, false);
      this.applySquadCountWithOverflow(
        this.squad.logicalCount + pickup.bonusSquad,
        worldX,
        worldZ
      );
      this.spawnGoldConfettiShower(worldX, 1.4, worldZ, 12);
      this.combatText.spawn(
        worldX,
        2.25,
        worldZ,
        `${skinTheme === 'UNICORN' ? 'MAGIC LOCK!' : 'WEAPON LOCK!'} +${formatCoinAmount(earned)}`,
        'gold',
        1.1
      );
    }
  }

  private handleSupplyDrumShattered(drum: SupplyDrumSlot): void {
    this.drumsBrokenThisRun++;
    this.sceneManager.addShake(0.24);
    const isUnicorn = this.saveManager.getData().settings.skinTheme === 'UNICORN';
    this.vfx.spawnShockwave(drum.x, drum.z, 2.6, 0.34, isUnicorn ? 0xff5cb8 : 0x28f8dc);
    this.vfx.spawnImpactSplash(drum.x, 1.25, drum.z + 0.5, 1.6, isUnicorn ? 0xffaae8 : 0x70ffe8);
    this.particlePool.spawnBurst(
      drum.x,
      1.0,
      drum.z,
      20,
      6.2,
      isUnicorn ? 0xd98ce8 : 0x6c86a4,
      0.18,
      0.5
    );

    if (drum.rewardType === 'COINS') {
      this.sound.playTireBreak(false);
      this.spawnGoldConfettiShower(drum.x, 1.45, drum.z, 14);
      this.awardLiveCoins(drum.rewardValue, drum.x, drum.z, true);
    } else if (drum.rewardType === 'RECRUIT') {
      this.sound.playGateCollect(true);
      this.particlePool.spawnBurst(
        drum.x,
        1.4,
        drum.z,
        18,
        5.5,
        isUnicorn ? 0xff66c4 : 0x38f6ff,
        0.18,
        0.55
      );
      this.applySquadCountWithOverflow(
        this.squad.logicalCount + drum.rewardValue,
        drum.x,
        drum.z
      );
      const unitLabel = isUnicorn ? 'PINK GIRL' : 'COMMANDO';
      this.combatText.spawn(
        drum.x,
        2.05,
        drum.z,
        `+${drum.rewardValue} ${unitLabel}${drum.rewardValue > 1 ? 'S' : ''}!`,
        'positive',
        1.0
      );
    } else {
      const wTier = Math.max(1, Math.min(5, Math.round(drum.rewardValue))) as WeaponTierId;
      this.applyWeaponDrop(wTier, drum.x, drum.z);
    }
  }

  private handleTireStackShattered(stack: TireWeaponStackSlot): void {
    this.tiresBrokenThisRun++;
    this.sceneManager.addShake(0.36);
    const skinTheme = this.saveManager.getData().settings.skinTheme;
    const ringHex = stack.weaponTier
      ? getWeaponDisplaySpec(stack.weaponTier, skinTheme).colorHex
      : 0xffd447;
    this.vfx.spawnShockwave(stack.x, stack.z, 3.3, 0.42, ringHex);
    this.vfx.spawnImpactSplash(stack.x, 1.35, stack.z + 0.8, 1.75, ringHex);
    this.particlePool.spawnBurst(stack.x, 1.1, stack.z, 24, 6.8, 0x2d3540, 0.2, 0.55);

    if (stack.weaponTier !== null) {
      this.applyWeaponDrop(stack.weaponTier, stack.x, stack.z);
    } else {
      this.sound.playTireBreak(false);
      this.spawnGoldConfettiShower(stack.x, 1.5, stack.z, 16);
      this.awardLiveCoins(stack.coinReward, stack.x, stack.z, true);
    }
  }

  private endlessSplitClearedMeters = 0;

  private handleBossDefeated(): void {
    const save = this.saveManager.getData();
    const isUnicorn = save.settings.skinTheme === 'UNICORN';

    if (isUnicorn) {
      this.sound.playUnicornVictoryFanfare();
    } else {
      this.sound.playBossDefeat();
    }
    this.sceneManager.addShake(0.68);
    this.vfx.spawnShockwave(
      this.boss.x,
      this.boss.z,
      6.5,
      0.62,
      isUnicorn ? 0xff4fa8 : 0xffae42
    );
    this.vfx.spawnShockwave(
      this.boss.x,
      this.boss.z,
      4.2,
      0.44,
      isUnicorn ? 0x249dff : 0xff384c
    );
    if (isUnicorn) {
      this.spawnRainbowSparkles(this.boss.x, 2.3, this.boss.z, 36, 9.2);
      this.spawnGoldConfettiShower(this.boss.x, 2.1, this.boss.z, 24);
    } else {
      this.particlePool.spawnBurst(this.boss.x, 2.0, this.boss.z, 46, 9.5, 0xffae42, 0.26, 0.85);
      this.particlePool.spawnBurst(this.boss.x, 2.2, this.boss.z, 32, 8.0, 0xff384c, 0.24, 0.75);
    }

    if (save.selectedMode === 'ENDLESS') {
      if (this.endlessWave === 1) {
        this.endlessSplitClearedMeters = 0;
      }
      if (this.activeBoardLayout === 'SPLIT_CAUSEWAY') {
        this.endlessSplitClearedMeters += this.activeStageDef.trackLength;
      }
      const earned = this.awardLiveCoins(this.boss.rewardCoins, 0, this.squad.z - 4, false);
      const clearedWave = this.endlessWave;
      this.combatText.spawn(
        0,
        2.6,
        this.squad.z - 4,
        `WAVE ${clearedWave} CLEARED! +${formatCoinAmount(earned)}`,
        'gold',
        1.3
      );
      if (isUnicorn) {
        this.hud.triggerEndlessUnicornFlyby(clearedWave);
      }
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
    if (isUnicorn) {
      this.hud.triggerUnicornVictoryCelebration(summary);
    } else {
      this.hud.showSummaryModal(summary);
    }
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
    const sectorProgress = clearedStage ? 1 : this.computeSectorProgressRatio();
    const rawRunDistance =
      this.computeRunDistanceMeters() +
      (save.selectedMode === 'ENDLESS' && this.endlessWave > 1
        ? this.endlessSplitClearedMeters
        : 0);

    const effectiveProgressForCoins =
      save.selectedMode === 'ENDLESS'
        ? rawRunDistance / 1160
        : clearedStage
          ? 1.0
          : sectorProgress;

    const stageNumberForSummary =
      save.selectedMode === 'ENDLESS'
        ? this.endlessWave
        : save.selectedMode === 'SPLIT_CAUSEWAY'
          ? save.splitCausewayStage
          : save.selectedStage;

    // End-of-run progress & clear bonus (on top of live coins already collected mid-bridge)
    const payout = computeRunCoinPayout({
      progressRatio: effectiveProgressForCoins,
      stageNumber: this.activeStageDef.stageNumber,
      enemiesDefeated: 0,
      bonusCoinsCollected: 0,
      bossRewardCoins: this.boss.rewardCoins,
      clearedStage,
      warChestLevel: save.upgrades.warChest,
    });

    const totalRunCoins = this.liveCoinsThisRun + payout.totalCoinsEarned;

    const summary: RunSummary = {
      outcome,
      mode: save.selectedMode,
      stageNumber: stageNumberForSummary,
      distanceMeters:
        clearedStage && save.selectedMode !== 'ENDLESS'
          ? this.activeStageDef.trackLength
          : rawRunDistance,
      progressRatio: sectorProgress,
      enemiesDefeated: this.enemiesDefeatedThisRun,
      drumsBroken: this.drumsBrokenThisRun,
      gatesFlipped: this.gatesFlippedThisRun,
      peakSquad: this.squad.peakCount,
      liveCoinsEarned: this.liveCoinsThisRun,
      distanceCoins: payout.distanceCoins,
      killCoins: payout.killCoins,
      bonusCoins: payout.bonusCoins,
      warChestMultiplier: payout.warChestMultiplier,
      totalCoinsEarned: totalRunCoins,
    };

    const updated = this.saveManager.update((draft) => {
      draft.coins += payout.totalCoinsEarned;
      draft.highScoreSquad = Math.max(draft.highScoreSquad, this.squad.peakCount);
      if (draft.selectedMode === 'ENDLESS') {
        draft.bestEndlessDistance = Math.max(
          draft.bestEndlessDistance,
          Math.round(rawRunDistance)
        );
      } else if (draft.selectedMode === 'SPLIT_CAUSEWAY') {
        if (clearedStage) {
          draft.splitCausewayStage += 1;
        }
        draft.bestSplitStage = Math.max(
          draft.bestSplitStage,
          draft.splitCausewayStage
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

    const celebrateHop =
      this.celebrateHopTimer > 0 ? 1 - this.celebrateHopTimer / 0.38 : 0;

    this.updateFocalTarget();

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
      this.commandoFacingYaw,
      celebrateHop,
      this.focalTargetX,
      this.focalTargetZ,
      isMoving
    );

    this.batchRenderer.beginEnemyFrame();
    if (this.activeBoardLayout === 'SPLIT_CAUSEWAY') {
      this.splitCauseway.pushInstances(this.batchRenderer, isMoving);
    } else {
      for (let i = 0; i < MAX_ENEMY_WAVES; i++) {
        this.enemyWaves[i].pushInstances(this.batchRenderer, isMoving);
      }
    }
    this.batchRenderer.finishEnemyFrame();

    this.batchRenderer.syncRagdolls(this.ragdollPool);
    this.batchRenderer.syncBullets(this.bulletPool);
    this.batchRenderer.syncParticles(this.particlePool);
    this.vfx.updateAndSync(realDt * this.stateMachine.timeScale);

    this.sceneManager.render();

    const save = this.saveManager.getData();
    const sectorRatio = this.computeSectorProgressRatio();
    this.hud.updateTrackProgress(
      sectorRatio,
      save.selectedMode,
      this.computeRunDistanceMeters(),
      this.endlessWave,
      save.splitCausewayStage
    );

    const effectiveState =
      state === 'PAUSED' ? this.stateMachine.resumeTargetState : state;
    const bossApproachEngaged =
      effectiveState === 'RUNNING' &&
      this.boss.active &&
      (this.boss.currentHp < this.boss.maxHp - 0.01 ||
        this.squad.z - this.boss.z <= 28);
    const bossHudActive =
      this.boss.active &&
      !this.boss.defeated &&
      (effectiveState === 'BOSS_FIGHT' || bossApproachEngaged);

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
      this.boss.segments,
      this.splitCauseway
    );

    if (state !== 'PAUSED') {
      this.combatText.update(realDt, this.sceneManager);
      this.hud.tickCelebrationOverlay(realDt);
    }
  }

  public advanceSimulation(
    seconds: number,
    targetX?: number,
    skipRender = false
  ): TelemetrySnapshot {
    const step = 1 / 60;
    const ticks = Math.max(1, Math.round(seconds / step));
    for (let i = 0; i < ticks; i++) {
      if (typeof targetX === 'number') {
        const dx = targetX - this.squad.x;
        this.squad.x += Math.sign(dx) * Math.min(Math.abs(dx), 15 * step);
      }
      this.fixedUpdate(step);
      if (i < ticks - 1) {
        this.vfx.updateAndSync(step * this.stateMachine.timeScale);
        if (this.stateMachine.state !== 'PAUSED') {
          this.combatText.update(step, this.sceneManager);
          this.hud.tickCelebrationOverlay(step);
        }
        if (this.stateMachine.tickRealTime(step) && this.pendingSummary) {
          this.hud.showSummaryModal(this.pendingSummary);
        }
      }
    }
    if (skipRender) {
      this.vfx.updateAndSync(step * this.stateMachine.timeScale);
      if (this.stateMachine.state !== 'PAUSED') {
        this.hud.tickCelebrationOverlay(step);
      }
      if (this.stateMachine.tickRealTime(step) && this.pendingSummary) {
        this.hud.showSummaryModal(this.pendingSummary);
      }
    } else {
      this.renderFrame(step);
    }
    return this.getTelemetrySnapshot();
  }

  public getTelemetrySnapshot(): TelemetrySnapshot {
    const save = this.saveManager.getData();
    const progress = this.computeSectorProgressRatio();
    const bruteTelemetry = this.getPrimaryBruteTelemetry();
    const stageNum =
      save.selectedMode === 'ENDLESS'
        ? this.endlessWave
        : save.selectedMode === 'SPLIT_CAUSEWAY'
          ? save.splitCausewayStage
          : save.selectedStage;

    let recommendedDodgeX: number | null = this.boss.getRecommendedSafeLaneX(
      this.squad.x
    );
    if (recommendedDodgeX === null && this.stateMachine.state === 'RUNNING') {
      for (let i = 0; i < MAX_MID_BRUTES; i++) {
        const dangerX = this.midBrutes[i].getActiveDangerSmashX();
        if (dangerX !== null && this.squad.z - this.midBrutes[i].z <= 12.0) {
          recommendedDodgeX = dangerX >= 0 ? -2.45 : 3.15;
          break;
        }
      }
    }

    let splitClosestThreatZ: number | null = null;
    if (
      this.activeBoardLayout === 'SPLIT_CAUSEWAY' &&
      !this.splitCauseway.retractedForBoss
    ) {
      const cr = this.splitCauseway.getClosestRightTarget(64);
      if (cr) {
        splitClosestThreatZ = cr.z;
      }
      for (let i = 0; i < MAX_MID_BRUTES; i++) {
        const b = this.midBrutes[i];
        if (b.active && !b.defeated && b.z >= this.sectorBaseZ - 64) {
          if (splitClosestThreatZ === null || b.z > splitClosestThreatZ) {
            splitClosestThreatZ = b.z;
          }
        }
      }
    }

    return {
      state: this.stateMachine.state,
      mode: save.selectedMode,
      boardLayout: this.activeBoardLayout,
      skinTheme: save.settings.skinTheme,
      stage: stageNum,
      coins: save.coins,
      liveCoinsThisRun: this.liveCoinsThisRun,
      logicalSquad: this.squad.logicalCount,
      visualSquad: Math.min(this.squad.logicalCount, MAX_VISUAL_SOLDIERS),
      squadX: this.squad.x,
      squadZ: this.squad.z,
      progress,
      weaponTier: this.squad.weaponTier,
      weaponBadge: getWeaponDisplaySpec(this.squad.weaponTier, save.settings.skinTheme)
        .shortBadge,
      bossHp: this.boss.currentHp,
      bossMaxHp: this.boss.maxHp,
      bruteHp: bruteTelemetry.hp,
      bruteMaxHp: bruteTelemetry.maxHp,
      marchHaltedByBrute:
        this.stateMachine.state === 'RUNNING' &&
        this.isAnyBruteHaltingMarch(this.squad.z),
      recommendedDodgeX,
      splitQueueRemaining:
        this.activeBoardLayout === 'SPLIT_CAUSEWAY'
          ? this.splitCauseway.getQueueRemaining()
          : 0,
      splitRightAlive:
        this.activeBoardLayout === 'SPLIT_CAUSEWAY'
          ? this.splitCauseway.rightAliveCount
          : 0,
      splitClosestThreatZ,
      drumsBrokenThisRun: this.drumsBrokenThisRun,
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

  public getDebugProbe(): {
    focalTargetX: number;
    focalTargetZ: number;
    commandoFacingYaw: number;
    minSoldierX: number;
    maxSoldierX: number;
    meanBulletX: number | null;
    cameraY: number;
    cameraDeltaZ: number;
    cameraFov: number;
    splitDividerX: number;
    nextUncollectedGateZ: number | null;
    minBehindGateWaveDist: number | null;
  } {
    const vis = Math.min(this.squad.logicalCount, MAX_VISUAL_SOLDIERS);
    let minSoldierX = this.squad.x;
    let maxSoldierX = this.squad.x;
    if (vis > 0) {
      minSoldierX = Infinity;
      maxSoldierX = -Infinity;
      for (let i = 0; i < vis; i++) {
        const sx = this.squad.soldierWorldX[i];
        if (sx < minSoldierX) minSoldierX = sx;
        if (sx > maxSoldierX) maxSoldierX = sx;
      }
    }
    let sumBx = 0;
    const bc = this.bulletPool.activeCount;
    for (let i = 0; i < bc; i++) {
      sumBx += this.bulletPool.x[i];
    }

    let nextUncollectedGateZ: number | null = null;
    let minBehindGateWaveDist: number | null = null;
    if (this.activeBoardLayout !== 'SPLIT_CAUSEWAY') {
      for (let g = 0; g < MAX_GATE_PAIRS; g++) {
        const pair = this.gatePairs[g];
        if (!pair.active || pair.triggered || pair.z > this.squad.z + 1.5) {
          continue;
        }
        if (nextUncollectedGateZ === null || pair.z > nextUncollectedGateZ) {
          nextUncollectedGateZ = pair.z;
        }
        for (let w = 0; w < MAX_ENEMY_WAVES; w++) {
          const wave = this.enemyWaves[w];
          if (!wave.active || wave.aliveCount <= 0 || wave.z > pair.z + 2.0) {
            continue;
          }
          const dist = pair.z - wave.z;
          if (minBehindGateWaveDist === null || dist < minBehindGateWaveDist) {
            minBehindGateWaveDist = dist;
          }
        }
      }
    }

    return {
      focalTargetX: this.focalTargetX,
      focalTargetZ: this.focalTargetZ,
      commandoFacingYaw: this.commandoFacingYaw,
      minSoldierX,
      maxSoldierX,
      meanBulletX: bc > 0 ? sumBx / bc : null,
      cameraY: this.sceneManager.camera.position.y,
      cameraDeltaZ: this.sceneManager.camera.position.z - this.squad.z,
      cameraFov: this.sceneManager.camera.fov,
      splitDividerX: SPLIT_DIVIDER_X,
      nextUncollectedGateZ,
      minBehindGateWaveDist,
    };
  }
}
