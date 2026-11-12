import { describe, expect, it } from 'vitest';
import {
  clampSquadCenterX,
  computeSquadOuterRadius,
  ELITE_SLOT_SPACING_X,
  getEliteFormationOffset,
} from '../src/math/formationMath';

describe('formationMath', () => {
  it('builds a dense symmetric diamond/oval crowd cluster for 1..40 commandos', () => {
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

    // Verify all 40 slots are distinct and stay compact within ±2.2m laterally
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      getEliteFormationOffset(i, 40, out);
      expect(Math.abs(out.x)).toBeLessThanOrEqual(2.2);
      seen.add(`${out.x.toFixed(3)},${out.z.toFixed(3)}`);
    }
    expect(seen.size).toBe(40);
  });

  it('expands squad outer radius smoothly across 1..40 soldiers while allowing outer-lane steering (>= 3.05m)', () => {
    const r1 = computeSquadOuterRadius(1);
    const r8 = computeSquadOuterRadius(8);
    const r24 = computeSquadOuterRadius(24);
    const r40 = computeSquadOuterRadius(40);

    expect(r8).toBeGreaterThan(r1);
    expect(r24).toBeGreaterThan(r8);
    expect(r40).toBeGreaterThanOrEqual(r24);

    // Even a 40-soldier crowd can steer its center into LEFT (-3.05) and RIGHT (+3.05) lanes!
    const clampedRight40 = clampSquadCenterX(99, 40);
    const clampedLeft40 = clampSquadCenterX(-99, 40);
    expect(clampedRight40).toBeGreaterThanOrEqual(3.05);
    expect(clampedLeft40).toBeCloseTo(-clampedRight40, 6);
  });
});
