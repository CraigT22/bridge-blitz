import * as THREE from 'three';
import type { GateDefinition, GateOperator, GatePairDefinition, LaneSide } from '../core/types';
import {
  applyGateBulletHit,
  computeSplitGateRatio,
  formatGateLabel,
  isNegativeGateState,
  resolveGateSquadCount,
  SPLIT_SPAN_MAX_X,
  SPLIT_SPAN_MIN_X,
} from '../math/gateMath';
import { EditableGateTexture } from '../rendering/CanvasLabelCache';
import { createPadlockMesh } from '../rendering/ProceduralGeometries';

interface SingleGateSlot {
  readonly entityId: number;
  readonly laneTag: LaneSide;
  minX: number;
  maxX: number;
  centerX: number;
  panelWidth: number;
  readonly group: THREE.Group;
  readonly panelMesh: THREE.Mesh;
  readonly padlockGroup: THREE.Group;
  readonly labelTex: EditableGateTexture;
  active: boolean;
  operator: GateOperator;
  value: number;
  hitAccumulator: number;
  damagePerIncrement: number;
  isLocked: boolean;
  ringProgress: number;
  flashTimer: number;
  flashCooldown: number;
  popTimer: number;
}

export interface GateBulletImpactEvent {
  readonly lane: LaneSide;
  readonly entityId: number;
  readonly hitX: number;
  readonly hitZ: number;
  readonly newValue: number;
  readonly deltaIncrements: number;
  readonly crossedZeroOrPositive: boolean;
  readonly flippedToPositive: boolean;
  readonly ricochet: boolean;
  readonly formattedLabel: string;
}

export interface GateSquadCollectEvent {
  readonly lane: LaneSide;
  readonly worldX: number;
  readonly worldZ: number;
  readonly nextSquadCount: number;
  readonly rawUnclampedCount: number;
  readonly deltaSquad: number;
  readonly label: string;
  readonly positive: boolean;
}

const SPLIT_WIDTH = 4.82;
const FULL_WIDTH = 9.72;
const PANEL_HEIGHT = 2.52;
const CENTER_POST_GAP = 0.04;

export class GatePairSlot {
  public readonly root = new THREE.Group();
  public z = 0;
  public active = false;
  public triggered = false;
  public isFullSpan = false;
  public currentSplitX = 0;
  public targetSplitX = 0;

  private appliedSplitX = Number.NaN;
  private readonly centerPostGroup = new THREE.Group();
  private readonly leftPylonMat: THREE.MeshStandardMaterial;
  private readonly centerPylonMat: THREE.MeshStandardMaterial;
  private readonly rightPylonMat: THREE.MeshStandardMaterial;
  private readonly leftSlot: SingleGateSlot;
  private readonly rightSlot: SingleGateSlot;
  private readonly fullSlot: SingleGateSlot;

  constructor(pairIndex: number) {
    const makePylonMat = () =>
      new THREE.MeshStandardMaterial({
        color: 0x1fd8ff,
        emissive: 0x064866,
        metalness: 0.22,
        roughness: 0.30,
      });
    this.leftPylonMat = makePylonMat();
    this.centerPylonMat = makePylonMat();
    this.rightPylonMat = makePylonMat();

    const outlineMat = new THREE.MeshBasicMaterial({
      color: 0x090e16,
      side: THREE.BackSide,
    });

    // Grounded contact shadow strip
    const gantryShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(10.2, 0.48),
      new THREE.MeshBasicMaterial({
        color: 0x05080d,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      })
    );
    gantryShadow.rotation.x = -Math.PI / 2;
    gantryShadow.position.set(0, 0.018, 0.06);
    this.root.add(gantryShadow);

