import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { WeaponTierId } from '../core/types';
import { createShowcaseWeaponGroup } from './WeaponRigFactory';

/**
 * Computes a position-welded `aOutlineNormal` (`vec3`) attribute across colocated vertices
 * sharing the same limb/spin group (`groupAttrName`) so `BackSide` inverted-hull cel-outlines
 * extrude 100% watertight at sharp `BoxGeometry` corners with zero speckles or gaps!
 */
export function attachWeldedOutlineNormals(
  geo: THREE.BufferGeometry,
  groupAttrName?: string
): void {
  const posAttr = geo.attributes.position as THREE.BufferAttribute;
  const normAttr = geo.attributes.normal as THREE.BufferAttribute;
  const groupAttr = groupAttrName
    ? (geo.attributes[groupAttrName] as THREE.BufferAttribute | undefined)
    : undefined;

  const count = posAttr.count;
  const sumMap = new Map<string, [number, number, number]>();
  const keys = new Array<string>(count);

  for (let i = 0; i < count; i++) {
    const qx = Math.round(posAttr.getX(i) * 800);
    const qy = Math.round(posAttr.getY(i) * 800);
    const qz = Math.round(posAttr.getZ(i) * 800);
    const g = groupAttr ? Math.round(groupAttr.getX(i) * 10) : 0;
    const key = `${g}:${qx},${qy},${qz}`;
    keys[i] = key;

    const nx = normAttr.getX(i);
    const ny = normAttr.getY(i);
    const nz = normAttr.getZ(i);

    let acc = sumMap.get(key);
    if (!acc) {
      acc = [nx, ny, nz];
      sumMap.set(key, acc);
    } else {
      acc[0] += nx;
      acc[1] += ny;
      acc[2] += nz;
    }
  }

  const outNormals = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const acc = sumMap.get(keys[i])!;
    let ax = acc[0];
    let ay = acc[1];
    let az = acc[2];
    let len = Math.hypot(ax, ay, az);
    if (len < 0.0001) {
      ax = normAttr.getX(i);
      ay = normAttr.getY(i);
      az = normAttr.getZ(i);
      len = Math.max(0.0001, Math.hypot(ax, ay, az));
    }
    outNormals[i * 3] = ax / len;
    outNormals[i * 3 + 1] = ay / len;
    outNormals[i * 3 + 2] = az / len;
  }

  geo.setAttribute('aOutlineNormal', new THREE.BufferAttribute(outNormals, 3));
}

/**
 * Tags an indexed primitive with smooth vertex normals BEFORE `toNonIndexed()` so spheres,
 * capsules, and cylinders retain silky-smooth Gouraud/Phong shading instead of flat facets!
 */
function tagPartGeometry(
  geo: THREE.BufferGeometry,
  hexColor: number,
  partId = 0
): THREE.BufferGeometry {
  if (!geo.attributes.normal) {
    geo.computeVertexNormals();
  }
  const nonIndexed = geo.index ? geo.toNonIndexed() : geo.clone();
  const nAttr = nonIndexed.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < nAttr.count; i++) {
    const nx = nAttr.getX(i);
    const ny = nAttr.getY(i);
    const nz = nAttr.getZ(i);
    const len = Math.max(0.0001, Math.hypot(nx, ny, nz));
    nAttr.setXYZ(i, nx / len, ny / len, nz / len);
  }

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
 * - Smooth glossy rounded sky-cobalt helmet (`24x16`), sleek athletic cool-slate combat jacket
 *   with crisp tactical web straps (no oversized football shoulder balls or bulky box rucksack),
 *   vivid cobalt trousers, and right-offset two-handed firing arms (`x = +0.255`) so the live
 *   equipped 3D Tier 1-5 gun & muzzle flash read unmistakably beside the commando's silhouette!
 */
