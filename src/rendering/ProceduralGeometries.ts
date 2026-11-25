import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { SkinThemeId, WeaponTierId } from '../core/types';
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

export function createWeaponPickupGroup(
  tier: WeaponTierId,
  skinTheme: SkinThemeId = 'TACTICAL'
): THREE.Group {
  return createShowcaseWeaponGroup(tier, skinTheme).root;
}

/**
 * Pink Magical Squad Girl (Unicorn Skin Player Squad, facing -Z):
 * - Vibrant Bubblegum & Hot-Pink outfit (`0xff3d9a` bodice + `0xff8fd4` puff sleeves + pearl-white collar)
 * - Flared pleated Rose-Pink battle skirt (`partId = 3` gentle march sway!) with golden starlight hem
 * - Pearl-white & pink knee-high boots (`partId = 1, 2`)
 * - Bubblegum-Pink Helmet with cute unicorn ears, golden tiara crest, pastel sparkle visor,
 *   and twin sunny-blonde ponytails tied with hot-pink bows!
 */
export function createPinkGirlSoldierGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const hotPinkOutfit = 0xff3399;
  const sakuraPink = 0xff8ad4;
  const deepRose = 0xd91670;
  const pearlWhite = 0xfff5fb;
  const blushTights = 0xffcbe6;
  const tiaraGold = 0xffcf38;
  const blondeHair = 0xffd25a;
  const sparkleVisor = 0x72f8e8;
  const warmSkin = 0xffd4b8;

  // --- LEGS & PEARL-PINK KNEE BOOTS (partId 1 = Left, partId 2 = Right) ---
  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.102;

    const thigh = new THREE.CylinderGeometry(0.052, 0.048, 0.17, 7);
    thigh.translate(lx, 0.295, -0.008);
    parts.push(tagPartGeometry(thigh, blushTights, partId));

    const bootShaft = new THREE.CylinderGeometry(0.056, 0.048, 0.165, 7);
    bootShaft.translate(lx * 1.02, 0.14, 0.002);
    parts.push(tagPartGeometry(bootShaft, pearlWhite, partId));

    const bootCuff = new THREE.CylinderGeometry(0.062, 0.058, 0.042, 7);
    bootCuff.translate(lx * 1.02, 0.215, 0.002);
    parts.push(tagPartGeometry(bootCuff, hotPinkOutfit, partId));

    const bootFoot = new THREE.BoxGeometry(0.104, 0.072, 0.168);
    bootFoot.translate(lx * 1.02, 0.04, -0.024);
    parts.push(tagPartGeometry(bootFoot, deepRose, partId));
  }

  // --- FLARED PLEATED PINK BATTLE SKIRT + BACK WAIST BOW (partId 3 for march sway!) ---
  const skirt = new THREE.CylinderGeometry(0.125, 0.238, 0.175, 8);
  skirt.scale(1.08, 1.0, 0.96);
  skirt.translate(0, 0.405, 0.005);
  parts.push(tagPartGeometry(skirt, hotPinkOutfit, 3));

  const skirtHem = new THREE.CylinderGeometry(0.228, 0.246, 0.032, 8);
  skirtHem.scale(1.08, 1.0, 0.96);
  skirtHem.translate(0, 0.328, 0.005);
  parts.push(tagPartGeometry(skirtHem, pearlWhite, 3));

  for (const sideSign of [-1, 1]) {
    const waistBowLoop = new THREE.BoxGeometry(0.095, 0.068, 0.042);
    waistBowLoop.rotateZ(sideSign * 0.28);
    waistBowLoop.translate(sideSign * 0.058, 0.465, 0.135);
    parts.push(tagPartGeometry(waistBowLoop, sakuraPink, 3));
  }

  // --- PINK OUTFIT BODICE, PEARL COLLAR & PUFF SLEEVES (partId 0) ---
  const waistBelt = new THREE.CylinderGeometry(0.132, 0.138, 0.052, 8);
  waistBelt.translate(0, 0.478, 0);
  parts.push(tagPartGeometry(waistBelt, tiaraGold, 0));

  const bodice = new THREE.CylinderGeometry(0.162, 0.128, 0.24, 8);
  bodice.scale(1.08, 1.0, 0.88);
  bodice.translate(0, 0.595, 0);
  parts.push(tagPartGeometry(bodice, hotPinkOutfit, 0));

  const sailorCollar = new THREE.BoxGeometry(0.28, 0.055, 0.20);
  sailorCollar.translate(0, 0.695, 0.005);
  parts.push(tagPartGeometry(sailorCollar, pearlWhite, 0));

  const frontHeartBrooch = new THREE.OctahedronGeometry(0.052, 0);
  frontHeartBrooch.translate(0, 0.615, -0.118);
  parts.push(tagPartGeometry(frontHeartBrooch, tiaraGold, 0));

  for (const sideSign of [-1, 1]) {
    const puffShoulder = new THREE.DodecahedronGeometry(0.088, 0);
    puffShoulder.translate(sideSign * 0.188, 0.675, -0.005);
    parts.push(tagPartGeometry(puffShoulder, sakuraPink, 0));
  }

  // --- GIRL HEAD, BUBBLEGUM-PINK HELMET, CUTE EARS & TWIN PONYTAILS (partId 0) ---
  const neck = new THREE.CylinderGeometry(0.068, 0.078, 0.075, 7);
  neck.translate(0, 0.742, -0.005);
  parts.push(tagPartGeometry(neck, warmSkin, 0));

  const faceChin = new THREE.CylinderGeometry(0.115, 0.098, 0.13, 8);
  faceChin.translate(0, 0.825, -0.02);
  parts.push(tagPartGeometry(faceChin, warmSkin, 0));

  const pinkHelm = new THREE.CylinderGeometry(0.145, 0.176, 0.19, 8);
  pinkHelm.scale(1.04, 1.0, 1.08);
  pinkHelm.translate(0, 0.885, 0.0);
  parts.push(tagPartGeometry(pinkHelm, hotPinkOutfit, 0));

  const helmCrown = new THREE.CylinderGeometry(0.086, 0.145, 0.072, 8);
  helmCrown.scale(1.04, 1.0, 1.08);
  helmCrown.translate(0, 1.005, 0.0);
  parts.push(tagPartGeometry(helmCrown, sakuraPink, 0));

  const helmPearlBand = new THREE.BoxGeometry(0.28, 0.036, 0.25);
  helmPearlBand.translate(0, 0.935, -0.01);
  parts.push(tagPartGeometry(helmPearlBand, pearlWhite, 0));

  const visor = new THREE.BoxGeometry(0.245, 0.064, 0.105);
  visor.translate(0, 0.868, -0.132);
  parts.push(tagPartGeometry(visor, sparkleVisor, 0));

  const tiaraGem = new THREE.ConeGeometry(0.048, 0.085, 5);
  tiaraGem.translate(0, 1.045, -0.09);
  parts.push(tagPartGeometry(tiaraGem, tiaraGold, 0));

  // Cute Pink Helmet Ears + Twin Flowing Ponytails with Hot-Pink Hair Bows!
  for (const sideSign of [-1, 1]) {
    const helmEar = new THREE.ConeGeometry(0.052, 0.125, 4);
    helmEar.rotateZ(-sideSign * 0.24);
    helmEar.translate(sideSign * 0.125, 1.065, -0.01);
    parts.push(tagPartGeometry(helmEar, pearlWhite, 0));

    const hairBow = new THREE.BoxGeometry(0.078, 0.068, 0.052);
    hairBow.rotateZ(sideSign * 0.35);
    hairBow.translate(sideSign * 0.148, 0.845, 0.135);
    parts.push(tagPartGeometry(hairBow, deepRose, 0));

    const ponytailUpper = new THREE.ConeGeometry(0.064, 0.22, 6);
    ponytailUpper.rotateX(-0.72);
    ponytailUpper.rotateZ(-sideSign * 0.34);
    ponytailUpper.translate(sideSign * 0.185, 0.775, 0.205);
    parts.push(tagPartGeometry(ponytailUpper, blondeHair, 0));
  }

  // --- TWO-HANDED WAND/HORN ARMS IN PINK SLEEVES & PEARL GLOVES (partId 4) ---
  const rUpperArm = new THREE.BoxGeometry(0.086, 0.17, 0.086);
  rUpperArm.rotateZ(0.32);
  rUpperArm.rotateX(0.48);
  rUpperArm.translate(0.21, 0.61, -0.05);
  parts.push(tagPartGeometry(rUpperArm, hotPinkOutfit, 4));

  const rForearm = new THREE.BoxGeometry(0.080, 0.18, 0.080);
  rForearm.rotateX(1.28);
  rForearm.rotateY(-0.08);
  rForearm.translate(0.255, 0.555, -0.165);
  parts.push(tagPartGeometry(rForearm, sakuraPink, 4));

  const rGlove = new THREE.BoxGeometry(0.088, 0.085, 0.088);
  rGlove.translate(0.255, 0.55, -0.245);
  parts.push(tagPartGeometry(rGlove, pearlWhite, 4));

  const lUpperArm = new THREE.BoxGeometry(0.084, 0.18, 0.084);
  lUpperArm.rotateX(0.82);
  lUpperArm.rotateZ(-0.55);
  lUpperArm.translate(-0.14, 0.60, -0.095);
  parts.push(tagPartGeometry(lUpperArm, hotPinkOutfit, 4));

  const lForearm = new THREE.BoxGeometry(0.078, 0.225, 0.078);
  lForearm.rotateX(1.38);
  lForearm.rotateZ(-0.95);
  lForearm.translate(0.075, 0.56, -0.285);
  parts.push(tagPartGeometry(lForearm, sakuraPink, 4));

  const lGlove = new THREE.BoxGeometry(0.086, 0.084, 0.086);
  lGlove.translate(0.235, 0.56, -0.405);
  parts.push(tagPartGeometry(lGlove, pearlWhite, 4));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  attachWeldedOutlineNormals(merged, 'aPartId');
  return merged;
}

