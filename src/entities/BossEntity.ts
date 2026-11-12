import * as THREE from 'three';
import type { BossDefinition } from '../core/types';
import { createBossMechRig, type BossMechRig } from '../rendering/ProceduralGeometries';

export class BossEntity {
  public readonly entityId = 999;
  public readonly rig: BossMechRig;
  public active = false;
  public defeated = false;
  public name = 'Commander Mech';
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
  private slamTimer = 0;
  private barrelSpin = 0;

  constructor(scene: THREE.Scene) {
    this.rig = createBossMechRig();
    this.rig.root.visible = false;
    scene.add(this.rig.root);
  }

  public configure(def: BossDefinition, trackLength: number): void {
    this.active = true;
    this.defeated = false;
    this.name = def.name;
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
    this.slamTimer = 0;
    this.barrelSpin = 0;

    this.rig.leftLeg.rotation.set(0, 0, 0);
    this.rig.rightLeg.rotation.set(0, 0, 0);
    this.rig.torsoGroup.rotation.set(0, 0, 0);
    this.rig.root.position.set(this.x, 0, this.z);
    this.rig.root.visible = true;
    this.applyFlash(0);
  }

  public hide(): void {
    this.active = false;
    this.rig.root.visible = false;
  }

  private applyFlash(amount: number): void {
    const g = amount * 0.72;
    for (let i = 0; i < this.rig.flashMaterials.length; i++) {
      this.rig.flashMaterials[i].emissive.setRGB(g, g * 0.78, g * 0.65);
    }
  }

  /**
   * Advances the Boss during BOSS_FIGHT.
   * Exposes scalar flags without allocating objects per frame.
   */
  public lastStepTriggeredShake = false;
  public lastStepSlamDamage = 0;

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

    if (this.hitFlash > 0) {
      this.hitFlash = Math.max(0, this.hitFlash - dt * 8);
      this.applyFlash(this.hitFlash);
    }

    // Spin twin 6-barrel rotary Vulcan cannons (high-RPM during Boss Fight!)
    this.barrelSpin += dt * (inBossFight ? 18.0 : 3.2);
    this.rig.leftGatlingSpin.rotation.z = this.barrelSpin;
    this.rig.rightGatlingSpin.rotation.z = -this.barrelSpin;

    // Pulse ground threat ring
    const ringPulse = 1 + Math.sin(this.barrelSpin * 0.35) * 0.06;
    this.rig.hazardRing.scale.set(ringPulse, ringPulse, 1);

    if (!inBossFight) {
      // Heavy hydraulic idle breathing on platform before squad arrives
      this.walkPhase += dt * 2.2;
      this.rig.torsoGroup.position.y = 1.55 + Math.sin(this.walkPhase) * 0.05;
      this.rig.torsoGroup.rotation.x = 0;
      return;
    }

    const stopZ = squadZ - 2.1;
    if (this.z < stopZ) {
      this.z = Math.min(stopZ, this.z + this.advanceSpeed * dt);
      const dx = squadX - this.x;
      this.x += Math.sign(dx) * Math.min(Math.abs(dx), 1.35 * dt);

      this.walkPhase += dt * 5.2;
      const cycle = Math.floor(this.walkPhase / Math.PI);
      if (cycle !== this.lastFootstepCycle) {
        this.lastFootstepCycle = cycle;
        this.lastStepTriggeredShake = true;
      }

      const swing = Math.sin(this.walkPhase) * 0.36;
      this.rig.leftLeg.rotation.x = swing;
      this.rig.rightLeg.rotation.x = -swing;
      this.rig.torsoGroup.position.y = 1.55 + Math.abs(Math.cos(this.walkPhase)) * 0.11;
      this.rig.torsoGroup.rotation.x = 0.06 + Math.abs(Math.sin(this.walkPhase)) * 0.04;
      this.rig.torsoGroup.rotation.z = Math.sin(this.walkPhase) * 0.035;
    } else if (currentSquad > 0) {
      // Boss has reached melee range — hydraulic slam attack wipes soldiers rapidly!
      this.slamTimer -= dt;
      if (this.slamTimer <= 0) {
        this.slamTimer = 0.16;
        this.lastStepTriggeredShake = true;
        this.lastStepSlamDamage = Math.max(2, Math.ceil(currentSquad * 0.28));
      }
      this.rig.torsoGroup.position.y = 1.55 + Math.sin(this.slamTimer * 35) * 0.18;
      this.rig.torsoGroup.rotation.x = 0.14 + Math.sin(this.slamTimer * 35) * 0.08;
    }

    this.rig.root.position.set(this.x, 0, this.z);
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

    const minZ = Math.min(bz, prevBz) - 1.35;
    const maxZ = Math.max(bz, prevBz) + 1.35;
    if (this.z < minZ || this.z > maxZ) {
      return 'NONE';
    }
    if (Math.abs(bx - this.x) > 1.85) {
      return 'NONE';
    }

    this.currentHp -= damage * bossArmorFactor;
    this.hitFlash = 1.0;
    this.applyFlash(1.0);

    if (this.currentHp <= 0) {
      this.currentHp = 0;
      this.defeated = true;
      this.active = false;
      this.rig.root.visible = false;
      return 'DEFEATED';
    }

    return 'HIT';
  }
}
