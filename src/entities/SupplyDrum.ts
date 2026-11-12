import * as THREE from 'three';
import type { DrumRewardType, ObstacleLane, SupplyDrumDefinition, WeaponTierId } from '../core/types';
import { WEAPON_SPECS } from '../math/weaponMath';
import {
  createStaticWeaponBadgeTexture,
  EditableArcadeHpTexture,
} from '../rendering/CanvasLabelCache';
import {
  createGoldCoinPickupGroup,
  createRecruitPickupGroup,
} from '../rendering/ProceduralGeometries';
import {
  createShowcaseWeaponGroup,
  type ShowcaseWeaponRig,
} from '../rendering/WeaponRigFactory';

const DRUM_HIT_RADIUS_X = 1.34;

export function obstacleLaneToX(lane: ObstacleLane): number {
  switch (lane) {
    case 'LEFT':
      return -3.15;
    case 'RIGHT':
      return 3.15;
    case 'LEFT_MID':
      return -1.68;
    case 'RIGHT_MID':
      return 1.68;
    case 'CENTER':
    default:
      return 0;
  }
}

function createMilitaryDrumTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Warm military crate/drum olive-ochre ribbing with steel vertical seams & dark hoops
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#7c5d38');
  grad.addColorStop(0.5, '#987346');
  grad.addColorStop(1, '#6b4e2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Stave / vertical rib grooves
  ctx.fillStyle = 'rgba(22, 14, 8, 0.28)';
  for (let x = 0; x < 256; x += 24) {
    ctx.fillRect(x, 0, 3, 256);
  }

  // Heavy brushed gunmetal steel bands
  for (const bandY of [28, 194]) {
    ctx.fillStyle = '#27303b';
    ctx.fillRect(0, bandY - 3, 256, 38);
    ctx.fillStyle = '#6c7a89';
    ctx.fillRect(0, bandY, 256, 32);
    ctx.fillStyle = '#95a5b5';
    ctx.fillRect(0, bandY + 4, 256, 7);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSunburstGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0, 'rgba(255, 244, 168, 0.92)');
  grad.addColorStop(0.45, 'rgba(255, 204, 56, 0.45)');
  grad.addColorStop(1, 'rgba(255, 180, 20, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

const _sharedDrumTex = createMilitaryDrumTexture();
const _sharedGlowTex = createSunburstGlowTexture();

export class SupplyDrumSlot {
  public readonly entityId: number;
  public readonly root = new THREE.Group();
  public active = false;
  public broken = false;
  public x = 0;
  public z = 0;
  public initialHp = 25;
  public remainingHp = 25;
  public rewardType: DrumRewardType = 'COINS';
  public rewardValue = 20;

  private readonly drumBodyGroup = new THREE.Group();
  private readonly drumMat: THREE.MeshStandardMaterial;
  private readonly hpLabelMesh: THREE.Mesh;
  private readonly hpLabelTex: EditableArcadeHpTexture;
  private readonly pickupPivot = new THREE.Group();
  private readonly glowHaloMesh: THREE.Mesh;
  private readonly coinGroup: THREE.Group;
  private readonly recruitGroup: THREE.Group;
  private readonly weaponRigs: Record<WeaponTierId, ShowcaseWeaponRig>;
  private readonly weaponBadges: Record<WeaponTierId, THREE.Mesh>;

  private flashTimer = 0;
  private spinAngle = 0;

  constructor(slotIndex: number) {
    this.entityId = 300 + slotIndex;

    // Grounded contact shadow
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.32, 20),
      new THREE.MeshBasicMaterial({
        color: 0x05080d,
        transparent: true,
        opacity: 0.46,
        depthWrite: false,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, 0.02, 0.08);
    this.root.add(shadow);

    this.drumMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: _sharedDrumTex,
      roughness: 0.62,
      metalness: 0.18,
      emissive: 0x000000,
    });

    // Chunky sideways/upright tactical munitions barrel silhouette with dark BackSide cel-outline!
    const barrelGeo = new THREE.CylinderGeometry(0.92, 0.92, 2.22, 18);
    barrelGeo.rotateZ(Math.PI / 2);
    barrelGeo.scale(1.0, 1.08, 1.05);
    const barrelMesh = new THREE.Mesh(barrelGeo, this.drumMat);
    barrelMesh.position.y = 0.98;
    this.drumBodyGroup.add(barrelMesh);

    const outlineGeo = new THREE.CylinderGeometry(0.97, 0.97, 2.31, 18);
    outlineGeo.rotateZ(Math.PI / 2);
    outlineGeo.scale(1.0, 1.08, 1.05);
    const outlineMesh = new THREE.Mesh(
      outlineGeo,
      new THREE.MeshBasicMaterial({ color: 0x120d08, side: THREE.BackSide })
    );
    outlineMesh.position.y = 0.98;
    this.drumBodyGroup.add(outlineMesh);

    this.root.add(this.drumBodyGroup);

    // Giant front-facing orange-outlined white HP digits right across the drum front
    this.hpLabelTex = new EditableArcadeHpTexture();
    this.hpLabelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.26, 1.32),
      new THREE.MeshBasicMaterial({
        map: this.hpLabelTex.texture,
        transparent: true,
        depthWrite: false,
      })
    );
    this.hpLabelMesh.position.set(0, 0.90, 1.06);
    this.root.add(this.hpLabelMesh);

    // Perched Top Reward Pivot (Gold Coin, 3D Weapon, or +1 Recruit Helmet)
    this.pickupPivot.position.set(0, 2.42, 0);
    this.root.add(this.pickupPivot);

    this.glowHaloMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.85, 1.85),
      new THREE.MeshBasicMaterial({
        map: _sharedGlowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.glowHaloMesh.position.set(0, 0.04, -0.12);
    this.pickupPivot.add(this.glowHaloMesh);

    this.coinGroup = createGoldCoinPickupGroup();
    this.pickupPivot.add(this.coinGroup);

    this.recruitGroup = createRecruitPickupGroup();
    this.pickupPivot.add(this.recruitGroup);

    this.weaponRigs = {
      1: createShowcaseWeaponGroup(1),
      2: createShowcaseWeaponGroup(2),
      3: createShowcaseWeaponGroup(3),
      4: createShowcaseWeaponGroup(4),
      5: createShowcaseWeaponGroup(5),
    };
    const badgeGeo = new THREE.PlaneGeometry(2.05, 0.60);
    this.weaponBadges = {
      1: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(1), transparent: true })),
      2: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(2), transparent: true })),
      3: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(3), transparent: true })),
      4: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(4), transparent: true })),
      5: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(5), transparent: true })),
    };

    for (const t of [1, 2, 3, 4, 5] as const) {
      const rig = this.weaponRigs[t];
      rig.root.scale.setScalar(1.25);
      rig.root.rotation.z = 0.18;
      this.pickupPivot.add(rig.root);
      this.weaponBadges[t].position.set(0, 0.88, 0);
      this.pickupPivot.add(this.weaponBadges[t]);
    }

    this.root.visible = false;
  }

  public configure(def: SupplyDrumDefinition): void {
    this.active = true;
    this.broken = false;
    this.z = def.z;
    this.x = obstacleLaneToX(def.lane);
    this.initialHp = Math.max(1, def.hp);
    this.remainingHp = this.initialHp;
    this.rewardType = def.rewardType;
    this.rewardValue = def.rewardValue;
    this.flashTimer = 0;

    this.root.position.set(this.x, 0, this.z);
    this.root.visible = true;
    this.drumBodyGroup.scale.set(1, 1, 1);
    this.drumMat.emissive.setRGB(0, 0, 0);

    const isCoins = def.rewardType === 'COINS';
    const isRecruit = def.rewardType === 'RECRUIT';
    const isWeapon = def.rewardType === 'WEAPON';

    this.coinGroup.visible = isCoins;
    this.recruitGroup.visible = isRecruit;
    this.glowHaloMesh.visible = true;

    const wTier = Math.max(1, Math.min(5, Math.round(def.rewardValue))) as WeaponTierId;
    for (const t of [1, 2, 3, 4, 5] as const) {
      const show = isWeapon && t === wTier;
      this.weaponRigs[t].root.visible = show;
      this.weaponBadges[t].visible = show;
    }

    if (isWeapon) {
      (this.glowHaloMesh.material as THREE.MeshBasicMaterial).color.setHex(
        WEAPON_SPECS[wTier].colorHex
      );
    } else if (isRecruit) {
      (this.glowHaloMesh.material as THREE.MeshBasicMaterial).color.setHex(0x45d9ff);
    } else {
      (this.glowHaloMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffdf66);
    }

    this.hpLabelTex.redrawIfDirty(this.remainingHp, 0);
  }

  public hide(): void {
    this.active = false;
    this.broken = true;
    this.root.visible = false;
  }

  public update(dt: number, squadZ: number): void {
    if (!this.active || this.broken) {
      return;
    }
    if (squadZ < this.z - 3.4) {
      this.root.position.y -= dt * 16.0;
      if (this.root.position.y <= -3.5 || squadZ < this.z - 5.2) {
        this.hide();
      }
      return;
    }

    this.spinAngle += dt * 2.5;
    const bobY = Math.sin(this.spinAngle * 1.5) * 0.08;
    this.pickupPivot.position.y = 2.42 + bobY;

    if (this.coinGroup.visible) {
      this.coinGroup.rotation.y = this.spinAngle;
    } else if (this.recruitGroup.visible) {
      this.recruitGroup.rotation.y = Math.sin(this.spinAngle * 0.9) * 0.45;
    } else {
      const wTier = Math.max(1, Math.min(5, Math.round(this.rewardValue))) as WeaponTierId;
      const rig = this.weaponRigs[wTier];
      rig.root.rotation.y = this.spinAngle * 0.85;
      if (rig.spinCluster) {
        rig.spinCluster.rotation.x += dt * 12;
      }
    }

    if (this.flashTimer > 0) {
      this.flashTimer = Math.max(0, this.flashTimer - dt * 7.5);
      // Fiery red-orange barrel impact flash + punchy squash pop (matches 084617.png!)
      this.drumMat.emissive.setRGB(this.flashTimer * 0.82, this.flashTimer * 0.16, 0.02);
      const pop = 1 + this.flashTimer * 0.055;
      this.drumBodyGroup.scale.set(pop, 1 - this.flashTimer * 0.03, pop);
    } else {
      this.drumMat.emissive.setRGB(0, 0, 0);
      this.drumBodyGroup.scale.set(1, 1, 1);
    }

    this.hpLabelTex.redrawIfDirty(this.remainingHp, this.flashTimer);
  }

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
    const minZ = Math.min(bz, prevBz) - 1.05;
    const maxZ = Math.max(bz, prevBz) + 1.05;
    if (this.z < minZ || this.z > maxZ) {
      return 'NONE';
    }
    if (Math.abs(bx - this.x) > DRUM_HIT_RADIUS_X) {
      return 'NONE';
    }

    this.remainingHp -= damage;
    this.flashTimer = 1.0;

    if (this.remainingHp <= 0) {
      this.remainingHp = 0;
      this.broken = true;
      this.active = false;
      this.root.visible = false;
      return 'SHATTERED';
    }

    this.hpLabelTex.redrawIfDirty(this.remainingHp, 1.0);
    return 'HIT';
  }

  public checkUnbrokenSquadBump(squadX: number, squadZ: number, squadRadius: number): boolean {
    if (!this.active || this.broken) {
      return false;
    }
    if (
      Math.abs(squadZ - this.z) < 0.92 + squadRadius * 0.25 &&
      Math.abs(squadX - this.x) < 1.12 + squadRadius * 0.55
    ) {
      this.broken = true;
      this.active = false;
      this.root.visible = false;
      return true;
    }
    return false;
  }
}
