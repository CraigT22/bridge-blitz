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

/**
 * Applies incoming projectile damage to a gate.
 * - Shootable ADD gates accumulate damage and increase displayed integer by +1 every K damage.
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

  const threshold = state.damagePerIncrement;
  const totalAccumulated = state.hitAccumulator + bulletDamage;
  const deltaIncrements = Math.floor(totalAccumulated / threshold);
  const remainder = totalAccumulated - deltaIncrements * threshold;
  const nextValue = state.value + deltaIncrements;

  const crossedZeroOrPositive = state.value < 0 && nextValue >= 0;
  const flippedToPositive = state.value <= 0 && nextValue > 0;

  return {
    value: nextValue,
    hitAccumulator: remainder,
    deltaIncrements,
    crossedZeroOrPositive,
    flippedToPositive,
    ricochet: false,
    ringProgress: Math.min(0.999, Math.max(0, remainder / threshold)),
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
