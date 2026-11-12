import { MAX_VISUAL_SOLDIERS } from './weaponMath';

export interface FormationSlot {
  readonly x: number;
  readonly z: number;
  readonly radius: number;
}

export const ELITE_SLOT_SPACING_X = 0.88;
export const ELITE_ROW_SPACING_Z = 0.96;
export const MAX_FRONT_RANK_WIDTH = 5;
export const SOLDIER_BODY_RADIUS = 0.34;
export const BRIDGE_PLAYABLE_HALF_WIDTH = 4.9;
export const GUARDRAIL_MARGIN = 0.22;

/**
 * Computes symmetric shoulder-to-shoulder world offsets for `1..10` elite commandos:
 * - 1 commando: `[0]`
 * - 2 commandos: `[-0.44, +0.44]` (side-by-side twin commandos)
 * - 3 commandos: `[-0.88, 0, +0.88]`
 * - 4..5 commandos: symmetric front firing line at `z = 0`
 * - 6..10 commandos: symmetric second rank directly behind at `z = +0.96`
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
  if (idx < MAX_FRONT_RANK_WIDTH) {
    const frontCount = Math.min(MAX_FRONT_RANK_WIDTH, safeCount);
    x = (idx - (frontCount - 1) * 0.5) * ELITE_SLOT_SPACING_X;
    z = 0;
  } else {
    const rearIdx = idx - MAX_FRONT_RANK_WIDTH;
    const rearCount = safeCount - MAX_FRONT_RANK_WIDTH;
    x = (rearIdx - (rearCount - 1) * 0.5) * ELITE_SLOT_SPACING_X;
    z = ELITE_ROW_SPACING_Z;
  }

  if (out) {
    out.x = x;
    out.z = z;
    return out;
  }
  return { x, z };
}

/**
 * Deterministic radial formation slots retained for compatibility & general cluster queries.
 */
export function buildHoneycombSlots(
  maxCount = MAX_VISUAL_SOLDIERS,
  spacing = ELITE_SLOT_SPACING_X
): ReadonlyArray<FormationSlot> {
  const slots: FormationSlot[] = [];
  for (let i = 0; i < maxCount; i++) {
    const row = Math.floor(i / MAX_FRONT_RANK_WIDTH);
    const col = i % MAX_FRONT_RANK_WIDTH;
    const xOffset =
      col === 0 ? 0 : (col % 2 === 1 ? -1 : 1) * Math.ceil(col / 2) * spacing;
    const zOffset = row * ELITE_ROW_SPACING_Z;
    slots.push({
      x: xOffset,
      z: zOffset,
      radius: Math.hypot(xOffset, zOffset),
    });
  }
  slots.sort((a, b) => a.radius - b.radius);
  return slots;
}

export const PRECOMPUTED_HONEYCOMB_SLOTS: ReadonlyArray<FormationSlot> =
  buildHoneycombSlots(MAX_VISUAL_SOLDIERS, ELITE_SLOT_SPACING_X);

/**
 * Returns the outer horizontal half-width of the symmetric elite squad rank.
 */
export function computeSquadOuterRadius(logicalSquad: number): number {
  if (logicalSquad <= 0) {
    return 0;
  }
  const frontCount = Math.min(MAX_FRONT_RANK_WIDTH, Math.min(logicalSquad, MAX_VISUAL_SOLDIERS));
  const maxAbsX = ((frontCount - 1) * 0.5) * ELITE_SLOT_SPACING_X;
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
  const maxCenterOffset = Math.max(0.4, bridgeHalfWidth - outerRadius - margin);
  if (desiredX < -maxCenterOffset) {
    return -maxCenterOffset;
  }
  if (desiredX > maxCenterOffset) {
    return maxCenterOffset;
  }
  return desiredX;
}
