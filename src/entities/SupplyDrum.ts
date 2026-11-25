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

export const DRUM_HIT_RADIUS_X = 1.72;
export const ROLLING_BARREL_DEFAULT_SPEED = 3.2;
export const ROLLING_BARREL_WAKE_DIST_Z = 48.0;
export const ROLLING_BARREL_CRASH_HALF_X = 1.28;
const BARREL_VISUAL_SCALE = 1.24;
const BARREL_ROLL_RADIUS = 1.24;

export function obstacleLaneToX(lane: ObstacleLane): number {
  switch (lane) {
    case 'LEFT':
      return -3.85;
    case 'RIGHT':
      return 3.85;
    case 'LEFT_MID':
      return -1.92;
    case 'RIGHT_MID':
      return 1.92;
    case 'CENTER':
    default:
      return 0;
  }
}

/**
 * Pure v8.0 Rolling Barrel Attrition Formula:
 * Colliding with an unbroken rolling barrel deals squad attrition damage (NEVER instant run defeat
 * for squads > 1!) scaled gently by the barrel's remaining HP ratio, while dodged barrels roll
 * harmlessly past your flank.
 */
export function computeRollingBarrelAttrition(
  logicalSquad: number,
  remainingHp: number,
  initialHp: number
): number {
  if (logicalSquad <= 0) {
    return 0;
  }
  const hpRatio = Math.max(0.25, Math.min(1.0, remainingHp / Math.max(1, initialHp)));
  const rawAttrition = Math.max(1, Math.min(5, Math.ceil(logicalSquad * 0.22 * (0.55 + 0.45 * hpRatio))));
  if (logicalSquad > 1) {
    // Guarantee attrition rather than instant run wipe on multi-soldier squads
    return Math.min(logicalSquad - 1, rawAttrition);
  }
  return 1;
}

export interface BarrelSquadCollisionEvent {
  readonly losses: number;
  readonly x: number;
  readonly z: number;
}

