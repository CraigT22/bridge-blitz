import * as THREE from 'three';
import type { MidBridgeBruteDefinition } from '../core/types';
import { computeSquadOuterRadius } from '../math/formationMath';
import { formatObstacleHp } from '../math/progressionMath';
import { attachWeldedOutlineNormals } from '../rendering/ProceduralGeometries';

const BRUTE_ENTITY_ID = 777;
const DUEL_HALT_DIST_Z = 8.4;
const ENGAGE_WAKE_DIST_Z = 21.5;
const CLUB_WINDUP_DURATION = 1.02;
const CLUB_RECOVER_DURATION = 0.42;
const CLUB_COOLDOWN_DURATION = 1.15;
const CLUB_SMASH_RADIUS_X = 1.72;

export interface BruteClubSmashEvent {
  readonly impactX: number;
  readonly impactZ: number;
  readonly playerLosses: number;
}

function createBruteOutlineMaterial(): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({
    color: 0x080c12,
    side: THREE.BackSide,
  });
  mat.customProgramCacheKey = () => 'brute-goliath-outline-v50';
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
    const barY = 38;
    const barW = w - 56;
    const barH = 68;
    const rad = 22;

    // Outer thick dark cartoon capsule track
    ctx.beginPath();
    ctx.roundRect(barX - 6, barY - 6, barW + 12, barH + 12, rad + 4);
    ctx.fillStyle = '#090e16';
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, rad);
    ctx.fillStyle = 'rgba(22, 30, 42, 0.94)';
    ctx.fill();

    // Vibrant orange fill bar matching reference Goliath HP gauge
    const fillW = Math.max(0, Math.round((barW - 8) * (ratioBucket / 100)));
    if (fillW > 6) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(barX + 4, barY + 4, barW - 8, barH - 8, rad - 4);
      ctx.clip();

      const grad = ctx.createLinearGradient(0, barY, 0, barY + barH);
      grad.addColorStop(0, flashFlag ? '#ffd27d' : '#ffb838');
      grad.addColorStop(0.55, flashFlag ? '#ff9824' : '#ff8412');
      grad.addColorStop(1, '#d95608');
      ctx.fillStyle = grad;
      ctx.fillRect(barX + 4, barY + 4, fillW, barH - 8);

      // Glossy top highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      ctx.fillRect(barX + 8, barY + 7, Math.max(0, fillW - 8), 14);
      ctx.restore();
    }

    // Giant bold white black-outlined HP number centered across chest bar (e.g. 8508 -> 3718)
    const label = formatObstacleHp(shown);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 72px system-ui, -apple-system, sans-serif';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#090e16';
    ctx.strokeText(label, w / 2, barY + barH / 2 + 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, w / 2, barY + barH / 2 + 2);

    this.texture.needsUpdate = true;
  }
}

