import type { GateOperator } from '../core/types';
import { MAX_SQUAD_COUNT } from './weaponMath';

export interface GateHitState {
  readonly operator: GateOperator;
  readonly value: number;
  readonly hitAccumulator: number;
  readonly damagePerIncrement: number;
  readonly isLocked: boolean;
}

export interface GateHitOutcome {
  readonly value: number;
  readonly hitAccumulator: number;
  readonly deltaIncrements: number;
  readonly crossedZeroOrPositive: boolean;
  readonly flippedToPositive: boolean;
  readonly ricochet: boolean;
  readonly ringProgress: number;
}

export const MAX_ADD_GATE_VALUE = 99;
export const MAX_SHOOTABLE_MUL_VALUE = 99.9;
export const POSITIVE_GATE_RESISTANCE_SLOPE = 0.16;
export const MUL_GATE_RESISTANCE_SLOPE = 0.14;

export const SPLIT_SPAN_MIN_X = -4.88;
export const SPLIT_SPAN_MAX_X = 4.88;
export const MIN_SPLIT_GATE_RATIO = 0.22;
export const MAX_SPLIT_GATE_RATIO = 0.78;

/**
 * Computes the visual/physical territorial weight of a single gate in a split pair based on magnitude:
 * - Pumping a positive gate (+2 -> +10, or X1.0 -> X3.5) increases its weight and expands its width.
 * - Shooting down a negative gate (-10 -> -2 -> 0) reduces its magnitude weight and shrinks its width.
 */
export function computeGateVisualWeight(
  operator: GateOperator,
  value: number,
  isLocked: boolean
): number {
  let effectiveMag = Math.abs(value);
  if (operator === 'MUL') {
    effectiveMag = isLocked ? Math.max(1, value * 2.5) : Math.max(0, (value - 1.0) * 8.0);
  } else if (operator === 'DIV') {
    effectiveMag = Math.max(1, value * 2.5);
  }
  return 2.0 + Math.pow(effectiveMag, 0.85) * 1.25;
}

/**
 * Returns the fraction [0.22 .. 0.78] of the total bridge span occupied by the LEFT gate
 * in a split gate pair.
 */
export function computeSplitGateRatio(
  leftOp: GateOperator,
  leftVal: number,
  leftLocked: boolean,
  rightOp: GateOperator,
  rightVal: number,
  rightLocked: boolean
): number {
  const wL = computeGateVisualWeight(leftOp, leftVal, leftLocked);
  const wR = computeGateVisualWeight(rightOp, rightVal, rightLocked);
  const raw = wL / Math.max(0.0001, wL + wR);
  return Math.max(MIN_SPLIT_GATE_RATIO, Math.min(MAX_SPLIT_GATE_RATIO, raw));
}

/**
 * Computes damage required for the next +1 increment on a shootable ADD gate
 * or the next +0.1 increment on a shootable fractional MUL gate (X1 -> X1.7 -> X3.5+).
 * Uses smooth convex resistance so gates never hit an artificial 2.2x/+8 wall while scaling
 * gracefully across early and maxed-out squads.
 */
export function computeGateStepThreshold(
  baseDamagePerIncrement: number,
  currentValue: number,
  operator: GateOperator = 'ADD'
): number {
  if (operator === 'MUL') {
    const tenthsAboveOne = Math.max(0, Math.round((currentValue - 1.0) * 10));
    return (
      baseDamagePerIncrement *
      (1 +
        tenthsAboveOne * MUL_GATE_RESISTANCE_SLOPE +
        tenthsAboveOne * tenthsAboveOne * 0.005)
    );
  }
  if (currentValue < 0) {
    return baseDamagePerIncrement;
  }
  return (
    baseDamagePerIncrement *
    (1 +
      currentValue * POSITIVE_GATE_RESISTANCE_SLOPE +
      currentValue * currentValue * 0.018)
  );
}

/**
 * Applies incoming projectile damage to a gate:
 * - Shootable ADD gates increment by +1 (+2 -> +10 -> +25+ up to safety bound 99).
 * - Shootable fractional MUL gates increment by +0.1 without an artificial 2.2x cap (X1.0 -> X2.5 -> X5.0+).
 * - Locked MUL/DIV gates ignore projectile damage and signal a metallic ricochet.
 */