/**
 * Rival Boy Trooper in Blue & Green Outfit (Unicorn Skin Standard Enemy, facing +Z):
 * - Royal-Blue & Emerald-Green sporty varsity jacket/jersey, cargo shorts & sneakers
 *   (shader alternates Blue-dominant vs Green-dominant outfits across instances so both colors fill every wave!)
 * - Stylized boy face + sporty blue/green cap/helmet with forward brim & yellow goggles!
 */
export function createBoyEnemySoldierGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const royalBlue = 0x1a6dff;
  const navyShorts = 0x1244b8;
  const kellyGreen = 0x1ad66c;
  const sneakerWhite = 0xf0f7ff;
  const boySkin = 0xffcba6;
  const boyHair = 0x4a2f1d;
  const goggleGold = 0xffe047;
  const blasterOrange = 0xff8c1a;

  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.102;

    const shortLeg = new THREE.BoxGeometry(0.116, 0.145, 0.124);
    shortLeg.translate(lx, 0.315, 0);
    parts.push(tagPartGeometry(shortLeg, navyShorts, partId));

    const calf = new THREE.CylinderGeometry(0.048, 0.042, 0.155, 6);
    calf.translate(lx, 0.155, 0.004);
    parts.push(tagPartGeometry(calf, boySkin, partId));

    const sneaker = new THREE.BoxGeometry(0.108, 0.075, 0.172);
    sneaker.translate(lx, 0.042, 0.032);
    parts.push(tagPartGeometry(sneaker, sneakerWhite, partId));

    const sole = new THREE.BoxGeometry(0.112, 0.026, 0.176);
    sole.translate(lx, 0.015, 0.032);
    parts.push(tagPartGeometry(sole, kellyGreen, partId));
  }

  const shortsHip = new THREE.CylinderGeometry(0.146, 0.136, 0.11, 7);
  shortsHip.scale(1.12, 1, 0.88);
  shortsHip.translate(0, 0.40, 0);
  parts.push(tagPartGeometry(shortsHip, navyShorts, 0));

  // Sporty Blue & Green Varsity Hoodie/Jersey
  const jerseyBody = new THREE.CylinderGeometry(0.178, 0.142, 0.32, 7);
  jerseyBody.scale(1.14, 1, 0.88);
  jerseyBody.translate(0, 0.565, 0);
  parts.push(tagPartGeometry(jerseyBody, royalBlue, 0));

  const greenChestVest = new THREE.BoxGeometry(0.30, 0.15, 0.185);
  greenChestVest.translate(0, 0.60, 0.015);
  parts.push(tagPartGeometry(greenChestVest, kellyGreen, 0));

  const collarStripe = new THREE.BoxGeometry(0.22, 0.042, 0.19);
  collarStripe.translate(0, 0.70, 0.01);
  parts.push(tagPartGeometry(collarStripe, sneakerWhite, 0));

  for (const sideSign of [-1, 1]) {
    const sleeveCap = new THREE.BoxGeometry(0.11, 0.11, 0.13);
    sleeveCap.rotateZ(-sideSign * 0.2);
    sleeveCap.translate(sideSign * 0.195, 0.665, 0.01);
    parts.push(tagPartGeometry(sleeveCap, kellyGreen, 0));
  }

  // Boy Head + Sporty Blue/Green Cap-Helmet + Brim + Goggles
  const boyHead = new THREE.CylinderGeometry(0.122, 0.112, 0.175, 8);
  boyHead.translate(0, 0.835, 0.015);
  parts.push(tagPartGeometry(boyHead, boySkin, 0));

  const sideburns = new THREE.BoxGeometry(0.24, 0.08, 0.14);
  sideburns.translate(0, 0.855, -0.02);
  parts.push(tagPartGeometry(sideburns, boyHair, 0));

  for (const sideSign of [-1, 1]) {
    const eye = new THREE.BoxGeometry(0.036, 0.038, 0.03);
    eye.translate(sideSign * 0.046, 0.835, 0.125);
    parts.push(tagPartGeometry(eye, 0x101c30, 0));
  }

  const capHelmet = new THREE.CylinderGeometry(0.132, 0.154, 0.135, 8);
  capHelmet.scale(1.04, 1.0, 1.08);
  capHelmet.translate(0, 0.935, 0.008);
  parts.push(tagPartGeometry(capHelmet, royalBlue, 0));

  const capBrim = new THREE.BoxGeometry(0.24, 0.034, 0.16);
  capBrim.rotateX(0.12);
  capBrim.translate(0, 0.892, 0.145);
  parts.push(tagPartGeometry(capBrim, kellyGreen, 0));

  const sportGoggles = new THREE.BoxGeometry(0.23, 0.052, 0.06);
  sportGoggles.translate(0, 0.945, 0.135);
  parts.push(tagPartGeometry(sportGoggles, goggleGold, 0));

  // Boy Arms + Bright Blue/Green Foam/Water Blaster (partId 4)
  const rArm = new THREE.BoxGeometry(0.088, 0.23, 0.088);
  rArm.rotateX(-0.95);
  rArm.translate(0.18, 0.56, 0.13);
  parts.push(tagPartGeometry(rArm, royalBlue, 4));

  const lArm = new THREE.BoxGeometry(0.084, 0.23, 0.084);
  lArm.rotateX(-1.05);
  lArm.rotateZ(0.38);
  lArm.translate(-0.135, 0.56, 0.16);
  parts.push(tagPartGeometry(lArm, royalBlue, 4));

  const waterBlaster = new THREE.BoxGeometry(0.075, 0.10, 0.36);
  waterBlaster.translate(0.10, 0.55, 0.29);
  parts.push(tagPartGeometry(waterBlaster, kellyGreen, 4));

  const blasterTip = new THREE.CylinderGeometry(0.034, 0.034, 0.10, 7);
  blasterTip.rotateX(Math.PI / 2);
  blasterTip.translate(0.10, 0.555, 0.50);
  parts.push(tagPartGeometry(blasterTip, blasterOrange, 4));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  attachWeldedOutlineNormals(merged, 'aPartId');
  return merged;
}

