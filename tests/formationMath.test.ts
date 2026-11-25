import { describe, expect, it } from 'vitest';
import {
  BRIDGE_PLAYABLE_HALF_WIDTH,
  BULLET_PLAYABLE_RAIL_X,
  clampBulletSpawnX,
  clampSquadCenterX,
  computeSquadOuterRadius,
  ELITE_SLOT_SPACING_X,
  getEliteFormationOffset,
  SOLDIER_VISUAL_OVERHANG_LIMIT_X,
  SPLIT_DIVIDER_X,
  SQUAD_CENTER_BOUNDARY_X,
} from '../src/math/formationMath';

describe('formationMath', () => {
  it('builds a compact circular/oval honeycomb blob (~1.2–1.6 lanes wide at 40 soldiers)', () => {
    const out = { x: 0, z: 0 };

    getEliteFormationOffset(0, 1, out);
    expect(out.x).toBeCloseTo(0);
    expect(out.z).toBeCloseTo(0);

    getEliteFormationOffset(0, 2, out);
    const x0 = out.x;
    getEliteFormationOffset(1, 2, out);
    const x1 = out.x;
    expect(x0).toBeCloseTo(-ELITE_SLOT_SPACING_X * 0.5);
    expect(x1).toBeCloseTo(ELITE_SLOT_SPACING_X * 0.5);

    // Verify all 40 slots are distinct and stay compact (~1.2-1.6 lanes wide including shoulders)
    const seen = new Set<string>();
    let maxAbsX = 0;
    for (let i = 0; i < 40; i++) {
      getEliteFormationOffset(i, 40, out);
      maxAbsX = Math.max(maxAbsX, Math.abs(out.x));
      expect(Math.abs(out.x)).toBeLessThanOrEqual(2.55);
      seen.add(`${out.x.toFixed(3)},${out.z.toFixed(3)}`);
    }
    expect(seen.size).toBe(40);

    const laneWidth = (BRIDGE_PLAYABLE_HALF_WIDTH * 2) / 3;
    const visualBlobWidth = computeSquadOuterRadius(40) * 2;
    const lanesWide = visualBlobWidth / laneWidth;
    expect(lanesWide).toBeGreaterThanOrEqual(1.2);
    expect(lanesWide).toBeLessThanOrEqual(1.6);
    expect(maxAbsX).toBeGreaterThanOrEqual(2.1);
  });

  it('clamps only squad center to outer-lane boundary so flanking soldiers overhang curb while bullets clamp to playable rail', () => {
    const r1 = computeSquadOuterRadius(1);
    const r8 = computeSquadOuterRadius(8);
    const r24 = computeSquadOuterRadius(24);
    const r40 = computeSquadOuterRadius(40);

    expect(r8).toBeGreaterThan(r1);
    expect(r24).toBeGreaterThan(r8);
    expect(r40).toBeGreaterThanOrEqual(r24);

    // Arcade center-clamped movement: 1-soldier and 40-soldier squads reach the exact same outer-lane center!
    expect(clampSquadCenterX(99, 1)).toBeCloseTo(SQUAD_CENTER_BOUNDARY_X, 5);
    expect(clampSquadCenterX(99, 40)).toBeCloseTo(SQUAD_CENTER_BOUNDARY_X, 5);
    expect(clampSquadCenterX(-99, 40)).toBeCloseTo(-SQUAD_CENTER_BOUNDARY_X, 5);

    // Full 40-soldier blob pushed to far outer lane extends outer flanking soldiers slightly past the bridge curb
    const outerMostSoldierX = clampSquadCenterX(99, 40) + computeSquadOuterRadius(40);
    expect(outerMostSoldierX).toBeGreaterThan(BRIDGE_PLAYABLE_HALF_WIDTH);
    expect(outerMostSoldierX).toBeLessThanOrEqual(SOLDIER_VISUAL_OVERHANG_LIMIT_X + 0.5);

    // Off-curb flanking bullet spawn X clamps strictly onto the playable outer-lane rail (±5.10m)
    expect(clampBulletSpawnX(0.4, 0)).toBeCloseTo(0.4, 5);
    expect(clampBulletSpawnX(-3.2, 5)).toBeCloseTo(-3.2, 5);
    for (let i = 0; i < 40; i++) {
      const clampedRight = clampBulletSpawnX(6.9, i);
      const clampedLeft = clampBulletSpawnX(-6.9, i);
      expect(clampedRight).toBeLessThanOrEqual(BULLET_PLAYABLE_RAIL_X);
      expect(clampedRight).toBeGreaterThanOrEqual(BULLET_PLAYABLE_RAIL_X - 0.35);
      expect(clampedLeft).toBeGreaterThanOrEqual(-BULLET_PLAYABLE_RAIL_X);
      expect(clampedLeft).toBeLessThanOrEqual(-BULLET_PLAYABLE_RAIL_X + 0.35);
    }
  });

  it('divides Split Causeway into a 25% smaller Left Power-Up Column than the Right Enemy Column', () => {
    const leftPowerUpWidth = BRIDGE_PLAYABLE_HALF_WIDTH + SPLIT_DIVIDER_X;
    const rightEnemyWidth = BRIDGE_PLAYABLE_HALF_WIDTH - SPLIT_DIVIDER_X;
    expect(leftPowerUpWidth / rightEnemyWidth).toBeCloseTo(0.75, 2);
  });
});
