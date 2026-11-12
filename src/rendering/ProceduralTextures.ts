import * as THREE from 'three';

export interface RoadwayTextures {
  readonly albedo: THREE.CanvasTexture;
  readonly bump: THREE.CanvasTexture;
  readonly roughness: THREE.CanvasTexture;
  readonly hazardCurb: THREE.CanvasTexture;
  readonly steelPlate: THREE.CanvasTexture;
  readonly tireTread: THREE.CanvasTexture;
}

/**
 * Deterministic PRNG so procedural surface wear & aggregate grain are 100% consistent.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createProceduralSurfaceTextures(): RoadwayTextures {
  const rand = mulberry32(1337);

  // 1. Weathered Tactical Asphalt Deck (Albedo + Bump + Roughness)
  const w = 512;
  const h = 512;
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = w;
  albedoCanvas.height = h;
  const aCtx = albedoCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = w;
  roughCanvas.height = h;
  const rCtx = roughCanvas.getContext('2d')!;

  // Base weathered charcoal asphalt
  aCtx.fillStyle = '#252930';
  aCtx.fillRect(0, 0, w, h);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, w, h);
  rCtx.fillStyle = '#d8d8d8';
  rCtx.fillRect(0, 0, w, h);

  // Fine stone aggregate & battle wear speckles
  const aImg = aCtx.getImageData(0, 0, w, h);
  const bImg = bCtx.getImageData(0, 0, w, h);
  const rImg = rCtx.getImageData(0, 0, w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const u = x / w; // 0..1 across 11.4m bridge width

      // Subtle darkened vehicle tire ruts in left (~0.28) and right (~0.72) lanes
      const leftLaneDist = Math.abs(u - 0.285);
      const rightLaneDist = Math.abs(u - 0.715);
      const rut =
        Math.exp(-leftLaneDist * leftLaneDist * 190) +
        Math.exp(-rightLaneDist * rightLaneDist * 190);

      const grain = (rand() - 0.5) * 24 + (rand() - 0.5) * 14;
      const coarse = Math.sin(x * 0.09) * Math.cos(y * 0.07) * 5;
      const baseVal = 36 - rut * 7 + grain * 0.65 + coarse;

      aImg.data[idx] = Math.max(14, Math.min(82, baseVal + 1));
      aImg.data[idx + 1] = Math.max(16, Math.min(85, baseVal + 3));
      aImg.data[idx + 2] = Math.max(20, Math.min(92, baseVal + 8));
      aImg.data[idx + 3] = 255;

      const bumpVal = Math.max(0, Math.min(255, 128 + grain * 2.4));
      bImg.data[idx] = bumpVal;
      bImg.data[idx + 1] = bumpVal;
      bImg.data[idx + 2] = bumpVal;
      bImg.data[idx + 3] = 255;

      // Tire ruts are slightly smoother (more specular sheen at golden hour!)
      const roughVal = Math.max(85, Math.min(245, 218 - rut * 58 + grain * 0.9));
      rImg.data[idx] = roughVal;
      rImg.data[idx + 1] = roughVal;
      rImg.data[idx + 2] = roughVal;
      rImg.data[idx + 3] = 255;
    }
  }

  aCtx.putImageData(aImg, 0, 0);
  bCtx.putImageData(bImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);

  // Steel expansion joint strip across top of tile + weathered cracks
  aCtx.fillStyle = '#171a1f';
  aCtx.fillRect(0, 0, w, 8);
  aCtx.fillStyle = '#47515e';
  aCtx.fillRect(0, 2, w, 3);
  bCtx.fillStyle = '#282828';
  bCtx.fillRect(0, 0, w, 8);
  rCtx.fillStyle = '#686868';
  rCtx.fillRect(0, 2, w, 4);

  // Weathered asphalt cracks
  aCtx.strokeStyle = 'rgba(12, 14, 18, 0.65)';
  bCtx.strokeStyle = 'rgba(30, 30, 30, 0.8)';
  for (let c = 0; c < 9; c++) {
    let cx = rand() * w;
    let cy = rand() * h;
    aCtx.lineWidth = 1.4;
    bCtx.lineWidth = 2.0;
    aCtx.beginPath();
    bCtx.beginPath();
    aCtx.moveTo(cx, cy);
    bCtx.moveTo(cx, cy);
    for (let s = 0; s < 6; s++) {
      cx += (rand() - 0.5) * 34;
      cy += rand() * 28;
      aCtx.lineTo(cx, cy);
      bCtx.lineTo(cx, cy);
    }
    aCtx.stroke();
    bCtx.stroke();
  }

  // Painted worn shoulder lines & center tactical double/dashed markings
  aCtx.fillStyle = 'rgba(218, 165, 58, 0.78)';
  aCtx.fillRect(22, 0, 7, h);
  aCtx.fillRect(w - 29, 0, 7, h);

  // Subtle worn center double-divider guide & dashed lane stripe
  aCtx.fillStyle = 'rgba(226, 232, 240, 0.85)';
  for (let dy = 24; dy < h; dy += 128) {
    aCtx.fillRect(w / 2 - 5, dy, 10, 74);
  }

  const configureRepeat = (tex: THREE.CanvasTexture, rx: number, ry: number, srgb: boolean) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(rx, ry);
    tex.anisotropy = 8;
    if (srgb) {
      tex.colorSpace = THREE.SRGBColorSpace;
    }
    return tex;
  };

  const albedo = configureRepeat(new THREE.CanvasTexture(albedoCanvas), 1, 4, true);
  const bump = configureRepeat(new THREE.CanvasTexture(bumpCanvas), 1, 4, false);
  const roughness = configureRepeat(new THREE.CanvasTexture(roughCanvas), 1, 4, false);

  // 2. Diagonal Yellow/Black Weathered Hazard Curb Texture
  const curbCanvas = document.createElement('canvas');
  curbCanvas.width = 128;
  curbCanvas.height = 256;
  const cCtx = curbCanvas.getContext('2d')!;
  cCtx.fillStyle = '#d49424';
  cCtx.fillRect(0, 0, 128, 256);
  cCtx.fillStyle = '#1d2128';
  for (let y = -128; y < 384; y += 64) {
    cCtx.beginPath();
    cCtx.moveTo(0, y);
    cCtx.lineTo(128, y + 48);
    cCtx.lineTo(128, y + 80);
    cCtx.lineTo(0, y + 32);
    cCtx.closePath();
    cCtx.fill();
  }
  // Grime & scuff overlay
  cCtx.fillStyle = 'rgba(18, 20, 24, 0.24)';
  for (let i = 0; i < 180; i++) {
    cCtx.fillRect(rand() * 128, rand() * 256, 2 + rand() * 8, 2 + rand() * 6);
  }
  const hazardCurb = configureRepeat(new THREE.CanvasTexture(curbCanvas), 1, 14, true);

  // 3. Riveted Structural Gunmetal / Steel Plate Texture
  const steelCanvas = document.createElement('canvas');
  steelCanvas.width = 256;
  steelCanvas.height = 256;
  const sCtx = steelCanvas.getContext('2d')!;
  sCtx.fillStyle = '#7e8791';
  sCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 700; i++) {
    const shade = 105 + Math.floor(rand() * 42);
    sCtx.fillStyle = `rgba(${shade},${shade + 2},${shade + 5},0.22)`;
    sCtx.fillRect(rand() * 256, rand() * 256, 2 + rand() * 16, 1 + rand() * 3);
  }
  sCtx.strokeStyle = 'rgba(24, 28, 34, 0.55)';
  sCtx.lineWidth = 3;
  sCtx.strokeRect(4, 4, 248, 120);
  sCtx.strokeRect(4, 132, 248, 120);
  sCtx.fillStyle = '#b6c0cb';
  for (let rx = 16; rx < 248; rx += 28) {
    for (const ry of [14, 114, 142, 242]) {
      sCtx.beginPath();
      sCtx.arc(rx, ry, 3, 0, Math.PI * 2);
      sCtx.fill();
    }
  }
  const steelPlate = configureRepeat(new THREE.CanvasTexture(steelCanvas), 1, 4, false);

  // 4. Heavy Military Off-Road Tire Tread Texture
  const tireCanvas = document.createElement('canvas');
  tireCanvas.width = 256;
  tireCanvas.height = 128;
  const tCtx = tireCanvas.getContext('2d')!;
  tCtx.fillStyle = '#181b20';
  tCtx.fillRect(0, 0, 256, 128);
  tCtx.fillStyle = '#2d333c';
  for (let tx = 0; tx < 256; tx += 16) {
    tCtx.fillRect(tx + 2, 8, 10, 48);
    tCtx.fillRect(tx + 8, 72, 10, 48);
  }
  const tireTread = configureRepeat(new THREE.CanvasTexture(tireCanvas), 4, 1, true);

  return {
    albedo,
    bump,
    roughness,
    hazardCurb,
    steelPlate,
    tireTread,
  };
}

/**
 * Generates a rich PBR environment map (PMREM) with warm golden-hour sun horizon,
 * cool slate-blue upper sky, and dark ocean/concrete bounce so gunmetal & armor gleam!
 */
