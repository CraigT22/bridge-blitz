import * as THREE from 'three';
import type {
  SkinThemeId,
  SplitBarrelNodeDefinition,
  SplitCausewayDefinition,
  SplitNodeReward,
  WeaponTierId,
} from '../core/types';
import {
  computeSquadOuterRadius,
  SOLDIER_SAFE_LIMIT_X,
  SPLIT_DIVIDER_X,
} from '../math/formationMath';
import { getWeaponDisplaySpec } from '../math/weaponMath';
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
  ENEMY_BOLT_BASE_SPEED,
  type EnemyProjectileSystem,
} from './EnemyProjectileSystem';
import {
  SHARED_BARREL_GEOS,
  SHARED_DRUM_TEX,
  SHARED_GLOW_TEX,
  SHARED_HOOP_GEO,
} from './SupplyDrum';

// Asymmetric Split Causeway Columns around SPLIT_DIVIDER_X (-0.88):
// - Left Power-Up Column [-6.12, -0.88] = 5.24m wide (0.75x = 25% smaller than Right!) -> center -3.50
// - Right Enemy Column   [-0.88, +6.12] = 7.00m wide -> center +2.62
export const LEFT_LANE_CENTER_X = -3.50;
export const RIGHT_LANE_CENTER_X = 2.62;
const VISIBLE_QUEUE_SLOTS = 4;
const QUEUE_FRONT_OFFSET_Z = 8.8;
const QUEUE_SLOT_SPACING_Z = 5.45;
const LEFT_BARREL_SCALE_X = 1.46;
const LEFT_BARREL_SCALE_YZ = 1.14;
const BARREL_HIT_HALF_WIDTH_X = 2.42;
const LEFT_GATE_PANEL_WIDTH = 4.44;
const LEFT_GATE_PANEL_HEIGHT = 2.86;
const MAX_CAUSEWAY_TROOPERS = 740;
const CELEBRATION_SPARK_COUNT = 14;
const SPLIT_SHOOTER_TELEGRAPH_BASE_SEC = 0.58;
const SPLIT_CHARGER_TELEGRAPH_BASE_SEC = 0.64;

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
  readonly weaponRigsByTheme: Record<SkinThemeId, Record<WeaponTierId, ShowcaseWeaponRig>>;
  readonly weaponBadgesByTheme: Record<SkinThemeId, Record<WeaponTierId, THREE.Mesh>>;
  boundNodeIndex: number;
  flashTimer: number;
  flashCooldown: number;
}

export class SplitCausewayController {
  public readonly root = new THREE.Group();
  public active = false;
  public retractedForBoss = false;
  public sectorBaseZ = 0;
  public dividerTipZ = -7.4;
  public siegeDistance = 0;
  public siegeColumnSpan = 340;
  public marchSpeed = 2.45;
  public marchPhase = 0;
  public lastStepFiredBolt = false;
  public lastStepStartedCharge = false;

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
  public readonly unitIsShooter = new Uint8Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitIsCharger = new Uint8Array(MAX_CAUSEWAY_TROOPERS);
  /** 0 = idle, 1 = telegraphing shot/charge, 2 = rushing forward */
  public readonly unitChargeState = new Uint8Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitChargeTimer = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitX = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitZ = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitSpeedMul = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitHp = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitMaxHp = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitHitFlash = new Float32Array(MAX_CAUSEWAY_TROOPERS);
  public readonly unitCoins = new Float32Array(MAX_CAUSEWAY_TROOPERS);

  public readonly lastKill = { x: 0, z: 0, isHeavy: false, stoppedCharger: false, coinReward: 0 };

  private skinTheme: SkinThemeId = 'TACTICAL';
  private readonly pylonMat: THREE.MeshStandardMaterial;
  private queueDefs: ReadonlyArray<SplitBarrelNodeDefinition> = [];
  private readonly visualSlots: LeftQueueVisualSlot[] = [];
  private slideOffsetZ = 0;
  private advanceLockTimer = 0;
  private spinClock = 0;
  private queueSinkY = 0;
  private shooterCooldown = 1.1;
  private chargerCooldown = 1.9;

  // Golden Squad Celebration Ring + Rising Starburst (triggered on barrel+gate break!)
  private readonly celebrationGroup = new THREE.Group();
  private readonly celebrationOuterRingMat: THREE.MeshBasicMaterial;
  private readonly celebrationInnerRingMat: THREE.MeshBasicMaterial;
  private readonly celebrationGlowDiscMat: THREE.MeshBasicMaterial;
  private readonly celebrationSparks: THREE.Mesh[] = [];
  private readonly celebrationSparkMat: THREE.MeshBasicMaterial;
  private celebrationTimer = 0;

