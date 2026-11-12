import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { WeaponTierId } from '../core/types';
import { createShowcaseWeaponGroup } from './WeaponRigFactory';

/**
 * Tags a geometry slice with vertex colors and an articulated limb animation part ID:
 * - partId 0: static torso, helmet, visor, shoulder pauldrons & tactical backpack
 * - partId 1: left leg (+ stride phase + vertical boot lift)
 * - partId 2: right leg (- stride phase + vertical boot lift)
 * - partId 3: rear/off-hand tactical gear sway
 * - partId 4: forward weapon-cradling arms & gloves (receives volley recoil kickback!)
 */
function tagPartGeometry(
  geo: THREE.BufferGeometry,
  hexColor: number,
  partId = 0
): THREE.BufferGeometry {
  const nonIndexed = geo.index ? geo.toNonIndexed() : geo.clone();
  const count = nonIndexed.attributes.position.count;
  const colors = new Float32Array(count * 3);
  const parts = new Float32Array(count);
  const c = new THREE.Color(hexColor);

  for (let i = 0; i < count; i++) {
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    parts[i] = partId;
  }

  nonIndexed.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  nonIndexed.setAttribute('aPartId', new THREE.BufferAttribute(parts, 1));
  nonIndexed.deleteAttribute('uv');
  return nonIndexed;
}

/**
 * Stylized-Heroic Tactical Commando (Player Elite Squad, facing -Z):
 * - Crisp high-contrast palette tuned for close over-the-shoulder camera + cel-outline pass:
 *   sky-cobalt tactical helmet & trousers, cool tactical grey combat shirt, emerald/gold plate carrier,
 *   warm human skin, and weapon-cradling hands aligned to live 3D Tier 1-5 guns!
 */
