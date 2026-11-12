import { describe, expect, it } from 'vitest';
import {
  applyGateBulletHit,
  computeGateStepThreshold,
  formatGateLabel,
  MAX_ADD_GATE_VALUE,
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

    // Above 0, step cost scales progressively via computeGateStepThreshold
    const posCostAt5 = computeGateStepThreshold(4, 5);
    expect(posCostAt5).toBeGreaterThan(4);
    const posHit = applyGateBulletHit(
      {
        operator: 'ADD',
        value: 5,
        hitAccumulator: 0,
        damagePerIncrement: 4,
        isLocked: false,
      },
      posCostAt5
    );
    expect(posHit.value).toBe(6);
    expect(posHit.deltaIncrements).toBe(1);
  });

  it('caps shootable ADD gates cleanly at MAX_ADD_GATE_VALUE (+30) to prevent runaway snowballs', () => {
    const res = applyGateBulletHit(
      {
        operator: 'ADD',
        value: 28,
        hitAccumulator: 0,
        damagePerIncrement: 1.5,
        isLocked: false,
      },
      5000
    );
    expect(res.value).toBe(MAX_ADD_GATE_VALUE);
    expect(res.deltaIncrements).toBe(2);
    expect(res.hitAccumulator).toBe(0);
  });

  it('detects negative-to-positive gate flip across -2 -> -1 -> 0 -> +1', () => {
    let state = {
      operator: 'ADD' as const,
      value: -2,
      hitAccumulator: 0,
      damagePerIncrement: 3,
      isLocked: false,
    };

    // -2 -> -1 (not flipped yet)
    const step1 = applyGateBulletHit(state, 3);
    expect(step1.value).toBe(-1);
    expect(step1.crossedZeroOrPositive).toBe(false);
    expect(step1.flippedToPositive).toBe(false);

    // -1 -> 0 (crosses out of negative territory)
    state = { ...state, value: step1.value, hitAccumulator: step1.hitAccumulator };
    const step2 = applyGateBulletHit(state, 3);
    expect(step2.value).toBe(0);
    expect(step2.crossedZeroOrPositive).toBe(true);
    expect(step2.flippedToPositive).toBe(false);

    // 0 -> +1 (strictly positive flip moment)
    state = { ...state, value: step2.value, hitAccumulator: step2.hitAccumulator };
    const step3 = applyGateBulletHit(state, 3);
    expect(step3.value).toBe(1);
    expect(step3.flippedToPositive).toBe(true);
  });

  it('triggers both crossedZeroOrPositive and flippedToPositive when jumping directly from -1 to +2', () => {
    // -1 -> 0 costs 2.0, 0 -> 1 costs 2.0, 1 -> 2 costs 2.0 * 1.22 = 2.44 (total 6.44)
    const res = applyGateBulletHit(
      {
        operator: 'ADD',
        value: -1,
        hitAccumulator: 0,
        damagePerIncrement: 2,
        isLocked: false,
      },
      6.5
    );
    expect(res.value).toBe(2);
    expect(res.crossedZeroOrPositive).toBe(true);
    expect(res.flippedToPositive).toBe(true);
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

  it('applies exact squad count arithmetic for ADD, x3 MUL, and ÷2 DIV gates', () => {
    expect(resolveGateSquadCount(12, 'ADD', 10)).toBe(22);
    expect(resolveGateSquadCount(12, 'ADD', -25)).toBe(0);
    expect(resolveGateSquadCount(14, 'MUL', 3)).toBe(42);
    expect(resolveGateSquadCount(15, 'DIV', 2)).toBe(7);
    expect(resolveGateSquadCount(1, 'DIV', 2)).toBe(1);
  });

  it('formats gate labels with clear operators', () => {
    expect(formatGateLabel('ADD', 10)).toBe('+10');
    expect(formatGateLabel('ADD', 0)).toBe('+0');
    expect(formatGateLabel('ADD', -25)).toBe('-25');
    expect(formatGateLabel('MUL', 3)).toBe('x3');
    expect(formatGateLabel('DIV', 2)).toBe('÷2');
  });
});
