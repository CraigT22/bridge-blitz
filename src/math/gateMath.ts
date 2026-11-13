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
export const POSITIVE_GATE_RESISTANCE_SLOPE = 0.14;
export const MUL_GATE_RESISTANCE_SLOPE = 0.13;

export const SPLIT_SPAN_MIN_X = -4.88;
export const SPLIT_SPAN_MAX_X = 4.88;
export const MIN_SPLIT_GATE_RATIO = 0.22;
export const MAX_SPLIT_GATE_RATIO = 0.78;

/**
 * Computes positive-weighted territorial width weight for a single gate in a split pair:
 * - Positive ADD values carry ~3x the width slope of negative magnitude (+21 | -21 => ~71% blue / 29% red!).
 * - Pumping a positive gate (+2 -> +10 -> +21, or X1.0 -> X3.5) expands its width across the bridge.
 * - Shooting down a negative gate (-41 -> -21 -> -2 -> 0, or X0.05 -> X0.95) shrinks its negative width!
 */
export function computeGateVisualWeight(
  operator: GateOperator,
  value: number,
  isLocked: boolean
): number {
  if (operator === 'MUL') {
    if (isLocked) {
      return 16 + Math.max(1, value) * 9.0;
    }
    if (value >= 1.0) {
      return 16 + (value - 1.0) * 20.0;
    }
    return 16 + (1.0 - value) * 14.0;
  }
  if (operator === 'DIV') {
    return 16 + Math.max(1, value) * 8.0;
  }
  if (value >= 0) {
    return 16 + value * 2.55;
  }
  return 16 + Math.abs(value) * 0.68;
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
 * Computes damage required for the next increment on a shootable ADD or MUL gate:
 * - Below 0 (ADD) or below 1.00 (penalty MUL like X0.05 -> X1.00), flat 1.0x threshold lets players
 *   rescue red penalty gates cleanly under sustained fire.
 * - Above 0 (ADD) or >= 1.00 (MUL), smooth convex progressive resistance prevents runaway infinity
 *   without imposing an artificial 2.2x or +8 wall.
 */
export function computeGateStepThreshold(
  baseDamagePerIncrement: number,
  currentValue: number,
  operator: GateOperator = 'ADD'
): number {
  if (operator === 'MUL') {
    if (currentValue < 1.0 - 1e-6) {
      return baseDamagePerIncrement;
    }
    const tenthsAboveOne = Math.max(0, Math.round((currentValue - 1.0) * 10));
    return (
      baseDamagePerIncrement *
      (1 +
        tenthsAboveOne * MUL_GATE_RESISTANCE_SLOPE +
        tenthsAboveOne * tenthsAboveOne * 0.0045)
    );
  }
  if (currentValue < 0) {
    return baseDamagePerIncrement;
  }
  return (
    baseDamagePerIncrement *
    (1 +
      currentValue * POSITIVE_GATE_RESISTANCE_SLOPE +
      currentValue * currentValue * 0.015)
  );
}

/**
 * Applies incoming projectile damage to a gate:
 * - Shootable ADD gates increment by +1 (-41 -> 0 -> +21+ up to safety bound 99).
 * - Shootable MUL gates below 1.00 (red penalty gates like X0.05) step in +0.05 increments up to X1.00
 *   (flipping cyan on crossing X1.00!), then step in +0.10 increments freely past X3.5+.
 * - Locked MUL/DIV gates ignore projectile damage and signal a metallic ricochet.
 */
export function applyGateBulletHit(state: GateHitState, bulletDamage: number): GateHitOutcome {
  if (
    state.isLocked ||
    state.operator === 'DIV' ||
    state.damagePerIncrement <= 0 ||
    bulletDamage <= 0
  ) {
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

  // Shootable Fractional Multiplier Gate (supports < X1.00 red penalty gates & >= X1.00 cyan gates!)
  if (state.operator === 'MUL') {
    const startVigintiles = Math.max(1, Math.round(state.value * 20)); // units of 0.05
    const maxVigintiles = Math.round(MAX_SHOOTABLE_MUL_VALUE * 20);
    if (startVigintiles >= maxVigintiles) {
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

    let curVig = startVigintiles;
    let acc = state.hitAccumulator + bulletDamage;
    let deltaSteps = 0;

    while (curVig < maxVigintiles) {
      const curVal = curVig / 20;
      const stepCost = computeGateStepThreshold(state.damagePerIncrement, curVal, 'MUL');
      if (acc + 1e-9 < stepCost) {
        break;
      }
      acc = Math.max(0, acc - stepCost);
      // Step by +0.05 below 1.00 (or if aligning an odd 0.05), and by +0.10 once >= 1.00!
      if (curVig < 20 || curVig % 2 !== 0) {
        curVig += 1;
      } else {
        curVig += 2;
      }
      deltaSteps += 1;
    }

    if (curVig >= maxVigintiles) {
      curVig = maxVigintiles;
      acc = 0;
    }

    const nextVal = curVig / 20;
    const nextThreshold = computeGateStepThreshold(state.damagePerIncrement, nextVal, 'MUL');
    const rescuedSubOne = startVigintiles < 20 && curVig >= 20;
    const crossedOnePointFive = startVigintiles >= 20 && startVigintiles < 30 && curVig >= 30;
    const flippedMilestone = rescuedSubOne || crossedOnePointFive;

    return {
      value: nextVal,
      hitAccumulator: acc,
      deltaIncrements: deltaSteps,
      crossedZeroOrPositive: flippedMilestone,
      flippedToPositive: flippedMilestone,
      ricochet: false,
      ringProgress:
        curVig >= maxVigintiles
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
 * Resolves the new squad count when passing through a gate:
 * - Red < X1.00 penalty multipliers (e.g. X0.05, X0.60) slash the squad via Math.floor (can wipe out small squads!).
 * - Cyan >= X1.00 multipliers scale and round cleanly (1 * X1.7 => 2, 10 * X3.5 => 35!).
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
      if (value < 1.0 - 1e-6) {
        next = Math.floor(currentSquad * Math.max(0, value));
      } else {
        next = Math.round(currentSquad * value);
      }
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
 * Returns true if a gate currently imposes a negative squad penalty (red curtain & red side posts!).
 */
export function isNegativeGateState(
  operator: GateOperator,
  value: number,
  _isLocked = false
): boolean {
  if (operator === 'DIV') {
    return true;
  }
  if (operator === 'MUL') {
    return value < 1.0 - 1e-6;
  }
  return value < 0;
}

/**
 * Formats a gate's operator and value into a crisp arcade label:
 * - < X1.00 shootable multipliers show 2 decimals (X0.05, X0.60, X0.65)
 * - >= X1.00 shootable multipliers show 1 decimal (X1.0, X1.1, X3.5) or 2 if on an odd 0.05 step
 */
export function formatGateLabel(
  operator: GateOperator,
  value: number,
  isLocked = true
): string {
  if (operator === 'MUL') {
    if (!isLocked) {
      const vig = Math.round(value * 20);
      if (vig < 20 || vig % 2 !== 0) {
        return `X${(vig / 20).toFixed(2)}`;
      }
      const tenths = vig / 20;
      return `X${tenths.toFixed(1)}`;
    }
    if (Math.abs(value - Math.round(value)) > 0.01) {
      return `X${value.toFixed(1)}`;
    }
    return `X${Math.round(value)}`;
  }
  if (operator === 'DIV') {
    return `÷${Math.round(value)}`;
  }
  const rounded = Math.round(value);
  return rounded >= 0 ? `+${rounded}` : `${rounded}`;
}
