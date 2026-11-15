import * as THREE from 'three';
import type { BulletPool, ParticlePool, RagdollPool } from '../core/ObjectPool';
import type { SkinThemeId, WeaponTierId } from '../core/types';
import { COMMANDO_MODEL_SCALE, MAX_VISUAL_SOLDIERS } from '../math/weaponMath';
import {
  createBoyEnemySoldierGeometry,
  createEnemySoldierGeometry,
  createHeavyBoyEnemyGeometry,
  createHeavyEnemyGeometry,
  createMagicStarBoltGeometry,
  createPinkGirlSoldierGeometry,
  createPlayerSoldierGeometry,
  createTracerBoltGeometry,
} from './ProceduralGeometries';
import {
  createEquippedWeaponGeometry,
  EQUIPPED_GUN_PIVOT_X,
  EQUIPPED_GUN_PIVOT_Y,
} from './WeaponRigFactory';

const MAX_ENEMY_INSTANCES = 760;
const MAX_HEAVY_ENEMY_INSTANCES = 240;
const MAX_RAGDOLL_INSTANCES = 96;
const MAX_SHADOW_DISCS =
  MAX_VISUAL_SOLDIERS + MAX_ENEMY_INSTANCES + MAX_HEAVY_ENEMY_INSTANCES;

const ENEMY_MODEL_SCALE = 1.04;
const HEAVY_ENEMY_SCALE = 1.26;

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
  uUnicornSkin?: { value: number };
}