    // Cel-outlined polarity-colored cylindrical side posts & sliding center divider post!
    const pylonDefs: ReadonlyArray<readonly [number, THREE.MeshStandardMaterial]> = [
      [-4.90, this.leftPylonMat],
      [0, this.centerPylonMat],
      [4.90, this.rightPylonMat],
    ];
    for (const [px, pMat] of pylonDefs) {
      const holder = px === 0 ? this.centerPostGroup : this.root;
      const localX = px === 0 ? 0 : px;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.145, 0.165, 2.72, 14),
        pMat
      );
      post.position.set(localX, 1.36, 0);
      const postOutline = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.21, 2.78, 14),
        outlineMat
      );
      postOutline.position.set(localX, 1.36, 0);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.175, 12, 10), pMat);
      cap.position.set(localX, 2.73, 0);
      const capOutline = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), outlineMat);
      capOutline.position.set(localX, 2.73, 0);
      holder.add(post, postOutline, cap, capOutline);
    }
    this.root.add(this.centerPostGroup);

    this.leftSlot = this.createGateSlot(pairIndex * 3 + 100, 'LEFT', -2.47, SPLIT_WIDTH, SPLIT_SPAN_MIN_X, -CENTER_POST_GAP, false);
    this.rightSlot = this.createGateSlot(pairIndex * 3 + 101, 'RIGHT', 2.47, SPLIT_WIDTH, CENTER_POST_GAP, SPLIT_SPAN_MAX_X, false);
    this.fullSlot = this.createGateSlot(pairIndex * 3 + 102, 'LEFT', 0, FULL_WIDTH, SPLIT_SPAN_MIN_X, SPLIT_SPAN_MAX_X, true);

    this.root.visible = false;
  }

  private createGateSlot(
    entityId: number,
    laneTag: LaneSide,
    centerX: number,
    width: number,
    minX: number,
    maxX: number,
    wideTex: boolean
  ): SingleGateSlot {
    const group = new THREE.Group();
    group.position.set(centerX, 0, 0);

    const labelTex = new EditableGateTexture(wideTex);
    const panelMat = new THREE.MeshBasicMaterial({
      map: labelTex.texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    // Frameless-top unit-width curtain scaled dynamically along X as split ratios shift!
    const panelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, PANEL_HEIGHT),
      panelMat
    );
    panelMesh.scale.x = width;
    panelMesh.position.set(0, 1.28, 0);
    group.add(panelMesh);

    const padlockGroup = createPadlockMesh();
    padlockGroup.position.set(0, 2.75, 0.10);
    group.add(padlockGroup);

    this.root.add(group);

    return {
      entityId,
      laneTag,
      minX,
      maxX,
      centerX,
      panelWidth: width,
      group,
      panelMesh,
      padlockGroup,
      labelTex,
      active: false,
      operator: 'ADD',
      value: 0,
      hitAccumulator: 0,
      damagePerIncrement: 1,
      isLocked: false,
      ringProgress: 0,
      flashTimer: 0,
      flashCooldown: 0,
      popTimer: 0,
    };
  }

  private applySlotGeometry(slot: SingleGateSlot, minX: number, maxX: number): void {
    const width = Math.max(1.2, maxX - minX);
    const centerX = (minX + maxX) * 0.5;
    slot.minX = minX;
    slot.maxX = maxX;
    slot.centerX = centerX;
    slot.panelWidth = width;
    slot.group.position.x = centerX;
    slot.panelMesh.scale.x = width;
  }

  private recomputeTargetSplitX(): void {
    if (this.isFullSpan || !this.leftSlot.active || !this.rightSlot.active) {
      this.targetSplitX = 0;
      return;
    }
    const leftRatio = computeSplitGateRatio(
      this.leftSlot.operator,
      this.leftSlot.value,
      this.leftSlot.isLocked,
      this.rightSlot.operator,
      this.rightSlot.value,
      this.rightSlot.isLocked
    );
    const totalSpan = SPLIT_SPAN_MAX_X - SPLIT_SPAN_MIN_X;
    this.targetSplitX = SPLIT_SPAN_MIN_X + totalSpan * leftRatio;
  }

  private applySplitLayout(splitX: number): void {
    this.appliedSplitX = splitX;
    this.centerPostGroup.position.x = splitX;
    this.applySlotGeometry(this.leftSlot, SPLIT_SPAN_MIN_X, splitX - CENTER_POST_GAP);
    this.applySlotGeometry(this.rightSlot, splitX + CENTER_POST_GAP, SPLIT_SPAN_MAX_X);
  }

  private applyPylonPolarity(mat: THREE.MeshStandardMaterial, isNeg: boolean): void {
    if (isNeg) {
      mat.color.setHex(0xee2c44);
      mat.emissive.setHex(0x520814);
    } else {
      mat.color.setHex(0x20d8ff);
      mat.emissive.setHex(0x064866);
    }
  }

  private syncPylonColors(): void {
    if (this.isFullSpan) {
      const neg = isNegativeGateState(
        this.fullSlot.operator,
        this.fullSlot.value,
        this.fullSlot.isLocked
      );
      this.applyPylonPolarity(this.leftPylonMat, neg);
      this.applyPylonPolarity(this.rightPylonMat, neg);
      return;
    }
    const leftNeg = this.leftSlot.active
      ? isNegativeGateState(this.leftSlot.operator, this.leftSlot.value, this.leftSlot.isLocked)
      : false;
    const rightNeg = this.rightSlot.active
      ? isNegativeGateState(this.rightSlot.operator, this.rightSlot.value, this.rightSlot.isLocked)
      : false;
    this.applyPylonPolarity(this.leftPylonMat, leftNeg);
    this.applyPylonPolarity(this.rightPylonMat, rightNeg);
    this.applyPylonPolarity(this.centerPylonMat, leftNeg && rightNeg ? true : rightNeg);
  }

  public configure(def: GatePairDefinition): void {
    this.z = def.z;
    this.active = true;
    this.triggered = false;
    this.root.position.set(0, 0, def.z);
    this.root.visible = true;

    if (def.full) {
      this.isFullSpan = true;
      this.centerPostGroup.visible = false;
      this.currentSplitX = 0;
      this.targetSplitX = 0;
      this.appliedSplitX = 0;
      this.applySlotGeometry(this.fullSlot, -FULL_WIDTH * 0.5, FULL_WIDTH * 0.5);
      this.configureSlot(this.leftSlot, null);
      this.configureSlot(this.rightSlot, null);
      this.configureSlot(this.fullSlot, def.full);
      this.syncPylonColors();
    } else {
      this.isFullSpan = false;
      this.centerPostGroup.visible = true;
      this.configureSlot(this.fullSlot, null);
      this.configureSlot(this.leftSlot, def.left);
      this.configureSlot(this.rightSlot, def.right);
      this.syncPylonColors();
      this.recomputeTargetSplitX();
      this.currentSplitX = this.targetSplitX;
      this.applySplitLayout(this.currentSplitX);
      if (this.leftSlot.active) {
        this.leftSlot.labelTex.redrawIfDirty(
          this.leftSlot.operator,
          this.leftSlot.value,
          this.leftSlot.isLocked,
          0,
          0,
          this.leftSlot.panelWidth
        );
      }
      if (this.rightSlot.active) {
        this.rightSlot.labelTex.redrawIfDirty(
          this.rightSlot.operator,
          this.rightSlot.value,
          this.rightSlot.isLocked,
          0,
          0,
          this.rightSlot.panelWidth
        );
      }
    }
  }

  private configureSlot(slot: SingleGateSlot, def: GateDefinition | null): void {
    if (!def) {
      slot.active = false;
      slot.group.visible = false;
      return;
    }
    slot.active = true;
    slot.group.visible = true;
    slot.operator = def.operator;
    slot.value = def.initialValue;
    slot.hitAccumulator = 0;
    slot.damagePerIncrement = def.damagePerIncrement;
    slot.isLocked = def.isLocked;
    slot.ringProgress = 0;
    slot.flashTimer = 0;
    slot.flashCooldown = 0;
    slot.popTimer = 0;
    slot.panelMesh.scale.y = 1.0;
    slot.panelMesh.position.y = 1.28;
    slot.padlockGroup.visible = def.isLocked;
    slot.labelTex.redrawIfDirty(
      def.operator,
      def.initialValue,
      def.isLocked,
      0,
      0,
      slot.panelWidth
    );
  }

  public hide(): void {
    this.active = false;
    this.triggered = true;
    this.root.visible = false;
  }

  public updateVisuals(dt: number, squadZ: number): void {
    if (!this.active) {
      return;
    }
    if (!this.triggered && squadZ - this.z > 128) {
      this.root.visible = false;
      return;
    }
    this.root.visible = true;
    if (this.triggered || squadZ < this.z - 2.0) {
      this.triggered = true;
      this.root.position.y -= dt * 18.0;
      if (this.root.position.y <= -3.4 || squadZ < this.z - 4.8) {
        this.hide();
        return;
      }
    }
    if (!this.isFullSpan) {
      const blend = 1 - Math.exp(-18 * dt);
      this.currentSplitX += (this.targetSplitX - this.currentSplitX) * blend;
      if (Math.abs(this.targetSplitX - this.currentSplitX) < 0.002) {
        this.currentSplitX = this.targetSplitX;
      }
      if (Math.abs(this.currentSplitX - this.appliedSplitX) > 0.001) {
        this.applySplitLayout(this.currentSplitX);
      }
    }
    this.tickSide(this.leftSlot, dt);
    this.tickSide(this.rightSlot, dt);
    this.tickSide(this.fullSlot, dt);
  }

  private tickSide(slot: SingleGateSlot, dt: number): void {
    if (!slot.active) {
      return;
    }
    if (slot.flashCooldown > 0) {
      slot.flashCooldown = Math.max(0, slot.flashCooldown - dt);
    }
    if (slot.flashTimer > 0) {
      slot.flashTimer = Math.max(0, slot.flashTimer - dt * 11.0);
    }
    if (slot.popTimer > 0) {
      slot.popTimer = Math.max(0, slot.popTimer - dt * 9.5);
      const pop = Math.sin(slot.popTimer * Math.PI) * 0.055;
      slot.panelMesh.scale.y = 1 + pop;
      slot.panelMesh.position.y = 1.28 + pop * (PANEL_HEIGHT * 0.5);
    } else {
      slot.panelMesh.scale.y = 1.0;
      slot.panelMesh.position.y = 1.28;
    }
    slot.labelTex.redrawIfDirty(
      slot.operator,
      slot.value,
      slot.isLocked,
      slot.ringProgress,
      slot.flashTimer,
      slot.panelWidth
    );
  }

  public tryBulletHit(
    bx: number,
    bz: number,
    prevBz: number,
    damage: number,
    lastHitId: number
  ): GateBulletImpactEvent | null {
    if (!this.active || this.triggered) {
      return null;
    }
    const minZ = Math.min(bz, prevBz) - 0.35;
    const maxZ = Math.max(bz, prevBz) + 0.35;
    if (this.z < minZ || this.z > maxZ) {
      return null;
    }

    let targetSlot: SingleGateSlot | null = null;
    if (this.isFullSpan && this.fullSlot.active) {
      if (bx >= this.fullSlot.minX && bx <= this.fullSlot.maxX) {
        targetSlot = this.fullSlot;
      }
    } else if (bx >= this.leftSlot.minX && bx <= this.leftSlot.maxX && this.leftSlot.active) {
      targetSlot = this.leftSlot;
    } else if (bx >= this.rightSlot.minX && bx <= this.rightSlot.maxX && this.rightSlot.active) {
      targetSlot = this.rightSlot;
    }

    if (!targetSlot || targetSlot.entityId === lastHitId) {
      return null;
    }

    const res = applyGateBulletHit(
      {
        operator: targetSlot.operator,
        value: targetSlot.value,
        hitAccumulator: targetSlot.hitAccumulator,
        damagePerIncrement: targetSlot.damagePerIncrement,
        isLocked: targetSlot.isLocked,
      },
      damage
    );

    targetSlot.value = res.value;
    targetSlot.hitAccumulator = res.hitAccumulator;
    targetSlot.ringProgress = res.ringProgress;
    if (res.deltaIncrements > 0) {
      targetSlot.popTimer = 1.0;
      targetSlot.flashTimer = 1.0;
      targetSlot.flashCooldown = 0.12;
    } else if (targetSlot.flashCooldown <= 0) {
      targetSlot.flashTimer = 0.55;
      targetSlot.flashCooldown = 0.14;
    }
    this.syncPylonColors();
    if (!this.isFullSpan && res.deltaIncrements > 0) {
      this.recomputeTargetSplitX();
    }
    targetSlot.labelTex.redrawIfDirty(
      targetSlot.operator,
      targetSlot.value,
      targetSlot.isLocked,
      targetSlot.ringProgress,
      targetSlot.flashTimer,
      targetSlot.panelWidth
    );

    return {
      lane: targetSlot.laneTag,
      entityId: targetSlot.entityId,
      hitX: bx,
      hitZ: this.z,
      newValue: res.value,
      deltaIncrements: res.deltaIncrements,
      crossedZeroOrPositive: res.crossedZeroOrPositive,
      flippedToPositive: res.flippedToPositive,
      ricochet: res.ricochet,
      formattedLabel: formatGateLabel(targetSlot.operator, res.value, targetSlot.isLocked),
    };
  }

  public trySquadCollect(
    squadX: number,
    squadZ: number,
    currentSquad: number
  ): GateSquadCollectEvent | null {
    if (!this.active || this.triggered) {
      return null;
    }
    if (squadZ > this.z + 0.48 || squadZ < this.z - 2.2) {
      return null;
    }

    let chosen: SingleGateSlot | null = null;
    if (this.isFullSpan && this.fullSlot.active) {
      chosen = this.fullSlot;
    } else {
      const chooseLeft =
        (squadX < this.currentSplitX && this.leftSlot.active) || !this.rightSlot.active;
      chosen = chooseLeft ? this.leftSlot : this.rightSlot;
    }

    if (!chosen || !chosen.active) {
      return null;
    }

    this.triggered = true;
    chosen.active = false;
    chosen.group.visible = false;

    const rawUnclampedCount = resolveGateSquadCount(
      currentSquad,
      chosen.operator,
      chosen.value,
      9999
    );
    const nextSquadCount = resolveGateSquadCount(
      currentSquad,
      chosen.operator,
      chosen.value
    );
    const deltaSquad = nextSquadCount - currentSquad;
    const label = formatGateLabel(chosen.operator, chosen.value, chosen.isLocked);

    return {
      lane: chosen.laneTag,
      worldX: this.isFullSpan ? squadX : chosen.centerX,
      worldZ: this.z,
      nextSquadCount,
      rawUnclampedCount,
      deltaSquad,
      label,
      positive: rawUnclampedCount >= currentSquad,
    };
  }
}
