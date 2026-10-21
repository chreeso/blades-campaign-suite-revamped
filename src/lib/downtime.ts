import { ENTANGLEMENTS_TABLE, EntanglementInfo } from './constants/entanglements';
import { HarmState } from '@/types/blades';

export type ScoreScale = 'minor' | 'standard' | 'major' | 'spectacular';

export interface PayoffResult {
  coin: number;
  rep: number;
  tithe: number;
  netCoin: number;
}

export function calculatePayoff(
  crewTier: number,
  targetTier: number,
  scale: ScoreScale,
  customCoin?: number,
  tithe: number = 0
): PayoffResult {
  let coin = 6;
  if (customCoin !== undefined) {
    coin = customCoin;
  } else {
    switch (scale) {
      case 'minor':
        coin = 2;
        break;
      case 'standard':
        coin = 6;
        break;
      case 'major':
        coin = 8;
        break;
      case 'spectacular':
        coin = 10;
        break;
    }
  }

  let rep = 2;
  if (targetTier > crewTier) {
    rep = 2 + (targetTier - crewTier);
  } else if (targetTier < crewTier) {
    rep = 1;
  } else {
    rep = 2;
  }

  const netCoin = Math.max(0, coin - tithe);

  return {
    coin,
    rep,
    tithe,
    netCoin
  };
}

export interface HeatCalculationResult {
  baseHeat: number;
  killingModifier: number;
  districtModifier: number;
  totalAddedHeat: number;
  newHeat: number;
  newWantedLevel: number;
  wantedLevelRolledOver: boolean;
}

export function calculateHeatRollover(
  currentHeat: number,
  currentWanted: number,
  baseHeat: number,
  anyoneKilled: boolean,
  districtAlert: number = 0
): HeatCalculationResult {
  const killingModifier = anyoneKilled ? 2 : 0;
  const districtModifier = districtAlert;
  const totalAddedHeat = baseHeat + killingModifier + districtModifier;

  const totalHeat = currentHeat + totalAddedHeat;
  let newWanted = currentWanted;
  let newHeat = totalHeat;

  if (totalHeat >= 9) {
    const additionalWanted = Math.floor(totalHeat / 9);
    newWanted = Math.min(4, currentWanted + additionalWanted);
    newHeat = totalHeat % 9;
  }

  return {
    baseHeat,
    killingModifier,
    districtModifier,
    totalAddedHeat,
    newHeat,
    newWantedLevel: newWanted,
    wantedLevelRolledOver: newWanted > currentWanted
  };
}

export interface EntanglementRollResult {
  dice: number[];
  chosenDie: number;
  bracket: '1-3' | '4-5' | '6';
  entanglement: EntanglementInfo;
}

export function rollEntanglement(wantedLevel: number): EntanglementRollResult {
  const isZeroDice = wantedLevel <= 0;
  const diceCount = isZeroDice ? 2 : wantedLevel;
  const dice = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);

  const chosenDie = isZeroDice ? Math.min(...dice) : Math.max(...dice);

  const tierKey: 'low' | 'medium' | 'high' =
    wantedLevel <= 1 ? 'low' : wantedLevel <= 3 ? 'medium' : 'high';

  let bracket: '1-3' | '4-5' | '6' = '1-3';
  if (chosenDie >= 6) {
    bracket = '6';
  } else if (chosenDie >= 4) {
    bracket = '4-5';
  } else {
    bracket = '1-3';
  }

  const entanglement = ENTANGLEMENTS_TABLE[tierKey][bracket];

  return {
    dice,
    chosenDie,
    bracket,
    entanglement
  };
}

export interface ViceRollResult {
  dice: number[];
  chosenDie: number;
  clearedStress: number;
  newStress: number;
  overindulged: boolean;
}

export function resolveViceRoll(
  lowestAttrRating: number,
  currentStress: number
): ViceRollResult {
  const isZeroDice = lowestAttrRating <= 0;
  const diceCount = isZeroDice ? 2 : lowestAttrRating;
  const dice = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);

  const chosenDie = isZeroDice ? Math.min(...dice) : Math.max(...dice);
  const overindulged = chosenDie > currentStress;
  // RAW p. 156: You clear all your stress, but you overindulge
  const clearedStress = currentStress;
  const newStress = overindulged ? 0 : Math.max(0, currentStress - chosenDie);

  return {
    dice,
    chosenDie,
    clearedStress: overindulged ? currentStress : Math.min(currentStress, chosenDie),
    newStress,
    overindulged
  };
}

export interface AcquireAssetRollResult {
  dice: number[];
  chosenDie: number;
  isZeroDice: boolean;
  isCritical: boolean;
  baseQuality: number;
  bonusCoin: number;
  finalQuality: number;
  narrative: string;
}

