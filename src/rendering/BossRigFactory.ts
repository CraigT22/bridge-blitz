import * as THREE from 'three';
import type { BossChassisId } from '../core/types';

export interface BossChassisRig {
  readonly chassis: BossChassisId;
  readonly root: THREE.Group;
  readonly bodyGroup: THREE.Group;
  readonly turretGroup: THREE.Group | null;
  readonly leftLeg: THREE.Group | null;
  readonly rightLeg: THREE.Group | null;
  readonly spiderLegs: [THREE.Group, THREE.Group, THREE.Group, THREE.Group] | null;
  readonly spinClusters: THREE.Group[];
  readonly recoilBarrels: THREE.Group[];
  readonly meleeArm: THREE.Group | null;
  readonly wingPylons: [THREE.Group, THREE.Group] | null;
  readonly hazardRing: THREE.Mesh;
  readonly primaryMat: THREE.MeshStandardMaterial;
  readonly accentMat: THREE.MeshStandardMaterial;
  readonly trimMat: THREE.MeshStandardMaterial;
  readonly darkSteelMat: THREE.MeshStandardMaterial;
  readonly glowMat: THREE.MeshBasicMaterial;
  readonly flashMaterials: THREE.MeshStandardMaterial[];
}

function createChassisMaterials(
  primaryHex: number,
  accentHex: number,
  trimHex: number
): {
  primaryMat: THREE.MeshStandardMaterial;
  accentMat: THREE.MeshStandardMaterial;
  trimMat: THREE.MeshStandardMaterial;
  darkSteelMat: THREE.MeshStandardMaterial;
  glowMat: THREE.MeshBasicMaterial;
  flashMaterials: THREE.MeshStandardMaterial[];
} {
  const primaryMat = new THREE.MeshStandardMaterial({
    color: primaryHex,
    roughness: 0.34,
    metalness: 0.44,
    emissive: 0x000000,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: accentHex,
    roughness: 0.32,
    metalness: 0.38,
    emissive: 0x000000,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: trimHex,
    roughness: 0.28,
    metalness: 0.48,
    emissive: 0x000000,
  });
  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x1c232d,
    roughness: 0.46,
    metalness: 0.45,
    emissive: 0x000000,
  });
  const glowMat = new THREE.MeshBasicMaterial({
    color: trimHex,
  });

  return {
    primaryMat,
    accentMat,
    trimMat,
    darkSteelMat,
    glowMat,
    flashMaterials: [primaryMat, accentMat, trimMat, darkSteelMat],
  };
}

