import type { EnemyWaveDefinition } from '../core/types';
import { computeSquadOuterRadius } from '../math/formationMath';
import type { InstancedBatchRenderer } from '../rendering/InstancedBatchRenderer';

const MAX_UNITS_PER_WAVE = 52;

export interface EliminatedEnemyEvent {
  x: number;
  z: number;
  isHeavy: boolean;
  coinReward: number;
}

export class EnemyWaveSlot {
  public readonly entityId: number;
  public active = false;
  public aliveCount = 0;
  public initialCount = 0;
  public hpPerEnemy = 15;
  public speed = 2.1;
  public x = 0;
  public z = 0;
  public marchPhase = 0;

  // Per-unit Struct-of-Arrays for dense 30-50 unit swarms, individual white hit-flashes & damaged mini HP bars!
  public readonly unitCountCap = MAX_UNITS_PER_WAVE;
  public readonly unitAlive = new Uint8Array(MAX_UNITS_PER_WAVE);
  public readonly unitIsHeavy = new Uint8Array(MAX_UNITS_PER_WAVE);
  public readonly unitX = new Float32Array(MAX_UNITS_PER_WAVE);
  public readonly unitZ = new Float32Array(MAX_UNITS_PER_WAVE);
  public readonly unitHp = new Float32Array(MAX_UNITS_PER_WAVE);
  public readonly unitMaxHp = new Float32Array(MAX_UNITS_PER_WAVE);
  public readonly unitHitFlash = new Float32Array(MAX_UNITS_PER_WAVE);
  public readonly unitCoins = new Float32Array(MAX_UNITS_PER_WAVE);

  // Reusable scratch buffer for kills resolved during a bullet step (zero allocations)
  public lastKillCount = 0;
  public readonly lastKills: EliminatedEnemyEvent[] = [];

  private totalConfigured = 0;

  constructor(waveIndex: number) {
    this.entityId = 800 + waveIndex;
    for (let i = 0; i < 8; i++) {
      this.lastKills.push({ x: 0, z: 0, isHeavy: false, coinReward: 0 });
    }
  }

  public configure(def: EnemyWaveDefinition): void {
    this.active = true;
    this.totalConfigured = Math.max(1, Math.min(MAX_UNITS_PER_WAVE, def.count));
    this.initialCount = this.totalConfigured;
    this.aliveCount = this.totalConfigured;
    this.hpPerEnemy = Math.max(2, def.hpPerEnemy);
    this.speed = def.speed;
    this.x = def.lane === 'LEFT' ? -1.85 : def.lane === 'RIGHT' ? 1.85 : 0;
    this.z = def.z;
    this.marchPhase = 0;
    this.lastKillCount = 0;

    const heavyTarget =
      def.heavyCount ?? Math.max(2, Math.floor(this.totalConfigured * 0.24));
    const baseCoin = def.coinPerKill ?? 8;
    const spanHalfX = def.lane === 'CENTER' ? 3.85 : 2.35;

    const cols = def.lane === 'CENTER' ? 7 : 5;
    const centerCol = Math.floor(cols / 2);
    const heavyOrder: number[] = [];
    for (let i = 0; i < this.totalConfigured; i++) {
      heavyOrder.push(i);
    }
    heavyOrder.sort((a, b) => {
      const rowA = Math.floor(a / cols);
      const rowB = Math.floor(b / cols);
      if (rowA !== rowB) return rowA - rowB;
      return Math.abs((a % cols) - centerCol) - Math.abs((b % cols) - centerCol);
    });
    const heavySet = new Set(heavyOrder.slice(0, Math.max(0, heavyTarget)));

    for (let i = 0; i < this.totalConfigured; i++) {
      this.unitAlive[i] = 1;
      const isHeavy = heavySet.has(i) ? 1 : 0;
      this.unitIsHeavy[i] = isHeavy;
      const row = Math.floor(i / cols);
      const col = i % cols;
      const uNorm = cols > 1 ? col / (cols - 1) - 0.5 : 0;
      const rowShift = (row % 2) * 0.28 - 0.14;
      const staggerX = (((i * 17 + 5) % 11) - 5) * 0.08 + rowShift;
      const staggerZ = (((i * 13 + 3) % 9) - 4) * 0.12;

      const wx = Math.max(
        -4.22,
        Math.min(4.22, this.x + uNorm * spanHalfX * 2 + staggerX)
      );
      const wz = def.z - row * 0.96 + staggerZ;

      this.unitX[i] = wx;
      this.unitZ[i] = wz;

      const maxHp = isHeavy ? this.hpPerEnemy * 3.4 : this.hpPerEnemy;
      this.unitMaxHp[i] = maxHp;
      this.unitHp[i] = maxHp;
      this.unitHitFlash[i] = 0;
      this.unitCoins[i] = isHeavy ? Math.round(baseCoin * 3.2) : baseCoin;
    }
  }

  public hide(): void {
    this.active = false;
    this.aliveCount = 0;
    this.totalConfigured = 0;
  }

