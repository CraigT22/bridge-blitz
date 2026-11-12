import type { GateOperator } from '../core/types';

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

export const MAX_ADD_GATE_VALUE = 30;
export const POSITIVE_GATE_RESISTANCE_SLOPE = 0.22;

/**
 * Computes damage required for the next +1 increment on a shootable ADD gate:
 * - Negative values (< 0) use 1.0x base threshold so flipping red gates to blue feels responsive.
 * - Non-negative values (>= 0) require progressively more damage per +1 to prevent +200 runaway snowballs.
 */
export function computeGateStepThreshold(
  baseDamagePerIncrement: number,
  currentValue: number
): number {
  if (currentValue < 0) {
    return baseDamagePerIncrement;
  }
  return baseDamagePerIncrement * (1 + currentValue * POSITIVE_GATE_RESISTANCE_SLOPE);
}

/**
 * Applies incoming projectile damage to a gate.
 * - Shootable ADD gates accumulate damage with progressive resistance above 0 up to MAX_ADD_GATE_VALUE (+30).
 * - Locked MUL/DIV gates ignore projectile damage and signal a metallic ricochet.
 */
export function applyGateBulletHit(state: GateHitState, bulletDamage: number): GateHitOutcome {
  if (state.isLocked || state.operator !== 'ADD' || state.damagePerIncrement <= 0 || bulletDamage <= 0) {
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
    const stepThreshold = computeGateStepThreshold(state.damagePerIncrement, curValue);
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

  const nextThreshold = computeGateStepThreshold(state.damagePerIncrement, curValue);
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
 * Resolves the new logical squad count when passing through a gate.
 * Logical squad count can scale past 9,999+ and clamps cleanly at 0 on lethal negative gates.
 */
export function resolveGateSquadCount(
  currentSquad: number,
  operator: GateOperator,
  value: number,
  maxLogicalSquad = 99999
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
      next = Math.floor(currentSquad * Math.max(1, value));
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
 * Formats a gate's operator and value into a high-contrast label string (+10, -25, x3, ÷2).
 */
export function formatGateLabel(operator: GateOperator, value: number): string {
  if (operator === 'MUL') {
    return `x${Math.round(value)}`;
  }
  if (operator === 'DIV') {
    return `÷${Math.round(value)}`;
  }
  const rounded = Math.round(value);
  return rounded >= 0 ? `+${rounded}` : `${rounded}`;
}