function addBossGroundAura(
  root: THREE.Group,
  radius = 2.45
): THREE.Mesh {
  const shadowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 28),
    new THREE.MeshBasicMaterial({
      color: 0x05080d,
      transparent: true,
      opacity: 0.56,
      depthWrite: false,
    })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.03;
  root.add(shadowDisc);

  const hazardRing = new THREE.Mesh(
    new THREE.RingGeometry(radius - 0.38, radius, 36),
    new THREE.MeshBasicMaterial({
      color: 0xff3b4e,
      transparent: true,
      opacity: 0.46,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  hazardRing.rotation.x = -Math.PI / 2;
  hazardRing.position.y = 0.045;
  root.add(hazardRing);
  return hazardRing;
}

/**
 * 1. WARDEN_MECH — Sculpted reverse-joint Bipedal Vulcan Mech with shoulder missile pods & twin 6-barrel Gatlings
 */
export function createWardenMechRig(): BossChassisRig {
  const mats = createChassisMaterials(0x384352, 0xc92a3e, 0xf5b42e);
  const root = new THREE.Group();
  const hazardRing = addBossGroundAura(root, 2.35);

  const buildMechLeg = (sideSign: number): THREE.Group => {
    const leg = new THREE.Group();
    leg.position.set(sideSign * 0.72, 1.52, 0);

    const hipJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.34, 12), mats.darkSteelMat);
    hipJoint.rotation.z = Math.PI / 2;
    leg.add(hipJoint);

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.48, 6, 12), mats.primaryMat);
    thigh.position.set(0, -0.34, 0.08);
    thigh.rotation.x = -0.22;
    leg.add(thigh);

    const kneeArmor = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.44), mats.accentMat);
    kneeArmor.position.set(0, -0.68, 0.22);
    leg.add(kneeArmor);

    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.28, 0.68, 10), mats.darkSteelMat);
    shin.position.set(0, -1.04, 0.04);
    shin.rotation.x = 0.16;
    leg.add(shin);

    const footBase = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.24, 1.02), mats.primaryMat);
    footBase.position.set(0, -1.40, 0.16);
    const frontTalons = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 0.32), mats.trimMat);
    frontTalons.position.set(0, -1.44, 0.64);
    leg.add(footBase, frontTalons);

    return leg;
  };

  const leftLeg = buildMechLeg(-1);
  const rightLeg = buildMechLeg(1);
  root.add(leftLeg, rightLeg);

  const bodyGroup = new THREE.Group();
  bodyGroup.position.set(0, 1.58, 0);

  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.56, 0.44, 8), mats.darkSteelMat);
  pelvis.position.set(0, 0.04, 0);
  bodyGroup.add(pelvis);

  // Angled Armored Canopy Hull
  const chestHull = new THREE.Mesh(new THREE.CylinderGeometry(1.06, 0.78, 1.24, 8), mats.primaryMat);
  chestHull.scale.set(1.18, 1, 0.88);
  chestHull.position.set(0, 0.82, 0);
  bodyGroup.add(chestHull);

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.58, 0.96), mats.accentMat);
  canopy.position.set(0, 0.92, 0.38);
  canopy.rotation.x = 0.12;
  bodyGroup.add(canopy);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.18, 0.14), mats.glowMat);
  visor.position.set(0, 0.98, 0.85);
  bodyGroup.add(visor);

  const reactorCore = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.16, 16), mats.glowMat);
  reactorCore.rotation.x = Math.PI / 2;
  reactorCore.position.set(0, 0.52, 0.78);
  const reactorRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.055, 8, 20), mats.trimMat);
  reactorRing.position.set(0, 0.52, 0.82);
  bodyGroup.add(reactorCore, reactorRing);

  const spinClusters: THREE.Group[] = [];

  for (const side of [-1, 1]) {
    // Shoulder Missile Pod
    const pod = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.56, 0.74), mats.primaryMat);
    pod.position.set(side * 1.18, 1.54, -0.05);
    pod.rotation.z = -side * 0.12;
    const podFace = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.42, 0.08), mats.darkSteelMat);
    podFace.position.set(side * 1.18, 1.54, 0.34);
    bodyGroup.add(pod, podFace);

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const warhead = new THREE.Mesh(new THREE.SphereGeometry(0.068, 8, 6), mats.trimMat);
        warhead.position.set(side * 1.18 + (c - 1) * 0.16, 1.46 + r * 0.17, 0.39);
        bodyGroup.add(warhead);
      }
    }

    // Twin 6-Barrel Rotary Vulcan Arm
    const armMount = new THREE.Group();
    armMount.position.set(side * 1.48, 0.78, 0.20);

    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), mats.accentMat);
    pauldron.scale.set(1.1, 0.9, 1.2);
    armMount.add(pauldron);

    const shroud = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.58, 12), mats.darkSteelMat);
    shroud.rotation.x = Math.PI / 2;
    shroud.position.set(0, -0.22, 0.32);
    armMount.add(shroud);

    const spin = new THREE.Group();
    spin.position.set(0, -0.22, 0.62);
    const barrelGeo = new THREE.CylinderGeometry(0.042, 0.042, 1.08, 8);
    barrelGeo.rotateX(Math.PI / 2);
    for (let b = 0; b < 6; b++) {
      const a = (b / 6) * Math.PI * 2;
      const bm = new THREE.Mesh(barrelGeo, mats.trimMat);
      bm.position.set(Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0.44);
      spin.add(bm);
    }
    const clamp = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.08, 14), mats.accentMat);
    clamp.rotation.x = Math.PI / 2;
    clamp.position.set(0, 0, 0.76);
    spin.add(clamp);

    armMount.add(spin);
    spinClusters.push(spin);
    bodyGroup.add(armMount);
  }

  root.add(bodyGroup);

  return {
    chassis: 'WARDEN_MECH',
    root,
    bodyGroup,
    turretGroup: null,
    leftLeg,
    rightLeg,
    spiderLegs: null,
    spinClusters,
    recoilBarrels: [],
    meleeArm: null,
    wingPylons: null,
    hazardRing,
    ...mats,
  };
}

/**
 * 2. SIEGE_TANK — Heavy Tracked Main-Battle Juggernaut with V-Dozer Plow & Twin Recoil Cannons
 */
