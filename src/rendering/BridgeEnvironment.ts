import * as THREE from 'three';
import {
  createProceduralSurfaceTextures,
  type RoadwayTextures,
} from './ProceduralTextures';

const WATER_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorldPos;
  varying float vWaveElev;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    float w1 = sin(worldPos.x * 0.12 + worldPos.z * 0.05 + uTime * 1.45) * 0.28;
    float w2 = cos(worldPos.x * -0.07 + worldPos.z * 0.14 - uTime * 1.15) * 0.22;
    float w3 = sin(worldPos.x * 0.23 - worldPos.z * 0.19 + uTime * 2.1) * 0.09;
    worldPos.y += w1 + w2 + w3;
    vWorldPos = worldPos.xyz;
    vWaveElev = w1 + w2 + w3;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const WATER_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCamPos;
  varying vec3 vWorldPos;
  varying float vWaveElev;

  void main() {
    vec2 p = vWorldPos.xz;

    // Multi-directional analytic wave derivatives for crisp wind-chopped ocean normals
    float dx =
      0.16 * cos(p.x * 0.34 + p.y * 0.21 + uTime * 1.8) -
      0.13 * sin(p.x * -0.27 + p.y * 0.43 - uTime * 1.4) +
      0.09 * cos(p.x * 0.78 - p.y * 0.61 + uTime * 2.7);
    float dz =
      0.11 * cos(p.x * 0.34 + p.y * 0.21 + uTime * 1.8) +
      0.18 * sin(p.x * -0.27 + p.y * 0.43 - uTime * 1.4) -
      0.08 * cos(p.x * 0.78 - p.y * 0.61 + uTime * 2.7);

    vec3 N = normalize(vec3(-dx, 1.0, -dz));
    vec3 V = normalize(uCamPos - vWorldPos);

    // Schlick Fresnel sky reflection (strictly positive pow base for mobile GLSL ES)
    float NoV = clamp(dot(N, V), 0.02, 0.9999);
    float fresnel = pow(max(0.0001, 1.0 - NoV), 4.0);

    vec3 deepTrough = vec3(0.028, 0.068, 0.105);
    vec3 seaBody = vec3(0.055, 0.145, 0.195);
    vec3 skyReflect = mix(vec3(0.22, 0.26, 0.36), vec3(0.88, 0.44, 0.21), smoothstep(-0.2, 0.85, -V.z));

    float crestMix = smoothstep(-0.38, 0.42, vWaveElev);
    vec3 col = mix(deepTrough, seaBody, crestMix);
    col = mix(col, skyReflect, clamp(fresnel * 0.78 + 0.08, 0.0, 0.88));

    // Golden-Hour Sun Specular Glitter Path across the bay
    vec3 sunDir = normalize(vec3(-0.38, 0.21, -0.90));
    vec3 H = normalize(sunDir + V);
    float NoH = max(0.0001, dot(N, H));
    float specTight = pow(NoH, 96.0);
    float specBroad = pow(NoH, 18.0);
    col += vec3(1.55, 0.86, 0.38) * specTight * 1.35;
    col += vec3(0.55, 0.26, 0.10) * specBroad * 0.42;

    // Subtle whitecap foam streaks on high wave crests
    float chop = sin(p.x * 0.63 + p.y * 0.39 + uTime * 2.1) * cos(p.x * -0.49 + p.y * 0.71 - uTime * 1.6);
    float whitecap = smoothstep(0.32, 0.56, vWaveElev + chop * 0.22);
    col = mix(col, vec3(0.76, 0.72, 0.68), whitecap * 0.28);

    // Bridge deck shadow band directly beneath roadway (X in [-5.8, +5.8])
    float underBridge = 1.0 - smoothstep(5.2, 10.5, abs(p.x));
    col *= (1.0 - underBridge * 0.44);

    // Distance atmospheric golden-haze blend
    float dist = length(uCamPos.xz - p);
    float dNorm = dist * 0.0046;
    float fogFactor = 1.0 - exp(-(dNorm * dNorm));
    col = mix(col, vec3(0.56, 0.31, 0.22), clamp(fogFactor, 0.0, 0.92));

    gl_FragColor = vec4(col, 1.0);
  }
