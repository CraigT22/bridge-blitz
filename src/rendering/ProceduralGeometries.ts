import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { WeaponTierId } from '../core/types';
import { createShowcaseWeaponGroup } from './WeaponRigFactory';

/**
 * Computes a position-welded `aOutlineNormal` (`vec3`) attribute across colocated vertices
 * sharing the same limb/spin group (`groupAttrName`) so `BackSide` inverted-hull cel-outlines
 * extrude 100% watertight at sharp `BoxGeometry` & faceted `CylinderGeometry` corners!
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
    const len = Math.max(0.0001, Math.hypot(nx, ny, azSafe(nz)));
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

function azSafe(v: number): number {
  return Number.isFinite(v) ? v : 0;
}

/**
 * Vanguard Stealth-Ops Exo-Commando (Player Elite Squad, facing -Z):
 * - Faceted 6-sided angular stealth combat helm with dorsal aero-crest & twin angled comms fins
 *   (zero round blue dome helmet!)
 * - Glowing wrap-around emerald-teal tactical visor (`0x28f8dc`) & chest reactor core
 * - Sleek stealth-navy undersuit (`0x18283d`) + brushed ice-titanium armor plates (`0x6684a3`)
 * - Right-offset two-handed firing arms (`x = +0.255, y = 0.555`) aligned to `WeaponRigFactory`!
 */
