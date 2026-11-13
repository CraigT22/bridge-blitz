import * as THREE from 'three';

export interface RoadwayTextures {
  readonly albedo: THREE.CanvasTexture;
  readonly bump: THREE.CanvasTexture;
  readonly roughness: THREE.CanvasTexture;
  readonly hazardCurb: THREE.CanvasTexture;
  readonly steelPlate: THREE.CanvasTexture;
  readonly tireTread: THREE.CanvasTexture;
  readonly causewayAlbedo: THREE.CanvasTexture;
  readonly causewayBump: THREE.CanvasTexture;
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

  // Base warm sunlit weathered concrete-asphalt bridge deck (high contrast for cel-outlines & black tires!)
  aCtx.fillStyle = '#9a9186';
  aCtx.fillRect(0, 0, w, h);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, w, h);
  rCtx.fillStyle = '#d4d4d4';
  rCtx.fillRect(0, 0, w, h);

  // Fine stone aggregate & subtle vehicle wear ruts
  const aImg = aCtx.getImageData(0, 0, w, h);
  const bImg = bCtx.getImageData(0, 0, w, h);
  const rImg = rCtx.getImageData(0, 0, w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const u = x / w;

      // Subtle tire-wear tracks in left (~0.28) and right (~0.72) lanes
      const leftLaneDist = Math.abs(u - 0.285);
      const rightLaneDist = Math.abs(u - 0.715);
      const rut =
        Math.exp(-leftLaneDist * leftLaneDist * 190) +
        Math.exp(-rightLaneDist * rightLaneDist * 190);

      // Subtle per-slab tonal variation across a 4x4 concrete deck grid
      const slabCol = Math.floor(x / 128);
      const slabRow = Math.floor(y / 128);
      const slabTone = ((slabCol * 7 + slabRow * 13) % 5 - 2) * 3.2;

      const grain = (rand() - 0.5) * 18 + (rand() - 0.5) * 10;
      const coarse = Math.sin(x * 0.08) * Math.cos(y * 0.07) * 4;
      const baseVal = 152 + slabTone - rut * 9 + grain * 0.55 + coarse;

      aImg.data[idx] = Math.max(92, Math.min(208, baseVal + 8));
      aImg.data[idx + 1] = Math.max(88, Math.min(198, baseVal + 1));
      aImg.data[idx + 2] = Math.max(80, Math.min(186, baseVal - 9));
      aImg.data[idx + 3] = 255;

      const bumpVal = Math.max(0, Math.min(255, 128 + grain * 2.1));
      bImg.data[idx] = bumpVal;
      bImg.data[idx + 1] = bumpVal;
      bImg.data[idx + 2] = bumpVal;
      bImg.data[idx + 3] = 255;

      const roughVal = Math.max(95, Math.min(242, 206 - rut * 42 + grain * 0.8));
      rImg.data[idx] = roughVal;
      rImg.data[idx + 1] = roughVal;
      rImg.data[idx + 2] = roughVal;
      rImg.data[idx + 3] = 255;
    }
  }

  aCtx.putImageData(aImg, 0, 0);
  bCtx.putImageData(bImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);

  // Recessed concrete slab expansion grid joints (4 columns x 4 rows per 10m tile)
  for (let gx = 128; gx < w; gx += 128) {
    aCtx.fillStyle = 'rgba(66, 60, 54, 0.58)';
    aCtx.fillRect(gx - 2, 0, 4, h);
    aCtx.fillStyle = 'rgba(218, 208, 194, 0.34)';
    aCtx.fillRect(gx + 2, 0, 2, h);
    bCtx.fillStyle = '#383838';
    bCtx.fillRect(gx - 2, 0, 4, h);
  }
  for (let gy = 0; gy < h; gy += 128) {
    const isMainJoint = gy === 0;
    aCtx.fillStyle = isMainJoint ? '#423d37' : 'rgba(66, 60, 54, 0.62)';
    aCtx.fillRect(0, gy, w, isMainJoint ? 7 : 4);
    aCtx.fillStyle = 'rgba(222, 212, 198, 0.38)';
    aCtx.fillRect(0, gy + (isMainJoint ? 7 : 4), w, 2);
    bCtx.fillStyle = '#303030';
    bCtx.fillRect(0, gy, w, isMainJoint ? 7 : 4);
  }

  // Weathered concrete hairline cracks + bevel highlights
  for (let c = 0; c < 11; c++) {
    let cx = rand() * w;
    let cy = rand() * h;
    aCtx.strokeStyle = 'rgba(64, 58, 52, 0.52)';
    bCtx.strokeStyle = 'rgba(42, 42, 42, 0.72)';
    aCtx.lineWidth = 1.5;
    bCtx.lineWidth = 2.0;
    aCtx.beginPath();
    bCtx.beginPath();
    aCtx.moveTo(cx, cy);
    bCtx.moveTo(cx, cy);
    for (let s = 0; s < 5; s++) {
      cx += (rand() - 0.5) * 32;
      cy += rand() * 24;
      aCtx.lineTo(cx, cy);
      bCtx.lineTo(cx, cy);
    }
    aCtx.stroke();
    bCtx.stroke();
  }

  // Painted worn amber shoulder lines & crisp ivory center tactical dashes
  aCtx.fillStyle = 'rgba(214, 152, 36, 0.78)';
  aCtx.fillRect(20, 0, 7, h);
  aCtx.fillRect(w - 27, 0, 7, h);

  aCtx.fillStyle = 'rgba(248, 245, 236, 0.72)';
  for (let dy = 26; dy < h; dy += 128) {
    aCtx.fillRect(w / 2 - 4, dy, 8, 72);
  }

  const configureRepeat = (tex: THREE.CanvasTexture, rx: number, ry: number, srgb: boolean) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(rx, ry);
    tex.anisotropy = 4;
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

  // 5. Fortified Split-Causeway Cut-Stone Paver Deck (Crisp 6x6 Ashlar Grid + Beveled Mortar Seams)
  const cwCanvas = document.createElement('canvas');
  cwCanvas.width = 512;
  cwCanvas.height = 512;
  const cwCtx = cwCanvas.getContext('2d')!;

  const cwbCanvas = document.createElement('canvas');
  cwbCanvas.width = 512;
  cwbCanvas.height = 512;
  const cwbCtx = cwbCanvas.getContext('2d')!;

  cwCtx.fillStyle = '#aea392';
  cwCtx.fillRect(0, 0, 512, 512);
  cwbCtx.fillStyle = '#888888';
  cwbCtx.fillRect(0, 0, 512, 512);

  const cells = 6;
  const cellW = 512 / cells;
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const px = col * cellW;
      const py = row * cellW;
      const tone = ((col * 11 + row * 17) % 7 - 3) * 4.5;
      const r = Math.round(178 + tone);
      const g = Math.round(166 + tone * 0.95);
      const b = Math.round(147 + tone * 0.85);
      cwCtx.fillStyle = `rgb(${r},${g},${b})`;
      cwCtx.fillRect(px + 3, py + 3, cellW - 5, cellW - 5);

      // Sunlit top/left stone bevel highlight
      cwCtx.fillStyle = 'rgba(244, 234, 214, 0.42)';
      cwCtx.fillRect(px + 3, py + 3, cellW - 5, 2.5);
      cwCtx.fillRect(px + 3, py + 3, 2.5, cellW - 5);

      // Deep recessed mortar joint
      cwCtx.fillStyle = 'rgba(64, 57, 49, 0.78)';
      cwCtx.fillRect(px, py, cellW, 3.5);
      cwCtx.fillRect(px, py, 3.5, cellW);

      cwbCtx.fillStyle = '#2c2c2c';
      cwbCtx.fillRect(px, py, cellW, 4);
      cwbCtx.fillRect(px, py, 4, cellW);
    }
  }

  // Subtle surface stone speckle & weathered battle cracks across pavers
  for (let i = 0; i < 900; i++) {
    const sx = rand() * 512;
    const sy = rand() * 512;
    const dark = rand() > 0.5;
    cwCtx.fillStyle = dark ? 'rgba(58, 50, 42, 0.14)' : 'rgba(245, 236, 220, 0.14)';
    cwCtx.fillRect(sx, sy, 2 + rand() * 4, 2 + rand() * 4);
  }
  for (let c = 0; c < 16; c++) {
    let cx = rand() * 512;
    let cy = rand() * 512;
    cwCtx.strokeStyle = 'rgba(62, 54, 46, 0.52)';
    cwbCtx.strokeStyle = 'rgba(34, 34, 34, 0.72)';
    cwCtx.lineWidth = 1.6;
    cwbCtx.lineWidth = 2.2;
    cwCtx.beginPath();
    cwbCtx.beginPath();
    cwCtx.moveTo(cx, cy);
    cwbCtx.moveTo(cx, cy);
    for (let s = 0; s < 4; s++) {
      cx += (rand() - 0.5) * 28;
      cy += (rand() - 0.3) * 24;
      cwCtx.lineTo(cx, cy);
      cwbCtx.lineTo(cx, cy);
    }
    cwCtx.stroke();
    cwbCtx.stroke();
  }

  const causewayAlbedo = configureRepeat(new THREE.CanvasTexture(cwCanvas), 1, 4, true);
  const causewayBump = configureRepeat(new THREE.CanvasTexture(cwbCanvas), 1, 4, false);

  return {
    albedo,
    bump,
    roughness,
    causewayAlbedo,
    causewayBump,
    hazardCurb,
    steelPlate,
    tireTread,
  };
}

