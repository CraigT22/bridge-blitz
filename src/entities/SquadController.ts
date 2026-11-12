import type { BulletPool } from '../core/ObjectPool';
import type { WeaponTierId } from '../core/types';
import {
  clampSquadCenterX,
  getEliteFormationOffset,
} from '../math/formationMath';
import {
  COMMANDO_MODEL_SCALE,
  computeSquadVolleyPlan,
  MAX_SQUAD_COUNT,
  MAX_VISUAL_SOLDIERS,
  WEAPON_SPECS,
} from '../math/weaponMath';

export const SQUAD_MARCH_SPEED = 6.5;

const _slotOffset = { x: 0, z: 0 };

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
    this.logicalCount = Math.max(1, Math.min(MAX_SQUAD_COUNT, Math.floor(startingSquad)));
    this.peakCount = this.logicalCount;
    this.weaponTier = 1;
    this.x = 0;
    this.z = 0;
    this.marchPhase = 0;
    this.steerBankAngle = 0;
    this.recoilImpulse = 0;
    this.barrelSpinAngle = 0;
    this.fireCooldown = 0.06;
    this.emitterCursor = 0;
    this.pendingBurstTimer = -1;

    const vis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    for (let i = 0; i < vis; i++) {
      getEliteFormationOffset(i, vis, _slotOffset);
      this.soldierWorldX[i] = this.x + _slotOffset.x;
      this.soldierWorldZ[i] = this.z + _slotOffset.z;
    }
  }

  /**
   * Updates elite squad count (clamped to MAX_SQUAD_COUNT = 10) and returns any overflow commandos
   * above the cap so the caller can convert excess reinforcements into bonus War Chest coins!
   */
  public setLogicalCount(nextCount: number): number {
    const prevVis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    const floored = Math.max(0, Math.floor(nextCount));
    const overflow = Math.max(0, floored - MAX_SQUAD_COUNT);
    this.logicalCount = Math.min(MAX_SQUAD_COUNT, floored);

    if (this.logicalCount > this.peakCount) {
      this.peakCount = this.logicalCount;
    }
    this.x = clampSquadCenterX(this.x, this.logicalCount);

    const nextVis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    for (let i = prevVis; i < nextVis; i++) {
      getEliteFormationOffset(i, nextVis, _slotOffset);
      this.soldierWorldX[i] = this.x + _slotOffset.x * 0.25;
      this.soldierWorldZ[i] = this.z + _slotOffset.z * 0.25;
    }

    return overflow;
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
    const targetBank = Math.max(-0.22, Math.min(0.22, actualVelX * 0.02));
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
      getEliteFormationOffset(i, vis, _slotOffset);
      const targetX = this.x + _slotOffset.x;
      const targetZ = this.z + _slotOffset.z;
      this.soldierWorldX[i] += (targetX - this.soldierWorldX[i]) * followFactor;
      this.soldierWorldZ[i] += (targetZ - this.soldierWorldZ[i]) * followFactor;
    }
  }

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
    const bulletScale = 1.24;
    const maxAge = 1.32;
    const muzzleOffsetX = 0.255 * COMMANDO_MODEL_SCALE;
    const muzzleY = 0.548 * COMMANDO_MODEL_SCALE;
    const muzzleOffsetZ = -0.68 * COMMANDO_MODEL_SCALE;

    for (let e = 0; e < emitterCount; e++) {
      const soldierIdx = (this.emitterCursor + e) % vis;
      const sx = this.soldierWorldX[soldierIdx] + muzzleOffsetX;
      const sz = this.soldierWorldZ[soldierIdx] + muzzleOffsetZ;

      if (twinStream) {
        const angLeft = aimYawRadians - spreadRad;
        bulletPool.spawn(
          sx - 0.08,
          muzzleY,
          sz,
          Math.sin(angLeft) * speed,
          -Math.cos(angLeft) * speed,
          damagePerProjectile,
          spec.pierceCount,
          maxAge,
          bulletScale,
          this.weaponTier,
          spec.colorHex
        );

        const angRight = aimYawRadians + spreadRad;
        bulletPool.spawn(
          sx + 0.08,
          muzzleY,
          sz,
          Math.sin(angRight) * speed,
          -Math.cos(angRight) * speed,
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
        bulletPool.spawn(
          sx,
          muzzleY,
          sz,
          Math.sin(totalAngle) * speed,
          -Math.cos(totalAngle) * speed,
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