export function createSiegeTankRig(): BossChassisRig {
  const mats = createChassisMaterials(0x7a1c28, 0x242b35, 0xffb627);
  const root = new THREE.Group();
  const hazardRing = addBossGroundAura(root, 2.75);

  const bodyGroup = new THREE.Group();
  bodyGroup.position.set(0, 0.55, 0);

  // Twin Heavy Armored Caterpillar Treads
  for (const side of [-1, 1]) {
    const treadGroup = new THREE.Group();
    treadGroup.position.set(side * 1.32, 0, 0);

    const treadCore = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.88, 3.35), mats.darkSteelMat);
    treadGroup.add(treadCore);

    const sideSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.54, 3.10), mats.primaryMat);
    sideSkirt.position.set(side * 0.34, 0.12, 0);
    treadGroup.add(sideSkirt);

    for (let w = 0; w < 5; w++) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.78, 12), mats.trimMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, -0.14, -1.24 + w * 0.62);
      treadGroup.add(wheel);
    }
    bodyGroup.add(treadGroup);
  }

  // Sloped Glacis Armored Hull
  const mainHull = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.82, 3.05), mats.primaryMat);
  mainHull.position.set(0, 0.28, -0.05);
  bodyGroup.add(mainHull);

  // Heavy V-Shaped Siege Dozer Blade at front (+Z)
  for (const side of [-1, 1]) {
    const bladeWing = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.78, 0.24), mats.accentMat);
    bladeWing.position.set(side * 0.72, -0.06, 1.72);
    bladeWing.rotation.y = -side * 0.26;
    bladeWing.rotation.x = 0.22;
    const hazardLip = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.14, 0.28), mats.trimMat);
    hazardLip.position.set(side * 0.72, -0.38, 1.80);
    hazardLip.rotation.y = -side * 0.26;
    bodyGroup.add(bladeWing, hazardLip);
  }

  // Headlights
  for (const side of [-1, 1]) {
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), mats.glowMat);
    lamp.rotation.x = Math.PI / 2;
    lamp.position.set(side * 0.78, 0.56, 1.48);
    bodyGroup.add(lamp);
  }

  // Rotating Heavy Siege Turret
  const turretGroup = new THREE.Group();
  turretGroup.position.set(0, 0.92, -0.15);

  const turretBase = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.28, 0.68, 8), mats.primaryMat);
  turretBase.scale.set(1.05, 1, 1.22);
  turretGroup.add(turretBase);

  const turretCheeks = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.52, 1.24), mats.accentMat);
  turretCheeks.position.set(0, 0.04, 0.18);
  turretGroup.add(turretCheeks);

  const opticBar = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.14, 0.12), mats.glowMat);
  opticBar.position.set(0, 0.28, 0.82);
  turretGroup.add(opticBar);

  // Twin Long-Barrel Recoil Siege Cannons
  const recoilBarrels: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const cannonPivot = new THREE.Group();
    cannonPivot.position.set(side * 0.42, 0.06, 0.76);

    const mantlet = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.44), mats.darkSteelMat);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.05, 12), mats.darkSteelMat);
    tube.rotation.x = Math.PI / 2;
    tube.position.set(0, 0, 1.05);

    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.38), mats.trimMat);
    muzzle.position.set(0, 0, 2.08);

    cannonPivot.add(mantlet, tube, muzzle);
    recoilBarrels.push(cannonPivot);
    turretGroup.add(cannonPivot);
  }

  // Roof Rotary Commander Autocannon
  const roofSpin = new THREE.Group();
  roofSpin.position.set(0.48, 0.56, -0.12);
  const miniGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.78, 6);
  miniGeo.rotateX(Math.PI / 2);
  for (let b = 0; b < 6; b++) {
    const a = (b / 6) * Math.PI * 2;
    const bm = new THREE.Mesh(miniGeo, mats.trimMat);
    bm.position.set(Math.cos(a) * 0.08, Math.sin(a) * 0.08, 0.38);
    roofSpin.add(bm);
  }
  turretGroup.add(roofSpin);

  bodyGroup.add(turretGroup);
  root.add(bodyGroup);

  return {
    chassis: 'SIEGE_TANK',
    root,
    bodyGroup,
    turretGroup,
    leftLeg: null,
    rightLeg: null,
    spiderLegs: null,
    spinClusters: [roofSpin],
    recoilBarrels,
    meleeArm: null,
    wingPylons: null,
    hazardRing,
    ...mats,
  };
}

/**
 * 3. KRAKEN_WALKER — Quad-Legged Articulated Spider War-Walker with Multi-Eye Dome & Underslung Plasma Cannons
 */