export function createPlayerSoldierGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const helmetCobalt = 0x1a96ff;
  const helmetBand = 0x0f6ad6;
  const jacketSlate = 0x90a5b8;
  const vestSlateDark = 0x5c7185;
  const pantsCobalt = 0x1680f0;
  const darkWebbing = 0x19222e;
  const skinWarm = 0xf0ba92;
  const visorCyan = 0x6efbff;
  const accentGold = 0xffcf56;

  // --- LEGS (partId 1 = Left, partId 2 = Right) ---
  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.096;

    const thigh = new THREE.CapsuleGeometry(0.064, 0.135, 8, 14);
    thigh.translate(lx, 0.30, 0);
    parts.push(tagPartGeometry(thigh, pantsCobalt, partId));

    const shin = new THREE.CapsuleGeometry(0.054, 0.125, 8, 14);
    shin.translate(lx, 0.135, 0.008);
    parts.push(tagPartGeometry(shin, pantsCobalt, partId));

    const boot = new THREE.CapsuleGeometry(0.056, 0.09, 8, 12);
    boot.rotateX(Math.PI / 2);
    boot.scale(1.04, 0.84, 1.08);
    boot.translate(lx, 0.046, -0.032);
    parts.push(tagPartGeometry(boot, darkWebbing, partId));
  }

  // --- PELVIS & TACTICAL BELT (partId 0) ---
  const pelvis = new THREE.CylinderGeometry(0.142, 0.128, 0.105, 16);
  pelvis.scale(1.10, 1, 0.84);
  pelvis.translate(0, 0.40, 0);
  parts.push(tagPartGeometry(pelvis, pantsCobalt, 0));

  const belt = new THREE.CylinderGeometry(0.149, 0.146, 0.044, 16);
  belt.scale(1.11, 1, 0.86);
  belt.translate(0, 0.432, 0);
  parts.push(tagPartGeometry(belt, darkWebbing, 0));

  // --- SLEEK ATHLETIC COMBAT JACKET & LIGHT HARNESS (partId 0) ---
  const torsoCore = new THREE.CylinderGeometry(0.178, 0.140, 0.33, 18);
  torsoCore.scale(1.12, 1, 0.84);
  torsoCore.translate(0, 0.565, 0);
  parts.push(tagPartGeometry(torsoCore, jacketSlate, 0));

  const shoulderYoke = new THREE.SphereGeometry(0.176, 18, 12);
  shoulderYoke.scale(1.16, 0.46, 0.82);
  shoulderYoke.translate(0, 0.695, 0);
  parts.push(tagPartGeometry(shoulderYoke, jacketSlate, 0));

  // Low-profile front plate + sleek back harness straps (keeps back silhouette super clean!)
  const frontChest = new THREE.BoxGeometry(0.24, 0.20, 0.06);
  frontChest.translate(0, 0.575, -0.115);
  parts.push(tagPartGeometry(frontChest, vestSlateDark, 0));

  for (const sx of [-0.088, 0.088]) {
    const strap = new THREE.BoxGeometry(0.036, 0.25, 0.195);
    strap.translate(sx, 0.595, 0.0);
    parts.push(tagPartGeometry(strap, darkWebbing, 0));
  }

  const radioClip = new THREE.BoxGeometry(0.06, 0.09, 0.042);
  radioClip.translate(-0.088, 0.56, 0.105);
  parts.push(tagPartGeometry(radioClip, accentGold, 0));

  // --- NECK, WARM SKIN HEAD & SMOOTH GLOSSY COBALT HELMET (partId 0) ---
  const neck = new THREE.CylinderGeometry(0.072, 0.082, 0.09, 14);
  neck.translate(0, 0.745, -0.008);
  parts.push(tagPartGeometry(neck, skinWarm, 0));

  const head = new THREE.SphereGeometry(0.142, 20, 16);
  head.scale(0.98, 1.02, 0.98);
  head.translate(0, 0.855, -0.012);
  parts.push(tagPartGeometry(head, skinWarm, 0));

  const helmetCrown = new THREE.SphereGeometry(
    0.180,
    24,
    18,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.60
  );
  helmetCrown.scale(1.04, 0.98, 1.07);
  helmetCrown.rotateX(-0.08);
  helmetCrown.translate(0, 0.885, -0.006);
  parts.push(tagPartGeometry(helmetCrown, helmetCobalt, 0));

  const helmetRim = new THREE.TorusGeometry(0.172, 0.024, 12, 24);
  helmetRim.rotateX(Math.PI / 2 - 0.08);
  helmetRim.translate(0, 0.850, -0.008);
  parts.push(tagPartGeometry(helmetRim, helmetBand, 0));

  const visorLens = new THREE.CapsuleGeometry(0.026, 0.14, 6, 10);
  visorLens.rotateZ(Math.PI / 2);
  visorLens.translate(0, 0.865, -0.155);
  parts.push(tagPartGeometry(visorLens, visorCyan, 0));

  // --- RIGHT-SIDE TWO-HANDED FIRING ARMS (partId 4 — aligned to EQUIPPED_GUN_PIVOT_X = +0.255!) ---
  const rUpperArm = new THREE.CapsuleGeometry(0.052, 0.125, 8, 12);
  rUpperArm.rotateZ(0.32);
  rUpperArm.rotateX(0.48);
  rUpperArm.translate(0.215, 0.61, -0.05);
  parts.push(tagPartGeometry(rUpperArm, jacketSlate, 4));

  const rForearm = new THREE.CapsuleGeometry(0.046, 0.135, 8, 12);
  rForearm.rotateX(1.28);
  rForearm.rotateY(-0.08);
  rForearm.translate(0.255, 0.555, -0.165);
  parts.push(tagPartGeometry(rForearm, jacketSlate, 4));

  const rGlove = new THREE.SphereGeometry(0.052, 12, 10);
  rGlove.translate(0.255, 0.55, -0.245);
  parts.push(tagPartGeometry(rGlove, darkWebbing, 4));

  const lUpperArm = new THREE.CapsuleGeometry(0.050, 0.135, 8, 12);
  lUpperArm.rotateX(0.82);
  lUpperArm.rotateZ(-0.55);
  lUpperArm.translate(-0.145, 0.60, -0.095);
  parts.push(tagPartGeometry(lUpperArm, jacketSlate, 4));

  const lForearm = new THREE.CapsuleGeometry(0.044, 0.19, 8, 12);
  lForearm.rotateX(1.38);
  lForearm.rotateZ(-0.95);
  lForearm.translate(0.075, 0.56, -0.285);
  parts.push(tagPartGeometry(lForearm, jacketSlate, 4));

  const lGlove = new THREE.SphereGeometry(0.050, 12, 10);
  lGlove.translate(0.235, 0.56, -0.405);
  parts.push(tagPartGeometry(lGlove, darkWebbing, 4));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  attachWeldedOutlineNormals(merged, 'aPartId');
  return merged;
}