/**
 * Towering Mid-Bridge Riot Goliath Brute (`~3.45m` tall):
 * - Oversized crimson siege helmet, heavy olive-charcoal riot armor, and spiked breaching maul!
 * - Halts forward squad march at close-quarters range (`8.4m`) while stalking laterally and swinging
 *   telegraphed lane-smashing club blows so players weave left/right while stray shots chip obstacles behind him!
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
  public speed = 1.75;
  public clubDamage = 7;
  public coinReward = 450;
  public name = 'RIOT GOLIATH';

  private readonly bodyRig = new THREE.Group();
  private readonly leftLegPivot = new THREE.Group();
  private readonly rightLegPivot = new THREE.Group();
  private readonly clubArmPivot = new THREE.Group();
  private readonly leftArmPivot = new THREE.Group();
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
  private stateTimer = 1.0;
  private lockedSmashX = 0;

  constructor(slotIndex = 0) {
    this.entityId = BRUTE_ENTITY_ID + slotIndex;
    // Grounded contact shadow under Goliath
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.75, 24),
      new THREE.MeshBasicMaterial({
        color: 0x05080d,
        transparent: true,
        opacity: 0.56,
        depthWrite: false,
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, 0.024, 0.05);
    this.root.add(shadow);

    const crimsonMat = new THREE.MeshStandardMaterial({
      color: 0xe8263d,
      roughness: 0.30,
      metalness: 0.16,
      emissive: 0x260308,
    });
    const armorSlateMat = new THREE.MeshStandardMaterial({
      color: 0x3b4754,
      roughness: 0.42,
      metalness: 0.28,
    });
    const olivePlateMat = new THREE.MeshStandardMaterial({
      color: 0x587834,
      roughness: 0.40,
      metalness: 0.20,
    });
    const skinBrawnMat = new THREE.MeshStandardMaterial({
      color: 0xe2a882,
      roughness: 0.48,
      metalness: 0.08,
    });
    const hazardGoldMat = new THREE.MeshStandardMaterial({
      color: 0xf6b426,
      roughness: 0.30,
      metalness: 0.34,
    });
    const darkIronMat = new THREE.MeshStandardMaterial({
      color: 0x1d242e,
      roughness: 0.36,
      metalness: 0.44,
    });
    const visorGlowMat = new THREE.MeshBasicMaterial({ color: 0xffd04d });

    // Keep crimsonMat helmet/pauldrons rich crimson under sustained crowd fire (comp parity!)
    this.flashMaterials.push(
      armorSlateMat,
      olivePlateMat,
      skinBrawnMat,
      hazardGoldMat
    );

    // --- HEAVY ARTICULATED LEGS ---
    for (const [sideSign, legPivot] of [
      [-1, this.leftLegPivot],
      [1, this.rightLegPivot],
    ] as const) {
      legPivot.position.set(sideSign * 0.46, 1.18, 0);
      const thigh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.28, 0.46, 8, 14),
        armorSlateMat
      );
      thigh.position.set(0, -0.34, 0);

      const kneeGuard = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.32, 0.44),
        crimsonMat
      );
      kneeGuard.position.set(0, -0.58, 0.14);

      const shin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.23, 0.56, 14),
        olivePlateMat
      );
      shin.position.set(0, -0.86, 0);

      const boot = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.30, 0.74),
        darkIronMat
      );
      boot.position.set(0, -1.05, 0.12);

      legPivot.add(thigh, kneeGuard, shin, boot);
      this.bodyRig.add(legPivot);
    }

    // --- HULKING TORSO, RIOT PLATING & PAULDRONS ---
    const pelvis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.58, 0.44, 16),
      darkIronMat
    );
    pelvis.scale.set(1.16, 1, 0.88);
    pelvis.position.set(0, 1.28, 0);
    this.bodyRig.add(pelvis);

    const beltBuckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.22, 0.18),
      hazardGoldMat
    );
    beltBuckle.position.set(0, 1.32, 0.58);
    this.bodyRig.add(beltBuckle);

    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.96, 0.68, 1.24, 18),
      olivePlateMat
    );
    torso.scale.set(1.22, 1, 0.88);
    torso.position.set(0, 2.02, 0);
    this.bodyRig.add(torso);

    const riotChestPlate = new THREE.Mesh(
      new THREE.BoxGeometry(1.56, 0.92, 0.62),
      armorSlateMat
    );
    riotChestPlate.position.set(0, 2.08, 0.24);
    this.bodyRig.add(riotChestPlate);

    for (const sx of [-0.52, 0.52]) {
      const strap = new THREE.Mesh(
        new THREE.BoxGeometry(0.20, 1.02, 0.72),
        hazardGoldMat
      );
      strap.position.set(sx, 2.12, 0.20);
      this.bodyRig.add(strap);
    }

    for (const sideSign of [-1, 1]) {
      const pauldron = new THREE.Mesh(
        new THREE.SphereGeometry(0.54, 16, 12),
        crimsonMat
      );
      pauldron.scale.set(1.12, 0.92, 1.08);
      pauldron.position.set(sideSign * 1.18, 2.48, 0.04);
      this.bodyRig.add(pauldron);

      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 0.34, 8),
        hazardGoldMat
      );
      spike.rotation.z = -sideSign * 0.45;
      spike.position.set(sideSign * 1.36, 2.88, 0.04);
      this.bodyRig.add(spike);
    }

    // --- OVERSIZED GLOSSY CRIMSON RIOT SIEGE HELMET ---
    const blastCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.62, 0.72, 0.26, 16),
      darkIronMat
    );
    blastCollar.position.set(0, 2.66, 0.06);
    this.bodyRig.add(blastCollar);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 18, 14),
      skinBrawnMat
    );
    head.position.set(0, 2.98, 0.08);
    this.bodyRig.add(head);

    const helmetDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.66, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.64),
      crimsonMat
    );
    helmetDome.scale.set(1.10, 1.02, 1.12);
    helmetDome.position.set(0, 3.08, 0.04);
    this.bodyRig.add(helmetDome);

    const helmetBrim = new THREE.Mesh(
      new THREE.TorusGeometry(0.64, 0.085, 10, 22),
      darkIronMat
    );
    helmetBrim.rotation.x = Math.PI / 2 + 0.08;
    helmetBrim.position.set(0, 2.96, 0.06);
    this.bodyRig.add(helmetBrim);

    const visorSlit = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.16, 0.18),
      visorGlowMat
    );
    visorSlit.position.set(0, 2.95, 0.62);
    this.bodyRig.add(visorSlit);

    // --- LEFT BRAWLER FIST ARM ---
    this.leftArmPivot.position.set(-1.26, 2.38, 0.06);
    const lUpper = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.24, 0.46, 8, 12),
      skinBrawnMat
    );
    lUpper.position.set(-0.12, -0.34, 0.12);
    lUpper.rotation.x = -0.38;
    const lGauntlet = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.54, 0.48),
      armorSlateMat
    );
    lGauntlet.position.set(-0.16, -0.78, 0.38);
    lGauntlet.rotation.x = -0.55;
    this.leftArmPivot.add(lUpper, lGauntlet);
    this.bodyRig.add(this.leftArmPivot);

    // --- RIGHT ARTICULATED SPIKED BREACHING MAUL / WAR-CLUB ARM ---
    this.clubArmPivot.position.set(1.28, 2.42, 0.08);
    const rUpper = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.26, 0.48, 8, 12),
      skinBrawnMat
    );
    rUpper.position.set(0.14, -0.32, 0.16);
    rUpper.rotation.x = -0.45;

    const rGauntlet = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.52, 0.48),
      crimsonMat
    );
    rGauntlet.position.set(0.18, -0.74, 0.46);
    rGauntlet.rotation.x = -0.65;

    // Massive Spiked Breaching Maul extending forward/upward from fist
    const clubGroup = new THREE.Group();
    clubGroup.position.set(0.18, -0.82, 0.64);
    clubGroup.rotation.x = 0.88; // Angled menacingly upward at rest

    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.08, 2.35, 12),
      darkIronMat
    );
    shaft.position.set(0, 0.92, 0);
    clubGroup.add(shaft);

    const gripWrap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.58, 12),
      hazardGoldMat
    );
    gripWrap.position.set(0, 0.15, 0);
    clubGroup.add(gripWrap);

    const maulHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.34, 1.05, 8),
      armorSlateMat
    );
    maulHead.position.set(0, 1.72, 0);
    clubGroup.add(maulHead);

    const maulCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.16, 8),
      crimsonMat
    );
    maulCap.position.set(0, 2.20, 0);
    clubGroup.add(maulCap);

    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * Math.PI * 2;
      const stud = new THREE.Mesh(
        new THREE.ConeGeometry(0.10, 0.30, 6),
        hazardGoldMat
      );
      stud.position.set(Math.cos(ang) * 0.46, 1.78, Math.sin(ang) * 0.46);
      stud.rotation.z = -Math.PI / 2;
      stud.rotation.y = -ang;
      clubGroup.add(stud);
    }

    this.clubArmPivot.add(rUpper, rGauntlet, clubGroup);
    this.bodyRig.add(this.clubArmPivot);

    attachBruteCelOutlines(this.bodyRig);
    this.root.add(this.bodyRig);

    // --- WORLD-SPACE CHEST ORANGE HP BAR (e.g. 8508) ---
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

    // --- TELEGRAPHED GROUND CLUB SMASH DANGER ZONE ---
    this.dangerFillMat = new THREE.MeshBasicMaterial({
      color: 0xff2942,
      transparent: true,
      opacity: 0.20,
      depthWrite: false,
    });
    const dangerDisc = new THREE.Mesh(
      new THREE.CircleGeometry(CLUB_SMASH_RADIUS_X, 28),
      this.dangerFillMat
    );
    dangerDisc.rotation.x = -Math.PI / 2;
    dangerDisc.position.y = 0.034;

    this.dangerTimingMat = new THREE.MeshBasicMaterial({
      color: 0xff5a36,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
    this.dangerTimingDisc = new THREE.Mesh(
      new THREE.CircleGeometry(CLUB_SMASH_RADIUS_X - 0.12, 28),
      this.dangerTimingMat
    );
    this.dangerTimingDisc.rotation.x = -Math.PI / 2;
    this.dangerTimingDisc.position.y = 0.036;

    this.dangerRingMat = new THREE.MeshBasicMaterial({
      color: 0xff9438,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const dangerRing = new THREE.Mesh(
      new THREE.RingGeometry(CLUB_SMASH_RADIUS_X - 0.16, CLUB_SMASH_RADIUS_X, 28),
      this.dangerRingMat
    );
    dangerRing.rotation.x = -Math.PI / 2;
    dangerRing.position.y = 0.039;

    this.dangerZoneGroup.add(dangerDisc, this.dangerTimingDisc, dangerRing);
    this.dangerZoneGroup.visible = false;
    this.root.add(this.dangerZoneGroup);

    this.root.visible = false;
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
    this.stateTimer = 0.45;
    this.lockedSmashX = initialX;

    this.root.position.set(this.x, 0, this.z);
    this.root.visible = true;
    this.dangerZoneGroup.visible = false;
    this.bodyRig.rotation.set(0, 0, 0);
    this.clubArmPivot.rotation.set(0, 0, 0);
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
      const em = this.hitFlash * 0.22;
      for (let i = 0; i < this.flashMaterials.length; i++) {
        this.flashMaterials[i].emissive.setRGB(em, em * 0.86, em * 0.74);
      }
    } else {
      for (let i = 0; i < this.flashMaterials.length; i++) {
        this.flashMaterials[i].emissive.setRGB(0, 0, 0);
      }
    }

    const insideRightCorridor = dividerTipZ !== undefined && this.z <= dividerTipZ + 0.55;
    const minAllowedX = insideRightCorridor ? 1.48 : -3.05;
    const maxAllowedX = insideRightCorridor ? 3.42 : 3.05;

    const engaged = dividerTipZ !== undefined ? distZ < 105 : distZ < ENGAGE_WAKE_DIST_Z;
    const inDuelRange = distZ <= DUEL_HALT_DIST_Z + 0.35 && distZ > -2.5;
    let smashEvent: BruteClubSmashEvent | null = null;
    let targetBodyYaw = 0;

    if (engaged && !inDuelRange && distZ > DUEL_HALT_DIST_Z) {
      // Heavy stomping advance toward the squad until close-quarters duel range
      this.z += this.speed * dt;
      this.stridePhase += dt * 5.8;
      const desiredX = Math.max(minAllowedX, Math.min(maxAllowedX, squadX));
      const dx = desiredX - this.x;
      this.x = Math.max(
        minAllowedX,
        Math.min(maxAllowedX, this.x + Math.sign(dx) * Math.min(Math.abs(dx), 1.35 * dt))
      );
      targetBodyYaw = Math.max(-0.28, Math.min(0.28, Math.atan2(dx, Math.max(3.5, distZ))));
    } else if (inDuelRange) {
      this.stridePhase += dt * 3.4;

      if (this.attackState === 'COOLDOWN') {
        this.dangerZoneGroup.visible = false;
        const desiredX = Math.max(minAllowedX, Math.min(maxAllowedX, squadX));
        const dx = desiredX - this.x;
        this.x = Math.max(
          minAllowedX,
          Math.min(maxAllowedX, this.x + Math.sign(dx) * Math.min(Math.abs(dx), 2.15 * dt))
        );
        targetBodyYaw = Math.max(-0.34, Math.min(0.34, Math.atan2(dx, Math.max(2.4, distZ))));
        this.clubArmPivot.rotation.x += (0 - this.clubArmPivot.rotation.x) * Math.min(1, dt * 8);
        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          this.attackState = 'WINDUP';
          this.stateTimer = CLUB_WINDUP_DURATION;
          this.lockedSmashX = Math.max(-3.35, Math.min(3.35, squadX));
        }
      } else if (this.attackState === 'WINDUP') {
        const progress = 1 - this.stateTimer / CLUB_WINDUP_DURATION;
        // Track softly only in first 35% of windup, then lock lane so player can dodge cleanly!
        if (progress < 0.35) {
          const desiredX = Math.max(minAllowedX, Math.min(maxAllowedX, squadX));
          const dx = desiredX - this.x;
          this.x = Math.max(
            minAllowedX,
            Math.min(maxAllowedX, this.x + Math.sign(dx) * Math.min(Math.abs(dx), 1.65 * dt))
          );
          this.lockedSmashX = Math.max(-3.35, Math.min(3.35, this.x + (squadX - this.x) * 0.5));
        }

        const aimDx = this.lockedSmashX - this.x;
        targetBodyYaw = Math.max(-0.52, Math.min(0.52, Math.atan2(aimDx, Math.max(2.2, distZ))));

        // Raise massive spiked club high overhead (`rotation.x` -> +1.18 rad)
        this.clubArmPivot.rotation.x = progress * 1.18;
        this.clubArmPivot.rotation.z = -progress * 0.18;

        this.dangerZoneGroup.visible = true;
        this.dangerZoneGroup.position.set(
          aimDx,
          0,
          Math.max(2.2, distZ - 0.35)
        );
        const pulse = 0.65 + 0.35 * Math.sin(progress * Math.PI * 6);
        const timingScale = 0.14 + Math.max(0, Math.min(1, progress)) * 0.86;
        this.dangerTimingDisc.scale.set(timingScale, timingScale, 1);
        this.dangerTimingMat.opacity = 0.24 + progress * 0.36;
        this.dangerFillMat.opacity = 0.14 + progress * 0.16;
        this.dangerRingMat.opacity = 0.68 + pulse * 0.30;

        this.stateTimer -= dt;
        if (this.stateTimer <= 0) {
          // SLAM DOWN!
          this.clubArmPivot.rotation.x = -1.32;
          this.clubArmPivot.rotation.z = 0.08;
          this.dangerZoneGroup.visible = false;
          this.attackState = 'RECOVER';
          this.stateTimer = CLUB_RECOVER_DURATION;

          const impactWorldX = this.lockedSmashX;
          const impactWorldZ = squadZ - 0.25;
          const squadHalfW = computeSquadOuterRadius(playerLogicalSquad);
          const hitSquad =
            playerLogicalSquad > 0 &&
            Math.abs(squadX - impactWorldX) < CLUB_SMASH_RADIUS_X + squadHalfW * 0.22;

          smashEvent = {
            impactX: impactWorldX,
            impactZ: impactWorldZ,
            playerLosses: hitSquad ? Math.min(playerLogicalSquad, this.clubDamage) : 0,
          };
        }
      } else {
        // RECOVER
        const aimDx = this.lockedSmashX - this.x;
        targetBodyYaw = Math.max(-0.52, Math.min(0.52, Math.atan2(aimDx, Math.max(2.2, distZ))));
        this.stateTimer -= dt;
        const recT = 1 - Math.max(0, this.stateTimer / CLUB_RECOVER_DURATION);
        this.clubArmPivot.rotation.x = -1.32 * (1 - recT * 0.85);
        this.clubArmPivot.rotation.z = 0.08 * (1 - recT);
        if (this.stateTimer <= 0) {
          this.attackState = 'COOLDOWN';
          this.stateTimer = CLUB_COOLDOWN_DURATION;
        }
      }
    }

    // Heavy stomping leg & torso animation + smooth aim yaw toward smash lane
    const legSwing = engaged ? Math.sin(this.stridePhase) * 0.34 : 0;
    this.leftLegPivot.rotation.x = legSwing;
    this.rightLegPivot.rotation.x = -legSwing;
    this.leftArmPivot.rotation.x = -legSwing * 0.45;
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
}
