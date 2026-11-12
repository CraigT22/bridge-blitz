import { MAX_VISUAL_SOLDIERS } from './weaponMath';

export interface FormationSlot {
  readonly x: number;
  readonly z: number;
  readonly radius: number;
}

export const SOLDIER_SPACING = 0.44;
export const SOLDIER_BODY_RADIUS = 0.22;
export const BRIDGE_PLAYABLE_HALF_WIDTH = 5.0;
export const GUARDRAIL_MARGIN = 0.18;

/**
 * Generates deterministic concentric hexagonal honeycomb coordinates centered at (0, 0)
 * for up to `maxCount` visual soldiers, sorted strictly by radial distance from the lead soldier.
 */
export function buildHoneycombSlots(
  maxCount = MAX_VISUAL_SOLDIERS,
  spacing = SOLDIER_SPACING
): ReadonlyArray<FormationSlot> {
  const slots: FormationSlot[] = [{ x: 0, z: 0, radius: 0 }];

  // Hexagonal axial basis vectors in XZ plane
  const hexDirs: ReadonlyArray<readonly [number, number]> = [
    [1, 0],
    [0.5, Math.sqrt(3) / 2],
    [-0.5, Math.sqrt(3) / 2],
    [-1, 0],
    [-0.5, -Math.sqrt(3) / 2],
    [0.5, -Math.sqrt(3) / 2],
  ];

  const ringSlots: FormationSlot[] = [];
  let ring = 1;
  while (slots.length + ringSlots.length < maxCount + 36) {
    // Start at ring * dir[4] and walk `ring` steps along each of the 6 hex edges
    let cx = ring * hexDirs[4][0] * spacing;
    let cz = ring * hexDirs[4][1] * spacing;

    for (let side = 0; side < 6; side++) {
      const stepX = hexDirs[side][0] * spacing;
      const stepZ = hexDirs[side][1] * spacing;
      for (let step = 0; step < ring; step++) {
        // Compress X very slightly (0.94) so large formations fit comfortably inside a lane when needed
        const fx = cx * 0.94;
        const fz = cz * 0.96;
        ringSlots.push({
          x: fx,
          z: fz,
          radius: Math.hypot(fx, fz),
        });
        cx += stepX;
        cz += stepZ;
      }
    }
    ring++;
  }

  ringSlots.sort((a, b) => a.radius - b.radius);
  for (let i = 0; i < ringSlots.length && slots.length < maxCount; i++) {
    slots.push(ringSlots[i]);
  }

  return slots;
}

export const PRECOMPUTED_HONEYCOMB_SLOTS: ReadonlyArray<FormationSlot> =
  buildHoneycombSlots(MAX_VISUAL_SOLDIERS, SOLDIER_SPACING);

/**
 * Returns the outer horizontal radius of the rendered squad cluster based on logical troop count.
 */
export function computeSquadOuterRadius(
  logicalSquad: number,
  slots: ReadonlyArray<FormationSlot> = PRECOMPUTED_HONEYCOMB_SLOTS
): number {
  if (logicalSquad <= 0) {
    return 0;
  }
  const visCount = Math.min(logicalSquad, slots.length);
  let maxAbsX = 0;
  for (let i = 0; i < visCount; i++) {
    const ax = Math.abs(slots[i].x);
    if (ax > maxAbsX) {
      maxAbsX = ax;
    }
  }
  return maxAbsX + SOLDIER_BODY_RADIUS;
}

/**
 * Clamps the squad's horizontal center cleanly inside the bridge guardrails,
 * tightening bounds automatically as the squad cluster expands so outer soldiers never clip off.
 */
export function clampSquadCenterX(
  desiredX: number,
  logicalSquad: number,
  bridgeHalfWidth = BRIDGE_PLAYABLE_HALF_WIDTH,
  margin = GUARDRAIL_MARGIN
): number {
  const outerRadius = computeSquadOuterRadius(logicalSquad);
  const maxCenterOffset = Math.max(0.35, bridgeHalfWidth - outerRadius - margin);
  if (desiredX < -maxCenterOffset) {
    return -maxCenterOffset;
  }
  if (desiredX > maxCenterOffset) {
    return maxCenterOffset;
  }
  return desiredX;
}
