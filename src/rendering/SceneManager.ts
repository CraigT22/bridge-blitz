import * as THREE from 'three';
import { getBossVisualProfile } from '../core/StageData';
import type { BossChassisId, BossDefinition, SkinThemeId, WeaponTierId } from '../core/types';
import { getWeaponDisplaySpec } from '../math/weaponMath';
import {
  createAllBossChassisRigs,
  type BossChassisRig,
} from './BossRigFactory';
import { createGoldenHourSkyDome } from './ProceduralTextures';
import { createAllUnicornBossChassisRigs } from './UnicornBossRigFactory';
import {
  createShowcaseWeaponGroup,
  type ShowcaseWeaponRig,
} from './WeaponRigFactory';

export type CameraFramingMode =
  | 'LIVE_BRIDGE'
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
  private skinTheme: SkinThemeId = 'UNICORN';
  private readonly armoryRoot = new THREE.Group();
  private readonly armoryTurntable = new THREE.Group();
  private readonly armoryRingMat: THREE.MeshBasicMaterial;
  private readonly armoryOuterRing: THREE.Mesh;
  private readonly armoryWeaponsByTheme: Record<SkinThemeId, Record<WeaponTierId, ShowcaseWeaponRig>>;
  private readonly armoryBossesByTheme: Record<SkinThemeId, Record<BossChassisId, BossChassisRig>>;
  private latestArmoryBossDef: BossDefinition | null = null;
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

  private readonly currentCamPos = new THREE.Vector3(0, 7.3, 12.6);
  private readonly currentLookAt = new THREE.Vector3(0, 0.04, -5.0);
  private lastFramingMode: CameraFramingMode = 'LIVE_BRIDGE';

  constructor(canvasContainer: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x091322);
    this.scene.fog = new THREE.FogExp2(0x11273d, 0.0026);

    const initW = Math.max(1, window.innerWidth);
    const initH = Math.max(1, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(46, initW / initH, 0.3, 560);
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
    this.renderer.toneMappingExposure = 1.20;
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
    });
    canvasContainer.appendChild(this.renderer.domElement);

    // Midnight Storm Sky Dome with Moonlit Clouds & Naval Fortress Headlands
    const sky = createGoldenHourSkyDome();
    this.skyDome = sky.mesh;
    this.skyUniforms = sky.uniforms;
    this.scene.add(this.skyDome);

    // 4-Light Moonlit Tactical Storm Rig (bright crisp silver-cyan readability + electric-teal rim)
    const hemi = new THREE.HemisphereLight(0x94d8ff, 0x1d2c40, 1.58);
    this.scene.add(hemi);

    this.sunLight = new THREE.DirectionalLight(0xe2f3ff, 2.82);
    this.sunLight.position.set(-18, 18, -24);
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    this.rimLight = new THREE.DirectionalLight(0x2ef5dc, 1.68);
    this.rimLight.position.set(18, 13, 18);
    this.scene.add(this.rimLight);
    this.scene.add(this.rimLight.target);

    const frontalFill = new THREE.DirectionalLight(0xcfe6ff, 1.12);
    frontalFill.position.set(0, 10, 22);
    this.scene.add(frontalFill);

    // Build 3D Armory Showcase Pedestal & Models
    this.armoryRoot.position.set(0, ARMORY_STAGE_Y, ARMORY_STAGE_Z);
    this.armoryRoot.visible = false;

    const hangarApron = new THREE.Mesh(
      new THREE.CylinderGeometry(5.4, 5.8, 0.34, 8),
      new THREE.MeshStandardMaterial({
        color: 0x0f1826,
        roughness: 0.44,
        metalness: 0.44,
      })
    );
    hangarApron.position.set(0, -1.04, -0.4);
    this.armoryRoot.add(hangarApron);

    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x1a2738,
      roughness: 0.34,
      metalness: 0.46,
    });
    const daisBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.75, 1.98, 0.28, 8),
      daisMat
    );
    daisBase.position.set(0, -0.78, 0);
    this.armoryRoot.add(daisBase);

    const daisInner = new THREE.Mesh(
      new THREE.CylinderGeometry(1.32, 1.44, 0.14, 8),
      new THREE.MeshStandardMaterial({
        color: 0x293b52,
        roughness: 0.28,
        metalness: 0.48,
      })
    );
    daisInner.position.set(0, -0.60, 0);
    this.armoryRoot.add(daisInner);

    this.armoryRingMat = new THREE.MeshBasicMaterial({
      color: 0x28f2d4,
      transparent: true,
      opacity: 0.74,
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

    const buildArmoryWeapons = (theme: SkinThemeId): Record<WeaponTierId, ShowcaseWeaponRig> => ({
      1: createShowcaseWeaponGroup(1, theme),
      2: createShowcaseWeaponGroup(2, theme),
      3: createShowcaseWeaponGroup(3, theme),
      4: createShowcaseWeaponGroup(4, theme),
      5: createShowcaseWeaponGroup(5, theme),
    });

    this.armoryWeaponsByTheme = {
      TACTICAL: buildArmoryWeapons('TACTICAL'),
      UNICORN: buildArmoryWeapons('UNICORN'),
    };
    for (const theme of ['TACTICAL', 'UNICORN'] as const) {
      for (const t of [1, 2, 3, 4, 5] as const) {
        const w = this.armoryWeaponsByTheme[theme][t];
        const scale = t === 1 ? 1.85 : t === 2 ? 1.55 : 1.38;
        w.root.scale.setScalar(scale);
        w.root.position.set(0, 0.18, 0);
        w.root.rotation.z = 0.10;
        this.armoryTurntable.add(w.root);
      }
    }

    this.armoryBossesByTheme = {
      TACTICAL: createAllBossChassisRigs(),
      UNICORN: createAllUnicornBossChassisRigs(),
    };
    for (const theme of ['TACTICAL', 'UNICORN'] as const) {
      const set = this.armoryBossesByTheme[theme];
      for (const key of Object.keys(set) as BossChassisId[]) {
        const b = set[key];
        const bScale =
          theme === 'UNICORN'
            ? key === 'SOVEREIGN_TITAN'
              ? 0.36
              : 0.40
            : key === 'SOVEREIGN_TITAN'
              ? 0.42
              : 0.46;
        b.root.scale.setScalar(bScale);
        b.root.position.set(0, -0.52, 0);
        b.root.visible = false;
        this.armoryTurntable.add(b.root);
      }
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

    // v8.1 Option A Full Comp Framing: 62.0° portrait vertical FOV (46.0° landscape)
    // paired with ~22.5° 3/4 over-the-shoulder pitch for visible horizon (~16%) & heroic squad scale!
    this.portraitFactor = Math.max(0, Math.min(1, (0.95 - aspect) / 0.5));
    this.camera.fov = 46.0 + this.portraitFactor * 16.0;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
  }

  private readonly handleResize = (): void => {
    this.applyViewportFraming();
  };

  private applyArmoryBossColors(def: BossDefinition): void {
    const profile = getBossVisualProfile(def, this.skinTheme);
    const rig = this.armoryBossesByTheme[this.skinTheme][def.chassis];
    rig.primaryMat.color.setHex(profile.primaryHex);
    rig.accentMat.color.setHex(profile.accentHex);
    rig.trimMat.color.setHex(profile.trimHex);
    rig.glowMat.color.setHex(profile.trimHex);
    this.armoryRingMat.color.setHex(profile.trimHex);
  }

  public setSkinTheme(theme: SkinThemeId): void {
    if (this.skinTheme === theme) {
      return;
    }
    this.skinTheme = theme;
    if (this.armoryMode === 'WEAPONS') {
      this.armoryRingMat.color.setHex(
        getWeaponDisplaySpec(this.armoryWeaponTier, this.skinTheme).colorHex
      );
    } else if (this.latestArmoryBossDef) {
      this.applyArmoryBossColors(this.latestArmoryBossDef);
    }
    this.syncArmoryVisibility();
  }

  public configureArmoryWeapon(tier: WeaponTierId): void {
    this.armoryMode = 'WEAPONS';
    this.armoryWeaponTier = tier;
    this.armoryYaw = -0.36;
    this.armoryRingMat.color.setHex(getWeaponDisplaySpec(tier, this.skinTheme).colorHex);
    this.syncArmoryVisibility();
  }

  public configureArmoryBoss(def: BossDefinition): void {
    this.armoryMode = 'BOSSES';
    this.latestArmoryBossDef = def;
    this.armoryBossChassis = def.chassis;
    this.armoryYaw = -0.44;
    this.applyArmoryBossColors(def);
    this.syncArmoryVisibility();
  }

  public rotateArmoryTurntable(deltaRadians: number): void {
    this.armoryYaw += deltaRadians;
    this.armoryDragSpinFreeze = 1.6;
  }

  private syncArmoryVisibility(): void {
    for (const theme of ['TACTICAL', 'UNICORN'] as const) {
      for (const t of [1, 2, 3, 4, 5] as const) {
        this.armoryWeaponsByTheme[theme][t].root.visible =
          this.armoryMode === 'WEAPONS' &&
          theme === this.skinTheme &&
          t === this.armoryWeaponTier;
      }
      const bossSet = this.armoryBossesByTheme[theme];
      for (const key of Object.keys(bossSet) as BossChassisId[]) {
        bossSet[key].root.visible =
          this.armoryMode === 'BOSSES' &&
          theme === this.skinTheme &&
          key === this.armoryBossChassis;
      }
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
    const shakeMag = this.shakeTrauma * this.shakeTrauma * 0.45;

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

      if (this.armoryMode === 'WEAPONS') {
        const wRig = this.armoryWeaponsByTheme[this.skinTheme][this.armoryWeaponTier];
        wRig.root.position.y = 0.18 + Math.sin(this.elapsedSkyTime * 2.2) * 0.05;
        if (wRig.spinCluster) {
          wRig.spinCluster.rotation.x += dt * 12.0;
        }
      } else {
        const bRig = this.armoryBossesByTheme[this.skinTheme][this.armoryBossChassis];
        const isUnicorn = this.skinTheme === 'UNICORN';
        for (let s = 0; s < bRig.spinClusters.length; s++) {
          if (!isUnicorn && this.armoryBossChassis === 'KRAKEN_WALKER') {
            bRig.spinClusters[s].rotation.y += dt * 3.5;
          } else {
            bRig.spinClusters[s].rotation.z += dt * 9.0;
          }
        }
        if (bRig.wingPylons) {
          const flap = Math.sin(this.elapsedSkyTime * 2.2) * (isUnicorn ? 0.11 : 0.06);
          bRig.wingPylons[0].rotation.z = 0.42 + flap;
          bRig.wingPylons[1].rotation.z = -0.42 - flap;
        }
      }

      _desiredPos.set(0, ARMORY_STAGE_Y + 0.62, ARMORY_STAGE_Z + 5.75 + p * 1.65);
      _desiredLook.set(0, ARMORY_STAGE_Y - 0.14 - p * 0.30, ARMORY_STAGE_Z);
    } else if (framingMode === 'LIVE_BRIDGE') {
      // v8.1 Option A Hub Camera: heroic 3/4 over-the-shoulder angle (~22.4° pitch) placing squad
      // cleanly above bottom upgrade cards with open Midnight Storm sky horizon (~16%) & chunky front barrels!
      const targetCamX = squadX * 0.44;
      this.smoothCamX += (targetCamX - this.smoothCamX) * Math.min(1, dt * 6.5);

      const camHeight = 6.2 + p * 1.1;
      const camBack = 10.6 + p * 2.0;
      const lookAhead = 4.6 + p * 0.4;
      _desiredPos.set(this.smoothCamX, camHeight, squadZ + camBack);
      _desiredLook.set(this.smoothCamX * 0.80, 0.04, squadZ - lookAhead);
    } else {
      // v8.1 Option A Full Comp Framing Arcade Camera:
      // - Responsive ~44% horizontal follow (`lookX = smoothCamX * 0.80`) so hugging left barrel column
      //   or right enemy lane centers action cleanly while curbs angle dramatically into frame!
      // - Rigid forward Z tracking (zero Z lag)
      // - ~22.5° downward 3/4 pitch on 412×915 portrait: visible horizon (~15.5% from top),
      //   squad feet at ~60.5% leaving ~39% open lower deck for one-handed thumb swiping!
      const inBossFight = framingMode === 'BOSS_TACTICAL';
      const followGain = inBossFight ? 0.40 : 0.44;
      const targetCamX = squadX * followGain;
      this.smoothCamX += (targetCamX - this.smoothCamX) * Math.min(1, dt * 7.2);

      const camHeight = inBossFight ? 7.6 + p * 1.4 : 6.4 + p * 1.2;
      const camBack = inBossFight ? 13.0 + p * 2.4 : 11.2 + p * 2.0;
      const lookAhead = inBossFight ? 6.0 + p * 0.8 : 4.6 + p * 0.4;
      const lookY = inBossFight ? 0.45 : 0.05;

      _desiredPos.set(this.smoothCamX, camHeight, squadZ + camBack);
      _desiredLook.set(
        this.smoothCamX * (inBossFight ? 0.78 : 0.80),
        lookY,
        squadZ - lookAhead
      );
    }

    const prevMode = this.lastFramingMode;
    const snapInstant = isArmory !== (prevMode === 'ARMORY_INSPECT');
    this.lastFramingMode = framingMode;

    if (snapInstant) {
      this.currentCamPos.copy(_desiredPos);
      this.currentLookAt.copy(_desiredLook);
    } else if (framingMode === 'RUN_TACTICAL' || framingMode === 'BOSS_TACTICAL') {
      // Rigid forward Z tracking (zero Z lag), smooth X/Y transitions
      const blendXY = Math.min(1, dt * 10.0);
      this.currentCamPos.x += (_desiredPos.x - this.currentCamPos.x) * blendXY;
      this.currentCamPos.y += (_desiredPos.y - this.currentCamPos.y) * blendXY;
      this.currentCamPos.z = _desiredPos.z;
      this.currentLookAt.x += (_desiredLook.x - this.currentLookAt.x) * blendXY;
      this.currentLookAt.y += (_desiredLook.y - this.currentLookAt.y) * blendXY;
      this.currentLookAt.z = _desiredLook.z;
    } else {
      const blend = Math.min(1, dt * 8.5);
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

    this.skyDome.position.copy(this.camera.position);

    const anchorZ = isArmory ? ARMORY_STAGE_Z : squadZ;
    const anchorY = isArmory ? ARMORY_STAGE_Y : 0;

    this.sunLight.position.set(-19, anchorY + 18, anchorZ - 36);
    this.sunLight.target.position.set(0, anchorY, anchorZ - 12);

    this.rimLight.position.set(18, anchorY + 13, anchorZ + 14);
    this.rimLight.target.position.set(0, anchorY, anchorZ - 10);
  }

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
