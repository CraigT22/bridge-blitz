import type {
  ArmorySubTabId,
  BossChassisId,
  GameMode,
  GameState,
  MenuTabId,
  RunSummary,
  SaveDataV1,
  UpgradeKey,
  WeaponTierId,
} from '../core/types';
import { CAMPAIGN_STAGES } from '../core/StageData';
import type { EnemyWaveSlot } from '../entities/EnemyWave';
import {
  computeUpgradeCost,
  formatUpgradeStatPreview,
  getBulletPowerMultiplier,
  getFireRateMultiplier,
  getStartingSquadCount,
  UPGRADE_ORDER,
} from '../math/progressionMath';
import { WEAPON_SPECS } from '../math/weaponMath';
import type { SceneManager, ScreenProjection } from '../rendering/SceneManager';

export interface HudCallbacks {
  onStartMarch: () => void;
  onBuyUpgrade: (key: UpgradeKey) => void;
  onSelectMode: (mode: GameMode) => void;
  onStepStage: (delta: -1 | 1) => void;
  onSelectStageDirect: (stageNumber: number) => void;
  onHubStateChange: (info: {
    tab: MenuTabId;
    armorySubTab: ArmorySubTabId;
    armoryWeaponTier: WeaponTierId;
    armoryBossStage: number;
    hubPreviewWeaponTier: WeaponTierId;
  }) => void;
  onPauseRequest: () => void;
  onResumeRequest: () => void;
  onRestartRequest: () => void;
  onRetreatToHubRequest: () => void;
  onToggleMute: () => void;
  onToggleHaptics: () => void;
  onExportSave: () => void;
  onResetSave: () => void;
  onSummaryContinue: () => void;
}

const MAX_ENEMY_PILLS = 5;

const CHASSIS_LABELS: Readonly<Record<BossChassisId, string>> = {
  WARDEN_MECH: 'BIPEDAL VULCAN MECH',
  SIEGE_TANK: 'TRACKED SIEGE JUGGERNAUT',
  KRAKEN_WALKER: 'QUAD-LEG ARACHNID WALKER',
  SOVEREIGN_TITAN: 'CROWNED SOVEREIGN TITAN',
};

const PATTERN_LABELS: Readonly<Record<string, string>> = {
  SINGLE: 'PRECISION AUTOMATIC',
  BURST_2: '2-ROUND TACTICAL BURST',
  TWIN_SPREAD: '6-BARREL TWIN STREAM',
  PIERCING: 'MAGNETIC RAIL PIERCE (×2)',
};

const _projScratch: ScreenProjection = { x: 0, y: 0, visible: false };

function mustEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing required HUD element #${id}`);
  }
  return el as T;
}

export class HudController {
  private readonly callbacks: HudCallbacks;

  private readonly hubBrandPill = mustEl<HTMLElement>('hub-brand-pill');
  private readonly hubPowerRating = mustEl<HTMLElement>('hub-power-rating');
  private readonly runProgressCard = mustEl<HTMLElement>('run-progress-card');
  private readonly stageLabelEl = mustEl<HTMLElement>('stage-label-text');
  private readonly distanceEl = mustEl<HTMLElement>('distance-text');
  private readonly progressFillEl = mustEl<HTMLElement>('track-progress-fill');
  private readonly coinCountEl = mustEl<HTMLElement>('coin-count');
  private readonly btnSettings = mustEl<HTMLButtonElement>('btn-settings');
  private readonly btnPause = mustEl<HTMLButtonElement>('btn-pause');

  private readonly squadPillEl = mustEl<HTMLElement>('squad-pill');
  private readonly squadCountEl = mustEl<HTMLElement>('squad-count-text');
  private readonly squadWeaponEl = mustEl<HTMLElement>('squad-weapon-badge');
  private readonly enemyPills: HTMLDivElement[] = [];

  private readonly bossHudEl = mustEl<HTMLElement>('boss-hud');
  private readonly bossNameEl = mustEl<HTMLElement>('boss-name-text');
  private readonly bossHpEl = mustEl<HTMLElement>('boss-hp-text');
  private readonly bossFillEl = mustEl<HTMLElement>('boss-hp-fill');
  private readonly bossSegmentsEl = mustEl<HTMLElement>('boss-hp-segments');

  private readonly stagingOverlayEl = mustEl<HTMLElement>('pre-run-overlay');
  private readonly tabPanels: Record<MenuTabId, HTMLElement>;
  private readonly navButtons: Record<MenuTabId, HTMLButtonElement>;
  private readonly navUpgDot = mustEl<HTMLElement>('nav-upg-dot');