export function createPlayerSoldierGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const helmetCobalt = 0x1e8fff;
  const armorTeal = 0x24b87a;
  const shirtSlate = 0x7b8c9e;
  const pantsCobalt = 0x1b74d8;
  const darkWebbing = 0x161e29;
  const gunmetal = 0x3b4959;
  const skinWarm = 0xeab088;
  const goldTrim = 0xffcf56;
  const visorCyan = 0x62f8ff;

  // --- LEGS (partId 1 = Left, partId 2 = Right) ---
  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.102;

    const thigh = new THREE.CapsuleGeometry(0.068, 0.13, 5, 10);
    thigh.translate(lx, 0.30, 0);
    parts.push(tagPartGeometry(thigh, pantsCobalt, partId));

    const kneePad = new THREE.BoxGeometry(0.098, 0.075, 0.068);
    kneePad.translate(lx, 0.21, -0.052);
    parts.push(tagPartGeometry(kneePad, darkWebbing, partId));

    const shin = new THREE.CapsuleGeometry(0.058, 0.12, 5, 10);
    shin.translate(lx, 0.13, 0.008);
    parts.push(tagPartGeometry(shin, pantsCobalt, partId));

    const boot = new THREE.BoxGeometry(0.12, 0.088, 0.195);
    boot.translate(lx, 0.044, -0.032);
    parts.push(tagPartGeometry(boot, darkWebbing, partId));
  }

  // --- PELVIS & TACTICAL WAR BELT (partId 0) ---
  const pelvis = new THREE.CylinderGeometry(0.152, 0.138, 0.11, 10);
  pelvis.scale(1.15, 1, 0.86);
  pelvis.translate(0, 0.40, 0);
  parts.push(tagPartGeometry(pelvis, darkWebbing, 0));

  const beltBuckle = new THREE.BoxGeometry(0.08, 0.05, 0.035);
  beltBuckle.translate(0, 0.41, -0.12);
  parts.push(tagPartGeometry(beltBuckle, goldTrim, 0));

  const hipPouch = new THREE.BoxGeometry(0.068, 0.10, 0.095);
  hipPouch.translate(-0.178, 0.39, 0.02);
  parts.push(tagPartGeometry(hipPouch, gunmetal, 3));

  // --- HEROIC V-TAPER TORSO & TACTICAL VEST (partId 0) ---
  const torsoCore = new THREE.CylinderGeometry(0.194, 0.146, 0.34, 12);
  torsoCore.scale(1.18, 1, 0.86);
  torsoCore.translate(0, 0.56, 0);
  parts.push(tagPartGeometry(torsoCore, shirtSlate, 0));

  const frontVest = new THREE.BoxGeometry(0.30, 0.24, 0.175);
  frontVest.translate(0, 0.57, -0.048);
  parts.push(tagPartGeometry(frontVest, armorTeal, 0));

  for (const mx of [-0.085, 0, 0.085]) {
    const pouch = new THREE.BoxGeometry(0.064, 0.105, 0.05);
    pouch.translate(mx, 0.51, -0.145);
    parts.push(tagPartGeometry(pouch, darkWebbing, 0));
  }

  // Beveled Shoulder Pauldrons
  for (const sideSign of [-1, 1]) {
    const pauldron = new THREE.SphereGeometry(0.104, 10, 8);
    pauldron.scale(1.05, 0.82, 1.08);
    pauldron.translate(sideSign * 0.228, 0.665, -0.01);
    parts.push(tagPartGeometry(pauldron, shirtSlate, 0));

    const chevron = new THREE.BoxGeometry(0.055, 0.036, 0.13);
    chevron.rotateZ(-sideSign * 0.28);
    chevron.translate(sideSign * 0.27, 0.685, -0.01);
    parts.push(tagPartGeometry(chevron, goldTrim, 0));
  }

  // Compact Tactical Radio Pack (+Z Rear — kept sleek so shirt & helmet silhouette read super clean!)
  const rucksack = new THREE.BoxGeometry(0.21, 0.20, 0.10);
  rucksack.translate(0, 0.57, 0.145);
  parts.push(tagPartGeometry(rucksack, gunmetal, 0));

  const packFlap = new THREE.BoxGeometry(0.195, 0.055, 0.108);
  packFlap.translate(0, 0.648, 0.145);
  parts.push(tagPartGeometry(packFlap, armorTeal, 0));

  // --- NECK, WARM SKIN HEAD & CHUNKY FAST HELMET (partId 0) ---
  const neck = new THREE.CylinderGeometry(0.076, 0.088, 0.09, 10);
  neck.translate(0, 0.75, -0.01);
  parts.push(tagPartGeometry(neck, skinWarm, 0));

  const head = new THREE.SphereGeometry(0.142, 12, 10);
  head.scale(0.98, 1.02, 0.98);
  head.translate(0, 0.86, -0.015);
  parts.push(tagPartGeometry(head, skinWarm, 0));

  // Bold Rounded Tactical Helmet Dome (reads unmistakably from over-the-shoulder camera!)
  const helmetCrown = new THREE.SphereGeometry(
    0.178,
    16,
    12,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.62
  );
  helmetCrown.scale(1.04, 0.98, 1.08);
  helmetCrown.translate(0, 0.88, -0.005);
  parts.push(tagPartGeometry(helmetCrown, helmetCobalt, 0));

  const helmetRim = new THREE.TorusGeometry(0.168, 0.022, 8, 18);
  helmetRim.rotateX(Math.PI / 2 - 0.12);
  helmetRim.translate(0, 0.845, -0.005);
  parts.push(tagPartGeometry(helmetRim, 0x1565c0, 0));

  for (const sideSign of [-1, 1]) {
    const arcRail = new THREE.BoxGeometry(0.032, 0.038, 0.17);
    arcRail.translate(sideSign * 0.168, 0.90, -0.01);
    parts.push(tagPartGeometry(arcRail, gunmetal, 0));
  }

  const gogglesFrame = new THREE.BoxGeometry(0.23, 0.076, 0.08);
  gogglesFrame.translate(0, 0.868, -0.135);
  parts.push(tagPartGeometry(gogglesFrame, darkWebbing, 0));

  const visorLens = new THREE.BoxGeometry(0.20, 0.052, 0.032);
  visorLens.translate(0, 0.868, -0.168);
  parts.push(tagPartGeometry(visorLens, visorCyan, 0));

  // --- TWO-HANDED FIRING ARMS & GLOVES (partId 4 — aligned to +0.178 X weapon grip!) ---
  const rUpperArm = new THREE.CapsuleGeometry(0.055, 0.11, 5, 8);
  rUpperArm.rotateX(0.45);
  rUpperArm.translate(0.228, 0.59, -0.06);
  parts.push(tagPartGeometry(rUpperArm, shirtSlate, 4));

  const rForearm = new THREE.CapsuleGeometry(0.048, 0.12, 5, 8);
  rForearm.rotateX(1.25);
  rForearm.rotateY(0.15);
  rForearm.translate(0.20, 0.55, -0.16);
  parts.push(tagPartGeometry(rForearm, shirtSlate, 4));

  const rGlove = new THREE.SphereGeometry(0.054, 8, 6);
  rGlove.translate(0.178, 0.545, -0.24);
  parts.push(tagPartGeometry(rGlove, darkWebbing, 4));

  const lUpperArm = new THREE.CapsuleGeometry(0.054, 0.12, 5, 8);
  lUpperArm.rotateX(0.75);
  lUpperArm.rotateZ(-0.42);
  lUpperArm.translate(-0.175, 0.585, -0.09);
  parts.push(tagPartGeometry(lUpperArm, shirtSlate, 4));

  const lForearm = new THREE.CapsuleGeometry(0.046, 0.17, 5, 8);
  lForearm.rotateX(1.38);
  lForearm.rotateZ(-0.85);
  lForearm.translate(0.01, 0.555, -0.28);
  parts.push(tagPartGeometry(lForearm, shirtSlate, 4));

  const lGlove = new THREE.SphereGeometry(0.052, 8, 6);
  lGlove.translate(0.155, 0.555, -0.40);
  parts.push(tagPartGeometry(lGlove, darkWebbing, 4));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  merged.computeVertexNormals();
  return merged;
}

