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
 * Stylized-Heroic Tactical Commando (Player Squad, facing -Z):
 * - Sculpted FAST Ops helmet with side rails, top NVG mount, rear battery pack & glowing visor
 * - Warm human skin jaw/neck & rolled-sleeve forearms so troopers read immediately as elite commandos
 * - V-taper armored chest carrier, gold-trimmed heroic shoulder pauldrons, and detailed radio backpack
 * - Sculpted rounded Capsule thighs, hardshell knee pads, calves, and combat boots
 * - Weapon-cradling gloved hands positioned at (+0.105, 0.565, -0.24) ready to hold live 3D Tier 1-5 guns!
 */
export function createPlayerSoldierGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const helmetEmerald = 0x1fa866;
  const armorEmerald = 0x28c778;
  const uniformSlate = 0x222d3b;
  const darkWebbing = 0x151c26;
  const gunmetal = 0x3b4959;
  const skinWarm = 0xe4a67c;
  const goldTrim = 0xffcf56;
  const visorCyan = 0x56f6ff;

  // --- LEGS (partId 1 = Left, partId 2 = Right) ---
  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.098;

    // Muscular rounded thigh
    const thigh = new THREE.CapsuleGeometry(0.064, 0.13, 5, 10);
    thigh.translate(lx, 0.30, 0);
    parts.push(tagPartGeometry(thigh, uniformSlate, partId));

    // Hardshell tactical knee pad (front -Z)
    const kneePad = new THREE.BoxGeometry(0.095, 0.075, 0.065);
    kneePad.translate(lx, 0.21, -0.052);
    parts.push(tagPartGeometry(kneePad, gunmetal, partId));

    // Tapered calf / shin
    const shin = new THREE.CapsuleGeometry(0.054, 0.12, 5, 10);
    shin.translate(lx, 0.13, 0.008);
    parts.push(tagPartGeometry(shin, uniformSlate, partId));

    // Heavy combat boot (-Z toe)
    const boot = new THREE.BoxGeometry(0.115, 0.085, 0.19);
    boot.translate(lx, 0.042, -0.032);
    parts.push(tagPartGeometry(boot, darkWebbing, partId));
  }

  // --- PELVIS & TACTICAL WAR BELT (partId 0) ---
  const pelvis = new THREE.CylinderGeometry(0.148, 0.135, 0.11, 10);
  pelvis.scale(1.15, 1, 0.85);
  pelvis.translate(0, 0.40, 0);
  parts.push(tagPartGeometry(pelvis, darkWebbing, 0));

  const beltBuckle = new THREE.BoxGeometry(0.08, 0.05, 0.035);
  beltBuckle.translate(0, 0.41, -0.12);
  parts.push(tagPartGeometry(beltBuckle, goldTrim, 0));

  // Hip utility pouch (partId 3 subtle sway)
  const hipPouch = new THREE.BoxGeometry(0.065, 0.10, 0.095);
  hipPouch.translate(-0.175, 0.39, 0.02);
  parts.push(tagPartGeometry(hipPouch, gunmetal, 3));

  // --- HEROIC V-TAPER TORSO & COMPOSITE PLATE CARRIER (partId 0) ---
  const torsoCore = new THREE.CylinderGeometry(0.188, 0.142, 0.34, 12);
  torsoCore.scale(1.18, 1, 0.84);
  torsoCore.translate(0, 0.56, 0);
  parts.push(tagPartGeometry(torsoCore, uniformSlate, 0));

  const frontVest = new THREE.BoxGeometry(0.30, 0.25, 0.18);
  frontVest.translate(0, 0.57, -0.045);
  parts.push(tagPartGeometry(frontVest, armorEmerald, 0));

  // 3 Front STANAG mag pouches
  for (const mx of [-0.085, 0, 0.085]) {
    const pouch = new THREE.BoxGeometry(0.064, 0.105, 0.05);
    pouch.translate(mx, 0.51, -0.145);
    parts.push(tagPartGeometry(pouch, darkWebbing, 0));
  }

  // Heroic Beveled Shoulder Pauldrons + Gold Commando Stripes (ultra-readable from portrait camera!)
  for (const sideSign of [-1, 1]) {
    const pauldron = new THREE.SphereGeometry(0.102, 10, 8);
    pauldron.scale(1.05, 0.82, 1.08);
    pauldron.translate(sideSign * 0.225, 0.665, -0.01);
    parts.push(tagPartGeometry(pauldron, helmetEmerald, 0));

    const chevron = new THREE.BoxGeometry(0.055, 0.036, 0.13);
    chevron.rotateZ(-sideSign * 0.28);
    chevron.translate(sideSign * 0.268, 0.685, -0.01);
    parts.push(tagPartGeometry(chevron, goldTrim, 0));
  }

  // --- SCULPTED FIELD RADIO BACKPACK & BEDROLL (+Z Rear, partId 0) ---
  const rucksack = new THREE.BoxGeometry(0.26, 0.25, 0.135);
  rucksack.translate(0, 0.57, 0.165);
  parts.push(tagPartGeometry(rucksack, gunmetal, 0));

  const packFlap = new THREE.BoxGeometry(0.24, 0.07, 0.142);
  packFlap.translate(0, 0.665, 0.165);
  parts.push(tagPartGeometry(packFlap, helmetEmerald, 0));

  const bedroll = new THREE.CylinderGeometry(0.050, 0.050, 0.27, 10);
  bedroll.rotateZ(Math.PI / 2);
  bedroll.translate(0, 0.728, 0.165);
  parts.push(tagPartGeometry(bedroll, 0xc8aa78, 0));

  // Whip antenna + emerald IFF beacon tip
  const antenna = new THREE.CylinderGeometry(0.009, 0.012, 0.26, 6);
  antenna.translate(-0.105, 0.82, 0.18);
  parts.push(tagPartGeometry(antenna, 0x9fb1c4, 0));

  const iffStrobe = new THREE.SphereGeometry(0.024, 6, 6);
  iffStrobe.translate(-0.105, 0.96, 0.18);
  parts.push(tagPartGeometry(iffStrobe, 0x5effb1, 0));

  // --- NECK, WARM SKIN HEAD, FAST HELMET & TACTICAL VISOR (partId 0) ---
  const neck = new THREE.CylinderGeometry(0.072, 0.084, 0.09, 10);
  neck.translate(0, 0.75, -0.01);
  parts.push(tagPartGeometry(neck, skinWarm, 0));

  const head = new THREE.SphereGeometry(0.132, 12, 10);
  head.scale(0.96, 1.02, 0.98);
  head.translate(0, 0.855, -0.015);
  parts.push(tagPartGeometry(head, skinWarm, 0));

  // High-cut FAST Ops Helmet Crown
  const helmetCrown = new THREE.SphereGeometry(
    0.162,
    14,
    10,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.60
  );
  helmetCrown.scale(1.02, 0.96, 1.08);
  helmetCrown.translate(0, 0.875, -0.005);
  parts.push(tagPartGeometry(helmetCrown, helmetEmerald, 0));

  // Side ARC Rails + Rear Battery Counterweight Pack (high-contrast top-down detail!)
  for (const sideSign of [-1, 1]) {
    const arcRail = new THREE.BoxGeometry(0.032, 0.038, 0.17);
    arcRail.translate(sideSign * 0.155, 0.90, -0.01);
    parts.push(tagPartGeometry(arcRail, gunmetal, 0));
  }

  const batteryPack = new THREE.BoxGeometry(0.10, 0.068, 0.052);
  batteryPack.translate(0, 0.90, 0.155);
  parts.push(tagPartGeometry(batteryPack, goldTrim, 0));

  // Dual NVG Mount on Front Brim (-Z)
  const nvgMount = new THREE.BoxGeometry(0.11, 0.048, 0.055);
  nvgMount.translate(0, 0.955, -0.155);
  parts.push(tagPartGeometry(nvgMount, darkWebbing, 0));

  // Wraparound Cyan/Gold Tactical Goggles (-Z front)
  const gogglesFrame = new THREE.BoxGeometry(0.22, 0.076, 0.08);
  gogglesFrame.translate(0, 0.868, -0.125);
  parts.push(tagPartGeometry(gogglesFrame, darkWebbing, 0));

  const visorLens = new THREE.BoxGeometry(0.195, 0.052, 0.032);
  visorLens.translate(0, 0.868, -0.158);
  parts.push(tagPartGeometry(visorLens, visorCyan, 0));

  // --- TWO-HANDED ROLLED-SLEEVE FIRING ARMS & GLOVES (partId 4 — aligned to +0.178 X heroic weapon grip!) ---
  // Right firing arm
  const rUpperArm = new THREE.CapsuleGeometry(0.052, 0.11, 5, 8);
  rUpperArm.rotateX(0.45);
  rUpperArm.translate(0.225, 0.59, -0.06);
  parts.push(tagPartGeometry(rUpperArm, uniformSlate, 4));

  const rForearm = new THREE.CapsuleGeometry(0.045, 0.12, 5, 8);
  rForearm.rotateX(1.25);
  rForearm.rotateY(0.15);
  rForearm.translate(0.20, 0.55, -0.16);
  parts.push(tagPartGeometry(rForearm, skinWarm, 4));

  const rGlove = new THREE.SphereGeometry(0.052, 8, 6);
  rGlove.translate(0.178, 0.545, -0.24);
  parts.push(tagPartGeometry(rGlove, darkWebbing, 4));

  // Left support arm reaching across to cradle forend
  const lUpperArm = new THREE.CapsuleGeometry(0.052, 0.12, 5, 8);
  lUpperArm.rotateX(0.75);
  lUpperArm.rotateZ(-0.42);
  lUpperArm.translate(-0.175, 0.585, -0.09);
  parts.push(tagPartGeometry(lUpperArm, uniformSlate, 4));

  const lForearm = new THREE.CapsuleGeometry(0.044, 0.17, 5, 8);
  lForearm.rotateX(1.38);
  lForearm.rotateZ(-0.85);
  lForearm.translate(0.01, 0.555, -0.28);
  parts.push(tagPartGeometry(lForearm, skinWarm, 4));

  const lGlove = new THREE.SphereGeometry(0.050, 8, 6);
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
 * Stylized-Heroic Enemy Breacher Commando (facing +Z toward player):
 * High-contrast obsidian/crimson shock-trooper armor, spiked shoulder plates, glowing red visor,
 * and a sculpted bullpup assault carbine held forward (+Z).
 */
