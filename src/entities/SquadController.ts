import type { BulletPool } from '../core/ObjectPool';
import type { WeaponTierId } from '../core/types';
import {
  clampSquadCenterX,
  getEliteFormationOffset,
} from '../math/formationMath';
import {
  COMMANDO_MODEL_SCALE,
  computeConvergingShotTrajectory,
  computeSquadVolleyPlan,
  FOCAL_CONVERGENCE_DISTANCE,
  MAX_SQUAD_COUNT,
  MAX_VISUAL_SOLDIERS,
  WEAPON_SPECS,
  type ConvergingShotTrajectory,
} from '../math/weaponMath';

export const SQUAD_MARCH_SPEED = 6.5;

const _slotOffset = { x: 0, z: 0 };
const _shotTraj: ConvergingShotTrajectory = { vx: 0, vz: 0, maxAge: 1 };

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
   * Updates elite squad count (clamped to MAX_SQUAD_COUNT = 40) and returns any overflow commandos
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
      const rawTargetX = this.x + _slotOffset.x;
      const clampedTargetX = Math.max(
        -4.38 + (i % 3) * 0.08,
        Math.min(4.38 - (i % 3) * 0.08, rawTargetX)
      );
      const targetZ = this.z + _slotOffset.z;
      this.soldierWorldX[i] += (clampedTargetX - this.soldierWorldX[i]) * followFactor;
      this.soldierWorldZ[i] += (targetZ - this.soldierWorldZ[i]) * followFactor;
    }
  }

  /**
   * Smoothly funnels outer crowd soldiers around standing unbroken barrels & sibling Tire Stacks
   * when the squad marches through an adjacent breached corridor!
   */
  public funnelAroundStandingObstacle(
    obsX: number,
    obsZ: number,
    radiusX: number,
    radiusZ: number,
    dt: number
  ): void {
    const vis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    if (vis <= 0) {
      return;
    }
    const pushSign = this.x >= obsX ? 1 : -1;
    const blend = Math.min(1, dt * 22);
    const padX = radiusX + 0.32;
    const padZ = radiusZ + 0.65;

    for (let i = 0; i < vis; i++) {
      const sz = this.soldierWorldZ[i];
      const dz = Math.abs(sz - obsZ);
      if (dz > padZ) {
        continue;
      }
      const sx = this.soldierWorldX[i];
      const dx = sx - obsX;
      if (Math.abs(dx) < padX) {
        const edgeX = obsX + pushSign * (padX + (i % 3) * 0.07);
        const safeEdgeX = Math.max(-4.38, Math.min(4.38, edgeX));
        this.soldierWorldX[i] += (safeEdgeX - sx) * blend;
      }
    }
  }

  public updateAutoFire(
    dt: number,
    fireRateMultiplier: number,
    bulletPowerMultiplier: number,
    bulletPool: BulletPool,
    focalX = this.x,
    focalZ = this.z - FOCAL_CONVERGENCE_DISTANCE,
    marchingForward = true
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
          focalX,
          focalZ,
          marchingForward
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
          focalX,
          focalZ,
          marchingForward
        );
        this.pendingBurstTimer = 0.062;
        this.pendingBurstDamage = plan.damagePerProjectile;
        this.pendingBurstEmitters = plan.activeEmitters;
      } else if (spec.pattern === 'TWIN_CONVERGE') {
        this.emitVolleyStream(
          plan.activeEmitters,
          plan.damagePerProjectile,
          spec.spreadRadians,
          true,
          bulletPool,
          focalX,
          focalZ,
          marchingForward
        );
      } else {
        this.emitVolleyStream(
          plan.activeEmitters,
          plan.damagePerProjectile,
          spec.spreadRadians,
          false,
          bulletPool,
          focalX,
          focalZ,
          marchingForward
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
    apexJitterMeters: number,
    twinStream: boolean,
    bulletPool: BulletPool,
    focalX: number,
    focalZ: number,
    marchingForward: boolean
  ): void {
    const vis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    if (vis <= 0 || emitterCount <= 0) {
      return;
    }

    const spec = WEAPON_SPECS[this.weaponTier];
    const speed = spec.projectileSpeed;
    const bulletScale = 1.24;
    const muzzleLocalX = 0.255 * COMMANDO_MODEL_SCALE;
    const muzzleY = 0.548 * COMMANDO_MODEL_SCALE;
    const muzzleLocalZ = -0.68 * COMMANDO_MODEL_SCALE;
    const frontMuzzleZ = this.z + muzzleLocalZ;

    for (let e = 0; e < emitterCount; e++) {
      const soldierIdx = (this.emitterCursor + e) % vis;
      const soldierX = this.soldierWorldX[soldierIdx];
      const soldierZ = this.soldierWorldZ[soldierIdx];

      const gunYaw = Math.max(
        -0.38,
        Math.min(0.38, -Math.atan2(focalX - soldierX, Math.max(5.5, soldierZ - focalZ)))
      );
      const cy = Math.cos(gunYaw);
      const sy = Math.sin(gunYaw);
      const sx = soldierX + muzzleLocalX * cy + muzzleLocalZ * sy;
      const sz = soldierZ - muzzleLocalX * sy + muzzleLocalZ * cy;

      // Compensate rear ranks for forward march speed so all 1..40 crowd ranks meet at the exact same focal tip!
      const rowLagZ = Math.max(0, sz - frontMuzzleZ);
      const marchApexZ = marchingForward
        ? focalZ - rowLagZ * (SQUAD_MARCH_SPEED / speed)
        : focalZ;
      const tipJitter =
        apexJitterMeters > 0
          ? (((soldierIdx * 7 + e * 3) % 5) - 2) * 0.5 * apexJitterMeters
          : 0;
      const tipX = focalX + tipJitter;

      if (twinStream) {
        const leftMuzzleX = sx - 0.085;
        computeConvergingShotTrajectory(
          leftMuzzleX,
          sz,
          tipX,
          marchApexZ,
          speed,
          _shotTraj
        );
        bulletPool.spawn(
          leftMuzzleX,
          muzzleY,
          sz,
          _shotTraj.vx,
          _shotTraj.vz,
          damagePerProjectile,
          spec.pierceCount,
          _shotTraj.maxAge,
          bulletScale,
          this.weaponTier,
          spec.colorHex
        );

        const rightMuzzleX = sx + 0.085;
        computeConvergingShotTrajectory(
          rightMuzzleX,
          sz,
          tipX,
          marchApexZ,
          speed,
          _shotTraj
        );
        const leadTime = Math.min(_shotTraj.maxAge * 0.42, 0.36 / speed);
        bulletPool.spawn(
          rightMuzzleX + _shotTraj.vx * leadTime,
          muzzleY,
          sz + _shotTraj.vz * leadTime,
          _shotTraj.vx,
          _shotTraj.vz,
          damagePerProjectile,
          spec.pierceCount,
          Math.max(0.05, _shotTraj.maxAge - leadTime),
          bulletScale,
          this.weaponTier,
          spec.colorHex
        );
      } else {
        computeConvergingShotTrajectory(sx, sz, tipX, marchApexZ, speed, _shotTraj);
        bulletPool.spawn(
          sx,
          muzzleY,
          sz,
          _shotTraj.vx,
          _shotTraj.vz,
          damagePerProjectile,
          spec.pierceCount,
          _shotTraj.maxAge,
          bulletScale,
          this.weaponTier,
          spec.colorHex
        );
      }
    }

    this.emitterCursor = (this.emitterCursor + emitterCount) % Math.max(1, vis);
  }
}