/**
 * Heavy Varsity Boy Captain in Emerald-Green & Royal-Blue Sports Armor (Unicorn Skin Heavy Enemy, facing +Z):
 */
export function createHeavyBoyEnemyGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const emeraldPad = 0x16cc64;
  const cobaltBlue = 0x1966f0;
  const darkNavy = 0x10348c;
  const whiteTrim = 0xf2f8ff;
  const boySkin = 0xffcba6;
  const sportGold = 0xffcf38;
  const blasterOrange = 0xff851b;

  for (const [sideSign, partId] of [
    [-1, 1],
    [1, 2],
  ] as const) {
    const lx = sideSign * 0.136;

    const thigh = new THREE.BoxGeometry(0.15, 0.185, 0.16);
    thigh.translate(lx, 0.31, 0);
    parts.push(tagPartGeometry(thigh, darkNavy, partId));

    const shinGuard = new THREE.CylinderGeometry(0.082, 0.072, 0.18, 7);
    shinGuard.translate(lx, 0.135, 0.008);
    parts.push(tagPartGeometry(shinGuard, emeraldPad, partId));

    const sneaker = new THREE.BoxGeometry(0.148, 0.086, 0.205);
    sneaker.translate(lx, 0.044, 0.04);
    parts.push(tagPartGeometry(sneaker, whiteTrim, partId));
  }

  const pelvis = new THREE.CylinderGeometry(0.20, 0.18, 0.13, 7);
  pelvis.scale(1.16, 1, 0.88);
  pelvis.translate(0, 0.41, 0);
  parts.push(tagPartGeometry(pelvis, cobaltBlue, 0));

  const jerseyTorso = new THREE.CylinderGeometry(0.255, 0.19, 0.37, 7);
  jerseyTorso.scale(1.22, 1, 0.92);
  jerseyTorso.translate(0, 0.59, 0);
  parts.push(tagPartGeometry(jerseyTorso, cobaltBlue, 0));

  const varsityChestPad = new THREE.BoxGeometry(0.41, 0.26, 0.22);
  varsityChestPad.translate(0, 0.605, 0.045);
  parts.push(tagPartGeometry(varsityChestPad, emeraldPad, 0));

  const chestStarBadge = new THREE.CylinderGeometry(0.072, 0.072, 0.048, 6);
  chestStarBadge.rotateX(Math.PI / 2);
  chestStarBadge.translate(0, 0.615, 0.162);
  parts.push(tagPartGeometry(chestStarBadge, sportGold, 0));

  for (const sideSign of [-1, 1]) {
    const shoulderPad = new THREE.BoxGeometry(0.21, 0.15, 0.23);
    shoulderPad.rotateZ(-sideSign * 0.18);
    shoulderPad.translate(sideSign * 0.305, 0.705, 0.02);
    parts.push(tagPartGeometry(shoulderPad, emeraldPad, 0));

    const stripe = new THREE.BoxGeometry(0.215, 0.04, 0.235);
    stripe.rotateZ(-sideSign * 0.18);
    stripe.translate(sideSign * 0.31, 0.775, 0.02);
    parts.push(tagPartGeometry(stripe, whiteTrim, 0));

    const arm = new THREE.BoxGeometry(0.125, 0.25, 0.125);
    arm.rotateX(-0.92);
    arm.rotateZ(-sideSign * 0.22);
    arm.translate(sideSign * 0.245, 0.56, 0.16);
    parts.push(tagPartGeometry(arm, cobaltBlue, 4));
  }

  const head = new THREE.CylinderGeometry(0.145, 0.135, 0.19, 8);
  head.translate(0, 0.865, 0.03);
  parts.push(tagPartGeometry(head, boySkin, 0));

  const skateHelm = new THREE.CylinderGeometry(0.168, 0.196, 0.18, 8);
  skateHelm.scale(1.06, 1.0, 1.10);
  skateHelm.translate(0, 0.945, 0.025);
  parts.push(tagPartGeometry(skateHelm, emeraldPad, 0));

  const helmStripe = new THREE.BoxGeometry(0.10, 0.06, 0.38);
  helmStripe.translate(0, 1.03, 0.03);
  parts.push(tagPartGeometry(helmStripe, cobaltBlue, 0));

  const helmBrim = new THREE.BoxGeometry(0.28, 0.04, 0.17);
  helmBrim.translate(0, 0.915, 0.175);
  parts.push(tagPartGeometry(helmBrim, cobaltBlue, 0));

  const goggles = new THREE.BoxGeometry(0.26, 0.058, 0.06);
  goggles.translate(0, 0.87, 0.175);
  parts.push(tagPartGeometry(goggles, sportGold, 0));

  // Twin-Tank Blue & Green Mega Soaker Cannon
  const soakerBody = new THREE.BoxGeometry(0.18, 0.14, 0.46);
  soakerBody.translate(0, 0.50, 0.33);
  parts.push(tagPartGeometry(soakerBody, cobaltBlue, 4));

  const waterTank = new THREE.CylinderGeometry(0.085, 0.085, 0.28, 8);
  waterTank.rotateX(Math.PI / 2);
  waterTank.translate(0, 0.61, 0.32);
  parts.push(tagPartGeometry(waterTank, emeraldPad, 4));

  for (const bx of [-0.045, 0.045]) {
    const nozzle = new THREE.CylinderGeometry(0.032, 0.032, 0.22, 7);
    nozzle.rotateX(Math.PI / 2);
    nozzle.translate(bx, 0.51, 0.62);
    parts.push(tagPartGeometry(nozzle, blasterOrange, 4));
  }

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  attachWeldedOutlineNormals(merged, 'aPartId');
  return merged;
}