export function resolveAcquireAssetRoll(
  crewTier: number,
  bonusCoin: number = 0
): AcquireAssetRollResult {
  const isZeroDice = crewTier <= 0;
  const diceCount = isZeroDice ? 2 : crewTier;
  const dice = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
  const sixCount = dice.filter((d) => d === 6).length;
  const isCritical = !isZeroDice && sixCount >= 2;
  const chosenDie = isZeroDice ? Math.min(...dice) : Math.max(...dice);

  let baseQuality = crewTier;
  if (isCritical) {
    baseQuality = crewTier + 2;
  } else if (chosenDie === 6) {
    baseQuality = crewTier + 1;
  } else if (chosenDie >= 4) {
    baseQuality = crewTier;
  } else {
    baseQuality = Math.max(0, crewTier - 1);
  }

  const finalQuality = baseQuality + bonusCoin;

  let narrative = '';
  if (isCritical) {
    narrative = `Critical Success! Acquired exceptional Tier ${finalQuality} asset (+2 above crew tier).`;
  } else if (chosenDie === 6) {
    narrative = `Full Success! Acquired fine Tier ${finalQuality} asset (+1 above crew tier).`;
  } else if (chosenDie >= 4) {
    narrative = `Standard Success! Acquired standard Tier ${finalQuality} asset matching crew tier.`;
  } else {
    narrative = `Bad Outcome! Acquired inferior Tier ${finalQuality} asset (Tier - 1).`;
  }

  if (bonusCoin > 0) {
    narrative += ` (${bonusCoin} coin spent boosted quality to Tier ${finalQuality}).`;
  }

  return {
    dice,
    chosenDie,
    isZeroDice,
    isCritical,
    baseQuality,
    bonusCoin,
    finalQuality,
    narrative
  };
}

export interface LongTermProjectRollResult {
  dice: number[];
  chosenDie: number;
  isZeroDice: boolean;
  isCritical: boolean;
  ticks: number;
  narrative: string;
}

export function resolveLongTermProjectRoll(dicePool: number): LongTermProjectRollResult {
  const isZeroDice = dicePool <= 0;
  const diceCount = isZeroDice ? 2 : dicePool;
  const dice = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
  const sixCount = dice.filter((d) => d === 6).length;
  const isCritical = !isZeroDice && sixCount >= 2;
  const chosenDie = isZeroDice ? Math.min(...dice) : Math.max(...dice);

  let ticks = 1;
  let narrative = '';

  if (isCritical) {
    ticks = 5;
    narrative = 'Critical Breakthrough! +5 ticks marked on project clock.';
  } else if (chosenDie === 6) {
    ticks = 3;
    narrative = 'Great Progress! +3 ticks marked on project clock.';
  } else if (chosenDie >= 4) {
    ticks = 2;
    narrative = 'Standard Progress: +2 ticks marked on project clock.';
  } else {
    ticks = 1;
    narrative = 'Slow Progress: +1 tick marked on project clock.';
  }

  return {
    dice,
    chosenDie,
    isZeroDice,
    isCritical,
    ticks,
    narrative
  };
}

export function resolveReduceHeatRoll(dicePool: number): {
  dice: number[];
  chosenDie: number;
  heatCleared: number;
} {
  const isZero = dicePool <= 0;
  const count = isZero ? 2 : dicePool;
  const dice = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
  const chosenDie = isZero ? Math.min(...dice) : Math.max(...dice);
  const sixCount = dice.filter((d) => d === 6).length;

  let heatCleared = 1;
  if (sixCount >= 2) {
    heatCleared = 5;
  } else if (chosenDie === 6) {
    heatCleared = 3;
  } else if (chosenDie >= 4) {
    heatCleared = 2;
  } else {
    heatCleared = 1;
  }

  return {
    dice,
    chosenDie,
    heatCleared
  };
}

export function cascadeHarmReduction(harm: HarmState): HarmState {
  // Cascading harm reduction (Blades RAW p. 155):
  // 1. All level 1 harm is completely cleared.
  // 2. All level 2 harm is downgraded to level 1.
  // 3. Level 3 harm is downgraded to level 2.
  return {
    level1: [harm.level2[0] || '', harm.level2[1] || ''],
    level2: [harm.level3 || '', ''],
    level3: ''
  };
}

export interface RecoveryRollResult {
  dice: number[];
  chosenDie: number;
  ticks: number;
  isCritical: boolean;
  isZeroDice: boolean;
}

export function resolveRecoveryRoll(dicePool: number): RecoveryRollResult {
  const isZero = dicePool <= 0;
  const count = isZero ? 2 : dicePool;
  const dice = Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
  const sixCount = dice.filter((d) => d === 6).length;
  const isCritical = !isZero && sixCount >= 2;
  const chosenDie = isZero ? Math.min(...dice) : Math.max(...dice);

  let ticks = 1;
  if (isCritical) {
    ticks = 5; // RAW p. 155: Critical recovery gives 5 ticks (fills 4 and carries over 1)
  } else if (chosenDie === 6) {
    ticks = 3;
  } else if (chosenDie >= 4) {
    ticks = 2;
  } else {
    ticks = 1;
  }

  return {
    dice,
    chosenDie,
    ticks,
    isCritical,
    isZeroDice: isZero
  };
}

export interface RecoveryAdvanceResult {
  newClock: number;
  newHarm: HarmState;
  harmReduced: boolean;
}

export function advanceHealingClock(
  currentClock: number,
  ticks: number,
  currentHarm: HarmState
): RecoveryAdvanceResult {
  const totalTicks = currentClock + ticks;
  if (totalTicks >= 4) {
    const newHarm = cascadeHarmReduction(currentHarm);
    // If all harm is now clear, clock resets to 0. Otherwise remainder carries over.
    const hasRemainingHarm = Boolean(
      newHarm.level1[0] || newHarm.level1[1] || newHarm.level2[0] || newHarm.level2[1] || newHarm.level3
    );
    const newClock = hasRemainingHarm ? totalTicks % 4 : 0;
    return {
      newClock,
      newHarm,
      harmReduced: true
    };
  }

  return {
    newClock: totalTicks,
    newHarm: currentHarm,
    harmReduced: false
  };
}
