import { describe, expect, it } from 'vitest';
import {
  BRIDGE_PLAYABLE_HALF_WIDTH,
  buildHoneycombSlots,
  clampSquadCenterX,
  computeSquadOuterRadius,
  GUARDRAIL_MARGIN,
} from '../src/math/formationMath';

describe('formationMath', () => {
  it('builds 150 concentric honeycomb slots ordered radially around (0, 0)', () => {
    const slots = buildHoneycombSlots(150);
    expect(slots).toHaveLength(150);
    expect(slots[0].x).toBe(0);
    expect(slots[0].z).toBe(0);

    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].radius).toBeGreaterThanOrEqual(slots[i - 1].radius - 1e-9);
    }
  });

  it('expands squad outer radius smoothly up to the 150-model visual cap and clamps inside bridge guardrails', () => {
    const r1 = computeSquadOuterRadius(1);
    const r30 = computeSquadOuterRadius(30);
    const r150 = computeSquadOuterRadius(150);
    const r5000 = computeSquadOuterRadius(5000);

    expect(r30).toBeGreaterThan(r1);
    expect(r150).toBeGreaterThan(r30);
    expect(r5000).toBeCloseTo(r150, 6);

    const clampedRight = clampSquadCenterX(99, 80);
    expect(clampedRight + computeSquadOuterRadius(80) + GUARDRAIL_MARGIN).toBeLessThanOrEqual(
      BRIDGE_PLAYABLE_HALF_WIDTH + 1e-6
    );

    const clampedLeft = clampSquadCenterX(-99, 80);
    expect(clampedLeft).toBeCloseTo(-clampedRight, 6);
  });
});
