import type {
  ArmorySubTabId,
  BoardLayout,
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
import type { SplitCausewayController } from '../entities/SplitCausewayController';
import {
  computeUpgradeCost,
  formatCoinAmount,
  formatObstacleHp,
  formatUpgradeStatPreview,
  getStartingSquadCount,
  MAX_STARTING_SQUAD_LEVEL,
  UPGRADE_ORDER,
} from '../math/progressionMath';
import {
  OVERFLOW_SQUAD_COIN_BONUS,
  WEAPON_LOCK_BONUS_COINS,
  WEAPON_LOCK_BONUS_SQUAD,
  WEAPON_SPECS,
} from '../math/weaponMath';
import type { SceneManager, ScreenProjection } from '../rendering/SceneManager';

export interface HudCallbacks {
  onStartMarch: () => void;
  onBuyUpgrade: (key: UpgradeKey) => void;
  onSelectMode: (mode: GameMode) => void;
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

const MAX_HEAVY_HP_BARS = 28;

const CHASSIS_LABELS: Readonly<Record<BossChassisId, string>> = {
  WARDEN_MECH: 'BIPEDAL VULCAN MECH',
  SIEGE_TANK: 'TRACKED SIEGE JUGGERNAUT',
  KRAKEN_WALKER: 'QUAD-LEG ARACHNID WALKER',
  SOVEREIGN_TITAN: 'CROWNED SOVEREIGN TITAN',
};

const PATTERN_LABELS: Readonly<Record<string, string>> = {
  SINGLE: 'FOCUSED CONE AUTO',
  BURST_2: '2-ROUND FOCUSED BURST',
  TWIN_CONVERGE: '6-BARREL FOCUSED CONE',
  PIERCING: 'PLASMA PIERCE CONE (×2)',
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

  private readonly hubLeftToolsEl = mustEl<HTMLElement>('hub-left-tools');
  private readonly hubStageBannerEl = mustEl<HTMLElement>('hub-stage-banner');
  private readonly hubSectorKickerEl = mustEl<HTMLElement>('hub-sector-kicker');
  private readonly hubSectorTitleEl = mustEl<HTMLElement>('hub-sector-title');
  private readonly hubBossPreviewEl = mustEl<HTMLElement>('hub-boss-preview');

  private readonly runProgressCard = mustEl<HTMLElement>('run-progress-card');
  private readonly topWeaponPill = mustEl<HTMLElement>('top-weapon-pill');
  private readonly progressFillEl = mustEl<HTMLElement>('track-progress-fill');
  private readonly progressPctEl = mustEl<HTMLElement>('progress-pct-text');

  private readonly coinCountEl = mustEl<HTMLElement>('coin-count');
  private readonly liveCoinTickerEl = mustEl<HTMLElement>('live-coin-ticker');
  private readonly btnSettings = mustEl<HTMLButtonElement>('btn-settings');
  private readonly btnPause = mustEl<HTMLButtonElement>('btn-pause');

  private readonly squadPillEl = mustEl<HTMLElement>('squad-pill');
  private readonly squadWeaponEl = mustEl<HTMLElement>('squad-weapon-badge');
  private readonly heavyHpBars: HTMLDivElement[] = [];
  private readonly heavyHpFills: HTMLDivElement[] = [];

  private readonly bossHudEl = mustEl<HTMLElement>('boss-hud');
  private readonly bossNameEl = mustEl<HTMLElement>('boss-name-text');
  private readonly bossHpEl = mustEl<HTMLElement>('boss-hp-text');
  private readonly bossFillEl = mustEl<HTMLElement>('boss-hp-fill');
  private readonly bossSegmentsEl = mustEl<HTMLElement>('boss-hp-segments');

  private readonly stagingOverlayEl = mustEl<HTMLElement>('pre-run-overlay');
  private readonly tabPanels: Record<'BATTLE' | 'ARMORY' | 'MAP', HTMLElement>;
  private readonly btnStartMarch = mustEl<HTMLButtonElement>('start-march-btn');
  private readonly btnAddSoldier = mustEl<HTMLButtonElement>('btn-add-soldier');

  // Armory Overlay Elements
  private readonly btnArmoryWeapons = mustEl<HTMLButtonElement>('btn-armory-weapons');
  private readonly btnArmoryBosses = mustEl<HTMLButtonElement>('btn-armory-bosses');
  private readonly armorySelectorStrip = mustEl<HTMLElement>('armory-selector-strip');
  private readonly armoryItemKicker = mustEl<HTMLElement>('armory-item-kicker');
  private readonly armoryItemName = mustEl<HTMLElement>('armory-item-name');
  private readonly btnArmoryPreviewEquip = mustEl<HTMLButtonElement>('btn-armory-preview-equip');
  private readonly armoryStatBars = mustEl<HTMLElement>('armory-stat-bars');
  private readonly armoryItemNote = mustEl<HTMLElement>('armory-item-note');

  // Sector Map Elements
  private readonly mapProgressBadge = mustEl<HTMLElement>('map-progress-badge');
  private readonly sectorMapList = mustEl<HTMLElement>('sector-map-list');

  // Settings & Pause Modals
  private readonly settingsDrawerEl = mustEl<HTMLElement>('settings-drawer');
  private readonly badgeMuteEl = mustEl<HTMLElement>('badge-mute');
  private readonly badgeHapticsEl = mustEl<HTMLElement>('badge-haptics');
  private readonly recordSquadEl = mustEl<HTMLElement>('record-squad');
  private readonly recordSplitEl = mustEl<HTMLElement>('record-split');
  private readonly recordEndlessEl = mustEl<HTMLElement>('record-endless');

  private readonly pauseModalEl = mustEl<HTMLElement>('pause-modal');
  private readonly pauseSquadEl = mustEl<HTMLElement>('pause-squad');
  private readonly pauseWeaponEl = mustEl<HTMLElement>('pause-weapon');
  private readonly pauseProgressEl = mustEl<HTMLElement>('pause-progress');
  private readonly pauseKillsEl = mustEl<HTMLElement>('pause-kills');
  private readonly badgePauseMuteEl = mustEl<HTMLElement>('badge-pause-mute');
  private readonly badgePauseHapticsEl = mustEl<HTMLElement>('badge-pause-haptics');

  // Summary Payout Modal
  private readonly summaryModalEl = mustEl<HTMLElement>('run-summary-modal');
  private readonly summaryKickerEl = mustEl<HTMLElement>('summary-kicker');
  private readonly summaryTitleEl = mustEl<HTMLElement>('summary-title');
  private readonly sumDistanceEl = mustEl<HTMLElement>('sum-distance');
  private readonly sumDrumsEl = mustEl<HTMLElement>('sum-drums');
  private readonly sumEnemiesEl = mustEl<HTMLElement>('sum-enemies');
  private readonly sumLiveCoinsEl = mustEl<HTMLElement>('sum-live-coins');
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

  private lastWeaponTier = -1;
  private lastBossSegments = -1;
  private coinRollupRaf = 0;

  private liveTickerAccum = 0;

  constructor(callbacks: HudCallbacks) {
    this.callbacks = callbacks;

    this.tabPanels = {
      BATTLE: mustEl<HTMLElement>('tab-panel-battle'),
      ARMORY: mustEl<HTMLElement>('tab-panel-armory'),
      MAP: mustEl<HTMLElement>('tab-panel-map'),
    };

    // Pre-build 5-pip milestone bars inside the 3 bottom tactical upgrade cards
    for (const key of ['fireRate', 'bulletPower', 'warChest'] as const) {
      const pipContainer = document.querySelector<HTMLElement>(`[data-pips="${key}"]`);
      if (pipContainer) {
        pipContainer.innerHTML = '';
        for (let p = 0; p < 5; p++) {
          const seg = document.createElement('span');
          seg.className = 'mini-pips__seg';
          pipContainer.appendChild(seg);
        }
      }
    }

    // Pre-allocate pooled floating Damaged-Swarm mini HP bars
    const overlayLayer = mustEl<HTMLElement>('world-overlay-layer');
    for (let i = 0; i < MAX_HEAVY_HP_BARS; i++) {
      const bar = document.createElement('div');
      bar.className = 'heavy-hp-bar is-hidden';
      const fill = document.createElement('div');
      fill.className = 'heavy-hp-bar__fill';
      bar.appendChild(fill);
      overlayLayer.appendChild(bar);
      this.heavyHpBars.push(bar);
      this.heavyHpFills.push(fill);
    }

    this.bindEvents();
    this.renderArmoryPanel();
  }

  public get currentTab(): MenuTabId {
    return this.activeTab;
  }

  public get isSettingsOpen(): boolean {
    return !this.settingsDrawerEl.classList.contains('is-hidden');
  }

  public closeSettingsDrawer(): void {
    this.settingsDrawerEl.classList.add('is-hidden');
  }

  private bindEvents(): void {
    this.btnStartMarch.addEventListener('click', () => this.callbacks.onStartMarch());

    const upgradeButtons = document.querySelectorAll<HTMLButtonElement>('[data-upgrade]');
    upgradeButtons.forEach((btn) => {
      const key = btn.dataset.upgrade as UpgradeKey;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.callbacks.onBuyUpgrade(key);
      });
    });

    const tabTriggers = document.querySelectorAll<HTMLButtonElement>('[data-hub-tab]');
    tabTriggers.forEach((btn) => {
      const targetTab = btn.dataset.hubTab as MenuTabId;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextTab =
          targetTab !== 'BATTLE' && this.activeTab === targetTab ? 'BATTLE' : targetTab;
        this.switchHubTab(nextTab);
      });
    });

    const modeButtons = document.querySelectorAll<HTMLButtonElement>('[data-select-mode]');
    modeButtons.forEach((btn) => {
      const mode = btn.dataset.selectMode as GameMode;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.callbacks.onSelectMode(mode);
      });
    });

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
      this.emitHubState();
    });

    // Settings & Pause Controls
    this.btnSettings.addEventListener('click', (e) => {
      e.stopPropagation();
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
    const normalized = tab === 'UPGRADES' ? 'BATTLE' : tab;
    this.activeTab = normalized;
    this.settingsDrawerEl.classList.add('is-hidden');

    this.tabPanels.BATTLE.classList.toggle('is-hidden', normalized !== 'BATTLE');
    this.tabPanels.ARMORY.classList.toggle('is-hidden', normalized !== 'ARMORY');
    this.tabPanels.MAP.classList.toggle('is-hidden', normalized !== 'MAP');
    this.hubStageBannerEl.classList.toggle('is-hidden', normalized !== 'BATTLE');
    this.hubLeftToolsEl.classList.toggle('is-hidden', normalized !== 'BATTLE');

    if (normalized === 'ARMORY') {
      this.renderArmoryPanel();
    } else if (normalized === 'MAP' && this.latestSaveSnapshot) {
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

    this.hubLeftToolsEl.classList.toggle('is-hidden', !inHub || this.activeTab !== 'BATTLE');
    this.hubStageBannerEl.classList.toggle('is-hidden', !inHub || this.activeTab !== 'BATTLE');
    this.runProgressCard.classList.toggle('is-hidden', inHub);
    this.topWeaponPill.classList.toggle('is-hidden', inHub);
    this.btnPause.classList.toggle('is-hidden', !inMission);

    if (!inHub) {
      this.settingsDrawerEl.classList.add('is-hidden');
    } else {
      this.resetLiveCoinTicker();
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

  public flashLiveCoinGain(addedAmount: number, totalWalletCoins: number): void {
    this.coinCountEl.textContent = formatCoinAmount(totalWalletCoins);
    if (addedAmount <= 0) {
      return;
    }
    this.liveTickerAccum += addedAmount;
    this.liveCoinTickerEl.textContent = `+${formatCoinAmount(this.liveTickerAccum)}`;
    this.liveCoinTickerEl.classList.remove('is-hidden');
  }

  public flashUpgradePurchase(key: UpgradeKey): void {
    const el =
      key === 'startingSquad'
        ? this.btnAddSoldier
        : document.querySelector<HTMLElement>(`.tactical-upg-card[data-upgrade="${key}"]`);
    if (!el) {
      return;
    }
    el.classList.remove('is-just-bought');
    void el.offsetWidth;
    el.classList.add('is-just-bought');
  }

  private resetLiveCoinTicker(): void {
    this.liveTickerAccum = 0;
    this.liveCoinTickerEl.classList.add('is-hidden');
  }

  public syncSaveState(
    save: SaveDataV1,
    stageTitle: string,
    bossName: string,
    endlessWave: number,
    boardLayout: BoardLayout = 'STANDARD_BRIDGE'
  ): void {
    this.latestSaveSnapshot = save;
    this.coinCountEl.textContent = formatCoinAmount(save.coins);

    const modePills = document.querySelectorAll<HTMLButtonElement>('[data-select-mode]');
    modePills.forEach((pill) => {
      pill.classList.toggle('is-active', pill.dataset.selectMode === save.selectedMode);
    });

    if (save.selectedMode === 'SPLIT_CAUSEWAY') {
      this.hubSectorKickerEl.textContent = `SPLIT CAUSEWAY • STAGE ${save.splitCausewayStage}`;
    } else if (save.selectedMode === 'ENDLESS') {
      this.hubSectorKickerEl.textContent =
        boardLayout === 'SPLIT_CAUSEWAY'
          ? `ENDLESS WAVE ${endlessWave} • SPLIT CAUSEWAY`
          : `ENDLESS WAVE ${endlessWave}`;
    } else {
      this.hubSectorKickerEl.textContent =
        boardLayout === 'SPLIT_CAUSEWAY'
          ? `SECTOR ${save.selectedStage} • SPLIT CAUSEWAY`
          : `SECTOR ${save.selectedStage}`;
    }
    this.hubSectorTitleEl.textContent = stageTitle.toUpperCase();
    this.hubBossPreviewEl.textContent = `BOSS: ${bossName.toUpperCase()}`;

    const launchTextEl = this.btnStartMarch.querySelector<HTMLElement>('.drag-launch-pill__text');
    if (launchTextEl) {
      launchTextEl.textContent =
        boardLayout === 'SPLIT_CAUSEWAY' ? 'DRAG TO DEFEND CAUSEWAY' : 'DRAG BRIDGE TO MARCH';
    }

    const muteLabel = save.settings.muted ? 'OFF' : 'ON';
    const hapticsLabel = save.settings.haptics ? 'ON' : 'OFF';
    this.badgeMuteEl.textContent = muteLabel;
    this.badgePauseMuteEl.textContent = muteLabel;
    this.badgeHapticsEl.textContent = hapticsLabel;
    this.badgePauseHapticsEl.textContent = hapticsLabel;

    this.recordSquadEl.textContent = `${save.highScoreSquad}`;
    this.recordSplitEl.textContent = `S${save.bestSplitStage}`;
    this.recordEndlessEl.textContent = `${Math.round(save.bestEndlessDistance)}m`;

    for (const key of UPGRADE_ORDER) {
      const lvl = save.upgrades[key];
      const cost = computeUpgradeCost(key, lvl);
      const preview = formatUpgradeStatPreview(key, lvl);

      if (key === 'startingSquad') {
        const maxed = lvl >= MAX_STARTING_SQUAD_LEVEL;
        const affordable = !maxed && save.coins >= cost;
        this.btnAddSoldier.classList.toggle('is-affordable', affordable);
        this.btnAddSoldier.disabled = maxed;
        const countNow = getStartingSquadCount(lvl);
        const sLvl = document.querySelector<HTMLElement>('[data-lvl="startingSquad"]');
        if (sLvl) sLvl.textContent = `${countNow}/${1 + MAX_STARTING_SQUAD_LEVEL}`;
        const sCost = document.querySelector<HTMLElement>('[data-cost="startingSquad"]');
        if (sCost) sCost.textContent = maxed ? 'MAX' : formatCoinAmount(cost);
        continue;
      }

      const affordable = save.coins >= cost;
      const card = document.querySelector<HTMLButtonElement>(
        `.tactical-upg-card[data-upgrade="${key}"]`
      );
      if (card) {
        card.classList.toggle('is-affordable', affordable);
      }

      const qLvl = document.querySelector<HTMLElement>(`[data-lvl="${key}"]`);
      if (qLvl) qLvl.textContent = `${lvl + 1}`;
      const qCost = document.querySelector<HTMLElement>(`[data-cost="${key}"]`);
      if (qCost) qCost.textContent = formatCoinAmount(cost);
      const qStat = document.querySelector<HTMLElement>(`[data-stat="${key}"]`);
      if (qStat) {
        qStat.textContent = `${preview.currentLabel} → ${preview.nextLabel}`;
      }

      const pipBar = document.querySelector<HTMLElement>(`[data-pips="${key}"]`);
      if (pipBar) {
        const filled = lvl > 0 && lvl % 5 === 0 ? 5 : lvl % 5;
        const isPrestige = lvl >= 5;
        const segs = pipBar.children;
        for (let s = 0; s < segs.length; s++) {
          segs[s].classList.toggle('is-filled', s < filled);
          segs[s].classList.toggle('is-prestige', isPrestige && s < filled);
        }
      }
    }

    this.mapProgressBadge.textContent = `${save.unlockedStage} / 10`;

    if (this.activeTab === 'MAP') {
      this.renderSectorMap(save);
    }
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
      this.btnArmoryPreviewEquip.textContent = isHeld ? 'HELD ON BRIDGE ✓' : 'HOLD ON BRIDGE';

      const shotsPerVolley =
        spec.pattern === 'BURST_2' || spec.pattern === 'TWIN_CONVERGE' ? 2 : 1;
      const effRate = spec.fireRate * shotsPerVolley;
      const ratePct = Math.min(100, Math.round((effRate / 15.2) * 100));
      const dmgPct = Math.min(100, Math.round((spec.damageMultiplier / 3.25) * 100));
      const velPct = Math.min(100, Math.round((spec.projectileSpeed / 44) * 100));
      const armorPct = Math.min(100, Math.round((spec.bossArmorFactor / 1.35) * 100));

      this.armoryStatBars.innerHTML = `
        <div class="stat-meter">
          <div class="stat-meter__top"><span>FIRE RATE</span><strong>${effRate.toFixed(1)}/s</strong></div>
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
          ? 'Standard sidearm equipped at launch. Shatter Supply Drums & Tire Walls on the bridge to upgrade live!'
          : `Weapon Lock Rule: Breaking lower/equal weapon drops keeps this gun and awards +${WEAPON_LOCK_BONUS_COINS} Coins & +${WEAPON_LOCK_BONUS_SQUAD} Commando (overflow >40 converts to +${OVERFLOW_SQUAD_COIN_BONUS} Coins).`;
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

      const hpPct = Math.min(100, Math.max(10, Math.round((boss.maxHp / 114000) * 100)));
      const segPct = Math.round((boss.segments / 10) * 100);
      const spdPct = Math.round((boss.advanceSpeed / 1.55) * 100);
      const rewPct = Math.min(100, Math.round((boss.rewardCoins / 2800) * 100));
      const layoutTag =
        st.boardLayout === 'SPLIT_CAUSEWAY' ? 'Split Causeway Siege' : `${st.trackLength}m Bridge`;

      this.armoryStatBars.innerHTML = `
        <div class="stat-meter">
          <div class="stat-meter__top"><span>ARMOR HP</span><strong>${formatObstacleHp(boss.maxHp)}</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${hpPct}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>LANE SALVO</span><strong>${boss.salvoLanes}x (-${boss.salvoDamage})</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${segPct}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>MARCH SPEED</span><strong>${boss.advanceSpeed.toFixed(2)}m/s</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${spdPct}%"></div></div>
        </div>
        <div class="stat-meter">
          <div class="stat-meter__top"><span>CLEAR BOUNTY</span><strong>+${formatCoinAmount(boss.rewardCoins)}</strong></div>
          <div class="stat-meter__track"><div class="stat-meter__fill" style="width:${rewPct}%"></div></div>
        </div>
      `;
      this.armoryItemNote.textContent = `Guarding ${st.title} (${layoutTag}). Fires ${boss.salvoLanes}-lane telegraphed plasma salvos every ${boss.salvoInterval.toFixed(1)}s — steer into the open lane!`;
    }
  }

  private renderSectorMap(save: SaveDataV1): void {
    this.sectorMapList.innerHTML = '';

    const splitBtn = document.createElement('button');
    splitBtn.type = 'button';
    const splitSelected = save.selectedMode === 'SPLIT_CAUSEWAY';
    splitBtn.className = `sector-node${splitSelected ? ' is-selected' : ''}`;
    splitBtn.innerHTML = `
      <div class="sector-node__num">⇄</div>
      <div class="sector-node__info">
        <span class="sector-node__title">SPLIT CAUSEWAY SIEGE</span>
        <span class="sector-node__sub">Left Barrel+Gate Queue vs Right Battalions • Stage ${save.splitCausewayStage} (Best: S${save.bestSplitStage})</span>
      </div>
      <span class="sector-node__status">${splitSelected ? 'ACTIVE' : 'DEPLOY'}</span>
    `;
    splitBtn.addEventListener('click', () => {
      this.callbacks.onSelectMode('SPLIT_CAUSEWAY');
      this.switchHubTab('BATTLE');
    });
    this.sectorMapList.appendChild(splitBtn);

    const endlessBtn = document.createElement('button');
    endlessBtn.type = 'button';
    const endlessSelected = save.selectedMode === 'ENDLESS';
    endlessBtn.className = `sector-node${endlessSelected ? ' is-selected' : ''}`;
    endlessBtn.innerHTML = `
      <div class="sector-node__num">∞</div>
      <div class="sector-node__info">
        <span class="sector-node__title">ENDLESS BRIDGE GAUNTLET</span>
        <span class="sector-node__sub">4x Marathon Bridges &amp; Split Sieges • Best: ${Math.round(save.bestEndlessDistance)}m</span>
      </div>
      <span class="sector-node__status">${endlessSelected ? 'ACTIVE' : 'DEPLOY'}</span>
    `;
    endlessBtn.addEventListener('click', () => {
      this.callbacks.onSelectMode('ENDLESS');
      this.switchHubTab('BATTLE');
    });
    this.sectorMapList.appendChild(endlessBtn);

    for (const st of CAMPAIGN_STAGES) {
      const unlocked = st.stageNumber <= save.unlockedStage;
      const cleared = st.stageNumber < save.unlockedStage;
      const isSelected =
        save.selectedMode === 'CAMPAIGN' && save.selectedStage === st.stageNumber;
      const boardBadge =
        st.boardLayout === 'SPLIT_CAUSEWAY' ? '[SPLIT CAUSEWAY]' : `[${st.trackLength}m]`;

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
          <span class="sector-node__sub">${boardBadge} ${st.boss.name} • +${formatCoinAmount(st.boss.rewardCoins)} Clear Coins</span>
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
    this.coinCountEl.textContent = formatCoinAmount(coins);
  }

  public updateTrackProgress(
    progressRatio: number,
    mode: GameMode,
    _distanceMeters: number,
    endlessWave: number,
    splitStage = 1
  ): void {
    const pct = Math.max(0, Math.min(100, progressRatio * 100));
    this.progressFillEl.style.width = `${pct.toFixed(1)}%`;
    this.progressPctEl.textContent =
      mode === 'ENDLESS'
        ? `W${endlessWave} • ${Math.round(pct)}%`
        : mode === 'SPLIT_CAUSEWAY'
          ? `S${splitStage} • ${Math.round(pct)}%`
          : `${Math.round(pct)}%`;
  }

  public updateWorldOverlays(
    sceneManager: SceneManager,
    state: GameState,
    _squadX: number,
    squadZ: number,
    _logicalSquad: number,
    weaponTier: WeaponTierId,
    enemyWaves: ReadonlyArray<EnemyWaveSlot>,
    bossVisible: boolean,
    bossName: string,
    bossHp: number,
    bossMaxHp: number,
    bossSegments: number,
    splitCauseway?: SplitCausewayController
  ): void {
    const inCombat = state === 'RUNNING' || state === 'BOSS_FIGHT';

    if (weaponTier !== this.lastWeaponTier) {
      this.lastWeaponTier = weaponTier;
      this.squadWeaponEl.textContent = WEAPON_SPECS[weaponTier].shortBadge;
    }

    // All 1..40 commandos are rendered 1:1 on the bridge — keep floating #squad-pill hidden for unobstructed action!
    this.squadPillEl.classList.add('is-hidden');

    // Project compact mini HP bars ONLY on damaged swarm units, prioritizing Heavy Juggernauts first!
    let usedBars = 0;
    if (inCombat) {
      for (let pass = 0; pass < 2 && usedBars < MAX_HEAVY_HP_BARS; pass++) {
        const wantHeavy = pass === 0 ? 1 : 0;
        for (let w = 0; w < enemyWaves.length && usedBars < MAX_HEAVY_HP_BARS; w++) {
          const wave = enemyWaves[w];
          if (!wave || !wave.active || wave.aliveCount <= 0) {
            continue;
          }
          const totalUnits = wave.getConfiguredCount();
          for (let u = 0; u < totalUnits && usedBars < MAX_HEAVY_HP_BARS; u++) {
            if (
              wave.unitAlive[u] === 0 ||
              wave.unitIsHeavy[u] !== wantHeavy ||
              wave.unitHp[u] >= wave.unitMaxHp[u] - 0.01
            ) {
              continue;
            }
            const uz = wave.unitZ[u];
            const distAhead = squadZ - uz;
            if (distAhead > 34 || distAhead < -3) {
              continue;
            }
            const isElite = wantHeavy === 1;
            const headY = isElite ? 1.98 : 1.56;
            sceneManager.projectToScreen(wave.unitX[u], headY, uz, _projScratch);
            if (!_projScratch.visible) {
              continue;
            }

            const bar = this.heavyHpBars[usedBars];
            const fill = this.heavyHpFills[usedBars];
            const ratio = Math.max(0, Math.min(1, wave.unitHp[u] / Math.max(1, wave.unitMaxHp[u])));
            bar.classList.remove('is-hidden');
            bar.classList.toggle('heavy-hp-bar--elite', isElite);
            bar.style.transform = `translate3d(${_projScratch.x.toFixed(1)}px, ${_projScratch.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
            fill.style.width = `${(ratio * 100).toFixed(1)}%`;
            usedBars++;
          }
        }

        if (
          splitCauseway &&
          splitCauseway.active &&
          splitCauseway.rightAliveCount > 0 &&
          usedBars < MAX_HEAVY_HP_BARS
        ) {
          const totalTroopers = splitCauseway.totalTroopers;
          for (let u = 0; u < totalTroopers && usedBars < MAX_HEAVY_HP_BARS; u++) {
            const isHeavyUnit = splitCauseway.unitRank[u] === 2 ? 1 : 0;
            if (
              splitCauseway.unitAlive[u] === 0 ||
              isHeavyUnit !== wantHeavy ||
              splitCauseway.unitHp[u] >= splitCauseway.unitMaxHp[u] - 0.01
            ) {
              continue;
            }
            const uz = splitCauseway.unitZ[u];
            const distAhead = squadZ - uz;
            if (distAhead > 38 || distAhead < -3) {
              continue;
            }
            const isElite = wantHeavy === 1;
            const headY = isElite ? 1.98 : 1.56;
            sceneManager.projectToScreen(splitCauseway.unitX[u], headY, uz, _projScratch);
            if (!_projScratch.visible) {
              continue;
            }

            const bar = this.heavyHpBars[usedBars];
            const fill = this.heavyHpFills[usedBars];
            const ratio = Math.max(
              0,
              Math.min(1, splitCauseway.unitHp[u] / Math.max(1, splitCauseway.unitMaxHp[u]))
            );
            bar.classList.remove('is-hidden');
            bar.classList.toggle('heavy-hp-bar--elite', isElite);
            bar.style.transform = `translate3d(${_projScratch.x.toFixed(1)}px, ${_projScratch.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
            fill.style.width = `${(ratio * 100).toFixed(1)}%`;
            usedBars++;
          }
        }
      }
    }
    for (let i = usedBars; i < MAX_HEAVY_HP_BARS; i++) {
      this.heavyHpBars[i].classList.add('is-hidden');
    }

    // Boss Segmented Health Bar
    if (bossVisible && bossHp > 0) {
      this.bossHudEl.classList.remove('is-hidden');
      this.bossNameEl.textContent = bossName.toUpperCase();
      const hpCeil = Math.max(0, Math.ceil(bossHp));
      this.bossHpEl.textContent = `${formatObstacleHp(hpCeil)} / ${formatObstacleHp(bossMaxHp)}`;
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
        : summary.mode === 'SPLIT_CAUSEWAY'
          ? `SPLIT CAUSEWAY ${summary.stageNumber}`
          : `SECTOR ${summary.stageNumber}`;

    this.summaryKickerEl.textContent = isVictory
      ? `${modeLabel} CLEARED!`
      : `${modeLabel} — ${Math.round(summary.progressRatio * 100)}% PROGRESS`;

    this.summaryTitleEl.textContent = isVictory ? 'VICTORY!' : 'RUN COMPLETE';
    this.summaryTitleEl.classList.toggle('summary-card__title--victory', isVictory);
    this.summaryTitleEl.classList.toggle('summary-card__title--defeat', !isVictory);

    this.sumDistanceEl.textContent = `${Math.round(summary.distanceMeters)}m`;
    this.sumDrumsEl.textContent = `${summary.drumsBroken}`;
    this.sumEnemiesEl.textContent = `${summary.enemiesDefeated}`;

    const endBonusEarned = Math.max(0, summary.totalCoinsEarned - summary.liveCoinsEarned);
    this.sumLiveCoinsEl.textContent = `+${formatCoinAmount(summary.liveCoinsEarned)}`;
    this.sumBonusCoinsEl.textContent = `+${formatCoinAmount(endBonusEarned)}`;
    this.sumMultEl.textContent = `×${summary.warChestMultiplier.toFixed(2)}`;
    this.btnSummaryContinue.textContent = 'NEXT';

    if (this.coinRollupRaf) {
      cancelAnimationFrame(this.coinRollupRaf);
      this.coinRollupRaf = 0;
    }
    const targetCoins = summary.totalCoinsEarned;
    const startTs = performance.now();
    const durationMs = 420;
    this.sumTotalCoinsEl.textContent = `+${formatCoinAmount(targetCoins)}`;

    if (targetCoins > 0) {
      const stepRollup = (now: number): void => {
        const t = Math.min(1, (now - startTs) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3);
        const shown = Math.round(targetCoins * eased);
        this.sumTotalCoinsEl.textContent = `+${formatCoinAmount(shown)}`;
        if (t < 1) {
          this.coinRollupRaf = requestAnimationFrame(stepRollup);
        } else {
          this.sumTotalCoinsEl.textContent = `+${formatCoinAmount(targetCoins)}`;
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