  private readonly btnCampaign = mustEl<HTMLButtonElement>('btn-mode-campaign');
  private readonly btnEndless = mustEl<HTMLButtonElement>('btn-mode-endless');
  private readonly stageStepperEl = mustEl<HTMLElement>('stage-stepper');
  private readonly btnStagePrev = mustEl<HTMLButtonElement>('btn-stage-prev');
  private readonly btnStageNext = mustEl<HTMLButtonElement>('btn-stage-next');
  private readonly stepperLabelEl = mustEl<HTMLElement>('stepper-stage-label');
  private readonly hubSectorTitleEl = mustEl<HTMLElement>('hub-sector-title');
  private readonly hubBossPreviewEl = mustEl<HTMLElement>('hub-boss-preview');
  private readonly dioramaSquadBadgeEl = mustEl<HTMLElement>('diorama-squad-badge');
  private readonly dioramaGunBadgeEl = mustEl<HTMLElement>('diorama-gun-badge');
  private readonly btnStartMarch = mustEl<HTMLButtonElement>('start-march-btn');

  private readonly upgradesPowerPill = mustEl<HTMLElement>('upgrades-power-pill');

  // Armory Tab Elements
  private readonly btnArmoryWeapons = mustEl<HTMLButtonElement>('btn-armory-weapons');
  private readonly btnArmoryBosses = mustEl<HTMLButtonElement>('btn-armory-bosses');
  private readonly armorySelectorStrip = mustEl<HTMLElement>('armory-selector-strip');
  private readonly armoryItemKicker = mustEl<HTMLElement>('armory-item-kicker');
  private readonly armoryItemName = mustEl<HTMLElement>('armory-item-name');
  private readonly btnArmoryPreviewEquip = mustEl<HTMLButtonElement>('btn-armory-preview-equip');
  private readonly armoryStatBars = mustEl<HTMLElement>('armory-stat-bars');
  private readonly armoryItemNote = mustEl<HTMLElement>('armory-item-note');

  // Map Tab Elements
  private readonly mapProgressBadge = mustEl<HTMLElement>('map-progress-badge');
  private readonly sectorMapList = mustEl<HTMLElement>('sector-map-list');

  // Settings & Pause Modals
  private readonly settingsDrawerEl = mustEl<HTMLElement>('settings-drawer');
  private readonly badgeMuteEl = mustEl<HTMLElement>('badge-mute');
  private readonly badgeHapticsEl = mustEl<HTMLElement>('badge-haptics');
  private readonly recordSquadEl = mustEl<HTMLElement>('record-squad');
  private readonly recordEndlessEl = mustEl<HTMLElement>('record-endless');

  private readonly pauseModalEl = mustEl<HTMLElement>('pause-modal');
  private readonly pauseSquadEl = mustEl<HTMLElement>('pause-squad');
  private readonly pauseWeaponEl = mustEl<HTMLElement>('pause-weapon');
  private readonly pauseProgressEl = mustEl<HTMLElement>('pause-progress');
  private readonly pauseKillsEl = mustEl<HTMLElement>('pause-kills');
  private readonly badgePauseMuteEl = mustEl<HTMLElement>('badge-pause-mute');
  private readonly badgePauseHapticsEl = mustEl<HTMLElement>('badge-pause-haptics');

  // Summary Modal
  private readonly summaryModalEl = mustEl<HTMLElement>('run-summary-modal');
  private readonly summaryKickerEl = mustEl<HTMLElement>('summary-kicker');
  private readonly summaryTitleEl = mustEl<HTMLElement>('summary-title');
  private readonly summaryStarsEl = mustEl<HTMLElement>('summary-stars');
  private readonly sumDistanceEl = mustEl<HTMLElement>('sum-distance');
  private readonly sumEnemiesEl = mustEl<HTMLElement>('sum-enemies');
  private readonly sumGatesEl = mustEl<HTMLElement>('sum-gates');
  private readonly sumPeakSquadEl = mustEl<HTMLElement>('sum-peak-squad');
  private readonly sumDistCoinsEl = mustEl<HTMLElement>('sum-dist-coins');
  private readonly sumKillCoinsEl = mustEl<HTMLElement>('sum-kill-coins');
  private readonly sumBonusCoinsEl = mustEl<HTMLElement>('sum-bonus-coins');
  private readonly sumMultEl = mustEl<HTMLElement>('sum-mult');
  private readonly sumTotalCoinsEl = mustEl<HTMLElement>('sum-total-coins');
  private readonly btnSummaryContinue = mustEl<HTMLButtonElement>('btn-summary-continue');

  private activeTab: MenuTabId = 'BATTLE';
  private armorySubTab: ArmorySubTabId = 'WEAPONS';
  private selectedArmoryWeapon: WeaponTierId = 1;
  private selectedArmoryBossStage = 1;
  private hubPreviewWeaponTier: WeaponTierId = 1;
  private latestSaveSnapshot: SaveDataV1 | null = null;

  private lastSquadCount = -1;
  private lastWeaponTier = -1;
  private lastBossSegments = -1;
  private coinRollupRaf = 0;

