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

    this.rig.root.position.set(this.x, 0, this.z);
    this.rig.root.visible = true;
    this.applyFlash(0);
  }

  public hide(): void {
    this.active = false;
    this.rig.root.visible = false;
  }

  private applyFlash(amount: number): void {
    const g = amount * 0.7;
    for (let i = 0; i < this.rig.flashMaterials.length; i++) {
      this.rig.flashMaterials[i].emissive.setRGB(g, g * 0.85, g * 0.85);
    }
  }

  /**
   * Advances the Boss during BOSS_FIGHT.
   * Returns `{ footstepShake, slamSoldierLoss }` without allocating objects by writing to scalar fields.
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

    if (!inBossFight) {
      // Subtle idle breathing on platform before squad arrives
      this.walkPhase += dt * 2.2;
      this.rig.torsoGroup.position.y = 1.55 + Math.sin(this.walkPhase) * 0.05;
      return;
    }

    const stopZ = squadZ - 2.1;
    if (this.z < stopZ) {
      this.z = Math.min(stopZ, this.z + this.advanceSpeed * dt);
      // Track squad laterally very slightly so Boss looms directly toward the army
      const dx = squadX - this.x;
      this.x += Math.sign(dx) * Math.min(Math.abs(dx), 1.35 * dt);

      this.walkPhase += dt * 5.2;
      const cycle = Math.floor(this.walkPhase / Math.PI);
      if (cycle !== this.lastFootstepCycle) {
        this.lastFootstepCycle = cycle;
        this.lastStepTriggeredShake = true;
      }

      const swing = Math.sin(this.walkPhase) * 0.35;
      this.rig.leftLeg.rotation.x = swing;
      this.rig.rightLeg.rotation.x = -swing;
      this.rig.torsoGroup.position.y = 1.55 + Math.abs(Math.cos(this.walkPhase)) * 0.1;
    } else if (currentSquad > 0) {
      // Boss has reached melee range — slam attack wipes soldiers rapidly!
      this.slamTimer -= dt;
      if (this.slamTimer <= 0) {
        this.slamTimer = 0.16;
        this.lastStepTriggeredShake = true;
        this.lastStepSlamDamage = Math.max(2, Math.ceil(currentSquad * 0.28));
      }
      this.rig.torsoGroup.position.y = 1.55 + Math.sin(this.slamTimer * 35) * 0.18;
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
