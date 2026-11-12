import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { WeaponTierId } from '../core/types';
import { WEAPON_SPECS } from '../math/weaponMath';

export interface ShowcaseWeaponRig {
  readonly tier: WeaponTierId;
  readonly root: THREE.Group;
  readonly spinCluster: THREE.Group | null;
}

function tagEquippedPart(
  geo: THREE.BufferGeometry,
  hexColor: number,
  spinBarrelFlag = 0
): THREE.BufferGeometry {
  const nonIndexed = geo.index ? geo.toNonIndexed() : geo.clone();
  const count = nonIndexed.attributes.position.count;
  const colors = new Float32Array(count * 3);
  const spinFlags = new Float32Array(count);
  const c = new THREE.Color(hexColor);

  for (let i = 0; i < count; i++) {
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    spinFlags[i] = spinBarrelFlag;
  }

  nonIndexed.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  nonIndexed.setAttribute('aSpinPart', new THREE.BufferAttribute(spinFlags, 1));
  nonIndexed.deleteAttribute('uv');
  return nonIndexed;
}

/**
 * Center axis of equipped weapon held in commando's right-forward hands (pointing toward -Z).
 */
export const EQUIPPED_GUN_PIVOT_X = 0.178;
export const EQUIPPED_GUN_PIVOT_Y = 0.575;

/**
 * Builds a single merged vertex-colored BufferGeometry per weapon tier aligned directly
 * to the commando's heroic right-hip/shoulder grip (+0.178 X, +0.575 Y, pointing -Z) so all 150 soldiers
 * render their live equipped weapon in 1 InstancedMesh draw call!
 */