  constructor() {
    this.pylonMat = new THREE.MeshStandardMaterial({
      color: 0x18f2c8,
      emissive: 0x065448,
      roughness: 0.28,
      metalness: 0.34,
    });
    const outlineMat = new THREE.MeshBasicMaterial({
      color: 0x070c14,
      side: THREE.BackSide,
    });
    const barrelOutlineMat = new THREE.MeshBasicMaterial({
      color: 0x070c14,
      side: THREE.BackSide,
    });

    const postGeo = new THREE.CylinderGeometry(0.145, 0.19, 3.85, 6);
    const postOutlineGeo = new THREE.CylinderGeometry(0.195, 0.24, 3.91, 6);
    const capGeo = new THREE.OctahedronGeometry(0.21, 0);
    const capOutlineGeo = new THREE.OctahedronGeometry(0.26, 0);
    const shadowGeo = new THREE.CircleGeometry(1.92, 10);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x05080d,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    });
    const badgeGeo = new THREE.PlaneGeometry(2.18, 0.64);

    for (let s = 0; s < VISIBLE_QUEUE_SLOTS; s++) {
      const group = new THREE.Group();
      group.position.set(LEFT_LANE_CENTER_X, 0, -QUEUE_FRONT_OFFSET_Z - s * QUEUE_SLOT_SPACING_Z);

      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(0, 0.022, 0.06);
      group.add(shadow);

      // Chunky Armored Ordnance Barrel filling ~68% of the Left Power-Up Column width (comp silhouette!)
      const barrelPivot = new THREE.Group();
      barrelPivot.scale.set(LEFT_BARREL_SCALE_X, LEFT_BARREL_SCALE_YZ, LEFT_BARREL_SCALE_YZ);

      const barrelMat = new THREE.MeshStandardMaterial({
        color: 0x7ceef2,
        map: SHARED_DRUM_TEX,
        roughness: 0.38,
        metalness: 0.36,
        emissive: 0x000000,
      });
      const hoopMat = new THREE.MeshStandardMaterial({
        color: 0x8cc8ff,
        roughness: 0.28,
        metalness: 0.48,
        emissive: 0x000000,
      });

      const barrelMesh = new THREE.Mesh(SHARED_BARREL_GEOS.bodyGeo, barrelMat);
      barrelMesh.position.y = 1.02;
      barrelPivot.add(barrelMesh);

      for (const hx of [-0.68, 0.68]) {
        const hoop = new THREE.Mesh(SHARED_HOOP_GEO, hoopMat);
        hoop.position.set(hx, 1.02, 0);
        barrelPivot.add(hoop);
      }

      const barrelOutline = new THREE.Mesh(SHARED_BARREL_GEOS.outlineGeo, barrelOutlineMat);
      barrelOutline.position.y = 1.02;
      barrelPivot.add(barrelOutline);
      group.add(barrelPivot);

      // Bold Dark-Glass Tactical HUD HP Plaque on chunky front barrel face
      const hpTex = new EditableArcadeHpTexture();
      const hpMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.86, 1.60),
        new THREE.MeshBasicMaterial({
          map: hpTex.texture,
          transparent: true,
          depthWrite: false,
        })
      );
      hpMesh.position.set(0, 1.16, 1.32);
      group.add(hpMesh);

      // Paired Half-Bridge Hex-Grid Holo-Gate Arch tucked tightly behind pod (`z = -1.95`)
      const gateArchGroup = new THREE.Group();
      gateArchGroup.position.set(0, 0, -1.95);

      for (const px of [-LEFT_GATE_PANEL_WIDTH * 0.5 - 0.04, LEFT_GATE_PANEL_WIDTH * 0.5 + 0.04]) {
        const post = new THREE.Mesh(postGeo, this.pylonMat);
        post.position.set(px, 1.92, 0);
        const postOutline = new THREE.Mesh(postOutlineGeo, outlineMat);
        postOutline.position.set(px, 1.92, 0);
        const cap = new THREE.Mesh(capGeo, this.pylonMat);
        cap.position.set(px, 3.92, 0);
        const capOutline = new THREE.Mesh(capOutlineGeo, outlineMat);
        capOutline.position.set(px, 3.92, 0);
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
      gatePanel.position.set(0, 2.58, 0);
      gateArchGroup.add(gatePanel);
      group.add(gateArchGroup);

      // Paired 3D Weapon / Coin Pedestal behind barrel (`z = -1.88`)
      const rewardPedestalGroup = new THREE.Group();
      rewardPedestalGroup.position.set(0, 2.68, -1.88);

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

      const buildWeaponSet = (theme: SkinThemeId): Record<WeaponTierId, ShowcaseWeaponRig> => ({
        1: createShowcaseWeaponGroup(1, theme),
        2: createShowcaseWeaponGroup(2, theme),
        3: createShowcaseWeaponGroup(3, theme),
        4: createShowcaseWeaponGroup(4, theme),
        5: createShowcaseWeaponGroup(5, theme),
      });
      const buildBadgeSet = (theme: SkinThemeId): Record<WeaponTierId, THREE.Mesh> => ({
        1: new THREE.Mesh(
          badgeGeo,
          new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(1, theme), transparent: true, depthWrite: false })
        ),
        2: new THREE.Mesh(
          badgeGeo,
          new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(2, theme), transparent: true, depthWrite: false })
        ),
        3: new THREE.Mesh(
          badgeGeo,
          new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(3, theme), transparent: true, depthWrite: false })
        ),
        4: new THREE.Mesh(
          badgeGeo,
          new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(4, theme), transparent: true, depthWrite: false })
        ),
        5: new THREE.Mesh(
          badgeGeo,
          new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(5, theme), transparent: true, depthWrite: false })
        ),
      });

      const weaponRigsByTheme: Record<SkinThemeId, Record<WeaponTierId, ShowcaseWeaponRig>> = {
        TACTICAL: buildWeaponSet('TACTICAL'),
        UNICORN: buildWeaponSet('UNICORN'),
      };
      const weaponBadgesByTheme: Record<SkinThemeId, Record<WeaponTierId, THREE.Mesh>> = {
        TACTICAL: buildBadgeSet('TACTICAL'),
        UNICORN: buildBadgeSet('UNICORN'),
      };

      for (const theme of ['TACTICAL', 'UNICORN'] as const) {
        for (const t of [1, 2, 3, 4, 5] as const) {
          const rig = weaponRigsByTheme[theme][t];
          rig.root.scale.setScalar(1.66);
          rig.root.rotation.z = 0.14;
          rig.root.visible = false;
          rewardPedestalGroup.add(rig.root);

          const badge = weaponBadgesByTheme[theme][t];
          badge.position.set(0, 0.92, 0.12);
          badge.visible = false;
          rewardPedestalGroup.add(badge);
        }
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
        weaponRigsByTheme,
        weaponBadgesByTheme,
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

  public setSkinTheme(theme: SkinThemeId): void {
    if (this.skinTheme === theme) {
      return;
    }
    this.skinTheme = theme;
    if (theme === 'UNICORN') {
      this.pylonMat.color.setHex(0xff66cc);
      this.pylonMat.emissive.setHex(0x661248);
    } else {
      this.pylonMat.color.setHex(0x18f2c8);
      this.pylonMat.emissive.setHex(0x065448);
    }
    if (this.active) {
      this.bindLeftQueueSlots(false);
    }
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
    this.lastStepFiredBolt = false;
    this.lastStepStartedCharge = false;
    this.shooterCooldown = 1.05;
    this.chargerCooldown = 1.85;

    this.queueDefs = def.leftQueue;
    this.queueTotal = def.leftQueue.length;
    this.queueCursor = 0;
    this.bindLeftQueueSlots(true);

    // Populate Right-Lane Multi-Echelon Army across the wider 7.00m Right Enemy Column [-0.88, +6.12]
    let idx = 0;
    for (let e = 0; e < def.rightEchelons.length; e++) {
      const ech = def.rightEchelons[e];
      const cols = Math.max(2, ech.cols);
      const rows = Math.max(1, ech.rows);
      const minX = ech.rank === 2 ? -0.14 : -0.36;
      const maxX = ech.rank === 2 ? 5.30 : 5.54;
      const rowSpacingZ = ech.rank === 2 ? 1.48 : 1.06;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (idx >= MAX_CAUSEWAY_TROOPERS) {
            break;
          }
          const u = cols > 1 ? c / (cols - 1) : 0.5;
          const rowStaggerX =
            (r % 2 === 0 ? -0.14 : 0.14) + (((idx * 17 + 3) % 11) - 5) * 0.085;
          const jitterZ = (((idx * 13 + 5) % 9) - 4) * 0.14;
          const wx = Math.max(minX, Math.min(maxX, minX + u * (maxX - minX) + rowStaggerX));
          const wz = sectorBaseZ - (ech.startZ + r * rowSpacingZ + jitterZ);

          this.unitAlive[idx] = 1;
          this.unitRank[idx] = ech.rank;
          this.unitIsShooter[idx] = ech.rank !== 2 && r >= 1 && (c + r) % 3 === 1 ? 1 : 0;
          this.unitIsCharger[idx] = ech.rank === 2 && (c + r) % 2 === 0 ? 1 : 0;
          this.unitChargeState[idx] = 0;
          this.unitChargeTimer[idx] = 0;
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
      this.unitIsShooter[rest] = 0;
      this.unitIsCharger[rest] = 0;
      this.unitChargeState[rest] = 0;
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

    const isUnicorn = this.skinTheme === 'UNICORN';

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
      slot.barrelPivot.scale.set(
        LEFT_BARREL_SCALE_X,
        LEFT_BARREL_SCALE_YZ,
        LEFT_BARREL_SCALE_YZ
      );

      const shownHp = s === 0 ? this.frontBarrelHp : nodeDef.barrelHp;
      slot.hpTex.redrawIfDirty(shownHp, 0);

      const reward = nodeDef.reward;
      if (reward.kind === 'GATE') {
        slot.barrelMat.color.setHex(isUnicorn ? 0xff92db : 0x6ceef0);
        slot.hoopMat.color.setHex(isUnicorn ? 0xffe4fa : 0x8ec8ff);
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
        slot.barrelMat.color.setHex(isUnicorn ? 0xff70c2 : 0xe2567c);
        slot.hoopMat.color.setHex(isUnicorn ? 0xffcf40 : 0xffbe3b);
        slot.gateArchGroup.visible = false;
        slot.rewardPedestalGroup.visible = true;
        slot.coinGroup.visible = false;
        slot.glowHaloMat.color.setHex(
          getWeaponDisplaySpec(reward.weaponTier, this.skinTheme).colorHex
        );
        for (const theme of ['TACTICAL', 'UNICORN'] as const) {
          for (const t of [1, 2, 3, 4, 5] as const) {
            const match = theme === this.skinTheme && t === reward.weaponTier;
            slot.weaponRigsByTheme[theme][t].root.visible = match;
            slot.weaponBadgesByTheme[theme][t].visible = match;
          }
        }
      } else {
        slot.barrelMat.color.setHex(isUnicorn ? 0xdca8ff : 0xa8c6e4);
        slot.hoopMat.color.setHex(0xffb830);
        slot.gateArchGroup.visible = false;
        slot.rewardPedestalGroup.visible = true;
        slot.coinGroup.visible = true;
        slot.glowHaloMat.color.setHex(0xffcf48);
        for (const theme of ['TACTICAL', 'UNICORN'] as const) {
          for (const t of [1, 2, 3, 4, 5] as const) {
            slot.weaponRigsByTheme[theme][t].root.visible = false;
            slot.weaponBadgesByTheme[theme][t].visible = false;
          }
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
    combatActive: boolean,
    projectileSystem?: EnemyProjectileSystem,
    threatCadenceMult = 1.0,
    boltDamage = 1
  ): void {
    this.lastStepFiredBolt = false;
    this.lastStepStartedCharge = false;
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
      this.slideOffsetZ *= Math.exp(-8.2 * dt);
      if (this.slideOffsetZ < 0.008) {
        this.slideOffsetZ = 0;
      }
    }

    // Animate visible left-lane armored hex pods & weapon/bullion pedestals
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
        slot.barrelMat.emissive.setRGB(slot.flashTimer * 0.14, slot.flashTimer * 0.44, slot.flashTimer * 0.50);
        slot.hoopMat.emissive.setRGB(slot.flashTimer * 0.36, slot.flashTimer * 0.28, 0.06);
        const pop = 1 + slot.flashTimer * 0.055;
        slot.barrelPivot.scale.set(
          LEFT_BARREL_SCALE_X * pop,
          LEFT_BARREL_SCALE_YZ * (1 - slot.flashTimer * 0.03),
          LEFT_BARREL_SCALE_YZ * pop
        );
      } else {
        slot.barrelMat.emissive.setRGB(0, 0, 0);
        slot.hoopMat.emissive.setRGB(0, 0, 0);
        slot.barrelPivot.scale.set(
          LEFT_BARREL_SCALE_X,
          LEFT_BARREL_SCALE_YZ,
          LEFT_BARREL_SCALE_YZ
        );
      }

      if (s === 0) {
        slot.hpTex.redrawIfDirty(this.frontBarrelHp, slot.flashTimer);
      }

      if (slot.rewardPedestalGroup.visible) {
        const phase = this.spinClock + s * 0.65;
        slot.rewardPedestalGroup.position.y = 2.68 + Math.sin(phase * 1.5) * 0.08;
        slot.glowHaloMesh.rotation.z = phase * 0.45;
        if (slot.coinGroup.visible) {
          slot.coinGroup.rotation.y = Math.sin(phase * 1.2) * 0.55;
        } else {
          const activeRigs = slot.weaponRigsByTheme[this.skinTheme];
          for (const t of [1, 2, 3, 4, 5] as const) {
            const rig = activeRigs[t];
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

    // Animate Squad Celebration Ring
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

    // Punishing Tactical reinforcement sprint whenever gap > 16.5m so right lane never goes quiet!
    let closestAliveZ = -999999;
    for (let i = 0; i < this.totalTroopers; i++) {
      if (this.unitAlive[i] !== 0 && this.unitZ[i] > closestAliveZ) {
        closestAliveZ = this.unitZ[i];
      }
    }

    const gapAhead = squadZ - closestAliveZ;
    const speedBoost =
      this.siegeDistance > 20.0 && closestAliveZ > -900000 && gapAhead > 16.5 ? 1.58 : 1.0;
    const stepSpeed = this.marchSpeed * speedBoost;
    this.siegeDistance = Math.min(this.siegeColumnSpan, this.siegeDistance + stepSpeed * dt);
    this.marchPhase += dt * 13.2 * (speedBoost > 1 ? 1.28 : 1.0);

    const cadence = Math.max(0.6, threatCadenceMult);
    const shooterTelegraphDur = SPLIT_SHOOTER_TELEGRAPH_BASE_SEC / Math.sqrt(cadence);
    const chargerTelegraphDur = SPLIT_CHARGER_TELEGRAPH_BASE_SEC / Math.sqrt(cadence);
    const maxConcurrentShooters = cadence >= 1.55 ? 3 : cadence >= 1.25 ? 2 : 1;
    const maxConcurrentChargers = cadence >= 1.25 ? 2 : 1;

    this.shooterCooldown = Math.max(0, this.shooterCooldown - dt);
    this.chargerCooldown = Math.max(0, this.chargerCooldown - dt);

    let activeShooters = 0;
    let activeChargers = 0;
    let bestShooterIdx = -1;
    let bestShooterScore = Infinity;
    let bestChargerIdx = -1;
    let bestChargerZ = -999999;

    let alive = 0;
    for (let i = 0; i < this.totalTroopers; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      if (this.unitHitFlash[i] > 0) {
        this.unitHitFlash[i] = Math.max(0, this.unitHitFlash[i] - dt * 26.0);
      }

      const uz = this.unitZ[i];
      const distZ = squadZ - uz;
      const cState = this.unitChargeState[i];
      let rushMul = 1.0;

      if (this.unitIsCharger[i] === 1 && cState > 0) {
        activeChargers++;
        if (cState === 1) {
          rushMul = 0.28;
          this.unitChargeTimer[i] -= dt;
          const prog = 1 - Math.max(0, this.unitChargeTimer[i] / chargerTelegraphDur);
          this.unitHitFlash[i] = Math.max(this.unitHitFlash[i], 0.35 + prog * 0.45);
          if (projectileSystem) {
            projectileSystem.pushChargerLane(
              this.unitX[i],
              uz,
              Math.max(uz + 2.0, squadZ + 0.5),
              prog,
              false
            );
          }
          if (this.unitChargeTimer[i] <= 0) {
            this.unitChargeState[i] = 2;
            this.lastStepStartedCharge = true;
          }
        } else {
          rushMul = 2.15;
          this.unitHitFlash[i] = Math.max(this.unitHitFlash[i], 0.42);
          if (projectileSystem) {
            projectileSystem.pushChargerLane(
              this.unitX[i],
              uz,
              Math.max(uz + 2.2, squadZ + 0.5),
              1.0,
              true
            );
          }
        }
      } else if (this.unitIsShooter[i] === 1 && cState === 1) {
        activeShooters++;
        rushMul = 0.32;
        this.unitChargeTimer[i] -= dt;
        const prog = 1 - Math.max(0, this.unitChargeTimer[i] / shooterTelegraphDur);
        this.unitHitFlash[i] = Math.max(this.unitHitFlash[i], 0.25 + prog * 0.36);
        if (projectileSystem) {
          projectileSystem.pushShooterTelegraph(this.unitX[i], uz, prog);
        }
        if (this.unitChargeTimer[i] <= 0) {
          this.unitChargeState[i] = 0;
          if (projectileSystem && distZ >= 6.0 && distZ <= 36) {
            const boltSpeed = ENEMY_BOLT_BASE_SPEED * (0.94 + cadence * 0.14);
            projectileSystem.spawnBolt(this.unitX[i], uz + 0.65, boltSpeed, boltDamage);
            this.lastStepFiredBolt = true;
          }
        }
      } else if (this.unitIsShooter[i] === 1 && distZ >= 9.5 && distZ <= 34) {
        const score = Math.abs(this.unitX[i] - squadX) + distZ * 0.18;
        if (score < bestShooterScore) {
          bestShooterScore = score;
          bestShooterIdx = i;
        }
      } else if (this.unitIsCharger[i] === 1 && distZ >= 9.0 && distZ <= 30) {
        if (uz > bestChargerZ) {
          bestChargerZ = uz;
          bestChargerIdx = i;
        }
      }

      // Once a right-lane trooper clears the nose of the Divider Wall (`dividerTipZ`),
      // they peel left & chase into the open foreground Breach Arena toward `(squadX, squadZ)`
      // with natural per-unit lateral fan-out so front chasers stay readable instead of stacking!
      if (uz > this.dividerTipZ + 0.20) {
        const fanOffset = ((i % 5) - 2) * 0.44;
        const targetX = Math.max(
          -SOLDIER_SAFE_LIMIT_X,
          Math.min(SOLDIER_SAFE_LIMIT_X, squadX + fanOffset)
        );
        const dx = targetX - this.unitX[i];
        const dz = Math.max(0.35, squadZ + 0.25 - uz);
        const dist = Math.hypot(dx, dz);
        const breachMul = (this.unitRank[i] === 2 ? 1.12 : 1.28) * rushMul;
        const chargeStep = stepSpeed * this.unitSpeedMul[i] * breachMul * dt;
        const inv = 1 / Math.max(0.001, dist);
        this.unitX[i] = Math.max(
          -SOLDIER_SAFE_LIMIT_X,
          Math.min(SOLDIER_SAFE_LIMIT_X, this.unitX[i] + dx * inv * chargeStep)
        );
        this.unitZ[i] += Math.max(stepSpeed * 0.50 * rushMul * dt, dz * inv * chargeStep);
      } else {
        const advance = stepSpeed * this.unitSpeedMul[i] * rushMul * dt;
        this.unitZ[i] += advance;
      }

      alive++;
    }

    if (
      projectileSystem &&
      this.shooterCooldown <= 0 &&
      activeShooters < maxConcurrentShooters &&
      bestShooterIdx >= 0
    ) {
      this.unitChargeState[bestShooterIdx] = 1;
      this.unitChargeTimer[bestShooterIdx] = shooterTelegraphDur;
      this.shooterCooldown = 1.62 / cadence;
    }

    if (
      this.chargerCooldown <= 0 &&
      activeChargers < maxConcurrentChargers &&
      bestChargerIdx >= 0
    ) {
      this.unitChargeState[bestChargerIdx] = 1;
      this.unitChargeTimer[bestChargerIdx] = chargerTelegraphDur;
      this.chargerCooldown = 3.1 / cadence;
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
   * Blocks bullets that hit or attempt to cross the solid ballistic Divider Wall (`x = SPLIT_DIVIDER_X`, `z <= dividerTipZ`).
   */
  public checkDividerWallBlock(bx: number, bz: number, prevBx: number): boolean {
    if (!this.active || this.retractedForBoss) {
      return false;
    }
    if (bz > this.dividerTipZ + 0.18) {
      return false;
    }
    if (Math.abs(bx - SPLIT_DIVIDER_X) < 0.28) {
      return true;
    }
    return (
      (prevBx < SPLIT_DIVIDER_X - 0.02 && bx >= SPLIT_DIVIDER_X - 0.02) ||
      (prevBx > SPLIT_DIVIDER_X + 0.02 && bx <= SPLIT_DIVIDER_X + 0.02)
    );
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
      bx > SPLIT_DIVIDER_X - 0.24
    ) {
      return _missResult;
    }

    const frontSlot = this.visualSlots[0];
    if (frontSlot.entityId === lastHitId || lastHitId === 699) {
      return _missResult;
    }

    const barrelZ = this.sectorBaseZ - QUEUE_FRONT_OFFSET_Z - this.slideOffsetZ;
    const minZ = Math.min(bz, prevBz) - 1.25;
    const maxZ = Math.max(bz, prevBz) + 1.25;
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
      this.advanceLockTimer = 0.56;
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
    if (bz <= this.dividerTipZ && bx < SPLIT_DIVIDER_X + 0.22) {
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
      const hitRad = this.unitRank[i] === 2 ? 0.80 : 0.56;
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
      const wasCharging =
        this.unitIsCharger[bestIdx] === 1 && this.unitChargeState[bestIdx] === 2;
      this.unitAlive[bestIdx] = 0;
      this.unitChargeState[bestIdx] = 0;
      this.rightAliveCount = Math.max(0, this.rightAliveCount - 1);
      this.lastKill.x = this.unitX[bestIdx];
      this.lastKill.z = this.unitZ[bestIdx];
      this.lastKill.isHeavy = this.unitRank[bestIdx] === 2;
      this.lastKill.stoppedCharger = wasCharging;
      this.lastKill.coinReward = wasCharging
        ? Math.round(this.unitCoins[bestIdx] * 1.5)
        : this.unitCoins[bestIdx];
      return { status: 'KILL', entityId: hitEntityId };
    }

    return { status: 'HIT', entityId: hitEntityId };
  }

  public resolveSquadCollision(
    squadX: number,
    squadZ: number,
    playerLogicalSquad: number,
    chargerDamageBonus = 1
  ): { playerLosses: number; hitX: number; hitZ: number; hitByCharger: boolean } | null {
    if (!this.active || this.rightAliveCount <= 0 || playerLogicalSquad <= 0) {
      return null;
    }

    const squadHalfW = computeSquadOuterRadius(playerLogicalSquad);
    let totalLosses = 0;
    let impactX = squadX;
    let impactZ = squadZ;
    let hitByCharger = false;

    for (let i = 0; i < this.totalTroopers; i++) {
      if (this.unitAlive[i] === 0) {
        continue;
      }
      const uz = this.unitZ[i];
      const ux = this.unitX[i];
      const isHeavy = this.unitRank[i] === 2;
      const isRushingCharger = this.unitIsCharger[i] === 1 && this.unitChargeState[i] === 2;
      const unitRad = isHeavy ? 0.58 : 0.42;

      const directClash =
        Math.abs(uz - squadZ) <= (isRushingCharger ? 0.98 : 0.85) + unitRad * 0.4 &&
        Math.abs(ux - squadX) <= squadHalfW + unitRad;
      // Also punish any enemy allowed to breach completely past the defense line (`uz > squadZ + 1.35`)!
      const breachedDefenseLine = uz > squadZ + 1.35;

      if (directClash || breachedDefenseLine) {
        const dmg = isRushingCharger
          ? 4 + Math.max(1, chargerDamageBonus)
          : isHeavy
            ? 4
            : 2;
        if (isRushingCharger) {
          hitByCharger = true;
        }
        totalLosses += dmg;
        impactX = directClash ? ux : squadX;
        impactZ = directClash ? uz : squadZ;
        this.unitAlive[i] = 0;
        this.unitChargeState[i] = 0;
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
      hitByCharger,
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

  public getFrontLeftBarrelHp(): number {
    return this.active && this.queueCursor < this.queueTotal ? this.frontBarrelHp : 0;
  }

  public getPostDividerChaserCount(): number {
    if (!this.active || this.rightAliveCount <= 0) {
      return 0;
    }
    let count = 0;
    for (let i = 0; i < this.totalTroopers; i++) {
      if (this.unitAlive[i] !== 0 && this.unitZ[i] > this.dividerTipZ + 0.20) {
        count++;
      }
    }
    return count;
  }
}