export function applyGateBulletHit(state: GateHitState, bulletDamage: number): GateHitOutcome {
  if (state.isLocked || state.operator === 'DIV' || state.damagePerIncrement <= 0 || bulletDamage <= 0) {
    return {
      value: state.value,
      hitAccumulator: state.hitAccumulator,
      deltaIncrements: 0,
      crossedZeroOrPositive: false,
      flippedToPositive: false,
      ricochet: state.isLocked,
      ringProgress: 0,
    };
  }

  // Shootable Fractional Multiplier Gate (X1.0 -> X3.5+ in +0.1 steps)
  if (state.operator === 'MUL') {
    const startTenths = Math.round(state.value * 10);
    const maxTenths = Math.round(MAX_SHOOTABLE_MUL_VALUE * 10);
    if (startTenths >= maxTenths) {
      return {
        value: MAX_SHOOTABLE_MUL_VALUE,
        hitAccumulator: 0,
        deltaIncrements: 0,
        crossedZeroOrPositive: false,
        flippedToPositive: false,
        ricochet: false,
        ringProgress: 0.999,
      };
    }

    let curTenths = startTenths;
    let acc = state.hitAccumulator + bulletDamage;
    let deltaSteps = 0;

    while (curTenths < maxTenths) {
      const stepCost = computeGateStepThreshold(
        state.damagePerIncrement,
        curTenths / 10,
        'MUL'
      );
      if (acc + 1e-9 < stepCost) {
        break;
      }
      acc = Math.max(0, acc - stepCost);
      curTenths += 1;
      deltaSteps += 1;
    }

    if (curTenths >= maxTenths) {
      acc = 0;
    }

    const nextVal = curTenths / 10;
    const nextThreshold = computeGateStepThreshold(state.damagePerIncrement, nextVal, 'MUL');
    // Crossing X1.5 is the key threshold where 1 solo commando rounds up to 2 commandos!
    const flippedMilestone = startTenths < 15 && curTenths >= 15;

    return {
      value: nextVal,
      hitAccumulator: acc,
      deltaIncrements: deltaSteps,
      crossedZeroOrPositive: flippedMilestone,
      flippedToPositive: flippedMilestone,
      ricochet: false,
      ringProgress:
        curTenths >= maxTenths
          ? 0.999
          : Math.min(0.999, Math.max(0, acc / nextThreshold)),
    };
  }

  // Shootable ADD Gate
  if (state.value >= MAX_ADD_GATE_VALUE) {
    return {
      value: state.value,
      hitAccumulator: 0,
      deltaIncrements: 0,
      crossedZeroOrPositive: false,
      flippedToPositive: false,
      ricochet: false,
      ringProgress: 0.999,
    };
  }

  let curValue = state.value;
  let acc = state.hitAccumulator + bulletDamage;
  let deltaIncrements = 0;

  while (curValue < MAX_ADD_GATE_VALUE) {
    const stepThreshold = computeGateStepThreshold(state.damagePerIncrement, curValue, 'ADD');
    if (acc + 1e-9 < stepThreshold) {
      break;
    }
    acc = Math.max(0, acc - stepThreshold);
    curValue += 1;
    deltaIncrements += 1;
  }

  if (curValue >= MAX_ADD_GATE_VALUE) {
    acc = 0;
  }

  const nextThreshold = computeGateStepThreshold(state.damagePerIncrement, curValue, 'ADD');
  const crossedZeroOrPositive = state.value < 0 && curValue >= 0;
  const flippedToPositive = state.value <= 0 && curValue > 0;

  return {
    value: curValue,
    hitAccumulator: acc,
    deltaIncrements,
    crossedZeroOrPositive,
    flippedToPositive,
    ricochet: false,
    ringProgress:
      curValue >= MAX_ADD_GATE_VALUE
        ? 0.999
        : Math.min(0.999, Math.max(0, acc / nextThreshold)),
  };
}

/**
 * Resolves the new elite squad count when passing through a gate.
 * Fractional MUL gates round cleanly (e.g., 1 commando * X1.7 => 2 commandos!).
 */
export function resolveGateSquadCount(
  currentSquad: number,
  operator: GateOperator,
  value: number,
  maxLogicalSquad = MAX_SQUAD_COUNT
): number {
  if (currentSquad <= 0) {
    return 0;
  }

  let next = currentSquad;
  switch (operator) {
    case 'ADD':
      next = currentSquad + Math.round(value);
      break;
    case 'MUL':
      next = Math.round(currentSquad * Math.max(1, value));
      break;
    case 'DIV': {
      const divisor = Math.max(1, value);
      next = Math.max(1, Math.floor(currentSquad / divisor));
      break;
    }
  }

  return Math.min(maxLogicalSquad, Math.max(0, next));
}

/**
 * Formats a gate's operator and value into a high-contrast label string (+2, -28, X1, X1.7, x2, ÷2).
 */
export function formatGateLabel(
  operator: GateOperator,
  value: number,
  isLocked = true
): string {
  if (operator === 'MUL') {
    if (!isLocked) {
      const tenths = Math.round(value * 10) / 10;
      return Number.isInteger(tenths) ? `X${tenths.toFixed(0)}` : `X${tenths.toFixed(1)}`;
    }
    return `x${Math.round(value)}`;
  }
  if (operator === 'DIV') {
    return `÷${Math.round(value)}`;
  }
  const rounded = Math.round(value);
  return rounded >= 0 ? `+${rounded}` : `${rounded}`;
}
