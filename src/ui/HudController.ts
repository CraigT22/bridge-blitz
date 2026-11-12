import type {
  GameMode,
  RunSummary,
  SaveDataV1,
  UpgradeKey,
  WeaponTierId,
} from '../core/types';
import type { EnemyWaveSlot } from '../entities/EnemyWave';
import {
  computeUpgradeCost,
  formatUpgradeStatPreview,
  UPGRADE_ORDER,
} from '../math/progressionMath';
import { WEAPON_SPECS } from '../math/weaponMath';
import type { SceneManager, ScreenProjection } from '../rendering/SceneManager';

export interface HudActions {
  onStartMarch: () => void;
  onBuyUpgrade: (key: UpgradeKey) => void;
  onSelectMode: (mode: GameMode) => void;
  onStepStage: (delta: -1 | 1) => void;
  onToggleMute: () => void;
  onToggleHaptics: () => void;
  onExportSave: () => void;
  onResetSave: () => void;
  onSummaryContinue: () => void;
}

const MAX_WAVE_BADGES = 5;
const _proj: ScreenProjection = { x: 0, y: 0, visible: false };

function mustEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing DOM element #${id}`);
  }
  return el as T;
}

export class HudController {
  private readonly actions: HudActions;

  private readonly coinCountEl = mustEl<HTMLSpanElement>('hud-coin-count');
  private readonly stageLabelEl = mustEl<HTMLSpanElement>('hud-stage-label');
  private readonly distanceLabelEl = mustEl<HTMLSpanElement>('hud-distance-label');
  private readonly progressFillEl = mustEl<HTMLDivElement>('hud-progress-fill');

  private readonly squadBadgeEl = mustEl<HTMLDivElement>('squad-count-badge');
  private readonly squadCountValEl = mustEl<HTMLSpanElement>('squad-count-value');
  private readonly squadWeaponValEl = mustEl<HTMLSpanElement>('squad-weapon-badge');

  private readonly bossHudEl = mustEl<HTMLDivElement>('boss-health-hud');
  private readonly bossNameEl = mustEl<HTMLSpanElement>('boss-hud-name');
  private readonly bossHpEl = mustEl<HTMLSpanElement>('boss-hud-hp');
  private readonly bossFillEl = mustEl<HTMLDivElement>('boss-hud-fill');
  private readonly bossSegmentsEl = mustEl<HTMLDivElement>('boss-hud-segments');
  private readonly bossTicks: HTMLSpanElement[] = [];

  private readonly waveBadgeEls: HTMLDivElement[] = [];

  private readonly preRunOverlayEl = mustEl<HTMLElement>('pre-run-overlay');
  private readonly btnModeCampaign = mustEl<HTMLButtonElement>('btn-mode-campaign');
  private readonly btnModeEndless = mustEl<HTMLButtonElement>('btn-mode-endless');
  private readonly stepperGroup = mustEl<HTMLDivElement>('campaign-stage-stepper');
  private readonly btnStagePrev = mustEl<HTMLButtonElement>('btn-stage-prev');
  private readonly btnStageNext = mustEl<HTMLButtonElement>('btn-stage-next');
  private readonly labelSelectedStage = mustEl<HTMLSpanElement>('label-selected-stage');

  private readonly settingsBtn = mustEl<HTMLButtonElement>('btn-settings');
  private readonly settingsDrawer = mustEl<HTMLElement>('settings-drawer');
  private readonly muteLabelEl = mustEl<HTMLSpanElement>('label-mute-state');
  private readonly hapticsLabelEl = mustEl<HTMLSpanElement>('label-haptics-state');
  private readonly exportStatusEl = mustEl<HTMLSpanElement>('label-export-status');
  private readonly resetPromptEl = mustEl<HTMLSpanElement>('label-reset-prompt');
  private readonly bestSquadEl = mustEl<HTMLSpanElement>('record-best-squad');
  private readonly bestEndlessEl = mustEl<HTMLSpanElement>('record-best-endless');