export function createKrakenWalkerRig(): BossChassisRig {
  const mats = createChassisMaterials(0x1d2636, 0xe82c4f, 0x38f6ff);
  const root = new THREE.Group();
  const hazardRing = addBossGroundAura(root, 2.85);

  const buildSpiderLeg = (sx: number, sz: number, yawAngle: number): THREE.Group => {
    const legPivot = new THREE.Group();
    legPivot.position.set(sx * 0.95, 1.36, sz * 0.78);
    legPivot.rotation.y = yawAngle;

    const coxa = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), mats.accentMat);
    legPivot.add(coxa);

    // Rising femur arching outward
    const femur = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 1.25, 10), mats.primaryMat);
    femur.position.set(sx * 0.56, 0.34, 0);
    femur.rotation.z = -sx * 1.05;
    legPivot.add(femur);

    const kneePod = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), mats.trimMat);
    kneePod.position.set(sx * 1.12, 0.64, 0);
    legPivot.add(kneePod);

    // Tapered razor tibia plunging down to bridge deck
    const tibia = new THREE.Mesh(new THREE.ConeGeometry(0.20, 2.15, 8), mats.darkSteelMat);
    tibia.rotation.x = Math.PI;
    tibia.rotation.z = sx * 0.16;
    tibia.position.set(sx * 1.32, -0.36, 0);
    legPivot.add(tibia);

    const clawTip = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.08, 0.22, 8), mats.accentMat);
    clawTip.position.set(sx * 1.48, -1.28, 0);
    legPivot.add(clawTip);

    return legPivot;
  };

  const legFL = buildSpiderLeg(-1, 1, 0.48);
  const legFR = buildSpiderLeg(1, 1, -0.48);
  const legRL = buildSpiderLeg(-1, -1, -0.48);
  const legRR = buildSpiderLeg(1, -1, 0.48);
  root.add(legFL, legFR, legRL, legRR);

  const bodyGroup = new THREE.Group();
  bodyGroup.position.set(0, 1.48, 0);

  const lowerChassis = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 0.92, 0.64, 10), mats.darkSteelMat);
  bodyGroup.add(lowerChassis);

  // Armored Cephalothorax Command Dome
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.32, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
    mats.primaryMat
  );
  dome.scale.set(1.12, 0.88, 1.24);
  dome.position.set(0, 0.22, -0.08);
  bodyGroup.add(dome);

  const dorsalCrest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.36, 1.85), mats.accentMat);
  dorsalCrest.position.set(0, 1.06, -0.15);
  bodyGroup.add(dorsalCrest);

  // 5-Eye Kraken Sensor Array across front carapace
  for (let e = -2; e <= 2; e++) {
    const r = e === 0 ? 0.22 : 0.13;
    const eye = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mats.glowMat);
    eye.position.set(e * 0.34, 0.56 - Math.abs(e) * 0.06, 1.34 - Math.abs(e) * 0.14);
    bodyGroup.add(eye);
  }

  // Dual Underslung Heavy Plasma Cannons
  const recoilBarrels: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const gun = new THREE.Group();
    gun.position.set(side * 0.66, -0.22, 0.75);
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.86), mats.accentMat);
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 1.15, 10), mats.trimMat);
    rail.rotation.x = Math.PI / 2;
    rail.position.set(0, 0, 0.72);
    const tip = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 8, 14), mats.glowMat);
    tip.position.set(0, 0, 1.26);
    gun.add(housing, rail, tip);
    recoilBarrels.push(gun);
    bodyGroup.add(gun);
  }

  // Spinning Ventral Energy Turbine
  const coreSpin = new THREE.Group();
  coreSpin.position.set(0, -0.34, 0);
  const turbineRing = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.08, 8, 18), mats.trimMat);
  turbineRing.rotation.x = Math.PI / 2;
  coreSpin.add(turbineRing);
  bodyGroup.add(coreSpin);

  root.add(bodyGroup);

  return {
    chassis: 'KRAKEN_WALKER',
    root,
    bodyGroup,
    turretGroup: null,
    leftLeg: null,
    rightLeg: null,
    spiderLegs: [legFL, legFR, legRL, legRR],
    spinClusters: [coreSpin],
    recoilBarrels,
    meleeArm: null,
    wingPylons: null,
    hazardRing,
    ...mats,
  };
}

/**
 * 4. SOVEREIGN_TITAN — Towering Winged & Crowned Warlord Mech with Reactor Core, Rotary Cannon & Siege Rail-Halberd
 */