/**
 * Attaches a smooth front-to-tail `aAlpha` attribute to projectile geometries so tips blaze bright
 * at 100% opacity while tails taper smoothly to transparent (`0.0`) in single-pass WebGL!
 */
function attachProjectileAlphaFade(
  geo: THREE.BufferGeometry,
  noseZ: number,
  tailZ: number
): void {
  const posAttr = geo.attributes.position as THREE.BufferAttribute;
  const alphas = new Float32Array(posAttr.count);
  const span = Math.max(0.01, tailZ - noseZ);
  for (let i = 0; i < posAttr.count; i++) {
    const z = posAttr.getZ(i);
    // t = 0 at leading nose (-Z), t = 1 at trailing tail (+Z)
    const t = Math.max(0, Math.min(1, (z - noseZ) / span));
    // Smooth concave ramp: bright solid tip/mid-body, feathering cleanly to transparent tail!
    alphas[i] = Math.pow(1 - t, 1.55);
  }
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
}

const ROYGBIV_STRIPE_RGB: readonly [number, number, number][] = [
  [1.00, 0.16, 0.30], // Red
  [1.00, 0.56, 0.10], // Orange
  [1.00, 0.92, 0.14], // Yellow
  [0.14, 0.94, 0.42], // Green
  [0.16, 0.64, 1.00], // Blue
  [0.78, 0.26, 1.00], // Violet
];

