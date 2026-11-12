import * as THREE from 'three';
import type { BulletPool, ParticlePool, RagdollPool } from '../core/ObjectPool';
import type { WeaponTierId } from '../core/types';
import { COMMANDO_MODEL_SCALE, MAX_VISUAL_SOLDIERS } from '../math/weaponMath';
import {
  createEnemySoldierGeometry,
  createHeavyEnemyGeometry,
  createPlayerSoldierGeometry,
  createTracerBoltGeometry,
} from './ProceduralGeometries';
import {
  createEquippedWeaponGeometry,
  EQUIPPED_GUN_PIVOT_X,
  EQUIPPED_GUN_PIVOT_Y,
} from './WeaponRigFactory';

const MAX_ENEMY_INSTANCES = 140;
const MAX_HEAVY_ENEMY_INSTANCES = 48;
const MAX_RAGDOLL_INSTANCES = 64;
const MAX_SHADOW_DISCS =
  MAX_VISUAL_SOLDIERS + MAX_ENEMY_INSTANCES + MAX_HEAVY_ENEMY_INSTANCES;

const ENEMY_MODEL_SCALE = 1.28;
const HEAVY_ENEMY_SCALE = 1.48;

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
  grad.addColorStop(0, 'rgba(6, 9, 14, 0.82)');
  grad.addColorStop(0.55, 'rgba(6, 9, 14, 0.42)');
  grad.addColorStop(1, 'rgba(6, 9, 14, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

interface CommandoUniforms {
  uStrideTime: { value: number };
  uStrideAmp: { value: number };
  uRecoilKick: { value: number };
}

const COMMANDO_STRIDE_SNIPPET = /* glsl */ `
  {
    float phase = uStrideTime + float(gl_InstanceID) * 0.92;
    float sRaw = sin(phase);
    float strideVal = sRaw * uStrideAmp;
    float limbAngle = 0.0;
    float bootLift = 0.0;
    float pivotY = 0.38;
    if (aPartId > 0.5 && aPartId < 1.5) {
      limbAngle = strideVal;
      bootLift = max(0.0, sRaw) * uStrideAmp * 0.065;
    } else if (aPartId > 1.5 && aPartId < 2.5) {
      limbAngle = -strideVal;
      bootLift = max(0.0, -sRaw) * uStrideAmp * 0.065;
    } else if (aPartId > 2.5 && aPartId < 3.5) {
      limbAngle = -strideVal * 0.25;
      pivotY = 0.45;
    } else if (aPartId > 3.5) {
      limbAngle = uRecoilKick * 0.08;
      pivotY = 0.58;
      transformed.z += uRecoilKick * 0.055;
      transformed.y += uRecoilKick * 0.015;
    }
    if (abs(limbAngle) > 0.001) {
      float c = cos(limbAngle);
      float s = sin(limbAngle);
      vec3 rel = transformed - vec3(0.0, pivotY, 0.0);
      transformed.y = pivotY + rel.y * c - rel.z * s + bootLift;
      transformed.z = rel.y * s + rel.z * c;
    }
  }
`;

/**
 * Injects single-pass GPU vertex animation (`aPartId`) plus optional per-instance solid-white
 * hit-flash (`aHitFlash` attribute) for zero-FBO cartoon impact feedback!
 */
function applyCommandoShader(
  mat: THREE.MeshStandardMaterial,
  uniforms: CommandoUniforms,
  cacheKey: string,
  enableHitFlash = false
): void {
  mat.customProgramCacheKey = () => cacheKey;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uStrideTime = uniforms.uStrideTime;
    shader.uniforms.uStrideAmp = uniforms.uStrideAmp;
    shader.uniforms.uRecoilKick = uniforms.uRecoilKick;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        attribute float aPartId;
        ${enableHitFlash ? 'attribute float aHitFlash;\nvarying float vHitFlash;' : ''}
        uniform float uStrideTime;
        uniform float uStrideAmp;
        uniform float uRecoilKick;
        `
      )
      .replace(
        '#include <beginnormal_vertex>',
        /* glsl */ `
        #include <beginnormal_vertex>
        {
          float phase = uStrideTime + float(gl_InstanceID) * 0.92;
          float strideVal = sin(phase) * uStrideAmp;
          float nAngle = 0.0;
          if (aPartId > 0.5 && aPartId < 1.5) {
            nAngle = strideVal;
          } else if (aPartId > 1.5 && aPartId < 2.5) {
            nAngle = -strideVal;
          } else if (aPartId > 2.5 && aPartId < 3.5) {
            nAngle = -strideVal * 0.25;
          } else if (aPartId > 3.5) {
            nAngle = uRecoilKick * 0.09;
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
        ${enableHitFlash ? 'vHitFlash = aHitFlash;' : ''}
        ${COMMANDO_STRIDE_SNIPPET}
        `
      );

    if (enableHitFlash) {
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          /* glsl */ `
          #include <common>
          varying float vHitFlash;
          `
        )
        .replace(
          '#include <dithering_fragment>',
          /* glsl */ `
          #include <dithering_fragment>
          if (vHitFlash > 0.01) {
            gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.18, 1.22, 1.28), clamp(vHitFlash * 1.15, 0.0, 0.96));
          }
          `
        );
    }
  };
}

/**
 * Single-pass BackSide inverted-hull cel-outline shader sharing the exact limb animation & instanceMatrix!
 */
function createCommandoCelOutlineMaterial(
  uniforms: CommandoUniforms,
  outlineThickness: number,
  cacheKey: string
): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({
    color: 0x0c1119,
    side: THREE.BackSide,
  });
  const thickStr = outlineThickness.toFixed(4);
  mat.customProgramCacheKey = () => cacheKey;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uStrideTime = uniforms.uStrideTime;
    shader.uniforms.uStrideAmp = uniforms.uStrideAmp;
    shader.uniforms.uRecoilKick = uniforms.uRecoilKick;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        attribute float aPartId;
        uniform float uStrideTime;
        uniform float uStrideAmp;
        uniform float uRecoilKick;
        `
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `
        #include <begin_vertex>
        {
          vec3 safeNorm = normal / max(0.0001, length(normal));
          transformed += safeNorm * ${thickStr};
        }
        ${COMMANDO_STRIDE_SNIPPET}
        `
      );
  };
  return mat;
}