export function createPlayerSoldierGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const stealthSuit = 0x18283d;
  const titaniumPlate = 0x6a88a8;
  const helmArmor = 0x244266;
  const helmCrest = 0x86a8cc;
  const obsidianTrim = 0x0f1724;
  const visorTeal = 0x28f8dc;

  // --- LEGS (partId 1 = Left, partId 2 = Right — athletic armored exo-greaves) ---
  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.106;

    const thigh = new THREE.BoxGeometry(0.118, 0.18, 0.128);
    thigh.rotateX(-0.12);
    thigh.rotateZ(-sideSign * 0.04);
    thigh.translate(lx, 0.30, -0.012);
    parts.push(tagPartGeometry(thigh, stealthSuit, partId));

    const thighPlate = new THREE.BoxGeometry(0.098, 0.13, 0.045);
    thighPlate.rotateX(-0.12);
    thighPlate.translate(lx * 1.04, 0.305, -0.068);
    parts.push(tagPartGeometry(thighPlate, titaniumPlate, partId));

    const shin = new THREE.CylinderGeometry(0.056, 0.048, 0.17, 6);
    shin.rotateX(0.14);
    shin.translate(lx * 1.03, 0.14, 0.004);
    parts.push(tagPartGeometry(shin, titaniumPlate, partId));

    const boot = new THREE.BoxGeometry(0.11, 0.078, 0.175);
    boot.translate(lx * 1.03, 0.042, -0.026);
    parts.push(tagPartGeometry(boot, obsidianTrim, partId));
  }

  // --- PELVIS & EXO-BELT (partId 0) ---
  const pelvis = new THREE.CylinderGeometry(0.146, 0.130, 0.105, 6);
  pelvis.scale(1.12, 1, 0.86);
  pelvis.translate(0, 0.40, 0);
  parts.push(tagPartGeometry(pelvis, stealthSuit, 0));

  const belt = new THREE.BoxGeometry(0.31, 0.046, 0.23);
  belt.translate(0, 0.435, 0);
  parts.push(tagPartGeometry(belt, obsidianTrim, 0));

  // --- FACETED TITANIUM EXO-CHEST & GLOWING TEAL CORE (partId 0) ---
  const torsoCore = new THREE.CylinderGeometry(0.185, 0.142, 0.33, 6);
  torsoCore.scale(1.14, 1, 0.86);
  torsoCore.translate(0, 0.568, 0);
  parts.push(tagPartGeometry(torsoCore, stealthSuit, 0));

  const chestArmor = new THREE.BoxGeometry(0.32, 0.21, 0.185);
  chestArmor.translate(0, 0.595, -0.015);
  parts.push(tagPartGeometry(chestArmor, titaniumPlate, 0));

  const backSpine = new THREE.BoxGeometry(0.12, 0.23, 0.058);
  backSpine.translate(0, 0.59, 0.102);
  parts.push(tagPartGeometry(backSpine, helmArmor, 0));

  const spineGlow = new THREE.BoxGeometry(0.036, 0.16, 0.025);
  spineGlow.translate(0, 0.595, 0.132);
  parts.push(tagPartGeometry(spineGlow, visorTeal, 0));

  const frontReactor = new THREE.BoxGeometry(0.09, 0.07, 0.03);
  frontReactor.translate(0, 0.60, -0.112);
  parts.push(tagPartGeometry(frontReactor, visorTeal, 0));

  for (const sideSign of [-1, 1]) {
    const pauldron = new THREE.BoxGeometry(0.125, 0.088, 0.165);
    pauldron.rotateZ(-sideSign * 0.22);
    pauldron.translate(sideSign * 0.205, 0.685, -0.005);
    parts.push(tagPartGeometry(pauldron, helmArmor, 0));

    const pauldronTrim = new THREE.BoxGeometry(0.132, 0.024, 0.145);
    pauldronTrim.rotateZ(-sideSign * 0.22);
    pauldronTrim.translate(sideSign * 0.212, 0.718, -0.005);
    parts.push(tagPartGeometry(pauldronTrim, visorTeal, 0));
  }

  // --- FACETED 6-SIDED STEALTH HELMET + GLOWING TEAL VISOR + COMMS FINS (partId 0) ---
  const neckCollar = new THREE.CylinderGeometry(0.095, 0.115, 0.085, 6);
  neckCollar.translate(0, 0.745, -0.005);
  parts.push(tagPartGeometry(neckCollar, obsidianTrim, 0));

  const helmShell = new THREE.CylinderGeometry(0.138, 0.172, 0.195, 6);
  helmShell.scale(1.04, 1.0, 1.10);
  helmShell.translate(0, 0.865, -0.008);
  parts.push(tagPartGeometry(helmShell, helmArmor, 0));

  const helmCrownCap = new THREE.CylinderGeometry(0.082, 0.138, 0.068, 6);
  helmCrownCap.scale(1.04, 1.0, 1.10);
  helmCrownCap.translate(0, 0.985, -0.008);
  parts.push(tagPartGeometry(helmCrownCap, titaniumPlate, 0));

  // Dorsal aero-fin crest
  const dorsalCrest = new THREE.BoxGeometry(0.048, 0.065, 0.24);
  dorsalCrest.rotateX(0.14);
  dorsalCrest.translate(0, 1.015, 0.005);
  parts.push(tagPartGeometry(dorsalCrest, helmCrest, 0));

  // Wide wrap-around glowing emerald-teal visor (front -Z + side chevrons so visible from behind/3-quarter!)
  const visorFront = new THREE.BoxGeometry(0.255, 0.068, 0.11);
  visorFront.translate(0, 0.872, -0.132);
  parts.push(tagPartGeometry(visorFront, visorTeal, 0));

  // Angled side comms fins on helmet
  for (const sideSign of [-1, 1]) {
    const commsFin = new THREE.BoxGeometry(0.032, 0.155, 0.072);
    commsFin.rotateZ(-sideSign * 0.26);
    commsFin.rotateX(-0.24);
    commsFin.translate(sideSign * 0.175, 0.945, 0.032);
    parts.push(tagPartGeometry(commsFin, helmCrest, 0));
  }

  // --- RIGHT-SIDE TWO-HANDED FIRING ARMS (partId 4 — aligned to EQUIPPED_GUN_PIVOT_X = +0.255!) ---
  const rUpperArm = new THREE.BoxGeometry(0.095, 0.175, 0.095);
  rUpperArm.rotateZ(0.32);
  rUpperArm.rotateX(0.48);
  rUpperArm.translate(0.215, 0.61, -0.05);
  parts.push(tagPartGeometry(rUpperArm, stealthSuit, 4));

  const rForearm = new THREE.BoxGeometry(0.088, 0.185, 0.088);
  rForearm.rotateX(1.28);
  rForearm.rotateY(-0.08);
  rForearm.translate(0.255, 0.555, -0.165);
  parts.push(tagPartGeometry(rForearm, titaniumPlate, 4));

  const rGauntlet = new THREE.BoxGeometry(0.095, 0.09, 0.095);
  rGauntlet.translate(0.255, 0.55, -0.245);
  parts.push(tagPartGeometry(rGauntlet, obsidianTrim, 4));

  const lUpperArm = new THREE.BoxGeometry(0.092, 0.185, 0.092);
  lUpperArm.rotateX(0.82);
  lUpperArm.rotateZ(-0.55);
  lUpperArm.translate(-0.145, 0.60, -0.095);
  parts.push(tagPartGeometry(lUpperArm, stealthSuit, 4));

  const lForearm = new THREE.BoxGeometry(0.084, 0.23, 0.084);
  lForearm.rotateX(1.38);
  lForearm.rotateZ(-0.95);
  lForearm.translate(0.075, 0.56, -0.285);
  parts.push(tagPartGeometry(lForearm, titaniumPlate, 4));

  const lGauntlet = new THREE.BoxGeometry(0.092, 0.088, 0.092);
  lGauntlet.translate(0.235, 0.56, -0.405);
  parts.push(tagPartGeometry(lGauntlet, obsidianTrim, 4));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  attachWeldedOutlineNormals(merged, 'aPartId');
  return merged;
}