/**
 * Girls vs. Boys Unicorn Lv1 Projectile:
 * Slender glowing ROYGBIV rainbow streak with a bright pure-white tip tapering smoothly to a transparent tail!
 */
export function createMagicStarBoltGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const zSegs = 5;
  const totalLen = 1.48;
  const noseZ = -totalLen * 0.5;
  const tailZ = totalLen * 0.5;
  const segLen = totalLen / zSegs;
  const baseBandW = 0.044;
  const totalW = ROYGBIV_STRIPE_RGB.length * baseBandW;

  for (let b = 0; b < ROYGBIV_STRIPE_RGB.length; b++) {
    const [cr, cg, cb] = ROYGBIV_STRIPE_RGB[b];
    const xBase = -totalW * 0.5 + (b + 0.5) * baseBandW;

    for (let s = 0; s < zSegs; s++) {
      // s = 0 at leading nose (-Z), s = zSegs-1 at trailing tail (+Z)
      const tMid = (s + 0.5) / zSegs;
      const taper = 1.0 - tMid * 0.72;
      const zCenter = noseZ + tMid * totalLen;
      const segW = baseBandW * taper * 1.08;
      const segH = 0.056 * (1.0 - tMid * 0.55);

      const box = new THREE.BoxGeometry(segW, segH, segLen * 1.12);
      box.translate(xBase * taper, 0, zCenter);
      const tagged = tagPartGeometry(box, 0xffffff, 0);
      const colAttr = tagged.getAttribute('color') as THREE.BufferAttribute;
      const arr = colAttr.array as Float32Array;
      const whiteLead = tMid < 0.22 ? 0.55 : 0.0;
      for (let k = 0; k < arr.length; k += 3) {
        arr[k] = Math.min(1.45, cr * 1.15 + whiteLead);
        arr[k + 1] = Math.min(1.45, cg * 1.15 + whiteLead);
        arr[k + 2] = Math.min(1.45, cb * 1.15 + whiteLead);
      }
      parts.push(tagged);
    }
  }

  // Blazing pure-white leading spearhead tip
  const tip = new THREE.ConeGeometry(0.115, 0.34, 6);
  tip.rotateX(-Math.PI / 2);
  tip.scale(1.15, 0.65, 1.0);
  tip.translate(0, 0.005, noseZ - 0.08);
  const tipTagged = tagPartGeometry(tip, 0xffffff, 0);
  {
    const colAttr = tipTagged.getAttribute('color') as THREE.BufferAttribute;
    const arr = colAttr.array as Float32Array;
    for (let k = 0; k < arr.length; k++) {
      arr[k] = 1.85;
    }
  }
  parts.push(tipTagged);

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  merged.deleteAttribute('aPartId');
  attachProjectileAlphaFade(merged, noseZ - 0.25, tailZ);
  return merged;
}

