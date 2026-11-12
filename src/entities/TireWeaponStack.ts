import * as THREE from 'three';
import type { TireStackDefinition, WeaponTierId } from '../core/types';
import {
  createStaticWeaponBadgeTexture,
  EditableTirePlaqueTexture,
} from '../rendering/CanvasLabelCache';
import { createWeaponPickupGroup } from '../rendering/ProceduralGeometries';

const MAX_TIRE_LAYERS = 5;
const TIRE_HIT_RADIUS_X = 1.25;

export class TireWeaponStackSlot {
  public readonly entityId: number;
  public readonly root = new THREE.Group();
  public active = false;
  public broken = false;
  public x = 0;
  public z = 0;
  public initialBreakCount = 20;
  public remainingBreakCount = 20;
  public weaponTier: WeaponTierId = 2;

  private readonly tireMeshes: THREE.Mesh[] = [];
  private readonly rubberMat: THREE.MeshStandardMaterial;
  private readonly plaqueMesh: THREE.Mesh;
  private readonly plaqueTex: EditableTirePlaqueTexture;
  private readonly pickupPivot = new THREE.Group();
  private readonly weaponModels: Record<WeaponTierId, THREE.Group>;
  private readonly badgeMeshes: Record<WeaponTierId, THREE.Mesh>;
  private flashTimer = 0;
  private spinAngle = 0;

  constructor(slotIndex: number) {
    this.entityId = 500 + slotIndex;

    this.rubberMat = new THREE.MeshStandardMaterial({
      color: 0x1d232b,
      roughness: 0.72,
      metalness: 0.14,
      emissive: 0x000000,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x5c6b7a,
      roughness: 0.4,
      metalness: 0.65,
    });

    const tireGeo = new THREE.TorusGeometry(0.72, 0.24, 10, 20);
    tireGeo.rotateX(Math.PI / 2);
    const hubGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.36, 14);

    for (let i = 0; i < MAX_TIRE_LAYERS; i++) {
      const tire = new THREE.Mesh(tireGeo, this.rubberMat);
      tire.position.set(0, 0.24 + i * 0.41, 0);
      const hub = new THREE.Mesh(hubGeo, rimMat);
      hub.rotation.x = Math.PI / 2;
      // Keep hub flat inside torus
      hub.rotation.set(0, 0, 0);
      tire.add(hub);
      this.tireMeshes.push(tire);
      this.root.add(tire);
    }

