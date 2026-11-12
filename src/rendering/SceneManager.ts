import * as THREE from 'three';
import type { BossChassisId, BossDefinition, WeaponTierId } from '../core/types';
import { WEAPON_SPECS } from '../math/weaponMath';
import {
  createAllBossChassisRigs,
  type BossChassisRig,
} from './BossRigFactory';
import { createGoldenHourSkyDome } from './ProceduralTextures';
import {
  createShowcaseWeaponGroup,
  type ShowcaseWeaponRig,
} from './WeaponRigFactory';

export type CameraFramingMode =
  | 'HERO_DIORAMA'
  | 'ARMORY_INSPECT'
  | 'RUN_TACTICAL'
  | 'BOSS_TACTICAL';

export interface ScreenProjection {
  x: number;
  y: number;
  visible: boolean;
}

const ARMORY_STAGE_Y = 44;
const ARMORY_STAGE_Z = -12;

const _projVec = new THREE.Vector3();
const _desiredPos = new THREE.Vector3();
const _desiredLook = new THREE.Vector3();

export class SceneManager {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly renderer: THREE.WebGLRenderer;
  private readonly sunLight: THREE.DirectionalLight;
  private readonly rimLight: THREE.DirectionalLight;
  private readonly skyDome: THREE.Mesh;
  private readonly skyUniforms: { uTime: { value: number } };

  // Self-contained 3D Armory Showcase Stage (single-pass forward rendered!)
  private readonly armoryRoot = new THREE.Group();
  private readonly armoryTurntable = new THREE.Group();
  private readonly armoryRingMat: THREE.MeshBasicMaterial;
  private readonly armoryOuterRing: THREE.Mesh;
  private readonly armoryWeapons: Record<WeaponTierId, ShowcaseWeaponRig>;
  private readonly armoryBosses: Record<BossChassisId, BossChassisRig>;
  private armoryMode: 'WEAPONS' | 'BOSSES' = 'WEAPONS';
  private armoryWeaponTier: WeaponTierId = 1;
  private armoryBossChassis: BossChassisId = 'WARDEN_MECH';
  private armoryYaw = -0.45;
  private armoryDragSpinFreeze = 0;

  private shakeTrauma = 0;
  private shakeTime = 0;
  private smoothCamX = 0;
  private elapsedSkyTime = 0;
  private portraitFactor = 0;

  private readonly currentCamPos = new THREE.Vector3(2.1, 2.05, 4.4);
  private readonly currentLookAt = new THREE.Vector3(-0.35, 0.85, -14.0);
  private lastFramingMode: CameraFramingMode = 'HERO_DIORAMA';

  constructor(canvasContainer: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x181924);
    this.scene.fog = new THREE.FogExp2(0x6d4236, 0.0056);

    const initW = Math.max(1, window.innerWidth);
    const initH = Math.max(1, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(47, initW / initH, 0.3, 320);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);

