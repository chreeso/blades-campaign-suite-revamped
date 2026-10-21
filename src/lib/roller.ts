import {
  RollPosition,
  RollEffect,
  RollResult,
  OperationPlanType,
  EngagementRollFactors,
  EngagementRollResult,
  GroupActionResult,
  GroupParticipantRoll,
  IncarcerationOutcome
} from '@/types/blades';

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

export const OPERATION_PLANS: Record<
  OperationPlanType,
  { name: string; detailPrompt: string; description: string; example: string }
> = {
  Assault: {
    name: 'Assault',
    detailPrompt: 'The point of attack',
    description: 'Direct, violent force to seize, breach, or destroy a target.',
    example: 'E.g., "The rear service gates of the warehouse."'
  },
  Deception: {
    name: 'Deception',
    detailPrompt: 'The method of deception',
    description: 'Tricking, bluffing, forging, or luring the target.',
    example: 'E.g., "Posing as City Watch inspectors bearing forged quarantine warrants."'
  },
  Stealth: {
    name: 'Stealth',
    detailPrompt: 'The point of infiltration',
    description: 'Quiet, unseen trespass, burglary, or covert extraction.',
    example: 'E.g., "The rooftop skylight over the records vault."'
  },
  Occult: {
    name: 'Occult',
    detailPrompt: 'The arcane power or ritual source',
    description: 'Harnessing spirits, lightning-oil artifacts, rituals, or ghost-field echoes.',
    example: 'E.g., "A siphon vessel containing the drowned soul of the former dockmaster."'
  },
  Social: {
    name: 'Social',
    detailPrompt: 'The social connection or pretext',
    description: 'Negotiation, persuasion, seduction, blackmail, or party crashing.',
    example: 'E.g., "A formal invitation to Lord Strangford’s masquerade."'
  },
  Transport: {
    name: 'Transport',
    detailPrompt: 'The route and means of travel',
    description: 'Smuggling, conveyance, canal chases, or escaping through the Deathlands.',
    example: 'E.g., "A muffled canal skiff slipping beneath the Silkshore toll bridge."'
  }
};

export function calculateEngagementDicePool(factors: EngagementRollFactors): {
  baseDice: number;
  advantages: number;
  disadvantages: number;
  finalDicePool: number;
} {
  const baseDice = 1; // 1d for sheer luck
  let advantages = 0;
  let disadvantages = 0;

  // Tier difference
  const tierDelta = factors.crewTier - factors.targetTier;
  if (tierDelta > 0) {
    advantages += tierDelta;
  } else if (tierDelta < 0) {
    disadvantages += Math.abs(tierDelta);
  }

  // Advantages
  if (factors.isBold) advantages += 1;
  if (factors.exposesVulnerability) advantages += 1;
  if (factors.contactAssistance) advantages += 1;
  if (factors.priorSetup) advantages += 1;

  // Disadvantages
  if (factors.isTargetFortified) disadvantages += 1;
  if (factors.isHostileDistrict) disadvantages += 1;
  if (factors.inclementWeather) disadvantages += 1;

  const finalDicePool = baseDice + advantages - disadvantages;

  return {
    baseDice,
    advantages,
    disadvantages,
    finalDicePool
  };
}

export function resolveEngagementRoll(factors: EngagementRollFactors): EngagementRollResult {
  const { finalDicePool } = calculateEngagementDicePool(factors);
  const isZeroDice = finalDicePool <= 0;
  const diceCount = isZeroDice ? 2 : finalDicePool;
  const dice = Array.from({ length: diceCount }, () => rollD6());

  if (isZeroDice) {
    const chosenDie = Math.min(...dice);
    let outcome: EngagementRollResult['outcome'] = 'bad_outcome';
    let startingPosition: RollPosition = 'Desperate';

    if (chosenDie === 6) {
      outcome = 'full_success';
      startingPosition = 'Controlled';
    } else if (chosenDie >= 4) {
      outcome = 'partial_success';
      startingPosition = 'Risky';
    } else {
      outcome = 'bad_outcome';
      startingPosition = 'Desperate';
    }

    return {
      dice,
      chosenDie,
      isZeroDice: true,
      isCritical: false,
      startingPosition,
      outcome,
      finalDicePool,
      factors,
      narrative: getEngagementNarrative(outcome, startingPosition, false, true),
      initialObstaclePrompt: getInitialObstaclePrompt(startingPosition, factors.planType)
    };
  }

  const sixCount = dice.filter((d) => d === 6).length;
  const isCritical = sixCount >= 2;
  const chosenDie = Math.max(...dice);

  let outcome: EngagementRollResult['outcome'] = 'bad_outcome';
  let startingPosition: RollPosition = 'Desperate';

  if (isCritical) {
    outcome = 'critical';
    startingPosition = 'Controlled';
  } else if (chosenDie === 6) {
    outcome = 'full_success';
    startingPosition = 'Controlled';
  } else if (chosenDie >= 4) {
    outcome = 'partial_success';
    startingPosition = 'Risky';
  } else {
    outcome = 'bad_outcome';
    startingPosition = 'Desperate';
  }

  return {
    dice,
    chosenDie,
    isZeroDice: false,
    isCritical,
    startingPosition,
    outcome,
    finalDicePool,
    factors,
    narrative: getEngagementNarrative(outcome, startingPosition, isCritical, false),
    initialObstaclePrompt: getInitialObstaclePrompt(startingPosition, factors.planType, isCritical)
  };
}

