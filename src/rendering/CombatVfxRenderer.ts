import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  attachWeldedOutlineNormals,
  createPoppingTireGeometry,
  createSpinningCoinGeometry,
} from './ProceduralGeometries';

const MAX_SHOCKWAVES = 40;
const MAX_MUZZLE_FLASHES = 64;
const MAX_IMPACT_SPLASHES = 96;
const MAX_FIREBALLS = 24;
const MAX_TIRE_DEBRIS = 48;
const MAX_MAGNET_COINS = 140;

const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _color = new THREE.Color();
const _camDir = new THREE.Vector3();
const _coinTargetWorld = new THREE.Vector3();

function createCartoonFireballGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const lobes: ReadonlyArray<readonly [number, number, number, number]> = [
    [0, 0, 0, 0.56],
    [0.34, 0.22, 0.14, 0.36],
    [-0.36, 0.18, -0.10, 0.35],
    [0.12, 0.44, -0.16, 0.32],
    [-0.18, -0.14, 0.32, 0.30],
    [0.24, -0.12, -0.28, 0.30],
  ];
  for (const [lx, ly, lz, lr] of lobes) {
    const g = new THREE.IcosahedronGeometry(lr, 1);
    g.translate(lx, ly, lz);
    const nonIdx = g.index ? g.toNonIndexed() : g;
    nonIdx.deleteAttribute('uv');
    parts.push(nonIdx);
    if (nonIdx !== g) {
      g.dispose();
    }
  }
  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  merged.computeVertexNormals();
  attachWeldedOutlineNormals(merged);
  return merged;
}

