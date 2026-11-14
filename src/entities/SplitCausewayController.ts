import * as THREE from 'three';
import type {
  SplitBarrelNodeDefinition,
  SplitCausewayDefinition,
  SplitNodeReward,
  WeaponTierId,
} from '../core/types';
import { computeSquadOuterRadius } from '../math/formationMath';
import { WEAPON_SPECS } from '../math/weaponMath';
import {
  createStaticWeaponBadgeTexture,
  EditableArcadeHpTexture,
  EditableGateTexture,
} from '../rendering/CanvasLabelCache';
import type { InstancedBatchRenderer } from '../rendering/InstancedBatchRenderer';
import { createGoldCoinPickupGroup } from '../rendering/ProceduralGeometries';
import {
  createShowcaseWeaponGroup,
  type ShowcaseWeaponRig,
} from '../rendering/WeaponRigFactory';
import {
  SHARED_BARREL_GEOS,
  SHARED_DRUM_TEX,
  SHARED_GLOW_TEX,
  SHARED_HOOP_GEO,
} from './SupplyDrum';

export const LEFT_LANE_CENTER_X = -2.58;
export const RIGHT_LANE_CENTER_X = 2.58;
const VISIBLE_QUEUE_SLOTS = 6;
const QUEUE_FRONT_OFFSET_Z = 9.8;
const QUEUE_SLOT_SPACING_Z = 5.45;
const BARREL_HIT_HALF_WIDTH_X = 1.72;
const LEFT_GATE_PANEL_WIDTH = 4.24;
const LEFT_GATE_PANEL_HEIGHT = 2.62;
const MAX_CAUSEWAY_TROOPERS = 440;
const CELEBRATION_SPARK_COUNT = 14;

export type SplitBarrelHitResult =
  | { readonly type: 'NONE' }
  | {
      readonly type: 'BARREL_HIT';
      readonly entityId: number;
      readonly hitX: number;
      readonly hitZ: number;
    }
  | {
      readonly type: 'NODE_CLEARED';
      readonly entityId: number;
      readonly worldX: number;
      readonly worldZ: number;
      readonly reward: SplitNodeReward;
    };

const _missResult: SplitBarrelHitResult = { type: 'NONE' };

interface LeftQueueVisualSlot {
  readonly entityId: number;
  readonly group: THREE.Group;
  readonly barrelPivot: THREE.Group;
  readonly barrelMat: THREE.MeshStandardMaterial;
  readonly hoopMat: THREE.MeshStandardMaterial;
  readonly hpTex: EditableArcadeHpTexture;
  readonly gateArchGroup: THREE.Group;
  readonly gateTex: EditableGateTexture;
  readonly rewardPedestalGroup: THREE.Group;
  readonly glowHaloMat: THREE.MeshBasicMaterial;
  readonly glowHaloMesh: THREE.Mesh;
  readonly coinGroup: THREE.Group;
  readonly weaponRigs: Record<WeaponTierId, ShowcaseWeaponRig>;
  readonly weaponBadges: Record<WeaponTierId, THREE.Mesh>;
  boundNodeIndex: number;
  flashTimer: number;
  flashCooldown: number;
}

export class SplitCausewayController {
  public readonly root = new THREE.Group();
  public active = false;
  public retractedForBoss = false;
  public sectorBaseZ = 0;
  public dividerTipZ = -8.2;
  public siegeDistance = 0;
  public siegeColumnSpan = 340;
  public marchSpeed = 2.45;
  public marchPhase = 0;

  public queueCursor = 0;
  public queueTotal = 0;
  public frontBarrelMaxHp = 15;
  public frontBarrelHp = 15;

  // Right-Lane Multi-Echelon Battalion SoA (zero per-frame allocations)
  public readonly unitCountCap = MAX_CAUSEWAY_TROOPERS;
  public totalTroopers = 0;
  public rightAliveCount = 0;
  public readonly unitAlive = new Uint8Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitRank = new Uint8Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitX = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitZ = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitSpeedMul = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitHp = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitMaxHp = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitHitFlash = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitCoins = new Float32Array(MAX_CAUSEWAY_TROOPERS);

  public readonly lastKill = { x: 0, z: 0, isHeavy: false, coinReward: 0 };

  private queueDefs: ReadonlyArray<SplitBarrelNodeDefinition> = [];
  private readonly visualSlots: LeftQueueVisualSlot[] = [];
  private slideOffsetZ = 0;
  private advanceLockTimer = 0;
  private spinClock = 0;
  private queueSinkY = 0;

