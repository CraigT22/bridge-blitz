import type { EnemyWaveDefinition } from '../core/types';
import { computeSquadOuterRadius } from '../math/formationMath';
import type { InstancedBatchRenderer } from '../rendering/InstancedBatchRenderer';
import {
  ENEMY_BOLT_BASE_SPEED,
  type EnemyProjectileSystem,
} from './EnemyProjectileSystem';

const MAX_UNITS_PER_WAVE = 52;
const SHOOTER_TELEGRAPH_BASE_SEC = 0.56;
const CHARGER_TELEGRAPH_BASE_SEC = 0.62;

export interface EliminatedEnemyEvent {
  x: number;
  z: number;
  isHeavy: boolean;
  stoppedCharger: boolean;
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
  public isMarching = false;
  public lastStepFiredBolt = false;
  public lastStepStartedCharge = false;

  // Per-unit Struct-of-Arrays for dense 30-50 unit swarms, shooters, armored chargers & hit-flashes!
  public readonly unitCountCap = MAX_UNITS_PER_WAVE;
  public readonly unitAlive = new Uint8Array(MAX_UNITS_PER_WAVE);
  public readonly unitIsHeavy = new Uint8Array(MAX_UNITS_PER_WAVE);
  public readonly unitIsVanguard = new Uint8Array(MAX_UNITS_PER_WAVE);
  public readonly unitIsShooter = new Uint8Array(MAX_UNITS_PER_WAVE);
  public readonly unitIsCharger = new Uint8Array(MAX_UNITS_PER_WAVE);
  /** 0 = idle, 1 = telegraphing shot/charge, 2 = actively rushing lane */
  public readonly unitChargeState = new Uint8Array(MAX_UNITS_PER_WAVE);
  public readonly unitChargeTimer = new Float32Array(MAX_UNITS_PER_WAVE);
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
  private withinRenderRange = true;
  private shooterWaveCooldown = 0.85;
  private chargerWaveCooldown = 1.25;

