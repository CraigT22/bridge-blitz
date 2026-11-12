import type { BulletPool } from '../core/ObjectPool';
import type { WeaponTierId } from '../core/types';
import {
  clampSquadCenterX,
  PRECOMPUTED_HONEYCOMB_SLOTS,
} from '../math/formationMath';
import {
  computeSquadVolleyPlan,
  MAX_VISUAL_SOLDIERS,
  WEAPON_SPECS,
} from '../math/weaponMath';

export const SQUAD_MARCH_SPEED = 7.8;

export class SquadController {
  public logicalCount = 1;
  public peakCount = 1;
  public weaponTier: WeaponTierId = 1;
  public x = 0;
  public z = 0;
  public marchPhase = 0;
  public steerBankAngle = 0;
  public recoilImpulse = 0;
  public barrelSpinAngle = 0;

  public readonly soldierWorldX = new Float32Array(MAX_VISUAL_SOLDIERS);
  public readonly soldierWorldZ = new Float32Array(MAX_VISUAL_SOLDIERS);

  private fireCooldown = 0;
  private emitterCursor = 0;
  private pendingBurstTimer = -1;
  private pendingBurstDamage = 0;
  private pendingBurstEmitters = 0;

  public resetForRun(startingSquad: number): void {
    this.logicalCount = Math.max(1, Math.floor(startingSquad));
    this.peakCount = this.logicalCount;
    this.weaponTier = 1;
    this.x = 0;
    this.z = 0;
    this.marchPhase = 0;
    this.steerBankAngle = 0;
    this.recoilImpulse = 0;
    this.barrelSpinAngle = 0;
    this.fireCooldown = 0.08;
    this.emitterCursor = 0;
    this.pendingBurstTimer = -1;

    const vis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    for (let i = 0; i < vis; i++) {
      const slot = PRECOMPUTED_HONEYCOMB_SLOTS[i];
      this.soldierWorldX[i] = this.x + slot.x;
      this.soldierWorldZ[i] = this.z + slot.z;
    }
  }

  public setLogicalCount(nextCount: number): void {
    const prevVis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    this.logicalCount = Math.max(0, Math.floor(nextCount));
    if (this.logicalCount > this.peakCount) {
      this.peakCount = this.logicalCount;
    }
    this.x = clampSquadCenterX(this.x, this.logicalCount);

    const nextVis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    for (let i = prevVis; i < nextVis; i++) {
      const slot = PRECOMPUTED_HONEYCOMB_SLOTS[i];
      // Spawn newly added soldiers near squad center so they fan outward smoothly
      this.soldierWorldX[i] = this.x + slot.x * 0.25;
      this.soldierWorldZ[i] = this.z + slot.z * 0.25;
    }
  }

  public updateMovement(
    dt: number,
    horizontalDelta: number,
    advanceForward: boolean,
    animateMarch: boolean
  ): void {
    if (this.logicalCount <= 0) {
      return;
    }

    const prevX = this.x;
    this.x = clampSquadCenterX(this.x + horizontalDelta, this.logicalCount);
    const actualVelX = dt > 0 ? (this.x - prevX) / dt : 0;
    const targetBank = Math.max(-0.24, Math.min(0.24, actualVelX * 0.022));
    this.steerBankAngle += (targetBank - this.steerBankAngle) * Math.min(1, dt * 14);

    if (this.recoilImpulse > 0) {
      this.recoilImpulse = Math.max(0, this.recoilImpulse - dt * 9.5);
    }

    if (advanceForward) {
      this.z -= SQUAD_MARCH_SPEED * dt;
    }
    if (animateMarch) {
      this.marchPhase += dt;
      this.barrelSpinAngle += dt * (this.weaponTier === 4 ? 24.0 : 4.0);
    } else {
      this.marchPhase += dt * 0.35;
      this.barrelSpinAngle += dt * 3.2;
    }

    const vis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    const followFactor = Math.min(1, dt * 15);
    for (let i = 0; i < vis; i++) {
      const slot = PRECOMPUTED_HONEYCOMB_SLOTS[i];
      const targetX = this.x + slot.x;
      const targetZ = this.z + slot.z;
      this.soldierWorldX[i] += (targetX - this.soldierWorldX[i]) * followFactor;
      this.soldierWorldZ[i] += (targetZ - this.soldierWorldZ[i]) * followFactor;
    }
  }

