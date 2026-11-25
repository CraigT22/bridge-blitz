import { MAX_VISUAL_SOLDIERS } from './weaponMath';

export interface FormationSlot {
  readonly x: number;
  readonly z: number;
  readonly radius: number;
}

export const ELITE_SLOT_SPACING_X = 0.72;
export const ELITE_ROW_SPACING_Z = 0.58;
export const MAX_FRONT_RANK_WIDTH = 7;
export const SOLDIER_BODY_RADIUS = 0.24;
export const BRIDGE_PLAYABLE_HALF_WIDTH = 6.12;
export const GUARDRAIL_MARGIN = 0.22;
export const SOLDIER_SAFE_LIMIT_X = 5.62;
/**
 * Arcade v8.0 Center-Clamped Outer-Lane Boundary:
 * Clamps ONLY the squad center to ±4.85m so outer flanking soldiers push slightly past the bridge
 * curb (±6.24m) visually while keeping the heart of the squad dead-center in the far-left/far-right lane!
 */
export const SQUAD_CENTER_BOUNDARY_X = 4.85;
/**
 * Playable outer-lane bullet rail X (±5.10m):
 * Off-curb flanking soldiers clamp their bullet spawn X onto this rail so 100% of flanking soldiers
 * land full parallel DPS straight down the far-left or far-right lane instead of firing into empty air.
 */
export const BULLET_PLAYABLE_RAIL_X = 5.10;
/**
 * Visual outer soft limit for individual flanking soldiers overhanging the bridge curb.
 */
export const SOLDIER_VISUAL_OVERHANG_LIMIT_X = 7.45;
/**
 * Split Causeway Divider X (-0.88) divides [-6.12, +6.12] into:
 * - Left Power-Up Column [-6.12, -0.88] = 5.24m wide (0.75x of Right!)
 * - Right Enemy Column   [-0.88, +6.12] = 7.00m wide
 */
export const SPLIT_DIVIDER_X = -0.88;

/**
 * Deterministic compact circular/oval concentric honeycomb crowd slots for 1..40 soldiers:
 * Spans ~1.30–1.45 lanes wide (~5.3m–5.8m) at full 40-unit squad so single-lane targets melt cleanly
 * while straddling a lane line (or Split Causeway divider) naturally splits parallel fire across two lanes!
 */
export function buildHoneycombSlots(
  maxCount = MAX_VISUAL_SOLDIERS,
  spacingX = ELITE_SLOT_SPACING_X,
  spacingZ = ELITE_ROW_SPACING_Z
): ReadonlyArray<FormationSlot> {
  const candidates: FormationSlot[] = [];

  for (let row = -5; row <= 5; row++) {
    const stagger = (Math.abs(row) % 2) * 0.5;
    for (let col = -5; col <= 5; col++) {
      const baseX = (col + stagger - (stagger > 0 ? 0.5 : 0)) * spacingX;
      if (Math.abs(baseX) > 2.75) {
        continue;
      }
      const baseZ = row * spacingZ;
      // Compact concentric oval metric (~1.35 lanes wide at 40 soldiers)
      const distMetric = Math.hypot(baseX * 0.86, baseZ * 1.15);
      const hash = Math.abs((row * 37 + col * 17 + 97) % 29);
      const jitterX = row === 0 && Math.abs(col) <= 1 ? 0 : ((hash % 7) - 3) * 0.022;
      const jitterZ = row === 0 && Math.abs(col) <= 1 ? 0 : (((hash * 3) % 7) - 3) * 0.024;
      candidates.push({
        x: baseX + jitterX,
        z: baseZ + jitterZ,
        radius: distMetric,
      });
    }
  }

  candidates.sort((a, b) => {
    if (Math.abs(a.radius - b.radius) > 0.04) {
      return a.radius - b.radius;
    }
    // Prefer slightly forward slots first at equal radius
    if (Math.abs(a.z - b.z) > 0.04) {
      return a.z - b.z;
    }
    return Math.abs(a.x) - Math.abs(b.x);
  });

  // Shift z so the frontmost slots sit right near z = 0..+0.4 and crowd extends slightly behind squad.z
  const selected = candidates.slice(0, Math.max(1, maxCount));
  let minZ = 0;
  for (let i = 0; i < Math.min(8, selected.length); i++) {
    if (selected[i].z < minZ) {
      minZ = selected[i].z;
    }
  }
  const shiftZ = -minZ * 0.65;
  return selected.map((s, idx) => ({
    x: idx === 0 ? 0 : s.x,
    z: idx === 0 ? 0 : s.z + shiftZ,
    radius: Math.hypot(s.x, s.z + shiftZ),
  }));
}

