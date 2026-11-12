import type { EnemyWaveDefinition } from '../core/types';
import {
  computeSquadOuterRadius,
  PRECOMPUTED_HONEYCOMB_SLOTS,
} from '../math/formationMath';
import type { InstancedBatchRenderer } from '../rendering/InstancedBatchRenderer';

export class EnemyWaveSlot {
  public readonly entityId: number;
  public active = false;
  public aliveCount = 0;
  public initialCount = 0;
  public hpPerEnemy = 3;
  public frontEnemyHp = 3;
  public speed = 2.4;
  public x = 0;
  public z = 0;
  public marchPhase = 0;
  public hitFlash = 0;
  private contactCooldown = 0;

  constructor(waveIndex: number) {
    this.entityId = 800 + waveIndex;
  }

  public configure(def: EnemyWaveDefinition): void {
    this.active = true;
    this.initialCount = Math.max(1, def.count);
    this.aliveCount = this.initialCount;
    this.hpPerEnemy = Math.max(0.5, def.hpPerEnemy);
    this.frontEnemyHp = this.hpPerEnemy;
    this.speed = def.speed;
    this.x = def.lane === 'LEFT' ? -2.2 : def.lane === 'RIGHT' ? 2.2 : 0;
    this.z = def.z;
    this.marchPhase = 0;
    this.hitFlash = 0;
    this.contactCooldown = 0;
  }

  public hide(): void {
    this.active = false;
    this.aliveCount = 0;
  }

  public get outerRadius(): number {
    return computeSquadOuterRadius(this.aliveCount);
  }

  public update(dt: number, squadX: number, squadZ: number): void {
    if (!this.active || this.aliveCount <= 0) {
      return;
    }

    if (this.hitFlash > 0) {
      this.hitFlash = Math.max(0, this.hitFlash - dt * 7);
    }
    if (this.contactCooldown > 0) {
      this.contactCooldown = Math.max(0, this.contactCooldown - dt);
    }

    // Begin marching down the bridge once within 95m of the squad
    if (squadZ - this.z < 95) {
      this.z += this.speed * dt;
      // Subtle homing drift toward the player's squad when within 28m
      if (squadZ - this.z < 28 && squadZ - this.z > -3) {
        const dx = squadX - this.x;
        this.x += Math.sign(dx) * Math.min(Math.abs(dx), 1.65 * dt);
      }
      this.marchPhase += dt * 9.5;
    }

    // Despawn cleanly if somehow passed far behind camera
    if (this.z > squadZ + 18) {
      this.hide();
    }
  }

  public pushInstances(renderer: InstancedBatchRenderer): void {
    if (!this.active || this.aliveCount <= 0) {
      return;
    }
    const vis = Math.min(this.aliveCount, PRECOMPUTED_HONEYCOMB_SLOTS.length);
    for (let i = 0; i < vis; i++) {
      const slot = PRECOMPUTED_HONEYCOMB_SLOTS[i];
      renderer.pushEnemySoldier(
        this.x + slot.x,
        this.z + slot.z,
        this.marchPhase + i * 0.7,
        this.hitFlash
      );
    }
  }

  /**
   * Applies bullet damage to front troopers; returns number of enemy troopers eliminated by this hit,
   * or -1 if bullet missed this wave.
   */
  public tryBulletHit(
    bx: number,
    bz: number,
    prevBz: number,
    damage: number,
    lastHitId: number
  ): number {
    if (!this.active || this.aliveCount <= 0 || lastHitId === this.entityId) {
      return -1;
    }

    const rad = this.outerRadius + 0.42;
    const minZ = Math.min(bz, prevBz) - rad;
    const maxZ = Math.max(bz, prevBz) + rad;
    if (this.z < minZ || this.z > maxZ) {
      return -1;
    }
    if (Math.abs(bx - this.x) > rad) {
      return -1;
    }

    this.hitFlash = 1.0;
    let remainingDamage = damage;
    let kills = 0;

    while (remainingDamage > 0 && this.aliveCount > 0) {
      if (remainingDamage >= this.frontEnemyHp) {
        remainingDamage -= this.frontEnemyHp;
        this.aliveCount--;
        kills++;
        this.frontEnemyHp = this.hpPerEnemy;
      } else {
        this.frontEnemyHp -= remainingDamage;
        remainingDamage = 0;
      }
    }

    if (this.aliveCount <= 0) {
      this.active = false;
    }

    return kills;
  }

  /**
   * 1-for-1 soldier cancellation when surviving enemies physically collide with player soldiers.
   * Returns the number of mutually cancelled soldiers this tick.
   */
  public resolveSquadCollision(
    squadX: number,
    squadZ: number,
    playerLogicalSquad: number
  ): number {
    if (!this.active || this.aliveCount <= 0 || playerLogicalSquad <= 0) {
      return 0;
    }
    if (this.contactCooldown > 0) {
      return 0;
    }

    const combinedR = this.outerRadius + computeSquadOuterRadius(playerLogicalSquad) + 0.15;
    const dz = Math.abs(this.z - squadZ);
    const dx = Math.abs(this.x - squadX);
    if (dz > combinedR * 0.85 || dx > combinedR) {
      return 0;
    }

    // Cancel 1-for-1 rapidly on contact (up to 4 per tick for large armies so collisions feel crisp)
    const maxStepCancel = Math.max(1, Math.min(4, Math.ceil(this.aliveCount * 0.25)));
    const cancelled = Math.min(playerLogicalSquad, this.aliveCount, maxStepCancel);
    this.aliveCount -= cancelled;
    this.contactCooldown = 0.065;

    if (this.aliveCount <= 0) {
      this.active = false;
    }
    return cancelled;
  }
}
