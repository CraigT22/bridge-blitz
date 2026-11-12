import * as THREE from 'three';
import type { GateDefinition, GateOperator, GatePairDefinition, LaneSide } from '../core/types';
import {
  applyGateBulletHit,
  formatGateLabel,
  resolveGateSquadCount,
} from '../math/gateMath';
import { EditableGateTexture } from '../rendering/CanvasLabelCache';
import { createPadlockMesh } from '../rendering/ProceduralGeometries';

interface SingleLaneGateSlot {
  readonly entityId: number;
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
}

export interface GateSquadCollectEvent {
  readonly lane: LaneSide;
  readonly worldX: number;
  readonly worldZ: number;
  readonly nextSquadCount: number;
  readonly deltaSquad: number;
  readonly label: string;
  readonly positive: boolean;
}

const LANE_WIDTH = 4.75;
const PANEL_HEIGHT = 2.85;

export class GatePairSlot {
  public readonly root = new THREE.Group();
  public z = 0;
  public active = false;
  public triggered = false;

  private readonly leftSlot: SingleLaneGateSlot;
  private readonly rightSlot: SingleLaneGateSlot;

  constructor(pairIndex: number) {
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xb8c7d9,
      metalness: 0.78,
      roughness: 0.26,
    });

    // Left, Center, Right metallic framing pillars + top crossbar
    for (const px of [-4.95, 0, 4.95]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.2, 0.28), pillarMat);
      pillar.position.set(px, 1.6, 0);
      this.root.add(pillar);
    }
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(10.15, 0.22, 0.3), pillarMat);
    topBar.position.set(0, 3.16, 0);
    this.root.add(topBar);

    this.leftSlot = this.createLaneSlot(pairIndex * 2 + 100, -2.48);
    this.rightSlot = this.createLaneSlot(pairIndex * 2 + 101, 2.48);
    this.root.visible = false;
  }

  private createLaneSlot(entityId: number, centerX: number): SingleLaneGateSlot {
    const group = new THREE.Group();
    group.position.set(centerX, 0, 0);

    const labelTex = new EditableGateTexture();
    const panelMat = new THREE.MeshBasicMaterial({
      map: labelTex.texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const panelMesh = new THREE.Mesh(new THREE.PlaneGeometry(LANE_WIDTH, PANEL_HEIGHT), panelMat);
    panelMesh.position.set(0, 1.52, 0);
    group.add(panelMesh);

    const padlockGroup = createPadlockMesh();
    padlockGroup.position.set(0, 3.38, 0.08);
    group.add(padlockGroup);

    this.root.add(group);

    return {
      entityId,
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
    };
  }

  public configure(def: GatePairDefinition): void {
    this.z = def.z;
    this.active = true;
    this.triggered = false;
    this.root.position.set(0, 0, def.z);
    this.root.visible = true;

    this.configureSide(this.leftSlot, def.left);
    this.configureSide(this.rightSlot, def.right);
  }

  private configureSide(slot: SingleLaneGateSlot, def: GateDefinition | null): void {
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
    slot.padlockGroup.visible = def.isLocked;
    slot.labelTex.redrawIfDirty(def.operator, def.initialValue, def.isLocked, 0, 0);
  }

  public hide(): void {
    this.active = false;
    this.triggered = true;
    this.root.visible = false;
  }

  public updateVisuals(dt: number): void {
    if (!this.active) {
      return;
    }
    this.tickSide(this.leftSlot, dt);
    this.tickSide(this.rightSlot, dt);
  }

  private tickSide(slot: SingleLaneGateSlot, dt: number): void {
    if (!slot.active) {
      return;
    }
    if (slot.flashTimer > 0) {
      slot.flashTimer = Math.max(0, slot.flashTimer - dt * 6);
    }
    slot.labelTex.redrawIfDirty(
      slot.operator,
      slot.value,
      slot.isLocked,
      slot.ringProgress,
      slot.flashTimer
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
    // Check Z crossing / slab intersection
    const minZ = Math.min(bz, prevBz) - 0.35;
    const maxZ = Math.max(bz, prevBz) + 0.35;
    if (this.z < minZ || this.z > maxZ) {
      return null;
    }

    let targetSlot: SingleLaneGateSlot | null = null;
    let lane: LaneSide = 'LEFT';
    if (bx >= -4.85 && bx <= -0.12 && this.leftSlot.active) {
      targetSlot = this.leftSlot;
      lane = 'LEFT';
    } else if (bx >= 0.12 && bx <= 4.85 && this.rightSlot.active) {
      targetSlot = this.rightSlot;
      lane = 'RIGHT';
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
    targetSlot.flashTimer = 1.0;
    targetSlot.labelTex.redrawIfDirty(
      targetSlot.operator,
      targetSlot.value,
      targetSlot.isLocked,
      targetSlot.ringProgress,
      targetSlot.flashTimer
    );

    return {
      lane,
      entityId: targetSlot.entityId,
      hitX: bx,
      hitZ: this.z,
      newValue: res.value,
      deltaIncrements: res.deltaIncrements,
      crossedZeroOrPositive: res.crossedZeroOrPositive,
      flippedToPositive: res.flippedToPositive,
      ricochet: res.ricochet,
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
    if (squadZ > this.z + 0.45 || squadZ < this.z - 2.2) {
      return null;
    }

    const chooseLeft =
      (squadX < 0 && this.leftSlot.active) || !this.rightSlot.active;
    const chosen = chooseLeft ? this.leftSlot : this.rightSlot;
    const lane: LaneSide = chooseLeft ? 'LEFT' : 'RIGHT';

    if (!chosen.active) {
      return null;
    }

    this.triggered = true;
    chosen.active = false;
    chosen.group.visible = false;

    const nextSquadCount = resolveGateSquadCount(
      currentSquad,
      chosen.operator,
      chosen.value
    );
    const deltaSquad = nextSquadCount - currentSquad;
    const label = formatGateLabel(chosen.operator, chosen.value);

    return {
      lane,
      worldX: chooseLeft ? -2.45 : 2.45,
      worldZ: this.z,
      nextSquadCount,
      deltaSquad,
      label,
      positive: deltaSquad >= 0,
    };
  }
}
