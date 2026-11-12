import * as THREE from 'three';
import type { WeaponTierId } from '../core/types';

/**
 * Limb part IDs encoded into `aPartId` vertex attribute for zero-draw-call GPU running animation:
 * 0 = Torso, plate carrier, backpack & helmet
 * 1 = Left leg & combat boot
 * 2 = Right leg & combat boot
 * 3 = Arms & tactical firearm
 */
interface ColoredPart {
  geometry: THREE.BufferGeometry;
  colorHex: number;
  partId?: number;
}

function mergeColoredParts(parts: ColoredPart[]): THREE.BufferGeometry {
  const nonIndexed: THREE.BufferGeometry[] = [];
  let totalVertices = 0;

  const tmpColor = new THREE.Color();

  for (let i = 0; i < parts.length; i++) {
    const src = parts[i].geometry;
    const g = src.index ? src.toNonIndexed() : src.clone();
    if (!g.getAttribute('normal')) {
      g.computeVertexNormals();
    }
    const posAttr = g.getAttribute('position');
    totalVertices += posAttr.count;
    nonIndexed.push(g);
    src.dispose();
  }

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const colors = new Float32Array(totalVertices * 3);
  const partIds = new Float32Array(totalVertices);

  let offset = 0;
  for (let i = 0; i < nonIndexed.length; i++) {
    const g = nonIndexed[i];
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const norm = g.getAttribute('normal') as THREE.BufferAttribute;
    const pid = parts[i].partId ?? 0;
    tmpColor.setHex(parts[i].colorHex);

    for (let v = 0; v < pos.count; v++) {
      const idx = offset + v;
      const base = idx * 3;
      positions[base] = pos.getX(v);
      positions[base + 1] = pos.getY(v);
      positions[base + 2] = pos.getZ(v);

      normals[base] = norm.getX(v);
      normals[base + 1] = norm.getY(v);
      normals[base + 2] = norm.getZ(v);

      colors[base] = tmpColor.r;
      colors[base + 1] = tmpColor.g;
      colors[base + 2] = tmpColor.b;

      partIds[idx] = pid;
    }
    offset += pos.count;
    g.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  merged.setAttribute('aPartId', new THREE.BufferAttribute(partIds, 1));
  merged.computeBoundingSphere();
  return merged;
}

/**
 * Gritty Special-Forces / Ranger Tactical Operator merged into a single GPU-animated geometry:
 * - Articulated combat boots, BDU legs & knee pads (`partId` 1 & 2)
 * - Sculpted Ranger plate carrier, mag pouches & comm-antenna pack (`partId` 0)
 * - High-cut FAST ballistic helmet with dual-tube phosphor NVG optics (`partId` 0)
 * - Gloved arms + suppressed M4 SOPMOD carbine with holographic sight (`partId` 3)
 */
export function createPlayerSoldierGeometry(): THREE.BufferGeometry {
  // Left Leg (partId = 1)
  const bootL = new THREE.BoxGeometry(0.1, 0.11, 0.17);
  bootL.translate(-0.085, 0.055, -0.02);
  const legL = new THREE.BoxGeometry(0.095, 0.24, 0.11);
  legL.translate(-0.085, 0.22, 0);
  const kneeL = new THREE.BoxGeometry(0.105, 0.07, 0.045);
  kneeL.translate(-0.085, 0.2, -0.065);

  // Right Leg (partId = 2)
  const bootR = new THREE.BoxGeometry(0.1, 0.11, 0.17);
  bootR.translate(0.085, 0.055, -0.02);
  const legR = new THREE.BoxGeometry(0.095, 0.24, 0.11);
  legR.translate(0.085, 0.22, 0);
  const kneeR = new THREE.BoxGeometry(0.105, 0.07, 0.045);
  kneeR.translate(0.085, 0.2, -0.065);

  // Pelvis & Tactical Belt (partId = 0)
  const pelvis = new THREE.BoxGeometry(0.27, 0.09, 0.17);
  pelvis.translate(0, 0.35, 0);

  // Torso & Ballistic Plate Carrier
  const torso = new THREE.BoxGeometry(0.29, 0.27, 0.18);
  torso.translate(0, 0.5, 0);

  const plateVest = new THREE.BoxGeometry(0.26, 0.22, 0.22);
  plateVest.translate(0, 0.5, 0);

  const magPouches = new THREE.BoxGeometry(0.22, 0.09, 0.05);
  magPouches.translate(0, 0.44, -0.125);

  const shoulderL = new THREE.BoxGeometry(0.09, 0.1, 0.15);
  shoulderL.translate(-0.18, 0.57, 0);
  const shoulderR = new THREE.BoxGeometry(0.09, 0.1, 0.15);
  shoulderR.translate(0.18, 0.57, 0);

  // Comm Backpack + Whip Antenna
  const backpack = new THREE.BoxGeometry(0.21, 0.23, 0.11);
  backpack.translate(0, 0.5, 0.145);
  const antenna = new THREE.CylinderGeometry(0.009, 0.012, 0.28, 5);
  antenna.translate(-0.08, 0.74, 0.16);

  // Balaclava Head & FAST Ballistic Helmet + Dual NVG Tubes
  const head = new THREE.SphereGeometry(0.115, 10, 8);
  head.translate(0, 0.71, 0);

  const helmet = new THREE.SphereGeometry(0.145, 12, 9, 0, Math.PI * 2, 0, Math.PI * 0.58);
  helmet.translate(0, 0.735, 0.005);

  const helmetRails = new THREE.BoxGeometry(0.295, 0.038, 0.16);
  helmetRails.translate(0, 0.73, 0.01);

  const goggles = new THREE.BoxGeometry(0.21, 0.058, 0.07);
  goggles.translate(0, 0.705, -0.105);

  const nvgMount = new THREE.BoxGeometry(0.09, 0.045, 0.06);
  nvgMount.translate(0, 0.77, -0.135);
  const nvgTubeL = new THREE.CylinderGeometry(0.026, 0.026, 0.09, 7);
  nvgTubeL.rotateX(Math.PI / 2);
  nvgTubeL.translate(-0.042, 0.76, -0.175);
  const nvgTubeR = new THREE.CylinderGeometry(0.026, 0.026, 0.09, 7);
  nvgTubeR.rotateX(Math.PI / 2);
  nvgTubeR.translate(0.042, 0.76, -0.175);

  // Arms & Suppressed M4 Carbine (partId = 3)
  const armR = new THREE.BoxGeometry(0.075, 0.085, 0.24);
  armR.rotateX(0.18);
  armR.translate(0.165, 0.48, -0.09);

  const armL = new THREE.BoxGeometry(0.072, 0.08, 0.26);
  armL.rotateY(-0.32);
  armL.translate(-0.11, 0.46, -0.12);

  const rifleBody = new THREE.BoxGeometry(0.052, 0.085, 0.36);
  rifleBody.translate(0.09, 0.46, -0.2);

  const suppressor = new THREE.CylinderGeometry(0.019, 0.019, 0.19, 7);
  suppressor.rotateX(Math.PI / 2);
  suppressor.translate(0.09, 0.47, -0.44);

  const holoSight = new THREE.BoxGeometry(0.044, 0.045, 0.075);
  holoSight.translate(0.09, 0.52, -0.18);

  const rifleMag = new THREE.BoxGeometry(0.036, 0.11, 0.055);
  rifleMag.rotateX(0.24);
  rifleMag.translate(0.09, 0.39, -0.21);

  return mergeColoredParts([
    // Left & Right Legs
    { geometry: bootL, colorHex: 0x181d23, partId: 1 },
    { geometry: legL, colorHex: 0x264736, partId: 1 },
    { geometry: kneeL, colorHex: 0x1e262f, partId: 1 },
    { geometry: bootR, colorHex: 0x181d23, partId: 2 },
    { geometry: legR, colorHex: 0x264736, partId: 2 },
    { geometry: kneeR, colorHex: 0x1e262f, partId: 2 },

    // Torso, Spec-Ops Ranger Green Armor & Gear
    { geometry: pelvis, colorHex: 0x1f2b27, partId: 0 },
    { geometry: torso, colorHex: 0x246b47, partId: 0 },
    { geometry: plateVest, colorHex: 0x2f8556, partId: 0 },
    { geometry: magPouches, colorHex: 0x3f624c, partId: 0 },
    { geometry: shoulderL, colorHex: 0x35b86e, partId: 0 },
    { geometry: shoulderR, colorHex: 0x35b86e, partId: 0 },
    { geometry: backpack, colorHex: 0x243b2f, partId: 0 },
    { geometry: antenna, colorHex: 0x566370, partId: 0 },

    // Head, FAST Helmet & Glowing Emerald NVGs
    { geometry: head, colorHex: 0x29323a, partId: 0 },
    { geometry: helmet, colorHex: 0x2ca862, partId: 0 },
    { geometry: helmetRails, colorHex: 0x1c242c, partId: 0 },
    { geometry: goggles, colorHex: 0x101820, partId: 0 },
    { geometry: nvgMount, colorHex: 0x222a33, partId: 0 },
    { geometry: nvgTubeL, colorHex: 0x6bffa8, partId: 0 },
    { geometry: nvgTubeR, colorHex: 0x6bffa8, partId: 0 },

    // Arms & Suppressed Carbine
    { geometry: armR, colorHex: 0x246b47, partId: 3 },
    { geometry: armL, colorHex: 0x246b47, partId: 3 },
    { geometry: rifleBody, colorHex: 0x202832, partId: 3 },
    { geometry: suppressor, colorHex: 0x384452, partId: 3 },
    { geometry: holoSight, colorHex: 0x5dff9e, partId: 3 },
    { geometry: rifleMag, colorHex: 0x2d3742, partId: 3 },
  ]);
}

/**
 * Gritty Crimson-Guard / Shadow Mercenary Shock Trooper (facing +Z toward player):
 * - Heavy combat boots & crimson-plated shin greaves (`partId` 1 & 2)
 * - Sloped urban-charcoal & crimson-oxide chest rig + heavy pauldrons (`partId` 0)
 * - Angular Spetsnaz/gas-mask ballistic helmet with glowing amber-red visor (`partId` 0)
 * - Armored arms & forward-aimed assault rifle (`partId` 3)
 */
export function createEnemySoldierGeometry(): THREE.BufferGeometry {
  // Left Leg (partId = 1)
  const bootL = new THREE.BoxGeometry(0.105, 0.11, 0.17);
  bootL.translate(-0.09, 0.055, 0.02);
  const legL = new THREE.BoxGeometry(0.1, 0.24, 0.115);
  legL.translate(-0.09, 0.22, 0);
  const greaveL = new THREE.BoxGeometry(0.11, 0.12, 0.045);
  greaveL.translate(-0.09, 0.19, 0.065);

  // Right Leg (partId = 2)
  const bootR = new THREE.BoxGeometry(0.105, 0.11, 0.17);
  bootR.translate(0.09, 0.055, 0.02);
  const legR = new THREE.BoxGeometry(0.1, 0.24, 0.115);
  legR.translate(0.09, 0.22, 0);
  const greaveR = new THREE.BoxGeometry(0.11, 0.12, 0.045);
  greaveR.translate(0.09, 0.19, 0.065);

  // Pelvis & Heavy Armored Torso (partId = 0)
  const pelvis = new THREE.BoxGeometry(0.28, 0.09, 0.18);
  pelvis.translate(0, 0.35, 0);

  const torso = new THREE.BoxGeometry(0.31, 0.28, 0.19);
  torso.translate(0, 0.5, 0);

  const chestArmor = new THREE.BoxGeometry(0.28, 0.22, 0.23);
  chestArmor.translate(0, 0.51, 0);

  const pauldronL = new THREE.BoxGeometry(0.12, 0.12, 0.18);
  pauldronL.rotateZ(0.2);
  pauldronL.translate(-0.2, 0.57, 0);

  const pauldronR = new THREE.BoxGeometry(0.12, 0.12, 0.18);
  pauldronR.rotateZ(-0.2);
  pauldronR.translate(0.2, 0.57, 0);

  const backPack = new THREE.BoxGeometry(0.22, 0.21, 0.1);
  backPack.translate(0, 0.5, -0.14);

  // Angular Shock Helmet & Gas Mask Visor
  const helmet = new THREE.CylinderGeometry(0.135, 0.158, 0.21, 9);
  helmet.translate(0, 0.72, 0);

  const helmetCrest = new THREE.BoxGeometry(0.055, 0.075, 0.24);
  helmetCrest.translate(0, 0.82, 0);

  const visor = new THREE.BoxGeometry(0.23, 0.058, 0.08);
  visor.translate(0, 0.71, 0.115);

  const respirator = new THREE.CylinderGeometry(0.045, 0.055, 0.09, 8);
  respirator.rotateX(Math.PI / 2);
  respirator.translate(0, 0.65, 0.135);

  // Arms & Forward-Pointed Assault Rifle (+Z) (partId = 3)
  const armL = new THREE.BoxGeometry(0.08, 0.085, 0.24);
  armL.translate(-0.16, 0.47, 0.09);
  const armR = new THREE.BoxGeometry(0.08, 0.085, 0.24);
  armR.rotateY(0.28);
  armR.translate(0.12, 0.46, 0.11);

  const rifle = new THREE.BoxGeometry(0.052, 0.085, 0.38);
  rifle.translate(-0.08, 0.46, 0.22);

  return mergeColoredParts([
    { geometry: bootL, colorHex: 0x171417, partId: 1 },
    { geometry: legL, colorHex: 0x2c2429, partId: 1 },
    { geometry: greaveL, colorHex: 0x9e1b2b, partId: 1 },
    { geometry: bootR, colorHex: 0x171417, partId: 2 },
    { geometry: legR, colorHex: 0x2c2429, partId: 2 },
    { geometry: greaveR, colorHex: 0x9e1b2b, partId: 2 },

    { geometry: pelvis, colorHex: 0x211b20, partId: 0 },
    { geometry: torso, colorHex: 0x33252b, partId: 0 },
    { geometry: chestArmor, colorHex: 0xc92236, partId: 0 },
    { geometry: pauldronL, colorHex: 0xe62e43, partId: 0 },
    { geometry: pauldronR, colorHex: 0xe62e43, partId: 0 },
    { geometry: backPack, colorHex: 0x24191d, partId: 0 },

    { geometry: helmet, colorHex: 0x2b252b, partId: 0 },
    { geometry: helmetCrest, colorHex: 0xeb3146, partId: 0 },
    { geometry: visor, colorHex: 0xffb627, partId: 0 },
    { geometry: respirator, colorHex: 0x19161a, partId: 0 },

    { geometry: armL, colorHex: 0x3b242a, partId: 3 },
    { geometry: armR, colorHex: 0x3b242a, partId: 3 },
    { geometry: rifle, colorHex: 0x1d2229, partId: 3 },
  ]);
}

/**
 * Sleek aerodynamic tracer bolt geometry (hot core + elongated tail streak).
 */
export function createTracerBoltGeometry(): THREE.BufferGeometry {
  const core = new THREE.BoxGeometry(0.068, 0.068, 0.46);
  core.translate(0, 0, -0.08);
  const streak = new THREE.ConeGeometry(0.055, 0.98, 6);
  streak.rotateX(-Math.PI / 2);
  streak.translate(0, 0, 0.24);
  // Soft outer glow sheath for lush single-pass additive glow without offscreen Bloom FBOs
  const glowSheath = new THREE.BoxGeometry(0.16, 0.16, 0.76);
  glowSheath.translate(0, 0, 0.08);

  return mergeColoredParts([
    { geometry: core, colorHex: 0xffffff, partId: 0 },
    { geometry: streak, colorHex: 0xffe4b5, partId: 0 },
    { geometry: glowSheath, colorHex: 0x4d3418, partId: 0 },
  ]);
}

/**
 * Heavy Industrial Tactical Vault Lock mounted atop Locked Multiplier/Divider gates.
 */
export function createPadlockMesh(): THREE.Group {
  const group = new THREE.Group();

  const casingMat = new THREE.MeshStandardMaterial({
    color: 0xe0a634,
    metalness: 0.45,
    roughness: 0.28,
  });
  const gunmetalMat = new THREE.MeshStandardMaterial({
    color: 0x3b4654,
    metalness: 0.48,
    roughness: 0.32,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2eaf2,
    metalness: 0.52,
    roughness: 0.2,
  });
  const ledMat = new THREE.MeshBasicMaterial({
    color: 0xff3b30,
  });

  // Armored outer bumper + brass core
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.54, 0.26), gunmetalMat);
  const facePlate = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.42, 0.28), casingMat);
  group.add(bumper, facePlate);

  // Heavy hardened steel shackle
  const shackle = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.062, 10, 18, Math.PI),
    chromeMat
  );
  shackle.position.set(0, 0.26, 0);
  group.add(shackle);

  // Glowing tactical lock status LED + keyhole collar
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.3, 10), gunmetalMat);
  collar.rotateX(Math.PI / 2);
  collar.position.set(0, -0.02, 0);
  group.add(collar);

  const led = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), ledMat);
  led.position.set(0, 0.11, 0.15);
  group.add(led);

  return group;
}