/**
 * Crimson Shock Breacher (Standard Enemy Trooper, facing +Z toward player):
 * Smooth glossy crimson helmet, bright tactical vest & trousers, dark carbine.
 */
export function createEnemySoldierGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const crimsonBright = 0xf02e46;
  const crimsonDeep = 0xc41e35;
  const vestLight = 0xe8d5bc;
  const obsidian = 0x1d232e;
  const gunmetal = 0x384352;
  const visorRed = 0xff7582;
  const skinWarm = 0xebb490;

  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.098;

    const thigh = new THREE.CapsuleGeometry(0.064, 0.13, 8, 12);
    thigh.translate(lx, 0.30, 0);
    parts.push(tagPartGeometry(thigh, crimsonBright, partId));

    const shin = new THREE.CapsuleGeometry(0.054, 0.12, 8, 12);
    shin.translate(lx, 0.13, -0.008);
    parts.push(tagPartGeometry(shin, crimsonBright, partId));

    const boot = new THREE.CapsuleGeometry(0.054, 0.085, 8, 10);
    boot.rotateX(Math.PI / 2);
    boot.scale(1.04, 0.84, 1.08);
    boot.translate(lx, 0.044, 0.032);
    parts.push(tagPartGeometry(boot, obsidian, partId));
  }

  const pelvis = new THREE.CylinderGeometry(0.146, 0.132, 0.11, 14);
  pelvis.scale(1.14, 1, 0.85);
  pelvis.translate(0, 0.40, 0);
  parts.push(tagPartGeometry(pelvis, crimsonDeep, 0));

  const torsoCore = new THREE.CylinderGeometry(0.186, 0.142, 0.33, 16);
  torsoCore.scale(1.16, 1, 0.85);
  torsoCore.translate(0, 0.56, 0);
  parts.push(tagPartGeometry(torsoCore, vestLight, 0));

  const shoulderYoke = new THREE.SphereGeometry(0.18, 16, 10);
  shoulderYoke.scale(1.16, 0.45, 0.82);
  shoulderYoke.translate(0, 0.685, 0);
  parts.push(tagPartGeometry(shoulderYoke, vestLight, 0));

  const chestStrap = new THREE.BoxGeometry(0.24, 0.18, 0.06);
  chestStrap.translate(0, 0.56, 0.115);
  parts.push(tagPartGeometry(chestStrap, crimsonDeep, 0));

  const neck = new THREE.CylinderGeometry(0.072, 0.084, 0.09, 12);
  neck.translate(0, 0.75, 0.01);
  parts.push(tagPartGeometry(neck, skinWarm, 0));

  const head = new THREE.SphereGeometry(0.136, 18, 14);
  head.translate(0, 0.855, 0.015);
  parts.push(tagPartGeometry(head, skinWarm, 0));

  const helmet = new THREE.SphereGeometry(0.174, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62);
  helmet.scale(1.04, 0.98, 1.08);
  helmet.translate(0, 0.882, 0.0);
  parts.push(tagPartGeometry(helmet, crimsonBright, 0));

  const visor = new THREE.CapsuleGeometry(0.025, 0.13, 6, 10);
  visor.rotateZ(Math.PI / 2);
  visor.translate(0, 0.865, 0.148);
  parts.push(tagPartGeometry(visor, visorRed, 0));

  const rArm = new THREE.CapsuleGeometry(0.05, 0.18, 8, 10);
  rArm.rotateX(-0.95);
  rArm.translate(0.185, 0.56, 0.13);
  parts.push(tagPartGeometry(rArm, skinWarm, 4));

  const lArm = new THREE.CapsuleGeometry(0.048, 0.18, 8, 10);
  lArm.rotateX(-1.05);
  lArm.rotateZ(0.38);
  lArm.translate(-0.14, 0.56, 0.16);
  parts.push(tagPartGeometry(lArm, skinWarm, 4));

  const enemyRifle = new THREE.BoxGeometry(0.068, 0.088, 0.42);
  enemyRifle.translate(0.10, 0.55, 0.30);
  parts.push(tagPartGeometry(enemyRifle, gunmetal, 4));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  attachWeldedOutlineNormals(merged, 'aPartId');
  return merged;
}

