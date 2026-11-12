import * as THREE from 'three';
import type { BossChassisId, BossDefinition } from '../core/types';
import {
  createAllBossChassisRigs,
  type BossChassisRig,
} from '../rendering/BossRigFactory';

export const BOSS_SALVO_LANE_CENTERS = [-3.1, 0.0, 3.1] as const;
export const BOSS_SALVO_HIT_HALF_WIDTH = 1.35;
export const BOSS_TELEGRAPH_DURATION = 0.95;
const BOSS_WARHEAD_SPEED = 25.0;
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

/**
 * Pure zero-allocation Boss lane targeting selector:
 * - Always locks onto the player's current lane so AFK standing never avoids Boss salvos.
 * - Strictly guarantees at least 1 safe open lane on every 1-lane and 2-lane salvo.
 */
export function selectBossSalvoLaneMask(
  squadX: number,
  salvoLanes: 1 | 2,
  cycleIndex: number
): LaneMask3 {
  const playerLane: 0 | 1 | 2 = squadX < -1.15 ? 0 : squadX > 1.15 ? 2 : 1;
  if (salvoLanes === 1) {
    return SINGLE_LANE_MASKS[playerLane];
  }
  const parity = Math.abs(Math.floor(cycleIndex)) % 2;
  return DUAL_LANE_MASKS_BY_PLAYER[playerLane][parity];
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
}

export class BossEntity {
  public readonly entityId = 999;
  public readonly rigs: Record<BossChassisId, BossChassisRig>;
  public activeChassis: BossChassisId = 'WARDEN_MECH';
  public active = false;
  public defeated = false;
  public name = 'Iron Warden Mk-I';
  public maxHp = 1100;
  public currentHp = 1100;
  public segments = 5;
  public advanceSpeed = 1.25;
  public salvoLanes: 1 | 2 = 1;
  public salvoInterval = 2.5;
  public salvoDamage = 5;
  public rewardCoins = 75;
  public x = 0;
  public z = -280;

  private walkPhase = 0;
  private lastFootstepCycle = 0;
  private hitFlash = 0;
  private hitFlashCooldown = 0;
  private slamTimer = 0;
  private barrelSpin = 0;

  // Telegraphed Lane Salvo State (Zero-GC pre-allocated pools)
  private readonly laneVisuals: TelegraphLaneVisual[] = [];
  private readonly warheads: BossWarheadSlot[] = [];
  private lockedLaneMask: LaneMask3 = [false, false, false];
  private telegraphTimer = 0;
  private salvoCooldown = 0.85;
  private salvoCycleIndex = 0;

  public lastStepTriggeredShake = false;
  public lastStepSlamDamage = 0;
  public lastStepSalvoWarning = false;
  public lastStepSalvoLaunched = false;
  public lastStepSalvoHitDamage = 0;
  public lastStepSalvoHitX = 0;
  public lastStepSalvoDodgedCount = 0;
  public lastStepSalvoDodgeX = 0;