/**
 * Detailed military firearm pickup models for Tiers 1..5.
 */
export function createWeaponPickupGroup(tier: WeaponTierId): THREE.Group {
  const group = new THREE.Group();

  const gunmetal = new THREE.MeshStandardMaterial({
    color: 0x364352,
    metalness: 0.46,
    roughness: 0.3,
  });
  const receiverSteel = new THREE.MeshStandardMaterial({
    color: 0x5c6d80,
    metalness: 0.48,
    roughness: 0.28,
  });

  const accentColors: Record<WeaponTierId, number> = {
    1: 0xd8e2ec,
    2: 0xffd447,
    3: 0xff922b,
    4: 0xff5938,
    5: 0x38f6ff,
  };

  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColors[tier],
    emissive: accentColors[tier],
    emissiveIntensity: tier === 5 ? 1.35 : 0.65,
    metalness: 0.38,
    roughness: 0.24,
  });

  if (tier === 1) {
    // Lv1 Tactical Match Sidearm w/ Compensator & Red-Dot
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.2, 0.78), receiverSteel);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.68), gunmetal);
    frame.position.set(0, -0.1, 0.04);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.36, 0.2), gunmetal);
    grip.position.set(0, -0.26, 0.2);
    grip.rotation.x = -0.24;
    const comp = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.18, 0.18), accentMat);
    comp.position.set(0, 0.0, -0.46);
    group.add(slide, frame, grip, comp);
  } else if (tier === 2) {
    // Lv2 MP7 Tactical PDW SMG w/ Foregrip, Suppressor & Reflex Sight
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.96), gunmetal);
    const upperRail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.86), accentMat);
    upperRail.position.set(0, 0.155, 0);
    const suppressor = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.46, 12), receiverSteel);
    suppressor.rotation.x = Math.PI / 2;
    suppressor.position.set(0, 0.02, -0.66);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.44, 0.15), accentMat);
    mag.position.set(0, -0.28, 0.08);
    mag.rotation.x = 0.12;
    const foregrip = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.24, 0.1), gunmetal);
    foregrip.position.set(0, -0.2, -0.3);
    const optic = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.11, 0.18), accentMat);
    optic.position.set(0, 0.22, 0.06);
    group.add(body, upperRail, suppressor, mag, foregrip, optic);
  } else if (tier === 3) {
    // Lv3 M4 SOPMOD Carbine w/ Crane Stock, Quad-Rail, ACOG & PEQ Box
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.72), gunmetal);
    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.21, 0.56), receiverSteel);
    handguard.position.set(0, 0.02, -0.62);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.45, 10), gunmetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, -1.04);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.42), gunmetal);
    stock.position.set(0, -0.02, 0.54);
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.058, 0.36, 12), accentMat);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 0.22, -0.02);
    const peq = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.16), accentMat);
    peq.position.set(0, 0.15, -0.68);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.2), accentMat);
    mag.position.set(0, -0.27, -0.14);
    mag.rotation.x = 0.28;
    group.add(receiver, handguard, barrel, stock, scope, peq, mag);
  } else if (tier === 4) {
    // Lv4 M134 6-Barrel Rotary Vulcan Minigun w/ Underslung Ammo Drum
    const motorHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.26, 0.68, 14),
      gunmetal
    );
    motorHousing.rotation.x = Math.PI / 2;
    motorHousing.position.set(0, 0.04, 0.26);

    const ammoDrum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.42, 14),
      accentMat
    );
    ammoDrum.rotation.z = Math.PI / 2;
    ammoDrum.position.set(0, -0.26, 0.24);
    group.add(motorHousing, ammoDrum);

    for (let b = 0; b < 6; b++) {
      const ang = (b / 6) * Math.PI * 2;
      const brl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.036, 1.06, 8),
        receiverSteel
      );
      brl.rotation.x = Math.PI / 2;
      brl.position.set(Math.cos(ang) * 0.135, 0.04 + Math.sin(ang) * 0.135, -0.4);
      group.add(brl);
    }

    for (const cz of [-0.22, -0.58, -0.84]) {
      const clamp = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.055, 14), accentMat);
      clamp.rotation.x = Math.PI / 2;
      clamp.position.set(0, 0.04, cz);
      group.add(clamp);
    }
  } else {
    // Lv5 XM-99 Electromagnetic Plasma Railgun
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.92), gunmetal);
    chassis.position.set(0, 0, 0.22);
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.14, 1.18), receiverSteel);
    railL.position.set(-0.125, 0.04, -0.48);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.14, 1.18), receiverSteel);
    railR.position.set(0.125, 0.04, -0.48);
    const plasmaCore = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 1.12), accentMat);
    plasmaCore.position.set(0, 0.04, -0.44);
    group.add(chassis, railL, railR, plasmaCore);

    for (let c = 0; c < 4; c++) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.028, 8, 18), accentMat);
      coil.position.set(0, 0.04, -0.14 - c * 0.26);
      group.add(coil);
    }
  }

  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
    }
  });

  return group;
}

