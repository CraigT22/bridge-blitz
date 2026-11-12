import * as THREE from 'three';
import type { WeaponTierId } from '../core/types';

interface ColoredPart {
  geometry: THREE.BufferGeometry;
  colorHex: number;
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

  let offset = 0;
  for (let i = 0; i < nonIndexed.length; i++) {
    const g = nonIndexed[i];
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const norm = g.getAttribute('normal') as THREE.BufferAttribute;
    tmpColor.setHex(parts[i].colorHex);

    for (let v = 0; v < pos.count; v++) {
      const base = (offset + v) * 3;
      positions[base] = pos.getX(v);
      positions[base + 1] = pos.getY(v);
      positions[base + 2] = pos.getZ(v);

      normals[base] = norm.getX(v);
      normals[base + 1] = norm.getY(v);
      normals[base + 2] = norm.getZ(v);

      colors[base] = tmpColor.r;
      colors[base + 1] = tmpColor.g;
      colors[base + 2] = tmpColor.b;
    }
    offset += pos.count;
    g.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  merged.computeBoundingSphere();
  return merged;
}

/**
 * Glossy vibrant green capsule/helmeted toy soldier merged into a single vertex-colored geometry.
 */
export function createPlayerSoldierGeometry(): THREE.BufferGeometry {
  const bootsL = new THREE.BoxGeometry(0.11, 0.14, 0.16);
  bootsL.translate(-0.08, 0.07, 0);
  const bootsR = new THREE.BoxGeometry(0.11, 0.14, 0.16);
  bootsR.translate(0.08, 0.07, 0);

  const torso = new THREE.CapsuleGeometry(0.155, 0.28, 6, 10);
  torso.translate(0, 0.36, 0);

  const backpack = new THREE.BoxGeometry(0.2, 0.22, 0.1);
  backpack.translate(0, 0.38, 0.14);

  const head = new THREE.SphereGeometry(0.135, 10, 8);
  head.translate(0, 0.67, 0);

  const helmet = new THREE.SphereGeometry(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58);
  helmet.translate(0, 0.69, 0);

  const helmetRim = new THREE.TorusGeometry(0.152, 0.022, 6, 14);
  helmetRim.rotateX(Math.PI / 2);
  helmetRim.translate(0, 0.67, 0);

  const visor = new THREE.BoxGeometry(0.21, 0.06, 0.08);
  visor.translate(0, 0.65, -0.11);

  const rifle = new THREE.BoxGeometry(0.065, 0.08, 0.36);
  rifle.translate(0.14, 0.4, -0.15);

  return mergeColoredParts([
    { geometry: bootsL, colorHex: 0x1a2530 },
    { geometry: bootsR, colorHex: 0x1a2530 },
    { geometry: torso, colorHex: 0x24df72 },
    { geometry: backpack, colorHex: 0x17994c },
    { geometry: head, colorHex: 0x3bf088 },
    { geometry: helmet, colorHex: 0x15a851 },
    { geometry: helmetRim, colorHex: 0x62ffa2 },
    { geometry: visor, colorHex: 0x12222c },
    { geometry: rifle, colorHex: 0x3b4d5e },
  ]);
}

/**
 * High-contrast crimson red charging enemy soldier geometry.
 */
export function createEnemySoldierGeometry(): THREE.BufferGeometry {
  const bootsL = new THREE.BoxGeometry(0.12, 0.14, 0.16);
  bootsL.translate(-0.085, 0.07, 0);
  const bootsR = new THREE.BoxGeometry(0.12, 0.14, 0.16);
  bootsR.translate(0.085, 0.07, 0);

  const torso = new THREE.CapsuleGeometry(0.165, 0.28, 6, 10);
  torso.translate(0, 0.36, 0);

  const shoulders = new THREE.BoxGeometry(0.42, 0.1, 0.2);
  shoulders.translate(0, 0.49, 0);

  const helmet = new THREE.CylinderGeometry(0.13, 0.16, 0.22, 9);
  helmet.translate(0, 0.69, 0);

  const crest = new THREE.BoxGeometry(0.05, 0.12, 0.24);
  crest.translate(0, 0.81, 0);

  const visor = new THREE.BoxGeometry(0.23, 0.055, 0.09);
  visor.translate(0, 0.67, 0.12);

  return mergeColoredParts([
    { geometry: bootsL, colorHex: 0x1d1316 },
    { geometry: bootsR, colorHex: 0x1d1316 },
    { geometry: torso, colorHex: 0xe6293f },
    { geometry: shoulders, colorHex: 0x9c1426 },
    { geometry: helmet, colorHex: 0xb8192e },
    { geometry: crest, colorHex: 0xff5a67 },
    { geometry: visor, colorHex: 0xffc845 },
  ]);
}

/**
 * Procedural 3D metallic Padlock mounted atop Locked Multiplier/Divider gates.
 */
export function createPadlockMesh(): THREE.Group {
  const group = new THREE.Group();

  const bodyGeo = new THREE.BoxGeometry(0.56, 0.48, 0.22);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf4b93b,
    metalness: 0.72,
    roughness: 0.28,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  const shackleGeo = new THREE.TorusGeometry(0.18, 0.055, 8, 16, Math.PI);
  const shackleMat = new THREE.MeshStandardMaterial({
    color: 0xd9e2ec,
    metalness: 0.85,
    roughness: 0.2,
  });
  const shackle = new THREE.Mesh(shackleGeo, shackleMat);
  shackle.position.set(0, 0.24, 0);
  group.add(shackle);

  const keyholeGeo = new THREE.CylinderGeometry(0.055, 0.035, 0.25, 8);
  keyholeGeo.rotateX(Math.PI / 2);
  const keyholeMat = new THREE.MeshBasicMaterial({ color: 0x1b2430 });
  const keyhole = new THREE.Mesh(keyholeGeo, keyholeMat);
  keyhole.position.set(0, -0.02, 0);
  group.add(keyhole);

  return group;
}

/**
 * Procedural rotating 3D weapon pickup models for Tiers 1..5.
 */
export function createWeaponPickupGroup(tier: WeaponTierId): THREE.Group {
  const group = new THREE.Group();

  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x2c3a47,
    metalness: 0.65,
    roughness: 0.32,
  });

  const accentColors: Record<WeaponTierId, number> = {
    1: 0xd8e2ec,
    2: 0xffe066,
    3: 0xff9f43,
    4: 0xff6b35,
    5: 0x2ef2ff,
  };

  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColors[tier],
    emissive: accentColors[tier],
    emissiveIntensity: tier === 5 ? 0.65 : 0.32,
    metalness: 0.4,
    roughness: 0.25,
  });

  if (tier <= 2) {
    // Compact Tactical SMG
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.92), darkMetal);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.48, 10), accentMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, -0.58);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.16), accentMat);
    mag.position.set(0, -0.24, -0.08);
    mag.rotation.x = 0.2;
    group.add(body, barrel, mag);
  } else if (tier === 3) {
    // Assault Rifle
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 1.18), darkMetal);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 10), darkMetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.04, -0.82);
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.38, 10), accentMat);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 0.2, -0.05);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.2), accentMat);
    mag.position.set(0, -0.25, -0.14);
    mag.rotation.x = 0.28;
    group.add(receiver, barrel, scope, mag);
  } else if (tier === 4) {
    // Rotary Minigun
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.68, 12), darkMetal);
    housing.rotation.x = Math.PI / 2;
    housing.position.set(0, 0, 0.22);
    group.add(housing);

    for (let b = 0; b < 4; b++) {
      const ang = (b / 4) * Math.PI * 2;
      const brl = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.95, 8), accentMat);
      brl.rotation.x = Math.PI / 2;
      brl.position.set(Math.cos(ang) * 0.12, Math.sin(ang) * 0.12, -0.35);
      group.add(brl);
    }
    const clampRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 8, 14), accentMat);
    clampRing.position.set(0, 0, -0.62);
    group.add(clampRing);
  } else {
    // Lv5 Plasma Pulse Rifle
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 1.15), darkMetal);
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.9), accentMat);
    railL.position.set(-0.12, 0.04, -0.58);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.9), accentMat);
    railR.position.set(0.12, 0.04, -0.58);
    group.add(core, railL, railR);

    for (let c = 0; c < 3; c++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 8, 16), accentMat);
      ring.position.set(0, 0.04, -0.25 - c * 0.26);
      group.add(ring);
    }
  }

  return group;
}

