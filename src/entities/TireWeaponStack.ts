import * as THREE from 'three';
import type { SkinThemeId, TireStackDefinition, WeaponTierId } from '../core/types';
import { getWeaponDisplaySpec } from '../math/weaponMath';
import {
  createStaticWeaponBadgeTexture,
  EditableArcadeHpTexture,
} from '../rendering/CanvasLabelCache';
import { createGoldCoinPickupGroup } from '../rendering/ProceduralGeometries';
import {
  createShowcaseWeaponGroup,
  type ShowcaseWeaponRig,
} from '../rendering/WeaponRigFactory';

const MAX_BARRICADE_TIERS = 5;
const BARRICADE_HIT_RADIUS_X = 1.88;

function createHexBlastArmorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#243448';
  ctx.fillRect(0, 0, 256, 128);

  // Beveled reactive armor cassette blocks + caution chevrons
  for (let x = 0; x < 256; x += 32) {
    ctx.fillStyle = '#3c526e';
    ctx.fillRect(x + 3, 6, 26, 48);
    ctx.fillRect(x + 3, 74, 26, 48);
    ctx.fillStyle = 'rgba(180, 224, 255, 0.38)';
    ctx.fillRect(x + 3, 6, 26, 3);
    ctx.fillRect(x + 3, 74, 26, 3);
  }
  ctx.fillStyle = '#111a26';
  ctx.fillRect(0, 58, 256, 12);
  ctx.fillStyle = '#ffb42e';
  for (let hx = 0; hx < 256; hx += 32) {
    ctx.fillRect(hx + 4, 61, 14, 6);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const _sharedBlastArmorTex = createHexBlastArmorTexture();

/**
 * Modular Hex-Chevron Reactive Blast Barricade (replaces rubber off-road tire stacks while
 * keeping `TireWeaponStackSlot` class signature for drop-in StageData/BridgeBlitzGame compatibility).
 */
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

  private skinTheme: SkinThemeId = 'TACTICAL';
  private readonly tierGroups: THREE.Group[] = [];
  private readonly armorMat: THREE.MeshStandardMaterial;
  private readonly coreGlowMat: THREE.MeshBasicMaterial;
  private readonly holoBeamMat: THREE.MeshBasicMaterial;
  private readonly outerHoloRing: THREE.Mesh;
  private readonly plaqueMesh: THREE.Mesh;
  private readonly plaqueTex: EditableArcadeHpTexture;
  private readonly pickupPivot = new THREE.Group();
  private readonly coinPickupGroup: THREE.Group;
  private readonly weaponRigsByTheme: Record<SkinThemeId, Record<WeaponTierId, ShowcaseWeaponRig>>;
  private readonly badgeMeshesByTheme: Record<SkinThemeId, Record<WeaponTierId, THREE.Mesh>>;
  private flashTimer = 0;
  private flashCooldown = 0;
  private spinAngle = 0;
  private retiring = false;

  constructor(slotIndex: number) {
    this.entityId = 500 + slotIndex;

    this.armorMat = new THREE.MeshStandardMaterial({
      color: 0xd8e8f8,
      map: _sharedBlastArmorTex,
      bumpMap: _sharedBlastArmorTex,
      bumpScale: 0.035,
      roughness: 0.38,
      metalness: 0.42,
      emissive: 0x000000,
    });
    const capSteelMat = new THREE.MeshStandardMaterial({
      color: 0x526a86,
      roughness: 0.30,
      metalness: 0.48,
    });
    this.coreGlowMat = new THREE.MeshBasicMaterial({
      color: 0x24f2d2,
    });
    const outlineMat = new THREE.MeshBasicMaterial({
      color: 0x070b12,
      side: THREE.BackSide,
    });

    // Grounded hexagonal AO shadow beneath blast barricade
    const stackShadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.58, 6),
      new THREE.MeshBasicMaterial({
        color: 0x05080d,
        transparent: true,
        opacity: 0.54,
        depthWrite: false,
      })
    );
    stackShadow.rotation.x = -Math.PI / 2;
    stackShadow.position.set(0, 0.02, 0.08);
    this.root.add(stackShadow);

    // 5-tier stacked 6-sided reactive blast armor cassettes (zero rubber tires!)
    const tierBodyGeo = new THREE.CylinderGeometry(1.18, 1.28, 0.44, 6);
    const tierOutlineGeo = new THREE.CylinderGeometry(1.25, 1.35, 0.50, 6);
    const tierCoreBandGeo = new THREE.CylinderGeometry(1.25, 1.25, 0.08, 6);
    const topDeckCapGeo = new THREE.CylinderGeometry(0.96, 1.12, 0.08, 6);

    for (let i = 0; i < MAX_BARRICADE_TIERS; i++) {
      const layerGroup = new THREE.Group();
      layerGroup.position.set(0, 0.26 + i * 0.49, 0);
      // Slight alternating hex facet lock
      layerGroup.rotation.y = (i % 2) * (Math.PI / 6);

      const casing = new THREE.Mesh(tierBodyGeo, this.armorMat);
      const outline = new THREE.Mesh(tierOutlineGeo, outlineMat);
      const coreBand = new THREE.Mesh(tierCoreBandGeo, this.coreGlowMat);
      const cap = new THREE.Mesh(topDeckCapGeo, capSteelMat);
      cap.position.y = 0.23;
      layerGroup.add(casing, outline, coreBand, cap);

      this.tierGroups.push(layerGroup);
      this.root.add(layerGroup);
    }

    this.plaqueTex = new EditableArcadeHpTexture();
    const plaqueMat = new THREE.MeshBasicMaterial({
      map: this.plaqueTex.texture,
      transparent: true,
      depthWrite: false,
    });
    this.plaqueMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.56, 1.46), plaqueMat);
    this.plaqueMesh.position.set(0, 1.12, 1.44);
    this.root.add(this.plaqueMesh);

    this.root.add(this.pickupPivot);
    this.holoBeamMat = new THREE.MeshBasicMaterial({
      color: 0x28f2d4,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const holoCone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.92, 0.56, 1.05, 6, 1, true),
      this.holoBeamMat
    );
    holoCone.position.set(0, 0.02, 0);
    this.pickupPivot.add(holoCone);

    this.outerHoloRing = new THREE.Mesh(
      new THREE.RingGeometry(0.76, 0.88, 6),
      this.holoBeamMat
    );
    this.outerHoloRing.rotation.x = Math.PI / 2.2;
    this.outerHoloRing.position.set(0, -0.34, 0);
    this.pickupPivot.add(this.outerHoloRing);

    this.coinPickupGroup = createGoldCoinPickupGroup();
    this.pickupPivot.add(this.coinPickupGroup);

    const badgeGeo = new THREE.PlaneGeometry(2.18, 0.64);
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
    this.badgeMeshesByTheme = {
      TACTICAL: buildBadgeSet('TACTICAL'),
      UNICORN: buildBadgeSet('UNICORN'),
    };

    for (const theme of ['TACTICAL', 'UNICORN'] as const) {
      for (const t of [1, 2, 3, 4, 5] as const) {
        const rig = this.weaponRigsByTheme[theme][t];
        rig.root.scale.setScalar(1.58);
        rig.root.rotation.z = 0.14;
        rig.root.visible = false;
        this.pickupPivot.add(rig.root);
        this.badgeMeshesByTheme[theme][t].visible = false;
      }
    }

    this.root.visible = false;
  }

  public setSkinTheme(theme: SkinThemeId): void {
    if (this.skinTheme === theme) {
      return;
    }
    this.skinTheme = theme;
    this.armorMat.color.setHex(theme === 'UNICORN' ? 0xf6caff : 0xd8e8f8);
    if (this.active && !this.broken) {
      this.syncSkinVisuals();
    }
  }

  private syncSkinVisuals(): void {
    const isUnicorn = this.skinTheme === 'UNICORN';
    this.armorMat.color.setHex(isUnicorn ? 0xf6caff : 0xd8e8f8);

    const hasWeapon = this.weaponTier !== null;
    const hasCoin = !hasWeapon && this.coinReward > 0;
    this.pickupPivot.visible = hasWeapon || hasCoin;
    this.coinPickupGroup.visible = hasCoin;

    if (this.weaponTier) {
      const wHex = getWeaponDisplaySpec(this.weaponTier, this.skinTheme).colorHex;
      this.holoBeamMat.color.setHex(wHex);
      this.coreGlowMat.color.setHex(wHex);
    } else {
      this.holoBeamMat.color.setHex(0xffcf48);
      this.coreGlowMat.color.setHex(isUnicorn ? 0xff7ad9 : 0x28f2d4);
    }

    for (const theme of ['TACTICAL', 'UNICORN'] as const) {
      for (const t of [1, 2, 3, 4, 5] as const) {
        const show = theme === this.skinTheme && this.weaponTier === t;
        this.weaponRigsByTheme[theme][t].root.visible = show;
        this.badgeMeshesByTheme[theme][t].visible = false;
      }
    }
  }

  public configure(def: TireStackDefinition): void {
    this.active = true;
    this.broken = false;
    this.retiring = false;
    this.z = def.z;
    this.x = def.lane === 'LEFT' ? -3.88 : def.lane === 'RIGHT' ? 3.88 : 0;
    this.initialBreakCount = Math.max(1, def.breakCount);
    this.remainingBreakCount = this.initialBreakCount;
    this.weaponTier = def.weaponTier ?? null;
    this.coinReward = def.coinReward ?? 45;
    this.flashTimer = 0;
    this.flashCooldown = 0;

    this.root.position.set(this.x, 0, this.z);
    this.root.scale.set(1.18, 1, 1);
    this.root.visible = true;

    this.syncSkinVisuals();

    this.syncStackHeight();
    this.plaqueTex.redrawIfDirty(this.remainingBreakCount, 0);
  }

  public hide(): void {
    this.active = false;
    this.broken = true;
    this.root.visible = false;
  }

  private syncStackHeight(): void {
    const ratio = Math.max(0, this.remainingBreakCount / this.initialBreakCount);
    const totalLayers =
      this.initialBreakCount >= 1200 ? 5 : this.initialBreakCount >= 450 ? 4 : 3;
    const visibleLayers = Math.max(1, Math.ceil(ratio * totalLayers));

    for (let i = 0; i < MAX_BARRICADE_TIERS; i++) {
      this.tierGroups[i].visible = i < visibleLayers;
    }

    const topY = 0.36 + visibleLayers * 0.49;
    this.pickupPivot.position.set(0, topY + 0.72, 0);
    this.plaqueMesh.position.y = Math.max(0.75, topY * 0.52);
  }

  public update(dt: number, squadZ: number): void {
    if (!this.active || this.broken) {
      return;
    }
    if (!this.retiring && squadZ - this.z > 128) {
      this.root.visible = false;
      return;
    }
    this.root.visible = true;
    if (this.retiring || squadZ < this.z - 12.5) {
      this.retiring = true;
      this.root.position.y -= dt * 16.0;
      if (this.root.position.y <= -3.8 || squadZ < this.z - 15.2) {
        this.hide();
      }
      return;
    }
    this.spinAngle += dt * 2.35;
    this.outerHoloRing.rotation.z = -this.spinAngle * 0.85;

    if (this.weaponTier) {
      const activeRig = this.weaponRigsByTheme[this.skinTheme][this.weaponTier];
      if (activeRig.root.visible) {
        activeRig.root.rotation.y = Math.sin(this.spinAngle * 0.85) * 0.28;
        activeRig.root.position.y = 0.10 + Math.sin(this.spinAngle * 1.6) * 0.09;
        if (activeRig.spinCluster) {
          activeRig.spinCluster.rotation.x += dt * 14.0;
        }
      }
    } else if (this.coinPickupGroup.visible) {
      this.coinPickupGroup.rotation.y = Math.sin(this.spinAngle * 1.15) * 0.52;
      this.coinPickupGroup.position.y = Math.sin(this.spinAngle * 1.8) * 0.07;
    }

    if (this.flashCooldown > 0) {
      this.flashCooldown = Math.max(0, this.flashCooldown - dt);
    }

    if (this.flashTimer > 0) {
      this.flashTimer = Math.max(0, this.flashTimer - dt * 10.5);
      const g = this.flashTimer * 0.26;
      this.armorMat.emissive.setRGB(g * 0.45, g * 0.92, g);
    } else {
      this.armorMat.emissive.setRGB(0, 0, 0);
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
    if (Math.abs(bx - this.x) > BARRICADE_HIT_RADIUS_X) {
      return 'NONE';
    }

    this.remainingBreakCount -= damage;
    if (this.flashCooldown <= 0) {
      this.flashTimer = 1.0;
      this.flashCooldown = 0.14;
    }

    if (this.remainingBreakCount <= 0) {
      this.remainingBreakCount = 0;
      this.broken = true;
      this.active = false;
      this.root.visible = false;
      return 'SHATTERED';
    }

    this.syncStackHeight();
    this.plaqueTex.redrawIfDirty(this.remainingBreakCount, this.flashTimer);
    return 'HIT';
  }

  public checkCoreLaneCrash(squadX: number, squadZ: number): boolean {
    if (!this.active || this.broken || this.retiring) {
      return false;
    }
    const dz = squadZ - this.z;
    const inLane =
      this.x < -1
        ? squadX < -2.35
        : this.x > 1
          ? squadX > 2.35
          : Math.abs(squadX) < 1.32;
    return dz > -0.22 && dz < 1.08 && inLane;
  }
}
