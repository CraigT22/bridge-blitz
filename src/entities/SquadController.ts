import type { BulletPool } from '../core/ObjectPool';
import type { SkinThemeId, WeaponTierId } from '../core/types';
import {
  clampBulletSpawnX,
  clampSquadCenterX,
  getEliteFormationOffset,
  SOLDIER_VISUAL_OVERHANG_LIMIT_X,
} from '../math/formationMath';
import {
  COMMANDO_MODEL_SCALE,
  computeParallelShotTrajectory,
  computeSquadVolleyPlan,
  getWeaponDisplaySpec,
  MAX_SQUAD_COUNT,
  MAX_VISUAL_SOLDIERS,
  PARALLEL_SHOT_RANGE,
  WEAPON_SPECS,
  type ParallelShotTrajectory,
} from '../math/weaponMath';

/** v8.0 Forward march speed (+18.5% snappier arcade momentum over v7.4's 6.5 m/s). */
export const SQUAD_MARCH_SPEED = 7.7;

const GOLDEN_RATIO_CONJ = 0.6180339887498949;
const _slotOffset = { x: 0, z: 0 };
const _shotTraj: ParallelShotTrajectory = { vx: 0, vz: -31, maxAge: 1.5 };

export class SquadController {
  public logicalCount = 1;
  public peakCount = 1;
  public weaponTier: WeaponTierId = 1;
  public skinTheme: SkinThemeId = 'UNICORN';
  public x = 0;
  public z = 0;
  public marchPhase = 0;
  public steerBankAngle = 0;
  /** Decoupled lower-body yaw (radians around +Y) turning legs diagonally toward strafe direction. */
  public legStrafeYaw = 0;
  /** Instantaneous smoothed lateral strafe speed (m/s) used to drive diagonal leg stride amplitude. */
  public strafeSpeed = 0;
  public recoilImpulse = 0;
  public barrelSpinAngle = 0;

  public readonly soldierWorldX = new Float32Array(MAX_VISUAL_SOLDIERS);
  public readonly soldierWorldZ = new Float32Array(MAX_VISUAL_SOLDIERS);
  private readonly soldierVelX = new Float32Array(MAX_VISUAL_SOLDIERS);
  private readonly soldierVelZ = new Float32Array(MAX_VISUAL_SOLDIERS);

  // Per-soldier staggered fire timers & pending BURST_2 second-shot timers (zero-GC SoA)
  private readonly soldierFireTimer = new Float32Array(MAX_VISUAL_SOLDIERS);
  private readonly soldierBurstTimer = new Float32Array(MAX_VISUAL_SOLDIERS);
  private readonly soldierBurstDamage = new Float32Array(MAX_VISUAL_SOLDIERS);

  // Zero-GC list of soldier indices that fired during the latest updateAutoFire tick (for muzzle VFX)
  public readonly lastFiredSoldierIndices = new Uint8Array(MAX_VISUAL_SOLDIERS);
  public readonly lastFiredMuzzleX = new Float32Array(MAX_VISUAL_SOLDIERS);
  public readonly lastFiredMuzzleZ = new Float32Array(MAX_VISUAL_SOLDIERS);
  public lastFiredCount = 0;

  public resetForRun(startingSquad: number): void {
    this.logicalCount = Math.max(1, Math.min(MAX_SQUAD_COUNT, Math.floor(startingSquad)));
    this.peakCount = this.logicalCount;
    this.weaponTier = 1;
    this.x = 0;
    this.z = 0;
    this.marchPhase = 0;
    this.steerBankAngle = 0;
    this.legStrafeYaw = 0;
    this.strafeSpeed = 0;
    this.recoilImpulse = 0;
    this.barrelSpinAngle = 0;
    this.lastFiredCount = 0;

    const baseInterval = 1 / WEAPON_SPECS[1].fireRate;
    for (let i = 0; i < MAX_VISUAL_SOLDIERS; i++) {
      this.soldierVelX[i] = 0;
      this.soldierVelZ[i] = 0;
      // Golden-ratio phase stagger so any subset 1..40 emits an organic continuous ribbon!
      const phase = i === 0 ? 0.04 : ((i * GOLDEN_RATIO_CONJ) % 1);
      this.soldierFireTimer[i] = phase * baseInterval;
      this.soldierBurstTimer[i] = -1;
      this.soldierBurstDamage[i] = 0;
    }

    const vis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    for (let i = 0; i < vis; i++) {
      getEliteFormationOffset(i, vis, _slotOffset);
      this.soldierWorldX[i] = this.x + _slotOffset.x;
      this.soldierWorldZ[i] = this.z + _slotOffset.z;
    }
  }