/**
 * Horned Syndicate Raider Mech (Standard Enemy Assault Unit, facing +Z toward player):
 * - Angular dark-obsidian chassis (`0x221b30`) + sharp crimson-magenta armor (`0xe82258`)
 * - Faceted 6-sided battle-helm crowned with twin swept metallic horns (zero round dome, zero bare skin!)
 * - Glowing molten-amber mono-optic visor (`0xffb82e`) & angular blade-carbine!
 */
export function createEnemySoldierGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const crimsonPlate = 0xe82258;
  const crimsonDark = 0xa8143e;
  const chassisObsidian = 0x221b30;
  const hornSteel = 0xc8d6e6;
  const gunmetal = 0x3a4659;
  const opticAmber = 0xffb82e;

  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.102;

    const thigh = new THREE.BoxGeometry(0.112, 0.175, 0.12);
    thigh.translate(lx, 0.30, 0);
    parts.push(tagPartGeometry(thigh, chassisObsidian, partId));

    const shinPlate = new THREE.CylinderGeometry(0.058, 0.046, 0.175, 6);
    shinPlate.translate(lx, 0.135, 0.005);
    parts.push(tagPartGeometry(shinPlate, crimsonPlate, partId));

    const boot = new THREE.BoxGeometry(0.108, 0.075, 0.17);
    boot.translate(lx, 0.042, 0.032);
    parts.push(tagPartGeometry(boot, chassisObsidian, partId));
  }

  const pelvis = new THREE.CylinderGeometry(0.148, 0.132, 0.11, 6);
  pelvis.scale(1.14, 1, 0.86);
  pelvis.translate(0, 0.40, 0);
  parts.push(tagPartGeometry(pelvis, crimsonDark, 0));

  const torsoCore = new THREE.CylinderGeometry(0.19, 0.14, 0.33, 6);
  torsoCore.scale(1.18, 1, 0.86);
  torsoCore.translate(0, 0.565, 0);
  parts.push(tagPartGeometry(torsoCore, chassisObsidian, 0));

  const chestVPlate = new THREE.BoxGeometry(0.33, 0.21, 0.18);
  chestVPlate.translate(0, 0.59, 0.02);
  parts.push(tagPartGeometry(chestVPlate, crimsonPlate, 0));

  const chestCore = new THREE.BoxGeometry(0.095, 0.075, 0.032);
  chestCore.translate(0, 0.595, 0.115);
  parts.push(tagPartGeometry(chestCore, opticAmber, 0));

  for (const sideSign of [-1, 1]) {
    const finPauldron = new THREE.ConeGeometry(0.095, 0.21, 4);
    finPauldron.rotateZ(-sideSign * 0.62);
    finPauldron.translate(sideSign * 0.225, 0.70, 0.01);
    parts.push(tagPartGeometry(finPauldron, crimsonDark, 0));
  }

  const neck = new THREE.CylinderGeometry(0.085, 0.10, 0.085, 6);
  neck.translate(0, 0.75, 0.01);
  parts.push(tagPartGeometry(neck, gunmetal, 0));

  const helm = new THREE.CylinderGeometry(0.135, 0.165, 0.20, 6);
  helm.scale(1.04, 1.0, 1.08);
  helm.translate(0, 0.87, 0.01);
  parts.push(tagPartGeometry(helm, chassisObsidian, 0));

  const helmFace = new THREE.BoxGeometry(0.22, 0.14, 0.08);
  helmFace.translate(0, 0.865, 0.125);
  parts.push(tagPartGeometry(helmFace, crimsonPlate, 0));

  // Glowing molten-amber mono-optic slit
  const optic = new THREE.BoxGeometry(0.21, 0.052, 0.045);
  optic.translate(0, 0.878, 0.155);
  parts.push(tagPartGeometry(optic, opticAmber, 0));

  // Twin swept metallic syndicate horns!
  for (const sideSign of [-1, 1]) {
    const horn = new THREE.ConeGeometry(0.044, 0.23, 5);
    horn.rotateZ(-sideSign * 0.44);
    horn.rotateX(-0.22);
    horn.translate(sideSign * 0.155, 1.015, -0.01);
    parts.push(tagPartGeometry(horn, hornSteel, 0));
  }

  // Armored mecha arms + dark blade-carbine (partId 4)
  const rArm = new THREE.BoxGeometry(0.092, 0.24, 0.092);
  rArm.rotateX(-0.95);
  rArm.translate(0.185, 0.56, 0.13);
  parts.push(tagPartGeometry(rArm, crimsonDark, 4));

  const lArm = new THREE.BoxGeometry(0.088, 0.24, 0.088);
  lArm.rotateX(-1.05);
  lArm.rotateZ(0.38);
  lArm.translate(-0.14, 0.56, 0.16);
  parts.push(tagPartGeometry(lArm, crimsonDark, 4));

  const enemyRifle = new THREE.BoxGeometry(0.072, 0.096, 0.44);
  enemyRifle.translate(0.10, 0.55, 0.31);
  parts.push(tagPartGeometry(enemyRifle, gunmetal, 4));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  attachWeldedOutlineNormals(merged, 'aPartId');
  return merged;
}

