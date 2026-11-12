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

  // Warm sunlit oak stave planks along Lathe V (0..256 spans left head -> belly -> right head)
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#755330');
  grad.addColorStop(0.22, '#9c7344');
  grad.addColorStop(0.5, '#b08450');
  grad.addColorStop(0.78, '#9c7344');
  grad.addColorStop(1, '#755330');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle alternating stave plank warmth & dark plank seams around circumference (U)
  for (let i = 0; i < 16; i++) {
    const x = i * 16;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 226, 178, 0.08)' : 'rgba(30, 16, 6, 0.08)';
    ctx.fillRect(x, 0, 16, 256);
    ctx.fillStyle = 'rgba(28, 16, 8, 0.42)';
    ctx.fillRect(x, 0, 2.5, 256);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createBulgedBarrelGeometries(): {
  bodyGeo: THREE.BufferGeometry;
  outlineGeo: THREE.BufferGeometry;
} {
  const buildLathe = (inflate: number): THREE.BufferGeometry => {
    const pts: THREE.Vector2[] = [
      new THREE.Vector2(0.0, -1.12 - inflate),
      new THREE.Vector2(0.76 + inflate, -1.12 - inflate),
      new THREE.Vector2(0.83 + inflate, -1.04 - inflate * 0.4),
    ];
    const steps = 10;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps; // 0..1 from left chime to right chime
      const y = -1.02 + t * 2.04;
      const arch = 1 - Math.pow(t * 2 - 1, 2); // parabolic stave bulge
      const r = 0.84 + arch * 0.21 + inflate;
      pts.push(new THREE.Vector2(r, y));
    }
    pts.push(
      new THREE.Vector2(0.83 + inflate, 1.04 + inflate * 0.4),
      new THREE.Vector2(0.76 + inflate, 1.12 + inflate),
      new THREE.Vector2(0.0, 1.12 + inflate)
    );
    const geo = new THREE.LatheGeometry(pts, 22);
    geo.rotateZ(Math.PI / 2);
    geo.scale(1.0, 1.04, 1.02);
    geo.computeVertexNormals();
    return geo;
  };

  return {
    bodyGeo: buildLathe(0),
    outlineGeo: buildLathe(0.052),
  };
}

function createSunburstGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 128);

  const grad = ctx.createRadialGradient(64, 64, 5, 64, 64, 62);
  grad.addColorStop(0, 'rgba(255, 250, 196, 0.96)');
  grad.addColorStop(0.42, 'rgba(255, 210, 64, 0.52)');
  grad.addColorStop(1, 'rgba(255, 180, 20, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  // Subtle 8-ray starburst flare behind reward pickup
  ctx.save();
  ctx.translate(64, 64);
  ctx.fillStyle = 'rgba(255, 248, 205, 0.36)';
  for (let r = 0; r < 8; r++) {
    ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(0, -58);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  return new THREE.CanvasTexture(canvas);
}

const _sharedDrumTex = createMilitaryDrumTexture();
const _sharedBarrelGeos = createBulgedBarrelGeometries();
const _sharedGlowTex = createSunburstGlowTexture();
const _sharedHoopGeo = (() => {
  const g = new THREE.CylinderGeometry(0.955, 0.955, 0.19, 22, 1, true);
  g.rotateZ(Math.PI / 2);
  g.scale(1.0, 1.045, 1.025);
  return g;
})();

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
  private readonly hoopMat: THREE.MeshStandardMaterial;
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
      new THREE.CircleGeometry(1.36, 20),
      new THREE.MeshBasicMaterial({
        color: 0x05080d,
        transparent: true,
        opacity: 0.44,
        depthWrite: false,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, 0.02, 0.08);
    this.root.add(shadow);

    this.drumMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: _sharedDrumTex,
      roughness: 0.56,
      metalness: 0.14,
      emissive: 0x000000,
    });
    this.hoopMat = new THREE.MeshStandardMaterial({
      color: 0x7c8b9c,
      roughness: 0.34,
      metalness: 0.48,
      emissive: 0x000000,
    });

    // Sculpted bulged stave barrel + raised 3D gunmetal steel hoops + watertight BackSide cel-outline!
    const barrelMesh = new THREE.Mesh(_sharedBarrelGeos.bodyGeo, this.drumMat);
    barrelMesh.position.y = 1.04;
    this.drumBodyGroup.add(barrelMesh);

    for (const hoopX of [-0.66, 0.66]) {
      const hoop = new THREE.Mesh(_sharedHoopGeo, this.hoopMat);
      hoop.position.set(hoopX, 1.04, 0);
      this.drumBodyGroup.add(hoop);
    }

    const outlineMesh = new THREE.Mesh(
      _sharedBarrelGeos.outlineGeo,
      new THREE.MeshBasicMaterial({ color: 0x140d07, side: THREE.BackSide })
    );
    outlineMesh.position.y = 1.04;
    this.drumBodyGroup.add(outlineMesh);

    this.root.add(this.drumBodyGroup);

    // Giant front-facing orange-outlined white HP digits right across the drum belly
    this.hpLabelTex = new EditableArcadeHpTexture();
    this.hpLabelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.28, 1.34),
      new THREE.MeshBasicMaterial({
        map: this.hpLabelTex.texture,
        transparent: true,
        depthWrite: false,
      })
    );
    this.hpLabelMesh.position.set(0, 0.98, 1.14);
    this.root.add(this.hpLabelMesh);

    // Perched Top Reward Pivot (Gold Coin, 3D Weapon, or +1 Recruit Helmet)
    this.pickupPivot.position.set(0, 2.56, 0);
    this.root.add(this.pickupPivot);

    this.glowHaloMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.95, 1.95),
      new THREE.MeshBasicMaterial({
        map: _sharedGlowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.glowHaloMesh.position.set(0, 0.04, -0.14);
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
      rig.root.scale.setScalar(1.28);
      rig.root.rotation.z = 0.18;
      this.pickupPivot.add(rig.root);
      this.weaponBadges[t].position.set(0, 0.90, 0);
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
    this.spinAngle = Math.abs(this.x * 0.45 + this.z * 0.08);

    this.root.position.set(this.x, 0, this.z);
    this.root.visible = true;
    this.drumBodyGroup.scale.set(1, 1, 1);
    this.drumMat.emissive.setRGB(0, 0, 0);
    this.hoopMat.emissive.setRGB(0, 0, 0);

    const isCoins = def.rewardType === 'COINS';
    const isRecruit = def.rewardType === 'RECRUIT';
    const isWeapon = def.rewardType === 'WEAPON';

    // Distinct barrel wood/hoop color-coding so reward value reads at a glance
    if (isWeapon) {
      this.drumMat.color.setHex(0xe87b6e); // Rich crimson-mahogany ordnance barrel
      this.hoopMat.color.setHex(0xd4a24c); // Brass ordnance hoops
    } else if (isRecruit) {
      this.drumMat.color.setHex(0xcbe2f8); // Cool tactical slate-oak barrel
      this.hoopMat.color.setHex(0x4ea4ff); // Cobalt squad-reinforcement hoops
    } else {
      this.drumMat.color.setHex(0xffebd2); // Warm golden-oak War Chest barrel
      this.hoopMat.color.setHex(0x7c8b9c); // Brushed gunmetal hoops
    }

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
      (this.glowHaloMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffe066);
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

    this.spinAngle += dt * 2.4;
    const bobY = Math.sin(this.spinAngle * 1.5) * 0.08;
    this.pickupPivot.position.y = 2.56 + bobY;
    this.glowHaloMesh.rotation.z = this.spinAngle * 0.45;

    if (this.coinGroup.visible) {
      // Oscillate +/- 33 deg toward camera so coin face always gleams and never goes edge-on!
      this.coinGroup.rotation.y = Math.sin(this.spinAngle * 1.15) * 0.58;
    } else if (this.recruitGroup.visible) {
      this.recruitGroup.rotation.y = Math.sin(this.spinAngle * 0.95) * 0.48;
    } else {
      const wTier = Math.max(1, Math.min(5, Math.round(this.rewardValue))) as WeaponTierId;
      const rig = this.weaponRigs[wTier];
      rig.root.rotation.y = Math.sin(this.spinAngle * 0.9) * 0.72;
      if (rig.spinCluster) {
        rig.spinCluster.rotation.x += dt * 12;
      }
    }

    if (this.flashTimer > 0) {
      this.flashTimer = Math.max(0, this.flashTimer - dt * 7.5);
      // Fiery red-orange barrel impact flash + punchy squash pop
      this.drumMat.emissive.setRGB(this.flashTimer * 0.85, this.flashTimer * 0.18, 0.02);
      this.hoopMat.emissive.setRGB(this.flashTimer * 0.45, this.flashTimer * 0.12, 0.01);
      const pop = 1 + this.flashTimer * 0.06;
      this.drumBodyGroup.scale.set(pop, 1 - this.flashTimer * 0.035, pop);
    } else {
      this.drumMat.emissive.setRGB(0, 0, 0);
      this.hoopMat.emissive.setRGB(0, 0, 0);
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
