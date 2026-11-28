import * as THREE from 'three';
import { getBossVisualProfile } from '../core/StageData';
import type { BossChassisId, BossDefinition, SkinThemeId } from '../core/types';
import {
  createAllBossChassisRigs,
  type BossChassisRig,
} from '../rendering/BossRigFactory';
import { createAllUnicornBossChassisRigs } from '../rendering/UnicornBossRigFactory';

export const BOSS_SALVO_LANE_CENTERS = [-3.85, 0.0, 3.85] as const;
export const BOSS_SALVO_HIT_HALF_WIDTH = 1.72;
export const BOSS_TELEGRAPH_DURATION = 0.56;
const BOSS_WARHEAD_SPEED = 35.0;
const BOSS_ENRAGED_WARHEAD_SPEED = 40.5;
const MAX_BOSS_WARHEADS = 8;

type LaneMask3 = readonly [boolean, boolean, boolean];

const SINGLE_LANE_MASKS: readonly [LaneMask3, LaneMask3, LaneMask3] = [
  [true, false, false],
  [false, true, false],
  [false, false, true],
];

const DUAL_LANE_MASKS_BY_PLAYER: readonly [
  readonly [LaneMask3, LaneMask3],
  readonly [LaneMask3, LaneMask3],
  readonly [LaneMask3, LaneMask3],
] = [
  // Player in LEFT (0): lock (0,1 -> RIGHT safe) or (0,2 -> CENTER safe)
  [
    [true, true, false],
    [true, false, true],
  ],
  // Player in CENTER (1): lock (0,1 -> RIGHT safe) or (1,2 -> LEFT safe)
  [
    [true, true, false],
    [false, true, true],
  ],
  // Player in RIGHT (2): lock (1,2 -> LEFT safe) or (0,2 -> CENTER safe)
  [
    [false, true, true],
    [true, false, true],
  ],
];

function getSafeLaneIndex(mask: LaneMask3): number {
  if (!mask[0]) return 0;
  if (!mask[1]) return 1;
  return 2;
}

/**
 * Pure zero-allocation Boss lane targeting selector:
 * - Always locks onto the player's current lane so AFK standing never avoids Boss salvos.
 * - Strictly guarantees at least 1 safe open lane on every 1-lane and 2-lane salvo.
 * - Alternates open safe lanes on consecutive 2-lane salvos whenever `prevSafeLaneIndex` is supplied!
 */
export function selectBossSalvoLaneMask(
  squadX: number,
  salvoLanes: 1 | 2,
  cycleIndex: number,
  prevSafeLaneIndex = -1
): LaneMask3 {
  const playerLane: 0 | 1 | 2 = squadX < -1.45 ? 0 : squadX > 1.45 ? 2 : 1;
  if (salvoLanes === 1) {
    return SINGLE_LANE_MASKS[playerLane];
  }
  const pair = DUAL_LANE_MASKS_BY_PLAYER[playerLane];
  const parity = Math.abs(Math.floor(cycleIndex)) % 2;
  const candidate = pair[parity];
  if (prevSafeLaneIndex >= 0 && getSafeLaneIndex(candidate) === prevSafeLaneIndex) {
    return pair[1 - parity];
  }
  return candidate;
}

interface TelegraphLaneVisual {
  readonly root: THREE.Group;
  readonly carpetGroup: THREE.Group;
  readonly carpetMat: THREE.MeshBasicMaterial;
  readonly railMat: THREE.MeshBasicMaterial;
  readonly reticleRing: THREE.Mesh;
  readonly reticleMat: THREE.MeshBasicMaterial;
}

interface BossWarheadSlot {
  readonly root: THREE.Group;
  readonly coreMesh: THREE.Mesh;
  active: boolean;
  laneIndex: number;
  x: number;
  z: number;
  damage: number;
  speed: number;
}