export function createSovereignTitanRig(): BossChassisRig {
  const mats = createChassisMaterials(0x2c1a29, 0xf5b42e, 0x38f6ff);
  const root = new THREE.Group();
  const hazardRing = addBossGroundAura(root, 2.75);

  const buildTitanLeg = (sideSign: number): THREE.Group => {
    const leg = new THREE.Group();
    leg.position.set(sideSign * 0.78, 1.72, 0);

    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.86, 0.62), mats.primaryMat);
    thigh.position.set(0, -0.40, 0);
    const greave = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.92, 8), mats.darkSteelMat);
    greave.position.set(0, -1.16, 0.06);
    const kneeSpike = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.52, 6), mats.accentMat);
    kneeSpike.rotation.x = Math.PI / 3;
    kneeSpike.position.set(0, -0.78, 0.42);
    const sabaton = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.28, 1.08), mats.accentMat);
    sabaton.position.set(0, -1.58, 0.18);

    leg.add(thigh, greave, kneeSpike, sabaton);
    return leg;
  };

  const leftLeg = buildTitanLeg(-1);
  const rightLeg = buildTitanLeg(1);
  root.add(leftLeg, rightLeg);

  const bodyGroup = new THREE.Group();
  bodyGroup.position.set(0, 1.78, 0);

  // Heroic V-Taper Dreadnought Torso + Ribbed Armor Plates
  const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.64, 0.54, 8), mats.darkSteelMat);
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 0.84, 1.38, 8), mats.primaryMat);
  chest.scale.set(1.18, 1, 0.88);
  chest.position.set(0, 0.88, 0);
  bodyGroup.add(waist, chest);

  // Glowing Sovereign Chest Reactor & Golden Collar Trim
  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.86, 0.38), mats.accentMat);
  chestPlate.position.set(0, 0.96, 0.56);
  const collarGuard = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.24, 0.72), mats.trimMat);
  collarGuard.position.set(0, 1.54, 0.14);
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.065, 8, 18), mats.darkSteelMat);
  coreRing.position.set(0, 0.96, 0.75);
  const coreOrb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), mats.glowMat);
  coreOrb.position.set(0, 0.96, 0.76);
  bodyGroup.add(chestPlate, collarGuard, coreRing, coreOrb);

  // Sculpted Valkyrie/Samurai Mecha Helm + Swept V-Fin Crown
  const helmDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 12, 10),
    mats.primaryMat
  );
  helmDome.scale.set(0.96, 1.05, 1.08);
  helmDome.position.set(0, 1.94, 0.10);

  const helmCheeks = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.44, 0.64), mats.darkSteelMat);
  helmCheeks.position.set(0, 1.82, 0.16);

  const helmVisor = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.15, 0.14), mats.glowMat);
  helmVisor.position.set(0, 1.90, 0.48);

  const browGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), mats.glowMat);
  browGem.position.set(0, 2.12, 0.50);
  bodyGroup.add(helmDome, helmCheeks, helmVisor, browGem);

  // Iconic Swept Golden V-Fin Blade Horns
  for (const side of [-1, 1]) {
    const vFin = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.14, 0.08), mats.accentMat);
    vFin.position.set(side * 0.44, 2.30, 0.42);
    vFin.rotation.z = side * 0.52;
    vFin.rotation.y = -side * 0.18;

    const rearCrest = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.72, 6), mats.trimMat);
    rearCrest.position.set(side * 0.36, 2.28, -0.06);
    rearCrest.rotation.z = -side * 0.36;
    rearCrest.rotation.x = -0.24;
    bodyGroup.add(vFin, rearCrest);
  }

  // Swept 6-Blade Dorsal Energy Wing Binders (fanning outward in heroic mecha silhouette)
  const buildWingPylon = (side: number): THREE.Group => {
    const wing = new THREE.Group();
    wing.position.set(side * 0.76, 1.38, -0.46);
    wing.rotation.z = -side * 0.32;
    wing.rotation.y = -side * 0.22;

    const binderHub = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.38), mats.darkSteelMat);
    wing.add(binderHub);

    for (let f = 0; f < 3; f++) {
      const len = 1.85 - f * 0.28;
      const py = 0.46 - f * 0.36;
      const rotZ = side * (0.28 - f * 0.22);

      const armorVane = new THREE.Mesh(new THREE.BoxGeometry(len, 0.24, 0.12), mats.primaryMat);
      armorVane.position.set(side * (0.35 + len * 0.45), py, 0);
      armorVane.rotation.z = rotZ;

      const plasmaEdge = new THREE.Mesh(new THREE.BoxGeometry(len * 0.92, 0.10, 0.15), mats.glowMat);
      plasmaEdge.position.set(side * (0.42 + len * 0.45), py - 0.10, 0.02);
      plasmaEdge.rotation.z = rotZ;

      wing.add(armorVane, plasmaEdge);
    }
    return wing;
  };

  const wingL = buildWingPylon(-1);
  const wingR = buildWingPylon(1);
  bodyGroup.add(wingL, wingR);

  // Left Arm: Layered Sovereign Pauldron + 6-Barrel Rotary Plasma Cannon
  const leftArm = new THREE.Group();
  leftArm.position.set(-1.58, 1.04, 0.18);
  const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.56, 0.86), mats.primaryMat);
  pauldronL.rotation.z = 0.28;
  pauldronL.position.set(-0.06, 0.24, 0);
  const trimL = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.14, 0.90), mats.accentMat);
  trimL.rotation.z = 0.28;
  trimL.position.set(-0.06, 0.46, 0);
  leftArm.add(pauldronL, trimL);

  const cannonSpin = new THREE.Group();
  cannonSpin.position.set(0, -0.26, 0.46);
  const cGeo = new THREE.CylinderGeometry(0.058, 0.058, 1.38, 8);
  cGeo.rotateX(Math.PI / 2);
  for (let b = 0; b < 6; b++) {
    const a = (b / 6) * Math.PI * 2;
    const bm = new THREE.Mesh(cGeo, mats.trimMat);
    bm.position.set(Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0.52);
    cannonSpin.add(bm);
  }
  const barrelCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 12), mats.accentMat);
  barrelCollar.rotation.x = Math.PI / 2;
  barrelCollar.position.set(0, 0, 0.95);
  cannonSpin.add(barrelCollar);
  leftArm.add(cannonSpin);
  bodyGroup.add(leftArm);

  // Right Arm: Articulated Twin-Pronged Plasma War-Glaive (swings on slam!)
  const meleeArm = new THREE.Group();
  meleeArm.position.set(1.58, 1.06, 0.18);
  const pauldronR = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.56, 0.86), mats.primaryMat);
  pauldronR.rotation.z = -0.28;
  pauldronR.position.set(0.06, 0.24, 0);
  const trimR = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.14, 0.90), mats.accentMat);
  trimR.rotation.z = -0.28;
  trimR.position.set(0.06, 0.46, 0);
  const forearmR = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.48, 0.74), mats.darkSteelMat);
  forearmR.position.set(0, -0.24, 0.28);

  const glaiveGroup = new THREE.Group();
  glaiveGroup.position.set(0, -0.18, 0.62);
  glaiveGroup.rotation.x = 0.52;

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 2.85, 10), mats.accentMat);
  shaft.position.set(0, 0.35, 0);

  const emitterCollar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.30), mats.darkSteelMat);
  emitterCollar.position.set(0, 1.48, 0);

  // Tapered main plasma spearhead + forward crescent scythe prong
  const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.95, 4), mats.glowMat);
  spearTip.scale.set(0.45, 1, 1.35);
  spearTip.position.set(0, 2.08, 0.04);

  const scytheProng = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.72, 4), mats.glowMat);
  scytheProng.scale.set(0.42, 1, 1.25);
  scytheProng.rotation.x = 1.15;
  scytheProng.position.set(0, 1.62, 0.38);

  glaiveGroup.add(shaft, emitterCollar, spearTip, scytheProng);
  meleeArm.add(pauldronR, trimR, forearmR, glaiveGroup);
  bodyGroup.add(meleeArm);

  root.add(bodyGroup);

  return {
    chassis: 'SOVEREIGN_TITAN',
    root,
    bodyGroup,
    turretGroup: null,
    leftLeg,
    rightLeg,
    spiderLegs: null,
    spinClusters: [cannonSpin],
    recoilBarrels: [],
    meleeArm,
    wingPylons: [wingL, wingR],
    hazardRing,
    ...mats,
  };
}

export function createAllBossChassisRigs(): Record<BossChassisId, BossChassisRig> {
  return {
    WARDEN_MECH: createWardenMechRig(),
    SIEGE_TANK: createSiegeTankRig(),
    KRAKEN_WALKER: createKrakenWalkerRig(),
    SOVEREIGN_TITAN: createSovereignTitanRig(),
  };
}