/**
 * Girls vs. Boys Unicorn Lv2–Lv5 Projectile:
 * Wider, brighter ROYGBIV swept rainbow arrowhead with blazing pure-white diamond nose tapering to transparent tail!
 */
export function createUnicornArrowheadGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const zSegs = 5;
  const totalLen = 1.62;
  const noseZ = -totalLen * 0.5;
  const tailZ = totalLen * 0.5;
  const segLen = totalLen / zSegs;
  const baseBandW = 0.060;
  const totalW = ROYGBIV_STRIPE_RGB.length * baseBandW;

  for (let b = 0; b < ROYGBIV_STRIPE_RGB.length; b++) {
    const [cr, cg, cb] = ROYGBIV_STRIPE_RGB[b];
    const xBase = -totalW * 0.5 + (b + 0.5) * baseBandW;
    const distFromCenter = Math.abs(xBase) / Math.max(0.01, totalW * 0.5);
    // Swept chevron arrow stagger: outer stripes trail slightly behind center tip!
    const sweepLagZ = distFromCenter * 0.26;

    for (let s = 0; s < zSegs; s++) {
      const tMid = (s + 0.5) / zSegs;
      const taper = 1.04 - tMid * 0.66;
      const zCenter = noseZ + sweepLagZ + tMid * (totalLen - sweepLagZ);
      const segW = baseBandW * taper * 1.08;
      const segH = 0.068 * (1.0 - tMid * 0.52);

      const box = new THREE.BoxGeometry(segW, segH, segLen * 1.14);
      box.translate(xBase * (1.0 + (1 - tMid) * 0.14) * taper, 0.01, zCenter);
      const tagged = tagPartGeometry(box, 0xffffff, 0);
      const colAttr = tagged.getAttribute('color') as THREE.BufferAttribute;
      const arr = colAttr.array as Float32Array;
      const boost = s === 0 ? 0.22 : 0.0;
      for (let k = 0; k < arr.length; k += 3) {
        arr[k] = Math.min(1.45, cr * 1.14 + boost);
        arr[k + 1] = Math.min(1.45, cg * 1.14 + boost);
        arr[k + 2] = Math.min(1.45, cb * 1.14 + boost);
      }
      parts.push(tagged);
    }
  }

  // Wide bright white-prismatic arrowhead chevron nose
  const arrowNose = new THREE.ConeGeometry(0.24, 0.52, 4);
  arrowNose.rotateY(Math.PI / 4);
  arrowNose.rotateX(-Math.PI / 2);
  arrowNose.scale(1.18, 0.45, 1.0);
  arrowNose.translate(0, 0.015, noseZ - 0.10);
  const noseTagged = tagPartGeometry(arrowNose, 0xffffff, 0);
  {
    const colAttr = noseTagged.getAttribute('color') as THREE.BufferAttribute;
    const arr = colAttr.array as Float32Array;
    for (let k = 0; k < arr.length; k++) {
      arr[k] = 2.05;
    }
  }
  parts.push(noseTagged);

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  merged.deleteAttribute('aPartId');
  attachProjectileAlphaFade(merged, noseZ - 0.36, tailZ);
  return merged;
}