`;

const CHUNK_LENGTH = 40;
const CHUNK_COUNT = 10; // 5 seamless 80m suspension catenary spans!

/**
 * Exact catenary height for each half of an 80m suspension span:
 * - phase 0: descends from tower saddle (17.4m at localZ=0) to mid-span trough (3.65m at localZ=-40)
 * - phase 1: ascends symmetrically from mid-span trough (3.65m at localZ=0) to next tower saddle (17.4m at localZ=-40)
 */
function sampleCatenaryY(spanPhase: 0 | 1, localZ: number): number {
  const u = Math.max(0, Math.min(1, -localZ / CHUNK_LENGTH));
  const sag = spanPhase === 0 ? 1 - u : u;
  return 3.85 + 17.95 * sag * sag;
}

function createCatenaryCableGeometry(spanPhase: 0 | 1, sideX: number): THREE.TubeGeometry {
  const pts: THREE.Vector3[] = [];
  const steps = 16;
  for (let s = 0; s <= steps; s++) {
    const lz = -(s / steps) * CHUNK_LENGTH;
    pts.push(new THREE.Vector3(sideX, sampleCatenaryY(spanPhase, lz), lz));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, 20, 0.17, 8, false);
}

export class BridgeEnvironment {
  public readonly root = new THREE.Group();
  public readonly textures: RoadwayTextures;
  private readonly waterMesh: THREE.Mesh;
  private readonly waterUniforms: {
    uTime: { value: number };
    uCamPos: { value: THREE.Vector3 };
  };
  private readonly chunks: THREE.Group[] = [];
  private readonly bossPlatform: THREE.Group;
  private readonly atmospherePoints: THREE.Points;
  private readonly motePositions: Float32Array;
  private readonly moteCount = 160;

  constructor() {
    this.textures = createProceduralSurfaceTextures();

    // 1. Realistic Golden-Hour Fresnel & Specular Ocean Water
    this.waterUniforms = {
      uTime: { value: 0 },
      uCamPos: { value: new THREE.Vector3(0, 9, 14) },
    };
    const waterGeo = new THREE.PlaneGeometry(420, 560, 64, 84);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.ShaderMaterial({
      vertexShader: WATER_VERTEX_SHADER,
      fragmentShader: WATER_FRAGMENT_SHADER,
      uniforms: this.waterUniforms,
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.set(0, -4.6, -140);
    this.root.add(this.waterMesh);

    // Shared Gritty Tactical PBR Bridge Materials (tuned for direct 4-light forward pass)
    const deckMat = new THREE.MeshStandardMaterial({
      map: this.textures.albedo,
      bumpMap: this.textures.bump,
      bumpScale: 0.045,
      roughnessMap: this.textures.roughness,
      roughness: 0.86,
      metalness: 0.12,
    });

    const concreteBarrierMat = new THREE.MeshStandardMaterial({
      color: 0x656c76,
      bumpMap: this.textures.bump,
      bumpScale: 0.03,
      roughness: 0.82,
      metalness: 0.08,
    });

    const curbMat = new THREE.MeshStandardMaterial({
      map: this.textures.hazardCurb,
      roughness: 0.56,
      metalness: 0.16,
    });

    const gunmetalMat = new THREE.MeshStandardMaterial({
      color: 0x56616e,
      bumpMap: this.textures.steelPlate,
      bumpScale: 0.025,
      roughness: 0.36,
      metalness: 0.42,
    });

    const cableSteelMat = new THREE.MeshStandardMaterial({
      color: 0x828f9d,
      roughness: 0.3,
      metalness: 0.46,
    });

    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xa83829,
      bumpMap: this.textures.steelPlate,
      bumpScale: 0.035,
      roughness: 0.44,
      metalness: 0.32,
    });

    const lampGlowMat = new THREE.MeshStandardMaterial({
      color: 0xffd28a,
      emissive: 0xff9b38,
      emissiveIntensity: 2.1,
      roughness: 0.2,
    });

    const beaconGlowMat = new THREE.MeshStandardMaterial({
      color: 0xff4d4d,
      emissive: 0xff1e26,
      emissiveIntensity: 2.6,
      roughness: 0.2,
    });

    // Shared catenary cable geometries for phase 0 & phase 1
    const catenaryGeos: Record<0 | 1, [THREE.TubeGeometry, THREE.TubeGeometry]> = {
      0: [createCatenaryCableGeometry(0, -6.05), createCatenaryCableGeometry(0, 6.05)],
      1: [createCatenaryCableGeometry(1, -6.05), createCatenaryCableGeometry(1, 6.05)],
    };

    // 2. Modular Recycling 80m-Paired Suspension Bridge Chunks
    for (let i = 0; i < CHUNK_COUNT; i++) {
      const spanPhase: 0 | 1 = (i % 2) as 0 | 1;
      const chunk = this.createBridgeChunk(
        spanPhase,
        catenaryGeos[spanPhase],
        deckMat,
        concreteBarrierMat,
        curbMat,
        gunmetalMat,
        cableSteelMat,
        towerMat,
        lampGlowMat,
        beaconGlowMat
      );
      chunk.position.z = 40 - i * CHUNK_LENGTH;
      this.chunks.push(chunk);
      this.root.add(chunk);
    }

    // 3. Widened Armored Boss Bastion Platform
    this.bossPlatform = this.createBossPlatform(
      deckMat,
      concreteBarrierMat,
      curbMat,
      gunmetalMat,
      towerMat,
      lampGlowMat
    );
    this.root.add(this.bossPlatform);

    // 4. Drifting Golden-Hour Battle Embers & Ash Motes
    this.motePositions = new Float32Array(this.moteCount * 3);
    const moteColors = new Float32Array(this.moteCount * 3);
    const cEmber = new THREE.Color();
    for (let i = 0; i < this.moteCount; i++) {
      this.motePositions[i * 3] = ((i * 37) % 36) - 18;
      this.motePositions[i * 3 + 1] = 0.4 + ((i * 19) % 11) * 0.85;
      this.motePositions[i * 3 + 2] = -((i * 29) % 140) + 15;

      if (i % 3 === 0) {
        cEmber.setHex(0xff9f43); // Glowing ember spark
      } else {
        cEmber.setHex(0xdcc6b4); // Warm sunlit dust/ash
      }
      moteColors[i * 3] = cEmber.r;
      moteColors[i * 3 + 1] = cEmber.g;
      moteColors[i * 3 + 2] = cEmber.b;
    }
    // Soft circular bokeh sprite so atmosphere motes never render as harsh square pixels
    const moteSpriteCanvas = document.createElement('canvas');
    moteSpriteCanvas.width = 64;
    moteSpriteCanvas.height = 64;
    const mCtx = moteSpriteCanvas.getContext('2d')!;
    const mGrad = mCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    mGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    mGrad.addColorStop(0.38, 'rgba(255, 236, 198, 0.65)');
    mGrad.addColorStop(1, 'rgba(255, 200, 140, 0.0)');
    mCtx.fillStyle = mGrad;
    mCtx.fillRect(0, 0, 64, 64);
    const moteTex = new THREE.CanvasTexture(moteSpriteCanvas);

    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(this.motePositions, 3));
    moteGeo.setAttribute('color', new THREE.BufferAttribute(moteColors, 3));
    const moteMat = new THREE.PointsMaterial({
      size: 0.24,
      map: moteTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.76,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.atmospherePoints = new THREE.Points(moteGeo, moteMat);
    this.root.add(this.atmospherePoints);
  }

  private createBridgeChunk(
    spanPhase: 0 | 1,
    catenaryPair: [THREE.TubeGeometry, THREE.TubeGeometry],
    deckMat: THREE.Material,
    concreteBarrierMat: THREE.Material,
    curbMat: THREE.Material,
    gunmetalMat: THREE.Material,
    cableSteelMat: THREE.Material,
    towerMat: THREE.Material,
    lampGlowMat: THREE.Material,
    beaconGlowMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();

    // Weathered Asphalt Roadway Deck + Underside Steel Box Girder
    const deck = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.55, CHUNK_LENGTH), deckMat);
    deck.position.set(0, -0.275, -CHUNK_LENGTH / 2);
    deck.receiveShadow = true;
    group.add(deck);

    const underGirder = new THREE.Mesh(
      new THREE.BoxGeometry(12.2, 1.05, CHUNK_LENGTH),
      gunmetalMat
    );
    underGirder.position.set(0, -1.05, -CHUNK_LENGTH / 2);
    group.add(underGirder);

    // True Sweeping Parabolic Main Suspension Cables (Left & Right)
    const mainCableL = new THREE.Mesh(catenaryPair[0], cableSteelMat);
    const mainCableR = new THREE.Mesh(catenaryPair[1], cableSteelMat);
    mainCableL.castShadow = true;
    mainCableR.castShadow = true;
    group.add(mainCableL, mainCableR);

    // Hazard Curbs, Concrete K-Rail Jersey Barriers, Steel Guardrails, Suspender Ropes & Streetlamps
    for (let sideIdx = 0; sideIdx < 2; sideIdx++) {
      const sign = sideIdx === 0 ? -1 : 1;

      // Diagonal Yellow/Black Hazard Curb Strip
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, CHUNK_LENGTH), curbMat);
      curb.position.set(sign * 5.18, 0.09, -CHUNK_LENGTH / 2);
      curb.receiveShadow = true;
      group.add(curb);

      // Sloped Concrete Jersey Barrier Wall
      const kRailBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.52, CHUNK_LENGTH),
        concreteBarrierMat
      );
      kRailBase.position.set(sign * 5.54, 0.26, -CHUNK_LENGTH / 2);
      kRailBase.castShadow = true;
      kRailBase.receiveShadow = true;
      group.add(kRailBase);

      const topSteelRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.12, CHUNK_LENGTH),
        gunmetalMat
      );
      topSteelRail.position.set(sign * 5.62, 0.88, -CHUNK_LENGTH / 2);
      group.add(topSteelRail);

      for (let pz = -3; pz >= -CHUNK_LENGTH + 2; pz -= 5) {
        const stanchion = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, 0.14), gunmetalMat);
        stanchion.position.set(sign * 5.62, 0.68, pz);
        group.add(stanchion);
      }

      // Twin Vertical Steel Suspender Ropes hanging accurately from the Main Catenary Curve!
      for (let cz = -4; cz >= -CHUNK_LENGTH + 3; cz -= 8) {
        const catY = sampleCatenaryY(spanPhase, cz);
        const ropeH = Math.max(1.0, catY - 0.5);
        const rope = new THREE.Mesh(
          new THREE.CylinderGeometry(0.032, 0.032, ropeH, 6),
          cableSteelMat
        );
        rope.position.set(sign * 6.05, 0.5 + ropeH * 0.5, cz);
        group.add(rope);

        const clamp = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.22, 0.24, 8),
          gunmetalMat
        );
        clamp.rotation.x = Math.PI / 2;
        clamp.position.set(sign * 6.05, catY, cz);
        group.add(clamp);
      }

      // Tactical Overhead Highway Streetlamp Pole (one per 40m span on each side)
      const lampZ = -20;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6.2, 8), gunmetalMat);
      pole.position.set(sign * 5.72, 3.1, lampZ);
      pole.castShadow = true;
      group.add(pole);

      const mastArm = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.1, 0.12), gunmetalMat);
      mastArm.position.set(sign * 5.05, 6.12, lampZ);
      mastArm.rotation.z = -sign * 0.12;
      group.add(mastArm);

      const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.09, 0.24), lampGlowMat);
      lampHead.position.set(sign * 4.42, 6.0, lampZ);
      group.add(lampHead);
    }

    // Iconic Riveted Steel Suspension Tower + X-Trusses + Concrete Sea Pier at localZ = 0 of Phase 0
    if (spanPhase === 0) {
      // Concrete sea caisson pier beneath tower
      const pier = new THREE.Mesh(
        new THREE.BoxGeometry(15.6, 4.2, 3.4),
        concreteBarrierMat
      );
      pier.position.set(0, -3.4, 0);
      group.add(pier);

      for (const sign of [-1, 1]) {
        // Stepped Industrial Tower Legs (raised portal height for elevated tactical camera!)
        const lowerLeg = new THREE.Mesh(new THREE.BoxGeometry(1.55, 17.2, 1.75), towerMat);
        lowerLeg.position.set(sign * 6.05, 7.05, 0);
        lowerLeg.castShadow = true;
        lowerLeg.receiveShadow = true;
        group.add(lowerLeg);

        const upperLeg = new THREE.Mesh(new THREE.BoxGeometry(1.22, 9.2, 1.4), towerMat);
        upperLeg.position.set(sign * 6.05, 19.3, 0);
        upperLeg.castShadow = true;
        group.add(upperLeg);

        // Steel Cable Saddle & Aviation Warning Beacon on Peak
        const saddle = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.55, 1.65), gunmetalMat);
        saddle.position.set(sign * 6.05, 24.05, 0);
        group.add(saddle);

        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), beaconGlowMat);
        beacon.position.set(sign * 6.05, 24.52, 0);
        group.add(beacon);
      }

      // Portal Crossbeams + Diagonal Steel X-Bracing Trusses (raised >= 16.2m so elevated camera never clips!)
      for (const beamY of [16.2, 19.5, 22.8]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.90, 1.12), towerMat);
        beam.position.set(0, beamY, 0);
        beam.castShadow = true;
        group.add(beam);
      }

      for (const bayMidY of [17.85, 21.15]) {
        for (const diagSign of [-1, 1]) {
          const strut = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.26, 0.34), gunmetalMat);
          strut.position.set(0, bayMidY, 0);
          strut.rotation.z = diagSign * 0.28;
          group.add(strut);
        }
      }
    }

    return group;
  }

  private createBossPlatform(
    deckMat: THREE.Material,
    concreteBarrierMat: THREE.Material,
    curbMat: THREE.Material,
    gunmetalMat: THREE.Material,
    towerMat: THREE.Material,
    lampGlowMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();

    const pad = new THREE.Mesh(new THREE.BoxGeometry(16.2, 0.84, 30), deckMat);
    pad.position.set(0, -0.39, -13);
    pad.receiveShadow = true;
    group.add(pad);

    for (const sign of [-1, 1]) {
      const blastWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.85, 30),
        concreteBarrierMat
      );
      blastWall.position.set(sign * 7.7, 0.42, -13);
      blastWall.castShadow = true;
      blastWall.receiveShadow = true;
      group.add(blastWall);

      const hazardStrip = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.24, 30), curbMat);
      hazardStrip.position.set(sign * 7.15, 0.12, -13);
      group.add(hazardStrip);

      // Heavy Armored Bastion Pylons + Floodlights
      const pylon = new THREE.Mesh(new THREE.BoxGeometry(1.55, 10.5, 1.65), towerMat);
      pylon.position.set(sign * 7.65, 5.0, -25);
      pylon.castShadow = true;
      group.add(pylon);

      const floodBox = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.45), gunmetalMat);
      floodBox.position.set(sign * 7.3, 9.4, -24.2);
      floodBox.rotation.x = 0.35;
      group.add(floodBox);

      const floodLens = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.38), lampGlowMat);
      floodLens.position.set(sign * 7.3, 9.32, -23.95);
      floodLens.rotation.x = 0.35;
      group.add(floodLens);
    }

    return group;
  }

  public configureBossPlatformZ(bossStartZ: number): void {
    this.bossPlatform.position.set(0, 0.01, bossStartZ + 8);
  }

  /**
   * Zero-allocation per-frame update recycling 80m-paired bridge spans & ocean position around camera.
   */
  public update(
    dt: number,
    elapsedSeconds: number,
    squadZ: number,
    camPos?: THREE.Vector3
  ): void {
    this.waterUniforms.uTime.value = elapsedSeconds;
    if (camPos) {
      this.waterUniforms.uCamPos.value.copy(camPos);
    }
    this.waterMesh.position.z = squadZ - 130;

    // Recycle chunks by totalSpan (400m = 5 * 80m) so catenary phase 0/1 pairs stay 100% seamless!
    const totalSpan = CHUNK_COUNT * CHUNK_LENGTH;
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      if (chunk.position.z - CHUNK_LENGTH > squadZ + 50) {
        chunk.position.z -= totalSpan;
      } else if (chunk.position.z < squadZ - totalSpan + 50) {
        chunk.position.z += totalSpan;
      }
    }

    // Drift golden embers & battlefield ash cleanly across the bridge
    const posAttr = this.atmospherePoints.geometry.getAttribute(
      'position'
    ) as THREE.BufferAttribute;
    for (let i = 0; i < this.moteCount; i++) {
      const base = i * 3;
      let mx = this.motePositions[base] + dt * (0.85 + (i % 4) * 0.22);
      if (mx > 18) {
        mx = -18;
      }
      this.motePositions[base] = mx;

      let my = this.motePositions[base + 1] + Math.sin(elapsedSeconds * 2.0 + i) * dt * 0.25;
      if (my < 0.3) my = 8.5;
      if (my > 9.5) my = 0.4;
      this.motePositions[base + 1] = my;

      let mz = this.motePositions[base + 2];
      if (mz > squadZ + 22) {
        mz -= 145;
      } else if (mz < squadZ - 125) {
        mz += 145;
      }
      this.motePositions[base + 2] = mz;
    }
    posAttr.needsUpdate = true;
  }
}