  public update(dt: number, squadX: number, squadZ: number): void {
    if (!this.active || this.aliveCount <= 0) {
      return;
    }

    const withinEngage = squadZ - this.z < 33;
    if (withinEngage) {
      this.z += this.speed * dt;
      this.marchPhase += dt * 8.8;
    }

    let alive = 0;
    let sumX = 0;
    let maxZ = -999999;

    for (let i = 0; i < this.totalConfigured; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      if (this.unitHitFlash[i] > 0) {
        this.unitHitFlash[i] = Math.max(0, this.unitHitFlash[i] - dt * 6.5);
      }

      if (withinEngage) {
        const speedMul = this.unitIsHeavy[i] === 1 ? 0.86 : 1.0;
        this.unitZ[i] += this.speed * speedMul * dt;

        // Subtle close-range tracking (< 8.5m) preserves carved open lanes when front troopers are eliminated!
        const distZ = squadZ - this.unitZ[i];
        if (distZ < 8.5 && distZ > -1.0) {
          const dx = squadX - this.unitX[i];
          this.unitX[i] += Math.sign(dx) * Math.min(Math.abs(dx), 0.25 * dt);
        }
      }

      if (this.unitZ[i] > squadZ + 14) {
        this.unitAlive[i] = 0;
        continue;
      }

      alive++;
      sumX += this.unitX[i];
      if (this.unitZ[i] > maxZ) {
        maxZ = this.unitZ[i];
      }
    }

    this.aliveCount = alive;
    if (alive <= 0) {
      this.active = false;
    } else {
      this.x = sumX / alive;
      this.z = maxZ;
    }
  }

  public pushInstances(renderer: InstancedBatchRenderer): void {
    if (!this.active || this.aliveCount <= 0) {
      return;
    }
    for (let i = 0; i < this.totalConfigured; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      if (this.unitIsHeavy[i] === 1) {
        renderer.pushHeavyEnemySoldier(
          this.unitX[i],
          this.unitZ[i],
          this.marchPhase + i * 0.65,
          this.unitHitFlash[i]
        );
      } else {
        renderer.pushEnemySoldier(
          this.unitX[i],
          this.unitZ[i],
          this.marchPhase + i * 0.85,
          this.unitHitFlash[i]
        );
      }
    }
  }

  /**
   * Checks per-trooper bullet hit (picking front-most hit trooper along bullet ray).
   * Returns >= 0 kill count on hit, or -1 if bullet missed all troopers in this wave.
   */
  public tryBulletHit(
    bx: number,
    bz: number,
    prevBz: number,
    damage: number,
    lastHitId: number
  ): number {
    if (!this.active || this.aliveCount <= 0) {
      return -1;
    }

    let bestIdx = -1;
    let bestZ = -999999;
    const segMinZ = Math.min(bz, prevBz);
    const segMaxZ = Math.max(bz, prevBz);

    for (let i = 0; i < this.totalConfigured; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      const uEntityId = this.entityId * 64 + i;
      if (uEntityId === lastHitId) {
        continue;
      }
      const hitRad = this.unitIsHeavy[i] === 1 ? 0.66 : 0.48;
      const uz = this.unitZ[i];
      if (uz < segMinZ - hitRad || uz > segMaxZ + hitRad) {
        continue;
      }
      if (Math.abs(bx - this.unitX[i]) > hitRad) {
        continue;
      }
      if (uz > bestZ) {
        bestZ = uz;
        bestIdx = i;
      }
    }

    if (bestIdx < 0) {
      return -1;
    }

    this.lastKillCount = 0;
    this.unitHitFlash[bestIdx] = 1.0;
    this.unitHp[bestIdx] -= damage;

    if (this.unitHp[bestIdx] <= 0) {
      this.unitAlive[bestIdx] = 0;
      this.aliveCount = Math.max(0, this.aliveCount - 1);
      const slot = this.lastKills[0];
      slot.x = this.unitX[bestIdx];
      slot.z = this.unitZ[bestIdx];
      slot.isHeavy = this.unitIsHeavy[bestIdx] === 1;
      slot.coinReward = this.unitCoins[bestIdx];
      this.lastKillCount = 1;

      if (this.aliveCount <= 0) {
        this.active = false;
      }
      return 1;
    }

    return 0;
  }

  /**
   * Resolves physical collisions between surviving enemy troopers and the player's squad rank.
   * Regular troopers trade 1 commando; Heavy Juggernauts deal 2 commando casualties!
   */
  public resolveSquadCollision(
    squadX: number,
    squadZ: number,
    playerLogicalSquad: number
  ): { playerLosses: number; hitX: number; hitZ: number } | null {
    if (!this.active || this.aliveCount <= 0 || playerLogicalSquad <= 0) {
      return null;
    }

    const squadHalfW = computeSquadOuterRadius(playerLogicalSquad);
    let totalLosses = 0;
    let impactX = squadX;
    let impactZ = squadZ;

    for (let i = 0; i < this.totalConfigured; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      const unitRad = this.unitIsHeavy[i] === 1 ? 0.56 : 0.40;
      if (
        Math.abs(this.unitZ[i] - squadZ) <= 0.72 + unitRad * 0.4 &&
        Math.abs(this.unitX[i] - squadX) <= squadHalfW + unitRad
      ) {
        const dmg = this.unitIsHeavy[i] === 1 ? 2 : 1;
        totalLosses += dmg;
        impactX = this.unitX[i];
        impactZ = this.unitZ[i];
        this.unitAlive[i] = 0;
        this.aliveCount = Math.max(0, this.aliveCount - 1);

        if (totalLosses >= playerLogicalSquad) {
          break;
        }
      }
    }

    if (this.aliveCount <= 0) {
      this.active = false;
    }

    if (totalLosses <= 0) {
      return null;
    }
    return {
      playerLosses: Math.min(playerLogicalSquad, totalLosses),
      hitX: impactX,
      hitZ: impactZ,
    };
  }

  public getConfiguredCount(): number {
    return this.totalConfigured;
  }
}