export function createEnemySoldierGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const crimsonArmor = 0xc9253a;
  const crimsonBright = 0xf03a52;
  const obsidian = 0x1c212b;
  const gunmetal = 0x36404f;
  const visorRed = 0xff5e6c;
  const skinPale = 0xd49a78;

  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.098;

    const thigh = new THREE.CapsuleGeometry(0.064, 0.13, 5, 10);
    thigh.translate(lx, 0.30, 0);
    parts.push(tagPartGeometry(thigh, obsidian, partId));

    const kneePad = new THREE.BoxGeometry(0.095, 0.075, 0.065);
    kneePad.translate(lx, 0.21, 0.052);
    parts.push(tagPartGeometry(kneePad, crimsonArmor, partId));

    const shin = new THREE.CapsuleGeometry(0.054, 0.12, 5, 10);
    shin.translate(lx, 0.13, -0.008);
    parts.push(tagPartGeometry(shin, obsidian, partId));

    const boot = new THREE.BoxGeometry(0.115, 0.085, 0.19);
    boot.translate(lx, 0.042, 0.032);
    parts.push(tagPartGeometry(boot, 0x11151c, partId));
  }

  const pelvis = new THREE.CylinderGeometry(0.148, 0.135, 0.11, 10);
  pelvis.scale(1.15, 1, 0.85);
  pelvis.translate(0, 0.40, 0);
  parts.push(tagPartGeometry(pelvis, 0x12161e, 0));

  const torsoCore = new THREE.CylinderGeometry(0.19, 0.145, 0.34, 12);
  torsoCore.scale(1.18, 1, 0.85);
  torsoCore.translate(0, 0.56, 0);
  parts.push(tagPartGeometry(torsoCore, obsidian, 0));

  const breacherChest = new THREE.BoxGeometry(0.31, 0.25, 0.185);
  breacherChest.translate(0, 0.57, 0.045);
  parts.push(tagPartGeometry(breacherChest, crimsonArmor, 0));

  // Angular Crimson Breacher Pauldrons
  for (const sideSign of [-1, 1]) {
    const pauldron = new THREE.BoxGeometry(0.15, 0.13, 0.21);
    pauldron.rotateZ(-sideSign * 0.25);
    pauldron.translate(sideSign * 0.23, 0.67, 0.01);
    parts.push(tagPartGeometry(pauldron, crimsonBright, 0));
  }

  // Rear Thruster / Ammo Pack (-Z back)
  const backPack = new THREE.BoxGeometry(0.25, 0.24, 0.13);
  backPack.translate(0, 0.57, -0.16);
  parts.push(tagPartGeometry(backPack, gunmetal, 0));

  // Neck, Jaw & Breacher Helmet (+Z front)
  const neck = new THREE.CylinderGeometry(0.072, 0.084, 0.09, 10);
  neck.translate(0, 0.75, 0.01);
  parts.push(tagPartGeometry(neck, skinPale, 0));

  const head = new THREE.SphereGeometry(0.13, 12, 10);
  head.translate(0, 0.855, 0.015);
  parts.push(tagPartGeometry(head, obsidian, 0));

  const helmet = new THREE.SphereGeometry(0.165, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62);
  helmet.scale(1.04, 0.96, 1.08);
  helmet.translate(0, 0.875, 0.0);
  parts.push(tagPartGeometry(helmet, crimsonArmor, 0));

  const crest = new THREE.BoxGeometry(0.055, 0.055, 0.24);
  crest.translate(0, 1.01, 0.0);
  parts.push(tagPartGeometry(crest, obsidian, 0));

  const visor = new THREE.BoxGeometry(0.21, 0.062, 0.06);
  visor.translate(0, 0.865, 0.145);
  parts.push(tagPartGeometry(visor, visorRed, 0));

  // Enemy Arms & Crimson Carbine (+Z front, partId 4)
  const rArm = new THREE.CapsuleGeometry(0.05, 0.18, 5, 8);
  rArm.rotateX(-1.05);
  rArm.translate(0.175, 0.56, 0.14);
  parts.push(tagPartGeometry(rArm, obsidian, 4));

  const lArm = new THREE.CapsuleGeometry(0.048, 0.18, 5, 8);
  lArm.rotateX(-1.15);
  lArm.rotateZ(0.45);
  lArm.translate(-0.11, 0.56, 0.18);
  parts.push(tagPartGeometry(lArm, obsidian, 4));

  const enemyRifle = new THREE.BoxGeometry(0.068, 0.09, 0.48);
  enemyRifle.translate(0.10, 0.56, 0.34);
  parts.push(tagPartGeometry(enemyRifle, gunmetal, 4));

  const enemyBarrel = new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8);
  enemyBarrel.rotateX(Math.PI / 2);
  enemyBarrel.translate(0.10, 0.57, 0.64);
  parts.push(tagPartGeometry(enemyBarrel, crimsonBright, 4));

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
 * Uniform aerodynamic tracer bolt with native outer additive glow sheath
 * for maximum battlefield clarity in single-pass forward WebGL.
 */
export function createTracerBoltGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  // Bright solid supersonic core dart (-Z forward)
  const tip = new THREE.ConeGeometry(0.062, 0.24, 6);
  tip.rotateX(-Math.PI / 2);
  tip.translate(0, 0, -0.34);
  parts.push(tagPartGeometry(tip, 0xffffff, 0));

  const core = new THREE.CylinderGeometry(0.052, 0.026, 0.54, 6);
  core.rotateX(Math.PI / 2);
  core.translate(0, 0, 0.05);
  parts.push(tagPartGeometry(core, 0xffffff, 0));

  // Soft outer additive halo sheath (single-pass bloom look without HalfFloat FBOs)
  const halo = new THREE.CylinderGeometry(0.115, 0.055, 0.68, 6);
  halo.rotateX(Math.PI / 2);
  halo.translate(0, 0, -0.02);
  parts.push(tagPartGeometry(halo, 0x5c5c5c, 0));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  merged.deleteAttribute('aPartId');
  return merged;
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