export interface BossMechRig {
  readonly root: THREE.Group;
  readonly leftLeg: THREE.Mesh;
  readonly rightLeg: THREE.Mesh;
  readonly torsoGroup: THREE.Group;
  readonly flashMaterials: THREE.MeshStandardMaterial[];
}

/**
 * Oversized end-of-bridge Boss Mech / Commander with articulated legs and hit-flash armor.
 */
export function createBossMechRig(): BossMechRig {
  const root = new THREE.Group();
  const flashMaterials: THREE.MeshStandardMaterial[] = [];

  const crimsonArmor = new THREE.MeshStandardMaterial({
    color: 0xc91e34,
    roughness: 0.32,
    metalness: 0.45,
  });
  const obsidianSteel = new THREE.MeshStandardMaterial({
    color: 0x222933,
    roughness: 0.38,
    metalness: 0.72,
  });
  const reactorGlow = new THREE.MeshStandardMaterial({
    color: 0xffb703,
    emissive: 0xff7b00,
    emissiveIntensity: 0.85,
    roughness: 0.2,
  });
  flashMaterials.push(crimsonArmor, obsidianSteel);

  const legGeo = new THREE.BoxGeometry(0.68, 1.45, 0.76);
  const leftLeg = new THREE.Mesh(legGeo, obsidianSteel);
  leftLeg.position.set(-0.72, 0.72, 0);
  const rightLeg = new THREE.Mesh(legGeo, obsidianSteel);
  rightLeg.position.set(0.72, 0.72, 0);
  root.add(leftLeg, rightLeg);

  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 1.55, 0);
  root.add(torsoGroup);

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.55, 1.35), crimsonArmor);
  chassis.position.set(0, 0.7, 0);
  torsoGroup.add(chassis);

  const coreRing = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 16), reactorGlow);
  coreRing.rotation.x = Math.PI / 2;
  coreRing.position.set(0, 0.75, 0.65);
  torsoGroup.add(coreRing);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.68, 0.85), obsidianSteel);
  head.position.set(0, 1.75, 0.08);
  torsoGroup.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.18, 0.14), reactorGlow);
  visor.position.set(0, 1.78, 0.48);
  torsoGroup.add(visor);

  const podGeo = new THREE.BoxGeometry(0.65, 0.68, 0.85);
  const podL = new THREE.Mesh(podGeo, crimsonArmor);
  podL.position.set(-1.42, 1.38, 0);
  const podR = new THREE.Mesh(podGeo, crimsonArmor);
  podR.position.set(1.42, 1.38, 0);
  torsoGroup.add(podL, podR);

  const cannonGeo = new THREE.CylinderGeometry(0.22, 0.26, 1.45, 12);
  cannonGeo.rotateX(Math.PI / 2);
  const cannonL = new THREE.Mesh(cannonGeo, obsidianSteel);
  cannonL.position.set(-1.48, 0.58, 0.65);
  const cannonR = new THREE.Mesh(cannonGeo, obsidianSteel);
  cannonR.position.set(1.48, 0.58, 0.65);
  torsoGroup.add(cannonL, cannonR);

  return {
    root,
    leftLeg,
    rightLeg,
    torsoGroup,
    flashMaterials,
  };
}