  constructor(callbacks: HudCallbacks) {
    this.callbacks = callbacks;

    this.tabPanels = {
      BATTLE: mustEl<HTMLElement>('tab-panel-battle'),
      UPGRADES: mustEl<HTMLElement>('tab-panel-upgrades'),
      ARMORY: mustEl<HTMLElement>('tab-panel-armory'),
      MAP: mustEl<HTMLElement>('tab-panel-map'),
    };

    const navBtns = {} as Record<MenuTabId, HTMLButtonElement>;
    for (const tab of ['BATTLE', 'UPGRADES', 'ARMORY', 'MAP'] as const) {
      const btn = document.querySelector<HTMLButtonElement>(`[data-hub-tab="${tab}"]`);
      if (!btn) {
        throw new Error(`Missing nav button for ${tab}`);
      }
      navBtns[tab] = btn;
    }
    this.navButtons = navBtns;

    // Pre-build 10-pip segments inside each War Room card
    for (const key of UPGRADE_ORDER) {
      const pipContainer = document.querySelector<HTMLElement>(`[data-pips="${key}"]`);
      if (pipContainer) {
        pipContainer.innerHTML = '';
        for (let p = 0; p < 10; p++) {
          const seg = document.createElement('span');
          seg.className = 'pip-bar__seg';
          pipContainer.appendChild(seg);
        }
      }
    }

    const overlayLayer = mustEl<HTMLElement>('world-overlay-layer');
    for (let i = 0; i < MAX_ENEMY_PILLS; i++) {
      const pill = document.createElement('div');
      pill.className = 'enemy-wave-pill is-hidden';
      pill.textContent = '10';
      overlayLayer.appendChild(pill);
      this.enemyPills.push(pill);
    }

    this.bindEvents();
    this.renderArmoryPanel();
  }

  public get currentTab(): MenuTabId {
    return this.activeTab;
  }

  public get previewWeaponTier(): WeaponTierId {
    return this.hubPreviewWeaponTier;
  }