  private readonly summaryModalEl = mustEl<HTMLElement>('run-summary-modal');
  private readonly summaryKickerEl = mustEl<HTMLDivElement>('summary-kicker');
  private readonly summaryTitleEl = mustEl<HTMLHeadingElement>('summary-title');
  private readonly summaryDistEl = mustEl<HTMLElement>('summary-distance');
  private readonly summaryPeakEl = mustEl<HTMLElement>('summary-peak-squad');
  private readonly summaryKillsEl = mustEl<HTMLElement>('summary-kills');
  private readonly summaryFlipsEl = mustEl<HTMLElement>('summary-flips');
  private readonly summaryCoinDistEl = mustEl<HTMLSpanElement>('summary-coin-dist');
  private readonly summaryCoinKillsEl = mustEl<HTMLSpanElement>('summary-coin-kills');
  private readonly summaryCoinBonusEl = mustEl<HTMLSpanElement>('summary-coin-bonus');
  private readonly summaryCoinMultEl = mustEl<HTMLSpanElement>('summary-coin-mult');
  private readonly summaryCoinTotalEl = mustEl<HTMLElement>('summary-coin-total');
  private readonly summaryContinueBtn = mustEl<HTMLButtonElement>('btn-summary-continue');

  private resetArmed = false;
  private lastShownCoins = -1;
  private lastProgressPct = -1;
  private lastShownSquad = -1;
  private lastShownWeapon: WeaponTierId = 1;

  constructor(actions: HudActions) {
    this.actions = actions;

    // Pre-allocate 5 Enemy Wave DOM badges
    const waveContainer = mustEl<HTMLDivElement>('enemy-wave-badges');
    for (let i = 0; i < MAX_WAVE_BADGES; i++) {
      const b = document.createElement('div');
      b.className = 'enemy-wave-pill is-hidden';
      waveContainer.appendChild(b);
      this.waveBadgeEls.push(b);
    }

    // Pre-allocate up to 9 Boss HP segment dividers
    for (let i = 0; i < 9; i++) {
      const tick = document.createElement('span');
      tick.className = 'boss-hud__seg-tick';
      this.bossSegmentsEl.appendChild(tick);
      this.bossTicks.push(tick);
    }

    this.bindUiEvents();
  }