/**
 * Crimson Shock Breacher (Standard Enemy Trooper, facing +Z toward player):
 * Bright crimson helmet & combat pants, light tactical vest, dark carbine.
 */
export function createEnemySoldierGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const crimsonBright = 0xe82c42;
  const crimsonDeep = 0xb81d30;
  const vestTan = 0xd8c3a5;
  const obsidian = 0x1e2430;
  const gunmetal = 0x36404f;
  const visorRed = 0xff6b78;
  const skinWarm = 0xe2a884;

  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.098;

    const thigh = new THREE.CapsuleGeometry(0.064, 0.13, 5, 10);
    thigh.translate(lx, 0.30, 0);
    parts.push(tagPartGeometry(thigh, crimsonBright, partId));

    const kneePad = new THREE.BoxGeometry(0.095, 0.075, 0.065);
    kneePad.translate(lx, 0.21, 0.052);
    parts.push(tagPartGeometry(kneePad, obsidian, partId));

    const shin = new THREE.CapsuleGeometry(0.054, 0.12, 5, 10);
    shin.translate(lx, 0.13, -0.008);
    parts.push(tagPartGeometry(shin, crimsonBright, partId));

    const boot = new THREE.BoxGeometry(0.115, 0.085, 0.19);
    boot.translate(lx, 0.042, 0.032);
    parts.push(tagPartGeometry(boot, obsidian, partId));
  }

  const pelvis = new THREE.CylinderGeometry(0.148, 0.135, 0.11, 10);
  pelvis.scale(1.15, 1, 0.85);
  pelvis.translate(0, 0.40, 0);
  parts.push(tagPartGeometry(pelvis, crimsonDeep, 0));

  const torsoCore = new THREE.CylinderGeometry(0.19, 0.145, 0.34, 12);
  torsoCore.scale(1.18, 1, 0.85);
  torsoCore.translate(0, 0.56, 0);
  parts.push(tagPartGeometry(torsoCore, vestTan, 0));

  const breacherChest = new THREE.BoxGeometry(0.29, 0.22, 0.175);
  breacherChest.translate(0, 0.56, 0.045);
  parts.push(tagPartGeometry(breacherChest, crimsonDeep, 0));

  const neck = new THREE.CylinderGeometry(0.072, 0.084, 0.09, 10);
  neck.translate(0, 0.75, 0.01);
  parts.push(tagPartGeometry(neck, skinWarm, 0));

  const head = new THREE.SphereGeometry(0.135, 12, 10);
  head.translate(0, 0.855, 0.015);
  parts.push(tagPartGeometry(head, skinWarm, 0));

  const helmet = new THREE.SphereGeometry(0.172, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62);
  helmet.scale(1.04, 0.98, 1.08);
  helmet.translate(0, 0.88, 0.0);
  parts.push(tagPartGeometry(helmet, crimsonBright, 0));

  const visor = new THREE.BoxGeometry(0.21, 0.058, 0.06);
  visor.translate(0, 0.865, 0.145);
  parts.push(tagPartGeometry(visor, visorRed, 0));

  const rArm = new THREE.CapsuleGeometry(0.05, 0.18, 5, 8);
  rArm.rotateX(-0.95);
  rArm.translate(0.185, 0.56, 0.13);
  parts.push(tagPartGeometry(rArm, skinWarm, 4));

  const lArm = new THREE.CapsuleGeometry(0.048, 0.18, 5, 8);
  lArm.rotateX(-1.05);
  lArm.rotateZ(0.38);
  lArm.translate(-0.14, 0.56, 0.16);
  parts.push(tagPartGeometry(lArm, skinWarm, 4));

  const enemyRifle = new THREE.BoxGeometry(0.068, 0.09, 0.44);
  enemyRifle.translate(0.10, 0.55, 0.31);
  parts.push(tagPartGeometry(enemyRifle, gunmetal, 4));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  merged.computeVertexNormals();
  return merged;
}