/**
 * Horned Ironclad Syndicate Enforcer (Heavy Armored Elite, facing +Z toward player):
 * - Hulking obsidian-violet & royal-crimson heavy mecha plate (`0x261d3a` + `0xd41c54`) — zero olive-green!
 * - Spiked titanium shoulder pauldrons, molten-amber chest reactor core, horned siege battle-helm,
 *   and twin-barrel heavy autocannon!
 */
export function createHeavyEnemyGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const obsidianViolet = 0x261d3a;
  const crimsonHeavy = 0xd41c54;
  const titaniumTrim = 0x9eb4cc;
  const reactorAmber = 0xffaa24;
  const obsidian = 0x131722;
  const gunmetal = 0x3d4b5e;

  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.138;

    const thigh = new THREE.BoxGeometry(0.155, 0.19, 0.165);
    thigh.translate(lx, 0.31, 0);
    parts.push(tagPartGeometry(thigh, obsidianViolet, partId));

    const kneeSpike = new THREE.ConeGeometry(0.068, 0.13, 4);
    kneeSpike.rotateX(Math.PI / 2);
    kneeSpike.translate(lx, 0.215, 0.105);
    parts.push(tagPartGeometry(kneeSpike, crimsonHeavy, partId));

    const shin = new THREE.CylinderGeometry(0.084, 0.074, 0.18, 6);
    shin.translate(lx, 0.13, 0);
    parts.push(tagPartGeometry(shin, crimsonHeavy, partId));

    const boot = new THREE.BoxGeometry(0.15, 0.088, 0.21);
    boot.translate(lx, 0.045, 0.04);
    parts.push(tagPartGeometry(boot, obsidian, partId));
  }

  const pelvis = new THREE.CylinderGeometry(0.205, 0.185, 0.13, 6);
  pelvis.scale(1.18, 1, 0.88);
  pelvis.translate(0, 0.41, 0);
  parts.push(tagPartGeometry(pelvis, obsidian, 0));

  const torso = new THREE.CylinderGeometry(0.265, 0.195, 0.38, 6);
  torso.scale(1.26, 1, 0.94);
  torso.translate(0, 0.59, 0);
  parts.push(tagPartGeometry(torso, obsidianViolet, 0));

  const chestArmor = new THREE.BoxGeometry(0.42, 0.27, 0.23);
  chestArmor.translate(0, 0.605, 0.048);
  parts.push(tagPartGeometry(chestArmor, crimsonHeavy, 0));

  const chestReactor = new THREE.CylinderGeometry(0.075, 0.075, 0.05, 6);
  chestReactor.rotateX(Math.PI / 2);
  chestReactor.translate(0, 0.615, 0.168);
  parts.push(tagPartGeometry(chestReactor, reactorAmber, 0));

  for (const sideSign of [-1, 1]) {
    const pauldron = new THREE.BoxGeometry(0.22, 0.16, 0.24);
    pauldron.rotateZ(-sideSign * 0.22);
    pauldron.translate(sideSign * 0.315, 0.705, 0.02);
    parts.push(tagPartGeometry(pauldron, obsidianViolet, 0));

    const spike = new THREE.ConeGeometry(0.058, 0.19, 5);
    spike.rotateZ(-sideSign * 0.38);
    spike.translate(sideSign * 0.355, 0.835, 0.02);
    parts.push(tagPartGeometry(spike, titaniumTrim, 0));
  }

  const collar = new THREE.CylinderGeometry(0.18, 0.21, 0.095, 6);
  collar.translate(0, 0.79, 0.02);
  parts.push(tagPartGeometry(collar, gunmetal, 0));

  const helm = new THREE.CylinderGeometry(0.165, 0.195, 0.22, 6);
  helm.scale(1.08, 1.0, 1.12);
  helm.translate(0, 0.905, 0.025);
  parts.push(tagPartGeometry(helm, crimsonHeavy, 0));

  const visor = new THREE.BoxGeometry(0.26, 0.062, 0.06);
  visor.translate(0, 0.90, 0.19);
  parts.push(tagPartGeometry(visor, reactorAmber, 0));

  for (const sideSign of [-1, 1]) {
    const horn = new THREE.ConeGeometry(0.055, 0.27, 5);
    horn.rotateZ(-sideSign * 0.48);
    horn.rotateX(-0.18);
    horn.translate(sideSign * 0.195, 1.055, 0.0);
    parts.push(tagPartGeometry(horn, titaniumTrim, 0));

    const arm = new THREE.BoxGeometry(0.13, 0.26, 0.13);
    arm.rotateX(-0.92);
    arm.rotateZ(-sideSign * 0.22);
    arm.translate(sideSign * 0.25, 0.56, 0.16);
    parts.push(tagPartGeometry(arm, obsidianViolet, 4));
  }

  const cannonBody = new THREE.BoxGeometry(0.17, 0.14, 0.52);
  cannonBody.translate(0, 0.50, 0.34);
  parts.push(tagPartGeometry(cannonBody, gunmetal, 4));

  for (const bx of [-0.042, 0.042]) {
    const barrel = new THREE.CylinderGeometry(0.026, 0.026, 0.28, 6);
    barrel.rotateX(Math.PI / 2);
    barrel.translate(bx, 0.51, 0.65);
    parts.push(tagPartGeometry(barrel, reactorAmber, 4));
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
 * Sleek Elongated Tapered Tracer Streak:
 * Neutral white-to-silver brightness ramp so per-instance weapon colors tint purely into
 * electric emerald-teal / cyan (Pistol/SMG/Plasma) or volt-amber / magma-orange (Rifle/Minigun)!
 */
export function createTracerBoltGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const outerWake = new THREE.ConeGeometry(0.136, 1.66, 6);
  outerWake.rotateX(Math.PI / 2);
  outerWake.translate(0, 0, 0.31);
  parts.push(tagPartGeometry(outerWake, 0xf2f6fa, 0));

  const coreTail = new THREE.ConeGeometry(0.062, 1.22, 6);
  coreTail.rotateX(Math.PI / 2);
  coreTail.translate(0, 0, 0.16);
  const coreTailTagged = tagPartGeometry(coreTail, 0xffffff, 0);

  const head = new THREE.OctahedronGeometry(0.082, 0);
  head.scale(0.82, 0.82, 1.85);
  head.translate(0, 0, -0.44);
  const headTagged = tagPartGeometry(head, 0xffffff, 0);

  for (const hotGeo of [coreTailTagged, headTagged]) {
    const colAttr = hotGeo.getAttribute('color') as THREE.BufferAttribute;
    const arr = colAttr.array as Float32Array;
    for (let k = 0; k < arr.length; k++) {
      arr[k] = 2.25;
    }
    parts.push(hotGeo);
  }

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  merged.deleteAttribute('aPartId');
  return merged;
}

