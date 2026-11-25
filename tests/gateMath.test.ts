import { describe, expect, it } from 'vitest';
import {
  applyGateBulletHit,
  computeGateStepThreshold,
  computeSplitGateRatio,
  formatGateLabel,
  isNegativeGateState,
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

  it('allows shootable ADD gates to climb smoothly past +10 (+2 -> +12+) without a low ceiling', () => {
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

  it('steps shootable < X1.00 red fractional penalty gates by +0.05, flips positive at X1.00, and climbs uncapped past X3.5', () => {
    const startRed = {
      operator: 'MUL' as const,
      value: 0.85,
      hitAccumulator: 0,
      damagePerIncrement: 10,
      isLocked: false,
    };
    expect(isNegativeGateState('MUL', startRed.value)).toBe(true);

    // 10 dmg -> 0.85 to 0.90 (still red < 1.00)
    const step090 = applyGateBulletHit(startRed, 10);
    expect(step090.value).toBeCloseTo(0.9, 2);
    expect(step090.flippedToPositive).toBe(false);

    // Next 20 dmg -> 0.90 -> 0.95 -> 1.00 (flips to cyan positive!)
    const stepFlip = applyGateBulletHit(
      { ...startRed, value: step090.value, hitAccumulator: 0 },
      20
    );
    expect(stepFlip.value).toBeCloseTo(1.0, 2);
    expect(stepFlip.flippedToPositive).toBe(true);
    expect(isNegativeGateState('MUL', stepFlip.value)).toBe(false);

    // Sustained DPS pushes freely past X3.5+
    const stepUncapped = applyGateBulletHit(
      { ...startRed, value: 1.9, hitAccumulator: 0 },
      900
    );
    expect(stepUncapped.value).toBeGreaterThan(3.5);
    expect(stepUncapped.value).toBeLessThanOrEqual(MAX_SHOOTABLE_MUL_VALUE);
  });

  it('weights positive split-gate sides ~3x wider (+21 | -21 gives +21 ~70% width) and expands/shrinks dynamically', () => {
    // Symmetric magnitude (+21 vs -21) => positive blue side gets ~70% width!
    const symSplit = computeSplitGateRatio('ADD', 21, false, 'ADD', -21, false);
    expect(symSplit).toBeGreaterThan(0.67);
    expect(symSplit).toBeLessThan(0.75);

    // Left +2 vs Right -24: startRatio grows cleanly when +2 climbs to +10
    const startRatio = computeSplitGateRatio('ADD', 2, false, 'ADD', -24, false);
    const grownLeftRatio = computeSplitGateRatio('ADD', 10, false, 'ADD', -24, false);
    expect(grownLeftRatio).toBeGreaterThan(startRatio);

    // Right -24 shrinking to -2 shrinks the right negative portion
    const rightWidthAtMinus24 = 1 - computeSplitGateRatio('ADD', 2, false, 'ADD', -24, false);
    const rightWidthAtMinus2 = 1 - computeSplitGateRatio('ADD', 2, false, 'ADD', -2, false);
    const rightWidthAtZero = 1 - computeSplitGateRatio('ADD', 2, false, 'ADD', 0, false);
    expect(rightWidthAtMinus2).toBeLessThan(rightWidthAtMinus24);
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

  it('applies exact squad count arithmetic for ADD and fractional MUL gates up to 40-commando crowd cap', () => {
    expect(resolveGateSquadCount(14, 'ADD', 12)).toBe(26);
    expect(resolveGateSquadCount(32, 'ADD', 15)).toBe(40);
    expect(resolveGateSquadCount(4, 'ADD', -25)).toBe(0);
    expect(resolveGateSquadCount(20, 'MUL', 0.35)).toBe(7);
    expect(resolveGateSquadCount(12, 'MUL', 2.5)).toBe(30);
    expect(resolveGateSquadCount(20, 'MUL', 2.8)).toBe(40);
  });

  it('formats gate labels with clear 2-decimal < X1.00 penalty labels and crisp >= X1 labels', () => {
    expect(formatGateLabel('ADD', 3)).toBe('+3');
    expect(formatGateLabel('ADD', 0)).toBe('+0');
    expect(formatGateLabel('ADD', -18)).toBe('-18');
    expect(formatGateLabel('MUL', 0.05, false)).toBe('X0.05');
    expect(formatGateLabel('MUL', 0.65, false)).toBe('X0.65');
    expect(formatGateLabel('MUL', 1.0, false)).toBe('X1.0');
    expect(formatGateLabel('MUL', 1.7, false)).toBe('X1.7');
    expect(formatGateLabel('MUL', 2.0, false)).toBe('X2.0');
    expect(formatGateLabel('MUL', 2, true)).toBe('X2');
    expect(formatGateLabel('MUL', 1.5, true)).toBe('X1.5');
  });

  it('decays shootable ADD & MUL gates back toward spawn value after the ~0.45s grace pause (including blue->red reversion)', async () => {
    const {
      GATE_DECAY_GRACE_SECONDS,
      stepGatePassiveDecay,
    } = await import('../src/math/gateMath');

    // 1. Flipped red (-8) -> blue (+3) ADD gate holds value during 0.45s grace pause, then ticks down & flips back to red!
    let addState = {
      operator: 'ADD' as const,
      initialValue: -8,
      value: 3,
      hitAccumulator: 5,
      damagePerIncrement: 10,
      isLocked: false,
      timeSinceLastHit: 0,
      decayAccumulator: 0,
    };

    const duringGrace = stepGatePassiveDecay(addState, GATE_DECAY_GRACE_SECONDS - 0.05);
    expect(duringGrace.value).toBe(3);
    expect(duringGrace.deltaDecrements).toBe(0);
    expect(duringGrace.flippedBackToNegative).toBe(false);

    addState = {
      ...addState,
      value: duringGrace.value,
      hitAccumulator: duringGrace.hitAccumulator,
      timeSinceLastHit: duringGrace.timeSinceLastHit,
      decayAccumulator: duringGrace.decayAccumulator,
    };

    // After 3.0s more idle time, decays cleanly across 0 back into negative red!
    let sawRedFlip = false;
    for (let s = 0; s < 30; s++) {
      const res = stepGatePassiveDecay(addState, 0.1);
      if (res.flippedBackToNegative) {
        sawRedFlip = true;
      }
      addState = {
        ...addState,
        value: res.value,
        hitAccumulator: res.hitAccumulator,
        timeSinceLastHit: res.timeSinceLastHit,
        decayAccumulator: res.decayAccumulator,
      };
    }
    expect(sawRedFlip).toBe(true);
    expect(addState.value).toBe(-8); // Never decays below initialValue!
    expect(addState.hitAccumulator).toBe(0);

    // 2. Flipped red (X0.25) -> blue (X1.20) MUL gate decays smoothly back toward X0.25 & flips red below X1.00
    let mulState = {
      operator: 'MUL' as const,
      initialValue: 0.25,
      value: 1.2,
      hitAccumulator: 0,
      damagePerIncrement: 10,
      isLocked: false,
      timeSinceLastHit: 0,
      decayAccumulator: 0,
    };
    let sawMulRedFlip = false;
    for (let s = 0; s < 70; s++) {
      const res = stepGatePassiveDecay(mulState, 0.1);
      if (res.flippedBackToNegative) {
        sawMulRedFlip = true;
      }
      mulState = {
        ...mulState,
        value: res.value,
        hitAccumulator: res.hitAccumulator,
        timeSinceLastHit: res.timeSinceLastHit,
        decayAccumulator: res.decayAccumulator,
      };
    }
    expect(sawMulRedFlip).toBe(true);
    expect(mulState.value).toBeCloseTo(0.25, 2);

    // 3. Locked gates never decay
    const lockedRes = stepGatePassiveDecay(
      {
        operator: 'ADD',
        initialValue: 2,
        value: 8,
        hitAccumulator: 0,
        damagePerIncrement: 10,
        isLocked: true,
        timeSinceLastHit: 5,
        decayAccumulator: 0,
      },
      1.0
    );
    expect(lockedRes.value).toBe(8);
    expect(lockedRes.deltaDecrements).toBe(0);
  });
});