  constructor(scene: THREE.Scene) {
    this.rigs = createAllBossChassisRigs();
    for (const key of Object.keys(this.rigs) as BossChassisId[]) {
      this.rigs[key].root.visible = false;
      scene.add(this.rigs[key].root);
    }

    // 1. Pre-allocate 3 Roadway Crimson Hazard Telegraph Strips
    const carpetGeo = new THREE.PlaneGeometry(2.44, 1.0);
    carpetGeo.rotateX(-Math.PI / 2);
    const railGeo = new THREE.PlaneGeometry(0.14, 1.0);
    railGeo.rotateX(-Math.PI / 2);
    const reticleGeo = new THREE.RingGeometry(0.55, 1.08, 24);
    reticleGeo.rotateX(-Math.PI / 2);

    for (let lane = 0; lane < 3; lane++) {
      const root = new THREE.Group();
      root.visible = false;

      const carpetMat = new THREE.MeshBasicMaterial({
        color: 0xff2942,
        transparent: true,
        opacity: 0.24,
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
      leftRail.position.x = -1.22;
      const rightRail = new THREE.Mesh(railGeo, railMat);
      rightRail.position.x = 1.22;
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

    // 2. Pre-allocate Boss Salvo Warhead Pool (Glowing Crimson/Amber Plasma Shells)
    const coreGeo = new THREE.OctahedronGeometry(0.42, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffdf7e,
    });
    const shellGeo = new THREE.OctahedronGeometry(0.62, 0);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0xff2e4c,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wakeGeo = new THREE.ConeGeometry(0.46, 2.1, 10);
    wakeGeo.rotateX(-Math.PI / 2);
    const wakeMat = new THREE.MeshBasicMaterial({
      color: 0xff5e2b,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const groundHaloGeo = new THREE.RingGeometry(0.32, 0.92, 18);
    groundHaloGeo.rotateX(-Math.PI / 2);
    const groundHaloMat = new THREE.MeshBasicMaterial({
      color: 0xff384c,
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
      const shellMesh = new THREE.Mesh(shellGeo, shellMat);
      shellMesh.position.y = 0.92;
      coreMesh.add(shellMesh);

      const wakeMesh = new THREE.Mesh(wakeGeo, wakeMat);
      wakeMesh.position.set(0, 0.92, -1.05);

      const groundHalo = new THREE.Mesh(groundHaloGeo, groundHaloMat);
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
      });
    }
  }

  public get activeRig(): BossChassisRig {
    return this.rigs[this.activeChassis];
  }

  public get isTelegraphingSalvo(): boolean {
    return this.telegraphTimer > 0;
  }

  public configure(def: BossDefinition, trackLength: number): void {
    this.active = true;
    this.defeated = false;
    this.name = def.name;
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
    this.z = -trackLength - 16.5;
    this.walkPhase = 0;
    this.lastFootstepCycle = 0;
    this.hitFlash = 0;
    this.hitFlashCooldown = 0;
    this.slamTimer = 0;
    this.barrelSpin = 0;

    this.clearSalvoVisuals();
    this.salvoCooldown = 0.85;
    this.salvoCycleIndex = 0;

    for (const key of Object.keys(this.rigs) as BossChassisId[]) {
      const rig = this.rigs[key];
      const isSelected = key === def.chassis;
      rig.root.visible = isSelected;
      if (isSelected) {
        rig.primaryMat.color.setHex(def.primaryHex);
        rig.accentMat.color.setHex(def.accentHex);
        rig.trimMat.color.setHex(def.trimHex);
        rig.glowMat.color.setHex(def.trimHex);
        rig.bodyGroup.rotation.set(0, 0, 0);
        if (rig.leftLeg) rig.leftLeg.rotation.set(0, 0, 0);
        if (rig.rightLeg) rig.rightLeg.rotation.set(0, 0, 0);
        if (rig.turretGroup) rig.turretGroup.rotation.set(0, 0, 0);
        if (rig.meleeArm) rig.meleeArm.rotation.set(0, 0, 0);
        rig.root.position.set(this.x, 0, this.z);
      }
    }

    this.applyFlash(0);
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
    this.clearSalvoVisuals();
    for (const key of Object.keys(this.rigs) as BossChassisId[]) {
      this.rigs[key].root.visible = false;
    }
  }

  private applyFlash(amount: number): void {
    const rig = this.activeRig;
    const baseGlow = amount * 0.14;
    const trimGlow = amount * 0.30;
    rig.primaryMat.emissive.setRGB(baseGlow, baseGlow * 0.65, baseGlow * 0.45);
    rig.darkSteelMat.emissive.setRGB(baseGlow * 0.6, baseGlow * 0.4, baseGlow * 0.3);
    rig.accentMat.emissive.setRGB(trimGlow, trimGlow * 0.62, trimGlow * 0.25);
    rig.trimMat.emissive.setRGB(trimGlow, trimGlow * 0.72, trimGlow * 0.35);
  }

  public update(
    dt: number,
    inBossFight: boolean,
    squadX: number,
    squadZ: number,
    currentSquad: number
  ): void {
    this.lastStepTriggeredShake = false;
    this.lastStepSlamDamage = 0;
    this.lastStepSalvoWarning = false;
    this.lastStepSalvoLaunched = false;
    this.lastStepSalvoHitDamage = 0;
    this.lastStepSalvoDodgedCount = 0;

    if (!this.active || this.defeated) {
      return;
    }

    const rig = this.activeRig;

    if (this.hitFlashCooldown > 0) {
      this.hitFlashCooldown = Math.max(0, this.hitFlashCooldown - dt);
    }
    if (this.hitFlash > 0) {
      this.hitFlash = Math.max(0, this.hitFlash - dt * 16);
      this.applyFlash(this.hitFlash);
    }

    // Spin rotary cannons / turbines across all chassis (faster spin during telegraph charge-up!)
    const spinRate = this.telegraphTimer > 0 ? 30.0 : inBossFight ? 18.5 : 3.5;
    this.barrelSpin += dt * spinRate;
    for (let i = 0; i < rig.spinClusters.length; i++) {
      const sign = i % 2 === 0 ? 1 : -1;
      if (this.activeChassis === 'KRAKEN_WALKER') {
        rig.spinClusters[i].rotation.y = this.barrelSpin * 0.5;
      } else {
        rig.spinClusters[i].rotation.z = this.barrelSpin * sign;
      }
    }

    // Pulse ground threat ring
    const ringPulse = 1 + Math.sin(this.barrelSpin * 0.32) * 0.06;
    rig.hazardRing.scale.set(ringPulse, ringPulse, 1);

    const baseBodyY =
      this.activeChassis === 'SIEGE_TANK'
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
      if (rig.wingPylons) {
        const flap = Math.sin(this.walkPhase * 0.9) * 0.06;
        rig.wingPylons[0].rotation.z = 0.42 + flap;
        rig.wingPylons[1].rotation.z = -0.42 - flap;
      }
      return;
    }

    const stopZ = squadZ - 2.35;
    if (this.z < stopZ) {
      this.z = Math.min(stopZ, this.z + this.advanceSpeed * dt);
      const targetBossX = Math.max(-1.55, Math.min(1.55, squadX * 0.55));
      const dx = targetBossX - this.x;
      this.x += Math.sign(dx) * Math.min(Math.abs(dx), 1.25 * dt);

      const phaseRate = this.activeChassis === 'KRAKEN_WALKER' ? 6.6 : 4.6;
      this.walkPhase += dt * phaseRate;
      const cycle = Math.floor(this.walkPhase / Math.PI);
      if (cycle !== this.lastFootstepCycle) {
        this.lastFootstepCycle = cycle;
        this.lastStepTriggeredShake = true;
      }

      this.animateChassisAdvance(rig, baseBodyY, squadX);
    } else if (currentSquad > 0) {
      // Boss reached melee range — heavy chassis slam / ram / halberd cleave!
      this.slamTimer -= dt;
      if (this.slamTimer <= 0) {
        this.slamTimer = 0.22;
        this.lastStepTriggeredShake = true;
        this.lastStepSlamDamage = Math.max(2, Math.ceil(currentSquad * 0.28));
      }
      rig.bodyGroup.position.y = baseBodyY + Math.sin(this.slamTimer * 30) * 0.18;
      rig.bodyGroup.rotation.x = 0.15 + Math.sin(this.slamTimer * 30) * 0.09;
      if (rig.meleeArm) {
        rig.meleeArm.rotation.x = 0.55 + Math.sin(this.slamTimer * 30) * 0.65;
      }
    }

    rig.root.position.set(this.x, 0, this.z);

    // Update Telegraphed Lane Salvos & In-Flight Boss Warheads
    this.updateSalvoAttacks(dt, squadX, squadZ, currentSquad);
  }

  private updateSalvoAttacks(
    dt: number,
    squadX: number,
    squadZ: number,
    currentSquad: number
  ): void {
    // 1. Trigger or advance Telegraph Phase while Boss is at ranged engagement distance
    if (this.telegraphTimer > 0) {
      this.telegraphTimer += dt;
      if (this.telegraphTimer >= BOSS_TELEGRAPH_DURATION) {
        this.telegraphTimer = 0;
        this.salvoCooldown = this.salvoInterval;
        this.spawnSalvoWarheads();
        this.lastStepSalvoLaunched = true;
      }
    } else if (currentSquad > 0 && this.z < squadZ - 4.5) {
      this.salvoCooldown -= dt;
      if (this.salvoCooldown <= 0) {
        this.lockedLaneMask = selectBossSalvoLaneMask(
          squadX,
          this.salvoLanes,
          this.salvoCycleIndex++
        );
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
      w.z += BOSS_WARHEAD_SPEED * dt;
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
      ? Math.min(1, this.telegraphTimer / BOSS_TELEGRAPH_DURATION)
      : 1;
    const pulse = isCharging
      ? 0.55 + 0.45 * Math.sin(chargeRatio * Math.PI * 7)
      : 0.55;

    const zStart = this.z + 1.4;
    const zEnd = squadZ + 1.5;
    const stripLen = Math.max(2.0, zEnd - zStart);
    const stripMidZ = (zStart + zEnd) * 0.5;

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
      vis.carpetGroup.position.set(laneX, 0.042, stripMidZ);
      vis.carpetGroup.scale.set(1, 1, stripLen);

      vis.carpetMat.opacity = isCharging
        ? 0.16 + 0.24 * chargeRatio * pulse
        : 0.15;
      vis.railMat.opacity = isCharging ? 0.48 + 0.48 * pulse : 0.42;

      const retScale = isCharging ? 1.25 - 0.35 * chargeRatio : 0.92;
      vis.reticleRing.position.set(laneX, 0.052, squadZ);
      vis.reticleRing.scale.set(retScale, retScale, 1);
      vis.reticleMat.opacity = isCharging ? 0.5 + 0.45 * pulse : 0.45;
    }
  }

  private spawnSalvoWarheads(): void {
    const launchZ = this.z + 1.5;
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
          w.damage = this.salvoDamage;
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
    if (!this.active || this.defeated || lastHitId === this.entityId) {
      return 'NONE';
    }

    const hitHalfZ = this.activeChassis === 'SIEGE_TANK' ? 1.65 : 1.45;
    const hitHalfX =
      this.activeChassis === 'KRAKEN_WALKER' || this.activeChassis === 'SIEGE_TANK'
        ? 2.25
        : 2.05;

    const minZ = Math.min(bz, prevBz) - hitHalfZ;
    const maxZ = Math.max(bz, prevBz) + hitHalfZ;
    if (this.z < minZ || this.z > maxZ) {
      return 'NONE';
    }
    if (Math.abs(bx - this.x) > hitHalfX) {
      return 'NONE';
    }

    this.currentHp -= damage * bossArmorFactor;
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

    return 'HIT';
  }
}