export interface BossMechRig {
  readonly root: THREE.Group;
  readonly leftLeg: THREE.Group;
  readonly rightLeg: THREE.Group;
  readonly torsoGroup: THREE.Group;
  readonly leftGatlingSpin: THREE.Group;
  readonly rightGatlingSpin: THREE.Group;
  readonly hazardRing: THREE.Mesh;
  readonly flashMaterials: THREE.MeshStandardMaterial[];
}

/**
 * Heavy Industrial Siege Mech ("Iron Warden / Titan") with:
 * - Articulated hydraulic reverse-joint legs & clawed stomping feet
 * - Sloped gunmetal & weathered crimson-oxide reactive armor
 * - Exposed molten-orange turbine reactor core behind steel cage ribs (HDR bloom!)
 * - Roof-mounted 12-tube salvo missile pods
 * - Twin 6-barrel spinning rotary Vulcan cannons
 */
export function createBossMechRig(): BossMechRig {
  const root = new THREE.Group();
  const flashMaterials: THREE.MeshStandardMaterial[] = [];

  const crimsonOxide = new THREE.MeshStandardMaterial({
    color: 0xc22538,
    roughness: 0.36,
    metalness: 0.36,
  });
  const heavyGunmetal = new THREE.MeshStandardMaterial({
    color: 0x35404e,
    roughness: 0.36,
    metalness: 0.46,
  });
  const brushedSteel = new THREE.MeshStandardMaterial({
    color: 0x7c8b9c,
    roughness: 0.26,
    metalness: 0.52,
  });
  const hazardGold = new THREE.MeshStandardMaterial({
    color: 0xe6a62c,
    roughness: 0.4,
    metalness: 0.38,
  });
  const reactorGlow = new THREE.MeshStandardMaterial({
    color: 0xffba42,
    emissive: 0xff7300,
    emissiveIntensity: 2.3,
    roughness: 0.18,
  });
  const opticCrimson = new THREE.MeshStandardMaterial({
    color: 0xff3b30,
    emissive: 0xff2a1f,
    emissiveIntensity: 2.5,
    roughness: 0.15,
  });

  flashMaterials.push(crimsonOxide, heavyGunmetal, brushedSteel, hazardGold);

  // Grounded AO shadow disc beneath the Heavy Siege Mech
  const mechShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.85, 24),
    new THREE.MeshBasicMaterial({
      color: 0x05080d,
      transparent: true,
      opacity: 0.54,
      depthWrite: false,
    })
  );
  mechShadow.rotation.x = -Math.PI / 2;
  mechShadow.position.set(0, 0.02, 0.05);
  root.add(mechShadow);

  // Ground tactical threat ring beneath the Boss
  const hazardRingGeo = new THREE.RingGeometry(1.75, 2.02, 32);
  hazardRingGeo.rotateX(-Math.PI / 2);
  const hazardRingMat = new THREE.MeshBasicMaterial({
    color: 0xff3b30,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const hazardRing = new THREE.Mesh(hazardRingGeo, hazardRingMat);
  hazardRing.position.set(0, 0.04, 0);
  root.add(hazardRing);

  // Helper to build an articulated hydraulic mech leg pivoted at the hip (y = 1.52)
  const buildMechLeg = (sideSign: -1 | 1): THREE.Group => {
    const hipPivot = new THREE.Group();
    hipPivot.position.set(sideSign * 0.88, 1.52, 0);

    const hipJoint = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.44, 12),
      brushedSteel
    );
    hipJoint.rotation.z = Math.PI / 2;
    hipPivot.add(hipJoint);

    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.78, 0.64), crimsonOxide);
    thigh.position.set(0, -0.34, 0.08);
    thigh.rotation.x = -0.18;
    hipPivot.add(thigh);

    const kneeArmor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.34, 0.32), hazardGold);
    kneeArmor.position.set(0, -0.68, 0.34);
    hipPivot.add(kneeArmor);

    const shin = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.82, 0.58), heavyGunmetal);
    shin.position.set(0, -1.04, -0.05);
    shin.rotation.x = 0.12;
    hipPivot.add(shin);

    // Hydraulic chrome piston cylinder along rear of leg
    const piston = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.92, 8),
      brushedSteel
    );
    piston.position.set(sideSign * 0.16, -0.78, -0.32);
    hipPivot.add(piston);

    // Heavy stomping foot + twin front armor claws
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.24, 1.08), heavyGunmetal);
    foot.position.set(0, -1.4, 0.14);
    hipPivot.add(foot);

    for (const tx of [-0.22, 0.22]) {
      const claw = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.34), hazardGold);
      claw.position.set(tx, -1.43, 0.72);
      hipPivot.add(claw);
    }

    return hipPivot;
  };

  const leftLeg = buildMechLeg(-1);
  const rightLeg = buildMechLeg(1);
  root.add(leftLeg, rightLeg);

  // Pelvis & Articulated Upper Torso Group
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 1.55, 0);
  root.add(torsoGroup);

  const pelvisBlock = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.42, 1.05), heavyGunmetal);
  pelvisBlock.position.set(0, 0.05, 0);
  torsoGroup.add(pelvisBlock);

  // Main Sloped Siege Chassis
  const chassisCore = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.48, 1.48), heavyGunmetal);
  chassisCore.position.set(0, 0.88, 0);
  torsoGroup.add(chassisCore);

  // Angled Reactive Armor Breastplates (Left & Right)
  for (const sx of [-1, 1]) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.18, 0.36), crimsonOxide);
    plate.position.set(sx * 0.76, 0.9, 0.68);
    plate.rotation.y = sx * -0.22;
    torsoGroup.add(plate);

    const shoulderShield = new THREE.Mesh(
      new THREE.BoxGeometry(0.74, 0.88, 1.38),
      crimsonOxide
    );
    shoulderShield.position.set(sx * 1.46, 1.24, 0.04);
    shoulderShield.rotation.z = sx * -0.16;
    torsoGroup.add(shoulderShield);

    const hazardTrim = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.14, 1.42), hazardGold);
    hazardTrim.position.set(sx * 1.48, 0.82, 0.04);
    torsoGroup.add(hazardTrim);
  }

  // Molten Turbine Core + Protective Steel Ribs
  const turbineBezel = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.08, 10, 20),
    brushedSteel
  );
  turbineBezel.position.set(0, 0.88, 0.74);
  torsoGroup.add(turbineBezel);

  const turbineCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.18, 18),
    reactorGlow
  );
  turbineCore.rotation.x = Math.PI / 2;
  turbineCore.position.set(0, 0.88, 0.7);
  torsoGroup.add(turbineCore);

  for (const ry of [0.74, 0.88, 1.02]) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.045, 0.08), heavyGunmetal);
    rib.position.set(0, ry, 0.81);
    torsoGroup.add(rib);
  }

  // Armored Command Head + Glowing Crimson Optics
  const headPod = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.56, 0.92), heavyGunmetal);
  headPod.position.set(0, 1.82, 0.14);
  torsoGroup.add(headPod);

  const browArmor = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 0.98), crimsonOxide);
  browArmor.position.set(0, 2.06, 0.18);
  torsoGroup.add(browArmor);

  const visorSlit = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.13, 0.12), opticCrimson);
  visorSlit.position.set(0, 1.82, 0.58);
  torsoGroup.add(visorSlit);

  // Roof-Mounted 12-Tube Salvo Missile Pods + Twin Rear Smokestacks
  for (const sx of [-1, 1]) {
    const podBox = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.64, 0.86), heavyGunmetal);
    podBox.position.set(sx * 0.96, 1.98, -0.14);
    torsoGroup.add(podBox);

    const podFrame = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.68, 0.12), crimsonOxide);
    podFrame.position.set(sx * 0.96, 1.98, 0.28);
    torsoGroup.add(podFrame);

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const warhead = new THREE.Mesh(
          new THREE.SphereGeometry(0.075, 8, 8),
          reactorGlow
        );
        warhead.position.set(
          sx * 0.96 + (c - 1) * 0.22,
          1.86 + r * 0.23,
          0.33
        );
        torsoGroup.add(warhead);
      }
    }

    const exhaust = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 1.15, 10),
      brushedSteel
    );
    exhaust.position.set(sx * 0.58, 1.85, -0.82);
    exhaust.rotation.x = -0.18;
    torsoGroup.add(exhaust);
  }

  // Twin Arm-Mounted 6-Barrel Spinning Rotary Vulcan Cannons
  const buildRotaryArm = (sx: -1 | 1): THREE.Group => {
    const armMount = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.58, 0.88), heavyGunmetal);
    armMount.position.set(sx * 1.68, 0.64, 0.24);
    torsoGroup.add(armMount);

    const spinGroup = new THREE.Group();
    spinGroup.position.set(sx * 1.68, 0.58, 0.68);
    torsoGroup.add(spinGroup);

    for (let b = 0; b < 6; b++) {
      const ang = (b / 6) * Math.PI * 2;
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052, 0.052, 1.48, 8),
        brushedSteel
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(Math.cos(ang) * 0.17, Math.sin(ang) * 0.17, 0.56);
      spinGroup.add(barrel);
    }

    for (const cz of [0.35, 0.95, 1.22]) {
      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.07, 14),
        cz > 1.1 ? reactorGlow : heavyGunmetal
      );
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, 0, cz);
      spinGroup.add(collar);
    }

    return spinGroup;
  };

  const leftGatlingSpin = buildRotaryArm(-1);
  const rightGatlingSpin = buildRotaryArm(1);

  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj !== hazardRing) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return {
    root,
    leftLeg,
    rightLeg,
    torsoGroup,
    leftGatlingSpin,
    rightGatlingSpin,
    hazardRing,
    flashMaterials,
  };
}