function createSalvoChevronTexture(): THREE.Texture {
  if (typeof document === 'undefined') {
    const tex = new THREE.DataTexture(new Uint8Array([255, 60, 80, 128]), 1, 1);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 128);

  // Subtle translucent crimson danger lane fill
  ctx.fillStyle = 'rgba(255, 36, 66, 0.34)';
  ctx.fillRect(0, 0, 128, 128);

  // Bold forward-pointing warning chevrons scrolling down the locked lane (+Z -> V decreases)
  ctx.fillStyle = 'rgba(255, 196, 72, 0.88)';
  for (const cy of [26, 90]) {
    ctx.beginPath();
    ctx.moveTo(14, cy - 18);
    ctx.lineTo(64, cy + 16);
    ctx.lineTo(114, cy - 18);
    ctx.lineTo(114, cy + 4);
    ctx.lineTo(64, cy + 38);
    ctx.lineTo(14, cy + 4);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class BossEntity {
  public readonly entityId = 999;
  private readonly tacticalRigs: Record<BossChassisId, BossChassisRig>;
  private readonly unicornRigs: Record<BossChassisId, BossChassisRig>;
  private skinTheme: SkinThemeId = 'UNICORN';
  private latestDef: BossDefinition | null = null;
  public activeChassis: BossChassisId = 'WARDEN_MECH';
  public active = false;
  public defeated = false;
  public isEnraged = false;
  public name = 'Sapphire Charger Stallion';
  public maxHp = 1100;
  public currentHp = 1100;
  public segments = 5;
  public advanceSpeed = 1.25;
  public salvoLanes: 1 | 2 = 2;
  public salvoInterval = 1.48;
  public salvoDamage = 8;
  public rewardCoins = 75;
  public x = 0;
  public z = -280;

  private walkPhase = 0;
  private lastFootstepCycle = 0;
  private hitFlash = 0;
  private hitFlashCooldown = 0;
  private slamTimer = 0;
  private barrelSpin = 0;
  private staggerTimer = 0;
  private escortSummonTimer = 0;
  private preEnrageEscortTriggered = false;
  private lastSafeLaneIndex = -1;
  private activeTelegraphDuration = BOSS_TELEGRAPH_DURATION;

  // Telegraphed Lane Salvo State (Zero-GC pre-allocated pools)
  private readonly laneVisuals: TelegraphLaneVisual[] = [];
  private readonly chevronTex: THREE.Texture;
  private readonly warheads: BossWarheadSlot[] = [];
  private readonly warheadShellMat: THREE.MeshBasicMaterial;
  private readonly warheadWakeMat: THREE.MeshBasicMaterial;
  private readonly warheadGroundHaloMat: THREE.MeshBasicMaterial;
  private lockedLaneMask: LaneMask3 = [false, false, false];
  private telegraphTimer = 0;
  private salvoCooldown = 0.65;
  private salvoCycleIndex = 0;

  public lastStepTriggeredShake = false;
  public lastStepSlamDamage = 0;
  public lastStepSalvoWarning = false;
  public lastStepSalvoLaunched = false;
  public lastStepSalvoHitDamage = 0;
  public lastStepSalvoHitX = 0;
  public lastStepSalvoDodgedCount = 0;
  public lastStepSalvoDodgeX = 0;
  public lastStepSegmentBroken = false;
  public lastStepEnrageTriggered = false;
  public lastStepSummonEscorts = false;
  public lastStepEscortCount = 0;

  constructor(scene: THREE.Scene) {
    this.tacticalRigs = createAllBossChassisRigs();
    this.unicornRigs = createAllUnicornBossChassisRigs();
    for (const key of Object.keys(this.tacticalRigs) as BossChassisId[]) {
      this.tacticalRigs[key].root.visible = false;
      this.unicornRigs[key].root.visible = false;
      scene.add(this.tacticalRigs[key].root);
      scene.add(this.unicornRigs[key].root);
    }

    this.chevronTex = createSalvoChevronTexture();

    // 1. Pre-allocate 3 Roadway Crimson Hazard-Chevron Telegraph Strips
    const carpetGeo = new THREE.PlaneGeometry(3.06, 1.0);
    carpetGeo.rotateX(-Math.PI / 2);
    const railGeo = new THREE.PlaneGeometry(0.16, 1.0);
    railGeo.rotateX(-Math.PI / 2);
    const reticleGeo = new THREE.RingGeometry(0.65, 1.28, 24);
    reticleGeo.rotateX(-Math.PI / 2);

    for (let lane = 0; lane < 3; lane++) {
      const root = new THREE.Group();
      root.visible = false;

      const carpetMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: this.chevronTex,
        transparent: true,
        opacity: 0.56,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const railMat = new THREE.MeshBasicMaterial({
        color: 0xff9f2e,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const reticleMat = new THREE.MeshBasicMaterial({
        color: 0xff4757,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const carpetGroup = new THREE.Group();
      const carpetMesh = new THREE.Mesh(carpetGeo, carpetMat);
      const leftRail = new THREE.Mesh(railGeo, railMat);
      leftRail.position.x = -1.53;
      const rightRail = new THREE.Mesh(railGeo, railMat);
      rightRail.position.x = 1.53;
      carpetGroup.add(carpetMesh, leftRail, rightRail);

      const reticleRing = new THREE.Mesh(reticleGeo, reticleMat);
      root.add(carpetGroup, reticleRing);
      scene.add(root);

      this.laneVisuals.push({
        root,
        carpetGroup,
        carpetMat,
        railMat,
        reticleRing,
        reticleMat,
      });
    }

    // 2. Pre-allocate Boss Salvo Warhead Pool (Glowing Plasma / Star-Magic Shells)
    const coreGeo = new THREE.OctahedronGeometry(0.42, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffdf7e,
    });
    const shellGeo = new THREE.OctahedronGeometry(0.62, 0);
    this.warheadShellMat = new THREE.MeshBasicMaterial({
      color: 0x249dff,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wakeGeo = new THREE.ConeGeometry(0.46, 2.1, 10);
    wakeGeo.rotateX(-Math.PI / 2);
    this.warheadWakeMat = new THREE.MeshBasicMaterial({
      color: 0x22e868,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const groundHaloGeo = new THREE.RingGeometry(0.32, 0.92, 18);
    groundHaloGeo.rotateX(-Math.PI / 2);
    this.warheadGroundHaloMat = new THREE.MeshBasicMaterial({
      color: 0xffd238,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    for (let i = 0; i < MAX_BOSS_WARHEADS; i++) {
      const root = new THREE.Group();
      root.visible = false;

      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.y = 0.92;
      const shellMesh = new THREE.Mesh(shellGeo, this.warheadShellMat);
      shellMesh.position.y = 0.92;
      coreMesh.add(shellMesh);

      const wakeMesh = new THREE.Mesh(wakeGeo, this.warheadWakeMat);
      wakeMesh.position.set(0, 0.92, -1.05);

      const groundHalo = new THREE.Mesh(groundHaloGeo, this.warheadGroundHaloMat);
      groundHalo.position.set(0, 0.05, 0);

      root.add(coreMesh, wakeMesh, groundHalo);
      scene.add(root);

      this.warheads.push({
        root,
        coreMesh,
        active: false,
        laneIndex: 1,
        x: 0,
        z: 0,
        damage: 5,
        speed: BOSS_WARHEAD_SPEED,
      });
    }

    this.syncSalvoPalette();
  }

  public get rigs(): Record<BossChassisId, BossChassisRig> {
    return this.skinTheme === 'UNICORN' ? this.unicornRigs : this.tacticalRigs;
  }

  public get activeRig(): BossChassisRig {
    return this.rigs[this.activeChassis];
  }

  public get isTelegraphingSalvo(): boolean {
    return this.telegraphTimer > 0;
  }

  private syncSalvoPalette(): void {
    const isUnicorn = this.skinTheme === 'UNICORN';
    this.warheadShellMat.color.setHex(isUnicorn ? 0x249dff : 0xff2e4c);
    this.warheadWakeMat.color.setHex(isUnicorn ? 0x22e868 : 0xff5e2b);
    this.warheadGroundHaloMat.color.setHex(isUnicorn ? 0xffd238 : 0xff384c);
    for (let lane = 0; lane < this.laneVisuals.length; lane++) {
      this.laneVisuals[lane].railMat.color.setHex(isUnicorn ? 0x38d8ff : 0xff9f2e);
      this.laneVisuals[lane].reticleMat.color.setHex(isUnicorn ? 0x249dff : 0xff4757);
    }
  }

  private syncActiveThemeRigAppearance(): void {
    const def = this.latestDef;
    const isUnicorn = this.skinTheme === 'UNICORN';
    const activeSet = isUnicorn ? this.unicornRigs : this.tacticalRigs;
    const hiddenSet = isUnicorn ? this.tacticalRigs : this.unicornRigs;

    for (const key of Object.keys(hiddenSet) as BossChassisId[]) {
      hiddenSet[key].root.visible = false;
    }

    if (!def) {
      for (const key of Object.keys(activeSet) as BossChassisId[]) {
        activeSet[key].root.visible = false;
      }
      return;
    }

    const profile = getBossVisualProfile(def, this.skinTheme);
    this.name = profile.name;

    for (const key of Object.keys(activeSet) as BossChassisId[]) {
      const rig = activeSet[key];
      const isSelected = this.active && !this.defeated && key === def.chassis;
      rig.root.visible = isSelected;
      if (isSelected) {
        rig.primaryMat.color.setHex(profile.primaryHex);
        rig.accentMat.color.setHex(profile.accentHex);
        rig.trimMat.color.setHex(profile.trimHex);
        rig.glowMat.color.setHex(profile.trimHex);
        rig.bodyGroup.rotation.set(0, 0, 0);
        if (rig.leftLeg) rig.leftLeg.rotation.set(0, 0, 0);
        if (rig.rightLeg) rig.rightLeg.rotation.set(0, 0, 0);
        if (rig.spiderLegs) {
          for (let l = 0; l < rig.spiderLegs.length; l++) {
            rig.spiderLegs[l].rotation.set(0, 0, 0);
          }
        }
        if (rig.turretGroup) rig.turretGroup.rotation.set(0, 0, 0);
        if (rig.meleeArm) {
          rig.meleeArm.rotation.set(isUnicorn ? 0.66 : 0, 0, 0);
        }
        rig.root.position.set(this.x, 0, this.z);
      }
    }
    this.applyFlash(this.hitFlash);
  }

  public setSkinTheme(theme: SkinThemeId): void {
    if (this.skinTheme === theme) {
      return;
    }
    this.skinTheme = theme;
    this.syncSalvoPalette();
    this.syncActiveThemeRigAppearance();
  }

  public configure(def: BossDefinition, trackLength: number): void {
    this.latestDef = def;
    this.active = true;
    this.defeated = false;
    this.isEnraged = false;
    this.activeChassis = def.chassis;
    this.maxHp = def.maxHp;
    this.currentHp = def.maxHp;
    this.segments = def.segments;
    this.advanceSpeed = def.advanceSpeed;
    this.salvoLanes = def.salvoLanes;
    this.salvoInterval = def.salvoInterval;
    this.salvoDamage = def.salvoDamage;
    this.rewardCoins = def.rewardCoins;
    this.x = 0;
    this.z = -trackLength - 24.5;
    this.walkPhase = 0;
    this.lastFootstepCycle = 0;
    this.hitFlash = 0;
    this.hitFlashCooldown = 0;
    this.slamTimer = 0;
    this.barrelSpin = 0;
    this.staggerTimer = 0;
    this.escortSummonTimer = 0;
    this.preEnrageEscortTriggered = false;
    this.lastSafeLaneIndex = -1;
    this.activeTelegraphDuration = BOSS_TELEGRAPH_DURATION;

    this.clearSalvoVisuals();
    this.salvoCooldown = 0.42;
    this.salvoCycleIndex = 0;

    this.syncActiveThemeRigAppearance();
  }

  private clearSalvoVisuals(): void {
    this.telegraphTimer = 0;
    this.lockedLaneMask = [false, false, false];
    for (let lane = 0; lane < 3; lane++) {
      this.laneVisuals[lane].root.visible = false;
    }
    for (let i = 0; i < MAX_BOSS_WARHEADS; i++) {
      this.warheads[i].active = false;
      this.warheads[i].root.visible = false;
    }
  }

  public hide(): void {
    this.active = false;
    this.isEnraged = false;
    this.clearSalvoVisuals();
    for (const key of Object.keys(this.tacticalRigs) as BossChassisId[]) {
      this.tacticalRigs[key].root.visible = false;
      this.unicornRigs[key].root.visible = false;
    }
  }

  private applyFlash(amount: number): void {
    const rig = this.activeRig;
    const w = amount > 0.15 ? 0.88 : amount * 2.4;
    const ragePulse =
      this.isEnraged && amount <= 0.15
        ? 0.22 + 0.14 * Math.sin(this.barrelSpin * 0.45)
        : 0;
    const er = Math.max(w, ragePulse * 1.15);
    const eg = Math.max(w, ragePulse * 0.25);
    const eb = Math.max(w, ragePulse * 0.45);
    rig.primaryMat.emissive.setRGB(er, eg, eb);
    rig.darkSteelMat.emissive.setRGB(er * 0.8, eg * 0.8, eb * 0.8);
    rig.accentMat.emissive.setRGB(er, eg, eb);
    rig.trimMat.emissive.setRGB(Math.max(w, ragePulse * 0.9), Math.max(w, ragePulse * 0.6), eb);
  }

  public update(
    dt: number,
    inBossFight: boolean,
    squadX: number,
    squadZ: number,
    currentSquad: number,
    tempoMult = 1.0
  ): void {
    this.lastStepTriggeredShake = false;
    this.lastStepSlamDamage = 0;
    this.lastStepSalvoWarning = false;
    this.lastStepSalvoLaunched = false;
    this.lastStepSalvoHitDamage = 0;
    this.lastStepSalvoDodgedCount = 0;
    this.lastStepEnrageTriggered = false;
    this.lastStepSummonEscorts = false;
    this.lastStepEscortCount = 0;

    if (!this.active || this.defeated) {
      return;
    }

    const safeTempo = Math.max(0.85, tempoMult);
    const rig = this.activeRig;
    const isUnicorn = this.skinTheme === 'UNICORN';

    if (this.hitFlashCooldown > 0) {
      this.hitFlashCooldown = Math.max(0, this.hitFlashCooldown - dt);
    }
    if (this.hitFlash > 0) {
      this.hitFlash = Math.max(0, this.hitFlash - dt * 24);
      this.applyFlash(this.hitFlash);
    } else if (this.isEnraged) {
      this.applyFlash(0);
    }

    // 75% HP Escort Vanguard (ALL difficulties!) + 50% HP Enrage & Periodic Escort Phalanx Summons!
    if (inBossFight && currentSquad > 0) {
      const hpRatio = this.currentHp / Math.max(1, this.maxHp);
      if (!this.isEnraged && hpRatio <= 0.50) {
        this.isEnraged = true;
        this.lastStepEnrageTriggered = true;
        this.escortSummonTimer = 0.25;
        this.salvoCooldown = Math.min(this.salvoCooldown, 0.34);
      } else if (
        !this.isEnraged &&
        !this.preEnrageEscortTriggered &&
        hpRatio <= 0.75
      ) {
        this.preEnrageEscortTriggered = true;
        this.lastStepSummonEscorts = true;
        this.lastStepEscortCount = safeTempo >= 1.35 ? 16 : safeTempo >= 1.18 ? 14 : 12;
      }

      if (this.isEnraged && this.z < squadZ - 5.2) {
        this.escortSummonTimer -= dt;
        if (this.escortSummonTimer <= 0) {
          this.escortSummonTimer = Math.max(2.4, 3.6 / safeTempo);
          this.lastStepSummonEscorts = true;
          this.lastStepEscortCount = safeTempo >= 1.35 ? 20 : safeTempo >= 1.18 ? 16 : 14;
        }
      }
    }

    // Spin rotary cannons / star-halos / chariot wheels (faster spin during Enrage & telegraph!)
    const rageSpinBoost = this.isEnraged ? 1.48 : 1.0;
    const spinRate = (this.telegraphTimer > 0 ? 32.0 : inBossFight ? 19.5 : 3.5) * rageSpinBoost;
    this.barrelSpin += dt * spinRate;
    for (let i = 0; i < rig.spinClusters.length; i++) {
      const sign = i % 2 === 0 ? 1 : -1;
      if (!isUnicorn && this.activeChassis === 'KRAKEN_WALKER') {
        rig.spinClusters[i].rotation.y = this.barrelSpin * 0.5;
      } else {
        rig.spinClusters[i].rotation.z = this.barrelSpin * sign;
      }
    }

    // Pulse ground threat ring (wider fiery pulse when Enraged)
    const ringBase = this.isEnraged ? 1.16 : 1.0;
    const ringPulse = ringBase + Math.sin(this.barrelSpin * 0.35) * (this.isEnraged ? 0.11 : 0.06);
    rig.hazardRing.scale.set(ringPulse, ringPulse, 1);

    const baseBodyY = isUnicorn
      ? this.activeChassis === 'SOVEREIGN_TITAN'
        ? 1.88
        : 1.65
      : this.activeChassis === 'SIEGE_TANK'
        ? 0.55
        : this.activeChassis === 'KRAKEN_WALKER'
          ? 1.48
          : this.activeChassis === 'SOVEREIGN_TITAN'
            ? 1.78
            : 1.58;

    if (!inBossFight) {
      this.walkPhase += dt * 2.2;
      rig.bodyGroup.position.y = baseBodyY + Math.sin(this.walkPhase) * 0.05;
      rig.bodyGroup.rotation.x = 0;
      if (isUnicorn && rig.turretGroup) {
        rig.turretGroup.rotation.set(Math.sin(this.walkPhase * 0.8) * 0.04, -0.18, 0);
      }
      if (rig.wingPylons) {
        const flap = Math.sin(this.walkPhase * 0.9) * (isUnicorn ? 0.11 : 0.06);
        rig.wingPylons[0].rotation.z = 0.42 + flap;
        rig.wingPylons[1].rotation.z = -0.42 - flap;
      }
      return;
    }

    if (this.staggerTimer > 0) {
      this.staggerTimer = Math.max(0, this.staggerTimer - dt);
    }

    const stopZ = squadZ - 2.35;
    if (this.z < stopZ) {
      const rageSpeedMul = this.isEnraged ? 1.18 : 1.0;
      const telegraphSlowMul = this.telegraphTimer > 0 ? 0.48 : 1.0;
      const staggerMul = this.staggerTimer > 0 ? 0.15 : 1.0;
      const effAdvanceSpeed =
        this.advanceSpeed * rageSpeedMul * telegraphSlowMul * staggerMul;
      this.z = Math.min(stopZ, this.z + effAdvanceSpeed * dt);
      const targetBossX = Math.max(-2.65, Math.min(2.65, squadX * 0.68));
      const dx = targetBossX - this.x;
      this.x += Math.sign(dx) * Math.min(Math.abs(dx), 1.85 * rageSpeedMul * dt);

      const phaseRate =
        (isUnicorn
          ? 5.8
          : this.activeChassis === 'KRAKEN_WALKER'
            ? 6.8
            : 4.8) * rageSpeedMul;
      this.walkPhase += dt * phaseRate;
      const cycle = Math.floor(this.walkPhase / Math.PI);
      if (cycle !== this.lastFootstepCycle) {
        this.lastFootstepCycle = cycle;
        this.lastStepTriggeredShake = true;
      }

      this.animateChassisAdvance(rig, baseBodyY, squadX);
      if (this.staggerTimer > 0) {
        rig.bodyGroup.rotation.x -= Math.sin((this.staggerTimer / 0.65) * Math.PI) * 0.22;
      }
    } else if (currentSquad > 0) {
      // Boss reached melee range — heavy chassis slam / Giant Unicorn rearing horn-charge!
      this.slamTimer -= dt;
      if (this.slamTimer <= 0) {
        this.slamTimer = 0.20;
        this.lastStepTriggeredShake = true;
        this.lastStepSlamDamage = Math.max(3, Math.ceil(currentSquad * 0.34));
      }
      rig.bodyGroup.position.y = baseBodyY + Math.sin(this.slamTimer * 30) * 0.18;
      rig.bodyGroup.rotation.x = 0.15 + Math.sin(this.slamTimer * 30) * 0.09;
      if (rig.meleeArm) {
        rig.meleeArm.rotation.x =
          (isUnicorn ? 0.66 : 0.55) +
          Math.sin(this.slamTimer * 30) * (isUnicorn ? 0.38 : 0.65);
      }
    }

    rig.root.position.set(this.x, 0, this.z);

    // Update Telegraphed Lane Salvos & In-Flight Boss Warheads
    this.updateSalvoAttacks(dt, squadX, squadZ, currentSquad, safeTempo);
  }

  private updateSalvoAttacks(
    dt: number,
    squadX: number,
    squadZ: number,
    currentSquad: number,
    tempoMult: number
  ): void {
    const rageCadence = this.isEnraged ? 1.28 : 1.0;
    const effectiveTelegraph = Math.max(
      0.44,
      BOSS_TELEGRAPH_DURATION / (tempoMult * (this.isEnraged ? 1.12 : 1.0))
    );
    const effectiveInterval = Math.max(
      0.72,
      this.salvoInterval / (tempoMult * rageCadence)
    );

    // 1. Trigger or advance Telegraph Phase while Boss is at ranged engagement distance
    if (this.telegraphTimer > 0) {
      this.telegraphTimer += dt;
      if (this.telegraphTimer >= this.activeTelegraphDuration) {
        this.telegraphTimer = 0;
        this.salvoCooldown = effectiveInterval;
        this.spawnSalvoWarheads();
        this.lastStepSalvoLaunched = true;
      }
    } else if (currentSquad > 0 && this.z < squadZ - 4.2) {
      this.salvoCooldown -= dt;
      if (this.salvoCooldown <= 0) {
        this.lockedLaneMask = selectBossSalvoLaneMask(
          squadX,
          this.salvoLanes,
          this.salvoCycleIndex++,
          this.lastSafeLaneIndex
        );
        this.lastSafeLaneIndex = getSafeLaneIndex(this.lockedLaneMask);
        this.activeTelegraphDuration = effectiveTelegraph;
        this.telegraphTimer = 0.001;
        this.lastStepSalvoWarning = true;
      }
    }

    // 2. Advance Active Warheads & Resolve Squad Dodge vs Hit
    let activeInLane0 = false;
    let activeInLane1 = false;
    let activeInLane2 = false;

    for (let i = 0; i < MAX_BOSS_WARHEADS; i++) {
      const w = this.warheads[i];
      if (!w.active) {
        continue;
      }
      w.z += w.speed * dt;
      w.coreMesh.rotation.z += dt * 15;
      w.coreMesh.rotation.x += dt * 9;
      w.root.position.set(w.x, 0, w.z);

      if (w.z >= squadZ - 0.18) {
        w.active = false;
        w.root.visible = false;
        if (currentSquad > 0) {
          if (Math.abs(squadX - w.x) < BOSS_SALVO_HIT_HALF_WIDTH) {
            this.lastStepSalvoHitDamage += w.damage;
            this.lastStepSalvoHitX = w.x;
          } else {
            this.lastStepSalvoDodgedCount += 1;
            this.lastStepSalvoDodgeX = w.x;
          }
        }
        continue;
      }

      if (w.laneIndex === 0) activeInLane0 = true;
      else if (w.laneIndex === 1) activeInLane1 = true;
      else activeInLane2 = true;
    }

    // 3. Sync 3 Roadway Telegraph Strip Visuals (pulsing during charge-up + active flight)
    const isCharging = this.telegraphTimer > 0;
    const chargeRatio = isCharging
      ? Math.min(1, this.telegraphTimer / Math.max(0.1, this.activeTelegraphDuration))
      : 1;
    const pulse = isCharging
      ? 0.55 + 0.45 * Math.sin(chargeRatio * Math.PI * 7)
      : 0.55;

    const zStart = this.z + 1.4;
    const zEnd = squadZ + 1.5;
    const stripLen = Math.max(2.0, zEnd - zStart);
    const stripMidZ = (zStart + zEnd) * 0.5;

    // Scroll warning chevrons rapidly down locked lanes toward the player squad
    this.chevronTex.repeat.set(1, Math.max(2, stripLen * 0.42));
    this.chevronTex.offset.y = (this.chevronTex.offset.y + dt * (this.isEnraged ? 4.8 : 3.8)) % 1;

    for (let lane = 0; lane < 3; lane++) {
      const vis = this.laneVisuals[lane];
      const hasFlight =
        lane === 0 ? activeInLane0 : lane === 1 ? activeInLane1 : activeInLane2;
      const showLane = (isCharging && this.lockedLaneMask[lane]) || hasFlight;
      vis.root.visible = showLane;
      if (!showLane) {
        continue;
      }

      const laneX = BOSS_SALVO_LANE_CENTERS[lane];
      vis.carpetGroup.position.set(laneX, 0.045, stripMidZ);
      vis.carpetGroup.scale.set(1, 1, stripLen);

      vis.carpetMat.opacity = isCharging
        ? 0.40 + 0.44 * chargeRatio * pulse
        : 0.34;
      vis.railMat.opacity = isCharging ? 0.58 + 0.42 * pulse : 0.48;

      const retScale = isCharging ? 1.25 - 0.35 * chargeRatio : 0.92;
      vis.reticleRing.position.set(laneX, 0.055, squadZ);
      vis.reticleRing.scale.set(retScale, retScale, 1);
      vis.reticleMat.opacity = isCharging ? 0.58 + 0.40 * pulse : 0.48;
    }
  }

  private spawnSalvoWarheads(): void {
    const launchZ = this.z + 1.5;
    const launchSpeed = this.isEnraged ? BOSS_ENRAGED_WARHEAD_SPEED : BOSS_WARHEAD_SPEED;
    const launchDmg = this.isEnraged
      ? Math.ceil(this.salvoDamage * 1.2)
      : this.salvoDamage;
    for (let lane = 0; lane < 3; lane++) {
      if (!this.lockedLaneMask[lane]) {
        continue;
      }
      for (let i = 0; i < MAX_BOSS_WARHEADS; i++) {
        const w = this.warheads[i];
        if (!w.active) {
          w.active = true;
          w.laneIndex = lane;
          w.x = BOSS_SALVO_LANE_CENTERS[lane];
          w.z = launchZ;
          w.damage = launchDmg;
          w.speed = launchSpeed;
          w.root.position.set(w.x, 0, w.z);
          w.root.visible = true;
          break;
        }
      }
    }
  }

  private animateChassisAdvance(
    rig: BossChassisRig,
    baseBodyY: number,
    squadX: number
  ): void {
    const p = this.walkPhase;
    if (this.skinTheme === 'UNICORN' && rig.spiderLegs) {
      // 4-beat diagonal equine war-horse trot (FL + RR paired, FR + RL counter-paired)
      const [fl, fr, rl, rr] = rig.spiderLegs;
      const stride = Math.sin(p) * 0.34;
      fl.rotation.x = stride;
      rr.rotation.x = stride * 0.88;
      fr.rotation.x = -stride;
      rl.rotation.x = -stride * 0.88;

      rig.bodyGroup.position.y = baseBodyY + Math.abs(Math.sin(p)) * 0.11;
      rig.bodyGroup.rotation.x = 0.03 + Math.sin(p * 2) * 0.035;
      rig.bodyGroup.rotation.z = Math.sin(p) * 0.025;

      if (rig.turretGroup) {
        const aimYaw =
          -0.18 + Math.max(-0.30, Math.min(0.30, (squadX - this.x) * 0.12));
        const chargeFrac =
          this.telegraphTimer > 0
            ? Math.min(1, this.telegraphTimer / Math.max(0.1, this.activeTelegraphDuration))
            : 0;
        rig.turretGroup.rotation.y = aimYaw;
        rig.turretGroup.rotation.x =
          Math.sin(p * 2) * 0.045 + chargeFrac * 0.28;
      }

      if (rig.wingPylons) {
        const flare = Math.sin(p * 1.6) * 0.15;
        rig.wingPylons[0].rotation.z = 0.44 + flare;
        rig.wingPylons[1].rotation.z = -0.44 - flare;
      }

      for (let b = 0; b < rig.recoilBarrels.length; b++) {
        const rec = Math.max(0, Math.sin(p * 2.2 + b * Math.PI)) * 0.24;
        rig.recoilBarrels[b].position.z = 0.76 - rec;
      }
      return;
    }

    if (this.activeChassis === 'WARDEN_MECH' || this.activeChassis === 'SOVEREIGN_TITAN') {
      const swing = Math.sin(p) * 0.38;
      if (rig.leftLeg) rig.leftLeg.rotation.x = swing;
      if (rig.rightLeg) rig.rightLeg.rotation.x = -swing;
      rig.bodyGroup.position.y = baseBodyY + Math.abs(Math.cos(p)) * 0.12;
      rig.bodyGroup.rotation.x = 0.06 + Math.abs(Math.sin(p)) * 0.04;
      rig.bodyGroup.rotation.z = Math.sin(p) * 0.035;

      if (rig.wingPylons) {
        const flare = Math.sin(p * 1.5) * 0.10;
        rig.wingPylons[0].rotation.z = 0.46 + flare;
        rig.wingPylons[1].rotation.z = -0.46 - flare;
      }
      if (rig.meleeArm) {
        rig.meleeArm.rotation.x = Math.sin(p) * 0.24;
      }
    } else if (this.activeChassis === 'SIEGE_TANK') {
      // Heavy tracked suspension rumble + turret aim + alternating dual cannon recoil!
      rig.bodyGroup.position.y = baseBodyY + Math.sin(p * 2.8) * 0.035;
      rig.bodyGroup.rotation.x = Math.sin(p * 1.4) * 0.025;
      if (rig.turretGroup) {
        const aimYaw = Math.max(-0.35, Math.min(0.35, (squadX - this.x) * 0.14));
        rig.turretGroup.rotation.y = aimYaw;
      }
      for (let b = 0; b < rig.recoilBarrels.length; b++) {
        const rec = Math.max(0, Math.sin(p * 2.2 + b * Math.PI)) * 0.28;
        rig.recoilBarrels[b].position.z = 0.76 - rec;
      }
    } else if (this.activeChassis === 'KRAKEN_WALKER' && rig.spiderLegs) {
      // 4-legged diagonal arachnid gait (FL + RR paired, FR + RL counter-paired)
      const [fl, fr, rl, rr] = rig.spiderLegs;
      const gA = Math.sin(p);
      const gB = Math.sin(p + Math.PI);

      fl.rotation.y = 0.48 + gA * 0.28;
      fl.rotation.z = Math.max(0, gA) * 0.18;

      rr.rotation.y = 0.48 - gA * 0.28;
      rr.rotation.z = -Math.max(0, gA) * 0.18;

      fr.rotation.y = -0.48 - gB * 0.28;
      fr.rotation.z = -Math.max(0, gB) * 0.18;

      rl.rotation.y = -0.48 + gB * 0.28;
      rl.rotation.z = Math.max(0, gB) * 0.18;

      rig.bodyGroup.position.y = baseBodyY + Math.sin(p * 2) * 0.08;
      rig.bodyGroup.rotation.z = Math.sin(p) * 0.05;
      for (let b = 0; b < rig.recoilBarrels.length; b++) {
        const rec = Math.max(0, Math.sin(p * 2.0 + b * Math.PI)) * 0.20;
        rig.recoilBarrels[b].position.z = 0.75 - rec;
      }
    }
  }

  public tryBulletHit(
    bx: number,
    bz: number,
    prevBz: number,
    damage: number,
    bossArmorFactor: number,
    lastHitId: number
  ): 'NONE' | 'HIT' | 'DEFEATED' {
    this.lastStepSegmentBroken = false;
    if (!this.active || this.defeated || lastHitId === this.entityId) {
      return 'NONE';
    }

    const hitHalfZ = this.activeChassis === 'SIEGE_TANK' ? 1.65 : 1.45;
    const hitHalfX =
      this.activeChassis === 'KRAKEN_WALKER' || this.activeChassis === 'SIEGE_TANK'
        ? 2.45
        : 2.25;

    const minZ = Math.min(bz, prevBz) - hitHalfZ;
    const maxZ = Math.max(bz, prevBz) + hitHalfZ;
    if (this.z < minZ || this.z > maxZ) {
      return 'NONE';
    }
    if (Math.abs(bx - this.x) > hitHalfX) {
      return 'NONE';
    }

    const segCount = Math.max(1, this.segments);
    const prevSeg = Math.ceil((this.currentHp / Math.max(1, this.maxHp)) * segCount);
    this.currentHp -= damage * bossArmorFactor;
    const nextSeg = Math.ceil(
      (Math.max(0, this.currentHp) / Math.max(1, this.maxHp)) * segCount
    );

    if (this.hitFlashCooldown <= 0) {
      this.hitFlash = 1.0;
      this.hitFlashCooldown = 0.14;
      this.applyFlash(1.0);
    }

    if (this.currentHp <= 0) {
      this.currentHp = 0;
      this.defeated = true;
      this.active = false;
      this.hide();
      return 'DEFEATED';
    }

    if (nextSeg < prevSeg) {
      this.lastStepSegmentBroken = true;
      this.staggerTimer = 0.55;
      this.z -= 1.65;
      this.activeRig.root.position.z = this.z;
    }

    return 'HIT';
  }

  public getRecommendedSafeLaneX(squadX: number): number | null {
    if (!this.active || this.defeated) {
      return null;
    }
    let danger0 = false;
    let danger1 = false;
    let danger2 = false;
    if (this.telegraphTimer > 0) {
      danger0 = this.lockedLaneMask[0];
      danger1 = this.lockedLaneMask[1];
      danger2 = this.lockedLaneMask[2];
    }
    for (let i = 0; i < MAX_BOSS_WARHEADS; i++) {
      const w = this.warheads[i];
      if (w.active) {
        if (w.laneIndex === 0) danger0 = true;
        else if (w.laneIndex === 1) danger1 = true;
        else if (w.laneIndex === 2) danger2 = true;
      }
    }
    if (!danger0 && !danger1 && !danger2) {
      return null;
    }
    let bestX: number | null = null;
    let bestDist = 999;
    const flags = [danger0, danger1, danger2];
    for (let idx = 0; idx < 3; idx++) {
      if (!flags[idx]) {
        const cx = BOSS_SALVO_LANE_CENTERS[idx];
        const d = Math.abs(squadX - cx);
        if (d < bestDist) {
          bestDist = d;
          bestX = cx;
        }
      }
    }
    return bestX;
  }
}
