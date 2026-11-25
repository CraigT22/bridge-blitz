import * as THREE from 'three';
import type { SkinThemeId } from '../core/types';
import { computeSquadOuterRadius } from '../math/formationMath';

const MAX_ENEMY_BOLTS = 48;
const MAX_SHOOTER_TELEGRAPHS = 24;
const MAX_CHARGER_LANES = 12;

export const ENEMY_BOLT_BASE_SPEED = 16.5;

const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();

/**
 * Pure hit-test helper for lane-locked enemy projectiles so unit tests can verify dodge vs. hit geometry.
 */
export function doesEnemyBoltHitSquad(
  boltX: number,
  squadX: number,
  logicalSquad: number
): boolean {
  if (logicalSquad <= 0) {
    return false;
  }
  const squadRadius = computeSquadOuterRadius(logicalSquad);
  const hitHalfW = Math.min(1.85, squadRadius * 0.70 + 0.52);
  return Math.abs(boltX - squadX) <= hitHalfW;
}

/**
 * Zero-GC pooled single-pass WebGL system for v8.2 Active Enemy Threats:
 * 1. Ranged Enemy Bolts (glowing core + cel-outline + asphalt lane halo ring)
 * 2. Ranged Shooter charge-up telegraph orbs
 * 3. Armored Lane Charger ground-projected rush warning lanes
 */
export class EnemyProjectileSystem {
  public activeBoltCount = 0;
  public lastStepHitDamage = 0;
  public lastStepHitX = 0;
  public lastStepHitZ = 0;
  public lastStepDodgedCount = 0;

  public readonly boltX = new Float32Array(MAX_ENEMY_BOLTS);
  public readonly boltY = new Float32Array(MAX_ENEMY_BOLTS);
  public readonly boltZ = new Float32Array(MAX_ENEMY_BOLTS);
  public readonly boltSpeed = new Float32Array(MAX_ENEMY_BOLTS);
  public readonly boltDamage = new Int16Array(MAX_ENEMY_BOLTS);
  public readonly boltAge = new Float32Array(MAX_ENEMY_BOLTS);

  private readonly boltCoreMesh: THREE.InstancedMesh;
  private readonly boltOutlineMesh: THREE.InstancedMesh;
  private readonly boltHaloMesh: THREE.InstancedMesh;
  private readonly boltCoreMat: THREE.MeshBasicMaterial;
  private readonly boltHaloMat: THREE.MeshBasicMaterial;

  private readonly telegraphOrbMesh: THREE.InstancedMesh;
  private readonly telegraphOrbMat: THREE.MeshBasicMaterial;
  private telegraphOrbCursor = 0;

  private readonly chargerLaneMesh: THREE.InstancedMesh;
  private readonly chargerLaneMat: THREE.MeshBasicMaterial;
  private chargerLaneCursor = 0;

  private skinTheme: SkinThemeId = 'UNICORN';
  private animClock = 0;

