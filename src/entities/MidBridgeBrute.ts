import * as THREE from 'three';
import type { MidBridgeBruteDefinition, SkinThemeId } from '../core/types';
import { computeSquadOuterRadius } from '../math/formationMath';
import { formatObstacleHp } from '../math/progressionMath';
import { attachWeldedOutlineNormals } from '../rendering/ProceduralGeometries';

const BRUTE_ENTITY_ID = 777;
const DUEL_HALT_DIST_Z = 8.4;
const ENGAGE_WAKE_DIST_Z = 34.0;
const CLUB_WINDUP_DURATION = 0.80;
const CLUB_RECOVER_DURATION = 0.36;
const CLUB_COOLDOWN_DURATION = 0.72;
const CLUB_SMASH_RADIUS_X = 1.84;

export interface BruteClubSmashEvent {
  readonly impactX: number;
  readonly impactZ: number;
  readonly playerLosses: number;
}

function traceChamferRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cut: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + w - cut, y);
  ctx.lineTo(x + w, y + cut);
  ctx.lineTo(x + w, y + h - cut);
  ctx.lineTo(x + w - cut, y + h);
  ctx.lineTo(x + cut, y + h);
  ctx.lineTo(x, y + h - cut);
  ctx.lineTo(x, y + cut);
  ctx.closePath();
}

