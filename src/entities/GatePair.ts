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
  stepGatePassiveDecay,
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
  initialValue: number;
  value: number;
  hitAccumulator: number;
  damagePerIncrement: number;
  isLocked: boolean;
  ringProgress: number;
  flashTimer: number;
  flashCooldown: number;
  popTimer: number;
  timeSinceLastHit: number;
  decayAccumulator: number;
  decayPulseTimer: number;
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

const SPLIT_WIDTH = 6.00;
const FULL_WIDTH = 12.08;
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
  public lastStepDecayTicks = 0;
  public lastStepDecayValue = 0;
  public lastStepFlippedBackToRed = false;
  public lastStepDecayX = 0;

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
      new THREE.PlaneGeometry(12.6, 0.48),
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

    // Faceted 6-sided Hexagonal Holo-Pylons & Octahedron Emitter Finials!
    const pylonDefs: ReadonlyArray<readonly [number, THREE.MeshStandardMaterial]> = [
      [-6.08, this.leftPylonMat],
      [0, this.centerPylonMat],
      [6.08, this.rightPylonMat],
    ];
    for (const [px, pMat] of pylonDefs) {
      const holder = px === 0 ? this.centerPostGroup : this.root;
      const localX = px === 0 ? 0 : px;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.185, 2.72, 6),
        pMat
      );
      post.position.set(localX, 1.36, 0);
      const postOutline = new THREE.Mesh(
        new THREE.CylinderGeometry(0.188, 0.232, 2.78, 6),
        outlineMat
      );
      postOutline.position.set(localX, 1.36, 0);
      const cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.20, 0), pMat);
      cap.position.set(localX, 2.78, 0);
      const capOutline = new THREE.Mesh(new THREE.OctahedronGeometry(0.25, 0), outlineMat);
      capOutline.position.set(localX, 2.78, 0);
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
      initialValue: 0,
      value: 0,
      hitAccumulator: 0,
      damagePerIncrement: 1,
      isLocked: false,
      ringProgress: 0,
      flashTimer: 0,
      flashCooldown: 0,
      popTimer: 0,
      timeSinceLastHit: 0,
      decayAccumulator: 0,
      decayPulseTimer: 0,
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
      mat.color.setHex(0xff245c);
      mat.emissive.setHex(0x5c0822);
    } else {
      mat.color.setHex(0x18f2c8);
      mat.emissive.setHex(0x065448);
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
    slot.initialValue = def.initialValue;
    slot.value = def.initialValue;
    slot.hitAccumulator = 0;
    slot.damagePerIncrement = def.damagePerIncrement;
    slot.isLocked = def.isLocked;
    slot.ringProgress = 0;
    slot.flashTimer = 0;
    slot.flashCooldown = 0;
    slot.popTimer = 0;
    slot.timeSinceLastHit = 0;
    slot.decayAccumulator = 0;
    slot.decayPulseTimer = 0;
    slot.panelMesh.scale.y = 1.0;
    slot.panelMesh.position.y = 1.28;
    slot.padlockGroup.visible = def.isLocked;
    slot.labelTex.redrawIfDirty(
      def.operator,
      def.initialValue,
      def.isLocked,
      0,
      0,
      slot.panelWidth,
      0
    );
  }

  public hide(): void {
    this.active = false;
    this.triggered = true;
    this.root.visible = false;
  }

  public getDebugValues(): {
    z: number;
    left: number | null;
    right: number | null;
    full: number | null;
    leftInit: number | null;
    rightInit: number | null;
    fullInit: number | null;
  } {
    return {
      z: this.z,
      left: this.leftSlot.active ? this.leftSlot.value : null,
      right: this.rightSlot.active ? this.rightSlot.value : null,
      full: this.fullSlot.active ? this.fullSlot.value : null,
      leftInit: this.leftSlot.active ? this.leftSlot.initialValue : null,
      rightInit: this.rightSlot.active ? this.rightSlot.initialValue : null,
      fullInit: this.fullSlot.active ? this.fullSlot.initialValue : null,
    };
  }

  public updateVisuals(dt: number, squadZ: number): void {
    this.lastStepDecayTicks = 0;
    this.lastStepFlippedBackToRed = false;
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
    if (slot.decayPulseTimer > 0) {
      slot.decayPulseTimer = Math.max(0, slot.decayPulseTimer - dt * 8.5);
    }

    // v8.0 Shoot-to-Charge Gate Passive Decay after ~0.45s grace pause (zero-alloc fast path when at initial value)
    if (
      !this.triggered &&
      !slot.isLocked &&
      dt > 0 &&
      (slot.value > slot.initialValue + 1e-6 || slot.hitAccumulator > 0)
    ) {
      const decay = stepGatePassiveDecay(
        {
          operator: slot.operator,
          value: slot.value,
          initialValue: slot.initialValue,
          hitAccumulator: slot.hitAccumulator,
          damagePerIncrement: slot.damagePerIncrement,
          isLocked: slot.isLocked,
          timeSinceLastHit: slot.timeSinceLastHit,
          decayAccumulator: slot.decayAccumulator,
        },
        dt
      );
      slot.value = decay.value;
      slot.hitAccumulator = decay.hitAccumulator;
      slot.timeSinceLastHit = decay.timeSinceLastHit;
      slot.decayAccumulator = decay.decayAccumulator;
      slot.ringProgress = decay.ringProgress;

      if (decay.deltaDecrements > 0) {
        slot.decayPulseTimer = 1.0;
        this.lastStepDecayTicks += decay.deltaDecrements;
        this.lastStepDecayValue = decay.value;
        this.lastStepDecayX = slot.centerX;
        if (decay.flippedBackToNegative) {
          this.lastStepFlippedBackToRed = true;
        }
        this.syncPylonColors();
        if (!this.isFullSpan) {
          this.recomputeTargetSplitX();
        }
      }
    }

    if (slot.popTimer > 0) {
      slot.popTimer = Math.max(0, slot.popTimer - dt * 9.5);
      const pop = Math.sin(slot.popTimer * Math.PI) * 0.055;
      slot.panelMesh.scale.y = 1 + pop;
      slot.panelMesh.position.y = 1.28 + pop * (PANEL_HEIGHT * 0.5);
    } else if (slot.decayPulseTimer > 0) {
      // Crisp downward tick-down pulse when value decays back toward spawn
      const dip = Math.sin(slot.decayPulseTimer * Math.PI) * 0.068;
      slot.panelMesh.scale.y = 1 - dip;
      slot.panelMesh.position.y = 1.28 - dip * (PANEL_HEIGHT * 0.5);
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
      slot.panelWidth,
      slot.decayPulseTimer
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

    // Active fire resets passive decay grace timer & accumulator immediately!
    targetSlot.timeSinceLastHit = 0;
    targetSlot.decayAccumulator = 0;
    targetSlot.decayPulseTimer = 0;

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
      targetSlot.panelWidth,
      0
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
