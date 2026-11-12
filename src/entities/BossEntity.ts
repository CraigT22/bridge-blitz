import * as THREE from 'three';
import type { BossChassisId, BossDefinition } from '../core/types';
import {
  createAllBossChassisRigs,
  type BossChassisRig,
} from '../rendering/BossRigFactory';

export class BossEntity {
  public readonly entityId = 999;
  public readonly rigs: Record<BossChassisId, BossChassisRig>;
  public activeChassis: BossChassisId = 'WARDEN_MECH';
  public active = false;
  public defeated = false;
  public name = 'Iron Warden Mk-I';
  public maxHp = 250;
  public currentHp = 250;
  public segments = 5;
  public advanceSpeed = 2.0;
  public rewardCoins = 70;
  public x = 0;
  public z = -220;

  private walkPhase = 0;
  private lastFootstepCycle = 0;
  private hitFlash = 0;
  private hitFlashCooldown = 0;
  private slamTimer = 0;
  private barrelSpin = 0;

  public lastStepTriggeredShake = false;
  public lastStepSlamDamage = 0;

  constructor(scene: THREE.Scene) {
    this.rigs = createAllBossChassisRigs();
    for (const key of Object.keys(this.rigs) as BossChassisId[]) {
      this.rigs[key].root.visible = false;
      scene.add(this.rigs[key].root);
    }
  }

  public get activeRig(): BossChassisRig {
    return this.rigs[this.activeChassis];
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
    this.rewardCoins = def.rewardCoins;
    this.x = 0;
    this.z = -trackLength - 13.5;
    this.walkPhase = 0;
    this.lastFootstepCycle = 0;
    this.hitFlash = 0;
    this.hitFlashCooldown = 0;
    this.slamTimer = 0;
    this.barrelSpin = 0;

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

  public hide(): void {
    this.active = false;
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

    // Spin rotary cannons / turbines across all chassis
    this.barrelSpin += dt * (inBossFight ? 18.5 : 3.5);
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
      const dx = squadX - this.x;
      this.x += Math.sign(dx) * Math.min(Math.abs(dx), 1.45 * dt);

      const phaseRate = this.activeChassis === 'KRAKEN_WALKER' ? 7.4 : 5.2;
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
        this.slamTimer = 0.16;
        this.lastStepTriggeredShake = true;
        this.lastStepSlamDamage = Math.max(2, Math.ceil(currentSquad * 0.28));
      }
      rig.bodyGroup.position.y = baseBodyY + Math.sin(this.slamTimer * 35) * 0.18;
      rig.bodyGroup.rotation.x = 0.15 + Math.sin(this.slamTimer * 35) * 0.09;
      if (rig.meleeArm) {
        rig.meleeArm.rotation.x = 0.55 + Math.sin(this.slamTimer * 35) * 0.65;
      }
    }

    rig.root.position.set(this.x, 0, this.z);
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
        ? 2.05
        : 1.85;

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
