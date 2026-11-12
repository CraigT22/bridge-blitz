import * as THREE from 'three';
import type { BulletPool, ParticlePool } from '../core/ObjectPool';
import { MAX_VISUAL_SOLDIERS } from '../math/weaponMath';
import {
  createEnemySoldierGeometry,
  createPlayerSoldierGeometry,
} from './ProceduralGeometries';

const MAX_ENEMY_INSTANCES = 260;

// Module-scoped reusable scratch primitives — strictly zero per-frame allocations!
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _color = new THREE.Color();

export class InstancedBatchRenderer {
  public readonly playerMesh: THREE.InstancedMesh;
  public readonly enemyMesh: THREE.InstancedMesh;
  public readonly bulletMesh: THREE.InstancedMesh;
  public readonly particleMesh: THREE.InstancedMesh;

  constructor(
    scene: THREE.Scene,
    bulletCapacity: number,
    particleCapacity: number
  ) {
    // 1. Player Squad InstancedMesh (Glossy Green Soldiers)
    const playerGeo = createPlayerSoldierGeometry();
    const playerMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.28,
      metalness: 0.12,
    });
    this.playerMesh = new THREE.InstancedMesh(playerGeo, playerMat, MAX_VISUAL_SOLDIERS);
    this.playerMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.playerMesh.frustumCulled = false;
    this.playerMesh.count = 0;
    scene.add(this.playerMesh);

    // 2. Enemy Horde InstancedMesh (Glossy Crimson Soldiers)
    const enemyGeo = createEnemySoldierGeometry();
    const enemyMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.3,
      metalness: 0.16,
    });
    this.enemyMesh = new THREE.InstancedMesh(enemyGeo, enemyMat, MAX_ENEMY_INSTANCES);
    this.enemyMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.enemyMesh.frustumCulled = false;
    this.enemyMesh.count = 0;
    scene.add(this.enemyMesh);

    // 3. Bullet Tracer InstancedMesh
    const bulletGeo = new THREE.BoxGeometry(0.11, 0.11, 0.58);
    const bulletMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    this.bulletMesh = new THREE.InstancedMesh(bulletGeo, bulletMat, bulletCapacity);
    this.bulletMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.bulletMesh.frustumCulled = false;
    this.bulletMesh.count = 0;
    // Initialize instanceColor buffer once
    for (let i = 0; i < bulletCapacity; i++) {
      this.bulletMesh.setColorAt(i, _color.setRGB(1, 1, 1));
    }
    scene.add(this.bulletMesh);

    // 4. Particle Burst InstancedMesh
    const particleGeo = new THREE.BoxGeometry(1, 1, 1);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    this.particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, particleCapacity);
    this.particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.particleMesh.frustumCulled = false;
    this.particleMesh.count = 0;
    for (let i = 0; i < particleCapacity; i++) {
      this.particleMesh.setColorAt(i, _color.setRGB(1, 1, 1));
    }
    scene.add(this.particleMesh);
  }

  public syncPlayerSoldiers(
    count: number,
    worldX: Float32Array,
    worldZ: Float32Array,
    marchPhase: number,
    isMoving: boolean
  ): void {
    const safeCount = Math.min(count, MAX_VISUAL_SOLDIERS);
    this.playerMesh.count = safeCount;

    for (let i = 0; i < safeCount; i++) {
      const bobPhase = marchPhase * 11 + i * 0.85;
      const bobY = isMoving ? Math.abs(Math.sin(bobPhase)) * 0.085 : Math.sin(marchPhase * 3 + i) * 0.015;
      const swayZ = isMoving ? Math.sin(bobPhase) * 0.065 : 0;

      _pos.set(worldX[i], bobY, worldZ[i]);
      _euler.set(isMoving ? -0.08 : 0, 0, swayZ);
      _quat.setFromEuler(_euler);
      _scale.set(1, 1, 1);
      _mat4.compose(_pos, _quat, _scale);
      this.playerMesh.setMatrixAt(i, _mat4);
    }
    this.playerMesh.instanceMatrix.needsUpdate = true;
  }

  public beginEnemyFrame(): void {
    this.enemyMesh.count = 0;
  }

  public pushEnemySoldier(
    x: number,
    z: number,
    phase: number,
    hitFlash: number
  ): void {
    const idx = this.enemyMesh.count;
    if (idx >= MAX_ENEMY_INSTANCES) {
      return;
    }
    this.enemyMesh.count = idx + 1;

    const bob = Math.abs(Math.sin(phase)) * 0.08;
    const scalePop = 1 + hitFlash * 0.16;
    _pos.set(x, bob, z);
    _euler.set(0.08, 0, Math.sin(phase) * 0.06);
    _quat.setFromEuler(_euler);
    _scale.set(scalePop, scalePop, scalePop);
    _mat4.compose(_pos, _quat, _scale);
    this.enemyMesh.setMatrixAt(idx, _mat4);
  }

  public finishEnemyFrame(): void {
    this.enemyMesh.instanceMatrix.needsUpdate = true;
  }

  public syncBullets(pool: BulletPool): void {
    const n = pool.activeCount;
    this.bulletMesh.count = n;
    for (let i = 0; i < n; i++) {
      _pos.set(pool.x[i], pool.y[i], pool.z[i]);
      const yaw = Math.atan2(pool.vx[i], pool.vz[i]);
      _euler.set(0, yaw + Math.PI, 0);
      _quat.setFromEuler(_euler);
      const s = pool.scale[i];
      _scale.set(s, s, s * (pool.weaponTier[i] === 5 ? 1.65 : 1.0));
      _mat4.compose(_pos, _quat, _scale);
      this.bulletMesh.setMatrixAt(i, _mat4);

      _color.setRGB(pool.colorR[i], pool.colorG[i], pool.colorB[i]);
      this.bulletMesh.setColorAt(i, _color);
    }
    this.bulletMesh.instanceMatrix.needsUpdate = true;
    if (this.bulletMesh.instanceColor) {
      this.bulletMesh.instanceColor.needsUpdate = true;
    }
  }

  public syncParticles(pool: ParticlePool): void {
    const n = pool.activeCount;
    this.particleMesh.count = n;
    for (let i = 0; i < n; i++) {
      const lifeRatio = 1 - pool.age[i] / pool.maxAge[i];
      const s = Math.max(0.01, pool.baseScale[i] * lifeRatio);
      _pos.set(pool.x[i], pool.y[i], pool.z[i]);
      const rot = pool.age[i] * pool.spin[i];
      _euler.set(rot, rot * 0.7, 0);
      _quat.setFromEuler(_euler);
      _scale.set(s, s, s);
      _mat4.compose(_pos, _quat, _scale);
      this.particleMesh.setMatrixAt(i, _mat4);

      _color.setRGB(pool.colorR[i], pool.colorG[i], pool.colorB[i]);
      this.particleMesh.setColorAt(i, _color);
    }
    this.particleMesh.instanceMatrix.needsUpdate = true;
    if (this.particleMesh.instanceColor) {
      this.particleMesh.instanceColor.needsUpdate = true;
    }
  }
}