/**
 * Armored Heavy Juggernaut (Elite Brute Enemy, facing +Z toward player):
 * Hulking olive-drab & crimson-helmeted exo-trooper with broad siege pauldrons,
 * reinforced blast collar, and heavy twin-barrel autocannon — carries floating HP bar!
 */
export function createHeavyEnemyGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const oliveArmor = 0x5d8a3a;
  const oliveDark = 0x3b5c23;
  const crimsonHelmet = 0xd92b3a;
  const bronzeTrim = 0xe59b28;
  const obsidian = 0x1a2029;
  const gunmetal = 0x3d4856;
  const visorGlow = 0xffae33;

  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.135;

    const thigh = new THREE.CapsuleGeometry(0.088, 0.14, 5, 10);
    thigh.translate(lx, 0.31, 0);
    parts.push(tagPartGeometry(thigh, oliveDark, partId));

    const kneePlate = new THREE.BoxGeometry(0.13, 0.095, 0.095);
    kneePlate.translate(lx, 0.21, 0.065);
    parts.push(tagPartGeometry(kneePlate, crimsonHelmet, partId));

    const shin = new THREE.CapsuleGeometry(0.078, 0.13, 5, 10);
    shin.translate(lx, 0.13, 0);
    parts.push(tagPartGeometry(shin, oliveArmor, partId));

    const boot = new THREE.BoxGeometry(0.155, 0.098, 0.23);
    boot.translate(lx, 0.048, 0.04);
    parts.push(tagPartGeometry(boot, obsidian, partId));
  }

  const pelvis = new THREE.BoxGeometry(0.38, 0.13, 0.25);
  pelvis.translate(0, 0.41, 0);
  parts.push(tagPartGeometry(pelvis, obsidian, 0));

  // Broad Hulking Torso & Siege Plate
  const torso = new THREE.CylinderGeometry(0.26, 0.19, 0.38, 12);
  torso.scale(1.25, 1, 0.92);
  torso.translate(0, 0.59, 0);
  parts.push(tagPartGeometry(torso, oliveArmor, 0));

  const chestArmor = new THREE.BoxGeometry(0.42, 0.28, 0.24);
  chestArmor.translate(0, 0.60, 0.045);
  parts.push(tagPartGeometry(chestArmor, oliveDark, 0));

  const chestHazard = new THREE.BoxGeometry(0.24, 0.12, 0.04);
  chestHazard.translate(0, 0.61, 0.17);
  parts.push(tagPartGeometry(chestHazard, bronzeTrim, 0));

  // Massive Crimson-Trimmed Juggernaut Shoulder Pauldrons
  for (const sideSign of [-1, 1]) {
    const pauldron = new THREE.SphereGeometry(0.15, 10, 8);
    pauldron.scale(1.12, 0.92, 1.15);
    pauldron.translate(sideSign * 0.31, 0.70, 0.02);
    parts.push(tagPartGeometry(pauldron, oliveArmor, 0));

    const rim = new THREE.BoxGeometry(0.17, 0.05, 0.22);
    rim.rotateZ(-sideSign * 0.22);
    rim.translate(sideSign * 0.32, 0.75, 0.02);
    parts.push(tagPartGeometry(rim, bronzeTrim, 0));
  }

  // Heavy Blast Collar & Crimson Dome Helmet
  const collar = new THREE.CylinderGeometry(0.17, 0.20, 0.09, 10);
  collar.translate(0, 0.79, 0.02);
  parts.push(tagPartGeometry(collar, gunmetal, 0));

  const head = new THREE.SphereGeometry(0.155, 12, 10);
  head.translate(0, 0.89, 0.03);
  parts.push(tagPartGeometry(head, oliveArmor, 0));

  const helmet = new THREE.SphereGeometry(0.195, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62);
  helmet.scale(1.08, 0.96, 1.12);
  helmet.translate(0, 0.915, 0.02);
  parts.push(tagPartGeometry(helmet, crimsonHelmet, 0));

  const visor = new THREE.BoxGeometry(0.25, 0.068, 0.07);
  visor.translate(0, 0.89, 0.18);
  parts.push(tagPartGeometry(visor, visorGlow, 0));

  // Muscular Arms & Heavy Twin Autocannon
  for (const sideSign of [-1, 1]) {
    const arm = new THREE.CapsuleGeometry(0.072, 0.20, 5, 8);
    arm.rotateX(-0.92);
    arm.rotateZ(-sideSign * 0.22);
    arm.translate(sideSign * 0.25, 0.56, 0.16);
    parts.push(tagPartGeometry(arm, oliveArmor, 4));
  }

  const cannonBody = new THREE.BoxGeometry(0.16, 0.13, 0.52);
  cannonBody.translate(0, 0.50, 0.34);
  parts.push(tagPartGeometry(cannonBody, gunmetal, 4));

  for (const bx of [-0.04, 0.04]) {
    const barrel = new THREE.CylinderGeometry(0.024, 0.024, 0.26, 8);
    barrel.rotateX(Math.PI / 2);
    barrel.translate(bx, 0.51, 0.66);
    parts.push(tagPartGeometry(barrel, bronzeTrim, 4));
  }

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  merged.computeVertexNormals();
  return merged;
}

