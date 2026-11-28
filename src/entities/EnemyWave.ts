import type { EnemyWaveDefinition, WaveFormation } from '../core/types';
import { computeSquadOuterRadius } from '../math/formationMath';
import type { InstancedBatchRenderer } from '../rendering/InstancedBatchRenderer';
import {
  ENEMY_BOLT_BASE_SPEED,
  type EnemyProjectileSystem,
} from './EnemyProjectileSystem';

const MAX_UNITS_PER_WAVE = 144;
const SHOOTER_TELEGRAPH_BASE_SEC = 0.48;
const CHARGER_TELEGRAPH_BASE_SEC = 0.54;

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
  public formation: WaveFormation = 'STANDARD';
  public x = 0;
  public z = 0;
  public marchPhase = 0;
  public isMarching = false;
  public lastStepFiredBolt = false;
  public lastStepStartedCharge = false;

  // Per-unit Struct-of-Arrays for massive 40-144 unit tactical hordes, shooters, armored chargers & hit-flashes!
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
  public lastHitUnitEntityId = -1;
  public readonly lastKills: EliminatedEnemyEvent[] = [];

  private totalConfigured = 0;
  private withinRenderRange = true;
  private shooterWaveCooldown = 0.35;
  private chargerWaveCooldown = 0.65;

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
    this.formation = def.formation ?? 'STANDARD';
    this.x = def.lane === 'LEFT' ? -1.85 : def.lane === 'RIGHT' ? 1.85 : 0;
    this.z = def.z;
    this.marchPhase = 0;
    this.isMarching = false;
    this.withinRenderRange = true;
    this.lastKillCount = 0;
    this.lastStepFiredBolt = false;
    this.lastStepStartedCharge = false;
    this.shooterWaveCooldown = 0.35;
    this.chargerWaveCooldown = 0.65;

    const total = this.totalConfigured;
    const heavyTarget = Math.min(
      total,
      def.heavyCount ?? Math.max(2, Math.floor(total * 0.20))
    );
    const vanguardRatio = def.vanguardRatio ?? 0.34;
    const baseCoin = def.coinPerKill ?? 8;
    const spanHalfX =
      def.lane === 'CENTER'
        ? this.formation === 'HORDE_TIDAL_WAVE'
          ? 5.04
          : this.formation === 'FIRING_SQUAD' || this.formation === 'SHIELD_PHALANX'
            ? 4.94
            : 4.82
        : 2.35;

    const cols =
      def.lane !== 'CENTER'
        ? 5
        : this.formation === 'HORDE_TIDAL_WAVE'
          ? 10
          : this.formation === 'FIRING_SQUAD' || total >= 68
            ? 9
            : total >= 40
              ? 8
              : 7;
    const totalRows = Math.max(1, Math.ceil(total / cols));
    const vanguardRowCutoff = Math.max(1, Math.round(totalRows * vanguardRatio));
    const centerCol = Math.floor(cols / 2);

    const shooterTarget = Math.min(
      Math.max(0, total - heavyTarget),
      def.shooterCount ?? Math.max(3, Math.floor(total * 0.22))
    );
    const chargerTarget = Math.min(
      heavyTarget,
      def.chargerCount ?? Math.max(1, Math.ceil(heavyTarget * 0.55))
    );

    // Choose which indices become Armored Heavies based on formation tactics
    const heavyOrder: number[] = [];
    for (let i = 0; i < total; i++) {
      heavyOrder.push(i);
    }

    if (this.formation === 'SHIELD_PHALANX') {
      // Solid frontline armored shield wall across full bridge width
      heavyOrder.sort((a, b) => a - b);
    } else if (this.formation === 'HORDE_TIDAL_WAVE') {
      // Layered heavy anchor rows (row 0, row 4, row 8) so armor walls recur throughout the tsunami
      heavyOrder.sort((a, b) => {
        const rowA = Math.floor(a / cols);
        const rowB = Math.floor(b / cols);
        const tierA = rowA % 4 === 0 ? 0 : 1;
        const tierB = rowB % 4 === 0 ? 0 : 1;
        if (tierA !== tierB) return tierA - tierB;
        if (rowA !== rowB) return rowA - rowB;
        return Math.abs((a % cols) - centerCol) - Math.abs((b % cols) - centerCol);
      });
    } else if (this.formation === 'FIRING_SQUAD') {
      // 3 armored bastion columns (left, center, right) anchoring the front/mid firing line
      heavyOrder.sort((a, b) => {
        const colA = a % cols;
        const colB = b % cols;
        const bastionA = colA === 1 || colA === centerCol || colA === cols - 2 ? 0 : 1;
        const bastionB = colB === 1 || colB === centerCol || colB === cols - 2 ? 0 : 1;
        if (bastionA !== bastionB) return bastionA - bastionB;
        return a - b;
      });
    } else {
      // Front-center spearhead (WEDGE_BLITZ, PINCER_FLANK, STANDARD)
      heavyOrder.sort((a, b) => {
        const rowA = Math.floor(a / cols);
        const rowB = Math.floor(b / cols);
        if (rowA !== rowB) return rowA - rowB;
        return Math.abs((a % cols) - centerCol) - Math.abs((b % cols) - centerCol);
      });
    }
    const heavySet = new Set(heavyOrder.slice(0, Math.max(0, heavyTarget)));

    let assignedShooters = 0;
    let assignedChargers = 0;
    let maxConfiguredZ = def.z;

    // Wedge row tracker (1, 3, 5, 7, 9, 9, ... units per row)
    let wedgeRow = 0;
    let wedgeCol = 0;
    let wedgeRowWidth = 2;

    // Pincer wing cursors
    let pincerCenterIdx = 0;
    let pincerLeftIdx = 0;
    let pincerRightIdx = 0;

    for (let i = 0; i < total; i++) {
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

      // Designate Ranged Shooters from screened mid/backline non-heavy units
      const allowShooterHere =
        isHeavy === 0 &&
        assignedShooters < shooterTarget &&
        (this.formation === 'FIRING_SQUAD'
          ? row >= 1 || i % 2 === 0
          : this.formation === 'SHIELD_PHALANX'
            ? row >= Math.max(1, Math.ceil(heavyTarget / cols))
            : (row >= 1 || total <= 12) && (i % 2 === 0 || row >= totalRows - 3));
      if (allowShooterHere) {
        this.unitIsShooter[i] = 1;
        assignedShooters++;
      } else {
        this.unitIsShooter[i] = 0;
      }

      this.unitChargeState[i] = 0;
      this.unitChargeTimer[i] = 0;

      const jitterX = (((i * 17 + 5) % 11) - 5) * 0.095;
      const jitterZ = (((i * 13 + 3) % 9) - 4) * 0.11;
      let wx = this.x;
      let wz = def.z;

      if (this.formation === 'PINCER_FLANK' && def.lane === 'CENTER') {
        if (this.unitIsCharger[i] === 1 || (isHeavy === 1 && pincerCenterIdx < Math.max(2, chargerTarget))) {
          // Center spear of Armored Chargers rocketing between the two pincer wings
          const cCol = pincerCenterIdx % 2;
          const cRow = Math.floor(pincerCenterIdx / 2);
          wx = (cCol === 0 ? -0.68 : 0.68) + jitterX * 0.65;
          wz = def.z - 0.35 - cRow * 1.18 + jitterZ * 0.6;
          pincerCenterIdx++;
        } else if (i % 2 === 0) {
          // Left Pincer Column [-4.95, -1.85]
          const wCols = 4;
          const wCol = pincerLeftIdx % wCols;
          const wRow = Math.floor(pincerLeftIdx / wCols);
          const u = wCols > 1 ? wCol / (wCols - 1) : 0.5;
          wx = -4.92 + u * 3.05 + jitterX * 0.75;
          wz = def.z - wRow * 0.90 + jitterZ * 0.7;
          pincerLeftIdx++;
        } else {
          // Right Pincer Column [+1.85, +4.95]
          const wCols = 4;
          const wCol = pincerRightIdx % wCols;
          const wRow = Math.floor(pincerRightIdx / wCols);
          const u = wCols > 1 ? wCol / (wCols - 1) : 0.5;
          wx = 1.87 + u * 3.05 + jitterX * 0.75;
          wz = def.z - wRow * 0.90 + jitterZ * 0.7;
          pincerRightIdx++;
        }
      } else if (this.formation === 'WEDGE_BLITZ' && def.lane === 'CENTER') {
        // Sharp inverted-V arrowhead led by Chargers & Heavies expanding across all 3 lanes
        const uNorm = wedgeRowWidth > 1 ? wedgeCol / (wedgeRowWidth - 1) - 0.5 : 0;
        const rowHalfSpan = Math.min(4.92, 0.72 + wedgeRow * 0.98);
        wx = this.x + uNorm * rowHalfSpan * 2 + jitterX * 0.75;
        wz = def.z - wedgeRow * 0.94 - Math.abs(uNorm) * 0.95 + jitterZ * 0.65;
        wedgeCol++;
        if (wedgeCol >= wedgeRowWidth) {
          wedgeCol = 0;
          wedgeRow++;
          wedgeRowWidth = Math.min(9, 2 + wedgeRow * 2);
        }
      } else {
        const col = i % cols;
        const uNorm = cols > 1 ? col / (cols - 1) - 0.5 : 0;
        const rowShift = (row % 2) * 0.28 - 0.14;
        const rowSpacing =
          this.formation === 'HORDE_TIDAL_WAVE'
            ? 0.86
            : this.formation === 'SHIELD_PHALANX'
              ? 0.90
              : this.formation === 'FIRING_SQUAD'
                ? 1.00
                : 0.94;
        wx = this.x + uNorm * spanHalfX * 2 + jitterX + rowShift;
        wz = def.z - row * rowSpacing + jitterZ;
      }

      wx = Math.max(-5.12, Math.min(5.12, wx));
      wz = Math.min(def.z + 0.35, wz);

      this.unitX[i] = wx;
      this.unitZ[i] = wz;
      if (i === 0 || wz > maxConfiguredZ) {
        maxConfiguredZ = wz;
      }

      const maxHp = isHeavy ? this.hpPerEnemy * 4.2 : this.hpPerEnemy;
      this.unitMaxHp[i] = maxHp;
      this.unitHp[i] = maxHp;
      this.unitHitFlash[i] = 0;
      this.unitCoins[i] = isHeavy ? Math.round(baseCoin * 3.2) : baseCoin;
    }

    // Backfill shooters if formation filter left quota short
    if (assignedShooters < shooterTarget) {
      for (let i = total - 1; i >= 0 && assignedShooters < shooterTarget; i--) {
        if (this.unitIsHeavy[i] === 0 && this.unitIsShooter[i] === 0) {
          this.unitIsShooter[i] = 1;
          assignedShooters++;
        }
      }
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
    boltDamage = 2,
    blockingWallZ: number | null = null
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

    // Hold formation behind any uncollected Holo-Gate or intact 3-lane Barricade Wall between the player and this wave
    // so enemies never march or shoot straight through solid barricades/gates!
    const blockedByGate = blockingGateZ !== null && this.z <= blockingGateZ + 1.5;
    const blockedByWall = blockingWallZ !== null && this.z <= blockingWallZ + 1.5;
    const gateMaxZ = blockingGateZ !== null ? blockingGateZ - 32.0 : Infinity;
    const wallMaxZ = blockingWallZ !== null ? blockingWallZ - 12.0 : Infinity;
    const maxAllowedUnitZ = Math.min(gateMaxZ, wallMaxZ);
    const withinEngage = !blockedByGate && !blockedByWall && squadZ - this.z < 46;
    this.isMarching = withinEngage;

    const formationSpeedMul = this.formation === 'WEDGE_BLITZ' ? 1.16 : 1.0;
    const rearSurgeMul =
      this.initialCount >= 16 && this.aliveCount < this.initialCount * 0.65 ? 1.12 : 1.0;

    if (withinEngage) {
      this.z = Math.min(maxAllowedUnitZ, this.z + this.speed * formationSpeedMul * dt);
      this.marchPhase += dt * (this.formation === 'WEDGE_BLITZ' ? 12.0 : 10.8);
    }

    const cadence = Math.max(0.6, threatCadenceMult);
    const shooterTelegraphDur = SHOOTER_TELEGRAPH_BASE_SEC / Math.sqrt(cadence);
    const chargerTelegraphDur = CHARGER_TELEGRAPH_BASE_SEC / Math.sqrt(cadence);
    const maxConcurrentShooters =
      (cadence >= 1.7 ? 5 : cadence >= 1.3 ? 3 : 2) +
      (this.formation === 'FIRING_SQUAD' ? 1 : 0);
    const maxConcurrentChargers =
      (cadence >= 1.7 ? 4 : cadence >= 1.3 ? 3 : 2) +
      (this.formation === 'WEDGE_BLITZ' ? 1 : 0);

    if (withinEngage) {
      this.shooterWaveCooldown = Math.max(0, this.shooterWaveCooldown - dt);
      this.chargerWaveCooldown = Math.max(0, this.chargerWaveCooldown - dt);
    }

    let activeTelegraphShooters = 0;
    let activeChargers = 0;

    // Zero-GC top-3 shooter & top-2 charger candidate slots
    let bestShooter0 = -1;
    let bestShooterScore0 = Infinity;
    let bestShooter1 = -1;
    let bestShooterScore1 = Infinity;
    let bestShooter2 = -1;
    let bestShooterScore2 = Infinity;

    let bestCharger0 = -1;
    let bestChargerZ0 = -999999;
    let bestCharger1 = -1;
    let bestChargerZ1 = -999999;

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
            // Sprint straight down locked lane at 3.1x speed!
            const rushSpeed = this.speed * 3.1;
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
            (this.unitIsHeavy[i] === 1
              ? 0.94
              : this.unitIsVanguard[i] === 1
                ? 1.16
                : 1.0) *
            formationSpeedMul *
            rearSurgeMul;

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
              if (projectileSystem && distZ >= 5.0 && distZ <= 45) {
                const boltSpeed = ENEMY_BOLT_BASE_SPEED * (0.96 + cadence * 0.14);
                projectileSystem.spawnBolt(this.unitX[i], uz + 0.65, boltSpeed, boltDamage);
                this.lastStepFiredBolt = true;
              }
            }
          } else if (this.unitIsShooter[i] === 1 && distZ >= 8.5 && distZ <= 44) {
            // Bias toward shooters aligned near squadX so camping one lane draws heavy crossfire!
            const score = Math.abs(this.unitX[i] - squadX) + distZ * 0.12;
            if (score < bestShooterScore0) {
              bestShooter2 = bestShooter1;
              bestShooterScore2 = bestShooterScore1;
              bestShooter1 = bestShooter0;
              bestShooterScore1 = bestShooterScore0;
              bestShooter0 = i;
              bestShooterScore0 = score;
            } else if (score < bestShooterScore1) {
              bestShooter2 = bestShooter1;
              bestShooterScore2 = bestShooterScore1;
              bestShooter1 = i;
              bestShooterScore1 = score;
            } else if (score < bestShooterScore2) {
              bestShooter2 = i;
              bestShooterScore2 = score;
            }
          } else if (this.unitIsCharger[i] === 1 && distZ >= 8.0 && distZ <= 36) {
            if (uz > bestChargerZ0) {
              bestCharger1 = bestCharger0;
              bestChargerZ1 = bestChargerZ0;
              bestCharger0 = i;
              bestChargerZ0 = uz;
            } else if (uz > bestChargerZ1) {
              bestCharger1 = i;
              bestChargerZ1 = uz;
            }
          }

          this.unitZ[i] = Math.min(
            maxAllowedUnitZ,
            uz + this.speed * speedMul * dt
          );

          // Controlled close-range flank squeeze (< 12m, nearby lanes within 3.6m):
          // Pressures passive camping while still rewarding carving a clean corridor through massive hordes!
          if (distZ <= 12.0 && distZ > 0.35) {
            const dx = squadX - this.unitX[i];
            if (Math.abs(dx) <= 3.6) {
              const lateralRate =
                this.formation === 'PINCER_FLANK'
                  ? 0.95
                  : this.unitIsVanguard[i] === 1
                    ? 0.72
                    : 0.54;
              this.unitX[i] = Math.max(
                -5.15,
                Math.min(5.15, this.unitX[i] + Math.sign(dx) * Math.min(Math.abs(dx), lateralRate * dt))
              );
            }
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

    // Trigger coordinated staggered shooter salvo across lanes when cooldown ready
    if (
      withinEngage &&
      projectileSystem &&
      this.shooterWaveCooldown <= 0 &&
      activeTelegraphShooters < maxConcurrentShooters &&
      bestShooter0 >= 0
    ) {
      const salvoBudget = Math.min(
        maxConcurrentShooters - activeTelegraphShooters,
        this.formation === 'FIRING_SQUAD' ? 3 : cadence >= 1.3 ? 3 : 2
      );
      let triggered = 0;
      if (bestShooter0 >= 0 && triggered < salvoBudget) {
        this.unitChargeState[bestShooter0] = 1;
        this.unitChargeTimer[bestShooter0] = shooterTelegraphDur;
        triggered++;
      }
      if (bestShooter1 >= 0 && triggered < salvoBudget) {
        this.unitChargeState[bestShooter1] = 1;
        this.unitChargeTimer[bestShooter1] = shooterTelegraphDur + 0.09;
        triggered++;
      }
      if (bestShooter2 >= 0 && triggered < salvoBudget) {
        this.unitChargeState[bestShooter2] = 1;
        this.unitChargeTimer[bestShooter2] = shooterTelegraphDur + 0.18;
      }
      this.shooterWaveCooldown = (this.formation === 'FIRING_SQUAD' ? 0.88 : 1.10) / cadence;
    }

    // Trigger armored charger blitz (up to 2 lanes simultaneously, always leaving >= 1 dodge lane!)
    if (
      withinEngage &&
      this.chargerWaveCooldown <= 0 &&
      activeChargers < maxConcurrentChargers &&
      bestCharger0 >= 0
    ) {
      const chargeBudget = Math.min(
        maxConcurrentChargers - activeChargers,
        this.formation === 'WEDGE_BLITZ' || cadence >= 1.3 ? 2 : 1
      );
      this.unitChargeState[bestCharger0] = 1;
      this.unitChargeTimer[bestCharger0] = chargerTelegraphDur;
      if (
        chargeBudget >= 2 &&
        bestCharger1 >= 0 &&
        Math.abs(this.unitX[bestCharger1] - this.unitX[bestCharger0]) >= 1.65
      ) {
        this.unitChargeState[bestCharger1] = 1;
        this.unitChargeTimer[bestCharger1] = chargerTelegraphDur + 0.12;
      }
      this.chargerWaveCooldown = (this.formation === 'WEDGE_BLITZ' ? 1.75 : 2.15) / cadence;
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
      const uEntityId = this.entityId * 256 + i;
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

    this.lastHitUnitEntityId = this.entityId * 256 + bestIdx;
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
   * Regular troopers trade 1 commando; Heavy Juggernauts deal 3; rushing Armored Chargers deal 3 + bonus!
   */
  public resolveSquadCollision(
    squadX: number,
    squadZ: number,
    playerLogicalSquad: number,
    chargerDamageBonus = 2
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
        Math.abs(this.unitZ[i] - squadZ) <= (isRushingCharger ? 0.96 : 0.76) + unitRad * 0.42 &&
        Math.abs(this.unitX[i] - squadX) <= squadHalfW + unitRad
      ) {
        const dmg = isRushingCharger
          ? 3 + Math.max(1, chargerDamageBonus)
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
