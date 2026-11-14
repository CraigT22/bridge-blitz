import * as THREE from 'three';
import type { BossChassisId } from '../core/types';
import type { BossChassisRig } from './BossRigFactory';
import { attachWeldedOutlineNormals } from './ProceduralGeometries';

function createUnicornBossOutlineMaterial(): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({
    color: 0x080c14,
    side: THREE.BackSide,
  });
  mat.customProgramCacheKey = () => 'unicorn-boss-cel-outline-v72';
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
          vec3 safeBossNorm = aOutlineNormal / max(0.0001, length(aOutlineNormal));
          transformed += safeBossNorm * 0.032;
        }`
      );
  };
  return mat;
}

const _sharedUnicornBossOutlineMat = createUnicornBossOutlineMaterial();

function applyUnicornBossCelShader(mat: THREE.MeshStandardMaterial, cacheKey: string): void {
  mat.customProgramCacheKey = () => cacheKey;
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        varying vec3 vUniBossNormal;
        `
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `
        #include <begin_vertex>
        {
          vec3 bwn = mat3(modelMatrix) * objectNormal;
          vUniBossNormal = bwn / max(0.0001, length(bwn));
        }
        `
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        varying vec3 vUniBossNormal;
        `
      )
      .replace(
        '#include <dithering_fragment>',
        /* glsl */ `
        #include <dithering_fragment>
        {
          vec3 wn = vUniBossNormal / max(0.0001, length(vUniBossNormal));
          float celBand = smoothstep(-0.26, 0.36, wn.y * 0.58 + wn.z * 0.62 - wn.x * 0.18);
          gl_FragColor.rgb *= mix(0.95, 1.24, celBand);
          float skyRim = smoothstep(0.45, 0.90, wn.y);
          gl_FragColor.rgb += vec3(0.06, 0.10, 0.14) * skyRim;
        }
        `
      );
  };
}

function attachUnicornBossOutlines(root: THREE.Group): void {
  const targets: THREE.Mesh[] = [];
  root.traverse((obj) => {
    if (
      obj instanceof THREE.Mesh &&
      obj.material instanceof THREE.MeshStandardMaterial &&
      !obj.userData.isBossOutline
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
    const outline = new THREE.Mesh(geo, _sharedUnicornBossOutlineMat);
    outline.userData.isBossOutline = true;
    mesh.add(outline);
  }
}

interface UnicornBossMatSet {
  primaryMat: THREE.MeshStandardMaterial; // Royal-Blue or Kelly-Green Lead Barding
  accentMat: THREE.MeshStandardMaterial; // Counterpart Kelly-Green or Royal-Blue Armor
  trimMat: THREE.MeshStandardMaterial; // Royal Gold Trim & Hooves
  darkSteelMat: THREE.MeshStandardMaterial; // Pearl-Alabaster Equine Coat!
  glowMat: THREE.MeshBasicMaterial; // Blazing Horn / Gem / Halo Glow
  rainbowMats: readonly THREE.MeshStandardMaterial[];
  flashMaterials: THREE.MeshStandardMaterial[];
}

function createUnicornBossMaterials(tag: string): UnicornBossMatSet {
  // Note: `darkSteelMat` on BossChassisRig is preserved without color-overwrite by `BossEntity.configure`,
  // making it ideal for the luminous Pearl-Alabaster Equine Coat while `primaryMat`, `accentMat`, `trimMat`
  // receive the stage's Royal-Blue, Kelly-Green, and Royal-Gold team barding colors!
  const primaryMat = new THREE.MeshStandardMaterial({
    color: 0x1864f2,
    roughness: 0.28,
    metalness: 0.28,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x1ec95b,
    roughness: 0.28,
    metalness: 0.28,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0xffd238,
    roughness: 0.22,
    metalness: 0.44,
  });
  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0xf4f8ff,
    roughness: 0.34,
    metalness: 0.10,
  });

  applyUnicornBossCelShader(primaryMat, `uni-boss-prim-${tag}`);
  applyUnicornBossCelShader(accentMat, `uni-boss-acc-${tag}`);
  applyUnicornBossCelShader(trimMat, `uni-boss-trim-${tag}`);
  applyUnicornBossCelShader(darkSteelMat, `uni-boss-coat-${tag}`);

  const rainbowColors = [0xff2b55, 0xff8c1a, 0xffe62b, 0x22e868, 0x249dff, 0xb83bff];
  const rainbowMats = rainbowColors.map((hex, idx) => {
    const m = new THREE.MeshStandardMaterial({
      color: hex,
      emissive: hex,
      emissiveIntensity: 0.24,
      roughness: 0.26,
      metalness: 0.22,
    });
    applyUnicornBossCelShader(m, `uni-boss-rb-${tag}-${idx}`);
    return m;
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xfff08a,
  });

  return {
    primaryMat,
    accentMat,
    trimMat,
    darkSteelMat,
    glowMat,
    rainbowMats,
    flashMaterials: [primaryMat, accentMat, trimMat, darkSteelMat, ...rainbowMats],
  };
}

function createUnicornHazardRing(glowMat: THREE.MeshBasicMaterial, radius = 2.85): THREE.Mesh {
  const ringGeo = new THREE.RingGeometry(radius - 0.34, radius, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, glowMat);
  ring.position.y = 0.04;
  return ring;
}

/**
 * Builds the shared sculpted Giant Battle Unicorn Equine Chassis (`~4.8m..5.5m` tall)
 * with 4 articulated hooves (`spiderLegs`), heroic 3/4 stance (`0.20 rad`) + counter-turned
 * horned head (`turretGroup`), Royal-Blue & Kelly-Green Battle Barding, flowing Rainbow/Team
 * mane & tail, and archetype-specific Chariot Cannons, Pegasus Wings, or Sovereign Crown!
 */
function buildGiantBattleUnicornArchetype(chassis: BossChassisId): BossChassisRig {
  const isSovereign = chassis === 'SOVEREIGN_TITAN';
  const isPegasus = chassis === 'KRAKEN_WALKER';
  const isChariot = chassis === 'SIEGE_TANK';

  const mats = createUnicornBossMaterials(chassis.toLowerCase());
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const scaleFactor = isSovereign ? 1.14 : 1.0;
  const baseBodyY = isSovereign ? 1.88 : 1.65;
  bodyGroup.position.y = baseBodyY;

  const spinClusters: THREE.Group[] = [];
  const recoilBarrels: THREE.Group[] = [];

  // Stance container angled 0.20 rad so all 4 hooves, equine barrel, barding & tail read clearly!
  const stanceGroup = new THREE.Group();
  stanceGroup.rotation.y = 0.20;
  stanceGroup.scale.setScalar(scaleFactor);
  bodyGroup.add(stanceGroup);

  // 1. 4 Articulated Giant Equine Legs (`spiderLegs = [FL, FR, RL, RR]`) planting hooves at y = 0
  const buildGiantLeg = (isLeft: boolean): THREE.Group => {
    const leg = new THREE.Group();
    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.26, 0.78, 9),
      mats.darkSteelMat
    );
    thigh.position.set(0, -0.36, 0);

    const kneeArmor = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.27, 0),
      isLeft ? mats.primaryMat : mats.accentMat
    );
    kneeArmor.scale.set(1.05, 0.92, 1.15);
    kneeArmor.position.set(0, -0.74, 0.10);

    const cannon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.19, 0.64, 9),
      mats.darkSteelMat
    );
    cannon.position.set(0, -1.08, 0.02);

    const fetlock = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.26, 0.16, 9),
      isLeft ? mats.accentMat : mats.primaryMat
    );
    fetlock.position.set(0, -1.34, 0.04);

    const goldenHoof = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.33, 0.24, 9),
      mats.trimMat
    );
    goldenHoof.position.set(0, -1.50, 0.08);

    leg.add(thigh, kneeArmor, cannon, fetlock, goldenHoof);
    return leg;
  };

  const flLeg = new THREE.Group();
  flLeg.position.set(-0.58, -0.04, 0.92);
  flLeg.add(buildGiantLeg(true));

  const frLeg = new THREE.Group();
  frLeg.position.set(0.58, -0.04, 0.92);
  frLeg.add(buildGiantLeg(false));

  const rlLeg = new THREE.Group();
  rlLeg.position.set(-0.60, -0.04, -0.88);
  rlLeg.add(buildGiantLeg(true));

  const rrLeg = new THREE.Group();
  rrLeg.position.set(0.60, -0.04, -0.88);
  rrLeg.add(buildGiantLeg(false));

  stanceGroup.add(flLeg, frLeg, rlLeg, rrLeg);
  const spiderLegs: [THREE.Group, THREE.Group, THREE.Group, THREE.Group] = [
    flLeg,
    frLeg,
    rlLeg,
    rrLeg,
  ];

  // 2. Muscular Pearl-Alabaster Horse Barrel, Broad Chest & Hindquarters
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.90, 0.84, 2.12, 12),
    mats.darkSteelMat
  );
  barrel.rotation.x = Math.PI / 2;
  barrel.scale.set(1.08, 1.0, 0.96);
  barrel.position.set(0, 0.16, 0.02);
  stanceGroup.add(barrel);

  const chest = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 12, 10),
    mats.darkSteelMat
  );
  chest.scale.set(1.08, 1.05, 0.94);
  chest.position.set(0, 0.26, 0.88);
  stanceGroup.add(chest);

  const hindquarters = new THREE.Mesh(
    new THREE.SphereGeometry(0.88, 12, 10),
    mats.darkSteelMat
  );
  hindquarters.scale.set(1.05, 1.0, 0.96);
  hindquarters.position.set(0, 0.22, -0.88);
  stanceGroup.add(hindquarters);

  // 3. Royal-Blue & Kelly-Green Armored Battle Caparison, Saddle & Breastplate
  const saddleCloth = new THREE.Mesh(
    new THREE.BoxGeometry(1.98, 0.84, 1.52),
    mats.primaryMat
  );
  saddleCloth.position.set(0, 0.36, -0.02);
  stanceGroup.add(saddleCloth);

  const goldBorder = new THREE.Mesh(
    new THREE.BoxGeometry(2.06, 0.16, 1.60),
    mats.trimMat
  );
  goldBorder.position.set(0, -0.02, -0.02);
  stanceGroup.add(goldBorder);

  const warSaddle = new THREE.Mesh(
    new THREE.BoxGeometry(1.28, 0.34, 1.02),
    mats.accentMat
  );
  warSaddle.position.set(0, 0.84, -0.04);
  stanceGroup.add(warSaddle);

  const breastArmor = new THREE.Mesh(
    new THREE.CylinderGeometry(1.02, 0.96, 0.72, 10, 1, false, -Math.PI * 0.46, Math.PI * 0.92),
    mats.accentMat
  );
  breastArmor.position.set(0, 0.28, 0.90);
  stanceGroup.add(breastArmor);

  const breastStarCrest = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.34, 0),
    mats.trimMat
  );
  breastStarCrest.position.set(0, 0.34, 1.88);
  stanceGroup.add(breastStarCrest);

  const breastCoreGem = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.20, 0),
    mats.glowMat
  );
  breastCoreGem.position.set(0, 0.34, 2.02);
  stanceGroup.add(breastCoreGem);

  for (const sideSign of [-1, 1]) {
    const shoulderPlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.46, 0.22, 6),
      sideSign < 0 ? mats.primaryMat : mats.accentMat
    );
    shoulderPlate.rotation.z = Math.PI / 2;
    shoulderPlate.position.set(sideSign * 1.02, 0.26, 0.68);
    stanceGroup.add(shoulderPlate);

    const hipShield = new THREE.Mesh(
      new THREE.CylinderGeometry(0.50, 0.40, 0.20, 6),
      sideSign < 0 ? mats.accentMat : mats.primaryMat
    );
    hipShield.rotation.z = Math.PI / 2;
    hipShield.position.set(sideSign * 0.96, 0.24, -0.68);
    stanceGroup.add(hipShield);
  }

  // 4. Sweeping Rainbow + Team-Colored Plumed Tail
  const tailGroup = new THREE.Group();
  tailGroup.position.set(-0.22, 0.38, -1.62);
  tailGroup.rotation.set(-0.38, -0.36, 0.16);
  for (let t = 0; t < 5; t++) {
    const tMat =
      isSovereign || isPegasus
        ? mats.rainbowMats[t % mats.rainbowMats.length]
        : t % 2 === 0
          ? mats.primaryMat
          : mats.accentMat;
    const plume = new THREE.Mesh(
      new THREE.ConeGeometry(0.34 - t * 0.04, 1.48, 7),
      tMat
    );
    plume.rotation.x = Math.PI * 0.72 + t * 0.09;
    plume.position.set(-t * 0.09, -0.24 - t * 0.18, -0.34 - t * 0.16);
    tailGroup.add(plume);
  }
  stanceGroup.add(tailGroup);

  // 5. Archetype Wing / Chariot Attachments on `stanceGroup`
  let wingPylons: [THREE.Group, THREE.Group] | null = null;

  if (isPegasus || isSovereign) {
    // Grand Sweeping Multi-Pinion Pegasus / Sovereign Alicorn Wings!
    const leftWing = new THREE.Group();
    const rightWing = new THREE.Group();
    leftWing.position.set(-0.82, 0.68, 0.36);
    rightWing.position.set(0.82, 0.68, 0.36);

    for (const [wGroup, sideSign] of [
      [leftWing, -1],
      [rightWing, 1],
    ] as const) {
      const wingShoulder = new THREE.Mesh(
        new THREE.SphereGeometry(0.36, 8, 8),
        mats.trimMat
      );
      wGroup.add(wingShoulder);

      const spar = new THREE.Mesh(
        new THREE.BoxGeometry(1.95, 0.22, 0.24),
        mats.primaryMat
      );
      spar.rotation.z = -sideSign * 0.22;
      spar.position.set(sideSign * 0.96, 0.28, -0.06);
      wGroup.add(spar);

      // 5 Swept Feather Pinions (Pearl-White, Royal-Blue, Kelly-Green & Gold)
      for (let f = 0; f < 5; f++) {
        const featherMat =
          f === 0
            ? mats.trimMat
            : f % 2 === 1
              ? mats.darkSteelMat
              : f === 2
                ? mats.primaryMat
                : mats.accentMat;
        const featherLen = 1.65 - f * 0.18;
        const feather = new THREE.Mesh(
          new THREE.ConeGeometry(0.22, featherLen, 5),
          featherMat
        );
        feather.scale.set(0.55, 1.0, 1.35);
        feather.rotation.z = -sideSign * (1.18 + f * 0.10);
        feather.rotation.y = sideSign * 0.12;
        feather.position.set(
          sideSign * (0.58 + f * 0.34),
          0.12 - f * 0.12,
          -0.12 - f * 0.06
        );
        wGroup.add(feather);
      }
      wGroup.rotation.z = -sideSign * 0.42;
      stanceGroup.add(wGroup);
    }
    wingPylons = [leftWing, rightWing];
  }

  if (isChariot) {
    // Chariot War-Unicorn: Twin Shoulder-Mounted Star-Prism Cannons + Spinning Star Chariot Wheels!
    for (const sideSign of [-1, 1]) {
      const podMount = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.42, 0.88),
        sideSign < 0 ? mats.primaryMat : mats.accentMat
      );
      podMount.position.set(sideSign * 1.28, 0.62, 0.32);
      stanceGroup.add(podMount);

      const cannonBarrelGroup = new THREE.Group();
      cannonBarrelGroup.position.set(sideSign * 1.34, 0.68, 0.76);
      const barrelTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.26, 1.35, 8),
        mats.trimMat
      );
      barrelTube.rotation.x = Math.PI / 2;
      barrelTube.position.set(0, 0, 0.45);
      const muzzleRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.06, 6, 12),
        sideSign < 0 ? mats.accentMat : mats.primaryMat
      );
      muzzleRing.position.set(0, 0, 1.12);
      const muzzleCore = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.18, 0),
        mats.glowMat
      );
      muzzleCore.position.set(0, 0, 1.15);
      cannonBarrelGroup.add(barrelTube, muzzleRing, muzzleCore);
      recoilBarrels.push(cannonBarrelGroup);
      stanceGroup.add(cannonBarrelGroup);

      // Spinning Chariot Star-Wheel on Rear Axle
      const wheelCluster = new THREE.Group();
      wheelCluster.position.set(sideSign * 1.28, -0.34, -0.58);
      wheelCluster.rotation.y = Math.PI / 2;
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.76, 0.11, 8, 16),
        mats.trimMat
      );
      wheelCluster.add(rim);
      for (let sp = 0; sp < 6; sp++) {
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 1.44, 0.10),
          mats.rainbowMats[sp]
        );
        spoke.rotation.z = (sp * Math.PI) / 6;
        wheelCluster.add(spoke);
      }
      spinClusters.push(wheelCluster);
      stanceGroup.add(wheelCluster);
    }
  }

  // 6. Towering Arched Equine Neck + Horse Head + Flowing Rainbow/Team Mane + Giant Spiral Horn (`turretGroup`)
  const turretGroup = new THREE.Group();
  turretGroup.position.set(0.18 * scaleFactor, 0.62 * scaleFactor, 0.96 * scaleFactor);
  turretGroup.scale.setScalar(scaleFactor);
  bodyGroup.add(turretGroup);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.68, 1.48, 10),
    mats.darkSteelMat
  );
  neck.rotation.x = 0.28;
  neck.position.set(0, 0.62, 0.16);
  turretGroup.add(neck);

  const neckTorc = new THREE.Mesh(
    new THREE.TorusGeometry(0.60, 0.13, 6, 14),
    mats.trimMat
  );
  neckTorc.rotation.x = Math.PI / 2 + 0.28;
  neckTorc.position.set(0, 0.18, 0.06);
  turretGroup.add(neckTorc);

  // 6-Tuft Rainbow & Blue/Green Crest Mane
  for (let m = 0; m < 6; m++) {
    const maneMat =
      isSovereign || isPegasus
        ? mats.rainbowMats[m]
        : m % 3 === 0
          ? mats.primaryMat
          : m % 3 === 1
            ? mats.accentMat
            : mats.trimMat;
    const tuft = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.68, 5),
      maneMat
    );
    tuft.rotation.x = -0.82;
    tuft.rotation.z = (m % 2 === 0 ? 1 : -1) * 0.18;
    tuft.position.set(0, 0.24 + m * 0.26, -0.30 + m * 0.06);
    turretGroup.add(tuft);
  }

  const skull = new THREE.Mesh(
    new THREE.SphereGeometry(0.58, 12, 10),
    mats.darkSteelMat
  );
  skull.scale.set(0.94, 0.98, 1.14);
  skull.position.set(0, 1.42, 0.38);
  turretGroup.add(skull);

  const muzzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.30, 0.44, 0.92, 10),
    mats.darkSteelMat
  );
  muzzle.rotation.x = Math.PI / 2 + 0.34;
  muzzle.position.set(0, 1.22, 0.98);
  turretGroup.add(muzzle);

  const snoutEnd = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 10, 8),
    mats.darkSteelMat
  );
  snoutEnd.scale.set(1.04, 0.86, 0.92);
  snoutEnd.position.set(0, 1.06, 1.38);
  turretGroup.add(snoutEnd);

  // Armored Forehead Chamfron
  const headChamfron = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.20, 0.88),
    mats.primaryMat
  );
  headChamfron.rotation.x = 0.34;
  headChamfron.position.set(0, 1.54, 0.78);
  turretGroup.add(headChamfron);

  for (const sideSign of [-1, 1]) {
    const ear = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.56, 5),
      mats.darkSteelMat
    );
    ear.rotation.z = -sideSign * 0.28;
    ear.rotation.x = -0.14;
    ear.position.set(sideSign * 0.36, 1.94, 0.22);
    turretGroup.add(ear);

    const earInner = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.38, 4),
      sideSign < 0 ? mats.primaryMat : mats.accentMat
    );
    earInner.rotation.z = -sideSign * 0.28;
    earInner.rotation.x = -0.14;
    earInner.position.set(sideSign * 0.36, 1.92, 0.27);
    turretGroup.add(earInner);

    const eye = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 0.20),
      mats.glowMat
    );
    eye.position.set(sideSign * 0.48, 1.48, 0.62);
    turretGroup.add(eye);
  }

  // Royal Golden Crown on `SOVEREIGN_TITAN`
  if (isSovereign) {
    const crownBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.42, 0.26, 8),
      mats.trimMat
    );
    crownBand.position.set(0, 1.92, 0.42);
    turretGroup.add(crownBand);

    for (let p = 0; p < 6; p++) {
      const ang = (p / 6) * Math.PI * 2;
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.36, 4),
        p % 2 === 0 ? mats.trimMat : mats.rainbowMats[p]
      );
      spike.position.set(
        Math.cos(ang) * 0.40,
        2.18,
        0.42 + Math.sin(ang) * 0.40
      );
      turretGroup.add(spike);
    }
  }

  // Colossal Spiraling Unicorn Boss Horn (`1.95m..2.30m`) + Spinning Magic Halo Cluster!
  const hornLen = isSovereign ? 2.28 : 1.96;
  const hornGroup = new THREE.Group();
  hornGroup.position.set(0, 1.72, 0.72);
  hornGroup.rotation.x = 0.66;

  const hornCollar = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.08, 6, 12),
    mats.trimMat
  );
  hornCollar.rotation.x = Math.PI / 2;
  hornGroup.add(hornCollar);

  const mainHorn = new THREE.Mesh(
    new THREE.ConeGeometry(0.25, hornLen, 10),
    mats.trimMat
  );
  mainHorn.position.set(0, hornLen * 0.5, 0);
  hornGroup.add(mainHorn);

  // Rainbow / Team-Colored Spiral Horn Bands
  const ringCount = isSovereign ? 6 : 5;
  for (let r = 0; r < ringCount; r++) {
    const frac = (r + 0.4) / ringCount;
    const bandMat = isSovereign
      ? mats.rainbowMats[r % mats.rainbowMats.length]
      : r % 2 === 0
        ? mats.primaryMat
        : mats.accentMat;
    const spiralTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.24 * (1 - frac * 0.78), 0.042, 6, 12),
      bandMat
    );
    spiralTorus.rotation.x = Math.PI / 2 + 0.16;
    spiralTorus.position.set(0, frac * hornLen * 0.88, 0);
    hornGroup.add(spiralTorus);
  }

  // Spinning Star-Rune Halo around the Giant Unicorn Horn (`spinClusters`)
  const hornHaloCluster = new THREE.Group();
  hornHaloCluster.position.set(0, hornLen * 0.58, 0);
  hornHaloCluster.rotation.x = Math.PI / 2;
  const haloRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.045, 6, 18),
    mats.trimMat
  );
  hornHaloCluster.add(haloRing);
  for (let s = 0; s < 6; s++) {
    const a = (s / 6) * Math.PI * 2;
    const gem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.12, 0),
      mats.rainbowMats[s]
    );
    gem.position.set(Math.cos(a) * 0.56, Math.sin(a) * 0.56, 0);
    hornHaloCluster.add(gem);
  }
  hornGroup.add(hornHaloCluster);
  spinClusters.push(hornHaloCluster);

  const hornTipOrb = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.16, 0),
    mats.glowMat
  );
  hornTipOrb.position.set(0, hornLen + 0.04, 0);
  hornGroup.add(hornTipOrb);

  turretGroup.add(hornGroup);

  const hazardRing = createUnicornHazardRing(mats.glowMat, isSovereign ? 3.2 : 2.85);
  root.add(hazardRing, bodyGroup);
  attachUnicornBossOutlines(bodyGroup);

  return {
    chassis,
    root,
    bodyGroup,
    turretGroup,
    leftLeg: flLeg,
    rightLeg: frLeg,
    spiderLegs,
    spinClusters,
    recoilBarrels,
    meleeArm: hornGroup,
    wingPylons,
    hazardRing,
    primaryMat: mats.primaryMat,
    accentMat: mats.accentMat,
    trimMat: mats.trimMat,
    darkSteelMat: mats.darkSteelMat,
    glowMat: mats.glowMat,
    flashMaterials: mats.flashMaterials,
  };
}

export function createAllUnicornBossChassisRigs(): Record<BossChassisId, BossChassisRig> {
  return {
    WARDEN_MECH: buildGiantBattleUnicornArchetype('WARDEN_MECH'),
    SIEGE_TANK: buildGiantBattleUnicornArchetype('SIEGE_TANK'),
    KRAKEN_WALKER: buildGiantBattleUnicornArchetype('KRAKEN_WALKER'),
    SOVEREIGN_TITAN: buildGiantBattleUnicornArchetype('SOVEREIGN_TITAN'),
  };
}
