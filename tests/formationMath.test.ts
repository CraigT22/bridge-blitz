import { describe, expect, it } from 'vitest';
import {
  BRIDGE_PLAYABLE_HALF_WIDTH,
  clampSquadCenterX,
  computeSquadOuterRadius,
  ELITE_ROW_SPACING_Z,
  ELITE_SLOT_SPACING_X,
  getEliteFormationOffset,
  GUARDRAIL_MARGIN,
} from '../src/math/formationMath';

describe('formationMath', () => {
  it('centers 1..5 elite commandos symmetrically shoulder-to-shoulder and places 6..10 in a centered 2nd rank', () => {
    const out = { x: 0, z: 0 };

    getEliteFormationOffset(0, 1, out);
    expect(out.x).toBeCloseTo(0);
    expect(out.z).toBeCloseTo(0);

    const twoX: number[] = [];
    for (let i = 0; i < 2; i++) {
      getEliteFormationOffset(i, 2, out);
      twoX.push(out.x);
      expect(out.z).toBeCloseTo(0);
    }
    expect(twoX[0]).toBeCloseTo(-ELITE_SLOT_SPACING_X * 0.5);
    expect(twoX[1]).toBeCloseTo(ELITE_SLOT_SPACING_X * 0.5);

    // 7 commandos => 5 in front rank (z = 0), 2 centered in rear rank (z = +ELITE_ROW_SPACING_Z)
    getEliteFormationOffset(5, 7, out);
    expect(out.x).toBeCloseTo(-ELITE_SLOT_SPACING_X * 0.5);
    expect(out.z).toBeCloseTo(ELITE_ROW_SPACING_Z);
    getEliteFormationOffset(6, 7, out);
    expect(out.x).toBeCloseTo(ELITE_SLOT_SPACING_X * 0.5);
    expect(out.z).toBeCloseTo(ELITE_ROW_SPACING_Z);
  });

  it('expands squad outer radius up to the 5-wide front rank and clamps cleanly inside bridge guardrails', () => {
    const r1 = computeSquadOuterRadius(1);
    const r3 = computeSquadOuterRadius(3);
    const r5 = computeSquadOuterRadius(5);
    const r10 = computeSquadOuterRadius(10);

    expect(r3).toBeGreaterThan(r1);
    expect(r5).toBeGreaterThan(r3);
    expect(r10).toBeCloseTo(r5, 6);

    const clampedRight = clampSquadCenterX(99, 5);
    expect(clampedRight + computeSquadOuterRadius(5) + GUARDRAIL_MARGIN).toBeLessThanOrEqual(
      BRIDGE_PLAYABLE_HALF_WIDTH + 1e-6
    );

    const clampedLeft = clampSquadCenterX(-99, 5);
    expect(clampedLeft).toBeCloseTo(-clampedRight, 6);
  });
});