export function createGoldenHourEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();

  const skyGeo = new THREE.SphereGeometry(40, 32, 24);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {},
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        float y = vDir.y;
        vec3 zenith = vec3(0.09, 0.15, 0.28);
        vec3 midSky = vec3(0.32, 0.26, 0.36);
        vec3 horizon = vec3(1.15, 0.52, 0.22);
        vec3 ground = vec3(0.08, 0.10, 0.13);

        vec3 col;
        if (y >= 0.0) {
          float t1 = smoothstep(0.0, 0.28, y);
          float t2 = smoothstep(0.22, 0.85, y);
          col = mix(horizon, midSky, t1);
          col = mix(col, zenith, t2);
        } else {
          col = mix(horizon * 0.45, ground, smoothstep(0.0, -0.35, y));
        }

        // Intense HDR sun lobe so gunmetal barrels & mech armor catch crisp specular highlights
        vec3 sunDir = normalize(vec3(-0.38, 0.24, -0.89));
        float sunDot = max(0.0, dot(normalize(vDir), sunDir));
        col += vec3(3.6, 2.1, 0.95) * pow(sunDot, 48.0);
        col += vec3(0.85, 0.42, 0.16) * pow(sunDot, 5.0);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  envScene.add(new THREE.Mesh(skyGeo, skyMat));

  const target = pmrem.fromScene(envScene, 0.02);
  skyGeo.dispose();
  skyMat.dispose();
  pmrem.dispose();
  return target.texture;
}

