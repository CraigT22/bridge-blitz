import * as THREE from 'three';
import type { GateDefinition, GateOperator, GatePairDefinition, LaneSide } from '../core/types';
import {
  applyGateBulletHit,
  formatGateLabel,
  resolveGateSquadCount,
} from '../math/gateMath';
import { EditableGateTexture } from '../rendering/CanvasLabelCache';
import { createPadlockMesh } from '../rendering/ProceduralGeometries';

interface SingleGateSlot {
  readonly entityId: number;
  readonly laneTag: LaneSide;
  readonly minX: number;
  readonly maxX: number;
  readonly centerX: number;
  readonly group: THREE.Group;
  readonly ledMat: THREE.MeshBasicMaterial;
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

const SPLIT_WIDTH = 4.72;
const FULL_WIDTH = 9.64;
const PANEL_HEIGHT = 2.48;

export class GatePairSlot {
  public readonly root = new THREE.Group();
  public z = 0;
  public active = false;
  public triggered = false;
  public isFullSpan = false;

  private readonly centerPostGroup = new THREE.Group();
  private readonly leftSlot: SingleGateSlot;
  private readonly rightSlot: SingleGateSlot;
  private readonly fullSlot: SingleGateSlot;

  constructor(pairIndex: number) {
    const pylonMat = new THREE.MeshStandardMaterial({
      color: 0x263445,
      metalness: 0.42,
      roughness: 0.34,
    });
    const outlineMat = new THREE.MeshBasicMaterial({
      color: 0x0b0f16,
      side: THREE.BackSide,
    });

    // Grounded contact shadow strip
    const gantryShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(10.2, 0.55),
      new THREE.MeshBasicMaterial({
        color: 0x05080d,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      })
    );
    gantryShadow.rotation.x = -Math.PI / 2;
    gantryShadow.position.set(0, 0.018, 0.06);
    this.root.add(gantryShadow);

    // Sleek Vertical Energy Pylons (No bulky top crossbar so low close camera sees down-bridge obstacles cleanly!)
    for (const px of [-4.92, 0, 4.92]) {
      const holder = px === 0 ? this.centerPostGroup : this.root;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.17, 2.75, 12),
        pylonMat
      );
      post.position.set(px, 1.38, 0);
      const postOutline = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.21, 2.81, 12),
        outlineMat
      );
      postOutline.position.set(px, 1.38, 0);
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.20, 10, 8),
        pylonMat
      );
      cap.position.set(px, 2.78, 0);
      holder.add(post, postOutline, cap);
    }
    this.root.add(this.centerPostGroup);

    this.leftSlot = this.createGateSlot(pairIndex * 3 + 100, 'LEFT', -2.46, SPLIT_WIDTH, -4.88, -0.06, false);
    this.rightSlot = this.createGateSlot(pairIndex * 3 + 101, 'RIGHT', 2.46, SPLIT_WIDTH, 0.06, 4.88, false);
    this.fullSlot = this.createGateSlot(pairIndex * 3 + 102, 'LEFT', 0, FULL_WIDTH, -4.88, 4.88, true);

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
    const panelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, PANEL_HEIGHT),
      panelMat
    );
    panelMesh.position.set(0, 1.34, 0);
    group.add(panelMesh);

    const ledMat = new THREE.MeshBasicMaterial({ color: 0x38f6ff });
    const barGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.52, 8);
    const halfSpan = width * 0.5 - 0.04;
    const barL = new THREE.Mesh(barGeo, ledMat);
    barL.position.set(-halfSpan, 1.34, 0);
    const barR = new THREE.Mesh(barGeo, ledMat);
    barR.position.set(halfSpan, 1.34, 0);
    group.add(barL, barR);

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
      group,
      ledMat,
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

  private syncLedColor(slot: SingleGateSlot): void {
    if (slot.isLocked && slot.operator === 'MUL') {
      slot.ledMat.color.setRGB(1.35, 1.0, 0.25);
    } else if (slot.isLocked && slot.operator === 'DIV') {
      slot.ledMat.color.setRGB(1.42, 0.25, 0.24);
    } else if (slot.operator === 'ADD' && slot.value < 0) {
      slot.ledMat.color.setRGB(1.4, 0.24, 0.34);
    } else {
      slot.ledMat.color.setRGB(0.24, 1.25, 1.48);
    }
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
      this.configureSlot(this.leftSlot, null);
      this.configureSlot(this.rightSlot, null);
      this.configureSlot(this.fullSlot, def.full);
    } else {
      this.isFullSpan = false;
      this.centerPostGroup.visible = true;
      this.configureSlot(this.fullSlot, null);
      this.configureSlot(this.leftSlot, def.left);
      this.configureSlot(this.rightSlot, def.right);
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
    slot.padlockGroup.visible = def.isLocked;
    this.syncLedColor(slot);
    slot.labelTex.redrawIfDirty(def.operator, def.initialValue, def.isLocked, 0, 0);
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
    if (this.triggered || squadZ < this.z - 2.0) {
      this.triggered = true;
      this.root.position.y -= dt * 18.0;
      if (this.root.position.y <= -3.4 || squadZ < this.z - 4.8) {
        this.hide();
        return;
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
    if (slot.flashTimer > 0) {
      slot.flashTimer = Math.max(0, slot.flashTimer - dt * 6.5);
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
    targetSlot.flashTimer = 1.0;
    this.syncLedColor(targetSlot);
    targetSlot.labelTex.redrawIfDirty(
      targetSlot.operator,
      targetSlot.value,
      targetSlot.isLocked,
      targetSlot.ringProgress,
      targetSlot.flashTimer
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
        (squadX < 0 && this.leftSlot.active) || !this.rightSlot.active;
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
      999
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