  /**
   * Updates squad count (clamped to MAX_SQUAD_COUNT = 40) and returns any overflow soldiers
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

    const baseInterval = 1 / Math.max(0.5, WEAPON_SPECS[this.weaponTier].fireRate);
    const nextVis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    for (let i = prevVis; i < nextVis; i++) {
      getEliteFormationOffset(i, nextVis, _slotOffset);
      this.soldierWorldX[i] = this.x + _slotOffset.x * 0.35;
      this.soldierWorldZ[i] = this.z + _slotOffset.z * 0.35;
      this.soldierVelX[i] = 0;
      this.soldierVelZ[i] = 0;
      this.soldierFireTimer[i] = ((i * GOLDEN_RATIO_CONJ) % 1) * baseInterval;
      this.soldierBurstTimer[i] = -1;
    }

    return overflow;
  }

  public updateMovement(
    dt: number,
    horizontalDelta: number,
    advanceForward: boolean,
    animateMarch: boolean,
    _splitDividerActive = false
  ): void {
    if (this.logicalCount <= 0) {
      return;
    }

    const prevX = this.x;
    this.x = clampSquadCenterX(this.x + horizontalDelta, this.logicalCount);
    const actualVelX = dt > 0 ? (this.x - prevX) / dt : 0;

    // Subtle body bank + decoupled lower-body diagonal strafe yaw (legs turn into swipe while torso stays locked straight!)
    const targetBank = Math.max(-0.14, Math.min(0.14, actualVelX * 0.012));
    this.steerBankAngle += (targetBank - this.steerBankAngle) * Math.min(1, dt * 14);

    // Rotating local -Z toward +X (right strafe) around +Y requires negative yaw; toward -X (left) requires positive yaw
    const targetLegYaw = Math.max(-0.74, Math.min(0.74, -actualVelX * 0.088));
    this.legStrafeYaw += (targetLegYaw - this.legStrafeYaw) * Math.min(1, dt * 16);
    const absVel = Math.abs(actualVelX);
    this.strafeSpeed += (absVel - this.strafeSpeed) * Math.min(1, dt * 14);

    if (this.recoilImpulse > 0) {
      this.recoilImpulse = Math.max(0, this.recoilImpulse - dt * 9.5);
    }

    if (advanceForward) {
      this.z -= SQUAD_MARCH_SPEED * dt;
    }
    if (animateMarch || absVel > 0.35) {
      const strideRate = animateMarch ? 1.12 : Math.min(1.05, 0.4 + absVel * 0.12);
      this.marchPhase += dt * strideRate;
      this.barrelSpinAngle += dt * (this.weaponTier === 4 ? 26.0 : 4.2);
    } else {
      this.marchPhase += dt * 0.35;
      this.barrelSpinAngle += dt * 3.2;
    }

    // Soft concentric spring flocking into a compact circular/oval blob (~1.25 lanes wide at 40 soldiers):
    // - Outer flanking soldiers are allowed to push visually slightly past the bridge curb (±6.24m)
    // - On Split Causeway, squad is NOT compressed onto one side so straddling SPLIT_DIVIDER_X (-0.88m)
    //   naturally splits parallel fire across the Left Power-Up Column and Right Enemy Column simultaneously!
    const vis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    if (dt <= 0) {
      for (let i = 0; i < vis; i++) {
        getEliteFormationOffset(i, vis, _slotOffset);
        this.soldierWorldX[i] = Math.max(
          -SOLDIER_VISUAL_OVERHANG_LIMIT_X,
          Math.min(SOLDIER_VISUAL_OVERHANG_LIMIT_X, this.x + _slotOffset.x)
        );
        this.soldierWorldZ[i] = this.z + _slotOffset.z;
      }
      return;
    }

    const stiffness = 175.0;
    const damping = 23.0;
    const safeDt = Math.min(0.05, dt);

    for (let i = 0; i < vis; i++) {
      getEliteFormationOffset(i, vis, _slotOffset);
      const targetX = this.x + _slotOffset.x;
      const targetZ = this.z + _slotOffset.z;

      // Keep Z tightly locked to forward march pace while X flows with soft concentric spring flocking
      const dx = targetX - this.soldierWorldX[i];
      const dz = targetZ - this.soldierWorldZ[i];

      const ax = dx * stiffness - this.soldierVelX[i] * damping;
      const az = dz * (stiffness * 1.25) - this.soldierVelZ[i] * (damping * 1.15);

      this.soldierVelX[i] += ax * safeDt;
      this.soldierVelZ[i] += az * safeDt;

      let nx = this.soldierWorldX[i] + this.soldierVelX[i] * safeDt;
      const nz = this.soldierWorldZ[i] + this.soldierVelZ[i] * safeDt;

      // Soft visual overhang limit only (outer flankers can push slightly past the bridge curb at ±6.24m!)
      if (nx < -SOLDIER_VISUAL_OVERHANG_LIMIT_X) {
        nx = -SOLDIER_VISUAL_OVERHANG_LIMIT_X;
        this.soldierVelX[i] = 0;
      } else if (nx > SOLDIER_VISUAL_OVERHANG_LIMIT_X) {
        nx = SOLDIER_VISUAL_OVERHANG_LIMIT_X;
        this.soldierVelX[i] = 0;
      }

      this.soldierWorldX[i] = nx;
      this.soldierWorldZ[i] = nz;
    }
  }

  /**
   * Smoothly funnels outer crowd soldiers around standing unbroken barricades
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
        const safeEdgeX = Math.max(
          -SOLDIER_VISUAL_OVERHANG_LIMIT_X,
          Math.min(SOLDIER_VISUAL_OVERHANG_LIMIT_X, edgeX)
        );
        this.soldierWorldX[i] += (safeEdgeX - sx) * blend;
      }
    }
  }

  /**
   * v8.0 Parallel Straight-Ahead "Garden Hose" Staggered Auto-Fire:
   * - Every soldier ticks their own staggered fire timer (no synchronized horizontal bars!)
   * - Every bullet flies strictly parallel along world -Z (`vx = 0`, zero convergence, zero lateral drift!)
   * - Off-curb flanking soldier bullet spawns clamp onto ±BULLET_PLAYABLE_RAIL_X (±5.10m) for 100% outer-lane DPS!
   */
  public updateAutoFire(
    dt: number,
    fireRateMultiplier: number,
    bulletPowerMultiplier: number,
    bulletPool: BulletPool,
    maxRangeMeters = PARALLEL_SHOT_RANGE
  ): boolean {
    this.lastFiredCount = 0;
    if (this.logicalCount <= 0 || dt <= 0) {
      return false;
    }

    const vis = Math.min(this.logicalCount, MAX_VISUAL_SOLDIERS);
    if (vis <= 0) {
      return false;
    }

    const plan = computeSquadVolleyPlan(
      this.logicalCount,
      this.weaponTier,
      fireRateMultiplier,
      bulletPowerMultiplier
    );
    const spec = getWeaponDisplaySpec(this.weaponTier, this.skinTheme);
    const interval = Math.max(0.035, plan.intervalSeconds);
    // Preserve exact total squad DPS from computeSquadVolleyPlan across all `vis` staggered emitters
    const damagePerShot = (plan.damagePerProjectile * plan.activeEmitters) / vis;
    const speed = spec.projectileSpeed;
    const muzzleLocalX = 0.255 * COMMANDO_MODEL_SCALE;
    const muzzleY = 0.548 * COMMANDO_MODEL_SCALE;
    const muzzleLocalZ = -0.68 * COMMANDO_MODEL_SCALE;
    const bulletScale = 1.22;

    computeParallelShotTrajectory(speed, maxRangeMeters, _shotTraj);

    let firedAny = false;

    for (let i = 0; i < vis; i++) {
      // 1. Check pending BURST_2 second round for this soldier
      if (this.soldierBurstTimer[i] >= 0) {
        this.soldierBurstTimer[i] -= dt;
        if (this.soldierBurstTimer[i] <= 0) {
          this.soldierBurstTimer[i] = -1;
          const sx = clampBulletSpawnX(this.soldierWorldX[i] + muzzleLocalX, i);
          const sz = this.soldierWorldZ[i] + muzzleLocalZ;
          bulletPool.spawn(
            sx,
            muzzleY,
            sz,
            0,
            _shotTraj.vz,
            this.soldierBurstDamage[i],
            spec.pierceCount,
            _shotTraj.maxAge,
            bulletScale,
            this.weaponTier,
            spec.colorHex
          );
          this.recordMuzzleEvent(i, sx, sz);
          firedAny = true;
        }
      }

      // 2. Tick staggered primary fire timer for soldier `i`
      this.soldierFireTimer[i] -= dt;
      if (this.soldierFireTimer[i] > 0) {
        continue;
      }

      // Catch-up modulo without snapping all soldiers back into phase
      this.soldierFireTimer[i] += interval;
      if (this.soldierFireTimer[i] <= 0) {
        this.soldierFireTimer[i] = (((i * GOLDEN_RATIO_CONJ) % 1) * 0.25 + 0.75) * interval;
      }

      const rawMuzzleX = this.soldierWorldX[i] + muzzleLocalX;
      const sx = clampBulletSpawnX(rawMuzzleX, i);
      const sz = this.soldierWorldZ[i] + muzzleLocalZ;

      if (spec.pattern === 'TWIN_CONVERGE') {
        // Twin strictly parallel streams (left & right rotary barrels, vx = 0!)
        const leftX = clampBulletSpawnX(rawMuzzleX - 0.085, i);
        const rightX = clampBulletSpawnX(rawMuzzleX + 0.085, i + 1);
        const leadZ = -0.34;
        bulletPool.spawn(
          leftX,
          muzzleY,
          sz,
          0,
          _shotTraj.vz,
          damagePerShot,
          spec.pierceCount,
          _shotTraj.maxAge,
          bulletScale,
          this.weaponTier,
          spec.colorHex
        );
        bulletPool.spawn(
          rightX,
          muzzleY,
          sz + leadZ,
          0,
          _shotTraj.vz,
          damagePerShot,
          spec.pierceCount,
          Math.max(0.08, _shotTraj.maxAge - Math.abs(leadZ) / speed),
          bulletScale,
          this.weaponTier,
          spec.colorHex
        );
      } else {
        bulletPool.spawn(
          sx,
          muzzleY,
          sz,
          0,
          _shotTraj.vz,
          damagePerShot,
          spec.pierceCount,
          _shotTraj.maxAge,
          bulletScale,
          this.weaponTier,
          spec.colorHex
        );
        if (spec.pattern === 'BURST_2') {
          this.soldierBurstTimer[i] = 0.058;
          this.soldierBurstDamage[i] = damagePerShot;
        }
      }

      this.recordMuzzleEvent(i, sx, sz);
      firedAny = true;
    }

    if (firedAny) {
      this.recoilImpulse = 0.92;
    }

    return firedAny;
  }

  private recordMuzzleEvent(soldierIdx: number, muzzleX: number, muzzleZ: number): void {
    if (this.lastFiredCount < MAX_VISUAL_SOLDIERS) {
      const idx = this.lastFiredCount++;
      this.lastFiredSoldierIndices[idx] = soldierIdx;
      this.lastFiredMuzzleX[idx] = muzzleX;
      this.lastFiredMuzzleZ[idx] = muzzleZ;
    }
  }
}
