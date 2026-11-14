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
 * Deterministic PRNG so procedural surface wear & brushed titanium grain are 100% consistent.
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

function drawChevron(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  halfW: number,
  rise: number,
  thickness: number
): void {
  ctx.beginPath();
  ctx.moveTo(cx - halfW, cy + rise);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + halfW, cy + rise);
  ctx.lineTo(cx + halfW, cy + rise + thickness);
  ctx.lineTo(cx, cy + thickness);
  ctx.lineTo(cx - halfW, cy + rise + thickness);
  ctx.closePath();
  ctx.fill();
}

export function createProceduralSurfaceTextures(): RoadwayTextures {
  const rand = mulberry32(7015);

  // 1. Midnight Storm Brushed Slate-Titanium Armored Viaduct Deck (Albedo + Bump + Roughness)
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

  // Cool medium-slate brushed titanium base (crisp moonlit contrast against dark cel-outlines)
  aCtx.fillStyle = '#4a5c73';
  aCtx.fillRect(0, 0, w, h);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, w, h);
  rCtx.fillStyle = '#bcbcbc';
  rCtx.fillRect(0, 0, w, h);

  const aImg = aCtx.getImageData(0, 0, w, h);
  const bImg = bCtx.getImageData(0, 0, w, h);
  const rImg = rCtx.getImageData(0, 0, w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const u = x / w;

      // Subtle rain-slicked tactical transit tracks in left (~0.28) and right (~0.72) corridors
      const leftLaneDist = Math.abs(u - 0.285);
      const rightLaneDist = Math.abs(u - 0.715);
      const trackPolish =
        Math.exp(-leftLaneDist * leftLaneDist * 180) +
        Math.exp(-rightLaneDist * rightLaneDist * 180);

      // Armored naval deck plate grid (4 columns x 4 rows)
      const plateCol = Math.floor(x / 128);
      const plateRow = Math.floor(y / 128);
      const plateTone = ((plateCol * 7 + plateRow * 13) % 5 - 2) * 3.4;

      // Fine longitudinal brushed steel grain + diamond deck micro-tread
      const brush = (rand() - 0.5) * 11 + Math.sin(x * 0.42) * 2.5;
      const tread = ((x + y) % 8 === 0 || (x - y + 512) % 8 === 0) ? 4.5 : 0;
      const baseVal = 84 + plateTone - trackPolish * 5 + brush * 0.55 + tread;

      aImg.data[idx] = Math.max(46, Math.min(136, baseVal - 12));
      aImg.data[idx + 1] = Math.max(58, Math.min(156, baseVal + 4));
      aImg.data[idx + 2] = Math.max(74, Math.min(182, baseVal + 24));
      aImg.data[idx + 3] = 255;

      const bumpVal = Math.max(0, Math.min(255, 128 + tread * 5 + brush * 1.6));
      bImg.data[idx] = bumpVal;
      bImg.data[idx + 1] = bumpVal;
      bImg.data[idx + 2] = bumpVal;
      bImg.data[idx + 3] = 255;

      // Rain-sheen wet metallic polish along transit lanes
      const roughVal = Math.max(68, Math.min(224, 174 - trackPolish * 54 + brush * 0.9));
      rImg.data[idx] = roughVal;
      rImg.data[idx + 1] = roughVal;
      rImg.data[idx + 2] = roughVal;
      rImg.data[idx + 3] = 255;
    }
  }

  aCtx.putImageData(aImg, 0, 0);
  bCtx.putImageData(bImg, 0, 0);
  rCtx.putImageData(rImg, 0, 0);

  // Recessed armored steel expansion seams + silver-cyan edge bevels + flush rivets
  for (let gx = 128; gx < w; gx += 128) {
    aCtx.fillStyle = 'rgba(18, 26, 38, 0.78)';
    aCtx.fillRect(gx - 2, 0, 4, h);
    aCtx.fillStyle = 'rgba(148, 192, 228, 0.32)';
    aCtx.fillRect(gx + 2, 0, 2, h);
    bCtx.fillStyle = '#282828';
    bCtx.fillRect(gx - 2, 0, 4, h);
  }
  for (let gy = 0; gy < h; gy += 128) {
    const isMainJoint = gy === 0;
    aCtx.fillStyle = isMainJoint ? '#141d2b' : 'rgba(18, 26, 38, 0.76)';
    aCtx.fillRect(0, gy, w, isMainJoint ? 7 : 4);
    aCtx.fillStyle = 'rgba(154, 198, 236, 0.36)';
    aCtx.fillRect(0, gy + (isMainJoint ? 7 : 4), w, 2);
    bCtx.fillStyle = '#242424';
    bCtx.fillRect(0, gy, w, isMainJoint ? 7 : 4);

    // Flush structural deck bolts near transverse joints
    aCtx.fillStyle = 'rgba(168, 204, 235, 0.48)';
    for (let bx = 36; bx < w - 24; bx += 64) {
      aCtx.fillRect(bx - 2, gy + 12, 4, 4);
      if (gy + 112 < h) {
        aCtx.fillRect(bx - 2, gy + 112, 4, 4);
      }
    }
  }

  // Glowing Electric-Teal Outer Telemetry Conduit Strips
  aCtx.fillStyle = 'rgba(20, 232, 208, 0.26)';
  aCtx.fillRect(14, 0, 18, h);
  aCtx.fillRect(w - 32, 0, 18, h);
  aCtx.fillStyle = '#2af5d8';
  aCtx.fillRect(20, 0, 6, h);
  aCtx.fillRect(w - 26, 0, 6, h);

  // Center Spine Segmented Ice-Cyan Telemetry Rail
  for (let dy = 20; dy < h; dy += 128) {
    aCtx.fillStyle = 'rgba(42, 245, 216, 0.22)';
    aCtx.fillRect(w / 2 - 9, dy - 4, 18, 84);
    aCtx.fillStyle = 'rgba(196, 244, 255, 0.86)';
    aCtx.fillRect(w / 2 - 3, dy, 6, 76);
  }

  // Forward Tactical Lane Chevrons in Left & Right Corridors
  for (let cy = 44; cy < h; cy += 128) {
    aCtx.fillStyle = 'rgba(42, 245, 216, 0.36)';
    drawChevron(aCtx, 146, cy, 26, 16, 8);
    drawChevron(aCtx, w - 146, cy, 26, 16, 8);
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

  // 2. Obsidian & Electric-Cyan / Volt-Amber Viaduct Caution Curb Texture
  const curbCanvas = document.createElement('canvas');
  curbCanvas.width = 128;
  curbCanvas.height = 256;
  const cCtx = curbCanvas.getContext('2d')!;
  cCtx.fillStyle = '#131b26';
  cCtx.fillRect(0, 0, 128, 256);
  for (let y = -128; y < 384; y += 64) {
    cCtx.fillStyle = ((y / 64) & 1) === 0 ? '#22e6d2' : '#ff9e2c';
    cCtx.beginPath();
    cCtx.moveTo(0, y);
    cCtx.lineTo(128, y + 44);
    cCtx.lineTo(128, y + 70);
    cCtx.lineTo(0, y + 26);
    cCtx.closePath();
    cCtx.fill();
  }
  cCtx.fillStyle = 'rgba(10, 15, 22, 0.25)';
  for (let i = 0; i < 140; i++) {
    cCtx.fillRect(rand() * 128, rand() * 256, 2 + rand() * 7, 2 + rand() * 5);
  }
  const hazardCurb = configureRepeat(new THREE.CanvasTexture(curbCanvas), 1, 14, true);

  // 3. Riveted Obsidian-Titanium Naval Truss Plate Texture
  const steelCanvas = document.createElement('canvas');
  steelCanvas.width = 256;
  steelCanvas.height = 256;
  const sCtx = steelCanvas.getContext('2d')!;
  sCtx.fillStyle = '#6c7c90';
  sCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 650; i++) {
    const shade = 92 + Math.floor(rand() * 44);
    sCtx.fillStyle = `rgba(${shade - 6},${shade + 4},${shade + 16},0.22)`;
    sCtx.fillRect(rand() * 256, rand() * 256, 2 + rand() * 18, 1 + rand() * 3);
  }
  sCtx.strokeStyle = 'rgba(16, 23, 34, 0.65)';
  sCtx.lineWidth = 3;
  sCtx.strokeRect(4, 4, 248, 120);
  sCtx.strokeRect(4, 132, 248, 120);
  sCtx.fillStyle = '#b4cae0';
  for (let rx = 16; rx < 248; rx += 28) {
    for (const ry of [14, 114, 142, 242]) {
      sCtx.beginPath();
      sCtx.arc(rx, ry, 3, 0, Math.PI * 2);
      sCtx.fill();
    }
  }
  const steelPlate = configureRepeat(new THREE.CanvasTexture(steelCanvas), 1, 4, false);

  // 4. Bolted Hex-Armor Composite Barricade Texture (replaces rubber tire tread)
  const tireCanvas = document.createElement('canvas');
  tireCanvas.width = 256;
  tireCanvas.height = 128;
  const tCtx = tireCanvas.getContext('2d')!;
  tCtx.fillStyle = '#263447';
  tCtx.fillRect(0, 0, 256, 128);
  for (let tx = 0; tx < 256; tx += 32) {
    tCtx.fillStyle = '#3c5069';
    tCtx.fillRect(tx + 3, 8, 26, 48);
    tCtx.fillRect(tx + 3, 72, 26, 48);
    tCtx.fillStyle = 'rgba(166, 212, 248, 0.38)';
    tCtx.fillRect(tx + 3, 8, 26, 3);
    tCtx.fillRect(tx + 3, 72, 26, 3);
  }
  tCtx.fillStyle = '#24f0d2';
  tCtx.fillRect(0, 61, 256, 6);
  const tireTread = configureRepeat(new THREE.CanvasTexture(tireCanvas), 3, 1, true);

  // 5. Split-Causeway Interlocked Hex-Plate Armored Naval Deck (Left Ordnance Teal / Right Breach Crimson)
  const cwCanvas = document.createElement('canvas');
  cwCanvas.width = 512;
  cwCanvas.height = 512;
  const cwCtx = cwCanvas.getContext('2d')!;

  const cwbCanvas = document.createElement('canvas');
  cwbCanvas.width = 512;
  cwbCanvas.height = 512;
  const cwbCtx = cwbCanvas.getContext('2d')!;

  cwCtx.fillStyle = '#44566d';
  cwCtx.fillRect(0, 0, 512, 512);
  cwbCtx.fillStyle = '#808080';
  cwbCtx.fillRect(0, 0, 512, 512);

  // Staggered armored steel bulkhead tiles (8 rows x 6 cols, zero tan stone pavers!)
  const cols = 6;
  const rows = 8;
  const cellW = 512 / cols;
  const cellH = 512 / rows;
  for (let row = 0; row < rows; row++) {
    const stagger = (row & 1) === 1 ? cellW * 0.5 : 0;
    for (let col = -1; col <= cols; col++) {
      const px = col * cellW + stagger;
      const py = row * cellH;
      const centerX = px + cellW * 0.5;
      const isRightCorridor = centerX > 256;
      const tone = (((col + 4) * 11 + row * 17) % 7 - 3) * 3.8;
      const r = Math.round((isRightCorridor ? 76 : 64) + tone);
      const g = Math.round((isRightCorridor ? 84 : 86) + tone);
      const b = Math.round((isRightCorridor ? 104 : 112) + tone);
      cwCtx.fillStyle = `rgb(${r},${g},${b})`;
      cwCtx.fillRect(px + 2.5, py + 2.5, cellW - 5, cellH - 5);

      // Brushed metallic bevel highlight
      cwCtx.fillStyle = 'rgba(172, 214, 248, 0.30)';
      cwCtx.fillRect(px + 2.5, py + 2.5, cellW - 5, 2);

      // Deep armored seam
      cwCtx.fillStyle = 'rgba(16, 23, 34, 0.82)';
      cwCtx.fillRect(px, py, cellW, 3);
      cwCtx.fillRect(px, py, 3, cellH);

      cwbCtx.fillStyle = '#2a2a2a';
      cwbCtx.fillRect(px, py, cellW, 3.5);
      cwbCtx.fillRect(px, py, 3.5, cellH);
    }
  }

  // Left-Corridor Emerald-Teal Ordnance Guide Rails & Chevrons vs Right-Corridor Crimson Breach Hazard Chevrons
  cwCtx.fillStyle = '#24f2d2';
  cwCtx.fillRect(18, 0, 6, 512);
  cwCtx.fillStyle = '#ff3864';
  cwCtx.fillRect(512 - 24, 0, 6, 512);

  for (let cy = 38; cy < 512; cy += 128) {
    cwCtx.fillStyle = 'rgba(36, 242, 210, 0.42)';
    drawChevron(cwCtx, 132, cy, 34, 18, 9);

    // Right corridor chevrons point +Z (warning incoming syndicate surge!)
    cwCtx.fillStyle = 'rgba(255, 56, 100, 0.44)';
    cwCtx.beginPath();
    cwCtx.moveTo(380 - 34, cy);
    cwCtx.lineTo(380, cy + 18);
    cwCtx.lineTo(380 + 34, cy);
    cwCtx.lineTo(380 + 34, cy + 9);
    cwCtx.lineTo(380, cy + 27);
    cwCtx.lineTo(380 - 34, cy + 9);
    cwCtx.closePath();
    cwCtx.fill();
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
 * Midnight Storm Viaduct Sky Dome — deep storm-indigo zenith, moonlit ice-cyan
 * storm-eye clouds, distant amber-teal naval storm beacon band, and jagged fortress headlands.
 * Keeps `createGoldenHourSkyDome` symbol name for drop-in SceneManager compatibility.
 * Strictly GLSL ES 3.00 safe: zero atan(y,0) divisions and strictly positive pow() bases.
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

        // Midnight Storm gradient: abyssal indigo zenith -> electric storm-slate -> cyan/teal horizon
        vec3 zenith = vec3(0.022, 0.048, 0.115);
        vec3 upperStorm = vec3(0.058, 0.125, 0.235);
        vec3 stormBand = vec3(0.095, 0.265, 0.405);
        vec3 horizonGlow = vec3(0.145, 0.395, 0.525);

        float h1 = smoothstep(-0.02, 0.15, y);
        float h2 = smoothstep(0.11, 0.42, y);
        float h3 = smoothstep(0.36, 0.86, y);

        vec3 col = mix(horizonGlow, stormBand, h1);
        col = mix(col, upperStorm, h2);
        col = mix(col, zenith, h3);

        // Subtle distant naval blockade amber-crimson horizon flare on far right
        vec3 siegeDir = normalize(vec3(0.52, 0.06, -0.85));
        float siegeCos = max(0.0001, dot(dir, siegeDir));
        col += vec3(0.62, 0.24, 0.12) * pow(siegeCos, 9.0) * 0.34;

        // Crisp Moonlit Storm-Eye Halo & Pale Ice Moon ahead-left of the viaduct
        vec3 moonDir = normalize(vec3(-0.36, 0.25, -0.89));
        float moonCos = max(0.0001, dot(dir, moonDir));
        col += vec3(0.18, 0.62, 0.85) * pow(moonCos, 6.5) * 0.62;
        col += vec3(1.18, 1.42, 1.58) * smoothstep(0.9968, 0.9993, moonCos);

        // Rolling storm clouds rim-lit by ice-cyan moonlight + subtle distant lightning pulse
        if (y > 0.01) {
          vec2 cloudUv = dir.xz / (y + 0.18) * 1.55 + vec2(uTime * 0.018, -uTime * 0.009);
          float c1 = noise2(cloudUv * 2.3);
          float c2 = noise2(cloudUv * 5.4 - 2.8);
          float cloud = smoothstep(0.45, 0.78, c1 * 0.66 + c2 * 0.34) * smoothstep(0.01, 0.11, y) * (1.0 - smoothstep(0.40, 0.76, y));
          float flash = pow(max(0.0001, 0.5 + 0.5 * sin(uTime * 1.9 + c1 * 4.2)), 14.0) * 0.35;
          vec3 cloudDark = vec3(0.045, 0.082, 0.148);
          vec3 cloudRim = vec3(0.28, 0.78, 0.96) + vec3(0.35, 0.85, 1.0) * flash;
          vec3 cloudCol = mix(cloudDark, cloudRim, pow(moonCos, 2.2) * 0.82 + 0.16);
          col = mix(col, cloudCol, cloud * 0.72);
        }

        // Distant jagged armored bay headlands along horizon
        float ridgeWave =
          0.030 +
          0.025 * sin(dir.x * 4.1 + dir.z * 2.3 + 0.9) +
          0.013 * sin(dir.x * 9.8 - dir.z * 7.1 - 1.4) +
          0.006 * cos(dir.x * 18.5 + dir.z * 12.5);
        float channelClear = smoothstep(0.09, 0.36, abs(dir.x));
        float ridge1 = ridgeWave * channelClear;

        if (y > -0.04 && y < ridge1) {
          vec3 mtnCol = mix(vec3(0.035, 0.062, 0.105), vec3(0.085, 0.175, 0.255), pow(moonCos, 3.0));
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