/**
 * Compatibility wrapper delegating to WeaponRigFactory's detailed multi-part showcase models.
 */
export function createWeaponPickupGroup(tier: WeaponTierId): THREE.Group {
  return createShowcaseWeaponGroup(tier).root;
}

/**
 * Chunky High-Contrast Teardrop Plasma/Tracer Bolt:
 * Rounded bright white nose + tapered cyan/gold wake so every volley reads crisply from close camera!
 */
export function createTracerBoltGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Rounded bright white teardrop head (-Z forward)
  const head = new THREE.SphereGeometry(0.095, 10, 8);
  head.scale(0.92, 0.92, 1.35);
  head.translate(0, 0, -0.24);
  parts.push(tagPartGeometry(head, 0xffffff, 0));

  // Tapered bright core tail (+Z wake)
  const tail = new THREE.ConeGeometry(0.088, 0.68, 8);
  tail.rotateX(Math.PI / 2);
  tail.translate(0, 0, 0.14);
  parts.push(tagPartGeometry(tail, 0xd8faff, 0));

  // Outer soft halo sheath (single-pass forward glow without HalfFloat FBOs)
  const halo = new THREE.ConeGeometry(0.145, 0.86, 8);
  halo.rotateX(Math.PI / 2);
  halo.translate(0, 0, 0.10);
  parts.push(tagPartGeometry(halo, 0x5cb8cc, 0));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  merged.deleteAttribute('aPartId');
  return merged;
}

