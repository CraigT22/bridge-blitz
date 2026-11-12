import * as THREE from 'three';
import type { TireStackDefinition, WeaponTierId } from '../core/types';
import { WEAPON_SPECS } from '../math/weaponMath';
import {
  createStaticWeaponBadgeTexture,
  EditableTirePlaqueTexture,
} from '../rendering/CanvasLabelCache';
import { createWeaponPickupGroup } from '../rendering/ProceduralGeometries';

const MAX_TIRE_LAYERS = 5;
const TIRE_HIT_RADIUS_X = 1.25;

function createOffRoadTireTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#14171c';
  ctx.fillRect(0, 0, 256, 128);

  // Deep off-road chevron lug blocks
  ctx.fillStyle = '#2c333d';
  for (let x = 0; x < 256; x += 16) {
    ctx.fillRect(x + 2, 6, 10, 50);
    ctx.fillRect(x + 8, 70, 10, 50);
  }
  ctx.fillStyle = '#0d0f13';
  ctx.fillRect(0, 60, 256, 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const _sharedTreadTex = createOffRoadTireTexture();

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

  private readonly tireMeshes: THREE.Group[] = [];
  private readonly rubberMat: THREE.MeshStandardMaterial;
  private readonly holoBeamMat: THREE.MeshBasicMaterial;
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
      color: 0xffffff,
      map: _sharedTreadTex,
      bumpMap: _sharedTreadTex,
      bumpScale: 0.035,
      roughness: 0.82,
      metalness: 0.08,
      emissive: 0x000000,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x586778,
      roughness: 0.34,
      metalness: 0.46,
    });
    const lugMat = new THREE.MeshStandardMaterial({
      color: 0xdbe5f0,
      roughness: 0.24,
      metalness: 0.5,
    });

    // Grounded AO shadow disc beneath tire barricade
    const stackShadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.18, 20),
      new THREE.MeshBasicMaterial({
        color: 0x05080d,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
      })
    );
    stackShadow.rotation.x = -Math.PI / 2;
    stackShadow.position.set(0, 0.02, 0.08);
    this.root.add(stackShadow);

    const tireGeo = new THREE.TorusGeometry(0.74, 0.24, 12, 24);
    tireGeo.rotateX(Math.PI / 2);
    const hubGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.36, 16);
    const centerCapGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.42, 10);
    const lugGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.4, 6);

    for (let i = 0; i < MAX_TIRE_LAYERS; i++) {
      const layerGroup = new THREE.Group();
      // Slight realistic offset/rotation per stacked military tire
      const offsetX = i % 2 === 0 ? 0.02 : -0.025;
      layerGroup.position.set(offsetX, 0.24 + i * 0.41, 0);
      layerGroup.rotation.y = i * 0.55;

      const tire = new THREE.Mesh(tireGeo, this.rubberMat);
      tire.castShadow = true;
      tire.receiveShadow = true;

      const hub = new THREE.Mesh(hubGeo, rimMat);
      hub.castShadow = true;
      const cap = new THREE.Mesh(centerCapGeo, lugMat);
      layerGroup.add(tire, hub, cap);

      for (let l = 0; l < 6; l++) {
        const ang = (l / 6) * Math.PI * 2;
        const lug = new THREE.Mesh(lugGeo, lugMat);
        lug.position.set(Math.cos(ang) * 0.34, 0, Math.sin(ang) * 0.34);
        layerGroup.add(lug);
      }

      this.tireMeshes.push(layerGroup);
      this.root.add(layerGroup);
    }

    this.plaqueTex = new EditableTirePlaqueTexture();
    const plaqueMat = new THREE.MeshBasicMaterial({
      map: this.plaqueTex.texture,
      transparent: true,
    });
    this.plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.52, 0.96), plaqueMat);
    this.plaqueMesh.position.set(0, 0.95, 1.06);
    this.root.add(this.plaqueMesh);

    // Holo-Pedestal Emitter Ring & Vertical Light Cone beneath Weapon Pickup
    this.root.add(this.pickupPivot);
    this.holoBeamMat = new THREE.MeshBasicMaterial({
      color: 0xffd447,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const holoCone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.42, 0.95, 18, 1, true),
      this.holoBeamMat
    );
    holoCone.position.set(0, -0.05, 0);
    this.pickupPivot.add(holoCone);

    const emitterRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.032, 8, 20),
      this.holoBeamMat
    );
    emitterRing.rotation.x = Math.PI / 2;
    emitterRing.position.set(0, -0.48, 0);
    this.pickupPivot.add(emitterRing);

    this.weaponModels = {
      1: createWeaponPickupGroup(1),
      2: createWeaponPickupGroup(2),
      3: createWeaponPickupGroup(3),
      4: createWeaponPickupGroup(4),
      5: createWeaponPickupGroup(5),
    };

    const badgeGeo = new THREE.PlaneGeometry(1.96, 0.58);
    this.badgeMeshes = {
      1: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(1), transparent: true })),
      2: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(2), transparent: true })),
      3: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(3), transparent: true })),
      4: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(4), transparent: true })),
      5: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(5), transparent: true })),
    };

    for (const t of [1, 2, 3, 4, 5] as const) {
      this.pickupPivot.add(this.weaponModels[t]);
      this.badgeMeshes[t].position.set(0, 0.88, 0);
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

    this.holoBeamMat.color.setHex(WEAPON_SPECS[def.weaponTier].colorHex);

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
    this.pickupPivot.position.set(0, topY + 0.58, 0);
    this.plaqueMesh.position.y = Math.max(0.64, topY * 0.52);
  }

  public update(dt: number, squadZ: number): void {
    if (!this.active || this.broken) {
      return;
    }
    if (squadZ < this.z - 3.6) {
      this.root.position.y -= dt * 16.0;
      if (this.root.position.y <= -3.6 || squadZ < this.z - 5.5) {
        this.hide();
      }
      return;
    }
    this.spinAngle += dt * 2.15;
    for (const t of [1, 2, 3, 4, 5] as const) {
      if (this.weaponModels[t].visible) {
        this.weaponModels[t].rotation.y = this.spinAngle;
        this.weaponModels[t].position.y = Math.sin(this.spinAngle * 1.6) * 0.09;
      }
    }

    if (this.flashTimer > 0) {
      this.flashTimer = Math.max(0, this.flashTimer - dt * 8);
      const g = this.flashTimer * 0.48;
      this.rubberMat.emissive.setRGB(g, g * 0.85, g * 0.65);
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
    if (
      Math.abs(squadZ - this.z) < 0.85 + squadRadius * 0.35 &&
      Math.abs(squadX - this.x) < 0.95 + squadRadius * 0.65
    ) {
      this.broken = true;
      this.active = false;
      this.root.visible = false;
      return true;
    }
    return false;
  }
}