function createBruteOutlineMaterial(): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({
    color: 0x070b12,
    side: THREE.BackSide,
  });
  mat.customProgramCacheKey = () => 'brute-goliath-outline-v70';
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        attribute vec3 aOutlineNormal;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          vec3 safeNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeNorm * 0.032;
        }`
      );
  };
  return mat;
}

const _sharedBruteOutlineMat = createBruteOutlineMaterial();

function attachBruteCelOutlines(root: THREE.Group): void {
  const targets: THREE.Mesh[] = [];
  root.traverse((obj) => {
    if (
      obj instanceof THREE.Mesh &&
      obj.material instanceof THREE.MeshStandardMaterial &&
      !obj.userData.isBruteOutline
    ) {
      targets.push(obj);
    }
  });

  for (let i = 0; i < targets.length; i++) {
    const mesh = targets[i];
    const geo = mesh.geometry as THREE.BufferGeometry;
    if (!geo.attributes.aOutlineNormal) {
      if (!geo.attributes.normal) {
        geo.computeVertexNormals();
      }
      attachWeldedOutlineNormals(geo);
    }
    const outline = new THREE.Mesh(geo, _sharedBruteOutlineMat);
    outline.userData.isBruteOutline = true;
    mesh.add(outline);
  }
}

class EditableBruteChestBarTexture {
  public readonly canvas: HTMLCanvasElement;
  public readonly ctx: CanvasRenderingContext2D;
  public readonly texture: THREE.CanvasTexture;
  private lastSig = '';

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 144;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('2D canvas context unavailable');
    }
    this.ctx = ctx;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
  }

  public redrawIfDirty(hp: number, maxHp: number, hitFlash: number): void {
    const shown = Math.max(0, Math.ceil(hp));
    const ratioBucket = Math.max(0, Math.min(100, Math.round((shown / Math.max(1, maxHp)) * 100)));
    const flashFlag = hitFlash > 0.28 ? 1 : 0;
    const sig = `${shown}:${ratioBucket}:${flashFlag}`;
    if (sig === this.lastSig) {
      return;
    }
    this.lastSig = sig;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    const barX = 28;
    const barY = 36;
    const barW = w - 56;
    const barH = 72;

    // Chamfered Obsidian-Glass Tactical HP Frame (zero cartoon roundRect pill!)
    traceChamferRect(ctx, barX - 6, barY - 6, barW + 12, barH + 12, 18);
    ctx.fillStyle = '#060b14';
    ctx.fill();

    traceChamferRect(ctx, barX, barY, barW, barH, 14);
    ctx.fillStyle = 'rgba(14, 22, 36, 0.95)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = flashFlag ? '#ffd86b' : '#ff3366';
    ctx.stroke();

    const fillW = Math.max(0, Math.round((barW - 10) * (ratioBucket / 100)));
    if (fillW > 6) {
      ctx.save();
      traceChamferRect(ctx, barX + 5, barY + 5, barW - 10, barH - 10, 10);
      ctx.clip();

      const grad = ctx.createLinearGradient(0, barY, 0, barY + barH);
      grad.addColorStop(0, flashFlag ? '#ffe082' : '#ff5277');
      grad.addColorStop(0.55, flashFlag ? '#ff9f2e' : '#e01e50');
      grad.addColorStop(1, '#9c0f38');
      ctx.fillStyle = grad;
      ctx.fillRect(barX + 5, barY + 5, fillW, barH - 10);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
      ctx.fillRect(barX + 8, barY + 7, Math.max(0, fillW - 8), 12);
      ctx.restore();
    }

    const label = formatObstacleHp(shown);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 68px "Segoe UI", Roboto, system-ui, sans-serif';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 3;
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#050912';
    ctx.strokeText(label, w / 2, barY + barH / 2 + 2);
    ctx.fillStyle = '#f6fcff';
    ctx.fillText(label, w / 2, barY + barH / 2 + 2);

    this.texture.needsUpdate = true;
  }
}

/**
 * Towering Syndicate Siege Goliath Mecha (`~3.55m` tall):
 * - Hulking obsidian-violet & royal-crimson heavy mecha chassis (zero olive-green, zero bare skin!)
 * - Faceted 6-sided horned siege battle-helm + molten-amber chest reactor core
 * - Twin-Bladed Plasma Breaching Greataxe with faster Punishing Tactical windup (`0.80s`) & wake (`34m`)!
 */
export class MidBridgeBrute {
  public readonly entityId: number;
  public readonly root = new THREE.Group();
  public active = false;
  public defeated = false;
  public x = 0;
  public z = 0;
  public maxHp = 6500;
  public hp = 6500;
  public speed = 2.05;
  public clubDamage = 9;
  public coinReward = 450;
  public name = 'SIEGE GOLIATH';

  private skinTheme: SkinThemeId = 'TACTICAL';
  private readonly bodyRig = new THREE.Group();
  private readonly tacticalParts: THREE.Object3D[] = [];
  private readonly unicornParts: THREE.Object3D[] = [];
  private readonly leftLegPivot = new THREE.Group();
  private readonly rightLegPivot = new THREE.Group();
  private readonly clubArmPivot = new THREE.Group();
  private readonly leftArmPivot = new THREE.Group();
  private readonly uniMountPivot = new THREE.Group();
  private readonly uniFrontLeftLeg = new THREE.Group();
  private readonly uniFrontRightLeg = new THREE.Group();
  private readonly uniRearLeftLeg = new THREE.Group();
  private readonly uniRearRightLeg = new THREE.Group();
  private readonly uniNeckHeadPivot = new THREE.Group();
  private readonly dangerZoneGroup = new THREE.Group();
  private readonly dangerFillMat: THREE.MeshBasicMaterial;
  private readonly dangerTimingDisc: THREE.Mesh;
  private readonly dangerTimingMat: THREE.MeshBasicMaterial;
  private readonly dangerRingMat: THREE.MeshBasicMaterial;
  private readonly chestBarMesh: THREE.Mesh;
  private readonly chestBarTex = new EditableBruteChestBarTexture();
  private readonly flashMaterials: THREE.MeshStandardMaterial[] = [];

  private stridePhase = 0;
  private hitFlash = 0;
  private hitFlashCooldown = 0;
  private attackState: 'COOLDOWN' | 'WINDUP' | 'RECOVER' = 'COOLDOWN';
  private stateTimer = 0.7;
  private lockedSmashX = 0;

  constructor(slotIndex = 0) {
    this.entityId = BRUTE_ENTITY_ID + slotIndex;
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.82, 8),
      new THREE.MeshBasicMaterial({
        color: 0x05080d,
        transparent: true,
        opacity: 0.58,
        depthWrite: false,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, 0.024, 0.05);
    this.root.add(shadow);

    const crimsonMechaMat = new THREE.MeshStandardMaterial({
      color: 0xdc1e56,
      roughness: 0.28,
      metalness: 0.34,
      emissive: 0x240410,
    });
    const obsidianVioletMat = new THREE.MeshStandardMaterial({
      color: 0x251d3a,
      roughness: 0.38,
      metalness: 0.38,
    });
    const titaniumArmorMat = new THREE.MeshStandardMaterial({
      color: 0x5c7491,
      roughness: 0.32,
      metalness: 0.44,
    });
    const voltGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffb428,
      roughness: 0.26,
      metalness: 0.42,
    });
    const darkIronMat = new THREE.MeshStandardMaterial({
      color: 0x141926,
      roughness: 0.34,
      metalness: 0.46,
    });
    const plasmaBladeMat = new THREE.MeshStandardMaterial({
      color: 0xff3b6b,
      emissive: 0xd91648,
      emissiveIntensity: 1.45,
      roughness: 0.20,
      metalness: 0.30,
    });
    const visorGlowMat = new THREE.MeshBasicMaterial({ color: 0xffbe32 });

    // Giant Armored War-Unicorn materials (Pearl equine coat + Royal-Blue & Kelly-Green Boy-Team barding + Gold horn)
    const uniCoatMat = new THREE.MeshStandardMaterial({
      color: 0xf2f7ff,
      roughness: 0.34,
      metalness: 0.10,
    });
    const boyBlueMat = new THREE.MeshStandardMaterial({
      color: 0x1a66ff,
      roughness: 0.30,
      metalness: 0.24,
    });
    const boyGreenMat = new THREE.MeshStandardMaterial({
      color: 0x1ecb52,
      roughness: 0.30,
      metalness: 0.24,
    });
    const uniGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffd238,
      emissive: 0x4a3000,
      roughness: 0.22,
      metalness: 0.44,
    });
    const uniHornGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfff6b8,
      emissive: 0xffc838,
      emissiveIntensity: 0.65,
      roughness: 0.18,
      metalness: 0.32,
    });
    const uniEyeGlowMat = new THREE.MeshBasicMaterial({ color: 0x28ff9a });

    this.flashMaterials.push(
      obsidianVioletMat,
      titaniumArmorMat,
      voltGoldMat,
      uniCoatMat,
      boyBlueMat,
      boyGreenMat,
      uniGoldMat
    );

    // --- HEAVY FACETED MECHA LEGS (TACTICAL ONLY) ---
    for (const [sideSign, legPivot] of [
      [-1, this.leftLegPivot],
      [1, this.rightLegPivot],
    ] as const) {
      legPivot.position.set(sideSign * 0.48, 1.18, 0);

      const tacLeg = new THREE.Group();
      const thigh = new THREE.Mesh(
        new THREE.BoxGeometry(0.50, 0.68, 0.52),
        obsidianVioletMat
      );
      thigh.position.set(0, -0.34, 0);

      const kneeSpike = new THREE.Mesh(
        new THREE.ConeGeometry(0.26, 0.44, 4),
        crimsonMechaMat
      );
      kneeSpike.rotation.x = Math.PI / 2;
      kneeSpike.position.set(0, -0.58, 0.28);

      const shin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.24, 0.58, 6),
        crimsonMechaMat
      );
      shin.position.set(0, -0.86, 0);

      const boot = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.30, 0.78),
        darkIronMat
      );
      boot.position.set(0, -1.05, 0.12);
      tacLeg.add(thigh, kneeSpike, shin, boot);
      this.tacticalParts.push(tacLeg);

      legPivot.add(tacLeg);
      this.bodyRig.add(legPivot);
    }

    // --- HULKING MECHA TORSO, REACTOR CORE & HORNED HELM (TACTICAL) ---
    const tacticalTorsoGroup = new THREE.Group();
    const pelvis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.70, 0.60, 0.44, 6),
      darkIronMat
    );
    pelvis.scale.set(1.18, 1, 0.90);
    pelvis.position.set(0, 1.28, 0);
    tacticalTorsoGroup.add(pelvis);

    const beltCore = new THREE.Mesh(
      new THREE.BoxGeometry(0.50, 0.22, 0.20),
      voltGoldMat
    );
    beltCore.position.set(0, 1.32, 0.58);
    tacticalTorsoGroup.add(beltCore);

    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.98, 0.70, 1.26, 6),
      obsidianVioletMat
    );
    torso.scale.set(1.24, 1, 0.90);
    torso.position.set(0, 2.02, 0);
    tacticalTorsoGroup.add(torso);

    const siegeChestPlate = new THREE.Mesh(
      new THREE.BoxGeometry(1.62, 0.94, 0.64),
      crimsonMechaMat
    );
    siegeChestPlate.position.set(0, 2.08, 0.24);
    tacticalTorsoGroup.add(siegeChestPlate);

    const chestReactor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.14, 6),
      visorGlowMat
    );
    chestReactor.rotation.x = Math.PI / 2;
    chestReactor.position.set(0, 2.38, 0.56);
    tacticalTorsoGroup.add(chestReactor);

    for (const sideSign of [-1, 1]) {
      const pauldron = new THREE.Mesh(
        new THREE.BoxGeometry(0.84, 0.64, 0.88),
        obsidianVioletMat
      );
      pauldron.rotation.z = -sideSign * 0.20;
      pauldron.position.set(sideSign * 1.22, 2.48, 0.04);
      tacticalTorsoGroup.add(pauldron);

      const pauldronTrim = new THREE.Mesh(
        new THREE.BoxGeometry(0.88, 0.14, 0.92),
        crimsonMechaMat
      );
      pauldronTrim.rotation.z = -sideSign * 0.20;
      pauldronTrim.position.set(sideSign * 1.24, 2.76, 0.04);
      tacticalTorsoGroup.add(pauldronTrim);

      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.52, 5),
        titaniumArmorMat
      );
      spike.rotation.z = -sideSign * 0.42;
      spike.position.set(sideSign * 1.42, 3.04, 0.04);
      tacticalTorsoGroup.add(spike);
    }

    const blastCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.66, 0.76, 0.28, 6),
      darkIronMat
    );
    blastCollar.position.set(0, 2.66, 0.06);
    tacticalTorsoGroup.add(blastCollar);

    const helmShell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.56, 0.68, 0.68, 6),
      crimsonMechaMat
    );
    helmShell.scale.set(1.08, 1.0, 1.12);
    helmShell.position.set(0, 3.04, 0.06);
    tacticalTorsoGroup.add(helmShell);

    const helmCrest = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.28, 0.88),
      titaniumArmorMat
    );
    helmCrest.position.set(0, 3.42, 0.04);
    tacticalTorsoGroup.add(helmCrest);

    for (const sideSign of [-1, 1]) {
      const horn = new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.78, 5),
        titaniumArmorMat
      );
      horn.rotation.z = -sideSign * 0.52;
      horn.rotation.x = -0.18;
      horn.position.set(sideSign * 0.68, 3.48, -0.02);
      tacticalTorsoGroup.add(horn);
    }

    const visorSlit = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.16, 0.20),
      visorGlowMat
    );
    visorSlit.position.set(0, 2.98, 0.66);
    tacticalTorsoGroup.add(visorSlit);

    this.tacticalParts.push(tacticalTorsoGroup);
    this.bodyRig.add(tacticalTorsoGroup);

    // --- LEFT & RIGHT ARMS FOR TACTICAL SIEGE GOLIATH ---
    this.leftArmPivot.position.set(-1.28, 2.38, 0.06);
    const tacLeftArm = new THREE.Group();
    const lUpper = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.66, 0.42),
      titaniumArmorMat
    );
    lUpper.position.set(-0.12, -0.34, 0.12);
    lUpper.rotation.x = -0.38;
    const lGauntlet = new THREE.Mesh(
      new THREE.BoxGeometry(0.50, 0.58, 0.52),
      obsidianVioletMat
    );
    lGauntlet.position.set(-0.16, -0.78, 0.38);
    lGauntlet.rotation.x = -0.55;
    tacLeftArm.add(lUpper, lGauntlet);
    this.tacticalParts.push(tacLeftArm);
    this.leftArmPivot.add(tacLeftArm);
    this.bodyRig.add(this.leftArmPivot);

    this.clubArmPivot.position.set(1.28, 2.42, 0.08);
    const tacClubArm = new THREE.Group();
    const rUpper = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.68, 0.44),
      titaniumArmorMat
    );
    rUpper.position.set(0.14, -0.32, 0.16);
    rUpper.rotation.x = -0.45;

    const rGauntlet = new THREE.Mesh(
      new THREE.BoxGeometry(0.50, 0.54, 0.50),
      crimsonMechaMat
    );
    rGauntlet.position.set(0.18, -0.74, 0.46);
    rGauntlet.rotation.x = -0.65;

    const axeGroup = new THREE.Group();
    axeGroup.position.set(0.18, -0.82, 0.64);
    axeGroup.rotation.x = 0.88;

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.085, 2.55, 6),
      darkIronMat
    );
    shaft.position.set(0, 1.02, 0);
    axeGroup.add(shaft);

    const gripWrap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.115, 0.115, 0.58, 6),
      voltGoldMat
    );
    gripWrap.position.set(0, 0.15, 0);
    axeGroup.add(gripWrap);

    const axeHub = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.68, 0.42),
      obsidianVioletMat
    );
    axeHub.position.set(0, 1.88, 0);
    axeGroup.add(axeHub);

    for (const zSign of [-1, 1]) {
      const bladeBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.88, 0.58),
        titaniumArmorMat
      );
      bladeBack.position.set(0, 1.88, zSign * 0.42);
      axeGroup.add(bladeBack);

      const plasmaEdge = new THREE.Mesh(
        new THREE.ConeGeometry(0.56, 0.52, 4),
        plasmaBladeMat
      );
      plasmaEdge.scale.set(0.18, 1.0, 1.25);
      plasmaEdge.rotation.x = zSign * (Math.PI / 2);
      plasmaEdge.position.set(0, 1.88, zSign * 0.78);
      axeGroup.add(plasmaEdge);
    }

    const topSpike = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.46, 5),
      voltGoldMat
    );
    topSpike.position.set(0, 2.46, 0);
    axeGroup.add(topSpike);

    tacClubArm.add(rUpper, rGauntlet, axeGroup);
    this.tacticalParts.push(tacClubArm);
    this.clubArmPivot.add(tacClubArm);
    this.bodyRig.add(this.clubArmPivot);

    // --- GIANT ARMORED WAR-UNICORN MID-BOSS (~3.95m TALL, ROYAL-BLUE & KELLY-GREEN BOY-TEAM BARDING) ---
    // Slight 3/4 heroic equine body stance (`0.22 rad`) with counter-turned horned head so all 4 legs,
    // barrel body, saddle barding, sweeping tail, arched neck, horse snout & spiral horn read unmistakably!
    this.uniMountPivot.position.set(0, 0, -0.25);
    this.uniMountPivot.rotation.y = 0.22;

    const buildEquineLeg = (isLeft: boolean, isFront: boolean): THREE.Group => {
      const leg = new THREE.Group();
      const upperMat = isFront ? uniCoatMat : uniCoatMat;
      const thighCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.21, 0.68, 8),
        upperMat
      );
      thighCyl.position.set(0, -0.32, 0);

      const kneeGuard = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.22, 0),
        isLeft ? boyBlueMat : boyGreenMat
      );
      kneeGuard.scale.set(1.0, 0.9, 1.1);
      kneeGuard.position.set(0, -0.66, 0.08);

      const cannonCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.15, 0.56, 8),
        uniCoatMat
      );
      cannonCyl.position.set(0, -0.96, 0.02);

      const fetlockBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.21, 0.14, 8),
        isLeft ? boyGreenMat : boyBlueMat
      );
      fetlockBand.position.set(0, -1.20, 0.03);

      const hoof = new THREE.Mesh(
        new THREE.CylinderGeometry(0.21, 0.26, 0.22, 8),
        uniGoldMat
      );
      hoof.position.set(0, -1.35, 0.06);

      leg.add(thighCyl, kneeGuard, cannonCyl, fetlockBand, hoof);
      return leg;
    };

    const legConfigs: readonly [THREE.Group, number, number, boolean, boolean][] = [
      [this.uniFrontLeftLeg, -0.46, 0.72, true, true],
      [this.uniFrontRightLeg, 0.46, 0.72, false, true],
      [this.uniRearLeftLeg, -0.48, -0.68, true, false],
      [this.uniRearRightLeg, 0.48, -0.68, false, false],
    ];
    for (const [pivot, lx, lz, isL, isF] of legConfigs) {
      pivot.position.set(lx, 1.46, lz);
      pivot.add(buildEquineLeg(isL, isF));
      this.uniMountPivot.add(pivot);
    }

    // Muscular Pearl-Alabaster Equine Barrel Body + Chest + Hindquarters
    const horseBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.72, 0.68, 1.65, 10),
      uniCoatMat
    );
    horseBarrel.rotation.x = Math.PI / 2;
    horseBarrel.scale.set(1.06, 1.0, 0.96);
    horseBarrel.position.set(0, 1.64, 0.02);
    this.uniMountPivot.add(horseBarrel);

    const horseChest = new THREE.Mesh(
      new THREE.SphereGeometry(0.76, 10, 8),
      uniCoatMat
    );
    horseChest.scale.set(1.06, 1.04, 0.92);
    horseChest.position.set(0, 1.72, 0.68);
    this.uniMountPivot.add(horseChest);

    const horseCroup = new THREE.Mesh(
      new THREE.SphereGeometry(0.70, 10, 8),
      uniCoatMat
    );
    horseCroup.scale.set(1.04, 0.98, 0.95);
    horseCroup.position.set(0, 1.68, -0.68);
    this.uniMountPivot.add(horseCroup);

    // Royal-Blue & Kelly-Green Armored Saddle Blanket, Breastplate & Gold Trim
    const saddleBlanket = new THREE.Mesh(
      new THREE.BoxGeometry(1.58, 0.66, 1.18),
      boyBlueMat
    );
    saddleBlanket.position.set(0, 1.84, -0.02);
    this.uniMountPivot.add(saddleBlanket);

    const saddleTrim = new THREE.Mesh(
      new THREE.BoxGeometry(1.64, 0.14, 1.24),
      uniGoldMat
    );
    saddleTrim.position.set(0, 1.54, -0.02);
    this.uniMountPivot.add(saddleTrim);

    const saddleSeat = new THREE.Mesh(
      new THREE.BoxGeometry(1.04, 0.26, 0.78),
      boyGreenMat
    );
    saddleSeat.position.set(0, 2.22, -0.04);
    this.uniMountPivot.add(saddleSeat);

    const breastBarding = new THREE.Mesh(
      new THREE.CylinderGeometry(0.80, 0.76, 0.56, 8, 1, false, -Math.PI * 0.45, Math.PI * 0.9),
      boyGreenMat
    );
    breastBarding.position.set(0, 1.74, 0.70);
    this.uniMountPivot.add(breastBarding);

    const chestGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.24, 0),
      uniGoldMat
    );
    chestGem.position.set(0, 1.78, 1.48);
    this.uniMountPivot.add(chestGem);

    for (const sideSign of [-1, 1]) {
      const flankShield = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.36, 0.16, 6),
        sideSign < 0 ? boyGreenMat : boyBlueMat
      );
      flankShield.rotation.z = Math.PI / 2;
      flankShield.position.set(sideSign * 0.80, 1.72, 0.52);
      this.uniMountPivot.add(flankShield);
    }

    // Sweeping Multi-Plume Royal-Blue & Kelly-Green Tail (flared slightly outward so visible from front!)
    const tailGroup = new THREE.Group();
    tailGroup.position.set(-0.18, 1.78, -1.28);
    tailGroup.rotation.set(-0.42, -0.35, 0.18);
    const tailMats = [boyBlueMat, boyGreenMat, uniGoldMat];
    for (let t = 0; t < 3; t++) {
      const plume = new THREE.Mesh(
        new THREE.ConeGeometry(0.28 - t * 0.04, 1.15, 7),
        tailMats[t]
      );
      plume.rotation.x = Math.PI * 0.72 + t * 0.12;
      plume.position.set(-t * 0.10, -0.26 - t * 0.18, -0.32 - t * 0.16);
      tailGroup.add(plume);
    }
    this.uniMountPivot.add(tailGroup);

    // Towering Arched Equine Neck + Horse Head + Flowing Mane + Giant Spiral War-Horn!
    this.uniNeckHeadPivot.position.set(0, 2.02, 0.78);
    this.uniNeckHeadPivot.rotation.y = -0.20;

    const neckColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.54, 1.12, 8),
      uniCoatMat
    );
    neckColumn.rotation.x = 0.28;
    neckColumn.position.set(0, 0.48, 0.12);
    this.uniNeckHeadPivot.add(neckColumn);

    const neckArmorCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.11, 6, 12),
      boyBlueMat
    );
    neckArmorCollar.rotation.x = Math.PI / 2 + 0.28;
    neckArmorCollar.position.set(0, 0.16, 0.05);
    this.uniNeckHeadPivot.add(neckArmorCollar);

    // Flowing 5-Tuft Blue/Green/Gold War-Mane along the arched crest
    const maneMats = [boyBlueMat, boyGreenMat, uniGoldMat, boyBlueMat, boyGreenMat];
    for (let m = 0; m < 5; m++) {
      const tuft = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.52, 5),
        maneMats[m]
      );
      tuft.rotation.x = -0.78;
      tuft.rotation.z = (m % 2 === 0 ? 1 : -1) * 0.16;
      tuft.position.set(0, 0.22 + m * 0.22, -0.22 + m * 0.05);
      this.uniNeckHeadPivot.add(tuft);
    }

    // Sculpted Horse Cranium + Elongated Equine Snout/Muzzle + Jaw + Chamfron Faceplate
    const headSkull = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 10, 8),
      uniCoatMat
    );
    headSkull.scale.set(0.92, 0.96, 1.12);
    headSkull.position.set(0, 1.06, 0.30);
    this.uniNeckHeadPivot.add(headSkull);

    const horseMuzzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.35, 0.72, 8),
      uniCoatMat
    );
    horseMuzzle.rotation.x = Math.PI / 2 + 0.34;
    horseMuzzle.position.set(0, 0.90, 0.78);
    this.uniNeckHeadPivot.add(horseMuzzle);

    const noseTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      uniCoatMat
    );
    noseTip.scale.set(1.02, 0.85, 0.90);
    noseTip.position.set(0, 0.78, 1.08);
    this.uniNeckHeadPivot.add(noseTip);

    // Royal-Blue & Gold Armored Forehead Chamfron
    const chamfron = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.16, 0.68),
      boyBlueMat
    );
    chamfron.rotation.x = 0.34;
    chamfron.position.set(0, 1.16, 0.62);
    this.uniNeckHeadPivot.add(chamfron);

    // Twin Pointed Equine Ears + Glowing Emerald Eyes
    for (const sideSign of [-1, 1]) {
      const ear = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 0.44, 5),
        uniCoatMat
      );
      ear.rotation.z = -sideSign * 0.28;
      ear.rotation.x = -0.14;
      ear.position.set(sideSign * 0.28, 1.48, 0.18);
      this.uniNeckHeadPivot.add(ear);

      const earInner = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.30, 4),
        sideSign < 0 ? boyBlueMat : boyGreenMat
      );
      earInner.rotation.z = -sideSign * 0.28;
      earInner.rotation.x = -0.14;
      earInner.position.set(sideSign * 0.28, 1.46, 0.22);
      this.uniNeckHeadPivot.add(earInner);

      const eye = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.16),
        uniEyeGlowMat
      );
      eye.position.set(sideSign * 0.38, 1.12, 0.48);
      this.uniNeckHeadPivot.add(eye);
    }

    // Colossal 1.50m Spiraling Golden-Prismatic Unicorn War-Horn!
    const hornBaseCrown = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.06, 6, 10),
      boyGreenMat
    );
    hornBaseCrown.rotation.x = Math.PI / 2 - 0.62;
    hornBaseCrown.position.set(0, 1.34, 0.56);
    this.uniNeckHeadPivot.add(hornBaseCrown);

    const warHorn = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 1.52, 8),
      uniHornGlowMat
    );
    warHorn.rotation.x = 0.68;
    warHorn.position.set(0, 1.88, 0.98);
    this.uniNeckHeadPivot.add(warHorn);

    for (let r = 0; r < 4; r++) {
      const t = r / 4;
      const spiralBand = new THREE.Mesh(
        new THREE.TorusGeometry(0.16 * (1 - t * 0.68), 0.034, 6, 10),
        r % 2 === 0 ? boyBlueMat : boyGreenMat
      );
      spiralBand.rotation.x = Math.PI / 2 - 0.68;
      spiralBand.position.set(0, 1.44 + r * 0.26, 0.64 + r * 0.21);
      this.uniNeckHeadPivot.add(spiralBand);
    }

    this.uniMountPivot.add(this.uniNeckHeadPivot);
    this.unicornParts.push(this.uniMountPivot);
    this.bodyRig.add(this.uniMountPivot);

    attachBruteCelOutlines(this.bodyRig);
    this.syncSkinRigVisibility();
    this.root.add(this.bodyRig);

    // --- WORLD-SPACE CHAMFERED TACTICAL CHEST HP BAR ---
    this.chestBarMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.75, 0.78),
      new THREE.MeshBasicMaterial({
        map: this.chestBarTex.texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      })
    );
    this.chestBarMesh.renderOrder = 12;
    this.chestBarMesh.position.set(0, 1.92, 0.96);
    this.root.add(this.chestBarMesh);

    // --- TELEGRAPHED HEXAGONAL PLASMA AXE / UNICORN HOOF-SLAM ZONE ---
    this.dangerFillMat = new THREE.MeshBasicMaterial({
      color: 0xff245c,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const dangerDisc = new THREE.Mesh(
      new THREE.CircleGeometry(CLUB_SMASH_RADIUS_X, 6),
      this.dangerFillMat
    );
    dangerDisc.rotation.x = -Math.PI / 2;
    dangerDisc.position.y = 0.034;

    this.dangerTimingMat = new THREE.MeshBasicMaterial({
      color: 0xff6238,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
    });
    this.dangerTimingDisc = new THREE.Mesh(
      new THREE.CircleGeometry(CLUB_SMASH_RADIUS_X - 0.12, 6),
      this.dangerTimingMat
    );
    dangerTimingDiscSetPos(this.dangerTimingDisc);

    this.dangerRingMat = new THREE.MeshBasicMaterial({
      color: 0xffb830,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const dangerRing = new THREE.Mesh(
      new THREE.RingGeometry(CLUB_SMASH_RADIUS_X - 0.16, CLUB_SMASH_RADIUS_X, 6),
      this.dangerRingMat
    );
    dangerRing.rotation.x = -Math.PI / 2;
    dangerRing.position.y = 0.039;

    this.dangerZoneGroup.add(dangerDisc, this.dangerTimingDisc, dangerRing);
    this.dangerZoneGroup.visible = false;
    this.root.add(this.dangerZoneGroup);

    this.root.visible = false;
  }

  public setSkinTheme(theme: SkinThemeId): void {
    if (this.skinTheme === theme) {
      return;
    }
    this.skinTheme = theme;
    this.syncSkinRigVisibility();
  }

  private syncSkinRigVisibility(): void {
    const isUnicorn = this.skinTheme === 'UNICORN';
    for (let i = 0; i < this.tacticalParts.length; i++) {
      this.tacticalParts[i].visible = !isUnicorn;
    }
    for (let i = 0; i < this.unicornParts.length; i++) {
      this.unicornParts[i].visible = isUnicorn;
    }
    if (this.dangerFillMat) {
      this.dangerFillMat.color.setHex(isUnicorn ? 0x1a6eff : 0xff245c);
      this.dangerTimingMat.color.setHex(isUnicorn ? 0x1ecb52 : 0xff6238);
      this.dangerRingMat.color.setHex(isUnicorn ? 0xffe048 : 0xffb830);
    }
  }

  public configure(def: MidBridgeBruteDefinition | undefined, initialX = 0): void {
    if (!def) {
      this.hide();
      return;
    }
    this.active = true;
    this.defeated = false;
    this.name = def.name;
    this.x = initialX;
    this.z = def.z;
    this.maxHp = Math.max(100, def.maxHp);
    this.hp = this.maxHp;
    this.speed = def.speed;
    this.clubDamage = Math.max(2, def.clubDamage);
    this.coinReward = def.coinReward;
    this.stridePhase = 0;
    this.hitFlash = 0;
    this.hitFlashCooldown = 0;
    this.attackState = 'COOLDOWN';
    this.stateTimer = 0.35;
    this.lockedSmashX = initialX;

    this.root.position.set(this.x, 0, this.z);
    this.root.visible = true;
    this.dangerZoneGroup.visible = false;
    this.bodyRig.rotation.set(0, 0, 0);
    this.clubArmPivot.rotation.set(0, 0, 0);
    this.uniMountPivot.position.set(0, 0, -0.25);
    this.uniMountPivot.rotation.set(0, 0.22, 0);
    this.chestBarTex.redrawIfDirty(this.hp, this.maxHp, 0);
  }

  public hide(): void {
    this.active = false;
    this.hp = 0;
    this.root.visible = false;
    this.dangerZoneGroup.visible = false;
  }

  public isHaltingMarch(squadZ: number): boolean {
    if (!this.active || this.defeated || this.hp <= 0) {
      return false;
    }
    const distZ = squadZ - this.z;
    return distZ <= DUEL_HALT_DIST_Z && distZ > -2.5;
  }

  public update(
    dt: number,
    squadX: number,
    squadZ: number,
    playerLogicalSquad: number,
    dividerTipZ?: number
  ): BruteClubSmashEvent | null {
    if (!this.active || this.defeated || this.hp <= 0) {
      return null;
    }

    const distZ = squadZ - this.z;
    if (distZ > 115) {
      this.root.visible = false;
      return null;
    }
    this.root.visible = true;

    if (this.hitFlashCooldown > 0) {
      this.hitFlashCooldown = Math.max(0, this.hitFlashCooldown - dt);
    }

    if (this.hitFlash > 0) {
      this.hitFlash = Math.max(0, this.hitFlash - dt * 10.0);
      const em = this.hitFlash * 0.24;
      for (let i = 0; i < this.flashMaterials.length; i++) {
        this.flashMaterials[i].emissive.setRGB(em * 0.5, em * 0.88, em);
      }
    } else {
      for (let i = 0; i < this.flashMaterials.length; i++) {
        this.flashMaterials[i].emissive.setRGB(0, 0, 0);
      }
    }

    const insideRightCorridor = dividerTipZ !== undefined && this.z <= dividerTipZ + 0.55;
    const minAllowedX = insideRightCorridor ? 1.48 : -3.15;
    const maxAllowedX = insideRightCorridor ? 3.42 : 3.15;
    const effectiveDuelDist = dividerTipZ !== undefined ? 6.3 : DUEL_HALT_DIST_Z;
    const lateralPursueSpeed = dividerTipZ !== undefined && !insideRightCorridor ? 3.35 : 1.95;

    const engaged = dividerTipZ !== undefined ? distZ < 105 : distZ < ENGAGE_WAKE_DIST_Z;
    const inDuelRange = distZ <= effectiveDuelDist + 0.35 && distZ > -2.5;
    let smashEvent: BruteClubSmashEvent | null = null;
    let targetBodyYaw = 0;
    let rearPitch = 0;
    let rearLiftY = 0;

    if (engaged && !inDuelRange && distZ > effectiveDuelDist) {
      this.z += this.speed * dt;
      this.stridePhase += dt * (dividerTipZ !== undefined ? 7.6 : 6.4);
      const desiredX = Math.max(minAllowedX, Math.min(maxAllowedX, squadX));
      const dx = desiredX - this.x;
      this.x = Math.max(
        minAllowedX,
        Math.min(maxAllowedX, this.x + Math.sign(dx) * Math.min(Math.abs(dx), lateralPursueSpeed * dt))
      );
      targetBodyYaw = Math.max(-0.28, Math.min(0.28, Math.atan2(dx, Math.max(3.5, distZ))));
    } else if (inDuelRange) {
      this.stridePhase += dt * 3.8;

      if (this.attackState === 'COOLDOWN') {
        this.dangerZoneGroup.visible = false;
        const desiredX = Math.max(minAllowedX, Math.min(maxAllowedX, squadX));
        const dx = desiredX - this.x;
        const duelLateral = dividerTipZ !== undefined ? 3.45 : 2.65;
        this.x = Math.max(
          minAllowedX,
          Math.min(maxAllowedX, this.x + Math.sign(dx) * Math.min(Math.abs(dx), duelLateral * dt))
        );
        targetBodyYaw = Math.max(-0.34, Math.min(0.34, Math.atan2(dx, Math.max(2.4, distZ))));
        this.clubArmPivot.rotation.x += (0 - this.clubArmPivot.rotation.x) * Math.min(1, dt * 9);
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.attackState = 'WINDUP';
          this.stateTimer = CLUB_WINDUP_DURATION;
          this.lockedSmashX = Math.max(-3.35, Math.min(3.35, squadX));
        }
      } else if (this.attackState === 'WINDUP') {
        const progress = 1 - this.stateTimer / CLUB_WINDUP_DURATION;
        if (progress < 0.36) {
          const desiredX = Math.max(minAllowedX, Math.min(maxAllowedX, squadX));
          const dx = desiredX - this.x;
          this.x = Math.max(
            minAllowedX,
            Math.min(maxAllowedX, this.x + Math.sign(dx) * Math.min(Math.abs(dx), 1.95 * dt))
          );
          this.lockedSmashX = Math.max(-3.35, Math.min(3.35, this.x + (squadX - this.x) * 0.58));
        }

        const aimDx = this.lockedSmashX - this.x;
        targetBodyYaw = Math.max(-0.52, Math.min(0.52, Math.atan2(aimDx, Math.max(2.2, distZ))));

        this.clubArmPivot.rotation.x = progress * 1.24;
        this.clubArmPivot.rotation.z = -progress * 0.18;
        rearPitch = -progress * 0.54;
        rearLiftY = progress * 0.42;

        this.dangerZoneGroup.visible = true;
        this.dangerZoneGroup.position.set(
          aimDx,
          0,
          Math.max(2.2, distZ - 0.35)
        );
        const pulse = 0.65 + 0.35 * Math.sin(progress * Math.PI * 6);
        const timingScale = 0.14 + Math.max(0, Math.min(1, progress)) * 0.86;
        this.dangerTimingDisc.scale.set(timingScale, timingScale, 1);
        this.dangerTimingMat.opacity = 0.26 + progress * 0.38;
        this.dangerFillMat.opacity = 0.16 + progress * 0.18;
        this.dangerRingMat.opacity = 0.72 + pulse * 0.28;

        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.clubArmPivot.rotation.x = -1.35;
          this.clubArmPivot.rotation.z = 0.08;
          this.dangerZoneGroup.visible = false;
          this.attackState = 'RECOVER';
          this.stateTimer = CLUB_RECOVER_DURATION;

          const impactWorldX = this.lockedSmashX;
          const impactWorldZ = squadZ - 0.25;
          const squadHalfW = computeSquadOuterRadius(playerLogicalSquad);
          const hitSquad =
            playerLogicalSquad > 0 &&
            Math.abs(squadX - impactWorldX) < CLUB_SMASH_RADIUS_X + squadHalfW * 0.24;

          smashEvent = {
            impactX: impactWorldX,
            impactZ: impactWorldZ,
            playerLosses: hitSquad ? Math.min(playerLogicalSquad, this.clubDamage) : 0,
          };
        }
      } else {
        const aimDx = this.lockedSmashX - this.x;
        targetBodyYaw = Math.max(-0.52, Math.min(0.52, Math.atan2(aimDx, Math.max(2.2, distZ))));
        this.stateTimer -= dt;
        const recT = 1 - Math.max(0, this.stateTimer / CLUB_RECOVER_DURATION);
        this.clubArmPivot.rotation.x = -1.35 * (1 - recT * 0.85);
        this.clubArmPivot.rotation.z = 0.08 * (1 - recT);
        rearPitch = 0.30 * (1 - recT);
        rearLiftY = -0.06 * (1 - recT);
        if (this.stateTimer <= 0) {
          this.attackState = 'COOLDOWN';
          this.stateTimer = CLUB_COOLDOWN_DURATION;
        }
      }
    }

    const legSwing = engaged ? Math.sin(this.stridePhase) * 0.34 : 0;
    this.leftLegPivot.rotation.x = legSwing;
    this.rightLegPivot.rotation.x = -legSwing;
    this.leftArmPivot.rotation.x = -legSwing * 0.45;

    // 4-legged War-Unicorn trot + rearing hoof-pawing during WINDUP + forward horn-slam on RECOVER
    this.uniMountPivot.position.y = rearLiftY;
    this.uniMountPivot.rotation.x = rearPitch;
    if (this.attackState === 'WINDUP') {
      const paw = Math.sin(this.stridePhase * 3.2) * 0.42;
      this.uniFrontLeftLeg.rotation.x = -0.55 + paw;
      this.uniFrontRightLeg.rotation.x = -0.55 - paw;
      this.uniRearLeftLeg.rotation.x = 0.38;
      this.uniRearRightLeg.rotation.x = 0.38;
      this.uniNeckHeadPivot.rotation.x = 0.22;
    } else {
      const trotA = engaged ? Math.sin(this.stridePhase) * 0.36 : 0;
      const trotB = engaged ? Math.sin(this.stridePhase + Math.PI) * 0.36 : 0;
      this.uniFrontLeftLeg.rotation.x = trotA;
      this.uniRearRightLeg.rotation.x = trotA;
      this.uniFrontRightLeg.rotation.x = trotB;
      this.uniRearLeftLeg.rotation.x = trotB;
      this.uniNeckHeadPivot.rotation.x =
        this.attackState === 'RECOVER'
          ? 0.34
          : Math.sin(this.stridePhase * 2.0) * 0.06;
    }

    this.bodyRig.position.y = Math.abs(Math.sin(this.stridePhase)) * 0.09;
    this.bodyRig.rotation.y += (targetBodyYaw - this.bodyRig.rotation.y) * Math.min(1, dt * 10);
    this.bodyRig.rotation.z = Math.sin(this.stridePhase) * 0.035;

    this.root.position.set(this.x, 0, this.z);
    this.chestBarTex.redrawIfDirty(this.hp, this.maxHp, this.hitFlash);

    return smashEvent;
  }

  public tryBulletHit(
    bx: number,
    bz: number,
    prevBz: number,
    damage: number,
    lastHitId: number,
    squadZ?: number,
    maxHitRangeZ = ENGAGE_WAKE_DIST_Z
  ): 'NONE' | 'HIT' | 'DEFEATED' {
    if (!this.active || this.defeated || this.hp <= 0 || lastHitId === this.entityId) {
      return 'NONE';
    }
    if (squadZ !== undefined && squadZ - this.z > maxHitRangeZ) {
      return 'NONE';
    }
    const minZ = Math.min(bz, prevBz) - 1.15;
    const maxZ = Math.max(bz, prevBz) + 1.15;
    if (this.z < minZ || this.z > maxZ) {
      return 'NONE';
    }
    if (Math.abs(bx - this.x) > 1.38) {
      return 'NONE';
    }

    this.hp = Math.max(0, this.hp - damage);
    if (this.hitFlashCooldown <= 0) {
      this.hitFlash = 1.0;
      this.hitFlashCooldown = 0.14;
    }

    if (this.hp <= 0) {
      this.defeated = true;
      this.active = false;
      this.root.visible = false;
      this.dangerZoneGroup.visible = false;
      return 'DEFEATED';
    }

    this.chestBarTex.redrawIfDirty(this.hp, this.maxHp, this.hitFlash);
    return 'HIT';
  }

  public getActiveDangerSmashX(): number | null {
    if (!this.active || this.defeated || this.hp <= 0 || this.attackState !== 'WINDUP') {
      return null;
    }
    return this.lockedSmashX;
  }
}

function dangerTimingDiscSetPos(mesh: THREE.Mesh): void {
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.036;
}