export const PRECOMPUTED_HONEYCOMB_SLOTS: ReadonlyArray<FormationSlot> =
  buildHoneycombSlots(MAX_VISUAL_SOLDIERS, ELITE_SLOT_SPACING_X, ELITE_ROW_SPACING_Z);

/**
 * Computes world-space formation offset `(x, z)` for soldier `slotIndex` in a `1..40` crowd:
 * - 1 soldier: `[0, 0]`
 * - 2 soldiers: tight side-by-side pair
 * - 3 soldiers: tight front line
 * - 4..40 soldiers: compact re-centered concentric circular/oval blob!
 */
export function getEliteFormationOffset(
  slotIndex: number,
  squadCount: number,
  out?: { x: number; z: number }
): { x: number; z: number } {
  const safeCount = Math.max(1, Math.min(MAX_VISUAL_SOLDIERS, Math.floor(squadCount)));
  const idx = Math.max(0, Math.min(safeCount - 1, slotIndex));

  let x = 0;
  let z = 0;

  if (safeCount === 1) {
    x = 0;
    z = 0;
  } else if (safeCount === 2) {
    x = (idx === 0 ? -0.5 : 0.5) * ELITE_SLOT_SPACING_X;
    z = 0;
  } else if (safeCount === 3) {
    x = (idx - 1) * ELITE_SLOT_SPACING_X;
    z = 0;
  } else {
    // Re-center X across the active subset so small/medium clusters stay perfectly balanced
    let sumX = 0;
    let minZ = 999;
    for (let k = 0; k < safeCount; k++) {
      const sl = PRECOMPUTED_HONEYCOMB_SLOTS[k];
      sumX += sl.x;
      if (sl.z < minZ) {
        minZ = sl.z;
      }
    }
    const meanX = sumX / safeCount;
    const slot = PRECOMPUTED_HONEYCOMB_SLOTS[idx];
    x = slot.x - meanX;
    z = slot.z - minZ;
  }

  if (out) {
    out.x = x;
    out.z = z;
    return out;
  }
  return { x, z };
}

/**
 * Returns the outer horizontal half-width of the active soldier crowd.
 */
export function computeSquadOuterRadius(logicalSquad: number): number {
  if (logicalSquad <= 0) {
    return 0;
  }
  const safeCount = Math.max(1, Math.min(MAX_VISUAL_SOLDIERS, Math.floor(logicalSquad)));
  if (safeCount === 1) {
    return SOLDIER_BODY_RADIUS;
  }
  if (safeCount === 2) {
    return ELITE_SLOT_SPACING_X * 0.5 + SOLDIER_BODY_RADIUS;
  }
  if (safeCount === 3) {
    return ELITE_SLOT_SPACING_X + SOLDIER_BODY_RADIUS;
  }

  let sumX = 0;
  for (let k = 0; k < safeCount; k++) {
    sumX += PRECOMPUTED_HONEYCOMB_SLOTS[k].x;
  }
  const meanX = sumX / safeCount;
  let maxAbsX = 0;
  for (let k = 0; k < safeCount; k++) {
    const ax = Math.abs(PRECOMPUTED_HONEYCOMB_SLOTS[k].x - meanX);
    if (ax > maxAbsX) {
      maxAbsX = ax;
    }
  }
  return maxAbsX + SOLDIER_BODY_RADIUS;
}

/**
 * v8.0 Arcade Center-Clamped Outer-Lane Movement:
 * Clamps ONLY the squad center to the outer-lane boundary (±4.85m) regardless of squad size,
 * allowing outer flanking soldiers to push slightly past the bridge curb visually while keeping
 * full outer-lane target reach at 1..40 crowd sizes!
 */
export function clampSquadCenterX(
  desiredX: number,
  _logicalSquad = 1,
  centerBoundaryX = SQUAD_CENTER_BOUNDARY_X
): number {
  const limit = Math.max(0, centerBoundaryX);
  if (desiredX < -limit) {
    return -limit;
  }
  if (desiredX > limit) {
    return limit;
  }
  return desiredX;
}

/**
 * Clamps off-curb flanking soldier bullet spawn X onto the outer lane's playable rail (±5.10m)
 * with optional deterministic micro-inset so clamped flanking fire stays thick & lively while
 * landing 100% full parallel DPS straight down the far-left or far-right lane!
 */
export function clampBulletSpawnX(
  rawMuzzleX: number,
  soldierIdx = 0,
  railHalfWidth = BULLET_PLAYABLE_RAIL_X
): number {
  const limit = Math.max(0.5, railHalfWidth);
  if (rawMuzzleX > limit) {
    const inset = ((Math.abs(soldierIdx) * 7) % 5) * 0.055;
    return limit - inset;
  }
  if (rawMuzzleX < -limit) {
    const inset = ((Math.abs(soldierIdx) * 7) % 5) * 0.055;
    return -limit + inset;
  }
  return rawMuzzleX;
}