/**
 * Dramatic Golden-Hour Sunset Sky Dome with sun disc, drifting cloud bands,
 * and distant jagged bay mountain silhouettes (strictly GLSL ES 3.00 safe:
 * zero atan(y,0) divisions and strictly positive pow() bases).
 */
export function createGoldenHourSkyDome(): {
  mesh: THREE.Mesh;
  uniforms: { uTime: { value: number } };
} {
  const uniforms = {
    uTime: { value: 0 },
  };

  const geo = new THREE.SphereGeometry(235, 36, 24);
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
        float sunCos = max(0.0001, dot(dir, sunDir));
        col += vec3(0.95, 0.48, 0.18) * pow(sunCos, 6.0) * 0.68;
        col += vec3(1.38, 0.94, 0.56) * smoothstep(0.9962, 0.9992, sunCos);

        // Stratified sunset clouds lit from underneath
        if (y > 0.01) {
          vec2 cloudUv = dir.xz / (y + 0.18) * 1.45 + vec2(uTime * 0.012, -uTime * 0.006);
          float c1 = noise2(cloudUv * 2.2);
          float c2 = noise2(cloudUv * 5.1 - 3.4);
          float cloud = smoothstep(0.47, 0.78, c1 * 0.68 + c2 * 0.32) * smoothstep(0.01, 0.11, y) * (1.0 - smoothstep(0.38, 0.72, y));
          vec3 cloudDark = vec3(0.14, 0.13, 0.20);
          vec3 cloudRim = vec3(0.98, 0.55, 0.28);
          vec3 cloudCol = mix(cloudDark, cloudRim, pow(sunCos, 2.2) * 0.85 + 0.15);
          col = mix(col, cloudCol, cloud * 0.68);
        }

        // Distant jagged bay headlands along horizon (computed without atan division!)
        float ridgeWave =
          0.028 +
          0.024 * sin(dir.x * 3.8 + dir.z * 2.1 + 0.7) +
          0.012 * sin(dir.x * 9.5 - dir.z * 7.4 - 1.2) +
          0.006 * cos(dir.x * 18.0 + dir.z * 13.0);
        float channelClear = smoothstep(0.09, 0.36, abs(dir.x));
        float ridge1 = ridgeWave * channelClear;

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
