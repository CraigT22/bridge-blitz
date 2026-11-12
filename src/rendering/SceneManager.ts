import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import {
  createGoldenHourEnvironment,
  createGoldenHourSkyDome,
} from './ProceduralTextures';

export interface ScreenProjection {
  x: number;
  y: number;
  visible: boolean;
}

const _projVec = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

export class SceneManager {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly renderer: THREE.WebGLRenderer;
  private readonly composer: EffectComposer;
  private readonly bloomPass: UnrealBloomPass;
  private readonly sunLight: THREE.DirectionalLight;
  private readonly rimLight: THREE.DirectionalLight;
  private readonly skyDome: THREE.Mesh;
  private readonly skyUniforms: { uTime: { value: number } };

  private shakeTrauma = 0;
  private shakeTime = 0;
  private smoothCamX = 0;
  private elapsedSkyTime = 0;
  private portraitFactor = 0;

  constructor(canvasContainer: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x181924);
    this.scene.fog = new THREE.FogExp2(0x6d4236, 0.0058);

    const initW = Math.max(1, window.innerWidth);
    const initH = Math.max(1, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(47, initW / initH, 0.25, 320);
    this.camera.position.set(0, 9.6, 13.4);
    this.camera.lookAt(0, 0.8, -14);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(initW, initH);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    canvasContainer.appendChild(this.renderer.domElement);

    // Procedural Golden-Hour Sunset PBR Environment Reflections
    this.scene.environment = createGoldenHourEnvironment(this.renderer);
    this.scene.environmentIntensity = 1.1;

    // Golden-Hour Sunset Sky Dome with Mountains & Clouds
    const sky = createGoldenHourSkyDome();
    this.skyDome = sky.mesh;
    this.skyUniforms = sky.uniforms;
    this.scene.add(this.skyDome);

    // Warm Sunset Sky / Dark Asphalt Bounce Hemisphere Light
    const hemi = new THREE.HemisphereLight(0xffb980, 0x1d232d, 0.78);
    this.scene.add(hemi);

    // Primary Low-Angle Golden-Hour Sun Light + Crisp Soft Shadows
    this.sunLight = new THREE.DirectionalLight(0xffa95e, 2.9);
    this.sunLight.position.set(-19, 16, -24);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 92;
    this.sunLight.shadow.camera.left = -11.0;
    this.sunLight.shadow.camera.right = 11.0;
    this.sunLight.shadow.camera.top = 32;
    this.sunLight.shadow.camera.bottom = -16;
    this.sunLight.shadow.bias = -0.0006;
    this.sunLight.shadow.normalBias = 0.025;
    this.sunLight.shadow.radius = 2.2;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Cool Steel-Blue Rim Light for Tactical Gunmetal Contrast
    this.rimLight = new THREE.DirectionalLight(0x689fd6, 1.05);
    this.rimLight.position.set(18, 12, 16);
    this.scene.add(this.rimLight);
    this.scene.add(this.rimLight.target);

    // Multisampled Half-Float Post-Processing Pipeline (Adaptive MSAA + Selective HDR Bloom)
    const renderTarget = new THREE.WebGLRenderTarget(
      Math.max(1, Math.floor(initW * dpr)),
      Math.max(1, Math.floor(initH * dpr)),
      {
        type: THREE.HalfFloatType,
        samples: dpr > 1.5 ? 2 : 4,
      }
    );
    this.composer = new EffectComposer(this.renderer, renderTarget);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(initW, initH);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(Math.max(1, Math.floor(initW * 0.5)), Math.max(1, Math.floor(initH * 0.5))),
      0.35,
      0.38,
      1.12
    );
    const outputPass = new OutputPass();

    this.composer.addPass(renderPass);
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(outputPass);

    this.applyViewportFraming();
    window.addEventListener('resize', this.handleResize);
  }

  private applyViewportFraming(): void {
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    const aspect = w / h;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.camera.aspect = aspect;

    // Preserve horizontal bridge visibility & thumb clearance on tall ~20:9 phones (Pixel 10 XL 412x915)
    this.portraitFactor = Math.max(0, Math.min(1, (0.95 - aspect) / 0.5));
    this.camera.fov = 47 + this.portraitFactor * 23;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(w, h);
    this.bloomPass.resolution.set(Math.max(1, Math.floor(w * 0.5)), Math.max(1, Math.floor(h * 0.5)));
  }

  private readonly handleResize = (): void => {
    this.applyViewportFraming();
  };

  public addShake(intensity: number): void {
    this.shakeTrauma = Math.min(1.0, this.shakeTrauma + intensity);
  }

  public updateCamera(dt: number, squadX: number, squadZ: number, inBossFight: boolean): void {
    this.elapsedSkyTime += dt;
    this.skyUniforms.uTime.value = this.elapsedSkyTime;

    this.shakeTime += dt * 38;
    this.shakeTrauma = Math.max(0, this.shakeTrauma - dt * 2.6);
    const shakeMag = this.shakeTrauma * this.shakeTrauma * 0.52;

    const shakeX = Math.sin(this.shakeTime * 1.13) * shakeMag;
    const shakeY = Math.cos(this.shakeTime * 1.71) * shakeMag * 0.75;

    const targetCamX = squadX * (0.36 - this.portraitFactor * 0.14);
    this.smoothCamX += (targetCamX - this.smoothCamX) * Math.min(1, dt * 8.5);

    const p = this.portraitFactor;
    const camHeight = (inBossFight ? 9.8 : 8.5) - p * 1.0;
    const camBack = (inBossFight ? 13.2 : 10.6) + p * 4.0;

    this.camera.position.set(
      this.smoothCamX + shakeX,
      camHeight + shakeY,
      squadZ + camBack
    );

    _lookTarget.set(
      this.smoothCamX * 0.55 + shakeX * 0.4,
      (inBossFight ? 1.35 : 0.95) - p * 1.15,
      squadZ - ((inBossFight ? 13.0 : 9.5) - p * 2.2)
    );
    this.camera.lookAt(_lookTarget);

    // Keep Sky Dome centered on camera
    this.skyDome.position.copy(this.camera.position);

    // Texel-snapped directional shadow frustum tracking the active battlefield
    const snappedZ = Math.round(squadZ * 2) * 0.5;
    this.sunLight.position.set(-19, 18, snappedZ - 36);
    this.sunLight.target.position.set(0, 0, snappedZ - 12);

    this.rimLight.position.set(18, 12, snappedZ + 14);
    this.rimLight.target.position.set(0, 0, snappedZ - 10);
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
    this.composer.render();
  }
}
