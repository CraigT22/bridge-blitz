import * as THREE from 'three';
import type {
  DrumRewardType,
  ObstacleLane,
  SkinThemeId,
  SupplyDrumDefinition,
  WeaponTierId,
} from '../core/types';
import { getWeaponDisplaySpec } from '../math/weaponMath';
import {
  createStaticWeaponBadgeTexture,
  EditableArcadeHpTexture,
} from '../rendering/CanvasLabelCache';
import {
  createGoldCoinPickupGroup,
  createPinkGirlRecruitPickupGroup,
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

/**
 * Brushed Carbon-Titanium Hexagonal Ordnance Pod Armor Texture
 * (replaces oak wooden stave barrel planks while keeping SHARED_DRUM_TEX export).
 */
function createHexOrdnancePodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Brushed metallic titanium-slate gradient from left bulkhead (0) -> center -> right bulkhead (256)
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#2c3d52');
  grad.addColorStop(0.20, '#465d78');
  grad.addColorStop(0.50, '#5a7696');
  grad.addColorStop(0.80, '#465d78');
  grad.addColorStop(1, '#2c3d52');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // 6 armored facet panel seams + flush structural rivets around circumference (U)
  const facetW = 256 / 6;
  for (let i = 0; i < 6; i++) {
    const x = i * facetW;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(180, 224, 255, 0.10)' : 'rgba(12, 20, 32, 0.10)';
    ctx.fillRect(x, 0, facetW, 256);

    // Deep facet seam
    ctx.fillStyle = 'rgba(10, 16, 26, 0.72)';
    ctx.fillRect(x, 0, 4, 256);

    // Glowing cyan plasma seam accent along center of pod
    ctx.fillStyle = 'rgba(64, 248, 224, 0.55)';
    ctx.fillRect(x + 8, 124, facetW - 14, 8);

    // Corner hex bolts
    ctx.fillStyle = 'rgba(204, 232, 255, 0.65)';
    ctx.fillRect(x + 10, 44, 5, 5);
    ctx.fillRect(x + facetW - 14, 44, 5, 5);
    ctx.fillRect(x + 10, 206, 5, 5);
    ctx.fillRect(x + facetW - 14, 206, 5, 5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Faceted 6-Sided Chamfered Hexagonal Ordnance Pod Geometries
 * (replaces round bulged wooden barrel while preserving SHARED_BARREL_GEOS export).
 */
function createHexOrdnancePodGeometries(): {
  bodyGeo: THREE.BufferGeometry;
  outlineGeo: THREE.BufferGeometry;
} {
  const buildHexPod = (inflate: number): THREE.BufferGeometry => {
    const pts: THREE.Vector2[] = [
      new THREE.Vector2(0.0, -1.14 - inflate),
      new THREE.Vector2(0.74 + inflate, -1.14 - inflate),
      new THREE.Vector2(0.96 + inflate, -0.94 - inflate * 0.35),
      new THREE.Vector2(0.99 + inflate, -0.36),
      new THREE.Vector2(1.02 + inflate, 0.0),
      new THREE.Vector2(0.99 + inflate, 0.36),
      new THREE.Vector2(0.96 + inflate, 0.94 + inflate * 0.35),
      new THREE.Vector2(0.74 + inflate, 1.14 + inflate),
      new THREE.Vector2(0.0, 1.14 + inflate),
    ];
    const geo = new THREE.LatheGeometry(pts, 6);
    geo.rotateZ(Math.PI / 2);
    geo.rotateX(Math.PI / 6); // Align crisp flat hex armor face directly toward camera!
    geo.scale(1.0, 1.02, 1.0);
    geo.computeVertexNormals();
    return geo;
  };

  return {
    bodyGeo: buildHexPod(0),
    outlineGeo: buildHexPod(0.056),
  };
}

function createPlasmaHaloTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 128);

  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
  grad.addColorStop(0, 'rgba(235, 255, 255, 0.95)');
  grad.addColorStop(0.42, 'rgba(72, 238, 255, 0.48)');
  grad.addColorStop(1, 'rgba(20, 160, 220, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  // Crisp 6-spoke hexagonal tech reticle behind reward pickup
  ctx.save();
  ctx.translate(64, 64);
  ctx.strokeStyle = 'rgba(220, 252, 255, 0.48)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const rx = Math.cos(ang) * 44;
    const ry = Math.sin(ang) * 44;
    if (i === 0) ctx.moveTo(rx, ry);
    else ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  return new THREE.CanvasTexture(canvas);
}

export const SHARED_DRUM_TEX = createHexOrdnancePodTexture();
export const SHARED_BARREL_GEOS = createHexOrdnancePodGeometries();
export const SHARED_GLOW_TEX = createPlasmaHaloTexture();
export const SHARED_HOOP_GEO = (() => {
  const g = new THREE.CylinderGeometry(1.02, 1.02, 0.22, 6, 1, true);
  g.rotateZ(Math.PI / 2);
  g.rotateX(Math.PI / 6);
  g.scale(1.0, 1.025, 1.005);
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

  private skinTheme: SkinThemeId = 'TACTICAL';
  private readonly drumBodyGroup = new THREE.Group();
  private readonly drumMat: THREE.MeshStandardMaterial;
  private readonly hoopMat: THREE.MeshStandardMaterial;
  private readonly hpLabelMesh: THREE.Mesh;
  private readonly hpLabelTex: EditableArcadeHpTexture;
  private readonly pickupPivot = new THREE.Group();
  private readonly glowHaloMesh: THREE.Mesh;
  private readonly coinGroup: THREE.Group;
  private readonly recruitGroups: Record<SkinThemeId, THREE.Group>;
  private readonly weaponRigsByTheme: Record<SkinThemeId, Record<WeaponTierId, ShowcaseWeaponRig>>;
  private readonly weaponBadgesByTheme: Record<SkinThemeId, Record<WeaponTierId, THREE.Mesh>>;

  private flashTimer = 0;
  private flashCooldown = 0;
  private spinAngle = 0;

  constructor(slotIndex: number) {
    this.entityId = 300 + slotIndex;

    // Grounded hexagonal contact shadow
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.38, 8),
      new THREE.MeshBasicMaterial({
        color: 0x05080d,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, 0.02, 0.08);
    this.root.add(shadow);

    this.drumMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: SHARED_DRUM_TEX,
      roughness: 0.38,
      metalness: 0.36,
      emissive: 0x000000,
    });
    this.hoopMat = new THREE.MeshStandardMaterial({
      color: 0x8aa4bf,
      roughness: 0.28,
      metalness: 0.48,
      emissive: 0x000000,
    });

    // Faceted 6-sided Armored Hexagonal Ordnance Pod + Bolted Titanium Collars + Cel-Outline!
    const podMesh = new THREE.Mesh(SHARED_BARREL_GEOS.bodyGeo, this.drumMat);
    podMesh.position.y = 1.02;
    this.drumBodyGroup.add(podMesh);

    for (const hoopX of [-0.68, 0.68]) {
      const hoop = new THREE.Mesh(SHARED_HOOP_GEO, this.hoopMat);
      hoop.position.set(hoopX, 1.02, 0);
      this.drumBodyGroup.add(hoop);
    }

    const outlineMesh = new THREE.Mesh(
      SHARED_BARREL_GEOS.outlineGeo,
      new THREE.MeshBasicMaterial({ color: 0x070c14, side: THREE.BackSide })
    );
    outlineMesh.position.y = 1.02;
    this.drumBodyGroup.add(outlineMesh);

    this.root.add(this.drumBodyGroup);

    // Chamfered Dark-Glass Tactical HUD HP Plaque on front face
    this.hpLabelTex = new EditableArcadeHpTexture();
    this.hpLabelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.26, 1.32),
      new THREE.MeshBasicMaterial({
        map: this.hpLabelTex.texture,
        transparent: true,
        depthWrite: false,
      })
    );
    this.hpLabelMesh.position.set(0, 1.00, 1.12);
    this.root.add(this.hpLabelMesh);

    // Perched Top Reward Pivot (Octagonal Bullion, 3D Weapon, or Stealth / Pink Unicorn Helm)
    this.pickupPivot.position.set(0, 2.56, 0);
    this.root.add(this.pickupPivot);

    this.glowHaloMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.95, 1.95),
      new THREE.MeshBasicMaterial({
        map: SHARED_GLOW_TEX,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.glowHaloMesh.position.set(0, 0.04, -0.14);
    this.pickupPivot.add(this.glowHaloMesh);

    this.coinGroup = createGoldCoinPickupGroup();
    this.pickupPivot.add(this.coinGroup);

    this.recruitGroups = {
      TACTICAL: createRecruitPickupGroup(),
      UNICORN: createPinkGirlRecruitPickupGroup(),
    };
    this.recruitGroups.TACTICAL.visible = false;
    this.recruitGroups.UNICORN.visible = false;
    this.pickupPivot.add(this.recruitGroups.TACTICAL, this.recruitGroups.UNICORN);

    const badgeGeo = new THREE.PlaneGeometry(2.05, 0.60);
    const buildWeaponSet = (theme: SkinThemeId): Record<WeaponTierId, ShowcaseWeaponRig> => ({
      1: createShowcaseWeaponGroup(1, theme),
      2: createShowcaseWeaponGroup(2, theme),
      3: createShowcaseWeaponGroup(3, theme),
      4: createShowcaseWeaponGroup(4, theme),
      5: createShowcaseWeaponGroup(5, theme),
    });
    const buildBadgeSet = (theme: SkinThemeId): Record<WeaponTierId, THREE.Mesh> => ({
      1: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(1, theme), transparent: true })),
      2: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(2, theme), transparent: true })),
      3: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(3, theme), transparent: true })),
      4: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(4, theme), transparent: true })),
      5: new THREE.Mesh(badgeGeo, new THREE.MeshBasicMaterial({ map: createStaticWeaponBadgeTexture(5, theme), transparent: true })),
    });

    this.weaponRigsByTheme = {
      TACTICAL: buildWeaponSet('TACTICAL'),
      UNICORN: buildWeaponSet('UNICORN'),
    };
    this.weaponBadgesByTheme = {
      TACTICAL: buildBadgeSet('TACTICAL'),
      UNICORN: buildBadgeSet('UNICORN'),
    };

    for (const theme of ['TACTICAL', 'UNICORN'] as const) {
      for (const t of [1, 2, 3, 4, 5] as const) {
        const rig = this.weaponRigsByTheme[theme][t];
        rig.root.scale.setScalar(1.56);
        rig.root.rotation.z = 0.14;
        rig.root.visible = false;
        this.pickupPivot.add(rig.root);
        this.weaponBadgesByTheme[theme][t].visible = false;
      }
    }

    this.root.visible = false;
  }

  public setSkinTheme(theme: SkinThemeId): void {
    if (this.skinTheme === theme) {
      return;
    }
    this.skinTheme = theme;
    if (this.active && !this.broken) {
      this.syncSkinVisuals();
    }
  }

  private syncSkinVisuals(): void {
    const isCoins = this.rewardType === 'COINS';
    const isRecruit = this.rewardType === 'RECRUIT';
    const isWeapon = this.rewardType === 'WEAPON';
    const isUnicorn = this.skinTheme === 'UNICORN';

    // Distinct Armored Hex Pod color-coding (zero oak-wood brown!)
    if (isWeapon) {
      this.drumMat.color.setHex(isUnicorn ? 0xff70c2 : 0xe2567c);
      this.hoopMat.color.setHex(isUnicorn ? 0xffcf40 : 0xffbe3b);
    } else if (isRecruit) {
      this.drumMat.color.setHex(isUnicorn ? 0xff92db : 0x6ceef0);
      this.hoopMat.color.setHex(isUnicorn ? 0xffe4fa : 0x8ec8ff);
    } else {
      this.drumMat.color.setHex(isUnicorn ? 0xdca8ff : 0xa8c6e4);
      this.hoopMat.color.setHex(0xffb830);
    }

    this.coinGroup.visible = isCoins;
    this.recruitGroups.TACTICAL.visible = isRecruit && !isUnicorn;
    this.recruitGroups.UNICORN.visible = isRecruit && isUnicorn;
    this.glowHaloMesh.visible = true;

    const wTier = Math.max(1, Math.min(5, Math.round(this.rewardValue))) as WeaponTierId;
    for (const theme of ['TACTICAL', 'UNICORN'] as const) {
      for (const t of [1, 2, 3, 4, 5] as const) {
        const show = isWeapon && theme === this.skinTheme && t === wTier;
        this.weaponRigsByTheme[theme][t].root.visible = show;
        this.weaponBadgesByTheme[theme][t].visible = false;
      }
    }

    if (isWeapon) {
      (this.glowHaloMesh.material as THREE.MeshBasicMaterial).color.setHex(
        getWeaponDisplaySpec(wTier, this.skinTheme).colorHex
      );
    } else if (isRecruit) {
      (this.glowHaloMesh.material as THREE.MeshBasicMaterial).color.setHex(
        isUnicorn ? 0xff66cc : 0x28f8dc
      );
    } else {
      (this.glowHaloMesh.material as THREE.MeshBasicMaterial).color.setHex(0xffcf48);
    }
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
    this.flashCooldown = 0;
    this.spinAngle = Math.abs(this.x * 0.45 + this.z * 0.08);

    this.root.position.set(this.x, 0, this.z);
    this.root.visible = true;
    this.drumBodyGroup.scale.set(1, 1, 1);
    this.drumMat.emissive.setRGB(0, 0, 0);
    this.hoopMat.emissive.setRGB(0, 0, 0);

    this.syncSkinVisuals();

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
    if (squadZ - this.z > 128 && squadZ >= this.z) {
      this.root.visible = false;
      return;
    }
    this.root.visible = true;
    if (squadZ < this.z - 12.5) {
      this.root.position.y -= dt * 16.0;
      if (this.root.position.y <= -3.5 || squadZ < this.z - 15.2) {
        this.hide();
      }
      return;
    }

    this.spinAngle += dt * 2.4;
    const bobY = Math.sin(this.spinAngle * 1.5) * 0.08;
    this.pickupPivot.position.y = 2.66 + bobY;
    this.glowHaloMesh.rotation.z = this.spinAngle * 0.45;

    const activeRecruitGroup = this.recruitGroups[this.skinTheme];
    if (this.coinGroup.visible) {
      this.coinGroup.rotation.y = Math.sin(this.spinAngle * 1.15) * 0.52;
    } else if (activeRecruitGroup.visible) {
      activeRecruitGroup.rotation.y = Math.sin(this.spinAngle * 0.95) * 0.44;
    } else {
      const wTier = Math.max(1, Math.min(5, Math.round(this.rewardValue))) as WeaponTierId;
      const rig = this.weaponRigsByTheme[this.skinTheme][wTier];
      rig.root.rotation.y = Math.sin(this.spinAngle * 0.85) * 0.28;
      if (rig.spinCluster) {
        rig.spinCluster.rotation.x += dt * 12;
      }
    }

    if (this.flashCooldown > 0) {
      this.flashCooldown = Math.max(0, this.flashCooldown - dt);
    }

    if (this.flashTimer > 0) {
      this.flashTimer = Math.max(0, this.flashTimer - dt * 9.5);
      this.drumMat.emissive.setRGB(this.flashTimer * 0.12, this.flashTimer * 0.42, this.flashTimer * 0.48);
      this.hoopMat.emissive.setRGB(this.flashTimer * 0.36, this.flashTimer * 0.28, 0.05);
      const pop = 1 + this.flashTimer * 0.05;
      this.drumBodyGroup.scale.set(pop, 1 - this.flashTimer * 0.03, pop);
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
    if (this.flashCooldown <= 0) {
      this.flashTimer = 1.0;
      this.flashCooldown = 0.14;
    }

    if (this.remainingHp <= 0) {
      this.remainingHp = 0;
      this.broken = true;
      this.active = false;
      this.root.visible = false;
      return 'SHATTERED';
    }

    this.hpLabelTex.redrawIfDirty(this.remainingHp, this.flashTimer);
    return 'HIT';
  }

  public checkCoreLaneCrash(squadX: number, squadZ: number): boolean {
    if (!this.active || this.broken) {
      return false;
    }
    const dz = squadZ - this.z;
    return dz > -0.20 && dz < 0.92 && Math.abs(squadX - this.x) < 0.92;
  }
}