  // Golden Squad Celebration Ring + Rising Starburst (triggered on barrel+gate break!)
  private readonly celebrationGroup = new THREE.Group();
  private readonly celebrationOuterRingMat: THREE.MeshBasicMaterial;
  private readonly celebrationInnerRingMat: THREE.MeshBasicMaterial;
  private readonly celebrationGlowDiscMat: THREE.MeshBasicMaterial;
  private readonly celebrationSparks: THREE.Mesh[] = [];
  private readonly celebrationSparkMat: THREE.MeshBasicMaterial;
  private celebrationTimer = 0;

  constructor() {
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x20d8ff,
      emissive: 0x074d6e,
      roughness: 0.28,
      metalness: 0.24,
    });
    const outlineMat = new THREE.MeshBasicMaterial({
      color: 0x090e16,
      side: THREE.BackSide,
    });
    const barrelOutlineMat = new THREE.MeshBasicMaterial({
      color: 0x140d07,
      side: THREE.BackSide,
    });

    const postGeo = new THREE.CylinderGeometry(0.135, 0.155, 3.36, 12);
    const postOutlineGeo = new THREE.CylinderGeometry(0.18, 0.20, 3.42, 12);
    const capGeo = new THREE.SphereGeometry(0.165, 10, 8);
    const capOutlineGeo = new THREE.SphereGeometry(0.21, 10, 8);
    const shadowGeo = new THREE.CircleGeometry(1.62, 20);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x05080d,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
    });

    for (let s = 0; s < VISIBLE_QUEUE_SLOTS; s++) {
      const group = new THREE.Group();
      group.position.set(LEFT_LANE_CENTER_X, 0, -QUEUE_FRONT_OFFSET_Z - s * QUEUE_SLOT_SPACING_Z);

      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(0, 0.022, 0.06);
      group.add(shadow);

      // Plump horizontal stave barrel calibrated so paired gate numerals sit cleanly above rim
      const barrelPivot = new THREE.Group();
      barrelPivot.scale.set(1.25, 0.94, 0.94);

      const barrelMat = new THREE.MeshStandardMaterial({
        color: 0xffebd2,
        map: SHARED_DRUM_TEX,
        roughness: 0.54,
        metalness: 0.14,
        emissive: 0x000000,
      });
      const hoopMat = new THREE.MeshStandardMaterial({
        color: 0x7c8b9c,
        roughness: 0.34,
        metalness: 0.48,
        emissive: 0x000000,
      });

      const barrelMesh = new THREE.Mesh(SHARED_BARREL_GEOS.bodyGeo, barrelMat);
      barrelMesh.position.y = 0.96;
      barrelPivot.add(barrelMesh);

      for (const hx of [-0.66, 0.66]) {
        const hoop = new THREE.Mesh(SHARED_HOOP_GEO, hoopMat);
        hoop.position.set(hx, 0.96, 0);
        barrelPivot.add(hoop);
      }

      const barrelOutline = new THREE.Mesh(SHARED_BARREL_GEOS.outlineGeo, barrelOutlineMat);
      barrelOutline.position.y = 0.96;
      barrelPivot.add(barrelOutline);
      group.add(barrelPivot);

      // Crisp front-facing arcade HP digits on barrel belly
      const hpTex = new EditableArcadeHpTexture();
      const hpMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.52, 1.42),
        new THREE.MeshBasicMaterial({
          map: hpTex.texture,
          transparent: true,
          depthWrite: false,
        })
      );
      hpMesh.position.set(0, 0.98, 1.15);
      group.add(hpMesh);

      // Paired Half-Bridge Cyan Gate Arch directly behind barrel (`z = -1.92`) with elevated numeral band
      const gateArchGroup = new THREE.Group();
      gateArchGroup.position.set(0, 0, -1.92);

      for (const px of [-LEFT_GATE_PANEL_WIDTH * 0.5 - 0.04, LEFT_GATE_PANEL_WIDTH * 0.5 + 0.04]) {
        const post = new THREE.Mesh(postGeo, pylonMat);
        post.position.set(px, 1.68, 0);
        const postOutline = new THREE.Mesh(postOutlineGeo, outlineMat);
        postOutline.position.set(px, 1.68, 0);
        const cap = new THREE.Mesh(capGeo, pylonMat);
        cap.position.set(px, 3.38, 0);
        const capOutline = new THREE.Mesh(capOutlineGeo, outlineMat);
        capOutline.position.set(px, 3.38, 0);
        gateArchGroup.add(post, postOutline, cap, capOutline);
      }

      const gateTex = new EditableGateTexture(false);
      const gatePanel = new THREE.Mesh(
        new THREE.PlaneGeometry(LEFT_GATE_PANEL_WIDTH, LEFT_GATE_PANEL_HEIGHT),
        new THREE.MeshBasicMaterial({
          map: gateTex.texture,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      gatePanel.position.set(0, 2.08, 0);
      gateArchGroup.add(gatePanel);
      group.add(gateArchGroup);

      // Paired 3D Weapon / Coin Pedestal behind barrel (`z = -1.82`)
      const rewardPedestalGroup = new THREE.Group();
      rewardPedestalGroup.position.set(0, 2.38, -1.82);

      const glowHaloMat = new THREE.MeshBasicMaterial({
        map: SHARED_GLOW_TEX,
        color: 0xffdf66,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowHaloMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 2.35), glowHaloMat);
      glowHaloMesh.position.set(0, 0.06, -0.16);
      rewardPedestalGroup.add(glowHaloMesh);

      const coinGroup = createGoldCoinPickupGroup();
      coinGroup.scale.setScalar(1.22);
      rewardPedestalGroup.add(coinGroup);

      const weaponRigs: Record<WeaponTierId, ShowcaseWeaponRig> = {
        1: createShowcaseWeaponGroup(1),
        2: createShowcaseWeaponGroup(2),
        3: createShowcaseWeaponGroup(3),
        4: createShowcaseWeaponGroup(4),
        5: createShowcaseWeaponGroup(5),
      };
      const badgeGeo = new THREE.PlaneGeometry(2.12, 0.62);
      const weaponBadges: Record<WeaponTierId, THREE.Mesh> = {
        1: new THREE.Mesh(
          badgeGeo,
          new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(1), transparent: true, depthWrite: false })
        ),
        2: new THREE.Mesh(
          badgeGeo,
          new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(2), transparent: true, depthWrite: false })
        ),
        3: new THREE.Mesh(
          badgeGeo,
          new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(3), transparent: true, depthWrite: false })
        ),
        4: new THREE.Mesh(
          badgeGeo,
          new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(4), transparent: true, depthWrite: false })
        ),
        5: new THREE.Mesh(
          badgeGeo,
          new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(5), transparent: true, depthWrite: false })
        ),
      };

      for (const t of [1, 2, 3, 4, 5] as const) {
        const rig = weaponRigs[t];
        rig.root.scale.setScalar(1.66);
        rig.root.rotation.z = 0.14;
        rewardPedestalGroup.add(rig.root);

        const badge = weaponBadges[t];
        badge.position.set(0, 0.92, 0.12);
        rewardPedestalGroup.add(badge);
      }

      group.add(rewardPedestalGroup);
      group.visible = false;
      this.root.add(group);

      this.visualSlots.push({
        entityId: 620 + s,
        group,
        barrelPivot,
        barrelMat,
        hoopMat,
        hpTex,
        gateArchGroup,
        gateTex,
        rewardPedestalGroup,
        glowHaloMat,
        glowHaloMesh,
        coinGroup,
        weaponRigs,
        weaponBadges,
        boundNodeIndex: -1,
        flashTimer: 0,
        flashCooldown: 0,
      });
    }

    // --- GOLDEN SQUAD CELEBRATION RING + RISING STARBURST ---
    this.celebrationGlowDiscMat = new THREE.MeshBasicMaterial({
      color: 0xffd24a,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowDisc = new THREE.Mesh(new THREE.CircleGeometry(2.35, 32), this.celebrationGlowDiscMat);
    glowDisc.rotation.x = -Math.PI / 2;
    glowDisc.position.y = 0.045;
    this.celebrationGroup.add(glowDisc);

    this.celebrationOuterRingMat = new THREE.MeshBasicMaterial({
      color: 0xffe678,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(2.05, 2.48, 36),
      this.celebrationOuterRingMat
    );
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.055;
    this.celebrationGroup.add(outerRing);

    this.celebrationInnerRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(1.42, 1.66, 32),
      this.celebrationInnerRingMat
    );
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.062;
    this.celebrationGroup.add(innerRing);

    this.celebrationSparkMat = new THREE.MeshBasicMaterial({
      color: 0xfff099,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparkGeo = new THREE.OctahedronGeometry(0.14, 0);
    for (let k = 0; k < CELEBRATION_SPARK_COUNT; k++) {
      const spark = new THREE.Mesh(sparkGeo, this.celebrationSparkMat);
      this.celebrationSparks.push(spark);
      this.celebrationGroup.add(spark);
    }

    this.celebrationGroup.visible = false;
    this.root.add(this.celebrationGroup);
    this.root.visible = false;
  }

  public configure(def: SplitCausewayDefinition, sectorBaseZ: number): void {
    this.active = true;
    this.retractedForBoss = false;
    this.sectorBaseZ = sectorBaseZ;
    this.dividerTipZ = sectorBaseZ - def.dividerStartZ;
    this.siegeDistance = 0;
    this.siegeColumnSpan = Math.max(60, def.siegeColumnSpan);
    this.marchSpeed = Math.max(1.2, def.marchSpeed);
    this.marchPhase = 0;
    this.slideOffsetZ = 0;
    this.advanceLockTimer = 0;
    this.queueSinkY = 0;
    this.celebrationTimer = 0;
    this.celebrationGroup.visible = false;

    this.queueDefs = def.leftQueue;
    this.queueTotal = def.leftQueue.length;
    this.queueCursor = 0;
    this.bindLeftQueueSlots(true);

    // Populate Right-Lane Multi-Echelon Army
    let idx = 0;
    for (let e = 0; e < def.rightEchelons.length; e++) {
      const ech = def.rightEchelons[e];
      const cols = Math.max(2, ech.cols);
      const rows = Math.max(1, ech.rows);
      const minX = ech.rank === 2 ? 0.94 : 0.72;
      const maxX = ech.rank === 2 ? 4.26 : 4.44;
      const rowSpacingZ = ech.rank === 2 ? 1.48 : 1.06;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (idx >= MAX_CAUSEWAY_TROOPERS) {
            break;
          }
          const u = cols > 1 ? c / (cols - 1) : 0.5;
          const rowStaggerX = (r % 2 === 0 ? -0.09 : 0.09) + (((idx * 17 + 3) % 7) - 3) * 0.032;
          const jitterZ = (((idx * 13 + 5) % 9) - 4) * 0.065;
          const wx = Math.max(minX, Math.min(maxX, minX + u * (maxX - minX) + rowStaggerX));
          const wz = sectorBaseZ - (ech.startZ + r * rowSpacingZ + jitterZ);

          this.unitAlive[idx] = 1;
          this.unitRank[idx] = ech.rank;
          this.unitX[idx] = wx;
          this.unitZ[idx] = wz;
          this.unitSpeedMul[idx] = Math.max(0.65, ech.speed / this.marchSpeed);
          this.unitMaxHp[idx] = Math.max(4, ech.hpPerUnit);
          this.unitHp[idx] = this.unitMaxHp[idx];
          this.unitHitFlash[idx] = 0;
          this.unitCoins[idx] = ech.coinPerKill;
          idx++;
        }
      }
    }

    this.totalTroopers = idx;
    this.rightAliveCount = idx;
    for (let rest = idx; rest < MAX_CAUSEWAY_TROOPERS; rest++) {
      this.unitAlive[rest] = 0;
    }

    this.root.visible = true;
    this.syncQueuePositions();
  }

  public hide(): void {
    this.active = false;
    this.retractedForBoss = false;
    this.totalTroopers = 0;
    this.rightAliveCount = 0;
    this.celebrationTimer = 0;
    this.celebrationGroup.visible = false;
    this.root.visible = false;
  }

  public retractQueueForBoss(): void {
    this.retractedForBoss = true;
  }

  private bindLeftQueueSlots(resetFrontHp: boolean): void {
    if (resetFrontHp) {
      if (this.queueCursor < this.queueTotal) {
        this.frontBarrelMaxHp = Math.max(1, this.queueDefs[this.queueCursor].barrelHp);
        this.frontBarrelHp = this.frontBarrelMaxHp;
      } else {
        this.frontBarrelMaxHp = 1;
        this.frontBarrelHp = 0;
      }
    }

    for (let s = 0; s < VISIBLE_QUEUE_SLOTS; s++) {
      const slot = this.visualSlots[s];
      const nodeIdx = this.queueCursor + s;
      if (nodeIdx >= this.queueTotal) {
        slot.boundNodeIndex = -1;
        slot.group.visible = false;
        continue;
      }

      const nodeDef = this.queueDefs[nodeIdx];
      slot.boundNodeIndex = nodeIdx;
      slot.group.visible = true;
      slot.flashTimer = 0;
      slot.flashCooldown = 0;
      slot.barrelMat.emissive.setRGB(0, 0, 0);
      slot.hoopMat.emissive.setRGB(0, 0, 0);
      slot.barrelPivot.scale.set(1.25, 0.94, 0.94);

      const shownHp = s === 0 ? this.frontBarrelHp : nodeDef.barrelHp;
      slot.hpTex.redrawIfDirty(shownHp, 0);

      const reward = nodeDef.reward;
      if (reward.kind === 'GATE') {
        slot.barrelMat.color.setHex(0xffebd2);
        slot.hoopMat.color.setHex(0x7c8b9c);
        slot.gateArchGroup.visible = true;
        slot.rewardPedestalGroup.visible = false;
        slot.gateTex.redrawIfDirty(
          reward.operator,
          reward.value,
          true,
          0,
          0,
          LEFT_GATE_PANEL_WIDTH
        );
      } else if (reward.kind === 'WEAPON') {
        slot.barrelMat.color.setHex(0xea7e6e);
        slot.hoopMat.color.setHex(0xd8a64c);
        slot.gateArchGroup.visible = false;
        slot.rewardPedestalGroup.visible = true;
        slot.coinGroup.visible = false;
        slot.glowHaloMat.color.setHex(WEAPON_SPECS[reward.weaponTier].colorHex);
        for (const t of [1, 2, 3, 4, 5] as const) {
          const match = t === reward.weaponTier;
          slot.weaponRigs[t].root.visible = match;
          slot.weaponBadges[t].visible = match;
        }
      } else {
        slot.barrelMat.color.setHex(0xffdf8e);
        slot.hoopMat.color.setHex(0xf5bd38);
        slot.gateArchGroup.visible = false;
        slot.rewardPedestalGroup.visible = true;
        slot.coinGroup.visible = true;
        slot.glowHaloMat.color.setHex(0xffe066);
        for (const t of [1, 2, 3, 4, 5] as const) {
          slot.weaponRigs[t].root.visible = false;
          slot.weaponBadges[t].visible = false;
        }
      }
    }
  }

  private syncQueuePositions(): void {
    const frontWorldZ = this.sectorBaseZ - QUEUE_FRONT_OFFSET_Z;
    for (let s = 0; s < VISIBLE_QUEUE_SLOTS; s++) {
      const slot = this.visualSlots[s];
      if (slot.boundNodeIndex < 0) {
        continue;
      }
      const worldZ = frontWorldZ - s * QUEUE_SLOT_SPACING_Z - this.slideOffsetZ;
      slot.group.position.set(LEFT_LANE_CENTER_X, this.queueSinkY, worldZ);
    }
  }

  public triggerSquadCelebration(squadX: number, squadZ: number): void {
    this.celebrationTimer = 0.72;
    this.celebrationGroup.position.set(squadX, 0, squadZ);
    this.celebrationGroup.visible = true;
  }

  public update(
    dt: number,
    squadX: number,
    squadZ: number,
    combatActive: boolean
  ): void {
    if (!this.active) {
      return;
    }

    this.spinClock += dt * 2.4;

    if (this.retractedForBoss) {
      this.queueSinkY = Math.max(-4.2, this.queueSinkY - dt * 14.0);
      if (this.queueSinkY <= -4.0) {
        for (let s = 0; s < VISIBLE_QUEUE_SLOTS; s++) {
          this.visualSlots[s].group.visible = false;
        }
      }
    }

    if (this.advanceLockTimer > 0) {
      this.advanceLockTimer = Math.max(0, this.advanceLockTimer - dt);
    }

    if (this.slideOffsetZ > 0.001) {
      this.slideOffsetZ *= Math.exp(-11.5 * dt);
      if (this.slideOffsetZ < 0.008) {
        this.slideOffsetZ = 0;
      }
    }

    // Animate visible left-lane barrels & weapon/coin pedestals
    for (let s = 0; s < VISIBLE_QUEUE_SLOTS; s++) {
      const slot = this.visualSlots[s];
      if (slot.boundNodeIndex < 0 || !slot.group.visible) {
        continue;
      }

      if (slot.flashCooldown > 0) {
        slot.flashCooldown = Math.max(0, slot.flashCooldown - dt);
      }
      if (slot.flashTimer > 0) {
        slot.flashTimer = Math.max(0, slot.flashTimer - dt * 9.5);
        slot.barrelMat.emissive.setRGB(slot.flashTimer * 0.54, slot.flashTimer * 0.15, 0.02);
        slot.hoopMat.emissive.setRGB(slot.flashTimer * 0.34, slot.flashTimer * 0.10, 0.01);
        const pop = 1 + slot.flashTimer * 0.055;
        slot.barrelPivot.scale.set(1.25 * pop, 0.94 * (1 - slot.flashTimer * 0.03), 0.94 * pop);
      } else {
        slot.barrelMat.emissive.setRGB(0, 0, 0);
        slot.hoopMat.emissive.setRGB(0, 0, 0);
        slot.barrelPivot.scale.set(1.25, 0.94, 0.94);
      }

      if (s === 0) {
        slot.hpTex.redrawIfDirty(this.frontBarrelHp, slot.flashTimer);
      }

      if (slot.rewardPedestalGroup.visible) {
        const phase = this.spinClock + s * 0.65;
        slot.rewardPedestalGroup.position.y = 2.38 + Math.sin(phase * 1.5) * 0.08;
        slot.glowHaloMesh.rotation.z = phase * 0.45;
        if (slot.coinGroup.visible) {
          slot.coinGroup.rotation.y = Math.sin(phase * 1.2) * 0.55;
        } else {
          for (const t of [1, 2, 3, 4, 5] as const) {
            const rig = slot.weaponRigs[t];
            if (rig.root.visible) {
              rig.root.rotation.y = Math.sin(phase * 0.85) * 0.28;
              if (rig.spinCluster) {
                rig.spinCluster.rotation.x += dt * 12;
              }
            }
          }
        }
      }
    }

    this.syncQueuePositions();

    // Animate Golden Squad Celebration Ring
    if (this.celebrationTimer > 0) {
      this.celebrationTimer = Math.max(0, this.celebrationTimer - dt);
      const t = 1 - this.celebrationTimer / 0.72;
      this.celebrationGroup.position.set(squadX, 0, squadZ);
      const ringScale = 0.55 + t * 0.92;
      this.celebrationGroup.scale.set(ringScale, 1, ringScale);
      const fade = Math.max(0, Math.sin(Math.min(1, t * 1.1) * Math.PI));
      this.celebrationOuterRingMat.opacity = fade * 0.96;
      this.celebrationInnerRingMat.opacity = fade * 0.82;
      this.celebrationGlowDiscMat.opacity = fade * 0.36;
      this.celebrationSparkMat.opacity = fade * 0.95;

      for (let k = 0; k < CELEBRATION_SPARK_COUNT; k++) {
        const ang = (k / CELEBRATION_SPARK_COUNT) * Math.PI * 2 + t * 2.4;
        const rad = (1.55 + (k % 3) * 0.34) / Math.max(0.4, ringScale);
        const y = 0.25 + t * (1.85 + (k % 4) * 0.32);
        const spark = this.celebrationSparks[k];
        spark.position.set(Math.cos(ang) * rad, y, Math.sin(ang) * rad);
        spark.rotation.y = ang * 2;
        spark.rotation.x = t * 5;
        const sScale = Math.max(0.15, 1.15 - t * 0.85);
        spark.scale.setScalar(sScale);
      }

      if (this.celebrationTimer <= 0) {
        this.celebrationGroup.visible = false;
      }
    }

    if (!combatActive || this.retractedForBoss) {
      return;
    }

    // Find closest surviving right-lane trooper so any cleared gap > 11.5m triggers an immediate reinforcement sprint!
    let closestAliveZ = -999999;
    for (let i = 0; i < this.totalTroopers; i++) {
      if (this.unitAlive[i] !== 0 && this.unitZ[i] > closestAliveZ) {
        closestAliveZ = this.unitZ[i];
      }
    }

    const gapAhead = squadZ - closestAliveZ;
    const speedBoost = closestAliveZ > -900000 && gapAhead > 13.5 ? 1.75 : 1.0;
    const stepSpeed = this.marchSpeed * speedBoost;
    this.siegeDistance = Math.min(this.siegeColumnSpan, this.siegeDistance + stepSpeed * dt);
    this.marchPhase += dt * 11.2 * (speedBoost > 1 ? 1.28 : 1.0);

    let alive = 0;
    for (let i = 0; i < this.totalTroopers; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      if (this.unitHitFlash[i] > 0) {
        this.unitHitFlash[i] = Math.max(0, this.unitHitFlash[i] - dt * 6.8);
      }

      // Once a right-lane trooper clears the nose of the Center Divider Wall (`dividerTipZ`),
      // they enter the open Breach Zone and sprint diagonally straight toward `(squadX, squadZ)`!
      if (this.unitZ[i] > this.dividerTipZ + 0.25) {
        const dx = squadX - this.unitX[i];
        const dz = Math.max(0.35, squadZ + 0.25 - this.unitZ[i]);
        const dist = Math.hypot(dx, dz);
        const breachMul = this.unitRank[i] === 2 ? 1.06 : 1.18;
        const chargeStep = stepSpeed * this.unitSpeedMul[i] * breachMul * dt;
        const inv = 1 / Math.max(0.001, dist);
        this.unitX[i] = Math.max(
          -4.35,
          Math.min(4.35, this.unitX[i] + dx * inv * chargeStep)
        );
        this.unitZ[i] += Math.max(stepSpeed * 0.45 * dt, dz * inv * chargeStep);
      } else {
        const advance = stepSpeed * this.unitSpeedMul[i] * dt;
        this.unitZ[i] += advance;
      }

      alive++;
    }

    this.rightAliveCount = alive;
  }

  public getProgress(): number {
    if (this.retractedForBoss) {
      return 1;
    }
    if (this.totalTroopers > 0 && this.rightAliveCount <= 0) {
      return 1;
    }
    const distRatio = Math.min(1, this.siegeDistance / Math.max(1, this.siegeColumnSpan));
    const killRatio =
      this.totalTroopers > 0
        ? (this.totalTroopers - this.rightAliveCount) / this.totalTroopers
        : 0;
    return Math.min(0.99, Math.max(distRatio * 0.92, killRatio * 0.98));
  }

  public isSiegeComplete(): boolean {
    if (!this.active || this.retractedForBoss) {
      return false;
    }
    if (this.rightAliveCount <= 0) {
      return true;
    }
    return this.siegeDistance >= this.siegeColumnSpan && this.rightAliveCount <= 0;
  }

  public getQueueRemaining(): number {
    return Math.max(0, this.queueTotal - this.queueCursor);
  }

  public getFrontBarrelPosition(): { x: number; z: number } | null {
    if (!this.active || this.retractedForBoss || this.queueCursor >= this.queueTotal) {
      return null;
    }
    return {
      x: LEFT_LANE_CENTER_X,
      z: this.sectorBaseZ - QUEUE_FRONT_OFFSET_Z - this.slideOffsetZ,
    };
  }

  public getClosestRightTarget(maxAheadMeters = 52): { x: number; z: number } | null {
    if (!this.active || this.rightAliveCount <= 0) {
      return null;
    }
    let bestZ = -999999;
    let bestX = RIGHT_LANE_CENTER_X;
    const cutoffZ = this.sectorBaseZ - maxAheadMeters;

    for (let i = 0; i < this.totalTroopers; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      const uz = this.unitZ[i];
      if (uz >= cutoffZ && uz > bestZ) {
        bestZ = uz;
        bestX = this.unitX[i];
      }
    }

    if (bestZ < -900000) {
      return null;
    }
    return { x: bestX, z: bestZ };
  }

  /**
   * Blocks bullets that hit or attempt to cross the solid ballistic Center Divider Wall (`x = 0`, `z <= dividerTipZ`).
   */
  public checkDividerWallBlock(bx: number, bz: number, prevBx: number): boolean {
    if (!this.active || this.retractedForBoss) {
      return false;
    }
    if (bz > this.dividerTipZ + 0.18) {
      return false;
    }
    if (Math.abs(bx) < 0.28) {
      return true;
    }
    return (prevBx < -0.02 && bx >= -0.02) || (prevBx > 0.02 && bx <= 0.02);
  }

  public tryLeftQueueBulletHit(
    bx: number,
    bz: number,
    prevBz: number,
    damage: number,
    lastHitId: number
  ): SplitBarrelHitResult {
    if (
      !this.active ||
      this.retractedForBoss ||
      this.queueCursor >= this.queueTotal ||
      bx > -0.26
    ) {
      return _missResult;
    }

    const frontSlot = this.visualSlots[0];
    if (frontSlot.entityId === lastHitId || lastHitId === 699) {
      return _missResult;
    }

    const barrelZ = this.sectorBaseZ - QUEUE_FRONT_OFFSET_Z - this.slideOffsetZ;
    const minZ = Math.min(bz, prevBz) - 1.18;
    const maxZ = Math.max(bz, prevBz) + 1.18;
    if (barrelZ < minZ || barrelZ > maxZ) {
      return _missResult;
    }
    if (Math.abs(bx - LEFT_LANE_CENTER_X) > BARREL_HIT_HALF_WIDTH_X) {
      return _missResult;
    }

    // Absorb overkill volley bullets cleanly while the next barrel is sliding forward into the front slot!
    if (this.advanceLockTimer > 0 || this.slideOffsetZ > 1.35) {
      return {
        type: 'BARREL_HIT',
        entityId: 699,
        hitX: bx,
        hitZ: barrelZ + 0.85,
      };
    }

    this.frontBarrelHp -= damage;
    if (frontSlot.flashCooldown <= 0) {
      frontSlot.flashTimer = 1.0;
      frontSlot.flashCooldown = 0.14;
    }

    if (this.frontBarrelHp <= 0) {
      const clearedReward = this.queueDefs[this.queueCursor].reward;
      const clearedEntityId = frontSlot.entityId;
      this.queueCursor++;
      this.slideOffsetZ += QUEUE_SLOT_SPACING_Z;
      this.advanceLockTimer = 0.42;
      this.bindLeftQueueSlots(true);
      this.syncQueuePositions();

      return {
        type: 'NODE_CLEARED',
        entityId: clearedEntityId,
        worldX: LEFT_LANE_CENTER_X,
        worldZ: barrelZ,
        reward: clearedReward,
      };
    }

    frontSlot.hpTex.redrawIfDirty(this.frontBarrelHp, frontSlot.flashTimer);
    return {
      type: 'BARREL_HIT',
      entityId: frontSlot.entityId,
      hitX: bx,
      hitZ: barrelZ + 0.85,
    };
  }

  public tryRightArmyBulletHit(
    bx: number,
    bz: number,
    prevBz: number,
    damage: number,
    lastHitId: number
  ): { status: 'MISS' | 'HIT' | 'KILL'; entityId: number } {
    if (!this.active || this.rightAliveCount <= 0) {
      return { status: 'MISS', entityId: -1 };
    }
    // Bullets inside the Left Corridor past the divider tip cannot hit Right-Corridor troopers
    if (bz <= this.dividerTipZ && bx < 0.22) {
      return { status: 'MISS', entityId: -1 };
    }

    let bestIdx = -1;
    let bestZ = -999999;
    const segMinZ = Math.min(bz, prevBz);
    const segMaxZ = Math.max(bz, prevBz);
    const maxReachZ = this.sectorBaseZ - 64;

    for (let i = 0; i < this.totalTroopers; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      const uz = this.unitZ[i];
      if (uz < maxReachZ) {
        continue;
      }
      const uEntityId = 20000 + i;
      if (uEntityId === lastHitId) {
        continue;
      }
      const hitRad = this.unitRank[i] === 2 ? 0.68 : 0.49;
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
      return { status: 'MISS', entityId: -1 };
    }

    const hitEntityId = 20000 + bestIdx;
    this.unitHitFlash[bestIdx] = 1.0;
    this.unitHp[bestIdx] -= damage;

    if (this.unitHp[bestIdx] <= 0) {
      this.unitAlive[bestIdx] = 0;
      this.rightAliveCount = Math.max(0, this.rightAliveCount - 1);
      this.lastKill.x = this.unitX[bestIdx];
      this.lastKill.z = this.unitZ[bestIdx];
      this.lastKill.isHeavy = this.unitRank[bestIdx] === 2;
      this.lastKill.coinReward = this.unitCoins[bestIdx];
      return { status: 'KILL', entityId: hitEntityId };
    }

    return { status: 'HIT', entityId: hitEntityId };
  }

  public resolveSquadCollision(
    squadX: number,
    squadZ: number,
    playerLogicalSquad: number
  ): { playerLosses: number; hitX: number; hitZ: number } | null {
    if (!this.active || this.rightAliveCount <= 0 || playerLogicalSquad <= 0) {
      return null;
    }

    const squadHalfW = computeSquadOuterRadius(playerLogicalSquad);
    let totalLosses = 0;
    let impactX = squadX;
    let impactZ = squadZ;

    for (let i = 0; i < this.totalTroopers; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      const uz = this.unitZ[i];
      const ux = this.unitX[i];
      const isHeavy = this.unitRank[i] === 2;
      const unitRad = isHeavy ? 0.58 : 0.42;

      const directClash =
        Math.abs(uz - squadZ) <= 0.85 + unitRad * 0.4 &&
        Math.abs(ux - squadX) <= squadHalfW + unitRad;
      // Also punish any enemy allowed to breach completely past the defense line (`uz > squadZ + 1.35`)!
      const breachedDefenseLine = uz > squadZ + 1.35;

      if (directClash || breachedDefenseLine) {
        const dmg = isHeavy ? 3 : 1;
        totalLosses += dmg;
        impactX = directClash ? ux : squadX;
        impactZ = directClash ? uz : squadZ;
        this.unitAlive[i] = 0;
        this.rightAliveCount = Math.max(0, this.rightAliveCount - 1);

        if (totalLosses >= playerLogicalSquad) {
          break;
        }
      }
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

  public pushInstances(renderer: InstancedBatchRenderer, isCombatMoving: boolean): void {
    if (!this.active || this.rightAliveCount <= 0) {
      return;
    }
    const minRenderZ = this.sectorBaseZ - 118;
    const maxRenderZ = this.sectorBaseZ + 10;

    for (let i = 0; i < this.totalTroopers; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      const uz = this.unitZ[i];
      if (uz < minRenderZ || uz > maxRenderZ) {
        continue;
      }
      const rank = this.unitRank[i];
      if (rank === 2) {
        renderer.pushHeavyEnemySoldier(
          this.unitX[i],
          uz,
          this.marchPhase + i * 0.55,
          this.unitHitFlash[i],
          isCombatMoving
        );
      } else {
        renderer.pushEnemySoldier(
          this.unitX[i],
          uz,
          this.marchPhase + i * 0.78,
          this.unitHitFlash[i],
          isCombatMoving,
          rank === 0
        );
      }
    }
  }
}
