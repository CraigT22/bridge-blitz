/**
 * Zero-allocation Struct-of-Arrays (SoA) object pools for bullets and particles.
 * Uses O(1) swap-remove on deactivation so active indices are always contiguous [0 .. activeCount - 1],
 * mapping 1:1 onto THREE.InstancedMesh with `mesh.count = activeCount`.
 */

export class BulletPool {
  public readonly capacity: number;
  public activeCount = 0;

  public readonly x: Float32Array;
  public readonly y: Float32Array;
  public readonly z: Float32Array;
  public readonly vx: Float32Array;
  public readonly vz: Float32Array;
  public readonly damage: Float32Array;
  public readonly age: Float32Array;
  public readonly maxAge: Float32Array;
  public readonly scale: Float32Array;
  public readonly pierceLeft: Int16Array;
  public readonly lastHitEntityId: Int32Array;
  public readonly weaponTier: Uint8Array;
  public readonly colorR: Float32Array;
  public readonly colorG: Float32Array;
  public readonly colorB: Float32Array;

  constructor(capacity = 1200) {
    this.capacity = capacity;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.z = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vz = new Float32Array(capacity);
    this.damage = new Float32Array(capacity);
    this.age = new Float32Array(capacity);
    this.maxAge = new Float32Array(capacity);
    this.scale = new Float32Array(capacity);
    this.pierceLeft = new Int16Array(capacity);
    this.lastHitEntityId = new Int32Array(capacity);
    this.weaponTier = new Uint8Array(capacity);
    this.colorR = new Float32Array(capacity);
    this.colorG = new Float32Array(capacity);
    this.colorB = new Float32Array(capacity);
  }

  public spawn(
    x: number,
    y: number,
    z: number,
    vx: number,
    vz: number,
    damage: number,
    pierceCount: number,
    maxAge: number,
    scale: number,
    tier: number,
    hexColor: number
  ): number {
    if (this.activeCount >= this.capacity) {
      return -1;
    }
    const idx = this.activeCount++;
    this.x[idx] = x;
    this.y[idx] = y;
    this.z[idx] = z;
    this.vx[idx] = vx;
    this.vz[idx] = vz;
    this.damage[idx] = damage;
    this.age[idx] = 0;
    this.maxAge[idx] = maxAge;
    this.scale[idx] = scale;
    this.pierceLeft[idx] = pierceCount;
    this.lastHitEntityId[idx] = -1;
    this.weaponTier[idx] = tier;
    this.colorR[idx] = ((hexColor >> 16) & 0xff) / 255;
    this.colorG[idx] = ((hexColor >> 8) & 0xff) / 255;
    this.colorB[idx] = (hexColor & 0xff) / 255;
    return idx;
  }

  public deactivate(idx: number): void {
    if (idx < 0 || idx >= this.activeCount) {
      return;
    }
    const last = --this.activeCount;
    if (idx !== last) {
      this.x[idx] = this.x[last];
      this.y[idx] = this.y[last];
      this.z[idx] = this.z[last];
      this.vx[idx] = this.vx[last];
      this.vz[idx] = this.vz[last];
      this.damage[idx] = this.damage[last];
      this.age[idx] = this.age[last];
      this.maxAge[idx] = this.maxAge[last];
      this.scale[idx] = this.scale[last];
      this.pierceLeft[idx] = this.pierceLeft[last];
      this.lastHitEntityId[idx] = this.lastHitEntityId[last];
      this.weaponTier[idx] = this.weaponTier[last];
      this.colorR[idx] = this.colorR[last];
      this.colorG[idx] = this.colorG[last];
      this.colorB[idx] = this.colorB[last];
    }
  }

  public clear(): void {
    this.activeCount = 0;
  }
}

export class ParticlePool {
  public readonly capacity: number;
  public activeCount = 0;