/**
 * Faceted Octagonal Gold Tech Credit Bullion with glowing teal/gold core chevron!
 */
export function createGoldCoinPickupGroup(): THREE.Group {
  const group = new THREE.Group();

  const goldFaceMat = new THREE.MeshStandardMaterial({
    color: 0xffc928,
    emissive: 0x7a4e00,
    roughness: 0.24,
    metalness: 0.42,
  });
  const tealCoreMat = new THREE.MeshBasicMaterial({
    color: 0x28f8dc,
  });
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x0d121a,
    side: THREE.BackSide,
  });

  const octGeo = new THREE.CylinderGeometry(0.60, 0.60, 0.22, 8);
  octGeo.rotateX(Math.PI / 2);
  group.add(new THREE.Mesh(octGeo, goldFaceMat));

  const outlineGeo = new THREE.CylinderGeometry(0.66, 0.66, 0.28, 8);
  outlineGeo.rotateX(Math.PI / 2);
  group.add(new THREE.Mesh(outlineGeo, outlineMat));

  const innerHex = new THREE.CylinderGeometry(0.36, 0.36, 0.26, 6);
  innerHex.rotateX(Math.PI / 2);
  group.add(new THREE.Mesh(innerHex, tealCoreMat));

  return group;
}

/**
 * Faceted Vanguard Stealth-Helm +1 Recruit Token atop Reinforcement Ordnance Pods!
 */