/**
 * Tactical Skin Lv1 Projectile:
 * Slender glowing peach/salmon-orange streak with bright pure-white leading tip tapering to transparent tail!
 */
export function createTracerBoltGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const noseZ = -0.74;
  const tailZ = 0.78;

  // Slender peach/salmon-orange outer wake tapering to tail
  const outerWake = new THREE.ConeGeometry(0.115, 1.48, 6);
  outerWake.rotateX(Math.PI / 2);
  outerWake.scale(1.0, 0.72, 1.0);
  outerWake.translate(0, 0, 0.04);
  const outerTagged = tagPartGeometry(outerWake, 0xff8562, 0);
  {
    const colAttr = outerTagged.getAttribute('color') as THREE.BufferAttribute;
    const arr = colAttr.array as Float32Array;
    for (let k = 0; k < arr.length; k += 3) {
      arr[k] = 1.28;
      arr[k + 1] = 0.64;
      arr[k + 2] = 0.44;
    }
  }
  parts.push(outerTagged);

  // Hot luminous core streak
  const coreTail = new THREE.ConeGeometry(0.056, 1.06, 6);
  coreTail.rotateX(Math.PI / 2);
  coreTail.translate(0, 0, -0.14);
  const coreTagged = tagPartGeometry(coreTail, 0xffd2b8, 0);
  {
    const colAttr = coreTagged.getAttribute('color') as THREE.BufferAttribute;
    const arr = colAttr.array as Float32Array;
    for (let k = 0; k < arr.length; k += 3) {
      arr[k] = 1.65;
      arr[k + 1] = 1.24;
      arr[k + 2] = 1.02;
    }
  }
  parts.push(coreTagged);

  // Crisp pure-white leading tip
  const head = new THREE.ConeGeometry(0.088, 0.34, 6);
  head.rotateX(-Math.PI / 2);
  head.scale(1.05, 0.68, 1.0);
  head.translate(0, 0, noseZ - 0.04);
  const headTagged = tagPartGeometry(head, 0xffffff, 0);
  {
    const colAttr = headTagged.getAttribute('color') as THREE.BufferAttribute;
    const arr = colAttr.array as Float32Array;
    for (let k = 0; k < arr.length; k++) {
      arr[k] = 2.0;
    }
  }
  parts.push(headTagged);

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  merged.deleteAttribute('aPartId');
  attachProjectileAlphaFade(merged, noseZ - 0.22, tailZ);
  return merged;
}

/**
 * Tactical Skin Lv2–Lv5 Projectile:
 * Wider, brighter white-yellow swept arrowhead with blazing white nose tapering smoothly to transparent tail!
 */