  public readonly x: Float32Array;
  public readonly y: Float32Array;
  public readonly z: Float32Array;
  public readonly vx: Float32Array;
  public readonly vy: Float32Array;
  public readonly vz: Float32Array;
  public readonly gravity: Float32Array;
  public readonly age: Float32Array;
  public readonly maxAge: Float32Array;
  public readonly baseScale: Float32Array;
  public readonly spin: Float32Array;
  public readonly colorR: Float32Array;
  public readonly colorG: Float32Array;
  public readonly colorB: Float32Array;

  constructor(capacity = 900) {
    this.capacity = capacity;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.z = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.vz = new Float32Array(capacity);
    this.gravity = new Float32Array(capacity);
    this.age = new Float32Array(capacity);
    this.maxAge = new Float32Array(capacity);
    this.baseScale = new Float32Array(capacity);
    this.spin = new Float32Array(capacity);
    this.colorR = new Float32Array(capacity);
    this.colorG = new Float32Array(capacity);
    this.colorB = new Float32Array(capacity);
  }

  public spawn(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    gravity: number,
    maxAge: number,
    baseScale: number,
    hexColor: number
  ): void {
    if (this.activeCount >= this.capacity) {
      return;
    }
    const idx = this.activeCount++;
    this.x[idx] = x;
    this.y[idx] = y;
    this.z[idx] = z;
    this.vx[idx] = vx;
    this.vy[idx] = vy;
    this.vz[idx] = vz;
    this.gravity[idx] = gravity;
    this.age[idx] = 0;
    this.maxAge[idx] = maxAge;
    this.baseScale[idx] = baseScale;
    this.spin[idx] = (idx % 7) * 0.9 - 2.7;
    this.colorR[idx] = ((hexColor >> 16) & 0xff) / 255;
    this.colorG[idx] = ((hexColor >> 8) & 0xff) / 255;
    this.colorB[idx] = (hexColor & 0xff) / 255;
  }

  public spawnBurst(
    x: number,
    y: number,
    z: number,
    count: number,
    speed: number,
    hexColor: number,
    scale = 0.16,
    maxAge = 0.48,
    gravity = -16
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (this.activeCount * 0.37);
      const radial = speed * (0.45 + ((i * 17) % 11) * 0.06);
      const vy = speed * (0.4 + ((i * 13) % 9) * 0.08);
      this.spawn(
        x,
        y,
        z,
        Math.cos(angle) * radial,
        vy,
        Math.sin(angle) * radial,
        gravity,
        maxAge,
        scale,
        hexColor
      );
    }
  }

  public update(dt: number): void {
    let i = 0;
    while (i < this.activeCount) {
      const nextAge = this.age[i] + dt;
      if (nextAge >= this.maxAge[i]) {
        this.deactivate(i);
        continue;
      }
      this.age[i] = nextAge;
      this.vy[i] += this.gravity[i] * dt;
      this.x[i] += this.vx[i] * dt;
      this.y[i] += this.vy[i] * dt;
      this.z[i] += this.vz[i] * dt;
      if (this.y[i] < 0.04) {
        this.y[i] = 0.04;
        this.vy[i] = Math.abs(this.vy[i]) * 0.35;
      }
      i++;
    }
  }

  public deactivate(idx: number): void {
    if (idx < 0 || idx >= this.activeCount) {
      return;
    }
    const last = --this.activeCount;
    if (idx !== last) {
      this.x[idx] = this.x[last];
      this.y[idx] = this.y[last];
      this.z[idx] = this.z[last];
      this.vx[idx] = this.vx[last];
      this.vy[idx] = this.vy[last];
      this.vz[idx] = this.vz[last];
      this.gravity[idx] = this.gravity[last];
      this.age[idx] = this.age[last];
      this.maxAge[idx] = this.maxAge[last];
      this.baseScale[idx] = this.baseScale[last];
      this.spin[idx] = this.spin[last];
      this.colorR[idx] = this.colorR[last];
      this.colorG[idx] = this.colorG[last];
      this.colorB[idx] = this.colorB[last];
    }
  }

  public clear(): void {
    this.activeCount = 0;
  }
}