/**
 * Dramatic Golden-Hour Sunset Sky Dome with sun disc, drifting cloud bands,
 * and distant jagged bay mountain silhouettes.
 */
export function createGoldenHourSkyDome(): {
  mesh: THREE.Mesh;
  uniforms: { uTime: { value: number } };
} {
  const uniforms = {
    uTime: { value: 0 },
  };

  const geo = new THREE.SphereGeometry(235, 40, 28);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vWorldDir;
      void main() {
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vWorldDir;

      float hash11(float p) {
        p = fract(p * 0.1031);
        p *= p + 33.33;
        p *= p + p;
        return fract(p);
      }

      float noise2(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash11(i.x + i.y * 57.0);
        float b = hash11(i.x + 1.0 + i.y * 57.0);
        float c = hash11(i.x + (i.y + 1.0) * 57.0);
        float d = hash11(i.x + 1.0 + (i.y + 1.0) * 57.0);
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vec3 dir = normalize(vWorldDir);
        float y = dir.y;

        // Rich tactical twilight-to-golden-hour gradient
        vec3 zenith = vec3(0.065, 0.105, 0.195);
        vec3 upperHaze = vec3(0.21, 0.19, 0.28);
        vec3 sunsetBand = vec3(0.76, 0.35, 0.20);
        vec3 horizonGlow = vec3(0.96, 0.56, 0.26);

        float h1 = smoothstep(-0.02, 0.16, y);
        float h2 = smoothstep(0.12, 0.42, y);
        float h3 = smoothstep(0.35, 0.85, y);

        vec3 col = mix(horizonGlow, sunsetBand, h1);
        col = mix(col, upperHaze, h2);
        col = mix(col, zenith, h3);

        // Low-angle blazing sunset ahead-left of the bridge
        vec3 sunDir = normalize(vec3(-0.38, 0.21, -0.90));
        float sunCos = max(0.0, dot(dir, sunDir));
        col += vec3(0.95, 0.48, 0.18) * pow(sunCos, 6.0) * 0.65;
        col += vec3(1.35, 0.92, 0.55) * smoothstep(0.9965, 0.9992, sunCos);

        // Stratified sunset clouds lit from underneath
        if (y > 0.01) {
          vec2 cloudUv = dir.xz / (y + 0.16) * 1.45 + vec2(uTime * 0.012, -uTime * 0.006);
          float c1 = noise2(cloudUv * 2.2);
          float c2 = noise2(cloudUv * 5.1 - 3.4);
          float cloud = smoothstep(0.47, 0.78, c1 * 0.68 + c2 * 0.32) * smoothstep(0.01, 0.11, y) * (1.0 - smoothstep(0.38, 0.72, y));
          vec3 cloudDark = vec3(0.14, 0.13, 0.20);
          vec3 cloudRim = vec3(0.98, 0.55, 0.28);
          vec3 cloudCol = mix(cloudDark, cloudRim, pow(sunCos, 2.2) * 0.85 + 0.15);
          col = mix(col, cloudCol, cloud * 0.68);
        }

        // Distant jagged bay headlands / mountain ridge silhouette along the horizon
        float az = atan(dir.x, -dir.z);
        float ridge1 = 0.028 + 0.024 * sin(az * 3.1 + 0.7) + 0.012 * sin(az * 8.3 - 1.2) + 0.006 * cos(az * 17.0);
        // Leave open ocean channel right down the bridge axis (az ~ 0)
        float channelClear = smoothstep(0.08, 0.34, abs(az));
        ridge1 *= channelClear;

        if (y > -0.04 && y < ridge1) {
          vec3 mtnCol = mix(vec3(0.11, 0.11, 0.15), vec3(0.24, 0.16, 0.17), pow(sunCos, 3.0));
          col = mix(col, mtnCol, smoothstep(ridge1, ridge1 - 0.006, y));
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}
