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

/**
 * Pre-allocated flying knockback ragdoll pool for eliminated enemy and player commandos.
 * Uses contiguous SoA arrays with O(1) swap-remove for zero runtime heap allocations.
 */
export class RagdollPool {
  public readonly capacity: number;
  public activeCount = 0;

  public readonly x: Float32Array;
  public readonly y: Float32Array;
  public readonly z: Float32Array;
  public readonly vx: Float32Array;
  public readonly vy: Float32Array;
  public readonly vz: Float32Array;
  public readonly rx: Float32Array;
  public readonly ry: Float32Array;
  public readonly rz: Float32Array;
  public readonly spinX: Float32Array;
  public readonly spinY: Float32Array;
  public readonly spinZ: Float32Array;
  public readonly age: Float32Array;
  public readonly maxAge: Float32Array;
  public readonly isEnemy: Uint8Array;

  private seedCounter = 1;

  constructor(capacity = 96) {
    this.capacity = capacity;
    this.x = new Float32Array(capacity);
    this.y = new Float32Array(capacity);
    this.z = new Float32Array(capacity);
    this.vx = new Float32Array(capacity);
    this.vy = new Float32Array(capacity);
    this.vz = new Float32Array(capacity);
    this.rx = new Float32Array(capacity);
    this.ry = new Float32Array(capacity);
    this.rz = new Float32Array(capacity);
    this.spinX = new Float32Array(capacity);
    this.spinY = new Float32Array(capacity);
    this.spinZ = new Float32Array(capacity);
    this.age = new Float32Array(capacity);
    this.maxAge = new Float32Array(capacity);
    this.isEnemy = new Uint8Array(capacity);
  }

  public spawnKnockback(
    x: number,
    z: number,
    isEnemyUnit: boolean,
    impulseScale = 1.0
  ): void {
    if (this.activeCount >= this.capacity) {
      // Recycle oldest slot at index 0 if saturated during massive swarm wipeouts
      this.deactivate(0);
    }
    const idx = this.activeCount++;
    const s = this.seedCounter++;
    const spreadSign = s % 2 === 0 ? 1 : -1;
    const lateral = spreadSign * (1.25 + ((s * 7) % 11) * 0.26) * impulseScale;

    this.x[idx] = x + (((s * 5) % 7) - 3) * 0.08;
    this.y[idx] = 0.26;
    this.z[idx] = z;
    this.vx[idx] = lateral;
    this.vy[idx] = (5.6 + ((s * 13) % 9) * 0.34) * impulseScale;
    // Enemies fly backward down-bridge (-Z); wiped player commandos fly backward (+Z)
    this.vz[idx] = (isEnemyUnit ? -1 : 1) * (6.8 + ((s * 11) % 9) * 0.44) * impulseScale;

    this.rx[idx] = 0;
    this.ry[idx] = isEnemyUnit ? 0 : Math.PI;
    this.rz[idx] = 0;
    this.spinX[idx] = (isEnemyUnit ? -1 : 1) * (9.2 + (s % 5) * 1.4);
    this.spinY[idx] = spreadSign * (3.4 + (s % 4) * 1.1);
    this.spinZ[idx] = -spreadSign * (5.8 + (s % 6) * 0.9);

    this.age[idx] = 0;
    this.maxAge[idx] = 0.68;
    this.isEnemy[idx] = isEnemyUnit ? 1 : 0;
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
      this.vy[i] -= 21.0 * dt;
      this.x[i] += this.vx[i] * dt;
      this.y[i] += this.vy[i] * dt;
      this.z[i] += this.vz[i] * dt;

      this.rx[i] += this.spinX[i] * dt;
      this.ry[i] += this.spinY[i] * dt;
      this.rz[i] += this.spinZ[i] * dt;

      if (this.y[i] < 0.16) {
        this.y[i] = 0.16;
        this.vy[i] = Math.abs(this.vy[i]) * 0.34;
        this.vx[i] *= 0.72;
        this.vz[i] *= 0.72;
        this.spinX[i] *= 0.68;
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
      this.rx[idx] = this.rx[last];
      this.ry[idx] = this.ry[last];
      this.rz[idx] = this.rz[last];
      this.spinX[idx] = this.spinX[last];
      this.spinY[idx] = this.spinY[last];
      this.spinZ[idx] = this.spinZ[last];
      this.age[idx] = this.age[last];
      this.maxAge[idx] = this.maxAge[last];
      this.isEnemy[idx] = this.isEnemy[last];
    }
  }

  public clear(): void {
    this.activeCount = 0;
  }
}
