import * as THREE from 'three';
import type { TireStackDefinition, WeaponTierId } from '../core/types';
import { WEAPON_SPECS } from '../math/weaponMath';
import {
  createStaticWeaponBadgeTexture,
  EditableArcadeHpTexture,
} from '../rendering/CanvasLabelCache';
import { createGoldCoinPickupGroup } from '../rendering/ProceduralGeometries';
import {
  createShowcaseWeaponGroup,
  type ShowcaseWeaponRig,
} from '../rendering/WeaponRigFactory';

const MAX_TIRE_LAYERS = 5;
const TIRE_HIT_RADIUS_X = 1.56;

function createOffRoadTireTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#14171c';
  ctx.fillRect(0, 0, 256, 128);

  ctx.fillStyle = '#2d3540';
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
  public initialBreakCount = 150;
  public remainingBreakCount = 150;
  public weaponTier: WeaponTierId | null = null;
  public coinReward = 40;

  private readonly tireMeshes: THREE.Group[] = [];
  private readonly rubberMat: THREE.MeshStandardMaterial;
  private readonly holoBeamMat: THREE.MeshBasicMaterial;
  private readonly outerHoloRing: THREE.Mesh;
  private readonly plaqueMesh: THREE.Mesh;
  private readonly plaqueTex: EditableArcadeHpTexture;
  private readonly pickupPivot = new THREE.Group();
  private readonly coinPickupGroup: THREE.Group;
  private readonly weaponRigs: Record<WeaponTierId, ShowcaseWeaponRig>;
  private readonly badgeMeshes: Record<WeaponTierId, THREE.Mesh>;
  private flashTimer = 0;
  private spinAngle = 0;
  private retiring = false;

  constructor(slotIndex: number) {
    this.entityId = 500 + slotIndex;

    this.rubberMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: _sharedTreadTex,
      bumpMap: _sharedTreadTex,
      bumpScale: 0.04,
      roughness: 0.80,
      metalness: 0.10,
      emissive: 0x000000,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x586778,
      roughness: 0.34,
      metalness: 0.46,
    });
    const outlineMat = new THREE.MeshBasicMaterial({
      color: 0x080a0e,
      side: THREE.BackSide,
    });

    // Grounded AO shadow disc beneath wide tire barricade
    const stackShadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.58, 20),
      new THREE.MeshBasicMaterial({
        color: 0x05080d,
        transparent: true,
        opacity: 0.52,
        depthWrite: false,
      })
    );
    stackShadow.rotation.x = -Math.PI / 2;
    stackShadow.position.set(0, 0.02, 0.08);
    this.root.add(stackShadow);

    // Wide heavy-duty barricade tires (3 stacks side-by-side at -3.15, 0, +3.15 seal the whole bridge!)
    const tireGeo = new THREE.TorusGeometry(1.12, 0.34, 12, 24);
    tireGeo.rotateX(Math.PI / 2);
    const tireOutlineGeo = new THREE.TorusGeometry(1.12, 0.39, 10, 24);
    tireOutlineGeo.rotateX(Math.PI / 2);
    const hubGeo = new THREE.CylinderGeometry(0.84, 0.84, 0.48, 16);

    for (let i = 0; i < MAX_TIRE_LAYERS; i++) {
      const layerGroup = new THREE.Group();
      const offsetX = i % 2 === 0 ? 0.02 : -0.025;
      layerGroup.position.set(offsetX, 0.32 + i * 0.52, 0);
      layerGroup.rotation.y = i * 0.45;

      const tire = new THREE.Mesh(tireGeo, this.rubberMat);
      const outline = new THREE.Mesh(tireOutlineGeo, outlineMat);
      const hub = new THREE.Mesh(hubGeo, rimMat);
      layerGroup.add(tire, outline, hub);

      this.tireMeshes.push(layerGroup);
      this.root.add(layerGroup);
    }

    this.plaqueTex = new EditableArcadeHpTexture();
    const plaqueMat = new THREE.MeshBasicMaterial({
      map: this.plaqueTex.texture,
      transparent: true,
      depthWrite: false,
    });
    this.plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.55, 1.48), plaqueMat);
    this.plaqueMesh.position.set(0, 1.15, 1.56);
    this.root.add(this.plaqueMesh);

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
      new THREE.CylinderGeometry(0.92, 0.56, 1.05, 18, 1, true),
      this.holoBeamMat
    );
    holoCone.position.set(0, 0.02, 0);
    this.pickupPivot.add(holoCone);

    this.outerHoloRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.84, 0.028, 8, 24),
      this.holoBeamMat
    );
    this.outerHoloRing.rotation.x = Math.PI / 2.2;
    this.outerHoloRing.position.set(0, -0.34, 0);
    this.pickupPivot.add(this.outerHoloRing);

    this.coinPickupGroup = createGoldCoinPickupGroup();
    this.pickupPivot.add(this.coinPickupGroup);

    this.weaponRigs = {
      1: createShowcaseWeaponGroup(1),
      2: createShowcaseWeaponGroup(2),
      3: createShowcaseWeaponGroup(3),
      4: createShowcaseWeaponGroup(4),
      5: createShowcaseWeaponGroup(5),
    };

    const badgeGeo = new THREE.PlaneGeometry(2.18, 0.64);
    this.badgeMeshes = {
      1: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(1), transparent: true })),
      2: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(2), transparent: true })),
      3: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(3), transparent: true })),
      4: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(4), transparent: true })),
      5: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(5), transparent: true })),
    };

    for (const t of [1, 2, 3, 4, 5] as const) {
      const rig = this.weaponRigs[t];
      rig.root.scale.setScalar(1.32);
      rig.root.rotation.z = 0.20;
      this.pickupPivot.add(rig.root);
      this.badgeMeshes[t].position.set(0, 1.04, 0);
      this.pickupPivot.add(this.badgeMeshes[t]);
    }

    this.root.visible = false;
  }

  public configure(def: TireStackDefinition): void {
    this.active = true;
    this.broken = false;
    this.retiring = false;
    this.z = def.z;
    this.x = def.lane === 'LEFT' ? -3.15 : def.lane === 'RIGHT' ? 3.15 : 0;
    this.initialBreakCount = Math.max(1, def.breakCount);
    this.remainingBreakCount = this.initialBreakCount;
    this.weaponTier = def.weaponTier ?? null;
    this.coinReward = def.coinReward ?? 45;
    this.flashTimer = 0;

    this.root.position.set(this.x, 0, this.z);
    this.root.visible = true;

    const hasWeapon = this.weaponTier !== null;
    const hasCoin = !hasWeapon && this.coinReward > 0;
    this.pickupPivot.visible = hasWeapon || hasCoin;
    this.coinPickupGroup.visible = hasCoin;

    if (this.weaponTier) {
      this.holoBeamMat.color.setHex(WEAPON_SPECS[this.weaponTier].colorHex);
    } else {
      this.holoBeamMat.color.setHex(0xffd447);
    }

    for (const t of [1, 2, 3, 4, 5] as const) {
      const show = this.weaponTier === t;
      this.weaponRigs[t].root.visible = show;
      this.badgeMeshes[t].visible = show;
    }

    this.syncStackHeight();
    this.plaqueTex.redrawIfDirty(this.remainingBreakCount, 0);
  }

  public hide(): void {
    this.active = false;
    this.broken = true;
    this.root.visible = false;
  }

  /**
   * Retires sibling Tire Stacks in the same 3-lane checkpoint row once one lane is breached,
   * sinking them smoothly into the bridge deck so wide-spread squads cannot triple-farm one wall.
   */
  public retireCheckpointSibling(): void {
    if (!this.active || this.broken) {
      return;
    }
    this.retiring = true;
  }

  private syncStackHeight(): void {
    const ratio = Math.max(0, this.remainingBreakCount / this.initialBreakCount);
    const totalLayers =
      this.initialBreakCount >= 400 ? 5 : this.initialBreakCount >= 140 ? 4 : 3;
    const visibleLayers = Math.max(1, Math.ceil(ratio * totalLayers));

    for (let i = 0; i < MAX_TIRE_LAYERS; i++) {
      this.tireMeshes[i].visible = i < visibleLayers;
    }

    const topY = 0.42 + visibleLayers * 0.52;
    this.pickupPivot.position.set(0, topY + 0.68, 0);
    this.plaqueMesh.position.y = Math.max(0.75, topY * 0.52);
  }

  public update(dt: number, squadZ: number): void {
    if (!this.active || this.broken) {
      return;
    }
    if (this.retiring || squadZ < this.z - 2.6) {
      this.retiring = true;
      this.root.position.y -= dt * 18.0;
      if (this.root.position.y <= -3.8 || squadZ < this.z - 5.4) {
        this.hide();
      }
      return;
    }
    this.spinAngle += dt * 2.35;
    this.outerHoloRing.rotation.z = -this.spinAngle * 0.85;

    if (this.weaponTier) {
      const activeRig = this.weaponRigs[this.weaponTier];
      if (activeRig.root.visible) {
        activeRig.root.rotation.y = Math.sin(this.spinAngle * 0.9) * 0.68;
        activeRig.root.position.y = 0.08 + Math.sin(this.spinAngle * 1.6) * 0.09;
        if (activeRig.spinCluster) {
          activeRig.spinCluster.rotation.x += dt * 14.0;
        }
      }
    } else if (this.coinPickupGroup.visible) {
      this.coinPickupGroup.rotation.y = Math.sin(this.spinAngle * 1.15) * 0.58;
      this.coinPickupGroup.position.y = Math.sin(this.spinAngle * 1.8) * 0.07;
    }

    if (this.flashTimer > 0) {
      this.flashTimer = Math.max(0, this.flashTimer - dt * 8);
      const g = this.flashTimer * 0.62;
      this.rubberMat.emissive.setRGB(g, g * 0.25, 0.04);
    } else {
      this.rubberMat.emissive.setRGB(0, 0, 0);
    }

    this.plaqueTex.redrawIfDirty(this.remainingBreakCount, this.flashTimer);
  }

  public tryBulletHit(
    bx: number,
    bz: number,
    prevBz: number,
    damage: number,
    lastHitId: number
  ): 'NONE' | 'HIT' | 'SHATTERED' {
    if (!this.active || this.broken || this.retiring || lastHitId === this.entityId) {
      return 'NONE';
    }
    const minZ = Math.min(bz, prevBz) - 1.25;
    const maxZ = Math.max(bz, prevBz) + 1.25;
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
    this.plaqueTex.redrawIfDirty(this.remainingBreakCount, 1.0);
    return 'HIT';
  }

  /**
   * Returns commando crash casualties if the squad slams into an unbroken Tire Wall barricade!
   * High-HP unbroken tire walls act as genuine DPS gear-check barricades.
   */
  public resolveUnbrokenSquadCrash(
    squadX: number,
    squadZ: number,
    squadRadius: number
  ): number {
    if (!this.active || this.broken || this.retiring) {
      return 0;
    }
    if (
      Math.abs(squadZ - this.z) < 1.18 + squadRadius * 0.28 &&
      Math.abs(squadX - this.x) < 1.46 + squadRadius * 0.45
    ) {
      const crashDamage = Math.max(2, Math.ceil(this.remainingBreakCount / 35));
      this.broken = true;
      this.active = false;
      this.root.visible = false;
      return crashDamage;
    }
    return 0;
  }
}