export function createEquippedWeaponGeometry(tier: WeaponTierId): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const px = EQUIPPED_GUN_PIVOT_X;
  const py = EQUIPPED_GUN_PIVOT_Y;

  const darkMetal = 0x26303d;
  const steelLight = 0x869ab0;
  const polymerDark = 0x181e26;
  const brassGold = 0xf5b82e;

  if (tier === 1) {
    // Lv1: Tactical Two-Tone Sidearm Pistol (held forward)
    const frame = new THREE.BoxGeometry(0.056, 0.052, 0.24);
    frame.translate(px, py - 0.01, -0.31);
    parts.push(tagEquippedPart(frame, polymerDark));

    const slide = new THREE.BoxGeometry(0.062, 0.056, 0.26);
    slide.translate(px, py + 0.032, -0.32);
    parts.push(tagEquippedPart(slide, steelLight));

    const compensator = new THREE.BoxGeometry(0.058, 0.052, 0.065);
    compensator.translate(px, py + 0.028, -0.47);
    parts.push(tagEquippedPart(compensator, brassGold));

    const tacLight = new THREE.CylinderGeometry(0.018, 0.018, 0.085, 8);
    tacLight.rotateX(Math.PI / 2);
    tacLight.translate(px, py - 0.028, -0.40);
    parts.push(tagEquippedPart(tacLight, 0xffe680));

    const grip = new THREE.BoxGeometry(0.05, 0.12, 0.068);
    grip.rotateX(0.22);
    grip.translate(px, py - 0.065, -0.22);
    parts.push(tagEquippedPart(grip, darkMetal));

    const rearSight = new THREE.BoxGeometry(0.054, 0.022, 0.024);
    rearSight.translate(px, py + 0.068, -0.21);
    parts.push(tagEquippedPart(rearSight, 0xffd85a));
  } else if (tier === 2) {
    // Lv2: Tactical PDW / SMG with curved mag, vented shroud, holo sight & suppressor
    const receiver = new THREE.BoxGeometry(0.072, 0.095, 0.38);
    receiver.translate(px, py + 0.015, -0.34);
    parts.push(tagEquippedPart(receiver, darkMetal));

    const topRail = new THREE.BoxGeometry(0.052, 0.024, 0.34);
    topRail.translate(px, py + 0.072, -0.34);
    parts.push(tagEquippedPart(topRail, 0xffe66d));

    const holoSight = new THREE.BoxGeometry(0.064, 0.054, 0.085);
    holoSight.translate(px, py + 0.105, -0.31);
    parts.push(tagEquippedPart(holoSight, steelLight));

    const suppressor = new THREE.CylinderGeometry(0.028, 0.028, 0.20, 10);
    suppressor.rotateX(Math.PI / 2);
    suppressor.translate(px, py + 0.018, -0.61);
    parts.push(tagEquippedPart(suppressor, steelLight));

    const curvedMag = new THREE.BoxGeometry(0.044, 0.20, 0.062);
    curvedMag.rotateX(-0.26);
    curvedMag.translate(px, py - 0.11, -0.39);
    parts.push(tagEquippedPart(curvedMag, 0xf5b82e));

    const foregrip = new THREE.CylinderGeometry(0.018, 0.02, 0.10, 8);
    foregrip.translate(px, py - 0.075, -0.49);
    parts.push(tagEquippedPart(foregrip, polymerDark));
  } else if (tier === 3) {
    // Lv3: Heavy SCAR/M4 Tactical Assault Rifle with ACOG optic, STANAG mag & muzzle brake
    const upperRec = new THREE.BoxGeometry(0.078, 0.096, 0.48);
    upperRec.translate(px, py + 0.022, -0.38);
    parts.push(tagEquippedPart(upperRec, 0x3b4859));

    const handguard = new THREE.BoxGeometry(0.074, 0.082, 0.28);
    handguard.translate(px, py + 0.02, -0.68);
    parts.push(tagEquippedPart(handguard, 0xe08b2c));

    const barrel = new THREE.CylinderGeometry(0.02, 0.022, 0.24, 8);
    barrel.rotateX(Math.PI / 2);
    barrel.translate(px, py + 0.024, -0.89);
    parts.push(tagEquippedPart(barrel, steelLight));

    const muzzleBrake = new THREE.BoxGeometry(0.048, 0.044, 0.075);
    muzzleBrake.translate(px, py + 0.024, -1.01);
    parts.push(tagEquippedPart(muzzleBrake, 0xffae42));

    const acogScope = new THREE.CylinderGeometry(0.032, 0.028, 0.17, 10);
    acogScope.rotateX(Math.PI / 2);
    acogScope.translate(px, py + 0.105, -0.36);
    parts.push(tagEquippedPart(acogScope, darkMetal));

    const scopeLens = new THREE.CylinderGeometry(0.026, 0.026, 0.02, 10);
    scopeLens.rotateX(Math.PI / 2);
    scopeLens.translate(px, py + 0.105, -0.45);
    parts.push(tagEquippedPart(scopeLens, 0xffae42));

    const stanagMag = new THREE.BoxGeometry(0.048, 0.19, 0.082);
    stanagMag.rotateX(-0.22);
    stanagMag.translate(px, py - 0.105, -0.44);
    parts.push(tagEquippedPart(stanagMag, darkMetal));

    const buttstock = new THREE.BoxGeometry(0.068, 0.11, 0.19);
    buttstock.translate(px, py + 0.005, -0.11);
    parts.push(tagEquippedPart(buttstock, polymerDark));
  } else if (tier === 4) {
    // Lv4: 6-Barrel Rotary Minigun with underslung ammo drum & GPU-spinning barrel cluster!
    const motorHousing = new THREE.CylinderGeometry(0.095, 0.10, 0.30, 12);
    motorHousing.rotateX(Math.PI / 2);
    motorHousing.translate(px, py - 0.02, -0.32);
    parts.push(tagEquippedPart(motorHousing, darkMetal));

    const ammoDrum = new THREE.CylinderGeometry(0.115, 0.115, 0.18, 12);
    ammoDrum.rotateZ(Math.PI / 2);
    ammoDrum.translate(px + 0.03, py - 0.135, -0.34);
    parts.push(tagEquippedPart(ammoDrum, 0xe66c1f));

    const topCarryBar = new THREE.BoxGeometry(0.09, 0.032, 0.24);
    topCarryBar.translate(px, py + 0.10, -0.35);
    parts.push(tagEquippedPart(topCarryBar, 0xff9f43));

    // 6-Barrel cluster tagged with spinBarrelFlag = 1 around (px, py - 0.02)
    const clusterY = py - 0.02;
    for (let b = 0; b < 6; b++) {
      const ang = (b / 6) * Math.PI * 2;
      const bx = px + Math.cos(ang) * 0.056;
      const by = clusterY + Math.sin(ang) * 0.056;
      const barrel = new THREE.CylinderGeometry(0.015, 0.015, 0.56, 6);
      barrel.rotateX(Math.PI / 2);
      barrel.translate(bx, by, -0.73);
      parts.push(tagEquippedPart(barrel, steelLight, 1));
    }

    for (const ringZ of [-0.66, -0.94]) {
      const clamp = new THREE.CylinderGeometry(0.084, 0.084, 0.038, 12);
      clamp.rotateX(Math.PI / 2);
      clamp.translate(px, clusterY, ringZ);
      parts.push(tagEquippedPart(clamp, 0xff8c38, 1));
    }
  } else {
    // Lv5: Split-Rail Plasma Pulse Rifle with glowing cyan accelerator coils!
    const coreChassis = new THREE.BoxGeometry(0.092, 0.115, 0.48);
    coreChassis.translate(px, py + 0.01, -0.34);
    parts.push(tagEquippedPart(coreChassis, 0x1e2938));

    const upperRail = new THREE.BoxGeometry(0.068, 0.036, 0.54);
    upperRail.translate(px, py + 0.076, -0.76);
    parts.push(tagEquippedPart(upperRail, steelLight));

    const lowerRail = new THREE.BoxGeometry(0.068, 0.034, 0.50);
    lowerRail.translate(px, py - 0.034, -0.74);
    parts.push(tagEquippedPart(lowerRail, steelLight));

    // Glowing cyan plasma core channel between rails
    const plasmaChannel = new THREE.BoxGeometry(0.044, 0.048, 0.56);
    plasmaChannel.translate(px, py + 0.022, -0.75);
    parts.push(tagEquippedPart(plasmaChannel, 0x38f6ff));

    for (const coilZ of [-0.58, -0.74, -0.90]) {
      const coil = new THREE.BoxGeometry(0.104, 0.118, 0.034);
      coil.translate(px, py + 0.022, coilZ);
      parts.push(tagEquippedPart(coil, 0x70f8ff));
    }

    const energyCell = new THREE.CylinderGeometry(0.042, 0.042, 0.18, 10);
    energyCell.rotateX(-0.2);
    energyCell.translate(px, py - 0.10, -0.40);
    parts.push(tagEquippedPart(energyCell, 0x19d4e6));

    const holoShroud = new THREE.BoxGeometry(0.084, 0.062, 0.14);
    holoShroud.translate(px, py + 0.108, -0.35);
    parts.push(tagEquippedPart(holoShroud, 0x38f6ff));
  }

  const merged = mergeGeometries(parts, false);
  for (const p of parts) {
    p.dispose();
  }
  // Scale heroic arcade gun proportions (1.28x) around the barrel spin axis (px, py - 0.02, -0.28)
  const spinAxisY = py - 0.02;
  merged.translate(-px, -spinAxisY, 0.28);
  merged.scale(1.28, 1.28, 1.28);
  merged.translate(px, spinAxisY, -0.28);
  merged.computeVertexNormals();
  return merged;
}