function createFallbackTexture(): THREE.Texture {
  const data = new Uint8Array([255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 1, 1);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Ribbed Titanium-Armor Rolling Barrel Texture with high-contrast circumferential stripes & rivets
 * so local X-axis rolling motion reads unmistakably on mobile screens!
 */
function createRollingBarrelTexture(): THREE.Texture {
  if (typeof document === 'undefined') {
    return createFallbackTexture();
  }
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#2a3c54');
  grad.addColorStop(0.20, '#46607e');
  grad.addColorStop(0.50, '#6280a2');
  grad.addColorStop(0.80, '#46607e');
  grad.addColorStop(1, '#2a3c54');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // 8 circumferential ribbed barrel staves + alternating high-contrast warning chevrons so spin pops!
  const panelCount = 8;
  const panelW = 256 / panelCount;
  for (let i = 0; i < panelCount; i++) {
    const x = i * panelW;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(215, 240, 255, 0.16)' : 'rgba(10, 18, 30, 0.22)';
    ctx.fillRect(x, 0, panelW, 256);

    // Dark axial stave groove
    ctx.fillStyle = 'rgba(8, 14, 24, 0.82)';
    ctx.fillRect(x, 0, 4, 256);

    // Glowing cyan/gold rolling marker bands (alternating every stave for crisp spin visibility)
    ctx.fillStyle = i % 2 === 0 ? 'rgba(64, 248, 224, 0.72)' : 'rgba(255, 206, 68, 0.68)';
    ctx.fillRect(x + 7, 118, panelW - 12, 20);

    // Corner rivets
    ctx.fillStyle = 'rgba(220, 240, 255, 0.72)';
    ctx.fillRect(x + 8, 36, 5, 5);
    ctx.fillRect(x + panelW - 12, 36, 5, 5);
    ctx.fillRect(x + 8, 214, 5, 5);
    ctx.fillRect(x + panelW - 12, 214, 5, 5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * 12-Sided Ribbed Rolling Barrel Geometries (exports preserved as SHARED_BARREL_GEOS
 * for drop-in SplitCausewayController compatibility).
 */
function createRollingBarrelGeometries(): {
  bodyGeo: THREE.BufferGeometry;
  outlineGeo: THREE.BufferGeometry;
} {
  const buildBarrel = (inflate: number): THREE.BufferGeometry => {
    const pts: THREE.Vector2[] = [
      new THREE.Vector2(0.0, -1.16 - inflate),
      new THREE.Vector2(0.76 + inflate, -1.16 - inflate),
      new THREE.Vector2(0.95 + inflate, -0.96 - inflate * 0.35),
      new THREE.Vector2(0.98 + inflate, -0.42),
      new THREE.Vector2(1.03 + inflate, 0.0),
      new THREE.Vector2(0.98 + inflate, 0.42),
      new THREE.Vector2(0.95 + inflate, 0.96 + inflate * 0.35),
      new THREE.Vector2(0.76 + inflate, 1.16 + inflate),
      new THREE.Vector2(0.0, 1.16 + inflate),
    ];
    const geo = new THREE.LatheGeometry(pts, 12);
    geo.rotateZ(Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  };

  return {
    bodyGeo: buildBarrel(0),
    outlineGeo: buildBarrel(0.056),
  };
}

function createPlasmaHaloTexture(): THREE.Texture {
  if (typeof document === 'undefined') {
    return createFallbackTexture();
  }
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

export const SHARED_DRUM_TEX = createRollingBarrelTexture();
export const SHARED_BARREL_GEOS = createRollingBarrelGeometries();
export const SHARED_GLOW_TEX = createPlasmaHaloTexture();
export const SHARED_HOOP_GEO = (() => {
  const g = new THREE.CylinderGeometry(1.03, 1.03, 0.22, 12, 1, true);
  g.rotateZ(Math.PI / 2);
  return g;
})();

export class SupplyDrumSlot {
  public readonly entityId: number;
  public readonly root = new THREE.Group();
  public active = false;
  public broken = false;
  public x = 0;
  public z = 0;
  public rollSpeed = ROLLING_BARREL_DEFAULT_SPEED;
  public rollAngleX = 0;
  public isRolling = false;
  public initialHp = 25;
  public remainingHp = 25;
  public rewardType: DrumRewardType = 'COINS';
  public rewardValue = 20;

  private skinTheme: SkinThemeId = 'UNICORN';
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

    // Grounded contact shadow beneath rolling barrel
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.74, 10),
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
      roughness: 0.36,
      metalness: 0.34,
      emissive: 0x000000,
    });
    this.hoopMat = new THREE.MeshStandardMaterial({
      color: 0x8aa4bf,
      roughness: 0.28,
      metalness: 0.48,
      emissive: 0x000000,
    });

    // Center drumBodyGroup at y = 1.26 (1.24x scale) so local X-axis rotation rolls flush on the viaduct deck!
    this.drumBodyGroup.position.set(0, 1.26, 0);
    this.drumBodyGroup.scale.setScalar(BARREL_VISUAL_SCALE);

    const podMesh = new THREE.Mesh(SHARED_BARREL_GEOS.bodyGeo, this.drumMat);
    this.drumBodyGroup.add(podMesh);

    for (const hoopX of [-0.68, 0.68]) {
      const hoop = new THREE.Mesh(SHARED_HOOP_GEO, this.hoopMat);
      hoop.position.set(hoopX, 0, 0);
      this.drumBodyGroup.add(hoop);
    }

    const outlineMesh = new THREE.Mesh(
      SHARED_BARREL_GEOS.outlineGeo,
      new THREE.MeshBasicMaterial({ color: 0x070c14, side: THREE.BackSide })
    );
    this.drumBodyGroup.add(outlineMesh);

    this.root.add(this.drumBodyGroup);

    // Chamfered Dark-Glass Tactical HUD HP Plaque (stays upright on front face while barrel spins!)
    this.hpLabelTex = new EditableArcadeHpTexture();
    this.hpLabelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.68, 1.56),
      new THREE.MeshBasicMaterial({
        map: this.hpLabelTex.texture,
        transparent: true,
        depthWrite: false,
      })
    );
    this.hpLabelMesh.position.set(0, 1.26, 1.40);
    this.root.add(this.hpLabelMesh);

    // Perched Top Reward Pivot (stays upright above rolling barrel!)
    this.pickupPivot.position.set(0, 3.08, 0);
    this.root.add(this.pickupPivot);

    this.glowHaloMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.15, 2.15),
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
        rig.root.scale.setScalar(1.75);
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
    this.rollSpeed = def.rollSpeed ?? ROLLING_BARREL_DEFAULT_SPEED;
    this.rollAngleX = 0;
    this.isRolling = false;
    this.initialHp = Math.max(1, def.hp);
    this.remainingHp = this.initialHp;
    this.rewardType = def.rewardType;
    this.rewardValue = def.rewardValue;
    this.flashTimer = 0;
    this.flashCooldown = 0;
    this.spinAngle = Math.abs(this.x * 0.45 + this.z * 0.08);

    this.root.position.set(this.x, 0, this.z);
    this.root.visible = true;
    this.drumBodyGroup.rotation.x = 0;
    this.drumBodyGroup.scale.setScalar(BARREL_VISUAL_SCALE);
    this.drumMat.emissive.setRGB(0, 0, 0);
    this.hoopMat.emissive.setRGB(0, 0, 0);

    this.syncSkinVisuals();
    this.hpLabelTex.redrawIfDirty(this.remainingHp, 0);
  }

  public hide(): void {
    this.active = false;
    this.broken = true;
    this.isRolling = false;
    this.root.visible = false;
  }

  public update(
    dt: number,
    squadZ: number,
    blockingGateZ: number | null = null,
    combatActive = true
  ): void {
    if (!this.active || this.broken) {
      return;
    }
    if (squadZ - this.z > 128 && squadZ >= this.z) {
      this.root.visible = false;
      this.isRolling = false;
      return;
    }
    this.root.visible = true;

    // Dodged rolling barrel rolled harmlessly past the player's flank -> sink & recycle cleanly
    if (this.z > squadZ + 11.5) {
      this.root.position.y -= dt * 16.0;
      if (this.root.position.y <= -3.5 || this.z > squadZ + 14.5) {
        this.hide();
      }
      return;
    }

    // Roll down-lane (+Z) toward the squad while rotating around local X-axis (respecting uncollected gates!)
    const blockedByGate = blockingGateZ !== null && this.z <= blockingGateZ + 1.5;
    const maxAllowedZ = blockingGateZ !== null ? blockingGateZ - 14.0 : Infinity;
    const distAhead = squadZ - this.z;
    const shouldRoll = combatActive && !blockedByGate && distAhead <= ROLLING_BARREL_WAKE_DIST_Z;
    this.isRolling = shouldRoll;

    if (shouldRoll && dt > 0 && this.rollSpeed > 0) {
      const nextZ = Math.min(maxAllowedZ, this.z + this.rollSpeed * dt);
      const deltaZ = Math.max(0, nextZ - this.z);
      this.z = nextZ;
      this.root.position.z = this.z;
      // Exact no-slip rolling rotation around local X-axis (+X rotation rolls forward toward +Z!)
      this.rollAngleX += deltaZ / BARREL_ROLL_RADIUS;
      this.drumBodyGroup.rotation.x = this.rollAngleX;
    }

    this.spinAngle += dt * 2.4;
    const bobY = Math.sin(this.spinAngle * 1.5) * 0.08;
    this.pickupPivot.position.y = 3.10 + bobY;
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
      this.flashTimer = Math.max(0, this.flashTimer - dt * 14.0);
      this.drumMat.emissive.setRGB(this.flashTimer * 0.42, this.flashTimer * 0.42, this.flashTimer * 0.46);
      this.hoopMat.emissive.setRGB(this.flashTimer * 0.42, this.flashTimer * 0.36, this.flashTimer * 0.25);
      const pop = 1 + this.flashTimer * 0.05;
      this.drumBodyGroup.scale.set(
        BARREL_VISUAL_SCALE * pop,
        BARREL_VISUAL_SCALE * (1 - this.flashTimer * 0.03),
        BARREL_VISUAL_SCALE * pop
      );
    } else {
      this.drumMat.emissive.setRGB(0, 0, 0);
      this.hoopMat.emissive.setRGB(0, 0, 0);
      this.drumBodyGroup.scale.setScalar(BARREL_VISUAL_SCALE);
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
    const minZ = Math.min(bz, prevBz) - 1.15;
    const maxZ = Math.max(bz, prevBz) + 1.15;
    if (this.z < minZ || this.z > maxZ) {
      return 'NONE';
    }
    if (Math.abs(bx - this.x) > DRUM_HIT_RADIUS_X) {
      return 'NONE';
    }

    this.remainingHp -= damage;
    if (this.flashCooldown <= 0) {
      this.flashTimer = 1.0;
      this.flashCooldown = 0.12;
    }

    if (this.remainingHp <= 0) {
      this.remainingHp = 0;
      this.broken = true;
      this.active = false;
      this.isRolling = false;
      this.root.visible = false;
      return 'SHATTERED';
    }

    this.hpLabelTex.redrawIfDirty(this.remainingHp, this.flashTimer);
    return 'HIT';
  }

  /**
   * Resolves squad collision against an unbroken rolling barrel:
   * - Direct lane hit deals squad attrition damage & bursts the barrel (no reward granted).
   * - Dodging laterally (`|squadX - x| >= ROLLING_BARREL_CRASH_HALF_X`) lets it roll harmlessly past your flank!
   */
  public resolveSquadCollision(
    squadX: number,
    squadZ: number,
    logicalSquad: number
  ): BarrelSquadCollisionEvent | null {
    if (!this.active || this.broken || logicalSquad <= 0) {
      return null;
    }
    const dz = squadZ - this.z;
    if (dz < -0.95 || dz > 1.05) {
      return null;
    }
    if (Math.abs(squadX - this.x) >= ROLLING_BARREL_CRASH_HALF_X) {
      return null;
    }

    const losses = computeRollingBarrelAttrition(
      logicalSquad,
      this.remainingHp,
      this.initialHp
    );
    const hitX = this.x;
    const hitZ = this.z;
    this.broken = true;
    this.active = false;
    this.isRolling = false;
    this.root.visible = false;
    return { losses, x: hitX, z: hitZ };
  }
}