/**
 * Gleaming 3D Gold Coin Medallion with dark cartoon outline & sun-ray glow perched atop Supply Drums!
 */
export function createGoldCoinPickupGroup(): THREE.Group {
  const group = new THREE.Group();

  const goldFaceMat = new THREE.MeshStandardMaterial({
    color: 0xffcf33,
    emissive: 0x6e4700,
    roughness: 0.28,
    metalness: 0.42,
  });
  const goldRimMat = new THREE.MeshStandardMaterial({
    color: 0xffdf6b,
    emissive: 0x7a5200,
    roughness: 0.24,
    metalness: 0.46,
  });
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x16120a,
    side: THREE.BackSide,
  });

  const discGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.16, 22);
  discGeo.rotateX(Math.PI / 2);
  const disc = new THREE.Mesh(discGeo, goldFaceMat);
  group.add(disc);

  const outlineGeo = new THREE.CylinderGeometry(0.61, 0.61, 0.21, 22);
  outlineGeo.rotateX(Math.PI / 2);
  const outline = new THREE.Mesh(outlineGeo, outlineMat);
  group.add(outline);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.065, 8, 22), goldRimMat);
  group.add(rim);

  const starGeo = new THREE.OctahedronGeometry(0.22, 0);
  starGeo.scale(1, 1, 0.65);
  const star = new THREE.Mesh(starGeo, goldRimMat);
  group.add(star);

  return group;
}

/**
 * Perched Commando Helmet +1 Recruit Token atop Reinforcement Supply Drums!
 */
export function createRecruitPickupGroup(): THREE.Group {
  const group = new THREE.Group();

  const helmetMat = new THREE.MeshStandardMaterial({
    color: 0x1e8fff,
    emissive: 0x09356e,
    roughness: 0.32,
    metalness: 0.28,
  });
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x66faff });
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x0d131c,
    side: THREE.BackSide,
  });

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62),
    helmetMat
  );
  dome.position.y = 0.05;
  group.add(dome);

  const domeOutline = new THREE.Mesh(
    new THREE.SphereGeometry(0.465, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.64),
    outlineMat
  );
  domeOutline.position.y = 0.05;
  group.add(domeOutline);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.14, 0.18), visorMat);
  visor.position.set(0, -0.02, 0.34);
  group.add(visor);

  return group;
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

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.54, 0.26), gunmetalMat);
  const facePlate = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.42, 0.28), casingMat);
  group.add(bumper, facePlate);

  const shackle = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.062, 10, 18, Math.PI),
    chromeMat
  );
  shackle.position.set(0, 0.26, 0);
  group.add(shackle);

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.3, 10), gunmetalMat);
  collar.rotateX(Math.PI / 2);
  collar.position.set(0, -0.02, 0);
  group.add(collar);

  const led = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), ledMat);
  led.position.set(0, 0.11, 0.15);
  group.add(led);

  return group;
}