  constructor(scene: THREE.Scene) {
    // 1. Enemy Bolts (Core + Cel Outline + Ground Halo Ring)
    const coreGeo = new THREE.OctahedronGeometry(0.36, 1);
    coreGeo.scale(1.0, 0.92, 1.48);
    this.boltCoreMat = new THREE.MeshBasicMaterial({
      color: 0x38d8ff,
      toneMapped: false,
    });
    this.boltCoreMesh = new THREE.InstancedMesh(coreGeo, this.boltCoreMat, MAX_ENEMY_BOLTS);
    this.boltCoreMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.boltCoreMesh.frustumCulled = false;
    this.boltCoreMesh.count = 0;
    scene.add(this.boltCoreMesh);

    const outlineGeo = new THREE.OctahedronGeometry(0.42, 1);
    outlineGeo.scale(1.0, 0.92, 1.48);
    const outlineMat = new THREE.MeshBasicMaterial({
      color: 0x070b14,
      side: THREE.BackSide,
    });
    this.boltOutlineMesh = new THREE.InstancedMesh(outlineGeo, outlineMat, MAX_ENEMY_BOLTS);
    this.boltOutlineMesh.instanceMatrix = this.boltCoreMesh.instanceMatrix;
    this.boltOutlineMesh.frustumCulled = false;
    this.boltOutlineMesh.count = 0;
    scene.add(this.boltOutlineMesh);

    const haloGeo = new THREE.RingGeometry(0.28, 0.66, 16);
    haloGeo.rotateX(-Math.PI / 2);
    this.boltHaloMat = new THREE.MeshBasicMaterial({
      color: 0x22ff7a,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.boltHaloMesh = new THREE.InstancedMesh(haloGeo, this.boltHaloMat, MAX_ENEMY_BOLTS);
    this.boltHaloMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.boltHaloMesh.frustumCulled = false;
    this.boltHaloMesh.count = 0;
    scene.add(this.boltHaloMesh);

    // 2. Shooter Charge-Up Telegraph Orbs
    const orbGeo = new THREE.OctahedronGeometry(0.32, 0);
    this.telegraphOrbMat = new THREE.MeshBasicMaterial({
      color: 0xffe44d,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.telegraphOrbMesh = new THREE.InstancedMesh(
      orbGeo,
      this.telegraphOrbMat,
      MAX_SHOOTER_TELEGRAPHS
    );
    this.telegraphOrbMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.telegraphOrbMesh.frustumCulled = false;
    this.telegraphOrbMesh.count = 0;
    scene.add(this.telegraphOrbMesh);

    // 3. Armored Charger Ground Warning Lanes
    const laneGeo = new THREE.PlaneGeometry(1.52, 1.0);
    laneGeo.rotateX(-Math.PI / 2);
    this.chargerLaneMat = new THREE.MeshBasicMaterial({
      color: 0xff2854,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.chargerLaneMesh = new THREE.InstancedMesh(
      laneGeo,
      this.chargerLaneMat,
      MAX_CHARGER_LANES
    );
    this.chargerLaneMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.chargerLaneMesh.frustumCulled = false;
    this.chargerLaneMesh.count = 0;
    scene.add(this.chargerLaneMesh);

    this.setSkinTheme('UNICORN');
  }

  public setSkinTheme(theme: SkinThemeId): void {
    this.skinTheme = theme;
    const isUnicorn = theme === 'UNICORN';
    this.boltCoreMat.color.setHex(isUnicorn ? 0x24d8ff : 0xff3b4e);
    this.boltHaloMat.color.setHex(isUnicorn ? 0x22f874 : 0xff7a22);
    this.telegraphOrbMat.color.setHex(isUnicorn ? 0x52f8ff : 0xffcf40);
    this.chargerLaneMat.color.setHex(isUnicorn ? 0x1a88ff : 0xff2854);
  }

  public clear(): void {
    this.activeBoltCount = 0;
    this.lastStepHitDamage = 0;
    this.lastStepDodgedCount = 0;
    this.telegraphOrbCursor = 0;
    this.chargerLaneCursor = 0;
    this.boltCoreMesh.count = 0;
    this.boltOutlineMesh.count = 0;
    this.boltHaloMesh.count = 0;
    this.telegraphOrbMesh.count = 0;
    this.chargerLaneMesh.count = 0;
  }

  public spawnBolt(x: number, z: number, speed: number, damage: number): boolean {
    if (this.activeBoltCount >= MAX_ENEMY_BOLTS) {
      return false;
    }
    const idx = this.activeBoltCount++;
    this.boltX[idx] = x;
    this.boltY[idx] = 0.96;
    this.boltZ[idx] = z;
    this.boltSpeed[idx] = Math.max(8, speed);
    this.boltDamage[idx] = Math.max(1, Math.round(damage));
    this.boltAge[idx] = 0;
    return true;
  }

  public beginTelegraphs(): void {
    this.telegraphOrbCursor = 0;
    this.chargerLaneCursor = 0;
  }

  public pushShooterTelegraph(x: number, z: number, progress: number): void {
    if (this.telegraphOrbCursor >= MAX_SHOOTER_TELEGRAPHS) {
      return;
    }
    const idx = this.telegraphOrbCursor++;
    const p = Math.max(0, Math.min(1, progress));
    const pulse = 0.55 + p * 0.85 + Math.sin(this.animClock * 28 + idx) * 0.14;
    _pos.set(x, 1.92 + p * 0.22, z + 0.25);
    _euler.set(this.animClock * 6, this.animClock * 9 + idx, 0);
    _quat.setFromEuler(_euler);
    _scale.set(pulse, pulse, pulse);
    _mat4.compose(_pos, _quat, _scale);
    this.telegraphOrbMesh.setMatrixAt(idx, _mat4);
  }

  public pushChargerLane(
    x: number,
    startZ: number,
    endZ: number,
    progress: number,
    isRushing: boolean
  ): void {
    if (this.chargerLaneCursor >= MAX_CHARGER_LANES) {
      return;
    }
    const len = Math.max(1.5, endZ - startZ);
    const midZ = (startZ + endZ) * 0.5;
    const widthScale = isRushing
      ? 1.12
      : 0.55 + Math.max(0, Math.min(1, progress)) * 0.62;
    const idx = this.chargerLaneCursor++;
    _pos.set(x, 0.044, midZ);
    _quat.identity();
    _scale.set(widthScale, 1, len);
    _mat4.compose(_pos, _quat, _scale);
    this.chargerLaneMesh.setMatrixAt(idx, _mat4);
  }

  public finishTelegraphs(): void {
    this.telegraphOrbMesh.count = this.telegraphOrbCursor;
    if (this.telegraphOrbCursor > 0) {
      this.telegraphOrbMesh.instanceMatrix.needsUpdate = true;
    }
    this.chargerLaneMesh.count = this.chargerLaneCursor;
    if (this.chargerLaneCursor > 0) {
      this.chargerLaneMesh.instanceMatrix.needsUpdate = true;
    }
  }

  public update(
    dt: number,
    squadX: number,
    squadZ: number,
    logicalSquad: number
  ): void {
    this.lastStepHitDamage = 0;
    this.lastStepDodgedCount = 0;
    this.animClock += dt;

    let i = 0;
    while (i < this.activeBoltCount) {
      const nextAge = this.boltAge[i] + dt;
      const nextZ = this.boltZ[i] + this.boltSpeed[i] * dt;
      const bx = this.boltX[i];

      let remove = false;
      if (nextAge > 4.2 || nextZ > squadZ + 1.35) {
        if (nextZ > squadZ + 1.15 && logicalSquad > 0) {
          this.lastStepDodgedCount++;
        }
        remove = true;
      } else if (
        logicalSquad > 0 &&
        nextZ >= squadZ - 0.55 &&
        nextZ <= squadZ + 0.72 &&
        doesEnemyBoltHitSquad(bx, squadX, logicalSquad)
      ) {
        this.lastStepHitDamage += this.boltDamage[i];
        this.lastStepHitX = bx;
        this.lastStepHitZ = squadZ;
        remove = true;
      }

      if (remove) {
        const last = this.activeBoltCount - 1;
        if (i !== last) {
          this.boltX[i] = this.boltX[last];
          this.boltY[i] = this.boltY[last];
          this.boltZ[i] = this.boltZ[last];
          this.boltSpeed[i] = this.boltSpeed[last];
          this.boltDamage[i] = this.boltDamage[last];
          this.boltAge[i] = this.boltAge[last];
        }
        this.activeBoltCount = last;
        continue;
      }

      this.boltAge[i] = nextAge;
      this.boltZ[i] = nextZ;

      const spin = nextAge * 14 + i * 1.1;
      const pulse = 1.0 + Math.sin(spin * 1.4) * 0.12;
      _pos.set(bx, this.boltY[i], nextZ);
      _euler.set(spin * 0.4, 0, spin);
      _quat.setFromEuler(_euler);
      _scale.set(pulse, pulse, pulse);
      _mat4.compose(_pos, _quat, _scale);
      this.boltCoreMesh.setMatrixAt(i, _mat4);

      _pos.set(bx, 0.052, nextZ);
      _quat.identity();
      const hScale = 1.0 + Math.sin(spin * 1.2) * 0.16;
      _scale.set(hScale, 1, hScale);
      _mat4.compose(_pos, _quat, _scale);
      this.boltHaloMesh.setMatrixAt(i, _mat4);

      i++;
    }

    this.boltCoreMesh.count = this.activeBoltCount;
    this.boltOutlineMesh.count = this.activeBoltCount;
    this.boltHaloMesh.count = this.activeBoltCount;
    if (this.activeBoltCount > 0) {
      this.boltCoreMesh.instanceMatrix.needsUpdate = true;
      this.boltHaloMesh.instanceMatrix.needsUpdate = true;
    }

    // Subtle skin-aware flicker on active charger warning lanes
    if (this.chargerLaneCursor > 0) {
      const flick = 0.34 + 0.18 * Math.sin(this.animClock * 18);
      this.chargerLaneMat.opacity = flick;
    }
    void this.skinTheme;
  }

  /** Returns the nearest incoming bolt threat X if it threatens the squad's current lane (for telemetry/AI dodge tests). */
  public getNearestThreatBoltX(squadX: number, squadZ: number): number | null {
    let bestZ = -999999;
    let threatX: number | null = null;
    for (let i = 0; i < this.activeBoltCount; i++) {
      const bz = this.boltZ[i];
      if (bz < squadZ && squadZ - bz < 18 && Math.abs(this.boltX[i] - squadX) < 1.9) {
        if (bz > bestZ) {
          bestZ = bz;
          threatX = this.boltX[i];
        }
      }
    }
    return threatX;
  }
}
