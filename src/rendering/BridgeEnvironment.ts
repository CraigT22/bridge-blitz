import * as THREE from 'three';

const WATER_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec2 vWorldXZ;
  varying float vWaveHeight;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    float w1 = sin(worldPos.x * 0.14 + uTime * 1.6) * 0.22;
    float w2 = cos(worldPos.z * 0.11 - uTime * 1.25) * 0.18;
    worldPos.y += w1 + w2;
    vWorldXZ = worldPos.xz;
    vWaveHeight = w1 + w2;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const WATER_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec2 vWorldXZ;
  varying float vWaveHeight;

  void main() {
    vec3 deepSea = vec3(0.04, 0.22, 0.39);
    vec3 shallowCyan = vec3(0.08, 0.48, 0.66);
    float crest = smoothstep(-0.30, 0.34, vWaveHeight);
    vec3 col = mix(deepSea, shallowCyan, crest);

    // Organic multi-octave diagonal ocean ripples (zero regular dot grid)
    float r1 = sin(vWorldXZ.x * 0.31 + vWorldXZ.y * 0.19 + uTime * 1.9);
    float r2 = sin(vWorldXZ.x * -0.23 + vWorldXZ.y * 0.41 - uTime * 1.45);
    float r3 = cos(vWorldXZ.x * 0.67 - vWorldXZ.y * 0.53 + uTime * 2.6);
    float ripple = (r1 + r2 + r3 * 0.6) / 2.6;
    float foam = smoothstep(0.62, 0.88, ripple);
    col = mix(col, vec3(0.68, 0.93, 1.0), foam * 0.36);

    // Subtle bridge shadow band around X = 0
    float underBridge = 1.0 - smoothstep(4.8, 9.8, abs(vWorldXZ.x));
    col *= (1.0 - underBridge * 0.26);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const CHUNK_LENGTH = 40;
const CHUNK_COUNT = 10;

export class BridgeEnvironment {
  public readonly root = new THREE.Group();
  private readonly waterMesh: THREE.Mesh;
  private readonly waterUniforms: { uTime: { value: number } };
  private readonly chunks: THREE.Group[] = [];
  private readonly bossPlatform: THREE.Group;
  private readonly atmospherePoints: THREE.Points;
  private readonly motePositions: Float32Array;
  private readonly moteCount = 140;

  constructor() {
    // 1. Stylized Animated Ocean Water
    this.waterUniforms = {
      uTime: { value: 0 },
    };
    const waterGeo = new THREE.PlaneGeometry(340, 520, 56, 72);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.ShaderMaterial({
      vertexShader: WATER_VERTEX_SHADER,
      fragmentShader: WATER_FRAGMENT_SHADER,
      uniforms: this.waterUniforms,
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.set(0, -4.4, -140);
    this.root.add(this.waterMesh);

    // Shared Bridge Materials
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x2a3340,
      roughness: 0.78,
      metalness: 0.12,
    });
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0xf4b93b,
      roughness: 0.5,
      metalness: 0.2,
    });
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x8fa1b5,
      roughness: 0.35,
      metalness: 0.68,
    });
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xd9483b,
      roughness: 0.42,
      metalness: 0.35,
    });
    const laneDashMat = new THREE.MeshBasicMaterial({ color: 0xe6edf5 });

    // 2. Modular Recycling Suspension Bridge Chunks
    for (let i = 0; i < CHUNK_COUNT; i++) {
      const chunk = this.createBridgeChunk(
        i % 2 === 1,
        deckMat,
        curbMat,
        railMat,
        towerMat,
        laneDashMat
      );
      chunk.position.z = 20 - i * CHUNK_LENGTH;
      this.chunks.push(chunk);
      this.root.add(chunk);
    }

    // 3. Widened Armored Boss Platform
    this.bossPlatform = this.createBossPlatform(deckMat, curbMat, towerMat);
    this.root.add(this.bossPlatform);

    // 4. Subtle Drifting Atmospheric Motes
    this.motePositions = new Float32Array(this.moteCount * 3);
    for (let i = 0; i < this.moteCount; i++) {
      this.motePositions[i * 3] = ((i * 37) % 36) - 18;
      this.motePositions[i * 3 + 1] = 0.6 + ((i * 19) % 10) * 0.9;
      this.motePositions[i * 3 + 2] = -((i * 29) % 140) + 15;
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(this.motePositions, 3));
    const moteMat = new THREE.PointsMaterial({
      color: 0xd8f6ff,
      size: 0.16,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    this.atmospherePoints = new THREE.Points(moteGeo, moteMat);
    this.root.add(this.atmospherePoints);
  }

  private createBridgeChunk(
    includeSuspensionTower: boolean,
    deckMat: THREE.Material,
    curbMat: THREE.Material,
    railMat: THREE.Material,
    towerMat: THREE.Material,
    laneDashMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();

    // Roadway deck (playable width = 10.0m across [-5, +5], outer deck = 11.4m)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.7, CHUNK_LENGTH), deckMat);
    deck.position.set(0, -0.35, -CHUNK_LENGTH / 2);
    group.add(deck);

    // Left & Right hazard curbs + guardrails
    for (const sign of [-1, 1]) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, CHUNK_LENGTH), curbMat);
      curb.position.set(sign * 5.25, 0.11, -CHUNK_LENGTH / 2);
      group.add(curb);

      const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, CHUNK_LENGTH), railMat);
      topRail.position.set(sign * 5.52, 0.72, -CHUNK_LENGTH / 2);
      group.add(topRail);

      for (let pz = -4; pz >= -CHUNK_LENGTH + 2; pz -= 6) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.75, 0.16), railMat);
        post.position.set(sign * 5.52, 0.38, pz);
        group.add(post);
      }

      // Vertical suspension cables
      for (let cz = -5; cz >= -CHUNK_LENGTH + 3; cz -= 10) {
        const distNorm = Math.abs((cz + CHUNK_LENGTH / 2) / (CHUNK_LENGTH / 2));
        const cableH = 5.5 + distNorm * 4.5;
        const cable = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.035, cableH, 6),
          railMat
        );
        cable.position.set(sign * 5.8, cableH / 2, cz);
        group.add(cable);
      }
    }

    // Crisp center dashed lane line (dividing Left & Right gate lanes)
    for (let dz = -2.5; dz >= -CHUNK_LENGTH + 2; dz -= 5) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 2.6), laneDashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.015, dz);
      group.add(dash);
    }

    // Iconic Suspension Tower Pair
    if (includeSuspensionTower) {
      for (const sign of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(1.15, 18.5, 1.35), towerMat);
        leg.position.set(sign * 6.2, 6.8, -CHUNK_LENGTH / 2);
        group.add(leg);
      }
      const crossBeamHigh = new THREE.Mesh(new THREE.BoxGeometry(13.6, 1.1, 1.1), towerMat);
      crossBeamHigh.position.set(0, 13.8, -CHUNK_LENGTH / 2);
      const crossBeamMid = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.85, 0.95), towerMat);
      crossBeamMid.position.set(0, 9.2, -CHUNK_LENGTH / 2);
      group.add(crossBeamHigh, crossBeamMid);
    }

    return group;
  }

  private createBossPlatform(
    deckMat: THREE.Material,
    curbMat: THREE.Material,
    towerMat: THREE.Material
  ): THREE.Group {
    const group = new THREE.Group();
    const pad = new THREE.Mesh(new THREE.BoxGeometry(15.6, 0.82, 28), deckMat);
    pad.position.set(0, -0.38, -12);
    group.add(pad);

    for (const sign of [-1, 1]) {
      const border = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 28), curbMat);
      border.position.set(sign * 7.45, 0.17, -12);
      group.add(border);

      const pylon = new THREE.Mesh(new THREE.BoxGeometry(1.3, 9.5, 1.3), towerMat);
      pylon.position.set(sign * 7.5, 4.5, -24);
      group.add(pylon);
    }

    return group;
  }

  public configureBossPlatformZ(bossStartZ: number): void {
    this.bossPlatform.position.set(0, 0.01, bossStartZ + 8);
  }

  /**
   * Zero-allocation per-frame update recycling modular bridge spans & ocean position around cameraZ.
   */
  public update(dt: number, elapsedSeconds: number, squadZ: number): void {
    this.waterUniforms.uTime.value = elapsedSeconds;
    this.waterMesh.position.z = squadZ - 130;

    // Recycle chunks smoothly ahead of the squad so Endless Mode & long stages never run out of bridge
    const totalSpan = CHUNK_COUNT * CHUNK_LENGTH;
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      if (chunk.position.z - CHUNK_LENGTH > squadZ + 38) {
        chunk.position.z -= totalSpan;
      } else if (chunk.position.z < squadZ - totalSpan + 38) {
        chunk.position.z += totalSpan;
      }
    }

    // Drift atmospheric motes cleanly around squadZ
    const posAttr = this.atmospherePoints.geometry.getAttribute(
      'position'
    ) as THREE.BufferAttribute;
    for (let i = 0; i < this.moteCount; i++) {
      const base = i * 3;
      let mx = this.motePositions[base] + dt * 0.45;
      if (mx > 18) {
        mx = -18;
      }
      this.motePositions[base] = mx;

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