function createWeldedOutlineMat(thickness: number, cacheKey: string): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({
    color: 0x0b1018,
    side: THREE.BackSide,
  });
  const thickStr = thickness.toFixed(4);
  mat.customProgramCacheKey = () => cacheKey;
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute vec3 aOutlineNormal;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          vec3 safeNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeNorm * ${thickStr};
        }`
      );
  };
  return mat;
}

/**
 * Zero-GC pooled arcade VFX system (single-pass forward WebGL, zero FBOs):
 * 1. Expanding flat ground shockwave rings
 * 2. Crisp 3-fin additive muzzle flash bursts
 * 3. Cel-outlined comic smoke/impact puff clouds
 * 4. Stylized billowing cartoon fireballs (on tire/barricade destruction)
 * 5. Gravity-arcing popping 3D tire debris with deck bounce
 * 6. Magnetized spinning 3D gold coins arcing directly into the top-right HUD coin counter!
 */
export class CombatVfxRenderer {
  private readonly ringMesh: THREE.InstancedMesh;
  private readonly ringX = new Float32Array(MAX_SHOCKWAVES);
  private readonly ringZ = new Float32Array(MAX_SHOCKWAVES);
  private readonly ringAge = new Float32Array(MAX_SHOCKWAVES);
  private readonly ringMaxAge = new Float32Array(MAX_SHOCKWAVES);
  private readonly ringMaxRadius = new Float32Array(MAX_SHOCKWAVES);
  private readonly ringR = new Float32Array(MAX_SHOCKWAVES);
  private readonly ringG = new Float32Array(MAX_SHOCKWAVES);
  private readonly ringB = new Float32Array(MAX_SHOCKWAVES);
  private activeRings = 0;

  private readonly flashMesh: THREE.InstancedMesh;
  private readonly flashX = new Float32Array(MAX_MUZZLE_FLASHES);
  private readonly flashY = new Float32Array(MAX_MUZZLE_FLASHES);
  private readonly flashZ = new Float32Array(MAX_MUZZLE_FLASHES);
  private readonly flashAge = new Float32Array(MAX_MUZZLE_FLASHES);
  private readonly flashMaxAge = new Float32Array(MAX_MUZZLE_FLASHES);
  private readonly flashScale = new Float32Array(MAX_MUZZLE_FLASHES);
  private readonly flashR = new Float32Array(MAX_MUZZLE_FLASHES);
  private readonly flashG = new Float32Array(MAX_MUZZLE_FLASHES);
  private readonly flashB = new Float32Array(MAX_MUZZLE_FLASHES);
  private activeFlashes = 0;

  private readonly splashMesh: THREE.InstancedMesh;
  private readonly splashX = new Float32Array(MAX_IMPACT_SPLASHES);
  private readonly splashY = new Float32Array(MAX_IMPACT_SPLASHES);
  private readonly splashZ = new Float32Array(MAX_IMPACT_SPLASHES);
  private readonly splashAge = new Float32Array(MAX_IMPACT_SPLASHES);
  private readonly splashMaxAge = new Float32Array(MAX_IMPACT_SPLASHES);
  private readonly splashScale = new Float32Array(MAX_IMPACT_SPLASHES);
  private readonly splashR = new Float32Array(MAX_IMPACT_SPLASHES);
  private readonly splashG = new Float32Array(MAX_IMPACT_SPLASHES);
  private readonly splashB = new Float32Array(MAX_IMPACT_SPLASHES);
  private activeSplashes = 0;

  // 4. Stylized Cartoon Fireballs
  private readonly fireballMesh: THREE.InstancedMesh;
  private readonly fireballOutlineMesh: THREE.InstancedMesh;
  private readonly fbX = new Float32Array(MAX_FIREBALLS);
  private readonly fbY = new Float32Array(MAX_FIREBALLS);
  private readonly fbZ = new Float32Array(MAX_FIREBALLS);
  private readonly fbAge = new Float32Array(MAX_FIREBALLS);
  private readonly fbMaxAge = new Float32Array(MAX_FIREBALLS);
  private readonly fbScale = new Float32Array(MAX_FIREBALLS);
  private activeFireballs = 0;

  // 5. Gravity-Arcing Popping Tire Debris
  private readonly tireMesh: THREE.InstancedMesh;
  private readonly tireOutlineMesh: THREE.InstancedMesh;
  private readonly tireX = new Float32Array(MAX_TIRE_DEBRIS);
  private readonly tireY = new Float32Array(MAX_TIRE_DEBRIS);
  private readonly tireZ = new Float32Array(MAX_TIRE_DEBRIS);
  private readonly tireVx = new Float32Array(MAX_TIRE_DEBRIS);
  private readonly tireVy = new Float32Array(MAX_TIRE_DEBRIS);
  private readonly tireVz = new Float32Array(MAX_TIRE_DEBRIS);
  private readonly tireRx = new Float32Array(MAX_TIRE_DEBRIS);
  private readonly tireRy = new Float32Array(MAX_TIRE_DEBRIS);
  private readonly tireRz = new Float32Array(MAX_TIRE_DEBRIS);
  private readonly tireSpinX = new Float32Array(MAX_TIRE_DEBRIS);
  private readonly tireSpinY = new Float32Array(MAX_TIRE_DEBRIS);
  private readonly tireAge = new Float32Array(MAX_TIRE_DEBRIS);
  private readonly tireMaxAge = new Float32Array(MAX_TIRE_DEBRIS);
  private activeTires = 0;
  private tireSeed = 1;

  // 6. Magnetized Spinning 3D Coins Arcing to Top-Right HUD Coin Counter
  private readonly coinMesh: THREE.InstancedMesh;
  private readonly coinOutlineMesh: THREE.InstancedMesh;
  private readonly coinX = new Float32Array(MAX_MAGNET_COINS);
  private readonly coinY = new Float32Array(MAX_MAGNET_COINS);
  private readonly coinZ = new Float32Array(MAX_MAGNET_COINS);
  private readonly coinStartX = new Float32Array(MAX_MAGNET_COINS);
  private readonly coinStartY = new Float32Array(MAX_MAGNET_COINS);
  private readonly coinStartZ = new Float32Array(MAX_MAGNET_COINS);
  private readonly coinVx = new Float32Array(MAX_MAGNET_COINS);
  private readonly coinVy = new Float32Array(MAX_MAGNET_COINS);
  private readonly coinVz = new Float32Array(MAX_MAGNET_COINS);
  private readonly coinAge = new Float32Array(MAX_MAGNET_COINS);
  private readonly coinPopDur = new Float32Array(MAX_MAGNET_COINS);
  private readonly coinMaxAge = new Float32Array(MAX_MAGNET_COINS);
  private readonly coinValue = new Int32Array(MAX_MAGNET_COINS);
  private readonly coinSpin = new Float32Array(MAX_MAGNET_COINS);
  private activeCoins = 0;
  private coinSeed = 1;

  constructor(scene: THREE.Scene) {
    // 1. Shockwave Ring InstancedMesh (Additive HDR glow)
    const ringGeo = new THREE.RingGeometry(0.76, 1.0, 28);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.ringMesh = new THREE.InstancedMesh(ringGeo, ringMat, MAX_SHOCKWAVES);
    this.ringMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.ringMesh.frustumCulled = false;
    this.ringMesh.count = 0;
    for (let i = 0; i < MAX_SHOCKWAVES; i++) {
      this.ringMesh.setColorAt(i, _color.setRGB(1, 1, 1));
    }
    scene.add(this.ringMesh);

    // 2. Crossed-plane Star Muzzle Flash Geometry
    const p1 = new THREE.BoxGeometry(0.28, 0.045, 0.42);
    const p2 = new THREE.BoxGeometry(0.045, 0.28, 0.42);
    const core = new THREE.BoxGeometry(0.12, 0.12, 0.24);
    const g1 = p1.toNonIndexed();
    const g2 = p2.toNonIndexed();
    const g3 = core.toNonIndexed();
    const totalPos = new Float32Array(
      (g1.attributes.position.count +
        g2.attributes.position.count +
        g3.attributes.position.count) *
        3
    );
    totalPos.set(g1.attributes.position.array as Float32Array, 0);
    totalPos.set(
      g2.attributes.position.array as Float32Array,
      g1.attributes.position.array.length
    );
    totalPos.set(
      g3.attributes.position.array as Float32Array,
      g1.attributes.position.array.length + g2.attributes.position.array.length
    );
    p1.dispose();
    p2.dispose();
    core.dispose();
    g1.dispose();
    g2.dispose();
    g3.dispose();

    const flashGeo = new THREE.BufferGeometry();
    flashGeo.setAttribute('position', new THREE.BufferAttribute(totalPos, 3));
    flashGeo.computeVertexNormals();

    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.flashMesh = new THREE.InstancedMesh(flashGeo, flashMat, MAX_MUZZLE_FLASHES);
    this.flashMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.flashMesh.frustumCulled = false;
    this.flashMesh.count = 0;
    for (let i = 0; i < MAX_MUZZLE_FLASHES; i++) {
      this.flashMesh.setColorAt(i, _color.setRGB(1, 1, 1));
    }
    scene.add(this.flashMesh);

    // 3. Camera-facing Cel-Outlined Comic Impact Smoke Puff InstancedMesh
    const splashCanvas = document.createElement('canvas');
    splashCanvas.width = 128;
    splashCanvas.height = 128;
    const sCtx = splashCanvas.getContext('2d')!;
    const lobes: ReadonlyArray<readonly [number, number, number]> = [
      [64, 64, 30],
      [42, 58, 22],
      [86, 56, 23],
      [50, 82, 20],
      [78, 80, 21],
      [64, 42, 21],
    ];
    sCtx.fillStyle = 'rgba(16, 24, 36, 0.78)';
    for (const [lx, ly, lr] of lobes) {
      sCtx.beginPath();
      sCtx.arc(lx, ly, lr + 5, 0, Math.PI * 2);
      sCtx.fill();
    }
    sCtx.fillStyle = 'rgba(246, 250, 255, 0.97)';
    for (const [lx, ly, lr] of lobes) {
      sCtx.beginPath();
      sCtx.arc(lx, ly, lr, 0, Math.PI * 2);
      sCtx.fill();
    }
    sCtx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    for (const [lx, ly, lr] of lobes) {
      sCtx.beginPath();
      sCtx.arc(lx - 2, ly - 3, lr * 0.40, 0, Math.PI * 2);
      sCtx.fill();
    }
    sCtx.save();
    sCtx.translate(64, 64);
    sCtx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    for (let k = 0; k < 5; k++) {
      sCtx.rotate((Math.PI * 2) / 5);
      sCtx.beginPath();
      sCtx.moveTo(-3.5, -24);
      sCtx.lineTo(0, -56);
      sCtx.lineTo(3.5, -24);
      sCtx.closePath();
      sCtx.fill();
    }
    sCtx.restore();

    const splashTex = new THREE.CanvasTexture(splashCanvas);
    splashTex.colorSpace = THREE.SRGBColorSpace;
    const splashGeo = new THREE.PlaneGeometry(1.08, 1.08);
    splashGeo.rotateX(-0.42);
    const splashMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: splashTex,
      transparent: true,
      opacity: 0.94,
      blending: THREE.NormalBlending,
      toneMapped: false,
      alphaTest: 0.03,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.splashMesh = new THREE.InstancedMesh(splashGeo, splashMat, MAX_IMPACT_SPLASHES);
    this.splashMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.splashMesh.frustumCulled = false;
    this.splashMesh.count = 0;
    for (let i = 0; i < MAX_IMPACT_SPLASHES; i++) {
      this.splashMesh.setColorAt(i, _color.setRGB(1, 1, 1));
    }
    scene.add(this.splashMesh);

    // 4. Stylized Billowing Cartoon Fireball InstancedMesh + Cel-Outline
    const fireballGeo = createCartoonFireballGeometry();
    const fireballMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false,
    });
    this.fireballMesh = new THREE.InstancedMesh(fireballGeo, fireballMat, MAX_FIREBALLS);
    this.fireballMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.fireballMesh.frustumCulled = false;
    this.fireballMesh.count = 0;
    for (let i = 0; i < MAX_FIREBALLS; i++) {
      this.fireballMesh.setColorAt(i, _color.setRGB(1, 0.7, 0.2));
    }
    scene.add(this.fireballMesh);

    const fbOutlineMat = createWeldedOutlineMat(0.052, 'fireball-outline-v80');
    this.fireballOutlineMesh = new THREE.InstancedMesh(fireballGeo, fbOutlineMat, MAX_FIREBALLS);
    this.fireballOutlineMesh.instanceMatrix = this.fireballMesh.instanceMatrix;
    this.fireballOutlineMesh.frustumCulled = false;
    this.fireballOutlineMesh.count = 0;
    scene.add(this.fireballOutlineMesh);

    // 5. Popping 3D Tire Debris InstancedMesh + Cel-Outline
    const tireGeo = createPoppingTireGeometry();
    const tireMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.56,
      metalness: 0.22,
    });
    this.tireMesh = new THREE.InstancedMesh(tireGeo, tireMat, MAX_TIRE_DEBRIS);
    this.tireMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.tireMesh.frustumCulled = false;
    this.tireMesh.count = 0;
    scene.add(this.tireMesh);

    const tireOutlineMat = createWeldedOutlineMat(0.032, 'tire-debris-outline-v80');
    this.tireOutlineMesh = new THREE.InstancedMesh(tireGeo, tireOutlineMat, MAX_TIRE_DEBRIS);
    this.tireOutlineMesh.instanceMatrix = this.tireMesh.instanceMatrix;
    this.tireOutlineMesh.frustumCulled = false;
    this.tireOutlineMesh.count = 0;
    scene.add(this.tireOutlineMesh);

    // 6. Magnetized Spinning 3D Gold Coin InstancedMesh + Cel-Outline
    const coinGeo = createSpinningCoinGeometry();
    const coinMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      emissive: 0x5c3c00,
      emissiveIntensity: 0.85,
      roughness: 0.22,
      metalness: 0.44,
    });
    this.coinMesh = new THREE.InstancedMesh(coinGeo, coinMat, MAX_MAGNET_COINS);
    this.coinMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.coinMesh.frustumCulled = false;
    this.coinMesh.count = 0;
    scene.add(this.coinMesh);

    const coinOutlineMat = createWeldedOutlineMat(0.034, 'magnet-coin-outline-v81');
    this.coinOutlineMesh = new THREE.InstancedMesh(coinGeo, coinOutlineMat, MAX_MAGNET_COINS);
    this.coinOutlineMesh.instanceMatrix = this.coinMesh.instanceMatrix;
    this.coinOutlineMesh.frustumCulled = false;
    this.coinOutlineMesh.count = 0;
    scene.add(this.coinOutlineMesh);
  }

  public get activeFireballCount(): number {
    return this.activeFireballs;
  }

  public get activeTireDebrisCount(): number {
    return this.activeTires;
  }

  public get activeMagnetCoinCount(): number {
    return this.activeCoins;
  }

  public clear(): void {
    this.activeRings = 0;
    this.activeFlashes = 0;
    this.activeSplashes = 0;
    this.activeFireballs = 0;
    this.activeTires = 0;
    this.activeCoins = 0;
    this.ringMesh.count = 0;
    this.flashMesh.count = 0;
    this.splashMesh.count = 0;
    this.fireballMesh.count = 0;
    this.fireballOutlineMesh.count = 0;
    this.tireMesh.count = 0;
    this.tireOutlineMesh.count = 0;
    this.coinMesh.count = 0;
    this.coinOutlineMesh.count = 0;
  }

  public spawnShockwave(
    x: number,
    z: number,
    maxRadius: number,
    duration: number,
    colorHex: number
  ): void {
    if (this.activeRings >= MAX_SHOCKWAVES) {
      return;
    }
    const idx = this.activeRings++;
    this.ringX[idx] = x;
    this.ringZ[idx] = z;
    this.ringAge[idx] = 0;
    this.ringMaxAge[idx] = Math.max(0.08, duration);
    this.ringMaxRadius[idx] = maxRadius;

    _color.setHex(colorHex);
    this.ringR[idx] = _color.r * 1.45;
    this.ringG[idx] = _color.g * 1.45;
    this.ringB[idx] = _color.b * 1.45;
  }

  public spawnMuzzleFlash(
    x: number,
    y: number,
    z: number,
    scale: number,
    colorHex: number
  ): void {
    if (this.activeFlashes >= MAX_MUZZLE_FLASHES) {
      return;
    }
    const idx = this.activeFlashes++;
    this.flashX[idx] = x;
    this.flashY[idx] = y;
    this.flashZ[idx] = z;
    this.flashAge[idx] = 0;
    this.flashMaxAge[idx] = 0.055;
    this.flashScale[idx] = scale;

    _color.setHex(colorHex);
    this.flashR[idx] = _color.r * 1.9;
    this.flashG[idx] = _color.g * 1.7;
    this.flashB[idx] = _color.b * 1.4;
  }

  public spawnImpactSplash(
    x: number,
    y: number,
    z: number,
    scale: number,
    colorHex: number
  ): void {
    if (this.activeSplashes >= MAX_IMPACT_SPLASHES) {
      return;
    }
    const idx = this.activeSplashes++;
    this.splashX[idx] = x;
    this.splashY[idx] = y;
    this.splashZ[idx] = z;
    this.splashAge[idx] = 0;
    this.splashMaxAge[idx] = 0.165;
    this.splashScale[idx] = scale;

    _color.setHex(colorHex);
    this.splashR[idx] = 0.14 + _color.r * 0.88;
    this.splashG[idx] = 0.14 + _color.g * 0.88;
    this.splashB[idx] = 0.14 + _color.b * 0.88;
  }

  public spawnCartoonFireball(x: number, y: number, z: number, scale = 1.65): void {
    if (this.activeFireballs >= MAX_FIREBALLS) {
      return;
    }
    const idx = this.activeFireballs++;
    this.fbX[idx] = x;
    this.fbY[idx] = y;
    this.fbZ[idx] = z;
    this.fbAge[idx] = 0;
    this.fbMaxAge[idx] = 0.58;
    this.fbScale[idx] = scale;
  }

  public spawnTireDebris(x: number, z: number, count = 5): void {
    for (let k = 0; k < count; k++) {
      if (this.activeTires >= MAX_TIRE_DEBRIS) {
        return;
      }
      const idx = this.activeTires++;
      const s = this.tireSeed++;
      const ang = (k / Math.max(1, count)) * Math.PI * 2 + (s % 5) * 0.31;
      const radialSpeed = 3.2 + ((s * 7) % 9) * 0.36;
      this.tireX[idx] = x + Math.cos(ang) * 0.35;
      this.tireY[idx] = 0.72 + (k % 3) * 0.38;
      this.tireZ[idx] = z + Math.sin(ang) * 0.25;
      this.tireVx[idx] = Math.cos(ang) * radialSpeed;
      this.tireVy[idx] = 7.4 + ((s * 13) % 7) * 0.58;
      this.tireVz[idx] = Math.sin(ang) * radialSpeed * 0.85 - 1.2;
      this.tireRx[idx] = (s % 7) * 0.4;
      this.tireRy[idx] = ang;
      this.tireRz[idx] = 0;
      this.tireSpinX[idx] = (s % 2 === 0 ? 1 : -1) * (8.5 + (s % 5) * 1.4);
      this.tireSpinY[idx] = (s % 2 === 0 ? -1 : 1) * (5.2 + (s % 4) * 1.1);
      this.tireAge[idx] = 0;
      this.tireMaxAge[idx] = 0.88 + (k % 3) * 0.08;
    }
  }

  /**
   * Spawns `visualCount` spinning 3D gold coins that burst upward then magnetize smoothly
   * straight into the top-right HUD coin counter, splitting `totalEarnedValue` across them.
   */
  public spawnMagnetizedCoins(
    x: number,
    y: number,
    z: number,
    visualCount: number,
    totalEarnedValue: number
  ): void {
    const count = Math.max(1, Math.min(8, visualCount));
    const baseVal = Math.floor(totalEarnedValue / count);
    let remainder = totalEarnedValue - baseVal * count;

    for (let k = 0; k < count; k++) {
      const val = baseVal + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;

      if (this.activeCoins >= MAX_MAGNET_COINS) {
        // Fold overflow value into the last active coin so zero coins are ever lost!
        this.coinValue[MAX_MAGNET_COINS - 1] += val;
        continue;
      }

      const idx = this.activeCoins++;
      const s = this.coinSeed++;
      const ang = (k / count) * Math.PI * 2 + (s % 11) * 0.42;
      const spread = count === 1 ? 0.85 : 1.7 + (k % 3) * 0.55;

      this.coinX[idx] = x;
      this.coinY[idx] = y;
      this.coinZ[idx] = z;
      this.coinStartX[idx] = x;
      this.coinStartY[idx] = y;
      this.coinStartZ[idx] = z;
      this.coinVx[idx] = Math.cos(ang) * spread;
      this.coinVy[idx] = 5.4 + ((s * 5) % 7) * 0.36;
      this.coinVz[idx] = Math.sin(ang) * spread * 0.55;
      this.coinAge[idx] = 0;
      this.coinPopDur[idx] = 0.16 + (k % 3) * 0.025;
      this.coinMaxAge[idx] = 0.50 + (k % 4) * 0.04;
      this.coinValue[idx] = val;
      this.coinSpin[idx] = 12.0 + (s % 5) * 1.6;
    }
  }

  public updateAndSync(
    dt: number,
    camera?: THREE.PerspectiveCamera,
    coinTargetNdcX = 0.82,
    coinTargetNdcY = 0.89,
    onCoinArrived?: (amount: number) => void
  ): void {
    // 1. Update Shockwave Rings (O(1) swap-remove)
    let r = 0;
    while (r < this.activeRings) {
      const nextAge = this.ringAge[r] + dt;
      if (nextAge >= this.ringMaxAge[r]) {
        const last = this.activeRings - 1;
        if (r !== last) {
          this.ringX[r] = this.ringX[last];
          this.ringZ[r] = this.ringZ[last];
          this.ringAge[r] = this.ringAge[last];
          this.ringMaxAge[r] = this.ringMaxAge[last];
          this.ringMaxRadius[r] = this.ringMaxRadius[last];
          this.ringR[r] = this.ringR[last];
          this.ringG[r] = this.ringG[last];
          this.ringB[r] = this.ringB[last];
        }
        this.activeRings = last;
        continue;
      }
      this.ringAge[r] = nextAge;
      const t = nextAge / this.ringMaxAge[r];
      const easeOut = 1 - (1 - t) * (1 - t);
      const rad = 0.35 + easeOut * this.ringMaxRadius[r];
      const fade = 1 - t;

      _pos.set(this.ringX[r], 0.06, this.ringZ[r]);
      _quat.identity();
      _scale.set(rad, 1, rad);
      _mat4.compose(_pos, _quat, _scale);
      this.ringMesh.setMatrixAt(r, _mat4);

      _color.setRGB(
        this.ringR[r] * fade,
        this.ringG[r] * fade,
        this.ringB[r] * fade
      );
      this.ringMesh.setColorAt(r, _color);
      r++;
    }
    this.ringMesh.count = this.activeRings;
    if (this.activeRings > 0) {
      this.ringMesh.instanceMatrix.needsUpdate = true;
      if (this.ringMesh.instanceColor) {
        this.ringMesh.instanceColor.needsUpdate = true;
      }
    }

    // 2. Update Muzzle Flashes
    let f = 0;
    while (f < this.activeFlashes) {
      const nextAge = this.flashAge[f] + dt;
      if (nextAge >= this.flashMaxAge[f]) {
        const last = this.activeFlashes - 1;
        if (f !== last) {
          this.flashX[f] = this.flashX[last];
          this.flashY[f] = this.flashY[last];
          this.flashZ[f] = this.flashZ[last];
          this.flashAge[f] = this.flashAge[last];
          this.flashMaxAge[f] = this.flashMaxAge[last];
          this.flashScale[f] = this.flashScale[last];
          this.flashR[f] = this.flashR[last];
          this.flashG[f] = this.flashG[last];
          this.flashB[f] = this.flashB[last];
        }
        this.activeFlashes = last;
        continue;
      }
      this.flashAge[f] = nextAge;
      const fade = 1 - nextAge / this.flashMaxAge[f];
      const s = this.flashScale[f] * (0.65 + fade * 0.55);

      _pos.set(this.flashX[f], this.flashY[f], this.flashZ[f]);
      _euler.set(0, 0, f * 1.1 + nextAge * 28);
      _quat.setFromEuler(_euler);
      _scale.set(s, s, s * 1.25);
      _mat4.compose(_pos, _quat, _scale);
      this.flashMesh.setMatrixAt(f, _mat4);

      _color.setRGB(
        this.flashR[f] * fade,
        this.flashG[f] * fade,
        this.flashB[f] * fade
      );
      this.flashMesh.setColorAt(f, _color);
      f++;
    }
    this.flashMesh.count = this.activeFlashes;
    if (this.activeFlashes > 0) {
      this.flashMesh.instanceMatrix.needsUpdate = true;
      if (this.flashMesh.instanceColor) {
        this.flashMesh.instanceColor.needsUpdate = true;
      }
    }

    // 3. Update Bullet Impact Splashes
    let p = 0;
    while (p < this.activeSplashes) {
      const nextAge = this.splashAge[p] + dt;
      if (nextAge >= this.splashMaxAge[p]) {
        const last = this.activeSplashes - 1;
        if (p !== last) {
          this.splashX[p] = this.splashX[last];
          this.splashY[p] = this.splashY[last];
          this.splashZ[p] = this.splashZ[last];
          this.splashAge[p] = this.splashAge[last];
          this.splashMaxAge[p] = this.splashMaxAge[last];
          this.splashScale[p] = this.splashScale[last];
          this.splashR[p] = this.splashR[last];
          this.splashG[p] = this.splashG[last];
          this.splashB[p] = this.splashB[last];
        }
        this.activeSplashes = last;
        continue;
      }
      this.splashAge[p] = nextAge;
      this.splashY[p] += dt * 1.35;
      const t = nextAge / this.splashMaxAge[p];
      const pop =
        t < 0.28
          ? 0.44 + (t / 0.28) * 0.78
          : Math.max(0.03, 1.22 * (1 - (t - 0.28) / 0.72));
      const s = this.splashScale[p] * pop;
      const tone = 1.06 - t * 0.18;

      _pos.set(this.splashX[p], this.splashY[p], this.splashZ[p]);
      _euler.set(0, 0, p * 0.85 + nextAge * 8.5);
      _quat.setFromEuler(_euler);
      _scale.set(s, s, s);
      _mat4.compose(_pos, _quat, _scale);
      this.splashMesh.setMatrixAt(p, _mat4);

      _color.setRGB(
        this.splashR[p] * tone,
        this.splashG[p] * tone,
        this.splashB[p] * tone
      );
      this.splashMesh.setColorAt(p, _color);
      p++;
    }
    this.splashMesh.count = this.activeSplashes;
    if (this.activeSplashes > 0) {
      this.splashMesh.instanceMatrix.needsUpdate = true;
      if (this.splashMesh.instanceColor) {
        this.splashMesh.instanceColor.needsUpdate = true;
      }
    }

    // 4. Update Stylized Cartoon Fireballs (white-yellow core -> bright orange -> crimson smoke pop)
    let fb = 0;
    while (fb < this.activeFireballs) {
      const nextAge = this.fbAge[fb] + dt;
      if (nextAge >= this.fbMaxAge[fb]) {
        const last = this.activeFireballs - 1;
        if (fb !== last) {
          this.fbX[fb] = this.fbX[last];
          this.fbY[fb] = this.fbY[last];
          this.fbZ[fb] = this.fbZ[last];
          this.fbAge[fb] = this.fbAge[last];
          this.fbMaxAge[fb] = this.fbMaxAge[last];
          this.fbScale[fb] = this.fbScale[last];
        }
        this.activeFireballs = last;
        continue;
      }
      this.fbAge[fb] = nextAge;
      const t = nextAge / this.fbMaxAge[fb];
      const expand = t < 0.32 ? 0.35 + (t / 0.32) * 1.12 : 1.47 * (1 - ((t - 0.32) / 0.68) * 0.92);
      const s = Math.max(0.05, this.fbScale[fb] * expand);

      _pos.set(this.fbX[fb], this.fbY[fb] + t * 1.35, this.fbZ[fb]);
      _euler.set(t * 2.1, fb * 1.3 + t * 4.2, t * 1.7);
      _quat.setFromEuler(_euler);
      _scale.set(s, s * 0.92, s);
      _mat4.compose(_pos, _quat, _scale);
      this.fireballMesh.setMatrixAt(fb, _mat4);

      if (t < 0.28) {
        const u = t / 0.28;
        // Blazing comic golden-yellow core (true linear RGB so sRGB stays vivid, not washed peach!)
        _color.setRGB(1.0, 0.88 - u * 0.38, 0.14 - u * 0.12);
      } else if (t < 0.66) {
        const u = (t - 0.28) / 0.38;
        // Fiery cartoon orange -> vermilion flame
        _color.setRGB(1.0, 0.50 - u * 0.40, 0.02 - u * 0.015);
      } else {
        const u = (t - 0.66) / 0.34;
        // Deep crimson ember -> dark comic smoke pop
        _color.setRGB(0.85 - u * 0.72, 0.10 - u * 0.07, 0.015);
      }
      this.fireballMesh.setColorAt(fb, _color);
      fb++;
    }
    this.fireballMesh.count = this.activeFireballs;
    this.fireballOutlineMesh.count = this.activeFireballs;
    if (this.activeFireballs > 0) {
      this.fireballMesh.instanceMatrix.needsUpdate = true;
      if (this.fireballMesh.instanceColor) {
        this.fireballMesh.instanceColor.needsUpdate = true;
      }
    }

    // 5. Update Gravity-Arcing Popping Tire Debris
    let td = 0;
    while (td < this.activeTires) {
      const nextAge = this.tireAge[td] + dt;
      if (nextAge >= this.tireMaxAge[td]) {
        const last = this.activeTires - 1;
        if (td !== last) {
          this.tireX[td] = this.tireX[last];
          this.tireY[td] = this.tireY[last];
          this.tireZ[td] = this.tireZ[last];
          this.tireVx[td] = this.tireVx[last];
          this.tireVy[td] = this.tireVy[last];
          this.tireVz[td] = this.tireVz[last];
          this.tireRx[td] = this.tireRx[last];
          this.tireRy[td] = this.tireRy[last];
          this.tireRz[td] = this.tireRz[last];
          this.tireSpinX[td] = this.tireSpinX[last];
          this.tireSpinY[td] = this.tireSpinY[last];
          this.tireAge[td] = this.tireAge[last];
          this.tireMaxAge[td] = this.tireMaxAge[last];
        }
        this.activeTires = last;
        continue;
      }
      this.tireAge[td] = nextAge;
      this.tireVy[td] -= 22.0 * dt;
      this.tireX[td] += this.tireVx[td] * dt;
      this.tireY[td] += this.tireVy[td] * dt;
      this.tireZ[td] += this.tireVz[td] * dt;
      this.tireRx[td] += this.tireSpinX[td] * dt;
      this.tireRy[td] += this.tireSpinY[td] * dt;

      if (this.tireY[td] < 0.28) {
        this.tireY[td] = 0.28;
        this.tireVy[td] = Math.abs(this.tireVy[td]) * 0.42;
        this.tireVx[td] *= 0.78;
        this.tireVz[td] *= 0.78;
      }

      const lifeLeft = 1 - nextAge / this.tireMaxAge[td];
      const s = lifeLeft < 0.28 ? Math.max(0.05, lifeLeft / 0.28) : 1.05;
      _pos.set(this.tireX[td], this.tireY[td], this.tireZ[td]);
      _euler.set(this.tireRx[td], this.tireRy[td], this.tireRz[td]);
      _quat.setFromEuler(_euler);
      _scale.set(s, s, s);
      _mat4.compose(_pos, _quat, _scale);
      this.tireMesh.setMatrixAt(td, _mat4);
      td++;
    }
    this.tireMesh.count = this.activeTires;
    this.tireOutlineMesh.count = this.activeTires;
    if (this.activeTires > 0) {
      this.tireMesh.instanceMatrix.needsUpdate = true;
    }

    // 6. Update Magnetized Spinning 3D Coins Arcing into Top-Right HUD Counter
    if (this.activeCoins > 0) {
      if (camera) {
        _coinTargetWorld.set(coinTargetNdcX, coinTargetNdcY, 0.5).unproject(camera);
        _camDir.copy(_coinTargetWorld).sub(camera.position).normalize();
        _coinTargetWorld.copy(camera.position).addScaledVector(_camDir, 9.5);
      } else {
        _coinTargetWorld.set(5.2, 8.5, 0);
      }
    }

    let c = 0;
    while (c < this.activeCoins) {
      const nextAge = this.coinAge[c] + dt;
      if (nextAge >= this.coinMaxAge[c]) {
        const landedValue = this.coinValue[c];
        const last = this.activeCoins - 1;
        if (c !== last) {
          this.coinX[c] = this.coinX[last];
          this.coinY[c] = this.coinY[last];
          this.coinZ[c] = this.coinZ[last];
          this.coinStartX[c] = this.coinStartX[last];
          this.coinStartY[c] = this.coinStartY[last];
          this.coinStartZ[c] = this.coinStartZ[last];
          this.coinVx[c] = this.coinVx[last];
          this.coinVy[c] = this.coinVy[last];
          this.coinVz[c] = this.coinVz[last];
          this.coinAge[c] = this.coinAge[last];
          this.coinPopDur[c] = this.coinPopDur[last];
          this.coinMaxAge[c] = this.coinMaxAge[last];
          this.coinValue[c] = this.coinValue[last];
          this.coinSpin[c] = this.coinSpin[last];
        }
        this.activeCoins = last;
        if (onCoinArrived && landedValue > 0) {
          onCoinArrived(landedValue);
        }
        continue;
      }

      this.coinAge[c] = nextAge;
      const popDur = this.coinPopDur[c];
      let cx: number;
      let cy: number;
      let cz: number;
      let coinScale = 1.02;

      if (nextAge <= popDur) {
        // Phase 1: Energetic upward fountain pop from dead enemy / broken barrel
        this.coinVy[c] -= 18.0 * dt;
        this.coinX[c] += this.coinVx[c] * dt;
        this.coinY[c] = Math.max(0.45, this.coinY[c] + this.coinVy[c] * dt);
        this.coinZ[c] += this.coinVz[c] * dt;
        this.coinStartX[c] = this.coinX[c];
        this.coinStartY[c] = this.coinY[c];
        this.coinStartZ[c] = this.coinZ[c];
        cx = this.coinX[c];
        cy = this.coinY[c];
        cz = this.coinZ[c];
      } else {
        // Phase 2: Accelerating magnetized arc straight into the top-right HUD coin pill!
        const u = Math.min(1, (nextAge - popDur) / Math.max(0.05, this.coinMaxAge[c] - popDur));
        const ease = u * u * (2.2 - 1.2 * u);
        const arcLift = Math.sin(u * Math.PI) * 1.85;
        cx = this.coinStartX[c] + (_coinTargetWorld.x - this.coinStartX[c]) * ease;
        cy = this.coinStartY[c] + (_coinTargetWorld.y - this.coinStartY[c]) * ease + arcLift;
        cz = this.coinStartZ[c] + (_coinTargetWorld.z - this.coinStartZ[c]) * ease;
        this.coinX[c] = cx;
        this.coinY[c] = cy;
        this.coinZ[c] = cz;
        coinScale = 1.06 - u * 0.68;
      }

      _pos.set(cx, cy, cz);
      _euler.set(0.28, nextAge * this.coinSpin[c], Math.sin(nextAge * 8) * 0.2);
      _quat.setFromEuler(_euler);
      _scale.set(coinScale, coinScale, coinScale);
      _mat4.compose(_pos, _quat, _scale);
      this.coinMesh.setMatrixAt(c, _mat4);
      c++;
    }
    this.coinMesh.count = this.activeCoins;
    this.coinOutlineMesh.count = this.activeCoins;
    if (this.activeCoins > 0) {
      this.coinMesh.instanceMatrix.needsUpdate = true;
    }
  }
}