/**
 * Armored Heavy Juggernaut (Elite Brute Enemy, facing +Z toward player):
 * Hulking vibrant olive-emerald & crimson-helmeted exo-trooper with smooth siege pauldrons,
 * reinforced blast collar, and twin-barrel autocannon — carries floating red HP bar!
 */
export function createHeavyEnemyGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const oliveArmor = 0x67a138;
  const oliveDark = 0x457024;
  const crimsonHelmet = 0xe62e42;
  const bronzeTrim = 0xf5aa2a;
  const obsidian = 0x1a2029;
  const gunmetal = 0x3d4856;
  const visorGlow = 0xffbe3b;

  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.135;

    const thigh = new THREE.CapsuleGeometry(0.088, 0.14, 8, 12);
    thigh.translate(lx, 0.31, 0);
    parts.push(tagPartGeometry(thigh, oliveDark, partId));

    const kneePlate = new THREE.SphereGeometry(0.072, 10, 8);
    kneePlate.scale(1.0, 0.85, 0.85);
    kneePlate.translate(lx, 0.21, 0.062);
    parts.push(tagPartGeometry(kneePlate, crimsonHelmet, partId));

    const shin = new THREE.CapsuleGeometry(0.078, 0.13, 8, 12);
    shin.translate(lx, 0.13, 0);
    parts.push(tagPartGeometry(shin, oliveArmor, partId));

    const boot = new THREE.CapsuleGeometry(0.074, 0.11, 8, 10);
    boot.rotateX(Math.PI / 2);
    boot.scale(1.06, 0.82, 1.08);
    boot.translate(lx, 0.048, 0.04);
    parts.push(tagPartGeometry(boot, obsidian, partId));
  }

  const pelvis = new THREE.CylinderGeometry(0.20, 0.18, 0.13, 14);
  pelvis.scale(1.16, 1, 0.88);
  pelvis.translate(0, 0.41, 0);
  parts.push(tagPartGeometry(pelvis, obsidian, 0));

  const torso = new THREE.CylinderGeometry(0.26, 0.19, 0.38, 16);
  torso.scale(1.25, 1, 0.92);
  torso.translate(0, 0.59, 0);
  parts.push(tagPartGeometry(torso, oliveArmor, 0));

  const chestArmor = new THREE.BoxGeometry(0.40, 0.26, 0.22);
  chestArmor.translate(0, 0.60, 0.045);
  parts.push(tagPartGeometry(chestArmor, oliveDark, 0));

  const chestHazard = new THREE.BoxGeometry(0.23, 0.11, 0.04);
  chestHazard.translate(0, 0.61, 0.162);
  parts.push(tagPartGeometry(chestHazard, bronzeTrim, 0));

  for (const sideSign of [-1, 1]) {
    const pauldron = new THREE.SphereGeometry(0.152, 16, 12);
    pauldron.scale(1.12, 0.92, 1.15);
    pauldron.translate(sideSign * 0.31, 0.70, 0.02);
    parts.push(tagPartGeometry(pauldron, oliveArmor, 0));

    const rim = new THREE.TorusGeometry(0.13, 0.028, 8, 16, Math.PI);
    rim.rotateZ(-sideSign * 0.25);
    rim.translate(sideSign * 0.315, 0.73, 0.02);
    parts.push(tagPartGeometry(rim, bronzeTrim, 0));
  }

  const collar = new THREE.CylinderGeometry(0.17, 0.20, 0.09, 14);
  collar.translate(0, 0.79, 0.02);
  parts.push(tagPartGeometry(collar, gunmetal, 0));

  const head = new THREE.SphereGeometry(0.155, 16, 12);
  head.translate(0, 0.89, 0.03);
  parts.push(tagPartGeometry(head, oliveArmor, 0));

  const helmet = new THREE.SphereGeometry(0.198, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62);
  helmet.scale(1.08, 0.96, 1.12);
  helmet.translate(0, 0.915, 0.02);
  parts.push(tagPartGeometry(helmet, crimsonHelmet, 0));

  const visor = new THREE.CapsuleGeometry(0.032, 0.16, 6, 10);
  visor.rotateZ(Math.PI / 2);
  visor.translate(0, 0.89, 0.185);
  parts.push(tagPartGeometry(visor, visorGlow, 0));

  for (const sideSign of [-1, 1]) {
    const arm = new THREE.CapsuleGeometry(0.072, 0.20, 8, 12);
    arm.rotateX(-0.92);
    arm.rotateZ(-sideSign * 0.22);
    arm.translate(sideSign * 0.25, 0.56, 0.16);
    parts.push(tagPartGeometry(arm, oliveArmor, 4));
  }

  const cannonBody = new THREE.BoxGeometry(0.16, 0.13, 0.50);
  cannonBody.translate(0, 0.50, 0.34);
  parts.push(tagPartGeometry(cannonBody, gunmetal, 4));

  for (const bx of [-0.04, 0.04]) {
    const barrel = new THREE.CylinderGeometry(0.024, 0.024, 0.26, 10);
    barrel.rotateX(Math.PI / 2);
    barrel.translate(bx, 0.51, 0.65);
    parts.push(tagPartGeometry(barrel, bronzeTrim, 4));
  }

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  attachWeldedOutlineNormals(merged, 'aPartId');
  return merged;
}