function buildCommandoStrideSnippet(enablePerInstanceStride: boolean): string {
  const ampExpr = enablePerInstanceStride ? '(uStrideAmp * aStrideScale)' : 'uStrideAmp';
  return /* glsl */ `
  {
    float phase = uStrideTime + float(gl_InstanceID) * 0.92;
    float sRaw = sin(phase);
    float effStrideAmp = ${ampExpr};
    float strideVal = sRaw * effStrideAmp;
    float limbAngle = 0.0;
    float bootLift = 0.0;
    float pivotY = 0.38;
    if (aPartId > 0.5 && aPartId < 1.5) {
      limbAngle = strideVal;
      bootLift = max(0.0, sRaw) * effStrideAmp * 0.065;
    } else if (aPartId > 1.5 && aPartId < 2.5) {
      limbAngle = -strideVal;
      bootLift = max(0.0, -sRaw) * effStrideAmp * 0.065;
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
}

/**
 * Injects single-pass GPU vertex animation (`aPartId`) plus optional per-instance solid-white
 * hit-flash (`aHitFlash` attribute), per-instance stride gating (`aStrideScale`), and echelon/outfit tint!
 */
function applyCommandoShader(
  mat: THREE.MeshStandardMaterial,
  uniforms: CommandoUniforms,
  cacheKey: string,
  enableHitFlash = false,
  enablePerInstanceStride = false,
  enableRankTint = false
): void {
  const ampExpr = enablePerInstanceStride ? '(uStrideAmp * aStrideScale)' : 'uStrideAmp';
  const strideSnippet = buildCommandoStrideSnippet(enablePerInstanceStride);
  mat.customProgramCacheKey = () => cacheKey;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uStrideTime = uniforms.uStrideTime;
    shader.uniforms.uStrideAmp = uniforms.uStrideAmp;
    shader.uniforms.uRecoilKick = uniforms.uRecoilKick;
    if (enableRankTint && uniforms.uUnicornSkin) {
      shader.uniforms.uUnicornSkin = uniforms.uUnicornSkin;
    }
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        attribute float aPartId;
        ${enableHitFlash ? 'attribute float aHitFlash;\nvarying float vHitFlash;' : ''}
        ${enablePerInstanceStride ? 'attribute float aStrideScale;' : ''}
        ${enableRankTint ? 'attribute float aRankTint;\nvarying float vRankTint;\nvarying float vLocalY;\nvarying float vAltOutfit;' : ''}
        varying vec3 vToonWorldNormal;
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
          float strideVal = sin(phase) * ${ampExpr};
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
        ${enableRankTint ? 'vRankTint = aRankTint;\nvLocalY = position.y;\nvAltOutfit = mod(float(gl_InstanceID), 2.0);' : ''}
        ${strideSnippet}
        {
          vec3 wn = mat3(modelMatrix) * objectNormal;
          #ifdef USE_INSTANCING
            wn = mat3(instanceMatrix) * objectNormal;
          #endif
          vToonWorldNormal = wn / max(0.0001, length(wn));
        }
        `
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        ${enableHitFlash ? 'varying float vHitFlash;' : ''}
        ${enableRankTint ? 'varying float vRankTint;\nvarying float vLocalY;\nvarying float vAltOutfit;\nuniform float uUnicornSkin;' : ''}
        varying vec3 vToonWorldNormal;
        `
      )
      .replace(
        '#include <dithering_fragment>',
        /* glsl */ `
        #include <dithering_fragment>
        ${
          enableRankTint
            ? `
        if (uUnicornSkin > 0.5) {
          if (vAltOutfit > 0.5 && max(gl_FragColor.g, gl_FragColor.b) > gl_FragColor.r * 1.18) {
            gl_FragColor.rgb = vec3(gl_FragColor.r, gl_FragColor.b * 0.92, gl_FragColor.g * 1.06);
          }
        } else if (vRankTint < 0.5 && vLocalY < 0.78 && vLocalY > 0.09) {
          vec3 voltSyndicate = gl_FragColor.rgb * vec3(1.18, 0.82, 0.22) + vec3(0.14, 0.07, 0.0);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, voltSyndicate, 0.84);
        }
        `
            : ''
        }
        {
          // Crisp stylized 2-band cel-saturation lift + moonlit cyan sky rim so characters pop!
          vec3 wn = vToonWorldNormal / max(0.0001, length(vToonWorldNormal));
          float topBand = smoothstep(-0.22, 0.35, wn.y * 0.72 - wn.z * 0.38 - wn.x * 0.25);
          gl_FragColor.rgb *= mix(0.92, 1.18, topBand);
          float skyRim = smoothstep(0.55, 0.92, wn.y);
          gl_FragColor.rgb += vec3(0.04, 0.09, 0.12) * skyRim;
        }
        ${
          enableHitFlash
            ? `
        if (vHitFlash > 0.01) {
          gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.22, 1.25, 1.32), clamp(vHitFlash * 1.18, 0.0, 0.96));
        }
        `
            : ''
        }
        `
      );
  };
}

/**
 * Single-pass BackSide inverted-hull cel-outline shader extruding along position-welded
 * `aOutlineNormal` so every sharp corner & smooth dome has a 100% watertight cartoon ink outline!
 */
function createCommandoCelOutlineMaterial(
  uniforms: CommandoUniforms,
  outlineThickness: number,
  cacheKey: string,
  enablePerInstanceStride = false
): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({
    color: 0x0b1018,
    side: THREE.BackSide,
  });
  const thickStr = outlineThickness.toFixed(4);
  const strideSnippet = buildCommandoStrideSnippet(enablePerInstanceStride);
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
        attribute vec3 aOutlineNormal;
        ${enablePerInstanceStride ? 'attribute float aStrideScale;' : ''}
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
          vec3 safeNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeNorm * ${thickStr};
        }
        ${strideSnippet}
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

function createEquippedWeaponOutlineMaterial(
  uniforms: WeaponBarrelSpinUniforms,
  outlineThickness: number,
  cacheKey: string
): THREE.MeshBasicMaterial {
  const cx = EQUIPPED_GUN_PIVOT_X.toFixed(4);
  const cy = (EQUIPPED_GUN_PIVOT_Y - 0.02).toFixed(4);
  const thickStr = outlineThickness.toFixed(4);

  const mat = new THREE.MeshBasicMaterial({
    color: 0x0b1018,
    side: THREE.BackSide,
  });
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
        attribute vec3 aOutlineNormal;
        uniform float uBarrelSpin;
        uniform float uRecoilKick;
        `
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `
        #include <begin_vertex>
        {
          vec3 safeNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeNorm * ${thickStr};
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
  return mat;
}

function desaturateGeometryToAshGrey(geo: THREE.BufferGeometry): void {
  const cAttr = geo.attributes.color as THREE.BufferAttribute | undefined;
  if (!cAttr) {
    return;
  }
  for (let i = 0; i < cAttr.count; i++) {
    const r = cAttr.getX(i);
    const g = cAttr.getY(i);
    const b = cAttr.getZ(i);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const grey = 0.18 + lum * 0.56;
    cAttr.setXYZ(i, grey * 0.95, grey * 0.99, grey * 1.05);
  }
  cAttr.needsUpdate = true;
}

function createStaticCelOutlineMaterial(
  outlineThickness: number,
  cacheKey: string
): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({
    color: 0x0b1018,
    side: THREE.BackSide,
  });
  const thickStr = outlineThickness.toFixed(4);
  mat.customProgramCacheKey = () => cacheKey;
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        attribute vec3 aOutlineNormal;
        `
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `
        #include <begin_vertex>
        {
          vec3 safeNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeNorm * ${thickStr};
        }
        `
      );
  };
  return mat;
}