function getEngagementNarrative(
  outcome: EngagementRollResult['outcome'],
  position: RollPosition,
  isCritical: boolean,
  isZeroDice: boolean
): string {
  if (isCritical) {
    return 'CRITICAL SUCCESS: Exceptional start! The scoundrels have already overcome the first obstacle and encounter the next situation in a CONTROLLED position with significant leverage.';
  }

  switch (outcome) {
    case 'full_success':
      return `FULL SUCCESS: Good start! The scoundrels slip past initial hazards and encounter the first obstacle from a CONTROLLED position.${
        isZeroDice ? ' (0-dice luck!)' : ''
      }`;
    case 'partial_success':
      return `PARTIAL SUCCESS: Mixed start! The scoundrels encounter the first obstacle in a standard RISKY position with potential complications looming.${
        isZeroDice ? ' (0-dice luck!)' : ''
      }`;
    case 'bad_outcome':
    default:
      return `BAD OUTCOME: Bad start! The operation immediately hits trouble. The scoundrels face the first obstacle from a DESPERATE position!${
        isZeroDice ? ' (Took lowest of 2 dice)' : ''
      }`;
  }
}

function getInitialObstaclePrompt(
  position: RollPosition,
  planType: OperationPlanType,
  isCritical: boolean = false
): string {
  if (isCritical) {
    return `First obstacle bypassed! The crew is already past perimeter sentries/locks through brilliant ${planType.toLowerCase()} execution and holds the high ground.`;
  }
  switch (position) {
    case 'Controlled':
      return `Crew has the initiative and an advantageous stance. First ${planType.toLowerCase()} obstacle can be approached deliberately.`;
    case 'Risky':
      return `Standard confrontation. The crew and the obstacle meet on equal footing under pressure.`;
    case 'Desperate':
      return `Immediate crisis! Ambush, surprise alarm, trapped passage, or overwhelming opposition right out of the gate.`;
  }
}

export function resolveGroupActionRoll(
  leader: { id: string; name: string; dots: number },
  members: { id: string; name: string; dots: number }[],
  position: RollPosition,
  effect: RollEffect
): GroupActionResult {
  const allParticipants = [
    { ...leader, isLeader: true },
    ...members.map((m) => ({ ...m, isLeader: false }))
  ];

  const participantRolls: GroupParticipantRoll[] = allParticipants.map((p) => {
    const isZero = p.dots <= 0;
    const count = isZero ? 2 : p.dots;
    const dice = Array.from({ length: count }, () => rollD6());
    const chosenDie = isZero ? Math.min(...dice) : Math.max(...dice);
    const sixCount = dice.filter((d) => d === 6).length;
    const isCrit = !isZero && sixCount >= 2;

    let outcome: RollResult['outcome'] = 'bad_outcome';
    if (isCrit) outcome = 'critical';
    else if (chosenDie === 6) outcome = 'full_success';
    else if (chosenDie >= 4) outcome = 'partial_success';

    return {
      characterId: p.id,
      characterName: p.name,
      dots: p.dots,
      dice,
      chosenDie,
      outcome,
      isZeroDice: isZero,
      isLeader: p.isLeader,
      failed: chosenDie <= 3
    };
  });

  // Leader takes 1 stress per non-leader member who rolled 1-3
  const leaderStressCost = participantRolls
    .filter((pr) => !pr.isLeader && pr.failed)
    .length;

  // Best result rolled among all participants (RAW p. 134)
  const hasCritical = participantRolls.some((pr) => pr.outcome === 'critical');
  const hasFullSuccess = participantRolls.some((pr) => pr.outcome === 'full_success');
  const hasPartial = participantRolls.some((pr) => pr.outcome === 'partial_success');

  let bestOutcome: RollResult['outcome'] = 'bad_outcome';
  if (hasCritical) bestOutcome = 'critical';
  else if (hasFullSuccess) bestOutcome = 'full_success';
  else if (hasPartial) bestOutcome = 'partial_success';

  const bestDie = Math.max(...participantRolls.map((pr) => pr.chosenDie));
  const baseTicks = effectToTicks(effect);
  const overallTicks =
    bestOutcome === 'critical'
      ? Math.min(4, baseTicks + 1)
      : bestOutcome === 'bad_outcome'
      ? 0
      : baseTicks;

  const narrative =
    bestOutcome === 'critical'
      ? `GROUP CRITICAL! Coordinated masterclass led by ${leader.name}. Goal achieved with exceptional effect.`
      : bestOutcome === 'full_success'
      ? `GROUP SUCCESS! The team executes cleanly together under ${leader.name}'s direction.`
      : bestOutcome === 'partial_success'
      ? `GROUP PARTIAL SUCCESS: The team pulls through, but complications or costs arise.`
      : `GROUP BAD OUTCOME: The team falters across the board. Catastrophic group consequence!`;

  return {
    leaderId: leader.id,
    leaderName: leader.name,
    leaderStressCost,
    bestOutcome,
    bestDie,
    isCritical: hasCritical,
    overallTicks,
    narrative,
    participantRolls
  };
}

