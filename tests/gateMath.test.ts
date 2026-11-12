import { describe, expect, it } from 'vitest';
import {
  applyGateBulletHit,
  computeGateStepThreshold,
  computeSplitGateRatio,
  formatGateLabel,
  MAX_ADD_GATE_VALUE,
  MAX_SHOOTABLE_MUL_VALUE,
  resolveGateSquadCount,
} from '../src/math/gateMath';

describe('gateMath', () => {
  it('accumulates fractional bullet damage at 1.0x threshold on negative gates and progressive resistance above 0', () => {
    let negState = {
      operator: 'ADD' as const,
      value: -5,
      hitAccumulator: 0,
      damagePerIncrement: 4,
      isLocked: false,
    };

    const hit1 = applyGateBulletHit(negState, 2.5);
    expect(hit1.value).toBe(-5);
    expect(hit1.deltaIncrements).toBe(0);
    expect(hit1.hitAccumulator).toBeCloseTo(2.5);
    expect(hit1.ringProgress).toBeCloseTo(2.5 / 4);

    negState = { ...negState, value: hit1.value, hitAccumulator: hit1.hitAccumulator };
    const hit2 = applyGateBulletHit(negState, 2.5);
    expect(hit2.value).toBe(-4);
    expect(hit2.deltaIncrements).toBe(1);
    expect(hit2.hitAccumulator).toBeCloseTo(1.0);

    const posCostAt3 = computeGateStepThreshold(4, 3);
    expect(posCostAt3).toBeGreaterThan(4);
    const posHit = applyGateBulletHit(
      {
        operator: 'ADD',
        value: 3,
        hitAccumulator: 0,
        damagePerIncrement: 4,
        isLocked: false,
      },
      posCostAt3
    );
    expect(posHit.value).toBe(4);
    expect(posHit.deltaIncrements).toBe(1);
  });

  it('allows shootable ADD gates to climb smoothly past +10 (+2 -> +12+) without a low +8 ceiling', () => {
    const res = applyGateBulletHit(
      {
        operator: 'ADD',
        value: 2,
        hitAccumulator: 0,
        damagePerIncrement: 4,
        isLocked: false,
      },
      120
    );
    expect(res.value).toBeGreaterThanOrEqual(12);
    expect(res.value).toBeLessThanOrEqual(MAX_ADD_GATE_VALUE);
  });

  it('charges shootable fractional MUL gates freely past X2.2 (X1.0 -> X1.5 -> X3.5+) without an artificial 2.2x cap', () => {
    let mulState = {
      operator: 'MUL' as const,
      value: 1.0,
      hitAccumulator: 0,
      damagePerIncrement: 10,
      isLocked: false,
    };

    const step1 = applyGateBulletHit(mulState, 10);
    expect(step1.value).toBeCloseTo(1.1);
    expect(step1.deltaIncrements).toBe(1);
    expect(step1.flippedToPositive).toBe(false);

    // Push well past X1.5 milestone
    const stepFlip = applyGateBulletHit(
      { ...mulState, value: 1.4, hitAccumulator: 0 },
      30
    );
    expect(stepFlip.value).toBeGreaterThanOrEqual(1.5);
    expect(stepFlip.flippedToPositive).toBe(true);

    // High DPS pushes well past the old 2.2x cap (e.g., X3.5+)
    const stepUncapped = applyGateBulletHit(
      { ...mulState, value: 1.9, hitAccumulator: 0 },
      900
    );
    expect(stepUncapped.value).toBeGreaterThan(3.5);
    expect(stepUncapped.value).toBeLessThanOrEqual(MAX_SHOOTABLE_MUL_VALUE);
  });

  it('expands split gate width when +2 grows to +10 and shrinks negative side when -10 drops to -2', () => {
    // Equal magnitude (+2 vs -2) => 50/50 split
    const equalSplit = computeSplitGateRatio('ADD', 2, false, 'ADD', -2, false);
    expect(equalSplit).toBeCloseTo(0.5, 4);

    // Left +2 vs Right -10: negative -10 starts wider (>65% on right, <35% on left)
    const startRatio = computeSplitGateRatio('ADD', 2, false, 'ADD', -10, false);
    expect(startRatio).toBeLessThan(0.35);

    // Example 1: Left +2 grows to +10 -> Left portion gets BIGGER!
    const grownLeftRatio = computeSplitGateRatio('ADD', 10, false, 'ADD', -10, false);
    const grownFurtherRatio = computeSplitGateRatio('ADD', 10, false, 'ADD', -2, false);
    expect(grownLeftRatio).toBeGreaterThan(startRatio);
    expect(grownFurtherRatio).toBeGreaterThan(0.68);

    // Example 2: Right -10 goes to -2 -> Right portion (1 - leftRatio) gets SMALLER!
    const rightWidthAtMinus10 = 1 - computeSplitGateRatio('ADD', 2, false, 'ADD', -10, false);
    const rightWidthAtMinus2 = 1 - computeSplitGateRatio('ADD', 2, false, 'ADD', -2, false);
    const rightWidthAtZero = 1 - computeSplitGateRatio('ADD', 2, false, 'ADD', 0, false);
    expect(rightWidthAtMinus2).toBeLessThan(rightWidthAtMinus10);
    expect(rightWidthAtZero).toBeLessThan(rightWidthAtMinus2);
  });

  it('detects negative-to-positive gate flip across -2 -> -1 -> 0 -> +1', () => {
    let state = {
      operator: 'ADD' as const,
      value: -2,
      hitAccumulator: 0,
      damagePerIncrement: 3,
      isLocked: false,
    };

    const step1 = applyGateBulletHit(state, 3);
    expect(step1.value).toBe(-1);
    expect(step1.crossedZeroOrPositive).toBe(false);
    expect(step1.flippedToPositive).toBe(false);

    state = { ...state, value: step1.value, hitAccumulator: step1.hitAccumulator };
    const step2 = applyGateBulletHit(state, 3);
    expect(step2.value).toBe(0);
    expect(step2.crossedZeroOrPositive).toBe(true);
    expect(step2.flippedToPositive).toBe(false);

    state = { ...state, value: step2.value, hitAccumulator: step2.hitAccumulator };
    const step3 = applyGateBulletHit(state, 3);
    expect(step3.value).toBe(1);
    expect(step3.flippedToPositive).toBe(true);
  });

  it('keeps locked x2, x3, and ÷2 gates immune to bullet damage with ricochet flag', () => {
    const lockedMul = applyGateBulletHit(
      {
        operator: 'MUL',
        value: 3,
        hitAccumulator: 0,
        damagePerIncrement: 0,
        isLocked: true,
      },
      100
    );
    expect(lockedMul.value).toBe(3);
    expect(lockedMul.deltaIncrements).toBe(0);
    expect(lockedMul.ricochet).toBe(true);
  });

  it('applies exact squad count arithmetic for ADD, fractional MUL, and ÷2 DIV gates with 10-commando cap', () => {
    expect(resolveGateSquadCount(4, 'ADD', 3)).toBe(7);
    expect(resolveGateSquadCount(8, 'ADD', 5)).toBe(10);
    expect(resolveGateSquadCount(4, 'ADD', -25)).toBe(0);
    expect(resolveGateSquadCount(1, 'MUL', 1.4)).toBe(1);
    expect(resolveGateSquadCount(1, 'MUL', 1.5)).toBe(2);
    expect(resolveGateSquadCount(3, 'MUL', 1.7)).toBe(5);
    expect(resolveGateSquadCount(7, 'DIV', 2)).toBe(3);
    expect(resolveGateSquadCount(1, 'DIV', 2)).toBe(1);
  });

  it('formats gate labels with clear operators including fractional shootable X1.7 labels', () => {
    expect(formatGateLabel('ADD', 3)).toBe('+3');
    expect(formatGateLabel('ADD', 0)).toBe('+0');
    expect(formatGateLabel('ADD', -18)).toBe('-18');
    expect(formatGateLabel('MUL', 1.0, false)).toBe('X1');
    expect(formatGateLabel('MUL', 1.7, false)).toBe('X1.7');
    expect(formatGateLabel('MUL', 2.0, false)).toBe('X2');
    expect(formatGateLabel('MUL', 2, true)).toBe('x2');
    expect(formatGateLabel('DIV', 2, true)).toBe('÷2');
  });
});
