import * as THREE from 'three';

const MAX_SHOCKWAVES = 32;
const MAX_MUZZLE_FLASHES = 64;
const MAX_IMPACT_SPLASHES = 96;

const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _color = new THREE.Color();

/**
 * Zero-GC pooled tactical VFX system:
 * 1. Expanding HDR ground shockwave rings (gate flips, squad passes, tire shatters, boss stomps, upgrades)
 * 2. Crisp 3-fin additive muzzle flash bursts at the front rank of the squad
 * 3. Cel-outlined comic smoke/impact puff clouds tinted cyan or fiery-orange by weapon tier
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
    const lobes: ReadonlyArray< readonly [number, number, number] > = [
      [64, 64, 30],
      [42, 58, 22],
      [86, 56, 23],
      [50, 82, 20],
      [78, 80, 21],
      [64, 42, 21],
    ];
    // Crisp dark cartoon cloud outline so cyan & orange puffs pop on sunlit concrete AND dark tires
    sCtx.fillStyle = 'rgba(16, 24, 36, 0.78)';
    for (const [lx, ly, lr] of lobes) {
      sCtx.beginPath();
      sCtx.arc(lx, ly, lr + 5, 0, Math.PI * 2);
      sCtx.fill();
    }
    // Mid cloud body (tints vividly via instanceColor into cyan or fiery peach-orange)
    sCtx.fillStyle = 'rgba(246, 250, 255, 0.97)';
    for (const [lx, ly, lr] of lobes) {
      sCtx.beginPath();
      sCtx.arc(lx, ly, lr, 0, Math.PI * 2);
      sCtx.fill();
    }
    // Compact hot inner puff highlight + comic spark ticks
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
  }

  public clear(): void {
    this.activeRings = 0;
    this.activeFlashes = 0;
    this.activeSplashes = 0;
    this.ringMesh.count = 0;
    this.flashMesh.count = 0;
    this.splashMesh.count = 0;
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
    // Keep vivid cyan / fiery peach-orange saturation on comic puffs under NormalBlending
    this.splashR[idx] = 0.14 + _color.r * 0.88;
    this.splashG[idx] = 0.14 + _color.g * 0.88;
    this.splashB[idx] = 0.14 + _color.b * 0.88;
  }

  public updateAndSync(dt: number): void {
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
    this.ringMesh.instanceMatrix.needsUpdate = true;
    if (this.ringMesh.instanceColor) {
      this.ringMesh.instanceColor.needsUpdate = true;
    }

    // 2. Update Muzzle Flashes (O(1) swap-remove)
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
    this.flashMesh.instanceMatrix.needsUpdate = true;
    if (this.flashMesh.instanceColor) {
      this.flashMesh.instanceColor.needsUpdate = true;
    }

    // 3. Update Bullet Impact Splashes (O(1) swap-remove)
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
    this.splashMesh.instanceMatrix.needsUpdate = true;
    if (this.splashMesh.instanceColor) {
      this.splashMesh.instanceColor.needsUpdate = true;
    }
  }
}