  private bindEvents(): void {
    this.btnStartMarch.addEventListener('click', () => this.callbacks.onStartMarch());

    // Both quick-upgrade cards (Battle tab) and full War Room buy buttons (Upgrades tab)
    const upgradeButtons = document.querySelectorAll<HTMLButtonElement>('[data-upgrade]');
    upgradeButtons.forEach((btn) => {
      const key = btn.dataset.upgrade as UpgradeKey;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.callbacks.onBuyUpgrade(key);
      });
    });

    // Bottom Navigation Tabs
    for (const tab of ['BATTLE', 'UPGRADES', 'ARMORY', 'MAP'] as const) {
      this.navButtons[tab].addEventListener('click', () => {
        this.switchHubTab(tab);
      });
    }

    this.btnCampaign.addEventListener('click', () => this.callbacks.onSelectMode('CAMPAIGN'));
    this.btnEndless.addEventListener('click', () => this.callbacks.onSelectMode('ENDLESS'));
    this.btnStagePrev.addEventListener('click', () => this.callbacks.onStepStage(-1));
    this.btnStageNext.addEventListener('click', () => this.callbacks.onStepStage(1));

    // Armory Sub-Tabs & Preview Button
    this.btnArmoryWeapons.addEventListener('click', () => {
      this.armorySubTab = 'WEAPONS';
      this.renderArmoryPanel();
      this.emitHubState();
    });
    this.btnArmoryBosses.addEventListener('click', () => {
      this.armorySubTab = 'BOSSES';
      this.renderArmoryPanel();
      this.emitHubState();
    });
    this.btnArmoryPreviewEquip.addEventListener('click', () => {
      if (this.armorySubTab !== 'WEAPONS') {
        return;
      }
      this.hubPreviewWeaponTier = this.selectedArmoryWeapon;
      this.renderArmoryPanel();
      if (this.latestSaveSnapshot) {
        this.syncDioramaBadges(this.latestSaveSnapshot);
      }
      this.emitHubState();
    });

    // Settings & Pause Controls
    this.btnSettings.addEventListener('click', () => {
      this.settingsDrawerEl.classList.toggle('is-hidden');
    });
    mustEl<HTMLButtonElement>('btn-close-settings').addEventListener('click', () => {
      this.settingsDrawerEl.classList.add('is-hidden');
    });

    this.btnPause.addEventListener('click', () => {
      this.callbacks.onPauseRequest();
    });
    mustEl<HTMLButtonElement>('btn-pause-resume').addEventListener('click', () => {
      this.callbacks.onResumeRequest();
    });
    mustEl<HTMLButtonElement>('btn-pause-restart').addEventListener('click', () => {
      this.callbacks.onRestartRequest();
    });
    mustEl<HTMLButtonElement>('btn-pause-retreat').addEventListener('click', () => {
      this.callbacks.onRetreatToHubRequest();
    });

    mustEl<HTMLButtonElement>('btn-toggle-mute').addEventListener('click', () => {
      this.callbacks.onToggleMute();
    });
    mustEl<HTMLButtonElement>('btn-pause-mute').addEventListener('click', () => {
      this.callbacks.onToggleMute();
    });
    mustEl<HTMLButtonElement>('btn-toggle-haptics').addEventListener('click', () => {
      this.callbacks.onToggleHaptics();
    });
    mustEl<HTMLButtonElement>('btn-pause-haptics').addEventListener('click', () => {
      this.callbacks.onToggleHaptics();
    });

    mustEl<HTMLButtonElement>('btn-export-save').addEventListener('click', () => {
      this.callbacks.onExportSave();
    });
    mustEl<HTMLButtonElement>('btn-reset-save').addEventListener('click', () => {
      this.callbacks.onResetSave();
      this.settingsDrawerEl.classList.add('is-hidden');
    });

    this.btnSummaryContinue.addEventListener('click', () => {
      this.callbacks.onSummaryContinue();
    });
  }

  public switchHubTab(tab: MenuTabId): void {
    this.activeTab = tab;
    this.settingsDrawerEl.classList.add('is-hidden');

    for (const key of ['BATTLE', 'UPGRADES', 'ARMORY', 'MAP'] as const) {
      this.tabPanels[key].classList.toggle('is-hidden', key !== tab);
      this.navButtons[key].classList.toggle('is-active', key === tab);
    }

    if (tab === 'ARMORY') {
      this.renderArmoryPanel();
    } else if (tab === 'MAP' && this.latestSaveSnapshot) {
      this.renderSectorMap(this.latestSaveSnapshot);
    }

    this.emitHubState();
  }

  private emitHubState(): void {
    this.callbacks.onHubStateChange({
      tab: this.activeTab,
      armorySubTab: this.armorySubTab,
      armoryWeaponTier: this.selectedArmoryWeapon,
      armoryBossStage: this.selectedArmoryBossStage,
      hubPreviewWeaponTier: this.hubPreviewWeaponTier,
    });
  }

  public syncTopHudForState(state: GameState): void {
    const inHub = state === 'PRE_RUN';
    const inMission = state === 'RUNNING' || state === 'BOSS_FIGHT' || state === 'PAUSED';

    this.hubBrandPill.classList.toggle('is-hidden', !inHub);
    this.runProgressCard.classList.toggle('is-hidden', inHub);
    this.btnSettings.classList.toggle('is-hidden', !inHub);
    this.btnPause.classList.toggle('is-hidden', !inMission);

    if (!inHub) {
      this.settingsDrawerEl.classList.add('is-hidden');
    }
  }

  public setStagingVisible(visible: boolean): void {
    this.stagingOverlayEl.classList.toggle('is-hidden', !visible);
    if (visible) {
      this.switchHubTab('BATTLE');
    } else {
      this.settingsDrawerEl.classList.add('is-hidden');
    }
  }

  public showPauseModal(
    squadCount: number,
    weaponTier: WeaponTierId,
    progressRatio: number,
    enemiesDefeated: number
  ): void {
    this.pauseSquadEl.textContent = `${squadCount}`;
    this.pauseWeaponEl.textContent = WEAPON_SPECS[weaponTier].shortBadge;
    this.pauseProgressEl.textContent = `${Math.round(progressRatio * 100)}%`;
    this.pauseKillsEl.textContent = `${enemiesDefeated}`;
    this.pauseModalEl.classList.remove('is-hidden');
  }

  public hidePauseModal(): void {
    this.pauseModalEl.classList.add('is-hidden');
  }

  public syncSaveState(
    save: SaveDataV1,
    stageTitle: string,
    bossName: string,
    endlessWave: number
  ): void {
    this.latestSaveSnapshot = save;
    this.coinCountEl.textContent = `${save.coins}`;

    const isCampaign = save.selectedMode === 'CAMPAIGN';
    this.btnCampaign.classList.toggle('is-active', isCampaign);
    this.btnEndless.classList.toggle('is-active', !isCampaign);
    this.stageStepperEl.classList.toggle('is-hidden', !isCampaign);

    this.stepperLabelEl.textContent = `SECTOR ${String(save.selectedStage).padStart(2, '0')}/10`;
    this.btnStagePrev.disabled = save.selectedStage <= 1;
    this.btnStageNext.disabled = save.selectedStage >= save.unlockedStage;

    this.hubSectorTitleEl.textContent = stageTitle.toUpperCase();
    this.hubBossPreviewEl.textContent = bossName.toUpperCase();

    if (isCampaign) {
      this.stageLabelEl.textContent = `SECTOR ${save.selectedStage} — ${stageTitle.toUpperCase()}`;
    } else {
      this.stageLabelEl.textContent = `ENDLESS — WAVE ${endlessWave}`;
    }

    // Combat Power Score
    const startTroops = getStartingSquadCount(save.upgrades.startingSquad);
    const dpsMult =
      getFireRateMultiplier(save.upgrades.fireRate) *
      getBulletPowerMultiplier(save.upgrades.bulletPower);
    const combatPower = Math.round(100 * dpsMult + (startTroops - 1) * 28);
    this.hubPowerRating.textContent = `SQUAD PWR ${combatPower}`;
    this.upgradesPowerPill.textContent = `COMBAT PWR ${combatPower}`;

    this.syncDioramaBadges(save);

    const muteLabel = save.settings.muted ? 'OFF' : 'ON';
    const hapticsLabel = save.settings.haptics ? 'ON' : 'OFF';
    this.badgeMuteEl.textContent = muteLabel;
    this.badgePauseMuteEl.textContent = muteLabel;
    this.badgeHapticsEl.textContent = hapticsLabel;
    this.badgePauseHapticsEl.textContent = hapticsLabel;

    this.recordSquadEl.textContent = `${save.highScoreSquad}`;
    this.recordEndlessEl.textContent = `${Math.round(save.bestEndlessDistance)}m`;

    let anyAffordable = false;

    for (const key of UPGRADE_ORDER) {
      const lvl = save.upgrades[key];
      const cost = computeUpgradeCost(key, lvl);
      const preview = formatUpgradeStatPreview(key, lvl);
      const affordable = save.coins >= cost;
      if (affordable) {
        anyAffordable = true;
      }

      // 1. Sync Battle Tab Quick-Upgrade Card
      const quickCard = document.querySelector<HTMLButtonElement>(
        `.quick-upg-card[data-upgrade="${key}"]`
      );
      if (quickCard) {
        quickCard.classList.toggle('is-affordable', affordable);
        quickCard.classList.toggle('is-locked', !affordable);
      }
      const qLvl = document.querySelector<HTMLElement>(`[data-lvl="${key}"]`);
      if (qLvl) qLvl.textContent = `Lv${lvl}`;
      const qCost = document.querySelector<HTMLElement>(`[data-cost="${key}"]`);
      if (qCost) qCost.textContent = `${cost}`;
      const qStat = document.querySelector<HTMLElement>(`[data-stat="${key}"]`);
      if (qStat) {
        qStat.textContent =
          key === 'startingSquad'
            ? `${preview.currentLabel} → ${preview.nextLabel}`
            : `${preview.currentLabel} → ${preview.nextLabel}`;
      }

      // 2. Sync War Room Full Card + 10-Pip Bar
      const warCard = document.querySelector<HTMLElement>(`[data-war-card="${key}"]`);
      if (warCard) {
        warCard.classList.toggle('is-affordable', affordable);
      }
      const fLvl = document.querySelector<HTMLElement>(`[data-full-lvl="${key}"]`);
      if (fLvl) fLvl.textContent = `LVL ${lvl}`;
      const fCost = document.querySelector<HTMLElement>(`[data-full-cost="${key}"]`);
      if (fCost) fCost.textContent = `${cost}`;
      const fDelta = document.querySelector<HTMLElement>(`[data-full-delta="${key}"]`);
      if (fDelta) {
        const suffix =
          key === 'fireRate'
            ? 'Volley Speed'
            : key === 'bulletPower'
              ? 'Bullet Damage'
              : key === 'startingSquad'
                ? 'Commandos'
                : 'Coin Bounty';
        fDelta.textContent = `${preview.currentLabel} → ${preview.nextLabel} ${suffix}`;
      }

      const pipBar = document.querySelector<HTMLElement>(`[data-pips="${key}"]`);
      if (pipBar) {
        const filled = lvl > 0 && lvl % 10 === 0 ? 10 : lvl % 10;
        const isPrestige = lvl >= 10;
        const segs = pipBar.children;
        for (let s = 0; s < segs.length; s++) {
          segs[s].classList.toggle('is-filled', s < filled);
          segs[s].classList.toggle('is-prestige', isPrestige && s < filled);
        }
      }
    }

    this.navUpgDot.classList.toggle('is-hidden', !anyAffordable);
    this.mapProgressBadge.textContent = `UNLOCKED ${save.unlockedStage} / 10`;

    if (this.activeTab === 'MAP') {
      this.renderSectorMap(save);
    }
  }

  private syncDioramaBadges(save: SaveDataV1): void {
    const troops = getStartingSquadCount(save.upgrades.startingSquad);
    this.dioramaSquadBadgeEl.textContent = `${troops} ${troops === 1 ? 'COMMANDO' : 'COMMANDOS'} READY`;
    const gunSpec = WEAPON_SPECS[this.hubPreviewWeaponTier];
    this.dioramaGunBadgeEl.textContent =
      this.hubPreviewWeaponTier === 1
        ? `ARMED: ${gunSpec.shortBadge}`
        : `PREVIEW: ${gunSpec.shortBadge}`;
  }

  private renderArmoryPanel(): void {
    const isWeapons = this.armorySubTab === 'WEAPONS';
    this.btnArmoryWeapons.classList.toggle('is-active', isWeapons);
    this.btnArmoryBosses.classList.toggle('is-active', !isWeapons);
    this.btnArmoryPreviewEquip.classList.toggle('is-hidden', !isWeapons);

    this.armorySelectorStrip.innerHTML = '';

    if (isWeapons) {
      for (const tier of [1, 2, 3, 4, 5] as const) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `armory-chip${tier === this.selectedArmoryWeapon ? ' is-active' : ''}`;
        chip.textContent = WEAPON_SPECS[tier].shortBadge;
        chip.addEventListener('click', () => {
          this.selectedArmoryWeapon = tier;
          this.renderArmoryPanel();
          this.emitHubState();
        });
        this.armorySelectorStrip.appendChild(chip);
      }

      const spec = WEAPON_SPECS[this.selectedArmoryWeapon];
      this.armoryItemKicker.textContent = `TIER ${spec.tier} // ${PATTERN_LABELS[spec.pattern]}`;
      this.armoryItemName.textContent = spec.name.toUpperCase();

      const isHeld = this.hubPreviewWeaponTier === spec.tier;
      this.btnArmoryPreviewEquip.classList.toggle('is-equipped', isHeld);
      this.btnArmoryPreviewEquip.textContent = isHeld ? 'HELD IN HUB ✓' : 'HOLD IN HUB';

      const ratePct = Math.min(100, Math.round((spec.fireRate / 8.5) * 100));
      const dmgPct = Math.min(100, Math.round((spec.damageMultiplier / 2.75) * 100));
      const velPct = Math.min(100, Math.round((spec.projectileSpeed / 58) * 100));
      const armorPct = spec.bossArmorFactor > 1 ? 100 : 65;

      this.armoryStatBars.innerHTML = `
        <div class="stat-meter">
          <div class="stat-meter__top"><span>FIRE RATE</span><strong>${spec.fireRate.toFixed(1)}/s</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${ratePct}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>DAMAGE MULT</span><strong>×${spec.damageMultiplier.toFixed(2)}</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${dmgPct}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>MUZZLE VEL</span><strong>${spec.projectileSpeed}m/s</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${velPct}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>BOSS ARMOR</span><strong>${Math.round(spec.bossArmorFactor * 100)}%</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${armorPct}%"></div></div>
        </div>
      `;
      this.armoryItemNote.textContent =
        spec.tier === 1
          ? 'Standard issue sidearm equipped at deployment. Break bridge tire barricades to upgrade live!'
          : 'Weapon Lock Rule: Breaking lower/equal tire barricades keeps this gun and awards +50 Coins & +3 Squad.';
    } else {
      for (const stage of CAMPAIGN_STAGES) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `armory-chip${stage.stageNumber === this.selectedArmoryBossStage ? ' is-active' : ''}`;
        chip.textContent = `S${String(stage.stageNumber).padStart(2, '0')}`;
        chip.addEventListener('click', () => {
          this.selectedArmoryBossStage = stage.stageNumber;
          this.renderArmoryPanel();
          this.emitHubState();
        });
        this.armorySelectorStrip.appendChild(chip);
      }

      const st = CAMPAIGN_STAGES[this.selectedArmoryBossStage - 1];
      const boss = st.boss;
      this.armoryItemKicker.textContent = `SECTOR ${st.stageNumber} // ${CHASSIS_LABELS[boss.chassis]}`;
      this.armoryItemName.textContent = boss.name.toUpperCase();

      const hpPct = Math.min(100, Math.max(12, Math.round((boss.maxHp / 5600) * 100)));
      const segPct = Math.round((boss.segments / 10) * 100);
      const spdPct = Math.round((boss.advanceSpeed / 2.3) * 100);
      const rewPct = Math.round((boss.rewardCoins / 350) * 100);

      this.armoryStatBars.innerHTML = `
        <div class="stat-meter">
          <div class="stat-meter__top"><span>ARMOR HP</span><strong>${boss.maxHp}</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${hpPct}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>ARMOR PLATES</span><strong>${boss.segments} Segs</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${segPct}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>MARCH SPEED</span><strong>${boss.advanceSpeed.toFixed(2)}m/s</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${spdPct}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>CLEAR BOUNTY</span><strong>+${boss.rewardCoins} Coins</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${rewPct}%"></div></div>
        </div>
      `;
      this.armoryItemNote.textContent = `Guarding ${st.title} (${st.trackLength}m span). Equip Lv5 Plasma Rifle for 135% armor-piercing damage!`;
    }
  }

  private renderSectorMap(save: SaveDataV1): void {
    this.sectorMapList.innerHTML = '';

    // Endless Mode Sector Card at Top
    const endlessBtn = document.createElement('button');
    endlessBtn.type = 'button';
    const endlessSelected = save.selectedMode === 'ENDLESS';
    endlessBtn.className = `sector-node${endlessSelected ? ' is-selected' : ''}`;
    endlessBtn.innerHTML = `
      <div class="sector-node__num">∞</div>
      <div class="sector-node__info">
        <span class="sector-node__title">ENDLESS BRIDGE GAUNTLET</span>
        <span class="sector-node__sub">Rotating War-Machine Bosses • Best: ${Math.round(save.bestEndlessDistance)}m</span>
      </div>
      <span class="sector-node__status">${endlessSelected ? 'ACTIVE' : 'DEPLOY'}</span>
    `;
    endlessBtn.addEventListener('click', () => {
      this.callbacks.onSelectMode('ENDLESS');
      this.switchHubTab('BATTLE');
    });
    this.sectorMapList.appendChild(endlessBtn);

    // 10 Campaign Bridge Sectors
    for (const st of CAMPAIGN_STAGES) {
      const unlocked = st.stageNumber <= save.unlockedStage;
      const cleared = st.stageNumber < save.unlockedStage;
      const isSelected =
        save.selectedMode === 'CAMPAIGN' && save.selectedStage === st.stageNumber;

      const row = document.createElement('button');
      row.type = 'button';
      row.disabled = !unlocked;
      row.className = [
        'sector-node',
        isSelected ? 'is-selected' : '',
        cleared && !isSelected ? 'is-cleared' : '',
        !unlocked ? 'is-locked' : '',
      ]
        .filter(Boolean)
        .join(' ');

      const statusText = !unlocked
        ? 'LOCKED'
        : isSelected
          ? 'ACTIVE'
          : cleared
            ? 'CLEARED ✓'
            : 'READY';

      row.innerHTML = `
        <div class="sector-node__num">${String(st.stageNumber).padStart(2, '0')}</div>
        <div class="sector-node__info">
          <span class="sector-node__title">${st.title.toUpperCase()}</span>
          <span class="sector-node__sub">${st.boss.name} (${CHASSIS_LABELS[st.boss.chassis]}) • +${st.boss.rewardCoins} Coins</span>
        </div>
        <span class="sector-node__status">${statusText}</span>
      `;

      if (unlocked) {
        row.addEventListener('click', () => {
          this.callbacks.onSelectStageDirect(st.stageNumber);
          this.switchHubTab('BATTLE');
        });
      }
      this.sectorMapList.appendChild(row);
    }
  }

  public updateCoins(coins: number): void {
    this.coinCountEl.textContent = `${coins}`;
  }

  public updateTrackProgress(
    progressRatio: number,
    mode: GameMode,
    distanceMeters: number,
    endlessWave: number
  ): void {
    const pct = Math.max(0, Math.min(100, progressRatio * 100));
    this.progressFillEl.style.width = `${pct.toFixed(1)}%`;
    this.distanceEl.textContent = `${Math.floor(distanceMeters)}m`;
    if (mode === 'ENDLESS') {
      this.stageLabelEl.textContent = `ENDLESS — WAVE ${endlessWave}`;
    }
  }

  public updateWorldOverlays(
    sceneManager: SceneManager,
    state: GameState,
    squadX: number,
    squadZ: number,
    logicalSquad: number,
    weaponTier: WeaponTierId,
    enemyWaves: ReadonlyArray<EnemyWaveSlot>,
    bossVisible: boolean,
    bossName: string,
    bossHp: number,
    bossMaxHp: number,
    bossSegments: number
  ): void {
    // Only project floating world squad pill during active combat (clean diorama in Hub)
    const showSquadPill =
      logicalSquad > 0 && (state === 'RUNNING' || state === 'BOSS_FIGHT');

    if (showSquadPill) {
      sceneManager.projectToScreen(squadX, 1.38, squadZ, _projScratch);
      if (_projScratch.visible) {
        this.squadPillEl.classList.remove('is-hidden');
        this.squadPillEl.style.transform = `translate3d(${_projScratch.x.toFixed(1)}px, ${_projScratch.y.toFixed(1)}px, 0) translate(-50%, -100%)`;

        if (logicalSquad !== this.lastSquadCount) {
          this.lastSquadCount = logicalSquad;
          this.squadCountEl.textContent = `${logicalSquad}`;
        }
        if (weaponTier !== this.lastWeaponTier) {
          this.lastWeaponTier = weaponTier;
          this.squadWeaponEl.textContent = WEAPON_SPECS[weaponTier].shortBadge;
        }
      } else {
        this.squadPillEl.classList.add('is-hidden');
      }
    } else {
      this.squadPillEl.classList.add('is-hidden');
    }

    // Enemy Wave Floating Counters
    const showWavePills = state === 'RUNNING' || state === 'BOSS_FIGHT';
    for (let i = 0; i < MAX_ENEMY_PILLS; i++) {
      const pill = this.enemyPills[i];
      const wave = enemyWaves[i];
      if (
        !showWavePills ||
        !wave ||
        !wave.active ||
        wave.aliveCount <= 0 ||
        squadZ - wave.z > 80 ||
        wave.z > squadZ + 6
      ) {
        pill.classList.add('is-hidden');
        continue;
      }

      sceneManager.projectToScreen(wave.x, 1.48, wave.z, _projScratch);
      if (_projScratch.visible) {
        pill.classList.remove('is-hidden');
        pill.textContent = `${wave.aliveCount}`;
        pill.style.transform = `translate3d(${_projScratch.x.toFixed(1)}px, ${_projScratch.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
      } else {
        pill.classList.add('is-hidden');
      }
    }

    // Boss Segmented Health Bar
    if (bossVisible && bossHp > 0) {
      this.bossHudEl.classList.remove('is-hidden');
      this.bossNameEl.textContent = bossName.toUpperCase();
      const hpCeil = Math.max(0, Math.ceil(bossHp));
      this.bossHpEl.textContent = `${hpCeil} / ${bossMaxHp}`;
      const hpPct = Math.max(0, Math.min(100, (bossHp / Math.max(1, bossMaxHp)) * 100));
      this.bossFillEl.style.width = `${hpPct.toFixed(1)}%`;

      if (bossSegments !== this.lastBossSegments) {
        this.lastBossSegments = bossSegments;
        this.bossSegmentsEl.innerHTML = '';
        for (let s = 1; s < bossSegments; s++) {
          const tick = document.createElement('div');
          tick.className = 'boss-hud__seg-tick';
          this.bossSegmentsEl.appendChild(tick);
        }
      }
    } else {
      this.bossHudEl.classList.add('is-hidden');
    }
  }

  public showSummaryModal(summary: RunSummary): void {
    const isVictory = summary.outcome === 'VICTORY';
    const modeLabel =
      summary.mode === 'ENDLESS'
        ? `ENDLESS WAVE ${summary.stageNumber}`
        : `SECTOR ${summary.stageNumber}`;

    this.summaryKickerEl.textContent = isVictory
      ? `${modeLabel} CLEARED`
      : `${modeLabel} — ${Math.round(summary.progressRatio * 100)}% PROGRESS`;

    this.summaryTitleEl.textContent = isVictory ? 'VICTORY!' : 'SQUAD WIPED OUT';
    this.summaryTitleEl.classList.toggle('summary-card__title--victory', isVictory);
    this.summaryTitleEl.classList.toggle('summary-card__title--defeat', !isVictory);

    if (isVictory) {
      this.summaryStarsEl.textContent = '★ ★ ★';
    } else if (summary.progressRatio >= 0.7) {
      this.summaryStarsEl.textContent = '★ ★ ☆';
    } else if (summary.progressRatio >= 0.35) {
      this.summaryStarsEl.textContent = '★ ☆ ☆';
    } else {
      this.summaryStarsEl.textContent = '☆ ☆ ☆';
    }

    this.sumDistanceEl.textContent = `${Math.round(summary.distanceMeters)}m`;
    this.sumEnemiesEl.textContent = `${summary.enemiesDefeated}`;
    this.sumGatesEl.textContent = `${summary.gatesFlipped}`;
    this.sumPeakSquadEl.textContent = `${summary.peakSquad}`;

    this.sumDistCoinsEl.textContent = `+${summary.distanceCoins}`;
    this.sumKillCoinsEl.textContent = `+${summary.killCoins}`;
    this.sumBonusCoinsEl.textContent = `+${summary.bonusCoins}`;
    this.sumMultEl.textContent = `×${summary.warChestMultiplier.toFixed(2)}`;

    this.btnSummaryContinue.textContent = isVictory
      ? 'CONTINUE TO NEXT SECTOR'
      : 'RETURN & UPGRADE SQUAD';

    // Animated Coin Rollup Counter
    if (this.coinRollupRaf) {
      cancelAnimationFrame(this.coinRollupRaf);
      this.coinRollupRaf = 0;
    }
    const targetCoins = summary.totalCoinsEarned;
    const startTs = performance.now();
    const durationMs = 520;
    this.sumTotalCoinsEl.textContent = `+${targetCoins} Coins`;

    if (targetCoins > 0) {
      const stepRollup = (now: number): void => {
        const t = Math.min(1, (now - startTs) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3);
        const shown = Math.round(targetCoins * eased);
        this.sumTotalCoinsEl.textContent = `+${shown} Coins`;
        if (t < 1) {
          this.coinRollupRaf = requestAnimationFrame(stepRollup);
        } else {
          this.sumTotalCoinsEl.textContent = `+${targetCoins} Coins`;
          this.coinRollupRaf = 0;
        }
      };
      this.coinRollupRaf = requestAnimationFrame(stepRollup);
    }

    this.summaryModalEl.classList.remove('is-hidden');
  }

  public hideSummaryModal(): void {
    if (this.coinRollupRaf) {
      cancelAnimationFrame(this.coinRollupRaf);
      this.coinRollupRaf = 0;
    }
    this.summaryModalEl.classList.add('is-hidden');
  }
}