export function resolveIncarcerationRoll(
  wantedLevel: number,
  modifierDice: number = 0
): IncarcerationOutcome {
  const dicePool = wantedLevel + modifierDice;
  const isZero = dicePool <= 0;
  const count = isZero ? 2 : dicePool;
  const dice = Array.from({ length: count }, () => rollD6());
  const chosenDie = isZero ? Math.min(...dice) : Math.max(...dice);
  const sixCount = dice.filter((d) => d === 6).length;
  const isCritical = !isZero && sixCount >= 2;

  if (isCritical) {
    return {
      dice,
      chosenDie,
      isZeroDice: false,
      isCritical: true,
      outcome: 'critical',
      title: 'Ironhook Kingpin / Prison Claim Unlocked',
      narrative: 'You establish dominance or cultivate deep leverage inside Ironhook. Claim 1 Prison Claim or +1 Status with an Ironhook faction.',
      suggestedConsequences: [
        'Claim Prison Turf or Underworld Inmate Network',
        '+1 Faction Standing with Ironhook Inmates or Corrupt Guards',
        'Sentence served with zero bodily harm'
      ],
      prisonClaimsAvailable: [
        'Hardknocks (+1d Skirmish/Command with convicts)',
        'The Informant Network (+1d Gather Info regarding prison)',
        'Infirmary Orderly (Access to healing/physicker behind bars)',
        'Yard Boss (+1 Scale when rallying convicts)',
        'Smuggling Tunnel (Move contraband across the lightning barriers)'
      ]
    };
  }

  if (chosenDie === 6) {
    return {
      dice,
      chosenDie,
      isZeroDice: isZero,
      isCritical: false,
      outcome: 'full_success',
      title: 'Clean Time',
      narrative: 'You serve your sentence without incident. Your underworld reputation is respected behind bars.',
      suggestedConsequences: [
        'Sentence completed cleanly',
        'No physical trauma or extra coin loss',
        'Crew Wanted level reduced by 1, Heat purged'
      ]
    };
  }

  if (chosenDie >= 4) {
    return {
      dice,
      chosenDie,
      isZeroDice: isZero,
      isCritical: false,
      outcome: 'partial_success',
      title: 'Hard Time (Standard Consequence)',
      narrative: 'Ironhook takes its toll. The guards or rival inmates demand tribute or exact punishment.',
      suggestedConsequences: [
        'Suffer Level 2 Harm ("Beaten & Bruised in the Yard")',
        'Lose 1 Coin or 2 Stash in protection payoffs',
        '-1 Status with a rival prison gang'
      ]
    };
  }

  return {
    dice,
    chosenDie,
    isZeroDice: isZero,
    isCritical: false,
    outcome: 'bad_outcome',
    title: 'Brutal Lockup (Catastrophic Sentence)',
    narrative: 'The Ironhook cells break the spirit. You are targeted in the yard, thrown into solitary confinement, or your sentence is prolonged.',
    suggestedConsequences: [
      'Suffer Level 3 Harm ("Maimed in the Yard")',
      'Gain 1 Trauma condition (Cold, Reckless, or Soft)',
      '+1 Year / Extended Sentence before release'
    ]
  };
}