  private bindUiEvents(): void {
    mustEl<HTMLButtonElement>('btn-start-march').addEventListener('click', (e) => {
      e.stopPropagation();
      this.actions.onStartMarch();
    });

    for (const key of UPGRADE_ORDER) {
      mustEl<HTMLButtonElement>(`upgrade-card-${key}`).addEventListener('click', (e) => {
        e.stopPropagation();
        this.actions.onBuyUpgrade(key);
      });
    }

    this.btnModeCampaign.addEventListener('click', (e) => {
      e.stopPropagation();
      this.actions.onSelectMode('CAMPAIGN');
    });

    this.btnModeEndless.addEventListener('click', (e) => {
      e.stopPropagation();
      this.actions.onSelectMode('ENDLESS');
    });

    this.btnStagePrev.addEventListener('click', (e) => {
      e.stopPropagation();
      this.actions.onStepStage(-1);
    });

    this.btnStageNext.addEventListener('click', (e) => {
      e.stopPropagation();
      this.actions.onStepStage(1);
    });

    this.settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = this.settingsDrawer.classList.contains('is-hidden');
      this.settingsDrawer.classList.toggle('is-hidden', !willOpen);
      this.settingsBtn.setAttribute('aria-expanded', String(willOpen));
      this.resetArmed = false;
      this.resetPromptEl.textContent = 'Reset Save Data';
    });

    mustEl<HTMLButtonElement>('btn-close-settings').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeSettings();
    });

    mustEl<HTMLButtonElement>('btn-toggle-mute').addEventListener('click', (e) => {
      e.stopPropagation();
      this.actions.onToggleMute();
    });

    mustEl<HTMLButtonElement>('btn-toggle-haptics').addEventListener('click', (e) => {
      e.stopPropagation();
      this.actions.onToggleHaptics();
    });

    mustEl<HTMLButtonElement>('btn-export-save').addEventListener('click', (e) => {
      e.stopPropagation();
      this.actions.onExportSave();
      this.exportStatusEl.textContent = 'SAVED!';
      window.setTimeout(() => {
        this.exportStatusEl.textContent = 'DOWNLOAD';
      }, 1400);
    });

    mustEl<HTMLButtonElement>('btn-reset-save').addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.resetArmed) {
        this.resetArmed = true;
        this.resetPromptEl.textContent = 'Tap Again to Confirm';
        return;
      }
      this.resetArmed = false;
      this.resetPromptEl.textContent = 'Reset Save Data';
      this.actions.onResetSave();
      this.closeSettings();
    });

    this.summaryContinueBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.actions.onSummaryContinue();
    });
  }

  public closeSettings(): void {
    this.settingsDrawer.classList.add('is-hidden');
    this.settingsBtn.setAttribute('aria-expanded', 'false');
    this.resetArmed = false;
    this.resetPromptEl.textContent = 'Reset Save Data';
  }

  public setStagingVisible(visible: boolean): void {
    this.preRunOverlayEl.classList.toggle('is-hidden', !visible);
    if (!visible) {
      this.closeSettings();
    }
  }

  public hideSummaryModal(): void {
    this.summaryModalEl.classList.add('is-hidden');
  }

  public showSummaryModal(summary: RunSummary): void {
    this.summaryModalEl.classList.remove('is-hidden');
    const isVictory = summary.outcome === 'VICTORY';

    this.summaryKickerEl.textContent =
      summary.mode === 'ENDLESS'
        ? `ENDLESS BRIDGE · WAVE ${summary.stageNumber}`
        : `STAGE ${summary.stageNumber} REPORT`;

    this.summaryTitleEl.textContent = isVictory ? 'STAGE CLEARED!' : 'SQUAD WIPED OUT';
    this.summaryTitleEl.className = `summary-card__title ${
      isVictory ? 'summary-card__title--victory' : 'summary-card__title--defeat'
    }`;

    this.summaryDistEl.textContent = `${Math.round(summary.distanceMeters)}m`;
    this.summaryPeakEl.textContent = summary.peakSquad.toLocaleString();
    this.summaryKillsEl.textContent = summary.enemiesDefeated.toLocaleString();
    this.summaryFlipsEl.textContent = `${summary.gatesFlipped}`;

    this.summaryCoinDistEl.textContent = `+${summary.distanceCoins}`;
    this.summaryCoinKillsEl.textContent = `+${summary.killCoins}`;
    this.summaryCoinBonusEl.textContent = `+${summary.bonusCoins}`;
    this.summaryCoinMultEl.textContent = `×${summary.warChestMultiplier.toFixed(2)}`;
    this.summaryCoinTotalEl.textContent = `+${summary.totalCoinsEarned} COINS`;

    this.summaryContinueBtn.textContent = isVictory
      ? 'NEXT STAGE (SPACE)'
      : 'UPGRADE & RETRY (SPACE)';
  }

  public syncSaveState(save: SaveDataV1, stageTitle: string, endlessWave: number): void {
    this.updateCoins(save.coins);

    this.btnModeCampaign.classList.toggle('is-active', save.selectedMode === 'CAMPAIGN');
    this.btnModeEndless.classList.toggle('is-active', save.selectedMode === 'ENDLESS');
    this.stepperGroup.classList.toggle('is-hidden', save.selectedMode === 'ENDLESS');

    this.labelSelectedStage.textContent = `Stage ${save.selectedStage} / 10`;
    this.btnStagePrev.disabled = save.selectedStage <= 1;
    this.btnStageNext.disabled = save.selectedStage >= save.unlockedStage;

    this.stageLabelEl.textContent =
      save.selectedMode === 'ENDLESS'
        ? `ENDLESS WAVE ${endlessWave}`
        : `STAGE ${save.selectedStage} · ${stageTitle.toUpperCase()}`;

    this.muteLabelEl.textContent = save.settings.muted ? 'MUTED' : 'ON';
    this.hapticsLabelEl.textContent = save.settings.haptics ? 'ON' : 'OFF';
    this.bestSquadEl.textContent = `Peak Army: ${save.highScoreSquad.toLocaleString()}`;
    this.bestEndlessEl.textContent = `Endless Best: ${save.bestEndlessDistance}m`;

    for (const key of UPGRADE_ORDER) {
      const level = save.upgrades[key];
      const cost = computeUpgradeCost(key, level);
      const preview = formatUpgradeStatPreview(key, level);
      const cardEl = mustEl<HTMLButtonElement>(`upgrade-card-${key}`);
      const affordable = save.coins >= cost;

      cardEl.classList.toggle('is-affordable', affordable);
      cardEl.classList.toggle('is-locked', !affordable);
      mustEl<HTMLSpanElement>(`lvl-${key}`).textContent = `Lv. ${level}`;
      mustEl<HTMLDivElement>(`stat-${key}`).textContent = `${preview.currentLabel} → ${preview.nextLabel}`;
      mustEl<HTMLSpanElement>(`cost-${key}`).textContent = `${cost}`;
    }
  }

  public updateCoins(coins: number): void {
    if (coins !== this.lastShownCoins) {
      this.lastShownCoins = coins;
      this.coinCountEl.textContent = coins.toLocaleString();
    }
  }

  public updateTrackProgress(
    progressRatio: number,
    mode: GameMode,
    endlessMeters: number,
    endlessWave: number
  ): void {
    const pct = Math.max(0, Math.min(100, Math.round(progressRatio * 100)));
    if (pct !== this.lastProgressPct || mode === 'ENDLESS') {
      this.lastProgressPct = pct;
      this.progressFillEl.style.width = `${pct}%`;
      if (mode === 'ENDLESS') {
        this.distanceLabelEl.textContent = `${Math.round(endlessMeters)}m`;
        this.stageLabelEl.textContent = `ENDLESS WAVE ${endlessWave}`;
      } else {
        this.distanceLabelEl.textContent = `${pct}%`;
      }
    }
  }

  public updateWorldOverlays(
    sceneManager: SceneManager,
    squadX: number,
    squadZ: number,
    logicalSquad: number,
    weaponTier: WeaponTierId,
    waves: ReadonlyArray<EnemyWaveSlot>,
    showBossBar: boolean,
    bossName: string,
    bossHp: number,
    bossMaxHp: number,
    bossSegments: number
  ): void {
    // 1. Live Floating Squad Pill
    if (logicalSquad <= 0) {
      this.squadBadgeEl.classList.add('is-hidden');
    } else {
      this.squadBadgeEl.classList.remove('is-hidden');
      if (logicalSquad !== this.lastShownSquad) {
        this.lastShownSquad = logicalSquad;
        this.squadCountValEl.textContent =
          logicalSquad > 9999 ? `${logicalSquad.toLocaleString()}` : `${logicalSquad}`;
      }
      if (weaponTier !== this.lastShownWeapon) {
        this.lastShownWeapon = weaponTier;
        this.squadWeaponValEl.textContent = WEAPON_SPECS[weaponTier].shortBadge;
      }

      sceneManager.projectToScreen(squadX, 1.38, squadZ, _proj);
      if (_proj.visible) {
        this.squadBadgeEl.style.transform = `translate3d(${_proj.x.toFixed(1)}px, ${_proj.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
      }
    }

    // 2. Active Enemy Wave Health/Count Badges
    for (let i = 0; i < MAX_WAVE_BADGES; i++) {
      const badge = this.waveBadgeEls[i];
      const wave = waves[i];
      if (!wave || !wave.active || wave.aliveCount <= 0 || squadZ - wave.z > 88) {
        badge.classList.add('is-hidden');
        continue;
      }
      sceneManager.projectToScreen(wave.x, 1.25, wave.z, _proj);
      if (!_proj.visible) {
        badge.classList.add('is-hidden');
        continue;
      }
      badge.classList.remove('is-hidden');
      badge.textContent = `⚔ ${wave.aliveCount}`;
      badge.style.transform = `translate3d(${_proj.x.toFixed(1)}px, ${_proj.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    }

    // 3. Boss Segmented Overhead Health Bar
    this.bossHudEl.classList.toggle('is-hidden', !showBossBar);
    if (showBossBar) {
      this.bossNameEl.textContent = bossName.toUpperCase();
      const shownHp = Math.max(0, Math.ceil(bossHp));
      this.bossHpEl.textContent = `${shownHp} / ${bossMaxHp}`;
      const hpPct = Math.max(0, Math.min(100, (bossHp / Math.max(1, bossMaxHp)) * 100));
      this.bossFillEl.style.width = `${hpPct.toFixed(1)}%`;

      const segDividers = Math.max(0, Math.min(this.bossTicks.length, bossSegments - 1));
      for (let i = 0; i < this.bossTicks.length; i++) {
        this.bossTicks[i].style.display = i < segDividers ? 'block' : 'none';
      }
    }
  }
}