  /**
   * Fires continuous forward volleys according to equipped weapon pattern & upgrades.
   * Returns true whenever a volley is emitted so audio can trigger gunfire cleanly.
   */
  public updateAutoFire(
    dt: number,
    fireRateMultiplier: number,
    bulletPowerMultiplier: number,
    bulletPool: BulletPool,
    aimYawRadians = 0
  ): boolean {
    if (this.logicalCount <= 0) {
      return false;
    }

    let firedAny = false;
    const spec = WEAPON_SPECS[this.weaponTier];

    // Second round of Lv3 Assault Rifle 2-round burst
    if (this.pendingBurstTimer >= 0) {
      this.pendingBurstTimer -= dt;
      if (this.pendingBurstTimer <= 0) {
        this.pendingBurstTimer = -1;
        this.emitVolleyStream(
          this.pendingBurstEmitters,
          this.pendingBurstDamage,
          spec.spreadRadians,
          false,
          bulletPool,
          aimYawRadians
        );
        firedAny = true;
      }
    }

    this.fireCooldown -= dt;
    if (this.fireCooldown <= 0) {
      const plan = computeSquadVolleyPlan(
        this.logicalCount,
        this.weaponTier,
        fireRateMultiplier,
        bulletPowerMultiplier
      );
      this.fireCooldown = Math.max(0.03, plan.intervalSeconds);

      if (spec.pattern === 'BURST_2') {
        this.emitVolleyStream(
          plan.activeEmitters,
          plan.damagePerProjectile,
          spec.spreadRadians,
          false,
          bulletPool,
          aimYawRadians
        );
        this.pendingBurstTimer = 0.062;
        this.pendingBurstDamage = plan.damagePerProjectile;
        this.pendingBurstEmitters = plan.activeEmitters;
      } else if (spec.pattern === 'TWIN_SPREAD') {
        this.emitVolleyStream(
          plan.activeEmitters,
          plan.damagePerProjectile,
          spec.spreadRadians,
          true,
          bulletPool,
          aimYawRadians
        );
      } else {
        this.emitVolleyStream(
          plan.activeEmitters,
          plan.damagePerProjectile,
          spec.spreadRadians,
          false,
          bulletPool,
          aimYawRadians
        );
      }
      firedAny = true;
    }

    if (firedAny) {
      this.recoilImpulse = 1.0;
    }

    return firedAny;
  }

  private emitVolleyStream(
    emitterCount: number,
    damagePerProjectile: number,
    spreadRad: number,
    twinStream: boolean,
    bulletPool: BulletPool,
    aimYawRadians: number
  ): void {
    const vis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    if (vis <= 0 || emitterCount <= 0) {
      return;
    }

    const spec = WEAPON_SPECS[this.weaponTier];
    const speed = spec.projectileSpeed;
    // Uniform crisp tracer bullet scale across all tiers
    const bulletScale = 1.05;
    const maxAge = 1.30;

    for (let e = 0; e < emitterCount; e++) {
      const soldierIdx = (this.emitterCursor + e) % vis;
      const sx = this.soldierWorldX[soldierIdx] + 0.178;
      const sz = this.soldierWorldZ[soldierIdx] - 0.62;

      if (twinStream) {
        const angLeft = aimYawRadians - spreadRad;
        const vxLeft = Math.sin(angLeft) * speed;
        const vzLeft = -Math.cos(angLeft) * speed;
        bulletPool.spawn(
          sx - 0.07,
          0.56,
          sz,
          vxLeft,
          vzLeft,
          damagePerProjectile,
          spec.pierceCount,
          maxAge,
          bulletScale,
          this.weaponTier,
          spec.colorHex
        );

        const angRight = aimYawRadians + spreadRad;
        const vxRight = Math.sin(angRight) * speed;
        const vzRight = -Math.cos(angRight) * speed;
        bulletPool.spawn(
          sx + 0.07,
          0.56,
          sz,
          vxRight,
          vzRight,
          damagePerProjectile,
          spec.pierceCount,
          maxAge,
          bulletScale,
          this.weaponTier,
          spec.colorHex
        );
      } else {
        const jitterAngle =
          spreadRad > 0 ? (((soldierIdx * 7 + e * 3) % 9) - 4) * 0.25 * spreadRad : 0;
        const totalAngle = aimYawRadians + jitterAngle;
        const vx = Math.sin(totalAngle) * speed;
        const vz = -Math.cos(totalAngle) * speed;
        bulletPool.spawn(
          sx,
          0.56,
          sz,
          vx,
          vz,
          damagePerProjectile,
          spec.pierceCount,
          maxAge,
          bulletScale,
          this.weaponTier,
          spec.colorHex
        );
      }
    }

    this.emitterCursor = (this.emitterCursor + emitterCount) % Math.max(1, vis);
  }
}