  constructor(waveIndex: number) {
    this.entityId = 800 + waveIndex;
    for (let i = 0; i < 8; i++) {
      this.lastKills.push({
        x: 0,
        z: 0,
        isHeavy: false,
        stoppedCharger: false,
        coinReward: 0,
      });
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
    this.isMarching = false;
    this.withinRenderRange = true;
    this.lastKillCount = 0;
    this.lastStepFiredBolt = false;
    this.lastStepStartedCharge = false;
    this.shooterWaveCooldown = 0.65;
    this.chargerWaveCooldown = 1.05;

    const heavyTarget =
      def.heavyCount ?? Math.max(2, Math.floor(this.totalConfigured * 0.24));
    const vanguardRatio = def.vanguardRatio ?? 0.34;
    const baseCoin = def.coinPerKill ?? 8;
    const spanHalfX = def.lane === 'CENTER' ? 4.65 : 2.35;

    const cols = def.lane === 'CENTER' ? 7 : 5;
    const totalRows = Math.max(1, Math.ceil(this.totalConfigured / cols));
    const vanguardRowCutoff = Math.max(1, Math.round(totalRows * vanguardRatio));
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

    const shooterTarget =
      def.shooterCount ?? Math.max(2, Math.floor(this.totalConfigured * 0.20));
    const chargerTarget =
      def.chargerCount ?? Math.max(1, Math.min(heavyTarget, Math.ceil(heavyTarget * 0.65)));

    let assignedShooters = 0;
    let assignedChargers = 0;
    let maxConfiguredZ = def.z;

    for (let i = 0; i < this.totalConfigured; i++) {
      this.unitAlive[i] = 1;
      const isHeavy = heavySet.has(i) ? 1 : 0;
      this.unitIsHeavy[i] = isHeavy;
      const row = Math.floor(i / cols);
      this.unitIsVanguard[i] = !isHeavy && row < vanguardRowCutoff ? 1 : 0;

      // Designate Armored Chargers from front Heavies
      if (isHeavy === 1 && assignedChargers < chargerTarget) {
        this.unitIsCharger[i] = 1;
        assignedChargers++;
      } else {
        this.unitIsCharger[i] = 0;
      }

      // Designate Ranged Shooters from mid/backline non-heavy units across spread columns
      if (
        isHeavy === 0 &&
        assignedShooters < shooterTarget &&
        (row >= 1 || this.totalConfigured <= 10) &&
        (i % 2 === 0 || row >= totalRows - 2)
      ) {
        this.unitIsShooter[i] = 1;
        assignedShooters++;
      } else {
        this.unitIsShooter[i] = 0;
      }

      this.unitChargeState[i] = 0;
      this.unitChargeTimer[i] = 0;

      const col = i % cols;
      const uNorm = cols > 1 ? col / (cols - 1) - 0.5 : 0;
      const rowShift = (row % 2) * 0.32 - 0.16;
      const staggerX = (((i * 17 + 5) % 11) - 5) * 0.12 + rowShift;
      const staggerZ = (((i * 13 + 3) % 9) - 4) * 0.16;

      const wx = Math.max(
        -5.05,
        Math.min(5.05, this.x + uNorm * spanHalfX * 2 + staggerX)
      );
      const wz = def.z - row * 1.06 + staggerZ;

      this.unitX[i] = wx;
      this.unitZ[i] = wz;
      if (i === 0 || wz > maxConfiguredZ) {
        maxConfiguredZ = wz;
      }

      const maxHp = isHeavy ? this.hpPerEnemy * 3.4 : this.hpPerEnemy;
      this.unitMaxHp[i] = maxHp;
      this.unitHp[i] = maxHp;
      this.unitHitFlash[i] = 0;
      this.unitCoins[i] = isHeavy ? Math.round(baseCoin * 3.2) : baseCoin;
    }
    this.z = Math.fround(maxConfiguredZ);
  }

  public hide(): void {
    this.active = false;
    this.aliveCount = 0;
    this.totalConfigured = 0;
    this.isMarching = false;
  }

  public update(
    dt: number,
    squadX: number,
    squadZ: number,
    blockingGateZ: number | null = null,
    projectileSystem?: EnemyProjectileSystem,
    threatCadenceMult = 1.0,
    boltDamage = 1
  ): void {
    this.lastStepFiredBolt = false;
    this.lastStepStartedCharge = false;
    if (!this.active || this.aliveCount <= 0) {
      return;
    }
    this.withinRenderRange = squadZ - this.z < 126;
    if (!this.withinRenderRange) {
      this.isMarching = false;
      return;
    }

    // Hold formation behind any uncollected Holo-Gate between the player and this wave
    // so enemies never march into/through gates while the gate absorbs player bullets!
    const blockedByGate = blockingGateZ !== null && this.z <= blockingGateZ + 1.5;
    const maxAllowedUnitZ =
      blockingGateZ !== null ? blockingGateZ - 32.0 : Infinity;
    const withinEngage = !blockedByGate && squadZ - this.z < 38;
    this.isMarching = withinEngage;
    if (withinEngage) {
      this.z = Math.min(maxAllowedUnitZ, this.z + this.speed * dt);
      this.marchPhase += dt * 10.6;
    }

    const cadence = Math.max(0.6, threatCadenceMult);
    const shooterTelegraphDur = SHOOTER_TELEGRAPH_BASE_SEC / Math.sqrt(cadence);
    const chargerTelegraphDur = CHARGER_TELEGRAPH_BASE_SEC / Math.sqrt(cadence);
    const maxConcurrentShooters = cadence >= 1.55 ? 3 : cadence >= 1.25 ? 2 : 1;
    const maxConcurrentChargers = cadence >= 1.25 ? 2 : 1;

    if (withinEngage) {
      this.shooterWaveCooldown = Math.max(0, this.shooterWaveCooldown - dt);
      this.chargerWaveCooldown = Math.max(0, this.chargerWaveCooldown - dt);
    }

    let activeTelegraphShooters = 0;
    let activeChargers = 0;
    let bestIdleShooterIdx = -1;
    let bestIdleShooterScore = Infinity;
    let bestIdleChargerIdx = -1;
    let bestIdleChargerZ = -999999;

    let alive = 0;
    let sumX = 0;
    let maxZ = -999999;

    for (let i = 0; i < this.totalConfigured; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      if (this.unitHitFlash[i] > 0) {
        // Crisp 1-2 frame solid-white hit-flash (~0.038s)
        this.unitHitFlash[i] = Math.max(0, this.unitHitFlash[i] - dt * 26.0);
      }

      const uz = this.unitZ[i];
      const distZ = squadZ - uz;

      if (withinEngage) {
        const cState = this.unitChargeState[i];

        // 1. Armored Charger state machine (1 = telegraph red lane, 2 = high-speed lane rush!)
        if (this.unitIsCharger[i] === 1 && cState > 0) {
          activeChargers++;
          if (cState === 1) {
            this.unitChargeTimer[i] -= dt;
            const progress = 1 - Math.max(0, this.unitChargeTimer[i] / chargerTelegraphDur);
            this.unitHitFlash[i] = Math.max(this.unitHitFlash[i], 0.35 + progress * 0.45);
            if (projectileSystem) {
              projectileSystem.pushChargerLane(
                this.unitX[i],
                uz,
                Math.max(uz + 2.0, squadZ + 0.5),
                progress,
                false
              );
            }
            if (this.unitChargeTimer[i] <= 0) {
              this.unitChargeState[i] = 2;
              this.lastStepStartedCharge = true;
            }
          } else {
            // Sprint straight down locked lane at 2.85x speed!
            const rushSpeed = this.speed * 2.85;
            this.unitZ[i] = Math.min(maxAllowedUnitZ, uz + rushSpeed * dt);
            this.unitHitFlash[i] = Math.max(this.unitHitFlash[i], 0.42);
            if (projectileSystem) {
              projectileSystem.pushChargerLane(
                this.unitX[i],
                this.unitZ[i],
                Math.max(this.unitZ[i] + 2.4, squadZ + 0.5),
                1.0,
                true
              );
            }
          }
        } else {
          // 2. Standard / Shooter forward advance
          let speedMul =
            this.unitIsHeavy[i] === 1
              ? 0.92
              : this.unitIsVanguard[i] === 1
                ? 1.15
                : 1.0;

          if (this.unitIsShooter[i] === 1 && cState === 1) {
            activeTelegraphShooters++;
            speedMul *= 0.35; // Brace briefly while charging lane shot
            this.unitChargeTimer[i] -= dt;
            const progress = 1 - Math.max(0, this.unitChargeTimer[i] / shooterTelegraphDur);
            this.unitHitFlash[i] = Math.max(this.unitHitFlash[i], 0.24 + progress * 0.36);
            if (projectileSystem) {
              projectileSystem.pushShooterTelegraph(this.unitX[i], uz, progress);
            }
            if (this.unitChargeTimer[i] <= 0) {
              this.unitChargeState[i] = 0;
              if (projectileSystem && distZ >= 5.5 && distZ <= 36) {
                const boltSpeed = ENEMY_BOLT_BASE_SPEED * (0.94 + cadence * 0.14);
                projectileSystem.spawnBolt(this.unitX[i], uz + 0.65, boltSpeed, boltDamage);
                this.lastStepFiredBolt = true;
              }
            }
          } else if (this.unitIsShooter[i] === 1 && distZ >= 9.5 && distZ <= 33) {
            // Bias toward shooters aligned near squadX so camping one lane draws fire!
            const score = Math.abs(this.unitX[i] - squadX) + distZ * 0.14;
            if (score < bestIdleShooterScore) {
              bestIdleShooterScore = score;
              bestIdleShooterIdx = i;
            }
          } else if (this.unitIsCharger[i] === 1 && distZ >= 8.5 && distZ <= 29) {
            if (uz > bestIdleChargerZ) {
              bestIdleChargerZ = uz;
              bestIdleChargerIdx = i;
            }
          }

          this.unitZ[i] = Math.min(
            maxAllowedUnitZ,
            uz + this.speed * speedMul * dt
          );

          // Controlled close-range flank pinch (< 11m)
          if (distZ < 11.0 && distZ > -1.0) {
            const dx = squadX - this.unitX[i];
            const lateralRate = this.unitIsVanguard[i] === 1 ? 0.42 : 0.28;
            this.unitX[i] += Math.sign(dx) * Math.min(Math.abs(dx), lateralRate * dt);
          }
        }
      } else if (uz > maxAllowedUnitZ) {
        this.unitZ[i] = maxAllowedUnitZ;
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

    // Trigger next ranged shooter telegraph if cooldown ready
    if (
      withinEngage &&
      projectileSystem &&
      this.shooterWaveCooldown <= 0 &&
      activeTelegraphShooters < maxConcurrentShooters &&
      bestIdleShooterIdx >= 0
    ) {
      this.unitChargeState[bestIdleShooterIdx] = 1;
      this.unitChargeTimer[bestIdleShooterIdx] = shooterTelegraphDur;
      this.shooterWaveCooldown = 1.48 / cadence;
    }

    // Trigger next armored lane charger telegraph if cooldown ready
    if (
      withinEngage &&
      this.chargerWaveCooldown <= 0 &&
      activeChargers < maxConcurrentChargers &&
      bestIdleChargerIdx >= 0
    ) {
      this.unitChargeState[bestIdleChargerIdx] = 1;
      this.unitChargeTimer[bestIdleChargerIdx] = chargerTelegraphDur;
      this.chargerWaveCooldown = 2.85 / cadence;
    }

    this.aliveCount = alive;
    if (alive <= 0) {
      this.active = false;
    } else {
      this.x = sumX / alive;
      this.z = maxZ;
    }
  }

  public pushInstances(renderer: InstancedBatchRenderer, isCombatMoving = true): void {
    if (!this.active || this.aliveCount <= 0 || !this.withinRenderRange) {
      return;
    }
    const marching = isCombatMoving && this.isMarching;
    for (let i = 0; i < this.totalConfigured; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      if (this.unitIsHeavy[i] === 1) {
        const rushPhaseBoost = this.unitChargeState[i] === 2 ? 2.1 : 1.0;
        renderer.pushHeavyEnemySoldier(
          this.unitX[i],
          this.unitZ[i],
          this.marchPhase * rushPhaseBoost + i * 0.65,
          this.unitHitFlash[i],
          marching || this.unitChargeState[i] === 2
        );
      } else {
        renderer.pushEnemySoldier(
          this.unitX[i],
          this.unitZ[i],
          this.marchPhase + i * 0.85,
          this.unitHitFlash[i],
          marching,
          this.unitIsVanguard[i] === 1
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
      const hitRad = this.unitIsHeavy[i] === 1 ? 0.82 : 0.56;
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
      const wasCharging = this.unitIsCharger[bestIdx] === 1 && this.unitChargeState[bestIdx] === 2;
      this.unitAlive[bestIdx] = 0;
      this.unitChargeState[bestIdx] = 0;
      this.aliveCount = Math.max(0, this.aliveCount - 1);
      const slot = this.lastKills[0];
      slot.x = this.unitX[bestIdx];
      slot.z = this.unitZ[bestIdx];
      slot.isHeavy = this.unitIsHeavy[bestIdx] === 1;
      slot.stoppedCharger = wasCharging;
      slot.coinReward = wasCharging
        ? Math.round(this.unitCoins[bestIdx] * 1.5)
        : this.unitCoins[bestIdx];
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
   * Regular troopers trade 1 commando; Heavy Juggernauts deal 2; rushing Armored Chargers deal 2 + bonus!
   */
  public resolveSquadCollision(
    squadX: number,
    squadZ: number,
    playerLogicalSquad: number,
    chargerDamageBonus = 1
  ): { playerLosses: number; hitX: number; hitZ: number; hitByCharger: boolean } | null {
    if (!this.active || this.aliveCount <= 0 || playerLogicalSquad <= 0) {
      return null;
    }

    const squadHalfW = computeSquadOuterRadius(playerLogicalSquad);
    let totalLosses = 0;
    let impactX = squadX;
    let impactZ = squadZ;
    let hitByCharger = false;

    for (let i = 0; i < this.totalConfigured; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      const isHeavy = this.unitIsHeavy[i] === 1;
      const isRushingCharger = this.unitIsCharger[i] === 1 && this.unitChargeState[i] === 2;
      const unitRad = isHeavy ? 0.58 : 0.40;
      if (
        Math.abs(this.unitZ[i] - squadZ) <= (isRushingCharger ? 0.92 : 0.74) + unitRad * 0.42 &&
        Math.abs(this.unitX[i] - squadX) <= squadHalfW + unitRad
      ) {
        const dmg = isRushingCharger
          ? 2 + Math.max(1, chargerDamageBonus)
          : isHeavy
            ? 2
            : 1;
        if (isRushingCharger) {
          hitByCharger = true;
        }
        totalLosses += dmg;
        impactX = this.unitX[i];
        impactZ = this.unitZ[i];
        this.unitAlive[i] = 0;
        this.unitChargeState[i] = 0;
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
      hitByCharger,
    };
  }

  public getConfiguredCount(): number {
    return this.totalConfigured;
  }
}