/**
 * Builds high-detail multi-part 3D Showcase Weapon Rigs oriented horizontally (+X muzzle)
 * for both Tire Weapon Stack holo-pedestals and the 360-degree Armory Turntable!
 */
export function createShowcaseWeaponGroup(tier: WeaponTierId): ShowcaseWeaponRig {
  const root = new THREE.Group();
  let spinCluster: THREE.Group | null = null;
  const accentHex = WEAPON_SPECS[tier].colorHex;

  const gunmetalMat = new THREE.MeshStandardMaterial({
    color: 0x26313f,
    roughness: 0.34,
    metalness: 0.48,
  });
  const brushedSteelMat = new THREE.MeshStandardMaterial({
    color: 0x8fa3b8,
    roughness: 0.26,
    metalness: 0.5,
  });
  const polymerMat = new THREE.MeshStandardMaterial({
    color: 0x161b22,
    roughness: 0.68,
    metalness: 0.14,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    emissive: accentHex,
    emissiveIntensity: tier === 5 ? 0.65 : 0.28,
    roughness: 0.28,
    metalness: 0.36,
  });
  const glowMat = new THREE.MeshBasicMaterial({
    color: accentHex,
  });

  if (tier === 1) {
    // Lv1: Two-Tone Combat Sidearm Pistol
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.15, 0.12), brushedSteelMat);
    slide.position.set(0.04, 0.12, 0);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.10, 0.11), gunmetalMat);
    frame.position.set(0.01, 0.01, 0);
    const compensator = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.145, 0.115), accentMat);
    compensator.position.set(0.42, 0.115, 0);
    const barrelTip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.10, 12),
      gunmetalMat
    );
    barrelTip.rotation.z = Math.PI / 2;
    barrelTip.position.set(0.51, 0.12, 0);

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.105), polymerMat);
    grip.position.set(-0.18, -0.17, 0);
    grip.rotation.z = 0.24;

    const magBase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.115), accentMat);
    magBase.position.set(-0.23, -0.35, 0);
    magBase.rotation.z = 0.24;

    const triggerGuard = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.04), gunmetalMat);
    triggerGuard.position.set(-0.02, -0.08, 0);

    const tacLight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.20, 12),
      gunmetalMat
    );
    tacLight.rotation.z = Math.PI / 2;
    tacLight.position.set(0.22, -0.05, 0);
    const lightLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.036, 0.02, 12),
      glowMat
    );
    lightLens.rotation.z = Math.PI / 2;
    lightLens.position.set(0.325, -0.05, 0);

    const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.045, 0.04), glowMat);
    frontSight.position.set(0.34, 0.21, 0);
    const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.045, 0.09), accentMat);
    rearSight.position.set(-0.24, 0.21, 0);

    root.add(
      slide,
      frame,
      compensator,
      barrelTip,
      grip,
      magBase,
      triggerGuard,
      tacLight,
      lightLens,
      frontSight,
      rearSight
    );
  } else if (tier === 2) {
    // Lv2: Tactical SMG (Compact PDW + Suppressor + Curved Mag + Reflex Optic)
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.20, 0.13), gunmetalMat);
    upper.position.set(0.0, 0.08, 0);

    const accentStripe = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.045, 0.138), accentMat);
    accentStripe.position.set(0.01, 0.14, 0);

    const suppressor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.058, 0.058, 0.38, 14),
      brushedSteelMat
    );
    suppressor.rotation.z = Math.PI / 2;
    suppressor.position.set(0.51, 0.09, 0);

    const holoBase = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.11, 0.11), polymerMat);
    holoBase.position.set(-0.02, 0.23, 0);
    const holoWindow = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.09), glowMat);
    holoWindow.position.set(0.06, 0.24, 0);

    const pistolGrip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.30, 0.10), polymerMat);
    pistolGrip.position.set(-0.16, -0.14, 0);
    pistolGrip.rotation.z = 0.22;

    const curvedMag = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.44, 0.088), accentMat);
    curvedMag.position.set(0.14, -0.22, 0);
    curvedMag.rotation.z = -0.24;

    const foregrip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.04, 0.22, 10),
      polymerMat
    );
    foregrip.position.set(0.29, -0.12, 0);

    const wireStockBar = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.04, 0.09), brushedSteelMat);
    wireStockBar.position.set(-0.46, 0.09, 0);
    const buttPad = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.10), polymerMat);
    buttPad.position.set(-0.62, 0.04, 0);

    root.add(
      upper,
      accentStripe,
      suppressor,
      holoBase,
      holoWindow,
      pistolGrip,
      curvedMag,
      foregrip,
      wireStockBar,
      buttPad
    );
  } else if (tier === 3) {
    // Lv3: SCAR-H / Tactical Assault Rifle
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.22, 0.14), gunmetalMat);
    receiver.position.set(-0.04, 0.08, 0);

    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.17, 0.135), accentMat);
    handguard.position.set(0.48, 0.09, 0);

    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.04, 0.40, 12),
      brushedSteelMat
    );
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(0.86, 0.10, 0);

    const muzzleBrake = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.09, 0.09), gunmetalMat);
    muzzleBrake.position.set(1.06, 0.10, 0);

    const acog = new THREE.Mesh(
      new THREE.CylinderGeometry(0.062, 0.052, 0.32, 12),
      polymerMat
    );
    acog.rotation.z = Math.PI / 2;
    acog.position.set(-0.02, 0.26, 0);
    const acogLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12),
      glowMat
    );
    acogLens.rotation.z = Math.PI / 2;
    acogLens.position.set(0.145, 0.26, 0);

    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.40, 0.095), brushedSteelMat);
    mag.position.set(0.12, -0.20, 0);
    mag.rotation.z = -0.2;

    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.30, 0.10), polymerMat);
    grip.position.set(-0.20, -0.14, 0);
    grip.rotation.z = 0.24;

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.23, 0.12), polymerMat);
    stock.position.set(-0.60, 0.05, 0);
    const cheekRiser = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.126), accentMat);
    cheekRiser.position.set(-0.56, 0.17, 0);

    root.add(
      receiver,
      handguard,
      barrel,
      muzzleBrake,
      acog,
      acogLens,
      mag,
      grip,
      stock,
      cheekRiser
    );
  } else if (tier === 4) {
    // Lv4: 6-Barrel Rotary Vulcan Minigun with spinning barrel cluster!
    const housing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.20, 0.21, 0.52, 16),
      gunmetalMat
    );
    housing.rotation.z = Math.PI / 2;
    housing.position.set(-0.26, 0.02, 0);

    const ammoDrum = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.23, 0.34, 16),
      accentMat
    );
    ammoDrum.rotation.x = Math.PI / 2;
    ammoDrum.position.set(-0.22, -0.24, 0);

    const chainsawHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.055, 0.22),
      brushedSteelMat
    );
    chainsawHandle.position.set(-0.12, 0.28, 0);
    const handlePostL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.04), polymerMat);
    handlePostL.position.set(-0.12, 0.21, 0.09);
    const handlePostR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.04), polymerMat);
    handlePostR.position.set(-0.12, 0.21, -0.09);

    const rearGrip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, 0.12), polymerMat);
    rearGrip.position.set(-0.58, 0.06, 0);
    rearGrip.rotation.z = -0.25;

    spinCluster = new THREE.Group();
    spinCluster.position.set(0.0, 0.02, 0);

    const barrelGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.94, 8);
    barrelGeo.rotateZ(Math.PI / 2);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const bMesh = new THREE.Mesh(barrelGeo, brushedSteelMat);
      bMesh.position.set(0.47, Math.cos(a) * 0.115, Math.sin(a) * 0.115);
      spinCluster.add(bMesh);
    }

    for (const cx of [0.34, 0.78]) {
      const clamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.165, 0.165, 0.065, 16),
        accentMat
      );
      clamp.rotation.z = Math.PI / 2;
      clamp.position.set(cx, 0, 0);
      spinCluster.add(clamp);
    }

    root.add(
      housing,
      ammoDrum,
      chainsawHandle,
      handlePostL,
      handlePostR,
      rearGrip,
      spinCluster
    );
  } else {
    // Lv5: Split-Rail Magnetic Plasma Pulse Rifle
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.25, 0.17), gunmetalMat);
    body.position.set(-0.18, 0.05, 0);

    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.068, 0.13), brushedSteelMat);
    topRail.position.set(0.54, 0.15, 0);
    const botRail = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.062, 0.13), brushedSteelMat);
    botRail.position.set(0.51, -0.04, 0);

    const plasmaCore = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.075, 0.085), glowMat);
    plasmaCore.position.set(0.48, 0.055, 0);

    for (const rx of [0.22, 0.48, 0.74]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.026, 8, 18), accentMat);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(rx, 0.055, 0);
      root.add(ring);
    }

    const energyCell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.078, 0.078, 0.34, 14),
      accentMat
    );
    energyCell.position.set(-0.04, -0.20, 0);
    energyCell.rotation.z = -0.22;

    const holoOptic = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.11, 0.14), gunmetalMat);
    holoOptic.position.set(-0.12, 0.24, 0);
    const opticGlow = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.055, 0.15), glowMat);
    opticGlow.position.set(-0.12, 0.24, 0);

    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.14), polymerMat);
    stock.position.set(-0.68, 0.02, 0);

    root.add(
      body,
      topRail,
      botRail,
      plasmaCore,
      energyCell,
      holoOptic,
      opticGlow,
      stock
    );
  }

  return { tier, root, spinCluster };
}
