import * as THREE from 'three';
import { createGoldenHourSkyDome } from './ProceduralTextures';

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
    this.scene.fog = new THREE.FogExp2(0x6d4236, 0.0056);

    const initW = Math.max(1, window.innerWidth);
    const initH = Math.max(1, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(47, initW / initH, 0.3, 320);
    this.camera.position.set(0, 9.6, 13.4);
    this.camera.lookAt(0, 0.8, -14);

    // Pure single-pass hardware forward WebGLRenderer (zero offscreen HalfFloat FBOs
    // for 100% stability and 90-120 FPS efficiency on Pixel / Android WebView GPUs)
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

    // 4-Light Golden-Hour Tactical Rig (Warm Sunset + Slate Bounce + Sun + Steel Rim + Fill)
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

    const frontalFill = new THREE.DirectionalLight(0xffdfb8, 0.55);
    frontalFill.position.set(0, 10, 22);
    this.scene.add(frontalFill);

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

    this.sunLight.position.set(-19, 18, squadZ - 36);
    this.sunLight.target.position.set(0, 0, squadZ - 12);

    this.rimLight.position.set(18, 13, squadZ + 14);
    this.rimLight.target.position.set(0, 0, squadZ - 10);
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