export class InstancedBatchRenderer {
  public readonly playerMesh: THREE.InstancedMesh;
  public readonly playerOutlineMesh: THREE.InstancedMesh;
  public readonly enemyMesh: THREE.InstancedMesh;
  public readonly enemyOutlineMesh: THREE.InstancedMesh;
  public readonly heavyEnemyMesh: THREE.InstancedMesh;
  public readonly heavyEnemyOutlineMesh: THREE.InstancedMesh;
  public readonly squadWeaponMeshes: Readonly<Record<WeaponTierId, THREE.InstancedMesh>>;
  public readonly squadWeaponOutlineMeshes: Readonly<Record<WeaponTierId, THREE.InstancedMesh>>;
  public readonly playerRagdollMesh: THREE.InstancedMesh;
  public readonly enemyRagdollMesh: THREE.InstancedMesh;
  public readonly enemyRagdollOutlineMesh: THREE.InstancedMesh;
  public readonly bulletMesh: THREE.InstancedMesh;
  public readonly particleMesh: THREE.InstancedMesh;

  private readonly playerGeos: Record<SkinThemeId, THREE.BufferGeometry>;
  private readonly weaponGeos: Record<SkinThemeId, Record<WeaponTierId, THREE.BufferGeometry>>;
  private readonly enemyGeos: Record<SkinThemeId, THREE.BufferGeometry>;
  private readonly heavyGeos: Record<SkinThemeId, THREE.BufferGeometry>;
  private readonly ragdollPlayerGeos: Record<SkinThemeId, THREE.BufferGeometry>;
  private readonly ragdollEnemyGeos: Record<SkinThemeId, THREE.BufferGeometry>;
  private readonly bulletGeos: Record<SkinThemeId, THREE.BufferGeometry>;
  private readonly bulletMat: THREE.MeshBasicMaterial;
  private activeSkinTheme: SkinThemeId = 'TACTICAL';

  private readonly enemyHitFlashAttr: THREE.InstancedBufferAttribute;
  private readonly heavyHitFlashAttr: THREE.InstancedBufferAttribute;
  private readonly enemyStrideScaleAttr: THREE.InstancedBufferAttribute;
  private readonly heavyStrideScaleAttr: THREE.InstancedBufferAttribute;
  private readonly enemyRankTintAttr: THREE.InstancedBufferAttribute;

