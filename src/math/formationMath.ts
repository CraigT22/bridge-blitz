import { MAX_VISUAL_SOLDIERS } from './weaponMath';

export interface FormationSlot {
  readonly x: number;
  readonly z: number;
  readonly radius: number;
}

export const ELITE_SLOT_SPACING_X = 0.60;
export const ELITE_ROW_SPACING_Z = 0.62;
export const MAX_FRONT_RANK_WIDTH = 7;
export const SOLDIER_BODY_RADIUS = 0.28;
export const BRIDGE_PLAYABLE_HALF_WIDTH = 4.9;
export const GUARDRAIL_MARGIN = 0.20;

/**
 * Deterministic diamond/oval honeycomb crowd slots for 1..40 commandos:
 * Packs soldiers shoulder-to-shoulder in staggered rows with subtle organic micro-jitter
 * so small squads (1..3) stand cleanly side-by-side while large squads (12..40) form a tight
 * diamond/oval army cluster!
 */
export function buildHoneycombSlots(
  maxCount = MAX_VISUAL_SOLDIERS,
  spacingX = ELITE_SLOT_SPACING_X,
  spacingZ = ELITE_ROW_SPACING_Z
): ReadonlyArray<FormationSlot> {
  const candidates: FormationSlot[] = [];

  for (let row = -4; row <= 5; row++) {
    const stagger = (Math.abs(row) % 2) * 0.5;
    for (let col = -4; col <= 4; col++) {
      const baseX = (col + stagger - (stagger > 0 ? 0.5 : 0)) * spacingX;
      if (Math.abs(baseX) > 2.02) {
        continue;
      }
      const baseZ = row * spacingZ;
      // Elliptical crowd metric (slightly narrower along X so 40 soldiers thread bridge lanes cleanly!)
      const distMetric = Math.hypot(baseX * 1.12, baseZ * 0.94);
      const hash = Math.abs((row * 37 + col * 17 + 97) % 29);
      const jitterX = row === 0 && Math.abs(col) <= 1 ? 0 : ((hash % 7) - 3) * 0.018;
      const jitterZ = row === 0 && Math.abs(col) <= 1 ? 0 : (((hash * 3) % 7) - 3) * 0.022;
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
 * Computes world-space formation offset `(x, z)` for commando `slotIndex` in a `1..40` crowd:
 * - 1 commando: `[0, 0]`
 * - 2 commandos: `[-0.30, 0], [+0.30, 0]` (tight side-by-side twin commandos)
 * - 3 commandos: `[-0.60, 0], [0, 0], [+0.60, 0]`
 * - 4..40 commandos: dense re-centered diamond/oval honeycomb crowd!
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
 * Returns the outer horizontal half-width of the active commando crowd.
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
 * Clamps the squad's horizontal center cleanly inside the bridge guardrails so outer commandos never clip off.
 */
export function clampSquadCenterX(
  desiredX: number,
  logicalSquad: number,
  bridgeHalfWidth = BRIDGE_PLAYABLE_HALF_WIDTH,
  margin = GUARDRAIL_MARGIN
): number {
  const outerRadius = computeSquadOuterRadius(logicalSquad);
  const maxCenterOffset = Math.min(
    bridgeHalfWidth - margin - 0.25,
    Math.max(3.05, bridgeHalfWidth - outerRadius - margin)
  );
  if (desiredX < -maxCenterOffset) {
    return -maxCenterOffset;
  }
  if (desiredX > maxCenterOffset) {
    return maxCenterOffset;
  }
  return desiredX;
}
