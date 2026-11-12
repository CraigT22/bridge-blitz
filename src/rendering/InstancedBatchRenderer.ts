import * as THREE from 'three';
import type { BulletPool, ParticlePool } from '../core/ObjectPool';
import { MAX_VISUAL_SOLDIERS } from '../math/weaponMath';
import {
  createEnemySoldierGeometry,
  createPlayerSoldierGeometry,
  createTracerBoltGeometry,
} from './ProceduralGeometries';

const MAX_ENEMY_INSTANCES = 260;
const MAX_SHADOW_DISCS = MAX_VISUAL_SOLDIERS + MAX_ENEMY_INSTANCES;

// Module-scoped reusable scratch primitives — strictly zero per-frame allocations!
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _color = new THREE.Color();

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(32, 32, 3, 32, 32, 30);
  grad.addColorStop(0, 'rgba(6, 9, 14, 0.76)');
  grad.addColorStop(0.55, 'rgba(6, 9, 14, 0.38)');
  grad.addColorStop(1, 'rgba(6, 9, 14, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

interface StrideUniforms {
  uStrideTime: { value: number };
  uStrideAmp: { value: number };
}

/**
 * Injects zero-overhead GPU vertex limb animation (`aPartId` + `gl_InstanceID`)
 * so 150+ friendly operators and 260+ charging enemies sprint with articulated legs & arms
 * in a single instanced draw call with zero extra dynamic vertex buffer uploads.
 */
function applyLimbStrideShader(
  mat: THREE.MeshStandardMaterial,
  uniforms: StrideUniforms,
  cacheKey: string
): void {
  mat.customProgramCacheKey = () => cacheKey;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uStrideTime = uniforms.uStrideTime;
    shader.uniforms.uStrideAmp = uniforms.uStrideAmp;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        attribute float aPartId;
        uniform float uStrideTime;
        uniform float uStrideAmp;
        `
      )
      .replace(
        '#include <beginnormal_vertex>',
        /* glsl */ `
        #include <beginnormal_vertex>
        {
          float strideVal = sin(uStrideTime + float(gl_InstanceID) * 0.92) * uStrideAmp;
          float nAngle = 0.0;
          if (aPartId > 0.5 && aPartId < 1.5) {
            nAngle = strideVal;
          } else if (aPartId > 1.5 && aPartId < 2.5) {
            nAngle = -strideVal;
          } else if (aPartId > 2.5) {
            nAngle = -strideVal * 0.28;
          }
          if (abs(nAngle) > 0.001) {
            float cn = cos(nAngle);
            float sn = sin(nAngle);
            float ny = objectNormal.y * cn - objectNormal.z * sn;
            float nz = objectNormal.y * sn + objectNormal.z * cn;
            objectNormal.y = ny;
            objectNormal.z = nz;
          }
        }
        `
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `
        #include <begin_vertex>
        {
          float strideVal = sin(uStrideTime + float(gl_InstanceID) * 0.92) * uStrideAmp;
          float limbAngle = 0.0;
          float pivotY = 0.35;
          if (aPartId > 0.5 && aPartId < 1.5) {
            limbAngle = strideVal;
          } else if (aPartId > 1.5 && aPartId < 2.5) {
            limbAngle = -strideVal;
          } else if (aPartId > 2.5) {
            limbAngle = -strideVal * 0.28;
            pivotY = 0.48;
          }
          if (abs(limbAngle) > 0.001) {
            float c = cos(limbAngle);
            float s = sin(limbAngle);
            vec3 rel = transformed - vec3(0.0, pivotY, 0.0);
            transformed.y = pivotY + rel.y * c - rel.z * s;
            transformed.z = rel.y * s + rel.z * c;
          }
        }
        `
      );
  };
}

export class InstancedBatchRenderer {
  public readonly playerMesh: THREE.InstancedMesh;
  public readonly enemyMesh: THREE.InstancedMesh;
  public readonly bulletMesh: THREE.InstancedMesh;
  public readonly particleMesh: THREE.InstancedMesh;

  private readonly playerStrideUniforms: StrideUniforms = {
    uStrideTime: { value: 0 },
    uStrideAmp: { value: 0 },
  };
  private readonly enemyStrideUniforms: StrideUniforms = {
    uStrideTime: { value: 0 },
    uStrideAmp: { value: 0.68 },
  };

  private readonly shadowDiscMesh: THREE.InstancedMesh;
  private shadowDiscCursor = 0;

  constructor(
    scene: THREE.Scene,
    bulletCapacity: number,
    particleCapacity: number
  ) {
    // 1. Player Squad InstancedMesh (Tactical SpecOps Operators)
    const playerGeo = createPlayerSoldierGeometry();
    const playerMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.42,
      metalness: 0.24,
    });
    applyLimbStrideShader(playerMat, this.playerStrideUniforms, 'soldier-stride-player-v21');

    this.playerMesh = new THREE.InstancedMesh(playerGeo, playerMat, MAX_VISUAL_SOLDIERS);
    this.playerMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.playerMesh.frustumCulled = false;
    this.playerMesh.count = 0;
    scene.add(this.playerMesh);

    // 2. Enemy Horde InstancedMesh (Armored Crimson-Guard Shock Troopers)
    const enemyGeo = createEnemySoldierGeometry();
    const enemyMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.4,
      metalness: 0.28,
    });
    applyLimbStrideShader(enemyMat, this.enemyStrideUniforms, 'soldier-stride-enemy-v21');

    this.enemyMesh = new THREE.InstancedMesh(enemyGeo, enemyMat, MAX_ENEMY_INSTANCES);
    this.enemyMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.enemyMesh.frustumCulled = false;
    this.enemyMesh.count = 0;
    scene.add(this.enemyMesh);

    // 3. Soft AO Contact-Shadow Discs under all active troopers
    const discGeo = new THREE.PlaneGeometry(0.68, 0.68);
    discGeo.rotateX(-Math.PI / 2);
    const discMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      depthWrite: false,
    });
    this.shadowDiscMesh = new THREE.InstancedMesh(discGeo, discMat, MAX_SHADOW_DISCS);
    this.shadowDiscMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.shadowDiscMesh.frustumCulled = false;
    this.shadowDiscMesh.count = 0;
    scene.add(this.shadowDiscMesh);

    // 4. HDR Glowing Bullet Tracer InstancedMesh
    const bulletGeo = createTracerBoltGeometry();
    const bulletMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.94,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.bulletMesh = new THREE.InstancedMesh(bulletGeo, bulletMat, bulletCapacity);
    this.bulletMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.bulletMesh.frustumCulled = false;
    this.bulletMesh.count = 0;
    for (let i = 0; i < bulletCapacity; i++) {
      this.bulletMesh.setColorAt(i, _color.setRGB(1, 1, 1));
    }
    scene.add(this.bulletMesh);

    // 5. Shrapnel, Sparks & Smoke Particle InstancedMesh
    const particleGeo = new THREE.DodecahedronGeometry(0.58, 0);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.35,
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
    this.shadowDiscCursor = 0;

    this.playerStrideUniforms.uStrideTime.value = marchPhase * 12.5;
    this.playerStrideUniforms.uStrideAmp.value = isMoving ? 0.68 : 0.0;
    this.enemyStrideUniforms.uStrideTime.value = marchPhase * 11.2;

    for (let i = 0; i < safeCount; i++) {
      const bobPhase = marchPhase * 12.5 + i * 0.92;
      const bobY = isMoving
        ? Math.abs(Math.sin(bobPhase)) * 0.068
        : Math.sin(marchPhase * 3 + i) * 0.012;
      const swayZ = isMoving ? Math.sin(bobPhase) * 0.048 : 0;

      _pos.set(worldX[i], bobY, worldZ[i]);
      _euler.set(isMoving ? -0.09 : 0, 0, swayZ);
      _quat.setFromEuler(_euler);
      _scale.set(1, 1, 1);
      _mat4.compose(_pos, _quat, _scale);
      this.playerMesh.setMatrixAt(i, _mat4);

      // Grounded AO contact shadow disc
      _pos.set(worldX[i], 0.022, worldZ[i]);
      _quat.identity();
      const shadowScale = 1 - bobY * 1.4;
      _scale.set(shadowScale, 1, shadowScale);
      _mat4.compose(_pos, _quat, _scale);
      this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++, _mat4);
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

    const bob = Math.abs(Math.sin(phase)) * 0.068;
    const scalePop = 1 + hitFlash * 0.16;

    _pos.set(x, bob, z);
    _euler.set(0.09, 0, Math.sin(phase) * 0.05);
    _quat.setFromEuler(_euler);
    _scale.set(scalePop, scalePop, scalePop);
    _mat4.compose(_pos, _quat, _scale);
    this.enemyMesh.setMatrixAt(idx, _mat4);

    if (this.shadowDiscCursor < MAX_SHADOW_DISCS) {
      _pos.set(x, 0.022, z);
      _quat.identity();
      const shadowScale = 1.04 - bob * 1.3;
      _scale.set(shadowScale, 1, shadowScale);
      _mat4.compose(_pos, _quat, _scale);
      this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++, _mat4);
    }
  }

  public finishEnemyFrame(): void {
    this.enemyMesh.instanceMatrix.needsUpdate = true;
    this.shadowDiscMesh.count = this.shadowDiscCursor;
    this.shadowDiscMesh.instanceMatrix.needsUpdate = true;
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
      _scale.set(s, s, s * (pool.weaponTier[i] === 5 ? 1.85 : 1.15));
      _mat4.compose(_pos, _quat, _scale);
      this.bulletMesh.setMatrixAt(i, _mat4);

      // HDR boost (> 1.0) so UnrealBloomPass renders fiery golden/cyan tracer streaks!
      _color.setRGB(
        pool.colorR[i] * 1.85,
        pool.colorG[i] * 1.85,
        pool.colorB[i] * 1.85
      );
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
      _euler.set(rot, rot * 0.7, rot * 0.35);
      _quat.setFromEuler(_euler);
      _scale.set(s, s, s);
      _mat4.compose(_pos, _quat, _scale);
      this.particleMesh.setMatrixAt(i, _mat4);

      const r = pool.colorR[i];
      const g = pool.colorG[i];
      const b = pool.colorB[i];
      // Boost bright sparks/embers above bloom threshold while keeping smoke/rubber matte
      const hdr = r + g + b > 1.35 ? 1.45 : 1.0;
      _color.setRGB(r * hdr, g * hdr, b * hdr);
      this.particleMesh.setColorAt(i, _color);
    }
    this.particleMesh.instanceMatrix.needsUpdate = true;
    if (this.particleMesh.instanceColor) {
      this.particleMesh.instanceColor.needsUpdate = true;
    }
  }
}
