import * as THREE from 'three';
import type { SkinThemeId, WeaponTierId } from '../core/types';
import { getWeaponDisplaySpec } from '../math/weaponMath';
import { createShowcaseWeaponGroup, type ShowcaseWeaponRig } from './WeaponRigFactory';

const MAX_FLYING_WEAPONS = 4;
const FLIGHT_DURATION_SECONDS = 0.30;

interface FlyingWeaponSlot {
  readonly root: THREE.Group;
  readonly spinPivot: THREE.Group;
  readonly haloMesh: THREE.Mesh;
  readonly haloMat: THREE.MeshBasicMaterial;
  readonly rigsByTheme: Record<SkinThemeId, Record<WeaponTierId, ShowcaseWeaponRig>>;
  active: boolean;
  tier: WeaponTierId;
  startX: number;
  startY: number;
  startZ: number;
  age: number;
  duration: number;
}

/**
 * Zero-GC Pre-Allocated Flying Oversized Weapon Pickup System:
 * When any tire pedestal, rolling barrel, or Split Causeway node holding a weapon breaks,
 * launches the oversized rotating 3D gun/wand straight into the live squad formation along a snappy
 * parabolic arc, triggering a golden/rainbow formation burst and instant weapon swap upon arrival!
 */
export class FlyingWeaponSystem {
  private readonly slots: FlyingWeaponSlot[] = [];
  private skinTheme: SkinThemeId = 'UNICORN';

  constructor(scene: THREE.Scene) {
    const haloGeo = new THREE.RingGeometry(0.65, 1.02, 18);

    for (let i = 0; i < MAX_FLYING_WEAPONS; i++) {
      const root = new THREE.Group();
      root.visible = false;

      const spinPivot = new THREE.Group();
      root.add(spinPivot);

      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffdf4d,
        transparent: true,
        opacity: 0.82,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      root.add(haloMesh);

      const buildSet = (theme: SkinThemeId): Record<WeaponTierId, ShowcaseWeaponRig> => ({
        1: createShowcaseWeaponGroup(1, theme),
        2: createShowcaseWeaponGroup(2, theme),
        3: createShowcaseWeaponGroup(3, theme),
        4: createShowcaseWeaponGroup(4, theme),
        5: createShowcaseWeaponGroup(5, theme),
      });

      const rigsByTheme: Record<SkinThemeId, Record<WeaponTierId, ShowcaseWeaponRig>> = {
        TACTICAL: buildSet('TACTICAL'),
        UNICORN: buildSet('UNICORN'),
      };

      for (const theme of ['TACTICAL', 'UNICORN'] as const) {
        for (const t of [1, 2, 3, 4, 5] as const) {
          const rig = rigsByTheme[theme][t];
          rig.root.scale.setScalar(1.92);
          rig.root.visible = false;
          spinPivot.add(rig.root);
        }
      }

      scene.add(root);
      this.slots.push({
        root,
        spinPivot,
        haloMesh,
        haloMat,
        rigsByTheme,
        active: false,
        tier: 2,
        startX: 0,
        startY: 2.2,
        startZ: 0,
        age: 0,
        duration: FLIGHT_DURATION_SECONDS,
      });
    }
  }

  public get activeCount(): number {
    let count = 0;
    for (let i = 0; i < MAX_FLYING_WEAPONS; i++) {
      if (this.slots[i].active) {
        count++;
      }
    }
    return count;
  }

  public setSkinTheme(theme: SkinThemeId): void {
    if (this.skinTheme === theme) {
      return;
    }
    this.skinTheme = theme;
    for (let i = 0; i < MAX_FLYING_WEAPONS; i++) {
      const slot = this.slots[i];
      if (slot.active) {
        this.syncSlotRigVisibility(slot);
      }
    }
  }

  public clear(): void {
    for (let i = 0; i < MAX_FLYING_WEAPONS; i++) {
      const slot = this.slots[i];
      slot.active = false;
      slot.root.visible = false;
    }
  }

  public launch(
    tier: WeaponTierId,
    originX: number,
    originY: number,
    originZ: number
  ): void {
    // Pick first inactive slot, or recycle the oldest active slot
    let chosen = this.slots[0];
    for (let i = 0; i < MAX_FLYING_WEAPONS; i++) {
      if (!this.slots[i].active) {
        chosen = this.slots[i];
        break;
      }
      if (this.slots[i].age > chosen.age) {
        chosen = this.slots[i];
      }
    }

    chosen.active = true;
    chosen.tier = tier;
    chosen.startX = originX;
    chosen.startY = originY;
    chosen.startZ = originZ;
    chosen.age = 0;
    chosen.duration = FLIGHT_DURATION_SECONDS;
    chosen.root.position.set(originX, originY, originZ);
    chosen.root.scale.setScalar(1.0);
    chosen.spinPivot.rotation.set(0.25, 0, 0.12);
    chosen.root.visible = true;
    this.syncSlotRigVisibility(chosen);
  }

  private syncSlotRigVisibility(slot: FlyingWeaponSlot): void {
    const colorHex = getWeaponDisplaySpec(slot.tier, this.skinTheme).colorHex;
    slot.haloMat.color.setHex(this.skinTheme === 'UNICORN' ? colorHex : 0xffd84d);
    for (const theme of ['TACTICAL', 'UNICORN'] as const) {
      for (const t of [1, 2, 3, 4, 5] as const) {
        slot.rigsByTheme[theme][t].root.visible =
          theme === this.skinTheme && t === slot.tier;
      }
    }
  }

  public update(
    dt: number,
    squadX: number,
    squadZ: number,
    onArrive: (tier: WeaponTierId, x: number, z: number) => void,
    onTrailSpark?: (x: number, y: number, z: number, tier: WeaponTierId) => void
  ): void {
    for (let i = 0; i < MAX_FLYING_WEAPONS; i++) {
      const slot = this.slots[i];
      if (!slot.active) {
        continue;
      }

      slot.age += dt;
      const u = Math.min(1, slot.age / Math.max(0.05, slot.duration));
      // Snappy ease-in-out straight into the squad formation!
      const ease = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) * 0.5;

      const curX = slot.startX + (squadX - slot.startX) * ease;
      const curZ = slot.startZ + (squadZ - slot.startZ) * ease;
      const arcY = Math.sin(u * Math.PI) * 2.15;
      const curY = slot.startY + (1.15 - slot.startY) * ease + arcY;

      slot.root.position.set(curX, curY, curZ);
      // Oversized gleaming presence mid-flight, zooming cleanly into squad hands on arrival
      const scalePop = 1.0 + Math.sin(u * Math.PI) * 0.36;
      slot.root.scale.setScalar(scalePop);

      slot.spinPivot.rotation.y += dt * 16.5;
      slot.spinPivot.rotation.x = 0.25 + Math.sin(u * Math.PI * 2) * 0.35;
      slot.haloMesh.rotation.z -= dt * 9.5;
      slot.haloMesh.rotation.x = -0.55;

      const activeRig = slot.rigsByTheme[this.skinTheme][slot.tier];
      if (activeRig.spinCluster) {
        activeRig.spinCluster.rotation.x += dt * 22.0;
      }

      if (onTrailSpark && u < 0.92) {
        onTrailSpark(curX, curY, curZ, slot.tier);
      }

      if (slot.age >= slot.duration) {
        const landedTier = slot.tier;
        slot.active = false;
        slot.root.visible = false;
        onArrive(landedTier, squadX, squadZ);
      }
    }
  }
}