    this.plaqueTex = new EditableTirePlaqueTexture();
    const plaqueMat = new THREE.MeshBasicMaterial({
      map: this.plaqueTex.texture,
      transparent: true,
    });
    this.plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 0.96), plaqueMat);
    this.plaqueMesh.position.set(0, 0.95, 1.04);
    this.root.add(this.plaqueMesh);

    // Pre-build all 5 procedural weapon pickups & tier badges once at boot (zero runtime allocations!)
    this.root.add(this.pickupPivot);
    this.weaponModels = {
      1: createWeaponPickupGroup(1),
      2: createWeaponPickupGroup(2),
      3: createWeaponPickupGroup(3),
      4: createWeaponPickupGroup(4),
      5: createWeaponPickupGroup(5),
    };

    const badgeGeo = new THREE.PlaneGeometry(1.85, 0.58);
    this.badgeMeshes = {
      1: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(1), transparent: true })),
      2: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(2), transparent: true })),
      3: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(3), transparent: true })),
      4: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(4), transparent: true })),
      5: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(5), transparent: true })),
    };

    for (const t of [1, 2, 3, 4, 5] as const) {
      this.pickupPivot.add(this.weaponModels[t]);
      this.badgeMeshes[t].position.set(0, 0.85, 0);
      this.pickupPivot.add(this.badgeMeshes[t]);
    }

    this.root.visible = false;
  }

  public configure(def: TireStackDefinition): void {
    this.active = true;
    this.broken = false;
    this.z = def.z;
    this.x = def.lane === 'LEFT' ? -2.45 : def.lane === 'RIGHT' ? 2.45 : 0;
    this.initialBreakCount = Math.max(1, def.breakCount);
    this.remainingBreakCount = this.initialBreakCount;
    this.weaponTier = def.weaponTier;
    this.flashTimer = 0;

    this.root.position.set(this.x, 0, this.z);
    this.root.visible = true;

    for (const t of [1, 2, 3, 4, 5] as const) {
      const show = t === def.weaponTier;
      this.weaponModels[t].visible = show;
      this.badgeMeshes[t].visible = show;
    }

    this.syncStackHeight();
    this.plaqueTex.redrawIfDirty(this.remainingBreakCount);
  }

  public hide(): void {
    this.active = false;
    this.broken = true;
    this.root.visible = false;
  }

  private syncStackHeight(): void {
    const ratio = Math.max(0, this.remainingBreakCount / this.initialBreakCount);
    const totalLayers =
      this.initialBreakCount >= 120 ? 5 : this.initialBreakCount >= 40 ? 4 : 3;
    const visibleLayers = Math.max(1, Math.ceil(ratio * totalLayers));

    for (let i = 0; i < MAX_TIRE_LAYERS; i++) {
      this.tireMeshes[i].visible = i < visibleLayers;
    }

    const topY = 0.35 + visibleLayers * 0.41;
    this.pickupPivot.position.set(0, topY + 0.55, 0);
    this.plaqueMesh.position.y = Math.max(0.62, topY * 0.52);
  }

  public update(dt: number): void {
    if (!this.active || this.broken) {
      return;
    }
    this.spinAngle += dt * 2.1;
    for (const t of [1, 2, 3, 4, 5] as const) {
      if (this.weaponModels[t].visible) {
        this.weaponModels[t].rotation.y = this.spinAngle;
        this.weaponModels[t].position.y = Math.sin(this.spinAngle * 1.5) * 0.1;
      }
    }

    if (this.flashTimer > 0) {
      this.flashTimer = Math.max(0, this.flashTimer - dt * 8);
      const g = this.flashTimer * 0.55;
      this.rubberMat.emissive.setRGB(g, g, g);
    } else {
      this.rubberMat.emissive.setRGB(0, 0, 0);
    }
  }

  /**
   * Returns `'HIT'` when damaged or `'SHATTERED'` on the exact shot that breaks the stack!
   */
  public tryBulletHit(
    bx: number,
    bz: number,
    prevBz: number,
    damage: number,
    lastHitId: number
  ): 'NONE' | 'HIT' | 'SHATTERED' {
    if (!this.active || this.broken || lastHitId === this.entityId) {
      return 'NONE';
    }
    const minZ = Math.min(bz, prevBz) - 0.95;
    const maxZ = Math.max(bz, prevBz) + 0.95;
    if (this.z < minZ || this.z > maxZ) {
      return 'NONE';
    }
    if (Math.abs(bx - this.x) > TIRE_HIT_RADIUS_X) {
      return 'NONE';
    }

    this.remainingBreakCount -= damage;
    this.flashTimer = 1.0;

    if (this.remainingBreakCount <= 0) {
      this.remainingBreakCount = 0;
      this.broken = true;
      this.active = false;
      this.root.visible = false;
      return 'SHATTERED';
    }

    this.syncStackHeight();
    this.plaqueTex.redrawIfDirty(this.remainingBreakCount);
    return 'HIT';
  }

  /**
   * If the squad physically runs into an unbroken tire stack, shatter it as a minor roadblock (-1 soldier)
   * without granting the weapon pickup.
   */
  public checkUnbrokenSquadBump(squadX: number, squadZ: number, squadRadius: number): boolean {
    if (!this.active || this.broken) {
      return false;
    }
    if (Math.abs(squadZ - this.z) < 0.85 + squadRadius * 0.35 && Math.abs(squadX - this.x) < 0.95 + squadRadius * 0.65) {
      this.broken = true;
      this.active = false;
      this.root.visible = false;
      return true;
    }
    return false;
  }
}
