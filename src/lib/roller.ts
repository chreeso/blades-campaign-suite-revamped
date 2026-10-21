import { RollPosition, RollEffect, RollResult } from '@/types/blades';

function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function effectToTicks(effect: RollEffect): number {
  switch (effect) {
    case 'Great':
      return 3;
    case 'Standard':
      return 2;
    case 'Limited':
      return 1;
    case 'None':
    default:
      return 0;
  }
}

export function resolveActionRoll(
  dicePool: number,
  position: RollPosition,
  effect: RollEffect
): RollResult {
  const isZeroDice = dicePool <= 0;
  const diceCount = isZeroDice ? 2 : dicePool;
  const dice = Array.from({ length: diceCount }, () => rollD6());

  if (isZeroDice) {
    const chosenDie = Math.min(...dice);
    const outcome =
      chosenDie === 6
        ? 'full_success'
        : chosenDie >= 4
        ? 'partial_success'
        : 'bad_outcome';

    const ticks = outcome === 'bad_outcome' ? 0 : effectToTicks(effect);

    return {
      dice,
      chosenDie,
      isZeroDice: true,
      isCritical: false,
      outcome,
      ticks,
      narrative: getNarrative(outcome, position, false)
    };
  }

  // dicePool >= 1
  const sixCount = dice.filter((d) => d === 6).length;
  const isCritical = sixCount >= 2;
  const chosenDie = Math.max(...dice);

  let outcome: RollResult['outcome'] = 'bad_outcome';
  if (isCritical) {
    outcome = 'critical';
  } else if (chosenDie === 6) {
    outcome = 'full_success';
  } else if (chosenDie >= 4) {
    outcome = 'partial_success';
  }

  // Critical enhances effect by +1 tick (up to 4 ticks or great effect)
  const baseTicks = effectToTicks(effect);
  const ticks = isCritical ? Math.min(4, baseTicks + 1) : outcome === 'bad_outcome' ? 0 : baseTicks;

  return {
    dice,
    chosenDie,
    isZeroDice: false,
    isCritical,
    outcome,
    ticks,
    narrative: getNarrative(outcome, position, isCritical)
  };
}

export function resolveResistanceRoll(attributePool: number): RollResult {
  const isZeroDice = attributePool <= 0;
  const diceCount = isZeroDice ? 2 : attributePool;
  const dice = Array.from({ length: diceCount }, () => rollD6());

  if (isZeroDice) {
    const chosenDie = Math.min(...dice);
    const stressCost = Math.max(0, 6 - chosenDie);
    return {
      dice,
      chosenDie,
      isZeroDice: true,
      isCritical: false,
      outcome: chosenDie === 6 ? 'full_success' : 'partial_success',
      ticks: 0,
      stressCost,
      narrative: `0-dice resistance roll (took lowest die ${chosenDie}). You suffer ${stressCost} stress.`
    };
  }

  const sixCount = dice.filter((d) => d === 6).length;
  const isCritical = sixCount >= 2;
  const chosenDie = Math.max(...dice);

  if (isCritical) {
    return {
      dice,
      chosenDie,
      isZeroDice: false,
      isCritical: true,
      outcome: 'critical',
      ticks: 0,
      stressCost: -1, // Clears 1 stress!
      narrative: 'CRITICAL RESISTANCE! You negate the consequence completely and CLEAR 1 stress!'
    };
  }

  const stressCost = Math.max(0, 6 - chosenDie);
  return {
    dice,
    chosenDie,
    isZeroDice: false,
    isCritical: false,
    outcome: chosenDie === 6 ? 'full_success' : 'partial_success',
    ticks: 0,
    stressCost,
    narrative: `Resisted consequence. Suffer ${stressCost} stress (6 - ${chosenDie}).`
  };
}

function getNarrative(
  outcome: RollResult['outcome'],
  position: RollPosition,
  isCritical: boolean
): string {
  if (isCritical) {
    return 'CRITICAL SUCCESS! You accomplish your goal with extreme impact and additional advantage.';
  }

  switch (outcome) {
    case 'full_success':
      return 'FULL SUCCESS: You accomplish what you set out to do without negative consequence.';
    case 'partial_success':
      if (position === 'Controlled') {
        return 'PARTIAL SUCCESS (Controlled): You achieve your goal, but suffer a minor complication, minor cost, or reduced effect.';
      }
      if (position === 'Risky') {
        return 'PARTIAL SUCCESS (Risky): You achieve your goal, but suffer a standard consequence (harm, +2 heat, clock tick, or reduced effect).';
      }
      return 'PARTIAL SUCCESS (Desperate): You accomplish your goal, but suffer a severe consequence (severe harm, catastrophic trouble).';
    case 'bad_outcome':
    default:
      if (position === 'Controlled') {
        return 'BAD OUTCOME (Controlled): You falter, but because you acted from a controlled position, you can withdraw or try another approach with minor cost.';
      }
      if (position === 'Risky') {
        return 'BAD OUTCOME (Risky): The action fails or hits serious complications. Suffer standard consequence.';
      }
      return 'BAD OUTCOME (Desperate): Catastrophic setback. Suffer severe harm or devastating obstacle advance.';
  }
}