  private readonly playerUniforms: CommandoUniforms = {
    uStrideTime: { value: 0 },
    uStrideAmp: { value: 0 },
    uRecoilKick: { value: 0 },
  };
  private readonly enemyUniforms: CommandoUniforms = {
    uStrideTime: { value: 0 },
    uStrideAmp: { value: 0.68 },
    uRecoilKick: { value: 0 },
    uUnicornSkin: { value: 0 },
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
    // 1. Player Elite Commando / Pink Magical Squad Girl InstancedMesh + Shared-Matrix Welded Cel-Outline Pass
    this.playerGeos = {
      TACTICAL: createPlayerSoldierGeometry(),
      UNICORN: createPinkGirlSoldierGeometry(),
    };
    const playerGeo = this.playerGeos.TACTICAL;
    const playerMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.40,
      metalness: 0.14,
    });
    applyCommandoShader(playerMat, this.playerUniforms, 'commando-player-v71', false, false);

    this.playerMesh = new THREE.InstancedMesh(playerGeo, playerMat, MAX_VISUAL_SOLDIERS);
    this.playerMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.playerMesh.frustumCulled = false;
    this.playerMesh.count = 0;
    scene.add(this.playerMesh);

    const playerOutlineMat = createCommandoCelOutlineMaterial(
      this.playerUniforms,
      0.023,
      'commando-player-outline-v71',
      false
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

    // 2. Live Swappable 3D Squad Weapon / Unicorn Magic Horn & Wand Batches + Cel-Outline Pass (Tiers 1..5)
    const weaponMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.28,
      metalness: 0.34,
    });
    applyEquippedWeaponShader(weaponMat, this.weaponUniforms, 'commando-weapon-v71');
    const weaponOutlineMat = createEquippedWeaponOutlineMaterial(
      this.weaponUniforms,
      0.017,
      'commando-weapon-outline-v71'
    );

    this.weaponGeos = {
      TACTICAL: {
        1: createEquippedWeaponGeometry(1, 'TACTICAL'),
        2: createEquippedWeaponGeometry(2, 'TACTICAL'),
        3: createEquippedWeaponGeometry(3, 'TACTICAL'),
        4: createEquippedWeaponGeometry(4, 'TACTICAL'),
        5: createEquippedWeaponGeometry(5, 'TACTICAL'),
      },
      UNICORN: {
        1: createEquippedWeaponGeometry(1, 'UNICORN'),
        2: createEquippedWeaponGeometry(2, 'UNICORN'),
        3: createEquippedWeaponGeometry(3, 'UNICORN'),
        4: createEquippedWeaponGeometry(4, 'UNICORN'),
        5: createEquippedWeaponGeometry(5, 'UNICORN'),
      },
    };

    const wMeshes = {} as Record<WeaponTierId, THREE.InstancedMesh>;
    const wOutlines = {} as Record<WeaponTierId, THREE.InstancedMesh>;
    for (const tier of [1, 2, 3, 4, 5] as const) {
      const wGeo = this.weaponGeos.TACTICAL[tier];
      const wMesh = new THREE.InstancedMesh(wGeo, weaponMat, MAX_VISUAL_SOLDIERS);
      wMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      wMesh.frustumCulled = false;
      wMesh.count = 0;
      wMesh.visible = tier === 1;
      scene.add(wMesh);
      wMeshes[tier] = wMesh;

      const wOut = new THREE.InstancedMesh(wGeo, weaponOutlineMat, MAX_VISUAL_SOLDIERS);
      wOut.instanceMatrix = wMesh.instanceMatrix;
      wOut.frustumCulled = false;
      wOut.count = 0;
      wOut.visible = tier === 1;
      scene.add(wOut);
      wOutlines[tier] = wOut;
    }
    this.squadWeaponMeshes = wMeshes;
    this.squadWeaponOutlineMeshes = wOutlines;

    // 3. Standard Enemy Shock Troopers / Blue & Green Boys + Shared InstancedBufferAttributes
    this.enemyGeos = {
      TACTICAL: createEnemySoldierGeometry(),
      UNICORN: createBoyEnemySoldierGeometry(),
    };
    this.enemyHitFlashAttr = new THREE.InstancedBufferAttribute(
      new Float32Array(MAX_ENEMY_INSTANCES),
      1
    );
    this.enemyHitFlashAttr.setUsage(THREE.DynamicDrawUsage);

    const enemyStrideInitial = new Float32Array(MAX_ENEMY_INSTANCES);
    enemyStrideInitial.fill(1);
    this.enemyStrideScaleAttr = new THREE.InstancedBufferAttribute(enemyStrideInitial, 1);
    this.enemyStrideScaleAttr.setUsage(THREE.DynamicDrawUsage);

    const enemyRankInitial = new Float32Array(MAX_ENEMY_INSTANCES);
    enemyRankInitial.fill(1);
    this.enemyRankTintAttr = new THREE.InstancedBufferAttribute(enemyRankInitial, 1);
    this.enemyRankTintAttr.setUsage(THREE.DynamicDrawUsage);

    for (const g of [this.enemyGeos.TACTICAL, this.enemyGeos.UNICORN]) {
      g.setAttribute('aHitFlash', this.enemyHitFlashAttr);
      g.setAttribute('aStrideScale', this.enemyStrideScaleAttr);
      g.setAttribute('aRankTint', this.enemyRankTintAttr);
    }

    const enemyMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.40,
      metalness: 0.18,
    });
    applyCommandoShader(enemyMat, this.enemyUniforms, 'commando-enemy-v71', true, true, true);

    const enemyGeo = this.enemyGeos.TACTICAL;
    this.enemyMesh = new THREE.InstancedMesh(enemyGeo, enemyMat, MAX_ENEMY_INSTANCES);
    this.enemyMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.enemyMesh.frustumCulled = false;
    this.enemyMesh.count = 0;
    scene.add(this.enemyMesh);

    const enemyOutlineMat = createCommandoCelOutlineMaterial(
      this.enemyUniforms,
      0.023,
      'commando-enemy-outline-v71',
      true
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

    // 4. Heavy Armored Juggernauts / Varsity Blue & Green Boy Captains
    this.heavyGeos = {
      TACTICAL: createHeavyEnemyGeometry(),
      UNICORN: createHeavyBoyEnemyGeometry(),
    };
    this.heavyHitFlashAttr = new THREE.InstancedBufferAttribute(
      new Float32Array(MAX_HEAVY_ENEMY_INSTANCES),
      1
    );
    this.heavyHitFlashAttr.setUsage(THREE.DynamicDrawUsage);

    const heavyStrideInitial = new Float32Array(MAX_HEAVY_ENEMY_INSTANCES);
    heavyStrideInitial.fill(1);
    this.heavyStrideScaleAttr = new THREE.InstancedBufferAttribute(heavyStrideInitial, 1);
    this.heavyStrideScaleAttr.setUsage(THREE.DynamicDrawUsage);

    for (const hg of [this.heavyGeos.TACTICAL, this.heavyGeos.UNICORN]) {
      hg.setAttribute('aHitFlash', this.heavyHitFlashAttr);
      hg.setAttribute('aStrideScale', this.heavyStrideScaleAttr);
    }

    const heavyMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.36,
      metalness: 0.24,
    });
    applyCommandoShader(heavyMat, this.enemyUniforms, 'commando-heavy-v71', true, true);

    const heavyGeo = this.heavyGeos.TACTICAL;
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
      0.026,
      'commando-heavy-outline-v71',
      true
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
    this.ragdollPlayerGeos = {
      TACTICAL: createPlayerSoldierGeometry(),
      UNICORN: createPinkGirlSoldierGeometry(),
    };
    const ragdollPlayerMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.44,
      metalness: 0.16,
    });
    this.playerRagdollMesh = new THREE.InstancedMesh(
      this.ragdollPlayerGeos.TACTICAL,
      ragdollPlayerMat,
      MAX_RAGDOLL_INSTANCES
    );
    this.playerRagdollMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.playerRagdollMesh.frustumCulled = false;
    this.playerRagdollMesh.count = 0;
    scene.add(this.playerRagdollMesh);

    const ragEnemyTac = createEnemySoldierGeometry();
    desaturateGeometryToAshGrey(ragEnemyTac);
    const ragEnemyUni = createBoyEnemySoldierGeometry();
    desaturateGeometryToAshGrey(ragEnemyUni);
    this.ragdollEnemyGeos = {
      TACTICAL: ragEnemyTac,
      UNICORN: ragEnemyUni,
    };
    const ragdollEnemyMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.48,
      metalness: 0.10,
    });
    this.enemyRagdollMesh = new THREE.InstancedMesh(
      this.ragdollEnemyGeos.TACTICAL,
      ragdollEnemyMat,
      MAX_RAGDOLL_INSTANCES
    );
    this.enemyRagdollMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.enemyRagdollMesh.frustumCulled = false;
    this.enemyRagdollMesh.count = 0;
    scene.add(this.enemyRagdollMesh);

    const ragdollEnemyOutlineMat = createStaticCelOutlineMaterial(
      0.022,
      'ragdoll-enemy-outline-v71'
    );
    this.enemyRagdollOutlineMesh = new THREE.InstancedMesh(
      this.ragdollEnemyGeos.TACTICAL,
      ragdollEnemyOutlineMat,
      MAX_RAGDOLL_INSTANCES
    );
    this.enemyRagdollOutlineMesh.instanceMatrix = this.enemyRagdollMesh.instanceMatrix;
    this.enemyRagdollOutlineMesh.frustumCulled = false;
    this.enemyRagdollOutlineMesh.count = 0;
    scene.add(this.enemyRagdollOutlineMesh);

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

    // 7. Crisp Elongated Bullet Tracer / Magical Starlight Bolt InstancedMesh
    this.bulletGeos = {
      TACTICAL: createTracerBoltGeometry(),
      UNICORN: createMagicStarBoltGeometry(),
    };
    this.bulletMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.NormalBlending,
      toneMapped: false,
      depthWrite: false,
    });
    this.bulletMesh = new THREE.InstancedMesh(
      this.bulletGeos.TACTICAL,
      this.bulletMat,
      bulletCapacity
    );
    this.bulletMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.bulletMesh.frustumCulled = false;
    this.bulletMesh.count = 0;
    for (let i = 0; i < bulletCapacity; i++) {
      this.bulletMesh.setColorAt(i, _color.setRGB(1, 1, 1));
    }
    scene.add(this.bulletMesh);

    // 8. Shrapnel, Brass Casings & Gold Confetti Particle InstancedMesh
    const particleGeo = new THREE.DodecahedronGeometry(0.58, 0);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.36,
      metalness: 0.32,
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

  public setSkinTheme(theme: SkinThemeId): void {
    if (this.activeSkinTheme === theme) {
      return;
    }
    this.activeSkinTheme = theme;
    this.enemyUniforms.uUnicornSkin!.value = theme === 'UNICORN' ? 1.0 : 0.0;

    this.playerMesh.geometry = this.playerGeos[theme];
    this.playerOutlineMesh.geometry = this.playerGeos[theme];

    for (const tier of [1, 2, 3, 4, 5] as const) {
      const wg = this.weaponGeos[theme][tier];
      this.squadWeaponMeshes[tier].geometry = wg;
      this.squadWeaponOutlineMeshes[tier].geometry = wg;
    }

    this.enemyMesh.geometry = this.enemyGeos[theme];
    this.enemyOutlineMesh.geometry = this.enemyGeos[theme];

    this.heavyEnemyMesh.geometry = this.heavyGeos[theme];
    this.heavyEnemyOutlineMesh.geometry = this.heavyGeos[theme];

    this.playerRagdollMesh.geometry = this.ragdollPlayerGeos[theme];
    this.enemyRagdollMesh.geometry = this.ragdollEnemyGeos[theme];
    this.enemyRagdollOutlineMesh.geometry = this.ragdollEnemyGeos[theme];

    this.bulletMesh.geometry = this.bulletGeos[theme];
    this.bulletMat.depthWrite = theme === 'UNICORN';
    this.bulletMat.opacity = theme === 'UNICORN' ? 1.0 : 0.95;
    this.bulletMat.needsUpdate = true;
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
    facingYaw = 0,
    celebrateHop = 0,
    focalX = 0,
    focalZ = -23.5,
    aimAtFocal = isMoving
  ): void {
    const safeCount = Math.min(count, MAX_VISUAL_SOLDIERS);
    this.playerMesh.count = safeCount;
    this.playerOutlineMesh.count = safeCount;
    this.shadowDiscCursor = 0;

    this.playerUniforms.uStrideTime.value = marchPhase * 11.8;
    this.playerUniforms.uStrideAmp.value = isMoving ? 0.66 : Math.min(0.32, 0.035 + Math.abs(steerBankAngle) * 1.6);
    this.playerUniforms.uRecoilKick.value = recoilKick;

    this.weaponUniforms.uBarrelSpin.value = barrelSpinAngle;
    this.weaponUniforms.uRecoilKick.value = recoilKick;

    this.enemyUniforms.uStrideTime.value = marchPhase * 10.6;

    const activeWeaponMesh = this.squadWeaponMeshes[equippedTier];
    for (const tier of [1, 2, 3, 4, 5] as const) {
      const m = this.squadWeaponMeshes[tier];
      const mOut = this.squadWeaponOutlineMeshes[tier];
      if (tier === equippedTier) {
        m.visible = safeCount > 0;
        m.count = safeCount;
        mOut.visible = safeCount > 0;
        mOut.count = safeCount;
      } else {
        m.visible = false;
        m.count = 0;
        mOut.visible = false;
        mOut.count = 0;
      }
    }

    const hopY = Math.sin(celebrateHop * Math.PI) * 0.34;
    const s = COMMANDO_MODEL_SCALE * (1 + Math.sin(celebrateHop * Math.PI) * 0.08);
    const gripLocalX = EQUIPPED_GUN_PIVOT_X;
    const gripLocalZ = -0.235;

    for (let i = 0; i < safeCount; i++) {
      const wx = worldX[i];
      const wz = worldZ[i];
      const bobPhase = marchPhase * 11.8 + i * 0.92;
      const bobY =
        (isMoving
          ? Math.abs(Math.sin(bobPhase)) * 0.072
          : Math.sin(marchPhase * 2.4 + i * 0.7) * 0.016) + hopY;
      const swayZ = isMoving ? Math.sin(bobPhase) * 0.036 : 0;

      // Per-commando inward gun aim toward (focalX, focalZ) so left & right flank guns point into the cone!
      const inwardGunYaw = aimAtFocal
        ? Math.max(-0.38, Math.min(0.38, -Math.atan2(focalX - wx, Math.max(5.5, wz - focalZ))))
        : facingYaw - 0.14;
      const yawGun = inwardGunYaw - steerBankAngle * 0.35;
      const yawBody =
        (aimAtFocal ? -0.45 + inwardGunYaw * 0.72 : facingYaw - 0.52) -
        steerBankAngle * 0.35;

      const bodyGripX = gripLocalX * Math.cos(yawBody) + gripLocalZ * Math.sin(yawBody);
      const bodyGripZ = -gripLocalX * Math.sin(yawBody) + gripLocalZ * Math.cos(yawBody);
      const gunGripX = gripLocalX * Math.cos(yawGun) + gripLocalZ * Math.sin(yawGun);
      const gunGripZ = -gripLocalX * Math.sin(yawGun) + gripLocalZ * Math.cos(yawGun);
      const gunShiftX = (bodyGripX - gunGripX) * s;
      const gunShiftZ = (bodyGripZ - gunGripZ) * s;

      _pos.set(wx, bobY, wz);
      _euler.set(
        isMoving ? -0.07 : -0.04,
        yawBody,
        swayZ - steerBankAngle
      );
      _quat.setFromEuler(_euler);
      _scale.set(s, s, s);
      _mat4.compose(_pos, _quat, _scale);
      this.playerMesh.setMatrixAt(i, _mat4);

      _pos.set(wx + gunShiftX, bobY, wz + gunShiftZ);
      _euler.set(
        isMoving ? -0.04 : -0.02,
        yawGun,
        swayZ * 0.5 - steerBankAngle * 0.7
      );
      _quat.setFromEuler(_euler);
      _mat4.compose(_pos, _quat, _scale);
      activeWeaponMesh.setMatrixAt(i, _mat4);

      _pos.set(wx, 0.022, wz);
      _quat.identity();
      const shadowScale = Math.max(0.58, 0.92 - bobY * 0.85);
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
    hitFlash: number,
    isMarching = true,
    isVanguard = false
  ): void {
    const idx = this.enemyMesh.count;
    if (idx >= MAX_ENEMY_INSTANCES) {
      return;
    }
    this.enemyMesh.count = idx + 1;
    this.enemyOutlineMesh.count = idx + 1;

    const bob = isMarching ? Math.abs(Math.sin(phase)) * 0.068 : 0;
    const roll = isMarching ? Math.sin(phase) * 0.048 : 0;
    const scalePop = ENEMY_MODEL_SCALE * (isVanguard ? 0.96 : 1.0) * (1 + hitFlash * 0.11);

    _pos.set(x, bob, z);
    _euler.set(isMarching ? 0.08 : 0.03, 0, roll);
    _quat.setFromEuler(_euler);
    _scale.set(scalePop, scalePop, scalePop);
    _mat4.compose(_pos, _quat, _scale);
    this.enemyMesh.setMatrixAt(idx, _mat4);
    this.enemyHitFlashAttr.setX(idx, hitFlash);
    this.enemyStrideScaleAttr.setX(idx, isMarching ? 1.0 : 0.04);
    this.enemyRankTintAttr.setX(idx, isVanguard ? 0.0 : 1.0);

    if (this.shadowDiscCursor < MAX_SHADOW_DISCS) {
      _pos.set(x, 0.022, z);
      _quat.identity();
      const shadowScale = 0.88 - bob * 0.9;
      _scale.set(shadowScale, 1, shadowScale);
      _mat4.compose(_pos, _quat, _scale);
      this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++, _mat4);
    }
  }

  public pushHeavyEnemySoldier(
    x: number,
    z: number,
    phase: number,
    hitFlash: number,
    isMarching = true
  ): void {
    const idx = this.heavyEnemyMesh.count;
    if (idx >= MAX_HEAVY_ENEMY_INSTANCES) {
      return;
    }
    this.heavyEnemyMesh.count = idx + 1;
    this.heavyEnemyOutlineMesh.count = idx + 1;

    const bob = isMarching ? Math.abs(Math.sin(phase * 0.85)) * 0.058 : 0;
    const roll = isMarching ? Math.sin(phase * 0.85) * 0.042 : 0;
    const scalePop = HEAVY_ENEMY_SCALE * (1 + hitFlash * 0.10);

    _pos.set(x, bob, z);
    _euler.set(isMarching ? 0.09 : 0.03, 0, roll);
    _quat.setFromEuler(_euler);
    _scale.set(scalePop, scalePop, scalePop);
    _mat4.compose(_pos, _quat, _scale);
    this.heavyEnemyMesh.setMatrixAt(idx, _mat4);
    this.heavyHitFlashAttr.setX(idx, hitFlash);
    this.heavyStrideScaleAttr.setX(idx, isMarching ? 1.0 : 0.04);

    if (this.shadowDiscCursor < MAX_SHADOW_DISCS) {
      _pos.set(x, 0.022, z);
      _quat.identity();
      const shadowScale = 1.18 - bob * 0.9;
      _scale.set(shadowScale, 1, shadowScale);
      _mat4.compose(_pos, _quat, _scale);
      this.shadowDiscMesh.setMatrixAt(this.shadowDiscCursor++, _mat4);
    }
  }

  public finishEnemyFrame(): void {
    this.enemyMesh.instanceMatrix.needsUpdate = true;
    this.enemyHitFlashAttr.needsUpdate = true;
    this.enemyStrideScaleAttr.needsUpdate = true;
    this.enemyRankTintAttr.needsUpdate = true;
    this.heavyEnemyMesh.instanceMatrix.needsUpdate = true;
    this.heavyHitFlashAttr.needsUpdate = true;
    this.heavyStrideScaleAttr.needsUpdate = true;
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
    this.enemyRagdollOutlineMesh.count = eCount;
    if (pCount > 0) {
      this.playerRagdollMesh.instanceMatrix.needsUpdate = true;
    }
    if (eCount > 0) {
      this.enemyRagdollMesh.instanceMatrix.needsUpdate = true;
    }
  }

  public syncBullets(pool: BulletPool): void {
    const n = pool.activeCount;
    const isUnicorn = this.activeSkinTheme === 'UNICORN';
    this.bulletMesh.count = n;
    for (let i = 0; i < n; i++) {
      _pos.set(pool.x[i], pool.y[i], pool.z[i]);
      const yaw = Math.atan2(pool.vx[i], pool.vz[i]);
      _euler.set(0, yaw + Math.PI, 0);
      _quat.setFromEuler(_euler);
      const s = pool.scale[i];
      if (isUnicorn) {
        _scale.set(s * 1.16, s * 1.14, s * 1.34);
      } else {
        _scale.set(s * 0.88, s * 0.88, s * 1.48);
      }
      _mat4.compose(_pos, _quat, _scale);
      this.bulletMesh.setMatrixAt(i, _mat4);

      if (isUnicorn) {
        _color.setRGB(1.02, 1.02, 1.02);
      } else {
        _color.setRGB(
          0.08 + pool.colorR[i] * 0.96,
          0.08 + pool.colorG[i] * 0.96,
          0.08 + pool.colorB[i] * 0.96
        );
      }
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