export function createWeaponPickupGroup(tier: WeaponTierId): THREE.Group {
  return createShowcaseWeaponGroup(tier).root;
}

/**
 * Chunky High-Contrast Teardrop Plasma/Tracer Bolt:
 * Smooth rounded bright white nose + tapered cyan/gold wake!
 */
export function createTracerBoltGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const head = new THREE.SphereGeometry(0.096, 12, 10);
  head.scale(0.92, 0.92, 1.38);
  head.translate(0, 0, -0.24);
  parts.push(tagPartGeometry(head, 0xffffff, 0));

  const tail = new THREE.ConeGeometry(0.088, 0.72, 10);
  tail.rotateX(Math.PI / 2);
  tail.translate(0, 0, 0.15);
  parts.push(tagPartGeometry(tail, 0xd8faff, 0));

  const halo = new THREE.ConeGeometry(0.148, 0.90, 10);
  halo.rotateX(Math.PI / 2);
  halo.translate(0, 0, 0.11);
  parts.push(tagPartGeometry(halo, 0x56c8e8, 0));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  merged.deleteAttribute('aPartId');
  return merged;
}

/**
 * Chunky Beveled 3D Gold Coin Medallion with dark cartoon ink outline & embossed star emblem!
 */
export function createGoldCoinPickupGroup(): THREE.Group {
  const group = new THREE.Group();

  const goldFaceMat = new THREE.MeshStandardMaterial({
    color: 0xffce2b,
    emissive: 0x805400,
    roughness: 0.24,
    metalness: 0.36,
  });
  const goldRimMat = new THREE.MeshStandardMaterial({
    color: 0xffe47a,
    emissive: 0x8f6000,
    roughness: 0.20,
    metalness: 0.40,
  });
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x161108,
    side: THREE.BackSide,
  });

  const discGeo = new THREE.CylinderGeometry(0.60, 0.60, 0.22, 26);
  discGeo.rotateX(Math.PI / 2);
  group.add(new THREE.Mesh(discGeo, goldFaceMat));

  const outlineGeo = new THREE.CylinderGeometry(0.66, 0.66, 0.28, 26);
  outlineGeo.rotateX(Math.PI / 2);
  group.add(new THREE.Mesh(outlineGeo, outlineMat));

  const rimFront = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.075, 10, 26), goldRimMat);
  rimFront.position.z = 0.065;
  group.add(rimFront);

  const rimBack = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.075, 10, 26), goldRimMat);
  rimBack.position.z = -0.065;
  group.add(rimBack);

  const emblemV = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.56, 0.28), goldRimMat);
  const emblemTop = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.10, 0.27), goldRimMat);
  emblemTop.position.y = 0.14;
  const emblemBot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.10, 0.27), goldRimMat);
  emblemBot.position.y = -0.14;
  group.add(emblemV, emblemTop, emblemBot);

  return group;
}

/**
 * Perched Commando Helmet +1 Recruit Token atop Reinforcement Supply Drums!
 */
export function createRecruitPickupGroup(): THREE.Group {
  const group = new THREE.Group();

  const helmetMat = new THREE.MeshStandardMaterial({
    color: 0x1a96ff,
    emissive: 0x0a3d7a,
    roughness: 0.28,
    metalness: 0.24,
  });
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x70fbff });
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x0d131c,
    side: THREE.BackSide,
  });

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
    helmetMat
  );
  dome.position.y = 0.05;
  group.add(dome);

  const domeOutline = new THREE.Mesh(
    new THREE.SphereGeometry(0.50, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.64),
    outlineMat
  );
  domeOutline.position.y = 0.05;
  group.add(domeOutline);

  const visor = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.34, 6, 10), visorMat);
  visor.rotation.z = Math.PI / 2;
  visor.position.set(0, -0.02, 0.37);
  group.add(visor);

  return group;
}

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
