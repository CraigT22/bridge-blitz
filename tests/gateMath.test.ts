import { describe, expect, it } from 'vitest';
import {
  applyGateBulletHit,
  formatGateLabel,
  resolveGateSquadCount,
} from '../src/math/gateMath';

describe('gateMath', () => {
  it('accumulates fractional bullet damage and increments +1 every K damage threshold', () => {
    let state = {
      operator: 'ADD' as const,
      value: 5,
      hitAccumulator: 0,
      damagePerIncrement: 4,
      isLocked: false,
    };

    const hit1 = applyGateBulletHit(state, 2.5);
    expect(hit1.value).toBe(5);
    expect(hit1.deltaIncrements).toBe(0);
    expect(hit1.hitAccumulator).toBeCloseTo(2.5);
    expect(hit1.ringProgress).toBeCloseTo(2.5 / 4);

    state = { ...state, value: hit1.value, hitAccumulator: hit1.hitAccumulator };
    const hit2 = applyGateBulletHit(state, 2.5);
    expect(hit2.value).toBe(6);
    expect(hit2.deltaIncrements).toBe(1);
    expect(hit2.hitAccumulator).toBeCloseTo(1.0);
  });

  it('detects negative-to-positive gate flip across -1 -> 0 -> +1', () => {
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
    const res = applyGateBulletHit(
      {
        operator: 'ADD',
        value: -1,
        hitAccumulator: 0,
        damagePerIncrement: 2,
        isLocked: false,
      },
      6
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
