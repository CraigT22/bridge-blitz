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

const LANE_WIDTH = 4.72;
const PANEL_HEIGHT = 2.86;

export class GatePairSlot {
  public readonly root = new THREE.Group();
  public z = 0;
  public active = false;
  public triggered = false;

  private readonly leftSlot: SingleLaneGateSlot;
  private readonly rightSlot: SingleLaneGateSlot;

  constructor(pairIndex: number) {
    const gunmetalMat = new THREE.MeshStandardMaterial({
      color: 0x3b4754,
      metalness: 0.44,
      roughness: 0.34,
    });
    const steelTrimMat = new THREE.MeshStandardMaterial({
      color: 0x8595a8,
      metalness: 0.48,
      roughness: 0.26,
    });
    const hazardFootMat = new THREE.MeshStandardMaterial({
      color: 0xd49424,
      metalness: 0.32,
      roughness: 0.48,
    });

    // Grounded gantry contact shadow strip across roadway
    const gantryShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(10.6, 0.9),
      new THREE.MeshBasicMaterial({
        color: 0x05080d,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
      })
    );
    gantryShadow.rotation.x = -Math.PI / 2;
    gantryShadow.position.set(0, 0.018, 0.12);
    this.root.add(gantryShadow);

    // Heavy Industrial Tactical Gantry Stanchions (Left, Center, Right)
    for (const px of [-4.96, 0, 4.96]) {
      const footing = new THREE.Mesh(
        new THREE.BoxGeometry(0.56, 0.24, 0.66),
        gunmetalMat
      );
      footing.position.set(px, 0.12, 0);
      footing.castShadow = true;
      footing.receiveShadow = true;

      const hazardCollar = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.14, 0.54),
        hazardFootMat
      );
      hazardCollar.position.set(px, 0.3, 0);
      hazardCollar.castShadow = true;

      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 3.16, 0.34),
        gunmetalMat
      );
      post.position.set(px, 1.72, 0);
      post.castShadow = true;
      post.receiveShadow = true;

      const flange = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 2.85, 0.12),
        steelTrimMat
      );
      flange.position.set(px, 1.72, 0);

      this.root.add(footing, hazardCollar, post, flange);
    }

    // Overhead Armored Holo-Projector Gantry Beam
    const topBeam = new THREE.Mesh(
      new THREE.BoxGeometry(10.35, 0.28, 0.42),
      gunmetalMat
    );
    topBeam.position.set(0, 3.26, 0);
    topBeam.castShadow = true;
    topBeam.receiveShadow = true;
    this.root.add(topBeam);

    const topRail = new THREE.Mesh(
      new THREE.BoxGeometry(10.42, 0.08, 0.48),
      steelTrimMat
    );
    topRail.position.set(0, 3.43, 0);
    this.root.add(topRail);

    // Downward Holo-Projector Hoods centered above each lane
    for (const lx of [-2.48, 2.48]) {
      const emitterHood = new THREE.Mesh(
        new THREE.BoxGeometry(1.55, 0.18, 0.52),
        steelTrimMat
      );
      emitterHood.position.set(lx, 3.14, 0);
      emitterHood.castShadow = true;
      this.root.add(emitterHood);
    }

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
    const panelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(LANE_WIDTH, PANEL_HEIGHT),
      panelMat
    );
    panelMesh.position.set(0, 1.56, 0);
    group.add(panelMesh);

    // Glowing HDR Side Emitter Bars flanking the holographic energy field
    const ledMat = new THREE.MeshBasicMaterial({
      color: 0x48ffa7,
    });
    const barGeo = new THREE.BoxGeometry(0.065, 2.68, 0.09);
    const barL = new THREE.Mesh(barGeo, ledMat);
    barL.position.set(-2.32, 1.56, 0);
    const barR = new THREE.Mesh(barGeo, ledMat);
    barR.position.set(2.32, 1.56, 0);
    const emitterLens = new THREE.Mesh(
      new THREE.BoxGeometry(1.32, 0.06, 0.24),
      ledMat
    );
    emitterLens.position.set(0, 3.04, 0);
    group.add(barL, barR, emitterLens);

    const padlockGroup = createPadlockMesh();
    padlockGroup.position.set(0, 3.55, 0.12);
    group.add(padlockGroup);

    this.root.add(group);

    return {
      entityId,
      group,
      panelMesh,
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

  private syncLedColor(slot: SingleLaneGateSlot): void {
    if (slot.isLocked && slot.operator === 'MUL') {
      slot.ledMat.color.setRGB(1.4, 1.02, 0.28);
    } else if (slot.isLocked && slot.operator === 'DIV') {
      slot.ledMat.color.setRGB(1.45, 0.28, 0.24);
    } else if (slot.value < 0) {
      slot.ledMat.color.setRGB(1.4, 0.26, 0.38);
    } else {
      slot.ledMat.color.setRGB(0.28, 1.38, 0.82);
    }
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
    // Retract passed gate gantries cleanly beneath the deck so they never block trailing 20:9 portrait cameras
    if (this.triggered || squadZ < this.z - 2.3) {
      this.triggered = true;
      this.root.position.y -= dt * 18.0;
      if (this.root.position.y <= -3.9 || squadZ < this.z - 5.2) {
        this.hide();
        return;
      }
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
    this.syncLedColor(targetSlot);
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