export function createTacticalArrowheadGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const noseZ = -0.82;
  const tailZ = 0.82;

  // Wide glowing warm-gold swept arrowhead wings
  const wingCone = new THREE.ConeGeometry(0.28, 1.54, 4);
  wingCone.rotateY(Math.PI / 4);
  wingCone.rotateX(Math.PI / 2);
  wingCone.scale(1.18, 0.42, 1.0);
  wingCone.translate(0, 0, 0.04);
  const wingTagged = tagPartGeometry(wingCone, 0xffd84d, 0);
  {
    const colAttr = wingTagged.getAttribute('color') as THREE.BufferAttribute;
    const arr = colAttr.array as Float32Array;
    for (let k = 0; k < arr.length; k += 3) {
      arr[k] = 1.48;
      arr[k + 1] = 1.24;
      arr[k + 2] = 0.44;
    }
  }
  parts.push(wingTagged);

  // Blazing white-yellow inner chevron core
  const innerCore = new THREE.ConeGeometry(0.16, 1.18, 4);
  innerCore.rotateY(Math.PI / 4);
  innerCore.rotateX(Math.PI / 2);
  innerCore.scale(1.12, 0.48, 1.0);
  innerCore.translate(0, 0.005, -0.14);
  const coreTagged = tagPartGeometry(innerCore, 0xfff8c8, 0);
  {
    const colAttr = coreTagged.getAttribute('color') as THREE.BufferAttribute;
    const arr = colAttr.array as Float32Array;
    for (let k = 0; k < arr.length; k += 3) {
      arr[k] = 1.95;
      arr[k + 1] = 1.88;
      arr[k + 2] = 1.32;
    }
  }
  parts.push(coreTagged);

  // Pure-white spear tip
  const tip = new THREE.ConeGeometry(0.21, 0.46, 4);
  tip.rotateY(Math.PI / 4);
  tip.rotateX(-Math.PI / 2);
  tip.scale(1.15, 0.44, 1.0);
  tip.translate(0, 0.01, noseZ - 0.04);
  const tipTagged = tagPartGeometry(tip, 0xffffff, 0);
  {
    const colAttr = tipTagged.getAttribute('color') as THREE.BufferAttribute;
    const arr = colAttr.array as Float32Array;
    for (let k = 0; k < arr.length; k++) {
      arr[k] = 2.15;
    }
  }
  parts.push(tipTagged);

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  merged.deleteAttribute('aPartId');
  attachProjectileAlphaFade(merged, noseZ - 0.28, tailZ);
  return merged;
}

/**
 * Stylized 3D Popping Tire Debris Geometry (dark rubber torus tread + brushed titanium wheel hub)
 * launched in gravity arcs whenever a tire/barricade pedestal is destroyed!
 */
export function createPoppingTireGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const rubberTread = new THREE.TorusGeometry(0.36, 0.16, 7, 12);
  parts.push(tagPartGeometry(rubberTread, 0x1e2632, 0));

  const rim = new THREE.CylinderGeometry(0.22, 0.22, 0.18, 8);
  rim.rotateX(Math.PI / 2);
  parts.push(tagPartGeometry(rim, 0x8ea6c2, 0));

  const hubCap = new THREE.CylinderGeometry(0.09, 0.09, 0.22, 6);
  hubCap.rotateX(Math.PI / 2);
  parts.push(tagPartGeometry(hubCap, 0xffb830, 0));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  attachWeldedOutlineNormals(merged);
  merged.deleteAttribute('aPartId');
  return merged;
}

/**
 * Radiant Spinning 3D Gold Coin Geometry for magnetized coins arcing into the top-right HUD counter!
 */
export function createSpinningCoinGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const disc = new THREE.CylinderGeometry(0.32, 0.32, 0.10, 10);
  disc.rotateX(Math.PI / 2);
  parts.push(tagPartGeometry(disc, 0xffca28, 0));

  const rim = new THREE.TorusGeometry(0.30, 0.05, 6, 10);
  parts.push(tagPartGeometry(rim, 0xfff199, 0));

  const centerStar = new THREE.OctahedronGeometry(0.13, 0);
  centerStar.scale(1.0, 1.0, 0.55);
  parts.push(tagPartGeometry(centerStar, 0x28f8dc, 0));

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  attachWeldedOutlineNormals(merged);
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

/**
 * Pink Helmet + Cute Unicorn Ears & Tiara +1 Girl Recruit Token (Unicorn Skin)!
 */
export function createPinkGirlRecruitPickupGroup(): THREE.Group {
  const group = new THREE.Group();

  const pinkHelmMat = new THREE.MeshStandardMaterial({
    color: 0xff3399,
    emissive: 0x6b0b3b,
    roughness: 0.26,
    metalness: 0.22,
  });
  const pearlMat = new THREE.MeshStandardMaterial({
    color: 0xfff5fb,
    roughness: 0.24,
    metalness: 0.2,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffcf38,
    emissive: 0x5c3c00,
    roughness: 0.25,
    metalness: 0.48,
  });
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x72f8e8 });
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x1c0614,
    side: THREE.BackSide,
  });

  const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.46, 0.44, 8), pinkHelmMat);
  shell.position.y = 0.08;
  group.add(shell);

  const shellOutline = new THREE.Mesh(
    new THREE.CylinderGeometry(0.41, 0.51, 0.50, 8),
    outlineMat
  );
  shellOutline.position.y = 0.08;
  group.add(shellOutline);

  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 4), pearlMat);
    ear.rotation.z = -s * 0.22;
    ear.position.set(s * 0.26, 0.40, 0);
    group.add(ear);
  }

  const tiara = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.24, 5), goldMat);
  tiara.position.set(0, 0.42, 0.16);
  group.add(tiara);

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