interface WeaponBarrelSpinUniforms {
  uBarrelSpin: { value: number };
  uRecoilKick: { value: number };
}

function applyEquippedWeaponShader(
  mat: THREE.MeshStandardMaterial,
  uniforms: WeaponBarrelSpinUniforms,
  cacheKey: string
): void {
  const cx = EQUIPPED_GUN_PIVOT_X.toFixed(4);
  const cy = (EQUIPPED_GUN_PIVOT_Y - 0.02).toFixed(4);

  mat.customProgramCacheKey = () => cacheKey;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uBarrelSpin = uniforms.uBarrelSpin;
    shader.uniforms.uRecoilKick = uniforms.uRecoilKick;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        attribute float aSpinPart;
        uniform float uBarrelSpin;
        uniform float uRecoilKick;
        `
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `
        #include <begin_vertex>
        {
          if (aSpinPart > 0.5) {
            float ang = uBarrelSpin + float(gl_InstanceID) * 0.55;
            float cs = cos(ang);
            float sn = sin(ang);
            vec2 relXY = transformed.xy - vec2(${cx}, ${cy});
            transformed.x = ${cx} + relXY.x * cs - relXY.y * sn;
            transformed.y = ${cy} + relXY.x * sn + relXY.y * cs;
          }
          transformed.z += uRecoilKick * 0.062;
          transformed.y += uRecoilKick * 0.018;
        }
        `
      );
  };
}

export class InstancedBatchRenderer {
  public readonly playerMesh: THREE.InstancedMesh;
  public readonly playerOutlineMesh: THREE.InstancedMesh;
  public readonly enemyMesh: THREE.InstancedMesh;
  public readonly enemyOutlineMesh: THREE.InstancedMesh;
  public readonly heavyEnemyMesh: THREE.InstancedMesh;
  public readonly heavyEnemyOutlineMesh: THREE.InstancedMesh;
  public readonly squadWeaponMeshes: Readonly<Record<WeaponTierId, THREE.InstancedMesh>>;
  public readonly playerRagdollMesh: THREE.InstancedMesh;
  public readonly enemyRagdollMesh: THREE.InstancedMesh;
  public readonly bulletMesh: THREE.InstancedMesh;
  public readonly particleMesh: THREE.InstancedMesh;

  private readonly enemyHitFlashAttr: THREE.InstancedBufferAttribute;
  private readonly heavyHitFlashAttr: THREE.InstancedBufferAttribute;

  private readonly playerUniforms: CommandoUniforms = {
    uStrideTime: { value: 0 },
    uStrideAmp: { value: 0 },
    uRecoilKick: { value: 0 },
  };
  private readonly enemyUniforms: CommandoUniforms = {
    uStrideTime: { value: 0 },
    uStrideAmp: { value: 0.68 },
    uRecoilKick: { value: 0 },
  };
  private readonly weaponUniforms: WeaponBarrelSpinUniforms = {
    uBarrelSpin: { value: 0 },
    uRecoilKick: { value: 0 },
  };

  private readonly shadowDiscMesh: THREE.InstancedMesh;
  private shadowDiscCursor = 0;

  constructor(
    scene: THREE.Scene,
    bulletCapacity: number,
    particleCapacity: number
  ) {
    // 1. Player Elite Commando InstancedMesh + Shared-Matrix Cel-Outline Pass
    const playerGeo = createPlayerSoldierGeometry();
    const playerMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.44,
      metalness: 0.18,
    });
    applyCommandoShader(playerMat, this.playerUniforms, 'commando-player-v40', false);

    this.playerMesh = new THREE.InstancedMesh(playerGeo, playerMat, MAX_VISUAL_SOLDIERS);
    this.playerMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.playerMesh.frustumCulled = false;
    this.playerMesh.count = 0;
    scene.add(this.playerMesh);

    const playerOutlineMat = createCommandoCelOutlineMaterial(
      this.playerUniforms,
      0.025,
      'commando-player-outline-v40'
    );
    this.playerOutlineMesh = new THREE.InstancedMesh(
      playerGeo,
      playerOutlineMat,
      MAX_VISUAL_SOLDIERS
    );
    this.playerOutlineMesh.instanceMatrix = this.playerMesh.instanceMatrix;
    this.playerOutlineMesh.frustumCulled = false;
    this.playerOutlineMesh.count = 0;
    scene.add(this.playerOutlineMesh);

    // 2. Live Swappable 3D Squad Weapon Batches (Tiers 1..5)
    const weaponMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.30,
      metalness: 0.46,
    });
    applyEquippedWeaponShader(weaponMat, this.weaponUniforms, 'commando-weapon-v40');

    const wMeshes = {} as Record<WeaponTierId, THREE.InstancedMesh>;
    for (const tier of [1, 2, 3, 4, 5] as const) {
      const wGeo = createEquippedWeaponGeometry(tier);
      const wMesh = new THREE.InstancedMesh(wGeo, weaponMat, MAX_VISUAL_SOLDIERS);
      wMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      wMesh.frustumCulled = false;
      wMesh.count = 0;
      wMesh.visible = tier === 1;
      scene.add(wMesh);
      wMeshes[tier] = wMesh;
    }
    this.squadWeaponMeshes = wMeshes;

    // 3. Standard Enemy Shock Troopers + Per-Instance White Hit-Flash + Cel-Outline
    const enemyGeo = createEnemySoldierGeometry();
    this.enemyHitFlashAttr = new THREE.InstancedBufferAttribute(
      new Float32Array(MAX_ENEMY_INSTANCES),
      1
    );
    this.enemyHitFlashAttr.setUsage(THREE.DynamicDrawUsage);
    enemyGeo.setAttribute('aHitFlash', this.enemyHitFlashAttr);

    const enemyMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.44,
      metalness: 0.18,
    });
    applyCommandoShader(enemyMat, this.enemyUniforms, 'commando-enemy-v40', true);

    this.enemyMesh = new THREE.InstancedMesh(enemyGeo, enemyMat, MAX_ENEMY_INSTANCES);
    this.enemyMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.enemyMesh.frustumCulled = false;
    this.enemyMesh.count = 0;
    scene.add(this.enemyMesh);

    const enemyOutlineMat = createCommandoCelOutlineMaterial(
      this.enemyUniforms,
      0.025,
      'commando-enemy-outline-v40'
    );
    this.enemyOutlineMesh = new THREE.InstancedMesh(
      enemyGeo,
      enemyOutlineMat,
      MAX_ENEMY_INSTANCES
    );
    this.enemyOutlineMesh.instanceMatrix = this.enemyMesh.instanceMatrix;
    this.enemyOutlineMesh.frustumCulled = false;
    this.enemyOutlineMesh.count = 0;
    scene.add(this.enemyOutlineMesh);

    // 4. Heavy Armored Juggernaut Elites + Per-Instance White Hit-Flash + Cel-Outline
    const heavyGeo = createHeavyEnemyGeometry();
    this.heavyHitFlashAttr = new THREE.InstancedBufferAttribute(
      new Float32Array(MAX_HEAVY_ENEMY_INSTANCES),
      1
    );
    this.heavyHitFlashAttr.setUsage(THREE.DynamicDrawUsage);
    heavyGeo.setAttribute('aHitFlash', this.heavyHitFlashAttr);

    const heavyMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.42,
      metalness: 0.24,
    });
    applyCommandoShader(heavyMat, this.enemyUniforms, 'commando-heavy-v40', true);

    this.heavyEnemyMesh = new THREE.InstancedMesh(
      heavyGeo,
      heavyMat,
      MAX_HEAVY_ENEMY_INSTANCES
    );
    this.heavyEnemyMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.heavyEnemyMesh.frustumCulled = false;
    this.heavyEnemyMesh.count = 0;
    scene.add(this.heavyEnemyMesh);

    const heavyOutlineMat = createCommandoCelOutlineMaterial(
      this.enemyUniforms,
      0.028,
      'commando-heavy-outline-v40'
    );
    this.heavyEnemyOutlineMesh = new THREE.InstancedMesh(
      heavyGeo,
      heavyOutlineMat,
      MAX_HEAVY_ENEMY_INSTANCES
    );
    this.heavyEnemyOutlineMesh.instanceMatrix = this.heavyEnemyMesh.instanceMatrix;
    this.heavyEnemyOutlineMesh.frustumCulled = false;
    this.heavyEnemyOutlineMesh.count = 0;
    scene.add(this.heavyEnemyOutlineMesh);

    // 5. Pooled Flying Knockback Ragdoll InstancedMeshes
    const ragdollPlayerGeo = createPlayerSoldierGeometry();
    const ragdollPlayerMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.46,
      metalness: 0.20,
    });
    this.playerRagdollMesh = new THREE.InstancedMesh(
      ragdollPlayerGeo,
      ragdollPlayerMat,
      MAX_RAGDOLL_INSTANCES
    );
    this.playerRagdollMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.playerRagdollMesh.frustumCulled = false;
    this.playerRagdollMesh.count = 0;
    scene.add(this.playerRagdollMesh);

    const ragdollEnemyGeo = createEnemySoldierGeometry();
    const ragdollEnemyMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.44,
      metalness: 0.22,
    });
    this.enemyRagdollMesh = new THREE.InstancedMesh(
      ragdollEnemyGeo,
      ragdollEnemyMat,
      MAX_RAGDOLL_INSTANCES
    );
    this.enemyRagdollMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.enemyRagdollMesh.frustumCulled = false;
    this.enemyRagdollMesh.count = 0;
    scene.add(this.enemyRagdollMesh);

    // 6. Soft AO Contact-Shadow Discs under all active troopers
    const discGeo = new THREE.PlaneGeometry(0.95, 0.95);
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

    // 7. Crisp Teardrop Bullet Tracer InstancedMesh
    const bulletGeo = createTracerBoltGeometry();
    const bulletMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.96,
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

    // 8. Shrapnel, Brass Casings & Smoke Particle InstancedMesh
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
    isMoving: boolean,
    equippedTier: WeaponTierId,
    steerBankAngle = 0,
    recoilKick = 0,
    barrelSpinAngle = 0,
    facingYaw = 0
  ): void {
    const safeCount = Math.min(count, MAX_VISUAL_SOLDIERS);
    this.playerMesh.count = safeCount;
    this.playerOutlineMesh.count = safeCount;
    this.shadowDiscCursor = 0;

    this.playerUniforms.uStrideTime.value = marchPhase * 11.8;
    this.playerUniforms.uStrideAmp.value = isMoving ? 0.66 : 0.0;
    this.playerUniforms.uRecoilKick.value = recoilKick;

    this.weaponUniforms.uBarrelSpin.value = barrelSpinAngle;
    this.weaponUniforms.uRecoilKick.value = recoilKick;

    this.enemyUniforms.uStrideTime.value = marchPhase * 10.6;

    const activeWeaponMesh = this.squadWeaponMeshes[equippedTier];
    for (const tier of [1, 2, 3, 4, 5] as const) {
      const m = this.squadWeaponMeshes[tier];
      if (tier === equippedTier) {
        m.visible = safeCount > 0;
        m.count = safeCount;
      } else {
        m.visible = false;
        m.count = 0;
      }
    }

    const s = COMMANDO_MODEL_SCALE;

    for (let i = 0; i < safeCount; i++) {
      const bobPhase = marchPhase * 11.8 + i * 0.92;
      const bobY = isMoving
        ? Math.abs(Math.sin(bobPhase)) * 0.072
        : Math.sin(marchPhase * 2.4 + i * 0.7) * 0.016;
      const swayZ = isMoving ? Math.sin(bobPhase) * 0.038 : 0;

      _pos.set(worldX[i], bobY, worldZ[i]);
      _euler.set(
        isMoving ? -0.07 : 0,
        facingYaw - steerBankAngle * 0.35,
        swayZ - steerBankAngle
      );
      _quat.setFromEuler(_euler);
      _scale.set(s, s, s);
      _mat4.compose(_pos, _quat, _scale);

      this.playerMesh.setMatrixAt(i, _mat4);
      activeWeaponMesh.setMatrixAt(i, _mat4);

      _pos.set(worldX[i], 0.022, worldZ[i]);
      _quat.identity();
      const shadowScale = 1.18 - bobY * 1.1;
      _scale.set(shadowScale, 1, shadowScale);
      _mat4.compose(_pos, _quat, _scale);
      this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++, _mat4);
    }

    this.playerMesh.instanceMatrix.needsUpdate = true;
    activeWeaponMesh.instanceMatrix.needsUpdate = true;
  }

  public beginEnemyFrame(): void {
    this.enemyMesh.count = 0;
    this.enemyOutlineMesh.count = 0;
    this.heavyEnemyMesh.count = 0;
    this.heavyEnemyOutlineMesh.count = 0;
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
    this.enemyOutlineMesh.count = idx + 1;

    const bob = Math.abs(Math.sin(phase)) * 0.068;
    const scalePop = ENEMY_MODEL_SCALE * (1 + hitFlash * 0.11);

    _pos.set(x, bob, z);
    _euler.set(0.08, 0, Math.sin(phase) * 0.048);
    _quat.setFromEuler(_euler);
    _scale.set(scalePop, scalePop, scalePop);
    _mat4.compose(_pos, _quat, _scale);
    this.enemyMesh.setMatrixAt(idx, _mat4);
    this.enemyHitFlashAttr.setX(idx, hitFlash);

    if (this.shadowDiscCursor < MAX_SHADOW_DISCS) {
      _pos.set(x, 0.022, z);
      _quat.identity();
      const shadowScale = 1.05 - bob * 1.1;
      _scale.set(shadowScale, 1, shadowScale);
      _mat4.compose(_pos, _quat, _scale);
      this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++, _mat4);
    }
  }

  public pushHeavyEnemySoldier(
    x: number,
    z: number,
    phase: number,
    hitFlash: number
  ): void {
    const idx = this.heavyEnemyMesh.count;
    if (idx >= MAX_HEAVY_ENEMY_INSTANCES) {
      return;
    }
    this.heavyEnemyMesh.count = idx + 1;
    this.heavyEnemyOutlineMesh.count = idx + 1;

    const bob = Math.abs(Math.sin(phase * 0.85)) * 0.058;
    const scalePop = HEAVY_ENEMY_SCALE * (1 + hitFlash * 0.10);

    _pos.set(x, bob, z);
    _euler.set(0.09, 0, Math.sin(phase * 0.85) * 0.042);
    _quat.setFromEuler(_euler);
    _scale.set(scalePop, scalePop, scalePop);
    _mat4.compose(_pos, _quat, _scale);
    this.heavyEnemyMesh.setMatrixAt(idx, _mat4);
    this.heavyHitFlashAttr.setX(idx, hitFlash);

    if (this.shadowDiscCursor < MAX_SHADOW_DISCS) {
      _pos.set(x, 0.022, z);
      _quat.identity();
      const shadowScale = 1.42 - bob * 1.1;
      _scale.set(shadowScale, 1, shadowScale);
      _mat4.compose(_pos, _quat, _scale);
      this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++, _mat4);
    }
  }

  public finishEnemyFrame(): void {
    this.enemyMesh.instanceMatrix.needsUpdate = true;
    this.enemyHitFlashAttr.needsUpdate = true;
    this.heavyEnemyMesh.instanceMatrix.needsUpdate = true;
    this.heavyHitFlashAttr.needsUpdate = true;
    this.shadowDiscMesh.count = this.shadowDiscCursor;
    this.shadowDiscMesh.instanceMatrix.needsUpdate = true;
  }

  public syncRagdolls(pool: RagdollPool): void {
    let pCount = 0;
    let eCount = 0;
    const n = pool.activeCount;

    for (let i = 0; i < n; i++) {
      const lifeLeft = 1 - pool.age[i] / pool.maxAge[i];
      const baseScale = pool.isEnemy[i] === 1 ? ENEMY_MODEL_SCALE : COMMANDO_MODEL_SCALE;
      const s = baseScale * (lifeLeft < 0.3 ? Math.max(0.05, lifeLeft / 0.3) : 1.0);

      _pos.set(pool.x[i], pool.y[i], pool.z[i]);
      _euler.set(pool.rx[i], pool.ry[i], pool.rz[i]);
      _quat.setFromEuler(_euler);
      _scale.set(s, s, s);
      _mat4.compose(_pos, _quat, _scale);

      if (pool.isEnemy[i] === 1) {
        if (eCount < MAX_RAGDOLL_INSTANCES) {
          this.enemyRagdollMesh.setMatrixAt(eCount++, _mat4);
        }
      } else if (pCount < MAX_RAGDOLL_INSTANCES) {
        this.playerRagdollMesh.setMatrixAt(pCount++, _mat4);
      }
    }

    this.playerRagdollMesh.count = pCount;
    this.enemyRagdollMesh.count = eCount;
    if (pCount > 0) {
      this.playerRagdollMesh.instanceMatrix.needsUpdate = true;
    }
    if (eCount > 0) {
      this.enemyRagdollMesh.instanceMatrix.needsUpdate = true;
    }
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
      _scale.set(s, s, s * 1.28);
      _mat4.compose(_pos, _quat, _scale);
      this.bulletMesh.setMatrixAt(i, _mat4);

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