    // Pure single-pass hardware forward WebGLRenderer (zero offscreen HalfFloat FBOs
    // for 100% stability and 90-120 FPS efficiency on Pixel 10 XL / Android WebView GPUs)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'default',
      stencil: false,
      alpha: false,
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(initW, initH);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
    });
    canvasContainer.appendChild(this.renderer.domElement);

    // Golden-Hour Sunset Sky Dome with Mountains & Clouds
    const sky = createGoldenHourSkyDome();
    this.skyDome = sky.mesh;
    this.skyUniforms = sky.uniforms;
    this.scene.add(this.skyDome);

    // 4-Light Golden-Hour Tactical Rig
    const hemi = new THREE.HemisphereLight(0xffcb96, 0x2c384a, 1.38);
    this.scene.add(hemi);

    this.sunLight = new THREE.DirectionalLight(0xffad5e, 2.75);
    this.sunLight.position.set(-19, 17, -24);
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    this.rimLight = new THREE.DirectionalLight(0x74b0ea, 1.45);
    this.rimLight.position.set(18, 13, 18);
    this.scene.add(this.rimLight);
    this.scene.add(this.rimLight.target);

    const frontalFill = new THREE.DirectionalLight(0xffdfb8, 0.62);
    frontalFill.position.set(0, 10, 22);
    this.scene.add(frontalFill);

    // Build 3D Armory Showcase Pedestal & Models
    this.armoryRoot.position.set(0, ARMORY_STAGE_Y, ARMORY_STAGE_Z);
    this.armoryRoot.visible = false;

    const hangarApron = new THREE.Mesh(
      new THREE.CylinderGeometry(5.4, 5.8, 0.34, 36),
      new THREE.MeshStandardMaterial({
        color: 0x141b24,
        roughness: 0.48,
        metalness: 0.42,
      })
    );
    hangarApron.position.set(0, -1.04, -0.4);
    this.armoryRoot.add(hangarApron);

    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.34,
      metalness: 0.46,
    });
    const daisBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.75, 1.98, 0.28, 28),
      daisMat
    );
    daisBase.position.set(0, -0.78, 0);
    this.armoryRoot.add(daisBase);

    const daisInner = new THREE.Mesh(
      new THREE.CylinderGeometry(1.32, 1.44, 0.14, 28),
      new THREE.MeshStandardMaterial({
        color: 0x2f3d50,
        roughness: 0.28,
        metalness: 0.48,
      })
    );
    daisInner.position.set(0, -0.60, 0);
    this.armoryRoot.add(daisInner);

    this.armoryRingMat = new THREE.MeshBasicMaterial({
      color: 0xffd85a,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const outerDeckRing = new THREE.Mesh(
      new THREE.RingGeometry(3.15, 3.24, 36),
      this.armoryRingMat
    );
    outerDeckRing.rotation.x = -Math.PI / 2;
    outerDeckRing.position.set(0, -0.86, -0.2);
    this.armoryRoot.add(outerDeckRing);

    const innerHoloRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.22, 0.032, 8, 32),
      this.armoryRingMat
    );
    innerHoloRing.rotation.x = Math.PI / 2;
    innerHoloRing.position.set(0, -0.50, 0);
    this.armoryRoot.add(innerHoloRing);

    this.armoryOuterRing = new THREE.Mesh(
      new THREE.RingGeometry(1.52, 1.62, 32),
      this.armoryRingMat
    );
    this.armoryOuterRing.rotation.x = -Math.PI / 2;
    this.armoryOuterRing.position.set(0, -0.52, 0);
    this.armoryRoot.add(this.armoryOuterRing);

    const holoShroud = new THREE.Mesh(
      new THREE.CylinderGeometry(1.48, 1.18, 1.35, 24, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x38f6ff,
        transparent: true,
        opacity: 0.09,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    holoShroud.position.set(0, 0.12, 0);
    this.armoryRoot.add(holoShroud);

    this.armoryRoot.add(this.armoryTurntable);

    this.armoryWeapons = {
      1: createShowcaseWeaponGroup(1),
      2: createShowcaseWeaponGroup(2),
      3: createShowcaseWeaponGroup(3),
      4: createShowcaseWeaponGroup(4),
      5: createShowcaseWeaponGroup(5),
    };
    for (const t of [1, 2, 3, 4, 5] as const) {
      const w = this.armoryWeapons[t];
      const scale = t === 1 ? 1.85 : t === 2 ? 1.55 : 1.38;
      w.root.scale.setScalar(scale);
      w.root.position.set(0, 0.18, 0);
      w.root.rotation.z = 0.10;
      this.armoryTurntable.add(w.root);
    }

    this.armoryBosses = createAllBossChassisRigs();
    for (const key of Object.keys(this.armoryBosses) as BossChassisId[]) {
      const b = this.armoryBosses[key];
      const bScale = key === 'SOVEREIGN_TITAN' ? 0.42 : 0.46;
      b.root.scale.setScalar(bScale);
      b.root.position.set(0, -0.52, 0);
      b.root.visible = false;
      this.armoryTurntable.add(b.root);
    }

    this.scene.add(this.armoryRoot);
    this.syncArmoryVisibility();

    this.applyViewportFraming();
    window.addEventListener('resize', this.handleResize);
  }

  private applyViewportFraming(): void {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    const aspect = w / h;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    this.camera.aspect = aspect;

    // Preserve horizontal bridge visibility & thumb clearance on tall ~20:9 phones (Pixel 10 XL 412x915)
    this.portraitFactor = Math.max(0, Math.min(1, (0.95 - aspect) / 0.5));
    this.camera.fov = 47 + this.portraitFactor * 23;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
  }

  private readonly handleResize = (): void => {
    this.applyViewportFraming();
  };

  public configureArmoryWeapon(tier: WeaponTierId): void {
    this.armoryMode = 'WEAPONS';
    this.armoryWeaponTier = tier;
    this.armoryYaw = -0.36;
    this.armoryRingMat.color.setHex(WEAPON_SPECS[tier].colorHex);
    this.syncArmoryVisibility();
  }

  public configureArmoryBoss(def: BossDefinition): void {
    this.armoryMode = 'BOSSES';
    this.armoryBossChassis = def.chassis;
    this.armoryYaw = -0.44;
    const rig = this.armoryBosses[def.chassis];
    rig.primaryMat.color.setHex(def.primaryHex);
    rig.accentMat.color.setHex(def.accentHex);
    rig.trimMat.color.setHex(def.trimHex);
    rig.glowMat.color.setHex(def.trimHex);
    this.armoryRingMat.color.setHex(def.trimHex);
    this.syncArmoryVisibility();
  }

  public rotateArmoryTurntable(deltaRadians: number): void {
    this.armoryYaw += deltaRadians;
    this.armoryDragSpinFreeze = 1.6;
  }

  private syncArmoryVisibility(): void {
    for (const t of [1, 2, 3, 4, 5] as const) {
      this.armoryWeapons[t].root.visible =
        this.armoryMode === 'WEAPONS' && t === this.armoryWeaponTier;
    }
    for (const key of Object.keys(this.armoryBosses) as BossChassisId[]) {
      this.armoryBosses[key].root.visible =
        this.armoryMode === 'BOSSES' && key === this.armoryBossChassis;
    }
  }

  public addShake(intensity: number): void {
    this.shakeTrauma = Math.min(1.0, this.shakeTrauma + intensity);
  }

  public updateCamera(
    dt: number,
    squadX: number,
    squadZ: number,
    framingMode: CameraFramingMode
  ): void {
    this.elapsedSkyTime += dt;
    this.skyUniforms.uTime.value = this.elapsedSkyTime;

    this.shakeTime += dt * 38;
    this.shakeTrauma = Math.max(0, this.shakeTrauma - dt * 2.6);
    const shakeMag = this.shakeTrauma * this.shakeTrauma * 0.52;

    const shakeX = Math.sin(this.shakeTime * 1.13) * shakeMag;
    const shakeY = Math.cos(this.shakeTime * 1.71) * shakeMag * 0.75;

    const p = this.portraitFactor;
    const isArmory = framingMode === 'ARMORY_INSPECT';
    this.armoryRoot.visible = isArmory;

    if (isArmory) {
      if (this.armoryDragSpinFreeze > 0) {
        this.armoryDragSpinFreeze = Math.max(0, this.armoryDragSpinFreeze - dt);
      } else {
        this.armoryYaw += dt * 0.52;
      }
      this.armoryTurntable.rotation.y = this.armoryYaw;
      this.armoryOuterRing.rotation.z = -this.elapsedSkyTime * 0.5;

      // Animate active weapon or boss rig on the turntable!
      if (this.armoryMode === 'WEAPONS') {
        const wRig = this.armoryWeapons[this.armoryWeaponTier];
        wRig.root.position.y = 0.18 + Math.sin(this.elapsedSkyTime * 2.2) * 0.05;
        if (wRig.spinCluster) {
          wRig.spinCluster.rotation.x += dt * 12.0;
        }
      } else {
        const bRig = this.armoryBosses[this.armoryBossChassis];
        for (let s = 0; s < bRig.spinClusters.length; s++) {
          if (this.armoryBossChassis === 'KRAKEN_WALKER') {
            bRig.spinClusters[s].rotation.y += dt * 3.5;
          } else {
            bRig.spinClusters[s].rotation.z += dt * 9.0;
          }
        }
      }

      // Heroic eye-level showcase angle framed cleanly in the Armory viewport window
      _desiredPos.set(0, ARMORY_STAGE_Y + 0.52, ARMORY_STAGE_Z + 4.05 + p * 0.90);
      _desiredLook.set(0, ARMORY_STAGE_Y - 0.16 - p * 0.38, ARMORY_STAGE_Z);
    } else if (framingMode === 'HERO_DIORAMA') {
      // Centered low-angle 3/4 hero orbit framing commandos dead-center above the deploy deck with Golden Gate towers behind!
      const orbitSway = Math.sin(this.elapsedSkyTime * 0.55) * 0.22;
      _desiredPos.set(
        squadX + 1.05 + orbitSway,
        1.48 + p * 0.14,
        squadZ + 2.85 + p * 0.55
      );
      _desiredLook.set(
        squadX - 0.02,
        0.40 - p * 0.06,
        squadZ - 0.25
      );
    } else {
      const inBossFight = framingMode === 'BOSS_TACTICAL';
      const targetCamX = squadX * (0.36 - p * 0.14);
      this.smoothCamX += (targetCamX - this.smoothCamX) * Math.min(1, dt * 8.5);

      const camHeight = (inBossFight ? 9.8 : 8.5) - p * 1.0;
      const camBack = (inBossFight ? 13.2 : 10.6) + p * 4.0;

      _desiredPos.set(this.smoothCamX, camHeight, squadZ + camBack);
      _desiredLook.set(
        this.smoothCamX * 0.55,
        (inBossFight ? 1.35 : 0.95) - p * 1.15,
        squadZ - ((inBossFight ? 13.0 : 9.5) - p * 2.2)
      );
    }

    // Snap immediately when entering/leaving high-altitude Armory stage; smooth spring swoop between Hero Diorama & Run!
    const snapInstant =
      isArmory !== (this.lastFramingMode === 'ARMORY_INSPECT');
    this.lastFramingMode = framingMode;

    if (snapInstant) {
      this.currentCamPos.copy(_desiredPos);
      this.currentLookAt.copy(_desiredLook);
    } else {
      const blend = Math.min(1, dt * (framingMode === 'HERO_DIORAMA' ? 5.5 : 7.5));
      this.currentCamPos.lerp(_desiredPos, blend);
      this.currentLookAt.lerp(_desiredLook, blend);
    }

    this.camera.position.set(
      this.currentCamPos.x + shakeX,
      this.currentCamPos.y + shakeY,
      this.currentCamPos.z
    );
    this.camera.lookAt(
      this.currentLookAt.x + shakeX * 0.4,
      this.currentLookAt.y,
      this.currentLookAt.z
    );

    // Keep Sky Dome centered on camera
    this.skyDome.position.copy(this.camera.position);

    const anchorZ = isArmory ? ARMORY_STAGE_Z : squadZ;
    const anchorY = isArmory ? ARMORY_STAGE_Y : 0;

    this.sunLight.position.set(-19, anchorY + 18, anchorZ - 36);
    this.sunLight.target.position.set(0, anchorY, anchorZ - 12);

    this.rimLight.position.set(18, anchorY + 13, anchorZ + 14);
    this.rimLight.target.position.set(0, anchorY, anchorZ - 10);
  }

  /**
   * Projects a 3D world point into viewport CSS pixels without allocating any objects.
   */
  public projectToScreen(
    worldX: number,
    worldY: number,
    worldZ: number,
    out: ScreenProjection
  ): void {
    _projVec.set(worldX, worldY, worldZ);
    _projVec.project(this.camera);

    if (_projVec.z > 1.0 || _projVec.z < -1.0) {
      out.visible = false;
      return;
    }

    out.x = (_projVec.x * 0.5 + 0.5) * window.innerWidth;
    out.y = (-_projVec.y * 0.5 + 0.5) * window.innerHeight;
    out.visible = true;
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}