export function createRecruitPickupGroup(): THREE.Group {
  const group = new THREE.Group();

  const helmMat = new THREE.MeshStandardMaterial({
    color: 0x244266,
    emissive: 0x0b223d,
    roughness: 0.28,
    metalness: 0.36,
  });
  const crestMat = new THREE.MeshStandardMaterial({
    color: 0x7ea2c7,
    roughness: 0.28,
    metalness: 0.42,
  });
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x28f8dc });
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x090e16,
    side: THREE.BackSide,
  });

  const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.46, 0.44, 6), helmMat);
  shell.position.y = 0.08;
  group.add(shell);

  const shellOutline = new THREE.Mesh(
    new THREE.CylinderGeometry(0.41, 0.51, 0.50, 6),
    outlineMat
  );
  shellOutline.position.y = 0.08;
  group.add(shellOutline);

  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.52), crestMat);
  crest.position.set(0, 0.34, 0);
  group.add(crest);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.14, 0.22), visorMat);
  visor.position.set(0, 0.08, 0.32);
  group.add(visor);

  return group;
}

export function createPadlockMesh(): THREE.Group {
  const group = new THREE.Group();

  const casingMat = new THREE.MeshStandardMaterial({
    color: 0xffa428,
    metalness: 0.45,
    roughness: 0.28,
  });
  const gunmetalMat = new THREE.MeshStandardMaterial({
    color: 0x283649,
    metalness: 0.48,
    roughness: 0.32,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xd6e8f8,
    metalness: 0.50,
    roughness: 0.2,
  });
  const ledMat = new THREE.MeshBasicMaterial({
    color: 0xff2858,
  });

  const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.54, 0.26), gunmetalMat);
  const facePlate = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.42, 0.28), casingMat);
  group.add(bumper, facePlate);

  const shackle = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.062, 8, 12, Math.PI),
    chromeMat
  );
  shackle.position.set(0, 0.26, 0);
  group.add(shackle);

  const led = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), ledMat);
  led.position.set(0, 0.11, 0.16);
  group.add(led);

  return group;
}
